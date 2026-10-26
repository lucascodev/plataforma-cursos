export const SESSION_DURATIONS = {
  loginAttemptSeconds: 10 * 60,
  refreshTokenSeconds: 30 * 24 * 60 * 60,
  accessTokenSafetyMarginSeconds: 60,
} as const;
