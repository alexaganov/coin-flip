export const hasOnlyEmptyStrings = (obj: object): boolean => {
  return Object.values(obj).every((value) => {
    if (!!value && typeof value === "object") {
      return hasOnlyEmptyStrings(value);
    }

    return typeof value === "string" && !value;
  });
};
