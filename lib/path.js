/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { isAbsolute, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { shouldStringNotEmpty } from "@xan105/is/assert";

function _resolve(path){
  shouldStringNotEmpty(path);
  if (path.startsWith("file://")) path = fileURLToPath(path);
  return isAbsolute(path) ? path : resolve(path);
}

function _dirname(path){
  shouldStringNotEmpty(path);
  if (path.startsWith("file://")) path = fileURLToPath(path);
  return dirname(path);
}

function normalize(path, win32 = false){ 
  shouldStringNotEmpty(path);
  return win32 ? path.replaceAll("/","\\") : path.replaceAll("\\","/");
}

function isRoot(path) {
  shouldStringNotEmpty(path);
  path = path.startsWith("file://") ? fileURLToPath(path) : resolve(path);
  return dirname(path) === path;
}

export { 
  _resolve as resolve,
  _dirname as dirname,
  normalize,
  isRoot
};