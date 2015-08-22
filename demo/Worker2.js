importScripts('../Dist/ExchangeClient.js');
Exchange.on('Ping', function(Request, Job){
  console.log(Request); // {"Key": "Value"}
  Job.Result = "Pong";
  Exchange.Request('PingYou', 'PongYou', Job.Port).then(function(Result){
    console.log(Result); // "You Too"
    Exchange.Finished(Job)
  });
});