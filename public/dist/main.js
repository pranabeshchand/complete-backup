"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by aasheesh on 27/12/16.
 */
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var http_1 = require("@angular/http");
var ngx_popover_1 = require("ngx-popover");
var angular2_datatable_1 = require("angular2-datatable");
var ng2_search_filter_1 = require("ng2-search-filter");
var app_component_1 = require("./component/app.component");
var login_component_1 = require("./component/login.component");
var header_component_1 = require("./component/header.component");
var sidemenu_component_1 = require("./component/sidemenu.component");
var clientconfig_component_1 = require("./component/clientconfig.component");
var configuration_component_1 = require("./component/configuration.component");
var objectmapping_component_1 = require("./component/objectmapping.component");
var salesconfig_component_1 = require("./component/salesconfig.component");
var viewmapping_component_1 = require("./component/viewmapping.component");
var datafilter_pipe_1 = require("./pipes/datafilter.pipe");
var cloudsharing_component_1 = require("./component/cloudsharing.component");
var googledriveapi_component_1 = require("./component/googledriveapi.component");
var attributemapping_component_1 = require("./component/attributemapping.component");
var summary_component_1 = require("./component/summary.component");
var import_component_1 = require("./component/import.component");
var export_component_1 = require("./component/export.component");
var export2_component_1 = require("./component/export2.component");
var exportsummary_component_1 = require("./component/exportsummary.component");
var tasklist_component_1 = require("./component/tasklist.component");
var menu_directive_1 = require("./directives/menu.directive");
var data_service_1 = require("./services/data.service");
var user_service_1 = require("./services/user.service");
var cloudsharing_service_1 = require("./services/cloudsharing.service");
var auth_service_1 = require("./services/auth.service");
var platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
var routes_1 = require("./routes");
var Main = (function () {
    function Main() {
    }
    return Main;
}());
Main = __decorate([
    core_1.NgModule({
        imports: [platform_browser_1.BrowserModule, ng2_search_filter_1.Ng2SearchPipeModule, forms_1.ReactiveFormsModule, router_1.RouterModule.forRoot(routes_1.AppRoutes), http_1.HttpModule, forms_1.FormsModule, angular2_datatable_1.DataTableModule, ngx_popover_1.PopoverModule],
        declarations: [app_component_1.AppComponent, login_component_1.LoginComponent, header_component_1.HeaderComponent, sidemenu_component_1.SideMenuComponent, clientconfig_component_1.ClientConfigComponent, configuration_component_1.ConfigComponent, objectmapping_component_1.ObjectMappingComponent, salesconfig_component_1.SalesConfigComponent, viewmapping_component_1.ViewMappingComponent, datafilter_pipe_1.DataFilterPipe, cloudsharing_component_1.CloudComponent, googledriveapi_component_1.GoogleDriveComponent, menu_directive_1.MenuDirective, attributemapping_component_1.AttributeMappingComponent, summary_component_1.SummaryComponent, import_component_1.ImportComponent, export_component_1.ExportComponent, export2_component_1.Export2Component, exportsummary_component_1.ExportSummary, tasklist_component_1.TasklistComponent],
        bootstrap: [app_component_1.AppComponent],
        providers: [data_service_1.DataService, user_service_1.UserService, cloudsharing_service_1.CloudService, auth_service_1.AuthGuard]
    })
], Main);
platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(Main);
//# sourceMappingURL=main.js.map