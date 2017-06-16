/*
/!**
 * Created by aasheesh on 16/5/17.
 *!/

for (var relatedObjName in salesRelationData[0]) {
    var relationName = Object.keys(salesRelationData[0][relatedObjName])[0];
    RelationNames.push(relationName.replace('__r', '__c'));
    var dataArray = salesRelationData[0][relatedObjName][relationName];
    var currentSalesObject = sobjects.indexOf(relatedObjName);
    var fields = fieldArray[currentSalesObject]

    for (var j = 0; j < fields.length; j++) {
        if (fields[j].nillable == false && StandardSalesForceFields.indexOf(fields[j].name) == -1) {
            requiredSalesAttributes.push(fields[i].name);
        }
    }
    for(var i=0; i<dataArray.length; i++) {
        var missingFields = [];
        var keys = Object.keys(dataArray[i]);
        var data = dataArray[i];
        for(var j=0; j<requiredSalesAttributes[j]; j++) {
            if(keys.indexOf(requiredSalesAttributes[j]) == -1) {
                missingFields.push(requiredSalesAttributes[j]);
            }
        }
        var keyprop;
        var ob = {};
        var keyvalue;
        for(var key in data) {
            ob['name'] = key;
            keyprop = _.find(fields, ob);
            type = keyprop.type;
            keyvalue = data[key];

        }
    }
    promises.push(insertIntoRelatedObjects(relatedObjName, salesRelationData[0][relatedObjName][relationName]));
}
*/


.on('end', function (data) {
    console.log("salesdata is " + JSON.stringify(salesdata, null, 2));
    console.log("salesRelationData is " + JSON.stringify(salesRelationData, null, 2));

    co(function* () {
        try {
            var promises = [];
            var RelationNames = [];
            var RelatedObject = [];
            var requiredSalesAttributes = []
            var StandardSalesForceFields = config.StandardSalesForceFields;

            var validRecords = [];
            var invalidRecords = [];

            for (var relatedObjName in salesRelationData[0]) {
                var relationName = Object.keys(salesRelationData[0][relatedObjName])[0];
                RelationNames.push(relationName.replace('__r', '__c'));
                var dataArray = salesRelationData[0][relatedObjName][relationName];
                var fields = yield salesObjectAttributes(userId,relatedObjName);
                var currentIndex = 0;
                for (var j = 0; j < fields.length; j++) {
                    if (fields[j].nillable == false && StandardSalesForceFields.indexOf(fields[j].name) == -1) {
                        requiredSalesAttributes.push(fields[j].name);
                    }
                }
                while (currentIndex < dataArray.length) {
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
                        currentIndex = k;
                    }
                    try {
                        console.log("valid records for insertion " + JSON.stringify(validRecords.records, null, 2))
                        var relatedData = yield insertIntoRelatedObjects(relatedObjName, validRecords.records);
                        console.log("relatedData is " + relatedData);
                    } catch (e) {
                        console.log("relatedData exception is " + e);
                    }
                }
            }

            function dataForTargetObject(data, relation) {
                for (var m = 0; m < data.length; m++) {
                    if (data[m].success) {
                        salesdata[m][relation] = data[m].id;
                    }
                }
            }

            function insertIntoRelatedObjects(sfobj, data) {
                console.log("obj in insertIntoRelatedObjects " + sfobj);
                console.log(("data in insertIntoRelatedObjects " + JSON.stringify(data, null, 2)))

                connection.sobject(sfobj).create(data, function (err, ret) {
                    if (err) {
                        console.log("err is " + err);
                        defer.reject(err);
                    } else {
                        console.log("in " + sfobj + " inserted " + JSON.stringify(ret, null, 2));
                        defer.resolve(ret);
                    }
                });
                return defer.promise;
            }
        } catch (e) {
            console.log("exception overall " + e);
        }

    })


});
