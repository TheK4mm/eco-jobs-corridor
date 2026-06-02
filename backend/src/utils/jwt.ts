import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import type { AuthPayload } from '../types/common';

export function signToken(payload: AuthPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, config.jwt.secret, options);
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, config.jwt.secret) as AuthPayload;
}
