exports.index = (blockchain, sse, req, res) => {
  console.log(`${req.method} ${req.path} invoked`)

  sse.addClient(req, res)
}
