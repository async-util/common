
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