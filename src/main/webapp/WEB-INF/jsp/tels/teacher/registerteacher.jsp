<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="registerstylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="jquerystylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />

<script type="text/javascript" src="<spring:theme code="jquerysource"/>"></script>
<script type="text/javascript" src="<spring:theme code="jqueryuisource"/>"></script>
<script type="text/javascript" src="<spring:theme code="generalsource"/>"></script>


<script type="text/javascript">
$(document).ready(function(){

	//focus cursor into the First Name field on page ready iff there are no errors
	if ($(".errorMsgNoBg").children().length == 0) {
		if($('#teacherFirstName').length){
			$('#teacherFirstName').focus();
		}
	}
});

/**
 * Check if there is an account with matching first name and
 * last name already. If there are matching accounts we will 
 * ask the teacher whether one of these existing accounts is
 * theirs to try to reduce duplicate accounts. If none of these accounts
 * is theirs they have the option of creating the new account. If
 * there are no matching accounts we will create the new account.
 */
function checkForExistingAccountsAndCreateAccount() {
	
	 if (checkIfLegalAcknowledged()){
		//get the first name and last name from the form
		var firstName = $('#teacherFirstName').val();
		var lastName = $('#teacherLastName').val();

		 //check to make sure first name and last name are latin-based characters
		 if( /[^a-zA-Z0-9]/.test( firstName ) ) {
			alert("<spring:message code='error.firstname-illegal-characters'/>");
			return;
		 } else if( /[^a-zA-Z0-9]/.test( lastName ) ) {
			alert("<spring:message code='error.lastname-illegal-characters'/>");
			return;
	     }

		 if(checkForExistingAccounts(firstName,lastName)) {
			//accounts exist, ask teacher if these accounts are theirs

			//get the JSON array of existing accounts
			var existingAccountsString = $('#existingAccounts').html();

			//create a JSON array object
			var existingAccountsArray = JSON.parse(existingAccountsString);

			//the message to display in the popup
			var existingAccountsHtml = "";
		
			existingAccountsHtml += "<h1 style='color:red;text-align:center'><spring:message code='teacher.registerteacher.warning'/></h1>";
			
			if(existingAccountsArray.length > 1) {
				//message to display if we found multiple accounts
				existingAccountsHtml += "<p style='color:red'><spring:message code='teacher.registerteacher.accountsAlreadyExistIfYoursPleaseUse'/></p>";
			} else {
				//message to display if we found a single account
				existingAccountsHtml += "<p style='color:red'><spring:message code='teacher.registerteacher.accountAlreadyExistsIfYoursPleaseUse'/></p>";
			}
			
			existingAccountsHtml += "<br>";
			
			//loop through all the existing accounts
			for(var x=0; x<existingAccountsArray.length; x++) {
				//get a user name
				var userName = existingAccountsArray[x];
				
				//make the user name a link to the login page that will pre-populate the user name field
				existingAccountsHtml += "<a href='../login.html?userName=" + userName + "'>";
				existingAccountsHtml += userName;
				existingAccountsHtml += "</a>";
				
				existingAccountsHtml += "<br><br>";
			}

			existingAccountsHtml += "<p style='text-align:center'>------------------------------------------------------------</p><br>";

			existingAccountsHtml += "<p><spring:message code='teacher.registerteacher.sureNeverCreated'/></p>";
			
			//add the button that will create a brand new account if none of the existing accounts belongs to the user
			existingAccountsHtml += "<table style='width:100%'><tr><td style='width:100%' align='center'><a onclick='checkIfReallyWantToCreateAccount()' class='wisebutton'><spring:message code='teacher.registerteacher.createNewAccount'/></a></td</tr></table>";

			existingAccountsHtml += "<br>";
			
			//add the html to the div
			$('#existingAccountsDialog').html(existingAccountsHtml);

			//display the popup
			$('#existingAccountsDialog').dialog({title: "<spring:message code='teacher.registerteacher.accountAlreadyExists'/>", width:500, height:500});
		} else {
			//we did not find any accounts that have matching fields so we will create a new account
			createAccount();
		}
	 } else {
		 alert('<spring:message code="teacher.registerteacher.youMustAgree"/>');
	 }
};

