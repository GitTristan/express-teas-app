# README

### How I made this

1. `$ express teas-with-postgresql`
1. `$ cd teas-with-postgresql`
1. COMMIT
1. Create README and take notes
1. Add `"pg": "~4.3.0",` to `package.json` dependencies
1. `$ npm install`
1. Create `.gitignore` with content `node_modules/**`
1. Create a postgres database with same name as app
  * log into postgres CLI replacing username with your postgres username
    * `$ psql -d postgres -U username`
  * create database
    * if you use `-` in your app name, replace with underscores `_`
    * `=# CREATE DATABASE teas_with_postgresql;`
1. Add the following to `app.js`, but:
  * replacing `username` with your postgres username
  * replacing password with postgres password
  * if you use `-` in your app name, replace with underscores `_`

  ```
  var pg = require('pg');

  var conString = "postgres://username:password@localhost/teas_with_postgresql";

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('SELECT NOW() AS "theTime"', function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      console.log("PostgreSQL is totally hooking it up: ", result.rows[0].theTime);
      done();
    });
  });
  ```
1. Fire up that server, and see if you have any errors...
  * `DEBUG=teas-with-postgresql:* npm start`
1. COMMIT `.gitignore`, them commit the rest
1. Change `users` to `teas`
  * In `app.js` change `var users = require('./routes/users');` to:
    * `var teas = require('./routes/teas');`
  * and change `app.use('/users', users);` to:
    * `app.use('/teas', teas);`
  * In `routes/`, rename `users.js` to `teas.js`
