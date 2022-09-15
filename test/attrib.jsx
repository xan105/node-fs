import { win32 } from "../lib/index.js";

const file = "./attrib.js";

console.log ( await win32.isReadOnly(file) );
await win32.setReadOnly(file);
console.log ( await win32.isReadOnly(file) );
await win32.removeReadOnly(file);
console.log ( await win32.isReadOnly(file) );