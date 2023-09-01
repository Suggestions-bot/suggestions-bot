const Logger = require("../../../logger");
const db = require("../../../database");
const discord = require("discord.js");
const {execSync} = require("child_process");

module.exports = {
  name: "setmaxchannelsforguild",
  description: "Sets Max Channels For Guild",
  cooldown: 5,
  memberpermissions: [],
  requiredroles: [],
  alloweduserids: [],
  options: [
    {
      "String": {
        name: "guild_id",
        description: "The Guild",
        required: true
      }
    },
    {
      "Integer": {
        name: "amount",
        description: "The Amount",
        required: true
      }
    },
  ],
  run: async (client, interaction) => {
    try {
      const {options} = interaction;

      let guild_id = options.getString("guild_id");
      let amount = options.getInteger("amount").toString();

      await db.setServerMaxChannels(guild_id, amount);

      await interaction.reply({content: `Set the max channels for guild ${guild_id} to ${amount}`, ephemeral: false});


    } catch (e) {
      Logger.error(e, e.stack);
    }
  }
}
