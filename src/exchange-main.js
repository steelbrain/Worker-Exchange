'use babel'

import {CompositeDisposable} from 'sb-event-kit'
import Communication from 'sb-communication'

export default class Exchange {
  constructor(worker) {
    this.worker = worker
    this.port = worker.port || worker

    this.communication = new Communication()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.communication)

    const callback = message => {
      this.communication.parseMessage(message)
    }
    this.worker.addEventListener('message', callback)
    this.subscriptions.add({
      dispose: () => {
        this.worker.removeEventListener('message', callback)
      }
    })
    this.communication.onShouldSend(message => {
      this.port.postMessage(message)
    })
  }

  request(name, data = {}) {
    return this.communication.request(name, data)
  }

  onRequest(name, callback) {
    return this.communication.onRequest(name, callback)
  }

  terminate() {
    this.worker.terminate()
    this.dispose()
  }
  dispose() {
    this.subscriptions.dispose()
  }
}
