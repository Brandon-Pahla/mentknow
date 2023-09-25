import { ComponentProps, forwardRef, ReactNode } from "react";
import clsx from "clsx";
import styles from "./Document.module.css";
import { useStorage } from "../../liveblocks.config";
import { shallow } from "@liveblocks/client";

interface Props extends ComponentProps<"div"> {
  header: ReactNode;
}

export const DocumentLayout = forwardRef<HTMLElement, Props>(
  ({ children, header, className, ...props }, ref) => {

     // // An array of every note object
  const noteObjects: any[] = useStorage(
    (root) => Array.from(root.notes.values()),
    shallow
  );
  // An array of every category object
  const categoryObjects: any[] = useStorage(
    (root) => Array.from(root.categories?.values() ?? []),
    shallow
  );
  console.log("CATEGORIES:", categoryObjects)
    return (
      <div className={clsx(className, styles.container)} {...props}>
        <header className={styles.header}>{header}</header>
        <main className={styles.main} ref={ref}>
          {children}
        </main>
      </div>
    );
  }
);
