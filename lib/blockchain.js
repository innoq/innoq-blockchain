const utils = require('./utils')
const fetch = require('node-fetch')

module.exports = class Blockchain {
  constructor (nodeId) {
    this.nodeId = nodeId

    this.chaindata = []
    this.nodes = new Set()

    const genesisBlock = this.newBlock(100, '1')
    console.log('genesis block created', genesisBlock)
  }

  newBlock (proof, previousBlockHash) {
    const block = {
      index: this.chaindata.length + 1,
      timestamp: Date.now(),
      proof: proof,
      previousBlockHash: previousBlockHash
    }

    this.chaindata.push(block)

    return block
  }

  hash (block) {
    const blockString = JSON.stringify(block, Object.keys(block).sort())
    const result = utils.sha256sum(blockString)

    return result
  }

  previousBlock () {
    const previousBlockIndex = this.chaindata.length - 1
    return this.chaindata[previousBlockIndex]
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

  getNodes () {
    return Array.from(this.nodes)
  }

  registerNode (nodeId, host) {
    const node = {
      nodeId, host
    }
    console.log('add new node: ', node)
    this.nodes.add(node)

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

    this.nodes.forEach((node) => {
      const host = `${node.host}/chain`
      const fetchedNode = fetch(host)
        .then(res => {
          if (res.ok) return res.json()
        })
        .then(json => json)
      fetchedNodes.push(fetchedNode)
    })

    return Promise.all(fetchedNodes).then((chains) => {
      let newChain = null
      let maxLength = this.chaindata.length

      chains.forEach((chain) => {
        if (chain.blockHeight > maxLength && this.validateChain(chain)) {
          maxLength = chain.blockHeight
          newChain = chain.data
        }
      })

      console.log('newChain', newChain)

      if (newChain) {
        console.log('We found a longer chain')
        this.chaindata = newChain
      }

      return !!newChain
    })
  }
}
