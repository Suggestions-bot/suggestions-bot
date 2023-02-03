require("dotenv").config();

const mysql = require("mysql2"),
    fs = require("fs");

validateDatabase().then(() => {
    let foundBot = fs.existsSync(`${__dirname}/bot/startbot.js`),
        foundDashboard = fs.existsSync(`${__dirname}/web/startweb.js`),
        foundTest = fs.existsSync(`${__dirname}/testing/starttest.js`);
    if (foundBot || foundDashboard || foundTest) {
        if (foundBot && ["both", "bot"].includes(process.env.RUN))
            require("./bot/startbot.js");
        if (foundDashboard && ["both", "dashboard", "web"].includes(process.env.RUN))
            import("./web/startweb.js");
        if (foundTest && ["test", "testing"].includes(process.env.RUN))
            import("./testing/starttest.js");
    } else {
        console.log("Bot and dashboard not found");
    }
});

function validateDatabase() {

    return new Promise(async (resolve) => {

        console.log(`[MySQL] Connecting to ${process.env.DATABASE_USER}@${process.env.DATABASE_HOST} ...`);

        let connection = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_DATABASE
        });

        connection.connect(async (err) => {

            if (err) {
                console.log("[MySQL] Connection failed");
                console.log(err);
                return;
            }

            console.log("[MySQL] Connected");

            await new Promise((resolve) => connection.query(`
                        CREATE TABLE IF NOT EXISTS ${process.env.DATABASE_DATABASE}.suggestions
                        (
                            id            bigint AUTO_INCREMENT,
                            message_id    bigint    NOT NULL,
                            user_id       bigint    NOT NULL,
                            server_id     bigint    NOT NULL,
                            channel_id    bigint    NOT NULL,
                            upvotes       int       NULL,
                            upvoters      json      NULL,
                            downvotes     int       NULL,
                            downvoters    json      NULL,
                            content       text      NOT NULL,
                            re_voters     json      NULL,
                            creation_date timestamp NOT NULL,
                            accepted      boolean   NULL,
                            CONSTRAINT suggestion_id PRIMARY KEY (id)
                        );`
                , (err) => err ? console.log(err) : resolve()));

            await new Promise((resolve) => connection.query(`
                        CREATE TABLE IF NOT EXISTS ${process.env.DATABASE_DATABASE}.servers
                        (
                            id                     bigint AUTO_INCREMENT,
                            server_id              bigint       NOT NULL,
                            manager_role           bigint       NULL,
                            upvote_emoji           varchar(255) NULL,
                            downvote_emoji         varchar(255) NULL,
                            suggestion_channel     bigint       NULL,
                            suggestion_embed_color varchar(255) NULL,
                            accepted_emoji         varchar(255) NULL,
                            denied_emoji           varchar(255) NULL,
                            language               varchar(255) NULL,
                            allow_links            boolean      NULL,
                            CONSTRAINT server_id PRIMARY KEY (id)
                        );`
                , (err) => err ? console.log(err) : resolve()));

            connection.end(() => {

                console.log("[MySQL] Validated");
                resolve();

            });

        });

    });

}