"use strict";
/**
 * Created by aasheesh on 3/1/17.
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
var SalesConfigComponent = (function () {
    function SalesConfigComponent(userservice, formBuilder, dataservice, router) {
        this.userservice = userservice;
        this.formBuilder = formBuilder;
        this.dataservice = dataservice;
        this.router = router;
        // this.salesconfig = userservice.getSalesConfig();
        this.submitted = false;
    }
    SalesConfigComponent.prototype.ngOnInit = function () {
        this.salesconfig = this.userservice.getSalesConfig();
        this.salesConfigForm = this.formBuilder.group({
            salesforce_login: [this.salesconfig ? this.salesconfig.salesforce_login : '', forms_1.Validators.required],
            username: [this.salesconfig ? this.salesconfig.username : "", forms_1.Validators.required],
            password: [this.salesconfig ? this.salesconfig.password : "", forms_1.Validators.required],
        });
        /* this.salesConfigForm = this.formBuilder.group({
         salesforce_login: ['',Validators.required],
         username: ['',Validators.required],
         password: ['',Validators.required],

         });*/
    };
    SalesConfigComponent.prototype.saveSalesConfig = function () {
        // alert("called");
        var classObj = this;
        this.submitted = true;
        if (this.salesConfigForm.valid) {
            var salesConfigData = void 0;
            try {
                salesConfigData = {
                    sales: {
                        salesforce_login: this.salesConfigForm.controls['salesforce_login'].value,
                        username: this.salesConfigForm.controls['username'].value,
                        password: this.salesConfigForm.controls['password'].value
                    }
                };
            }
            catch (e) {
                console.log("exception is " + e);
            }
            this.dataservice.saveConfiguration(salesConfigData).map(function (res) { return res.json(); }).subscribe(function (result) {
                console.log("config saved to db" + result);
                classObj.userservice.UserDetails.config.sales = result.data.sales;
                classObj.router.navigateByUrl('/configuration');
            });
        }
        else {
        }
    };
    SalesConfigComponent.prototype.testsalesconnection = function () {
        var _this = this;
        this.testcompleted = false;
        var data = {
            loginUrl: this.salesConfigForm.controls['salesforce_login'].value,
            user: this.salesConfigForm.controls['username'].value,
            password: this.salesConfigForm.controls['password'].value
        };
        this.dataservice.testSalesforceConnection(data).map(function (res) { return res.json(); })
            .subscribe(function (res) {
            _this.testcompleted = true;
            alert(res.message);
        }, function (err) {
            _this.testcompleted = true;
            alert(err);
        });
    };
    return SalesConfigComponent;
}());
SalesConfigComponent = __decorate([
    core_1.Component({
        templateUrl: './app/templates/salesconfig.html'
    }),
    __metadata("design:paramtypes", [user_service_1.UserService, forms_1.FormBuilder, data_service_1.DataService, router_1.Router])
], SalesConfigComponent);
exports.SalesConfigComponent = SalesConfigComponent;
//# sourceMappingURL=salesconfig.component.js.map