const express = require('express')
const SSE = require('express-sse')

module.exports = (blockchain) => {
  const app = express()
  const sse = new SSE(blockchain.chaindata)

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

  return app
}
