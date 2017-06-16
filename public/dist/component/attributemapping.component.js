"use strict";
/**
 * Created by aasheesh on 2/3/17.
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
var user_service_1 = require("../services/user.service");
var data_service_1 = require("../services/data.service");
var jsep = require("jsep");
var stringjs = require("stringjs");
var classObj;
var AttributeMappingComponent = (function () {
    function AttributeMappingComponent(route, dataservice, userservice, router) {
        this.route = route;
        this.dataservice = dataservice;
        this.userservice = userservice;
        this.router = router;
        console.log("route is " + route);
        classObj = this;
        this.salesAttribute = [];
        this.clientAttribute = [];
        this.sales = [];
        this.isReturnTypeSelected = false;
        this.transformCategory = {};
        this.formula = [''];
        this.selectedSalesObj = [];
        this.records = [];
        this.showheader = false;
        this.choice = -1;
        this.xpathexpression = '';
        this.requiredSalesAttributes = [];
        this.showalert = false;
    }
    AttributeMappingComponent.prototype.ngOnInit = function () {
        console.log("this is demo...............");
        this.dataservice.getFormulaJson().map(function (res) { return res.json(); }).subscribe(function (data) {
            classObj.formula = data;
        }, function (err) { return console.log(err); });
        //classObj.salesobj = 'Account';
        //this.salesobj = 'Account';
        console.log('the PC object is:--- ' + this.dataservice.currentSalesObj);
        this.salesobj = this.dataservice.currentSalesObj;
        if (classObj.dataservice.taskexport) {
            classObj.salesAttribute = this.dataservice.selectedFieldsList;
            classObj.selectedFieldsArr = [];
            for (var m = 0; m < classObj.salesAttribute.length; m++) {
                if (classObj.salesAttribute[m].modifiedName) {
                    classObj.selectedFieldsArr.push(classObj.salesAttribute[m].modifiedName);
                }
                else {
                    classObj.selectedFieldsArr.push(classObj.salesAttribute[m].name);
                }
            }
            if (this.salesobj && this.userservice.UserDetails && this.userservice.UserDetails.mappings) {
                var mappings = [];
                mappings = this.userservice.UserDetails.mappings.export ? this.userservice.UserDetails.mappings.export : [];
                mappings.forEach(function (item) {
                    var keys = Object.keys(item.mapping.attributes);
                    var attributes = [];
                    for (var l = 0; l < keys.length; l++) {
                        attributes.push(item.mapping.attributes[keys[l]].salesAttribute);
                    }
                    if (item.mapping.object == classObj.salesobj && JSON.stringify(attributes) == JSON.stringify(classObj.selectedFieldsArr)) {
                        classObj.records.push(item);
                    }
                });
            }
            this.setSalesAttribute();
            // console.log("clientAttribs " + classObj.clientAttribute);
            // console.log("in export " + JSON.stringify(classObj.salesAttribute,null,2));
        }
        else {
            if (this.salesobj && this.userservice.UserDetails && this.userservice.UserDetails.mappings) {
                var mappings = [];
                mappings = this.userservice.UserDetails.mappings.import ? this.userservice.UserDetails.mappings.import : [];
                mappings.forEach(function (item) {
                    if (item.mapping.object == classObj.salesobj) {
                        classObj.records.push(item);
                    }
                });
            }
            this.dataservice.getSalesAttributes(this.salesobj).map(function (res) { return res.json(); }).subscribe(function (res) {
                classObj.salesAttribute = res;
                var salesArr = [{ name: classObj.salesobj, list: res }];
                if (res && res.length > 0) {
                    for (var j = 0; j < res.length; j++) {
                        if (res[j].type == 'reference' && res[j].relationshipName) {
                            var obj = {
                                name: res[j].relationshipName,
                                referenceTo: res[j].referenceTo
                            };
                            salesArr.push(obj);
                        }
                        else if (res[j].nillable == false) {
                            classObj.requiredSalesAttributes.push(res[j].name);
                            console.log("required fields are " + classObj.requiredSalesAttributes);
                        }
                    }
                }
                classObj.salesListObjArray = salesArr;
                classObj.salesListObjArray.forEach(function (obj) {
                    if (obj.referenceTo && !obj.list) {
                        classObj.dataservice.getSalesAttributes(obj.referenceTo[0]).map(function (res) { return res.json(); }).subscribe(function (res) {
                            obj['list'] = res;
                            console.log("edited task id is " + classObj.dataservice.tid);
                            //console.log("client attrib before list " + JSON.stringify(classObj.clientAttribute,null,2));
                            for (var n = 0; n < classObj.clientAttribute.length; n++) {
                                if (obj.name == classObj.clientAttribute[n].referenceObj) {
                                    //alert('from ***********');
                                    classObj.clientAttribute[n].list = obj.list;
                                    classObj.clientAttribute[n].referenceTo = obj.referenceTo[0];
                                    //console.log("client attrib after list " + JSON.stringify(classObj.clientAttribute[n],null,2));
                                }
                            }
                        }, function (err) {
                            console.log("err " + err);
                        });
                    }
                });
                classObj.setClientAttribute();
                classObj.addToSelectSalesObj(null, null, classObj.clientAttribute.length);
            }, function (err) {
                console.log("err " + err);
            });
        }
    };
    AttributeMappingComponent.prototype.setClientAttribute = function () {
        this.clientAttribute = [];
        var header = this.dataservice.csvHeader;
        for (var n = 0; n < header.length; n++) {
            var attrObj = {};
            attrObj['csvAttribute'] = header[n].trim();
            var position = this.salesAttribute.findIndex(function (i) { return i.name.toLowerCase() === header[n].trim().toLowerCase(); });
            if (position != -1) {
                attrObj['salesAttribute'] = this.salesAttribute[position].name;
                var expressionValue = {};
                expressionValue['clientattribute'] = header[n].trim();
                attrObj['expressionValue'] = expressionValue;
                classObj.mappingModified = true;
            }
            else {
                attrObj['salesAttribute'] = "";
            }
            if (header[n].indexOf('.') != -1) {
                attrObj['referenceObj'] = header[n].split('.')[0].trim();
                for (var m = 0; m < classObj.salesListObjArray.length; m++) {
                    if (classObj.salesListObjArray[m].name == attrObj['referenceObj']) {
                        //alert('from setclientattribute');
                        attrObj['list'] = classObj.salesListObjArray[m].list;
                        break;
                    }
                }
                attrObj['referenceAttribute'] = header[n].split('.')[1];
            }
            this.clientAttribute.push(attrObj);
        }
    };
    AttributeMappingComponent.prototype.setSalesAttribute = function () {
        classObj.salesAttribute = [];
        var header = classObj.selectedFieldsArr;
        for (var n = 0; n < header.length; n++) {
            var attrObj = {};
            attrObj['salesAttribute'] = header[n];
            attrObj['clientAttribute'] = header[n];
            var expressionValue = {};
            expressionValue['salesAttribute'] = header[n];
            attrObj['expressionValue'] = expressionValue;
            this.salesAttribute.push(attrObj);
        }
        this.saveNewMapping();
        classObj.mappingModified = true;
    };
    AttributeMappingComponent.prototype.startMapping = function (index) {
        this.mappingObj = {};
        classObj.mappingModified = false;
        if (!classObj.dataservice.taskexport) {
            this.setClientAttribute();
        }
        else {
            this.setSalesAttribute();
        }
        if (index) {
            this.mappingObj = this.records[index];
            var attributes = this.records[index].mapping.attributes;
            for (var k in attributes) {
                if (attributes[k].clientattribute) {
                    var clientAttr = attributes[k].clientattribute;
                    for (var h = 0; h < this.clientAttribute.length; h++) {
                        if (clientAttr == this.clientAttribute[h]['csvAttribute']) {
                            this.clientAttribute[h]['salesAttribute'] = k.replace('$', '.');
                            this.clientAttribute[h]['expressionValue'] = attributes[k];
                            break;
                        }
                    }
                }
                if (attributes[k].salesAttribute) {
                    var salesAttr = attributes[k].salesAttribute;
                    for (var h = 0; h < this.salesAttribute.length; h++) {
                        if (salesAttr == this.salesAttribute[h]['salesAttribute']) {
                            this.salesAttribute[h]['clientAttribute'] = k.replace('$', '.');
                            this.salesAttribute[h]['expressionValue'] = attributes[k];
                            break;
                        }
                    }
                }
            }
        }
    };
    AttributeMappingComponent.prototype.generateAttributeList = function (clientObj) {
        for (var m = 0; m < classObj.salesListObjArray.length; m++) {
            if (classObj.salesListObjArray[m].name == clientObj['referenceObj']) {
                clientObj['list'] = classObj.salesListObjArray[m].list;
                clientObj['referenceTo'] = classObj.salesListObjArray[m].referenceTo[0];
                break;
            }
        }
    };
    AttributeMappingComponent.prototype.formatName = function (index) {
        var total = this.salesAttribute.length;
        for (var i = 0; i < total; i++) {
            if (index == 1) {
                this.salesAttribute[i]['clientAttribute'] = stringjs(this.salesAttribute[i]['clientAttribute']).camelize().s;
            }
            else if (index == 2) {
                if (this.salesAttribute[i]['clientAttribute'].indexOf(".") != -1) {
                    var attr = this.salesAttribute[i]['clientAttribute'].split(".");
                    this.salesAttribute[i]['clientAttribute'] = attr[0] + '.' + stringjs(attr[1]).dasherize().chompLeft('-').chompRight('-').s;
                }
                else {
                    this.salesAttribute[i]['clientAttribute'] = stringjs(this.salesAttribute[i]['clientAttribute']).dasherize().chompLeft('-').chompRight('-').s;
                }
            }
            else if (index == 3) {
                if (this.salesAttribute[i]['clientAttribute'].indexOf(".") != -1) {
                    var attr = this.salesAttribute[i]['clientAttribute'].split(".");
                    this.salesAttribute[i]['clientAttribute'] = attr[0] + '.' + stringjs(attr[1]).underscore().chompLeft('_').chompRight('_').s;
                }
                else {
                    this.salesAttribute[i]['clientAttribute'] = stringjs(this.salesAttribute[i]['clientAttribute']).underscore().chompLeft('_').chompRight('_').s;
                }
            }
        }
        this.saveNewMapping();
    };
    AttributeMappingComponent.prototype.updateMapping = function (mappingName) {
        var obj = {
            name: mappingName,
            mapping: {
                object: this.salesobj,
                attributes: {}
            }
        };
        obj = this.setMappingObject(obj);
        this.dataservice.currentMappingObj = obj;
        if (!classObj.dataservice.taskexport) {
            classObj.dataservice.step++;
        }
    };
    AttributeMappingComponent.prototype.saveNewMapping = function () {
        classObj.showalert = false;
        var obj = {
            mapping: {
                object: this.salesobj,
                attributes: {}
            }
        };
        obj = this.setMappingObject(obj);
        var systemreq_field = ['Id', 'IsDeleted', 'CreatedById', 'CreatedDate', 'LastModifiedDate', 'SystemModstamp', 'LastModifiedById'];
        Array.prototype.remove = function (value) {
            var idx = this.indexOf(value);
            if (idx != -1) {
                return this.splice(idx, 1); // The second parameter is the number of elements to remove.
            }
            return false;
        };
        //console.log("Required mapping:--  "+classObj.requiredSalesAttributes);
        for (var i = 0; i < systemreq_field.length; i++) {
            classObj.requiredSalesAttributes.remove(systemreq_field[i]);
        }
        // console.log("mapping... obj"+JSON.stringify(obj.mapping.attributes));
        //console.log("filter Required mapping:--  "+classObj.requiredSalesAttributes);
        var sales = [];
        for (var key in obj.mapping.attributes) {
            sales.push(key);
        }
        for (var i = 0; i < classObj.requiredSalesAttributes.length; i++) {
            if (sales.indexOf(classObj.requiredSalesAttributes[i]) == -1) {
                classObj.showalert = true;
                break;
            }
        }
        this.dataservice.currentMappingObj = obj;
        if (!classObj.dataservice.taskexport && !classObj.showalert) {
            document.getElementById('continue').style.display = "block";
            jQuery('.modal-backdrop.in').css('display', 'block');
            jQuery("#continue").attr("style", "display:block");
            classObj.dataservice.step++;
        }
        else {
            alert('Invalid Attribut Selection');
            document.getElementById('continue').style.display = "none";
            jQuery('.modal-backdrop.in').css('display', 'none');
            setTimeout(function () {
                document.getElementById('continue').style.display = "none";
            });
            setTimeout(function () {
                jQuery('.modal-backdrop.in').css('display', 'none');
            });
        }
    };
    /*  mappingobjectCheck(){
  
          classObj.showalert = false;
          var obj = {
              mapping: {
                  object: this.salesobj,
                  attributes: {}
              }
          }
  
          obj = this.setMappingObject(obj);
          var systemreq_field = ['Id','IsDeleted','CreatedById','CreatedDate','LastModifiedDate','SystemModstamp','LastModifiedById']
  
          Array.prototype.remove = function(value) {
              var idx = this.indexOf(value);
              if (idx != -1) {
                  return this.splice(idx, 1); // The second parameter is the number of elements to remove.
              }
              return false;
          }
  
  
          console.log("Required mapping:--  "+classObj.requiredSalesAttributes);
  
          for(var i = 0; i < systemreq_field.length; i++){
              classObj.requiredSalesAttributes.remove(systemreq_field[i]);
          }
          console.log("mapping... obj"+JSON.stringify(obj.mapping.attributes));
          console.log("filter Required mapping:--  "+classObj.requiredSalesAttributes);
          var sales = [];
          for(var key in obj.mapping.attributes) {
              sales.push(key);
          }
          for(var i=0; i<classObj.requiredSalesAttributes.length; i++) {
              if(sales.indexOf(classObj.requiredSalesAttributes[i]) == -1) {
                  classObj.showalert = true;
                  break;
              }
          }
          this.dataservice.currentMappingObj = obj;
          if(!classObj.dataservice.taskexport && !classObj.showalert) {
              jQuery("#continue").attr("style","display:block");
              setTimeout(function(){
               jQuery('.modal-backdrop.in').css('visibility','none');
               });
               jQuery('#continue').css('visibility','none');
               setTimeout(function(){
               jQuery('#continue').css('visibility','none');
               //document.getElementById('continue').style.visibility = "none";
               });
              classObj.dataservice.step++;
  
          } else {
              alert('error');
             setTimeout(function(){
                   document.getElementById('continue').style.display = "none";
              });
              setTimeout(function(){
                  jQuery('.modal-backdrop.in').css('display','none');
               });
              /!* setTimeout(function(){
                  document.getElementById('errorModal').style.display = "block";
              });
              setTimeout(function(){
                  jQuery('.modal-backdrop.in').css('display','block');
              });*!/
  
  
           }
          //jQuery('#continue').css('display','block');
      }*/
    AttributeMappingComponent.prototype.setMappingObject = function (obj) {
        if (!classObj.dataservice.taskexport) {
            for (var i = 0; i < this.clientAttribute.length; i++) {
                if (this.clientAttribute[i] && this.clientAttribute[i]['expressionValue']) {
                    var val = this.clientAttribute[i]['expressionValue'];
                    if (this.clientAttribute[i].referenceTo) {
                        val.referenceTo = this.clientAttribute[i].referenceTo;
                    }
                    // obj.mapping['attributes'][this.clientAttribute[i]['salesAttribute'].replace('.', '$')] = val;
                    obj.mapping['attributes'][this.clientAttribute[i]['salesAttribute']] = val;
                }
            }
            return obj;
        }
        else {
            for (var i = 0; i < this.salesAttribute.length; i++) {
                if (this.salesAttribute[i] && this.salesAttribute[i]['expressionValue']) {
                    // obj.mapping['attributes'][this.salesAttribute[i]['clientAttribute'].replace('.', '$')] = this.salesAttribute[i]['expressionValue'];
                    obj.mapping['attributes'][this.salesAttribute[i]['clientAttribute']] = this.salesAttribute[i]['expressionValue'];
                }
            }
            return obj;
        }
    };
    AttributeMappingComponent.prototype.transformAttribute = function (mappingObj, index) {
        var attrType;
        console.log("mapping obj **" + JSON.stringify(mappingObj, null, 2));
        classObj.message = '';
        classObj.errormessage = '';
        this.transformCategory = {};
        /*var name = mappingObj.salesAttribute;*/
        //console.log("salesattribute are * " + JSON.stringify(this.salesAttribute,null,2));
        if (mappingObj.referenceObj) {
            var name = mappingObj.referenceAttribute;
            for (var j = 0; j < mappingObj.list.length; j++) {
                if (mappingObj.list[j].name == name) {
                    attrType = mappingObj.list[j].type;
                    break;
                }
            }
        }
        else {
            var name = mappingObj.salesAttribute;
            for (var j = 0; j < this.salesAttribute.length; j++) {
                if (this.salesAttribute[j].name == name) {
                    attrType = this.salesAttribute[j].type;
                    break;
                }
            }
        }
        for (var i = 0; i < this.formula[0].categories.length; i++) {
            if (this.formula[0].categories[i].type == attrType) {
                this.transformCategory = Object.create(this.formula[0].categories[i]);
                break;
            }
        }
        if (!this.transformCategory['name']) {
            this.transformCategory = Object.create(this.formula[0].categories[2]);
        }
        this.transformCategory['index'] = index;
        if (!classObj.dataservice.taskexport) {
            this.transformCategory['clientAtr'] = mappingObj.csvAttribute;
        }
        else {
            this.transformCategory['salesAtr'] = mappingObj.salesAttribute;
        }
        this.isReturnTypeSelected = true;
        // console.log("transform category " + JSON.stringify(this.transformCategory,null,2));
        var textAreaEle = document.getElementById('expression');
        if (textAreaEle && mappingObj.expressionValue && mappingObj.expressionValue.displayexpression) {
            var text = 'field:';
            textAreaEle.value = mappingObj.expressionValue.displayexpression.replace(new RegExp(text, 'g'), '');
        }
        else {
            textAreaEle.value = '';
        }
    };
    AttributeMappingComponent.prototype.changeTransformCategory = function (event, index, attr) {
        this.transformCategory = {};
        if (event) {
            for (var i = 0; i < this.formula[0].categories.length; i++) {
                if (this.formula[0].categories[i].name == event) {
                    this.transformCategory = Object.create(this.formula[0].categories[i]);
                    break;
                }
            }
        }
        this.transformCategory['index'] = index;
        this.transformCategory['clientAtr'] = attr;
    };
    AttributeMappingComponent.prototype.addFunctionExpression = function (event, index, attr) {
        var textAreaEle = document.getElementById('expression');
        if (event && (event.displayExpression || event.target.value)) {
            var exp = event.displayExpression || event.target.value;
            typeInTextarea(textAreaEle, exp);
            textAreaEle.value = textAreaEle.value.replace(/expression|text|number|logical|value|duration/g, attr);
            this.validateSyntex(textAreaEle.value);
        }
        function typeInTextarea(el, newText) {
            var start = el.selectionStart;
            var end = el.selectionEnd;
            var text = el.value;
            var before = text.substring(0, start);
            var after = text.substring(end, text.length);
            el.value = (before + newText + after);
            el.selectionStart = el.selectionEnd = start + newText.length;
            el.focus();
        }
    };
    AttributeMappingComponent.prototype.addToSelectSalesObj = function (mappingObj, position, length) {
        classObj.mappingModified = true;
        if (length) {
            for (var i = 0; i < length; i++) {
                if (this.clientAttribute[i].salesAttribute || this.clientAttribute[i].referenceAttribute) {
                    var expressionValue = {};
                    expressionValue['clientattribute'] = this.clientAttribute[i].csvAttribute;
                    if (this.clientAttribute[i].referenceAttribute) {
                        this.clientAttribute[i].salesAttribute = this.clientAttribute[i].referenceObj + '.' + this.clientAttribute[i].referenceAttribute;
                    }
                    this.clientAttribute[i]['expressionValue'] = expressionValue;
                }
                else if (this.clientAttribute[i]['expressionValue']) {
                    delete this.clientAttribute[i]['expressionValue'];
                }
            }
        }
        else {
            if (mappingObj.salesAttribute || mappingObj.referenceAttribute) {
                var expressionValue = {};
                expressionValue['clientattribute'] = mappingObj.csvAttribute;
                if (mappingObj.referenceAttribute) {
                    mappingObj.salesAttribute = mappingObj.referenceObj + '.' + mappingObj.referenceAttribute;
                }
                this.clientAttribute[position]['expressionValue'] = expressionValue;
            }
            else if (this.clientAttribute[position]['expressionValue']) {
                delete this.clientAttribute[position]['expressionValue'];
            }
        }
    };
    AttributeMappingComponent.prototype.initializeFields = function (list, obj, i) {
        console.log("initializeFields called..................");
        if (list.name == obj.referenceAttribute) {
            this.addToSelectSalesObj(obj, i);
            return true;
        }
        else {
            return false;
        }
    };
    AttributeMappingComponent.prototype.submitExpression = function (index) {
        var textAreaEle = document.getElementById('expression');
        if (textAreaEle.value) {
            if (!classObj.dataservice.taskexport) {
                var attr = this.clientAttribute[index]['csvAttribute'];
                // this.clientAttribute[index]['expressionValue'].xpath = "//" + textAreaEle.value.toLowerCase();
                this.clientAttribute[index]['expressionValue'].xpath = "//" + this.xpathexpression;
                this.clientAttribute[index]['expressionValue'].displayexpression = textAreaEle.value.replace(new RegExp(attr, 'g'), 'field:' + attr);
            }
            else {
                var attr = this.salesAttribute[index]['salesAttribute'];
                //  this.salesAttribute[index]['expressionValue'].xpath =  "//" + textAreaEle.value.toLowerCase();
                this.salesAttribute[index]['expressionValue'].xpath = "//" + this.xpathexpression;
                this.salesAttribute[index]['expressionValue'].displayexpression = textAreaEle.value.replace(new RegExp(attr, 'g'), 'field:' + attr);
                this.saveNewMapping();
            }
        }
        this.isReturnTypeSelected = false;
        classObj.mappingModified = true;
    };
    AttributeMappingComponent.prototype.checkSyntex = function (exp, originalexp) {
        if (exp.type == "CallExpression") {
            var fun = [];
            for (var jj = 0; jj < classObj.formula[0].categories.length; jj++) {
                fun = fun.concat(classObj.formula[0].categories[jj].options);
            }
            var arr = [];
            fun.forEach(function (item) {
                arr.push(item.expressionValue);
            });
            if (arr.indexOf(exp.callee.name) == -1) {
                return '"' + exp.callee.name + '"  is not valid function';
            }
            else if (exp.arguments) {
                var fn = originalexp.replace(exp.callee.name, exp.callee.name.toLowerCase());
                console.log("fn is " + fn);
                this.xpathexpression = fn;
                for (var i = 0; i < exp.arguments.length; i++) {
                    var msg = this.checkSyntex(exp.arguments[i], originalexp);
                    if (msg) {
                        return msg;
                    }
                }
            }
        }
        else if (exp.type == "Identifier") {
            if (!classObj.dataservice.taskexport) {
                if (classObj.dataservice.csvHeader.indexOf(exp.name) == -1) {
                    return '"' + exp.name + '"  is not valid Attribute';
                }
            }
            else {
                var index = this.salesAttribute.findIndex(function (i) { return i.salesAttribute === exp.name; });
                if (index == -1) {
                    return '"' + exp.name + '"  is not valid Attribute';
                }
            }
        }
        else if (exp.type == "Compound") {
            var body = exp.body;
            if (body && body.length > 0) {
                for (var i = 0; i < body.length; i++) {
                    var msg = this.checkSyntex(body[i], originalexp);
                    if (msg) {
                        return msg;
                    }
                }
            }
        }
    };
    AttributeMappingComponent.prototype.validateSyntex = function (input) {
        input = input.trim();
        if (input) {
            try {
                var parse_exp = jsep(input);
                var notvalid = this.checkSyntex(parse_exp, input);
                if (!notvalid) {
                    classObj.message = "Valid Expression";
                    classObj.errormessage = '';
                }
                else {
                    classObj.message = "";
                    classObj.errormessage = notvalid;
                }
            }
            catch (exp) {
                classObj.errormessage = exp.message;
            }
        }
        else {
            classObj.message = '';
            classObj.errormessage = '';
        }
    };
    AttributeMappingComponent.prototype.displayExpression = function (exp) {
        var text = 'field:';
        return exp.replace(new RegExp(text, 'g'), '');
    };
    AttributeMappingComponent.prototype.isAlreadySelected = function (salesAttribute) {
        for (var h = 0; h < this.clientAttribute.length; h++) {
            if (salesAttribute == this.clientAttribute[h]['salesAttribute']) {
                return true;
            }
        }
        return false;
    };
    return AttributeMappingComponent;
}());
AttributeMappingComponent = __decorate([
    core_1.Component({
        selector: 'attribmapping',
        templateUrl: './app/templates/attributemapping.html'
    }),
    __metadata("design:paramtypes", [router_1.ActivatedRoute, data_service_1.DataService, user_service_1.UserService, router_1.Router])
], AttributeMappingComponent);
exports.AttributeMappingComponent = AttributeMappingComponent;
//# sourceMappingURL=attributemapping.component.js.map