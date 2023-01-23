create schema if not exists suggestions_bot;

create table if not exists suggestions_bot.suggestions
(
    id            bigint auto_increment,
    user_id       bigint    not null,
    server_id     bigint    not null,
    upvotes       int       null,
    upvoters      json      null,
    downvotes     int       null,
    downvoters    json      null,
    content       int       not null,
    creation_date timestamp not null,
    accepted      boolean   null,
    constraint suggestion_id
        primary key (id)
);

create table if not exists suggestions_bot.servers
(
    id            bigint auto_increment,
    server_id     bigint    not null,
    manager_role  bigint    null,
    constraint server_id
        primary key (id)
);