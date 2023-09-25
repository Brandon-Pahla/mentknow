import clsx from "clsx";
import { GetServerSideProps } from "next";
import { ComponentProps, ReactNode, useEffect, useState } from "react";
import { DASHBOARD_URL } from "../constants";
import { SignInIcon } from "../icons";
import { AdminLayout } from "../layouts/Admin";
import { signIn, useSession } from "next-auth/react";
import * as Server from "../lib/server";
import { Button, LinkButton } from "../primitives/Button";
import { Container } from "../primitives/Container";
import styles from "./index.module.css";
import { useStorage } from "../liveblocks.config";
import { shallow } from "@liveblocks/client";

interface FeatureProps extends Omit<ComponentProps<"div">, "title"> {
  description: ReactNode;
  title: ReactNode;
}

function Feature({ title, description, className, ...props }: FeatureProps) {
  return (
    <div className={clsx(className, styles.featuresFeature)} {...props}>
      <h4 className={styles.featuresFeatureTitle}>{title}</h4>
      <p className={styles.featuresFeatureDescription}>{description}</p>
    </div>
  );
}

// fetch all boards 
async function getBoards() {
    
  let url = `/api/liveblocks/documents/boards`;

  const response = await fetch(url);
  return await response.json();
}

export default function Admin() {
  const { data: session } = useSession();
  const [boardData, setBoardData] = useState(null);

  useEffect(() => {
    // Fetch boards when the component mounts
    async function fetchBoards() {
      try {
        const boards = await getBoards();
        setBoardData(boards);
      } catch (error) {
        console.error("Error fetching boards:", error);
      }
    }

    fetchBoards();
  }, []);
  
  // fetch all notes

  // fetch all users




  console.log("How many boards:", boardData)

  return (
    <AdminLayout>
      <Container className={styles.section}>
        <div className={styles.heroInfo}>
          <p className={styles.heroLead}>
            Hello there,&nbsp;
          </p>
          <h1 className={styles.heroTitle2}>
            {session?.user.info.name}&nbsp;
          </h1>
        </div>

      </Container>
      <Container className={styles.section}>
        <h2 className={styles.sectionTitle}>Summary</h2>
        <div className={styles.featuresGrid}>
          <Feature
            description={
              <>
                A collaborative whiteboard app with included share menu,
                documents listing, users, groups, permissions, and more.
              </>
            }
            title="Total Boards Created"
          />
          <Feature
            description={
              <>
                Best practices followed, using a mixture of SSR and custom API
                endpoints. Modify documents from both client and server.
              </>
            }
            title="Total Number of Groups"
          />
          <Feature
            description={
              <>
                {/* {noteObjects.length} */}
              </>
            }
            title="Total Number of Notes"
          />
          
        </div>
      </Container>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await Server.getServerSession(req, res);

  // If not logged in, redirect to login page
  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/admin",
      },
    };
  }

  // console.log("Session:", session["user"].name)

  return {
    props: {
      session
    },
  };
};
