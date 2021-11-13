import * as fs from "../lib/esm.js";

await fs.writeFile("./sample/test.txt","hello world", { bom: true, encoding: "utf16le" });
const txt = await fs.readFile("./sample/test.txt","utf16le");
console.log(txt);

await fs.rmdir("./sample"); //clean