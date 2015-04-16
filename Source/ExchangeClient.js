

"use strict";
let Myself = self;
class Exchange extends EventEmitter{
  constructor(){
    super();
    this.Ports = [];
  }
  Handle(Port){
    this.Ports.push(Port);
    let Me = this;
    if(this.Type === Exchange.SHARED){
      Port.start();
    }
    Port.addEventListener('message', function(e){
      let Data = e.data;
      if(!Data || !Data.EXCHANGE) return; // Ignore Non-Exchange Messages
      if(Data.Type === 'Request'){
        Data.Result = null;
        Data.Port = Port;
        Me.emit(Data.SubType, Data.Message, Data, Port);
        Me.emit('All', Data.Message, Data);
      } else if(Data.Type === 'Broadcast'){
        Me.emit(Data.SubType, Data.Message, Data, Port);
        Me.emit('All', Data.Message, Data);
      } else if (Data.Type === 'Reply'){
        Me.emit(`JOB:${Data.ID}`, Data.Message, Port);
      }
    }, false);
  }
  Send(Type, Message, Port){
    Port = Port || this.Ports[0];
    Message = Message || '';
    Port.postMessage({Type: 'Broadcast', SubType: Type, Message: Message, EXCHANGE: true});
    return this;
  }
  Request(Type, Message, Port){
    Port = Port || this.Ports[0];
    Message = Message || '';
    let Me = this;
    return new Promise(function(Resolve){
      let JobID = (Math.random().toString(36)+'00000000000000000').slice(2, 7+2);
      Me.once(`JOB:${JobID}`, Resolve);
      Port.postMessage({Type: 'Request', SubType: Type, Message: Message, ID: JobID, EXCHANGE: true});
    });
  }
  Finished(Job){
    Job.Port.postMessage({Type: 'Reply', ID: Job.ID, Message: Job.Result, EXCHANGE: true});
  }
}
Exchange = new Exchange;
Exchange.Type = null;
Exchange.SHARED = 'SHARED';
Exchange.NORMAL = 'NORMAL';
self.addEventListener('message', function Once(){
  // I am a dedicated worker
  Exchange.Type = Exchange.NORMAL;
  Exchange.Handle(Myself);
  Myself.removeEventListener('message', Once);
});
self.addEventListener('connect', function(e){
  // I am a shared worker
  Exchange.Type = Exchange.SHARED;
  Exchange.Handle(e.ports[0]);
});