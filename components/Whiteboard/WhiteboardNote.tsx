import clsx from "clsx";
import {
  ChangeEventHandler,
  ComponentProps,
  FocusEventHandler,
  KeyboardEvent,
  PointerEventHandler,
  memo,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { CrossIcon } from "../../icons";
import { useStorage } from "../../liveblocks.config";
import { Avatar } from "../../primitives/Avatar";
import { Button } from "../../primitives/Button";
import styles from "./WhiteboardNote.module.css";
import { shallow } from "@liveblocks/client";

interface Props
  extends Omit<
    ComponentProps<"div">,
    "id" | "onBlur" | "onChange" | "onFocus"
  > {
  dragged: boolean;
  id: string;
  onBlur: FocusEventHandler<HTMLTextAreaElement>;
  onTagChange: ChangeEventHandler<HTMLTextAreaElement>;
  onTitleChange: ChangeEventHandler<HTMLTextAreaElement>;
  onTextChange: ChangeEventHandler<HTMLTextAreaElement>;
  onDelete: () => void;
  onFocus: FocusEventHandler<HTMLTextAreaElement>;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
}

// Define an initial state for the note tag
const initialNoteTag = '';

// Define a type for the note tag action
type NoteTagAction =
  | { type: 'SET_NOTE_TAG', payload: string }
  | { type: 'FORCE_RERENDER' }

function noteTagReducer(state: any, action: NoteTagAction): string {

  switch (action.type) {

    case 'SET_NOTE_TAG':
      return action.payload;

    case 'FORCE_RERENDER':
      return { ...state }; // return updated object to force rerender

    default:
      return state;
  }
}

export const WhiteboardNote = memo(
  ({
    id,
    dragged,
    onPointerDown,
    onDelete,
    onTagChange,
    onTitleChange,
    onTextChange,
    onFocus,
    onBlur,
    style,
    className,
    ...props
  }: Props) => {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const titleAreaRef = useRef<HTMLTextAreaElement>(null);
    const tagAreaRef = useRef<HTMLTextAreaElement>(null);

    const note = useStorage((root) => root.notes.get(id));


    const handleDoubleClick = useCallback(() => {
      textAreaRef.current?.focus();
      titleAreaRef.current?.focus();
    }, []);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Escape") {
          textAreaRef.current?.blur();
        }
      },
      []
    );

    const handleEnterKeyPress = useCallback(
      (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Escape") {
          titleAreaRef.current?.blur();
          tagAreaRef.current?.blur();
        }

        if (event.key === "Enter") {
          event.preventDefault();
          if (event.target === titleAreaRef.current) {
            textAreaRef.current?.focus();
          } else if (event.target === tagAreaRef.current) {
            titleAreaRef.current?.focus();
          }
        }
      },
      []
    );

    if (!note) {
      return null;
    }

    const { x, y, tag, title, text, color, selectedBy } = note;

    function getCategoryDimensionsAndPosition(elementId: string): { dimensions: DOMRect; position: { x: number; y: number } } | null {
      const element = document.getElementById(elementId);

      if (element) {
        const dimensions = element.getBoundingClientRect();
        const position = {
          x: dimensions.left,
          y: dimensions.top,
        };

        return { dimensions, position };
      }

      return null;
    }

    function getNoteCenter(noteElementId: string): { x: number; y: number } | null {
      const noteElement = document.getElementById(noteElementId);

      if (noteElement) {
        const noteRect = noteElement.getBoundingClientRect();

        const noteCenter = {
          x: noteRect.left + noteRect.width / 2,
          y: noteRect.top + noteRect.height / 2,
        };

        return noteCenter;
      }

      return null;
    }
    // Initialize state for the note's tag
    const [noteTag, setNoteTag] = useState(note.tag);

    // An array of every category id
    const categoryIds: string[] = useStorage(
      (root) => Array.from(root.categories?.keys() ?? []),
      shallow
    );
    // An array of every category object
    const categoryObjects: any[] = useStorage(
      (root) => Array.from(root.categories?.values() ?? []),
      shallow
    );

    // Create a ref to store the current tag
    const currentTagRef = useRef<string>(note.tag);

    // Initialize the note tag state using useReducer
    // const [noteTag, dispatch] = useReducer(noteTagReducer, note.tag);

    // const [dragging, setDragging] = useState(false); 

    useEffect(() => {
      // Update the ref when the tag changes
      currentTagRef.current = noteTag;
    }, [noteTag]);

    useEffect(() => {
      const handleOverlap = () => {
        if (dragged) {
          const noteCenter = getNoteCenter(id);

          if (noteCenter) {
            for (const categoryId of categoryIds) {
              const categoryInfo = getCategoryDimensionsAndPosition(categoryId);

              if (categoryInfo) {
                const { dimensions, position } = categoryInfo;
                const { x, y } = position;
                const { width, height } = dimensions;

                if (
                  noteCenter.x >= x &&
                  noteCenter.x <= x + width &&
                  noteCenter.y >= y &&
                  noteCenter.y <= y + height
                ) {
                  // Note overlaps with this category
                  // Find the category object based on its ID
                  const overlappingCategory = categoryObjects.find(
                    (category) => category.id === categoryId
                  );

                  if (overlappingCategory) {

                    // Update tag in state
                    // dispatch({ type: 'SET_NOTE_TAG', payload: overlappingCategory.tag })
                    // Update the tag ref immediately
                    currentTagRef.current = overlappingCategory.tag;

                    setNoteTag(overlappingCategory.tag);

                    

                    // Dispatch an action to set the note's tag to the category's tag
                    // dispatch({ type: 'SET_NOTE_TAG', payload: overlappingCategory.tag });
                  }
                }
              }
            }
          }
        }
      };

      handleOverlap();
    }, [id, dragged, categoryIds, categoryObjects]);

    useEffect(() => {
      if (dragged) {
        // Trigger a re-render when the note is dragged to update the displayed tag
        setNoteTag(currentTagRef.current || ''); // Update the tag with the ref value
      }
    }, [dragged]);

    return (
      <div
        id={id}
        className={clsx(className, "notelement", styles.container)}
        data-note={id}
        onDoubleClick={handleDoubleClick}
        onClick={() => onTagChange}
        onContextMenu={onDelete}
        onPointerDown={onPointerDown}
        style={{
          transform: `translate(${x}px, ${y}px)`,
          transition: dragged ? "none" : undefined,
          zIndex: dragged ? 2 : 1,
          cursor: dragged ? "grabbing" : "grab",
          ...style,
        }}
        {...props}
      >
        <div
          className={styles.note}
          style={{
            backgroundColor: color,
            ...style,
          }}
        >
          <div className={styles.header}>
            {/* <Button
              className={styles.deleteButton}
              icon={<CrossIcon />}
              onClick={onDelete}
              variant="subtle"
            /> */}
            <div>
              {/* <div
            className="
                leading-6 max-h-8 overflow-hidden w-full whitespace-pre-wrap break-words
                invisible relative
              "
          >
            {noteTag + " "}
          </div> */}
              <textarea
                className="
                  bg-transparent max-h-24	leading-6 shadow-none border-0 whitespace-nowrap
                  outline-none resize-none text-base font-light block break-word justify-center
                "
                onBlur={onBlur}
                onChange={onTagChange}
                onFocus={onFocus}
                onKeyDown={handleEnterKeyPress}
                onPointerDown={(e) => e.stopPropagation()}
                placeholder=""
                ref={tagAreaRef}
                rows={1}
                value={noteTag.charAt(0)}
                // readOnly
              />
            </div>
            <div className={styles.presence}>
              {selectedBy ? (
                <Avatar
                  color={selectedBy.color}
                  name={selectedBy.name}
                  outline
                  src={selectedBy.avatar}
                />
              ) : null}
            </div>
          </div>
          <div>
            <div className={styles.textAreaSize}>{title + " "}</div>
            <textarea
              className={styles.title}
              onBlur={onBlur}
              onChange={onTitleChange}
              onFocus={onFocus}
              onKeyDown={handleEnterKeyPress}
              onPointerDown={(e) => e.stopPropagation()}
              placeholder="Title..."
              rows={1}
              ref={titleAreaRef}
              value={title}
            />
          </div>
          <div className={styles.content}>
            <div className={styles.textAreaSize}>{text + " "}</div>
            <textarea
              className={styles.textArea}
              onBlur={onBlur}
              onChange={onTextChange}
              onFocus={onFocus}
              onKeyDown={handleKeyDown}
              onPointerDown={(e) => e.stopPropagation()}
              placeholder="Write note…"
              ref={textAreaRef}
              value={text}
            />
          </div>
        </div>
      </div>
    );
  }
);
