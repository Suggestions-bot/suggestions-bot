//here the event starts
const Logger = require('../../../logger')
module.exports = (client, id) => {
  Logger.info(`Shard #${id} Ready`)
}
