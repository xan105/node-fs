export function readFile(filePath: string, options?: any): Promise<string | Buffer>;
export function readJSON(filePath: string): Promise<string>;
export function writeFile(filePath: string, data: any, options?: any): Promise<string>;
export function writeJSON(filePath: string, data: any, pretty: boolean): Promise<string>;
export function copyFile(src: string, dest: string, flags: any): Promise<void>;
export function unlink(filePath: string): Promise<void>;
export function deleteFile(filePath: string): Promise<void>; //alias
export function rm(filePath: string): Promise<void>; //alias
export function mv(oldPath: string, newPath: string): Promise<string>;
export function exists(path: string): Promise<boolean>;

declare interface IExistsAndIsOption{
  timeUnit?: string,
  time?: number,
  younger?: boolean,
}

export function existsAndIsOlderOrYoungerThan(path: string, option?: IExistsAndIsOption): Promise<boolean>;
export function existsAndIsOlderThan(path: string, option?: IExistsAndIsOption): Promise<boolean>;
export function existsAndIsYoungerThan(path: string, option?: IExistsAndIsOption): Promise<boolean>;
export function stat(path: string): Promise<any>;
export function stats(path: string): Promise<any>; //alias
export function mkdir(dirPath: string): Promise<void>;
export function rmdir(dirPath: string): Promise<void>;
export function isDirEmpty(dirPath: string): Promise<boolean>;
export function hashFile(filePath: string, algo?: string): Promise<string>;
export function touch(filePath: string): Promise<void>;

declare interface IlsOption{
  excludeDir?: boolean,
  excludeFile?: boolean,
  ignoreSymlink?: boolean,
  ignoreDotFile?: boolean,
  recursive?: boolean,
  absolute?: boolean,
  filter?: string[],
  allowedExt?: string[]
}

export function ls(dirPath: string, option?: IlsOption): Promise<string[]>;