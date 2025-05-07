/**
 * HTTP status codes used throughout the application
 */
const queryError: number = 500;
const notFound: number = 404;
const badGateway: number = 502;
const success: number = 200;
const unauthorized: number = 401;
const badRequest: number = 400;
const userAlreadyExists: number = 409;

const statusCodes = {
  queryError,
  notFound,
  badGateway,
  success,
  unauthorized,
  badRequest,
  userAlreadyExists,
};

export {
  queryError,
  notFound,
  badGateway,
  success,
  unauthorized,
  badRequest,
  userAlreadyExists,
};

export default statusCodes;
