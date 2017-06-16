/**
 * Created by aasheesh on 24/5/17.
 */


var CronJob = require('cron').CronJob;
var circularJSON = require('circular-json');
var co = require('co');
var mapping = require('./routes/mapping');
var _ = require('lodash');

var jobArray = [];


var job = {
    createJob: function (db) {
        co(function*() {
            try {
                console.log("createJob called..........");
                var task = yield db.collection('Task').find({}).toArray();

                var total = task.length;
                console.log("length " + total);
                // console.log("count " + JSON.stringify(task[4],null,2));
                var taskId = '';
                for (var i = 0; i < task.length; i++) {
                    // console.log("task is " + JSON.stringify(task,null,2));
                    console.log("i is " + i);
                    if (task[i].cronExpression) {
                        console.log("i in if " + i);
                        var current = new Date().getTime();
                        var endDate = new Date(task[i].schedule.endDate).getTime();
                        if (endDate) {
                            var index = _.findIndex(jobArray, {taskId: task[i]._id})
                            if (current > endDate && index > -1) {
                                jobArray[index].job.stop();
                                _.remove(jobArray, {taskId: task[i]._id})

                            }
                        }
                        /*else {*/
                        //console.log("exp is " + task[i].cronExpression);
                        console.log("i in else " + i);
                        console.log("job array is " + jobArray.length);
                        var exist = _.find(jobArray, {taskId: task[i]._id});
                        console.log("exist is " + JSON.stringify(exist, null, 2));

                        if (!exist) {
                            console.log("else called......" + i);
                            var k = i;
                            var job = new CronJob(task[k].cronExpression, function () {
                                    co(function*() {
                                        try {
                                            console.log("task is " + JSON.stringify(task, null, 2));
                                            console.log("i in co block " + k);
                                            var sfconnection = yield mapping.salesforceInstance(task[k].userId);
                                            console.log("sfconnection is " + sfconnection);
                                            if (task[k].type == 'import') {
                                                console.log("job called.....");
                                                yield mapping.processCSV(task[k], sfconnection, task[k].userId);
                                            } else {
                                                yield mapping.processExport(task[k], sfconnection, task[k].userId);
                                            }
                                        } catch (e) {
                                            console.log("exception is " + e);
                                        }

                                    })

                                },
                                function () {
                                    /* This function is executed when the job stops */
                                    console.log("job stopped ");
                                },
                                true, /* Start the job right now */
                                task[j].schedule.timezone/* Time zone of this job. */
                            );
                            console.log('---============', i);
                            jobArray.push({job: job, taskId: task[i]._id});
                        }

                        /*}*/
                    }
                }
            } catch (err) {
                console.log("exception ..............." + err);
                //return err;
            }
        })
    },
    killJob: function (db) {

    }
}

module.exports = job;
