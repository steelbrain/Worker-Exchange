'use strict'

if (typeof document === 'undefined') {
  // We're in a worker
  const Exchange = require('./exchange-worker')
  const exchange = new Exchange()
  self.addEventListener('message', function Once(){
    // I am a dedicated worker
    exchange.addPort(self)
    self.removeEventListener('message', Once)
  })
  self.addEventListener('connect', function(e){
    // I am a shared worker
    const port = e.ports[0]
    exchange.addPort(port)
    port.start()
  })
  module.exports = Exchange
  self.exchange = exchange
} else {
  // We're in a host
  module.exports = require('./exchange-main')
}
