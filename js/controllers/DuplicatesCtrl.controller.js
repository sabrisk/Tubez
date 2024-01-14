(function() {
	'use strict';

	angular.module('ytorg').controller('DuplicatesCtrl', DuplicatesCtrl);








//There could be an even higher level controller to handle multiple channels. You could store channels on that controller's scope.
	DuplicatesCtrl.$inject = ['$scope', 'newDataFactory', 'oauth2Provider', '$state', '$uibModal', 'modalDataFactory'];
	function DuplicatesCtrl($scope, newDataFactory, oauth2Provider, $state, $uibModal, modalDataFactory) {
		var vm = this;

		vm.channel = {};///for testing... this is not the data factory channel!
		vm.activate = activate;
		vm.deleteDuplicates = deleteDuplicates;
		vm.open = open;
		// vm.updatePlaylists = updatePlaylists;
		// vm.requestVideos = requestVideos;

		vm.activate();

		function activate(){
			vm.channel = newDataFactory.getChannel();
		}

		function deleteDuplicates() {
			// var scopes = ['https://www.googleapis.com/auth/youtube']
			// oauth2Provider.setScopes(scopes);
			// oauth2Provider.login().then(function(data){///this login can be removed since this is being done in the modal for duplicates
			// 	console.log(data);

				//insert function here that returns a list of duplicates (maybe by separating delete duplicate code in factory). Then put that list into a confirmation modal.
				//Only delete the duplicates if the user confirms that they want to delete everything in that list. Or maybe just display a confirmation modal without listing
				//the duplicates since they have a chance to review them all right on the page.
				
				// dataFactory.deleteDuplicates().then(function(data){
				// 	vm.updatePlaylists();
				// });

			modalDataFactory.requestModalData().then(function(results){
				var modalAction = "DUPLICATES";
				var srcPlaylist = null;
				var destPlaylist = null;


				var modalData = null;
				for (var i = 0; i < results.length; i++) {
					if(results[i].action === modalAction) {
						modalData = results[i];
						break;
					}
				}

				vm.open(modalData, newDataFactory.getSelectedDuplicateVideos(newDataFactory.getChannel()), srcPlaylist, destPlaylist);


			});


			// });
		}

				
		function open(modalData, selectedDuplicateVideos, srcPlaylist, destPlaylist) {
			var modalInstance = $uibModal.open({
				animation: true,
				ariaLabelledBy: 'modal-title',
				ariaDescribedBy: 'modal-body',
				templateUrl: 'partials/modal.html',
				controller: 'ModalCtrl',
				controllerAs: 'vm',
				backdrop  : 'static',
				keyboard: false,
				size: 'lg',
				resolve: {
					batchObject: function () {
						return {
							modalData: modalData,
							selectedVideos: selectedDuplicateVideos,
							srcPlaylist: srcPlaylist,
							destPlaylist: destPlaylist
						}
					}
				}
			});
			modalInstance.result.then(function (selectedItem) {
				vm.selected = selectedItem;
			}, function () {
				// $log.info('Modal dismissed at: ' + new Date());
			});
		}

		// function updatePlaylists() {
		// 	angular.forEach(dataFactory.getPlaylists(), function(playlist, i) {
		// 		if(playlist.needsUpdating) {
		// 			vm.requestVideos(playlist.id, null);
		// 		}
				
		// 	});			
		// }

		// function requestVideos(playlistId, nextPageToken) {
		// 	dataFactory.requestVideos(playlistId, nextPageToken).then(function(response){
		// 		if(response.data.nextPageToken){
		// 			vm.requestVideos(playlistId, response.data.nextPageToken);
		// 		} 
		// 		else {
		// 			//This playlist's videos done loading.
		// 			if(dataFactory.allVideosLoaded()) {
		// 				console.log('ALL VIDEOS LOADED');
		// 				if(dataFactory.containsDuplicates()){
		// 					$state.go('duplicates');
		// 				}
		// 				else{
		// 					$state.go('organizer');
		// 				}
		// 				//vm.stringified = JSON.stringify(dataFactory.getChannel(), null, 4);
		// 			}
		// 		}
		// 	});
		// }

	}
})();
