<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html lang="en">
<head>
<script type="text/javascript" src="javascript/tels/jquery-1.4.1.min.js" ></script>

<link href="<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
<link href="<spring:theme code="teacherprojectstylesheet" />" media="screen" rel="stylesheet" type="text/css" />

<script type="text/javascript" src="../javascript/tels/general.js"></script>

<!--NOTE: the following scripts has CONDITIONAL items that only apply to IE (MattFish)-->
<!--[if lt IE 7]>
<script defer type="text/javascript" src="../../javascript/tels/iefixes.js"></script>
<![endif]-->

<!-- SuperFish drop-down menu from http://www.electrictoolbox.com/jquery-superfish-menus-plugin/  -->

<link rel="stylesheet" type="text/css" href="themes/tels/default/styles/teacher/superfish.css" media="screen">
<script type="text/javascript" src="javascript/tels/superfish.js"></script>

<script type="text/javascript">
    
            // initialise plugins
            jQuery(function(){
                jQuery('ul.sf-menu').superfish();
            });

// asynchronously archives (if isRead=true) or unarchives (if isRead=false) a message
function archiveMessage(messageId, sender, isRead) {
	var messageDiv = document.getElementById('message_' + messageId);
	
	var callback = {
		success:function(o){
			/* move message from archived->new or new->archived */
			if (isRead=="true") {   // move from new->archived
				var message_text_div = document.getElementById("message_action_div_"+messageId);
				message_text_div.innerHTML = 		
					"<a class=\"messageArchiveLink\" onclick=\"archiveMessage('"+messageId+"', '"+sender+"', 'false');\">" + "<spring:message code="teacher.message.index.markAsUnread"/>" + "</a> | "+ 
					"<a class=\"messageReplyLink\" onclick=\"alert('" + "<spring:message code="teacher.message.index.replyingNotImplented"/>" + "');\">" + "<spring:message code="teacher.message.index.reply"/>" + "</a><br/><br/>";
				document.getElementById("newMessageDiv").removeChild(messageDiv);				
				document.getElementById("archivedMessageDiv").appendChild(messageDiv);
			} else {  // move from archived->new
				var message_text_div = document.getElementById("message_action_div_"+messageId);
				message_text_div.innerHTML = 		
					"<a class=\"messageArchiveLink\" onclick=\"archiveMessage('"+messageId+"', '"+sender+"', 'true');\">" + "<spring:message code="teacher.message.index.archive"/>" + "</a> | "+ 
					"<a class=\"messageReplyLink\" onclick=\"alert('" + "<spring:message code="teacher.message.index.replyingNotImplented"/>" + "');\">" + "<spring:message code="teacher.message.index.reply"/>" + "</a><br/><br/>";
				document.getElementById("archivedMessageDiv").removeChild(messageDiv);
				document.getElementById("newMessageDiv").appendChild(messageDiv);
			}

			// update the counters for both new and archived messages
			var newMessageCount = document.getElementById("newMessageDiv").getElementsByClassName("messageDiv").length;
			document.getElementById("newMessageCountDiv").innerHTML = "<spring:message code="teacher.message.index.youHave"/>" + " "+newMessageCount+" " + "<spring:message code="teacher.message.index.newMessage"/>";
			var archivedMessageCount = document.getElementById("archivedMessageDiv").getElementsByClassName("messageDiv").length;
			document.getElementById("archivedMessageCountDiv").innerHTML = "<spring:message code="teacher.message.index.youHave"/>" + " "+archivedMessageCount+" " + "<spring:message code="teacher.message.index.archivedMessage"/>";
		},
		failure:function(o){
			/* set failure message */
			messageDiv.innerHTML = '<font color="992244">' + "<spring:message code="teacher.message.index.unableToUpdate"/>" + '</font>';
		},
		scope:this
	};	

	var action="archive";
	if (isRead == "false") {
		action="unarchive";
	}
	YAHOO.util.Connect.asyncRequest('POST', '/webapp/message.html?action='+action+'&messageId='+messageId, callback, null);
}

