(function() {
	'use strict';

	angular.module('ytorg').factory('playlistsFactory', playlistsFactory);

	playlistsFactory.$inject = ['$http','oauth2Provider','$q'];
	function playlistsFactory($http, oauth2Provider, $q) {

		return {
			requestPlaylists: requestPlaylists
		}

		function requestPlaylists(channelId, nextPageToken) {  //Maybe call this getPlaylistsResults then call another service from controller to process the result into pure playlists instead of pages.
			
			var url = 'https://www.googleapis.com/youtube/v3/playlists?part=contentDetails,snippet'
			if(channelId){
				url += '&channelId=' + channelId;
			}
			if(nextPageToken){
				url += '&pageToken=' + nextPageToken;
			}
			url += '&maxResults=50';
			url += '&key=' + oauth2Provider.getApiKey();

			return $http({
				method: 'GET',
				url: url,
				headers: {
					'Authorization': 'Bearer ' + oauth2Provider.getToken()
				}
			}).then(function successCallback(response) {
				console.log(response);
				//should probably check if items exists... or maybe check if it has a length. Try sending a request with a crazy channelid
				angular.forEach(response.data.items, function(playlist, i) { //maybe could use i instead of numVids
					playlist.videos = [];
					playlist.videosLoading = false;
					playlist.containsDuplicates = false;
					// playlist.needsUpdating = false;
					// playlist.nextPageToken = null;
				});
				return response;
			}, function errorCallback(response) {
				console.log(response);
				return $q.reject("Data not available");
			});
		}
	}
})();



// https://www.googleapis.com/youtube/v3/playlists?part=contentDetails,snippet&channelId=UCPQH92IAQHnQjmI98lF7OGg&maxResults=50&key={YOUR_API_KEY}

// 			var url = 'https://www.googleapis.com/youtube/v3/playlists?part=contentDetails,snippet'
// 			if(channelId){
// 				url += '&channelId=' + channelId;
// 			}
// 			url += '&maxResults=50';
// 			url += '&key=' + oauth2Provider.getApiKey();

// 			return $http({
// 				method: 'GET',
// 				url: url,
// 				headers: {
// 					'Authorization': 'Bearer ' + oauth2Provider.getToken()
// 				}
// 			}).then(function successCallback(response) {
// 				console.log(response);
// 				//should probably check if items exists... or maybe check if it has a length. Try sending a request with a crazy channelid
// 				$.each(response.data.items, function(i, playlist){ //maybe could use i instead of numVids
// 					playlist.videos = [];
// 					playlist.videosLoading = false;
// 				});
// 				return data;
// 			}, function errorCallback(response) {
// 				console.log(response);
// 			});