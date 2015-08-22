

importScripts('../dist/ExchangeClient.js');
Exchange.on('Ping', function(Job){
  console.log(Job.Message); // Outputs 'Now'
  Job.response = 'Pong';
});
