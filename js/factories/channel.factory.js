(function() {

	angular.module('ytorg').factory('channelFactory', channelFactory);

	channelFactory.$inject = ['$http','oauth2Provider'];
	function channelFactory($http, oauth2Provider) {
		return {
			requestChannel: requestChannel
		}

		function requestChannel(channelId) {
			console.log("CHANNEL REQUESTED");
			var url = 'https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet'
			if(!channelId){
				url += '&mine=true'
			}
			else{
				url += '&id=' + channelId;
			}

			url += '&key=' + oauth2Provider.getApiKey();
			console.log(url);
			return $http({
				method: 'GET',
				url: url,
				headers: {
					'Authorization': 'Bearer ' + oauth2Provider.getToken()
				}
			}).then(function successCallback(response) {
					response.data.items[0].nextPageToken = null;
					//should probably check if items exists... or maybe check if it has a length. Try sending a request with a crazy channelid
					response.data.items[0].playlists = [];//add playlists array to store playlists returned from playlists factory
					// response.data.items[0].playlistsLoading = false;
					// response.data.items[0].videosLoading = false; //I don't think this is being used
					console.log(response);
					console.log(oauth2Provider.getToken());
					
					return response;
			}, function errorCallback(response) {
				console.log(response);
			});
		}
	}
})();

