export const roundToDecimals = (number: number, decimals: number) => {
  const factor = Math.pow(10, decimals);

  return Math.round(number * factor) / factor;
};
