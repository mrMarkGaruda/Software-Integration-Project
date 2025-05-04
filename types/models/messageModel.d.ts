import { Document, Model, Types } from 'mongoose';

export interface IMessage extends Document {
  name: string;
  user: Types.ObjectId;
  created_at?: Date;
  updated_at?: Date;
}

declare const MessageModel: Model<IMessage>;
export default MessageModel;