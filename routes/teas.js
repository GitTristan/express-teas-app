var express = require('express');
var router = express.Router();
var pg = require('pg');
var connString = "postgres://localhost/express_teas_app";

var client = new pg.Client(connString);


router.get('/', function(req, res, next) {
  var teas = [];
  pg.connect(connString, function(err, client, done) {
    if (err) return console.log(err);
    var query = client.query("SELECT * FROM teas");
    query.on('row', function(row){
      teas.push(row);
    });
    query.on('end', function() {
      done();
      res.render('teas/index', {teas: teas});
    });
  });
});

module.exports = router;
