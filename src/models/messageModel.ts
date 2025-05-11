import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage extends Document {
  name: string;
  user: Types.ObjectId;
  created_at?: Date;
  updated_at?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    name: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.model<IMessage>('Message', messageSchema);