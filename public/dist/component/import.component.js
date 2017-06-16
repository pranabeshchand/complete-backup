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
var ImportComponent = (function () {
    function ImportComponent(route, dataservice, userservice, router) {
        this.route = route;
        this.dataservice = dataservice;
        this.userservice = userservice;
        this.router = router;
        classObj = this;
        if (router.url.indexOf('update') == -1) {
            classObj.dataservice.step = 1;
        }
        else {
            console.log("else mmmmmmmmmmmmmmmmmmmmmm");
        }
    }
    ImportComponent.prototype.ngOnInit = function () {
        if (this.router.url === '/export' || this.router.url.indexOf('/export') != -1) {
            classObj.dataservice.taskexport = true;
        }
        else {
            classObj.dataservice.taskexport = false;
        }
        if (!this.isAuthenticated()) {
            classObj.dataservice.activePanel = 'mycomputer';
        }
    };
    ImportComponent.prototype.getAccessTokenFromUrl = function () {
        if (window.location.hash) {
            var access_token = utils.parseQueryString(window.location.hash).access_token;
            classObj.dataservice.step = 2;
            classObj.dataservice.activePanel = 'dropbox';
            return access_token;
        }
    };
    ImportComponent.prototype.isAuthenticated = function () {
        return !!classObj.getAccessTokenFromUrl();
    };
    return ImportComponent;
}());
ImportComponent = __decorate([
    core_1.Component({
        templateUrl: './app/templates/import.html'
    }),
    __metadata("design:paramtypes", [router_1.ActivatedRoute, data_service_1.DataService, user_service_1.UserService, router_1.Router])
], ImportComponent);
exports.ImportComponent = ImportComponent;
//# sourceMappingURL=import.component.js.map