importScripts('../dist/ExchangeClient.js');
Exchange.on('Ping', function(Job){
  console.log(Job.Message)
  Job.Response = "Pong";
  Exchange.request('PingYou', 'PongYou').then(function(Result){
    console.log(Result); // "You Too"
  });
});
