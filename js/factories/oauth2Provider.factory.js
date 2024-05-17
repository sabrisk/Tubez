(function() {
	'use strict';

	angular.module('ytorg').factory('oauth2Provider', oauth2Provider);

	oauth2Provider.$inject = ['$window','$interval','$http', '$q'];
	function oauth2Provider($window, $interval, $http, $q){

		// var vm = this;
		// vm.CLIENT_ID = '575084579214-jrghqe5v8bbooohr1n84jsck0qa4c7gs.apps.googleusercontent.com';
  		// vm.REDIRECT_URI = 'http://www.tubez.io/partials/oauth2callback.html';


		// var params = {
		// 	'client_id': vm.CLIENT_ID,
		// 	'redirect_uri': vm.REDIRECT_URI,
		// 	'scope': 'https://www.googleapis.com/auth/youtube.readonly', //scopes string separated by spaces
		// 	'state': 'try_sample_request',
		// 	'include_granted_scopes': 'true',
		// 	'response_type': 'token'
		// };

// https://accounts.google.com/o/oauth2/v2/auth?
//  scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly&
//  include_granted_scopes=true&
//  state=state_parameter_passthrough_value&
//  redirect_uri=http%3A%2F%2Flocalhost%2Foauth2callback&
//  response_type=token&
//  client_id=client_id


		//Whenever there's an action (copy, move, delete) first check local storage to see if a token exists
		//If so && there's more than 20 minutes remaining in the life of the token
			//run promise success callback where you'll call the api request
		//Whenever there's an error on a request for data... check to see if the token is expired... and if so redo the oauth.


		// 	apiKey: 'AIzaSyC0h2jap_LmIVmxIqgRre3EjZnK4dvTofA', //live site
		// 	authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth?',
		// 	approval_prompt: 'auto',
		// 	signedIn: false,
		// 	token: {}
		// }


		var vm = this;
		var oauth2Provider = {

			authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth?',
			
			/* LIVE */
			apiKey: 'AIzaSyBiW4rNGXfgjlxpcJSofCbyuK-JiN_yZIs',
			client_id: '222410425059-igp6q64sathii1hp25f296vt2juvch0u.apps.googleusercontent.com',
			redirect_uri: 'https://www.brockkeasler.com/tubez/partials/oauth2callback.html', //live
			/* LIVE */
			
			/* TEST */
			//apiKey: 'AIzaSyCb5tM8oQdjfXFfd-kITIvcnueI8C8mxBA',
			// client_id: '575084579214-6h605bu166bb4ee61ploegitnsen2r7h.apps.googleusercontent.com',
			// redirect_uri: 'http://localhost/partials/oauth2callback.html',
			/* TEST */

			scope: '',
			approval_prompt: 'auto',
			response_type: 'token',
			signedIn: false,
			token: {}
		}

		vm.getUrl = getUrl;
		vm.exchangeOAuth2Token = exchangeOAuth2Token;
		vm.checkScopeGranted = checkScopeGranted;

		return {
			//getUrl: getUrl,
			getToken: getToken,
			getApiKey: getApiKey,
			login: login,
			logout: logout,
			signedIn: signedIn,
			setScopes: setScopes,
			checkScopeGranted: checkScopeGranted
		}

		function getUrl() {
			var url = oauth2Provider.authorizationEndpoint +
			'client_id=' + encodeURIComponent(oauth2Provider.client_id) +
			'&redirect_uri=' + encodeURIComponent(oauth2Provider.redirect_uri) +
			'&scope=' + encodeURIComponent(oauth2Provider.scope) +
			'&approval_prompt=' + encodeURIComponent(oauth2Provider.approval_prompt) +
			'&response_type=' + encodeURIComponent(oauth2Provider.response_type);
			
			return url;
		}

		function getToken() {
			return oauth2Provider.token.access_token;
		}
		function getApiKey(){
			return oauth2Provider.apiKey;
		}
		function login() {
			var q = $q.defer();
			if (oauth2Provider.token.scope === "https://www.googleapis.com/auth/youtube") {
				q.resolve(oauth2Provider.token);
			} else {

				console.log('begin scope');
				console.log(oauth2Provider.scope);
				
	
				var win = $window.open(vm.getUrl(), '', "top=" + ((screen.height - 700) / 2) + ",left=" + ((screen.width - 870) / 2) + ",width=870,height=700");
	
				var interval = 1000;
				// create an ever increasing interval to check a certain global value getting assigned in the popup
				var i = $interval(function(){
					interval += 500;
					try {
						console.log(win);
						if(win.frames !== null){
							
							if (win.location.hash){	//If there's an access token
								console.log('hash: ' + win.location.hash);
	
								var params = {}, queryString = win.location.hash.substring(1),
									regex = /([^&=]+)=([^&]*)/g, m;
								while (m = regex.exec(queryString)) {
									console.log(m);
									params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
									vm.exchangeOAuth2Token(params);
								}
	
								oauth2Provider.token = params;
								console.log(win.location.hash);
	
								//do some fancy stuff here to see if there's a token or an error access denied.
	
								if(oauth2Provider.token.access_token){
									oauth2Provider.signedIn = true;
									q.resolve(oauth2Provider.token);
									console.log('Token found');
								}
								else if(oauth2Provider.token.error){
									console.log('Access Denied Error');
								}
								else{
									console.log('What happened?');
								}
	
								$interval.cancel(i);
								win.close();
	
							}						
						} else {
							$interval.cancel(i);	//window was closed with (x)
							q.reject();
						}
						
						console.log(win);
					} catch(e){
						console.error(e);
					}
				}, interval);
			}

			console.log('end scope');
			console.log(oauth2Provider.scope);
			
			return q.promise;



		}
		function logout(){
			//verifiy that this GET works.
			$window.document.cookie = 'my_cookie=; path=/; domain=.brockkeasler.com/tubez; expires=' + new Date(0).toUTCString();
			$http({
				method: 'GET',
				url: 'https://accounts.google.com/o/oauth2/revoke?token=' + oauth2Provider.token.access_token
			}).then(function successCallback(response) {
				console.log(response);
			}, function errorCallback(response) {
				console.log(response);
			});

			oauth2Provider.token = {};
			oauth2Provider.signedIn = false;
		}

		function signedIn() {
			return oauth2Provider.signedIn;
		}

		function setScopes(scopesArr) {
			oauth2Provider.scope = scopesArr.join(" ");
		}


		/* Verify the access token received on the query string. */
		function exchangeOAuth2Token(params) {
			console.log('exchangeOAuth2Token request');
			var oauth2Endpoint = 'https://www.googleapis.com/oauth2/v3/tokeninfo';
			if (params['access_token']) {

				return $http({
					method: 'POST',
					url: oauth2Endpoint + '?access_token=' + params['access_token']
				}).then(function successCallback(response) {
					console.log('exchangeOAuth2Token response');
					console.log(response);

					if (response.status == 200 &&
					response.data.aud &&
					// response.data.aud == '575084579214-jrghqe5v8bbooohr1n84jsck0qa4c7gs.apps.googleusercontent.com') { //live site
					response.data.aud == '196826622357-h25gjdm8k7etgno50di8681an8klke8g.apps.googleusercontent.com') {
						// Store granted scopes in local storage to facilitate
						// incremental authorization.
						params['scope'] = response.data.scope;
						localStorage.setItem('oauth2-test-params', JSON.stringify(params) );
						console.log()
						if (params['state'] == 'try_sample_request') {
							// trySampleRequest();
						}
					}					
					
					return response;
				}, function errorCallback(response) {
					console.log(response);
					return response;
				});



				// var xhr = new XMLHttpRequest();
				// xhr.open('POST', oauth2Endpoint + '?access_token=' + params['access_token']);
				// xhr.onreadystatechange = function (e) {
				// 	var response = JSON.parse(xhr.response);
				// 	// When request is finished, verify that the 'aud' property in the
				// 	// response matches YOUR_CLIENT_ID.
				// 	if (xhr.readyState == 4 &&
				// 	xhr.status == 200 &&
				// 	response['aud'] &&
				// 	response['aud'] == YOUR_CLIENT_ID) {
				// 		// Store granted scopes in local storage to facilitate
				// 		// incremental authorization.
				// 		params['scope'] = response['scope'];
				// 		localStorage.setItem('oauth2-test-params', JSON.stringify(params) );
				// 		if (params['state'] == 'try_sample_request') {
				// 			trySampleRequest();
				// 		}
				// 	} else if (xhr.readyState == 4) {
				// 		console.log('There was an error processing the token, another ' +
				// 		'response was returned, or the token was invalid.')
				// 	}
				// };
				// xhr.send(null);



			}
		}

		function checkScopeGranted(SCOPE, apiRequest) {
			var SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';
			var params = JSON.parse(localStorage.getItem('oauth2-test-params'));
			console.log('checkScopeGranted');
			var current_scope_granted = false;
			console.log(params);
			if (params.hasOwnProperty('scope')) {
				var scopes = params['scope'].split(' ');
				for (var s = 0; s < scopes.length; s++) {
					if (SCOPE == scopes[s]) {
					current_scope_granted = true;
					}
				}
			}

			// return current_scope_granted;

			//maybe instead of doing it like the below code... either return true or false from this.
			//Then, if true, launch the api request immediate. If false, initiate the oauth2SignIn from the controller... then run the api request in the
			//.then() of oauth2SignIn. BTW oauth2SignIn is equivalent to your login function above. They do the same thing. You can see the .then() on the
			//login function in the home controller Make a backup before you start doing things like crazy.

			// if (!current_scope_granted) {
			// oauth2SignIn(); // This function is defined elsewhere in this document.
			// } else {
			// // Since you already have access, you can proceed with the API request.
			// }
		}

	}
})();