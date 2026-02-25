/**
 * Development Configuration
 *
 * Toggle these flags for local development convenience
 */

export const DEV_CONFIG = {
  /**
   * Set to true to bypass authentication and work on UI without backend
   * WARNING: Only use in development! Never commit as true.
   */
  BYPASS_AUTH: false,

  /**
   * Mock user data when BYPASS_AUTH is enabled
   */
  MOCK_USER: {
    id: "dev-user-123",
    email: "dev@example.com",
    name: "Dev User",
    profilePicture: null,
  },
};
