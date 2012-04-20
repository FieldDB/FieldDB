var DataList = DataList || {};

DataList.render = function(divid){
    var d = document.getElementById(divid);
    if(!d){
        return;
    }
    d.innerHTML  ="hi";
};

