(function() {
	'use strict';

	angular.module('ytorg').controller('ModalCtrl', ModalCtrl);


	ModalCtrl.$inject = ['$scope', '$uibModalInstance', 'batchObject', 'newDataFactory', 'oauth2Provider', '$state', '$interpolate'];
	function ModalCtrl($scope, $uibModalInstance, batchObject, newDataFactory, oauth2Provider, $state, $interpolate) {

		var vm = this;
		var modalData = batchObject.modalData;
		var action = modalData.action;
		var srcPlaylist = batchObject.srcPlaylist;
		var destPlaylist = batchObject.destPlaylist;

		vm.srcPlaylistName = "Undefined";
		vm.destPlaylistName = "Undefined";

		if(srcPlaylist) {
			vm.srcPlaylistName = srcPlaylist.snippet.title;
		}
		if(destPlaylist) {
			vm.destPlaylistName = destPlaylist.snippet.title;
		}		
		vm.videos = batchObject.selectedVideos;

		//Modal properties
		vm.modalTitle = modalData.title;
		vm.actionMessage = $interpolate(modalData.message)($scope);
		vm.executeButtonText = modalData.executeButtonText;
		vm.showCopyStatus = modalData.showCopyStatus;
		vm.showRemoveStatus = modalData.showRemoveStatus;    


		vm.showStatus = showStatus;
		vm.showBothStatuses = showBothStatuses
		vm.executeStatus = 'NOTRUN';
		vm.showExecuteButton = showExecuteButton;
		vm.showCloseButton = showCloseButton;
		vm.showCancelButton = showCancelButton;
				
		//Functions
		vm.execute = execute;
		vm.executeAction = null;

		vm.copyVideos = copyVideos
		vm.moveVideos = moveVideos
		vm.deleteVideos = deleteVideos
		vm.deselectVideos = deselectVideos

		vm.updatePlaylists = updatePlaylists;

		vm.close = function () {
			if(action === "COPY" || action === "MOVE"){
				newDataFactory.nullifyVideoCopyResponses(vm.videos);
			}
			$uibModalInstance.close('closed');
		};

		vm.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
		
		$scope.jqueryScrollbarOptions = {
			"onScroll":function(y, x){
				// if(y.scroll == y.maxScroll){
				// 	alert('Scrolled to bottom');
				// }
			}
		};

		function showStatus() {
			return vm.showCopyStatus || vm.showRemoveStatus;
		}

		function showBothStatuses() {
			return vm.showCopyStatus && vm.showRemoveStatus;
		}

		function showExecuteButton() {
			var showButton = false;
			if(vm.executeStatus === 'NOTRUN'){
				showButton = true;
			}
			return showButton;
		}

		function showCloseButton() {
			var showButton = false;
			if(vm.executeStatus === 'COMPLETE'){
				showButton = true;
			}
			return showButton;
		}

		function showCancelButton() {
			var showButton = false;
			if(vm.executeStatus === 'NOTRUN'){
				showButton = true;
			}
			return showButton;
		}


		function execute(){
			
			if(action !== "NEWDUPS") {
				var scopes = ['https://www.googleapis.com/auth/youtube'];

				oauth2Provider.checkScopeGranted(scopes,'test');
				oauth2Provider.setScopes(scopes);
				//do a check right here on the token. See how much time is left and whether it has the necessary scopes. If not, have them log in again.
				//Probably put that check in the oauth2provider factory and call the login there as well instead of here.
				oauth2Provider.login().then(function(data){//this login and everything should be on the modal on the execute button
					console.log("INSIDE THE THEN FOR EXECUTE()");
					oauth2Provider.checkScopeGranted(scopes,'test');
					vm.executeStatus = "PENDING";
					switch (action) {
						case "COPY":
							vm.copyVideos(vm.videos, destPlaylist);
							break;
						case "MOVE":
							vm.moveVideos(vm.videos, srcPlaylist, destPlaylist);
							// vm.playlistsToUpdate.push(srcPlaylist);
							// vm.playlistsToUpdate.push(destPlaylist);
							break;
						case "REMOVE":
							vm.deleteVideos(vm.videos, [srcPlaylist]);
							break;
						case "DUPLICATES":
							vm.deleteVideos(vm.videos, newDataFactory.getPlaylistsWithDuplicates(newDataFactory.getChannel()));
							break;
						default:
						console.log("no match");
					}
				});
			}
			else {
				console.log("NEW DUPLICATES");
				vm.deselectVideos(vm.videos, destPlaylist);
			}
		}

		function copyVideos(videoArr, destPlaylist) { 
			var position = 0;
			newDataFactory.insertVideos(videoArr, destPlaylist, position).then(function(result) {
				console.log('copy finished');

				vm.updatePlaylists([destPlaylist]);
				vm.executeStatus = "COMPLETE";				
			});
		}


		function moveVideos(videoArr, srcPlaylist, destPlaylist) { 
			var position = 0;
			newDataFactory.moveVideos(videoArr, srcPlaylist, destPlaylist, position).then(function(result) {
				console.log('move finished');

				vm.updatePlaylists([srcPlaylist, destPlaylist]);
				vm.executeStatus = "COMPLETE";				
			});
		}

		// function moveVideos(videoArr, index) {
			// var videoId = videoArr[index].snippet.resourceId.videoId;
			// var position = index;
			// dataFactory.copyVideo(vm.destPlaylistId, videoId, position).then(function(response){

			// 	vm.videos[vm.index].insertResponse = response;

			// 	if(response.data.error === undefined){///don't do this if the copy fails
			// 		var srcPlaylistId = vm.videos[vm.index].snippet.playlistId;
			// 		dataFactory.deleteVideo(srcPlaylistId, videoArr[index].id).then(function(response){

			// 			vm.videos[vm.index].deleteResponse = response;
			// 			vm.index++;

			// 			if (vm.index < videoArr.length) {
			// 				vm.executeAction(vm.videos, vm.index);  //recursively calls deleteVideos
			// 			}
			// 			else {
			// 				vm.updatePlaylists();
			// 				vm.executeStatus = "COMPLETE"
			// 			}
			// 		});
			// 	}
			// 	else {
			// 		vm.videos[vm.index].deleteResponse = {status: "Canceled" };
			// 		vm.index++;
			// 		if (vm.index < videoArr.length) {
			// 			vm.executeAction(vm.videos, vm.index);  //recursively calls deleteVideos
			// 		}
			// 		else {
			// 			vm.updatePlaylists(); //I think you'd only enter this if the last video in the selection failed to copy
			// 			vm.executeStatus = "COMPLETE"
			// 		}					
			// 	}
			// });
		// }


		function deleteVideos(videoArr, affectedPlaylists) {
			newDataFactory.deleteVideos(videoArr).then(function(result) {
				console.log('delete finished');
				//could write a function to return all the playlist in videoArr
				vm.updatePlaylists(affectedPlaylists); //maybe call this on close of the modal instead
				vm.executeStatus = "COMPLETE";				
			});
		} 

		function updatePlaylists(playlistsToUpdate) {
			newDataFactory.requestVideos(playlistsToUpdate).then(function(){
				console.log('Affected Playlists Videos Loaded!');
				if(newDataFactory.channelContainsDuplicates(newDataFactory.getChannel())){
						$state.go('duplicates');
				}
				else {
					newDataFactory.setVideoTags(newDataFactory.getChannel());
					$state.go('organizer');
				}
			}); 
		}

		function deselectVideos(selectedNewDupVideos, destPlaylist) {
			newDataFactory.getPossibleDuplicates(selectedNewDupVideos, destPlaylist, true);
			$uibModalInstance.close('deselected');
		}
	}
})();
