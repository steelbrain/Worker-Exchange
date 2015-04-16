

importScripts('../Dist/ExchangeClient.js');
Exchange.on('Ping', function(Message, Job){
  console.log(Message); // Outputs 'Now'
  Job.Result = 'Pong';
  Exchange.Finished(Job);
});