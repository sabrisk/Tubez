(function() {
	'use strict';

	angular.module('ytorg').provider('settingsProvider', settingsProvider);

	settingsProvider.$inject = [];
	function settingsProvider(){


		var vm = this;
		var settings = {
			environment: 'PROD'
		}

		return {
			getURLRoot: getURLRoot
		}

		function getURLRoot() {
			var URLRoot = '';
			switch (settings.environment) {
				case 'PROD':
					URLRoot = '/'
					break;
				case 'DEV':
					URLRoot = '/ytorg/'
					break;
				default:
				console.log('Error: No environment found to set URLRoot for application');
			}

			return URLRoot;
		}
	}
})();