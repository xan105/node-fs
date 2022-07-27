About
=====

`node:fs` module wrapper.

Install
=======

```
npm install @xan105/fs
```

API
===

⚠️ This module is only available as an ECMAScript module (ESM) starting with version 2.0.0.<br />
Previous version(s) are CommonJS (CJS) with an ESM wrapper.

## Named export

- path
- win32

### `readFile(filePath: string, options?: object): Promise<string | Buffer>`

  `bomWarning` (default: true): warn on utf bom removal.</br>
  Auto remove utf bom (_only in string data_).</br>
  Otherwise same as fs.readFile().

### `readJSON(filePath: string): Promise<string>`
### `writeFile(filePath: string, data: any, options?: object): Promise<string>`

  `bom` (default: false): add utf bom (_only in string data_).</br>
  Create target parent dir if not exist.</br>
  Otherwise same as fs.writeFile().
  
### `writeJSON(filePath: string, data: any, pretty: boolean): Promise<string>`
  
  `pretty` (default: true): insert white space into the output JSON string for readability purposes.

### `copyFile(src: string, dest: string, flags: any): Promise<void>`

  Create target parent dir if not exist.

### `unlink(filePath: string): Promise<void>`
  
  alias: `deleteFile(filePath: string): Promise<void>`
  alias: `rm(filePath: string): Promise<void>`

  Silently fails on error.

### `mv(oldPath: string, newPath: string): Promise<string>`

  Create target parent dir if not exist.</br>
  Move on same drive otherwise copy to target and delete origin.

### `exists(path: string): Promise<boolean>`
### `existsAndIsOlderOrYoungerThan(path: string, option?: object): Promise<boolean>`

`timeUnit`: s|m|h|d|w|M|Y (default day)</br>
`time`: amount of time unit (default 1)</br>
`younger`: compare mode younger than (true) or older than (false/default)

### `existsAndIsOlderThan(path: string, option?: object): Promise<boolean>`

`timeUnit`: s|m|h|d|w|M|Y (default day)</br>
`time`: amount of time unit (default 1)

### `existsAndIsYoungerThan(path: string, option?: object): Promise<boolean>`

`timeUnit`: s|m|h|d|w|M|Y (default day)</br>
`time`: amount of time unit (default 1)

### `stat(path: string): Promise<any>`
  
  alias `stats(path: string): Promise<any>`
  
  On error returns an empty object.

### `mkdir(dirPath: string): Promise<void>`

  Recursive.

### `rmdir(dirPath: string): Promise<void>`

  Recursive. Delete files if any.

### `isDirEmpty(dirPath: string): Promise<boolean>`
### `hashFile(filePath: string, algo?: string): Promise<string>`

  `algo` defaults to "sha1". Uses stream.
  
### `touch(filePath: string): Promise<void>`

  Create, change and modify timestamps of a file.

### `ls(dirPath: string, option?: object): Promise<string[]>`

  List directory contents.
  
- excludeDir?: boolean (false)
- excludeFile?: boolean (false)
- ignoreSymlink?: boolean (false)
- ignoreDotFile?: boolean (false)
- recursive?: boolean (false)
- absolute?: boolean (false)
  Return absolute file path
- filter?: string[] (empty)

### path

#### `resolve(path: string): string`

  Handles a very rare bug (_user reported_).

#### `dirname(path: string): string`

  Handles path and fileURL.
  
#### `normalize(path: string, win32?: boolean): string`
  
  replace every `\\` with `/`<br/>
  
  When `win32` is set to true (default is false)<br/>
  replace every `/` with `\\` 

### win32

#### `sanitizeFileName(string: string): string`
#### `setHidden(path: string): Promise<void>`
#### `removeHidden(path: string): Promise<void>`
#### `setReadOnly(path: string): Promise<void>`
#### `removeReadOnly(path: string): Promise<void>`
#### `isHidden(path: string): Promise<boolean>`
#### `isReadOnly(path: string): Promise<boolean>`
#### `isHiddenAndReadOnly(path: string): Promise<boolean>`