exports.get = (blockchain, req, res) => {
  console.log(`${req.method} ${req.path} invoked`)
  const { id } = req.params
  const transaction = blockchain.getTransaction(id)

  if (transaction) {
    res.json(transaction)
  } else {
    res.status(404).json({
      message: 'Transaction not found'
    })
  }
}

exports.new = (blockchain, sse, req, res) => {
  console.log(`${req.method} ${req.path} invoked`)
  const { payload } = req.body

  if (payload) {
    const transaction = blockchain.newTransaction(payload)
    sse.send(transaction, 'new_transaction')
    res.status(201).json({
      message: 'Transaction created',
      transaction
    })
  } else {
    res.status(400).json({
      message: 'could not create Transaction'
    })
  }
}
