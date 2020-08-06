const express = require('express');
const app = express();
const port = 3000;
app.listen(port, () => console.log("Listening at Port "+port));
app.use(express.static('public'));

const mysql = require('mysql');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: 'pw%7z',
    database: 'db'
});

con.connect(function(err) {
    if (err) throw err;
    console.log("MySQL Connected!");
});