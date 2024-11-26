export const roundToDecimals = (num: number, decimals: number) => {
  const factor = Math.pow(10, decimals);

  return Math.round(num * factor) / factor;
};

export const roundToMultiple = (num: number, multiple: number) => {
  return Math.round(num / multiple) * multiple;
};

export const getRandomBoolean = () => {
  return Math.random() < 0.5;
};
