import bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}
