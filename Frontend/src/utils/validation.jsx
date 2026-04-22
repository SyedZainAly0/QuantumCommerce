import { ALLOWED_TYPES, MAX_FILE_SIZE, emailRegex, passwordRegex } from "./Constant";


// Register - Login Validation
export const validateAuthForm = (form) => {
    let newErrors = {};
    if ('full_name' in form) {
        const name = (form.full_name || '').trim();
        if (!name || name.length < 3 || !/^[A-Za-z\s]+$/.test(name)) {
            newErrors.full_name =
                "Name must be at least 3 characters and contain only letters";
        }
    }

    if (!emailRegex.test(form.email)) {
        newErrors.email = "Email must be valid";
    }

    if (!passwordRegex.test(form.password)) {
        newErrors.password =
            "Password must be 8+ chars with uppercase, lowercase, number & special char";
    }

    return newErrors;
};


// Image Size and Format Validation
export function validateImageFile(file) {
    const errors = [];


    if (file.size > MAX_FILE_SIZE) {
        errors.push(`File too large. Max 5MB (yours: ${(file.size / 1024 / 1024).toFixed(2)}MB).`);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push('File type not allowed. Use: jpg, jpeg, png, webp');
    }

    return errors;
}