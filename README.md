WorkerExchange
==============

WorkerExchange is an extremely lightweight wrapper for HTML5 [WebWorker][WebWorker] and [SharedWorker][SharedWorker].
It provides a consistent API across both type of workers, So you won't have to replace nothing to change between the types. You can even **use the same js file as both Dedicated and Shared Worker**, an example of it can be found in the Demo Folder.

It automatically declares `Exchange` variable in Both Worker and Host scope.
It automatically creates an `Exchange` instance in worker scope with the name `exchange`.

#### Hello World

```js
// Host
const worker = Exchange.create('Worker.js');
// or
const worker = Exchange.createShared('Worker.js');

worker.request('some-job', {Key: 'value'}).then(function(response){
  console.log(response); // Pong
});
```
```js
// Worker.js
importScripts('/path/to/exchange.js');
exchange.onRequest('some-job', function(data, message){
  console.log(data); // {"Key": "Value"}
  message.response = "Pong";
});
```

Check out the [Online Demo][Demo]. (Check your browser console)

#### Installation

```bash
npm install --save worker-exchange
```

#### API

```js
// Browser
export class Exchange {
  constructor(worker: Object)
  request(name: String, data: Mixed)
  onRequest(name: String, callback: Function)
  terminate() // <-- also disposes it
  dispose()
  static create(filePath): Exchange
  static createShared(filePath): Exchange
}

// Worker
export class Exchange {
  constructor()
  forEach(callback: Function) /// <-- iterates over ports
  observe(callback: Function): Disposable
  onRequest(name: String, callback: Function): Disposable
  onDidPortAdd(callback: Function): Disposable
  onDidPortClose(callback: Function): Disposable
  dispose()
}
class ExchangePort {
  request(name: String, data: Mixed)
  onRequest(name: String, callback: Function): Disposable
  onDidClose(callback: Function): Disposable
  dispose()
}
```

#### License

This project is licensed under the terms of MIT License. See the LICENSE file for more info.

[event-kit]:https://github.com/steelbrain/event-kit
[WebWorker]:https://developer.mozilla.org/en-US/docs/Web/API/Worker
[SharedWorker]:https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker
[Demo]:https://rawgit.com/steelbrain/Worker-Exchange/master/demo/Demo.html
