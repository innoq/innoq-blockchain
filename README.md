# INNOQ blockchain

INNOQ programming event proof of concept reference blockchain.

## Prerequisites

* nodejs (used v8.9.1)
* yarn

## Getting started

* `yarn install`
* Spin up node using `yarn start` (default port 8333)
* Spin up second node using `yarn start2` (port 8334)

## Connecting nodes

Use curl commands to connect node to each other:

```
# add node http://localhost:8334 to http://localhost:8333
curl -X POST http://localhost:8333/nodes/register \
  -H 'Content-Type: application/json' \
  -d '{ "host": "http://localhost:8334" }'
```

and vice versa:

```
add node http://localhost:8333 to http://localhost:8334
curl -X POST http://localhost:8334/nodes/register \
  -H 'Content-Type: application/json' \
  -d '{ "host": "http://localhost:8333" }'
```

BTW: nodeId is currently unused but has to be supplied.


## Blockchain-API

| Resource                | Description                                                  |
| :---------------------- | :----------------------------------------------------------- |
| GET  /                  | node info, blockheight, neighbours                           |
| GET  /blocks            | get nodes chain                                              |
| GET  /blocks/:id        | get specific block                                           |
| GET  /transactions      | list unconfirmed transactions                                |
| GET  /transactions/:id  | get specific transaction                                     |
| POST /transactions      | post a new transaction                                       |
| GET  /mine              | mine a new block                                             |
| GET  /events            | sse events stream (new_block, new_transaction, new_node)     |
| POST /nodes/register    | register new node                                            |
| GET /nodes/resolveChain | manually resolve chain with longer chain of registered nodes |
