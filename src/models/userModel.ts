import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  username?: string;
  email: string;
  password: string;
  messages: mongoose.Types.ObjectId[];
  created_at?: Date;
  updated_at?: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, trim: true },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
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

// Ensure email is unique
userSchema.index({ email: 1 }, { unique: true });

const UserModel: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default UserModel;
