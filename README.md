Node.js 'fs' module wrapper.

Install
-------

`npm install @xan105/fs`

API
===

⚠️ This module is only available as an ECMAScript module (ESM) starting with version 2.0.0.<br />
Previous version(s) are CommonJS (CJS) with an ESM wrapper.

## Named export

- path
- win32

#### readFile(filePath: string, options: any): Promise<string | Buffer>;
#### readJSON(filePath: string): Promise<string>;
#### writeFile(filePath: string, data: any, options: any): Promise<string>;
#### writeJSON(filePath: string, data: any, pretty: bool): Promise<string>;
#### copyFile(src: string, dest: string, flags: any): Promise<void>;
#### unlink(filePath: string): Promise<void>;
alias: `rm(filePath: string): Promise<void>`
#### mv(oldPath: string, newPath: string): Promise<string>;
#### exists(path: string): Promise<bool>;
#### existsAndIsOlderOrYoungerThan(path: string, option?: IExistsAndIsOption): Promise<bool>;
#### existsAndIsOlderThan(path: string, option?: IExistsAndIsOption): Promise<bool>;
#### existsAndIsYoungerThan(path: string, option?: IExistsAndIsOption): Promise<bool>;
#### stat(path: string): Promise<any>;
alias `stats(path: string): Promise<any>`
#### mkdir(dirPath: string): Promise<void>;
#### rmdir(dirPath: string): Promise<void>;
#### isDirEmpty(dirPath: string): Promise<bool>;
#### hashFile(filePath: string, algo?: string): Promise<string>;

### path

#### resolve(path: string): string;
#### dirname(path: string): string;

### win32

#### sanitizeFileName(string: string): string;
#### setHidden(path: string): Promise<void>;
#### removeHidden(path: string): Promise<void>;
#### setReadOnly(path: string): Promise<void>;
#### removeReadOnly(path: string): Promise<void>;
#### isHidden(path: string): Promise<bool>;
#### isReadOnly(path: string): Promise<bool>;
#### isHiddenAndReadOnly(path: string): Promise<bool>;