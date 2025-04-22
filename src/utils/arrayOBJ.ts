function toSingle<T>(value: T | T[], defaultValue?: T): T {
    if (value == null) {
      throw new Error("Input cannot be null or undefined");
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        if (defaultValue === undefined) {
          throw new Error("Cannot convert empty array to single value");
        }
        return defaultValue;
      }
      return value[0];
    }
    return value;
  }
  function toArray<T>(value: T | T[]): T[] {
    if (value == null) {
      throw new Error("Input cannot be null or undefined");
    }
    return Array.isArray(value) ? value : [value];
  }
export { 
  toSingle,
  toArray
}