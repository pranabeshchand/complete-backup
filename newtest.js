/**
 * Created by aasheesh on 16/5/17.
 */
var salesRelationData = [
    {
        "TestImport__c": {
            "testimport__r": [
                {
                    "username__c": "ashish",
                    "lastname__c": "abareja@gmail.com"
                },
                {
                    "username__c": "arawat",
                    "lastname__c": "arawat@gmail.com"
                }
            ]
        },
        "AnotherImport__c": {
            "anotherimport__r": [
                {
                    "first_name__c": "himanshu",
                    "last_name__c": "aggarwal"
                },
                {
                    "first_name__c": "sourabh",
                    "last_name__c": "goyal"
                }
            ]
        }
    }
]
var config = {
    recordBatchSize: 1,
    primitiveTypes: ["Decimal","Double","Integer","Long"]
}

var __ = require('underscore');
var _ = require('lodash');

var StandardSalesForceFields = ["Id", "OwnerId", "IsDeleted", "CreatedById", "CreatedDate", "LastModifiedById", "LastModifiedDate", "SystemModstamp"];
var fields = [
    {
        "autoNumber": false,
        "byteLength": 18,
        "calculated": false,
        "calculatedFormula": null,
        "cascadeDelete": false,
        "caseSensitive": false,
        "controllerName": null,
        "createable": false,
        "custom": false,
        "defaultValue": null,
        "defaultValueFormula": null,
        "defaultedOnCreate": true,
        "dependentPicklist": false,
        "deprecatedAndHidden": false,
        "digits": 0,
        "displayLocationInDecimal": false,
        "externalId": false,
        "filterable": true,
        "groupable": true,
        "htmlFormatted": false,
        "idLookup": true,
        "inlineHelpText": null,
        "label": "Record ID",
        "length": 18,
        "name": "Id",
        "nameField": false,
        "namePointing": false,
        "nillable": false,
        "permissionable": false,
        "picklistValues": [],
        "precision": 0,
        "referenceTo": [],
        "relationshipName": null,
        "relationshipOrder": null,
        "restrictedDelete": false,
        "restrictedPicklist": false,
        "scale": 0,
        "soapType": "tns:ID",
        "sortable": true,
        "type": "id",
        "unique": false,
        "updateable": false,
        "writeRequiresMasterRead": false
    },
    {
        "autoNumber": false,
        "byteLength": 18,
        "calculated": false,
        "calculatedFormula": null,
        "cascadeDelete": false,
        "caseSensitive": false,
        "controllerName": null,
        "createable": true,
        "custom": false,
        "defaultValue": null,
        "defaultValueFormula": null,
        "defaultedOnCreate": true,
        "dependentPicklist": false,
        "deprecatedAndHidden": false,
        "digits": 0,
        "displayLocationInDecimal": false,
        "externalId": false,
        "filterable": true,
        "groupable": true,
        "htmlFormatted": false,
        "idLookup": false,
        "inlineHelpText": null,
        "label": "Owner ID",
        "length": 18,
        "name": "OwnerId",
        "nameField": false,
        "namePointing": true,
        "nillable": false,
        "permissionable": false,
        "picklistValues": [],
        "precision": 0,
        "referenceTo": [
            "Group",
            "User"
        ],
        "relationshipName": "Owner",
        "relationshipOrder": null,
        "restrictedDelete": false,
        "restrictedPicklist": false,
        "scale": 0,
        "soapType": "tns:ID",
        "sortable": true,
        "type": "reference",
        "unique": false,
        "updateable": true,
        "writeRequiresMasterRead": false
    },
    {
        "autoNumber": false,
        "byteLength": 0,
        "calculated": false,
        "calculatedFormula": null,
        "cascadeDelete": false,
        "caseSensitive": false,
        "controllerName": null,
        "createable": false,
        "custom": false,
        "defaultValue": null,
        "defaultValueFormula": null,
        "defaultedOnCreate": true,
        "dependentPicklist": false,
        "deprecatedAndHidden": false,
        "digits": 0,
        "displayLocationInDecimal": false,
        "externalId": false,
        "filterable": true,
        "groupable": true,
        "htmlFormatted": false,
        "idLookup": false,
        "inlineHelpText": null,
        "label": "Deleted",
        "length": 0,
        "name": "IsDeleted",
        "nameField": false,
        "namePointing": false,
        "nillable": false,
        "permissionable": false,
        "picklistValues": [],
        "precision": 0,
        "referenceTo": [],
        "relationshipName": null,
        "relationshipOrder": null,
        "restrictedDelete": false,
        "restrictedPicklist": false,
        "scale": 0,
        "soapType": "xsd:boolean",
        "sortable": true,
        "type": "boolean",
        "unique": false,
        "updateable": false,
        "writeRequiresMasterRead": false
    },
    {
        "autoNumber": false,
        "byteLength": 240,
        "calculated": false,
        "calculatedFormula": null,
        "cascadeDelete": false,
        "caseSensitive": false,
        "controllerName": null,
        "createable": true,
        "custom": false,
        "defaultValue": null,
        "defaultValueFormula": null,
        "defaultedOnCreate": true,
        "dependentPicklist": false,
        "deprecatedAndHidden": false,
        "digits": 0,
        "displayLocationInDecimal": false,
        "externalId": false,
        "filterable": true,
        "groupable": true,
        "htmlFormatted": false,
        "idLookup": true,
        "inlineHelpText": null,
        "label": "TestImport Name",
        "length": 80,
        "name": "Name",
        "nameField": true,
        "namePointing": false,
        "nillable": true,
        "permissionable": false,
        "picklistValues": [],
        "precision": 0,
        "referenceTo": [],
        "relationshipName": null,
        "relationshipOrder": null,
        "restrictedDelete": false,
        "restrictedPicklist": false,
        "scale": 0,
        "soapType": "xsd:string",
        "sortable": true,
        "type": "string",
        "unique": false,
        "updateable": true,
        "writeRequiresMasterRead": false
    },
    {
        "autoNumber": false,
        "byteLength": 0,
        "calculated": false,
        "calculatedFormula": null,
        "cascadeDelete": false,
        "caseSensitive": false,
        "controllerName": null,
        "createable": false,
        "custom": false,
        "defaultValue": null,
        "defaultValueFormula": null,
        "defaultedOnCreate": true,
        "dependentPicklist": false,
        "deprecatedAndHidden": false,
        "digits": 0,
        "displayLocationInDecimal": false,
        "externalId": false,
        "filterable": true,
        "groupable": false,
        "htmlFormatted": false,
        "idLookup": false,
        "inlineHelpText": null,
        "label": "Created Date",
        "length": 0,
        "name": "CreatedDate",
        "nameField": false,
        "namePointing": false,
        "nillable": false,
        "permissionable": false,
        "picklistValues": [],
        "precision": 0,
        "referenceTo": [],
        "relationshipName": null,
        "relationshipOrder": null,
        "restrictedDelete": false,
        "restrictedPicklist": false,
        "scale": 0,
        "soapType": "xsd:dateTime",
        "sortable": true,
        "type": "datetime",
        "unique": false,
        "updateable": false,
        "writeRequiresMasterRead": false
    },
    {
        "autoNumber": false,
        "byteLength": 18,
        "calculated": false,
        "calculatedFormula": null,
        "cascadeDelete": false,
        "caseSensitive": false,
        "controllerName": null,
        "createable": false,
        "custom": false,
        "defaultValue": null,
        "defaultValueFormula": null,
        "defaultedOnCreate": true,
        "dependentPicklist": false,
        "deprecatedAndHidden": false,
        "digits": 0,
        "displayLocationInDecimal": false,
        "externalId": false,
        "filterable": true,
        "groupable": true,
        "htmlFormatted": false,
        "idLookup": false,
        "inlineHelpText": null,
        "label": "Created By ID",
        "length": 18,
        "name": "CreatedById",
        "nameField": false,
        "namePointing": false,
        "nillable": false,
        "permissionable": false,
        "picklistValues": [],
        "precision": 0,
        "referenceTo": [
            "User"
        ],
        "relationshipName": "CreatedBy",
        "relationshipOrder": null,
        "restrictedDelete": false,
        "restrictedPicklist": false,
        "scale": 0,
        "soapType": "tns:ID",
        "sortable": true,
        "type": "reference",
        "unique": false,
        "updateable": false,
        "writeRequiresMasterRead": false
    },
    {
        "autoNumber": false,
        "byteLength": 0,
        "calculated": false,
        "calculatedFormula": null,
        "cascadeDelete": false,
        "caseSensitive": false,
        "controllerName": null,
        "createable": false,
        "custom": false,
        "defaultValue": null,
        "defaultValueFormula": null,
        "defaultedOnCreate": true,
        "dependentPicklist": false,
        "deprecatedAndHidden": false,
        "digits": 0,
        "displayLocationInDecimal": false,
        "externalId": false,
        "filterable": true,
        "groupable": false,
        "htmlFormatted": false,
        "idLookup": false,
        "inlineHelpText": null,
        "label": "Last Modified Date",
        "length": 0,
        "name": "LastModifiedDate",
        "nameField": false,
        "namePointing": false,
        "nillable": false,
        "permissionable": false,
        "picklistValues": [],
        "precision": 0,
        "referenceTo": [],
        "relationshipName": null,
        "relationshipOrder": null,
        "restrictedDelete": false,
        "restrictedPicklist": false,
        "scale": 0,
        "soapType": "xsd:dateTime",
        "sortable": true,
        "type": "datetime",
        "unique": false,
        "updateable": false,
        "writeRequiresMasterRead": false
    },
    {
        "autoNumber": false,
        "byteLength": 18,
        "calculated": false,
        "calculatedFormula": null,
        "cascadeDelete": false,
        "caseSensitive": false,
        "controllerName": null,
        "createable": false,
        "custom": false,
        "defaultValue": null,
        "defaultValueFormula": null,
        "defaultedOnCreate": true,
        "dependentPicklist": false,
        "deprecatedAndHidden": false,
        "digits": 0,
        "displayLocationInDecimal": false,
        "externalId": false,
        "filterable": true,
        "groupable": true,
        "htmlFormatted": false,
        "idLookup": false,
        "inlineHelpText": null,
        "label": "Last Modified By ID",
        "length": 18,
        "name": "LastModifiedById",
        "nameField": false,
        "namePointing": false,
        "nillable": false,
        "permissionable": false,
        "picklistValues": [],
        "precision": 0,
        "referenceTo": [
            "User"
        ],
        "relationshipName": "LastModifiedBy",
        "relationshipOrder": null,
        "restrictedDelete": false,
        "restrictedPicklist": false,
        "scale": 0,
        "soapType": "tns:ID",
        "sortable": true,
        "type": "reference",
        "unique": false,
        "updateable": false,
        "writeRequiresMasterRead": false
    },
    {
        "autoNumber": false,
        "byteLength": 0,
        "calculated": false,
        "calculatedFormula": null,
        "cascadeDelete": false,
        "caseSensitive": false,
        "controllerName": null,
        "createable": false,
        "custom": false,
        "defaultValue": null,
        "defaultValueFormula": null,
        "defaultedOnCreate": true,
        "dependentPicklist": false,
        "deprecatedAndHidden": false,
        "digits": 0,
        "displayLocationInDecimal": false,
        "externalId": false,
        "filterable": true,
        "groupable": false,
        "htmlFormatted": false,
        "idLookup": false,
        "inlineHelpText": null,
        "label": "System Modstamp",
        "length": 0,
        "name": "SystemModstamp",
        "nameField": false,
        "namePointing": false,
        "nillable": false,
        "permissionable": false,
        "picklistValues": [],
        "precision": 0,
        "referenceTo": [],
        "relationshipName": null,
        "relationshipOrder": null,
        "restrictedDelete": false,
        "restrictedPicklist": false,
        "scale": 0,
        "soapType": "xsd:dateTime",
        "sortable": true,
        "type": "datetime",
        "unique": false,
        "updateable": false,
        "writeRequiresMasterRead": false
    },
    {
        "autoNumber": false,
        "byteLength": 90,
        "calculated": false,
        "calculatedFormula": null,
        "cascadeDelete": false,
        "caseSensitive": false,
        "controllerName": null,
        "createable": true,
        "custom": true,
        "defaultValue": null,
        "defaultValueFormula": null,
        "defaultedOnCreate": false,
        "dependentPicklist": false,
        "deprecatedAndHidden": false,
        "digits": 0,
        "displayLocationInDecimal": false,
        "externalId": true,
        "filterable": true,
        "groupable": true,
        "htmlFormatted": false,
        "idLookup": true,
        "inlineHelpText": null,
        "label": "username",
        "length": 30,
        "name": "username__c",
        "nameField": false,
        "namePointing": false,
        "nillable": false,
        "permissionable": false,
        "picklistValues": [],
        "precision": 0,
        "referenceTo": [],
        "relationshipName": null,
        "relationshipOrder": null,
        "restrictedDelete": false,
        "restrictedPicklist": false,
        "scale": 0,
        "soapType": "xsd:string",
        "sortable": true,
        "type": "string",
        "unique": false,
        "updateable": true,
        "writeRequiresMasterRead": false
    },
    {
        "autoNumber": false,
        "byteLength": 90,
        "calculated": false,
        "calculatedFormula": null,
        "cascadeDelete": false,
        "caseSensitive": false,
        "controllerName": null,
        "createable": true,
        "custom": true,
        "defaultValue": null,
        "defaultValueFormula": null,
        "defaultedOnCreate": false,
        "dependentPicklist": false,
        "deprecatedAndHidden": false,
        "digits": 0,
        "displayLocationInDecimal": false,
        "externalId": false,
        "filterable": true,
        "groupable": true,
        "htmlFormatted": false,
        "idLookup": false,
        "inlineHelpText": null,
        "label": "lastname",
        "length": 30,
        "name": "lastname__c",
        "nameField": false,
        "namePointing": false,
        "nillable": true,
        "permissionable": true,
        "picklistValues": [],
        "precision": 0,
        "referenceTo": [],
        "relationshipName": null,
        "relationshipOrder": null,
        "restrictedDelete": false,
        "restrictedPicklist": false,
        "scale": 0,
        "soapType": "xsd:string",
        "sortable": true,
        "type": "string",
        "unique": false,
        "updateable": true,
        "writeRequiresMasterRead": false
    }
]
var requiredSalesAttributes = [];
for (var j = 0; j < fields.length; j++) {
    if (fields[j].nillable == false && StandardSalesForceFields.indexOf(fields[j].name) == -1) {
        requiredSalesAttributes.push(fields[j].name);
    }
}
console.log("required sales attribute " + requiredSalesAttributes);

