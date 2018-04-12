exports.index = (blockchain, req, res) => {
  console.log(`${req.method} ${req.path} invoked`)

  res.json({
    nodeId: blockchain.nodeId,
    currentBlockHeight: blockchain.blocks.length,
    neighbours: blockchain.nodes
  })
}
