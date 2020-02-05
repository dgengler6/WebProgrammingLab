-- Dropping all tables 

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS messages;

CREATE TABLE users(
    email varchar(30) NOT NULL PRIMARY KEY,
    password varchar(40) NOT NULL ,
    firstName varchar(20) NOT NULL ,
    lastName varchar(20) NOT NULL ,
    gender varchar(10) NOT NULL ,
    city varchar(20) NOT NULL ,
    country varchar(10) NOT NULL,
    token varchar(32) DEFAULT NULL
    
);

CREATE TABLE messages(
    id integer NOT NULL PRIMARY KEY,
    receiver varchar(30) NOT NULL,
    writer varchar(30) NOT NULL,
    messages varchar(500) NOT NULL,
    CONSTRAINT fk_receiver_user FOREIGN KEY (receiver) REFERENCES users(email),
    CONSTRAINT fk_writer_user FOREIGN KEY (writer) REFERENCES users(email)
);
