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

router.get('/new', function(req, res, next) {
  res.render('teas/new');
})

router.post('/', function(req, res, next) {
  pg.connect(connString, function(err, client, done) {
    if (err) return console.log(err);
    var reorderable;
    if (req.body['tea[reorderable]']) {
      reorderable = true;
    } else {
      reorderable = false;
    };

    var query = client.query("INSERT INTO teas(name, country, price, reorderable) VALUES($1, $2, $3, $4)", [req.body['tea[name]'], req.body['tea[country]'], req.body['tea[price]'], reorderable]);
    query.on('end', function () {
      done();
      res.redirect('/teas');
    });
  });
});

module.exports = router;
