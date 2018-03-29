const uuid = require('uuid/v4')
const SHA256 = require('crypto-js/sha256')

exports.generateNodeId = () => uuid()

exports.sha256sum = (input) => {
  return SHA256(input).toString()
}
