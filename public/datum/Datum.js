/**
 * Created with JetBrains WebStorm.
 * User: mdotedot
 * Date: 12-04-20
 * Time: 1:26 PM
 * To change this template use File | Settings | File Templates.
 */

var Datum = Datum || {};

Datum.render = function(divid){
    var d = document.getElementById(divid);
    if(!d){
        return;
    }
    d.innerHTML  ='<iframe src="https://docs.google.com/spreadsheet/embeddedform?formkey=dEVnZG9fRDBzQWVkRXFPeTI1MENkTHc6MQ" width="1030" height="937" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>';
};

//TODO

Datum.update = function(){

};

Datum.create = function(){

};

Datum.delete = function(){

};

Datum.laTeXiT = function(){

};

Datum.addAudio= function(){

};

Datum.export= function(){

};

Datum.sync = function(){

}