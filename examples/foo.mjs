import { sleep, isAsync, isGenerator, isAsyncGenerator, group, groupAsync } from '@async-util/common';

function *gen() {}
async function *genAsync() {
  for (const i of [1,2,3,4,5]) {
    yield i;
    await sleep(500);
  }
}

async function main() {
  console.log('isAsync(gen):', isAsync(gen));
  console.log('isGenerator(gen):', isGenerator(gen));
  console.log('isAsyncGenerator(gen):', isAsyncGenerator(gen));
  console.log();

  console.log('isAsync(genAsync):', isAsync(genAsync));
  console.log('isGenerator(genAsync):', isGenerator(genAsync));
  console.log('isAsyncGenerator(genAsync):', isAsyncGenerator(genAsync));
  console.log();

  console.log('isAsync(main):', isAsync(main));
  console.log('isGenerator(main):', isGenerator(main));
  console.log('isAsyncGenerator(main):', isAsyncGenerator(main));
  console.log();

  console.log('Sleeping for 1 second...');
  await sleep(1000);
  console.log('hahah');

  for (const g of group([1,2,3,4,5], 3)) {
    console.log(g)
  }

  for await (const g of groupAsync(genAsync(), 3)) {
    console.log(g)
  }
}

main();