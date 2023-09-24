import clsx from "clsx";
import Link from "next/link";
import { ComponentProps } from "react";
import { PlusIcon, SignInIcon, SignOutIcon } from "../../icons";
import { signIn } from "next-auth/react";
import { Button } from "../../primitives/Button";
import { Container } from "../../primitives/Container";
import { Logo } from "../Logo";
import styles from "./AdminHeader.module.css";
import router from "next/router";

export function AdminHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header className={clsx(className, styles.header)} {...props}>
      <Container className={styles.container}>
        <Link href="/">
          <Logo />
        </Link>
        <Button
          // className={styles.profilePopoverButton}
          icon={<SignOutIcon />}
          onClick={() => router.push("/api/auth/signout")}
        >
          Sign out
        </Button>
      </Container>
    </header>
  );
}
