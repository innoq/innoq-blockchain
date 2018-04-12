exports.mine = (blockchain, sse, req, res) => {
  console.log(`${req.method} ${req.path} invoked`)

  const previousBlock = blockchain.previousBlock()
  const previousProof = previousBlock.proof
  const proof = blockchain.proofOfWork(previousProof)

  const previousBlockHash = blockchain.hash(previousBlock)
  const newBlock = blockchain.newBlock(proof, previousBlockHash)

  console.log('We found a new block', newBlock)
  sse.send(newBlock, 'new_block')

  res.json({
    message: 'New block found',
    block: newBlock
  })
}