/**
 * Make a sync request for any existing teacher accounts with the same
 * first name and last name
 */
function checkForExistingAccounts(firstName, lastName) {

	var data = {
		accountType:'teacher',
		firstName:firstName,
		lastName:lastName
	};

	//make the request for matching accounts
	$.ajax({
		url:'../checkforexistingaccount.html',
		data:data,
		dataType:'html',
		success:function(response) {
			if(response != null) {
				//set the response into a hidden div so we can access it later
				$('#existingAccounts').html(response);
			}
		},
		async:false
	});

	var existingAccounts = false;
	
	if($('#existingAccounts').html() != '' && $('#existingAccounts').html() != '[]') {
		//there are existing accounts that match
		existingAccounts = true;
	}

	return existingAccounts;
};

/** check if terms of service checkbox checked
 * If checked, return true
 * Otherwise, return false
 */
function checkIfLegalAcknowledged () {
	if($('#legalAcknowledged').is(":checked")){
		return true;
	}else{
		return false;
	}
};

/**
 * Ask the student again if they are really sure they 
 * have never created an account before.
 */
function checkIfReallyWantToCreateAccount() {
	//ask the student again 
	var answer = confirm("<spring:message code='teacher.registerteacher.pleaseDoNotCreateDuplicateAccounts'/>");
	
	if(answer) {
		//create the account if they answered 'OK'
		createAccount();
	}
}

/**
 * Submit the form to create the account
 */
function createAccount() {
	$('#teacherRegForm').submit();
};

$(document).ready(function(){
	/*
	 * Set up terms of use dialog
	 */
	$('#terms').click(function(){
		var termsdiv = $('<div id="termsDialog"></div>');
		termsdiv.load('termsofuse.html').dialog({
			modal:true,
			resizeable:false,
			title:'<spring:message code="teacher.registerteacher.termsOfUse" />',
			position:'center',
			height:450,
			width:600,
			draggable:false,
			close: function() { 
				$(this).dialog("destroy");
			},
			buttons: { "Ok": function() { $(this).dialog("close"); }}
		});
	});

});

</script>

<title><spring:message code="teacher.registerteacher.teacherRegistration" /></title>

</head>

<body>

