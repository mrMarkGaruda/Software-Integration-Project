import { Request, Response } from 'express';
import MessageModel from '../models/messageModel';

export const getMessages = async (_req: Request, res: Response) => {
  const messages = await MessageModel.find({});
  return res.status(200).json(messages);
};

export const getMessageById = async (req: Request, res: Response) => {
  const { messageId } = req.params;
  try {
    const message = await MessageModel.findById(messageId);
    return res.status(200).json(message);
  } catch (error: any) {
    console.log('Error while getting message from DB', error.message);
    return res.status(500).json({ error: 'Error while getting message' });
  }
};

export const addMessage = async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message || !message.name) {
    return res.status(400).json({ error: 'missing information' });
  }

  if (!req.session?.user?._id) {
    return res.status(500).json({ error: 'You are not authenticated' });
  }

  message.user = req.session.user._id;

  try {
    const messageObj = new MessageModel(message);
    await messageObj.save();
    return res.status(200).json(messageObj);
  } catch (error: any) {
    console.log('Error while adding message to DB', error.message);
    return res.status(500).json({ error: 'Failed to add message' });
  }
};

export const editMessage = async (req: Request, res: Response) => {
  const { name } = req.body;
  const { messageId } = req.params;

  if (!name || !messageId)
    return res.status(400).json({ error: 'missing information' });
  try {
    const message = await MessageModel.findByIdAndUpdate(
      messageId,
      { name },
      { new: true }
    );
    return res.status(200).json(message);
  } catch (error: any) {
    console.log('Error while updating message', error.message);
    return res.status(500).json({ error: 'Failed to update message' });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  const { messageId } = req.params;

  if (!messageId) return res.status(400).json({ error: 'missing information' });

  try {
    await MessageModel.findByIdAndDelete(messageId);
    return res.status(200).json({ message: 'Message deleted' });
  } catch (error: any) {
    console.log('Error while deleting message', error.message);
    return res.status(500).json({ error: 'Failed to delete message' });
  }
};