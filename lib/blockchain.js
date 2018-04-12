const utils = require('./utils')
const fetch = require('node-fetch')

module.exports = class Blockchain {
  constructor (nodeId) {
    this.nodeId = nodeId
    this.blocks = []
    this.nodes = {}

    const genesisBlock = {
      index: 1,
      timestamp: 0,
      proof: 0,
      previousBlockHash: '0'
    }
    this.blocks.push(genesisBlock)
  }

  newBlock (proof, previousBlockHash) {
    const block = {
      index: this.blocks.length + 1,
      timestamp: Date.now(),
      proof: proof,
      previousBlockHash: previousBlockHash
    }

    this.blocks.push(block)

    return block
  }

  hash (block) {
    const blockString = JSON.stringify(block, Object.keys(block).sort())
    const result = utils.sha256sum(blockString)

    return result
  }

  previousBlock () {
    const previousBlockIndex = this.blocks.length - 1
    return this.blocks[previousBlockIndex]
  }

  proofOfWork (lastProof) {
    let proof = 0
    while (!this.findProof(lastProof, proof)) {
      proof++
    }

    return proof
  }

  findProof (lastProof, proof) {
    const guess = `${lastProof}${proof}`
    const guessHash = utils.sha256sum(guess)
    // console.log(`proof: ${proof} - sha256(${guess}) => ${guessHash}`)
    return /^0000/.test(guessHash)
  }

  registerNode (nodeId, host) {
    const node = {
      nodeId, host
    }
    this.nodes[nodeId] = host
    return node
  }

  validateChain (chain) {
    let index = 1

    while (index < chain.length) {
      const previousBlock = chain[index - 1]
      const block = chain[index]

      if (block.previousBlockHash !== this.hash(previousBlock)) {
        console.log('previousBlockHash !== blockhash')
        return false
      }

      if (!this.findProof(previousBlock.proof, block.proof)) {
        console.log(`not a valid proof - previousBlock.proof: ${previousBlock.proof} block.proof: ${block.proof}`)
        return false
      }

      index++
    }

    return true
  }

  updateChain () {
    const fetchedNodes = []

    Object.keys(this.nodes).forEach((nodeId) => {
      const host = `${this.nodes[nodeId]}/chain`
      const fetchedNode = fetch(host)
        .then(res => {
          if (res.ok) return res.json()
        })
      fetchedNodes.push(fetchedNode)
    })

    return Promise.all(fetchedNodes).then((chains) => {
      let newChain = null
      let maxLength = this.blocks.length

      chains.forEach((chain) => {
        if (chain.blockHeight > maxLength && this.validateChain(chain)) {
          maxLength = chain.blockHeight
          newChain = chain.blocks
        }
      })

      if (newChain) {
        console.log('We found a longer chain')
        this.blocks = newChain
      }

      return !!newChain
    })
  }
}
