//here the event starts
const Logger = require('../../../logger')
module.exports = (client, error) => {
  Logger.error('Client Error:', `${error}`)
}
