<%@ include file="../../include.jsp" %>

<!DOCTYPE html>
<html x-dir="${textDirection}"> <%-- The page always ltr --%>
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>

    <link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet" type="text/css"/>
    <link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>"/>

    <title><spring:message code="wiseAdmin"/></title>

    <script type='text/javascript'>
        function validateForm() {
            if (document.getElementById("runId").value === "") {
                alert("Please specify a Run ID.");
                return false;
            } else if (document.getElementById("nodeId").value === "") {
                alert("Please specify a Node ID.");
                return false;
            } else if (document.getElementById("componentId").value === "") {
                alert("Please specify a Component ID.");
                return false;
            }
            return true;
        }
    </script>
</head>

<body>

<div id="page">
    <div id="pageContent">
        <h5 style="color:#0000CC;"><a href="${contextPath}/admin"><spring:message
                code="returnToMainAdminPage"/></a></h5>
        <br/>

        <c:if test="${!empty(errorMsg)}">
            <div style="color:red; font-weight:bold; border:red 1px dotted; padding:5px;"><c:out value="${errorMsg}" /></div><br/>
        </c:if>

        <div>Instructions:</div>
        <ol>
            <li>1. Fill in Run ID, Node ID, and Component ID.</li>
            <li>2. Click Submit.</li>
        </ol>
        <br/>

        <form:form method="post" action="replacebase64withpng.html"
                   id="uploadFileForm" enctype="multipart/form-data" autocomplete='off'
                   onsubmit="return validateForm();">
            Run ID: <input type="number" name="runId" id="runId"/>
            Node ID: <input type="text" name="nodeId" id="nodeId"/>
            Component ID: <input type="text" name="componentId" id="componentId"/>
            <br/><br/>
            <input type="submit" value="Submit"/>
        </form:form>

    </div>
</div>

</body>
</html>
