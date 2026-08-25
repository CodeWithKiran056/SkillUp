const TOKEN_KEY = "token";
const USER_KEY = "skillup_user";

/**
 * Save authentication token
 */
export const saveToken = (token) => {
  if (!token) return;

  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get authentication token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Save logged-in user
 */
export const saveUser = (user) => {
  if (!user) return;

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
};

/**
 * Get logged-in user
 */
export const getUser = () => {
  try {
    const storedUser =
      localStorage.getItem(USER_KEY);

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Unable to read stored user:",
      error
    );

    localStorage.removeItem(USER_KEY);

    return null;
  }
};

/**
 * Check authentication
 */
export const isAuthenticated = () => {
  return Boolean(getToken());
};

/**
 * Clear ALL SkillUp authentication data from storage.
 *
 * This is the ONE canonical way to wipe a session. It must be used
 * before establishing a brand-new login/registration session so a
 * stale user object can never survive across accounts.
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  /* Legacy / stray key that must never hold a user object */
  localStorage.removeItem("user");
};

/**
 * Get the real authenticated user id (from the current session)
 * or null when no valid session exists.
 */
export const getCurrentUserId = () => {
  const storedUser = getUser();

  if (!storedUser) {
    return null;
  }

  return storedUser.id || storedUser._id || null;
};

/**
 * Logout current user
 */
export const logoutUser = () => {
  clearAuth();
};
