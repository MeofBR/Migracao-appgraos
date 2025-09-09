/* hybrid capacity bootstrap
 *
 * This has to happen after sapui5 bootstrap, and before first application page is loaded.
 */

sap.hybrid = {
	loadCordova: false,

	setCordova: function () {
		sap.hybrid.loadCordova = true;
	},
	_getProperties: function(){
		
		//GetDate and Get6 months ago date
		const my_date_now = new Date();
		var month = my_date_now.getMonth();
		//Last day of month
		var d = new Date(my_date_now.getFullYear(), month + 1, 0);
		//add mes to localstorage
		localStorage.setItem("dataAtualizacao", month);
	
		var dateStringToday = d.toISOString().split("T");
		const todayDate = dateStringToday[0];
		
		const my_date_six_months = new Date(my_date_now.setMonth(my_date_now.getMonth() - 6));
		var dateStringSixMonths = my_date_six_months.toISOString().split("T");
		const sixDate = dateStringSixMonths[0];
	
		
		console.log("HOJE: "+todayDate);
		console.log("SEIS MESES: "+sixDate);
		
		var properties = {
			"name": "store_mainService",
			"host": sap.hybrid.kapsel.appContext.registrationContext.serverHost,
			"port": sap.hybrid.kapsel.appContext.registrationContext.serverPort,
			"https": sap.hybrid.kapsel.appContext.registrationContext.https,
			"serviceRoot": fiori_client_appConfig.appID + "_" + mobile_appRoutes[0].destination,

			"definingRequests": {
				"Prospects": "/Prospects?$expand=Prosp_Code,Prosp_Characteristics,Prosp_Banks,Prosp_Irf",
				"Appointments": "/Appointments?$expand=Appoint_Check,Appoint_Commit,Appoint_Prospect,Appoint_Partner,Appoint_IntObj,Appoint_IntTyp",
				"Token_Outlook": "/Token_Outlook",
				"Crop_Tracking": "/Crop_Tracking?$expand=Crop_Track_Partner,Crop_Track_Material,Crop_Track_Region,Crop_Track_Crop_Year,Crop_Track_Commercialization&$orderby=HCP_CROP_TRACK_ID desc&$top=2000",
				"CropTur_Collection": "/CropTur_Collection?$expand=Crop_Tur_Material,Crop_Tur_Region,Crop_Tur_Year,Crop_Tur_Country",
				"Visit_Certifications": "/Visit_Certifications",
				"Visit_Form_Certifications": "/Visit_Form_Certifications",
				"Visit_Form_Material": "/Visit_Form_Material",
				"Visit_Form_Tools": "/Visit_Form_Tools",
				"Visit_Form_Periodic": "/Visit_Form_Periodic?$expand=Visit_Form_Periodic_Culture_Type,Visit_Form_Partner_Periodic,Visit_Form_Prospect_Periodic",
				"Visit_Form_Yearly": "/Visit_Form_Yearly?$expand=Visit_Form_Yearly_Culture_Type,Visit_Form_Partner_Yearly,Visit_Form_Prospect_Yearly",
				"Visit_Form_Grains": "/Visit_Form_Grains?$expand=Visit_Form_Partner_Grains,Visit_Form_Prospect_Grains",
				"Visit_Form_Industry": "/Visit_Form_Industry?$expand=Visit_Form_Partner_Industry,Visit_Form_Prospect_Industry",
				"Negotiation_Report": "/Negotiation_Report?$expand=Nego_Crop,Nego_Material,Nego_Center",
				"Characteristics": "/Characteristics",
				"Banks": "/Banks",
				"Irf": "/Irf",
				"Prospects_Increment_Code": "/Prospects_Increment_Code",
				"Appointments_Check": "/Appointments_Check",
				"Commitments": "/Commitments",
				"Interact_Objectives": "/Interact_Objectives",
				"Interact_Types": "/Interact_Types",
				"Cancel_Reason": "/Cancel_Reason",
				"Crop_Year": "/Crop_Year",
				"Culture_Type": "/Culture_Type",
				"Visit_Uf_Planting": "/Visit_Uf_Planting",
				"Visit_Culture_Type": "/Visit_Culture_Type",
				"Visit_Storage_Type": "/Visit_Storage_Type?$top=100000",
				"Regions": "/Regions",
				"Crop_Conditions": "/Crop_Conditions",
				"Crop_Tech_Level": "/Crop_Tech_Level",
				"Storage_Type": "/Storage_Type",
				"Visit_Tools": "/Visit_Tools",
				"Visit_Criterion": "/Visit_Criterion",
				"Deposit_Condition": "/Deposit_Condition",
				"View_Users": "/View_Users",
				"View_Suppliers": "/View_Suppliers",
				"View_States": "/View_States",
				"View_Countries": "/View_Countries",
				"View_Purchasing_Org": "/View_Purchasing_Org",
				"View_Locality": "/View_Locality",
				"View_Company_Bank": "/View_Company_Bank",
				"View_Regional_Grouping": "/View_Regional_Grouping",
				"View_Payment_Conditions": "/View_Payment_Conditions",
				"View_Treasury_Group": "/View_Treasury_Group",
				"View_Industrial_Sector": "/View_Industrial_Sector",
				"View_Incotems": "/View_Incotems",
				"View_Irf_Catogory": "/View_Irf_Catogory",
				"View_Irf_CODE": "/View_Irf_CODE",
				"View_Banks": "/View_Banks",
				"View_Companies": "/View_Companies",
				"View_Center": "/View_Center",
				"View_Company_Banks": "/View_Company_Banks",
				//"View_Refused": "/View_Refused",
				"View_Material": "/View_Material",
				"View_City": "/View_City",
				"View_Material_Type": "/View_Material_Type",
				"View_Currency": "/View_Currency",
				"View_Account_Groups": "/View_Account_Groups",
				"View_Visit_Grains": "/View_Visit_Grains",
				"View_Visit_Industry": "/View_Visit_Industry",
				"View_Visit_Yearly": "/View_Visit_Yearly",
				"View_Visit_Periodic": "/View_Visit_Periodic",
				"View_Unit_Measures": "/View_Unit_Measures",
				"View_Grouping_Suppliers": "/View_Grouping_Suppliers",
				"Buyer_Groups": "/Buyer_Groups",
				"Table_Price": "/Table_Price?$expand=Price_Material,Price_Material_Type",
				"View_Material_Type_Price": "/View_Material_Type_Price",
				"Visit_Form_Criterion": "/Visit_Form_Criterion",
				//Sprint 4 
				"Parameters": "/Parameters",
				//"Zv_Fornecedores": "/Zv_Fornecedores", UTILIZAR A V_SUPPLIER
				"Price_Freight": "/Price_Freight",
				"View_Suppliers_Characteristics": "/View_Suppliers_Characteristics",
				"Cancellation_Reason": "/Cancellation_Reason",
				"Offer_Map": "/Offer_Map?$expand=Offer_Cancellation_Reason,Offer_Account_Groups,Offer_Material,Offer_Partner,Offer_Prospect,Offer_Type_Material,Offer_Purchasing_Org,Offer_Map_Werks_association&$filter=HCP_CREATED_AT%20gt%20datetime%27"+sixDate+"%27%20and%20HCP_CREATED_AT%20lt%20datetime%27"+todayDate+"%27",
				"Offer_Map_Werks": "/Offer_Map_Werks?$filter=HCP_CREATED_AT%20gt%20datetime%27"+sixDate+"%27%20and%20HCP_CREATED_AT%20lt%20datetime%27"+todayDate+"%27",
				"Commercialization": "/Commercialization",
				"Price_Intention": "/Price_Intention?$expand=View_Intention_Material_Type,View_Intention_Suppliers",

				//Sprint 5
				"Warehouse_Map": "/Warehouse_Map?$expand=Warehouse_Regions,Warehouse_Suppliers,Warehouse_Prospects",
				"Warehouse_Material": "/Warehouse_Material",
				"Warehouse_Storage_Type": "/Warehouse_Storage_Type",
				"Material_Stocked": "/Material_Stocked",
				"Working_Hours": "/Working_Hours",
				"Warehouse_Visual_Condition": "/Warehouse_Visual_Condition",
				"WM_Storage_Type": "/WM_Storage_Type",
				"Expedition_Condition": "/Expedition_Condition",
				//"Cadence": "/Cadence",
				"Commodities_Fixed_Order": "/Commodities_Fixed_Order?$expand=Fixed_Account_Groups,Fixed_Material,Commodities_Log_Messages_Association,Fixed_Partner&$filter=HCP_CREATED_AT%20gt%20datetime%27"+sixDate+"%27%20and%20HCP_CREATED_AT%20lt%20datetime%27"+todayDate+"%27",
				"Commodities_Historic_Offer": "/Commodities_Historic_Offer",
				"Commodities_Order": "Commodities_Order?$expand=Order_Account_Groups,Order_Material,Order_Partner&$filter=HCP_CREATED_AT%20gt%20datetime%27"+sixDate+"%27%20and%20HCP_CREATED_AT%20lt%20datetime%27"+todayDate+"%27",
				"Commodities_Log_Messages": "/Commodities_Log_Messages",
				"View_Deposity": "/View_Deposity",
				"Incoterms": "/Incoterms",
				"View_Domain": "/View_Domain",
				"Z5133": "/Z5133",
				"Z041028": "/Z041028",
				"Z040041": "/Z040041",
				"Tvarvc": "/Tvarvc",

				//Profile
				/*"View_Profile_Cadence": "/View_Profile_Cadence",
				"View_Profile_Commodities": "/View_Profile_Commodities",
				"View_Profile_Offer_Map_Logistics": "/View_Profile_Offer_Map_Logistics",
				"View_Profile_Offer_Map": "/View_Profile_Offer_Map",
				"View_Profile_Prospects": "/View_Profile_Prospects",
				"View_Profile_Crop": "/View_Profile_Crop",
				"View_Profile_Appointments": "/View_Profile_Appointments",
				"View_Profile_Extract": "/View_Profile_Extract",
				"View_Profile_Warehouse": "/View_Profile_Warehouse",
				"View_Profile_Table_Price": "/View_Profile_Table_Price",
				"View_Profile_Visit": "/View_Profile_Visit",
				"View_Profile_Calculate_Freight": "/View_Profile_Calculate_Freight",
				"View_Profile_Intention_Price": "/View_Profile_Intention_Price",
				"View_Profile_Register": "/View_Profile_Register",
				"View_Profile_Negotiation_Report": "/View_Profile_Negotiation_Report",
				"View_Profile_Werks_Ekorgs": "/View_Profile_Werks_Ekorgs",*/
				"Has_Permissions": "/Has_Permissions",
				
				"Table_Price_Parameters": "/Table_Price_Parameters",
				"User_Logistics": "/User_Logistics",
				
				
				//Tabela auxiliar criação pedido de compra
				"Commodities_Check": "/Commodities_Check",
				
				
				//CR FOTOS OFFLINE
				// "Offline_Picture": "/Offline_Picture"
				
				"Source_Information": "/Source_Information",
				"Players": "/Players",
				"Visit_Form_Commercialization": "/Visit_Form_Commercialization",
				"View_Visit_Commercialization": "/View_Visit_Commercialization",
				"Simplified_Contact": "/Simplified_Contact?$expand=Price_Intention_association,Appointments_association,Offer_Map_association",
				"Simplified_Contact_Log": "/Simplified_Contact_Log",
				"Job_Date": "/Job_Date",
				"Disable_Commercialization": "/Disable_Commercialization",
				"View_Grouping_Provider_Simplified_Contact": "/View_Grouping_Provider_Simplified_Contact",
				"Business_Visit": "/Business_Visit?$expand=Ranking_Add",
				"Business_Visit_Rank": "/Business_Visit_Rank?$expand=Ranking_Name",
				"Ranking": "/Ranking",
				"Simplified_Contact_Visit_Form_Log": "/Simplified_Contact_Visit_Form_Log",
				"ZMM5005": "/ZMM5005",
				"Adms_Croptour": "/Adms_Croptour",
				"Country_Croptour": "/Country_Croptour",
				"Regions_Croptour": "/Regions_Croptour",
				"Crop_Year_Croptour": "/Crop_Year_Croptour?$expand=Crop_Tur_Country_Crop",
				"Crop_Year_Croptour_Dist": "/Crop_Year_Croptour_Dist",
				"Master_Data_Permissions": "/Master_Data_Permissions",
				"View_CropTur_Distinct": "/View_CropTur_Distinct?$expand=View_Country_Unique,View_Regio_Unique"
				
			}
		};
		
		return properties;
	
	},
	packUrl: function (url, route) {
		var result;
		if (route.manual) { // routes requires a manually created Mobile Destination with Rewrite on Backend and via CP App set
			result = route.path; // keep the original path
		} else { // OData routes that can be proxied through the automatically created CP Destination
			var connection = (fiori_client_appConfig.appID + "_" + route.destination).substr(0, 63); // max length cap by SCPms DB
			result = "/" + connection;
		}
		var path = url.substring(route.path.endsWith("/") ? route.path.length - 1 : route.path.length); // the remaining URL path
		result += (route.entryPath ? route.entryPath : "") + path;
		return result;
	},
	appLogon: function (appConfig) {
		var context = {
			"custom": {
				//Desabilita o codigo de segurança default do app mobile
				"disablePasscode": true
			}
		};
		var url = appConfig.fioriURL;
		if (url && (url.indexOf("https://") === 0 || url.indexOf("http://") === 0)) {
			if (url.indexOf("https://") === 0) {
				context.https = true;
				url = url.substring("https://".length);
			} else {
				context.https = false;
				url = url.substring("http://".length);
			}

			if (url.indexOf("?") >= 0) {
				url = url.substring(0, url.indexOf("?"));
			}
			if (url.indexOf("/") >= 0) {
				url = url.split("/")[0];
			}
			if (url.indexOf(":") >= 0) {
				context.serverHost = url.split(":")[0];
				context.serverPort = url.split(":")[1];
			}
		}

		// set auth element
		if (appConfig.auth) {
			context.auth = appConfig.auth;
		}

		// If communicatorId is set then use it to be compatible with existing values. Otherwise, use the default "REST". 
		// By doing so logon core does not need to send ping request to server root URL, which will cause authentication issue. 
		// It occurs when the root URL uses a different auth method from the application's endpoint URL, as application can only handle authentication on its own endpoint URL.
		context.communicatorId = appConfig.communicatorId ? appConfig.communicatorId : "REST";
		//context.refreshSAMLSessionOnResume = appConfig.refreshSAMLSessionOnResume;
		
		if ('serverHost' in context && 'serverPort' in context && 'https' in context) {
			// start SCPms logon - // Start Offline
			sap.hybrid.kapsel.doLogonInit(context, appConfig.appID, sap.hybrid.openStore);
		} else {
			console.error("context data for logon are not complete");
		}
	},
	bootStrap: function () {
		if (sap.hybrid.loadCordova) {
			// bind to Cordova event
			document.addEventListener("deviceready", function () {
				// check if app configuration is available
				if (fiori_client_appConfig && fiori_client_appConfig.appID && fiori_client_appConfig.fioriURL) {
					sap.hybrid.appLogon(fiori_client_appConfig);
				} else {
					console.log("Can't find app configuration probably due to a missing appConfig.js from the app binary.");
				}
			}, false);
		} else {
			console.error("cordova is not loaded");
		}
	},
	loadComponent: function (componentName) {
		sap.ui.getCore().attachInit(function () {
			// not support sap.ushell navigation
			sap.ui.require([
				"sap/m/Shell",
				"sap/ui/core/ComponentContainer"
			], function (Shell, ComponentContainer) {
				// initialize the UI component
				new Shell({
					app: new ComponentContainer({
						height: "100%",
						name: componentName
					})
				}).placeAt("content");
			});
		});
	},
	openStore: function () {
		console.log("In openStore");
	
		jQuery.sap.require("sap.ui.thirdparty.datajs"); //Required when using SAPUI5 and the Kapsel Offline Store
	
		navigator.splashscreen.show();
		
		store = sap.OData.createOfflineStore(sap.hybrid._getProperties());

		//if (localStorage.getItem("appVersion") != '8.3') {
		//	store.clear(clearStoreSuccessCallback, clearStoreErrorCallback);
		//}

		//CallBack Sucesso do Open Store
		var openStoreSuccessCallback = function () {

			console.log("In openStoreSuccessCallback");
			localStorage.setItem("propertiesOffLine", JSON.stringify(sap.hybrid._getProperties()));

			if (!localStorage.getItem("lastUpdate")) {
				localStorage.setItem("lastUpdate", new Date());
			}

			sap.OData.applyHttpClient(); //Offline OData calls can now be made against datajs.
			navigator.splashscreen.hide();
			sap.hybrid.startApp();

		};

		//CallBack Sucesso do Clear Banco de Dados
		var clearStoreSuccessCallback = function () {
			store = sap.OData.createOfflineStore(sap.hybrid._getProperties());
			store.open(openStoreSuccessCallback, openStoreErrorCallback);
		};

		//CallBack Erro do Open Store
		var openStoreErrorCallback = function (error) {

			if (!localStorage.getItem("propertiesOffLine")) {
				// console.log("O Banco de Dados vai ser atualizado.");
				store.clear(clearStoreSuccessCallback, clearStoreErrorCallback);
			} else {
				var oldBd = localStorage.getItem("propertiesOffLine");
				store = sap.OData.createOfflineStore(JSON.parse(oldBd));
				store.open(oldStoreSuccessCallback, openStoreErrorCallback);
			}
		};

		//CallBack Sucesso do Open Store Banco de Dados ANTIGO
		var oldStoreSuccessCallback = function () {
			sap.hybrid.flushStore().then(function () {
				store.clear(clearStoreSuccessCallback, clearStoreErrorCallback);
			});
		};

		//CallBack Erro do Clear Banco de Dados
		var clearStoreErrorCallback = function (error) {
			store.open(openStoreSuccessCallback, openStoreErrorCallback);
		};

		store.open(openStoreSuccessCallback, openStoreErrorCallback);
	},
	refreshStore: function (entity1, entity2, entity3, entity4, entity5, entity6) {
	
			return new Promise(function (resolve, reject) {
				
				//GetDate and Get6 months ago date
				const my_date_now = new Date();
				var month = my_date_now.getMonth();
				//Last day of month
				var d = new Date(my_date_now.getFullYear(), month + 1, 0);
				//add mes to localstorage
				localStorage.setItem("dataAtualizacao", month);
			
				var dateStringToday = d.toISOString().split("T");
				const todayDate = dateStringToday[0];
				
				
				const my_date_six_months = new Date(my_date_now.setMonth(my_date_now.getMonth() - 6));
				var dateStringSixMonths = my_date_six_months.toISOString().split("T");
				const sixDate = dateStringSixMonths[0];
				
				console.log("HOJE: "+todayDate);
				console.log("SEIS MESES: "+sixDate);
				store.definingRequests.Commodities_Fixed_Order = "/Commodities_Fixed_Order?$expand=Fixed_Account_Groups,Fixed_Material,Fixed_Partner&$filter=HCP_CREATED_AT%20gt%20datetime%27"+sixDate+"%27%20and%20HCP_CREATED_AT%20lt%20datetime%27"+todayDate+"%27";             
				store.definingRequests.Commodities_Order = "/Commodities_Order?$expand=Order_Account_Groups,Order_Material,Order_Partner&$filter=HCP_CREATED_AT%20gt%20datetime%27"+sixDate+"%27%20and%20HCP_CREATED_AT%20lt%20datetime%27"+todayDate+"%27";
				store.definingRequests.Offer_Map = "/Offer_Map?$expand=Offer_Cancellation_Reason,Offer_Account_Groups,Offer_Material,Offer_Partner,Offer_Prospect,Offer_Type_Material,Offer_Purchasing_Org,Offer_Map_Werks_association&$filter=HCP_CREATED_AT%20gt%20datetime%27"+sixDate+"%27%20and%20HCP_CREATED_AT%20lt%20datetime%27"+todayDate+"%27";
				store.definingRequests.Offer_Map_Werks = "/Offer_Map_Werks?$filter=HCP_CREATED_AT%20gt%20datetime%27"+sixDate+"%27%20and%20HCP_CREATED_AT%20lt%20datetime%27"+todayDate+"%27";
				store.definingRequests.Simplified_Contact = "/Simplified_Contact?$expand=Price_Intention_association,Appointments_association,Offer_Map_association";
		
			if (!store) {
				console.log("The store must be open before it can be refreshed");
				return;
			}
			if (Array.isArray(entity1)) {
				store.refresh(function () {
					resolve();
				}, function () {
					//sap.m.MessageToast.show("Erro ao atualizar banco offline");
					console.log("Erro ao atualizar banco offline");
					reject();
				}, entity1, sap.hybrid.progressCallback);
			} else if (entity1 && entity2 && entity3 && entity4 && entity5 && entity6) {
				store.refresh(function () {
					resolve();
				}, function () {
					console.log("Erro ao atualizar banco offline");
					reject();
				}, [entity1, entity2, entity3, entity4, entity5, entity6], sap.hybrid.progressCallback);
			} else if (entity1 && entity2 && entity3 && entity4 && entity5) {
				store.refresh(function () {
					resolve();
				}, function () {
					console.log("Erro ao atualizar banco offline");
					reject();
				}, [entity1, entity2, entity3, entity4, entity5], sap.hybrid.progressCallback);
			} else if (entity1 && entity2 && entity3 && entity4) {
				store.refresh(function () {
					resolve();
				}, function () {
					console.log("Erro ao atualizar banco offline");
					reject();
				}, [entity1, entity2, entity3, entity4], sap.hybrid.progressCallback);
			} else if (entity1 && entity2 && entity3) {
				store.refresh(function () {
					resolve();
				}, function () {
					console.log("Erro ao atualizar banco offline");
					reject();
				}, [entity1, entity2, entity3], sap.hybrid.progressCallback);
			} else if (entity1 && entity2) {
				store.refresh(function () {
					resolve();
				}, function () {
					console.log("Erro ao atualizar banco offline");
					reject();
				}, [entity1, entity2], sap.hybrid.progressCallback);
			} else if (entity1) {
				store.refresh(function () {
					resolve();
				}, function () {
					console.log("Erro ao atualizar banco offline");
					reject();
				}, [entity1], sap.hybrid.progressCallback);
			} else {
				store.refresh(function () {
					localStorage.setItem("lastUpdate", new Date());
					resolve();
				}, function () {
					console.log("Erro ao atualizar banco offline");
					reject();
				}, null, sap.hybrid.progressCallback);
				//	console.log('entrou aqui');
				//	store.refresh(sap.hybrid.refreshStoreCallback, sap.hybrid.errorCallback, null, sap.hybrid.progressCallback);
			}
		});
	},
	refreshStoreCallback: function () {
		console.log("Offline events: refreshStoreCallback");
		sap.m.MessageToast.show("Banco atualizado");
	},
	flushStore: function (entities) {
		return new Promise(function (resolve, reject) {
			if (!store) {
				console.log("The store must be open before it can be flushed");
				return;
			}
			store.flush(function () {
				resolve();
				// }, sap.hybrid.errorCallback, entities ? entities.split(",") : null, sap.hybrid.progressCallback);
			}, sap.hybrid.errorCallback, sap.hybrid.progressCallback);
		});
	},
	flushStoreCallback: function () {
		console.log("Offline events: flushStoreCallback");
	},
	errorCallback: function (error) {
		console.log("Offline events: errorCallback");
		//console.log("An error occurred: " + JSON.stringify(error));
		store.cancelFlush(function () {
			console.log("flush parado");
		}, function () {
			console.log("sem processo de flush");
		});
	},	
	cancelFlushStorage: function () {
		store.cancelFlush(function () {
			console.log("flush parado");
		}, function () {
			console.log("sem processo de flush");
		});
	},
	progressCallback: function (progressStatus) {
		// console.log("Offline events: progressCallback");

		var status = progressStatus.progressState;
		var lead = "unknown";
		if (status === sap.OfflineStore.ProgressState.STORE_DOWNLOADING) {
			lead = "Downloading ";
		} else if (status === sap.OfflineStore.ProgressState.REFRESH) {
			lead = "Refreshing ";
		} else if (status === sap.OfflineStore.ProgressState.FLUSH_REQUEST_QUEUE) {
			lead = "Flushing ";
		} else if (status === sap.OfflineStore.ProgressState.DONE) {
			lead = "Complete ";
		} else {
			console.log("Unknown status in progressCallback");
		}
		console.log(lead + "Sent: " + progressStatus.bytesSent + "  Received: " + progressStatus.bytesRecv + "   File Size: " +
			progressStatus.fileSize);

	}
};