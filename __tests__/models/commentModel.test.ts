import mongoose from 'mongoose';
import RatingModel from '../../src/models/ratingModel';

describe('RatingModel', () => {
  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/testdb'
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await RatingModel.deleteMany({});
  });

  it('should create and save a rating successfully', async () => {
    const ratingData = {
      movie_id: 123,
      email: 'test@example.com',
      rating: 4,
    };

    const validRating = new RatingModel(ratingData);
    const savedRating = await validRating.save();

    // Assert
    expect(savedRating._id).toBeDefined();
    expect(savedRating.movie_id).toBe(ratingData.movie_id);
    expect(savedRating.email).toBe(ratingData.email);
    expect(savedRating.rating).toBe(ratingData.rating);
  });

  it('should fail to save a rating with invalid rating value', async () => {
    const invalidRatings = [
      { movie_id: 123, email: 'test@example.com', rating: -1 },
      { movie_id: 123, email: 'test@example.com', rating: 6 },
    ];

    for (const invalidRating of invalidRatings) {
      const ratingModel = new RatingModel(invalidRating);
      await expect(ratingModel.save()).rejects.toThrow();
    }
  });

  it('should require all mandatory fields', async () => {
    const incompleteRatings = [
      { movie_id: 123 },
      { email: 'test@example.com' },
      { rating: 4 },
      {},
    ];

    for (const incompleteRating of incompleteRatings) {
      const ratingModel = new RatingModel(incompleteRating);
      await expect(ratingModel.save()).rejects.toThrow();
    }
  });

  it('should add timestamp when creating a rating', async () => {
    const ratingData = {
      movie_id: 456,
      email: 'test@example.com',
      rating: 3,
    };

    const savedRating = await RatingModel.create(ratingData);

    expect(savedRating.created_at).toBeDefined();
    expect(savedRating.created_at).toBeInstanceOf(Date);
  });

  it('should allow multiple ratings for the same movie by different emails', async () => {
    const ratings = [
      { movie_id: 789, email: 'user1@example.com', rating: 4 },
      { movie_id: 789, email: 'user2@example.com', rating: 5 },
    ];

    const savedRatings = await RatingModel.create(ratings);

    expect(savedRatings.length).toBe(2);
    expect(savedRatings[0].movie_id).toBe(789);
    expect(savedRatings[1].movie_id).toBe(789);
  });
});
