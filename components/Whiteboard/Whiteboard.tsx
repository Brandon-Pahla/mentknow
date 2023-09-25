import clsx from "clsx";
import { BsDownload } from "react-icons/bs";
import { GrCluster, GrDownload } from "react-icons/gr";
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
import { PlusIcon, RedoIcon, UndoIcon, CategoriesIcon, LinkIcon } from "../../icons";
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
import Resources from "./Resource";
import { admins } from "../../data/users";
// import puppeteer from "puppeteer";

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
  // AS MAP: NOT used
  const notes = useStorage((root) => root.notes);
  const categories = useStorage((root) => root.categories);

  // An array of every note object
  const noteObjects: any[] = useStorage(
    (root) => Array.from(root.notes.values()),
    shallow
  );
  // An array of every category object
  const categoryObjects: any[] = useStorage(
    (root) => Array.from(root.categories?.values() ?? []),
    shallow
  );
  // console.log("Notes:", noteObjects)
  // console.log("Categories:", categoryObjects)

  const handleGeneratePdf = async () => {
    try {
      // Call the generatePDF function and pass noteArray and categoryArray

      await generatePDF(noteObjects, categoryObjects);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

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
  const noteTags: string[] = useStorage((root) => {
    const uniqueTags = new Set<string>();
    noteIds.forEach((id) => {
      let note = root.notes.get(id);
      if (note) {
        uniqueTags.add(note.tag);
      }
    });
    return Array.from(uniqueTags);
  });

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
      tag: "",
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
  const handleCategoryUpdate = useMutation(
    ({ storage, self }, categoryId, updates) => {
      if (self.isReadOnly) {
        return;
      }

      const category = storage.get("categories").get(categoryId);
      if (category) {
        category.update(updates);
      }
    },
    []
  );

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
  }, []);

  const handleClustering = useMutation(({ storage }) => {
    for (var noteId of noteIds) {
      let note = storage.get("notes").get(noteId);
      if (note) {
        let offSet = noteTags.indexOf(note.get("tag"));
        let new_x_coord = DIVIDERATIO * offSet;
        handleNoteUpdate(noteId, { x: new_x_coord });
      }
    }
  }, []);

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
    handleNoteUpdate(noteId, {
      title: e.target.value,
      selectedBy: currentUser,
    });
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

  //When note tag is change, update the text and selected user on the liveObject
  function handleCategoryTagChange(
    e: ChangeEvent<HTMLTextAreaElement>,
    categoryId: string
  ) {
    handleCategoryUpdate(categoryId, {
      tag: e.target.value,
      selectedBy: currentUser,
    });
  }

  // When category title is changed, update the text and selected user on the LiveObject
  function handleCategoryTitleChange(
    e: ChangeEvent<HTMLTextAreaElement>,
    categoryId: string
  ) {
    handleCategoryUpdate(categoryId, {
      title: e.target.value,
      selectedBy: currentUser,
    });
  }

  interface FormData {
    title: string;
    category: string;
  }

  const { data: session } = useSession();

  let isAdmin = false;
  if (session) {
    const userInf = session.user.info;
    isAdmin = admins.includes(userInf.id);
  }

  return (
    <div
      className={clsx(className, styles.canvas, "flex")}
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
            onTagChange={(e) => handleCategoryTagChange(e, id)}
          // onFocus={(e) => handleNoteFocus(e, id)}
          // onPointerDown={(e) => handleNotePointerDown(e, id)}
          />
        ))
      }

      <h3 className={styles.title}>You can only add/extract notes using this device.</h3>

      {!isReadOnly && (
        <div className={styles.toolbar}>
          {isAdmin && (
            <Tooltip content="Add category" sideOffset={16} side="right">
            <Button
              className={styles.button}
              icon={<CategoriesIcon />}
              onClick={insertCategory}
              variant="subtle"
            />
          </Tooltip>
          )}
          <Tooltip content="Add note" sideOffset={16} side="right">
            <Button className={styles.button} icon={<PlusIcon />} onClick={insertNote} variant="subtle" />
          </Tooltip>
          <Tooltip content="Undo" sideOffset={16} side="right">
            <Button
              className={styles.button}
              disabled={!canUndo}
              icon={<UndoIcon />}
              onClick={history.undo}
              variant="subtle"
            />
          </Tooltip>
          <Tooltip content="Redo" sideOffset={16} side="right">
            <Button
              className={styles.button}
              disabled={!canRedo}
              icon={<RedoIcon />}
              onClick={history.redo}
              variant="subtle"
            />
          </Tooltip>
          {isAdmin && (
            <Tooltip content="Cluster notes" sideOffset={16} side="right">
            <Button
              className={styles.button}
              icon={<GrCluster />}
              onClick={handleClustering}
              variant="subtle"
            />
          </Tooltip>
          )}
          <Tooltip content="Download Notes" sideOffset={16} side="right">
            <Button
              className={styles.button}
              icon={<GrDownload />}
              onClick={handleGeneratePdf}
              variant="subtle"
            />
          </Tooltip>
        </div>
      )}
      <Chat currentUser={currentUser} />
      <Resources/>
    </div>
  );
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function getRandomColor(): string {
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
    "#ff7eb9",
    "#ff65a3",
    "#7afcff",
    "#feff9c",
    "#fff740",
  ];
  const randomColor = colors[getRandomInt(colors.length)];

  return randomColor;
}

