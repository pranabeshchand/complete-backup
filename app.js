var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var sf = require('./lib/salesforce');
var config = require('./config/config');
var database  = require('./config/db');

var mongodb = require('mongodb');
var session = require('express-session');
var multer  = require('multer')
var upload = multer({ dest: './test/' }).any();
var databs;
var jobscheduler = require('./jobscheduler');
var CronJob = require('cron').CronJob;
console.log("jobscheduler is " + jobscheduler);

var routes = require('./routes/index');
/*var users = require('./routes/users');*/

var app = express();

//app.use(busboy());


//Initialize Mongoose
var sess = {
    secret: 'd@ta$ync',
    cookie: {}
}
app.use(session(sess));

mongodb.MongoClient.connect('mongodb://localhost:27017/salesmongo', function(error, db){
    if(error) {
       console.log(error);
        //process.exit(1)
    }
    database.setDB(db);
   // databs = db;
    //app.set('database',databs);
    try {
        var job = new CronJob("* */10 * * *", function () {
                console.log("job started...");

                jobscheduler.createJob(db);
            }, function () {
                /* This function is executed when the job stops */
                console.log("job stopped ");
            },
            true /* Start the job right now */
            /* Time zone of this job. */
        );
       // jobscheduler.createJob(db);

    } catch(e) {
        console.log("exception " + e);
    }

    console.log('successfully connected to '+config.mongourl);
});




//Initialize sf
/*sf.init(config, function (res) {
    console.log('Initialized Sf..');
    app.set('sf', sf);
})*/

var allowCrossDomain = function(req, res, next) {
    //console.log("inside cors...");
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
}
app.use(allowCrossDomain);


// view engine setup
app.set('views', path.join(__dirname, 'public'));

//app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

console.log('dirname is ' + __dirname);
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/angular-route')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/angular')));
app.use('/css', express.static(path.join(__dirname, 'public/stylesheets')));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/routes', express.static(path.join(__dirname, 'routes')));
app.use(express.static(path.join(__dirname, 'public')));
// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());

app.use('/api', routes);

app.use('*', function (req, res) {
    res.render('index.html');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        })
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
