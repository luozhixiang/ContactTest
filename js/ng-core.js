var ng = ng || {};
ng.core = ng.core || {};

ng.core.oauth = ChromeExOAuth.initBackgroundPage({
	'request_url' : 'https://www.google.com/accounts/OAuthGetRequestToken',
	'authorize_url' : 'https://www.google.com/accounts/OAuthAuthorizeToken',
	'access_url' : 'https://www.google.com/accounts/OAuthGetAccessToken',
	'consumer_key' : 'anonymous',
	'consumer_secret' : 'anonymous',
	'scope' : 'http://www.google.com/m8/feeds/',
	'app_name' : 'SnowUI - Google Contact'
	});

ng.core.logout = function() {
	ng.core.oauth.clearTokens();
};