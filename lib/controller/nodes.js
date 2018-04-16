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
      const { nodeId } = fetchedNode
      const node = blockchain.registerNode(nodeId, host)

      // check new nodes chain
      blockchain.updateChain()

      // connect to new node event stream
      const eventSource = `${host}/events`
      const stream = new EventSource(eventSource)
      stream.addEventListener('new_block', (event) => {
        console.log(`node ${host} found a new block: `, event.data)
        // TODO: only download new block, remove block txs from own mempool
        blockchain.updateChain()
      })
      stream.onerror = (event) => {
        console.log(`An error occured. Closing stream to ${host}. Event: `, event)
        blockchain.unregisterNode(nodeId)
        stream.close()
      }

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

exports.unregister = (blockchain, req, res) => {
  console.log(`${req.method} ${req.path} invoked`)

  const { id } = req.params
  const node = blockchain.unregisterNode(id)
  if (node) {
    res.json({
      message: `Node unregistered`,
      node
    })
  } else {
    res.status(400).json({
      message: `Could not remove node with id: ${id}`
    })
  }
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
