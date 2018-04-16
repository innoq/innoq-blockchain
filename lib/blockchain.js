const utils = require('./utils')
const fetch = require('node-fetch')

module.exports = class Blockchain {
  constructor (nodeId) {
    this.nodeId = nodeId
    this.blocks = []
    this.nodes = {}
    this.transactions = []

    const genesisBlock = {
      index: 1,
      timestamp: 0,
      proof: 0,
      transactions: [{
        id: 'b3c973e2-db05-4eb5-9668-3e81c7389a6d',
        timestamp: 0,
        payload: 'I am Heribert Innoq'
      }],
      previousBlockHash: '0'
    }
    this.blocks.push(genesisBlock)
  }

  newBlock (proof, previousBlockHash) {
    const first5txs = this.transactions.splice(0, 5) || []
    const block = {
      index: this.blocks.length + 1,
      timestamp: Date.now(),
      proof: proof,
      transactions: first5txs,
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

  getBlock (index) {
    return this.blocks[index - 1]
  }

  previousBlock () {
    const previousBlockIndex = this.blocks.length - 1
    return this.blocks[previousBlockIndex]
  }

  newTransaction (data) {
    const transaction = {
      id: utils.generateUUID(),
      timestamp: Date.now(),
      payload: data
    }
    this.transactions.push(transaction)
    return transaction
  }

  getTransaction (id) {
    let result

    // FIXME: uggly transactions lookup
    this.transactions.forEach(transaction => {
      if (transaction.id === id) {
        result = Object.assign(transaction, { confirmed: false })
      }
    })

    // FIXME: uggly block lookup
    if (!result) {
      this.blocks.forEach(block => {
        block.transactions.forEach(transaction => {
          if (transaction.id === id) {
            result = Object.assign(transaction, { confirmed: true })
          }
        })
      })
    }

    return result
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

  unregisterNode (nodeId) {
    const node = this.nodes[nodeId]
    delete this.nodes[nodeId]
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
      const host = `${this.nodes[nodeId]}/blocks`
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
