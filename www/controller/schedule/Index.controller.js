/* global cordova */
/* global MicrosoftGraph */
/* global CheckGPS */
sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.schedule.Index", {
		formatter: formatter,
		onInit: function () {
			

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("schedule.Index").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel(), "planningCalendarModel");
			this.getView().byId("detail").setModel(this.getView().getModel("planningCalendarModel"));
			this.getView().byId("map").setModel(this.getView().getModel("planningCalendarModel"));
			this.getView().byId("masterPage").setModel(this.getView().getModel("planningCalendarModel"));
			var oComponent = this.getOwnerComponent();
			var oDeviceModel = oComponent.getModel("device");
			this.getView().setModel(oDeviceModel, "device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			var oGeoMap = this.getView().byId("GeoMap");
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			this.browserRef = window;
			
			var oGeoMap = this.getView().byId("GeoMap");
            var oMapConfig = {
                "MapProvider": [{
                    "name": "HEREMAPS",
                    "type": "",
                    "description": "",
                    "tileX": "256",
                    "tileY": "256",
                    "maxLOD": "20",
                    "copyright": "Tiles Courtesy of HERE Maps",
                    "Source": [{
                        "id": "s1",
                        "url": "https://maps.hereapi.com/v3/base/mc/{LOD}/{X}/{Y}/png8?apiKey=GBbgU5wK1E9FNRKVZ4BSBcqEdyohjTbiP0pVxvRiQP0&style=explore.day"
                    }, {
                        "id": "s2",
                        "url": "https://maps.hereapi.com/v3/base/mc/{LOD}/{X}/{Y}/png8?apiKey=GBbgU5wK1E9FNRKVZ4BSBcqEdyohjTbiP0pVxvRiQP0&style=explore.day"
                    }]
                }],
                "MapLayerStacks": [{
                    "name": "DEFAULT",
                    "MapLayer": {
                        "name": "layer1",
                        "refMapProvider": "HEREMAPS",
                        "opacity": "1.0",
                        "colBkgnd": "RGB(255,255,255)"
                    }
                }]
            };

            oGeoMap.setMapConfiguration(oMapConfig);
            oGeoMap.setRefMapLayerStack("DEFAULT");

			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false,
				isWeb: false
			}), "indexModel");
		},
		
		handleRouteMatched: function (oEvent) {
			var oComponent = this.getOwnerComponent();
			var oDeviceModel = oComponent.getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			this.count = 0;
			this.revertCount = 20;
			this.hasFinished = false;

			this.getUser().then(function (userName) {
				this.userName = userName;
				this.initializePlanningCalendar(false, false);
			}.bind(this));

			var lastUpdate;

			var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/yyyy HH:mm"
			});

			if (localStorage.getItem("lastUpdateSchedule")) {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdateSchedule")));
			} else {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdate")));
			}
			this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdate);

			if (bIsMobile) {
				this.getView().getModel("indexModel").setProperty("/isMobile", true);
				this.getView().getModel("indexModel").setProperty("/isWeb", false);

			} else {
				this.getView().getModel("indexModel").setProperty("/isMobile", false);
				this.getView().getModel("indexModel").setProperty("/isWeb", true);
			}
			
			this.urlData = null;
			
			if(oEvent.getParameter("data").partner || oEvent.getParameter("data").keyData){
				
				let oDataUrl = [];
				
				oDataUrl["HCP_APPOINTMENTS"] = '1';
				oDataUrl["HCP_NAME"] = oEvent.getParameter("data").partner;
				oDataUrl["HCP_NAME_DESC"] = decodeURIComponent(oEvent.getParameter("data").partnerName);
				oDataUrl["Data"] = JSON.parse(decodeURIComponent(oEvent.getParameter("data").keyData));
				this.urlData = oDataUrl;
				
				setTimeout(function(){ // Aguarda 1 segundos.
					if(this.urlData && this.urlData.Data){
						this.getView().byId("addButton").firePress();
					}
					else{
						this.getView().byId("addButton").firePress();
						this.getView().getModel("planningCalendarModel").setProperty("/newAppointment", this.urlData);
					}
					this.urlData = null;
                }.bind(this), 1000);
			} else
				this.urlData = null;
		},
		
		handleAppointmentCreate: function (oEvent) {
			if(this.urlData){
				if(this.urlData.Data == null)
					this._createNewScheduleDialog(oEvent.getSource(), "create", false);
				else{
					let oData = this.urlData.Data
					let bHasToValidate = oData.HCP_STATUS !== "1" ? false : true;
					this._createNewScheduleDialog(oEvent.getSource(), "edit", bHasToValidate);
				}
			} else {
				this._createNewScheduleDialog(oEvent.getSource(), "create", false);
			}
		},
		
		handleAppointmentSelect: function (oEvent) {
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var oAppointment = oEvent.getParameter("appointment");
			var oBindingContextPath = oAppointment.getBindingContext("planningCalendarModel").getPath();
			var oData = oPlanningModel.getProperty(oBindingContextPath);
			var bHasToValidate = oData.HCP_STATUS !== "1" ? false : true;

			if (oData.HCP_FROM_APP !== "1") {
				this._createNewOutlookScheduleDialog(oAppointment, oBindingContextPath);
			} else {
				this._createNewScheduleDialog(oAppointment, "edit", bHasToValidate);
			}
		},

		refreshDataBase: function () {

			this.count = 0;
			this.revertCount = 20;
			this.hasFinished = false;
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			var aRefreshView = ["Appointments", "Appointments_Check", "Token_Outlook"];

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

				var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd/MM/yyyy HH:mm"
				});

				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				var sMessage =
					"Tem certeza que deseja atualizar a base da Agenda? O tempo do processo varia de acordo com a quantidade de compromissos do seu outlook.";

				MessageBox.warning(
					sMessage, {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {

								//this.verifyTimeOut();

								this.setBusyDialog(
									this.resourceBundle.getText("textGrainApp"), this.resourceBundle.getText("textWait"));
								this.flushStore(
									"Appointments,Appointments_Check,Token_Outlook"
								).then(function () {
									this.refreshStore(aRefreshView).then(function () {

										localStorage.setItem("lastUpdateSchedule", new Date());
										var lastUpdateSchedule = dateFormat.format(new Date(localStorage.getItem("lastUpdateSchedule")));

										this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdateSchedule);
										this.getView().getModel().refresh(true);
										//this.hasFinished = true;
										//this.getView().byId("pullToRefreshID").hide();
										this.closeBusyDialog();
									}.bind(this));
								}.bind(this));
							}
						}.bind(this)
					}
				);

			} else {

				this.getView().getModel().refresh(true);
				//this.getView().byId("pullToRefreshID").hide();
				this.closeBusyDialog();
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				var sMessage = "Conexão com internet não encontrada, verifique e tente novamente!";

				MessageBox.warning(
					sMessage, {
						actions: [sap.m.MessageBox.Action.OK],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {}.bind(this)
					}
				);

			}
		},

		refreshData: function () {

			var oComponent = this.getOwnerComponent();
			var oDeviceModel = oComponent.getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			this.count = 0;
			this.revertCount = 20;
			this.hasFinished = false;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				this.getTokenAndInitializeThings();
			} else {
				this.closeBusyDialog();
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				var sMessage = "Conexão com internet não encontrada, verifique e tente novamente!";
				MessageBox.warning(
					sMessage, {
						actions: [sap.m.MessageBox.Action.OK],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {}.bind(this)
					}
				);
			}
		},

		getTokenAndInitializeThings: function (userName) {
			var oSplitApp = this.getView().byId("SplitContDemo");
			var oModel = this.getOwnerComponent().getModel();
			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_USER_ID',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.userName
			}));

			oModel.read("/Token_Outlook", {
				filters: aFilters,
				success: function (oResults) {
					if (oResults.results.length > 0) {
						this.outlookToken = oResults.results[0].HCP_TOKEN;
						this.outlookTokenExpirationDate = oResults.results[0].HCP_EXPIRATION_DATE;
						var sTokenExpirationDate = oResults.results[0].HCP_EXPIRATION_DATE;

						if (sTokenExpirationDate < new Date()) {
							this.refreshStore("Token_Outlook").then(function () {
								this.closeBusyDialog();
								oModel.read("/Token_Outlook", {
									filters: aFilters,
									success: function (oResults) {
										if (oResults.results.length > 0) {
											this.outlookToken = oResults.results[0].HCP_TOKEN;
											this.outlookTokenExpirationDate = oResults.results[0].HCP_EXPIRATION_DATE;
											var sTokenExpirationDate = oResults.results[0].HCP_EXPIRATION_DATE;

											if (sTokenExpirationDate < new Date()) {
												// oSplitApp.hideMaster();
												// oSplitApp.to(this.createId("outlookLoginID"));
												this.onOutlookLoginPress(true);
											} else {
												this.outlookClient = MicrosoftGraph.Client.init({
													authProvider: (done) => {
														done(null, this.outlookToken);
													}
												});
												this.initializePlanningCalendar(true);
											}
										} else {
											// oSplitApp.hideMaster();
											// oSplitApp.to(this.createId("outlookLoginID"));
											// sap.m.MessageToast.show("Token Inválido");
											this.onOutlookLoginPress(false);
										}
									}.bind(this),
									error: function () {
										console.log("Falha ao Buscar Token");
									}
								});
							}.bind(this));
						} else {
							this.outlookClient = MicrosoftGraph.Client.init({
								authProvider: (done) => {
									done(null, this.outlookToken);
								}
							});
							this.initializePlanningCalendar(true);
						}
					} else {
						// oSplitApp.hideMaster();
						// oSplitApp.to(this.createId("outlookLoginID"));
						// sap.m.MessageToast.show("Token Inválido");
						this.onOutlookLoginPress(false);
					}
				}.bind(this),
				error: function () {
					console.log("Falha ao Buscar Token");
				}
			});
		},

		refreshStore: function (entity1, entity2, entity3, entity4) {

			return new Promise(function (resolve, reject) {
				if (typeof sap.hybrid !== 'undefined') {
					this.setBusyDialog("App Grãos", "Atualizando Agenda");
					sap.hybrid.refreshStore(entity1, entity2, entity3, entity4).then(function () {
						resolve();
					}.bind(this));
				} else {
					resolve();
				}
			}.bind(this));
		},

		flushStore: function (entities) {
			return new Promise(function (resolve, reject) {
				if (typeof sap.hybrid !== 'undefined') {
					sap.hybrid.flushStore(entities).then(function () {
						resolve();
					});
				} else {
					resolve();
				}
			}.bind(this));

		},

		syncSchedulesWithOutlook: function (aSchedules) {
			this.setBusyDialog("Outlook", "Sincronizando Informações com o Outlook");
			return new Promise(function (resolve, reject) {
				var aPromises = [];
				if (aSchedules) {
					var aPendingCreate = aSchedules.filter(schedule => schedule.HCP_OUTLOOK_STATUS === "1");
					var aPendingUpdate = aSchedules.filter(schedule => schedule.HCP_OUTLOOK_STATUS === "2");
					var aPendingCancel = aSchedules.filter(schedule => schedule.HCP_OUTLOOK_STATUS === "3");
				}

				if (aPendingCreate) {
					for (var schedule of aPendingCreate) {
						aPromises.push(new Promise(function (resolve, reject) {
							this.createOutlookSchedule(schedule).then(function (response) {
								resolve(response);
							}).catch(error => {
								reject(error);
							});
						}.bind(this)));
					}
				}

				if (aPendingUpdate) {
					for (var schedule of aPendingUpdate) {
						aPromises.push(new Promise(function (resolve, reject) {
							this.updateOutlookSchedule(schedule).then(function (response) {
								resolve(response);
							}).catch(error => {
								reject(error);
							});
						}.bind(this)));
					}
				}

				if (aPendingCancel) {
					for (var schedule of aPendingCancel) {
						aPromises.push(new Promise(function (resolve, reject) {
							this.cancelOutlookSchedule(schedule).then(function (response) {
								resolve(response);
							}).catch(error => {
								reject(error);
							});
						}.bind(this)));
					}
				}

				Promise.all(aPromises).then(schedules => {
					this.closeBusyDialog();
					var oModel = this.getView().getModel();
					var oPlanningModel = this.getView().getModel("planningCalendarModel");
					var aDeferredGroups = oModel.getDeferredGroups();
					oModel.setUseBatch(true);

					if (aDeferredGroups.indexOf("changes") < 0) {
						aDeferredGroups.push("changes");
						oModel.setDeferredGroups(aDeferredGroups);
					}

					if (schedules.length > 0) {
						oPlanningModel.setProperty("/hasBatchOperations", true);
					}

					for (var schedule of schedules) {
						if (schedule.operation === "create") {
							oModel.update("/Appointments(" + schedule.originSchedule.HCP_APPOINT_ID + ")", {
								HCP_OUTLOOK_STATUS: "4",
								HCP_OUTLOOK_ID: schedule.createdEvent.id
							}, {
								groupId: "changes"
							});
						} else {
							oModel.update("/Appointments(" + schedule.originSchedule.HCP_APPOINT_ID + ")", {
								HCP_OUTLOOK_STATUS: "4"
							}, {
								groupId: "changes"
							});
						}
					}
					// console.log(schedule);
					resolve();
				}).catch(errors => {
					console.log(errors);
					resolve();
				});
			}.bind(this));
		},

		createOutlookSchedule: function (schedule) {
			return new Promise(function (resolve, reject) {
				var aBody = {
					subject: schedule.Appoint_Commit.HCP_COMMITMENT_DESC + " App",
					start: {
						dateTime: schedule.HCP_START_DATE,
						timezone: "UTC 00:00"
					},
					end: {
						dateTime: schedule.HCP_END_DATE,
						timezone: "UTC 00:00"
					},
					body: {
						contentType: "HTML",
						content: schedule.HCP_COMMENTS
					}
				};

				this.outlookClient
					.api('/me/events')
					.post(
						aBody, (err, res) => {
							var oResponse = {
								createdEvent: res,
								originSchedule: schedule,
								operation: "create"
							};
							resolve(oResponse);
						});
			}.bind(this));
		},

		updateOutlookSchedule: function (schedule) {
			return new Promise(function (resolve, reject) {
				var aBody = {
					subject: schedule.Appoint_Commit.HCP_COMMITMENT_DESC,
					start: {
						dateTime: schedule.HCP_START_DATE,
						timezone: "UTC-03:00"

					},
					end: {
						dateTime: schedule.HCP_END_DATE,
						timezone: "UTC-03:00"
					},
					body: {
						contentType: "HTML",
						content: schedule.HCP_COMMENTS
					}
				};

				this.outlookClient
					.api('/me/events/' + schedule.HCP_OUTLOOK_ID)
					.patch(
						aBody, (err, res) => {
							if (err) {
								reject(err);
							} else {
								var oResponse = {
									createdEvent: res,
									originSchedule: schedule,
									operation: "update"
								};
								resolve(oResponse);
							}
						});
			}.bind(this));
		},

		cancelOutlookSchedule: function (schedule) {
			return new Promise(function (resolve, reject) {
				if (schedule.HCP_OUTLOOK_ID) {
					this.outlookClient
						.api('/me/events/' + schedule.HCP_OUTLOOK_ID)
						.delete((err, res) => {
							var oResponse = {
								createdEvent: res,
								originSchedule: schedule,
								operation: "delete"
							};
							resolve(oResponse);
						});
				} else {
					resolve({});
				}

			}.bind(this));
		},

		getOutlookSchedules: function () {
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYY-MM-dd"
			});
			var sDate = dateFormat.format(new Date());
			return new Promise(function (resolve, reject) {
				if (this.outlookClient) {
					this.outlookClient
						.api('/me/events')
						.select('subject,start,end,createdDateTime,bodyPreview,isCancelled')
						.orderby('createdDateTime DESC')
						.filter("start/dateTime ge '" + sDate + "'")
						.top(100)
						.get((err, res) => {
							if (err) {
								sap.m.MessageToast.show("Falha ao Buscar Compromissos do Outlook.");
							} else {
								var aEvents = res.value;
								resolve(aEvents);
								// var outlookData = that.mountOutlookCalendarData(faEvents);
								// that.initializePlanningCalendar();
							}
						});
				}
			}.bind(this));
		},

		formatDate: function (oDate) {
			var oExplodedDate = oDate.split("/");

			return oExplodedDate[2] + "-" + oExplodedDate[1] + "-" + oExplodedDate[0];
		},

		setBusyDialog: function (aTitle, aMessage) {
			var timestamp = new Date().getTime();
			if (!this.busyDialog) {
				this.busyDialog = new sap.m.BusyDialog("busyDialogID" + this.getView().getId() + timestamp);
			}
			this.busyDialog.setText(aMessage);
			this.busyDialog.setTitle(aTitle);
			this.busyDialog.open();
		},

		closeBusyDialog: function () {
			if (this.busyDialog) {
				this.busyDialog.close();
			}
		},

		mountOutlookCalendarData: function (aEvents) {
			var aNotCancelledEvents = aEvents.filter(event => event.isCancelled === false);
			var aOutlookEvents = [];
			if (aNotCancelledEvents.length > 0) {
				for (var event of aNotCancelledEvents) {
					aOutlookEvents.push({
						HCP_START_DATE: new Date(event.start.dateTime),
						HCP_END_DATE: new Date(event.end.dateTime),
						HCP_COMMITMENT_DESC: event.bodyPreview,
						OutlookID: event.id,
						Subject: event.subject
					});
				}
			}
			this.aOutlookEvents = aOutlookEvents;
		},

		onOutlookLoginPress: function (bTokenExpired) {
			this.tokenOutlook = null;
			this.tokenExpirationDate = null;
			this.outlookCounter = 0;
			var oComponent = this.getOwnerComponent();
			var oDeviceModel = oComponent.getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			// this.setBusyDialog("Redirecionamento", "Aguarde");
			var oModel = this.getOwnerComponent().getModel();
			var aFilters = [];
			var outlookWindow;

			aFilters.push(new sap.ui.model.Filter({
				path: "BNAME",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.userName.toString().toUpperCase()
			}));

			oModel.read("/View_Users", {
				filters: aFilters,
				success: function (response) {

					//if (response.results.length > 0) {

					this.authEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?';
					this.redirectUri = 'https://addressmanagerapplicane6300ec0.br1.hana.ondemand.com/address-manager-application';
					this.appId = '53990030-7e82-4622-ba69-4fc83920de7f';
					this.scopes =
						'openid profile Calendars.ReadWrite';
					this.cryptObj = window.crypto || window.msCrypto;

					var authState = this.guid();
					var authNonce = this.guid();
					var authParams = {
						response_type: 'token',
						client_id: this.appId,
						redirect_uri: this.redirectUri,
						scope: this.scopes,
						state: authState,
						nonce: authNonce,
						response_mode: 'fragment',
						login_hint: response.results[0].EMAIL
					};
					var url = this.authEndpoint + $.param(authParams);

					this.invalidateCookie("token");
					this.invalidateCookie("tokenExpiration");

					if (bIsMobile) {
						outlookWindow = cordova.InAppBrowser.open(url, '_blank', 'Fullscreen=yes', "tokenWindow");
						this.listenToMobileToken(bTokenExpired, outlookWindow);
					} else {
						outlookWindow = window.open(url, '_blank', 'Fullscreen=yes', "tokenWindow");
						this.listenToToken(bTokenExpired, outlookWindow);
					}

					//sap.m.MessageToast.show(response.results.length);
					// window.localStorage.setItem("originalHistoryBeforeNav", window.history.length + 2);
					// window.location.href = 'https://addressmanagerapplicane6300ec0.br1.hana.ondemand.com/address-manager-application?#email=' +
					// 	response.results[0].EMAIL + '?#originalHistory=' + (parseInt(window.history.length + 2));
				}.bind(this),
				error: function () {
					// window.localStorage.setItem("originalHistoryBeforeNav", window.history.length + 2);
					// window.location.href = 'https://addressmanagerapplicane6300ec0.br1.hana.ondemand.com/address-manager-application?#email=' +
					// 	'?#originalHistory=' + window.history.length + 2;
				}
			});
		},

		listenToToken: function (bTokenExpired, outlookWindow) {
			this.outlookCounter = this.outlookCounter + 1;
			setTimeout(function () {
				var sToken = this.getCookie("token");
				var sExpirationDate = this.getCookie("tokenExpiration");

				if (sToken.length > 0) {
					outlookWindow.close();

					this.saveToken(sToken, sExpirationDate, bTokenExpired).then(function (response) {
						this.initializePlanningCalendar(true);
					}.bind(this)).catch(function (error) {
						console.log(error);
					}.bind(this));
				} else {
					if (this.outlookCounter < 40) {
						this.listenToToken(bTokenExpired, outlookWindow);
					} else {
						sap.m.MessageToast.show(
							"Autenticação interrompida, a intergração com o Outlook não será realizada dessaa vez. Atualize a agenda para tentar novamente."
						);
						this.initializePlanningCalendar(false, true);
					}
				}
			}.bind(this), 500);
		},

		listenToMobileToken: function (bTokenExpired, outlookWindow) {

			var sToken;
			var sExpirationDate;
			var nameInterval;

			outlookWindow.addEventListener("loadstop", function () {
				nameInterval = setInterval(function () {
					outlookWindow.executeScript({
						code: "sessionStorage.getItem('token')"
							// code: "this.getCookie('token');this.getCookie('tokenExpiration')"
					}, function (values) {
						sToken = values[0];
						if (sToken) {
							outlookWindow.executeScript({
								code: "sessionStorage.getItem('tokenExpiration')"
									// code: "this.getCookie('token');this.getCookie('tokenExpiration')"
							}, function (values2) {
								sExpirationDate = values2[0];
								if (sExpirationDate) {
									clearInterval(nameInterval);
									outlookWindow.close();
									this.tokenOutlook = sToken;
									this.tokenExpirationDate = sExpirationDate;
								}
							}.bind(this));
						}
					}.bind(this));
				}.bind(this), 1000);
			}.bind(this));

			outlookWindow.addEventListener('exit', function () {
				clearInterval(nameInterval);
			});

			this.listenForSaveToken(bTokenExpired);

		},

		listenForSaveToken: function (bTokenExpired) {
			var intervalLimit = 0;
			var nameInterval = setInterval(function () {
				intervalLimit = intervalLimit + 1;
				if (intervalLimit < 60) {
					if (this.tokenOutlook && this.tokenExpirationDate) {
						clearInterval(nameInterval);
						setTimeout(function () {
							this.saveToken(this.tokenOutlook, this.tokenExpirationDate, bTokenExpired).then(function (response) {
								this.initializePlanningCalendar(true);
								return;
							}.bind(this)).catch(function (error) {
								console.log(error);
							}.bind(this));
						}.bind(this), 500);
					}
				} else {
					clearInterval(nameInterval);
					sap.m.MessageToast.show(
						"Autenticação interrompida, a intergração com o Outlook não será realizada dessaa vez. Atualize a agenda para tentar novamente."
					);
					this.initializePlanningCalendar(false, true);
				}
			}.bind(this), 1000);
		},

		saveToken: function (sToken, sExpirationDate, bTokenExpired) {
			var oComponent = this.getOwnerComponent();
			var oDeviceModel = oComponent.getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			return new Promise(function (resolve, reject) {
				var oModel = this.getView().getModel();

				if (bTokenExpired) {
					oModel.update("/Token_Outlook('" + this.userName + "')", {
						HCP_TOKEN: sToken,
						HCP_EXPIRATION_DATE: new Date(decodeURIComponent(sExpirationDate)),
						HCP_UPDATED_AT: new Date()
					}, {
						success: function () {
							this.outlookToken = sToken;
							this.outlookClient = MicrosoftGraph.Client.init({
								authProvider: (done) => {
									done(null, this.outlookToken);
								}
							});
							if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
								this.flushStore("Token_Outlook").then(function () {
									this.closeBusyDialog();
									resolve();
								}.bind(this));
							} else {
								this.closeBusyDialog();
								resolve();
							}
						}.bind(this),
						error: function () {
							this.closeBusyDialog();
							reject();
						}.bind(this)
					});
				} else {
					oModel.createEntry("/Token_Outlook", {
						properties: {
							HCP_USER_ID: this.userName,
							HCP_TOKEN: sToken,
							HCP_EXPIRATION_DATE: new Date(decodeURIComponent(sExpirationDate)),
							HCP_UPDATED_AT: new Date(),
							HCP_CREATED_AT: new Date()
						},
						success: function () {
							this.outlookToken = sToken;
							this.outlookClient = MicrosoftGraph.Client.init({
								authProvider: (done) => {
									done(null, this.outlookToken);
								}
							});
							if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
								this.flushStore("Token_Outlook").then(function () {
									this.closeBusyDialog();
									resolve();
								}.bind(this));
							} else {
								this.closeBusyDialog();
								resolve();
							}
						}.bind(this),
						error: function () {
							this.closeBusyDialog();
							reject();
						}.bind(this)
					});
					oModel.submitChanges();
				}
			}.bind(this));
		},

		setCookie: function (cname, cvalue, exdays) {
			var d = new Date();
			d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
			var expires = "expires=" + d.toUTCString();
			document.cookie = cname + "=" + cvalue + ";" + expires + ";domain=.hana.ondemand.com;path=/";
		},

		getCookie: function (cname) {
			var name = cname + "=";
			var ca = document.cookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) == 0) {
					return c.substring(name.length, c.length);
				}
			}
			return "";
		},

		invalidateCookie: function (cname) {
			document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC;domain=.hana.ondemand.com;path=/;";
		},

		guid: function () {
			var buf = new Uint16Array(8);
			this.cryptObj.getRandomValues(buf);

			function s4(num) {
				var ret = num.toString(16);
				while (ret.length < 4) {
					ret = '0' + ret;
				}
				return ret;
			}
			return s4(buf[0]) + s4(buf[1]) + '-' + s4(buf[2]) + '-' + s4(buf[3]) + '-' +
				s4(buf[4]) + '-' + s4(buf[5]) + s4(buf[6]) + s4(buf[7]);
		},

		// onAfterRendering: function () {
		// 	this.initializePlanningCalendar();
		// },

		onFeedListPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext("planningCalendarModel") || this._oNewScheduleDialog.getBindingContext(
				"planningCalendarModel");
			var oPath = oBindingContext.getPath();
			this.selectedDailyAppointment = oPath;
			var oSplitApp = this.getView().byId("SplitContDemo");
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var oData = oPlanningModel.getProperty(this.selectedDailyAppointment);
			var bNeedLocation = oData.HCP_STATUS === "1" || oData.HCP_STATUS === "2" ? true : false;
			var bCanDoCheck = oData.HCP_START_DATE.getDate() > new Date().getDate() || oData.HCP_START_DATE.getMonth() !== new Date().getMonth() ||
				oData.HCP_START_DATE.getFullYear() !== new Date().getFullYear() ? false : true;
			var isFromApp = oData.HCP_FROM_APP === "1" ? true : false;
			var oView = this;

			var oComponent = this.getOwnerComponent();
			var oDeviceModel = oComponent.getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if (oData.HCP_NAME) {

				if (isFromApp) {
					if (bCanDoCheck) {
						oSplitApp.to(this.createId("map"));
						oSplitApp.hideMaster();
						this.getView().byId("map").setBusy(true);
						if (this._oNewScheduleDialog) {
							this._oNewScheduleDialog.close();
						}
						if (bNeedLocation) {

							if (bIsMobile) {

								cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {

									if (enabled == "1") {
										navigator.geolocation.getCurrentPosition(function (position) {
											var iLat = position.coords.latitude;
											var iLong = position.coords.longitude;
											var oGeoMap = oView.getView().byId("GeoMap");
											oPlanningModel.setProperty("/lat", iLat);
											oPlanningModel.setProperty("/long", iLong);
											oView.getView().byId("map").bindElement(oView.selectedDailyAppointment);
											oView.getView().byId("map").setBusy(false);
										}.bind(this), function (error) {
											var iLat = 0;
											var iLong = 0;
											var oGeoMap = oView.getView().byId("GeoMap");
											oPlanningModel.setProperty("/lat", iLat);
											oPlanningModel.setProperty("/long", iLong);
											oView.getView().byId("map").bindElement(oView.selectedDailyAppointment);
											oView.getView().byId("map").setBusy(false);
											sap.m.MessageToast.show("Localização do GPS não encontrada.");
										}.bind(this), {
											timeout: 15000,
											enableHighAccuracy: true
										});
									} else {

										sap.m.MessageBox.show(
											"Localização desativada, deseja ativar?", {
												title: "Localização não encontrada",
												icon: sap.m.MessageBox.Icon.INFORMATION,
												actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
												onClose: function (oAction) {
													if (oAction === "YES") {

														var oSplitApp = oView.getView().byId("SplitContDemo");
														oSplitApp.backMaster();

														if (window.cordova && window.cordova.plugins.settings) {
															window.cordova.plugins.settings.open("location", function () {
																	console.log('opened settings');
																},
																function () {
																	console.log('failed to open settings');
																}
															);
														} else {
															console.log('openNativeSettingsTest is not active!');
														}
													} else {
														navigator.geolocation.getCurrentPosition(function (position) {
															var iLat = position.coords.latitude;
															var iLong = position.coords.longitude;
															var oGeoMap = oView.getView().byId("GeoMap");
															oPlanningModel.setProperty("/lat", iLat);
															oPlanningModel.setProperty("/long", iLong);
															oView.getView().byId("map").bindElement(oView.selectedDailyAppointment);
															oView.getView().byId("map").setBusy(false);
														}.bind(this), function (error) {
															var iLat = 0;
															var iLong = 0;
															var oGeoMap = oView.getView().byId("GeoMap");
															oPlanningModel.setProperty("/lat", iLat);
															oPlanningModel.setProperty("/long", iLong);
															oView.getView().byId("map").bindElement(oView.selectedDailyAppointment);
															oView.getView().byId("map").setBusy(false);
															sap.m.MessageToast.show(
																"Localização do GPS não encontrada, para melhorar sua navegação verifique se o GPS está ativado.");
														}.bind(this), {
															timeout: 1000,
															enableHighAccuracy: true
														});

													}
												}.bind(this)
											}
										);
									}

								}, function (error) {
									console.error("The following error occurred: " + error);
								});

							} else {
								navigator.geolocation.getCurrentPosition(function (position) {
									var iLat = position.coords.latitude;
									var iLong = position.coords.longitude;
									var oGeoMap = this.getView().byId("GeoMap");
									oPlanningModel.setProperty("/lat", iLat);
									oPlanningModel.setProperty("/long", iLong);
									this.getView().byId("map").bindElement(this.selectedDailyAppointment);
									this.getView().byId("map").setBusy(false);
								}.bind(this), function (error) {
									var iLat = 0;
									var iLong = 0;
									var oGeoMap = this.getView().byId("GeoMap");
									oPlanningModel.setProperty("/lat", iLat);
									oPlanningModel.setProperty("/long", iLong);
									this.getView().byId("map").bindElement(this.selectedDailyAppointment);
									this.getView().byId("map").setBusy(false);
									sap.m.MessageToast.show("Localização do GPS não encontrada.");
								}.bind(this), {
									timeout: 15000,
									enableHighAccuracy: true
								});
							}

						} else {
							oPlanningModel.setProperty("/lat", oData.Appoint_Check.results[1].HCP_LATITUDE);
							oPlanningModel.setProperty("/long", oData.Appoint_Check.results[1].HCP_LONGITUDE);

							this.getView().byId("map").bindElement(this.selectedDailyAppointment);
							this.getView().byId("map").setBusy(false);
						}
					} else {
						sap.m.MessageToast.show("Operação Pemitida Apenas para Compromissos do Dia.");
						oSplitApp.to(this.createId("detail"));
					}
				}

			}
		},

		onDetailNavigate: function (oEvent) {
			var oSourceId = oEvent.getParameter("to").getId();
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
		},

		setDailyAppointments: function (oDate) {
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var aAppointments = oPlanningModel.getProperty("/appointments");
			var aDailyAppointments = [];
			var oStartDate = (oDate || new Date()).setHours(0);
			var oEndDate = (oDate || new Date()).setHours(23);
			var aAppointmentsonRange = [];

			if (aAppointments) {

				aAppointmentsonRange = aAppointments.filter(appointment => ((appointment.HCP_START_DATE >=
					oStartDate && appointment.HCP_END_DATE <= oEndDate) || (appointment.HCP_START_DATE >= oStartDate && (appointment.HCP_START_DATE <
					oEndDate) || (appointment.HCP_START_DATE < oStartDate && (appointment.HCP_END_DATE > oStartDate && appointment.HCP_END_DATE <
					oEndDate)) || (appointment.HCP_START_DATE < oStartDate && (appointment.HCP_END_DATE > oEndDate)))));

				if (aAppointmentsonRange.length > 0) {
					var teste = this.normalizeDailyAppointments(aAppointmentsonRange);
					aDailyAppointments = aDailyAppointments.concat(aAppointmentsonRange);
				}
				// }
			}

			aDailyAppointments.sort(function compare(a, b) {
				var dateA = new Date(a.HCP_START_DATE);
				var dateB = new Date(b.HCP_START_DATE);
				return dateA - dateB;
			});

			oPlanningModel.setProperty("/DailyAppointments", aDailyAppointments);
		},

		normalizeDailyAppointments: function (aAppointmentsonRange) {
			var aAppointments = [];
		},
		
		onCloseSchedule: function (oEvent) {
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var oNewScheduleData = oPlanningModel.getProperty("/newAppointment");
			if (Object.keys(oNewScheduleData).length > 0) {
				sap.m.MessageBox.show(
					"Deseja mesmo cancelar? Os dados informados serão perdidos.", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function (oAction) {
							if (oAction === "YES") {
								this._oNewScheduleDialog.close();
							} else {
								this._oNewScheduleDialog.openBy(this.getView().byId("addAppointmentID"));
							}
						}.bind(this)
					}
				);
			} else {
				this._oNewScheduleDialog.close();
			}
		},

		onCloseOutlookSchedule: function () {
			this._oNewOutlookScheduleDialog.close();
		},

		_createNewScheduleDialog: function (oSource, sOperation, bHasToValidate) {
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			if (!this._oNewScheduleDialog) {
				this._oNewScheduleDialog = sap.ui.xmlfragment("newScheduleFragmentID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.prospects.fragments.NewSchedule",
					this);
				this.getView().addDependent(this._oNewScheduleDialog);
				this._oNewScheduleDialog.setModel(oPlanningModel);
			}
			this._oNewScheduleDialog.unbindElement();
			this._oNewScheduleDialog.setModel(this.getView().getModel());

			if (sOperation === "edit") {
				
				var sBindingPath,oData;
				
				if(this.urlData == null){
					sBindingPath = oSource.getBindingContext("planningCalendarModel").getPath();
					oData = oPlanningModel.getProperty(sBindingPath);
					
					this._oNewScheduleDialog.bindElement({
						path: sBindingPath,
						model: "planningCalendarModel"
					});
				}else{
					let listAppointments = this.getView().getModel("planningCalendarModel").oData.appointments;
					oData = this.urlData.Data;
					
					let positionList;
					
					for (var i = 0; i < listAppointments.length; i++) {
					  if (listAppointments[i].HCP_APPOINT_ID === oData.HCP_APPOINT_ID) {
					    positionList = i;
					    break; // Interrompe o loop quando encontrar o objeto
					  }
					}
					
					this._oNewScheduleDialog.bindElement({
						path: "/appointments/" + positionList,
						model: "planningCalendarModel"
					});
				}

				if (oData.HCP_START_DATE_AUX && oData.HCP_END_DATE_AUX) {
					oData.HCP_START_DATE_AUX = oData.HCP_START_DATE;
					oData.HCP_END_DATE_AUX = oData.HCP_END_DATE;
				}
				oPlanningModel.setProperty("/scheduleCreate", false);
			} else {
				var oNewStartDate = oPlanningModel.getProperty("/selectedDateObject");

				if (!oNewStartDate) {
					oNewStartDate = new Date();
				}

				var oEndDateToSet = new Date(oNewStartDate);
				var oNewEndDate = new Date(oEndDateToSet.setHours(oNewStartDate.getHours() + 1));

				oPlanningModel.setProperty("/scheduleCreate", true);
				oPlanningModel.setProperty("/newAppointment", []);

				// oPlanningModel.setProperty("/newAppointment/HCP_START_DATE_AUX", oNewStartDate);
				// oPlanningModel.setProperty("/newAppointment/HCP_END_DATE_AUX", oNewEndDate);

				this._oNewScheduleDialog.bindElement({
					path: "/newAppointment",
					model: "planningCalendarModel"
				});
			}
			this._scheduleRequestSource = oSource;
			this._oNewScheduleDialog.openBy(oSource);

			var oStartDateInput = sap.ui.core.Fragment.byId("newScheduleFragmentID" + this.getView().getId(), "scheduleStartDateID");
			var oEndDateInput = sap.ui.core.Fragment.byId("newScheduleFragmentID" + this.getView().getId(), "scheduleEndDateID");
			oStartDateInput.setValueState("None");
			oEndDateInput.setValueState("None");

			if (bHasToValidate) {
				var oStartDate = oData.HCP_START_DATE_AUX || null;
				var oEndDate = oData.HCP_END_DATE_AUX || null;
				var oStartDateToCompare = new Date();

				this.validateDates(oData, oStartDate, oEndDate, oStartDateToCompare, false);
			} else {
				oPlanningModel.setProperty("/enableScheduleSave", false);
			}
		},

		_createNewOutlookScheduleDialog: function (oSource, sBindingPath) {
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			if (!this._oNewOutlookScheduleDialog) {
				this._oNewOutlookScheduleDialog = sap.ui.xmlfragment("newOutlookScheduleFragmentID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.prospects.fragments.OutlookSchedule",
					this);
				this.getView().addDependent(this._oNewOutlookScheduleDialog);
				this._oNewOutlookScheduleDialog.setModel(oPlanningModel);
			}
			this._oNewOutlookScheduleDialog.bindElement({
				path: sBindingPath,
				model: "planningCalendarModel"
			});
			this._oNewOutlookScheduleDialog.openBy(oSource);
		},

		_createNewCheckoutDialog: function (oSource, sBindingPath) {
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var bIsCheckout = oPlanningModel.getProperty("/doingCheckout") === true ? true : false;

			if (oSource.getCustomData().length > 0) {
				oPlanningModel.setProperty("/doingCheckout", false);
				oPlanningModel.setProperty("/doingCancel", true);
			}

			var oData = oPlanningModel.getProperty(sBindingPath);

			if (!this._oCheckOutDialog) {
				this._oCheckOutDialog = sap.ui.xmlfragment("checkOutFragmentID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.prospects.fragments.CheckOutSchedule",
					this);
				this.getView().addDependent(this._oCheckOutDialog);
				this._oCheckOutDialog.setModel(oPlanningModel);
			}

			this._oCheckOutDialog.unbindElement();
			this._oCheckOutDialog.setModel(this.getView().getModel());

			// this._oCheckOutDialog.bindElement(sBindingPath);
			this._oCheckOutDialog.bindElement({
				path: sBindingPath,
				model: "planningCalendarModel"
			});
			this._validateCancelForm();
			this._oCheckOutDialog.openBy(oSource);
		},

		onSaveCancel: function (oEvent) {
			var oSource = oEvent;
			var oBindingContext = oSource.getBindingContext() || oSource.getBindingContext("planningCalendarModel");
			var oBindingContextPath = oBindingContext.getPath();
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var oModel = this.getView().getModel();
			var oData = oPlanningModel.getProperty(oBindingContextPath);
			var oSplitApp = this.getView().byId("SplitContDemo");
			//	var oSource = oEvent.getSource();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var aUserName = this.userName;
			var bIsCheckout = oPlanningModel.getProperty("/doingCheckout") === true ? true : false;

			if (bIsCheckout) {
				var aCheckoutData = {
					HCP_CHECK_ID: new Date().getTime().toFixed(),
					HCP_UNIQUE_KEY: oData.HCP_UNIQUE_KEY,
					HCP_END_DATE: new Date(),
					HCP_COMMENTS: oData.obs,
					HCP_REASON: oData.reasonID,
					HCP_LATITUDE: oPlanningModel.getProperty("/lat").toString(),
					HCP_LONGITUDE: oPlanningModel.getProperty("/long").toString(),
					HCP_CHECK_OUT: 1,
					HCP_CHECK_IN: 0,
					HCP_CREATED_BY: aUserName,
					HCP_CREATED_AT: new Date()
				};

				var aAppointmentNewData = {
					HCP_STATUS: "3"
				};

				//todo
				//this.getView().byId("btnFinalizar").setBusy(true);
				this.setBusyDialog("Checkout", "Realizando Checkout");

				oModel.createEntry("/Appointments_Check", {
					properties: aCheckoutData,
					success: function (oResponse) {
						this.getEntityByUniqueKey(oData.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
							oModel.update("/" + sEntity, aAppointmentNewData, {
								success: function (oResponse) {
									if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
										//this.flushStore("Appointments,Appointments_Check").then(function () {
										//this.refreshStore("Appointments", "Appointments_Check").then(function () {
										this.refreshPlanningCalendarData().then(function () {
											//this.getView().byId("btnFinalizar").setBusy(false);
											sap.m.MessageToast.show("Checkout Realizado com Sucesso!");
											oPlanningModel.setProperty("/doingCheckout", false);
											if (this._oCheckOutDialog) {
												this._oCheckOutDialog.close();
											}
											this.closeBusyDialog();
											oSplitApp.backMaster();
										}.bind(this));
										//}.bind(this));
										//}.bind(this));
									} else {
										this.refreshPlanningCalendarData().then(function () {
											this.getView().byId("btnFinalizar").setBusy(false);
											sap.m.MessageToast.show("Checkout Realizado com Sucesso!");
											oPlanningModel.setProperty("/doingCheckout", false);
											if (this._oCheckOutDialog) {
												this._oCheckOutDialog.close();
											}
											this.closeBusyDialog();
											oSplitApp.backMaster();
										}.bind(this));
									}
								}.bind(this),
								error: function (oError) {
									this.getView().byId("btnFinalizar").setBusy(false);
									sap.m.MessageToast.show("Erro ao realizar Checkout");
									oPlanningModel.setProperty("/doingCheckout", false);
									if (this._oCheckOutDialog) {
										this._oCheckOutDialog.close();
									}
									this.closeBusyDialog();
									oSplitApp.backMaster();
								}
							});
						}.bind(this));
					}.bind(this),
					error: function (oError) {
						this.getView().byId("btnFinalizar").setBusy(false);
						this.closeBusyDialog();
						oSplitApp.backMaster();
						sap.m.MessageToast.show("Erro ao Realizar Checkout");
						oPlanningModel.setProperty("/doingCheckout", false);
					}
				});
				oModel.submitChanges();
			} else {
				this.getView().byId("btnFinalizar").setBusy(true);

				var aData = {
					HCP_STATUS: "4",
					HCP_OUTLOOK_STATUS: "3",
					HCP_UPDATED_AT: new Date(),
					HCP_UPDATED_BY: aUserName,
					HCP_CANCEL_REASON: oData.reasonID,
					HCP_CANCEL_OBS: oData.obs
				};
				this.setBusyDialog("Compromisso", "Cancelando Compromisso");
				this.getEntityByUniqueKey(oData.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
					oModel.update("/" + sEntity, aData, {
						success: function () {
							var result = this.getView().getModel().getProperty("/" + sEntity);

							if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
								this.setBusyDialog("Compromisso", "Cancelando Compromisso no Outlook");
								this.cancelOutlookSchedule(result).then(function () {
									oModel.update("/" + sEntity, {
										HCP_OUTLOOK_STATUS: "4"
									}, {
										success: function () {
											//this.flushStore("Appointments").then(function () {
											//this.refreshStore("Appointments").then(function () {
											this.refreshPlanningCalendarData().then(function () {
												sap.m.MessageToast.show("Compromisso Cancelado com sucesso!");
												this.getView().byId("btnFinalizar").setBusy(false);
												this._oNewScheduleDialog.close();
												this._oCheckOutDialog.close();
												this.closeBusyDialog();
											}.bind(this));
											//}.bind(this));
											//}.bind(this));
										}.bind(this),
										error: function () {
											sap.m.MessageToast.show("Erro ao cancelar Compromisso no Outlook");
											this._oNewScheduleDialog.close();
											this._oCheckOutDialog.close();
											this.closeBusyDialog();
											this.getView().byId("btnFinalizar").setBusy(false);
										}.bind(this)
									});
								}.bind(this));
							} else {
								this.refreshPlanningCalendarData().then(function () {
									sap.m.MessageToast.show("Compromisso Cancelado com sucesso!");
									this.getView().byId("btnFinalizar").setBusy(false);
									this._oNewScheduleDialog.close();
									this._oCheckOutDialog.close();
									this.closeBusyDialog();
								}.bind(this));
							}
						}.bind(this),
						error: function () {
							sap.m.MessageToast.show("Erro ao Cancelar Compromisso.");
							this.getView().byId("btnFinalizar").setBusy(false);
							this.closeBusyDialog();
							this._oNewScheduleDialog.close();
							this._oCheckOutDialog.close();
						}.bind(this)
					});
				}.bind(this));
			}
		},
		onSaveCancelReason: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext() || oEvent.getSource().getBindingContext("planningCalendarModel");
			var oBindingContextPath = oBindingContext.getPath();
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var oModel = this.getView().getModel();
			var oData = oPlanningModel.getProperty(oBindingContextPath);
			var oSplitApp = this.getView().byId("SplitContDemo");
			var oSource = oEvent.getSource();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var aUserName = this.userName;
			var bIsCheckout = oPlanningModel.getProperty("/doingCheckout") === true ? true : false;
			var isOffline = false;
			
			if (oData["@com.sap.vocabularies.Offline.v1.isLocal"]) {
				isOffline = true;
			}

			if (bIsCheckout) {
				var aCheckoutData = {
					HCP_CHECK_ID: new Date().getTime().toFixed(),
					HCP_UNIQUE_KEY: oData.HCP_UNIQUE_KEY,
					HCP_END_DATE: new Date(),
					HCP_COMMENTS: oData.obs,
					HCP_REASON: oData.reasonID,
					HCP_LATITUDE: oPlanningModel.getProperty("/lat").toString(),
					HCP_LONGITUDE: oPlanningModel.getProperty("/long").toString(),
					HCP_CHECK_OUT: 1,
					HCP_CHECK_IN: 0,
					HCP_CREATED_BY: aUserName,
					HCP_CREATED_AT: new Date()
				};

				var aAppointmentNewData = {
					HCP_STATUS: "3"
				};

				oSource.setBusy(true);
				this.setBusyDialog("Checkout", "Realizando Checkout");

				oModel.createEntry("/Appointments_Check", {
					properties: aCheckoutData,
					success: function (oResponse) {
						this.getEntityByUniqueKey(oData.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
							oModel.update("/" + sEntity, aAppointmentNewData, {
								success: function (oResponse) {
									if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
										//this.flushStore("Appointments,Appointments_Check").then(function () {
										//this.refreshStore("Appointments", "Appointments_Check").then(function () {
										this.refreshPlanningCalendarData().then(function () {
											oSource.setBusy(false);
											sap.m.MessageToast.show("Checkout Realizado com Sucesso!");
											oPlanningModel.setProperty("/doingCheckout", false);
											if (this._oCheckOutDialog) {
												this._oCheckOutDialog.close();
											}
											this.closeBusyDialog();
											oSplitApp.backMaster();
										}.bind(this));
										//}.bind(this));
										//}.bind(this));
									} else {
										this.refreshPlanningCalendarData().then(function () {
											oSource.setBusy(false);
											sap.m.MessageToast.show("Checkout Realizado com Sucesso!");
											oPlanningModel.setProperty("/doingCheckout", false);
											if (this._oCheckOutDialog) {
												this._oCheckOutDialog.close();
											}
											this.closeBusyDialog();
											oSplitApp.backMaster();
										}.bind(this));
									}
								}.bind(this),
								error: function (oError) {
									oSource.setBusy(false);
									sap.m.MessageToast.show("Erro ao realizar Checkout");
									oPlanningModel.setProperty("/doingCheckout", false);
									if (this._oCheckOutDialog) {
										this._oCheckOutDialog.close();
									}
									this.closeBusyDialog();
									oSplitApp.backMaster();
								}
							});
						}.bind(this));
					}.bind(this),
					error: function (oError) {
						oSource.setBusy(false);
						this.closeBusyDialog();
						oSplitApp.backMaster();
						sap.m.MessageToast.show("Erro ao Realizar Checkout");
						oPlanningModel.setProperty("/doingCheckout", false);
					}
				});
				oModel.submitChanges();
			} else {
				oSource.setBusy(true);

				var aData = {
					HCP_STATUS: "4",
					HCP_OUTLOOK_STATUS: "3",
					HCP_UPDATED_AT: new Date(),
					HCP_UPDATED_BY: aUserName,
					HCP_CANCEL_REASON: oData.reasonID,
					HCP_CANCEL_OBS: oData.obs
				};
				this.flushStore("Appointments").then(function () {
				this.refreshStore("Appointments").then(function () {
				this.setBusyDialog("Compromisso", "Cancelando Compromisso");
				this.getEntityByUniqueKey(oData.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
					oModel.update("/" + sEntity, aData, {
						success: function () {
							var result = this.getView().getModel().getProperty("/" + sEntity);

							if ((bIsMobile && !isOffline) || !bIsMobile) {
								this.setBusyDialog("Compromisso", "Cancelando Compromisso no Outlook");
								this.cancelOutlookSchedule(result).then(function () {
									oModel.update("/" + sEntity, {
										HCP_OUTLOOK_STATUS: "4"
									}, {
										success: function () {
											//this.flushStore("Appointments").then(function () {
											//this.refreshStore("Appointments").then(function () {
											oModel.remove("/" + sEntity, aData);
											this.refreshPlanningCalendarData().then(function () {
												sap.m.MessageToast.show("Compromisso Cancelado com sucesso!");
												oSource.setBusy(false);
												this._oNewScheduleDialog.close();
												this._oCheckOutDialog.close();
												this.closeBusyDialog();
											}.bind(this));
											//}.bind(this));
											//}.bind(this));
										}.bind(this),
										error: function () {
											sap.m.MessageToast.show("Erro ao cancelar Compromisso no Outlook");
											this._oNewScheduleDialog.close();
											this._oCheckOutDialog.close();
											this.closeBusyDialog();
											oSource.setBusy(false);
										}.bind(this)
									});
								}.bind(this));
							} else {
								this.refreshPlanningCalendarData().then(function () {
									sap.m.MessageToast.show("Compromisso Cancelado com sucesso!");
									oSource.setBusy(false);
									this._oNewScheduleDialog.close();
									this._oCheckOutDialog.close();
									this.closeBusyDialog();
								}.bind(this));
							}
						}.bind(this),
						error: function () {
							sap.m.MessageToast.show("Erro ao Cancelar Compromisso.");
							oSource.setBusy(false);
							this.closeBusyDialog();
							this._oNewScheduleDialog.close();
							this._oCheckOutDialog.close();
						}.bind(this)
					});
				}.bind(this));
		      }.bind(this));
			}.bind(this));
			}
		},

		onCloseCancel: function () {
			this._oCheckOutDialog.close();
		},

		onSaveSchedule: function (oEvent) {
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var oSource = oEvent.getSource();
			var oModel = this.getView().getModel();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var aUserName = this.userName;

			oSource.setBusy(true);
			oModel.setUseBatch(false);
			this.setBusyDialog("Compromisso", "Salvando Compromisso");
			if (oPlanningModel.getProperty("/scheduleCreate")) {
				var aNewAppointmentData = oPlanningModel.getProperty("/newAppointment");
				var sTimestamp = new Date().getTime();
				this.uniqueKey = this.generateUniqueKey();
				aNewAppointmentData["uniqueKey"] = this.uniqueKey;

				var aData = {
					HCP_APPOINT_ID: sTimestamp.toFixed(),
					HCP_UNIQUE_KEY: this.uniqueKey,
					HCP_APPOINTMENTS: parseInt(aNewAppointmentData.HCP_APPOINTMENTS),
					HCP_NAME: parseInt(aNewAppointmentData.HCP_APPOINTMENTS) === 3 || parseInt(aNewAppointmentData.HCP_APPOINTMENTS) === 4 ?
						null : aNewAppointmentData.HCP_NAME,
					HCP_INTERACTION_OBJECTIVE: parseInt(aNewAppointmentData.HCP_INTERACTION_OBJECTIVE),
					HCP_INTERACTION_TYPE: aNewAppointmentData.HCP_INTERACTION_TYPE,
					HCP_START_DATE: aNewAppointmentData.HCP_START_DATE_AUX,
					HCP_END_DATE: aNewAppointmentData.HCP_END_DATE_AUX,
					HCP_COMMENTS: aNewAppointmentData.HCP_COMMENTS,
					HCP_OUTLOOK_STATUS: "1",
					HCP_FROM_APP: "1",
					HCP_STATUS: "1",
					HCP_CREATED_BY: aUserName,
					HCP_CREATED_AT: new Date()
				};

				oModel.createEntry("/Appointments", {
					properties: aData,
					success: function (oCreatedSchedule) {
						if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
							this.setBusyDialog("Compromisso", "Criando Compromisso");

							if (oCreatedSchedule["@com.sap.vocabularies.Offline.v1.isLocal"]) {
								this.getEntityByUniqueKey(oCreatedSchedule.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
									oModel.read("/" + sEntity, {
										success: function (result) {
											this.supplyMissingExpands("/" + sEntity, true).then(function () {
												var oData = oModel.getProperty("/" + sEntity);
												//this.flushStore("Appointments").then(function () {
												//this.refreshStore("Appointments").then(function () {
												this.refreshPlanningCalendarData().then(function () {
													sap.m.MessageToast.show("Compromisso salvo com sucesso!");
													//this._oNewScheduleDialog.close();
													this.closeBusyDialog();
													oSource.setBusy(false);
												}.bind(this));
												//}.bind(this));
												//}.bind(this));

											}.bind(this));
										}.bind(this)
									});
								}.bind(this));

							} else {
								this.getEntityByUniqueKey(oCreatedSchedule.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
									oModel.read("/" + sEntity, {
										success: function (result) {
											this.supplyMissingExpands("/" + sEntity, true).then(function () {
												var oData = oModel.getProperty("/" + sEntity);
												this.refreshPlanningCalendarData().then(function () {
													sap.m.MessageToast.show("Compromisso salvo com sucesso!");
													this._oNewScheduleDialog.close();
													this.closeBusyDialog();
													oSource.setBusy(false);
												}.bind(this));

											}.bind(this));
										}.bind(this)
									});
								}.bind(this));
							}
						} else {
							this.getEntityByUniqueKey(oCreatedSchedule.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
								oModel.read("/" + sEntity, {
									success: function (result) {
										this.supplyMissingExpands("/" + sEntity, true).then(function () {
											this.refreshPlanningCalendarData().then(function () {
												sap.m.MessageToast.show("Compromisso salvo com sucesso!");
												this._oNewScheduleDialog.close();
												this.closeBusyDialog();
												oSource.setBusy(false);
											}.bind(this));
										}.bind(this));
									}.bind(this)
								});
							}.bind(this));
						}
					}.bind(this),
					error: function () {
						sap.m.MessageToast.show("Erro ao salvar Compromisso");
						oSource.setBusy(false);
						this._oNewScheduleDialog.close();
					}.bind(this)
				});

				oModel.submitChanges();
			} else {
				var sBindingContextPath = oSource.getBindingContext("planningCalendarModel").getPath();
				var oData = oPlanningModel.getProperty(sBindingContextPath);
				var aOutlookStatus = oData.HCP_OUTLOOK_ID ? "2" : "1";
				var aData = {
					HCP_APPOINTMENTS: parseInt(oData.HCP_APPOINTMENTS),
					HCP_NAME: oData.HCP_NAME,
					HCP_INTERACTION_OBJECTIVE: parseInt(oData.HCP_INTERACTION_OBJECTIVE),
					HCP_INTERACTION_TYPE: oData.HCP_INTERACTION_TYPE,
					HCP_START_DATE: oData.HCP_START_DATE_AUX,
					HCP_OUTLOOK_STATUS: aOutlookStatus,
					HCP_END_DATE: oData.HCP_END_DATE_AUX,
					HCP_COMMENTS: oData.HCP_COMMENTS,
					HCP_UPDATED_BY: aUserName,
					HCP_UPDATED_AT: new Date()
				};

				this.getEntityByUniqueKey(oData.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
					oModel.update("/" + sEntity, aData, {
						success: function () {
							oModel.read("/" + sEntity, {
								urlParameters: {
									"$expand": "Appoint_Commit"
								},
								success: function (result) {
									if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
										//this.flushStore("Appointments").then(function () {
										//this.refreshStore("Appointments").then(function () {
										this.refreshPlanningCalendarData().then(function () {
											sap.m.MessageToast.show("Compromisso atualizado com sucesso!");
											this._oNewScheduleDialog.close();
											this.closeBusyDialog();
											oSource.setBusy(false);
										}.bind(this));
										//}.bind(this));
										//}.bind(this));

									} else {
										this.refreshPlanningCalendarData().then(function () {
											sap.m.MessageToast.show("Compromisso atualizado com sucesso!");
											this._oNewScheduleDialog.close();
											this.closeBusyDialog();
											oSource.setBusy(false);
										}.bind(this));
									}
								}.bind(this)
							});
						}.bind(this),
						error: function () {
							oSource.setBusy(false);
							sap.m.MessageToast.show("Erro ao Atualizar Compromisso.");
						}.bind(this)
					});
				}.bind(this));
			}
		},

		/*onSaveScheduleOld: function (oEvent) {
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var oSource = oEvent.getSource();
			var oModel = this.getView().getModel();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var aUserName = this.userName;

			oSource.setBusy(true);
			oModel.setUseBatch(false);
			this.setBusyDialog("Compromisso", "Salvando Compromisso");
			if (oPlanningModel.getProperty("/scheduleCreate")) {
				var aNewAppointmentData = oPlanningModel.getProperty("/newAppointment");
				var sTimestamp = new Date().getTime();
				this.uniqueKey = this.generateUniqueKey();
				aNewAppointmentData["uniqueKey"] = this.uniqueKey;

				var aData = {
					HCP_APPOINT_ID: sTimestamp.toFixed(),
					HCP_UNIQUE_KEY: this.uniqueKey,
					HCP_APPOINTMENTS: parseInt(aNewAppointmentData.HCP_APPOINTMENTS),
					HCP_NAME: parseInt(aNewAppointmentData.HCP_APPOINTMENTS) === 3 || parseInt(aNewAppointmentData.HCP_APPOINTMENTS) === 4 ?
						null : aNewAppointmentData.HCP_NAME,
					HCP_INTERACTION_OBJECTIVE: parseInt(aNewAppointmentData.HCP_INTERACTION_OBJECTIVE),
					HCP_INTERACTION_TYPE: aNewAppointmentData.HCP_INTERACTION_TYPE,
					HCP_START_DATE: aNewAppointmentData.HCP_START_DATE_AUX,
					HCP_END_DATE: aNewAppointmentData.HCP_END_DATE_AUX,
					HCP_COMMENTS: aNewAppointmentData.HCP_COMMENTS,
					HCP_OUTLOOK_STATUS: "1",
					HCP_FROM_APP: "1",
					HCP_STATUS: "1",
					HCP_CREATED_BY: aUserName,
					HCP_CREATED_AT: new Date()
				};

				oModel.createEntry("/Appointments", {
					properties: aData,
					success: function (oCreatedSchedule) {
						if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
							this.setBusyDialog("Compromisso", "Criando Compromisso no Outlook");

							if (oCreatedSchedule["@com.sap.vocabularies.Offline.v1.isLocal"]) {
								this.getEntityByUniqueKey(oCreatedSchedule.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
									oModel.read("/" + sEntity, {
										success: function (result) {
											this.supplyMissingExpands("/" + sEntity, true).then(function () {
												var oData = oModel.getProperty("/" + sEntity);
												if (this.outlookTokenExpirationDate > new Date()) {
													this.createOutlookSchedule(oData).then(function (response) {
														oModel.update("/" + sEntity, {
															HCP_OUTLOOK_STATUS: "4",
															HCP_OUTLOOK_ID: response.createdEvent.id
														}, {
															success: function () {
																this.flushStore("Appointments").then(function () {
																	this.refreshStore("Appointments").then(function () {
																		this.refreshPlanningCalendarData().then(function () {
																			sap.m.MessageToast.show("Compromisso salvo com sucesso!");
																			this._oNewScheduleDialog.close();
																			this.closeBusyDialog();
																			oSource.setBusy(false);
																		}.bind(this));
																	}.bind(this));
																}.bind(this));
															}.bind(this),
															error: function () {
																sap.m.MessageToast.show("Erro ao salvar Compromisso no Outlook");
																this._oNewScheduleDialog.close();
																this.closeBusyDialog();
																oSource.setBusy(false);
															}.bind(this)
														});
													}.bind(this));
												} else {
													this.flushStore("Appointments").then(function () {
														this.refreshStore("Appointments").then(function () {
															this.refreshPlanningCalendarData().then(function () {
																sap.m.MessageToast.show("Compromisso salvo com sucesso!");
																this._oNewScheduleDialog.close();
																this.closeBusyDialog();
																oSource.setBusy(false);
															}.bind(this));
														}.bind(this));
													}.bind(this));
												}
											}.bind(this));
										}.bind(this)
									});
								}.bind(this));

							} else {
								oModel.read("/Appointments(" + oCreatedSchedule.HCP_APPOINT_ID + ")", {
									urlParameters: {
										"$expand": "Appoint_Commit"
									},
									success: function (result) {
										if (this.outlookTokenExpirationDate > new Date()) {
											this.createOutlookSchedule(result).then(function (response) {
												oModel.update("/Appointments(" + response.originSchedule.HCP_APPOINT_ID + ")", {
													HCP_OUTLOOK_STATUS: "4",
													HCP_OUTLOOK_ID: response.createdEvent.id
												}, {
													success: function () {
														this.flushStore("Appointments").then(function () {
															sap.m.MessageToast.show("Compromisso salvo com sucesso!");
															this._oNewScheduleDialog.close();
															this.closeBusyDialog();
															oSource.setBusy(false);
															this.refreshPlanningCalendarData();
														}.bind(this));
													}.bind(this),
													error: function () {
														sap.m.MessageToast.show("Erro ao salvar Compromisso no Outlook");
														this._oNewScheduleDialog.close();
														this.closeBusyDialog();
														oSource.setBusy(false);
													}.bind(this)
												});
											}.bind(this));
										} else {
											this.flushStore("Appointments").then(function () {
												sap.m.MessageToast.show("Compromisso salvo com sucesso!");
												this._oNewScheduleDialog.close();
												this.closeBusyDialog();
												oSource.setBusy(false);
												this.refreshPlanningCalendarData();
											}.bind(this));
										}
									}.bind(this)
								});
							}
						} else {
							this.getEntityByUniqueKey(oCreatedSchedule.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
								oModel.read("/" + sEntity, {
									success: function (result) {
										this.supplyMissingExpands("/" + sEntity, true).then(function () {
											this.refreshPlanningCalendarData().then(function () {
												sap.m.MessageToast.show("Compromisso salvo com sucesso!");
												this._oNewScheduleDialog.close();
												this.closeBusyDialog();
												oSource.setBusy(false);
											}.bind(this));
										}.bind(this));
									}.bind(this)
								});
							}.bind(this));
						}
					}.bind(this),
					error: function () {
						sap.m.MessageToast.show("Erro ao salvar Compromisso");
						oSource.setBusy(false);
						this._oNewScheduleDialog.close();
					}.bind(this)
				});

				oModel.submitChanges();
			} else {
				var sBindingContextPath = oSource.getBindingContext("planningCalendarModel").getPath();
				var oData = oPlanningModel.getProperty(sBindingContextPath);
				var aOutlookStatus = oData.HCP_OUTLOOK_ID ? "2" : "1";
				var aData = {
					HCP_APPOINTMENTS: parseInt(oData.HCP_APPOINTMENTS),
					HCP_NAME: oData.HCP_NAME,
					HCP_INTERACTION_OBJECTIVE: parseInt(oData.HCP_INTERACTION_OBJECTIVE),
					HCP_INTERACTION_TYPE: oData.HCP_INTERACTION_TYPE,
					HCP_START_DATE: oData.HCP_START_DATE_AUX,
					HCP_OUTLOOK_STATUS: aOutlookStatus,
					HCP_END_DATE: oData.HCP_END_DATE_AUX,
					HCP_COMMENTS: oData.HCP_COMMENTS,
					HCP_UPDATED_BY: aUserName,
					HCP_UPDATED_AT: new Date()
				};

				this.getEntityByUniqueKey(oData.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
					oModel.update("/" + sEntity, aData, {
						success: function () {
							oModel.read("/" + sEntity, {
								urlParameters: {
									"$expand": "Appoint_Commit"
								},
								success: function (result) {
									if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
										if (this.outlookTokenExpirationDate > new Date()) {
											this.updateOutlookSchedule(result).then(function (response) {
												oModel.update("/" + sEntity, {
													HCP_OUTLOOK_STATUS: "4"
												}, {
													success: function () {
														this.flushStore("Appointments").then(function () {
															this.refreshStore("Appointments").then(function () {
																this.refreshPlanningCalendarData().then(function () {
																	sap.m.MessageToast.show("Compromisso atualizado com sucesso!");
																	this._oNewScheduleDialog.close();
																	this.closeBusyDialog();
																	oSource.setBusy(false);
																}.bind(this));
															}.bind(this));
														}.bind(this));
													}.bind(this),
													error: function () {
														sap.m.MessageToast.show("Erro ao atualizado Compromisso no Outlook");
														this._oNewScheduleDialog.close();
														this.closeBusyDialog();
														oSource.setBusy(false);
													}.bind(this)
												});
											}.bind(this));
										} else {
											this.flushStore("Appointments").then(function () {
												this.refreshStore("Appointments").then(function () {
													this.refreshPlanningCalendarData().then(function () {
														sap.m.MessageToast.show("Compromisso atualizado com sucesso!");
														this._oNewScheduleDialog.close();
														this.closeBusyDialog();
														oSource.setBusy(false);
													}.bind(this));
												}.bind(this));
											}.bind(this));
										}
									} else {
										this.refreshPlanningCalendarData().then(function () {
											sap.m.MessageToast.show("Compromisso atualizado com sucesso!");
											this._oNewScheduleDialog.close();
											this.closeBusyDialog();
											oSource.setBusy(false);
										}.bind(this));
									}
								}.bind(this)
							});
						}.bind(this),
						error: function () {
							oSource.setBusy(false);
							sap.m.MessageToast.show("Erro ao Atualizar Compromisso.");
						}.bind(this)
					});
				}.bind(this));

				// oModel.update("/Appointments(" + oData.HCP_APPOINT_ID + ")", aData, {
				// 	success: function () {
				// 		if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				// 			this.setBusyDialog("Compromisso", "Atualizando Compromisso no Outlook");
				// 			oModel.read("/Appointments(" + oData.HCP_APPOINT_ID + ")", {
				// 				urlParameters: {
				// 					"$expand": "Appoint_Commit"
				// 				},
				// 				success: function (result) {
				// 					this.updateOutlookSchedule(result).then(function (response) {
				// 						oModel.update("/Appointments(" + response.originSchedule.HCP_APPOINT_ID + ")", {
				// 							HCP_OUTLOOK_STATUS: "4"
				// 						}, {
				// 							success: function () {
				// 								this.flushStore().then(function () {
				// 									sap.m.MessageToast.show("Compromisso atualizado com sucesso!");
				// 									this._oNewScheduleDialog.close();
				// 									this.closeBusyDialog();
				// 									oSource.setBusy(false);
				// 								}.bind(this));
				// 							}.bind(this),
				// 							error: function () {
				// 								sap.m.MessageToast.show("Erro ao atualizado Compromisso no Outlook");
				// 								this._oNewScheduleDialog.close();
				// 								this.closeBusyDialog();
				// 								oSource.setBusy(false);
				// 							}.bind(this)
				// 						});
				// 					}.bind(this));
				// 				}.bind(this)
				// 			});
				// 		} else {

				// 			sap.m.MessageToast.show("Compromisso atualizado com sucesso!");
				// 			oSource.setBusy(false);
				// 		}
				// 	}.bind(this),
				// 	error: function (oError) {
				// 		oSource.setBusy(false);
				// 		sap.m.MessageToast.show("Erro ao Salvar Compromisso.");
				// 	}.bind(this)
				// });
			}
		},*/

		getEntityByUniqueKey: function (uniqueKey, sEntityName) {
			return new Promise(function (resolve, reject) {
				var aFilters = [];
				var oModel = this.getView().getModel();

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: uniqueKey
				}));

				oModel.read("/" + sEntityName, {
					filters: aFilters,
					success: function (results) {
						var aResults = results.results;

						if (aResults.length > 0) {
							for (var index in aResults) {
								var aUri = aResults[index].__metadata.uri.split("/");
								resolve(aUri[aUri.length - 1]);
							}
						}
					},
					error: function () {
						reject();
					}
				});
			}.bind(this));
		},

		supplyMissingExpands: function (sEntity, bloadAppointCommit, bloadCheckData) {
			return new Promise(function (resolve, reject) {
				var aPromises = [];
				var oModel = this.getView().getModel();
				var oData = oModel.getProperty(sEntity);
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_COMMITMENT_ID",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_APPOINTMENTS
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_ACTIVE",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "1"
				}));

				if (oData) {
					if (bloadAppointCommit) {
						aPromises.push(new Promise(function (resolve, reject) {
							oModel.read("/Commitments", {
								filters: aFilters,
								success: function (result) {
									var aCommitment = result.results;

									if (aCommitment) {
										oData.Appoint_Commit = aCommitment[0];
									}
									resolve();
								},
								error: function () {
									reject();
								}
							});
						}.bind(this)));
					}

					if (bloadCheckData) {
						aPromises.push(new Promise(function (resolve, reject) {
							oModel.read("/Appointments_Check", {
								filters: [
									new sap.ui.model.Filter({
										path: "HCP_UNIQUE_KEY",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: oData.HCP_UNIQUE_KEY
									})
								],
								success: function (result) {
									var aCheckData = result.results;

									if (aCheckData) {
										oData.Appoint_Check["results"] = aCheckData;
									}
									resolve();
								},
								error: function () {
									reject();
								}
							});
						}.bind(this)));
					}

					if (oData.HCP_NAME) {
						aPromises.push(new Promise(function (resolve, reject) {
							oModel.read("/View_Grouping_Suppliers", {
								filters: [
									new sap.ui.model.Filter({
										path: "HCP_REGISTER",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: oData.HCP_NAME
									})
								],
								success: function (result) {
									var aPartner = result.results;

									if (aPartner) {
										oData.Appoint_Partner = aPartner[0];
									}
									resolve();
								}.bind(this),
								error: function () {
									reject();
								}.bind(this)
							});
						}.bind(this)));
						aPromises.push(new Promise(function (resolve, reject) {
							oModel.read("/Prospects", {
								filters: [
									new sap.ui.model.Filter({
										path: "HCP_PROSP_ID",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: oData.HCP_NAME
									})
								],
								success: function (result) {
									var aProspect = result.results;

									if (aProspect) {
										oData.Appoint_Prospect = aProspect[0];
									}
									resolve();
								}.bind(this),
								error: function () {
									reject();
								}.bind(this)
							});
						}.bind(this)));
						aPromises.push(new Promise(function (resolve, reject) {

							var aFilters = [];

							aFilters.push(new sap.ui.model.Filter({
								path: "HCP_INT_TYPE_ID",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oData.HCP_INTERACTION_TYPE
							}));

							aFilters.push(new sap.ui.model.Filter({
								path: "HCP_ACTIVE",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: "1"
							}));

							oModel.read("/Interact_Types", {
								filters: aFilters,
								success: function (result) {
									var aIntType = result.results;

									if (aIntType) {
										oData.Appoint_IntTyp = aIntType[0];
									}
									resolve();
								}.bind(this),
								error: function () {
									reject();
								}.bind(this)
							});
						}.bind(this)));
						aPromises.push(new Promise(function (resolve, reject) {

							var aFilterss = [];

							aFilterss.push(new sap.ui.model.Filter({
								path: "HCP_INT_OBJ_ID",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oData.HCP_INTERACTION_TYPE
							}));

							aFilterss.push(new sap.ui.model.Filter({
								path: "HCP_ACTIVE",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: "1"
							}));

							oModel.read("/Interact_Objectives", {
								filters: aFilterss,
								success: function (result) {
									var aIntObj = result.results;

									if (aIntObj) {
										oData.Appoint_IntObj = aIntObj[0];
									}
									resolve();
								}.bind(this),
								error: function () {
									reject();
								}.bind(this)
							});
						}.bind(this)));
					}
				}
				Promise.all(aPromises).then(function () {
					resolve();
				});
			}.bind(this));
		},

		generateUniqueKey: function () {
			return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
				(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
			);
		},

		_onCreateAppointmentSuccess: function (oData) {
			sap.m.MessageToast.show("Compromisso salvo com sucesso!");
			this._oNewScheduleDialog.close();
			// this.addNewAppointmentToCalendar(oData);
			// this.setDailyAppointments();
			this.refreshPlanningCalendarData();

		},
		_onCreateAppointmentError: function () {
			sap.m.MessageToast.show("Erro ao salvar Compromisso");
			this._oNewScheduleDialog.close();
		},

		addNewAppointmentToCalendar: function (oData) {
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var aNewAppointmentData = oPlanningModel.getProperty("/newAppointment");
			var aPeoples = oPlanningModel.getProperty("/people");
			var aPeople = aPeoples.filter(people => people.name === oData.HCP_NAME);

			if (aPeople.length > 0) {
				aPeople[0].appointments.push(oData);
			} else {
				aPeoples.push({
					name: aNewAppointmentData.HCP_NAME,
					pic: "/webapp/resources/avatar_02.jpg",
					role: "Fornecedor",
					appointments: [
						oData
					],
					headers: []
				});
			}
			oPlanningModel.refresh();
		},

		_onCalendarDateIntervalSelect: function (oEvent) {
			var oSelectedDate = oEvent.getSource().getSelectedDates()[0].getStartDate();
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var oSplitApp = this.getView().byId("SplitContDemo");
			var oDateRange = new sap.ui.unified.DateRange({
				startDate: oSelectedDate,
				endDate: oSelectedDate
			});

			this.setDailyAppointments(oSelectedDate);
			oPlanningModel.setProperty("/selectedDate", oSelectedDate.getDate());

			var oDate = new Date(oSelectedDate);

			oDate.setHours(new Date().getHours());
			oDate.setMinutes(new Date().getMinutes());
			oDate.setSeconds(new Date().getSeconds());
			oPlanningModel.setProperty("/selectedDateObject", oDate);
			//this.getView().byId("PC1").setStartDate(new Date(oSelectedDate));
			if (this.currSelectedDate) {
				if (this.currSelectedDate.getDate() === oSelectedDate.getDate()) {
					oSplitApp.to(this.createId("detail"));
					oSplitApp.hideMaster();
				}
			}
			this.currSelectedDate = oSelectedDate;
		},

		navBack: function () {
			var oSplitApp = this.getView().byId("SplitContDemo");
			oSplitApp.backDetail();
		},

		backToTheMaster: function () {
			var oSplitApp = this.getView().byId("SplitContDemo");
			oSplitApp.backMaster();
		},

		backToIndex: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}
		},

		_onCheckInPress: function (oEvent) {
			var oSource = oEvent.getSource();
			var sBindingContextPath = oSource.getBindingContext().getPath();
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var oModel = this.getView().getModel();
			var oData = oPlanningModel.getProperty(sBindingContextPath);
			var oSplitApp = this.getView().byId("SplitContDemo");
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var aUserName = this.userName;
			oSource.setBusy(true);

			var aAppointmentNewData = {
				HCP_STATUS: "2"
			};

			var aCheckinData = {
				HCP_CHECK_ID: new Date().getTime().toFixed(),
				HCP_UNIQUE_KEY: oData.HCP_UNIQUE_KEY,
				HCP_START_DATE: new Date(),
				HCP_CHECK_IN: 1,
				HCP_CHECK_OUT: 0,
				HCP_LATITUDE: oPlanningModel.getProperty("/lat").toString(),
				HCP_LONGITUDE: oPlanningModel.getProperty("/long").toString(),
				HCP_CREATED_BY: aUserName,
				HCP_CREATED_AT: new Date()
			};
			this.setBusyDialog("Checkin", "Realizando Checkin");
			oModel.createEntry("/Appointments_Check", {
				properties: aCheckinData,
				success: function (oResponse) {
					this.getEntityByUniqueKey(oData.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
						oModel.update("/" + sEntity, aAppointmentNewData, {
							success: function (oResponse) {
								if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
									//this.flushStore("Appointments,Appointments_Check").then(function () {
									//this.refreshStore("Appointments", "Appointments_Check").then(function () {
									this.refreshPlanningCalendarData().then(function () {
										oSource.setBusy(false);
										sap.m.MessageToast.show("Checkin Realizado com Sucesso!");
										this.closeBusyDialog();
										oSplitApp.backMaster();
									}.bind(this));
									//}.bind(this));
									//}.bind(this));
								} else {
									this.refreshPlanningCalendarData().then(function () {
										oSource.setBusy(false);
										sap.m.MessageToast.show("Checkin Realizado com Sucesso!");
										this.closeBusyDialog();
										oSplitApp.backMaster();
									}.bind(this));
								}
							}.bind(this),
							error: function (oError) {
								oSource.setBusy(false);
								sap.m.MessageToast.show("Erro ao Realizar Checkin");
								this.closeBusyDialog();
								oSplitApp.backMaster();
							}.bind(this)
						});
					}.bind(this));
				}.bind(this),
				error: function (oError) {
					oSource.setBusy(false);
					this.closeBusyDialog();
					oSplitApp.backMaster();
					sap.m.MessageToast.show("Erro ao Realizar Checkin");
				}.bind(this)
			});
			oModel.submitChanges();
		},

		onAfterRendering: function () {
			var teste = 1;
		},

		_onCheckOutPress: function (oEvent) {
			var oSource = oEvent.getSource();
			var sBindingContextPath = oSource.getBindingContext().getPath();
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var oModel = this.getView().getModel();
			var oData = oPlanningModel.getProperty(sBindingContextPath);

			oPlanningModel.setProperty("/doingCheckout", true);
			oPlanningModel.setProperty("/doingCancel", false);
			if (oData["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				this.getEntityByUniqueKey(oData.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
					this.supplyMissingExpands("/" + sEntity, false, true).then(function () {
						var oModelData = oModel.getProperty("/" + sEntity);

						var oLimitToCancel = new Date(oModelData.Appoint_Check.results[0].HCP_START_DATE).setMinutes(new Date(oModelData.Appoint_Check
								.results[
									0].HCP_START_DATE)
							.getMinutes() +
							20);
						var bHasToInputReason = new Date() <= oLimitToCancel ? true : false;
						oData["checkout"] = {};
						if (bHasToInputReason) {
							this._createNewCheckoutDialog(oSource, sBindingContextPath);
						} else {
							this.onSaveCancel(oSource);
						}
					}.bind(this));
				}.bind(this));
			} else {
				var oLimitToCancel = new Date(oData.Appoint_Check.results[0].HCP_START_DATE).setMinutes(new Date(oData.Appoint_Check
						.results[
							0].HCP_START_DATE)
					.getMinutes() +
					20);
				var bHasToInputReason = new Date() <= oLimitToCancel ? true : false;
				oData["checkout"] = {};
				if (bHasToInputReason) {
					this._createNewCheckoutDialog(oSource, sBindingContextPath);
				} else {
					this.onSaveCancel(oSource);
				}
			}
		},

		refreshPlanningCalendarData: function () {
			return new Promise(function (resolve, reject) {
				var aFilters = [];
				var oPlanningModel = this.getView().getModel("planningCalendarModel");
				var oBackendModel = this.getView().getModel();
				var oSelectedDate = this.getView().byId("dateIntervalID").getSelectedDates().length > 0 ? this.getView().byId("dateIntervalID")
					.getSelectedDates()[0].getStartDate() : new Date();

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_CREATED_BY',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: this.userName.toString()
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_START_DATE',
					operator: sap.ui.model.FilterOperator.GE,
					value1: new Date().setHours(0)
				}));

				oBackendModel.read("/Appointments", {
					urlParameters: {
						"$expand": "Appoint_Commit,Appoint_Check,Appoint_Prospect,Appoint_Partner,Appoint_IntObj,Appoint_IntTyp"
					},
					sorter: {
						path: 'HCP_START_DATE',
						descending: true
					},
					filters: aFilters,
					success: function (oResults) {
						this.mountDays(oResults.results);
						var oAppointments = oResults.results.filter(result => result.HCP_STATUS !== "4");

						if (oAppointments.length > 0) {
							this.mountCalendarData(oAppointments).then(function (oNormalizedData) {
								var aNewArrayData = [];
								oPlanningModel.setProperty("/appointments", oNormalizedData);

								//aqui apagar e enviar dados compromissos
								if (this.outlookSchedules) {
									var sName = "Compromissos do Outlook";
									var sIcon = "sap-icon://email";

									var aOutlookArray = [];
									for (var schedule of this.outlookSchedules) {
										schedule["pic"] = sIcon;
										schedule["HCP_NAME_DESC"] = sName;
										aOutlookArray.push(schedule);
									}

									// if (aOutlookArray.length > 0) {
									// 	aNewArrayData.push({
									// 		pic: sIcon,
									// 		name: sName,
									// 		role: "team member",
									// 		appointments: aOutlookArray
									// 	});
									// }
									// oNormalizedData.concat(aOutlookArray);

									for (var people of aOutlookArray) {
										oNormalizedData.push(people);
									}
									oPlanningModel.setProperty("/appointments", oNormalizedData);
								} else {
									oPlanningModel.setProperty("/appointments", oNormalizedData);
								}

								this.setDailyAppointments(this.currSelectedDate);
								oPlanningModel.refresh();
								resolve(oResults);
							}.bind(this));
						} else {
							if (oAppointments.length == 0) {
								oPlanningModel.refresh();
								var aOutlookArray = [];
								oPlanningModel.setProperty("/appointments", aOutlookArray);
								resolve(oResults);
							}
							if (this.outlookSchedules) {
								var sName = "Compromissos do Outlook";
								var sIcon = "sap-icon://email";
								var aAppointments = [];
								var aOutlookArray = [];

								for (var schedule of this.outlookSchedules) {
									schedule["pic"] = sIcon;
									schedule["HCP_NAME_DESC"] = sName;
									aOutlookArray.push(schedule);
								}

								// if (aOutlookArray.length > 0) {
								// 	aAppointments.people.push({
								// 		pic: sIcon,
								// 		name: sName,
								// 		role: "team member",
								// 		appointments: aOutlookArray
								// 	});
								// }
								oPlanningModel.setProperty("/appointments", aOutlookArray);
								this.setDailyAppointments(this.currSelectedDate);
								oPlanningModel.refresh();
								resolve(oResults);
							}
						}
					}.bind(this),
					error: function () {
						console.log("Falha ao Carregar Compromissos");
						reject();
					}
				});
			}.bind(this));
		},

		onCancelSchedule: function (oEvent) {
			var oSource = oEvent.getSource();
			var sBindingContext = oSource.getBindingContext("planningCalendarModel");
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var oData = oPlanningModel.getProperty(sBindingContext.getPath());
			var oModel = this.getView().getModel();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var aUserName = this.userName;

			this._createNewCheckoutDialog(oSource, sBindingContext.getPath());

			// sap.m.MessageBox.show(
			// 	"Deseja mesmo cancelar o compromisso?", {
			// 		icon: sap.m.MessageBox.Icon.INFORMATION,
			// 		actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
			// 		onClose: function (oAction) {
			// 			oSource.setBusy(true);
			// 			if (oAction === "YES") {
			// 				var aData = {
			// 					HCP_STATUS: "4",
			// 					HCP_OUTLOOK_STATUS: "3",
			// 					HCP_UPDATED_AT: new Date(),
			// 					HCP_UPDATED_BY: aUserName
			// 				};
			// 				this.setBusyDialog("Compromisso", "Cancelando Compromisso");
			// 				this.getEntityByUniqueKey(oData.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
			// 					oModel.update("/" + sEntity, aData, {
			// 						success: function () {
			// 							var result = this.getView().getModel().getProperty("/" + sEntity);

			// 							if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
			// 								this.setBusyDialog("Compromisso", "Cancelando Compromisso no Outlook");
			// 								this.cancelOutlookSchedule(result).then(function () {
			// 									oModel.update("/" + sEntity, {
			// 										HCP_OUTLOOK_STATUS: "4"
			// 									}, {
			// 										success: function () {
			// 											this.flushStore().then(function () {
			// 												this.refreshStore("Appointments").then(function () {
			// 													this.refreshPlanningCalendarData().then(function () {
			// 														sap.m.MessageToast.show("Compromisso Cancelado com sucesso!");
			// 														oSource.setBusy(false);
			// 														this._oNewScheduleDialog.close();
			// 														this.closeBusyDialog();
			// 													}.bind(this));
			// 												}.bind(this));
			// 											}.bind(this));
			// 										}.bind(this),
			// 										error: function () {
			// 											sap.m.MessageToast.show("Erro ao cancelar Compromisso no Outlook");
			// 											this._oNewScheduleDialog.close();
			// 											this.closeBusyDialog();
			// 											oSource.setBusy(false);
			// 										}.bind(this)
			// 									});
			// 								}.bind(this));
			// 							} else {
			// 								this.refreshPlanningCalendarData().then(function () {
			// 									sap.m.MessageToast.show("Compromisso Cancelado com sucesso!");
			// 									oSource.setBusy(false);
			// 									this._oNewScheduleDialog.close();
			// 									this.closeBusyDialog();
			// 								}.bind(this));
			// 							}
			// 						}.bind(this),
			// 						error: function () {
			// 							sap.m.MessageToast.show("Erro ao Cancelar Compromisso.");
			// 							oSource.setBusy(false);
			// 							this.closeBusyDialog();
			// 							this._oNewScheduleDialog.close();
			// 						}.bind(this)
			// 					});
			// 				}.bind(this));
			// 			}
			// 		}.bind(this)
			// 	}
			// );
		},

		initializePlanningCalendar: function (bHasConnection, bNoIntegration) {
			var oPlanningCalendarModel = this.getView().getModel("planningCalendarModel");
			var oSelectedDate = oPlanningCalendarModel.getProperty("/selectedDate");
			var oSelectedDateObject = oPlanningCalendarModel.getProperty("/selectedDateObject");
			var oBackendModel = this.getView().getModel();
			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_CREATED_BY',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.userName.toString()
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_START_DATE',
				operator: sap.ui.model.FilterOperator.GE,
				value1: new Date().setHours(0)
			}));

			this.setBusyDialog("Agenda", "Carregando Agenda");
			oBackendModel.read("/Appointments", {
				urlParameters: {
					"$expand": "Appoint_Commit,Appoint_Check,Appoint_Prospect,Appoint_Partner,Appoint_IntObj,Appoint_IntTyp"
				},
				sorter: {
					path: 'HCP_START_DATE',
					descending: true
				},
				filters: aFilters,
				success: function (oResults) {
					//aqui//
					this.mountDays(oResults.results);
					var oAppointments = oResults.results.filter(result => result.HCP_STATUS !== "4");

					if (bHasConnection) {
						this.refreshStore("Prospects", "View_Grouping_Suppliers", "View_Users").then(function () {
							this.syncSchedulesWithOutlook(oResults.results).then(function () {
								console.log("entrou aqui");
								var oModel = this.getView().getModel();
								var bHasBatchOperations = oPlanningCalendarModel.getProperty("/hasBatchOperations");

								if (bHasBatchOperations) {
									oModel.submitChanges({
										groupId: "changes",
										success: function () {
											oPlanningCalendarModel.setProperty("/hasBatchOperations", false);
											this.setBusyDialog("Agenda", "Atualizando Agenda");
											this.refreshPlanningCalendarData().then(function (aSchedules) {
												this.getOutlookSchedules().then(function (aOutlookEvents) {
													this.syncOutlookSchedulesWithHCP(aSchedules.results, aOutlookEvents).then(function () {
														var bHasBatchOperationsAgain = oPlanningCalendarModel.getProperty("/hasBatchOperations");
														if (bHasBatchOperationsAgain) {
															oModel.submitChanges({
																groupId: "changes",
																success: function () {
																	oPlanningCalendarModel.setProperty("/hasBatchOperations", false);
																	this.flushStore("Appointments,Appointments_Check").then(function () {
																		this.refreshStore("Appointments", "Appointments_Check")
																			.then(function () {
																				this.refreshPlanningCalendarData().then(function () {
																					this.closeBusyDialog();
																				}.bind(this));
																			}.bind(this));
																	}.bind(this));
																}.bind(this),
																error: function () {
																	console.log("Erro ao sincronizar compromissos do Outlook.");
																	this.closeBusyDialog();
																}.bind(this)
															});
														} else {
															this.refreshPlanningCalendarData().then(function () {
																this.closeBusyDialog();
															}.bind(this));
														}
													}.bind(this));
												}.bind(this));
											}.bind(this));
										}.bind(this),
										error: function () {
											console.log("Erro ao sincronizar dados do Outlook.");
											this.closeBusyDialog();
										}.bind(this)
									});
								} else {
									oPlanningCalendarModel.setProperty("/hasBatchOperations", false);
									this.getOutlookSchedules().then(function (aOutlookEvents) {

										this.syncOutlookSchedulesWithHCP(oAppointments, aOutlookEvents).then(function () {

											var bHasBatchOperationsAgain = oPlanningCalendarModel.getProperty("/hasBatchOperations");
											if (bHasBatchOperationsAgain) {
												oModel.submitChanges({
													groupId: "changes",
													success: function () {
														oPlanningCalendarModel.setProperty("/hasBatchOperations", false);
														this.flushStore("Appointments,Appointments_Check").then(function () {
															this.refreshStore("Appointments", "Appointments_Check").then(
																function () {
																	this.refreshPlanningCalendarData().then(function () {
																		this.closeBusyDialog();
																	}.bind(this));
																}.bind(this));
														}.bind(this));
													}.bind(this),
													error: function () {
														console.log("Erro ao sincronizar dados do Outlook.");
														this.closeBusyDialog();
													}.bind(this)
												});
											} else {
												this.refreshPlanningCalendarData().then(function () {
													this.closeBusyDialog();
												}.bind(this));
											}
										}.bind(this));
									}.bind(this));
								}
							}.bind(this)).catch(error => {
								console.log(error);
							});
						}.bind(this));
						oPlanningCalendarModel.setData({
							newAppointment: [],
							DailyAppointments: [],
							scheduleCreate: false,
							enableScheduleSave: false,
							enableCancelSave: false,
							hasBatchOperations: false,
							startDate: new Date(),
							endDate: new Date(),
							selectedDate: oSelectedDate || new Date().getUTCDate(),
							selectedDateObject: oSelectedDateObject || new Date()
						});
					} else {
						if (oAppointments.length > 0) {
							if (bNoIntegration) {
								this.flushStore("Appointments,Appointments_Check").then(function () {
									this.refreshStore("Appointments", "Appointments_Check", "Prospects", "View_Grouping_Suppliers", "View_Users").then(
										function () {
											oPlanningCalendarModel.setData({
												newAppointment: [],
												scheduleCreate: false,
												enableScheduleSave: false,
												enableCancelSave: false,
												hasBatchOperations: false,
												startDate: new Date(),
												endDate: new Date(),
												selectedDate: oSelectedDate || new Date().getUTCDate(),
												selectedDateObject: oSelectedDateObject || new Date()
											});
											this.refreshPlanningCalendarData().then(function () {
												this.closeBusyDialog();
											}.bind(this));
										}.bind(this));
								}.bind(this));
							} else {
								this.mountCalendarData(oAppointments).then(function (oNormalizedData) {
									oPlanningCalendarModel.setData({
										newAppointment: [],
										DailyAppointments: [],
										scheduleCreate: false,
										enableScheduleSave: false,
										enableCancelSave: false,
										hasBatchOperations: false,
										startDate: new Date(),
										endDate: new Date(),
										selectedDate: oSelectedDate || new Date().getUTCDate(),
										selectedDateObject: oSelectedDateObject || new Date(),
										appointments: oNormalizedData
									});
									this.setDailyAppointments();
									this.closeBusyDialog();
								}.bind(this));
							}
						} else {
							this.closeBusyDialog();
						}
					}
				}.bind(this),
				// }.bind(this),
				error: function () {
					this.closeBusyDialog();
					console.log("Falha ao Carregar Agenda");
				}.bind(this)
			});
		},

		syncOutlookSchedulesWithHCP: function (aAppSchedules, aOutlookSchedules) {
			return new Promise(function (resolve, reject) {
				var aAppSchedulesAux = jQuery.extend(true, [], aAppSchedules);
				var oModel = this.getView().getModel();
				var oPlanningCalendarModel = this.getView().getModel("planningCalendarModel");
				var index;
				var aUserName = this.userName;

				this.mountOutlookSchedules(aOutlookSchedules, aAppSchedules);

				resolve();
			}.bind(this));
		},

		mountArrayDelete: function () {

			return new Promise(function (resolve, reject) {

				var aFilters = [];
				var oBackendModel = this.getView().getModel();
				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_CREATED_BY',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: this.userName.toString()
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_START_DATE',
					operator: sap.ui.model.FilterOperator.GE,
					value1: new Date().setHours(0)
				}));

				oBackendModel.read("/Appointments", {
					filters: aFilters,
					success: function (oResults) {

						var oAppointments = oResults.results;
						var arrayCancel = [];
						if (oAppointments.length > 0) {

							for (var i = 0; i < oAppointments.length; i++) {
								if ((oAppointments[i]["HCP_INTERACTION_TYPE"] == null) || ((oAppointments[i]["HCP_INTERACTION_TYPE"] == "outlook"))) {
									arrayCancel.push(oAppointments[i]);

								}

								if (i == oAppointments.length - 1) {
									resolve(arrayCancel);
								}

							}

						} else {
							resolve(arrayCancel);
						}
					}.bind(this),
					error: function () {
						console.log("Falha ao Carregar Compromissos");

					}
				});

			}.bind(this));

		},
		deleteOutlookArray: function (arrayDelete) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				oModel.setUseBatch(true);
				var aDeferredGroups = oModel.getDeferredGroups();
				var sPath;

				if (aDeferredGroups.indexOf("removes") < 0) {
					aDeferredGroups.push("removes");
					oModel.setDeferredGroups(aDeferredGroups);
				}

				for (var i = 0; i < arrayDelete.length; i++) {

					sPath = this.buildEntityPath("Appointments", arrayDelete[i], "HCP_APPOINT_ID");

					oModel.remove(sPath, {
						groupId: "removes"
					});

				}

				oModel.submitChanges({
					groupId: "removes",
					success: function () {

						resolve();

					}.bind(this),
					error: function () {
						resolve();
					}.bind(this)
				});

			}.bind(this));

		},

		callNewOutlook: function (aOutlookSchedules, aAppSchedules) {

			var schedulesSCP = aAppSchedules;

			return new Promise(function (resolve, reject) {

				var aOutlookArray = [];
				var aUserName = this.userName;
				var oComponent = this.getOwnerComponent();
				var oDeviceModel = oComponent.getModel("device");
				var oModel = this.getView().getModel();
				var bIsMobile = oDeviceModel.getData().browser.mobile;
				var aPromises = [];
				var oView = this;

				var i = 0;

				for (var outlookSchedule of aOutlookSchedules) {

					var isExist = schedulesSCP.filter(outlook => outlook.HCP_OUTLOOK_ID == outlookSchedule.id).length > 0 ? true : false;

					if (!isExist) {

						if ((outlookSchedule.subject != "Visita Fornecedor App") && (outlookSchedule.subject != "Visita Prospect App")) {

							aPromises.push(new Promise(function (resolve, reject) {

								var oStartDate = new Date(outlookSchedule.start.dateTime);
								var oEndDate = new Date(outlookSchedule.end.dateTime);

								var oStartDateToCompare = new Date(oStartDate);
								var oEndDateToCompare = new Date(oEndDate);

								oStartDateToCompare.setMinutes(oStartDateToCompare.getMinutes() - new Date().getTimezoneOffset());
								oEndDateToCompare.setMinutes(oEndDateToCompare.getMinutes() - new Date().getTimezoneOffset());
								var sTimestamp = new Date().getTime();

								//aqui novo

								var aData = {
									HCP_APPOINT_ID: sTimestamp.toFixed() + i,
									HCP_UNIQUE_KEY: this.generateUniqueKey() + i,
									HCP_APPOINTMENTS: '6',
									HCP_INTERACTION_OBJECTIVE: '1',
									HCP_INTERACTION_TYPE: '6',
									HCP_START_DATE: oStartDateToCompare,
									HCP_END_DATE: oEndDateToCompare,
									HCP_COMMENTS: outlookSchedule.bodyPreview,
									HCP_OUTLOOK_STATUS: "4",
									HCP_SUBJECT: outlookSchedule.subject,
									HCP_STATUS: "1",
									HCP_OUTLOOK_ID: outlookSchedule.id,
									HCP_CREATED_BY: aUserName,
									HCP_CREATED_AT: new Date()
								};

								oModel.createEntry("/Appointments", {
									properties: aData,
									success: function (oCreatedSchedule) {
										if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
											this.setBusyDialog("Compromisso", "Criando Compromisso");

											if (oCreatedSchedule["@com.sap.vocabularies.Offline.v1.isLocal"]) {
												this.getEntityByUniqueKey(oCreatedSchedule.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
													oModel.read("/" + sEntity, {
														success: function (result) {
															this.supplyMissingExpands("/" + sEntity, true).then(function () {
																var oData = oModel.getProperty("/" + sEntity);
																//this.flushStore("Appointments,Appointments_Check, Appointments_Delete").then(function () {
																// this.refreshStore("Appointments", "Appointments_Check, Appointments_Delete").then(function () {
																this.refreshPlanningCalendarData().then(function () {
																	sap.m.MessageToast.show("Compromisso salvo com sucesso!");
																	//this._oNewScheduleDialog.close();
																	this.closeBusyDialog();
																	//oSource.setBusy(false);
																}.bind(this));
																//}.bind(this));
																// }.bind(this));

															}.bind(this));
														}.bind(this)
													});
												}.bind(this));

											} else {
												this.getEntityByUniqueKey(oCreatedSchedule.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
													oModel.read("/" + sEntity, {
														success: function (result) {
															this.supplyMissingExpands("/" + sEntity, true).then(function () {
																var oData = oModel.getProperty("/" + sEntity);
																this.flushStore("Appointments").then(function () {
																	this.refreshStore("Appointments").then(function () {
																		this.refreshPlanningCalendarData().then(function () {
																			sap.m.MessageToast.show("Compromisso salvo com sucesso!");
																			//this._oNewScheduleDialog.close();
																			this.closeBusyDialog();
																			//oSource.setBusy(false);
																		}.bind(this));
																	}.bind(this));
																}.bind(this));
															}.bind(this));
														}.bind(this)
													});
												}.bind(this));
											}
										} else {
											this.getEntityByUniqueKey(oCreatedSchedule.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
												oModel.read("/" + sEntity, {
													success: function (result) {
														this.supplyMissingExpands("/" + sEntity, true).then(function () {
															this.refreshPlanningCalendarData().then(function () {
																sap.m.MessageToast.show("Compromisso salvo com sucesso!");
																this._oNewScheduleDialog.close();
																this.closeBusyDialog();
																//oSource.setBusy(false);
															}.bind(this));
														}.bind(this));
													}.bind(this)
												});
											}.bind(this));
										}
									}.bind(this),
									error: function () {
										sap.m.MessageToast.show("Erro ao salvar Compromisso");
										//oSource.setBusy(false);
										this._oNewScheduleDialog.close();
									}.bind(this)
								});

								this.outlookSchedules = aOutlookArray;

								resolve();

							}.bind(this)));

						}

					}
					i++;

				}

				Promise.all(aPromises).then(function () {

					resolve();
					var oCal1 = oView.byId("dateIntervalID");
					oCal1.destroySpecialDates();
					oModel.submitChanges();

				});
			}.bind(this));
		},

		mountOutlookSchedules: function (aOutlookSchedules, aAppSchedules) {

			//this.mountArrayDelete().then(function (arrayDelete) {

			//if(arrayDelete.length > 0){
			//this.deleteOutlookArray(arrayDelete).then(function(){

			//this.flushStore("Appointments").then(function () {
			//  this.refreshStore("Appointments").then(function () {
			this.getView().getModel().refresh(true);
			this.callNewOutlook(aOutlookSchedules, aAppSchedules).then(function () {
				console.log("1");
			}.bind(this));
			//   }.bind(this));
			//}.bind(this));
			//}.bind(this));
			//}else{
			//	this.callNewOutlook(aOutlookSchedules, aAppSchedules).then(function(){
			//       console.log("2");
			//      }.bind(this));
			//	}
			//}.bind(this));

		},

		mountCalendarData: function (oData) {
			return new Promise(function (resolve, reject) {

				var aAppointments = [];
				var oModel = this.getView().getModel();
				var aPromises = [];
				var oView = this.getView();

				for (var appointment of oData) {

					appointment["HCP_START_DATE_AUX"] = appointment.HCP_START_DATE;
					appointment["HCP_END_DATE_AUX"] = appointment.HCP_END_DATE;

					if (appointment["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
						aPromises.push(new Promise(function (resolve, reject) {
							this.getEntityByUniqueKey(appointment.HCP_UNIQUE_KEY, "Appointments").then(function (sEntity) {
								this.supplyMissingExpands("/" + sEntity, true).then(function () {
									var result = oModel.getProperty("/" + sEntity);

									var sName = result.HCP_NAME ? (result.Appoint_Prospect ? result.Appoint_Prospect.NAME1 :
										result.Appoint_Partner
										.NAME1) : (result.HCP_FROM_APP ? result?.Appoint_Commit?.HCP_COMMITMENT_DESC :
										"Compromissos do Outlook");
									var sIcon = result.HCP_NAME ? (result.Appoint_Prospect ? "sap-icon://employee-lookup" :
										"sap-icon://customer") : (
										result.HCP_FROM_APP ? (result.HCP_APPOINTMENTS === 3 ? "sap-icon://citizen-connect" : "sap-icon://e-care") :
										"sap-icon://email");

									result["HCP_START_DATE_AUX"] = result.HCP_START_DATE;
									result["HCP_END_DATE_AUX"] = result.HCP_END_DATE;

									var aClientinArray = aAppointments.filter(people => people.name === sName);
									var bHasClient = aClientinArray.length > 0 ? true : false;
									result["pic"] = sIcon;
									result["HCP_NAME_DESC"] = result.Appoint_Partner ? result.Appoint_Partner.NAME1 : result.Appoint_Prospect ? result.Appoint_Prospect
										.NAME1 : result["HCP_SUBJECT"];
									if (bHasClient) {
										aClientinArray[0].appointments?.push(result);
									} else {
										aAppointments.push(result);
									}
									resolve();
								}.bind(this));
							}.bind(this));
						}.bind(this)));
					} else {
						aPromises.push(new Promise(function (resolve, reject) {
							var sName;
							var oPlanningModel = this.getView().getModel("planningCalendarModel");
							if (appointment.Appoint_Partner) {
								sName = appointment.HCP_NAME ? (appointment.Appoint_Prospect ? appointment.Appoint_Prospect.NAME1 : appointment.Appoint_Partner
									.NAME1) : (appointment.HCP_FROM_APP ? appointment.Appoint_Commit.HCP_COMMITMENT_DESC : "Compromissos do Outlook");
							} else {

								sName = "Outlook";
							}

							var sIcon = appointment.HCP_NAME ? (appointment.Appoint_Prospect ? "sap-icon://employee-lookup" : "sap-icon://customer") :
								(
									appointment.HCP_FROM_APP ? (appointment.HCP_APPOINTMENTS === 3 ? "sap-icon://citizen-connect" : "sap-icon://e-care") :
									"sap-icon://email");

							var aClientinArray = aAppointments.filter(people => people.name === sName);
							var bHasClient = aClientinArray.length > 0 ? true : false;
							appointment["pic"] = sIcon;
							appointment["HCP_NAME_DESC"] = appointment.Appoint_Partner ? appointment.Appoint_Partner.NAME1 : appointment["HCP_SUBJECT"];
							if (bHasClient) {
								aClientinArray[0].appointments.push(appointment);
							} else {
								aAppointments.push(appointment);
							}
							resolve();
						}.bind(this)));
					}
				}
				Promise.all(aPromises).then(function () {

					var table = oView.byId("feedListId");
					table.getBinding("items").refresh();
					resolve(aAppointments);
					// return aAppointments;
				});
			}.bind(this));
		},
		onCommitmentChange: function (oEvent) {
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var oSource = oEvent.getSource();
			var oBindingContext = oSource.getBindingContext("planningCalendarModel");
			var oData = oPlanningModel.getProperty(oBindingContext.getPath());
			oData["HCP_NAME"] = null;
			oData["HCP_NAME_DESC"] = null;
			this._validateForm();
			// this.validateComboBoxInput(oEvent);
		},

		validateComboBoxInput: function (oEvent) {
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var oCombobox = oEvent.getSource();
			var oText = oCombobox.getValue();
			var oComboboxItems = oCombobox.getItems();
			var bIsValidValue = oComboboxItems.filter(item => item.getText() === oText).length > 0 ? true : false;

			if (!bIsValidValue && oText !== "") {
				oCombobox.setValueState("Error");
				oCombobox.setValueStateText("Valor Inválido");
				oPlanningModel.setProperty("/enableScheduleSave", false);
			} else {
				oCombobox.setValueState("None");
				oCombobox.setValueStateText("");
				oPlanningModel.setProperty("/enableScheduleSave", true);
			}
			this._validateForm();
		},

		_handlePartnerFilterPress: function () {
			var oFilterBar;
			if (!this.oPartnerFilter) {
				this.oPartnerFilter = sap.ui.xmlfragment("partnerFilterID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.prospects.fragments.PartnerFilter", this);
				this.getView().addDependent(this.oPartnerFilter);
				oFilterBar = sap.ui.core.Fragment.byId("partnerFilterID" + this.getView().getId(), "fbPartner");
				oFilterBar.attachBrowserEvent("keyup", jQuery.proxy(function (e) {
					if (e.which === 13) {
						this._onPartnerApplySearch();
					}
				}, this));
			} else {
				this.oPartnerFilter.getContent()[1].removeSelections();
			}
			this.oPartnerFilter.open();
		},

		_onPartnerApplySearch: function (oEvent) {
			var oList = sap.ui.core.Fragment.byId("partnerFilterID" + this.getView().getId(), "partnerListID");
			var oFilterBar = sap.ui.core.Fragment.byId("partnerFilterID" + this.getView().getId(), "fbPartner");
			var oFilters = this._getPartnerFilters(oFilterBar);

			oList.getBinding("items").filter(oFilters);
		},

		onPartnerSelected: function (oEvent) {
			var oSource = oEvent.getSource();
			var oPartnerInput = sap.ui.core.Fragment.byId("newScheduleFragmentID" + this.getView().getId(), "inputpartnerID");
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var oBindingContext = this._oNewScheduleDialog.getBindingContext("planningCalendarModel");
			var oData = oPlanningModel.getProperty(oBindingContext.getPath());
			var SelectedPartner = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

			oData["HCP_NAME"] = SelectedPartner.HCP_REGISTER;
			oData["HCP_NAME_DESC"] = SelectedPartner.NAME1;
			// oPartnerInput.setDescription(SelectedPartner.NAME1);
			oPlanningModel.refresh();
			this._validateForm();
			this.oPartnerFilter.close();
			this._oNewScheduleDialog.openBy(this._scheduleRequestSource);
		},

		_getPartnerFilters: function (oFilterBar) {
			var aFilterItems = oFilterBar.getAllFilterItems();
			var aFilters = [];
			for (var i = 0; i < aFilterItems.length; i++) {
				aFilters.push(new sap.ui.model.Filter({
					path: aFilterItems[i].getName(),
					operator: sap.ui.model.FilterOperator.Contains,
					value1: oFilterBar.determineControlByFilterItem(aFilterItems[i]).getValue().toString().toUpperCase()
				}));
			}
			return aFilters;
		},

		onPartnerDialogClose: function () {
			this.oPartnerFilter.close();
			this._oNewScheduleDialog.openBy(this._scheduleRequestSource);
		},

		_validateForm: function () {
			var oScheduleForm = sap.ui.core.Fragment.byId("newScheduleFragmentID" + this.getView().getId(), "ScheduleFormID");

			setTimeout(function () {
				var aInputControls = this._getFormFields(oScheduleForm.getContent());
				var oControl;
				var oPlanningModel = this.getView().getModel("planningCalendarModel");

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required) {
						var sValue = oControl.getValue();
						if (!sValue || oControl.getValueState() !== 'None') {
							oPlanningModel.setProperty("/enableScheduleSave", false);
							return;
						}
					}
				}
				oPlanningModel.setProperty("/enableScheduleSave", true);
			}.bind(this), 500);
		},

		_validateCancelForm: function () {
			var oScheduleForm = sap.ui.core.Fragment.byId("checkOutFragmentID" + this.getView().getId(), "cancelFormID");

			setTimeout(function () {
				var aInputControls = this._getFormFields(oScheduleForm.getContent());
				var oControl;
				var oPlanningModel = this.getView().getModel("planningCalendarModel");

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required) {
						var sValue = oControl.getValue();
						if (!sValue || oControl.getValueState() !== 'None') {
							oPlanningModel.setProperty("/enableCancelSave", false);
							return;
						}
					}
				}
				oPlanningModel.setProperty("/enableCancelSave", true);
			}.bind(this), 100);
		},

		_getFormFields: function (oFormFields) {
			var aControls = [];
			var sControlType;

			for (var i = 0; i < oFormFields.length; i++) {
				sControlType = oFormFields[i].getMetadata().getName();
				if (sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" || sControlType === "sap.m.Input" ||
					sControlType === "sap.m.DateTimePicker" ||
					sControlType === "sap.m.CheckBox" || sControlType === "sap.m.MaskInput" || sControlType === "sap.m.ComboBox") {
					if (oFormFields[i].getVisible()) {
						aControls.push({
							control: oFormFields[i],
							required: oFormFields[i - 1].getRequired && oFormFields[i - 1].getRequired()
						});
					}
				}
			}
			return aControls;
		},

		_onScheduleDateChange: function (oEvent) {
			var oSource = oEvent.getSource();
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var oBindingContextPath = this._oNewScheduleDialog.getBindingContext("planningCalendarModel").getPath();
			var oData = oPlanningModel.getProperty(oBindingContextPath);
			var oStartDateInput = sap.ui.core.Fragment.byId("newScheduleFragmentID" + this.getView().getId(), "scheduleStartDateID");
			var oEndDateInput = sap.ui.core.Fragment.byId("newScheduleFragmentID" + this.getView().getId(), "scheduleEndDateID");

			var bDateAlreadyPicked = false;
			var oDateInputName = oSource.getName();

			if (oDateInputName === "firstDate" && !oData.HCP_END_DATE_AUX) {
				var sNewEndDate = new Date(oData.HCP_START_DATE_AUX).setHours(oData.HCP_START_DATE_AUX.getHours() + 1);

				oData["HCP_END_DATE_AUX"] = new Date(sNewEndDate);
			}

			var oStartDate = oData.HCP_START_DATE_AUX || null;
			var oEndDate = oData.HCP_END_DATE_AUX || null;
			var oStartDateToCompare = new Date();

			this.validateDates(oData, oStartDate, oEndDate, oStartDateToCompare, true);
		},

		validateDates: function (oData, oStartDate, oEndDate, oStartDateToCompare, setValueStates) {
			var oPlanningModel = this.getView().getModel("planningCalendarModel");
			var bDateAlreadyPicked = false;
			var oStartDateInput = sap.ui.core.Fragment.byId("newScheduleFragmentID" + this.getView().getId(), "scheduleStartDateID");
			var oEndDateInput = sap.ui.core.Fragment.byId("newScheduleFragmentID" + this.getView().getId(), "scheduleEndDateID");

			if (oStartDate && oEndDate) {
				var sPeoples = oPlanningModel.getProperty("/appointments");

				if (sPeoples) {
					for (var index in sPeoples) {
						var currPeopleAppointment = sPeoples[index];
						if (currPeopleAppointment.HCP_FROM_APP !== null) {
							// bDateAlreadyPicked = (oStartDate < currPeopleAppointment.HCP_START_DATE && oEndDate > currPeopleAppointment.HCP_END_DATE) ||
							// 	(oStartDate < currPeopleAppointment.HCP_START_DATE && (oEndDate < currPeopleAppointment.HCP_END_DATE && oEndDate >
							// 		currPeopleAppointment.HCP_START_DATE)) ||
							// 	(oStartDate >
							// 		currPeopleAppointment.HCP_START_DATE && oEndDate < currPeopleAppointment.HCP_END_DATE) ? true : false;
							bDateAlreadyPicked = (oStartDate < currPeopleAppointment.HCP_START_DATE && oEndDate > currPeopleAppointment.HCP_END_DATE) ||
								(oStartDate < currPeopleAppointment.HCP_START_DATE && (oEndDate < currPeopleAppointment.HCP_END_DATE && oEndDate >
									currPeopleAppointment.HCP_START_DATE)) ||
								(oStartDate >
									currPeopleAppointment.HCP_START_DATE && oEndDate < currPeopleAppointment.HCP_END_DATE) || (oStartDate >
									currPeopleAppointment.HCP_START_DATE && (oEndDate > currPeopleAppointment.HCP_END_DATE && oStartDate <
										currPeopleAppointment.HCP_END_DATE)) ? true : false;

							if (oStartDate > oEndDate) {
								if (setValueStates) {
									oStartDateInput.setValueState("Error");
									oEndDateInput.setValueState("Error");
									oStartDateInput.setValueStateText("Data início deve ser maior que data fim.");
									oEndDateInput.setValueStateText("Data início deve ser maior que data fim.");
								}
								oPlanningModel.setProperty("/enableScheduleSave", false);
								return;
							} else if (oStartDate < new Date(oStartDateToCompare.setMinutes(oStartDateToCompare.getMinutes() - 1))) {
								if (setValueStates) {
									oStartDateInput.setValueState("Error");
									oEndDateInput.setValueState("Error");
									oStartDateInput.setValueStateText("Data informada é inferior a data atual.");
									oEndDateInput.setValueStateText("Data informada é inferior a data atual.");
								}
								oPlanningModel.setProperty("/enableScheduleSave", false);
								return;
							}
							if (bDateAlreadyPicked && oData.HCP_APPOINT_ID !== currPeopleAppointment.HCP_APPOINT_ID) {
								if (setValueStates) {
									oStartDateInput.setValueState("Error");
									oEndDateInput.setValueState("Error");
									oStartDateInput.setValueStateText("Já existe um compromisso para este intervalo.");
									oEndDateInput.setValueStateText("Já existe um compromisso para este intervalo.");
								}
								oPlanningModel.setProperty("/enableScheduleSave", false);
								return;
							}
						} else {
							if (oStartDate > oEndDate) {
								if (setValueStates) {
									oStartDateInput.setValueState("Error");
									oEndDateInput.setValueState("Error");
									oStartDateInput.setValueStateText("Data início deve ser maior que data fim.");
									oEndDateInput.setValueStateText("Data início deve ser maior que data fim.");
								}
								oPlanningModel.setProperty("/enableScheduleSave", false);
								return;
							} else if (oStartDate < new Date(oStartDateToCompare.setMinutes(oStartDateToCompare.getMinutes() - 1))) {
								if (setValueStates) {
									oStartDateInput.setValueState("Error");
									oEndDateInput.setValueState("Error");
									oStartDateInput.setValueStateText("Data informada é inferior a data atual.");
									oEndDateInput.setValueStateText("Data informada é inferior a data atual.");
								}
								oPlanningModel.setProperty("/enableScheduleSave", false);
								return;
							}
						}
					}
				} else {
					if (oStartDate > oEndDate) {
						if (setValueStates) {
							oStartDateInput.setValueState("Error");
							oEndDateInput.setValueState("Error");
							oStartDateInput.setValueStateText("Data início deve ser maior que data fim.");
							oEndDateInput.setValueStateText("Data início deve ser maior que data fim.");
						}
						oPlanningModel.setProperty("/enableScheduleSave", false);
						return;
					} else if (oStartDate < new Date(oStartDateToCompare.setMinutes(oStartDateToCompare.getMinutes() - 1))) {
						if (setValueStates) {
							oStartDateInput.setValueState("Error");
							oEndDateInput.setValueState("Error");
							oStartDateInput.setValueStateText("Data informada é inferior a data atual.");
							oEndDateInput.setValueStateText("Data informada é inferior a data atual.");
						}
						oPlanningModel.setProperty("/enableScheduleSave", false);
						return;
					}
				}
				oPlanningModel.setProperty("/enableScheduleSave", true);
				oStartDateInput.setValueState("None");
				oEndDateInput.setValueState("None");
				this._validateForm();
			} else {
				this._validateForm();
			}
		},
		verifyTimeOut: function () {

			if (!this.hasFinished) {
				setTimeout(function () {
					this.setBusyDialog(this.resourceBundle.getText("textGrainApp"), this.resourceBundle.getText("textWait") + "(" + this.revertCount +
						")");
					this.count++;
					this.revertCount--;
					console.log("Countador está em: " + this.count);
					if (this.count > 20) {
						this.showMessage();
					} else {
						this.verifyTimeOut();
					}

				}.bind(this), 1000);
			} else {
				if (this.busyDialog) {
					this.busyDialog.close();
				}
			}
		},

		showMessage: function () {
			localStorage.setItem("isNeededToReload", true);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("errorPages.timeOutConnection", true);
		},
		navBack2: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}
		},

		mountDays: function (days) {

			var oCal1 = this.byId("dateIntervalID");
			var dataArray = [];
			var calendarioArray = [];
			for (var i = 0; i < days.length; i++) {
				var data = new Date(days[i].HCP_START_DATE);
				var a = dataArray.indexOf(data.toDateString());

				if (a > -1) {

					var arrayCal;

					if ((days[i].Appoint_Partner) || (days[i].Appoint_Prospect)) {
						arrayCal = calendarioArray.find(calendario => new Date(calendario.startDate).toDateString() === data.toDateString());
						arrayCal.isWeb = true;
					} else {
						arrayCal = calendarioArray.find(calendario => new Date(calendario.startDate).toDateString() === data.toDateString());
						arrayCal.isOutlook = true;
					}

					if ((arrayCal.isWeb) && (arrayCal.isOutlook)) {
						arrayCal.tipo = "Type02";
					}

				} else {
					var dataDados;
					if ((days[i].Appoint_Partner) || (days[i].Appoint_Prospect)) {
						dataDados = {
							tipo: "Type07",
							startDate: new Date(days[i].HCP_START_DATE),
							isOutlook: false,
							isWeb: true
						};
					} else {
						dataDados = {
							tipo: "Type10",
							startDate: new Date(days[i].HCP_START_DATE),
							isOutlook: true,
							isWeb: false
						};
					}

					calendarioArray.push(dataDados);

				}
				dataArray.push(data.toDateString());

				if (i == days.length - 1) {

					for (var c = 0; c < calendarioArray.length; c++) {
						oCal1.addSpecialDate(new sap.ui.unified.DateTypeRange({
							startDate: calendarioArray[c].startDate,
							type: calendarioArray[c].tipo,
							tooltip: "Placeholder"
						}));
					}

				}

				/*if(a > -1){
					if(days[i].Appoint_Partner){
						oCal1.addSpecialDate(new sap.ui.unified.DateTypeRange({
							startDate : new Date(days[i].HCP_START_DATE),
							type : "Type08",
							tooltip : "Placeholder"
						}));
					}else{
						//aqui
						oCal1.addSpecialDate(new sap.ui.unified.DateTypeRange({
							startDate : new Date(days[i].HCP_START_DATE),
							type : "Type03",
							tooltip : "Placeholder"
						}));
					}
				}else{
					if(days[i].Appoint_Partner){
						oCal1.addSpecialDate(new sap.ui.unified.DateTypeRange({
							startDate : new Date(days[i].HCP_START_DATE),
							type : "Type02",
							tooltip : "Placeholder"
						}));
					}else{
						oCal1.addSpecialDate(new sap.ui.unified.DateTypeRange({
							startDate : new Date(days[i].HCP_START_DATE),
							type : "Type05",
							tooltip : "Placeholder"
						}));
					}

				}*/

			}

		},

		buildEntityPath: function (sEntityName, oEntity, oField) {
			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity[oField] + "l)";
			}
		}

		// 	_onScheduleDateChange: function (oEvent) {
		// 	var oSource = oEvent.getSource();
		// 	var oPlanningModel = this.getView().getModel("planningCalendarModel");
		// 	var oBindingContextPath = this._oNewScheduleDialog.getBindingContext("planningCalendarModel").getPath();
		// 	var oData = oPlanningModel.getProperty(oBindingContextPath);
		// 	var oStartDateInput = sap.ui.core.Fragment.byId("newScheduleFragmentID" + this.getView().getId(), "scheduleStartDateID");
		// 	var oEndDateInput = sap.ui.core.Fragment.byId("newScheduleFragmentID" + this.getView().getId(), "scheduleEndDateID");

		// 	var bDateAlreadyPicked = false;
		// 	var oDateInputName = oSource.getName();

		// 	if (oDateInputName === "firstDate" && !oData.HCP_END_DATE) {
		// 		var sNewEndDate = new Date(oData.HCP_START_DATE).setHours(oData.HCP_START_DATE.getHours() + 1);

		// 		oData["HCP_END_DATE"] = new Date(sNewEndDate);
		// 	}

		// 	var oStartDate = oData.HCP_START_DATE || null;
		// 	var oEndDate = oData.HCP_END_DATE || null;
		// 	var oStartDateToCompare = new Date();

		// 	if (oStartDate && oEndDate) {
		// 		var sPeoples = oPlanningModel.getProperty("/appointments");

		// 		if (sPeoples) {
		// 			for (var index in sPeoples) {
		// 				var currPeopleAppointment = sPeoples[index];
		// 				if (currPeopleAppointment.HCP_FROM_APP !== null) {
		// 					// bDateAlreadyPicked = (oStartDate < currPeopleAppointment.HCP_START_DATE && oEndDate > currPeopleAppointment.HCP_END_DATE) ||
		// 					// 	(oStartDate < currPeopleAppointment.HCP_START_DATE && (oEndDate < currPeopleAppointment.HCP_END_DATE && oEndDate >
		// 					// 		currPeopleAppointment.HCP_START_DATE)) ||
		// 					// 	(oStartDate >
		// 					// 		currPeopleAppointment.HCP_START_DATE && oEndDate < currPeopleAppointment.HCP_END_DATE) ? true : false;
		// 					bDateAlreadyPicked = (oStartDate < currPeopleAppointment.HCP_START_DATE && oEndDate > currPeopleAppointment.HCP_END_DATE) ||
		// 						(oStartDate < currPeopleAppointment.HCP_START_DATE && (oEndDate < currPeopleAppointment.HCP_END_DATE && oEndDate >
		// 							currPeopleAppointment.HCP_START_DATE)) ||
		// 						(oStartDate >
		// 							currPeopleAppointment.HCP_START_DATE && oEndDate < currPeopleAppointment.HCP_END_DATE) || (oStartDate >
		// 							currPeopleAppointment.HCP_START_DATE && (oEndDate > currPeopleAppointment.HCP_END_DATE && oStartDate <
		// 								currPeopleAppointment.HCP_END_DATE)) ? true : false;

		// 					if (oStartDate > oEndDate) {
		// 						oStartDateInput.setValueState("Error");
		// 						oEndDateInput.setValueState("Error");
		// 						oStartDateInput.setValueStateText("Data início deve ser maior que data fim.");
		// 						oEndDateInput.setValueStateText("Data início deve ser maior que data fim.");
		// 						oPlanningModel.setProperty("/enableScheduleSave", false);
		// 						return;
		// 					} else if (oStartDate < new Date(oStartDateToCompare.setMinutes(oStartDateToCompare.getMinutes() - 1))) {
		// 						oStartDateInput.setValueState("Error");
		// 						oEndDateInput.setValueState("Error");
		// 						oStartDateInput.setValueStateText("Data informada é inferior a data atual.");
		// 						oEndDateInput.setValueStateText("Data informada é inferior a data atual.");
		// 						oPlanningModel.setProperty("/enableScheduleSave", false);
		// 						return;
		// 					}
		// 					if (bDateAlreadyPicked) {
		// 						oStartDateInput.setValueState("Error");
		// 						oEndDateInput.setValueState("Error");
		// 						oStartDateInput.setValueStateText("Já existe um compromisso para este intervalo.");
		// 						oEndDateInput.setValueStateText("Já existe um compromisso para este intervalo.");
		// 						oPlanningModel.setProperty("/enableScheduleSave", false);
		// 						return;
		// 					}
		// 				} else {
		// 					if (oStartDate > oEndDate) {
		// 						oStartDateInput.setValueState("Error");
		// 						oEndDateInput.setValueState("Error");
		// 						oStartDateInput.setValueStateText("Data início deve ser maior que data fim.");
		// 						oEndDateInput.setValueStateText("Data início deve ser maior que data fim.");
		// 						oPlanningModel.setProperty("/enableScheduleSave", false);
		// 						return;
		// 					} else if (oStartDate < new Date(oStartDateToCompare.setMinutes(oStartDateToCompare.getMinutes() - 1))) {
		// 						oStartDateInput.setValueState("Error");
		// 						oEndDateInput.setValueState("Error");
		// 						oStartDateInput.setValueStateText("Data informada é inferior a data atual.");
		// 						oEndDateInput.setValueStateText("Data informada é inferior a data atual.");
		// 						oPlanningModel.setProperty("/enableScheduleSave", false);
		// 						return;
		// 					}
		// 				}
		// 			}
		// 		} else {
		// 			if (oStartDate > oEndDate) {
		// 				oStartDateInput.setValueState("Error");
		// 				oEndDateInput.setValueState("Error");
		// 				oStartDateInput.setValueStateText("Data início deve ser maior que data fim.");
		// 				oEndDateInput.setValueStateText("Data início deve ser maior que data fim.");
		// 				oPlanningModel.setProperty("/enableScheduleSave", false);
		// 				return;
		// 			} else if (oStartDate < new Date(oStartDateToCompare.setMinutes(oStartDateToCompare.getMinutes() - 1))) {
		// 				oStartDateInput.setValueState("Error");
		// 				oEndDateInput.setValueState("Error");
		// 				oStartDateInput.setValueStateText("Data informada é inferior a data atual.");
		// 				oEndDateInput.setValueStateText("Data informada é inferior a data atual.");
		// 				oPlanningModel.setProperty("/enableScheduleSave", false);
		// 				return;
		// 			}
		// 		}
		// 		oPlanningModel.setProperty("/enableScheduleSave", true);
		// 		oStartDateInput.setValueState("None");
		// 		oEndDateInput.setValueState("None");
		// 	}
		// 	this._validateForm();
		// }
	});
}, /* bExport= */ true);