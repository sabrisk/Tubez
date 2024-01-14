(function() {

	angular.module('ytorg').factory('newDataFactory', newDataFactory);

	newDataFactory.$inject = ['$rootScope', '$http','oauth2Provider','channelFactory','playlistsFactory', 'videosFactory'];
	function newDataFactory($rootScope, $http, oauth2Provider, channelFactory, playlistsFactory, videosFactory) {

		var vm = this;
		var channel = null;

		return {
			getChannel: getChannel,
			getPlaylists: getPlaylists,
			getPlaylist: getPlaylist,
			requestChannel: requestChannel,
			requestPlaylists: requestPlaylists,
			requestVideos: requestVideos,
			channelContainsDuplicates: channelContainsDuplicates,
			getPlaylistsWithDuplicates: getPlaylistsWithDuplicates,
			getSelectedDuplicateVideos: getSelectedDuplicateVideos,
			setVideoTags: setVideoTags,

			//Modal
			getSelectedVideos: getSelectedVideos,
			getPossibleDuplicates: getPossibleDuplicates,
			nullifyVideoCopyResponses: nullifyVideoCopyResponses,
			deleteVideos: deleteVideos,
			insertVideos: insertVideos,
			moveVideos: moveVideos
		}

		function getChannel() {
			return channel;
		}

		function getPlaylists() {
			return channel.playlists;
		}

		function getPlaylist(playlistId) {
			var playlist = getPlaylistObj(playlistId);
			return playlist;
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

		function requestChannel(channelId) {
			console.log(channelId);
			return channelFactory.requestChannel(channelId).then(function(response){
				console.log(response);
				channel = response.data.items[0];//need to check for possibility of no channel (perhaps this will throw error?)
				return channel;//This right here is crucial to send the data back to the controller //think about returning channel instead.
			});
		}

		function requestPlaylists(channel) {
			return playlistsFactory.requestPlaylists(channel.id, channel.nextPageToken).then(function(response){
				channel.playlists = channel.playlists.concat(response.data.items);//need to check for items like below in requestVideos in case no playlists found.

				if(response.data.nextPageToken) {
					channel.nextPageToken = response.data.nextPageToken;
					return requestPlaylists(channel)
				}
				else {
					channel.nextPageToken = null; //I can't see why this needs to be set to null
				}
				return channel.playlists; //think about returning channel.playlists
			},
			function errorCallback(response){
				console.log(response);
				return response;
			});			
		}

		//rhino
		//debug this to figure out how the hell it works.

		function requestVideos(playlistArr) {
			var promises = [];

			//Create an initial request for videos for each playlist.
			angular.forEach(playlistArr, function(playlist, i) {
				if(!playlist.nextPageToken){
					playlist.videos = []; //if playlist passed with null token, delete videos
					playlist.videosLoading = true;
				}				
				promises.push(videosFactory.requestVideos(playlist.id, playlist.nextPageToken));
			});

			return Promise.all(promises).then(function(responseArr){
				var newPlaylistArr = responseArr.reduce(function(reducedPlaylistArr, response, i) {

					if(response.data.items.length){
						playlistArr[i].videos = playlistArr[i].videos.concat(response.data.items);
					}					

					if (response.data.nextPageToken) {
						playlistArr[i].nextPageToken = response.data.nextPageToken;
						return reducedPlaylistArr.concat(playlistArr[i]);
					}
					else {
						playlistArr[i].nextPageToken = null;
						if($rootScope.$root.$$phase != '$apply' && $rootScope.$root.$$phase != '$digest'){ //Necesary to ensure circular progress bar updates regularly
							$rootScope.$apply(function() {
								playlistArr[i].videosLoading = false;
							});
						}
						else {
							playlistArr[i].videosLoading = false;
						}
					}
					return reducedPlaylistArr;
				}, []);

				if(newPlaylistArr.length){
					return requestVideos(newPlaylistArr);
				}
				return responseArr; //for each of these request functions... maybe return something more interesting?
			});
		}

		function channelContainsDuplicates(channel){//used to be containsDuplicates(channel)
			var allVideosArr = getAllVideos(channel); //used to be vm.updateAllVideos()
			var tags = getVideoTags(allVideosArr); //used to be vm.getVideoTags()

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
								//setPlaylistContainsDuplicates(playlist.id, true); //look at removing this function...this actually is used to filter the playlist on duplicates.html
								playlist.containsDuplicates = true;
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
		
		function getAllVideos(channel) {
			var allVideosArr = [];

			angular.forEach(channel.playlists, function(playlist, i) {
				angular.forEach(playlist.videos, function(video, i) {
					allVideosArr.push({channelId: video.snippet.channelId, playlistId: video.snippet.playlistId, videoId: video.snippet.resourceId.videoId, title: video.snippet.title, thumbnail: video.snippet.thumbnail });
				});
			});

			return allVideosArr;
		}


		function getVideoTags(allVideosArr) {
			//Probably need to loop through here and delete all existing tags.
			var sortedlist = _.sortBy(allVideosArr, 'videoId');
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

		function getPlaylistsWithDuplicates(channel){
			var playlistsWithDups = [];
			angular.forEach(channel.playlists, function(playlist, i) {
				if(playlist.containsDuplicates) {
					playlistsWithDups.push(playlist);
				}
			});
			return playlistsWithDups;
		}

		function getSelectedDuplicateVideos(channel) {
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

		function getSelectedVideos(playlist) {
			var selectedVideos = [];
			// var playlist = getPlaylistObj(playlistId);

			angular.forEach(playlist.videos, function(video, i) {
				if(video.checkboxModel) {
					selectedVideos.push(video);
				}
			});
			return selectedVideos;
		}

		function getPossibleDuplicates(selectedVideos, destPlaylist, boolDeselect) {
			// var destPlaylist = vm.getPlaylistObj(destPlaylistId);
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

		function nullifyVideoCopyResponses(videoArr) {
			angular.forEach(videoArr, function(video, i) {
				video.insertResponse = null;
			});	
		}

		function setVideoTags(channel) {
			var allVideosArr = getAllVideos(channel);
			var tags = getVideoTags(allVideosArr);

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

		function deleteVideos(videoArr) {//you could pass srcPlaylist in here to do the delete directly in here in the future instead of calling updatePlaylists back =
										 //in the controller. Actually, it should be an array of srcPlaylists since this has to handle both individual deletes and duplicate
										 //deletes from multiple playlists. You could then use the playlistid on the video you're currently deleting in videoArr to search the
										 //array of playlists for the correct one and then splice it out. 
			
			// var srcPlaylistId = videoArr[0].snippet.playlistId;
			var videoId = videoArr[0].id;
			return videosFactory.deleteVideo(videoId).then(function(response) { //Change to a recursive factory function deleteVideos(videoArr)
				videoArr[0].deleteResponse = response;
				var newVideoArr = videoArr.slice(1); //to set playlist.containsDuplicates = false;... search videoArr.slice(1) for a video with a playlist id of
													 //videoArr[0].snippet.playlistId. If it's not found... then you can set it to false... otherwise do nothing or
													 //maybe set it to true. This is also when you can request the videos again for this playlist since you'll have finished 
													 //deleting all te videos for that playlist.
				if(newVideoArr.length) {
					return deleteVideos(newVideoArr);
				}

				return response;
			});
		}

		function insertVideos(videoArr, destPlaylist, position) {
			var videoId = videoArr[0].snippet.resourceId.videoId;
			var destPlaylistId = destPlaylist.id;

			return videosFactory.insertVideo(videoId, destPlaylistId, position).then(function(response) {
				videoArr[0].insertResponse = response;
				var newVideoArr = videoArr.slice(1);

				if(newVideoArr.length) {
					return insertVideos(newVideoArr, destPlaylist, ++position);
				}
				return response;
			});
		}



		function moveVideos(videoArr, srcPlaylist, destPlaylist, position) {
			var videoId = videoArr[0].snippet.resourceId.videoId;
			var destPlaylistId = destPlaylist.id;

			return videosFactory.insertVideo(videoId, destPlaylistId, position).then(function(response) {
				videoArr[0].insertResponse = response;

				if(response.data.error === undefined){
					
					var videoId = videoArr[0].id;
					return videosFactory.deleteVideo(videoId).then(function(response) { //Change to a recursive factory function deleteVideos(videoArr)
						videoArr[0].deleteResponse = response;
						var newVideoArr = videoArr.slice(1); //to set playlist.containsDuplicates = false;... search videoArr.slice(1) for a video with a playlist id of
															 //videoArr[0].snippet.playlistId. If it's not found... then you can set it to false... otherwise do nothing or
															 //maybe set it to true. This is also when you can request the videos again for this playlist since you'll have finished 
															 //deleting all te videos for that playlist.
						if(newVideoArr.length) {
							return moveVideos(newVideoArr, srcPlaylist, destPlaylist, ++position);
						}

						return response;
					});
				}
				else {
					videoArr[0].deleteResponse = {status: "Canceled" };

					var newVideoArr = videoArr.slice(1);
					if(newVideoArr.length) {
						return moveVideos(newVideoArr, srcPlaylist, destPlaylist, ++position);
					}

					return response;

				}
			});
		}



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



	}
})();

