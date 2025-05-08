import { Request, Response } from 'express';
import MessageModel from '../models/messageModel';
import logger from '../middleware/winston';

export const getMessages = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const messages = await MessageModel.find({});
  res.status(200).json(messages);
};

export const getMessageById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { messageId } = req.params;
  try {
    const message = await MessageModel.findById(messageId);
    res.status(200).json(message);
  } catch (error: unknown) {
    logger.error(
      'Error while getting message from DB',
      error instanceof Error ? error.message : String(error)
    );
    res.status(500).json({ error: 'Error while getting message' });
  }
};

export const addMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { message } = req.body;

  if (!message || !message.name) {
    res.status(400).json({ error: 'missing information' });
    return;
  }

  if (!req.session?.user?._id) {
    res.status(500).json({ error: 'You are not authenticated' });
    return;
  }

  message.user = req.session.user._id;

  try {
    const messageObj = new MessageModel(message);
    await messageObj.save();
    res.status(200).json(messageObj);
  } catch (error: unknown) {
    logger.error(
      'Error while adding message to DB',
      error instanceof Error ? error.message : String(error)
    );
    res.status(500).json({ error: 'Failed to add message' });
  }
};

export const editMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name } = req.body;
  const { messageId } = req.params;

  if (!name || !messageId) {
    res.status(400).json({ error: 'missing information' });
    return;
  }
  try {
    const message = await MessageModel.findByIdAndUpdate(
      messageId,
      { name },
      { new: true }
    );
    res.status(200).json(message);
  } catch (error: unknown) {
    logger.error(
      'Error while updating message',
      error instanceof Error ? error.message : String(error)
    );
    res.status(500).json({ error: 'Failed to update message' });
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { messageId } = req.params;

  if (!messageId) {
    res.status(400).json({ error: 'missing information' });
    return;
  }

  try {
    await MessageModel.findByIdAndDelete(messageId);
    res.status(200).json({ message: 'Message deleted' });
  } catch (error: unknown) {
    logger.error(
      'Error while deleting message',
      error instanceof Error ? error.message : String(error)
    );
    res.status(500).json({ error: 'Failed to delete message' });
  }
};
