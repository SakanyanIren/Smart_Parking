// 5 USD = 200 AMD → 1 USD = 40 AMD
const USD_TO_AMD_RATE = 40;

export const usdToAmd = (usd) => Math.round(usd * USD_TO_AMD_RATE);

export const formatAmd = (usd) => `${usdToAmd(usd).toLocaleString()} ֏`;
