const express = require('express')
const bodyParser = require('body-parser')
const SSE = require('express-sse')
const EventSource = require('eventsource')

module.exports = (blockchain) => {
  const app = express()
  const sse = new SSE(blockchain.chaindata)

  app.use(bodyParser.json())

  app.get('/node', (req, res) => {
    res.json({
      nodeId: blockchain.nodeId
    })
  })

  app.get('/chain', (req, res) => {
    res.json({
      data: blockchain.chaindata,
      height: blockchain.chaindata.length
    })
  })

  app.get('/events', sse.init)

  app.get('/mine', (req, res) => {
    const previousBlock = blockchain.previousBlock()
    const previousProof = previousBlock.proof
    const proof = blockchain.proofOfWork(previousProof)

    const previousBlockHash = blockchain.hash(previousBlock)
    const newBlock = blockchain.newBlock(proof, previousBlockHash)

    sse.send(newBlock, 'new_block')

    res.json({
      message: 'New block found',
      block: newBlock
    })
  })

  app.get('/info', (req, res) => {
    res.json({
      nodeId: blockchain.nodeId,
      currentBlockHeight: blockchain.chaindata.length,
      neighbours: blockchain.getNodes()
    })
  })

  app.post('/nodes/register', (req, res) => {
    const { nodeId, host } = req.body || []

    if (nodeId && host) {
      const node = blockchain.registerNode(nodeId, host)

      // connect to node event stream
      const eventSource = `${host}/events`
      const stream = new EventSource(eventSource)
      stream.addEventListener('new_block', (event) => {
        console.log(`node ${host} found a new block: `, event.data)
      })

      res.status(201).json({
        message: 'New node added',
        node
      })
    } else {
      res.status(400).json({
        message: 'Error: no node provided'
      })
    }
  })

  return app
}
