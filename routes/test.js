/**
 * Created by root on 2/5/17.
 */
var obj = {

        "import": [
            {
                "name": "gvtrgt",
                "updatedat": "Tue, 02 May 2017 11:00:01 GMT",
                "fileName": "file-1493722742891",
                "mapping": {
                    "object": "Account",
                    "attributes": {
                        "Name": {
                            "clientattribute": "Name"
                        },
                        "Email__c": {
                            "clientattribute": "Email"
                        },
                        "RecordType$DeveloperName": {
                            "clientattribute": "RecordType.DeveloperName",
                            "xpath": "//uppercase(RecordType.DeveloperName)",
                            "displayexpression": "UPPERCASE(field:RecordType.DeveloperName)"
                        }
                    }
                }
            }
        ]

}

function processCSV(obj, connection) {
    var fs = require('fs');
    var CsvReader = require('csv-reader');
    var jsonparser = require('jsonparsertool/lib');
    var csvtojson = require('csvtojson')
    var jsondata = [];
    var csvkeys = [];
    var inputStream = fs.createReadStream(__dirname + '/' + obj.import[obj.import.length - 1].fileName, 'utf8');
    var count = 1;
    var salesFields = [];
    var salesdata = [];
    var newArr = [];
    var newArr2 = [];
    var jsondata2 = [];


    // var attributeobj = mapping.import[0].mapping.attributes;
    var attributeobj = obj.import[obj.import.length - 1].mapping.attributes;
    console.log("attributeobj is " + JSON.stringify(attributeobj, null, 2));

    salesFields = Object.keys(attributeobj);
    console.log("salesfields are " + salesFields);

    inputStream
        .pipe(CsvReader({parseNumbers: true, parseBooleans: true, trim: true}))
        .on('data', function (row) {

            if (count == 1) {
                console.log("rowsss:- "+typeof row);
                console.log("***************************************** ");
                console.log("json:- "+JSON.stringify(row));
                console.log("*********************************");

                for(var i = 0; i < row.length; i++) {
                    if(row[i].indexOf('.') == -1) {
                        newArr2.push(row[i]);
                    }else{
                        newArr.push(row[i]);
                    }
                }
                keys = newArr2;
                keyy =newArr;
                count++;
                console.log('else keys...:- '+newArr);
            } else {
                jsondata = [];
                console.log('if keys...:- '+keys);
                var length = keys.length;
                var obj = {};
                for (var i = 0; i < length; i++) {
                    obj[keys[i]] = row[i];
                }
                jsondata.push(obj);
                console.log("jsondata is " + JSON.stringify(jsondata, null, 2))
                var sobj = {}
                for (var key in attributeobj) {

                    //salesFields.push(key);
                    console.log("key is " + key);
                    val = jsonparser.evaluate(jsondata, attributeobj[key].xpath, false, true);
                    // sobj[key] = "nbjbkjbkb";
                    if (val) {
                        sobj[key] = val[0];
                    }

                }
                console.log("obj is " + JSON.stringify(sobj, null, 2));
                salesdata.push(sobj);
                /*======== Master Records start=============*/
                jsondata2 = [];
                console.log('if keys for mapped ...:- '+keyy);
                var length = keyy.length;
                var obj2 = {};
                for (var i = 0; i < length; i++) {
                    //if(keyy[i] == row[i]){
                    obj2[keyy[i]] = row[i];
                    //}

                }
                jsondata2.push(obj2);
                console.log("jsondatas is " + JSON.stringify(jsondata2, null, 2));

                var sobj2 = {}
                for(var key in attributeobj) {
                    if(keyy.indexOf(key)) {
                        if(attributeobj[key].xpath) {
                            val = jsonparser.evaluate(jsondata2, attributeobj[key].xpath, false, true);
                            if (val) {
                                sobj2[key] = val[0];
                            }
                        } else {
                            sobj2[key] = jsondata2[0][attributeobj[key].clientattribute];

                        }


                    }
                    jsondata2.push(obj2);
                }
                console.log("attribute objectsss:- "+JSON.stringify(jsondata2));
                /* for (var key in attributeobj) {

                 //salesFields.push(key);
                 console.log("key1 is.... " + key);
                 val = jsonparser.evaluate(jsondata2, attributeobj[key].xpath, false, true);
                 // sobj[key] = "nbjbkjbkb";
                 if (val) {
                 sobj2[key] = val[0];
                 }

                 }*/
                console.log("obj is " + JSON.stringify(sobj2, null, 2));
                jsondata2.push(sobj2);
                console.log('jsondata2 is .....:- '+jsondata2);
                /*
                 console.log('if keys...:- '+keyy);
                 var length = row.length;
                 var obj2 = {};
                 for (var i = 0; i < length; i++) {
                 obj2[keyy[i]] = row[i];
                 }
                 jsondata2.push(obj2);
                 console.log("jsondata is " + JSON.stringify(jsondata2, null, 2))
                 var sobj2 = {}
                 for (var key in attributeobj) {

                 //salesFields.push(key);
                 console.log("key1 is " + key);
                 val = jsonparser.evaluate(jsondata2, attributeobj[key].xpath, false, true);
                 // sobj[key] = "nbjbkjbkb";
                 if (val) {
                 sobj2[key] = val[0];
                 }

                 }
                 console.log("obj is " + JSON.stringify(sobj2, null, 2));
                 jsondata2.push(sobj2);
                 console.log('jsondata2 is .....:- '+jsondata2);*/
                /*======== Master Records end=============*/
            }

        })
        .on('end', function (data) {
            console.log("salesdata is " + JSON.stringify(salesdata, null, 2));
            console.log("target sales obj is " + obj.import[obj.import.length - 1].mapping.object);

            /*var data = {
             Name: 'testingimport',
             Email__c: 'testing@gmail.com'
             }*/
            /*connection.sobject(obj.import[obj.import.length - 1].mapping.object).create(salesdata, function (err, ret) {
                console.log('Records return:- '+err);
                if (err || !ret.success) {
                    console.error("return value:- " + JSON.stringify(ret));
                    console.log(ret.length);
                    if (ret.length != 0) {
                        var mapArr = [];
                        for (var i = 0; i < ret.length; i++) {
                            if(ret[i].success == true)
                            {
                                console.log(ret[i]);
                                mapArr.push(ret[i].id);
                                console.log(ret[i].id);
                                console.log(ret[i].success);
                                console.log('else keys...:- '+newArr);
                            }

                        }
                        console.log("idsss :=  .. "+mapArr);
                    }

                } else {
                    console.log('Upserted Successfully')
                    //res.status(200).send({status: true, user: req.session.userId});
                }

                // ...
            });*/

        });

}


processCSV(obj);