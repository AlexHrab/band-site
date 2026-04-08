const TOAST_ID = "app-toast";

export function showToast(message, variant = "dark") {
  const existingToast = document.getElementById(TOAST_ID);
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.id = TOAST_ID;
  toast.textContent = message;
  toast.className = `app-toast app-toast--${variant}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