// sends a new (if originalMessageId is -1) or reply (if originalMessageId is set) message
function sendMessage(originalMessageId) {
	var recipient = null;
	var subject = null;
	var body = null;
	var postData = null;
	if (originalMessageId == "-1") {   // new message
		originalMessageId = document.getElementById("compose_originalMessageId").value;
		recipient = $("#compose_recipient").val();
		subject = $("#compose_subject").val();
		body = $("#compose_body").val();
		postData = "recipient=" + recipient + "&subject=" + subject + "&body=" + body;
	} else {
		recipient = $("#message_from_"+originalMessageId).html();
		subject = $("#reply_subject_"+originalMessageId).html();
		body =	$("#reply_body_"+originalMessageId).val();
		postData = "recipient=" + recipient + "&subject=" + subject + "&body=" + body;
		postData += "&originalMessageId=" + originalMessageId;
	}

	var callback = {
			success:function(o){
				if (o.responseText != null && o.responseText == "success") {
					if (originalMessageId == "-1") {
						clearComposeMessageForm();
						$("#composeMessageFeedbackDiv").html("<spring:message code="teacher.message.index.messageTo"/>" + " " + recipient + " " + "<spring:message code="teacher.message.index.sentSuccessfully"/>");
					} else {
						showReplyForm(originalMessageId, false);
						$("#replyFeedbackDiv_"+originalMessageId).html("<spring:message code="teacher.message.index.messageTo"/>" + " " + recipient + " " + "<spring:message code="teacher.message.index.sentSuccessfully"/>");
												
					}
					// add the message to sentMessagesDiv.
					var dateString = getDateString();
		
					var sentMessageDiv = document.createElement("div");
					sentMessageDiv.setAttribute("class", "messageDiv");
					sentMessageDiv.innerHTML = "<div id=\"message_text_div_10\">" +
					"<spring:message code="teacher.message.index.date"/>" + ": "+dateString+"<br/>" +
					"<spring:message code="teacher.message.index.to"/>" + ": "+recipient+"<br/>" +
					"<spring:message code="teacher.message.index.subject"/>" + ": <span>"+subject+"</span><br/>"+
			    	body+"</div>";
			    	document.getElementById("sentMessageDiv").appendChild(sentMessageDiv);					
				} else {
					if (o.responseText != null && o.responseText == "recipient not found") {
						alert("<spring:message code="teacher.message.index.recipientCouldNotBeFound"/>");
					} else {
						alert("<spring:message code="teacher.message.index.unknownProblem"/>");
					}
				}
			},
			failure:function(o){
			},
			scope:this
		};	
	
	YAHOO.util.Connect.asyncRequest('POST', '/webapp/message.html?action=compose', callback, postData);
}

function clearComposeMessageForm() {
	$("#compose_originalMessageId").val("-1");
	$("#compose_recipient").val("");
	$("#compose_subject").val("");
	$("#compose_body").val("");
}

function getDateString() {
	var currentTime = new Date();
	var month = currentTime.getMonth() + 1;
	var day = currentTime.getDate();
	var year = currentTime.getFullYear();
	var hours = currentTime.getHours() % 12;
	var minutes = currentTime.getMinutes();
	if (minutes < 10){
		minutes = "0" + minutes;
	}
	var amPm = "";
	if(hours > 11){
		amPm = "<spring:message code="teacher.message.index.pm"/>";
	} else {
	 	amPm = "<spring:message code="teacher.message.index.am"/>";
	}
	return month + "/" + day + "/" + year + " " +
		hours + ":" + minutes + " " + amPm;
	
}

function showReplyForm(originalMessageId, doShow) {
	if (doShow) {
		$("#replyDiv_"+originalMessageId).css("display", "block");
	} else {
		$("#replyDiv_"+originalMessageId).css("display", "none");
	}
}

function sendReply(originalMessageId) {
	sendMessage(originalMessageId);
}

	/**
	 * Toggles the summary div
	 * projectId: id of project whose summary div to toggle
	 */
	function toggleDetails(){
		var searchDiv = document.getElementById('messageContentArchived');
		if(searchDiv.style.display=='none'){
			searchDiv.style.display = 'block';
		} else {
			searchDiv.style.display = 'none';
		};
	};

	/**
	 * Toggles the summary div
	 * projectId: id of project whose summary div to toggle
	 */
	function toggleDetails2(){
		var searchDiv = document.getElementById('messageContentSent');
		if(searchDiv.style.display=='none'){
			searchDiv.style.display = 'block';
		} else {
			searchDiv.style.display = 'none';
		};
	};
