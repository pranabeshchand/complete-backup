"use strict";
/**
 * Created by aasheesh on 28/12/16.
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
var forms_1 = require("@angular/forms");
var data_service_1 = require("../services/data.service");
var user_service_1 = require("../services/user.service");
var ClientConfigComponent = (function () {
    function ClientConfigComponent(formBuilder, dataservice, userservice, router) {
        this.formBuilder = formBuilder;
        this.dataservice = dataservice;
        this.userservice = userservice;
        this.router = router;
        //this.clientconfig = dataservice.getClientConfig();
        this.clientconfig = userservice.getClientConfig();
        this.submitted = false;
        console.log("in clientconfig " + JSON.stringify(this.clientconfig));
    }
    ClientConfigComponent.prototype.ngOnInit = function () {
        /* this.configForm = this.formBuilder.group({
         server_name: [this.clientconfig.server_name, Validators.required],
         username: [this.clientconfig.username, Validators.required],
         password: [this.clientconfig.password, Validators.required],
         db: [this.clientconfig.db, Validators.required]
         });*/
        this.configForm = this.formBuilder.group({
            server_name: [this.clientconfig ? this.clientconfig.server_name : '', forms_1.Validators.required],
            db: [this.clientconfig ? this.clientconfig.db : '', forms_1.Validators.required]
        });
    };
    ClientConfigComponent.prototype.saveClientconfig = function () {
        var classObj = this;
        this.submitted = true;
        if (this.configForm.valid) {
            var salesConfigData = {
                client: {
                    server_name: this.configForm.controls['server_name'].value,
                    db: this.configForm.controls['db'].value
                }
            };
            this.dataservice.saveConfiguration(salesConfigData).map(function (res) { return res.json(); }).subscribe(function (result) {
                console.log("config saved to db" + JSON.stringify(result));
                try {
                    classObj.userservice.UserDetails.config.client = result.data.client;
                    classObj.router.navigateByUrl('/configuration');
                }
                catch (e) {
                    console.log("exception is " + e);
                }
            });
        }
        else {
            /* alert("invalid form...");*/
        }
    };
    ClientConfigComponent.prototype.testconnection = function () {
        this.submitted = true;
        if (this.configForm.valid) {
            var url = {
                server_name: this.configForm.controls['server_name'].value,
                dbname: this.configForm.controls['db'].value
            };
            this.dataservice.testconnectivity(url).map(function (res) { return res.json(); }).subscribe(function (res) { return alert(res.msg); }, function (err) { return console.log(JSON.stringify(err)); });
        }
    };
    return ClientConfigComponent;
}());
ClientConfigComponent = __decorate([
    core_1.Component({
        selector: 'editconfig',
        templateUrl: './app/templates/clientconfig.html'
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, data_service_1.DataService, user_service_1.UserService, router_1.Router])
], ClientConfigComponent);
exports.ClientConfigComponent = ClientConfigComponent;
//# sourceMappingURL=clientconfig.component.js.map