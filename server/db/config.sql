show databases;
create database bro_chat;
use bro_chat;

create table users (
	id bigint auto_increment primary key,
    username varchar(50) not null,
    email varchar(255) unique,
    password varchar(100) not null
);
-- drop table users;
-- delete from users where id in(10, 8, 9, 11, 13);
select * from users where id <> 4;
-- truncate table message_queue;
create table message_queue (
	id bigint auto_increment primary key,
    msg_from bigint not null,
    msg_to bigint not null,
    msg text not null,
    foreign key (msg_from) references users(id),
    foreign key (msg_to) references users(id)
);
select * from message_queue;