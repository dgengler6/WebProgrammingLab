-- Dropping all tables 

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS loggedInUsers;
DROP TABLE IF EXISTS profileVisitsUsers;

-- Creating all the tables 

CREATE TABLE users(
    email varchar(30) NOT NULL PRIMARY KEY,
    password varchar(40) NOT NULL ,
    firstName varchar(20) NOT NULL ,
    lastName varchar(20) NOT NULL ,
    gender varchar(10) NOT NULL ,
    city varchar(20) NOT NULL ,
    country varchar(20) NOT NULL
);

CREATE TABLE messages(
    id integer NOT NULL PRIMARY KEY,
    receiver varchar(30) NOT NULL,
    writer varchar(30) NOT NULL,
    messages varchar(500) NOT NULL,
    CONSTRAINT fk_receiver_user FOREIGN KEY (receiver) REFERENCES users(email),
    CONSTRAINT fk_writer_user FOREIGN KEY (writer) REFERENCES users(email)
);


CREATE TABLE loggedInUsers(
    email varchar(30) NOT NULL PRIMARY KEY,
    token varchar(32) NOT NULL,
    CONSTRAINT fk_logged_user FOREIGN KEY (email) REFERENCES users(email)
);


CREATE TABLE profileVisitsUsers(
    email varchar(30) NOT NULL PRIMARY KEY,
    monday integer NOT NULL DEFAULT 0 ,
    tuesday integer NOT NULL DEFAULT 0,
    wednesday integer NOT NULL DEFAULT 0,
    thursday integer NOT NULL DEFAULT 0,
    friday integer NOT NULL DEFAULT 0,
    saturday integer NOT NULL DEFAULT 0,
    sunday integer NOT NULL DEFAULT 0,
    CONSTRAINT fk_visit_user FOREIGN KEY (email) REFERENCES users(email)
);


-- Adding some default values

INSERT INTO users VALUES ('tim@hellberg.se','timtimtimtim','Tim','Hellberg','Male','Gothenburg','Sweden');

INSERT INTO users VALUES ('damien@gengler.fr','damiendamien','Damien','Gengler','Male','Lausanne','Switzerland');

INSERT INTO users VALUES ('damien2@gengler.fr','damiendamien','Damien','Gengler','Male','Lausanne','Switzerland');

INSERT INTO users VALUES ('damien.gengler69@gmail.com','damiendamien','Damien','Gengler','Male','Lausanne','Switzerland');

INSERT INTO profileVisitsUsers(email) VALUES ('tim@hellberg.se');

INSERT INTO profileVisitsUsers(email) VALUES ('damien@gengler.fr');

INSERT INTO profileVisitsUsers(email) VALUES ('damien2@gengler.fr');

INSERT INTO profileVisitsUsers VALUES ('damien.gengler69@gmail.com',1,2,7,4,5,2,10);

INSERT INTO messages VALUES (0,'tim@hellberg.se','tim@hellberg.se','This is a default message');

INSERT INTO messages VALUES (1,'damien@gengler.fr','tim@hellberg.se','Yooo big boi');

INSERT INTO messages VALUES (2,'tim@hellberg.se','damien@gengler.fr','SkrtSkrt');
