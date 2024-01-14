(function() {
	'use strict';

	angular.module('ytorg').config(configure);

	function configure ($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('home', {
				url: '/',
				// templateUrl: '/ytorgv2/partials/home.html', //test
				templateUrl: '/tubez/partials/home.html', //live
				controller: 'HomeCtrl as vm'
			})		
			.state('loading', {
				url: '/loading',
				// templateUrl: '/ytorgv2/partials/loading.html', //test
				templateUrl: '/tubez/partials/loading.html', //live
				controller: 'DataCtrl as vm'//change DataCtrl to simply start loading things with an activate function
				// data: {
				// 	rule: function() {
				// 		return oauth2Provider.signedIn();
				//  	}
				//  }
			})			
			.state('duplicates', {
				url: '/duplicates',
				// templateUrl: '/ytorgv2/partials/duplicates.html', //test
				templateUrl: '/tubez/partials/duplicates.html', //live
				controller: 'DuplicatesCtrl as vm'
			})
			.state('organizer', {
				url: '/organizer',
				// templateUrl: '/ytorgv2/partials/organizer.html', //test
				templateUrl: '/tubez/partials/organizer.html', //live
				controller: 'OrganizerCtrl as vm'
			})
	}

})();
