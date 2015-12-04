'use strict'

importScripts('../../exchange.js')

exchange.onRequest('hello', function(data, message) {
  if (data !== 'world') {
    message.response = 'invalid parameter'
  } else {
    let port = null
    exchange.forEach(function(_port) {
      port = _port
    })
    message.response = port.request('counter', 'counter').then(function(response) {
      if (response === 'attack') {
        return 'steel'
      } else return 'invalid response'
    })
  }
})
