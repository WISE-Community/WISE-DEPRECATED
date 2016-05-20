angular.module('ephox.textboxio').factory('tbioConfigFactory', ['$log', function ($log) {
	//    $log.log('Loading tbioConfigFactory');
	var configurations = {};

	configurations.default = {
		//        basePath: '/sites/all/libraries/textboxio/resources',
		css: {
			stylesheets: [''],
			styles: [
				{
					rule: 'p',
					text: 'block.p'
					},
				{
					rule: 'h1',
					text: 'block.h1'
					},
				{
					rule: 'h2',
					text: 'block.h2'
					},
				{
					rule: 'h3',
					text: 'block.h3'
					},
				{
					rule: 'h4',
					text: 'block.h4'
					},
				{
					rule: 'div',
					text: 'block.div'
					},
				{
					rule: 'pre',
					text: 'block.pre'
					}
			]
		},
		codeview: {
			enabled: true,
			showButton: true
		},
		images: {
			// upload : {},
			allowLocal: true
		},
		languages: ['en', 'es', 'fr', 'de', 'pt', 'zh'],
		// locale : '', // Default locale is inferred from client browser
		paste: {
			style: 'prompt'
		},
		// spelling : {},
		ui: {
			toolbar: {
				items: ['undo', 'insert', 'style', 'emphasis', 'align', 'listindent', 'format', 'tools']
			}
		}
	};

	configurations.simple = {
		//        basePath: '/sites/all/libraries/textboxio/resources',
		css: {
			stylesheets: [''],
			styles: [
				{
					rule: 'p',
					text: 'block.p'
				},
				{
					rule: 'div',
					text: 'block.div'
				},
				{
					rule: 'h1',
					text: 'block.h1'
				},
				{
					rule: 'h2',
					text: 'block.h2'
				},
				{
					rule: 'h3',
					text: 'block.h3'
				},
				{
					rule: 'h4',
					text: 'block.h4'
				}
			]
		},
		codeview: {
			enabled: false,
			showButton: false
		},
		images: {
			// upload : {},
			allowLocal: true
		},
		languages: ['en', 'es', 'fr', 'de', 'pt', 'zh'],
		// locale : '', // Default locale is inferred from client browser
		paste: {
			style: 'clean'
		},
		// spelling : {},
		ui: {
			toolbar: {
				items : [
					{
						label: 'Undo and Redo group',
						items: [ 'undo', 'redo' ]
					},
					'emphasis'
				]
			}
		}
	};

	return configurations;
}]);
