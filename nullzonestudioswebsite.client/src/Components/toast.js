export const showToast = (message, type = "info", duration = 3000) => {
    window.dispatchEvent(new CustomEvent("toast", {
        detail: { message, type, duration }
    }));
};