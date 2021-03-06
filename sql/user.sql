DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;

CREATE TABLE users(
id SERIAL PRIMARY KEY,
first VARCHAR(250) NOT NULL,
last VARCHAR(250) NOT NULL,
email VARCHAR(250) NOT NULL UNIQUE,
password VARCHAR(250) NOT NULL
);

CREATE TABLE signatures (
id SERIAL PRIMARY KEY,
signature TEXT NOT NULL,
user_id INTEGER NOT NULL UNIQUE
);


CREATE TABLE user_profiles(
id SERIAL PRIMARY KEY,
age INTEGER,
city VARCHAR(250),
url VARCHAR(250),
user_id INTEGER REFERENCES users(id) UNIQUE
);
