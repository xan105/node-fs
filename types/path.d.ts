declare function _resolve(path: string): string;
declare function _dirname(path: string): string;
export { _resolve as resolve, _dirname as dirname };
export function normalize(path: string, win32?: boolean): string;
export function isRoot(path: string): boolean;
export function isBasename(path: string): boolean;