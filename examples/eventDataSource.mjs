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

