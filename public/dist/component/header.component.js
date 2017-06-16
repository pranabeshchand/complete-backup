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
/**
 * Created by aasheesh on 28/12/16.
 */
var core_1 = require("@angular/core");
var user_service_1 = require("../services/user.service");
var router_1 = require("@angular/router");
var HeaderComponent = (function () {
    function HeaderComponent(userservice, router) {
        this.userservice = userservice;
        this.router = router;
        this.username = this.userservice.UserDetails.name;
    }
    HeaderComponent.prototype.logout = function () {
    };
    HeaderComponent.prototype.openNav = function () {
        document.getElementById("mySidenav").style.width = "250px";
        document.getElementById("main").style.marginLeft = "250px";
    };
    HeaderComponent.prototype.closeNav = function () {
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("main").style.marginLeft = "0";
    };
    HeaderComponent.prototype.openRightMenu = function () {
        document.getElementById("rightMenu").style.display = "block";
        document.getElementById("rightMenu").style.display = "block";
    };
    HeaderComponent.prototype.closeRightMenu = function () {
        document.getElementById("rightMenu").style.display = "none";
        document.getElementById("rightMenu").style.display = "none";
    };
    return HeaderComponent;
}());
HeaderComponent = __decorate([
    core_1.Component({
        selector: 'header',
        templateUrl: './app/templates/header.html'
    }),
    __metadata("design:paramtypes", [user_service_1.UserService, router_1.Router])
], HeaderComponent);
exports.HeaderComponent = HeaderComponent;
//# sourceMappingURL=header.component.js.map