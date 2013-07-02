
/*! jQuery v2.0.0 | (c) 2005, 2013 jQuery Foundation, Inc. | jquery.org/license
//@ sourceMappingURL=jquery.min.map
*/
(function(e,undefined){var t,n,r=typeof undefined,i=e.location,o=e.document,s=o.documentElement,a=e.jQuery,u=e.$,l={},c=[],f="2.0.0",p=c.concat,h=c.push,d=c.slice,g=c.indexOf,m=l.toString,y=l.hasOwnProperty,v=f.trim,x=function(e,n){return new x.fn.init(e,n,t)},b=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,w=/\S+/g,T=/^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/,C=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,k=/^-ms-/,N=/-([\da-z])/gi,E=function(e,t){return t.toUpperCase()},S=function(){o.removeEventListener("DOMContentLoaded",S,!1),e.removeEventListener("load",S,!1),x.ready()};x.fn=x.prototype={jquery:f,constructor:x,init:function(e,t,n){var r,i;if(!e)return this;if("string"==typeof e){if(r="<"===e.charAt(0)&&">"===e.charAt(e.length-1)&&e.length>=3?[null,e,null]:T.exec(e),!r||!r[1]&&t)return!t||t.jquery?(t||n).find(e):this.constructor(t).find(e);if(r[1]){if(t=t instanceof x?t[0]:t,x.merge(this,x.parseHTML(r[1],t&&t.nodeType?t.ownerDocument||t:o,!0)),C.test(r[1])&&x.isPlainObject(t))for(r in t)x.isFunction(this[r])?this[r](t[r]):this.attr(r,t[r]);return this}return i=o.getElementById(r[2]),i&&i.parentNode&&(this.length=1,this[0]=i),this.context=o,this.selector=e,this}return e.nodeType?(this.context=this[0]=e,this.length=1,this):x.isFunction(e)?n.ready(e):(e.selector!==undefined&&(this.selector=e.selector,this.context=e.context),x.makeArray(e,this))},selector:"",length:0,toArray:function(){return d.call(this)},get:function(e){return null==e?this.toArray():0>e?this[this.length+e]:this[e]},pushStack:function(e){var t=x.merge(this.constructor(),e);return t.prevObject=this,t.context=this.context,t},each:function(e,t){return x.each(this,e,t)},ready:function(e){return x.ready.promise().done(e),this},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(e){var t=this.length,n=+e+(0>e?t:0);return this.pushStack(n>=0&&t>n?[this[n]]:[])},map:function(e){return this.pushStack(x.map(this,function(t,n){return e.call(t,n,t)}))},end:function(){return this.prevObject||this.constructor(null)},push:h,sort:[].sort,splice:[].splice},x.fn.init.prototype=x.fn,x.extend=x.fn.extend=function(){var e,t,n,r,i,o,s=arguments[0]||{},a=1,u=arguments.length,l=!1;for("boolean"==typeof s&&(l=s,s=arguments[1]||{},a=2),"object"==typeof s||x.isFunction(s)||(s={}),u===a&&(s=this,--a);u>a;a++)if(null!=(e=arguments[a]))for(t in e)n=s[t],r=e[t],s!==r&&(l&&r&&(x.isPlainObject(r)||(i=x.isArray(r)))?(i?(i=!1,o=n&&x.isArray(n)?n:[]):o=n&&x.isPlainObject(n)?n:{},s[t]=x.extend(l,o,r)):r!==undefined&&(s[t]=r));return s},x.extend({expando:"jQuery"+(f+Math.random()).replace(/\D/g,""),noConflict:function(t){return e.$===x&&(e.$=u),t&&e.jQuery===x&&(e.jQuery=a),x},isReady:!1,readyWait:1,holdReady:function(e){e?x.readyWait++:x.ready(!0)},ready:function(e){(e===!0?--x.readyWait:x.isReady)||(x.isReady=!0,e!==!0&&--x.readyWait>0||(n.resolveWith(o,[x]),x.fn.trigger&&x(o).trigger("ready").off("ready")))},isFunction:function(e){return"function"===x.type(e)},isArray:Array.isArray,isWindow:function(e){return null!=e&&e===e.window},isNumeric:function(e){return!isNaN(parseFloat(e))&&isFinite(e)},type:function(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?l[m.call(e)]||"object":typeof e},isPlainObject:function(e){if("object"!==x.type(e)||e.nodeType||x.isWindow(e))return!1;try{if(e.constructor&&!y.call(e.constructor.prototype,"isPrototypeOf"))return!1}catch(t){return!1}return!0},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},error:function(e){throw Error(e)},parseHTML:function(e,t,n){if(!e||"string"!=typeof e)return null;"boolean"==typeof t&&(n=t,t=!1),t=t||o;var r=C.exec(e),i=!n&&[];return r?[t.createElement(r[1])]:(r=x.buildFragment([e],t,i),i&&x(i).remove(),x.merge([],r.childNodes))},parseJSON:JSON.parse,parseXML:function(e){var t,n;if(!e||"string"!=typeof e)return null;try{n=new DOMParser,t=n.parseFromString(e,"text/xml")}catch(r){t=undefined}return(!t||t.getElementsByTagName("parsererror").length)&&x.error("Invalid XML: "+e),t},noop:function(){},globalEval:function(e){var t,n=eval;e=x.trim(e),e&&(1===e.indexOf("use strict")?(t=o.createElement("script"),t.text=e,o.head.appendChild(t).parentNode.removeChild(t)):n(e))},camelCase:function(e){return e.replace(k,"ms-").replace(N,E)},nodeName:function(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()},each:function(e,t,n){var r,i=0,o=e.length,s=j(e);if(n){if(s){for(;o>i;i++)if(r=t.apply(e[i],n),r===!1)break}else for(i in e)if(r=t.apply(e[i],n),r===!1)break}else if(s){for(;o>i;i++)if(r=t.call(e[i],i,e[i]),r===!1)break}else for(i in e)if(r=t.call(e[i],i,e[i]),r===!1)break;return e},trim:function(e){return null==e?"":v.call(e)},makeArray:function(e,t){var n=t||[];return null!=e&&(j(Object(e))?x.merge(n,"string"==typeof e?[e]:e):h.call(n,e)),n},inArray:function(e,t,n){return null==t?-1:g.call(t,e,n)},merge:function(e,t){var n=t.length,r=e.length,i=0;if("number"==typeof n)for(;n>i;i++)e[r++]=t[i];else while(t[i]!==undefined)e[r++]=t[i++];return e.length=r,e},grep:function(e,t,n){var r,i=[],o=0,s=e.length;for(n=!!n;s>o;o++)r=!!t(e[o],o),n!==r&&i.push(e[o]);return i},map:function(e,t,n){var r,i=0,o=e.length,s=j(e),a=[];if(s)for(;o>i;i++)r=t(e[i],i,n),null!=r&&(a[a.length]=r);else for(i in e)r=t(e[i],i,n),null!=r&&(a[a.length]=r);return p.apply([],a)},guid:1,proxy:function(e,t){var n,r,i;return"string"==typeof t&&(n=e[t],t=e,e=n),x.isFunction(e)?(r=d.call(arguments,2),i=function(){return e.apply(t||this,r.concat(d.call(arguments)))},i.guid=e.guid=e.guid||x.guid++,i):undefined},access:function(e,t,n,r,i,o,s){var a=0,u=e.length,l=null==n;if("object"===x.type(n)){i=!0;for(a in n)x.access(e,t,a,n[a],!0,o,s)}else if(r!==undefined&&(i=!0,x.isFunction(r)||(s=!0),l&&(s?(t.call(e,r),t=null):(l=t,t=function(e,t,n){return l.call(x(e),n)})),t))for(;u>a;a++)t(e[a],n,s?r:r.call(e[a],a,t(e[a],n)));return i?e:l?t.call(e):u?t(e[0],n):o},now:Date.now,swap:function(e,t,n,r){var i,o,s={};for(o in t)s[o]=e.style[o],e.style[o]=t[o];i=n.apply(e,r||[]);for(o in t)e.style[o]=s[o];return i}}),x.ready.promise=function(t){return n||(n=x.Deferred(),"complete"===o.readyState?setTimeout(x.ready):(o.addEventListener("DOMContentLoaded",S,!1),e.addEventListener("load",S,!1))),n.promise(t)},x.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(e,t){l["[object "+t+"]"]=t.toLowerCase()});function j(e){var t=e.length,n=x.type(e);return x.isWindow(e)?!1:1===e.nodeType&&t?!0:"array"===n||"function"!==n&&(0===t||"number"==typeof t&&t>0&&t-1 in e)}t=x(o),function(e,undefined){var t,n,r,i,o,s,a,u,l,c,f,p,h,d,g,m,y="sizzle"+-new Date,v=e.document,b={},w=0,T=0,C=ot(),k=ot(),N=ot(),E=!1,S=function(){return 0},j=typeof undefined,D=1<<31,A=[],L=A.pop,q=A.push,H=A.push,O=A.slice,F=A.indexOf||function(e){var t=0,n=this.length;for(;n>t;t++)if(this[t]===e)return t;return-1},P="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",R="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",W=M.replace("w","w#"),$="\\["+R+"*("+M+")"+R+"*(?:([*^$|!~]?=)"+R+"*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|("+W+")|)|)"+R+"*\\]",B=":("+M+")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|"+$.replace(3,8)+")*)|.*)\\)|)",I=RegExp("^"+R+"+|((?:^|[^\\\\])(?:\\\\.)*)"+R+"+$","g"),z=RegExp("^"+R+"*,"+R+"*"),_=RegExp("^"+R+"*([>+~]|"+R+")"+R+"*"),X=RegExp(R+"*[+~]"),U=RegExp("="+R+"*([^\\]'\"]*)"+R+"*\\]","g"),Y=RegExp(B),V=RegExp("^"+W+"$"),G={ID:RegExp("^#("+M+")"),CLASS:RegExp("^\\.("+M+")"),TAG:RegExp("^("+M.replace("w","w*")+")"),ATTR:RegExp("^"+$),PSEUDO:RegExp("^"+B),CHILD:RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+R+"*(even|odd|(([+-]|)(\\d*)n|)"+R+"*(?:([+-]|)"+R+"*(\\d+)|))"+R+"*\\)|)","i"),"boolean":RegExp("^(?:"+P+")$","i"),needsContext:RegExp("^"+R+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+R+"*((?:-\\d)?\\d*)"+R+"*\\)|)(?=[^-]|$)","i")},J=/^[^{]+\{\s*\[native \w/,Q=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,K=/^(?:input|select|textarea|button)$/i,Z=/^h\d$/i,et=/'|\\/g,tt=/\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,nt=function(e,t){var n="0x"+t-65536;return n!==n?t:0>n?String.fromCharCode(n+65536):String.fromCharCode(55296|n>>10,56320|1023&n)};try{H.apply(A=O.call(v.childNodes),v.childNodes),A[v.childNodes.length].nodeType}catch(rt){H={apply:A.length?function(e,t){q.apply(e,O.call(t))}:function(e,t){var n=e.length,r=0;while(e[n++]=t[r++]);e.length=n-1}}}function it(e){return J.test(e+"")}function ot(){var e,t=[];return e=function(n,i){return t.push(n+=" ")>r.cacheLength&&delete e[t.shift()],e[n]=i}}function st(e){return e[y]=!0,e}function at(e){var t=c.createElement("div");try{return!!e(t)}catch(n){return!1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null}}function ut(e,t,n,r){var i,o,s,a,u,f,d,g,x,w;if((t?t.ownerDocument||t:v)!==c&&l(t),t=t||c,n=n||[],!e||"string"!=typeof e)return n;if(1!==(a=t.nodeType)&&9!==a)return[];if(p&&!r){if(i=Q.exec(e))if(s=i[1]){if(9===a){if(o=t.getElementById(s),!o||!o.parentNode)return n;if(o.id===s)return n.push(o),n}else if(t.ownerDocument&&(o=t.ownerDocument.getElementById(s))&&m(t,o)&&o.id===s)return n.push(o),n}else{if(i[2])return H.apply(n,t.getElementsByTagName(e)),n;if((s=i[3])&&b.getElementsByClassName&&t.getElementsByClassName)return H.apply(n,t.getElementsByClassName(s)),n}if(b.qsa&&(!h||!h.test(e))){if(g=d=y,x=t,w=9===a&&e,1===a&&"object"!==t.nodeName.toLowerCase()){f=gt(e),(d=t.getAttribute("id"))?g=d.replace(et,"\\$&"):t.setAttribute("id",g),g="[id='"+g+"'] ",u=f.length;while(u--)f[u]=g+mt(f[u]);x=X.test(e)&&t.parentNode||t,w=f.join(",")}if(w)try{return H.apply(n,x.querySelectorAll(w)),n}catch(T){}finally{d||t.removeAttribute("id")}}}return kt(e.replace(I,"$1"),t,n,r)}o=ut.isXML=function(e){var t=e&&(e.ownerDocument||e).documentElement;return t?"HTML"!==t.nodeName:!1},l=ut.setDocument=function(e){var t=e?e.ownerDocument||e:v;return t!==c&&9===t.nodeType&&t.documentElement?(c=t,f=t.documentElement,p=!o(t),b.getElementsByTagName=at(function(e){return e.appendChild(t.createComment("")),!e.getElementsByTagName("*").length}),b.attributes=at(function(e){return e.className="i",!e.getAttribute("className")}),b.getElementsByClassName=at(function(e){return e.innerHTML="<div class='a'></div><div class='a i'></div>",e.firstChild.className="i",2===e.getElementsByClassName("i").length}),b.sortDetached=at(function(e){return 1&e.compareDocumentPosition(c.createElement("div"))}),b.getById=at(function(e){return f.appendChild(e).id=y,!t.getElementsByName||!t.getElementsByName(y).length}),b.getById?(r.find.ID=function(e,t){if(typeof t.getElementById!==j&&p){var n=t.getElementById(e);return n&&n.parentNode?[n]:[]}},r.filter.ID=function(e){var t=e.replace(tt,nt);return function(e){return e.getAttribute("id")===t}}):(r.find.ID=function(e,t){if(typeof t.getElementById!==j&&p){var n=t.getElementById(e);return n?n.id===e||typeof n.getAttributeNode!==j&&n.getAttributeNode("id").value===e?[n]:undefined:[]}},r.filter.ID=function(e){var t=e.replace(tt,nt);return function(e){var n=typeof e.getAttributeNode!==j&&e.getAttributeNode("id");return n&&n.value===t}}),r.find.TAG=b.getElementsByTagName?function(e,t){return typeof t.getElementsByTagName!==j?t.getElementsByTagName(e):undefined}:function(e,t){var n,r=[],i=0,o=t.getElementsByTagName(e);if("*"===e){while(n=o[i++])1===n.nodeType&&r.push(n);return r}return o},r.find.CLASS=b.getElementsByClassName&&function(e,t){return typeof t.getElementsByClassName!==j&&p?t.getElementsByClassName(e):undefined},d=[],h=[],(b.qsa=it(t.querySelectorAll))&&(at(function(e){e.innerHTML="<select><option selected=''></option></select>",e.querySelectorAll("[selected]").length||h.push("\\["+R+"*(?:value|"+P+")"),e.querySelectorAll(":checked").length||h.push(":checked")}),at(function(e){var t=c.createElement("input");t.setAttribute("type","hidden"),e.appendChild(t).setAttribute("t",""),e.querySelectorAll("[t^='']").length&&h.push("[*^$]="+R+"*(?:''|\"\")"),e.querySelectorAll(":enabled").length||h.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),h.push(",.*:")})),(b.matchesSelector=it(g=f.webkitMatchesSelector||f.mozMatchesSelector||f.oMatchesSelector||f.msMatchesSelector))&&at(function(e){b.disconnectedMatch=g.call(e,"div"),g.call(e,"[s!='']:x"),d.push("!=",B)}),h=h.length&&RegExp(h.join("|")),d=d.length&&RegExp(d.join("|")),m=it(f.contains)||f.compareDocumentPosition?function(e,t){var n=9===e.nodeType?e.documentElement:e,r=t&&t.parentNode;return e===r||!(!r||1!==r.nodeType||!(n.contains?n.contains(r):e.compareDocumentPosition&&16&e.compareDocumentPosition(r)))}:function(e,t){if(t)while(t=t.parentNode)if(t===e)return!0;return!1},S=f.compareDocumentPosition?function(e,n){if(e===n)return E=!0,0;var r=n.compareDocumentPosition&&e.compareDocumentPosition&&e.compareDocumentPosition(n);return r?1&r||!b.sortDetached&&n.compareDocumentPosition(e)===r?e===t||m(v,e)?-1:n===t||m(v,n)?1:u?F.call(u,e)-F.call(u,n):0:4&r?-1:1:e.compareDocumentPosition?-1:1}:function(e,n){var r,i=0,o=e.parentNode,s=n.parentNode,a=[e],l=[n];if(e===n)return E=!0,0;if(!o||!s)return e===t?-1:n===t?1:o?-1:s?1:u?F.call(u,e)-F.call(u,n):0;if(o===s)return lt(e,n);r=e;while(r=r.parentNode)a.unshift(r);r=n;while(r=r.parentNode)l.unshift(r);while(a[i]===l[i])i++;return i?lt(a[i],l[i]):a[i]===v?-1:l[i]===v?1:0},c):c},ut.matches=function(e,t){return ut(e,null,null,t)},ut.matchesSelector=function(e,t){if((e.ownerDocument||e)!==c&&l(e),t=t.replace(U,"='$1']"),!(!b.matchesSelector||!p||d&&d.test(t)||h&&h.test(t)))try{var n=g.call(e,t);if(n||b.disconnectedMatch||e.document&&11!==e.document.nodeType)return n}catch(r){}return ut(t,c,null,[e]).length>0},ut.contains=function(e,t){return(e.ownerDocument||e)!==c&&l(e),m(e,t)},ut.attr=function(e,t){(e.ownerDocument||e)!==c&&l(e);var n=r.attrHandle[t.toLowerCase()],i=n&&n(e,t,!p);return i===undefined?b.attributes||!p?e.getAttribute(t):(i=e.getAttributeNode(t))&&i.specified?i.value:null:i},ut.error=function(e){throw Error("Syntax error, unrecognized expression: "+e)},ut.uniqueSort=function(e){var t,n=[],r=0,i=0;if(E=!b.detectDuplicates,u=!b.sortStable&&e.slice(0),e.sort(S),E){while(t=e[i++])t===e[i]&&(r=n.push(i));while(r--)e.splice(n[r],1)}return e};function lt(e,t){var n=t&&e,r=n&&(~t.sourceIndex||D)-(~e.sourceIndex||D);if(r)return r;if(n)while(n=n.nextSibling)if(n===t)return-1;return e?1:-1}function ct(e,t,n){var r;return n?undefined:(r=e.getAttributeNode(t))&&r.specified?r.value:e[t]===!0?t.toLowerCase():null}function ft(e,t,n){var r;return n?undefined:r=e.getAttribute(t,"type"===t.toLowerCase()?1:2)}function pt(e){return function(t){var n=t.nodeName.toLowerCase();return"input"===n&&t.type===e}}function ht(e){return function(t){var n=t.nodeName.toLowerCase();return("input"===n||"button"===n)&&t.type===e}}function dt(e){return st(function(t){return t=+t,st(function(n,r){var i,o=e([],n.length,t),s=o.length;while(s--)n[i=o[s]]&&(n[i]=!(r[i]=n[i]))})})}i=ut.getText=function(e){var t,n="",r=0,o=e.nodeType;if(o){if(1===o||9===o||11===o){if("string"==typeof e.textContent)return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=i(e)}else if(3===o||4===o)return e.nodeValue}else for(;t=e[r];r++)n+=i(t);return n},r=ut.selectors={cacheLength:50,createPseudo:st,match:G,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(tt,nt),e[3]=(e[4]||e[5]||"").replace(tt,nt),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||ut.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&ut.error(e[0]),e},PSEUDO:function(e){var t,n=!e[5]&&e[2];return G.CHILD.test(e[0])?null:(e[4]?e[2]=e[4]:n&&Y.test(n)&&(t=gt(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(tt,nt).toLowerCase();return"*"===e?function(){return!0}:function(e){return e.nodeName&&e.nodeName.toLowerCase()===t}},CLASS:function(e){var t=C[e+" "];return t||(t=RegExp("(^|"+R+")"+e+"("+R+"|$)"))&&C(e,function(e){return t.test("string"==typeof e.className&&e.className||typeof e.getAttribute!==j&&e.getAttribute("class")||"")})},ATTR:function(e,t,n){return function(r){var i=ut.attr(r,e);return null==i?"!="===t:t?(i+="","="===t?i===n:"!="===t?i!==n:"^="===t?n&&0===i.indexOf(n):"*="===t?n&&i.indexOf(n)>-1:"$="===t?n&&i.slice(-n.length)===n:"~="===t?(" "+i+" ").indexOf(n)>-1:"|="===t?i===n||i.slice(0,n.length+1)===n+"-":!1):!0}},CHILD:function(e,t,n,r,i){var o="nth"!==e.slice(0,3),s="last"!==e.slice(-4),a="of-type"===t;return 1===r&&0===i?function(e){return!!e.parentNode}:function(t,n,u){var l,c,f,p,h,d,g=o!==s?"nextSibling":"previousSibling",m=t.parentNode,v=a&&t.nodeName.toLowerCase(),x=!u&&!a;if(m){if(o){while(g){f=t;while(f=f[g])if(a?f.nodeName.toLowerCase()===v:1===f.nodeType)return!1;d=g="only"===e&&!d&&"nextSibling"}return!0}if(d=[s?m.firstChild:m.lastChild],s&&x){c=m[y]||(m[y]={}),l=c[e]||[],h=l[0]===w&&l[1],p=l[0]===w&&l[2],f=h&&m.childNodes[h];while(f=++h&&f&&f[g]||(p=h=0)||d.pop())if(1===f.nodeType&&++p&&f===t){c[e]=[w,h,p];break}}else if(x&&(l=(t[y]||(t[y]={}))[e])&&l[0]===w)p=l[1];else while(f=++h&&f&&f[g]||(p=h=0)||d.pop())if((a?f.nodeName.toLowerCase()===v:1===f.nodeType)&&++p&&(x&&((f[y]||(f[y]={}))[e]=[w,p]),f===t))break;return p-=i,p===r||0===p%r&&p/r>=0}}},PSEUDO:function(e,t){var n,i=r.pseudos[e]||r.setFilters[e.toLowerCase()]||ut.error("unsupported pseudo: "+e);return i[y]?i(t):i.length>1?(n=[e,e,"",t],r.setFilters.hasOwnProperty(e.toLowerCase())?st(function(e,n){var r,o=i(e,t),s=o.length;while(s--)r=F.call(e,o[s]),e[r]=!(n[r]=o[s])}):function(e){return i(e,0,n)}):i}},pseudos:{not:st(function(e){var t=[],n=[],r=s(e.replace(I,"$1"));return r[y]?st(function(e,t,n,i){var o,s=r(e,null,i,[]),a=e.length;while(a--)(o=s[a])&&(e[a]=!(t[a]=o))}):function(e,i,o){return t[0]=e,r(t,null,o,n),!n.pop()}}),has:st(function(e){return function(t){return ut(e,t).length>0}}),contains:st(function(e){return function(t){return(t.textContent||t.innerText||i(t)).indexOf(e)>-1}}),lang:st(function(e){return V.test(e||"")||ut.error("unsupported lang: "+e),e=e.replace(tt,nt).toLowerCase(),function(t){var n;do if(n=p?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return n=n.toLowerCase(),n===e||0===n.indexOf(e+"-");while((t=t.parentNode)&&1===t.nodeType);return!1}}),target:function(t){var n=e.location&&e.location.hash;return n&&n.slice(1)===t.id},root:function(e){return e===f},focus:function(e){return e===c.activeElement&&(!c.hasFocus||c.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:function(e){return e.disabled===!1},disabled:function(e){return e.disabled===!0},checked:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&!!e.checked||"option"===t&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,e.selected===!0},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeName>"@"||3===e.nodeType||4===e.nodeType)return!1;return!0},parent:function(e){return!r.pseudos.empty(e)},header:function(e){return Z.test(e.nodeName)},input:function(e){return K.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&"button"===e.type||"button"===t},text:function(e){var t;return"input"===e.nodeName.toLowerCase()&&"text"===e.type&&(null==(t=e.getAttribute("type"))||t.toLowerCase()===e.type)},first:dt(function(){return[0]}),last:dt(function(e,t){return[t-1]}),eq:dt(function(e,t,n){return[0>n?n+t:n]}),even:dt(function(e,t){var n=0;for(;t>n;n+=2)e.push(n);return e}),odd:dt(function(e,t){var n=1;for(;t>n;n+=2)e.push(n);return e}),lt:dt(function(e,t,n){var r=0>n?n+t:n;for(;--r>=0;)e.push(r);return e}),gt:dt(function(e,t,n){var r=0>n?n+t:n;for(;t>++r;)e.push(r);return e})}};for(t in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})r.pseudos[t]=pt(t);for(t in{submit:!0,reset:!0})r.pseudos[t]=ht(t);function gt(e,t){var n,i,o,s,a,u,l,c=k[e+" "];if(c)return t?0:c.slice(0);a=e,u=[],l=r.preFilter;while(a){(!n||(i=z.exec(a)))&&(i&&(a=a.slice(i[0].length)||a),u.push(o=[])),n=!1,(i=_.exec(a))&&(n=i.shift(),o.push({value:n,type:i[0].replace(I," ")}),a=a.slice(n.length));for(s in r.filter)!(i=G[s].exec(a))||l[s]&&!(i=l[s](i))||(n=i.shift(),o.push({value:n,type:s,matches:i}),a=a.slice(n.length));if(!n)break}return t?a.length:a?ut.error(e):k(e,u).slice(0)}function mt(e){var t=0,n=e.length,r="";for(;n>t;t++)r+=e[t].value;return r}function yt(e,t,r){var i=t.dir,o=r&&"parentNode"===i,s=T++;return t.first?function(t,n,r){while(t=t[i])if(1===t.nodeType||o)return e(t,n,r)}:function(t,r,a){var u,l,c,f=w+" "+s;if(a){while(t=t[i])if((1===t.nodeType||o)&&e(t,r,a))return!0}else while(t=t[i])if(1===t.nodeType||o)if(c=t[y]||(t[y]={}),(l=c[i])&&l[0]===f){if((u=l[1])===!0||u===n)return u===!0}else if(l=c[i]=[f],l[1]=e(t,r,a)||n,l[1]===!0)return!0}}function vt(e){return e.length>1?function(t,n,r){var i=e.length;while(i--)if(!e[i](t,n,r))return!1;return!0}:e[0]}function xt(e,t,n,r,i){var o,s=[],a=0,u=e.length,l=null!=t;for(;u>a;a++)(o=e[a])&&(!n||n(o,r,i))&&(s.push(o),l&&t.push(a));return s}function bt(e,t,n,r,i,o){return r&&!r[y]&&(r=bt(r)),i&&!i[y]&&(i=bt(i,o)),st(function(o,s,a,u){var l,c,f,p=[],h=[],d=s.length,g=o||Ct(t||"*",a.nodeType?[a]:a,[]),m=!e||!o&&t?g:xt(g,p,e,a,u),y=n?i||(o?e:d||r)?[]:s:m;if(n&&n(m,y,a,u),r){l=xt(y,h),r(l,[],a,u),c=l.length;while(c--)(f=l[c])&&(y[h[c]]=!(m[h[c]]=f))}if(o){if(i||e){if(i){l=[],c=y.length;while(c--)(f=y[c])&&l.push(m[c]=f);i(null,y=[],l,u)}c=y.length;while(c--)(f=y[c])&&(l=i?F.call(o,f):p[c])>-1&&(o[l]=!(s[l]=f))}}else y=xt(y===s?y.splice(d,y.length):y),i?i(null,s,y,u):H.apply(s,y)})}function wt(e){var t,n,i,o=e.length,s=r.relative[e[0].type],u=s||r.relative[" "],l=s?1:0,c=yt(function(e){return e===t},u,!0),f=yt(function(e){return F.call(t,e)>-1},u,!0),p=[function(e,n,r){return!s&&(r||n!==a)||((t=n).nodeType?c(e,n,r):f(e,n,r))}];for(;o>l;l++)if(n=r.relative[e[l].type])p=[yt(vt(p),n)];else{if(n=r.filter[e[l].type].apply(null,e[l].matches),n[y]){for(i=++l;o>i;i++)if(r.relative[e[i].type])break;return bt(l>1&&vt(p),l>1&&mt(e.slice(0,l-1)).replace(I,"$1"),n,i>l&&wt(e.slice(l,i)),o>i&&wt(e=e.slice(i)),o>i&&mt(e))}p.push(n)}return vt(p)}function Tt(e,t){var i=0,o=t.length>0,s=e.length>0,u=function(u,l,f,p,h){var d,g,m,y=[],v=0,x="0",b=u&&[],T=null!=h,C=a,k=u||s&&r.find.TAG("*",h&&l.parentNode||l),N=w+=null==C?1:Math.random()||.1;for(T&&(a=l!==c&&l,n=i);null!=(d=k[x]);x++){if(s&&d){g=0;while(m=e[g++])if(m(d,l,f)){p.push(d);break}T&&(w=N,n=++i)}o&&((d=!m&&d)&&v--,u&&b.push(d))}if(v+=x,o&&x!==v){g=0;while(m=t[g++])m(b,y,l,f);if(u){if(v>0)while(x--)b[x]||y[x]||(y[x]=L.call(p));y=xt(y)}H.apply(p,y),T&&!u&&y.length>0&&v+t.length>1&&ut.uniqueSort(p)}return T&&(w=N,a=C),b};return o?st(u):u}s=ut.compile=function(e,t){var n,r=[],i=[],o=N[e+" "];if(!o){t||(t=gt(e)),n=t.length;while(n--)o=wt(t[n]),o[y]?r.push(o):i.push(o);o=N(e,Tt(i,r))}return o};function Ct(e,t,n){var r=0,i=t.length;for(;i>r;r++)ut(e,t[r],n);return n}function kt(e,t,n,i){var o,a,u,l,c,f=gt(e);if(!i&&1===f.length){if(a=f[0]=f[0].slice(0),a.length>2&&"ID"===(u=a[0]).type&&9===t.nodeType&&p&&r.relative[a[1].type]){if(t=(r.find.ID(u.matches[0].replace(tt,nt),t)||[])[0],!t)return n;e=e.slice(a.shift().value.length)}o=G.needsContext.test(e)?0:a.length;while(o--){if(u=a[o],r.relative[l=u.type])break;if((c=r.find[l])&&(i=c(u.matches[0].replace(tt,nt),X.test(a[0].type)&&t.parentNode||t))){if(a.splice(o,1),e=i.length&&mt(a),!e)return H.apply(n,i),n;break}}}return s(e,f)(i,t,!p,n,X.test(e)),n}r.pseudos.nth=r.pseudos.eq;function Nt(){}Nt.prototype=r.filters=r.pseudos,r.setFilters=new Nt,b.sortStable=y.split("").sort(S).join("")===y,l(),[0,0].sort(S),b.detectDuplicates=E,at(function(e){if(e.innerHTML="<a href='#'></a>","#"!==e.firstChild.getAttribute("href")){var t="type|href|height|width".split("|"),n=t.length;while(n--)r.attrHandle[t[n]]=ft}}),at(function(e){if(null!=e.getAttribute("disabled")){var t=P.split("|"),n=t.length;while(n--)r.attrHandle[t[n]]=ct}}),x.find=ut,x.expr=ut.selectors,x.expr[":"]=x.expr.pseudos,x.unique=ut.uniqueSort,x.text=ut.getText,x.isXMLDoc=ut.isXML,x.contains=ut.contains}(e);var D={};function A(e){var t=D[e]={};return x.each(e.match(w)||[],function(e,n){t[n]=!0}),t}x.Callbacks=function(e){e="string"==typeof e?D[e]||A(e):x.extend({},e);var t,n,r,i,o,s,a=[],u=!e.once&&[],l=function(f){for(t=e.memory&&f,n=!0,s=i||0,i=0,o=a.length,r=!0;a&&o>s;s++)if(a[s].apply(f[0],f[1])===!1&&e.stopOnFalse){t=!1;break}r=!1,a&&(u?u.length&&l(u.shift()):t?a=[]:c.disable())},c={add:function(){if(a){var n=a.length;(function s(t){x.each(t,function(t,n){var r=x.type(n);"function"===r?e.unique&&c.has(n)||a.push(n):n&&n.length&&"string"!==r&&s(n)})})(arguments),r?o=a.length:t&&(i=n,l(t))}return this},remove:function(){return a&&x.each(arguments,function(e,t){var n;while((n=x.inArray(t,a,n))>-1)a.splice(n,1),r&&(o>=n&&o--,s>=n&&s--)}),this},has:function(e){return e?x.inArray(e,a)>-1:!(!a||!a.length)},empty:function(){return a=[],o=0,this},disable:function(){return a=u=t=undefined,this},disabled:function(){return!a},lock:function(){return u=undefined,t||c.disable(),this},locked:function(){return!u},fireWith:function(e,t){return t=t||[],t=[e,t.slice?t.slice():t],!a||n&&!u||(r?u.push(t):l(t)),this},fire:function(){return c.fireWith(this,arguments),this},fired:function(){return!!n}};return c},x.extend({Deferred:function(e){var t=[["resolve","done",x.Callbacks("once memory"),"resolved"],["reject","fail",x.Callbacks("once memory"),"rejected"],["notify","progress",x.Callbacks("memory")]],n="pending",r={state:function(){return n},always:function(){return i.done(arguments).fail(arguments),this},then:function(){var e=arguments;return x.Deferred(function(n){x.each(t,function(t,o){var s=o[0],a=x.isFunction(e[t])&&e[t];i[o[1]](function(){var e=a&&a.apply(this,arguments);e&&x.isFunction(e.promise)?e.promise().done(n.resolve).fail(n.reject).progress(n.notify):n[s+"With"](this===r?n.promise():this,a?[e]:arguments)})}),e=null}).promise()},promise:function(e){return null!=e?x.extend(e,r):r}},i={};return r.pipe=r.then,x.each(t,function(e,o){var s=o[2],a=o[3];r[o[1]]=s.add,a&&s.add(function(){n=a},t[1^e][2].disable,t[2][2].lock),i[o[0]]=function(){return i[o[0]+"With"](this===i?r:this,arguments),this},i[o[0]+"With"]=s.fireWith}),r.promise(i),e&&e.call(i,i),i},when:function(e){var t=0,n=d.call(arguments),r=n.length,i=1!==r||e&&x.isFunction(e.promise)?r:0,o=1===i?e:x.Deferred(),s=function(e,t,n){return function(r){t[e]=this,n[e]=arguments.length>1?d.call(arguments):r,n===a?o.notifyWith(t,n):--i||o.resolveWith(t,n)}},a,u,l;if(r>1)for(a=Array(r),u=Array(r),l=Array(r);r>t;t++)n[t]&&x.isFunction(n[t].promise)?n[t].promise().done(s(t,l,n)).fail(o.reject).progress(s(t,u,a)):--i;return i||o.resolveWith(l,n),o.promise()}}),x.support=function(t){var n=o.createElement("input"),r=o.createDocumentFragment(),i=o.createElement("div"),s=o.createElement("select"),a=s.appendChild(o.createElement("option"));return n.type?(n.type="checkbox",t.checkOn=""!==n.value,t.optSelected=a.selected,t.reliableMarginRight=!0,t.boxSizingReliable=!0,t.pixelPosition=!1,n.checked=!0,t.noCloneChecked=n.cloneNode(!0).checked,s.disabled=!0,t.optDisabled=!a.disabled,n=o.createElement("input"),n.value="t",n.type="radio",t.radioValue="t"===n.value,n.setAttribute("checked","t"),n.setAttribute("name","t"),r.appendChild(n),t.checkClone=r.cloneNode(!0).cloneNode(!0).lastChild.checked,t.focusinBubbles="onfocusin"in e,i.style.backgroundClip="content-box",i.cloneNode(!0).style.backgroundClip="",t.clearCloneStyle="content-box"===i.style.backgroundClip,x(function(){var n,r,s="padding:0;margin:0;border:0;display:block;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box",a=o.getElementsByTagName("body")[0];a&&(n=o.createElement("div"),n.style.cssText="border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px",a.appendChild(n).appendChild(i),i.innerHTML="",i.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%",x.swap(a,null!=a.style.zoom?{zoom:1}:{},function(){t.boxSizing=4===i.offsetWidth}),e.getComputedStyle&&(t.pixelPosition="1%"!==(e.getComputedStyle(i,null)||{}).top,t.boxSizingReliable="4px"===(e.getComputedStyle(i,null)||{width:"4px"}).width,r=i.appendChild(o.createElement("div")),r.style.cssText=i.style.cssText=s,r.style.marginRight=r.style.width="0",i.style.width="1px",t.reliableMarginRight=!parseFloat((e.getComputedStyle(r,null)||{}).marginRight)),a.removeChild(n))}),t):t}({});var L,q,H=/(?:\{[\s\S]*\}|\[[\s\S]*\])$/,O=/([A-Z])/g;function F(){Object.defineProperty(this.cache={},0,{get:function(){return{}}}),this.expando=x.expando+Math.random()}F.uid=1,F.accepts=function(e){return e.nodeType?1===e.nodeType||9===e.nodeType:!0},F.prototype={key:function(e){if(!F.accepts(e))return 0;var t={},n=e[this.expando];if(!n){n=F.uid++;try{t[this.expando]={value:n},Object.defineProperties(e,t)}catch(r){t[this.expando]=n,x.extend(e,t)}}return this.cache[n]||(this.cache[n]={}),n},set:function(e,t,n){var r,i=this.key(e),o=this.cache[i];if("string"==typeof t)o[t]=n;else if(x.isEmptyObject(o))this.cache[i]=t;else for(r in t)o[r]=t[r]},get:function(e,t){var n=this.cache[this.key(e)];return t===undefined?n:n[t]},access:function(e,t,n){return t===undefined||t&&"string"==typeof t&&n===undefined?this.get(e,t):(this.set(e,t,n),n!==undefined?n:t)},remove:function(e,t){var n,r,i=this.key(e),o=this.cache[i];if(t===undefined)this.cache[i]={};else{x.isArray(t)?r=t.concat(t.map(x.camelCase)):t in o?r=[t]:(r=x.camelCase(t),r=r in o?[r]:r.match(w)||[]),n=r.length;while(n--)delete o[r[n]]}},hasData:function(e){return!x.isEmptyObject(this.cache[e[this.expando]]||{})},discard:function(e){delete this.cache[this.key(e)]}},L=new F,q=new F,x.extend({acceptData:F.accepts,hasData:function(e){return L.hasData(e)||q.hasData(e)},data:function(e,t,n){return L.access(e,t,n)},removeData:function(e,t){L.remove(e,t)},_data:function(e,t,n){return q.access(e,t,n)},_removeData:function(e,t){q.remove(e,t)}}),x.fn.extend({data:function(e,t){var n,r,i=this[0],o=0,s=null;if(e===undefined){if(this.length&&(s=L.get(i),1===i.nodeType&&!q.get(i,"hasDataAttrs"))){for(n=i.attributes;n.length>o;o++)r=n[o].name,0===r.indexOf("data-")&&(r=x.camelCase(r.substring(5)),P(i,r,s[r]));q.set(i,"hasDataAttrs",!0)}return s}return"object"==typeof e?this.each(function(){L.set(this,e)}):x.access(this,function(t){var n,r=x.camelCase(e);if(i&&t===undefined){if(n=L.get(i,e),n!==undefined)return n;if(n=L.get(i,r),n!==undefined)return n;if(n=P(i,r,undefined),n!==undefined)return n}else this.each(function(){var n=L.get(this,r);L.set(this,r,t),-1!==e.indexOf("-")&&n!==undefined&&L.set(this,e,t)})},null,t,arguments.length>1,null,!0)},removeData:function(e){return this.each(function(){L.remove(this,e)})}});function P(e,t,n){var r;if(n===undefined&&1===e.nodeType)if(r="data-"+t.replace(O,"-$1").toLowerCase(),n=e.getAttribute(r),"string"==typeof n){try{n="true"===n?!0:"false"===n?!1:"null"===n?null:+n+""===n?+n:H.test(n)?JSON.parse(n):n}catch(i){}L.set(e,t,n)}else n=undefined;return n}x.extend({queue:function(e,t,n){var r;return e?(t=(t||"fx")+"queue",r=q.get(e,t),n&&(!r||x.isArray(n)?r=q.access(e,t,x.makeArray(n)):r.push(n)),r||[]):undefined},dequeue:function(e,t){t=t||"fx";var n=x.queue(e,t),r=n.length,i=n.shift(),o=x._queueHooks(e,t),s=function(){x.dequeue(e,t)};"inprogress"===i&&(i=n.shift(),r--),o.cur=i,i&&("fx"===t&&n.unshift("inprogress"),delete o.stop,i.call(e,s,o)),!r&&o&&o.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return q.get(e,n)||q.access(e,n,{empty:x.Callbacks("once memory").add(function(){q.remove(e,[t+"queue",n])})})}}),x.fn.extend({queue:function(e,t){var n=2;return"string"!=typeof e&&(t=e,e="fx",n--),n>arguments.length?x.queue(this[0],e):t===undefined?this:this.each(function(){var n=x.queue(this,e,t);
x._queueHooks(this,e),"fx"===e&&"inprogress"!==n[0]&&x.dequeue(this,e)})},dequeue:function(e){return this.each(function(){x.dequeue(this,e)})},delay:function(e,t){return e=x.fx?x.fx.speeds[e]||e:e,t=t||"fx",this.queue(t,function(t,n){var r=setTimeout(t,e);n.stop=function(){clearTimeout(r)}})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var n,r=1,i=x.Deferred(),o=this,s=this.length,a=function(){--r||i.resolveWith(o,[o])};"string"!=typeof e&&(t=e,e=undefined),e=e||"fx";while(s--)n=q.get(o[s],e+"queueHooks"),n&&n.empty&&(r++,n.empty.add(a));return a(),i.promise(t)}});var R,M,W=/[\t\r\n]/g,$=/\r/g,B=/^(?:input|select|textarea|button)$/i;x.fn.extend({attr:function(e,t){return x.access(this,x.attr,e,t,arguments.length>1)},removeAttr:function(e){return this.each(function(){x.removeAttr(this,e)})},prop:function(e,t){return x.access(this,x.prop,e,t,arguments.length>1)},removeProp:function(e){return this.each(function(){delete this[x.propFix[e]||e]})},addClass:function(e){var t,n,r,i,o,s=0,a=this.length,u="string"==typeof e&&e;if(x.isFunction(e))return this.each(function(t){x(this).addClass(e.call(this,t,this.className))});if(u)for(t=(e||"").match(w)||[];a>s;s++)if(n=this[s],r=1===n.nodeType&&(n.className?(" "+n.className+" ").replace(W," "):" ")){o=0;while(i=t[o++])0>r.indexOf(" "+i+" ")&&(r+=i+" ");n.className=x.trim(r)}return this},removeClass:function(e){var t,n,r,i,o,s=0,a=this.length,u=0===arguments.length||"string"==typeof e&&e;if(x.isFunction(e))return this.each(function(t){x(this).removeClass(e.call(this,t,this.className))});if(u)for(t=(e||"").match(w)||[];a>s;s++)if(n=this[s],r=1===n.nodeType&&(n.className?(" "+n.className+" ").replace(W," "):"")){o=0;while(i=t[o++])while(r.indexOf(" "+i+" ")>=0)r=r.replace(" "+i+" "," ");n.className=e?x.trim(r):""}return this},toggleClass:function(e,t){var n=typeof e,i="boolean"==typeof t;return x.isFunction(e)?this.each(function(n){x(this).toggleClass(e.call(this,n,this.className,t),t)}):this.each(function(){if("string"===n){var o,s=0,a=x(this),u=t,l=e.match(w)||[];while(o=l[s++])u=i?u:!a.hasClass(o),a[u?"addClass":"removeClass"](o)}else(n===r||"boolean"===n)&&(this.className&&q.set(this,"__className__",this.className),this.className=this.className||e===!1?"":q.get(this,"__className__")||"")})},hasClass:function(e){var t=" "+e+" ",n=0,r=this.length;for(;r>n;n++)if(1===this[n].nodeType&&(" "+this[n].className+" ").replace(W," ").indexOf(t)>=0)return!0;return!1},val:function(e){var t,n,r,i=this[0];{if(arguments.length)return r=x.isFunction(e),this.each(function(n){var i,o=x(this);1===this.nodeType&&(i=r?e.call(this,n,o.val()):e,null==i?i="":"number"==typeof i?i+="":x.isArray(i)&&(i=x.map(i,function(e){return null==e?"":e+""})),t=x.valHooks[this.type]||x.valHooks[this.nodeName.toLowerCase()],t&&"set"in t&&t.set(this,i,"value")!==undefined||(this.value=i))});if(i)return t=x.valHooks[i.type]||x.valHooks[i.nodeName.toLowerCase()],t&&"get"in t&&(n=t.get(i,"value"))!==undefined?n:(n=i.value,"string"==typeof n?n.replace($,""):null==n?"":n)}}}),x.extend({valHooks:{option:{get:function(e){var t=e.attributes.value;return!t||t.specified?e.value:e.text}},select:{get:function(e){var t,n,r=e.options,i=e.selectedIndex,o="select-one"===e.type||0>i,s=o?null:[],a=o?i+1:r.length,u=0>i?a:o?i:0;for(;a>u;u++)if(n=r[u],!(!n.selected&&u!==i||(x.support.optDisabled?n.disabled:null!==n.getAttribute("disabled"))||n.parentNode.disabled&&x.nodeName(n.parentNode,"optgroup"))){if(t=x(n).val(),o)return t;s.push(t)}return s},set:function(e,t){var n,r,i=e.options,o=x.makeArray(t),s=i.length;while(s--)r=i[s],(r.selected=x.inArray(x(r).val(),o)>=0)&&(n=!0);return n||(e.selectedIndex=-1),o}}},attr:function(e,t,n){var i,o,s=e.nodeType;if(e&&3!==s&&8!==s&&2!==s)return typeof e.getAttribute===r?x.prop(e,t,n):(1===s&&x.isXMLDoc(e)||(t=t.toLowerCase(),i=x.attrHooks[t]||(x.expr.match.boolean.test(t)?M:R)),n===undefined?i&&"get"in i&&null!==(o=i.get(e,t))?o:(o=x.find.attr(e,t),null==o?undefined:o):null!==n?i&&"set"in i&&(o=i.set(e,n,t))!==undefined?o:(e.setAttribute(t,n+""),n):(x.removeAttr(e,t),undefined))},removeAttr:function(e,t){var n,r,i=0,o=t&&t.match(w);if(o&&1===e.nodeType)while(n=o[i++])r=x.propFix[n]||n,x.expr.match.boolean.test(n)&&(e[r]=!1),e.removeAttribute(n)},attrHooks:{type:{set:function(e,t){if(!x.support.radioValue&&"radio"===t&&x.nodeName(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},propFix:{"for":"htmlFor","class":"className"},prop:function(e,t,n){var r,i,o,s=e.nodeType;if(e&&3!==s&&8!==s&&2!==s)return o=1!==s||!x.isXMLDoc(e),o&&(t=x.propFix[t]||t,i=x.propHooks[t]),n!==undefined?i&&"set"in i&&(r=i.set(e,n,t))!==undefined?r:e[t]=n:i&&"get"in i&&null!==(r=i.get(e,t))?r:e[t]},propHooks:{tabIndex:{get:function(e){return e.hasAttribute("tabindex")||B.test(e.nodeName)||e.href?e.tabIndex:-1}}}}),M={set:function(e,t,n){return t===!1?x.removeAttr(e,n):e.setAttribute(n,n),n}},x.each(x.expr.match.boolean.source.match(/\w+/g),function(e,t){var n=x.expr.attrHandle[t]||x.find.attr;x.expr.attrHandle[t]=function(e,t,r){var i=x.expr.attrHandle[t],o=r?undefined:(x.expr.attrHandle[t]=undefined)!=n(e,t,r)?t.toLowerCase():null;return x.expr.attrHandle[t]=i,o}}),x.support.optSelected||(x.propHooks.selected={get:function(e){var t=e.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null}}),x.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){x.propFix[this.toLowerCase()]=this}),x.each(["radio","checkbox"],function(){x.valHooks[this]={set:function(e,t){return x.isArray(t)?e.checked=x.inArray(x(e).val(),t)>=0:undefined}},x.support.checkOn||(x.valHooks[this].get=function(e){return null===e.getAttribute("value")?"on":e.value})});var I=/^key/,z=/^(?:mouse|contextmenu)|click/,_=/^(?:focusinfocus|focusoutblur)$/,X=/^([^.]*)(?:\.(.+)|)$/;function U(){return!0}function Y(){return!1}function V(){try{return o.activeElement}catch(e){}}x.event={global:{},add:function(e,t,n,i,o){var s,a,u,l,c,f,p,h,d,g,m,y=q.get(e);if(y){n.handler&&(s=n,n=s.handler,o=s.selector),n.guid||(n.guid=x.guid++),(l=y.events)||(l=y.events={}),(a=y.handle)||(a=y.handle=function(e){return typeof x===r||e&&x.event.triggered===e.type?undefined:x.event.dispatch.apply(a.elem,arguments)},a.elem=e),t=(t||"").match(w)||[""],c=t.length;while(c--)u=X.exec(t[c])||[],d=m=u[1],g=(u[2]||"").split(".").sort(),d&&(p=x.event.special[d]||{},d=(o?p.delegateType:p.bindType)||d,p=x.event.special[d]||{},f=x.extend({type:d,origType:m,data:i,handler:n,guid:n.guid,selector:o,needsContext:o&&x.expr.match.needsContext.test(o),namespace:g.join(".")},s),(h=l[d])||(h=l[d]=[],h.delegateCount=0,p.setup&&p.setup.call(e,i,g,a)!==!1||e.addEventListener&&e.addEventListener(d,a,!1)),p.add&&(p.add.call(e,f),f.handler.guid||(f.handler.guid=n.guid)),o?h.splice(h.delegateCount++,0,f):h.push(f),x.event.global[d]=!0);e=null}},remove:function(e,t,n,r,i){var o,s,a,u,l,c,f,p,h,d,g,m=q.hasData(e)&&q.get(e);if(m&&(u=m.events)){t=(t||"").match(w)||[""],l=t.length;while(l--)if(a=X.exec(t[l])||[],h=g=a[1],d=(a[2]||"").split(".").sort(),h){f=x.event.special[h]||{},h=(r?f.delegateType:f.bindType)||h,p=u[h]||[],a=a[2]&&RegExp("(^|\\.)"+d.join("\\.(?:.*\\.|)")+"(\\.|$)"),s=o=p.length;while(o--)c=p[o],!i&&g!==c.origType||n&&n.guid!==c.guid||a&&!a.test(c.namespace)||r&&r!==c.selector&&("**"!==r||!c.selector)||(p.splice(o,1),c.selector&&p.delegateCount--,f.remove&&f.remove.call(e,c));s&&!p.length&&(f.teardown&&f.teardown.call(e,d,m.handle)!==!1||x.removeEvent(e,h,m.handle),delete u[h])}else for(h in u)x.event.remove(e,h+t[l],n,r,!0);x.isEmptyObject(u)&&(delete m.handle,q.remove(e,"events"))}},trigger:function(t,n,r,i){var s,a,u,l,c,f,p,h=[r||o],d=y.call(t,"type")?t.type:t,g=y.call(t,"namespace")?t.namespace.split("."):[];if(a=u=r=r||o,3!==r.nodeType&&8!==r.nodeType&&!_.test(d+x.event.triggered)&&(d.indexOf(".")>=0&&(g=d.split("."),d=g.shift(),g.sort()),c=0>d.indexOf(":")&&"on"+d,t=t[x.expando]?t:new x.Event(d,"object"==typeof t&&t),t.isTrigger=i?2:3,t.namespace=g.join("."),t.namespace_re=t.namespace?RegExp("(^|\\.)"+g.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,t.result=undefined,t.target||(t.target=r),n=null==n?[t]:x.makeArray(n,[t]),p=x.event.special[d]||{},i||!p.trigger||p.trigger.apply(r,n)!==!1)){if(!i&&!p.noBubble&&!x.isWindow(r)){for(l=p.delegateType||d,_.test(l+d)||(a=a.parentNode);a;a=a.parentNode)h.push(a),u=a;u===(r.ownerDocument||o)&&h.push(u.defaultView||u.parentWindow||e)}s=0;while((a=h[s++])&&!t.isPropagationStopped())t.type=s>1?l:p.bindType||d,f=(q.get(a,"events")||{})[t.type]&&q.get(a,"handle"),f&&f.apply(a,n),f=c&&a[c],f&&x.acceptData(a)&&f.apply&&f.apply(a,n)===!1&&t.preventDefault();return t.type=d,i||t.isDefaultPrevented()||p._default&&p._default.apply(h.pop(),n)!==!1||!x.acceptData(r)||c&&x.isFunction(r[d])&&!x.isWindow(r)&&(u=r[c],u&&(r[c]=null),x.event.triggered=d,r[d](),x.event.triggered=undefined,u&&(r[c]=u)),t.result}},dispatch:function(e){e=x.event.fix(e);var t,n,r,i,o,s=[],a=d.call(arguments),u=(q.get(this,"events")||{})[e.type]||[],l=x.event.special[e.type]||{};if(a[0]=e,e.delegateTarget=this,!l.preDispatch||l.preDispatch.call(this,e)!==!1){s=x.event.handlers.call(this,e,u),t=0;while((i=s[t++])&&!e.isPropagationStopped()){e.currentTarget=i.elem,n=0;while((o=i.handlers[n++])&&!e.isImmediatePropagationStopped())(!e.namespace_re||e.namespace_re.test(o.namespace))&&(e.handleObj=o,e.data=o.data,r=((x.event.special[o.origType]||{}).handle||o.handler).apply(i.elem,a),r!==undefined&&(e.result=r)===!1&&(e.preventDefault(),e.stopPropagation()))}return l.postDispatch&&l.postDispatch.call(this,e),e.result}},handlers:function(e,t){var n,r,i,o,s=[],a=t.delegateCount,u=e.target;if(a&&u.nodeType&&(!e.button||"click"!==e.type))for(;u!==this;u=u.parentNode||this)if(u.disabled!==!0||"click"!==e.type){for(r=[],n=0;a>n;n++)o=t[n],i=o.selector+" ",r[i]===undefined&&(r[i]=o.needsContext?x(i,this).index(u)>=0:x.find(i,this,null,[u]).length),r[i]&&r.push(o);r.length&&s.push({elem:u,handlers:r})}return t.length>a&&s.push({elem:this,handlers:t.slice(a)}),s},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(e,t){return null==e.which&&(e.which=null!=t.charCode?t.charCode:t.keyCode),e}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(e,t){var n,r,i,s=t.button;return null==e.pageX&&null!=t.clientX&&(n=e.target.ownerDocument||o,r=n.documentElement,i=n.body,e.pageX=t.clientX+(r&&r.scrollLeft||i&&i.scrollLeft||0)-(r&&r.clientLeft||i&&i.clientLeft||0),e.pageY=t.clientY+(r&&r.scrollTop||i&&i.scrollTop||0)-(r&&r.clientTop||i&&i.clientTop||0)),e.which||s===undefined||(e.which=1&s?1:2&s?3:4&s?2:0),e}},fix:function(e){if(e[x.expando])return e;var t,n,r,i=e.type,o=e,s=this.fixHooks[i];s||(this.fixHooks[i]=s=z.test(i)?this.mouseHooks:I.test(i)?this.keyHooks:{}),r=s.props?this.props.concat(s.props):this.props,e=new x.Event(o),t=r.length;while(t--)n=r[t],e[n]=o[n];return 3===e.target.nodeType&&(e.target=e.target.parentNode),s.filter?s.filter(e,o):e},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==V()&&this.focus?(this.focus(),!1):undefined},delegateType:"focusin"},blur:{trigger:function(){return this===V()&&this.blur?(this.blur(),!1):undefined},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&x.nodeName(this,"input")?(this.click(),!1):undefined},_default:function(e){return x.nodeName(e.target,"a")}},beforeunload:{postDispatch:function(e){e.result!==undefined&&(e.originalEvent.returnValue=e.result)}}},simulate:function(e,t,n,r){var i=x.extend(new x.Event,n,{type:e,isSimulated:!0,originalEvent:{}});r?x.event.trigger(i,null,t):x.event.dispatch.call(t,i),i.isDefaultPrevented()&&n.preventDefault()}},x.removeEvent=function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n,!1)},x.Event=function(e,t){return this instanceof x.Event?(e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||e.getPreventDefault&&e.getPreventDefault()?U:Y):this.type=e,t&&x.extend(this,t),this.timeStamp=e&&e.timeStamp||x.now(),this[x.expando]=!0,undefined):new x.Event(e,t)},x.Event.prototype={isDefaultPrevented:Y,isPropagationStopped:Y,isImmediatePropagationStopped:Y,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=U,e&&e.preventDefault&&e.preventDefault()},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=U,e&&e.stopPropagation&&e.stopPropagation()},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=U,this.stopPropagation()}},x.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(e,t){x.event.special[e]={delegateType:t,bindType:t,handle:function(e){var n,r=this,i=e.relatedTarget,o=e.handleObj;return(!i||i!==r&&!x.contains(r,i))&&(e.type=o.origType,n=o.handler.apply(this,arguments),e.type=t),n}}}),x.support.focusinBubbles||x.each({focus:"focusin",blur:"focusout"},function(e,t){var n=0,r=function(e){x.event.simulate(t,e.target,x.event.fix(e),!0)};x.event.special[t]={setup:function(){0===n++&&o.addEventListener(e,r,!0)},teardown:function(){0===--n&&o.removeEventListener(e,r,!0)}}}),x.fn.extend({on:function(e,t,n,r,i){var o,s;if("object"==typeof e){"string"!=typeof t&&(n=n||t,t=undefined);for(s in e)this.on(s,t,n,e[s],i);return this}if(null==n&&null==r?(r=t,n=t=undefined):null==r&&("string"==typeof t?(r=n,n=undefined):(r=n,n=t,t=undefined)),r===!1)r=Y;else if(!r)return this;return 1===i&&(o=r,r=function(e){return x().off(e),o.apply(this,arguments)},r.guid=o.guid||(o.guid=x.guid++)),this.each(function(){x.event.add(this,e,r,n,t)})},one:function(e,t,n,r){return this.on(e,t,n,r,1)},off:function(e,t,n){var r,i;if(e&&e.preventDefault&&e.handleObj)return r=e.handleObj,x(e.delegateTarget).off(r.namespace?r.origType+"."+r.namespace:r.origType,r.selector,r.handler),this;if("object"==typeof e){for(i in e)this.off(i,t,e[i]);return this}return(t===!1||"function"==typeof t)&&(n=t,t=undefined),n===!1&&(n=Y),this.each(function(){x.event.remove(this,e,n,t)})},trigger:function(e,t){return this.each(function(){x.event.trigger(e,t,this)})},triggerHandler:function(e,t){var n=this[0];return n?x.event.trigger(e,t,n,!0):undefined}});var G=/^.[^:#\[\.,]*$/,J=x.expr.match.needsContext,Q={children:!0,contents:!0,next:!0,prev:!0};x.fn.extend({find:function(e){var t,n,r,i=this.length;if("string"!=typeof e)return t=this,this.pushStack(x(e).filter(function(){for(r=0;i>r;r++)if(x.contains(t[r],this))return!0}));for(n=[],r=0;i>r;r++)x.find(e,this[r],n);return n=this.pushStack(i>1?x.unique(n):n),n.selector=(this.selector?this.selector+" ":"")+e,n},has:function(e){var t=x(e,this),n=t.length;return this.filter(function(){var e=0;for(;n>e;e++)if(x.contains(this,t[e]))return!0})},not:function(e){return this.pushStack(Z(this,e||[],!0))},filter:function(e){return this.pushStack(Z(this,e||[],!1))},is:function(e){return!!e&&("string"==typeof e?J.test(e)?x(e,this.context).index(this[0])>=0:x.filter(e,this).length>0:this.filter(e).length>0)},closest:function(e,t){var n,r=0,i=this.length,o=[],s=J.test(e)||"string"!=typeof e?x(e,t||this.context):0;for(;i>r;r++)for(n=this[r];n&&n!==t;n=n.parentNode)if(11>n.nodeType&&(s?s.index(n)>-1:1===n.nodeType&&x.find.matchesSelector(n,e))){n=o.push(n);break}return this.pushStack(o.length>1?x.unique(o):o)},index:function(e){return e?"string"==typeof e?g.call(x(e),this[0]):g.call(this,e.jquery?e[0]:e):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){var n="string"==typeof e?x(e,t):x.makeArray(e&&e.nodeType?[e]:e),r=x.merge(this.get(),n);return this.pushStack(x.unique(r))},addBack:function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}});function K(e,t){while((e=e[t])&&1!==e.nodeType);return e}x.each({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return x.dir(e,"parentNode")},parentsUntil:function(e,t,n){return x.dir(e,"parentNode",n)},next:function(e){return K(e,"nextSibling")},prev:function(e){return K(e,"previousSibling")},nextAll:function(e){return x.dir(e,"nextSibling")},prevAll:function(e){return x.dir(e,"previousSibling")},nextUntil:function(e,t,n){return x.dir(e,"nextSibling",n)},prevUntil:function(e,t,n){return x.dir(e,"previousSibling",n)},siblings:function(e){return x.sibling((e.parentNode||{}).firstChild,e)},children:function(e){return x.sibling(e.firstChild)},contents:function(e){return x.nodeName(e,"iframe")?e.contentDocument||e.contentWindow.document:x.merge([],e.childNodes)}},function(e,t){x.fn[e]=function(n,r){var i=x.map(this,t,n);return"Until"!==e.slice(-5)&&(r=n),r&&"string"==typeof r&&(i=x.filter(r,i)),this.length>1&&(Q[e]||x.unique(i),"p"===e[0]&&i.reverse()),this.pushStack(i)}}),x.extend({filter:function(e,t,n){var r=t[0];return n&&(e=":not("+e+")"),1===t.length&&1===r.nodeType?x.find.matchesSelector(r,e)?[r]:[]:x.find.matches(e,x.grep(t,function(e){return 1===e.nodeType}))},dir:function(e,t,n){var r=[],i=n!==undefined;while((e=e[t])&&9!==e.nodeType)if(1===e.nodeType){if(i&&x(e).is(n))break;r.push(e)}return r},sibling:function(e,t){var n=[];for(;e;e=e.nextSibling)1===e.nodeType&&e!==t&&n.push(e);return n}});function Z(e,t,n){if(x.isFunction(t))return x.grep(e,function(e,r){return!!t.call(e,r,e)!==n});if(t.nodeType)return x.grep(e,function(e){return e===t!==n});if("string"==typeof t){if(G.test(t))return x.filter(t,e,n);t=x.filter(t,e)}return x.grep(e,function(e){return g.call(t,e)>=0!==n})}var et=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,tt=/<([\w:]+)/,nt=/<|&#?\w+;/,rt=/<(?:script|style|link)/i,it=/^(?:checkbox|radio)$/i,ot=/checked\s*(?:[^=]|=\s*.checked.)/i,st=/^$|\/(?:java|ecma)script/i,at=/^true\/(.*)/,ut=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,lt={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};lt.optgroup=lt.option,lt.tbody=lt.tfoot=lt.colgroup=lt.caption=lt.col=lt.thead,lt.th=lt.td,x.fn.extend({text:function(e){return x.access(this,function(e){return e===undefined?x.text(this):this.empty().append((this[0]&&this[0].ownerDocument||o).createTextNode(e))},null,e,arguments.length)},append:function(){return this.domManip(arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=ct(this,e);t.appendChild(e)}})},prepend:function(){return this.domManip(arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=ct(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return this.domManip(arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return this.domManip(arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},remove:function(e,t){var n,r=e?x.filter(e,this):this,i=0;for(;null!=(n=r[i]);i++)t||1!==n.nodeType||x.cleanData(gt(n)),n.parentNode&&(t&&x.contains(n.ownerDocument,n)&&ht(gt(n,"script")),n.parentNode.removeChild(n));return this},empty:function(){var e,t=0;for(;null!=(e=this[t]);t++)1===e.nodeType&&(x.cleanData(gt(e,!1)),e.textContent="");return this},clone:function(e,t){return e=null==e?!1:e,t=null==t?e:t,this.map(function(){return x.clone(this,e,t)})},html:function(e){return x.access(this,function(e){var t=this[0]||{},n=0,r=this.length;if(e===undefined&&1===t.nodeType)return t.innerHTML;if("string"==typeof e&&!rt.test(e)&&!lt[(tt.exec(e)||["",""])[1].toLowerCase()]){e=e.replace(et,"<$1></$2>");try{for(;r>n;n++)t=this[n]||{},1===t.nodeType&&(x.cleanData(gt(t,!1)),t.innerHTML=e);t=0}catch(i){}}t&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(){var e=x.map(this,function(e){return[e.nextSibling,e.parentNode]}),t=0;return this.domManip(arguments,function(n){var r=e[t++],i=e[t++];i&&(x(this).remove(),i.insertBefore(n,r))},!0),t?this:this.remove()},detach:function(e){return this.remove(e,!0)},domManip:function(e,t,n){e=p.apply([],e);var r,i,o,s,a,u,l=0,c=this.length,f=this,h=c-1,d=e[0],g=x.isFunction(d);if(g||!(1>=c||"string"!=typeof d||x.support.checkClone)&&ot.test(d))return this.each(function(r){var i=f.eq(r);g&&(e[0]=d.call(this,r,i.html())),i.domManip(e,t,n)});if(c&&(r=x.buildFragment(e,this[0].ownerDocument,!1,!n&&this),i=r.firstChild,1===r.childNodes.length&&(r=i),i)){for(o=x.map(gt(r,"script"),ft),s=o.length;c>l;l++)a=r,l!==h&&(a=x.clone(a,!0,!0),s&&x.merge(o,gt(a,"script"))),t.call(this[l],a,l);if(s)for(u=o[o.length-1].ownerDocument,x.map(o,pt),l=0;s>l;l++)a=o[l],st.test(a.type||"")&&!q.access(a,"globalEval")&&x.contains(u,a)&&(a.src?x._evalUrl(a.src):x.globalEval(a.textContent.replace(ut,"")))}return this}}),x.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,t){x.fn[e]=function(e){var n,r=[],i=x(e),o=i.length-1,s=0;for(;o>=s;s++)n=s===o?this:this.clone(!0),x(i[s])[t](n),h.apply(r,n.get());return this.pushStack(r)}}),x.extend({clone:function(e,t,n){var r,i,o,s,a=e.cloneNode(!0),u=x.contains(e.ownerDocument,e);if(!(x.support.noCloneChecked||1!==e.nodeType&&11!==e.nodeType||x.isXMLDoc(e)))for(s=gt(a),o=gt(e),r=0,i=o.length;i>r;r++)mt(o[r],s[r]);if(t)if(n)for(o=o||gt(e),s=s||gt(a),r=0,i=o.length;i>r;r++)dt(o[r],s[r]);else dt(e,a);return s=gt(a,"script"),s.length>0&&ht(s,!u&&gt(e,"script")),a},buildFragment:function(e,t,n,r){var i,o,s,a,u,l,c=0,f=e.length,p=t.createDocumentFragment(),h=[];for(;f>c;c++)if(i=e[c],i||0===i)if("object"===x.type(i))x.merge(h,i.nodeType?[i]:i);else if(nt.test(i)){o=o||p.appendChild(t.createElement("div")),s=(tt.exec(i)||["",""])[1].toLowerCase(),a=lt[s]||lt._default,o.innerHTML=a[1]+i.replace(et,"<$1></$2>")+a[2],l=a[0];while(l--)o=o.firstChild;x.merge(h,o.childNodes),o=p.firstChild,o.textContent=""}else h.push(t.createTextNode(i));p.textContent="",c=0;while(i=h[c++])if((!r||-1===x.inArray(i,r))&&(u=x.contains(i.ownerDocument,i),o=gt(p.appendChild(i),"script"),u&&ht(o),n)){l=0;while(i=o[l++])st.test(i.type||"")&&n.push(i)}return p},cleanData:function(e){var t,n,r,i=e.length,o=0,s=x.event.special;for(;i>o;o++){if(n=e[o],x.acceptData(n)&&(t=q.access(n)))for(r in t.events)s[r]?x.event.remove(n,r):x.removeEvent(n,r,t.handle);L.discard(n),q.discard(n)}},_evalUrl:function(e){return x.ajax({url:e,type:"GET",dataType:"text",async:!1,global:!1,success:x.globalEval})}});function ct(e,t){return x.nodeName(e,"table")&&x.nodeName(1===t.nodeType?t:t.firstChild,"tr")?e.getElementsByTagName("tbody")[0]||e.appendChild(e.ownerDocument.createElement("tbody")):e}function ft(e){return e.type=(null!==e.getAttribute("type"))+"/"+e.type,e}function pt(e){var t=at.exec(e.type);return t?e.type=t[1]:e.removeAttribute("type"),e}function ht(e,t){var n=e.length,r=0;for(;n>r;r++)q.set(e[r],"globalEval",!t||q.get(t[r],"globalEval"))}function dt(e,t){var n,r,i,o,s,a,u,l;if(1===t.nodeType){if(q.hasData(e)&&(o=q.access(e),s=x.extend({},o),l=o.events,q.set(t,s),l)){delete s.handle,s.events={};for(i in l)for(n=0,r=l[i].length;r>n;n++)x.event.add(t,i,l[i][n])}L.hasData(e)&&(a=L.access(e),u=x.extend({},a),L.set(t,u))}}function gt(e,t){var n=e.getElementsByTagName?e.getElementsByTagName(t||"*"):e.querySelectorAll?e.querySelectorAll(t||"*"):[];return t===undefined||t&&x.nodeName(e,t)?x.merge([e],n):n}function mt(e,t){var n=t.nodeName.toLowerCase();"input"===n&&it.test(e.type)?t.checked=e.checked:("input"===n||"textarea"===n)&&(t.defaultValue=e.defaultValue)}x.fn.extend({wrapAll:function(e){var t;return x.isFunction(e)?this.each(function(t){x(this).wrapAll(e.call(this,t))}):(this[0]&&(t=x(e,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){var e=this;while(e.firstElementChild)e=e.firstElementChild;return e}).append(this)),this)},wrapInner:function(e){return x.isFunction(e)?this.each(function(t){x(this).wrapInner(e.call(this,t))}):this.each(function(){var t=x(this),n=t.contents();n.length?n.wrapAll(e):t.append(e)})},wrap:function(e){var t=x.isFunction(e);return this.each(function(n){x(this).wrapAll(t?e.call(this,n):e)})},unwrap:function(){return this.parent().each(function(){x.nodeName(this,"body")||x(this).replaceWith(this.childNodes)}).end()}});var yt,vt,xt=/^(none|table(?!-c[ea]).+)/,bt=/^margin/,wt=RegExp("^("+b+")(.*)$","i"),Tt=RegExp("^("+b+")(?!px)[a-z%]+$","i"),Ct=RegExp("^([+-])=("+b+")","i"),kt={BODY:"block"},Nt={position:"absolute",visibility:"hidden",display:"block"},Et={letterSpacing:0,fontWeight:400},St=["Top","Right","Bottom","Left"],jt=["Webkit","O","Moz","ms"];function Dt(e,t){if(t in e)return t;var n=t.charAt(0).toUpperCase()+t.slice(1),r=t,i=jt.length;while(i--)if(t=jt[i]+n,t in e)return t;return r}function At(e,t){return e=t||e,"none"===x.css(e,"display")||!x.contains(e.ownerDocument,e)}function Lt(t){return e.getComputedStyle(t,null)}function qt(e,t){var n,r,i,o=[],s=0,a=e.length;for(;a>s;s++)r=e[s],r.style&&(o[s]=q.get(r,"olddisplay"),n=r.style.display,t?(o[s]||"none"!==n||(r.style.display=""),""===r.style.display&&At(r)&&(o[s]=q.access(r,"olddisplay",Pt(r.nodeName)))):o[s]||(i=At(r),(n&&"none"!==n||!i)&&q.set(r,"olddisplay",i?n:x.css(r,"display"))));for(s=0;a>s;s++)r=e[s],r.style&&(t&&"none"!==r.style.display&&""!==r.style.display||(r.style.display=t?o[s]||"":"none"));return e}x.fn.extend({css:function(e,t){return x.access(this,function(e,t,n){var r,i,o={},s=0;if(x.isArray(t)){for(r=Lt(e),i=t.length;i>s;s++)o[t[s]]=x.css(e,t[s],!1,r);return o}return n!==undefined?x.style(e,t,n):x.css(e,t)},e,t,arguments.length>1)},show:function(){return qt(this,!0)},hide:function(){return qt(this)},toggle:function(e){var t="boolean"==typeof e;return this.each(function(){(t?e:At(this))?x(this).show():x(this).hide()})}}),x.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=yt(e,"opacity");return""===n?"1":n}}}},cssNumber:{columnCount:!0,fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(e,t,n,r){if(e&&3!==e.nodeType&&8!==e.nodeType&&e.style){var i,o,s,a=x.camelCase(t),u=e.style;return t=x.cssProps[a]||(x.cssProps[a]=Dt(u,a)),s=x.cssHooks[t]||x.cssHooks[a],n===undefined?s&&"get"in s&&(i=s.get(e,!1,r))!==undefined?i:u[t]:(o=typeof n,"string"===o&&(i=Ct.exec(n))&&(n=(i[1]+1)*i[2]+parseFloat(x.css(e,t)),o="number"),null==n||"number"===o&&isNaN(n)||("number"!==o||x.cssNumber[a]||(n+="px"),x.support.clearCloneStyle||""!==n||0!==t.indexOf("background")||(u[t]="inherit"),s&&"set"in s&&(n=s.set(e,n,r))===undefined||(u[t]=n)),undefined)}},css:function(e,t,n,r){var i,o,s,a=x.camelCase(t);return t=x.cssProps[a]||(x.cssProps[a]=Dt(e.style,a)),s=x.cssHooks[t]||x.cssHooks[a],s&&"get"in s&&(i=s.get(e,!0,n)),i===undefined&&(i=yt(e,t,r)),"normal"===i&&t in Et&&(i=Et[t]),""===n||n?(o=parseFloat(i),n===!0||x.isNumeric(o)?o||0:i):i}}),yt=function(e,t,n){var r,i,o,s=n||Lt(e),a=s?s.getPropertyValue(t)||s[t]:undefined,u=e.style;return s&&(""!==a||x.contains(e.ownerDocument,e)||(a=x.style(e,t)),Tt.test(a)&&bt.test(t)&&(r=u.width,i=u.minWidth,o=u.maxWidth,u.minWidth=u.maxWidth=u.width=a,a=s.width,u.width=r,u.minWidth=i,u.maxWidth=o)),a};function Ht(e,t,n){var r=wt.exec(t);return r?Math.max(0,r[1]-(n||0))+(r[2]||"px"):t}function Ot(e,t,n,r,i){var o=n===(r?"border":"content")?4:"width"===t?1:0,s=0;for(;4>o;o+=2)"margin"===n&&(s+=x.css(e,n+St[o],!0,i)),r?("content"===n&&(s-=x.css(e,"padding"+St[o],!0,i)),"margin"!==n&&(s-=x.css(e,"border"+St[o]+"Width",!0,i))):(s+=x.css(e,"padding"+St[o],!0,i),"padding"!==n&&(s+=x.css(e,"border"+St[o]+"Width",!0,i)));return s}function Ft(e,t,n){var r=!0,i="width"===t?e.offsetWidth:e.offsetHeight,o=Lt(e),s=x.support.boxSizing&&"border-box"===x.css(e,"boxSizing",!1,o);if(0>=i||null==i){if(i=yt(e,t,o),(0>i||null==i)&&(i=e.style[t]),Tt.test(i))return i;r=s&&(x.support.boxSizingReliable||i===e.style[t]),i=parseFloat(i)||0}return i+Ot(e,t,n||(s?"border":"content"),r,o)+"px"}function Pt(e){var t=o,n=kt[e];return n||(n=Rt(e,t),"none"!==n&&n||(vt=(vt||x("<iframe frameborder='0' width='0' height='0'/>").css("cssText","display:block !important")).appendTo(t.documentElement),t=(vt[0].contentWindow||vt[0].contentDocument).document,t.write("<!doctype html><html><body>"),t.close(),n=Rt(e,t),vt.detach()),kt[e]=n),n}function Rt(e,t){var n=x(t.createElement(e)).appendTo(t.body),r=x.css(n[0],"display");return n.remove(),r}x.each(["height","width"],function(e,t){x.cssHooks[t]={get:function(e,n,r){return n?0===e.offsetWidth&&xt.test(x.css(e,"display"))?x.swap(e,Nt,function(){return Ft(e,t,r)}):Ft(e,t,r):undefined},set:function(e,n,r){var i=r&&Lt(e);return Ht(e,n,r?Ot(e,t,r,x.support.boxSizing&&"border-box"===x.css(e,"boxSizing",!1,i),i):0)}}}),x(function(){x.support.reliableMarginRight||(x.cssHooks.marginRight={get:function(e,t){return t?x.swap(e,{display:"inline-block"},yt,[e,"marginRight"]):undefined}}),!x.support.pixelPosition&&x.fn.position&&x.each(["top","left"],function(e,t){x.cssHooks[t]={get:function(e,n){return n?(n=yt(e,t),Tt.test(n)?x(e).position()[t]+"px":n):undefined}}})}),x.expr&&x.expr.filters&&(x.expr.filters.hidden=function(e){return 0>=e.offsetWidth&&0>=e.offsetHeight},x.expr.filters.visible=function(e){return!x.expr.filters.hidden(e)}),x.each({margin:"",padding:"",border:"Width"},function(e,t){x.cssHooks[e+t]={expand:function(n){var r=0,i={},o="string"==typeof n?n.split(" "):[n];for(;4>r;r++)i[e+St[r]+t]=o[r]||o[r-2]||o[0];return i}},bt.test(e)||(x.cssHooks[e+t].set=Ht)});var Mt=/%20/g,Wt=/\[\]$/,$t=/\r?\n/g,Bt=/^(?:submit|button|image|reset|file)$/i,It=/^(?:input|select|textarea|keygen)/i;x.fn.extend({serialize:function(){return x.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=x.prop(this,"elements");return e?x.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!x(this).is(":disabled")&&It.test(this.nodeName)&&!Bt.test(e)&&(this.checked||!it.test(e))}).map(function(e,t){var n=x(this).val();return null==n?null:x.isArray(n)?x.map(n,function(e){return{name:t.name,value:e.replace($t,"\r\n")}}):{name:t.name,value:n.replace($t,"\r\n")}}).get()}}),x.param=function(e,t){var n,r=[],i=function(e,t){t=x.isFunction(t)?t():null==t?"":t,r[r.length]=encodeURIComponent(e)+"="+encodeURIComponent(t)};if(t===undefined&&(t=x.ajaxSettings&&x.ajaxSettings.traditional),x.isArray(e)||e.jquery&&!x.isPlainObject(e))x.each(e,function(){i(this.name,this.value)});else for(n in e)zt(n,e[n],t,i);return r.join("&").replace(Mt,"+")};function zt(e,t,n,r){var i;if(x.isArray(t))x.each(t,function(t,i){n||Wt.test(e)?r(e,i):zt(e+"["+("object"==typeof i?t:"")+"]",i,n,r)});else if(n||"object"!==x.type(t))r(e,t);else for(i in t)zt(e+"["+i+"]",t[i],n,r)}x.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(e,t){x.fn[t]=function(e,n){return arguments.length>0?this.on(t,null,e,n):this.trigger(t)}}),x.fn.extend({hover:function(e,t){return this.mouseenter(e).mouseleave(t||e)},bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return 1===arguments.length?this.off(e,"**"):this.off(t,e||"**",n)}});var _t,Xt,Ut=x.now(),Yt=/\?/,Vt=/#.*$/,Gt=/([?&])_=[^&]*/,Jt=/^(.*?):[ \t]*([^\r\n]*)$/gm,Qt=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,Kt=/^(?:GET|HEAD)$/,Zt=/^\/\//,en=/^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,tn=x.fn.load,nn={},rn={},on="*/".concat("*");try{Xt=i.href}catch(sn){Xt=o.createElement("a"),Xt.href="",Xt=Xt.href}_t=en.exec(Xt.toLowerCase())||[];function an(e){return function(t,n){"string"!=typeof t&&(n=t,t="*");var r,i=0,o=t.toLowerCase().match(w)||[];
if(x.isFunction(n))while(r=o[i++])"+"===r[0]?(r=r.slice(1)||"*",(e[r]=e[r]||[]).unshift(n)):(e[r]=e[r]||[]).push(n)}}function un(e,t,n,r){var i={},o=e===rn;function s(a){var u;return i[a]=!0,x.each(e[a]||[],function(e,a){var l=a(t,n,r);return"string"!=typeof l||o||i[l]?o?!(u=l):undefined:(t.dataTypes.unshift(l),s(l),!1)}),u}return s(t.dataTypes[0])||!i["*"]&&s("*")}function ln(e,t){var n,r,i=x.ajaxSettings.flatOptions||{};for(n in t)t[n]!==undefined&&((i[n]?e:r||(r={}))[n]=t[n]);return r&&x.extend(!0,e,r),e}x.fn.load=function(e,t,n){if("string"!=typeof e&&tn)return tn.apply(this,arguments);var r,i,o,s=this,a=e.indexOf(" ");return a>=0&&(r=e.slice(a),e=e.slice(0,a)),x.isFunction(t)?(n=t,t=undefined):t&&"object"==typeof t&&(i="POST"),s.length>0&&x.ajax({url:e,type:i,dataType:"html",data:t}).done(function(e){o=arguments,s.html(r?x("<div>").append(x.parseHTML(e)).find(r):e)}).complete(n&&function(e,t){s.each(n,o||[e.responseText,t,e])}),this},x.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){x.fn[t]=function(e){return this.on(t,e)}}),x.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:Xt,type:"GET",isLocal:Qt.test(_t[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":on,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":x.parseJSON,"text xml":x.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?ln(ln(e,x.ajaxSettings),t):ln(x.ajaxSettings,e)},ajaxPrefilter:an(nn),ajaxTransport:an(rn),ajax:function(e,t){"object"==typeof e&&(t=e,e=undefined),t=t||{};var n,r,i,o,s,a,u,l,c=x.ajaxSetup({},t),f=c.context||c,p=c.context&&(f.nodeType||f.jquery)?x(f):x.event,h=x.Deferred(),d=x.Callbacks("once memory"),g=c.statusCode||{},m={},y={},v=0,b="canceled",T={readyState:0,getResponseHeader:function(e){var t;if(2===v){if(!o){o={};while(t=Jt.exec(i))o[t[1].toLowerCase()]=t[2]}t=o[e.toLowerCase()]}return null==t?null:t},getAllResponseHeaders:function(){return 2===v?i:null},setRequestHeader:function(e,t){var n=e.toLowerCase();return v||(e=y[n]=y[n]||e,m[e]=t),this},overrideMimeType:function(e){return v||(c.mimeType=e),this},statusCode:function(e){var t;if(e)if(2>v)for(t in e)g[t]=[g[t],e[t]];else T.always(e[T.status]);return this},abort:function(e){var t=e||b;return n&&n.abort(t),k(0,t),this}};if(h.promise(T).complete=d.add,T.success=T.done,T.error=T.fail,c.url=((e||c.url||Xt)+"").replace(Vt,"").replace(Zt,_t[1]+"//"),c.type=t.method||t.type||c.method||c.type,c.dataTypes=x.trim(c.dataType||"*").toLowerCase().match(w)||[""],null==c.crossDomain&&(a=en.exec(c.url.toLowerCase()),c.crossDomain=!(!a||a[1]===_t[1]&&a[2]===_t[2]&&(a[3]||("http:"===a[1]?"80":"443"))===(_t[3]||("http:"===_t[1]?"80":"443")))),c.data&&c.processData&&"string"!=typeof c.data&&(c.data=x.param(c.data,c.traditional)),un(nn,c,t,T),2===v)return T;u=c.global,u&&0===x.active++&&x.event.trigger("ajaxStart"),c.type=c.type.toUpperCase(),c.hasContent=!Kt.test(c.type),r=c.url,c.hasContent||(c.data&&(r=c.url+=(Yt.test(r)?"&":"?")+c.data,delete c.data),c.cache===!1&&(c.url=Gt.test(r)?r.replace(Gt,"$1_="+Ut++):r+(Yt.test(r)?"&":"?")+"_="+Ut++)),c.ifModified&&(x.lastModified[r]&&T.setRequestHeader("If-Modified-Since",x.lastModified[r]),x.etag[r]&&T.setRequestHeader("If-None-Match",x.etag[r])),(c.data&&c.hasContent&&c.contentType!==!1||t.contentType)&&T.setRequestHeader("Content-Type",c.contentType),T.setRequestHeader("Accept",c.dataTypes[0]&&c.accepts[c.dataTypes[0]]?c.accepts[c.dataTypes[0]]+("*"!==c.dataTypes[0]?", "+on+"; q=0.01":""):c.accepts["*"]);for(l in c.headers)T.setRequestHeader(l,c.headers[l]);if(c.beforeSend&&(c.beforeSend.call(f,T,c)===!1||2===v))return T.abort();b="abort";for(l in{success:1,error:1,complete:1})T[l](c[l]);if(n=un(rn,c,t,T)){T.readyState=1,u&&p.trigger("ajaxSend",[T,c]),c.async&&c.timeout>0&&(s=setTimeout(function(){T.abort("timeout")},c.timeout));try{v=1,n.send(m,k)}catch(C){if(!(2>v))throw C;k(-1,C)}}else k(-1,"No Transport");function k(e,t,o,a){var l,m,y,b,w,C=t;2!==v&&(v=2,s&&clearTimeout(s),n=undefined,i=a||"",T.readyState=e>0?4:0,l=e>=200&&300>e||304===e,o&&(b=cn(c,T,o)),b=fn(c,b,T,l),l?(c.ifModified&&(w=T.getResponseHeader("Last-Modified"),w&&(x.lastModified[r]=w),w=T.getResponseHeader("etag"),w&&(x.etag[r]=w)),204===e?C="nocontent":304===e?C="notmodified":(C=b.state,m=b.data,y=b.error,l=!y)):(y=C,(e||!C)&&(C="error",0>e&&(e=0))),T.status=e,T.statusText=(t||C)+"",l?h.resolveWith(f,[m,C,T]):h.rejectWith(f,[T,C,y]),T.statusCode(g),g=undefined,u&&p.trigger(l?"ajaxSuccess":"ajaxError",[T,c,l?m:y]),d.fireWith(f,[T,C]),u&&(p.trigger("ajaxComplete",[T,c]),--x.active||x.event.trigger("ajaxStop")))}return T},getJSON:function(e,t,n){return x.get(e,t,n,"json")},getScript:function(e,t){return x.get(e,undefined,t,"script")}}),x.each(["get","post"],function(e,t){x[t]=function(e,n,r,i){return x.isFunction(n)&&(i=i||r,r=n,n=undefined),x.ajax({url:e,type:t,dataType:i,data:n,success:r})}});function cn(e,t,n){var r,i,o,s,a=e.contents,u=e.dataTypes;while("*"===u[0])u.shift(),r===undefined&&(r=e.mimeType||t.getResponseHeader("Content-Type"));if(r)for(i in a)if(a[i]&&a[i].test(r)){u.unshift(i);break}if(u[0]in n)o=u[0];else{for(i in n){if(!u[0]||e.converters[i+" "+u[0]]){o=i;break}s||(s=i)}o=o||s}return o?(o!==u[0]&&u.unshift(o),n[o]):undefined}function fn(e,t,n,r){var i,o,s,a,u,l={},c=e.dataTypes.slice();if(c[1])for(s in e.converters)l[s.toLowerCase()]=e.converters[s];o=c.shift();while(o)if(e.responseFields[o]&&(n[e.responseFields[o]]=t),!u&&r&&e.dataFilter&&(t=e.dataFilter(t,e.dataType)),u=o,o=c.shift())if("*"===o)o=u;else if("*"!==u&&u!==o){if(s=l[u+" "+o]||l["* "+o],!s)for(i in l)if(a=i.split(" "),a[1]===o&&(s=l[u+" "+a[0]]||l["* "+a[0]])){s===!0?s=l[i]:l[i]!==!0&&(o=a[0],c.unshift(a[1]));break}if(s!==!0)if(s&&e["throws"])t=s(t);else try{t=s(t)}catch(f){return{state:"parsererror",error:s?f:"No conversion from "+u+" to "+o}}}return{state:"success",data:t}}x.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(e){return x.globalEval(e),e}}}),x.ajaxPrefilter("script",function(e){e.cache===undefined&&(e.cache=!1),e.crossDomain&&(e.type="GET")}),x.ajaxTransport("script",function(e){if(e.crossDomain){var t,n;return{send:function(r,i){t=x("<script>").prop({async:!0,charset:e.scriptCharset,src:e.url}).on("load error",n=function(e){t.remove(),n=null,e&&i("error"===e.type?404:200,e.type)}),o.head.appendChild(t[0])},abort:function(){n&&n()}}}});var pn=[],hn=/(=)\?(?=&|$)|\?\?/;x.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=pn.pop()||x.expando+"_"+Ut++;return this[e]=!0,e}}),x.ajaxPrefilter("json jsonp",function(t,n,r){var i,o,s,a=t.jsonp!==!1&&(hn.test(t.url)?"url":"string"==typeof t.data&&!(t.contentType||"").indexOf("application/x-www-form-urlencoded")&&hn.test(t.data)&&"data");return a||"jsonp"===t.dataTypes[0]?(i=t.jsonpCallback=x.isFunction(t.jsonpCallback)?t.jsonpCallback():t.jsonpCallback,a?t[a]=t[a].replace(hn,"$1"+i):t.jsonp!==!1&&(t.url+=(Yt.test(t.url)?"&":"?")+t.jsonp+"="+i),t.converters["script json"]=function(){return s||x.error(i+" was not called"),s[0]},t.dataTypes[0]="json",o=e[i],e[i]=function(){s=arguments},r.always(function(){e[i]=o,t[i]&&(t.jsonpCallback=n.jsonpCallback,pn.push(i)),s&&x.isFunction(o)&&o(s[0]),s=o=undefined}),"script"):undefined}),x.ajaxSettings.xhr=function(){try{return new XMLHttpRequest}catch(e){}};var dn=x.ajaxSettings.xhr(),gn={0:200,1223:204},mn=0,yn={};e.ActiveXObject&&x(e).on("unload",function(){for(var e in yn)yn[e]();yn=undefined}),x.support.cors=!!dn&&"withCredentials"in dn,x.support.ajax=dn=!!dn,x.ajaxTransport(function(e){var t;return x.support.cors||dn&&!e.crossDomain?{send:function(n,r){var i,o,s=e.xhr();if(s.open(e.type,e.url,e.async,e.username,e.password),e.xhrFields)for(i in e.xhrFields)s[i]=e.xhrFields[i];e.mimeType&&s.overrideMimeType&&s.overrideMimeType(e.mimeType),e.crossDomain||n["X-Requested-With"]||(n["X-Requested-With"]="XMLHttpRequest");for(i in n)s.setRequestHeader(i,n[i]);t=function(e){return function(){t&&(delete yn[o],t=s.onload=s.onerror=null,"abort"===e?s.abort():"error"===e?r(s.status||404,s.statusText):r(gn[s.status]||s.status,s.statusText,"string"==typeof s.responseText?{text:s.responseText}:undefined,s.getAllResponseHeaders()))}},s.onload=t(),s.onerror=t("error"),t=yn[o=mn++]=t("abort"),s.send(e.hasContent&&e.data||null)},abort:function(){t&&t()}}:undefined});var vn,xn,bn=/^(?:toggle|show|hide)$/,wn=RegExp("^(?:([+-])=|)("+b+")([a-z%]*)$","i"),Tn=/queueHooks$/,Cn=[Dn],kn={"*":[function(e,t){var n,r,i=this.createTween(e,t),o=wn.exec(t),s=i.cur(),a=+s||0,u=1,l=20;if(o){if(n=+o[2],r=o[3]||(x.cssNumber[e]?"":"px"),"px"!==r&&a){a=x.css(i.elem,e,!0)||n||1;do u=u||".5",a/=u,x.style(i.elem,e,a+r);while(u!==(u=i.cur()/s)&&1!==u&&--l)}i.unit=r,i.start=a,i.end=o[1]?a+(o[1]+1)*n:n}return i}]};function Nn(){return setTimeout(function(){vn=undefined}),vn=x.now()}function En(e,t){x.each(t,function(t,n){var r=(kn[t]||[]).concat(kn["*"]),i=0,o=r.length;for(;o>i;i++)if(r[i].call(e,t,n))return})}function Sn(e,t,n){var r,i,o=0,s=Cn.length,a=x.Deferred().always(function(){delete u.elem}),u=function(){if(i)return!1;var t=vn||Nn(),n=Math.max(0,l.startTime+l.duration-t),r=n/l.duration||0,o=1-r,s=0,u=l.tweens.length;for(;u>s;s++)l.tweens[s].run(o);return a.notifyWith(e,[l,o,n]),1>o&&u?n:(a.resolveWith(e,[l]),!1)},l=a.promise({elem:e,props:x.extend({},t),opts:x.extend(!0,{specialEasing:{}},n),originalProperties:t,originalOptions:n,startTime:vn||Nn(),duration:n.duration,tweens:[],createTween:function(t,n){var r=x.Tween(e,l.opts,t,n,l.opts.specialEasing[t]||l.opts.easing);return l.tweens.push(r),r},stop:function(t){var n=0,r=t?l.tweens.length:0;if(i)return this;for(i=!0;r>n;n++)l.tweens[n].run(1);return t?a.resolveWith(e,[l,t]):a.rejectWith(e,[l,t]),this}}),c=l.props;for(jn(c,l.opts.specialEasing);s>o;o++)if(r=Cn[o].call(l,e,c,l.opts))return r;return En(l,c),x.isFunction(l.opts.start)&&l.opts.start.call(e,l),x.fx.timer(x.extend(u,{elem:e,anim:l,queue:l.opts.queue})),l.progress(l.opts.progress).done(l.opts.done,l.opts.complete).fail(l.opts.fail).always(l.opts.always)}function jn(e,t){var n,r,i,o,s;for(n in e)if(r=x.camelCase(n),i=t[r],o=e[n],x.isArray(o)&&(i=o[1],o=e[n]=o[0]),n!==r&&(e[r]=o,delete e[n]),s=x.cssHooks[r],s&&"expand"in s){o=s.expand(o),delete e[r];for(n in o)n in e||(e[n]=o[n],t[n]=i)}else t[r]=i}x.Animation=x.extend(Sn,{tweener:function(e,t){x.isFunction(e)?(t=e,e=["*"]):e=e.split(" ");var n,r=0,i=e.length;for(;i>r;r++)n=e[r],kn[n]=kn[n]||[],kn[n].unshift(t)},prefilter:function(e,t){t?Cn.unshift(e):Cn.push(e)}});function Dn(e,t,n){var r,i,o,s,a,u,l,c,f,p=this,h=e.style,d={},g=[],m=e.nodeType&&At(e);n.queue||(c=x._queueHooks(e,"fx"),null==c.unqueued&&(c.unqueued=0,f=c.empty.fire,c.empty.fire=function(){c.unqueued||f()}),c.unqueued++,p.always(function(){p.always(function(){c.unqueued--,x.queue(e,"fx").length||c.empty.fire()})})),1===e.nodeType&&("height"in t||"width"in t)&&(n.overflow=[h.overflow,h.overflowX,h.overflowY],"inline"===x.css(e,"display")&&"none"===x.css(e,"float")&&(h.display="inline-block")),n.overflow&&(h.overflow="hidden",p.always(function(){h.overflow=n.overflow[0],h.overflowX=n.overflow[1],h.overflowY=n.overflow[2]})),a=q.get(e,"fxshow");for(r in t)if(o=t[r],bn.exec(o)){if(delete t[r],u=u||"toggle"===o,o===(m?"hide":"show")){if("show"!==o||a===undefined||a[r]===undefined)continue;m=!0}g.push(r)}if(s=g.length){a=q.get(e,"fxshow")||q.access(e,"fxshow",{}),"hidden"in a&&(m=a.hidden),u&&(a.hidden=!m),m?x(e).show():p.done(function(){x(e).hide()}),p.done(function(){var t;q.remove(e,"fxshow");for(t in d)x.style(e,t,d[t])});for(r=0;s>r;r++)i=g[r],l=p.createTween(i,m?a[i]:0),d[i]=a[i]||x.style(e,i),i in a||(a[i]=l.start,m&&(l.end=l.start,l.start="width"===i||"height"===i?1:0))}}function An(e,t,n,r,i){return new An.prototype.init(e,t,n,r,i)}x.Tween=An,An.prototype={constructor:An,init:function(e,t,n,r,i,o){this.elem=e,this.prop=n,this.easing=i||"swing",this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=o||(x.cssNumber[n]?"":"px")},cur:function(){var e=An.propHooks[this.prop];return e&&e.get?e.get(this):An.propHooks._default.get(this)},run:function(e){var t,n=An.propHooks[this.prop];return this.pos=t=this.options.duration?x.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):An.propHooks._default.set(this),this}},An.prototype.init.prototype=An.prototype,An.propHooks={_default:{get:function(e){var t;return null==e.elem[e.prop]||e.elem.style&&null!=e.elem.style[e.prop]?(t=x.css(e.elem,e.prop,""),t&&"auto"!==t?t:0):e.elem[e.prop]},set:function(e){x.fx.step[e.prop]?x.fx.step[e.prop](e):e.elem.style&&(null!=e.elem.style[x.cssProps[e.prop]]||x.cssHooks[e.prop])?x.style(e.elem,e.prop,e.now+e.unit):e.elem[e.prop]=e.now}}},An.propHooks.scrollTop=An.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},x.each(["toggle","show","hide"],function(e,t){var n=x.fn[t];x.fn[t]=function(e,r,i){return null==e||"boolean"==typeof e?n.apply(this,arguments):this.animate(Ln(t,!0),e,r,i)}}),x.fn.extend({fadeTo:function(e,t,n,r){return this.filter(At).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(e,t,n,r){var i=x.isEmptyObject(e),o=x.speed(t,n,r),s=function(){var t=Sn(this,x.extend({},e),o);s.finish=function(){t.stop(!0)},(i||q.get(this,"finish"))&&t.stop(!0)};return s.finish=s,i||o.queue===!1?this.each(s):this.queue(o.queue,s)},stop:function(e,t,n){var r=function(e){var t=e.stop;delete e.stop,t(n)};return"string"!=typeof e&&(n=t,t=e,e=undefined),t&&e!==!1&&this.queue(e||"fx",[]),this.each(function(){var t=!0,i=null!=e&&e+"queueHooks",o=x.timers,s=q.get(this);if(i)s[i]&&s[i].stop&&r(s[i]);else for(i in s)s[i]&&s[i].stop&&Tn.test(i)&&r(s[i]);for(i=o.length;i--;)o[i].elem!==this||null!=e&&o[i].queue!==e||(o[i].anim.stop(n),t=!1,o.splice(i,1));(t||!n)&&x.dequeue(this,e)})},finish:function(e){return e!==!1&&(e=e||"fx"),this.each(function(){var t,n=q.get(this),r=n[e+"queue"],i=n[e+"queueHooks"],o=x.timers,s=r?r.length:0;for(n.finish=!0,x.queue(this,e,[]),i&&i.cur&&i.cur.finish&&i.cur.finish.call(this),t=o.length;t--;)o[t].elem===this&&o[t].queue===e&&(o[t].anim.stop(!0),o.splice(t,1));for(t=0;s>t;t++)r[t]&&r[t].finish&&r[t].finish.call(this);delete n.finish})}});function Ln(e,t){var n,r={height:e},i=0;for(t=t?1:0;4>i;i+=2-t)n=St[i],r["margin"+n]=r["padding"+n]=e;return t&&(r.opacity=r.width=e),r}x.each({slideDown:Ln("show"),slideUp:Ln("hide"),slideToggle:Ln("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,t){x.fn[e]=function(e,n,r){return this.animate(t,e,n,r)}}),x.speed=function(e,t,n){var r=e&&"object"==typeof e?x.extend({},e):{complete:n||!n&&t||x.isFunction(e)&&e,duration:e,easing:n&&t||t&&!x.isFunction(t)&&t};return r.duration=x.fx.off?0:"number"==typeof r.duration?r.duration:r.duration in x.fx.speeds?x.fx.speeds[r.duration]:x.fx.speeds._default,(null==r.queue||r.queue===!0)&&(r.queue="fx"),r.old=r.complete,r.complete=function(){x.isFunction(r.old)&&r.old.call(this),r.queue&&x.dequeue(this,r.queue)},r},x.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2}},x.timers=[],x.fx=An.prototype.init,x.fx.tick=function(){var e,t=x.timers,n=0;for(vn=x.now();t.length>n;n++)e=t[n],e()||t[n]!==e||t.splice(n--,1);t.length||x.fx.stop(),vn=undefined},x.fx.timer=function(e){e()&&x.timers.push(e)&&x.fx.start()},x.fx.interval=13,x.fx.start=function(){xn||(xn=setInterval(x.fx.tick,x.fx.interval))},x.fx.stop=function(){clearInterval(xn),xn=null},x.fx.speeds={slow:600,fast:200,_default:400},x.fx.step={},x.expr&&x.expr.filters&&(x.expr.filters.animated=function(e){return x.grep(x.timers,function(t){return e===t.elem}).length}),x.fn.offset=function(e){if(arguments.length)return e===undefined?this:this.each(function(t){x.offset.setOffset(this,e,t)});var t,n,i=this[0],o={top:0,left:0},s=i&&i.ownerDocument;if(s)return t=s.documentElement,x.contains(t,i)?(typeof i.getBoundingClientRect!==r&&(o=i.getBoundingClientRect()),n=qn(s),{top:o.top+n.pageYOffset-t.clientTop,left:o.left+n.pageXOffset-t.clientLeft}):o},x.offset={setOffset:function(e,t,n){var r,i,o,s,a,u,l,c=x.css(e,"position"),f=x(e),p={};"static"===c&&(e.style.position="relative"),a=f.offset(),o=x.css(e,"top"),u=x.css(e,"left"),l=("absolute"===c||"fixed"===c)&&(o+u).indexOf("auto")>-1,l?(r=f.position(),s=r.top,i=r.left):(s=parseFloat(o)||0,i=parseFloat(u)||0),x.isFunction(t)&&(t=t.call(e,n,a)),null!=t.top&&(p.top=t.top-a.top+s),null!=t.left&&(p.left=t.left-a.left+i),"using"in t?t.using.call(e,p):f.css(p)}},x.fn.extend({position:function(){if(this[0]){var e,t,n=this[0],r={top:0,left:0};return"fixed"===x.css(n,"position")?t=n.getBoundingClientRect():(e=this.offsetParent(),t=this.offset(),x.nodeName(e[0],"html")||(r=e.offset()),r.top+=x.css(e[0],"borderTopWidth",!0),r.left+=x.css(e[0],"borderLeftWidth",!0)),{top:t.top-r.top-x.css(n,"marginTop",!0),left:t.left-r.left-x.css(n,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var e=this.offsetParent||s;while(e&&!x.nodeName(e,"html")&&"static"===x.css(e,"position"))e=e.offsetParent;return e||s})}}),x.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(t,n){var r="pageYOffset"===n;x.fn[t]=function(i){return x.access(this,function(t,i,o){var s=qn(t);return o===undefined?s?s[n]:t[i]:(s?s.scrollTo(r?e.pageXOffset:o,r?o:e.pageYOffset):t[i]=o,undefined)},t,i,arguments.length,null)}});function qn(e){return x.isWindow(e)?e:9===e.nodeType&&e.defaultView}x.each({Height:"height",Width:"width"},function(e,t){x.each({padding:"inner"+e,content:t,"":"outer"+e},function(n,r){x.fn[r]=function(r,i){var o=arguments.length&&(n||"boolean"!=typeof r),s=n||(r===!0||i===!0?"margin":"border");return x.access(this,function(t,n,r){var i;return x.isWindow(t)?t.document.documentElement["client"+e]:9===t.nodeType?(i=t.documentElement,Math.max(t.body["scroll"+e],i["scroll"+e],t.body["offset"+e],i["offset"+e],i["client"+e])):r===undefined?x.css(t,n,s):x.style(t,n,r,s)},t,o?r:undefined,o,null)}})}),x.fn.size=function(){return this.length},x.fn.andSelf=x.fn.addBack,"object"==typeof module&&"object"==typeof module.exports?module.exports=x:"function"==typeof define&&define.amd&&define("jquery",[],function(){return x}),"object"==typeof e&&"object"==typeof e.document&&(e.jQuery=e.$=x)})(window);
/*PouchDB*/
(function() {
 // BEGIN Math.uuid.js

/*!
Math.uuid.js (v1.4)
http://www.broofa.com
mailto:robert@broofa.com

Copyright (c) 2010 Robert Kieffer
Dual licensed under the MIT and GPL licenses.
*/

/*
 * Generate a random uuid.
 *
 * USAGE: Math.uuid(length, radix)
 *   length - the desired number of characters
 *   radix  - the number of allowable values for each character.
 *
 * EXAMPLES:
 *   // No arguments  - returns RFC4122, version 4 ID
 *   >>> Math.uuid()
 *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
 *
 *   // One argument - returns ID of the specified length
 *   >>> Math.uuid(15)     // 15 character ID (default base=62)
 *   "VcydxgltxrVZSTV"
 *
 *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
 *   "01001010"
 *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
 *   "47473046"
 *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
 *   "098F4D35"
 */
(function() {
  // Private array of chars to use
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

  Math.uuid = function (len, radix) {
    var chars = CHARS, uuid = [];
    radix = radix || chars.length;

    if (len) {
      // Compact form
      for (var i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (var i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }

    return uuid.join('');
  };

  // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
  // by minimizing calls to random()
  Math.uuidFast = function() {
    var chars = CHARS, uuid = new Array(36), rnd=0, r;
    for (var i = 0; i < 36; i++) {
      if (i==8 || i==13 ||  i==18 || i==23) {
        uuid[i] = '-';
      } else if (i==14) {
        uuid[i] = '4';
      } else {
        if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
        r = rnd & 0xf;
        rnd = rnd >> 4;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
    return uuid.join('');
  };

  // A more compact, but less performant, RFC4122v4 solution:
  Math.uuidCompact = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    }).toUpperCase();
  };
})();

// END Math.uuid.js

/**
*
*  MD5 (Message-Digest Algorithm)
*
*  For original source see http://www.webtoolkit.info/
*  Download: 15.02.2009 from http://www.webtoolkit.info/javascript-md5.html
*
*  Licensed under CC-BY 2.0 License
*  (http://creativecommons.org/licenses/by/2.0/uk/)
*
**/

var Crypto = {};
(function() {
  Crypto.MD5 = function(string) {

    function RotateLeft(lValue, iShiftBits) {
      return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    }

    function AddUnsigned(lX,lY) {
      var lX4,lY4,lX8,lY8,lResult;
      lX8 = (lX & 0x80000000);
      lY8 = (lY & 0x80000000);
      lX4 = (lX & 0x40000000);
      lY4 = (lY & 0x40000000);
      lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
      if (lX4 & lY4) {
        return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
      }
      if (lX4 | lY4) {
        if (lResult & 0x40000000) {
          return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
        } else {
          return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        }
      } else {
        return (lResult ^ lX8 ^ lY8);
      }
    }

    function F(x,y,z) { return (x & y) | ((~x) & z); }
    function G(x,y,z) { return (x & z) | (y & (~z)); }
    function H(x,y,z) { return (x ^ y ^ z); }
    function I(x,y,z) { return (y ^ (x | (~z))); }

    function FF(a,b,c,d,x,s,ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    };

    function GG(a,b,c,d,x,s,ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    };

    function HH(a,b,c,d,x,s,ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    };

    function II(a,b,c,d,x,s,ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    };

    function ConvertToWordArray(string) {
      var lWordCount;
      var lMessageLength = string.length;
      var lNumberOfWords_temp1=lMessageLength + 8;
      var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
      var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
      var lWordArray=Array(lNumberOfWords-1);
      var lBytePosition = 0;
      var lByteCount = 0;
      while ( lByteCount < lMessageLength ) {
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
        lByteCount++;
      }
      lWordCount = (lByteCount-(lByteCount % 4))/4;
      lBytePosition = (lByteCount % 4)*8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
      lWordArray[lNumberOfWords-2] = lMessageLength<<3;
      lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
      return lWordArray;
    };

    function WordToHex(lValue) {
      var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
      for (lCount = 0;lCount<=3;lCount++) {
        lByte = (lValue>>>(lCount*8)) & 255;
        WordToHexValue_temp = "0" + lByte.toString(16);
        WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
      }
      return WordToHexValue;
    };

    //**  function Utf8Encode(string) removed. Aready defined in pidcrypt_utils.js

    var x=Array();
    var k,AA,BB,CC,DD,a,b,c,d;
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;

    //  string = Utf8Encode(string); #function call removed

    x = ConvertToWordArray(string);

    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

    for (k=0;k<x.length;k+=16) {
      AA=a; BB=b; CC=c; DD=d;
      a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
      d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
      c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
      b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
      a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
      d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
      c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
      b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
      a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
      d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
      c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
      b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
      a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
      d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
      c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
      b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
      a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
      d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
      c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
      b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
      a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
      d=GG(d,a,b,c,x[k+10],S22,0x2441453);
      c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
      b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
      a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
      d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
      c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
      b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
      a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
      d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
      c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
      b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
      a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
      d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
      c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
      b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
      a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
      d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
      c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
      b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
      a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
      d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
      c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
      b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
      a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
      d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
      c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
      b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
      a=II(a,b,c,d,x[k+0], S41,0xF4292244);
      d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
      c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
      b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
      a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
      d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
      c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
      b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
      a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
      d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
      c=II(c,d,a,b,x[k+6], S43,0xA3014314);
      b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
      a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
      d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
      c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
      b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
      a=AddUnsigned(a,AA);
      b=AddUnsigned(b,BB);
      c=AddUnsigned(c,CC);
      d=AddUnsigned(d,DD);
    }
    var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
    return temp.toLowerCase();
  }
})();

// END Crypto.md5.js

//----------------------------------------------------------------------
//
// ECMAScript 5 Polyfills
//  from www.calocomrmen./polyfill/
//
//----------------------------------------------------------------------

//----------------------------------------------------------------------
// ES5 15.2 Object Objects
//----------------------------------------------------------------------



// ES 15.2.3.6 Object.defineProperty ( O, P, Attributes )
// Partial support for most common case - getters, setters, and values
(function() {
  if (!Object.defineProperty ||
      !(function () { try { Object.defineProperty({}, 'x', {}); return true; } catch (e) { return false; } } ())) {
    var orig = Object.defineProperty;
    Object.defineProperty = function (o, prop, desc) {
      

      // In IE8 try built-in implementation for defining properties on DOM prototypes.
      if (orig) { try { return orig(o, prop, desc); } catch (e) {} }

      if (o !== Object(o)) { throw new TypeError("Object.defineProperty called on non-object"); }
      if (Object.prototype.__defineGetter__ && ('get' in desc)) {
        Object.prototype.__defineGetter__.call(o, prop, desc.get);
      }
      if (Object.prototype.__defineSetter__ && ('set' in desc)) {
        Object.prototype.__defineSetter__.call(o, prop, desc.set);
      }
      if ('value' in desc) {
        o[prop] = desc.value;
      }
      return o;
    };
  }
}());



// ES5 15.2.3.14 Object.keys ( O )
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = function (o) {
    if (o !== Object(o)) { throw new TypeError('Object.keys called on non-object'); }
    var ret = [], p;
    for (p in o) {
      if (Object.prototype.hasOwnProperty.call(o, p)) {
        ret.push(p);
      }
    }
    return ret;
  };
}

//----------------------------------------------------------------------
// ES5 15.4 Array Objects
//----------------------------------------------------------------------



// ES5 15.4.4.18 Array.prototype.forEach ( callbackfn [ , thisArg ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (fun /*, thisp */) {
    

    if (this === void 0 || this === null) { throw new TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function") { throw new TypeError(); }

    var thisp = arguments[1], i;
    for (i = 0; i < len; i++) {
      if (i in t) {
        fun.call(thisp, t[i], i, t);
      }
    }
  };
}


// ES5 15.4.4.19 Array.prototype.map ( callbackfn [ , thisArg ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/Map
if (!Array.prototype.map) {
  Array.prototype.map = function (fun /*, thisp */) {
    

    if (this === void 0 || this === null) { throw new TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function") { throw new TypeError(); }

    var res = []; res.length = len;
    var thisp = arguments[1], i;
    for (i = 0; i < len; i++) {
      if (i in t) {
        res[i] = fun.call(thisp, t[i], i, t);
      }
    }

    return res;
  };
}


// Extends method
// (taken from http://code.jquery.com/jquery-1.9.0.js)
// Populate the class2type map
var class2type = {};

var types = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error"];
for (var i = 0; i < types.length; i++) {
  var typename = types[i];
  class2type[ "[object " + typename + "]" ] = typename.toLowerCase();
}

var core_toString = class2type.toString;
var core_hasOwn = class2type.hasOwnProperty;

var type = function(obj) {
  if (obj === null) {
    return String( obj );
  }
  return typeof obj === "object" || typeof obj === "function" ?
    class2type[core_toString.call(obj)] || "object" :
    typeof obj;
};

var isWindow = function(obj) {
  return obj !== null && obj === obj.window;
};

var isPlainObject = function( obj ) {
  // Must be an Object.
  // Because of IE, we also have to check the presence of the constructor property.
  // Make sure that DOM nodes and window objects don't pass through, as well
  if ( !obj || type(obj) !== "object" || obj.nodeType || isWindow( obj ) ) {
    return false;
  }

  try {
    // Not own constructor property must be Object
    if ( obj.constructor &&
      !core_hasOwn.call(obj, "constructor") &&
      !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
      return false;
    }
  } catch ( e ) {
    // IE8,9 Will throw exceptions on certain host objects #9897
    return false;
  }

  // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.

  var key;
  for ( key in obj ) {}

  return key === undefined || core_hasOwn.call( obj, key );
};

var isFunction = function(obj) {
  return type(obj) === "function";
};

var isArray = Array.isArray || function(obj) {
  return type(obj) === "array";
};

var extend = function() {
  var options, name, src, copy, copyIsArray, clone,
    target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false;

  // Handle a deep copy situation
  if ( typeof target === "boolean" ) {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if ( typeof target !== "object" && !isFunction(target) ) {
    target = {};
  }

  // extend jQuery itself if only one argument is passed
  if ( length === i ) {
    target = this;
    --i;
  }

  for ( ; i < length; i++ ) {
    // Only deal with non-null/undefined values
    if ((options = arguments[ i ]) != null) {
      // Extend the base object
      for ( name in options ) {
        src = target[ name ];
        copy = options[ name ];

        // Prevent never-ending loop
        if ( target === copy ) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = isArray(copy)) ) ) {
          if ( copyIsArray ) {
            copyIsArray = false;
            clone = src && isArray(src) ? src : [];

          } else {
            clone = src && isPlainObject(src) ? src : {};
          }

          // Never move original objects, clone them
          target[ name ] = extend( deep, clone, copy );

        // Don't bring in undefined values
        } else if ( copy !== undefined ) {
          target[ name ] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = extend;
}

var ajax = function ajax(options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  var call = function(fun) {
    var args = Array.prototype.slice.call(arguments, 1);
    if (typeof fun === typeof Function) {
      fun.apply(this, args);
    }
  }; 
  var defaultOptions = {
    method : "GET",
    headers: {},
    json: true,
    processData: true,
    timeout: 10000
  };
  options = extend(true, defaultOptions, options);
  if (options.auth) {
      var token = btoa(options.auth.username + ':' + options.auth.password);
      options.headers.Authorization = 'Basic ' + token;
  }
  var onSuccess = function(obj, resp, cb){
    if (!options.binary && !options.json && options.processData && typeof obj !== 'string') {
      obj = JSON.stringify(obj);
    } else if (!options.binary && options.json && typeof obj === 'string') {
      try {
        obj = JSON.parse(obj);
      } catch (e) {
        // Probably a malformed JSON from server
        call(cb, e);
        return;
      }
    }
    call(cb, null, obj, resp);
  };
  var onError = function(err, cb){
    var errParsed;
    var errObj = {status: err.status};
    try{
      errParsed = JSON.parse(err.responseText); //would prefer not to have a try/catch clause
      errObj = extend(true, {}, errObj, errParsed);
    } catch(e){}
    call(cb, errObj);
  };
  if (typeof window !== 'undefined' && window.XMLHttpRequest) {
    var timer,timedout  = false;
    var xhr = new XMLHttpRequest();
    xhr.open(options.method, options.url);
    if (options.json) {
      options.headers.Accept = 'application/json';
      options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
      if (options.body && options.processData && typeof options.body !== "string") {
        options.body = JSON.stringify(options.body);
      }
    }
    if (options.binary) {
      xhr.responseType = 'arraybuffer';
    }
    for (var key in options.headers){
      xhr.setRequestHeader(key, options.headers[key]);
    }
    if (!("body" in options)) {
      options.body = null;
    }

    var abortReq = function() {
        timedout=true;
        xhr.abort();
        call(onError, xhr, callback);
    };
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4 || timedout) {
        return;
      }
      clearTimeout(timer);
      if (xhr.status >= 200 && xhr.status < 300) {
        var data;
        if (options.binary) {
          data = new Blob([xhr.response || ''], {type: xhr.getResponseHeader('Content-Type')});
        } else {
          data = xhr.responseText;
        }
        call(onSuccess, data, xhr, callback);
      } else {
         call(onError, xhr, callback);
      }
    };
    if (options.timeout > 0) {
      timer = setTimeout(abortReq, options.timeout);
    }
    xhr.send(options.body);
    return {abort:abortReq};
  } else {
    if (options.json) {
      if (!options.binary) {
        options.headers.Accept = 'application/json';
      }
      options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    }
    if (options.binary) {
      options.encoding = null;
      options.json = false;
    }
    if (!options.processData) {
      options.json = false;
    }
    return request(options, function(err, response, body) {
      if (err) {
        err.status = response ? response.statusCode : 400;
        return call(onError, err, callback);
      }

      var content_type = response.headers['content-type'];
      var data = (body || '');

      // CouchDB doesn't always return the right content-type for JSON data, so
      // we check for ^{ and }$ (ignoring leading/trailing whitespace)
      if (!options.binary && (options.json || !options.processData) && typeof data !== 'object' &&
          (/json/.test(content_type) ||
           (/^[\s]*\{/.test(data) && /\}[\s]*$/.test(data)))) {
        data = JSON.parse(data);
      }

      if (response.statusCode >= 200 && response.statusCode < 300) {
        call(onSuccess, data, response, callback);
      }
      else {
        if (options.binary) {
          var data = JSON.parse(data.toString());
        }
        data.status = response.statusCode;
        call(callback, data);
      }
    });
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ajax;
}

/*globals PouchAdapter: true, extend: true */



var Pouch = function Pouch(name, opts, callback) {

  if (!(this instanceof Pouch)) {
    return new Pouch(name, opts, callback);
  }

  if (typeof opts === 'function' || typeof opts === 'undefined') {
    callback = opts;
    opts = {};
  }

  if (typeof name === 'object') {
    opts = name;
    name = undefined;
  }

  if (typeof callback === 'undefined') {
    callback = function() {};
  }

  var backend = Pouch.parseAdapter(opts.name || name);
  opts.originalName = name;
  opts.name = opts.name || backend.name;
  opts.adapter = opts.adapter || backend.adapter;

  if (!Pouch.adapters[opts.adapter]) {
    throw 'Adapter is missing';
  }

  if (!Pouch.adapters[opts.adapter].valid()) {
    throw 'Invalid Adapter';
  }

  var adapter = new PouchAdapter(opts, function(err, db) {
    if (err) {
      if (callback) {
        callback(err);
      }
      return;
    }

    for (var plugin in Pouch.plugins) {
      // In future these will likely need to be async to allow the plugin
      // to initialise
      var pluginObj = Pouch.plugins[plugin](db);
      for (var api in pluginObj) {
        // We let things like the http adapter use its own implementation
        // as it shares a lot of code
        if (!(api in db)) {
          db[api] = pluginObj[api];
        }
      }
    }
    db.taskqueue.ready(true);
    db.taskqueue.execute(db);
    callback(null, db);
  });
  for (var j in adapter) {
    this[j] = adapter[j];
  }
  for (var plugin in Pouch.plugins) {
    // In future these will likely need to be async to allow the plugin
    // to initialise
    var pluginObj = Pouch.plugins[plugin](this);
    for (var api in pluginObj) {
      // We let things like the http adapter use its own implementation
      // as it shares a lot of code
      if (!(api in this)) {
        this[api] = pluginObj[api];
      }
    }
  }
};

Pouch.DEBUG = false;
Pouch.openReqList = {};
Pouch.adapters = {};
Pouch.plugins = {};

Pouch.prefix = '_pouch_';

Pouch.parseAdapter = function(name) {
  var match = name.match(/([a-z\-]*):\/\/(.*)/);
  var adapter;
  if (match) {
    // the http adapter expects the fully qualified name
    name = /http(s?)/.test(match[1]) ? match[1] + '://' + match[2] : match[2];
    adapter = match[1];
    if (!Pouch.adapters[adapter].valid()) {
      throw 'Invalid adapter';
    }
    return {name: name, adapter: match[1]};
  }

  var preferredAdapters = ['idb', 'leveldb', 'websql'];
  for (var i = 0; i < preferredAdapters.length; ++i) {
    if (preferredAdapters[i] in Pouch.adapters) {
      adapter = Pouch.adapters[preferredAdapters[i]];
      var use_prefix = 'use_prefix' in adapter ? adapter.use_prefix : true;

      return {
        name: use_prefix ? Pouch.prefix + name : name,
        adapter: preferredAdapters[i]
      };
    }
  }

  throw 'No valid adapter found';
};

Pouch.destroy = function(name, callback) {
  var opts = Pouch.parseAdapter(name);
  var cb = function(err, response) {
    if (err) {
      callback(err);
      return;
    }

    for (var plugin in Pouch.plugins) {
      Pouch.plugins[plugin]._delete(name);
    }
    if (Pouch.DEBUG) {
      console.log(name + ': Delete Database');
    }

    // call destroy method of the particular adaptor
    Pouch.adapters[opts.adapter].destroy(opts.name, callback);
  };

  // remove Pouch from allDBs
  Pouch.removeFromAllDbs(opts, cb);
};

Pouch.removeFromAllDbs = function(opts, callback) {
  // Only execute function if flag is enabled
  if (!Pouch.enableAllDbs) {
    callback();
    return;
  }

  // skip http and https adaptors for allDbs
  var adapter = opts.adapter;
  if (adapter === "http" || adapter === "https") {
    callback();
    return;
  }

  // remove db from Pouch.ALL_DBS
  new Pouch(Pouch.allDBName(opts.adapter), function(err, db) {
    if (err) {
      // don't fail when allDbs fail
      console.error(err);
      callback();
      return;
    }
    // check if db has been registered in Pouch.ALL_DBS
    var dbname = Pouch.dbName(opts.adapter, opts.name);
    db.get(dbname, function(err, doc) {
      if (err) {
        callback();
      } else {
        db.remove(doc, function(err, response) {
          if (err) {
            console.error(err);
          }
          callback();
        });
      }
    });
  });

};

Pouch.adapter = function (id, obj) {
  if (obj.valid()) {
    Pouch.adapters[id] = obj;
  }
};

Pouch.plugin = function(id, obj) {
  Pouch.plugins[id] = obj;
};

// flag to toggle allDbs (off by default)
Pouch.enableAllDbs = false;

// name of database used to keep track of databases
Pouch.ALL_DBS = "_allDbs";
Pouch.dbName = function(adapter, name) {
  return [adapter, "-", name].join('');
};
Pouch.realDBName = function(adapter, name) {
  return [adapter, "://", name].join('');
};
Pouch.allDBName = function(adapter) {
  return [adapter, "://", Pouch.prefix + Pouch.ALL_DBS].join('');
};

Pouch.open = function(opts, callback) {
  // Only register pouch with allDbs if flag is enabled
  if (!Pouch.enableAllDbs) {
    callback();
    return;
  }

  var adapter = opts.adapter;
  // skip http and https adaptors for allDbs
  if (adapter === "http" || adapter === "https") {
    callback();
    return;
  }

  new Pouch(Pouch.allDBName(adapter), function(err, db) {
    if (err) {
      // don't fail when allDb registration fails
      console.error(err);
      callback();
      return;
    }

    // check if db has been registered in Pouch.ALL_DBS
    var dbname = Pouch.dbName(adapter, opts.name);
    db.get(dbname, function(err, response) {
      if (err && err.status === 404) {
        db.put({
          _id: dbname,
          dbname: opts.originalName
        }, function(err) {
            if (err) {
                console.error(err);
            }

            callback();
        });
      } else {
        callback();
      }
    });
  });
};

Pouch.allDbs = function(callback) {
  var accumulate = function(adapters, all_dbs) {
    if (adapters.length === 0) {
      // remove duplicates
      var result = [];
      all_dbs.forEach(function(doc) {
        var exists = result.some(function(db) {
          return db.id === doc.id;
        });

        if (!exists) {
          result.push(doc);
        }
      });

      // return an array of dbname
      callback(null, result.map(function(row) {
          return row.doc.dbname;
      }));
      return;
    }

    var adapter = adapters.shift();

    // skip http and https adaptors for allDbs
    if (adapter === "http" || adapter === "https") {
      accumulate(adapters, all_dbs);
      return;
    }

    new Pouch(Pouch.allDBName(adapter), function(err, db) {
      if (err) {
        callback(err);
        return;
      }
      db.allDocs({include_docs: true}, function(err, response) {
        if (err) {
          callback(err);
          return;
        }

        // append from current adapter rows
        all_dbs.unshift.apply(all_dbs, response.rows);

        // code to clear allDbs.
        // response.rows.forEach(function(row) {
        //   db.remove(row.doc, function() {
        //     console.log(arguments);
        //   });
        // });

        // recurse
        accumulate(adapters, all_dbs);
      });
    });
  };
  var adapters = Object.keys(Pouch.adapters);
  accumulate(adapters, []);
};

// Enumerate errors, add the status code so we can reflect the HTTP api
// in future
Pouch.Errors = {
  MISSING_BULK_DOCS: {
    status: 400,
    error: 'bad_request',
    reason: "Missing JSON list of 'docs'"
  },
  MISSING_DOC: {
    status: 404,
    error: 'not_found',
    reason: 'missing'
  },
  REV_CONFLICT: {
    status: 409,
    error: 'conflict',
    reason: 'Document update conflict'
  },
  INVALID_ID: {
    status: 400,
    error: 'invalid_id',
    reason: '_id field must contain a string'
  },
  MISSING_ID: {
    status: 412,
    error: 'missing_id',
    reason: '_id is required for puts'
  },
  RESERVED_ID: {
    status: 400,
    error: 'bad_request',
    reason: 'Only reserved document ids may start with underscore.'
  },
  NOT_OPEN: {
    status: 412,
    error: 'precondition_failed',
    reason: 'Database not open so cannot close'
  },
  UNKNOWN_ERROR: {
    status: 500,
    error: 'unknown_error',
    reason: 'Database encountered an unknown error'
  },
  BAD_ARG: {
    status: 500,
    error: 'badarg',
    reason: 'Some query argument is invalid'
  },
  INVALID_REQUEST: {
    status: 400,
    error: 'invalid_request',
    reason: 'Request was invalid'
  },
  QUERY_PARSE_ERROR: {
    status: 400,
    error: 'query_parse_error',
    reason: 'Some query parameter is invalid'
  },
  BAD_REQUEST: {
    status: 400,
    error: 'bad_request',
    reason: 'Something wrong with the request'
  }
};
Pouch.error = function(error, reason){
 return extend({}, error, {reason: reason});
};
if (typeof module !== 'undefined' && module.exports) {
  global.Pouch = Pouch;
  Pouch.merge = require('./pouch.merge.js').merge;
  Pouch.collate = require('./pouch.collate.js').collate;
  Pouch.replicate = require('./pouch.replicate.js').replicate;
  Pouch.utils = require('./pouch.utils.js');
  extend = Pouch.utils.extend;
  module.exports = Pouch;
  var PouchAdapter = require('./pouch.adapter.js');
  //load adapters known to work under node
  var adapters = ['leveldb', 'http'];
  adapters.map(function(adapter) {
    var adapter_path = './adapters/pouch.'+adapter+'.js';
    require(adapter_path);
  });
  require('./plugins/pouchdb.mapreduce.js');
} else {
  window.Pouch = Pouch;
}



// a few hacks to get things in the right place for node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Pouch;
}

var stringCollate = function(a, b) {
  // See: https://github.com/daleharvey/pouchdb/issues/40
  // This is incompatible with the CouchDB implementation, but its the
  // best we can do for now
  return (a === b) ? 0 : ((a > b) ? 1 : -1);
};

var objectCollate = function(a, b) {
  var ak = Object.keys(a), bk = Object.keys(b);
  var len = Math.min(ak.length, bk.length);
  for (var i = 0; i < len; i++) {
    // First sort the keys
    var sort = Pouch.collate(ak[i], bk[i]);
    if (sort !== 0) {
      return sort;
    }
    // if the keys are equal sort the values
    sort = Pouch.collate(a[ak[i]], b[bk[i]]);
    if (sort !== 0) {
      return sort;
    }

  }
  return (ak.length === bk.length) ? 0 :
    (ak.length > bk.length) ? 1 : -1;
};

var arrayCollate = function(a, b) {
  var len = Math.min(a.length, b.length);
  for (var i = 0; i < len; i++) {
    var sort = Pouch.collate(a[i], b[i]);
    if (sort !== 0) {
      return sort;
    }
  }
  return (a.length === b.length) ? 0 :
    (a.length > b.length) ? 1 : -1;
};

// The collation is defined by erlangs ordered terms
// the atoms null, true, false come first, then numbers, strings,
// arrays, then objects
var collationIndex = function(x) {
  var id = ['boolean', 'number', 'string', 'object'];
  if (id.indexOf(typeof x) !== -1) {
    if (x === null) {
      return 1;
    }
    return id.indexOf(typeof x) + 2;
  }
  if (Array.isArray(x)) {
    return 4.5;
  }
};

Pouch.collate = function(a, b) {
  var ai = collationIndex(a);
  var bi = collationIndex(b);
  if ((ai - bi) !== 0) {
    return ai - bi;
  }
  if (a === null) {
    return 0;
  }
  if (typeof a === 'number') {
    return a - b;
  }
  if (typeof a === 'boolean') {
    return a < b ? -1 : 1;
  }
  if (typeof a === 'string') {
    return stringCollate(a, b);
  }
  if (Array.isArray(a)) {
    return arrayCollate(a, b);
  }
  if (typeof a === 'object') {
    return objectCollate(a, b);
  }
};
/*globals rootToLeaf: false, extend: false */



// a few hacks to get things in the right place for node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Pouch;
  var utils = require('./pouch.utils.js');
  for (var k in utils) {
    global[k] = utils[k];
  }
}

// for a better overview of what this is doing, read:
// https://github.com/apache/couchdb/blob/master/src/couchdb/couch_key_tree.erl
//
// But for a quick intro, CouchDB uses a revision tree to store a documents
// history, A -> B -> C, when a document has conflicts, that is a branch in the
// tree, A -> (B1 | B2 -> C), We store these as a nested array in the format
//
// KeyTree = [Path ... ]
// Path = {pos: position_from_root, ids: Tree}
// Tree = [Key, Opts, [Tree, ...]], in particular single node: [Key, []]

// Turn a path as a flat array into a tree with a single branch
function pathToTree(path) {
  var doc = path.shift();
  var root = [doc.id, doc.opts, []];
  var leaf = root;
  var nleaf;

  while (path.length) {
    doc = path.shift();
    nleaf = [doc.id, doc.opts, []];
    leaf[2].push(nleaf);
    leaf = nleaf;
  }
  return root;
}

// Merge two trees together
// The roots of tree1 and tree2 must be the same revision
function mergeTree(in_tree1, in_tree2) {
  var queue = [{tree1: in_tree1, tree2: in_tree2}];
  var conflicts = false;
  while (queue.length > 0) {
    var item = queue.pop();
    var tree1 = item.tree1;
    var tree2 = item.tree2;

    if (tree1[1].status || tree2[1].status) {
      tree1[1].status = (tree1[1].status ===  'available' ||
                         tree2[1].status === 'available') ? 'available' : 'missing';
    }

    for (var i = 0; i < tree2[2].length; i++) {
      if (!tree1[2][0]) {
        conflicts = 'new_leaf';
        tree1[2][0] = tree2[2][i];
        continue;
      }

      var merged = false;
      for (var j = 0; j < tree1[2].length; j++) {
        if (tree1[2][j][0] === tree2[2][i][0]) {
          queue.push({tree1: tree1[2][j], tree2: tree2[2][i]});
          merged = true;
        }
      }
      if (!merged) {
        conflicts = 'new_branch';
        tree1[2].push(tree2[2][i]);
        tree1[2].sort();
      }
    }
  }
  return {conflicts: conflicts, tree: in_tree1};
}

function doMerge(tree, path, dontExpand) {
  var restree = [];
  var conflicts = false;
  var merged = false;
  var res, branch;

  if (!tree.length) {
    return {tree: [path], conflicts: 'new_leaf'};
  }

  tree.forEach(function(branch) {
    if (branch.pos === path.pos && branch.ids[0] === path.ids[0]) {
      // Paths start at the same position and have the same root, so they need
      // merged
      res = mergeTree(branch.ids, path.ids);
      restree.push({pos: branch.pos, ids: res.tree});
      conflicts = conflicts || res.conflicts;
      merged = true;
    } else if (dontExpand !== true) {
      // The paths start at a different position, take the earliest path and
      // traverse up until it as at the same point from root as the path we want to
      // merge.  If the keys match we return the longer path with the other merged
      // After stemming we dont want to expand the trees

      var t1 = branch.pos < path.pos ? branch : path;
      var t2 = branch.pos < path.pos ? path : branch;
      var diff = t2.pos - t1.pos;

      var candidateParents = [];

      var trees = [];
      trees.push({ids: t1.ids, diff: diff, parent: null, parentIdx: null});
      while (trees.length > 0) {
        var item = trees.pop();
        if (item.diff === 0) {
          if (item.ids[0] === t2.ids[0]) {
            candidateParents.push(item);
          }
          continue;
        }
        if (!item.ids) {
          continue;
        }
        /*jshint loopfunc:true */
        item.ids[2].forEach(function(el, idx) {
          trees.push({ids: el, diff: item.diff-1, parent: item.ids, parentIdx: idx});
        });
      }

      var el = candidateParents[0];

      if (!el) {
        restree.push(branch);
      } else {
        res = mergeTree(el.ids, t2.ids);
        el.parent[2][el.parentIdx] = res.tree;
        restree.push({pos: t1.pos, ids: t1.ids});
        conflicts = conflicts || res.conflicts;
        merged = true;
      }
    } else {
      restree.push(branch);
    }
  });

  // We didnt find
  if (!merged) {
    restree.push(path);
  }

  restree.sort(function(a, b) {
    return a.pos - b.pos;
  });

  return {
    tree: restree,
    conflicts: conflicts || 'internal_node'
  };
}

// To ensure we dont grow the revision tree infinitely, we stem old revisions
function stem(tree, depth) {
  // First we break out the tree into a complete list of root to leaf paths,
  // we cut off the start of the path and generate a new set of flat trees
  var stemmedPaths = rootToLeaf(tree).map(function(path) {
    var stemmed = path.ids.slice(-depth);
    return {
      pos: path.pos + (path.ids.length - stemmed.length),
      ids: pathToTree(stemmed)
    };
  });
  // Then we remerge all those flat trees together, ensuring that we dont
  // connect trees that would go beyond the depth limit
  return stemmedPaths.reduce(function(prev, current, i, arr) {
    return doMerge(prev, current, true).tree;
  }, [stemmedPaths.shift()]);
}

Pouch.merge = function(tree, path, depth) {
  // Ugh, nicer way to not modify arguments in place?
  tree = extend(true, [], tree);
  path = extend(true, {}, path);
  var newTree = doMerge(tree, path);
  return {
    tree: stem(newTree.tree, depth),
    conflicts: newTree.conflicts
  };
};

// We fetch all leafs of the revision tree, and sort them based on tree length
// and whether they were deleted, undeleted documents with the longest revision
// tree (most edits) win
// The final sort algorithm is slightly documented in a sidebar here:
// http://guide.couchdb.org/draft/conflicts.html
Pouch.merge.winningRev = function(metadata) {
  var leafs = [];
  Pouch.merge.traverseRevTree(metadata.rev_tree,
                              function(isLeaf, pos, id, something, opts) {
    if (isLeaf) {
      leafs.push({pos: pos, id: id, deleted: !!opts.deleted});
    }
  });
  leafs.sort(function(a, b) {
    if (a.deleted !== b.deleted) {
      return a.deleted > b.deleted ? 1 : -1;
    }
    if (a.pos !== b.pos) {
      return b.pos - a.pos;
    }
    return a.id < b.id ? 1 : -1;
  });

  return leafs[0].pos + '-' + leafs[0].id;
};

// Pretty much all below can be combined into a higher order function to
// traverse revisions
// The return value from the callback will be passed as context to all
// children of that node
Pouch.merge.traverseRevTree = function(revs, callback) {
  var toVisit = [];

  revs.forEach(function(tree) {
    toVisit.push({pos: tree.pos, ids: tree.ids});
  });
  while (toVisit.length > 0) {
    var node = toVisit.pop();
    var pos = node.pos;
    var tree = node.ids;
    var newCtx = callback(tree[2].length === 0, pos, tree[0], node.ctx, tree[1]);
    /*jshint loopfunc: true */
    tree[2].forEach(function(branch) {
      toVisit.push({pos: pos+1, ids: branch, ctx: newCtx});
    });
  }
};

Pouch.merge.collectLeaves = function(revs) {
  var leaves = [];
  Pouch.merge.traverseRevTree(revs, function(isLeaf, pos, id, acc, opts) {
    if (isLeaf) {
      leaves.unshift({rev: pos + "-" + id, pos: pos, opts: opts});
    }
  });
  leaves.sort(function(a, b) {
    return b.pos - a.pos;
  });
  leaves.map(function(leaf) { delete leaf.pos; });
  return leaves;
};

// returns all conflicts that is leaves such that
// 1. are not deleted and
// 2. are different than winning revision
Pouch.merge.collectConflicts = function(metadata) {
  var win = Pouch.merge.winningRev(metadata);
  var leaves = Pouch.merge.collectLeaves(metadata.rev_tree);
  var conflicts = [];
  leaves.forEach(function(leaf) {
    if (leaf.rev !== win && !leaf.opts.deleted) {
      conflicts.push(leaf.rev);
    }
  });
  return conflicts;
};


/*globals call: false, Crypto: false*/



if (typeof module !== 'undefined' && module.exports) {
  module.exports = Pouch;
}

// We create a basic promise so the caller can cancel the replication possibly
// before we have actually started listening to changes etc
var Promise = function() {
  this.cancelled = false;
  this.cancel = function() {
    this.cancelled = true;
  };
};

// The RequestManager ensures that only one database request is active at
// at time, it ensures we dont max out simultaneous HTTP requests and makes
// the replication process easier to reason about
var RequestManager = function() {

  var queue = [];
  var api = {};
  var processing = false;

  // Add a new request to the queue, if we arent currently processing anything
  // then process it immediately
  api.enqueue = function(fun, args) {
    queue.push({fun: fun, args: args});
    if (!processing) {
      api.process();
    }
  };

  // Process the next request
  api.process = function() {
    if (processing || !queue.length) {
      return;
    }
    processing = true;
    var task = queue.shift();
    task.fun.apply(null, task.args);
  };

  // We need to be notified whenever a request is complete to process
  // the next request
  api.notifyRequestComplete = function() {
    processing = false;
    api.process();
  };

  return api;
};

// TODO: check CouchDB's replication id generation, generate a unique id particular
// to this replication
var genReplicationId = function(src, target, opts) {
  var filterFun = opts.filter ? opts.filter.toString() : '';
  return '_local/' + Crypto.MD5(src.id() + target.id() + filterFun);
};

// A checkpoint lets us restart replications from when they were last cancelled
var fetchCheckpoint = function(target, id, callback) {
  target.get(id, function(err, doc) {
    if (err && err.status === 404) {
      callback(null, 0);
    } else {
      callback(null, doc.last_seq);
    }
  });
};

var writeCheckpoint = function(target, id, checkpoint, callback) {
  var check = {
    _id: id,
    last_seq: checkpoint
  };
  target.get(check._id, function(err, doc) {
    if (doc && doc._rev) {
      check._rev = doc._rev;
    }
    target.put(check, function(err, doc) {
      callback();
    });
  });
};

function replicate(src, target, opts, promise) {

  var requests = new RequestManager();
  var writeQueue = [];
  var repId = genReplicationId(src, target, opts);
  var results = [];
  var completed = false;
  var pending = 0;
  var last_seq = 0;
  var continuous = opts.continuous || false;
  var doc_ids = opts.doc_ids;
  var result = {
    ok: true,
    start_time: new Date(),
    docs_read: 0,
    docs_written: 0
  };

  function docsWritten(err, res, len) {
    requests.notifyRequestComplete();
    if (opts.onChange) {
      for (var i = 0; i < len; i++) {
        /*jshint validthis:true */
        opts.onChange.apply(this, [result]);
      }
    }
    pending -= len;
    result.docs_written += len;
    isCompleted();
  }

  function writeDocs() {
    if (!writeQueue.length) {
      return requests.notifyRequestComplete();
    }
    var len = writeQueue.length;
    target.bulkDocs({docs: writeQueue}, {new_edits: false}, function(err, res) {
      docsWritten(err, res, len);
    });
    writeQueue = [];
  }

  function eachRev(id, rev) {
    src.get(id, {revs: true, rev: rev, attachments: true}, function(err, doc) {
      requests.notifyRequestComplete();
      writeQueue.push(doc);
      requests.enqueue(writeDocs);
    });
  }

  function onRevsDiff(err, diffs) {
    requests.notifyRequestComplete();
    if (err) {
      if (continuous) {
        promise.cancel();
      }
      call(opts.complete, err, null);
      return;
    }

    // We already have the full document stored
    if (Object.keys(diffs).length === 0) {
      pending--;
      isCompleted();
      return;
    }

    var _enqueuer = function (rev) {
        requests.enqueue(eachRev, [id, rev]);
    };

    for (var id in diffs) {
      diffs[id].missing.forEach(_enqueuer);
    }
  }

  function fetchRevsDiff(diff) {
    target.revsDiff(diff, onRevsDiff);
  }

  function onChange(change) {
    last_seq = change.seq;
    results.push(change);
    result.docs_read++;
    pending++;
    var diff = {};
    diff[change.id] = change.changes.map(function(x) { return x.rev; });
    requests.enqueue(fetchRevsDiff, [diff]);
  }

  function complete() {
    completed = true;
    isCompleted();
  }

  function isCompleted() {
    if (completed && pending === 0) {
      result.end_time = Date.now();
      writeCheckpoint(target, repId, last_seq, function(err, res) {
        call(opts.complete, err, result);
      });
    }
  }

  fetchCheckpoint(target, repId, function(err, checkpoint) {

    if (err) {
      return call(opts.complete, err);
    }

    last_seq = checkpoint;

    // Was the replication cancelled by the caller before it had a chance
    // to start. Shouldnt we be calling complete?
    if (promise.cancelled) {
      return;
    }

    var repOpts = {
      continuous: continuous,
      since: last_seq,
      style: 'all_docs',
      onChange: onChange,
      complete: complete,
      doc_ids: doc_ids
    };

    if (opts.filter) {
      repOpts.filter = opts.filter;
    }

    if (opts.query_params) {
      repOpts.query_params = opts.query_params;
    }

    var changes = src.changes(repOpts);

    if (opts.continuous) {
      promise.cancel = changes.cancel;
    }
  });

}

function toPouch(db, callback) {
  if (typeof db === 'string') {
    return new Pouch(db, callback);
  }
  callback(null, db);
}

Pouch.replicate = function(src, target, opts, callback) {
  if (opts instanceof Function) {
    callback = opts;
    opts = {};
  }
  if (opts === undefined) {
    opts = {};
  }
  opts.complete = callback;
  var replicateRet = new Promise();
  toPouch(src, function(err, src) {
    if (err) {
      return call(callback, err);
    }
    toPouch(target, function(err, target) {
      if (err) {
        return call(callback, err);
      }
      replicate(src, target, opts, replicateRet);
    });
  });
  return replicateRet;
};

/*jshint strict: false */
/*global request: true, Buffer: true, escape: true, $:true */
/*global extend: true, Crypto: true */
/*global chrome*/

// Pretty dumb name for a function, just wraps callback calls so we dont
// to if (callback) callback() everywhere
var call = function(fun) {
  var args = Array.prototype.slice.call(arguments, 1);
  if (typeof fun === typeof Function) {
    fun.apply(this, args);
  }
};

// Wrapper for functions that call the bulkdocs api with a single doc,
// if the first result is an error, return an error
var yankError = function(callback) {
  return function(err, results) {
    if (err || results[0].error) {
      call(callback, err || results[0]);
    } else {
      call(callback, null, results[0]);
    }
  };
};

var isLocalId = function(id) {
  return (/^_local/).test(id);
};

var isAttachmentId = function(id) {
  return (/\//.test(id) && !isLocalId(id) && !/^_design/.test(id));
};

// Parse document ids: docid[/attachid]
//   - /attachid is optional, and can have slashes in it too
//   - int ids and strings beginning with _design or _local are not split
// returns an object: { docId: docid, attachmentId: attachid }
var parseDocId = function(id) {
  var ids = (typeof id === 'string') && !(/^_(design|local)\//.test(id)) ?
    id.split('/') : [id];
  return {
    docId: ids[0],
    attachmentId: ids.splice(1).join('/').replace(/^\/+/, '')
  };
};

// Determine id an ID is valid
//   - invalid IDs begin with an underescore that does not begin '_design' or '_local'
//   - any other string value is a valid id
var isValidId = function(id) {
  if (/^_/.test(id)) {
    return (/^_(design|local)/).test(id);
  }
  return true;
};

// Preprocess documents, parse their revisions, assign an id and a
// revision for new writes that are missing them, etc
var parseDoc = function(doc, newEdits) {
  var error = null;

  // check for an attachment id and add attachments as needed
  if (doc._id) {
    var id = parseDocId(doc._id);
    if (id.attachmentId !== '') {
      var attachment = btoa(JSON.stringify(doc));
      doc = {_id: id.docId};
      if (!doc._attachments) {
        doc._attachments = {};
      }
      doc._attachments[id.attachmentId] = {
        content_type: 'application/json',
        data: attachment
      };
    }
  }

  var nRevNum;
  var newRevId;
  var revInfo;
  var opts = {status: 'available'};
  if (doc._deleted) {
    opts.deleted = true;
  }

  if (newEdits) {
    if (!doc._id) {
      doc._id = Math.uuid();
    }
    newRevId = Math.uuid(32, 16).toLowerCase();
    if (doc._rev) {
      revInfo = /^(\d+)-(.+)$/.exec(doc._rev);
      if (!revInfo) {
        throw "invalid value for property '_rev'";
      }
      doc._rev_tree = [{
        pos: parseInt(revInfo[1], 10),
        ids: [revInfo[2], {status: 'missing'}, [[newRevId, opts, []]]]
      }];
      nRevNum = parseInt(revInfo[1], 10) + 1;
    } else {
      doc._rev_tree = [{
        pos: 1,
        ids : [newRevId, opts, []]
      }];
      nRevNum = 1;
    }
  } else {
    if (doc._revisions) {
      doc._rev_tree = [{
        pos: doc._revisions.start - doc._revisions.ids.length + 1,
        ids: doc._revisions.ids.reduce(function(acc, x) {
          if (acc === null) {
            return [x, opts, []];
          } else {
            return [x, {status: 'missing'}, [acc]];
          }
        }, null)
      }];
      nRevNum = doc._revisions.start;
      newRevId = doc._revisions.ids[0];
    }
    if (!doc._rev_tree) {
      revInfo = /^(\d+)-(.+)$/.exec(doc._rev);
      if (!revInfo) {
        return Pouch.Errors.BAD_ARG;
      }
      nRevNum = parseInt(revInfo[1], 10);
      newRevId = revInfo[2];
      doc._rev_tree = [{
        pos: parseInt(revInfo[1], 10),
        ids: [revInfo[2], opts, []]
      }];
    }
  }

  if (typeof doc._id !== 'string') {
    error = Pouch.Errors.INVALID_ID;
  }
  else if (!isValidId(doc._id)) {
    error = Pouch.Errors.RESERVED_ID;
  }

  doc._id = decodeURIComponent(doc._id);
  doc._rev = [nRevNum, newRevId].join('-');

  if (error) {
    return error;
  }

  return Object.keys(doc).reduce(function(acc, key) {
    if (/^_/.test(key) && key !== '_attachments') {
      acc.metadata[key.slice(1)] = doc[key];
    } else {
      acc.data[key] = doc[key];
    }
    return acc;
  }, {metadata : {}, data : {}});
};

var compareRevs = function(a, b) {
  // Sort by id
  if (a.id !== b.id) {
    return (a.id < b.id ? -1 : 1);
  }
  // Then by deleted
  if (a.deleted ^ b.deleted) {
    return (a.deleted ? -1 : 1);
  }
  // Then by rev id
  if (a.rev_tree[0].pos === b.rev_tree[0].pos) {
    return (a.rev_tree[0].ids < b.rev_tree[0].ids ? -1 : 1);
  }
  // Then by depth of edits
  return (a.rev_tree[0].start < b.rev_tree[0].start ? -1 : 1);
};


// for every node in a revision tree computes its distance from the closest
// leaf
var computeHeight = function(revs) {
  var height = {};
  var edges = [];
  Pouch.merge.traverseRevTree(revs, function(isLeaf, pos, id, prnt) {
    var rev = pos + "-" + id;
    if (isLeaf) {
      height[rev] = 0;
    }
    if (prnt !== undefined) {
      edges.push({from: prnt, to: rev});
    }
    return rev;
  });

  edges.reverse();
  edges.forEach(function(edge) {
    if (height[edge.from] === undefined) {
      height[edge.from] = 1 + height[edge.to];
    } else {
      height[edge.from] = Math.min(height[edge.from], 1 + height[edge.to]);
    }
  });
  return height;
};

// returns first element of arr satisfying callback predicate
var arrayFirst = function(arr, callback) {
  for (var i = 0; i < arr.length; i++) {
    if (callback(arr[i], i) === true) {
      return arr[i];
    }
  }
  return false;
};

var filterChange = function(opts) {
  return function(change) {
    var req = {};
    req.query = opts.query_params;
    if (opts.filter && !opts.filter.call(this, change.doc, req)) {
      return false;
    }
    if (opts.doc_ids && opts.doc_ids.indexOf(change.id) !== -1) {
      return false;
    }
    if (!opts.include_docs) {
      delete change.doc;
    }
    return true;
  };
};

var processChanges = function(opts, changes, last_seq) {
  // TODO: we should try to filter and limit as soon as possible
  changes = changes.filter(filterChange(opts));
  if (opts.limit) {
    if (opts.limit < changes.length) {
      changes.length = opts.limit;
    }
  }
  changes.forEach(function(change){
    call(opts.onChange, change);
  });
  call(opts.complete, null, {results: changes, last_seq: last_seq});
};

var rootToLeaf = function(tree) {
  var paths = [];
  Pouch.merge.traverseRevTree(tree, function(isLeaf, pos, id, history, opts) {
    history = history ? history.slice(0) : [];
    history.push({id: id, opts: opts});
    if (isLeaf) {
      var rootPos = pos + 1 - history.length;
      paths.unshift({pos: rootPos, ids: history});
    }
    return history;
  });
  return paths;
};

// check if a specific revision of a doc has been deleted
//  - metadata: the metadata object from the doc store
//  - rev: (optional) the revision to check. defaults to winning revision
var isDeleted = function(metadata, rev) {
  if (!rev) {
    rev = Pouch.merge.winningRev(metadata);
  }
  if (rev.indexOf('-') >= 0) {
    rev = rev.split('-')[1];
  }
  var deleted = false;
  Pouch.merge.traverseRevTree(metadata.rev_tree, function(isLeaf, pos, id, acc, opts) {
    if (id === rev) {
      deleted = !!opts.deleted;
    }
  });

  return deleted;
};

var isChromeApp = function(){
  return (typeof chrome !== "undefined" && typeof chrome.storage !== "undefined" && typeof chrome.storage.local !== "undefined");
};

var isCordova = function(){
  return (typeof cordova !== "undefined" || typeof PhoneGap !== "undefined" || typeof phonegap !== "undefined");
};

if (typeof module !== 'undefined' && module.exports) {
  // use node.js's crypto library instead of the Crypto object created by deps/uuid.js
  var crypto = require('crypto');
  var Crypto = {
    MD5: function(str) {
      return crypto.createHash('md5').update(str).digest('hex');
    }
  };
  var extend = require('./deps/extend');
  var ajax = require('./deps/ajax');

  request = require('request');
  _ = require('underscore');
  $ = _;

  module.exports = {
    Crypto: Crypto,
    call: call,
    yankError: yankError,
    isLocalId: isLocalId,
    isAttachmentId: isAttachmentId,
    parseDocId: parseDocId,
    parseDoc: parseDoc,
    isDeleted: isDeleted,
    compareRevs: compareRevs,
    computeHeight: computeHeight,
    arrayFirst: arrayFirst,
    filterChange: filterChange,
    processChanges: processChanges,
    atob: function(str) {
      var base64 = new Buffer(str, 'base64');
      // Node.js will just skip the characters it can't encode instead of
      // throwing and exception
      if (base64.toString('base64') !== str) {
        throw("Cannot base64 encode full string");
      }
      return base64.toString('binary');
    },
    btoa: function(str) {
      return new Buffer(str, 'binary').toString('base64');
    },
    extend: extend,
    ajax: ajax,
    rootToLeaf: rootToLeaf,
    isChromeApp: isChromeApp,
    isCordova: isCordova
  };
}

var Changes = function() {

  var api = {};
  var listeners = {};

  if (isChromeApp()){
    chrome.storage.onChanged.addListener(function(e){
      api.notify(e.db_name.newValue);//object only has oldValue, newValue members
    });
  }
  else {
    window.addEventListener("storage", function(e) {
      api.notify(e.key);
    });
  }

  api.addListener = function(db_name, id, db, opts) {
    if (!listeners[db_name]) {
      listeners[db_name] = {};
    }
    listeners[db_name][id] = {
      db: db,
      opts: opts
    };
  };

  api.removeListener = function(db_name, id) {
    delete listeners[db_name][id];
  };

  api.clearListeners = function(db_name) {
    delete listeners[db_name];
  };

  api.notifyLocalWindows = function(db_name){
    //do a useless change on a storage thing
    //in order to get other windows's listeners to activate
    if (!isChromeApp()){
      localStorage[db_name] = (localStorage[db_name] === "a") ? "b" : "a";
    } else {
      chrome.storage.local.set({db_name: db_name});
    }
  };

  api.notify = function(db_name) {
    if (!listeners[db_name]) { return; }

    Object.keys(listeners[db_name]).forEach(function (i) {
      var opts = listeners[db_name][i].opts;
      listeners[db_name][i].db.changes({
        include_docs: opts.include_docs,
        conflicts: opts.conflicts,
        continuous: false,
        descending: false,
        filter: opts.filter,
        since: opts.since,
        query_params: opts.query_params,
        onChange: function(c) {
          if (c.seq > opts.since && !opts.cancelled) {
            opts.since = c.seq;
            call(opts.onChange, c);
          }
        }
      });
    });
  };

  return api;
};


/*globals Pouch: true, yankError: false, extend: false, call: false, parseDocId: false, traverseRevTree: false */
/*globals arrayFirst: false, rootToLeaf: false, computeHeight: false */
/*globals cordova, isCordova */



/*
 * A generic pouch adapter
 */
var PouchAdapter = function(opts, callback) {

  var api = {};

  var customApi = Pouch.adapters[opts.adapter](opts, function(err, db) {
    if (err) {
      if (callback) {
        callback(err);
      }
      return;
    }

    for (var j in api) {
      if (!db.hasOwnProperty(j)) {
        db[j] = api[j];
      }
    }

    // Don't call Pouch.open for ALL_DBS
    // Pouch.open saves the db's name into ALL_DBS
    if (opts.name === Pouch.prefix + Pouch.ALL_DBS) {
      callback(err, db);
    } else {
      Pouch.open(opts, function(err) {
        callback(err, db);
      });
    }
  });

  var auto_compaction = (opts.auto_compaction === true);

  // wraps a callback with a function that runs compaction after each edit
  var autoCompact = function(callback) {
    if (!auto_compaction) {
      return callback;
    }
    return function(err, res) {
      if (err) {
        call(callback, err);
      } else {
        var count = res.length;
        var decCount = function() {
          count--;
          if (!count) {
            call(callback, null, res);
          }
        };
        res.forEach(function(doc) {
          if (doc.ok) {
            // TODO: we need better error handling
            compactDocument(doc.id, 1, decCount);
          } else {
            decCount();
          }
        });
      }
    };
  };

  api.post = function (doc, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    return customApi.bulkDocs({docs: [doc]}, opts,
        autoCompact(yankError(callback)));
  };

  api.put = function(doc, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    if (!doc || !('_id' in doc)) {
      return call(callback, Pouch.Errors.MISSING_ID);
    }
    return customApi.bulkDocs({docs: [doc]}, opts,
        autoCompact(yankError(callback)));
  };

  api.putAttachment = function (id, rev, blob, type, callback) {
    if (typeof type === 'function') {
      callback = type;
      type = blob;
      blob = rev;
      rev = null;
    }
    if (typeof type === 'undefined') {
      type = blob;
      blob = rev;
      rev = null;
    }
    id = parseDocId(id);

    function createAttachment(doc) {
      doc._attachments = doc._attachments || {};
      doc._attachments[id.attachmentId] = {
        content_type: type,
        data: blob
      };
      api.put(doc, callback);
    }

    api.get(id.docId, function(err, doc) {
      // create new doc
      if (err && err.error === Pouch.Errors.MISSING_DOC.error) {
        createAttachment({_id: id.docId});
        return;
      }
      if (err) {
        call(callback, err);
        return;
      }

      if (doc._rev !== rev) {
        call(callback, Pouch.Errors.REV_CONFLICT);
        return;
      }

      createAttachment(doc);
    });
  };

  api.removeAttachment = function (id, rev, callback) {
    id = parseDocId(id);
    api.get(id.docId, function(err, obj) {
      if (err) {
        call(callback, err);
        return;
      }

      if (obj._rev !== rev) {
        call(callback, Pouch.Errors.REV_CONFLICT);
        return;
      }

      obj._attachments = obj._attachments || {};
      delete obj._attachments[id.attachmentId];
      api.put(obj, callback);
    });
  };

  api.remove = function (doc, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    if (opts === undefined) {
      opts = {};
    }
    opts.was_delete = true;
    var newDoc = {_id: doc._id, _rev: doc._rev};
    newDoc._deleted = true;
    return customApi.bulkDocs({docs: [newDoc]}, opts, yankError(callback));
  };

  api.revsDiff = function (req, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    var ids = Object.keys(req);
    var count = 0;
    var missing = {};

    function readDoc(err, doc, id) {
      req[id].map(function(revId) {
        var matches = function(x) { return x.rev !== revId; };
        if (!doc || doc._revs_info.every(matches)) {
          if (!missing[id]) {
            missing[id] = {missing: []};
          }
          missing[id].missing.push(revId);
        }
      });

      if (++count === ids.length) {
        return call(callback, null, missing);
      }
    }

    ids.map(function(id) {
      api.get(id, {revs_info: true}, function(err, doc) {
        readDoc(err, doc, id);
      });
    });
  };

  // compact one document and fire callback
  // by compacting we mean removing all revisions which
  // are further from the leaf in revision tree than max_height
  var compactDocument = function(docId, max_height, callback) {
    customApi._getRevisionTree(docId, function(err, rev_tree){
      if (err) {
        return call(callback);
      }
      var height = computeHeight(rev_tree);
      var candidates = [];
      var revs = [];
      Object.keys(height).forEach(function(rev) {
        if (height[rev] > max_height) {
          candidates.push(rev);
        }
      });

      Pouch.merge.traverseRevTree(rev_tree, function(isLeaf, pos, revHash, ctx, opts) {
        var rev = pos + '-' + revHash;
        if (opts.status === 'available' && candidates.indexOf(rev) !== -1) {
          opts.status = 'missing';
          revs.push(rev);
        }
      });
      customApi._doCompaction(docId, rev_tree, revs, callback);
    });
  };

  // compact the whole database using single document
  // compaction
  api.compact = function(callback) {
    api.changes({complete: function(err, res) {
      if (err) {
        call(callback); // TODO: silently fail
        return;
      }
      var count = res.results.length;
      if (!count) {
        call(callback);
        return;
      }
      res.results.forEach(function(row) {
        compactDocument(row.id, 0, function() {
          count--;
          if (!count) {
            call(callback);
          }
        });
      });
    }});
  };

  /* Begin api wrappers. Specific functionality to storage belongs in the _[method] */
  api.get = function (id, opts, callback) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('get', arguments);
      return;
    }
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    var leaves = [];
    function finishOpenRevs() {
      var result = [];
      var count = leaves.length;
      if (!count) {
        return call(callback, null, result);
      }
      // order with open_revs is unspecified
      leaves.forEach(function(leaf){
        api.get(id, {rev: leaf, revs: opts.revs}, function(err, doc){
          if (!err) {
            result.push({ok: doc});
          } else {
            result.push({missing: leaf});
          }
          count--;
          if(!count) {
            call(callback, null, result);
          }
        });
      });
    }

    if (opts.open_revs) {
      if (opts.open_revs === "all") {
        customApi._getRevisionTree(id, function(err, rev_tree){
          if (err) {
            // if there's no such document we should treat this
            // situation the same way as if revision tree was empty
            rev_tree = [];
          }
          leaves = Pouch.merge.collectLeaves(rev_tree).map(function(leaf){
            return leaf.rev;
          });
          finishOpenRevs();
        });
      } else {
        if (Array.isArray(opts.open_revs)) {
          leaves = opts.open_revs;
          for (var i = 0; i < leaves.length; i++) {
            var l = leaves[i];
            // looks like it's the only thing couchdb checks
            if (!(typeof(l) === "string" && /^\d+-/.test(l))) {
              return call(callback, Pouch.error(Pouch.Errors.BAD_REQUEST,
                "Invalid rev format" ));
            }
          }
          finishOpenRevs();
        } else {
          return call(callback, Pouch.error(Pouch.Errors.UNKNOWN_ERROR,
            'function_clause'));
        }
      }
      return; // open_revs does not like other options
    }

    id = parseDocId(id);
    if (id.attachmentId !== '') {
      return customApi._get(id, opts, function(err, result){
        if (err) {
          return call(callback, err);
        }
        if (result.doc._attachments && result.doc._attachments[id.attachmentId]) {
          customApi._getAttachment(result.doc._attachments[id.attachmentId],
                                   {encode: false, ctx: result.ctx}, function(err, data) {
            return call(callback, null, data);
          });
        } else {
          return call(callback, Pouch.Errors.MISSING_DOC);
        }
      });
    }

    return customApi._get(id, opts, function(err, result) {
      if (err) {
        return call(callback, err);
      }

      var doc = result.doc;
      var metadata = result.metadata;
      var ctx = result.ctx;

      if (opts.conflicts) {
        var conflicts = Pouch.merge.collectConflicts(metadata);
        if (conflicts.length) {
          doc._conflicts = conflicts;
        }
      }

      if (opts.revs || opts.revs_info) {
        var paths = rootToLeaf(metadata.rev_tree);
        var path = arrayFirst(paths, function(arr) {
          return arr.ids.map(function(x) { return x.id; })
            .indexOf(doc._rev.split('-')[1]) !== -1;
        });

        path.ids.splice(path.ids.map(function(x) {return x.id;})
                        .indexOf(doc._rev.split('-')[1]) + 1);
        path.ids.reverse();

        if (opts.revs) {
          doc._revisions = {
            start: (path.pos + path.ids.length) - 1,
            ids: path.ids.map(function(rev) {
              return rev.id;
            })
          };
        }
        if (opts.revs_info) {
          var pos =  path.pos + path.ids.length;
          doc._revs_info = path.ids.map(function(rev) {
            pos--;
            return {
              rev: pos + '-' + rev.id,
              status: rev.opts.status
            };
          });
        }
      }

      if (opts.attachments && doc._attachments) {
        var attachments = doc._attachments;
        var count = Object.keys(attachments).length;
        Object.keys(attachments).forEach(function(key) {
          customApi._getAttachment(attachments[key], {encode: true, ctx: ctx}, function(err, data) {
            doc._attachments[key].data = data;
            if (!--count){
              call(callback, null, doc);
            }
          });
        });
      } else {
        if (doc._attachments){
          for (var key in doc._attachments) {
            doc._attachments[key].stub = true;
          }
        }
        call(callback, null, doc);
      }
    });
  };

  api.getAttachment = function(id, opts, callback) {
    if (opts instanceof Function) {
      callback = opts;
      opts = {};
    }
    customApi.get(id, function(err, res) {
      callback(err, res);
    });
  };

  api.allDocs = function(opts, callback) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('allDocs', arguments);
      return;
    }
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    if ('keys' in opts) {
      if ('startkey' in opts) {
        call(callback, Pouch.error(Pouch.Errors.QUERY_PARSE_ERROR,
          'Query parameter `start_key` is not compatible with multi-get'
        ));
        return;
      }
      if ('endkey' in opts) {
        call(callback, Pouch.error(Pouch.Errors.QUERY_PARSE_ERROR,
          'Query parameter `end_key` is not compatible with multi-get'
        ));
        return;
      }
    }

    return customApi._allDocs(opts, callback);
  };

  api.changes = function(opts) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('changes', arguments);
      return;
    }
    opts = extend(true, {}, opts);

    if (!opts.since) {
      opts.since = 0;
    }

    if (!('descending' in opts)) {
      opts.descending = false;
    }

    // 0 and 1 should return 1 document
    opts.limit = opts.limit === 0 ? 1 : opts.limit;
    return customApi._changes(opts);
  };

  api.close = function(callback) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('close', arguments);
      return;
    }
    return customApi._close(callback);
  };

  api.info = function(callback) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('info', arguments);
      return;
    }
    return customApi._info(callback);
  };

  api.id = function() {
    return customApi._id();
  };

  api.type = function() {
    return (typeof customApi._type === 'function') ? customApi._type() : opts.adapter;
  };

  api.bulkDocs = function(req, opts, callback) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('bulkDocs', arguments);
      return;
    }
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    if (!opts) {
      opts = {};
    } else {
      opts = extend(true, {}, opts);
    }

    if (!req || !req.docs || req.docs.length < 1) {
      return call(callback, Pouch.Errors.MISSING_BULK_DOCS);
    }

    if (!Array.isArray(req.docs)) {
      return call(callback, Pouch.Errors.QUERY_PARSE_ERROR);
    }

    req = extend(true, {}, req);
    if (!('new_edits' in opts)) {
      opts.new_edits = true;
    }

    return customApi._bulkDocs(req, opts, autoCompact(callback));
  };

  /* End Wrappers */
  var taskqueue = {};

  taskqueue.ready = false;
  taskqueue.queue = [];

  api.taskqueue = {};

  api.taskqueue.execute = function (db) {
    if (taskqueue.ready) {
      taskqueue.queue.forEach(function(d) {
        db[d.task].apply(null, d.parameters);
      });
    }
  };

  api.taskqueue.ready = function() {
    if (arguments.length === 0) {
      return taskqueue.ready;
    }
    taskqueue.ready = arguments[0];
  };

  api.taskqueue.addTask = function(task, parameters) {
    taskqueue.queue.push({ task: task, parameters: parameters });
  };

  api.replicate = {};

  api.replicate.from = function (url, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    return Pouch.replicate(url, customApi, opts, callback);
  };

  api.replicate.to = function (dbName, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    return Pouch.replicate(customApi, dbName, opts, callback);
  };

  for (var j in api) {
    if (!customApi.hasOwnProperty(j)) {
      customApi[j] = api[j];
    }
  }

  // Http adapter can skip setup so we force the db to be ready and execute any jobs
  if (opts.skipSetup) {
    api.taskqueue.ready(true);
    api.taskqueue.execute(api);
  }

  if (isCordova()){
    //to inform websql adapter that we can use api
    cordova.fireWindowEvent(opts.name + "_pouch", {});
  }
  return customApi;
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PouchAdapter;
}

