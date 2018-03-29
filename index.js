const App = require('./app')
const Blockchain = require('./lib/blockchain')
const utils = require('./lib/utils')

const port = process.env.PORT || 8333
const nodeId = utils.generateNodeId()
const blockchain = new Blockchain(nodeId)
const app = App(blockchain)

app.listen(port, () => {
  console.log(`starting blockchain server on http://localhost:${port}`)
})
