"use strict";
/**
 * Created by aasheesh on 5/1/17.
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
require("rxjs/add/operator/map");
var http_1 = require("@angular/http");
/*declare var Auth0:any;*/
var UserService = (function () {
    function UserService(http, router) {
        this.http = http;
        this.router = router;
        this.UserDetails = {};
        if (localStorage.getItem("userdetails")) {
            this.UserDetails = JSON.parse(localStorage.getItem("userdetails"));
        }
        console.log("constructor called.....");
    }
    /* auth0 = new Auth0({
         domain: 'testsales.auth0.com',
         clientID: 'A6ZhMwI4BfM6rC8G01iii4HEH5H51ysE',
         responseType: 'token',
         callbackURL: 'http://localhost:3000/api/login/callback?state=viewmapping',
     });*/
    UserService.prototype.canActivate = function (route, state) {
        /* let classObj = this;
        // var result = this.auth0.parseHash(window.location.hash);
         console.log("result is " + JSON.stringify(result));
         this.auth0.getProfile(result.idToken, function (err:any, profile:any) {
             // normalized attributes from Auth0
             if (err) {
                 alert("Login Error......");
                 console.log("err in getProfile is " + err);
             }
             if (profile) {
                 console.log("profile is " + JSON.stringify(profile, null, 2));
                 classObj.getUser(profile).map(res=> res.json()).subscribe(res=> {
                     classObj.UserDetails = res;
                     localStorage.setItem("userdetails", JSON.stringify(res));
                     //classObj.router.navigateByUrl('/configuration');
                     classObj.router.navigateByUrl('/import');
                     return false;
                 })
 
             }
         });
 
         // not logged in so redirect to login page with the return url
         //this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
         //return false;*/
    };
    UserService.prototype.getClientConfig = function () {
        console.log("userdetails are " + JSON.stringify(this.UserDetails, null, 2));
        if (this.UserDetails.config) {
            return this.UserDetails.config.client;
        }
        else {
            return null;
        }
    };
    UserService.prototype.getSalesConfig = function () {
        if (this.UserDetails.config) {
            return this.UserDetails.config.sales;
        }
        else {
            return null;
        }
    };
    UserService.prototype.getUser = function (credentials) {
        return this.http.post('/api/login', credentials);
    };
    UserService.prototype.sociallogout = function () {
        return this.http.get('https://testsales.auth0.com/v2/logout?returnTo=http%3A%2F%2Flocalhost%3A3000&client_id=A6ZhMwI4BfM6rC8G01iii4HEH5H51ysE');
    };
    UserService.prototype.isUserLoggedIn = function () {
        return this.http.get('http://localhost:3000/api/authorize');
    };
    return UserService;
}());
UserService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http, router_1.Router])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map