/*globals Pouch: true, call: false, ajax: true */
/*globals require: false, console: false */



var HTTP_TIMEOUT = 10000;

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
function parseUri (str) {
  var o = parseUri.options;
  var m = o.parser[o.strictMode ? "strict" : "loose"].exec(str);
  var uri = {};
  var i = 14;

  while (i--) {
    uri[o.key[i]] = m[i] || "";
  }

  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) {
      uri[o.q.name][$1] = $2;
    }
  });

  return uri;
}

parseUri.options = {
  strictMode: false,
  key: ["source","protocol","authority","userInfo","user","password","host",
        "port","relative","path","directory","file","query","anchor"],
  q:   {
    name:   "queryKey",
    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
  },
  parser: {
    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
    loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  }
};

// Get all the information you possibly can about the URI given by name and
// return it as a suitable object.
function getHost(name) {
  // If the given name contains "http:"
  if (/http(s?):/.test(name)) {
    // Prase the URI into all its little bits
    var uri = parseUri(name);

    // Store the fact that it is a remote URI
    uri.remote = true;

    // Store the user and password as a separate auth object
    if (uri.user || uri.password) {
      uri.auth = {username: uri.user, password: uri.password};
    }

    // Split the path part of the URI into parts using '/' as the delimiter
    // after removing any leading '/' and any trailing '/'
    var parts = uri.path.replace(/(^\/|\/$)/g, '').split('/');

    // Store the first part as the database name and remove it from the parts
    // array
    uri.db = parts.pop();

    // Restore the path by joining all the remaining parts (all the parts
    // except for the database name) with '/'s
    uri.path = parts.join('/');

    return uri;
  }

  // If the given name does not contain 'http:' then return a very basic object
  // with no host, the current path, the given name as the database name and no
  // username/password
  return {host: '', path: '/', db: name, auth: false};
}

