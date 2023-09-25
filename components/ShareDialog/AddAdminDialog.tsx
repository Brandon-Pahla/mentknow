import * as Tabs from "@radix-ui/react-tabs";
import { useRouter } from "next/router";
import { ComponentProps } from "react";
import { useSession } from "next-auth/react";
import { Dialog } from "../../primitives/Dialog";
import styles from "./ShareDialog.module.css";
import { admins } from "../../data/users";
import { ShareDialogInviteAdmin } from "./ShareDialogInviteAdmin";

interface Props
  extends Omit<ComponentProps<typeof Dialog>, "content" | "title"> {}

export function AddAdminDialog({ children, ...props }: Props) {
  const { data: session } = useSession();

  if (session) {
    const userInfor = session.user.info;
    const email = userInfor.id;
    if (!admins.includes(email)) {
      return null;
    }
  }

  return (
    <Dialog
      content={
        <div className={styles.dialog}>
          <Tabs.Root className={styles.dialogTabs} defaultValue="users">
            <Tabs.Content value="users" className={styles.dialogTabContent}>
              <ShareDialogInviteAdmin
                className={styles.dialogSection}
                onSetUsers={() => null}
              />
            </Tabs.Content>
          </Tabs.Root>
        </div>
      }
      title="Add admin"
      {...props}
    >
      {children}
    </Dialog>
  );
}
