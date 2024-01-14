//Factory to compile all the data before sending it back to the data controller.

(function() {
	'use strict';

	angular.module('ytorg').factory('dataFactory', dataFactory);

	dataFactory.$inject = ['channelFactory','playlistsFactory','videosFactory','testdataFactory','$q'];
	function dataFactory(channelFactory, playlistsFactory, videosFactory, testdataFactory, $q){
		var vm = this;
		var channel = null;
		vm.allVideos = [];
		vm.playlistsLoadedOnce = false;

		vm.getPlaylistObj = getPlaylistObj;
		vm.updateAllVideos = updateAllVideos;		
		vm.getVideoTags = getVideoTags;
		vm.setChannelPlaylistsLoading = setChannelPlaylistsLoading;
		vm.setPlaylistVideosLoading = setPlaylistVideosLoading;
		vm.setPlaylistContainsDuplicates = setPlaylistContainsDuplicates;
		vm.setPlaylistNeedsUpdating = setPlaylistNeedsUpdating;

		return {
			//Simple returns
			getChannel: getChannel,
			getPlaylists: getPlaylists,
			getChannelPlaylistsLoading: getChannelPlaylistsLoading,
			getPlaylistsLoadedOnce: getPlaylistsLoadedOnce,
			getPlaylist: getPlaylist,

			//Requests for data
			requestChannel: requestChannel,
			requestPlaylists: requestPlaylists,
			requestVideos: requestVideos,

			//Data factory state and maintenence
			allVideosLoaded: allVideosLoaded,
			containsDuplicates: containsDuplicates,
			getSelectedDuplicateVideos: getSelectedDuplicateVideos,
			setVideoTags: setVideoTags,
			
			//Organizer and Modal functions
			getSelectedVideos: getSelectedVideos,
			getPossibleDuplicates: getPossibleDuplicates,
			copyVideo: copyVideo,
			deleteVideo: deleteVideo,
			nullifyVideoCopyResponses: nullifyVideoCopyResponses,
			getPlaylistNameById: getPlaylistNameById,
			
			//Testing
			requestTestData: requestTestData
		};

		function getChannel() {
			return channel;
		}

		function getPlaylists() {
			return channel.playlists;
		}

		function getChannelPlaylistsLoading() {
			return channel.playlistsLoading;
		}

		function getPlaylistsLoadedOnce() {
			return vm.playlistsLoadedOnce;
		}	

		function getPlaylist(playlistId) {
			var playlist = vm.getPlaylistObj(playlistId);
			return playlist;
		}

		//errors: What happens if there is no channel
		function requestChannel(channelId) {
			return channelFactory.requestChannel(channelId).then(function(response){
				channel = response.data.items[0];//need to check for possibility of no channel (perhaps this will throw error?)

				return response;//This right here is crucial to send the data back to the controller
			});
		}

		//errors: What happens if there is no playlist
		function requestPlaylists(channelId, nextPageToken) {
			if(!nextPageToken){
				vm.playlistsLoadedOnce = true; //If token null, we can assume all the playlists have been retrieved once... since the first time this is ever
											   //null is when all the playlists are retrieved.
			}
			vm.setChannelPlaylistsLoading(true);
			console.log('playlists start loading here');
			return playlistsFactory.requestPlaylists(channelId, nextPageToken).then(function(response){
				channel.playlists = channel.playlists.concat(response.data.items);//need to check for items like below in requestVideos in case no playlists found.

				if(response.data.nextPageToken === undefined){
					vm.setChannelPlaylistsLoading(false);
					console.log('no playlists after this point');
				}

				return response;
			},
			function errorCallback(response){
				console.log(response);
				return response;
			});			
		}

		//errors: What happens if there is no video
		function requestVideos(playlistId, nextPageToken) {
			if(!nextPageToken){
				var playlist = vm.getPlaylistObj(playlistId);
				playlist.videos = [];

			}
			vm.setPlaylistVideosLoading(playlistId, true);
			return videosFactory.requestVideos(playlistId, nextPageToken).then(function(response){

				if(response.data.items.length){
					var playlist = vm.getPlaylistObj(response.data.items[0].snippet.playlistId);
					playlist.videos = playlist.videos.concat(response.data.items);
				}

				if(response.data.nextPageToken === undefined){
					vm.setPlaylistVideosLoading(playlistId, false);
					vm.setPlaylistNeedsUpdating(playlistId, false);
				}

				return response;
			});			
		}

		function allVideosLoaded() {
			var playlists = channel.playlists;
			var playlistsLoaded = 0;

			for (var i = 0; i < playlists.length; i++) {
				if (!playlists[i].videosLoading) {
					playlistsLoaded++;
				}
			}
			return playlists.length === playlistsLoaded;
		}

		function containsDuplicates(tags){//should be renamed to channelContainsDuplicates
			vm.updateAllVideos();
			var tags = vm.getVideoTags();

			var duplicatesFound = false;
			angular.forEach(channel.playlists, function(playlist, i) {
				angular.forEach(tags, function(videoTags, i) {
					var obj = _.groupBy(videoTags.playlistIds, function(num){ return num; });
					if(obj[playlist.id] && obj[playlist.id].length >= 2){
						console.log('Duplicates Found!');
						duplicatesFound = true;

						var foundVideoOnce = false
						angular.forEach(playlist.videos, function(video, i) {
							if(video.snippet.resourceId.videoId === videoTags.videoId) {
								setPlaylistContainsDuplicates(playlist.id, true);
								video.duplicate = true;
								if(foundVideoOnce) {
									video.checkboxModel = true;
								}
								foundVideoOnce = true;								
							}
						});

					}
				});
			});
			return duplicatesFound;
		}

		function getSelectedDuplicateVideos() {
			var selectedDuplicateVideos = [];
			angular.forEach(channel.playlists, function(playlist, i) {
				angular.forEach(playlist.videos, function(video, i) {
					if(video.duplicate && video.checkboxModel) {
						selectedDuplicateVideos.push(video);
					}
					
				});
			});

			return selectedDuplicateVideos;
		}

		function setVideoTags(tags) {
			vm.updateAllVideos();
			var tags = vm.getVideoTags();
			$.each(channel.playlists, function(i, playlist){ //For each playlist
				$.each(playlist.videos, function(i, video){	//For each video
					video.tags = []; //Delete any old tags
					angular.forEach(tags, function(videoTags, i) {	//For each video with tags (in more than 1 playlist)
						if(video.snippet.resourceId.videoId === videoTags.videoId){	//If the video in the model matches one of the videos that has tags.
							angular.forEach(videoTags.playlistIds, function(pid, i) { //For each of the tags (playlists) that the video is in.
								if(pid !== video.snippet.playlistId) {	//Only add playlist tags to this video that aren't this current video's playlist.
									angular.forEach(channel.playlists, function(playlistForName, i) {	//Loop to lookup playlist name by id
										if(playlistForName.id === pid){	//If playlist name found using the id
											video.tags.push(playlistForName.snippet.title);	//Add playlist tag to this video.
										}
									});										
								}

							});											
						}
					});
				});
			});
		}

		function getSelectedVideos(playlistId) {
			var selectedVideos = [];
			var playlist = getPlaylistObj(playlistId);

			angular.forEach(playlist.videos, function(video, i) {
				if(video.checkboxModel) {
					selectedVideos.push(video);
				}
			});
			return selectedVideos;
		}

		function getPossibleDuplicates(selectedVideos, destPlaylistId, boolDeselect) {
			var destPlaylist = vm.getPlaylistObj(destPlaylistId);
			var possibleDupVideos = [];

			angular.forEach(selectedVideos, function(selectedVideo, i) {
				angular.forEach(destPlaylist.videos, function(destVideo, i) {
					if(selectedVideo.snippet.resourceId.videoId === destVideo.snippet.resourceId.videoId){
						possibleDupVideos.push(selectedVideo);
						//Deselects video
						if(boolDeselect) {
							selectedVideo.checkboxModel = false;
						}
					}
				});
			});

			return possibleDupVideos;
		}

		function copyVideo(destPlaylistId, videoId, position) {
			vm.setPlaylistNeedsUpdating(destPlaylistId, true)
			return videosFactory.insertVideo(destPlaylistId, videoId, position).then(function(response){
				if(response.status === 200){
					response.statusText = "Success!"
				}
				return response;
			});
		}

		function deleteVideo(srcPlaylistId, id) {
			vm.setPlaylistNeedsUpdating(srcPlaylistId, true)
			return videosFactory.deleteVideo(id).then(function(response){
				// if(response.status === 204){
				// 	response.statusText = "Success!"
				// }
				return response;
			});
		}

		function nullifyVideoCopyResponses(videoArr) {
			angular.forEach(videoArr, function(video, i) {
				video.insertResponse = null;
			});	
		}

		function getPlaylistNameById(playlistId) {
			var playlistName = null;
			var playlist = getPlaylistObj(playlistId);
			if(playlist){
				playlistName = playlist.snippet.title;
			}
			return playlistName;
		}

		function requestTestData() {
			return testdataFactory.requestTestData().then(function(response){

				channel = response.data;
				return response.data;
			});	
		}

		/////////////////////////////////////////////////////////Private Functions////////////////////////////////////////////////////////////
		function setChannelPlaylistsLoading(bool) {
			if(channel){
				channel.playlistsLoading = bool
			}
		}

		function setPlaylistVideosLoading(playlistId, bool) {
			var playlist = vm.getPlaylistObj(playlistId);
			playlist.videosLoading = bool;

		}

		function setPlaylistContainsDuplicates(playlistId, bool) {
			var playlist = vm.getPlaylistObj(playlistId);
			playlist.containsDuplicates = bool;
		}

		function setPlaylistNeedsUpdating(playlistId, bool) {
			var playlist = vm.getPlaylistObj(playlistId);
			playlist.needsUpdating = bool;

		}


		function getPlaylistObj(playlistSearchId) {
			var foundPlaylist = null;
			if(channel.playlists.length){
				angular.forEach(channel.playlists, function(playlist, i) {
					if(playlist.id === playlistSearchId){
						foundPlaylist = channel.playlists[i];
					}
				});				
			}
			return foundPlaylist;
		}
		function updateAllVideos() {
			var tempAllVideos = [];

			angular.forEach(channel.playlists, function(playlist, i) {
				angular.forEach(playlist.videos, function(video, i) {
					tempAllVideos.push({channelId: video.snippet.channelId, playlistId: video.snippet.playlistId, videoId: video.snippet.resourceId.videoId, title: video.snippet.title, thumbnail: video.snippet.thumbnail });
				});
			});

			vm.allVideos = tempAllVideos;
		}

		function getVideoTags() {
			//Probably need to loop through here and delete all existing tags.
			var sortedlist = _.sortBy(vm.allVideos, 'videoId');
			var groups = _.groupBy(sortedlist, function(value){
				return value.channelId + '#' + value.videoId + '#' + value.title + '#' + value.thumbnail;
			});

			var data = _.map(groups, function(group){
				return {
					channelId: group[0].channelId,
					videoId: group[0].videoId,
					thumbnail: group[0].thumbnail,
					title: group[0].title,
					playlistIds: _.pluck(group, 'playlistId')
				}
			});

			var tags = [];
			angular.forEach(data, function(video, i) {
				if(video.playlistIds.length >= 2){
					tags.push(video);
				}
			});
			console.log(tags);
			return tags;
		}	
	}
})();