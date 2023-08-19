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