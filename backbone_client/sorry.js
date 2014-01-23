
var goToPrototypeApp = function(){
	var action_url = "corpus.html";
	chrome.tabs.create({
		url: action_url
	});
}
document.getElementById("goToPrototypeApp").onclick = goToPrototypeApp;

var goToCorpusPagesApp = function(){
	var action_url = "https://www.lingsync.org/public";
	chrome.tabs.create({
		url: action_url
	});
}
document.getElementById("goToCorpusPagesApp").onclick = goToCorpusPagesApp;



var goToSpreadsheetApp = function(){
	var action_url = "http://app.lingsync.org";
	chrome.tabs.create({
		url: action_url
	});
}
document.getElementById("goToSpreadsheetApp").onclick = goToSpreadsheetApp;


var seeChromeBlog = function(){
	var action_url = "http://blog.chromium.org/2012/11/restricting-extension-apis-in-legacy.html";
	chrome.tabs.create({
		url: action_url
	});
}
document.getElementById("seeChromeBlog").onclick = seeChromeBlog;