// Generate a URL with the host data given by opts and the given path
function genDBUrl(opts, path) {
  // If the host is remote
  if (opts.remote) {
    // If the host already has a path, then we need to have a path delimiter
    // Otherwise, the path delimiter is the empty string
    var pathDel = !opts.path ? '' : '/';

    // Return the URL made up of all the host's information and the given path
    return opts.protocol + '://' + opts.host + ':' + opts.port + '/' +
      opts.path + pathDel + opts.db + '/' + path;
  }

  // If the host is not remote, then return the URL made up of just the
  // database name and the given path
  return '/' + opts.db + '/' + path;
}

// Generate a URL with the host data given by opts and the given path
function genUrl(opts, path) {
  if (opts.remote) {
    // If the host already has a path, then we need to have a path delimiter
    // Otherwise, the path delimiter is the empty string
    var pathDel = !opts.path ? '' : '/';

    // If the host already has a path, then we need to have a path delimiter
    // Otherwise, the path delimiter is the empty string
    return opts.protocol + '://' + opts.host + ':' + opts.port + '/' + opts.path + pathDel + path;
  }

  return '/' + path;
}

// Implements the PouchDB API for dealing with CouchDB instances over HTTP
var HttpPouch = function(opts, callback) {

  // Parse the URI given by opts.name into an easy-to-use object
  var host = getHost(opts.name);
  if (opts.auth) {
    host.auth = opts.auth;
  }

  // Generate the database URL based on the host
  var db_url = genDBUrl(host, '');

  // The functions that will be publically available for HttpPouch
  var api = {};

  var uuids = {
    list: [],
    get: function(opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {count: 10};
      }
      var cb = function(err, body) {
        if (err || !('uuids' in body)) {
          call(callback, err || Pouch.Errors.UNKNOWN_ERROR);
        } else {
          uuids.list = uuids.list.concat(body.uuids);
          call(callback, null, "OK");
        }
      };
      var params = '?count=' + opts.count;
      ajax({
        auth: host.auth,
        method: 'GET',
        url: genUrl(host, '_uuids') + params
      }, cb);
    }
  };

  // Create a new CouchDB database based on the given opts
  var createDB = function(){
    ajax({auth: host.auth, method: 'PUT', url: db_url}, function(err, ret) {
      // If we get an "Unauthorized" error
      if (err && err.status === 401) {
        // Test if the database already exists
        ajax({auth: host.auth, method: 'HEAD', url: db_url}, function (err, ret) {
          // If there is still an error
          if (err) {
            // Give the error to the callback to deal with
            call(callback, err);
          } else {
            // Continue as if there had been no errors
            call(callback, null, api);
          }
        });
        // If there were no errros or if the only error is "Precondition Failed"
        // (note: "Precondition Failed" occurs when we try to create a database
        // that already exists)
      } else if (!err || err.status === 412) {
        // Continue as if there had been no errors
        call(callback, null, api);
      } else {
        call(callback, Pouch.Errors.UNKNOWN_ERROR);
      }
    });
  };
  if (!opts.skipSetup) {
    ajax({auth: host.auth, method: 'GET', url: db_url}, function(err, ret) {
      //check if the db exists
      if (err) {
        if (err.status === 404) {
          //if it doesn't, create it
          createDB();
        } else {
          call(callback, err);
        }
      } else {
        //go do stuff with the db
        call(callback, null, api);
        }
    });
  }

  api.type = function() {
    return 'http';
  };

  // The HttpPouch's ID is its URL
  api.id = function() {
    return genDBUrl(host, '');
  };

  api.request = function(options, callback) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('request', arguments);
      return;
    }
    options.auth = host.auth;
    options.url = genDBUrl(host, options.url);
    ajax(options, callback);
  };

  // Sends a POST request to the host calling the couchdb _compact function
  //    version: The version of CouchDB it is running
  api.compact = function(opts, callback) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('compact', arguments);
      return;
    }
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    ajax({
      auth: host.auth,
      url: genDBUrl(host, '_compact'),
      method: 'POST'
    }, function() {
      function ping() {
        api.info(function(err, res) {
          if (!res.compact_running) {
            call(callback, null);
          } else {
            setTimeout(ping, opts.interval || 200);
          }
        });
      }
      // Ping the http if it's finished compaction
      if (typeof callback === "function") {
        ping();
      }
    });
  };

  // Calls GET on the host, which gets back a JSON string containing
  //    couchdb: A welcome string
  //    version: The version of CouchDB it is running
  api.info = function(callback) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('info', arguments);
      return;
    }
    ajax({
      auth: host.auth,
      method:'GET',
      url: genDBUrl(host, '')
    }, callback);
  };

  // Get the document with the given id from the database given by host.
  // The id could be solely the _id in the database, or it may be a
  // _design/ID or _local/ID path
  api.get = function(id, opts, callback) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('get', arguments);
      return;
    }
    // If no options were given, set the callback to the second parameter
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    // List of parameters to add to the GET request
    var params = [];

    // If it exists, add the opts.revs value to the list of parameters.
    // If revs=true then the resulting JSON will include a field
    // _revisions containing an array of the revision IDs.
    if (opts.revs) {
      params.push('revs=true');
    }

    // If it exists, add the opts.revs_info value to the list of parameters.
    // If revs_info=true then the resulting JSON will include the field
    // _revs_info containing an array of objects in which each object
    // representing an available revision.
    if (opts.revs_info) {
      params.push('revs_info=true');
    }

    // If it exists, add the opts.open_revs value to the list of parameters.
    // If open_revs=all then the resulting JSON will include all the leaf
    // revisions. If open_revs=["rev1", "rev2",...] then the resulting JSON
    // will contain an array of objects containing data of all revisions
    if (opts.open_revs) {
      if (opts.open_revs !== "all") {
        opts.open_revs = JSON.stringify(opts.open_revs);
      }
      params.push('open_revs=' + opts.open_revs);
    }

    // If it exists, add the opts.attachments value to the list of parameters.
    // If attachments=true the resulting JSON will include the base64-encoded
    // contents in the "data" property of each attachment.
    if (opts.attachments) {
      params.push('attachments=true');
    }

    // If it exists, add the opts.rev value to the list of parameters.
    // If rev is given a revision number then get the specified revision.
    if (opts.rev) {
      params.push('rev=' + opts.rev);
    }

    // If it exists, add the opts.conflicts value to the list of parameters.
    // If conflicts=true then the resulting JSON will include the field
    // _conflicts containing all the conflicting revisions.
    if (opts.conflicts) {
      params.push('conflicts=' + opts.conflicts);
    }

    // Format the list of parameters into a valid URI query string
    params = params.join('&');
    params = params === '' ? '' : '?' + params;

    // Set the options for the ajax call
    var options = {
      auth: host.auth,
      method: 'GET',
      url: genDBUrl(host, id + params)
    };

    // If the given id contains at least one '/' and the part before the '/'
    // is NOT "_design" and is NOT "_local"
    // OR
    // If the given id contains at least two '/' and the part before the first
    // '/' is "_design".
    // TODO This second condition seems strange since if parts[0] === '_design'
    // then we already know that parts[0] !== '_local'.
    var parts = id.split('/');
    if ((parts.length > 1 && parts[0] !== '_design' && parts[0] !== '_local') ||
        (parts.length > 2 && parts[0] === '_design' && parts[0] !== '_local')) {
      // Binary is expected back from the server
      options.binary = true;
    }

    // Get the document
    ajax(options, function(err, doc, xhr) {
      // If the document does not exist, send an error to the callback
      if (err) {
        return call(callback, err);
      }

      // Send the document to the callback
      call(callback, null, doc, xhr);
    });
  };

  // Delete the document given by doc from the database given by host.
  api.remove = function(doc, opts, callback) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('remove', arguments);
      return;
    }
    // If no options were given, set the callback to be the second parameter
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    // Delete the document
    ajax({
      auth: host.auth,
      method:'DELETE',
      url: genDBUrl(host, doc._id) + '?rev=' + doc._rev
    }, callback);
  };

  // Remove the attachment given by the id and rev
  api.removeAttachment = function idb_removeAttachment(id, rev, callback) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('removeAttachment', arguments);
      return;
    }
    ajax({
      auth: host.auth,
      method: 'DELETE',
      url: genDBUrl(host, id) + '?rev=' + rev
    }, callback);
  };

  // Add the attachment given by blob and its contentType property
  // to the document with the given id, the revision given by rev, and
  // add it to the database given by host.
  api.putAttachment = function(id, rev, blob, type, callback) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('putAttachment', arguments);
      return;
    }
    if (typeof type === 'function') {
      callback = type;
      type = blob;
      blob = rev;
      rev = null;
    }
    if (typeof type === 'undefined') {
      type = blob;
      blob = rev;
      rev = null;
    }
    var url = genDBUrl(host, id);
    if (rev) {
      url += '?rev=' + rev;
    }

    // Add the attachment
    ajax({
      auth: host.auth,
      method:'PUT',
      url: url,
      headers: {'Content-Type': type},
      processData: false,
      body: blob
    }, callback);
  };

  // Add the document given by doc (in JSON string format) to the database
  // given by host. This fails if the doc has no _id field.
  api.put = function(doc, opts, callback) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('put', arguments);
      return;
    }
    // If no options were given, set the callback to be the second parameter
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    if (!doc || !('_id' in doc)) {
      return call(callback, Pouch.Errors.MISSING_ID);
    }

    // List of parameter to add to the PUT request
    var params = [];

    // If it exists, add the opts.new_edits value to the list of parameters.
    // If new_edits = false then the database will NOT assign this document a
    // new revision number
    if (opts && typeof opts.new_edits !== 'undefined') {
      params.push('new_edits=' + opts.new_edits);
    }

    // Format the list of parameters into a valid URI query string
    params = params.join('&');
    if (params !== '') {
      params = '?' + params;
    }

    // Add the document
    ajax({
      auth: host.auth,
      method: 'PUT',
      url: genDBUrl(host, doc._id) + params,
      body: doc
    }, callback);
  };

  // Add the document given by doc (in JSON string format) to the database
  // given by host. This does not assume that doc is a new document (i.e. does not
  // have a _id or a _rev field.
  api.post = function(doc, opts, callback) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('post', arguments);
      return;
    }
    // If no options were given, set the callback to be the second parameter
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    if (! ("_id" in doc)) {
      if (uuids.list.length > 0) {
        doc._id = uuids.list.pop();
        api.put(doc, opts, callback);
      }else {
        uuids.get(function(err, resp) {
          if (err) {
            return call(callback, Pouch.Errors.UNKNOWN_ERROR);
          }
          doc._id = uuids.list.pop();
          api.put(doc, opts, callback);
        });
      }
    } else {
      api.put(doc, opts, callback);
    }
  };

  // Update/create multiple documents given by req in the database
  // given by host.
  api.bulkDocs = function(req, opts, callback) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('bulkDocs', arguments);
      return;
    }
    // If no options were given, set the callback to be the second parameter
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    if (!opts) {
      opts = {};
    }

    // If opts.new_edits exists add it to the document data to be
    // send to the database.
    // If new_edits=false then it prevents the database from creating
    // new revision numbers for the documents. Instead it just uses
    // the old ones. This is used in database replication.
    if (typeof opts.new_edits !== 'undefined') {
      req.new_edits = opts.new_edits;
    }

    // Update/create the documents
    ajax({
      auth: host.auth,
      method:'POST',
      url: genDBUrl(host, '_bulk_docs'),
      body: req
    }, callback);
  };

  // Get a listing of the documents in the database given
  // by host and ordered by increasing id.
  api.allDocs = function(opts, callback) {
    // If no options were given, set the callback to be the second parameter
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('allDocs', arguments);
      return;
    }
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    // List of parameters to add to the GET request
    var params = [];
    var body;
    var method = 'GET';

    // TODO I don't see conflicts as a valid parameter for a
    // _all_docs request (see http://wiki.apache.org/couchdb/HTTP_Document_API#all_docs)
    if (opts.conflicts) {
      params.push('conflicts=true');
    }

    // If opts.descending is truthy add it to params
    if (opts.descending) {
      params.push('descending=true');
    }

    // If opts.include_docs exists, add the include_docs value to the
    // list of parameters.
    // If include_docs=true then include the associated document with each
    // result.
    if (opts.include_docs) {
      params.push('include_docs=true');
    }

    // If opts.startkey exists, add the startkey value to the list of
    // parameters.
    // If startkey is given then the returned list of documents will
    // start with the document whose id is startkey.
    if (opts.startkey) {
      params.push('startkey=' +
                  encodeURIComponent(JSON.stringify(opts.startkey)));
    }

    // If opts.endkey exists, add the endkey value to the list of parameters.
    // If endkey is given then the returned list of docuemnts will
    // end with the document whose id is endkey.
    if (opts.endkey) {
      params.push('endkey=' + encodeURIComponent(JSON.stringify(opts.endkey)));
    }

    // If opts.limit exists, add the limit value to the parameter list.
    if (opts.limit) {
      params.push('limit=' + opts.limit);
    }

    // Format the list of parameters into a valid URI query string
    params = params.join('&');
    if (params !== '') {
      params = '?' + params;
    }

    // If keys are supplied, issue a POST request to circumvent GET query string limits
    // see http://wiki.apache.org/couchdb/HTTP_view_API#Querying_Options
    if (typeof opts.keys !== 'undefined') {
      method = 'POST';
      body = JSON.stringify({keys:opts.keys});
    }

    // Get the document listing
    ajax({
      auth: host.auth,
      method: method,
      url: genDBUrl(host, '_all_docs' + params),
      body: body
    }, callback);
  };

  // Get a list of changes made to documents in the database given by host.
  // TODO According to the README, there should be two other methods here,
  // api.changes.addListener and api.changes.removeListener.
  api.changes = function(opts) {

    // We internally page the results of a changes request, this means
    // if there is a large set of changes to be returned we can start
    // processing them quicker instead of waiting on the entire
    // set of changes to return and attempting to process them at once
    var CHANGES_LIMIT = 25;

    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('changes', arguments);
      return;
    }

    if (Pouch.DEBUG) {
      console.log(db_url + ': Start Changes Feed: continuous=' + opts.continuous);
    }

    var params = {};
    var limit = (typeof opts.limit !== 'undefined') ? opts.limit : false;
    if (limit === 0) {
      limit = 1;
    }
    //
    var leftToFetch = limit;

    if (opts.style) {
      params.style = opts.style;
    }

    if (opts.include_docs || opts.filter && typeof opts.filter === 'function') {
      params.include_docs = true;
    }

    if (opts.continuous) {
      params.feed = 'longpoll';
    }

    if (opts.conflicts) {
      params.conflicts = true;
    }

    if (opts.descending) {
      params.descending = true;
    }

    if (opts.filter && typeof opts.filter === 'string') {
      params.filter = opts.filter;
    }

    // If opts.query_params exists, pass it through to the changes request.
    // These parameters may be used by the filter on the source database.
    if (opts.query_params && typeof opts.query_params === 'object') {
      for (var param_name in opts.query_params) {
        if (opts.query_params.hasOwnProperty(param_name)) {
          params[param_name] = opts.query_params[param_name];
        }
      }
    }

    var xhr;
    var lastFetchedSeq;
    var remoteLastSeq;

    // Get all the changes starting wtih the one immediately after the
    // sequence number given by since.
    var fetch = function(since, callback) {

      params.since = since;
      params.limit = (!limit || leftToFetch > CHANGES_LIMIT) ?
        CHANGES_LIMIT : leftToFetch;

      var paramStr = '?' + Object.keys(params).map(function(k) {
        return k + '=' + params[k];
      }).join('&');

      // Set the options for the ajax call
      var xhrOpts = {
        auth: host.auth, method:'GET',
        url: genDBUrl(host, '_changes' + paramStr),
        // _changes can take a long time to generate, especially when filtered
        timeout: null
      };
      lastFetchedSeq = since;

      if (opts.aborted) {
        return;
      }

      // Get the changes
      xhr = ajax(xhrOpts, callback);
    };

    // If opts.since exists, get all the changes from the sequence
    // number given by opts.since. Otherwise, get all the changes
    // from the sequence number 0.
    var fetchTimeout = 10;
    var fetchRetryCount = 0;

    var fetched = function(err, res) {
      // If the result of the ajax call (res) contains changes (res.results)
      if (res && res.results) {
        // For each change
        var hasFilter = opts.filter && typeof opts.filter === 'function';
        var req = {};
        req.query = opts.query_params;
        res.results = res.results.filter(function(c) {
          leftToFetch--;
          if (opts.aborted || hasFilter && !opts.filter.apply(this, [c.doc, req])) {
            return false;
          }
          if (opts.doc_ids && opts.doc_ids.indexOf(c.id) !== -1) {
            return false;
          }
          call(opts.onChange, c);
          return true;
        });
      }

      // The changes feed may have timed out with no results
      // if so reuse last update sequence
      if (res && res.last_seq) {
        lastFetchedSeq = res.last_seq;
      }

      var finished = (limit && leftToFetch <= 0) ||
        (!limit && lastFetchedSeq === remoteLastSeq) ||
        (opts.descending && lastFetchedSeq !== 0);

      if (opts.continuous || !finished) {
        // Increase retry delay exponentially as long as errors persist
        if (err) {
          fetchRetryCount += 1;
        } else {
          fetchRetryCount = 0;
        }
        var timeoutMultiplier = 1 << fetchRetryCount;
        var retryWait = fetchTimeout * timeoutMultiplier;
        var maximumWait = opts.maximumWait || 30000;

        if (retryWait > maximumWait) {
          call(opts.complete, err || Pouch.Errors.UNKNOWN_ERROR, null);
        }

        // Queue a call to fetch again with the newest sequence number
        setTimeout(function() { fetch(lastFetchedSeq, fetched); }, retryWait);
      } else {
        // We're done, call the callback
        call(opts.complete, null, res);
      }
    };

    // If we arent doing a continuous changes request we need to know
    // the current update_seq so we know when to stop processing the
    // changes
    if (opts.continuous) {
      fetch(opts.since || 0, fetched);
    } else {
      api.info(function(err, res) {
        remoteLastSeq = res.update_seq;
        fetch(opts.since || 0, fetched);
      });
    }

    // Return a method to cancel this method from processing any more
    return {
      cancel: function() {
        if (Pouch.DEBUG) {
          console.log(db_url + ': Cancel Changes Feed');
        }
        opts.aborted = true;
        xhr.abort();
      }
    };
  };

  // Given a set of document/revision IDs (given by req), tets the subset of
  // those that do NOT correspond to revisions stored in the database.
  // See http://wiki.apache.org/couchdb/HttpPostRevsDiff
  api.revsDiff = function(req, opts, callback) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('revsDiff', arguments);
      return;
    }
    // If no options were given, set the callback to be the second parameter
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    // Get the missing document/revision IDs
    ajax({
      auth: host.auth,
      method:'POST',
      url: genDBUrl(host, '_revs_diff'),
      body: req
    }, function(err, res) {
      call(callback, err, res);
    });
  };

  api.close = function(callback) {
    if (!api.taskqueue.ready()) {
      api.taskqueue.addTask('close', arguments);
      return;
    }
    call(callback, null);
  };

  return api;
};

