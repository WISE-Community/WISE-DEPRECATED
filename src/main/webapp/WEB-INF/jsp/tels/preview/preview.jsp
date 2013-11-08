<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html style="height:100%;">
<head>
<title>WISE4</title>

	<script type="text/javascript">
		function notifyFatal(type,args,obj){
			window.location = '/webapp/errors/outsideerror.html?msg=' + encodeURIComponent(args[0]);
		}
	
		function startWithConfig() {
			var vleConfigUrl = "${vleConfigUrl}";
			window.frames['topifrm'].eventManager.subscribe('fatalError', notifyFatal);
			window.frames['topifrm'].view.startVLEFromConfig(vleConfigUrl);
		}
	</script>

<script type="text/javascript">
var contentUrl = "${contentUrl}";
</script>
</head>
<body style="height:100%; overflow-y:hidden; margin:0px;">
<div id="wait"></div> 
<iframe id="topifrm" src="${vleurl}?loadScriptsIndividually=true" name="topifrm" scrolling="auto"
 width="100%" height="100%" frameborder="0">
 [Content for browsers that don't support iframes goes here.]
</iframe>

</body>
</html>