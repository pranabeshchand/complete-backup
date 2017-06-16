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
var classObj;
var ExportSummary = (function () {
    function ExportSummary(dataservice, userservice, router) {
        this.dataservice = dataservice;
        this.userservice = userservice;
        this.router = router;
        console.log("exportsummary called......");
        classObj = this;
        this.query = '';
        this.mappingObj = {};
    }
    ExportSummary.prototype.ngOnInit = function () {
        this.query = classObj.dataservice.exportQuery;
        this.mappingObj = this.dataservice.currentMappingObj;
        classObj.exportResultSize = classObj.dataservice.exportResultSize;
        var d = new Date();
        this.startDate = classObj.today = d.toISOString().split('T')[0];
        this.scheduleTime = d.getHours() + ":" + d.getMinutes();
        classObj.scheduleType = "";
    };
    ExportSummary.prototype.saveNewMapping = function (mappingName) {
        mappingName = mappingName + '.' + this.dataservice.getCurrentDate();
        var d = new Date();
        var obj = {
            name: mappingName,
            updatedat: d.toUTCString(),
            mapping: this.dataservice.currentMappingObj.mapping
        };
        var existingMapping;
        if (this.userservice.UserDetails && this.userservice.UserDetails.mappings) {
            existingMapping = this.userservice.UserDetails.mappings;
            if (!existingMapping.export) {
                existingMapping['export'] = [];
            }
        }
        else {
            existingMapping = {};
            existingMapping['export'] = [];
        }
        existingMapping['export'].push(obj);
        this.saveMapping(existingMapping);
    };
    ExportSummary.prototype.updateMapping = function () {
        var d = new Date();
        var obj = this.dataservice.currentMappingObj;
        obj.updatedat = d.toUTCString();
        var existingMapping = this.userservice.UserDetails.mappings;
        for (var j = 0; j < existingMapping.export.length; j++) {
            if (existingMapping.export[j].name == obj.name) {
                existingMapping.export[j] = obj;
            }
        }
        this.dataservice.currentMappingObj = existingMapping;
        this.saveMapping(existingMapping);
    };
    ExportSummary.prototype.saveMapping = function (mapping) {
        if (this.isEmpty(mapping)) {
            alert("Nothing to save.");
        }
        else {
            var obj = {
                mappingobj: mapping,
                username: this.userservice.UserDetails.username,
                type: this.dataservice.task,
                soql: classObj.dataservice.exportQuery
            };
            this.dataservice.saveObjectMapping(obj).map(function (res) { return res.json(); }).subscribe(function (res) {
                console.log(res);
                classObj.userservice.UserDetails.mappings = res.user.mappingobj;
                localStorage.setItem("userdetails", JSON.stringify(classObj.userservice.UserDetails));
                alert("mapping saved...");
                classObj.dataservice.step = 1;
            }, function (err) { return console.log(err); });
        }
    };
    ExportSummary.prototype.isEmpty = function (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    };
    return ExportSummary;
}());
ExportSummary = __decorate([
    core_1.Component({
        selector: 'exportsummary',
        templateUrl: './app/templates/exportsummary.html'
    }),
    __metadata("design:paramtypes", [data_service_1.DataService, user_service_1.UserService, router_1.Router])
], ExportSummary);
exports.ExportSummary = ExportSummary;
//# sourceMappingURL=exportsummary.component.js.map