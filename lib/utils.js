const uuid = require('uuid/v4')
const SHA256 = require('crypto-js/sha256')

exports.generateUUID = () => uuid()

exports.sha256sum = (input) => {
  return SHA256(input).toString()
}
