class LeWorker{
  Triggers:Object;
  Callbacks:Object;
  Worker:Object;
  constructor(Worker){
    this.Worker = Worker;
    this.Triggers = {};
    this.Callbacks = {};
    this.Worker.addEventListener('message',function(e){
      if(typeof e.data !== 'object'){
        this.Error("Invalid Arguments");
        this.Error(e.data);
      }
      this.Trigger(e.data.Type,{ID:e.data.ID,Data:e.data.Data,Result:null});
    }.bind(this));
    this.On('job', function(params) {
      var id = params.ID;
      this.Callbacks[id](params.Data);
      delete this.Callbacks[id];
    }.bind(this));
    this.Broadcast('welcome');
    // Just in case, we're bored and want to ping our web worker
    this.On('ping',function(job){
      job.Result = 'Yesh It works';
      this.Finished(job);
    }.bind(this));
  }
  Finished(Job){
    this.Worker.postMessage({Type:'job',Data:Job.Result,ID:Job.ID});
  }
  Send(type:String,data:Object){
    var self = this;
    data = data || {};
    return new Promise(function(resolve){
      var id = (Math.random()+1).toString(36).substring(7);
      try {
        if(this.Callbacks === null)return;
        this.Callbacks[id] = resolve;
        this.Worker.postMessage({Type:type,ID:id,Data:data});
      } catch(Error){
        this.Error("Error Caught");
        this.Error(Error);
      }
    }.bind(this));
  }
  Broadcast(type:String,data:Object){
    data = data || {};
    this.Worker.postMessage({Type:type,ID:null,Data:data});
  }
  Debug(message){
    this.Worker.postMessage({Type:"Debug",ID:null,Data:message});
  }
  Error(message){
    this.Worker.postMessage({Type:"Error",ID:null,Data:message});
  }
  Trigger(name:String,params:Object){
    if(this.Triggers !== null && this.Triggers.hasOwnProperty(name)){
      for(var i in this.Triggers[name]){
        if(this.Triggers[name].hasOwnProperty(i)){
          this.Triggers[name][i](params);
        }
      }
    }
  }
  On(type:String,callback:Function){
    var chunks = type.split('.');
    if(typeof chunks[1]  === 'undefined'){
      chunks[1] = (Math.random()+1).toString(36).substring(7);
    }
    if(typeof this.Triggers[chunks[0]] === 'undefined'){
      this.Triggers[chunks[0]] = {};
    }
    this.Triggers[chunks[0]][chunks[1]] = callback;
  }
  Off(type:String){
    var chunks = type.split('.');
    if(typeof chunks[1] === 'undefined'){
      delete this.Triggers[chunks[0]];
    } else {
      delete this.Triggers[chunks[0]][chunks[1]];
    }
  }
}
var DWorker = new LeWorker(self);