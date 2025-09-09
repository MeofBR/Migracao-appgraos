sap.ui.define([
		"com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
		"sap/m/MessageBox",
		"sap/ui/core/routing/History",
		'sap/ui/model/json/JSONModel',
		'sap/suite/ui/commons/util/DateUtils',
		'sap/ui/unified/FileUploader'
	], function (MainController, MessageBox, History, JSONModel, DateUtils, FileUploader) {
		"use strict";

		return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.Index", {
			handleRouteMatched: function (oEvent) {

				//this.updateOfferIdCommodities().then(function () {}.bind(this)).catch(function (error) {}.bind(this));

				var bIsMobile = window.fiori_client_appConfig;
				var appVersion;

				//localStorage.setItem("appVersion", '1.0');
				this.count = 0;
				this.revertCount = 120;
				this.hasFinished = false;
				this.timeOut = 120;
				this.hasUser = false;
				this.isRefresh = false;
				this.getIndicators = false;
				this.countData = 0;

				this.getView().getModel("indexModel").setProperty("/totalCurrentPurchaseVolume", 0);
				this.getView().getModel("indexModel").setProperty("/totalAppointment", 0);
				this.getView().getModel("indexModel").setProperty("/totalOffers", 0);
				this.getView().getModel("indexModel").setProperty("/totalVolume", 0);

				this.getView().getModel("indexModel").setProperty("/totalLastMonthPurchaseVolume", 0);
				this.getView().getModel("indexModel").setProperty("/totalAppointmentLM", 0);
				this.getView().getModel("indexModel").setProperty("/totalOffersLM", 0);
				this.getView().getModel("indexModel").setProperty("/totalVolumeLM", 0);

				this.getView().getModel("indexModel").setProperty("/hasCountOfferMap", false);

				this.getView().getModel("indexModel").setProperty("/hasCountCommodities", false);
				this.getView().getModel("indexModel").setProperty("/hasPendingCommodities", false);
				this.getView().getModel("indexModel").setProperty("/hasPendingDepositCommodities", false);
				this.getView().getModel("indexModel").setProperty("/showConfig", false);

				if ((bIsMobile && navigator.connection.type !== "none") && !this.hasUser) {
					this.verifyTimeOutUser();
				}
				this.getUser().then(function (userName) {
					this.userName = userName;
					this.isStop = true;
					this.hasUser = false;
					var sTimestamp = new Date().getTime();

					// FotoOffline
					if ((bIsMobile && (navigator.connection.type == "WIFI" || navigator.connection.type == "wifi" || navigator.connection.type ==
							"4g")) && !this.hasUser && (device.platform != "iOS")) {
						this.arrayFile = [];
						this.arrayInput = [];
						this._listPicture();
					}
					//fecha fotoOffline

					var newDate = new Date();
					var timezone = newDate.getTimezoneOffset() * 60 * 1000;
					var firstDay = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
					var lastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);

					this.start_date = new Date(new Date(firstDay).setHours(0, 0, 0));
					this.end_date = new Date(new Date(lastDay).setHours(23, 59, 59));

					var newDateLastMonth = new Date();
					//newDateLastMonth = new Date(newDateLastMonth.setMonth(newDateLastMonth.getMonth() - 1));
					//Correção extrato comprador ultimo dia do mês trazia mesmo mês
					newDateLastMonth = new Date(newDateLastMonth.getFullYear(),newDateLastMonth.getMonth()-1,1);
					var firstDayLastMonth = new Date(newDateLastMonth.getFullYear(), newDateLastMonth.getMonth(), 1);
					var lastDayLastMonth = new Date(newDateLastMonth.getFullYear(), newDateLastMonth.getMonth() + 1, 0);

					this.start_dateLastMonth = new Date(new Date(firstDayLastMonth).setHours(0, 0, 0));

					this.end_dateLastMonth = new Date(new Date(lastDayLastMonth).setHours(23, 59, 59));

					this.getCommercialInidicators().then(function () {
						this.getAppointmentsIndicators().then(function () {
							this.getOfferMapIndicators().then(function () {
								this.getPendingCommoditiesData().then(function () {
									this.getPendingDepositCommoditiesData().then(function () {

										this.getView().getModel("indexModel").setProperty("/totalCurrentPurchaseVolume", this.totalCurrentPurchaseVolume);
										this.getView().getModel("indexModel").setProperty("/totalAppointment", this.totalAppointment);
										this.getView().getModel("indexModel").setProperty("/totalOffers", this.totalOffers);
										this.getView().getModel("indexModel").setProperty("/totalVolume", this.totalVolume);

										this.getView().getModel("indexModel").setProperty("/totalLastMonthPurchaseVolume", this.totalLastMonthPurchaseVolume);
										this.getView().getModel("indexModel").setProperty("/totalAppointmentLM", this.totalAppointmentLM);
										this.getView().getModel("indexModel").setProperty("/totalOffersLM", this.totalOffersLM);
										this.getView().getModel("indexModel").setProperty("/totalVolumeLM", this.totalVolumeLM);

										this.getIndicators = true;

										this.getView().getModel("indexModel").setProperty("/keepBusy", false);

									}.bind(this)).catch(function (error) {
										console.log(error);
									}.bind(this));

								}.bind(this)).catch(function (error) {
									console.log(error);
								}.bind(this));
							}.bind(this)).catch(function (error) {
								console.log(error);
							}.bind(this));
						}.bind(this)).catch(function (error) {
							console.log(error);
						}.bind(this));
					}.bind(this)).catch(function (error) {
						console.log(error);
					}.bind(this));

					//Check for users intentions and today`s prices, then prepares the message dialog for show up.
					if (!this.getView().getModel("indexModel").getProperty("/initialized")) {
						//this.getIntentionMessages();
						this.getView().getModel("indexModel").setProperty("/initialized", true);

						// setInterval(function () {
						// 	this.getIntentionMessages();
						// }.bind(this), 100000);

					}

					if (bIsMobile) {
						if (localStorage.getItem("countStorageCommodities") > 0) {

							var message;

							if (localStorage.getItem("countStorageCommodities") > 1) {
								message = 'Você possui ' + localStorage.getItem("countStorageCommodities") +
									' compras criadas, atualize a interface!';
							} else {
								message = 'Você possui ' + localStorage.getItem("countStorageCommodities") +
									' compra criada, atualize a interface!';
							}

							this.getView().getModel("indexModel").setProperty("/countStorageCommodities", message);
							this.getView().getModel("indexModel").setProperty("/hasCountCommodities", true);

						}

						if (localStorage.getItem("countStorageOfferMap") > 0) {

							var messageOfferMap;

							if (localStorage.getItem("countStorageOfferMap") > 1) {
								messageOfferMap = 'Você possui ' + localStorage.getItem("countStorageOfferMap") +
									' ofertas criadas, atualize a interface!';
							} else {
								messageOfferMap = 'Você possui ' + localStorage.getItem("countStorageOfferMap") +
									' oferta criada, atualize a interface!';
							}

							this.getView().getModel("indexModel").setProperty("/countStorageOfferMap", messageOfferMap);
							this.getView().getModel("indexModel").setProperty("/hasCountOfferMap", true);

						}
					} else {
						this.getView().getModel("indexModel").setProperty("/showConfig", true);
					}

					if ((bIsMobile && navigator.connection.type !== "none")) {
						appVersion = window.fiori_client_appConfig.appVersion;

						if (appVersion == "7.2" && !localStorage.getItem("appVersion")) {
							this.refreshData();

						} else {
							if (localStorage.getItem("appVersion")) {
								if (appVersion != localStorage.getItem("appVersion")) {
									this.refreshData();
								}
							} else {
								localStorage.setItem("appVersion", appVersion);
							}
						}

					} else if ((bIsMobile && navigator.connection.type === "none")) {
						appVersion = window.fiori_client_appConfig.appVersion;

					} else {
						var oForm = this.getView().byId("headerID");
						oForm.addStyleClass("extrato-compras");
						var oPanel = this.getView().byId("panelID");
						oPanel.addStyleClass("extrato-compras");

						appVersion = "23.5.2";
					}

					// appVersion = "2.0";
					this.getView().getModel("indexModel").setProperty("/appVersion", appVersion);

					this.hasUser = true;

					if (this.getIndicators) {
						this.getView().getModel("indexModel").setProperty("/keepBusy", false);
					}
					
					this.executeAwaitFunction()
				}.bind(this));

				var ua = window.navigator.userAgent;
				var msie = ua.indexOf("Trident/");

				if (msie > 0) {
					this.getView().getModel("indexModel").setProperty("/isIE", true);
				}

				this.getView().getModel("indexModel").setProperty("/expandIndex", true);

				this.getView().getModel("photoModel").setData({
					ItemPhoto: [],
					logError: [],
					arrayPhotoToSave: [],
					hasOfflinePhotos: false
				});

				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;

				if (bIsMobile) {
					this.getView().getModel("indexModel").setProperty("/isMobile", true);
				} else {
					this.getView().getModel("indexModel").setProperty("/isMobile", false);
				}

			},
			
			executeAwaitFunction: async function () {
				let responseVisitFormPending = await this.getQtdePartnerVisitForm()
				
				if (responseVisitFormPending.length > 0) {
					this.getView().getModel("indexModel").setProperty("/hasPartnerVisitFormPending", responseVisitFormPending.length)
					
					this.createMessageDialog(responseVisitFormPending)
					
					let alreadyVisualizedModalMessage = sessionStorage.getItem("modalMessage");
					if (alreadyVisualizedModalMessage != 1) {
						this.showMessageDialog()	
					}
					
	            	alreadyVisualizedModalMessage != 1 && sessionStorage.setItem("modalMessage", 1);
	            }
			},
			
			getQtdePartnerVisitForm: async function () {
				let userName = this.userName
				
				let oDataModel = this.getOwnerComponent().getModel();
				var oModel = this.getView().getModel("indexModel");
				
				let listVisitFormPending = [];
				
		    	let serviceBusinessVisit = "/Business_Visit";
	            var oFirstDayOfMonth = new Date();
	                oFirstDayOfMonth.setDate(1);
	                oFirstDayOfMonth.setHours(0, 0, 0, 0);
	                
	            var oLastDayOfMonth = new Date(oFirstDayOfMonth);
		            oLastDayOfMonth.setMonth(oLastDayOfMonth.getMonth() + 1);
		            oLastDayOfMonth.setDate(0);
		            oLastDayOfMonth.setHours(20, 0, 0, 0);
	
	            let oFilter = new sap.ui.model.Filter({
	                path: "HCP_DATE",
	                operator: sap.ui.model.FilterOperator.BT,
	                value1: oFirstDayOfMonth,
	                value2: oLastDayOfMonth
	            });
				
				const listRanking = await new Promise(function (resolve, reject) {
	                oDataModel.read(serviceBusinessVisit, {
	                	urlParameters: {
							"$expand": 'Ranking_Add,Ranking_Add/Ranking_Name'
						},
	                	filters: [oFilter],
	                    success: function (data) {
	                        resolve(data.results[0]?.Ranking_Add?.results);
	                    }.bind(this),
	                    error: function (oError) {
	                        reject(oError);
	                    }.bind(this),
	                });
	            });
	            
				let serviceZmm = "/ZMM5005";
	            let oFilterZmm = new sap.ui.model.Filter("BNAME", sap.ui.model.FilterOperator.EQ, userName);
				
				const responseZmm = await new Promise(function (resolve, reject) {
	                oDataModel.read(serviceZmm, {
	                	filters: [oFilterZmm],
	                    success: function (data) {
	                        resolve(data.results[0]);
	                    }.bind(this),
	                    error: function (oError) {
	                        reject(oError);
	                    }.bind(this),
	                });
	            });
	     
	    		let oFilterSimplifiedContact = [];
	        	let serviceSimplifiedContact = "/Simplified_Contact";
	        	if (responseZmm?.EKGRP) {
	        		 oFilterSimplifiedContact.push(new sap.ui.model.Filter("HCP_EKGRP", sap.ui.model.FilterOperator.EQ, responseZmm?.EKGRP));
	        	
	        		  oFilterSimplifiedContact.push(new sap.ui.model.Filter("HCP_ACTIVE", sap.ui.model.FilterOperator.EQ, "1"));
				
					const responseSimplifiedContact = await new Promise(function (resove, reject) {
		                oDataModel.read(serviceSimplifiedContact, {
		                	filters: oFilterSimplifiedContact,
		                    success: function (data) {
		                        resove(data);
		                    }.bind(this),
		                    error: function (oError) {
		                        reject(oError);
		                    }.bind(this),
		                });
		            });
		            
		            responseSimplifiedContact.results.map((result) => {
		            	if (result.HCP_VISIT_FORM == 0) {
			            	listRanking.map((obj) => {
			            		if (obj.HCP_RANK_ID == result.HCP_RANK) {
			            			listVisitFormPending.push(result)
			            		}
			            	})	
		            	}
		            })
	        	}
	            
	            return listVisitFormPending
			},

			getIntentionMessages: function () {
				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;

				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
					this.refreshStore("Table_Price").then(function () {
						this.checkIntentions().then(intentions => {
							var oValidIntentions = this.getValidIntentions(intentions);
							var sUnreadMessages = oValidIntentions.filter(message => message.processed.HCP_READ_MESSAGE === "0").length;
							this.getView().getModel("indexModel").setProperty("/messageCounter", sUnreadMessages > 0 ? sUnreadMessages : 0);
							this.getView().getModel("indexModel").setProperty("/messageBusyIndicator", false);
							this.setupIntentionMessages(oValidIntentions);
							if (sUnreadMessages > 0) {
								this.showMessageDialog();
							}
							// console.log(intentions);
						}).catch(error => {
							console.log(error);
						});
					}.bind(this));
				}
			},

			refreshIntentionMessages: function () {
				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;

				this.getView().getModel("indexModel").setProperty("/messageBusyIndicator", true);
				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

					this.refreshStore("Table_Price").then(function () {
						this.checkIntentions().then(intentions => {
							var oValidIntentions = this.getValidIntentions(intentions);
							var sUnreadMessages = oValidIntentions.filter(message => message.processed.HCP_READ_MESSAGE === "0").length;
							this.getView().getModel("indexModel").setProperty("/messageCounter", sUnreadMessages > 0 ? sUnreadMessages : 0);
							this.getView().getModel("indexModel").setProperty("/messageBusyIndicator", false);
							this.setupIntentionMessages(oValidIntentions);
							if (sUnreadMessages > 0) {
								this.showMessageDialog();
							}
						}).catch(error => {
							this.getView().getModel("indexModel").setProperty("/messageBusyIndicator", false);
							console.log(error);
						});
					}.bind(this));
				}
			},

			refreshData: function () {

				var bIsMobile = window.fiori_client_appConfig;
				var appVersion = window.fiori_client_appConfig.appVersion;

				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
					this.isRefresh = true;
					this.setBusyDialog("App Grãos", "Atualizando Informações");
					this.flushStore().then(function () {
						this.refreshStore().then(function () {
							this.getPendingCommoditiesData().then(function () {
								this.getPendingDepositCommoditiesData().then(function () {

									this.refreshIntentionMessages();
									var lastUpdate;
									var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
										pattern: "dd/MM/yyyy HH:mm"
									});

									this.getCommercialInidicators().then(function () {
										this.getAppointmentsIndicators().then(function () {
											this.getOfferMapIndicators().then(function () {
												this.getPendingCommoditiesData().then(function () {
													this.getPendingDepositCommoditiesData().then(function () {

														localStorage.setItem("lastUpdate", new Date());
														localStorage.setItem("lastUpdateTablePrice", new Date());
														localStorage.setItem("lastUpdateWareHouse", new Date());
														localStorage.setItem("lastUpdateOfferMap", new Date());
														localStorage.setItem("lastUpdateCommodities", new Date());
														localStorage.setItem("lastUpdateSchedule", new Date());
														localStorage.setItem("lastUpdateProspects", new Date());
														localStorage.setItem("lastUpdateNegotiationReport", new Date());
														localStorage.setItem("lastUpdateVisitForm", new Date());

														if (bIsMobile) {
															localStorage.setItem("countStorageCommodities", 0);
															localStorage.setItem("countStorageOfferMap", 0);
															this.getView().getModel("indexModel").setProperty("/countStorageOfferMap", 0);
															this.getView().getModel("indexModel").setProperty("/hasCountOfferMap", false);
															this.getView().getModel("indexModel").setProperty("/countStorageCommodities", 0);
															this.getView().getModel("indexModel").setProperty("/hasCountCommodities", false);
															localStorage.setItem("lastUpdate", new Date());
														}
														
														if (localStorage.getItem("lastUpdate")) {
															lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdate")));
														}

														this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdate);
														localStorage.setItem("appVersion", appVersion);

														this.closeBusyDialog();
														this.getView().getModel().refresh();

													}.bind(this)).catch(function (error) {
														console.log(error);
													}.bind(this));

												}.bind(this)).catch(function (error) {
													console.log(error);
												}.bind(this));
											}.bind(this)).catch(function (error) {
												console.log(error);
											}.bind(this));
										}.bind(this)).catch(function (error) {
											console.log(error);
										}.bind(this));
									}.bind(this)).catch(function (error) {
										console.log(error);
									}.bind(this));

								}.bind(this)).catch(function (error) {
									console.log(error);
								}.bind(this));

							}.bind(this)).catch(function (error) {
								console.log(error);
							}.bind(this));

						}.bind(this));
					}.bind(this));
				} else {

					var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
					var sMessage = "Sem conexão com a internet, por favor verifique e tente novamente.";

					MessageBox.information(
						sMessage, {
							actions: [sap.m.MessageBox.Action.OK],
							styleClass: bCompact ? "sapUiSizeCompact" : "",
							onClose: function (sAction) {
								if (sAction === "OK") {

									this.getView().getModel().refresh();

								}
							}.bind(this)
						}
					);

				}
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

			refreshStore: function (entity1, entity2, entity3, entity4, entity5, entity6) {
				return new Promise(function (resolve, reject) {
					if (typeof sap.hybrid !== 'undefined') {
						// this.setBusyDialog("App Grãos", "Atualizando banco de dados");
						sap.hybrid.refreshStore(entity1, entity2, entity3, entity4, entity5, entity6).then(function () {
							resolve();
						}.bind(this));
					} else {
						resolve();
					}
				}.bind(this));
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
			
			_onMasterDataPress: function (oEvent) {
				var oBindingContext = oEvent.getSource().getBindingContext();

				this.getUserProfileMasterData(this.userName).then(profileData => {

					if (profileData) {
						return new Promise(function (fnResolve) {

							this.doNavigate("masterData.Index", oBindingContext, fnResolve, "");
						}.bind(this)).catch(function (err) {
							if (err !== undefined) {
								MessageBox.error(err.message);
							}
						});
					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});
			},
			_onCommoditiesPress: function (oEvent) {
				var oBindingContext = oEvent.getSource().getBindingContext();

				this.getUserProfile("View_Profile_Commodities", this.userName).then(profileData => {

					if (profileData.hasAccess) {
						return new Promise(function (fnResolve) {

							this.doNavigate("commodities.Index", oBindingContext, fnResolve, "");
						}.bind(this)).catch(function (err) {
							if (err !== undefined) {
								MessageBox.error(err.message);
							}
						});
					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});
			},

			doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
				var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
				var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

				var sEntityNameSet;
				if (sPath !== null && sPath !== "") {
					if (sPath.substring(0, 1) === "/") {
						sPath = sPath.substring(1);
					}
					sEntityNameSet = sPath.split("(")[0];
				}
				var sNavigationPropertyName;
				var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

				if (sEntityNameSet !== null) {
					sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(
						sEntityNameSet,
						sRouteName);
				}
				if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
					if (sNavigationPropertyName === "") {
						this.oRouter.navTo(sRouteName, {
							context: sPath,
							masterContext: sMasterContext
						}, false);
					} else {
						oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
							if (bindingContext) {
								sPath = bindingContext.getPath();
								if (sPath.substring(0, 1) === "/") {
									sPath = sPath.substring(1);
								}
							} else {
								sPath = "undefined";
							}

							// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
							if (sPath === "undefined") {
								this.oRouter.navTo(sRouteName);
							} else {
								this.oRouter.navTo(sRouteName, {
									context: sPath,
									masterContext: sMasterContext
								}, false);
							}
						}.bind(this));
					}
				} else {
					this.oRouter.navTo(sRouteName);
				}

				if (typeof fnPromiseResolve === "function") {
					fnPromiseResolve();
				}

			},

			_formatDate: function (oValue) {
				var oDate = null;
				// can be of type Date if consumed with OData (XML format)
				if (oValue instanceof Date) {
					oDate = oValue;
				}
				// can be a string primitive in JSON, but we need a number
				else if ((typeof oValue) === "string") {
					// can be of type JSON Date if consumed with OData (JSON format)
					if (oValue.indexOf("/") === 0) {
						oValue = oValue.replace(new RegExp("/", 'g'), "");
						oValue = oValue.replace(new RegExp("\\(", 'g'), "");
						oValue = oValue.replace(new RegExp("\\)", 'g'), "");
						oValue = oValue.replace("Date", "");
						oValue = parseInt(oValue);
						oDate = new Date(oValue);
					} else {
						// backward compatibility, old type was long, new type is date
						// check if not a number
						var result = isNaN(Number(oValue));
						if (result) {
							// FF and Ie cannot create Dates using 'DD-MM-YYYY HH:MM:SS.ss' format but
							// 'DD-MM-YYYYTHH:MM:SS.ss'
							oValue = oValue.replace(" ", "T");
							// this is a date type
							oDate = new Date(oValue);
						} else {
							// this is a long type
							oValue = parseInt(oValue);
							// ensure that UNIX timestamps are converted to milliseconds
							oDate = new Date(oValue * 1000);
						}
					}
				} else {
					// ensure that UNIX timestamps are converted to milliseconds
					oDate = new Date(oValue * 1000);
				}
				return oDate;
			},
			onInit: function () {
				var lastUpdate = localStorage.getItem("lastUpdate");
				var lastUpdate;
				var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd/MM/yyyy HH:mm"
				});

				if (localStorage.getItem("lastUpdate")) {
					lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdate")));
				}

				this.getView().setModel(new sap.ui.model.json.JSONModel({
					keepBusy: true,
					pageLoad: true,
					isNotMobile: false,
					isMobile: false,
					isIE: false,
					lastUpdate: lastUpdate,
					showScheduler: false,
					showOfferMap: false,
					messageBusyIndicator: false,
					expandIndex: true,
					hasCount: false,
					hasPartnerVisitFormPending: 0
				}), "indexModel");

				this.getView().setModel(new sap.ui.model.json.JSONModel({
					ItemPhoto: [],
					logError: [],
					arrayPhotoToSave: [],
					hasOfflinePhotos: false
				}), "photoModel");

				var ua = window.navigator.userAgent;
				var msie = ua.indexOf("Trident/");

				if (msie > 0) {
					this.getView().getModel("indexModel").setProperty("/isIE", true);
				}

				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getTarget("Index").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
				var bIsMobile = window.fiori_client_appConfig;

				// if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				// 	this.setBusyDialog("App Grãos", "Atualizando Informações");
				// 	this.flushStore().then(function () {
				// 		this.refreshStore().then(function () {
				// 			this.closeBusyDialog();
				// 		}.bind(this));
				// 	}.bind(this));
				// }

				if (bIsMobile) {
					this.getView().getModel("indexModel").setProperty("/isMobile", true);
				} else {
					this.getView().getModel("indexModel").setProperty("/isNotMobile", true);

					var oForm = this.getView().byId("headerID");
					oForm.addStyleClass("extrato-compras");
					var oPanel = this.getView().byId("panelID");
					oPanel.addStyleClass("extrato-compras");
				}
				
				// setTimeout(function () {
				// 	this.userModel = new sap.ui.model.json.JSONModel("/services/userapi/currentUser");
				// 	this.sUser = userModel.oData.name;
				// }, 2000);
			},

			//Redirect to view Visit Form

			onVersionCheckPress: function () {
				if (sap.m.SinglePlanningCalendar) {
					console.log("sap.m.SinglePlanningCalendar")
				} else {
				console.log("sap.m.SinglePlanningCalendar error")
				}
			},
			onRefreshButton: function () {
				if (typeof sap.hybrid !== 'undefined') {
					sap.hybrid.refreshStore();
				}
			},

			navBack: function () {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("offerMap.Index", true);
			},

			navBackCommodities: function () {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("commodities.Index", true);
			},

			isSameDateAs: function (date1, date2) {
				return (
					date1.getFullYear() === date2.getFullYear() &&
					date1.getMonth() === date2.getMonth() &&
					date1.getDate() === date2.getDate()
				);
			},
			logoff: function () {
				$.ajax({
					type: "POST",
					url: window.fiori_client_appConfig.fioriURL + "/mobileservices/sessions/logout" //Clear SSO cookies: SAP Provided service to do that
				}).done(function (data) { //Now clear the authentication header stored in the browser
					console.log('logout sucesso', data);
				}).fail(function (error) {
					console.log('logout falha', error);
				});
			},

			showUserMessage: function () {
				if (!this.escapePreventDialog) {
					this.escapePreventDialog = new sap.m.Dialog({
						title: 'Aviso',
						state: 'Warning',
						content: [
							new sap.m.Text({
								text: "Conexão instável. Desligue os dados móveis (3G/4G) e Wi-Fi para entrar em modo offline, feche o Aplicativo e entre novamente.",
								textAlign: "Center"
							}).addStyleClass("sapUiSmallMargin")
						]
					});
				}
				this.count = 0;
				this.revertCount = 20;
				this.escapePreventDialog.open();
			},
			verifyTimeOutUser: function () {

				if (!this.isRefresh) {
					setTimeout(function () {
						if (this.hasUser && localStorage.getItem("appVersion") == window.fiori_client_appConfig.appVersion && !this.isRefresh) {
							this.closeBusyDialog();

						} else if (!this.isRefresh) {
							this.setBusyDialog("App Grãos", "Inicializando, por favor aguarde (" + this.revertCount + ")");
							this.count++;
							this.revertCount--;
							console.log("Countador está em: " + this.count + " e o usuario está:" + this.hasUser);
							if (this.count > 20 && !this.hasUser) {
								this.showUserMessage();
							} else {
								this.verifyTimeOutUser();
							}
						}

					}.bind(this), 1000);
				}
			},
			_onFreightCalculatorPress: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				this.getUserProfile("View_Profile_Calculate_Freight", this.userName).then(profileData => {

					if (profileData.hasAccess) {
						return new Promise(function (fnResolve) {

							this.doNavigate("freightCalculator.New", oBindingContext, fnResolve, "");
						}.bind(this)).catch(function (err) {
							if (err !== undefined) {
								MessageBox.error(err.message);
							}
						});
					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}

				}).catch(error => {
					console.log(error);

				});

			},

			_onOfferMapPress: function (oEvent) {
				var oBindingContext = oEvent.getSource().getBindingContext();

				this.getUserProfile("View_Profile_Offer_Map", this.userName).then(profileData => {

					if (profileData.hasAccess) {
						return new Promise(function (fnResolve) {

							this.doNavigate("offerMap.Index", oBindingContext, fnResolve, "");
						}.bind(this)).catch(function (err) {
							if (err !== undefined) {
								MessageBox.error(err.message);
							}
						});
					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}

				}).catch(error => {
					console.log(error);

				});
			},

			_onWarehouseMapPress: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				this.getUserProfile("View_Profile_Warehouse", this.userName).then(profileData => {
					if (profileData.hasAccess) {
						return new Promise(function (fnResolve) {
							this.doNavigate("warehouseMap.Index", oBindingContext, fnResolve, "");
						}.bind(this)).catch(function (err) {
							if (err !== undefined) {
								MessageBox.error(err.message);
							}
						});
					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});

			},
			_onCadencePress: function (oEvent) {
				var oBindingContext = oEvent.getSource().getBindingContext();

				this.getUserProfile("View_Profile_Cadence", this.userName).then(profileData => {
					if (profileData.hasAccess) {
						return new Promise(function (fnResolve) {
							this.doNavigate("cadence.Index", oBindingContext, fnResolve, "");
						}.bind(this)).catch(function (err) {
							if (err !== undefined) {
								MessageBox.error(err.message);
							}
						});
					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});
			},
			_onProspectPress: function (oEvent) {
				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {

					this.doNavigate("prospects.Index", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			},

			_onCropTrackingPress: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				this.getUserProfile("View_Profile_Crop", this.userName).then(profileData => {

					if (profileData.hasAccess) {
						return new Promise(function (fnResolve) {

							this.doNavigate("crop.Index", oBindingContext, fnResolve, "");
						}.bind(this)).catch(function (err) {
							if (err !== undefined) {
								MessageBox.error(err.message);
							}
						});
					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});

			},
			
			_onCropTurPress: function (oEvent) {
				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {
					this.doNavigate("cropTur.Index", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			},

			_onSelectVisitForm: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				this.getUserProfile("View_Profile_Visit", this.userName).then(profileData => {

					if (profileData.hasAccess) {
						return new Promise(function (fnResolve) {

							this.doNavigate("visitForm.Index", oBindingContext, fnResolve, "");
						}.bind(this)).catch(function (err) {
							if (err !== undefined) {
								MessageBox.error(err.message);
							}
						});
					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});

			},
			_onGenericTilePress1: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {

					this.doNavigate("schedule.Index", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});

			},

			_onProspectTilePress: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				this.getUserProfile("View_Profile_Prospects", this.userName).then(profileData => {

					if (profileData.hasAccess) {
						return new Promise(function (fnResolve) {

							this.doNavigate("prospects.Index", oBindingContext, fnResolve, "");
						}.bind(this)).catch(function (err) {
							if (err !== undefined) {
								MessageBox.error(err.message);
							}
						});
					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});

			},

			_onAppointmentsTilePress: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				this.getUserProfile("View_Profile_Appointments", this.userName).then(profileData => {

					if (profileData.hasAccess) {
						return new Promise(function (fnResolve) {
							this.doNavigate("schedule.Index", oBindingContext, fnResolve, "");
						}.bind(this)).catch(function (err) {
							if (err !== undefined) {
								MessageBox.error(err.message);
							}
						});
					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});
			},

			_onTilePress: function (oEvent) {
				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {

					if (oEvent.getSource().mProperties) {
						this.doNavigate(oEvent.getSource().mProperties.rote, oBindingContext, fnResolve, "");
					}

				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			},
			_onNegotiationReportPress: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				this.getUserProfile("View_Profile_Negotiation_Report", this.userName).then(profileData => {

					if (profileData.hasAccess) {
						return new Promise(function (fnResolve) {
							this.doNavigate("negotiationReport.Index", oBindingContext, fnResolve, "");
						}.bind(this)).catch(function (err) {
							if (err !== undefined) {
								MessageBox.error(err.message);
							}
						});
					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});

			},
			_onTablePricePress: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				this.getUserProfile("View_Profile_Table_Price", this.userName).then(profileData => {

					if (profileData.hasAccess) {
						return new Promise(function (fnResolve) {
							this.doNavigate("price.tablePrice.Filter", oBindingContext, fnResolve, "");
						}.bind(this)).catch(function (err) {
							if (err !== undefined) {
								MessageBox.error(err.message);
							}
						});
					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});

			},

			_onPriceIntentionPress: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				this.getUserProfile("View_Profile_Intention_Price", this.userName).then(profileData => {

					if (profileData.hasAccess) {
						return new Promise(function (fnResolve) {
							this.doNavigate("price.priceIntention.Index", oBindingContext, fnResolve, "");
						}.bind(this)).catch(function (err) {
							if (err !== undefined) {
								MessageBox.error(err.message);
							}
						});
					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});

			},

			_onComercializacaoPress: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				this.getUserProfile("View_Profile_Commercialization", this.userName).then(profileData => {

					if (profileData.hasAccess) {
						return new Promise(function (fnResolve) {
							this.doNavigate("commercialization.Index", oBindingContext, fnResolve, "");
						}.bind(this)).catch(function (err) {
							if (err !== undefined) {
								MessageBox.error(err.message);
							}
						});
					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});

			},
			getCommercialInidicators: function () {
				return new Promise(function (resolve, reject) {

					var oModel = this.getView().getModel();
					var aFilters = [];

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_CREATED_BY',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: this.userName
					}));

					aFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
						.BT,
						this.start_date.getTime(), this.end_date.getTime()));

					oModel.read("/Commodities_Order", {
						filters: aFilters,
						sorters: [new sap.ui.model.Sorter({
							path: "HCP_CREATED_AT",
							descending: true
						})],
						success: function (result) {
							var oCommodities = result.results;
							this.totalCommercCurrent = 0;

							if (oCommodities.length > 0) {
								for (var commodities of oCommodities) {
									if (commodities.HCP_PEDIDO_DEP) {
										this.totalCommercCurrent = this.totalCommercCurrent + parseFloat(commodities.HCP_MENGE_PED_DEP) / 1000;
									}
								}
							}

							oModel.read("/Commodities_Fixed_Order", {
								filters: aFilters,
								sorters: [new sap.ui.model.Sorter({
									path: "HCP_CREATED_AT",
									descending: true
								})],
								success: function (resultFixedOrder) {
									var oCommoditiesFixed = resultFixedOrder.results;
									this.totalCommercFixedCurrent = 0;

									if (oCommoditiesFixed.length > 0) {
										for (var commoditiesFixed of oCommoditiesFixed) {
											if (commoditiesFixed.HCP_ZSEQUE) {
												if (commoditiesFixed.HCP_MEINS == 'SC') {
													this.totalCommercFixedCurrent = this.totalCommercFixedCurrent + parseFloat(commoditiesFixed.HCP_MENGE) * 0.06;
												} else if (commoditiesFixed.HCP_MEINS == 'KG') {
													this.totalCommercFixedCurrent = this.totalCommercFixedCurrent + parseFloat(commoditiesFixed.HCP_MENGE) / 1000;
												} else {
													this.totalCommercFixedCurrent = this.totalCommercFixedCurrent + parseFloat(commoditiesFixed.HCP_MENGE);
												}
											}
										}
									}

									this.totalCurrentPurchaseVolume = this.totalCommercCurrent + this.totalCommercFixedCurrent;

									var aFiltersLastMonth = [];

									aFiltersLastMonth.push(new sap.ui.model.Filter({
										path: 'HCP_CREATED_BY',
										operator: sap.ui.model.FilterOperator.EQ,
										value1: this.userName
									}));

									aFiltersLastMonth.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
										.BT,
										this.start_dateLastMonth.getTime(), this.end_dateLastMonth.getTime()));

									oModel.read("/Commodities_Order", {
										filters: aFiltersLastMonth,
										sorters: [new sap.ui.model.Sorter({
											path: "HCP_CREATED_AT",
											descending: true
										})],
										success: function (resultLastMonth) {
											var oCommoditiesLastMonth = resultLastMonth.results;
											this.totalCommercLastMonth = 0;

											if (oCommoditiesLastMonth.length > 0) {
												for (var commoditiesLastMonth of oCommoditiesLastMonth) {
													if (commoditiesLastMonth.HCP_PEDIDO_DEP) {
														this.totalCommercLastMonth = this.totalCommercLastMonth + parseFloat(commoditiesLastMonth.HCP_MENGE_PED_DEP) /
															1000;
													}
												}
											}

											oModel.read("/Commodities_Fixed_Order", {
												filters: aFiltersLastMonth,
												sorters: [new sap.ui.model.Sorter({
													path: "HCP_CREATED_AT",
													descending: true
												})],
												success: function (resultFixedOrderLM) {
													var oCommoditiesFixedLM = resultFixedOrderLM.results;
													this.totalCommercFixedLastMonth = 0;

													if (oCommoditiesFixedLM.length > 0) {
														for (var commoditiesFixedLM of oCommoditiesFixedLM) {
															if (commoditiesFixedLM.HCP_ZSEQUE) {
																if (commoditiesFixedLM.HCP_MEINS == 'SC') {
																	this.totalCommercFixedLastMonth = this.totalCommercFixedLastMonth + parseFloat(commoditiesFixedLM.HCP_MENGE) *
																		0.06;

																} else if (commoditiesFixedLM.HCP_MEINS == 'KG') {
																	this.totalCommercFixedLastMonth = this.totalCommercFixedLastMonth + parseFloat(commoditiesFixedLM.HCP_MENGE) /
																		1000;
																} else {
																	this.totalCommercFixedLastMonth = this.totalCommercFixedLastMonth + parseFloat(commoditiesFixedLM.HCP_MENGE);
																}
															}
														}
													}

													this.totalLastMonthPurchaseVolume = this.totalCommercLastMonth + this.totalCommercFixedLastMonth;

													resolve();

												}.bind(this),
												error: function (err) {
													sap.m.MessageToast.show("Ocorreu um erro.");
													reject(err);
												}
											});

										}.bind(this),
										error: function (err) {
											sap.m.MessageToast.show("Ocorreu um erro.");
											reject(err);
										}
									});

								}.bind(this),
								error: function (err) {
									sap.m.MessageToast.show("Ocorreu um erro.");
									reject(err);
								}
							});

						}.bind(this),
						error: function (err) {
							sap.m.MessageToast.show("Ocorreu um erro.");
							reject(err);
						}
					});
				}.bind(this));
			},
			getAppointmentsIndicators: function () {
				return new Promise(function (resolve, reject) {

					var oModel = this.getView().getModel();
					var aFilters = [];

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_CREATED_BY',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: this.userName
					}));

					aFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
						.BT,
						this.start_date.getTime(), this.end_date.getTime()));

					oModel.read("/Appointments", {
						filters: aFilters,
						sorters: [new sap.ui.model.Sorter({
							path: "HCP_CREATED_AT",
							descending: true
						})],
						success: function (result) {
							var oAppointments = result.results;
							this.totalAppointment = 0;
							var aPromises = [];

							if (oAppointments.length > 0) {

								for (var item of oAppointments) {

									aPromises.push(new Promise(function (resolve1, rejec1t1) {
										this.getAppointmentsCheck(item).then(function (aAppointmentsCheck) {

											switch (aAppointmentsCheck.type) {
											case "Closed":
												this.totalAppointment = this.totalAppointment + 1;
												break;
											default:
											}

											resolve1();
										}.bind(this)).catch(function (error) {
											rejec1t1();
										}.bind(this));
									}.bind(this)));
								}
							} else {
								aPromises.push(new Promise(function (resolve1, rejec1t1) {
									this.totalAppointment = 0;
									resolve1();
								}.bind(this)));
							}

							var aFiltersLastMonth = [];

							aFiltersLastMonth.push(new sap.ui.model.Filter({
								path: 'HCP_CREATED_BY',
								operator: sap.ui.model.FilterOperator.EQ,
								value1: this.userName
							}));

							aFiltersLastMonth.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
								.BT,
								this.start_dateLastMonth.getTime(), this.end_dateLastMonth.getTime()));

							oModel.read("/Appointments", {
								filters: aFiltersLastMonth,
								sorters: [new sap.ui.model.Sorter({
									path: "HCP_CREATED_AT",
									descending: true
								})],
								success: function (resultLM) {
									var oAppointmentsLM = resultLM.results;
									this.totalAppointmentLM = 0;

									if (oAppointmentsLM.length > 0) {

										for (var item2 of oAppointmentsLM) {

											aPromises.push(new Promise(function (resolve1, rejec1t1) {
												this.getAppointmentsCheck(item2).then(function (aAppointmentsCheckLM) {

													switch (aAppointmentsCheckLM.type) {
													case "Closed":
														this.totalAppointmentLM = this.totalAppointmentLM + 1;
														break;
													default:
													}

													resolve1();
												}.bind(this)).catch(function (error) {
													rejec1t1();
												}.bind(this));
											}.bind(this)));
										}

									} else {
										aPromises.push(new Promise(function (resolve1, rejec1t1) {
											this.totalAppointmentLM = 0;
											resolve1();
										}.bind(this)));
									}

									Promise.all(aPromises).then(data => {
										resolve();
									}).catch(error => {
										reject();
									});

								}.bind(this),
								error: function (err) {
									sap.m.MessageToast.show("Ocorreu um erro.");
									reject(err);
								}
							});

						}.bind(this),
						error: function (err) {
							sap.m.MessageToast.show("Ocorreu um erro.");
							reject(err);
						}
					});
				}.bind(this));
			},
			getOfferMapIndicators: function () {
				return new Promise(function (resolve, reject) {

					var oModel = this.getView().getModel();
					var aFilters = [];

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_CREATED_BY',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: this.userName
					}));

					aFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
						.BT,
						this.start_date.getTime(), this.end_date.getTime()));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_STATES_OFFER',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '1'
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_STATES_OFFER',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '2'
					}));

					oModel.read("/Offer_Map", {
						filters: aFilters,
						sorters: [new sap.ui.model.Sorter({
							path: "HCP_CREATED_AT",
							descending: true
						})],
						success: function (result) {
							var oOffers = result.results;
							this.totalOffers = 0;
							this.totalVolume = 0;

							if (oOffers.length > 0) {
								this.totalOffers = oOffers.length;

								for (var offer of oOffers) {
									if (offer.HCP_VOLUME) {
										this.totalVolume = this.totalVolume + parseFloat(offer.HCP_VOLUME);
									}
								}
							}

							var aFiltersLastMonth = [];

							aFiltersLastMonth.push(new sap.ui.model.Filter({
								path: 'HCP_CREATED_BY',
								operator: sap.ui.model.FilterOperator.EQ,
								value1: this.userName
							}));

							aFiltersLastMonth.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
								.BT,
								this.start_dateLastMonth.getTime(), this.end_dateLastMonth.getTime()));

							aFiltersLastMonth.push(new sap.ui.model.Filter({
								path: 'HCP_STATES_OFFER',
								operator: sap.ui.model.FilterOperator.EQ,
								value1: '1'
							}));

							aFiltersLastMonth.push(new sap.ui.model.Filter({
								path: 'HCP_STATES_OFFER',
								operator: sap.ui.model.FilterOperator.EQ,
								value1: '2'
							}));

							oModel.read("/Offer_Map", {
								filters: aFiltersLastMonth,
								sorters: [new sap.ui.model.Sorter({
									path: "HCP_CREATED_AT",
									descending: true
								})],
								success: function (resultLM) {
									var oOffersLM = resultLM.results;
									this.totalOffersLM = 0;
									this.totalVolumeLM = 0;

									if (oOffersLM.length > 0) {
										this.totalOffersLM = oOffersLM.length;

										for (var offerLM of oOffersLM) {
											if (offerLM.HCP_VOLUME) {
												this.totalVolumeLM = this.totalVolumeLM + parseFloat(offerLM.HCP_VOLUME);
											}
										}
									}
									resolve();

								}.bind(this),
								error: function (err) {
									sap.m.MessageToast.show("Ocorreu um erro.");
									reject(err);
								}
							});

						}.bind(this),
						error: function (err) {
							sap.m.MessageToast.show("Ocorreu um erro.");
							reject(err);
						}
					});
				}.bind(this));
			},
			_listPicture: function () {

				this.setBusyDialog("Aguarde...", "Carregando imagens!");
				var oView = this.getView();
				var oModel = this.getView().getModel();
				var photoModel = oView.getModel("photoModel");

				this.getPictures("/").then(data => {
					if (data.length > 0) {
						photoModel.setProperty("/ItemPhoto", data);
						photoModel.setProperty("/hasOfflinePhotos", true);
					}
					this.closeBusyDialog();
				}).catch(error => {
					this.closeBusyDialog();
					console.log(error);
				});
			},

			_listPictureStorage: function () {

				// this.setBusyDialog("Aguarde...", "Carregando imagens!");

				return new Promise(function (resolve, reject) {
					var oView = this.getView();
					var oModel = this.getView().getModel();
					var photoModel = oView.getModel("photoModel");

					if (localStorage.getItem("fotosOff")) {
						photoModel.setProperty("/ItemPhoto", JSON.parse(localStorage.getItem("fotosOff")));
						photoModel.setProperty("/hasOfflinePhotos", true);
					}

					// this.closeBusyDialog();
					resolve();

				}.bind(this));
			},

			_base64ToImage: function (oEvent) {
				this.setBusyDialog("App Grãos", "Aguarde");
				this._createFormInput(this).then(function (retorno) {

					return new Promise(function (resolve, reject) {

						var aPromises = [];
						var oView = this.getView();
						var photoModel = oView.getModel("photoModel");
						var photos = photoModel.getProperty("/ItemPhoto");
						//Crio Lista de Imagens a ser adicionado no campo FILE
						this.arrayInput = [];
						for (var i = 0; i < photos.length; i++) {

							aPromises.push(new Promise(function (resolves, reject) {
								//Convertento Base64 para Blob
								var blob = this._dataURLtoBlob(photos[i].HCP_BASE_IMAGE);
								//Crio Um formData com o BLOB FILE CRIADO
								var fd = new FormData();
								fd.append("file", blob, photos[i].HCP_IMAGE_NAME);
								//Pego o arquivo crido para adicionar no Input File
								// let file = fd.fd.get("file") || fd.fd.get("file");
								let file = fd.get("file");
								//Armazenando o nome e caminho que a foto vai ser salva
								//	path: "/cmisrepository/root/" + photos[i].HCP_PATH_KEY,
								this.arrayInput.push({
									path: "/cmisrepository/root" + photos[i].HCP_PATH_KEY,
									arquivo: file,
									base: photos[i].HCP_BASE_IMAGE
								});
								resolves();

							}.bind(this)));
						}

						Promise.all(aPromises).then(function () {
							photoModel.setProperty("/itemFiles", this.arrayInput);
							photoModel.setProperty("/oController", this);
							photoModel.setProperty("/itemAtual", 0);

							// this._uploadImage(0, this.arrayInput.length);

							if (this.arrayInput.length > 0) {
								var oSplitKey = this.arrayInput[0].path.split("/");
								var sStageName = oSplitKey[5];
								var sKey = oSplitKey[4];

								this.verifyRepositoryExistance(sStageName, sKey).then(data => {
									this._uploadImage(0, this.arrayInput.length);
								}).catch(error => {
									this._uploadImage(0, this.arrayInput.length);
								});
							}
							resolve();
						}.bind(this));

					}.bind(this));

				}.bind(this));
			},
			_createFormInput: function (oController) {

				return new Promise(function (resolve, reject) {
					var dialog = this.busyDialog;
					this.fileUploadInput = new FileUploader({
						multiple: true,
						uploadComplete: function (oEvent) {
							var oPhotoModel = this.oParent.getModel("photoModel");
							var sResponse = oEvent.getParameter("response");
							var el = $(sResponse);
							var inner = el.html();
							var retorno = JSON.parse(inner).exception;
							var oModel = this.oParent.oPropagatedProperties.oModels;
							var itemAtual = oModel.photoModel.oData.itemAtual;
							var totalFoto = oModel.photoModel.oData.itemFiles.length - 1;
							var oItemPhoto = oPhotoModel.getProperty("/ItemPhoto")[itemAtual];

							if (sResponse) {

								if (retorno == 'nameConstraintViolation') {
									var dataItem = oModel.photoModel.getProperty("/logError");
									dataItem.push(oModel.photoModel.oData.itemFiles[itemAtual]);
									oPhotoModel.setProperty("/ItemPhoto/" + itemAtual + "/status", "error");
								} else {
									if (retorno === "objectNotFound") {
										oPhotoModel.setProperty("/ItemPhoto/" + itemAtual + "/status", "error");
									} else {
										oPhotoModel.setProperty("/ItemPhoto/" + itemAtual + "/status", "success");
									}
								}

								if (totalFoto > itemAtual) {
									itemAtual += 1;
									oModel.photoModel.oData.itemAtual = itemAtual;
									oModel.photoModel.refresh();

									var oSplitKey = oModel.photoModel.oData.oController.arrayInput[itemAtual].path.split("/");
									var sStageName = oSplitKey[5];
									var sKey = oSplitKey[4];

									setTimeout(function () {
										oModel.photoModel.oData.oController.updateCropPictureCounter(oItemPhoto).then(data => {
											oModel.photoModel.oData.oController.verifyRepositoryExistance(sStageName, sKey).then(data => {
												oModel.photoModel.oData.oController._uploadImage(itemAtual, oModel.photoModel.oData.itemFiles.length);
											}).catch(error => {
												oModel.photoModel.oData.oController._uploadImage(itemAtual, oModel.photoModel.oData.itemFiles.length);
											});
											//oModel.photoModel.oData.oController._uploadImage(itemAtual, oModel.photoModel.oData.itemFiles.length);
										}).catch(error => {
											console.log(error);
										});

									}.bind(this), 100);

								} else {
									if (oModel.photoModel.oData.logError.length > 0) {
										oModel.photoModel.oData.oController.displayMessageLogPhoto(oModel.photoModel.oData.logError);
									}
									//excluir dados da tabela
									oModel.photoModel.oData.oController.updateCropPictureCounter(oItemPhoto).then(data => {
										oModel.photoModel.oData.oController.deletePhotos(oModel.photoModel.oData.itemFiles);
									}).catch(error => {
										console.log(error);
									});
									// dialog.close();
									this.destroy();
								}
							}
						}
					});

					var oForm = this.getView().byId("newSimpleForm");
					oForm.addContent(this.fileUploadInput);

					setTimeout(function () {
						//dialog.close();	
						resolve(true);
					}.bind(this), 1000);
				}.bind(this));
			},

			_uploadImage: function (position, total) {
				var contador = parseInt(position) + parseInt(1);
				this.setBusyDialog("App Grãos", "Fazendo upload da imagem " + contador + " / " + total);

				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;
				var remoteSource = "";
				var bIsLocalTesting = window.location.hostname.indexOf("webidetesting") !== -1 ? true : false;
				var bIsPRDApp = window.fiori_client_appConfig.fioriURL.includes("fx3sa6u5mh");
				var bIsQASApp = window.fiori_client_appConfig.fioriURL.includes("ne6300ec0");

				if (bIsMobile) {
					// remoteSource = window.fiori_client_appConfig.fioriURL;
					if (bIsPRDApp === true && bIsQASApp === false) {
						remoteSource = 'https://mobile-fx3sa6u5mh.br1.hana.ondemand.com/com.sap.webide.xbcf82aaa0ff845a28591c4383178ca34_APP-GRAOS-REP';
					}else if(bIsPRDApp === false && bIsQASApp === true) {
						remoteSource = 'https://mobile-ne6300ec0.br1.hana.ondemand.com/com.sap.webide.x4f84602711c44edca003ae6b548633eb_APP-GRAOS-REP';
					}
				} else if (!bIsLocalTesting) {
					remoteSource = "/sap/fiori/appgraos";
				}

				let list = new DataTransfer();
				//Adiciono na lista de files
				list.items.add(this.arrayInput[position].arquivo);
				//Pego o DOMREF do Fileuploader para criar um "Envio File"
				var domRef = this.fileUploadInput.getFocusDomRef();
				//Digo para o input que a lista que eu criei é para o Input
				let myFileList = list.files;
				domRef.files = myFileList;

				this.fileUploadInput.removeAllParameters();
				var arrayInputURL = this.arrayInput[position].path.replace(/cmisrepository/g, "").slice(1);
				this.fileUploadInput.setUploadUrl(remoteSource + arrayInputURL);			
				

				//Parametros de Entrada necessários para o SAP entender o que vai junto com a foto
				this.fileUploadInput.addParameter(new sap.ui.unified.FileUploaderParameter({
					name: "cmisaction",
					value: "createDocument"
				}));
				this.fileUploadInput.addParameter(new sap.ui.unified.FileUploaderParameter({
					name: "propertyId[0]",
					value: "cmis:objectTypeId"
				}));
				this.fileUploadInput.addParameter(new sap.ui.unified.FileUploaderParameter({
					name: "propertyValue[0]",
					value: "cmis:document"
				}));
				this.fileUploadInput.addParameter(new sap.ui.unified.FileUploaderParameter({
					name: "propertyId[1]",
					value: "cmis:name"
				}));
				this.fileUploadInput.addParameter(new sap.ui.unified.FileUploaderParameter({
					name: "propertyValue[1]",
					value: this.arrayInput[position].arquivo.name
				}));

				setTimeout(function () {
					this.fileUploadInput.upload();
				}.bind(this), 100);

			},
			_dataURLtoBlob: function (dataurl) {
				var arr = dataurl.split(','),
					mime = arr[0].match(/:(.*?);/)[1],
					bstr = atob(arr[1]),
					n = bstr.length,
					u8arr = new Uint8Array(n);
				while (n--) {
					u8arr[n] = bstr.charCodeAt(n);
				}
				return new Blob([u8arr], {
					type: mime
				});
			},
			displayMessageLogPhoto: function (aResults) {

				var oDataItem = [];
				var aIcon;
				var oType;

				if (aResults.length > 0) {

					for (var i = 0; i < aResults.length; i++) {

						aIcon = "sap-icon://message-information";

						var aData = {
							HCP_MSGTYP: "",
							ICON: aResults[i].base,
							HCP_MESSAGE: " Imagem " + aResults[i].arquivo.name + " já existente no repositório"
						};

						oType = aResults[i].hcpType;
						oDataItem.push(aData);
					}

					if (!this._FragmentMessageLog) {
						this._FragmentMessageLog = sap.ui.xmlfragment("messageID" + this.getView().getId(),
							"com.sap.build.standard.brfAppDeGraosModoEditar.view.crop.fragments.LogMessage",
							this);

						this.getView().addDependent(this._FragmentMessageLog);

					}

					var oModelMessageLog = new sap.ui.model.json.JSONModel({
						type: oType,
						tableMessage: oDataItem
					});

					this.getView().setModel(oModelMessageLog, "messageLogFormModel");

					this._FragmentMessageLog.open();

				}

			},

			_onMsgLogPhotoPress: function (oEvent) {
				localStorage.removeItem("fotosOff");

				var oCancelModel = this.getView().getModel("messageLogFormModel");
				var photoModel = this.getView().getModel("photoModel");
				oCancelModel.setProperty("/tableMessage", []);
				oCancelModel.refresh();
				photoModel.setProperty("/logError", []);
				photoModel.refresh();
				oEvent.getSource().getParent().close();

			},
			enablePhoto: function (oEvent) {

				if (oEvent.getParameters().state) {
					localStorage.setItem("photoUpload", true);
				} else {
					localStorage.setItem("photoUpload", false);
				}
			},

			buildEntityPath: function (sEntityName, oEntity, oField) {
				if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
					var aUri = oEntity.__metadata.uri.split("/");
					return "/" + aUri[aUri.length - 1];
				} else {
					return "/" + sEntityName + "(" + oEntity[oField] + "l)";
				}
			},

			deletePhotos: function (arrayPhotos) {
				this.deletePicture({
					deleteAll: true,
					sKey: '/',
					sId: null
				}).then(data => {
					this.getView().getModel("photoModel").setData({
						ItemPhoto: [],
						logError: [],
						arrayPhotoToSave: [],
						hasOfflinePhotos: false
					});
					this.getView().getModel("photoModel").refresh();
					this.closeBusyDialog();
					sap.m.MessageToast.show("Upload Completo!");
				}).catch(error => {
					this.getView().getModel("photoModel").setData({
						ItemPhoto: [],
						logError: [],
						arrayPhotoToSave: [],
						hasOfflinePhotos: false
					});
					this.getView().getModel("photoModel").refresh();
					this.closeBusyDialog();
					sap.m.MessageToast.show("Upload Completo!");
				});
			},

			updateCropPictureCounter: function (oImage) {
				return new Promise((resolve, reject) => {
					var oModel = this.getView().getModel();
					var aFilters = [];

					if (oImage.status === "success") {

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_UNIQUE_KEY',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oImage.HCP_UNIQUE_KEY
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_PERIOD',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oImage.HCP_PERIOD
						}));

						oModel.read("/Crop_Tracking", {
							filters: aFilters,
							success: data => {
								if (data.results.length > 0) {
									var oCrop = data.results[0];
									var sEntity = this.buildEntityPath("Crop_Tracking", oCrop, "HCP_CROP_TRACK_ID");
									var sStageName = oImage.HCP_PATH_KEY.split("/")[3] + "_IMGCOUNT";
									var sNewCounterValue = oCrop["HCP_" + sStageName] + 1;

									oModel.update(sEntity, {
										["HCP_" + sStageName]: sNewCounterValue
									}, {
										success: data => {
											this.flushStore("Crop_Tracking").then(function () {
												this.refreshStore("Crop_Tracking").then(function () {
													resolve();
													oCrop["HCP_" + sStageName] = oCrop["HCP_" + sStageName] + 1;
												}.bind(this));
											}.bind(this));
										},
										error: error => {
											reject();
										}
									});
								} else {
									resolve();
								}
							},
							error: error => {
								reject(error);
							}
						});
					} else {
						resolve();
					}
				});
			},

			verifyRepositoryExistance: function (sStageName, sKey) {
				return new Promise(function (resolve, reject) {
					this.getFolder(sKey).then(function (response) {
						this.getFolder(sKey + "/" + sStageName).then(function () {
							resolve();
						}.bind(this)).catch(function (error) {
							if (error.responseJSON.exception === "objectNotFound") {
								this.createFolder(sStageName, sKey).then(function () {
									resolve();
								}.bind(this)).catch(function (error) {
									sap.m.MessageToast.show("falha ao criar pasta do estágio");
									reject();
								}.bind(this));
							}
						}.bind(this));
					}.bind(this)).catch(function (error) {
						if (error.responseJSON.exception === "objectNotFound") {
							this.createFolder(sKey, sKey).then(function () {
								this.createFolder(sStageName, sKey).then(function () {
									resolve();
								}.bind(this)).catch(function (error) {
									sap.m.MessageToast.show("falha ao criar pasta do estágio");
									reject();
								}.bind(this));
							}.bind(this)).catch(function (error) {
								sap.m.MessageToast.show("falha ao criar pasta do acompanhamento");
								reject();
							}.bind(this));
						} else {
							sap.m.MessageToast.show("falha ao buscar pasta do repositório");
							reject();
						}
					}.bind(this));
				}.bind(this));
			},

			createFolder: function (folderName, sKey) {
				var sURL = folderName === sKey ? '' : sKey;
				return new Promise(function (resolve, reject) {
					var data = {
						cmisaction: "createFolder",
						"propertyId[0]": "cmis:name",
						"propertyValue[0]": folderName,
						"propertyId[1]": "cmis:objectTypeId",
						"propertyValue[1]": "cmis:folder"
					};

					$.ajax("/cmisrepository/root/cropTracking/" + sURL, {
						type: "POST",
						data: data
					}).done(function (message) {
						resolve(message);
					}).fail(function (jqXHR) {
						reject(jqXHR);
					});
				}.bind(this));
			},

			getFolder: function (folderName) {
				return new Promise(function (resolve, reject) {
					var data = {
						cmisaction: "getFolderTree"
					};
					$.ajax("/cmisrepository/root/cropTracking/" + folderName, {
						type: "GET",
						data: data
					}).done(function (oData) {
						resolve(oData);
					}).fail(function (jqXHR) {
						reject(jqXHR);
					});
				}.bind(this));
			},
			getAppointmentsCheck: function (appointment) {

				return new Promise(function (resolve, reject) {

					var oModel = this.getView().getModel();
					var aFilters = [];
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_UNIQUE_KEY',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: appointment.HCP_UNIQUE_KEY
					}));

					oModel.read("/Appointments_Check", {
						filters: aFilters,
						success: function (resultApp) {
							var oAppointmentsCheck = resultApp.results;

							var result;

							if (appointment.HCP_CANCEL_REASON) {

								result = {
									type: "Canceled"
								};

								resolve(result);
							} else if (oAppointmentsCheck.length == 2) {

								result = {
									type: "Closed"
								};

								resolve(result);
							} else if (oAppointmentsCheck.length == 1 && oAppointmentsCheck[0].HCP_START_DATE) {

								result = {
									type: "Opened"
								};

								resolve(result);
							} else {

								result = {
									type: "Opened"
								};

								resolve(result);
							}

						}.bind(this),
						error: function (err) {
							sap.m.MessageToast.show("Falha ao Buscar Apontamentos.");
							reject(err);
						}
					});
				}.bind(this));
			},

			getPendingCommoditiesData: function () {
				return new Promise(function (resolve, reject) {
					var oDeviceModel = this.getOwnerComponent().getModel("device");
					var bIsMobile = oDeviceModel.getData().browser.mobile;

					if (bIsMobile) {

						var oModel = this.getView().getModel();
						var oDeviceModel = this.getOwnerComponent().getModel("device");
						var bIsMobile = oDeviceModel.getData().browser.mobile;
						this.countData = 0;

						var newDate = new Date();
						var firstDay = new Date(new Date().setMonth(-1));
						var lastDay = newDate;

						var aFilters = [];

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_CREATED_BY',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: this.userName
						}));

						aFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
							.BT,
							firstDay.getTime(), lastDay.getTime()));

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_STATUS',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: "1"
						}));

						this.aFilters = aFilters;
						this.oEntity = "Commodities_Fixed_Order";

						oModel.read("/Commodities_Fixed_Order", {
							filters: aFilters,
							sorters: [new sap.ui.model.Sorter({
								path: "HCP_CREATED_AT",
								descending: true
							})],
							success: function (result) {
								var oCommoditiesLength = result.results.length;

								if (oCommoditiesLength > 0) {
									this.getView().getModel("indexModel").setProperty("/hasPendingCommodities", true);
									this.getView().getModel("indexModel").setProperty("/countPendingCommodities", oCommoditiesLength);
								} else {
									this.getView().getModel("indexModel").setProperty("/hasPendingCommodities", false);
									this.getView().getModel("indexModel").setProperty("/countPendingCommodities", 0);
								}

								resolve();

							}.bind(this),
							error: function (err) {
								sap.m.MessageToast.show("Ocorreu um erro.");
								reject(err);
							}
						});

					} else {
						resolve();
					}

				}.bind(this));

			},

			getPendingDepositCommoditiesData: function () {
				return new Promise(function (resolve, reject) {
					var oDeviceModel = this.getOwnerComponent().getModel("device");
					var bIsMobile = oDeviceModel.getData().browser.mobile;

					if (bIsMobile) {

						var oModel = this.getView().getModel();
						var oDeviceModel = this.getOwnerComponent().getModel("device");
						var bIsMobile = oDeviceModel.getData().browser.mobile;
						this.countData = 0;

						var newDate = new Date();
						var firstDay = new Date(new Date().setMonth(-1));
						var lastDay = newDate;

						var aFilters = [];

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_CREATED_BY',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: this.userName
						}));

						aFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
							.BT,
							firstDay.getTime(), lastDay.getTime()));

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_STATUS',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: "1"
						}));

						this.aFiltersDeposit = aFilters;
						this.oEntityDeposit = "Commodities_Order";

						oModel.read("/Commodities_Order", {
							filters: aFilters,
							sorters: [new sap.ui.model.Sorter({
								path: "HCP_CREATED_AT",
								descending: true
							})],
							success: function (result) {
								var oCommoditiesLength = result.results.length;

								if (oCommoditiesLength > 0) {
									this.getView().getModel("indexModel").setProperty("/hasPendingDepositCommodities", true);
									this.getView().getModel("indexModel").setProperty("/countPendingDepositCommodities", oCommoditiesLength);
								} else {
									this.getView().getModel("indexModel").setProperty("/hasPendingDepositCommodities", false);
									this.getView().getModel("indexModel").setProperty("/countPendingDepositCommodities", 0);
								}
								resolve();

							}.bind(this),
							error: function (err) {
								sap.m.MessageToast.show("Ocorreu um erro.");
								reject(err);
							}
						});

					} else {
						resolve();
					}

				}.bind(this));

			},

			refreshOfferMapData: function () {

				this.getUserProfile("View_Profile_Offer_Map", this.userName).then(profileData => {

					if (profileData.hasAccess) {

						this.count = 0;
						this.revertCount = 120;
						this.timeOut = 120;
						this.hasFinished = false;
						var oDeviceModel = this.getOwnerComponent().getModel("device");
						var bIsMobile = oDeviceModel.getData().browser.mobile;

						if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

							var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
								pattern: "dd/MM/yyyy HH:mm"
							});

							var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
							var sMessage = "Tem certeza que deseja atualizar a base de ofertas? Verifique a qualidade da conexão.";

							MessageBox.information(
								sMessage, {
									actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
									styleClass: bCompact ? "sapUiSizeCompact" : "",
									onClose: function (sAction) {
										if (sAction === "YES") {

											this.verifyTimeOut();
											this.flushStore("Offer_Map,Offer_Map_Werks").then(function () {
												this.refreshStore("Offer_Map").then(function () {
													this.refreshStore("Offer_Map_Werks").then(function () {

														this.hasFinished = true;
														localStorage.setItem("lastUpdateOfferMap", new Date());
														localStorage.setItem("countStorageOfferMap", 0);

														this.getView().getModel("indexModel").setProperty("/countStorageOfferMap", 0);
														this.getView().getModel("indexModel").setProperty("/hasCountOfferMap", false);

													}.bind(this));
												}.bind(this));
											}.bind(this));

										}
									}.bind(this)
								}
							);

						} else {
							this.getView().getModel().refresh(true);
							this.hasFinished = true;
						}

					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});

			},

			verifyTimeOut: function (isFirstTime) {

				if (isFirstTime) {
					this.setBusyDialog("App Grãos", "Enviando dados, por favor aguarde");
					this.verifyTimeOut();
				} else {
					if (!this.hasFinished) {
						setTimeout(function () {
							this.setBusyDialog("App Grãos", "Enviando dados, por favor aguarde (" + this.revertCount +
								")");
							this.count++;
							this.revertCount--;
							//console.log("Countador está em: " + this.count);
							if (this.count > this.timeOut) {
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
				}

			},

			showMessage: function () {
				localStorage.setItem("isNeededToReload", true);
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("errorPages.timeOutConnection", true);
			},
			refreshCommoditiesData: function () {

				this.getUserProfile("View_Profile_Commodities", this.userName).then(profileData => {

					if (profileData.hasAccess) {

						this.count = 0;
						this.revertCount = 120;
						
						this.hasFinished = false;

						var oDeviceModel = this.getOwnerComponent().getModel("device");
						var bIsMobile = oDeviceModel.getData().browser.mobile;

						if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

							var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
								pattern: "dd/MM/yyyy HH:mm"
							});

							//	this.setBusyDialog(
							//		this.resourceBundle.getText("textGrainApp"), this.resourceBundle.getText("textWait"));

							var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
							var sMessage = "Tem certeza que deseja atualizar a base de compras? Verifique a qualidade da conexão.";

							MessageBox.information(
								sMessage, {
									actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
									styleClass: bCompact ? "sapUiSizeCompact" : "",
									onClose: function (sAction) {
										if (sAction === "YES") {
											//	this.timeOut = 60;
											//	this.revertCount = 60;
											//	this.verifyTimeOut();
											//	this.submitDatesPending().then(function () {

											this.count = 0;
											this.timeOut = 120;
											this.revertCount = 120;
											this.hasFinished = false;
											this.verifyTimeOut();

											this.flushStore("Commodities_Fixed_Order,Commodities_Log_Messages,Commodities_Order,Cadence").then(function () {
												this.refreshStore("Commodities_Fixed_Order").then(function () {
													this.refreshStore("Commodities_Log_Messages").then(function () {
														this.refreshStore("Commodities_Order").then(function () {
															this.refreshStore("Cadence").then(function () {
																this.refreshStore("Commodities_Check").then(function () {

																	this.hasFinished = true;
																	localStorage.setItem("lastUpdateCommodities", new Date());
																	localStorage.setItem("countStorageCommodities", 0);
																	this.getView().getModel().refresh(true);
																	this.getView().getModel("indexModel").setProperty("/countStorageCommodities", 0);
																	this.getView().getModel("indexModel").setProperty("/hasCountCommodities", false);

																	//this.closeBusyDialog();
																}.bind(this));
															}.bind(this));
														}.bind(this));
													}.bind(this));
												}.bind(this));
											}.bind(this));
											//	}.bind(this));

										}
									}.bind(this)
								}
							);

						} else {
							this.hasFinished = true;
							this.getView().getModel().refresh(true);
							//	this.getView().byId("pullToRefreshID").hide();
							//this.closeBusyDialog();
						}

					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});

			},
			submitDatesPending: function () {

				return new Promise(function (resolve, reject) {

					var oSucess;

					this.submitCommoditiesEcc(null, "1", true, false).then(function (oSucess) { //Fixo
						this.submitCommoditiesEcc(null, "2", true, false).then(function (oSucess) { //Depósito
							this.submitCommoditiesEcc(null, "3", true, false).then(function (oSucess) { //Transferência
								//this.closeBusyDialog();
								resolve();
							}.bind(this));
						}.bind(this));
					}.bind(this));

				}.bind(this));
			},

			goToPendingCommodities: function () {

				this.getUserProfile("View_Profile_Commodities", this.userName).then(profileData => {

					if (profileData.hasAccess) {

						var aKeyData = {
							filters: this.aFilters,
							entity: this.oEntity
						};

						this.oRouter.navTo("commodities.Consult", {
							keyData: JSON.stringify(aKeyData)
						}, false);

					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});

			},
			goToPendingDepositCommodities: function () {

				this.getUserProfile("View_Profile_Commodities", this.userName).then(profileData => {

					if (profileData.hasAccess) {

						var aKeyData = {
							filters: this.aFiltersDeposit,
							entity: this.oEntityDeposit
						};

						this.oRouter.navTo("commodities.Consult", {
							keyData: JSON.stringify(aKeyData)
						}, false);
					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});

			},
			_onDadosMestrePress: function (oEvent) {
				var oBindingContext = oEvent.getSource().getBindingContext();

				this.getUserProfile("View_Profile_Register", this.userName).then(profileData => {

					if (profileData.hasAccess) {
						return new Promise(function (fnResolve) {

							this.doNavigate("masterData.Index", oBindingContext, fnResolve, "");
						}.bind(this)).catch(function (err) {
							if (err !== undefined) {
								MessageBox.error(err.message);
							}
						});
					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});

			},
			_onSupplierExtractPress: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				this.getUserProfile("View_Profile_Extract", this.userName).then(profileData => {

					if (profileData.hasAccess) {
						return new Promise(function (fnResolve) {

							this.doNavigate("supplierExtract.Filter", oBindingContext, fnResolve, "");
						}.bind(this)).catch(function (err) {
							if (err !== undefined) {
								MessageBox.error(err.message);
							}
						});
					} else {
						MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
					}
				}).catch(error => {
					console.log(error);
				});

			},

		});
	},
	/* bExport= */
	true);