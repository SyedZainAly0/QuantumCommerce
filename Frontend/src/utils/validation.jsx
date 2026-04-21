export const emailRegex = /^[^\s@]+@[^\s@]+\.[cC][oO][mM]$/;

export const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export const validateAuthForm = (form) => {
    let newErrors = {};

    const name = form.full_name.trim();

    if (!name || name.length < 3 || !/^[A-Za-z\s]+$/.test(name)) {
        newErrors.full_name =
            "Name must be at least 3 characters and contain only letters";
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


