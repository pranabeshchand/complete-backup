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
var user_service_1 = require("../services/user.service");
var data_service_1 = require("../services/data.service");
var timezone = require("timezone");
var classObj;
var SummaryComponent = (function () {
    function SummaryComponent(dataservice, userservice, router) {
        this.dataservice = dataservice;
        this.userservice = userservice;
        this.router = router;
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
    SummaryComponent.prototype.ngOnInit = function () {
        var d = new Date();
        this.schedule.startDate = classObj.today = d.toISOString().split('T')[0];
        this.schedule.scheduleTime = d.getHours() + ":" + d.getMinutes();
        classObj.schedule.scheduleType = "";
    };
    SummaryComponent.prototype.saveNewMapping = function (mappingName) {
        /* var obj = {
             fileName: classObj.dataservice.fileName,
             mapping: this.dataservice.currentMappingObj.mapping
         }*/
        var obj = {
            fileDetails: classObj.dataservice.fileDetails,
            mapping: this.dataservice.currentMappingObj.mapping
        };
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
        console.log("obj passed for mapping save " + JSON.stringify(obj, null, 2));
        this.saveMapping(mappingName, obj);
    };
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
    SummaryComponent.prototype.saveMapping = function (name, mappingobj) {
        if (this.isEmpty(mappingobj)) {
            alert("Nothing to save.");
        }
        else {
            var obj = {};
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
            }
            else {
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
            this.dataservice.saveObjectMapping(obj).map(function (res) { return res.json(); }).subscribe(function (res) {
                console.log("after mapping save " + JSON.stringify(res, null, 2));
                //classObj.userservice.UserDetails.mappings = res.data.mappingobj;
                /*classObj.userservice.UserDetails = res.user;

                console.log("after save userdetails are " + JSON.stringify(classObj.userservice.UserDetails, null, 2));

                localStorage.setItem("userdetails", JSON.stringify(classObj.userservice.UserDetails));*/
                alert("mapping saved...");
                classObj.dataservice.step = 1;
            }, function (err) { return console.log(err); });
        }
    };
    SummaryComponent.prototype.isEmpty = function (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    };
    SummaryComponent.prototype.validateMappingName = function (name) {
        var existingMapping = this.userservice.UserDetails.mappings;
        if (existingMapping) {
            for (var j = 0; j < existingMapping.length; j++) {
                if (existingMapping[j].name == name) {
                    return true;
                }
            }
        }
        return false;
    };
    return SummaryComponent;
}());
SummaryComponent = __decorate([
    core_1.Component({
        selector: 'importsummary',
        templateUrl: './app/templates/summary.html',
        styleUrls: ['./app/styles/css/summary.css']
    }),
    __metadata("design:paramtypes", [data_service_1.DataService, user_service_1.UserService, router_1.Router])
], SummaryComponent);
exports.SummaryComponent = SummaryComponent;
//# sourceMappingURL=summary.component.js.map