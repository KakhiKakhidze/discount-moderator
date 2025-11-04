import Cookies from 'js-cookie';
import { getConfig, isProduction } from '../config/environment';

// Cookie configuration
const COOKIE_CONFIG = {
  expires: 7, // 7 days
  secure: isProduction, // HTTPS only in production
  sameSite: 'lax', // More permissive for development
  path: '/', // Available across the app
  domain: getConfig().COOKIE_DOMAIN, // Use environment-specific domain
};

// Moderator/Staff session cookie names
export const MODERATOR_COOKIES = {
  TOKEN: 'moderatorToken',
  USER: 'moderatorUser',
  PERMISSIONS: 'moderatorPermissions',
};

// Set a cookie with moderator configuration
export const setModeratorCookie = (name, value, options = {}) => {
  Cookies.set(name, value, { ...COOKIE_CONFIG, ...options });
};

// Get a cookie value
export const getModeratorCookie = (name) => {
  return Cookies.get(name);
};

// Remove a cookie
export const removeModeratorCookie = (name) => {
  Cookies.remove(name, { path: '/' });
};

// Clear all moderator cookies
export const clearAllModeratorCookies = () => {
  Object.values(MODERATOR_COOKIES).forEach(cookieName => {
    removeModeratorCookie(cookieName);
  });
};

// Check if moderator is authenticated
export const isModeratorAuthenticated = () => {
  const token = getModeratorCookie(MODERATOR_COOKIES.TOKEN);
  const user = getModeratorCookie(MODERATOR_COOKIES.USER);
  return !!(token && user);
};

// Get moderator token
export const getModeratorToken = () => {
  return getModeratorCookie(MODERATOR_COOKIES.TOKEN);
};

// Get moderator user data
export const getModeratorUser = () => {
  const userData = getModeratorCookie(MODERATOR_COOKIES.USER);
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing moderator user data:', error);
      return null;
    }
  }
  return null;
};

// Get moderator permissions
export const getModeratorPermissions = () => {
  const permissions = getModeratorCookie(MODERATOR_COOKIES.PERMISSIONS);
  if (permissions) {
    try {
      return JSON.parse(permissions);
    } catch (error) {
      console.error('Error parsing moderator permissions:', error);
      return [];
    }
  }
  return [];
};

// Set moderator session data
export const setModeratorSession = (token, user, permissions) => {
  setModeratorCookie(MODERATOR_COOKIES.TOKEN, token);
  setModeratorCookie(MODERATOR_COOKIES.USER, JSON.stringify(user));
  setModeratorCookie(MODERATOR_COOKIES.PERMISSIONS, JSON.stringify(permissions));
};

export default {
  setModeratorCookie,
  getModeratorCookie,
  removeModeratorCookie,
  clearAllModeratorCookies,
  isModeratorAuthenticated,
  getModeratorToken,
  getModeratorUser,
  getModeratorPermissions,
  setModeratorSession,
};
