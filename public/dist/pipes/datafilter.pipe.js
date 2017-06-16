"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var DataFilterPipe = (function () {
    function DataFilterPipe() {
    }
    DataFilterPipe.prototype.transform = function (array, query) {
        var searchText = query;
        if (query) {
            searchText = query.toLowerCase();
        }
        else {
            searchText = "";
        }
        if (array) {
            if (array[0] && array[0].csvAttribute) {
                return array.filter(function (item) { return item.csvAttribute.toLowerCase().indexOf(searchText) !== -1; });
            }
            else if (array[0] && array[0].label) {
                return array.filter(function (item) { return item.label.toLowerCase().indexOf(searchText) !== -1 || item.name.toLowerCase().indexOf(searchText) !== -1; });
            }
            else {
                for (var j = 0; j < array.length; j++) {
                    if (array[j].list) {
                        for (var k = 0; k < array[j].list.length; k++) {
                            if (array[j].list[k].name.toLowerCase().indexOf(searchText) == -1 && array[j].list[k].label.toLowerCase().indexOf(searchText) == -1) {
                                array[j].list[k].isVisible = 'false';
                            }
                            else {
                                array[j].list[k].isVisible = 'true';
                            }
                        }
                    }
                }
            }
            return array;
        }
    };
    return DataFilterPipe;
}());
DataFilterPipe = __decorate([
    core_1.Pipe({
        name: "dataFilter"
    })
], DataFilterPipe);
exports.DataFilterPipe = DataFilterPipe;
//# sourceMappingURL=datafilter.pipe.js.map