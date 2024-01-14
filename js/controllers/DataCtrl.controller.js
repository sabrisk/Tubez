(function() {
	'use strict';

	angular.module('ytorg').controller('DataCtrl', DataCtrl);

//There could be an even higher level controller to handle multiple channels. You could store channels on that controller's scope.
	DataCtrl.$inject = ['newDataFactory', '$state'];
	function DataCtrl(newDataFactory, $state) {
		var vm = this;

		vm.loadChannelData = loadChannelData;
		vm.playlistsDoneLoading = false;
		vm.percent = 0;
		vm.calcPercentComplete = calcPercentComplete;

		function loadChannelData() {
			newDataFactory.requestPlaylists(newDataFactory.getChannel()).then(function(playlists){
				console.log('All Playlists Loaded!');
				vm.playlistsDoneLoading = true;
				newDataFactory.requestVideos(playlists).then(function(){
					console.log('All Videos Loaded!');
					if(newDataFactory.channelContainsDuplicates(newDataFactory.getChannel())){
							$state.go('duplicates');  
					}
					else{
						$state.go('organizer');
					}
				}); 
			});
		}
		if(!newDataFactory.getPlaylists().length){
			vm.loadChannelData();
		}
		

		function calcPercentComplete(){
			var playlistsLoaded = 0;
			var percent = 0;
			var playlists = newDataFactory.getPlaylists();
			if(playlists.length){
				angular.forEach(playlists, function(playlist, i) {
					if(!playlists[i].videosLoading){
						playlistsLoaded++;
					}
				});								
				percent = playlistsLoaded / playlists.length;
			}
			return percent;
		}











		// vm.stringified = '';

		// vm.channel = {};///for testing... this is not the data factory channel!
		// vm.showChannel = showChannel;

		// vm.activate = activate;
		// vm.requestChannel = requestChannel;
		// vm.requestPlaylists = requestPlaylists;
		// vm.requestVideos = requestVideos;
		// vm.requestTestData = requestTestData;
	
		// vm.channelLoadedOnce = false;
		// vm.calcPercentComplete = calcPercentComplete;
		// vm.playlistsDoneLoading = false;

		// vm.activate(dataFactory.getChannel().id, null);

		// function activate(channelId, nextPageToken){
		// 	if(!dataFactory.getPlaylistsLoadedOnce()){ //this needs to be on the channel in the factory I think.
		// 		vm.requestPlaylists(channelId, nextPageToken);
		// 		//vm.channelLoadedOnce = true;
		// 	}
		// 	// vm.requestTestData(); //for testing
		// }

		// function requestChannel(channelId) {
		// 	dataFactory.requestChannel(channelId).then(function(data){
		// 		//below should be unneccesary except for debugging. The only purpose of this controller
		// 		//is to populate this scope and possibly check for duplicates... not to display anything. Except maybe errors.
		// 		var channelId =  data.result.items[0].id;//If I handle the error in the factory... I'll need to return some kind of proper message here and display it.
		// 		vm.requestPlaylists(channelId, null);
		// 	});
		// }

		// function requestPlaylists(channelId, nextPageToken) {
		// 	dataFactory.requestPlaylists(channelId, nextPageToken).then(function(response){
		// 		//below should be unneccesary except for debugging. The only purpose of this controller
		// 		//is to populate this scope and possibly check for duplicates... not to display anything. Except maybe errors.
		// 		if(response.data.nextPageToken){
		// 			vm.requestPlaylists(channelId, response.data.nextPageToken);
		// 		} 
		// 		else { //Wait for all playlists to be loaded before getting videos
		// 			angular.forEach(dataFactory.getPlaylists(), function(playlist, i) {
		// 				vm.requestVideos(playlist.id, null);
		// 			});
		// 			vm.playlistsDoneLoading = !dataFactory.getChannelPlaylistsLoading(); //Wait for playlists to be finished loading before displaying progress bar.
		// 		}
		// 			vm.channel = dataFactory.getChannel();
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
		// 				vm.channel = dataFactory.getChannel();
		// 				//vm.stringified = JSON.stringify(dataFactory.getChannel(), null, 4); //for testing with JSON channel file.
		// 			}
		// 		}
		// 	});
		// }

		// function showChannel() {
		// 	console.log(vm.channel);
		// }

		

		// function requestTestData(){
		// 	dataFactory.requestTestData().then(function(data){
		// 		vm.playlistsDoneLoading = !dataFactory.getChannelPlaylistsLoading();


		// 		if(dataFactory.allVideosLoaded()) {
		// 			console.log('ALL VIDEOS LOADED');
		// 			if(dataFactory.containsDuplicates()){
		// 				$state.go('duplicates');
		// 			}
		// 			else{
		// 				$state.go('organizer');
		// 			}
		// 		}
		// 	});
		// }



















	}
})();
