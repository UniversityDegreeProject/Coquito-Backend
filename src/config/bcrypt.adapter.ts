import { hash, compare, genSaltSync } from 'bcryptjs';

export const bcrypt = {
  hash:  (password: string) => {
    const salt = genSaltSync(10);
    return  hash(password, salt);
  },
  compare:  (password: string, hash: string) => {
    return  compare(password, hash);
  },
};
