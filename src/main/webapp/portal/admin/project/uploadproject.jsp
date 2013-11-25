<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<script type="text/javascript" src="../../javascript/tels/general.js"></script>
    
<title>Upload Project Page</title>

</head>
<body>

<h5 style="color:#0000CC;"><a href="../index.html"><spring:message code="returnToMainAdminPage" /></a></h5>

<c:out value="${msg}" />

<p>
NOTE:
<ol>
  <li>File must be a zip file, and must have a .zip extension</li>
  <li>ZipFile name must be the same as the root folder inside it</li>
  <li>File must contain a wise4.project.json file in the top/root level</li>
</ol>
<pre>
example.zip

unzipped:
  + example/
    + assets/
      - car.jpg
      - cup.png
    - wise4.project.json
    - intro.ht
    - intro.html
    ...    
</pre>
</p>

<form:form method="post" action="uploadproject.html" 
	commandName="projectZipFile" id="editproject" enctype="multipart/form-data" autocomplete='off'>

	<label for="projectname">Project Name</label><br/>
	<input type="text" size="25" name="name" id="projectName"/>
    <br/><br/>

	<div>Project Zip File</div>
	<input type="file" name="file" id="projectZipFile"/>
    <br/><br/>
    
    <input type="submit" value="Save" />
    <a href="manageallprojects.html"><input type="button" value="Cancel"></input></a>
</form:form>



</body>
</html>