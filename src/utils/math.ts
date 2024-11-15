export const TWO_PI = Math.PI * 2;

export const radToDeg = (radians: number) => radians * (180 / Math.PI);

export const degToRad = (degrees: number) => degrees * (Math.PI / 180);

/**
 * @param xRotation angle in radians
 * @param yRotation angle radians
 * @returns value between -1 and 1
 */
export const calculateZAxisProjection = (
  xRotation: number,
  yRotation: number
) => {
  return Math.cos(xRotation) * Math.cos(yRotation);
};
