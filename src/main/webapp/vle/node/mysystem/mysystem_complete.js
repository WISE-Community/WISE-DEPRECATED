//for Internet Explorer
if(!Array.indexOf){
    Array.prototype.indexOf = function(obj){
        for(var i=0; i<this.length; i++){
            if(this[i]==obj){
                return i;
            }
        }
        return -1;
    };
}

/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
if(typeof YAHOO=="undefined"||!YAHOO){var YAHOO={};}YAHOO.namespace=function(){var A=arguments,E=null,C,B,D;for(C=0;C<A.length;C=C+1){D=(""+A[C]).split(".");E=YAHOO;for(B=(D[0]=="YAHOO")?1:0;B<D.length;B=B+1){E[D[B]]=E[D[B]]||{};E=E[D[B]];}}return E;};YAHOO.log=function(D,A,C){var B=YAHOO.widget.Logger;if(B&&B.log){return B.log(D,A,C);}else{return false;}};YAHOO.register=function(A,E,D){var I=YAHOO.env.modules,B,H,G,F,C;if(!I[A]){I[A]={versions:[],builds:[]};}B=I[A];H=D.version;G=D.build;F=YAHOO.env.listeners;B.name=A;B.version=H;B.build=G;B.versions.push(H);B.builds.push(G);B.mainClass=E;for(C=0;C<F.length;C=C+1){F[C](B);}if(E){E.VERSION=H;E.BUILD=G;}else{YAHOO.log("mainClass is undefined for module "+A,"warn");}};YAHOO.env=YAHOO.env||{modules:[],listeners:[]};YAHOO.env.getVersion=function(A){return YAHOO.env.modules[A]||null;};YAHOO.env.ua=function(){var C={ie:0,opera:0,gecko:0,webkit:0,mobile:null,air:0,caja:0},B=navigator.userAgent,A;if((/KHTML/).test(B)){C.webkit=1;}A=B.match(/AppleWebKit\/([^\s]*)/);if(A&&A[1]){C.webkit=parseFloat(A[1]);if(/ Mobile\//.test(B)){C.mobile="Apple";}else{A=B.match(/NokiaN[^\/]*/);if(A){C.mobile=A[0];}}A=B.match(/AdobeAIR\/([^\s]*)/);if(A){C.air=A[0];}}if(!C.webkit){A=B.match(/Opera[\s\/]([^\s]*)/);if(A&&A[1]){C.opera=parseFloat(A[1]);A=B.match(/Opera Mini[^;]*/);if(A){C.mobile=A[0];}}else{A=B.match(/MSIE\s([^;]*)/);if(A&&A[1]){C.ie=parseFloat(A[1]);}else{A=B.match(/Gecko\/([^\s]*)/);if(A){C.gecko=1;A=B.match(/rv:([^\s\)]*)/);if(A&&A[1]){C.gecko=parseFloat(A[1]);}}}}}A=B.match(/Caja\/([^\s]*)/);if(A&&A[1]){C.caja=parseFloat(A[1]);}return C;}();(function(){YAHOO.namespace("util","widget","example");if("undefined"!==typeof YAHOO_config){var B=YAHOO_config.listener,A=YAHOO.env.listeners,D=true,C;if(B){for(C=0;C<A.length;C=C+1){if(A[C]==B){D=false;break;}}if(D){A.push(B);}}}})();YAHOO.lang=YAHOO.lang||{};(function(){var B=YAHOO.lang,F="[object Array]",C="[object Function]",A=Object.prototype,E=["toString","valueOf"],D={isArray:function(G){return A.toString.apply(G)===F;},isBoolean:function(G){return typeof G==="boolean";},isFunction:function(G){return A.toString.apply(G)===C;},isNull:function(G){return G===null;},isNumber:function(G){return typeof G==="number"&&isFinite(G);},isObject:function(G){return(G&&(typeof G==="object"||B.isFunction(G)))||false;},isString:function(G){return typeof G==="string";},isUndefined:function(G){return typeof G==="undefined";},_IEEnumFix:(YAHOO.env.ua.ie)?function(I,H){var G,K,J;for(G=0;G<E.length;G=G+1){K=E[G];J=H[K];if(B.isFunction(J)&&J!=A[K]){I[K]=J;}}}:function(){},extend:function(J,K,I){if(!K||!J){throw new Error("extend failed, please check that "+"all dependencies are included.");}var H=function(){},G;H.prototype=K.prototype;J.prototype=new H();J.prototype.constructor=J;J.superclass=K.prototype;if(K.prototype.constructor==A.constructor){K.prototype.constructor=K;}if(I){for(G in I){if(B.hasOwnProperty(I,G)){J.prototype[G]=I[G];}}B._IEEnumFix(J.prototype,I);}},augmentObject:function(K,J){if(!J||!K){throw new Error("Absorb failed, verify dependencies.");}var G=arguments,I,L,H=G[2];if(H&&H!==true){for(I=2;I<G.length;I=I+1){K[G[I]]=J[G[I]];}}else{for(L in J){if(H||!(L in K)){K[L]=J[L];}}B._IEEnumFix(K,J);}},augmentProto:function(J,I){if(!I||!J){throw new Error("Augment failed, verify dependencies.");}var G=[J.prototype,I.prototype],H;for(H=2;H<arguments.length;H=H+1){G.push(arguments[H]);}B.augmentObject.apply(this,G);},dump:function(G,L){var I,K,N=[],O="{...}",H="f(){...}",M=", ",J=" => ";if(!B.isObject(G)){return G+"";}else{if(G instanceof Date||("nodeType" in G&&"tagName" in G)){return G;}else{if(B.isFunction(G)){return H;}}}L=(B.isNumber(L))?L:3;if(B.isArray(G)){N.push("[");for(I=0,K=G.length;I<K;I=I+1){if(B.isObject(G[I])){N.push((L>0)?B.dump(G[I],L-1):O);}else{N.push(G[I]);}N.push(M);}if(N.length>1){N.pop();}N.push("]");}else{N.push("{");for(I in G){if(B.hasOwnProperty(G,I)){N.push(I+J);if(B.isObject(G[I])){N.push((L>0)?B.dump(G[I],L-1):O);}else{N.push(G[I]);}N.push(M);}}if(N.length>1){N.pop();}N.push("}");}return N.join("");},substitute:function(V,H,O){var L,K,J,R,S,U,Q=[],I,M="dump",P=" ",G="{",T="}",N;for(;;){L=V.lastIndexOf(G);if(L<0){break;}K=V.indexOf(T,L);if(L+1>=K){break;}I=V.substring(L+1,K);R=I;U=null;J=R.indexOf(P);if(J>-1){U=R.substring(J+1);R=R.substring(0,J);}S=H[R];if(O){S=O(R,S,U);}if(B.isObject(S)){if(B.isArray(S)){S=B.dump(S,parseInt(U,10));}else{U=U||"";N=U.indexOf(M);if(N>-1){U=U.substring(4);}if(S.toString===A.toString||N>-1){S=B.dump(S,parseInt(U,10));}else{S=S.toString();}}}else{if(!B.isString(S)&&!B.isNumber(S)){S="~-"+Q.length+"-~";Q[Q.length]=I;}}V=V.substring(0,L)+S+V.substring(K+1);}for(L=Q.length-1;L>=0;L=L-1){V=V.replace(new RegExp("~-"+L+"-~"),"{"+Q[L]+"}","g");}return V;},trim:function(G){try{return G.replace(/^\s+|\s+$/g,"");}catch(H){return G;}},merge:function(){var J={},H=arguments,G=H.length,I;for(I=0;I<G;I=I+1){B.augmentObject(J,H[I],true);}return J;},later:function(N,H,O,J,K){N=N||0;H=H||{};var I=O,M=J,L,G;if(B.isString(O)){I=H[O];}if(!I){throw new TypeError("method undefined");}if(!B.isArray(M)){M=[J];}L=function(){I.apply(H,M);};G=(K)?setInterval(L,N):setTimeout(L,N);return{interval:K,cancel:function(){if(this.interval){clearInterval(G);}else{clearTimeout(G);}}};},isValue:function(G){return(B.isObject(G)||B.isString(G)||B.isNumber(G)||B.isBoolean(G));}};B.hasOwnProperty=(A.hasOwnProperty)?function(G,H){return G&&G.hasOwnProperty(H);}:function(G,H){return !B.isUndefined(G[H])&&G.constructor.prototype[H]!==G[H];};D.augmentObject(B,D,true);YAHOO.util.Lang=B;B.augment=B.augmentProto;YAHOO.augment=B.augmentProto;YAHOO.extend=B.extend;})();YAHOO.register("yahoo",YAHOO,{version:"2.7.0",build:"1796"});YAHOO.util.Get=function(){var M={},L=0,R=0,E=false,N=YAHOO.env.ua,S=YAHOO.lang;var J=function(W,T,X){var U=X||window,Y=U.document,Z=Y.createElement(W);for(var V in T){if(T[V]&&YAHOO.lang.hasOwnProperty(T,V)){Z.setAttribute(V,T[V]);}}return Z;};var I=function(T,U,W){var V=W||"utf-8";return J("link",{"id":"yui__dyn_"+(R++),"type":"text/css","charset":V,"rel":"stylesheet","href":T},U);
};var P=function(T,U,W){var V=W||"utf-8";return J("script",{"id":"yui__dyn_"+(R++),"type":"text/javascript","charset":V,"src":T},U);};var A=function(T,U){return{tId:T.tId,win:T.win,data:T.data,nodes:T.nodes,msg:U,purge:function(){D(this.tId);}};};var B=function(T,W){var U=M[W],V=(S.isString(T))?U.win.document.getElementById(T):T;if(!V){Q(W,"target node not found: "+T);}return V;};var Q=function(W,V){var T=M[W];if(T.onFailure){var U=T.scope||T.win;T.onFailure.call(U,A(T,V));}};var C=function(W){var T=M[W];T.finished=true;if(T.aborted){var V="transaction "+W+" was aborted";Q(W,V);return;}if(T.onSuccess){var U=T.scope||T.win;T.onSuccess.call(U,A(T));}};var O=function(V){var T=M[V];if(T.onTimeout){var U=T.scope||T;T.onTimeout.call(U,A(T));}};var G=function(V,Z){var U=M[V];if(U.timer){U.timer.cancel();}if(U.aborted){var X="transaction "+V+" was aborted";Q(V,X);return;}if(Z){U.url.shift();if(U.varName){U.varName.shift();}}else{U.url=(S.isString(U.url))?[U.url]:U.url;if(U.varName){U.varName=(S.isString(U.varName))?[U.varName]:U.varName;}}var c=U.win,b=c.document,a=b.getElementsByTagName("head")[0],W;if(U.url.length===0){if(U.type==="script"&&N.webkit&&N.webkit<420&&!U.finalpass&&!U.varName){var Y=P(null,U.win,U.charset);Y.innerHTML='YAHOO.util.Get._finalize("'+V+'");';U.nodes.push(Y);a.appendChild(Y);}else{C(V);}return;}var T=U.url[0];if(!T){U.url.shift();return G(V);}if(U.timeout){U.timer=S.later(U.timeout,U,O,V);}if(U.type==="script"){W=P(T,c,U.charset);}else{W=I(T,c,U.charset);}F(U.type,W,V,T,c,U.url.length);U.nodes.push(W);if(U.insertBefore){var e=B(U.insertBefore,V);if(e){e.parentNode.insertBefore(W,e);}}else{a.appendChild(W);}if((N.webkit||N.gecko)&&U.type==="css"){G(V,T);}};var K=function(){if(E){return;}E=true;for(var T in M){var U=M[T];if(U.autopurge&&U.finished){D(U.tId);delete M[T];}}E=false;};var D=function(a){var X=M[a];if(X){var Z=X.nodes,T=Z.length,Y=X.win.document,W=Y.getElementsByTagName("head")[0];if(X.insertBefore){var V=B(X.insertBefore,a);if(V){W=V.parentNode;}}for(var U=0;U<T;U=U+1){W.removeChild(Z[U]);}X.nodes=[];}};var H=function(U,T,V){var X="q"+(L++);V=V||{};if(L%YAHOO.util.Get.PURGE_THRESH===0){K();}M[X]=S.merge(V,{tId:X,type:U,url:T,finished:false,aborted:false,nodes:[]});var W=M[X];W.win=W.win||window;W.scope=W.scope||W.win;W.autopurge=("autopurge" in W)?W.autopurge:(U==="script")?true:false;S.later(0,W,G,X);return{tId:X};};var F=function(c,X,W,U,Y,Z,b){var a=b||G;if(N.ie){X.onreadystatechange=function(){var d=this.readyState;if("loaded"===d||"complete"===d){X.onreadystatechange=null;a(W,U);}};}else{if(N.webkit){if(c==="script"){if(N.webkit>=420){X.addEventListener("load",function(){a(W,U);});}else{var T=M[W];if(T.varName){var V=YAHOO.util.Get.POLL_FREQ;T.maxattempts=YAHOO.util.Get.TIMEOUT/V;T.attempts=0;T._cache=T.varName[0].split(".");T.timer=S.later(V,T,function(j){var f=this._cache,e=f.length,d=this.win,g;for(g=0;g<e;g=g+1){d=d[f[g]];if(!d){this.attempts++;if(this.attempts++>this.maxattempts){var h="Over retry limit, giving up";T.timer.cancel();Q(W,h);}else{}return;}}T.timer.cancel();a(W,U);},null,true);}else{S.later(YAHOO.util.Get.POLL_FREQ,null,a,[W,U]);}}}}else{X.onload=function(){a(W,U);};}}};return{POLL_FREQ:10,PURGE_THRESH:20,TIMEOUT:2000,_finalize:function(T){S.later(0,null,C,T);},abort:function(U){var V=(S.isString(U))?U:U.tId;var T=M[V];if(T){T.aborted=true;}},script:function(T,U){return H("script",T,U);},css:function(T,U){return H("css",T,U);}};}();YAHOO.register("get",YAHOO.util.Get,{version:"2.7.0",build:"1796"});(function(){var Y=YAHOO,util=Y.util,lang=Y.lang,env=Y.env,PROV="_provides",SUPER="_supersedes",REQ="expanded",AFTER="_after";var YUI={dupsAllowed:{"yahoo":true,"get":true},info:{"root":"2.7.0/build/","base":"http://yui.yahooapis.com/2.7.0/build/","comboBase":"http://yui.yahooapis.com/combo?","skin":{"defaultSkin":"sam","base":"assets/skins/","path":"skin.css","after":["reset","fonts","grids","base"],"rollup":3},dupsAllowed:["yahoo","get"],"moduleInfo":{"animation":{"type":"js","path":"animation/animation-min.js","requires":["dom","event"]},"autocomplete":{"type":"js","path":"autocomplete/autocomplete-min.js","requires":["dom","event","datasource"],"optional":["connection","animation"],"skinnable":true},"base":{"type":"css","path":"base/base-min.css","after":["reset","fonts","grids"]},"button":{"type":"js","path":"button/button-min.js","requires":["element"],"optional":["menu"],"skinnable":true},"calendar":{"type":"js","path":"calendar/calendar-min.js","requires":["event","dom"],"skinnable":true},"carousel":{"type":"js","path":"carousel/carousel-min.js","requires":["element"],"optional":["animation"],"skinnable":true},"charts":{"type":"js","path":"charts/charts-min.js","requires":["element","json","datasource"]},"colorpicker":{"type":"js","path":"colorpicker/colorpicker-min.js","requires":["slider","element"],"optional":["animation"],"skinnable":true},"connection":{"type":"js","path":"connection/connection-min.js","requires":["event"]},"container":{"type":"js","path":"container/container-min.js","requires":["dom","event"],"optional":["dragdrop","animation","connection"],"supersedes":["containercore"],"skinnable":true},"containercore":{"type":"js","path":"container/container_core-min.js","requires":["dom","event"],"pkg":"container"},"cookie":{"type":"js","path":"cookie/cookie-min.js","requires":["yahoo"]},"datasource":{"type":"js","path":"datasource/datasource-min.js","requires":["event"],"optional":["connection"]},"datatable":{"type":"js","path":"datatable/datatable-min.js","requires":["element","datasource"],"optional":["calendar","dragdrop","paginator"],"skinnable":true},"dom":{"type":"js","path":"dom/dom-min.js","requires":["yahoo"]},"dragdrop":{"type":"js","path":"dragdrop/dragdrop-min.js","requires":["dom","event"]},"editor":{"type":"js","path":"editor/editor-min.js","requires":["menu","element","button"],"optional":["animation","dragdrop"],"supersedes":["simpleeditor"],"skinnable":true},"element":{"type":"js","path":"element/element-min.js","requires":["dom","event"]},"event":{"type":"js","path":"event/event-min.js","requires":["yahoo"]},"fonts":{"type":"css","path":"fonts/fonts-min.css"},"get":{"type":"js","path":"get/get-min.js","requires":["yahoo"]},"grids":{"type":"css","path":"grids/grids-min.css","requires":["fonts"],"optional":["reset"]},"history":{"type":"js","path":"history/history-min.js","requires":["event"]},"imagecropper":{"type":"js","path":"imagecropper/imagecropper-min.js","requires":["dom","event","dragdrop","element","resize"],"skinnable":true},"imageloader":{"type":"js","path":"imageloader/imageloader-min.js","requires":["event","dom"]},"json":{"type":"js","path":"json/json-min.js","requires":["yahoo"]},"layout":{"type":"js","path":"layout/layout-min.js","requires":["dom","event","element"],"optional":["animation","dragdrop","resize","selector"],"skinnable":true},"logger":{"type":"js","path":"logger/logger-min.js","requires":["event","dom"],"optional":["dragdrop"],"skinnable":true},"menu":{"type":"js","path":"menu/menu-min.js","requires":["containercore"],"skinnable":true},"paginator":{"type":"js","path":"paginator/paginator-min.js","requires":["element"],"skinnable":true},"profiler":{"type":"js","path":"profiler/profiler-min.js","requires":["yahoo"]},"profilerviewer":{"type":"js","path":"profilerviewer/profilerviewer-min.js","requires":["profiler","yuiloader","element"],"skinnable":true},"reset":{"type":"css","path":"reset/reset-min.css"},"reset-fonts-grids":{"type":"css","path":"reset-fonts-grids/reset-fonts-grids.css","supersedes":["reset","fonts","grids","reset-fonts"],"rollup":4},"reset-fonts":{"type":"css","path":"reset-fonts/reset-fonts.css","supersedes":["reset","fonts"],"rollup":2},"resize":{"type":"js","path":"resize/resize-min.js","requires":["dom","event","dragdrop","element"],"optional":["animation"],"skinnable":true},"selector":{"type":"js","path":"selector/selector-min.js","requires":["yahoo","dom"]},"simpleeditor":{"type":"js","path":"editor/simpleeditor-min.js","requires":["element"],"optional":["containercore","menu","button","animation","dragdrop"],"skinnable":true,"pkg":"editor"},"slider":{"type":"js","path":"slider/slider-min.js","requires":["dragdrop"],"optional":["animation"],"skinnable":true},"stylesheet":{"type":"js","path":"stylesheet/stylesheet-min.js","requires":["yahoo"]},"tabview":{"type":"js","path":"tabview/tabview-min.js","requires":["element"],"optional":["connection"],"skinnable":true},"treeview":{"type":"js","path":"treeview/treeview-min.js","requires":["event","dom"],"optional":["json"],"skinnable":true},"uploader":{"type":"js","path":"uploader/uploader.js","requires":["element"]},"utilities":{"type":"js","path":"utilities/utilities.js","supersedes":["yahoo","event","dragdrop","animation","dom","connection","element","yahoo-dom-event","get","yuiloader","yuiloader-dom-event"],"rollup":8},"yahoo":{"type":"js","path":"yahoo/yahoo-min.js"},"yahoo-dom-event":{"type":"js","path":"yahoo-dom-event/yahoo-dom-event.js","supersedes":["yahoo","event","dom"],"rollup":3},"yuiloader":{"type":"js","path":"yuiloader/yuiloader-min.js","supersedes":["yahoo","get"]},"yuiloader-dom-event":{"type":"js","path":"yuiloader-dom-event/yuiloader-dom-event.js","supersedes":["yahoo","dom","event","get","yuiloader","yahoo-dom-event"],"rollup":5},"yuitest":{"type":"js","path":"yuitest/yuitest-min.js","requires":["logger"],"skinnable":true}}},ObjectUtil:{appendArray:function(o,a){if(a){for(var i=0;
i<a.length;i=i+1){o[a[i]]=true;}}},keys:function(o,ordered){var a=[],i;for(i in o){if(lang.hasOwnProperty(o,i)){a.push(i);}}return a;}},ArrayUtil:{appendArray:function(a1,a2){Array.prototype.push.apply(a1,a2);},indexOf:function(a,val){for(var i=0;i<a.length;i=i+1){if(a[i]===val){return i;}}return -1;},toObject:function(a){var o={};for(var i=0;i<a.length;i=i+1){o[a[i]]=true;}return o;},uniq:function(a){return YUI.ObjectUtil.keys(YUI.ArrayUtil.toObject(a));}}};YAHOO.util.YUILoader=function(o){this._internalCallback=null;this._useYahooListener=false;this.onSuccess=null;this.onFailure=Y.log;this.onProgress=null;this.onTimeout=null;this.scope=this;this.data=null;this.insertBefore=null;this.charset=null;this.varName=null;this.base=YUI.info.base;this.comboBase=YUI.info.comboBase;this.combine=false;this.root=YUI.info.root;this.timeout=0;this.ignore=null;this.force=null;this.allowRollup=true;this.filter=null;this.required={};this.moduleInfo=lang.merge(YUI.info.moduleInfo);this.rollups=null;this.loadOptional=false;this.sorted=[];this.loaded={};this.dirty=true;this.inserted={};var self=this;env.listeners.push(function(m){if(self._useYahooListener){self.loadNext(m.name);}});this.skin=lang.merge(YUI.info.skin);this._config(o);};Y.util.YUILoader.prototype={FILTERS:{RAW:{"searchExp":"-min\\.js","replaceStr":".js"},DEBUG:{"searchExp":"-min\\.js","replaceStr":"-debug.js"}},SKIN_PREFIX:"skin-",_config:function(o){if(o){for(var i in o){if(lang.hasOwnProperty(o,i)){if(i=="require"){this.require(o[i]);}else{this[i]=o[i];}}}}var f=this.filter;if(lang.isString(f)){f=f.toUpperCase();if(f==="DEBUG"){this.require("logger");}if(!Y.widget.LogWriter){Y.widget.LogWriter=function(){return Y;};}this.filter=this.FILTERS[f];}},addModule:function(o){if(!o||!o.name||!o.type||(!o.path&&!o.fullpath)){return false;}o.ext=("ext" in o)?o.ext:true;o.requires=o.requires||[];this.moduleInfo[o.name]=o;this.dirty=true;return true;},require:function(what){var a=(typeof what==="string")?arguments:what;this.dirty=true;YUI.ObjectUtil.appendArray(this.required,a);},_addSkin:function(skin,mod){var name=this.formatSkin(skin),info=this.moduleInfo,sinf=this.skin,ext=info[mod]&&info[mod].ext;if(!info[name]){this.addModule({"name":name,"type":"css","path":sinf.base+skin+"/"+sinf.path,"after":sinf.after,"rollup":sinf.rollup,"ext":ext});}if(mod){name=this.formatSkin(skin,mod);if(!info[name]){var mdef=info[mod],pkg=mdef.pkg||mod;this.addModule({"name":name,"type":"css","after":sinf.after,"path":pkg+"/"+sinf.base+skin+"/"+mod+".css","ext":ext});}}return name;},getRequires:function(mod){if(!mod){return[];}if(!this.dirty&&mod.expanded){return mod.expanded;}mod.requires=mod.requires||[];var i,d=[],r=mod.requires,o=mod.optional,info=this.moduleInfo,m;for(i=0;i<r.length;i=i+1){d.push(r[i]);m=info[r[i]];YUI.ArrayUtil.appendArray(d,this.getRequires(m));}if(o&&this.loadOptional){for(i=0;i<o.length;i=i+1){d.push(o[i]);YUI.ArrayUtil.appendArray(d,this.getRequires(info[o[i]]));}}mod.expanded=YUI.ArrayUtil.uniq(d);return mod.expanded;},getProvides:function(name,notMe){var addMe=!(notMe),ckey=(addMe)?PROV:SUPER,m=this.moduleInfo[name],o={};if(!m){return o;}if(m[ckey]){return m[ckey];}var s=m.supersedes,done={},me=this;var add=function(mm){if(!done[mm]){done[mm]=true;lang.augmentObject(o,me.getProvides(mm));}};if(s){for(var i=0;i<s.length;i=i+1){add(s[i]);}}m[SUPER]=o;m[PROV]=lang.merge(o);m[PROV][name]=true;return m[ckey];},calculate:function(o){if(o||this.dirty){this._config(o);this._setup();this._explode();if(this.allowRollup){this._rollup();}this._reduce();this._sort();this.dirty=false;}},_setup:function(){var info=this.moduleInfo,name,i,j;for(name in info){if(lang.hasOwnProperty(info,name)){var m=info[name];if(m&&m.skinnable){var o=this.skin.overrides,smod;if(o&&o[name]){for(i=0;i<o[name].length;i=i+1){smod=this._addSkin(o[name][i],name);}}else{smod=this._addSkin(this.skin.defaultSkin,name);}m.requires.push(smod);}}}var l=lang.merge(this.inserted);if(!this._sandbox){l=lang.merge(l,env.modules);}if(this.ignore){YUI.ObjectUtil.appendArray(l,this.ignore);}if(this.force){for(i=0;i<this.force.length;i=i+1){if(this.force[i] in l){delete l[this.force[i]];}}}for(j in l){if(lang.hasOwnProperty(l,j)){lang.augmentObject(l,this.getProvides(j));}}this.loaded=l;},_explode:function(){var r=this.required,i,mod;for(i in r){if(lang.hasOwnProperty(r,i)){mod=this.moduleInfo[i];if(mod){var req=this.getRequires(mod);if(req){YUI.ObjectUtil.appendArray(r,req);}}}}},_skin:function(){},formatSkin:function(skin,mod){var s=this.SKIN_PREFIX+skin;if(mod){s=s+"-"+mod;}return s;},parseSkin:function(mod){if(mod.indexOf(this.SKIN_PREFIX)===0){var a=mod.split("-");return{skin:a[1],module:a[2]};}return null;},_rollup:function(){var i,j,m,s,rollups={},r=this.required,roll,info=this.moduleInfo;if(this.dirty||!this.rollups){for(i in info){if(lang.hasOwnProperty(info,i)){m=info[i];if(m&&m.rollup){rollups[i]=m;}}}this.rollups=rollups;}for(;;){var rolled=false;for(i in rollups){if(!r[i]&&!this.loaded[i]){m=info[i];s=m.supersedes;roll=false;if(!m.rollup){continue;}var skin=(m.ext)?false:this.parseSkin(i),c=0;if(skin){for(j in r){if(lang.hasOwnProperty(r,j)){if(i!==j&&this.parseSkin(j)){c++;roll=(c>=m.rollup);if(roll){break;}}}}}else{for(j=0;j<s.length;j=j+1){if(this.loaded[s[j]]&&(!YUI.dupsAllowed[s[j]])){roll=false;break;}else{if(r[s[j]]){c++;roll=(c>=m.rollup);if(roll){break;}}}}}if(roll){r[i]=true;rolled=true;this.getRequires(m);}}}if(!rolled){break;}}},_reduce:function(){var i,j,s,m,r=this.required;for(i in r){if(i in this.loaded){delete r[i];}else{var skinDef=this.parseSkin(i);if(skinDef){if(!skinDef.module){var skin_pre=this.SKIN_PREFIX+skinDef.skin;for(j in r){if(lang.hasOwnProperty(r,j)){m=this.moduleInfo[j];var ext=m&&m.ext;if(!ext&&j!==i&&j.indexOf(skin_pre)>-1){delete r[j];}}}}}else{m=this.moduleInfo[i];s=m&&m.supersedes;if(s){for(j=0;j<s.length;j=j+1){if(s[j] in r){delete r[s[j]];}}}}}}},_onFailure:function(msg){YAHOO.log("Failure","info","loader");var f=this.onFailure;if(f){f.call(this.scope,{msg:"failure: "+msg,data:this.data,success:false});
}},_onTimeout:function(){YAHOO.log("Timeout","info","loader");var f=this.onTimeout;if(f){f.call(this.scope,{msg:"timeout",data:this.data,success:false});}},_sort:function(){var s=[],info=this.moduleInfo,loaded=this.loaded,checkOptional=!this.loadOptional,me=this;var requires=function(aa,bb){var mm=info[aa];if(loaded[bb]||!mm){return false;}var ii,rr=mm.expanded,after=mm.after,other=info[bb],optional=mm.optional;if(rr&&YUI.ArrayUtil.indexOf(rr,bb)>-1){return true;}if(after&&YUI.ArrayUtil.indexOf(after,bb)>-1){return true;}if(checkOptional&&optional&&YUI.ArrayUtil.indexOf(optional,bb)>-1){return true;}var ss=info[bb]&&info[bb].supersedes;if(ss){for(ii=0;ii<ss.length;ii=ii+1){if(requires(aa,ss[ii])){return true;}}}if(mm.ext&&mm.type=="css"&&!other.ext&&other.type=="css"){return true;}return false;};for(var i in this.required){if(lang.hasOwnProperty(this.required,i)){s.push(i);}}var p=0;for(;;){var l=s.length,a,b,j,k,moved=false;for(j=p;j<l;j=j+1){a=s[j];for(k=j+1;k<l;k=k+1){if(requires(a,s[k])){b=s.splice(k,1);s.splice(j,0,b[0]);moved=true;break;}}if(moved){break;}else{p=p+1;}}if(!moved){break;}}this.sorted=s;},toString:function(){var o={type:"YUILoader",base:this.base,filter:this.filter,required:this.required,loaded:this.loaded,inserted:this.inserted};lang.dump(o,1);},_combine:function(){this._combining=[];var self=this,s=this.sorted,len=s.length,js=this.comboBase,css=this.comboBase,target,startLen=js.length,i,m,type=this.loadType;YAHOO.log("type "+type);for(i=0;i<len;i=i+1){m=this.moduleInfo[s[i]];if(m&&!m.ext&&(!type||type===m.type)){target=this.root+m.path;target+="&";if(m.type=="js"){js+=target;}else{css+=target;}this._combining.push(s[i]);}}if(this._combining.length){YAHOO.log("Attempting to combine: "+this._combining,"info","loader");var callback=function(o){var c=this._combining,len=c.length,i,m;for(i=0;i<len;i=i+1){this.inserted[c[i]]=true;}this.loadNext(o.data);},loadScript=function(){if(js.length>startLen){YAHOO.util.Get.script(self._filter(js),{data:self._loading,onSuccess:callback,onFailure:self._onFailure,onTimeout:self._onTimeout,insertBefore:self.insertBefore,charset:self.charset,timeout:self.timeout,scope:self});}};if(css.length>startLen){YAHOO.util.Get.css(this._filter(css),{data:this._loading,onSuccess:loadScript,onFailure:this._onFailure,onTimeout:this._onTimeout,insertBefore:this.insertBefore,charset:this.charset,timeout:this.timeout,scope:self});}else{loadScript();}return;}else{this.loadNext(this._loading);}},insert:function(o,type){this.calculate(o);this._loading=true;this.loadType=type;if(this.combine){return this._combine();}if(!type){var self=this;this._internalCallback=function(){self._internalCallback=null;self.insert(null,"js");};this.insert(null,"css");return;}this.loadNext();},sandbox:function(o,type){this._config(o);if(!this.onSuccess){throw new Error("You must supply an onSuccess handler for your sandbox");}this._sandbox=true;var self=this;if(!type||type!=="js"){this._internalCallback=function(){self._internalCallback=null;self.sandbox(null,"js");};this.insert(null,"css");return;}if(!util.Connect){var ld=new YAHOO.util.YUILoader();ld.insert({base:this.base,filter:this.filter,require:"connection",insertBefore:this.insertBefore,charset:this.charset,onSuccess:function(){this.sandbox(null,"js");},scope:this},"js");return;}this._scriptText=[];this._loadCount=0;this._stopCount=this.sorted.length;this._xhr=[];this.calculate();var s=this.sorted,l=s.length,i,m,url;for(i=0;i<l;i=i+1){m=this.moduleInfo[s[i]];if(!m){this._onFailure("undefined module "+m);for(var j=0;j<this._xhr.length;j=j+1){this._xhr[j].abort();}return;}if(m.type!=="js"){this._loadCount++;continue;}url=m.fullpath;url=(url)?this._filter(url):this._url(m.path);var xhrData={success:function(o){var idx=o.argument[0],name=o.argument[2];this._scriptText[idx]=o.responseText;if(this.onProgress){this.onProgress.call(this.scope,{name:name,scriptText:o.responseText,xhrResponse:o,data:this.data});}this._loadCount++;if(this._loadCount>=this._stopCount){var v=this.varName||"YAHOO";var t="(function() {\n";var b="\nreturn "+v+";\n})();";var ref=eval(t+this._scriptText.join("\n")+b);this._pushEvents(ref);if(ref){this.onSuccess.call(this.scope,{reference:ref,data:this.data});}else{this._onFailure.call(this.varName+" reference failure");}}},failure:function(o){this.onFailure.call(this.scope,{msg:"XHR failure",xhrResponse:o,data:this.data});},scope:this,argument:[i,url,s[i]]};this._xhr.push(util.Connect.asyncRequest("GET",url,xhrData));}},loadNext:function(mname){if(!this._loading){return;}if(mname){if(mname!==this._loading){return;}this.inserted[mname]=true;if(this.onProgress){this.onProgress.call(this.scope,{name:mname,data:this.data});}}var s=this.sorted,len=s.length,i,m;for(i=0;i<len;i=i+1){if(s[i] in this.inserted){continue;}if(s[i]===this._loading){return;}m=this.moduleInfo[s[i]];if(!m){this.onFailure.call(this.scope,{msg:"undefined module "+m,data:this.data});return;}if(!this.loadType||this.loadType===m.type){this._loading=s[i];var fn=(m.type==="css")?util.Get.css:util.Get.script,url=m.fullpath,self=this,c=function(o){self.loadNext(o.data);};url=(url)?this._filter(url):this._url(m.path);if(env.ua.webkit&&env.ua.webkit<420&&m.type==="js"&&!m.varName){c=null;this._useYahooListener=true;}fn(url,{data:s[i],onSuccess:c,onFailure:this._onFailure,onTimeout:this._onTimeout,insertBefore:this.insertBefore,charset:this.charset,timeout:this.timeout,varName:m.varName,scope:self});return;}}this._loading=null;if(this._internalCallback){var f=this._internalCallback;this._internalCallback=null;f.call(this);}else{if(this.onSuccess){this._pushEvents();this.onSuccess.call(this.scope,{data:this.data});}}},_pushEvents:function(ref){var r=ref||YAHOO;if(r.util&&r.util.Event){r.util.Event._load();}},_filter:function(str){var f=this.filter;return(f)?str.replace(new RegExp(f.searchExp,"g"),f.replaceStr):str;},_url:function(path){return this._filter((this.base||"")+path);}};})();YAHOO.register("yuiloader",YAHOO.util.YUILoader,{version:"2.7.0",build:"1796"});
(function(){YAHOO.env._id_counter=YAHOO.env._id_counter||0;var E=YAHOO.util,L=YAHOO.lang,m=YAHOO.env.ua,A=YAHOO.lang.trim,d={},h={},N=/^t(?:able|d|h)$/i,X=/color$/i,K=window.document,W=K.documentElement,e="ownerDocument",n="defaultView",v="documentElement",t="compatMode",b="offsetLeft",P="offsetTop",u="offsetParent",Z="parentNode",l="nodeType",C="tagName",O="scrollLeft",i="scrollTop",Q="getBoundingClientRect",w="getComputedStyle",a="currentStyle",M="CSS1Compat",c="BackCompat",g="class",F="className",J="",B=" ",s="(?:^|\\s)",k="(?= |$)",U="g",p="position",f="fixed",V="relative",j="left",o="top",r="medium",q="borderLeftWidth",R="borderTopWidth",D=m.opera,I=m.webkit,H=m.gecko,T=m.ie;E.Dom={CUSTOM_ATTRIBUTES:(!W.hasAttribute)?{"for":"htmlFor","class":F}:{"htmlFor":"for","className":g},get:function(y){var AA,Y,z,x,G;if(y){if(y[l]||y.item){return y;}if(typeof y==="string"){AA=y;y=K.getElementById(y);if(y&&y.id===AA){return y;}else{if(y&&K.all){y=null;Y=K.all[AA];for(x=0,G=Y.length;x<G;++x){if(Y[x].id===AA){return Y[x];}}}}return y;}if(y.DOM_EVENTS){y=y.get("element");}if("length" in y){z=[];for(x=0,G=y.length;x<G;++x){z[z.length]=E.Dom.get(y[x]);}return z;}return y;}return null;},getComputedStyle:function(G,Y){if(window[w]){return G[e][n][w](G,null)[Y];}else{if(G[a]){return E.Dom.IE_ComputedStyle.get(G,Y);}}},getStyle:function(G,Y){return E.Dom.batch(G,E.Dom._getStyle,Y);},_getStyle:function(){if(window[w]){return function(G,y){y=(y==="float")?y="cssFloat":E.Dom._toCamel(y);var x=G.style[y],Y;if(!x){Y=G[e][n][w](G,null);if(Y){x=Y[y];}}return x;};}else{if(W[a]){return function(G,y){var x;switch(y){case"opacity":x=100;try{x=G.filters["DXImageTransform.Microsoft.Alpha"].opacity;}catch(z){try{x=G.filters("alpha").opacity;}catch(Y){}}return x/100;case"float":y="styleFloat";default:y=E.Dom._toCamel(y);x=G[a]?G[a][y]:null;return(G.style[y]||x);}};}}}(),setStyle:function(G,Y,x){E.Dom.batch(G,E.Dom._setStyle,{prop:Y,val:x});},_setStyle:function(){if(T){return function(Y,G){var x=E.Dom._toCamel(G.prop),y=G.val;if(Y){switch(x){case"opacity":if(L.isString(Y.style.filter)){Y.style.filter="alpha(opacity="+y*100+")";if(!Y[a]||!Y[a].hasLayout){Y.style.zoom=1;}}break;case"float":x="styleFloat";default:Y.style[x]=y;}}else{}};}else{return function(Y,G){var x=E.Dom._toCamel(G.prop),y=G.val;if(Y){if(x=="float"){x="cssFloat";}Y.style[x]=y;}else{}};}}(),getXY:function(G){return E.Dom.batch(G,E.Dom._getXY);},_canPosition:function(G){return(E.Dom._getStyle(G,"display")!=="none"&&E.Dom._inDoc(G));},_getXY:function(){if(K[v][Q]){return function(y){var z,Y,AA,AF,AE,AD,AC,G,x,AB=Math.floor,AG=false;if(E.Dom._canPosition(y)){AA=y[Q]();AF=y[e];z=E.Dom.getDocumentScrollLeft(AF);Y=E.Dom.getDocumentScrollTop(AF);AG=[AB(AA[j]),AB(AA[o])];if(T&&m.ie<8){AE=2;AD=2;AC=AF[t];G=S(AF[v],q);x=S(AF[v],R);if(m.ie===6){if(AC!==c){AE=0;AD=0;}}if((AC==c)){if(G!==r){AE=parseInt(G,10);}if(x!==r){AD=parseInt(x,10);}}AG[0]-=AE;AG[1]-=AD;}if((Y||z)){AG[0]+=z;AG[1]+=Y;}AG[0]=AB(AG[0]);AG[1]=AB(AG[1]);}else{}return AG;};}else{return function(y){var x,Y,AA,AB,AC,z=false,G=y;if(E.Dom._canPosition(y)){z=[y[b],y[P]];x=E.Dom.getDocumentScrollLeft(y[e]);Y=E.Dom.getDocumentScrollTop(y[e]);AC=((H||m.webkit>519)?true:false);while((G=G[u])){z[0]+=G[b];z[1]+=G[P];if(AC){z=E.Dom._calcBorders(G,z);}}if(E.Dom._getStyle(y,p)!==f){G=y;while((G=G[Z])&&G[C]){AA=G[i];AB=G[O];if(H&&(E.Dom._getStyle(G,"overflow")!=="visible")){z=E.Dom._calcBorders(G,z);}if(AA||AB){z[0]-=AB;z[1]-=AA;}}z[0]+=x;z[1]+=Y;}else{if(D){z[0]-=x;z[1]-=Y;}else{if(I||H){z[0]+=x;z[1]+=Y;}}}z[0]=Math.floor(z[0]);z[1]=Math.floor(z[1]);}else{}return z;};}}(),getX:function(G){var Y=function(x){return E.Dom.getXY(x)[0];};return E.Dom.batch(G,Y,E.Dom,true);},getY:function(G){var Y=function(x){return E.Dom.getXY(x)[1];};return E.Dom.batch(G,Y,E.Dom,true);},setXY:function(G,x,Y){E.Dom.batch(G,E.Dom._setXY,{pos:x,noRetry:Y});},_setXY:function(G,z){var AA=E.Dom._getStyle(G,p),y=E.Dom.setStyle,AD=z.pos,Y=z.noRetry,AB=[parseInt(E.Dom.getComputedStyle(G,j),10),parseInt(E.Dom.getComputedStyle(G,o),10)],AC,x;if(AA=="static"){AA=V;y(G,p,AA);}AC=E.Dom._getXY(G);if(!AD||AC===false){return false;}if(isNaN(AB[0])){AB[0]=(AA==V)?0:G[b];}if(isNaN(AB[1])){AB[1]=(AA==V)?0:G[P];}if(AD[0]!==null){y(G,j,AD[0]-AC[0]+AB[0]+"px");}if(AD[1]!==null){y(G,o,AD[1]-AC[1]+AB[1]+"px");}if(!Y){x=E.Dom._getXY(G);if((AD[0]!==null&&x[0]!=AD[0])||(AD[1]!==null&&x[1]!=AD[1])){E.Dom._setXY(G,{pos:AD,noRetry:true});}}},setX:function(Y,G){E.Dom.setXY(Y,[G,null]);},setY:function(G,Y){E.Dom.setXY(G,[null,Y]);},getRegion:function(G){var Y=function(x){var y=false;if(E.Dom._canPosition(x)){y=E.Region.getRegion(x);}else{}return y;};return E.Dom.batch(G,Y,E.Dom,true);},getClientWidth:function(){return E.Dom.getViewportWidth();},getClientHeight:function(){return E.Dom.getViewportHeight();},getElementsByClassName:function(AB,AF,AC,AE,x,AD){AB=L.trim(AB);AF=AF||"*";AC=(AC)?E.Dom.get(AC):null||K;if(!AC){return[];}var Y=[],G=AC.getElementsByTagName(AF),z=E.Dom.hasClass;for(var y=0,AA=G.length;y<AA;++y){if(z(G[y],AB)){Y[Y.length]=G[y];}}if(AE){E.Dom.batch(Y,AE,x,AD);}return Y;},hasClass:function(Y,G){return E.Dom.batch(Y,E.Dom._hasClass,G);},_hasClass:function(x,Y){var G=false,y;if(x&&Y){y=E.Dom.getAttribute(x,F)||J;if(Y.exec){G=Y.test(y);}else{G=Y&&(B+y+B).indexOf(B+Y+B)>-1;}}else{}return G;},addClass:function(Y,G){return E.Dom.batch(Y,E.Dom._addClass,G);},_addClass:function(x,Y){var G=false,y;if(x&&Y){y=E.Dom.getAttribute(x,F)||J;if(!E.Dom._hasClass(x,Y)){E.Dom.setAttribute(x,F,A(y+B+Y));G=true;}}else{}return G;},removeClass:function(Y,G){return E.Dom.batch(Y,E.Dom._removeClass,G);},_removeClass:function(y,x){var Y=false,AA,z,G;if(y&&x){AA=E.Dom.getAttribute(y,F)||J;E.Dom.setAttribute(y,F,AA.replace(E.Dom._getClassRegex(x),J));z=E.Dom.getAttribute(y,F);if(AA!==z){E.Dom.setAttribute(y,F,A(z));Y=true;if(E.Dom.getAttribute(y,F)===""){G=(y.hasAttribute&&y.hasAttribute(g))?g:F;y.removeAttribute(G);}}}else{}return Y;},replaceClass:function(x,Y,G){return E.Dom.batch(x,E.Dom._replaceClass,{from:Y,to:G});
},_replaceClass:function(y,x){var Y,AB,AA,G=false,z;if(y&&x){AB=x.from;AA=x.to;if(!AA){G=false;}else{if(!AB){G=E.Dom._addClass(y,x.to);}else{if(AB!==AA){z=E.Dom.getAttribute(y,F)||J;Y=(B+z.replace(E.Dom._getClassRegex(AB),B+AA)).split(E.Dom._getClassRegex(AA));Y.splice(1,0,B+AA);E.Dom.setAttribute(y,F,A(Y.join(J)));G=true;}}}}else{}return G;},generateId:function(G,x){x=x||"yui-gen";var Y=function(y){if(y&&y.id){return y.id;}var z=x+YAHOO.env._id_counter++;if(y){if(y[e].getElementById(z)){return E.Dom.generateId(y,z+x);}y.id=z;}return z;};return E.Dom.batch(G,Y,E.Dom,true)||Y.apply(E.Dom,arguments);},isAncestor:function(Y,x){Y=E.Dom.get(Y);x=E.Dom.get(x);var G=false;if((Y&&x)&&(Y[l]&&x[l])){if(Y.contains&&Y!==x){G=Y.contains(x);}else{if(Y.compareDocumentPosition){G=!!(Y.compareDocumentPosition(x)&16);}}}else{}return G;},inDocument:function(G,Y){return E.Dom._inDoc(E.Dom.get(G),Y);},_inDoc:function(Y,x){var G=false;if(Y&&Y[C]){x=x||Y[e];G=E.Dom.isAncestor(x[v],Y);}else{}return G;},getElementsBy:function(Y,AF,AB,AD,y,AC,AE){AF=AF||"*";AB=(AB)?E.Dom.get(AB):null||K;if(!AB){return[];}var x=[],G=AB.getElementsByTagName(AF);for(var z=0,AA=G.length;z<AA;++z){if(Y(G[z])){if(AE){x=G[z];break;}else{x[x.length]=G[z];}}}if(AD){E.Dom.batch(x,AD,y,AC);}return x;},getElementBy:function(x,G,Y){return E.Dom.getElementsBy(x,G,Y,null,null,null,true);},batch:function(x,AB,AA,z){var y=[],Y=(z)?AA:window;x=(x&&(x[C]||x.item))?x:E.Dom.get(x);if(x&&AB){if(x[C]||x.length===undefined){return AB.call(Y,x,AA);}for(var G=0;G<x.length;++G){y[y.length]=AB.call(Y,x[G],AA);}}else{return false;}return y;},getDocumentHeight:function(){var Y=(K[t]!=M||I)?K.body.scrollHeight:W.scrollHeight,G=Math.max(Y,E.Dom.getViewportHeight());return G;},getDocumentWidth:function(){var Y=(K[t]!=M||I)?K.body.scrollWidth:W.scrollWidth,G=Math.max(Y,E.Dom.getViewportWidth());return G;},getViewportHeight:function(){var G=self.innerHeight,Y=K[t];if((Y||T)&&!D){G=(Y==M)?W.clientHeight:K.body.clientHeight;}return G;},getViewportWidth:function(){var G=self.innerWidth,Y=K[t];if(Y||T){G=(Y==M)?W.clientWidth:K.body.clientWidth;}return G;},getAncestorBy:function(G,Y){while((G=G[Z])){if(E.Dom._testElement(G,Y)){return G;}}return null;},getAncestorByClassName:function(Y,G){Y=E.Dom.get(Y);if(!Y){return null;}var x=function(y){return E.Dom.hasClass(y,G);};return E.Dom.getAncestorBy(Y,x);},getAncestorByTagName:function(Y,G){Y=E.Dom.get(Y);if(!Y){return null;}var x=function(y){return y[C]&&y[C].toUpperCase()==G.toUpperCase();};return E.Dom.getAncestorBy(Y,x);},getPreviousSiblingBy:function(G,Y){while(G){G=G.previousSibling;if(E.Dom._testElement(G,Y)){return G;}}return null;},getPreviousSibling:function(G){G=E.Dom.get(G);if(!G){return null;}return E.Dom.getPreviousSiblingBy(G);},getNextSiblingBy:function(G,Y){while(G){G=G.nextSibling;if(E.Dom._testElement(G,Y)){return G;}}return null;},getNextSibling:function(G){G=E.Dom.get(G);if(!G){return null;}return E.Dom.getNextSiblingBy(G);},getFirstChildBy:function(G,x){var Y=(E.Dom._testElement(G.firstChild,x))?G.firstChild:null;return Y||E.Dom.getNextSiblingBy(G.firstChild,x);},getFirstChild:function(G,Y){G=E.Dom.get(G);if(!G){return null;}return E.Dom.getFirstChildBy(G);},getLastChildBy:function(G,x){if(!G){return null;}var Y=(E.Dom._testElement(G.lastChild,x))?G.lastChild:null;return Y||E.Dom.getPreviousSiblingBy(G.lastChild,x);},getLastChild:function(G){G=E.Dom.get(G);return E.Dom.getLastChildBy(G);},getChildrenBy:function(Y,y){var x=E.Dom.getFirstChildBy(Y,y),G=x?[x]:[];E.Dom.getNextSiblingBy(x,function(z){if(!y||y(z)){G[G.length]=z;}return false;});return G;},getChildren:function(G){G=E.Dom.get(G);if(!G){}return E.Dom.getChildrenBy(G);},getDocumentScrollLeft:function(G){G=G||K;return Math.max(G[v].scrollLeft,G.body.scrollLeft);},getDocumentScrollTop:function(G){G=G||K;return Math.max(G[v].scrollTop,G.body.scrollTop);},insertBefore:function(Y,G){Y=E.Dom.get(Y);G=E.Dom.get(G);if(!Y||!G||!G[Z]){return null;}return G[Z].insertBefore(Y,G);},insertAfter:function(Y,G){Y=E.Dom.get(Y);G=E.Dom.get(G);if(!Y||!G||!G[Z]){return null;}if(G.nextSibling){return G[Z].insertBefore(Y,G.nextSibling);}else{return G[Z].appendChild(Y);}},getClientRegion:function(){var x=E.Dom.getDocumentScrollTop(),Y=E.Dom.getDocumentScrollLeft(),y=E.Dom.getViewportWidth()+Y,G=E.Dom.getViewportHeight()+x;return new E.Region(x,y,G,Y);},setAttribute:function(Y,G,x){G=E.Dom.CUSTOM_ATTRIBUTES[G]||G;Y.setAttribute(G,x);},getAttribute:function(Y,G){G=E.Dom.CUSTOM_ATTRIBUTES[G]||G;return Y.getAttribute(G);},_toCamel:function(Y){var x=d;function G(y,z){return z.toUpperCase();}return x[Y]||(x[Y]=Y.indexOf("-")===-1?Y:Y.replace(/-([a-z])/gi,G));},_getClassRegex:function(Y){var G;if(Y!==undefined){if(Y.exec){G=Y;}else{G=h[Y];if(!G){Y=Y.replace(E.Dom._patterns.CLASS_RE_TOKENS,"\\$1");G=h[Y]=new RegExp(s+Y+k,U);}}}return G;},_patterns:{ROOT_TAG:/^body|html$/i,CLASS_RE_TOKENS:/([\.\(\)\^\$\*\+\?\|\[\]\{\}])/g},_testElement:function(G,Y){return G&&G[l]==1&&(!Y||Y(G));},_calcBorders:function(x,y){var Y=parseInt(E.Dom[w](x,R),10)||0,G=parseInt(E.Dom[w](x,q),10)||0;if(H){if(N.test(x[C])){Y=0;G=0;}}y[0]+=G;y[1]+=Y;return y;}};var S=E.Dom[w];if(m.opera){E.Dom[w]=function(Y,G){var x=S(Y,G);if(X.test(G)){x=E.Dom.Color.toRGB(x);}return x;};}if(m.webkit){E.Dom[w]=function(Y,G){var x=S(Y,G);if(x==="rgba(0, 0, 0, 0)"){x="transparent";}return x;};}})();YAHOO.util.Region=function(C,D,A,B){this.top=C;this.y=C;this[1]=C;this.right=D;this.bottom=A;this.left=B;this.x=B;this[0]=B;this.width=this.right-this.left;this.height=this.bottom-this.top;};YAHOO.util.Region.prototype.contains=function(A){return(A.left>=this.left&&A.right<=this.right&&A.top>=this.top&&A.bottom<=this.bottom);};YAHOO.util.Region.prototype.getArea=function(){return((this.bottom-this.top)*(this.right-this.left));};YAHOO.util.Region.prototype.intersect=function(E){var C=Math.max(this.top,E.top),D=Math.min(this.right,E.right),A=Math.min(this.bottom,E.bottom),B=Math.max(this.left,E.left);if(A>=C&&D>=B){return new YAHOO.util.Region(C,D,A,B);
}else{return null;}};YAHOO.util.Region.prototype.union=function(E){var C=Math.min(this.top,E.top),D=Math.max(this.right,E.right),A=Math.max(this.bottom,E.bottom),B=Math.min(this.left,E.left);return new YAHOO.util.Region(C,D,A,B);};YAHOO.util.Region.prototype.toString=function(){return("Region {"+"top: "+this.top+", right: "+this.right+", bottom: "+this.bottom+", left: "+this.left+", height: "+this.height+", width: "+this.width+"}");};YAHOO.util.Region.getRegion=function(D){var F=YAHOO.util.Dom.getXY(D),C=F[1],E=F[0]+D.offsetWidth,A=F[1]+D.offsetHeight,B=F[0];return new YAHOO.util.Region(C,E,A,B);};YAHOO.util.Point=function(A,B){if(YAHOO.lang.isArray(A)){B=A[1];A=A[0];}YAHOO.util.Point.superclass.constructor.call(this,B,A,B,A);};YAHOO.extend(YAHOO.util.Point,YAHOO.util.Region);(function(){var B=YAHOO.util,A="clientTop",F="clientLeft",J="parentNode",K="right",W="hasLayout",I="px",U="opacity",L="auto",D="borderLeftWidth",G="borderTopWidth",P="borderRightWidth",V="borderBottomWidth",S="visible",Q="transparent",N="height",E="width",H="style",T="currentStyle",R=/^width|height$/,O=/^(\d[.\d]*)+(em|ex|px|gd|rem|vw|vh|vm|ch|mm|cm|in|pt|pc|deg|rad|ms|s|hz|khz|%){1}?/i,M={get:function(X,Z){var Y="",a=X[T][Z];if(Z===U){Y=B.Dom.getStyle(X,U);}else{if(!a||(a.indexOf&&a.indexOf(I)>-1)){Y=a;}else{if(B.Dom.IE_COMPUTED[Z]){Y=B.Dom.IE_COMPUTED[Z](X,Z);}else{if(O.test(a)){Y=B.Dom.IE.ComputedStyle.getPixel(X,Z);}else{Y=a;}}}}return Y;},getOffset:function(Z,e){var b=Z[T][e],X=e.charAt(0).toUpperCase()+e.substr(1),c="offset"+X,Y="pixel"+X,a="",d;if(b==L){d=Z[c];if(d===undefined){a=0;}a=d;if(R.test(e)){Z[H][e]=d;if(Z[c]>d){a=d-(Z[c]-d);}Z[H][e]=L;}}else{if(!Z[H][Y]&&!Z[H][e]){Z[H][e]=b;}a=Z[H][Y];}return a+I;},getBorderWidth:function(X,Z){var Y=null;if(!X[T][W]){X[H].zoom=1;}switch(Z){case G:Y=X[A];break;case V:Y=X.offsetHeight-X.clientHeight-X[A];break;case D:Y=X[F];break;case P:Y=X.offsetWidth-X.clientWidth-X[F];break;}return Y+I;},getPixel:function(Y,X){var a=null,b=Y[T][K],Z=Y[T][X];Y[H][K]=Z;a=Y[H].pixelRight;Y[H][K]=b;return a+I;},getMargin:function(Y,X){var Z;if(Y[T][X]==L){Z=0+I;}else{Z=B.Dom.IE.ComputedStyle.getPixel(Y,X);}return Z;},getVisibility:function(Y,X){var Z;while((Z=Y[T])&&Z[X]=="inherit"){Y=Y[J];}return(Z)?Z[X]:S;},getColor:function(Y,X){return B.Dom.Color.toRGB(Y[T][X])||Q;},getBorderColor:function(Y,X){var Z=Y[T],a=Z[X]||Z.color;return B.Dom.Color.toRGB(B.Dom.Color.toHex(a));}},C={};C.top=C.right=C.bottom=C.left=C[E]=C[N]=M.getOffset;C.color=M.getColor;C[G]=C[P]=C[V]=C[D]=M.getBorderWidth;C.marginTop=C.marginRight=C.marginBottom=C.marginLeft=M.getMargin;C.visibility=M.getVisibility;C.borderColor=C.borderTopColor=C.borderRightColor=C.borderBottomColor=C.borderLeftColor=M.getBorderColor;B.Dom.IE_COMPUTED=C;B.Dom.IE_ComputedStyle=M;})();(function(){var C="toString",A=parseInt,B=RegExp,D=YAHOO.util;D.Dom.Color={KEYWORDS:{black:"000",silver:"c0c0c0",gray:"808080",white:"fff",maroon:"800000",red:"f00",purple:"800080",fuchsia:"f0f",green:"008000",lime:"0f0",olive:"808000",yellow:"ff0",navy:"000080",blue:"00f",teal:"008080",aqua:"0ff"},re_RGB:/^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,re_hex:/^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,re_hex3:/([0-9A-F])/gi,toRGB:function(E){if(!D.Dom.Color.re_RGB.test(E)){E=D.Dom.Color.toHex(E);}if(D.Dom.Color.re_hex.exec(E)){E="rgb("+[A(B.$1,16),A(B.$2,16),A(B.$3,16)].join(", ")+")";}return E;},toHex:function(H){H=D.Dom.Color.KEYWORDS[H]||H;if(D.Dom.Color.re_RGB.exec(H)){var G=(B.$1.length===1)?"0"+B.$1:Number(B.$1),F=(B.$2.length===1)?"0"+B.$2:Number(B.$2),E=(B.$3.length===1)?"0"+B.$3:Number(B.$3);H=[G[C](16),F[C](16),E[C](16)].join("");}if(H.length<6){H=H.replace(D.Dom.Color.re_hex3,"$1$1");}if(H!=="transparent"&&H.indexOf("#")<0){H="#"+H;}return H.toLowerCase();}};}());YAHOO.register("dom",YAHOO.util.Dom,{version:"2.7.0",build:"1796"});YAHOO.util.CustomEvent=function(D,C,B,A){this.type=D;this.scope=C||window;this.silent=B;this.signature=A||YAHOO.util.CustomEvent.LIST;this.subscribers=[];if(!this.silent){}var E="_YUICEOnSubscribe";if(D!==E){this.subscribeEvent=new YAHOO.util.CustomEvent(E,this,true);}this.lastError=null;};YAHOO.util.CustomEvent.LIST=0;YAHOO.util.CustomEvent.FLAT=1;YAHOO.util.CustomEvent.prototype={subscribe:function(A,B,C){if(!A){throw new Error("Invalid callback for subscriber to '"+this.type+"'");}if(this.subscribeEvent){this.subscribeEvent.fire(A,B,C);}this.subscribers.push(new YAHOO.util.Subscriber(A,B,C));},unsubscribe:function(D,F){if(!D){return this.unsubscribeAll();}var E=false;for(var B=0,A=this.subscribers.length;B<A;++B){var C=this.subscribers[B];if(C&&C.contains(D,F)){this._delete(B);E=true;}}return E;},fire:function(){this.lastError=null;var K=[],E=this.subscribers.length;if(!E&&this.silent){return true;}var I=[].slice.call(arguments,0),G=true,D,J=false;if(!this.silent){}var C=this.subscribers.slice(),A=YAHOO.util.Event.throwErrors;for(D=0;D<E;++D){var M=C[D];if(!M){J=true;}else{if(!this.silent){}var L=M.getScope(this.scope);if(this.signature==YAHOO.util.CustomEvent.FLAT){var B=null;if(I.length>0){B=I[0];}try{G=M.fn.call(L,B,M.obj);}catch(F){this.lastError=F;if(A){throw F;}}}else{try{G=M.fn.call(L,this.type,I,M.obj);}catch(H){this.lastError=H;if(A){throw H;}}}if(false===G){if(!this.silent){}break;}}}return(G!==false);},unsubscribeAll:function(){var A=this.subscribers.length,B;for(B=A-1;B>-1;B--){this._delete(B);}this.subscribers=[];return A;},_delete:function(A){var B=this.subscribers[A];if(B){delete B.fn;delete B.obj;}this.subscribers.splice(A,1);},toString:function(){return"CustomEvent: "+"'"+this.type+"', "+"context: "+this.scope;}};YAHOO.util.Subscriber=function(A,B,C){this.fn=A;this.obj=YAHOO.lang.isUndefined(B)?null:B;this.overrideContext=C;};YAHOO.util.Subscriber.prototype.getScope=function(A){if(this.overrideContext){if(this.overrideContext===true){return this.obj;}else{return this.overrideContext;}}return A;};YAHOO.util.Subscriber.prototype.contains=function(A,B){if(B){return(this.fn==A&&this.obj==B);}else{return(this.fn==A);}};YAHOO.util.Subscriber.prototype.toString=function(){return"Subscriber { obj: "+this.obj+", overrideContext: "+(this.overrideContext||"no")+" }";};if(!YAHOO.util.Event){YAHOO.util.Event=function(){var H=false;var I=[];var J=[];var G=[];var E=[];var C=0;var F=[];var B=[];var A=0;var D={63232:38,63233:40,63234:37,63235:39,63276:33,63277:34,25:9};var K=YAHOO.env.ua.ie?"focusin":"focus";var L=YAHOO.env.ua.ie?"focusout":"blur";return{POLL_RETRYS:2000,POLL_INTERVAL:20,EL:0,TYPE:1,FN:2,WFN:3,UNLOAD_OBJ:3,ADJ_SCOPE:4,OBJ:5,OVERRIDE:6,lastError:null,isSafari:YAHOO.env.ua.webkit,webkit:YAHOO.env.ua.webkit,isIE:YAHOO.env.ua.ie,_interval:null,_dri:null,DOMReady:false,throwErrors:false,startInterval:function(){if(!this._interval){var M=this;var N=function(){M._tryPreloadAttach();};this._interval=setInterval(N,this.POLL_INTERVAL);}},onAvailable:function(S,O,Q,R,P){var M=(YAHOO.lang.isString(S))?[S]:S;for(var N=0;N<M.length;N=N+1){F.push({id:M[N],fn:O,obj:Q,overrideContext:R,checkReady:P});}C=this.POLL_RETRYS;this.startInterval();},onContentReady:function(P,M,N,O){this.onAvailable(P,M,N,O,true);},onDOMReady:function(M,N,O){if(this.DOMReady){setTimeout(function(){var P=window;if(O){if(O===true){P=N;}else{P=O;}}M.call(P,"DOMReady",[],N);},0);}else{this.DOMReadyEvent.subscribe(M,N,O);}},_addListener:function(O,M,Y,S,W,b){if(!Y||!Y.call){return false;}if(this._isValidCollection(O)){var Z=true;for(var T=0,V=O.length;T<V;++T){Z=this.on(O[T],M,Y,S,W)&&Z;}return Z;}else{if(YAHOO.lang.isString(O)){var R=this.getEl(O);if(R){O=R;}else{this.onAvailable(O,function(){YAHOO.util.Event.on(O,M,Y,S,W);});return true;}}}if(!O){return false;}if("unload"==M&&S!==this){J[J.length]=[O,M,Y,S,W];return true;}var N=O;if(W){if(W===true){N=S;}else{N=W;}}var P=function(c){return Y.call(N,YAHOO.util.Event.getEvent(c,O),S);};var a=[O,M,Y,P,N,S,W];var U=I.length;I[U]=a;if(this.useLegacyEvent(O,M)){var Q=this.getLegacyIndex(O,M);if(Q==-1||O!=G[Q][0]){Q=G.length;B[O.id+M]=Q;G[Q]=[O,M,O["on"+M]];E[Q]=[];O["on"+M]=function(c){YAHOO.util.Event.fireLegacyEvent(YAHOO.util.Event.getEvent(c),Q);};}E[Q].push(a);}else{try{this._simpleAdd(O,M,P,b);}catch(X){this.lastError=X;this.removeListener(O,M,Y);return false;}}return true;},addListener:function(N,Q,M,O,P){return this._addListener(N,Q,M,O,P,false);},addFocusListener:function(N,M,O,P){return this._addListener(N,K,M,O,P,true);},removeFocusListener:function(N,M){return this.removeListener(N,K,M);},addBlurListener:function(N,M,O,P){return this._addListener(N,L,M,O,P,true);},removeBlurListener:function(N,M){return this.removeListener(N,L,M);},fireLegacyEvent:function(R,P){var T=true,M,V,U,N,S;V=E[P].slice();for(var O=0,Q=V.length;O<Q;++O){U=V[O];if(U&&U[this.WFN]){N=U[this.ADJ_SCOPE];S=U[this.WFN].call(N,R);T=(T&&S);}}M=G[P];if(M&&M[2]){M[2](R);}return T;},getLegacyIndex:function(N,O){var M=this.generateId(N)+O;if(typeof B[M]=="undefined"){return -1;}else{return B[M];}},useLegacyEvent:function(M,N){return(this.webkit&&this.webkit<419&&("click"==N||"dblclick"==N));},removeListener:function(N,M,V){var Q,T,X;if(typeof N=="string"){N=this.getEl(N);}else{if(this._isValidCollection(N)){var W=true;for(Q=N.length-1;Q>-1;Q--){W=(this.removeListener(N[Q],M,V)&&W);}return W;}}if(!V||!V.call){return this.purgeElement(N,false,M);}if("unload"==M){for(Q=J.length-1;Q>-1;Q--){X=J[Q];if(X&&X[0]==N&&X[1]==M&&X[2]==V){J.splice(Q,1);return true;}}return false;}var R=null;var S=arguments[3];if("undefined"===typeof S){S=this._getCacheIndex(N,M,V);}if(S>=0){R=I[S];}if(!N||!R){return false;}if(this.useLegacyEvent(N,M)){var P=this.getLegacyIndex(N,M);var O=E[P];if(O){for(Q=0,T=O.length;Q<T;++Q){X=O[Q];if(X&&X[this.EL]==N&&X[this.TYPE]==M&&X[this.FN]==V){O.splice(Q,1);break;}}}}else{try{this._simpleRemove(N,M,R[this.WFN],false);}catch(U){this.lastError=U;return false;}}delete I[S][this.WFN];delete I[S][this.FN];
I.splice(S,1);return true;},getTarget:function(O,N){var M=O.target||O.srcElement;return this.resolveTextNode(M);},resolveTextNode:function(N){try{if(N&&3==N.nodeType){return N.parentNode;}}catch(M){}return N;},getPageX:function(N){var M=N.pageX;if(!M&&0!==M){M=N.clientX||0;if(this.isIE){M+=this._getScrollLeft();}}return M;},getPageY:function(M){var N=M.pageY;if(!N&&0!==N){N=M.clientY||0;if(this.isIE){N+=this._getScrollTop();}}return N;},getXY:function(M){return[this.getPageX(M),this.getPageY(M)];},getRelatedTarget:function(N){var M=N.relatedTarget;if(!M){if(N.type=="mouseout"){M=N.toElement;}else{if(N.type=="mouseover"){M=N.fromElement;}}}return this.resolveTextNode(M);},getTime:function(O){if(!O.time){var N=new Date().getTime();try{O.time=N;}catch(M){this.lastError=M;return N;}}return O.time;},stopEvent:function(M){this.stopPropagation(M);this.preventDefault(M);},stopPropagation:function(M){if(M.stopPropagation){M.stopPropagation();}else{M.cancelBubble=true;}},preventDefault:function(M){if(M.preventDefault){M.preventDefault();}else{M.returnValue=false;}},getEvent:function(O,M){var N=O||window.event;if(!N){var P=this.getEvent.caller;while(P){N=P.arguments[0];if(N&&Event==N.constructor){break;}P=P.caller;}}return N;},getCharCode:function(N){var M=N.keyCode||N.charCode||0;if(YAHOO.env.ua.webkit&&(M in D)){M=D[M];}return M;},_getCacheIndex:function(Q,R,P){for(var O=0,N=I.length;O<N;O=O+1){var M=I[O];if(M&&M[this.FN]==P&&M[this.EL]==Q&&M[this.TYPE]==R){return O;}}return -1;},generateId:function(M){var N=M.id;if(!N){N="yuievtautoid-"+A;++A;M.id=N;}return N;},_isValidCollection:function(N){try{return(N&&typeof N!=="string"&&N.length&&!N.tagName&&!N.alert&&typeof N[0]!=="undefined");}catch(M){return false;}},elCache:{},getEl:function(M){return(typeof M==="string")?document.getElementById(M):M;},clearCache:function(){},DOMReadyEvent:new YAHOO.util.CustomEvent("DOMReady",this),_load:function(N){if(!H){H=true;var M=YAHOO.util.Event;M._ready();M._tryPreloadAttach();}},_ready:function(N){var M=YAHOO.util.Event;if(!M.DOMReady){M.DOMReady=true;M.DOMReadyEvent.fire();M._simpleRemove(document,"DOMContentLoaded",M._ready);}},_tryPreloadAttach:function(){if(F.length===0){C=0;if(this._interval){clearInterval(this._interval);this._interval=null;}return;}if(this.locked){return;}if(this.isIE){if(!this.DOMReady){this.startInterval();return;}}this.locked=true;var S=!H;if(!S){S=(C>0&&F.length>0);}var R=[];var T=function(V,W){var U=V;if(W.overrideContext){if(W.overrideContext===true){U=W.obj;}else{U=W.overrideContext;}}W.fn.call(U,W.obj);};var N,M,Q,P,O=[];for(N=0,M=F.length;N<M;N=N+1){Q=F[N];if(Q){P=this.getEl(Q.id);if(P){if(Q.checkReady){if(H||P.nextSibling||!S){O.push(Q);F[N]=null;}}else{T(P,Q);F[N]=null;}}else{R.push(Q);}}}for(N=0,M=O.length;N<M;N=N+1){Q=O[N];T(this.getEl(Q.id),Q);}C--;if(S){for(N=F.length-1;N>-1;N--){Q=F[N];if(!Q||!Q.id){F.splice(N,1);}}this.startInterval();}else{if(this._interval){clearInterval(this._interval);this._interval=null;}}this.locked=false;},purgeElement:function(Q,R,T){var O=(YAHOO.lang.isString(Q))?this.getEl(Q):Q;var S=this.getListeners(O,T),P,M;if(S){for(P=S.length-1;P>-1;P--){var N=S[P];this.removeListener(O,N.type,N.fn);}}if(R&&O&&O.childNodes){for(P=0,M=O.childNodes.length;P<M;++P){this.purgeElement(O.childNodes[P],R,T);}}},getListeners:function(O,M){var R=[],N;if(!M){N=[I,J];}else{if(M==="unload"){N=[J];}else{N=[I];}}var T=(YAHOO.lang.isString(O))?this.getEl(O):O;for(var Q=0;Q<N.length;Q=Q+1){var V=N[Q];if(V){for(var S=0,U=V.length;S<U;++S){var P=V[S];if(P&&P[this.EL]===T&&(!M||M===P[this.TYPE])){R.push({type:P[this.TYPE],fn:P[this.FN],obj:P[this.OBJ],adjust:P[this.OVERRIDE],scope:P[this.ADJ_SCOPE],index:S});}}}}return(R.length)?R:null;},_unload:function(T){var N=YAHOO.util.Event,Q,P,O,S,R,U=J.slice(),M;for(Q=0,S=J.length;Q<S;++Q){O=U[Q];if(O){M=window;if(O[N.ADJ_SCOPE]){if(O[N.ADJ_SCOPE]===true){M=O[N.UNLOAD_OBJ];}else{M=O[N.ADJ_SCOPE];}}O[N.FN].call(M,N.getEvent(T,O[N.EL]),O[N.UNLOAD_OBJ]);U[Q]=null;}}O=null;M=null;J=null;if(I){for(P=I.length-1;P>-1;P--){O=I[P];if(O){N.removeListener(O[N.EL],O[N.TYPE],O[N.FN],P);}}O=null;}G=null;N._simpleRemove(window,"unload",N._unload);},_getScrollLeft:function(){return this._getScroll()[1];},_getScrollTop:function(){return this._getScroll()[0];},_getScroll:function(){var M=document.documentElement,N=document.body;if(M&&(M.scrollTop||M.scrollLeft)){return[M.scrollTop,M.scrollLeft];}else{if(N){return[N.scrollTop,N.scrollLeft];}else{return[0,0];}}},regCE:function(){},_simpleAdd:function(){if(window.addEventListener){return function(O,P,N,M){O.addEventListener(P,N,(M));};}else{if(window.attachEvent){return function(O,P,N,M){O.attachEvent("on"+P,N);};}else{return function(){};}}}(),_simpleRemove:function(){if(window.removeEventListener){return function(O,P,N,M){O.removeEventListener(P,N,(M));};}else{if(window.detachEvent){return function(N,O,M){N.detachEvent("on"+O,M);};}else{return function(){};}}}()};}();(function(){var EU=YAHOO.util.Event;EU.on=EU.addListener;EU.onFocus=EU.addFocusListener;EU.onBlur=EU.addBlurListener;
/* DOMReady: based on work by: Dean Edwards/John Resig/Matthias Miller */
if(EU.isIE){YAHOO.util.Event.onDOMReady(YAHOO.util.Event._tryPreloadAttach,YAHOO.util.Event,true);var n=document.createElement("p");EU._dri=setInterval(function(){try{n.doScroll("left");clearInterval(EU._dri);EU._dri=null;EU._ready();n=null;}catch(ex){}},EU.POLL_INTERVAL);}else{if(EU.webkit&&EU.webkit<525){EU._dri=setInterval(function(){var rs=document.readyState;if("loaded"==rs||"complete"==rs){clearInterval(EU._dri);EU._dri=null;EU._ready();}},EU.POLL_INTERVAL);}else{EU._simpleAdd(document,"DOMContentLoaded",EU._ready);}}EU._simpleAdd(window,"load",EU._load);EU._simpleAdd(window,"unload",EU._unload);EU._tryPreloadAttach();})();}YAHOO.util.EventProvider=function(){};YAHOO.util.EventProvider.prototype={__yui_events:null,__yui_subscribers:null,subscribe:function(A,C,F,E){this.__yui_events=this.__yui_events||{};var D=this.__yui_events[A];if(D){D.subscribe(C,F,E);
}else{this.__yui_subscribers=this.__yui_subscribers||{};var B=this.__yui_subscribers;if(!B[A]){B[A]=[];}B[A].push({fn:C,obj:F,overrideContext:E});}},unsubscribe:function(C,E,G){this.__yui_events=this.__yui_events||{};var A=this.__yui_events;if(C){var F=A[C];if(F){return F.unsubscribe(E,G);}}else{var B=true;for(var D in A){if(YAHOO.lang.hasOwnProperty(A,D)){B=B&&A[D].unsubscribe(E,G);}}return B;}return false;},unsubscribeAll:function(A){return this.unsubscribe(A);},createEvent:function(G,D){this.__yui_events=this.__yui_events||{};var A=D||{};var I=this.__yui_events;if(I[G]){}else{var H=A.scope||this;var E=(A.silent);var B=new YAHOO.util.CustomEvent(G,H,E,YAHOO.util.CustomEvent.FLAT);I[G]=B;if(A.onSubscribeCallback){B.subscribeEvent.subscribe(A.onSubscribeCallback);}this.__yui_subscribers=this.__yui_subscribers||{};var F=this.__yui_subscribers[G];if(F){for(var C=0;C<F.length;++C){B.subscribe(F[C].fn,F[C].obj,F[C].overrideContext);}}}return I[G];},fireEvent:function(E,D,A,C){this.__yui_events=this.__yui_events||{};var G=this.__yui_events[E];if(!G){return null;}var B=[];for(var F=1;F<arguments.length;++F){B.push(arguments[F]);}return G.fire.apply(G,B);},hasEvent:function(A){if(this.__yui_events){if(this.__yui_events[A]){return true;}}return false;}};(function(){var A=YAHOO.util.Event,C=YAHOO.lang;YAHOO.util.KeyListener=function(D,I,E,F){if(!D){}else{if(!I){}else{if(!E){}}}if(!F){F=YAHOO.util.KeyListener.KEYDOWN;}var G=new YAHOO.util.CustomEvent("keyPressed");this.enabledEvent=new YAHOO.util.CustomEvent("enabled");this.disabledEvent=new YAHOO.util.CustomEvent("disabled");if(C.isString(D)){D=document.getElementById(D);}if(C.isFunction(E)){G.subscribe(E);}else{G.subscribe(E.fn,E.scope,E.correctScope);}function H(O,N){if(!I.shift){I.shift=false;}if(!I.alt){I.alt=false;}if(!I.ctrl){I.ctrl=false;}if(O.shiftKey==I.shift&&O.altKey==I.alt&&O.ctrlKey==I.ctrl){var J,M=I.keys,L;if(YAHOO.lang.isArray(M)){for(var K=0;K<M.length;K++){J=M[K];L=A.getCharCode(O);if(J==L){G.fire(L,O);break;}}}else{L=A.getCharCode(O);if(M==L){G.fire(L,O);}}}}this.enable=function(){if(!this.enabled){A.on(D,F,H);this.enabledEvent.fire(I);}this.enabled=true;};this.disable=function(){if(this.enabled){A.removeListener(D,F,H);this.disabledEvent.fire(I);}this.enabled=false;};this.toString=function(){return"KeyListener ["+I.keys+"] "+D.tagName+(D.id?"["+D.id+"]":"");};};var B=YAHOO.util.KeyListener;B.KEYDOWN="keydown";B.KEYUP="keyup";B.KEY={ALT:18,BACK_SPACE:8,CAPS_LOCK:20,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,META:224,NUM_LOCK:144,PAGE_DOWN:34,PAGE_UP:33,PAUSE:19,PRINTSCREEN:44,RIGHT:39,SCROLL_LOCK:145,SHIFT:16,SPACE:32,TAB:9,UP:38};})();YAHOO.register("event",YAHOO.util.Event,{version:"2.7.0",build:"1796"});YAHOO.util.Connect={_msxml_progid:["Microsoft.XMLHTTP","MSXML2.XMLHTTP.3.0","MSXML2.XMLHTTP"],_http_headers:{},_has_http_headers:false,_use_default_post_header:true,_default_post_header:"application/x-www-form-urlencoded; charset=UTF-8",_default_form_header:"application/x-www-form-urlencoded",_use_default_xhr_header:true,_default_xhr_header:"XMLHttpRequest",_has_default_headers:true,_default_headers:{},_isFormSubmit:false,_isFileUpload:false,_formNode:null,_sFormData:null,_poll:{},_timeOut:{},_polling_interval:50,_transaction_id:0,_submitElementValue:null,_hasSubmitListener:(function(){if(YAHOO.util.Event){YAHOO.util.Event.addListener(document,"click",function(C){var B=YAHOO.util.Event.getTarget(C),A=B.nodeName.toLowerCase();if((A==="input"||A==="button")&&(B.type&&B.type.toLowerCase()=="submit")){YAHOO.util.Connect._submitElementValue=encodeURIComponent(B.name)+"="+encodeURIComponent(B.value);}});return true;}return false;})(),startEvent:new YAHOO.util.CustomEvent("start"),completeEvent:new YAHOO.util.CustomEvent("complete"),successEvent:new YAHOO.util.CustomEvent("success"),failureEvent:new YAHOO.util.CustomEvent("failure"),uploadEvent:new YAHOO.util.CustomEvent("upload"),abortEvent:new YAHOO.util.CustomEvent("abort"),_customEvents:{onStart:["startEvent","start"],onComplete:["completeEvent","complete"],onSuccess:["successEvent","success"],onFailure:["failureEvent","failure"],onUpload:["uploadEvent","upload"],onAbort:["abortEvent","abort"]},setProgId:function(A){this._msxml_progid.unshift(A);},setDefaultPostHeader:function(A){if(typeof A=="string"){this._default_post_header=A;}else{if(typeof A=="boolean"){this._use_default_post_header=A;}}},setDefaultXhrHeader:function(A){if(typeof A=="string"){this._default_xhr_header=A;}else{this._use_default_xhr_header=A;}},setPollingInterval:function(A){if(typeof A=="number"&&isFinite(A)){this._polling_interval=A;}},createXhrObject:function(F){var E,A;try{A=new XMLHttpRequest();E={conn:A,tId:F};}catch(D){for(var B=0;B<this._msxml_progid.length;++B){try{A=new ActiveXObject(this._msxml_progid[B]);E={conn:A,tId:F};break;}catch(C){}}}finally{return E;}},getConnectionObject:function(A){var C;var D=this._transaction_id;try{if(!A){C=this.createXhrObject(D);}else{C={};C.tId=D;C.isUpload=true;}if(C){this._transaction_id++;}}catch(B){}finally{return C;}},asyncRequest:function(F,C,E,A){var D=(this._isFileUpload)?this.getConnectionObject(true):this.getConnectionObject();var B=(E&&E.argument)?E.argument:null;if(!D){return null;}else{if(E&&E.customevents){this.initCustomEvents(D,E);}if(this._isFormSubmit){if(this._isFileUpload){this.uploadFile(D,E,C,A);return D;}if(F.toUpperCase()=="GET"){if(this._sFormData.length!==0){C+=((C.indexOf("?")==-1)?"?":"&")+this._sFormData;}}else{if(F.toUpperCase()=="POST"){A=A?this._sFormData+"&"+A:this._sFormData;}}}if(F.toUpperCase()=="GET"&&(E&&E.cache===false)){C+=((C.indexOf("?")==-1)?"?":"&")+"rnd="+new Date().valueOf().toString();}D.conn.open(F,C,true);if(this._use_default_xhr_header){if(!this._default_headers["X-Requested-With"]){this.initHeader("X-Requested-With",this._default_xhr_header,true);}}if((F.toUpperCase()==="POST"&&this._use_default_post_header)&&this._isFormSubmit===false){this.initHeader("Content-Type",this._default_post_header);}if(this._has_default_headers||this._has_http_headers){this.setHeader(D);}this.handleReadyState(D,E);D.conn.send(A||"");if(this._isFormSubmit===true){this.resetFormState();}this.startEvent.fire(D,B);if(D.startEvent){D.startEvent.fire(D,B);}return D;}},initCustomEvents:function(A,C){var B;for(B in C.customevents){if(this._customEvents[B][0]){A[this._customEvents[B][0]]=new YAHOO.util.CustomEvent(this._customEvents[B][1],(C.scope)?C.scope:null);A[this._customEvents[B][0]].subscribe(C.customevents[B]);}}},handleReadyState:function(C,D){var B=this;var A=(D&&D.argument)?D.argument:null;if(D&&D.timeout){this._timeOut[C.tId]=window.setTimeout(function(){B.abort(C,D,true);},D.timeout);}this._poll[C.tId]=window.setInterval(function(){if(C.conn&&C.conn.readyState===4){window.clearInterval(B._poll[C.tId]);delete B._poll[C.tId];if(D&&D.timeout){window.clearTimeout(B._timeOut[C.tId]);delete B._timeOut[C.tId];}B.completeEvent.fire(C,A);if(C.completeEvent){C.completeEvent.fire(C,A);}B.handleTransactionResponse(C,D);}},this._polling_interval);},handleTransactionResponse:function(F,G,A){var D,C;var B=(G&&G.argument)?G.argument:null;try{if(F.conn.status!==undefined&&F.conn.status!==0){D=F.conn.status;}else{D=13030;}}catch(E){D=13030;}if(D>=200&&D<300||D===1223){C=this.createResponseObject(F,B);if(G&&G.success){if(!G.scope){G.success(C);}else{G.success.apply(G.scope,[C]);}}this.successEvent.fire(C);if(F.successEvent){F.successEvent.fire(C);}}else{switch(D){case 12002:case 12029:case 12030:case 12031:case 12152:case 13030:C=this.createExceptionObject(F.tId,B,(A?A:false));if(G&&G.failure){if(!G.scope){G.failure(C);}else{G.failure.apply(G.scope,[C]);}}break;default:C=this.createResponseObject(F,B);if(G&&G.failure){if(!G.scope){G.failure(C);}else{G.failure.apply(G.scope,[C]);}}}this.failureEvent.fire(C);if(F.failureEvent){F.failureEvent.fire(C);}}this.releaseObject(F);C=null;},createResponseObject:function(A,G){var D={};var I={};try{var C=A.conn.getAllResponseHeaders();var F=C.split("\n");for(var E=0;E<F.length;E++){var B=F[E].indexOf(":");if(B!=-1){I[F[E].substring(0,B)]=F[E].substring(B+2);}}}catch(H){}D.tId=A.tId;D.status=(A.conn.status==1223)?204:A.conn.status;D.statusText=(A.conn.status==1223)?"No Content":A.conn.statusText;D.getResponseHeader=I;D.getAllResponseHeaders=C;D.responseText=A.conn.responseText;D.responseXML=A.conn.responseXML;if(G){D.argument=G;}return D;},createExceptionObject:function(H,D,A){var F=0;var G="communication failure";var C=-1;var B="transaction aborted";var E={};E.tId=H;if(A){E.status=C;E.statusText=B;}else{E.status=F;E.statusText=G;}if(D){E.argument=D;}return E;},initHeader:function(A,D,C){var B=(C)?this._default_headers:this._http_headers;B[A]=D;if(C){this._has_default_headers=true;
}else{this._has_http_headers=true;}},setHeader:function(A){var B;if(this._has_default_headers){for(B in this._default_headers){if(YAHOO.lang.hasOwnProperty(this._default_headers,B)){A.conn.setRequestHeader(B,this._default_headers[B]);}}}if(this._has_http_headers){for(B in this._http_headers){if(YAHOO.lang.hasOwnProperty(this._http_headers,B)){A.conn.setRequestHeader(B,this._http_headers[B]);}}delete this._http_headers;this._http_headers={};this._has_http_headers=false;}},resetDefaultHeaders:function(){delete this._default_headers;this._default_headers={};this._has_default_headers=false;},setForm:function(M,H,C){var L,B,K,I,P,J=false,F=[],O=0,E,G,D,N,A;this.resetFormState();if(typeof M=="string"){L=(document.getElementById(M)||document.forms[M]);}else{if(typeof M=="object"){L=M;}else{return;}}if(H){this.createFrame(C?C:null);this._isFormSubmit=true;this._isFileUpload=true;this._formNode=L;return;}for(E=0,G=L.elements.length;E<G;++E){B=L.elements[E];P=B.disabled;K=B.name;if(!P&&K){K=encodeURIComponent(K)+"=";I=encodeURIComponent(B.value);switch(B.type){case"select-one":if(B.selectedIndex>-1){A=B.options[B.selectedIndex];F[O++]=K+encodeURIComponent((A.attributes.value&&A.attributes.value.specified)?A.value:A.text);}break;case"select-multiple":if(B.selectedIndex>-1){for(D=B.selectedIndex,N=B.options.length;D<N;++D){A=B.options[D];if(A.selected){F[O++]=K+encodeURIComponent((A.attributes.value&&A.attributes.value.specified)?A.value:A.text);}}}break;case"radio":case"checkbox":if(B.checked){F[O++]=K+I;}break;case"file":case undefined:case"reset":case"button":break;case"submit":if(J===false){if(this._hasSubmitListener&&this._submitElementValue){F[O++]=this._submitElementValue;}J=true;}break;default:F[O++]=K+I;}}}this._isFormSubmit=true;this._sFormData=F.join("&");this.initHeader("Content-Type",this._default_form_header);return this._sFormData;},resetFormState:function(){this._isFormSubmit=false;this._isFileUpload=false;this._formNode=null;this._sFormData="";},createFrame:function(A){var B="yuiIO"+this._transaction_id;var C;if(YAHOO.env.ua.ie){C=document.createElement('<iframe id="'+B+'" name="'+B+'" />');if(typeof A=="boolean"){C.src="javascript:false";}}else{C=document.createElement("iframe");C.id=B;C.name=B;}C.style.position="absolute";C.style.top="-1000px";C.style.left="-1000px";document.body.appendChild(C);},appendPostData:function(A){var D=[],B=A.split("&"),C,E;for(C=0;C<B.length;C++){E=B[C].indexOf("=");if(E!=-1){D[C]=document.createElement("input");D[C].type="hidden";D[C].name=decodeURIComponent(B[C].substring(0,E));D[C].value=decodeURIComponent(B[C].substring(E+1));this._formNode.appendChild(D[C]);}}return D;},uploadFile:function(D,N,E,C){var I="yuiIO"+D.tId,J="multipart/form-data",L=document.getElementById(I),O=this,K=(N&&N.argument)?N.argument:null,M,H,B,G;var A={action:this._formNode.getAttribute("action"),method:this._formNode.getAttribute("method"),target:this._formNode.getAttribute("target")};this._formNode.setAttribute("action",E);this._formNode.setAttribute("method","POST");this._formNode.setAttribute("target",I);if(YAHOO.env.ua.ie){this._formNode.setAttribute("encoding",J);}else{this._formNode.setAttribute("enctype",J);}if(C){M=this.appendPostData(C);}this._formNode.submit();this.startEvent.fire(D,K);if(D.startEvent){D.startEvent.fire(D,K);}if(N&&N.timeout){this._timeOut[D.tId]=window.setTimeout(function(){O.abort(D,N,true);},N.timeout);}if(M&&M.length>0){for(H=0;H<M.length;H++){this._formNode.removeChild(M[H]);}}for(B in A){if(YAHOO.lang.hasOwnProperty(A,B)){if(A[B]){this._formNode.setAttribute(B,A[B]);}else{this._formNode.removeAttribute(B);}}}this.resetFormState();var F=function(){if(N&&N.timeout){window.clearTimeout(O._timeOut[D.tId]);delete O._timeOut[D.tId];}O.completeEvent.fire(D,K);if(D.completeEvent){D.completeEvent.fire(D,K);}G={tId:D.tId,argument:N.argument};try{G.responseText=L.contentWindow.document.body?L.contentWindow.document.body.innerHTML:L.contentWindow.document.documentElement.textContent;G.responseXML=L.contentWindow.document.XMLDocument?L.contentWindow.document.XMLDocument:L.contentWindow.document;}catch(P){}if(N&&N.upload){if(!N.scope){N.upload(G);}else{N.upload.apply(N.scope,[G]);}}O.uploadEvent.fire(G);if(D.uploadEvent){D.uploadEvent.fire(G);}YAHOO.util.Event.removeListener(L,"load",F);setTimeout(function(){document.body.removeChild(L);O.releaseObject(D);},100);};YAHOO.util.Event.addListener(L,"load",F);},abort:function(E,G,A){var D;var B=(G&&G.argument)?G.argument:null;if(E&&E.conn){if(this.isCallInProgress(E)){E.conn.abort();window.clearInterval(this._poll[E.tId]);delete this._poll[E.tId];if(A){window.clearTimeout(this._timeOut[E.tId]);delete this._timeOut[E.tId];}D=true;}}else{if(E&&E.isUpload===true){var C="yuiIO"+E.tId;var F=document.getElementById(C);if(F){YAHOO.util.Event.removeListener(F,"load");document.body.removeChild(F);if(A){window.clearTimeout(this._timeOut[E.tId]);delete this._timeOut[E.tId];}D=true;}}else{D=false;}}if(D===true){this.abortEvent.fire(E,B);if(E.abortEvent){E.abortEvent.fire(E,B);}this.handleTransactionResponse(E,G,true);}return D;},isCallInProgress:function(B){if(B&&B.conn){return B.conn.readyState!==4&&B.conn.readyState!==0;}else{if(B&&B.isUpload===true){var A="yuiIO"+B.tId;return document.getElementById(A)?true:false;}else{return false;}}},releaseObject:function(A){if(A&&A.conn){A.conn=null;A=null;}}};YAHOO.register("connection",YAHOO.util.Connect,{version:"2.7.0",build:"1796"});(function(){var B=YAHOO.util;var A=function(D,C,E,F){if(!D){}this.init(D,C,E,F);};A.NAME="Anim";A.prototype={toString:function(){var C=this.getEl()||{};var D=C.id||C.tagName;return(this.constructor.NAME+": "+D);},patterns:{noNegatives:/width|height|opacity|padding/i,offsetAttribute:/^((width|height)|(top|left))$/,defaultUnit:/width|height|top$|bottom$|left$|right$/i,offsetUnit:/\d+(em|%|en|ex|pt|in|cm|mm|pc)$/i},doMethod:function(C,E,D){return this.method(this.currentFrame,E,D-E,this.totalFrames);},setAttribute:function(C,F,E){var D=this.getEl();if(this.patterns.noNegatives.test(C)){F=(F>0)?F:0;}if("style" in D){B.Dom.setStyle(D,C,F+E);}else{if(C in D){D[C]=F;}}},getAttribute:function(C){var E=this.getEl();var G=B.Dom.getStyle(E,C);if(G!=="auto"&&!this.patterns.offsetUnit.test(G)){return parseFloat(G);}var D=this.patterns.offsetAttribute.exec(C)||[];var H=!!(D[3]);var F=!!(D[2]);if("style" in E){if(F||(B.Dom.getStyle(E,"position")=="absolute"&&H)){G=E["offset"+D[0].charAt(0).toUpperCase()+D[0].substr(1)];}else{G=0;}}else{if(C in E){G=E[C];}}return G;},getDefaultUnit:function(C){if(this.patterns.defaultUnit.test(C)){return"px";}return"";},setRuntimeAttribute:function(D){var I;var E;var F=this.attributes;this.runtimeAttributes[D]={};var H=function(J){return(typeof J!=="undefined");};if(!H(F[D]["to"])&&!H(F[D]["by"])){return false;}I=(H(F[D]["from"]))?F[D]["from"]:this.getAttribute(D);if(H(F[D]["to"])){E=F[D]["to"];}else{if(H(F[D]["by"])){if(I.constructor==Array){E=[];for(var G=0,C=I.length;G<C;++G){E[G]=I[G]+F[D]["by"][G]*1;}}else{E=I+F[D]["by"]*1;}}}this.runtimeAttributes[D].start=I;this.runtimeAttributes[D].end=E;this.runtimeAttributes[D].unit=(H(F[D].unit))?F[D]["unit"]:this.getDefaultUnit(D);return true;},init:function(E,J,I,C){var D=false;var F=null;var H=0;E=B.Dom.get(E);this.attributes=J||{};this.duration=!YAHOO.lang.isUndefined(I)?I:1;this.method=C||B.Easing.easeNone;this.useSeconds=true;this.currentFrame=0;this.totalFrames=B.AnimMgr.fps;this.setEl=function(M){E=B.Dom.get(M);};this.getEl=function(){return E;};this.isAnimated=function(){return D;};this.getStartTime=function(){return F;};this.runtimeAttributes={};this.animate=function(){if(this.isAnimated()){return false;}this.currentFrame=0;this.totalFrames=(this.useSeconds)?Math.ceil(B.AnimMgr.fps*this.duration):this.duration;if(this.duration===0&&this.useSeconds){this.totalFrames=1;}B.AnimMgr.registerElement(this);return true;};this.stop=function(M){if(!this.isAnimated()){return false;}if(M){this.currentFrame=this.totalFrames;this._onTween.fire();}B.AnimMgr.stop(this);};var L=function(){this.onStart.fire();this.runtimeAttributes={};for(var M in this.attributes){this.setRuntimeAttribute(M);}D=true;H=0;F=new Date();};var K=function(){var O={duration:new Date()-this.getStartTime(),currentFrame:this.currentFrame};O.toString=function(){return("duration: "+O.duration+", currentFrame: "+O.currentFrame);};this.onTween.fire(O);var N=this.runtimeAttributes;for(var M in N){this.setAttribute(M,this.doMethod(M,N[M].start,N[M].end),N[M].unit);}H+=1;};var G=function(){var M=(new Date()-F)/1000;var N={duration:M,frames:H,fps:H/M};N.toString=function(){return("duration: "+N.duration+", frames: "+N.frames+", fps: "+N.fps);};D=false;H=0;this.onComplete.fire(N);};this._onStart=new B.CustomEvent("_start",this,true);this.onStart=new B.CustomEvent("start",this);this.onTween=new B.CustomEvent("tween",this);this._onTween=new B.CustomEvent("_tween",this,true);this.onComplete=new B.CustomEvent("complete",this);this._onComplete=new B.CustomEvent("_complete",this,true);this._onStart.subscribe(L);this._onTween.subscribe(K);this._onComplete.subscribe(G);}};B.Anim=A;})();YAHOO.util.AnimMgr=new function(){var C=null;var B=[];var A=0;this.fps=1000;this.delay=1;this.registerElement=function(F){B[B.length]=F;A+=1;F._onStart.fire();this.start();};this.unRegister=function(G,F){F=F||E(G);if(!G.isAnimated()||F==-1){return false;}G._onComplete.fire();B.splice(F,1);A-=1;if(A<=0){this.stop();}return true;};this.start=function(){if(C===null){C=setInterval(this.run,this.delay);}};this.stop=function(H){if(!H){clearInterval(C);for(var G=0,F=B.length;G<F;++G){this.unRegister(B[0],0);}B=[];C=null;A=0;}else{this.unRegister(H);}};this.run=function(){for(var H=0,F=B.length;H<F;++H){var G=B[H];if(!G||!G.isAnimated()){continue;}if(G.currentFrame<G.totalFrames||G.totalFrames===null){G.currentFrame+=1;if(G.useSeconds){D(G);}G._onTween.fire();}else{YAHOO.util.AnimMgr.stop(G,H);}}};var E=function(H){for(var G=0,F=B.length;G<F;++G){if(B[G]==H){return G;}}return -1;};var D=function(G){var J=G.totalFrames;var I=G.currentFrame;var H=(G.currentFrame*G.duration*1000/G.totalFrames);var F=(new Date()-G.getStartTime());var K=0;if(F<G.duration*1000){K=Math.round((F/H-1)*G.currentFrame);}else{K=J-(I+1);}if(K>0&&isFinite(K)){if(G.currentFrame+K>=J){K=J-(I+1);}G.currentFrame+=K;}};};YAHOO.util.Bezier=new function(){this.getPosition=function(E,D){var F=E.length;var C=[];for(var B=0;B<F;++B){C[B]=[E[B][0],E[B][1]];}for(var A=1;A<F;++A){for(B=0;B<F-A;++B){C[B][0]=(1-D)*C[B][0]+D*C[parseInt(B+1,10)][0];C[B][1]=(1-D)*C[B][1]+D*C[parseInt(B+1,10)][1];}}return[C[0][0],C[0][1]];};};(function(){var A=function(F,E,G,H){A.superclass.constructor.call(this,F,E,G,H);};A.NAME="ColorAnim";A.DEFAULT_BGCOLOR="#fff";var C=YAHOO.util;YAHOO.extend(A,C.Anim);var D=A.superclass;var B=A.prototype;B.patterns.color=/color$/i;B.patterns.rgb=/^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i;B.patterns.hex=/^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i;B.patterns.hex3=/^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i;B.patterns.transparent=/^transparent|rgba\(0, 0, 0, 0\)$/;B.parseColor=function(E){if(E.length==3){return E;}var F=this.patterns.hex.exec(E);if(F&&F.length==4){return[parseInt(F[1],16),parseInt(F[2],16),parseInt(F[3],16)];}F=this.patterns.rgb.exec(E);if(F&&F.length==4){return[parseInt(F[1],10),parseInt(F[2],10),parseInt(F[3],10)];}F=this.patterns.hex3.exec(E);if(F&&F.length==4){return[parseInt(F[1]+F[1],16),parseInt(F[2]+F[2],16),parseInt(F[3]+F[3],16)];
}return null;};B.getAttribute=function(E){var G=this.getEl();if(this.patterns.color.test(E)){var I=YAHOO.util.Dom.getStyle(G,E);var H=this;if(this.patterns.transparent.test(I)){var F=YAHOO.util.Dom.getAncestorBy(G,function(J){return !H.patterns.transparent.test(I);});if(F){I=C.Dom.getStyle(F,E);}else{I=A.DEFAULT_BGCOLOR;}}}else{I=D.getAttribute.call(this,E);}return I;};B.doMethod=function(F,J,G){var I;if(this.patterns.color.test(F)){I=[];for(var H=0,E=J.length;H<E;++H){I[H]=D.doMethod.call(this,F,J[H],G[H]);}I="rgb("+Math.floor(I[0])+","+Math.floor(I[1])+","+Math.floor(I[2])+")";}else{I=D.doMethod.call(this,F,J,G);}return I;};B.setRuntimeAttribute=function(F){D.setRuntimeAttribute.call(this,F);if(this.patterns.color.test(F)){var H=this.attributes;var J=this.parseColor(this.runtimeAttributes[F].start);var G=this.parseColor(this.runtimeAttributes[F].end);if(typeof H[F]["to"]==="undefined"&&typeof H[F]["by"]!=="undefined"){G=this.parseColor(H[F].by);for(var I=0,E=J.length;I<E;++I){G[I]=J[I]+G[I];}}this.runtimeAttributes[F].start=J;this.runtimeAttributes[F].end=G;}};C.ColorAnim=A;})();
/*
TERMS OF USE - EASING EQUATIONS
Open source under the BSD License.
Copyright 2001 Robert Penner All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * Neither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
YAHOO.util.Easing={easeNone:function(B,A,D,C){return D*B/C+A;},easeIn:function(B,A,D,C){return D*(B/=C)*B+A;},easeOut:function(B,A,D,C){return -D*(B/=C)*(B-2)+A;},easeBoth:function(B,A,D,C){if((B/=C/2)<1){return D/2*B*B+A;}return -D/2*((--B)*(B-2)-1)+A;},easeInStrong:function(B,A,D,C){return D*(B/=C)*B*B*B+A;},easeOutStrong:function(B,A,D,C){return -D*((B=B/C-1)*B*B*B-1)+A;},easeBothStrong:function(B,A,D,C){if((B/=C/2)<1){return D/2*B*B*B*B+A;}return -D/2*((B-=2)*B*B*B-2)+A;},elasticIn:function(C,A,G,F,B,E){if(C==0){return A;}if((C/=F)==1){return A+G;}if(!E){E=F*0.3;}if(!B||B<Math.abs(G)){B=G;var D=E/4;}else{var D=E/(2*Math.PI)*Math.asin(G/B);}return -(B*Math.pow(2,10*(C-=1))*Math.sin((C*F-D)*(2*Math.PI)/E))+A;},elasticOut:function(C,A,G,F,B,E){if(C==0){return A;}if((C/=F)==1){return A+G;}if(!E){E=F*0.3;}if(!B||B<Math.abs(G)){B=G;var D=E/4;}else{var D=E/(2*Math.PI)*Math.asin(G/B);}return B*Math.pow(2,-10*C)*Math.sin((C*F-D)*(2*Math.PI)/E)+G+A;},elasticBoth:function(C,A,G,F,B,E){if(C==0){return A;}if((C/=F/2)==2){return A+G;}if(!E){E=F*(0.3*1.5);}if(!B||B<Math.abs(G)){B=G;var D=E/4;}else{var D=E/(2*Math.PI)*Math.asin(G/B);}if(C<1){return -0.5*(B*Math.pow(2,10*(C-=1))*Math.sin((C*F-D)*(2*Math.PI)/E))+A;}return B*Math.pow(2,-10*(C-=1))*Math.sin((C*F-D)*(2*Math.PI)/E)*0.5+G+A;},backIn:function(B,A,E,D,C){if(typeof C=="undefined"){C=1.70158;}return E*(B/=D)*B*((C+1)*B-C)+A;},backOut:function(B,A,E,D,C){if(typeof C=="undefined"){C=1.70158;}return E*((B=B/D-1)*B*((C+1)*B+C)+1)+A;},backBoth:function(B,A,E,D,C){if(typeof C=="undefined"){C=1.70158;}if((B/=D/2)<1){return E/2*(B*B*(((C*=(1.525))+1)*B-C))+A;}return E/2*((B-=2)*B*(((C*=(1.525))+1)*B+C)+2)+A;},bounceIn:function(B,A,D,C){return D-YAHOO.util.Easing.bounceOut(C-B,0,D,C)+A;},bounceOut:function(B,A,D,C){if((B/=C)<(1/2.75)){return D*(7.5625*B*B)+A;}else{if(B<(2/2.75)){return D*(7.5625*(B-=(1.5/2.75))*B+0.75)+A;}else{if(B<(2.5/2.75)){return D*(7.5625*(B-=(2.25/2.75))*B+0.9375)+A;}}}return D*(7.5625*(B-=(2.625/2.75))*B+0.984375)+A;},bounceBoth:function(B,A,D,C){if(B<C/2){return YAHOO.util.Easing.bounceIn(B*2,0,D,C)*0.5+A;}return YAHOO.util.Easing.bounceOut(B*2-C,0,D,C)*0.5+D*0.5+A;}};(function(){var A=function(H,G,I,J){if(H){A.superclass.constructor.call(this,H,G,I,J);}};A.NAME="Motion";var E=YAHOO.util;YAHOO.extend(A,E.ColorAnim);var F=A.superclass;var C=A.prototype;C.patterns.points=/^points$/i;C.setAttribute=function(G,I,H){if(this.patterns.points.test(G)){H=H||"px";F.setAttribute.call(this,"left",I[0],H);F.setAttribute.call(this,"top",I[1],H);}else{F.setAttribute.call(this,G,I,H);}};C.getAttribute=function(G){if(this.patterns.points.test(G)){var H=[F.getAttribute.call(this,"left"),F.getAttribute.call(this,"top")];}else{H=F.getAttribute.call(this,G);}return H;};C.doMethod=function(G,K,H){var J=null;if(this.patterns.points.test(G)){var I=this.method(this.currentFrame,0,100,this.totalFrames)/100;J=E.Bezier.getPosition(this.runtimeAttributes[G],I);}else{J=F.doMethod.call(this,G,K,H);}return J;};C.setRuntimeAttribute=function(P){if(this.patterns.points.test(P)){var H=this.getEl();var J=this.attributes;var G;var L=J["points"]["control"]||[];var I;var M,O;if(L.length>0&&!(L[0] instanceof Array)){L=[L];}else{var K=[];for(M=0,O=L.length;M<O;++M){K[M]=L[M];}L=K;}if(E.Dom.getStyle(H,"position")=="static"){E.Dom.setStyle(H,"position","relative");}if(D(J["points"]["from"])){E.Dom.setXY(H,J["points"]["from"]);
}else{E.Dom.setXY(H,E.Dom.getXY(H));}G=this.getAttribute("points");if(D(J["points"]["to"])){I=B.call(this,J["points"]["to"],G);var N=E.Dom.getXY(this.getEl());for(M=0,O=L.length;M<O;++M){L[M]=B.call(this,L[M],G);}}else{if(D(J["points"]["by"])){I=[G[0]+J["points"]["by"][0],G[1]+J["points"]["by"][1]];for(M=0,O=L.length;M<O;++M){L[M]=[G[0]+L[M][0],G[1]+L[M][1]];}}}this.runtimeAttributes[P]=[G];if(L.length>0){this.runtimeAttributes[P]=this.runtimeAttributes[P].concat(L);}this.runtimeAttributes[P][this.runtimeAttributes[P].length]=I;}else{F.setRuntimeAttribute.call(this,P);}};var B=function(G,I){var H=E.Dom.getXY(this.getEl());G=[G[0]-H[0]+I[0],G[1]-H[1]+I[1]];return G;};var D=function(G){return(typeof G!=="undefined");};E.Motion=A;})();(function(){var D=function(F,E,G,H){if(F){D.superclass.constructor.call(this,F,E,G,H);}};D.NAME="Scroll";var B=YAHOO.util;YAHOO.extend(D,B.ColorAnim);var C=D.superclass;var A=D.prototype;A.doMethod=function(E,H,F){var G=null;if(E=="scroll"){G=[this.method(this.currentFrame,H[0],F[0]-H[0],this.totalFrames),this.method(this.currentFrame,H[1],F[1]-H[1],this.totalFrames)];}else{G=C.doMethod.call(this,E,H,F);}return G;};A.getAttribute=function(E){var G=null;var F=this.getEl();if(E=="scroll"){G=[F.scrollLeft,F.scrollTop];}else{G=C.getAttribute.call(this,E);}return G;};A.setAttribute=function(E,H,G){var F=this.getEl();if(E=="scroll"){F.scrollLeft=H[0];F.scrollTop=H[1];}else{C.setAttribute.call(this,E,H,G);}};B.Scroll=D;})();YAHOO.register("animation",YAHOO.util.Anim,{version:"2.7.0",build:"1796"});if(!YAHOO.util.DragDropMgr){YAHOO.util.DragDropMgr=function(){var A=YAHOO.util.Event,B=YAHOO.util.Dom;return{useShim:false,_shimActive:false,_shimState:false,_debugShim:false,_createShim:function(){var C=document.createElement("div");C.id="yui-ddm-shim";if(document.body.firstChild){document.body.insertBefore(C,document.body.firstChild);}else{document.body.appendChild(C);}C.style.display="none";C.style.backgroundColor="red";C.style.position="absolute";C.style.zIndex="99999";B.setStyle(C,"opacity","0");this._shim=C;A.on(C,"mouseup",this.handleMouseUp,this,true);A.on(C,"mousemove",this.handleMouseMove,this,true);A.on(window,"scroll",this._sizeShim,this,true);},_sizeShim:function(){if(this._shimActive){var C=this._shim;C.style.height=B.getDocumentHeight()+"px";C.style.width=B.getDocumentWidth()+"px";C.style.top="0";C.style.left="0";}},_activateShim:function(){if(this.useShim){if(!this._shim){this._createShim();}this._shimActive=true;var C=this._shim,D="0";if(this._debugShim){D=".5";}B.setStyle(C,"opacity",D);this._sizeShim();C.style.display="block";}},_deactivateShim:function(){this._shim.style.display="none";this._shimActive=false;},_shim:null,ids:{},handleIds:{},dragCurrent:null,dragOvers:{},deltaX:0,deltaY:0,preventDefault:true,stopPropagation:true,initialized:false,locked:false,interactionInfo:null,init:function(){this.initialized=true;},POINT:0,INTERSECT:1,STRICT_INTERSECT:2,mode:0,_execOnAll:function(E,D){for(var F in this.ids){for(var C in this.ids[F]){var G=this.ids[F][C];if(!this.isTypeOfDD(G)){continue;}G[E].apply(G,D);}}},_onLoad:function(){this.init();A.on(document,"mouseup",this.handleMouseUp,this,true);A.on(document,"mousemove",this.handleMouseMove,this,true);A.on(window,"unload",this._onUnload,this,true);A.on(window,"resize",this._onResize,this,true);},_onResize:function(C){this._execOnAll("resetConstraints",[]);},lock:function(){this.locked=true;},unlock:function(){this.locked=false;},isLocked:function(){return this.locked;},locationCache:{},useCache:true,clickPixelThresh:3,clickTimeThresh:1000,dragThreshMet:false,clickTimeout:null,startX:0,startY:0,fromTimeout:false,regDragDrop:function(D,C){if(!this.initialized){this.init();}if(!this.ids[C]){this.ids[C]={};}this.ids[C][D.id]=D;},removeDDFromGroup:function(E,C){if(!this.ids[C]){this.ids[C]={};}var D=this.ids[C];if(D&&D[E.id]){delete D[E.id];}},_remove:function(E){for(var D in E.groups){if(D){var C=this.ids[D];if(C&&C[E.id]){delete C[E.id];}}}delete this.handleIds[E.id];},regHandle:function(D,C){if(!this.handleIds[D]){this.handleIds[D]={};}this.handleIds[D][C]=C;},isDragDrop:function(C){return(this.getDDById(C))?true:false;},getRelated:function(H,D){var G=[];for(var F in H.groups){for(var E in this.ids[F]){var C=this.ids[F][E];if(!this.isTypeOfDD(C)){continue;}if(!D||C.isTarget){G[G.length]=C;}}}return G;},isLegalTarget:function(G,F){var D=this.getRelated(G,true);for(var E=0,C=D.length;E<C;++E){if(D[E].id==F.id){return true;}}return false;},isTypeOfDD:function(C){return(C&&C.__ygDragDrop);},isHandle:function(D,C){return(this.handleIds[D]&&this.handleIds[D][C]);},getDDById:function(D){for(var C in this.ids){if(this.ids[C][D]){return this.ids[C][D];}}return null;},handleMouseDown:function(E,D){this.currentTarget=YAHOO.util.Event.getTarget(E);this.dragCurrent=D;var C=D.getEl();this.startX=YAHOO.util.Event.getPageX(E);this.startY=YAHOO.util.Event.getPageY(E);this.deltaX=this.startX-C.offsetLeft;this.deltaY=this.startY-C.offsetTop;this.dragThreshMet=false;this.clickTimeout=setTimeout(function(){var F=YAHOO.util.DDM;F.startDrag(F.startX,F.startY);F.fromTimeout=true;},this.clickTimeThresh);},startDrag:function(C,E){if(this.dragCurrent&&this.dragCurrent.useShim){this._shimState=this.useShim;this.useShim=true;}this._activateShim();clearTimeout(this.clickTimeout);var D=this.dragCurrent;if(D&&D.events.b4StartDrag){D.b4StartDrag(C,E);D.fireEvent("b4StartDragEvent",{x:C,y:E});}if(D&&D.events.startDrag){D.startDrag(C,E);D.fireEvent("startDragEvent",{x:C,y:E});}this.dragThreshMet=true;},handleMouseUp:function(C){if(this.dragCurrent){clearTimeout(this.clickTimeout);if(this.dragThreshMet){if(this.fromTimeout){this.fromTimeout=false;this.handleMouseMove(C);}this.fromTimeout=false;this.fireEvents(C,true);}else{}this.stopDrag(C);this.stopEvent(C);}},stopEvent:function(C){if(this.stopPropagation){YAHOO.util.Event.stopPropagation(C);}if(this.preventDefault){YAHOO.util.Event.preventDefault(C);}},stopDrag:function(E,D){var C=this.dragCurrent;if(C&&!D){if(this.dragThreshMet){if(C.events.b4EndDrag){C.b4EndDrag(E);C.fireEvent("b4EndDragEvent",{e:E});}if(C.events.endDrag){C.endDrag(E);C.fireEvent("endDragEvent",{e:E});}}if(C.events.mouseUp){C.onMouseUp(E);C.fireEvent("mouseUpEvent",{e:E});}}if(this._shimActive){this._deactivateShim();if(this.dragCurrent&&this.dragCurrent.useShim){this.useShim=this._shimState;this._shimState=false;}}this.dragCurrent=null;this.dragOvers={};},handleMouseMove:function(F){var C=this.dragCurrent;if(C){if(YAHOO.util.Event.isIE&&!F.button){this.stopEvent(F);return this.handleMouseUp(F);}else{if(F.clientX<0||F.clientY<0){}}if(!this.dragThreshMet){var E=Math.abs(this.startX-YAHOO.util.Event.getPageX(F));var D=Math.abs(this.startY-YAHOO.util.Event.getPageY(F));if(E>this.clickPixelThresh||D>this.clickPixelThresh){this.startDrag(this.startX,this.startY);}}if(this.dragThreshMet){if(C&&C.events.b4Drag){C.b4Drag(F);C.fireEvent("b4DragEvent",{e:F});}if(C&&C.events.drag){C.onDrag(F);C.fireEvent("dragEvent",{e:F});}if(C){this.fireEvents(F,false);}}this.stopEvent(F);}},fireEvents:function(V,L){var a=this.dragCurrent;if(!a||a.isLocked()||a.dragOnly){return;}var N=YAHOO.util.Event.getPageX(V),M=YAHOO.util.Event.getPageY(V),P=new YAHOO.util.Point(N,M),K=a.getTargetCoord(P.x,P.y),F=a.getDragEl(),E=["out","over","drop","enter"],U=new YAHOO.util.Region(K.y,K.x+F.offsetWidth,K.y+F.offsetHeight,K.x),I=[],D={},Q=[],c={outEvts:[],overEvts:[],dropEvts:[],enterEvts:[]};for(var S in this.dragOvers){var d=this.dragOvers[S];if(!this.isTypeOfDD(d)){continue;
}if(!this.isOverTarget(P,d,this.mode,U)){c.outEvts.push(d);}I[S]=true;delete this.dragOvers[S];}for(var R in a.groups){if("string"!=typeof R){continue;}for(S in this.ids[R]){var G=this.ids[R][S];if(!this.isTypeOfDD(G)){continue;}if(G.isTarget&&!G.isLocked()&&G!=a){if(this.isOverTarget(P,G,this.mode,U)){D[R]=true;if(L){c.dropEvts.push(G);}else{if(!I[G.id]){c.enterEvts.push(G);}else{c.overEvts.push(G);}this.dragOvers[G.id]=G;}}}}}this.interactionInfo={out:c.outEvts,enter:c.enterEvts,over:c.overEvts,drop:c.dropEvts,point:P,draggedRegion:U,sourceRegion:this.locationCache[a.id],validDrop:L};for(var C in D){Q.push(C);}if(L&&!c.dropEvts.length){this.interactionInfo.validDrop=false;if(a.events.invalidDrop){a.onInvalidDrop(V);a.fireEvent("invalidDropEvent",{e:V});}}for(S=0;S<E.length;S++){var Y=null;if(c[E[S]+"Evts"]){Y=c[E[S]+"Evts"];}if(Y&&Y.length){var H=E[S].charAt(0).toUpperCase()+E[S].substr(1),X="onDrag"+H,J="b4Drag"+H,O="drag"+H+"Event",W="drag"+H;if(this.mode){if(a.events[J]){a[J](V,Y,Q);a.fireEvent(J+"Event",{event:V,info:Y,group:Q});}if(a.events[W]){a[X](V,Y,Q);a.fireEvent(O,{event:V,info:Y,group:Q});}}else{for(var Z=0,T=Y.length;Z<T;++Z){if(a.events[J]){a[J](V,Y[Z].id,Q[0]);a.fireEvent(J+"Event",{event:V,info:Y[Z].id,group:Q[0]});}if(a.events[W]){a[X](V,Y[Z].id,Q[0]);a.fireEvent(O,{event:V,info:Y[Z].id,group:Q[0]});}}}}}},getBestMatch:function(E){var G=null;var D=E.length;if(D==1){G=E[0];}else{for(var F=0;F<D;++F){var C=E[F];if(this.mode==this.INTERSECT&&C.cursorIsOver){G=C;break;}else{if(!G||!G.overlap||(C.overlap&&G.overlap.getArea()<C.overlap.getArea())){G=C;}}}}return G;},refreshCache:function(D){var F=D||this.ids;for(var C in F){if("string"!=typeof C){continue;}for(var E in this.ids[C]){var G=this.ids[C][E];if(this.isTypeOfDD(G)){var H=this.getLocation(G);if(H){this.locationCache[G.id]=H;}else{delete this.locationCache[G.id];}}}}},verifyEl:function(D){try{if(D){var C=D.offsetParent;if(C){return true;}}}catch(E){}return false;},getLocation:function(H){if(!this.isTypeOfDD(H)){return null;}var F=H.getEl(),K,E,D,M,L,N,C,J,G;try{K=YAHOO.util.Dom.getXY(F);}catch(I){}if(!K){return null;}E=K[0];D=E+F.offsetWidth;M=K[1];L=M+F.offsetHeight;N=M-H.padding[0];C=D+H.padding[1];J=L+H.padding[2];G=E-H.padding[3];return new YAHOO.util.Region(N,C,J,G);},isOverTarget:function(K,C,E,F){var G=this.locationCache[C.id];if(!G||!this.useCache){G=this.getLocation(C);this.locationCache[C.id]=G;}if(!G){return false;}C.cursorIsOver=G.contains(K);var J=this.dragCurrent;if(!J||(!E&&!J.constrainX&&!J.constrainY)){return C.cursorIsOver;}C.overlap=null;if(!F){var H=J.getTargetCoord(K.x,K.y);var D=J.getDragEl();F=new YAHOO.util.Region(H.y,H.x+D.offsetWidth,H.y+D.offsetHeight,H.x);}var I=F.intersect(G);if(I){C.overlap=I;return(E)?true:C.cursorIsOver;}else{return false;}},_onUnload:function(D,C){this.unregAll();},unregAll:function(){if(this.dragCurrent){this.stopDrag();this.dragCurrent=null;}this._execOnAll("unreg",[]);this.ids={};},elementCache:{},getElWrapper:function(D){var C=this.elementCache[D];if(!C||!C.el){C=this.elementCache[D]=new this.ElementWrapper(YAHOO.util.Dom.get(D));}return C;},getElement:function(C){return YAHOO.util.Dom.get(C);},getCss:function(D){var C=YAHOO.util.Dom.get(D);return(C)?C.style:null;},ElementWrapper:function(C){this.el=C||null;this.id=this.el&&C.id;this.css=this.el&&C.style;},getPosX:function(C){return YAHOO.util.Dom.getX(C);},getPosY:function(C){return YAHOO.util.Dom.getY(C);},swapNode:function(E,C){if(E.swapNode){E.swapNode(C);}else{var F=C.parentNode;var D=C.nextSibling;if(D==E){F.insertBefore(E,C);}else{if(C==E.nextSibling){F.insertBefore(C,E);}else{E.parentNode.replaceChild(C,E);F.insertBefore(E,D);}}}},getScroll:function(){var E,C,F=document.documentElement,D=document.body;if(F&&(F.scrollTop||F.scrollLeft)){E=F.scrollTop;C=F.scrollLeft;}else{if(D){E=D.scrollTop;C=D.scrollLeft;}else{}}return{top:E,left:C};},getStyle:function(D,C){return YAHOO.util.Dom.getStyle(D,C);},getScrollTop:function(){return this.getScroll().top;},getScrollLeft:function(){return this.getScroll().left;},moveToEl:function(C,E){var D=YAHOO.util.Dom.getXY(E);YAHOO.util.Dom.setXY(C,D);},getClientHeight:function(){return YAHOO.util.Dom.getViewportHeight();},getClientWidth:function(){return YAHOO.util.Dom.getViewportWidth();},numericSort:function(D,C){return(D-C);},_timeoutCount:0,_addListeners:function(){var C=YAHOO.util.DDM;if(YAHOO.util.Event&&document){C._onLoad();}else{if(C._timeoutCount>2000){}else{setTimeout(C._addListeners,10);if(document&&document.body){C._timeoutCount+=1;}}}},handleWasClicked:function(C,E){if(this.isHandle(E,C.id)){return true;}else{var D=C.parentNode;while(D){if(this.isHandle(E,D.id)){return true;}else{D=D.parentNode;}}}return false;}};}();YAHOO.util.DDM=YAHOO.util.DragDropMgr;YAHOO.util.DDM._addListeners();}(function(){var A=YAHOO.util.Event;var B=YAHOO.util.Dom;YAHOO.util.DragDrop=function(E,C,D){if(E){this.init(E,C,D);}};YAHOO.util.DragDrop.prototype={events:null,on:function(){this.subscribe.apply(this,arguments);},id:null,config:null,dragElId:null,handleElId:null,invalidHandleTypes:null,invalidHandleIds:null,invalidHandleClasses:null,startPageX:0,startPageY:0,groups:null,locked:false,lock:function(){this.locked=true;},unlock:function(){this.locked=false;},isTarget:true,padding:null,dragOnly:false,useShim:false,_domRef:null,__ygDragDrop:true,constrainX:false,constrainY:false,minX:0,maxX:0,minY:0,maxY:0,deltaX:0,deltaY:0,maintainOffset:false,xTicks:null,yTicks:null,primaryButtonOnly:true,available:false,hasOuterHandles:false,cursorIsOver:false,overlap:null,b4StartDrag:function(C,D){},startDrag:function(C,D){},b4Drag:function(C){},onDrag:function(C){},onDragEnter:function(C,D){},b4DragOver:function(C){},onDragOver:function(C,D){},b4DragOut:function(C){},onDragOut:function(C,D){},b4DragDrop:function(C){},onDragDrop:function(C,D){},onInvalidDrop:function(C){},b4EndDrag:function(C){},endDrag:function(C){},b4MouseDown:function(C){},onMouseDown:function(C){},onMouseUp:function(C){},onAvailable:function(){},getEl:function(){if(!this._domRef){this._domRef=B.get(this.id);
}return this._domRef;},getDragEl:function(){return B.get(this.dragElId);},init:function(F,C,D){this.initTarget(F,C,D);A.on(this._domRef||this.id,"mousedown",this.handleMouseDown,this,true);for(var E in this.events){this.createEvent(E+"Event");}},initTarget:function(E,C,D){this.config=D||{};this.events={};this.DDM=YAHOO.util.DDM;this.groups={};if(typeof E!=="string"){this._domRef=E;E=B.generateId(E);}this.id=E;this.addToGroup((C)?C:"default");this.handleElId=E;A.onAvailable(E,this.handleOnAvailable,this,true);this.setDragElId(E);this.invalidHandleTypes={A:"A"};this.invalidHandleIds={};this.invalidHandleClasses=[];this.applyConfig();},applyConfig:function(){this.events={mouseDown:true,b4MouseDown:true,mouseUp:true,b4StartDrag:true,startDrag:true,b4EndDrag:true,endDrag:true,drag:true,b4Drag:true,invalidDrop:true,b4DragOut:true,dragOut:true,dragEnter:true,b4DragOver:true,dragOver:true,b4DragDrop:true,dragDrop:true};if(this.config.events){for(var C in this.config.events){if(this.config.events[C]===false){this.events[C]=false;}}}this.padding=this.config.padding||[0,0,0,0];this.isTarget=(this.config.isTarget!==false);this.maintainOffset=(this.config.maintainOffset);this.primaryButtonOnly=(this.config.primaryButtonOnly!==false);this.dragOnly=((this.config.dragOnly===true)?true:false);this.useShim=((this.config.useShim===true)?true:false);},handleOnAvailable:function(){this.available=true;this.resetConstraints();this.onAvailable();},setPadding:function(E,C,F,D){if(!C&&0!==C){this.padding=[E,E,E,E];}else{if(!F&&0!==F){this.padding=[E,C,E,C];}else{this.padding=[E,C,F,D];}}},setInitPosition:function(F,E){var G=this.getEl();if(!this.DDM.verifyEl(G)){if(G&&G.style&&(G.style.display=="none")){}else{}return;}var D=F||0;var C=E||0;var H=B.getXY(G);this.initPageX=H[0]-D;this.initPageY=H[1]-C;this.lastPageX=H[0];this.lastPageY=H[1];this.setStartPosition(H);},setStartPosition:function(D){var C=D||B.getXY(this.getEl());this.deltaSetXY=null;this.startPageX=C[0];this.startPageY=C[1];},addToGroup:function(C){this.groups[C]=true;this.DDM.regDragDrop(this,C);},removeFromGroup:function(C){if(this.groups[C]){delete this.groups[C];}this.DDM.removeDDFromGroup(this,C);},setDragElId:function(C){this.dragElId=C;},setHandleElId:function(C){if(typeof C!=="string"){C=B.generateId(C);}this.handleElId=C;this.DDM.regHandle(this.id,C);},setOuterHandleElId:function(C){if(typeof C!=="string"){C=B.generateId(C);}A.on(C,"mousedown",this.handleMouseDown,this,true);this.setHandleElId(C);this.hasOuterHandles=true;},unreg:function(){A.removeListener(this.id,"mousedown",this.handleMouseDown);this._domRef=null;this.DDM._remove(this);},isLocked:function(){return(this.DDM.isLocked()||this.locked);},handleMouseDown:function(J,I){var D=J.which||J.button;if(this.primaryButtonOnly&&D>1){return;}if(this.isLocked()){return;}var C=this.b4MouseDown(J),F=true;if(this.events.b4MouseDown){F=this.fireEvent("b4MouseDownEvent",J);}var E=this.onMouseDown(J),H=true;if(this.events.mouseDown){H=this.fireEvent("mouseDownEvent",J);}if((C===false)||(E===false)||(F===false)||(H===false)){return;}this.DDM.refreshCache(this.groups);var G=new YAHOO.util.Point(A.getPageX(J),A.getPageY(J));if(!this.hasOuterHandles&&!this.DDM.isOverTarget(G,this)){}else{if(this.clickValidator(J)){this.setStartPosition();this.DDM.handleMouseDown(J,this);this.DDM.stopEvent(J);}else{}}},clickValidator:function(D){var C=YAHOO.util.Event.getTarget(D);return(this.isValidHandleChild(C)&&(this.id==this.handleElId||this.DDM.handleWasClicked(C,this.id)));},getTargetCoord:function(E,D){var C=E-this.deltaX;var F=D-this.deltaY;if(this.constrainX){if(C<this.minX){C=this.minX;}if(C>this.maxX){C=this.maxX;}}if(this.constrainY){if(F<this.minY){F=this.minY;}if(F>this.maxY){F=this.maxY;}}C=this.getTick(C,this.xTicks);F=this.getTick(F,this.yTicks);return{x:C,y:F};},addInvalidHandleType:function(C){var D=C.toUpperCase();this.invalidHandleTypes[D]=D;},addInvalidHandleId:function(C){if(typeof C!=="string"){C=B.generateId(C);}this.invalidHandleIds[C]=C;},addInvalidHandleClass:function(C){this.invalidHandleClasses.push(C);},removeInvalidHandleType:function(C){var D=C.toUpperCase();delete this.invalidHandleTypes[D];},removeInvalidHandleId:function(C){if(typeof C!=="string"){C=B.generateId(C);}delete this.invalidHandleIds[C];},removeInvalidHandleClass:function(D){for(var E=0,C=this.invalidHandleClasses.length;E<C;++E){if(this.invalidHandleClasses[E]==D){delete this.invalidHandleClasses[E];}}},isValidHandleChild:function(F){var E=true;var H;try{H=F.nodeName.toUpperCase();}catch(G){H=F.nodeName;}E=E&&!this.invalidHandleTypes[H];E=E&&!this.invalidHandleIds[F.id];for(var D=0,C=this.invalidHandleClasses.length;E&&D<C;++D){E=!B.hasClass(F,this.invalidHandleClasses[D]);}return E;},setXTicks:function(F,C){this.xTicks=[];this.xTickSize=C;var E={};for(var D=this.initPageX;D>=this.minX;D=D-C){if(!E[D]){this.xTicks[this.xTicks.length]=D;E[D]=true;}}for(D=this.initPageX;D<=this.maxX;D=D+C){if(!E[D]){this.xTicks[this.xTicks.length]=D;E[D]=true;}}this.xTicks.sort(this.DDM.numericSort);},setYTicks:function(F,C){this.yTicks=[];this.yTickSize=C;var E={};for(var D=this.initPageY;D>=this.minY;D=D-C){if(!E[D]){this.yTicks[this.yTicks.length]=D;E[D]=true;}}for(D=this.initPageY;D<=this.maxY;D=D+C){if(!E[D]){this.yTicks[this.yTicks.length]=D;E[D]=true;}}this.yTicks.sort(this.DDM.numericSort);},setXConstraint:function(E,D,C){this.leftConstraint=parseInt(E,10);this.rightConstraint=parseInt(D,10);this.minX=this.initPageX-this.leftConstraint;this.maxX=this.initPageX+this.rightConstraint;if(C){this.setXTicks(this.initPageX,C);}this.constrainX=true;},clearConstraints:function(){this.constrainX=false;this.constrainY=false;this.clearTicks();},clearTicks:function(){this.xTicks=null;this.yTicks=null;this.xTickSize=0;this.yTickSize=0;},setYConstraint:function(C,E,D){this.topConstraint=parseInt(C,10);this.bottomConstraint=parseInt(E,10);this.minY=this.initPageY-this.topConstraint;this.maxY=this.initPageY+this.bottomConstraint;if(D){this.setYTicks(this.initPageY,D);
}this.constrainY=true;},resetConstraints:function(){if(this.initPageX||this.initPageX===0){var D=(this.maintainOffset)?this.lastPageX-this.initPageX:0;var C=(this.maintainOffset)?this.lastPageY-this.initPageY:0;this.setInitPosition(D,C);}else{this.setInitPosition();}if(this.constrainX){this.setXConstraint(this.leftConstraint,this.rightConstraint,this.xTickSize);}if(this.constrainY){this.setYConstraint(this.topConstraint,this.bottomConstraint,this.yTickSize);}},getTick:function(I,F){if(!F){return I;}else{if(F[0]>=I){return F[0];}else{for(var D=0,C=F.length;D<C;++D){var E=D+1;if(F[E]&&F[E]>=I){var H=I-F[D];var G=F[E]-I;return(G>H)?F[D]:F[E];}}return F[F.length-1];}}},toString:function(){return("DragDrop "+this.id);}};YAHOO.augment(YAHOO.util.DragDrop,YAHOO.util.EventProvider);})();YAHOO.util.DD=function(C,A,B){if(C){this.init(C,A,B);}};YAHOO.extend(YAHOO.util.DD,YAHOO.util.DragDrop,{scroll:true,autoOffset:function(C,B){var A=C-this.startPageX;var D=B-this.startPageY;this.setDelta(A,D);},setDelta:function(B,A){this.deltaX=B;this.deltaY=A;},setDragElPos:function(C,B){var A=this.getDragEl();this.alignElWithMouse(A,C,B);},alignElWithMouse:function(C,G,F){var E=this.getTargetCoord(G,F);if(!this.deltaSetXY){var H=[E.x,E.y];YAHOO.util.Dom.setXY(C,H);var D=parseInt(YAHOO.util.Dom.getStyle(C,"left"),10);var B=parseInt(YAHOO.util.Dom.getStyle(C,"top"),10);this.deltaSetXY=[D-E.x,B-E.y];}else{YAHOO.util.Dom.setStyle(C,"left",(E.x+this.deltaSetXY[0])+"px");YAHOO.util.Dom.setStyle(C,"top",(E.y+this.deltaSetXY[1])+"px");}this.cachePosition(E.x,E.y);var A=this;setTimeout(function(){A.autoScroll.call(A,E.x,E.y,C.offsetHeight,C.offsetWidth);},0);},cachePosition:function(B,A){if(B){this.lastPageX=B;this.lastPageY=A;}else{var C=YAHOO.util.Dom.getXY(this.getEl());this.lastPageX=C[0];this.lastPageY=C[1];}},autoScroll:function(J,I,E,K){if(this.scroll){var L=this.DDM.getClientHeight();var B=this.DDM.getClientWidth();var N=this.DDM.getScrollTop();var D=this.DDM.getScrollLeft();var H=E+I;var M=K+J;var G=(L+N-I-this.deltaY);var F=(B+D-J-this.deltaX);var C=40;var A=(document.all)?80:30;if(H>L&&G<C){window.scrollTo(D,N+A);}if(I<N&&N>0&&I-N<C){window.scrollTo(D,N-A);}if(M>B&&F<C){window.scrollTo(D+A,N);}if(J<D&&D>0&&J-D<C){window.scrollTo(D-A,N);}}},applyConfig:function(){YAHOO.util.DD.superclass.applyConfig.call(this);this.scroll=(this.config.scroll!==false);},b4MouseDown:function(A){this.setStartPosition();this.autoOffset(YAHOO.util.Event.getPageX(A),YAHOO.util.Event.getPageY(A));},b4Drag:function(A){this.setDragElPos(YAHOO.util.Event.getPageX(A),YAHOO.util.Event.getPageY(A));},toString:function(){return("DD "+this.id);}});YAHOO.util.DDProxy=function(C,A,B){if(C){this.init(C,A,B);this.initFrame();}};YAHOO.util.DDProxy.dragElId="ygddfdiv";YAHOO.extend(YAHOO.util.DDProxy,YAHOO.util.DD,{resizeFrame:true,centerFrame:false,createFrame:function(){var B=this,A=document.body;if(!A||!A.firstChild){setTimeout(function(){B.createFrame();},50);return;}var F=this.getDragEl(),E=YAHOO.util.Dom;if(!F){F=document.createElement("div");F.id=this.dragElId;var D=F.style;D.position="absolute";D.visibility="hidden";D.cursor="move";D.border="2px solid #aaa";D.zIndex=999;D.height="25px";D.width="25px";var C=document.createElement("div");E.setStyle(C,"height","100%");E.setStyle(C,"width","100%");E.setStyle(C,"background-color","#ccc");E.setStyle(C,"opacity","0");F.appendChild(C);A.insertBefore(F,A.firstChild);}},initFrame:function(){this.createFrame();},applyConfig:function(){YAHOO.util.DDProxy.superclass.applyConfig.call(this);this.resizeFrame=(this.config.resizeFrame!==false);this.centerFrame=(this.config.centerFrame);this.setDragElId(this.config.dragElId||YAHOO.util.DDProxy.dragElId);},showFrame:function(E,D){var C=this.getEl();var A=this.getDragEl();var B=A.style;this._resizeProxy();if(this.centerFrame){this.setDelta(Math.round(parseInt(B.width,10)/2),Math.round(parseInt(B.height,10)/2));}this.setDragElPos(E,D);YAHOO.util.Dom.setStyle(A,"visibility","visible");},_resizeProxy:function(){if(this.resizeFrame){var H=YAHOO.util.Dom;var B=this.getEl();var C=this.getDragEl();var G=parseInt(H.getStyle(C,"borderTopWidth"),10);var I=parseInt(H.getStyle(C,"borderRightWidth"),10);var F=parseInt(H.getStyle(C,"borderBottomWidth"),10);var D=parseInt(H.getStyle(C,"borderLeftWidth"),10);if(isNaN(G)){G=0;}if(isNaN(I)){I=0;}if(isNaN(F)){F=0;}if(isNaN(D)){D=0;}var E=Math.max(0,B.offsetWidth-I-D);var A=Math.max(0,B.offsetHeight-G-F);H.setStyle(C,"width",E+"px");H.setStyle(C,"height",A+"px");}},b4MouseDown:function(B){this.setStartPosition();var A=YAHOO.util.Event.getPageX(B);var C=YAHOO.util.Event.getPageY(B);this.autoOffset(A,C);},b4StartDrag:function(A,B){this.showFrame(A,B);},b4EndDrag:function(A){YAHOO.util.Dom.setStyle(this.getDragEl(),"visibility","hidden");},endDrag:function(D){var C=YAHOO.util.Dom;var B=this.getEl();var A=this.getDragEl();C.setStyle(A,"visibility","");C.setStyle(B,"visibility","hidden");YAHOO.util.DDM.moveToEl(B,A);C.setStyle(A,"visibility","hidden");C.setStyle(B,"visibility","");},toString:function(){return("DDProxy "+this.id);}});YAHOO.util.DDTarget=function(C,A,B){if(C){this.initTarget(C,A,B);}};YAHOO.extend(YAHOO.util.DDTarget,YAHOO.util.DragDrop,{toString:function(){return("DDTarget "+this.id);}});YAHOO.register("dragdrop",YAHOO.util.DragDropMgr,{version:"2.7.0",build:"1796"});YAHOO.util.Attribute=function(B,A){if(A){this.owner=A;this.configure(B,true);}};YAHOO.util.Attribute.prototype={name:undefined,value:null,owner:null,readOnly:false,writeOnce:false,_initialConfig:null,_written:false,method:null,setter:null,getter:null,validator:null,getValue:function(){var A=this.value;if(this.getter){A=this.getter.call(this.owner,this.name);}return A;},setValue:function(F,B){var E,A=this.owner,C=this.name;var D={type:C,prevValue:this.getValue(),newValue:F};if(this.readOnly||(this.writeOnce&&this._written)){return false;}if(this.validator&&!this.validator.call(A,F)){return false;}if(!B){E=A.fireBeforeChangeEvent(D);if(E===false){return false;}}if(this.setter){F=this.setter.call(A,F,this.name);if(F===undefined){}}if(this.method){this.method.call(A,F,this.name);}this.value=F;this._written=true;D.type=C;if(!B){this.owner.fireChangeEvent(D);}return true;},configure:function(B,C){B=B||{};if(C){this._written=false;}this._initialConfig=this._initialConfig||{};for(var A in B){if(B.hasOwnProperty(A)){this[A]=B[A];if(C){this._initialConfig[A]=B[A];}}}},resetValue:function(){return this.setValue(this._initialConfig.value);},resetConfig:function(){this.configure(this._initialConfig,true);},refresh:function(A){this.setValue(this.value,A);}};(function(){var A=YAHOO.util.Lang;YAHOO.util.AttributeProvider=function(){};YAHOO.util.AttributeProvider.prototype={_configs:null,get:function(C){this._configs=this._configs||{};var B=this._configs[C];if(!B||!this._configs.hasOwnProperty(C)){return null;}return B.getValue();},set:function(D,E,B){this._configs=this._configs||{};var C=this._configs[D];if(!C){return false;}return C.setValue(E,B);},getAttributeKeys:function(){this._configs=this._configs;var C=[],B;for(B in this._configs){if(A.hasOwnProperty(this._configs,B)&&!A.isUndefined(this._configs[B])){C[C.length]=B;}}return C;},setAttributes:function(D,B){for(var C in D){if(A.hasOwnProperty(D,C)){this.set(C,D[C],B);}}},resetValue:function(C,B){this._configs=this._configs||{};if(this._configs[C]){this.set(C,this._configs[C]._initialConfig.value,B);return true;}return false;},refresh:function(E,C){this._configs=this._configs||{};var F=this._configs;E=((A.isString(E))?[E]:E)||this.getAttributeKeys();for(var D=0,B=E.length;D<B;++D){if(F.hasOwnProperty(E[D])){this._configs[E[D]].refresh(C);}}},register:function(B,C){this.setAttributeConfig(B,C);},getAttributeConfig:function(C){this._configs=this._configs||{};var B=this._configs[C]||{};var D={};for(C in B){if(A.hasOwnProperty(B,C)){D[C]=B[C];}}return D;},setAttributeConfig:function(B,C,D){this._configs=this._configs||{};C=C||{};if(!this._configs[B]){C.name=B;this._configs[B]=this.createAttribute(C);}else{this._configs[B].configure(C,D);}},configureAttribute:function(B,C,D){this.setAttributeConfig(B,C,D);},resetAttributeConfig:function(B){this._configs=this._configs||{};this._configs[B].resetConfig();},subscribe:function(B,C){this._events=this._events||{};if(!(B in this._events)){this._events[B]=this.createEvent(B);}YAHOO.util.EventProvider.prototype.subscribe.apply(this,arguments);},on:function(){this.subscribe.apply(this,arguments);},addListener:function(){this.subscribe.apply(this,arguments);},fireBeforeChangeEvent:function(C){var B="before";B+=C.type.charAt(0).toUpperCase()+C.type.substr(1)+"Change";C.type=B;return this.fireEvent(C.type,C);},fireChangeEvent:function(B){B.type+="Change";return this.fireEvent(B.type,B);},createAttribute:function(B){return new YAHOO.util.Attribute(B,this);}};YAHOO.augment(YAHOO.util.AttributeProvider,YAHOO.util.EventProvider);})();(function(){var B=YAHOO.util.Dom,C=YAHOO.util.AttributeProvider;var A=function(D,E){this.init.apply(this,arguments);};A.DOM_EVENTS={"click":true,"dblclick":true,"keydown":true,"keypress":true,"keyup":true,"mousedown":true,"mousemove":true,"mouseout":true,"mouseover":true,"mouseup":true,"focus":true,"blur":true,"submit":true,"change":true};A.prototype={DOM_EVENTS:null,DEFAULT_HTML_SETTER:function(F,D){var E=this.get("element");if(E){E[D]=F;}},DEFAULT_HTML_GETTER:function(D){var E=this.get("element"),F;if(E){F=E[D];}return F;},appendChild:function(D){D=D.get?D.get("element"):D;return this.get("element").appendChild(D);},getElementsByTagName:function(D){return this.get("element").getElementsByTagName(D);},hasChildNodes:function(){return this.get("element").hasChildNodes();},insertBefore:function(D,E){D=D.get?D.get("element"):D;E=(E&&E.get)?E.get("element"):E;return this.get("element").insertBefore(D,E);},removeChild:function(D){D=D.get?D.get("element"):D;return this.get("element").removeChild(D);},replaceChild:function(D,E){D=D.get?D.get("element"):D;E=E.get?E.get("element"):E;return this.get("element").replaceChild(D,E);},initAttributes:function(D){},addListener:function(H,G,I,F){var E=this.get("element")||this.get("id");F=F||this;var D=this;if(!this._events[H]){if(E&&this.DOM_EVENTS[H]){YAHOO.util.Event.addListener(E,H,function(J){if(J.srcElement&&!J.target){J.target=J.srcElement;}D.fireEvent(H,J);},I,F);}this.createEvent(H,this);}return YAHOO.util.EventProvider.prototype.subscribe.apply(this,arguments);},on:function(){return this.addListener.apply(this,arguments);},subscribe:function(){return this.addListener.apply(this,arguments);},removeListener:function(E,D){return this.unsubscribe.apply(this,arguments);},addClass:function(D){B.addClass(this.get("element"),D);},getElementsByClassName:function(E,D){return B.getElementsByClassName(E,D,this.get("element"));},hasClass:function(D){return B.hasClass(this.get("element"),D);},removeClass:function(D){return B.removeClass(this.get("element"),D);},replaceClass:function(E,D){return B.replaceClass(this.get("element"),E,D);},setStyle:function(E,D){return B.setStyle(this.get("element"),E,D);},getStyle:function(D){return B.getStyle(this.get("element"),D);},fireQueue:function(){var E=this._queue;for(var F=0,D=E.length;F<D;++F){this[E[F][0]].apply(this,E[F][1]);}},appendTo:function(E,F){E=(E.get)?E.get("element"):B.get(E);this.fireEvent("beforeAppendTo",{type:"beforeAppendTo",target:E});
F=(F&&F.get)?F.get("element"):B.get(F);var D=this.get("element");if(!D){return false;}if(!E){return false;}if(D.parent!=E){if(F){E.insertBefore(D,F);}else{E.appendChild(D);}}this.fireEvent("appendTo",{type:"appendTo",target:E});return D;},get:function(D){var F=this._configs||{},E=F.element;if(E&&!F[D]&&!YAHOO.lang.isUndefined(E.value[D])){this._setHTMLAttrConfig(D);}return C.prototype.get.call(this,D);},setAttributes:function(J,G){var E={},H=this._configOrder;for(var I=0,D=H.length;I<D;++I){if(J[H[I]]!==undefined){E[H[I]]=true;this.set(H[I],J[H[I]],G);}}for(var F in J){if(J.hasOwnProperty(F)&&!E[F]){this.set(F,J[F],G);}}},set:function(E,G,D){var F=this.get("element");if(!F){this._queue[this._queue.length]=["set",arguments];if(this._configs[E]){this._configs[E].value=G;}return;}if(!this._configs[E]&&!YAHOO.lang.isUndefined(F[E])){this._setHTMLAttrConfig(E);}return C.prototype.set.apply(this,arguments);},setAttributeConfig:function(D,E,F){this._configOrder.push(D);C.prototype.setAttributeConfig.apply(this,arguments);},createEvent:function(E,D){this._events[E]=true;return C.prototype.createEvent.apply(this,arguments);},init:function(E,D){this._initElement(E,D);},destroy:function(){var D=this.get("element");YAHOO.util.Event.purgeElement(D,true);this.unsubscribeAll();if(D&&D.parentNode){D.parentNode.removeChild(D);}this._queue=[];this._events={};this._configs={};this._configOrder=[];},_initElement:function(F,E){this._queue=this._queue||[];this._events=this._events||{};this._configs=this._configs||{};this._configOrder=[];E=E||{};E.element=E.element||F||null;var H=false;var D=A.DOM_EVENTS;this.DOM_EVENTS=this.DOM_EVENTS||{};for(var G in D){if(D.hasOwnProperty(G)){this.DOM_EVENTS[G]=D[G];}}if(typeof E.element==="string"){this._setHTMLAttrConfig("id",{value:E.element});}if(B.get(E.element)){H=true;this._initHTMLElement(E);this._initContent(E);}YAHOO.util.Event.onAvailable(E.element,function(){if(!H){this._initHTMLElement(E);}this.fireEvent("available",{type:"available",target:B.get(E.element)});},this,true);YAHOO.util.Event.onContentReady(E.element,function(){if(!H){this._initContent(E);}this.fireEvent("contentReady",{type:"contentReady",target:B.get(E.element)});},this,true);},_initHTMLElement:function(D){this.setAttributeConfig("element",{value:B.get(D.element),readOnly:true});},_initContent:function(D){this.initAttributes(D);this.setAttributes(D,true);this.fireQueue();},_setHTMLAttrConfig:function(D,F){var E=this.get("element");F=F||{};F.name=D;F.setter=F.setter||this.DEFAULT_HTML_SETTER;F.getter=F.getter||this.DEFAULT_HTML_GETTER;F.value=F.value||E[D];this._configs[D]=new YAHOO.util.Attribute(F,this);}};YAHOO.augment(A,C);YAHOO.util.Element=A;})();YAHOO.register("element",YAHOO.util.Element,{version:"2.7.0",build:"1796"});YAHOO.register("utilities", YAHOO, {version: "2.7.0", build: "1796"});
/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
(function(){YAHOO.util.Config=function(D){if(D){this.init(D);}};var B=YAHOO.lang,C=YAHOO.util.CustomEvent,A=YAHOO.util.Config;A.CONFIG_CHANGED_EVENT="configChanged";A.BOOLEAN_TYPE="boolean";A.prototype={owner:null,queueInProgress:false,config:null,initialConfig:null,eventQueue:null,configChangedEvent:null,init:function(D){this.owner=D;this.configChangedEvent=this.createEvent(A.CONFIG_CHANGED_EVENT);this.configChangedEvent.signature=C.LIST;this.queueInProgress=false;this.config={};this.initialConfig={};this.eventQueue=[];},checkBoolean:function(D){return(typeof D==A.BOOLEAN_TYPE);},checkNumber:function(D){return(!isNaN(D));},fireEvent:function(D,F){var E=this.config[D];if(E&&E.event){E.event.fire(F);}},addProperty:function(E,D){E=E.toLowerCase();this.config[E]=D;D.event=this.createEvent(E,{scope:this.owner});D.event.signature=C.LIST;D.key=E;if(D.handler){D.event.subscribe(D.handler,this.owner);}this.setProperty(E,D.value,true);if(!D.suppressEvent){this.queueProperty(E,D.value);}},getConfig:function(){var D={},F=this.config,G,E;for(G in F){if(B.hasOwnProperty(F,G)){E=F[G];if(E&&E.event){D[G]=E.value;}}}return D;},getProperty:function(D){var E=this.config[D.toLowerCase()];if(E&&E.event){return E.value;}else{return undefined;}},resetProperty:function(D){D=D.toLowerCase();var E=this.config[D];if(E&&E.event){if(this.initialConfig[D]&&!B.isUndefined(this.initialConfig[D])){this.setProperty(D,this.initialConfig[D]);return true;}}else{return false;}},setProperty:function(E,G,D){var F;E=E.toLowerCase();if(this.queueInProgress&&!D){this.queueProperty(E,G);return true;}else{F=this.config[E];if(F&&F.event){if(F.validator&&!F.validator(G)){return false;}else{F.value=G;if(!D){this.fireEvent(E,G);this.configChangedEvent.fire([E,G]);}return true;}}else{return false;}}},queueProperty:function(S,P){S=S.toLowerCase();var R=this.config[S],K=false,J,G,H,I,O,Q,F,M,N,D,L,T,E;if(R&&R.event){if(!B.isUndefined(P)&&R.validator&&!R.validator(P)){return false;}else{if(!B.isUndefined(P)){R.value=P;}else{P=R.value;}K=false;J=this.eventQueue.length;for(L=0;L<J;L++){G=this.eventQueue[L];if(G){H=G[0];I=G[1];if(H==S){this.eventQueue[L]=null;this.eventQueue.push([S,(!B.isUndefined(P)?P:I)]);K=true;break;}}}if(!K&&!B.isUndefined(P)){this.eventQueue.push([S,P]);}}if(R.supercedes){O=R.supercedes.length;for(T=0;T<O;T++){Q=R.supercedes[T];F=this.eventQueue.length;for(E=0;E<F;E++){M=this.eventQueue[E];if(M){N=M[0];D=M[1];if(N==Q.toLowerCase()){this.eventQueue.push([N,D]);this.eventQueue[E]=null;break;}}}}}return true;}else{return false;}},refireEvent:function(D){D=D.toLowerCase();var E=this.config[D];if(E&&E.event&&!B.isUndefined(E.value)){if(this.queueInProgress){this.queueProperty(D);}else{this.fireEvent(D,E.value);}}},applyConfig:function(D,G){var F,E;if(G){E={};for(F in D){if(B.hasOwnProperty(D,F)){E[F.toLowerCase()]=D[F];}}this.initialConfig=E;}for(F in D){if(B.hasOwnProperty(D,F)){this.queueProperty(F,D[F]);}}},refresh:function(){var D;for(D in this.config){if(B.hasOwnProperty(this.config,D)){this.refireEvent(D);}}},fireQueue:function(){var E,H,D,G,F;this.queueInProgress=true;for(E=0;E<this.eventQueue.length;E++){H=this.eventQueue[E];if(H){D=H[0];G=H[1];F=this.config[D];F.value=G;this.eventQueue[E]=null;this.fireEvent(D,G);}}this.queueInProgress=false;this.eventQueue=[];},subscribeToConfigEvent:function(E,F,H,D){var G=this.config[E.toLowerCase()];if(G&&G.event){if(!A.alreadySubscribed(G.event,F,H)){G.event.subscribe(F,H,D);}return true;}else{return false;}},unsubscribeFromConfigEvent:function(D,E,G){var F=this.config[D.toLowerCase()];if(F&&F.event){return F.event.unsubscribe(E,G);}else{return false;}},toString:function(){var D="Config";if(this.owner){D+=" ["+this.owner.toString()+"]";}return D;},outputEventQueue:function(){var D="",G,E,F=this.eventQueue.length;for(E=0;E<F;E++){G=this.eventQueue[E];if(G){D+=G[0]+"="+G[1]+", ";}}return D;},destroy:function(){var E=this.config,D,F;for(D in E){if(B.hasOwnProperty(E,D)){F=E[D];F.event.unsubscribeAll();F.event=null;}}this.configChangedEvent.unsubscribeAll();this.configChangedEvent=null;this.owner=null;this.config=null;this.initialConfig=null;this.eventQueue=null;}};A.alreadySubscribed=function(E,H,I){var F=E.subscribers.length,D,G;if(F>0){G=F-1;do{D=E.subscribers[G];if(D&&D.obj==I&&D.fn==H){return true;}}while(G--);}return false;};YAHOO.lang.augmentProto(A,YAHOO.util.EventProvider);}());(function(){YAHOO.widget.Module=function(R,Q){if(R){this.init(R,Q);}else{}};var F=YAHOO.util.Dom,D=YAHOO.util.Config,N=YAHOO.util.Event,M=YAHOO.util.CustomEvent,G=YAHOO.widget.Module,I=YAHOO.env.ua,H,P,O,E,A={"BEFORE_INIT":"beforeInit","INIT":"init","APPEND":"append","BEFORE_RENDER":"beforeRender","RENDER":"render","CHANGE_HEADER":"changeHeader","CHANGE_BODY":"changeBody","CHANGE_FOOTER":"changeFooter","CHANGE_CONTENT":"changeContent","DESTORY":"destroy","BEFORE_SHOW":"beforeShow","SHOW":"show","BEFORE_HIDE":"beforeHide","HIDE":"hide"},J={"VISIBLE":{key:"visible",value:true,validator:YAHOO.lang.isBoolean},"EFFECT":{key:"effect",suppressEvent:true,supercedes:["visible"]},"MONITOR_RESIZE":{key:"monitorresize",value:true},"APPEND_TO_DOCUMENT_BODY":{key:"appendtodocumentbody",value:false}};G.IMG_ROOT=null;G.IMG_ROOT_SSL=null;G.CSS_MODULE="yui-module";G.CSS_HEADER="hd";G.CSS_BODY="bd";G.CSS_FOOTER="ft";G.RESIZE_MONITOR_SECURE_URL="javascript:false;";G.RESIZE_MONITOR_BUFFER=1;G.textResizeEvent=new M("textResize");G.forceDocumentRedraw=function(){var Q=document.documentElement;if(Q){Q.className+=" ";Q.className=YAHOO.lang.trim(Q.className);}};function L(){if(!H){H=document.createElement("div");H.innerHTML=('<div class="'+G.CSS_HEADER+'"></div>'+'<div class="'+G.CSS_BODY+'"></div><div class="'+G.CSS_FOOTER+'"></div>');P=H.firstChild;O=P.nextSibling;E=O.nextSibling;}return H;}function K(){if(!P){L();}return(P.cloneNode(false));}function B(){if(!O){L();}return(O.cloneNode(false));}function C(){if(!E){L();}return(E.cloneNode(false));}G.prototype={constructor:G,element:null,header:null,body:null,footer:null,id:null,imageRoot:G.IMG_ROOT,initEvents:function(){var Q=M.LIST;
this.beforeInitEvent=this.createEvent(A.BEFORE_INIT);this.beforeInitEvent.signature=Q;this.initEvent=this.createEvent(A.INIT);this.initEvent.signature=Q;this.appendEvent=this.createEvent(A.APPEND);this.appendEvent.signature=Q;this.beforeRenderEvent=this.createEvent(A.BEFORE_RENDER);this.beforeRenderEvent.signature=Q;this.renderEvent=this.createEvent(A.RENDER);this.renderEvent.signature=Q;this.changeHeaderEvent=this.createEvent(A.CHANGE_HEADER);this.changeHeaderEvent.signature=Q;this.changeBodyEvent=this.createEvent(A.CHANGE_BODY);this.changeBodyEvent.signature=Q;this.changeFooterEvent=this.createEvent(A.CHANGE_FOOTER);this.changeFooterEvent.signature=Q;this.changeContentEvent=this.createEvent(A.CHANGE_CONTENT);this.changeContentEvent.signature=Q;this.destroyEvent=this.createEvent(A.DESTORY);this.destroyEvent.signature=Q;this.beforeShowEvent=this.createEvent(A.BEFORE_SHOW);this.beforeShowEvent.signature=Q;this.showEvent=this.createEvent(A.SHOW);this.showEvent.signature=Q;this.beforeHideEvent=this.createEvent(A.BEFORE_HIDE);this.beforeHideEvent.signature=Q;this.hideEvent=this.createEvent(A.HIDE);this.hideEvent.signature=Q;},platform:function(){var Q=navigator.userAgent.toLowerCase();if(Q.indexOf("windows")!=-1||Q.indexOf("win32")!=-1){return"windows";}else{if(Q.indexOf("macintosh")!=-1){return"mac";}else{return false;}}}(),browser:function(){var Q=navigator.userAgent.toLowerCase();if(Q.indexOf("opera")!=-1){return"opera";}else{if(Q.indexOf("msie 7")!=-1){return"ie7";}else{if(Q.indexOf("msie")!=-1){return"ie";}else{if(Q.indexOf("safari")!=-1){return"safari";}else{if(Q.indexOf("gecko")!=-1){return"gecko";}else{return false;}}}}}}(),isSecure:function(){if(window.location.href.toLowerCase().indexOf("https")===0){return true;}else{return false;}}(),initDefaultConfig:function(){this.cfg.addProperty(J.VISIBLE.key,{handler:this.configVisible,value:J.VISIBLE.value,validator:J.VISIBLE.validator});this.cfg.addProperty(J.EFFECT.key,{suppressEvent:J.EFFECT.suppressEvent,supercedes:J.EFFECT.supercedes});this.cfg.addProperty(J.MONITOR_RESIZE.key,{handler:this.configMonitorResize,value:J.MONITOR_RESIZE.value});this.cfg.addProperty(J.APPEND_TO_DOCUMENT_BODY.key,{value:J.APPEND_TO_DOCUMENT_BODY.value});},init:function(V,U){var S,W;this.initEvents();this.beforeInitEvent.fire(G);this.cfg=new D(this);if(this.isSecure){this.imageRoot=G.IMG_ROOT_SSL;}if(typeof V=="string"){S=V;V=document.getElementById(V);if(!V){V=(L()).cloneNode(false);V.id=S;}}this.id=F.generateId(V);this.element=V;W=this.element.firstChild;if(W){var R=false,Q=false,T=false;do{if(1==W.nodeType){if(!R&&F.hasClass(W,G.CSS_HEADER)){this.header=W;R=true;}else{if(!Q&&F.hasClass(W,G.CSS_BODY)){this.body=W;Q=true;}else{if(!T&&F.hasClass(W,G.CSS_FOOTER)){this.footer=W;T=true;}}}}}while((W=W.nextSibling));}this.initDefaultConfig();F.addClass(this.element,G.CSS_MODULE);if(U){this.cfg.applyConfig(U,true);}if(!D.alreadySubscribed(this.renderEvent,this.cfg.fireQueue,this.cfg)){this.renderEvent.subscribe(this.cfg.fireQueue,this.cfg,true);}this.initEvent.fire(G);},initResizeMonitor:function(){var R=(I.gecko&&this.platform=="windows");if(R){var Q=this;setTimeout(function(){Q._initResizeMonitor();},0);}else{this._initResizeMonitor();}},_initResizeMonitor:function(){var Q,S,U;function W(){G.textResizeEvent.fire();}if(!I.opera){S=F.get("_yuiResizeMonitor");var V=this._supportsCWResize();if(!S){S=document.createElement("iframe");if(this.isSecure&&G.RESIZE_MONITOR_SECURE_URL&&I.ie){S.src=G.RESIZE_MONITOR_SECURE_URL;}if(!V){U=["<html><head><script ",'type="text/javascript">',"window.onresize=function(){window.parent.","YAHOO.widget.Module.textResizeEvent.","fire();};<","/script></head>","<body></body></html>"].join("");S.src="data:text/html;charset=utf-8,"+encodeURIComponent(U);}S.id="_yuiResizeMonitor";S.title="Text Resize Monitor";S.style.position="absolute";S.style.visibility="hidden";var R=document.body,T=R.firstChild;if(T){R.insertBefore(S,T);}else{R.appendChild(S);}S.style.width="2em";S.style.height="2em";S.style.top=(-1*(S.offsetHeight+G.RESIZE_MONITOR_BUFFER))+"px";S.style.left="0";S.style.borderWidth="0";S.style.visibility="visible";if(I.webkit){Q=S.contentWindow.document;Q.open();Q.close();}}if(S&&S.contentWindow){G.textResizeEvent.subscribe(this.onDomResize,this,true);if(!G.textResizeInitialized){if(V){if(!N.on(S.contentWindow,"resize",W)){N.on(S,"resize",W);}}G.textResizeInitialized=true;}this.resizeMonitor=S;}}},_supportsCWResize:function(){var Q=true;if(I.gecko&&I.gecko<=1.8){Q=false;}return Q;},onDomResize:function(S,R){var Q=-1*(this.resizeMonitor.offsetHeight+G.RESIZE_MONITOR_BUFFER);this.resizeMonitor.style.top=Q+"px";this.resizeMonitor.style.left="0";},setHeader:function(R){var Q=this.header||(this.header=K());if(R.nodeName){Q.innerHTML="";Q.appendChild(R);}else{Q.innerHTML=R;}this.changeHeaderEvent.fire(R);this.changeContentEvent.fire();},appendToHeader:function(R){var Q=this.header||(this.header=K());Q.appendChild(R);this.changeHeaderEvent.fire(R);this.changeContentEvent.fire();},setBody:function(R){var Q=this.body||(this.body=B());if(R.nodeName){Q.innerHTML="";Q.appendChild(R);}else{Q.innerHTML=R;}this.changeBodyEvent.fire(R);this.changeContentEvent.fire();},appendToBody:function(R){var Q=this.body||(this.body=B());Q.appendChild(R);this.changeBodyEvent.fire(R);this.changeContentEvent.fire();},setFooter:function(R){var Q=this.footer||(this.footer=C());if(R.nodeName){Q.innerHTML="";Q.appendChild(R);}else{Q.innerHTML=R;}this.changeFooterEvent.fire(R);this.changeContentEvent.fire();},appendToFooter:function(R){var Q=this.footer||(this.footer=C());Q.appendChild(R);this.changeFooterEvent.fire(R);this.changeContentEvent.fire();},render:function(S,Q){var T=this,U;function R(V){if(typeof V=="string"){V=document.getElementById(V);}if(V){T._addToParent(V,T.element);T.appendEvent.fire();}}this.beforeRenderEvent.fire();if(!Q){Q=this.element;}if(S){R(S);}else{if(!F.inDocument(this.element)){return false;}}if(this.header&&!F.inDocument(this.header)){U=Q.firstChild;
if(U){Q.insertBefore(this.header,U);}else{Q.appendChild(this.header);}}if(this.body&&!F.inDocument(this.body)){if(this.footer&&F.isAncestor(this.moduleElement,this.footer)){Q.insertBefore(this.body,this.footer);}else{Q.appendChild(this.body);}}if(this.footer&&!F.inDocument(this.footer)){Q.appendChild(this.footer);}this.renderEvent.fire();return true;},destroy:function(){var Q;if(this.element){N.purgeElement(this.element,true);Q=this.element.parentNode;}if(Q){Q.removeChild(this.element);}this.element=null;this.header=null;this.body=null;this.footer=null;G.textResizeEvent.unsubscribe(this.onDomResize,this);this.cfg.destroy();this.cfg=null;this.destroyEvent.fire();},show:function(){this.cfg.setProperty("visible",true);},hide:function(){this.cfg.setProperty("visible",false);},configVisible:function(R,Q,S){var T=Q[0];if(T){this.beforeShowEvent.fire();F.setStyle(this.element,"display","block");this.showEvent.fire();}else{this.beforeHideEvent.fire();F.setStyle(this.element,"display","none");this.hideEvent.fire();}},configMonitorResize:function(S,R,T){var Q=R[0];if(Q){this.initResizeMonitor();}else{G.textResizeEvent.unsubscribe(this.onDomResize,this,true);this.resizeMonitor=null;}},_addToParent:function(Q,R){if(!this.cfg.getProperty("appendtodocumentbody")&&Q===document.body&&Q.firstChild){Q.insertBefore(R,Q.firstChild);}else{Q.appendChild(R);}},toString:function(){return"Module "+this.id;}};YAHOO.lang.augmentProto(G,YAHOO.util.EventProvider);}());(function(){YAHOO.widget.Overlay=function(P,O){YAHOO.widget.Overlay.superclass.constructor.call(this,P,O);};var I=YAHOO.lang,M=YAHOO.util.CustomEvent,G=YAHOO.widget.Module,N=YAHOO.util.Event,F=YAHOO.util.Dom,D=YAHOO.util.Config,K=YAHOO.env.ua,B=YAHOO.widget.Overlay,H="subscribe",E="unsubscribe",C="contained",J,A={"BEFORE_MOVE":"beforeMove","MOVE":"move"},L={"X":{key:"x",validator:I.isNumber,suppressEvent:true,supercedes:["iframe"]},"Y":{key:"y",validator:I.isNumber,suppressEvent:true,supercedes:["iframe"]},"XY":{key:"xy",suppressEvent:true,supercedes:["iframe"]},"CONTEXT":{key:"context",suppressEvent:true,supercedes:["iframe"]},"FIXED_CENTER":{key:"fixedcenter",value:false,supercedes:["iframe","visible"]},"WIDTH":{key:"width",suppressEvent:true,supercedes:["context","fixedcenter","iframe"]},"HEIGHT":{key:"height",suppressEvent:true,supercedes:["context","fixedcenter","iframe"]},"AUTO_FILL_HEIGHT":{key:"autofillheight",supercedes:["height"],value:"body"},"ZINDEX":{key:"zindex",value:null},"CONSTRAIN_TO_VIEWPORT":{key:"constraintoviewport",value:false,validator:I.isBoolean,supercedes:["iframe","x","y","xy"]},"IFRAME":{key:"iframe",value:(K.ie==6?true:false),validator:I.isBoolean,supercedes:["zindex"]},"PREVENT_CONTEXT_OVERLAP":{key:"preventcontextoverlap",value:false,validator:I.isBoolean,supercedes:["constraintoviewport"]}};B.IFRAME_SRC="javascript:false;";B.IFRAME_OFFSET=3;B.VIEWPORT_OFFSET=10;B.TOP_LEFT="tl";B.TOP_RIGHT="tr";B.BOTTOM_LEFT="bl";B.BOTTOM_RIGHT="br";B.CSS_OVERLAY="yui-overlay";B.STD_MOD_RE=/^\s*?(body|footer|header)\s*?$/i;B.windowScrollEvent=new M("windowScroll");B.windowResizeEvent=new M("windowResize");B.windowScrollHandler=function(P){var O=N.getTarget(P);if(!O||O===window||O===window.document){if(K.ie){if(!window.scrollEnd){window.scrollEnd=-1;}clearTimeout(window.scrollEnd);window.scrollEnd=setTimeout(function(){B.windowScrollEvent.fire();},1);}else{B.windowScrollEvent.fire();}}};B.windowResizeHandler=function(O){if(K.ie){if(!window.resizeEnd){window.resizeEnd=-1;}clearTimeout(window.resizeEnd);window.resizeEnd=setTimeout(function(){B.windowResizeEvent.fire();},100);}else{B.windowResizeEvent.fire();}};B._initialized=null;if(B._initialized===null){N.on(window,"scroll",B.windowScrollHandler);N.on(window,"resize",B.windowResizeHandler);B._initialized=true;}B._TRIGGER_MAP={"windowScroll":B.windowScrollEvent,"windowResize":B.windowResizeEvent,"textResize":G.textResizeEvent};YAHOO.extend(B,G,{CONTEXT_TRIGGERS:[],init:function(P,O){B.superclass.init.call(this,P);this.beforeInitEvent.fire(B);F.addClass(this.element,B.CSS_OVERLAY);if(O){this.cfg.applyConfig(O,true);}if(this.platform=="mac"&&K.gecko){if(!D.alreadySubscribed(this.showEvent,this.showMacGeckoScrollbars,this)){this.showEvent.subscribe(this.showMacGeckoScrollbars,this,true);}if(!D.alreadySubscribed(this.hideEvent,this.hideMacGeckoScrollbars,this)){this.hideEvent.subscribe(this.hideMacGeckoScrollbars,this,true);}}this.initEvent.fire(B);},initEvents:function(){B.superclass.initEvents.call(this);var O=M.LIST;this.beforeMoveEvent=this.createEvent(A.BEFORE_MOVE);this.beforeMoveEvent.signature=O;this.moveEvent=this.createEvent(A.MOVE);this.moveEvent.signature=O;},initDefaultConfig:function(){B.superclass.initDefaultConfig.call(this);var O=this.cfg;O.addProperty(L.X.key,{handler:this.configX,validator:L.X.validator,suppressEvent:L.X.suppressEvent,supercedes:L.X.supercedes});O.addProperty(L.Y.key,{handler:this.configY,validator:L.Y.validator,suppressEvent:L.Y.suppressEvent,supercedes:L.Y.supercedes});O.addProperty(L.XY.key,{handler:this.configXY,suppressEvent:L.XY.suppressEvent,supercedes:L.XY.supercedes});O.addProperty(L.CONTEXT.key,{handler:this.configContext,suppressEvent:L.CONTEXT.suppressEvent,supercedes:L.CONTEXT.supercedes});O.addProperty(L.FIXED_CENTER.key,{handler:this.configFixedCenter,value:L.FIXED_CENTER.value,validator:L.FIXED_CENTER.validator,supercedes:L.FIXED_CENTER.supercedes});O.addProperty(L.WIDTH.key,{handler:this.configWidth,suppressEvent:L.WIDTH.suppressEvent,supercedes:L.WIDTH.supercedes});O.addProperty(L.HEIGHT.key,{handler:this.configHeight,suppressEvent:L.HEIGHT.suppressEvent,supercedes:L.HEIGHT.supercedes});O.addProperty(L.AUTO_FILL_HEIGHT.key,{handler:this.configAutoFillHeight,value:L.AUTO_FILL_HEIGHT.value,validator:this._validateAutoFill,supercedes:L.AUTO_FILL_HEIGHT.supercedes});O.addProperty(L.ZINDEX.key,{handler:this.configzIndex,value:L.ZINDEX.value});O.addProperty(L.CONSTRAIN_TO_VIEWPORT.key,{handler:this.configConstrainToViewport,value:L.CONSTRAIN_TO_VIEWPORT.value,validator:L.CONSTRAIN_TO_VIEWPORT.validator,supercedes:L.CONSTRAIN_TO_VIEWPORT.supercedes});
O.addProperty(L.IFRAME.key,{handler:this.configIframe,value:L.IFRAME.value,validator:L.IFRAME.validator,supercedes:L.IFRAME.supercedes});O.addProperty(L.PREVENT_CONTEXT_OVERLAP.key,{value:L.PREVENT_CONTEXT_OVERLAP.value,validator:L.PREVENT_CONTEXT_OVERLAP.validator,supercedes:L.PREVENT_CONTEXT_OVERLAP.supercedes});},moveTo:function(O,P){this.cfg.setProperty("xy",[O,P]);},hideMacGeckoScrollbars:function(){F.replaceClass(this.element,"show-scrollbars","hide-scrollbars");},showMacGeckoScrollbars:function(){F.replaceClass(this.element,"hide-scrollbars","show-scrollbars");},_setDomVisibility:function(O){F.setStyle(this.element,"visibility",(O)?"visible":"hidden");if(O){F.removeClass(this.element,"yui-overlay-hidden");}else{F.addClass(this.element,"yui-overlay-hidden");}},configVisible:function(R,O,X){var Q=O[0],S=F.getStyle(this.element,"visibility"),Y=this.cfg.getProperty("effect"),V=[],U=(this.platform=="mac"&&K.gecko),g=D.alreadySubscribed,W,P,f,c,b,a,d,Z,T;if(S=="inherit"){f=this.element.parentNode;while(f.nodeType!=9&&f.nodeType!=11){S=F.getStyle(f,"visibility");if(S!="inherit"){break;}f=f.parentNode;}if(S=="inherit"){S="visible";}}if(Y){if(Y instanceof Array){Z=Y.length;for(c=0;c<Z;c++){W=Y[c];V[V.length]=W.effect(this,W.duration);}}else{V[V.length]=Y.effect(this,Y.duration);}}if(Q){if(U){this.showMacGeckoScrollbars();}if(Y){if(Q){if(S!="visible"||S===""){this.beforeShowEvent.fire();T=V.length;for(b=0;b<T;b++){P=V[b];if(b===0&&!g(P.animateInCompleteEvent,this.showEvent.fire,this.showEvent)){P.animateInCompleteEvent.subscribe(this.showEvent.fire,this.showEvent,true);}P.animateIn();}}}}else{if(S!="visible"||S===""){this.beforeShowEvent.fire();this._setDomVisibility(true);this.cfg.refireEvent("iframe");this.showEvent.fire();}else{this._setDomVisibility(true);}}}else{if(U){this.hideMacGeckoScrollbars();}if(Y){if(S=="visible"){this.beforeHideEvent.fire();T=V.length;for(a=0;a<T;a++){d=V[a];if(a===0&&!g(d.animateOutCompleteEvent,this.hideEvent.fire,this.hideEvent)){d.animateOutCompleteEvent.subscribe(this.hideEvent.fire,this.hideEvent,true);}d.animateOut();}}else{if(S===""){this._setDomVisibility(false);}}}else{if(S=="visible"||S===""){this.beforeHideEvent.fire();this._setDomVisibility(false);this.hideEvent.fire();}else{this._setDomVisibility(false);}}}},doCenterOnDOMEvent:function(){var O=this.cfg,P=O.getProperty("fixedcenter");if(O.getProperty("visible")){if(P&&(P!==C||this.fitsInViewport())){this.center();}}},fitsInViewport:function(){var S=B.VIEWPORT_OFFSET,Q=this.element,T=Q.offsetWidth,R=Q.offsetHeight,O=F.getViewportWidth(),P=F.getViewportHeight();return((T+S<O)&&(R+S<P));},configFixedCenter:function(S,Q,T){var U=Q[0],P=D.alreadySubscribed,R=B.windowResizeEvent,O=B.windowScrollEvent;if(U){this.center();if(!P(this.beforeShowEvent,this.center)){this.beforeShowEvent.subscribe(this.center);}if(!P(R,this.doCenterOnDOMEvent,this)){R.subscribe(this.doCenterOnDOMEvent,this,true);}if(!P(O,this.doCenterOnDOMEvent,this)){O.subscribe(this.doCenterOnDOMEvent,this,true);}}else{this.beforeShowEvent.unsubscribe(this.center);R.unsubscribe(this.doCenterOnDOMEvent,this);O.unsubscribe(this.doCenterOnDOMEvent,this);}},configHeight:function(R,P,S){var O=P[0],Q=this.element;F.setStyle(Q,"height",O);this.cfg.refireEvent("iframe");},configAutoFillHeight:function(T,S,P){var V=S[0],Q=this.cfg,U="autofillheight",W="height",R=Q.getProperty(U),O=this._autoFillOnHeightChange;Q.unsubscribeFromConfigEvent(W,O);G.textResizeEvent.unsubscribe(O);this.changeContentEvent.unsubscribe(O);if(R&&V!==R&&this[R]){F.setStyle(this[R],W,"");}if(V){V=I.trim(V.toLowerCase());Q.subscribeToConfigEvent(W,O,this[V],this);G.textResizeEvent.subscribe(O,this[V],this);this.changeContentEvent.subscribe(O,this[V],this);Q.setProperty(U,V,true);}},configWidth:function(R,O,S){var Q=O[0],P=this.element;F.setStyle(P,"width",Q);this.cfg.refireEvent("iframe");},configzIndex:function(Q,O,R){var S=O[0],P=this.element;if(!S){S=F.getStyle(P,"zIndex");if(!S||isNaN(S)){S=0;}}if(this.iframe||this.cfg.getProperty("iframe")===true){if(S<=0){S=1;}}F.setStyle(P,"zIndex",S);this.cfg.setProperty("zIndex",S,true);if(this.iframe){this.stackIframe();}},configXY:function(Q,P,R){var T=P[0],O=T[0],S=T[1];this.cfg.setProperty("x",O);this.cfg.setProperty("y",S);this.beforeMoveEvent.fire([O,S]);O=this.cfg.getProperty("x");S=this.cfg.getProperty("y");this.cfg.refireEvent("iframe");this.moveEvent.fire([O,S]);},configX:function(Q,P,R){var O=P[0],S=this.cfg.getProperty("y");this.cfg.setProperty("x",O,true);this.cfg.setProperty("y",S,true);this.beforeMoveEvent.fire([O,S]);O=this.cfg.getProperty("x");S=this.cfg.getProperty("y");F.setX(this.element,O,true);this.cfg.setProperty("xy",[O,S],true);this.cfg.refireEvent("iframe");this.moveEvent.fire([O,S]);},configY:function(Q,P,R){var O=this.cfg.getProperty("x"),S=P[0];this.cfg.setProperty("x",O,true);this.cfg.setProperty("y",S,true);this.beforeMoveEvent.fire([O,S]);O=this.cfg.getProperty("x");S=this.cfg.getProperty("y");F.setY(this.element,S,true);this.cfg.setProperty("xy",[O,S],true);this.cfg.refireEvent("iframe");this.moveEvent.fire([O,S]);},showIframe:function(){var P=this.iframe,O;if(P){O=this.element.parentNode;if(O!=P.parentNode){this._addToParent(O,P);}P.style.display="block";}},hideIframe:function(){if(this.iframe){this.iframe.style.display="none";}},syncIframe:function(){var O=this.iframe,Q=this.element,S=B.IFRAME_OFFSET,P=(S*2),R;if(O){O.style.width=(Q.offsetWidth+P+"px");O.style.height=(Q.offsetHeight+P+"px");R=this.cfg.getProperty("xy");if(!I.isArray(R)||(isNaN(R[0])||isNaN(R[1]))){this.syncPosition();R=this.cfg.getProperty("xy");}F.setXY(O,[(R[0]-S),(R[1]-S)]);}},stackIframe:function(){if(this.iframe){var O=F.getStyle(this.element,"zIndex");if(!YAHOO.lang.isUndefined(O)&&!isNaN(O)){F.setStyle(this.iframe,"zIndex",(O-1));}}},configIframe:function(R,Q,S){var O=Q[0];function T(){var V=this.iframe,W=this.element,X;if(!V){if(!J){J=document.createElement("iframe");if(this.isSecure){J.src=B.IFRAME_SRC;}if(K.ie){J.style.filter="alpha(opacity=0)";
J.frameBorder=0;}else{J.style.opacity="0";}J.style.position="absolute";J.style.border="none";J.style.margin="0";J.style.padding="0";J.style.display="none";J.tabIndex=-1;}V=J.cloneNode(false);X=W.parentNode;var U=X||document.body;this._addToParent(U,V);this.iframe=V;}this.showIframe();this.syncIframe();this.stackIframe();if(!this._hasIframeEventListeners){this.showEvent.subscribe(this.showIframe);this.hideEvent.subscribe(this.hideIframe);this.changeContentEvent.subscribe(this.syncIframe);this._hasIframeEventListeners=true;}}function P(){T.call(this);this.beforeShowEvent.unsubscribe(P);this._iframeDeferred=false;}if(O){if(this.cfg.getProperty("visible")){T.call(this);}else{if(!this._iframeDeferred){this.beforeShowEvent.subscribe(P);this._iframeDeferred=true;}}}else{this.hideIframe();if(this._hasIframeEventListeners){this.showEvent.unsubscribe(this.showIframe);this.hideEvent.unsubscribe(this.hideIframe);this.changeContentEvent.unsubscribe(this.syncIframe);this._hasIframeEventListeners=false;}}},_primeXYFromDOM:function(){if(YAHOO.lang.isUndefined(this.cfg.getProperty("xy"))){this.syncPosition();this.cfg.refireEvent("xy");this.beforeShowEvent.unsubscribe(this._primeXYFromDOM);}},configConstrainToViewport:function(P,O,Q){var R=O[0];if(R){if(!D.alreadySubscribed(this.beforeMoveEvent,this.enforceConstraints,this)){this.beforeMoveEvent.subscribe(this.enforceConstraints,this,true);}if(!D.alreadySubscribed(this.beforeShowEvent,this._primeXYFromDOM)){this.beforeShowEvent.subscribe(this._primeXYFromDOM);}}else{this.beforeShowEvent.unsubscribe(this._primeXYFromDOM);this.beforeMoveEvent.unsubscribe(this.enforceConstraints,this);}},configContext:function(T,S,P){var W=S[0],Q,O,U,R,V=this.CONTEXT_TRIGGERS;if(W){Q=W[0];O=W[1];U=W[2];R=W[3];if(V&&V.length>0){R=(R||[]).concat(V);}if(Q){if(typeof Q=="string"){this.cfg.setProperty("context",[document.getElementById(Q),O,U,R],true);}if(O&&U){this.align(O,U);}if(this._contextTriggers){this._processTriggers(this._contextTriggers,E,this._alignOnTrigger);}if(R){this._processTriggers(R,H,this._alignOnTrigger);this._contextTriggers=R;}}}},_alignOnTrigger:function(P,O){this.align();},_findTriggerCE:function(O){var P=null;if(O instanceof M){P=O;}else{if(B._TRIGGER_MAP[O]){P=B._TRIGGER_MAP[O];}}return P;},_processTriggers:function(S,U,R){var Q,T;for(var P=0,O=S.length;P<O;++P){Q=S[P];T=this._findTriggerCE(Q);if(T){T[U](R,this,true);}else{this[U](Q,R);}}},align:function(P,O){var U=this.cfg.getProperty("context"),T=this,S,R,V;function Q(W,X){switch(P){case B.TOP_LEFT:T.moveTo(X,W);break;case B.TOP_RIGHT:T.moveTo((X-R.offsetWidth),W);break;case B.BOTTOM_LEFT:T.moveTo(X,(W-R.offsetHeight));break;case B.BOTTOM_RIGHT:T.moveTo((X-R.offsetWidth),(W-R.offsetHeight));break;}}if(U){S=U[0];R=this.element;T=this;if(!P){P=U[1];}if(!O){O=U[2];}if(R&&S){V=F.getRegion(S);switch(O){case B.TOP_LEFT:Q(V.top,V.left);break;case B.TOP_RIGHT:Q(V.top,V.right);break;case B.BOTTOM_LEFT:Q(V.bottom,V.left);break;case B.BOTTOM_RIGHT:Q(V.bottom,V.right);break;}}}},enforceConstraints:function(P,O,Q){var S=O[0];var R=this.getConstrainedXY(S[0],S[1]);this.cfg.setProperty("x",R[0],true);this.cfg.setProperty("y",R[1],true);this.cfg.setProperty("xy",R,true);},getConstrainedX:function(V){var S=this,O=S.element,e=O.offsetWidth,c=B.VIEWPORT_OFFSET,h=F.getViewportWidth(),d=F.getDocumentScrollLeft(),Y=(e+c<h),b=this.cfg.getProperty("context"),Q,X,j,T=false,f,W,g=d+c,P=d+h-e-c,i=V,U={"tltr":true,"blbr":true,"brbl":true,"trtl":true};var Z=function(){var k;if((S.cfg.getProperty("x")-d)>X){k=(X-e);}else{k=(X+j);}S.cfg.setProperty("x",(k+d),true);return k;};var R=function(){if((S.cfg.getProperty("x")-d)>X){return(W-c);}else{return(f-c);}};var a=function(){var k=R(),l;if(e>k){if(T){Z();}else{Z();T=true;l=a();}}return l;};if(V<g||V>P){if(Y){if(this.cfg.getProperty("preventcontextoverlap")&&b&&U[(b[1]+b[2])]){Q=b[0];X=F.getX(Q)-d;j=Q.offsetWidth;f=X;W=(h-(X+j));a();i=this.cfg.getProperty("x");}else{if(V<g){i=g;}else{if(V>P){i=P;}}}}else{i=c+d;}}return i;},getConstrainedY:function(Z){var W=this,P=W.element,i=P.offsetHeight,h=B.VIEWPORT_OFFSET,d=F.getViewportHeight(),g=F.getDocumentScrollTop(),e=(i+h<d),f=this.cfg.getProperty("context"),U,a,b,X=false,V,Q,c=g+h,S=g+d-i-h,O=Z,Y={"trbr":true,"tlbl":true,"bltl":true,"brtr":true};var T=function(){var k;if((W.cfg.getProperty("y")-g)>a){k=(a-i);}else{k=(a+b);}W.cfg.setProperty("y",(k+g),true);return k;};var R=function(){if((W.cfg.getProperty("y")-g)>a){return(Q-h);}else{return(V-h);}};var j=function(){var l=R(),k;if(i>l){if(X){T();}else{T();X=true;k=j();}}return k;};if(Z<c||Z>S){if(e){if(this.cfg.getProperty("preventcontextoverlap")&&f&&Y[(f[1]+f[2])]){U=f[0];b=U.offsetHeight;a=(F.getY(U)-g);V=a;Q=(d-(a+b));j();O=W.cfg.getProperty("y");}else{if(Z<c){O=c;}else{if(Z>S){O=S;}}}}else{O=h+g;}}return O;},getConstrainedXY:function(O,P){return[this.getConstrainedX(O),this.getConstrainedY(P)];},center:function(){var R=B.VIEWPORT_OFFSET,S=this.element.offsetWidth,Q=this.element.offsetHeight,P=F.getViewportWidth(),T=F.getViewportHeight(),O,U;if(S<P){O=(P/2)-(S/2)+F.getDocumentScrollLeft();}else{O=R+F.getDocumentScrollLeft();}if(Q<T){U=(T/2)-(Q/2)+F.getDocumentScrollTop();}else{U=R+F.getDocumentScrollTop();}this.cfg.setProperty("xy",[parseInt(O,10),parseInt(U,10)]);this.cfg.refireEvent("iframe");if(K.webkit){this.forceContainerRedraw();}},syncPosition:function(){var O=F.getXY(this.element);this.cfg.setProperty("x",O[0],true);this.cfg.setProperty("y",O[1],true);this.cfg.setProperty("xy",O,true);},onDomResize:function(Q,P){var O=this;B.superclass.onDomResize.call(this,Q,P);setTimeout(function(){O.syncPosition();O.cfg.refireEvent("iframe");O.cfg.refireEvent("context");},0);},_getComputedHeight:(function(){if(document.defaultView&&document.defaultView.getComputedStyle){return function(P){var O=null;if(P.ownerDocument&&P.ownerDocument.defaultView){var Q=P.ownerDocument.defaultView.getComputedStyle(P,"");if(Q){O=parseInt(Q.height,10);}}return(I.isNumber(O))?O:null;};}else{return function(P){var O=null;
if(P.style.pixelHeight){O=P.style.pixelHeight;}return(I.isNumber(O))?O:null;};}})(),_validateAutoFillHeight:function(O){return(!O)||(I.isString(O)&&B.STD_MOD_RE.test(O));},_autoFillOnHeightChange:function(R,P,Q){var O=this.cfg.getProperty("height");if((O&&O!=="auto")||(O===0)){this.fillHeight(Q);}},_getPreciseHeight:function(P){var O=P.offsetHeight;if(P.getBoundingClientRect){var Q=P.getBoundingClientRect();O=Q.bottom-Q.top;}return O;},fillHeight:function(R){if(R){var P=this.innerElement||this.element,O=[this.header,this.body,this.footer],V,W=0,X=0,T=0,Q=false;for(var U=0,S=O.length;U<S;U++){V=O[U];if(V){if(R!==V){X+=this._getPreciseHeight(V);}else{Q=true;}}}if(Q){if(K.ie||K.opera){F.setStyle(R,"height",0+"px");}W=this._getComputedHeight(P);if(W===null){F.addClass(P,"yui-override-padding");W=P.clientHeight;F.removeClass(P,"yui-override-padding");}T=Math.max(W-X,0);F.setStyle(R,"height",T+"px");if(R.offsetHeight!=T){T=Math.max(T-(R.offsetHeight-T),0);}F.setStyle(R,"height",T+"px");}}},bringToTop:function(){var S=[],R=this.element;function V(Z,Y){var b=F.getStyle(Z,"zIndex"),a=F.getStyle(Y,"zIndex"),X=(!b||isNaN(b))?0:parseInt(b,10),W=(!a||isNaN(a))?0:parseInt(a,10);if(X>W){return -1;}else{if(X<W){return 1;}else{return 0;}}}function Q(Y){var X=F.hasClass(Y,B.CSS_OVERLAY),W=YAHOO.widget.Panel;if(X&&!F.isAncestor(R,Y)){if(W&&F.hasClass(Y,W.CSS_PANEL)){S[S.length]=Y.parentNode;}else{S[S.length]=Y;}}}F.getElementsBy(Q,"DIV",document.body);S.sort(V);var O=S[0],U;if(O){U=F.getStyle(O,"zIndex");if(!isNaN(U)){var T=false;if(O!=R){T=true;}else{if(S.length>1){var P=F.getStyle(S[1],"zIndex");if(!isNaN(P)&&(U==P)){T=true;}}}if(T){this.cfg.setProperty("zindex",(parseInt(U,10)+2));}}}},destroy:function(){if(this.iframe){this.iframe.parentNode.removeChild(this.iframe);}this.iframe=null;B.windowResizeEvent.unsubscribe(this.doCenterOnDOMEvent,this);B.windowScrollEvent.unsubscribe(this.doCenterOnDOMEvent,this);G.textResizeEvent.unsubscribe(this._autoFillOnHeightChange);B.superclass.destroy.call(this);},forceContainerRedraw:function(){var O=this;F.addClass(O.element,"yui-force-redraw");setTimeout(function(){F.removeClass(O.element,"yui-force-redraw");},0);},toString:function(){return"Overlay "+this.id;}});}());(function(){YAHOO.widget.OverlayManager=function(G){this.init(G);};var D=YAHOO.widget.Overlay,C=YAHOO.util.Event,E=YAHOO.util.Dom,B=YAHOO.util.Config,F=YAHOO.util.CustomEvent,A=YAHOO.widget.OverlayManager;A.CSS_FOCUSED="focused";A.prototype={constructor:A,overlays:null,initDefaultConfig:function(){this.cfg.addProperty("overlays",{suppressEvent:true});this.cfg.addProperty("focusevent",{value:"mousedown"});},init:function(I){this.cfg=new B(this);this.initDefaultConfig();if(I){this.cfg.applyConfig(I,true);}this.cfg.fireQueue();var H=null;this.getActive=function(){return H;};this.focus=function(J){var K=this.find(J);if(K){K.focus();}};this.remove=function(K){var M=this.find(K),J;if(M){if(H==M){H=null;}var L=(M.element===null&&M.cfg===null)?true:false;if(!L){J=E.getStyle(M.element,"zIndex");M.cfg.setProperty("zIndex",-1000,true);}this.overlays.sort(this.compareZIndexDesc);this.overlays=this.overlays.slice(0,(this.overlays.length-1));M.hideEvent.unsubscribe(M.blur);M.destroyEvent.unsubscribe(this._onOverlayDestroy,M);M.focusEvent.unsubscribe(this._onOverlayFocusHandler,M);M.blurEvent.unsubscribe(this._onOverlayBlurHandler,M);if(!L){C.removeListener(M.element,this.cfg.getProperty("focusevent"),this._onOverlayElementFocus);M.cfg.setProperty("zIndex",J,true);M.cfg.setProperty("manager",null);}if(M.focusEvent._managed){M.focusEvent=null;}if(M.blurEvent._managed){M.blurEvent=null;}if(M.focus._managed){M.focus=null;}if(M.blur._managed){M.blur=null;}}};this.blurAll=function(){var K=this.overlays.length,J;if(K>0){J=K-1;do{this.overlays[J].blur();}while(J--);}};this._manageBlur=function(J){var K=false;if(H==J){E.removeClass(H.element,A.CSS_FOCUSED);H=null;K=true;}return K;};this._manageFocus=function(J){var K=false;if(H!=J){if(H){H.blur();}H=J;this.bringToTop(H);E.addClass(H.element,A.CSS_FOCUSED);K=true;}return K;};var G=this.cfg.getProperty("overlays");if(!this.overlays){this.overlays=[];}if(G){this.register(G);this.overlays.sort(this.compareZIndexDesc);}},_onOverlayElementFocus:function(I){var G=C.getTarget(I),H=this.close;if(H&&(G==H||E.isAncestor(H,G))){this.blur();}else{this.focus();}},_onOverlayDestroy:function(H,G,I){this.remove(I);},_onOverlayFocusHandler:function(H,G,I){this._manageFocus(I);},_onOverlayBlurHandler:function(H,G,I){this._manageBlur(I);},_bindFocus:function(G){var H=this;if(!G.focusEvent){G.focusEvent=G.createEvent("focus");G.focusEvent.signature=F.LIST;G.focusEvent._managed=true;}else{G.focusEvent.subscribe(H._onOverlayFocusHandler,G,H);}if(!G.focus){C.on(G.element,H.cfg.getProperty("focusevent"),H._onOverlayElementFocus,null,G);G.focus=function(){if(H._manageFocus(this)){if(this.cfg.getProperty("visible")&&this.focusFirst){this.focusFirst();}this.focusEvent.fire();}};G.focus._managed=true;}},_bindBlur:function(G){var H=this;if(!G.blurEvent){G.blurEvent=G.createEvent("blur");G.blurEvent.signature=F.LIST;G.focusEvent._managed=true;}else{G.blurEvent.subscribe(H._onOverlayBlurHandler,G,H);}if(!G.blur){G.blur=function(){if(H._manageBlur(this)){this.blurEvent.fire();}};G.blur._managed=true;}G.hideEvent.subscribe(G.blur);},_bindDestroy:function(G){var H=this;G.destroyEvent.subscribe(H._onOverlayDestroy,G,H);},_syncZIndex:function(G){var H=E.getStyle(G.element,"zIndex");if(!isNaN(H)){G.cfg.setProperty("zIndex",parseInt(H,10));}else{G.cfg.setProperty("zIndex",0);}},register:function(G){var J=false,H,I;if(G instanceof D){G.cfg.addProperty("manager",{value:this});this._bindFocus(G);this._bindBlur(G);this._bindDestroy(G);this._syncZIndex(G);this.overlays.push(G);this.bringToTop(G);J=true;}else{if(G instanceof Array){for(H=0,I=G.length;H<I;H++){J=this.register(G[H])||J;}}}return J;},bringToTop:function(M){var I=this.find(M),L,G,J;if(I){J=this.overlays;J.sort(this.compareZIndexDesc);G=J[0];if(G){L=E.getStyle(G.element,"zIndex");
if(!isNaN(L)){var K=false;if(G!==I){K=true;}else{if(J.length>1){var H=E.getStyle(J[1].element,"zIndex");if(!isNaN(H)&&(L==H)){K=true;}}}if(K){I.cfg.setProperty("zindex",(parseInt(L,10)+2));}}J.sort(this.compareZIndexDesc);}}},find:function(G){var K=G instanceof D,I=this.overlays,M=I.length,J=null,L,H;if(K||typeof G=="string"){for(H=M-1;H>=0;H--){L=I[H];if((K&&(L===G))||(L.id==G)){J=L;break;}}}return J;},compareZIndexDesc:function(J,I){var H=(J.cfg)?J.cfg.getProperty("zIndex"):null,G=(I.cfg)?I.cfg.getProperty("zIndex"):null;if(H===null&&G===null){return 0;}else{if(H===null){return 1;}else{if(G===null){return -1;}else{if(H>G){return -1;}else{if(H<G){return 1;}else{return 0;}}}}}},showAll:function(){var H=this.overlays,I=H.length,G;for(G=I-1;G>=0;G--){H[G].show();}},hideAll:function(){var H=this.overlays,I=H.length,G;for(G=I-1;G>=0;G--){H[G].hide();}},toString:function(){return"OverlayManager";}};}());(function(){YAHOO.widget.Tooltip=function(P,O){YAHOO.widget.Tooltip.superclass.constructor.call(this,P,O);};var E=YAHOO.lang,N=YAHOO.util.Event,M=YAHOO.util.CustomEvent,C=YAHOO.util.Dom,J=YAHOO.widget.Tooltip,H=YAHOO.env.ua,G=(H.ie&&(H.ie<=6||document.compatMode=="BackCompat")),F,I={"PREVENT_OVERLAP":{key:"preventoverlap",value:true,validator:E.isBoolean,supercedes:["x","y","xy"]},"SHOW_DELAY":{key:"showdelay",value:200,validator:E.isNumber},"AUTO_DISMISS_DELAY":{key:"autodismissdelay",value:5000,validator:E.isNumber},"HIDE_DELAY":{key:"hidedelay",value:250,validator:E.isNumber},"TEXT":{key:"text",suppressEvent:true},"CONTAINER":{key:"container"},"DISABLED":{key:"disabled",value:false,suppressEvent:true}},A={"CONTEXT_MOUSE_OVER":"contextMouseOver","CONTEXT_MOUSE_OUT":"contextMouseOut","CONTEXT_TRIGGER":"contextTrigger"};J.CSS_TOOLTIP="yui-tt";function K(Q,O){var P=this.cfg,R=P.getProperty("width");if(R==O){P.setProperty("width",Q);}}function D(P,O){if("_originalWidth" in this){K.call(this,this._originalWidth,this._forcedWidth);}var Q=document.body,U=this.cfg,T=U.getProperty("width"),R,S;if((!T||T=="auto")&&(U.getProperty("container")!=Q||U.getProperty("x")>=C.getViewportWidth()||U.getProperty("y")>=C.getViewportHeight())){S=this.element.cloneNode(true);S.style.visibility="hidden";S.style.top="0px";S.style.left="0px";Q.appendChild(S);R=(S.offsetWidth+"px");Q.removeChild(S);S=null;U.setProperty("width",R);U.refireEvent("xy");this._originalWidth=T||"";this._forcedWidth=R;}}function B(P,O,Q){this.render(Q);}function L(){N.onDOMReady(B,this.cfg.getProperty("container"),this);}YAHOO.extend(J,YAHOO.widget.Overlay,{init:function(P,O){J.superclass.init.call(this,P);this.beforeInitEvent.fire(J);C.addClass(this.element,J.CSS_TOOLTIP);if(O){this.cfg.applyConfig(O,true);}this.cfg.queueProperty("visible",false);this.cfg.queueProperty("constraintoviewport",true);this.setBody("");this.subscribe("changeContent",D);this.subscribe("init",L);this.subscribe("render",this.onRender);this.initEvent.fire(J);},initEvents:function(){J.superclass.initEvents.call(this);var O=M.LIST;this.contextMouseOverEvent=this.createEvent(A.CONTEXT_MOUSE_OVER);this.contextMouseOverEvent.signature=O;this.contextMouseOutEvent=this.createEvent(A.CONTEXT_MOUSE_OUT);this.contextMouseOutEvent.signature=O;this.contextTriggerEvent=this.createEvent(A.CONTEXT_TRIGGER);this.contextTriggerEvent.signature=O;},initDefaultConfig:function(){J.superclass.initDefaultConfig.call(this);this.cfg.addProperty(I.PREVENT_OVERLAP.key,{value:I.PREVENT_OVERLAP.value,validator:I.PREVENT_OVERLAP.validator,supercedes:I.PREVENT_OVERLAP.supercedes});this.cfg.addProperty(I.SHOW_DELAY.key,{handler:this.configShowDelay,value:200,validator:I.SHOW_DELAY.validator});this.cfg.addProperty(I.AUTO_DISMISS_DELAY.key,{handler:this.configAutoDismissDelay,value:I.AUTO_DISMISS_DELAY.value,validator:I.AUTO_DISMISS_DELAY.validator});this.cfg.addProperty(I.HIDE_DELAY.key,{handler:this.configHideDelay,value:I.HIDE_DELAY.value,validator:I.HIDE_DELAY.validator});this.cfg.addProperty(I.TEXT.key,{handler:this.configText,suppressEvent:I.TEXT.suppressEvent});this.cfg.addProperty(I.CONTAINER.key,{handler:this.configContainer,value:document.body});this.cfg.addProperty(I.DISABLED.key,{handler:this.configContainer,value:I.DISABLED.value,supressEvent:I.DISABLED.suppressEvent});},configText:function(P,O,Q){var R=O[0];if(R){this.setBody(R);}},configContainer:function(Q,P,R){var O=P[0];if(typeof O=="string"){this.cfg.setProperty("container",document.getElementById(O),true);}},_removeEventListeners:function(){var R=this._context,O,Q,P;if(R){O=R.length;if(O>0){P=O-1;do{Q=R[P];N.removeListener(Q,"mouseover",this.onContextMouseOver);N.removeListener(Q,"mousemove",this.onContextMouseMove);N.removeListener(Q,"mouseout",this.onContextMouseOut);}while(P--);}}},configContext:function(T,P,U){var S=P[0],V,O,R,Q;if(S){if(!(S instanceof Array)){if(typeof S=="string"){this.cfg.setProperty("context",[document.getElementById(S)],true);}else{this.cfg.setProperty("context",[S],true);}S=this.cfg.getProperty("context");}this._removeEventListeners();this._context=S;V=this._context;if(V){O=V.length;if(O>0){Q=O-1;do{R=V[Q];N.on(R,"mouseover",this.onContextMouseOver,this);N.on(R,"mousemove",this.onContextMouseMove,this);N.on(R,"mouseout",this.onContextMouseOut,this);}while(Q--);}}}},onContextMouseMove:function(P,O){O.pageX=N.getPageX(P);O.pageY=N.getPageY(P);},onContextMouseOver:function(Q,P){var O=this;if(O.title){P._tempTitle=O.title;O.title="";}if(P.fireEvent("contextMouseOver",O,Q)!==false&&!P.cfg.getProperty("disabled")){if(P.hideProcId){clearTimeout(P.hideProcId);P.hideProcId=null;}N.on(O,"mousemove",P.onContextMouseMove,P);P.showProcId=P.doShow(Q,O);}},onContextMouseOut:function(Q,P){var O=this;if(P._tempTitle){O.title=P._tempTitle;P._tempTitle=null;}if(P.showProcId){clearTimeout(P.showProcId);P.showProcId=null;}if(P.hideProcId){clearTimeout(P.hideProcId);P.hideProcId=null;}P.fireEvent("contextMouseOut",O,Q);P.hideProcId=setTimeout(function(){P.hide();},P.cfg.getProperty("hidedelay"));},doShow:function(Q,O){var R=25,P=this;
if(H.opera&&O.tagName&&O.tagName.toUpperCase()=="A"){R+=12;}return setTimeout(function(){var S=P.cfg.getProperty("text");if(P._tempTitle&&(S===""||YAHOO.lang.isUndefined(S)||YAHOO.lang.isNull(S))){P.setBody(P._tempTitle);}else{P.cfg.refireEvent("text");}P.moveTo(P.pageX,P.pageY+R);if(P.cfg.getProperty("preventoverlap")){P.preventOverlap(P.pageX,P.pageY);}N.removeListener(O,"mousemove",P.onContextMouseMove);P.contextTriggerEvent.fire(O);P.show();P.hideProcId=P.doHide();},this.cfg.getProperty("showdelay"));},doHide:function(){var O=this;return setTimeout(function(){O.hide();},this.cfg.getProperty("autodismissdelay"));},preventOverlap:function(S,R){var O=this.element.offsetHeight,Q=new YAHOO.util.Point(S,R),P=C.getRegion(this.element);P.top-=5;P.left-=5;P.right+=5;P.bottom+=5;if(P.contains(Q)){this.cfg.setProperty("y",(R-O-5));}},onRender:function(S,R){function T(){var W=this.element,V=this.underlay;if(V){V.style.width=(W.offsetWidth+6)+"px";V.style.height=(W.offsetHeight+1)+"px";}}function P(){C.addClass(this.underlay,"yui-tt-shadow-visible");if(H.ie){this.forceUnderlayRedraw();}}function O(){C.removeClass(this.underlay,"yui-tt-shadow-visible");}function U(){var X=this.underlay,W,V,Z,Y;if(!X){W=this.element;V=YAHOO.widget.Module;Z=H.ie;Y=this;if(!F){F=document.createElement("div");F.className="yui-tt-shadow";}X=F.cloneNode(false);W.appendChild(X);this.underlay=X;this._shadow=this.underlay;P.call(this);this.subscribe("beforeShow",P);this.subscribe("hide",O);if(G){window.setTimeout(function(){T.call(Y);},0);this.cfg.subscribeToConfigEvent("width",T);this.cfg.subscribeToConfigEvent("height",T);this.subscribe("changeContent",T);V.textResizeEvent.subscribe(T,this,true);this.subscribe("destroy",function(){V.textResizeEvent.unsubscribe(T,this);});}}}function Q(){U.call(this);this.unsubscribe("beforeShow",Q);}if(this.cfg.getProperty("visible")){U.call(this);}else{this.subscribe("beforeShow",Q);}},forceUnderlayRedraw:function(){var O=this;C.addClass(O.underlay,"yui-force-redraw");setTimeout(function(){C.removeClass(O.underlay,"yui-force-redraw");},0);},destroy:function(){this._removeEventListeners();J.superclass.destroy.call(this);},toString:function(){return"Tooltip "+this.id;}});}());(function(){YAHOO.widget.Panel=function(V,U){YAHOO.widget.Panel.superclass.constructor.call(this,V,U);};var S=null;var E=YAHOO.lang,F=YAHOO.util,A=F.Dom,T=F.Event,M=F.CustomEvent,K=YAHOO.util.KeyListener,I=F.Config,H=YAHOO.widget.Overlay,O=YAHOO.widget.Panel,L=YAHOO.env.ua,P=(L.ie&&(L.ie<=6||document.compatMode=="BackCompat")),G,Q,C,D={"SHOW_MASK":"showMask","HIDE_MASK":"hideMask","DRAG":"drag"},N={"CLOSE":{key:"close",value:true,validator:E.isBoolean,supercedes:["visible"]},"DRAGGABLE":{key:"draggable",value:(F.DD?true:false),validator:E.isBoolean,supercedes:["visible"]},"DRAG_ONLY":{key:"dragonly",value:false,validator:E.isBoolean,supercedes:["draggable"]},"UNDERLAY":{key:"underlay",value:"shadow",supercedes:["visible"]},"MODAL":{key:"modal",value:false,validator:E.isBoolean,supercedes:["visible","zindex"]},"KEY_LISTENERS":{key:"keylisteners",suppressEvent:true,supercedes:["visible"]},"STRINGS":{key:"strings",supercedes:["close"],validator:E.isObject,value:{close:"Close"}}};O.CSS_PANEL="yui-panel";O.CSS_PANEL_CONTAINER="yui-panel-container";O.FOCUSABLE=["a","button","select","textarea","input","iframe"];function J(V,U){if(!this.header&&this.cfg.getProperty("draggable")){this.setHeader("&#160;");}}function R(V,U,W){var Z=W[0],X=W[1],Y=this.cfg,a=Y.getProperty("width");if(a==X){Y.setProperty("width",Z);}this.unsubscribe("hide",R,W);}function B(V,U){var Y,X,W;if(P){Y=this.cfg;X=Y.getProperty("width");if(!X||X=="auto"){W=(this.element.offsetWidth+"px");Y.setProperty("width",W);this.subscribe("hide",R,[(X||""),W]);}}}YAHOO.extend(O,H,{init:function(V,U){O.superclass.init.call(this,V);this.beforeInitEvent.fire(O);A.addClass(this.element,O.CSS_PANEL);this.buildWrapper();if(U){this.cfg.applyConfig(U,true);}this.subscribe("showMask",this._addFocusHandlers);this.subscribe("hideMask",this._removeFocusHandlers);this.subscribe("beforeRender",J);this.subscribe("render",function(){this.setFirstLastFocusable();this.subscribe("changeContent",this.setFirstLastFocusable);});this.subscribe("show",this.focusFirst);this.initEvent.fire(O);},_onElementFocus:function(Z){if(S===this){var Y=T.getTarget(Z),X=document.documentElement,V=(Y!==X&&Y!==window);if(V&&Y!==this.element&&Y!==this.mask&&!A.isAncestor(this.element,Y)){try{if(this.firstElement){this.firstElement.focus();}else{if(this._modalFocus){this._modalFocus.focus();}else{this.innerElement.focus();}}}catch(W){try{if(V&&Y!==document.body){Y.blur();}}catch(U){}}}}},_addFocusHandlers:function(V,U){if(!this.firstElement){if(L.webkit||L.opera){if(!this._modalFocus){this._createHiddenFocusElement();}}else{this.innerElement.tabIndex=0;}}this.setTabLoop(this.firstElement,this.lastElement);T.onFocus(document.documentElement,this._onElementFocus,this,true);S=this;},_createHiddenFocusElement:function(){var U=document.createElement("button");U.style.height="1px";U.style.width="1px";U.style.position="absolute";U.style.left="-10000em";U.style.opacity=0;U.tabIndex=-1;this.innerElement.appendChild(U);this._modalFocus=U;},_removeFocusHandlers:function(V,U){T.removeFocusListener(document.documentElement,this._onElementFocus,this);if(S==this){S=null;}},focusFirst:function(W,U,Y){var V=this.firstElement;if(U&&U[1]){T.stopEvent(U[1]);}if(V){try{V.focus();}catch(X){}}},focusLast:function(W,U,Y){var V=this.lastElement;if(U&&U[1]){T.stopEvent(U[1]);}if(V){try{V.focus();}catch(X){}}},setTabLoop:function(X,Z){var V=this.preventBackTab,W=this.preventTabOut,U=this.showEvent,Y=this.hideEvent;if(V){V.disable();U.unsubscribe(V.enable,V);Y.unsubscribe(V.disable,V);V=this.preventBackTab=null;}if(W){W.disable();U.unsubscribe(W.enable,W);Y.unsubscribe(W.disable,W);W=this.preventTabOut=null;}if(X){this.preventBackTab=new K(X,{shift:true,keys:9},{fn:this.focusLast,scope:this,correctScope:true});V=this.preventBackTab;U.subscribe(V.enable,V,true);
Y.subscribe(V.disable,V,true);}if(Z){this.preventTabOut=new K(Z,{shift:false,keys:9},{fn:this.focusFirst,scope:this,correctScope:true});W=this.preventTabOut;U.subscribe(W.enable,W,true);Y.subscribe(W.disable,W,true);}},getFocusableElements:function(U){U=U||this.innerElement;var X={};for(var W=0;W<O.FOCUSABLE.length;W++){X[O.FOCUSABLE[W]]=true;}function V(Y){if(Y.focus&&Y.type!=="hidden"&&!Y.disabled&&X[Y.tagName.toLowerCase()]){return true;}return false;}return A.getElementsBy(V,null,U);},setFirstLastFocusable:function(){this.firstElement=null;this.lastElement=null;var U=this.getFocusableElements();this.focusableElements=U;if(U.length>0){this.firstElement=U[0];this.lastElement=U[U.length-1];}if(this.cfg.getProperty("modal")){this.setTabLoop(this.firstElement,this.lastElement);}},initEvents:function(){O.superclass.initEvents.call(this);var U=M.LIST;this.showMaskEvent=this.createEvent(D.SHOW_MASK);this.showMaskEvent.signature=U;this.hideMaskEvent=this.createEvent(D.HIDE_MASK);this.hideMaskEvent.signature=U;this.dragEvent=this.createEvent(D.DRAG);this.dragEvent.signature=U;},initDefaultConfig:function(){O.superclass.initDefaultConfig.call(this);this.cfg.addProperty(N.CLOSE.key,{handler:this.configClose,value:N.CLOSE.value,validator:N.CLOSE.validator,supercedes:N.CLOSE.supercedes});this.cfg.addProperty(N.DRAGGABLE.key,{handler:this.configDraggable,value:(F.DD)?true:false,validator:N.DRAGGABLE.validator,supercedes:N.DRAGGABLE.supercedes});this.cfg.addProperty(N.DRAG_ONLY.key,{value:N.DRAG_ONLY.value,validator:N.DRAG_ONLY.validator,supercedes:N.DRAG_ONLY.supercedes});this.cfg.addProperty(N.UNDERLAY.key,{handler:this.configUnderlay,value:N.UNDERLAY.value,supercedes:N.UNDERLAY.supercedes});this.cfg.addProperty(N.MODAL.key,{handler:this.configModal,value:N.MODAL.value,validator:N.MODAL.validator,supercedes:N.MODAL.supercedes});this.cfg.addProperty(N.KEY_LISTENERS.key,{handler:this.configKeyListeners,suppressEvent:N.KEY_LISTENERS.suppressEvent,supercedes:N.KEY_LISTENERS.supercedes});this.cfg.addProperty(N.STRINGS.key,{value:N.STRINGS.value,handler:this.configStrings,validator:N.STRINGS.validator,supercedes:N.STRINGS.supercedes});},configClose:function(X,V,Y){var Z=V[0],W=this.close,U=this.cfg.getProperty("strings");if(Z){if(!W){if(!C){C=document.createElement("a");C.className="container-close";C.href="#";}W=C.cloneNode(true);this.innerElement.appendChild(W);W.innerHTML=(U&&U.close)?U.close:"&#160;";T.on(W,"click",this._doClose,this,true);this.close=W;}else{W.style.display="block";}}else{if(W){W.style.display="none";}}},_doClose:function(U){T.preventDefault(U);this.hide();},configDraggable:function(V,U,W){var X=U[0];if(X){if(!F.DD){this.cfg.setProperty("draggable",false);return;}if(this.header){A.setStyle(this.header,"cursor","move");this.registerDragDrop();}this.subscribe("beforeShow",B);}else{if(this.dd){this.dd.unreg();}if(this.header){A.setStyle(this.header,"cursor","auto");}this.unsubscribe("beforeShow",B);}},configUnderlay:function(d,c,Z){var b=(this.platform=="mac"&&L.gecko),e=c[0].toLowerCase(),V=this.underlay,W=this.element;function X(){var f=false;if(!V){if(!Q){Q=document.createElement("div");Q.className="underlay";}V=Q.cloneNode(false);this.element.appendChild(V);this.underlay=V;if(P){this.sizeUnderlay();this.cfg.subscribeToConfigEvent("width",this.sizeUnderlay);this.cfg.subscribeToConfigEvent("height",this.sizeUnderlay);this.changeContentEvent.subscribe(this.sizeUnderlay);YAHOO.widget.Module.textResizeEvent.subscribe(this.sizeUnderlay,this,true);}if(L.webkit&&L.webkit<420){this.changeContentEvent.subscribe(this.forceUnderlayRedraw);}f=true;}}function a(){var f=X.call(this);if(!f&&P){this.sizeUnderlay();}this._underlayDeferred=false;this.beforeShowEvent.unsubscribe(a);}function Y(){if(this._underlayDeferred){this.beforeShowEvent.unsubscribe(a);this._underlayDeferred=false;}if(V){this.cfg.unsubscribeFromConfigEvent("width",this.sizeUnderlay);this.cfg.unsubscribeFromConfigEvent("height",this.sizeUnderlay);this.changeContentEvent.unsubscribe(this.sizeUnderlay);this.changeContentEvent.unsubscribe(this.forceUnderlayRedraw);YAHOO.widget.Module.textResizeEvent.unsubscribe(this.sizeUnderlay,this,true);this.element.removeChild(V);this.underlay=null;}}switch(e){case"shadow":A.removeClass(W,"matte");A.addClass(W,"shadow");break;case"matte":if(!b){Y.call(this);}A.removeClass(W,"shadow");A.addClass(W,"matte");break;default:if(!b){Y.call(this);}A.removeClass(W,"shadow");A.removeClass(W,"matte");break;}if((e=="shadow")||(b&&!V)){if(this.cfg.getProperty("visible")){var U=X.call(this);if(!U&&P){this.sizeUnderlay();}}else{if(!this._underlayDeferred){this.beforeShowEvent.subscribe(a);this._underlayDeferred=true;}}}},configModal:function(V,U,X){var W=U[0];if(W){if(!this._hasModalityEventListeners){this.subscribe("beforeShow",this.buildMask);this.subscribe("beforeShow",this.bringToTop);this.subscribe("beforeShow",this.showMask);this.subscribe("hide",this.hideMask);H.windowResizeEvent.subscribe(this.sizeMask,this,true);this._hasModalityEventListeners=true;}}else{if(this._hasModalityEventListeners){if(this.cfg.getProperty("visible")){this.hideMask();this.removeMask();}this.unsubscribe("beforeShow",this.buildMask);this.unsubscribe("beforeShow",this.bringToTop);this.unsubscribe("beforeShow",this.showMask);this.unsubscribe("hide",this.hideMask);H.windowResizeEvent.unsubscribe(this.sizeMask,this);this._hasModalityEventListeners=false;}}},removeMask:function(){var V=this.mask,U;if(V){this.hideMask();U=V.parentNode;if(U){U.removeChild(V);}this.mask=null;}},configKeyListeners:function(X,U,a){var W=U[0],Z,Y,V;if(W){if(W instanceof Array){Y=W.length;for(V=0;V<Y;V++){Z=W[V];if(!I.alreadySubscribed(this.showEvent,Z.enable,Z)){this.showEvent.subscribe(Z.enable,Z,true);}if(!I.alreadySubscribed(this.hideEvent,Z.disable,Z)){this.hideEvent.subscribe(Z.disable,Z,true);this.destroyEvent.subscribe(Z.disable,Z,true);}}}else{if(!I.alreadySubscribed(this.showEvent,W.enable,W)){this.showEvent.subscribe(W.enable,W,true);}if(!I.alreadySubscribed(this.hideEvent,W.disable,W)){this.hideEvent.subscribe(W.disable,W,true);
this.destroyEvent.subscribe(W.disable,W,true);}}}},configStrings:function(V,U,W){var X=E.merge(N.STRINGS.value,U[0]);this.cfg.setProperty(N.STRINGS.key,X,true);},configHeight:function(X,V,Y){var U=V[0],W=this.innerElement;A.setStyle(W,"height",U);this.cfg.refireEvent("iframe");},_autoFillOnHeightChange:function(X,V,W){O.superclass._autoFillOnHeightChange.apply(this,arguments);if(P){var U=this;setTimeout(function(){U.sizeUnderlay();},0);}},configWidth:function(X,U,Y){var W=U[0],V=this.innerElement;A.setStyle(V,"width",W);this.cfg.refireEvent("iframe");},configzIndex:function(V,U,X){O.superclass.configzIndex.call(this,V,U,X);if(this.mask||this.cfg.getProperty("modal")===true){var W=A.getStyle(this.element,"zIndex");if(!W||isNaN(W)){W=0;}if(W===0){this.cfg.setProperty("zIndex",1);}else{this.stackMask();}}},buildWrapper:function(){var W=this.element.parentNode,U=this.element,V=document.createElement("div");V.className=O.CSS_PANEL_CONTAINER;V.id=U.id+"_c";if(W){W.insertBefore(V,U);}V.appendChild(U);this.element=V;this.innerElement=U;A.setStyle(this.innerElement,"visibility","inherit");},sizeUnderlay:function(){var V=this.underlay,U;if(V){U=this.element;V.style.width=U.offsetWidth+"px";V.style.height=U.offsetHeight+"px";}},registerDragDrop:function(){var V=this;if(this.header){if(!F.DD){return;}var U=(this.cfg.getProperty("dragonly")===true);this.dd=new F.DD(this.element.id,this.id,{dragOnly:U});if(!this.header.id){this.header.id=this.id+"_h";}this.dd.startDrag=function(){var X,Z,W,c,b,a;if(YAHOO.env.ua.ie==6){A.addClass(V.element,"drag");}if(V.cfg.getProperty("constraintoviewport")){var Y=H.VIEWPORT_OFFSET;X=V.element.offsetHeight;Z=V.element.offsetWidth;W=A.getViewportWidth();c=A.getViewportHeight();b=A.getDocumentScrollLeft();a=A.getDocumentScrollTop();if(X+Y<c){this.minY=a+Y;this.maxY=a+c-X-Y;}else{this.minY=a+Y;this.maxY=a+Y;}if(Z+Y<W){this.minX=b+Y;this.maxX=b+W-Z-Y;}else{this.minX=b+Y;this.maxX=b+Y;}this.constrainX=true;this.constrainY=true;}else{this.constrainX=false;this.constrainY=false;}V.dragEvent.fire("startDrag",arguments);};this.dd.onDrag=function(){V.syncPosition();V.cfg.refireEvent("iframe");if(this.platform=="mac"&&YAHOO.env.ua.gecko){this.showMacGeckoScrollbars();}V.dragEvent.fire("onDrag",arguments);};this.dd.endDrag=function(){if(YAHOO.env.ua.ie==6){A.removeClass(V.element,"drag");}V.dragEvent.fire("endDrag",arguments);V.moveEvent.fire(V.cfg.getProperty("xy"));};this.dd.setHandleElId(this.header.id);this.dd.addInvalidHandleType("INPUT");this.dd.addInvalidHandleType("SELECT");this.dd.addInvalidHandleType("TEXTAREA");}},buildMask:function(){var U=this.mask;if(!U){if(!G){G=document.createElement("div");G.className="mask";G.innerHTML="&#160;";}U=G.cloneNode(true);U.id=this.id+"_mask";document.body.insertBefore(U,document.body.firstChild);this.mask=U;if(YAHOO.env.ua.gecko&&this.platform=="mac"){A.addClass(this.mask,"block-scrollbars");}this.stackMask();}},hideMask:function(){if(this.cfg.getProperty("modal")&&this.mask){this.mask.style.display="none";A.removeClass(document.body,"masked");this.hideMaskEvent.fire();}},showMask:function(){if(this.cfg.getProperty("modal")&&this.mask){A.addClass(document.body,"masked");this.sizeMask();this.mask.style.display="block";this.showMaskEvent.fire();}},sizeMask:function(){if(this.mask){var V=this.mask,W=A.getViewportWidth(),U=A.getViewportHeight();if(V.offsetHeight>U){V.style.height=U+"px";}if(V.offsetWidth>W){V.style.width=W+"px";}V.style.height=A.getDocumentHeight()+"px";V.style.width=A.getDocumentWidth()+"px";}},stackMask:function(){if(this.mask){var U=A.getStyle(this.element,"zIndex");if(!YAHOO.lang.isUndefined(U)&&!isNaN(U)){A.setStyle(this.mask,"zIndex",U-1);}}},render:function(U){return O.superclass.render.call(this,U,this.innerElement);},destroy:function(){H.windowResizeEvent.unsubscribe(this.sizeMask,this);this.removeMask();if(this.close){T.purgeElement(this.close);}O.superclass.destroy.call(this);},forceUnderlayRedraw:function(){var U=this.underlay;A.addClass(U,"yui-force-redraw");setTimeout(function(){A.removeClass(U,"yui-force-redraw");},0);},toString:function(){return"Panel "+this.id;}});}());(function(){YAHOO.widget.Dialog=function(J,I){YAHOO.widget.Dialog.superclass.constructor.call(this,J,I);};var B=YAHOO.util.Event,G=YAHOO.util.CustomEvent,E=YAHOO.util.Dom,A=YAHOO.widget.Dialog,F=YAHOO.lang,H={"BEFORE_SUBMIT":"beforeSubmit","SUBMIT":"submit","MANUAL_SUBMIT":"manualSubmit","ASYNC_SUBMIT":"asyncSubmit","FORM_SUBMIT":"formSubmit","CANCEL":"cancel"},C={"POST_METHOD":{key:"postmethod",value:"async"},"POST_DATA":{key:"postdata",value:null},"BUTTONS":{key:"buttons",value:"none",supercedes:["visible"]},"HIDEAFTERSUBMIT":{key:"hideaftersubmit",value:true}};A.CSS_DIALOG="yui-dialog";function D(){var L=this._aButtons,J,K,I;if(F.isArray(L)){J=L.length;if(J>0){I=J-1;do{K=L[I];if(YAHOO.widget.Button&&K instanceof YAHOO.widget.Button){K.destroy();}else{if(K.tagName.toUpperCase()=="BUTTON"){B.purgeElement(K);B.purgeElement(K,false);}}}while(I--);}}}YAHOO.extend(A,YAHOO.widget.Panel,{form:null,initDefaultConfig:function(){A.superclass.initDefaultConfig.call(this);this.callback={success:null,failure:null,argument:null};this.cfg.addProperty(C.POST_METHOD.key,{handler:this.configPostMethod,value:C.POST_METHOD.value,validator:function(I){if(I!="form"&&I!="async"&&I!="none"&&I!="manual"){return false;}else{return true;}}});this.cfg.addProperty(C.POST_DATA.key,{value:C.POST_DATA.value});this.cfg.addProperty(C.HIDEAFTERSUBMIT.key,{value:C.HIDEAFTERSUBMIT.value});this.cfg.addProperty(C.BUTTONS.key,{handler:this.configButtons,value:C.BUTTONS.value,supercedes:C.BUTTONS.supercedes});},initEvents:function(){A.superclass.initEvents.call(this);var I=G.LIST;this.beforeSubmitEvent=this.createEvent(H.BEFORE_SUBMIT);this.beforeSubmitEvent.signature=I;this.submitEvent=this.createEvent(H.SUBMIT);this.submitEvent.signature=I;this.manualSubmitEvent=this.createEvent(H.MANUAL_SUBMIT);this.manualSubmitEvent.signature=I;this.asyncSubmitEvent=this.createEvent(H.ASYNC_SUBMIT);
this.asyncSubmitEvent.signature=I;this.formSubmitEvent=this.createEvent(H.FORM_SUBMIT);this.formSubmitEvent.signature=I;this.cancelEvent=this.createEvent(H.CANCEL);this.cancelEvent.signature=I;},init:function(J,I){A.superclass.init.call(this,J);this.beforeInitEvent.fire(A);E.addClass(this.element,A.CSS_DIALOG);this.cfg.setProperty("visible",false);if(I){this.cfg.applyConfig(I,true);}this.showEvent.subscribe(this.focusFirst,this,true);this.beforeHideEvent.subscribe(this.blurButtons,this,true);this.subscribe("changeBody",this.registerForm);this.initEvent.fire(A);},doSubmit:function(){var P=YAHOO.util.Connect,Q=this.form,K=false,N=false,R,M,L,I;switch(this.cfg.getProperty("postmethod")){case"async":R=Q.elements;M=R.length;if(M>0){L=M-1;do{if(R[L].type=="file"){K=true;break;}}while(L--);}if(K&&YAHOO.env.ua.ie&&this.isSecure){N=true;}I=this._getFormAttributes(Q);P.setForm(Q,K,N);var J=this.cfg.getProperty("postdata");var O=P.asyncRequest(I.method,I.action,this.callback,J);this.asyncSubmitEvent.fire(O);break;case"form":Q.submit();this.formSubmitEvent.fire();break;case"none":case"manual":this.manualSubmitEvent.fire();break;}},_getFormAttributes:function(K){var I={method:null,action:null};if(K){if(K.getAttributeNode){var J=K.getAttributeNode("action");var L=K.getAttributeNode("method");if(J){I.action=J.value;}if(L){I.method=L.value;}}else{I.action=K.getAttribute("action");I.method=K.getAttribute("method");}}I.method=(F.isString(I.method)?I.method:"POST").toUpperCase();I.action=F.isString(I.action)?I.action:"";return I;},registerForm:function(){var I=this.element.getElementsByTagName("form")[0];if(this.form){if(this.form==I&&E.isAncestor(this.element,this.form)){return;}else{B.purgeElement(this.form);this.form=null;}}if(!I){I=document.createElement("form");I.name="frm_"+this.id;this.body.appendChild(I);}if(I){this.form=I;B.on(I,"submit",this._submitHandler,this,true);}},_submitHandler:function(I){B.stopEvent(I);this.submit();this.form.blur();},setTabLoop:function(I,J){I=I||this.firstButton;J=this.lastButton||J;A.superclass.setTabLoop.call(this,I,J);},setFirstLastFocusable:function(){A.superclass.setFirstLastFocusable.call(this);var J,I,K,L=this.focusableElements;this.firstFormElement=null;this.lastFormElement=null;if(this.form&&L&&L.length>0){I=L.length;for(J=0;J<I;++J){K=L[J];if(this.form===K.form){this.firstFormElement=K;break;}}for(J=I-1;J>=0;--J){K=L[J];if(this.form===K.form){this.lastFormElement=K;break;}}}},configClose:function(J,I,K){A.superclass.configClose.apply(this,arguments);},_doClose:function(I){B.preventDefault(I);this.cancel();},configButtons:function(S,R,M){var N=YAHOO.widget.Button,U=R[0],K=this.innerElement,T,P,J,Q,O,I,L;D.call(this);this._aButtons=null;if(F.isArray(U)){O=document.createElement("span");O.className="button-group";Q=U.length;this._aButtons=[];this.defaultHtmlButton=null;for(L=0;L<Q;L++){T=U[L];if(N){J=new N({label:T.text});J.appendTo(O);P=J.get("element");if(T.isDefault){J.addClass("default");this.defaultHtmlButton=P;}if(F.isFunction(T.handler)){J.set("onclick",{fn:T.handler,obj:this,scope:this});}else{if(F.isObject(T.handler)&&F.isFunction(T.handler.fn)){J.set("onclick",{fn:T.handler.fn,obj:((!F.isUndefined(T.handler.obj))?T.handler.obj:this),scope:(T.handler.scope||this)});}}this._aButtons[this._aButtons.length]=J;}else{P=document.createElement("button");P.setAttribute("type","button");if(T.isDefault){P.className="default";this.defaultHtmlButton=P;}P.innerHTML=T.text;if(F.isFunction(T.handler)){B.on(P,"click",T.handler,this,true);}else{if(F.isObject(T.handler)&&F.isFunction(T.handler.fn)){B.on(P,"click",T.handler.fn,((!F.isUndefined(T.handler.obj))?T.handler.obj:this),(T.handler.scope||this));}}O.appendChild(P);this._aButtons[this._aButtons.length]=P;}T.htmlButton=P;if(L===0){this.firstButton=P;}if(L==(Q-1)){this.lastButton=P;}}this.setFooter(O);I=this.footer;if(E.inDocument(this.element)&&!E.isAncestor(K,I)){K.appendChild(I);}this.buttonSpan=O;}else{O=this.buttonSpan;I=this.footer;if(O&&I){I.removeChild(O);this.buttonSpan=null;this.firstButton=null;this.lastButton=null;this.defaultHtmlButton=null;}}this.changeContentEvent.fire();},getButtons:function(){return this._aButtons||null;},focusFirst:function(K,I,M){var J=this.firstFormElement;if(I&&I[1]){B.stopEvent(I[1]);}if(J){try{J.focus();}catch(L){}}else{if(this.defaultHtmlButton){this.focusDefaultButton();}else{this.focusFirstButton();}}},focusLast:function(K,I,M){var N=this.cfg.getProperty("buttons"),J=this.lastFormElement;if(I&&I[1]){B.stopEvent(I[1]);}if(N&&F.isArray(N)){this.focusLastButton();}else{if(J){try{J.focus();}catch(L){}}}},_getButton:function(J){var I=YAHOO.widget.Button;if(I&&J&&J.nodeName&&J.id){J=I.getButton(J.id)||J;}return J;},focusDefaultButton:function(){var I=this._getButton(this.defaultHtmlButton);if(I){try{I.focus();}catch(J){}}},blurButtons:function(){var N=this.cfg.getProperty("buttons"),K,M,J,I;if(N&&F.isArray(N)){K=N.length;if(K>0){I=(K-1);do{M=N[I];if(M){J=this._getButton(M.htmlButton);if(J){try{J.blur();}catch(L){}}}}while(I--);}}},focusFirstButton:function(){var L=this.cfg.getProperty("buttons"),K,I;if(L&&F.isArray(L)){K=L[0];if(K){I=this._getButton(K.htmlButton);if(I){try{I.focus();}catch(J){}}}}},focusLastButton:function(){var M=this.cfg.getProperty("buttons"),J,L,I;if(M&&F.isArray(M)){J=M.length;if(J>0){L=M[(J-1)];if(L){I=this._getButton(L.htmlButton);if(I){try{I.focus();}catch(K){}}}}}},configPostMethod:function(J,I,K){this.registerForm();},validate:function(){return true;},submit:function(){if(this.validate()){this.beforeSubmitEvent.fire();this.doSubmit();this.submitEvent.fire();if(this.cfg.getProperty("hideaftersubmit")){this.hide();}return true;}else{return false;}},cancel:function(){this.cancelEvent.fire();this.hide();},getData:function(){var Y=this.form,K,R,U,M,S,P,O,J,V,L,W,Z,I,N,a,X,T;function Q(c){var b=c.tagName.toUpperCase();return((b=="INPUT"||b=="TEXTAREA"||b=="SELECT")&&c.name==M);}if(Y){K=Y.elements;R=K.length;U={};for(X=0;X<R;X++){M=K[X].name;S=E.getElementsBy(Q,"*",Y);
P=S.length;if(P>0){if(P==1){S=S[0];O=S.type;J=S.tagName.toUpperCase();switch(J){case"INPUT":if(O=="checkbox"){U[M]=S.checked;}else{if(O!="radio"){U[M]=S.value;}}break;case"TEXTAREA":U[M]=S.value;break;case"SELECT":V=S.options;L=V.length;W=[];for(T=0;T<L;T++){Z=V[T];if(Z.selected){I=Z.value;if(!I||I===""){I=Z.text;}W[W.length]=I;}}U[M]=W;break;}}else{O=S[0].type;switch(O){case"radio":for(T=0;T<P;T++){N=S[T];if(N.checked){U[M]=N.value;break;}}break;case"checkbox":W=[];for(T=0;T<P;T++){a=S[T];if(a.checked){W[W.length]=a.value;}}U[M]=W;break;}}}}}return U;},destroy:function(){D.call(this);this._aButtons=null;var I=this.element.getElementsByTagName("form"),J;if(I.length>0){J=I[0];if(J){B.purgeElement(J);if(J.parentNode){J.parentNode.removeChild(J);}this.form=null;}}A.superclass.destroy.call(this);},toString:function(){return"Dialog "+this.id;}});}());(function(){YAHOO.widget.SimpleDialog=function(E,D){YAHOO.widget.SimpleDialog.superclass.constructor.call(this,E,D);};var C=YAHOO.util.Dom,B=YAHOO.widget.SimpleDialog,A={"ICON":{key:"icon",value:"none",suppressEvent:true},"TEXT":{key:"text",value:"",suppressEvent:true,supercedes:["icon"]}};B.ICON_BLOCK="blckicon";B.ICON_ALARM="alrticon";B.ICON_HELP="hlpicon";B.ICON_INFO="infoicon";B.ICON_WARN="warnicon";B.ICON_TIP="tipicon";B.ICON_CSS_CLASSNAME="yui-icon";B.CSS_SIMPLEDIALOG="yui-simple-dialog";YAHOO.extend(B,YAHOO.widget.Dialog,{initDefaultConfig:function(){B.superclass.initDefaultConfig.call(this);this.cfg.addProperty(A.ICON.key,{handler:this.configIcon,value:A.ICON.value,suppressEvent:A.ICON.suppressEvent});this.cfg.addProperty(A.TEXT.key,{handler:this.configText,value:A.TEXT.value,suppressEvent:A.TEXT.suppressEvent,supercedes:A.TEXT.supercedes});},init:function(E,D){B.superclass.init.call(this,E);this.beforeInitEvent.fire(B);C.addClass(this.element,B.CSS_SIMPLEDIALOG);this.cfg.queueProperty("postmethod","manual");if(D){this.cfg.applyConfig(D,true);}this.beforeRenderEvent.subscribe(function(){if(!this.body){this.setBody("");}},this,true);this.initEvent.fire(B);},registerForm:function(){B.superclass.registerForm.call(this);this.form.innerHTML+='<input type="hidden" name="'+this.id+'" value=""/>';},configIcon:function(F,E,J){var K=E[0],D=this.body,I=B.ICON_CSS_CLASSNAME,H,G;if(K&&K!="none"){H=C.getElementsByClassName(I,"*",D);if(H){G=H.parentNode;if(G){G.removeChild(H);H=null;}}if(K.indexOf(".")==-1){H=document.createElement("span");H.className=(I+" "+K);H.innerHTML="&#160;";}else{H=document.createElement("img");H.src=(this.imageRoot+K);H.className=I;}if(H){D.insertBefore(H,D.firstChild);}}},configText:function(E,D,F){var G=D[0];if(G){this.setBody(G);this.cfg.refireEvent("icon");}},toString:function(){return"SimpleDialog "+this.id;}});}());(function(){YAHOO.widget.ContainerEffect=function(E,H,G,D,F){if(!F){F=YAHOO.util.Anim;}this.overlay=E;this.attrIn=H;this.attrOut=G;this.targetElement=D||E.element;this.animClass=F;};var B=YAHOO.util.Dom,C=YAHOO.util.CustomEvent,A=YAHOO.widget.ContainerEffect;A.FADE=function(D,F){var G=YAHOO.util.Easing,I={attributes:{opacity:{from:0,to:1}},duration:F,method:G.easeIn},E={attributes:{opacity:{to:0}},duration:F,method:G.easeOut},H=new A(D,I,E,D.element);H.handleUnderlayStart=function(){var K=this.overlay.underlay;if(K&&YAHOO.env.ua.ie){var J=(K.filters&&K.filters.length>0);if(J){B.addClass(D.element,"yui-effect-fade");}}};H.handleUnderlayComplete=function(){var J=this.overlay.underlay;if(J&&YAHOO.env.ua.ie){B.removeClass(D.element,"yui-effect-fade");}};H.handleStartAnimateIn=function(K,J,L){B.addClass(L.overlay.element,"hide-select");if(!L.overlay.underlay){L.overlay.cfg.refireEvent("underlay");}L.handleUnderlayStart();L.overlay._setDomVisibility(true);B.setStyle(L.overlay.element,"opacity",0);};H.handleCompleteAnimateIn=function(K,J,L){B.removeClass(L.overlay.element,"hide-select");if(L.overlay.element.style.filter){L.overlay.element.style.filter=null;}L.handleUnderlayComplete();L.overlay.cfg.refireEvent("iframe");L.animateInCompleteEvent.fire();};H.handleStartAnimateOut=function(K,J,L){B.addClass(L.overlay.element,"hide-select");L.handleUnderlayStart();};H.handleCompleteAnimateOut=function(K,J,L){B.removeClass(L.overlay.element,"hide-select");if(L.overlay.element.style.filter){L.overlay.element.style.filter=null;}L.overlay._setDomVisibility(false);B.setStyle(L.overlay.element,"opacity",1);L.handleUnderlayComplete();L.overlay.cfg.refireEvent("iframe");L.animateOutCompleteEvent.fire();};H.init();return H;};A.SLIDE=function(F,D){var I=YAHOO.util.Easing,L=F.cfg.getProperty("x")||B.getX(F.element),K=F.cfg.getProperty("y")||B.getY(F.element),M=B.getClientWidth(),H=F.element.offsetWidth,J={attributes:{points:{to:[L,K]}},duration:D,method:I.easeIn},E={attributes:{points:{to:[(M+25),K]}},duration:D,method:I.easeOut},G=new A(F,J,E,F.element,YAHOO.util.Motion);G.handleStartAnimateIn=function(O,N,P){P.overlay.element.style.left=((-25)-H)+"px";P.overlay.element.style.top=K+"px";};G.handleTweenAnimateIn=function(Q,P,R){var S=B.getXY(R.overlay.element),O=S[0],N=S[1];if(B.getStyle(R.overlay.element,"visibility")=="hidden"&&O<L){R.overlay._setDomVisibility(true);}R.overlay.cfg.setProperty("xy",[O,N],true);R.overlay.cfg.refireEvent("iframe");};G.handleCompleteAnimateIn=function(O,N,P){P.overlay.cfg.setProperty("xy",[L,K],true);P.startX=L;P.startY=K;P.overlay.cfg.refireEvent("iframe");P.animateInCompleteEvent.fire();};G.handleStartAnimateOut=function(O,N,R){var P=B.getViewportWidth(),S=B.getXY(R.overlay.element),Q=S[1];R.animOut.attributes.points.to=[(P+25),Q];};G.handleTweenAnimateOut=function(P,O,Q){var S=B.getXY(Q.overlay.element),N=S[0],R=S[1];Q.overlay.cfg.setProperty("xy",[N,R],true);Q.overlay.cfg.refireEvent("iframe");};G.handleCompleteAnimateOut=function(O,N,P){P.overlay._setDomVisibility(false);P.overlay.cfg.setProperty("xy",[L,K]);P.animateOutCompleteEvent.fire();};G.init();return G;};A.prototype={init:function(){this.beforeAnimateInEvent=this.createEvent("beforeAnimateIn");this.beforeAnimateInEvent.signature=C.LIST;this.beforeAnimateOutEvent=this.createEvent("beforeAnimateOut");
this.beforeAnimateOutEvent.signature=C.LIST;this.animateInCompleteEvent=this.createEvent("animateInComplete");this.animateInCompleteEvent.signature=C.LIST;this.animateOutCompleteEvent=this.createEvent("animateOutComplete");this.animateOutCompleteEvent.signature=C.LIST;this.animIn=new this.animClass(this.targetElement,this.attrIn.attributes,this.attrIn.duration,this.attrIn.method);this.animIn.onStart.subscribe(this.handleStartAnimateIn,this);this.animIn.onTween.subscribe(this.handleTweenAnimateIn,this);this.animIn.onComplete.subscribe(this.handleCompleteAnimateIn,this);this.animOut=new this.animClass(this.targetElement,this.attrOut.attributes,this.attrOut.duration,this.attrOut.method);this.animOut.onStart.subscribe(this.handleStartAnimateOut,this);this.animOut.onTween.subscribe(this.handleTweenAnimateOut,this);this.animOut.onComplete.subscribe(this.handleCompleteAnimateOut,this);},animateIn:function(){this.beforeAnimateInEvent.fire();this.animIn.animate();},animateOut:function(){this.beforeAnimateOutEvent.fire();this.animOut.animate();},handleStartAnimateIn:function(E,D,F){},handleTweenAnimateIn:function(E,D,F){},handleCompleteAnimateIn:function(E,D,F){},handleStartAnimateOut:function(E,D,F){},handleTweenAnimateOut:function(E,D,F){},handleCompleteAnimateOut:function(E,D,F){},toString:function(){var D="ContainerEffect";if(this.overlay){D+=" ["+this.overlay.toString()+"]";}return D;}};YAHOO.lang.augmentProto(A,YAHOO.util.EventProvider);})();YAHOO.register("container",YAHOO.widget.Module,{version:"2.7.0",build:"1796"});/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
(function(){var S="DIV",O="hd",K="bd",N="ft",X="LI",A="disabled",D="mouseover",F="mouseout",U="mousedown",G="mouseup",R=YAHOO.env.ua.ie?"focusin":"focus",V="click",B="keydown",M="keyup",I="keypress",L="clicktohide",T="position",P="dynamic",Y="showdelay",J="selected",E="visible",W="UL",Q="MenuManager",C=YAHOO.util.Dom,Z=YAHOO.util.Event,H=YAHOO.lang;YAHOO.widget.MenuManager=function(){var a=false,c={},r={},d={},n={"click":"clickEvent","mousedown":"mouseDownEvent","mouseup":"mouseUpEvent","mouseover":"mouseOverEvent","mouseout":"mouseOutEvent","keydown":"keyDownEvent","keyup":"keyUpEvent","keypress":"keyPressEvent","focus":"focusEvent","focusin":"focusEvent","blur":"blurEvent","focusout":"blurEvent"},m=null,k=null;function o(u){var s,t;if(u&&u.tagName){switch(u.tagName.toUpperCase()){case S:s=u.parentNode;if((C.hasClass(u,O)||C.hasClass(u,K)||C.hasClass(u,N))&&s&&s.tagName&&s.tagName.toUpperCase()==S){t=s;}else{t=u;}break;case X:t=u;break;default:s=u.parentNode;if(s){t=o(s);}break;}}return t;}function q(w){var s=Z.getTarget(w),t=o(s),y,u,v,AA,z;if(t){u=t.tagName.toUpperCase();if(u==X){v=t.id;if(v&&d[v]){AA=d[v];z=AA.parent;}}else{if(u==S){if(t.id){z=c[t.id];}}}}if(z){y=n[w.type];if(AA&&!AA.cfg.getProperty(A)){AA[y].fire(w);}z[y].fire(w,AA);}else{if(w.type==U){for(var x in r){if(H.hasOwnProperty(r,x)){z=r[x];if(z.cfg.getProperty(L)&&!(z instanceof YAHOO.widget.MenuBar)&&z.cfg.getProperty(T)==P){z.hide();}else{if(z.cfg.getProperty(Y)>0){z._cancelShowDelay();}if(z.activeItem){z.activeItem.blur();z.activeItem.cfg.setProperty(J,false);z.activeItem=null;}}}}}else{if(w.type==R){m=s;}}}}function f(t,s,u){if(c[u.id]){this.removeMenu(u);}}function j(t,s){var u=s[1];if(u){k=u;}}function i(t,s){k=null;}function b(t,s,v){if(v&&v.focus){try{v.focus();}catch(u){}}this.hideEvent.unsubscribe(b,v);}function l(t,s){if(this===this.getRoot()&&this.cfg.getProperty(T)===P){this.hideEvent.subscribe(b,m);this.focus();}}function g(u,t){var s=t[0],v=this.id;if(s){r[v]=this;}else{if(r[v]){delete r[v];}}}function h(t,s){p(this);}function p(t){var s=t.id;if(s&&d[s]){if(k==t){k=null;}delete d[s];t.destroyEvent.unsubscribe(h);}}function e(t,s){var v=s[0],u;if(v instanceof YAHOO.widget.MenuItem){u=v.id;if(!d[u]){d[u]=v;v.destroyEvent.subscribe(h);}}}return{addMenu:function(t){var s;if(t instanceof YAHOO.widget.Menu&&t.id&&!c[t.id]){c[t.id]=t;if(!a){s=document;Z.on(s,D,q,this,true);Z.on(s,F,q,this,true);Z.on(s,U,q,this,true);Z.on(s,G,q,this,true);Z.on(s,V,q,this,true);Z.on(s,B,q,this,true);Z.on(s,M,q,this,true);Z.on(s,I,q,this,true);Z.onFocus(s,q,this,true);Z.onBlur(s,q,this,true);a=true;}t.cfg.subscribeToConfigEvent(E,g);t.destroyEvent.subscribe(f,t,this);t.itemAddedEvent.subscribe(e);t.focusEvent.subscribe(j);t.blurEvent.subscribe(i);t.showEvent.subscribe(l);}},removeMenu:function(v){var t,s,u;if(v){t=v.id;if((t in c)&&(c[t]==v)){s=v.getItems();if(s&&s.length>0){u=s.length-1;do{p(s[u]);}while(u--);}delete c[t];if((t in r)&&(r[t]==v)){delete r[t];}if(v.cfg){v.cfg.unsubscribeFromConfigEvent(E,g);}v.destroyEvent.unsubscribe(f,v);v.itemAddedEvent.unsubscribe(e);v.focusEvent.unsubscribe(j);v.blurEvent.unsubscribe(i);}}},hideVisible:function(){var s;for(var t in r){if(H.hasOwnProperty(r,t)){s=r[t];if(!(s instanceof YAHOO.widget.MenuBar)&&s.cfg.getProperty(T)==P){s.hide();}}}},getVisible:function(){return r;},getMenus:function(){return c;},getMenu:function(t){var s;if(t in c){s=c[t];}return s;},getMenuItem:function(t){var s;if(t in d){s=d[t];}return s;},getMenuItemGroup:function(w){var t=C.get(w),s,y,x,u,v;if(t&&t.tagName&&t.tagName.toUpperCase()==W){y=t.firstChild;if(y){s=[];do{u=y.id;if(u){x=this.getMenuItem(u);if(x){s[s.length]=x;}}}while((y=y.nextSibling));if(s.length>0){v=s;}}}return v;},getFocusedMenuItem:function(){return k;},getFocusedMenu:function(){var s;if(k){s=k.parent.getRoot();}return s;},toString:function(){return Q;}};}();})();(function(){var AN=YAHOO.lang,Ao="Menu",H="DIV",K="div",Ak="id",AI="SELECT",f="xy",R="y",Av="UL",L="ul",AK="first-of-type",l="LI",i="OPTGROUP",Ax="OPTION",Af="disabled",AY="none",z="selected",Ar="groupindex",j="index",O="submenu",As="visible",AX="hidedelay",Ab="position",AE="dynamic",C="static",Al=AE+","+C,Y="windows",Q="url",M="#",V="target",AU="maxheight",T="topscrollbar",y="bottomscrollbar",e="_",P=T+e+Af,E=y+e+Af,c="mousemove",At="showdelay",d="submenuhidedelay",AG="iframe",x="constraintoviewport",A2="preventcontextoverlap",AP="submenualignment",a="autosubmenudisplay",AD="clicktohide",h="container",k="scrollincrement",Ah="minscrollheight",A0="classname",Ae="shadow",Ap="keepopen",Ay="hd",D="hastitle",q="context",v="",Ai="mousedown",Ac="keydown",Am="height",U="width",AR="px",Aw="effect",AF="monitorresize",AW="display",AV="block",J="visibility",AA="absolute",AT="zindex",m="yui-menu-body-scrolled",AL="&#32;",Az=" ",Ag="mouseover",G="mouseout",AS="itemAdded",o="itemRemoved",AM="hidden",t="yui-menu-shadow",AH=t+"-visible",n=t+Az+AH;YAHOO.widget.Menu=function(A4,A3){if(A3){this.parent=A3.parent;this.lazyLoad=A3.lazyLoad||A3.lazyload;this.itemData=A3.itemData||A3.itemdata;}YAHOO.widget.Menu.superclass.constructor.call(this,A4,A3);};function B(A4){var A3=false;if(AN.isString(A4)){A3=(Al.indexOf((A4.toLowerCase()))!=-1);}return A3;}var g=YAHOO.util.Dom,AB=YAHOO.util.Event,Au=YAHOO.widget.Module,AC=YAHOO.widget.Overlay,s=YAHOO.widget.Menu,A1=YAHOO.widget.MenuManager,F=YAHOO.util.CustomEvent,Aq=YAHOO.env.ua,An,Aa=[["mouseOverEvent",Ag],["mouseOutEvent",G],["mouseDownEvent",Ai],["mouseUpEvent","mouseup"],["clickEvent","click"],["keyPressEvent","keypress"],["keyDownEvent",Ac],["keyUpEvent","keyup"],["focusEvent","focus"],["blurEvent","blur"],["itemAddedEvent",AS],["itemRemovedEvent",o]],AZ={key:As,value:false,validator:AN.isBoolean},AQ={key:x,value:true,validator:AN.isBoolean,supercedes:[AG,"x",R,f]},AJ={key:A2,value:true,validator:AN.isBoolean,supercedes:[x]},S={key:Ab,value:AE,validator:B,supercedes:[As,AG]},A={key:AP,value:["tl","tr"]},u={key:a,value:true,validator:AN.isBoolean,suppressEvent:true},Z={key:At,value:250,validator:AN.isNumber,suppressEvent:true},r={key:AX,value:0,validator:AN.isNumber,suppressEvent:true},w={key:d,value:250,validator:AN.isNumber,suppressEvent:true},p={key:AD,value:true,validator:AN.isBoolean,suppressEvent:true},AO={key:h,suppressEvent:true},Ad={key:k,value:1,validator:AN.isNumber,supercedes:[AU],suppressEvent:true},N={key:Ah,value:90,validator:AN.isNumber,supercedes:[AU],suppressEvent:true},X={key:AU,value:0,validator:AN.isNumber,supercedes:[AG],suppressEvent:true},W={key:A0,value:null,validator:AN.isString,suppressEvent:true},b={key:Af,value:false,validator:AN.isBoolean,suppressEvent:true},I={key:Ae,value:true,validator:AN.isBoolean,suppressEvent:true,supercedes:[As]},Aj={key:Ap,value:false,validator:AN.isBoolean};
YAHOO.lang.extend(s,AC,{CSS_CLASS_NAME:"yuimenu",ITEM_TYPE:null,GROUP_TITLE_TAG_NAME:"h6",OFF_SCREEN_POSITION:"-999em",_useHideDelay:false,_bHandledMouseOverEvent:false,_bHandledMouseOutEvent:false,_aGroupTitleElements:null,_aItemGroups:null,_aListElements:null,_nCurrentMouseX:0,_bStopMouseEventHandlers:false,_sClassName:null,lazyLoad:false,itemData:null,activeItem:null,parent:null,srcElement:null,init:function(A5,A4){this._aItemGroups=[];this._aListElements=[];this._aGroupTitleElements=[];if(!this.ITEM_TYPE){this.ITEM_TYPE=YAHOO.widget.MenuItem;}var A3;if(AN.isString(A5)){A3=g.get(A5);}else{if(A5.tagName){A3=A5;}}if(A3&&A3.tagName){switch(A3.tagName.toUpperCase()){case H:this.srcElement=A3;if(!A3.id){A3.setAttribute(Ak,g.generateId());}s.superclass.init.call(this,A3);this.beforeInitEvent.fire(s);break;case AI:this.srcElement=A3;s.superclass.init.call(this,g.generateId());this.beforeInitEvent.fire(s);break;}}else{s.superclass.init.call(this,A5);this.beforeInitEvent.fire(s);}if(this.element){g.addClass(this.element,this.CSS_CLASS_NAME);this.initEvent.subscribe(this._onInit);this.beforeRenderEvent.subscribe(this._onBeforeRender);this.renderEvent.subscribe(this._onRender);this.beforeShowEvent.subscribe(this._onBeforeShow);this.hideEvent.subscribe(this._onHide);this.showEvent.subscribe(this._onShow);this.beforeHideEvent.subscribe(this._onBeforeHide);this.mouseOverEvent.subscribe(this._onMouseOver);this.mouseOutEvent.subscribe(this._onMouseOut);this.clickEvent.subscribe(this._onClick);this.keyDownEvent.subscribe(this._onKeyDown);this.keyPressEvent.subscribe(this._onKeyPress);this.blurEvent.subscribe(this._onBlur);if((Aq.gecko&&Aq.gecko<1.9)||Aq.webkit){this.cfg.subscribeToConfigEvent(R,this._onYChange);}if(A4){this.cfg.applyConfig(A4,true);}A1.addMenu(this);this.initEvent.fire(s);}},_initSubTree:function(){var A4=this.srcElement,A3,A6,A9,BA,A8,A7,A5;if(A4){A3=(A4.tagName&&A4.tagName.toUpperCase());if(A3==H){BA=this.body.firstChild;if(BA){A6=0;A9=this.GROUP_TITLE_TAG_NAME.toUpperCase();do{if(BA&&BA.tagName){switch(BA.tagName.toUpperCase()){case A9:this._aGroupTitleElements[A6]=BA;break;case Av:this._aListElements[A6]=BA;this._aItemGroups[A6]=[];A6++;break;}}}while((BA=BA.nextSibling));if(this._aListElements[0]){g.addClass(this._aListElements[0],AK);}}}BA=null;if(A3){switch(A3){case H:A8=this._aListElements;A7=A8.length;if(A7>0){A5=A7-1;do{BA=A8[A5].firstChild;if(BA){do{if(BA&&BA.tagName&&BA.tagName.toUpperCase()==l){this.addItem(new this.ITEM_TYPE(BA,{parent:this}),A5);}}while((BA=BA.nextSibling));}}while(A5--);}break;case AI:BA=A4.firstChild;do{if(BA&&BA.tagName){switch(BA.tagName.toUpperCase()){case i:case Ax:this.addItem(new this.ITEM_TYPE(BA,{parent:this}));break;}}}while((BA=BA.nextSibling));break;}}}},_getFirstEnabledItem:function(){var A3=this.getItems(),A7=A3.length,A6,A5;for(var A4=0;A4<A7;A4++){A6=A3[A4];if(A6&&!A6.cfg.getProperty(Af)&&A6.element.style.display!=AY){A5=A6;break;}}return A5;},_addItemToGroup:function(A8,A9,BD){var BB,BE,A6,BC,A7,A4,A5,BA;function A3(BF,BG){return(BF[BG]||A3(BF,(BG+1)));}if(A9 instanceof this.ITEM_TYPE){BB=A9;BB.parent=this;}else{if(AN.isString(A9)){BB=new this.ITEM_TYPE(A9,{parent:this});}else{if(AN.isObject(A9)){A9.parent=this;BB=new this.ITEM_TYPE(A9.text,A9);}}}if(BB){if(BB.cfg.getProperty(z)){this.activeItem=BB;}BE=AN.isNumber(A8)?A8:0;A6=this._getItemGroup(BE);if(!A6){A6=this._createItemGroup(BE);}if(AN.isNumber(BD)){A7=(BD>=A6.length);if(A6[BD]){A6.splice(BD,0,BB);}else{A6[BD]=BB;}BC=A6[BD];if(BC){if(A7&&(!BC.element.parentNode||BC.element.parentNode.nodeType==11)){this._aListElements[BE].appendChild(BC.element);}else{A4=A3(A6,(BD+1));if(A4&&(!BC.element.parentNode||BC.element.parentNode.nodeType==11)){this._aListElements[BE].insertBefore(BC.element,A4.element);}}BC.parent=this;this._subscribeToItemEvents(BC);this._configureSubmenu(BC);this._updateItemProperties(BE);this.itemAddedEvent.fire(BC);this.changeContentEvent.fire();BA=BC;}}else{A5=A6.length;A6[A5]=BB;BC=A6[A5];if(BC){if(!g.isAncestor(this._aListElements[BE],BC.element)){this._aListElements[BE].appendChild(BC.element);}BC.element.setAttribute(Ar,BE);BC.element.setAttribute(j,A5);BC.parent=this;BC.index=A5;BC.groupIndex=BE;this._subscribeToItemEvents(BC);this._configureSubmenu(BC);if(A5===0){g.addClass(BC.element,AK);}this.itemAddedEvent.fire(BC);this.changeContentEvent.fire();BA=BC;}}}return BA;},_removeItemFromGroupByIndex:function(A6,A4){var A5=AN.isNumber(A6)?A6:0,A7=this._getItemGroup(A5),A9,A8,A3;if(A7){A9=A7.splice(A4,1);A8=A9[0];if(A8){this._updateItemProperties(A5);if(A7.length===0){A3=this._aListElements[A5];if(this.body&&A3){this.body.removeChild(A3);}this._aItemGroups.splice(A5,1);this._aListElements.splice(A5,1);A3=this._aListElements[0];if(A3){g.addClass(A3,AK);}}this.itemRemovedEvent.fire(A8);this.changeContentEvent.fire();}}return A8;},_removeItemFromGroupByValue:function(A6,A3){var A8=this._getItemGroup(A6),A9,A7,A5,A4;if(A8){A9=A8.length;A7=-1;if(A9>0){A4=A9-1;do{if(A8[A4]==A3){A7=A4;break;}}while(A4--);if(A7>-1){A5=this._removeItemFromGroupByIndex(A6,A7);}}}return A5;},_updateItemProperties:function(A4){var A5=this._getItemGroup(A4),A8=A5.length,A7,A6,A3;if(A8>0){A3=A8-1;do{A7=A5[A3];if(A7){A6=A7.element;A7.index=A3;A7.groupIndex=A4;A6.setAttribute(Ar,A4);A6.setAttribute(j,A3);g.removeClass(A6,AK);}}while(A3--);if(A6){g.addClass(A6,AK);}}},_createItemGroup:function(A5){var A3,A4;if(!this._aItemGroups[A5]){this._aItemGroups[A5]=[];A3=document.createElement(L);this._aListElements[A5]=A3;A4=this._aItemGroups[A5];}return A4;},_getItemGroup:function(A5){var A3=AN.isNumber(A5)?A5:0,A6=this._aItemGroups,A4;if(A3 in A6){A4=A6[A3];}return A4;},_configureSubmenu:function(A3){var A4=A3.cfg.getProperty(O);if(A4){this.cfg.configChangedEvent.subscribe(this._onParentMenuConfigChange,A4,true);this.renderEvent.subscribe(this._onParentMenuRender,A4,true);}},_subscribeToItemEvents:function(A3){A3.destroyEvent.subscribe(this._onMenuItemDestroy,A3,this);A3.cfg.configChangedEvent.subscribe(this._onMenuItemConfigChange,A3,this);
},_onVisibleChange:function(A5,A4){var A3=A4[0];if(A3){g.addClass(this.element,As);}else{g.removeClass(this.element,As);}},_cancelHideDelay:function(){var A3=this.getRoot()._hideDelayTimer;if(A3){A3.cancel();}},_execHideDelay:function(){this._cancelHideDelay();var A3=this.getRoot();A3._hideDelayTimer=AN.later(A3.cfg.getProperty(AX),this,function(){if(A3.activeItem){if(A3.hasFocus()){A3.activeItem.focus();}A3.clearActiveItem();}if(A3==this&&!(this instanceof YAHOO.widget.MenuBar)&&this.cfg.getProperty(Ab)==AE){this.hide();}});},_cancelShowDelay:function(){var A3=this.getRoot()._showDelayTimer;if(A3){A3.cancel();}},_execSubmenuHideDelay:function(A5,A4,A3){A5._submenuHideDelayTimer=AN.later(50,this,function(){if(this._nCurrentMouseX>(A4+10)){A5._submenuHideDelayTimer=AN.later(A3,A5,function(){this.hide();});}else{A5.hide();}});},_disableScrollHeader:function(){if(!this._bHeaderDisabled){g.addClass(this.header,P);this._bHeaderDisabled=true;}},_disableScrollFooter:function(){if(!this._bFooterDisabled){g.addClass(this.footer,E);this._bFooterDisabled=true;}},_enableScrollHeader:function(){if(this._bHeaderDisabled){g.removeClass(this.header,P);this._bHeaderDisabled=false;}},_enableScrollFooter:function(){if(this._bFooterDisabled){g.removeClass(this.footer,E);this._bFooterDisabled=false;}},_onMouseOver:function(BF,A8){var BG=A8[0],BC=A8[1],A3=AB.getTarget(BG),A7=this.getRoot(),BE=this._submenuHideDelayTimer,A4,A6,BB,A5,BA,A9;var BD=function(){if(this.parent.cfg.getProperty(z)){this.show();}};if(!this._bStopMouseEventHandlers){if(!this._bHandledMouseOverEvent&&(A3==this.element||g.isAncestor(this.element,A3))){if(this._useHideDelay){this._cancelHideDelay();}this._nCurrentMouseX=0;AB.on(this.element,c,this._onMouseMove,this,true);if(!(BC&&g.isAncestor(BC.element,AB.getRelatedTarget(BG)))){this.clearActiveItem();}if(this.parent&&BE){BE.cancel();this.parent.cfg.setProperty(z,true);A4=this.parent.parent;A4._bHandledMouseOutEvent=true;A4._bHandledMouseOverEvent=false;}this._bHandledMouseOverEvent=true;this._bHandledMouseOutEvent=false;}if(BC&&!BC.handledMouseOverEvent&&!BC.cfg.getProperty(Af)&&(A3==BC.element||g.isAncestor(BC.element,A3))){A6=this.cfg.getProperty(At);BB=(A6>0);if(BB){this._cancelShowDelay();}A5=this.activeItem;if(A5){A5.cfg.setProperty(z,false);}BA=BC.cfg;BA.setProperty(z,true);if(this.hasFocus()||A7._hasFocus){BC.focus();A7._hasFocus=false;}if(this.cfg.getProperty(a)){A9=BA.getProperty(O);if(A9){if(BB){A7._showDelayTimer=AN.later(A7.cfg.getProperty(At),A9,BD);}else{A9.show();}}}BC.handledMouseOverEvent=true;BC.handledMouseOutEvent=false;}}},_onMouseOut:function(BB,A5){var BC=A5[0],A9=A5[1],A6=AB.getRelatedTarget(BC),BA=false,A8,A7,A3,A4;if(!this._bStopMouseEventHandlers){if(A9&&!A9.cfg.getProperty(Af)){A8=A9.cfg;A7=A8.getProperty(O);if(A7&&(A6==A7.element||g.isAncestor(A7.element,A6))){BA=true;}if(!A9.handledMouseOutEvent&&((A6!=A9.element&&!g.isAncestor(A9.element,A6))||BA)){if(!BA){A9.cfg.setProperty(z,false);if(A7){A3=this.cfg.getProperty(d);A4=this.cfg.getProperty(At);if(!(this instanceof YAHOO.widget.MenuBar)&&A3>0&&A4>=A3){this._execSubmenuHideDelay(A7,AB.getPageX(BC),A3);}else{A7.hide();}}}A9.handledMouseOutEvent=true;A9.handledMouseOverEvent=false;}}if(!this._bHandledMouseOutEvent&&((A6!=this.element&&!g.isAncestor(this.element,A6))||BA)){if(this._useHideDelay){this._execHideDelay();}AB.removeListener(this.element,c,this._onMouseMove);this._nCurrentMouseX=AB.getPageX(BC);this._bHandledMouseOutEvent=true;this._bHandledMouseOverEvent=false;}}},_onMouseMove:function(A4,A3){if(!this._bStopMouseEventHandlers){this._nCurrentMouseX=AB.getPageX(A4);}},_onClick:function(BE,A5){var BF=A5[0],A9=A5[1],BB=false,A7,BC,A4,A3,A8,BA,BD;var A6=function(){if(!((Aq.gecko&&this.platform==Y)&&BF.button>0)){A4=this.getRoot();if(A4 instanceof YAHOO.widget.MenuBar||A4.cfg.getProperty(Ab)==C){A4.clearActiveItem();}else{A4.hide();}}};if(A9){if(A9.cfg.getProperty(Af)){AB.preventDefault(BF);A6.call(this);}else{A7=A9.cfg.getProperty(O);A8=A9.cfg.getProperty(Q);if(A8){BA=A8.indexOf(M);BD=A8.length;if(BA!=-1){A8=A8.substr(BA,BD);BD=A8.length;if(BD>1){A3=A8.substr(1,BD);BC=YAHOO.widget.MenuManager.getMenu(A3);if(BC){BB=(this.getRoot()===BC.getRoot());}}else{if(BD===1){BB=true;}}}}if(BB&&!A9.cfg.getProperty(V)){AB.preventDefault(BF);if(Aq.webkit){A9.focus();}else{A9.focusEvent.fire();}}if(!A7&&!this.cfg.getProperty(Ap)){A6.call(this);}}}},_onKeyDown:function(BH,BB){var BE=BB[0],BD=BB[1],BA,BF,A4,A8,BI,A3,BK,A7,BG,A6,BC,BJ,A9;if(this._useHideDelay){this._cancelHideDelay();}function A5(){this._bStopMouseEventHandlers=true;AN.later(10,this,function(){this._bStopMouseEventHandlers=false;});}if(BD&&!BD.cfg.getProperty(Af)){BF=BD.cfg;A4=this.parent;switch(BE.keyCode){case 38:case 40:BI=(BE.keyCode==38)?BD.getPreviousEnabledSibling():BD.getNextEnabledSibling();if(BI){this.clearActiveItem();BI.cfg.setProperty(z,true);BI.focus();if(this.cfg.getProperty(AU)>0){A3=this.body;BK=A3.scrollTop;A7=A3.offsetHeight;BG=this.getItems();A6=BG.length-1;BC=BI.element.offsetTop;if(BE.keyCode==40){if(BC>=(A7+BK)){A3.scrollTop=BC-A7;}else{if(BC<=BK){A3.scrollTop=0;}}if(BI==BG[A6]){A3.scrollTop=BI.element.offsetTop;}}else{if(BC<=BK){A3.scrollTop=BC-BI.element.offsetHeight;}else{if(BC>=(BK+A7)){A3.scrollTop=BC;}}if(BI==BG[0]){A3.scrollTop=0;}}BK=A3.scrollTop;BJ=A3.scrollHeight-A3.offsetHeight;if(BK===0){this._disableScrollHeader();this._enableScrollFooter();}else{if(BK==BJ){this._enableScrollHeader();this._disableScrollFooter();}else{this._enableScrollHeader();this._enableScrollFooter();}}}}AB.preventDefault(BE);A5();break;case 39:BA=BF.getProperty(O);if(BA){if(!BF.getProperty(z)){BF.setProperty(z,true);}BA.show();BA.setInitialFocus();BA.setInitialSelection();}else{A8=this.getRoot();if(A8 instanceof YAHOO.widget.MenuBar){BI=A8.activeItem.getNextEnabledSibling();if(BI){A8.clearActiveItem();BI.cfg.setProperty(z,true);BA=BI.cfg.getProperty(O);if(BA){BA.show();BA.setInitialFocus();}else{BI.focus();}}}}AB.preventDefault(BE);A5();break;case 37:if(A4){A9=A4.parent;
if(A9 instanceof YAHOO.widget.MenuBar){BI=A9.activeItem.getPreviousEnabledSibling();if(BI){A9.clearActiveItem();BI.cfg.setProperty(z,true);BA=BI.cfg.getProperty(O);if(BA){BA.show();BA.setInitialFocus();}else{BI.focus();}}}else{this.hide();A4.focus();}}AB.preventDefault(BE);A5();break;}}if(BE.keyCode==27){if(this.cfg.getProperty(Ab)==AE){this.hide();if(this.parent){this.parent.focus();}}else{if(this.activeItem){BA=this.activeItem.cfg.getProperty(O);if(BA&&BA.cfg.getProperty(As)){BA.hide();this.activeItem.focus();}else{this.activeItem.blur();this.activeItem.cfg.setProperty(z,false);}}}AB.preventDefault(BE);}},_onKeyPress:function(A5,A4){var A3=A4[0];if(A3.keyCode==40||A3.keyCode==38){AB.preventDefault(A3);}},_onBlur:function(A4,A3){if(this._hasFocus){this._hasFocus=false;}},_onYChange:function(A4,A3){var A6=this.parent,A8,A5,A7;if(A6){A8=A6.parent.body.scrollTop;if(A8>0){A7=(this.cfg.getProperty(R)-A8);g.setY(this.element,A7);A5=this.iframe;if(A5){g.setY(A5,A7);}this.cfg.setProperty(R,A7,true);}}},_onScrollTargetMouseOver:function(A9,BC){var BB=this._bodyScrollTimer;if(BB){BB.cancel();}this._cancelHideDelay();var A5=AB.getTarget(A9),A7=this.body,A6=this.cfg.getProperty(k),A3,A4;function BA(){var BD=A7.scrollTop;if(BD<A3){A7.scrollTop=(BD+A6);this._enableScrollHeader();}else{A7.scrollTop=A3;this._bodyScrollTimer.cancel();this._disableScrollFooter();}}function A8(){var BD=A7.scrollTop;if(BD>0){A7.scrollTop=(BD-A6);this._enableScrollFooter();}else{A7.scrollTop=0;this._bodyScrollTimer.cancel();this._disableScrollHeader();}}if(g.hasClass(A5,Ay)){A4=A8;}else{A3=A7.scrollHeight-A7.offsetHeight;A4=BA;}this._bodyScrollTimer=AN.later(10,this,A4,null,true);},_onScrollTargetMouseOut:function(A5,A3){var A4=this._bodyScrollTimer;if(A4){A4.cancel();}this._cancelHideDelay();},_onInit:function(A4,A3){this.cfg.subscribeToConfigEvent(As,this._onVisibleChange);var A5=!this.parent,A6=this.lazyLoad;if(((A5&&!A6)||(A5&&(this.cfg.getProperty(As)||this.cfg.getProperty(Ab)==C))||(!A5&&!A6))&&this.getItemGroups().length===0){if(this.srcElement){this._initSubTree();}if(this.itemData){this.addItems(this.itemData);}}else{if(A6){this.cfg.fireQueue();}}},_onBeforeRender:function(A6,A5){var A7=this.element,BA=this._aListElements.length,A4=true,A9=0,A3,A8;if(BA>0){do{A3=this._aListElements[A9];if(A3){if(A4){g.addClass(A3,AK);A4=false;}if(!g.isAncestor(A7,A3)){this.appendToBody(A3);}A8=this._aGroupTitleElements[A9];if(A8){if(!g.isAncestor(A7,A8)){A3.parentNode.insertBefore(A8,A3);}g.addClass(A3,D);}}A9++;}while(A9<BA);}},_onRender:function(A4,A3){if(this.cfg.getProperty(Ab)==AE){if(!this.cfg.getProperty(As)){this.positionOffScreen();}}},_onBeforeShow:function(A5,A4){var A7,BA,A6,A8=this.cfg.getProperty(h);if(this.lazyLoad&&this.getItemGroups().length===0){if(this.srcElement){this._initSubTree();}if(this.itemData){if(this.parent&&this.parent.parent&&this.parent.parent.srcElement&&this.parent.parent.srcElement.tagName.toUpperCase()==AI){A7=this.itemData.length;for(BA=0;BA<A7;BA++){if(this.itemData[BA].tagName){this.addItem((new this.ITEM_TYPE(this.itemData[BA])));}}}else{this.addItems(this.itemData);}}A6=this.srcElement;if(A6){if(A6.tagName.toUpperCase()==AI){if(g.inDocument(A6)){this.render(A6.parentNode);}else{this.render(A8);}}else{this.render();}}else{if(this.parent){this.render(this.parent.element);}else{this.render(A8);}}}var A9=this.parent,A3;if(!A9&&this.cfg.getProperty(Ab)==AE){this.cfg.refireEvent(f);}if(A9){A3=A9.parent.cfg.getProperty(AP);this.cfg.setProperty(q,[A9.element,A3[0],A3[1]]);this.align();}},getConstrainedY:function(BF){var BQ=this,BM=BQ.cfg.getProperty(q),BT=BQ.cfg.getProperty(AU),BP,BE={"trbr":true,"tlbl":true,"bltl":true,"brtr":true},A8=(BM&&BE[BM[1]+BM[2]]),BA=BQ.element,BU=BA.offsetHeight,BO=AC.VIEWPORT_OFFSET,BJ=g.getViewportHeight(),BN=g.getDocumentScrollTop(),BK=(BQ.cfg.getProperty(Ah)+BO<BJ),BS,BB,BH,BI,BD=false,BC,A5,BG=BN+BO,A7=BN+BJ-BU-BO,A3=BF;var A9=function(){var BV;if((BQ.cfg.getProperty(R)-BN)>BH){BV=(BH-BU);}else{BV=(BH+BI);}BQ.cfg.setProperty(R,(BV+BN),true);return BV;};var A6=function(){if((BQ.cfg.getProperty(R)-BN)>BH){return(A5-BO);}else{return(BC-BO);}};var BL=function(){var BV;if((BQ.cfg.getProperty(R)-BN)>BH){BV=(BH+BI);}else{BV=(BH-BA.offsetHeight);}BQ.cfg.setProperty(R,(BV+BN),true);};var A4=function(){BQ._setScrollHeight(this.cfg.getProperty(AU));BQ.hideEvent.unsubscribe(A4);};var BR=function(){var BY=A6(),BV=(BQ.getItems().length>0),BX,BW;if(BU>BY){BX=BV?BQ.cfg.getProperty(Ah):BU;if((BY>BX)&&BV){BP=BY;}else{BP=BT;}BQ._setScrollHeight(BP);BQ.hideEvent.subscribe(A4);BL();if(BY<BX){if(BD){A9();}else{A9();BD=true;BW=BR();}}}else{if(BP&&(BP!==BT)){BQ._setScrollHeight(BT);BQ.hideEvent.subscribe(A4);BL();}}return BW;};if(BF<BG||BF>A7){if(BK){if(BQ.cfg.getProperty(A2)&&A8){BB=BM[0];BI=BB.offsetHeight;BH=(g.getY(BB)-BN);BC=BH;A5=(BJ-(BH+BI));BR();A3=BQ.cfg.getProperty(R);}else{if(!(BQ instanceof YAHOO.widget.MenuBar)&&BU>=BJ){BS=(BJ-(BO*2));if(BS>BQ.cfg.getProperty(Ah)){BQ._setScrollHeight(BS);BQ.hideEvent.subscribe(A4);BL();A3=BQ.cfg.getProperty(R);}}else{if(BF<BG){A3=BG;}else{if(BF>A7){A3=A7;}}}}}else{A3=BO+BN;}}return A3;},_onHide:function(A4,A3){if(this.cfg.getProperty(Ab)===AE){this.positionOffScreen();}},_onShow:function(BB,A9){var A3=this.parent,A5,A6,A8,A4;function A7(BD){var BC;if(BD.type==Ai||(BD.type==Ac&&BD.keyCode==27)){BC=AB.getTarget(BD);if(BC!=A5.element||!g.isAncestor(A5.element,BC)){A5.cfg.setProperty(a,false);AB.removeListener(document,Ai,A7);AB.removeListener(document,Ac,A7);}}}function BA(BD,BC,BE){this.cfg.setProperty(U,v);this.hideEvent.unsubscribe(BA,BE);}if(A3){A5=A3.parent;if(!A5.cfg.getProperty(a)&&(A5 instanceof YAHOO.widget.MenuBar||A5.cfg.getProperty(Ab)==C)){A5.cfg.setProperty(a,true);AB.on(document,Ai,A7);AB.on(document,Ac,A7);}if((this.cfg.getProperty("x")<A5.cfg.getProperty("x"))&&(Aq.gecko&&Aq.gecko<1.9)&&!this.cfg.getProperty(U)){A6=this.element;A8=A6.offsetWidth;A6.style.width=A8+AR;A4=(A8-(A6.offsetWidth-A8))+AR;this.cfg.setProperty(U,A4);this.hideEvent.subscribe(BA,A4);
}}},_onBeforeHide:function(A5,A4){var A3=this.activeItem,A7=this.getRoot(),A8,A6;if(A3){A8=A3.cfg;A8.setProperty(z,false);A6=A8.getProperty(O);if(A6){A6.hide();}}if(Aq.ie&&this.cfg.getProperty(Ab)===AE&&this.parent){A7._hasFocus=this.hasFocus();}if(A7==this){A7.blur();}},_onParentMenuConfigChange:function(A4,A3,A7){var A5=A3[0][0],A6=A3[0][1];switch(A5){case AG:case x:case AX:case At:case d:case AD:case Aw:case A0:case k:case AU:case Ah:case AF:case Ae:case A2:A7.cfg.setProperty(A5,A6);break;case AP:if(!(this.parent.parent instanceof YAHOO.widget.MenuBar)){A7.cfg.setProperty(A5,A6);}break;}},_onParentMenuRender:function(A4,A3,A9){var A6=A9.parent.parent,A5=A6.cfg,A7={constraintoviewport:A5.getProperty(x),xy:[0,0],clicktohide:A5.getProperty(AD),effect:A5.getProperty(Aw),showdelay:A5.getProperty(At),hidedelay:A5.getProperty(AX),submenuhidedelay:A5.getProperty(d),classname:A5.getProperty(A0),scrollincrement:A5.getProperty(k),maxheight:A5.getProperty(AU),minscrollheight:A5.getProperty(Ah),iframe:A5.getProperty(AG),shadow:A5.getProperty(Ae),preventcontextoverlap:A5.getProperty(A2),monitorresize:A5.getProperty(AF)},A8;if(!(A6 instanceof YAHOO.widget.MenuBar)){A7[AP]=A5.getProperty(AP);}A9.cfg.applyConfig(A7);if(!this.lazyLoad){A8=this.parent.element;if(this.element.parentNode==A8){this.render();}else{this.render(A8);}}},_onMenuItemDestroy:function(A5,A4,A3){this._removeItemFromGroupByValue(A3.groupIndex,A3);},_onMenuItemConfigChange:function(A5,A4,A3){var A7=A4[0][0],A8=A4[0][1],A6;switch(A7){case z:if(A8===true){this.activeItem=A3;}break;case O:A6=A4[0][1];if(A6){this._configureSubmenu(A3);}break;}},configVisible:function(A5,A4,A6){var A3,A7;if(this.cfg.getProperty(Ab)==AE){s.superclass.configVisible.call(this,A5,A4,A6);}else{A3=A4[0];A7=g.getStyle(this.element,AW);g.setStyle(this.element,J,As);if(A3){if(A7!=AV){this.beforeShowEvent.fire();g.setStyle(this.element,AW,AV);this.showEvent.fire();}}else{if(A7==AV){this.beforeHideEvent.fire();g.setStyle(this.element,AW,AY);this.hideEvent.fire();}}}},configPosition:function(A5,A4,A8){var A7=this.element,A6=A4[0]==C?C:AA,A9=this.cfg,A3;g.setStyle(A7,Ab,A6);if(A6==C){g.setStyle(A7,AW,AV);A9.setProperty(As,true);}else{g.setStyle(A7,J,AM);}if(A6==AA){A3=A9.getProperty(AT);if(!A3||A3===0){A9.setProperty(AT,1);}}},configIframe:function(A4,A3,A5){if(this.cfg.getProperty(Ab)==AE){s.superclass.configIframe.call(this,A4,A3,A5);}},configHideDelay:function(A4,A3,A5){var A6=A3[0];this._useHideDelay=(A6>0);},configContainer:function(A4,A3,A6){var A5=A3[0];if(AN.isString(A5)){this.cfg.setProperty(h,g.get(A5),true);}},_clearSetWidthFlag:function(){this._widthSetForScroll=false;this.cfg.unsubscribeFromConfigEvent(U,this._clearSetWidthFlag);},_setScrollHeight:function(BE){var BA=BE,A9=false,BF=false,A6,A7,BD,A4,BC,BG,A3,BB,A8,A5;if(this.getItems().length>0){A6=this.element;A7=this.body;BD=this.header;A4=this.footer;BC=this._onScrollTargetMouseOver;BG=this._onScrollTargetMouseOut;A3=this.cfg.getProperty(Ah);if(BA>0&&BA<A3){BA=A3;}g.setStyle(A7,Am,v);g.removeClass(A7,m);A7.scrollTop=0;BF=((Aq.gecko&&Aq.gecko<1.9)||Aq.ie);if(BA>0&&BF&&!this.cfg.getProperty(U)){A8=A6.offsetWidth;A6.style.width=A8+AR;A5=(A8-(A6.offsetWidth-A8))+AR;this.cfg.unsubscribeFromConfigEvent(U,this._clearSetWidthFlag);this.cfg.setProperty(U,A5);this._widthSetForScroll=true;this.cfg.subscribeToConfigEvent(U,this._clearSetWidthFlag);}if(BA>0&&(!BD&&!A4)){this.setHeader(AL);this.setFooter(AL);BD=this.header;A4=this.footer;g.addClass(BD,T);g.addClass(A4,y);A6.insertBefore(BD,A7);A6.appendChild(A4);}BB=BA;if(BD&&A4){BB=(BB-(BD.offsetHeight+A4.offsetHeight));}if((BB>0)&&(A7.offsetHeight>BA)){g.addClass(A7,m);g.setStyle(A7,Am,(BB+AR));if(!this._hasScrollEventHandlers){AB.on(BD,Ag,BC,this,true);AB.on(BD,G,BG,this,true);AB.on(A4,Ag,BC,this,true);AB.on(A4,G,BG,this,true);this._hasScrollEventHandlers=true;}this._disableScrollHeader();this._enableScrollFooter();A9=true;}else{if(BD&&A4){if(this._widthSetForScroll){this._widthSetForScroll=false;this.cfg.unsubscribeFromConfigEvent(U,this._clearSetWidthFlag);this.cfg.setProperty(U,v);}this._enableScrollHeader();this._enableScrollFooter();if(this._hasScrollEventHandlers){AB.removeListener(BD,Ag,BC);AB.removeListener(BD,G,BG);AB.removeListener(A4,Ag,BC);AB.removeListener(A4,G,BG);this._hasScrollEventHandlers=false;}A6.removeChild(BD);A6.removeChild(A4);this.header=null;this.footer=null;A9=true;}}if(A9){this.cfg.refireEvent(AG);this.cfg.refireEvent(Ae);}}},_setMaxHeight:function(A4,A3,A5){this._setScrollHeight(A5);this.renderEvent.unsubscribe(this._setMaxHeight);},configMaxHeight:function(A4,A3,A5){var A6=A3[0];if(this.lazyLoad&&!this.body&&A6>0){this.renderEvent.subscribe(this._setMaxHeight,A6,this);}else{this._setScrollHeight(A6);}},configClassName:function(A5,A4,A6){var A3=A4[0];if(this._sClassName){g.removeClass(this.element,this._sClassName);}g.addClass(this.element,A3);this._sClassName=A3;},_onItemAdded:function(A4,A3){var A5=A3[0];if(A5){A5.cfg.setProperty(Af,true);}},configDisabled:function(A5,A4,A8){var A7=A4[0],A3=this.getItems(),A9,A6;if(AN.isArray(A3)){A9=A3.length;if(A9>0){A6=A9-1;do{A3[A6].cfg.setProperty(Af,A7);}while(A6--);}if(A7){this.clearActiveItem(true);g.addClass(this.element,Af);this.itemAddedEvent.subscribe(this._onItemAdded);}else{g.removeClass(this.element,Af);this.itemAddedEvent.unsubscribe(this._onItemAdded);}}},configShadow:function(BB,A5,BA){var A9=function(){var BE=this.element,BD=this._shadow;if(BD&&BE){if(BD.style.width&&BD.style.height){BD.style.width=v;BD.style.height=v;}BD.style.width=(BE.offsetWidth+6)+AR;BD.style.height=(BE.offsetHeight+1)+AR;}};var BC=function(){this.element.appendChild(this._shadow);};var A7=function(){g.addClass(this._shadow,AH);};var A8=function(){g.removeClass(this._shadow,AH);};var A4=function(){var BE=this._shadow,BD;if(!BE){BD=this.element;if(!An){An=document.createElement(K);An.className=n;}BE=An.cloneNode(false);BD.appendChild(BE);this._shadow=BE;this.beforeShowEvent.subscribe(A7);this.beforeHideEvent.subscribe(A8);
if(Aq.ie){AN.later(0,this,function(){A9.call(this);this.syncIframe();});this.cfg.subscribeToConfigEvent(U,A9);this.cfg.subscribeToConfigEvent(Am,A9);this.cfg.subscribeToConfigEvent(AU,A9);this.changeContentEvent.subscribe(A9);Au.textResizeEvent.subscribe(A9,this,true);this.destroyEvent.subscribe(function(){Au.textResizeEvent.unsubscribe(A9,this);});}this.cfg.subscribeToConfigEvent(AU,BC);}};var A6=function(){if(this._shadow){BC.call(this);if(Aq.ie){A9.call(this);}}else{A4.call(this);}this.beforeShowEvent.unsubscribe(A6);};var A3=A5[0];if(A3&&this.cfg.getProperty(Ab)==AE){if(this.cfg.getProperty(As)){if(this._shadow){BC.call(this);if(Aq.ie){A9.call(this);}}else{A4.call(this);}}else{this.beforeShowEvent.subscribe(A6);}}},initEvents:function(){s.superclass.initEvents.call(this);var A4=Aa.length-1,A5,A3;do{A5=Aa[A4];A3=this.createEvent(A5[1]);A3.signature=F.LIST;this[A5[0]]=A3;}while(A4--);},positionOffScreen:function(){var A4=this.iframe,A5=this.element,A3=this.OFF_SCREEN_POSITION;A5.style.top=v;A5.style.left=v;if(A4){A4.style.top=A3;A4.style.left=A3;}},getRoot:function(){var A5=this.parent,A4,A3;if(A5){A4=A5.parent;A3=A4?A4.getRoot():this;}else{A3=this;}return A3;},toString:function(){var A4=Ao,A3=this.id;if(A3){A4+=(Az+A3);}return A4;},setItemGroupTitle:function(A8,A7){var A6,A5,A4,A3;if(AN.isString(A8)&&A8.length>0){A6=AN.isNumber(A7)?A7:0;A5=this._aGroupTitleElements[A6];if(A5){A5.innerHTML=A8;}else{A5=document.createElement(this.GROUP_TITLE_TAG_NAME);A5.innerHTML=A8;this._aGroupTitleElements[A6]=A5;}A4=this._aGroupTitleElements.length-1;do{if(this._aGroupTitleElements[A4]){g.removeClass(this._aGroupTitleElements[A4],AK);A3=A4;}}while(A4--);if(A3!==null){g.addClass(this._aGroupTitleElements[A3],AK);}this.changeContentEvent.fire();}},addItem:function(A3,A4){return this._addItemToGroup(A4,A3);},addItems:function(A7,A6){var A9,A3,A8,A4,A5;if(AN.isArray(A7)){A9=A7.length;A3=[];for(A4=0;A4<A9;A4++){A8=A7[A4];if(A8){if(AN.isArray(A8)){A3[A3.length]=this.addItems(A8,A4);}else{A3[A3.length]=this._addItemToGroup(A6,A8);}}}if(A3.length){A5=A3;}}return A5;},insertItem:function(A3,A4,A5){return this._addItemToGroup(A5,A3,A4);},removeItem:function(A3,A5){var A6,A4;if(!AN.isUndefined(A3)){if(A3 instanceof YAHOO.widget.MenuItem){A6=this._removeItemFromGroupByValue(A5,A3);}else{if(AN.isNumber(A3)){A6=this._removeItemFromGroupByIndex(A5,A3);}}if(A6){A6.destroy();A4=A6;}}return A4;},getItems:function(){var A6=this._aItemGroups,A4,A5,A3=[];if(AN.isArray(A6)){A4=A6.length;A5=((A4==1)?A6[0]:(Array.prototype.concat.apply(A3,A6)));}return A5;},getItemGroups:function(){return this._aItemGroups;},getItem:function(A4,A5){var A6,A3;if(AN.isNumber(A4)){A6=this._getItemGroup(A5);if(A6){A3=A6[A4];}}return A3;},getSubmenus:function(){var A4=this.getItems(),A8=A4.length,A3,A5,A7,A6;if(A8>0){A3=[];for(A6=0;A6<A8;A6++){A7=A4[A6];if(A7){A5=A7.cfg.getProperty(O);if(A5){A3[A3.length]=A5;}}}}return A3;},clearContent:function(){var A7=this.getItems(),A4=A7.length,A5=this.element,A6=this.body,BB=this.header,A3=this.footer,BA,A9,A8;if(A4>0){A8=A4-1;do{BA=A7[A8];if(BA){A9=BA.cfg.getProperty(O);if(A9){this.cfg.configChangedEvent.unsubscribe(this._onParentMenuConfigChange,A9);this.renderEvent.unsubscribe(this._onParentMenuRender,A9);}this.removeItem(BA,BA.groupIndex);}}while(A8--);}if(BB){AB.purgeElement(BB);A5.removeChild(BB);}if(A3){AB.purgeElement(A3);A5.removeChild(A3);}if(A6){AB.purgeElement(A6);A6.innerHTML=v;}this.activeItem=null;this._aItemGroups=[];this._aListElements=[];this._aGroupTitleElements=[];this.cfg.setProperty(U,null);},destroy:function(){this.clearContent();this._aItemGroups=null;this._aListElements=null;this._aGroupTitleElements=null;s.superclass.destroy.call(this);},setInitialFocus:function(){var A3=this._getFirstEnabledItem();if(A3){A3.focus();}},setInitialSelection:function(){var A3=this._getFirstEnabledItem();if(A3){A3.cfg.setProperty(z,true);}},clearActiveItem:function(A5){if(this.cfg.getProperty(At)>0){this._cancelShowDelay();}var A3=this.activeItem,A6,A4;if(A3){A6=A3.cfg;if(A5){A3.blur();this.getRoot()._hasFocus=true;}A6.setProperty(z,false);A4=A6.getProperty(O);if(A4){A4.hide();}this.activeItem=null;}},focus:function(){if(!this.hasFocus()){this.setInitialFocus();}},blur:function(){var A3;if(this.hasFocus()){A3=A1.getFocusedMenuItem();if(A3){A3.blur();}}},hasFocus:function(){return(A1.getFocusedMenu()==this.getRoot());},subscribe:function(){function A6(BB,BA,BD){var BE=BA[0],BC=BE.cfg.getProperty(O);if(BC){BC.subscribe.apply(BC,BD);}}function A9(BB,BA,BD){var BC=this.cfg.getProperty(O);if(BC){BC.subscribe.apply(BC,BD);}}s.superclass.subscribe.apply(this,arguments);s.superclass.subscribe.call(this,AS,A6,arguments);var A3=this.getItems(),A8,A7,A4,A5;if(A3){A8=A3.length;if(A8>0){A5=A8-1;do{A7=A3[A5];A4=A7.cfg.getProperty(O);if(A4){A4.subscribe.apply(A4,arguments);}else{A7.cfg.subscribeToConfigEvent(O,A9,arguments);}}while(A5--);}}},initDefaultConfig:function(){s.superclass.initDefaultConfig.call(this);var A3=this.cfg;A3.addProperty(AZ.key,{handler:this.configVisible,value:AZ.value,validator:AZ.validator});A3.addProperty(AQ.key,{handler:this.configConstrainToViewport,value:AQ.value,validator:AQ.validator,supercedes:AQ.supercedes});A3.addProperty(AJ.key,{value:AJ.value,validator:AJ.validator,supercedes:AJ.supercedes});A3.addProperty(S.key,{handler:this.configPosition,value:S.value,validator:S.validator,supercedes:S.supercedes});A3.addProperty(A.key,{value:A.value,suppressEvent:A.suppressEvent});A3.addProperty(u.key,{value:u.value,validator:u.validator,suppressEvent:u.suppressEvent});A3.addProperty(Z.key,{value:Z.value,validator:Z.validator,suppressEvent:Z.suppressEvent});A3.addProperty(r.key,{handler:this.configHideDelay,value:r.value,validator:r.validator,suppressEvent:r.suppressEvent});A3.addProperty(w.key,{value:w.value,validator:w.validator,suppressEvent:w.suppressEvent});A3.addProperty(p.key,{value:p.value,validator:p.validator,suppressEvent:p.suppressEvent});A3.addProperty(AO.key,{handler:this.configContainer,value:document.body,suppressEvent:AO.suppressEvent});
A3.addProperty(Ad.key,{value:Ad.value,validator:Ad.validator,supercedes:Ad.supercedes,suppressEvent:Ad.suppressEvent});A3.addProperty(N.key,{value:N.value,validator:N.validator,supercedes:N.supercedes,suppressEvent:N.suppressEvent});A3.addProperty(X.key,{handler:this.configMaxHeight,value:X.value,validator:X.validator,suppressEvent:X.suppressEvent,supercedes:X.supercedes});A3.addProperty(W.key,{handler:this.configClassName,value:W.value,validator:W.validator,supercedes:W.supercedes});A3.addProperty(b.key,{handler:this.configDisabled,value:b.value,validator:b.validator,suppressEvent:b.suppressEvent});A3.addProperty(I.key,{handler:this.configShadow,value:I.value,validator:I.validator});A3.addProperty(Aj.key,{value:Aj.value,validator:Aj.validator});}});})();(function(){YAHOO.widget.MenuItem=function(AS,AR){if(AS){if(AR){this.parent=AR.parent;this.value=AR.value;this.id=AR.id;}this.init(AS,AR);}};var x=YAHOO.util.Dom,j=YAHOO.widget.Module,AB=YAHOO.widget.Menu,c=YAHOO.widget.MenuItem,AK=YAHOO.util.CustomEvent,k=YAHOO.env.ua,AQ=YAHOO.lang,AL="text",O="#",Q="-",L="helptext",n="url",AH="target",A="emphasis",N="strongemphasis",b="checked",w="submenu",H="disabled",B="selected",P="hassubmenu",U="checked-disabled",AI="hassubmenu-disabled",AD="hassubmenu-selected",T="checked-selected",q="onclick",J="classname",AJ="",i="OPTION",v="OPTGROUP",K="LI",AE="href",r="SELECT",X="DIV",AN='<em class="helptext">',a="<em>",I="</em>",W="<strong>",y="</strong>",Y="preventcontextoverlap",h="obj",AG="scope",t="none",V="visible",E=" ",m="MenuItem",AA="click",D="show",M="hide",S="li",AF='<a href="#"></a>',p=[["mouseOverEvent","mouseover"],["mouseOutEvent","mouseout"],["mouseDownEvent","mousedown"],["mouseUpEvent","mouseup"],["clickEvent",AA],["keyPressEvent","keypress"],["keyDownEvent","keydown"],["keyUpEvent","keyup"],["focusEvent","focus"],["blurEvent","blur"],["destroyEvent","destroy"]],o={key:AL,value:AJ,validator:AQ.isString,suppressEvent:true},s={key:L,supercedes:[AL],suppressEvent:true},G={key:n,value:O,suppressEvent:true},AO={key:AH,suppressEvent:true},AP={key:A,value:false,validator:AQ.isBoolean,suppressEvent:true,supercedes:[AL]},d={key:N,value:false,validator:AQ.isBoolean,suppressEvent:true,supercedes:[AL]},l={key:b,value:false,validator:AQ.isBoolean,suppressEvent:true,supercedes:[H,B]},F={key:w,suppressEvent:true,supercedes:[H,B]},AM={key:H,value:false,validator:AQ.isBoolean,suppressEvent:true,supercedes:[AL,B]},f={key:B,value:false,validator:AQ.isBoolean,suppressEvent:true},u={key:q,suppressEvent:true},AC={key:J,value:null,validator:AQ.isString,suppressEvent:true},z={key:"keylistener",value:null,suppressEvent:true},C=null,e={};var Z=function(AU,AT){var AR=e[AU];if(!AR){e[AU]={};AR=e[AU];}var AS=AR[AT];if(!AS){AS=AU+Q+AT;AR[AT]=AS;}return AS;};var g=function(AR){x.addClass(this.element,Z(this.CSS_CLASS_NAME,AR));x.addClass(this._oAnchor,Z(this.CSS_LABEL_CLASS_NAME,AR));};var R=function(AR){x.removeClass(this.element,Z(this.CSS_CLASS_NAME,AR));x.removeClass(this._oAnchor,Z(this.CSS_LABEL_CLASS_NAME,AR));};c.prototype={CSS_CLASS_NAME:"yuimenuitem",CSS_LABEL_CLASS_NAME:"yuimenuitemlabel",SUBMENU_TYPE:null,_oAnchor:null,_oHelpTextEM:null,_oSubmenu:null,_oOnclickAttributeValue:null,_sClassName:null,constructor:c,index:null,groupIndex:null,parent:null,element:null,srcElement:null,value:null,browser:j.prototype.browser,id:null,init:function(AR,Ab){if(!this.SUBMENU_TYPE){this.SUBMENU_TYPE=AB;}this.cfg=new YAHOO.util.Config(this);this.initDefaultConfig();var AX=this.cfg,AY=O,AT,Aa,AZ,AS,AV,AU,AW;if(AQ.isString(AR)){this._createRootNodeStructure();AX.queueProperty(AL,AR);}else{if(AR&&AR.tagName){switch(AR.tagName.toUpperCase()){case i:this._createRootNodeStructure();AX.queueProperty(AL,AR.text);AX.queueProperty(H,AR.disabled);this.value=AR.value;this.srcElement=AR;break;case v:this._createRootNodeStructure();AX.queueProperty(AL,AR.label);AX.queueProperty(H,AR.disabled);this.srcElement=AR;this._initSubTree();break;case K:AZ=x.getFirstChild(AR);if(AZ){AY=AZ.getAttribute(AE,2);AS=AZ.getAttribute(AH);AV=AZ.innerHTML;}this.srcElement=AR;this.element=AR;this._oAnchor=AZ;AX.setProperty(AL,AV,true);AX.setProperty(n,AY,true);AX.setProperty(AH,AS,true);this._initSubTree();break;}}}if(this.element){AU=(this.srcElement||this.element).id;if(!AU){AU=this.id||x.generateId();this.element.id=AU;}this.id=AU;x.addClass(this.element,this.CSS_CLASS_NAME);x.addClass(this._oAnchor,this.CSS_LABEL_CLASS_NAME);AW=p.length-1;do{Aa=p[AW];AT=this.createEvent(Aa[1]);AT.signature=AK.LIST;this[Aa[0]]=AT;}while(AW--);if(Ab){AX.applyConfig(Ab);}AX.fireQueue();}},_createRootNodeStructure:function(){var AR,AS;if(!C){C=document.createElement(S);C.innerHTML=AF;}AR=C.cloneNode(true);AR.className=this.CSS_CLASS_NAME;AS=AR.firstChild;AS.className=this.CSS_LABEL_CLASS_NAME;this.element=AR;this._oAnchor=AS;},_initSubTree:function(){var AX=this.srcElement,AT=this.cfg,AV,AU,AS,AR,AW;if(AX.childNodes.length>0){if(this.parent.lazyLoad&&this.parent.srcElement&&this.parent.srcElement.tagName.toUpperCase()==r){AT.setProperty(w,{id:x.generateId(),itemdata:AX.childNodes});}else{AV=AX.firstChild;AU=[];do{if(AV&&AV.tagName){switch(AV.tagName.toUpperCase()){case X:AT.setProperty(w,AV);break;case i:AU[AU.length]=AV;break;}}}while((AV=AV.nextSibling));AS=AU.length;if(AS>0){AR=new this.SUBMENU_TYPE(x.generateId());AT.setProperty(w,AR);for(AW=0;AW<AS;AW++){AR.addItem((new AR.ITEM_TYPE(AU[AW])));}}}}},configText:function(Aa,AT,AV){var AS=AT[0],AU=this.cfg,AY=this._oAnchor,AR=AU.getProperty(L),AZ=AJ,AW=AJ,AX=AJ;if(AS){if(AR){AZ=AN+AR+I;}if(AU.getProperty(A)){AW=a;AX=I;}if(AU.getProperty(N)){AW=W;AX=y;}AY.innerHTML=(AW+AS+AX+AZ);}},configHelpText:function(AT,AS,AR){this.cfg.refireEvent(AL);},configURL:function(AT,AS,AR){var AV=AS[0];if(!AV){AV=O;}var AU=this._oAnchor;if(k.opera){AU.removeAttribute(AE);}AU.setAttribute(AE,AV);},configTarget:function(AU,AT,AS){var AR=AT[0],AV=this._oAnchor;if(AR&&AR.length>0){AV.setAttribute(AH,AR);}else{AV.removeAttribute(AH);}},configEmphasis:function(AT,AS,AR){var AV=AS[0],AU=this.cfg;
if(AV&&AU.getProperty(N)){AU.setProperty(N,false);}AU.refireEvent(AL);},configStrongEmphasis:function(AU,AT,AS){var AR=AT[0],AV=this.cfg;if(AR&&AV.getProperty(A)){AV.setProperty(A,false);}AV.refireEvent(AL);},configChecked:function(AT,AS,AR){var AV=AS[0],AU=this.cfg;if(AV){g.call(this,b);}else{R.call(this,b);}AU.refireEvent(AL);if(AU.getProperty(H)){AU.refireEvent(H);}if(AU.getProperty(B)){AU.refireEvent(B);}},configDisabled:function(AT,AS,AR){var AV=AS[0],AW=this.cfg,AU=AW.getProperty(w),AX=AW.getProperty(b);if(AV){if(AW.getProperty(B)){AW.setProperty(B,false);}g.call(this,H);if(AU){g.call(this,AI);}if(AX){g.call(this,U);}}else{R.call(this,H);if(AU){R.call(this,AI);}if(AX){R.call(this,U);}}},configSelected:function(AT,AS,AR){var AX=this.cfg,AW=this._oAnchor,AV=AS[0],AY=AX.getProperty(b),AU=AX.getProperty(w);if(k.opera){AW.blur();}if(AV&&!AX.getProperty(H)){g.call(this,B);if(AU){g.call(this,AD);}if(AY){g.call(this,T);}}else{R.call(this,B);if(AU){R.call(this,AD);}if(AY){R.call(this,T);}}if(this.hasFocus()&&k.opera){AW.focus();}},_onSubmenuBeforeHide:function(AU,AT){var AV=this.parent,AR;function AS(){AV._oAnchor.blur();AR.beforeHideEvent.unsubscribe(AS);}if(AV.hasFocus()){AR=AV.parent;AR.beforeHideEvent.subscribe(AS);}},configSubmenu:function(AY,AT,AW){var AV=AT[0],AU=this.cfg,AS=this.parent&&this.parent.lazyLoad,AX,AZ,AR;if(AV){if(AV instanceof AB){AX=AV;AX.parent=this;AX.lazyLoad=AS;}else{if(AQ.isObject(AV)&&AV.id&&!AV.nodeType){AZ=AV.id;AR=AV;AR.lazyload=AS;AR.parent=this;AX=new this.SUBMENU_TYPE(AZ,AR);AU.setProperty(w,AX,true);}else{AX=new this.SUBMENU_TYPE(AV,{lazyload:AS,parent:this});AU.setProperty(w,AX,true);}}if(AX){AX.cfg.setProperty(Y,true);g.call(this,P);if(AU.getProperty(n)===O){AU.setProperty(n,(O+AX.id));}this._oSubmenu=AX;if(k.opera){AX.beforeHideEvent.subscribe(this._onSubmenuBeforeHide);}}}else{R.call(this,P);if(this._oSubmenu){this._oSubmenu.destroy();}}if(AU.getProperty(H)){AU.refireEvent(H);}if(AU.getProperty(B)){AU.refireEvent(B);}},configOnClick:function(AT,AS,AR){var AU=AS[0];if(this._oOnclickAttributeValue&&(this._oOnclickAttributeValue!=AU)){this.clickEvent.unsubscribe(this._oOnclickAttributeValue.fn,this._oOnclickAttributeValue.obj);this._oOnclickAttributeValue=null;}if(!this._oOnclickAttributeValue&&AQ.isObject(AU)&&AQ.isFunction(AU.fn)){this.clickEvent.subscribe(AU.fn,((h in AU)?AU.obj:this),((AG in AU)?AU.scope:null));this._oOnclickAttributeValue=AU;}},configClassName:function(AU,AT,AS){var AR=AT[0];if(this._sClassName){x.removeClass(this.element,this._sClassName);}x.addClass(this.element,AR);this._sClassName=AR;},_dispatchClickEvent:function(){var AT=this,AS,AR;if(!AT.cfg.getProperty(H)){AS=x.getFirstChild(AT.element);if(k.ie){AS.fireEvent(q);}else{if((k.gecko&&k.gecko>=1.9)||k.opera||k.webkit){AR=document.createEvent("HTMLEvents");AR.initEvent(AA,true,true);}else{AR=document.createEvent("MouseEvents");AR.initMouseEvent(AA,true,true,window,0,0,0,0,0,false,false,false,false,0,null);}AS.dispatchEvent(AR);}}},_createKeyListener:function(AU,AT,AW){var AV=this,AS=AV.parent;var AR=new YAHOO.util.KeyListener(AS.element.ownerDocument,AW,{fn:AV._dispatchClickEvent,scope:AV,correctScope:true});if(AS.cfg.getProperty(V)){AR.enable();}AS.subscribe(D,AR.enable,null,AR);AS.subscribe(M,AR.disable,null,AR);AV._keyListener=AR;AS.unsubscribe(D,AV._createKeyListener,AW);},configKeyListener:function(AT,AS){var AV=AS[0],AU=this,AR=AU.parent;if(AU._keyData){AR.unsubscribe(D,AU._createKeyListener,AU._keyData);AU._keyData=null;}if(AU._keyListener){AR.unsubscribe(D,AU._keyListener.enable);AR.unsubscribe(M,AU._keyListener.disable);AU._keyListener.disable();AU._keyListener=null;}if(AV){AU._keyData=AV;AR.subscribe(D,AU._createKeyListener,AV,AU);}},initDefaultConfig:function(){var AR=this.cfg;AR.addProperty(o.key,{handler:this.configText,value:o.value,validator:o.validator,suppressEvent:o.suppressEvent});AR.addProperty(s.key,{handler:this.configHelpText,supercedes:s.supercedes,suppressEvent:s.suppressEvent});AR.addProperty(G.key,{handler:this.configURL,value:G.value,suppressEvent:G.suppressEvent});AR.addProperty(AO.key,{handler:this.configTarget,suppressEvent:AO.suppressEvent});AR.addProperty(AP.key,{handler:this.configEmphasis,value:AP.value,validator:AP.validator,suppressEvent:AP.suppressEvent,supercedes:AP.supercedes});AR.addProperty(d.key,{handler:this.configStrongEmphasis,value:d.value,validator:d.validator,suppressEvent:d.suppressEvent,supercedes:d.supercedes});AR.addProperty(l.key,{handler:this.configChecked,value:l.value,validator:l.validator,suppressEvent:l.suppressEvent,supercedes:l.supercedes});AR.addProperty(AM.key,{handler:this.configDisabled,value:AM.value,validator:AM.validator,suppressEvent:AM.suppressEvent});AR.addProperty(f.key,{handler:this.configSelected,value:f.value,validator:f.validator,suppressEvent:f.suppressEvent});AR.addProperty(F.key,{handler:this.configSubmenu,supercedes:F.supercedes,suppressEvent:F.suppressEvent});AR.addProperty(u.key,{handler:this.configOnClick,suppressEvent:u.suppressEvent});AR.addProperty(AC.key,{handler:this.configClassName,value:AC.value,validator:AC.validator,suppressEvent:AC.suppressEvent});AR.addProperty(z.key,{handler:this.configKeyListener,value:z.value,suppressEvent:z.suppressEvent});},getNextEnabledSibling:function(){var AU,AX,AR,AW,AV,AS;function AT(AY,AZ){return AY[AZ]||AT(AY,(AZ+1));}if(this.parent instanceof AB){AU=this.groupIndex;AX=this.parent.getItemGroups();if(this.index<(AX[AU].length-1)){AR=AT(AX[AU],(this.index+1));}else{if(AU<(AX.length-1)){AW=AU+1;}else{AW=0;}AV=AT(AX,AW);AR=AT(AV,0);}AS=(AR.cfg.getProperty(H)||AR.element.style.display==t)?AR.getNextEnabledSibling():AR;}return AS;},getPreviousEnabledSibling:function(){var AW,AY,AS,AR,AV,AU;function AX(AZ,Aa){return AZ[Aa]||AX(AZ,(Aa-1));}function AT(AZ,Aa){return AZ[Aa]?Aa:AT(AZ,(Aa+1));}if(this.parent instanceof AB){AW=this.groupIndex;AY=this.parent.getItemGroups();if(this.index>AT(AY[AW],0)){AS=AX(AY[AW],(this.index-1));}else{if(AW>AT(AY,0)){AR=AW-1;}else{AR=AY.length-1;
}AV=AX(AY,AR);AS=AX(AV,(AV.length-1));}AU=(AS.cfg.getProperty(H)||AS.element.style.display==t)?AS.getPreviousEnabledSibling():AS;}return AU;},focus:function(){var AU=this.parent,AT=this._oAnchor,AR=AU.activeItem;function AS(){try{if(!(k.ie&&!document.hasFocus())){if(AR){AR.blurEvent.fire();}AT.focus();this.focusEvent.fire();}}catch(AV){}}if(!this.cfg.getProperty(H)&&AU&&AU.cfg.getProperty(V)&&this.element.style.display!=t){AQ.later(0,this,AS);}},blur:function(){var AR=this.parent;if(!this.cfg.getProperty(H)&&AR&&AR.cfg.getProperty(V)){AQ.later(0,this,function(){try{this._oAnchor.blur();this.blurEvent.fire();}catch(AS){}},0);}},hasFocus:function(){return(YAHOO.widget.MenuManager.getFocusedMenuItem()==this);},destroy:function(){var AT=this.element,AS,AR,AV,AU;if(AT){AS=this.cfg.getProperty(w);if(AS){AS.destroy();}AR=AT.parentNode;if(AR){AR.removeChild(AT);this.destroyEvent.fire();}AU=p.length-1;do{AV=p[AU];this[AV[0]].unsubscribeAll();}while(AU--);this.cfg.configChangedEvent.unsubscribeAll();}},toString:function(){var AS=m,AR=this.id;if(AR){AS+=(E+AR);}return AS;}};AQ.augmentProto(c,YAHOO.util.EventProvider);})();(function(){var B="xy",C="mousedown",F="ContextMenu",J=" ";YAHOO.widget.ContextMenu=function(L,K){YAHOO.widget.ContextMenu.superclass.constructor.call(this,L,K);};var I=YAHOO.util.Event,E=YAHOO.env.ua,G=YAHOO.widget.ContextMenu,A={"TRIGGER_CONTEXT_MENU":"triggerContextMenu","CONTEXT_MENU":(E.opera?C:"contextmenu"),"CLICK":"click"},H={key:"trigger",suppressEvent:true};function D(L,K,M){this.cfg.setProperty(B,M);this.beforeShowEvent.unsubscribe(D,M);}YAHOO.lang.extend(G,YAHOO.widget.Menu,{_oTrigger:null,_bCancelled:false,contextEventTarget:null,triggerContextMenuEvent:null,init:function(L,K){G.superclass.init.call(this,L);this.beforeInitEvent.fire(G);if(K){this.cfg.applyConfig(K,true);}this.initEvent.fire(G);},initEvents:function(){G.superclass.initEvents.call(this);this.triggerContextMenuEvent=this.createEvent(A.TRIGGER_CONTEXT_MENU);this.triggerContextMenuEvent.signature=YAHOO.util.CustomEvent.LIST;},cancel:function(){this._bCancelled=true;},_removeEventHandlers:function(){var K=this._oTrigger;if(K){I.removeListener(K,A.CONTEXT_MENU,this._onTriggerContextMenu);if(E.opera){I.removeListener(K,A.CLICK,this._onTriggerClick);}}},_onTriggerClick:function(L,K){if(L.ctrlKey){I.stopEvent(L);}},_onTriggerContextMenu:function(M,K){var L;if(!(M.type==C&&!M.ctrlKey)){this.contextEventTarget=I.getTarget(M);this.triggerContextMenuEvent.fire(M);if(!this._bCancelled){I.stopEvent(M);YAHOO.widget.MenuManager.hideVisible();L=I.getXY(M);if(!YAHOO.util.Dom.inDocument(this.element)){this.beforeShowEvent.subscribe(D,L);}else{this.cfg.setProperty(B,L);}this.show();}this._bCancelled=false;}},toString:function(){var L=F,K=this.id;if(K){L+=(J+K);}return L;},initDefaultConfig:function(){G.superclass.initDefaultConfig.call(this);this.cfg.addProperty(H.key,{handler:this.configTrigger,suppressEvent:H.suppressEvent});},destroy:function(){this._removeEventHandlers();G.superclass.destroy.call(this);},configTrigger:function(L,K,N){var M=K[0];if(M){if(this._oTrigger){this._removeEventHandlers();}this._oTrigger=M;I.on(M,A.CONTEXT_MENU,this._onTriggerContextMenu,this,true);if(E.opera){I.on(M,A.CLICK,this._onTriggerClick,this,true);}}else{this._removeEventHandlers();}}});}());YAHOO.widget.ContextMenuItem=YAHOO.widget.MenuItem;(function(){var D=YAHOO.lang,N="static",M="dynamic,"+N,A="disabled",F="selected",B="autosubmenudisplay",G="submenu",C="visible",Q=" ",H="submenutoggleregion",P="MenuBar";YAHOO.widget.MenuBar=function(T,S){YAHOO.widget.MenuBar.superclass.constructor.call(this,T,S);};function O(T){var S=false;if(D.isString(T)){S=(M.indexOf((T.toLowerCase()))!=-1);}return S;}var R=YAHOO.util.Event,L=YAHOO.widget.MenuBar,K={key:"position",value:N,validator:O,supercedes:[C]},E={key:"submenualignment",value:["tl","bl"]},J={key:B,value:false,validator:D.isBoolean,suppressEvent:true},I={key:H,value:false,validator:D.isBoolean};D.extend(L,YAHOO.widget.Menu,{init:function(T,S){if(!this.ITEM_TYPE){this.ITEM_TYPE=YAHOO.widget.MenuBarItem;}L.superclass.init.call(this,T);this.beforeInitEvent.fire(L);if(S){this.cfg.applyConfig(S,true);}this.initEvent.fire(L);},CSS_CLASS_NAME:"yuimenubar",SUBMENU_TOGGLE_REGION_WIDTH:20,_onKeyDown:function(U,T,Y){var S=T[0],Z=T[1],W,X,V;if(Z&&!Z.cfg.getProperty(A)){X=Z.cfg;switch(S.keyCode){case 37:case 39:if(Z==this.activeItem&&!X.getProperty(F)){X.setProperty(F,true);}else{V=(S.keyCode==37)?Z.getPreviousEnabledSibling():Z.getNextEnabledSibling();if(V){this.clearActiveItem();V.cfg.setProperty(F,true);W=V.cfg.getProperty(G);if(W){W.show();W.setInitialFocus();}else{V.focus();}}}R.preventDefault(S);break;case 40:if(this.activeItem!=Z){this.clearActiveItem();X.setProperty(F,true);Z.focus();}W=X.getProperty(G);if(W){if(W.cfg.getProperty(C)){W.setInitialSelection();W.setInitialFocus();}else{W.show();W.setInitialFocus();}}R.preventDefault(S);break;}}if(S.keyCode==27&&this.activeItem){W=this.activeItem.cfg.getProperty(G);if(W&&W.cfg.getProperty(C)){W.hide();this.activeItem.focus();}else{this.activeItem.cfg.setProperty(F,false);this.activeItem.blur();}R.preventDefault(S);}},_onClick:function(e,Y,b){L.superclass._onClick.call(this,e,Y,b);var d=Y[1],T=true,S,f,U,W,Z,a,c,V;var X=function(){if(a.cfg.getProperty(C)){a.hide();}else{a.show();}};if(d&&!d.cfg.getProperty(A)){f=Y[0];U=R.getTarget(f);W=this.activeItem;Z=this.cfg;if(W&&W!=d){this.clearActiveItem();}d.cfg.setProperty(F,true);a=d.cfg.getProperty(G);if(a){S=d.element;c=YAHOO.util.Dom.getX(S);V=c+(S.offsetWidth-this.SUBMENU_TOGGLE_REGION_WIDTH);if(Z.getProperty(H)){if(R.getPageX(f)>V){X();R.preventDefault(f);T=false;}}else{X();}}}return T;},configSubmenuToggle:function(U,T){var S=T[0];if(S){this.cfg.setProperty(B,false);}},toString:function(){var T=P,S=this.id;if(S){T+=(Q+S);}return T;},initDefaultConfig:function(){L.superclass.initDefaultConfig.call(this);var S=this.cfg;S.addProperty(K.key,{handler:this.configPosition,value:K.value,validator:K.validator,supercedes:K.supercedes});
S.addProperty(E.key,{value:E.value,suppressEvent:E.suppressEvent});S.addProperty(J.key,{value:J.value,validator:J.validator,suppressEvent:J.suppressEvent});S.addProperty(I.key,{value:I.value,validator:I.validator,handler:this.configSubmenuToggle});}});}());YAHOO.widget.MenuBarItem=function(B,A){YAHOO.widget.MenuBarItem.superclass.constructor.call(this,B,A);};YAHOO.lang.extend(YAHOO.widget.MenuBarItem,YAHOO.widget.MenuItem,{init:function(B,A){if(!this.SUBMENU_TYPE){this.SUBMENU_TYPE=YAHOO.widget.Menu;}YAHOO.widget.MenuBarItem.superclass.init.call(this,B);var C=this.cfg;if(A){C.applyConfig(A,true);}C.fireQueue();},CSS_CLASS_NAME:"yuimenubaritem",CSS_LABEL_CLASS_NAME:"yuimenubaritemlabel",toString:function(){var A="MenuBarItem";if(this.cfg&&this.cfg.getProperty("text")){A+=(": "+this.cfg.getProperty("text"));}return A;}});YAHOO.register("menu",YAHOO.widget.Menu,{version:"2.7.0",build:"1796"});/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
(function(){var G=YAHOO.util.Dom,M=YAHOO.util.Event,I=YAHOO.lang,L=YAHOO.env.ua,B=YAHOO.widget.Overlay,J=YAHOO.widget.Menu,D={},K=null,E=null,C=null;function F(O,N,R,P){var S,Q;if(I.isString(O)&&I.isString(N)){if(L.ie){Q='<input type="'+O+'" name="'+N+'"';if(P){Q+=" checked";}Q+=">";S=document.createElement(Q);}else{S=document.createElement("input");S.name=N;S.type=O;if(P){S.checked=true;}}S.value=R;}return S;}function H(O,U){var N=O.nodeName.toUpperCase(),S=this,T,P,Q;function V(W){if(!(W in U)){T=O.getAttributeNode(W);if(T&&("value" in T)){U[W]=T.value;}}}function R(){V("type");if(U.type=="button"){U.type="push";}if(!("disabled" in U)){U.disabled=O.disabled;}V("name");V("value");V("title");}switch(N){case"A":U.type="link";V("href");V("target");break;case"INPUT":R();if(!("checked" in U)){U.checked=O.checked;}break;case"BUTTON":R();P=O.parentNode.parentNode;if(G.hasClass(P,this.CSS_CLASS_NAME+"-checked")){U.checked=true;}if(G.hasClass(P,this.CSS_CLASS_NAME+"-disabled")){U.disabled=true;}O.removeAttribute("value");O.setAttribute("type","button");break;}O.removeAttribute("id");O.removeAttribute("name");if(!("tabindex" in U)){U.tabindex=O.tabIndex;}if(!("label" in U)){Q=N=="INPUT"?O.value:O.innerHTML;if(Q&&Q.length>0){U.label=Q;}}}function A(P){var O=P.attributes,N=O.srcelement,R=N.nodeName.toUpperCase(),Q=this;if(R==this.NODE_NAME){P.element=N;P.id=N.id;G.getElementsBy(function(S){switch(S.nodeName.toUpperCase()){case"BUTTON":case"A":case"INPUT":H.call(Q,S,O);break;}},"*",N);}else{switch(R){case"BUTTON":case"A":case"INPUT":H.call(this,N,O);break;}}}YAHOO.widget.Button=function(R,O){if(!B&&YAHOO.widget.Overlay){B=YAHOO.widget.Overlay;}if(!J&&YAHOO.widget.Menu){J=YAHOO.widget.Menu;}var Q=YAHOO.widget.Button.superclass.constructor,P,N;if(arguments.length==1&&!I.isString(R)&&!R.nodeName){if(!R.id){R.id=G.generateId();}Q.call(this,(this.createButtonElement(R.type)),R);}else{P={element:null,attributes:(O||{})};if(I.isString(R)){N=G.get(R);if(N){if(!P.attributes.id){P.attributes.id=R;}P.attributes.srcelement=N;A.call(this,P);if(!P.element){P.element=this.createButtonElement(P.attributes.type);}Q.call(this,P.element,P.attributes);}}else{if(R.nodeName){if(!P.attributes.id){if(R.id){P.attributes.id=R.id;}else{P.attributes.id=G.generateId();}}P.attributes.srcelement=R;A.call(this,P);if(!P.element){P.element=this.createButtonElement(P.attributes.type);}Q.call(this,P.element,P.attributes);}}}};YAHOO.extend(YAHOO.widget.Button,YAHOO.util.Element,{_button:null,_menu:null,_hiddenFields:null,_onclickAttributeValue:null,_activationKeyPressed:false,_activationButtonPressed:false,_hasKeyEventHandlers:false,_hasMouseEventHandlers:false,_nOptionRegionX:0,NODE_NAME:"SPAN",CHECK_ACTIVATION_KEYS:[32],ACTIVATION_KEYS:[13,32],OPTION_AREA_WIDTH:20,CSS_CLASS_NAME:"yui-button",RADIO_DEFAULT_TITLE:"Unchecked.  Click to check.",RADIO_CHECKED_TITLE:"Checked.  Click another button to uncheck",CHECKBOX_DEFAULT_TITLE:"Unchecked.  Click to check.",CHECKBOX_CHECKED_TITLE:"Checked.  Click to uncheck.",MENUBUTTON_DEFAULT_TITLE:"Menu collapsed.  Click to expand.",MENUBUTTON_MENU_VISIBLE_TITLE:"Menu expanded.  Click or press Esc to collapse.",SPLITBUTTON_DEFAULT_TITLE:("Menu collapsed.  Click inside option "+"region or press down arrow key to show the menu."),SPLITBUTTON_OPTION_VISIBLE_TITLE:"Menu expanded.  Press Esc to hide the menu.",SUBMIT_TITLE:"Click to submit form.",_setType:function(N){if(N=="split"){this.on("option",this._onOption);}},_setLabel:function(O){this._button.innerHTML=O;var P,N=L.gecko;if(N&&N<1.9&&G.inDocument(this.get("element"))){P=this.CSS_CLASS_NAME;this.removeClass(P);I.later(0,this,this.addClass,P);}},_setTabIndex:function(N){this._button.tabIndex=N;},_setTitle:function(O){var N=O;if(this.get("type")!="link"){if(!N){switch(this.get("type")){case"radio":N=this.RADIO_DEFAULT_TITLE;break;case"checkbox":N=this.CHECKBOX_DEFAULT_TITLE;break;case"menu":N=this.MENUBUTTON_DEFAULT_TITLE;break;case"split":N=this.SPLITBUTTON_DEFAULT_TITLE;break;case"submit":N=this.SUBMIT_TITLE;break;}}this._button.title=N;}},_setDisabled:function(N){if(this.get("type")!="link"){if(N){if(this._menu){this._menu.hide();}if(this.hasFocus()){this.blur();}this._button.setAttribute("disabled","disabled");this.addStateCSSClasses("disabled");this.removeStateCSSClasses("hover");this.removeStateCSSClasses("active");this.removeStateCSSClasses("focus");}else{this._button.removeAttribute("disabled");this.removeStateCSSClasses("disabled");}}},_setHref:function(N){if(this.get("type")=="link"){this._button.href=N;}},_setTarget:function(N){if(this.get("type")=="link"){this._button.setAttribute("target",N);}},_setChecked:function(O){var P=this.get("type"),N;if(P=="checkbox"||P=="radio"){if(O){this.addStateCSSClasses("checked");N=(P=="radio")?this.RADIO_CHECKED_TITLE:this.CHECKBOX_CHECKED_TITLE;}else{this.removeStateCSSClasses("checked");N=(P=="radio")?this.RADIO_DEFAULT_TITLE:this.CHECKBOX_DEFAULT_TITLE;}if(!this._hasDefaultTitle){this.set("title",N);}}},_setMenu:function(U){var P=this.get("lazyloadmenu"),R=this.get("element"),N,W=false,X,O,Q;function V(){X.render(R.parentNode);this.removeListener("appendTo",V);}function T(){X.cfg.queueProperty("container",R.parentNode);this.removeListener("appendTo",T);}function S(){var Y;if(X){G.addClass(X.element,this.get("menuclassname"));G.addClass(X.element,"yui-"+this.get("type")+"-button-menu");X.showEvent.subscribe(this._onMenuShow,null,this);X.hideEvent.subscribe(this._onMenuHide,null,this);X.renderEvent.subscribe(this._onMenuRender,null,this);if(J&&X instanceof J){if(P){Y=this.get("container");if(Y){X.cfg.queueProperty("container",Y);}else{this.on("appendTo",T);}}X.cfg.queueProperty("clicktohide",false);X.keyDownEvent.subscribe(this._onMenuKeyDown,this,true);X.subscribe("click",this._onMenuClick,this,true);this.on("selectedMenuItemChange",this._onSelectedMenuItemChange);Q=X.srcElement;if(Q&&Q.nodeName.toUpperCase()=="SELECT"){Q.style.display="none";Q.parentNode.removeChild(Q);}}else{if(B&&X instanceof B){if(!K){K=new YAHOO.widget.OverlayManager();
}K.register(X);}}this._menu=X;if(!W&&!P){if(G.inDocument(R)){X.render(R.parentNode);}else{this.on("appendTo",V);}}}}if(B){if(J){N=J.prototype.CSS_CLASS_NAME;}if(U&&J&&(U instanceof J)){X=U;W=true;S.call(this);}else{if(B&&U&&(U instanceof B)){X=U;W=true;X.cfg.queueProperty("visible",false);S.call(this);}else{if(J&&I.isArray(U)){X=new J(G.generateId(),{lazyload:P,itemdata:U});this._menu=X;this.on("appendTo",S);}else{if(I.isString(U)){O=G.get(U);if(O){if(J&&G.hasClass(O,N)||O.nodeName.toUpperCase()=="SELECT"){X=new J(U,{lazyload:P});S.call(this);}else{if(B){X=new B(U,{visible:false});S.call(this);}}}}else{if(U&&U.nodeName){if(J&&G.hasClass(U,N)||U.nodeName.toUpperCase()=="SELECT"){X=new J(U,{lazyload:P});S.call(this);}else{if(B){if(!U.id){G.generateId(U);}X=new B(U,{visible:false});S.call(this);}}}}}}}}},_setOnClick:function(N){if(this._onclickAttributeValue&&(this._onclickAttributeValue!=N)){this.removeListener("click",this._onclickAttributeValue.fn);this._onclickAttributeValue=null;}if(!this._onclickAttributeValue&&I.isObject(N)&&I.isFunction(N.fn)){this.on("click",N.fn,N.obj,N.scope);this._onclickAttributeValue=N;}},_isActivationKey:function(N){var S=this.get("type"),O=(S=="checkbox"||S=="radio")?this.CHECK_ACTIVATION_KEYS:this.ACTIVATION_KEYS,Q=O.length,R=false,P;if(Q>0){P=Q-1;do{if(N==O[P]){R=true;break;}}while(P--);}return R;},_isSplitButtonOptionKey:function(P){var O=(M.getCharCode(P)==40);var N=function(Q){M.preventDefault(Q);this.removeListener("keypress",N);};if(O){if(L.opera){this.on("keypress",N);}M.preventDefault(P);}return O;},_addListenersToForm:function(){var T=this.getForm(),S=YAHOO.widget.Button.onFormKeyPress,R,N,Q,P,O;if(T){M.on(T,"reset",this._onFormReset,null,this);M.on(T,"submit",this._onFormSubmit,null,this);N=this.get("srcelement");if(this.get("type")=="submit"||(N&&N.type=="submit")){Q=M.getListeners(T,"keypress");R=false;if(Q){P=Q.length;if(P>0){O=P-1;do{if(Q[O].fn==S){R=true;break;}}while(O--);}}if(!R){M.on(T,"keypress",S);}}}},_showMenu:function(R){if(YAHOO.widget.MenuManager){YAHOO.widget.MenuManager.hideVisible();}if(K){K.hideAll();}var N=this._menu,Q=this.get("menualignment"),P=this.get("focusmenu"),O;if(this._renderedMenu){N.cfg.setProperty("context",[this.get("element"),Q[0],Q[1]]);N.cfg.setProperty("preventcontextoverlap",true);N.cfg.setProperty("constraintoviewport",true);}else{N.cfg.queueProperty("context",[this.get("element"),Q[0],Q[1]]);N.cfg.queueProperty("preventcontextoverlap",true);N.cfg.queueProperty("constraintoviewport",true);}this.focus();if(J&&N&&(N instanceof J)){O=N.focus;N.focus=function(){};if(this._renderedMenu){N.cfg.setProperty("minscrollheight",this.get("menuminscrollheight"));N.cfg.setProperty("maxheight",this.get("menumaxheight"));}else{N.cfg.queueProperty("minscrollheight",this.get("menuminscrollheight"));N.cfg.queueProperty("maxheight",this.get("menumaxheight"));}N.show();N.focus=O;N.align();if(R.type=="mousedown"){M.stopPropagation(R);}if(P){N.focus();}}else{if(B&&N&&(N instanceof B)){if(!this._renderedMenu){N.render(this.get("element").parentNode);}N.show();N.align();}}},_hideMenu:function(){var N=this._menu;if(N){N.hide();}},_onMouseOver:function(O){var Q=this.get("type"),N,P;if(Q==="split"){N=this.get("element");P=(G.getX(N)+(N.offsetWidth-this.OPTION_AREA_WIDTH));this._nOptionRegionX=P;}if(!this._hasMouseEventHandlers){if(Q==="split"){this.on("mousemove",this._onMouseMove);}this.on("mouseout",this._onMouseOut);this._hasMouseEventHandlers=true;}this.addStateCSSClasses("hover");if(Q==="split"&&(M.getPageX(O)>P)){this.addStateCSSClasses("hoveroption");}if(this._activationButtonPressed){this.addStateCSSClasses("active");}if(this._bOptionPressed){this.addStateCSSClasses("activeoption");}if(this._activationButtonPressed||this._bOptionPressed){M.removeListener(document,"mouseup",this._onDocumentMouseUp);}},_onMouseMove:function(N){var O=this._nOptionRegionX;if(O){if(M.getPageX(N)>O){this.addStateCSSClasses("hoveroption");}else{this.removeStateCSSClasses("hoveroption");}}},_onMouseOut:function(N){var O=this.get("type");this.removeStateCSSClasses("hover");if(O!="menu"){this.removeStateCSSClasses("active");}if(this._activationButtonPressed||this._bOptionPressed){M.on(document,"mouseup",this._onDocumentMouseUp,null,this);}if(O==="split"&&(M.getPageX(N)>this._nOptionRegionX)){this.removeStateCSSClasses("hoveroption");}},_onDocumentMouseUp:function(P){this._activationButtonPressed=false;this._bOptionPressed=false;var Q=this.get("type"),N,O;if(Q=="menu"||Q=="split"){N=M.getTarget(P);O=this._menu.element;if(N!=O&&!G.isAncestor(O,N)){this.removeStateCSSClasses((Q=="menu"?"active":"activeoption"));this._hideMenu();}}M.removeListener(document,"mouseup",this._onDocumentMouseUp);},_onMouseDown:function(P){var Q,O=true;function N(){this._hideMenu();this.removeListener("mouseup",N);}if((P.which||P.button)==1){if(!this.hasFocus()){this.focus();}Q=this.get("type");if(Q=="split"){if(M.getPageX(P)>this._nOptionRegionX){this.fireEvent("option",P);O=false;}else{this.addStateCSSClasses("active");this._activationButtonPressed=true;}}else{if(Q=="menu"){if(this.isActive()){this._hideMenu();this._activationButtonPressed=false;}else{this._showMenu(P);this._activationButtonPressed=true;}}else{this.addStateCSSClasses("active");this._activationButtonPressed=true;}}if(Q=="split"||Q=="menu"){this._hideMenuTimer=I.later(250,this,this.on,["mouseup",N]);}}return O;},_onMouseUp:function(P){var Q=this.get("type"),N=this._hideMenuTimer,O=true;if(N){N.cancel();}if(Q=="checkbox"||Q=="radio"){this.set("checked",!(this.get("checked")));}this._activationButtonPressed=false;if(Q!="menu"){this.removeStateCSSClasses("active");}if(Q=="split"&&M.getPageX(P)>this._nOptionRegionX){O=false;}return O;},_onFocus:function(O){var N;this.addStateCSSClasses("focus");if(this._activationKeyPressed){this.addStateCSSClasses("active");}C=this;if(!this._hasKeyEventHandlers){N=this._button;M.on(N,"blur",this._onBlur,null,this);M.on(N,"keydown",this._onKeyDown,null,this);M.on(N,"keyup",this._onKeyUp,null,this);
this._hasKeyEventHandlers=true;}this.fireEvent("focus",O);},_onBlur:function(N){this.removeStateCSSClasses("focus");if(this.get("type")!="menu"){this.removeStateCSSClasses("active");}if(this._activationKeyPressed){M.on(document,"keyup",this._onDocumentKeyUp,null,this);}C=null;this.fireEvent("blur",N);},_onDocumentKeyUp:function(N){if(this._isActivationKey(M.getCharCode(N))){this._activationKeyPressed=false;M.removeListener(document,"keyup",this._onDocumentKeyUp);}},_onKeyDown:function(O){var N=this._menu;if(this.get("type")=="split"&&this._isSplitButtonOptionKey(O)){this.fireEvent("option",O);}else{if(this._isActivationKey(M.getCharCode(O))){if(this.get("type")=="menu"){this._showMenu(O);}else{this._activationKeyPressed=true;this.addStateCSSClasses("active");}}}if(N&&N.cfg.getProperty("visible")&&M.getCharCode(O)==27){N.hide();this.focus();}},_onKeyUp:function(N){var O;if(this._isActivationKey(M.getCharCode(N))){O=this.get("type");if(O=="checkbox"||O=="radio"){this.set("checked",!(this.get("checked")));}this._activationKeyPressed=false;if(this.get("type")!="menu"){this.removeStateCSSClasses("active");}}},_onClick:function(Q){var S=this.get("type"),N,R,O,P;switch(S){case"radio":case"checkbox":if(!this._hasDefaultTitle){if(this.get("checked")){N=(S=="radio")?this.RADIO_CHECKED_TITLE:this.CHECKBOX_CHECKED_TITLE;}else{N=(S=="radio")?this.RADIO_DEFAULT_TITLE:this.CHECKBOX_DEFAULT_TITLE;}this.set("title",N);}break;case"submit":if(Q.returnValue!==false){this.submitForm();}break;case"reset":R=this.getForm();if(R){R.reset();}break;case"menu":N=this._menu.cfg.getProperty("visible")?this.MENUBUTTON_MENU_VISIBLE_TITLE:this.MENUBUTTON_DEFAULT_TITLE;this.set("title",N);break;case"split":if(this._nOptionRegionX>0&&(M.getPageX(Q)>this._nOptionRegionX)){P=false;}else{this._hideMenu();O=this.get("srcelement");if(O&&O.type=="submit"&&Q.returnValue!==false){this.submitForm();}}N=this._menu.cfg.getProperty("visible")?this.SPLITBUTTON_OPTION_VISIBLE_TITLE:this.SPLITBUTTON_DEFAULT_TITLE;this.set("title",N);break;}return P;},_onDblClick:function(O){var N=true;if(this.get("type")=="split"&&M.getPageX(O)>this._nOptionRegionX){N=false;}return N;},_onAppendTo:function(N){I.later(0,this,this._addListenersToForm);},_onFormReset:function(O){var P=this.get("type"),N=this._menu;if(P=="checkbox"||P=="radio"){this.resetValue("checked");}if(J&&N&&(N instanceof J)){this.resetValue("selectedMenuItem");}},_onFormSubmit:function(N){this.createHiddenFields();},_onDocumentMouseDown:function(Q){var N=M.getTarget(Q),P=this.get("element"),O=this._menu.element;if(N!=P&&!G.isAncestor(P,N)&&N!=O&&!G.isAncestor(O,N)){this._hideMenu();M.removeListener(document,"mousedown",this._onDocumentMouseDown);}},_onOption:function(N){if(this.hasClass("yui-split-button-activeoption")){this._hideMenu();this._bOptionPressed=false;}else{this._showMenu(N);this._bOptionPressed=true;}},_onMenuShow:function(O){M.on(document,"mousedown",this._onDocumentMouseDown,null,this);var N,P;if(this.get("type")=="split"){N=this.SPLITBUTTON_OPTION_VISIBLE_TITLE;P="activeoption";}else{N=this.MENUBUTTON_MENU_VISIBLE_TITLE;P="active";}this.addStateCSSClasses(P);this.set("title",N);},_onMenuHide:function(P){var O=this._menu,N,Q;if(this.get("type")=="split"){N=this.SPLITBUTTON_DEFAULT_TITLE;Q="activeoption";}else{N=this.MENUBUTTON_DEFAULT_TITLE;Q="active";}this.removeStateCSSClasses(Q);this.set("title",N);if(this.get("type")=="split"){this._bOptionPressed=false;}},_onMenuKeyDown:function(P,O){var N=O[0];if(M.getCharCode(N)==27){this.focus();if(this.get("type")=="split"){this._bOptionPressed=false;}}},_onMenuRender:function(P){var S=this.get("element"),O=S.parentNode,N=this._menu,R=N.element,Q=N.srcElement;if(O!=R.parentNode){O.appendChild(R);}this._renderedMenu=true;if(Q&&Q.nodeName.toLowerCase()==="select"&&Q.value){this.set("selectedMenuItem",N.getItem(Q.selectedIndex));}},_onMenuClick:function(O,N){var Q=N[1],P;if(Q){this.set("selectedMenuItem",Q);P=this.get("srcelement");if(P&&P.type=="submit"){this.submitForm();}this._hideMenu();}},_onSelectedMenuItemChange:function(N){var O=N.prevValue,P=N.newValue;if(O){G.removeClass(O.element,"yui-button-selectedmenuitem");}if(P){G.addClass(P.element,"yui-button-selectedmenuitem");}},createButtonElement:function(N){var P=this.NODE_NAME,O=document.createElement(P);O.innerHTML="<"+P+' class="first-child">'+(N=="link"?"<a></a>":'<button type="button"></button>')+"</"+P+">";return O;},addStateCSSClasses:function(N){var O=this.get("type");if(I.isString(N)){if(N!="activeoption"&&N!="hoveroption"){this.addClass(this.CSS_CLASS_NAME+("-"+N));}this.addClass("yui-"+O+("-button-"+N));}},removeStateCSSClasses:function(N){var O=this.get("type");if(I.isString(N)){this.removeClass(this.CSS_CLASS_NAME+("-"+N));this.removeClass("yui-"+O+("-button-"+N));}},createHiddenFields:function(){this.removeHiddenFields();var V=this.getForm(),Z,O,S,X,Y,T,U,N,R,W,P,Q=false;if(V&&!this.get("disabled")){O=this.get("type");S=(O=="checkbox"||O=="radio");if((S&&this.get("checked"))||(E==this)){Z=F((S?O:"hidden"),this.get("name"),this.get("value"),this.get("checked"));if(Z){if(S){Z.style.display="none";}V.appendChild(Z);}}X=this._menu;if(J&&X&&(X instanceof J)){Y=this.get("selectedMenuItem");P=X.srcElement;Q=(P&&P.nodeName.toUpperCase()=="SELECT");if(Y){U=(Y.value===null||Y.value==="")?Y.cfg.getProperty("text"):Y.value;T=this.get("name");if(Q){W=P.name;}else{if(T){W=(T+"_options");}}if(U&&W){N=F("hidden",W,U);V.appendChild(N);}}else{if(Q){V.appendChild(P);}}}if(Z&&N){this._hiddenFields=[Z,N];}else{if(!Z&&N){this._hiddenFields=N;}else{if(Z&&!N){this._hiddenFields=Z;}}}R=this._hiddenFields;}return R;},removeHiddenFields:function(){var Q=this._hiddenFields,O,P;function N(R){if(G.inDocument(R)){R.parentNode.removeChild(R);}}if(Q){if(I.isArray(Q)){O=Q.length;if(O>0){P=O-1;do{N(Q[P]);}while(P--);}}else{N(Q);}this._hiddenFields=null;}},submitForm:function(){var Q=this.getForm(),P=this.get("srcelement"),O=false,N;if(Q){if(this.get("type")=="submit"||(P&&P.type=="submit")){E=this;
}if(L.ie){O=Q.fireEvent("onsubmit");}else{N=document.createEvent("HTMLEvents");N.initEvent("submit",true,true);O=Q.dispatchEvent(N);}if((L.ie||L.webkit)&&O){Q.submit();}}return O;},init:function(O,a){var Q=a.type=="link"?"a":"button",V=a.srcelement,Z=O.getElementsByTagName(Q)[0],X;if(!Z){X=O.getElementsByTagName("input")[0];if(X){Z=document.createElement("button");Z.setAttribute("type","button");X.parentNode.replaceChild(Z,X);}}this._button=Z;this._hasDefaultTitle=(a.title&&a.title.length>0);YAHOO.widget.Button.superclass.init.call(this,O,a);var T=this.get("id"),N=T+"-button";Z.id=N;var U,W;var d=function(e){return(e.htmlFor===T);};var S=function(){W.setAttribute((L.ie?"htmlFor":"for"),N);};if(V&&this.get("type")!="link"){U=G.getElementsBy(d,"label");if(I.isArray(U)&&U.length>0){W=U[0];}}D[T]=this;this.addClass(this.CSS_CLASS_NAME);this.addClass("yui-"+this.get("type")+"-button");M.on(this._button,"focus",this._onFocus,null,this);this.on("mouseover",this._onMouseOver);this.on("mousedown",this._onMouseDown);this.on("mouseup",this._onMouseUp);this.on("click",this._onClick);var Y=this.get("onclick");this.set("onclick",null);this.set("onclick",Y);this.on("dblclick",this._onDblClick);if(W){this.on("appendTo",S);}this.on("appendTo",this._onAppendTo);var c=this.get("container"),P=this.get("element"),b=G.inDocument(P),R;if(c){if(V&&V!=P){R=V.parentNode;if(R){R.removeChild(V);}}if(I.isString(c)){M.onContentReady(c,this.appendTo,c,this);}else{this.on("init",function(){I.later(0,this,this.appendTo,c);});}}else{if(!b&&V&&V!=P){R=V.parentNode;if(R){this.fireEvent("beforeAppendTo",{type:"beforeAppendTo",target:R});R.replaceChild(P,V);this.fireEvent("appendTo",{type:"appendTo",target:R});}}else{if(this.get("type")!="link"&&b&&V&&V==P){this._addListenersToForm();}}}this.fireEvent("init",{type:"init",target:this});},initAttributes:function(O){var N=O||{};YAHOO.widget.Button.superclass.initAttributes.call(this,N);this.setAttributeConfig("type",{value:(N.type||"push"),validator:I.isString,writeOnce:true,method:this._setType});this.setAttributeConfig("label",{value:N.label,validator:I.isString,method:this._setLabel});this.setAttributeConfig("value",{value:N.value});this.setAttributeConfig("name",{value:N.name,validator:I.isString});this.setAttributeConfig("tabindex",{value:N.tabindex,validator:I.isNumber,method:this._setTabIndex});this.configureAttribute("title",{value:N.title,validator:I.isString,method:this._setTitle});this.setAttributeConfig("disabled",{value:(N.disabled||false),validator:I.isBoolean,method:this._setDisabled});this.setAttributeConfig("href",{value:N.href,validator:I.isString,method:this._setHref});this.setAttributeConfig("target",{value:N.target,validator:I.isString,method:this._setTarget});this.setAttributeConfig("checked",{value:(N.checked||false),validator:I.isBoolean,method:this._setChecked});this.setAttributeConfig("container",{value:N.container,writeOnce:true});this.setAttributeConfig("srcelement",{value:N.srcelement,writeOnce:true});this.setAttributeConfig("menu",{value:null,method:this._setMenu,writeOnce:true});this.setAttributeConfig("lazyloadmenu",{value:(N.lazyloadmenu===false?false:true),validator:I.isBoolean,writeOnce:true});this.setAttributeConfig("menuclassname",{value:(N.menuclassname||"yui-button-menu"),validator:I.isString,method:this._setMenuClassName,writeOnce:true});this.setAttributeConfig("menuminscrollheight",{value:(N.menuminscrollheight||90),validator:I.isNumber});this.setAttributeConfig("menumaxheight",{value:(N.menumaxheight||0),validator:I.isNumber});this.setAttributeConfig("menualignment",{value:(N.menualignment||["tl","bl"]),validator:I.isArray});this.setAttributeConfig("selectedMenuItem",{value:null});this.setAttributeConfig("onclick",{value:N.onclick,method:this._setOnClick});this.setAttributeConfig("focusmenu",{value:(N.focusmenu===false?false:true),validator:I.isBoolean});},focus:function(){if(!this.get("disabled")){this._button.focus();}},blur:function(){if(!this.get("disabled")){this._button.blur();}},hasFocus:function(){return(C==this);},isActive:function(){return this.hasClass(this.CSS_CLASS_NAME+"-active");},getMenu:function(){return this._menu;},getForm:function(){var N=this._button,O;if(N){O=N.form;}return O;},getHiddenFields:function(){return this._hiddenFields;},destroy:function(){var P=this.get("element"),O=P.parentNode,N=this._menu,R;if(N){if(K&&K.find(N)){K.remove(N);}N.destroy();}M.purgeElement(P);M.purgeElement(this._button);M.removeListener(document,"mouseup",this._onDocumentMouseUp);M.removeListener(document,"keyup",this._onDocumentKeyUp);M.removeListener(document,"mousedown",this._onDocumentMouseDown);var Q=this.getForm();if(Q){M.removeListener(Q,"reset",this._onFormReset);M.removeListener(Q,"submit",this._onFormSubmit);}this.unsubscribeAll();if(O){O.removeChild(P);}delete D[this.get("id")];R=G.getElementsByClassName(this.CSS_CLASS_NAME,this.NODE_NAME,Q);if(I.isArray(R)&&R.length===0){M.removeListener(Q,"keypress",YAHOO.widget.Button.onFormKeyPress);}},fireEvent:function(O,N){var P=arguments[0];if(this.DOM_EVENTS[P]&&this.get("disabled")){return false;}return YAHOO.widget.Button.superclass.fireEvent.apply(this,arguments);},toString:function(){return("Button "+this.get("id"));}});YAHOO.widget.Button.onFormKeyPress=function(R){var P=M.getTarget(R),S=M.getCharCode(R),Q=P.nodeName&&P.nodeName.toUpperCase(),N=P.type,T=false,V,X,O,W;function U(a){var Z,Y;switch(a.nodeName.toUpperCase()){case"INPUT":case"BUTTON":if(a.type=="submit"&&!a.disabled){if(!T&&!O){O=a;}}break;default:Z=a.id;if(Z){V=D[Z];if(V){T=true;if(!V.get("disabled")){Y=V.get("srcelement");if(!X&&(V.get("type")=="submit"||(Y&&Y.type=="submit"))){X=V;}}}}break;}}if(S==13&&((Q=="INPUT"&&(N=="text"||N=="password"||N=="checkbox"||N=="radio"||N=="file"))||Q=="SELECT")){G.getElementsBy(U,"*",this);if(O){O.focus();}else{if(!O&&X){M.preventDefault(R);if(L.ie){X.get("element").fireEvent("onclick");}else{W=document.createEvent("HTMLEvents");W.initEvent("click",true,true);if(L.gecko<1.9){X.fireEvent("click",W);
}else{X.get("element").dispatchEvent(W);}}}}}};YAHOO.widget.Button.addHiddenFieldsToForm=function(N){var S=G.getElementsByClassName(YAHOO.widget.Button.prototype.CSS_CLASS_NAME,"*",N),Q=S.length,R,O,P;if(Q>0){for(P=0;P<Q;P++){O=S[P].id;if(O){R=D[O];if(R){R.createHiddenFields();}}}}};YAHOO.widget.Button.getButton=function(N){return D[N];};})();(function(){var C=YAHOO.util.Dom,B=YAHOO.util.Event,D=YAHOO.lang,A=YAHOO.widget.Button,E={};YAHOO.widget.ButtonGroup=function(J,H){var I=YAHOO.widget.ButtonGroup.superclass.constructor,K,G,F;if(arguments.length==1&&!D.isString(J)&&!J.nodeName){if(!J.id){F=C.generateId();J.id=F;}I.call(this,(this._createGroupElement()),J);}else{if(D.isString(J)){G=C.get(J);if(G){if(G.nodeName.toUpperCase()==this.NODE_NAME){I.call(this,G,H);}}}else{K=J.nodeName.toUpperCase();if(K&&K==this.NODE_NAME){if(!J.id){J.id=C.generateId();}I.call(this,J,H);}}}};YAHOO.extend(YAHOO.widget.ButtonGroup,YAHOO.util.Element,{_buttons:null,NODE_NAME:"DIV",CSS_CLASS_NAME:"yui-buttongroup",_createGroupElement:function(){var F=document.createElement(this.NODE_NAME);return F;},_setDisabled:function(G){var H=this.getCount(),F;if(H>0){F=H-1;do{this._buttons[F].set("disabled",G);}while(F--);}},_onKeyDown:function(K){var G=B.getTarget(K),I=B.getCharCode(K),H=G.parentNode.parentNode.id,J=E[H],F=-1;if(I==37||I==38){F=(J.index===0)?(this._buttons.length-1):(J.index-1);}else{if(I==39||I==40){F=(J.index===(this._buttons.length-1))?0:(J.index+1);}}if(F>-1){this.check(F);this.getButton(F).focus();}},_onAppendTo:function(H){var I=this._buttons,G=I.length,F;for(F=0;F<G;F++){I[F].appendTo(this.get("element"));}},_onButtonCheckedChange:function(G,F){var I=G.newValue,H=this.get("checkedButton");if(I&&H!=F){if(H){H.set("checked",false,true);}this.set("checkedButton",F);this.set("value",F.get("value"));}else{if(H&&!H.set("checked")){H.set("checked",true,true);}}},init:function(I,H){this._buttons=[];YAHOO.widget.ButtonGroup.superclass.init.call(this,I,H);this.addClass(this.CSS_CLASS_NAME);var J=this.getElementsByClassName("yui-radio-button");if(J.length>0){this.addButtons(J);}function F(K){return(K.type=="radio");}J=C.getElementsBy(F,"input",this.get("element"));if(J.length>0){this.addButtons(J);}this.on("keydown",this._onKeyDown);this.on("appendTo",this._onAppendTo);var G=this.get("container");if(G){if(D.isString(G)){B.onContentReady(G,function(){this.appendTo(G);},null,this);}else{this.appendTo(G);}}},initAttributes:function(G){var F=G||{};YAHOO.widget.ButtonGroup.superclass.initAttributes.call(this,F);this.setAttributeConfig("name",{value:F.name,validator:D.isString});this.setAttributeConfig("disabled",{value:(F.disabled||false),validator:D.isBoolean,method:this._setDisabled});this.setAttributeConfig("value",{value:F.value});this.setAttributeConfig("container",{value:F.container,writeOnce:true});this.setAttributeConfig("checkedButton",{value:null});},addButton:function(J){var L,K,G,F,H,I;if(J instanceof A&&J.get("type")=="radio"){L=J;}else{if(!D.isString(J)&&!J.nodeName){J.type="radio";L=new A(J);}else{L=new A(J,{type:"radio"});}}if(L){F=this._buttons.length;H=L.get("name");I=this.get("name");L.index=F;this._buttons[F]=L;E[L.get("id")]=L;if(H!=I){L.set("name",I);}if(this.get("disabled")){L.set("disabled",true);}if(L.get("checked")){this.set("checkedButton",L);}K=L.get("element");G=this.get("element");if(K.parentNode!=G){G.appendChild(K);}L.on("checkedChange",this._onButtonCheckedChange,L,this);}return L;},addButtons:function(G){var H,I,J,F;if(D.isArray(G)){H=G.length;J=[];if(H>0){for(F=0;F<H;F++){I=this.addButton(G[F]);if(I){J[J.length]=I;}}}}return J;},removeButton:function(H){var I=this.getButton(H),G,F;if(I){this._buttons.splice(H,1);delete E[I.get("id")];I.removeListener("checkedChange",this._onButtonCheckedChange);I.destroy();G=this._buttons.length;if(G>0){F=this._buttons.length-1;do{this._buttons[F].index=F;}while(F--);}}},getButton:function(F){return this._buttons[F];},getButtons:function(){return this._buttons;},getCount:function(){return this._buttons.length;},focus:function(H){var I,G,F;if(D.isNumber(H)){I=this._buttons[H];if(I){I.focus();}}else{G=this.getCount();for(F=0;F<G;F++){I=this._buttons[F];if(!I.get("disabled")){I.focus();break;}}}},check:function(F){var G=this.getButton(F);if(G){G.set("checked",true);}},destroy:function(){var I=this._buttons.length,H=this.get("element"),F=H.parentNode,G;if(I>0){G=this._buttons.length-1;do{this._buttons[G].destroy();}while(G--);}B.purgeElement(H);F.removeChild(H);},toString:function(){return("ButtonGroup "+this.get("id"));}});})();YAHOO.register("button",YAHOO.widget.Button,{version:"2.7.0",build:"1796"});/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
YAHOO.namespace("util");YAHOO.util.Cookie={_createCookieString:function(B,D,C,A){var F=YAHOO.lang;var E=encodeURIComponent(B)+"="+(C?encodeURIComponent(D):D);if(F.isObject(A)){if(A.expires instanceof Date){E+="; expires="+A.expires.toGMTString();}if(F.isString(A.path)&&A.path!=""){E+="; path="+A.path;}if(F.isString(A.domain)&&A.domain!=""){E+="; domain="+A.domain;}if(A.secure===true){E+="; secure";}}return E;},_createCookieHashString:function(B){var D=YAHOO.lang;if(!D.isObject(B)){throw new TypeError("Cookie._createCookieHashString(): Argument must be an object.");}var C=new Array();for(var A in B){if(D.hasOwnProperty(B,A)&&!D.isFunction(B[A])&&!D.isUndefined(B[A])){C.push(encodeURIComponent(A)+"="+encodeURIComponent(String(B[A])));}}return C.join("&");},_parseCookieHash:function(E){var D=E.split("&"),F=null,C=new Object();if(E.length>0){for(var B=0,A=D.length;B<A;B++){F=D[B].split("=");C[decodeURIComponent(F[0])]=decodeURIComponent(F[1]);}}return C;},_parseCookieString:function(J,A){var K=new Object();if(YAHOO.lang.isString(J)&&J.length>0){var B=(A===false?function(L){return L;}:decodeURIComponent);if(/[^=]+=[^=;]?(?:; [^=]+=[^=]?)?/.test(J)){var H=J.split(/;\s/g),I=null,C=null,E=null;for(var D=0,F=H.length;D<F;D++){E=H[D].match(/([^=]+)=/i);if(E instanceof Array){try{I=decodeURIComponent(E[1]);C=B(H[D].substring(E[1].length+1));}catch(G){}}else{I=decodeURIComponent(H[D]);C=I;}K[I]=C;}}}return K;},get:function(A,B){var D=YAHOO.lang;var C=this._parseCookieString(document.cookie);if(!D.isString(A)||A===""){throw new TypeError("Cookie.get(): Cookie name must be a non-empty string.");}if(D.isUndefined(C[A])){return null;}if(!D.isFunction(B)){return C[A];}else{return B(C[A]);}},getSub:function(A,C,B){var E=YAHOO.lang;var D=this.getSubs(A);if(D!==null){if(!E.isString(C)||C===""){throw new TypeError("Cookie.getSub(): Subcookie name must be a non-empty string.");}if(E.isUndefined(D[C])){return null;}if(!E.isFunction(B)){return D[C];}else{return B(D[C]);}}else{return null;}},getSubs:function(A){if(!YAHOO.lang.isString(A)||A===""){throw new TypeError("Cookie.getSubs(): Cookie name must be a non-empty string.");}var B=this._parseCookieString(document.cookie,false);if(YAHOO.lang.isString(B[A])){return this._parseCookieHash(B[A]);}return null;},remove:function(B,A){if(!YAHOO.lang.isString(B)||B===""){throw new TypeError("Cookie.remove(): Cookie name must be a non-empty string.");}A=A||{};A.expires=new Date(0);return this.set(B,"",A);},removeSub:function(B,D,A){if(!YAHOO.lang.isString(B)||B===""){throw new TypeError("Cookie.removeSub(): Cookie name must be a non-empty string.");}if(!YAHOO.lang.isString(D)||D===""){throw new TypeError("Cookie.removeSub(): Subcookie name must be a non-empty string.");}var C=this.getSubs(B);if(YAHOO.lang.isObject(C)&&YAHOO.lang.hasOwnProperty(C,D)){delete C[D];return this.setSubs(B,C,A);}else{return"";}},set:function(B,C,A){var E=YAHOO.lang;if(!E.isString(B)){throw new TypeError("Cookie.set(): Cookie name must be a string.");}if(E.isUndefined(C)){throw new TypeError("Cookie.set(): Value cannot be undefined.");}var D=this._createCookieString(B,C,true,A);document.cookie=D;return D;},setSub:function(B,D,C,A){var F=YAHOO.lang;if(!F.isString(B)||B===""){throw new TypeError("Cookie.setSub(): Cookie name must be a non-empty string.");}if(!F.isString(D)||D===""){throw new TypeError("Cookie.setSub(): Subcookie name must be a non-empty string.");}if(F.isUndefined(C)){throw new TypeError("Cookie.setSub(): Subcookie value cannot be undefined.");}var E=this.getSubs(B);if(!F.isObject(E)){E=new Object();}E[D]=C;return this.setSubs(B,E,A);},setSubs:function(B,C,A){var E=YAHOO.lang;if(!E.isString(B)){throw new TypeError("Cookie.setSubs(): Cookie name must be a string.");}if(!E.isObject(C)){throw new TypeError("Cookie.setSubs(): Cookie value must be an object.");}var D=this._createCookieString(B,this._createCookieHashString(C),false,A);document.cookie=D;return D;}};YAHOO.register("cookie",YAHOO.util.Cookie,{version:"2.7.0",build:"1796"});/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
(function(){var E=YAHOO.util.Dom,A=YAHOO.util.Event,C=YAHOO.lang;var B=function(F,D){var G={element:F,attributes:D||{}};B.superclass.constructor.call(this,G.element,G.attributes);};B._instances={};B.getResizeById=function(D){if(B._instances[D]){return B._instances[D];}return false;};YAHOO.extend(B,YAHOO.util.Element,{CSS_RESIZE:"yui-resize",CSS_DRAG:"yui-draggable",CSS_HOVER:"yui-resize-hover",CSS_PROXY:"yui-resize-proxy",CSS_WRAP:"yui-resize-wrap",CSS_KNOB:"yui-resize-knob",CSS_HIDDEN:"yui-resize-hidden",CSS_HANDLE:"yui-resize-handle",CSS_STATUS:"yui-resize-status",CSS_GHOST:"yui-resize-ghost",CSS_RESIZING:"yui-resize-resizing",_resizeEvent:null,dd:null,browser:YAHOO.env.ua,_locked:null,_positioned:null,_dds:null,_wrap:null,_proxy:null,_handles:null,_currentHandle:null,_currentDD:null,_cache:null,_active:null,_createProxy:function(){if(this.get("proxy")){this._proxy=document.createElement("div");this._proxy.className=this.CSS_PROXY;this._proxy.style.height=this.get("element").clientHeight+"px";this._proxy.style.width=this.get("element").clientWidth+"px";this._wrap.parentNode.appendChild(this._proxy);}else{this.set("animate",false);}},_createWrap:function(){this._positioned=false;if(this.get("wrap")===false){switch(this.get("element").tagName.toLowerCase()){case"img":case"textarea":case"input":case"iframe":case"select":this.set("wrap",true);break;}}if(this.get("wrap")===true){this._wrap=document.createElement("div");this._wrap.id=this.get("element").id+"_wrap";this._wrap.className=this.CSS_WRAP;if(this.get("element").tagName.toLowerCase()=="textarea"){E.addClass(this._wrap,"yui-resize-textarea");}E.setStyle(this._wrap,"width",this.get("width")+"px");E.setStyle(this._wrap,"height",this.get("height")+"px");E.setStyle(this._wrap,"z-index",this.getStyle("z-index"));this.setStyle("z-index",0);var F=E.getStyle(this.get("element"),"position");E.setStyle(this._wrap,"position",((F=="static")?"relative":F));E.setStyle(this._wrap,"top",E.getStyle(this.get("element"),"top"));E.setStyle(this._wrap,"left",E.getStyle(this.get("element"),"left"));if(E.getStyle(this.get("element"),"position")=="absolute"){this._positioned=true;E.setStyle(this.get("element"),"position","relative");E.setStyle(this.get("element"),"top","0");E.setStyle(this.get("element"),"left","0");}var D=this.get("element").parentNode;D.replaceChild(this._wrap,this.get("element"));this._wrap.appendChild(this.get("element"));}else{this._wrap=this.get("element");if(E.getStyle(this._wrap,"position")=="absolute"){this._positioned=true;}}if(this.get("draggable")){this._setupDragDrop();}if(this.get("hover")){E.addClass(this._wrap,this.CSS_HOVER);}if(this.get("knobHandles")){E.addClass(this._wrap,this.CSS_KNOB);}if(this.get("hiddenHandles")){E.addClass(this._wrap,this.CSS_HIDDEN);}E.addClass(this._wrap,this.CSS_RESIZE);},_setupDragDrop:function(){E.addClass(this._wrap,this.CSS_DRAG);this.dd=new YAHOO.util.DD(this._wrap,this.get("id")+"-resize",{dragOnly:true,useShim:this.get("useShim")});this.dd.on("dragEvent",function(){this.fireEvent("dragEvent",arguments);},this,true);},_createHandles:function(){this._handles={};this._dds={};var G=this.get("handles");for(var F=0;F<G.length;F++){this._handles[G[F]]=document.createElement("div");this._handles[G[F]].id=E.generateId(this._handles[G[F]]);this._handles[G[F]].className=this.CSS_HANDLE+" "+this.CSS_HANDLE+"-"+G[F];var D=document.createElement("div");D.className=this.CSS_HANDLE+"-inner-"+G[F];this._handles[G[F]].appendChild(D);this._wrap.appendChild(this._handles[G[F]]);A.on(this._handles[G[F]],"mouseover",this._handleMouseOver,this,true);A.on(this._handles[G[F]],"mouseout",this._handleMouseOut,this,true);this._dds[G[F]]=new YAHOO.util.DragDrop(this._handles[G[F]],this.get("id")+"-handle-"+G,{useShim:this.get("useShim")});this._dds[G[F]].setPadding(15,15,15,15);this._dds[G[F]].on("startDragEvent",this._handleStartDrag,this._dds[G[F]],this);this._dds[G[F]].on("mouseDownEvent",this._handleMouseDown,this._dds[G[F]],this);}this._status=document.createElement("span");this._status.className=this.CSS_STATUS;document.body.insertBefore(this._status,document.body.firstChild);},_ieSelectFix:function(){return false;},_ieSelectBack:null,_setAutoRatio:function(D){if(this.get("autoRatio")){if(D&&D.shiftKey){this.set("ratio",true);}else{this.set("ratio",this._configs.ratio._initialConfig.value);}}},_handleMouseDown:function(D){if(this._locked){return false;}if(E.getStyle(this._wrap,"position")=="absolute"){this._positioned=true;}if(D){this._setAutoRatio(D);}if(this.browser.ie){this._ieSelectBack=document.body.onselectstart;document.body.onselectstart=this._ieSelectFix;}},_handleMouseOver:function(G){if(this._locked){return false;}E.removeClass(this._wrap,this.CSS_RESIZE);if(this.get("hover")){E.removeClass(this._wrap,this.CSS_HOVER);}var D=A.getTarget(G);if(!E.hasClass(D,this.CSS_HANDLE)){D=D.parentNode;}if(E.hasClass(D,this.CSS_HANDLE)&&!this._active){E.addClass(D,this.CSS_HANDLE+"-active");for(var F in this._handles){if(C.hasOwnProperty(this._handles,F)){if(this._handles[F]==D){E.addClass(D,this.CSS_HANDLE+"-"+F+"-active");break;}}}}E.addClass(this._wrap,this.CSS_RESIZE);},_handleMouseOut:function(G){E.removeClass(this._wrap,this.CSS_RESIZE);if(this.get("hover")&&!this._active){E.addClass(this._wrap,this.CSS_HOVER);}var D=A.getTarget(G);if(!E.hasClass(D,this.CSS_HANDLE)){D=D.parentNode;}if(E.hasClass(D,this.CSS_HANDLE)&&!this._active){E.removeClass(D,this.CSS_HANDLE+"-active");for(var F in this._handles){if(C.hasOwnProperty(this._handles,F)){if(this._handles[F]==D){E.removeClass(D,this.CSS_HANDLE+"-"+F+"-active");break;}}}}E.addClass(this._wrap,this.CSS_RESIZE);},_handleStartDrag:function(G,F){var D=F.getDragEl();if(E.hasClass(D,this.CSS_HANDLE)){if(E.getStyle(this._wrap,"position")=="absolute"){this._positioned=true;}this._active=true;this._currentDD=F;if(this._proxy){this._proxy.style.visibility="visible";this._proxy.style.zIndex="1000";this._proxy.style.height=this.get("element").clientHeight+"px";this._proxy.style.width=this.get("element").clientWidth+"px";
}for(var H in this._handles){if(C.hasOwnProperty(this._handles,H)){if(this._handles[H]==D){this._currentHandle=H;var I="_handle_for_"+H;E.addClass(D,this.CSS_HANDLE+"-"+H+"-active");F.on("dragEvent",this[I],this,true);F.on("mouseUpEvent",this._handleMouseUp,this,true);break;}}}E.addClass(D,this.CSS_HANDLE+"-active");if(this.get("proxy")){var J=E.getXY(this.get("element"));E.setXY(this._proxy,J);if(this.get("ghost")){this.addClass(this.CSS_GHOST);}}E.addClass(this._wrap,this.CSS_RESIZING);this._setCache();this._updateStatus(this._cache.height,this._cache.width,this._cache.top,this._cache.left);this.fireEvent("startResize",{type:"startresize",target:this});}},_setCache:function(){this._cache.xy=E.getXY(this._wrap);E.setXY(this._wrap,this._cache.xy);this._cache.height=this.get("clientHeight");this._cache.width=this.get("clientWidth");this._cache.start.height=this._cache.height;this._cache.start.width=this._cache.width;this._cache.start.top=this._cache.xy[1];this._cache.start.left=this._cache.xy[0];this._cache.top=this._cache.xy[1];this._cache.left=this._cache.xy[0];this.set("height",this._cache.height,true);this.set("width",this._cache.width,true);},_handleMouseUp:function(F){this._active=false;var G="_handle_for_"+this._currentHandle;this._currentDD.unsubscribe("dragEvent",this[G],this,true);this._currentDD.unsubscribe("mouseUpEvent",this._handleMouseUp,this,true);if(this._proxy){this._proxy.style.visibility="hidden";this._proxy.style.zIndex="-1";if(this.get("setSize")){this.resize(F,this._cache.height,this._cache.width,this._cache.top,this._cache.left,true);}else{this.fireEvent("resize",{ev:"resize",target:this,height:this._cache.height,width:this._cache.width,top:this._cache.top,left:this._cache.left});}if(this.get("ghost")){this.removeClass(this.CSS_GHOST);}}if(this.get("hover")){E.addClass(this._wrap,this.CSS_HOVER);}if(this._status){E.setStyle(this._status,"display","none");}if(this.browser.ie){document.body.onselectstart=this._ieSelectBack;}if(this.browser.ie){E.removeClass(this._wrap,this.CSS_RESIZE);}for(var D in this._handles){if(C.hasOwnProperty(this._handles,D)){E.removeClass(this._handles[D],this.CSS_HANDLE+"-active");}}if(this.get("hover")&&!this._active){E.addClass(this._wrap,this.CSS_HOVER);}E.removeClass(this._wrap,this.CSS_RESIZING);E.removeClass(this._handles[this._currentHandle],this.CSS_HANDLE+"-"+this._currentHandle+"-active");E.removeClass(this._handles[this._currentHandle],this.CSS_HANDLE+"-active");if(this.browser.ie){E.addClass(this._wrap,this.CSS_RESIZE);}this._resizeEvent=null;this._currentHandle=null;if(!this.get("animate")){this.set("height",this._cache.height,true);this.set("width",this._cache.width,true);}this.fireEvent("endResize",{ev:"endResize",target:this,height:this._cache.height,width:this._cache.width,top:this._cache.top,left:this._cache.left});},_setRatio:function(K,N,Q,I){var O=K,G=N;if(this.get("ratio")){var P=this._cache.height,H=this._cache.width,F=parseInt(this.get("height"),10),L=parseInt(this.get("width"),10),M=this.get("maxHeight"),R=this.get("minHeight"),D=this.get("maxWidth"),J=this.get("minWidth");switch(this._currentHandle){case"l":K=F*(N/L);K=Math.min(Math.max(R,K),M);N=L*(K/F);Q=(this._cache.start.top-(-((F-K)/2)));I=(this._cache.start.left-(-((L-N))));break;case"r":K=F*(N/L);K=Math.min(Math.max(R,K),M);N=L*(K/F);Q=(this._cache.start.top-(-((F-K)/2)));break;case"t":N=L*(K/F);K=F*(N/L);I=(this._cache.start.left-(-((L-N)/2)));Q=(this._cache.start.top-(-((F-K))));break;case"b":N=L*(K/F);K=F*(N/L);I=(this._cache.start.left-(-((L-N)/2)));break;case"bl":K=F*(N/L);N=L*(K/F);I=(this._cache.start.left-(-((L-N))));break;case"br":K=F*(N/L);N=L*(K/F);break;case"tl":K=F*(N/L);N=L*(K/F);I=(this._cache.start.left-(-((L-N))));Q=(this._cache.start.top-(-((F-K))));break;case"tr":K=F*(N/L);N=L*(K/F);I=(this._cache.start.left);Q=(this._cache.start.top-(-((F-K))));break;}O=this._checkHeight(K);G=this._checkWidth(N);if((O!=K)||(G!=N)){Q=0;I=0;if(O!=K){G=this._cache.width;}if(G!=N){O=this._cache.height;}}}return[O,G,Q,I];},_updateStatus:function(K,G,J,F){if(this._resizeEvent&&(!C.isString(this._resizeEvent))){K=((K===0)?this._cache.start.height:K);G=((G===0)?this._cache.start.width:G);var I=parseInt(this.get("height"),10),D=parseInt(this.get("width"),10);if(isNaN(I)){I=parseInt(K,10);}if(isNaN(D)){D=parseInt(G,10);}var L=(parseInt(K,10)-I);var H=(parseInt(G,10)-D);this._cache.offsetHeight=L;this._cache.offsetWidth=H;if(this.get("status")){E.setStyle(this._status,"display","inline");this._status.innerHTML="<strong>"+parseInt(K,10)+" x "+parseInt(G,10)+"</strong><em>"+((L>0)?"+":"")+L+" x "+((H>0)?"+":"")+H+"</em>";E.setXY(this._status,[A.getPageX(this._resizeEvent)+12,A.getPageY(this._resizeEvent)+12]);}}},lock:function(D){this._locked=true;if(D&&this.dd){E.removeClass(this._wrap,"yui-draggable");this.dd.lock();}return this;},unlock:function(D){this._locked=false;if(D&&this.dd){E.addClass(this._wrap,"yui-draggable");this.dd.unlock();}return this;},isLocked:function(){return this._locked;},reset:function(){this.resize(null,this._cache.start.height,this._cache.start.width,this._cache.start.top,this._cache.start.left,true);return this;},resize:function(M,J,P,Q,H,F,K){if(this._locked){return false;}this._resizeEvent=M;var G=this._wrap,I=this.get("animate"),O=true;if(this._proxy&&!F){G=this._proxy;I=false;}this._setAutoRatio(M);if(this._positioned){if(this._proxy){Q=this._cache.top-Q;H=this._cache.left-H;}}var L=this._setRatio(J,P,Q,H);J=parseInt(L[0],10);P=parseInt(L[1],10);Q=parseInt(L[2],10);H=parseInt(L[3],10);if(Q==0){Q=E.getY(G);}if(H==0){H=E.getX(G);}if(this._positioned){if(this._proxy&&F){if(!I){G.style.top=this._proxy.style.top;G.style.left=this._proxy.style.left;}else{Q=this._proxy.style.top;H=this._proxy.style.left;}}else{if(!this.get("ratio")&&!this._proxy){Q=this._cache.top+-(Q);H=this._cache.left+-(H);}if(Q){if(this.get("minY")){if(Q<this.get("minY")){Q=this.get("minY");}}if(this.get("maxY")){if(Q>this.get("maxY")){Q=this.get("maxY");}}}if(H){if(this.get("minX")){if(H<this.get("minX")){H=this.get("minX");
}}if(this.get("maxX")){if((H+P)>this.get("maxX")){H=(this.get("maxX")-P);}}}}}if(!K){var N=this.fireEvent("beforeResize",{ev:"beforeResize",target:this,height:J,width:P,top:Q,left:H});if(N===false){return false;}}this._updateStatus(J,P,Q,H);if(this._positioned){if(this._proxy&&F){}else{if(Q){E.setY(G,Q);this._cache.top=Q;}if(H){E.setX(G,H);this._cache.left=H;}}}if(J){if(!I){O=true;if(this._proxy&&F){if(!this.get("setSize")){O=false;}}if(O){G.style.height=J+"px";}if((this._proxy&&F)||!this._proxy){if(this._wrap!=this.get("element")){this.get("element").style.height=J+"px";}}}this._cache.height=J;}if(P){this._cache.width=P;if(!I){O=true;if(this._proxy&&F){if(!this.get("setSize")){O=false;}}if(O){G.style.width=P+"px";}if((this._proxy&&F)||!this._proxy){if(this._wrap!=this.get("element")){this.get("element").style.width=P+"px";}}}}if(I){if(YAHOO.util.Anim){var D=new YAHOO.util.Anim(G,{height:{to:this._cache.height},width:{to:this._cache.width}},this.get("animateDuration"),this.get("animateEasing"));if(this._positioned){if(Q){D.attributes.top={to:parseInt(Q,10)};}if(H){D.attributes.left={to:parseInt(H,10)};}}if(this._wrap!=this.get("element")){D.onTween.subscribe(function(){this.get("element").style.height=G.style.height;this.get("element").style.width=G.style.width;},this,true);}D.onComplete.subscribe(function(){this.set("height",J);this.set("width",P);this.fireEvent("resize",{ev:"resize",target:this,height:J,width:P,top:Q,left:H});},this,true);D.animate();}}else{if(this._proxy&&!F){this.fireEvent("proxyResize",{ev:"proxyresize",target:this,height:J,width:P,top:Q,left:H});}else{this.fireEvent("resize",{ev:"resize",target:this,height:J,width:P,top:Q,left:H});}}return this;},_handle_for_br:function(F){var G=this._setWidth(F.e);var D=this._setHeight(F.e);this.resize(F.e,D,G,0,0);},_handle_for_bl:function(G){var H=this._setWidth(G.e,true);var F=this._setHeight(G.e);var D=(H-this._cache.width);this.resize(G.e,F,H,0,D);},_handle_for_tl:function(G){var I=this._setWidth(G.e,true);var F=this._setHeight(G.e,true);var H=(F-this._cache.height);var D=(I-this._cache.width);this.resize(G.e,F,I,H,D);},_handle_for_tr:function(F){var H=this._setWidth(F.e);var D=this._setHeight(F.e,true);var G=(D-this._cache.height);this.resize(F.e,D,H,G,0);},_handle_for_r:function(D){this._dds.r.setYConstraint(0,0);var F=this._setWidth(D.e);this.resize(D.e,0,F,0,0);},_handle_for_l:function(F){this._dds.l.setYConstraint(0,0);var G=this._setWidth(F.e,true);var D=(G-this._cache.width);this.resize(F.e,0,G,0,D);},_handle_for_b:function(F){this._dds.b.setXConstraint(0,0);var D=this._setHeight(F.e);this.resize(F.e,D,0,0,0);},_handle_for_t:function(F){this._dds.t.setXConstraint(0,0);var D=this._setHeight(F.e,true);var G=(D-this._cache.height);this.resize(F.e,D,0,G,0);},_setWidth:function(H,J){var I=this._cache.xy[0],G=this._cache.width,D=A.getPageX(H),F=(D-I);if(J){F=(I-D)+parseInt(this.get("width"),10);}F=this._snapTick(F,this.get("xTicks"));F=this._checkWidth(F);return F;},_checkWidth:function(D){if(this.get("minWidth")){if(D<=this.get("minWidth")){D=this.get("minWidth");}}if(this.get("maxWidth")){if(D>=this.get("maxWidth")){D=this.get("maxWidth");}}return D;},_checkHeight:function(D){if(this.get("minHeight")){if(D<=this.get("minHeight")){D=this.get("minHeight");}}if(this.get("maxHeight")){if(D>=this.get("maxHeight")){D=this.get("maxHeight");}}return D;},_setHeight:function(G,I){var H=this._cache.xy[1],F=this._cache.height,J=A.getPageY(G),D=(J-H);if(I){D=(H-J)+parseInt(this.get("height"),10);}D=this._snapTick(D,this.get("yTicks"));D=this._checkHeight(D);return D;},_snapTick:function(G,F){if(!G||!F){return G;}var H=G;var D=G%F;if(D>0){if(D>(F/2)){H=G+(F-D);}else{H=G-D;}}return H;},init:function(H,F){this._locked=false;this._cache={xy:[],height:0,width:0,top:0,left:0,offsetHeight:0,offsetWidth:0,start:{height:0,width:0,top:0,left:0}};B.superclass.init.call(this,H,F);this.set("setSize",this.get("setSize"));if(F.height){this.set("height",parseInt(F.height,10));}else{var G=this.getStyle("height");if(G=="auto"){this.set("height",parseInt(this.get("element").offsetHeight,10));}}if(F.width){this.set("width",parseInt(F.width,10));}else{var D=this.getStyle("width");if(D=="auto"){this.set("width",parseInt(this.get("element").offsetWidth,10));}}var I=H;if(!C.isString(I)){I=E.generateId(I);}B._instances[I]=this;this._active=false;this._createWrap();this._createProxy();this._createHandles();},getProxyEl:function(){return this._proxy;},getWrapEl:function(){return this._wrap;},getStatusEl:function(){return this._status;},getActiveHandleEl:function(){return this._handles[this._currentHandle];},isActive:function(){return((this._active)?true:false);},initAttributes:function(D){B.superclass.initAttributes.call(this,D);this.setAttributeConfig("useShim",{value:((D.useShim===true)?true:false),validator:YAHOO.lang.isBoolean,method:function(F){for(var G in this._dds){if(C.hasOwnProperty(this._dds,G)){this._dds[G].useShim=F;}}if(this.dd){this.dd.useShim=F;}}});this.setAttributeConfig("setSize",{value:((D.setSize===false)?false:true),validator:YAHOO.lang.isBoolean});this.setAttributeConfig("wrap",{writeOnce:true,validator:YAHOO.lang.isBoolean,value:D.wrap||false});this.setAttributeConfig("handles",{writeOnce:true,value:D.handles||["r","b","br"],validator:function(F){if(C.isString(F)&&F.toLowerCase()=="all"){F=["t","b","r","l","bl","br","tl","tr"];}if(!C.isArray(F)){F=F.replace(/, /g,",");F=F.split(",");}this._configs.handles.value=F;}});this.setAttributeConfig("width",{value:D.width||parseInt(this.getStyle("width"),10),validator:YAHOO.lang.isNumber,method:function(F){F=parseInt(F,10);if(F>0){if(this.get("setSize")){this.setStyle("width",F+"px");}this._cache.width=F;this._configs.width.value=F;}}});this.setAttributeConfig("height",{value:D.height||parseInt(this.getStyle("height"),10),validator:YAHOO.lang.isNumber,method:function(F){F=parseInt(F,10);if(F>0){if(this.get("setSize")){this.setStyle("height",F+"px");}this._cache.height=F;this._configs.height.value=F;
}}});this.setAttributeConfig("minWidth",{value:D.minWidth||15,validator:YAHOO.lang.isNumber});this.setAttributeConfig("minHeight",{value:D.minHeight||15,validator:YAHOO.lang.isNumber});this.setAttributeConfig("maxWidth",{value:D.maxWidth||10000,validator:YAHOO.lang.isNumber});this.setAttributeConfig("maxHeight",{value:D.maxHeight||10000,validator:YAHOO.lang.isNumber});this.setAttributeConfig("minY",{value:D.minY||false});this.setAttributeConfig("minX",{value:D.minX||false});this.setAttributeConfig("maxY",{value:D.maxY||false});this.setAttributeConfig("maxX",{value:D.maxX||false});this.setAttributeConfig("animate",{value:D.animate||false,validator:function(G){var F=true;if(!YAHOO.util.Anim){F=false;}return F;}});this.setAttributeConfig("animateEasing",{value:D.animateEasing||function(){var F=false;if(YAHOO.util.Easing&&YAHOO.util.Easing.easeOut){F=YAHOO.util.Easing.easeOut;}return F;}()});this.setAttributeConfig("animateDuration",{value:D.animateDuration||0.5});this.setAttributeConfig("proxy",{value:D.proxy||false,validator:YAHOO.lang.isBoolean});this.setAttributeConfig("ratio",{value:D.ratio||false,validator:YAHOO.lang.isBoolean});this.setAttributeConfig("ghost",{value:D.ghost||false,validator:YAHOO.lang.isBoolean});this.setAttributeConfig("draggable",{value:D.draggable||false,validator:YAHOO.lang.isBoolean,method:function(F){if(F&&this._wrap){this._setupDragDrop();}else{if(this.dd){E.removeClass(this._wrap,this.CSS_DRAG);this.dd.unreg();}}}});this.setAttributeConfig("hover",{value:D.hover||false,validator:YAHOO.lang.isBoolean});this.setAttributeConfig("hiddenHandles",{value:D.hiddenHandles||false,validator:YAHOO.lang.isBoolean});this.setAttributeConfig("knobHandles",{value:D.knobHandles||false,validator:YAHOO.lang.isBoolean});this.setAttributeConfig("xTicks",{value:D.xTicks||false});this.setAttributeConfig("yTicks",{value:D.yTicks||false});this.setAttributeConfig("status",{value:D.status||false,validator:YAHOO.lang.isBoolean});this.setAttributeConfig("autoRatio",{value:D.autoRatio||false,validator:YAHOO.lang.isBoolean});},destroy:function(){for(var F in this._handles){if(C.hasOwnProperty(this._handles,F)){A.purgeElement(this._handles[F]);this._handles[F].parentNode.removeChild(this._handles[F]);}}if(this._proxy){this._proxy.parentNode.removeChild(this._proxy);}if(this._status){this._status.parentNode.removeChild(this._status);}if(this.dd){this.dd.unreg();E.removeClass(this._wrap,this.CSS_DRAG);}if(this._wrap!=this.get("element")){this.setStyle("position","");this.setStyle("top","");this.setStyle("left","");this._wrap.parentNode.replaceChild(this.get("element"),this._wrap);}this.removeClass(this.CSS_RESIZE);delete YAHOO.util.Resize._instances[this.get("id")];for(var D in this){if(C.hasOwnProperty(this,D)){this[D]=null;delete this[D];}}},toString:function(){if(this.get){return"Resize (#"+this.get("id")+")";}return"Resize Utility";}});YAHOO.util.Resize=B;})();YAHOO.register("resize",YAHOO.util.Resize,{version:"2.7.0",build:"1796"});/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
(function(){var C=YAHOO.util.Dom,A=YAHOO.util.Event,D=YAHOO.lang;var B=function(F,E){var G={element:F,attributes:E||{}};B.superclass.constructor.call(this,G.element,G.attributes);};B._instances={};B.getCropperById=function(E){if(B._instances[E]){return B._instances[E];}return false;};YAHOO.extend(B,YAHOO.util.Element,{CSS_MAIN:"yui-crop",CSS_MASK:"yui-crop-mask",CSS_RESIZE_MASK:"yui-crop-resize-mask",_image:null,_active:null,_resize:null,_resizeEl:null,_resizeMaskEl:null,_wrap:null,_mask:null,_createWrap:function(){this._wrap=document.createElement("div");this._wrap.id=this.get("element").id+"_wrap";this._wrap.className=this.CSS_MAIN;var F=this.get("element");this._wrap.style.width=F.width?F.width+"px":C.getStyle(F,"width");this._wrap.style.height=F.height?F.height+"px":C.getStyle(F,"height");var E=this.get("element").parentNode;E.replaceChild(this._wrap,this.get("element"));this._wrap.appendChild(this.get("element"));A.on(this._wrap,"mouseover",this._handleMouseOver,this,true);A.on(this._wrap,"mouseout",this._handleMouseOut,this,true);A.on(this._wrap,"click",function(G){A.stopEvent(G);},this,true);},_createMask:function(){this._mask=document.createElement("div");this._mask.className=this.CSS_MASK;this._wrap.appendChild(this._mask);},_createResize:function(){this._resizeEl=document.createElement("div");this._resizeEl.className=YAHOO.util.Resize.prototype.CSS_RESIZE;this._resizeEl.style.position="absolute";this._resizeEl.innerHTML='<div class="'+this.CSS_RESIZE_MASK+'"></div>';this._resizeMaskEl=this._resizeEl.firstChild;this._wrap.appendChild(this._resizeEl);this._resizeEl.style.top=this.get("initialXY")[1]+"px";this._resizeEl.style.left=this.get("initialXY")[0]+"px";this._resizeMaskEl.style.height=Math.floor(this.get("initHeight"))+"px";this._resizeMaskEl.style.width=Math.floor(this.get("initWidth"))+"px";this._resize=new YAHOO.util.Resize(this._resizeEl,{knobHandles:true,handles:"all",draggable:true,status:this.get("status"),minWidth:this.get("minWidth"),minHeight:this.get("minHeight"),ratio:this.get("ratio"),autoRatio:this.get("autoRatio"),height:this.get("initHeight"),width:this.get("initWidth")});this._setBackgroundImage(this.get("element").getAttribute("src",2));this._setBackgroundPosition(-(this.get("initialXY")[0]),-(this.get("initialXY")[1]));this._resize.on("startResize",this._handleStartResizeEvent,this,true);this._resize.on("endResize",this._handleEndResizeEvent,this,true);this._resize.on("dragEvent",this._handleDragEvent,this,true);this._resize.on("beforeResize",this._handleBeforeResizeEvent,this,true);this._resize.on("resize",this._handleResizeEvent,this,true);this._resize.dd.on("b4StartDragEvent",this._handleB4DragEvent,this,true);},_handleMouseOver:function(F){var E="keydown";if(YAHOO.env.ua.gecko||YAHOO.env.ua.opera){E="keypress";}if(!this._active){this._active=true;if(this.get("useKeys")){A.on(document,E,this._handleKeyPress,this,true);}}},_handleMouseOut:function(F){var E="keydown";if(YAHOO.env.ua.gecko||YAHOO.env.ua.opera){E="keypress";}this._active=false;if(this.get("useKeys")){A.removeListener(document,E,this._handleKeyPress);}},_moveEl:function(G,J){var H=0,E=0,I=this._setConstraints(),F=true;switch(G){case"down":H=-(J);if((I.bottom-J)<0){F=false;this._resizeEl.style.top=(I.top+I.bottom)+"px";}break;case"up":H=(J);if((I.top-J)<0){F=false;this._resizeEl.style.top="0px";}break;case"right":E=-(J);if((I.right-J)<0){F=false;this._resizeEl.style.left=(I.left+I.right)+"px";}break;case"left":E=J;if((I.left-J)<0){F=false;this._resizeEl.style.left="0px";}break;}if(F){this._resizeEl.style.left=(parseInt(this._resizeEl.style.left,10)-E)+"px";this._resizeEl.style.top=(parseInt(this._resizeEl.style.top,10)-H)+"px";this.fireEvent("moveEvent",{target:"keypress"});}else{this._setConstraints();}this._syncBackgroundPosition();},_handleKeyPress:function(G){var E=A.getCharCode(G),F=false,H=((G.shiftKey)?this.get("shiftKeyTick"):this.get("keyTick"));switch(E){case 37:this._moveEl("left",H);F=true;break;case 38:this._moveEl("up",H);F=true;break;case 39:this._moveEl("right",H);F=true;break;case 40:this._moveEl("down",H);F=true;break;default:}if(F){A.preventDefault(G);}},_handleB4DragEvent:function(){this._setConstraints();},_handleDragEvent:function(){this._syncBackgroundPosition();this.fireEvent("dragEvent",arguments);this.fireEvent("moveEvent",{target:"dragevent"});},_handleBeforeResizeEvent:function(F){var I=C.getRegion(this.get("element")),J=this._resize._cache,H=this._resize._currentHandle,G=0,E=0;if(F.top&&(F.top<I.top)){G=(J.height+J.top)-I.top;C.setY(this._resize.getWrapEl(),I.top);this._resize.getWrapEl().style.height=G+"px";this._resize._cache.height=G;this._resize._cache.top=I.top;this._syncBackgroundPosition();return false;}if(F.left&&(F.left<I.left)){E=(J.width+J.left)-I.left;C.setX(this._resize.getWrapEl(),I.left);this._resize._cache.left=I.left;this._resize.getWrapEl().style.width=E+"px";this._resize._cache.width=E;this._syncBackgroundPosition();return false;}if(H!="tl"&&H!="l"&&H!="bl"){if(J.left&&F.width&&((J.left+F.width)>I.right)){E=(I.right-J.left);C.setX(this._resize.getWrapEl(),(I.right-E));this._resize.getWrapEl().style.width=E+"px";this._resize._cache.left=(I.right-E);this._resize._cache.width=E;this._syncBackgroundPosition();return false;}}if(H!="t"&&H!="tr"&&H!="tl"){if(J.top&&F.height&&((J.top+F.height)>I.bottom)){G=(I.bottom-J.top);C.setY(this._resize.getWrapEl(),(I.bottom-G));this._resize.getWrapEl().style.height=G+"px";this._resize._cache.height=G;this._resize._cache.top=(I.bottom-G);this._syncBackgroundPosition();return false;}}},_handleResizeMaskEl:function(){var E=this._resize._cache;this._resizeMaskEl.style.height=Math.floor(E.height)+"px";this._resizeMaskEl.style.width=Math.floor(E.width)+"px";},_handleResizeEvent:function(E){this._setConstraints(true);this._syncBackgroundPosition();this.fireEvent("resizeEvent",arguments);this.fireEvent("moveEvent",{target:"resizeevent"});},_syncBackgroundPosition:function(){this._handleResizeMaskEl();this._setBackgroundPosition(-(parseInt(this._resizeEl.style.left,10)),-(parseInt(this._resizeEl.style.top,10)));
},_setBackgroundPosition:function(F,H){var J=parseInt(C.getStyle(this._resize.get("element"),"borderLeftWidth"),10);var G=parseInt(C.getStyle(this._resize.get("element"),"borderTopWidth"),10);if(isNaN(J)){J=0;}if(isNaN(G)){G=0;}var E=this._resize.getWrapEl().firstChild;var I=(F-J)+"px "+(H-G)+"px";this._resizeMaskEl.style.backgroundPosition=I;},_setBackgroundImage:function(F){var E=this._resize.getWrapEl().firstChild;this._image=F;E.style.backgroundImage="url("+F+"#)";},_handleEndResizeEvent:function(){this._setConstraints(true);},_handleStartResizeEvent:function(){this._setConstraints(true);var I=this._resize._cache.height,F=this._resize._cache.width,H=parseInt(this._resize.getWrapEl().style.top,10),E=parseInt(this._resize.getWrapEl().style.left,10),G=0,J=0;switch(this._resize._currentHandle){case"b":G=(I+this._resize.dd.bottomConstraint);break;case"l":J=(F+this._resize.dd.leftConstraint);break;case"r":G=(I+H);J=(F+this._resize.dd.rightConstraint);break;case"br":G=(I+this._resize.dd.bottomConstraint);J=(F+this._resize.dd.rightConstraint);break;case"tr":G=(I+H);J=(F+this._resize.dd.rightConstraint);break;}if(G){}if(J){}this.fireEvent("startResizeEvent",arguments);},_setConstraints:function(J){var H=this._resize;H.dd.resetConstraints();var N=parseInt(H.get("height"),10),F=parseInt(H.get("width"),10);if(J){N=H._cache.height;F=H._cache.width;}var L=C.getRegion(this.get("element"));var G=H.getWrapEl();var O=C.getXY(G);var I=O[0]-L.left;var M=L.right-O[0]-F;var K=O[1]-L.top;var E=L.bottom-O[1]-N;if(K<0){K=0;}H.dd.setXConstraint(I,M);H.dd.setYConstraint(K,E);return{top:K,right:M,bottom:E,left:I};},getCropCoords:function(){var E={top:parseInt(this._resize.getWrapEl().style.top,10),left:parseInt(this._resize.getWrapEl().style.left,10),height:this._resize._cache.height,width:this._resize._cache.width,image:this._image};return E;},reset:function(){this._resize.resize(null,this.get("initHeight"),this.get("initWidth"),0,0,true);this._resizeEl.style.top=this.get("initialXY")[1]+"px";this._resizeEl.style.left=this.get("initialXY")[0]+"px";this._syncBackgroundPosition();return this;},getEl:function(){return this.get("element");},getResizeEl:function(){return this._resizeEl;},getWrapEl:function(){return this._wrap;},getMaskEl:function(){return this._mask;},getResizeMaskEl:function(){return this._resizeMaskEl;},getResizeObject:function(){return this._resize;},init:function(G,E){B.superclass.init.call(this,G,E);var H=G;if(!D.isString(H)){if(H.tagName&&(H.tagName.toLowerCase()=="img")){H=C.generateId(H);}else{return false;}}else{var F=C.get(H);if(F.tagName&&F.tagName.toLowerCase()=="img"){}else{return false;}}B._instances[H]=this;this._createWrap();this._createMask();this._createResize();this._setConstraints();},initAttributes:function(E){B.superclass.initAttributes.call(this,E);this.setAttributeConfig("initialXY",{writeOnce:true,validator:YAHOO.lang.isArray,value:E.initialXY||[10,10]});this.setAttributeConfig("keyTick",{validator:YAHOO.lang.isNumber,value:E.keyTick||1});this.setAttributeConfig("shiftKeyTick",{validator:YAHOO.lang.isNumber,value:E.shiftKeyTick||10});this.setAttributeConfig("useKeys",{validator:YAHOO.lang.isBoolean,value:((E.useKeys===false)?false:true)});this.setAttributeConfig("status",{validator:YAHOO.lang.isBoolean,value:((E.status===false)?false:true),method:function(F){if(this._resize){this._resize.set("status",F);}}});this.setAttributeConfig("minHeight",{validator:YAHOO.lang.isNumber,value:E.minHeight||50,method:function(F){if(this._resize){this._resize.set("minHeight",F);}}});this.setAttributeConfig("minWidth",{validator:YAHOO.lang.isNumber,value:E.minWidth||50,method:function(F){if(this._resize){this._resize.set("minWidth",F);}}});this.setAttributeConfig("ratio",{validator:YAHOO.lang.isBoolean,value:E.ratio||false,method:function(F){if(this._resize){this._resize.set("ratio",F);}}});this.setAttributeConfig("autoRatio",{validator:YAHOO.lang.isBoolean,value:((E.autoRatio===false)?false:true),method:function(F){if(this._resize){this._resize.set("autoRatio",F);}}});this.setAttributeConfig("initHeight",{writeOnce:true,validator:YAHOO.lang.isNumber,value:E.initHeight||(this.get("element").height/4)});this.setAttributeConfig("initWidth",{validator:YAHOO.lang.isNumber,writeOnce:true,value:E.initWidth||(this.get("element").width/4)});},destroy:function(){this._resize.destroy();this._resizeEl.parentNode.removeChild(this._resizeEl);this._mask.parentNode.removeChild(this._mask);A.purgeElement(this._wrap);this._wrap.parentNode.replaceChild(this.get("element"),this._wrap);for(var E in this){if(D.hasOwnProperty(this,E)){this[E]=null;}}},toString:function(){if(this.get){return"ImageCropper (#"+this.get("id")+")";}return"Image Cropper";}});YAHOO.widget.ImageCropper=B;})();YAHOO.register("imagecropper",YAHOO.widget.ImageCropper,{version:"2.7.0",build:"1796"});/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
if(typeof(YAHOO.util.ImageLoader)=="undefined"){YAHOO.util.ImageLoader={};}YAHOO.util.ImageLoader.group=function(A,B,C){this.name="unnamed";this._imgObjs={};this.timeoutLen=C;this._timeout=null;this._triggers=[];this._customTriggers=[];this.foldConditional=false;this.className=null;this._classImageEls=null;YAHOO.util.Event.addListener(window,"load",this._onloadTasks,this,true);this.addTrigger(A,B);};YAHOO.util.ImageLoader.group.prototype.addTrigger=function(B,C){if(!B||!C){return;}var A=function(){this.fetch();};this._triggers.push([B,C,A]);YAHOO.util.Event.addListener(B,C,A,this,true);};YAHOO.util.ImageLoader.group.prototype.addCustomTrigger=function(B){if(!B||!B instanceof YAHOO.util.CustomEvent){return;}var A=function(){this.fetch();};this._customTriggers.push([B,A]);B.subscribe(A,this,true);};YAHOO.util.ImageLoader.group.prototype._onloadTasks=function(){if(this.timeoutLen&&typeof(this.timeoutLen)=="number"&&this.timeoutLen>0){this._timeout=setTimeout(this._getFetchTimeout(),this.timeoutLen*1000);}if(this.foldConditional){this._foldCheck();}};YAHOO.util.ImageLoader.group.prototype._getFetchTimeout=function(){var A=this;return function(){A.fetch();};};YAHOO.util.ImageLoader.group.prototype.registerBgImage=function(B,A){this._imgObjs[B]=new YAHOO.util.ImageLoader.bgImgObj(B,A);return this._imgObjs[B];};YAHOO.util.ImageLoader.group.prototype.registerSrcImage=function(D,B,C,A){this._imgObjs[D]=new YAHOO.util.ImageLoader.srcImgObj(D,B,C,A);return this._imgObjs[D];};YAHOO.util.ImageLoader.group.prototype.registerPngBgImage=function(C,B,A){this._imgObjs[C]=new YAHOO.util.ImageLoader.pngBgImgObj(C,B,A);return this._imgObjs[C];};YAHOO.util.ImageLoader.group.prototype.fetch=function(){clearTimeout(this._timeout);for(var B=0,A=this._triggers.length;B<A;B++){YAHOO.util.Event.removeListener(this._triggers[B][0],this._triggers[B][1],this._triggers[B][2]);}for(var B=0,A=this._customTriggers.length;B<A;B++){this._customTriggers[B][0].unsubscribe(this._customTriggers[B][1],this);}this._fetchByClass();for(var C in this._imgObjs){if(YAHOO.lang.hasOwnProperty(this._imgObjs,C)){this._imgObjs[C].fetch();}}};YAHOO.util.ImageLoader.group.prototype._foldCheck=function(){var C=(document.compatMode!="CSS1Compat")?document.body.scrollTop:document.documentElement.scrollTop;var D=YAHOO.util.Dom.getViewportHeight();var A=C+D;var E=(document.compatMode!="CSS1Compat")?document.body.scrollLeft:document.documentElement.scrollLeft;var G=YAHOO.util.Dom.getViewportWidth();var I=E+G;for(var B in this._imgObjs){if(YAHOO.lang.hasOwnProperty(this._imgObjs,B)){var J=YAHOO.util.Dom.getXY(this._imgObjs[B].domId);if(J[1]<A&&J[0]<I){this._imgObjs[B].fetch();}}}if(this.className){this._classImageEls=YAHOO.util.Dom.getElementsByClassName(this.className);for(var F=0,H=this._classImageEls.length;F<H;F++){var J=YAHOO.util.Dom.getXY(this._classImageEls[F]);if(J[1]<A&&J[0]<I){YAHOO.util.Dom.removeClass(this._classImageEls[F],this.className);}}}};YAHOO.util.ImageLoader.group.prototype._fetchByClass=function(){if(!this.className){return;}if(this._classImageEls===null){this._classImageEls=YAHOO.util.Dom.getElementsByClassName(this.className);}YAHOO.util.Dom.removeClass(this._classImageEls,this.className);};YAHOO.util.ImageLoader.imgObj=function(B,A){this.domId=B;this.url=A;this.width=null;this.height=null;this.setVisible=false;this._fetched=false;};YAHOO.util.ImageLoader.imgObj.prototype.fetch=function(){if(this._fetched){return;}var A=document.getElementById(this.domId);if(!A){return;}this._applyUrl(A);if(this.setVisible){A.style.visibility="visible";}if(this.width){A.width=this.width;}if(this.height){A.height=this.height;}this._fetched=true;};YAHOO.util.ImageLoader.imgObj.prototype._applyUrl=function(A){};YAHOO.util.ImageLoader.bgImgObj=function(B,A){YAHOO.util.ImageLoader.bgImgObj.superclass.constructor.call(this,B,A);};YAHOO.lang.extend(YAHOO.util.ImageLoader.bgImgObj,YAHOO.util.ImageLoader.imgObj);YAHOO.util.ImageLoader.bgImgObj.prototype._applyUrl=function(A){A.style.backgroundImage="url('"+this.url+"')";};YAHOO.util.ImageLoader.srcImgObj=function(D,B,C,A){YAHOO.util.ImageLoader.srcImgObj.superclass.constructor.call(this,D,B);this.width=C;this.height=A;};YAHOO.lang.extend(YAHOO.util.ImageLoader.srcImgObj,YAHOO.util.ImageLoader.imgObj);YAHOO.util.ImageLoader.srcImgObj.prototype._applyUrl=function(A){A.src=this.url;};YAHOO.util.ImageLoader.pngBgImgObj=function(C,B,A){YAHOO.util.ImageLoader.pngBgImgObj.superclass.constructor.call(this,C,B);this.props=A||{};};YAHOO.lang.extend(YAHOO.util.ImageLoader.pngBgImgObj,YAHOO.util.ImageLoader.imgObj);YAHOO.util.ImageLoader.pngBgImgObj.prototype._applyUrl=function(B){if(YAHOO.env.ua.ie&&YAHOO.env.ua.ie<=6){var C=(YAHOO.lang.isUndefined(this.props.sizingMethod))?"scale":this.props.sizingMethod;var A=(YAHOO.lang.isUndefined(this.props.enabled))?"true":this.props.enabled;B.style.filter='progid:DXImageTransform.Microsoft.AlphaImageLoader(src="'+this.url+'", sizingMethod="'+C+'", enabled="'+A+'")';}else{B.style.backgroundImage="url('"+this.url+"')";}};YAHOO.register("imageloader",YAHOO.util.ImageLoader,{version:"2.7.0",build:"1796"});/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
(function(){var A=YAHOO.util;A.Selector={_foundCache:[],_regexCache:{},_re:{nth:/^(?:([-]?\d*)(n){1}|(odd|even)$)*([-+]?\d*)$/,attr:/(\[.*\])/g,urls:/^(?:href|src)/},document:window.document,attrAliases:{},shorthand:{"\\#(-?[_a-z]+[-\\w]*)":"[id=$1]","\\.(-?[_a-z]+[-\\w]*)":"[class~=$1]"},operators:{"=":function(B,C){return B===C;},"!=":function(B,C){return B!==C;},"~=":function(B,D){var C=" ";return(C+B+C).indexOf((C+D+C))>-1;},"|=":function(B,C){return B===C||B.slice(0,C.length+1)===C+"-";},"^=":function(B,C){return B.indexOf(C)===0;},"$=":function(B,C){return B.slice(-C.length)===C;},"*=":function(B,C){return B.indexOf(C)>-1;},"":function(B,C){return B;}},pseudos:{"root":function(B){return B===B.ownerDocument.documentElement;},"nth-child":function(B,C){return A.Selector._getNth(B,C);},"nth-last-child":function(B,C){return A.Selector._getNth(B,C,null,true);},"nth-of-type":function(B,C){return A.Selector._getNth(B,C,B.tagName);},"nth-last-of-type":function(B,C){return A.Selector._getNth(B,C,B.tagName,true);},"first-child":function(B){return A.Selector._getChildren(B.parentNode)[0]===B;},"last-child":function(C){var B=A.Selector._getChildren(C.parentNode);return B[B.length-1]===C;},"first-of-type":function(B,C){return A.Selector._getChildren(B.parentNode,B.tagName)[0];},"last-of-type":function(C,D){var B=A.Selector._getChildren(C.parentNode,C.tagName);return B[B.length-1];},"only-child":function(C){var B=A.Selector._getChildren(C.parentNode);return B.length===1&&B[0]===C;},"only-of-type":function(B){return A.Selector._getChildren(B.parentNode,B.tagName).length===1;},"empty":function(B){return B.childNodes.length===0;},"not":function(B,C){return !A.Selector.test(B,C);},"contains":function(B,D){var C=B.innerText||B.textContent||"";return C.indexOf(D)>-1;},"checked":function(B){return B.checked===true;}},test:function(F,D){F=A.Selector.document.getElementById(F)||F;if(!F){return false;}var C=D?D.split(","):[];if(C.length){for(var E=0,B=C.length;E<B;++E){if(A.Selector._test(F,C[E])){return true;}}return false;}return A.Selector._test(F,D);},_test:function(D,G,F,E){F=F||A.Selector._tokenize(G).pop()||{};if(!D.tagName||(F.tag!=="*"&&D.tagName!==F.tag)||(E&&D._found)){return false;}if(F.attributes.length){var B,H,C=A.Selector._re.urls;if(!D.attributes||!D.attributes.length){return false;}for(var I=0,K;K=F.attributes[I++];){H=(C.test(K[0]))?2:0;B=D.getAttribute(K[0],H);if(B===null||B===undefined){return false;}if(A.Selector.operators[K[1]]&&!A.Selector.operators[K[1]](B,K[2])){return false;}}}if(F.pseudos.length){for(var I=0,J=F.pseudos.length;I<J;++I){if(A.Selector.pseudos[F.pseudos[I][0]]&&!A.Selector.pseudos[F.pseudos[I][0]](D,F.pseudos[I][1])){return false;}}}return(F.previous&&F.previous.combinator!==",")?A.Selector._combinators[F.previous.combinator](D,F):true;},filter:function(E,D){E=E||[];var G,C=[],H=A.Selector._tokenize(D);if(!E.item){for(var F=0,B=E.length;F<B;++F){if(!E[F].tagName){G=A.Selector.document.getElementById(E[F]);if(G){E[F]=G;}else{}}}}C=A.Selector._filter(E,A.Selector._tokenize(D)[0]);return C;},_filter:function(E,G,H,D){var C=H?null:[],I=A.Selector._foundCache;for(var F=0,B=E.length;F<B;F++){if(!A.Selector._test(E[F],"",G,D)){continue;}if(H){return E[F];}if(D){if(E[F]._found){continue;}E[F]._found=true;I[I.length]=E[F];}C[C.length]=E[F];}return C;},query:function(C,D,E){var B=A.Selector._query(C,D,E);return B;},_query:function(H,M,N,F){var P=(N)?null:[],E;if(!H){return P;}var D=H.split(",");if(D.length>1){var O;for(var I=0,J=D.length;I<J;++I){O=arguments.callee(D[I],M,N,true);P=N?O:P.concat(O);}A.Selector._clearFoundCache();return P;}if(M&&!M.nodeName){M=A.Selector.document.getElementById(M);if(!M){return P;}}M=M||A.Selector.document;if(M.nodeName!=="#document"){A.Dom.generateId(M);H=M.tagName+"#"+M.id+" "+H;E=M;M=M.ownerDocument;}var L=A.Selector._tokenize(H);var K=L[A.Selector._getIdTokenIndex(L)],B=[],C,G=L.pop()||{};if(K){C=A.Selector._getId(K.attributes);}if(C){E=E||A.Selector.document.getElementById(C);if(E&&(M.nodeName==="#document"||A.Dom.isAncestor(M,E))){if(A.Selector._test(E,null,K)){if(K===G){B=[E];}else{if(K.combinator===" "||K.combinator===">"){M=E;}}}}else{return P;}}if(M&&!B.length){B=M.getElementsByTagName(G.tag);}if(B.length){P=A.Selector._filter(B,G,N,F);}return P;},_clearFoundCache:function(){var E=A.Selector._foundCache;for(var C=0,B=E.length;C<B;++C){try{delete E[C]._found;}catch(D){E[C].removeAttribute("_found");}}E=[];},_getRegExp:function(D,B){var C=A.Selector._regexCache;B=B||"";if(!C[D+B]){C[D+B]=new RegExp(D,B);}return C[D+B];},_getChildren:function(){if(document.documentElement.children){return function(C,B){return(B)?C.children.tags(B):C.children||[];};}else{return function(F,C){if(F._children){return F._children;}var E=[],G=F.childNodes;for(var D=0,B=G.length;D<B;++D){if(G[D].tagName){if(!C||G[D].tagName===C){E[E.length]=G[D];}}}F._children=E;return E;};}}(),_combinators:{" ":function(C,B){while((C=C.parentNode)){if(A.Selector._test(C,"",B.previous)){return true;}}return false;},">":function(C,B){return A.Selector._test(C.parentNode,null,B.previous);},"+":function(D,C){var B=D.previousSibling;while(B&&B.nodeType!==1){B=B.previousSibling;}if(B&&A.Selector._test(B,null,C.previous)){return true;}return false;},"~":function(D,C){var B=D.previousSibling;while(B){if(B.nodeType===1&&A.Selector._test(B,null,C.previous)){return true;}B=B.previousSibling;}return false;}},_getNth:function(C,L,N,G){A.Selector._re.nth.test(L);var K=parseInt(RegExp.$1,10),B=RegExp.$2,H=RegExp.$3,I=parseInt(RegExp.$4,10)||0,M=[],E;var J=A.Selector._getChildren(C.parentNode,N);if(H){K=2;E="+";B="n";I=(H==="odd")?1:0;}else{if(isNaN(K)){K=(B)?1:0;}}if(K===0){if(G){I=J.length-I+1;}if(J[I-1]===C){return true;}else{return false;}}else{if(K<0){G=!!G;K=Math.abs(K);}}if(!G){for(var D=I-1,F=J.length;D<F;D+=K){if(D>=0&&J[D]===C){return true;}}}else{for(var D=J.length-I,F=J.length;D>=0;D-=K){if(D<F&&J[D]===C){return true;}}}return false;},_getId:function(C){for(var D=0,B=C.length;D<B;
++D){if(C[D][0]=="id"&&C[D][1]==="="){return C[D][2];}}},_getIdTokenIndex:function(D){for(var C=0,B=D.length;C<B;++C){if(A.Selector._getId(D[C].attributes)){return C;}}return -1;},_patterns:{tag:/^((?:-?[_a-z]+[\w-]*)|\*)/i,attributes:/^\[([a-z]+\w*)+([~\|\^\$\*!=]=?)?['"]?([^\]]*?)['"]?\]/i,pseudos:/^:([-\w]+)(?:\(['"]?(.+)['"]?\))*/i,combinator:/^\s*([>+~]|\s)\s*/},_tokenize:function(B){var D={},H=[],I,G=false,F=A.Selector._patterns,C;B=A.Selector._replaceShorthand(B);do{G=false;for(var E in F){if(YAHOO.lang.hasOwnProperty(F,E)){if(E!="tag"&&E!="combinator"){D[E]=D[E]||[];}if((C=F[E].exec(B))){G=true;if(E!="tag"&&E!="combinator"){if(E==="attributes"&&C[1]==="id"){D.id=C[3];}D[E].push(C.slice(1));}else{D[E]=C[1];}B=B.replace(C[0],"");if(E==="combinator"||!B.length){D.attributes=A.Selector._fixAttributes(D.attributes);D.pseudos=D.pseudos||[];D.tag=D.tag?D.tag.toUpperCase():"*";H.push(D);D={previous:D};}}}}}while(G);return H;},_fixAttributes:function(C){var D=A.Selector.attrAliases;C=C||[];for(var E=0,B=C.length;E<B;++E){if(D[C[E][0]]){C[E][0]=D[C[E][0]];}if(!C[E][1]){C[E][1]="";}}return C;},_replaceShorthand:function(C){var D=A.Selector.shorthand;var E=C.match(A.Selector._re.attr);if(E){C=C.replace(A.Selector._re.attr,"REPLACED_ATTRIBUTE");}for(var G in D){if(YAHOO.lang.hasOwnProperty(D,G)){C=C.replace(A.Selector._getRegExp(G,"gi"),D[G]);}}if(E){for(var F=0,B=E.length;F<B;++F){C=C.replace("REPLACED_ATTRIBUTE",E[F]);}}return C;}};if(YAHOO.env.ua.ie&&YAHOO.env.ua.ie<8){A.Selector.attrAliases["class"]="className";A.Selector.attrAliases["for"]="htmlFor";}})();YAHOO.register("selector",YAHOO.util.Selector,{version:"2.7.0",build:"1796"});/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
(function(){var C=YAHOO.util.Dom,A=YAHOO.util.Event,D=YAHOO.lang;var B=function(F,E){if(D.isObject(F)&&!F.tagName){E=F;F=null;}if(D.isString(F)){if(C.get(F)){F=C.get(F);}}if(!F){F=document.body;}var G={element:F,attributes:E||{}};B.superclass.constructor.call(this,G.element,G.attributes);};B._instances={};B.getLayoutById=function(E){if(B._instances[E]){return B._instances[E];}return false;};YAHOO.extend(B,YAHOO.util.Element,{browser:function(){var E=YAHOO.env.ua;E.standardsMode=false;E.secure=false;return E;}(),_units:null,_rendered:null,_zIndex:null,_sizes:null,_setBodySize:function(G){var F=0,E=0;G=((G===false)?false:true);if(this._isBody){F=C.getClientHeight();E=C.getClientWidth();}else{F=parseInt(this.getStyle("height"),10);E=parseInt(this.getStyle("width"),10);if(isNaN(E)){E=this.get("element").clientWidth;}if(isNaN(F)){F=this.get("element").clientHeight;}}if(this.get("minWidth")){if(E<this.get("minWidth")){E=this.get("minWidth");}}if(this.get("minHeight")){if(F<this.get("minHeight")){F=this.get("minHeight");}}if(G){C.setStyle(this._doc,"height",F+"px");C.setStyle(this._doc,"width",E+"px");}this._sizes.doc={h:F,w:E};this._setSides(G);},_setSides:function(J){var H=((this._units.top)?this._units.top.get("height"):0),G=((this._units.bottom)?this._units.bottom.get("height"):0),I=this._sizes.doc.h,E=this._sizes.doc.w;J=((J===false)?false:true);this._sizes.top={h:H,w:((this._units.top)?E:0),t:0};this._sizes.bottom={h:G,w:((this._units.bottom)?E:0)};var F=(I-(H+G));this._sizes.left={h:F,w:((this._units.left)?this._units.left.get("width"):0)};this._sizes.right={h:F,w:((this._units.right)?this._units.right.get("width"):0),l:((this._units.right)?(E-this._units.right.get("width")):0),t:((this._units.top)?this._sizes.top.h:0)};if(this._units.right&&J){this._units.right.set("top",this._sizes.right.t);if(!this._units.right._collapsing){this._units.right.set("left",this._sizes.right.l);}this._units.right.set("height",this._sizes.right.h,true);}if(this._units.left){this._sizes.left.l=0;if(this._units.top){this._sizes.left.t=this._sizes.top.h;}else{this._sizes.left.t=0;}if(J){this._units.left.set("top",this._sizes.left.t);this._units.left.set("height",this._sizes.left.h,true);this._units.left.set("left",0);}}if(this._units.bottom){this._sizes.bottom.t=this._sizes.top.h+this._sizes.left.h;if(J){this._units.bottom.set("top",this._sizes.bottom.t);this._units.bottom.set("width",this._sizes.bottom.w,true);}}if(this._units.top){if(J){this._units.top.set("width",this._sizes.top.w,true);}}this._setCenter(J);},_setCenter:function(G){G=((G===false)?false:true);var F=this._sizes.left.h;var E=(this._sizes.doc.w-(this._sizes.left.w+this._sizes.right.w));if(G){this._units.center.set("height",F,true);this._units.center.set("width",E,true);this._units.center.set("top",this._sizes.top.h);this._units.center.set("left",this._sizes.left.w);}this._sizes.center={h:F,w:E,t:this._sizes.top.h,l:this._sizes.left.w};},getSizes:function(){return this._sizes;},getUnitById:function(E){return YAHOO.widget.LayoutUnit.getLayoutUnitById(E);},getUnitByPosition:function(E){if(E){E=E.toLowerCase();if(this._units[E]){return this._units[E];}return false;}return false;},removeUnit:function(E){delete this._units[E.get("position")];this.resize();},addUnit:function(G){if(!G.position){return false;}if(this._units[G.position]){return false;}var H=null,J=null;if(G.id){if(C.get(G.id)){H=C.get(G.id);delete G.id;}}if(G.element){H=G.element;}if(!J){J=document.createElement("div");var L=C.generateId();J.id=L;}if(!H){H=document.createElement("div");}C.addClass(H,"yui-layout-wrap");if(this.browser.ie&&!this.browser.standardsMode){J.style.zoom=1;H.style.zoom=1;}if(J.firstChild){J.insertBefore(H,J.firstChild);}else{J.appendChild(H);}this._doc.appendChild(J);var I=false,F=false;if(G.height){I=parseInt(G.height,10);}if(G.width){F=parseInt(G.width,10);}var E={};YAHOO.lang.augmentObject(E,G);E.parent=this;E.wrap=H;E.height=I;E.width=F;var K=new YAHOO.widget.LayoutUnit(J,E);K.on("heightChange",this.resize,this,true);K.on("widthChange",this.resize,this,true);K.on("gutterChange",this.resize,this,true);this._units[G.position]=K;if(this._rendered){this.resize();}return K;},_createUnits:function(){var E=this.get("units");for(var F in E){if(D.hasOwnProperty(E,F)){this.addUnit(E[F]);}}},resize:function(F){F=((F===false)?false:true);if(F){var E=this.fireEvent("beforeResize");if(E===false){F=false;}if(this.browser.ie){if(this._isBody){C.removeClass(document.documentElement,"yui-layout");C.addClass(document.documentElement,"yui-layout");}else{this.removeClass("yui-layout");this.addClass("yui-layout");}}}this._setBodySize(F);if(F){this.fireEvent("resize",{target:this,sizes:this._sizes});}return this;},_setupBodyElements:function(){this._doc=C.get("layout-doc");if(!this._doc){this._doc=document.createElement("div");this._doc.id="layout-doc";if(document.body.firstChild){document.body.insertBefore(this._doc,document.body.firstChild);}else{document.body.appendChild(this._doc);}}this._createUnits();this._setBodySize();A.on(window,"resize",this.resize,this,true);C.addClass(this._doc,"yui-layout-doc");},_setupElements:function(){this._doc=this.getElementsByClassName("yui-layout-doc")[0];if(!this._doc){this._doc=document.createElement("div");this.get("element").appendChild(this._doc);}this._createUnits();this._setBodySize();C.addClass(this._doc,"yui-layout-doc");},_isBody:null,_doc:null,init:function(F,E){this._zIndex=0;B.superclass.init.call(this,F,E);if(this.get("parent")){this._zIndex=this.get("parent")._zIndex+10;}this._sizes={};this._units={};var G=F;if(!D.isString(G)){G=C.generateId(G);}B._instances[G]=this;},render:function(){this._stamp();var E=this.get("element");if(E&&E.tagName&&(E.tagName.toLowerCase()=="body")){this._isBody=true;C.addClass(document.body,"yui-layout");if(C.hasClass(document.body,"yui-skin-sam")){C.addClass(document.documentElement,"yui-skin-sam");C.removeClass(document.body,"yui-skin-sam");}this._setupBodyElements();}else{this._isBody=false;this.addClass("yui-layout");
this._setupElements();}this.resize();this._rendered=true;this.fireEvent("render");return this;},_stamp:function(){if(document.compatMode=="CSS1Compat"){this.browser.standardsMode=true;}if(window.location.href.toLowerCase().indexOf("https")===0){C.addClass(document.documentElement,"secure");this.browser.secure=true;}},initAttributes:function(E){B.superclass.initAttributes.call(this,E);this.setAttributeConfig("units",{writeOnce:true,validator:YAHOO.lang.isArray,value:E.units||[]});this.setAttributeConfig("minHeight",{value:E.minHeight||false,validator:YAHOO.lang.isNumber});this.setAttributeConfig("minWidth",{value:E.minWidth||false,validator:YAHOO.lang.isNumber});this.setAttributeConfig("height",{value:E.height||false,validator:YAHOO.lang.isNumber,method:function(F){this.setStyle("height",F+"px");}});this.setAttributeConfig("width",{value:E.width||false,validator:YAHOO.lang.isNumber,method:function(F){this.setStyle("width",F+"px");}});this.setAttributeConfig("parent",{writeOnce:true,value:E.parent||false,method:function(F){if(F){F.on("resize",this.resize,this,true);}}});},destroy:function(){var G=this.get("parent");if(G){G.removeListener("resize",this.resize,this,true);}A.removeListener(window,"resize",this.resize,this,true);this.unsubscribeAll();for(var E in this._units){if(D.hasOwnProperty(this._units,E)){if(this._units[E]){this._units[E].destroy(true);}}}A.purgeElement(this.get("element"));this.get("parentNode").removeChild(this.get("element"));delete YAHOO.widget.Layout._instances[this.get("id")];for(var F in this){if(D.hasOwnProperty(this,F)){this[F]=null;delete this[F];}}if(G){G.resize();}},toString:function(){if(this.get){return"Layout #"+this.get("id");}return"Layout";}});YAHOO.widget.Layout=B;})();(function(){var D=YAHOO.util.Dom,C=YAHOO.util.Selector,A=YAHOO.util.Event,E=YAHOO.lang;var B=function(G,F){var H={element:G,attributes:F||{}};B.superclass.constructor.call(this,H.element,H.attributes);};B._instances={};B.getLayoutUnitById=function(F){if(B._instances[F]){return B._instances[F];}return false;};YAHOO.extend(B,YAHOO.util.Element,{STR_CLOSE:"Click to close this pane.",STR_COLLAPSE:"Click to collapse this pane.",STR_EXPAND:"Click to expand this pane.",LOADING_CLASSNAME:"loading",browser:null,_sizes:null,_anim:null,_resize:null,_clip:null,_gutter:null,header:null,body:null,footer:null,_collapsed:null,_collapsing:null,_lastWidth:null,_lastHeight:null,_lastTop:null,_lastLeft:null,_lastScroll:null,_lastCenterScroll:null,_lastScrollTop:null,resize:function(F){var G=this.fireEvent("beforeResize");if(G===false){return this;}if(!this._collapsing||(F===true)){var N=this.get("scroll");this.set("scroll",false);var K=this._getBoxSize(this.header),J=this._getBoxSize(this.footer),L=[this.get("height"),this.get("width")];var H=(L[0]-K[0]-J[0])-(this._gutter.top+this._gutter.bottom),M=L[1]-(this._gutter.left+this._gutter.right);var O=(H+(K[0]+J[0])),I=M;if(this._collapsed&&!this._collapsing){this._setHeight(this._clip,O);this._setWidth(this._clip,I);D.setStyle(this._clip,"top",this.get("top")+this._gutter.top+"px");D.setStyle(this._clip,"left",this.get("left")+this._gutter.left+"px");}else{if(!this._collapsed||(this._collapsed&&this._collapsing)){O=this._setHeight(this.get("wrap"),O);I=this._setWidth(this.get("wrap"),I);this._sizes.wrap.h=O;this._sizes.wrap.w=I;D.setStyle(this.get("wrap"),"top",this._gutter.top+"px");D.setStyle(this.get("wrap"),"left",this._gutter.left+"px");this._sizes.header.w=this._setWidth(this.header,I);this._sizes.header.h=K[0];this._sizes.footer.w=this._setWidth(this.footer,I);this._sizes.footer.h=J[0];D.setStyle(this.footer,"bottom","0px");this._sizes.body.h=this._setHeight(this.body,(O-(K[0]+J[0])));this._sizes.body.w=this._setWidth(this.body,I);D.setStyle(this.body,"top",K[0]+"px");this.set("scroll",N);this.fireEvent("resize");}}}return this;},_setWidth:function(H,G){if(H){var F=this._getBorderSizes(H);G=(G-(F[1]+F[3]));G=this._fixQuirks(H,G,"w");if(G<0){G=0;}D.setStyle(H,"width",G+"px");}return G;},_setHeight:function(H,G){if(H){var F=this._getBorderSizes(H);G=(G-(F[0]+F[2]));G=this._fixQuirks(H,G,"h");if(G<0){G=0;}D.setStyle(H,"height",G+"px");}return G;},_fixQuirks:function(I,L,G){var K=0,H=2;if(G=="w"){K=1;H=3;}if(this.browser.ie&&!this.browser.standardsMode){var F=this._getBorderSizes(I),J=this._getBorderSizes(I.parentNode);if((F[K]===0)&&(F[H]===0)){if((J[K]!==0)&&(J[H]!==0)){L=(L-(J[K]+J[H]));}}else{if((J[K]===0)&&(J[H]===0)){L=(L+(F[K]+F[H]));}}}return L;},_getBoxSize:function(H){var G=[0,0];if(H){if(this.browser.ie&&!this.browser.standardsMode){H.style.zoom=1;}var F=this._getBorderSizes(H);G[0]=H.clientHeight+(F[0]+F[2]);G[1]=H.clientWidth+(F[1]+F[3]);}return G;},_getBorderSizes:function(H){var G=[];H=H||this.get("element");if(this.browser.ie&&!this.browser.standardsMode){H.style.zoom=1;}G[0]=parseInt(D.getStyle(H,"borderTopWidth"),10);G[1]=parseInt(D.getStyle(H,"borderRightWidth"),10);G[2]=parseInt(D.getStyle(H,"borderBottomWidth"),10);G[3]=parseInt(D.getStyle(H,"borderLeftWidth"),10);for(var F=0;F<G.length;F++){if(isNaN(G[F])){G[F]=0;}}return G;},_createClip:function(){if(!this._clip){this._clip=document.createElement("div");this._clip.className="yui-layout-clip yui-layout-clip-"+this.get("position");this._clip.innerHTML='<div class="collapse"></div>';var F=this._clip.firstChild;F.title=this.STR_EXPAND;A.on(F,"click",this.expand,this,true);this.get("element").parentNode.appendChild(this._clip);}},_toggleClip:function(){if(!this._collapsed){var J=this._getBoxSize(this.header),K=this._getBoxSize(this.footer),I=[this.get("height"),this.get("width")];var H=(I[0]-J[0]-K[0])-(this._gutter.top+this._gutter.bottom),F=I[1]-(this._gutter.left+this._gutter.right),G=(H+(J[0]+K[0]));switch(this.get("position")){case"top":case"bottom":this._setWidth(this._clip,F);this._setHeight(this._clip,this.get("collapseSize"));D.setStyle(this._clip,"left",(this._lastLeft+this._gutter.left)+"px");if(this.get("position")=="bottom"){D.setStyle(this._clip,"top",((this._lastTop+this._lastHeight)-(this.get("collapseSize")-this._gutter.top))+"px");
}else{D.setStyle(this._clip,"top",this.get("top")+this._gutter.top+"px");}break;case"left":case"right":this._setWidth(this._clip,this.get("collapseSize"));this._setHeight(this._clip,G);D.setStyle(this._clip,"top",(this.get("top")+this._gutter.top)+"px");if(this.get("position")=="right"){D.setStyle(this._clip,"left",(((this._lastLeft+this._lastWidth)-this.get("collapseSize"))-this._gutter.left)+"px");}else{D.setStyle(this._clip,"left",(this.get("left")+this._gutter.left)+"px");}break;}D.setStyle(this._clip,"display","block");this.setStyle("display","none");}else{D.setStyle(this._clip,"display","none");}},getSizes:function(){return this._sizes;},toggle:function(){if(this._collapsed){this.expand();}else{this.collapse();}return this;},expand:function(){if(!this._collapsed){return this;}var L=this.fireEvent("beforeExpand");if(L===false){return this;}this._collapsing=true;this.setStyle("zIndex",this.get("parent")._zIndex+1);if(this._anim){this.setStyle("display","none");var F={},H;switch(this.get("position")){case"left":case"right":this.set("width",this._lastWidth,true);this.setStyle("width",this._lastWidth+"px");this.get("parent").resize(false);H=this.get("parent").getSizes()[this.get("position")];this.set("height",H.h,true);var K=H.l;F={left:{to:K}};if(this.get("position")=="left"){F.left.from=(K-H.w);this.setStyle("left",(K-H.w)+"px");}break;case"top":case"bottom":this.set("height",this._lastHeight,true);this.setStyle("height",this._lastHeight+"px");this.get("parent").resize(false);H=this.get("parent").getSizes()[this.get("position")];this.set("width",H.w,true);var J=H.t;F={top:{to:J}};if(this.get("position")=="top"){this.setStyle("top",(J-H.h)+"px");F.top.from=(J-H.h);}break;}this._anim.attributes=F;var I=function(){this.setStyle("display","block");this.resize(true);this._anim.onStart.unsubscribe(I,this,true);};var G=function(){this._collapsing=false;this.setStyle("zIndex",this.get("parent")._zIndex);this.set("width",this._lastWidth);this.set("height",this._lastHeight);this._collapsed=false;this.resize();this.set("scroll",this._lastScroll);if(this._lastScrollTop>0){this.body.scrollTop=this._lastScrollTop;}this._anim.onComplete.unsubscribe(G,this,true);this.fireEvent("expand");};this._anim.onStart.subscribe(I,this,true);this._anim.onComplete.subscribe(G,this,true);this._anim.animate();this._toggleClip();}else{this._collapsing=false;this._toggleClip();this._collapsed=false;this.setStyle("zIndex",this.get("parent")._zIndex);this.setStyle("display","block");this.set("width",this._lastWidth);this.set("height",this._lastHeight);this.resize();this.set("scroll",this._lastScroll);if(this._lastScrollTop>0){this.body.scrollTop=this._lastScrollTop;}this.fireEvent("expand");}return this;},collapse:function(){if(this._collapsed){return this;}var J=this.fireEvent("beforeCollapse");if(J===false){return this;}if(!this._clip){this._createClip();}this._collapsing=true;var G=this.get("width"),H=this.get("height"),F={};this._lastWidth=G;this._lastHeight=H;this._lastScroll=this.get("scroll");this._lastScrollTop=this.body.scrollTop;this.set("scroll",false,true);this._lastLeft=parseInt(this.get("element").style.left,10);this._lastTop=parseInt(this.get("element").style.top,10);if(isNaN(this._lastTop)){this._lastTop=0;this.set("top",0);}if(isNaN(this._lastLeft)){this._lastLeft=0;this.set("left",0);}this.setStyle("zIndex",this.get("parent")._zIndex+1);var K=this.get("position");switch(K){case"top":case"bottom":this.set("height",(this.get("collapseSize")+(this._gutter.top+this._gutter.bottom)));F={top:{to:(this.get("top")-H)}};if(K=="bottom"){F.top.to=(this.get("top")+H);}break;case"left":case"right":this.set("width",(this.get("collapseSize")+(this._gutter.left+this._gutter.right)));F={left:{to:-(this._lastWidth)}};if(K=="right"){F.left={to:(this.get("left")+G)};}break;}if(this._anim){this._anim.attributes=F;var I=function(){this._collapsing=false;this._toggleClip();this.setStyle("zIndex",this.get("parent")._zIndex);this._collapsed=true;this.get("parent").resize();this._anim.onComplete.unsubscribe(I,this,true);this.fireEvent("collapse");};this._anim.onComplete.subscribe(I,this,true);this._anim.animate();}else{this._collapsing=false;this.setStyle("display","none");this._toggleClip();this.setStyle("zIndex",this.get("parent")._zIndex);this.get("parent").resize();this._collapsed=true;this.fireEvent("collapse");}return this;},close:function(){this.setStyle("display","none");this.get("parent").removeUnit(this);this.fireEvent("close");if(this._clip){this._clip.parentNode.removeChild(this._clip);this._clip=null;}return this.get("parent");},loadHandler:{success:function(F){this.body.innerHTML=F.responseText;this.resize(true);},failure:function(F){}},dataConnection:null,_loading:false,loadContent:function(){if(YAHOO.util.Connect&&this.get("dataSrc")&&!this._loading&&!this.get("dataLoaded")){this._loading=true;D.addClass(this.body,this.LOADING_CLASSNAME);this.dataConnection=YAHOO.util.Connect.asyncRequest(this.get("loadMethod"),this.get("dataSrc"),{success:function(F){this.loadHandler.success.call(this,F);this.set("dataLoaded",true);this.dataConnection=null;D.removeClass(this.body,this.LOADING_CLASSNAME);this._loading=false;this.fireEvent("load");},failure:function(F){this.loadHandler.failure.call(this,F);this.dataConnection=null;D.removeClass(this.body,this.LOADING_CLASSNAME);this._loading=false;this.fireEvent("loadError",{error:F});},scope:this,timeout:this.get("dataTimeout")});return this.dataConnection;}return false;},init:function(H,G){this._gutter={left:0,right:0,top:0,bottom:0};this._sizes={wrap:{h:0,w:0},header:{h:0,w:0},body:{h:0,w:0},footer:{h:0,w:0}};B.superclass.init.call(this,H,G);this.browser=this.get("parent").browser;var K=H;if(!E.isString(K)){K=D.generateId(K);}B._instances[K]=this;this.setStyle("position","absolute");this.addClass("yui-layout-unit");this.addClass("yui-layout-unit-"+this.get("position"));var J=this.getElementsByClassName("yui-layout-hd","div")[0];if(J){this.header=J;}var F=this.getElementsByClassName("yui-layout-bd","div")[0];
if(F){this.body=F;}var I=this.getElementsByClassName("yui-layout-ft","div")[0];if(I){this.footer=I;}this.on("contentChange",this.resize,this,true);this._lastScrollTop=0;this.set("animate",this.get("animate"));},initAttributes:function(F){B.superclass.initAttributes.call(this,F);this.setAttributeConfig("wrap",{value:F.wrap||null,method:function(G){if(G){var H=D.generateId(G);B._instances[H]=this;}}});this.setAttributeConfig("grids",{value:F.grids||false});this.setAttributeConfig("top",{value:F.top||0,validator:E.isNumber,method:function(G){if(!this._collapsing){this.setStyle("top",G+"px");}}});this.setAttributeConfig("left",{value:F.left||0,validator:E.isNumber,method:function(G){if(!this._collapsing){this.setStyle("left",G+"px");}}});this.setAttributeConfig("minWidth",{value:F.minWidth||false,validator:YAHOO.lang.isNumber});this.setAttributeConfig("maxWidth",{value:F.maxWidth||false,validator:YAHOO.lang.isNumber});this.setAttributeConfig("minHeight",{value:F.minHeight||false,validator:YAHOO.lang.isNumber});this.setAttributeConfig("maxHeight",{value:F.maxHeight||false,validator:YAHOO.lang.isNumber});this.setAttributeConfig("height",{value:F.height,validator:E.isNumber,method:function(G){if(!this._collapsing){if(G<0){G=0;}this.setStyle("height",G+"px");}}});this.setAttributeConfig("width",{value:F.width,validator:E.isNumber,method:function(G){if(!this._collapsing){if(G<0){G=0;}this.setStyle("width",G+"px");}}});this.setAttributeConfig("zIndex",{value:F.zIndex||false,method:function(G){this.setStyle("zIndex",G);}});this.setAttributeConfig("position",{value:F.position});this.setAttributeConfig("gutter",{value:F.gutter||0,validator:YAHOO.lang.isString,method:function(H){var G=H.split(" ");if(G.length){this._gutter.top=parseInt(G[0],10);if(G[1]){this._gutter.right=parseInt(G[1],10);}else{this._gutter.right=this._gutter.top;}if(G[2]){this._gutter.bottom=parseInt(G[2],10);}else{this._gutter.bottom=this._gutter.top;}if(G[3]){this._gutter.left=parseInt(G[3],10);}else{if(G[1]){this._gutter.left=this._gutter.right;}else{this._gutter.left=this._gutter.top;}}}}});this.setAttributeConfig("parent",{writeOnce:true,value:F.parent||false,method:function(G){if(G){G.on("resize",this.resize,this,true);}}});this.setAttributeConfig("collapseSize",{value:F.collapseSize||25,validator:YAHOO.lang.isNumber});this.setAttributeConfig("duration",{value:F.duration||0.5});this.setAttributeConfig("easing",{value:F.easing||((YAHOO.util&&YAHOO.util.Easing)?YAHOO.util.Easing.BounceIn:"false")});this.setAttributeConfig("animate",{value:((F.animate===false)?false:true),validator:function(){var G=false;if(YAHOO.util.Anim){G=true;}return G;},method:function(G){if(G){this._anim=new YAHOO.util.Anim(this.get("element"),{},this.get("duration"),this.get("easing"));}else{this._anim=false;}}});this.setAttributeConfig("header",{value:F.header||false,method:function(G){if(G===false){if(this.header){D.addClass(this.body,"yui-layout-bd-nohd");this.header.parentNode.removeChild(this.header);this.header=null;}}else{if(!this.header){var I=this.getElementsByClassName("yui-layout-hd","div")[0];if(!I){I=this._createHeader();}this.header=I;}var H=this.header.getElementsByTagName("h2")[0];if(!H){H=document.createElement("h2");this.header.appendChild(H);}H.innerHTML=G;if(this.body){D.removeClass(this.body,"yui-layout-bd-nohd");}}this.fireEvent("contentChange",{target:"header"});}});this.setAttributeConfig("proxy",{writeOnce:true,value:((F.proxy===false)?false:true)});this.setAttributeConfig("body",{value:F.body||false,method:function(I){if(!this.body){var G=this.getElementsByClassName("yui-layout-bd","div")[0];if(G){this.body=G;}else{G=document.createElement("div");G.className="yui-layout-bd";this.body=G;this.get("wrap").appendChild(G);}}if(!this.header){D.addClass(this.body,"yui-layout-bd-nohd");}D.addClass(this.body,"yui-layout-bd-noft");var H=null;if(E.isString(I)){H=D.get(I);}else{if(I&&I.tagName){H=I;}}if(H){var J=D.generateId(H);B._instances[J]=this;this.body.appendChild(H);}else{this.body.innerHTML=I;}this._cleanGrids();this.fireEvent("contentChange",{target:"body"});}});this.setAttributeConfig("footer",{value:F.footer||false,method:function(H){if(H===false){if(this.footer){D.addClass(this.body,"yui-layout-bd-noft");this.footer.parentNode.removeChild(this.footer);this.footer=null;}}else{if(!this.footer){var I=this.getElementsByClassName("yui-layout-ft","div")[0];if(!I){I=document.createElement("div");I.className="yui-layout-ft";this.footer=I;this.get("wrap").appendChild(I);}else{this.footer=I;}}var G=null;if(E.isString(H)){G=D.get(H);}else{if(H&&H.tagName){G=H;}}if(G){this.footer.appendChild(G);}else{this.footer.innerHTML=H;}D.removeClass(this.body,"yui-layout-bd-noft");}this.fireEvent("contentChange",{target:"footer"});}});this.setAttributeConfig("close",{value:F.close||false,method:function(G){if(this.get("position")=="center"){return false;}if(!this.header){this._createHeader();}var H=D.getElementsByClassName("close","div",this.header)[0];if(G){if(!this.get("header")){this.set("header","&nbsp;");}if(!H){H=document.createElement("div");H.className="close";this.header.appendChild(H);A.on(H,"click",this.close,this,true);}H.title=this.STR_CLOSE;}else{if(H){A.purgeElement(H);H.parentNode.removeChild(H);}}this._configs.close.value=G;this.set("collapse",this.get("collapse"));}});this.setAttributeConfig("collapse",{value:F.collapse||false,method:function(G){if(this.get("position")=="center"){return false;}if(!this.header){this._createHeader();}var H=D.getElementsByClassName("collapse","div",this.header)[0];if(G){if(!this.get("header")){this.set("header","&nbsp;");}if(!H){H=document.createElement("div");this.header.appendChild(H);A.on(H,"click",this.collapse,this,true);}H.title=this.STR_COLLAPSE;H.className="collapse"+((this.get("close"))?" collapse-close":"");}else{if(H){A.purgeElement(H);H.parentNode.removeChild(H);}}}});this.setAttributeConfig("scroll",{value:(((F.scroll===true)||(F.scroll===false)||(F.scroll===null))?F.scroll:false),method:function(G){if((G===false)&&!this._collapsed){if(this.body){if(this.body.scrollTop>0){this._lastScrollTop=this.body.scrollTop;
}}}if(G===true){this.addClass("yui-layout-scroll");this.removeClass("yui-layout-noscroll");if(this._lastScrollTop>0){if(this.body){this.body.scrollTop=this._lastScrollTop;}}}else{if(G===false){this.removeClass("yui-layout-scroll");this.addClass("yui-layout-noscroll");}else{if(G===null){this.removeClass("yui-layout-scroll");this.removeClass("yui-layout-noscroll");}}}}});this.setAttributeConfig("hover",{writeOnce:true,value:F.hover||false,validator:YAHOO.lang.isBoolean});this.setAttributeConfig("useShim",{value:F.useShim||false,validator:YAHOO.lang.isBoolean,method:function(G){if(this._resize){this._resize.set("useShim",G);}}});this.setAttributeConfig("resize",{value:F.resize||false,validator:function(G){if(YAHOO.util&&YAHOO.util.Resize){return true;}return false;},method:function(G){if(G&&!this._resize){if(this.get("position")=="center"){return false;}var I=false;switch(this.get("position")){case"top":I="b";break;case"bottom":I="t";break;case"right":I="l";break;case"left":I="r";break;}this.setStyle("position","absolute");if(I){this._resize=new YAHOO.util.Resize(this.get("element"),{proxy:this.get("proxy"),hover:this.get("hover"),status:false,autoRatio:false,handles:[I],minWidth:this.get("minWidth"),maxWidth:this.get("maxWidth"),minHeight:this.get("minHeight"),maxHeight:this.get("maxHeight"),height:this.get("height"),width:this.get("width"),setSize:false,useShim:this.get("useShim"),wrap:false});this._resize._handles[I].innerHTML='<div class="yui-layout-resize-knob"></div>';if(this.get("proxy")){var H=this._resize.getProxyEl();H.innerHTML='<div class="yui-layout-handle-'+I+'"></div>';}this._resize.on("startResize",function(J){this._lastScroll=this.get("scroll");this.set("scroll",false);if(this.get("parent")){this.get("parent").fireEvent("startResize");var K=this.get("parent").getUnitByPosition("center");this._lastCenterScroll=K.get("scroll");K.addClass(this._resize.CSS_RESIZING);K.set("scroll",false);}this.fireEvent("startResize");},this,true);this._resize.on("resize",function(J){this.set("height",J.height);this.set("width",J.width);},this,true);this._resize.on("endResize",function(J){this.set("scroll",this._lastScroll);if(this.get("parent")){var K=this.get("parent").getUnitByPosition("center");K.set("scroll",this._lastCenterScroll);K.removeClass(this._resize.CSS_RESIZING);}this.resize();this.fireEvent("endResize");},this,true);}}else{if(this._resize){this._resize.destroy();}}}});this.setAttributeConfig("dataSrc",{value:F.dataSrc});this.setAttributeConfig("loadMethod",{value:F.loadMethod||"GET",validator:YAHOO.lang.isString});this.setAttributeConfig("dataLoaded",{value:false,validator:YAHOO.lang.isBoolean,writeOnce:true});this.setAttributeConfig("dataTimeout",{value:F.dataTimeout||null,validator:YAHOO.lang.isNumber});},_cleanGrids:function(){if(this.get("grids")){var F=C.query("div.yui-b",this.body,true);if(F){D.removeClass(F,"yui-b");}A.onAvailable("yui-main",function(){D.setStyle(C.query("#yui-main"),"margin-left","0");D.setStyle(C.query("#yui-main"),"margin-right","0");});}},_createHeader:function(){var F=document.createElement("div");F.className="yui-layout-hd";if(this.get("firstChild")){this.get("wrap").insertBefore(F,this.get("wrap").firstChild);}else{this.get("wrap").appendChild(F);}this.header=F;return F;},destroy:function(H){if(this._resize){this._resize.destroy();}var G=this.get("parent");this.setStyle("display","none");if(this._clip){this._clip.parentNode.removeChild(this._clip);this._clip=null;}if(!H){G.removeUnit(this);}if(G){G.removeListener("resize",this.resize,this,true);}this.unsubscribeAll();A.purgeElement(this.get("element"));this.get("parentNode").removeChild(this.get("element"));delete YAHOO.widget.LayoutUnit._instances[this.get("id")];for(var F in this){if(E.hasOwnProperty(this,F)){this[F]=null;delete this[F];}}return G;},toString:function(){if(this.get){return"LayoutUnit #"+this.get("id")+" ("+this.get("position")+")";}return"LayoutUnit";}});YAHOO.widget.LayoutUnit=B;})();YAHOO.register("layout",YAHOO.widget.Layout,{version:"2.7.0",build:"1796"});/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.7.0
*/
(function(){var I=document,B=I.createElement("p"),D=B.style,C=YAHOO.lang,L={},H={},E=0,J=("cssFloat" in D)?"cssFloat":"styleFloat",F,A,K;A=("opacity" in D)?function(M){M.opacity="";}:function(M){M.filter="";};D.border="1px solid red";D.border="";K=D.borderLeft?function(M,O){var N;if(O!==J&&O.toLowerCase().indexOf("float")!=-1){O=J;}if(typeof M[O]==="string"){switch(O){case"opacity":case"filter":A(M);break;case"font":M.font=M.fontStyle=M.fontVariant=M.fontWeight=M.fontSize=M.lineHeight=M.fontFamily="";break;default:for(N in M){if(N.indexOf(O)===0){M[N]="";}}}}}:function(M,N){if(N!==J&&N.toLowerCase().indexOf("float")!=-1){N=J;}if(C.isString(M[N])){if(N==="opacity"){A(M);}else{M[N]="";}}};function G(T,O){var W,R,V,U={},N,X,Q,S,M,P;if(!(this instanceof arguments.callee)){return new arguments.callee(T,O);}W=I.getElementsByTagName("head")[0];if(!W){throw new Error("HEAD element not found to append STYLE node");}R=T&&(T.nodeName?T:I.getElementById(T));if(T&&H[T]){return H[T];}else{if(R&&R.yuiSSID&&H[R.yuiSSID]){return H[R.yuiSSID];}}if(!R||!/^(?:style|link)$/i.test(R.nodeName)){R=I.createElement("style");R.type="text/css";}if(C.isString(T)){if(T.indexOf("{")!=-1){if(R.styleSheet){R.styleSheet.cssText=T;}else{R.appendChild(I.createTextNode(T));}}else{if(!O){O=T;}}}if(R.parentNode!==W){W.appendChild(R);}V=R.sheet||R.styleSheet;N=V&&("cssRules" in V)?"cssRules":"rules";for(S=V[N].length-1;S>=0;--S){M=V[N][S];P=M.selectorText;if(U[P]){U[P].style.cssText+=";"+M.style.cssText;Q(S);}else{U[P]=M;}}Q=("deleteRule" in V)?function(Y){V.deleteRule(Y);}:function(Y){V.removeRule(Y);};X=("insertRule" in V)?function(a,Z,Y){V.insertRule(a+" {"+Z+"}",Y);}:function(a,Z,Y){V.addRule(a,Z,Y);};R.yuiSSID="yui-stylesheet-"+(E++);G.register(R.yuiSSID,this);if(O){G.register(O,this);}C.augmentObject(this,{getId:function(){return R.yuiSSID;},node:R,enable:function(){V.disabled=false;return this;},disable:function(){V.disabled=true;return this;},isEnabled:function(){return !V.disabled;},set:function(b,a){var d=U[b],c=b.split(/\s*,\s*/),Z,Y;if(c.length>1){for(Z=c.length-1;Z>=0;--Z){this.set(c[Z],a);}return this;}if(!G.isValidSelector(b)){return this;}if(d){d.style.cssText=G.toCssText(a,d.style.cssText);}else{Y=V[N].length;a=G.toCssText(a);if(a){X(b,a,Y);U[b]=V[N][Y];}}return this;},unset:function(b,a){var d=U[b],c=b.split(/\s*,\s*/),Y=!a,e,Z;if(c.length>1){for(Z=c.length-1;Z>=0;--Z){this.unset(c[Z],a);}return this;}if(d){if(!Y){if(!C.isArray(a)){a=[a];}D.cssText=d.style.cssText;for(Z=a.length-1;Z>=0;--Z){K(D,a[Z]);}if(D.cssText){d.style.cssText=D.cssText;}else{Y=true;}}if(Y){e=V[N];for(Z=e.length-1;Z>=0;--Z){if(e[Z]===d){delete U[b];Q(Z);break;}}}}return this;},getCssText:function(Z){var a,Y;if(C.isString(Z)){a=U[Z.split(/\s*,\s*/)[0]];return a?a.style.cssText:null;}else{Y=[];for(Z in U){if(U.hasOwnProperty(Z)){a=U[Z];Y.push(a.selectorText+" {"+a.style.cssText+"}");}}return Y.join("\n");}}},true);}F=function(M,O){var N=M.styleFloat||M.cssFloat||M["float"],Q;D.cssText=O||"";if(N&&!M[J]){M=C.merge(M);delete M.styleFloat;delete M.cssFloat;delete M["float"];M[J]=N;}for(Q in M){if(M.hasOwnProperty(Q)){try{D[Q]=C.trim(M[Q]);}catch(P){}}}return D.cssText;};C.augmentObject(G,{toCssText:(("opacity" in D)?F:function(M,N){if("opacity" in M){M=C.merge(M,{filter:"alpha(opacity="+(M.opacity*100)+")"});delete M.opacity;}return F(M,N);}),register:function(M,N){return !!(M&&N instanceof G&&!H[M]&&(H[M]=N));},isValidSelector:function(N){var M=false;if(N&&C.isString(N)){if(!L.hasOwnProperty(N)){L[N]=!/\S/.test(N.replace(/\s+|\s*[+~>]\s*/g," ").replace(/([^ ])\[.*?\]/g,"$1").replace(/([^ ])::?[a-z][a-z\-]+[a-z](?:\(.*?\))?/ig,"$1").replace(/(?:^| )[a-z0-6]+/ig," ").replace(/\\./g,"").replace(/[.#]\w[\w\-]*/g,""));}M=L[N];}return M;}},true);YAHOO.util.StyleSheet=G;})();YAHOO.register("stylesheet",YAHOO.util.StyleSheet,{version:"2.7.0",build:"1796"});
/**
 * http.js: utilities for scripted HTTP requests
 *
 * From the book JavaScript: The Definitive Guide, 5th Edition,
 * by David Flanagan. Copyright 2006 O'Reilly Media, Inc. (ISBN: 0596101996)
 */

var HTTP;
if (HTTP && (typeof HTTP != "object" || HTTP.NAME))
    throw new Error("Namespace 'HTTP' already exists");

HTTP = {};
HTTP.NAME = "HTTP";    // The name of this namespace
HTTP.VERSION = 1.0;    // The version of this namespace

HTTP._factories = [
    function() { return new XMLHttpRequest(); },
    function() { return new ActiveXObject("Msxml2.XMLHTTP"); },
    function() { return new ActiveXObject("Microsoft.XMLHTTP"); }
];

HTTP._factory = null;

/**
 * Create and return a new XMLHttpRequest object.
 *
 * The first time we're called, try the list of factory functions until
 * we find one that returns a nonnull value and does not throw an
 * exception.  Once we find a working factory, remember it for later use.
 */
HTTP.newRequest = function() {
    if (HTTP._factory != null) return HTTP._factory();

    for(var i = 0; i < HTTP._factories.length; i++) {
        try {
            var factory = HTTP._factories[i];
            var request = factory();
            if (request != null) {
                HTTP._factory = factory;
                return request;
            }
        }
        catch(e) {
            continue;
        }
    }

    HTTP._factory = function() {
        throw new Error("XMLHttpRequest not supported");
    }
    HTTP._factory(); // Throw an error
}

/**
 * Use XMLHttpRequest to fetch the contents of the specified URL using
 * an HTTP GET request.  When the response arrives, pass it (as plain
 * text) to the specified callback function.
 *
 * This function does not block and has no return value.
 */
HTTP.getText = function(url, context, callback) {
    var request = HTTP.newRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            callback(request.responseText, context);
        } // else {
    };
    request.open("GET", url);
    request.send(null);
};

/**
 * Use XMLHttpRequest to fetch the contents of the specified URL using
 * an HTTP GET request.  When the response arrives, pass it (as a parsed
 * XML Document object) to the specified callback function.
 *
 * This function does not block and has no return value.
 */
HTTP.getXML = function(url, callback) {
    var request = HTTP.newRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200)
            callback(request.responseXML);
    }
    request.open("GET", url);
    request.send(null);
};

/**
 * Use an HTTP HEAD request to obtain the headers for the specified URL.
 * When the headers arrive, parse them with HTTP.parseHeaders() and pass the
 * resulting object to the specified callback function. If the server returns
 * an error code, invoke the specified errorHandler function instead.  If no
 * error handler is specified, pass null to the callback function.
 */
HTTP.getHeaders = function(url, callback, errorHandler) {
    var request = HTTP.newRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status == 200) {
                callback(HTTP.parseHeaders(request));
            }
            else {
                if (errorHandler) errorHandler(request.status,
                                               request.statusText);
                else callback(null);
            }
        }
    }
    request.open("HEAD", url);
    request.send(null);
};

/**
 * Parse the response headers from an XMLHttpRequest object and return
 * the header names and values as property names and values of a new object.
 */
HTTP.parseHeaders = function(request) {
    var headerText = request.getAllResponseHeaders();  // Text from the server
    var headers = {}; // This will be our return value
    var ls = /^\s*/;  // Leading space regular expression
    var ts = /\s*$/;  // Trailing space regular expression

    var lines = headerText.split("\n");
    for(var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.length == 0) continue;  // Skip empty lines
        var pos = line.indexOf(':');
        var name = line.substring(0, pos).replace(ls, "").replace(ts, "");
        var value = line.substring(pos+1).replace(ls, "").replace(ts, "");
        headers[name] = value;
    }
    return headers;
};

HTTP.post = function(url, values, callback, errorHandler) {
    var request = HTTP.newRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status == 200) {
                callback(HTTP._getResponse(request));
            }
            else {
                if (errorHandler) errorHandler(request.status,
                                               request.statusText);
                else callback(null);
            }
        }
    }

    request.open("POST", url);
    request.setRequestHeader("Content-Type",
                             "application/x-www-form-urlencoded");
    request.send(HTTP.encodeFormData(values));
};

/**
 * Encode the property name/value pairs of an object as if they were from
 * an HTML form, using application/x-www-form-urlencoded format
 */
HTTP.encodeFormData = function(data) {
    var pairs = [];
    var regexp = /%20/g; // A regular expression to match an encoded space

    for(var name in data) {
        var value = data[name].toString();
        var pair = encodeURIComponent(name).replace(regexp,"+") + '=' +
            encodeURIComponent(value).replace(regexp,"+");
        pairs.push(pair);
    }

    return pairs.join('&');
};

/**
 * Parse an HTTP response based on its Content-Type header
 * and return the parsed object
 */
HTTP._getResponse = function(request) {
    switch(request.getResponseHeader("Content-Type")) {
    case "text/xml":
        return request.responseXML;

    case "text/json":
    case "application/json":
    case "text/javascript":
    case "application/javascript":
    case "application/x-javascript":
        return eval(request.responseText);

    default:
        return request.responseText;
    }
};

HTTP.get = function(url, callback, options) {
    var request = HTTP.newRequest();
    var n = 0;
    var timer;
    if (options.timeout)
        timer = setTimeout(function() {
                               request.abort();
                               if (options.timeoutHandler)
                                   options.timeoutHandler(url);
                           },
                           options.timeout);

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (timer) clearTimeout(timer);
            if (request.status == 200) {
                callback(HTTP._getResponse(request));
            }
            else {
                if (options.errorHandler)
                    options.errorHandler(request.status,
                                         request.statusText);
                else callback(null);
            }
        }
        else if (options.progressHandler) {
            options.progressHandler(++n);
        }
    }

    var target = url;
    if (options.parameters)
        target += "?" + HTTP.encodeFormData(options.parameters)
    request.open("GET", target);
    request.send(null);
};

HTTP.getTextWithScript = function(url, callback) {
    var script = document.createElement("script");
    document.body.appendChild(script);

    var funcname = "func" + HTTP.getTextWithScript.counter++;

    HTTP.getTextWithScript[funcname] = function(text) {
        callback(text);

        document.body.removeChild(script);
        delete HTTP.getTextWithScript[funcname];
    }

    script.src = "jsquoter.php" +
                 "?url=" + encodeURIComponent(url) + "&func=" +
                 encodeURIComponent("HTTP.getTextWithScript." + funcname);
}

HTTP.getTextWithScript.counter = 0;



if (!window.CanvasRenderingContext2D) {

(function () {

  var m = Math;
  var mr = m.round;
  var ms = m.sin;
  var mc = m.cos;

  var Z = 10;
  var Z2 = Z / 2;

  var G_vmlCanvasManager_ = {
    init: function (opt_doc) {
      var doc = opt_doc || document;
      if (/MSIE/.test(navigator.userAgent) && !window.opera) {
        var self = this;
        doc.attachEvent("onreadystatechange", function () {
          self.init_(doc);
        });
      }
    },

    init_: function (doc) {
      if (doc.readyState == "complete") {
        if (!doc.namespaces["g_vml_"]) {
          doc.namespaces.add("g_vml_", "urn:schemas-microsoft-com:vml");
        }

        var ss = doc.createStyleSheet();
        ss.cssText = "canvas{display:inline-block;overflow:hidden;" +
            "text-align:left;width:300px;height:150px}" +
            "g_vml_\\:*{behavior:url(#default#VML)}";

        var els = doc.getElementsByTagName("canvas");
        for (var i = 0; i < els.length; i++) {
          if (!els[i].getContext) {
            this.initElement(els[i]);
          }
        }
      }
    },

    fixElement_: function (el) {
      var outerHTML = el.outerHTML;

      var newEl = el.ownerDocument.createElement(outerHTML);
      if (outerHTML.slice(-2) != "/>") {
        var tagName = "/" + el.tagName;
        var ns;
        while ((ns = el.nextSibling) && ns.tagName != tagName) {
          ns.removeNode();
        }
        if (ns) {
          ns.removeNode();
        }
      }
      el.parentNode.replaceChild(newEl, el);
      return newEl;
    },

    /**
     * Public initializes a canvas element so that it can be used as canvas
     * element from now on. This is called automatically before the page is
     * loaded but if you are creating elements using createElement you need to
     * make sure this is called on the element.
     * @param {HTMLElement} el The canvas element to initialize.
     * @return {HTMLElement} the element that was created.
     */
    initElement: function (el) {
      el = this.fixElement_(el);
      el.getContext = function () {
        if (this.context_) {
          return this.context_;
        }
        return this.context_ = new CanvasRenderingContext2D_(this);
      };

      el.attachEvent('onpropertychange', onPropertyChange);
      el.attachEvent('onresize', onResize);

      var attrs = el.attributes;
      if (attrs.width && attrs.width.specified) {
        el.style.width = attrs.width.nodeValue + "px";
      } else {
        el.width = el.clientWidth;
      }
      if (attrs.height && attrs.height.specified) {
        el.style.height = attrs.height.nodeValue + "px";
      } else {
        el.height = el.clientHeight;
      }
      return el;
    }
  };

  function onPropertyChange(e) {
    var el = e.srcElement;

    switch (e.propertyName) {
      case 'width':
        el.style.width = el.attributes.width.nodeValue + "px";
        el.getContext().clearRect();
        break;
      case 'height':
        el.style.height = el.attributes.height.nodeValue + "px";
        el.getContext().clearRect();
        break;
    }
  }

  function onResize(e) {
    var el = e.srcElement;
    if (el.firstChild) {
      el.firstChild.style.width =  el.clientWidth + 'px';
      el.firstChild.style.height = el.clientHeight + 'px';
    }
  }

  G_vmlCanvasManager_.init();

  var dec2hex = [];
  for (var i = 0; i < 16; i++) {
    for (var j = 0; j < 16; j++) {
      dec2hex[i * 16 + j] = i.toString(16) + j.toString(16);
    }
  }

  function createMatrixIdentity() {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
  }

  function matrixMultiply(m1, m2) {
    var result = createMatrixIdentity();

    for (var x = 0; x < 3; x++) {
      for (var y = 0; y < 3; y++) {
        var sum = 0;

        for (var z = 0; z < 3; z++) {
          sum += m1[x][z] * m2[z][y];
        }

        result[x][y] = sum;
      }
    }
    return result;
  }

  function copyState(o1, o2) {
    o2.fillStyle     = o1.fillStyle;
    o2.lineCap       = o1.lineCap;
    o2.lineJoin      = o1.lineJoin;
    o2.lineWidth     = o1.lineWidth;
    o2.miterLimit    = o1.miterLimit;
    o2.shadowBlur    = o1.shadowBlur;
    o2.shadowColor   = o1.shadowColor;
    o2.shadowOffsetX = o1.shadowOffsetX;
    o2.shadowOffsetY = o1.shadowOffsetY;
    o2.strokeStyle   = o1.strokeStyle;
    o2.arcScaleX_    = o1.arcScaleX_;
    o2.arcScaleY_    = o1.arcScaleY_;
  }

  function processStyle(styleString) {
    var str, alpha = 1;

    styleString = String(styleString);
    if (styleString.substring(0, 3) == "rgb") {
      var start = styleString.indexOf("(", 3);
      var end = styleString.indexOf(")", start + 1);
      var guts = styleString.substring(start + 1, end).split(",");

      str = "#";
      for (var i = 0; i < 3; i++) {
        str += dec2hex[Number(guts[i])];
      }

      if ((guts.length == 4) && (styleString.substr(3, 1) == "a")) {
        alpha = guts[3];
      }
    } else {
      str = styleString;
    }

    return [str, alpha];
  }

  function processLineCap(lineCap) {
    switch (lineCap) {
      case "butt":
        return "flat";
      case "round":
        return "round";
      case "square":
      default:
        return "square";
    }
  }

  /**
   * This class implements CanvasRenderingContext2D interface as described by
   * the WHATWG.
   * @param {HTMLElement} surfaceElement The element that the 2D context should
   * be associated with
   */
   function CanvasRenderingContext2D_(surfaceElement) {
    this.m_ = createMatrixIdentity();

    this.mStack_ = [];
    this.aStack_ = [];
    this.currentPath_ = [];

    this.strokeStyle = "#000";
    this.fillStyle = "#000";

    this.lineWidth = 1;
    this.lineJoin = "miter";
    this.lineCap = "butt";
    this.miterLimit = Z * 1;
    this.globalAlpha = 1;
    this.canvas = surfaceElement;

    var el = surfaceElement.ownerDocument.createElement('div');
    el.style.width =  surfaceElement.clientWidth + 'px';
    el.style.height = surfaceElement.clientHeight + 'px';
    el.style.overflow = 'hidden';
    el.style.position = 'absolute';
    surfaceElement.appendChild(el);

    this.element_ = el;
    this.arcScaleX_ = 1;
    this.arcScaleY_ = 1;
  };

  var contextPrototype = CanvasRenderingContext2D_.prototype;
  contextPrototype.clearRect = function() {
    this.element_.innerHTML = "";
    this.currentPath_ = [];
  };

  contextPrototype.beginPath = function() {

    this.currentPath_ = [];
  };

  contextPrototype.moveTo = function(aX, aY) {
    this.currentPath_.push({type: "moveTo", x: aX, y: aY});
    this.currentX_ = aX;
    this.currentY_ = aY;
  };

  contextPrototype.lineTo = function(aX, aY) {
    this.currentPath_.push({type: "lineTo", x: aX, y: aY});
    this.currentX_ = aX;
    this.currentY_ = aY;
  };

  contextPrototype.bezierCurveTo = function(aCP1x, aCP1y,
                                            aCP2x, aCP2y,
                                            aX, aY) {
    this.currentPath_.push({type: "bezierCurveTo",
                           cp1x: aCP1x,
                           cp1y: aCP1y,
                           cp2x: aCP2x,
                           cp2y: aCP2y,
                           x: aX,
                           y: aY});
    this.currentX_ = aX;
    this.currentY_ = aY;
  };

  contextPrototype.quadraticCurveTo = function(aCPx, aCPy, aX, aY) {
    var cp1x = this.currentX_ + 2.0 / 3.0 * (aCPx - this.currentX_);
    var cp1y = this.currentY_ + 2.0 / 3.0 * (aCPy - this.currentY_);
    var cp2x = cp1x + (aX - this.currentX_) / 3.0;
    var cp2y = cp1y + (aY - this.currentY_) / 3.0;
    this.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, aX, aY);
  };

  contextPrototype.arc = function(aX, aY, aRadius,
                                  aStartAngle, aEndAngle, aClockwise) {
    aRadius *= Z;
    var arcType = aClockwise ? "at" : "wa";

    var xStart = aX + (mc(aStartAngle) * aRadius) - Z2;
    var yStart = aY + (ms(aStartAngle) * aRadius) - Z2;

    var xEnd = aX + (mc(aEndAngle) * aRadius) - Z2;
    var yEnd = aY + (ms(aEndAngle) * aRadius) - Z2;

    if (xStart == xEnd && !aClockwise) {
      xStart += 0.125; // Offset xStart by 1/80 of a pixel. Use something
    }

    this.currentPath_.push({type: arcType,
                           x: aX,
                           y: aY,
                           radius: aRadius,
                           xStart: xStart,
                           yStart: yStart,
                           xEnd: xEnd,
                           yEnd: yEnd});

  };

  contextPrototype.rect = function(aX, aY, aWidth, aHeight) {
    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
  };

  contextPrototype.strokeRect = function(aX, aY, aWidth, aHeight) {
    this.beginPath();
    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
    this.stroke();
  };

  contextPrototype.fillRect = function(aX, aY, aWidth, aHeight) {
    this.beginPath();
    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
    this.fill();
  };

  contextPrototype.createLinearGradient = function(aX0, aY0, aX1, aY1) {
    var gradient = new CanvasGradient_("gradient");
    return gradient;
  };

  contextPrototype.createRadialGradient = function(aX0, aY0,
                                                   aR0, aX1,
                                                   aY1, aR1) {
    var gradient = new CanvasGradient_("gradientradial");
    gradient.radius1_ = aR0;
    gradient.radius2_ = aR1;
    gradient.focus_.x = aX0;
    gradient.focus_.y = aY0;
    return gradient;
  };

  contextPrototype.drawImage = function (image, var_args) {
    var dx, dy, dw, dh, sx, sy, sw, sh;

    var oldRuntimeWidth = image.runtimeStyle.width;
    var oldRuntimeHeight = image.runtimeStyle.height;
    image.runtimeStyle.width = 'auto';
    image.runtimeStyle.height = 'auto';

    var w = image.width;
    var h = image.height;

    image.runtimeStyle.width = oldRuntimeWidth;
    image.runtimeStyle.height = oldRuntimeHeight;

    if (arguments.length == 3) {
      dx = arguments[1];
      dy = arguments[2];
      sx = sy = 0;
      sw = dw = w;
      sh = dh = h;
    } else if (arguments.length == 5) {
      dx = arguments[1];
      dy = arguments[2];
      dw = arguments[3];
      dh = arguments[4];
      sx = sy = 0;
      sw = w;
      sh = h;
    } else if (arguments.length == 9) {
      sx = arguments[1];
      sy = arguments[2];
      sw = arguments[3];
      sh = arguments[4];
      dx = arguments[5];
      dy = arguments[6];
      dw = arguments[7];
      dh = arguments[8];
    } else {
      throw "Invalid number of arguments";
    }

    var d = this.getCoords_(dx, dy);

    var w2 = sw / 2;
    var h2 = sh / 2;

    var vmlStr = [];

    var W = 10;
    var H = 10;

    vmlStr.push(' <g_vml_:group',
                ' coordsize="', Z * W, ',', Z * H, '"',
                ' coordorigin="0,0"' ,
                ' style="width:', W, ';height:', H, ';position:absolute;');


    if (this.m_[0][0] != 1 || this.m_[0][1]) {
      var filter = [];

      filter.push("M11='", this.m_[0][0], "',",
                  "M12='", this.m_[1][0], "',",
                  "M21='", this.m_[0][1], "',",
                  "M22='", this.m_[1][1], "',",
                  "Dx='", mr(d.x / Z), "',",
                  "Dy='", mr(d.y / Z), "'");

      var max = d;
      var c2 = this.getCoords_(dx + dw, dy);
      var c3 = this.getCoords_(dx, dy + dh);
      var c4 = this.getCoords_(dx + dw, dy + dh);

      max.x = Math.max(max.x, c2.x, c3.x, c4.x);
      max.y = Math.max(max.y, c2.y, c3.y, c4.y);

      vmlStr.push("padding:0 ", mr(max.x / Z), "px ", mr(max.y / Z),
                  "px 0;filter:progid:DXImageTransform.Microsoft.Matrix(",
                  filter.join(""), ", sizingmethod='clip');")
    } else {
      vmlStr.push("top:", mr(d.y / Z), "px;left:", mr(d.x / Z), "px;")
    }

    vmlStr.push(' ">' ,
                '<g_vml_:image src="', image.src, '"',
                ' style="width:', Z * dw, ';',
                ' height:', Z * dh, ';"',
                ' cropleft="', sx / w, '"',
                ' croptop="', sy / h, '"',
                ' cropright="', (w - sx - sw) / w, '"',
                ' cropbottom="', (h - sy - sh) / h, '"',
                ' />',
                '</g_vml_:group>');

    this.element_.insertAdjacentHTML("BeforeEnd",
                                    vmlStr.join(""));
  };

  contextPrototype.stroke = function(aFill) {
    var lineStr = [];
    var lineOpen = false;
    var a = processStyle(aFill ? this.fillStyle : this.strokeStyle);
    var color = a[0];
    var opacity = a[1] * this.globalAlpha;

    var W = 10;
    var H = 10;

    lineStr.push('<g_vml_:shape',
                 ' fillcolor="', color, '"',
                 ' filled="', Boolean(aFill), '"',
                 ' style="position:absolute;width:', W, ';height:', H, ';"',
                 ' coordorigin="0 0" coordsize="', Z * W, ' ', Z * H, '"',
                 ' stroked="', !aFill, '"',
                 ' strokeweight="', this.lineWidth, '"',
                 ' strokecolor="', color, '"',
                 ' path="');

    var newSeq = false;
    var min = {x: null, y: null};
    var max = {x: null, y: null};

    for (var i = 0; i < this.currentPath_.length; i++) {
      var p = this.currentPath_[i];

      if (p.type == "moveTo") {
        lineStr.push(" m ");
        var c = this.getCoords_(p.x, p.y);
        lineStr.push(mr(c.x), ",", mr(c.y));
      } else if (p.type == "lineTo") {
        lineStr.push(" l ");
        var c = this.getCoords_(p.x, p.y);
        lineStr.push(mr(c.x), ",", mr(c.y));
      } else if (p.type == "close") {
        lineStr.push(" x ");
      } else if (p.type == "bezierCurveTo") {
        lineStr.push(" c ");
        var c = this.getCoords_(p.x, p.y);
        var c1 = this.getCoords_(p.cp1x, p.cp1y);
        var c2 = this.getCoords_(p.cp2x, p.cp2y);
        lineStr.push(mr(c1.x), ",", mr(c1.y), ",",
                     mr(c2.x), ",", mr(c2.y), ",",
                     mr(c.x), ",", mr(c.y));
      } else if (p.type == "at" || p.type == "wa") {
        lineStr.push(" ", p.type, " ");
        var c  = this.getCoords_(p.x, p.y);
        var cStart = this.getCoords_(p.xStart, p.yStart);
        var cEnd = this.getCoords_(p.xEnd, p.yEnd);

        lineStr.push(mr(c.x - this.arcScaleX_ * p.radius), ",",
                     mr(c.y - this.arcScaleY_ * p.radius), " ",
                     mr(c.x + this.arcScaleX_ * p.radius), ",",
                     mr(c.y + this.arcScaleY_ * p.radius), " ",
                     mr(cStart.x), ",", mr(cStart.y), " ",
                     mr(cEnd.x), ",", mr(cEnd.y));
      }



      if(c) {
        if (min.x == null || c.x < min.x) {
          min.x = c.x;
        }
        if (max.x == null || c.x > max.x) {
          max.x = c.x;
        }
        if (min.y == null || c.y < min.y) {
          min.y = c.y;
        }
        if (max.y == null || c.y > max.y) {
          max.y = c.y;
        }
      }
    }
    lineStr.push(' ">');

    if (typeof this.fillStyle == "object") {
      var focus = {x: "50%", y: "50%"};
      var width = (max.x - min.x);
      var height = (max.y - min.y);
      var dimension = (width > height) ? width : height;

      focus.x = mr((this.fillStyle.focus_.x / width) * 100 + 50) + "%";
      focus.y = mr((this.fillStyle.focus_.y / height) * 100 + 50) + "%";

      var colors = [];

      if (this.fillStyle.type_ == "gradientradial") {
        var inside = (this.fillStyle.radius1_ / dimension * 100);

        var expansion = (this.fillStyle.radius2_ / dimension * 100) - inside;
      } else {
        var inside = 0;
        var expansion = 100;
      }

      var insidecolor = {offset: null, color: null};
      var outsidecolor = {offset: null, color: null};

      this.fillStyle.colors_.sort(function (cs1, cs2) {
        return cs1.offset - cs2.offset;
      });

      for (var i = 0; i < this.fillStyle.colors_.length; i++) {
        var fs = this.fillStyle.colors_[i];

        colors.push( (fs.offset * expansion) + inside, "% ", fs.color, ",");

        if (fs.offset > insidecolor.offset || insidecolor.offset == null) {
          insidecolor.offset = fs.offset;
          insidecolor.color = fs.color;
        }

        if (fs.offset < outsidecolor.offset || outsidecolor.offset == null) {
          outsidecolor.offset = fs.offset;
          outsidecolor.color = fs.color;
        }
      }
      colors.pop();

      lineStr.push('<g_vml_:fill',
                   ' color="', outsidecolor.color, '"',
                   ' color2="', insidecolor.color, '"',
                   ' type="', this.fillStyle.type_, '"',
                   ' focusposition="', focus.x, ', ', focus.y, '"',
                   ' colors="', colors.join(""), '"',
                   ' opacity="', opacity, '" />');
    } else if (aFill) {
      lineStr.push('<g_vml_:fill color="', color, '" opacity="', opacity, '" />');
    } else {
      lineStr.push(
        '<g_vml_:stroke',
        ' opacity="', opacity,'"',
        ' joinstyle="', this.lineJoin, '"',
        ' miterlimit="', this.miterLimit, '"',
        ' endcap="', processLineCap(this.lineCap) ,'"',
        ' weight="', this.lineWidth, 'px"',
        ' color="', color,'" />'
      );
    }

    lineStr.push("</g_vml_:shape>");

    this.element_.insertAdjacentHTML("beforeEnd", lineStr.join(""));

    this.currentPath_ = [];
  };

  contextPrototype.fill = function() {
    this.stroke(true);
  }

  contextPrototype.closePath = function() {
    this.currentPath_.push({type: "close"});
  };

  /**
   * @private
   */
  contextPrototype.getCoords_ = function(aX, aY) {
    return {
      x: Z * (aX * this.m_[0][0] + aY * this.m_[1][0] + this.m_[2][0]) - Z2,
      y: Z * (aX * this.m_[0][1] + aY * this.m_[1][1] + this.m_[2][1]) - Z2
    }
  };

  contextPrototype.save = function() {
    var o = {};
    copyState(this, o);
    this.aStack_.push(o);
    this.mStack_.push(this.m_);
    this.m_ = matrixMultiply(createMatrixIdentity(), this.m_);
  };

  contextPrototype.restore = function() {
    copyState(this.aStack_.pop(), this);
    this.m_ = this.mStack_.pop();
  };

  contextPrototype.translate = function(aX, aY) {
    var m1 = [
      [1,  0,  0],
      [0,  1,  0],
      [aX, aY, 1]
    ];

    this.m_ = matrixMultiply(m1, this.m_);
  };

  contextPrototype.rotate = function(aRot) {
    var c = mc(aRot);
    var s = ms(aRot);

    var m1 = [
      [c,  s, 0],
      [-s, c, 0],
      [0,  0, 1]
    ];

    this.m_ = matrixMultiply(m1, this.m_);
  };

  contextPrototype.scale = function(aX, aY) {
    this.arcScaleX_ *= aX;
    this.arcScaleY_ *= aY;
    var m1 = [
      [aX, 0,  0],
      [0,  aY, 0],
      [0,  0,  1]
    ];

    this.m_ = matrixMultiply(m1, this.m_);
  };

  contextPrototype.clip = function() {
  };

  contextPrototype.arcTo = function() {
  };

  contextPrototype.createPattern = function() {
    return new CanvasPattern_;
  };

  function CanvasGradient_(aType) {
    this.type_ = aType;
    this.radius1_ = 0;
    this.radius2_ = 0;
    this.colors_ = [];
    this.focus_ = {x: 0, y: 0};
  }

  CanvasGradient_.prototype.addColorStop = function(aOffset, aColor) {
    aColor = processStyle(aColor);
    this.colors_.push({offset: 1-aOffset, color: aColor});
  };

  function CanvasPattern_() {}

  G_vmlCanvasManager = G_vmlCanvasManager_;
  CanvasRenderingContext2D = CanvasRenderingContext2D_;
  CanvasGradient = CanvasGradient_;
  CanvasPattern = CanvasPattern_;

})();

} // if
(function() {
  CanvasTextFunctions = { };

  CanvasTextFunctions.letters = {
      ' ': { width: 16, points: [] },
      '!': { width: 10, points: [[5,21],[5,7],[-1,-1],[5,2],[4,1],[5,0],[6,1],[5,2]] },
      '"': { width: 16, points: [[4,21],[4,14],[-1,-1],[12,21],[12,14]] },
      '#': { width: 21, points: [[11,25],[4,-7],[-1,-1],[17,25],[10,-7],[-1,-1],[4,12],[18,12],[-1,-1],[3,6],[17,6]] },
      '$': { width: 20, points: [[8,25],[8,-4],[-1,-1],[12,25],[12,-4],[-1,-1],[17,18],[15,20],[12,21],[8,21],[5,20],[3,18],[3,16],[4,14],[5,13],[7,12],[13,10],[15,9],[16,8],[17,6],[17,3],[15,1],[12,0],[8,0],[5,1],[3,3]] },
      '%': { width: 24, points: [[21,21],[3,0],[-1,-1],[8,21],[10,19],[10,17],[9,15],[7,14],[5,14],[3,16],[3,18],[4,20],[6,21],[8,21],[10,20],[13,19],[16,19],[19,20],[21,21],[-1,-1],[17,7],[15,6],[14,4],[14,2],[16,0],[18,0],[20,1],[21,3],[21,5],[19,7],[17,7]] },
      '&': { width: 26, points: [[23,12],[23,13],[22,14],[21,14],[20,13],[19,11],[17,6],[15,3],[13,1],[11,0],[7,0],[5,1],[4,2],[3,4],[3,6],[4,8],[5,9],[12,13],[13,14],[14,16],[14,18],[13,20],[11,21],[9,20],[8,18],[8,16],[9,13],[11,10],[16,3],[18,1],[20,0],[22,0],[23,1],[23,2]] },
      '\'': { width: 10, points: [[5,19],[4,20],[5,21],[6,20],[6,18],[5,16],[4,15]] },
      '(': { width: 14, points: [[11,25],[9,23],[7,20],[5,16],[4,11],[4,7],[5,2],[7,-2],[9,-5],[11,-7]] },
      ')': { width: 14, points: [[3,25],[5,23],[7,20],[9,16],[10,11],[10,7],[9,2],[7,-2],[5,-5],[3,-7]] },
      '*': { width: 16, points: [[8,21],[8,9],[-1,-1],[3,18],[13,12],[-1,-1],[13,18],[3,12]] },
      '+': { width: 26, points: [[13,18],[13,0],[-1,-1],[4,9],[22,9]] },
      ',': { width: 10, points: [[6,1],[5,0],[4,1],[5,2],[6,1],[6,-1],[5,-3],[4,-4]] },
      '-': { width: 26, points: [[4,9],[22,9]] },
      '.': { width: 10, points: [[5,2],[4,1],[5,0],[6,1],[5,2]] },
      '/': { width: 22, points: [[20,25],[2,-7]] },
      '0': { width: 20, points: [[9,21],[6,20],[4,17],[3,12],[3,9],[4,4],[6,1],[9,0],[11,0],[14,1],[16,4],[17,9],[17,12],[16,17],[14,20],[11,21],[9,21]] },
      '1': { width: 20, points: [[6,17],[8,18],[11,21],[11,0]] },
      '2': { width: 20, points: [[4,16],[4,17],[5,19],[6,20],[8,21],[12,21],[14,20],[15,19],[16,17],[16,15],[15,13],[13,10],[3,0],[17,0]] },
      '3': { width: 20, points: [[5,21],[16,21],[10,13],[13,13],[15,12],[16,11],[17,8],[17,6],[16,3],[14,1],[11,0],[8,0],[5,1],[4,2],[3,4]] },
      '4': { width: 20, points: [[13,21],[3,7],[18,7],[-1,-1],[13,21],[13,0]] },
      '5': { width: 20, points: [[15,21],[5,21],[4,12],[5,13],[8,14],[11,14],[14,13],[16,11],[17,8],[17,6],[16,3],[14,1],[11,0],[8,0],[5,1],[4,2],[3,4]] },
      '6': { width: 20, points: [[16,18],[15,20],[12,21],[10,21],[7,20],[5,17],[4,12],[4,7],[5,3],[7,1],[10,0],[11,0],[14,1],[16,3],[17,6],[17,7],[16,10],[14,12],[11,13],[10,13],[7,12],[5,10],[4,7]] },
      '7': { width: 20, points: [[17,21],[7,0],[-1,-1],[3,21],[17,21]] },
      '8': { width: 20, points: [[8,21],[5,20],[4,18],[4,16],[5,14],[7,13],[11,12],[14,11],[16,9],[17,7],[17,4],[16,2],[15,1],[12,0],[8,0],[5,1],[4,2],[3,4],[3,7],[4,9],[6,11],[9,12],[13,13],[15,14],[16,16],[16,18],[15,20],[12,21],[8,21]] },
      '9': { width: 20, points: [[16,14],[15,11],[13,9],[10,8],[9,8],[6,9],[4,11],[3,14],[3,15],[4,18],[6,20],[9,21],[10,21],[13,20],[15,18],[16,14],[16,9],[15,4],[13,1],[10,0],[8,0],[5,1],[4,3]] },
      ':': { width: 10, points: [[5,14],[4,13],[5,12],[6,13],[5,14],[-1,-1],[5,2],[4,1],[5,0],[6,1],[5,2]] },
      ',': { width: 10, points: [[5,14],[4,13],[5,12],[6,13],[5,14],[-1,-1],[6,1],[5,0],[4,1],[5,2],[6,1],[6,-1],[5,-3],[4,-4]] },
      '<': { width: 24, points: [[20,18],[4,9],[20,0]] },
      '=': { width: 26, points: [[4,12],[22,12],[-1,-1],[4,6],[22,6]] },
      '>': { width: 24, points: [[4,18],[20,9],[4,0]] },
      '?': { width: 18, points: [[3,16],[3,17],[4,19],[5,20],[7,21],[11,21],[13,20],[14,19],[15,17],[15,15],[14,13],[13,12],[9,10],[9,7],[-1,-1],[9,2],[8,1],[9,0],[10,1],[9,2]] },
      '@': { width: 27, points: [[18,13],[17,15],[15,16],[12,16],[10,15],[9,14],[8,11],[8,8],[9,6],[11,5],[14,5],[16,6],[17,8],[-1,-1],[12,16],[10,14],[9,11],[9,8],[10,6],[11,5],[-1,-1],[18,16],[17,8],[17,6],[19,5],[21,5],[23,7],[24,10],[24,12],[23,15],[22,17],[20,19],[18,20],[15,21],[12,21],[9,20],[7,19],[5,17],[4,15],[3,12],[3,9],[4,6],[5,4],[7,2],[9,1],[12,0],[15,0],[18,1],[20,2],[21,3],[-1,-1],[19,16],[18,8],[18,6],[19,5]] },
      'A': { width: 18, points: [[9,21],[1,0],[-1,-1],[9,21],[17,0],[-1,-1],[4,7],[14,7]] },
      'B': { width: 21, points: [[4,21],[4,0],[-1,-1],[4,21],[13,21],[16,20],[17,19],[18,17],[18,15],[17,13],[16,12],[13,11],[-1,-1],[4,11],[13,11],[16,10],[17,9],[18,7],[18,4],[17,2],[16,1],[13,0],[4,0]] },
      'C': { width: 21, points: [[18,16],[17,18],[15,20],[13,21],[9,21],[7,20],[5,18],[4,16],[3,13],[3,8],[4,5],[5,3],[7,1],[9,0],[13,0],[15,1],[17,3],[18,5]] },
      'D': { width: 21, points: [[4,21],[4,0],[-1,-1],[4,21],[11,21],[14,20],[16,18],[17,16],[18,13],[18,8],[17,5],[16,3],[14,1],[11,0],[4,0]] },
      'E': { width: 19, points: [[4,21],[4,0],[-1,-1],[4,21],[17,21],[-1,-1],[4,11],[12,11],[-1,-1],[4,0],[17,0]] },
      'F': { width: 18, points: [[4,21],[4,0],[-1,-1],[4,21],[17,21],[-1,-1],[4,11],[12,11]] },
      'G': { width: 21, points: [[18,16],[17,18],[15,20],[13,21],[9,21],[7,20],[5,18],[4,16],[3,13],[3,8],[4,5],[5,3],[7,1],[9,0],[13,0],[15,1],[17,3],[18,5],[18,8],[-1,-1],[13,8],[18,8]] },
      'H': { width: 22, points: [[4,21],[4,0],[-1,-1],[18,21],[18,0],[-1,-1],[4,11],[18,11]] },
      'I': { width: 8, points: [[4,21],[4,0]] },
      'J': { width: 16, points: [[12,21],[12,5],[11,2],[10,1],[8,0],[6,0],[4,1],[3,2],[2,5],[2,7]] },
      'K': { width: 21, points: [[4,21],[4,0],[-1,-1],[18,21],[4,7],[-1,-1],[9,12],[18,0]] },
      'L': { width: 17, points: [[4,21],[4,0],[-1,-1],[4,0],[16,0]] },
      'M': { width: 24, points: [[4,21],[4,0],[-1,-1],[4,21],[12,0],[-1,-1],[20,21],[12,0],[-1,-1],[20,21],[20,0]] },
      'N': { width: 22, points: [[4,21],[4,0],[-1,-1],[4,21],[18,0],[-1,-1],[18,21],[18,0]] },
      'O': { width: 22, points: [[9,21],[7,20],[5,18],[4,16],[3,13],[3,8],[4,5],[5,3],[7,1],[9,0],[13,0],[15,1],[17,3],[18,5],[19,8],[19,13],[18,16],[17,18],[15,20],[13,21],[9,21]] },
      'P': { width: 21, points: [[4,21],[4,0],[-1,-1],[4,21],[13,21],[16,20],[17,19],[18,17],[18,14],[17,12],[16,11],[13,10],[4,10]] },
      'Q': { width: 22, points: [[9,21],[7,20],[5,18],[4,16],[3,13],[3,8],[4,5],[5,3],[7,1],[9,0],[13,0],[15,1],[17,3],[18,5],[19,8],[19,13],[18,16],[17,18],[15,20],[13,21],[9,21],[-1,-1],[12,4],[18,-2]] },
      'R': { width: 21, points: [[4,21],[4,0],[-1,-1],[4,21],[13,21],[16,20],[17,19],[18,17],[18,15],[17,13],[16,12],[13,11],[4,11],[-1,-1],[11,11],[18,0]] },
      'S': { width: 20, points: [[17,18],[15,20],[12,21],[8,21],[5,20],[3,18],[3,16],[4,14],[5,13],[7,12],[13,10],[15,9],[16,8],[17,6],[17,3],[15,1],[12,0],[8,0],[5,1],[3,3]] },
      'T': { width: 16, points: [[8,21],[8,0],[-1,-1],[1,21],[15,21]] },
      'U': { width: 22, points: [[4,21],[4,6],[5,3],[7,1],[10,0],[12,0],[15,1],[17,3],[18,6],[18,21]] },
      'V': { width: 18, points: [[1,21],[9,0],[-1,-1],[17,21],[9,0]] },
      'W': { width: 24, points: [[2,21],[7,0],[-1,-1],[12,21],[7,0],[-1,-1],[12,21],[17,0],[-1,-1],[22,21],[17,0]] },
      'X': { width: 20, points: [[3,21],[17,0],[-1,-1],[17,21],[3,0]] },
      'Y': { width: 18, points: [[1,21],[9,11],[9,0],[-1,-1],[17,21],[9,11]] },
      'Z': { width: 20, points: [[17,21],[3,0],[-1,-1],[3,21],[17,21],[-1,-1],[3,0],[17,0]] },
      '[': { width: 14, points: [[4,25],[4,-7],[-1,-1],[5,25],[5,-7],[-1,-1],[4,25],[11,25],[-1,-1],[4,-7],[11,-7]] },
      '\\': { width: 14, points: [[0,21],[14,-3]] },
      ']': { width: 14, points: [[9,25],[9,-7],[-1,-1],[10,25],[10,-7],[-1,-1],[3,25],[10,25],[-1,-1],[3,-7],[10,-7]] },
      '^': { width: 16, points: [[6,15],[8,18],[10,15],[-1,-1],[3,12],[8,17],[13,12],[-1,-1],[8,17],[8,0]] },
      '_': { width: 16, points: [[0,-2],[16,-2]] },
      '`': { width: 10, points: [[6,21],[5,20],[4,18],[4,16],[5,15],[6,16],[5,17]] },
      'a': { width: 19, points: [[15,14],[15,0],[-1,-1],[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
      'b': { width: 19, points: [[4,21],[4,0],[-1,-1],[4,11],[6,13],[8,14],[11,14],[13,13],[15,11],[16,8],[16,6],[15,3],[13,1],[11,0],[8,0],[6,1],[4,3]] },
      'c': { width: 18, points: [[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
      'd': { width: 19, points: [[15,21],[15,0],[-1,-1],[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
      'e': { width: 18, points: [[3,8],[15,8],[15,10],[14,12],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
      'f': { width: 12, points: [[10,21],[8,21],[6,20],[5,17],[5,0],[-1,-1],[2,14],[9,14]] },
      'g': { width: 19, points: [[15,14],[15,-2],[14,-5],[13,-6],[11,-7],[8,-7],[6,-6],[-1,-1],[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
      'h': { width: 19, points: [[4,21],[4,0],[-1,-1],[4,10],[7,13],[9,14],[12,14],[14,13],[15,10],[15,0]] },
      'i': { width: 8, points: [[3,21],[4,20],[5,21],[4,22],[3,21],[-1,-1],[4,14],[4,0]] },
      'j': { width: 10, points: [[5,21],[6,20],[7,21],[6,22],[5,21],[-1,-1],[6,14],[6,-3],[5,-6],[3,-7],[1,-7]] },
      'k': { width: 17, points: [[4,21],[4,0],[-1,-1],[14,14],[4,4],[-1,-1],[8,8],[15,0]] },
      'l': { width: 8, points: [[4,21],[4,0]] },
      'm': { width: 30, points: [[4,14],[4,0],[-1,-1],[4,10],[7,13],[9,14],[12,14],[14,13],[15,10],[15,0],[-1,-1],[15,10],[18,13],[20,14],[23,14],[25,13],[26,10],[26,0]] },
      'n': { width: 19, points: [[4,14],[4,0],[-1,-1],[4,10],[7,13],[9,14],[12,14],[14,13],[15,10],[15,0]] },
      'o': { width: 19, points: [[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3],[16,6],[16,8],[15,11],[13,13],[11,14],[8,14]] },
      'p': { width: 19, points: [[4,14],[4,-7],[-1,-1],[4,11],[6,13],[8,14],[11,14],[13,13],[15,11],[16,8],[16,6],[15,3],[13,1],[11,0],[8,0],[6,1],[4,3]] },
      'q': { width: 19, points: [[15,14],[15,-7],[-1,-1],[15,11],[13,13],[11,14],[8,14],[6,13],[4,11],[3,8],[3,6],[4,3],[6,1],[8,0],[11,0],[13,1],[15,3]] },
      'r': { width: 13, points: [[4,14],[4,0],[-1,-1],[4,8],[5,11],[7,13],[9,14],[12,14]] },
      's': { width: 17, points: [[14,11],[13,13],[10,14],[7,14],[4,13],[3,11],[4,9],[6,8],[11,7],[13,6],[14,4],[14,3],[13,1],[10,0],[7,0],[4,1],[3,3]] },
      't': { width: 12, points: [[5,21],[5,4],[6,1],[8,0],[10,0],[-1,-1],[2,14],[9,14]] },
      'u': { width: 19, points: [[4,14],[4,4],[5,1],[7,0],[10,0],[12,1],[15,4],[-1,-1],[15,14],[15,0]] },
      'v': { width: 16, points: [[2,14],[8,0],[-1,-1],[14,14],[8,0]] },
      'w': { width: 22, points: [[3,14],[7,0],[-1,-1],[11,14],[7,0],[-1,-1],[11,14],[15,0],[-1,-1],[19,14],[15,0]] },
      'x': { width: 17, points: [[3,14],[14,0],[-1,-1],[14,14],[3,0]] },
      'y': { width: 16, points: [[2,14],[8,0],[-1,-1],[14,14],[8,0],[6,-4],[4,-6],[2,-7],[1,-7]] },
      'z': { width: 17, points: [[14,14],[3,0],[-1,-1],[3,14],[14,14],[-1,-1],[3,0],[14,0]] },
      '{': { width: 14, points: [[9,25],[7,24],[6,23],[5,21],[5,19],[6,17],[7,16],[8,14],[8,12],[6,10],[-1,-1],[7,24],[6,22],[6,20],[7,18],[8,17],[9,15],[9,13],[8,11],[4,9],[8,7],[9,5],[9,3],[8,1],[7,0],[6,-2],[6,-4],[7,-6],[-1,-1],[6,8],[8,6],[8,4],[7,2],[6,1],[5,-1],[5,-3],[6,-5],[7,-6],[9,-7]] },
      '|': { width: 8, points: [[4,25],[4,-7]] },
      '}': { width: 14, points: [[5,25],[7,24],[8,23],[9,21],[9,19],[8,17],[7,16],[6,14],[6,12],[8,10],[-1,-1],[7,24],[8,22],[8,20],[7,18],[6,17],[5,15],[5,13],[6,11],[10,9],[6,7],[5,5],[5,3],[6,1],[7,0],[8,-2],[8,-4],[7,-6],[-1,-1],[8,8],[6,6],[6,4],[7,2],[8,1],[9,-1],[9,-3],[8,-5],[7,-6],[5,-7]] },
      '~': { width: 24, points: [[3,6],[3,8],[4,11],[6,12],[8,12],[10,11],[14,8],[16,7],[18,7],[20,8],[21,10],[-1,-1],[3,8],[4,10],[6,11],[8,11],[10,10],[14,7],[16,6],[18,6],[20,7],[21,10],[21,12]] }
  };

  CanvasTextFunctions.letter = function (ch)
  {
      return CanvasTextFunctions.letters[ch];
  }

  CanvasTextFunctions.ascent = function( font, size)
  {
      return size;
  }

  CanvasTextFunctions.descent = function( font, size)
  {
      return 7.0*size/25.0;
  }

  CanvasTextFunctions.measure = function( font, size, str)
  {
      var total = 0;
      var len = str.length;

      for ( i = 0; i < len; i++) {
  	var c = CanvasTextFunctions.letter( str.charAt(i));
  	if ( c) total += c.width * size / 25.0;
      }
      return total;
  }

  CanvasTextFunctions.draw = function(ctx,font,size,x,y,str)
  {
      var total = 0;
      var len = str.length;
      var mag = size / 25.0;

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineWidth = 2.0 * mag;

      for ( i = 0; i < len; i++) {
  	var c = CanvasTextFunctions.letter( str.charAt(i));
  	if ( !c) continue;

  	ctx.beginPath();

  	var penUp = 1;
  	var needStroke = 0;
  	for ( j = 0; j < c.points.length; j++) {
  	    var a = c.points[j];
  	    if ( a[0] == -1 && a[1] == -1) {
  		penUp = 1;
  		continue;
  	    }
  	    if ( penUp) {
  		ctx.moveTo( x + a[0]*mag, y - a[1]*mag);
  		penUp = false;
  	    } else {
  		ctx.lineTo( x + a[0]*mag, y - a[1]*mag);
  	    }
  	}
  	ctx.stroke();
  	x += c.width*mag;
      }
      ctx.restore();
      return total;
  }

  CanvasTextFunctions.enable = function( ctx)
  {
      ctx.drawText = function(font,size,x,y,text) { return CanvasTextFunctions.draw( ctx, font,size,x,y,text); };
      ctx.measureText = function(font,size,text) { return CanvasTextFunctions.measure( font,size,text); };
      ctx.fontAscent = function(font,size) { return CanvasTextFunctions.ascent(font,size); }
      ctx.fontDescent = function(font,size) { return CanvasTextFunctions.descent(font,size); }

      ctx.drawTextRight = function(font,size,x,y,text) {
  	var w = CanvasTextFunctions.measure(font,size,text);
  	return CanvasTextFunctions.draw( ctx, font,size,x-w,y,text);
      };
      ctx.drawTextCenter = function(font,size,x,y,text) {
  	var w = CanvasTextFunctions.measure(font,size,text);
  	return CanvasTextFunctions.draw( ctx, font,size,x-w/2,y,text);
      };
  }
})();
(function(){
/*

uuid.js - Version 0.3
JavaScript Class to create a UUID like identifier

Copyright (C) 2006-2008, Erik Giberti (AF-Design), All rights reserved.

This program is free software; you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation; either version 2 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program; if not, write to the Free Software Foundation, Inc., 59 Temple
Place, Suite 330, Boston, MA 02111-1307 USA

The latest version of this file can be downloaded from
http://www.af-design.com/resources/javascript_uuid.php

HISTORY:
6/5/06 	- Initial Release
5/22/08 - Updated code to run faster, removed randrange(min,max) in favor of
          a simpler rand(max) function. Reduced overhead by using getTime()
          method of date class (suggestion by James Hall).
9/5/08	- Fixed a bug with rand(max) and additional efficiencies pointed out
	  by Robert Kieffer http://broofa.com/

KNOWN ISSUES:
- Still no way to get MAC address in JavaScript
- Research into other versions of UUID show promising possibilities
  (more research needed)
- Documentation needs improvement

*/

function UUID(){
	this.id = this.createUUID();
}

UUID.prototype.valueOf = function(){ return this.id; }
UUID.prototype.toString = function(){ return this.id; }


UUID.prototype.createUUID = function(){
	var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
	var dc = new Date();
	var t = dc.getTime() - dg.getTime();
	var h = '-';
	var tl = UUID.getIntegerBits(t,0,31);
	var tm = UUID.getIntegerBits(t,32,47);
	var thv = UUID.getIntegerBits(t,48,59) + '1'; // version 1, security version is 2
	var csar = UUID.getIntegerBits(UUID.rand(4095),0,7);
	var csl = UUID.getIntegerBits(UUID.rand(4095),0,7);

	var n = UUID.getIntegerBits(UUID.rand(8191),0,7) +
			UUID.getIntegerBits(UUID.rand(8191),8,15) +
			UUID.getIntegerBits(UUID.rand(8191),0,7) +
			UUID.getIntegerBits(UUID.rand(8191),8,15) +
			UUID.getIntegerBits(UUID.rand(8191),0,15); // this last number is two octets long
	return tl + h + tm + h + thv + h + csar + csl + h + n;
}




UUID.getIntegerBits = function(val,start,end){
	var base16 = UUID.returnBase(val,16);
	var quadArray = new Array();
	var quadString = '';
	var i = 0;
	for(i=0;i<base16.length;i++){
		quadArray.push(base16.substring(i,i+1));
	}
	for(i=Math.floor(start/4);i<=Math.floor(end/4);i++){
		if(!quadArray[i] || quadArray[i] == '') quadString += '0';
		else quadString += quadArray[i];
	}
	return quadString;
}

UUID.returnBase = function(number, base){
	return (number).toString(base).toUpperCase();
}

UUID.rand = function(max){
	return Math.floor(Math.random() * (max + 1));
}

})();
/*
    http://www.JSON.org/json2.js
    2010-03-20

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:


            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/



if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {


        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {


        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];


        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }


        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }


        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':


            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':


            return String(value);


        case 'object':


            if (!value) {
                return 'null';
            }


            gap += indent;
            partial = [];


            if (Object.prototype.toString.apply(value) === '[object Array]') {


                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }


                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }


            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {


                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }


            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }


    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {


            var i;
            gap = '';
            indent = '';


            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }


            } else if (typeof space === 'string') {
                indent = space;
            }


            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }


            return str('', {'': value});
        };
    }



    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {


            var j;

            function walk(holder, key) {


                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }



            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }



            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {


                j = eval('(' + text + ')');


                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }


            throw new SyntaxError('JSON.parse');
        };
    }
}());
/**
 * WireIt provide classes to build wirable interfaces
 * @module WireIt
 */
/**
 * @class WireIt
 * @static
 * @namespace WireIt
 */
var WireIt = {

   /**
    * Get a css property in pixels and convert it to an integer
    * @method getIntStyle
    * @namespace WireIt
    * @static
    * @param {HTMLElement} el The element
    * @param {String} style css-property to get
    * @return {Integer} integer size
    */
   getIntStyle: function(el,style) {
      var sStyle = YAHOO.util.Dom.getStyle(el, style);
      return parseInt(sStyle.substr(0, sStyle.length-2), 10);
   },

   /**
    * Helper function to set DOM node attributes and style attributes.
    * @method sn
    * @static
    * @param {HTMLElement} el The element to set attributes to
    * @param {Object} domAttributes An object containing key/value pairs to set as node attributes (ex: {id: 'myElement', className: 'myCssClass', ...})
    * @param {Object} styleAttributes Same thing for style attributes. Please use camelCase for style attributes (ex: backgroundColor for 'background-color')
    */
   sn: function(el,domAttributes,styleAttributes){
      if(!el) { return; }
      if(domAttributes){
         for(var i in domAttributes){
            var domAttribute = domAttributes[i];
            if(typeof (domAttribute)=="function"){continue;}
            if(i=="className"){
               i="class";
               el.className=domAttribute;
            }
            if(domAttribute!==el.getAttribute(i)){
               if(domAttribute===false){
                  el.removeAttribute(i);
               }else{
                  el.setAttribute(i,domAttribute);
               }
            }
         }
      }
      if(styleAttributes){
         for(var i in styleAttributes){
            if(typeof (styleAttributes[i])=="function"){ continue; }
            if(el.style[i]!=styleAttributes[i]){
               el.style[i]=styleAttributes[i];
            }
         }
      }

   },

   /**
    * Helper function to create a DOM node. (wrapps the document.createElement tag and the inputEx.sn functions)
    * @method cn
    * @static
    * @param {String} tag The tagName to create (ex: 'div', 'a', ...)
    * @param {Object} [domAttributes] see inputEx.sn
    * @param {Object} [styleAttributes] see inputEx.sn
    * @param {String} [innerHTML] The html string to append into the created element
    * @return {HTMLElement} The created node
    */
   cn: function(tag, domAttributes, styleAttributes, innerHTML){
      var el=document.createElement(tag);
      this.sn(el,domAttributes,styleAttributes);
      if(innerHTML){ el.innerHTML = innerHTML; }
      return el;
   },

   /**
    * indexOf replace Array.indexOf for cases where it isn't available (IE6 only ?)
    * @method indexOf
    * @static
    * @param {Any} el element to search for
    * @param {Array} arr Array to search into
    * @return {Integer} element index or -1 if not found
    */
   indexOf: YAHOO.lang.isFunction(Array.prototype.indexOf) ?
                        function(el, arr) { return arr.indexOf(el);} :
                        function(el, arr) {
                           for(var i = 0 ;i < arr.length ; i++) {
                              if(arr[i] == el) return i;
                           }
                           return -1;
                        },

   /**
    * compact replace Array.compact for cases where it isn't available
    * @method compact
    * @static
    * @param {Array} arr Array to compact
    * @return {Array} compacted array
    */
   compact: YAHOO.lang.isFunction(Array.prototype.compact) ?
                        function(arr) { return arr.compact();} :
                        function(arr) {
                           var n = [];
                           for(var i = 0 ; i < arr.length ; i++) {
                              if(arr[i]) {
                                 n.push(arr[i]);
                              }
                           }
                           return n;
                        }
};


/**
 * WireIt.util contains utility classes
 */
WireIt.util = {};
(function () {

   var Event = YAHOO.util.Event, UA = YAHOO.env.ua;

   /**
    * Create a canvas element and wrap cross-browser hacks to resize it
    * @class CanvasElement
    * @namespace WireIt
    * @constructor
    * @param {HTMLElement} parentNode The canvas tag will be append to this parent DOM node.
    */
   WireIt.CanvasElement = function(parentNode) {

      /**
       * The canvas element
       * @property element
       * @type HTMLElement
       */
      this.element = document.createElement('canvas');

      parentNode.appendChild(this.element);

      if(typeof (G_vmlCanvasManager)!="undefined"){
         this.element = G_vmlCanvasManager.initElement(this.element);
      }

   };

   WireIt.CanvasElement.prototype = {

      /**
       * Get a drawing context
       * @method getContext
       * @param {String} [mode] Context mode (default "2d")
       * @return {CanvasContext} the context
       */
      getContext: function(mode) {
       return this.element.getContext(mode || "2d");
      },

      /**
       * Purge all event listeners and remove the component from the dom
       * @method destroy
       */
      destroy: function() {
         var el = this.element;

         if(YAHOO.util.Dom.inDocument(el)) {
            el.parentNode.removeChild(el);
         }

         Event.purgeElement(el, true);
      },

      /**
       * Set the canvas position and size.
       * <b>Warning:</b> This method changes the <i>element</i> property under some brother. Don't copy references !
       * @method SetCanvasRegion
       * @param {Number} left Left position
       * @param {Number} top Top position
       * @param {Number} width New width
       * @param {Number} height New height
       */
      SetCanvasRegion: UA.ie ?
               function(left,top,width,height){
                  var el = this.element;
                  WireIt.sn(el,null,{left:left+"px",top:top+"px",width:width+"px",height:height+"px"});
                  el.getContext("2d").clearRect(0,0,width,height);
                  this.element = el;
               } :
               ( (UA.webkit || UA.opera) ?
                  function(left,top,width,height){
                     var el = this.element;
                     var newCanvas=WireIt.cn("canvas",{className:el.className || el.getAttribute("class"),width:width,height:height},{left:left+"px",top:top+"px"});
                     var listeners=Event.getListeners(el);
                     for(var listener in listeners){
                        var l=listeners[listener];
                        Event.addListener(newCanvas,l.type,l.fn,l.obj,l.adjust);
                     }
                     Event.purgeElement(el);
                     el.parentNode.replaceChild(newCanvas,el);
                     this.element = newCanvas;
                  } :
                  function(left,top,width,height){
                     WireIt.sn(this.element,{width:width,height:height},{left:left+"px",top:top+"px"});
                  })
   };

})();
String.prototype.parseColor = function() {
  var color = '#';
  if(this.slice(0,4) == 'rgb(') {
    var cols = this.slice(4,this.length-1).split(',');
    var i=0; do { color += parseInt(cols[i]).toColorPart() } while (++i<3);
  } else {
    if(this.slice(0,1) == '#') {
      if(this.length==4) for(var i=1;i<4;i++) color += (this.charAt(i) + this.charAt(i)).toLowerCase();

      if(this.length==7) color = this.toLowerCase();
    }
  }
  return(color.length==7 ? color : (arguments[0] || this));
}

/**
 * The wire widget that uses a canvas to render
 * @class Wire
 * @namespace WireIt
 * @extends WireIt.CanvasElement
 * @constructor
 * @param  {WireIt.Terminal}    terminal1   Source terminal
 * @param  {WireIt.Terminal}    terminal2   Target terminal
 * @param  {HTMLElement} parentEl    Container of the CANVAS tag
 * @param  {Obj}                options      Styling configuration
 */
WireIt.Wire = function( terminal1, terminal2, parentEl, options) {

   /**
    * Reference to the parent dom element
    * @property parentEl
    * @type HTMLElement
    */
   this.parentEl = parentEl;

   /**
    * Source terminal
    * @property terminal1
    * @type WireIt.Terminal
    */
   this.terminal1 = terminal1;

   /**
    * Target terminal
    * @property terminal2
    * @type WireIt.Terminal || WireIt.TerminalProxy
    */
   this.terminal2 = terminal2;

   this.setOptions(options || {});

   WireIt.Wire.superclass.constructor.call(this, this.parentEl);



   YAHOO.util.Dom.addClass(this.element, this.options.className);

   this.terminal1.addWire(this);
   this.terminal2.addWire(this);
   this.xtype = "WireIt-Wire";
   if (this.is_connected()) {
     this.redraw();
     this.openPropEditor();
   }
};


YAHOO.lang.extend(WireIt.Wire, WireIt.CanvasElement, {

   /**
    * @method setOptions
    */
   setOptions: function(options) {
      /**
       * Wire styling, and properties:
       * <ul>
       *   <li>className: CSS class name of the canvas element (default 'WireIt-Wire')</li>
       *   <li>coeffMulDirection: Parameter for bezier style</li>
       *   <li>cap: default 'round'</li>
       *   <li>bordercap: default 'round'</li>
       *   <li>width: Wire width (default to 3)</li>
       *   <li>borderwidth: Border Width (default to 1)</li>
       *   <li>color: Wire color (default to rgb(173, 216, 230) )</li>
       *   <li>bordercolor: Border color (default to #0000ff )</li>
       * </ul>
       * @property options
       */
      this.options = {};
      this.options.className = options.className || 'WireIt-Wire';
      this.options.coeffMulDirection = YAHOO.lang.isUndefined(options.coeffMulDirection) ? 100 : options.coeffMulDirection;

      this.options.drawingMethod = options.drawingMethod || 'bezier';
      this.options.cap = options.cap || 'round';
      this.options.bordercap = options.bordercap || 'round';
      this.options.width = options.width || 5;
      this.options.borderwidth = options.borderwidth || 1;
      this.options.color = options.color || '#490A3D';
      this.options.bordercolor = options.bordercolor || '#000000';
      this.options.fields = options.fields || {
       'name': '(type-here)',
       'width': this.options.width,
       'color': 'color1'
      };
   },

   is_connected: function() {
     return (
          this.terminal1
       && this.terminal1.container
       && this.terminal2
       && this.terminal2.container)
   },

   /**
    * Remove a Wire from the Dom
    * @method remove
    */
   remove: function() {

      $(this.element).remove();
      if(this.terminal1 && this.terminal1.removeWire) {
         this.terminal1.removeWire(this);
      }
      if(this.terminal2 && this.terminal2.removeWire) {
         this.terminal2.removeWire(this);
      }

      this.terminal1 = null;
      this.terminal2 = null;
      this.label_container.remove();
   },

   /**
    * Redraw the Wire
    * @method drawBezierCurve
    */
   drawBezierCurve: function() {

      var p1 = this.terminal1.getXY();
      var p2 = this.terminal2.getXY();

      var coeffMulDirection = this.options.coeffMulDirection;


      var distance=Math.sqrt(Math.pow(p1[0]-p2[0],2)+Math.pow(p1[1]-p2[1],2));
      if(distance < coeffMulDirection){
         coeffMulDirection = distance/2;
      }

      var d1 = [this.terminal1.options.direction[0]*coeffMulDirection,
                this.terminal1.options.direction[1]*coeffMulDirection];
      var d2 = [this.terminal2.options.direction[0]*coeffMulDirection,
                this.terminal2.options.direction[1]*coeffMulDirection];

      var bezierPoints=[];
      bezierPoints[0] = p1;
      bezierPoints[1] = [p1[0]+d1[0],p1[1]+d1[1]];
      bezierPoints[2] = [p2[0]+d2[0],p2[1]+d2[1]];
      bezierPoints[3] = p2;
      var min = [p1[0],p1[1]];
      var max = [p1[0],p1[1]];
      for(var i=1 ; i<bezierPoints.length ; i++){
         var p = bezierPoints[i];
         if(p[0] < min[0]){
            min[0] = p[0];
         }
         if(p[1] < min[1]){
            min[1] = p[1];
         }
         if(p[0] > max[0]){
            max[0] = p[0];
         }
         if(p[1] > max[1]){
            max[1] = p[1];
         }
      }
      var margin = [4,4];
      min[0] = min[0]-margin[0];
      min[1] = min[1]-margin[1];
      max[0] = max[0]+margin[0];
      max[1] = max[1]+margin[1];
      var lw = Math.abs(max[0]-min[0]);
      var lh = Math.abs(max[1]-min[1]);

      this.SetCanvasRegion(min[0],min[1],lw,lh);

      var ctxt = this.getContext();

      for(var i = 0 ; i<bezierPoints.length ; i++){
         bezierPoints[i][0] = bezierPoints[i][0]-min[0];
         bezierPoints[i][1] = bezierPoints[i][1]-min[1];
      }


      ctxt.lineCap = this.options.bordercap;
      ctxt.strokeStyle = this.options.bordercolor;
      ctxt.lineWidth = this.options.width+this.options.borderwidth*2;
      ctxt.beginPath();
      ctxt.moveTo(bezierPoints[0][0],bezierPoints[0][1]);
      ctxt.bezierCurveTo(bezierPoints[1][0],bezierPoints[1][1],bezierPoints[2][0],bezierPoints[2][1],bezierPoints[3][0],bezierPoints[3][1]);
      ctxt.stroke();

      ctxt.lineCap = this.options.cap;
      ctxt.strokeStyle = this.options.color;
      ctxt.lineWidth = this.options.width;
      ctxt.beginPath();
      ctxt.moveTo(bezierPoints[0][0],bezierPoints[0][1]);
      ctxt.bezierCurveTo(bezierPoints[1][0],bezierPoints[1][1],bezierPoints[2][0],bezierPoints[2][1],bezierPoints[3][0],bezierPoints[3][1]);
      ctxt.stroke();

   },



   /**
    * This function returns terminal1 if the first argument is terminal2 and vice-versa
    * @method getOtherTerminal
    * @param   {WireIt.Terminal} terminal
    * @return  {WireIt.Terminal} terminal    the terminal that is NOT passed as argument
    */
   getOtherTerminal: function(terminal) {
      return (terminal == this.terminal1) ? this.terminal2 : this.terminal1;
   },


   /**
    * Attempted bezier drawing method for arrows
    * @method drawBezierArrows
    */
   drawBezierArrows: function() {
     var ctxt = this.getContext();
     CanvasTextFunctions.enable(ctxt);
     if (null == this.terminal1 || null == this.terminal2) {
       //debug("Missing terminal for WireIt Wire: " + this);
       return;
     }
	 	var arrowWidth = Math.round(this.options.width * 1.5 + 20);
		var arrowLength = Math.round(this.options.width * 1.2 + 20);
	  	var d = arrowWidth/2; // arrow width/2
      var redim = d+3; //we have to make the canvas a little bigger because of arrows
      var margin=[4+redim,4+redim];

      var p1 = this.terminal1.getXY();
      var p2 = this.terminal2.getXY();

      var coeffMulDirection = this.options.coeffMulDirection;


      var distance=Math.sqrt(Math.pow(p1[0]-p2[0],2)+Math.pow(p1[1]-p2[1],2));
      if(distance < coeffMulDirection){
         coeffMulDirection = distance/2;
      }

      var d1 = [this.terminal1.options.direction[0]*coeffMulDirection,
                this.terminal1.options.direction[1]*coeffMulDirection];
      var d2 = [this.terminal2.options.direction[0]*coeffMulDirection,
                this.terminal2.options.direction[1]*coeffMulDirection];

      var bezierPoints=[];
      bezierPoints[0] = p1;
      bezierPoints[1] = [p1[0]+d1[0],p1[1]+d1[1]];
      bezierPoints[2] = [p2[0]+d2[0],p2[1]+d2[1]];
      bezierPoints[3] = p2;
      var min = [p1[0],p1[1]];
      var max = [p1[0],p1[1]];
      for(var i=1 ; i<bezierPoints.length ; i++){
         var p = bezierPoints[i];
         if(p[0] < min[0]){
            min[0] = p[0];
         }
         if(p[1] < min[1]){
            min[1] = p[1];
         }
         if(p[0] > max[0]){
            max[0] = p[0];
         }
         if(p[1] > max[1]){
            max[1] = p[1];
         }
      }
      min[0] = min[0]-margin[0];
      min[1] = min[1]-margin[1];
      max[0] = max[0]+margin[0];
      max[1] = max[1]+margin[1];
      var lw = Math.abs(max[0]-min[0]);
      var lh = Math.abs(max[1]-min[1]);

      this.SetCanvasRegion(min[0],min[1],lw,lh);


      for(var i = 0 ; i<bezierPoints.length ; i++){
         bezierPoints[i][0] = bezierPoints[i][0]-min[0];
         bezierPoints[i][1] = bezierPoints[i][1]-min[1];
      }

      if (this.options.selected) {
        ctxt.lineCap = this.options.bordercap;
        ctxt.strokeStyle = this.options.bordercolor;
        ctxt.lineWidth = this.options.width+this.options.borderwidth*2;
        ctxt.beginPath();
        ctxt.moveTo(bezierPoints[0][0],bezierPoints[0][1]);
        ctxt.bezierCurveTo(bezierPoints[1][0],bezierPoints[1][1],bezierPoints[2][0],bezierPoints[2][1],bezierPoints[3][0],bezierPoints[3][1]+arrowLength/2*this.terminal2.options.direction[1]);
        ctxt.stroke();
      }

      ctxt.lineCap = this.options.cap;
      ctxt.strokeStyle = this.options.color;
      ctxt.lineWidth = this.options.width;
      ctxt.beginPath();
      ctxt.moveTo(bezierPoints[0][0],bezierPoints[0][1]);
      ctxt.bezierCurveTo(bezierPoints[1][0],bezierPoints[1][1],bezierPoints[2][0],bezierPoints[2][1],bezierPoints[3][0],bezierPoints[3][1]+arrowLength/2*this.terminal2.options.direction[1]);
      ctxt.stroke();

      if (this.options.fields.name) {
        CanvasTextFunctions.enable(ctxt);
        var center = {x:0,y:0};
        var x1 = bezierPoints[0][0];
        var x2 = bezierPoints[3][0];
        var y1 = bezierPoints[0][1];
        var y2 = bezierPoints[3][1]

        var fontSize=10;
        center.x =  (x1 + x2) / 2;
        center.y =  ((y1 + y2) / 2) + (60 * this.terminal2.options.direction[1]);
        var padding = 8;
        var hp = padding/2;
        var tWidth = ctxt.measureText("sans", fontSize,this.options.fields.name) + padding;
        var desc = ctxt.fontDescent("sans",fontSize) + hp;
        var asc = ctxt.fontAscent("sans",fontSize) + hp;
        var tHeight = desc+asc;

        var lastFillStyle = ctxt.fillStyle;
        var lastWidth = ctxt.lineWidth;
        var lastStrokeStyle = ctxt.strokeStyle;



        this.drawText();

        ctxt.fillStyle = lastFillStyle;
        ctxt.lineWidth = lastWidth;
        ctxt.strokeStyle = lastStrokeStyle;
      }

		var t1 = bezierPoints[2]
   	var t2 = p2;

   	var z = [0,0]; //point on the wire with constant distance (dlug) from terminal2
   	var dlug = arrowLength; //arrow length
   	var t = 1-(dlug/distance);
   	z[0] = Math.abs( t1[0] +  t*(t2[0]-t1[0]) );
   	z[1] = Math.abs( t1[1] + t*(t2[1]-t1[1]) );

   	var W = t1[0] - t2[0];
   	var Wa = t1[1] - t2[1];
   	var Wb = t1[0]*t2[1] - t1[1]*t2[0];
   	if (W != 0)
   	{
   		a = Wa/W;
   		b = Wb/W;
   	}
   	else
   	{
   		a = 0;
   	}
   	if (a == 0)
   	{
   		aProst = 0;
   	}
   	else
   	{
   		aProst = -1/a;
   	}
   	bProst = z[1] - aProst*z[0]; //point z lays on this line

   	var A = 1 + Math.pow(aProst,2);
   	var B = 2*aProst*bProst - 2*z[0] - 2*z[1]*aProst;
   	var C = -2*z[1]*bProst + Math.pow(z[0],2) + Math.pow(z[1],2) - Math.pow(d,2) + Math.pow(bProst,2);
   	var delta = Math.pow(B,2) - 4*A*C;
   	if (delta < 0) { return; }

   	var x1 = (-B + Math.sqrt(delta)) / (2*A);
   	var x2 = (-B - Math.sqrt(delta)) / (2*A);
   	var y1 = aProst*x1 + bProst;
   	var y2 = aProst*x2 + bProst;

   	if(t1[1] == t2[1]) {
   	      var o = (t1[0] > t2[0]) ? 1 : -1;
      	   x1 = t2[0]+o*dlug;
      	   x2 = x1;
      	   y1 -= d;
      	   y2 += d;
   	}

   	ctxt.fillStyle = this.options.color;
   	ctxt.beginPath();
   	ctxt.moveTo(t2[0],t2[1]);
   	ctxt.lineTo(x1,y1);
   	ctxt.lineTo(x2,y2);
   	ctxt.fill();

    if (this.options.selected) {
      ctxt.strokeStyle = this.options.bordercolor;
      ctxt.lineWidth = this.options.borderwidth;
      ctxt.beginPath();
      ctxt.moveTo(t2[0],t2[1]);
      ctxt.lineTo(x1,y1);
      ctxt.lineTo(x2,y2);
      ctxt.lineTo(t2[0],t2[1]);
      ctxt.stroke();
    }

   },

 /**
    * Drawing methods for arrows
    * @method drawArrows
    */
   drawArrows: function()
   {
   	var d = 7; // arrow width/2
      var redim = d+3; //we have to make the canvas a little bigger because of arrows
      var margin=[4+redim,4+redim];

      var p1 = this.terminal1.getXY();
      var p2 = this.terminal2.getXY();

      var distance=Math.sqrt(Math.pow(p1[0]-p2[0],2)+Math.pow(p1[1]-p2[1],2));

      var min=[ Math.min(p1[0],p2[0])-margin[0], Math.min(p1[1],p2[1])-margin[1]];
      var max=[ Math.max(p1[0],p2[0])+margin[0], Math.max(p1[1],p2[1])+margin[1]];


      var lw=Math.abs(max[0]-min[0])+redim;
      var lh=Math.abs(max[1]-min[1])+redim;

      p1[0]=p1[0]-min[0];
      p1[1]=p1[1]-min[1];
      p2[0]=p2[0]-min[0];
      p2[1]=p2[1]-min[1];

      this.SetCanvasRegion(min[0],min[1],lw,lh);

      var ctxt=this.getContext();

      ctxt.lineCap=this.options.bordercap;
      ctxt.strokeStyle=this.options.bordercolor;
      ctxt.lineWidth=this.options.width+this.options.borderwidth*2;
      ctxt.beginPath();
      ctxt.moveTo(p1[0],p1[1]);
      ctxt.lineTo(p2[0],p2[1]);
      ctxt.stroke();

      ctxt.lineCap=this.options.cap;
      ctxt.strokeStyle=this.options.color;
      ctxt.lineWidth=this.options.width;
      ctxt.beginPath();
      ctxt.moveTo(p1[0],p1[1]);
      ctxt.lineTo(p2[0],p2[1]);
      ctxt.stroke();

   	/* start drawing arrows */

   	var t1 = p1;
   	var t2 = p2;

   	var z = [0,0]; //point on the wire with constant distance (dlug) from terminal2
   	var dlug = 20; //arrow length
   	var t = 1-(dlug/distance);
   	z[0] = Math.abs( t1[0] +  t*(t2[0]-t1[0]) );
   	z[1] = Math.abs( t1[1] + t*(t2[1]-t1[1]) );

   	var W = t1[0] - t2[0];
   	var Wa = t1[1] - t2[1];
   	var Wb = t1[0]*t2[1] - t1[1]*t2[0];
   	if (W != 0)
   	{
   		a = Wa/W;
   		b = Wb/W;
   	}
   	else
   	{
   		a = 0;
   	}
   	if (a == 0)
   	{
   		aProst = 0;
   	}
   	else
   	{
   		aProst = -1/a;
   	}
   	bProst = z[1] - aProst*z[0]; //point z lays on this line

   	var A = 1 + Math.pow(aProst,2);
   	var B = 2*aProst*bProst - 2*z[0] - 2*z[1]*aProst;
   	var C = -2*z[1]*bProst + Math.pow(z[0],2) + Math.pow(z[1],2) - Math.pow(d,2) + Math.pow(bProst,2);
   	var delta = Math.pow(B,2) - 4*A*C;
   	if (delta < 0) { return; }

   	var x1 = (-B + Math.sqrt(delta)) / (2*A);
   	var x2 = (-B - Math.sqrt(delta)) / (2*A);
   	var y1 = aProst*x1 + bProst;
   	var y2 = aProst*x2 + bProst;

   	if(t1[1] == t2[1]) {
   	      var o = (t1[0] > t2[0]) ? 1 : -1;
      	   x1 = t2[0]+o*dlug;
      	   x2 = x1;
      	   y1 -= d;
      	   y2 += d;
   	}

   	ctxt.fillStyle = this.options.color;
   	ctxt.beginPath();
   	ctxt.moveTo(t2[0],t2[1]);
   	ctxt.lineTo(x1,y1);
   	ctxt.lineTo(x2,y2);
   	ctxt.fill();

   	ctxt.strokeStyle = this.options.bordercolor;
   	ctxt.lineWidth = this.options.borderwidth;
   	ctxt.beginPath();
   	ctxt.moveTo(t2[0],t2[1]);
   	ctxt.lineTo(x1,y1);
   	ctxt.lineTo(x2,y2);
   	ctxt.lineTo(t2[0],t2[1]);
   	ctxt.stroke();

   },

   /**
    * Drawing method for arrows
    * @method drawStraight
    */
   drawStraight: function()
   {
      var margin = [4,4];

      var p1 = this.terminal1.getXY();
      var p2 = this.terminal2.getXY();

      var min=[ Math.min(p1[0],p2[0])-margin[0], Math.min(p1[1],p2[1])-margin[1]];
      var max=[ Math.max(p1[0],p2[0])+margin[0], Math.max(p1[1],p2[1])+margin[1]];

      var lw=Math.abs(max[0]-min[0]);
      var lh=Math.abs(max[1]-min[1]);

      p1[0] = p1[0]-min[0];
      p1[1] = p1[1]-min[1];
      p2[0] = p2[0]-min[0];
      p2[1] = p2[1]-min[1];

      this.SetCanvasRegion(min[0],min[1],lw,lh);

      var ctxt=this.getContext();

      ctxt.lineCap=this.options.bordercap;
      ctxt.strokeStyle=this.options.bordercolor;
      ctxt.lineWidth=this.options.width+this.options.borderwidth*2;
      ctxt.beginPath();
      ctxt.moveTo(p1[0],p1[1]);
      ctxt.lineTo(p2[0],p2[1]);
      ctxt.stroke();

      ctxt.lineCap=this.options.cap;
      ctxt.strokeStyle=this.options.color;
      ctxt.lineWidth=this.options.width;
      ctxt.beginPath();
      ctxt.moveTo(p1[0],p1[1]);
      ctxt.lineTo(p2[0],p2[1]);
      ctxt.stroke();
   },

   /**
    * @method redraw
    */
   redraw: function() {
      if(this.options.drawingMethod == 'straight') {
         this.drawStraight();
      }
      else if(this.options.drawingMethod == 'arrows') {
         this.drawArrows();
      }
	  else if(this.options.drawingMethod == 'bezierArrows') {
         this.drawBezierArrows();
	  }
      else if(this.options.drawingMethod == 'bezier') {
         this.drawBezierCurve();
      }
      else {
         throw new Error("WireIt.Wire unable to find '"+this.drawingMethod+"' drawing method.");
      }
   },

   getLabel: function() {

     var container = $(this.element).next('.WireIt-Label-Box');

     if (! this.label_container) {
       var parent = $(this.element).parent();
       container = $('<div></div>').addClass('WireIt-Label-Box')
        .css({'position': 'absolute', 'display': 'block'});
       parent.append(container);
       this.label_container = container;
     }

     result = container.children('.WireIt-Label').first();
     if ((! result) || result.size() < 1) {
       var result = $('<div>(label me)</div>').addClass('WireIt-Label');
       container.append(result);
     }


     var leftOffset = $(this.element).offset().left;
     var topOffset = $(this.element).offset().top;
     var dWidth = ($(this.element).width() - result.width()) / 2;
     var dHeight = container.height() - $(this.element).height();
     topOffset = topOffset - (dHeight / 2);
     container.offset({
       left: $(this.element).offset().left + dWidth,
       top: topOffset
     });


     return result;
   },

   drawText: function() {
      this.getLabel().html(this.options.fields.name.wordWrap(45));
      this.getLabel().css({'color': this.options.color});
   },

   /**
    * @method wireDrawnAt
    * @return {Boolean} true if the wire is at x,y
    */
   wireDrawnAt: function(x,y) {
     var ctxt = this.getContext();
	   var imgData = ctxt.getImageData(x,y,1,1);
	   var pixel = imgData.data;
	   return !( pixel[0] == 0 && pixel[1] == 0 && pixel[2] == 0 && pixel[3] == 0 );
   },

   /**
    * Called by the Layer when the mouse moves over the canvas element.
    * Note: the event is not listened directly, to receive the event event if the wire is behind another wire
    * @method onWireMove
    * @param {Integer} x left position of the mouse (relative to the canvas)
    * @param {Integer} y top position of the mouse (relative to the canvas)
    */
   onMouseMove: function(x,y) {

      if(typeof this.mouseInState === undefined) {
         this.mouseInState = false;
      }

	   if( this.wireDrawnAt(x,y) ) {
			if(!this.mouseInState) {
			   this.mouseInState=true;
			   this.onWireIn(x,y);
			}
			this.onWireMove(x,y);
	   }
	   else {
	      if(this.mouseInState) {
	         this.mouseInState=false;
	         this.onWireOut(x,y);
	      }
	   }

   },

   /**
    * When the mouse moves over a wire
    * Note: this will only work within a layer
    * @method onWireMove
    * @param {Integer} x left position of the mouse (relative to the canvas)
    * @param {Integer} y top position of the mouse (relative to the canvas)
    */
   onWireMove: function(x,y) {
   },

   updateFields: function(options) {
    if (options) {
       for (var name in options) {
         if (this.options.fields[name]) {
           this.options.fields[name] = options.name;
         }
       }
       if (options.selected_color) {
         this.options.fields.color = options.selected_color;
       }
     }

     var new_width = parseInt(this.options.fields.width);
     if ((new_width!= NaN) && new_width > 0 && new_width < 50) {
       this.options.width = new_width;
       this.options.fields.width = new_width;
     }
     else {
       this.options.fields.width = this.options.width;
     }
     this.options.name = this.options.fields.name;

     var hexString = this.options.fields.color;
     if ($(this.options.fields.color)) {
       var rgbString = $("#"  + this.options.fields.color).css('background-color');
       if (rgbString) {
         var parts = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

         delete (parts[0]);
         for (var i = 1; i <= 3; ++i) {
             parts[i] = parseInt(parts[i]).toString(16);
             if (parts[i].length == 1) parts[i] = '0' + parts[i];
        }
         hexString = "#" + parts.join(''); // "#0070ff"
       }


       this.options.color = hexString;
     }
     this.redraw();
   },

   /**
    * When the mouse comes into the wire
    * Note: this will only work within a layer
    * @method onWireIn
    * @param {Integer} x left position of the mouse (relative to the canvas)
    * @param {Integer} y top position of the mouse (relative to the canvas)
    */
   onWireIn: function(x,y) {
      this.options.last_color = this.options.color;
      this.options.color = "#E97F02";
      this.redraw();
   },

   /**
    * When the mouse comes out of the wire
    * Note: this will only work within a layer
    * @method onWireOut
    * @param {Integer} x left position of the mouse (relative to the canvas)
    * @param {Integer} y top position of the mouse (relative to the canvas)
    */
   onWireOut: function(x,y) {
      this.options.color = this.options.last_color || "#E97F02";
      this.redraw();
   },

   /**
    * When the mouse clicked on the canvas
    * Note: this will only work within a layer
    * @method onClick
    * @param {Integer} x left position of the mouse (relative to the canvas)
    * @param {Integer} y top position of the mouse (relative to the canvas)
    */
   onClick: function(x,y) {
 	   if( this.wireDrawnAt(x,y) ) {
 	      this.onWireClick(x,y);
      }
   },

	onDblClick: function(x,y) {
		if( this.wireDrawnAt(x,y) ) {
			this.onWireDblClick(x,y);
		}
	},
   /**
    * When the mouse clicked on the wire
    * Note: this will only work within a layer
    * @method onWireClick
    * @param {Integer} x left position of the mouse (relative to the canvas)
    * @param {Integer} y top position of the mouse (relative to the canvas)
    */
   onWireClick: function(x,y) {
   },

   onWireDblClick: function(x,y) {
    this.openPropEditor();
   },

   openPropEditor: function() {
     WireIt.Wire.openPropEditorFor.fire(this);
     this.redraw;
   }
});


WireIt.Wire.openPropEditorFor  = new YAHOO.util.CustomEvent("OpenWireEditorFor");
(function() {

   var util = YAHOO.util;
   var Event = util.Event, lang = YAHOO.lang, Dom = util.Dom, CSS_PREFIX = "WireIt-";


   /**
    * Scissors widget to cut wires
    * @class Scissors
    * @namespace WireIt
    * @extends YAHOO.util.Element
    * @constructor
    * @param {WireIt.Terminal} terminal Associated terminal
    * @param {Object} oConfigs
    */
   WireIt.Scissors = function(terminal, oConfigs) {
      WireIt.Scissors.superclass.constructor.call(this, document.createElement('div'), oConfigs);

      /**
       * The terminal it is associated to
       * @property _terminal
       * @type {WireIt.Terminal}
       */
      this._terminal = terminal;

      this.initScissors();
   };
   lang.extend(WireIt.Scissors, util.Element, {

      /**
       * Init the scissors
       * @method initScissors
       */
      initScissors: function() {

         this.hideNow();
         this.addClass(CSS_PREFIX+"Wire-scissors");

         this.appendTo(this._terminal.container ? this._terminal.container.layer.el : this._terminal.el.parentNode.parentNode);

         this.on("mouseover", this.show, this, true);
         this.on("mouseout", this.hide, this, true);
         this.on("click", this.scissorClick, this, true);

         Event.addListener(this._terminal.el, "mouseover", this.mouseOver, this, true);
         Event.addListener(this._terminal.el, "mouseout", this.hide, this, true);
      },

      /**
       * @method setPosition
       */
      setPosition: function() {
         var pos = this._terminal.getXY();
         this.setStyle("left", (pos[0]+this._terminal.options.direction[0]*30-8)+"px");
         this.setStyle("top", (pos[1]+this._terminal.options.direction[1]*30-8)+"px");
      },
      /**
       * @method mouseOver
       */
      mouseOver: function() {
         if(this._terminal.wires.length > 0)  {
            this.show();
         }
      },

      /**
       * @method scissorClick
       */
      scissorClick: function() {
         this._terminal.removeAllWires();
         if(this.terminalTimeout) { this.terminalTimeout.cancel(); }
         this.hideNow();
      },
      /**
       * @method show
       */
      show: function() {
         this.setPosition();
         this.setStyle('display','');
         if(this.terminalTimeout) { this.terminalTimeout.cancel(); }
      },
      /**
       * @method hide
       */
      hide: function() {
         this.terminalTimeout = lang.later(700,this,this.hideNow);
      },
      /**
       * @method hideNow
       */
      hideNow: function() {
         this.setStyle('display','none');
      }

   });






/**
 * This class is used for wire edition. It inherits from YAHOO.util.DDProxy and acts as a "temporary" Terminal.
 * @class TerminalProxy
 * @namespace WireIt
 * @extends YAHOO.util.DDProxy
 * @constructor
 * @param {WireIt.Terminal} terminal Parent terminal
 * @param {Object} options Configuration object (see "termConfig" property for details)
 */
WireIt.TerminalProxy = function(terminal, options) {

   /**
    * Reference to the terminal parent
    */
   this.terminal = terminal;

   /**
    * Object containing the configuration object
    * <ul>
    *   <li>type: 'type' of this terminal. If no "allowedTypes" is specified in the options, the terminal will only connect to the same type of terminal</li>
    *   <li>allowedTypes: list of all the allowed types that we can connect to.</li>
    *   <li>{Integer} terminalProxySize: size of the drag drop proxy element. default is 10 for "10px"</li>
    * </ul>
    * @property termConfig
    */
   this.termConfig = options || {};

   this.terminalProxySize = options.terminalProxySize || 10;

   /**
    * Object that emulate a terminal which is following the mouse
    */
   this.fakeTerminal = null;

   WireIt.TerminalProxy.superclass.constructor.call(this,this.terminal.el, undefined, {
      dragElId: "WireIt-TerminalProxy",
      resizeFrame: false,
      centerFrame: true
   });
};

util.DDM.mode = util.DDM.INTERSECT;

lang.extend(WireIt.TerminalProxy, util.DDProxy, {

   /**
    * Took this method from the YAHOO.util.DDProxy class
    * to overwrite the creation of the proxy Element with our custom size
    * @method createFrame
    */
   createFrame: function() {
        var self=this, body=document.body;
        if (!body || !body.firstChild) {
            setTimeout( function() { self.createFrame(); }, 50 );
            return;
        }
        var div=this.getDragEl(), Dom=YAHOO.util.Dom;
        if (!div) {
            div    = document.createElement("div");
            div.id = this.dragElId;
            var s  = div.style;
            s.position   = "absolute";
            s.visibility = "hidden";
            s.cursor     = "move";
            s.border     = "2px solid #aaa";
            s.zIndex     = 999;
            var size = this.terminalProxySize+"px";
            s.height     = size;
            s.width      = size;
            var _data = document.createElement('div');
            Dom.setStyle(_data, 'height', '100%');
            Dom.setStyle(_data, 'width', '100%');
            Dom.setStyle(_data, 'background-color', '#ccc');
            Dom.setStyle(_data, 'opacity', '0');
            div.appendChild(_data);
            body.insertBefore(div, body.firstChild);
        }
    },

   /**
    * @method startDrag
    */
   startDrag: function() {

      if(this.terminal.options.nMaxWires == 1 && this.terminal.wires.length == 1) {
         this.terminal.wires[0].remove();
      }
      else if(this.terminal.wires.length >= this.terminal.options.nMaxWires) {
         return;
      }

      var halfProxySize = this.terminalProxySize/2;
      this.fakeTerminal = {
         options: {direction: this.terminal.options.fakeDirection},
         pos: [200,200],
         addWire: function() {},
         removeWire: function() {},
         getXY: function() {
            var layers = Dom.getElementsByClassName('WireIt-Layer');
            if(layers.length > 0) {
               var orig = Dom.getXY(layers[0]);
               return [this.pos[0]-orig[0]+halfProxySize, this.pos[1]-orig[1]+halfProxySize];
            }
            return this.pos;
         }
      };

      var parentEl = this.terminal.parentEl.parentNode;
      if(this.terminal.container) {
         parentEl = this.terminal.container.layer.el;
      }
      this.editingWire = new WireIt.Wire(this.terminal, this.fakeTerminal, parentEl, this.terminal.options.editingWireConfig);
      Dom.addClass(this.editingWire.element, CSS_PREFIX+'Wire-editing');
   },

   /**
    * @method onDrag
    */
   onDrag: function(e) {

      if(!this.editingWire) { return; }

      if(this.terminal.container) {
         var obj = this.terminal.container.layer.el;
         var curleft = curtop = 0;
          if (obj.offsetParent) {
            do {
              curleft += obj.offsetLeft;
              curtop += obj.offsetTop;
              obj = obj.offsetParent ;
            } while ( obj = obj.offsetParent );
          }
         this.fakeTerminal.pos = [e.clientX-curleft+this.terminal.container.layer.el.scrollLeft,
                                  e.clientY-curtop+this.terminal.container.layer.el.scrollTop];
      }
      else {
         this.fakeTerminal.pos = (YAHOO.env.ua.ie) ? [e.clientX, e.clientY] : [e.clientX+window.pageXOffset, e.clientY+window.pageYOffset];
      }
      this.editingWire.redraw();
   },


   /**
    * @method endDrag
    */
   endDrag: function(e) {
      if(this.editingWire) {
         this.editingWire.remove();
         this.editingWire = null;
      }
   },

   /**
    * @method onDragEnter
    */
   onDragEnter: function(e,ddTargets) {

      if(!this.editingWire) { return; }

      for(var i = 0 ; i < ddTargets.length ; i++) {
         if( this.isValidWireTerminal(ddTargets[i]) ) {
            ddTargets[i].terminal.setDropInvitation(true);
         }
      }
   },

   /**
    * @method onDragOut
    */
   onDragOut: function(e,ddTargets) {

      if(!this.editingWire) { return; }

      for(var i = 0 ; i < ddTargets.length ; i++) {
         if( this.isValidWireTerminal(ddTargets[i]) ) {
            ddTargets[i].terminal.setDropInvitation(false);
         }
      }
   },

   /**
    * @method onDragDrop
    */
   onDragDrop: function(e,ddTargets) {
      if(!this.editingWire) { return; }

      this.onDragOut(e,ddTargets);

      var targetTerminalProxy = null;
      for(var i = 0 ; i < ddTargets.length ; i++) {
         if( this.isValidWireTerminal(ddTargets[i]) ) {
            targetTerminalProxy = ddTargets[i];
            break;
         }
      }

      if( !targetTerminalProxy ) {
         return;
      }

      this.editingWire.remove();
      this.editingWire = null;

      var termAlreadyConnected = false;
      for(var i = 0 ; i < this.terminal.wires.length ; i++) {
         if(this.terminal.wires[i].terminal1 == this.terminal) {
            if( this.terminal.wires[i].terminal2 == targetTerminalProxy.terminal) {
               termAlreadyConnected = true;
               break;
            }
         }
         else if(this.terminal.wires[i].terminal2 == this.terminal) {
            if( this.terminal.wires[i].terminal1 == targetTerminalProxy.terminal) {
               termAlreadyConnected = true;
               break;
            }
         }
      }

      if(termAlreadyConnected) {
         return;
      }

      var parentEl = this.terminal.parentEl.parentNode;
      if(this.terminal.container) {
         parentEl = this.terminal.container.layer.el;
      }

      var term1 = this.terminal;
      var term2 = targetTerminalProxy.terminal;
      if(term2.options.alwaysSrc) {
         term1 = targetTerminalProxy.terminal;
         term2 = this.terminal;
      }





      var tgtTerm = targetTerminalProxy.terminal;
      if( tgtTerm.options.nMaxWires == 1) {
         if(tgtTerm.wires.length > 0) {
            tgtTerm.wires[0].remove();
         }
         var w = new WireIt.Wire(term1, term2, parentEl, term1.options.wireConfig);
         w.redraw();
      }
      else if(tgtTerm.wires.length < tgtTerm.options.nMaxWires) {
         var w = new WireIt.Wire(term1, term2, parentEl, term1.options.wireConfig);

        my.reset();
        my.cycle();
        my.list();
        w.redraw();

        /*
        NOAH: Removed this for Berklee Demo.
        We shouldn't have our hooks in this deep into wire-it.
        Fortunately we are re-writing wireit.

        var wires = MySystem.editor.layer.wires;
        var len = wires.length;
        var widthRange = my.defaults.arrows.width.max - my.defaults.arrows.width.min;
        var maxWidth = my.defaults.arrows.width.max;
        for( var i = 0; i < len; i++ ){
          try{

            var engineNodeFrom = wires[ i ].terminal1.container.module.engineNode;
            var engineNodeTo = wires[ i ].terminal2.container.module.engineNode;
            var lineWidth = widthRange / (my.sumInputEnergy/my.sourceCount) * ( Math.sqrt(engineNodeFrom.energyIn * engineNodeTo.energyIn) ) + my.defaults.arrows.width.min;

            wires[ i ].options.width = lineWidth;
            wires[ i ].redraw();
          }
          catch(e) {
            window.console && console.log && console.log(e);
          }
        }
        */

      }
   },


   isWireItTerminal: true,


   /**
    * @method isValidWireTerminal
    */
   isValidWireTerminal: function(DDterminal) {

      if( !DDterminal.isWireItTerminal ) {
         return false;
      }

      if(this.termConfig.type) {
         if(this.termConfig.allowedTypes) {
            if( WireIt.indexOf(DDterminal.termConfig.type, this.termConfig.allowedTypes) == -1 ) {
               return false;
            }
         }
         else {
            if(this.termConfig.type != DDterminal.termConfig.type) {
               return false;
            }
         }
      }
      else if(DDterminal.termConfig.type) {
         if(DDterminal.termConfig.allowedTypes) {
            if( WireIt.indexOf(this.termConfig.type, DDterminal.termConfig.allowedTypes) == -1 ) {
               return false;
            }
         }
         else {
            if(this.termConfig.type != DDterminal.termConfig.type) {
               return false;
            }
         }
      }

      if(this.terminal.container) {
         if(this.terminal.container.options.preventSelfWiring) {
            if(DDterminal.terminal.container == this.terminal.container) {
               return false;
            }
         }
      }

      return true;
   }

});



/**
 * Terminals represent the end points of the "wires"
 * @class Terminal
 * @constructor
 * @param {HTMLElement} parentEl Element that will contain the terminal
 * @param {Object} options Configuration object
 * @param {WireIt.Container} container (Optional) Container containing this terminal
 */
WireIt.Terminal = function(parentEl, options, container) {

   /**
    * DOM parent element
    * @property parentEl
    * @type {HTMLElement}
    */
   this.parentEl = parentEl;

   /**
    * Container (optional). Parent container of this terminal
    * @property container
    * @type {WireIt.Container}
    */
   this.container = container;

   /**
    * List of the associated wires
    * @property wires
    * @type {Array}
    */
    this.wires = [];


   this.setOptions(options);

   /**
    * Event that is fired when a wire is added
    * You can register this event with myTerminal.eventAddWire.subscribe(function(e,params) { var wire=params[0];}, scope);
    * @event eventAddWire
    */
   this.eventAddWire = new util.CustomEvent("eventAddWire");

   /**
    * Event that is fired when a wire is removed
    * You can register this event with myTerminal.eventRemoveWire.subscribe(function(e,params) { var wire=params[0];}, scope);
    * @event eventRemoveWire
    */
   this.eventRemoveWire = new util.CustomEvent("eventRemoveWire");

   /**
    * DIV dom element that will display the Terminal
    * @property el
    * @type {HTMLElement}
    */
   this.el = null;


   this.render();

   if(this.options.editable) {
      this.dd = new WireIt.TerminalProxy(this, this.options.ddConfig);
      this.scissors = new WireIt.Scissors(this);
   }
};

WireIt.Terminal.prototype = {

   /**
    * @method setOptions
    * @param {Object} options
    */
   setOptions: function(options) {

      /**
       * <p>Object that contains the terminal configuration:</p>
       *
       * <ul>
       *   <li><b>name</b>: terminal name</li>
       *   <li><b>direction</b>: direction vector of the wires when connected to this terminal (default [0,1])</li>
       *   <li><b>fakeDirection</b>: direction vector of the "editing" wire when it started from this terminal (default to -direction)</li>
       *   <li><b>editable</b>: boolean that makes the terminal editable (default to true)</li>
       *   <li><b>nMaxWires</b>: maximum number of wires for this terminal (default to Infinity)</li>
       *   <li><b>offsetPosition</b>: offset position from the parentEl position. Can be an array [top,left] or an object {left: 100, bottom: 20} or {right: 10, top: 5} etc... (default to [0,0])</li>
       *   <li><b>ddConfig</b>: configuration of the WireIt.TerminalProxy object (only if editable)</li>
       *   <li><b>alwaysSrc</b>: alwaysSrc forces this terminal to be the src terminal in the wire config (default false, only if editable)</li>
       *   <li><b>className</b>: CSS class name of the terminal (default to "WireIt-Terminal")</li>
       *   <li><b>connectedClassName</b>: CSS class added to the terminal when it is connected (default to "WireIt-Terminal-connected")</li>
       *   <li><b>dropinviteClassName</b>: CSS class added for drop invitation (default to "WireIt-Terminal-dropinvite")</li>
       * </ul>
       * @property options
       */
      this.options = {};
      this.options.name = options.name;
      this.options.direction = options.direction || [0,1];
      this.options.fakeDirection = options.fakeDirection || [-this.options.direction[0],-this.options.direction[1]];
      this.options.className = options.className || CSS_PREFIX+'Terminal';
      this.options.connectedClassName = options.connectedClassName || CSS_PREFIX+'Terminal-connected';
      this.options.dropinviteClassName = options.dropinviteClassName || CSS_PREFIX+'Terminal-dropinvite';
      this.options.editable = lang.isUndefined(options.editable) ? true : options.editable;
      this.options.nMaxWires = options.nMaxWires || Infinity;
      this.options.wireConfig = options.wireConfig || {};
      this.options.editingWireConfig = options.editingWireConfig || this.options.wireConfig;
      this.options.offsetPosition = options.offsetPosition;
      this.options.alwaysSrc = lang.isUndefined(options.alwaysSrc) ? false : options.alwaysSrc;
      this.options.ddConfig = options.ddConfig || {};
   },

   /**
    * Show or hide the drop invitation. (by adding/removing this.options.dropinviteClassName CSS class)
    * @method setDropInvitation
    * @param {Boolean} display Show the invitation if true, hide it otherwise
    */
   setDropInvitation: function(display) {
      if(display) {
         Dom.addClass(this.el, this.options.dropinviteClassName);
      }
      else {
         Dom.removeClass(this.el, this.options.dropinviteClassName);
      }
   },

   /**
    * Render the DOM of the terminal
    * @method render
    */
   render: function() {

      this.el = WireIt.cn('div', {className: this.options.className} );
      if(this.options.name) { this.el.title = this.options.name; }

      var pos = this.options.offsetPosition;
      if(pos) {
         if( lang.isArray(pos) ) {
            this.el.style.left = pos[0]+"px";
            this.el.style.top = pos[1]+"px";
         }
         else if( lang.isObject(pos) ) {
            for(var key in pos) {
               if(pos.hasOwnProperty(key) && pos[key] != ""){
                  this.el.style[key] = pos[key]+"px";
               }
            }
         }
      }

      this.parentEl.appendChild(this.el);
   },


   /**
    * Add a wire to this terminal.
    * @method addWire
    * @param {WireIt.Wire} wire Wire instance to add
    */
   addWire: function(wire) {

      this.wires.push(wire);

      Dom.addClass(this.el, this.options.connectedClassName);

      this.eventAddWire.fire(wire);
   },

   /**
    * Remove a wire
    * @method removeWire
    * @param {WireIt.Wire} wire Wire instance to remove
    */
   removeWire: function(wire) {
      var index = WireIt.indexOf(wire, this.wires), w;
      if( index != -1 ) {

         this.wires[index].destroy();

         this.wires[index] = null;
         this.wires = WireIt.compact(this.wires);

         if(this.wires.length == 0) {
            Dom.removeClass(this.el, this.options.connectedClassName);
         }

         this.eventRemoveWire.fire(wire);
      }
   },


   /**
    * This function is a temporary test. I added the border width while traversing the DOM and
    * I calculated the offset to center the wire in the terminal just after its creation
    * @method getXY
    */
   getXY: function() {

      var layerEl = this.container && this.container.layer ? this.container.layer.el : document.body;

      var obj = this.el;
      var curleft = curtop = 0;
      if (obj.offsetParent) {
        do {
          curleft += obj.offsetLeft;
          curtop += obj.offsetTop;
          obj = obj.offsetParent;
        } while ( !!obj && obj != layerEl);
      }

      return [curleft+15,curtop+15];
   },



   /**
    * Remove the terminal from the DOM
    * @method remove
    */
   remove: function() {
      while(this.wires.length > 0) {
         this.wires[0].remove();
      }
      this.parentEl.removeChild(this.el);

      Event.purgeElement(this.el);

      if(this.scissors) {
         Event.purgeElement(this.scissors.get('element'));
      }

   },



   /**
    * Returns a list of all the terminals connecter to this terminal through its wires.
    * @method getConnectedTerminals
    * @return  {Array}  List of all connected terminals
    */
   getConnectedTerminals: function() {
      var terminalList = [];
      if(this.wires) {
         for(var i = 0 ; i < this.wires.length ; i++) {
            terminalList.push(this.wires[i].getOtherTerminal(this));
         }
      }
      return terminalList;
   },


   /**
    * Redraw all the wires connected to this terminal
    * @method redrawAllWires
    */
   redrawAllWires: function() {
      if(this.wires) {
         for(var i = 0 ; i < this.wires.length ; i++) {
            this.wires[i].redraw();
         }
      }
   },

   /**
    * Remove all wires
    * @method removeAllWires
    */
   removeAllWires: function() {
      while(this.wires.length > 0) {
         this.wires[0].remove();
      }
   }

};

 /**
  * Class that extends Terminal to differenciate Input/Output terminals
  * @class WireIt.util.TerminalInput
  * @extends WireIt.Terminal
  * @constructor
  * @param {HTMLElement} parentEl Parent dom element
  * @param {Object} options configuration object
  * @param {WireIt.Container} container (Optional) Container containing this terminal
  */
WireIt.util.TerminalInput = function(parentEl, options, container) {
   WireIt.util.TerminalInput.superclass.constructor.call(this,parentEl, options, container);
};
lang.extend(WireIt.util.TerminalInput, WireIt.Terminal, {

   /**
    * Override setOptions to add the default options for TerminalInput
    * @method setOptions
    */
   setOptions: function(options) {

      WireIt.util.TerminalInput.superclass.setOptions.call(this,options);

      this.options.direction = options.direction || [0,-1];
      this.options.fakeDirection = options.fakeDirection || [0,1];
      this.options.ddConfig = {
         type: "input",
         allowedTypes: ["output"]
      };
      this.options.nMaxWires = options.nMaxWires || 1;
   }

});




 /**
  * Class that extends Terminal to differenciate Input/Output terminals
  * @class WireIt.util.TerminalOutput
  * @extends WireIt.Terminal
  * @constructor
  * @param {HTMLElement} parentEl Parent dom element
  * @param {Object} options configuration object
  * @param {WireIt.Container} container (Optional) Container containing this terminal
  */
WireIt.util.TerminalOutput = function(parentEl, options, container) {
   WireIt.util.TerminalOutput.superclass.constructor.call(this,parentEl, options, container);
};
lang.extend(WireIt.util.TerminalOutput, WireIt.Terminal, {

   /**
    * Override setOptions to add the default options for TerminalOutput
    * @method setOptions
    */
   setOptions: function(options) {

      WireIt.util.TerminalOutput.superclass.setOptions.call(this,options);

      this.options.direction = options.direction || [0,1];
      this.options.fakeDirection = options.fakeDirection || [0,-1];
      this.options.ddConfig = {
         type: "output",
         allowedTypes: ["input"]
      };
      this.options.alwaysSrc = true;
   }

});


})();
/**
 * WireIt.util.DD is a wrapper class for YAHOO.util.DD, to redraw the wires associated with the given terminals while drag-dropping
 * @class DD
 * @namespace WireIt.util
 * @extends YAHOO.util.DD
 * @constructor
 * @param {Array} terminals List of WireIt.Terminal objects associated within the DragDrop element
 * @param {String} id Parameter of YAHOO.util.DD
 * @param {String} sGroup Parameter of YAHOO.util.DD
 * @param {Object} config Parameter of YAHOO.util.DD
 */
WireIt.util.DD = function( terminals, id, sGroup, config) {
   if(!terminals) {
      throw new Error("WireIt.util.DD needs at least terminals and id");
   }
   /**
    * List of the contained terminals
    * @property _WireItTerminals
    * @type {Array}
    */
   this._WireItTerminals = terminals;

   WireIt.util.DD.superclass.constructor.call(this, id, sGroup, config);
};

YAHOO.extend(WireIt.util.DD, YAHOO.util.DD, {

   /**
    * Override YAHOO.util.DD.prototype.onDrag to redraw the wires
    * @method onDrag
    */
   onDrag: function(e) {

      if(this._domRef.offsetTop<0){
        this._domRef.style.top=0;
      }
      if(this._domRef.offsetLeft<0){
        this._domRef.style.left=0;
      }

      var terminalList = YAHOO.lang.isArray(this._WireItTerminals) ? this._WireItTerminals : (this._WireItTerminals.isWireItTerminal ? [this._WireItTerminals] : []);
      for(var i = 0 ; i < terminalList.length ; i++) {
         if(terminalList[i].wires) {
            for(var k = 0 ; k < terminalList[i].wires.length ; k++) {
               terminalList[i].wires[k].redraw();
            }
         }
      }
   },

   /**
    * In case you change the terminals since you created the WireIt.util.DD:
    * @method setTerminals
    */
   setTerminals: function(terminals) {
      this._WireItTerminals = terminals;
   }

});
/**
 * Make a container resizable
 * @class DDResize
 * @namespace WireIt.util
 * @extends YAHOO.util.DragDrop
 * @constructor
 * @param {WireIt.Container} container The container that is to be resizable
 * @param {Object} config Configuration object
 */
WireIt.util.DDResize = function(container, config) {

   /**
    * Configuration object
    * <ul>
    *   <li>minWidth: minimum width (default 50)</li>
    *   <li>minHeight: minimum height (default 50)</li>
    * </ul>
    * @property myConf
    */
   this.myConf = config || {};
   this.myConf.container = container;
   this.myConf.minWidth = this.myConf.minWidth || 50;
   this.myConf.minHeight = this.myConf.minHeight || 50;

   WireIt.util.DDResize.superclass.constructor.apply(this, [container.el, container.ddResizeHandle]);

   this.setHandleElId(container.ddResizeHandle);

   /**
    * The event fired when the container is resized
    * @event eventResize
    */
   this.eventResize = new YAHOO.util.CustomEvent("eventResize");
};

YAHOO.extend(WireIt.util.DDResize, YAHOO.util.DragDrop, {

   /**
    * @method onMouseDown
    */
   onMouseDown: function(e) {
        var panel = this.getEl();
        this.startWidth = panel.offsetWidth;
        this.startHeight = panel.offsetHeight;

        this.startPos = [YAHOO.util.Event.getPageX(e), YAHOO.util.Event.getPageY(e)];
    },

    /**
     * @method onDrag
     */
    onDrag: function(e) {
        var newPos = [YAHOO.util.Event.getPageX(e),  YAHOO.util.Event.getPageY(e)];

        var offsetX = newPos[0] - this.startPos[0];
        var offsetY = newPos[1] - this.startPos[1];

        var newWidth = Math.max(this.startWidth + offsetX, this.myConf.minWidth);
        var newHeight = Math.max(this.startHeight + offsetY, this.myConf.minHeight);

        var panel = this.getEl();
        panel.style.width = newWidth + "px";
        panel.style.height = newHeight + "px";

        this.eventResize.fire([newWidth, newHeight]);
    }
});
(function() {
   var util = YAHOO.util;
   var Dom = util.Dom;
   var Event = util.Event;
   var CSS_PREFIX = "WireIt-";

/**
 * Visual module that contains terminals. The wires are updated when the module is dragged around.
 * @class Container
 * @namespace WireIt
 * @constructor
 * @param {Object}   options      Configuration object (see properties)
 * @param {WireIt.Layer}   layer The WireIt.Layer (or subclass) instance that contains this container
 */
WireIt.Container = function(options, layer) {

   this.setOptions(options);

   /**
    * the WireIt.Layer object that schould contain this container
    * @property layer
    * @type {WireIt.Layer}
    */
   this.layer = layer;

   /**
    * List of the terminals
    * @property terminals
    * @type {Array}
    */
   this.terminals = [];

   /**
    * List of all the wires connected to this container terminals
    * @property wires
    * @type {Array}
    */
   this.wires = [];

   /**
    * Container DOM element
    * @property el
    * @type {HTMLElement}
    */
   this.el = null;

   /**
    * Body element
    * @property bodyEl
    * @type {HTMLElement}
    */
   this.bodyEl = null;

   /**
    * Event that is fired when a wire is added
    * You can register this event with myTerminal.eventAddWire.subscribe(function(e,params) { var wire=params[0];}, scope);
    * @event eventAddWire
    */
   this.eventAddWire = new YAHOO.util.CustomEvent("eventAddWire");;

   /**
    * Event that is fired when a wire is removed
    * You can register this event with myTerminal.eventRemoveWire.subscribe(function(e,params) { var wire=params[0];}, scope);
    * @event eventRemoveWire
    */
   this.eventRemoveWire = new util.CustomEvent("eventRemoveWire");

   this.render();

   this.initTerminals( this.options.terminals);

	if(this.options.draggable) {

	   if(this.options.resizable) {
      	this.ddResize = new WireIt.util.DDResize(this);
      	this.ddResize.eventResize.subscribe(this.onResize, this, true);
	   }

	   this.dd = new WireIt.util.DD(this.terminals,this.el);

	   if(this.options.ddHandle) {
   	   this.dd.setHandleElId(this.ddHandle);
	   }

	   if(this.options.resizable) {
   	   this.dd.addInvalidHandleId(this.ddResizeHandle);
      	this.ddResize.addInvalidHandleId(this.ddHandle);
	   }
   }

};

WireIt.Container.prototype = {

   /**
    * set the options
    * @method setOptions
    */
   setOptions: function(options) {

      /**
       * Main options object
       * <ul>
       *    <li>terminals: list of the terminals configuration</li>
       *    <li>draggable: boolean that enables drag'n drop on this container (default: true)</li>
       *    <li>className: CSS class name for the container element (default 'WireIt-Container')</li>
       *    <li>position: initial position of the container</li>
       *    <li>ddHandle: (only if draggable) boolean indicating we use a handle for drag'n drop (default true)</li>
       *    <li>ddHandleClassName: CSS class name for the drag'n drop handle (default 'WireIt-Container-ddhandle')</li>
       *    <li>resizable: boolean that makes the container resizable (default true)</li>
       *    <li>resizeHandleClassName: CSS class name for the resize handle (default 'WireIt-Container-resizehandle')</li>
       *    <li>width: initial width of the container (no default so it autoadjusts to the content)</li>
       *    <li>height: initial height of the container (default 100)</li>
       *    <li>close: display a button to close the container (default true)</li>
       *    <li>closeButtonClassName: CSS class name for the close button (default "WireIt-Container-closebutton")</li>
       *    <li>title</li>
       *    <li>icon</li>
       *    <li>preventSelfWiring: option to prevent connections between terminals of this same container</li>
       * </ul>
       * @property options
       * @type {Object}
       */
      this.options = {};
      this.options.terminals = options.terminals || [];
      this.options.draggable = (typeof options.draggable == "undefined") ? true : options.draggable ;
      this.options.position = options.position || [100,100];
      this.options.className = options.className || CSS_PREFIX+'Container';

      this.options.ddHandle = (typeof options.ddHandle == "undefined") ? true : options.ddHandle;
      this.options.ddHandleClassName = options.ddHandleClassName || CSS_PREFIX+"Container-ddhandle";

      this.options.resizable = (typeof options.resizable == "undefined") ? true : options.resizable;
      this.options.resizeHandleClassName = options.resizeHandleClassName || CSS_PREFIX+"Container-resizehandle";

      this.options.width = options.width; // no default
      this.options.height = options.height;

      this.options.close = (typeof options.close == "undefined") ? true : options.close;
      this.options.closeButtonClassName = options.closeButtonClassName || CSS_PREFIX+"Container-closebutton";

      this.options.title = options.title; // no default

      this.options.icon = options.icon;

      this.options.preventSelfWiring = (typeof options.preventSelfWiring == "undefined") ? true : options.preventSelfWiring;
   },

   /**
    * Function called when the container is being resized.
    * It doesn't do anything, so please override it.
    * @method onResize
    */
   onResize: function(event, args) {
      var size = args[0];
      WireIt.sn(this.bodyEl, null, {width: (size[0]-10)+"px", height: (size[1]-44)+"px"});
   },

   /**
    * Render the dom of the container
    * @method render
    */
   render: function() {

      this.el = WireIt.cn('div', {className: this.options.className});

      if(this.options.width) {
         this.el.style.width = this.options.width+"px";
      }
      if(this.options.height) {
         this.el.style.height = this.options.height+"px";
      }

      Event.addListener(this.el, "mousedown", this.onMouseDown, this, true);

      if(this.options.ddHandle) {

      	this.ddHandle = WireIt.cn('div', {className: this.options.ddHandleClassName});
      	this.el.appendChild(this.ddHandle);

         if(this.options.title) {
            this.ddHandle.appendChild( WireIt.cn('span', null, null, this.options.title) );
         }

         if (this.options.icon) {
            var iconCn = WireIt.cn('img', {src: this.options.icon, className: 'WireIt-Container-icon'});
            this.ddHandle.appendChild(iconCn);
         }

      }

      this.bodyEl = WireIt.cn('div', {className: "body"});
      this.el.appendChild(this.bodyEl);

      if(this.options.resizable) {
      	this.ddResizeHandle = WireIt.cn('div', {className: this.options.resizeHandleClassName} );
      	this.el.appendChild(this.ddResizeHandle);
      }

      if(this.options.close) {
         this.closeButton = WireIt.cn('div', {className: this.options.closeButtonClassName} );
         this.el.appendChild(this.closeButton);
         Event.addListener(this.closeButton, "click", this.onCloseButton, this, true);
      }

      this.layer.el.appendChild(this.el);

   	this.el.style.left = this.options.position[0]+"px";
   	this.el.style.top = this.options.position[1]+"px";
   },

   /**
    * Sets the content of the body element
    * @method setBody
    * @param {String or HTMLElement} content
    */
   setBody: function(content) {
      if(typeof content == "string") {
         this.bodyEl.innerHTML = content;
      }
      else {
         this.bodyEl.innerHTML = "";
         this.bodyEl.appendChild(content);
      }
   },

   /**
    * Called when the user made a mouse down on the container and sets the focus to this container (only if within a Layer)
    * @method onMouseDown
    */
   onMouseDown: function() {
      if(this.layer) {
         if(this.layer.focusedContainer && this.layer.focusedContainer != this) {
            this.layer.focusedContainer.removeFocus();
         }
         this.setFocus();
         this.layer.focusedContainer = this;
      }
   },

   /**
    * Adds the class that shows the container as "focused"
    * @method setFocus
    */
   setFocus: function() {
      Dom.addClass(this.el, CSS_PREFIX+"Container-focused");
   },

   /**
    * Remove the class that shows the container as "focused"
    * @method removeFocus
    */
   removeFocus: function() {
      Dom.removeClass(this.el, CSS_PREFIX+"Container-focused");
   },

   /**
    * Called when the user clicked on the close button
    * @method onCloseButton
    */
   onCloseButton: function(e, args) {
      Event.stopEvent(e);
      this.layer.removeContainer(this);
   },

   /**
    * Remove this container from the dom
    * @method remove
    */
   remove: function() {

      this.removeAllTerminals();

      this.layer.el.removeChild(this.el);

      Event.purgeElement(this.el);
   },


   /**
    * Call the addTerminal method for each terminal configuration.
    * @method initTerminals
    */
   initTerminals: function(terminalConfigs) {
      for(var i = 0 ; i < terminalConfigs.length ; i++) {
         this.addTerminal(terminalConfigs[i]);
      }
   },


   /**
    * Instanciate the terminal from the class pointer "xtype" (default WireIt.Terminal)
    * @method addTerminal
    * @return {WireIt.Terminal}  terminal Created terminal
    */
   addTerminal: function(terminalConfig) {

      var type = eval(terminalConfig.xtype || "WireIt.Terminal");

      var term = new type(this.el, terminalConfig, this);

      this.terminals.push( term );

      term.eventAddWire.subscribe(this.onAddWire, this, true);
      term.eventRemoveWire.subscribe(this.onRemoveWire, this, true);

      return term;
   },

   /**
    * This method is called when a wire is added to one of the terminals
    * @method onAddWire
    * @param {Event} event The eventAddWire event fired by the terminal
    * @param {Array} args This array contains a single element args[0] which is the added Wire instance
    */
   onAddWire: function(event, args) {
      var wire = args[0];
      if( WireIt.indexOf(wire, this.wires) == -1 ) {
         this.wires.push(wire);
         this.eventAddWire.fire(wire);
      }
   },

   /**
    * This method is called when a wire is removed from one of the terminals
    * @method onRemoveWire
    * @param {Event} event The eventRemoveWire event fired by the terminal
    * @param {Array} args This array contains a single element args[0] which is the removed Wire instance
    */
   onRemoveWire: function(event, args) {
      var wire = args[0];
      var index = WireIt.indexOf(wire, this.wires);
      if( index != -1 ) {
         this.eventRemoveWire.fire(wire);
         this.wires[index] = null;
      }
      this.wires = WireIt.compact(this.wires);
   },

   /**
    * Remove all terminals
    * @method removeAllTerminals
    */
   removeAllTerminals: function() {
      for(var i = 0 ; i < this.terminals.length ; i++) {
         this.terminals[i].remove();
      }
      this.terminals = [];
   },

   /**
    * Redraw all the wires connected to the terminals of this container
    * @method redrawAllTerminals
    */
   redrawAllWires: function() {
      for(var i = 0 ; i < this.terminals.length ; i++) {
         this.terminals[i].redrawAllWires();
      }
   },

   /**
    * Return the config of this container.
    * @method getConfig
    */
   getConfig: function() {

      return this.options;
   },

   /**
    * @method getValue
    */
   getValue: function() {
      return {};
   },

   /**
    * @method setValue
    */
   setValue: function(val) {
   },


   /**
    * @method getTerminal
    */
   getTerminal: function(name) {
      var term;
      for(var i = 0 ; i < this.terminals.length ; i++) {
         term = this.terminals[i];
         if(term.options.name == name) {
            return term;
         }
      }
      return null;
   }

};

})();
/**
 * Container represented by an image
 * @class ImageContainer
 * @extends WireIt.Container
 * @constructor
 * @param {Object} options
 * @param {WireIt.Layer} layer
 */
WireIt.ImageContainer = function(options, layer) {
   WireIt.ImageContainer.superclass.constructor.call(this, options, layer);
};

YAHOO.lang.extend(WireIt.ImageContainer, WireIt.Container, {


   /**
    * @method setOptions
    * @param {Object} options the options object
    */
   setOptions: function(options) {
      WireIt.ImageContainer.superclass.setOptions.call(this, options);

      this.options.image = options.image;
      this.options.xtype = "WireIt.ImageContainer";

      this.options.className = options.className || "WireIt-Container WireIt-ImageContainer";

      this.options.resizable = (typeof options.resizable == "undefined") ? false : options.resizable;
      this.options.ddHandle = (typeof options.ddHandle == "undefined") ? false : options.ddHandle;
   },


   /**
    * @method render
    */
   render: function() {
      WireIt.ImageContainer.superclass.render.call(this);
      YAHOO.util.Dom.setStyle(this.bodyEl, "background-image", "url("+this.options.image+")");
      var newImg = new Image();
      newImg.src = this.options.image;
      var height = newImg.height;
      var width = newImg.width;
      this.el.style.height=height+"px";
      this.el.style.width=width+"px";
      this.bodyEl.style.width=width+"px"
      this.bodyEl.style.height=height+"px"
   },

   /**
    * Called when the user made a mouse down on the container and sets the focus to this container (only if within a Layer)
    * @method onMouseDown
    */
   onMouseDown: function() {
      if (this.click) // huh? I swear it was like this!
      if(this.layer) {
         if(this.layer.focusedContainer && this.layer.focusedContainer != this) {
            this.layer.focusedContainer.removeFocus();
         }
         this.setFocus();
         this.layer.focusedContainer = this;
      }
   }

});
/**
 * A layer encapsulate a bunch of containers and wires
 * @class Layer
 * @namespace WireIt
 * @constructor
 * @param {Object}   options   Configuration object (see the properties)
 */
WireIt.Layer = function(options) {

   this.setOptions(options);

   /**
    * List of all the WireIt.Container (or subclass) instances in this layer
    * @property containers
    * @type {Array}
    */
   this.containers = [];

   /**
    * List of all the WireIt.Wire (or subclass) instances in this layer
    * @property wires
    * @type {Array}
    */
   this.wires = [];

   /**
    * Layer DOM element
    * @property el
    * @type {HTMLElement}
    */
   this.el = null;


   /**
    * Event that is fired when a wire is added
    * You can register this event with myTerminal.eventAddWire.subscribe(function(e,params) { var wire=params[0];}, scope);
    * @event eventAddWire
    */
   this.eventAddWire = new YAHOO.util.CustomEvent("eventAddWire");

   /**
    * Event that is fired when a wire is removed
    * You can register this event with myTerminal.eventRemoveWire.subscribe(function(e,params) { var wire=params[0];}, scope);
    * @event eventRemoveWire
    */
   this.eventRemoveWire = new YAHOO.util.CustomEvent("eventRemoveWire");


   /**
    * Event that is fired when a container is added
    * You can register this event with myTerminal.eventAddContainer.subscribe(function(e,params) { var container=params[0];}, scope);
    * @event eventAddContainer
    */
   this.eventAddContainer = new YAHOO.util.CustomEvent("eventAddContainer");

   /**
    * Event that is fired when a container is removed
    * You can register this event with myTerminal.eventRemoveContainer.subscribe(function(e,params) { var container=params[0];}, scope);
    * @event eventRemoveContainer
    */
   this.eventRemoveContainer = new YAHOO.util.CustomEvent("eventRemoveContainer");

   /**
    * Event that is fired when a container has been moved
    * You can register this event with myTerminal.eventContainerDragged.subscribe(function(e,params) { var container=params[0];}, scope);
    * @event eventContainerDragged
    */
   this.eventContainerDragged = new YAHOO.util.CustomEvent("eventContainerDragged");

   /**
    * Event that is fired when a container has been resized
    * You can register this event with myTerminal.eventContainerResized.subscribe(function(e,params) { var container=params[0];}, scope);
    * @event eventContainerResized
    */
   this.eventContainerResized = new YAHOO.util.CustomEvent("eventContainerResized");


   this.render();

   this.initContainers();

   this.initWires();

   if(this.options.layerMap) {
      this.layerMap = new WireIt.LayerMap(this, this.options.layerMapOptions);
   }

};

WireIt.Layer.prototype = {

   /**
    * @method setOptions
    */
   setOptions: function(options) {
      /**
       * Configuration object of the layer
       * <ul>
       *   <li>className: CSS class name for the layer element (default 'WireIt-Layer')</li>
       *   <li>parentEl: DOM element that schould contain the layer (default document.body)</li>
       *   <li>containers: array of container configuration objects</li>
       *   <li>wires: array of wire configuration objects</li>
       *   <li>layerMap: boolean</li>
       *   <li>layerMapOptions: layer map options</li>
       * </ul>
       * @property options
       */
      this.options = {};
      this.options.className = options.className || 'WireIt-Layer';
      this.options.parentEl = options.parentEl || document.body;
      this.options.containers = options.containers || [];
      this.options.wires = options.wires || [];
      this.options.layerMap = YAHOO.lang.isUndefined(options.layerMap) ? false : options.layerMap;
      this.options.layerMapOptions = options.layerMapOptions;
      this.options.enableMouseEvents = YAHOO.lang.isUndefined(options.enableMouseEvents) ? true : options.enableMouseEvents;
   },

   /**
    * Create the dom of the layer and insert it into the parent element
    * @method render
    */
   render: function() {
      this.el = WireIt.cn('div', {className: this.options.className} );
      this.options.parentEl.appendChild(this.el);
   },

   /**
    * Create all the containers passed as options
    * @method initContainers
    */
   initContainers: function() {
      for(var i = 0 ; i < this.options.containers.length ; i++) {
         this.addContainer(this.options.containers[i]);
      }
   },

   /**
    * Create all the wires passed in the config
    * @method initWires
    */
   initWires: function() {
      for(var i = 0 ; i < this.options.wires.length ; i++) {
         this.addWire(this.options.wires[i]);
      }
   },

   /**
    * Instanciate a wire given its "xtype" (default to WireIt.Wire)
    * @method addWire
    * @param {Object} wireConfig  Wire configuration object (see WireIt.Wire class for details)
    * @return {WireIt.Wire} Wire instance build from the xtype
    */
   addWire: function(wireConfig) {
      var type = eval(wireConfig.xtype || "WireIt.Wire");

      var src = wireConfig.src;
      var tgt = wireConfig.tgt;

      var terminal1 = this.containers[src.moduleId].getTerminal(src.terminal);
      var terminal2 = this.containers[tgt.moduleId].getTerminal(tgt.terminal);
      var wire = new type( terminal1, terminal2, this.el, wireConfig.options);
      wire.redraw();

      return wire;
   },

   /**
    * Instanciate a container given its "xtype": WireIt.Container (default) or a subclass of it.
    * @method addContainer
    * @param {Object} containerConfig  Container configuration object (see WireIt.Container class for details)
    * @return {WireIt.Container} Container instance build from the xtype
    */
   addContainer: function(containerConfig) {

      var type = eval('('+(containerConfig.xtype || "WireIt.Container")+')');
      if(!YAHOO.lang.isFunction(type)) {
         throw new Error("WireIt layer unable to add container: xtype '"+containerConfig.xtype+"' not found");
      }
      var container = new type(containerConfig, this);

      this.containers.push( container );

      container.eventAddWire.subscribe(this.onAddWire, this, true);
      container.eventRemoveWire.subscribe(this.onRemoveWire, this, true);

      if(container.ddResize) {
         container.ddResize.on('endDragEvent', function() {
            this.eventContainerResized.fire(container);
         }, this, true);
      }
      if(container.dd) {
         container.dd.on('endDragEvent', function() {
            this.eventContainerDragged.fire(container);
         }, this, true);
      }

      this.eventAddContainer.fire(container);

      return container;
   },

   /**
    * Remove a container
    * @method removeContainer
    * @param {WireIt.Container} container Container instance to remove
    */
   removeContainer: function(container) {
      var index = WireIt.indexOf(container, this.containers);
      if( index != -1 ) {
         container.remove();
         this.containers[index] = null;
         this.containers = WireIt.compact(this.containers);

         this.eventRemoveContainer.fire(container);
      }
   },

   /**
    * Update the wire list when any of the containers fired the eventAddWire
    * @method onAddWire
    * @param {Event} event The eventAddWire event fired by the container
    * @param {Array} args This array contains a single element args[0] which is the added Wire instance
    */
   onAddWire: function(event, args) {
      var wire = args[0];
      if( WireIt.indexOf(wire, this.wires) == -1 ) {
         this.wires.push(wire);

         if(this.options.enableMouseEvents) {
            YAHOO.util.Event.addListener(wire.element, "mousemove", this.onWireMouseMove, this, true);
            YAHOO.util.Event.addListener(wire.element, "click", this.onWireClick, this, true);
            YAHOO.util.Event.addListener(wire.element, "dblclick", this.onWireDblClick, this, true);
         }

         this.eventAddWire.fire(wire);
      }
   },

   /**
    * Update the wire list when a wire is removed
    * @method onRemoveWire
    * @param {Event} event The eventRemoveWire event fired by the container
    * @param {Array} args This array contains a single element args[0] which is the removed Wire instance
    */
   onRemoveWire: function(event, args) {
      var wire = args[0];
      var index = WireIt.indexOf(wire, this.wires);
      if( index != -1 ) {
         this.wires[index] = null;
         this.wires = WireIt.compact(this.wires);
         this.eventRemoveWire.fire(wire);
      }
   },

   /**
    * Remove all the containers in this layer (and the associated terminals and wires)
    * @method removeAllContainers
    */
   removeAllContainers: function() {
      while(this.containers.length > 0) {
         this.removeContainer(this.containers[0]);
      }
   },


   /**
    * Return an object that represent the state of the layer including the containers and the wires
    * @method getWiring
    * @return {Obj} layer configuration
    */
   getWiring: function() {
      var i;
      var obj = {containers: [], wires: []};

      for( i = 0 ; i < this.containers.length ; i++) {
         obj.containers.push( this.containers[i].getConfig() );
      }

      for( i = 0 ; i < this.wires.length ; i++) {
         var wire = this.wires[i];

         var wireObj = {
            src: {moduleId: WireIt.indexOf(wire.terminal1.container, this.containers), terminal: wire.terminal1.options.name },
            tgt: {moduleId: WireIt.indexOf(wire.terminal2.container, this.containers), terminal: wire.terminal2.options.name },
            options: wire.options
         };
         obj.wires.push(wireObj);
      }
      return obj;
   },

   /**
    * Load a layer configuration object
    * @method setWiring
    * @param {Object} wiring layer configuration
    */
   setWiring: function(wiring) {
      this.removeAllContainers();

      if(YAHOO.lang.isArray(wiring.containers)) {
         for(var i = 0 ; i < wiring.containers.length ; i++) {
            this.addContainer(wiring.containers[i]);
         }
      }
      if(YAHOO.lang.isArray(wiring.wires)) {
         for(var i = 0 ; i < wiring.wires.length ; i++) {
            this.addWire(wiring.wires[i]);
         }
       }
   },

   /**
    * Alias for removeAllContainers
    * @method clear
    */
   clear: function() {
      this.removeAllContainers();
   },

   /**
    * Returns a position relative to the layer from a mouse event
    * @method _getMouseEvtPos
    * @param {Event} e Mouse event
    * @return {Array} position
    */
   _getMouseEvtPos: function(e) {
   	var tgt = YAHOO.util.Event.getTarget(e);
   	var tgtPos = [tgt.offsetLeft, tgt.offsetTop];
   	return [tgtPos[0]+e.layerX, tgtPos[1]+e.layerY];
   },

   /**
    * Handles click on any wire canvas
    * Note: we treat mouse events globally so that wires behind others can still receive the events
    * @method onWireClick
    * @param {Event} e Mouse click event
    */
   onWireClick: function(e) {
      var p = this._getMouseEvtPos(e);
   	var lx = p[0], ly = p[1], n = this.wires.length, w;
   	for(var i = 0 ; i < n ; i++) {
   	   w = this.wires[i];
      	var elx = w.element.offsetLeft, ely = w.element.offsetTop;
   	   if( lx >= elx && lx < elx+w.element.width && ly >= ely && ly < ely+w.element.height ) {
   	      var rx = lx-elx, ry = ly-ely; // relative to the canvas
   			w.onClick(rx,ry);
   	   }
   	}
   },

   /**
    * Handles double click on any wire canvas
    * Note: we treat mouse events globally so that wires behind others can still receive the events
    * @method onWireDblClick
    * @param {Event} e Mouse click event
    */
   onWireDblClick: function(e) {
      var p = this._getMouseEvtPos(e);
   	var lx = p[0], ly = p[1], n = this.wires.length, w;
   	for(var i = 0 ; i < n ; i++) {
   	   w = this.wires[i];
      	var elx = w.element.offsetLeft, ely = w.element.offsetTop;
   	   if( lx >= elx && lx < elx+w.element.width && ly >= ely && ly < ely+w.element.height ) {
   	      var rx = lx-elx, ry = ly-ely; // relative to the canvas
   			w.onDblClick(rx,ry);
   	   }
   	}
   },

   /**
    * Handles mousemove events on any wire canvas
    * Note: we treat mouse events globally so that wires behind others can still receive the events
    * @method onWireMouseMove
    * @param {Event} e Mouse click event
    */
   onWireMouseMove: function(e) {
      var p = this._getMouseEvtPos(e);
   	var lx = p[0], ly = p[1], n = this.wires.length, w;
   	for(var i = 0 ; i < n ; i++) {
   	   w = this.wires[i];
      	var elx = w.element.offsetLeft, ely = w.element.offsetTop;
   	   if( lx >= elx && lx < elx+w.element.width && ly >= ely && ly < ely+w.element.height ) {
   	      var rx = lx-elx, ry = ly-ely; // relative to the canvas
   			w.onMouseMove(rx,ry);
   	   }
   	}
   },


   /**
    * Layer explosing animation
    * @method clearExplode
    */
   clearExplode: function(callback, bind) {

      var center = [ Math.floor(YAHOO.util.Dom.getViewportWidth()/2),
   		            Math.floor(YAHOO.util.Dom.getViewportHeight()/2)];
      var R = 1.2*Math.sqrt( Math.pow(center[0],2)+Math.pow(center[1],2));

      for(var i = 0 ; i < this.containers.length ; i++) {
          var left = parseInt(dbWire.layer.containers[i].el.style.left.substr(0,dbWire.layer.containers[i].el.style.left.length-2),10);
   	    var top = parseInt(dbWire.layer.containers[i].el.style.top.substr(0,dbWire.layer.containers[i].el.style.top.length-2),10);

   	    var d = Math.sqrt( Math.pow(left-center[0],2)+Math.pow(top-center[1],2) );

   	    var u = [ (left-center[0])/d, (top-center[1])/d];
   	    YAHOO.util.Dom.setStyle(this.containers[i].el, "opacity", "0.8");

   	    var myAnim = new WireIt.util.Anim(this.containers[i].terminals, this.containers[i].el, {
              left: { to: center[0]+R*u[0] },
              top: { to: center[1]+R*u[1] },
   	        opacity: { to: 0, by: 0.05},
   	        duration: 3
          });
          if(i == this.containers.length-1) {
             myAnim.onComplete.subscribe(function() { this.clear(); callback.call(bind);}, this, true);
          }
   	    myAnim.animate();
      }

   }


};
/**
 * Class used to build a container with inputEx forms
 * @class FormContainer
 * @namespace WireIt
 * @extends WireIt.Container
 * @constructor
 * @param {Object}   options  Configuration object (see properties)
 * @param {WireIt.Layer}   layer The WireIt.Layer (or subclass) instance that contains this container
 */
WireIt.FormContainer = function(options, layer) {
   WireIt.FormContainer.superclass.constructor.call(this, options, layer);
};

YAHOO.lang.extend(WireIt.FormContainer, WireIt.Container, {

   /**
    * @method setOptions
    */
   setOptions: function(options) {
      WireIt.FormContainer.superclass.setOptions.call(this, options);

      this.options.legend = options.legend;
      this.options.collapsible = options.collapsible;
      this.options.fields = options.fields;
   },

   /**
    * The render method is overrided to call renderForm
    * @method render
    */
   render: function() {
      WireIt.FormContainer.superclass.render.call(this);
      this.renderForm();
   },

   /**
    * Render the form
    * @method renderForm
    */
   renderForm: function() {
      for(var i = 0 ; i < this.options.fields.length ; i++) {
         this.options.fields[i].inputParams.container = this;
      }
      var groupParams = {parentEl: this.bodyEl, fields: this.options.fields, legend: this.options.legend, collapsible: this.options.collapsible};
      this.form = new YAHOO.inputEx.Group(groupParams);
   },

   /**
    * @method getValue
    */
   getValue: function() {
      return this.form.getValue();
   },

   /**
    * @method setValue
    */
   setValue: function(val) {
      this.form.setValue(val);
   }

});
(function() {

   var Dom = YAHOO.util.Dom, Event = YAHOO.util.Event;

/**
 * Widget to display a minimap on a layer
 * @class LayerMap
 * @namespace WireIt
 * @extends WireIt.CanvasElement
 * @constructor
 * @param {WireIt.Layer} layer the layer object it is attached to
 * @param {Obj} options configuration object
 */
WireIt.LayerMap = function(layer,options) {

   /**
    * @property layer
    */
   this.layer = layer;

   this.setOptions(options);

   WireIt.LayerMap.superclass.constructor.call(this, this.options.parentEl);

   this.element.className = this.options.className;

   this.initEvents();

   this.draw();
};

YAHOO.lang.extend(WireIt.LayerMap, WireIt.CanvasElement, {

   /**
    * @method setOptions
    * @param {Object} options
    */
   setOptions: function(options) {
      var options = options || {};
      /**
       * Options:
       * <ul>
       *    <li>parentEl: parent element (defaut layer.el)</li>
       *    <li>className: default to "WireIt-LayerMap"</li>
       *    <li>style: display style, default to "rgba(0, 0, 200, 0.5)"</li>
       *    <li>lineWidth: default 2</li>
       * </ul>
       * @property options
       */
      this.options = {};
      this.options.parentEl = Dom.get(options.parentEl || this.layer.el);
      this.options.className = options.className || "WireIt-LayerMap";
      this.options.style = options.style || "rgba(0, 0, 200, 0.5)";
      this.options.lineWidth = options.lineWidth || 2;
   },


   /**
    * Listen for various events that should redraw the layer map
    * @method initEvents
    */
   initEvents: function() {

      var layer = this.layer;

      Event.addListener(this.element, 'mousedown', this.onMouseDown, this, true);
      Event.addListener(this.element, 'mouseup', this.onMouseUp, this, true);
      Event.addListener(this.element, 'mousemove', this.onMouseMove, this, true);
      Event.addListener(this.element, 'mouseout', this.onMouseUp, this, true);

      layer.eventAddWire.subscribe(this.draw, this, true);
      layer.eventRemoveWire.subscribe(this.draw, this, true);
      layer.eventAddContainer.subscribe(this.draw, this, true);
      layer.eventRemoveContainer.subscribe(this.draw, this, true);
      layer.eventContainerDragged.subscribe(this.draw, this, true);
      layer.eventContainerResized.subscribe(this.draw, this, true);

      Event.addListener(this.layer.el, "scroll", this.onLayerScroll, this, true);
   },

   /**
    * When a mouse move is received
    * @method onMouseMove
    * @param {Event} e Original event
    * @param {Array} args event parameters
    */
   onMouseMove: function(e, args) {
      Event.stopEvent(e);
      if(this.isMouseDown)
         this.scrollLayer(e.clientX,e.clientY);
   },

   /**
    * When a mouseup or mouseout is received
    * @method onMouseUp
    * @param {Event} e Original event
    * @param {Array} args event parameters
    */
   onMouseUp: function(e, args) {
      Event.stopEvent(e);
      this.isMouseDown = false;
   },

   /**
    * When a mouse down is received
    * @method onMouseDown
    * @param {Event} e Original event
    * @param {Array} args event parameters
    */
   onMouseDown: function(e, args) {
      Event.stopEvent(e);
      this.scrollLayer(e.clientX,e.clientY);
      this.isMouseDown = true;
   },

   /**
    * Scroll the layer from mousedown/mousemove
    * @method scrollLayer
    * @param {Integer} clientX mouse event x coordinate
    * @param {Integer} clientY mouse event y coordinate
    */
   scrollLayer: function(clientX, clientY) {

      var canvasPos = Dom.getXY(this.element);
      var click = [ clientX-canvasPos[0], clientY-canvasPos[1] ];

      var canvasRegion = Dom.getRegion(this.element);
      var canvasWidth = canvasRegion.right-canvasRegion.left-4;
      var canvasHeight = canvasRegion.bottom-canvasRegion.top-4;

      var layerWidth = this.layer.el.scrollWidth;
      var layerHeight = this.layer.el.scrollHeight;
      var hRatio = Math.floor(100*canvasWidth/layerWidth)/100;
      var vRatio = Math.floor(100*canvasHeight/layerHeight)/100;

      var center = [ click[0]/hRatio, click[1]/vRatio ];

      var region = Dom.getRegion(this.layer.el);
      var viewportWidth = region.right-region.left;
      var viewportHeight = region.bottom-region.top;

      var topleft = [ Math.max(Math.floor(center[0]-viewportWidth/2),0) ,  Math.max(Math.floor(center[1]-viewportHeight/2), 0) ];
      if( topleft[0]+viewportWidth > layerWidth ) {
         topleft[0] = layerWidth-viewportWidth;
      }
      if( topleft[1]+viewportHeight > layerHeight ) {
         topleft[1] = layerHeight-viewportHeight;
      }

      this.layer.el.scrollLeft = topleft[0];
      this.layer.el.scrollTop = topleft[1];

   },

   /**
    * Redraw after a timeout
    * @method onLayerScroll
    */
   onLayerScroll: function() {

      if(this.scrollTimer) { clearTimeout(this.scrollTimer); }
      var that = this;
      this.scrollTimer = setTimeout(function() {
         that.draw();
      },50);

   },

   /**
    * Redraw the layer map
    * @method draw
    */
   draw: function() {
      var ctxt=this.getContext();

      var canvasRegion = Dom.getRegion(this.element);
      var canvasWidth = canvasRegion.right-canvasRegion.left-4;
      var canvasHeight = canvasRegion.bottom-canvasRegion.top-4;

      ctxt.clearRect(0,0, canvasWidth, canvasHeight);

      var layerWidth = this.layer.el.scrollWidth;
      var layerHeight = this.layer.el.scrollHeight;
      var hRatio = Math.floor(100*canvasWidth/layerWidth)/100;
      var vRatio = Math.floor(100*canvasHeight/layerHeight)/100;

      var region = Dom.getRegion(this.layer.el);
      var viewportWidth = region.right-region.left;
      var viewportHeight = region.bottom-region.top;
      var viewportX = this.layer.el.scrollLeft;
      var viewportY = this.layer.el.scrollTop;
      ctxt.strokeStyle= "rgb(200, 50, 50)";
      ctxt.lineWidth=1;
      ctxt.strokeRect(viewportX*hRatio, viewportY*vRatio, viewportWidth*hRatio, viewportHeight*vRatio);

      ctxt.fillStyle = this.options.style;
      ctxt.strokeStyle= this.options.style;
      ctxt.lineWidth=this.options.lineWidth;
      this.drawContainers(ctxt, hRatio, vRatio);
      this.drawWires(ctxt, hRatio, vRatio);
   },

   /**
    * Subroutine to draw the containers
    * @method drawContainers
    */
   drawContainers: function(ctxt, hRatio, vRatio) {
      var containers = this.layer.containers;
      var n = containers.length,i,gIS = WireIt.getIntStyle,containerEl;
      for(i = 0 ; i < n ; i++) {
         containerEl = containers[i].el;
         ctxt.fillRect(gIS(containerEl, "left")*hRatio, gIS(containerEl, "top")*vRatio,
                       gIS(containerEl, "width")*hRatio, gIS(containerEl, "height")*vRatio);
      }
   },

   /**
    * Subroutine to draw the wires
    * @method drawWires
    */
   drawWires: function(ctxt, hRatio, vRatio) {
      var wires = this.layer.wires;
      var n = wires.length,i,wire;
      for(i = 0 ; i < n ; i++) {
         wire = wires[i];
         var pos1 = wire.terminal1.getXY(),
             pos2 = wire.terminal2.getXY();

         ctxt.beginPath();
         ctxt.moveTo(pos1[0]*hRatio,pos1[1]*vRatio);
         ctxt.lineTo(pos2[0]*hRatio,pos2[1]*vRatio);
         ctxt.closePath();
         ctxt.stroke();
      }

   }


});

})();
/* 	mySystem 	- Engine Model 0.1
		License 	- Copyright Concord Constortium © 2009
		Developer - Alistair MacDonald, Hyper-Metrix.com */

(function(){

	var MyObject = function( len ){
		this.id =  len + new Date().getTime().toString();
		this.position = { x: 0, y: 0 };
		return this;
	};

	MyObject.prototype.set = function( args ){
		for( var i in args ){
			this[ i ] = args[ i ];
		}
		return this;
	};

	MyObject.prototype.get = function(){
		var props = {};
		var len = arguments.length;
		for( var i = 0; i < len; i++ ){
			var prop = arguments[ i ];
			props[ prop ] = this[ prop ];
		}
	};

	MyObject.prototype.kill = function () {};

	var Node = function(){};
	Node.prototype						= new MyObject; // Call the base Prototype for all node objects.
	Node.prototype.name 			= 'un-named';
	Node.prototype.type 			= 'void'; // Type of node. Current types: 'node', 'source'.
	Node.prototype.energy 		= 0; // The amount of energy currently in this node (will always be 0 after cycle as ebergy expires from system). To get the amount of energy the system 'has' do: energyIn - heatLoss;
	Node.prototype.ratio 			= 0; // The decimal ratio of energy comsuption in comparisson to it's siblings.
	Node.prototype.energyIn		= 0; // The amount of energy that came in on the last cycle. (Value will enclude the heat-loss going out)
	Node.prototype.heatLoss		= 0; // The amount of energy lost as cycle passed through.
	Node.prototype.cycles 		= 0; // The number of cycles this node has undergone since the system cycle was last called. Used to stop infinite feedback.
	Node.prototype.inputRate 	= 1; // The energy input rate of this node. Also used to calculate ratio.
	Node.prototype.output 		= []; // The output array contains children of this node.

	Node.prototype.transform = function(){
	    var i = 0;
	    var iNode = 0;

		this.cycles ++;

		var sumEfficient = 0;
		for(i in this.efficiency ){
			sumEfficient += this.efficiency[i];
		}
		var sumLoss = 1 - sumEfficient;


		var sumInputRate = 0;
		var len = this.output.length;
		for (i = 0; i < len; i++) {
			iNode = my.node( this.output[ i ] );
			sumInputRate += iNode.inputRate;
		}
		var ratio = 1 / sumInputRate;

		var heatLoss = 0;
		for (i = 0; i < len; i++) {
			iNode = my.node( this.output[ i ] );
			var energyTransfer = ( ( this.energy * iNode.inputRate ) * iNode.inputRate * ratio ) * sumEfficient;

			iNode.ratio = 1 / sumInputRate * iNode.inputRate;
			iNode.energy += energyTransfer;
			iNode.energyIn += energyTransfer;

			heatLoss += energyTransfer;

			iNode.cycles < my.sourceCount + my.cycles ? iNode.transform() : 0 ;
		}

		this.heatLoss = heatLoss;//sumLoss * this.energy;
		if( this.type != 'source' ){
			this.energy -=  this.energy * ( sumEfficient + sumLoss );
		} else {
			this.energyIn = this.energy;
		}

	};

	var System = function(){

		this.defaults = {
			entropy	: 0.987654321, // un-used thus far
			arrows	: { width : { max: 30, min: 0.25 }
								},
			nodes		: {
								},
			AJAX		:	{ method: 'GET', async: true }
		};

		this.nodes 	= [];
		this.arrows = [];

		this.cycles = 0;
		this.cycle = function () {
			this.cycles ++;
			var sources = this.nodesWith( { type: 'source' } );

			this.sourceCount = sources.length;

			this.sumInputEnergy = 0;
			var len = sources.length;
			this.sourceCount = len;
			for( var i = 0; i < len; i++ ){
					iSource = sources[ i ];
					iSource.transform();
					this.sumInputEnergy += parseFloat( iSource.energy );
			}
			//debug('-> cycled <-');
		};

		this.newNode = function( props ){
			var len = this.nodes.length;
			var newNode = (new Node).constructor('n' + len + '_').set(props);
			this.nodes[ len ] = newNode;
			return newNode;
		};

		this.loadNodes = function( file ){
			JSON = eval( this.AJAX.get( file ).responseText );
			for( var i in JSON ){
				this.newNode( JSON[ i ] );
			}
		};

		this.list = function(){
			var len = this.nodes.length;
			for( var i = 0; i < len; i++ ){
				var n = this.nodes[ i ];
				//debug([ n.name, n.type, n.heatLoss ]);
			}
		};

		this.reset = function(){
			//debug(' RESETING...  ( cycles = ' + this.cycles + ' )' );
			var len = this.nodes.length;
			for( var i = 0; i < len; i++ ){
				var n = this.nodes[ i ];
				n.energyIn = 0;
				n.heatLoss = 0;
				n.cycles = 0;
			}
			this.cycles = 0;
			//debug(' RESET: cycles = ' + this.cycles );
		};

		this.nodesWith = function( props ){
			var collection = [];
			var len = this.nodes.length;
			for( var i = 0; i < len; i++ ){
				var iNode = this.nodes[ i ];
				for (var j in props) {
					if (iNode[j] == props[j]) {
						collection[collection.length] = iNode;
					}
				}
			}
			return collection;
		};

		this.node = function( id_or_name ){
			var len = this.nodes.length;
			for( var i = 0; i < len; i++ ){
				var iNode = this.nodes[ i ];
				if( id_or_name == iNode.name || id_or_name == iNode.id ){
					return iNode;
				}
			}
			return false;
		};

		this.AJAX = new Object();
		this.AJAX = {

			responseText: '',

			get: function(url, async_in, keyvals) {
		        var self = this;
				var async = (typeof async_in === 'undefined') ? this.defaults.AJAX.async : async_in;

				var Get = new XMLHttpRequest;
				Get.open( 'GET', url, async );
				Get.send( keyvals || 'null' );

				if (async) {
					//debug("async ", this);
					Get.onreadystatechange = function(){
						if( Get.readyState == 4 ){
							self.responseText = Get.responseText;
							return self;
						}
					};
					return this; //FIXME: this should be invalid because of async
				}
				else {
					this.responseText = Get.responseText;
					return this;
				}

			}

		};

	};

	this.my = new System();

})();

(function(){

  RestDS = function(readKey,writeKey,_post_path){
    this.data = '[]';
    this.enableLoadAndSave = true;
    this.postPath = _post_path || "/models/";
    this.getPath = this.postPath;
    this.setKeys(readKey,writeKey);
  };

  RestDS.prototype = {

    setKeys: function(read,write) {
      if (read) {
        this.load(this,function(){});// just load data
        this.readKey = read;
      }
      if (write) {
        this.writeKey = write;
      }
      else {
        this.writeKey= this.randomString();
      }
    },

    randomString: function() {
      var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
      var string_length = 8;
      var randomstring = '';
      for (var i=0; i<string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
          randomstring += chars.substring(rnum,rnum+1);
      }
      return randomstring;
    },

    save: function(_data) {
        this.writeKey = prompt("Please enter a model name or key: ", this.writeKey);
        this.data = _data;
        var post_to = this.postPath + this.writeKey;
        var xmlhttp = HTTP.newRequest();
        xmlhttp.open('PUT', post_to, false);
        xmlhttp.send(this.data);
        this.readKey = this.writeKey;
        //debug("readKey written: " + this.readKey);
    },

    promptKey: function() {

    },
    load: function(context,callback) {
      if (this.readKey) {
        var key = prompt("Please enter the model to load: ", this.readKey);
        this.writeKey = key;
        this.readKey = key;
      }
      else {
        if (this.writeKey) {
          this.readKey = this.writeKey;
        }
        else {
          this.readKey = this.writeKey = this.randomString();
        }
      }
      var get_from = this.getPath  + this.readKey;
      var self = this;
      //debug("just about to load with " + this.readKey);
  	  if (this.readKey) {
  	    self = this;
        $.ajax({
          url: get_from,
          async: true,
          type: 'GET',
          success: function(rsp) {
            var _data = rsp;
            self.data = _data;
            callback(_data, context, callback);
            //debug("returned from load");
          },
          error: function(req,err) {
            //debug("failed!");
          }
        });
      }
      else {
        //debug("load caleld, but no read key specified...");
      }
  	},


  	toString: function() {
  	  return "Data Service (" + this.postPath + "" + this.writeKey + ")";
  	}
  };
})();
(function() {
  VleDS = function(_vle){
    this.data = [];
    this.vle = _vle;
    this.vleNode=_vle.getCurrentNode();
    this.enableLoadAndSave = false;
  };

  VleDS.prototype = {
    save: function(_data) {
        this.vle.saveState(_data,this.vleNode);
        this.data = _data;
    },

    load: function(context,callback) {
      this.data = this.vle.getLatestStateForCurrentNode();
      callback(this.data,context);
    },

    toString: function() {
      return "VLE Data Service (" + this.vle + ")";
    }
  };

})();

(function() {
	  GradingToolDS = function(_data){
	    this.data = _data;
	    //this.vle = _vle;
	    //this.vleNode=_vle.getCurrentNode();
	    this.enableLoadAndSave = false;
	  };

	  GradingToolDS.prototype = {
	    save: function(_data) {
	        //this.vle.saveState(_data,this.vleNode);
	        this.data = _data;
	    },

	    load: function(context,callback) {
	      //this.data = this.vle.getLatestStateForCurrentNode();
	      callback(this.data,context);
	    },

	    toString: function() {
	      return "VLE Data Service (" + this.vle + ")";
	    }
	  };

	})();

(function() {
  if (window.google && google.gears) {
    return;
  }

  var factory = null;

  if (typeof GearsFactory != 'undefined') {
    factory = new GearsFactory();
  } else {
    try {
      factory = new ActiveXObject('Gears.Factory');
      if (factory.getBuildInfo().indexOf('ie_mobile') != -1) {
        factory.privateSetGlobalObject(this);
      }
    } catch (e) {
      if ((typeof navigator.mimeTypes != 'undefined') &&
          navigator.mimeTypes["application/x-googlegears"])
      {
        factory = document.createElement("object");
        factory.style.display = "none";
        factory.width = 0;
        factory.height = 0;
        factory.type = "application/x-googlegears";
        document.documentElement.appendChild(factory);
      }
    }
  }

  if (!factory) {
    return;
  }

  if (!window.google) {
    google = {};
  }

  if (!google.gears) {
    google.gears = {factory: factory};
  }
})();


(function(){
  GGearsDS = function(readKey,writeKey,_db,_table){
    this.data = "";
    this.enableLoadAndSave = true;
    this.db = _db || "models";
    this.table = _table || this.db;
    this.setKeys(readKey,writeKey);
  };

  GGearsDS.prototype = {
    setKeys: function(read,write) {
      if (read) {
        this.readKey = read;
        this.load(this,function(){});// just load data
      }
      if (write) {
        this.writeKey = write;
      }
      else {
        this.writeKey= new UUID().toString();
      }
    },

    open_db: function() {
      if (google) {
        this.db_connection = google.gears.factory.create("beta.database");
        this.db_connection.open(this.db);
        this.db_connection.execute('create table if not exists ' +
            this.table + ' (key string, content text, Timestamp int)');
      }
    },

    save: function(_data) {
      this.data = _data;
      this.readKey = this.writeKey;
      this.open_db();
      this.db_connection.execute('insert into ' + this.table + ' values (?, ?, ?)', [this.writeKey, this.data , new Date().getTime()]);
    },

    load: function(context,callback) {
      //debug(this + " loading");
  	  if (this.readKey) {
        this.open_db();
        var rs = this.db_connection.execute('select * from ' + this.table + ' order by Timestamp desc');
        if (rs.isValidRow()) {
          //debug(this + " found valid row data");
          this.data = rs.field(1);
          callback(this.data,context);
        }
        rs.close();
        //debug(this + " load done");
      }
      else {
        //debug("load caleld, but no read key specified...");
      }
  	},

  	load_callback: function(_data,context,callback) {
  	  context.data = _data;
  	  callback(data,context,callback);
  	},

  	toString: function() {
  	  return "Gears Data Service (" + this.table + ":" + this.writeKey + ")";
  	}
  };
})();
(function() {
  MocDS = function(one,two){
    this.data = "[]";
    //debug ("new " + this + " created");
  };

  MocDS.prototype = {
    save: function(_data) {
        //debug("Moc Saving ...");
        this.data = _data;
    },

    load: function(context,callback) {
      //debug("Moc Loading ... ");
      callback(this.data,context);

  	},
  	toString: function() {
  	  var dataString = this.data.substr(0,50);
  	  return "Moc Data Service (" + dataString + ")";
  	}
  };
})();
(function() {

  /**
  * @constructor
  */
  CookieDS = function(readKey, writeKey, _days) {
    this.data = "";
    this.days = _days || 14;
    this.enableLoadAndSave = true;
    this.setKeys(readKey, writeKey);
  };

  /**
  * set the keys
  */
  CookieDS.prototype.setKeys = function(read, write) {
    if (read) {
      this.load(this,
        function() {});
        this.readKey = read;
      }
      if (write) {
        this.writeKey = write;
      }
      else {
        this.writeKey = new UUID().toString();
      }
    };

    /**
    * write the data
    */
    CookieDS.prototype.save = function(_data) {
      this.data = _data;
      this.readKey = this.writeKey;
      eraseCookie(this.writeKey);
      createCookie(this.writeKey,_data,this.days);
    };

    /**
    * load the data
    */
    CookieDS.prototype.load = function(context, callback) {
      var self = this;
      if (this.readKey) {
        var cookie_data = readCookie(this.readKey);
        if (cookie_data) {
          this.data = cookie_data;
        }
        else {
          //debug("cookie contained nothing");
        }
        callback(this.data,context);
      }
      else {
        //debug("load caleld, but no read key specified...");
      }
    };

    /**
    *  to string
    */
    CookieDS.prototype.toString = function() {
      return "Cookie Data Service (" + this.writeKey + ")";
    };


})();
(function () {
    if (typeof mysystem === 'undefined' || !console) {
        this.mysystem = {};
    }
    else {
        var msg = 'Error: mysystem needs to be a unique globally\n';
        msg += 'to function as a namespace';
        alert(msg);
        return;
    }

    if (!mysystem.config) {
        this.mysystem.config = {};
    }

    if (typeof console === 'undefined' || !console) {
        this.console = {};
    }
    if (!console.log) {
        console.log = function() {};
    }
    if (typeof debug === 'undefined' || !debug) {
        this.debug = console.log;
    }

    this.mysystem.loadMySystem = function () {
        if (!mysystem.config.dataService) {
            alert('Error: data service is undefined');
            return null;
        }
        if (!mysystem.config.jsonURL) {
            alert('Error: jsonURL is undefined');
            return null;
        }

        var mySystem = new mysystem.MySystem(mysystem.config.jsonURL);
        mySystem.setDataService(mysystem.config.dataService);

        if (mySystem.editor) {
            if (mysystem.config.enableLoadAndSave) {
                mySystem.editor.enableLoadAndSave();
            }
        }

        mySystem.load();
        return mySystem;
    };

})();

mysystem.MySystem = function (jsonUrl) {
    this.loaded = false;
    this.datasService = null;
    this.editor = null;
    this.data = new MySystemData();
    if (jsonUrl) {
        this.initURL(jsonUrl);
    }
    this.interceptKeys();
};

mysystem.MySystem.prototype = {

    initURL: function (jsonURL) {
        /*
        var loaded = this.loadModulesFromJSON($.ajax({ type: "GET",
            url: jsonURL, async: false }).responseText);
            */
        var loaded = this.loadModulesFromJSON(jsonURL);

        this.data.setData(loaded.modules, [], true);
        this.editor = new mysystem.MySystemEditor(this.data);

        if (loaded.labels) {
            this.editor.propEditor.setFieldLabelMap(loaded.labels);
        }
        if (loaded.arrows) {
            this.editor.propEditor.setArrows(loaded.arrows);
        }
        this.editor.goalPanel.setContent(loaded.goalText);
    },

    setDataService: function (ds) {
        this.dataService = ds;
        if (this.editor) {
            this.editor.setDataService(ds);
        }
    },

    interceptKeys: function () {
        $(document).keydown(function (e) {
            var code = e.which;
            var element = $(e.target);
            var backspaceKey = 8;
            var delKey = 127;

            if (code == backspaceKey || code == delKey) {
                if ((! element.is('input')) && (! element.is('textarea'))) {
                    e.preventDefault();
                }
            }
        });
    },

    loadModulesFromJSON: function (jsonString) {
        //debug("Calling loadModulesFromJSON:" + jsonString);
        var retObj = { modules: [], labels: null, arrows: null, goalText: '' };

        try {
            var data = JSON.parse(jsonString);
            
            if (typeof data.modules !== 'undefined') {
                data = data.modules;
            }

            var item = null;

            for (var item_index in data) {
                item = data[item_index];
                if (item.xtype == 'MySystemContainer' ||
                    item.xtype == 'MySystemNote')
                {
                    retObj.modules.push(item);
                }
                else if (item.xtype == 'PropEditorFieldLabels') {
                    retObj.labels = item.labels;
                }
                else if (item.xtype == 'PropEditorArrows') {
                    retObj.arrows = item.arrows;
                }
                else if (item.xtype == 'AssignmentInformation') {
                    retObj.goalText = item.fields.goal;
                }
            }
            this.loaded = true;
        }
        catch(exception) {
            alert('Unable to load/read file: ' + filename);
            alert(exception);
        }
        finally {
            return retObj;
        }
    },

    /**
    * Tell the editor to load data from the dataService.
    * @method load
    */
    load: function() {
        this.editor.onLoad();
    },

    /**
    * Tell the editor to save data to the dataService.
    * @method save
    */
    save: function() {
        this.editor.onSave();
    }

};
/**
 * MySystem Container. Has an image. and double_click beahvor.
 * @class ImageContainer
 * @extends WireIt.Container
 * @constructor
 * @param {Object} options
 * @param {WireIt.Layer} layer
 */
MySystemContainer = function(options, layer) {
   MySystemContainer.superclass.constructor.call(this, options, layer);
   this.title = options.name || "MySystem Container";
   this.options.fields = options.fields || {'name': this.title, 'energy': 10};
   this.icon = options.icon;
   this.has_sub = options.has_sub || false;
   this.subSystem =  null;
   if (options.subsystem_options) {
     this.subSystem = new WireIt.Layer(options.subsystem_options);
     this.subSystem.setWiring(options.subsystem_wiring);
     MySystemContainer.openContextFor.fire(this);
   }
   this.options.xtype = "MySystemContainer";
   this.propEditor = null;


   if (this.options.position) {
     $(this.el).css({
       position: 'absolute',
       left: this.options.position[0],
       top: this.options.position[1]
     });

    }
   YAHOO.util.Event.addListener(this.el, "dblclick", this.onDblClick, this, true);
   this.setTitle(this.options.fields.name);
   this.element = this.el;
};


YAHOO.lang.extend(MySystemContainer, WireIt.ImageContainer, {
  onMouseUp: function(source) {

  },
  onClick: function(source) {

  },
  onDblClick: function(source) {
    MySystemContainer.openPropEditorFor.fire(this);
  },

  setTitle: function(newTitle) {
    if(newTitle) {
      var this_el = this.el;
      var title_el = $(this_el).children('.title').first();
      var wordWrapChars = 30;
      this.title = newTitle.wordWrap(wordWrapChars, "\n");
      this.options.name = this.title;
      this.options.fields.name = this.title;
      if ((!title_el) || title_el.size() < 1) {
        title_el = this.createTitle();
        $(this_el).prepend(title_el);
      }
      title_el.html(this.title);
      var leftOffset = 0;
      if (title_el.width() > title_el.parent().width()) {
        leftOffset = (title_el.width() - title_el.parent().width())/2;
      }
      title_el.css({
        'left': -1 * leftOffset,
        'bottom': -1 * title_el.parent().height()
      });
    }
  },
  createTitle: function() {
    return $('<div></div>').addClass('title');
  },
  render: function() {
    MySystemContainer.superclass.render.call(this);
    var this_el = this.el;
    var title_el = $(this_el).children('.title').first();
    if(!title_el) {
      title_el = this.createTitle();
      $(this_el).prepend(title_el);
      title_el.html(this.title);
    }

  },
  updateFields: function(options) {
    if (options) {
      for (var name in options) {
        if (this.options.fields[name]) {
          this.options.fields[name] = options.name;
        }
      }
      if (this.options.fields.color) {
        this.options.fields.color = options.selected_color;
      }
      this.setTitle(options.name);
    }
    else {
      this.setTitle(this.options.fields.name || this.options.name );
    }
  },

  getConfig: function() {
    var super_options = MySystemContainer.superclass.getConfig.call();
    this.options.name = this.title;
    this.options.has_sub = this.has_sub;
    if (this.subSystem !== null) {
      this.options.subsystem_options = this.subSystem.options;
      this.options.subsystem_wiring = this.subSystem.getWiring();
    }
    this.options.position[0] = $(this.el).css('left');
    this.options.position[1] = $(this.el).css('top');

    var options = {};
    var key = null;
    for (key in super_options) {
        options[key] = super_options.get(key);
    }
    for (key in this.options) {
        options[key] = this.options[key];
    }
    return options;
  }
});

MySystemContainer.openPropEditorFor  = new YAHOO.util.CustomEvent("OpenEditorFor");
MySystemContainer.openContextFor = new YAHOO.util.CustomEvent("openContextFor");








(function () {
  MySystemData = function() {
    this.initialize();
  };

  MySystemData.prototype.initialize = function() {
    this.modules = [];
    this.instances = [];
  };

  MySystemData.prototype.addModule = function (module,addTerminals) {
    if (addTerminals) {
      if (!module.terminals) {
        module.terminals = MySystemData.defaultTerminals();
      }
    }
    this.modules.push(module);
  };

  MySystemData.prototype.setModules = function (_modules,addTerminals) {
    this.modules = [];
    var module;
    for (module in _modules) {
      this.addModule(_modules[module],addTerminals);
    }
  };

  MySystemData.prototype.setInstances = function (_instances) {
    this.instances = [];
    var instance;
    for (instance in _instances) {
      this.addInstance(_instances[instance]);
    }
  };

  MySystemData.prototype.addInstance = function (instance) {
    this.instances.push(instance);
  };

  MySystemData.prototype.setData = function (modules,instances,addTerminals) {
    this.setModules(modules,addTerminals);
    this.setInstances(instances);
  };

  MySystemData.defaultTerminals = function() {
    return [{
         "wireConfig": {
           "drawingMethod": "bezierArrows"
         },
         "name": "Terminal1",
         "direction": [0, -1],
         "offsetPosition": {
         "left": 20,
         "top": -25
         },
         "ddConfig" : {
             "type": "input",
             "allowedTypes": ["input", "output"]
         }
     },{
         "wireConfig": {
             "drawingMethod": "bezierArrows"
         },
         "name": "Terminal2",
         "direction": [0, 1],
         "offsetPosition": {
             "left": 20,
             "bottom": -50
         },
         "ddConfig": {
             "type": "output",
             "allowedTypes": ["input", "output"]
         }
     }];
  };

})();



(function () {
    /**
     * Proxy to handle the drag/dropping from the module list to the layer
     * @class MySystemDragAndDropProxy
     * @constructor
     * @param {HTMLElement} el
     * @param {MySystemEditor} WiringEditor
     */
    var MySystemDragAndDropProxy = function(el, MySysEditor) {
        this._MySysEditor = MySysEditor;
        MySystemDragAndDropProxy.superclass.constructor.call(this, el, "module", {
            dragElId: "moduleProxy"
        });
        this.isTarget = false;
    };

    mysystem.MySystemDragAndDropProxy = MySystemDragAndDropProxy;

    YAHOO.extend(MySystemDragAndDropProxy, YAHOO.util.DDProxy, {

        /**
        * copy the html and apply selected classes
        * @method startDrag
        */
        startDrag: function(e) {
            MySystemDragAndDropProxy.superclass.startDrag.call(this, e);
            var del = this.getDragEl();
            var lel = this.getEl();
            del.innerHTML = lel.innerHTML;
            del.className = lel.className;
        },

        /**
        * Override default behavior of DDProxy
        * @method endDrag
        */
        endDrag: function(e) {},

        /**
        * Add the module to the WiringEditor on drop on layer
        * @method onDragDrop
        */
        onDragDrop: function(e, ddTargets) {

            var layerTarget = ddTargets[0];
            var layer = ddTargets[0]._layer;
            var del = this.getDragEl();
            var pos = YAHOO.util.Dom.getXY(del);
            var layerPos = YAHOO.util.Dom.getXY(layer.el);
            var i = 0;

            pos[0] = pos[0] - layerPos[0];
            pos[1] = pos[1] - layerPos[1];


            /*var Copy = new Object;
            for( var i in this._module ){
              Copy[ i ] = this._module[ i ];
            }
            Copy.engineNode = newEngineNode;
            */

            var Copy = function (par) {
              for (i in par._module) {
                this[ i ] = par._module[ i ];
              }
              this.fields = {};
              for(i in par._module.fields) {
                this.fields[i] = par._module.fields[ i ];
              }
              //debug(this);
              var energyForm = {};
              energyForm[ par._module.fields.form ] = par._module.fields.efficiency;

              this.engineNode = my.newNode({
                  name        : par._module.name,
                  module      : par._module,
                  type        : par._module.etype,
                  output      : [],
                  energy      : par._module.fields.energy || 0,
                  inputRate   : par._module.fields.inputRate,
                  efficiency  : energyForm // reference energies object
              });
            };

            this._MySysEditor.addModule(new Copy(this), pos );
        }
    });

})();
(function() {

    var Event = YAHOO.util.Event;
    var Dom = YAHOO.util.Dom;
    var widget = YAHOO.widget;

    /**
     * The MySystemEditor class provides a full page interface
     * @class WiringEditor
     * @constructor
     * @param {Object} options
     */
    var MySystemEditor = function (data) {
        this.setOptions(data); // set the default options

        this.numLayers = 1;
        this.propEditor = new MySystemPropEditor({});

        this._dirty = false;

        if (mysystem.config.autoSave) {
            //debug('Starting auto save');
            this.startAutoSaving();
        }

        /**
       * @property layout
       * @type {YAHOO.widget.Layout}
       */
        this.layout = new widget.Layout(null, this.options.layoutOptions);
        this.layout.render();

        this.buildModulesList();

        this.renderButtons();

        this.goalPanel = new mysystem.MySystemGoalPanel();
        this.goalPanel.render();

        this.subscribeToChanges();
    };

    mysystem.MySystemEditor = MySystemEditor;

    MySystemEditor.prototype = {

        setDataService: function (dataService) {
            this.dataService = dataService;
        },

        /**
        * @method setOptions
        * @param {Object} options
        */
        setOptions: function(options) {
            this.options = {}; //unload any older options
            this.modules = options.modules || ([]); //load modules from options

            /* modulesByName doesn't seem to be used at all.
             * Besides, m.name is only defined for notes, not containers
            this.modulesByName = {};
            for (var i = 0; i < this.modules.length; i++) {
                var m = this.modules[i];
                this.modulesByName[m.name] = m;
            }
            */

            this.options.languageName = options.languageName || 'anonymousLanguage';
            this.options.smdUrl = options.smdUrl || 'WiringEditor.smd'; //FIXME: eh?

            this.options.dataDir = "/models";
            this.options.propertiesFields = options.propertiesFields;
            this.options.layoutOptions = options.layoutOptions || {
                units: [
                {
                    position: 'top',
                    height: 50,
                    body: 'top'
                },
                {
                    position: 'left',
                    width: 120,
                    resize: true,
                    body: 'left',
                    gutter: '5px',
                    collapse: true,
                    collapseSize: 25,
                    header: 'Objects:',
                    scroll: true,
                    animate: true
                },
                {
                  position: 'right'
                },
                {
                    position: 'center',
                    body: 'center',
                    gutter: '5px'
                }
                ]
            };

            this.options.layerOptions = {};
            var layerOptions = options.layerOptions || {};
            this.options.layerOptions.parentEl = layerOptions.parentEl ? layerOptions.parentEl: Dom.get('center');
            this.options.layerOptions.layerMap = false;

            MySystemContainer.openPropEditorFor.subscribe(this.onOpenPropEditorFor,this,true);
            MySystemContainer.openContextFor.subscribe(this.onOpenContextFor,this,true);
            WireIt.Wire.openPropEditorFor.subscribe(this.onOpenPropEditorFor,this,true);
            this.resetLayers();
        },

        resetLayers: function() {
          if (this.layerStack && this.layerStack.size > 0) {
            for(var i = 0; i < this.layerStack.size();i++) {
              this.removeLayer(this.layerStack[i]);
            }
          }
          if (this.layer) {
            this.removeLayer(this.layer);
          }

          if (this.rootLayer) {
            this.removeLayer(this.rootLayer);
          }
          this.numLayers = 0;
          this.layerStack = [];
          this.rootLayer = this.addLayer();
          this.changeLayer(this.rootLayer);
        },

        onOpenPropEditorFor: function (type,args) {
          module = args[0];
          this.propEditor.show(module);
        },

        onOpenContextFor: function (type,args) {
            module = args[0];
            if (module.has_sub) {
              if (module.subSystem === null) {
                module.subSystem = this.addLayer();
              }
            }
        },

        addLayer: function () {
            this.numLayers = this.numLayers + 1;
            var newOpts = {};
            for (var key in this.options.layerOptions) {
              newOpts[key] = this.options.layerOptions[key];
            }
            newOpts.layerNumber = this.numLayers;
            var newLayer = new WireIt.Layer(newOpts);
            return newLayer;
        },

        removeLayer: function (newLayer) {
          this.numLayers = this.numLayers - 1;
          newLayer.removeAllContainers();
          newLayer=null;
          return null;
        },

        changeLayer: function (newLayer) {
             var index = this.layerStack.indexOf(newLayer);
             if (index < 0) {
               //debug('FIXME what do we really want to do here?');
             }
             else {
               this.layerStack = this.layerStack.compact();
             }
             this.setLayer(newLayer);
        },

        setLayer: function (newLayer) {
          this.cleanWiring(newLayer);
          if (!this.layer) { this.layer = this.rootLayer;}
          var parentDom = this.layer.options.parentEl;
          parentDom.replaceChild(newLayer.el,this.layer.el);
          $(this.layer.el).hide();

          this.layer = newLayer;
          $(this.layer.el).show();
          this.setDDLayer(this.layer);
          this.hidePropEditor();
        },

        cleanWiring: function (newLayer) {
          var i = 0;
          var size = newLayer.wires.length;
          var wire = null;
          var removed = 0;
          for (i=0; i <size; i++) {
            wire = newLayer.wires[i];
            if((!(wire.terminal1)) ||!(wire.terminal2)) {
              newLayer.wires[i] = null;
              removed +=1;
            }
          }
          if (removed > 0) {
            //debug("removed " + removed + " wires");
            //debug("array size pre: " + size);
            newLayer.wires = newLayer.wires.compact();
            //debug("array size post: " + newLayer.wires.length);
          }
        },


        hidePropEditor: function () {
          $('#property_editor').hide();
        },

        setDDLayer: function (theLayer) {
            this.ddTarget = new YAHOO.util.DDTarget(this.layer.el, "module");
            this.ddTarget._layer = this.layer;
        },

        addModuleChoice: function (module) {

            var left = Dom.get('left');
            var div = WireIt.cn('div', {
                className: "WiringEditor-module"
            });

            if (module.image) {
                div = WireIt.cn('div', {
                    className: "WiringEditor-icon-module"
                });
                div.appendChild(WireIt.cn('img', {
                    src: module.image
                }));
            } else {
                div = WireIt.cn('div', {
                    className: "WiringEditor-module"
                });
                div.appendChild(WireIt.cn('span', null, null, module.name));
            }

            if (module.fields && module.fields.name) {
              div.appendChild(WireIt.cn('span', null, null, module.fields.name));
            }
            else if (module.name) {
              div.appendChild(WireIt.cn('span', null, null, module.name));
            }
            var ddProxy = new mysystem.MySystemDragAndDropProxy(div, this);
            ddProxy._module = module;
            left.appendChild(div);

            this.setDDLayer(this.layer);
        },


        /**
        * Build the left menu on the left
        * @method buildModulesList
        */
        buildModulesList: function() {
            var modules = this.modules;
            for (var i = 0; i < modules.length; i++) {
                var module = modules[i];
                this.addModuleChoice(module);
            }
        },


        /**
        * add a module at the given pos
        * usually invoked by drag-and-drop callback
        */
        addModule: function(module, pos){
              module.position = pos;
              module.title = module.name;
              module.layer = this.layer;
              var container = this.layer.addContainer(module);
              container.setTitle(module.title);
              container.options.position = pos;
              container.module = module;
              Dom.addClass(container.el, "WiringEditor-module-" + module.name);
        },


        /**
        * Toolbar
        * @method renderButtons
        */
        renderButtons: function() {
            var toolbar = Dom.get('toolbar');
            var newButton = new widget.Button({
                label: "Clear Diagram",
                id: "WiringEditor-newButton",
                container: toolbar
            });
            newButton.on("click", this.onNew, this, true);


        },
        /**
        * Enable the save and load buttons
        * @method enableLoadAndSave
        */
        enableLoadAndSave: function() {
          var self = this;
          var toolbar = Dom.get('toolbar');
          var loadButton = new widget.Button({
              label: "Load",
              id: "WiringEditor-loadButton",
              container: toolbar
          });
          loadButton.on("click", function() { self.onLoad(); }, this, true);

          var saveButton = new widget.Button({
              label: "Save",
              id: "WiringEditor-saveButton",
              container: toolbar
          });
          saveButton.on("click", this.onSave, this, true);
        },

        /**
        * Enable the print button
        * @method enablePrint
        */
        enablePrint: function() {
          var toolbar = Dom.get('toolbar');
          var printButton = new widget.Button(
            {
              label: "Print",
              id: "MySystem Print button",
              container: toolbar
            });
            printButton.on("click", this.onPrint, this, true);
        },

        /**
        * Enable the button to "Show Jason Data"
        * @method enableShowJason
        */
        enableShowJason: function() {
          var toolbar = Dom.get('toolbar');
          var jsonDataButton = new widget.Button({
              label: "show json data",
              id: "MySystem Json data button",
              container: toolbar
          });
          jsonDataButton.on("click", this.onShowJson, this, true);
        },

        /**
        * @method onSave
        */
        onSave: function () {
            if (this.dataService) {
                this.dataService.save(JSON.stringify([this.rootLayer.getWiring()]));
                //debug("save has returned...");
            }
            else {
                alert("onSave: No Data Service defined");
            }
        },

        /**
         * @method onLoad
         */

        onLoad: function () {
            if (this.dataService) {
                this.dataService.load(this, this.loadCallback);
            }
            else {
                alert("onLoad: No Data Service defined");
            }
         },

        loadCallback: function(rsp, context) {
          //debug("json-loading:\n===================================\n" + rsp);

          try {
            var obj = null;
            
            if (typeof rsp === 'object') {
                obj = rsp;
            }
            else if (rsp === '') {
                obj = [];
            }
            else {
                obj = JSON.parse(rsp);
            }

            if (obj && obj.length > 0) {
              context.resetLayers();
              context.rootLayer.setWiring(obj[0]);
            }
          }
          catch (e) {
            if (e instanceof SyntaxError) {
              alert('JSON parse error');
            }
            else {
              alert('Unknown error in MySystemEditor#loadCallback');
            }
          }
        },

        /**
        * @method onPrint
        */
        onPrint: function() {
          this.onSave();
          window.open('print.html');
        },

        /**
         * @method onPrint
         */

        /**
         * @method onNew
         */
        onNew: function() {
            if (confirm("Are you sure you want to erase your diagram and start fresh?")) {
                this.layer.removeAllContainers();
                this.resetLayers();
            }
            this.setDirty(true);
        },

        /**
        * @method onDelete
        */
        onDelete: function() {
            if (confirm("Are you sure you want to delete this wiring??")) {
                var value = this.getValue();
                this.service.deleteWiring({
                    name: value.name,
                    language: this.options.languageName
                },
                {
                    success: function(result) {
                        alert("Deleted !");
                    }
                });
            }
        },

        /**
        * This method return a wiring within the given vocabulary described by the modules list
        * @method getValue
        */
        getValue: function() {
            var i;
            var obj = {
                modules: [],
                wires: [],
                properties: null
            };

            for (i = 0; i < this.layer.containers.length; i++) {
                obj.modules.push({
                    name: this.layer.containers[i].options.title,
                    value: this.layer.containers[i].getValue(),
                    config: this.layer.containers[i].getConfig()
                });
            }

            for (i = 0; i < this.layer.wires.length; i++) {
                var wire = this.layer.wires[i];
                var wireObj = {
                    src: {
                        moduleId: WireIt.indexOf(wire.terminal1.container, this.layer.containers),
                        terminal: wire.terminal1.options.name
                    },
                    tgt: {
                        moduleId: WireIt.indexOf(wire.terminal2.container, this.layer.containers),
                        terminal: wire.terminal2.options.name
                    }
                };
                obj.wires.push(wireObj);
            }

            obj.properties = this.propertiesForm.getValue();

            return {
                name: obj.properties.name,
                working: obj
            };
        },

        subscribeToChanges: function () {
            var i = 0;
            var setDirty = function (type, args, self) {
                self.setDirty(true);
            };
            var events = ['eventAddWire',
                          'eventRemoveWire',
                          'eventAddContainer',
                          'eventRemoveContainer',
                          'eventContainerDragged',
                          'eventContainerResized'
                         ];
            for (i = 0; i < events.length; ++i) {
                this.layer[events[i]].subscribe(setDirty, this);
            }
            this.propEditor.eventSaveValues.subscribe(setDirty, this);
        },

        startAutoSaving: function () {
            var self = this;
            this.autoSaveId = setInterval(function () {
                self.autoSave();
            }, 60 * 1000);
        },

        stopAutoSaving: function () {
            clearInterval(this.autoSaveId);
        },

        autoSave: function () {
            if (this.isDirty()) {
                this.onSave();
                this.setDirty(false);
            }
        },

        setDirty: function (dirty) {
            this._dirty = dirty;
        },

        isDirty: function () {
            return this._dirty;
        }
    };

})();
(function() {

    var GoalPanel = function () {
        var self = this;
        this.elem = $('#goal_panel');
        this.icon = $('#goal_panel_icon');
        this.contentElem = $('#goal_panel_text');

        this.panel = new YAHOO.widget.Panel(this.elem.attr('id'), {
            xy: [410, -10],
            width: '300px',
            close: false
        });
        this.panel.buildWrapper();

        this.icon.click(function(event) {
            if (self.collapsed) {
                self.expand();
            }
            else {
                self.collapse();
            }
            event.preventDefault();
        });

        this.expand();
    };

    mysystem.MySystemGoalPanel = GoalPanel;

    GoalPanel.prototype = {

        setContent: function (html) {
            this.contentElem.html(html);
        },

        render: function () {
            this.panel.render();
        },

        collapse: function () {
            this.elem.css({ height: '32px' });
            this.icon.attr({'src': '/vlewrapper/vle/node/mysystem/images/down-arrow.png'});
            this.collapsed = true;
        },

        expand: function () {
            this.elem.css({ height: 'auto' });
            this.icon.attr({'src': '/vlewrapper/vle/node/mysystem/images/up-arrow.png'});
            this.collapsed = false;
        }

    };

})();
/**
 * MySystem Container. Has an image. and double_click bahavior.
 * @class ImageContainer
 * @extends WireIt.Container
 * @constructor
 * @param {Object} options
 * @param {WireIt.Layer} layer
 */
MySystemNote = function(options, layer) {
   MySystemNote.superclass.constructor.call(this, options, layer);
   this.title = options.name || "Note";
   this.options.fields = options.fields || {'name': this.title, 'content': "blank"};
   this.icon = options.icon;
   this.options.xtype = "MySystemNote";

   if (this.options.position) {
     $(this.el).css({
       position: 'absolute',
       left: this.options.position[0],
       top: this.options.position[1]
     });

    }
   YAHOO.util.Event.addListener(this.el, "dblclick", this.onDblClick, this, true);
   this.setContent(this.options.fields.content);
   this.element = this.el;
};


YAHOO.lang.extend(MySystemNote, WireIt.Container, {
  onMouseUp: function(source) {

  },
  onClick: function(source) {

  },
  onDblClick: function(source) {
    MySystemContainer.openPropEditorFor.fire(this);
  },
  setTitle: function() {
  },
  setContent: function(newContent) {
    if(newContent) {
      var wordWrapChars = 30;
      this.options.fields.content = newContent.wordWrap(wordWrapChars, "\n");
      this.getContentEl().html(this.options.fields.content);
    }
  },
  createContent: function() {
    return $('<div></div>').addClass('content');
  },

  getContentEl: function() {
    var content_el = $(this.el).find('.content');
    if (!(content_el && content_el.size() > 0)) {
      content_el = this.createContent();
      $(this.el).append(content_el);
    }
    this.options.terminals = [];
    this.terminals = [];
    return content_el;
  },
  render: function() {
    MySystemNote.superclass.render.call(this);
    if (this.options.fields) {
      this.getContentEl().html(this.options.fields.content);
    }
  },

  updateFields: function(options) {
    if (this.options.fields){
      if (options) {
        this.setContent(options.content);
      }
      else {
        this.setContent(this.options.fields.content);
      }
    }
  },

  getConfig: function() {
    this.options.name = this.title;
    this.options.position[0] = $(this.el).css('left');
    this.options.position[1] = $(this.el).css('top');
    return this.options;
  }
});
/**
 * MySystemPropEditor
 * @class MySystemPropEditor
 * @constructor
 * @param {Object} options
 */
MySystemPropEditor = function(options) {
   this.domID = options.domID || "#property_editor";
   this.dom_entity = $(this.domID);
   this.dom_entity.draggable( { handle: '#prop_bar' } );
   this.formName = options.formName || "#prop_form";
   this.form_entity = $(this.formName);

   this.selected_color = "#000000";
   this.formTable = $('#form_table');

   var hexColors = {
     '#490A3D' : '',
     '#BD1550' : '',
     '#E97F02' : '',
     '#F8CA00' : '',
     '#8A9B0F' : ''
    };
   this.setArrows(hexColors);

   var self =  this;
   this.dom_entity.keydown(function(e) {
     var code = e.which;
     var escapeKey = 27;
     var returnKey = 13;

     if (code == returnKey) {
       if (!(e.target == $('#textarea'))) {
    	   e.preventDefault();
       }
     }
     if (code == escapeKey) {
       self.disable();
     }
   });

   this.setFieldLabelMap({
     'name': 'label'
   });

   this.eventSaveValues = new YAHOO.util.CustomEvent('saveValues', this);
};


MySystemPropEditor.prototype = {
  setFieldLabelMap: function(_map) {
    this.fieldLabelMap = _map;
  },


  updateFields: function() {
    this.clearFields();
    var self =  this;
    var key;
    var value;
    for(key in this.node.options.fields) {
      value = this.node.options.fields[key];
      if(key !='color') {
        this.showField(key,value);
      }
    }

    this.setEditorName(this.node);

    $('#property_editor_closer').mouseover( function(e) {
      $('#property_editor_closer').fadeTo('fast',0.99);
    });
    $('#property_editor_closer').mouseout(function(e) {
      $('#property_editor_closer').fadeTo('fast',0.5);
    });
    $('#property_editor_closer').click(function(e) {
      self.disable();
    });
  },

  setEditorName: function(node) {
    var xtype = node.xtype || node.options.xtype || 'default';
    var domName = '#prop_name';
    var nodeTypeMap = {
      'default'           : 'Poperties',
      'MySystemNote'      : 'Note Info',
      'MySystemContainer' : 'Information',
      'WireIt-Wire'       : 'Energy Flow Information'
    };
    var domThing = $(domName);
    if (domThing) {
      domThing.text(nodeTypeMap[xtype]);
    }
  },



  showField: function(field_name,value) {

    if(this.fieldLabelMap[field_name]) {

      var domLabel = $('<label></label>');
      domLabel.attr({'for': field_name});
      domLabel.html(this.fieldLabelMap[field_name].label);

      var type = this.fieldLabelMap[field_name].type || 'text';
      var style = this.fieldLabelMap[field_name].style;
      var input;
      if (type =='textarea') {
        input = $('<textarea></textarea>');
        input.attr({ 'name': field_name, 'id': field_name});
        input.html(value);
      }
      else {
        input = $('<input></input>');
        input.attr({ 'type': type, 'name': field_name, 'id': field_name, 'value': value});
      }
      if (style) {
        input.attr({'class': style});
      }
      var label_td = $('<td></td>');
      label_td.addClass('input_label');
      label_td.css({'align': 'right','text-align': 'right'});
      label_td.append(domLabel);

      var input_td = $('<td></td>');
      input_td.addClass('input_field');
      input_td.append(input);

      var table_row = $('<tr></tr>');
      table_row.addClass('input_row');
      table_row.append(label_td);
      table_row.append(input_td);

      var self = this;
      input.focusout(function() {
        if (self.node) {
          var options = {};
          options[field_name] = (input.val() || '(type-here)');
          self.node.updateFields(options);
        }
      });
      this.formTable.append(table_row);
    }
  },


  setArrows: function(arrows) {
    var pallet = $('#palette');
    pallet.html('<h4>Flow Type</h4>');
    var arrow = null;
    var counter=0;
    for (arrow in arrows) {
      counter++;
      var id = "color_"+counter;

      var color_div = $('<div></div>');
      color_div.attr({'class': 'pallet_element', 'id': id});
      color_div.css({backgroundColor: arrow});

      if(arrows[arrow]) {
        color_div.css({'width' : 'auto', 'color' : 'white'});
        color_div.append(arrows[arrow]);
      }
      pallet.append(color_div);
    }
  },


  clearFields: function() {
    if (this.formTable) {
      this.formTable.remove();
    }
    this.formTable = $('<table></table>').attr({'id': 'form_table'});
    this.form_entity.html(this.formTable);
  },


  saveValues: function() {
    if (this.node) {
      var options = {};
      for (var name in this.fieldLabelMap) {
        options[name] = $('#' + name).val() || "(type-here)";
      }
      options['selected_color'] = this.selected_color;
      this.node.updateFields(options);
    }
    this.eventSaveValues.fire(this);
  },


  deselect: function() {
    $('.selected').removeClass('selected');
  },

  disable: function() {
    this.saveValues();
    this.dom_entity.hide();
    this.deselect();
    this.setNode(null);
    this.deselect();
    if (this.form_observer) {
      this.form_observer.stop();
      this.form_observer = null;
      $('#palette').die('click');
    }
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  },

  enableClickAway: function() {
    var self=this;
    var clickHandler = function(e) {
      var close = true;
      var clicked = $(e.target);
      if (self.node) {
        if (clicked == self.node_element) {
          close = false;
        }
      }
      if (self.dom_entity.children(clicked).size() > 1) {
          close = false;
      }
      if (close) {
       self.disable();
      }
    };
    $(document).click(clickHandler);
  },


  show: function (nnode) {

    this.setNode(nnode);
    this.updateFields();

    this.selected_color = this.node.options.fields.color || "color2";
    var selected_palette_item = $('#'+this.selected_color);
    if (selected_palette_item && selected_palette_item.length > 0) {
      this.deselect();
      $(selected_palette_item).addClass('selected');
    }

    this.positionEditor();
    this.showPalette();
    this.positionIcon();
    this.enableClickAway();
    $("textarea:visible:enabled:first").focus();
    $("input:visible:enabled:first").focus();
    var self = this;
    this.autoSaveTimer = setInterval(function() {self.saveValues();}, 300);
  },


  setNode: function(n) {
    if (n && n.options){
      if (this.node) {
        if ($(this.node_element)) {
          $(this.node_element).removeClass('selected');
        }
        if (this.node.options.selected) {
          this.node.options.selected=false;
          this.node.redraw();
        }
      }
      this.node = n;
      this.node_element = $(n.element);
    }
    else {
      this.node = null;
      this.node_element = null;
    }
  },

  showPalette: function() {
    if (this.node.options.fields.color) {
        $('#palette').show();
        var self = this;
        $('#palette').click(function (event) {
          self.deselect();
          var element = $(event.target);
          element.addClass('selected');
          self.selected_color = element.css('background-color');
          self.saveValues();
        });
        this.node.options.selected=true;
      }
      else {
        $('#palette').hide();
        $(this.node.bodyEl).addClass('selected');
      }
  },

  positionEditor: function() {
    this.dom_entity.show();
    var margin = 4;
    var top = this.node_element.offset().top + this.node_element.height() - this.dom_entity.height();
    var left = this.node_element.offset().left - (this.dom_entity.width() + margin);
    left = left < 1 ? 1 : left;
    top = top < 1 ? 1 : top;
    this.dom_entity.offset({
      left: left,
      top: top
    });
  },

  nodeIsIcon: function(n) {
    return (n.options && n.options.icon);
  },

  positionIcon: function() {
    if (this.nodeIsIcon(this.node)) {
      if($('#icon_spot')) {
        $('#icon_spot').html('<img src="' + this.node.options.icon + '" alt="icon" class="icon"/></br>');
      }
    }
    else {
      if($('#icon_spot')) {
        $('#icon_spot').html('');
      }
    }
  }

};
(function() {


  /*
   * INPUT:
   * obj: object to clone
   * shallow: if true, clone will return a shallow copy
   *
   * OUTPUT:
   * returns a cloned object
   */

  /*
  clone = function(obj, shallow) {
      console.log('clone obj=' + obj + ' type=' + typeof obj);
      if(obj == null || typeof(obj) != 'object') {
          return obj;
      }
      var temp = new obj.constructor();
      for(var key in obj) {
          if (shallow) {
            temp[key] = obj[key];
          }
          else {
            temp[key] = clone(obj[key]);
          }
      }
      return temp;
  };
  */

  /*
   * A destructive operation that merges fromObj into toObj with a shallow copy
   * Attributes of toObj gets overwritten with those of fromObj.
   * Attributes of toObj that doesn't exist in fromObj remains intact.
   */

  /*
  update = function(toObj, fromObj) {
    for (var key in fromObj) {
      if (typeof fromObj[key] != 'function') {
        toObj[key] = clone(fromObj[key], true);
      }
    }
  };
  */

  /**
  *
  */
  /*
  debug = function(message) {
    window.console && console.log && console.log(message);
  };
  */


  periodicallyCall = function(_fun,context,intervalms) {
      setTimeout(function() {
        _fun.call(context);
        periodicallyCall(_fun,context,args,intervalms);
      }, intervalms);
  };

  /**
  *
  */
  createCookie = function(name,value,days) {
    if (!days) {
      days = 14;
    }
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
    document.cookie = name+"="+value+expires+"; path=/";
  };


  /**
  *
  */
  readCookie = function (name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') {
          c = c.substring(1,c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
          return c.substring(nameEQ.length,c.length);
      }
    }
    return null;
  };


  /**
  *
  */
  eraseCookie = function (name) {
    createCookie(name,"",-1);
  };


  /**
  *
  */
  if (window.WireIt && window.WireIt.Layer) {
    WireIt.Layer.prototype.setOptions = function(options) {
      this.options = {
        className: 'WireIt-Layer',
        parentEl: document.body,
        containers: [],
        wires: [],
        layerMap: false,
        enableMouseEvents: true
      };
      for (var key in options) {
        this.options[key] = options[key];
      }
      //debug("loaded defaults for wire-it layer");
      //debug(this.options.parentEl);
    };
  }

  /**
  * Wraps buffer to selected number of characters using string break char
  * Modified from: http://phpjs.org/functions/wordwrap (License: MIT || GPL)
  * @method wordWrap(m,b,c)
  * @args
  *   wrap_width = how many characters to wrap at,
  *   break_character = character to use for line breaks.
  *   cut_words = whether to allow splitting of words. (does this work)
  *
  */
  String.prototype.wordWrap = function(wrap_width, break_character, cut_words) {
      var m = ((arguments.length >= 1) ? arguments[0] : 75   );
      var b = ((arguments.length >= 3) ? arguments[1] : "\n" );
      var c = ((arguments.length >= 4) ? arguments[2] : false);

      var i, j, s, r = this.split("\n");
      if (m > 0) {
          for (i in r) {
              for (s = r[i], r[i] = ""; s.length > m;) {
                  j = c ? m : (j = s.substr(0, m).match(/\S*$/)).input.length - j[0].length || m;
                  r[i] += s.substr(0, j) + ((s = s.substr(j)).length ? b : "");
              }
              r[i] += s;
          }
      }
      return r.join("\n");
  };


})();

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/mysystem/mysystem_complete.js');
};
