    /**
     * appConfig - This object is loaded from index.html when the client is starting up. It
     * determines the default values of each of its keys. Once the application
     * has loaded the values at runtime, these values are copied into AppPreferences,
     * where they can be modified by the user. From that point on, any value in AppPreferences
     * will override any value of the same key here.
     */
    fiori_client_appConfig = {
        /**
         * appID - The appID used to identify the application to the data vault.
         * If you are using SMP, this should be consistent with the appID of the
         * target application. Note that this value is distinct from the packageName,
         * which is mainly used to identify your application in app stores.
         */
        "appID": "com.br.appgraos",
        /**
         * fioriURL - The full URL of the target application. If your application does not
         * use SMP, it will navigate directly to this URL once logon is completed. If your app
         * does use SMP, this URL is parsed and used in the following way:
         *   1. The URL scheme (which must be http or https) determines the inital value
         *      of the 'https' flag for the SMP registration. Similarly, the host and port
         *      in the URL determine their corresponding initial values for the SMP registration.
         *   2. The URL suffix (everything after the host and port) is appended to the URL that
         *      the user registers to.
         * If you are using SMP, you will ultimately want to specify the scheme, host and port of
         * your SMP server, followed by the suffix of the Fiori endpoint. For example:
         *
         * "https://my.smp.server:8081/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html"
         */
        "fioriURL": "",
        /**
         * fioriURLIsSMP - Set this to true if your are using SMP.
         * If set to true, the application will perform SMP registration.
         */
        "fioriURLIsSMP": false,


        /**
         * webviewType - Set webview engine type for fiori client.
         * This property is only supported on iOS and, to a lesser extent, Android.
         * To use UIWebview, set the property to "ui"; to use WKWebview, set the property to "wk".  These
         * values are only supported for iOS, they are ignored on Android.
         * If this property is not specifed or contain an invalid value, then the webview engine type
         * is decided by the settings in cordova config.xml
         * For custom Fiori client, instead using this property, it is recommended to use cordova preference
         * "CordovaWebViewEngine" to set the webview type for better user experience.
         * If you want the launchpad to be rendered by the device browser, you can set the property to "sf".
         * On iOS it will use the SafariViewController, and on Android it will use custom tabs.  Note that
         * this is only supported when fioriURLIsSMP is false.  Android has an additional limitation where
         * the app lifecycle events cannot be captured, so the passcode cannot be enforced.  That means
         * setting this property to "sf" also automatically sets disablePasscode to true on Android.
         */
		 //"webviewType": "wk",

        /**
         * multiUser - A Boolean property to set whether multi-user support is enabled.
         * If set to true, the Logon plugin will allow multiple users to register, each
         * with a different passcode, and provide a mechanism for switching between users.
         * If the properety is set to false or not specified, the Logon plugin will run in single user mode.
         *
         * In the current release, multiUser is only supported on iOS and Windows platforms with SMP/HCPms
         * registration. The property is ignored when running on Andorid platform, or when SMP/HCPms
         * registration is not used.
         **/
         "multiUser": false,

        /**
         * backgroundTask - A Boolean property to set whether background task is enabled.
         * If set to true, the Logon plugin will start a background task when the app enters background, so the pending network connection can continue for few more minutes.
         * If the property is set to false or not specified, the Logon plugin will not start any background task when app enters background.
         *
         * This property is only supported on iOS
         **/
         //"backgroundTask": false,

        /**
         * Certain parameters might be passed to the Certificate Providers.
         * Example:
         *      "certificate": {
         *           "id": "<<CertificateProvider>>",
         *           "config":{
         *               "property": "value", //add provider specifica key/value pairs here.
         *               ...
         *               "propertyN": "valueN"
         *           }
         *       }
         *
         * If the third party certificate provider ID is set to "com.sap.federationprovider" a secondary certificate provider must be supplied.
         * This can be either "com.sap.mobilesecure.certificateService" or any other third party provider.
         * When third party certificate provider is used, you must provide the federated_certificate property in the config JSON structure.
         *    Example:
         *      "certificate": {
         *           "id": "com.sap.federationprovider",
         *           "config":{
         *               "federated_certificate" : "<<CertificateProvider>>",
         *               "property": "value", //add provider specifica key/value pairs here.
         *               ...
         *               "propertyN": "valueN" //parameters will be also made available for the federated_certificate
         *           }
         *       }
         *
         * If a system certificate provider is required, set "certificate": "com.sap.SystemCertProvider".
         * This certificate provider is only available for Android by default.
         */
         "certificate": "",

        /**
         * autoSelectSingleCert - The property is only supported by iOS, and mainly used for Non-SMP registration.
         * When this property is set to true, if there is only one client certificate existing in application keychain, then
         *    the xmlHttpRequest will automatically select it for any client certificate challenges.
         * This property is not used by Android client. For Android client, the user must manually select the certificate when
         *    it is challenged by server at the first time, after that, the application will remember the user's selection and
         *    automatically provide the selected certificate for the same challenges
         * Default value is false
         */
         "autoSelectSingleCert": false,

        /**
         * handleX509 - This property is only supported on Android and iOS.  When true (the default), the Fiori Client will attempt to handle
         * X509 challenges encountered by the webview. Unless a different certificate source was configured, this would mean
         * showing a certificate picker dialog on Android client. When set to false, the Fiori Client will ignore X509 challenges the webview
         * encounters.  Setting this to false can be useful if users are not expected to authenticate with client certificates
         * and it is not easy to configure the server to not give X509 challenges.
         */
        //"handleX509": true,

        /**
         * This property is used to decide server or fiori client logic should handle user logoff.
         * By default, logoff menu is handled by fiori client. If a particular fiori app wants to skip the client side
         * logoff logic, and handle user logoff by server, then it can do so by setting this property to "server"
         */
         //"logoffHandler": "server",

        /**
         * skiphomebuster - The property is used to control whether to append the "homebuster" parameter with a random value when
         *       loading fiori home page.
         * By default when loading fiori url, the fiori client will automatically append the "homebuster" parameter with a random value.
         *       The random value is used to force webview to load the fiori url from remote server instead of from the
         *       local cache. The skiphomebuster property can be used to disable this feature to avoid any server errors caused by the
         *       unknown "homebuster" url parameter
         * Default value is false
         */
         //"skiphomebuster": true,

         /**
         * deleteClientCertificatesOption - The property is only supported by iOS, it is used to decide whether to delete client certificates or not when resetting
         *    the application.
         * By default, resetting the application will delete all client certificates. Setting this property to false to skip deleting the client certificates when resetting
         *    the app. Note when user manually resets the app from settings screen, a checkbox "Clear Client Certifiates" is available to override this settings.
         * Default value is true
         */
         //"deleteClientCertificatesOption" : true,

         /**
	     * appName - The optional property is used for customizing the Fiori application name showing on logon screen. By default, the app name is "SAP Fiori Client" defined in resource file.
	     */
	     //"appName": "My App",

        /**
         * communicatorId - the communicator id for SMP/HCPms registration, default is "REST"
         */
         //"communicatorId" : "REST",

        /**
         * registrationServiceVersion - the registration url version for SMP/HCPms registraiton, only needed when default version used by client does not work
	 * DEPRECATED!: property for forcing registration service version will be removed
         */
         //"registrationServiceVersion" : "latest",

         /**
         * passcodePolicy - Specify the passcodePolicy of the data vault. Note: if you
         * are using SMP, the passcodePolicy is determined by the server.
         * For more information, see documentation of the logon plugin.
         *
         */
         "passcodePolicy":  {
               "expirationDays":"0",
               "hasDigits":"false",
               "hasLowerCaseLetters":"false",
               "hasSpecialLetters":"false",
               "hasUpperCaseLetters":"false",
               "defaultAllowed":"true",
               "lockTimeout":"300",
               "minLength":"8",
               "minUniqueChars":"0",
               "retryLimit":"10",
               "allowFingerprint":"true"
          },

        /**
         * idpLogonURL - This url is used to reload idp logon with username/passcode passed from SAP authenticator for SSO.
         */
        "idpLogonURL": "",

        /**
         * privacyPolicies - this is an optional value for the Usage plugin that can be modified to include
         * additional privacy policies in addition to the SAP Privacy Policy.
         * For more information, see documentation of the Usage plugin.
         */
        //"privacyPolicies": [
        //    {"id": "mycompany", "label": "My Company Privacy Policy", "url": "http://mycompany.com/privacy", "lastUpdated": "2016-11-21T00:00"}
        //],

        // Customization options for the Logon screens, uncomment to use

        /**
         * backgroundImage - Path to the background image used for logon screens
         */
        //"backgroundImage": "../../../background.jpg",

        /**
         * styleSheet - Path to the css file used for logon screens
         */
        //"styleSheet": "../../../custom.css",

        /**
         * hideLogoCopyright - Boolean value to hide the logo and copyright text in the footer of logon screens
         */
        //"hideLogoCopyright": false,

        /**
         * copyrightLogo - Path to the logo image in the footer
         */
        //"copyrightLogo": "img/sapLogo.png",

        /**
         * copyrightMsg - An array of 2 strings to specify 2 lines of copyright text in the footer
         */
        //"copyrightMsg": ["Copyright © 2016 SAP SE.", "All rights reserved."],

        /**
         * disablePasscode - Boolean value to disable the passcode screen
         * Note this value should not be set when multi-user support is enabled.
         */
        //"disablePasscode": false,

        /**
         * allowSavingFormCredentials - boolean value whether the user will be given an option to
         * save their credentials when using form authentication.  Defaults to false.
         */
        //"allowSavingFormCredentials": true,

        /**
         * enableCacheManager - Boolean value to enable/disable the CacheManager plugin.  The
         * default value is true.
         */
        //"enableCacheManager": false,

        /**
         * eulaVersion - The EULA document version. It can be any string, but we recommend using
         * release date to represent the document version.
         * The default value is "0".
         */
        "eulaVersion": "2020-09",

        /**
         * The Privacy Statement document version. It can be any string, but we recommend
         * using release date to represent the document version.
         * The default value is "0".
         */
        "psVersion": "2020-09",

        /**
         * skipPsRegionChecking - Boolean value. Set true to skip region checking, so FC will
         * always pop-up Privacy Statement regardless of mobile device region setting.
         * Set false to enable region checking, so only China region has Privacy Statement in the
         * pop-up dialog. The default value is false.
         */
        //"skipPsRegionChecking": false,

        /**
         * enablePrivacyStatement - Boolean value to enable or disable Privacy Statement in the
         * pop-up dialog.
         * The default value is true.
         */
        //"enablePrivacyStatement": true,

        /**
         * eulaHyperlink - string value. Url of the customized EULA document.
         * The default value is "EULA.html".
         */
        //"eulaHyperlink": "https://www.your-app.com/about/eula.html",

        /**
         * psHyperlink - string value. Url of the customized Privacy Statement document.
         * The default value is "privacy-statement.html".
         */
        //"psHyperlink": "https://www.your-app.com/about/privacy.html",

        /**
         * eulaMsg - string value. A message to be included in the <p></p> tag of the EULA pop-up dialog.
         * If this property is set, then eulaHyperlink will not be used on pop-up dialog.
         */
        //"eulaMsg": "Please scroll down and read the following <a href=\"https://www.your-app.com/about/eula.html\" target=\"_blank\">end user license agreement</a> carefully.",

        /**
         * eulaAndPsMsg - string value. A message to be included in the <p></p> tag of the EULA and PS pop-up dialog.
         * If this property is set, then eulaHyperlink and psHyperlink will not be used on pop-up dialog.
         */
        //"eulaAndPsMsg": "Please scroll down and read the following <a href=\"https://www.your-app.com/about/eula.html\" target=\"_blank\">end user license agreement</a> and <a href=\"https://www.your-app.com/about/privacy.html\" target=\"_blank\">privacy statement</a> carefully.",
        
        /**
         * toolbarGesture - Set this for gesture of tool bar pop-up.
         * This property is only supported on iOS.
         * To use One Finger Double tap, set the property to "onefingerdoubletap".
         * To use Two Finger Double tap, set the property to "twofingerdoubletap".
         * To use Tap and Hold, set the property to "taphold".
         * It will use One Finger Double tap by default if no value set.
         */
        //"toolbarGesture": "onefingerdoubletap",

    };
