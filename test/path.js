import test from "node:test";
import assert from "node:assert/strict";
import nodePath from "node:path";
import { path } from "../lib/index.js";

test("path", async ()=>{
  
  await test("__dirname", async ()=>{
    const a = nodePath.resolve("./test");
    const b = path.dirname(import.meta.url);
    assert.equal(a,b);
  });

  await test("isRoot", async ()=>{
    assert.ok(path.isRoot("C:\\"));
    assert.ok(path.isRoot("/"));
    
    assert.ok(!path.isRoot("C:\\Users\\Public"));
    assert.ok(!path.isRoot("/home"));
    assert.ok(!path.isRoot("./"));
  });
  
  await test("isBasename", async ()=>{
    assert.ok(path.isBasename("foo.ext"));
    assert.ok(path.isBasename("foo"));
    
    assert.ok(!path.isBasename("/path/to/foo"));
    assert.ok(!path.isBasename("path/foo"));
    assert.ok(!path.isBasename("./foo"));
  });
  
});