import { Request, Response } from 'express';

export interface RegisterBody {
  email: string;
  username: string;
  password: string;
  country: string;
  city?: string;
  street?: string;
  creation_date?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export function register(req: Request, res: Response): Promise<void>;
export function login(req: Request, res: Response): Promise<void>;