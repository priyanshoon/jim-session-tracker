import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function encryptPassword(password: string) {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  return hash;
}

export async function checkPassword(password: string, hash: string) {
  const isValid = await bcrypt.compare(password, hash);
  return isValid;
}
