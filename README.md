WorkerExchange
==============

WorkerExchange is an extremely lightweight (<2kb) wrapper for HTML5 [WebWorker][WebWorker] and [SharedWorker][SharedWorker]. 
It provides a consistent API across both type of workers, So you won't have to replace nothing to change between the types. You can even **use the same js file as both Dedicated and Shared Worker**, an example of it can be found in the Demo Folder.

WorkerExchange internally uses [Le-Emitter][Le-Emitter] for event emitting part, You can replace it with an event emitter of your choice.

WorkerExchange automatically declares `Exchange` variable in Both Worker and Host scope.

#### Hello World

There's nothing better, than a Hello World example.
```js
// Host
var Worker = new Exchange("Worker.js");
--- or 
var Worker = new Exchange("Worker.js", Exchange.SHARED);

Worker.Request("Ping", {Key: "Value"}).then(function(Response){
  console.log(Response); // Pong
});
Worker.on('PingYou', function(Request, Job){
  console.log(Request); // "Pong You"
  Job.Result = 'You Too';
  Worker.Finished(Job);
});
```
```js
// Worker.js
importScripts('/path/to/ExchangeClient.js');
Exchange.on('Ping', function(Request, Job){
  console.log(Request); // {"Key": "Value"}
  Job.Result = "Pong";
  Exchange.Request('PingYou', 'PongYou', Job.Port).then(function(Result){
    console.log(Result); // "You Too"
    Exchange.Finished(Job)
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
enum JobType = {Broadcast, Reply, Request};
type Job = shape(Type => JobType, SubType => string, Message => Mixed, ?ID => String, EXCHANGE => true, ?Port => MessagePort);
class Exchange extends EventEmitter{
  constructor(Path:String, Type:ExchangeType, Debug:Boolean, DebugResponses:Boolean);
  Send(Type:String, Message:Mixed);
  Request(Type:String, Message:Mixed);
  Finished(Job:Job);
}
class ExchangeClient extends EventEmitter{ // Available as 'Exchange' to Worker
  Ports:array<MessagePort>;
  Handle(Port: MessagePort); // Internal, Don't use
  Send(Type:String, Message:Mixed, ?Port:MessagePort);
  Request(Type:String, Message:Mixed, ?Port:MessagePort);
  Finished(Job:Job);
}
```

#### License

This project is licensed under the terms of MIT License. See the LICENSE file for more info.

[Le-Emitter]:https://github.com/steelbrain/Le-Emitter
[WebWorker]:https://developer.mozilla.org/en-US/docs/Web/API/Worker
[SharedWorker]:https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker
[Demo]:https://rawgit.com/steelbrain/DeWorker/master/Demo/Demo2.html