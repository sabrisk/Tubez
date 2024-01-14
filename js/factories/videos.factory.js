

(function() {
	'use strict';
	angular.module('ytorg').factory('videosFactory', videosFactory);

	videosFactory.$inject = ['$http','oauth2Provider'];
	function videosFactory($http, oauth2Provider) {
		return {
			requestVideos: requestVideos,
			insertVideo: insertVideo,
			deleteVideo: deleteVideo
		}
		
		function requestVideos(playlistId, nextPageToken) {

			if(playlistId === 'PLK1Gx6WJ9xd368ILiW2Co_n2JEZm9kf8z'){
				var i = 0;
			}

			var url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet'
			if(playlistId){
				url += '&playlistId=' + playlistId;
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
				if(response.data.items.length && response.data.items[0].snippet.playlistId === 'PLK1Gx6WJ9xd368ILiW2Co_n2JEZm9kf8z'){
					var i = 0;
				}
					angular.forEach(response.data.items, function(video, i) {

						video.tags = [];
						video.checkboxModel = false;
						video.duplicate = false;
						video.totalResults = response.data.pageInfo.totalResults;
						video.insertResponse = null; //used to temporarily store the insert request to another playlist
						video.deleteResponse = null; //used to temporarily store the delete response from the current playlist

						var thumbnail = null;
						if(video.snippet.thumbnails.default){

							// if (!video.snippet.thumbnails.default) {
							// 	console.log(video);
							// 	console.log('video broken');
							// }
							thumbnail = video.snippet.thumbnails.default.url;
						} else {
							thumbnail = '';
						}
						video.snippet.thumbnail = thumbnail;
					});
					return response;
			}, function errorCallback(response) {
				console.log(response);
			});
		}
		
		function insertVideo(videoId, destPlaylistId, position) {

			var url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&fields=status';
			url += '&key=' + oauth2Provider.getApiKey();

			return $http({
				method: 'POST',
				url: url,
				headers: {
					'Authorization': 'Bearer ' + oauth2Provider.getToken()
				},
				data: {
					"snippet": {
						"playlistId": destPlaylistId,
						"resourceId": {
							"videoId": videoId,
							"kind": "youtube#video"
						},
						"position": position
					}
				}
			}).then(function successCallback(response) {
				console.log(response);
				return response;
			}, function errorCallback(response) {
				console.log(response);
				return response;
			});
		}

		function deleteVideo(id) {
			//DELETE https://www.googleapis.com/youtube/v3/playlistItems?id=UExrYXVuRnAwWlQxMTZSQTZFSUt6TzNKOXY4bTk1WDN0VS41MzJCQjBCNDIyRkJDN0VD&key={YOUR_API_KEY}
			var url = 'https://www.googleapis.com/youtube/v3/playlistItems?id='
			url += id;
			url += '&key=' + oauth2Provider.getApiKey();

			return $http({
				method: 'DELETE',
				url: url,
				headers: {
					'Authorization': 'Bearer ' + oauth2Provider.getToken()
				}
			});
			// .then(function successCallback(response) {
			// 	console.log(response);
			// 		return response;
			// }, function errorCallback(response) {
			// 	console.log(response);
			// });
		}
	}
})();


