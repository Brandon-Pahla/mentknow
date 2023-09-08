import clsx from "clsx";
import {
  ChangeEventHandler,
  ComponentProps,
  FocusEventHandler,
  KeyboardEvent,
  PointerEventHandler,
  memo,
  useCallback,
  useRef,
} from "react";
import { CrossIcon } from "../../icons";
import { useStorage } from "../../liveblocks.config";
import { Avatar } from "../../primitives/Avatar";
import { Button } from "../../primitives/Button";
import styles from "./WhiteboardNote.module.css";

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

    return (
      <div
        className={clsx(className, styles.container)}
        data-note={id}
        onDoubleClick={handleDoubleClick}
        onPointerDown={onPointerDown}
        style={{
          transform: `translate(${x}px, ${y}px)`,
          transition: dragged ? "none" : undefined,
          zIndex: dragged ? 1 : 0,
          cursor: dragged ? "grabbing" : "grab",
          ...style,
        }}
        {...props}
      >
        <div className={styles.note}
        style={{
          backgroundColor: color,
          ...style,
        }}
        >
          <div className={styles.header}>
            <Button
              className={styles.deleteButton}
              icon={<CrossIcon />}
              onClick={onDelete}
              variant="subtle"
            />
            <div>
              <div className="
                leading-6 max-h-8 overflow-hidden w-full whitespace-pre-wrap break-words
                invisible relative
              ">
                {tag + " "}
              </div>
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
                placeholder="Tag"
                ref={tagAreaRef}
                rows={1}
                value={tag}
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
                // rows={1}
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