1. Stop and start server, and visit `http://localhost:3000/teas` to ensure all is well.
1. COMMIT
1. Add bootstrap
  * go to [http://getbootstrap.com/getting-started/#download](http://getbootstrap.com/getting-started/#download) and click on "Download Bootstrap" (zip file)
  * unzip, and rename file to just `bootstrap`
  * move this directory to `/public`
  * restart server and open [http://localhost:3000/](http://localhost:3000/)
  * require bootstrap in `/views/layout/jade`, contents of head should be:

    ```
    title= title
    link(rel='stylesheet', href='/bootstrap/css/bootstrap.min.css')
    link(rel='stylesheet', href='/bootstrap/css/bootstrap-responsive.min.css')
    link(rel='stylesheet', href='/stylesheets/style.css')
    script(src='http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js')
    script(src='/bootstrap/js/bootstrap.min.js')
    ```

  * refresh index... you should see the font change. Bootstrap is now loading!
1. COMMIT
1. Create a "migration" in a new folder `app/migration/createTeas.js` with the following content:

  ```
  var pg = require('pg');
  var conString = "postgres://emilyplatzer:@localhost/teas_with_postgresql";

  var client = new pg.Client(conString);
  client.connect();
  var query = client.query('CREATE TABLE teas(id SERIAL PRIMARY KEY, name VARCHAR(40) not null, oz INTEGER, inStock BOOLEAN)');
  query.on('end', function() { client.end(); });
  ```

  * run this by executing in terminal: `$ node app/migration/createTeas.js`
1. Verify that this created a table
  * `$ psql -d postgres -U username`
  * `\c teas_with_postgresql;`
  * `SELECT * FROM teas`
  * you should see an empty table!
1. Add one tea to our table:
  * `INSERT INTO teas(name, oz, instock) VALUES ('motherwort', 3, true);`
  * `SELECT * FROM teas`
  * you should see your new tea added to the table
1. View our teas on the tea index page
  * edit `/routes/teas.js`
    * add requires, necessary variables:

      ```
      var pg = require('pg');
      var conString = "postgres://emilyplatzer:@localhost/teas_with_postgresql"

      var client = new pg.Client(conString)
      ```
    * add route, should end up looking like this:

      ```
      router.get('/', function(req, res, next) {
        var teas = [];
        pg.connect(conString, function(err, client, done) {
          if (err) return console.log(err);
          var query = client.query("SELECT * FROM teas");
          query.on('row', function(row) {
            teas.push(row);
          });
          query.on('end', function() {
            done();
            res.render('teas/index', {teas: teas});
          });
        });
      });
      ```

  * Add view to `views/teas/index.jade` with content:

    ```
    extends ../layout

    block content
      h1(class="page-header") Check out my teas!

      table(class="table")
        thead
          th Tea name
          th Ounces requested
          th In Stock?
        tbody
          each tea in teas
            tr
              td= tea.name
              td= tea.oz
              td= tea.instock
    ```

1. COMMIT
1. Add new link for teas in index

  ```
  div(class="page-header")
    a(href="/teas/new" class="btn btn-success pull-right") Add Tea
    h1 Check out my teas!
  ```

1. Add route for new tea

  ```
  router.get('/new', function(req, res, next) {
    res.render('teas/new');
  });
  ```

1. Add view for new tea

  ```
  extends ../layout

  block content
    h1(class="page-header") New Tea

    ol(class="breadcrumb")
      li
        a(href="/teas") My Teas
      li(class="active") New

    form(action='/teas' method='post' class='form-horizontal')

      div(class='form-group')
        label(class="col-sm-2 control-label") Name
        div(class='col-sm-4')
          input(type="text" name="tea[name]" class='form-control')

      div(class="form-group")
        label(class="col-sm-2 control-label") Ounces needed
        div(class="col-sm-4")
          input(type='number' name='tea[oz]' class="form-control")

      div(class="form-group")
        div(class="col-sm-offset-2 col-sm-4")
          div(class="checkbox")
          label Do you have this tea in stock?
            input(type='checkbox' name='tea[instock]' class="form-control")

      div(class="form-group")
        div(class="col-sm-offset-2 col-sm-4")
          input(type='submit' name='commit' value='Add this tea' class="btn btn-success")
  ```

1. Add create route

  ```
  router.post('/', function(req, res, next) {
    pg.connect(conString, function(err, client, done) {
      if (err) return console.log(err);
      var query = client.query("INSERT INTO teas(name, oz, instock) values($1, $2, $3)", [req.body['tea[name]'], req.body['tea[oz]'], req.body['tea[inStock]']]);
      query.on('end', function() {
        done();
        res.redirect('/teas');
      });
    });
  });
  ```

1. COMMIT
1. Add link to tea show page

  ```
  td
    a(href="/teas/#{tea.id}")= tea.name
  ```

1. Add route for tea show

  ```
  router.get('/:id', function(req, res, next) {
    pg.connect(conString, function(err, client, done) {
      var tea;
      if (err) return console.log(err);
      var query = client.query("SELECT * FROM teas WHERE (id = " + req.params.id + ") LIMIT 1");
      query.on('row', function(row) {
        tea = row;
      });
      query.on('end', function() {
        done();
        res.render('teas/show', {tea: tea});
      });
    });
  });
  ```

1. Add view for tea show

  ```
  extends ../layout

  block content
    h1(class="page-header")= tea.name

    ol(class="breadcrumb")
      li
        a(href="/teas") My Teas
      li(class="active")= tea.name

    h3 #{tea.oz} Ounces
    if tea.instock
      h3 Available
    else
      h3 Unavailable
  ```

1. COMMIT
1. Add link for tea edit on `views/teas/index.jade`

  ```
  td
    a(href="/teas/#{tea.id}/edit" class="btn btn-warning") Edit
  ```

1. Add route for tea edit

  ```
  router.get('/:id/edit', function(req, res, next) {
    pg.connect(conString, function(err, client, done) {
      var tea;
      if (err) return console.log(err);
      var query = client.query("SELECT * FROM teas WHERE (id = " + req.params.id + ") LIMIT 1");
      query.on('row', function(row) {
        tea = row;
      });
      query.on('end', function() {
        done();
        res.render('teas/edit', {tea: tea});
      });
    });
  })
  ```

1. Add view for tea edit

  ```
  extends ../layout

  block content
    h1(class="page-header") Edit #{tea.name}

    ol(class="breadcrumb")
      li
        a(href="/teas") My Teas
      li(class="active") Edit

    form(action='/teas/#{tea.id}' method='post' class='form-horizontal')

      div(class='form-group')
        label(class="col-sm-2 control-label") Name
        div(class='col-sm-4')
          input(type="text" name="tea[name]" value=tea.name class='form-control')

      div(class="form-group")
        label(class="col-sm-2 control-label") Ounces needed
        div(class="col-sm-4")
          input(type='number' name='tea[oz]' value=tea.oz class="form-control")

      div(class="form-group")
        div(class="col-sm-offset-2 col-sm-4")
          div(class="checkbox")
          label Do you have this tea in stock?
            if tea.instock
              input(type='checkbox' name='tea[inStock]' checked=tea.instock class="form-control")
            else
              input(type='checkbox' name='tea[inStock]' class="form-control")

      div(class="form-group")
        div(class="col-sm-offset-2 col-sm-4")
          input(type='submit' name='commit' value='Update this tea' class="btn btn-success")
  ```

1. Add route for tea Update

  ```
  router.post('/:id', function(req, res, next) {
    pg.connect(conString, function(err, client, done) {
      if (err) return console.log(err);
      var query = client.query("UPDATE teas SET name=($1), oz=($2), instock=($3) WHERE id=($4)", [req.body['tea[name]'], req.body['tea[oz]'], req.body['tea[inStock]'], req.params.id]);
      query.on('end', function() {
        done();
        res.redirect('/teas');
      });
    });
  });
  ```

1. COMMIT
1. Add delete link to index

  ```
  a(href="/teas/#{tea.id}/delete" class="btn btn-warning") Delete
  ```

1. Add tea delete route

  ```
  router.get('/:id/delete', function(req, res, next) {
    pg.connect(conString, function(err, client, done) {
      if (err) return console.log(err);
      var query = client.query("DELETE FROM teas WHERE id=" + req.params.id);
      query.on('end', function() {
        done();
        res.redirect('/teas');
      });
    });
  });
  ```

1. COMMIT


#### References used:

1. [My previous Mongo Express Crud app "Books"](https://github.com/craftninja/express-example-books/blob/master/routes/books.js)
1. [Basic Database with PostgreSQL blog post](http://www.emilyplatzer.io/2014/04/07/postgresql.html)
1. [Express database integration guide](http://expressjs.com/guide/database-integration.html#postgres)
1. [Example code](https://github.com/brianc/node-postgres/wiki/Example)
1. [Express PostgreSQL JSON api walkthrough](http://mherman.org/blog/2015/02/12/postgresql-and-nodejs/#.VXUb61zBzGe)
