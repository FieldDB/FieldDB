var renderNavigation = function(divid){
    var h = document.getElementById(divid);
    if(!h){
        return;
    }
    h.innerHTML  =
"  <ul class='menu'>"
 +"<h1>Drag and Drop Field Linguistics</h1>"


  +"<h2>Field Linguistic Tool for Offline and Online Elicitation and Data Entry in HTML5 </h2>"
+"  <li><a href=#>New</a>"
+"    <ul>"
+"      <li><a href=/session/session.html >Session</a></li>"
+"      <li><a href=./datum.html >Datum</a></li>"
+"   <li><a href=./datum.html >User</a></li>"
+"   <li><a href=./datum.html >Team</a></li>"
+"   <li><a href=./datum.html >Informant</a></li>"




    +"    </ul>"
+"  </li>"
+"  <li><a href=#>Views</a>"
+""
+"    <ul>"
+"      <li><a href=./allEntries.html >Datum View </a></li>"
+"      <li><a href=./allEntries.html >List View</a></li>"
+"      <li><a href=./datum.html >News Feed</a></li>"
+"      <li><a href=./datum.html >Adv. Search</a></li>"
+"      <li><a href=./datum.html >User</a></li>"



    +"    </ul>"
+""
+"  </li>"
+"  <li><a href=./search.html>Import</a></li>"

+"  <li><a href=./export.html>Export</a>"
+""
+"    <ul>"
+"      <li><a href=./export.html >CSV</a></li>"
+"      <li><a href=./export.html >Wiki</a></li>"
+"      <li><a href=./Latex.html >Latex</a></li>"
+""
+"    </ul>"
+""
+"  </li>"
+"  <li><a href=./sync.html>Sync</a></li>"
+"  <li><a href=./sync.html>Share</a></li>"
    +"</ul>"
+"</ul>";
};