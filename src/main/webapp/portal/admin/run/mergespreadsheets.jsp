<%@ include file="../../include.jsp" %>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>

    <link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet" type="text/css"/>
    <link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>"/>

    <title><spring:message code="wiseAdmin"/></title>

    <script type='text/javascript'>
        function validateForm() {
            if (document.getElementById("uploadFile").value === "") {
                alert("Please specify a file to upload.");
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
            <li>1. Choose and upload a spreadsheet.</li>
            <li>2. Specify the title of the column to merge on. All the sheets in uploaded file need a column with this
                column title.
            </li>
        </ol>
        <br/>

        <form:form method="post" action="mergespreadsheets.html"
                   id="uploadFileForm" enctype="multipart/form-data" autocomplete='off'
                   onsubmit="return validateForm();">
            <input type="file" name="uploadFile" id="uploadFile"/><br/><br/>
            Common Column Title: <input type="text" name="mergeColumnTitle" id="mergeColumnTitle"/>
            <br/><br/>
            <input type="submit" value="Submit"/>
        </form:form>

    </div>
</div>

</body>
</html>