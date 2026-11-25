import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

type Source = 'body' | 'query' | 'params';

export function validationMiddleware(schema: ZodSchema, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const data = req[source];
    const result = schema.safeParse(data);
    if (!result.success) {
      return next(ApiError.validation('Invalid request', result.error.errors));
    }
    // Replace with parsed (and coerced) data
    if (source === 'body') req.body = result.data;
    else if (source === 'query') (req as any).validatedQuery = result.data;
    else req.params = result.data as any;
    return next();
  };
}