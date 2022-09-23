import t from "tap";
import { win32 } from "../lib/index.js";

t.test("read only", async t => {

  const self = "./test/attrib.js";

  await win32.setReadOnly(self);
  t.ok(await win32.isReadOnly(self));

  await win32.removeReadOnly(self);
  t.notOk(await win32.isReadOnly(self));

t.end();
});

t.test("hidden", async t => {

  const self = "./test/attrib.js";

  await win32.setHidden(self);
  t.ok(await win32.isHidden(self));

  await win32.removeHidden(self);
  t.notOk(await win32.isHidden(self));

t.end();
});