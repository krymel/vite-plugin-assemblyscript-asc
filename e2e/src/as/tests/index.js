import assert from "assert";
import { add } from "../build/assembly.js";
assert.strictEqual(add(3, 4), 7);
console.log("ok");
