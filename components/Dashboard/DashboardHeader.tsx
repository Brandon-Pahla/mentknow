import clsx from "clsx";
import Link from "next/link";
import { ComponentProps, MouseEventHandler } from "react";
import { CrossIcon, MenuIcon, PlusIcon, SignOutIcon } from "../../icons";
import { useSession } from "next-auth/react";
import { Avatar } from "../../primitives/Avatar";
import { Button } from "../../primitives/Button";
import { Popover } from "../../primitives/Popover";
import { Logo } from "../Logo";
import styles from "./DashboardHeader.module.css";
import { useRouter } from "next/router";
import { admins } from "../../data/users";
import { AddAdminDialog } from "../ShareDialog/AddAdminDialog";

interface Props extends ComponentProps<"header"> {
  isOpen: boolean;
  onMenuClick: MouseEventHandler<HTMLButtonElement>;
}

export function DashboardHeader({
  isOpen,
  onMenuClick,
  className,
  ...props
}: Props) {
  const { data: session } = useSession();

  const router = useRouter();

  let isAdmin = false;

  if (session) {
    const userInfo = session.user.info;
    isAdmin = admins.includes(userInfo.id);
  }

  const createAddAdminButton = isAdmin ? (
    <div className="pb-2">
      <AddAdminDialog>
        <Button icon={<PlusIcon />} className={styles.profilePopoverButton}>
          Add Admin{" "}
        </Button>
      </AddAdminDialog>
    </div>
  ) : null;

  return (
    <header className={clsx(className, styles.header)} {...props}>
      <div className={styles.menu}>
        <button className={styles.menuToggle} onClick={onMenuClick}>
          {isOpen ? <CrossIcon /> : <MenuIcon />}
        </button>
      </div>
      <div className={styles.logo}>
        <Link href="/" className={styles.logoLink}>
          <Logo />
        </Link>
      </div>
      <div className={styles.profile}>
        {session && (
          <Popover
            align="end"
            alignOffset={-6}
            content={
              <div className={styles.profilePopover}>
                <div className={styles.profilePopoverInfo}>
                  <span className={styles.profilePopoverName}>
                    {session.user.info.name}
                  </span>
                  <span className={styles.profilePopoverId}>
                    {session.user.info.id}
                  </span>
                </div>
                <div className={styles.profilePopoverActions}>
                  {createAddAdminButton}
                  <Button
                    className={styles.profilePopoverButton}
                    icon={<SignOutIcon />}
                    onClick={() => router.push("/api/auth/signout")}
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            }
            side="bottom"
            sideOffset={6}
          >
            <button className={styles.profileButton}>
              <Avatar
                className={styles.profileAvatar}
                name={session.user.info.name}
                size={32}
                src={session.user.info.avatar}
              />
            </button>
          </Popover>
        )}
      </div>
    </header>
  );
}
