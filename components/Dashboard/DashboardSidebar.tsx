import clsx from "clsx";
import { useRouter } from "next/router";
import { ComponentProps, useEffect, useMemo, useState } from "react";
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
import { admins } from "../../data/users";
import { useSession } from "next-auth/react";

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

  // const [isAdminUser, setIsAdminUser] = useState(false);

  const { data: session } = useSession();

  let isAdmin = false;
  if (session) {
    const userInf = session.user.info;
    isAdmin = admins.includes(userInf.id);
  }

  console.log(session)

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
          { isAdmin && (<ul className={styles.list}>
            <li>
              <SidebarLink href={ADMIN_URL} icon={<CategoriesIcon />}>
                Analytics
              </SidebarLink>
            </li>
          </ul>)}
        </div>
      </nav>
    </div>
  );
}
