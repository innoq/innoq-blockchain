const Blockchain = require('./../lib/blockchain')
const utils = require('./../lib/utils')

describe('Blockchain', () => {
  let blockchain

  beforeEach(() => {
    blockchain = new Blockchain()
  })

  test('genesis block creation', () => {
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

    expect(blockchain.blocks[0]).toEqual(genesisBlock)
  })

  test('block hashing', () => {
    const object = {
      index: 3,
      timestamp: 1523336396625,
      proof: 35089,
      previousBlockHash: 'b5f6109705661c31c4335287eb79447bf2bdffb46ba0807993f1ec6021462e80'
    }
    const expectedHash = 'bd796677453213fbfe7014407609ff4ecd65a1fb9acce01ad5da8eecfefd32ac'

    expect(blockchain.hash(object)).toEqual(expectedHash)
  })

  test('block hashing with unordered object attributes', () => {
    const o1 = { a: 'first', b: 123 }
    const o2 = { b: 123, a: 'first' }

    const hash1 = blockchain.hash(o1)
    const hash2 = blockchain.hash(o2)

    expect(hash1).toEqual(hash2)
  })

  test('block creation based on genesis block', () => {
    const previousBlock = blockchain.previousBlock()
    const previousBlockHash = blockchain.hash(previousBlock)
    const candidateBlock = blockchain.candidateBlock(previousBlockHash)
    const newBlock = blockchain.proofOfWork(candidateBlock)
    const newBlockHash = blockchain.hash(newBlock)
    blockchain.addBlock(newBlock)

    expect(blockchain.blocks).toHaveLength(2)
    expect(blockchain.blocks[1]).toEqual(newBlock)
    expect(/^0000/.test(newBlockHash)).toEqual(true)
  })

  test('proof finding', () => {
    const candidateBlock = {
      index: 2,
      timestamp: 1524027927349,
      proof: 0,
      transactions: [],
      previousBlockHash: '0000008793d0a9aa91ab9c336103383a6cfa034506b89ccbd2c73be655cce22a'
    }

    const newBlock = blockchain.proofOfWork(candidateBlock)
    const newBlockHash = blockchain.hash(newBlock)

    expect(newBlock.proof).toEqual(56624)
    expect(newBlockHash).toEqual('0000cfce364bd41d74d4b402bd45f7f7c52e757bb9c34364a4225216b5f83ba0')
  })

  test('correct proof validation', () => {
    const candidateBlock = {
      index: 2,
      timestamp: 1524027927349,
      proof: 56624,
      transactions: [],
      previousBlockHash: '0000008793d0a9aa91ab9c336103383a6cfa034506b89ccbd2c73be655cce22a'
    }

    const valid = blockchain.validateProof(candidateBlock)

    const blockString = JSON.stringify(candidateBlock, Object.keys(candidateBlock).sort())
    const blockhash = utils.sha256sum(blockString)

    expect(/^0000/.test(blockhash)).toEqual(true)
    expect(valid).toEqual(true)
  })

  test('false proof validation', () => {
    const candidateBlock = {
      index: 2,
      timestamp: 1524027927349,
      proof: 0,
      transactions: [],
      previousBlockHash: '0000008793d0a9aa91ab9c336103383a6cfa034506b89ccbd2c73be655cce22a'
    }

    const valid = blockchain.validateProof(candidateBlock)

    const blockString = JSON.stringify(candidateBlock, Object.keys(candidateBlock).sort())
    const blockhash = utils.sha256sum(blockString)

    expect(/^0000/.test(blockhash)).toEqual(false)
    expect(valid).toEqual(false)
  })

  test('correct chain validation', () => {
    const correctChain = [
      {
        index: 1,
        timestamp: 0,
        proof: 955977,
        transactions: [{
          id: 'b3c973e2-db05-4eb5-9668-3e81c7389a6d',
          timestamp: 0,
          payload: 'I am Heribert Innoq'
        }],
        previousBlockHash: '0'
      },
      {
        index: 2,
        timestamp: 1524036744098,
        proof: 437,
        transactions: [],
        previousBlockHash: '0000008793d0a9aa91ab9c336103383a6cfa034506b89ccbd2c73be655cce22a'
      }
    ]

    expect(blockchain.validateChain(correctChain)).toEqual(true)
  })

  test('false chain validation', () => {
    const incorrectChain = [
      {
        index: 1,
        timestamp: 0,
        proof: 955977,
        transactions: [{
          id: 'b3c973e2-db05-4eb5-9668-3e81c7389a6d',
          timestamp: 0,
          payload: 'I am Heribert Innoq'
        }],
        previousBlockHash: '0'
      },
      {
        index: 2,
        timestamp: 1524028962190,
        proof: 29270,
        transactions: [],
        previousBlockHash: 'My Fake hash'
      }
    ]

    expect(blockchain.validateChain(incorrectChain)).toEqual(false)
  })
})
