
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