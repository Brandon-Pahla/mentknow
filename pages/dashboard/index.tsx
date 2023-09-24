import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { Session } from "next-auth";
import { AuthenticatedLayout } from "../../layouts/Authenticated";
import { DashboardLayout } from "../../layouts/Dashboard";
import { DocumentsLayout } from "../../layouts/Documents";
import * as Server from "../../lib/server";
import { Group } from "../../types";
import { isAdmin, updateAdminsDb, updateAdminsList } from "../api/database/admins";

export default function Index({
  groups,
  session,
  isadmin,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <AuthenticatedLayout session={session}>
      <DashboardLayout groups={groups}>
        <DocumentsLayout filter="all" isAdmin={isadmin} />
      </DashboardLayout>
    </AuthenticatedLayout>
  );
}

interface ServerSideProps {
  groups: Group[];
  session: Session;
  isadmin: boolean;
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

  // update the admins db
  await updateAdminsDb();

  // Update the admins list
  await updateAdminsList();

  // If not logged in, redirect to login page
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
    props: { groups, session, isadmin },
  };
};
