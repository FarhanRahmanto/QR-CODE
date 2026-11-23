import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodType } from 'zod';

/** Error HTTP yang pesannya aman ditampilkan ke pengguna */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Bungkus handler async agar error otomatis diteruskan ke error handler */
export function asyncHandler<T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req as T, res, next).catch(next);
  };
}

/** Validasi body dengan Zod; lempar HttpError 400 dengan pesan pertama */
export function parseBody<T>(schema: ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body ?? {});
  if (!result.success) {
    const first = result.error.issues[0];
    throw new HttpError(400, first?.message || 'Data yang dikirim tidak valid.');
  }
  return result.data;
}

/** Ambil route param sebagai string */
export function param(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : String(value ?? '');
}
