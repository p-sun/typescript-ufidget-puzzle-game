/* -------------------------------------------------------------------------- */
/*                 Embed the key under a property in a record                 */
/* -------------------------------------------------------------------------- */

export function embedKeyInProperty<Info extends Record<string, unknown>>() {
  return <Property extends string, R extends Record<string, Omit<Info, Property>>>(k: Property, r: R) => {
    const result = {};
    for (const item of Object.keys(r)) {
      result[item] = { ...r[item], [k]: item };
    }
    return result as { [K in keyof R]: R[K] & { [k in Property]: K } };
  };
}

/* --------------------------------- Example -------------------------------- */
const example = embedKeyInProperty<{ units: number }>()('displayName', {
  apples: { units: 6 },
  pears: { units: 3 },
});
type exampleExpected = {
  apples: { units: number; displayName: 'apples' };
  pears: { units: number; displayName: 'pears' };
};
const example_test: typeof example extends exampleExpected ? true : false = true;
