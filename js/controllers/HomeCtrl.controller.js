(function() {
	'use strict';

	
	angular.module('ytorg').controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['oauth2Provider', '$state'];
	function HomeCtrl(oauth2Provider, $state) {
		var vm = this;
		vm.signedIn = false;
		vm.getStarted = getStarted;

		vm.myLogin = function() {
			var scopes = ['https://www.googleapis.com/auth/youtube.readonly']
			oauth2Provider.setScopes(scopes);
			//do a check right here on the token. See how much time is left and whether it has the necessary scopes. If not, have them log in again.
			//Probably put that check in the oauth2provider factory and call the login there as well instead of here.
			oauth2Provider.login().then(function(data){//this login and everything should be on the modal on the execute button
				vm.signedIn = oauth2Provider.signedIn();
			});
		}

		vm.getToken = function() {
			console.log(oauth2Provider.getToken());
		}

		vm.logout = function() {
			oauth2Provider.logout();
		}

		function getStarted() {
			$state.go('loading');
		}
	};
})();