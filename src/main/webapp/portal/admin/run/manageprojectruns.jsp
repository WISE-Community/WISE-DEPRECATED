<%@ include file="../../include.jsp"%>

<!DOCTYPE html>
<html dir="${textDirection}">
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="chrome=1" />
    <link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
    <title><spring:message code="wiseAdmin" /></title>

    <link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
    <link href="${contextPath}/<spring:theme code="stylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
    <link href="${contextPath}/<spring:theme code="jquerystylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
    <link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
    <link href="${contextPath}/<spring:theme code="teacherrunstylesheet"/>" media="screen" rel="stylesheet"  type="text/css" />
    <link href="${contextPath}/<spring:theme code="jquerydatatables.css"/>" media="screen" rel="stylesheet"  type="text/css" />
    <link href="${contextPath}/<spring:theme code="facetedfilter.css"/>" media="screen" rel="stylesheet"  type="text/css" />
    <c:if test="${textDirection == 'rtl' }">
        <link href="${contextPath}/<spring:theme code="facetedfilter-rtl.css"/>" rel="stylesheet" type="text/css" >
    </c:if>

    <script src="${contextPath}/<spring:theme code="jquerysource"/>" type="text/javascript"></script>
    <script src="${contextPath}/<spring:theme code="jquerydatatables.js"/>" type="text/javascript"></script>
    <script src="${contextPath}/<spring:theme code="generalsource"/>" type="text/javascript"></script>
    <script src="${contextPath}/<spring:theme code="jqueryuisource"/>" type="text/javascript"></script>
    <script src="${contextPath}/<spring:theme code="facetedfilter.js"/>" type="text/javascript"></script>

    <!-- TODO: move to separate js setup file (will require js i18n implementation for portal) -->
    <script type="text/javascript">

        $(document).ready(function() {

            //setup grading and classroom monitor dialogs
            $('.grading, .researchTools').on('click',function(){
                var settings = $(this).attr('id');
                var title = $(this).attr('title');
                var path = "${contextPath}/teacher/grading/gradework.html?" + settings;
                var div = $('#gradingDialog').html('<iframe id="gradingIfrm" width="100%" height="100%" style="overflow-y:hidden;"></iframe>');
                $('body').css('overflow','hidden');
                div.dialog({
                    modal: true,
                    width: $(window).width() - 32,
                    height: $(window).height() - 32,
                    position: 'center',
                    title: title,
                    close: function (e, ui) { $(this).html(''); $('body').css('overflow','auto'); },
                    buttons: {
                        Exit: function(){
                            $(this).dialog('close');
                        }
                    }
                });
                $("#gradingDialog > #gradingIfrm").attr('src',path);
            });

            // setup grading and classroom monitor dialogs
            $('.classroomMonitor').on('click',function(){
                var settings = $(this).attr('id');
                var runId = $(this).attr('runId');
                var title = $(this).attr('title');
                var wiseVersion = $(this).attr('wiseVersion');
                var path = "${contextPath}/legacy/teacher/classroomMonitor/classroomMonitor?" + settings;
                if (wiseVersion != null && wiseVersion == 5) {
                    path = "${contextPath}/teacher/manage/unit/" + runId;
                }
                window.open(path);
            });

            // setup share project run dialog
            $('.shareRun').on('click',function(){
                var title = $(this).attr('title');
                var runId = $(this).attr('id').replace('shareRun_','');
                var path = "${contextPath}/teacher/run/shareprojectrun.html?runId=" + runId;
                var div = $('#shareDialog').html('<iframe id="shareIfrm" width="100%" height="100%"></iframe>');
                div.dialog({
                    modal: true,
                    width: '650',
                    height: '450',
                    title: title,
                    position: 'center',
                    close: function(){
                        $(this).html('');
                    },
                    buttons: {
                        Close: function(){$(this).dialog('close');}
                    }
                });
                $("#shareDialog > #shareIfrm").attr('src',path);
            });

            // setup edit run settings dialog
            $('.editRun').on('click',function(){
                var title = $(this).attr('title');
                var runId = $(this).attr('id').replace('editRun_','');
                var path = "${contextPath}/teacher/run/editrun.html?runId=" + runId;
                var div = $('#editRunDialog').html('<iframe id="editIfrm" width="100%" height="100%"></iframe>');
                div.dialog({
                    modal: true,
                    width: '600',
                    height: '400',
                    title: title,
                    position: 'center',
                    close: function(){
                        if(document.getElementById('editIfrm').contentWindow['runUpdated']){
                            window.location.reload();
                        }
                        $(this).html('');
                    },
                    buttons: {
                        Close: function(){
                            $(this).dialog('close');
                        }
                    }
                });
                $("#editRunDialog > #editIfrm").attr('src',path);
            });

            //setup archive and restore run dialogs
            $('.archiveRun, .activateRun').on('click',function(){
                var title = $(this).attr('title');
                if($(this).hasClass('archiveRun')){
                    var params = $(this).attr('id').replace('archiveRun_','');
                    var path = "${contextPath}/teacher/run/manage/archiveRun.html?" + params;
                } else if($(this).hasClass('activateRun')){
                    var params = $(this).attr('id').replace('activateRun_','');
                    var path = "${contextPath}/teacher/run/manage/startRun.html?" + params;
                }
                var div = $('#archiveRunDialog').html('<iframe id="archiveIfrm" width="100%" height="100%"></iframe>');
                div.dialog({
                    modal: true,
                    width: '600',
                    height: '450',
                    title: title,
                    position: 'center',
                    close: function(){
                        if(document.getElementById('archiveIfrm').contentWindow['refreshRequired']){
                            window.location.reload();
                        }
                        $(this).html('');
                    },
                    buttons: {
                        Close: function(){
                            $(this).dialog('close');
                        }
                    }
                });
                $("#archiveRunDialog > #archiveIfrm").attr('src',path);
            });

            // setup manage students dialog
            $('.manageStudents').on('click',function(){
                var title = $(this).attr('title');
                var params = $(this).attr('id').replace('manageStudents_','');
                var path = "${contextPath}/teacher/management/viewmystudents?" + params;
                var div = $('#manageStudentsDialog').html('<iframe id="manageStudentsIfrm" width="100%" height="100%"></iframe>');
                $('body').css('overflow','hidden');
                div.dialog({
                    modal: true,
                    width: $(window).width() - 32,
                    height: $(window).height() - 32,
                    title: title,
                    position: 'center',
                    beforeClose: function() {
                        // check for unsaved changes and alert user if necessary
                        if(document.getElementById('manageStudentsIfrm').contentWindow['unsavedChanges']){
                            var answer = confirm("Warning: You currently have unsaved changes to student teams. If you exit now, they will be discarded. To save your changes, choose 'Cancel' and click the 'SAVE CHANGES' button in the upper right corner.\n\nAre you sure you want to exit without saving?")
                            if(answer){
                                return true;
                            } else {
                                return false;
                            };
                        } else {
                            return true;
                        }
                    },
                    close: function(){
                        // refresh page if required (run title or student periods have been modified)
                        if(document.getElementById('manageStudentsIfrm').contentWindow['refreshRequired']){
                            window.location.reload();
                        }
                        $(this).html('');
                        $('body').css('overflow','auto');
                    },
                    buttons: {
                        Exit: function(){
                            $(this).dialog('close');
                        }
                    }
                });
                $("#manageStudentsDialog > #manageStudentsIfrm").attr('src',path);
            });





            var oTable = $('.runTable').dataTable({
                "sPaginationType": "full_numbers",
                "iDisplayLength": 10,
                "aLengthMenu": [[10, 25, 100, -1], [10, 25, 100, "All"]],
                "bSort": false,
                "oLanguage": {
                    "sInfo": "<spring:message code="datatable_info_showing"/> _START_-_END_ <spring:message code="of"/> _TOTAL_",
                    "sInfoEmpty": "<spring:message code="datatable_info_empty"/>",
                    "sInfoFiltered": "<spring:message code="datatable_info_filtered_post_matches"/>", // (from _MAX_ total)
                    "sLengthMenu": "<spring:message code="datatable_lengthLabel"/> _MENU_ <spring:message code="datatable_perPage"/>",
                    "sProcessing": "<spring:message code="processing"/>",
                    "sZeroRecords": "<spring:message code="datatable_noMatch"/>",
                    "sInfoPostFix":  "",
                    "sSearch": "<spring:message code="datatable_search"/>",
                    "sUrl": "",
                    "oPaginate": {
                        "sFirst":    "<spring:message code="datatable_paginate_first"/>",
                        "sPrevious": "<spring:message code="datatable_paginate_previous"/>",
                        "sNext":     "<spring:message code="datatable_paginate_next"/>",
                        "sLast":     "<spring:message code="datatable_paginate_last"/>"
                    }
                },
                "fnDrawCallback": function( oSettings ){
                    // automatically scroll to top on page change
                    var tableID = $(this).attr('id');
                    var targetOffset = $('#' + tableID).offset().top - 14;
                    if ($(window).scrollTop() > targetOffset){
                        $('html,body').scrollTop(targetOffset);
                    }
                },
                "sDom":'<"top"lip>rt<"bottom"ip><"clear">'
            });

            // define sort options
            var sortParams = {
                "items": [
                    {"label": "<spring:message code="teacher.management.projectruntabs.sort_AZ"/>", "column": 3, "direction": "desc" },
                    {"label": "<spring:message code="teacher.management.projectruntabs.sort_ZA"/>", "column": 3, "direction": "asc" },
                    {"label": "<spring:message code="teacher.management.projectruntabs.sort_NewOld"/>", "column": 0, "direction": "asc" },
                    {"label": "<spring:message code="teacher.management.projectruntabs.sort_OldNew"/>", "column": 0, "direction": "desc" }
                ]
            };

            // setup sorting
            function setSort(index,sortParams,wrapper) {
                if(sortParams.items.length){
                    // insert sort options into DOM
                    var sortHtml = '<div class="dataTables_sort"><spring:message code="datatable_sort"/> <select id="' + 'sort_' + index + '"  size="1">';
                    $.each(sortParams.items,function(){
                        sortHtml += '<option>' + this.label + '</option>';
                    });
                    sortHtml +=	'</select></div>';
                    $(wrapper).children('.top').prepend(sortHtml);

                    $('#sort_' + index).change(function(){
                        $.fn.dataTableExt.iApiIndex = index;
                        var i = $('option:selected', '#sort_' + index).index();
                        oTable.fnSort( [ [sortParams.items[i].column,sortParams.items[i].direction] ] );
                    });
                }
            };

            var i;
            for(i=0; i<oTable.length; i++){
                oTable.dataTableExt.iApiIndex = i;
                var wrapper = oTable.fnSettings().nTableWrapper;
                var table = oTable.fnSettings();
                var id = $(table.oInstance).attr('id');

                // Define FacetedFilter options
                var facets = new FacetedFilter( table, {
                    "bScroll": false,
                    "sClearFilterLabel": "<spring:message code="datatable_ff_filter_clear"/>",
                    "sClearSearchLabel": "<spring:message code="datatable_ff_search_clear"/>",
                    "sFilterLabel": "<spring:message code="datatable_ff_filter_label"/>",
                    "sSearchLabel": "<spring:message code="datatable_ff_search_label"/>",
                    "aSearchOpts": [
                        {
                            "identifier": "keyword", "label": "<spring:message code="datatable_ff_keyword_label"/> ", "column": 0, "maxlength": 50
                        },
                        {
                            "identifier": "period", "label": "<spring:message code="datatable_ff_period_label"/> ", "column": 7, "maxlength": 30,
                            "regexreplace": {"match": "/,\s*/gi", "replacement": " "},
                            "instructions": "<spring:message code="datatable_ff_period_instructions"/>"
                        }
                    ]
                });

                // add sort logic
                setSort(i,sortParams,wrapper);

                // reset cloumn widths on run tables (datatables seems to change these)
                $('.runHeader').width(215);
                $('.studentHeader').width(145);
                $('.teacherHeader').width(115);
                $('.toolsHeader').width(170);

                oTable.fnSort( [ [7,'desc'] ] );
            }

            // Make top header scroll with page
            var $stickyEl = $('.dataTables_wrapper .top');
            if($stickyEl.length>0){
                var elTop = $stickyEl.offset().top,
                        width = $stickyEl.width();
                $(window).scroll(function() {
                    var windowTop = $(window).scrollTop();
                    if (windowTop > elTop) {
                        $stickyEl.addClass('sticky');
                        $stickyEl.css('width',width);
                    } else {
                        $stickyEl.removeClass('sticky');
                        $stickyEl.css('width','auto');
                    }
                });
            }
        });
    </script>