<div id="pageWrapper">
	
	<div id="page">
		
		<div id="pageContent" style="min-height:400px;">
			<div id="headerSmall">
				<a id="name" href="/webapp/index.html" title="<spring:message code="wiseHomepage"/>"><spring:message code="wise" /></a>
			</div>
			
			<div class="infoContent">
				<div class="panelHeader"><spring:message code="teacher.registerteacher.teacherRegistration"/></div>
				<div class="infoContentBox">
					<div><spring:message code="teacher.registerteacher.toCreateATeacherAccount"/>, <spring:message code="teacher.registerteacher.pleaseCompleteRequiredFields"/></div>

					<!-- Support for Spring errors object -->
					<div class="errorMsgNoBg">
						<spring:bind path="teacherAccountForm.*">
						  <c:forEach var="error" items="${status.errorMessages}">
						    <p><c:out value="${error}"/></p>
						  </c:forEach>
						</spring:bind>
					</div>
					
					<form:form method="post" action="registerteacher.html" commandName="teacherAccountForm" id="teacherRegForm" autocomplete='off'>  
					  <table class="regTable">
					  	<tr>
					  		<td><label for="firstname" id="firstname1"><spring:message code="teacher.registerteacher.firstName" /></label></td>
					    	<td><form:input path="userDetails.firstname" id="teacherFirstName" size="25" maxlength="25" tabindex="1"/><span class="hint"><spring:message code="teacher.registerteacher.required"/><span class="hint-pointer"></span></span> </td>
					    </tr>
					       
					  	<tr>
					  		<td><label for="lastname" id="lastname1"><spring:message code="teacher.registerteacher.lastName"/></label></td>
							<td><form:input path="userDetails.lastname" id="teacherLastName" size="25" maxlength="25" tabindex="2"/> <span class="hint"><spring:message code="teacher.registerteacher.required"/><span class="hint-pointer"></span></span> </td>
						</tr>
					
					    <tr>
					    	<td><label for="emailAddress" id="emailAddress1"><spring:message code="teacher.registerteacher.email" /></label></td>
							<td><form:input path="userDetails.emailAddress" id="teacherEmail" size="25" maxlength="40" tabindex="3"/> <span class="hint"><spring:message code="teacher.registerteacher.yourAccountInformationWillBeEmailed"/> <span class="hint-pointer"></span></span></td>
						</tr>
					            
					    <tr>
					    	<td><label for="city" id="city1"><spring:message code="teacher.registerteacher.city" /></label> </td>
							<td><form:input path="userDetails.city" id="teacherCity" size="25" maxlength="50" tabindex="4"/>
					    		<span class="hint"><spring:message code="teacher.registerteacher.required"/><span class="hint-pointer"></span></span></td>
					    </tr>
					           
					    <tr>
					    	<td><label for="state" id="state1" ><spring:message code="teacher.registerteacher.state" /></label> </td>
							<td><form:input path="userDetails.state" id="teacherState" size="25" maxlength="50" tabindex="5"/>
						    	<span class="hint"><spring:message code="teacher.registerteacher.required"/><span class="hint-pointer"></span></span>  
						</tr>
					                
					    <tr>
					    	<td><label for="country" id="country1"><spring:message code="teacher.registerteacher.country" /></label></td>
							<td><form:input path="userDetails.country" id="teacherCountry" size="25" maxlength="50" tabindex="6"/> 
							    <span class="hint"><spring:message code="teacher.registerteacher.required"/><span class="hint-pointer"></span></span> 
						</tr>
					            
					    <tr>
					    	<td><label for="schoolname" id="schoolname1"><spring:message code="teacher.registerteacher.schoolName" /></label></td>
							<td><form:input path="userDetails.schoolname" id="teacherSchool" size="25" maxlength="50" tabindex="7"/><span class="hint"><spring:message code="teacher.registerteacher.required"/><span class="hint-pointer"></span></span> </td>
						</tr>
					    
					    <tr>
					    	<td><label for="schoollevel" id="schoollevel1"><spring:message code="teacher.registerteacher.schoolLevel" /></label></td>
							<td>
								<form:select path="userDetails.schoollevel" id="schoollevel">           
						    		<c:forEach items="${schoollevels}" var="schoollevel">
						            	<form:option value="${schoollevel}"><spring:message code="teacher.registerteacher.${schoollevel}" /></form:option>
						          	</c:forEach>
					        	</form:select>
					        	<span class="hint"><spring:message code="teacher.registerteacher.required"/><span class="hint-pointer"></span></span></td>
					    </tr>
					                 
					    <tr>
					    	<td><label for="curriculumsubjects" id="curriculumsubjects1"><spring:message code="teacher.registerteacher.curriculumSubjects" /></label></td>
							<td>
							    <a id="toggleSubjects"><spring:message code="teacher.registerteacher.showHideSubjects"/></a> 
							   
							   	<div id="curriculumSubjectsBox"> 
							           <div><spring:message code="teacher.registerteacher.describeScienceTopics"/></div>
									  
							          <table id="textCurriculumBox">
							          <tr>
							          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects1" value="Biology"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.biology"/></td>
							          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects2" value="APBiology"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.apBiology"/></td>
							          </tr>
							          <tr>
							          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects3" value="EnvironmentalScience"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.environmentalScience"/></td>
									  <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects4" value="Chemistry"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.chemistry"/></td>
							          </tr>
							          <tr>
							          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects5" value="APChemistry"/><input type="hidden"  value="on"/><spring:message code="teacher.registerteacher.apChemistry"/></td>
							          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects6" value="Astronomy"/><input type="hidden"  value="on"/><spring:message code="teacher.registerteacher.astronomy"/></td>
							          </tr>
							          <tr>
							          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects7" value="Physics"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.physics"/></td>
							          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects8" value="APPhysics"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.apPhysics"/></td>
							          </tr>
							          <tr>
							          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects9" value="Anatomy"/><input type="hidden"  value="on"/><spring:message code="teacher.registerteacher.anatomy"/></td>
							          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects10" value="EarthScience"/><input type="hidden"  value="on"/><spring:message code="teacher.registerteacher.earthScience"/></td>
							          </tr>
							          <tr>
							          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects11" value="Biotechnology"/><input type="hidden"  value="on"/><spring:message code="teacher.registerteacher.biotechnology"/></td>
							          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects12" value="Geology"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.geology"/></td>
									  </tr>
							          <tr>
							          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects14" value="AdvancedIntScience"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.advancedIntegratedScience"/></td>
							          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects13" value="IntegratedScience"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.integratedScience"/></td>
							
							          </tr>
							          <tr>
							          <td><form:checkbox path="userDetails.curriculumsubjects" id="userDetails.curriculumsubjects15" value="Other"/><input type="hidden" value="on"/><spring:message code="teacher.registerteacher.other"/></td>
							          <td></td>
							          </tr>
							          </table>
							          
									 <div><spring:message code="teacher.registerteacher.note"/><a id="closeSubjects"><spring:message code="teacher.registerteacher.close"/></a></div>
							     </div>
						 	</td>
						 </tr>
						 
					     <tr style="padding-top:2px;" id="layoutForLegal">
					     	<td><label for="legalAcknowledged" id="legalAcknowledged1"><spring:message code="teacher.registerteacher.legal" /></label></td>
							<td id="termsOfUse">
							     <form:checkbox path="legalAcknowledged" id="legalAcknowledged"/> 
						     	 <spring:message code="teacher.registerteacher.iAgreeToThe"/>&nbsp;<a id="terms"><spring:message code="teacher.registerteacher.termsOfUse2"/></a>
						    </td>
						 </tr>
						 
					     <tr>
					     	<td><label for="password" id="password1"><spring:message code="teacher.registerteacher.password" /></label></td>
						 	<td><form:password path="userDetails.password" id="password" size="25" maxlength="20" tabindex="11"/> <span class="hint"><spring:message code="teacher.registerteacher.yourPasswordCanContain"/><span class="hint-pointer"></span></span></td>
						 </tr>
					
						 <tr>
						 	<td><label for="repeatedPassword" id="repeatedPassword2"><spring:message code="teacher.registerteacher.verifyPassword" /></label></td>
						 	<td><form:password path="repeatedPassword" id="repeatedPassword" size="25" maxlength="20" tabindex="12"/>  <span class="hint"><spring:message code="teacher.registerteacher.retypeYourPassword"/><span class="hint-pointer"></span></span></td>
						 </tr>
					      
					     <tr>
					     	<td><label for="howDidYouHearAboutUs" id="howDidYouHearAboutUs2"><spring:message code="teacher.registerteacher.howDidYouHear"/></label></td>
						 	<td><form:input path="userDetails.howDidYouHearAboutUs" id="howDidYouHearAboutUs" size="25" maxlength="120" tabindex="13"/>  <span class="hint"><spring:message code="teacher.registerteacher.tellUsHowYouHeard"/><span class="hint-pointer"></span></span></td>
					     </tr>
					</table>
               
				 	 <div id="regButtons">
				 	  	<a style="margin-bottom:1em;" id="createAccountLink" class="wisebutton" onclick="checkForExistingAccountsAndCreateAccount()"><spring:message code="teacher.registerteacher.createAccount"/></a>
				 	  	<a href="/webapp/index.html"><spring:message code="teacher.registerteacher.cancel"/></a>
					 </div>
					</form:form>
					<div id="existingAccounts" style="display:none"></div>
					<div id="existingAccountsDialog" style="display:none"></div>
				</div>
			</div>
		</div>
	</div>
</div>
</body>
</html>

