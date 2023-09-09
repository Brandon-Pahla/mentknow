import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
import Auth0Provider from "next-auth/providers/auth0";
import { getUser } from "../../../lib/server";
import { User } from "../../../types";
import getConfig from "next/config";

// Your NextAuth secret (generate a new one for production)
// More info: https://next-auth.js.org/configuration/options#secret
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

async function createUser(user: any) {
  try {

    // console.log("User object in CREATE USER function:", user);
    // Extract desired fields from the Auth0 user
    const userData = {
      email: user.email,
      name: user.name,
      avatar: user.picture,
      groupIds: [], // You can populate this as needed
    };

    // Get the base API URL from the config
    const { publicRuntimeConfig } = getConfig();
    const apiUrl = publicRuntimeConfig.API_URL;

    // console.log("TO DATABASE User:", userData);
    
    // Construct the full URL to your API endpoint
    const apiUrlWithEndpoint = `${process.env.AUTH0_BASE_URL}/api/database/users`;
    // Send the user data to your database endpoint
    const response = await fetch(apiUrlWithEndpoint, {
      method: "POST", // Adjust the method as needed (e.g., POST or PUT)
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Failed to create user in the database");
    }

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error; // Rethrow the error to prevent the sign-up process from succeeding
  }
}


export const authOptions = {
  secret: NEXTAUTH_SECRET,
  callbacks: {
    // Get extra user info from your database to pass to front-end
    async signIn({user}: { user: any }){

      // console.log("User object:", user);
      const newUser = await createUser(user); 
    
      return newUser;
    },    

    // For front end, update next-auth.d.ts with session type
    async session({ session }: { session: any }) {
      const userInfo: User | null = await getUser(session.user.email);

      
      

      if (!userInfo) {
        throw new Error("User not found");
      }
     
      session.user.info = userInfo;
      // Set the image property to the value of avatar
      session.user.image = userInfo.avatar;
      // console.log("SESSION:", session)
      // console.log("USER IN SESSION:", userInfo)

      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },

  // Configure one or more authentication providers
  // More info: https://next-auth.js.org/providers/
  providers: [

    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID as string,
      clientSecret: process.env.AUTH0_CLIENT_SECRET as string,
      issuer: process.env.AUTH0_ISSUER_BASE_URL as string,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
          
          // Add any other properties you need
          user_id: profile.user_id, 
          identities: profile.identities
        };
      }
    }),
    // CredentialsProvider is used for the demo auth system
    // Replace this with a real provider, e.g. GitHub, Auth0
   
  ],
};

export default NextAuth(authOptions);
