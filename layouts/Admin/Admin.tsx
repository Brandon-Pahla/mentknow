import clsx from "clsx";
import { ComponentProps } from "react";
import { AdminFooter, AdminHeader   } from "../../components/Admin";
import styles from "./Admin.module.css";

export function AdminLayout({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={clsx(className, styles.layout)} {...props}>
      <AdminHeader />
      <main>{children}</main>
      <AdminFooter className={styles.footer} />
    </div>
  );
}
