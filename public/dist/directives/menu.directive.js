"use strict";
/**
 * Created by aasheesh on 28/2/17.
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
var MenuDirective = (function () {
    function MenuDirective(el, renderer) {
        // Use renderer to render the element with styles
        jQuery(document).ready(function () {
            var trigger = jQuery('.hamburger'), overlay = jQuery('.overlay'), isClosed = false;
            trigger.click(function () {
                hamburger_cross();
            });
            function hamburger_cross() {
                if (isClosed == true) {
                    overlay.hide();
                    trigger.removeClass('is-open');
                    trigger.addClass('is-closed');
                    isClosed = false;
                }
                else {
                    overlay.show();
                    trigger.removeClass('is-closed');
                    trigger.addClass('is-open');
                    isClosed = true;
                }
            }
            jQuery('[data-toggle="offcanvas"]').click(function () {
                jQuery('#wrapper').toggleClass('toggled');
            });
        });
    }
    return MenuDirective;
}());
MenuDirective = __decorate([
    core_1.Directive({ selector: '[myMenu]' })
    // Directive class
    ,
    __metadata("design:paramtypes", [core_1.ElementRef, core_1.Renderer])
], MenuDirective);
exports.MenuDirective = MenuDirective;
//# sourceMappingURL=menu.directive.js.map