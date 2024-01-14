(function() {
	'use strict';
	angular.module('ytorg', ["isteven-multi-select","ui.checkbox","ui.router","angular-progress-arc","isteven-multi-select","ui.bootstrap","jQueryScrollbar","ngDropdowns"]);

	// angular.module('ytorg', ["isteven-multi-select","ngSanitize","angular-progress-arc"]);



	angular.module('ytorg').run(function($rootScope, $state, oauth2Provider) {
		$rootScope.$on('$stateChangeStart', function(e, to) {
			console.log(to);
			if(to.name === 'loading'){
				// if (!angular.isFunction(to.data.rule)) return;

				// var result = to.data.rule();
				if (!oauth2Provider.signedIn()) {
					e.preventDefault();
					// Optionally set option.notify to false if you don't want 
					// to retrigger another $stateChangeStart event
					$state.go('home', {notify: false});
				}
			}
		});
	});











})();