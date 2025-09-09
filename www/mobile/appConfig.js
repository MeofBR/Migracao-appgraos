// /*  Logon configuration used by packaged apps (N.B. We do not include the fioriclient 
//  *  plugin to packaged apps but just borrow some of its configuration format.)
//  *	The {{}} placeholder values, if any, will be populated before the first build. 
//  *	The "appName" and "appVersion" will be updated with the input values in the build wizard.
//  *	Do not change the "appID", "fioriURL" and "auth" values to avoid inconsistent 
//  *	app settings.
//  */
// var fiori_client_appConfig = {
// 	"appName": "BRF AppGraos",
// 	"appVersion": "30.0.1",
// 	"appID": "com.br.appgraos",
// 	"fioriURL": "https://mobile-ne6300ec0.br1.hana.ondemand.com:443",
// 	"auth": [
// 		{
// 			"type": "saml2.web.post",
// 			"config": {
// 				"saml2.web.post.authchallengeheader.name": "com.sap.cloud.security.login",
// 				"saml2.web.post.finish.endpoint.uri": "/SAMLAuthLauncher",
// 				"saml2.web.post.finish.endpoint.redirectparam": "finishEndpointParam"
// 			}
// 		}
// 	],
// 	"communicatorId": "REST"
// };

 var fiori_client_appConfig = {
	"appName": "appgraos",
	"appVersion": "27.8.8",
	"appID": "com.sap.webide.xbe6bb9e9af3943bf966941dd80fefd65",
	"fioriURL": "https://mobile-ne6300ec0.br1.hana.ondemand.com:443",
	"auth": [
		{
			"type": "saml2.web.post",
			"config": {
				"saml2.web.post.authchallengeheader.name": "com.sap.cloud.security.login",
				"saml2.web.post.finish.endpoint.uri": "/SAMLAuthLauncher",
				"saml2.web.post.finish.endpoint.redirectparam": "finishEndpointParam"
			}
		}
	],
	"communicatorId": "REST"
};