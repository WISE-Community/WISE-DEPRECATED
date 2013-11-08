<%@ include file="../../include.jsp"%>
<!DOCTYPE html>
<html style="height:100%">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<title>WISE4</title>

<script type="text/javascript">
var contentUrl = "${contentUrl}";

function notifyFatal(type,args,obj){
	window.location = '/webapp/errors/outsideerror.html?msg=' + encodeURIComponent(args[0]);
}

function startWithConfig() {
	var vleConfigUrl = "${vleConfigUrl}";
	window.frames['topifrm'].eventManager.subscribe('fatalError', notifyFatal);
	window.frames['topifrm'].view.startVLEFromConfig(vleConfigUrl);
}	
</script>

<!-- make ${vleurl}?loadScriptsIndividually=true if you want to force vle to load scripts individually instead of via the allScripts-min.js -->

</head>
<body style="height:100%; overflow-y:hidden; margin:0px;">
<div id="wait"></div> 
<iframe  style="overflow-x:auto; overflow-y:hidden;" id="topifrm" src="${vleurl}" name="topifrm" width="100%" height="100%" frameborder="0">
<spring:message code="student.vle.noIFrameSupport" />
</iframe>

</body>
</html>