show databases;
create database if not exists tether;
use tether;
SET SQL_SAFE_UPDATES = 1;

create table if not exists users (
	id bigint auto_increment primary key,
    username varchar(50) not null,
    email varchar(255) unique,
    password varchar(100) not null,
	isLoggedIn boolean default 0,
    profile_pic_url varchar(255),
    bio varchar(255)
);

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
    foreign key (reciver) references users(id)
);
-- truncate table messages;
create table if not exists contacts (
    owner_id bigint not null,
    contact_id bigint not null,
    nickname varchar(30),
    created_at datetime default current_timestamp,
    foreign key (owner_id) references users(id),
    foreign key (contact_id) references users(id),
    primary key (owner_id, contact_id)
);
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
    primary key (owner_id, contact_id)
);

-- secure auth refresh tokens 'hey hackers try to hack its power full auth shield 😎'
create table if not exists refresh_tokens (
	token char(64) unique primary key,
    user_id bigint not null,
    created_at datetime default now(),
    expires_at datetime not null, -- default 7 day expiry
    foreign key (user_id) references users (id)
);

-- push notification subscription
create table if not exists notification_subscription (
	id int auto_increment primary key,
    user_id bigint not null,
    endpoint text unique,
    p256dh text,
    auth text,
    foreign key (user_id) references users (id)
);


-- alter table refresh_tokens modify column expires_at int not null;

select * from users;
-- delete from refresh_tokens where user_id = 19;
-- delete from users where id = 19;
-- truncate table refresh_tokens; -- run for all logout
-- delete
select * from messages order by sent_at desc;
delete from users where id = 19;
select sender, MAX(sent_at) as latest_msg from messages where reciver = 2 group by sender order by latest_msg;
select reciver, MAX(sent_at) as latest_msg from messages where sender = 2 group by reciver order by latest_msg;
select * from messages where sender = 1 and reciver = 2 order by sent_at desc limit 20;

select * from ((select sender, MAX(sent_at) as latest_msg from messages where reciver = 1 and tick in (2, 3) group by sender)
union (select reciver, MAX(sent_at) as latest_msg from messages where sender = 1 group by reciver)) as combined order by latest_msg desc;