const db = require("../database");


async function main() {
    console.log("Starting Test");
    const res = await db.addNewSuggestion(1234, 2345, "Hansi", 3333)
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
}

main().then(r => console.log("Test complete?")).catch(e => console.log(e));

