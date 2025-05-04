import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  messages: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, trim: true },
    email: { type: String, unique: true, lowercase: true, trim: true, required: true },
    password: { type: String, trim: true, required: true },
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

export default mongoose.model<IUser>('User', userSchema);
