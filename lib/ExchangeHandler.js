function ExchangeHandler(Port, Debug, e) {
  if (!e.data || !e.data.SB) return // Ignore Non-Exchange Messages

  const message = e.data
  if (Debug)
    console.debug(message)

  if (message.Genre === 'send') {
    message.response = null
    let response
    try  {
      this.emit(message.Type, message)
      response = message.response instanceof Promise ? message.response : Promise.resolve(message.response)
    } catch (err) {
      response = Promise.reject(err)
    }
    response.then(retVal => {
      Port.postMessage({Genre: 'response', Status: true, Result: retVal, ID: message.ID, SB: true})
    }, retVal => {
      if (retVal instanceof Error) {
        retVal = {stack: retVal.stack, message: retVal.message}
      }
      Port.postMessage({Genre: 'response', Status: false, Result: retVal, ID: message.ID, SB: true})
    })
  } else if(message.Genre === 'response') {
    this.emit(`JOB:${message.ID}`, message)
  }
}

module.exports = ExchangeHandler
