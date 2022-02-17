export function sanitizeFileName(string: string): string;
export function setHidden(path: string): Promise<void>;
export function removeHidden(path: string): Promise<void>;
export function setReadOnly(path: string): Promise<void>;
export function removeReadOnly(path: string): Promise<void>;
export function isHidden(path: string): Promise<boolean>;
export function isReadOnly(path: string): Promise<boolean>;
export function isHiddenAndReadOnly(path: string): Promise<boolean>;