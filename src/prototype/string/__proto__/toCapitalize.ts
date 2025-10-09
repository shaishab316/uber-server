declare global {
  interface String {
    /**
     * Converts a string to snake case
     * @returns string
     */
    toCapitalize(): string;
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

Object.defineProperty(String.prototype, 'toCapitalize', {
  value: capitalize,
  enumerable: false,
  configurable: true,
});

export { capitalize };
