'use strict';
var q = require('q');
module.exports = function(Customapi) {
  /*Customapi.testConnection = function(connection, type, cb){

    //console.log("sfdgsdgdfgdfgdf  ",connection);
    var conn = '';
    var response = {};
    var DataSource = require('loopback-datasource-juggler').DataSource;
    if(!process.env.VCAP_SERVICES) {
      try {
        switch (type) {
          case 'mysql':
            var mysqlConnector = require('loopback-connector-mysql');
            conn = new DataSource(mysqlConnector, connection);
            break;
          case 'oracle':
            var mysqlConnector = require('loopback-connector-oracle');
            conn = new DataSource(mysqlConnector, connection);
            break;
        }
        /!*if (conn) {
          console.log('connect', conn);*!/
          response = {"msg": "Connection success", "error": 1};
          cb(null, JSON.stringify(response));
       /!* } else {
          var e = {"msg": "invalid Connection", "error": 0};
          cb(JSON.stringify(e));
        }*!/
      } catch (err) {
        console.error('e-----------========', err.message)
        var e = {"msg": "invalid Connection", "error": 0};
        cb(JSON.stringify(e));
      }
    }
  };*/
Customapi.testConnection = function(connection, type, cb){
  var response = {};
  switch (type) {
    case 'mysql':
      var mysql   = require('mysql');
      var conn = mysql.createConnection(connection);
      conn.connect(function(err) {
        if (err) {
          var e = {"msg": "Access denied for user", "error": 0};
          cb(JSON.stringify(e));
        } else {
          conn.query('show databases', function (error, results) {
            if (error){
              var e = {"msg": "invalid database list", "error": 0};
              cb(JSON.stringify(error));
            }
            /*if(results){
              response = {"list": results, "msg": 'Connection Success and database list', 'error':1}
            }else{
              response = {"list": results, "msg": 'No database List', 'error':0}
            }*/
             //console.log('results ',JSON.stringify(response));
            cb(null, JSON.stringify(results));
          });

        }
      });
      break;
    case 'oracle':
      var mysqlConnector = require('loopback-connector-oracle');
      conn = new DataSource(mysqlConnector, connection);
      break;
  }
  //console.log(connection);
};
  Customapi.remoteMethod(
    'testConnection', {
      http: {
        path: '/testConnection',
        varb: 'post'
      },
      accepts: [
        {arg: 'data', type: 'object', required: true},
        {arg: 'databaseServer', type: 'string', required: true}
      ],
      returns: {arg: 'database', type: 'object'}
    });


  Customapi.createConnection = function(connection, type, purpose, cb) {
    var conn = '';
    var DataSource = require('loopback-datasource-juggler').DataSource;
    try{
      switch(type){
        case 'mysql':
          var mysqlConnector = require('loopback-connector-mysql');
          conn = new DataSource(mysqlConnector, connection);
          break;
        case 'oracle':
          var mysqlConnector = require('loopback-connector-oracle');
          conn = new DataSource(mysqlConnector, connection);
          break;
      }
      if(conn){
        switch(purpose){
          case 'collectionList':
            var collection = getCollection(conn, connection.database);
            collection.then(function(result) {
              cb(null, JSON.stringify(result));
            }, function(e){
              console.log('errr--', JSON.stringify(e));
              cb(JSON.stringify(e));
            });
            break;
          case 'collectionProperty':
            var modelName = 'Account';
            var collectionProperty = getCollectionProperty(conn, connection.database, modelName);
            collectionProperty.then(function(result){
              console.log("proerptys...... ",result);
            }, function(err){
              console.log('prperty error ',err);
            });
            break;
        }
      }else{
        var e = {"error":"invalid Connection"};
        cb(JSON.stringify(e));
      }

    }catch(err){
      console.log('err----', JSON.stringify(err));
      cb(err);
    }
  }

  Customapi.remoteMethod('createConnection', {
    http: {
      path: '/createConnection',
      verb: 'post'
    },
    accepts: [
      {arg:'data', type: 'object', required: true},
      {arg:'type', type: 'string', required: true},
      {arg:'purpose', type: 'string'},
      ],
    returns: {arg: 'collections', type: 'object'}
  });



  function getCollection(connection, database){
    var d = q.defer();

    //var res = '';
    connection.discoverModelDefinitions({schema: database}, function(err, res){
      if(err){
        //console.log(err);
        d.reject(err);
      }else{
        //console.log(res);
        d.resolve(res);
      }

    });
    return d.promise;
  }
  function getCollectionProperty(connection, database, tableName){
    connection.discoverModelProperties({modelName:tableName }, function(err, res){
      if(err){
        console.log('errrr ',err);
      }else{
        console.log('resss ',res);
      }
    });
  }
  /*{
   "host": host,
   "port": port,
   "database": database, //"salesmysql",
   "username": username,
   "password": password,
   "debug": false
   }*/


  Customapi.connectionList = function(userId,cb) {
    Customapi.findById(userId, function (err, instance) {
      if(err){
        cb(err);
      }else{
        var response = JSON.stringify(instance);
        cb(null, response);
        console.log(JSON.stringify(instance));
      }

    });

  };
  Customapi.remoteMethod(
    'connectionList', {
      http: {
        path: '/connectionList',
        verb: 'get'
      },
      accepts: {arg:'id', type: 'string', http: {source:'query' }},
      returns: {arg: 'User', type: 'object'}
    }
  );
};