// Delete the HttpPouch specified by the given name.
HttpPouch.destroy = function(name, callback) {
  var host = getHost(name);
  ajax({auth: host.auth, method: 'DELETE', url: genDBUrl(host, '')}, callback);
};

// HttpPouch is a valid adapter.
HttpPouch.valid = function() {
  return true;
};

if (typeof module !== 'undefined' && module.exports) {
  // running in node
  var pouchdir = '../';
  Pouch = require(pouchdir + 'pouch.js');
  ajax = Pouch.utils.ajax;
}

// Set HttpPouch to be the adapter used with the http scheme.
Pouch.adapter('http', HttpPouch);
Pouch.adapter('https', HttpPouch);

/*globals call: false, extend: false, parseDoc: false, Crypto: false */
/*globals isLocalId: false, isDeleted: false, Changes: false, filterChange: false, processChanges: false */



// While most of the IDB behaviors match between implementations a
// lot of the names still differ. This section tries to normalize the
// different objects & methods.
var indexedDB = window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB;

// still needed for R/W transactions in Android Chrome. follow MDN example:
// https://developer.mozilla.org/en-US/docs/IndexedDB/IDBDatabase#transaction
// note though that Chrome Canary fails on undefined READ_WRITE constants
// on the native IDBTransaction object
var IDBTransaction = (window.IDBTransaction && window.IDBTransaction.READ_WRITE) ?
  window.IDBTransaction :
  (window.webkitIDBTransaction && window.webkitIDBTransaction.READ_WRITE) ?
    window.webkitIDBTransaction :
    { READ_WRITE: 'readwrite' };

