import { API_BASE_URL } from '../lib/api';

/**
 * Opens a popup window for Google OAuth authentication
 */
export const openLoginPopup = (): void => {
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    `${API_BASE_URL}/oauth2/authorization/google`,
    'Google Sign In',
    `width=${width},height=${height},left=${left},top=${top},popup=yes`
  );

  if (!popup) {
    console.error('Popup was blocked. Please allow popups for this site.');
    return;
  }

  const checkPopupClosed = setInterval(() => {
    if (popup.closed) {
      clearInterval(checkPopupClosed);
    }
  }, 500);
};
