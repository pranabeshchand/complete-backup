import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../services/data.service';
import {Router} from 'angular2/router';
import * as jsep from "jsep";
import * as lodash from "lodash";

let classObj:any
@Component({
    selector:'tasklist',
    templateUrl:'../app/templates/tasklist.html'
})
export class TasklistComponent{
    data:Object;
    tasks: Object;
    step: number;
     salesobj: string;
    mappingObj: Object;
    name: string;

    currentTab: string;
 constructor(private dataservice: DataService, private router: Router){
    this.currentTab = 'all';
        this.tasks = [];
     classObj = this;
      this.salesobj = '';
     this.mappingObj = [];
     //this.name = '';
    console.log("this is demoaaaa...............");
    this.dataservice.getTasklist().map(res => res.json()).subscribe(data => {
        this.tasks =  data;
        this.data = JSON.parse(JSON.stringify(data));
         //console.log('datas '+JSON.stringify(data));
    }, err => console.log("false.... "+err));

 }

    taskListFilter(i){
        this.currentTab = i;
        var result;
        if(i == 'all'){
            this.tasks = JSON.parse(JSON.stringify(this.data));
        } else {

            var result  = lodash.filter(this.data.taskArray, {type: i});
            if(result) {
                this.tasks = {taskArray:result,'status':true};
            } else {
                this.tasks = {'status':false};
            }

            console.log(this.tasks);
        }
    }
    deleteTask(id){
        console.log("deleted Id: "+id);
        this.dataservice.getDeleteTask(id).map(res => res.json()).subscribe(data => {
            console.log('Delete success'+JSON.stringify(data));
            this.tasks =  data;
        }, err => console.log("Delete failed "+err));
        /*this.dataservice.getDeleteTask(id).map(res => res.json()).subscribe(data => {
            this.tasks =  data;
            this.data = JSON.parse(JSON.stringify(data));
            console.log('datas '+JSON.stringify(data));
        }, err => console.log("false.... "+err));*/
        console.log("idddd "+id);
         //var arrlist = this.data.taskArray;
       /* delete arrlist[id];
         var index = arrlist.indexOf(id);
        if (index > -1) {
            arrlist.splice(index, 1);
        }*/
        //this.tasks = {taskArray:this.data};


    }
    editTask(task){
        console.log('Task is: '+JSON.stringify(task));
        console.log('Task id: '+JSON.stringify(task.fileName));
        classObj.dataservice.getEditTask(task.fileName).map(res=>res.json()).subscribe(data => {
            console.log('file read'+ JSON.stringify(data.header));
            classObj.dataservice.csvHeader = data.header;
             this.salesobj = task.mapping.object;
            this.dataservice.tfilename = task.fileName;
            this.dataservice.tid = task._id;
            classObj.dataservice.mappingObj = task;
            //classObj.dataservice.mappingobj.fileName = task.mapping.fileName;
            this.dataservice.currentSalesObj = task.mapping.object;
            //classObj.salesObjects = res;
        }, err => console.log('errorrrrr '+err));
        this.dataservice.step= 2;
        this.router.navigate(['/import/update']);

    }
}
