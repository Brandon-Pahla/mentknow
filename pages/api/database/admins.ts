import { User } from "../../../types/data";
import mongoose from "mongoose";
import AdminModel from "../../../models/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { admins } from "../../../data/users";

const DB_URI = process.env.MONGODB_URI as string; // Replace with your MongoDB URI

async function connectToDatabase() {
  try {
    await mongoose.connect(DB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectToDatabase();

export async function isAdmin(email: string): Promise<boolean> {
  const user = await AdminModel.findOne({ id: email }).exec();
  if (user) {
    return true;
  }
  return false;
}

async function addAdmin(user: string) {
  const admin = { id: user };
  const adminModel = new AdminModel(admin);
  await adminModel.save();
}

export async function updateAdminsList() {
  const adminsObjs = await AdminModel.find();
  adminsObjs.forEach((adminObj) => {
    if (!admins.includes(adminObj.id)) {
      admins.push(adminObj.id);
    }
  });
}

export async function updateAdminsDb() {
  admins.forEach(async (admin) => {
    const isadmin_ = await isAdmin(admin);
    if (!isadmin_) {
      await addAdmin(admin);
    }
  });
}

export async function adminz(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      connectToDatabase();
      console.log(req.query);
    case "POST":
      connectToDatabase();
  }
}
