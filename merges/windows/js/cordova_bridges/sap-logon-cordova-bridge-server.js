/* Injects this script into the webview in www/index.html */
if (typeof sap === 'undefined') {
    sap = {};
}

if (!sap.Logon) {
    sap.Logon = {};
}

var sap_logon_refresh_sessionCommand = new CordovaBridgeCommand('sap_logon_refresh_session_event');

sap.Logon.refreshSession = function (successCallback, errorCallback) {
    sap_logon_refresh_sessionCommand.execute(successCallback, errorCallback);
};

onCordovaBridgeLoaded('sap.Logon');
