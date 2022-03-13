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
import { createHash } from "node:crypto";
import { isString } from "@xan105/is";

async function readFile(filePath, options){
  let warnOnBomRemoval;

  if (isString(options)) options = { encoding: options};
  if (options){
    warnOnBomRemoval = options.bomWarning ?? true;
    delete options.bomWarning;
  }
  
  const data = await fs.readFile(filePath, options);

  if (options && options.encoding &&
      options.encoding.toLowerCase().startsWith("utf") && 
      isString(data) &&
      data.charCodeAt(0) === 0xFEFF) //BOM
  {
    if (warnOnBomRemoval) console.warn(`Stripped UTF BOM from "${filePath}"; Use options: {encoding: "utf...", bom: true} with writeFile() to restore it.`);
    return data.slice(1);
  }
  else return data;
}

async function readJSON(filePath){
  const data = await readFile(filePath, { encoding: "utf8", bomWarning: false });
  return JSON.parse(data);
}

async function writeFile(filePath, data, options){
  
  if (isString(options)) options = { encoding: options};
  if (options){
    options.encoding ||= "utf8";
    if (options.bom === true && options.encoding.toLowerCase().startsWith("utf") && isString(data)) data = "\ufeff" + data;
    delete options.bom;
  }

  await fs.mkdir(parse(filePath).dir, { recursive: true });
  await fs.writeFile(filePath, data, options);
  return filePath;
}

async function writeJSON(filePath, data, pretty = true){
  const str = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  await writeFile(filePath, str, "utf8");
  return filePath;
}

async function copyFile(src, dest, flags){
  await fs.mkdir(parse(dest).dir, { recursive: true });
  await fs.copyFile(src, dest, flags); 
}

async function unlink(filePath) {
  await fs.unlink(filePath).catch(()=>{});       
}

async function mv(oldPath, newPath){
  await fs.mkdir(parse(newPath).dir, { recursive: true });
  try{
    await fs.rename(oldPath, newPath);
  }catch{
    await fs.copyFile(oldPath, newPath);
    await fs.unlink(oldPath).catch(()=>{});
  }
  return newPath;
}

function exists(path) {
  return new Promise((resolve) => {
    fs.access(path, constants.F_OK)
    .then(() => resolve(true))
    .catch(() => resolve(false));
  });
}

function existsAndIsOlderOrYoungerThan(path, option = {}){
   const options = {
     timeUnit: option.timeUnit || 'd',
     time: option.time || 1,
     younger: option.younger || false
   };

   return new Promise((resolve) => {
      fs.stat(path)
      .then((stats)=>{
          const lifespan = {
            current: new Date().getTime() - stats.mtimeMs,
            get: function(timeUnit) {
                switch(timeUnit) 
                {
                 case 's': return this.current / 1000 //sec
                 case 'm': return this.current / (1000 * 60) //min
                 case 'h': return this.current / (1000 * 60 * 60) //hour
                 case 'd': return this.current / (1000 * 60 * 60 * 24) //day
                 case 'w': return this.current / (1000 * 60 * 60 * 24 * 7) //week
                 case 'M': return this.current / 2628000000 //month
                 case 'Y': return this.current / (2628000000 * 12) //year
                 default: return this.current / (1000 * 60 * 60 * 24) //day
                }
            }
          };
          
          if (options.younger) {
            resolve(lifespan.get(options.timeUnit) <= options.time);  
          } else {
            resolve(lifespan.get(options.timeUnit) >= options.time);
          }
      
      })
      .catch(() => resolve(false));
   });
}

function existsAndIsOlderThan(path, option = {}){
	option.younger = false;
	return existsAndIsOlderOrYoungerThan(path, option);
}

function existsAndIsYoungerThan(path, option = {}){
	option.younger = true;
	return existsAndIsOlderOrYoungerThan(path, option);
}

function stat(path) {
  return new Promise((resolve) => {
    fs.stat(path).then(resolve).catch(() => resolve({}));
  });
}

function mkdir(dirPath){
  return fs.mkdir(dirPath, { recursive: true });
}

async function rmdir(dirPath){
  try{
    await fs.rmdir(dirPath);
  }catch(err){
    if (err.code === 'ENOTEMPTY') {
      const list = await fs.readdir(dirPath);
      for (const elem of list) 
      {
        const target = join(dirPath, elem);  
        const isDir = (await fs.stat(target)).isDirectory();
        isDir ? await rmdir(target) : await fs.unlink(target);     
      }
      await rmdir(dirPath);        
    }
  }
}

async function isDirEmpty(dirPath){
  const asyncIterator = await fs.opendir(dirPath);
  const { done } = await asyncIterator[Symbol.asyncIterator]().next();
  return done;
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

export {
  readFile,
  readJSON,
  writeFile,
  writeJSON,
  copyFile,
  unlink,
  unlink as deleteFile, //alias
  unlink as rm, //alias (backward compatibility)
  mv,
  exists,
  existsAndIsOlderOrYoungerThan,
  existsAndIsOlderThan,
  existsAndIsYoungerThan,
  stat,
  stat as stats, //alias (backward compatibility)
  mkdir,
  rmdir,
  isDirEmpty,
  hashFile
};