const utils = require('./utils')

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
      height: this.chaindata.length + 1,
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
    return /^0000/.test(guessHash)
  }
}
