import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import verifyToken from '../../src/middleware/authentication';
import { unauthorized } from '../../src/constants/statusCodes';

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    process.env.JWT_SECRET_KEY = 'test-secret';

    mockRequest = {
      header: jest.fn(),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET_KEY;
  });

  it('should return unauthorized if no Authorization header', () => {
    (mockRequest.header as jest.Mock).mockReturnValue(undefined);

    verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(unauthorized);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'No Authorization header',
    });
  });

  it('should return unauthorized if no token provided', () => {
    (mockRequest.header as jest.Mock).mockReturnValue('Bearer ');

    verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(unauthorized);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'No token provided',
    });
  });

  it('should call next for valid token', () => {
    const token = jwt.sign(
      { user: { email: 'test@example.com' } },
      process.env.JWT_SECRET_KEY!
    );

    (mockRequest.header as jest.Mock).mockReturnValue(`Bearer ${token}`);

    verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.user).toEqual({ email: 'test@example.com' });
  });

  it('should return unauthorized for expired token', () => {
    const token = jwt.sign(
      { user: { email: 'test@example.com' } },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: '-1s' }
    );

    (mockRequest.header as jest.Mock).mockReturnValue(`Bearer ${token}`);

    verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(unauthorized);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token expired' });
  });

  it('should return unauthorized if JWT_SECRET_KEY is not defined', () => {
    delete process.env.JWT_SECRET_KEY;

    const token = 'some-token';
    (mockRequest.header as jest.Mock).mockReturnValue(`Bearer ${token}`);

    verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(unauthorized);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Authentication failed',
    });
  });
});
