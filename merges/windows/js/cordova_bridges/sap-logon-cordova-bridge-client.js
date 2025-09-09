cordovaBridgeUtils.webView.addEventListener("MSWebViewFrameNavigationStarting", function (e) {
    var parameters = cordovaBridgeUtils.getUrlParameters(e.uri);

    if (parameters["EVENT"] == 'sap_logon_refresh_session_event') {
        function successCallback() {
            cordovaBridgeUtils.successEvent('sap_logon_refresh_sessionCommand', null);
        }
        function errorCallback(error) {
            cordovaBridgeUtils.errorEvent('sap_logon_refresh_sessionCommand', error);
        }

        sap.Logon.refreshSession(successCallback, errorCallback);
    };
});