var IDBKeyRange = window.IDBKeyRange ||
  window.webkitIDBKeyRange;

var idbError = function(callback) {
  return function(event) {
    call(callback, {
      status: 500,
      error: event.type,
      reason: event.target
    });
  };
};

var IdbPouch = function(opts, callback) {

  // IndexedDB requires a versioned database structure, this is going to make
  // it hard to dynamically create object stores if we needed to for things
  // like views
  var POUCH_VERSION = 1;

  // The object stores created for each database
  // DOC_STORE stores the document meta data, its revision history and state
  var DOC_STORE = 'document-store';
  // BY_SEQ_STORE stores a particular version of a document, keyed by its
  // sequence id
  var BY_SEQ_STORE = 'by-sequence';
  // Where we store attachments
  var ATTACH_STORE = 'attach-store';
  // Where we store meta data
  var META_STORE = 'meta-store';
  // Where we detect blob support
  var DETECT_BLOB_SUPPORT_STORE = 'detect-blob-support';


  var name = opts.name;
  var req = indexedDB.open(name, POUCH_VERSION);

  if (Pouch.openReqList) {
    Pouch.openReqList[name] = req;
  }

  var meta = {
    id: 'meta-store',
    updateSeq: 0
  };

  var blobSupport = null;

  var instanceId = null;
  var api = {};
  var idb = null;

  if (Pouch.DEBUG) {
    console.log(name + ': Open Database');
  }

  req.onupgradeneeded = function(e) {
    var db = e.target.result;
    var currentVersion = e.oldVersion;
    while (currentVersion !== e.newVersion) {
      if (currentVersion === 0) {
        createSchema(db);
      }
      currentVersion++;
    }
  };

  function createSchema(db) {
    db.createObjectStore(DOC_STORE, {keyPath : 'id'})
      .createIndex('seq', 'seq', {unique: true});
    db.createObjectStore(BY_SEQ_STORE, {autoIncrement : true})
      .createIndex('_doc_id_rev', '_doc_id_rev', {unique: true});
    db.createObjectStore(ATTACH_STORE, {keyPath: 'digest'});
    db.createObjectStore(META_STORE, {keyPath: 'id', autoIncrement: false});
    db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
  }

  // From http://stackoverflow.com/questions/14967647/encode-decode-image-with-base64-breaks-image (2013-04-21)
  function fixBinary(bin) {
    var length = bin.length;
    var buf = new ArrayBuffer(length);
    var arr = new Uint8Array(buf);
    for (var i = 0; i < length; i++) {
      arr[i] = bin.charCodeAt(i);
    }
    return buf;
  }

  req.onsuccess = function(e) {

    idb = e.target.result;

    var txn = idb.transaction([META_STORE, DETECT_BLOB_SUPPORT_STORE],
                              IDBTransaction.READ_WRITE);

    idb.onversionchange = function() {
      idb.close();
    };

    // polyfill the new onupgradeneeded api for chrome. can get rid of when
    // saucelabs moves to chrome 23
    if (idb.setVersion && Number(idb.version) !== POUCH_VERSION) {
      var versionReq = idb.setVersion(POUCH_VERSION);
      versionReq.onsuccess = function(evt) {
        function setVersionComplete() {
          req.onsuccess(e);
        }
        evt.target.result.oncomplete = setVersionComplete;
        req.onupgradeneeded(e);
      };
      return;
    }

    var req = txn.objectStore(META_STORE).get('meta-store');

    req.onsuccess = function(e) {
      var reqDBId,
          result;

      if (e.target.result) {
        meta = e.target.result;
      }

      if (name + '_id' in meta) {
        instanceId = meta[name + '_id'];
      } else {
        instanceId = Math.uuid();

        meta[name + '_id'] = instanceId;
        reqDBId = txn.objectStore(META_STORE).put(meta);
      }

      // detect blob support
      try {
        txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(new Blob(), "key");
        blobSupport = true;
      } catch (err) {
        blobSupport = false;
      } finally {
        call(callback, null, api);
      }
    };
  };

  req.onerror = idbError(callback);

  api.type = function() {
    return 'idb';
  };

  // Each database needs a unique id so that we can store the sequence
  // checkpoint without having other databases confuse itself.
  api.id = function idb_id() {
    return instanceId;
  };

  api._bulkDocs = function idb_bulkDocs(req, opts, callback) {
    var newEdits = opts.new_edits;
    var userDocs = req.docs;

    // Parse the docs, give them a sequence number for the result
    var docInfos = userDocs.map(function(doc, i) {
      var newDoc = parseDoc(doc, newEdits);
      newDoc._bulk_seq = i;
      return newDoc;
    });

    var docInfoErrors = docInfos.filter(function(docInfo) {
      return docInfo.error;
    });
    if (docInfoErrors.length) {
      return call(callback, docInfoErrors[0]);
    }

    var results = [];

    function processDocs() {
      if (!docInfos.length) {
        return;
      }
      var currentDoc = docInfos.shift();
      var req = txn.objectStore(DOC_STORE).get(currentDoc.metadata.id);
      req.onsuccess = function process_docRead(event) {
        var oldDoc = event.target.result;
        if (!oldDoc) {
          insertDoc(currentDoc);
        } else {
          updateDoc(oldDoc, currentDoc);
        }
      };
    }

    function complete(event) {
      var aresults = [];
      results.sort(sortByBulkSeq);
      results.forEach(function(result) {
        delete result._bulk_seq;
        if (result.error) {
          aresults.push(result);
          return;
        }
        var metadata = result.metadata;
        var rev = Pouch.merge.winningRev(metadata);

        aresults.push({
          ok: true,
          id: metadata.id,
          rev: rev
        });

        if (isLocalId(metadata.id)) {
          return;
        }

        IdbPouch.Changes.notify(name);
        IdbPouch.Changes.notifyLocalWindows(name);
      });
      call(callback, null, aresults);
    }

    function preprocessAttachment(att, finish) {
      if (att.stub) {
        return finish();
      }
      if (typeof att.data === 'string') {
        var data;
        try {
          data = atob(att.data);
        } catch(e) {
          return call(callback, Pouch.error(Pouch.Errors.BAD_ARG, "Attachments need to be base64 encoded"));
        }
        att.digest = 'md5-' + Crypto.MD5(data);
        if (blobSupport) {
          var type = att.content_type;
          data = fixBinary(data);
          att.data = new Blob([data], {type: type});
        }
        return finish();
      }
      var reader = new FileReader();
      reader.onloadend = function(e) {
        att.digest = 'md5-' + Crypto.MD5(this.result);
        if (!blobSupport) {
          att.data = btoa(this.result);
        }
        finish();
      };
      reader.readAsBinaryString(att.data);
    }

    function preprocessAttachments(callback) {
      if (!docInfos.length) {
        return callback();
      }

      var docv = 0;
      docInfos.forEach(function(docInfo) {
        var attachments = docInfo.data && docInfo.data._attachments ?
          Object.keys(docInfo.data._attachments) : [];

        if (!attachments.length) {
          return done();
        }

        var recv = 0;
        function attachmentProcessed() {
          recv++;
          if (recv === attachments.length) {
            done();
          }
        }

        for (var key in docInfo.data._attachments) {
          preprocessAttachment(docInfo.data._attachments[key], attachmentProcessed);
        }
      });

      function done() {
        docv++;
        if (docInfos.length === docv) {
          callback();
        }
      }
    }

    function writeDoc(docInfo, callback) {
      var err = null;
      var recv = 0;

      docInfo.data._id = docInfo.metadata.id;
      docInfo.data._rev = docInfo.metadata.rev;

      meta.updateSeq++;
      var req = txn.objectStore(META_STORE).put(meta);

      if (isDeleted(docInfo.metadata, docInfo.metadata.rev)) {
        docInfo.data._deleted = true;
      }

      var attachments = docInfo.data._attachments ?
        Object.keys(docInfo.data._attachments) : [];

      function collectResults(attachmentErr) {
        if (!err) {
          if (attachmentErr) {
            err = attachmentErr;
            call(callback, err);
          } else if (recv === attachments.length) {
            finish();
          }
        }
      }

      function attachmentSaved(err) {
        recv++;
        collectResults(err);
      }

      for (var key in docInfo.data._attachments) {
        if (!docInfo.data._attachments[key].stub) {
          var data = docInfo.data._attachments[key].data;
          delete docInfo.data._attachments[key].data;
          var digest = docInfo.data._attachments[key].digest;
          saveAttachment(docInfo, digest, data, attachmentSaved);
        } else {
          recv++;
          collectResults();
        }
      }

      function finish() {
        docInfo.data._doc_id_rev = docInfo.data._id + "::" + docInfo.data._rev;
        var dataReq = txn.objectStore(BY_SEQ_STORE).put(docInfo.data);
        dataReq.onsuccess = function(e) {
          if (Pouch.DEBUG) {
            console.log(name + ': Wrote Document ', docInfo.metadata.id);
          }
          docInfo.metadata.seq = e.target.result;
          // Current _rev is calculated from _rev_tree on read
          delete docInfo.metadata.rev;
          var metaDataReq = txn.objectStore(DOC_STORE).put(docInfo.metadata);
          metaDataReq.onsuccess = function() {
            results.push(docInfo);
            call(callback);
          };
        };
      }

      if (!attachments.length) {
        finish();
      }
    }

    function updateDoc(oldDoc, docInfo) {
      var merged = Pouch.merge(oldDoc.rev_tree, docInfo.metadata.rev_tree[0], 1000);
      var wasPreviouslyDeleted = isDeleted(oldDoc);
      var inConflict = (wasPreviouslyDeleted && isDeleted(docInfo.metadata)) ||
        (!wasPreviouslyDeleted && newEdits && merged.conflicts !== 'new_leaf');

      if (inConflict) {
        results.push(makeErr(Pouch.Errors.REV_CONFLICT, docInfo._bulk_seq));
        return processDocs();
      }

      docInfo.metadata.rev_tree = merged.tree;
      writeDoc(docInfo, processDocs);
    }

    function insertDoc(docInfo) {
      // Cant insert new deleted documents
      if ('was_delete' in opts && isDeleted(docInfo.metadata)) {
        results.push(Pouch.Errors.MISSING_DOC);
        return processDocs();
      }
      writeDoc(docInfo, processDocs);
    }

    // Insert sequence number into the error so we can sort later
    function makeErr(err, seq) {
      err._bulk_seq = seq;
      return err;
    }

    function saveAttachment(docInfo, digest, data, callback) {
      var objectStore = txn.objectStore(ATTACH_STORE);
      var getReq = objectStore.get(digest).onsuccess = function(e) {
        var originalRefs = e.target.result && e.target.result.refs || {};
        var ref = [docInfo.metadata.id, docInfo.metadata.rev].join('@');
        var newAtt = {
          digest: digest,
          body: data,
          refs: originalRefs
        };
        newAtt.refs[ref] = true;
        var putReq = objectStore.put(newAtt).onsuccess = function(e) {
          call(callback);
        };
      };
    }

    var txn;
    preprocessAttachments(function() {
      txn = idb.transaction([DOC_STORE, BY_SEQ_STORE, ATTACH_STORE, META_STORE],
                            IDBTransaction.READ_WRITE);
      txn.onerror = idbError(callback);
      txn.ontimeout = idbError(callback);
      txn.oncomplete = complete;

      processDocs();
    });
  };

  function sortByBulkSeq(a, b) {
    return a._bulk_seq - b._bulk_seq;
  }

  // First we look up the metadata in the ids database, then we fetch the
  // current revision(s) from the by sequence store
  api._get = function idb_get(id, opts, callback) {
    var doc;
    var metadata;
    var err;
    var txn;
    if (opts.ctx) {
      txn = opts.ctx;
    } else {
      txn = idb.transaction([DOC_STORE, BY_SEQ_STORE, ATTACH_STORE], 'readonly');
    }

    function finish(){
      call(callback, err, {doc: doc, metadata: metadata, ctx: txn});
    }

    txn.objectStore(DOC_STORE).get(id.docId).onsuccess = function(e) {
      metadata = e.target.result;
      // we can determine the result here if:
      // 1. there is no such document
      // 2. the document is deleted and we don't ask about specific rev
      // When we ask with opts.rev we expect the answer to be either
      // doc (possibly with _deleted=true) or missing error
      if (!metadata) {
        err = Pouch.Errors.MISSING_DOC;
        return finish();
      }
      if (isDeleted(metadata) && !opts.rev) {
        err = Pouch.error(Pouch.Errors.MISSING_DOC, "deleted");
        return finish();
      }

      var rev = Pouch.merge.winningRev(metadata);
      var key = metadata.id + '::' + (opts.rev ? opts.rev : rev);
      var index = txn.objectStore(BY_SEQ_STORE).index('_doc_id_rev');

      index.get(key).onsuccess = function(e) {
        doc = e.target.result;
        if(doc && doc._doc_id_rev) {
          delete(doc._doc_id_rev);
        }
        if (!doc) {
          err = Pouch.Errors.MISSING_DOC;
          return finish();
        }
        finish();
      };
    };
  };

  api._getAttachment = function(attachment, opts, callback) {
    var result;
    var txn = opts.ctx;
    var digest = attachment.digest;
    var type = attachment.content_type;

    txn.objectStore(ATTACH_STORE).get(digest).onsuccess = function(e) {
      var data = e.target.result.body;
      if (opts.encode) {
        if (blobSupport) {
          var reader = new FileReader();
          reader.onloadend = function(e) {
            result = btoa(this.result);
            call(callback, null, result);
          };
          reader.readAsBinaryString(data);
        } else {
          result = data;
          call(callback, null, result);
        }
      } else {
        if (blobSupport) {
          result = data;
        } else {
          data = fixBinary(atob(data));
          result = new Blob([data], {type: type});
        }
        call(callback, null, result);
      }
    };
  };

  api._allDocs = function idb_allDocs(opts, callback) {
    var start = 'startkey' in opts ? opts.startkey : false;
    var end = 'endkey' in opts ? opts.endkey : false;

    var descending = 'descending' in opts ? opts.descending : false;
    descending = descending ? 'prev' : null;

    var keyRange = start && end ? IDBKeyRange.bound(start, end)
      : start ? IDBKeyRange.lowerBound(start)
      : end ? IDBKeyRange.upperBound(end) : null;

    var transaction = idb.transaction([DOC_STORE, BY_SEQ_STORE], 'readonly');
    transaction.oncomplete = function() {
      if ('keys' in opts) {
        opts.keys.forEach(function(key) {
          if (key in resultsMap) {
            results.push(resultsMap[key]);
          } else {
            results.push({"key": key, "error": "not_found"});
          }
        });
        if (opts.descending) {
          results.reverse();
        }
      }
      call(callback, null, {
        total_rows: results.length,
        rows: ('limit' in opts) ? results.slice(0, opts.limit) : results
      });
    };

    var oStore = transaction.objectStore(DOC_STORE);
    var oCursor = descending ? oStore.openCursor(keyRange, descending)
      : oStore.openCursor(keyRange);
    var results = [];
    var resultsMap = {};
    oCursor.onsuccess = function(e) {
      if (!e.target.result) {
        return;
      }
      var cursor = e.target.result;
      var metadata = cursor.value;
      // If opts.keys is set we want to filter here only those docs with
      // key in opts.keys. With no performance tests it is difficult to
      // guess if iteration with filter is faster than many single requests
      function allDocsInner(metadata, data) {
        if (isLocalId(metadata.id)) {
          return cursor['continue']();
        }
        var doc = {
          id: metadata.id,
          key: metadata.id,
          value: {
            rev: Pouch.merge.winningRev(metadata)
          }
        };
        if (opts.include_docs) {
          doc.doc = data;
          doc.doc._rev = Pouch.merge.winningRev(metadata);
          if (doc.doc._doc_id_rev) {
              delete(doc.doc._doc_id_rev);
          }
          if (opts.conflicts) {
            doc.doc._conflicts = Pouch.merge.collectConflicts(metadata)
              .map(function(x) { return x.id; });
          }
        }
        if ('keys' in opts) {
          if (opts.keys.indexOf(metadata.id) > -1) {
            if (isDeleted(metadata)) {
              doc.value.deleted = true;
              doc.doc = null;
            }
            resultsMap[doc.id] = doc;
          }
        } else {
          if(!isDeleted(metadata)) {
            results.push(doc);
          }
        }
        cursor['continue']();
      }

      if (!opts.include_docs) {
        allDocsInner(metadata);
      } else {
        var index = transaction.objectStore(BY_SEQ_STORE).index('_doc_id_rev');
        var mainRev = Pouch.merge.winningRev(metadata);
        var key = metadata.id + "::" + mainRev;
        index.get(key).onsuccess = function(event) {
          allDocsInner(cursor.value, event.target.result);
        };
      }
    };
  };

  // Looping through all the documents in the database is a terrible idea
  // easiest to implement though, should probably keep a counter
  api._info = function idb_info(callback) {
    var count = 0;
    var result;
    var txn = idb.transaction([DOC_STORE], 'readonly');

    txn.oncomplete = function() {
      callback(null, result);
    };

    txn.objectStore(DOC_STORE).openCursor().onsuccess = function(e) {
        var cursor = e.target.result;
        if (!cursor) {
          result = {
            db_name: name,
            doc_count: count,
            update_seq: meta.updateSeq
          };
          return;
        }
        if (cursor.value.deleted !== true) {
          count++;
        }
        cursor['continue']();
      };
  };

  api._changes = function idb_changes(opts) {
    if (Pouch.DEBUG) {
      console.log(name + ': Start Changes Feed: continuous=' + opts.continuous);
    }

    if (opts.continuous) {
      var id = name + ':' + Math.uuid();
      opts.cancelled = false;
      IdbPouch.Changes.addListener(name, id, api, opts);
      IdbPouch.Changes.notify(name);
      return {
        cancel: function() {
          if (Pouch.DEBUG) {
            console.log(name + ': Cancel Changes Feed');
          }
          opts.cancelled = true;
          IdbPouch.Changes.removeListener(name, id);
        }
      };
    }

    var descending = opts.descending ? 'prev' : null;
    var last_seq = 0;

    // Ignore the `since` parameter when `descending` is true
    opts.since = opts.since && !descending ? opts.since : 0;

    var results = [], resultIndices = {}, dedupResults = [];
    var txn;

    function fetchChanges() {
      txn = idb.transaction([DOC_STORE, BY_SEQ_STORE]);
      txn.oncomplete = onTxnComplete;

      var req;

      if (descending) {
        req = txn.objectStore(BY_SEQ_STORE)
            .openCursor(IDBKeyRange.lowerBound(opts.since, true), descending);
      } else {
        req = txn.objectStore(BY_SEQ_STORE)
            .openCursor(IDBKeyRange.lowerBound(opts.since, true));
      }

      req.onsuccess = onsuccess;
      req.onerror = onerror;
    }

    if (opts.filter && typeof opts.filter === 'string') {
      var filterName = opts.filter.split('/');
      api.get('_design/' + filterName[0], function(err, ddoc) {
        /*jshint evil: true */
        var filter = eval('(function() { return ' +
                          ddoc.filters[filterName[1]] + ' })()');
        opts.filter = filter;
        fetchChanges();
      });
    } else {
      fetchChanges();
    }

    function onsuccess(event) {
      if (!event.target.result) {
        // Filter out null results casued by deduping
        for (var i = 0, l = results.length; i < l; i++ ) {
          var result = results[i];
          if (result) {
            dedupResults.push(result);
          }
        }
        return false;
      }

      var cursor = event.target.result;

      // Try to pre-emptively dedup to save us a bunch of idb calls
      var changeId = cursor.value._id;
      var changeIdIndex = resultIndices[changeId];
      if (changeIdIndex !== undefined) {
        results[changeIdIndex].seq = cursor.key;
        // update so it has the later sequence number
        results.push(results[changeIdIndex]);
        results[changeIdIndex] = null;
        resultIndices[changeId] = results.length - 1;
        return cursor['continue']();
      }

      var index = txn.objectStore(DOC_STORE);
      index.get(cursor.value._id).onsuccess = function(event) {
        var metadata = event.target.result;
        if (isLocalId(metadata.id)) {
          return cursor['continue']();
        }

        if(last_seq < metadata.seq){
          last_seq = metadata.seq;
        }

        var mainRev = Pouch.merge.winningRev(metadata);
        var key = metadata.id + "::" + mainRev;
        var index = txn.objectStore(BY_SEQ_STORE).index('_doc_id_rev');
        index.get(key).onsuccess = function(docevent) {
          var doc = docevent.target.result;
          var changeList = [{rev: mainRev}];
          if (opts.style === 'all_docs') {
            changeList = Pouch.merge.collectLeaves(metadata.rev_tree)
              .map(function(x) { return {rev: x.rev}; });
          }
          var change = {
            id: metadata.id,
            seq: cursor.key,
            changes: changeList,
            doc: doc
          };

          if (isDeleted(metadata, mainRev)) {
            change.deleted = true;
          }
          if (opts.conflicts) {
            change.doc._conflicts = Pouch.merge.collectConflicts(metadata)
              .map(function(x) { return x.id; });
          }

          // Dedupe the changes feed
          var changeId = change.id, changeIdIndex = resultIndices[changeId];
          if (changeIdIndex !== undefined) {
            results[changeIdIndex] = null;
          }
          results.push(change);
          resultIndices[changeId] = results.length - 1;
          cursor['continue']();
        };
      };
    }

    function onTxnComplete() {
      processChanges(opts, dedupResults, last_seq);
    }

    function onerror(error) {
      // TODO: shouldn't we pass some params here?
      call(opts.complete);
    }
  };

  api._close = function(callback) {
    if (idb === null) {
      return call(callback, Pouch.Errors.NOT_OPEN);
    }

    // https://developer.mozilla.org/en-US/docs/IndexedDB/IDBDatabase#close
    // "Returns immediately and closes the connection in a separate thread..."
    idb.close();
    call(callback, null);
  };

  api._getRevisionTree = function(docId, callback) {
    var txn = idb.transaction([DOC_STORE], 'readonly');
    var req = txn.objectStore(DOC_STORE).get(docId);
    req.onsuccess = function (event) {
      var doc = event.target.result;
      if (!doc) {
        call(callback, Pouch.Errors.MISSING_DOC);
      } else {
        call(callback, null, doc.rev_tree);
      }
    };
  };

  // This function removes revisions of document docId
  // which are listed in revs and sets this document
  // revision to to rev_tree
  api._doCompaction = function(docId, rev_tree, revs, callback) {
    var txn = idb.transaction([DOC_STORE, BY_SEQ_STORE], IDBTransaction.READ_WRITE);

    var index = txn.objectStore(DOC_STORE);
    index.get(docId).onsuccess = function(event) {
      var metadata = event.target.result;
      metadata.rev_tree = rev_tree;

      var count = revs.length;
      revs.forEach(function(rev) {
        var index = txn.objectStore(BY_SEQ_STORE).index('_doc_id_rev');
        var key = docId + "::" + rev;
        index.getKey(key).onsuccess = function(e) {
          var seq = e.target.result;
          if (!seq) {
            return;
          }
          var req = txn.objectStore(BY_SEQ_STORE)['delete'](seq);

          count--;
          if (!count) {
            txn.objectStore(DOC_STORE).put(metadata);
          }
        };
      });
    };
    txn.oncomplete = function() {
      call(callback);
    };
  };

  return api;
};

