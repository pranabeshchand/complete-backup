"use strict";
/**
 * Created by aasheesh on 22/3/17.
 */
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
var ExportComponent = (function () {
    function ExportComponent(route, dataservice, userservice, router) {
        this.route = route;
        this.dataservice = dataservice;
        this.userservice = userservice;
        this.router = router;
        classObj = this;
        this.query = '';
        classObj.dataservice.step = 1;
    }
    ExportComponent.prototype.ngOnInit = function () {
        if (!this.dataservice.currentSalesObj) {
            this.salesobj = this.dataservice.currentSalesObj = localStorage.getItem("currentSalesObj");
        }
        if (this.router.url === '/export' || this.router.url.indexOf('/export') != -1) {
            classObj.dataservice.taskexport = true;
        }
        else {
            classObj.dataservice.taskexport = false;
        }
        this.dataservice.getSalesAttributes(this.salesobj).map(function (res) { return res.json(); }).subscribe(function (res) {
            classObj.salesAttribute = res;
            classObj.query = 'SELECT FROM ' + classObj.salesAttribute;
            // console.log("sales attribute are " + JSON.stringify(classObj.salesAttribute, null, 2));
        }, function (err) {
            console.log("err " + err);
        });
        if (!this.isAuthenticated()) {
            classObj.dataservice.activePanel = 'mycomputer';
        }
    };
    ExportComponent.prototype.insert = function (str, index, value) {
        return str.substr(0, index) + value + str.substr(index);
    };
    ExportComponent.prototype.dataQuery = function (str, value) {
        var tempstr = '';
        if (str.indexOf(value) == -1) {
            var index = str.indexOf('from');
            console.log("index is " + index);
            if (index == 7) {
                tempstr = this.insert(str, index - 1, ' ' + value + '');
            }
            else {
                tempstr = this.insert(str, index - 1, ',' + value + '');
            }
        }
        else {
            var index = str.indexOf(value);
            if (str.indexOf(',' + value) > -1) {
                tempstr = str.replace(',' + value, '');
            }
            if (str.indexOf(value + ',') > -1) {
                tempstr = str.replace(value + ',', '');
            }
            if (str.indexOf(',' + value) == -1 && str.indexOf(value + ',') == -1) {
                tempstr = str.replace(value, '');
            }
        }
        console.log(tempstr);
        return tempstr;
    };
    ExportComponent.prototype.getAccessTokenFromUrl = function () {
        if (window.location.hash) {
            var access_token = utils.parseQueryString(window.location.hash).access_token;
            classObj.dataservice.step = 3;
            classObj.dataservice.activePanel = 'dropbox';
            return access_token;
        }
    };
    ExportComponent.prototype.isAuthenticated = function () {
        return !!classObj.getAccessTokenFromUrl();
    };
    return ExportComponent;
}());
ExportComponent = __decorate([
    core_1.Component({
        templateUrl: './app/templates/export.html'
    }),
    __metadata("design:paramtypes", [router_1.ActivatedRoute, data_service_1.DataService, user_service_1.UserService, router_1.Router])
], ExportComponent);
exports.ExportComponent = ExportComponent;
//# sourceMappingURL=export.component.js.map