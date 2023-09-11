import clsx from "clsx";
import {
  ChangeEventHandler,
  ComponentProps,
  FocusEvent,
  KeyboardEvent,
  PointerEvent,
  memo,
  useCallback,
  useRef,
} from "react";
import { CrossIcon } from "../../icons";
import { useStorage } from "../../liveblocks.config";
import { Avatar } from "../../primitives/Avatar";
import { getRandom } from "../../lib/server";

interface Props extends Omit<ComponentProps<"div">, "id" | "onBlur" | "onChange" | "onFocus"> {
  id: string;
  onTitleChange: ChangeEventHandler<HTMLTextAreaElement>;
  onTagChange: ChangeEventHandler<HTMLTextAreaElement>;
  onDelete: () => void;
}







export const WhiteboardCategory = memo(({ id, onPointerDown, onDelete, onTitleChange, onTagChange, style, className, ...props }: Props) => {
  const titleAreaRef = useRef<HTMLTextAreaElement>(null);
  const tagAreaRef = useRef<HTMLTextAreaElement>(null);
  const category = useStorage((root) => root.categories.get(id));

  const handleDoubleClick = useCallback(() => {
    titleAreaRef.current?.focus();
  }, []);

  const handleEnterKeyPress = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Escape") {
        titleAreaRef.current?.blur();
        tagAreaRef.current?.blur();
      }
    },
    []
  );

  if (!category) {
    return null;
  }

  const { x, y, title, tag, color, selectedBy } = category;


  // console.log("Color: ", color)

  return (
    <div
      className={clsx(className,"relative", "border-t-4", "flex flex-1", "bg-opacity-60", "bg-white", "p-2", "shadow-md", "cursor-default")}
      data-note={id}
      onDoubleClick={handleDoubleClick}
      onPointerDown={onPointerDown}
      
      style={{borderColor: color, left: 0, top: 0, zIndex: 0, ...style }}
      {...props}
    >
      <button
          className={clsx("absolute", "text-[12px]", "right-2", "rounded-md", "bg-gray-200", "hover:bg-grey-400", "focus:outline-none", "focus:bg-gray-400", "p-1")}
          onClick={onDelete}
        >
          Delete
        </button>
        <textarea
                className="
                  bg-transparent absolute max-h-24 w-8 right-14	leading-6 shadow-none border-0 whitespace-nowrap
                  outline-none resize-none text-base font-light block break-word justify-center
                "
                onChange={onTagChange}
                // onFocus={onFocus}
                onKeyDown={handleEnterKeyPress}
                onPointerDown={(e) => e.stopPropagation()}
                placeholder="Tag"
                ref={tagAreaRef}
                rows={1}
                value={tag}
        />
      <div className={clsx("w-3/4 max-w-4/5 font-semibold")}>
        <textarea
          className={clsx("bg-transparent outline-none resize-none text-wrap break-words w-full ")}
          onChange={onTitleChange}
          onKeyDown={handleEnterKeyPress}
          onPointerDown={(e) => e.stopPropagation()}
          placeholder="Category title..."
          ref={titleAreaRef}
          value={title}
        />
      </div>
    </div>
  );
});
