/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { 
  promises as fs, 
  constants,
  createReadStream 
} from "node:fs";
import { parse, join } from "node:path";
import { resolve, isRoot } from "./path.js";
import { createHash } from "node:crypto";
import { isString } from "@xan105/is";
import {
  asStringNotEmpty,
  asArrayOfStringNotEmpty,
  asIntegerPositive,
  asBoolean
} from "@xan105/is/opt";
import { shouldStringNotEmpty } from "@xan105/is/assert";
import { Failure, attempt } from "@xan105/error";

async function readFile(filePath, options){
  let warn;

  if (isString(options)) options = { encoding: options};
  if (options){
    warn = asBoolean(options.bomWarning) ?? true;
    delete options.bomWarning;
  }
  
  const data = await fs.readFile(filePath, options);

  if (options && options.encoding &&
      options.encoding.toLowerCase().startsWith("utf") && 
      isString(data) &&
      data.charCodeAt(0) === 0xFEFF) //BOM
  {
    if (warn) console.warn(`Stripped UTF BOM from "${filePath}"; Use options: {encoding: "utf...", bom: true} with writeFile() to restore it.`);
    return data.slice(1);
  }
  else return data;
}

async function readJSON(filePath){
  const data = await readFile(filePath, { encoding: "utf8", bomWarning: false });
  return JSON.parse(data);
}

const mkdir = (dirPath) => fs.mkdir(dirPath, { recursive: true });

async function writeFile(filePath, data, options){
  
  if (isString(options)) options = { encoding: options};
  if (options){
    options.encoding ||= "utf8";
    if (options.bom === true && options.encoding.toLowerCase().startsWith("utf") && isString(data)) data = "\ufeff" + data;
    delete options.bom;
  }

  await mkdir(parse(filePath).dir);
  await fs.writeFile(filePath, data, options);
  return filePath;
}

async function writeJSON(filePath, data, pretty = true){
  const str = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  await writeFile(filePath, str, "utf8");
  return filePath;
}

async function copyFile(src, dest, flags){
  await mkdir(parse(dest).dir);
  await fs.copyFile(src, dest, flags); 
}

async function mv(oldPath, newPath){
  await mkdir(parse(newPath).dir);
  const [, err] = await attempt(fs.rename, [oldPath, newPath]);
  if (err?.code === "EXDEV"){
    await fs.copyFile(oldPath, newPath);
    await rm(oldPath);
  }
  return newPath;
}

async function exists(path) {
  const [, err] = await attempt(fs.access, [path, constants.F_OK]);
  return Boolean(!err);
}

async function existsAndIsOlderOrYoungerThan(path, option = {}){

  const options = {
    time: asIntegerPositive(option.time) ?? 1,
    timeUnit: asStringNotEmpty(option.timeUnit) ?? 'd',
    younger: asBoolean(option.younger) ?? false
  };
    
  const [stats, err] = await attempt(fs.stat, [path]);
  if(err) return false;
    
  const lifespan = {
    age: new Date().getTime() - stats.mtimeMs,
    as: function(timeUnit) {
      switch(timeUnit) 
      {
        case "s": return this.age / 1000 //sec
        case "m": return this.age / (1000 * 60) //min
        case "h": return this.age / (1000 * 60 * 60) //hour
        case "d": return this.age / (1000 * 60 * 60 * 24) //day
        case "w": return this.age / (1000 * 60 * 60 * 24 * 7) //week
        case "M": return this.age / 2628000000 //month
        case "Y": return this.age / (2628000000 * 12) //year
        default: return this.age / (1000 * 60 * 60 * 24) //day
      }
    }
  };
    
  const time = lifespan.as(options.timeUnit);
  return options.younger ? time <= options.time : time >= options.time;
}

function existsAndIsOlderThan(path, option = {}){
	option.younger = false;
	return existsAndIsOlderOrYoungerThan(path, option);
}

function existsAndIsYoungerThan(path, option = {}){
	option.younger = true;
	return existsAndIsOlderOrYoungerThan(path, option);
}

async function stat(path) {
  const [ stats = {} ] = await attempt(fs.stat, [path]);
  return stats;
}

async function rm(path){
  const [, err] = await attempt(fs.rm, [path]);
  if (err?.code === "ENOTEMPTY"){
    const files = await fs.readdir(path);
    for (const { name } of files) await rm(join(path, name));
    await attempt(fs.rm, [path]);
  }
}

function hashFile(filePath, algo = "sha1"){
  let sum = createHash(algo);
  let stream = createReadStream(filePath);
  
  return new Promise((resolve, reject) => {
    stream
    .on('error', (err) => {
      return reject(err);
    })
    .on('data', (chunk) => {
      try {
        sum.update(chunk);
      } catch (err) {
        return reject(err);
      }
    })
    .on('end', () => {
      return resolve(sum.digest('hex'));
    });
  });
}

async function touch(filePath){
  
  shouldStringNotEmpty(filePath);
  
  const file = await fs.open(filePath, "a");
  const time = new Date();
  file.utimes(time, time);
  file.close();
}

async function ls(dirPath, option = {}) {
  
  shouldStringNotEmpty(dirPath);
  
  const options = {
    excludeDir: asBoolean(option.excludeDir) ?? false,
    excludeFile: asBoolean(option.excludeFile) ?? false,
    ignoreSymlink: asBoolean(option.ignoreSymlink) ?? false,
    ignoreDotFile: asBoolean(option.ignoreDotFile) ?? false,
    recursive: asBoolean(option.recursive) ?? false,
    absolute: asBoolean(option.absolute) ?? false,
    filter: asArrayOfStringNotEmpty(option.filter) ?? [],
    allowedExt: asArrayOfStringNotEmpty(option.allowedExt) ?? []
  };
  
  let result = [];
  
  const [ files = [] ] = await attempt(fs.readdir,[dirPath,{ 
    withFileTypes: true 
  }]);
  
  for (const file of files) 
  {
    if (options.ignoreSymlink && file.isSymbolicLink()) continue;
    if (options.ignoreDotFile && file.name.startsWith(".")) continue;
      
    if (options.filter.includes(file.name)) continue;
      
    if (file.isDirectory()){
      if (options.recursive){ 
        const subdir = await ls(join(dirPath, file.name), option);
        if (subdir.length > 0) result = result.concat(subdir);
      }
      if (options.excludeDir) continue;
    }
    else if (file.isFile()){
      if (options.excludeFile) continue;
      const ext = parse(file.name).ext.slice(1);
      if (options.allowedExt.length > 0 && !options.allowedExt.includes(ext)) continue;
    }
    result.push(options.absolute ? resolve(join(dirPath, file.name)) : file.name);   
  }
  
  return result;
}

export {
  readFile,
  readJSON,
  mkdir,
  writeFile,
  writeJSON,
  copyFile,
  mv,
  exists,
  existsAndIsOlderOrYoungerThan,
  existsAndIsOlderThan,
  existsAndIsYoungerThan,
  stat,
  stat as stats, //alias (backward compatibility)
  rm,
  rm as unlink, //alias (backward compatibility)
  rm as deleteFile, //alias (backward compatibility)
  rm as rmdir, //alias (backward compatibility)
  hashFile,
  touch,
  ls
};