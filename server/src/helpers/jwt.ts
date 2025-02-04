import jwt, { JwtPayload } from 'jsonwebtoken';

export const signToken = (payload: JwtPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1h' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};
