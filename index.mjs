
export function isAsync(fn) {
  return fn?.constructor?.name === 'AsyncFunction';
}

export function isGenerator(fn) {
  return fn?.constructor?.name === 'GeneratorFunction';
}

export function isAsyncGenerator(fn) {
  return fn?.constructor?.name === 'AsyncGeneratorFunction';
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export async function *getDataFromEvent(emitter, dataEvent='data', endEvent='end', errEvent='error') {
  const queue = []
  let resolve, reject, err, end = false

  const listener = (data) => {
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

  const errorListener = e => {
    err = e
    if (reject) {
      reject(e)
      reject = null
    } 
  }

  const on = emitter.on ? 'on' : 'addEventListener'
  const off = emitter.off ? 'off' : 'removeEventListener'

  emitter[on](dataEvent, listener)
  emitter[on](endEvent, endListener)
  emitter[on](errEvent, errorListener)

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
    emitter[off](dataEvent, listener)
    emitter[off](endEvent, endListener)
    emitter[off](errEvent, errorListener)
  }
}

export function *group(iter, n) {
  let group = [];
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

export async function *groupAsync(iter, n) {
  let group = [];
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