const utils = require('./utils')
const fetch = require('node-fetch')

module.exports = class Blockchain {
  constructor (nodeId) {
    this.nodeId = nodeId
    this.blocks = []
    this.nodes = {}
    this.transactions = new Map()

    const genesisBlock = {
      index: 1,
      timestamp: 0,
      proof: 955977,
      transactions: [{
        id: 'b3c973e2-db05-4eb5-9668-3e81c7389a6d',
        timestamp: 0,
        payload: 'I am Heribert Innoq'
      }],
      previousBlockHash: '0'
    }
    this.blocks.push(genesisBlock)
  }

  candidateBlock (previousBlockHash) {
    const first5txs = Array.from(this.transactions.values()).slice(0, 5)
    const candidate = {
      index: this.blocks.length + 1,
      timestamp: Date.now(),
      proof: 0,
      transactions: first5txs,
      previousBlockHash: previousBlockHash
    }
    return candidate
  }

  addBlock (block) {
    this.blocks.push(block)
    // TODO: validate block

    // remove blocks transactions from transactions pool
    block.transactions.forEach(transaction => {
      this.transactions.delete(transaction.id)
    })
    return true
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

  getTransactions () {
    return Array.from(this.transactions.values())
  }

  newTransaction (data) {
    const uuid = utils.generateUUID()
    const transaction = {
      id: uuid,
      timestamp: Date.now(),
      payload: data
    }
    this.transactions.set(uuid, transaction)
    return transaction
  }

  addTransaction (transaction) {
    // TODO: validate transaction
    this.transactions.set(transaction.id, transaction)
  }

  getTransaction (id) {
    let result

    if (this.transactions.has(id)) {
      result = Object.assign(this.transactions.get(id), { confirmed: false })
    }

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

  proofOfWork (candidateBlock) {
    let proof = 0
    while (!this.validateProof(candidateBlock)) {
      candidateBlock.proof = proof
      proof++
    }

    return candidateBlock
  }

  validateProof (candidateBlock) {
    const guessHash = this.hash(candidateBlock)
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

      if (!this.validateProof(block)) {
        console.log(`not a valid proof for block: ${block.index} block.proof: ${block.proof}`)
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