IdbPouch.valid = function idb_valid() {
  return !!indexedDB;
};

IdbPouch.destroy = function idb_destroy(name, callback) {
  if (Pouch.DEBUG) {
    console.log(name + ': Delete Database');
  }
  IdbPouch.Changes.clearListeners(name);

  //Close open request for "name" database to fix ie delay.
  if (Pouch.openReqList[name] && Pouch.openReqList[name].result) {
    Pouch.openReqList[name].result.close();
  }
  var req = indexedDB.deleteDatabase(name);

  req.onsuccess = function() {
    //Remove open request from the list.
    if (Pouch.openReqList[name]) {
      Pouch.openReqList[name] = null;
    }
    call(callback, null);
  };

  req.onerror = idbError(callback);
};

IdbPouch.Changes = new Changes();

Pouch.adapter('idb', IdbPouch);

/*globals call: false, extend: false, parseDoc: false, Crypto: false */
/*globals isLocalId: false, isDeleted: false, Changes: false, filterChange: false, processChanges: false */
/*global isCordova*/



function quote(str) {
  return "'" + str + "'";
}

var POUCH_VERSION = 1;
var POUCH_SIZE = 5 * 1024 * 1024;

// The object stores created for each database
// DOC_STORE stores the document meta data, its revision history and state
var DOC_STORE = quote('document-store');
// BY_SEQ_STORE stores a particular version of a document, keyed by its
// sequence id
var BY_SEQ_STORE = quote('by-sequence');
// Where we store attachments
var ATTACH_STORE = quote('attach-store');
var META_STORE = quote('metadata-store');

