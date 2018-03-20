const myApp = require('./app')
const Blockchain = require('./lib/blockchain')

const port = process.env.PORT || 8333
const app = myApp(new Blockchain())

app.listen(port, () => {
  console.log(`starting blockchain server on http://localhost:${port}`)
})
