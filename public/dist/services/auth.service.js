"use strict";
/**
 * Created by aasheesh on 10/1/17.
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
var timezone = require("timezone");
var classObj;
var AuthGuard = (function () {
    function AuthGuard(router, userservice) {
        this.router = router;
        this.userservice = userservice;
        classObj = this;
        //console.log("timezones are " + moment.tz.names());
        console.log("timezones are " + timezone.tz.guess());
    }
    AuthGuard.prototype.canActivate = function (route, state) {
        return this.userservice.isUserLoggedIn().map(function (res) {
            //alert(res.loggedIn);
            if (res.json().loggedIn) {
                alert(res.json().loggedIn);
                classObj.userservice.UserDetails = res.json().user;
                console.log("userdetails are " + JSON.stringify(classObj.userservice.UserDetails, null, 2));
                return true;
            }
            else {
                alert(res.json().loggedIn);
                classObj.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                return false;
            }
        });
    };
    return AuthGuard;
}());
AuthGuard = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [router_1.Router, user_service_1.UserService])
], AuthGuard);
exports.AuthGuard = AuthGuard;
//# sourceMappingURL=auth.service.js.map