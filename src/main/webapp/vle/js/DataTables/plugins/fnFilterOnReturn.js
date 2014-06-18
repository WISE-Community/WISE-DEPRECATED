/**
 * This plug-in removes the default behaviour of DataTables to filter on each
 * keypress, and replaces with it the requirement to press the enter key to
 * perform the filter.
 *
 *  @name fnFilterOnReturn
 *  @summary Require the return key to be pressed to filter a table
 *  @author [Jon Ranes](http://www.mvccms.com/)
 *  @author [Jonathan Lim-Breitbart](http://jbreitbart.net) - modified to include 'blur' event and only filters when search input changes
 *
 *  @returns {jQuery} jQuery instance
 *
 *  @example
 *    $(document).ready(function() {
 *        $('.dataTable').dataTable().fnFilterOnReturn();
 *    } );
 */

jQuery.fn.dataTableExt.oApi.fnFilterOnReturn = function (oSettings) {
	var _that = this;

	this.each(function (i) {
		$.fn.dataTableExt.iApiIndex = i;
		var $this = this;
		var anControl = $('input', _that.fnSettings().aanFeatures.f);
		anControl
			.off('keyup search input')
			.on('keypress blur', function (e) {
				if (e.type === 'blur' || e.which === 13) {
					$.fn.dataTableExt.iApiIndex = i;
					var val = anControl.val();
					if(val !== _that.api().settings()[0].oPreviousSearch.sSearch) {
						_that.fnFilter(val);
					}
				}
			});
		return this;
	});
	return this;
};

/**
 * This plug-in removes the default behaviour of DataTables to filter on each
 * keypress, and replaces with it the requirement to press the enter key to
 * perform the filter.
 *
 *  @name fnFilterOnReturn
 *  @summary Require the return key to be pressed to filter a table
 *  @author [Jon Ranes](http://www.mvccms.com/)
 *  @author [Jonathan Lim-Breitbart](http://jbreitbart.net)
 *  Modified to include 'blur' event and only filters when search input changes.
 *  Also customized for WISE classroom monitor grading displays
 *
 *  @returns {jQuery} jQuery instance
 *
 *  @example
 *    $(document).ready(function() {
 *        $('.dataTable').dataTable().fnFilterOnReturn();
 *    } );
 */

jQuery.fn.dataTableExt.oApi.fnFilterOnReturnGrading = function (oSettings) {
	var _that = this;

	this.each(function (i) {
		$.fn.dataTableExt.iApiIndex = i;
		var $this = this;
		var anControl = $('input', _that.fnSettings().aanFeatures.f);
		anControl
			.off('keyup search input')
			.on('keypress blur', function (e) {
				if (e.type === 'blur' || e.which === 13) {
					$.fn.dataTableExt.iApiIndex = i;
					var val = anControl.val();
					if(val !== _that.api().settings()[0].oPreviousSearch.sSearch) {
						if (val.match(/\S/)) {
							// non-white space string, so clear column filters (to show revisions in search results)
							//_that.api().search( '' ).columns().search( '' );
							_that.fnFilter(val);
							$('.revision', _that).show();
						} else {
							// empty string, so re-institute column filter to hide revisions
							//_that.api().search( '' ).columns( 11 ).search( 'true' );
							_that.fnFilter(val);
							$('.revision', _that).hide();
						}
					}
				}
			});
		return this;
	});
	return this;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/js/DataTables/plugins/fnFilterOnReturn.js');
}