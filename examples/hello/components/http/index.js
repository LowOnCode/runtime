module.exports = {
  name: 'http',
  version: '0.0.1',
  description: 'Component to interact with http',
  components: [
    require('./response'),
    require('./route'),
    require('./routetest')
    // require('./proxy')
  ]
}