// import { colors } from "../../../data/colors";
// import { users } from "../../../data/users";
// import { User } from "../../../types";
// import { getRandom } from "../utils";

// /**
//  * Get User
//  *
//  * Simulates calling your database and returning a user with a seeded random colour
//  *
//  * @param userId - The user's id
//  */
// export async function getUser(userId: string): Promise<User | null> {
//   const user = users.find((user) => user.id === userId); 

//   if (!user) {
//     console.warn(`
// ERROR: User "${userId}" was not found. 

// Check that you've added the user to data/users.ts, for example:
// {
//   id: "${userId}",
//   name: "Tchoka Ahoki",
//   avatar: "https://liveblocks.io/avatars/avatar-7.png",
//   groupIds: ["product", "engineering", "design"],
// },
 
// `);
//     return null;
//   }

//   const color = getRandom(colors, userId);

//   return { color, ...user };
// }


//MongoDB

import { User } from "../../../types";
import { getRandom } from "../utils";
import UserModel from "../../../models/user"; 
import { colors } from "../../../data/colors";

/**
 * Get User
 *
 * Retrieves a user from the MongoDB database based on userId and adds a seeded random color.
 *
 * @param userId - The user's id
 */
export async function getUser(userId: string): Promise<User | null> {
  try {
    // console.log("getUser function, User id:", userId)
    const user = await UserModel.findOne({ id: userId }).exec();
    // console.log("getUser function, User:", user)
    if (!user) {
      console.warn(`ERROR: User "${userId}" was not found.`);
      return null;
    }

    const color = getRandom(colors, userId);

    // Convert the Mongoose document to a plain JavaScript object
    const userObject = user.toObject();

    // Remove non-serializable fields (_id and __v)
    delete userObject._id;
    delete userObject.__v;

    // console.log("******",userObject)

    return { color, ...userObject };
  } catch (error) {
    console.error("Error fetching user from the database:", error);
    return null;
  }
}
