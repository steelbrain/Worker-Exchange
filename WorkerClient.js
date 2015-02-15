class Exchange{
  worker:Worker;
  callbacks:Object;
  Triggers:Object;
  debug:Boolean;
  constructor(url:String){
    var self = this;
    this.worker = new Worker(url);
    this.callbacks = {};
    this.Triggers = {};
    this.debug = false;
    this.worker.addEventListener('message',function(e){
      var data = e.data;
      if(self.debug || data.Type === 'debug'){
        console.debug(data);
      } else if(data.Type === 'error'){
        console.error(data);
      }
      self.Trigger(data.Type,{ID:data.ID,Data:data.Data,Result:null});
    });
    this.On('job',function(params){
      var id = params.ID;
      self.callbacks[id](params.Data);
      delete self.callbacks[id];
    });
  }
  Start(){
    this.Send('welcome');
  }
  Trigger(name:String,params:Object):void{
    if(this.Triggers.hasOwnProperty(name)){
      for(var i in this.Triggers[name]){
        if(this.Triggers[name].hasOwnProperty(i)){
          this.Triggers[name][i](params);
        }
      }
    }
  }
  On(name:String,callback:Function):void{
    var chunks = name.split('.');
    if(typeof chunks[1] === 'undefined'){
      chunks[1] = Exchange.Random();
    }
    if(typeof this.Triggers[chunks[0]] === 'undefined'){
      this.Triggers[chunks[0]] = {};
    }
    this.Triggers[chunks[0]][chunks[1]] = callback;
  }
  Off(name:String):void{
    var self = this;
    var chunks = name.split('.');
    if(typeof chunks[1] === 'undefined'){
      delete self.Triggers[chunks[1]];
    } else {
      delete self.Triggers[chunks[0]][chunks[1]];
    }
  }
  Broadcast(type:String,params:Object):void{
    params = params || {};
    this.worker.postMessage({Type:type,Data:params,ID:null});
  }
  Send(type:String,params:Object):Promise{
    var self = this;
    params = params || {};
    return new Promise(function(resolve){
      var random = Exchange.Random();
      self.callbacks[random] = resolve;
      self.worker.postMessage({Type:type,Data:params,ID:random});
    });
  }
  Finished(job:Object):void{
    this.worker.postMessage({Type:"job",Data:job.Result,ID:job.id});
  }
  static Random():String{
    return (Math.random() + 1).toString(36).substring(7);
  }
}