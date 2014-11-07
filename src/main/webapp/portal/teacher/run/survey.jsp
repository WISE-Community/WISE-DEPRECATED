<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html ng-app="surveyApp">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="teacher.run.survey"/></title>

<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="angular.js"/>"></script>
<script type="text/javascript" src="${contextPath}/<spring:theme code="survey.js"/>"></script>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="surveystyles"/>" media="screen" rel="stylesheet"  type="text/css" />

</head>
<body style="background:#FFFFFF;">
	<div id="surveyTitle"><spring:message code="teacher.run.survey"/>: ${run.name}</div>
	<div id="runId" style="display:none;">${run.id}</div>
	<div id="surveyJSON" style="display:none;">${run.survey}</div>
	<div ng-controller="surveyController">
		<div class="item" ng-repeat="item in survey.items track by $index">
			<div class='prompt'>{{$index+1}}. {{item.prompt}}</div>
			<span class="chooseOne" ng-if="item.type == 'radio'" ng-repeat="choice in item.choices">
				<input type="radio" ng-model="item.answer" ng-value="choice.id" value="choice.id">{{choice.text}}</input>
			</span>
			<span class="openResponse" ng-if="item.type == 'textarea'">
				<textarea cols="100" rows="12" ng-model="item.answer"></textarea>
			</span>
	    </div>
	    <input id="submitSurveyButton" type="button" ng-click="submitSurvey()" value="Submit Survey!"></input>
	</div>
</body>
</html>