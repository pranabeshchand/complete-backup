var request = require('request');
var fs = require('fs');
var CsvReader = require('csv-reader');
const URL = require('url').URL;


request.get('http://localhost:3000/routes/testrelation.csv').on('response', function(response) {
    response.on('data', function(chunk) {
      //console.log("chunk " + JSON.stringify(chunk,null,2));
        var inputStream = fs.createReadStream(chunk)
        inputStream.pipe(CsvReader({parseNumbers: true, parseBooleans: true, trim: true}))
            .on('data', function (row) {
                console.log("row.....................................................")
            })
            .on('end', function (data) {
                console.log("finished.........................................");
            })
     // console.log("chunk " + JSON.parse(chunk).data.length);
    })
    response.on('end', function() {
        console.log('finished');
    })
})


/*var inputStream = fs.createReadStream(new URL("http://localhost:3000/routes/testrelation.csv"), 'utf8');
inputStream
    .pipe(CsvReader({parseNumbers: true, parseBooleans: true, trim: true}))
    .on('data', function (row) {
       console.log("row")
    })
    .on('end', function (data) {
       console.log("finished");
    })*/
