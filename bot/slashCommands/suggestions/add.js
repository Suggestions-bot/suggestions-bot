const Logger = require("../../../logger");
const modals = require("discord-modals");
const db = require("../../../database");

module.exports = {
    name: "add", //the command name for the Slash Command
    description: "Add a suggestion.  Same as /suggest", //the command description for Slash Command Overview
    cooldown: 5, //the cooldown for the command in seconds (max. 60)
    memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
    requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
    alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
    options: [],
    run: async (client, interaction) => {
        try {

            const language = await db.getServerLanguage(interaction.guild.id)
            const lang = require(`../../botconfig/languages/${language}.json`);

            const modal = new modals.Modal()
                .setCustomId('send')
                .setTitle(lang.add_suggestion_under)
                .addComponents(
                    new modals.TextInputComponent()
                        .setCustomId('input')
                        .setLabel(lang.suggestion_name)
                        .setStyle('LONG')
                        .setMinLength(3)
                        .setMaxLength(1024)
                        .setPlaceholder(lang.add_suggestion_here)
                        .setRequired(true)
                );

            let modalData = await modals.showModal(modal, {
                client: client,
                interaction: interaction
            });
            modalData;
        } catch (e) {
            Logger.error(e);
        }
    }
}
