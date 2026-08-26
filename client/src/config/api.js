/**
 * Central API configuration.
 *
 * In production (Render), set the environment variable:
 *   VITE_API_URL=https://skillup-api-st8q.onrender.com
 *
 * Vite only exposes variables prefixed with VITE_ to client code,
 * and they are baked in at BUILD time (not runtime), so this value
 * must exist on the Render frontend service when it builds.
 *
 * The localhost fallback keeps local development working out of the box.
 */
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default API_URL;