var unknownError = function(callback) {
  return function(event) {
    call(callback, {
      status: 500,
      error: event.type,
      reason: event.target
    });
  };
};

var webSqlPouch = function(opts, callback) {

  var api = {};
  var update_seq = 0;
  var instanceId = null;
  var name = opts.name;

  var db = openDatabase(name, POUCH_VERSION, name, POUCH_SIZE);
  if (!db) {
    return call(callback, Pouch.Errors.UNKNOWN_ERROR);
  }

  function dbCreated() {
    callback(null, api);
  }

  function setup(){
    db.transaction(function (tx) {
      var meta = 'CREATE TABLE IF NOT EXISTS ' + META_STORE +
        ' (update_seq, dbid)';
      var attach = 'CREATE TABLE IF NOT EXISTS ' + ATTACH_STORE +
        ' (digest, json, body BLOB)';
      var doc = 'CREATE TABLE IF NOT EXISTS ' + DOC_STORE +
        ' (id unique, seq, json, winningseq)';
      var seq = 'CREATE TABLE IF NOT EXISTS ' + BY_SEQ_STORE +
        ' (seq INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, doc_id_rev UNIQUE, json)';

      tx.executeSql(attach);
      tx.executeSql(doc);
      tx.executeSql(seq);
      tx.executeSql(meta);

      var updateseq = 'SELECT update_seq FROM ' + META_STORE;
      tx.executeSql(updateseq, [], function(tx, result) {
        if (!result.rows.length) {
          var initSeq = 'INSERT INTO ' + META_STORE + ' (update_seq) VALUES (?)';
          var newId = Math.uuid();
          tx.executeSql(initSeq, [0]);
          return;
        }
        update_seq = result.rows.item(0).update_seq;
      });
      var dbid = 'SELECT dbid FROM ' + META_STORE + ' WHERE dbid IS NOT NULL';
      tx.executeSql(dbid, [], function(tx, result) {
        if (!result.rows.length) {
          var initDb = 'UPDATE ' + META_STORE + ' SET dbid=?';
          instanceId = Math.uuid();
          tx.executeSql(initDb, [instanceId]);
          return;
        }
        instanceId = result.rows.item(0).dbid;
      });
    }, unknownError(callback), dbCreated);
  }
  if (isCordova()){
    //to wait until custom api is made in pouch.adapters before doing setup
    window.addEventListener(name + "_pouch", setup, false);
  } else {
    setup();
  }


  api.type = function() {
    return 'websql';
  };

  api.id = function() {
    return instanceId;
  };

  api._info = function(callback) {
    db.transaction(function(tx) {
      var sql = 'SELECT COUNT(id) AS count FROM ' + DOC_STORE;
      tx.executeSql(sql, [], function(tx, result) {
        callback(null, {
          db_name: name,
          doc_count: result.rows.item(0).count,
          update_seq: update_seq
        });
      });
    });
  };

  api._bulkDocs = function idb_bulkDocs(req, opts, callback) {

    var newEdits = opts.new_edits;
    var userDocs = req.docs;

    // Parse the docs, give them a sequence number for the result
    var docInfos = userDocs.map(function(doc, i) {
      var newDoc = parseDoc(doc, newEdits);
      newDoc._bulk_seq = i;
      return newDoc;
    });

    var docInfoErrors = docInfos.filter(function(docInfo) {
      return docInfo.error;
    });
    if (docInfoErrors.length) {
      return call(callback, docInfoErrors[0]);
    }

    var tx;
    var results = [];
    var fetchedDocs = {};

    function sortByBulkSeq(a, b) {
      return a._bulk_seq - b._bulk_seq;
    }

    function complete(event) {
      var aresults = [];
      results.sort(sortByBulkSeq);
      results.forEach(function(result) {
        delete result._bulk_seq;
        if (result.error) {
          aresults.push(result);
          return;
        }
        var metadata = result.metadata;
        var rev = Pouch.merge.winningRev(metadata);

        aresults.push({
          ok: true,
          id: metadata.id,
          rev: rev
        });

        if (isLocalId(metadata.id)) {
          return;
        }

        update_seq++;
        var sql = 'UPDATE ' + META_STORE + ' SET update_seq=?';
        tx.executeSql(sql, [update_seq], function() {
          webSqlPouch.Changes.notify(name);
          webSqlPouch.Changes.notifyLocalWindows(name);
        });
      });
      call(callback, null, aresults);
    }

    function preprocessAttachment(att, finish) {
      if (att.stub) {
        return finish();
      }
      if (typeof att.data === 'string') {
        try {
          att.data = atob(att.data);
        } catch(e) {
          return call(callback, Pouch.error(Pouch.Errors.BAD_ARG, "Attachments need to be base64 encoded"));
        }
        att.digest = 'md5-' + Crypto.MD5(att.data);
        return finish();
      }
      var reader = new FileReader();
      reader.onloadend = function(e) {
        att.data = this.result;
        att.digest = 'md5-' + Crypto.MD5(this.result);
        finish();
      };
      reader.readAsBinaryString(att.data);
    }

    function preprocessAttachments(callback) {
      if (!docInfos.length) {
        return callback();
      }

      var docv = 0;
      var recv = 0;

      docInfos.forEach(function(docInfo) {
        var attachments = docInfo.data && docInfo.data._attachments ?
          Object.keys(docInfo.data._attachments) : [];

        if (!attachments.length) {
          return done();
        }

        function processedAttachment() {
          recv++;
          if (recv === attachments.length) {
            done();
          }
        }

        for (var key in docInfo.data._attachments) {
          preprocessAttachment(docInfo.data._attachments[key], processedAttachment);
        }
      });

      function done() {
        docv++;
        if (docInfos.length === docv) {
          callback();
        }
      }
    }

    function writeDoc(docInfo, callback, isUpdate) {

      function finish() {
        var data = docInfo.data;
        var sql = 'INSERT INTO ' + BY_SEQ_STORE + ' (doc_id_rev, json) VALUES (?, ?);';
        tx.executeSql(sql, [data._id + "::" + data._rev,
                            JSON.stringify(data)], dataWritten);
      }

      function collectResults(attachmentErr) {
        if (!err) {
          if (attachmentErr) {
            err = attachmentErr;
            call(callback, err);
          } else if (recv === attachments.length) {
            finish();
          }
        }
      }

      var err = null;
      var recv = 0;

      docInfo.data._id = docInfo.metadata.id;
      docInfo.data._rev = docInfo.metadata.rev;

      if (isDeleted(docInfo.metadata, docInfo.metadata.rev)) {
        docInfo.data._deleted = true;
      }

      var attachments = docInfo.data._attachments ?
        Object.keys(docInfo.data._attachments) : [];

      function attachmentSaved(err) {
        recv++;
        collectResults(err);
      }

      for (var key in docInfo.data._attachments) {
        if (!docInfo.data._attachments[key].stub) {
          var data = docInfo.data._attachments[key].data;
          delete docInfo.data._attachments[key].data;
          var digest = docInfo.data._attachments[key].digest;
          saveAttachment(docInfo, digest, data, attachmentSaved);
        } else {
          recv++;
          collectResults();
        }
      }

      if (!attachments.length) {
        finish();
      }

      function dataWritten(tx, result) {
        var seq = docInfo.metadata.seq = result.insertId;
        delete docInfo.metadata.rev;

        var mainRev = Pouch.merge.winningRev(docInfo.metadata);

        var sql = isUpdate ?
          'UPDATE ' + DOC_STORE + ' SET seq=?, json=?, winningseq=(SELECT seq FROM ' +
          BY_SEQ_STORE + ' WHERE doc_id_rev=?) WHERE id=?' :
          'INSERT INTO ' + DOC_STORE + ' (id, seq, winningseq, json) VALUES (?, ?, ?, ?);';
        var metadataStr = JSON.stringify(docInfo.metadata);
        var key = docInfo.metadata.id + "::" + mainRev;
        var params = isUpdate ?
          [seq, metadataStr, key, docInfo.metadata.id] :
          [docInfo.metadata.id, seq, seq, metadataStr];
        tx.executeSql(sql, params, function(tx, result) {
          results.push(docInfo);
          call(callback, null);
        });
      }
    }

    function updateDoc(oldDoc, docInfo) {
      var merged = Pouch.merge(oldDoc.rev_tree, docInfo.metadata.rev_tree[0], 1000);
      var inConflict = (isDeleted(oldDoc) && isDeleted(docInfo.metadata)) ||
        (!isDeleted(oldDoc) && newEdits && merged.conflicts !== 'new_leaf');

      if (inConflict) {
        results.push(makeErr(Pouch.Errors.REV_CONFLICT, docInfo._bulk_seq));
        return processDocs();
      }

      docInfo.metadata.rev_tree = merged.tree;
      writeDoc(docInfo, processDocs, true);
    }

    function insertDoc(docInfo) {
      // Cant insert new deleted documents
      if ('was_delete' in opts && isDeleted(docInfo.metadata)) {
        results.push(Pouch.Errors.MISSING_DOC);
        return processDocs();
      }
      writeDoc(docInfo, processDocs, false);
    }

    function processDocs() {
      if (!docInfos.length) {
        return complete();
      }
      var currentDoc = docInfos.shift();
      var id = currentDoc.metadata.id;
      if (id in fetchedDocs) {
        updateDoc(fetchedDocs[id], currentDoc);
      } else {
        // if we have newEdits=false then we can update the same
        // document twice in a single bulk docs call
        fetchedDocs[id] = currentDoc.metadata;
        insertDoc(currentDoc);
      }
    }

    // Insert sequence number into the error so we can sort later
    function makeErr(err, seq) {
      err._bulk_seq = seq;
      return err;
    }

    function saveAttachment(docInfo, digest, data, callback) {
      var ref = [docInfo.metadata.id, docInfo.metadata.rev].join('@');
      var newAtt = {digest: digest};
      var sql = 'SELECT digest, json FROM ' + ATTACH_STORE + ' WHERE digest=?';
      tx.executeSql(sql, [digest], function(tx, result) {
        if (!result.rows.length) {
          newAtt.refs = {};
          newAtt.refs[ref] = true;
          sql = 'INSERT INTO ' + ATTACH_STORE + '(digest, json, body) VALUES (?, ?, ?)';
          tx.executeSql(sql, [digest, JSON.stringify(newAtt), data], function() {
            call(callback, null);
          });
        } else {
          newAtt.refs = JSON.parse(result.rows.item(0).json).refs;
          sql = 'UPDATE ' + ATTACH_STORE + ' SET json=?, body=? WHERE digest=?';
          tx.executeSql(sql, [JSON.stringify(newAtt), data, digest], function() {
            call(callback, null);
          });
        }
      });
    }

    function metadataFetched(tx, results) {
      for (var j=0; j<results.rows.length; j++) {
        var row = results.rows.item(j);
        fetchedDocs[row.id] = JSON.parse(row.json);
      }
      processDocs();
    }

    preprocessAttachments(function() {
      db.transaction(function(txn) {
        tx = txn;
        var ids = '(' + docInfos.map(function(d) {
          return quote(d.metadata.id);
        }).join(',') + ')';
        var sql = 'SELECT * FROM ' + DOC_STORE + ' WHERE id IN ' + ids;
        tx.executeSql(sql, [], metadataFetched);
      }, unknownError(callback));
    });
  };

  api._get = function(id, opts, callback) {
    var doc;
    var metadata;
    var err;
    if (!opts.ctx) {
      db.transaction(function(txn) {
        opts.ctx = txn;
        api._get(id, opts, callback);
      });
      return;
    }
    var tx = opts.ctx;

    function finish() {
      call(callback, err, {doc: doc, metadata: metadata, ctx: tx});
    }

    var sql = 'SELECT * FROM ' + DOC_STORE + ' WHERE id=?';
    tx.executeSql(sql, [id.docId], function(a, results) {
      if (!results.rows.length) {
        err = Pouch.Errors.MISSING_DOC;
        return finish();
      }
      metadata = JSON.parse(results.rows.item(0).json);
      if (isDeleted(metadata) && !opts.rev) {
        err = Pouch.error(Pouch.Errors.MISSING_DOC, "deleted");
        return finish();
      }

      var rev = Pouch.merge.winningRev(metadata);
      var key = opts.rev ? opts.rev : rev;
      key = metadata.id + '::' + key;
      var sql = 'SELECT * FROM ' + BY_SEQ_STORE + ' WHERE doc_id_rev=?';
      tx.executeSql(sql, [key], function(tx, results) {
        if (!results.rows.length) {
          err = Pouch.Errors.MISSING_DOC;
          return finish();
        }
        doc = JSON.parse(results.rows.item(0).json);

        finish();
      });
    });
  };

  function makeRevs(arr) {
    return arr.map(function(x) { return {rev: x.rev}; });
  }
  function makeIds(arr) {
    return arr.map(function(x) { return x.id; });
  }

  api._allDocs = function(opts, callback) {
    var results = [];
    var resultsMap = {};
    var start = 'startkey' in opts ? opts.startkey : false;
    var end = 'endkey' in opts ? opts.endkey : false;
    var descending = 'descending' in opts ? opts.descending : false;
    var sql = 'SELECT ' + DOC_STORE + '.id, ' + BY_SEQ_STORE + '.seq, ' +
      BY_SEQ_STORE + '.json AS data, ' + DOC_STORE + '.json AS metadata FROM ' +
      BY_SEQ_STORE + ' JOIN ' + DOC_STORE + ' ON ' + BY_SEQ_STORE + '.seq = ' +
      DOC_STORE + '.winningseq';

    if ('keys' in opts) {
      sql += ' WHERE ' + DOC_STORE + '.id IN (' + opts.keys.map(function(key){
        return quote(key);
      }).join(',') + ')';
    } else {
      if (start) {
        sql += ' WHERE ' + DOC_STORE + '.id >= "' + start + '"';
      }
      if (end) {
        sql += (start ? ' AND ' : ' WHERE ') + DOC_STORE + '.id <= "' + end + '"';
      }
      sql += ' ORDER BY ' + DOC_STORE + '.id ' + (descending ? 'DESC' : 'ASC');
    }

    db.transaction(function(tx) {
      tx.executeSql(sql, [], function(tx, result) {
        for (var i = 0, l = result.rows.length; i < l; i++ ) {
          var doc = result.rows.item(i);
          var metadata = JSON.parse(doc.metadata);
          var data = JSON.parse(doc.data);
          if (!(isLocalId(metadata.id))) {
            doc = {
              id: metadata.id,
              key: metadata.id,
              value: {rev: Pouch.merge.winningRev(metadata)}
            };
            if (opts.include_docs) {
              doc.doc = data;
              doc.doc._rev = Pouch.merge.winningRev(metadata);
              if (opts.conflicts) {
                doc.doc._conflicts = makeIds(Pouch.merge.collectConflicts(metadata));
              }
            }
            if ('keys' in opts) {
              if (opts.keys.indexOf(metadata.id) > -1) {
                if (isDeleted(metadata)) {
                  doc.value.deleted = true;
                  doc.doc = null;
                }
                resultsMap[doc.id] = doc;
              }
            } else {
              if(!isDeleted(metadata)) {
                results.push(doc);
              }
            }
          }
        }
      });
    }, unknownError(callback), function() {
      if ('keys' in opts) {
        opts.keys.forEach(function(key) {
          if (key in resultsMap) {
            results.push(resultsMap[key]);
          } else {
            results.push({"key": key, "error": "not_found"});
          }
        });
        if (opts.descending) {
          results.reverse();
        }
      }
      call(callback, null, {
        total_rows: results.length,
        rows: ('limit' in opts) ? results.slice(0, opts.limit) : results
      });
    });
  };

  api._changes = function idb_changes(opts) {

    if (Pouch.DEBUG) {
      console.log(name + ': Start Changes Feed: continuous=' + opts.continuous);
    }

    if (opts.continuous) {
      var id = name + ':' + Math.uuid();
      opts.cancelled = false;
      webSqlPouch.Changes.addListener(name, id, api, opts);
      webSqlPouch.Changes.notify(name);
      return {
        cancel: function() {
          if (Pouch.DEBUG) {
            console.log(name + ': Cancel Changes Feed');
          }
          opts.cancelled = true;
          webSqlPouch.Changes.removeListener(name, id);
        }
      };
    }

    var descending = opts.descending;

    // Ignore the `since` parameter when `descending` is true
    opts.since = opts.since && !descending ? opts.since : 0;

    var results = [];
    var txn;

    function fetchChanges() {
      var sql = 'SELECT ' + DOC_STORE + '.id, ' + BY_SEQ_STORE + '.seq, ' +
        BY_SEQ_STORE + '.json AS data, ' + DOC_STORE + '.json AS metadata FROM ' +
        BY_SEQ_STORE + ' JOIN ' + DOC_STORE + ' ON ' + BY_SEQ_STORE + '.seq = ' +
        DOC_STORE + '.winningseq WHERE ' + DOC_STORE + '.seq > ' + opts.since +
        ' ORDER BY ' + DOC_STORE + '.seq ' + (descending ? 'DESC' : 'ASC');

      db.transaction(function(tx) {
        tx.executeSql(sql, [], function(tx, result) {
          var last_seq = 0;
          for (var i = 0, l = result.rows.length; i < l; i++ ) {
            var res = result.rows.item(i);
            var metadata = JSON.parse(res.metadata);
            if (!isLocalId(metadata.id)) {
              if (last_seq < res.seq) {
                last_seq = res.seq;
              }
              var doc = JSON.parse(res.data);
              var mainRev = doc._rev;
              var changeList = [{rev: mainRev}];
              if (opts.style === 'all_docs') {
                changeList = makeRevs(Pouch.merge.collectLeaves(metadata.rev_tree));
              }
              var change = {
                id: metadata.id,
                seq: res.seq,
                changes: changeList,
                doc: doc
              };
              if (isDeleted(metadata, mainRev)) {
                change.deleted = true;
              }
              if (opts.conflicts) {
                change.doc._conflicts = makeIds(Pouch.merge.collectConflicts(metadata));
              }
              results.push(change);
            }
          }
          processChanges(opts, results, last_seq);
        });
      });
    }

    if (opts.filter && typeof opts.filter === 'string') {
      var filterName = opts.filter.split('/');
      api.get('_design/' + filterName[0], function(err, ddoc) {
        /*jshint evil: true */
        var filter = eval('(function() { return ' +
                          ddoc.filters[filterName[1]] + ' })()');
        opts.filter = filter;
        fetchChanges();
      });
    } else {
      fetchChanges();
    }
  };

  api._close = function(callback) {
    //WebSQL databases do not need to be closed
    call(callback, null);
  };

  api._getAttachment = function(attachment, opts, callback) {
    var res;
    var tx = opts.ctx;
    var digest = attachment.digest;
    var type = attachment.content_type;
    var sql = 'SELECT body FROM ' + ATTACH_STORE + ' WHERE digest=?';
    tx.executeSql(sql, [digest], function(tx, result) {
      var data = result.rows.item(0).body;
      if (opts.encode) {
        res = btoa(data);
      } else {
        res = new Blob([data], {type: type});
      }
      call(callback, null, res);
    });
  };

  api._getRevisionTree = function(docId, callback) {
    db.transaction(function (tx) {
      var sql = 'SELECT json AS metadata FROM ' + DOC_STORE + ' WHERE id = ?';
      tx.executeSql(sql, [docId], function(tx, result) {
        if (!result.rows.length) {
          call(callback, Pouch.Errors.MISSING_DOC);
        } else {
          var data = JSON.parse(result.rows.item(0).metadata);
          call(callback, null, data.rev_tree);
        }
      });
    });
  };

  api._doCompaction = function(docId, rev_tree, revs, callback) {
    db.transaction(function (tx) {
      var sql = 'SELECT json AS metadata FROM ' + DOC_STORE + ' WHERE id = ?';
      tx.executeSql(sql, [docId], function(tx, result) {
        if (!result.rows.length) {
          return call(callback);
        }
        var metadata = JSON.parse(result.rows.item(0).metadata);
        metadata.rev_tree = rev_tree;

        var sql = 'DELETE FROM ' + BY_SEQ_STORE + ' WHERE doc_id_rev IN (' +
          revs.map(function(rev){return quote(docId + '::' + rev);}).join(',') + ')';

        tx.executeSql(sql, [], function(tx, result) {
          var sql = 'UPDATE ' + DOC_STORE + ' SET json = ? WHERE id = ?';

          tx.executeSql(sql, [JSON.stringify(metadata), docId], function(tx, result) {
            callback();
          });
        });
      });
    });
  };

  return api;
};

webSqlPouch.valid = function() {
  return !!window.openDatabase;
};

webSqlPouch.destroy = function(name, callback) {
  var db = openDatabase(name, POUCH_VERSION, name, POUCH_SIZE);
  db.transaction(function (tx) {
    tx.executeSql('DROP TABLE IF EXISTS ' + DOC_STORE, []);
    tx.executeSql('DROP TABLE IF EXISTS ' + BY_SEQ_STORE, []);
    tx.executeSql('DROP TABLE IF EXISTS ' + ATTACH_STORE, []);
    tx.executeSql('DROP TABLE IF EXISTS ' + META_STORE, []);
  }, unknownError(callback), function() {
    call(callback, null);
  });
};

webSqlPouch.Changes = new Changes();

Pouch.adapter('websql', webSqlPouch);

/*global Pouch: true */



// This is the first implementation of a basic plugin, we register the
// plugin object with pouch and it is mixin'd to each database created
// (regardless of adapter), adapters can override plugins by providing
// their own implementation. functions on the plugin object that start
// with _ are reserved function that are called by pouchdb for special
// notifications.

// If we wanted to store incremental views we can do it here by listening
// to the changes feed (keeping track of our last update_seq between page loads)
// and storing the result of the map function (possibly using the upcoming
// extracted adapter functions)

var MapReduce = function(db) {

  function viewQuery(fun, options) {
    if (!options.complete) {
      return;
    }

    if (!fun.reduce) {
      options.reduce = false;
    }

    function sum(values) {
      return values.reduce(function(a, b) { return a + b; }, 0);
    }

    var results = [];
    var current = null;
    var num_started= 0;
    var completed= false;

    var emit = function(key, val) {
      var viewRow = {
        id: current.doc._id,
        key: key,
        value: val
      };

      if (options.startkey && Pouch.collate(key, options.startkey) < 0) return;
      if (options.endkey && Pouch.collate(key, options.endkey) > 0) return;
      if (options.key && Pouch.collate(key, options.key) !== 0) return;

      num_started++;
      if (options.include_docs) {
        //in this special case, join on _id (issue #106)
        if (val && typeof val === 'object' && val._id){
          db.get(val._id,
              function(_, joined_doc){
                if (joined_doc) {
                  viewRow.doc = joined_doc;
                }
                results.push(viewRow);
                checkComplete();
              });
          return;
        } else {
          viewRow.doc = current.doc;
        }
      }
      results.push(viewRow);
    };

    // ugly way to make sure references to 'emit' in map/reduce bind to the
    // above emit
    eval('fun.map = ' + fun.map.toString() + ';');
    if (fun.reduce) {
      eval('fun.reduce = ' + fun.reduce.toString() + ';');
    }

    //only proceed once all documents are mapped and joined
    var checkComplete= function(){
      if (completed && results.length == num_started){
        results.sort(function(a, b) {
          return Pouch.collate(a.key, b.key);
        });
        if (options.descending) {
          results.reverse();
        }
        if (options.reduce === false) {
          return options.complete(null, {
            rows: ('limit' in options)
              ? results.slice(0, options.limit)
              : results,
            total_rows: results.length
          });
        }

        var groups = [];
        results.forEach(function(e) {
          var last = groups[groups.length-1] || null;
          if (last && Pouch.collate(last.key[0][0], e.key) === 0) {
            last.key.push([e.key, e.id]);
            last.value.push(e.value);
            return;
          }
          groups.push({key: [[e.key, e.id]], value: [e.value]});
        });
        groups.forEach(function(e) {
          e.value = fun.reduce(e.key, e.value) || null;
          e.key = e.key[0][0];
        });
        options.complete(null, {
          rows: ('limit' in options)
            ? groups.slice(0, options.limit)
            : groups,
          total_rows: groups.length
        });
      }
    }

    db.changes({
      conflicts: true,
      include_docs: true,
      onChange: function(doc) {
        if (!('deleted' in doc)) {
          current = {doc: doc.doc};
          fun.map.call(this, doc.doc);
        }
      },
      complete: function() {
        completed= true;
        checkComplete();
      }
    });
  }

  function httpQuery(fun, opts, callback) {

    // List of parameters to add to the PUT request
    var params = [];
    var body = undefined;
    var method = 'GET';

    // If opts.reduce exists and is defined, then add it to the list
    // of parameters.
    // If reduce=false then the results are that of only the map function
    // not the final result of map and reduce.
    if (typeof opts.reduce !== 'undefined') {
      params.push('reduce=' + opts.reduce);
    }
    if (typeof opts.include_docs !== 'undefined') {
      params.push('include_docs=' + opts.include_docs);
    }
    if (typeof opts.limit !== 'undefined') {
      params.push('limit=' + opts.limit);
    }
    if (typeof opts.descending !== 'undefined') {
      params.push('descending=' + opts.descending);
    }
    if (typeof opts.startkey !== 'undefined') {
      params.push('startkey=' + encodeURIComponent(JSON.stringify(opts.startkey)));
    }
    if (typeof opts.endkey !== 'undefined') {
      params.push('endkey=' + encodeURIComponent(JSON.stringify(opts.endkey)));
    }
    if (typeof opts.key !== 'undefined') {
      params.push('key=' + encodeURIComponent(JSON.stringify(opts.key)));
    }
    if (typeof opts.group !== 'undefined') {
      params.push('group=' + opts.group);
    }
    if (typeof opts.group_level !== 'undefined') {
      params.push('group_level=' + opts.group_level);
    }

    // If keys are supplied, issue a POST request to circumvent GET query string limits
    // see http://wiki.apache.org/couchdb/HTTP_view_API#Querying_Options
    if (typeof opts.keys !== 'undefined') {
      method = 'POST';
      body = JSON.stringify({keys:opts.keys});
    }

    // Format the list of parameters into a valid URI query string
    params = params.join('&');
    params = params === '' ? '' : '?' + params;

    // We are referencing a query defined in the design doc
    if (typeof fun === 'string') {
      var parts = fun.split('/');
      db.request({
        method: method,
        url: '_design/' + parts[0] + '/_view/' + parts[1] + params,
        body: body
      }, callback);
      return;
    }

    // We are using a temporary view, terrible for performance but good for testing
    var queryObject = JSON.parse(JSON.stringify(fun, function(key, val) {
      if (typeof val === 'function') {
        return val + ''; // implicitly `toString` it
      }
      return val;
    }));

    db.request({
      method:'POST',
      url: '_temp_view' + params,
      body: queryObject
    }, callback);
  }

  function query(fun, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    if (callback) {
      opts.complete = callback;
    }

    if (db.type() === 'http') {
    if (typeof fun === 'function'){
      return httpQuery({map: fun}, opts, callback);
    }
    return httpQuery(fun, opts, callback);
    }

    if (typeof fun === 'object') {
      return viewQuery(fun, opts);
    }

    if (typeof fun === 'function') {
      return viewQuery({map: fun}, opts);
    }

    var parts = fun.split('/');
    db.get('_design/' + parts[0], function(err, doc) {
      if (err) {
        if (callback) callback(err);
        return;
      }

      if (!doc.views[parts[1]]) {
        if (callback) callback({ error: 'not_found', reason: 'missing_named_view' });
        return;
      }

      viewQuery({
        map: doc.views[parts[1]].map,
        reduce: doc.views[parts[1]].reduce
      }, opts);
    });
  }

  return {'query': query};
};

