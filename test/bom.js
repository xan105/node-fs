import * as fs from "../lib/index.js";
import { readFile } from "node:fs/promises";

await fs.writeFile("./sample/test.txt","hello world", { bom: true, encoding: "utf16le" });
const txt = await fs.readFile("./sample/test.txt","utf16le");
console.log(txt);

await fs.writeFile("./sample/test.json",JSON.stringify({hello: "world"}, null, 2), { bom: true, encoding: "utf8" }); //doesn't respect json spec
await fs.writeFile("./sample/test2.json",JSON.stringify({hello: "world"}, null, 2), { encoding: "utf8" });
const buffer = await fs.readFile("./sample/test.json");
const buffer2 = await fs.readFile("./sample/test2.json");
console.log(buffer);
console.log(buffer2);
const json = await fs.readJSON("./sample/test.json");
console.log(json);

try{
  const json2 = JSON.parse( await readFile("./sample/test.json", "utf8") );
  console.log(json2);
}catch(e){
  console.log(`expected error: ${e}`);
}

await fs.rmdir("./sample"); //clean