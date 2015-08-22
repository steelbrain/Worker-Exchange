// @Compiler-Output "../dist/Exchange.js"
// @Compiler-Transpile "true"
// @Compiler-Browserify "true"

const ExchangeCommunication = require('sb-communication')

class Exchange{
  /**
   * Worker =  SharedWorker || Worker
   * Message = shape(Type => enum{Request, Broadcast, Reply}, SubType => ?string, Message => string)
   */
  constructor(Path, Type, Debug){
    Type = Type || Exchange.NORMAL
    Debug = Boolean(Debug)

    if (Type === Exchange.NORMAL) {
      this.Port = this.Worker = new Worker(Path)
    } else {
      this.Worker = new SharedWorker(Path)
      this.Port = this.Worker.port
    }

    this.sendCallback = data => { this.Port.postMessage(data) }
    this.Communication = new ExchangeCommunication(Debug)
    this.Port.addEventListener('message', message => { this.Communication.gotMessage(this.sendCallback, message.data) })
    if(this.Port.start){
      this.Port.start()
    }
    this.on('debug', function(Message){
      if(Debug) console.debug(Message)
    })
    this.request('INIT')
  }
  on(type, message) {
    return this.Communication.on(type, message)
  }
  request(type, message) {
    return this.Communication.request(this.sendCallback, type, message)
  }
  terminate(){
    if (this.Port.terminate) {
      this.Port.terminate()
    } else if(this.Port.close) {
      this.Port.close()
    }

  }
}
Exchange.SHARED = 'SHARED'
Exchange.NORMAL = 'NORMAL'

window.Exchange = Exchange
module.exports = Exchange
