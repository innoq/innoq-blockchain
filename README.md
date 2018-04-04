# INNOQ blockchain

INNOQ programming event proof of concept blockchain.

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
  -d '{
	"nodeId": "f788cd02-c4fd-4135-bd6d-d054b98983c9",
	"host": "http://localhost:8334"
}'
```

and vice versa:

```
add node http://localhost:8333 to http://localhost:8334
curl -X POST http://localhost:8334/nodes/register \
  -H 'Content-Type: application/json' \
  -d '{
	"nodeId": "688c3458-81a4-4532-9d43-73e064efa3da",
	"host": "http://localhost:8333"
}'
```

BTW: nodeId is currently unused but has to be supplied.


## Blockchain-API

| Resource                | Description                                                  |
| :---------------------- | :----------------------------------------------------------- |
| GET  /                  | node info, blockheight, neighbours                           |
| GET  /chain             | get nodes chain                                              |
| GET  /mine              | mine a new block                                             |
| GET  /events            | node events sse stream                                       |
| POST /nodes/register    | register new node                                            |
| GET /nodes/resolveChain | manually resolve chain with longer chain of registered nodes |
