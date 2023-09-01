// import { NextApiRequest, NextApiResponse } from "next";
// import { getUser } from "../../../lib/server";


// /**
//  * GET User
//  *
//  * Get a user from your database
//  *
//  * @param req
//  * @param req.query.userId - The user's id
//  * @param res
//  */
// async function GET(req: NextApiRequest, res: NextApiResponse) {
//   const userId = req.query.userId as string;
//   const user = await getUser(decodeURIComponent(userId));

//   if (!user) {
//     return res.status(400).json({
//       error: {
//         code: 400,
//         message: "User Not Found",
//         suggestion: `Check that the user "${userId}" exists in the system`,
//       },
//     });
//   }

//   return res.status(200).json(user);
// }

// export default async function users(req: NextApiRequest, res: NextApiResponse) {
//   switch (req.method) {
//     case "GET":
//       return await GET(req, res);

//     default:
//       return res.status(405).json({
//         error: {
//           code: 405,
//           message: "Method Not Allowed",
//           suggestion: "Only GET is available from this API",
//         },
//       });
//   }
// }


import { NextApiRequest, NextApiResponse } from "next";
import { getUser } from "../../../lib/server";
// import connectToDatabase from "../../../mongodb";
import UserModel from "../../../models/user";
import { User } from "../../../types/data";
import mongoose from "mongoose";

const DB_URI = process.env.MONGODB_URI as string; // Replace with your MongoDB URI

async function connectToDatabase() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}


connectToDatabase();

export default async function users(req: NextApiRequest, res: NextApiResponse) {

  // console.log("requeclearst id:", req)
  switch (req.method) {
    
    case "GET":
      connectToDatabase();
      const userId = req.query.userId as string;
      
      try {
        
        const user = await getUser(decodeURIComponent(userId));
        // console.log("User id:", userId)
        console.log("User:", user)
        if (!user) {
          return res.status(404).json({
            error: {
              code: 404,
              message: "User Not Found, Testing....",
              suggestion: `Check that the user "${userId}" exists in the system`,
            },
          });
        }

        // Define a projection to exclude the _id and __v fields
        const projection = {
          _id: 0,
          __v: 0,
        };

        // Use the lean() method to convert the Mongoose document to a plain JavaScript object
        const userObject: User | null = await UserModel.findOne({ id: userId }, projection).lean();
        console.log(userObject)

        return res.status(200).json(userObject);
      } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({
          error: {
            code: 500,
            message: "Internal Server Error",
            suggestion: "An error occurred while fetching the user data",
          },
        });
      }

    case "POST":
      connectToDatabase();
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: {
            code: 405,
            message: 'Method Not Allowed',
            suggestion: 'Only POST requests are allowed for this endpoint',
          },
        });
      }

      try {
        // Extract relevant user data from the Auth0 signup event
        const userData = {
          id: req.body.email, 
          name: req.body.name,
          avatar: req.body.avatar,
          groupIds: req.body.groupIds,
        };

        // Create a new user document with Mongoose
        const newUser = new UserModel(userData);

        console.log("Signup User:", newUser)

        // Save the new user to the database
        await newUser.save();

        return res.status(201).json(newUser); // Respond with the newly created user
      } catch (error) {
        console.error('Error saving user to the database:', error);
        return res.status(500).json({
          error: {
            code: 500,
            message: 'Internal Server Error',
            suggestion: 'An error occurred while saving the user data',
          },
        });
      }

    default:
      return res.status(405).json({
        error: {
          code: 405,
          message: 'Method Not Allowed',
          suggestion: 'Only GET and POST requests are allowed for this endpoint',
        },
      });
  }
}
