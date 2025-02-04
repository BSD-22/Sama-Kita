import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

type Err = {
  name?: string;
  message?: string; // Optionally include error messages
};

const errorHandler: ErrorRequestHandler = (err: Err, req: Request, res: Response, next: NextFunction) => {
  let status = 500;
  let errMsg = err.message || 'Internal Server Error';

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    status = 400;
    errMsg = 'Invalid Request';
  }

  // Handle login errors
  if (err.name === 'LoginError') {
    status = 401;
    errMsg = err.message || 'Invalid Credentials';
  }

  // Handle expired OTP errors
  if (err.name === 'ExpiredOTP') {
    status = 400;
    errMsg = err.message || 'OTP has expired';
  }

  // Handle OTP mismatch errors
  if (err.name === 'OTPNotMatch') {
    status = 400;
    errMsg = err.message || 'OTP does not match';
  }

  // Handle OTP existence errors
  if (err.name === 'OTPExist') {
    status = 400;
    errMsg = 'Please wait 1 minute for another OTP';
  }

  if (err.name === 'Unauthorized') {
    status = 401;
    errMsg = err.message || 'Invalid Credentials';
  }

  if (err.name === 'NoFileError') {
    status = 400;
    errMsg = 'Please upload a file';
  }

  if (err.name === 'LLMBadRequest') {
    status = 400;
    errMsg = 'Please provide a message';
  }

  // Handle Not Found errors
  if (err.name === 'NotFoundError') {
    status = 404;
    errMsg = err.message || 'Resource not found';
  }

  if (err.name === 'MidtransError') {
    status = 400;
    errMsg = err.message || 'Midtrans Error';
  }

  // Handle Validation errors
  if (err.name === 'ValidationError') {
    status = 422;
    errMsg = err.message || 'Validation error';
  }

  // Send the response with the error details
  res.status(status).json({ message: errMsg });

  next(); // Call next middleware if needed
};

export default errorHandler;