</script>

</head>

<body>

<div id="centeredDiv">

<%@ include file="../headerteacher.jsp"%>

<div id="navigationSubHeader2"><spring:message code="teacher.message.index.viewAndSendMessages"/><span id="navigationSubHeader1"><spring:message code="teacher.message.index.management"/></span></div>

<div class="panelStyleMessage">
	<div id="messageHeader"><spring:message code="teacher.message.index.incomingMessages"/></div>
	<div id="messageContent">
		<div id="newMessageCountDiv"><spring:message code="teacher.message.index.youHave"/><c:out value=" ${fn:length(unreadMessages)} "></c:out><spring:message code="teacher.message.index.newMessage"/></div>
		<div id="newMessageDiv">
		<c:forEach var="message" items="${unreadMessages}" >
		    <div class="messageDiv" id="message_${message.id}">
		    	<div id="message_text_div_${message.id}">
		  	  	<table class='messageDisplayTable2'>
				<tr><th><spring:message code="teacher.message.index.date"/></th><td><fmt:formatDate value="${message.date}" type="both" dateStyle="short" timeStyle="short" /></td></tr>
				<tr><th><spring:message code="teacher.message.index.from"/></th><td><span id="message_from_${message.id}">${message.sender.userDetails.username}</span></td></tr>
				<tr><th><spring:message code="teacher.message.index.subject"/></th><td><span id="message_subject_${message.id}">${message.subject}</span></td>
				<tr><th><spring:message code="teacher.message.index.msg"/></th><td class='messageBody'><c:out value="${message.body}" /></td></tr>
				</table>
				</div>
				<div id="message_action_div_${message.id}" class='messageActionLinks'>
					<a class="messageArchiveLink" onclick="archiveMessage('${message.id}', '${message.sender.userDetails.username}', 'true');"><spring:message code="teacher.message.index.archive"/></a> | 
					<a class="messageReplyLink" onclick="showReplyForm('${message.id}', true);">Reply</a><br/><br/>
				</div>
				<div class="replyDiv" id="replyDiv_${message.id}">
					Subject: <span id="reply_subject_${message.id}">Re: ${message.subject}</span><br/>
					<textarea cols="75" rows="5" id="reply_body_${message.id}" ></textarea>
					<input type="button" value=<spring:message code="teacher.message.index.send"/> onclick="sendReply('${message.id}')" />
					<input type="button" value=<spring:message code="teacher.message.index.cancel"/> onclick="showReplyForm('${message.id}',false)" />
				</div>
				<div class="replyFeedbackDiv" id="replyFeedbackDiv_${message.id}"></div>
			</div>
		</c:forEach>
		</div>
	</div>
</div>

<div class="panelStyleMessage secondPlus">
	<div id="messageHeader"><spring:message code="teacher.message.index.sendNewMessage"/></div>
	<div id="messageContent">
		<div id="composeMessageFeedbackDiv"></div>
		<div id="composeMessageDiv">
			<input type="hidden" id="compose_originalMessageId" value="-1" />
			<table>
				<tr><td><spring:message code="teacher.message.index.to"/></td><td><input type="text" id="compose_recipient"/></td></tr>
				<tr><td><spring:message code="teacher.message.index.subject"/></td><td><input type="text" id="compose_subject" /></td></tr>
				<tr><td><spring:message code="teacher.message.index.message"/></td><td><textarea cols="75" rows="10" id="compose_body" ></textarea></td></tr>
			</table>
			<br/>
			<input type="button" value="Send" onclick="sendMessage('-1')" />
		</div>
	</div>
</div>

