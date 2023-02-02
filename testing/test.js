const db = require("../database");
const {getAllUserSuggestions} = require("../database");


async function main() {
    console.log("Starting Test");
    const res = await db.addNewSuggestion(1234, 2345, 123, "Hansi", 3333)
    const res2 = await db.addSuggestionUpvote(1234, 2345, 3333)
    const res61 = await db.checkForUserVote(1234, 2345, 3333)
    const res3 = await db.addSuggestionDownvote(1234, 2345, 3333)
    const res62 = await db.checkForUserVote(1234, 2345, 3333)
    const res4 = await db.addSuggestionUpvoteRevoteDown(1234, 2345, 3333)
    const res63 = await db.checkForUserVote(1234, 2345, 3333)
    const res5 = await db.addSuggestionDownvoteRevoteUp(1234, 2345, 3333)
    const res64 = await db.checkForUserVote(1234, 2345, 3333)
    console.log(res);
    console.log(res2);
    console.log(res61);
    console.log(res3);
    console.log(res62);
    console.log(res4);
    console.log(res63);
    console.log(res5);
    console.log(res64);
    console.log("------------------");
    const res7 = await getAllUserSuggestions(1234, 3333)
    console.log(res7);
    const udata = await db.getAllUserSuggestions(1234, 3333);
    let calSugs = await udata.map((message, index) => `${index + 1}. [aaa](https://discord.com/channels/${message.server_id}/${message.channel_id}/${message.message_id})\n\`\`\`\n${message.content}\n\`\`\``).join("\n\n");
    console.log(calSugs);
    console.log("------------------");
    const res8 = await db.getServerSuggestionChannel(1234)
    console.log(res8);
    const res9 = await db.setServerSuggestionChannel(1234, 2345)
    console.log(res9);
    const res10 = await db.getServerSuggestionChannel(1234)
    console.log(res10);
    const res11 = await db.getServerLanguage(1234)
    console.log(res11);
    const res12 = await db.checkForUserVote(1234, 2345, 3333)
    console.log(res12);
}

main().then(() => console.log("Test complete?")).catch(e => console.log(e));

