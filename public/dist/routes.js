"use strict";
/**
 * Created by aasheesh on 29/12/16.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var clientconfig_component_1 = require("./component/clientconfig.component");
var app_component_1 = require("./component/app.component");
var login_component_1 = require("./component/login.component");
var configuration_component_1 = require("./component/configuration.component");
var objectmapping_component_1 = require("./component/objectmapping.component");
var salesconfig_component_1 = require("./component/salesconfig.component");
var viewmapping_component_1 = require("./component/viewmapping.component");
var auth_service_1 = require("./services/auth.service");
var cloudsharing_component_1 = require("./component/cloudsharing.component");
var attributemapping_component_1 = require("./component/attributemapping.component");
var summary_component_1 = require("./component/summary.component");
var import_component_1 = require("./component/import.component");
var export_component_1 = require("./component/export.component");
var tasklist_component_1 = require("./component/tasklist.component");
exports.AppRoutes = [
    { path: 'clientconfig', component: clientconfig_component_1.ClientConfigComponent },
    { path: 'salesconfig', component: salesconfig_component_1.SalesConfigComponent },
    { path: 'objectmapping', component: objectmapping_component_1.ObjectMappingComponent, canActivate: [auth_service_1.AuthGuard] },
    { path: 'configuration', component: configuration_component_1.ConfigComponent, canActivate: [auth_service_1.AuthGuard] },
    { path: 'login', component: login_component_1.LoginComponent },
    { path: 'viewmapping', component: viewmapping_component_1.ViewMappingComponent },
    { path: 'home', component: app_component_1.AppComponent },
    { path: 'cloudsharing', component: cloudsharing_component_1.CloudComponent },
    { path: 'attributemapping', component: attributemapping_component_1.AttributeMappingComponent },
    { path: 'summary', component: summary_component_1.SummaryComponent },
    { path: 'tasklist', component: tasklist_component_1.TasklistComponent },
    { path: 'import', component: import_component_1.ImportComponent, canActivate: [auth_service_1.AuthGuard] },
    { path: 'import/update', component: import_component_1.ImportComponent, canActivate: [auth_service_1.AuthGuard] },
    { path: 'export', component: export_component_1.ExportComponent, canActivate: [auth_service_1.AuthGuard] },
    { path: '**', component: export_component_1.ExportComponent, canActivate: [auth_service_1.AuthGuard] }
];
//# sourceMappingURL=routes.js.map