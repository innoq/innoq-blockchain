exports.mine = (blockchain, sse, req, res) => {
  console.log(`${req.method} ${req.path} invoked`)

  const previousBlock = blockchain.previousBlock()
  const previousProof = previousBlock.proof

  const timeStart = Date.now()
  const proof = blockchain.proofOfWork(previousProof)
  const timeEnd = Date.now()
  const miningTime = (timeEnd - timeStart) / 1000
  const hashingPower = Math.round(proof / miningTime)

  const previousBlockHash = blockchain.hash(previousBlock)
  const newBlock = blockchain.newBlock(proof, previousBlockHash)

  console.log(`Mined a new block in ${miningTime}s. Hashing power: ${hashingPower} hashes/s. Block:`, newBlock)
  sse.send(newBlock, 'new_block')

  res.json({
    message: `Mined a new block in ${miningTime}s. Hashing power: ${hashingPower} hashes/s.`,
    block: newBlock
  })
}
