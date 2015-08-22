WorkerExchange
==============

WorkerExchange is an extremely lightweight (<2kb) wrapper for HTML5 [WebWorker][WebWorker] and [SharedWorker][SharedWorker]. 
It provides a consistent API across both type of workers, So you won't have to replace nothing to change between the types. You can even **use the same js file as both Dedicated and Shared Worker**, an example of it can be found in the Demo Folder.

WorkerExchange internally uses [event-kit][event-kit] for event emitting part, You can replace it with an EventEmitter of your choice.

WorkerExchange automatically declares `Exchange` variable in Both Worker and Host scope.

#### Hello World
There's nothing better, than a Hello World example.
```js
// Host
var Worker = new Exchange("Worker.js");
--- or
var Worker = new Exchange("Worker.js", Exchange.SHARED);

Worker.request("Ping", {Key: "Value"}).then(function(Response){
  console.log(Response); // Pong
});
```
```js
// Worker.js
importScripts('/path/to/ExchangeClient.js');
Exchange.on('Ping', function(Job){
  console.log(Job.Message); // {"Key": "Value"}
  Job.Response = "Pong";
});
```

#### Hello World - Bidirectional

```js
// Host
var Worker = new Exchange("Worker.js");
--- or 
var Worker = new Exchange("Worker.js", Exchange.SHARED);

Worker.request("Ping", {Key: "Value"}).then(function(Response){
  console.log(Response); // Pong
});
Worker.on('PingYou', function(Job){
  console.log(Job.Message); // "Pong You"
  Job.Response = 'You Too';
});
```
```js
// Worker.js
importScripts('/path/to/ExchangeClient.js');
Exchange.on('Ping', function(Job){
  console.log(Job.Message); // {"Key": "Value"}
  Job.Response = "Pong";
  Exchange.request('PingYou', 'PongYou').then(function(Result){
    console.log(Result); // "You Too"
  });
});
```

Check out the [Online Demo][Demo]. (Check your browser console)

#### Installation

```js
bower install --save worker-exchange
```

#### API

```js
enum ExchangeType = {SHARED, NORMAL};
type Job = shape(Type => string, Message => String, Response => mixed);
class Exchange extends EventEmitter{
  constructor(Path:String, Type:ExchangeType, Debug:Boolean)
  on(Type:String, Callback:Function<Job>)
  send(Type:String, Parameter:Mixed)
}
class ExchangeClient extends EventEmitter{ // Available as 'Exchange' to Worker
  Ports:array<MessagePort>;
  Handle(Port: MessagePort); // Internal, Don't use
  on(Type:String, Callback:Function<Job>)
  send(Type:String, Parameter:Mixed)
}
```

#### License

This project is licensed under the terms of MIT License. See the LICENSE file for more info.

[event-kit]:https://github.com/ZoomPK/event-kit
[WebWorker]:https://developer.mozilla.org/en-US/docs/Web/API/Worker
[SharedWorker]:https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker
[Demo]:https://rawgit.com/steelbrain/DeWorker/master/Demo/Demo2.html
