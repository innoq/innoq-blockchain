exports.index = (blockchain, req, res) => {
  console.log(`${req.method} ${req.path} invoked`)

  res.json({
    blocks: blockchain.blocks,
    blockHeight: blockchain.blocks.length
  })
}

exports.get = (blockchain, req, res) => {
  console.log(`${req.method} ${req.path} invoked`)
  const block = blockchain.getBlock(req.params.id)
  if (block) {
    res.json(block)
  } else {
    res.status(404).json({
      message: 'block not found'
    })
  }
}
