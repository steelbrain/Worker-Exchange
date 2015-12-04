describe('Worker-Exchange', function() {

  const script = document.createElement('script')

  const Exchange = require(__dirname + '/../exchange.js')

  describe('dedicated worker', function() {
    it('works as expected', function() {
      const worker = Exchange.create(__dirname + '/fixtures/worker.js')
      worker.onRequest('counter', function(data, message) {
        expect(data).toBe('counter')
        message.response = 'attack'
      })
      waitsForPromise(function() {
        return worker.request('hello', 'world').then(function(response) {
          expect(response).toBe('steel')
        })
      })
    })
  })

  describe('shared worker', function() {
    it('works as expected', function() {
      const worker = Exchange.createShared(__dirname + '/fixtures/worker.js')
      worker.onRequest('counter', function(data, message) {
        expect(data).toBe('counter')
        message.response = 'attack'
      })
      waitsForPromise(function() {
        return worker.request('hello', 'world').then(function(response) {
          expect(response).toBe('steel')
        })
      })
    })
  })
})
