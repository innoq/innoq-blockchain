exports.get = (blockchain, req, res) => {
  console.log(`${req.method} ${req.path} invoked`)
  res.json({
    message: 'hello'
  })
}
