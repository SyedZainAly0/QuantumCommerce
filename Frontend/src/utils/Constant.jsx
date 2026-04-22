export const BASEURL = "http://localhost:8000";

export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const emailRegex = /^[^\s@]+@[^\s@]+\.[cC][oO][mM]$/;

export const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
