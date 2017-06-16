"use strict";
/**
 * Created by aasheesh on 30/12/16.
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
var ConfigComponent = (function () {
    function ConfigComponent(userservice, router) {
        this.userservice = userservice;
        this.router = router;
        this.clientconfig = userservice.getClientConfig();
        this.salesconfig = userservice.getSalesConfig();
    }
    ConfigComponent.prototype.clientConfigEdit = function () {
        this.router.navigateByUrl('/clientconfig');
    };
    ConfigComponent.prototype.salesConfigEdit = function () {
        this.router.navigateByUrl('/salesconfig');
    };
    return ConfigComponent;
}());
ConfigComponent = __decorate([
    core_1.Component({
        templateUrl: './app/templates/configuration.html'
    }),
    __metadata("design:paramtypes", [user_service_1.UserService, router_1.Router])
], ConfigComponent);
exports.ConfigComponent = ConfigComponent;
//# sourceMappingURL=configuration.component.js.map