<html>
<head>
    <script>
        // go through empty input fields and set to disabled so they are not sent as empty strings
        // in the POST request.
        function validateForm() {
            var inputElements = document.getElementsByTagName("input");
            for (var i = 0; i < inputElements.length; i++) {
                var inputElement = inputElements[i];
                if (inputElement.value == "") {
                    inputElement.disabled = true;
                }
            }
            return true;
        }
    </script>
</head>
<body>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<h3>Listing ComponentStates that match GET params</h3>
    <table border="1">
        <tr><th>id</th><th>run</th><th>period</th><th>workgroup</th><th>nodeId</th>
            <th>componentId</th><th>componentType</th><th>postTime</th><th>studentData</th></tr>
        <c:forEach items="${componentStates}" var="componentState">
            <tr><td>${componentState.id}</td>
                <td>id:${componentState.run.id}, name:${componentState.run.name}</td>
                <td>id:${componentState.period.id}</td>
                <td>id:${componentState.workgroup.id}</td>
                <td>${componentState.nodeId}</td>
                <td>${componentState.componentId}</td>
                <td>${componentState.componentType}</td>
                <td>${componentState.postTime}</td>
                <td>${componentState.studentData}</td></tr>
        </c:forEach>
    </table>

    <h3>Add/Update ComponentState</h3>
    <form name="addUpdateForm" method="POST" onsubmit="return validateForm()">
        <table>
            <tr><td>id</td><td><input type="text" name="id"></td></tr>
            <tr><td>runId</td><td><input type="text" name="runId"></td></tr>
            <tr><td>periodId</td><td><input type="text" name="periodId"></td></tr>
            <tr><td>workgroupId</td><td><input type="text" name="workgroupId"></td></tr>
            <tr><td>nodeId</td><td><input type="text" name="nodeId"></td></tr>
            <tr><td>componentId</td><td><input type="text" name="componentId"></td></tr>
            <tr><td>componentType</td><td><input type="text" name="componentType"></td></tr>
            <tr><td>studentData</td><td><input type="text" size="100" name="studentData"></td></tr>
        </table>
        <button type="submit">Submit</button>
    </form>
</body>
</html>