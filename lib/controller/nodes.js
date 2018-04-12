const fetch = require('node-fetch')
const EventSource = require('eventsource')

exports.register = (blockchain, req, res) => {
  console.log(`${req.method} ${req.path} invoked`)

  const { host } = req.body || []

  fetch(host)
    .then(res => {
      if (res.ok) return res.json()
    })
    .then(fetchedNode => {
      const node = blockchain.registerNode(fetchedNode.nodeId, host)

      // connect to new node event stream
      const eventSource = `${host}/events`
      const stream = new EventSource(eventSource)
      stream.addEventListener('new_block', (event) => {
        console.log(`node ${host} found a new block: `, event.data)
        blockchain.updateChain()
      })

      res.status(201).json({
        message: 'New node added',
        node
      })
    }).catch(err => {
      console.error('An error occured', err)
      res.status(400).json({
        message: 'Error: could not add node'
      })
    })
}

exports.resolveChain = (blockchain, req, res) => {
  console.log(`${req.method} ${req.path} invoked`)

  blockchain.updateChain()
    .then((updatedChain) => {
      if (updatedChain) {
        res.json({
          message: 'Our chain was updated with a newer one.',
          newChain: blockchain.blocks
        })
      } else {
        res.json({
          message: 'Our chain is up to date.',
          chain: blockchain.blocks
        })
      }
    })
    .catch((err) => {
      console.error('An error occured', err)
      res.status(502).send('Could not update chain.')
    })
}
