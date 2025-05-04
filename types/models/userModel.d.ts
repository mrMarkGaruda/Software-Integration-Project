import { Document, Model, Schema, Types } from 'mongoose';

interface IUser {
  username?: string;
  email: string;
  password: string;
  messages: Types.ObjectId[];
  created_at?: Date;
  updated_at?: Date;
}

interface IUserDocument extends IUser, Document {}

interface IUserModel extends Model<IUserDocument> {
  // Add any static methods here
}

declare const UserModel: IUserModel;

export default UserModel;
export { IUser, IUserDocument };