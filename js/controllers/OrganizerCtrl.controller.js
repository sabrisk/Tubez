(function() {
	'use strict';

	angular.module('ytorg').controller('OrganizerCtrl', OrganizerCtrl);

//There could be an even higher level controller to handle multiple channels. You could store channels on that controller's scope.
	OrganizerCtrl.$inject = ['$scope', 'newDataFactory', '$state', '$uibModal', 'modalDataFactory'];
	function OrganizerCtrl($scope, newDataFactory, $state, $uibModal, modalDataFactory) {
		var vm = this;

		vm.playlist = null;
		vm.activate = activate;
		vm.action = action;
		vm.open = open;
		vm.showActions = showActions;

		vm.playlistSelectBox = newDataFactory.getPlaylists().map(function(playlist){ 
									return {
										id: playlist.id,
										name: playlist.snippet.title,
										ticked: false
									}
								});

		$scope.destPlaylistSelectBox = [];

		$scope.copyPlaylistSelectSelected = {};//change these to vm.
		$scope.movePlaylistSelectSelected = {};

		$scope.someMethod = function(selected) {
			console.log(selected);

		}

		vm.outputBrowsers = [];
		vm.playlistClick = playlistClick;

		vm.activate();

		function activate(){
			newDataFactory.setVideoTags(newDataFactory.getChannel());
		}

		function action(destPlaylistSelected, action) {

			modalDataFactory.requestModalData().then(function(results){
				console.log(results);

				var modalAction = action;
				var destPlaylist = null;
				var videosToProcess = newDataFactory.getSelectedVideos(vm.playlist);
				
				if(destPlaylistSelected){
					destPlaylist = newDataFactory.getPlaylist(destPlaylistSelected.id);
				}

				if(action === "COPY" || action === "MOVE"){
					var possibleDupVideos = newDataFactory.getPossibleDuplicates(newDataFactory.getSelectedVideos(vm.playlist), destPlaylist);

					if(possibleDupVideos.length){
						modalAction = 'NEWDUPS';
						videosToProcess = possibleDupVideos;

					}
				}

				var modalData = null;
				for (var i = 0; i < results.length; i++) {
					if(results[i].action === modalAction) {
						modalData = results[i];
						break;
					}
				}

				vm.open(modalData, videosToProcess, vm.playlist, destPlaylist).then(function(result){
					console.log(result);
				});



			});





		}

		function open(modalData, videosToProcess, srcPlaylist, destPlaylist) {
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
							selectedVideos: videosToProcess, //Call it videosToProcess since sometimes new duplicates to be delselected are passed.
							srcPlaylist: srcPlaylist,
							destPlaylist: destPlaylist
						}
					}
				}
			});
			return modalInstance.result.then(function (result) {
				//vm.selected = selectedItem;
				return result;
			}, function () {
				// $log.info('Modal dismissed at: ' + new Date());
			});
		}

		function showActions() {
			var showActions = false;
			if(vm.playlist !== null) {
				var videoArr = vm.playlist.videos;
				for (var i = 0; i < videoArr.length; i++) {
					if(videoArr[i].checkboxModel){
						showActions = true;
						break;
					}
				}

			}
			else {
				showActions = false;
			}
			return showActions;
		}

		function playlistClick(data){
			vm.playlist = newDataFactory.getPlaylist(data.id);

			$scope.destPlaylistSelectBox = newDataFactory.getPlaylists().reduce(function(filteredPlaylists, playlist) {
				if (playlist.id === vm.playlist.id) {
					return filteredPlaylists;
				}
				return filteredPlaylists.concat({
										id: playlist.id,
										name: playlist.snippet.title,
										ticked: false
									});
			}, []);
		}		
	}
})();
