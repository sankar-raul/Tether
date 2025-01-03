show databases;
create database bro_chat;
use bro_chat;
SET SQL_SAFE_UPDATES = 0;
create table users (
	id bigint auto_increment primary key,
    username varchar(50) not null,
    email varchar(255) unique,
    password varchar(100) not null,
	isLoggedIn boolean default 0
);

-- drop table users;
delete from users where id <> 90;
select * from users;
truncate table message_queue;
create table message_queue (
	id bigint auto_increment primary key,
    msg_from bigint not null,
    msg_to bigint not null,
    msg text not null,
    foreign key (msg_from) references users(id),
    foreign key (msg_to) references users(id)
);
select * from message_queue;