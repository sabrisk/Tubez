(function() {

	angular.module('ytorg').factory('modalDataFactory', modalDataFactory);

	modalDataFactory.$inject = ['$http','$q'];
	function modalDataFactory($http, $q) {

		var modalData = null;
		return {
			requestModalData: requestModalData
		}

		function requestModalData() { 
			if(modalData) {
				return $q.resolve(modalData);
			}
			else {
				return $http({
					method: 'GET',
					url: "JSON/modaldata.json"
				}).then(function successCallback(response) {
					console.log(response);
					modalData = response.data.results;
					return modalData;
				});
			}
		}
	}
})();

					// for (var i = 0; i < results.length; i++) {
					// 	if( results[i].action === vm.action) {
					// 		// $scope.$apply(function () {
					// 		vm.modalTitle = results[i].title;
					// 		vm.actionMessage = results[i].message;
					// 		vm.executeButtonText = results[i].executeButtonText;
					// 		vm.showCopyStatus = results[i].showCopyStatus;
					// 		vm.showRemoveStatus = results[i].showRemoveStatus;    
					// 		// });
					// 		break;
					// 	}
					// }