// Deletion is a noop since we dont store the results of the view
MapReduce._delete = function() { };

Pouch.plugin('mapreduce', MapReduce);

 })(this);
define("pouch", ["jquery"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.Pouch;
    };
}(this)));

var OPrime = OPrime || {};

OPrime.debugMode = false;
/*
 * Android touchdb for OPrime runs on port 8128, so if the app is running on
 * port 8128 it is likely in a touchdb (either in the android app or in a
 * browser)
 */
OPrime.runFromTouchDBOnAndroidInLocalNetwork = function() {
  return window.location.port == 8128;
};

/**
 * The address of the TouchDB-Android database on the Android.
 */
OPrime.touchUrl = "http://localhost:8128/";

/**
 * The address of the PouchDB database on the browser.
 */
OPrime.pouchUrl = "idb://";

OPrime.getCouchUrl = function(couchConnection, couchdbcommand) {
  if (!couchConnection) {
    couchConnection = OPrime.defaultCouchConnection();
    if (OPrime.debugMode) OPrime.debug("Using the apps ccouchConnection", couchConnection);
  }

  var couchurl = couchConnection.protocol + couchConnection.domain;
  if (couchConnection.port && couchConnection.port != "443" && couchConnection.port != "80") {
    couchurl = couchurl + ":" + couchConnection.port;
  }
  if(!couchConnection.path){
    couchConnection.path = "";
  }
  couchurl = couchurl + couchConnection.path;
  if (couchdbcommand === null || couchdbcommand === undefined) {
    couchurl = couchurl + "/" + couchConnection.pouchname;
  } else {
    couchurl = couchurl + couchdbcommand;
  }

    
  /* Switch user to the new dev servers if they have the old ones */
  couchurl = couchurl.replace(/ifielddevs.iriscouch.com/g,
      "corpusdev.lingsync.org");

  /*
   * For debugging cors #838: Switch to use the corsproxy corpus service instead
   * of couchdb directly
   */
  // couchurl = couchurl.replace(/https/g,"http").replace(/6984/g,"3186");
  
  return couchurl;
};

OPrime.contactUs = "<a href='https://docs.google.com/spreadsheet/viewform?formkey=dGFyREp4WmhBRURYNzFkcWZMTnpkV2c6MQ' target='_blank'>Contact Us</a>";

OPrime.debug = function(message, message2, message3, message4) {
  if (navigator.appName == 'Microsoft Internet Explorer') {
    return;
  }
  if (this.debugMode) {
    console.log(message);

    if (message2) {
      console.log(message2);
    }
    if (message3) {
      console.log(message3);
    }
    if (message4) {
      console.log(message4);
    }
  }
};

OPrime.bug = function(message) {
  alert(message);
};

OPrime.warn = function(message) {
  alert(message);
};

/*
 * Declare functions for PubSub
 */
OPrime.publisher = {
  subscribers : {
    any : []
  },
  subscribe : function(type, fn, context) {
    type = type || 'any';
    fn = typeof fn === "function" ? fn : context[fn];

    if (typeof this.subscribers[type] === "undefined") {
      this.subscribers[type] = [];
    }
    this.subscribers[type].push({
      fn : fn,
      context : context || this
    });
  },
  unsubscribe : function(type, fn, context) {
    this.visitSubscribers('unsubscribe', type, fn, context);
  },
  publish : function(type, publication) {
    this.visitSubscribers('publish', type, publication);
  },
  visitSubscribers : function(action, type, arg, context) {
    var pubtype = type || 'any';
    var subscribers = this.subscribers[pubtype];
    if (!subscribers || subscribers.length == 0) {
      if (OPrime.debugMode) OPrime.debug(pubtype + ": There were no subscribers.");
      return;
    }
    var i;
    var maxUnsubscribe = subscribers ? subscribers.length - 1 : 0;
    var maxPublish = subscribers ? subscribers.length : 0;

    if (action === 'publish') {
      // count up so that older subscribers get the message first
      for (i = 0; i < maxPublish; i++) {
        if (subscribers[i]) {
          // TODO there is a bug with the subscribers they are getting lost, and
          // it is trying to call fn of undefiend. this is a workaround until we
          // figure out why subscribers are getting lost. Update: i changed the
          // loop to count down and remove subscribers from the ends, now the
          // size of subscribers isnt changing such that the subscriber at index
          // i doesnt exist.
          subscribers[i].fn.call(subscribers[i].context, arg);
        }
      }
      if (OPrime.debugMode) OPrime.debug('Visited ' + subscribers.length + ' subscribers.');

    } else {

      // count down so that subscribers index exists when we remove them
      for (i = maxUnsubscribe; i >= 0; i--) {
        try {
          if (!subscribers[i].context) {
            OPrime
                .debug("This subscriber has no context. should we remove it? "
                    + i);
          }
          if (subscribers[i].context === context) {
            var removed = subscribers.splice(i, 1);
            if (OPrime.debugMode) OPrime.debug("Removed subscriber " + i + " from " + type, removed);
          } else {
            if (OPrime.debugMode) OPrime.debug(type + " keeping subscriber " + i,
                subscribers[i].context);
          }
        } catch (e) {
          if (OPrime.debugMode) OPrime.debug("problem visiting Subscriber " + i, subscribers)
        }
      }
    }
  }
};
OPrime.makePublisher = function(o) {
  var i;
  for (i in OPrime.publisher) {
    if (OPrime.publisher.hasOwnProperty(i)
        && typeof OPrime.publisher[i] === "function") {
      o[i] = OPrime.publisher[i];
    }
  }
  o.subscribers = {
    any : []
  };
};

/**
 * http://www.w3schools.com/js/js_cookies.asp name of the cookie, the value of
 * the cookie, and the number of days until the cookie expires.
 * 
 * @param c_name
 * @param value
 * @param exdays
 */
OPrime.setCookie = function(c_name, value, exdays) {
  if (value) {
    localStorage.setItem(c_name, value);
  } else {
    localStorage.removeItem(c_name);
  }
  // var exdate = new Date();
  // exdate.setDate(exdate.getDate() + exdays);
  // var c_value = escape(value)
  // + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
  // document.cookie = c_name + "=" + c_value;
};
OPrime.getCookie = function(c_name) {
  return localStorage.getItem(c_name);
  // var i, x, y, ARRcookies = document.cookie.split(";");
  // for (i = 0; i < ARRcookies.length; i++) {
  // x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
  // y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
  // x = x.replace(/^\s+|\s+$/g, "");
  // if (x == c_name) {
  // return unescape(y);
  // }
  // }
};

OPrime.isAndroidApp = function() {
  // Development tablet navigator.userAgent:
  // Mozilla/5.0 (Linux; U; Android 3.0.1; en-us; gTablet Build/HRI66)
  // AppleWebKit/534.13 (KHTML, like Gecko) Version/4.0 Safari/534.13
  // this.debug("The user agent is " + navigator.userAgent);
  return navigator.userAgent.indexOf("OfflineAndroidApp") > -1;
};

if (OPrime.isAndroidApp()) {
  var debugOrNot = Android.isD();
  console.log("Setting debug mode to the Android's mode: " + debugOrNot);
  // OPrime.debugMode = debugOrNot;
};

OPrime.isAndroid4 = function() {
  return navigator.userAgent.indexOf("Android 4") > -1;
};

OPrime.isChromeApp = function() {
  return window.location.href.indexOf("chrome-extension") > -1;
};

OPrime.isCouchApp = function() {
  return window.location.href.indexOf("_design/pages") > -1;
};

OPrime.isTouchDBApp = function() {
  return window.location.href.indexOf("localhost:8128") > -1;
};

OPrime.isBackboneCouchDBApp = function(){
  return true;
};
/**
 * If not running offline on an android or in a chrome extension, assume we are
 * online.
 * 
 * @returns {Boolean} true if not on offline Android or on a Chrome Extension
 */
OPrime.onlineOnly = function() {
  return !this.isAndroidApp() && !this.isChromeApp();
};

OPrime.getVersion = function(callback) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open('GET', 'manifest.json');
  xmlhttp.onload = function(e) {
    var manifest = JSON.parse(xmlhttp.responseText);
    callback(manifest.version);
  };
  xmlhttp.send(null);
};

/*
 * JavaScript Pretty Date Copyright (c) 2011 John Resig (ejohn.org) Licensed
 * under the MIT and GPL licenses.
 */

// Takes an ISO time and returns a string representing how
// long ago the date represents.
// modified by FieldDB team to take in Greenwich time which is what we are using
// for our time stamps so that users in differnt time zones will get real times,
// not strangely futureistic times
// we have been using JSON.stringify(new Date()) to create our timestamps
// instead of unix epoch seconds (not sure why we werent using unix epoch), so
// this function is modified from the original in that it expects dates that
// were created using
// JSON.stringify(new Date())
OPrime.prettyDate = function(time) {
  if (!time) {
    return undefined;
  }
  time = time.replace(/"/g, "");
  var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " "));
  var greenwichtimenow = JSON.stringify(new Date()).replace(/"/g, "");
  var greenwichdate = new Date((greenwichtimenow || "").replace(/-/g, "/")
      .replace(/[TZ]/g, " "));
  var diff = ((greenwichdate.getTime() - date.getTime()) / 1000);
  var day_diff = Math.floor(diff / 86400);

  if (isNaN(day_diff) || day_diff < 0 ) {
    return undefined;
  }

  if (day_diff >= 548) {
    return Math.ceil(day_diff / 365) + " years ago";
  }
  if (day_diff >= 40) {
    return Math.ceil(day_diff / 31) + " months ago";
  }
  if (day_diff >= 14) {
    return Math.ceil(day_diff / 7) + " weeks ago";
  }
  if (day_diff >= 2) {
    return Math.ceil(day_diff / 1) + " days ago";
  }
  if (day_diff >= 1) {
    return "Yesterday";
  }
  if(diff >= 4000 ){
    return Math.floor(diff / 3600) + " hours ago";
  }
//  if(diff >= 7200 ){
//    Math.floor(diff / 3600) + " 1 hour ago";
//  }
  if(diff >= 70 ){
    return Math.floor(diff / 60) + " minutes ago";
  }
  if(diff >= 120 ){
    return "1 minute ago";
  }
  return "just now";
};

OPrime.prettyTimestamp = function(timestamp) {
  var date = new Date(timestamp);
  var greenwichtimenow = new Date();
  var diff = ((greenwichtimenow.getTime() - date.getTime()) / 1000);
  var day_diff = Math.floor(diff / 86400);

  if (isNaN(day_diff) || day_diff < 0) {
    return;
  }

  if (day_diff >= 548) {
    return Math.ceil(day_diff / 365) + " years ago";
  }
  if (day_diff >= 40) {
    return Math.ceil(day_diff / 31) + " months ago";
  }
  if (day_diff >= 14) {
    return Math.ceil(day_diff / 7) + " weeks ago";
  }
  if (day_diff >= 2) {
    return Math.ceil(day_diff / 1) + " days ago";
  }
  if (day_diff >= 1) {
    return "Yesterday";
  }
  if(diff >= 4000 ){
    return Math.floor(diff / 3600) + " hours ago";
  }
//  if(diff >= 7200 ){
//    Math.floor(diff / 3600) + " 1 hour ago";
//  }
  if(diff >= 70 ){
    return Math.floor(diff / 60) + " minutes ago";
  }
  if(diff >= 120 ){
    return "1 minute ago";
  }
  return "just now";
};

/*
 * Audio functions
 */
OPrime.playAudioFile = function(divid, audioOffsetCallback, callingcontext) {
  this.debug("Playing Audio File and subscribing to audio completion.")
  var audiourl = document.getElementById(divid).getAttribute("src")
  if (!callingcontext) {
    callingcontext = window;
  }
  var callingcontextself = callingcontext;
  if (!audioOffsetCallback) {
    audioOffsetCallback = function(message) {
      if (OPrime.debugMode) OPrime.debug("In audioOffsetCallback: " + message);
      OPrime.hub.unsubscribe("playbackCompleted", null, callingcontextself);
    }
  }
  this.hub.unsubscribe("playbackCompleted", null, callingcontextself);
  this.hub.subscribe("playbackCompleted", audioOffsetCallback,
      callingcontextself);

  if (this.isAndroidApp()) {
    this.debug("Playing Audio via Android:" + audiourl + ":");
    Android.playAudio(audiourl);
  } else {
    this.debug("Playing Audio via HTML5:" + audiourl + ":");
    document.getElementById(divid).removeEventListener('ended',
        OPrime.audioEndListener);
    if (OPrime.debugMode) OPrime.debug("\tRemoved previous endaudio event listeners for " + audiourl);
    document.getElementById(divid).addEventListener('ended',
        OPrime.audioEndListener);
    document.getElementById(divid).play();
  }
}
OPrime.audioEndListener = function() {
  var audiourl = this.getAttribute("src")
  if (OPrime.debugMode) OPrime.debug("End audio ", audiourl);
  OPrime.hub.publish('playbackCompleted', audiourl);
};
OPrime.pauseAudioFile = function(divid, callingcontext) {
  if (!callingcontext) {
    callingcontext = window;
  }
  var callingcontextself = callingcontext;
  OPrime.hub.unsubscribe("playbackCompleted", null, callingcontextself);

  if (this.isAndroidApp()) {
    this.debug("Pausing Audio via Android");
    Android.pauseAudio();
  } else {
    this.debug("Pausing Audio via HTML5");
    document.getElementById(divid).pause();
    if (document.getElementById(divid).currentTime > 0.05) {
      document.getElementById(divid).currentTime = document
          .getElementById(divid).currentTime - 0.05;
    }

  }
}
OPrime.stopAudioFile = function(divid, callback, callingcontext) {
  if (!callingcontext) {
    callingcontext = window;
  }
  var callingcontextself = callingcontext;
  OPrime.hub.unsubscribe("playbackCompleted", null, callingcontextself);

  if (this.isAndroidApp()) {
    this.debug("Stopping Audio via Android");
    Android.stopAudio();
  } else {
    this.debug("Stopping Audio via HTML5");
    document.getElementById(divid).pause();
    document.getElementById(divid).currentTime = 0;
  }
  if (typeof callback == "function") {
    callback();
  }
}
OPrime.playingInterval = false;
OPrime.playIntervalAudioFile = function(divid, startime, endtime, callback) {
  startime = parseFloat(startime, 10);
  endtime = parseFloat(endtime, 10);
  if (this.isAndroidApp()) {
    this.debug("Playing Audio via Android from " + startime + " to " + endtime);
    startime = startime * 1000;
    endtime = endtime * 1000;
    var audiourl = document.getElementById(divid).getAttribute("src")
    Android.playIntervalOfAudio(audiourl, startime, endtime);
  } else {
    this.debug("Playing Audio via HTML5 from " + startime + " to " + endtime);
    document.getElementById(divid).pause();
    document.getElementById(divid).currentTime = startime;
    if (OPrime.debugMode) OPrime.debug("Cueing audio to "
        + document.getElementById(divid).currentTime);
    document.getElementById(divid).play();
    OPrime.playingInterval = true;
    document.getElementById(divid).addEventListener("timeupdate", function() {
      if (this.currentTime >= endtime && OPrime.playingInterval) {
        if (OPrime.debugMode) OPrime.debug("CurrentTime: " + this.currentTime);
        this.pause();
        OPrime.playingInterval = false; /*
                                         * workaround for not being able to
                                         * remove events
                                         */
      }
    });
  }
  if (typeof callback == "function") {
    callback();
  }
}
OPrime.captureAudio = function(resultfilename, callbackRecordingStarted,
    callbackRecordingCompleted, callingcontext) {
  if (!callingcontext) {
    callingcontext = window;
  }
  /*
   * verify completed callback and subscribe it to audioRecordingCompleted
   */
  var callingcontextself = callingcontext;
  if (!callbackRecordingCompleted) {
    callbackRecordingCompleted = function(message) {
      if (OPrime.debugMode) OPrime.debug("In callbackRecordingCompleted: " + message);
      OPrime.hub.unsubscribe("audioRecordingCompleted", null,
          callingcontextself);
    };
  }
  this.hub.unsubscribe("audioRecordingCompleted", null, callingcontextself);
  this.hub.subscribe("audioRecordingCompleted", callbackRecordingCompleted,
      callingcontextself);

  /*
   * verify started callback and subscribe it to
   * audioRecordingSucessfullyStarted
   */
  if (!callbackRecordingStarted) {
    callbackRecordingStarted = function(message) {
      if (OPrime.debugMode) OPrime.debug("In callbackRecordingStarted: " + message);
      OPrime.hub.unsubscribe("audioRecordingSucessfullyStarted", null,
          callingcontextself);
    };
  }
  this.hub.unsubscribe("audioRecordingSucessfullyStarted", null,
      callingcontextself);
  this.hub.subscribe("audioRecordingSucessfullyStarted",
      callbackRecordingStarted, callingcontextself);

  /* start the recording */
  if (this.isAndroidApp()) {
    this.debug("Recording Audio via Android");
    Android.startAudioRecordingService(resultfilename);
    // the android will publish if its successfully stopped, and that it
    // completed
  } else {
    this.debug("Recording Audio via HTML5: " + resultfilename);
    OPrime.bug("Recording audio only works on Android, because it has a microphone, and your computer might not.\n\n Faking that it was sucessful")
    // fake publish it was sucessfully started
    this.hub.publish('audioRecordingSucessfullyStarted', resultfilename);
  }

};
OPrime.stopAndSaveAudio = function(resultfilename, callbackRecordingStopped,
    callingcontext) {

  /*
   * verify started callback and subscribe it to
   * audioRecordingSucessfullyStarted
   */
  var callingcontextself = callingcontext;
  if (!callbackRecordingStopped) {
    callbackRecordingStopped = function(message) {
      if (OPrime.debugMode) OPrime.debug("In callbackRecordingStopped: " + message);
      OPrime.hub.unsubscribe("audioRecordingSucessfullyStopped", null,
          callingcontextself);
    };
  }
  this.hub.unsubscribe("audioRecordingSucessfullyStopped", null,
      callingcontextself);
  this.hub.subscribe("audioRecordingSucessfullyStopped",
      callbackRecordingStopped, callingcontextself);

  /* start the recording */
  if (this.isAndroidApp()) {
    this.debug("Stopping Recording Audio via Android");
    Android.stopAudioRecordingService(resultfilename);
    // the android will publish if its successfully started
  } else {
    this.debug("Stopping Recording Audio via HTML5: " + resultfilename);
    OPrime.bug("Recording audio only works on Android, because it has a microphone, and your computer might not.\n\n Faking that stopped and saved sucessfully");
    // fake publish it was sucessfully started
    resultfilename = "chime.mp3";
    this.hub.publish('audioRecordingSucessfullyStopped', resultfilename);
    // fake publish it finished
    this.hub.publish('audioRecordingCompleted', resultfilename);
  }

};
/*
 * Camera functions
 */
OPrime.capturePhoto = function(resultfilename, callbackPictureCaptureStarted,
    callbackPictureCaptureCompleted, callingcontext) {
  if (!callingcontext) {
    callingcontext = window;
  }
  /*
   * verify completed callback and subscribe it to audioRecordingCompleted
   */
  var callingcontextself = callingcontext;
  if (!callbackPictureCaptureStarted) {
    callbackPictureCaptureStarted = function(message) {
      if (OPrime.debugMode) OPrime.debug("In callbackPictureCaptureStarted: " + message);
      OPrime.hub.unsubscribe("pictureCaptureSucessfullyStarted", null,
          callingcontextself);
    };
  }
  if (!callbackPictureCaptureCompleted) {
    callbackPictureCaptureCompleted = function(message) {
      if (OPrime.debugMode) OPrime.debug("In callbackPictureCaptureCompleted: " + message);
      OPrime.hub.unsubscribe("pictureCaptureSucessfullyCompleted", null,
          callingcontextself);
    };
  }
  /*
   * unsubscribe this context from the chanel incase the user calls it many
   * times on teh same item, only fire the last event
   */
  this.hub.unsubscribe("pictureCaptureSucessfullyStarted", null,
      callingcontextself);
  this.hub.unsubscribe("pictureCaptureSucessfullyCompleted", null,
      callingcontextself);
  /* subscribe the caller's functions to the channels */
  this.hub.subscribe("pictureCaptureSucessfullyStarted",
      callbackPictureCaptureStarted, callingcontextself);
  this.hub.subscribe("pictureCaptureSucessfullyCompleted",
      callbackPictureCaptureCompleted, callingcontextself);

  /* start the picture taking */
  if (this.isAndroidApp()) {
    this.debug("Starting picture capture via Android");
    Android.takeAPicture(resultfilename);
    // the android will publish if its successfully started and completed
  } else {
    this.debug("Starting picture capture via HTML5: " + resultfilename);
    OPrime.bug("Taking a picture only works on Android, because it has a camera, and your computer might not.\n\n Faking that taken a picture and saved sucessfully");
    // fake publish it was sucessfully started
    resultfilename = "happyface.png";
    this.hub.publish('pictureCaptureSucessfullyStarted', resultfilename);
    this.hub.publish('pictureCaptureSucessfullyCompleted', resultfilename);
  }
};

/*
 * Initialize the debugging output, taking control from the Android side.
 */
if (OPrime.debugMode) OPrime.debug("Intializing OPrime Javascript library. \n" + "The user agent is "
    + navigator.userAgent);

if (OPrime.isAndroidApp()) {
  if (!Android.isD()) {
    this.debugMode = false;
    this.debug = function() {
    };
  } else {
    this.debugMode = true;
  }
}

OPrime.userEncryptionToken = function() {
  return "topsecretuserencryptiontokenfortestingTODOchangethis";
};

OPrime.getConnectivityType = function(callingcontextself, callback) {
  this.hub.unsubscribe("connectivityType", null, callingcontextself);
  /* subscribe the caller's functions to the channels */
  this.hub.subscribe("connectivityType", callback, callingcontextself);

  /* Fire command which will publish the connectivity */
  if (OPrime.isAndroidApp()) {
    if (OPrime.debugMode) OPrime.debug("This is an Android.");
    Android.getConectivityType();
  } else {
    OPrime.hub.publish('connectivityType', 'Probably Online');
  }
};

OPrime.getHardwareInfo = function(callingcontextself, callback) {
  this.hub.unsubscribe("hardwareDetails", null, callingcontextself);
  /* subscribe the caller's functions to the channels */
  this.hub.subscribe("hardwareDetails", callback, callingcontextself);

  /* Fire command which will publish the connectivity */
  if (OPrime.isAndroidApp()) {
    if (OPrime.debugMode) OPrime.debug("This is an Android.");
    Android.getHardwareDetails();
  } else {
    OPrime.hub.publish('hardwareDetails', {
      name : 'Browser',
      model : navigator.userAgent,
      identifier : 'TODOgetMACAddress'
    });
  }
};
OPrime.useUnsecureCouchDB = function() {
  if (OPrime.isAndroidApp()) {
    /*
     * TODO if later when TouchDB has secure databases, we can use a secure
     * TouchDB, return false
     */
    return true;
  }
  if (OPrime.runFromTouchDBOnAndroidInLocalNetwork()
      && window.location.origin.indexOf("chrome-extension") != 0) {
    return true;
  }
  return false;
};

/*
 * Functions for well formed CORS requests
 */
OPrime.makeCORSRequest = function(options) {
  OPrime.debugMode = false;
  if(!options.method){
    options.method = options.type || "GET";
  }
  if(!options.url){
    OPrime.bug("There was an error. Please report this.");
  }
  if(!options.data){
    options.data = "";
  }
  options.dataToSend = JSON.stringify(options.data).replace(/,/g,"&").replace(/:/g,"=").replace(/"/g,"").replace(/[}{]/g,"");

  if(options.method == "GET" && options.data){
    options.url = options.url + "?" + options.dataToSend;
  }
  /*
   * Helper function which handles IE
   */
  var createCORSRequest = function(method, url){
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
      // XHR for Chrome/Firefox/Opera/Safari.
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
      // XDomainRequest for IE.
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      // CORS not supported.
      xhr = null;
    }
    return xhr;
  };
  
  var xhr = createCORSRequest(options.method, options.url);
  if (!xhr) {
    OPrime.bug('CORS not supported, your browser is unable to contact the database.');
    return;
  }

//  if(options.method == "POST"){
    //xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.setRequestHeader("Content-type","application/json");
    xhr.withCredentials = true;
//  }
  
  xhr.onload = function(e,f,g) {
    var text = xhr.responseText;
    if (OPrime.debugMode) OPrime.debug('Response from CORS request to ' + options.url + ': ' + text);
    if(typeof options.success == "function"){
      if(text){
        options.success(JSON.parse(text));
      }else{
        OPrime.bug("There was no content in the server's response text. Please report this.");
        options.error(e,f,g);
      }
    }
    OPrime.debugMode = false;
  };

  xhr.onerror = function(e,f,g) {
    if (OPrime.debugMode) OPrime.debug(e,f,g);
    OPrime.bug('There was an error making the CORS request to '+options.url+ " from "+window.location.href+" the app will not function normally. Please report this.");
    if(typeof options.error == "function"){
      options.error(e,f,g);
    }
  };
  if (options.method == "POST") {
    xhr.send(JSON.stringify(options.data));
  } else {
    xhr.send();
  }
  
};



OPrime.checkToSeeIfCouchAppIsReady = function(urlIsCouchAppReady,
    readycallback, failcallback) {
  if (readycallback) {
    OPrime.checkToSeeIfCouchAppIsReadyreadycallback = readycallback;
  }
  if (!$) {
    OPrime.bug("Can't check if DB is ready.");
    console
        .warn("Can't check if DB is ready, checkToSeeIfCouchAppIsReady function depends on JQuery at the moment...");
    return;
  }
  $
      .ajax({
        type : 'GET',
        url : urlIsCouchAppReady,
        data : {},
        beforeSend : function(xhr) {
          // alert("before send" + JSON.stringify(xhr));
          xhr.setRequestHeader('Accept', 'application/json');
        },
        complete : function(e, f, g) {
          console.log(e, f, g);
          // alert("Completed contacting the server.");
        },
        success : function(serverResults) {
          console.log("serverResults" + JSON.stringify(serverResults));
          OPrime.bug("Your database is ready.");
          if (typeof readycallback == "function") {
            readycallback();
          }
        },// end successful fetch
        error : function(response) {
          // alert("Error contacting the server.");

          console.log("error response." + JSON.stringify(response));
          // alert("error response." + JSON.stringify(response));

          if (response.responseText) {
            if (response.responseText.indexOf("<html") >= 0) {
              localStorage.setItem("urlIsCouchAppReady", urlIsCouchAppReady);
              OPrime.bug("Your database is ready.");
              if (typeof OPrime.checkToSeeIfCouchAppIsReadyreadycallback == "function") {
                OPrime.checkToSeeIfCouchAppIsReadyreadycallback();
              }
              // window.location.replace(urlIsCouchAppReady);
              return;
            }
            var error = JSON.parse(response.responseText);
            if (error.error == "unauthorized") {
              OPrime.bug("CouchDB ready but you need to get a session token, this can only happen when you are online.");
            } else {
              OPrime.bug("Waiting for database to be created...");
              // Loop every 2 sec waiting for the database to load
            }
          }
          window.setTimeout(failcallback, 2000);

          // $("#user-welcome-modal").modal("show");

        },
        dataType : "json"
      });

};

OPrime.sum = function(list) {
  var result = 0;
  for (value in list) {
    result += list[value];
  }
  return result;
};

OPrime.mean = function(list) {
  return OPrime.sum(list) / list.length;
};

OPrime.standardDeviation = function(list) {
  var totalVariance = 0;
  var mean = OPrime.mean(list);
  for ( var i in list) {
    totalVariance += Math.pow(list[i] - mean, 2);
  }
  return Math.sqrt(totalVariance / list.length);
};

/*
 * Initialize pub sub
 */
OPrime.hub = {};
OPrime.makePublisher(OPrime.hub);

define("oprime", (function (global) {
    return function () {
        var ret, fn;
        return ret || global.OPrime;
    };
}(this)));

// Set the RequireJS configuration
require.config({
  paths : {

    /* jQuery and jQuery plugins */
    "jquery" : "libs/jquery",

    "pouch" : "libs/pouch.alpha",

    "oprime" : "libs/OPrime",
    "webservicesconfig" : "libs/webservicesconfig_devserver"
  },
  shim : {

    "jquery" : {
      exports : "$"
    },

    "oprime" : {
      exports : "OPrime"
    },
    "webservicesconfig" : {
      deps : [ "oprime" ],
      exports : "OPrime"
    },

    "pouch" : {
      deps : [ "jquery" ],
      exports : "Pouch"
    }
  }
});

// Initialization
require(
    [ "pouch", "oprime" ],
    function(forcingpouchtoloadearly, OPrime) {

      $('#dashboard_loading_spinner')
          .html(
              "<img class='spinner-image' src='images/loader.gif'/><p class='spinner-status'>Preparing for version 1.40...</p>");
      $('.spinner-image').css({
        'width' : function() {
          return ($(document).width() * .1) + 'px';
        },
        'height' : function() {
          return ($(document).width() * .1) + 'px';
        },
        'padding-top' : '10em'
      });
      window.username = localStorage.getItem("username_to_update");

      window.databasesThatDontNeedReplication = "sapir-firstcorpus,sapir-activity_feed,lingllama-firstcorpus-activity_feed,lingllama-firstcorpus, lingllama-cherokee-activity_feed,lingllama-cherkoee,lingllama-activity_feed,lingllama-firstcorpus-activity_feed,null,undefined,public-firstcorpus,public-activity_feed,public-firstcorpus-activity_feed,publicuser,default,null,length".split(",");
      window.actuallyReplicatedPouches = [];

      window.waitForPouchesList = function() {
        if (pouchesRequest.readyState != "done") {
          window.setTimeout(window.waitForPouchesList, 5000);
        } else {
          if (pouchesRequest.result) {
            window.backupPouches(pouchesRequest.result);
          }
        }
      };

      window.backupPouches = function(pouches) {
        console.log("Got the pouches: ", pouches);
        $("#dashboard_loading_spinner").append(
            "<h2>Backing up " + pouches.length + " databases</h2>");

        /* for each pouch, identify its remote, and begin replicating to it. */
        window.currentPouch = 0;
        window.pouches = pouches;
        if (window.currentPouch < window.pouches.length) {
          backupPouch(pouches[window.currentPouch]);
        } else {
          window.finishedReplicating();
        }
      };

      window.backupPouch = function(pouchname) {
        /* Ignore pouches that don't need to be replicated */
        if (window.databasesThatDontNeedReplication.indexOf(pouchname) >= 0) {
          /* Go to the next pouch */
          window.currentPouch++;
          if (window.currentPouch < window.pouches.length) {
            window.backupPouch(window.pouches[window.currentPouch]);
          }
        }
        try{
        
        Pouch.replicate('idb://' + pouchname,
            'https://corpusdev.lingsync.org/' + pouchname, {
              complete : function() {
                $("#dashboard_loading_spinner").append(
                    "<h2>Finished backing up " + pouchname + " to "
                        + "https://corpusdev.lingsync.org/" + pouchname
                        + "</h2>");
              },
              onChange : function(change) {
                $("#dashboard_loading_spinner").append(
                    "<div>Backing up " + pouchname + " to "
                        + "https://corpusdev.lingsync.org/" + pouchname
                        + " Change:  " + JSON.stringify(change) + '</div>');
              }
            }, function(err, changes) {
              console.log("Backing up " + pouchname + " to "
                  + 'https://corpusdev.lingsync.org/' + pouchname, err,
                  changes);
              if (!err) {
                window.actuallyReplicatedPouches.push(pouchname);
                $("#dashboard_loading_spinner").append(
                    "<h2>Finished backing up " + pouchname + " to "
                        + "https://corpusdev.lingsync.org/" + pouchname
                        + "</h2>");
                $("#dashboard_loading_spinner").append(
                    "<small>Changes " + JSON.stringify(changes) + "</small>");
              }
              /* Go to the next pouch */
              window.currentPouch++;
              if (window.currentPouch < window.pouches.length) {
                window.backupPouch(window.pouches[window.currentPouch]);
              } else {
                window.finishedReplicating();
              }
            });
        }catch(e){
          console.log("There was a problem reading or backing up this database. "+window.pouches[window.currentPouch]);
          /* Go to the next pouch */
          window.currentPouch++;
          if (window.currentPouch < window.pouches.length) {
            window.backupPouch(window.pouches[window.currentPouch]);
          } else {
            window.finishedReplicating();
          }
        }
      };

      window.finishedReplicating = function() {
        localStorage.setItem(window.username + "lastUpdatedAtVersion", "1.40");
        /* Take them to the user page so they can choose a corpus */
        alert("All your data has been backed up and is ready to be used in version 1.38 and up \n\n"
            + window.actuallyReplicatedPouches.join("\n"));
        window.location.replace("user.html");
      };

      /* Get a list of all pouches */
      window.pouchesRequest = webkitIndexedDB.webkitGetDatabaseNames();

      /* Get a session token for the database */
      var corpusloginparams = {
        name : "backupdatabases",
        password : "none"
      };
      
      window.setTimeout(window.waitForPouchesList, 1000);
      
      OPrime.makeCORSRequest({
        type : 'POST',
        url : "https://corpusdev.lingsync.org/_session",
        data : corpusloginparams,
        success : function(serverResults) {
          console.log("success",serverResults);
        },
        error : function(serverResults) {
          alert("There was a problem contacting the server to automatically back up your databases so you can use version 1.38 and greater. Please contact us at opensource@lingsync.org, someone will help you back up your data manually.");
        }
      });

    });

define("backup_pouches_dashboard", function(){});
