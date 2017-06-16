"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var data_service_1 = require("../services/data.service");
var lodash = require("lodash");
var classObj;
var TasklistComponent = (function () {
    function TasklistComponent(dataservice, router) {
        var _this = this;
        this.dataservice = dataservice;
        this.router = router;
        this.currentTab = 'all';
        this.tasks = [];
        classObj = this;
        this.salesobj = '';
        this.mappingObj = [];
        //this.name = '';
        console.log("this is demoaaaa...............");
        this.dataservice.getTasklist().map(function (res) { return res.json(); }).subscribe(function (data) {
            _this.tasks = data;
            _this.data = JSON.parse(JSON.stringify(data));
            //console.log('datas '+JSON.stringify(data));
        }, function (err) { return console.log("false.... " + err); });
    }
    TasklistComponent.prototype.taskListFilter = function (i) {
        this.currentTab = i;
        var result;
        if (i == 'all') {
            this.tasks = JSON.parse(JSON.stringify(this.data));
        }
        else {
            var result = lodash.filter(this.data.taskArray, { type: i });
            if (result) {
                this.tasks = { taskArray: result, 'status': true };
            }
            else {
                this.tasks = { 'status': false };
            }
            console.log(this.tasks);
        }
    };
    TasklistComponent.prototype.deleteTask = function (id) {
        var _this = this;
        console.log("deleted Id: " + id);
        this.dataservice.getDeleteTask(id).map(function (res) { return res.json(); }).subscribe(function (data) {
            console.log('Delete success' + JSON.stringify(data));
            _this.tasks = data;
        }, function (err) { return console.log("Delete failed " + err); });
        /*this.dataservice.getDeleteTask(id).map(res => res.json()).subscribe(data => {
            this.tasks =  data;
            this.data = JSON.parse(JSON.stringify(data));
            console.log('datas '+JSON.stringify(data));
        }, err => console.log("false.... "+err));*/
        console.log("idddd " + id);
        //var arrlist = this.data.taskArray;
        /* delete arrlist[id];
          var index = arrlist.indexOf(id);
         if (index > -1) {
             arrlist.splice(index, 1);
         }*/
        //this.tasks = {taskArray:this.data};
    };
    TasklistComponent.prototype.editTask = function (task) {
        var _this = this;
        console.log('Task is: ' + JSON.stringify(task));
        console.log('Task id: ' + JSON.stringify(task.fileName));
        classObj.dataservice.getEditTask(task.fileName).map(function (res) { return res.json(); }).subscribe(function (data) {
            console.log('file read' + JSON.stringify(data.header));
            classObj.dataservice.csvHeader = data.header;
            _this.salesobj = task.mapping.object;
            _this.dataservice.tfilename = task.fileName;
            _this.dataservice.tid = task._id;
            classObj.dataservice.mappingObj = task;
            //classObj.dataservice.mappingobj.fileName = task.mapping.fileName;
            _this.dataservice.currentSalesObj = task.mapping.object;
            //classObj.salesObjects = res;
        }, function (err) { return console.log('errorrrrr ' + err); });
        this.dataservice.step = 2;
        this.router.navigate(['/import/update']);
    };
    return TasklistComponent;
}());
TasklistComponent = __decorate([
    core_1.Component({
        selector: 'tasklist',
        templateUrl: '../app/templates/tasklist.html'
    }),
    __metadata("design:paramtypes", [data_service_1.DataService, router_1.Router])
], TasklistComponent);
exports.TasklistComponent = TasklistComponent;
//# sourceMappingURL=tasklist.component.js.map