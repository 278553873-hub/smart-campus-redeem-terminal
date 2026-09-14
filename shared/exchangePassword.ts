export const EXCHANGE_PASSWORD_LENGTH = 6;

export const sanitizeExchangePassword = (value: string) => (
  value.replace(/\D/g, '').slice(0, EXCHANGE_PASSWORD_LENGTH)
);

export const isValidExchangePassword = (value: string) => (
  new RegExp(`^\\d{${EXCHANGE_PASSWORD_LENGTH}}$`).test(value)
);

export const maskExchangePassword = (value: string) => (
  value ? '•'.repeat(EXCHANGE_PASSWORD_LENGTH) : '未设置'
);
