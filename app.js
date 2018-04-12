const express = require('express')
const bodyParser = require('body-parser')
const SSE = require('express-sse')

const homeController = require('./lib/controller/home')
const blocksController = require('./lib/controller/blocks')
const transactionsController = require('./lib/controller/transactions')
const miningController = require('./lib/controller/mining')
const nodesController = require('./lib/controller/nodes')

module.exports = (blockchain) => {
  const app = express()
  const sse = new SSE(blockchain.blocks)

  app.use(bodyParser.json())

  app.get('/', (req, res) => homeController.index(blockchain, req, res))
  app.get('/events', sse.init)
  app.get('/blocks', (req, res) => blocksController.index(blockchain, req, res))
  app.get('/blocks/:id', (req, res) => blocksController.get(blockchain, req, res))
  app.get('/mine', (req, res) => miningController.mine(blockchain, sse, req, res))
  app.get('/transactions/:id', (req, res) => transactionsController.get(blockchain, req, res))
  app.post('/transactions', (req, res) => transactionsController.new(blockchain, sse, req, res))
  app.post('/nodes/register', (req, res) => nodesController.register(blockchain, req, res))
  app.get('/nodes/resolveChain', (req, res) => nodesController.resolveChain(blockchain, req, res))

  return app
}
