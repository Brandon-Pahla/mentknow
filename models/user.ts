import mongoose, { Document, Schema, model, Model } from 'mongoose';

// Define the User interface with all properties
export interface UserType {
    id: string;
    name: string;
    avatar?: string;
    color: string;
    groupIds: string[];
}

// Omit the "color" property from the User interface to create a UserSchema
type User= Omit<UserType, "color">;

// Define the Mongoose schema for the User
export const userSchema = new Schema<User>({
    id: String,
    name: String,
    avatar: String,
    groupIds: [String],
});

// Create a model using the schema
const UserModel: Model<User & Document> = mongoose.models.User || model<User & Document>('User', userSchema);

export default UserModel;
