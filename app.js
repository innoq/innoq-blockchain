const express = require('express')

module.exports = (blockchain) => {
  const app = express()

  app.get('/chaindata', (req, res) => {
    res.json({
      data: blockchain.data,
      height: blockchain.data.length
    })
  })

  return app
}
