import mongoose, { Document, model, Model, Schema } from "mongoose";

// Define the User interface with all properties
export interface UserType {
    id: string;
    name: string;
    avatar?: string;
    color: string;
    groupIds: string[];
}

// Omit the unnecessary properties from the User interface to create an AdminSchema
export type Admin = Omit<UserType, "color" | "groupIds" | "name" | "avatar">;

// Define the Mongoose schema for the User
export const adminSchema = new Schema<Admin>({
    id: {
        type: String,
        unique: true,
        required: true,
    },
});

// Create an Admin model using the same user schema
const AdminModel: Model<Admin & Document> =
  mongoose.models.Admin || model<Admin & Document>("Admin", adminSchema);

export default AdminModel;
