
export function isAsync(fn: Function | any): Boolean;
export function isGenerator(fn: Function | any): Boolean;
export function isAsyncGenerator(fn: Function | any): Boolean;

export function sleep(ms: Number): Promise<void>;
export async function *getDataFromEvent(eventSource: any, dataEvent: String='data', endEvent: String='end', errEvent: String='error'): AsyncGenerator<any, void, unknown>;
export function *group(iter: Iterable<any>, n: Number): Generator<any, void, unknown>;
export async function *groupAsync(iter: AsyncIterator<any>, n: Number): AsyncGenerator<any, void, unknown>;