// Keep track of used colors
const usedColors = new Set();

// Get a random unused color
function getRandomCategoryColor() {
  // Filter unused colors
  const availableColors = colors.filter((color) => !usedColors.has(color));

  // Pick random color
  const color =
    availableColors[Math.floor(Math.random() * availableColors.length)];

  // Mark color as used
  usedColors.add(color);

  return color;
}

type CategoryInfo = {
  id: string;
  dimensions: DOMRect;
};

export async function generatePDF(noteArray: any[], categoryArray: any[]) {
  // Create a string to represent the text content
  let textContent = 'MENTKNOW Board Notes\n\n';

  // Loop through categoryArray and noteArray to generate content
  for (const category of categoryArray) {
    textContent += `#${category.tag} ${category.title}:\n`;

    // Filter notes that have the same tag as the category
    const matchingNotes = noteArray.filter((note) => note.tag === category.tag);

    // Append matching notes to the text content
    for (const note of matchingNotes) {
      textContent += `- Tag: ${note.tag}\n  Title: ${note.title}\n  Text: ${note.text}\n\n`;
    }
  }

  // Create a Blob with the text content
  const textBlob = new Blob([textContent], { type: 'text/plain' });

  // Create a Blob URL for the text blob
  const textUrl = URL.createObjectURL(textBlob);

  // Create an anchor element to trigger the download
  const a = document.createElement('a');
  a.href = textUrl;

  // Set the anchor's attributes for downloading
  a.download = 'MENTKNOW - Board Notes.txt'; // Specify the desired file name
  a.target = '_blank'; // Open in a new tab/window if needed

  // Programmatically click the anchor to trigger the download
  a.click();

  // Revoke the Blob URL to release resources
  URL.revokeObjectURL(textUrl);
}

// FUnction to generate a PDF file:
// export async function generatePDF(noteArray: any[], categoryArray: any[]) {
//   // Fetch PDF blob
//   // const res = await fetch('/api/generate-pdf');
//   // Create an object that includes both arrays
//   const requestData = {
//     noteArray,
//     categoryArray,
//   };

//   // Serialize the object to JSON
//   const requestDataJson = JSON.stringify(requestData);

//   // Fetch PDF blob
//   const res = await fetch('/api/generate-pdf', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: requestDataJson, // Send the data as JSON in the request body
//   });
//   const pdfBlob = await res.blob();

//   // Create a Blob URL for the PDF blob
//   const pdfUrl = URL.createObjectURL(pdfBlob);

//   // Create an anchor element to trigger the download
//   const a = document.createElement('a');
//   a.href = pdfUrl;

//   // Set the anchor's attributes for downloading
//   a.download = 'MENTKNOW - Board Noted.pdf'; // Specify the desired file name
//   a.target = '_blank'; // Open in a new tab/window if needed

//   // Programmatically click the anchor to trigger the download
//   a.click();

//   // Revoke the Blob URL to release resources
//   URL.revokeObjectURL(pdfUrl);
// }

