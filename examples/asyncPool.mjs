import { sleep, AsyncPool } from '@async-util/common';

async function Foo(v) {
  await sleep(500 + Math.random() * 50);
  console.log(v);
}

async function main() {
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

main();