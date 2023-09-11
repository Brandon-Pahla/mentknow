import clsx from "clsx";
import { BsDownload } from "react-icons/bs"
import { GrCluster } from "react-icons/gr"
import { LiveObject, shallow } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";
import { nanoid } from "nanoid";
import {
  ChangeEvent,
  ComponentProps,
  FocusEvent,
  PointerEvent,
  useRef,
  useState,
} from "react";
import { PlusIcon, RedoIcon, UndoIcon, CategoriesIcon } from "../../icons";
import { useSession } from "next-auth/react";
import {
  UserMeta,
  useCanRedo,
  useCanUndo,
  useHistory,
  useMutation,
  useSelf,
  useStorage,
} from "../../liveblocks.config";
import { Button } from "../../primitives/Button";
import { Spinner } from "../../primitives/Spinner";
import { Tooltip } from "../../primitives/Tooltip";
import { useBoundingClientRectRef } from "../../utils";
import { Cursors } from "../Cursors";
import { Chat } from "../Chat";
import { WhiteboardNote } from "./WhiteboardNote";
import { WhiteboardCategory } from "./WhiteboardCategory";
import styles from "./Whiteboard.module.css";
import { PopupForm } from "./PopupForm";
import { colors } from "../../data/colors";


const DIVIDERATIO: number = 390;
interface Props extends ComponentProps<"div"> {
  currentUser: UserMeta["info"] | null;
}

/**
 * This file shows how to create a multiplayer canvas with draggable notes.
 * The notes allow you to add text, display who's currently editing them, and can be removed.
 * There's also a toolbar allowing you to undo/redo your actions and add more notes.
 */

export function Whiteboard() {



  const { data: session } = useSession();



  const loading = (
    <div className={styles.loading}>
      <Spinner size={24} />
    </div>
  );

  return (
    <ClientSideSuspense fallback={loading}>
      {() => <Canvas currentUser={session?.user.info ?? null} />}
    </ClientSideSuspense>
  );
}

