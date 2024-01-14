(function() {

	angular.module('ytorg').factory('testdataFactory', testdataFactory);

	testdataFactory.$inject = ['$http'];
	function testdataFactory($http) {
		return {
			requestTestData: requestTestData
		}

		function requestTestData() {
			var url = 'bkeasler.json'


		
			return $http({
				method: 'GET',
				url: url
			}).then(function successCallback(response) {
				console.log(response);
					return response;
			}, function errorCallback(response) {
				console.log(response);
			});
		}
	}
})();

