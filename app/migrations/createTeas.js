var pg = require('pg');

var connString = "postgres://localhost/express_teas_app";

var client = new pg.Client(connString);
client.connect();

var query = client.query('CREATE TABLE teas(id SERIAL PRIMARY KEY, name VARCHAR(40) not null, country VARCHAR(40), price INTEGER, reorderable BOOLEAN not null default true)')
query.on('end', function(){ client.end(); });
