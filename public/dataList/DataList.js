var DataList = DataList || {};

DataList.render = function(divid){
    var d = document.getElementById(divid);
    if(!d){
        return;
    }
    var t = document.createElement("table");

    for (var i = 0; i<15; i++){
        if(i%2==0){
            t.innerHTML+= "<tr><td class='even'><p>"+i+"This is the orthography,this is the text, this is the date</p></td></tr>";

        }else{
            t.innerHTML+= "<tr><td class='odd'><p>"+i+"This is the orthography, this is the text, this is the date</p></td></tr>";

        }
    }
    d.appendChild(t);
    console.log(d.innerHTML);
};

