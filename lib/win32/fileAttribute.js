/*
MIT License

Copyright (c) 2018-2022 Anthony Beaumont

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Failure } from "@xan105/error";
import { shouldWindows } from "@xan105/is/assert";
import { exists } from "../fs.js";
import { resolve } from "../path.js";

const validAttributes = ["R","A","S","H","O","I","X","V","P","U","B"];
/*
	+   add.
	-   remove.
		
	R   Read-Only.
	A   Archive.
	S   System File.
	H   Hidden.
	O   Offline.
	I   Not Content Indexed.
	X   No scrub file attribute.
	V   Integrity attribute.
	P   Pinned.
	U   Unpinned.
	B   SMR blob.  
*/

async function attrib(path, attributes = []){
  
  shouldWindows();
  if (!await exists(path)) throw new Failure("Target path does not exist","ERR_INVALID_ARGS"); 

  if (attributes.length > 0) {
    for (const attribute of attributes) {
      if (!validAttributes.some(attr => (attribute === `+${attr}`) || (attribute === `-${attr}`)) )
        throw new Failure("Invalid Attribute(s)","ERR_INVALID_ARGS");
    }
	}
	
	attributes.push(resolve(path));

  const cmd = await promisify(execFile)("attrib", attributes, {windowsHide: true});
	if (cmd.stderr) throw new Failure(cmd.stderr, "ERR_UNEXPECTED");
	return cmd.stdout;
}

async function getCurrentAttrib(path){
	const stdout = await attrib(path);
  return stdout.replace(resolve(path),"").replace(/\s/g,"").split("");
}

async function hasAttrib(path, attributes){

	let result = [];
	const current = await getCurrentAttrib(path);
	
	for (const attribute of attributes) { 
		if (!validAttributes.some(attr => attribute === attr)) 
      throw new Failure("Invalid Attribute(s)","ERR_INVALID_ARGS");
		result.push(current.includes(attribute)); 
	}
	
	return !result.includes(false);
}

async function setHidden(path){ 
    const current = await getCurrentAttrib(path);
    if (current.includes("H")) return;

    await attrib(path,current.map(attr => "+" + attr ).concat(["+H"]));
}

async function removeHidden(path){
	const current = await getCurrentAttrib(path);
  if (!current.includes("H")) return;
  else current.splice(current.indexOf("H"), 1 );

  await attrib(path,current.map(attr => "+" + attr).concat(["-H"]));
}

async function setReadOnly(path){
	const current = await getCurrentAttrib(path);
	if (current.includes("R")) return;
	if (current.includes("H")) await attrib(path,["-H"]);

	await attrib(path,current.map(attr => "+" + attr).concat(["+R"]));
}

async function removeReadOnly(path){ 
    const current = await getCurrentAttrib(path);
    if (!current.includes("R")) return;
    else current.splice(current.indexOf("R"), 1 );
    if (current.includes("H")) await attrib(path,["-H"]);

    await attrib(path,current.map(attr => "+" + attr).concat(["-R"]));
}

function isHidden(path){ return hasAttrib(path,["H"]) }
function isReadOnly(path){ return hasAttrib(path,["R"]) }
function isHiddenAndReadOnly(path){ return hasAttrib(path,["H","R"]) }

export {
  setHidden,
  removeHidden,
  setReadOnly,
  removeReadOnly,
  isHidden,
  isReadOnly,
  isHiddenAndReadOnly
};