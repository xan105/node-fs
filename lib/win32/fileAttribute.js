/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Failure, attempt } from "@xan105/error";
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

  const [cmd, err] = await attempt(promisify(execFile),["attrib", attributes, {windowsHide: true}]);
	if (err || cmd.stderr) throw new Failure(err?.stderr || cmd.stderr, "ERR_UNEXPECTED");
	return cmd;
}

async function getCurrentAttrib(path){
	const { stdout } = await attrib(path);
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