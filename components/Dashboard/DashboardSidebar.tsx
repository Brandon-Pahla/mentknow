import clsx from "clsx";
import { useRouter } from "next/router";
import { ComponentProps, useMemo } from "react";
import {
  DASHBOARD_DRAFTS_URL,
  DASHBOARD_GROUP_URL,
  DASHBOARD_URL,
  ADMIN_URL,
} from "../../constants";
import { CategoriesIcon, FileIcon, FolderIcon } from "../../icons";
import { LinkButton } from "../../primitives/Button";
import { Group } from "../../types";
import { normalizeTrailingSlash } from "../../utils";
import styles from "./DashboardSidebar.module.css";
import { isAdmin, updateAdminsDb, updateAdminsList } from "../../pages/api/database/admins";

interface Props extends ComponentProps<"div"> {
  groups: Group[];
}

interface SidebarLinkProps
  extends Omit<ComponentProps<typeof LinkButton>, "href"> {
  href: string;
}

function SidebarLink({
  href,
  children,
  className,
  ...props
}: SidebarLinkProps) {
  const router = useRouter();
  const isActive = useMemo(
    () =>
      normalizeTrailingSlash(router.asPath) === normalizeTrailingSlash(href),
    [router, href]
  );

  return (
    <LinkButton
      className={clsx(className, styles.sidebarLink)}
      data-active={isActive || undefined}
      href={href}
      variant="subtle"
      {...props}
    >
      {children}
    </LinkButton>
  );
}

export function DashboardSidebar({ className, groups, ...props }: Props) {

   // // An array of every note object
  // const noteObjects: any[] = useStorage(
  //   (root) => Array.from(root.notes.values()),
  //   shallow
  // );
  // // An array of every category object
  // const categoryObjects: any[] = useStorage(
  //   (root) => Array.from(root.categories?.values() ?? []),
  //   shallow
  // );

  return (
    <div className={clsx(className, styles.sidebar)} {...props}>
      <nav className={styles.navigation}>
        <div className={styles.category}>
          <ul className={styles.list}>
            <li>
              <SidebarLink href={DASHBOARD_URL} icon={<FileIcon />}>
                All
              </SidebarLink>
            </li>
          </ul>
        </div>
        <div className={styles.category}>
          {/* <span className={styles.categoryTitle}>Groups</span> */}
          <ul className={styles.list}>
            <li>
              <SidebarLink href={ADMIN_URL} icon={<CategoriesIcon />}>
                Analytics
              </SidebarLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
