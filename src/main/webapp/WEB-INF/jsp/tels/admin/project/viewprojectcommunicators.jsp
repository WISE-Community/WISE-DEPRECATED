<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="../<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="../<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
<link href="../<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />
<link href="../<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
    
<script type="text/javascript" src="../javascript/tels/general.js"></script>
<script type="text/javascript" src="../javascript/tels/projectcommunicator.js"></script>
    
<title><spring:message code="wiseAdmin" /></title>

<script type='text/javascript' src='/webapp/dwr/interface/ChangePasswordParametersValidatorJS.js'></script>
<script type='text/javascript' src='/webapp/dwr/engine.js'></script>

<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
    <title>Google Maps JavaScript API Example</title>
    <script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=${googleMapKey}"
      type="text/javascript"></script>
      <!-- ABQIAAAA6i9SCA124FYnecWsJguS7hT2yXp_ZAY8_ufC3CFXhHIE1NvwkxS8pFGwdBavxNvBCxzMH5fKjlSmVQ -->
    <script type="text/javascript">
    function ProjectCommunicators(xmlProjectCommunicators) {
    	this.projectcommunicators = [];
    	this.setProjectCommunicators(xmlProjectCommunicators);
    }

    ProjectCommunicators.prototype.setProjectCommunicators = function(xmlProjectCommunicators){
    	var xProjectCommunicators = xmlProjectCommunicators.getElementsByTagName('projectcommunicator');
    	if (xProjectCommunicators != null && xProjectCommunicators[0] != null) {
    	  for(x=0;x<xProjectCommunicators.length;x++) {
    		  this.setProjectCommunicator(xProjectCommunicators[x]);
    	  };
    	};		
    };

    ProjectCommunicators.prototype.setProjectCommunicator = function(xmlProjectCommunicator) {
    	this.projectcommunicators.push(new ProjectCommunicator(xmlProjectCommunicator));
    };

    function ProjectCommunicator(xmlProjectCommunicator){	
    	this.id = xmlProjectCommunicator.childNodes[0].childNodes[0].nodeValue;
    	this.type = xmlProjectCommunicator.childNodes[1].childNodes[0].nodeValue;
    	this.baseurl = xmlProjectCommunicator.childNodes[2].childNodes[0].nodeValue;
    	this.address = xmlProjectCommunicator.childNodes[3].childNodes[0].nodeValue;
    	this.longitude = xmlProjectCommunicator.childNodes[4].childNodes[0].nodeValue;
    	this.latitude = xmlProjectCommunicator.childNodes[5].childNodes[0].nodeValue;
    }
    
    var xmlDoc;
    
    try //Internet Explorer
    {
    xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async="false";
    xmlDoc.loadXML("${projectCommunicatorsXML}");
    }
  catch(e)
    {
    try //Firefox, Mozilla, Opera, etc.
      {
      parser=new DOMParser();
      xmlDoc=parser.parseFromString("${projectCommunicatorsXML}","text/xml");
      }
    catch(e) {alert(e.message)}
    }
    
    var projectcommunicators = new ProjectCommunicators(xmlDoc);

    function createMarker(point, pc) {
    	var marker = new GMarker(point, {clickable:true});

    	GEvent.addListener(marker, "click", function() {
		marker.openInfoWindowHtml("<table><tr><td><b>Baseurl</b></td><td>" + pc.baseurl + "</td></tr>" +
		      "<tr><td><b>Id</b></td><td>"+ pc.id + "</td></tr>" + 
              "<tr><td><b>Type</b></td><td>" + pc.type + "</td></tr>" +		      
              "<tr><td><b>Address</b></td><td>" + pc.address + "</td></tr>" +
        	  "<tr><td></td><td><a href='manageprojectcommunicator.html?projectCommunicatorId=" + pc.id +"'>Visit</a></td></tr></table>");
		});
		
    	return marker;  
    }
    
    //<![CDATA[
    function load() {
      if (GBrowserIsCompatible()) {
        var map = new GMap2(document.getElementById("map"));
        map.addControl(new GLargeMapControl());
        map.setCenter(new GLatLng(39.095963,-100.195312), 2);

        for (z=0;z<projectcommunicators.projectcommunicators.length;z++) {
        	var pc = projectcommunicators.projectcommunicators[z];
        	var point = new GLatLng(pc.longitude,pc.latitude);
        	map.addOverlay(createMarker(point, pc));
        };
      };
    };
    //]]>
    </script>

</head>
<body onload="load()" onunload="GUnload()">

<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<div id="centeredDiv">

<%@ include file="../adminheader.jsp"%>

<h5 style="color:#0000CC;"><a href="../index.html"><spring:message code="returnToMainAdminPage" /></a></h5>

    <center><div id="map" style="width: 900px; height: 600px"></div></center><br/><br/>

</body>
</html>