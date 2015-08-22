// @Compiler-Output "../dist/ExchangeClient.js"
// @Compiler-Transpile "true"
// @Compiler-Compress "true"
// @Compiler-Browserify "true"

"use strict"
const EventEmitter = require('zm-event-kit').Emitter
const ExchangeHandler = require('./ExchangeHandler')
class Exchange extends EventEmitter{
  constructor(){
    super()
    this.Ports = []
  }
  Handle(Port){
    this.Ports.push(Port)
    if(Port.start){
      Port.start()
    }
    Port.addEventListener('message', ExchangeHandler.bind(this, Port, false))
  }
  request(type, message, port) {
    port = port || this.Ports[0]
    return new Promise((resolve, reject) => {
      const JobID = Exchange.randomId()
      var disposable = this.on(`JOB:${JobID}`, function(Message){
        disposable.dispose()
        if (Message.Status) resolve(Message.Result)
        else reject(Message.Result)
      })
      port.send({Type: type, Genre: 'send', Message: message, SB : true, ID: JobID})
    })
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
