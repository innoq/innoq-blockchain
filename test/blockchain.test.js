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
    const lastProof = previousBlock.proof
    const proof = blockchain.proofOfWork(lastProof)
    const previousBlockHash = blockchain.hash(previousBlock)
    const block = blockchain.newBlock(proof, previousBlockHash)

    expect(blockchain.blocks).toHaveLength(2)
    expect(blockchain.blocks[1]).toEqual(block)
    expect(blockchain.blocks[1]).toMatchObject({
      index: 2,
      proof: 69732, // valid proof for our genesis block
      transactions: []
    })
  })

  test('proof finding', () => {
    const lastProof = 'I am Heribert Innoq'

    const proof = blockchain.proofOfWork(lastProof)
    const guess = `${lastProof}${proof}`
    const guessHash = utils.sha256sum(guess)

    expect(proof).toEqual(107168)
    expect(guess).toEqual('I am Heribert Innoq107168')
    expect(guessHash).toEqual('0000387af7c5fda617f0d39349b5d8b5ee437c338353621eec3a962870e6931e')
  })

  test('correct proof validation', () => {
    const lastProof = 0
    const proof = 69732

    const valid = blockchain.validateProof(lastProof, proof)
    const guessHash = utils.sha256sum(`${lastProof}${proof}`)

    expect(/^0000/.test(guessHash)).toEqual(true)
    expect(valid).toEqual(true)
  })

  test('false proof validation', () => {
    const lastProof = 0
    const proof = 123

    const valid = blockchain.validateProof(lastProof, proof)
    const guessHash = utils.sha256sum(`${lastProof}${proof}`)

    expect(/^0000/.test(guessHash)).toEqual(false)
    expect(valid).toEqual(false)
  })

  test('correct chain validation', () => {
    const correctChain = [
      {
        index: 1,
        timestamp: 0,
        proof: 0,
        transactions: [{
          id: 'b3c973e2-db05-4eb5-9668-3e81c7389a6d',
          timestamp: 0,
          payload: 'I am Heribert Innoq'
        }],
        previousBlockHash: '0'
      },
      {
        index: 2,
        timestamp: 1523940019964,
        proof: 69732,
        transactions: [],
        previousBlockHash: '425ee67463c8968a5ca4e7e38c54e497d34d8bfa3bbb93fd7f9d801f7349bfb2'
      },
      {
        index: 3,
        timestamp: 1523940021147,
        proof: 23263,
        transactions: [],
        previousBlockHash: 'c583b6f570333b0ba644e9c46e48cbeff0ddbe57a71317a356a87c66b1761889'
      }
    ]

    expect(blockchain.validateChain(correctChain)).toEqual(true)
  })

  test('false chain validation', () => {
    const correctChain = [
      {
        index: 1,
        timestamp: 0,
        proof: 0,
        transactions: [{
          id: 'b3c973e2-db05-4eb5-9668-3e81c7389a6d',
          timestamp: 0,
          payload: 'I am Heribert Innoq'
        }],
        previousBlockHash: '0'
      },
      {
        index: 2,
        timestamp: 1523940019964,
        proof: 69732,
        transactions: [],
        previousBlockHash: '##### This is a fake proof #####'
      }
    ]

    expect(blockchain.validateChain(correctChain)).toEqual(false)
  })
})
