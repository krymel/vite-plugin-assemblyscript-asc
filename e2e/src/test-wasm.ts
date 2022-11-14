import { add } from "./as/build/assembly";

const result = add(3, 4)
if (result !== 7) {
  console.error(`
          Expected 7
          but got ${result}`);
}
