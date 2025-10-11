declare global {
  interface String {
    /**
     * Converts a string to snake case
     * @returns string
     */
    toCapitalize(): string;
  }
}

function capitalize(str?: string) {
  if (str) return str.charAt(0).toUpperCase() + str.slice(1);
}

Object.defineProperty(String.prototype, 'toCapitalize', {
  value: function () {
    return capitalize(this);
  },
  enumerable: false,
  configurable: true,
});

export { capitalize };
