DeWorker - Human Friendly WebWorkers
========

DeWorker provides you an easy way to spawn and communicate with WebWorkers.

### Client Side Example

```js
var LeExchange = new Exchange("Build/Worker.js");
LeExchange.Start(); // Start the WebWorker
// LeExchange.Send('Command',[Args]) .then (Callback(Response))
LeExchange.Send('ping').then(function(Response){
  console.log(Response);
});
LeExchange.Send('OtherPing').then(function(Response){
  console.log(Response); // Output 'I am the Other One'
});
LeExchange.On('MyInfo',function(Job){
  // Job = shape('ID' => UniqueID, 'Data' => DataFromWorker, 'Result' => Null)
  Job.Result = 'Yesh It Works';
  LeExchange.Finished(Job); // This will trigger the .then on the worker side
});
``

### Worker Side Example

```js
// Note: DWorker is an automatically defined variable by that worker script
DWorker.send('MyInfo',{Why:"For Test Purposes"}).then(function(Response){
  console.log(Response); // Outputs "Yes it Works"
});
DWorker.on('OtherPing',function(Job){
  Job.Result = 'I am the Other One';
  DWorker.finished(Job);
});
```