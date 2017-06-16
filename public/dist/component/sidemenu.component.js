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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var SideMenuComponent = (function () {
    function SideMenuComponent() {
    }
    return SideMenuComponent;
}());
SideMenuComponent = __decorate([
    core_1.Component({
        selector: 'sideMenu',
        templateUrl: './app/templates/sidemenu.html',
        styleUrls: ['./app/styles/css/sidemenu.css']
    })
], SideMenuComponent);
exports.SideMenuComponent = SideMenuComponent;
//# sourceMappingURL=sidemenu.component.js.map