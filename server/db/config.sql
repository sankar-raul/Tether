show databases;
create database if not exists tether;
use tether;
SET SQL_SAFE_UPDATES = 0;

create table if not exists users (
	id bigint auto_increment primary key,
    username varchar(50) not null unique,
    email varchar(255) unique,
    password varchar(100) not null,
	isLoggedIn boolean default 0,
    profile_pic_url varchar(255),
    bio varchar(255),
    fullname varchar(30) not null,
    index idx_username (username),
    index idx_username_f_name (username, fullname)
);
-- create index idx_username_f_name on users (username, fullname);
select * from users;
-- delete from messages where sender > 2 or reciver > 2;
-- delete from recent_interactions where owner_id > 2 or contact_id > 2;
-- delete from users where id > 2;
-- truncate table refresh_tokens;
-- alter table users modify column username varchar(30) not null unique;
-- alter table users add column fullname varchar(30) not null default 'User';
-- drop index idx_users on users;
-- create index idx_user on users (username);
create table if not exists messages (
	id bigint auto_increment primary key,
	sender bigint not null,
    reciver bigint not null,
    content text not null,
    tick tinyint default 1 check(tick in (1, 2, 3)), -- single tick, double tick and delivered like whats app
    sent_at datetime default now(), -- sent by sender to server
    recived_at datetime, -- delivered to reciver
    seen_at datetime, -- seen by reciver
    edited_at datetime,
    foreign key (sender) references users(id),
    foreign key (reciver) references users(id),
    
    index idx_messages (sender, reciver),
    index idx_sender (sender),
    index idx_receiver (reciver),
    index idx_tick (reciver, tick)
);
-- drop index  idx_messages on messages;
-- CREATE INDEX idx_messages ON messages (reciver, sender);
-- CREATE INDEX idx_sender ON messages (sender);
-- CREATE INDEX idx_receiver ON messages (reciver);
-- create index idx_tick on messages (reciver, tick);

-- truncate table messages;
create table if not exists contacts (
    owner_id bigint not null,
    contact_id bigint not null,
    nickname varchar(30),
    created_at datetime default current_timestamp,
    foreign key (owner_id) references users(id),
    foreign key (contact_id) references users(id),
    primary key (owner_id, contact_id),
    index idx_nickname (nickname, created_at desc)
);
-- create index idx_nickname on contacts (nickname, created_at desc);
-- drop table contacts;
-- select * from contacts;

create table if not exists recent_interactions (
	owner_id bigint not null,
    contact_id bigint not null,
    last_interaction_time datetime default current_timestamp,
    type varchar(10) check (type in ('added', 'chat', 'call', 'video_call')),
    last_message text,
    foreign key (owner_id) references users(id),
    foreign key (contact_id) references users(id),
    primary key (owner_id, contact_id),
    index idx_last_interaction_time ( last_interaction_time desc )
);
-- create index idx_last_interaction_time on recent_interactions ( last_interaction_time desc );
-- secure auth refresh tokens 'hey hackers try to hack its power full auth shield 😎'
create table if not exists refresh_tokens (
	token char(64) unique primary key,
    user_id bigint not null,
    created_at datetime default now(),
    expires_at datetime not null, -- default 7 day expiry
    foreign key (user_id) references users (id),
    index idx_refresh_token_user_id (user_id),
    index idx_refresh_token_expires_at (expires_at desc)
);
-- create index idx_refresh_token_user_id on refresh_tokens (user_id);
-- create index idx_refresh_token_expires_at on refresh_tokens (expires_at desc);
-- push notification subscription
create table if not exists notification_subscription (
	id int auto_increment primary key,
    user_id bigint not null,
    endpoint text,
    p256dh text,
    auth text,
    UNIQUE KEY unique_endpoint (endpoint(512)),
    foreign key (user_id) references users (id),
    index idx_notification_subscription_user_id (user_id)
);
-- create index idx_notification_subscription_user_id on notification_subscription (user_id);

select * from notification_subscription;

-- alter table refresh_tokens modify column expires_at int not null;

select * from users;

-- delete from refresh_tokens where user_id = 19;
-- delete from users where id = 19;
-- truncate table refresh_tokens; -- run for all logout
-- delete

update users set profile_pic_url = 'https://www.shutterstock.com/image-photo/closeup-portrait-fluffy-purebred-cat-260nw-2447243735.jpg' where id = 1;

-- CREATE INDEX idx_messages_reciver_sender_tick ON messages(id, reciver, sender, tick);
-- show index from messages;
-- CREATE INDEX idx_recent_interactions_owner ON recent_interactions(owner_id);
-- CREATE INDEX idx_users_email on users(email);
-- drop index idx_users_email on users;
-- drop index idx_messages_reciver_sender_tick ON messages;
-- drop index idx_recent_interactions_owner ON recent_interactions;
-- select * from messages order by sent_at desc limit 1000;
-- truncate table refresh_tokens;
select sender, MAX(sent_at) as latest_msg from messages where reciver = 2 group by sender order by latest_msg;
select reciver, MAX(sent_at) as latest_msg from messages where sender = 2 group by reciver order by latest_msg;
select * from messages where sender = 1 and reciver = 2 order by sent_at desc limit 20;

select * from ((select sender, MAX(sent_at) as latest_msg from messages where reciver = 1 and tick in (2, 3) group by sender)
union (select reciver, MAX(sent_at) as latest_msg from messages where sender = 1 group by reciver)) as combined order by latest_msg desc;