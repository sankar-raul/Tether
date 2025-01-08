show databases;
create database tether;
use tether;
SET SQL_SAFE_UPDATES = 0;
create table users (
	id bigint auto_increment primary key,
    username varchar(50) not null,
    email varchar(255) unique,
    password varchar(100) not null,
	isLoggedIn boolean default 0
);
create table messages (
	id bigint auto_increment primary key,
	sender bigint not null,
    reciver bigint not null,
    content text not null,
    tick tinyint default 1 check(tick in (1, 2, 3)), -- single tick, double tick and delivered like whats app
    sent_at datetime default now(), -- sent by sender to server
    recived_at datetime, -- delivered to reciver
    seen_at datetime, -- seen by reciver
    foreign key (sender) references users(id),
    foreign key (reciver) references users(id)
);
-- drop table users;
-- delete from users where id <> 90;
select * from users;
-- truncate table message_queue;
-- create table message_queue (
-- 	id bigint auto_increment primary key,
--     msg_from bigint not null,
--     msg_to bigint not null,
--     msg text not null,
--     foreign key (msg_from) references users(id),
--     foreign key (msg_to) references users(id)
-- );
-- select * from message_queue;