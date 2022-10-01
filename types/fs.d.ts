export function readFile(filePath: string, options?: object | string): Promise<string | Buffer>;
export function readJSON(filePath: string): Promise<string>;
export function writeFile(filePath: string, data: unknown, options?: object | string): Promise<string>;
export function writeJSON(filePath: string, data: unknown, pretty?: boolean): Promise<string>;
export function copyFile(src: string, dest: string, flags: number): Promise<void>;
export function mv(oldPath: string, newPath: string): Promise<string>;
export function exists(path: string): Promise<boolean>;

declare interface IExistsAndIsOption{
  time?: number,
  timeUnit?: string,
  younger?: boolean
}
export function existsAndIsOlderOrYoungerThan(path: string, option?: IExistsAndIsOption): Promise<boolean>;
export function existsAndIsOlderThan(path: string, option?: IExistsAndIsOption): Promise<boolean>;
export function existsAndIsYoungerThan(path: string, option?: IExistsAndIsOption): Promise<boolean>;

export function stat(path: string): Promise<object>;
export function mkdir(dirPath: string): Promise<string | undefined>;
export function rm(path: string): Promise<void>;
export function hashFile(filePath: string, algo?: string): Promise<string>;
export function touch(filePath: string): Promise<void>;

declare interface LsIgnore{
  dir?: boolean,
  file?: boolean,
  symlink?: boolean,
  socket?: boolean,
  dot?: boolean
}

declare interface LsOption{
  verbose?: boolean,
  recursive?: boolean,
  absolute?: boolean,
  follow?: boolean,
  normalize?: boolean,
  ignore?: LsIgnore,
  filter?: string[]
  whitelist?: boolean,
  ext?: string[],
  pattern?: RegExp | null
}

declare interface LsVerboseList{
  name: string,
  path: string,
  link?: string | undefined
}

export function ls(dirPath: string, option?: LsOption): Promise<string[] | LsVerboseList[]>;

//alias
export { stat as stats, rm as unlink, rm as deleteFile, rm as rmdir };
