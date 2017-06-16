/**
 * Created by aasheesh on 25/5/17.
 */


/**
 * Created by aasheesh on 24/5/17.
 */


var CronJob = require('cron').CronJob;
var circularJSON = require('circular-json');
var co = require('co');
var mongodb = require('mongodb');

mongodb.MongoClient.connect('mongodb://localhost:27017/salesmongo', function(error, db){
    if(error) {
        console.log(error);
        //process.exit(1)
    }
    //database.setDB(db);
    // databs = db;
    //app.set('database',databs);
    try {
        killJob(db);
    } catch(e) {
        console.log("exception " + e);
    }

    //console.log('successfully connected to '+config.mongourl);
});

var killJob = function(db) {
    try {
        var task = db.collection('Task').find().toArray(function (err, task) {
            if (err) {
                console.log("err " + err);
            } else {
                var total = task.length;
                // console.log("count " + JSON.stringify(task[4],null,2));
                var taskId = '';
                for (var i = 0; i < total; i++) {
                    /* if(task[i].schedule.endDate) {
                     var current = new Date().getTime();
                     var endDate = new Date(task[i].schedule.endDate).getTime();
                     if(current > endDate) {
                     // stop the job
                     }

                     }*/
                    var job = {};
                    if (task[i].cronExpression) {
                        taskId = task[i]._id
                        console.log("record is " + JSON.stringify(task[i], null, 2));
                        console.log("exp is " + task[i].cronExpression);
                        job = circularJSON.parse(task[i].job);
                        job.stop();
                        /* var job = new CronJob(task[i].cronExpression, function () {

                         /!*var sfconnection = yield salesforceInstance(task[i].userId);
                         processCSV(task[i], sfconnection, userId);*!/
                         }, function () {
                         /!* This function is executed when the job stops *!/
                         console.log("job stopped ");
                         },
                         true /!* Start the job right now *!/
                         /!* Time zone of this job. *!/
                         );
                         delete task[i]._id;
                         task[i].job = circularJSON.stringify(job);
                         db.collection('Task').update({_id: {$eq: taskId}}, task[i], {upsert: false}, function (error, count, result) {
                         console.log("count is " + count);
                         })*/
                    }

                }
            }
        });

    } catch (err) {
        console.log("exception ..............." + err);
        //return err;
    }
}






