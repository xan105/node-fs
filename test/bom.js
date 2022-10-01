import t from "tap";
import * as fs from "../lib/index.js";
import { readFile } from "node:fs/promises";

t.test("bom", async t => {

  await fs.writeFile("./test/sample/test.txt", "hello world", { bom: true, encoding: "utf16le" });
  const txt = await readFile("./test/sample/test.txt", "utf16le");
  const txt2 = await fs.readFile("./test/sample/test.txt", { encoding: "utf16le" });

  t.ok(typeof txt === "string" && txt.charCodeAt(0) === 0xFEFF);
  t.ok(typeof txt2 === "string" && txt2.charCodeAt(0) !== 0xFEFF);

  await fs.rm("./test/sample"); //clean

t.end();
});

