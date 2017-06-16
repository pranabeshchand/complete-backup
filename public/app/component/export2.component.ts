import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { DataService } from '../services/data.service';
import * as json2csv from "json2csv";

let classObj:any
@Component({
    selector: 'export2',
    templateUrl: './app/templates/export2.html'

})

export class Export2Component implements OnInit, OnDestroy {
    salesobj:string;
    query: string;
    step:number;
    salesAttribute: any;

    constructor(private route:ActivatedRoute, private dataservice:DataService, private userservice:UserService, private router:Router) {
        console.log("export2 called......");
        classObj = this;
        this.query = '';
        this.step = 1;
    }

    ngOnInit() {
        this.salesobj = this.dataservice.currentSalesObj;
        classObj.salesOrderType = 'Asc';
        classObj.orderBySalesAttr = '';
        classObj.filterBySalesObj = '';
        if(!classObj.dataservice.exportFilter) {
            this.dataservice.getFiltersJson().map(res => res.json()).subscribe(data => {
                classObj.dataservice.exportFilter =  data;
            }, err => console.log(err));
        }

        if(classObj.dataservice.salesListObjArray) {
            classObj.salesListObjArray = classObj.dataservice.salesListObjArray;
            classObj.selectedOrderBySalesObj = classObj.selectedFilterSalesObj = classObj.dataservice.salesListObjArray[0];
            classObj.salesAttributeForOrder = classObj.salesAttributeForFilter = classObj.dataservice.salesListObjArray[0].list;
            classObj.filterBySalesObj = classObj.dataservice.salesListObjArray[0].list[0];
            classObj.filterBySalesAttribute();
            classObj.query = classObj.dataservice.exportQuery;
        } else {
            this.dataservice.getSalesAttributes(this.salesobj).map(res=> res.json()).subscribe(function (res) {
                var salesArr = [{name: classObj.salesobj, list: res, isCollapsed: true}];
                if(res && res.length > 0) {
                    for(var j=0; j < res.length; j++) {
                        if(res[j].type == 'reference' && res[j].relationshipName) {
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
                classObj.dataservice.exportQuery = classObj.query = 'SELECT FROM '+ classObj.salesobj;
            },
            err=> {
                console.log("err " + err);
            });
        }
    }

    insert(str, index, value) {
        return str.substr(0, index) + value + str.substr(index);
    }

    getChildList(listObj) {
        if(listObj && !listObj.list) {
            listObj.list = [];
            classObj.lodingList = 'true';
            this.dataservice.getSalesAttributes(listObj.referenceTo[0]).map(res=> res.json()).subscribe(function (res) {
                    listObj.list = res;
                    listObj.isCollapsed = !listObj.isCollapsed;
                    classObj.lodingList = 'false';
            },
            err=> {
                classObj.lodingList = 'false';
                console.log("err " + err);
            });
        } else {
            listObj.isCollapsed = !listObj.isCollapsed;
        }
    }

    salesObjForFilter(obj) {
        classObj.salesAttributeForFilter = [];
        classObj.inputFilterValue = '';
        if(obj && obj.list) {
            classObj.salesAttributeForFilter = obj.list;
            classObj.filterBySalesObj = obj.list[0];
        } else {
            this.dataservice.getSalesAttributes(obj.referenceTo[0]).map(res=> res.json()).subscribe(function (res) {
                    obj.list = res;
                    classObj.salesAttributeForFilter = obj.list;
                    classObj.filterBySalesObj = obj.list[0];
            },
            err=> {
                console.log("err " + err);
            });
        }
    }

    salesObjForOrder(obj) {
        classObj.salesAttributeForOrder = [];
        classObj.orderBySalesAttr = ''
        if(obj && obj.list) {
            classObj.salesAttributeForOrder = obj.list;
        } else {
            this.dataservice.getSalesAttributes(obj.referenceTo[0]).map(res=> res.json()).subscribe(function (res) {
                    obj.list = res;
                    classObj.salesAttributeForOrder = obj.list;
            },
            err=> {
                console.log("err " + err);
            });
        }
    }

    dataQuery(value, listObj, position, childPos) {
        var index;
        if(!value.isChecked) {
            if(!this.dataservice.selectedFields) {
                this.dataservice.selectedFields = [];
            }
            if(!this.dataservice.selectedFields[position]) {
                this.dataservice.selectedFields[position] = [];
            }
            if(listObj && listObj.name != classObj.salesobj && !value.modifiedName){
                value.modifiedName = listObj.name + '.' + value.name;
            }
            value.isChecked = 'true';
            this.dataservice.selectedFields[position][childPos] = value;
        } else if(value.isChecked == 'true') {
            value.isChecked = 'false';
        } else {
            value.isChecked = 'true';
        }
        this.dataservice.selectedFieldsList = this.getSeletedFields(this.dataservice.selectedFields);
        if(this.dataservice.selectedFields && this.dataservice.selectedFields.length > 0) {
            var tempstr = this.getQueryFieldString(this.dataservice.selectedFields);
            this.query = 'SELECT ' + tempstr + ' FROM' + this.query.split('FROM')[1];
        }
        else {
            this.query = 'SELECT FROM' + this.query.split('FROM')[1];
        }
        classObj.dataservice.exportQuery = this.query;
    }

    selectAllFields(listObj, n) {
        if(!listObj.isChecked) {
            listObj.isChecked = true;
            this.dataservice.selectedFields[n] = [];
            for(let j=0; j < listObj.list.length; j++) {
                if(listObj.name != classObj.salesobj){
                    listObj.list[j].modifiedName = listObj.name + '.' + listObj.list[j].name;
                }
                listObj.list[j].isChecked = 'true';
            }
            this.dataservice.selectedFields[n] = listObj.list;
        } else {
            listObj.isChecked = false;
            this.dataservice.selectedFields[n] = [];
            for(let j=0; j < listObj.list.length; j++) {
                listObj.list[j].isChecked = 'false';
            }
        }
        var allFields = this.getQueryFieldString(this.dataservice.selectedFields);
        this.query = 'SELECT ' + allFields + ' FROM' + this.query.split('FROM')[1];
        this.dataservice.selectedFieldsList = this.getSeletedFields(this.dataservice.selectedFields);
        classObj.dataservice.exportQuery = this.query;
    }

    getSeletedFields(fieldArr) {
        var arr = [];
        for(var j=0; j < fieldArr.length; j++) {
            if(fieldArr[j]) {
                for(var l=0; l < fieldArr[j].length; l++) {
                    if(fieldArr[j][l] && fieldArr[j][l].isChecked == 'true') {
                       arr.push(fieldArr[j][l]);
                    }
                }
            }
        }
        return arr;
    }

    getQueryFieldString(fieldArr) {
        var arr = [];
        for(var j=0; j < fieldArr.length; j++) {
            if(fieldArr[j]) {
                for(var l=0; l < fieldArr[j].length; l++) {
                    if(fieldArr[j][l] && fieldArr[j][l].isChecked == 'true') {
                        if(fieldArr[j][l].modifiedName) {
                            arr.push(fieldArr[j][l].modifiedName);
                        } else {
                            arr.push(fieldArr[j][l].name);
                        }
                    }
                }
            }
        }
        return arr.join(', ');
    }

    checkFilterValue() {
        classObj.isInputDisabled = false;
        if(classObj.selectedFilterObj && classObj.selectedFilterObj.filterName.indexOf('empty') != -1) {
            classObj.inputFilterValue = '';
            classObj.isInputDisabled = true;
        }
    }

    filterBySalesAttribute() {
        classObj.filterOptions = [];
        classObj.inputFilterValue = '';
        for(var i=0; i < classObj.dataservice.exportFilter.length; i++) {
            if(classObj.dataservice.exportFilter[i].dataType == classObj.filterBySalesObj.type || (classObj.filterBySalesObj.soapType.indexOf(classObj.dataservice.exportFilter[i].dataType) != -1 && classObj.filterBySalesObj.type != 'picklist')) {
                classObj.filterOptions = classObj.dataservice.exportFilter[i].options;
                classObj.selectedFilterObj = classObj.filterOptions[0];
                break;
            }
        }
        if(classObj.filterOptions.length == 0) {
            classObj.filterOptions = classObj.dataservice.exportFilter[2].options;
            classObj.selectedFilterObj = classObj.filterOptions[0];
        }
        this.checkFilterValue();
    }

    orderBySalesAttribute() {
        if(classObj.orderBySalesAttr) {
            var orderBySalesAttr = classObj.orderBySalesAttr.name;
            if(classObj.selectedOrderBySalesObj.name != classObj.salesobj) {
                orderBySalesAttr = classObj.selectedOrderBySalesObj.name + '.' + classObj.orderBySalesAttr.name;
            }
            if(this.query.indexOf('ORDER BY') == -1) {
                this.query = this.query + ' ORDER BY ' + orderBySalesAttr + ' ' + classObj.salesOrderType;
            } else {
                this.query = this.query.split(' ORDER BY ')[0] + ' ORDER BY ' + orderBySalesAttr + ' ' + classObj.salesOrderType;
            }
        } else {
            this.query = this.query.split(' ORDER BY')[0];
        }

        classObj.dataservice.exportQuery = this.query;
    }

    createFilterQuery() {
        if(classObj.isInputDisabled  || this.isValidInput(classObj.inputFilterValue)) {
            var filterExp = classObj.selectedFilterObj.value;
            var filterSalesObj = classObj.filterBySalesObj.name;
            if(classObj.selectedFilterSalesObj.name != classObj.salesobj) {
                filterSalesObj = classObj.selectedFilterSalesObj.name + '.' + classObj.filterBySalesObj.name;
            }
            filterExp = filterExp.replace('fieldName', filterSalesObj);
            var fieldVal = classObj.inputFilterValue;
            if(classObj.filterBySalesObj.type == 'datetime') {
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

    }

    isValidInput(input) {
        classObj.filterErrorMsg = "";
        if(!input) {
            classObj.filterErrorMsg = "Filter must have a value";
            return false;
        } else if(classObj.filterBySalesObj && classObj.filterBySalesObj.soapType == 'tns:ID' && input.match("^[a-zA-Z0-9]*$")) {
            if(input && (input.length < 15 || input.length > 18 || input.length == 16 || input.length == 17)) {
                classObj.filterErrorMsg = "Alphanumeric, 15 or 18 characters.";
                return false;
            }
        }
        return true;
    }

    removeFilter(index) {
        var exp = classObj.dataservice.filterList[index].exp;
        classObj.dataservice.filterList.splice(index, 1);
        this.query = this.gerFilterQueryStr(classObj.dataservice.filterList);
        classObj.dataservice.exportQuery = this.query;
    }

    gerFilterQueryStr(list) {
        var str = "";
        if(list.length > 0) {
            str = " WHERE " + list[0].exp;
            for(var k=1; k < list.length; k++) {
                str = str + " AND " + list[k].exp;
            }
        }
        var query = this.query.split('FROM '+this.dataservice.currentSalesObj)[0] + 'FROM ' + this.dataservice.currentSalesObj + str;
        if(this.query.indexOf('ORDER BY') != -1) {
            var token = this.query.split(' ORDER BY ');
            query = query + ' ORDER BY' + this.query.split(' ORDER BY')[1];
        }
        return query;
    }

    verifyQuery(val) {
        var query = classObj.dataservice.exportQuery;
        classObj.queryVerified = 'start';
        this.dataservice.getRecords({soql: query}).map(res=> res.json()).subscribe(function (res) {
            classObj.queryVerified = 'done';
            classObj.dataservice.exportResultSize = res['totalSize'];
            if(classObj.dataservice.exportResultSize > 0) {
                classObj.dataservice.exportData = res;
                console.log("table data is  " + JSON.stringify(res, null, 2));
                var data = res['records'];
                var fieldStr = classObj.query.split('SELECT')[1];
                fieldStr = fieldStr.split('FROM')[0].trim();
                var fields = fieldStr.split(',')
                var opts = {
                    data: data,
                    fields: fields,
                    quotes: ''
                };
                var csv = json2csv(opts);
                classObj.dataservice.exportCsvData = csv;
            }
            if(val) {
                classObj.dataservice.step = val;
            }
        },
        err=> {
            classObj.queryVerified = 'stop';
            alert(err._body);
        });
    }

    resetQuery() {
        classObj.dataservice.exportQuery = this.query;
    }

    /*selectField(str,field) {
       this.dataservice.selectedFields.push(field);
        this.insert(str, 7, ' ' + value + '');

    }*/

    /*dataQuery(str, value) {

        var tempstr = '';
        if (str.indexOf(value) == -1) {
            var index = str.indexOf('FROM');
            console.log("index is " + index);
            if (index == 7) {
                tempstr = this.insert(str, index - 1, ' ' + value + '');
            } else {
                tempstr = this.insert(str, index - 1, ',' + value + '');
            }

        } else {
            var index = str.indexOf(value);

            if (str.indexOf(',' + value) > -1) {
                tempstr = str.replace(',' + value, '');
            }
            if (str.indexOf(value + ',') > -1) {
                tempstr = str.replace(value + ',', '');
            }
            if (str.indexOf(',' + value) == -1 && str.indexOf(value + ',') == -1) {
                tempstr = str.replace(value, '');
            }

        }
        console.log(tempstr);
        this.query = tempstr;
        //return tempstr;
    }*/


}
