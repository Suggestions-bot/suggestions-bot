//here the event starts
const Logger = require('../../../logger')
module.exports = (client, event, id) => {
  Logger.error(
    'Shard Disconnect:',
    `[${String(new Date()).split(' ', 5).join(' ')}] Shard #${id} Disconnected`
  )
}
