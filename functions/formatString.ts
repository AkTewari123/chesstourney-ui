export const formatString = (raw: string): { [key: string]: string } => {
  const lines = raw.trim().split("\n");

  const result: {
    [key: string]: string;
  } = {};

  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      result[obj.id] = obj.name;
    } catch (err) {
      console.error("Bad JSON line:", line);
    }
  }
  return result;
};
