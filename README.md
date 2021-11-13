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

#### readFile(filePath: string, options?: obj): Promise<string | Buffer>;

  bomWarning (default: true): warn on utf bom removal.</br>
  Auto remove utf bom (_only on string data_).</br>
  Otherwise same as fs.readFile().

#### readJSON(filePath: string): Promise<string>;
#### writeFile(filePath: string, data: any, options?: obj): Promise<string>;

  bom (default: false): add utf bom (_only on string data_).</br>
  Create target parent dir if not exist.</br>
  Otherwise same as fs.writeFile().
  
#### writeJSON(filePath: string, data: any, pretty: bool): Promise<string>;
  
  pretty (default: true): insert white space into the output JSON string for readability purposes.

#### copyFile(src: string, dest: string, flags: any): Promise<void>;

  Create target parent dir if not exist.

#### unlink(filePath: string): Promise<void>;
  
  alias: `rm(filePath: string): Promise<void>`

  Silently failed on error.

#### mv(oldPath: string, newPath: string): Promise<string>;

  Create target parent dir if not exist.</br>
  Move on same drive otherwise copy to target and delete origin.

#### exists(path: string): Promise<bool>;
#### existsAndIsOlderOrYoungerThan(path: string, option?: IExistsAndIsOption): Promise<bool>;
#### existsAndIsOlderThan(path: string, option?: IExistsAndIsOption): Promise<bool>;
#### existsAndIsYoungerThan(path: string, option?: IExistsAndIsOption): Promise<bool>;
#### stat(path: string): Promise<any>;
  
  alias `stats(path: string): Promise<any>`
  
  On error returns an empty obj.

#### mkdir(dirPath: string): Promise<void>;

  Recursive.

#### rmdir(dirPath: string): Promise<void>;

  Recursive. Delete files if any.

#### isDirEmpty(dirPath: string): Promise<bool>;
#### hashFile(filePath: string, algo?: string): Promise<string>;

### path

#### resolve(path: string): string;

  Handles a very rare bug (_user reported_).

#### dirname(path: string): string;

  Handles path and fileURL.

### win32

#### sanitizeFileName(string: string): string;
#### setHidden(path: string): Promise<void>;
#### removeHidden(path: string): Promise<void>;
#### setReadOnly(path: string): Promise<void>;
#### removeReadOnly(path: string): Promise<void>;
#### isHidden(path: string): Promise<bool>;
#### isReadOnly(path: string): Promise<bool>;
#### isHiddenAndReadOnly(path: string): Promise<bool>;