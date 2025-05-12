import mongoose from 'mongoose';
import UserModel from '../../src/models/userModel';
import MessageModel from '../../src/models/messageModel';

describe('UserModel', () => {
  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/testdb'
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
    await MessageModel.deleteMany({});
  });

  it('should create and save a user successfully', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const validUser = new UserModel(userData);
    const savedUser = await validUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.email).toBe(userData.email.toLowerCase());
    expect(savedUser.password).toBe(userData.password);
  });

  it('should require email field', async () => {
    const userWithoutEmail = new UserModel({
      username: 'testuser',
      password: 'password123',
    });

    await expect(userWithoutEmail.save()).rejects.toThrow();
  });

  it('should convert email to lowercase', async () => {
    const userData = {
      username: 'testuser',
      email: 'Test@Example.COM',
      password: 'password123',
    };

    const savedUser = await UserModel.create(userData);

    expect(savedUser.email).toBe('test@example.com');
  });

  it('should add timestamps when creating a user', async () => {
    const userData = {
      username: 'timestampuser',
      email: 'timestamptest@example.com',
      password: 'password123',
    };

    const savedUser = await UserModel.create(userData);

    expect(savedUser.created_at).toBeDefined();
    expect(savedUser.updated_at).toBeDefined();
    expect(savedUser.created_at).toBeInstanceOf(Date);
    expect(savedUser.updated_at).toBeInstanceOf(Date);
  });

  it('should prevent duplicate email addresses', async () => {
    const userData = {
      username: 'testuser',
      email: 'duplicate@example.com',
      password: 'password123',
    };

    await UserModel.create(userData);

    const duplicateUser = new UserModel(userData);
    await expect(duplicateUser.save()).rejects.toThrow();
  });

  it('should allow adding messages to user', async () => {
    const user = await UserModel.create({
      username: 'messageuser',
      email: 'message@example.com',
      password: 'password123',
    });

    const message = await MessageModel.create({
      name: 'Test Message',
      user: user._id,
    });

    user.messages.push(message._id);
    await user.save();

    const updatedUser = await UserModel.findById(user._id).populate('messages');

    expect(updatedUser?.messages.length).toBe(1);
    expect(updatedUser?.messages[0]._id.toString()).toBe(
      message._id.toString()
    );
  });

  it('should trim username and email', async () => {
    const userData = {
      username: '  testuser  ',
      email: '  test@example.com  ',
      password: 'password123',
    };

    const savedUser = await UserModel.create(userData);

    expect(savedUser.username).toBe('testuser');
    expect(savedUser.email).toBe('test@example.com');
  });

  it('should create user with optional username', async () => {
    const userData = {
      email: 'optional@example.com',
      password: 'password123',
    };

    const savedUser = await UserModel.create(userData);

    expect(savedUser.email).toBe('optional@example.com');
    expect(savedUser.username).toBeUndefined();
  });

  it('should update user successfully', async () => {
    const user = await UserModel.create({
      username: 'originaluser',
      email: 'original@example.com',
      password: 'password123',
    });

    // Simulate a small time delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    user.username = 'updateduser';
    const updatedUser = await user.save();

    expect(updatedUser.username).toBe('updateduser');
    expect(updatedUser.created_at).toBeDefined();
    expect(updatedUser.updated_at).toBeDefined();
    expect(updatedUser.updated_at).not.toEqual(updatedUser.created_at);
  });
});
