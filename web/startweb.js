const db = require("../database");
const logger = require("../logger");


async function main() {
    logger.startup("Starting Dashboard");
}

main().then(r => logger.startup("Started Dashboard")).catch(e => console.log(e));

