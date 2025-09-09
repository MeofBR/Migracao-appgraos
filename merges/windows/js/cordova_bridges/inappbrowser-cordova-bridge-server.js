
var windowOpenCommand = new CordovaBridgeCommand('windowOpenEvent');
var originalWindowOpen = window.open;

function qualifyURL(url) {
    // This section is copied from the attachmentviewer.js file as the sap.ushell namespace is available only on the webview side in case of Windows.
    // The correct URL is calculated here and then the domain is added to the attachment url.

    // It is possible for the launchpad javascript to override window.open for purposes of
    // adding filters which can modify the URL. If that is the case, run the filters here to
    // get the intended URL.
    if (sap && sap.ushell && sap.ushell.cloudServices && sap.ushell.cloudServices.interceptor && sap.ushell.cloudServices.interceptor.InterceptService) {
        var interceptorService = sap.ushell.cloudServices.interceptor.InterceptService.getInstance();
        if (interceptorService && interceptorService._invokeFilters) {
            var filteredUrl = interceptorService._invokeFilters("filterWindowOpen", url);
            if (filteredUrl && filteredUrl != "") {
                url = filteredUrl;
            }
        }
    }
    //Get the absolute URL which contains the domain
    var a = document.createElement('a');
    a.href = url;
    return a.href;
}

window.open = function (url, type) {
    console.debug('window.open.called');

    //Based on the useBrowser parameter we can decide whether open the new tab in inappbrowser or in the default browser
    if (typeof useBrowser !== "undefined" && useBrowser != null && useBrowser === true) {
        if (type == "_blank" || type == "blank") {
            originalWindowOpen(url, type);
        } else {
            console.debug('window.open.called');

            var urlParameter = window.location.href;

            if (("#" + window.location.href.split("#")[1]).indexOf(url) == 0) {
                window.history.go(0);
            }
            windowOpenCommand.addQueryParameter({ "url": urlParameter });
            windowOpenCommand.execute(null, null);
        }
    } else {
        window.history.go(0);
        windowOpenCommand.addQueryParameter({ "url": qualifyURL(url) });
        windowOpenCommand.execute(null, null);
    }
};

onCordovaBridgeLoaded('window.open');
