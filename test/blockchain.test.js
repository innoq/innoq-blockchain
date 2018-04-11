const Blockchain = require('./../lib/blockchain')

describe('Blockchain', () => {
  let blockchain

  beforeEach(() => {
    blockchain = new Blockchain()
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
})
