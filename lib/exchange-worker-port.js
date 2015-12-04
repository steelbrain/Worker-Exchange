'use strict';
'use babel';

var _sbEventKit = require('sb-event-kit');

var _sbCommunication = require('sb-communication');

var _sbCommunication2 = _interopRequireDefault(_sbCommunication);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ExchangePort {
  constructor(port) {
    var _this = this;

    this.active = true;
    this.port = port;

    // Property initialization
    this.communication = new _sbCommunication2.default();
    this.emitter = new _sbEventKit.Emitter();
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.communication, this.emitter);

    // Share data between communication and port
    const callback = function (message) {
      _this.communication.parseMessage(message.data);
    };
    this.port.addEventListener('message', callback);
    this.subscriptions.add(new _sbEventKit.Disposable(function () {
      _this.port.removeEventListener('message', callback);
    }));
    this.communication.onShouldSend(function (message) {
      _this.port.postMessage(message);
    });

    // Check if the port is closed, we got no official close event
    let timeout;
    const ping = function () {
      if (!_this.active) {
        // Ignore if already disposed
        return;
      }
      _this.request('ping').then(function () {
        clearTimeout(timeout);
        setTimeout(ping, 1000);
      });
      timeout = setTimeout(function () {
        _this.dispose();
      }, 1000);
    };
    ping();

    this.onRequest('ping', function (_, message) {
      message.response = 'pong';
    });
  }

  request(name) {
    let data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (!this.active) {
      throw new Error('Worker port has been disposed');
    }

    return this.communication.request(name, data);
  }

  onRequest(name, callback) {
    return this.communication.onRequest(name, callback);
  }

  onDidClose(callback) {
    return this.emitter.on('close', callback);
  }

  dispose() {
    if (this.active) {
      this.port.close();
      this.emitter.emit('close');
      this.active = false;
      this.subscriptions.dispose();
    }
  }
}

module.exports = ExchangePort;