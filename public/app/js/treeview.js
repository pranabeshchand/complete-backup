/**
 * Created by aasheesh on 11/1/17.
 */

/*!function ($) {

    // Le left-menu sign
    /!* for older jquery version
     $('#left ul.nav li.parent > a > span.sign').click(function () {
     $(this).find('i:first').toggleClass("icon-minus");
     }); *!/

    $(document).on("click","#left ul.nav li.parent > a > span.sign", function(){
        $(this).find('i:first').toggleClass("icon-minus");
    });

    // Open Le current menu
    $("#left ul.nav li.parent.active > a > span.sign").find('i:first').addClass("icon-minus");
    $("#left ul.nav li.current").parents('ul.children').addClass("in");

}(window.jQuery);*/
var showmappingobj = [];
var mappingobj= {
    "Member" : [
        "AcceptedEventRelation",
        "Account",
        "AccountCleanInfo"
    ],
    "NewUser" : [
        "AccountShare",
        "ActivityHistory",
        "AdditionalNumber",
        "ApexClass"
    ]
};


/*for(var key in mappingobj) {
    var obj = {};
    var val = '';
    console.log("called " + mappingobj[key])
    for(var i=0; i<mappingobj[key].length; i++) {
        console.log("called")
        val = val + mappingobj[key][i] +', ';
        obj[key] = val;
    }
    showmappingobj.push(obj)
}
console.log("show is " + JSON.stringify(showmappingobj,null,2));*/


var s = ['A','B'];
console.log(s.indexOf('A'));