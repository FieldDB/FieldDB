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

    d.innerHTML  ="<div id = 'wrapperL'>"
    +"		<div id ='drop'>"
        +"		<h3>Drop Audio Here!</h3>"
        +"		</div>"
    +""
    +"		<div id= 'leftArrow'><img src='./../datum/arrowL.png'  /></div>"
    +"	</div>"
        +""
        +"	<div id = 'wrapperR'>	"
        +"			<div  id= 'rightArrow'><img src='./../datum/arrowR.png'  /></div>"
        +""
        +""
        +"			<div id = 'latex'>"
        +"			<a href='#' class='classname'>LaTeX it!</a>"
        +"			</div>"
        +"	</div>"
      +"<iframe src='https://docs.google.com/spreadsheet/embeddedform?formkey=dEVnZG9fRDBzQWVkRXFPeTI1MENkTHc6MQ'width='710' height='500'></iframe>";
};

//TODO

/*
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

}*/
