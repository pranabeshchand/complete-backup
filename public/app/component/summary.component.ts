import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { DataService } from '../services/data.service';
import { CloudService } from '../services/cloudsharing.service';
import * as moment from 'moment';
import * as timezone from 'timezone';


let classObj:any
@Component({
    selector: 'importsummary',
    templateUrl: './app/templates/summary.html',
    styleUrls: ['./app/styles/css/summary.css']

})

export class SummaryComponent {
    mappingObj:Object;
    startDate:string;
    endDate:string;
    scheduleTime:string;
    scheduleType:string;
    timezones: Array;
    schedule: any;
    currentTimeZone: string

    constructor(private dataservice:DataService, private userservice:UserService, private router:Router) {
        debugger;
        classObj = this;
        this.mappingObj = this.dataservice.currentMappingObj;
        this.schedule = {};
        this.timezones = timezone.tz.names();
        this.currentTimeZone = timezone.tz.guess();
        //console.log("timezones are " + moment.tz.names());
        /*if(!this.mappingObj || !this.mappingObj.mapping) {
         this.router.navigate(['/viewmapping']);
         }*/
    }

    ngOnInit() {
        var d = new Date();
        this.schedule.startDate = classObj.today = d.toISOString().split('T')[0];
        this.schedule.scheduleTime = d.getHours() + ":" + d.getMinutes();
        classObj.schedule.scheduleType = "";
    }

    saveNewMapping(mappingName) {
       /* var obj = {
            fileName: classObj.dataservice.fileName,
            mapping: this.dataservice.currentMappingObj.mapping
        }*/

        var obj = {
            fileDetails: classObj.dataservice.fileDetails,
            mapping: this.dataservice.currentMappingObj.mapping
        }
        /*if (this.scheduleType != '') {
            obj['schedule'] = {
                scheduleType: this.scheduleType,
                scheduleTime: this.scheduleTime,
                startDate: this.startDate,
                endDate: this.endDate,
            }
        }*/

        if (this.schedule.scheduleType != '') {
         obj['schedule'] = this.schedule;
         }


        /* var existingMapping;
         if(this.userservice.UserDetails && this.userservice.UserDetails.mappings) {
         existingMapping = this.userservice.UserDetails.mappings;
         if(!existingMapping.import) {
         existingMapping['import'] = [];
         }
         } else {
         existingMapping = {};
         existingMapping['import'] = [];
         }

         existingMapping['import'].push(obj);*/
        console.log("obj passed for mapping save " + JSON.stringify(obj,null,2));
        this.saveMapping(mappingName, obj);
    }


    /* updateMapping() {
     var d = new Date();
     var obj = this.dataservice.currentMappingObj;
     obj.updatedat = d.toUTCString();

     var existingMapping = this.userservice.UserDetails.mappings;

     for(var j=0; j < existingMapping.import.length; j++) {
     if(existingMapping.import[j].name == obj.name) {
     existingMapping.import[j] = obj;
     }
     }
     this.dataservice.currentMappingObj = existingMapping;
     this.saveMapping(existingMapping);
     }*/

    saveMapping(name, mappingobj) {

        if (this.isEmpty(mappingobj)) {
            alert("Nothing to save.")
        } else {

            let obj = {};
            if (this.router.url.indexOf('update') == -1) {
                console.log("data for mapping.....  " + mappingobj);
                obj = {
                    name: name,
                    type: 'import',
                    fileDetails: mappingobj.fileDetails,
                    mapping: mappingobj.mapping,
                    schedule: mappingobj.schedule
                };
                console.log('create.... ' + obj);
            } else {
                console.log('Mapping object filename: ' + classObj.dataservice.tfilename);
                mappingobj.fileName = classObj.dataservice.tfilename;
                obj = {
                    _id: classObj.dataservice.tid,
                    name: name,
                    type: 'import',
                    fileName: mappingobj.fileName,
                    mapping: mappingobj.mapping,
                    schedule: mappingobj.schedule
                };
                console.log("else mmmmmmmmmmmmmmmmmmmmmm " + obj);
                console.log("edited task id is " + classObj.dataservice.tid);
            }
            console.log("import mapping obj just before send " + JSON.stringify(obj, null, 2));
            this.dataservice.saveObjectMapping(obj).map(res=> res.json()).subscribe(res=> {
                    console.log("after mapping save " + JSON.stringify(res, null, 2));
                    //classObj.userservice.UserDetails.mappings = res.data.mappingobj;
                    /*classObj.userservice.UserDetails = res.user;

                    console.log("after save userdetails are " + JSON.stringify(classObj.userservice.UserDetails, null, 2));

                    localStorage.setItem("userdetails", JSON.stringify(classObj.userservice.UserDetails));*/
                    alert("mapping saved...");
                    classObj.dataservice.step = 1;
                },
                    err=> console.log(err)
            );

        }
    }

    isEmpty(obj:any) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    validateMappingName(name) {
        var existingMapping = this.userservice.UserDetails.mappings;
        if (existingMapping) {
            for (var j = 0; j < existingMapping.length; j++) {
                if (existingMapping[j].name == name) {
                    return true;
                }
            }
        }
        return false;
    }
}
