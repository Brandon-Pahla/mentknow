import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { AuthenticatedLayout } from "../../../layouts/Authenticated";
import { DashboardLayout } from "../../../layouts/Dashboard";
import { DocumentsLayout } from "../../../layouts/Documents";
import * as Server from "../../../lib/server";
import { Group } from "../../../types";
import { useSelf } from "../../../liveblocks.config";
import { admins } from "../../../data/users";
import { isAdmin } from "../../api/database/admins";

export default function GroupPage({
  isadmin,
  groups,
  session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  return (
    <AuthenticatedLayout session={session}>
      <DashboardLayout groups={groups}>
        <DocumentsLayout
          filter="group"
          group={groups.find((group) => group.id === router.query.groupId)}
          isAdmin={isadmin}
        />
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
  const host = req.headers.host;

  const thisUser = session.user;
  const thisUserEmail = thisUser.info.id;

  const isadmin = await isAdmin(thisUserEmail);

  // If not logged in, redirect to marketing page
  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: `/`, //signin?callbackUrl=http://${host}/  //?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2F
      },
    };
  }

  const groups = await Server.getGroups(session?.user.info.groupIds ?? []);

  return {
    props: { isadmin, groups, session },
  };
};
