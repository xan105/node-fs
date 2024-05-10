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
import { createHash } from "node:crypto";
import { parse, join} from "node:path";
import { isString, isObj } from "@xan105/is";
import {
  asStringNotEmpty,
  asArrayOfStringNotEmpty,
  asIntegerPositive,
  asBoolean,
  asRegExp
} from "@xan105/is/opt";
import { shouldStringNotEmpty, shouldObj } from "@xan105/is/assert";
import { attempt } from "@xan105/error";
import { resolve, normalize } from "./path.js";

async function readFile(filePath, options){

  if (isString(options)) options = { encoding: options };
  
  const data = await fs.readFile(filePath, options);

  if (
    options?.encoding?.toLowerCase().startsWith("utf") && 
    isString(data) && data.charCodeAt(0) === 0xFEFF //BOM
  ) 
    return data.slice(1);
  else 
    return data;
}

async function readJSON(filePath){
  const data = await readFile(filePath, { encoding: "utf8" });
  return JSON.parse(data, function(key, value) {
    if (key === "__proto__") return; //not allowed
    if(isObj(value))
      return Object.assign(Object.create(null), value);
    else
      return value;
  });
}

async function writeFile(filePath, data, options){
  
  if (isString(options)) options = { encoding: options };
  if (options){
    options.encoding ||= "utf8";
    if (options.bom === true && options.encoding?.toLowerCase().startsWith("utf") && isString(data)) data = "\ufeff" + data;
    delete options.bom;
  }

  await mkdir(parse(filePath).dir);
  await fs.writeFile(filePath, data, options);
  return filePath;
}

async function writeJSON(filePath, data, option = {}){
  
  shouldObj(option);
  const options = {
    pretty: asBoolean(option.pretty) ?? true,
    bigint2str: asBoolean(option.bigint2str) ?? true
  };

  const str = JSON.stringify(data, function(key, value) {
    if(options.bigint2str && typeof value === "bigint")
      return value.toString();
    else
      return value;
  }, options.pretty ? 2 : 0);
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

  shouldObj(option);
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

const mkdir = (dirPath) => fs.mkdir(dirPath, { recursive: true });

async function rm(path){
  await attempt(fs.rm, [path, { recursive: true, force: true }]);
}

function hashFile(filePath, option = {}){
  return new Promise((resolve, reject) => {
  
    //backward compability
    if (isString(option)) option = { algo: option };
  
    shouldObj(option);
    const options = {
      algo: asStringNotEmpty(option.algo) ?? "sha256",
      base64: asBoolean(option.base64) ?? false
    };
  
    shouldStringNotEmpty(filePath);
    
    const sum = createHash(options.algo);
    const stream = createReadStream(filePath);

    stream
    .on("error", (err) => {
      return reject(err);
    })
    .on("data", (chunk) => {
      try {
        sum.update(chunk);
      } catch (err) {
        return reject(err);
      }
    })
    .on("end", () => {
      const encoding = options.base64 ? "base64" : "hex";
      return resolve(sum.digest(encoding));
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
  shouldObj(option);
  
  const options = {
    verbose: asBoolean(option.verbose) ?? false,
    recursive: asBoolean(option.recursive) ?? false,
    absolute: asBoolean(option.absolute) ?? false,
    follow: asBoolean(option.follow) ?? false,
    normalize: asBoolean(option.normalize) ?? false,
    ignore: {
      dir: asBoolean(option.ignore?.dir) ?? false,
      file: asBoolean(option.ignore?.file) ?? false,
      symlink: asBoolean(option.ignore?.symlink) ?? false,
      socket: asBoolean(option.ignore?.socket) ?? false,
      dot: asBoolean(option.ignore?.dot) ?? true
    },
    filter: asArrayOfStringNotEmpty(option.filter) ?? [],
    whitelist: asBoolean(option.whitelist) ?? false,
    ext: asArrayOfStringNotEmpty(option.ext) ?? [],
    pattern: asRegExp(option.pattern)
  };
  
  let result = [];
  
  const [ files = [] ] = await attempt(fs.readdir, [dirPath,{ 
    withFileTypes: true 
  }]);

  for (const file of files)
  /*
  As of this writing fs.opendir() doesn't have the same output as fs.readdir() / fs.lstat().
  => dirent.isSymbolicLink() always returns false on symlink directory.
  => symlink directory are always followed (since .isDirectory() returns true)
  
  const [ files = [] ] = await attempt(fs.opendir, [dirPath]);
  for await (const file of files)
  */
  { 
    if (options.ignore.dot && file.name.startsWith(".")) continue;
    if (!options.whitelist && options.filter.some(el => file.name.includes(el))) continue;

    const entry = {
      name: file.name,
      path: options.absolute ? resolve(join(dirPath, file.name)) : file.name
    };

    if (file.isDirectory())
    {
      if (options.recursive){ 
        const subdir = await ls(join(dirPath, file.name), option);
        if (subdir.length > 0){
          if(!options.absolute) {
            result = result.concat(subdir.map((el) => {
              let path = join(file.name, el.path || el);
              if(options.normalize) path = normalize(path);
              return isObj(el) ? {...el, path} : path;
            }));
          } else {
            result = result.concat(subdir);
          }
        }
      }
      if (options.ignore.dir) continue;
      entry.type = "dir";
    }
    else if (file.isSymbolicLink())
    {
      if (options.ignore.symlink) continue;
      entry.link = (await attempt(fs.readlink,[join(dirPath, file.name)]))[0];
      if (options.follow && entry.link) {
        const subdir = await ls(entry.link, option);
        if (subdir.length > 0){
          if(!options.absolute) {
            result = result.concat(subdir.map((el) => {
              let path = join(file.name, el.path || el);
              if(options.normalize) path = normalize(path);
              return isObj(el) ? {...el, path} : path;
            }));
          } else {
            result = result.concat(subdir);
          }
        }
      }
      entry.type = "symlink";
    } 
    else if (file.isFile())
    {
      if (options.ignore.file) continue;
      entry.ext = parse(file.name).ext.slice(1);
      if (options.ext.length > 0 && !options.ext.includes(entry.ext)) continue;
      entry.type = "file";
    } 
    else if (file.isSocket())
    {
      if (options.ignore.socket) continue;
      entry.type = "socket";
    }
    else continue; 

    if (options.pattern && !options.pattern.test(file.name)) continue;
    if (options.whitelist && !options.filter.some(el => join(dirPath, file.name).includes(el))) continue; 
    
    if(options.normalize) entry.path = normalize(entry.path);
    result.push(options.verbose ? entry : entry.path);  
  }
  
  return result;
}

async function compareFile(a, b, algo = "sha1"){

  shouldStringNotEmpty(a);
  shouldStringNotEmpty(b);

  const stats = await Promise.all([
    fs.stat(a), fs.stat(b)
  ]);
  if(stats[0].size !== stats[1].size) return false;
    
  const checksum = await Promise.all([
    hashFile(a, { algo }), hashFile(b, { algo })
  ]);
  return checksum[0] === checksum[1];
}

async function cp(src, dest){
  await attempt(fs.cp, [src, dest, { force: true, recursive: true }]);
}

export {
  readFile,
  readJSON,
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
  mkdir,
  rm,
  rm as unlink, //alias (backward compatibility)
  rm as deleteFile, //alias (backward compatibility)
  rm as rmdir, //alias (backward compatibility)
  hashFile,
  touch,
  ls,
  compareFile,
  cp
};
