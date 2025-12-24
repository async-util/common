
export function isAsync(fn: any) {
  return fn?.constructor?.name === 'AsyncFunction';
}

export function isGenerator(fn: any) {
  return fn?.constructor?.name === 'GeneratorFunction';
}

export function isAsyncGenerator(fn: any) {
  return fn?.constructor?.name === 'AsyncGeneratorFunction';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

interface Emitter {
  on?: (event: string, listener: EventListenerOrEventListenerObject | null) => void;
  off?: (event: string, listener: EventListenerOrEventListenerObject | null) => void;
  addEventListener?: (event: string, listener: EventListenerOrEventListenerObject | null) => void;
  removeEventListener?: (event: string, listener: EventListenerOrEventListenerObject | null) => void;
}

export async function waitForEvent(emitter: Emitter, event: string) {
  return new Promise((resolve) => {
    const on = emitter.on ? 'on' : 'addEventListener';
    const off = emitter.off ? 'off' : 'removeEventListener';
    const listener = (ev: any) => {
      resolve(ev);
      emitter[off]!(event, listener);
    };

    emitter[on]!(event, listener);
  });
}

export async function *getDataFromEvent<T=any>(emitter: Emitter, dataEvent='data', endEvent='end', errEvent='error') {
  const queue: T[] = [];
  let resolve: Function | null, reject: Function | null, err, end = false;

  const listener = (data: any) => {
    if (resolve) {
      resolve(data);
      resolve = null;
    } else {
      queue.push(data);
    }
  }

  const endListener = () => {
    end = true;
    if (resolve) {
      resolve();
      resolve = null;
    }
  }

  const errorListener = (e: any) => {
    err = e;
    if (reject) {
      reject(e)
      reject = null;
    } 
  }

  const on = emitter.on ? 'on' : 'addEventListener';
  const off = emitter.off ? 'off' : 'removeEventListener';

  emitter[on]!(dataEvent, listener);
  emitter[on]!(endEvent, endListener);
  emitter[on]!(errEvent, errorListener);

  try {
    while (true) {
      if (queue.length > 0) {
        yield queue.shift();
      } else if (end) {
        break ;
      } else if (err) {
        throw err;
      } else {
        const data = await new Promise((r, j) => {
          resolve = r;
          reject = j;
        })

        if (data !== undefined) yield data;
        else break;
      }
    }
  } finally {
    emitter[off]!(dataEvent, listener);
    emitter[off]!(endEvent, endListener);
    emitter[off]!(errEvent, errorListener);
  }
}

export class EventDataSource {
  private _emmiter: Emitter;
  constructor (emmiter: Emitter) {
    this._emmiter = emmiter;
  }

  async waitFor(eventName: string) {
    return await waitForEvent(this._emmiter, eventName);
  }

  getData(dataEvent='data', endEvent='end', errEvent='error') {
    return getDataFromEvent(this._emmiter, dataEvent, endEvent, errEvent);
  }
}

export class WebSocketDataSource {
  private _ws: WebSocket;

  constructor (ws: WebSocket) {
    this._ws = ws;
  }

  get ws() {
    return this._ws;
  }

  async waitFor(eventName: string) {
    return await waitForEvent(this._ws as Emitter, eventName);
  }

  async open() {
    switch (this._ws.readyState) {
      case WebSocket.OPEN:
        return ;
      case WebSocket.CLOSED:
      case WebSocket.CLOSING:
        throw new Error('Underlying websocket is clsoed.');
    }

    const ev: any = await Promise.race([this.waitFor('open'), this.waitFor('error')]);
    if (ev?.type === 'error') throw ev;
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    this._ws.send(data);
  }

  close() {
    this._ws.close();
  }

  getData() {
    return getDataFromEvent(this._ws as Emitter, 'message', 'close', 'error');
  }
}

export function *group<T>(iter: Iterable<T>, n: number) {
  let group: T[] = [];
  for (const item of iter) {
    group.push(item);
    if (group.length === n) {
      yield group;
      group = [];
    }
  }

  if (group.length) {
    yield group;
  }
}

export async function *groupAsync<T>(iter: AsyncIterable<T>, n: number) {
  let group: Awaited<T>[] = [];
  for await (const item of iter) {
    group.push(item);
    if (group.length === n) {
      yield group;
      group = [];
    }
  }
  
  if (group.length) {
    yield group;
  }
}

export class AsyncPool {
  private concurrency: number;
  private executing: Promise<any>[];

  constructor(concurrency: number = 2) {
    this.concurrency = concurrency;
    this.executing = [];
  }

  async push(fn: () => Promise<any>) {
    if (this.executing.length >= this.concurrency) {
      await Promise.race(this.executing);
    }

    const p = fn().catch(console.error).finally(() => this.executing.splice(this.executing.findIndex(e => e === p), 1));
    this.executing.push(p);
  }

  async waitAll() {
    await Promise.all(this.executing);
  }
}

export class StreamParser {
  private _stream: ReadableStream<Uint8Array>;
  public lastError: any;
  
  constructor(readableStream: ReadableStream<Uint8Array>, private timeout = 120 * 1000) {
    this._stream = readableStream;
  }

  cancel() {
    return this._stream.cancel();
  }

  async *lines() {
    const decoder = new TextDecoder();

    let rest = '';
    for await (const chunk of this._stream) {
      const text = rest + decoder.decode(chunk);
      const lines = text.split('\n');
      rest = lines.pop() || '';

      for (const line of lines) yield line;
    }

    if (rest) yield rest;
  }

  async *json<T = any>() {
    for await (const line of this.lines()) {
      if (line.trim()) yield JSON.parse(line) as T;
    }
  }
}
