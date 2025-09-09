	sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
		"sap/m/MessageBox",
		"sap/ui/core/routing/History",
		"sap/ui/model/json/JSONModel",
		"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
	], function (MainController, MessageBox, History, JSONModel, formatter) {
		"use strict";

		return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.supplierExtract.offerMap.Index", {
			formatter: formatter,

			onInit: function () {

				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getRoute("supplierExtract.offerMap.Index").attachPatternMatched(this.handleRouteMatched, this);
				this.getView().setModel(new sap.ui.model.json.JSONModel({
					isMobile: false
				}), "indexModel");
				this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			},

			handleRouteMatched: function (oEvent) {
				this.getUser().then(function (userName) {
					this.userName = userName;
				}.bind(this));

				this.getView().setModel(new sap.ui.model.json.JSONModel({
					ItemIntention: [],
					ItemIntentionInactive: []
				}), "offerMap");

				var tableModel = this.getView().getModel("offerMap");
				tableModel.setProperty("/materialNumero", 0);
				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;

				if (bIsMobile) {
					this.getView().getModel("indexModel").setProperty("/isMobile", true);
				} else {
					this.getView().getModel("indexModel").setProperty("/isMobile", false);
				}

				var oIconTabBar = this.getView().byId("idIconTabBarMulti");
				oIconTabBar.setSelectedKey("Ativo");
				this.statusList = "1";

				if (oEvent.getParameter("arguments")) {
					this.filters = JSON.parse(decodeURIComponent(decodeURIComponent(oEvent.getParameter("arguments").filters)));

					var typeData = this.filters.typeData;
					this.supplierID = this.filters.supplierID;
					this.start_date = this.filters.start_date;
					this.end_date = this.filters.end_date;

					//	this.getOfferMaps();

					this.getOfferMaps().then(function () {

						this.closeBusyDialog();
						this.refreshData();
					}.bind(this));

				}

			},
			getOfferMaps: function (status) {

				return new Promise(function (resolve, reject) {

					var oDeviceModel = this.getOwnerComponent().getModel("device");
					var bIsMobile = oDeviceModel.getData().browser.mobile;
					this.setBusyDialog("Mapa de Ofertas", "Filtrando dados...");
					var oView = this.getView();

					var offerMap = oView.getModel("offerMap");

					var aResults = this.filters.TileCollection;
					var oDataItem = [];
					var aFiltersKey = [];
					var oArrayMatnr = [];
					var oArrayEkgrp = [];

					if (this.filters.TileCollection.length > 0) {
						for (var i = 0; i < aResults.length; i++) {

							aFiltersKey.push(new sap.ui.model.Filter({
								path: "HCP_UNIQUE_KEY",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: aResults[i].HCP_UNIQUE_KEY
							}));

							if (aResults[i].HCP_INCOTERM == "1") {
								var aIncoterm = this.resourceBundle.getText("textCIF");
							} else {
								aIncoterm = this.resourceBundle.getText("textFOB");
							}

							var aDataDelivery = new Date(aResults[i].HCP_DATE_START);
							var aYear = aDataDelivery.getFullYear();
							var aMonth = aDataDelivery.getUTCMonth() + 1;
							aDataDelivery = aMonth + "/" + aYear;

							var aButtonCanceloffer = false;

							if (aResults[i].HCP_STATES_OFFER === "3" || aResults[i].HCP_STATES_OFFER === "4") { //Cancelado/Finalizado
								var aButtonPurchaseOffer = false;
							} else {
								aButtonCanceloffer = true;
								if (aResults[i].HCP_PARTNER_TYPE == "1" && (aResults[i].HCP_MODALITY == "1" || aResults[i].HCP_MODALITY == "2")) {
									aButtonPurchaseOffer = true;
								}
							}

							var aData = {
								HCP_UNIQUE_KEY: aResults[i].HCP_UNIQUE_KEY,
								HCP_OFFER_ID: aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"] ? "Registro Offline" : aResults[i].HCP_OFFER_ID,
								HCP_MATNR: aResults[i].HCP_MATNR,
								MAKTX: "",
								DT_DELIVERY: aDataDelivery,
								HCP_EKGRP: aResults[i].HCP_EKGRP,
								EKNAM: "",
								HCP_INCOTERM: aIncoterm,
								HCP_STATUS: aResults[i].HCP_STATES_OFFER,
								cancelOffer: aButtonCanceloffer,
								purchaseOffer: aButtonPurchaseOffer,
								HCP_VOLUME: aResults[i].HCP_VOLUME,
								HCP_CREATED_AT: new Date(aResults[i].HCP_CREATED_AT),
								HCP_DATE_START: new Date(aResults[i].HCP_DATE_START),
								HCP_DATE_END: new Date(aResults[i].HCP_DATE_END),
								HCP_TPCEREAL: aResults[i].HCP_TPCEREAL,
								HCP_PARTNER: aResults[i].HCP_PARTNER,
								HCP_PARTNER_TYPE: aResults[i].HCP_PARTNER_TYPE,
								HCP_LOCAL: aResults[i].HCP_LOCAL,
								HCP_MODALITY: aResults[i].HCP_MODALITY
							};

							aData["TEXT_BUTTON_01"] = this.resourceBundle.getText("buttonCancelOffer");

							if (aResults[i].HCP_STATES_OFFER == "1") { //Em aberto
								aData["HCP_STATES_OFFER"] = this.resourceBundle.getText("textOpened");
							} else if (aResults[i].HCP_STATES_OFFER == "2") { //Comprado Parcialmente
								aData["HCP_STATES_OFFER"] = this.resourceBundle.getText("textPartiallyRequested");
								aData["TEXT_BUTTON_01"] = this.resourceBundle.getText("buttonFinish");
							} else if (aResults[i].HCP_STATES_OFFER == "3") { //Finalizado
								aData["HCP_STATES_OFFER"] = this.resourceBundle.getText("textFinished");
							} else if (aResults[i].HCP_STATES_OFFER == "4") { //Cancelado
								aData["HCP_STATES_OFFER"] = this.resourceBundle.getText("textCanceled");
							} else if (aResults[i].HCP_STATES_OFFER == "5") { //Erro
								aData["HCP_STATES_OFFER"] = this.resourceBundle.getText("textError");
								aData["TEXT_BUTTON_01"] = this.resourceBundle.getText("buttonFinish");
							}

							if (aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"]) {
								aData["@com.sap.vocabularies.Offline.v1.isLocal"] = true;
								aData["__metadata"] = aResults[i].__metadata;
							}

							if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

								aData["MAKTX"] = aResults[i].Offer_Material.MAKTX;
								aData["EKNAM"] = aResults[i].Offer_Account_Groups.EKNAM;

							} else {

								oArrayMatnr.push(aResults[i].HCP_MATNR);
								oArrayEkgrp.push(aResults[i].HCP_EKGRP);

							}

							oDataItem.push(aData);

						}

						this.getExpandOffDynamic(oArrayMatnr, oDataItem, "View_Material", "HCP_MATNR", "MATNR", "MAKTX").then(function () {
							this.getExpandOffDynamic(oArrayEkgrp, oDataItem, "View_Account_Groups", "HCP_EKGRP", "EKGRP", "EKNAM").then(function () {

								var filteredStatus1 = oDataItem.filter(function (item) {
									return item.HCP_STATUS == '1'; //Em aberto
								});

								var filteredStatus2 = oDataItem.filter(function (item) {
									return item.HCP_STATUS == '2'; //Comprado Parcialmente
								});
								offerMap.setProperty("/ItemOffeMap", filteredStatus1);
								offerMap.setProperty("/ItemOffeMapState2", filteredStatus2);
								offerMap.setProperty("/count", filteredStatus1.length);
								offerMap.setProperty("/count2", filteredStatus2.length);

								//	this._getWerksOfferMap(aFiltersKey).then(function () {
								resolve();
								//	}.bind(this));

							}.bind(this));
						}.bind(this));
					}

				}.bind(this));

			},

			_getWerksOfferMap: function (aFiltersKey) {

				return new Promise(function (resolve, reject) {

					var oModelOffer = this.getOwnerComponent().getModel();
					var oModel = this.getView().getModel("offerMap");
					var oData = oModel.oData;
					var oWerksFilter = [];

					//Centro de Destino
					if (oData.werks) {

						oWerksFilter.push(new sap.ui.model.Filter({
							path: 'HCP_WERKS',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.werks
						}));

					}

					oModelOffer.read("/Offer_Map_Werks", {

						filters: oWerksFilter,
						success: function (results) {
							var aResultsCenter = results.results;
							var aValidKeys = [];

							for (var keys of aFiltersKey) {
								var oIsThere = aResultsCenter.filter(result => result.HCP_UNIQUE_KEY === keys.oValue1);

								if (oIsThere.length > 0) {
									for (var corresponding of oIsThere) {
										aValidKeys.push(corresponding);
									}

								}
							}

							var aItemOffer = oModel.oData.ItemOffeMap;

							var oDataItem = aValidKeys.map(function (aCenter) {
								return Object.assign(aCenter, aItemOffer.reduce(function (acc, aOffer) {
									if (aOffer.HCP_UNIQUE_KEY == aCenter.HCP_UNIQUE_KEY) {
										return aOffer;
									} else {
										return acc;
									}
								}));
							});

							oModel.setProperty("/ItemOffeMap", oDataItem);
							resolve();

						}.bind(this),
						error: function (error) {
							reject(error);
						}
					});

				}.bind(this));
			},
			handleIconTabBarSelect: function (oEvent) {
				var sKey = oEvent.getParameter("key");

				if (sKey == "Ativo") {
					this.statusList = "1";
					this.getIntention("1");
				} else {
					this.statusList = "0";
					this.getIntention("0");
				}

			},
			handleRadioButtonGroupsSelectedIndex: function () {
				var that = this;
				this.aRadioButtonGroupIds.forEach(function (sRadioButtonGroupId) {
					var oRadioButtonGroup = that.byId(sRadioButtonGroupId);
					var oButtonsBinding = oRadioButtonGroup ? oRadioButtonGroup.getBinding("buttons") : undefined;
					if (oButtonsBinding) {
						var oSelectedIndexBinding = oRadioButtonGroup.getBinding("selectedIndex");
						var iSelectedIndex = oRadioButtonGroup.getSelectedIndex();
						oButtonsBinding.attachEventOnce("change", function () {
							if (oSelectedIndexBinding) {
								oSelectedIndexBinding.refresh(true);
							} else {
								oRadioButtonGroup.setSelectedIndex(iSelectedIndex);
							}
						});
					}
				});

			},
			_onPageNavButtonPress: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {

					this.doNavigate("Index", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});

			},
			navBack: function () {
				var oHistory = History.getInstance();
				var sPreviousHash = oHistory.getPreviousHash();

				if (sPreviousHash !== undefined) {
					window.history.go(-1);
				} else {
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.navTo("supplierExtract.Filter", true);
				}
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
					sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
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
			convertTextToIndexFormatter: function (sTextValue) {
				var oRadioButtonGroup = this.byId(
					"sap_Responsive_Page_0-mem6err5w501nofalvq871fc4_S4-content-build_simple_form_Form-1539702593366-formContainers-build_simple_form_FormContainer-1-formElements-build_simple_form_FormElement-1539702908392-fields-sap_m_RadioButtonGroup-1539703677050-hcjk5pn9tfli3robr87mmgw279_S79"
				);
				var oButtonsBindingInfo = oRadioButtonGroup.getBindingInfo("buttons");
				if (oButtonsBindingInfo && oButtonsBindingInfo.binding) {
					// look up index in bound context
					var sTextBindingPath = oButtonsBindingInfo.template.getBindingPath("text");
					return oButtonsBindingInfo.binding.getContexts(oButtonsBindingInfo.startIndex, oButtonsBindingInfo.length).findIndex(function (
						oButtonContext) {
						return oButtonContext.getProperty(sTextBindingPath) === sTextValue;
					});
				} else {
					// look up index in static items
					return oRadioButtonGroup.getButtons().findIndex(function (oButton) {
						return oButton.getText() === sTextValue;
					});
				}

			},
			formatDateUTCtoLocale: function (dDate) {
				if (dDate) {
					return new Date(dDate.getUTCFullYear(), dDate.getUTCMonth(), dDate.getUTCDate());
				}
				return dDate;

			},
			_onRowPress: function (oEvent) {

				var oItem = oEvent.getSource();
				var sPath = oItem.oBindingContexts.offerMap.sPath;
				var sPlit = oItem.oBindingContexts.offerMap.sPath.split("/");
				var sIndex = sPlit[2];
				var oData = oItem.oBindingContexts.offerMap.oModel.oData.ItemOffeMap[sIndex];

				sPath = this.buildEntityPath("Offer_Map", oData);

				this.oRouter.navTo("supplierExtract.offerMap.Edit", {
					keyData: encodeURIComponent(sPath),
					option: encodeURIComponent("OfferMap"),
					operation: "View"
				});
			},
			_onRowPress2: function (oEvent) {

				var oItem = oEvent.getSource();
				var sPath = oItem.oBindingContexts.offerMap.sPath;
				var sPlit = oItem.oBindingContexts.offerMap.sPath.split("/");
				var sIndex = sPlit[2];
				var oData = oItem.oBindingContexts.offerMap.oModel.oData.ItemOffeMapState2[sIndex];

				sPath = this.buildEntityPath("Offer_Map", oData);

				this.oRouter.navTo("supplierExtract.offerMap.Edit", {
					keyData: encodeURIComponent(sPath),
					option: encodeURIComponent("OfferMap"),
					operation: "View"
				});
			},
			_onEditIntentionFormPress: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {
					this.doNavigate("price.offerMap.Edit", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});

			},
			_createMonthText: function (month) {

				if (month === 1) {
					return this.resourceBundle.getText("january");
				} else if (month === 2) {
					return this.resourceBundle.getText("february");
				} else if (month === 3) {
					return this.resourceBundle.getText("march");
				} else if (month === 4) {
					return this.resourceBundle.getText("april");
				} else if (month === 5) {
					return this.resourceBundle.getText("may");
				} else if (month === 6) {
					return this.resourceBundle.getText("june");
				} else if (month === 7) {
					return this.resourceBundle.getText("july");
				} else if (month === 8) {
					return this.resourceBundle.getText("august");
				} else if (month === 9) {
					return this.resourceBundle.getText("september");
				} else if (month === 10) {
					return this.resourceBundle.getText("october");
				} else if (month === 11) {
					return this.resourceBundle.getText("november");
				} else {
					return this.resourceBundle.getText("december");
				}
			},
			buildEntityPath: function (sEntityName, oEntity) {

				if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
					var aUri = oEntity.__metadata.uri.split("/");
					return "/" + aUri[aUri.length - 1];
				} else {
					return "/" + sEntityName + "(" + oEntity.HCP_OFFER_ID + "l)";
				}
			},
			onRefreshButton: function () {
				if (typeof sap.hybrid !== 'undefined') {
					sap.hybrid.refreshStore();
				}
			},

			onFlushButton: function () {
				if (typeof sap.hybrid !== 'undefined') {
					sap.hybrid.flushStore();
				}
			},

			refreshStore: function (entity1, entity2, entity3, entity4) {
				return new Promise(function (resolve, reject) {
					if (typeof sap.hybrid !== 'undefined') {
						this.setBusyDialog("App Grãos", "Atualizando banco de dados");
						sap.hybrid.refreshStore(entity1, entity2, entity3, entity4).then(function () {
							resolve();
						}.bind(this));
					} else {
						resolve();
					}
				}.bind(this));
			},

			flushStore: function () {
				return new Promise(function (resolve, reject) {
					if (typeof sap.hybrid !== 'undefined') {
						sap.hybrid.flushStore().then(function () {
							resolve();
						});
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
			_onButtonPress1: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {

					this.doNavigate("price.offerMap.New", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});

			},

			refreshData: function () {

				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;

				var aRefreshView = ["Price_Intention"];

				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
					this.setBusyDialog(
						this.resourceBundle.getText("textGrainApp"), this.resourceBundle.getText("textWait"));
					this.flushStore().then(function () {
						this.refreshStore(aRefreshView).then(function () {
							this.getView().getModel().refresh(true);
						//	this.getView().byId("pullToRefreshID").hide();
							this.closeBusyDialog();
						}.bind(this));
					}.bind(this));
				} else {
					this.getView().getModel().refresh(true);
					//	this.getView().byId("pullToRefreshID").hide();
					this.closeBusyDialog();
				}

			},
			onUpdateFinished: function (status) {

				this.setBusyDialog(this.resourceBundle.getText("textGrainApp"), this.resourceBundle.getText("textWait"));

				return new Promise(function (resolve, reject) {

					var oView = this.getView();
					var oModel = this.getView().getModel();
					var offerMap = this.getView().getModel("offerMap");
					var oTableActive;

					if (status == "1") {
						oTableActive = oView.byId("listIntention");
					} else {
						oTableActive = oView.byId("listIntentionInactive");
					}

					var items = oTableActive.getBinding("items");
					var oList = items.oList;

					var aPromises = [];

					for (var i = 0; i < oList.length; i++) {

						var aFilters = [];
						var aFiltersSupplier = [];

						if (oList[i]["@com.sap.vocabularies.Offline.v1.isLocal"]) {

							aPromises.push(new Promise(function (resolveMaterial, reject) {

								var index = i;

								aFilters.push(new sap.ui.model.Filter({
									path: "TPCEREAL",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: oList[i].HCP_TPCEREAL
								}));

								oModel.read("/View_Material_Type_Price", {
									filters: aFilters,
									success: function (result) {

										var aResults = result.results;

										if (aResults.length > 0) {
											offerMap.setProperty("/ItemIntention/" + index + "/View_Intention_Material_Type", aResults[0]);
											offerMap.setProperty("/ItemIntention/" + index + "/HCP_PRICE_INTENTION_ID", "Registro Offline");
											offerMap.refresh();

										}

										resolveMaterial();

									}.bind(this),
									error: function () {
										console.log("error");
									}
								});

							}.bind(this)));

							if (oList[i].HCP_LOCAL != null) {

								aPromises.push(new Promise(function (resolves, reject) {

									var index = i;

									aFiltersSupplier.push(new sap.ui.model.Filter({
										path: "LIFNR",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: oList[i].HCP_LOCAL
									}));
									oModel.read("/View_Suppliers", {
										filters: aFiltersSupplier,
										success: function (result) {

											var aResultsSup = result.results;

											if (aResultsSup.length > 0) {
												offerMap.setProperty("/ItemIntention/" + index + "/View_Intention_Suppliers", aResultsSup[0]);
												offerMap.refresh();
											}
											resolves();

											this.closeBusyDialog();

										}.bind(this),
										error: function () {
											console.log("error");
										}
									});

								}.bind(this)));
							}

						}
					}

					Promise.all(aPromises).then(function () {
						resolve();
					}.bind(this));

				}.bind(this));

			},

			changeDate: function (oEvent) {
				var date = oEvent.getSource();

				//	data.getData()
			}

		});
	}, /* bExport= */ true);