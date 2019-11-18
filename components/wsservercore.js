// TODO better topic system
// // Ws Topics
// const topics = {
//   heartbeat: {
//     minInteral: 1000,
//     fn () {
//       return {
//         action: 'ping'
//       }
//     }
//   },
//   stats: {
//     minInteral: 1000,
//     fn ({ tools }) {
//       return {
//         mem: tools.stats.mem()
//       }
//     }
//   }
// }

module.exports = {
  name: 'wsservercore',
  title: 'wsservercore',
  description: `Websocket server for monitoring the nodes`,
  version: '1.0.0',
  color: '#656D78',
  options: {
    enabled: true
  },
  inputs: [
    {
      color: '#6BAD57',
      description: `targetRuntime`
    }
  ],
  outputs: [

  ],

  props: {
    path: { type: 'string', default: '/_system/ws' }
  },

  created ({ tools, log, on, options, status }) {
    const state = {}

    const warn = log

    const createws = () => {
      status('No client connected')

      const WebSocket = tools.ws
      const settings = {
        // port: 5050,
        // path: '/ws',
        server: tools.http.server, // Attach to main http server
        ...options // Merge with node settings
      }
      const wss = new WebSocket.Server(settings)

      const stringifySafe = obj => {
        try {
          return JSON.stringify(obj)
        } catch (err) {
          // TypeError: Converting circular structure to JSON ?
          warn("couldn't stringify object, message will contain empty string")
          return null
        }
      }

      const broadcast = (msgMixed) => {
        // console.log('MSG IN', msgMixed)

        const msg = stringifySafe(msgMixed)
        // log(`Currently ${wss.clients.size} clients connected`)
        // console.log('MSG toString', msg)

        // Broadcast to all
        wss.clients.forEach((client) => {
          // log('client')

          if (client.readyState === WebSocket.OPEN) {
            client.send(msg)
          }
        })
      }

      wss.on('connection', (ws, client) => {
        // log('Client connected', client)

        const updateStatus = () => status(`${ws && ws.online} client(s) connected`)

        ws.on('open', function (client) {
          updateStatus()
        })

        ws.on('close', function (client) {
          updateStatus()
        })

        ws.on('message', async (data) => {
          log(data)

          // Handle raw incoming message
          // console.log(data)
          const parsed = JSON.parse(data)
          const [action, payload] = parsed
          // console.log(action)

          const actionHandlers = {
            '/nodes': ({ action, payload }) => {
              // TODO
              return []
            },
            default: ({ action, payload }) => {
              return 'unsupported action'
            }
          }

          // Call action
          const fn = actionHandlers[action] || actionHandlers['default']

          const newPayload = await fn({ action, payload })
          const message = [action, newPayload]
          console.log('Sending', message)
          ws.send(JSON.stringify(message))
        })

        ws.on('error', function (err, client) {
          // instance.throw(err)
          throw new Error(err)
        })
      })

      log(`Websocket server setup as ws://0.0.0.0:${settings.port}/${settings.path} `)

      return { wss, broadcast }
    }

    // ================
    // Wait on targetRuntime
    // ================
    on('data:0', (targetRuntime) => {
      // log('WS Received', targetRuntime)
      state.targetRuntime = targetRuntime

      // Received the targetRuntime .. start up
      const { broadcast } = createws()

      const { bus } = targetRuntime

      // ================
      // Tap into runtime message system
      // ================
      bus.onAny((event, value) => {
        // log(event, value)
        // To all Websocket
        broadcast([
          event, value
        ])
      })
    })
  }
}
