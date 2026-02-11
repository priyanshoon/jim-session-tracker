const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!emailRegex.test(email.trim())) {
    return "Enter a valid email address.";
  }

  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Use at least one letter and one number.";
  }

  return null;
}

export function validateName(name: string): string | null {
  if (name.trim().length < 2) {
    return "Name must be at least 2 characters.";
  }

  return null;
}
