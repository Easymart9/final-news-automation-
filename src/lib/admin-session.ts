export function getAdminSessionToken(): string | undefined {
  const configuredToken = process.env.ADMIN_SESSION_TOKEN;
  if (process.env.NODE_ENV === 'production') {
    return configuredToken && configuredToken.length >= 32 ? configuredToken : undefined;
  }

  return configuredToken || 'local-development-admin-session';
}