// The main Liveblocks code, handling all events and note modifications
function Canvas({ currentUser, className, style, ...props }: Props) {

  
  
  const categories = useStorage(root => root.categories);
  console.log(categories)

  // An array of every note id
  const noteIds: string[] = useStorage(
    (root) => Array.from(root.notes.keys()),
    shallow
  );

  // An array of every category id
  const categoryIds: string[] = useStorage(
    (root) => Array.from(root.categories?.keys() ?? []), 
    shallow
  );

  // Keep track of the unique tags we have
  const noteTags: string[] = useStorage(
    (root) => {
      const uniqueTags = new Set<string>();
      noteIds.forEach((id) => {
        let note = root.notes.get(id);
        if (note) {
          uniqueTags.add(note.tag);
        }
      });
      return Array.from(uniqueTags);
    }
  );
  

  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const canvasRef = useRef(null);
  const rectRef = useBoundingClientRectRef(canvasRef);

  const isReadOnly = useSelf((me) => me.isReadOnly);

  // Info about element being dragged
  const [isDragging, setIsDragging] = useState(false);
  const dragInfo = useRef<{
    element: Element;
    noteId: string;
    offset: { x: number; y: number };
  } | null>();

  // Insert a new note onto the canvas
  const insertNote = useMutation(({ storage, self }) => {
    if (self.isReadOnly) {
      return;
    }

    const noteId = nanoid();
    const note = new LiveObject({
      x: getRandomInt(300),
      y: getRandomInt(300),
      tag: "",
      title: "",
      text: "",
      color: getRandomColor(),
      selectedBy: null,
      id: noteId,
    });
    storage.get("notes").set(noteId, note);
  }, []);

  // Insert a new category onto the canvas
  const insertCategory = useMutation(({ storage, self }) => {
    if (self.isReadOnly) {
      return;
    }

    const categoryId = nanoid();
    const category = new LiveObject({
      x: getRandomInt(300),
      y: getRandomInt(300),
      title: "",
      color: getRandomCategoryColor(),
      selectedBy: null,
      id: categoryId,
    });
    storage.get("categories").set(categoryId, category);
  }, []);

  // Delete a note
  const handleNoteDelete = useMutation(({ storage, self }, noteId) => {
    if (self.isReadOnly) {
      return;
    }

    storage.get("notes").delete(noteId);
  }, []);

  const handleCategoryDelete = useMutation(({ storage, self }, categoryId) => {
    if (self.isReadOnly) {
      return;
    }

    storage.get("categories").delete(categoryId);
  }, []);

  // Update a note, if it exists
  const handleCategoryUpdate = useMutation(({ storage, self }, categoryId, updates) => {
    if (self.isReadOnly) {
      return;
    }

    const category = storage.get("categories").get(categoryId);
    if (category) {
      category.update(updates);
    }
  }, []);

  // Update a note, if it exists
  const handleNoteUpdate = useMutation(({ storage, self }, noteId, updates) => {
    if (self.isReadOnly) {
      return;
    }

    const note = storage.get("notes").get(noteId);
    if (note) {
      note.update(updates);
    }
  }, []);


  // Extract All Notes, that exist in this whiteboard.
  //TODO: I do not believe useMutation is the right hook to use here, I will update this code later on.
  const extractNotes = useMutation(({ storage, self }) => {
    if (!self.canWrite) {
      console.log("Failed to extract data");
      return;
    }

    noteIds.forEach((noteId) => {
      const note = storage.get("notes").get(noteId);
      if (note) {
        const title = note.get("title");
        const text = note.get("text");
        const tag = note.get("tag");
        console.log(title);
        console.log(text);
        console.log(tag);
        console.log("+++++++++++");
      }
    });

  }, [])

  const handleClustering = useMutation( ({ storage }) => {
    for ( var noteId of noteIds ) {
      let note = storage.get("notes").get(noteId);
      if ( note ) {
        let offSet = noteTags.indexOf(note.get("tag"));
        let new_x_coord = DIVIDERATIO*offSet;
        handleNoteUpdate(noteId, { x: new_x_coord });
      }
    }
  }, [])

  // On note pointer down, pause history, set dragged note
  function handleNotePointerDown(
    e: PointerEvent<HTMLDivElement>,
    noteId: string
  ) {
    history.pause();
    e.stopPropagation();
    const element = document.querySelector(`[data-note="${noteId}"]`);
    if (!element) {
      return;
    }

    // Get position of cursor on note, to use as an offset when moving notes
    const rect = element.getBoundingClientRect();
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    dragInfo.current = { noteId, element, offset };
    setIsDragging(true);
    document.documentElement.classList.add("grabbing");
  }

  // On canvas pointer up, remove dragged element, resume history
  function handleCanvasPointerUp() {
    setIsDragging(false);
    dragInfo.current = null;
    document.documentElement.classList.remove("grabbing");
    history.resume();
  }

  // If dragging on canvas pointer move, move element and adjust for offset
  function handleCanvasPointerMove(e: PointerEvent<HTMLDivElement>) {
    e.preventDefault();

    if (isDragging && dragInfo.current) {
      const { x, y } = dragInfo.current.offset;
      const coords = {
        x: e.clientX - rectRef.current.x - x,
        y: e.clientY - rectRef.current.y - y,
      };
      handleNoteUpdate(dragInfo.current.noteId, coords);
    }
  }

  //When note tag is change, update the text and selected user on the liveObject
  function handleNoteTagChange(
    e: ChangeEvent<HTMLTextAreaElement>,
    noteId: string
  ) {
    handleNoteUpdate(noteId, { tag: e.target.value, selectedBy: currentUser });
  }

  // When note title is changed, update the text and selected user on the LiveObject
  function handleNoteTitleChange(
    e: ChangeEvent<HTMLTextAreaElement>,
    noteId: string
  ) {
    handleNoteUpdate(noteId, { title: e.target.value, selectedBy: currentUser });
  }

  // When note text is changed, update the text and selected user on the LiveObject
  function handleNoteTextChange(
    e: ChangeEvent<HTMLTextAreaElement>,
    noteId: string
  ) {
    handleNoteUpdate(noteId, { text: e.target.value, selectedBy: currentUser });
  }

  // When note is focused, update the selected user LiveObject
  function handleNoteFocus(e: FocusEvent<HTMLTextAreaElement>, noteId: string) {
    history.pause();
    handleNoteUpdate(noteId, { selectedBy: currentUser });
  }

  // When note is unfocused, remove the selected user on the LiveObject
  function handleNoteBlur(e: FocusEvent<HTMLTextAreaElement>, noteId: string) {
    handleNoteUpdate(noteId, { selectedBy: null });
    history.resume();
  }

  // When category title is changed, update the text and selected user on the LiveObject
  function handleCategoryTitleChange(
    e: ChangeEvent<HTMLTextAreaElement>,
    categoryId: string
  ) {
    handleCategoryUpdate(categoryId, { title: e.target.value, selectedBy: currentUser });
  }

  interface FormData {
    title: string;
    category: string;
  }


  const notes = useStorage((root) => root.notes);

  // console.log("Notes:", notes)

  return (


    <div
      className={clsx(className, styles.canvas, 'flex')}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      ref={canvasRef}
      style={{ pointerEvents: isReadOnly ? "none" : undefined, ...style }}
      {...props}
    >
      <Cursors element={canvasRef} />
      {
        /*
         * Iterate through each note in the LiveMap and render it as a note
         */
        noteIds.map((id) => (
          <WhiteboardNote
            dragged={id === dragInfo?.current?.noteId}
            id={id}
            key={id}
            onBlur={(e) => handleNoteBlur(e, id)}
            onTagChange={(e) => handleNoteTagChange(e, id)}
            onTitleChange={(e) => handleNoteTitleChange(e, id)}
            onTextChange={(e) => handleNoteTextChange(e, id)}
            onDelete={() => handleNoteDelete(id)}
            onFocus={(e) => handleNoteFocus(e, id)}
            onPointerDown={(e) => handleNotePointerDown(e, id)}
          />
        ))
      }
      {
        /*
         * Iterate through each note in the LiveMap and render it as a note
         */
        categoryIds.map((id) => (
          <WhiteboardCategory
            id={id}
            key={id}
            onTitleChange={(e) => handleCategoryTitleChange(e, id)}
            onDelete={() => handleCategoryDelete(id)}
            // onFocus={(e) => handleNoteFocus(e, id)}
            // onPointerDown={(e) => handleNotePointerDown(e, id)}
          />
        ))
      }

      {!isReadOnly && (
        <div className={styles.toolbar}>
          <Tooltip content="Add category" sideOffset={16} side="right">
            <Button icon={<CategoriesIcon />} onClick={insertCategory} variant="subtle" />
          </Tooltip>
          <Tooltip content="Add note" sideOffset={16} side="right">
            <Button icon={<PlusIcon />} onClick={insertNote} variant="subtle" />
          </Tooltip>
          <Tooltip content="Undo" sideOffset={16} side="right">
            <Button
              disabled={!canUndo}
              icon={<UndoIcon />}
              onClick={history.undo}
              variant="subtle"
            />
          </Tooltip>
          <Tooltip content="Redo" sideOffset={16} side="right">
            <Button
              disabled={!canRedo}
              icon={<RedoIcon />}
              onClick={history.redo}
              variant="subtle"
            />
          </Tooltip>
          <Tooltip content="Cluster notes" sideOffset={16} side="right">
            <Button icon={<GrCluster />} onClick={handleClustering} variant="subtle"/>
          </Tooltip>
        </div>

      )}
      {/* {isFormVisible && <PopupForm onSubmit={handleSubmitNote} />} */}
      <Chat currentUser={currentUser} />
    </div>
  );
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function getRandomColor(): string {
  // const colors = ["#ff7eb9", "#ff65a3", "#7afcff", "#feff9c", "#fff740"];
  // const colors = [
  //   "#fff9c2",
  //   "#fffde7",
  //   "#fffabd",
  //   "#ffe8d6",
  //   "#ffdfab",
  //   "#ffecb3",
  //   "#e6ffed", 
  //   "#d9f2d6",
  //   "#deffe6",
  //   "#dbeffb",
  //   "#cfe2f3",
  //   "#becfe8",
  //   "#e6e6fa",
  //   "#f5ebf5",
  //   "#f6f0fd",
  
  //   // More colors
  //   "#ffd3b6", // pink
  //   "#f8bbd0", // light pink
  //   "#e1bee7", // purple
  //   "#c5cae9", // lavender
  //   "#bbdefb", // light blue
  //   "#b2ebf2", // sky blue 
  //   "#b2dfdb", // teal  
  //   "#c8e6c9", // light green
  //   "#dcedc8", // lime green
  //   "#fff59d", // pale yellow
  //   "#ffecb3", // lemon
  //   "#ffccbc", // peach
  // ];
  const colors = [
    "#fff9c2", // soft yellow
    "#ffecb3", // pale yellow
    "#ffd3b6", // pink
    "#f8bbd0", // light pink  
    "#c5cae9", // lavender
    "#e1bee7", // pale purple
    "#dcedc8", // lime green
    "#c8e6c9", // light green
    "#b2dfdb", // teal
    "#bbdefb", // light blue
    
    // New colors for black text
    "#f6f6f6", // light grey
    "#fff5e1", // cream
    "#f3e5f5", // rose
    "#e1f5fe", // sky blue
    "#e3fdfd", // pale cyan
    "#f0fdf4", // mint
    "#f1f8e9", // khaki

    // Origional colors
    "#ff7eb9", "#ff65a3", "#7afcff", "#feff9c", "#fff740"
  ];
  const randomColor = colors[getRandomInt(colors.length)];

  return randomColor;
}


// Array of possible colors
// const colors = ["pink", "blue", "green", "yellow", "purple"]; 

// Keep track of used colors
const usedColors = new Set();

// Get a random unused color
function getRandomCategoryColor() {

  // Filter unused colors
  const availableColors = colors.filter(color => !usedColors.has(color));

  // Pick random color
  const color = availableColors[Math.floor(Math.random() * availableColors.length)];

  // Mark color as used
  usedColors.add(color);

  return color;
}
