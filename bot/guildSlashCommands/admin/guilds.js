const Logger = require("../../../logger");
const db = require("../../../database");
const discord = require("discord.js");
const {execSync} = require("child_process");

module.exports = {
    name: "guilds",
    description: "Shows the guilds the bot is in.",
    cooldown: 5,
    memberpermissions: [],
    requiredroles: [],
    alloweduserids: [],
    options: [
        {"Integer": {name: "page", description: "Use no page to reload the cache.", required: false}},
        {
            "StringChoices": {
                name: "invites",
                description: "Parse invites for each guild. This might take a while.",
                required: false,
                choices: [["Yes", "true"], ["No", "false"]]
            }
        },
    ],
    run: async (client, interaction) => {
        try {
            const page = interaction.options.getInteger("page");

            if (page) {
                const guildAmount = client.guilds.cache.size;
                const pageAmount = Math.ceil(guildAmount / 10);

                if (page > pageAmount || page < 1) {
                    await interaction.reply({content: "This page does not exist.", ephemeral: true});
                } else {
                    // get cached guilds
                    try {
                        await interaction.deferReply();
                        const responseMessage = await interaction.followUp("Getting cached guilds...\nThis might take a while depending on the amount of guilds.");
                        let cachedGuilds = await db.cacheGetSortedGuilds();
                        let guilds = cachedGuilds[page - 1];

                        await responseMessage.edit("Formatting guilds...");
                        const formattedGuilds = guilds.map(guild => {
                            return `GuildName: \`${guild.guildName}\`\nGuildId: \`${guild.guildId}\`\nMemberCount: \`${guild.memberCount}\`\nSuggestionCount: \`${guild.suggestionCount}\`\nInvite: ${guild.invite || "none"}`;
                        });

                        let addFieldsObject = [];
                        const startPageNum = (page - 1) * 10;
                        for (let i = 0; i < formattedGuilds.length; i++) {
                            let guild = formattedGuilds[i];
                            addFieldsObject.push({
                                name: `Guild ${startPageNum + i + 1}`,
                                value: guild
                            });
                        }

                        let embed = new discord.MessageEmbed()
                            .setTitle(`Guilds the bot is in (${guildAmount})`)
                            .setDescription(`Page ${page} of ${cachedGuilds.length} | ${guildAmount} guilds in total | Sorted by memberCount`)
                            .setColor("BLUE")
                            .setTimestamp()
                            .setFooter({
                                text: `Page ${page} of ${cachedGuilds.length}`,
                                iconURL: client.user.avatarURL()
                            })
                            .addFields(addFieldsObject);

                        await responseMessage.edit({content: null, embeds: [embed]});
                    } catch (e) {
                        console.log(e);
                        console.log(e.stack);
                    }
                }

            } else {
                await interaction.deferReply();
                const responseMessage = await interaction.followUp("Getting infos for cached Guilds...\nThis might take a while.");
                const guildAmount = client.guilds.cache.size;

                let guildArray = [];
                client.guilds.cache.forEach(guild => {
                    let memberCount = guild.memberCount;
                    let guildId = guild.id;
                    let guildName = guild.name;

                    let guildObject = {
                        guildId: guildId,
                        guildName: guildName,
                        memberCount: memberCount,
                        suggestionCount: undefined,
                        invite: undefined
                    }
                    guildArray.push(guildObject);
                });

                await responseMessage.edit("Getting suggestion count for each guild...\nETA: <t:" + Math.ceil((Date.now() + guildAmount * 110 /*average query time*/) / 1000) + ":R>");

                // get suggestion count for each guild
                for (const element of guildArray) {
                    element.suggestionCount = await db.getNumberOfSuggestionsInGuild(element.guildId) || 0;
                    await new Promise(resolve => setTimeout(resolve, 1)); // don't overload the database, just in case
                }


                const invites = interaction.options.getString("invites");
                if (invites === "true") {
                    const inviteTime = guildArray.length * (100 + 350 /*average response time*/);
                    const inviteTimestampUNIX = Date.now() + inviteTime;
                    await responseMessage.edit(`Getting invite for each guild...\nWill take approximately ${Math.round(inviteTime / 1000)} seconds.\nETA: <t:${Math.ceil(inviteTimestampUNIX / 1000)}:R>`);
                    // get invite for each guild
                    for (const element of guildArray) {
                        let guild = element;
                        let guildId = guild.guildId;
                        let guildObject = client.guilds.cache.get(guildId);
                        if (guildObject.vanityURLCode) {
                            element.invite = `https://discord.gg/${guildObject.vanityURLCode}`;
                        } else {
                            try {
                                let invites = await guildObject.invites.fetch();
                                let invite = invites.find(invite => invite.guild.id === guildId);
                                if (invite) {
                                    element.invite = invite.url;
                                }
                            } catch (e) {
                                //await responseMessage.edit(`Error while getting invite for guild ${guild.guildName} (${guild.guildId})\nGetting invite for each guild...\nWill take approximately seconds. (~${Math.round(inviteTime / 1000)}s) \nETA: <t:${Math.ceil(inviteTimestampUNIX / 1000)}:R>`);
                                // no perms, ignore
                            }
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                    }
                    await responseMessage.edit("Sorting guilds...");
                } else {
                    await responseMessage.edit("Not getting invites for each guild...\nSorting guilds...");
                }

                // sort guildArray by memberCount
                guildArray.sort((a, b) => {
                    return b.memberCount - a.memberCount;
                });

                await responseMessage.edit("Sorting guilds...");

                // split guildArray into chunks of 10
                let guildChunks = [];
                let idx = 0;
                for (let guild in guildArray) {
                    if (idx % 10 === 0) {
                        guildChunks.push([]);
                    }
                    guildChunks[guildChunks.length - 1].push(guildArray[guild]);
                    idx++;
                }

                await responseMessage.edit("Dumping guilds to cache...");

                // dump guildChunks
                await db.cacheSetSortedGuilds(guildChunks);

                let pageOneGuilds = guildChunks[0];

                await responseMessage.edit("Formatting guilds...");

                const formattedGuilds = pageOneGuilds.map(guild => {
                    return `GuildName: \`${guild.guildName}\`\nGuildId: \`${guild.guildId}\`\nMemberCount: \`${guild.memberCount}\`\nSuggestionCount: \`${guild.suggestionCount}\`\nInvite: ${guild.invite || "none"}`;
                });

                let addFieldsObject = [];
                for (let i = 0; i < formattedGuilds.length; i++) {
                    let guild = formattedGuilds[i];
                    addFieldsObject.push({
                        name: `Guild ${i + 1}`,
                        value: guild
                    });
                }


                // create embed
                let embed = new discord.MessageEmbed()
                    .setTitle(`Guilds the bot is in (${guildAmount})`)
                    .setDescription(`Page 1 of ${guildChunks.length} | ${guildAmount} guilds in total | Sorted by memberCount`)
                    .setColor("BLUE")
                    .setTimestamp()
                    .setFooter({
                        text: `Page 1 of ${guildChunks.length}`,
                        iconURL: client.user.avatarURL()
                    })
                    .addFields(addFieldsObject);

                await responseMessage.edit({embeds: [embed], content: null});
            }
        } catch (e) {
            Logger.error(e);
        }
    }
}
