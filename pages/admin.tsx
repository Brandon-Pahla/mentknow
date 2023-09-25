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
import BarChart from "../components/Admin/UsersPerBoard";
import BoardUserChart from "../components/Admin/UsersPerBoard";


interface BoardData {
  id: string;
  created: string;
  lastConnection: string;
  type: string;
  name: string;
  owner: string;
  draft: boolean;
  accesses: {
    default: string;
    groups: { [key: string]: string };
    users: { [key: string]: string };
  };
}

interface ResponseData {
  documents: BoardData[];
}


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
async function getBoards(): Promise<BoardData[]> {
  let url = `/api/liveblocks/documents/boards`;

  const response = await fetch(url);
  const data: ResponseData = await response.json();

  return data.documents;
}


export default function Admin() {
  const { data: session } = useSession();
  const [boardData, setBoardData] = useState<BoardData[] | null>(null); // Specify the type

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
                {boardData?.length}
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
                <BoardUserChart boardData={boardData || []}/>
                <p>A visual representation of the number of users for each board, making it easy to compare the user counts across different boards</p>
              </>
            }
            title="Users per Board"
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
