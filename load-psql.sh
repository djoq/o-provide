#!/bin/bash

set -e
set -u

RUN_ON_MYDB="psql -d test"

$RUN_ON_MYDB <<SQL

DROP TABLE users;

DROP TABLE oauth_clients;

CREATE TABLE users(id bigserial primary key, username text, password text);

\copy users from 'seed/users.csv' with csv;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users)+1);

CREATE TABLE oauth_clients(client_id text, client_secret text, user_id text, redirect_uri text);
 
\copy oauth_clients from './seed/oauth_clients.csv' with csv;

