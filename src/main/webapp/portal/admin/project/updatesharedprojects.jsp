<%@ include file="../../include.jsp" %>

<!DOCTYPE html>
<html x-dir="${textDirection}"> <%-- The page always ltr --%>
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>

    <link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet" type="text/css"/>
    <link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>"/>

    <title><spring:message code="wiseAdmin"/></title>

    <script type='text/javascript'>
        function view() {
            var min = document.getElementById("min").value;
            var max = document.getElementById("max").value;
            var url = "${contextPath}/api/admin/project/shared/view?min=" + min + "&max=" + max;
            window.open(url, "_blank");
        }
        function update() {
            if (confirm("Are you sure you want to update the permissions?")) {
                var min = document.getElementById("min").value;
                var max = document.getElementById("max").value;
                var url = "${contextPath}/api/admin/project/shared/update?min=" + min + "&max=" + max;
                window.open(url, "_blank");
            }
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

        <h1>Update Shared Projects Permissions</h1>
        <br/>
        <h2>Overview</h2>
        <br/>
        <div>
            Use this form to update shared owner project permissions. Shared owners with permission 16 will also be given permission 1 and 2. This operation will be performed on all projects unless a range is specified using min and max project IDs. This operation is required because in the legacy site we used permission 16 to give users read, edit, and share permissions on a project. In the new site we only use the read (permission 1) and edit (permission 2) permissions so we need to add 1 and 2 for the users that have permission 16.
            <br/>
            <br/>
            We provide the min/max range parameters to allow admin users to update permissions in small chunks instead of all at once. If there are only a small number of shared projects you may be able to run the update without a min/max. If there are a lot of shared projects you may want to split the update into chunks. For reference, it took 45 seconds to update 1259 shared projects and 2661 shared owner permissions.
        </div>
        <br/>
        <h2>Instructions</h2>
        <br/>
        <ol>
            <li>1. (Optional) Choose a Min Project ID. If this is left blank, it will default to use 0.</li>
            <br/>
            <li>2. (Optional) Choose a Max Project ID. If this is left blank, it will default to use infinity.</li>
            <br/>
            <li>3. Click the "View" button to see the shared permissions for the projects in the range between Min and Max inclusive. The information will be displayed on a new page and at the top of the page it will display the number of shared projects in the range.</li>
            <br/>
            <li>4. Click the "Update" button to perform the update on the shared permissions for the projects in the range between Min and Max inclusive. The information will be displayed on a new page and at the top of the page it will display the number of shared projects in the range as well as the number of projects that were changed and the number of shared owners that were changed.</li>
        </ol>
        <br/>

        Min Project ID (optional): <input id="min"/>
        Max Project ID (optional): <input id="max"/>
        <button onclick="view()">View</button>
        <button onclick="update()">Update</button>
    </div>
</div>

</body>
</html>