</head>
<body>
<div id="pageWrapper">
    <div id="page">

        <div id="pageContent">

            <h5 style="color:#0000CC;"><a href="${contextPath}/admin"><spring:message code="returnToMainAdminPage" /></a></h5>

            <div class="contentPanel">
                <div class="panelHeader"><spring:message code="teacher.index.gradeAndManageClassroomRuns"/>
                    <span class="pageTitle"><spring:message code="header_location_admin"/></span>
                </div>

                <div class="panelContent">
                    <table id="currentRunTable" class="runTable" border="1" cellpadding="0" cellspacing="0">
                        <thead>
                        <tr>
                            <th style="width:220px;" class="tableHeaderMain runHeader"><spring:message code="teacher.management.projectruntabs.active_header" /></th>
                            <th style="width:155px;" class="tableHeaderMain studentHeader"><spring:message code="teacher.management.projectruntabs.studentManagement" /></th>
                            <th style="width:285px;" class="tableHeaderMain toolsHeader"><spring:message code="teacher.management.projectruntabs.tools" /></th>
                            <th style="display:none;" class="tableHeaderMain">run created</th>
                            <th style="display:none;" class="tableHeaderMain">run ended</th>
                            <th style="display:none;" class="tableHeaderMain">source</th>
                            <th style="display:none;" class="tableHeaderMain">ownership</th>
                            <th style="display:none;" class="tableHeaderMain">periods</th>
                        </tr>
                        </thead>
                        <tbody>
                        <c:if test="${fn:length(runList) > 0}">
                            <c:forEach var="run" items="${runList}">
                                <tr id="runTitleRow_${run.id}" class="runRow">
                                    <td>
                                        <div class="runTitle">${run.name}</div>
                                        <c:set var="ownership" value="owned" />
                                        <c:forEach var="sharedowner" items="${run.sharedowners}">
                                            <c:if test="${sharedowner == user}">
                                                <!-- the project run is shared with the logged-in user. -->
                                                <c:set var="ownership" value="shared" />
                                                <div class="sharedIcon">
                                                    <img src="${contextPath}/<spring:theme code="shared"/>" alt="shared project" /> <spring:message code="teacher.management.projectruntabs.ownedBy"/>
                                                        ${run.owner.userDetails.firstname} ${run.owner.userDetails.lastname}
                                                </div>
                                                <!-- let the user unshare self from the run. -->
                                                <a class="unshare" onClick="unshareFromRun('${run.id}','<spring:escapeBody javaScriptEscape="true">${run.name}</spring:escapeBody>');"><spring:message code="teacher.management.projectruntabs.unshare"/></a>
                                            </c:if>
                                        </c:forEach>

                                        <table class="runTitleTable">
                                            <tr>
                                                <th><spring:message code="teacher.management.projectruntabs.ownedBy" /></th>
                                                <td>
                                                        ${run.owner.userDetails.firstname} ${run.owner.userDetails.lastname}
                                                </td>
                                            <tr>
                                                <th><spring:message code="run_accessCode" /></th>
                                                <td class="accesscode">${run.runcode}</td>
                                            </tr>
                                            <tr>
                                                <th><spring:message code="run_id_label" /></th>
                                                <td>${run.id}</td>
                                            </tr>
                                            <tr>
                                                <th><spring:message code="teacher.management.projectruntabs.created"/></th>
                                                <td><fmt:formatDate value="${run.starttime}" type="date" dateStyle="medium" /></td>
                                            </tr>
                                            <c:set var="source" value="custom" />
                                            <c:if test="${run.project.familytag == 'TELS'}"> <!-- TODO: modify this to show when a run was generated from a library project -->
                                                <c:set var="source" value="library" />
                                            </c:if>
                                            <tr>
                                                <th><spring:message code="project_id"/></th>
                                                <td><span id="projectDetail_${run.project.id}" class="projectDetail" title="<spring:message code="project_details"/>">${run.project.id}</span></td>
                                            </tr>
                                            <tr>
                                                <c:if test="${run.project.parentProjectId != null}">
                                                    <th><spring:message code="teacher.management.projectruntabs.copyLabel"/></th>
                                                    <td><span id="projectDetail_${run.project.parentProjectId}" class="projectDetail" title="<spring:message code="project_details"/>">${run.project.parentProjectId}</span></td>
                                                </c:if>
                                            </tr>
                                        </table>
                                    </td>
                                    <td style="padding:.5em 0;" >
                                        <table class="currentRunInfoTable" border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <th class="tableInnerHeader"><spring:message code="run_period"/></th>
                                                <th class="tableInnerHeader"><spring:message code="student_cap_plural"/></th>
                                            </tr>
                                            <c:forEach var="period" items="${run.periods}">
                                                <tr>
                                                    <td style="width:35%;" class="tableInnerData">${period.name}</td>
                                                    <td style="width:65%;" class="tableInnerDataRight">
                                                        <a class="manageStudents" title="<spring:message code="teacher.management.projectruntabs.manageStudents"/>: ${run.name} (<spring:message code="run_id"/> ${run.id})" id="runId=${run.id}&periodName=${period.name}">${fn:length(period.members)}&nbsp;<spring:message code="teacher.management.projectruntabs.registered"/></a>
                                                    </td>
                                                </tr>
                                            </c:forEach>
                                            <tr><td colspan="2" class="manageStudentGroups"><a class="manageStudents" title="<spring:message code="teacher.management.projectruntabs.manageStudents"/>: ${run.name} (<spring:message code="run_id"/> ${run.id})" id="runId=${run.id}"><img class="icon" alt="groups" src="${contextPath}/<spring:theme code="connected"/>" /><span><spring:message code="teacher.management.projectruntabs.manageStudents"/></span></a></td></tr>
                                        </table>
                                    </td>
                                    <td>

                                        <ul class="actionList">
                                            <li><a class="classroomMonitor" wiseVersion="${run.project.wiseVersion == null ? 4 : run.project.wiseVersion}" runId="${run.id}" title="<spring:message code="teacher.management.projectruntabs.monitorTitle"/> ${run.name} (<spring:message code="run_id"/> ${run.id})" id="runId=${run.id}&gradingType=monitor"><img class="icon" alt="monitor" src="${contextPath}/<spring:theme code="bar_chart"/>" /><span><spring:message code="teacher.management.projectruntabs.gradingTool"/></span></a></li>
                                        </ul>
                                        <ul class="actionList">
                                            <li>
                                                <spring:message code="teacher.management.projectruntabs.projectLabel"/>&nbsp;<a href="${contextPath}/previewproject.html?projectId=${run.project.id}" target="_blank"><img class="icon" alt="preview" src="${contextPath}/<spring:theme code="screen"/>" /><span><spring:message code="preview"/></span></a>
                                                |&nbsp;<a onclick="if(confirm('<spring:message code="teacher.management.projectruntabs.editWarning"/>')){window.top.location='${contextPath}/author/authorproject.html?projectId=${run.project.id}';} return true;"><img class="icon" alt="edit" src="${contextPath}/<spring:theme code="edit"/>" /><span><spring:message code="teacher.management.projectruntabs.edit"/></span></a>
                                            </li>
                                        </ul>
                                    </td>
                                    <td style="display:none;">${run.starttime}</td>
                                    <td style="display:none;"></td>
                                    <td style="display:none;">${source}</td>
                                    <td style="display:none;">${ownership}</td>
                                    <td style="display:none;">
                                        <c:forEach var="period" items="${run.periods}">${period.name},</c:forEach>
                                    </td>
                                </tr>
                            </c:forEach>
                        </c:if>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <%@ include file="../../footer.jsp"%>
</div>

<div id="gradingDialog" class="dialog"></div>
<div id="shareDialog" class="dialog"></div>
<div id="editRunDialog" class="dialog"></div>
<div id="manageStudentsDialog" style="overflow:hidden;" class="dialog"></div>
<div id="archiveRunDialog" style="overflow:hidden;" class="dialog"></div>
</body>
</html>
