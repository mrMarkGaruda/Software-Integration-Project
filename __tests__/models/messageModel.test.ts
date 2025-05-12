import mongoose from 'mongoose';
import MessageModel from '../../src/models/messageModel';
import UserModel from '../../src/models/userModel';

describe('Message Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/testdb'
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await MessageModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  it('should create & save message successfully', async () => {
    // Create a test user first
    const user = await UserModel.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    const validMessage = new MessageModel({
      name: 'Test Message',
      user: user._id,
    });

    const savedMessage = await validMessage.save();
    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.name).toBe(validMessage.name);
    expect(savedMessage.user.toString()).toBe(user._id.toString());
  });

  it('should fail to save message without required name', async () => {
    // Create a test user first
    const user = await UserModel.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    const messageWithoutName = new MessageModel({
      user: user._id,
    });

    await expect(messageWithoutName.save()).rejects.toThrow();
  });

  it('should fail to save message without required user', async () => {
    const messageWithoutUser = new MessageModel({
      name: 'Test Message',
    });

    await expect(messageWithoutUser.save()).rejects.toThrow();
  });

  it('should create timestamps', async () => {
    // Create a test user first
    const user = await UserModel.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    const message = new MessageModel({
      name: 'Timestamped Message',
      user: user._id,
    });
    const savedMessage = await message.save();

    expect(savedMessage.created_at).toBeDefined();
    expect(savedMessage.updated_at).toBeDefined();
    expect(savedMessage.created_at).toBeInstanceOf(Date);
    expect(savedMessage.updated_at).toBeInstanceOf(Date);
  });

  it('should automatically populate user on find', async () => {
    // Create a test user first
    const user = await UserModel.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    const message = new MessageModel({
      name: 'Populated Message',
      user: user._id,
    });
    const savedMessage = await message.save();

    const foundMessage = await MessageModel.findById(savedMessage._id).populate(
      'user'
    );
    expect(foundMessage?.user).toBeDefined();
    expect(foundMessage?.user.toString()).toBe(user._id.toString());
  });

  it('should allow updating the message name', async () => {
    // Create a test user first
    const user = await UserModel.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    const message = new MessageModel({
      name: 'Original Message',
      user: user._id,
    });
    const savedMessage = await message.save();

    savedMessage.name = 'Updated Message';
    const updatedMessage = await savedMessage.save();

    expect(updatedMessage.name).toBe('Updated Message');
    expect(updatedMessage.updated_at).not.toEqual(updatedMessage.created_at);
  });
});
