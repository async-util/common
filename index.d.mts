
export function isAsync(fn: Function | any): Boolean;
export function isGenerator(fn: Function | any): Boolean;
export function isAsyncGenerator(fn: Function | any): Boolean;

export function sleep(ms: Number): Promise<void>;