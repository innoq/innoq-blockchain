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
      proof: 1917336,
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
      index: 2,
      timestamp: 1524178625735,
      proof: 2645,
      transactions: [],
      previousBlockHash: '000000b642b67d8bea7cffed1ec990719a3f7837de5ef0f8ede36537e91cdc0e'
    }
    const expectedHash = '000003fe5a936ffc57e2474c8bb7bd5a95959a5d40fde30c079f1a2c818179c7'

    expect(blockchain.hash(object)).toEqual(expectedHash)
  })

  // test('block hashing with unordered object attributes', () => {
  //   const o1 = { a: 'first', b: 123 }
  //   const o2 = { b: 123, a: 'first' }
  //
  //   const hash1 = blockchain.hash(o1)
  //   const hash2 = blockchain.hash(o2)
  //
  //   expect(hash1).toEqual(hash2)
  // })

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
      timestamp: 1524178625735,
      proof: 0,
      transactions: [],
      previousBlockHash: '000000b642b67d8bea7cffed1ec990719a3f7837de5ef0f8ede36537e91cdc0e'
    }

    const newBlock = blockchain.proofOfWork(candidateBlock)
    const newBlockHash = blockchain.hash(newBlock)

    expect(newBlock.proof).toEqual(2645)
    expect(newBlockHash).toEqual('000003fe5a936ffc57e2474c8bb7bd5a95959a5d40fde30c079f1a2c818179c7')
  })

  test('correct proof validation', () => {
    const block = {
      index: 2,
      timestamp: 1524178625735,
      proof: 2645,
      transactions: [],
      previousBlockHash: '000000b642b67d8bea7cffed1ec990719a3f7837de5ef0f8ede36537e91cdc0e'
    }

    const valid = blockchain.validateProof(block)

    const blockString = JSON.stringify(block)
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
        proof: 1917336,
        transactions: [{
          id: 'b3c973e2-db05-4eb5-9668-3e81c7389a6d',
          timestamp: 0,
          payload: 'I am Heribert Innoq'
        }],
        previousBlockHash: '0'
      },
      {
        index: 2,
        timestamp: 1524178884454,
        proof: 4607,
        transactions: [],
        previousBlockHash: '000000b642b67d8bea7cffed1ec990719a3f7837de5ef0f8ede36537e91cdc0e'
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

  test('adding transactions', () => {
    expect(blockchain.getTransactions()).toHaveLength(0)
    blockchain.newTransaction('My transaction')
    expect(blockchain.getTransactions()).toHaveLength(1)
  })

  test('new blocks should include 5 transactions', () => {
    expect(blockchain.getTransactions()).toHaveLength(0)
    blockchain.newTransaction('My transaction 1')
    blockchain.newTransaction('My transaction 2')
    blockchain.newTransaction('My transaction 3')
    blockchain.newTransaction('My transaction 4')
    blockchain.newTransaction('My transaction 5')
    blockchain.newTransaction('My transaction 6')
    expect(blockchain.getTransactions()).toHaveLength(6)

    const previousBlock = blockchain.previousBlock()
    const previousBlockHash = blockchain.hash(previousBlock)
    const candidateBlock = blockchain.candidateBlock(previousBlockHash)
    const newBlock = blockchain.proofOfWork(candidateBlock)

    expect(newBlock.transactions).toHaveLength(5)
    expect(blockchain.getTransactions()).toHaveLength(6)

    // one transactions after mining a new block
    blockchain.addBlock(newBlock)
    expect(blockchain.getTransactions()).toHaveLength(1)
  })
})
