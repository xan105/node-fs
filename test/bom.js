import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import * as fs from "../lib/index.js";
import { readFile } from "node:fs/promises";

test("bom", async ()=>{
  
  const cwd = join(dirname(fileURLToPath(import.meta.url)), "sample");
  const filePath = join(cwd, "test.txt");
  
  await fs.writeFile(filePath, "hello world", { bom: true, encoding: "utf16le" });
  const txt = await readFile(filePath, "utf16le");
  const txt2 = await fs.readFile(filePath, { encoding: "utf16le" });

  assert.ok(typeof txt === "string" && txt.charCodeAt(0) === 0xFEFF);
  assert.ok(typeof txt2 === "string" && txt2.charCodeAt(0) !== 0xFEFF);

  await fs.rm(cwd); //clean
});

