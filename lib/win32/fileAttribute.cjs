/*
MIT License

Copyright (c) 2018-2020 Anthony Beaumont

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

"use strict";

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util'); 

const validAttribute = ["R","A","S","H","O","I","X","V","P","U","B"];
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

const attrib = module.exports = async (target, attributes) => {

	for (const attribute of attributes) 
		if (!validAttribute.some(attr => (attribute === `+${attr}`) || (attribute === `-${attr}`)) )
			throw ("EINVALIDATTRIBUTE");
	
	if (! await exists(target)) throw "ENOTEXISTS";

    const output = await util.promisify(exec)(`attrib ${attributes.join(" ")} "${path.resolve(target)}"`,{windowsHide: true});
	if (output.stderr) throw output.stderr;
}

const currentAttrib = module.exports.getCurrent = async (target) => {

	if (! await exists(target)) throw "ENOTEXISTS";
	
	const output = await util.promisify(exec)(`attrib "${path.resolve(target)}"`,{windowsHide: true});
    if (output.stderr) throw output.stderr;
    const result = output.stdout.replace(path.resolve(target),"").replace(/\s/g,'').split("");
	return result;
}

const hasAttrib = module.exports.has = async (target, attributes) => {

	if (! await exists(target)) throw "ENOTEXISTS";
	
	let result = [];
	const current = await currentAttrib(target);
	
	for (const attribute of attributes) { 
		if (!validAttribute.some(attr => (attribute === `+${attr}`) || (attribute === `-${attr}`)) ) throw ("EINVALIDATTRIBUTE");
		result.push(current.includes(attribute)); 
	}
	
	return !result.includes(false);
}

module.exports.isHidden = (target) => { return hasAttrib(target,"H") }

module.exports.setHidden = async (target) => { 

    const current = await currentAttrib(target);
    if (current.includes("H")) return;

    await attrib(target,current.map(function(attr) { return '+' + attr; }).concat(["+H"]));
}

module.exports.removeHidden = async (target) => { 
  
	const current = await currentAttrib(target);
    
    if (!current.includes("H")) return;
    else current.splice(current.indexOf("H"), 1 );

    await attrib(target,current.map(function(attr) { return '+' + attr; } ).concat(["-H"]));
}

module.exports.isReadOnly = (target) => { return hasAttrib(target,"R") }

module.exports.setReadOnly = async (target) => { 

	const current = await currentAttrib(target);
	if (current.includes("R")) return;
	if (current.includes("H")) await attrib(target,"-H");

	await attrib(target,current.map(function(attr) { return '+' + attr; }).concat(["+R"]));
}

module.exports.removeReadOnly = async (target) => { 

    const current = await currentAttrib(target);
    
    if (!current.includes("R")) return;
    else current.splice(current.indexOf("R"), 1 );
    if (current.includes("H")) await attrib(target,"-H");

    await attrib(target,current.map(function(attr) { return '+' + attr; }).concat(["-R"]));
}

function exists (target) {
   return new Promise((resolve) => {
      fs.promises.access(target, fs.constants.F_OK).then(() => resolve(true)).catch(() => resolve(false));
   });
}