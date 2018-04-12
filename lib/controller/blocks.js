exports.index = (blockchain, req, res) => {
  console.log(`${req.method} ${req.path} invoked`)

  res.json({
    blocks: blockchain.blocks,
    blockHeight: blockchain.blocks.length
  })
}
