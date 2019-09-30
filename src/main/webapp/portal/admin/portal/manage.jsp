<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html x-dir="${textDirection}"> <%-- The page always ltr --%>
<head>
    <%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource" />"></script>
    <link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />

    <script type="text/javascript">
        function saveToServer(attributeName, attributeValue) {
            var portalId = $("#portalId").html();
            try {
                // un-pretty-print before we save
                attributeValue = JSON.stringify(JSON.parse(attributeValue));
                $.ajax(
                        {
                            type: 'POST',
                            url: 'manage',
                            data: {
                                attr: attributeName,
                                portalId: portalId,
                                val: attributeValue
                            },
                            error: function () {
                                alert('Error: please talk to wise administrator, which might be you. If this is the case, please talk to yourself.');
                            },
                            success: function () {
                                alert('Save Successful!');
                            }
                        });
            } catch (exception) {
                alert("Error saving project metadata settings. Make sure that the JSON is valid and try again.");
            }
        }

        $(document).ready(function() {
            var portalId = $("#portalId").html();
            // pretty-print the JSON settings
            $("#announcement").val(JSON.stringify(JSON.parse($("#announcement").val()), null, 4));
            $("#projectMetadataSettings").val(JSON.stringify(JSON.parse($("#projectMetadataSettings").val()), null, 4));
            $("#projectLibraryGroups").val(JSON.stringify(JSON.parse($("#projectLibraryGroups").val()), null, 4));
            $("#defaultSurveyTemplate").val(JSON.stringify(JSON.parse($("#defaultSurveyTemplate").val()), null, 4));

            $("select").bind("change",
                function() {
                    var attrVal = this.id;
                    $(this).find(":selected").each(function() {
                        $.ajax(
                            {
                                type:'POST',
                                url:'manage',
                                data:'attr='+attrVal+'&portalId=' + portalId + '&val=' + $(this).val(),
                                error:function(){alert('Error: please talk to wise administrator, which might be you. If this is the case, please talk to yourself.');},
                                success:function(){}
                            });
                    });
                });
            $("#portalNameInput").on("change", function() {
                $.ajax(
                    {
                        type: 'POST',
                        url: 'manage',
                        data: 'attr=portalName&portalId=' + portalId + '&val=' + $("#portalNameInput").val(),
                        error: function () {
                            alert('Error: please talk to wise administrator, which might be you. If this is the case, please talk to yourself.');
                        },
                        success: function () {
                            alert('Save Successful!');
                        }
                    });
            });
            $("#revertToDefaultAnnouncement").on("click", function() {
                if (confirm("You will lose any changes to your current announcement. Continue?")) {
                    var defaultAnnouncement = ${defaultAnnouncement};
                    $("#announcement").val(JSON.stringify(defaultAnnouncement, null, 4));
                }
            });
            $("#saveAnnouncementButton").on("click", function() {
                var announcementStr = $("#announcement").val();
                saveToServer("announcement", announcementStr);
            });
            $("#revertToDefaultProjectMetadataSettings").on("click", function() {
                if (confirm("You will lose any changes to your project metadata settings. Continue?")) {
                    var defaultProjectMetadataSettings = ${defaultProjectMetadataSettings};
                    $("#projectMetadataSettings").val(JSON.stringify(defaultProjectMetadataSettings, null, 4));
                }
            });
            $("#saveProjectMetadataSettingsButton").on("click", function() {
                var projectMetadataSettingsStr = $("#projectMetadataSettings").val();
                saveToServer("projectMetadataSettings", projectMetadataSettingsStr);
            });
            $("#revertToDefaultProjectLibraryGroups").on("click", function() {
                if (confirm("You will lose any changes to your project library groups. Continue?")) {
                    var defaultProjectLibraryGroups = ${defaultProjectLibraryGroups};
                    $("#projectLibraryGroups").val(JSON.stringify(defaultProjectLibraryGroups, null, 4));
                }
            });
            $("#saveProjectLibraryGroupsButton").on("click", function() {
                var projectLibraryGroupsStr = $("#projectLibraryGroups").val();
                saveToServer("projectLibraryGroups", projectLibraryGroupsStr);
            });
            $("#revertToDefaultSurveyTemplate").on("click", function() {
                if (confirm("You will lose any changes to your survey template. Continue?")) {
                    var defaultSurveyTemplate = {"save_time":null,"items":[{"id":"recommendProjectToOtherTeachers","type":"radio","prompt":"How likely would you recommend this project to other teachers?","choices":[{"id":"5","text":"Extremely likely"},{"id":"4","text":"Very likely"},{"id":"3","text":"Moderately likely"},{"id":"2","text":"Slightly likely"},{"id":"1","text":"Not at all likely"}],"answer":null},{"id":"runProjectAgain","type":"radio","prompt":"How likely would you run this project again?","choices":[{"id":"5","text":"Extremely likely"},{"id":"4","text":"Very likely"},{"id":"3","text":"Moderately likely"},{"id":"2","text":"Slightly likely"},{"id":"1","text":"Not at all likely"}],"answer":null},{"id":"useWISEAgain","type":"radio","prompt":"How likely would you use WISE again in your classroom?","choices":[{"id":"5","text":"Extremely likely"},{"id":"4","text":"Very likely"},{"id":"3","text":"Moderately likely"},{"id":"2","text":"Slightly likely"},{"id":"1","text":"Not at all likely"}],"answer":null},{"id":"adviceForOtherTeachers","type":"textarea","prompt":"Please share any advice for other teachers about this project or about WISE in general.","answer":null},{"id":"technicalProblems","type":"textarea","prompt":"Please write about any technical problems that you had while running this project.","answer":null},{"id":"generalFeedback","type":"textarea","prompt":"Please provide any other feedback to WISE staff.","answer":null}]};
                    $("#defaultSurveyTemplate").val(JSON.stringify(defaultSurveyTemplate, null, 4));
                }
            });
            $("#saveSurveyTemplateButton").on("click", function() {
                var defaultSurveyTemplateStr = $("#defaultSurveyTemplate").val();
                // un-pretty-print before we save
                try {
                    defaultSurveyTemplateStr = JSON.stringify(JSON.parse(defaultSurveyTemplateStr));
                    $.ajax(
                        {
                            type: 'POST',
                            url: 'manage',
                            data: 'attr=runSurveyTemplate&portalId=' + portalId + '&val=' + defaultSurveyTemplateStr,
                            error: function () {
                                alert('Error: please talk to wise administrator, which might be you. If this is the case, please talk to yourself.');
                            },
                            success: function () {
                                alert('Save Successful!');
                            }
                        });
                } catch (exception) {
                    alert("Error saving survey template. Make sure that the JSON is valid and try again.");
                }
            });
        });
    </script>
