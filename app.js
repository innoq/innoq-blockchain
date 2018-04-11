const express = require('express')
const bodyParser = require('body-parser')
const SSE = require('express-sse')
const EventSource = require('eventsource')

module.exports = (blockchain) => {
  const app = express()
  const sse = new SSE(blockchain.blocks)

  app.use(bodyParser.json())

  app.get('/', (req, res) => {
    console.log('GET / invoked')

    res.json({
      nodeId: blockchain.nodeId,
      currentBlockHeight: blockchain.blocks.length,
      neighbours: blockchain.getNodes()
    })
  })

  app.get('/chain', (req, res) => {
    console.log('GET /chain invoked')

    res.json({
      blocks: blockchain.blocks,
      blockHeight: blockchain.blocks.length
    })
  })

  app.get('/events', sse.init)

  app.get('/mine', (req, res) => {
    console.log('GET /mine invoked')

    const previousBlock = blockchain.previousBlock()
    const previousProof = previousBlock.proof
    const proof = blockchain.proofOfWork(previousProof)

    const previousBlockHash = blockchain.hash(previousBlock)
    const newBlock = blockchain.newBlock(proof, previousBlockHash)

    console.log('We found a new block', newBlock)
    sse.send(newBlock, 'new_block')

    res.json({
      message: 'New block found',
      block: newBlock
    })
  })

  app.post('/nodes/register', (req, res) => {
    console.log('POST /nodes/register invoked')

    const { nodeId, host } = req.body || []

    if (nodeId && host) {
      const node = blockchain.registerNode(nodeId, host)

      // connect to new node event stream
      const eventSource = `${host}/events`
      const stream = new EventSource(eventSource)
      stream.addEventListener('new_block', (event) => {
        console.log(`node ${host} found a new block: `, event.data)
        blockchain.updateChain()
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

  app.get('/nodes/resolveChain', (req, res) => {
    console.log('GET /nodes/resolveChain invoked')

    blockchain.updateChain()
      .then((updatedChain) => {
        if (updatedChain) {
          res.json({
            message: 'Our chain was updated with a newer one.',
            newChain: blockchain.blocks
          })
        } else {
          res.json({
            message: 'Our chain is up to date.',
            chain: blockchain.blocks
          })
        }
      })
      .catch((err) => {
        console.error('An error occured', err)
        res.status(502).send('Could not update chain.')
      })
  })

  return app
}
