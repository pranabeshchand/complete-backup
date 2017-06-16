"use strict";
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
var data_service_1 = require("../services/data.service");
var json2csv = require("json2csv");
var classObj;
var Export2Component = (function () {
    function Export2Component(route, dataservice, userservice, router) {
        this.route = route;
        this.dataservice = dataservice;
        this.userservice = userservice;
        this.router = router;
        console.log("export2 called......");
        classObj = this;
        this.query = '';
        this.step = 1;
    }
    Export2Component.prototype.ngOnInit = function () {
        this.salesobj = this.dataservice.currentSalesObj;
        classObj.salesOrderType = 'Asc';
        classObj.orderBySalesAttr = '';
        classObj.filterBySalesObj = '';
        if (!classObj.dataservice.exportFilter) {
            this.dataservice.getFiltersJson().map(function (res) { return res.json(); }).subscribe(function (data) {
                classObj.dataservice.exportFilter = data;
            }, function (err) { return console.log(err); });
        }
        if (classObj.dataservice.salesListObjArray) {
            classObj.salesListObjArray = classObj.dataservice.salesListObjArray;
            classObj.selectedOrderBySalesObj = classObj.selectedFilterSalesObj = classObj.dataservice.salesListObjArray[0];
            classObj.salesAttributeForOrder = classObj.salesAttributeForFilter = classObj.dataservice.salesListObjArray[0].list;
            classObj.filterBySalesObj = classObj.dataservice.salesListObjArray[0].list[0];
            classObj.filterBySalesAttribute();
            classObj.query = classObj.dataservice.exportQuery;
        }
        else {
            this.dataservice.getSalesAttributes(this.salesobj).map(function (res) { return res.json(); }).subscribe(function (res) {
                var salesArr = [{ name: classObj.salesobj, list: res, isCollapsed: true }];
                if (res && res.length > 0) {
                    for (var j = 0; j < res.length; j++) {
                        if (res[j].type == 'reference' && res[j].relationshipName) {
                            var obj = {
                                name: res[j].relationshipName,
                                isCollapsed: true,
                                referenceTo: res[j].referenceTo
                            };
                            salesArr.push(obj);
                        }
                    }
                }
                classObj.dataservice.salesListObjArray = classObj.salesListObjArray = salesArr;
                classObj.selectedOrderBySalesObj = classObj.selectedFilterSalesObj = salesArr[0];
                classObj.salesAttributeForOrder = classObj.salesAttributeForFilter = res;
                classObj.filterBySalesObj = res[0];
                classObj.filterBySalesAttribute();
                classObj.dataservice.exportQuery = classObj.query = 'SELECT FROM ' + classObj.salesobj;
            }, function (err) {
                console.log("err " + err);
            });
        }
    };
    Export2Component.prototype.insert = function (str, index, value) {
        return str.substr(0, index) + value + str.substr(index);
    };
    Export2Component.prototype.getChildList = function (listObj) {
        if (listObj && !listObj.list) {
            listObj.list = [];
            classObj.lodingList = 'true';
            this.dataservice.getSalesAttributes(listObj.referenceTo[0]).map(function (res) { return res.json(); }).subscribe(function (res) {
                listObj.list = res;
                listObj.isCollapsed = !listObj.isCollapsed;
                classObj.lodingList = 'false';
            }, function (err) {
                classObj.lodingList = 'false';
                console.log("err " + err);
            });
        }
        else {
            listObj.isCollapsed = !listObj.isCollapsed;
        }
    };
    Export2Component.prototype.salesObjForFilter = function (obj) {
        classObj.salesAttributeForFilter = [];
        classObj.inputFilterValue = '';
        if (obj && obj.list) {
            classObj.salesAttributeForFilter = obj.list;
            classObj.filterBySalesObj = obj.list[0];
        }
        else {
            this.dataservice.getSalesAttributes(obj.referenceTo[0]).map(function (res) { return res.json(); }).subscribe(function (res) {
                obj.list = res;
                classObj.salesAttributeForFilter = obj.list;
                classObj.filterBySalesObj = obj.list[0];
            }, function (err) {
                console.log("err " + err);
            });
        }
    };
    Export2Component.prototype.salesObjForOrder = function (obj) {
        classObj.salesAttributeForOrder = [];
        classObj.orderBySalesAttr = '';
        if (obj && obj.list) {
            classObj.salesAttributeForOrder = obj.list;
        }
        else {
            this.dataservice.getSalesAttributes(obj.referenceTo[0]).map(function (res) { return res.json(); }).subscribe(function (res) {
                obj.list = res;
                classObj.salesAttributeForOrder = obj.list;
            }, function (err) {
                console.log("err " + err);
            });
        }
    };
    Export2Component.prototype.dataQuery = function (value, listObj, position, childPos) {
        var index;
        if (!value.isChecked) {
            if (!this.dataservice.selectedFields) {
                this.dataservice.selectedFields = [];
            }
            if (!this.dataservice.selectedFields[position]) {
                this.dataservice.selectedFields[position] = [];
            }
            if (listObj && listObj.name != classObj.salesobj && !value.modifiedName) {
                value.modifiedName = listObj.name + '.' + value.name;
            }
            value.isChecked = 'true';
            this.dataservice.selectedFields[position][childPos] = value;
        }
        else if (value.isChecked == 'true') {
            value.isChecked = 'false';
        }
        else {
            value.isChecked = 'true';
        }
        this.dataservice.selectedFieldsList = this.getSeletedFields(this.dataservice.selectedFields);
        if (this.dataservice.selectedFields && this.dataservice.selectedFields.length > 0) {
            var tempstr = this.getQueryFieldString(this.dataservice.selectedFields);
            this.query = 'SELECT ' + tempstr + ' FROM' + this.query.split('FROM')[1];
        }
        else {
            this.query = 'SELECT FROM' + this.query.split('FROM')[1];
        }
        classObj.dataservice.exportQuery = this.query;
    };
    Export2Component.prototype.selectAllFields = function (listObj, n) {
        if (!listObj.isChecked) {
            listObj.isChecked = true;
            this.dataservice.selectedFields[n] = [];
            for (var j = 0; j < listObj.list.length; j++) {
                if (listObj.name != classObj.salesobj) {
                    listObj.list[j].modifiedName = listObj.name + '.' + listObj.list[j].name;
                }
                listObj.list[j].isChecked = 'true';
            }
            this.dataservice.selectedFields[n] = listObj.list;
        }
        else {
            listObj.isChecked = false;
            this.dataservice.selectedFields[n] = [];
            for (var j = 0; j < listObj.list.length; j++) {
                listObj.list[j].isChecked = 'false';
            }
        }
        var allFields = this.getQueryFieldString(this.dataservice.selectedFields);
        this.query = 'SELECT ' + allFields + ' FROM' + this.query.split('FROM')[1];
        this.dataservice.selectedFieldsList = this.getSeletedFields(this.dataservice.selectedFields);
        classObj.dataservice.exportQuery = this.query;
    };
    Export2Component.prototype.getSeletedFields = function (fieldArr) {
        var arr = [];
        for (var j = 0; j < fieldArr.length; j++) {
            if (fieldArr[j]) {
                for (var l = 0; l < fieldArr[j].length; l++) {
                    if (fieldArr[j][l] && fieldArr[j][l].isChecked == 'true') {
                        arr.push(fieldArr[j][l]);
                    }
                }
            }
        }
        return arr;
    };
    Export2Component.prototype.getQueryFieldString = function (fieldArr) {
        var arr = [];
        for (var j = 0; j < fieldArr.length; j++) {
            if (fieldArr[j]) {
                for (var l = 0; l < fieldArr[j].length; l++) {
                    if (fieldArr[j][l] && fieldArr[j][l].isChecked == 'true') {
                        if (fieldArr[j][l].modifiedName) {
                            arr.push(fieldArr[j][l].modifiedName);
                        }
                        else {
                            arr.push(fieldArr[j][l].name);
                        }
                    }
                }
            }
        }
        return arr.join(', ');
    };
    Export2Component.prototype.checkFilterValue = function () {
        classObj.isInputDisabled = false;
        if (classObj.selectedFilterObj && classObj.selectedFilterObj.filterName.indexOf('empty') != -1) {
            classObj.inputFilterValue = '';
            classObj.isInputDisabled = true;
        }
    };
    Export2Component.prototype.filterBySalesAttribute = function () {
        classObj.filterOptions = [];
        classObj.inputFilterValue = '';
        for (var i = 0; i < classObj.dataservice.exportFilter.length; i++) {
            if (classObj.dataservice.exportFilter[i].dataType == classObj.filterBySalesObj.type || (classObj.filterBySalesObj.soapType.indexOf(classObj.dataservice.exportFilter[i].dataType) != -1 && classObj.filterBySalesObj.type != 'picklist')) {
                classObj.filterOptions = classObj.dataservice.exportFilter[i].options;
                classObj.selectedFilterObj = classObj.filterOptions[0];
                break;
            }
        }
        if (classObj.filterOptions.length == 0) {
            classObj.filterOptions = classObj.dataservice.exportFilter[2].options;
            classObj.selectedFilterObj = classObj.filterOptions[0];
        }
        this.checkFilterValue();
    };
    Export2Component.prototype.orderBySalesAttribute = function () {
        if (classObj.orderBySalesAttr) {
            var orderBySalesAttr = classObj.orderBySalesAttr.name;
            if (classObj.selectedOrderBySalesObj.name != classObj.salesobj) {
                orderBySalesAttr = classObj.selectedOrderBySalesObj.name + '.' + classObj.orderBySalesAttr.name;
            }
            if (this.query.indexOf('ORDER BY') == -1) {
                this.query = this.query + ' ORDER BY ' + orderBySalesAttr + ' ' + classObj.salesOrderType;
            }
            else {
                this.query = this.query.split(' ORDER BY ')[0] + ' ORDER BY ' + orderBySalesAttr + ' ' + classObj.salesOrderType;
            }
        }
        else {
            this.query = this.query.split(' ORDER BY')[0];
        }
        classObj.dataservice.exportQuery = this.query;
    };
    Export2Component.prototype.createFilterQuery = function () {
        if (classObj.isInputDisabled || this.isValidInput(classObj.inputFilterValue)) {
            var filterExp = classObj.selectedFilterObj.value;
            var filterSalesObj = classObj.filterBySalesObj.name;
            if (classObj.selectedFilterSalesObj.name != classObj.salesobj) {
                filterSalesObj = classObj.selectedFilterSalesObj.name + '.' + classObj.filterBySalesObj.name;
            }
            filterExp = filterExp.replace('fieldName', filterSalesObj);
            var fieldVal = classObj.inputFilterValue;
            if (classObj.filterBySalesObj.type == 'datetime') {
                fieldVal = classObj.inputFilterValue + 'T00:00:00.000Z';
            }
            filterExp = filterExp.replace('fieldValue', fieldVal);
            var filterObj = {
                field: classObj.selectedFilterSalesObj.name,
                name: classObj.filterBySalesObj.label,
                value: classObj.inputFilterValue,
                type: classObj.selectedFilterObj.filterName,
                exp: filterExp
            };
            classObj.dataservice.filterList.push(filterObj);
            this.query = this.gerFilterQueryStr(classObj.dataservice.filterList);
            classObj.inputFilterValue = '';
            classObj.dataservice.exportQuery = this.query;
        }
    };
    Export2Component.prototype.isValidInput = function (input) {
        classObj.filterErrorMsg = "";
        if (!input) {
            classObj.filterErrorMsg = "Filter must have a value";
            return false;
        }
        else if (classObj.filterBySalesObj && classObj.filterBySalesObj.soapType == 'tns:ID' && input.match("^[a-zA-Z0-9]*$")) {
            if (input && (input.length < 15 || input.length > 18 || input.length == 16 || input.length == 17)) {
                classObj.filterErrorMsg = "Alphanumeric, 15 or 18 characters.";
                return false;
            }
        }
        return true;
    };
    Export2Component.prototype.removeFilter = function (index) {
        var exp = classObj.dataservice.filterList[index].exp;
        classObj.dataservice.filterList.splice(index, 1);
        this.query = this.gerFilterQueryStr(classObj.dataservice.filterList);
        classObj.dataservice.exportQuery = this.query;
    };
    Export2Component.prototype.gerFilterQueryStr = function (list) {
        var str = "";
        if (list.length > 0) {
            str = " WHERE " + list[0].exp;
            for (var k = 1; k < list.length; k++) {
                str = str + " AND " + list[k].exp;
            }
        }
        var query = this.query.split('FROM ' + this.dataservice.currentSalesObj)[0] + 'FROM ' + this.dataservice.currentSalesObj + str;
        if (this.query.indexOf('ORDER BY') != -1) {
            var token = this.query.split(' ORDER BY ');
            query = query + ' ORDER BY' + this.query.split(' ORDER BY')[1];
        }
        return query;
    };
    Export2Component.prototype.verifyQuery = function (val) {
        var query = classObj.dataservice.exportQuery;
        classObj.queryVerified = 'start';
        this.dataservice.getRecords({ soql: query }).map(function (res) { return res.json(); }).subscribe(function (res) {
            classObj.queryVerified = 'done';
            classObj.dataservice.exportResultSize = res['totalSize'];
            if (classObj.dataservice.exportResultSize > 0) {
                classObj.dataservice.exportData = res;
                console.log("table data is  " + JSON.stringify(res, null, 2));
                var data = res['records'];
                var fieldStr = classObj.query.split('SELECT')[1];
                fieldStr = fieldStr.split('FROM')[0].trim();
                var fields = fieldStr.split(',');
                var opts = {
                    data: data,
                    fields: fields,
                    quotes: ''
                };
                var csv = json2csv(opts);
                classObj.dataservice.exportCsvData = csv;
            }
            if (val) {
                classObj.dataservice.step = val;
            }
        }, function (err) {
            classObj.queryVerified = 'stop';
            alert(err._body);
        });
    };
    Export2Component.prototype.resetQuery = function () {
        classObj.dataservice.exportQuery = this.query;
    };
    return Export2Component;
}());
Export2Component = __decorate([
    core_1.Component({
        selector: 'export2',
        templateUrl: './app/templates/export2.html'
    }),
    __metadata("design:paramtypes", [router_1.ActivatedRoute, data_service_1.DataService, user_service_1.UserService, router_1.Router])
], Export2Component);
exports.Export2Component = Export2Component;
//# sourceMappingURL=export2.component.js.map