/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { isAbsolute, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

function _resolve(path){
  return isAbsolute(path) ? path : resolve(path);
}

function _dirname(path){
  const isFileURL = path.startsWith("file:///");
  return isFileURL ? dirname(fileURLToPath(path)) : dirname(path);
}

function normalize(path, win32 = false){ 
  if (win32)
    return path.replaceAll("/","\\");
  else
    return path.replaceAll("\\","/");
}

export { 
  _resolve as resolve,
  _dirname as dirname,
  normalize
};