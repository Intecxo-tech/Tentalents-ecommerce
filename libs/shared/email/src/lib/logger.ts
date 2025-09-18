// libs/shared/email/src/lib/logger.ts
export const emailLogger = {
  info: (...args: unknown[]) => console.log('[EMAIL]', ...args),
  error: (...args: unknown[]) => console.error('[EMAIL]', ...args),
};
