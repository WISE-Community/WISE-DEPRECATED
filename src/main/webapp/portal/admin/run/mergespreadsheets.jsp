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

        <h1>Overview</h1>
        <div>
            Use this form to merge one excel workbook with multiple spreadsheets based on a common column in each sheet.
        </div>
        <br/>
        <h1>Instructions</h1>
        <ol>
            <li>1. Choose and upload a spreadsheet.</li>
            <li>2. Specify the title of the column (e.g. "Student Id") to merge on. <span span="color:red">All the sheets in uploaded file need a column with this
                column title.</span>
            </li>
            <li>3. Click on the "Submit" button.</li>
        </ol>
        <br/>
        <h1>Troubleshooting</h1>
        <div>If you see an error page after hitting submit, check your excel file for any corrupt cells. Fix the error, save the file, and try again.</div>
        <br/>
        <br/>
        <hr/>

        <form:form method="post" action="mergespreadsheets"
                   id="uploadFileForm" enctype="multipart/form-data" autocomplete='off'
                   onsubmit="return validateForm();">
            <input type="file" name="uploadFile" id="uploadFile"/><br/><br/>
            Title of the Common Column: <input type="text" name="mergeColumnTitle" id="mergeColumnTitle"/>
            <br/><br/>
            <input type="submit" value="Submit"/>
        </form:form>

    </div>
</div>

</body>
</html>