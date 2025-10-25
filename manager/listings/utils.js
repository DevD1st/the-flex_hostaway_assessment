const API_BASE_URL = "https://the-flex-yusuf-hostaway-backend.onrender.com";

/**
 * Show error popup
 */
function showError(message) {
  const popup = document.createElement("div");
  popup.className = "error-popup";
  popup.textContent = message;
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.classList.add("hide");
    setTimeout(() => popup.remove(), 300);
  }, 3000);
}

/**
 * Show success toast
 */
function showToast(message) {
  const popup = document.createElement("div");
  popup.className = "toast-popup";
  popup.textContent = message;
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.classList.add("hide");
    setTimeout(() => popup.remove(), 300);
  }, 2500);
}

/**
 * Toggle loading overlay
 */
function toggleLoading(show) {
  const existingOverlay = document.querySelector(".loading-overlay");
  if (show && !existingOverlay) {
    const overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
  } else if (!show && existingOverlay) {
    existingOverlay.remove();
  }
}

/**
 * Convert 24h time to AM/PM
 */
function convertTo12Hour(hour) {
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}${period}`;
}

/**
 * Convert rating from 0-10 scale to 0-5 scale
 */
function getStarRating(rating) {
  return (rating / 2).toFixed(2);
}

export {
  API_BASE_URL,
  showError,
  showToast,
  toggleLoading,
  convertTo12Hour,
  getStarRating,
};
