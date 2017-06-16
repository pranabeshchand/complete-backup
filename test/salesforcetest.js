var sf = require('./../lib/salesforce');

config = {
    "loginUrl": "https://login.salesforce.com",
    "user": "hackthisfastagain@gmail.com",
    "password": "Angularjs@2x29CYJ09nU4dnjwCyPGeI7XE"
}

sf.init(config,function(res){
    console.log('inside..');
    sf.getSObejctTypes(function(res) {
        console.log(res);
        fetchAttributes(sf, 'Account')
    },function(err) {
        console.log(err)
    })
})

function fetchAttributes(sf,object) {
    console.log('inside..');
    sf.getSObjectAttribs(object,function(res){
        console.log(res);
    },function(err){
        console.log(err)
    })

}


