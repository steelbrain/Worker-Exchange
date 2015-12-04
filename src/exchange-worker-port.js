'use babel'

import {Disposable, Emitter, CompositeDisposable} from 'sb-event-kit'
import Communication from 'sb-communication'

export default class ExchangePort {
  constructor(port) {
    this.active = true
    this.port = port

    // Property initialization
    this.communication = new Communication()
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.communication, this.emitter)

    // Share data between communication and port
    const callback = message => {
      this.communication.parseMessage(message)
    }
    this.port.addEventListener('message', callback)
    this.subscriptions.add(new Disposable(() => {
      this.port.removeEventListener('message', callback)
    }))
    this.communication.onShouldSend(message => {
      this.port.postMessage(message)
    })

    // Start the port if it's a shared worker
    if (typeof this.port.start === 'function') {
      this.port.start()
    }

    // Check if the port is closed, we got no official close event
    let timeout
    const ping = () => {
      if (!this.active) {
        // Ignore if already disposed
        return
      }
      this.request('ping').then(function() {
        clearTimeout(timeout)
        setTimeout(ping, 1000)
      })
      timeout = setTimeout(() => {
        this.dispose()
      }, 1000)
    }
    ping()

    this.onRequest('ping', function(_, message) {
      message.response = 'pong'
    })
  }

  request(name, data = {}) {
    if (!this.active) {
      throw new Error('Worker port has been disposed')
    }

    return this.communication.request(name, data)
  }

  onRequest(name, callback) {
    return this.communication.onRequest(name, callback)
  }

  onDidClose(callback) {
    return this.emitter.on('close', callback)
  }

  dispose() {
    if (this.active) {
      this.port.close()
      this.emitter.emit('close')
      this.active = false
      this.subscriptions.dispose()
    }
  }
}
