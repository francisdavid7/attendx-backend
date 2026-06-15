import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
  return bcrypt.hash(String(password), 10);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
) => {
  return bcrypt.compare(String(password.trim()), hashedPassword);
};
