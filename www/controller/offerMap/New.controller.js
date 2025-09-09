sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/List',
	'sap/m/StandardListItem',
	"sap/ui/core/routing/History",
	'com/sap/build/standard/brfAppDeGraosModoEditar/controls/CustomComboBox'
], function (MainController, MessageBox, JSONModel, Button, Dialog, List, StandardListItem, History, CustomComboBox) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.offerMap.New", {

		onInit: function () {

			var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
			var sLocale = sCurrentLocale.split("-");
			var oLocale = new sap.ui.core.Locale(sLocale[0], sLocale[1]);
			this.oNumberFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance(oLocale);

			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("offerMap.New").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableConfirm: false,
				yesCommodities: false,
				errorMaterial: false,
				errorFreight: false,
				checkTpCompra: false,
				checkMat: false,
				checkActive: false,
				checkPreco: false,
				checkCereal: false,
				yesProspect: false,
				yesPartner: true,
				yesLifnr: true,
				partnerProspect: this.resourceBundle.getText("textVendor"),
				yesDeposit: false,
				yesFob: false,
				yesCif: true,
				yesOthersDep: false,
				yesCalculator: false,
				noCalculator: false,
				yesBlandItem: false,
				yesBlandView: false,
				enabledBland: true,
				enabledLocal: false,
				yesLocalItem: true,
				yesTerceiro: false,
				yesRequiredLocal: false,
				edit: false,
				yesPrice: true,
				localeId: this.oNumberFormat.oLocale.sLocaleId,
				HCP_CREATE_OFFER: "2",
				HCP_WAREHOUSE: "1",
				HCP_PARTNER_TYPE: "1",
				HCP_MODALITY: "1",
				HCP_INCOTERM: "1",
				HCP_MOEDA: "BRL",
				HCP_UM: "SC",
				inputCenter: [],
				ItemStates: [],
				ItemLocal: [],
				tablePriceWerks: [],
				enableCreatePurchaseOrgValid: true
			}), "offerMapFormModel");

			//var oModelOwner = this.getOwnerComponent().getModel();
			//oModelOwner.refresh(true);

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				create: true,
				edit: true
			}), "profileModel");
		},

		handleRouteMatched: function (oEvent) {

			this.count = 0;
			this.revertCount = 120;
			this.hasFinished = false;
			this.hasFreight = false;
			this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText("messageLoadingPleaseWait"));
			this.clearContainers("newCenterSimpleForm").then(function () {}.bind(this));

			this.getView().getModel("offerMapFormModel").setData({
				enableConfirm: false,
				yesCommodities: false,
				errorMaterial: false,
				errorFreight: false,
				checkTpCompra: false,
				checkMat: false,
				checkActive: false,
				checkPreco: false,
				checkCereal: false,
				yesProspect: false,
				yesPartner: true,
				yesLifnr: true,
				partnerProspect: this.resourceBundle.getText("textVendor"),
				yesDeposit: false,
				yesFob: false,
				yesCif: true,
				yesOthersDep: false,
				yesCalculator: false,
				noCalculator: false,
				yesBlandItem: false,
				yesBlandView: false,
				enabledBland: true,
				enabledLocal: false,
				yesLocalItem: true,
				yesTerceiro: false,
				yesRequiredLocal: false,
				edit: false,
				localeId: this.oNumberFormat.oLocale.sLocaleId,
				HCP_CREATE_OFFER: "2",
				HCP_WAREHOUSE: "1",
				HCP_PARTNER_TYPE: "1",
				HCP_MODALITY: "1",
				HCP_INCOTERM: "1",
				HCP_MOEDA: "BRL",
				HCP_UM: "SC",
				HCP_CREATED_AT_OFFER: new Date(),
				inputCenter: [],
				ItemStates: [],
				ItemLocal: [],
				tablePriceWerks: [],
				enableCreatePurchaseOrgValid: true,
				yesPrice: true
			});

			this.getUser().then(function (userName) {
				this.userName = userName;
				this.getView().getModel("offerMapFormModel").setProperty("/HCP_CREATED_BY_OFFER", this.userName);

				this.checkUserInfo(this.userName).then(function (userArray) {
					this._getTvarvSap("P", "Z_Z586011_ATIVAR_REGRAS", null, 'checkActive').then(function () {

						this._getParameters().then(function () {

							this.getPriceKm();

							if (userArray) {
								this.getView().getModel("offerMapFormModel").setProperty("/HCP_EKGRP", userArray.EKGRP);
								this.getView().getModel("offerMapFormModel").setProperty("/HCP_EKORG", userArray.EKORG);

								this.werks_d = userArray.WERKS_D;

							}

							this.insertTemplateCenter().then(function () {
								//PROFILE
								this.getUserProfile("View_Profile_Offer_Map", this.userName).then(profileData => {
									this.getView().getModel("profileModel").setData(profileData);
									console.log(this.getView().getModel("profileModel").getData());
									this.closeBusyDialog();
								}).catch(error => {
									console.log(error);
									this.closeBusyDialog();
								});
							}.bind(this));

						}.bind(this));
					}.bind(this));

				}.bind(this));
			}.bind(this));

			if (oEvent.getParameter("data").partner) {
				this.getView().getModel("offerMapFormModel").oData["HCP_PARTNER"] = oEvent.getParameter("data").partner;
				this.getView().getModel("offerMapFormModel").oData["PROVIDER_DESC"] = decodeURIComponent(oEvent.getParameter("data").partnerName);
			}
		},

		_getParameters: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel("offerMapFormModel");
				var oModelOffer = this.getView().getModel();
				var aFilters = [];
				this.sFreightCalculator = "";

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_TYPE",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "Offer_Map"
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_PARAMETER",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "CALCULADORA_FRETE"
				}));

				oModelOffer.read("/Parameters", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;

						this.sFreightCalculator = aResults[0].HCP_VALUE;
						resolve();

					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));

		},

		clearContainers: function (oContainerId) {

			return new Promise(function (resolve, reject) {

				var oCharDataFormContent = this.getView().byId(oContainerId).getContent();
				var oCharContainers = oCharDataFormContent.filter(control => control.getMetadata().getName() === "sap.m.VBox");

				if (oCharContainers) {
					for (var container of oCharContainers) {
						container.destroy();
						resolve();
					}
				} else {
					resolve();
				}

			}.bind(this));

		},

		insertTemplateCenter: function () {

			return new Promise(function (resolve, reject) {

				var oMainDataForm = this.byId("newEntitySimpleForm").getContent();

				oMainDataForm[53].addContent(new sap.m.Label({
					text: ""
				}));

				this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText("textWait"));
				oMainDataForm[53].addContent(this.buildCenterTemplate());

				setTimeout(function () {
					this.closeBusyDialog();
					resolve();
				}.bind(this), 2000);

			}.bind(this));

		},

		_valideInputNumber: function (oProperty) {

			var oSource = oProperty.getSource();
			var sValue;

			sValue = oProperty.mParameters.newValue;
			sValue = sValue.replace(/[^0-9,]/g, "");

			if (sValue == "" || sValue == undefined || sValue == null)
				sValue = 0;

			oSource.setValue(sValue);

			this._validateForm();
		},

		_valideInputPrice: function (oProperty) {

			var oModel = this.getView().getModel("offerMapFormModel");
			var oData = oModel.oData;
			var oSource = oProperty.getSource();
			var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
			var oDataNewPrice = oModel.getProperty(sPath);
			// var sValue;

			this._valideInputNumber(oProperty);

			// sValue = oProperty.mParameters.newValue;
			// sValue = sValue.replace(/[^0-9,]/g, "");
			// this.oNumberFormat.format(sValue);

			var aField = oProperty.oSource.mProperties.name;
			// oDataNewPrice[aField] = parseFloat(sValue);
			// oSource.setValue(sValue);

			if (aField === "HCP_PRICE_FOB" && sPath === "/inputCenter/0") {
				// this.oPriceFob = parseFloat(sValue);
				this.oPriceFob = oData.inputCenter[0].HCP_PRICE_FOB;

				for (var i = 0; i < oData.inputCenter.length; i++) {

					oData.inputCenter[i].HCP_PRICE_FOB = this.oPriceFob;

					if (i != 0) {
						oData.inputCenter[i].enablePriceFob = true;
					}

					// this._calculatePriceFinal(oData.inputCenter[i]).then(function () {}.bind(this));
					this._calculatePriceFreight(oData.inputCenter[i]).then(function () {}.bind(this));
				}
			} else {
				this._calculatePriceFreight(oDataNewPrice).then(function () {
					this._validateForm();
				}.bind(this));
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

		_onInputQuotFreitFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("offerMapFormModel");
			var oSource = oEvent.getSource();
			var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
			var oDataNewQuotFreith = oModel.getProperty(sPath);
			var aInputCenter = oModel.oData.inputCenter;
			var hasQuotation = false;

			for (var item of aInputCenter) {
				if (item.HCP_QUOTATION_FREIGHT == '1') {
					hasQuotation = true;
				}
			}

			if (hasQuotation) {
				oModel.setProperty("/yesRequiredLocal", true);
			} else {
				oModel.setProperty("/yesRequiredLocal", false);
			}

			if (oSource.getSelectedKey() === "1" || oSource.getSelectedKey() === "3") {
				oDataNewQuotFreith.yesFreight = true;
				oDataNewQuotFreith.HCP_STATES_FREIGHT = this.resourceBundle.getText("textOpened");
			} else {
				oDataNewQuotFreith.yesFreight = false;
				oDataNewQuotFreith.HCP_STATES_FREIGHT = null;
			}

			this._validateForm();

		},

		_onInputProspect: function (oEvent) {

			var oModelOffer = this.getView().getModel();
			var oModel = this.getView().getModel("offerMapFormModel");
			var oInput = oEvent.getSource();
			var aFilters = [];
			var oDataItemLocal = oModel.getProperty("/ItemLocal");
			oDataItemLocal = [];
			var oProspect = oInput.getSelectedKey();

			if (oProspect != "") {

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_PROSP_ID",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oProspect
				}));

				oModelOffer.read("/Prospects", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;

						if (aResults.length > 0) {

							var sName = aResults[0].NAME1;
							if (aResults[0].NAME2) {
								sName = sName + aResults[0].NAME2;
							}

							if (aResults[0].STCD1) {
								var oStcdx = aResults[0].STCD1;
							} else {
								oStcdx = aResults[0].STCD2;
							}

							var aData = {
								LIFNR: aResults[0].HCP_PROSP_ID,
								NAME1: sName,
								REGIO: aResults[0].BLAND,
								STCDX: oStcdx,
								ORT01: aResults[0].ORT01
							};

							oDataItemLocal.push(aData);
							oModel.setProperty("/ItemLocal", oDataItemLocal);
							oModel.setProperty("/enabledLocal", false);
							oModel.setProperty("/HCP_LOCAL", aResults[0].HCP_PROSP_ID);
							oModel.setProperty("/enabledBland", false);

							if (aResults[0].LIFNR && aResults[0].errorMaterial == false) {
								oModel.setProperty("/yesCommodities", true);
								oModel.setProperty("/yesLifnr", true);
								oModel.setProperty("/LIFNR_PROSPECT", aResults[0].LIFNR);
							} else {
								oModel.setProperty("/yesCommodities", false);
								oModel.setProperty("/yesLifnr", false);
							}

							aFilters = [];

							aFilters.push(new sap.ui.model.Filter({
								path: "LAND1",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: aResults[0].LAND1
							}));

							aFilters.push(new sap.ui.model.Filter({
								path: "BLAND",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: aResults[0].BLAND
							}));

							this.getStatesOrigem(aFilters).then(function () {
								this._validateForm();
							}.bind(this));
						}

					}.bind(this),
					error: function (error) {}
				});

			}

			this._validateForm();

		},

		_onInputPartner: function (oSelectedPartner) {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getView().getModel();
				var oModel = this.getView().getModel("offerMapFormModel");
				var oData = oModel.oData;
				var aFilters = [];

				oModel.setProperty("/ItemStates", []);
				oModel.setProperty("/ItemLocal", []);

				if (oSelectedPartner.AGRUPADO === 0) { //Não Agrupado

					oModel.setProperty("/enabledBland", false);
					oModel.setProperty("/enabledLocal", false);

					aFilters.push(new sap.ui.model.Filter({
						path: "LIFNR",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oSelectedPartner.HCP_REGISTER
					}));

				} else { //Agrupado

					oModel.setProperty("/enabledBland", true);
					oModel.setProperty("/enabledLocal", true);

					if (oSelectedPartner.STCD1 != "") {

						if (oSelectedPartner.LAND1 !== "BR") {

							aFilters.push(new sap.ui.model.Filter({
								path: "STCD1",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oSelectedPartner.STCD1
							}));

						} else {
							var oStcd1 = oSelectedPartner.STCD1.substr(0, 8);

							aFilters.push(new sap.ui.model.Filter({
								path: "STCD1",
								operator: sap.ui.model.FilterOperator.Contains,
								value1: oStcd1
							}));

						}

					} else {

						aFilters.push(new sap.ui.model.Filter({
							path: "STCD2",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oSelectedPartner.STCD2
						}));

					}

				}

				oModelOffer.read("/View_Suppliers", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;
						var oDataItem = oModel.getProperty("/ItemLocal");
						aFilters = [];

						if (aResults.length > 0) {

							aFilters.push(new sap.ui.model.Filter({
								path: "LAND1",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oSelectedPartner.LAND1
							}));

							for (var i = 0; i < aResults.length; i++) {

								aFilters.push(new sap.ui.model.Filter({
									path: "BLAND",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: aResults[i].REGIO
								}));

								if (aResults[i].STCD1) {
									var oStcdx = aResults[i].STCD1;
								} else {
									oStcdx = aResults[i].STCD2;
								}

								var aData = {
									LIFNR: aResults[i].LIFNR,
									NAME1: aResults[i].NAME1,
									REGIO: aResults[i].REGIO,
									STCDX: oStcdx,
									ORT01: aResults[i].ORT01
								};

								oDataItem.push(aData);

							}

							oModel.setProperty("/ItemLocal", oDataItem);

							if (oSelectedPartner.AGRUPADO === 0) { //Não Agrupado

								oModel.setProperty("/HCP_LOCAL", aResults[0].LIFNR);

							}

							var aFiltersAux = aFilters.filter(function (m, n) {
								return aFilters.indexOf(m) == n;
							});

							this.getStatesOrigem(aFilters).then(function () {
								for (var i = 0; i < oData.inputCenter.length; i++) {
									this.searchKmPartner(oData.HCP_LOCAL, oData.inputCenter[i]).then(function () {
										resolve();
									}.bind(this));
								}

							}.bind(this));

						}

					}.bind(this),
					error: function (error) {
						reject();
						aFilters = [];
					}
				});

			}.bind(this));

		},

		getStatesOrigem: function (oFilters) {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getView().getModel();
				var oTableModel = this.getView().getModel("offerMapFormModel");
				var oData = oTableModel.oData;
				var oDataItem = oTableModel.getProperty("/ItemStates");

				this.oBland = "";

				oModelOffer.read("/View_States", {

					filters: oFilters,
					success: function (results) {

						var aResults = results.results;

						if (aResults.length === 1) {
							oTableModel.setProperty("/enabledBland", false);

							this.oBland = aResults[0].BLAND;

						}

						for (var i = 0; i < oData.inputCenter.length; i++) {
							oData.inputCenter[i].HCP_BLAND = this.oBland;
						}

						for (var i = 0; i < aResults.length; i++) {

							var aData = {
								BLAND: aResults[i].BLAND,
								BEZEI: aResults[i].BEZEI
							};

							oDataItem.push(aData);
						}

						oTableModel.setProperty("/ItemStates", oDataItem);
						this._validateForm();
						resolve();

					}.bind(this),
					error: function (error) {
						this._validateForm();
						resolve();
					}
				});

			}.bind(this));

		},

		_validateDistance: function (oEvent) {

			var oModel = this.getView().getModel("offerMapFormModel");
			var oSource = oEvent.getSource();
			var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
			var oDataNewDistance = oModel.getProperty(sPath);
			var oForm = this.getView().byId("newCenterSimpleForm");
			var oItems = oForm.getContent().filter(content => content.getMetadata().getName() === "sap.m.VBox");

			if (oEvent.oSource.mProperties.name == "HCP_DISTANCE" || oEvent.oSource.mProperties.name == "HCP_TRECHO_KM") {

				this._valideInputNumber(oEvent);

				if (oDataNewDistance.HCP_TRECHO_KM && oDataNewDistance.HCP_DISTANCE) {

					if (oDataNewDistance.HCP_TRECHO_KM > oDataNewDistance.HCP_DISTANCE) {
						var oSetValueState = "Error";
						var oSetValueStateText = this.resourceBundle.getText("errorUnpavedDistance");
					}

				}
			} else {

				oSetValueState = "None";
				oSetValueStateText = "";

			}

			if (oItems.length > 0) {

				var oSplit = sPath.split("/");
				var oLengthCenter = oModel.oData.inputCenter.length;
				var oLengthItems = oItems.length;
				var oIndex = oLengthCenter - oLengthItems;
				oIndex = oSplit[2] - oIndex;

				var oFieldCenter = oItems[oIndex].getItems()[0].getContent()[19];
				oFieldCenter.setValueState(oSetValueState);
				oFieldCenter.setValueStateText(oSetValueStateText);

				this._calculatePriceFreight(oDataNewDistance).then(function () {
					this._validateForm();
				}.bind(this));

			} else {
				this._validateForm();
			}

		},

		_calculatePriceFinal: function (oInputWerks) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel("offerMapFormModel");
				var oData = oModel.oData;
				var oPrice = oInputWerks.HCP_PRICE_FOB;
				var oPriceFreight = 0;

				if (oData.yesCalculator === true) {

					if (oInputWerks.HCP_LOGISTICS_FREIGHT) {
						oPriceFreight = oInputWerks.HCP_LOGISTICS_FREIGHT;
					} else {
						if (oInputWerks.HCP_PRICE_CALC_FREIGHT) {
							oPriceFreight = oInputWerks.HCP_PRICE_CALC_FREIGHT;
						}
					}

				} else {

					if (oInputWerks.HCP_LOGISTICS_FREIGHT) {
						oPriceFreight = oInputWerks.HCP_LOGISTICS_FREIGHT;
					} else {
						if (oInputWerks.HCP_PRICE_FREIGHT) {
							oPriceFreight = oInputWerks.HCP_PRICE_FREIGHT;
						}
					}

				}

				if (oPriceFreight) {

					if (oData.HCP_UM === 'SC') {
						oPrice = (oPriceFreight * 60) / 1000;
					} else {
						oPrice = oPriceFreight;
					}

					if (oInputWerks.HCP_PRICE_FOB) {
						oPrice = oPrice + oInputWerks.HCP_PRICE_FOB;
					}

				}

				if (oPrice) {
					oInputWerks.HCP_PRICE_FINAL = oPrice;
				}

				this._validateForm();
				resolve();

			}.bind(this));

		},

		_validatePriceWerksForCommodities: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel("offerMapFormModel");
				var oData = oModel.oData;
				var oErrorFreight = oData.errorFreight;
				var oYesCommodities = oData.yesCommodities;
				var oMessage = this.resourceBundle.getText("messageNotCommodities") + this.resourceBundle.getText("messageErroFreight");
				oModel.setProperty("/messageFreight", oMessage);

				if (oData.HCP_INCOTERM == "2" && oData.yesLifnr == true && oData.errorMaterial == false) { //FOB

					oErrorFreight = true;
					oYesCommodities = false;

					if (oData.yesCalculator == true) {

						var aArrayCenter = oData.inputCenter.filter(result => result.noPricesCalculator === false);
						aArrayCenter = aArrayCenter.filter(result => result.HCP_PRICE_CALC_FREIGHT > 0);
						if (aArrayCenter.length > 0) {
							oErrorFreight = false;
							oYesCommodities = true;
						} else {
							var aArrayCenter = oData.inputCenter.filter(result => result.HCP_QUOTATION_FREIGHT == "1");
							aArrayCenter = aArrayCenter.filter(result => result.HCP_LOGISTICS_FREIGHT > 0);
							if (aArrayCenter.length > 0) {
								oErrorFreight = false;
								oYesCommodities = true;
							}
						}

					} else {
						oErrorFreight = false;
						oYesCommodities = true;
					}

					oModel.setProperty("/errorFreight", oErrorFreight);
					oModel.setProperty("/yesCommodities", oYesCommodities);

					if (oYesCommodities == false) {
						oModel.setProperty("/HCP_CREATE_OFFER", "2"); //Não
					}

				}

				resolve();

			}.bind(this));

		},

		getPriceKm: function () {

			var oModelOffer = this.getView().getModel();
			var oModel = this.getView().getModel("offerMapFormModel");
			var oData = oModel.oData;
			var aFilters = [];

			// aFilters.push(new sap.ui.model.Filter({
			// 	path: "HCP_LAND1",
			// 	operator: sap.ui.model.FilterOperator.EQ,
			// 	value1: "BR"
			// }));

			// aFilters.push(new sap.ui.model.Filter({
			// 	path: "HCP_BLAND_ORIGEM",
			// 	operator: sap.ui.model.FilterOperator.EQ,
			// 	value1: ""
			// }));

			// aFilters.push(new sap.ui.model.Filter({
			// 	path: "HCP_BLAND_DESTINO",
			// 	operator: sap.ui.model.FilterOperator.EQ,
			// 	value1: ""
			// }));

			aFilters.push(new sap.ui.model.Filter({
				path: "REGIO_ORIGEM",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: "*"
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: "REGIO_DESTINO",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: "*"
			}));

			oModel.setProperty("/tarifaKm", 0);

			oModelOffer.read("/Price_Freight", {

				filters: aFilters,
				success: function (results) {

					var aResults = results.results;

					if (aResults.length > 0) {

						oModel.setProperty("/tarifaKm", aResults[0].TARIFA);

					}

				}.bind(this),
				error: function (error) {}
			});

		},

		onInputUmPrice: function () {

			var oModel = this.getView().getModel("offerMapFormModel");
			var oData = oModel.oData;

			for (var i = 0; i < oData.inputCenter.length; i++) {
				this._calculatePriceFreight(oData.inputCenter[i]).then(function () {
					this._validateForm();
				}.bind(this));
			}

		},

		_calculatePriceFreight: function (oInputCenter) {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getView().getModel();
				var oModel = this.getView().getModel("offerMapFormModel");
				var oData = oModel.oData;
				var aFilters = [];

				if (oData.HCP_INCOTERM === '2' && this.sFreightCalculator === "X") { //FOB

					oInputCenter.HCP_PRICE_CALC_FREIGHT = 0;
					oInputCenter.HCP_PRICE_FINAL = 0;
					oInputCenter.noPricesCalculator = false;

					if (oInputCenter.HCP_WERKS && oInputCenter.HCP_BLAND && oInputCenter.HCP_DISTANCE &&
						oData.HCP_UM && oData.HCP_DATE_START && oData.yesCalculator === true) {

						if (this.onSave == false) {
							this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText("messageLoadingPleaseWait"));
						}

						this.getStates(oInputCenter.HCP_WERKS).then(function (oRegioDest) {

							if (oRegioDest) {

								var oDistance = oInputCenter.HCP_DISTANCE;
								var oMonth = (oData.HCP_DATE_START.getMonth()) + 1;

								if (oMonth < 10) {
									oMonth = "0" + oMonth;
								} else {
									oMonth = oMonth.toString();
								}

								var oYear = oData.HCP_DATE_START.getFullYear();

								aFilters.push(new sap.ui.model.Filter({
									path: "REGIO_ORIGEM",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: oInputCenter.HCP_BLAND
								}));

								aFilters.push(new sap.ui.model.Filter({
									path: "REGIO_DESTINO",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: oRegioDest
								}));

								aFilters.push(new sap.ui.model.Filter({
									path: "MES",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: oMonth
								}));

								aFilters.push(new sap.ui.model.Filter({
									path: "ANO",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: oYear
								}));

								aFilters.push(new sap.ui.model.Filter({
									path: "KM_INICIAL",
									operator: sap.ui.model.FilterOperator.LE,
									value1: oDistance
								}));

								aFilters.push(new sap.ui.model.Filter({
									path: "KM_FINAL",
									operator: sap.ui.model.FilterOperator.GE,
									value1: oDistance
								}));

								oModelOffer.read("/Price_Freight", {

									filters: aFilters,
									success: function (results) {

										var aResults = results.results;

										if (aResults.length > 0) {

											if (oInputCenter.HCP_TRECHO_KM) {
												oDistance = oDistance - oInputCenter.HCP_TRECHO_KM;
												var oPriceDistance = aResults[0].TARIFA * oDistance;
												var oPriceKm = oData.tarifaKm * oInputCenter.HCP_TRECHO_KM;
												var oPrice = oPriceKm + oPriceDistance;
											} else {
												oPrice = aResults[0].TARIFA * oDistance;
											}

											oInputCenter.HCP_PRICE_CALC_FREIGHT = oPrice;

											if (oData.HCP_UM === 'SC') {
												oPrice = (oPrice * 60) / 1000;
											}

											if (oInputCenter.HCP_PRICE_FOB) {
												oPrice = oPrice + oInputCenter.HCP_PRICE_FOB;
											}

											oInputCenter.HCP_PRICE_FINAL = oPrice;

											oModel.refresh();
											this.closeBusyDialog();

											this._validatePriceWerksForCommodities().then(function () {
												resolve();
											}.bind(this));

										} else {
											oInputCenter.noPricesCalculator = true;
											this._calculatePriceFinal(oInputCenter).then(function () {
												this._validatePriceWerksForCommodities().then(function () {
													oModel.refresh();
													this.closeBusyDialog();
													resolve();
												}.bind(this));
											}.bind(this));
										}

									}.bind(this),
									error: function (error) {
										oInputCenter.noPricesCalculator = true;
										this.closeBusyDialog();
										resolve();

									}
								});
							}

						}.bind(this));

					} else {
						this._calculatePriceFinal(oInputCenter).then(function () {
							this._validatePriceWerksForCommodities().then(function () {
								oModel.refresh();
								this.closeBusyDialog();
								resolve();
							}.bind(this));
						}.bind(this));
					}

				} else {
					this._calculatePriceFinal(oInputCenter).then(function () {
						this._validatePriceWerksForCommodities().then(function () {
							oModel.refresh();
							this.closeBusyDialog();
							resolve();
						}.bind(this));
					}.bind(this));
				}

			}.bind(this));

		},

		_onGetPriceBrf: function () {

			var oModel = this.getView().getModel("offerMapFormModel");
			var oData = oModel.oData;

			if (oData.HCP_EKGRP && oData.HCP_MATNR && oData.HCP_TPCEREAL && oData.HCP_DATE_START) {
				for (var i = 0; i < oData.inputCenter.length; i++) {

					this.getPriceBrf(oData.inputCenter[i]).then(function () {}.bind(this));
				}
			} else {
				this._validatePriceWerksForCommodities().then(function () {
					this._validateForm();
				}.bind(this));

			}

		},

		_onPurchaseOrgChange: function (oEvent) {
			var oProfileModel = this.getView().getModel("profileModel");
			var oOfferMapModel = this.getView().getModel("offerMapFormModel");
			var oSource = oEvent.getSource();
			var oProfileData = oProfileModel.getData();
			var oInputValue = oSource.getSelectedKey();

			if (oInputValue) {
				if (oProfileData.ekorg.filter(ekorg => ekorg.EKORG == oInputValue || ekorg.VALOR == '*').length > 0 || oProfileData.fullAccess) {
					oOfferMapModel.setProperty("/enableCreatePurchaseOrgValid", true);
				} else {
					oOfferMapModel.setProperty("/enableCreatePurchaseOrgValid", false);
				}
			} else {
				oOfferMapModel.setProperty("/enableCreatePurchaseOrgValid", true);
			}

			this._validateForm();

		},

		_getTvarvSap: function (oType, oName, oLow, oProperty) {

			return new Promise(function (resolve, reject) {

				var oModelCommodities = this.getView().getModel();
				var oModel = this.getView().getModel("offerMapFormModel");
				var oData = oModel.oData;
				var aFilters = [];

				oData[oProperty] = false;

				aFilters.push(new sap.ui.model.Filter({
					path: "NAME",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oName
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "TYPE",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oType
				}));

				if (oType == "S") {
					aFilters.push(new sap.ui.model.Filter({
						path: "SIGN",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: "I"
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: "OPTI",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: "EQ"
					}));
				}

				if (oLow) {
					aFilters.push(new sap.ui.model.Filter({
						path: "LOW",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oLow
					}));
				}

				oModelCommodities.read("/Tvarvc", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;

						if (aResults.length > 0) {

							if (aResults[0].LOW) {
								oData[oProperty] = true;
							}

						}

						resolve();

					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));

		},

		_getGrainMaterial: function (oMaterial) {

			return new Promise(function (resolve, reject) {

				var oModelCommodities = this.getView().getModel();
				var oModel = this.getView().getModel("offerMapFormModel");
				var oData = oModel.oData;
				var aFilters = [];

				if (oData.checkActive == true) {

					if (oMaterial) {

						aFilters.push(new sap.ui.model.Filter({
							path: "MATNR",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oMaterial
						}));

						oModelCommodities.read("/Z041028", {

							filters: aFilters,
							success: function (results) {

								var aResults = results.results;

								if (aResults.length > 0) {
									oModel.setProperty("/checkMat", true);
								}

								resolve();

							}.bind(this),
							error: function (error) {
								resolve();
							}
						});

					} else {
						resolve();
					}

				} else {
					resolve();
				}

			}.bind(this));

		},

		_validateMaterial: function (oMaterial) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel("offerMapFormModel");
				var oData = oModel.oData;
				var oArrayCenter = [];

				oModel.setProperty("/messageMaterial", null);
				oModel.setProperty("/errorMaterial", false);

				if (oMaterial && oData.yesLifnr == true && oData.HCP_MODALITY == "1") {

					var oMatnr = oMaterial;
					oMaterial = parseFloat(oMaterial);

					this._getTvarvSap("S", "Z_Z586011_ATIVA_TP_COMPRA", oMaterial, 'checkTpCompra').then(function () {

						this._getGrainMaterial(oMatnr).then(function () {
							this._getTvarvSap("S", "Z_Z586011_ATIVA_PRECO", oMaterial, 'checkPreco').then(function () {
								this._getTvarvSap("S", "Z_Z586011_ATIVA_TP_CEREAL", oMaterial, 'checkCereal').then(function () {

									if (oData.checkActive === true && oData.checkPreco === true &&
										oData.checkCereal === true && oData.checkMat === true) {

										this._getPriceTypeMaterial().then(function (oSucess) {

											if (oSucess == true) {
												oModel.setProperty("/yesCommodities", true);
												this._validatePriceWerksForCommodities().then(function () {
													resolve();
												}.bind(this));

											} else {
												var oMatnr = parseFloat(oData.HCP_MATNR);
												var oMessage = this.resourceBundle.getText("messageNotCommodities") + " " + this.resourceBundle.getText(
													"messageMaterialPrice") + " " + oMatnr + " " + this.resourceBundle.getText(
													"messageNotRegistered");

												oModel.setProperty("/messageMaterial", oMessage);
												oModel.setProperty("/HCP_CREATE_OFFER", "2"); //Não
												oModel.setProperty("/errorMaterial", true);
												oModel.setProperty("/yesCommodities", false);
												resolve();
											}

										}.bind(this));

									} else {
										oModel.setProperty("/yesCommodities", true);
										this._validatePriceWerksForCommodities().then(function () {
											resolve();
										}.bind(this));
									}

								}.bind(this));
							}.bind(this));
						}.bind(this));

					}.bind(this));

				} else {
					this._validatePriceWerksForCommodities().then(function () {
						resolve();
					}.bind(this));
				}

			}.bind(this));

		},

		_getPriceTypeMaterial: function () {

			return new Promise(function (resolve, reject) {

				var oModelCommodities = this.getView().getModel();
				var oModel = this.getView().getModel("offerMapFormModel");
				var oData = oModel.oData;
				var aFilters = [];

				oModel.setProperty("/tablePriceWerks", []);

				if (oData.HCP_EKGRP && oData.HCP_MATNR && oData.HCP_TPCEREAL && oData.HCP_DATE_START) {

					//Captura do dia com padrão UTC não é valido var oDay = new Date().getUTCDate();
					var oDay = new Date().getDate();
					if (oDay < 10) {
						oDay = "0" + oDay;
					}

					var oMonth = new Date().getMonth() + 1;
					if (oMonth < 10) {
						oMonth = "0" + oMonth;
					} else {
						oMonth = oMonth.toString();
					}

					var oDatum = new Date().getFullYear() + oMonth + oDay;

					var oYear = oData.HCP_DATE_END.getFullYear();

					oMonth = (oData.HCP_DATE_START.getMonth()) + 1;
					if (oMonth < 10) {
						oMonth = "0" + oMonth;
					} else {
						oMonth = oMonth.toString();
					}

					var oVigencia = "VIGENCIA_" + oMonth;

					aFilters.push(new sap.ui.model.Filter({
						path: "EKGRP",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_EKGRP
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: "MATNR",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_MATNR
					}));

					for (var i = 0; i < oData.inputCenter.length; i++) {

						if (oData.inputCenter[i].status != "Deleted") {
							aFilters.push(new sap.ui.model.Filter({
								path: 'WERKS',
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oData.inputCenter[i].HCP_WERKS
							}));
						}

					}

					aFilters.push(new sap.ui.model.Filter({
						path: 'TPCEREAL',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_TPCEREAL
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: oVigencia,
						operator: sap.ui.model.FilterOperator.GE,
						value1: oDatum
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: "FND_YEAR",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oYear
					}));

					oModelCommodities.read("/Table_Price", {

						filters: aFilters,
						success: function (results) {

							var aResults = results.results;
							var aArrayCenter = [];

							if (aResults.length > 0) {

								for (var i = 0; i < aResults.length; i++) {

									var aDataCenter = {
										WERKS: aResults[i].WERKS,
										PRICE_NETWR: aResults[i].PRICE_NETWR
									};

									aArrayCenter.push(aDataCenter);
								}

								oModel.setProperty("/tablePriceWerks", aArrayCenter);
								resolve(true);

							} else {
								resolve(false);
							}

						}.bind(this),
						error: function (error) {
							resolve(false);
						}
					});

				} else {
					resolve(true);
				}

			}.bind(this));
		},

		_onInputArmazemFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("offerMapFormModel");
			var oInput = oEvent.getSource();
			var oData = oModel.oData;

			oModel.setProperty("/HCP_LOCAL", null);

			if (oInput.getSelectedKey() === "1" || oInput.getSelectedKey() === "3") { //Próprio
				oModel.setProperty("/yesTerceiro", false);
				oModel.setProperty("/yesLocalItem", true);
				oModel.setProperty("/yesBlandItem", true);
				oModel.setProperty("/yesBlandView", false);

				if (oModel.oData.ItemLocal.length === 1) {
					oModel.setProperty("/enabledLocal", false);
					oModel.setProperty("/HCP_LOCAL", oModel.oData.ItemLocal[0].LIFNR);
				} else {
					oModel.setProperty("/enabledLocal", true);
				}

				if (oModel.oData.ItemStates.length > 1) {
					oModel.setProperty("/enabledBland", true);
				} else {
					oModel.setProperty("/enabledBland", false);
				}

				for (var i = 0; i < oData.inputCenter.length; i++) {

					oData.inputCenter[i].yesDistance = true;
					oData.inputCenter[i].HCP_PRICE_CALC_FREIGHT = 0;
					oData.inputCenter[i].HCP_PRICE_FINAL = 0;
					oData.inputCenter[i].noPricesCalculator = false;

					if (oModel.oData.HCP_PARTNER_TYPE == "1") { //Fornecedor
						this.searchKmPartner(oData.HCP_LOCAL, oData.inputCenter[i]).then(function () {}.bind(this));
					} else {
						oData.inputCenter[i].HCP_DISTANCE = null;
						oData.inputCenter[i].yesTextDistance = true;
						oData.inputCenter[i].textDistance = this.resourceBundle.getText("errorDistanceNotFounded");
					}

				}

			} else { //Terceiro
				oModel.setProperty("/yesBlandItem", false);
				oModel.setProperty("/yesBlandView", true);
				oModel.setProperty("/yesTerceiro", true);
				oModel.setProperty("/yesLocalItem", false);
				oModel.setProperty("/enabledLocal", false);
				oModel.setProperty("/enabledBland", true);

				for (var i = 0; i < oData.inputCenter.length; i++) {
					oData.inputCenter[i].HCP_DISTANCE = null;
					oData.inputCenter[i].yesTextDistance = true;
					oData.inputCenter[i].textDistance = this.resourceBundle.getText("errorDistanceNotFounded");
					oData.inputCenter[i].yesDistance = false;
					oData.inputCenter[i].HCP_PRICE_CALC_FREIGHT = 0;
					oData.inputCenter[i].HCP_PRICE_FINAL = 0;
					oData.inputCenter[i].noPricesCalculator = false;

					this._calculatePriceFinal(oData.inputCenter[i]).then(function () {}.bind(this));
				}

			}

			if (this.sFreightCalculator == "") {
				oModel.setProperty("/yesBlandItem", false);
				oModel.setProperty("/yesBlandView", false);
			}

			this._validateForm();

		},

		_onInputPavedFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("offerMapFormModel");
			var oInput = oEvent.getSource();
			var sPath = oInput.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
			var oDataNewPaved = oModel.getProperty(sPath);

			if (oInput.getSelectedKey() === "1" || oInput.getSelectedKey() === "3") {

				if (this.sFreightCalculator === "X") {
					oDataNewPaved.yesPaved = true;
				} else {
					oDataNewPaved.yesPaved = false;
				}

			} else {

				oDataNewPaved.yesPaved = false;
				oDataNewPaved.HCP_TRECHO_KM = null;

			}

			this._validateDistance(oEvent);

		},

		_onInputDeliveryDateFormSelect: function (oProperty) {

			var oModel = this.getView().getModel("offerMapFormModel");
			var oData = oModel.oData;
			var oForm = this.getView().byId("newEntitySimpleForm");
			var oItems = oForm.getContent().filter(content => content.getMetadata().getName() === "sap.m.DatePicker");
			var oMonthStart;
			var oMonthEnd;
			var oDateStart;
			var oDateEnd;
			var sValueStateText;
			var sValueState;

			var oDateToday = new Date();
			oDateToday.setHours(10);

			if (oItems.length > 0) {

				for (var item of oItems) {

					item.setValueState("None");
					item.setValueStateText("");

					if (item.mProperties.value && (item.mProperties.name === "HCP_DATE_START" || item.mProperties.name === "HCP_DATE_END")) {
						var oSplit = item.mProperties.value.split('/');

						if (oSplit.length == 3) {
							var oInputDate = new Date(oSplit[2].substr(0, 4), oSplit[1] - 1, oSplit[0]);

							if (oInputDate == "Invalid Date") {
								item.setValueState("Error");
								item.setValueStateText(this.resourceBundle.getText("errorDateInvalid"));
							}
						} else {
							item.setValueState("Error");
							item.setValueStateText(this.resourceBundle.getText("errorDateInvalid"));
						}

					}

					if (item.mProperties.dateValue) {

						if (item.mProperties.name === "HCP_DATE_START") {
							oDateStart = new Date(item.mProperties.dateValue.setHours(12));
							oModel.setProperty("/HCP_DATE_START", oDateStart);

							if (oDateStart && oDateStart < oDateToday) {
								item.setValueState("Error");
								item.setValueStateText(this.resourceBundle.getText("errorDateCurrentDate"));
								oDateStart = null;
							}

						} else if (item.mProperties.name === "HCP_DATE_END") {
							oDateEnd = new Date(item.mProperties.dateValue.setHours(12));
							oModel.setProperty("/HCP_DATE_END", oDateEnd);

							if (oDateEnd && oDateEnd < oDateToday) {
								item.setValueState("Error");
								item.setValueStateText(this.resourceBundle.getText("errorDateCurrentDate"));
								oDateEnd = null;
							}

						}
					}

				}

				if (oDateStart && oDateEnd) {

					oMonthStart = oDateStart.getMonth();
					oMonthEnd = oDateEnd.getMonth();

					if (oMonthStart !== oMonthEnd) {
						sValueStateText = this.resourceBundle.getText("errorDateSameMonth");
						sValueState = "Error";
					} else if (oDateStart > oDateEnd) {
						sValueStateText = this.resourceBundle.getText("errorDateBigger");
						sValueState = "Error";
					}

					if (oItems.length > 0) {

						if (sValueState) {
							for (var item of oItems) {
								item.setValueState(sValueState);
								item.setValueStateText(sValueStateText);
							}

						} else {

							for (var i = 0; i < oData.inputCenter.length; i++) {
								this._calculatePriceFreight(oData.inputCenter[i]).then(function () {}.bind(this));
								this.getPriceBrf(oData.inputCenter[i]).then(function () {}.bind(this));
							}

						}

					}

				}
			}

			this._validateForm();

		},

		_onInputLocal: function (oEvent) {

			var oModelOffer = this.getView().getModel();
			var oModel = this.getView().getModel("offerMapFormModel");
			var oData = oModel.oData;
			var oInput = oEvent.getSource();
			var aFilters = [];
			var oLocal = oInput.getSelectedKey();

			if (oData.HCP_PARTNER_TYPE == '1' && oData.ItemLocal.length > 1 && oLocal != "") { //Fornecedor

				aFilters.push(new sap.ui.model.Filter({
					path: "LIFNR",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oLocal
				}));

				oModelOffer.read("/View_Suppliers", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;

						if (aResults.length > 0) {
							this.oBland = aResults[0].REGIO;

							for (var i = 0; i < oData.inputCenter.length; i++) {
								oData.inputCenter[i].HCP_BLAND = this.oBland;
								this.searchKmPartner(oData.HCP_LOCAL, oData.inputCenter[i]).then(function () {}.bind(this));
							}

							this._validateForm();
							oModel.refresh();
						} else {
							this._validateForm();
						}

					}.bind(this),
					error: function (error) {
						aFilters = [];
					}
				});

			} else {
				this._validateForm();
			}

		},

		_onInputIncotermFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("offerMapFormModel");
			var oData = oModel.oData;
			var oInput = oEvent.getSource();

			oModel.setProperty("/yesLocalItem", true);
			oModel.setProperty("/yesTerceiro", false);
			oModel.setProperty("/errorFreight", false);
			oModel.setProperty("/inputCenter", []);

			if (oModel.oData.ItemLocal.length === 1) {
				oModel.setProperty("/enabledLocal", false);
				oModel.setProperty("/HCP_LOCAL", oModel.oData.ItemLocal[0].LIFNR);
			} else {
				oModel.setProperty("/enabledLocal", true);
			}

			this.clearContainers("newCenterSimpleForm").then(function () {
				this.insertTemplateCenter().then(function () {

					for (var i = 0; i < oData.inputCenter.length; i++) {
						this.searchKmPartner(oData.HCP_LOCAL, oData.inputCenter[i]).then(function () {}.bind(this));
						this.getPriceBrf(oData.inputCenter[i]).then(function () {}.bind(this));
					}

					if (oInput.getSelectedKey() === "1" || oInput.getSelectedKey() === "3") { //CIF e CPT

						if (oModel.getProperty("/HCP_MODALITY") == "2") {
							oModel.setProperty("/yesPrice", false);
						} else {
							oModel.setProperty("/yesPrice", true);
						}

						oModel.setProperty("/yesFob", false);
						oModel.setProperty("/yesCalculator", false);
						oModel.setProperty("/noCalculator", false);
						oModel.setProperty("/yesCif", true);
						oModel.setProperty("/HCP_OTHER_LOCAL", null);
						oModel.setProperty("/HCP_WAREHOUSE", "1");
						oModel.setProperty("/HCP_UM", "SC");
						oModel.setProperty("/yesRequiredLocal", false);
						oModel.setProperty("/yesBlandView", false);
						oModel.setProperty("/yesBlandItem", false);
						oModel.setProperty("/yesCommodities", true);

					} else { //FOB

						oModel.setProperty("/errorFreight", false);
						oModel.setProperty("/yesCommodities", false);
						oModel.setProperty("/yesFob", true);
						oModel.setProperty("/yesCif", false);
						oModel.setProperty("/HCP_OTHER_LOCAL", null);
						oModel.setProperty("/HCP_UM", "SC");
						oModel.setProperty("/yesRequiredLocal", false);

						if (this.sFreightCalculator === "X") {
							oModel.setProperty("/yesCalculator", true);
							oModel.setProperty("/noCalculator", false);
						} else {
							oModel.setProperty("/noCalculator", true);
							oModel.setProperty("/yesCalculator", false);

						}

						if (oData.HCP_PARTNER_TYPE === '1') { //Fornecedor
							oModel.setProperty("/yesBlandItem", true);
						} else {
							oModel.setProperty("/yesBlandView", true);
						}

					}

					if (this.sFreightCalculator == "") {
						oModel.setProperty("/yesBlandItem", false);
						oModel.setProperty("/yesBlandView", false);
					}

					this._validateForm();
					oModel.refresh();

				}.bind(this));

			}.bind(this));

		},

		_onInputPartnerFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("offerMapFormModel");
			var oInput = oEvent.getSource();
			var oData = oModel.oData;

			oModel.setProperty("/HCP_BLAND", null);
			oModel.setProperty("/HCP_LOCAL", null);
			oModel.setProperty("/HCP_PARTNER", null);
			oModel.setProperty("/PROVIDER_DESC", null);
			oModel.setProperty("/noPriceBRF", false);
			oModel.setProperty("/yesBlandItem", false);
			oModel.setProperty("/yesBlandView", false);
			oModel.setProperty("/enabledLocal", false);
			oModel.setProperty("/enabledBland", false);

			oModel.setProperty("/ItemStates", []);
			oModel.setProperty("/ItemLocal", []);
			if (oData.HCP_INCOTERM == '1') { //CIF
				oModel.setProperty("/yesTerceiro", false);
			} else {
				this.searchKmPartner(oData.HCP_LOCAL, oData.HCP_WERKS).then(function () {}.bind(this));
			}

			if (oModel.oData.errorMaterial == false) {
				oModel.setProperty("/yesCommodities", true);
			}

			oModel.setProperty("/LIFNR_PROSPECT", null);
			oModel.setProperty("/HCP_CREATE_OFFER", "2");

			if (oInput.getSelectedKey() == "1" || oInput.getSelectedKey() == "3") { //Fornecedor

				if (oData.HCP_INCOTERM == '2') { //FOB
					oModel.setProperty("/yesBlandItem", true);
				}

				oModel.setProperty("/yesLifnr", true);
				oModel.setProperty("/yesPartner", true);
				oModel.setProperty("/yesProspect", false);
				oModel.setProperty("/yesPartner", true);

			} else { //Prospect

				oModel.setProperty("/yesLifnr", false);

				if (oData.HCP_INCOTERM == '2') {
					oModel.setProperty("/yesBlandView", true);
					oModel.setProperty("/yesTextDistance", true);
					oModel.setProperty("/HCP_DISTANCE", null);
					oModel.setProperty("/textDistance", this.resourceBundle.getText("errorDistanceNotFounded"));
				}

				oModel.setProperty("/yesProspect", true);
				oModel.setProperty("/yesPartner", false);
				oModel.setProperty("/enabledBland", true);

				this._calculatePriceFreight().then(function () {}.bind(this));

			}

			this._validateForm();

		},

		_onInputWerksDest: function (oDataNewCenter) {

			var oModel = this.getView().getModel("offerMapFormModel");
			var oData = oModel.oData;

			if (oDataNewCenter.HCP_WERKS) {
				this.searchKmPartner(oData.HCP_LOCAL, oDataNewCenter).then(function () {
					this._validateForm();
				}.bind(this));
			} else {
				this._validateForm();
			}
		},

		onInputBland: function (oEvent) {

			var oModel = this.getView().getModel("offerMapFormModel");
			var oSource = oEvent.getSource();
			var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
			var oDataNewCenter = oModel.getProperty(sPath);

			this._calculatePriceFreight(oDataNewCenter).then(function () {
				this._validateForm();
			}.bind(this));

		},

		_onInputMaterialFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("offerMapFormModel");
			var oData = oModel.oData;
			var oInput = oEvent.getSource();

			if (oInput.getSelectedKey()) {

				this._validateMaterial(oInput.getSelectedKey()).then(function () {
					if (oData.HCP_EKGRP && oData.HCP_MATNR && oData.HCP_TPCEREAL && oData.HCP_DATE_START) {
						for (var i = 0; i < oData.inputCenter.length; i++) {

							this.getPriceBrf(oData.inputCenter[i]).then(function () {}.bind(this));
						}

						this._validateForm();
					}

				}.bind(this));
			} else {
				this._validateForm();
			}

		},

		_onInputModalityFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("offerMapFormModel");
			var oInput = oEvent.getSource();

			if (oInput.getSelectedKey() == "2") { //Depósito

				if (oModel.getProperty("/HCP_INCOTERM") == "1") {
					oModel.setProperty("/yesPrice", false);
				} else {
					oModel.setProperty("/yesPrice", true);
				}

				oModel.setProperty("/yesDeposit", true);

			} else { //Fixo
				oModel.setProperty("/yesPrice", true);
				oModel.setProperty("/yesDeposit", false);

			}

			oModel.setProperty("/yesOthersDep", false);
			oModel.setProperty("/HCP_DEPOSIT_TYPE", null);
			oModel.setProperty("/HCP_OTHER_DEPOSIT", null);
			oModel.setProperty("/HCP_DESC_DEPOSIT", null);

			this._validateForm();

		},

		_onInputDepositFormSelect: function () {

			var oModel = this.getView().getModel("offerMapFormModel");

			if (oModel.oData.HCP_DEPOSIT_TYPE == '6') {
				oModel.setProperty("/yesOthersDep", true);
			} else {
				oModel.setProperty("/yesOthersDep", false);
				oModel.setProperty("/HCP_OTHER_DEPOSIT", null);
			}

			this._validateForm();

		},

		_onAddNewCenterForm: function (oEvent) {

			var oButton = oEvent.getSource();
			var oFormId = oButton.getCustomData()[0].getValue();
			var oForm = this.getView().byId(oFormId);

			MessageBox.information(

				this.resourceBundle.getText("questionNewPlant"), {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					onClose: function (sAction) {
						if (sAction === "YES") {
							oForm.addContent(new sap.m.Label({
								text: ""
							}));
							this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText("textWait"));
							oForm.addContent(this.buildCenterTemplate());

							setTimeout(function () {
								this._validateForm();
								this.closeBusyDialog();
							}.bind(this), 2000);

						}
					}.bind(this)
				}
			);
		},

		buildCenterTemplate: function () {

			var oModel = this.getView().getModel("offerMapFormModel");
			var oData = oModel.oData;
			var sChars = oModel.getProperty("/inputCenter");
			var aCustomData = [];

			if (!sChars) {
				oModel.setProperty("/inputCenter", []);
			}

			var sCharLength = oModel.getProperty("/inputCenter").length;
			oModel.setProperty("/inputCenter/" + sCharLength, {});
			oModel.setProperty("/inputCenter/" + sCharLength + "/status", "New");

			aCustomData.push(new sap.ui.core.CustomData({
				key: "sPath",
				value: "/inputCenter/" + sCharLength
			}));

			aCustomData.push(new sap.ui.core.CustomData({
				key: "name",
				value: "inputCenter"
			}));

			var oItemTemplateCenter = new sap.ui.core.ListItem({
				key: "{WERKS}",
				text: "{WERKS} - {NAME1}"
			});

			var oItemTemplateStates = new sap.ui.core.ListItem({
				key: "{BLAND}",
				text: "{BLAND} - {BEZEI}"
			});

			var oItemTemplateStatesItem = new sap.ui.core.ListItem({
				key: "{path:'offerMapFormModel>BLAND'}",
				text: "{path:'offerMapFormModel>BLAND'} - {path:'offerMapFormModel>BEZEI'}"
			});

			if (oModel.oData.HCP_INCOTERM == "1" || oModel.oData.HCP_INCOTERM == "3") { //CIF
				var oCif = true;
				var oFob = false;
			} else { //FOB
				oCif = false;
				oFob = true;
			}

			if (sCharLength === 0) {
				var oEnablePriceFob = true;
			} else {
				oEnablePriceFob = false;
			}

			var oTemplate = new sap.m.VBox({
				fitContainer: true,
				justifyContent: "Center",
				backgroundDesign: "Transparent",
				customData: aCustomData,
				items: [
					new sap.ui.layout.form.SimpleForm({
						columnsL: 1,
						columnsM: 1,
						columnsS: 1,
						columnsXL: 1,
						editable: true,
						emptySpanM: 0,
						emptySpanL: 0,
						emptySpanXL: 0,
						labelSpanM: 3,
						labelSpanL: 3,
						labelSpanXL: 3,
						singleContainerFullSize: false,
						adjustLabelSpan: false,
						layout: "ResponsiveGridLayout",
						content: [
							new sap.m.Label({
								text: this.resourceBundle.getText("textPriceOffer"),
								design: "Standard",
								width: "100%",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: oCif,
								required: "{offerMapFormModel>/yesPrice}"
							}),
							new sap.m.Input({
								// value: "{ parts:[{path:'offerMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_PRICE_OFFER'}, {path:'offerMapFormModel>/localeId'}], path: 'offerMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_PRICE_OFFER' , type: 'sap.ui.model.type.Currency', formatOptions: { showMeasure: false }}",
								value: "{ path: 'offerMapFormModel>/inputCenter/" + sCharLength +
									"/HCP_PRICE_OFFER' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_PRICE_OFFER",
								width: "100%",
								enabled: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: oCif,
								required: "{offerMapFormModel>/yesPrice}",
								placeholder: this.resourceBundle.getText("placeEnterPriceOffer"),
								liveChange: this._validateForm.bind(this),
								change: this._valideInputPrice.bind(this)
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textPriceFOB"),
								design: "Standard",
								width: "100%",
								visible: oFob,
								required: oFob,
								textAlign: "Begin",
								textDirection: "Inherit"
							}),
							new sap.m.Input({
								// value: "{ parts:[{path:'offerMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_PRICE_FOB'}, {path:'offerMapFormModel>/localeId'}], path: 'offerMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_PRICE_FOB' , type: 'sap.ui.model.type.Currency', formatOptions: { showMeasure: false }}",
								value: "{ path: 'offerMapFormModel>/inputCenter/" + sCharLength +
									"/HCP_PRICE_FOB' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_PRICE_FOB",
								width: "100%",
								// enabled: true,
								enabled: oEnablePriceFob,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: oFob,
								required: true,
								placeholder: this.resourceBundle.getText("placeEnterPriceFOB"),
								liveChange: this._validateForm.bind(this),
								change: this._valideInputPrice.bind(this)
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textDestinationCenter"),
								design: "Standard",
								width: "100%",
								visible: true,
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit"
							}),
							new CustomComboBox({
								showSecondaryValues: true,
								selectedKey: "{offerMapFormModel>/inputCenter/" + sCharLength + "/HCP_WERKS}",
								placeholder: this.resourceBundle.getText("placeSelectDestinationCenter"),
								name: "HCP_WERKS",
								editable: true,
								enabled: true,
								visible: true,
								required: true,
								width: 'auto',
								maxWidth: '100%',
								selectionChange: this._validateCenterInput.bind(this),
								items: {
									path: '/View_Center',
									length: '999999',

									sorter: new sap.ui.model.Sorter({
										path: "WERKS",
										descending: false
									}),

									template: oItemTemplateCenter
								}
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textFreightValue"),
								design: "Standard",
								width: "100%",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{offerMapFormModel>/noCalculator}",
								required: "{offerMapFormModel>/noCalculator}"
							}),
							new sap.m.Input({
								// value: "{ parts:[{path:'offerMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_PRICE_FREIGHT'}, {path:'offerMapFormModel>/localeId'}], path: 'offerMapFormModel>/inputCenter/" +
								// 	sCharLength +
								// 	"/HCP_PRICE_FREIGHT' , type: 'sap.ui.model.type.Currency', formatOptions: { showMeasure: false }}",
								value: "{ path: 'offerMapFormModel>/inputCenter/" + sCharLength +
									"/HCP_PRICE_FREIGHT' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_PRICE_FREIGHT",
								width: "100%",
								enabled: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{offerMapFormModel>/noCalculator}",
								required: "{offerMapFormModel>/noCalculator}",
								placeholder: this.resourceBundle.getText("placeEnterFreightValue"),
								liveChange: this._validateForm.bind(this),
								change: this._valideInputPrice.bind(this)
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textDistanceKm"),
								design: "Standard",
								width: "100%",
								visible: "{offerMapFormModel>/yesCalculator}",
								required: "{offerMapFormModel>/yesDistance}",
								textAlign: "Begin",
								textDirection: "Inherit"
							}),
							new sap.m.Input({
								value: "{ path: 'offerMapFormModel>/inputCenter/" + sCharLength +
									"/HCP_DISTANCE' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_DISTANCE",
								width: "100%",
								enabled: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{offerMapFormModel>/yesCalculator}",
								required: "{offerMapFormModel>/yesDistance}",
								placeholder: this.resourceBundle.getText("placeEnterDistanceKm"),
								liveChange: this._validateForm.bind(this),
								change: this._validateDistance.bind(this)
							}),
							new sap.m.Label({
								text: "",
								design: "Standard",
								width: "100%",
								visible: "{offerMapFormModel>/inputCenter/" + sCharLength + "/yesTextDistance}",
								required: false,
								textAlign: "Begin",
								textDirection: "Inherit"
							}),
							new sap.m.MessageStrip({
								text: "{offerMapFormModel>/inputCenter/" + sCharLength + "/textDistance}",
								type: "Warning",
								showIcon: true,
								showCloseButton: false,
								visible: "{offerMapFormModel>/inputCenter/" + sCharLength + "/yesTextDistance}",
								class: "sapUiMediumMarginBottom"
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textHomeState"),
								design: "Standard",
								width: "100%",
								visible: "{offerMapFormModel>/yesBlandView}",
								required: "{offerMapFormModel>/yesBlandView}",
								textAlign: "Begin",
								textDirection: "Inherit"
							}),
							new CustomComboBox({
								showSecondaryValues: true,
								selectedKey: "{offerMapFormModel>/inputCenter/" + sCharLength + "/HCP_BLAND}",
								placeholder: this.resourceBundle.getText("placeSelectHomeState"),
								name: "HCP_BLAND",
								editable: true,
								enabled: "{offerMapFormModel>/enabledBland}",
								visible: "{offerMapFormModel>/yesBlandView}",
								required: "{offerMapFormModel>/yesBlandView}",
								width: 'auto',
								maxWidth: '100%',
								selectionChange: this.onInputBland.bind(this),
								items: {
									path: '/View_States',
									length: '999999',

									filters: new sap.ui.model.Filter({
										path: "LAND1",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: "BR"
									}),

									sorter: new sap.ui.model.Sorter({
										path: "BLAND",
										descending: false
									}),

									template: oItemTemplateStates
								}
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textHomeState"),
								design: "Standard",
								width: "100%",
								visible: "{offerMapFormModel>/yesBlandItem}",
								required: "{offerMapFormModel>/yesBlandItem}",
								textAlign: "Begin",
								textDirection: "Inherit"
							}),
							new CustomComboBox({
								showSecondaryValues: true,
								selectedKey: "{offerMapFormModel>/inputCenter/" + sCharLength + "/HCP_BLAND}",
								placeholder: this.resourceBundle.getText("placeSelectHomeState"),
								name: "HCP_BLAND",
								editable: true,
								enabled: "{offerMapFormModel>/enabledBland}",
								visible: "{offerMapFormModel>/yesBlandItem}",
								required: "{offerMapFormModel>/yesBlandItem}",
								width: 'auto',
								maxWidth: '100%',
								selectionChange: this.onInputBland.bind(this),
								items: {
									path: 'offerMapFormModel>/ItemStates',
									length: 999999,

									sorter: new sap.ui.model.Sorter({
										path: 'offerMapFormModel>BLAND',
										descending: false
									}),

									template: oItemTemplateStatesItem
								}
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("questionUnpavedStretch"),
								design: "Standard",
								width: "100%",
								visible: "{offerMapFormModel>/yesCalculator}",
								required: "{offerMapFormModel>/yesCalculator}",
								textAlign: "Begin",
								textDirection: "Inherit"
							}),
							new sap.m.SegmentedButton({
								selectedKey: "{offerMapFormModel>/inputCenter/" + sCharLength + "/HCP_PAVED}",
								width: "auto",
								selectionChange: this._onInputPavedFormSelect.bind(this),
								visible: "{offerMapFormModel>/yesCalculator}",
								items: [{
									text: this.resourceBundle.getText("textYes"),
									key: "1"
								}, {
									text: this.resourceBundle.getText("textNo"),
									key: "2"
								}]
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textStretchKm"),
								design: "Standard",
								width: "100%",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{offerMapFormModel>/inputCenter/" + sCharLength + "/yesPaved}",
								required: "{offerMapFormModel>/inputCenter/" + sCharLength + "/yesPaved}"
							}),
							new sap.m.Input({
								value: "{ path: 'offerMapFormModel>/inputCenter/" + sCharLength +
									"/HCP_TRECHO_KM' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_TRECHO_KM",
								width: "100%",
								enabled: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{offerMapFormModel>/inputCenter/" + sCharLength + "/yesPaved}",
								required: "{offerMapFormModel>/inputCenter/" + sCharLength + "/yesPaved}",
								placeholder: this.resourceBundle.getText("placeEnterKm"),
								liveChange: this._validateForm.bind(this),
								change: this._validateDistance.bind(this)
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textPriceWithFreight"),
								design: "Standard",
								width: "100%",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{offerMapFormModel>/yesCalculator}",
								required: false
							}),
							new sap.m.Input({
								// value: "{ parts:[{path:'offerMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_PRICE_CALC_FREIGHT'}, {path:'offerMapFormModel>/localeId'}], path: 'offerMapFormModel>/inputCenter/" +
								// 	sCharLength +
								// 	"/HCP_PRICE_CALC_FREIGHT' , type: 'sap.ui.model.type.Currency', formatOptions: { showMeasure: false }}",
								value: "{ path: 'offerMapFormModel>/inputCenter/" + sCharLength +
									"/HCP_PRICE_CALC_FREIGHT' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_PRICE_CALC_FREIGHT",
								width: "100%",
								enabled: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{offerMapFormModel>/yesCalculator}",
								required: false,
								liveChange: this._validateForm.bind(this),
								change: this._valideInputPrice.bind(this)
							}),
							new sap.m.Label({
								text: "",
								design: "Standard",
								width: "100%",
								visible: true,
								required: false,
								textAlign: "Begin",
								textDirection: "Inherit"
							}),
							new sap.m.MessageStrip({
								text: this.resourceBundle.getText("errorFreightNotCalculated"),
								type: "Warning",
								showIcon: true,
								showCloseButton: false,
								visible: "{offerMapFormModel>/inputCenter/" + sCharLength + "/noPricesCalculator}",
								class: "sapUiMediumMarginBottom"
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textFinalPrice"),
								design: "Standard",
								width: "100%",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: oFob,
								required: false
							}),
							new sap.m.Input({
								// value: "{ parts:[{path:'offerMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_PRICE_FINAL'}, {path:'offerMapFormModel>/localeId'}], path: 'offerMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_PRICE_FINAL' , type: 'sap.ui.model.type.Currency', formatOptions: { showMeasure: false }}",
								value: "{ path: 'offerMapFormModel>/inputCenter/" + sCharLength +
									"/HCP_PRICE_FINAL' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_PRICE_FINAL",
								width: "100%",
								enabled: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: oFob,
								required: false
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textPriceOfTableBrf"),
								design: "Standard",
								width: "100%",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true,
								required: false
							}),
							new sap.m.Input({
								// value: "{ parts:[{path:'offerMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_PRICE_BRF'}, {path:'offerMapFormModel>/localeId'}], path: 'offerMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_PRICE_BRF' , type: 'sap.ui.model.type.Currency', formatOptions: { showMeasure: false }}",
								value: "{ path: 'offerMapFormModel>/inputCenter/" + sCharLength +
									"/HCP_PRICE_BRF' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_PRICE_BRF",
								width: "100%",
								enabled: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true,
								required: false,
								text: this.resourceBundle.getText("textPriceOfTableBrf")
							}),
							new sap.m.Label({
								text: "",
								design: "Standard",
								width: "100%",
								visible: "{offerMapFormModel>/inputCenter/" + sCharLength + "/noPriceBRF}",
								required: false,
								textAlign: "Begin",
								textDirection: "Inherit"
							}),
							new sap.m.MessageStrip({
								text: this.resourceBundle.getText("errorPriceNotFounded"),
								type: "Warning",
								showIcon: true,
								showCloseButton: false,
								visible: "{offerMapFormModel>/inputCenter/" + sCharLength + "/noPriceBRF}",
								class: "sapUiMediumMarginBottom"
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("questionRequestFreightQuotation"),
								design: "Standard",
								width: "100%",
								visible: oFob,
								required: oFob,
								textAlign: "Begin",
								textDirection: "Inherit"
							}),
							new sap.m.SegmentedButton({
								selectedKey: "{offerMapFormModel>/inputCenter/" + sCharLength + "/HCP_QUOTATION_FREIGHT}",
								width: "auto",
								selectionChange: this._onInputQuotFreitFormSelect.bind(this),
								visible: oFob,
								items: [{
									text: this.resourceBundle.getText("textYes"),
									key: "1"
								}, {
									text: this.resourceBundle.getText("textNo"),
									key: "2"
								}]
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textFreightLogisticsValue"),
								design: "Standard",
								width: "100%",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{offerMapFormModel>/inputCenter/" + sCharLength + "/yesFreight}",
								required: false
							}),
							new sap.m.Input({
								// value: "{ parts:[{path:'offerMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_LOGISTICS_FREIGHT'}, {path:'offerMapFormModel>/localeId'}], path: 'offerMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_LOGISTICS_FREIGHT' , type: 'sap.ui.model.type.Currency', formatOptions: { showMeasure: false }}",
								value: "{ path: 'offerMapFormModel>/inputCenter/" + sCharLength +
									"/HCP_LOGISTICS_FREIGHT' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_LOGISTICS_FREIGHT",
								width: "100%",
								enabled: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{offerMapFormModel>/inputCenter/" + sCharLength + "/yesFreight}",
								required: false,
								liveChange: this._validateForm.bind(this),
								change: this._valideInputNumber.bind(this)
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textStatus"),
								design: "Standard",
								width: "100%",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{offerMapFormModel>/inputCenter/" + sCharLength + "/yesFreight}",
								required: false
							}),
							new sap.m.Input({
								value: "{offerMapFormModel>/inputCenter/" + sCharLength + "/HCP_STATES_FREIGHT}",
								type: "Tel",
								design: "Standard",
								name: "HCP_STATES_FREIGHT",
								width: "100%",
								enabled: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{offerMapFormModel>/inputCenter/" + sCharLength + "/yesFreight}",
								required: false
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textLogistics"),
								design: "Standard",
								width: "100%",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{offerMapFormModel>/inputCenter/" + sCharLength + "/yesFreight}",
								required: false
							}),
							new sap.m.Input({
								value: "{offerMapFormModel>/inputCenter/" + sCharLength + "/HCP_USER_LOGISTICS}",
								type: "Tel",
								design: "Standard",
								name: "HCP_USER_LOGISTICS",
								width: "100%",
								enabled: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{offerMapFormModel>/inputCenter/" + sCharLength + "/yesFreight}",
								required: false
							})

						]
					})
				]
			});

			if (sCharLength !== 0) {
				oTemplate.getItems()[0].addContent(new sap.m.Toolbar({
					content: [
						new sap.m.ToolbarSpacer(),
						new sap.m.Button({
							icon: "sap-icon://sys-cancel",
							type: "Reject",
							width: "40%",
							text: this.resourceBundle.getText("buttonDelete"),
							press: this.removeNewForm.bind(this)
						})
					]
				}));
			}

			if (sCharLength === 0) {
				oModel.oData.inputCenter[sCharLength].HCP_WERKS = this.werks_d;
				oModel.oData.inputCenter[sCharLength].WERKS = this.werks_d;
			} else {
				oModel.oData.inputCenter[sCharLength].HCP_PRICE_FOB = this.oPriceFob;
			}

			oModel.oData.inputCenter[sCharLength].HCP_PRICE_CALC_FREIGHT = 0;
			oModel.oData.inputCenter[sCharLength].HCP_PRICE_FINAL = 0;
			oModel.oData.inputCenter[sCharLength].HCP_PRICE_BRF = 0;
			oModel.oData.inputCenter[sCharLength].HCP_LOGISTICS_FREIGHT = 0;
			oModel.oData.inputCenter[sCharLength].HCP_PAVED = "2";
			oModel.oData.inputCenter[sCharLength].HCP_QUOTATION_FREIGHT = "2";
			oModel.oData.inputCenter[sCharLength].HCP_BLAND = this.oBland;
			oModel.oData.inputCenter[sCharLength].HCP_DISTANCE = 0;
			oModel.oData.inputCenter[sCharLength].noPriceBRF = false;
			oModel.oData.inputCenter[sCharLength].noCalculator = false;
			oModel.oData.inputCenter[sCharLength].noPricesCalculator = false;
			oModel.oData.inputCenter[sCharLength].yesTextDistance = false;
			oModel.oData.inputCenter[sCharLength].yesPaved = false;
			oModel.oData.inputCenter[sCharLength].yesFreight = false;
			oModel.oData.inputCenter[sCharLength].HCP_STATES_FREIGHT = this.resourceBundle.getText("textOpened");

			return oTemplate;

		},

		_validateCenterInput: function (oProperty) {

			var oModel = this.getView().getModel("offerMapFormModel");
			var oSource = oProperty.getSource();
			var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
			var oDataNewCenter = oModel.getProperty(sPath);
			var oData = oModel.oData;
			var oNumber = 0;
			var oArrayCenter = [];

			if (oSource.getSelectedItem()) {

				oDataNewCenter.WERKS = oDataNewCenter.HCP_WERKS;

				for (var i = 0; i < oData.inputCenter.length; i++) {

					if (oData.inputCenter[i].status !== "Deleted" &&
						oDataNewCenter.HCP_WERKS === oData.inputCenter[i].HCP_WERKS) {
						oNumber = oNumber + 1;
					}

				}

				if (oNumber > 1) {
					oSource.setValueState("Error");
					oSource.setValueStateText(this.resourceBundle.getText("errorDuplicityCenter"));
					oModel.refresh();
				} else {
					this.lookForDuplicities(oSource, oDataNewCenter, oNumber);
					this.getPriceBrf(oDataNewCenter).then(function () {
						this._onInputWerksDest(oDataNewCenter);
						oModel.refresh();
					}.bind(this));

				}

			}

			this._validateForm();

		},

		lookForDuplicities: function (oSource, oData, oNumber) {

			var oForm = this.getView().byId("newCenterSimpleForm");
			var oItems = oForm.getContent().filter(content => content.getMetadata().getName() === "sap.m.VBox");

			var sLastValueCenter;
			var oValueCenter;

			sLastValueCenter = oSource._lastValue;

			if (oItems.length > 0) {
				for (var item of oItems) {
					var oFieldCenter = item.getItems()[0].getContent()[5];

					oValueCenter = oFieldCenter.getValue();

					if (oNumber > 1) {
						if (sLastValueCenter === oValueCenter) {
							oFieldCenter.setValueState("None");
							oFieldCenter.setValueStateText("");
						}
					} else {
						oFieldCenter.setValueState("None");
						oFieldCenter.setValueStateText("");
					}

				}
			}
		},

		removeNewForm: function (oEvent) {

			var oModel = this.getView().getModel("offerMapFormModel");
			var oVBox = oEvent.getSource().getParent().getParent().getParent().getParent().getParent();
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			MessageBox.warning(
				this.resourceBundle.getText("questionDeletePlant"), {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						if (sAction === "YES") {
							if (oVBox) {
								var sPath = oVBox.getCustomData()[0].getValue();
								var oData = oModel.getProperty(sPath);

								oData.status = "Deleted";
								oVBox.destroy();
								this._validateForm();

							}
						}
					}.bind(this)
				}
			);

		},

		onCancelPress: function () {

			var oEditModel = this.getView().getModel("offerMapFormModel");
			var oData = oEditModel.oData;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			if (oData.edit) {
				MessageBox.warning(
					this.resourceBundle.getText("questionGoBack"), {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {
								oEditModel.setProperty("/", []);
								this.navBack();
							}
						}.bind(this)
					}
				);
			} else {
				this.navBack();
			}

		},

		navBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oModel = this.getView().getModel("offerMapFormModel");

			oModel.setProperty("/", []);

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}

		},

		_validateForm: function () {
			var oFilterModel = this.getView().getModel("offerMapFormModel");

			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;

				oFilterModel.setProperty("/edit", true);

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required && oControl.getVisible()) {
						var oInputId = aInputControls[m].control.getMetadata();

						if (oInputId.getName() === "sap.m.Input" || oInputId.getName() ===
							"com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomSlider" ||
							oInputId.getName() === "sap.m.TextArea" || oInputId.getName() === "sap.m.DatePicker") {
							var sValue = oControl.getValue();
						} else {
							sValue = oControl.getSelectedKey();
						}

						if (sValue.length > 0 && oControl.getValueState() !== "Error") {
							if (oControl.mProperties.name === "HCP_DISTANCE" || oControl.mProperties.name === "HCP_TRECHO_KM" ||
								oControl.mProperties.name === "HCP_PRICE_OFFER" || oControl.mProperties.name === "HCP_PRICE_FOB" ||
								oControl.mProperties.name === "HCP_PRICE_FREIGHT" || oControl.mProperties.name === "HCP_LOGISTICS_FREIGHT" ||
								oControl.mProperties.name === "HCP_VOLUME") {

								var aValue = parseFloat(sValue);
								if (aValue > 0) {
									oFilterModel.setProperty("/enableConfirm", true);
								} else {
									oFilterModel.setProperty("/enableConfirm", false);
									return;
								}

							} else {
								oFilterModel.setProperty("/enableConfirm", true);
							}

						} else {
							oFilterModel.setProperty("/enableConfirm", false);
							return;
						}
					}
				}
			}.bind(this), 100);
		},

		getDynamicFormFields: function (oForm) {
			var aFields = [];

			for (var content of oForm.getContent()) {
				if (content.getMetadata().getName() === "sap.m.VBox") {
					var oForm = content.getItems()[0];
					aFields = aFields.concat(oForm.getContent());
				}
			}
			return aFields;
		},

		_getFormFields: function () {
			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var oCenterFormFields = this.getDynamicFormFields(this.getView().byId("newCenterSimpleForm")) || [];
			var aControls = [];
			var sControlType;

			var oAllFields = oMainDataForm.concat(oCenterFormFields);

			for (var i = 0; i < oAllFields.length; i++) {
				var sControlType1 = oAllFields[i].getMetadata().getName();
				if (sControlType1 === "sap.m.Label") {
					if (sControlType = oAllFields[i + 1]) {
						sControlType = oAllFields[i + 1].getMetadata().getName();
						if (sControlType === "sap.m.Input" || sControlType === "sap.m.ComboBox" ||
							sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" ||
							sControlType === "sap.m.DatePicker" || sControlType === "sap.m.TextArea") {
							aControls.push({
								control: oAllFields[i + 1],
								required: oAllFields[i].getRequired(),
								text: oAllFields[i].getText()
							});
						}
					}

				}
			}
			return aControls;
		},

		setBusyDialog: function (aTitle, aMessage) {
			var timestamp = new Date().getTime();
			if (!this.busyDialog) {
				this.busyDialog = new sap.m.BusyDialog("busyDialogID" + this.getView().getId() + timestamp);
			}
			this.busyDialog.setText(aMessage);
			this.busyDialog.setTitle(aTitle);

			this.busyDialog.open();

			// jQuery.sap.delayedCall(3000, this, function () {
			//	this.busyDialog.setCancelButtonText("Cancelar");
			//	this.busyDialog.attachClose();
			//});

		},

		closeBusyDialog: function () {
			if (this.busyDialog) {
				this.busyDialog.close();
			}
		},

		backToIndex: function () {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("offerMap.Index", true);
		},

		_handlePartnerFilterPress: function (oEvent) {
			var oFilterBar;
			if (!this.oPartnerFilter || this.oPartnerFilter.bIsDestroyed) {
				this.oPartnerFilter = sap.ui.xmlfragment("partnerFilterID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.prospects.fragments.PartnerFilter", this);
				this.getView().addDependent(this.oPartnerFilter);
				oFilterBar = sap.ui.core.Fragment.byId("partnerFilterID" + this.getView().getId(), "fbPartner");
				oFilterBar.attachBrowserEvent("keyup", jQuery.proxy(function (e) {
					if (e.which === 13) {
						this._onPartnerApplySearch();
					}
				}, this));
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
			var oModel = this.getView().getModel("offerMapFormModel");
			var oData = oModel.getProperty("/");
			var SelectedPartner = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

			oData["HCP_PARTNER"] = SelectedPartner.HCP_REGISTER;
			oData["PROVIDER_DESC"] = SelectedPartner.NAME1;
			oModel.refresh();
			this.oPartnerFilter.destroy();

			this._onInputPartner(SelectedPartner).then(function () {
				this._validateForm();
			}.bind(this));
		},

		_getPartnerFilters: function (oFilterBar) {
			var aFilterItems = oFilterBar.getAllFilterItems();
			var aFilters = [];
			for (var i = 0; i < aFilterItems.length; i++) {
				aFilters.push(new sap.ui.model.Filter({
					path: aFilterItems[i].getName(),
					operator: sap.ui.model.FilterOperator.Contains,
					value1: oFilterBar.determineControlByFilterItem(aFilterItems[i]).getValue().toUpperCase()
				}));
			}
			return aFilters;
		},

		onPartnerDialogClose: function () {
			this.oPartnerFilter.close();
		},

		getStates: function (oPlant) {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getView().getModel();
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: "WERKS",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oPlant
				}));

				oModelOffer.read("/View_Center", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;
						resolve(aResults[0].REGIO);

					}.bind(this),
					error: function (error) {
						this.closeBusyDialog();
						resolve();
					}
				});

			}.bind(this));

		},

		getPriceBrf: function (oInputCenter) {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getView().getModel();
				var oModel = this.getView().getModel("offerMapFormModel");
				var oData = oModel.oData;
				var aFilters = [];
				var oArrayCenter = [];

				if (oData.HCP_EKGRP && oData.HCP_MATNR && oData.HCP_TPCEREAL && oData.HCP_DATE_START && oInputCenter.HCP_WERKS) {

					var oMonthStart = oData.HCP_DATE_START.getMonth();
					oMonthStart = oMonthStart + 1;

					if (oMonthStart.toString().length === 1) {
						oMonthStart = '0' + oMonthStart;
					}

					var oFieldMont = "PRECO_" + oMonthStart;

					oInputCenter.HCP_PRICE_BRF = 0;
					oInputCenter.noPriceBRF = true;

					aFilters = [];

					aFilters.push(new sap.ui.model.Filter({
						path: "WERKS",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oInputCenter.HCP_WERKS
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: "LAND1",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: "BR"
					}));

					var oRegioDest;
					this.getStates(oInputCenter.HCP_WERKS).then(function (oRegioDest) {

						this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText("messageConsultingPriceWait"));

						var aFiltersPrice = [];

						aFiltersPrice.push(new sap.ui.model.Filter({
							path: "EKGRP",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.HCP_EKGRP
						}));

						aFiltersPrice.push(new sap.ui.model.Filter({
							path: "WERKS",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oInputCenter.HCP_WERKS
						}));

						aFiltersPrice.push(new sap.ui.model.Filter({
							path: "REGIO",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oRegioDest
						}));

						aFiltersPrice.push(new sap.ui.model.Filter({
							path: "MATNR",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.HCP_MATNR
						}));

						aFiltersPrice.push(new sap.ui.model.Filter({
							path: "TPCEREAL",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.HCP_TPCEREAL
						}));

						aFiltersPrice.push(new sap.ui.model.Filter({
							path: "FND_YEAR",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.HCP_DATE_END.getFullYear()
						}));

						oModelOffer.read("/Table_Price", {

							filters: aFiltersPrice,
							success: function (results) {

								var aResults = results.results;

								if (aResults.length > 0) {
									oInputCenter.HCP_PRICE_BRF = aResults[0][oFieldMont];
									oInputCenter.noPriceBRF = false;
								}

								this._validateMaterial(oData.HCP_MATNR).then(function () {

									setTimeout(function () {
										oModel.refresh();
										this.closeBusyDialog();
										resolve();

									}.bind(this), 500);

								}.bind(this));

							}.bind(this),
							error: function (error) {
								this.closeBusyDialog();
								resolve();

							}
						});

					}.bind(this));

				} else {
					resolve();
				}

				this._validateForm();

			}.bind(this));

		},

		searchKmPartner: function (oPartner, oInputCenter) {

			return new Promise(function (resolve, reject) {

				var oModelVisit = this.getView().getModel();
				var oEditModel = this.getView().getModel("offerMapFormModel");
				var oData = oEditModel.oData;
				var aFilters = [];

				if (oPartner && oInputCenter.HCP_WERKS && oData.HCP_INCOTERM == '2' && this.sFreightCalculator == "X") {

					if (oData.HCP_WAREHOUSE == '1' && oData.HCP_PARTNER_TYPE == "1") {

						this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText("textWait"));

						oInputCenter.HCP_DISTANCE = null;
						oInputCenter.yesTextDistance = true;
						oInputCenter.textDistance = this.resourceBundle.getText("errorDistanceNotFounded");

						aFilters.push(new sap.ui.model.Filter({
							path: "OBJEK",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oPartner
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: "WERKS",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oInputCenter.HCP_WERKS
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: "KLART",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: "010"
						}));

						oModelVisit.read("/View_Suppliers_Characteristics", {

							filters: aFilters,
							success: function (results) {

								var aResults = results.results;

								if (aResults.length > 0) {
									oInputCenter.HCP_DISTANCE = aResults[0].ATFLV;
									oInputCenter.textDistance = this.resourceBundle.getText("sucessProposedDistance");
								}

								this.closeBusyDialog();
								this._calculatePriceFreight(oInputCenter).then(function () {
									resolve();
								}.bind(this));

							}.bind(this),
							error: function (error) {
								this.closeBusyDialog();
							}
						});

					} else {
						if (oData.yesTerceiro == false) {
							oInputCenter.yesTextDistance = false;
						} else {
							oInputCenter.yesTextDistance = true;
							oInputCenter.textDistance = this.resourceBundle.getText("errorDistanceNotFounded");
						}
						resolve();
					}

				} else {

					if (oData.yesTerceiro == false) {
						oInputCenter.yesTextDistance = false;
					} else {
						oInputCenter.yesTextDistance = true;
						oInputCenter.textDistance = this.resourceBundle.getText("errorDistanceNotFounded");
					}

					this._calculatePriceFreight(oInputCenter).then(function () {
						resolve();
					}.bind(this));

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

		generateUniqueKey: function () {
			return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
				(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
			);
		},

		_checkFreightCalculation: function (oInputCenter) {

			return new Promise(function (resolve, reject) {

				this.onSave = true;

				for (var i = 0; i < oInputCenter.length; i++) {

					if (oInputCenter[i].status === "New" && oInputCenter[i].HCP_PRICE_CALC_FREIGHT == 0 && oInputCenter[i].HCP_PRICE_FINAL == 0) {
						this._calculatePriceFreight(oInputCenter[i]).then(function () {
							resolve();
						}.bind(this));
					} else {
						resolve();
					}

				}

			}.bind(this));

		},

		commoditiesData: function (oOffer) {

			var oModelCommodities = this.getView().getModel();
			var oModel = this.getView().getModel("offerMapFormModel");
			var oData = oModel.oData;
			var aFilters = [];
			var aCenterArray = oData.inputCenter;
			var oLocalArray = oData.ItemLocal;
			var oEnabledLocal = false;
			var oEnabledCenter = false;

			if (oData.HCP_CREATE_OFFER == "1") { //Criar Compra

				if (oData.HCP_MODALITY == "1") { //Fixo
					var oText = this.resourceBundle.getText("optionBuyFixedPrice");
				} else { //Depósito
					oText = this.resourceBundle.getText("optionBuyDepositi");

					if (oData.HCP_INCOTERM == "1") { //Cif

						aCenterArray = oData.inputCenter;
					}
				}

				//if (oData.HCP_INCOTERM == "2") { //Fob
				//		oData.HCP_UM = "TO";
				//	}

				//VERIFICA SE HCP_LOCAL É UM NUMERO
				var isOnlyNumbers = /^\d+$/.test(oData.HCP_LOCAL);

				if (aCenterArray.length > 1) {
					oEnabledCenter = true;
				} else {
					var oCenter;
					if (aCenterArray[0]) {
						oCenter = aCenterArray[0].WERKS;
					}

				}

				for (var i = 0; i < aCenterArray.length; i++) {

					aFilters.push(new sap.ui.model.Filter({
						path: "WERKS",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: aCenterArray[i].WERKS
					}));

				}

				if (!this._FragmentCommodities) {
					this._FragmentCommodities = sap.ui.xmlfragment(
						"com.sap.build.standard.brfAppDeGraosModoEditar.view.offerMap.fragments.Commodities",
						this);

					this.getView().addDependent(this._FragmentCommodities);

				}

				aCenterArray = [];

				oModelCommodities.read("/View_Center", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;

						for (var i = 0; i < aResults.length; i++) {

							var aData = {
								WERKS: aResults[i].WERKS,
								NAME1: aResults[i].NAME1
							};

							aCenterArray.push(aData);

						}

						if (oCenter && oData.HCP_LOCAL) {
							var oConfirm = true;
						} else {
							oConfirm = false;
						}

						var oModelCommodities = new JSONModel({
							textCommodities: oText,
							enabledConfir: oConfirm,
							enabledLocal: oEnabledLocal,
							enabledCenter: oEnabledCenter,
							enabledOtherVol: false,
							ItemWerks: aCenterArray,
							ItemLocal: oLocalArray,
							HCP_WERKS: oCenter,
							HCP_LOCAL: oData.HCP_LOCAL,
							HCP_UNIQUE_KEY: this.uniqueKey,
							HCP_TIPO: oData.HCP_MODALITY,
							HCP_MENGE: oData.HCP_VOLUME,
							HCP_OFFER: oOffer
						});

						this.getView().setModel(oModelCommodities, "commoditiesFormModel");

						this._FragmentCommodities.open();

						oModel.refresh();

					}.bind(this),
					error: function (error) {

					}
				});

			} else {
				this.backToIndex();
			}

		},

		_onConfirComPress: function (oEvent) {

			oEvent.getSource().getParent().close();
			this.redirectCommodities();

		},

		_onCancelComPress: function (oEvent) {

			oEvent.getSource().getParent().close();
			this.backToIndex();
		},

		redirectCommodities: function () {

			var oModel = this.getView().getModel("commoditiesFormModel");
			var oData = oModel.oData;
			var oText = this.resourceBundle.getText("messageRedirectCommodities");

			if (oData.HCP_TIPO == "1") { //Fixo
				oText = oText + this.resourceBundle.getText("optionBuyFixedPrice");
				var oRouter = "commodities." + "NewFixedOrder";
			} else {
				oText = oText + this.resourceBundle.getText("optionBuyDepositi");
				oRouter = "commodities." + "NewDepositTransf";
			}

			// MessageBox.success(
			// 	oText, {
			// 		actions: [sap.m.MessageBox.Action.OK],
			// 		onClose: function (sAction) {
			// 			if (sAction === "OK") {

			var sKeyOffer = oData;

			var sKeyOffer = {
				HCP_UNIQUE_KEY_OFFER: oData.HCP_UNIQUE_KEY,
				HCP_TIPO: oData.HCP_TIPO,
				HCP_WERKS: oData.HCP_WERKS,
				HCP_LOCAL: oData.HCP_LOCAL,
				HCP_MENGE: oData.HCP_MENGE
			};

			// 			}
			// 		}.bind(this)
			// 	}
			// );

			this.oRouter.navTo(oRouter, {
				keyData: JSON.stringify(sKeyOffer)
			});

		},

		_validateFormCommodities: function () {

			var oModel = this.getView().getModel("commoditiesFormModel");
			var oData = oModel.oData;

			if (oData.HCP_WERKS && oData.HCP_LOCAL && oData.HCP_MENGE != 0) {
				oModel.setProperty("/enabledConfir", true);
			} else {
				oModel.setProperty("/enabledConfir", false);
			}

		},

		onSavePress: function (oEvent) {

			var aUserName = this.userName;
			var sCounter = 0;
			var sTimestamp = new Date().getTime() + sCounter;
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var aDeferredGroups = oModel.getDeferredGroups();

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			var oCreateModelOffer = this.getView().getModel("offerMapFormModel");
			var oData = oCreateModelOffer.oData;

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}

			this._checkFreightCalculation(oData.inputCenter).then(function () {

				this.uniqueKey = this.generateUniqueKey();

				var aData = {
					HCP_OFFER_ID: sTimestamp.toFixed(),
					HCP_UNIQUE_KEY: this.uniqueKey,
					HCP_EKGRP: oData.HCP_EKGRP,
					HCP_EKORG: oData.HCP_EKORG,
					HCP_LIFNR: oData.HCP_LIFNR,
					HCP_PARTNER_TYPE: oData.HCP_PARTNER_TYPE,
					HCP_PARTNER: oData.HCP_PARTNER,
					HCP_MATNR: oData.HCP_MATNR,
					HCP_TPCEREAL: oData.HCP_TPCEREAL,
					HCP_VOLUME: parseFloat(oData.HCP_VOLUME).toFixed(2),
					HCP_MODALITY: oData.HCP_MODALITY,
					HCP_DEPOSIT_TYPE: oData.HCP_DEPOSIT_TYPE,
					HCP_OTHER_DEPOSIT: oData.HCP_OTHER_DEPOSIT,
					HCP_DESC_DEPOSIT: oData.HCP_DESC_DEPOSIT,
					HCP_DATE_START: oData.HCP_DATE_START,
					HCP_DATE_END: oData.HCP_DATE_END,
					HCP_ZTERM: oData.HCP_ZTERM,
					HCP_INCOTERM: oData.HCP_INCOTERM,
					HCP_WAREHOUSE: oData.HCP_WAREHOUSE,
					HCP_LOCAL: oData.HCP_LOCAL ? oData.HCP_LOCAL : oData.HCP_PARTNER,
					HCP_OTHER_LOCAL: oData.HCP_OTHER_LOCAL,
					HCP_UM: oData.HCP_UM,
					HCP_MOEDA: oData.HCP_MOEDA,
					HCP_STATES_OFFER: "1",
					HCP_CREATE_OFFER: oData.HCP_CREATE_OFFER,
					HCP_CREATED_AT_OFFER: oData.HCP_CREATED_AT_OFFER,
					HCP_CREATED_BY_OFFER: oData.HCP_CREATED_BY_OFFER,
					HCP_CREATED_BY: aUserName,
					HCP_UPDATED_BY: aUserName,
					HCP_PLATAFORM: bIsMobile ? '1' : '2',
					HCP_CREATED_AT: new Date(),
					HCP_UPDATED_AT: new Date()
				};

				sCounter = sCounter + 1;

				oModel.createEntry("/Offer_Map", {
					properties: aData
				}, {
					groupId: "changes"
				});

				//Centros
				for (var i = 0; i < oData.inputCenter.length; i++) {

					if (oData.inputCenter[i].status === "New") {

						if (!oData.inputCenter[i].HCP_DISTANCE) {
							oData.inputCenter[i].HCP_DISTANCE = "0.00";
						}

						if (!oData.inputCenter[i].HCP_TRECHO_KM) {
							oData.inputCenter[i].HCP_TRECHO_KM = "0.00";
						}

						if (!oData.inputCenter[i].HCP_PRICE_FREIGHT) {
							oData.inputCenter[i].HCP_PRICE_FREIGHT = "0.00";
						}

						var aDataCenter = {
							HCP_WERKS: oData.inputCenter[i].HCP_WERKS,
							HCP_UNIQUE_KEY: this.uniqueKey,
							HCP_UNIQUE_KEY_WERKS: this.generateUniqueKey(),
							HCP_PRICE_OFFER: ((oData.HCP_INCOTERM === '1' || oData.HCP_INCOTERM == '3') && oData.inputCenter[i].HCP_PRICE_OFFER) ?
								parseFloat(oData.inputCenter[i].HCP_PRICE_OFFER).toFixed(2) : "0.00",
							HCP_PRICE_FOB: oData.HCP_INCOTERM === '2' ? parseFloat(oData.inputCenter[i].HCP_PRICE_FOB).toFixed(2) : "0.00",
							HCP_PRICE_FREIGHT: oData.HCP_INCOTERM === '2' && oData.noCalculator == true ? parseFloat(oData.inputCenter[i].HCP_PRICE_FREIGHT)
								.toFixed(
									2) : "0.00",
							HCP_DISTANCE: oData.HCP_INCOTERM === '2' && oData.yesCalculator == true ? parseFloat(oData.inputCenter[i].HCP_DISTANCE).toFixed(
								2) : "0.00",
							HCP_BLAND: oData.inputCenter[i].HCP_BLAND,
							HCP_PAVED: oData.inputCenter[i].HCP_PAVED,
							HCP_TRECHO_KM: oData.inputCenter[i].HCP_PAVED === '1' ? parseFloat(oData.inputCenter[i].HCP_TRECHO_KM).toFixed(2) : "0.00",
							HCP_PRICE_CALC_FREIGHT: parseFloat(oData.inputCenter[i].HCP_PRICE_CALC_FREIGHT).toFixed(2),
							HCP_PRICE_FINAL: parseFloat(oData.inputCenter[i].HCP_PRICE_FINAL).toFixed(2),
							HCP_PRICE_BRF: parseFloat(oData.inputCenter[i].HCP_PRICE_BRF).toFixed(2),
							HCP_QUOTATION_FREIGHT: oData.inputCenter[i].HCP_QUOTATION_FREIGHT,
							HCP_STATES_FREIGHT: oData.inputCenter[i].HCP_QUOTATION_FREIGHT == "1" ? "1" : null,
							HCP_LOGISTICS_FREIGHT: "0.00",
							HCP_CREATED_BY: aUserName,
							HCP_UPDATED_BY: aUserName,
							HCP_CREATED_AT: new Date(),
							HCP_UPDATED_AT: new Date()
						};

						console.log(aDataCenter);

						oModel.createEntry("/Offer_Map_Werks", {
							properties: aDataCenter
						}, {
							groupId: "changes"
						});

					}

				}

				//this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText("messageSaving"));
				this.verifyTimeOut(true);
				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
					oModel.submitChanges({
						groupId: "changes",
						success: function () {

							this.flushStore("Offer_Map,Offer_Map_Werks,Simplified_Contact").then(function () {
								this.refreshStore("Offer_Map").then(function () {
									this.refreshStore("Offer_Map_Werks", "Simplified_Contact").then(function () {
										var oModelOffer = this.getView().getModel();
										var aFilters = [];
										var aSorter = [];

										aFilters.push(new sap.ui.model.Filter({
											path: "HCP_CREATED_BY",
											operator: sap.ui.model.FilterOperator.EQ,
											value1: this.userName
										}));

										aSorter.push(new sap.ui.model.Sorter({
											path: "HCP_OFFER_ID",
											descending: true
										}));

										oModelOffer.read("/Offer_Map", {
											filters: aFilters,
											sorters: aSorter,
											success: function (results) {

												var aResults = results.results;
												if (aResults.length > 0) {

													this.hasFinished = true;
													if (bIsMobile) {
														localStorage.setItem("countStorageOfferMap", 0);
														localStorage.setItem("lastUpdateOfferMap", new Date());
													}

													this.oMsgNumOffer = this.resourceBundle.getText("sucessOfferMap") + " " +
														this.resourceBundle.getText("textOfferNumber") + ": " + aResults[0].HCP_OFFER_ID;

													for (var f = 0; f < oData.inputCenter.length; f++) {

														if (oData.inputCenter[f].HCP_QUOTATION_FREIGHT == '1') {
															this.hasFreight = true;
														}

														if (f == oData.inputCenter.length - 1) {

															if (this.hasFreight) {

																this.sendMail(aResults, this.oMsgNumOffer, this);
															} else {
																MessageBox.success(
																	this.oMsgNumOffer, {
																		actions: [sap.m.MessageBox.Action.OK],
																		onClose: function (sAction) {

																			this.closeBusyDialog();
																			// this.backToIndex();
																			this.commoditiesData(aResults[0].HCP_OFFER_ID);

																		}.bind(this)
																	}
																);
															}

														}
													}
												}

											}.bind(this),
											error: function (error) {
												MessageBox.error(
													this.resourceBundle.getText("sucessOfferMap"), {
														actions: [sap.m.MessageBox.Action.OK],
														onClose: function (sAction) {
															this.hasFinished = true;
															this.closeBusyDialog();
															this.backToIndex();
														}.bind(this)
													}
												);
											}
										});
									}.bind(this));
								}.bind(this));
							}.bind(this));
						}.bind(this),
						error: function () {
							this.hasFinished = true;
							MessageBox.success(
								this.resourceBundle.getText("errorOfferMap"), {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
									}.bind(this)
								}
							);
						}.bind(this)
					});
				} else {
					oModel.submitChanges({
						groupId: "changes",
						success: function () {
							this.hasFinished = true;

							if (localStorage.getItem("countStorageOfferMap")) {
								localStorage.setItem("countStorageOfferMap", (parseInt(localStorage.getItem("countStorageOfferMap")) + 1));
							} else {
								localStorage.setItem("countStorageOfferMap", 1);
							}

							MessageBox.success(
								this.resourceBundle.getText("sucessOfferMap"), {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
										// this.backToIndex();
										this.commoditiesData(null);
									}.bind(this)
								}
							);
						}.bind(this),
						error: function () {
							this.hasFinished = true;
							MessageBox.error(
								this.resourceBundle.getText("errorOfferMap"), {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
									}.bind(this)
								}
							);
						}.bind(this)
					});
				}

			}.bind(this));

		},
		verifyTimeOut: function (isFirstTime) {

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

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
						if (this.count > 120) {
							if (bIsMobile) {
								if (localStorage.getItem("countStorageOfferMap")) {
									localStorage.setItem("countStorageOfferMap", (parseInt(localStorage.getItem("countStorageOfferMap")) + 1));
								} else {
									localStorage.setItem("countStorageOfferMap", 1);
								}
							}

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

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if (bIsMobile) {

				var message;

				if (localStorage.getItem("countStorageOfferMap") > 1) {
					message = 'Você possui ' + localStorage.getItem("countStorageOfferMap") +
						' ofertas criadas, acesse o app e atualize a interface!';
				} else {
					message = 'Você possui ' + localStorage.getItem("countStorageOfferMap") +
						' oferta criada, acesse o app e atualize a interface!';
				}

			}
			localStorage.setItem("isNeededToReload", true);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("errorPages.timeOutConnection", true);
		},
		sendMail: function (results, oMsgNumOffer, screen) {

			var oModel = this.getView().getModel();
			var modelScreen = this.getView().getModel("offerMapFormModel");
			var dataResults = results; //[0].HCP_OFFER_ID
			var mailTo = [];

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			//modelScreen.oData.HCP_VOLUME
			//modelScreen.oData.HCP_DATE_START
			//modelScreen.oData.HCP_DATE_END

			var dateObjectStart = new Date(modelScreen.oData.HCP_DATE_START);
			var dateObjectEnd = new Date(modelScreen.oData.HCP_DATE_END);

			oModel.read("/User_Logistics", {
				success: function (results) {

					var aResults = results.results;

					if (aResults.length === 0) {
						MessageBox.success(
							oMsgNumOffer, {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {

									screen.closeBusyDialog();
									// this.backToIndex();
									screen.commoditiesData(dataResults[0].HCP_OFFER_ID);

								}.bind(this)
							}
						);
					} else {

						for (var i = 0; i < aResults.length; i++) {
							var aData = {
								email: aResults[i].HCP_EMAIL
							};

							mailTo.push(aData);

							if (i == aResults.length - 1) {

								var mensagem;

								if (modelScreen.oData.yesPartner) {
									//é fornecedor 
									mensagem = "<b>Olá</b>,<p>Existe cotação de frete pendente de resposta no sistema APP Grãos.</p><p><b>Oferta:</b> " +
										dataResults[
											0].HCP_OFFER_ID + "</p><p><b>Fornecedor:</b> " + dataResults[0].HCP_PARTNER + " - " + modelScreen.oData.PROVIDER_DESC +
										"</p><p><b>Volume (T):</b> " + modelScreen.oData.HCP_VOLUME + "</p><p><b>Período:</b> " + dateObjectStart.toLocaleDateString() +
										" - " +
										dateObjectEnd.toLocaleDateString() + "</p><p><b>Origem:</b> " + this.getView().byId("localOrigin").getValue() +
										"</p><p><b>Observação:</b> " + modelScreen.oData.HCP_OTHER_LOCAL + "</p>";
								} else {
									//prospect
									mensagem = "<b>Olá</b>,<p>Existe cotação de frete pendente de resposta no sistema APP Grãos.</p><p><b>Oferta:</b> " +
										dataResults[
											0].HCP_OFFER_ID + "</p><p><b>Prospect:</b> " + this.getView().byId("yesProspect").getValue() + "</p><b>Volume (T):</b> " +
										modelScreen.oData
										.HCP_VOLUME + "</p><p><b>Período:</b> " + dateObjectStart.toLocaleDateString() + " - " + dateObjectEnd.toLocaleDateString() +
										"</p><p><b>Origem:</b> " + this.getView().byId("localOrigin").getValue() + "</p><p><b>Observação:</b> " + modelScreen.oData
										.HCP_OTHER_LOCAL +
										"</p>";
								}

								var payload = {
									"personalizations": [{
										"to": mailTo,
										"subject": "Cotação de Frete App Grãos"
									}],
									"from": {
										"email": "no-reply@appgraosfrete.brfmail.com"
									},
									"content": [{
										"type": "text/html",
										"value": mensagem
									}]
								};

								var jsonDados = JSON.stringify(payload);
								var sUrl;

								if (bIsMobile) {
									sUrl = "https://api.sendgrid.com/v3/mail/send";
								} else {
									sUrl = "/APPGRAOSMAIL/mail/send";
								}

								oModel.read("/Token_SendGrid", {
									success: function (oResults) {
										if (oResults.results.length > 0) {
											let authToken = "Bearer " + oResults.results[0].HCP_TOKEN;
											let headersToken = {
												"Authorization": authToken
											};

											$.ajax({
												url: sUrl,
												headers: headersToken,
												type: 'POST',
												contentType: "application/json",
												dataType: "json",
												data: jsonDados,
												success: function (data) {

													MessageBox.success(
														oMsgNumOffer, {
															actions: [sap.m.MessageBox.Action.OK],
															onClose: function (sAction) {

																screen.closeBusyDialog();
																// this.backToIndex();
																screen.commoditiesData(dataResults[0].HCP_OFFER_ID);

															}.bind(this)
														}
													);

													console.log(data);
												},
												error: function (error) {
													console.log(error);

													if (error.status == 202) {
														MessageBox.success(
															oMsgNumOffer, {
																actions: [sap.m.MessageBox.Action.OK],
																onClose: function (sAction) {

																	screen.closeBusyDialog();
																	// this.backToIndex();
																	screen.commoditiesData(dataResults[0].HCP_OFFER_ID);

																}.bind(this)
															}
														);
													} else {
														MessageBox.success(
															oMsgNumOffer + ". Houve um erro ao enceminhar e-mail de confirmação", {
																actions: [sap.m.MessageBox.Action.OK],
																onClose: function (sAction) {

																	screen.closeBusyDialog();
																	// this.backToIndex();
																	screen.commoditiesData(idOffer);

																}.bind(this)
															}
														);
													}

												},
												async: true

											});
										} else {
											//Mensagem sem token
										}
									}.bind(this),
									error: function () {
										console.log("Falha ao Buscar Token");
									}
								});

							}

						}

					}

				}.bind(this),
				error: function (error) {
					reject(error);
				}
			});

		},

		//Pacote de melhorias 02/06/2022 adicionado filtro para condições de pagamento dinamico. 
		_handlePaymentTermFilterPress: function (oEvent) {
			var oFilterBar;
			//	var sId = oEvent.getSource().sId;

			if (!this.oPaymentTermFilter || this.oPaymentTermFilter.bIsDestroyed) {
				this.oPaymentTermFilter = sap.ui.xmlfragment("paymentTermFilterID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.offerMap.fragments.PaymentTermsFilter", this);
				this.getView().addDependent(this.oPaymentTermFilter);
				oFilterBar = sap.ui.core.Fragment.byId("paymentTermFilterID" + this.getView().getId(), "fbPaymentTerm");
				oFilterBar.attachBrowserEvent("keyup", jQuery.proxy(function (e) {
					if (e.which === 13) {
						this._onPaymentTermApplySearch();
					}
				}, this));
			}

			this.oPaymentTermFilter.open();
		},

		_onPaymentTermApplySearch: function (oEvent) {
			var oList = sap.ui.core.Fragment.byId("paymentTermFilterID" + this.getView().getId(), "paymentTermListID");
			var oFilterBar = sap.ui.core.Fragment.byId("paymentTermFilterID" + this.getView().getId(), "fbPaymentTerm");
			var oFilters = this._getPaymentTermFilters(oFilterBar);

			oList.getBinding("items").filter(oFilters);
		},

		onPaymentTermSelected: function (oEvent) {
			var oSource = oEvent.getSource();

			var oModel = this.getView().getModel("offerMapFormModel");
			var oData = oModel.getProperty("/");
			var SelectedPaymentTerm = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

			oData["HCP_ZTERM"] = SelectedPaymentTerm.ZTERM;
			oData["HCP_TEXT1"] = SelectedPaymentTerm.TEXT1;
			oModel.refresh();
			this.oPaymentTermFilter.destroy();

		},

		_getPaymentTermFilters: function (oFilterBar) {
			var aFilterItems = oFilterBar.getAllFilterItems();
			var aFilters = [];
			for (var i = 0; i < aFilterItems.length; i++) {
				aFilters.push(new sap.ui.model.Filter({
					path: aFilterItems[i].getName(),
					operator: sap.ui.model.FilterOperator.Contains,
					value1: oFilterBar.determineControlByFilterItem(aFilterItems[i]).getValue()
				}));
			}
			return aFilters;
		},

		onPaymentTermDialogClose: function () {
			this.oPaymentTermFilter.close();
		}

	});

}, /* bExport= */ true);