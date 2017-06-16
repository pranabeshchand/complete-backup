'use strict';

/*module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/', server.loopback.status());
  server.use(router);
};*/
var Promise = require('bluebird');
module.exports = function(app) {
  app.post('/testConnection', function(req, res){
    try{
      var DataSource = require('loopback-datasource-juggler').DataSource;
      var mysqlConnector = require('loopback-connector-mysql');

      var ds = new DataSource(mysqlConnector, {
        "host": req.body.host,
        "port": req.body.port,
        //"database": req.body.database, //"salesmysql",
        "username": req.body.username,
        "password": req.body.password,
        "debug": false
      });
      console.log(ds);
      ds.discoverModelDefinitions({owner: req.body.username}, function(err, ed){
        if(err){
          console.log('error ',err);
        }
        console.log("XXXXXXXXXXXX ",ed);
      });
    }catch(err){
      //console.error(err);
    }
    res.send('pong');
  });







  // Install a "/ping" route that returns "pong"
  app.post('/connection', function(req, res) {
try {
  var DataSource = require('loopback-datasource-juggler').DataSource;
  var mysqlConnector = require('loopback-connector-mysql');

  var ds = new DataSource(mysqlConnector, {
    "host": req.body.host,
    "port": req.body.port,
    "database": req.body.database, //"salesmysql",
    "username": req.body.username,
    "password": req.body.password,
    "debug": false
  });
//var conn = conntection(req.body.host , req.body.port, req.body.database, req.body.username, req.body.password, req.body.type);

 /* ds.discoverModelDefinitions({schema: req.body.database}, function(err, ed){
    if(err){
      console.log('error ',err);
    }
    console.log("XXXXXXXXXXXX ",ed);
  });*/
/*var a =ds.discoverSchemasSync('employee',{schema: req.body.database});
console.log("dd ",a);*/
  ds.discoverSchemas('employee',{schema: req.body.database}, function(err, ed){
    if(err){
      console.log('error ',err);
    }
    console.log("XXXXXXXXXXXXddd ",JSON.stringify(ed));
  });
  console.log("vv");
/*console.log("request ", req);
  console.log("sfsdfsdfsd ", ds);*/
  /*ds.discoverModelDefinitions({'schema':true}, function(err,data) {
   console.log("**------*",err,JSON.stringify(data))
   });*/
  /*
   ds.discoverAndBuildModels('Sales', {visited: {}},
   function (err, models) {
   if(err) {
   console.error(err)
   } else {
   //console.log('=========', models);
   models.Sales.listeners({}, function (err, inv) {
   if(err) {
   console.error('errors , ', err)
   } else {
   console.log('resp ', JSON.stringify(inv))
   }
   });*/
  /*models.Sales.findOne({}, function (err, inv) {
   if(err) {
   console.error('errors , ', err)
   } else {
   console.log('resp ', JSON.stringify(inv))
   }
   })*/
  }catch(e){
    console.log('error',e);
    }
    res.send('pong');

});

  function conntection(host, port, database, username, password, type){
    var DataSource = require('loopback-datasource-juggler').DataSource;
    var mysqlConnector = require('loopback-connector-mysql');

    var ds = new DataSource(mysqlConnector, {
      "host": host,
      "port": port,
      "database": database, //"salesmysql",
      "username": username,
      "password": password,
      "debug": false
    });


    return ds;
  }
//console.log('ppp ');

};
