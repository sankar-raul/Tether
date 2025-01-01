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