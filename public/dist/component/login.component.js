"use strict";
/**
 * Created by aasheesh on 6/1/17.
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
var forms_1 = require("@angular/forms");
var user_service_1 = require("../services/user.service");
var data_service_1 = require("../services/data.service");
var auth_service_1 = require("../services/auth.service");
var router_1 = require("@angular/router");
var LoginComponent = (function () {
    function LoginComponent(userservice, router, formBuilder, auth, dataservice) {
        this.userservice = userservice;
        this.router = router;
        this.formBuilder = formBuilder;
        this.auth = auth;
        this.dataservice = dataservice;
    }
    LoginComponent.prototype.ngOnInit = function () {
        this.loginForm = this.formBuilder.group({
            username: ['', forms_1.Validators.required],
            password: ['', forms_1.Validators.required]
        });
    };
    LoginComponent.prototype.doLogin = function () {
    };
    LoginComponent.prototype.PopupCenter = function (url, title, w, h) {
        // Fixes dual-screen position                         Most browsers      Firefox
        var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
        var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
        var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
        var left = ((width / 2) - (w / 2)) + dualScreenLeft;
        var top = ((height / 2) - (h / 2)) + dualScreenTop;
        var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
        // Puts focus on the newWindow
        if (window.focus) {
            newWindow.focus();
        }
        return newWindow;
    };
    LoginComponent.prototype.loginWithSalesforce = function () {
        var url = 'http://localhost:3000/import';
        //var win = window.open('http://localhost:3000/api/sflogin', '_blank', 'location=yes,left=500, width=500,height=800');
        var win = this.PopupCenter('http://localhost:3000/api/sflogin', 'Salesforce Login', '800', '600');
        var pollTimer = window.setInterval(function () {
            try {
                console.log("length" + win.document.URL.length);
                if (win.document.URL.indexOf(url) != -1) {
                    window.clearInterval(pollTimer);
                    win.close();
                    console.log("reload the page....");
                    //window.opener.location.reload();
                    window.location.href = "http://localhost:3000/import";
                }
            }
            catch (e) {
            }
        }, 100);
    };
    return LoginComponent;
}());
LoginComponent = __decorate([
    core_1.Component({
        templateUrl: './app/templates/login.html',
        styleUrls: ['./app/styles/css/login.css']
    }),
    __metadata("design:paramtypes", [user_service_1.UserService, router_1.Router, forms_1.FormBuilder, auth_service_1.AuthGuard, data_service_1.DataService])
], LoginComponent);
exports.LoginComponent = LoginComponent;
//# sourceMappingURL=login.component.js.map