import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[ANVAY Server Error]', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.clientMessage || err.message || 'An unexpected error occurred while processing your request.';

  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: message,
    statusCode,
  });
}
