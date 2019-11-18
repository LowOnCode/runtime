/**
 * The main entry for the locruntime
 */

// const Core = require('./lib/core')
const Runtime = require('./lib/Runtime')
const { save } = require('./lib/utils')
const monitor = require('./monitor')

// Factory
const createRuntime = (variables) => {
  const runtime = new Runtime(variables)
  return runtime
}

module.exports = {
  createRuntime,

  // Start up REST & WebSocket for logging a runtime
  async start (targetRuntime, {
    logs = `${__dirname}/tmp`
  } = {}) {
    // Get the components of the target runtime
    const targetComponents = targetRuntime.getComponents()

    // (Optional) Create tmp file for debugging
    await targetRuntime.savePretty(targetComponents, `${logs}/components.json`)

    // ============
    // Monitor Server
    // const { bus } = targetRuntime
    // bus.onAny(function (event, value) {
    //   // console.log(event, value)
    //   // To Websocket
    // })
    // targetRuntime.bus.on('*', (payload) => {
    //   console.log('cool', payload)
    // })
    // ============

    // TODO: change core.json to not use filesystem ?
    const design = targetRuntime.getDesign()
    save(design, `${logs}/design.json`)

    // ============
    // Create monitor from design ( Yes, even for the core we use a lowoncode design )
    // ============
    // Inject these variable
    const variables = {
      targetRuntime
    }
    const runtime = createRuntime(variables)

    // Load needed components for the core design
    await runtime.loadComponents(`${__dirname}/components`)

    // Load core design and run it and inject it with the targetRuntime
    await runtime.loadAndRun(`${__dirname}/monitor.json`, targetRuntime)

    // Setup REST monitor programmaticly
    monitor({
      runtime,
      targetRuntime
    })
  }
}
