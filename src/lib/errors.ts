export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message)
  }
}

export class AuthError extends AppError {
  constructor(message = '未登录或会话已过期') {
    super(message, 'AUTH_ERROR', 401)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} 不存在`, 'NOT_FOUND', 404)
  }
}

export class QuotaExceededError extends AppError {
  constructor(resource: string, limit: number) {
    super(`${resource} 已达上限 (${limit})`, 'QUOTA_EXCEEDED', 403)
  }
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string }

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data }
}

export function fail(error: string, code = 'ERROR'): ActionResult<never> {
  return { success: false, error, code }
}
