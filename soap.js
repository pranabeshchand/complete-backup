
var token = '00D28000001EkAz!AQwAQISibw86VNiswFMRqLbKZ8xLgEM2eZkeO3_8qYnhx9QeG6cGqcVbQ7dQbwMq_GyB7xFnO6wQhw4z8hORihbqo2Uh.MXY';
var sobject = 'Account';
var prop = ['Name']
var data =     '<urn:create>' +

 '<urn:sObjects xsi:type="urn1:'+ sobject +'">' +

 '<Name>Test11 Soap</Name>'  +
 '<Email__c> testsoap11@mail.co</Email__c>' +



 '</urn:create>'


var arr = [
    {
        Name: 'aasheesh',
        Email__c: 'ass@gmail.com'
    },
    {
        Name: 'ankit',
        Email__c: 'avjh@gmail.com'
    }
]

var records = [];
for (var i = 0; i < arr.length; i++) {
    var startTag = '<urn:sObjects xsi:type="urn1:'+ sobject +'">'
    var endTag = '</urn:sObjects>'
    var str = '';
    for (var key in arr[i]) {
        str = str + '<' + key + '>' + arr[i][key] + '</' + key + '>'

        //records.push('<' + key + '>' + arr[i][key] + '</' + key + '>');
    }
    records.push(startTag + str + endTag);

}

//console.log(str.join(''));


var body = ['<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:enterprise.soap.sforce.com" xmlns:urn1="urn:sobject.enterprise.soap.sforce.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',

    '<soapenv:Header>',

    '<urn:SessionHeader>',

    '<urn:sessionId>' + token + '</urn:sessionId>',

    '</urn:SessionHeader>',

    '</soapenv:Header>',

    '<soapenv:Body>',
    '<urn:create>',

    records.join('    '),
    '</urn:create>',

    '<urn:create>',

    '</urn:create>',

    '</soapenv:Body>',

    '</soapenv:Envelope>',

].join(' ');


console.log(body);








var parseString = require('xml2js').parseString;
var xml;

var fs = require('fs');
fs.readFile('data.xml', function(err,data) {
    parseString(data, function (err, result) {
        console.log(JSON.stringify(result['soapenv:Envelope']['soapenv:Body'][0]['createResponse'][0].result,null,2));
    });
})
