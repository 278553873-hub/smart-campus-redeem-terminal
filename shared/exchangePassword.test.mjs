import assert from 'node:assert/strict';
import {
  EXCHANGE_PASSWORD_LENGTH,
  isValidExchangePassword,
  maskExchangePassword,
  sanitizeExchangePassword,
} from './exchangePassword.ts';

assert.equal(EXCHANGE_PASSWORD_LENGTH, 6);
assert.equal(sanitizeExchangePassword('12a34-5678'), '123456');
assert.equal(sanitizeExchangePassword(' 246810 '), '246810');
assert.equal(isValidExchangePassword('246810'), true);
assert.equal(isValidExchangePassword('12345'), false);
assert.equal(isValidExchangePassword('12345a'), false);
assert.equal(maskExchangePassword('246810'), '••••••');
assert.equal(maskExchangePassword(''), '未设置');

console.log('exchange password shared assertions passed');

