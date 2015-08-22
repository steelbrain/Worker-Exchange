// @Compiler-Output "../dist/ExchangeClient.js"
// @Compiler-Transpile "true"
// @Compiler-Browserify "true"

const ExchangeCommunication = require('sb-communication')

class Exchange{
  constructor(){
    this.Ports = []
    this.Communication = new ExchangeCommunication
  }
  Handle(Port){
    this.Ports.push(Port)
    if(Port.start){
      Port.start()
    }
    Port.sendCallback = data => {  Port.postMessage(data) }
    Port.addEventListener('message', message => { this.Communication.gotMessage(Port.sendCallback, message.data) })
  }
  on(type, message) {
    return this.Communication.on(type, message)
  }
  request(type, message, port) {
    port = port || this.Ports[0]
    return this.Communication.request(port.sendCallback, type, message)
  }
}
Exchange = new Exchange
self.addEventListener('message', function Once(){
  // I am a dedicated worker
  Exchange.Handle(self)
  self.removeEventListener('message', Once)
})
self.addEventListener('connect', function(e){
  // I am a shared worker
  Exchange.Handle(e.ports[0])
})

self.Exchange = Exchange
module.exports = Exchange
