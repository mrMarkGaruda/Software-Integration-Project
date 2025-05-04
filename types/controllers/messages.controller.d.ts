import { Request, Response } from 'express';

export function getMessages(req: Request, res: Response): Promise<Response>;
export function getMessageById(req: Request, res: Response): Promise<Response>;
export function addMessage(req: Request, res: Response): Promise<Response>;
export function editMessage(req: Request, res: Response): Promise<Response>;
export function deleteMessage(req: Request, res: Response): Promise<Response>;