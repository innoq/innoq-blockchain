module.exports = class Blockchain {
  constructor () {
    this.data = []
    this.memPool = []
    this.nodes = new Set()
  }
}
