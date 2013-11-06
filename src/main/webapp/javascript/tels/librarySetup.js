jQuery.i18n.properties({
    name:'ui-html', 
    path:'/resources/messages/tels/', 
    mode:'both'
});

$(document).ready(function() {
		
	// Show child link for projects with children
	$("div.projectBox").not(".childProject").each(function(){
		var id = $(this).attr('id').replace('projectBox_','');
		var numChildren = $('.root_' + id).length;
		if(numChildren > 0){
			var copyLabel = " Copies";
			if (numChildren == 1) {
				copyLabel = " Copy";
			}
			var $childLink = '<div style="float:left;"><a id="childToggle_' + id + '" class="childToggle">' + numChildren + copyLabel + ' +</a></div>';
			$('#projectBox_' + id + ' tr.detailsLinks td').prepend($childLink);
			$('#childToggle_' + id).on('click',function(){
				if ($('#childToggle_' + id).hasClass('expanded')){
					toggleChildren(id,false);
				} else {
					toggleChildren(id,true);
				}
				
			});
		}
	});
	
	var otable = $('#myProjects').dataTable({
		"sPaginationType": "full_numbers",
		"iDisplayLength": 10,
		//"aLengthMenu": [[5, 10, 25, -1], [5, 10, 25, "All"]],
		//"bSort": false,
		"aaSortingFixed": [ [11,'desc'], [12,'asc'], [13,'desc'], [1,'desc'], [10,'desc'], [8,'desc'] ],
		"oLanguage": {
			//"sInfo": "_TOTAL_ <spring:message code="teacher.run.myprojectruns.datatables.16"/>",
			"sInfo": jQuery.i18n.prop('teacher.run.myprojectruns.datatables.1') + " _START_-_END_ " + jQuery.i18n.prop('teacher.run.myprojectruns.datatables.2') + " _TOTAL_",
			"sInfoEmpty": jQuery.i18n.prop('teacher.run.myprojectruns.datatables.3'),
			"sInfoFiltered": jQuery.i18n.prop('teacher.run.myprojectruns.datatables.17') + " _MAX_ " + jQuery.i18n.prop('teacher.run.myprojectruns.datatables.18'), // (from _MAX_ total)
			//"sLengthMenu": "<spring:message code="teacher.run.myprojectruns.datatables.5"/> _MENU_ <spring:message code="teacher.run.myprojectruns.datatables.6"/>",
			"sProcessing": jQuery.i18n.prop('teacher.run.myprojectruns.datatables.7'),
			"sZeroRecords": jQuery.i18n.prop('teacher.run.myprojectruns.datatables.8'),
			"sInfoPostFix":  jQuery.i18n.prop('teacher.run.myprojectruns.datatables.9'),
			"sSearch": jQuery.i18n.prop('teacher.run.myprojectruns.datatables.10'),
			"sUrl": jQuery.i18n.prop('teacher.run.myprojectruns.datatables.11'),
			"oPaginate": {
				"sFirst":    jQuery.i18n.prop('teacher.run.myprojectruns.datatables.12'),
				"sPrevious": jQuery.i18n.prop('teacher.run.myprojectruns.datatables.13'),
				"sNext":     jQuery.i18n.prop('teacher.run.myprojectruns.datatables.14'),
				"sLast":     jQuery.i18n.prop('teacher.run.myprojectruns.datatables.15')
			}
		},
		"fnDrawCallback": function ( oSettings ) {
			var filtered = false;
			for(iCol = 0; iCol < oSettings.aoPreSearchCols.length; iCol++) {
				if (oSettings.aoPreSearchCols[ iCol ].sSearch != '' && oSettings.aoPreSearchCols[ iCol ].sSearch != null) {
					filtered = true;
				}
			}
			if(filtered){
				// show all children
				$('.childToggle').each(function(){
					var id = $(this).attr('id').replace('childToggle_','');
					toggleChildren(id,true);
				});
			} else {
				// hide all children
				$('.childToggle').each(function(){
					var id = $(this).attr('id').replace('childToggle_','');
					toggleChildren(id,false);
				});
			}
			
			// hide all project details
			/*$('.projectBox').each(function(){
				var id = $(this).attr('id').replace('projectBox_','');
				toggleDetails(id,false);
			});*/
		},
		"sDom":'<"top"ip<"clear">>rt<"clear">'
		//"sDom":'<"top"lip<"clear">>rt<"bottom"ip><"clear">'
	});
	
	// Define FacetedFilter options
	var facets = new FacetedFilter( otable.fnSettings(), {
		"bScroll": false,
		"sClearFilterLabel": "Clear",
		"aSearchOpts": [
			{
				"identifier": jQuery.i18n.prop('teacher.run.myprojectruns.search.1a'), "label": jQuery.i18n.prop('teacher.run.myprojectruns.search.1b'), "column": 0, "maxlength": 50
			}
		 ],
		"aFilterOpts": [
			{
				"identifier": "subject", "label": "Subject:", "column": 3,
				"options": [
					{"query": "Earth Science", "display": "Earth Science"}, // TODO: modify FacetedFilter plugin to only require a query for each filter, use query as display if display option is not set
					{"query": "General Science", "display": "General Science"},
					{"query": "Life Science", "display": "Life Science"},
					{"query": "Physical Science", "display": "Physical Science"},
					{"query": "Biology", "display": "Biology"},
					{"query": "Chemistry", "display": "Chemistry"},
					{"query": "Physics", "display": "Physics"},
				]
			},
			{
				"identifier": "grade", "label": "Grade Level:", "column": 4,
				"options": [
					{"query": "3-5", "display": "3-5"},
					{"query": "6-8", "display": "6-8"},
					{"query": "6-12", "display": "6-12"},
					{"query": "9-12", "display": "9-12"}
				]
			},
			{
				"identifier": "duration", "label": "Duration:", "column": 5,
				"options": [
					{"query": "2-3 Hours", "display": "2-3 Hours"},
					{"query": "4-5 Hours", "display": "4-5 Hours"},
					{"query": "6-7 Hours", "display": "6-7 Hours"},
					{"query": "8-9 Hours", "display": "8-9 Hours"},
					{"query": "10-11 Hours", "display": "10-11 Hours"},
					{"query": "Over 12 Hours", "display": "12+ Hours"}
				]
			},
			{
				"identifier": "language", "label": "Language:", "column": 7,
				"options": [
					{"query": "Chinese", "display": "Chinese"},
					{"query": "English", "display": "English"},
					{"query": "Hebrew", "display": "Hebrew"},
					{"query": "Japanese", "display": "Japanese"},
					{"query": "Spanish", "display": "Spanish"}
				]
			}
		]
	});
	
	// Set up more details toggle click action for each project
	$('.detailsToggle, .projectTitle').on("click",function(){
		var id;
		if($(this).hasClass('detailsToggle')){
			id = $(this).attr('id').replace('detailsToggle_','');
		} else if($(this).hasClass('projectTitle')){
			id = $(this).attr('id').replace('project_','');
		}
		
		if($('#detailsToggle_' + id).hasClass('expanded')){
			toggleDetails(id,false);
		} else {
			toggleDetails(id,true);
		}
		
		
	});
	
	// Set up view lesson plan click action for each project
	$('a.viewLesson').on('click',function(){
		var id = $(this).attr('id').replace('viewLesson_','');
		$('#lessonPlan_' + id).dialog({
			width: 800,
			height: 400, // TODO: modify so height is set to 'auto', but if content results in dialog taller than window on load, set height smaller than window
			buttons: { "Close": function() { $(this).dialog("close"); } }
		});
	});
	
	// Set up print lesson click action for each project
	$('.printLesson').on('click',function(){
		var id = $(this).attr('id').replace('printLesson_','');
		var printstyle = jQuery.i18n.prop('teacherrunstylesheet'); // TODO: create print-optimized stylesheet
		$('#lessonPlan_' + id).printElement({
			pageTitle:'LessonPlan-WISE4-Project-' + id + '.html',
			overrideElementCSS:[{href:printstyle, media:'print'}] // TODO: create print-optimized stylesheet
		});
	});
	
});

