'use strict';

const Sticky = ($mdSticky) => {
	return {
		restrict : 'A',
		link : function(scope, element) {
			$mdSticky(scope, element);
		}
	}
}

Sticky.$inject = [ '$mdSticky' ];

export default Sticky;