<div class="panelStyleMessage secondPlus">
	<div id="messageHeader"><spring:message code="teacher.message.index.archiveIncomingMessages"/>
		<a id="hideShowLink" href="#" onclick="toggleDetails()"><spring:message code="teacher.message.index.hideShowArchivedMessages"/></a>
	</div>
	<div id="messageContentArchived" style="display:none;">
		<div id="archivedMessageCountDiv"><spring:message code="teacher.message.index.youHave"/><c:out value=" ${fn:length(readMessages)} "></c:out><spring:message code="teacher.message.index.archivedMessage"/></div>
		<div id="archivedMessageDiv">
		<c:forEach var="message" items="${readMessages}" >
		    <div class="messageDiv" id="message_${message.id}">
		    	<div id="message_text_div_${message.id}">
		  	  	<table class='messageDisplayTable2'>
				<tr><th><spring:message code="teacher.message.index.date"/></th><td><fmt:formatDate value="${message.date}" type="both" dateStyle="short" timeStyle="short" /></td></tr>
				<tr><th><spring:message code="teacher.message.index.from"/></th><td><span id="message_from_${message.id}">${message.sender.userDetails.username}</span></td></tr>
				<tr><th><spring:message code="teacher.message.index.subject"/></th><td><span id="message_subject_${message.id}">${message.subject}</span></td></tr>
				<tr><th><spring:message code="teacher.message.index.msg"/></th><td class='messageBody'><c:out value="${message.body}" /></td></tr>
				</table>
				</div>
				<div id="message_action_div_${message.id}" class='messageActionLinks'>
					<a class="messageArchiveLink" onclick="archiveMessage('${message.id}', '${message.sender.userDetails.username}', 'false');"><spring:message code="teacher.message.index.markAsUnread"/></a> | 
					<a class="messageReplyLink" onclick="showReplyForm('${message.id}', true);"><spring:message code="teacher.message.index.reply"/></a><br/><br/>
				</div>
				<div class="replyDiv" id="replyDiv_${message.id}">
					<spring:message code="teacher.message.index.subject"/> <span id="reply_subject_${message.id}">Re: ${message.subject}</span><br/>
					<textarea cols="75" rows="5" id="reply_body_${message.id}" ></textarea>
					<input type="button" value=<spring:message code="teacher.message.index.send"/> onclick="sendReply('${message.id}')" />
					<input type="button" value=<spring:message code="teacher.message.index.cancel"/> onclick="showReplyForm('${message.id}',false)" />
				</div>
				<div class="replyFeedbackDiv" id="replyFeedbackDiv_${message.id}"></div>
			</div>
		</c:forEach>
		</div>
	</div>
</div>

<div class="panelStyleMessage secondPlus">
	<div id="messageHeader"><spring:message code="teacher.message.index.archiveOfSentMessages"/>
	<a id="hideShowLink" href="#" onclick="toggleDetails2()"><spring:message code="teacher.message.index.hideShowSentMessages"/></a>
	</div>
	<div id="messageContentSent" style="display:none;">
		<div id="sentMessageCountDiv"><spring:message code="teacher.message.index.youHave"/><c:out value=" ${fn:length(sentMessages)} "></c:out><spring:message code="teacher.message.index.sentMessage"/></div>
		<div id="sentMessageDiv">
		<c:forEach var="message" items="${sentMessages}" >
		    <div class="messageDiv" id="message_${message.id}">
		    	<div id="message_text_div_${message.id}">
	  	  		<table class='messageDisplayTable2'>
				<tr><th><spring:message code="teacher.message.index.date"/></th><td><fmt:formatDate value="${message.date}" type="both" dateStyle="short" timeStyle="short" /></td></tr>
				<tr><th><spring:message code="teacher.message.index.to"/></th><td>
					<c:forEach var="messageRecipient" varStatus='messageRecipientStatus' items="${message.recipients}">
						<c:out value="${messageRecipient.recipient.userDetails.username}"/>
						<c:if test='${messageRecipientStatus.last=="false"}'>, </c:if>
					</c:forEach>
				</td></tr>
				<tr><th><spring:message code="teacher.message.index.subject"/></th><td><span id="message_subject_${message.id}">${message.subject}</span></td></tr>
				<tr><th><spring:message code="teacher.message.index.msg"/></th><td><c:out value="${message.body}" /></td></tr>
				</table>
				</div>
			</div>
			<br/>
		</c:forEach>
		</div>
	</div>
</div>

</div>   <!-- end of centered div-->

</body>
</html>