(function() {
	'use strict';

	
	angular.module('ytorg').controller('NavCtrl', NavCtrl);

	NavCtrl.$inject = ['$scope', 'oauth2Provider', 'newDataFactory'];
	function NavCtrl($scope, oauth2Provider, newDataFactory) {
		var vm = this;
		vm.signedInStatus = false;
		vm.getChannelName = getChannelName;
		vm.channelName = '';
		vm.signedIn = signedIn;
		//vm.channelTitle = '';
		vm.counter = 0;

		function signedIn() {
			vm.signedInStatus = oauth2Provider.signedIn();//Better way to do this? Would be nice if I could watch the signedIn Function in the watch below.
			return oauth2Provider.signedIn();
		}

		function getChannelName() {
			newDataFactory.requestChannel().then(function(response){
				console.log(response);
				vm.channelName = newDataFactory.getChannel().snippet.title;
			});
		}

		$scope.$watch('vm.signedInStatus', function(newValue, oldValue) {
			if(newValue){
				vm.getChannelName();
				console.log('got channel');
				console.log(vm.counter++);
			}
		});		




	};
})();