var RelationNames = [];
var validRecords = [];
var invalidRecords = [];

for (var relatedObjName in salesRelationData[0]) {
    console.log("***************************************");
    var relationName = Object.keys(salesRelationData[0][relatedObjName])[0];
    RelationNames.push(relationName.replace('__r', '__c'));
    var dataArray = salesRelationData[0][relatedObjName][relationName];
    //var fields = yield salesObjectAttributes(userId,relatedObjName);
    //fs.writeFileSync('fields.json', JSON.stringify(fields,null,2));
    var currentIndex = 0;
   /* for (var j = 0; j < fields.length; j++) {
        if (fields[j].nillable == false && StandardSalesForceFields.indexOf(fields[j].name) == -1) {
            requiredSalesAttributes.push(fields[j].name);
        }
    }*/
    console.log("required sales attribute " + requiredSalesAttributes);
    while (currentIndex < dataArray.length) {
        console.log("current index is " + currentIndex);
        validRecords = [];
        for (var k = currentIndex; k < dataArray.length && validRecords.length < config.recordBatchSize; k++) {
            var result = validateRecord(dataArray[k], fields, requiredSalesAttributes);
            console.log("validation result is " + JSON.stringify(result, null, 2));
            if (result.valid) {
                validRecords.push({index: k, records: result.record});
                //validRecords.push({ records: result.record});
            } else {
                invalidRecords.push({ records: result.record});
            }
            currentIndex = k+1;
        }
        try {
            if(validRecords.length > 0) {
                console.log("valid records for insertion " + JSON.stringify(validRecords.records, null, 2))
               // var relatedData = yield insertIntoRelatedObjects(relatedObjName, validRecords.records);
                console.log("relatedData is " + relatedData);
            }

        } catch (e) {
            console.log("relatedData exception is " + e);
        }
    }
}


function validateRecord(record, fields, requiredSalesAttributes) {
    try {
        var result = {valid: true};
        var missingFields = [];
        var error = {}
        var keys = Object.keys(record);
        for (var j = 0; j < requiredSalesAttributes.length; j++) {
            if (keys.indexOf(requiredSalesAttributes[j]) == -1) {
                missingFields.push(requiredSalesAttributes[j]);
            }
        }
        if (missingFields.length > 0) {
            result.valid = false;
            // record.error =  {RequiredField: 'Required Fields are missing ' + missingFields }
            error['RequiredField'] = 'Required Fields are missing ' + missingFields
        }
        var primitiveTypes = config.primitiveTypes;
        for (var i = 0; i < keys.length; i++) {
            var obj = {}
            var recordValue = record[keys[i]];
            var field = _.find(fields, {name: keys[i]})

            if (primitiveTypes.indexOf(field.type)!= -1) {
                if (!__.isNumber(recordValue)) {
                    result.valid = false;
                    obj[keys[i]] = "Field type mismatch, expected " + field.type
                    error['type'] = obj;

                }
            }

        }
        record.error = error;
        result.record = record;
        return result;

    } catch(e) {
        console.log("err in validateRecord " + e);
    }

}