/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { shouldWindows, shouldStringNotEmpty } from "@xan105/is/assert";

function sanitizeFileName(string) {
 
 shouldWindows();
 shouldStringNotEmpty(string);
 
 const invalid = new RegExp(/([\\\/:,\*\?"<>|\n\r\t])/, 'g');
 
 string = string.replace(invalid,""); //remove invalid
 string = string.replace(/\s{2,}/g, ' '); //replace double space by single space
 string = string.trim(); //remove leading and trailing space
 
 return string;
}

export { sanitizeFileName };