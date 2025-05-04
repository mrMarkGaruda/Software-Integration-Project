import mongoose, { Document, Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  messages: mongoose.Types.ObjectId[];
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Mongoose model for User.
 */
declare const userModel: Model<IUser>;

export default userModel;
