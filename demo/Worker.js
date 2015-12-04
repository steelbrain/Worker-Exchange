'use strict'

importScripts('../exchange.js');
exchange.onRequest('hello', function(data, message) {
  message.response = 'Hello ' + data.from
})
