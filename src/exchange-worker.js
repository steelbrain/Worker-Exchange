'use babel'

import {Emitter, CompositeDisposable} from 'sb-event-kit'
import ExchangePort from './exchange-worker-port'

export default class Exchange {
  constructor() {
    this.ports = new Set()
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.emitter)
  }

  addPort(port) {
    const exchangePort = new ExchangePort(port)
    this.ports.add(exchangePort)
    this.subscriptions.add(exchangePort)
    exchangePort.onDidClose(() => {
      this.ports.delete(exchangePort)
      this.subscriptions.remove(exchangePort)
      this.emitter.emit('port-close', exchangePort)
    })
    this.emitter.emit('port-add', exchangePort)
  }

  forEach(callback) {
    this.ports.forEach(callback)
  }
  observe(callback) {
    this.forEach(callback)
    return this.onDidPortAdd(callback)
  }
  onDidPortAdd(callback) {
    return this.emitter.on('port-add', callback)
  }
  onDidPortClose(callback) {
    return this.emitter.on('port-close', callback)
  }

  dispose() {
    this.subscriptions.dispose()
  }
}
