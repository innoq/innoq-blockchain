const express = require('express')
const bodyParser = require('body-parser')
const SseChannel = require('sse-channel')

const homeController = require('./lib/controller/home')
const eventsController = require('./lib/controller/events')
const blocksController = require('./lib/controller/blocks')
const transactionsController = require('./lib/controller/transactions')
const miningController = require('./lib/controller/mining')
const nodesController = require('./lib/controller/nodes')

module.exports = (blockchain) => {
  const app = express()
  const sse = new SseChannel({jsonEncode: true})

  app.use(bodyParser.json())

  app.get('/', (req, res) => homeController.index(blockchain, req, res))
  app.get('/events', (req, res) => eventsController.index(blockchain, sse, req, res))
  app.get('/blocks', (req, res) => blocksController.index(blockchain, req, res))
  app.get('/blocks/:id', (req, res) => blocksController.get(blockchain, req, res))
  app.get('/mine', (req, res) => miningController.mine(blockchain, sse, req, res))
  app.get('/transactions/:id', (req, res) => transactionsController.get(blockchain, req, res))
  app.post('/transactions', (req, res) => transactionsController.new(blockchain, sse, req, res))
  app.post('/nodes/register', (req, res) => nodesController.register(blockchain, req, res))
  app.delete('/nodes/:id', (req, res) => nodesController.unregister(blockchain, req, res))
  app.get('/nodes/resolveChain', (req, res) => nodesController.resolveChain(blockchain, req, res))

  return app
}
