import { randomBytes } from 'crypto';

const token = randomBytes(256).toString('base64');
console.log(token);
