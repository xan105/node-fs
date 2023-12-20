import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { isWindows } from "@xan105/is";
import { win32 } from "../lib/index.js";

test("file attrib (win32)", {
  skip: isWindows() ? false : "This test runs on Windows"
}, async ()=>{

  const self = join(dirname(fileURLToPath(import.meta.url)), "attrib.js");

  await test("read only", async ()=>{
    await win32.setReadOnly(self);
    assert.ok(await win32.isReadOnly(self));
    
    await win32.removeReadOnly(self);
    assert.ok(!(await win32.isReadOnly(self)));
  });
  
  await test("hidden", async ()=>{
    await win32.setHidden(self);
    assert.ok(await win32.isHidden(self));

    await win32.removeHidden(self);
    assert.ok(!(await win32.isHidden(self)));
  });

});
