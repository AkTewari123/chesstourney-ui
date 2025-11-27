const capitalizeFirstLetter = (inputString: string): string => {
  if (typeof inputString !== "string" || inputString.length === 0) {
    return inputString; // Handle empty or non-string inputs
  }
  inputString = inputString.trim().toLowerCase();
  const firstLetter = inputString.charAt(0).toUpperCase();
  const restOfString = inputString.slice(1);
  return firstLetter + restOfString;
};

export { capitalizeFirstLetter };
