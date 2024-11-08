
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
  on?: (event: string, listener: Function) => void;
  off?: (event: string, listener: Function) => void;
  addEventListener?: (event: string, listener: Function) => void;
  removeEventListener?: (event: string, listener: Function) => void;
}

export async function *getDataFromEvent<T=any>(emitter: Emitter, dataEvent='data', endEvent='end', errEvent='error') {
  const queue: T[] = []
  let resolve: Function | null, reject: Function | null, err, end = false

  const listener = (data: any) => {
    if (resolve) {
      resolve(data)
      resolve = null
    } else {
      queue.push(data)
    }
  }

  const endListener = () => {
    end = true
    if (resolve) {
      resolve()
      resolve = null
    }
  }

  const errorListener = (e: any) => {
    err = e
    if (reject) {
      reject(e)
      reject = null
    } 
  }

  const on = emitter.on ? 'on' : 'addEventListener'
  const off = emitter.off ? 'off' : 'removeEventListener'

  emitter[on]!(dataEvent, listener)
  emitter[on]!(endEvent, endListener)
  emitter[on]!(errEvent, errorListener)

  try {
    while (true) {
      if (queue.length > 0) {
        yield queue.shift()
      } else if (end) {
        break
      } else if (err) {
        throw err
      } else {
        const data = await new Promise((r, j) => {
          resolve = r
          reject = j
        })

        if (data !== undefined) yield data
        else break
      }
    }
  } finally {
    emitter[off]!(dataEvent, listener)
    emitter[off]!(endEvent, endListener)
    emitter[off]!(errEvent, errorListener)
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