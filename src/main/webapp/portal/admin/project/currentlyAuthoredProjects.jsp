<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title><spring:message code="wiseAdmin" /></title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" rel="stylesheet" type="text/css" >
<c:if test="${textDirection == 'rtl' }">
    <link href="${contextPath}/<spring:theme code="rtlstylesheet"/>" rel="stylesheet" type="text/css" >
</c:if>
<script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>
<script src="${contextPath}/<spring:theme code="superfishsource"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="generalsource" />" type="text/javascript"></script>

<style>
table th {
  font-weight:bold;
  border: 1px solid black;
  padding:3px;
}
table, tr, td {
  border: 1px solid black;
  padding:3px;
}
</style>
</head>
<body>
<%@ include file="../../headermain.jsp"%>
<div id="page">
    <div id="pageContent" class="contentPanel">
        <h5 style="color:#0000CC;"><a href="${contextPath}/admin"><spring:message code="returnToMainAdminPage" /></a></h5>
        <c:choose>
            <c:when test="${fn:length(projectsToAuthors) > 0}">
                <table>
                    <tr>
                        <th>Project ID</th>
                        <th>Project Name</th>
                        <th>Authors</th>
                    </tr>
                    <c:forEach var="projectsToAuthor" items="${projectsToAuthors}">
                        <tr>
                            <td>${projectsToAuthor.key}</td>
                            <td><a target=_blank href="../../previewproject.html?projectId=${projectsToAuthor.key}">${projectNames[projectsToAuthor.key]}</a></td>
                            <td><c:forEach var="username"
                                           items="${projectsToAuthor.value}"
                                           varStatus="loopStatus">
                                    <c:out value="${username}" /> |
                                    <a onclick='impersonateUser("${username}", "teacher")'>Log in as this user</a> |
                                    <a target='_blank' href='../../teacher/account/info?username=${username}'>info</a>
                                    <c:if test="${!loopStatus.isLast()}"><br/></c:if>
                                </c:forEach>
                            </td>
                        </tr>
                    </c:forEach>
                </table>
            </c:when>
            <c:otherwise>
                <c:out value="Nobody is authoring at this time." />
            </c:otherwise>
        </c:choose>
    </div>
</div>
</body>
</html>
