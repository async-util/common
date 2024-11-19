import { WebSocketDataSource } from '@async-util/common'

async function main() {
  const ws = new WebSocketDataSource(new WebSocket('wss://echo.websocket.org'));

  await ws.waitFor('open');
  setTimeout(() => ws.send('{"op":1,"d":6}'), 1000);
  setTimeout(() => ws.close(), 5000);

  for await (const { data } of ws.getData('message', 'close', 'error')) {
    console.log(data);
  }

  console.log('Websocket closed...');
}

main().catch(console.error);