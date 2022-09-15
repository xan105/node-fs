import t from "tap";
import nodePath from "node:path";
import { path } from "../lib/index.js";

t.test("__dirname", t => {

  const a = nodePath.resolve("./test");
  const b = path.dirname(import.meta.url);
  
  t.strictSame(a,b);

t.end();
});