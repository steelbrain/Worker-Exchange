// @Compiler-Output "../dist/Exchange.js"
// @Compiler-Transpile "true"
// @Compiler-Compress "true"
// @Compiler-Browserify "true"

const EventEmitter = require('zm-event-kit').Emitter
const ExchangeHandler = require('./ExchangeHandler')
class Exchange extends EventEmitter{
  /**
   * Worker =  SharedWorker || Worker
   * Message = shape(Type => enum{Request, Broadcast, Reply}, SubType => ?string, Message => string)
   */
  constructor(Path, Type, Debug){
    super()
    Type = Type || Exchange.NORMAL
    Debug = Boolean(Debug)

    if (Type === Exchange.NORMAL) {
      this.Port = this.Worker = new Worker(Path)
    } else {
      this.Worker = new SharedWorker(Path)
      this.Port = this.Worker.port
    }

    this.Port.addEventListener('message', ExchangeHandler.bind(this, this.Port, Debug))
    if(this.Port.start){
      this.Port.start()
    }
    this.on('debug', function(Message){
      if(Debug)
        console.debug(Message)
    })
    this.request('INIT')
  }
  request(type, message) {
    return new Promise((resolve, reject) => {
      const JobID = Exchange.randomId()
      var disposable = this.on(`JOB:${JobID}`, function(Message){
        disposable.dispose()
        if (Message.Status) resolve(Message.Result)
        else reject(Message.Result)
      })
      this.Port.postMessage({Type: type, Genre: 'send', Message: message, SB : true, ID: JobID})
    })
  }
  Terminate(){
    if(this.Type === Exchange.NORMAL){
      this.Worker.terminate()
    } else {
      this.Port.close()
    }
  }
  static randomId() {
    return (Math.random().toString(36)+'00000000000000000').slice(2, 7+2)
  }
}
Exchange.SHARED = 'SHARED'
Exchange.NORMAL = 'NORMAL'

window.Exchange = Exchange
module.exports = Exchange
