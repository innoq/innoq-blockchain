exports.mine = (blockchain, sse, req, res) => {
  console.log(`${req.method} ${req.path} invoked`)

  const previousBlock = blockchain.previousBlock()
  const candidateBlock = blockchain.candidateBlock(blockchain.hash(previousBlock))

  const timeStart = Date.now()
  const newBlock = blockchain.proofOfWork(candidateBlock)
  const timeEnd = Date.now()
  const miningTime = (timeEnd - timeStart) / 1000
  const hashingPower = Math.round(newBlock.proof / miningTime)

  blockchain.addBlock(newBlock)

  console.log(`Mined a new block in ${miningTime}s. Hashing power: ${hashingPower} hashes/s. Block:`, newBlock)
  sse.send(newBlock, 'new_block')

  res.json({
    message: `Mined a new block in ${miningTime}s. Hashing power: ${hashingPower} hashes/s.`,
    block: newBlock
  })
}
