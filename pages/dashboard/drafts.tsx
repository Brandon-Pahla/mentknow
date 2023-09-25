import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { Session } from "next-auth";
import { AuthenticatedLayout } from "../../layouts/Authenticated";
import { DashboardLayout } from "../../layouts/Dashboard";
import { DocumentsLayout } from "../../layouts/Documents";
import * as Server from "../../lib/server";
import { Group } from "../../types";
import { admins } from "../../data/users";
import { useSelf } from "../../liveblocks.config";
import { isAdmin } from "../api/database/admins";

export default function Drafts({
  isadmin,
  groups,
  session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <AuthenticatedLayout session={session}>
      <DashboardLayout groups={groups}>
        <DocumentsLayout filter="drafts" isAdmin={isadmin} />
      </DashboardLayout>
    </AuthenticatedLayout>
  );
}

interface ServerSideProps {
  isadmin: boolean;
  groups: Group[];
  session: Session;
}

// Authenticate on server and retrieve a list of the current user's groups
export const getServerSideProps: GetServerSideProps<ServerSideProps> = async ({
  req,
  res,
}) => {
  const session = await Server.getServerSession(req, res);

  const thisUser = session.user;
  const thisUserEmail = thisUser.info.id;

  const isadmin = await isAdmin(thisUserEmail);

  // If not logged in, redirect to marketing page
  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  const groups = await Server.getGroups(session?.user.info.groupIds ?? []);

  return {
    props: { isadmin, groups, session },
  };
};