</head>
<body>
<span id="portalId" style="display:none">${portal.id}</span>
<h5 style="color:#0000CC;"><a href="${contextPath}/admin"><spring:message code="returnToMainAdminPage" /></a></h5>
<br/>
name: <input id="portalNameInput" size="50" value="${portal.portalName}"><br/>
address: ${portal.address} | send_email_on_exception: ${portal.sendMailOnException}
<br/>
Is Login Allowed:
<select id="isLoginAllowed">
    <c:choose>
        <c:when test="${portal.loginAllowed}">
            <option value="true" selected="selected">YES</option>
            <option value="false">NO</option>
        </c:when>
        <c:otherwise>
            <option value="true">YES</option>
            <option value="false" selected="selected">NO</option>
        </c:otherwise>
    </c:choose>
</select>

<br/>
Send WISE statistics to WISE5.org (for research purpose only, no personal data will be sent. Please consider enabling this as it will help improve WISE!)
<select id="isSendStatisticsToHub">
    <c:choose>
        <c:when test="${portal.sendStatisticsToHub}">
            <option value="true" selected="selected">YES</option>
            <option value="false">NO</option>
        </c:when>
        <c:otherwise>
            <option value="true">YES</option>
            <option value="false" selected="selected">NO</option>
        </c:otherwise>
    </c:choose>
</select>
<br/><br/>
Site Announcement (must be a valid JSON object) | <button id="revertToDefaultAnnouncement">Revert to Default</button><br/>
<textarea id="announcement" rows="20" cols="100">${portal.announcement}</textarea><br/>
<input id="saveAnnouncementButton" type="button" value="Save" />
<br/><br/>
Project Metadata Settings (must be a valid JSON object) | <button id="revertToDefaultProjectMetadataSettings">Revert to Default</button><br/>
<textarea id="projectMetadataSettings" rows="20" cols="100">${portal.projectMetadataSettings}</textarea><br/>
<input id="saveProjectMetadataSettingsButton" type="button" value="Save" />
<br/><br/>
Project Library Groups (must be a valid JSON object) | <button id="revertToDefaultProjectLibraryGroups">Revert to Default</button><br/>
<textarea id="projectLibraryGroups" rows="20" cols="100">${portal.projectLibraryGroups}</textarea><br/>
<input id="saveProjectLibraryGroupsButton" type="button" value="Save" />
<br/><br/>
Run Survey Template (must be a valid JSON object) | <button id="revertToDefaultSurveyTemplate">Revert to Default</button><br/>
<textarea id="defaultSurveyTemplate" rows="20" cols="100">${portal.runSurveyTemplate}</textarea><br/>
<input id="saveSurveyTemplateButton" type="button" value="Save" />
<br/><br/>
<h5 style="color:#0000CC;"><a href="${contextPath}/admin"><spring:message code="returnToMainAdminPage" /></a></h5>
</body>
</html>
