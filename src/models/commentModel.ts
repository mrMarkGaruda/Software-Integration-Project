import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  movie_id: number;
  username: string;
  comment: string;
  title: string;
  rating: number;
  downvotes?: number;
  upvotes?: number;
  created_at?: Date;
}

const commentSchema = new Schema<IComment>(
  {
    movie_id: { type: Number, required: true },
    username: { type: String, required: true },
    comment: { type: String, required: true },
    title: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5, required: true },
    downvotes: { type: Number, min: 0, default: 0 },
    upvotes: { type: Number, min: 0, default: 0 },
  },
  {
    timestamps: { createdAt: 'created_at' },
  }
);

export default mongoose.model<IComment>('Comment', commentSchema);