// toggle child projects' visibility
function toggleChildren(id,open){
	var text = $('#childToggle_' + id).text();
	if(open){
		$('#childToggle_' + id).addClass('expanded');
		$('.root_' + id).slideDown('fast');
		text = text.replace('+','-');
		$('#childToggle_' + id).text(text);
	} else {
		$('#childToggle_' + id).removeClass('expanded');
		$('.root_' + id).slideUp('fast');
		text = text.replace('-','+');
		$('#childToggle_' + id).text(text);
	}
};

// toggle project details visiblity
function toggleDetails(id,open){
	if (open){
		if($('#projectBox_' + id).hasClass('childProject')){
			$('#projectBox_' + id).css('background-color','#fdfdfd');
			$('#projectBox_' + id + ' .projectSummary').slideDown('fast');
			$('#projectBox_' + id + ' .detailsLinks').slideDown('fast');
		} else {
			$('#summaryText_' + id + ' .ellipsis').remove();
			$('#summaryText_' + id + ' .truncated').slideDown('fast');
			$('#summaryText_' + id + ' .truncated').css('display','inline');
		}
		$('#detailsToggle_' + id).addClass('expanded').text('Details -');
		$('#details_' + id).slideDown('fast');
	} else {
		debugger;
		if($('#projectBox_' + id).hasClass('childProject')){
			$('#projectBox_' + id).css('background-color','#f7f7f7');
			$('#projectBox_' + id + ' .projectSummary').slideUp('fast');
			$('#projectBox_' + id + ' .detailsLinks').slideUp('fast');
		} else {
			$('#summaryText_' + id + ' .truncated').before('<span class="ellipsis">...</span>');
			$('#summaryText_' + id + ' .truncated').slideUp('fast');
		}
		$('#details_' + id).slideUp('fast');
		$('#detailsToggle_' + id).removeClass('expanded').text('Details +');
	}
};