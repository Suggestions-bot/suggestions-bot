require("dotenv").config();
const logger = require("./logger");

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
    logger.startup("Bot and dashboard not found");
  }
});

function validateDatabase() {

  return new Promise(async (resolve) => {

    logger.db(`Connecting to ${process.env.DATABASE_USER}@${process.env.DATABASE_HOST} ...`);

    let connection = mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE
    });

    connection.connect(async (err) => {

      if (err) {
        logger.db("Connection failed");
        logger.error(err)
        return;
      }

      logger.db("Connection successful");

      await new Promise((resolve) => connection.query(`
                  CREATE TABLE IF NOT EXISTS ${process.env.DATABASE_DATABASE}.suggestions
                  (
                      id            BIGINT AUTO_INCREMENT,
                      message_id    BIGINT    NOT NULL,
                      user_id       BIGINT    NOT NULL,
                      server_id     BIGINT    NOT NULL,
                      channel_id    BIGINT    NULL,
                      upvotes       INT       NULL,
                      upvoters      JSON      NULL,
                      downvotes     INT       NULL,
                      downvoters    JSON      NULL,
                      content       TEXT      NOT NULL,
                      re_voters     JSON      NULL,
                      creation_date TIMESTAMP NOT NULL,
                      accepted      BOOLEAN   NULL,
                      thread_id     BIGINT    NULL,
                      CONSTRAINT suggestion_id PRIMARY KEY (id)
                  );`
        , (err) => err ? logger.error(err) : resolve()));

      await new Promise((resolve) => connection.query(`
                  CREATE TABLE IF NOT EXISTS ${process.env.DATABASE_DATABASE}.servers
                  (
                      id                     BIGINT AUTO_INCREMENT,
                      server_id              BIGINT       NOT NULL,
                      manager_role           BIGINT       NULL,
                      upvote_emoji           VARCHAR(255) NULL,
                      downvote_emoji         VARCHAR(255) NULL,
                      suggestion_channel     BIGINT       NULL,
                      suggestion_embed_color VARCHAR(255) NULL,
                      accepted_emoji         VARCHAR(255) NULL,
                      denied_emoji           VARCHAR(255) NULL,
                      language               VARCHAR(255) NULL,
                      allow_links            BOOLEAN      NULL,
                      allow_attachments      BOOLEAN      NULL,
                      auto_accept_upvotes    INT          NULL,
                      auto_decline_downvotes INT          NULL,
                      auto_thread            BOOLEAN      NULL,
                      suggest_message_id     BIGINT       NULL,
                      CONSTRAINT server_id PRIMARY KEY (id)
                  );`
        , (err) => err ? logger.error(err) : resolve()));

      await new Promise((resolve) => connection.query(`
                  CREATE TABLE IF NOT EXISTS ${process.env.DATABASE_DATABASE}.cache
                  (
                      id            INT AUTO_INCREMENT,
                      sorted_guilds JSON NULL,
                      CONSTRAINT cache_id PRIMARY KEY (id)
                  );`
        , (err) => err ? logger.error(err) : resolve()));

      await new Promise((resolve) => connection.query(`
                  CREATE TABLE IF NOT EXISTS ${process.env.DATABASE_DATABASE}.channels
                  (
                      id               BIGINT AUTO_INCREMENT,
                      server_id        BIGINT NOT NULL,
                      channel_id_array JSON   NULL,
                      CONSTRAINT channel_array_id PRIMARY KEY (id)
                  );`
        , (err) => err ? logger.error(err) : resolve()));

      await new Promise((resolve) => connection.query(`
          CREATE TABLE IF NOT EXISTS ${process.env.DATABASE_DATABASE}.suggest_message_ids
          (
              id         BIGINT AUTO_INCREMENT,
              channel_id BIGINT NOT NULL,
              message_id BIGINT NOT NULL,
              CONSTRAINT suggest_message_id PRIMARY KEY (id)
          );
      `, (err) => err ? logger.error(err) : resolve()));

      connection.end(() => {

        logger.db("Validated");
        resolve();

      });

    });

  });

}