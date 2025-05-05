import { Document, Model } from 'mongoose';

export interface IRating extends Document {
  movie_id: number;
  email: string;
  rating: number;
  created_at?: Date;
}

/**
 * Mongoose model for Rating.
 */
declare const RatingModel: Model<IRating>;

export default RatingModel;