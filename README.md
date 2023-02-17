About
=====

File system manipulation without headache.

📦 Scoped `@xan105` packages are for my own personal use but feel free to use them.

Install / Runtime
=================

### 📦 Package manager

```
npm install @xan105/fs
```

<details><summary>Compatibility</summary>

- Node ✔️

</details>

API
===

⚠️ This module is only available as an ECMAScript module (ESM) starting with version 2.0.0.<br />
Previous version(s) are CommonJS (CJS) with an ESM wrapper.

## Named export

### `readFile(filePath: string, options?: object | string): Promise<string | Buffer>`

  Auto remove utf bom (string only).

### `readJSON(filePath: string): Promise<string>`

  Parse JSON and remove utf bom if any.

### `writeFile(filePath: string, data: unknown, options?: object | string): Promise<string>`

  Create target parent dir if doesn't exist.
  
  ⚙️ Options:
  
  - `bom` (default: false)
    
    add utf bom (string only).
  
### `writeJSON(filePath: string, data: unknown, pretty?: boolean): Promise<string>`
  
 ⚙️ Options:
 
  - `pretty` (default: true)
  
    insert white space into the output JSON string for readability purposes.

### `copyFile(src: string, dest: string, flags: number): Promise<void>`

  Create target parent dir if doesn't exist.

### `mv(oldPath: string, newPath: string): Promise<string>`

  Create target parent dir if doesn't exist.</br>
  Move on same drive otherwise copy to target and delete origin.

### `exists(path: string): Promise<boolean>`
### `existsAndIsOlderOrYoungerThan(path: string, option?: object): Promise<boolean>`

  ⚙️ Options:

  - `time`: amount of time unit (default 1)
  - `timeUnit`: s|m|h|d|w|M|Y (default day)
  - `younger`: compare mode younger than (true) or older than (false/default)

### `existsAndIsOlderThan(path: string, option?: object): Promise<boolean>`

  ⚙️ Options:

  - `time`: amount of time unit (default 1)
  - `timeUnit`: s|m|h|d|w|M|Y (default day)
  
### `existsAndIsYoungerThan(path: string, option?: object): Promise<boolean>`

  ⚙️ Options:

  - `time`: amount of time unit (default 1)
  - `timeUnit`: s|m|h|d|w|M|Y (default day))

### `stat(path: string): Promise<object>`
  
  alias `stats(path: string): Promise<object>`
  
  On error returns an empty object.

### `mkdir(dirPath: string): Promise<string | undefined>`

  Recursive.

### `rm(path: string): Promise<void>`

  alias `unlink(path: string): Promise<void>`<br/>
  alias `deleteFile(path: string): Promise<void>`<br/>
  alias `rmdir(path: string): Promise<void>`
  
  Nuke the target 🚀💥.

### `hashFile(filePath: string, algo?: string): Promise<string>`

  Hash specified file (use stream). `algo` defaults to "sha256".
  
### `touch(filePath: string): Promise<void>`

  Create, change and modify timestamps of a file.

### `ls(dirPath: string, option?: object): Promise<string[] | object[]>`

  List directory contents.

  ⚙️ Options:

  - `verbose`: boolean (false)
  - `recursive`: boolean (false)
  - `absolute`: boolean false)
  
    Return absolute or relative path
  
  - `follow`: boolean (false)
    
      Whether or not to follow symlink
  
  - `normalize`: boolean (false)
    
      Whether or not to normalize path seperator to "/"
  
  - `ignore`: 
  
    + `dir`: boolean (false)
    + `file`: boolean (false)
    + `symlink`: boolean (false)
    + `socket`: boolean (false)
    + `dot`: boolean (true)
    
  - `filter`: string[] (empty)
  - `whitelist`: boolean (false)
  
    Turn the filter list into a whitelist
  
  - `ext`: string[] (empty)
  
    Allowed file extension
  
  - `pattern`: RegExp (none)

  Return value:
  
  If `verbose` is `true` returns a detailed list as
  
```ts
[
  {
    name: string, //file name
    path: string, //path of file
    link?: string | undefined //symlink target
  },
  ...
]
```

  Otherwise string[] (path of file)
  
#### `compareFile(a: string, b:string, algo?: string): Promise<boolean>`

Compare files to determine if they are identical.

Comparison is by default done with "sha1" `algo` (cf: `hashFile()`) unless files size don't match.

### path

#### `resolve(path: string): string`

  Resolve fileURL and path if necessary.

#### `dirname(path: string): string`

  Handles path and fileURL.
  
#### `normalize(path: string, win32?: boolean): string`
  
  replace every `\\` with `/`<br/>
  
  When `win32` is set to true (default is false)<br/>
  replace every `/` with `\\` 
  
#### `isRoot(path: string): boolean`

### win32

#### `sanitizeFileName(string: string): string`
#### `setHidden(path: string): Promise<void>`
#### `removeHidden(path: string): Promise<void>`
#### `setReadOnly(path: string): Promise<void>`
#### `removeReadOnly(path: string): Promise<void>`
#### `isHidden(path: string): Promise<boolean>`
#### `isReadOnly(path: string): Promise<boolean>`
#### `isHiddenAndReadOnly(path: string): Promise<boolean>`