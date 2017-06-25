'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var Sticky = function Sticky($mdSticky) {
	return {
		restrict: 'A',
		link: function link(scope, element) {
			$mdSticky(scope, element);
		}
	};
};

Sticky.$inject = ['$mdSticky'];

exports.default = Sticky;
//# sourceMappingURL=sticky.js.map