module.exports = {
  name: 'corelistroutes',
  title: 'corelistroutes',
  version: '1.0.0',
  color: '#656D78',
  inputs: [
    {
      color: '#6BAD57',
      description: `Request`
    }
  ],
  outputs: [

  ],
  mounted ({ on }) {
    on('data', async (ctx) => {
      ctx.body = ctx.router.stack
      // .map(i => `${i.methods} ${i.path}`)
    })
  }
}