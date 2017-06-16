import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { DataService } from '../services/data.service';


let classObj:any
@Component({
    selector: 'exportsummary',
    templateUrl: './app/templates/exportsummary.html'

})

export class ExportSummary{
    query: string;
    mappingObj:Object;
    startDate:string;
    scheduleTime:string;

    constructor(private dataservice:DataService, private userservice:UserService, private router:Router) {
        console.log("exportsummary called......")
        classObj = this;
        this.query = '';
        this.mappingObj = {};
    }

    ngOnInit() {
        this.query = classObj.dataservice.exportQuery;
        this.mappingObj = this.dataservice.currentMappingObj;
        classObj.exportResultSize = classObj.dataservice.exportResultSize;
        var d = new Date();
        this.startDate = classObj.today = d.toISOString().split('T')[0];
        this.scheduleTime = d.getHours() + ":" + d.getMinutes();
        classObj.scheduleType = "";
    }

    saveNewMapping(mappingName) {
        mappingName = mappingName + '.' + this.dataservice.getCurrentDate();
        var d = new Date();
        var obj = {
            name: mappingName,
            updatedat: d.toUTCString(),
            mapping: this.dataservice.currentMappingObj.mapping
        }
        var existingMapping;
        if(this.userservice.UserDetails && this.userservice.UserDetails.mappings) {
            existingMapping = this.userservice.UserDetails.mappings;
            if(!existingMapping.export) {
                existingMapping['export'] = [];
            }
        } else {
            existingMapping = {};
            existingMapping['export'] = [];
        }

        existingMapping['export'].push(obj);
        this.saveMapping(existingMapping);
    }

    updateMapping() {
        var d = new Date();
        var obj = this.dataservice.currentMappingObj;
        obj.updatedat = d.toUTCString();

        var existingMapping = this.userservice.UserDetails.mappings;

        for(var j=0; j < existingMapping.export.length; j++) {
            if(existingMapping.export[j].name == obj.name) {
                existingMapping.export[j] = obj;
            }
        }
        this.dataservice.currentMappingObj = existingMapping;
        this.saveMapping(existingMapping);
    }

    saveMapping(mapping) {
        if (this.isEmpty(mapping)) {
            alert("Nothing to save.")
        } else {
            let obj = {
                mappingobj: mapping,
                username: this.userservice.UserDetails.username,
                type: this.dataservice.task,
                soql: classObj.dataservice.exportQuery
            }

            this.dataservice.saveObjectMapping(obj).map(res=> res.json()).subscribe(res=> {
                    console.log(res);
                    classObj.userservice.UserDetails.mappings = res.user.mappingobj;

                    localStorage.setItem("userdetails", JSON.stringify(classObj.userservice.UserDetails));
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
}

