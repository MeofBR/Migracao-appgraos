/* Injects this script into the webview in www/index.html */
if (typeof sap === 'undefined') {
	sap = {};
}

if (!sap.Logger) {
	sap.Logger = {};
}

var sap_logger_logCommand = new CordovaBridgeCommand('sap_logger_log_Event');
var _msgId = 0; // an auto-incremental id to identify each message.

function log(message, tag, successCallback, errorCallback, method) {
    ++_msgId;
    // The x-ms-webview has max length limitation on the navigation URL.
    // If the url is too long, the edgehtml.dll will throw uncaught exception:
    // 0x80004003 : 'Parameter 1 is null or undefined.'.
    // To fix it, we divide message into chunks of 500 length.
    const CHUNK_SIZE = 500;
    message = sap.Logger.preprocess(message);
    var msgChunkList = []; // A list containing all the message chunks
    while (message.length > 0) {
        var msgChunk;
        if (message.length > CHUNK_SIZE) {
            msgChunk = message.slice(0, CHUNK_SIZE);
            message = message.slice(CHUNK_SIZE);
        } else {
            msgChunk = message.slice(0);
            message = "";
        }
        msgChunkList.push('[msgId=' + _msgId + '] | ' + msgChunk);
    }

    // Note: use a wrapper function to make a copy of msgChunkList and pass into the inner callbacks.
    (function () {
        var innerMsgChunkList = msgChunkList.slice(0);

        // A promise to print the logMessage
        var logPromise = function (logMessage) {
            return new Promise(function (resolve, reject) {
                sap_logger_logCommand.addQueryParameter({ options: JSON.stringify({ message: logMessage, tag: tag, method: method }) });
                sap_logger_logCommand.execute(resolve, reject);
            });
        };

        var finalPromise = Promise.resolve();
        innerMsgChunkList.forEach(function (chunk) {
            // For each chunk, create a promise for printing.
            var p = logPromise(chunk);
            finalPromise = finalPromise.then(p).catch(errorCallback);
        });

        // Now finalPromise is the Promise for printing last chunk. Invoke successCallback after it completed.
        finalPromise.then(successCallback).catch(errorCallback);
    })();
}

sap.Logger.debug = function (message, tag, successCallback, errorCallback) {
	log(message, tag, successCallback, errorCallback, 'debug');
};

sap.Logger.info = function (message, tag, successCallback, errorCallback) {
	log(message, tag, successCallback, errorCallback, 'info');
};

sap.Logger.warn = function (message, tag, successCallback, errorCallback) {
	log(message, tag, successCallback, errorCallback, 'warn');
};

sap.Logger.error = function (message, tag, successCallback, errorCallback) {
	log(message, tag, successCallback, errorCallback, 'error');
};

sap.Logger.preprocess = function(message) {
    if (typeof message === "undefined") {
        message = "undefined";
    } else if (message.constructor.name === "Error") {
        message = message.stack;
    } else if (typeof message !== "string") {
        message = JSON.stringify(message);
    }
    return message;
};

if (typeof console === 'undefined') {
	console = {};
}

console.debug = function (message) {
	sap.Logger.debug(message, 'CONSOLE - SERVER CORDOVA BRIDGE', null, null);
};

console.info = function (message) {
	sap.Logger.info(message, 'CONSOLE - SERVER CORDOVA BRIDGE', null, null);
};

console.log = console.info;

console.warn = function (message) {
	sap.Logger.warn(message, 'CONSOLE - SERVER CORDOVA BRIDGE', null, null);
};

console.error = function (message) {
	sap.Logger.error(message, 'CONSOLE - SERVER CORDOVA BRIDGE', null, null);
};

console.trace = function (message) {
    message = sap.Logger.preprocess(message);
    message += " " + new Error().stack;
    sap.Logger.debug(message, 'CONSOLE - SERVER CORDOVA BRIDGE', null, null);
};

onCordovaBridgeLoaded('sap.Logger');
