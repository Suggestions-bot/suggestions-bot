const mysql2 = require('mysql2');
const logger = require('../handlers/logger.js');

const connection = mysql2.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect();

connection.query(
    `CREATE SCHEMA IF NOT EXISTS ${process.env.DB_NAME};
   CREATE TABLE IF NOT EXISTS ${process.env.DB_NAME}.suggestions (
    id bigint AUTO_INCREMENT,
    user_id bigint NOT NULL,
    server_id bigint NOT NULL,
    upvotes int NULL,
    upvoters json NULL,
    downvotes int NULL,
    downvoters json NULL,
    content int NOT NULL,
    creation_date timestamp NOT NULL,
    accepted boolean NULL,
    CONSTRAINT suggestion_id PRIMARY KEY (id)
  );
  CREATE TABLE IF NOT EXISTS ${process.env.DB_NAME}.servers (
    id bigint AUTO_INCREMENT,
    server_id bigint NOT NULL,
    manager_role bigint NULL,
    upvote_emoji varchar(255) NULL,
    downvote_emoji varchar(255) NULL,
    suggestion_channel bigint NULL,
    suggestion_embed_color varchar(255) NULL,
    accepted_emoji varchar(255) NULL,
    denied_emoji varchar(255) NULL,
    CONSTRAINT server_id PRIMARY KEY (id)
  );`,
    function(err, results) {
        if (err) {
            logger.error(err);
        } else {
            logger.info('Schema and tables created successfully');
        }
        connection.end();
    }
);

module.exports = connection;
