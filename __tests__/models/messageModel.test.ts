import mongoose from 'mongoose';
import MessageModel from '../../models/messageModel';
import UserModel from '../../models/userModel';

describe('Message Model Test', () => {
  let testUser: mongoose.Document;

  beforeEach(async () => {
    await MessageModel.deleteMany({});
    await UserModel.deleteMany({});

    // Create a test user
    testUser = await UserModel.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should create & save message successfully', async () => {
    const validMessage = new MessageModel({
      name: 'Test Message',
      user: testUser._id,
    });

    const savedMessage = await validMessage.save();
    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.name).toBe(validMessage.name);
    expect(savedMessage.user.toString()).toBe(testUser._id.toString());
  });

  it('should fail to save message without required name', async () => {
    const messageWithoutName = new MessageModel({
      user: testUser._id,
    });

    try {
      await messageWithoutName.save();
      fail('Expected validation error');
    } catch (error) {
      const err = error as mongoose.Error.ValidationError;
      expect(err.errors.name).toBeDefined();
    }
  });

  it('should fail to save message without required user', async () => {
    const messageWithoutUser = new MessageModel({
      name: 'Test Message',
    });

    try {
      await messageWithoutUser.save();
      fail('Expected validation error');
    } catch (error) {
      const err = error as mongoose.Error.ValidationError;
      expect(err.errors.user).toBeDefined();
    }
  });

  it('should create timestamps', async () => {
    const message = new MessageModel({
      name: 'Timestamped Message',
      user: testUser._id,
    });
    const savedMessage = await message.save();

    expect(savedMessage.created_at).toBeDefined();
    expect(savedMessage.updated_at).toBeDefined();
  });

  it('should automatically populate user on find', async () => {
    const message = new MessageModel({
      name: 'Populated Message',
      user: testUser._id,
    });
    const savedMessage = await message.save();

    const foundMessage = await MessageModel.findById(savedMessage._id).populate(
      'user'
    );
    expect(foundMessage?.user).toBeDefined();
    expect(foundMessage?.user.toString()).toBe(testUser._id.toString());
  });
});
