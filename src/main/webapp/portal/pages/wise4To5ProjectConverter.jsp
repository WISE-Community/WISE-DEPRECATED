<%@ include file="../include.jsp"%>
<head>
    <title>WISE 4 to 5 Project Converter</title>

    <script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
    <script src="${contextPath}/<spring:theme code="wise4to5projectconverter"/>" type="text/javascript"></script>
</head>
    <div>WISE 4 to 5 Project Converter</div>

    <br/>
    <span>WISE4 Project File Path: </span><input id="projectFilePathInput" type="text" size="100" value="http://localhost:8080/curriculum/9323/wise4.project.json"/> <button onclick="convert()">Convert</button>
    <br/>
    <br/>
    <textarea id="wise4ProjectFile" rows="50" cols="100"></textarea>
    <textarea id="wise5ProjectFile" rows="50" cols="100"></textarea>
</body>
</html>
