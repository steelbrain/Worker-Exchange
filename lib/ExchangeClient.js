

// @Compiler-Output "../Dist/ExchangeClient.js"
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
    let Me = this
    if(Port.start){
      Port.start()
    }
    Port.addEventListener('message', ExchangeHandler.bind(this))
  }
  request(type, message, port) {
    port = port || this.Ports[0]
    return new Promise((resolve, reject) => {
      const JobID = Exchange.randomId()
      this.once(`JOB:${JobID}`, function(Message){
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
  Myself.removeEventListener('message', Once)
})
self.addEventListener('connect', function(e){
  // I am a shared worker
  Exchange.Handle(e.ports[0])
})
