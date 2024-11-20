# common
common tools for async util

## Install
```bash
npm i @async-util/common
```

## Usage
*Note: If you want to use this module in a nodejs app, you should import the lib in .mjs file.*

### sleep
```js
import { sleep } from '@async-util/common';

async function blabla() {
  //...
  await sleep(1000); // Sleep for 1000ms(1 second)
  //...
} 
```

### function helper
```js
import { isAsync, isGenerator, isAsyncGenerator } from '@async-util/common';

async function foo() {}
function *gen() {}
async function *genAsync() {}

isAsync(foo); // true
isGenerator(gen); //true
isAsyncGenerator(genAsync); // true
```

### group / groupAsync
```js
for (const g of group([1,2,3,4,5], 3)) {
  console.log(g)
}

async function *genAsync() {
  for (const i of [1,2,3,4,5]) {
    yield i;
    await sleep(500);
  }
}

for await (const g of groupAsync(genAsync(), 3)) {
  console.log(g)
}
```

### getDataFromEvent
```js
import { getDataFromEvent } from '@async-util/common'
import { EventEmitter } from 'events'

async function main() {
  const emitter = new EventEmitter()
  const evid = setInterval(() => emitter.emit('data', Date.now()), 500)
  setTimeout(() => {
    clearInterval(evid)
    emitter.emit('end')
  }, 5000)

  for await (const data of getDataFromEvent(emitter)) {
    console.log(data)
  }

  console.log('event1 done')

  const evid2 = setInterval(() => emitter.emit('data', Date.now()), 500)
  setTimeout(() => {
    clearInterval(evid2)
    emitter.emit('error', 'oops')
  }, 5000)

  for await (const data of getDataFromEvent(emitter)) {
    console.log(data)
  }

  console.log('event2 done, should not happend')
}

main().catch(console.error)
```

### EventDataSource
```js
import { EventDataSource } from '@async-util/common'
import { EventEmitter } from 'events'

async function main() {
  const emitter = new EventEmitter()
  const evid = setInterval(() => emitter.emit('data', Date.now()), 500)
  setTimeout(() => {
    clearInterval(evid)
    emitter.emit('end')
  }, 5000)

  const ds = new EventDataSource(emitter);

  for await (const data of ds.getData()) {
    console.log(data)
  }

  console.log('event1 done')

  const evid2 = setInterval(() => emitter.emit('data', Date.now()), 500)
  setTimeout(() => {
    clearInterval(evid2)
    emitter.emit('error', 'oops')
  }, 5000)

  for await (const data of ds.getData()) {
    console.log(data)
  }

  console.log('event2 done, should not happen.')
}

main().catch(console.error)
```

### WebSocketDataSource
```js
import { WebSocketDataSource } from '@async-util/common'

async function main() {
  const ws = new WebSocketDataSource(new WebSocket('wss://echo.websocket.org'));

  await ws.open();
  setTimeout(() => ws.send('{"op":1,"d":6}'), 1000);
  setTimeout(() => ws.close(), 5000);

  for await (const { data } of ws.getData()) {
    console.log(data);
  }

  console.log('Websocket closed...');
}

main().catch(console.error);
```

### AsyncPool
```js
import { sleep, AsyncPool } from '@async-util/common';

async function Foo(v) {
  await sleep(500 + Math.random() * 50);
  console.log(v);
}

async function bar() {
  console.log('Without pool.');
  for (let i = 0; i < 10; i++) {
    await Foo(i);
  }

  console.log('With pool.');
  const pool = new AsyncPool(3/* concurrency = 3*/);
  for (let i = 0; i < 10; i++) {
    await pool.push(() => Foo(i));
  }
}
```