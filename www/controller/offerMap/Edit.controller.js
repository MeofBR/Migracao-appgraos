sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	'jquery.sap.global',
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/List',
	'sap/m/StandardListItem',
	"sap/ui/core/routing/History",
	'com/sap/build/standard/brfAppDeGraosModoEditar/controls/CustomComboBox'
], function (MainController, jQuery, MessageBox, JSONModel, Button, Dialog, List, StandardListItem, History, CustomComboBox) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.offerMap.Edit", {

		onInit: function () {

			var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
			var sLocale = sCurrentLocale.split("-");
			var oLocale = new sap.ui.core.Locale(sLocale[0], sLocale[1]);
			// this.oNumberFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance(oLocale);
			this.oNumberFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance("usd");
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("offerMap.Edit").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableConfirm: false,
				yesCommodities: false,
				errorMaterial: false,
				errorFreight: false,
				erroValidDate: false,
				checkTpCompra: false,
				checkMat: false,
				checkActive: false,
				checkPreco: false,
				checkCereal: false,
				yesProspect: false,
				yesPartner: true,
				yesLifnr: true,
				partnerProspect: this.resourceBundle.getText("textVendor"),
				paymentEditable: true,
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
				visibleCancel: true,
				visibleReactivate: false,
				visibleExcluir: true,
				enabledEdit: true,
				enabledFreight: false,
				localeId: this.oNumberFormat.oLocale.sLocaleId,
				sPathOption: "OfferMap",
				HCP_WAREHOUSE: "1",
				HCP_PARTNER_TYPE: "1",
				HCP_MODALITY: "1",
				HCP_INCOTERM: "1",
				HCP_MOEDA: "BRL",
				HCP_UM: "SC",
				inputCenter: [],
				ItemStates: [],
				ItemLocal: [],
				oCenterOld: [],
				tableCompras: [],
				tablePriceWerks: [],
				tableProspect: [],
				calculatePrice: false,
				buttonCancel: this.resourceBundle.getText("buttonCancelOffer"),
				enableEditPurchaseOrgValid: true,
				enableCancel: true
			}), "editOfferMapFormModel");

			var oModelOwner = this.getOwnerComponent().getModel();
			oModelOwner.refresh(true);

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				create: true,
				edit: true
			}), "profileModel");

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isVisible: false
			}), "appModelVisible");

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isVisiblePlayers: false
			}), "appModelVisible");
		},

		handleRouteMatched: function (oEvent) {

			this.count = 0;
			this.revertCount = 120;
			this.hasFinished = false;
			this.hasFreight = false;
			this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText("messageLoadingPleaseWait"));
			this.clearContainers("newCenterSimpleForm").then(function () {}.bind(this));

			this.getView().getModel("editOfferMapFormModel").setData({
				enableConfirm: false,
				yesCommodities: false,
				errorMaterial: false,
				errorFreight: false,
				erroValidDate: false,
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
				visibleCancel: true,
				visibleReactivate: false,
				visibleExcluir: true,
				enabledEdit: true,
				enabledFreight: false,
				localeId: this.oNumberFormat.oLocale.sLocaleId,
				sPathOption: "OfferMap",
				HCP_WAREHOUSE: "1",
				HCP_PARTNER_TYPE: "1",
				HCP_MODALITY: "1",
				HCP_INCOTERM: "1",
				HCP_MOEDA: "BRL",
				HCP_UM: "SC",
				inputCenter: [],
				ItemStates: [],
				ItemLocal: [],
				oCenterOld: [],
				tableCompras: [],
				tablePriceWerks: [],
				tableProspect: [],
				calculatePrice: false,
				buttonCancel: this.resourceBundle.getText("buttonCancelOffer"),
				enableEditPurchaseOrgValid: true,
				enableCancel: true,
				requiredPrice: true
			});

			var oModel = this.getView().getModel();
			var oEditModel = this.getView().getModel("editOfferMapFormModel");
			var oData = oEditModel.oData;

			if (oEvent.getParameter("data")) {
				var sPathKeyData = oEvent.getParameter("data").keyData;
				var aKeyData = oModel.getProperty(decodeURIComponent(sPathKeyData));
				aKeyData = JSON.parse(JSON.stringify(aKeyData));

				aKeyData.HCP_DATE_END = new Date(aKeyData.HCP_DATE_END);
				aKeyData.HCP_DATE_START = new Date(aKeyData.HCP_DATE_START);
				aKeyData.HCP_CREATED_AT = new Date(aKeyData.HCP_CREATED_AT);
				aKeyData.HCP_UPDATED_AT = new Date(aKeyData.HCP_UPDATED_AT);
				aKeyData.HCP_CREATED_AT_OFFER = new Date(aKeyData.HCP_CREATED_AT_OFFER);

				aKeyData["sPathOption"] = oEvent.getParameter("data").option;

				for (var key in aKeyData) {
					oData[key] = aKeyData[key];
				}

				this.sOperation = oEvent.getParameter("data").operation;
				if (this.sOperation == 'View') {
					oData.enabledEdit = false;
					oData.enabledLocal = false;
					oData.enableCancel = false;
					oData.enableConfirm = false;
					oEditModel.setProperty("/enabledLocal", false);

				} else {
					oData.enabledEdit = true;
				}
			}

			oEditModel.setProperty("/", oData);

			this.getUser().then(function (userName) {
				this.userName = userName;

				this.checkUserInfo(this.userName).then(function (userArray) {
					if (userArray) {
						this.werks_d = userArray.WERKS_D;
					}

					this._getCenter().then(function () {
						this._getParameters().then(function () {

							this.getPriceKm();

							this._setProperties().then(function () {

								oEditModel.setProperty("/messageBox", true);
								oEditModel.setProperty("/edit", false);

								//Finalizado ou Cancelado
								if (oEditModel.oData.HCP_STATES_OFFER == "3" || oEditModel.oData.HCP_STATES_OFFER == "4") {
									oEditModel.setProperty("/enabledEdit", false);
									oEditModel.setProperty("/enabledBland", false);
									oEditModel.setProperty("/enabledLocal", false);
									oEditModel.setProperty("/visibleCancel", false);
									oEditModel.setProperty("/enabledFreight", false);
									oEditModel.setProperty("/visibleConfirm", false);
									oEditModel.setProperty("/visibleExcluir", false);
									oEditModel.setProperty("/yesCommodities", false);

									if (oEditModel.oData.HCP_STATES_OFFER == "4") {
										oEditModel.setProperty("/visibleReactivate", true);
										oEditModel.setProperty("/paymentEditable", false);
									}

								}

								if (oEditModel.oData.sPathOption === "Freight") {
									oEditModel.setProperty("/enabledBland", false);
									oEditModel.setProperty("/enabledEdit", false);
									oEditModel.setProperty("/enabledLocal", false);
									oEditModel.setProperty("/visibleCancel", false);
									oEditModel.setProperty("/enabledFreight", true);
									oEditModel.setProperty("/visibleExcluir", false);
								}

								var aInputCenter = oEditModel.oData.inputCenter;

								for (var item of aInputCenter) {
									if (item.HCP_QUOTATION_FREIGHT == '1') {
										oEditModel.setProperty("/yesRequiredLocal", true);
									}
								}

								this._getHistoricOffer().then(function () {
									this.getUserProfile("View_Profile_Offer_Map", this.userName).then(profileData => {
										this.getView().getModel("profileModel").setProperty("/", profileData);
										this.checkPurchaseOrg();
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
			}.bind(this));

		},

		checkPurchaseOrg: function () {
			var oOfferMapModel = this.getView().getModel("editOfferMapFormModel");
			var oProfileModel = this.getView().getModel("profileModel");
			var oProfileData = oProfileModel.getData();
			var sEkorg = oOfferMapModel.getData().HCP_EKORG;

			if (sEkorg) {
				if (oProfileData.ekorg.filter(ekorg => ekorg.EKORG == sEkorg || ekorg.VALOR == '*').length > 0 || oProfileData.fullAccess) {
					oOfferMapModel.setProperty("/enableEditPurchaseOrgValid", true);
				} else {
					oOfferMapModel.setProperty("/enableEditPurchaseOrgValid", false);
				}
			} else {
				oOfferMapModel.setProperty("/enableEditPurchaseOrgValid", true);
			}

			this._validateForm();
		},

		_getHistoricOffer: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var oEditModel = this.getView().getModel("editOfferMapFormModel");
				var oData = oEditModel.oData;
				var aFilters = [];

				//Em Aberto - Comp.Parcial - Erro
				if (oData.HCP_STATES_OFFER == "1" || oData.HCP_STATES_OFFER == "2" || oData.HCP_STATES_OFFER == "5") {

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_UNIQUE_KEY_OFFER',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_UNIQUE_KEY
					}));

					this.oMengeDispOffer = oData.HCP_VOLUME;

					oModel.read("/Commodities_Historic_Offer", {
						filters: aFilters,
						success: function (result) {

							var aResults = result.results;

							if (aResults.length > 0) {

								var aResults = result.results;

								for (var i = 0; i < aResults.length; i++) {

									this.oMengeDispOffer = this.oMengeDispOffer - aResults[i].HCP_MENGE;

								}

								if (oEditModel.HCP_STATES_OFFER = "2") {
									oEditModel.setProperty("/HCP_VOLUME_COMMERCIALIZED", parseFloat(oData.HCP_VOLUME) - parseFloat(this.oMengeDispOffer));
									oEditModel.setProperty("/HCP_VOLUME_FINAL", this.oMengeDispOffer);
								}

								oEditModel.setProperty("/buttonCancel", this.resourceBundle.getText("buttonFinish"));
								oEditModel.setProperty("/enabledEdit", false);
								oEditModel.setProperty("/enabledBland", false);
								oEditModel.setProperty("/visibleCancel", true);
								oEditModel.setProperty("/enabledFreight", false);
								oEditModel.setProperty("/visibleConfirm", true);
								oEditModel.setProperty("/visibleExcluir", false);
								oEditModel.setProperty("/visibleReactivate", false);

								if (this.oMengeDispOffer == 0) {
									oEditModel.setProperty("/yesCommodities", false);
									oEditModel.setProperty("/enabledLocal", false);

									var oMessage = this.resourceBundle.getText("messageNotCommodities") + this.resourceBundle.getText(
										"messageSucessQuantityOffer");
									oEditModel.setProperty("/errorFreight", true);
									oEditModel.setProperty("/messageFreight", oMessage);
								} else {
									oEditModel.setProperty("/yesCommodities", true);

									oEditModel.setProperty("/enabledLocal", true);
								}

							}

							resolve();

						}.bind(this),
						error: function () {
							reject(error);
						}
					});

				} else {
					resolve();
				}

			}.bind(this));

		},

		_getTvarvSap: function (oType, oName, oLow, oProperty) {

			return new Promise(function (resolve, reject) {

				var oModelCommodities = this.getView().getModel();
				var oModel = this.getView().getModel("editOfferMapFormModel");
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

		_setProperties: function () {

			return new Promise(function (resolve, reject) {

				var oEditModel = this.getView().getModel("editOfferMapFormModel");
				var oData = oEditModel.oData;

				if (oData["@com.sap.vocabularies.Offline.v1.isLocal"]) {
					oEditModel.setProperty("/HCP_OFFER_NUMBER", "Registro Offline");
				} else {
					oEditModel.setProperty("/HCP_OFFER_NUMBER", oData.HCP_OFFER_ID);
				}

				if (oData.HCP_MODALITY == 1) { //Fixo
					oEditModel.setProperty("/requiredPrice", true);
					oEditModel.setProperty("/yesDeposit", false);
					oEditModel.setProperty("/yesOthersDep", false);

				} else { //Depósito
					oEditModel.setProperty("/requiredPrice", false);
					oEditModel.setProperty("/yesDeposit", true);

					if (oData.HCP_DEPOSIT_TYPE == 6) {
						oEditModel.setProperty("/yesOthersDep", true);
					} else {
						oEditModel.setProperty("/yesOthersDep", false);
					}

				}

				var oDate = new Date();

				if (oData.HCP_DATE_START.getFullYear() < oDate.getFullYear() || //Ano Menor
					(oData.HCP_DATE_START.getFullYear() <= oDate.getFullYear() && oData.HCP_DATE_START.getMonth() < oDate.getMonth())) { //Ano menor igual e mês menor
					oEditModel.setProperty("/erroValidDate", true);
					oEditModel.setProperty("/HCP_CREATE_OFFER", "2");
				} else {
					oEditModel.setProperty("/erroValidDate", false);
				}

				if (oData.HCP_WAREHOUSE == 1) { //Próprio
					oEditModel.setProperty("/yesTerceiro", false);
					oEditModel.setProperty("/yesLocalItem", true);
					oEditModel.setProperty("/yesBlandItem", true);
					oEditModel.setProperty("/yesBlandView", false);
				} else { //Terceiro
					oEditModel.setProperty("/yesTerceiro", true);
					oEditModel.setProperty("/yesLocalItem", false);
					oEditModel.setProperty("/yesBlandItem", false);
					oEditModel.setProperty("/yesBlandView", true);
				}

				if (oData.HCP_INCOTERM == 1 || oData.HCP_INCOTERM == 3) { //CIF
					oEditModel.setProperty("/yesFob", false);
					oEditModel.setProperty("/yesCif", true);
					oEditModel.setProperty("/yesBlandItem", false);
					oEditModel.setProperty("/yesBlandView", false);
					oEditModel.setProperty("/yesCalculator", false);
					oEditModel.setProperty("/noCalculator", false);
					oEditModel.setProperty("/yesCommodities", true);
				} else { //FOB
					oEditModel.setProperty("/yesFob", true);
					oEditModel.setProperty("/yesCif", false);

					if (this.sFreightCalculator === "X") {
						oEditModel.setProperty("/yesCalculator", true);
						oEditModel.setProperty("/noCalculator", false);
					} else {
						oEditModel.setProperty("/noCalculator", true);
						oEditModel.setProperty("/yesCalculator", false);

					}
				}

				this._getProspect().then(function () {
					this._searchCanceReasonName().then(function () {
							
				
					if (oData.HCP_PARTNER_TYPE == 1) { //Fornecedor

						oEditModel.setProperty("/yesProspect", false);
						oEditModel.setProperty("/yesPartner", true);

						this._searchPartnerName().then(function (result) {
							this._onInputPartner(result, false).then(function () {
								resolve();

							}.bind(this));
						}.bind(this));
					} else { //Prospect

						oEditModel.setProperty("/yesProspect", true);
						oEditModel.setProperty("/yesPartner", false);
						resolve();
					}

					if (this.sFreightCalculator == "") {
						oEditModel.setProperty("/yesBlandItem", false);
						oEditModel.setProperty("/yesBlandView", false);
					}

					}.bind(this));
				}.bind(this));
			}.bind(this));
		},

		_getGrainMaterial: function (oMaterial) {

			return new Promise(function (resolve, reject) {

				var oModelCommodities = this.getView().getModel();
				var oModel = this.getView().getModel("editOfferMapFormModel");
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

				var oModel = this.getView().getModel("editOfferMapFormModel");
				var oData = oModel.oData;
				var oArrayCenter = [];

				oModel.setProperty("/messageMaterial", null);
				oModel.setProperty("/errorMaterial", false);

				if (oMaterial && oData.yesLifnr == true && oData.HCP_MODALITY == "1" && oData.erroValidDate == false) {

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
					resolve();
				}

			}.bind(this));

		},

		_getPriceTypeMaterial: function () {

			return new Promise(function (resolve, reject) {

				var oModelCommodities = this.getView().getModel();
				var oModel = this.getView().getModel("editOfferMapFormModel");
				var oData = oModel.oData;
				var aFilters = [];

				oModel.setProperty("/tablePriceWerks", []);

				if (oData.HCP_EKGRP && oData.HCP_MATNR && oData.HCP_TPCEREAL && oData.HCP_DATE_START) {

					var oDay = new Date().getUTCDate();
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
		_getParameters: function () {

			return new Promise(function (resolve, reject) {
				var oModelOffer = this.getView().getModel();
				var oModel = this.getView().getModel("editOfferMapFormModel");
				var oData = oModel.oData;
				var aFilters = [];
				this.sFreightCalculator = "";

				if (oData.HCP_STATES_OFFER !== "3" && oData.HCP_STATES_OFFER !== "4") {

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

							if (this.sFreightCalculator === "X" && oData.HCP_INCOTERM == "2") { //FOB
								oModel.setProperty("/yesCalculator", true);
								oModel.setProperty("/noCalculator", false);
							} else {
								oModel.setProperty("/yesCalculator", false);
								oModel.setProperty("/noCalculator", true);
								oModel.setProperty("/yesBlandItem", false);
								oModel.setProperty("/yesBlandView", false);
							}

							resolve();

						}.bind(this),
						error: function (error) {
							reject(error);
						}
					});

				} else {

					if (oData.HCP_PRICE_FREIGHT != 0) {
						this.sFreightCalculator = "X";
					} else {
						this.sFreightCalculator = "";
					}
					resolve();
				}

			}.bind(this));

		},

		_getCenter: function () {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getView().getModel();
				var oEditModel = this.getView().getModel("editOfferMapFormModel");
				var oData = oEditModel.oData;
				var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
				var oCharTemplate;
				var aFilters = [];

				oEditModel.setProperty("/inputCenter", []);

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_UNIQUE_KEY
				}));

				oModelOffer.read("/Offer_Map_Werks", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;
						this.oPriceFob = parseFloat(aResults[0].HCP_PRICE_FOB);

						for (var i = 0; i < aResults.length; i++) {

							oCharTemplate = this.buildCenterTemplate();

							oMainDataForm[57].addContent(new sap.m.Label({
								text: ""
							}));
							oMainDataForm[57].addContent(oCharTemplate);

							oEditModel.setProperty("/inputCenter/" + i + "/status", "Edit");
							oEditModel.setProperty("/inputCenter/" + i + "/HCP_UNIQUE_KEY", aResults[i].HCP_UNIQUE_KEY);
							oEditModel.setProperty("/inputCenter/" + i + "/HCP_UNIQUE_KEY_WERKS", aResults[i].HCP_UNIQUE_KEY_WERKS);
							oEditModel.setProperty("/inputCenter/" + i + "/HCP_WERKS", aResults[i].HCP_WERKS);
							oEditModel.setProperty("/inputCenter/" + i + "/WERKS", aResults[i].HCP_WERKS);
							oEditModel.setProperty("/inputCenter/" + i + "/HCP_BLAND", aResults[i].HCP_BLAND);
							oEditModel.setProperty("/inputCenter/" + i + "/HCP_PAVED", aResults[i].HCP_PAVED);
							oEditModel.setProperty("/inputCenter/" + i + "/HCP_QUOTATION_FREIGHT", aResults[i].HCP_QUOTATION_FREIGHT);
							oEditModel.setProperty("/inputCenter/" + i + "/HCP_STATES_FREIGHT", aResults[i].HCP_STATES_FREIGHT);

							if (aResults[i].HCP_QUOTATION_FREIGHT == "1") {
								if (aResults[i].HCP_STATES_FREIGHT == "1") {
									oEditModel.setProperty("/inputCenter/" + i + "/HCP_DESC_STATES_FREIGHT", this.resourceBundle.getText("textOpened"));
								} else {
									oEditModel.setProperty("/inputCenter/" + i + "/HCP_DESC_STATES_FREIGHT", this.resourceBundle.getText("textFinished"));
								}
							}

							oEditModel.setProperty("/inputCenter/" + i + "/HCP_USER_LOGISTICS", aResults[i].HCP_USER_LOGISTICS);
							oEditModel.setProperty("/inputCenter/" + i + "/HCP_LOGISTICS_FREIGHT", parseFloat(aResults[i].HCP_LOGISTICS_FREIGHT));
							oEditModel.setProperty("/inputCenter/" + i + "/HCP_PRICE_OFFER", parseFloat(aResults[i].HCP_PRICE_OFFER));
							oEditModel.setProperty("/inputCenter/" + i + "/HCP_PRICE_FOB", parseFloat(aResults[i].HCP_PRICE_FOB));
							oEditModel.setProperty("/inputCenter/" + i + "/HCP_DISTANCE", parseFloat(aResults[i].HCP_DISTANCE));
							oEditModel.setProperty("/inputCenter/" + i + "/HCP_PRICE_FREIGHT", parseFloat(aResults[i].HCP_PRICE_FREIGHT));
							oEditModel.setProperty("/inputCenter/" + i + "/HCP_TRECHO_KM", parseFloat(aResults[i].HCP_TRECHO_KM));
							oEditModel.setProperty("/inputCenter/" + i + "/HCP_PRICE_CALC_FREIGHT", parseFloat(aResults[i].HCP_PRICE_CALC_FREIGHT));
							oEditModel.setProperty("/inputCenter/" + i + "/HCP_PRICE_FINAL", parseFloat(aResults[i].HCP_PRICE_FINAL));
							oEditModel.setProperty("/inputCenter/" + i + "/HCP_PRICE_BRF", parseFloat(aResults[i].HCP_PRICE_BRF));

							if (oData.HCP_INCOTERM == "2") { //FOB

								if (aResults[i].HCP_PRICE_CALC_FREIGHT == 0 && this.sFreightCalculator == "X") {
									oEditModel.setProperty("/inputCenter/" + i + "/noPricesCalculator", true);
								} else {
									oEditModel.setProperty("/inputCenter/" + i + "/noPricesCalculator", false);
								}

								if (aResults[i].HCP_QUOTATION_FREIGHT == 1) {
									oEditModel.setProperty("/inputCenter/" + i + "/yesFreight", true);
								} else {
									oEditModel.setProperty("/inputCenter/" + i + "/yesFreight", false);
								}

								if (aResults[i].HCP_LOGISTICS_FREIGHT != 0) {
									oEditModel.setProperty("/inputCenter/" + i + "/enabledQuotation", false);
								} else {
									oEditModel.setProperty("/inputCenter/" + i + "/enabledQuotation", true);
								}

								if (aResults[i].HCP_PRICE_FREIGHT != 0) {
									oEditModel.setProperty("/yesCalculator", false);
									oEditModel.setProperty("/noCalculator", true);
									oEditModel.setProperty("/inputCenter/" + i + "/enabledQuotation", false);
								} else {
									oEditModel.setProperty("/yesCalculator", true);
									oEditModel.setProperty("/noCalculator", false);
								}

								if (oEditModel.oData.sPathOption === "Freight" ||
									aResults[i].HCP_STATES_FREIGHT == "3" ||
									oEditModel.oData.HCP_STATES_OFFER != "1") {
									oEditModel.setProperty("/inputCenter/" + i + "/enabledQuotation", false);
								}

								if (aResults[i].HCP_PAVED == 1) { //Trecho Pavimentado
									oEditModel.setProperty("/inputCenter/" + i + "/yesPaved", true);
								}

							} else { //CIF
								oEditModel.setProperty("/inputCenter/" + i + "/yesPaved", false);
								oEditModel.setProperty("/inputCenter/" + i + "/yesFreight", false);
								oEditModel.setProperty("/inputCenter/" + i + "/enabledQuotation", false);
							}

							if (aResults[i].HCP_PRICE_BRF == 0) {
								oEditModel.setProperty("/inputCenter/" + i + "/noPriceBRF", true);
							} else {
								oEditModel.setProperty("/inputCenter/" + i + "/noPriceBRF", false);
							}

							if (oEditModel.oData.HCP_PARTNER_TYPE == '2') { //Prospect
								this._calculatePriceFreight(oEditModel.oData.inputCenter[i]).then(function () {}.bind(this));
							}

							if (aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
								oEditModel.setProperty("/inputCenter/" + i + "/@com.sap.vocabularies.Offline.v1.isLocal", true);
								oEditModel.setProperty("/inputCenter/" + i + "/__metadata", aResults[i].__metadata);
							}

						}

						oEditModel.refresh();
						resolve();

					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));

		},

		_searchPartnerName: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var oEditModel = this.getView().getModel("editOfferMapFormModel");
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_REGISTER',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oEditModel.oData.HCP_PARTNER
				}));

				oEditModel.setProperty("/enabledBland", false);

				oModel.read("/View_Grouping_Suppliers", {

					filters: aFilters,

					success: function (result) {

						if (result.results.length > 0) {
							oEditModel.setProperty("/PROVIDER_DESC", result.results[0].NAME1);
						}

						resolve(result.results[0]);

					}.bind(this),
					error: function () {
						reject(error);
					}
				});

			}.bind(this));

		},
		
		_searchCanceReasonName: function () {

			return new Promise(function (resolve, reject) {
	
				var oModel = this.getView().getModel();
				var oEditModel = this.getView().getModel("editOfferMapFormModel");
				var aFilters = [];
				
					if(oEditModel.oData.HCP_CANCEL_REASON){
						
						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_ID',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oEditModel.oData.HCP_CANCEL_REASON
						}));
						
						oModel.read("/Cancellation_Reason", {
		
						filters: aFilters,
		
						success: function (result) {
		
							if (result.results.length > 0) {
								oEditModel.setProperty("/HCP_CANCELLATION_REASON", result.results[0].HCP_DESC);
								resolve(result.results[0]);
							}else{
								oEditModel.setProperty("/HCP_CANCELLATION_REASON", "");
								resolve();
							}
		
						}.bind(this),
						error: function () {
							reject();
						}
					});
				}else{
					resolve();
				}
			}.bind(this));

		},

		_getProspect: function () {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getView().getModel();
				var oEditModel = this.getView().getModel("editOfferMapFormModel");
				var oData = oEditModel.oData;
				var oDataItemLocal = oEditModel.getProperty("/ItemLocal");
				oDataItemLocal = [];
				var aFilters = [];
				var aSorters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_STATUS',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "1"
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_STATUS',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "2"
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_STATUS',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "5"
				}));

				aSorters.push(new sap.ui.model.Sorter({
					path: "NAME1",
					descending: false
				}));

				oEditModel.setProperty("/enabledBland", false);

				oModelOffer.read("/Prospects", {

					filters: aFilters,
					sorters: aSorters,

					success: function (results) {

						var aResults = results.results;
						var aProspectArray = aResults.filter(result => result.HCP_STATUS !== "5");
						var oDataItem = oEditModel.getProperty("/tableProspect");

						for (var i = 0; i < aProspectArray.length; i++) {

							oDataItem.push(aProspectArray[i]);

						}

						oEditModel.setProperty("/tableProspect", oDataItem);
						var aProspect = false;

						if (oData.HCP_PARTNER_TYPE == 2) { //Prospect

							aResults = aResults.filter(result => result.HCP_PROSP_ID === oData.HCP_PARTNER);

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

								oDataItem.push(aResults[0]);
								oEditModel.setProperty("/tableProspect", oDataItem);

								oDataItemLocal.push(aData);
								oEditModel.setProperty("/ItemLocal", oDataItemLocal);
								oEditModel.setProperty("/enabledLocal", false);
								oEditModel.setProperty("/HCP_LOCAL", aResults[0].HCP_PROSP_ID);
								oEditModel.setProperty("/enabledBland", false);
								oEditModel.setProperty("/HCP_BLAND", aResults[0].BLAND);

								if (aResults[0].LIFNR) {
									oEditModel.setProperty("/yesCommodities", true);
									oEditModel.setProperty("/LIFNR_PROSPECT", aResults[0].LIFNR);
								} else {
									oEditModel.setProperty("/yesCommodities", false);
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

								aProspect = true;

							}
						}

						//Em Aberto/Comprado Parcialmente/Erro
						if (oEditModel.oData.HCP_STATES_OFFER == "1" || oData.HCP_STATES_OFFER == "2" || oData.HCP_STATES_OFFER == "3") {
							this._getTvarvSap("P", "Z_Z586011_ATIVAR_REGRAS", null, 'checkActive').then(function () {
								this._validateMaterial(oData.HCP_MATNR).then(function () {

									if (aProspect == true) {
										this.getStatesOrigem(aFilters, true).then(function () {
											resolve();
										}.bind(this));
									} else {
										resolve();
									}

								}.bind(this));
							}.bind(this));
						} else {
							resolve();
						}

					}.bind(this),
					error: function () {
						reject();
					}
				});

			}.bind(this));

		},

		clearContainers: function (oContainerId) {

			return new Promise(function (resolve, reject) {

				var oCharDataFormContent = this.getView().byId(oContainerId).getContent();
				var oCharContainers = oCharDataFormContent.filter(control => control.getMetadata().getName() === "sap.m.VBox");

				if (oCharContainers.length > 0) {
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

		_valideInputFreight: function (oProperty) {

			var oEditModel = this.getView().getModel("editOfferMapFormModel");
			var oData = oEditModel.oData;
			var oPrice;

			oEditModel.setProperty("/HCP_USER_LOGISTICS", this.userName);

			var oSource = oProperty.getSource();
			var sValue;

			sValue = oProperty.mParameters.newValue;
			sValue = sValue.replace(/[^0-9,]/g, "");
			this.oNumberFormat.format(sValue);

			oSource.setValue(sValue);

			if (oData.HCP_FREIGHT) {

				if (oData.HCP_UM === 'SC') {
					oPrice = (oData.HCP_FREIGHT * 60) / 1000;
				} else {
					oPrice = oData.HCP_FREIGHT;
				}

				if (oData.HCP_PRICE_FOB) {
					oPrice = oPrice + oData.HCP_PRICE_FOB;
				}

			}

			oEditModel.setProperty("/HCP_PRICE_FINAL", oPrice);

		},

		_valideInputNumber: function (oProperty) {

			var oSource = oProperty.getSource();
			var sValue;

			sValue = oProperty.mParameters.newValue;
			sValue = sValue.replace(/[^0-9,]/g, "");

			if (sValue == "" || sValue == undefined || sValue == null)
				sValue = 0;

			oSource.setValue(sValue);

			this._valideVolumeCommercialed();
		},

		_valideVolumeCommercialed: function () {
			var oModel = this.getView().getModel("editOfferMapFormModel");
			var oData = oModel.oData;

			if (oData.HCP_STATES_OFFER == '2') {
				if (oData.HCP_VOLUME_COMMERCIALIZED > oData.HCP_VOLUME) {
					sap.m.MessageToast.show("Volume total nao pode ser menor que o volume já comercializado");
					oModel.setProperty("/enableConfirm", false);
				} else {
					this._validateForm();
				}
				oModel.setProperty("/HCP_VOLUME_FINAL", oData.HCP_VOLUME - oData.HCP_VOLUME_COMMERCIALIZED);
			} else
				this._validateForm();
		},

		_valideInputPrice: function (oProperty) {

			var oModel = this.getView().getModel("editOfferMapFormModel");
			var oData = oModel.oData;
			var oSource = oProperty.getSource();
			var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
			var oDataNewPrice = oModel.getProperty(sPath);
			var sValue;

			// sValue = oProperty.mParameters.newValue;
			// sValue = sValue.replace(/[^0-9,]/g, "");
			// this.oNumberFormat.format(sValue);

			var aField = oProperty.oSource.mProperties.name;
			// oDataNewPrice[aField] = parseFloat(sValue);
			// oDataNewPrice[aField] = sValue;
			// oSource.setValue(sValue);

			if (aField === "HCP_PRICE_FOB" && sPath === "/inputCenter/0") {
				// this.oPriceFob = parseFloat(sValue);
				this.oPriceFob = oData.inputCenter[0].HCP_PRICE_FOB;

				for (var i = 0; i < oData.inputCenter.length; i++) {

					oData.inputCenter[i].HCP_PRICE_FOB = this.oPriceFob;

					if (i != 0) {
						oData.inputCenter[i].enablePriceFob = true;
					}

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

			var oModel = this.getView().getModel("editOfferMapFormModel");
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

			if (oSource.getSelectedKey() === "1") {
				oDataNewQuotFreith.yesFreight = true;
				oDataNewQuotFreith.HCP_STATES_FREIGHT = "1";
				oDataNewQuotFreith.HCP_DESC_STATES_FREIGHT = this.resourceBundle.getText("textOpened");
			} else {
				oDataNewQuotFreith.yesFreight = false;
				oDataNewQuotFreith.HCP_STATES_FREIGHT = null;
				oDataNewQuotFreith.HCP_DESC_STATES_FREIGHT = null;
			}

			this._validateForm();

		},

		_onCancelOfferButton: function (oEvent) {

			var oCreateModelOffer = this.getView().getModel("editOfferMapFormModel");
			var oData = oCreateModelOffer.oData;

			this.sPath = this.buildEntityPath("Offer_Map", oData, "HCP_OFFER_ID");

			if (oData.HCP_STATES_OFFER == "2" || oData.HCP_STATES_OFFER == "5") { //Comprado Parcialmente ou Erro
				var oTextCancelOffer = this.resourceBundle.getText("buttonFinish") + ": " + oData.HCP_OFFER_ID;
				var oTextHeader = this.resourceBundle.getText("buttonFinish");
				var oTextCancelReason = this.resourceBundle.getText("textFinishReason");
			} else {
				oTextCancelOffer = this.resourceBundle.getText("buttonCancelOffer") + ": " + oData.HCP_OFFER_ID;
				oTextHeader = this.resourceBundle.getText("buttonCancelOffer");
				oTextCancelReason = this.resourceBundle.getText("textCancellationReason");
			}

			if (!this._FragmentCancelReason) {
				this._FragmentCancelReason = sap.ui.xmlfragment("cancelReasonEditFilterID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.offerMap.fragments.OfferCancelReason",
					this);
				
				var oModelCancel = new JSONModel({
					HCP_UNIQUE_KEY: oData.HCP_UNIQUE_KEY,
					HCP_MODALITY: oData.HCP_MODALITY,
					HCP_STATUS: oData.HCP_STATUS,
					HCP_CANCEL_REASON: "",
					HCP_PLAYERS: "",
					HCP_CANCEL_REASON_DESC: "",

					textHeader: oTextHeader,
					textCancelReason: oTextCancelReason,
					enabledConfir: false
				});

				this.getView().setModel(oModelCancel, "offerMapCancelFormModel");
				this.getView().addDependent(this._FragmentCancelReason);

			}

			this._FragmentCancelReason.setTitle(oTextCancelOffer);
			this._FragmentCancelReason.open();
			let oVisibleModel = this.getView().getModel("appModelVisible");
			this._FragmentCancelReason.setTitle(oTextCancelOffer);
			this._FragmentCancelReason.open();
				oVisibleModel.setProperty("/isVisible", false);
				oVisibleModel.setProperty("/isVisiblePlayers", false);
				oVisibleModel.setProperty("/isVisibleOthers", false);

		},

			selectedCombobox: function (oEvent) {
			let selectedItem = oEvent.getSource().getSelectedItem(); 
			let selectedKey = oEvent.getSource().getSelectedKey();
			let selectedText = selectedItem ? selectedItem.getText() : "";
			let oModel = this.getView().getModel("appModelVisible");
			let oModelEnable = this.getView().getModel("offerMapCancelFormModel");
			var oData = oModelEnable.oData;
			
			oModelEnable.setProperty("/HCP_CANCEL_REASON_DESC", "");

			if (selectedKey === '11') {
				oModel.setProperty("/isVisiblePlayers", true);
				oModel.setProperty("/isVisible", false);
				oModelEnable.setProperty("/enabledConfir", false);
				oModel.setProperty("/isVisibleOthers", false);
			} else {
				oModel.setProperty("/isVisibleOthers", false);
				oModel.setProperty("/isVisiblePlayers", false);
				oModel.setProperty("/isVisible", false);
				var oCancelModel = this.getView().getModel("offerMapCancelFormModel");
				oCancelModel.setProperty("/HCP_PLAYERS", null);
				if (oData.HCP_CANCEL_REASON.length > 0) {
					oModelEnable.setProperty("/enabledConfir", true);
				} else {
					oModelEnable.setProperty("/enabledConfir", false);
					return;
				}
			}
			
			if (selectedText == "outros") {
				oModel.setProperty("/isVisibleOthers", true);
				oModelEnable.setProperty("/enabledConfir", false);
			}

		},

		validateComboboxPlayer: function (oEvent) {

			let selectedItem = oEvent.getSource().getSelectedKey();
			let oModel = this.getView().getModel("appModelVisible");

			if (selectedItem !== "") {
				oModel.setProperty("/isVisible", true);
				oModel.setProperty("/isVisiblePlayers", true);

			} else {
				oModel.setProperty("/isVisible", false);
				oModel.setProperty("/isVisiblePlayers", true);
				return;
			}

		},

		validateComboboxPlayerOtherFields: function (oEvent) {
			let selectedItem = oEvent.getSource().getSelectedKey();
			let valueText = oEvent.getSource().getValue();
			let oModelCancel = this.getView().getModel("offerMapCancelFormModel");
			var oInput = oEvent.getSource();
			var oModel = this.getOwnerComponent().getModel();
			var oTable = sap.ui.core.Fragment.byId("cancelReasonFilterID" + this.getView().getId(), "region");
			var oFilters = [];

			var oData = oModelCancel.oData;
			if (selectedItem !== "" || valueText) {
				if (oData.HCP_CANCEL_REASON_DESC !== "" && oData.HCP_CROP !== null && oData.HCP_STATE !== null && oData.HCP_REGIO !== null && oData.HCP_STATE !== undefined && oData.HCP_REGIO !==
					undefined) {
					oModelCancel.setProperty("/enabledConfir", true);
				}
				
				if (oData.HCP_CANCEL_REASON_DESC !== "") {
					oModelCancel.setProperty("/enabledConfir", true);
				}

			} else {
				oModelCancel.setProperty("/enabledConfir", false);
				return;
			}
		},

		_onCancelPress: function (oEvent) {

			var oCancelModel = this.getView().getModel("offerMapCancelFormModel");
			let oVisibleModel = this.getView().getModel("appModelVisible");

			oCancelModel.setProperty("/enabledConfir", false);
			oCancelModel.setProperty("/HCP_CANCEL_REASON", null);
			oCancelModel.setProperty("/HCP_CANCEL_REASON_DESC", null);
			oCancelModel.setProperty("/HCP_CROP", null);
			oCancelModel.setProperty("/HCP_STATE", null);
			oCancelModel.setProperty("/HCP_REGIO", null);
			oCancelModel.setProperty("/HCP_PLAYERS", null);
			oVisibleModel.setProperty("/isVisible", false);
			oVisibleModel.setProperty("/isVisiblePlayers", false);
			oEvent.getSource().getParent().close();
		},

		_onConfirPress: function (oEvent) {

			var aUserName = this.userName;
			var oCancelModel = this.getView().getModel("offerMapCancelFormModel");
			var oCancelData = oCancelModel.getProperty("/");

			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var aDeferredGroups = oModel.getDeferredGroups();
			var aFilters = [];

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}

			if (oCancelData.HCP_STATUS == "2") { //Comprado Parcialmente
				var oStatusOffer = "3"; //Finalizado
				var oMessageSucess = this.resourceBundle.getText("sucessFinishfferMap");
				var oMessageError = this.resourceBundle.getText("errorCancelOfferMap");
			} else {
				oStatusOffer = "4"; //Cancelado
				oMessageSucess = this.resourceBundle.getText("sucessCancelOfferMap");
				oMessageError = this.resourceBundle.getText("errorFinishOfferMap");
			}

			var aData = {
				HCP_STATES_OFFER: oStatusOffer,
				HCP_CANCEL_REASON: oCancelData.HCP_CANCEL_REASON,
				HCP_CANCEL_REASON_DESC: oCancelData.HCP_CANCEL_REASON_DESC,
				HCP_PLAYERS: oCancelData.HCP_PLAYERS,
				HCP_UPDATED_BY: aUserName,
				HCP_UPDATED_AT: new Date()
			};

			oModel.update(this.sPath, aData, {
				groupId: "changes"
			});

			//Atualizar compras atreladas a oferta
			if (oCancelData.HCP_MODALITY == "1") { //Fixo
				var oEntity = "Commodities_Fixed_Order";
				var oField = "HCP_PURCHASE_ID";
				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_ZSEQUE",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: ""
				}));
			} else { //Depósito ou Transferência
				oEntity = "Commodities_Order";
				oField = "HCP_ORDER_ID";

			}

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_UNIQUE_KEY_OFFER",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oCancelData.HCP_UNIQUE_KEY
			}));

			//Cancelar compras nao efetivadas da oferta
			oModel.read("/" + oEntity, {

				filters: aFilters,
				success: function (results) {

					var aResults = results.results;

					for (var i = 0; i < aResults.length; i++) {

						var sPath = this.buildEntityPath(oEntity, aResults[i], oField);

						var aDataOrder = {
							HCP_STATUS: "3", //Compra Cancelada
							HCP_UPDATED_BY: aUserName,
							HCP_UPDATED_AT: new Date()
						};

						oModel.update(sPath, aDataOrder, {
							groupId: "changes"
						});

					}
					oModel.submitChanges({
						groupId: "changes",
						success: function () {
							if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
								//this.flushStore("Offer_Map, Offer_Map_Werks, Commodities_Fixed_Order, Commodities_Log_Messages, Commodities_Order, Cadence").then(function () {
								//this.refreshStore(aRefreshView).then(function () {
								if (oCancelModel.getProperty("/HCP_PLAYERS") != null && oCancelModel.getProperty("/HCP_PLAYERS") != "") {
									this.selectMessageBox(oMessageSucess, true);
								} else {
									this.selectMessageBox(oMessageSucess, false);
								}
								oCancelModel.setProperty("/HCP_PLAYERS", null);
								//}.bind(this));
								//}.bind(this));
							} else {
								MessageBox.success(
									oMessageSucess, {
										actions: [sap.m.MessageBox.Action.OK],
										onClose: function (sAction) {
											this.closeBusyDialog();
											var oTableModel = this.getView().getModel("filterTableOffer");
											oTableModel.setProperty("/ItemOffeMap", []);
											this._submitFilterOffer().then(function () {
												this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText(
													"messageLoadingPleaseWait"));
												this.getView().getModel().refresh(true);
												//this.getView().byId("pullToRefreshID").hide();
												this.closeBusyDialog();
											}.bind(this), 1000);
										}.bind(this)
									}
								);
							}
						}.bind(this),
						error: function () {
							MessageBox.error(
								oMessageError, {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
									}.bind(this)
								}
							);
						}.bind(this)
					});

				}.bind(this),
				error: function (error) {

				}
			});

			if (oCancelModel.getProperty("/HCP_PLAYERS") != null && oCancelModel.getProperty("/HCP_PLAYERS") != "") {
				this.redirectNegociationReport();
			}

			oCancelModel.setProperty("/HCP_CANCEL_REASON", null);
			oEvent.getSource().getParent().close();

		},

		_onInputArmazemFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("editOfferMapFormModel");
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

			var oModel = this.getView().getModel("editOfferMapFormModel");
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

			var oModel = this.getView().getModel("editOfferMapFormModel");
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

						oModel.setProperty("/erroValidDate", false);

					}

				}
			}

			this._validateForm();

		},

		_onInputLocal: function (oEvent) {

			var oModelOffer = this.getView().getModel();
			var oModel = this.getView().getModel("editOfferMapFormModel");
			var oData = oModel.oData;
			var oInput = oEvent.getSource();
			var aFilters = [];
			var oLocal = oInput.getSelectedKey();

			if (oData.HCP_STATES_OFFER == "1" && oData.HCP_PARTNER_TYPE == '1' && oData.ItemLocal.length > 1 && oLocal != "") { //Fornecedor

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

			var oModel = this.getView().getModel("editOfferMapFormModel");
			var oData = oModel.oData;
			var oInput = oEvent.getSource();

			if (oData.oCenterOld.length === 0 && oData.inputCenter.length > 0) {
				for (var i = 0; i < oData.inputCenter.length; i++) {

					oData.oCenterOld.push(oData.inputCenter[i]);
					oData.oCenterOld[i].status = "Deleted";

				}
			}

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

					if (oInput.getSelectedKey() === "1" || oInput.getSelectedKey() === "3") { //CIF

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

					this._onAddNewCenterForm(oInput.getSelectedKey());
					oModel.refresh();

				}.bind(this));

			}.bind(this));

		},

		_onInputProspect: function (oEvent) {

			var oModelOffer = this.getView().getModel();
			var oModel = this.getView().getModel("editOfferMapFormModel");
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
								oModel.setProperty("/yesLifnr", false);
								oModel.setProperty("/yesCommodities", false);
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

							this.getStatesOrigem(aFilters, true).then(function () {
								this._validateForm();
							}.bind(this));
						}

					}.bind(this),
					error: function (error) {}
				});

			}

			this._validateForm();

		},

		_onInputPartner: function (oSelectedPartner, oBland) {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getView().getModel();
				var oModel = this.getView().getModel("editOfferMapFormModel");
				var oData = oModel.oData;
				var aFilters = [];

				oModel.setProperty("/ItemStates", []);
				oModel.setProperty("/ItemLocal", []);

				if (oSelectedPartner) {

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

								if (oSelectedPartner.AGRUPADO === 0 && !oData.HCP_LOCAL) { //Não Agrupado

									oModel.setProperty("/HCP_LOCAL", aResults[0].LIFNR);

								}

								var aFiltersAux = aFilters.filter(function (m, n) {
									return aFilters.indexOf(m) == n;
								});

								this.getStatesOrigem(aFilters, oBland).then(function () {
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

				} else {
					resolve();
				}

			}.bind(this));

		},

		getStatesOrigem: function (oFilters, oBland) {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getView().getModel();
				var oTableModel = this.getView().getModel("editOfferMapFormModel");
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

						if (oBland === true) {
							for (var i = 0; i < oData.inputCenter.length; i++) {
								oData.inputCenter[i].HCP_BLAND = this.oBland;
							}
						}

						for (var i = 0; i < aResults.length; i++) {

							var aData = {
								BLAND: aResults[i].BLAND,
								BEZEI: aResults[i].BEZEI
							};

							oDataItem.push(aData);
						}

						oTableModel.setProperty("/ItemStates", oDataItem);

						if (oData.edit) {
							this._validateForm();
						}

						resolve();

					}.bind(this),
					error: function (error) {

						if (oData.edit) {
							this._validateForm();
						}

						resolve();
					}
				});

			}.bind(this));

		},

		_calculatePriceFinal: function (oInputWerks) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel("editOfferMapFormModel");
				var oData = oModel.oData;
				var oPrice = oInputWerks.HCP_PRICE_FOB;
				var oPriceFreight = 0;

				if (oData.calculatePrice === true) {

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

				}

				if (oData.edit) {
					this._validateForm();
				}

				resolve();

			}.bind(this));

		},

		_validatePriceWerksForCommodities: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel("editOfferMapFormModel");
				var oData = oModel.oData;
				var oErrorFreight = oData.errorFreight;
				var oYesCommodities = oData.yesCommodities;
				var oMessage = this.resourceBundle.getText("messageNotCommodities") + this.resourceBundle.getText("messageErroFreight");
				oModel.setProperty("/messageFreight", oMessage);

				if (oData.HCP_INCOTERM == "2" && oData.yesLifnr == true && oData.errorMaterial == false && oData.erroValidDate == false) { //FOB

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
					} else {
						oModel.setProperty("/tablePriceWerks", aArrayCenter);
					}

				}

				resolve();

			}.bind(this));

		},

		getPriceKm: function () {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getView().getModel();
				var oModel = this.getView().getModel("editOfferMapFormModel");
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

						resolve();

					}.bind(this),
					error: function (error) {
						reject();
					}
				});

			}.bind(this));
		},

		onInputUmPrice: function () {

			var oModel = this.getView().getModel("editOfferMapFormModel");
			var oData = oModel.oData;

			for (var i = 0; i < oData.inputCenter.length; i++) {
				this._calculatePriceFreight(oData.inputCenter[i]).then(function () {
					this._validateForm();
				}.bind(this));
			}

		},

		_validateDistance: function (oEvent) {

			var oModel = this.getView().getModel("editOfferMapFormModel");
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

		_validateTrechoKm: function (oEvent) {

			var oSource = oEvent.getSource();
			var oModel = this.getView().getModel("editOfferMapFormModel");
			var oData = oModel.oData;

			this._valideInputNumber(oEvent);

			oSource.setValueState("None");
			oSource.setValueStateText("");

			if (oData.HCP_TRECHO_KM && oData.HCP_DISTANCE) {
				if (oData.HCP_TRECHO_KM > oData.HCP_DISTANCE) {
					oSource.setValueState("Error");
					oSource.setValueStateText(this.resourceBundle.getText("errorUnpavedDistance"));
				} else {
					this._calculatePriceFreight().then(function () {}.bind(this));
				}

			}

			this._validateForm();

		},

		_validatePrice: function (oEvent) {

			this._valideInputNumber(oEvent);
			this._calculatePriceFreight().then(function () {
				this._calculatePriceFinal();
			}.bind(this));

		},

		_onGetPriceBrf: function () {

			var oModel = this.getView().getModel("editOfferMapFormModel");
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

		_calculatePriceFreight: function (oInputCenter) {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getView().getModel();
				var oModel = this.getView().getModel("editOfferMapFormModel");
				var oData = oModel.oData;
				var aFilters = [];

				if (oData.HCP_INCOTERM == '2' && this.sFreightCalculator == "X" &&
					oInputCenter.HCP_QUOTATION_FREIGHT == "2") {

					if (oData.calculatePrice === true) {
						oInputCenter.HCP_PRICE_CALC_FREIGHT = 0;
						oInputCenter.HCP_PRICE_FINAL = 0;
						oInputCenter.noPricesCalculator = false;
					}

					if (oInputCenter.HCP_WERKS && oInputCenter.HCP_BLAND && oInputCenter.HCP_DISTANCE &&
						oData.HCP_UM && oData.HCP_DATE_START && oData.yesCalculator === true) {

						if (oData.messageBox == true) {
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

											if (oData.calculatePrice === true) {
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

											}

											oModel.refresh();

											if (oData.messageBox == true) {
												this.closeBusyDialog();
											}

											this._validatePriceWerksForCommodities().then(function () {
												resolve();
											}.bind(this));

										} else {
											oInputCenter.noPricesCalculator = true;
											this._calculatePriceFinal(oInputCenter).then(function () {
												this._validatePriceWerksForCommodities().then(function () {
													oModel.refresh();

													if (oData.messageBox == true) {
														this.closeBusyDialog();
													}

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

								if (oData.messageBox == true) {
									this.closeBusyDialog();
								}

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

		_onInputPartnerFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("editOfferMapFormModel");
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

			if (oData.HCP_INCOTERM == '1' || oData.HCP_INCOTERM == '3') { //CIF
				oModel.setProperty("/yesTerceiro", false);
			} else {
				this.searchKmPartner(oData.HCP_LOCAL, oData.HCP_WERKS).then(function () {}.bind(this));
			}

			oModel.setProperty("/LIFNR_PROSPECT", null);
			oModel.setProperty("/HCP_CREATE_OFFER", "2");

			if (oInput.getSelectedKey() == "1") { //Fornecedor

				if (oData.HCP_INCOTERM == '2') { //FOB
					oModel.setProperty("/yesBlandItem", true);
				}

				oModel.setProperty("/yesLifnr", true);
				oModel.setProperty("/yesPartner", true);
				oModel.setProperty("/yesProspect", false);
				oModel.setProperty("/yesPartner", true);

			} else { //Prospect

				if (oData.HCP_INCOTERM == '2') {
					oModel.setProperty("/yesBlandView", true);
					oModel.setProperty("/yesTextDistance", true);
					oModel.setProperty("/HCP_DISTANCE", null);
					oModel.setProperty("/textDistance", this.resourceBundle.getText("errorDistanceNotFounded"));
				}

				oModel.setProperty("/yesLifnr", false);
				oModel.setProperty("/yesProspect", true);
				oModel.setProperty("/yesPartner", false);
				oModel.setProperty("/enabledBland", true);

				this._calculatePriceFreight().then(function () {}.bind(this));

			}

			this._validateForm();

		},

		_onInputWerksDest: function (oDataNewCenter) {

			var oModel = this.getView().getModel("editOfferMapFormModel");
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

			var oModel = this.getView().getModel("editOfferMapFormModel");
			var oSource = oEvent.getSource();
			var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
			var oDataNewCenter = oModel.getProperty(sPath);

			this._calculatePriceFreight(oDataNewCenter).then(function () {
				this._validateForm();
			}.bind(this));

		},

		_onInputMaterialFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("editOfferMapFormModel");
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

			var oModel = this.getView().getModel("editOfferMapFormModel");
			var oInput = oEvent.getSource();

			if (oInput.getSelectedKey() == "2") { //Depósito
				oModel.setProperty("/requiredPrice", false);
				oModel.setProperty("/yesDeposit", true);

			} else { //Fixo
				oModel.setProperty("/requiredPrice", true);
				oModel.setProperty("/yesDeposit", false);

			}

			oModel.setProperty("/yesOthersDep", false);
			oModel.setProperty("/HCP_DEPOSIT_TYPE", null);
			oModel.setProperty("/HCP_OTHER_DEPOSIT", null);
			oModel.setProperty("/HCP_DESC_DEPOSIT", null);

			this._validateForm();

		},

		_onInputDepositFormSelect: function () {

			var oModel = this.getView().getModel("editOfferMapFormModel");

			if (oModel.oData.HCP_DEPOSIT_TYPE == '6') {
				oModel.setProperty("/yesOthersDep", true);
			} else {
				oModel.setProperty("/yesOthersDep", false);
				oModel.setProperty("/HCP_OTHER_DEPOSIT", null);
			}

			this._validateForm();

		},

		_onAddNewCenterForm: function (oEvent) {
			if (oEvent == "1" || oEvent == "2" || oEvent == "3") {
				var oForm = this.getView().byId("newCenterSimpleForm");
				oForm.addContent(new sap.m.Label({
					text: ""
				}));
				this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText("textWait"));
				oForm.addContent(this.buildCenterTemplate());
				setTimeout(function () {
					this._validateForm();
					this.closeBusyDialog();
				}.bind(this), 2000);
			} else {
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
			}

			// var oButton = oEvent.getSource();
			// var oFormId = oButton.getCustomData()[0].getValue();
			// var oForm = this.getView().byId(oFormId);

			// MessageBox.information(

			// 	this.resourceBundle.getText("questionNewPlant"), {
			// 		actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
			// 		onClose: function (sAction) {
			// 			if (sAction === "YES") {
			// 				oForm.addContent(new sap.m.Label({
			// 					text: ""
			// 				}));
			// 				this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText("textWait"));
			// 				oForm.addContent(this.buildCenterTemplate());

			// 				setTimeout(function () {
			// 					this._validateForm();
			// 					this.closeBusyDialog();
			// 				}.bind(this), 2000);

			// 			}
			// 		}.bind(this)
			// 	}
			// );
		},

		_onInputLogisticsFreight: function (oEvent) {

			var oModel = this.getView().getModel("editOfferMapFormModel");
			var oSource = oEvent.getSource();
			var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
			var oDataNewCenter = oModel.getProperty(sPath);

			oDataNewCenter.HCP_USER_LOGISTICS = this.userName;
			oDataNewCenter.HCP_STATES_FREIGHT = "3";
			oDataNewCenter.HCP_DESC_STATES_FREIGHT = this.resourceBundle.getText("textFinished");

			this._valideInputNumber(oEvent);

			this._calculatePriceFinal(oDataNewCenter).then(function () {
				oModel.refresh();
				this._validateForm();
			}.bind(this));

		},

		buildCenterTemplate: function () {

			var oModel = this.getView().getModel("editOfferMapFormModel");
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
				key: "{path:'editOfferMapFormModel>BLAND'}",
				text: "{path:'editOfferMapFormModel>BLAND'} - {path:'editOfferMapFormModel>BEZEI'}"
			});

			if (oModel.oData.HCP_INCOTERM == "1" || oData.HCP_INCOTERM == '3') { //CIF
				var oCif = true;
				var oFob = false;
			} else { //FOB
				oCif = false;
				oFob = true;
			}

			if (sCharLength === 0 && oData.HCP_STATES_OFFER == "1" && oData.sPathOption !== "Freight") {
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
								required: "{editOfferMapFormModel>/requiredPrice}"
							}),
							new sap.m.Input({
								// value: "{ parts:[{path:'editOfferMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_PRICE_OFFER'}, {path:'editOfferMapFormModel>/localeId'}], path: 'editOfferMapFormModel>/inputCenter/" +
								// 	sCharLength +
								// 	"/HCP_PRICE_OFFER' , type: 'sap.ui.model.type.Currency', formatOptions: { showMeasure: false }}",
								value: "{ path: 'editOfferMapFormModel>/inputCenter/" + sCharLength +
									"/HCP_PRICE_OFFER' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_PRICE_OFFER",
								width: "100%",
								enabled: "{editOfferMapFormModel>/enabledEdit}",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: oCif,
								required: "{editOfferMapFormModel>/requiredPrice}",
								placeholder: this.resourceBundle.getText("placeEnterPriceOffer"),
								liveChange: this._validateForm.bind(this),
								change: this._valideInputPrice.bind(this)
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textPriceFOB"),
								design: "Standard",
								width: "100%",
								visible: oFob,
								required: "{editOfferMapFormModel>/requiredPrice}",
								textAlign: "Begin",
								textDirection: "Inherit"
							}),
							new sap.m.Input({
								// value: "{ parts:[{path:'editOfferMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_PRICE_FOB'}, {path:'editOfferMapFormModel>/localeId'}], path: 'editOfferMapFormModel>/inputCenter/" +
								// 	sCharLength +
								// 	"/HCP_PRICE_FOB' , type: 'sap.ui.model.type.Currency', formatOptions: { showMeasure: false }}",
								value: "{ path: 'editOfferMapFormModel>/inputCenter/" + sCharLength +
									"/HCP_PRICE_FOB' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_PRICE_FOB",
								width: "100%",
								// enabled: "{editOfferMapFormModel>/enabledEdit}",
								// enabled: oEnablePriceFob,
								enabled: oFob,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: oFob,
								required: "{editOfferMapFormModel>/requiredPrice}",
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
								selectedKey: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/HCP_WERKS}",
								placeholder: this.resourceBundle.getText("placeSelectDestinationCenter"),
								name: "HCP_WERKS",
								editable: true,
								enabled: "{editOfferMapFormModel>/enabledEdit}",
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
								visible: "{editOfferMapFormModel>/noCalculator}",
								required: "{editOfferMapFormModel>/noCalculator}"
							}),
							new sap.m.Input({
								// value: "{ parts:[{path:'editOfferMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_PRICE_FREIGHT'}, {path:'editOfferMapFormModel>/localeId'}], path: 'editOfferMapFormModel>/inputCenter/" +
								// 	sCharLength +
								// 	"/HCP_PRICE_FREIGHT' , type: 'sap.ui.model.type.Currency', formatOptions: { showMeasure: false }}",
								value: "{ path: 'editOfferMapFormModel>/inputCenter/" + sCharLength +
									"/HCP_PRICE_FREIGHT' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_PRICE_FREIGHT",
								width: "100%",
								enabled: "{editOfferMapFormModel>/enabledEdit}",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{editOfferMapFormModel>/noCalculator}",
								required: "{editOfferMapFormModel>/noCalculator}",
								placeholder: this.resourceBundle.getText("placeEnterFreightValue"),
								liveChange: this._validateForm.bind(this),
								change: this._valideInputPrice.bind(this)
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textDistanceKm"),
								design: "Standard",
								width: "100%",
								visible: "{editOfferMapFormModel>/yesCalculator}",
								required: "{editOfferMapFormModel>/yesDistance}",
								textAlign: "Begin",
								textDirection: "Inherit"
							}),
							new sap.m.Input({
								value: "{ path: 'editOfferMapFormModel>/inputCenter/" + sCharLength +
									"/HCP_DISTANCE' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_DISTANCE",
								width: "100%",
								enabled: "{editOfferMapFormModel>/enabledEdit}",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{editOfferMapFormModel>/yesCalculator}",
								required: "{editOfferMapFormModel>/yesDistance}",
								placeholder: this.resourceBundle.getText("placeEnterDistanceKm"),
								liveChange: this._validateForm.bind(this),
								change: this._validateDistance.bind(this)
							}),
							new sap.m.Label({
								text: "",
								design: "Standard",
								width: "100%",
								visible: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/yesTextDistance}",
								required: false,
								textAlign: "Begin",
								textDirection: "Inherit"
							}),
							new sap.m.MessageStrip({
								text: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/textDistance}",
								type: "Warning",
								showIcon: true,
								showCloseButton: false,
								visible: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/yesTextDistance}",
								class: "sapUiMediumMarginBottom"
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textHomeState"),
								design: "Standard",
								width: "100%",
								visible: "{editOfferMapFormModel>/yesBlandView}",
								required: "{editOfferMapFormModel>/yesBlandView}",
								textAlign: "Begin",
								textDirection: "Inherit"
							}),
							new CustomComboBox({
								showSecondaryValues: true,
								selectedKey: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/HCP_BLAND}",
								placeholder: this.resourceBundle.getText("placeSelectHomeState"),
								name: "HCP_BLAND",
								editable: true,
								enabled: "{editOfferMapFormModel>/enabledBland}",
								visible: "{editOfferMapFormModel>/yesBlandView}",
								required: "{editOfferMapFormModel>/yesBlandView}",
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
								visible: "{editOfferMapFormModel>/yesBlandItem}",
								required: "{editOfferMapFormModel>/yesBlandItem}",
								textAlign: "Begin",
								textDirection: "Inherit"
							}),
							new CustomComboBox({
								showSecondaryValues: true,
								selectedKey: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/HCP_BLAND}",
								placeholder: this.resourceBundle.getText("placeSelectHomeState"),
								name: "HCP_BLAND",
								editable: true,
								enabled: "{editOfferMapFormModel>/enabledBland}",
								visible: "{editOfferMapFormModel>/yesBlandItem}",
								required: "{editOfferMapFormModel>/yesBlandItem}",
								width: 'auto',
								maxWidth: '100%',
								selectionChange: this.onInputBland.bind(this),
								items: {
									path: 'editOfferMapFormModel>/ItemStates',
									length: 999999,

									sorter: new sap.ui.model.Sorter({
										path: 'editOfferMapFormModel>BLAND',
										descending: false
									}),

									template: oItemTemplateStatesItem
								}
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("questionUnpavedStretch"),
								design: "Standard",
								width: "100%",
								visible: "{editOfferMapFormModel>/yesCalculator}",
								required: "{editOfferMapFormModel>/yesCalculator}",
								textAlign: "Begin",
								textDirection: "Inherit"
							}),
							new sap.m.SegmentedButton({
								selectedKey: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/HCP_PAVED}",
								width: "auto",
								selectionChange: this._onInputPavedFormSelect.bind(this),
								visible: "{editOfferMapFormModel>/yesCalculator}",
								enabled: "{editOfferMapFormModel>/enabledEdit}",
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
								visible: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/yesPaved}",
								required: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/yesPaved}"
							}),
							new sap.m.Input({
								value: "{ path: 'editOfferMapFormModel>/inputCenter/" + sCharLength +
									"/HCP_TRECHO_KM' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_TRECHO_KM",
								width: "100%",
								enabled: "{editOfferMapFormModel>/enabledEdit}",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/yesPaved}",
								required: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/yesPaved}",
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
								visible: "{editOfferMapFormModel>/yesCalculator}",
								required: false
							}),
							new sap.m.Input({
								// value: "{ parts:[{path:'editOfferMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_PRICE_CALC_FREIGHT'}, {path:'editOfferMapFormModel>/localeId'}], path: 'editOfferMapFormModel>/inputCenter/" +
								// 	sCharLength +
								// 	"/HCP_PRICE_CALC_FREIGHT' , type: 'sap.ui.model.type.Currency', formatOptions: { showMeasure: false }}",
								value: "{ path: 'editOfferMapFormModel>/inputCenter/" + sCharLength +
									"/HCP_PRICE_CALC_FREIGHT' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_PRICE_CALC_FREIGHT",
								width: "100%",
								enabled: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{editOfferMapFormModel>/yesCalculator}",
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
								visible: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/noPricesCalculator}",
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
								// value: "{ parts:[{path:'editOfferMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_PRICE_FINAL'}, {path:'editOfferMapFormModel>/localeId'}], path: 'editOfferMapFormModel>/inputCenter/" +
								// 	sCharLength +
								// 	"/HCP_PRICE_FINAL' , type: 'sap.ui.model.type.Currency', formatOptions: { showMeasure: false }}",
								value: "{ path: 'editOfferMapFormModel>/inputCenter/" + sCharLength +
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
								// value: "{ parts:[{path:'editOfferMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_PRICE_BRF'}, {path:'editOfferMapFormModel>/localeId'}], path: 'editOfferMapFormModel>/inputCenter/" +
								// 	sCharLength +
								// 	"/HCP_PRICE_BRF' , type: 'sap.ui.model.type.Currency', formatOptions: { showMeasure: false }}",
								value: "{ path: 'editOfferMapFormModel>/inputCenter/" + sCharLength +
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
								visible: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/noPriceBRF}",
								required: false,
								textAlign: "Begin",
								textDirection: "Inherit"
							}),
							new sap.m.MessageStrip({
								text: this.resourceBundle.getText("errorPriceNotFounded"),
								type: "Warning",
								showIcon: true,
								showCloseButton: false,
								visible: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/noPriceBRF}",
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
								selectedKey: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/HCP_QUOTATION_FREIGHT}",
								width: "auto",
								selectionChange: this._onInputQuotFreitFormSelect.bind(this),
								enabled: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/enabledQuotation}",
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
								visible: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/yesFreight}",
								required: false
							}),
							new sap.m.Input({
								// value: "{ parts:[{path:'editOfferMapFormModel>/inputCenter/" + sCharLength +
								// 	"/HCP_LOGISTICS_FREIGHT'}, {path:'editOfferMapFormModel>/localeId'}], path: 'editOfferMapFormModel>/inputCenter/" +
								// 	sCharLength +
								// 	"/HCP_LOGISTICS_FREIGHT' , type: 'sap.ui.model.type.Currency', formatOptions: { showMeasure: false }}",
								value: "{ path: 'editOfferMapFormModel>/inputCenter/" + sCharLength +
									"/HCP_LOGISTICS_FREIGHT' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_LOGISTICS_FREIGHT",
								width: "100%",
								enabled: "{editOfferMapFormModel>/enabledFreight}",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/yesFreight}",
								required: false,
								liveChange: this._validateForm.bind(this),
								change: this._onInputLogisticsFreight.bind(this)
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textStatus"),
								design: "Standard",
								width: "100%",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/yesFreight}",
								required: false
							}),
							new sap.m.Input({
								value: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/HCP_DESC_STATES_FREIGHT}",
								type: "Tel",
								design: "Standard",
								name: "HCP_DESC_STATES_FREIGHT",
								width: "100%",
								enabled: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/yesFreight}",
								required: false
							}),
							new sap.m.Label({
								text: this.resourceBundle.getText("textLogistics"),
								design: "Standard",
								width: "100%",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/yesFreight}",
								required: false
							}),
							new sap.m.Input({
								value: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/HCP_USER_LOGISTICS}",
								type: "Tel",
								design: "Standard",
								name: "HCP_USER_LOGISTICS",
								width: "100%",
								enabled: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{editOfferMapFormModel>/inputCenter/" + sCharLength + "/yesFreight}",
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
							visible: "{editOfferMapFormModel>/visibleExcluir}",
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
			oModel.oData.inputCenter[sCharLength].HCP_DISTANCE = this.oDistance;
			oModel.oData.inputCenter[sCharLength].enabledQuotation = true;
			oModel.oData.inputCenter[sCharLength].noPriceBRF = false;
			oModel.oData.inputCenter[sCharLength].noCalculator = false;
			oModel.oData.inputCenter[sCharLength].noPricesCalculator = false;
			oModel.oData.inputCenter[sCharLength].yesTextDistance = false;
			oModel.oData.inputCenter[sCharLength].yesPaved = false;
			oModel.oData.inputCenter[sCharLength].yesFreight = false;
			oModel.oData.inputCenter[sCharLength].HCP_STATES_FREIGHT = "1";
			oModel.oData.inputCenter[sCharLength].HCP_DESC_STATES_FREIGHT = this.resourceBundle.getText("textOpened");

			return oTemplate;

		},

		_validateCenterInput: function (oProperty) {

			var oModel = this.getView().getModel("editOfferMapFormModel");
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

			var oModel = this.getView().getModel("editOfferMapFormModel");
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

			var oEditModel = this.getView().getModel("editOfferMapFormModel");
			var oData = oEditModel.oData;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			if (oData.edit === true) {
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

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
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

		buildEntityCenterPath: function (sEntityName, oEntity) {

			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(HCP_UNIQUE_KEY_WERKS='" + oEntity.HCP_UNIQUE_KEY_WERKS + "')";
			}
		},

		_validateForm: function () {
			var oFilterModel = this.getView().getModel("editOfferMapFormModel");

			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;

				oFilterModel.setProperty("/edit", true);
				oFilterModel.setProperty("/calculatePrice", true);

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

		_validateFormCancelReason: function () {

			var oModelCancel = this.getView().getModel("offerMapCancelFormModel");
			var oData = oModelCancel.oData;

			setTimeout(function () {

				if (oData.HCP_CANCEL_REASON.length > 0) {
					oModelCancel.setProperty("/enabledConfir", true);
				} else {
					oModelCancel.setProperty("/enabledConfir", false);
					return;
				}

			}.bind(this), 100);
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

		backToIndex: function () {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("offerMap.Index", true);
		},

		_handlePartnerFilterPress: function () {
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
			var oModel = this.getView().getModel("editOfferMapFormModel");
			var oData = oModel.getProperty("/");
			var SelectedPartner = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

			oData["HCP_PARTNER"] = SelectedPartner.HCP_REGISTER;
			oData["PROVIDER_DESC"] = SelectedPartner.NAME1;
			oModel.refresh();
			this.oPartnerFilter.destroy();

			this._onInputPartner(SelectedPartner, true).then(function () {
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
				var oModel = this.getView().getModel("editOfferMapFormModel");
				var oData = oModel.oData;
				var aFilters = [];

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
				var oEditModel = this.getView().getModel("editOfferMapFormModel");
				var oData = oEditModel.oData;
				var aFilters = [];

				if (oPartner && oInputCenter.HCP_WERKS && oData.HCP_INCOTERM == '2' && this.sFreightCalculator == "X") {

					if (oData.HCP_WAREHOUSE == '1' && oData.HCP_PARTNER_TYPE == "1") {

						if (oData.messageBox == true) {
							this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText("textWait"));

							oInputCenter.HCP_DISTANCE = null;
						}

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

									if (oData.messageBox == true) {
										oInputCenter.HCP_DISTANCE = aResults[0].ATFLV;
									}

									oInputCenter.textDistance = this.resourceBundle.getText("sucessProposedDistance");
								}

								if (oData.messageBox == true) {
									this.closeBusyDialog();
								}

								this._calculatePriceFreight(oInputCenter).then(function () {
									resolve();
								}.bind(this));

							}.bind(this),
							error: function (error) {
								if (oData.messageBox == true) {
									this.closeBusyDialog();
								}
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

					if (oInputCenter[i].status !== "Deleted" && oInputCenter[i].HCP_PRICE_CALC_FREIGHT == 0 && oInputCenter[i].HCP_PRICE_FINAL ==
						0) {
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
			var oModel = this.getView().getModel("editOfferMapFormModel");
			var oData = oModel.oData;
			var aFilters = [];
			var aCenterArray = oData.tablePriceWerks;
			var oLocalArray = oData.ItemLocal;
			var oEnabledLocal = false;
			var oEnabledCenter = false;

			if (oData.HCP_CREATE_OFFER == "1") { //Criar Compra

				if (oData.HCP_MODALITY == "1") { //Fixo
					var oText = this.resourceBundle.getText("optionBuyFixedPrice");
				} else {
					oText = this.resourceBundle.getText("optionBuyDepositi");
				}

				//VERIFICA SE HCP_LOCAL É UM NUMERO
				var isOnlyNumbers = /^\d+$/.test(oData.HCP_LOCAL);

				if (oData.HCP_INCOTERM == "1" || oData.HCP_INCOTERM == '3') { //Cif
					aCenterArray = oData.inputCenter;
				}

				if (aCenterArray.length > 1) {
					oEnabledCenter = true;
				} else {
					var oCenter = aCenterArray[0].WERKS;
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
							enabledOtherVol: oData.HCP_STATES_OFFER != "2" ? false : true,
							ItemWerks: aCenterArray,
							ItemLocal: oLocalArray,
							HCP_WERKS: oCenter,
							HCP_LOCAL: oData.HCP_LOCAL,
							HCP_UNIQUE_KEY: this.uniqueKey,
							HCP_TIPO: oData.HCP_MODALITY,
							HCP_MENGE: oData.HCP_STATES_OFFER != "2" ? oData.HCP_VOLUME : oData.HCP_VOLUME_FINAL,
							HCP_VOLUME: oData.HCP_STATES_OFFER != "2" ? 0 : oData.HCP_VOLUME,
							HCP_VOLUME_COMMERCIALIZED: oData.HCP_STATES_OFFER != "2" ? 0 : oData.HCP_VOLUME_COMMERCIALIZED,
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

			var sKeyOffer = oData;

			var sKeyOffer = {
				HCP_UNIQUE_KEY_OFFER: oData.HCP_UNIQUE_KEY,
				HCP_TIPO: oData.HCP_TIPO,
				HCP_WERKS: oData.HCP_WERKS,
				HCP_LOCAL: oData.HCP_LOCAL,
				HCP_MENGE: oData.HCP_MENGE
			};

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

		onReactivatePress: function (oEvent) {

			this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText("textReactivateOffer"));

			var oModel = this.getOwnerComponent().getModel();

			var oModelOfferMap = this.getView().getModel("editOfferMapFormModel");
			var oData = oModelOfferMap.oData;

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile; // Ver se é celular ou não
			let countReactivated = (parseInt(oData.HCP_REACTIVATED) + 1).toString();

			var oPropertiesReactivate = {
				HCP_STATES_OFFER: "6",
				HCP_REACTIVATED: countReactivated
			};

			var sPath = this.buildEntityPath("Offer_Map", oData, "HCP_OFFER_ID"); // Pegar ID da Oferta

			oModel.update(sPath, oPropertiesReactivate);

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

				oModel.submitChanges({
					groupId: "changes",
					success: function () {
						MessageBox.success(
							`Oferta ${oData.HCP_OFFER_ID} Reativada`, {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									this.closeBusyDialog();
									this.navBack();
								}.bind(this)
							}
						);
					}.bind(this),
					//	sap.m.MessageToast.show("Alterado com Sucesso");
					//	this.closeBusyDialog();
					//}.bind(this),
					error: function () {
						MessageBox.success(
							`Erro ao reativar oferta ${oData.HCP_OFFER_ID}.`, {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									this.closeBusyDialog();
								}.bind(this)
							}
						);
						//console.log("Erro ao Reativar.");
						//this.closeBusyDialog();
					}.bind(this)
				});

			} else {
				oModel.submitChanges({
					groupId: "changes",
					success: function () {
						MessageBox.sucess(
							"Você deve se conectar-se a internet para liberação.", {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									this.clouseBusyDialog();
								}
							});
						//sap.m.MessageToast.show("Você deve se conectar-se a internet para liberação.");
						//this.closeBusyDialog();
						setTimeout(function () {
							this.navBack();
						}.bind(this), 500);
					}.bind(this),
					error: function () {
						console.log(`Erro ao Reativar a oferta ${oData.HCP_OFFER_ID}.`);
						this.closeBusyDialog();
					}.bind(this)
				});
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

			var oCreateModelOffer = this.getView().getModel("editOfferMapFormModel");
			var oData = oCreateModelOffer.oData;

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}

			if (oData.inputCenter[0].status == 'New' && oData.inputCenter[0].HCP_WERKS == '' && oData.inputCenter[0].WERKS == '') {
				oData.inputCenter.shift();
			}

			this._checkFreightCalculation(oData.inputCenter).then(function () {

				this.uniqueKey = oData.HCP_UNIQUE_KEY;

				var aData = {
					HCP_OFFER_ID: oData.HCP_OFFER_ID,
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
					HCP_LOCAL: oData.HCP_LOCAL,
					HCP_OTHER_LOCAL: oData.HCP_OTHER_LOCAL,
					HCP_UM: oData.HCP_UM,
					HCP_MOEDA: oData.HCP_MOEDA,
					HCP_CREATE_OFFER: oData.HCP_CREATE_OFFER,
					HCP_CREATED_AT_OFFER: oData.HCP_CREATED_AT_OFFER,
					HCP_CREATED_BY_OFFER: oData.HCP_CREATED_BY_OFFER,
					HCP_CREATED_BY: oData.HCP_CREATED_BY,
					HCP_UPDATED_BY: aUserName,
					HCP_CREATED_AT: oData.HCP_CREATED_AT,
					HCP_UPDATED_AT: new Date()
				};

				var sPath = this.buildEntityPath("Offer_Map", oData, "HCP_OFFER_ID");

				oModel.update(sPath, aData, {
					groupId: "changes"
				});

				if (oData.oCenterOld.length > 0) {

					for (var i = 0; i < oData.oCenterOld.length; i++) {

						oData.inputCenter.push(oData.oCenterOld[i]);

					}

				}

				var arrayNew = [];

				//Centros
				for (var i = 0; i < oData.inputCenter.length; i++) {

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
						HCP_PRICE_OFFER: (oData.HCP_INCOTERM == '1' || oData.HCP_INCOTERM == '3' ? parseFloat(oData.inputCenter[i].HCP_PRICE_OFFER).toFixed(
							2) : '0.00'),
						HCP_PRICE_FOB: oData.HCP_INCOTERM == '2' ? parseFloat(oData.inputCenter[i].HCP_PRICE_FOB).toFixed(2) : "0.00",
						HCP_PRICE_FREIGHT: oData.HCP_INCOTERM == '2' && oData.noCalculator == true ? parseFloat(oData.inputCenter[i].HCP_PRICE_FREIGHT)
							.toFixed(
								2) : "0.00",
						HCP_DISTANCE: oData.HCP_INCOTERM == '2' && oData.yesCalculator == true ? parseFloat(oData.inputCenter[i].HCP_DISTANCE).toFixed(
							2) : "0.00",
						HCP_BLAND: oData.inputCenter[i].HCP_BLAND,
						HCP_PAVED: oData.inputCenter[i].HCP_PAVED,
						HCP_TRECHO_KM: oData.inputCenter[i].HCP_PAVED == '1' ? parseFloat(oData.inputCenter[i].HCP_TRECHO_KM).toFixed(2) : "0.00",
						HCP_PRICE_CALC_FREIGHT: parseFloat(oData.inputCenter[i].HCP_PRICE_CALC_FREIGHT).toFixed(2),
						HCP_PRICE_FINAL: parseFloat(oData.inputCenter[i].HCP_PRICE_FINAL).toFixed(2),
						HCP_PRICE_BRF: parseFloat(oData.inputCenter[i].HCP_PRICE_BRF).toFixed(2),
						HCP_QUOTATION_FREIGHT: oData.inputCenter[i].HCP_QUOTATION_FREIGHT,
						HCP_STATES_FREIGHT: oData.inputCenter[i].HCP_STATES_FREIGHT,
						HCP_USER_LOGISTICS: oData.inputCenter[i].HCP_USER_LOGISTICS,
						HCP_LOGISTICS_FREIGHT: oData.HCP_INCOTERM == '2' ? parseFloat(oData.inputCenter[i].HCP_LOGISTICS_FREIGHT).toFixed(2) : "0.00",
						// HCP_CREATED_BY: oData.inputCenter[i].HCP_CREATED_BY,
						HCP_UPDATED_BY: this.userName,
						HCP_UNIQUE_KEY_WERKS: oData.inputCenter[i].HCP_UNIQUE_KEY_WERKS ? oData.inputCenter[i].HCP_UNIQUE_KEY_WERKS : this.generateUniqueKey(),
						// HCP_CREATED_AT: oData.inputCenter[i].HCP_CREATED_AT,
						HCP_UPDATED_AT: new Date()
					};

					sPath = this.buildEntityCenterPath("Offer_Map_Werks", oData.inputCenter[i]);

					if (aDeferredGroups.indexOf("changes") < 0) {
						aDeferredGroups.push("changes");
						oModel.setDeferredGroups(aDeferredGroups);
					}

					if (oData.inputCenter[i].status === "New") {

						arrayNew.push(aDataCenter);

						//	oModel.createEntry("/Offer_Map_Werks", {
						//		properties: aDataCenter
						//	}, {
						//		groupId: "changes"
						//	});

					} else if (oData.inputCenter[i].status === "Edit") {
						oModel.update(sPath, aDataCenter, {
							groupId: "changes"
						});

					} else if (oData.inputCenter[i].status === "Deleted") {

						oModel.remove(sPath, {
							groupId: "changes"
						});

					}

				}

				for (var item of arrayNew) {
					oModel.createEntry("/Offer_Map_Werks", {
						properties: item
					}, {
						groupId: "changes"
					});
				}

				//this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText("messageSaving"));
				this.verifyTimeOut(true);
				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
					oModel.submitChanges({
						groupId: "changes",
						success: function () {
							this.flushStore("Offer_Map,Offer_Map_Werks").then(function () {
								this.refreshStore("Offer_Map", "Offer_Map_Werks").then(function () {

									this.hasFinished = true;
									if (bIsMobile) {
										localStorage.setItem("countStorageOfferMap", 0);
										localStorage.setItem("lastUpdateOfferMap", new Date());
									}

									for (var f = 0; f < oData.inputCenter.length; f++) {

										if (oData.inputCenter[f].HCP_QUOTATION_FREIGHT !== '1') {
											this.hasFreight = true;
										}

										if (f == oData.inputCenter.length - 1) {

											if (this.hasFreight) {

												this.sendMail(oData, oData.HCP_OFFER_ID, this);
											} else {
												MessageBox.success(
													this.resourceBundle.getText("sucessModifyOfferMap"), {
														actions: [sap.m.MessageBox.Action.OK],
														onClose: function (sAction) {
															this.closeBusyDialog();
															setTimeout(function () {
																this.commoditiesData(oData.HCP_OFFER_ID);
															}.bind(this), 500);
														}.bind(this)
													}
												);
											}

										}
									}

								}.bind(this));
							}.bind(this));

						}.bind(this),
						error: function () {
							MessageBox.success(
								this.resourceBundle.getText("errorModifyOfferMap"), {
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
							MessageBox.success(
								this.resourceBundle.getText("sucessModifyOfferMap"), {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
										this.commoditiesData(null);
									}.bind(this)
								}
							);
						}.bind(this),
						error: function () {
							MessageBox.success(
								this.resourceBundle.getText("errorModifyOfferMap"), {
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

		onPurchaseListPress: function (oEvent) {
			if (!this._FragmentPurchaseOrderList) {
				this._FragmentPurchaseOrderList = sap.ui.xmlfragment("purchaseOrderListID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.offerMap.fragments.PurchaseOrderList",
					this);
				this.getView().addDependent(this._FragmentPurchaseOrderList);
			}
			this._FragmentPurchaseOrderList.setBusy(true);
			this.loadPurchaseOfferList();
			this._FragmentPurchaseOrderList.openBy(oEvent.getSource());
		},

		loadPurchaseOfferList: function () {
			var oPurchaseModel = this.getView().getModel("editOfferMapFormModel");
			var oModel = this.getView().getModel();
			var oData = oPurchaseModel.getData();

			if (oData.HCP_STATES_OFFER != "1") {
				oModel.read("/Commodities_Historic_Offer", {
					filters: [
						new sap.ui.model.Filter({
							path: 'HCP_UNIQUE_KEY_OFFER',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.HCP_UNIQUE_KEY
						})
					],
					success: data => {
						if (data.results.length > 0) {
							// var oPurchaseOffers = data.results.filter(order => order.HCP_EBELN != null);
							var oPurchaseOffers = data.results;
							var sTotal = 0;

							for (var purchase of oPurchaseOffers) {
								if (purchase.HCP_EBELN === null) {
									purchase.HCP_EBELN = "Sem Sequencial";
								} else {
									purchase.HCP_EBELN = parseInt(purchase.HCP_EBELN);
								}
								sTotal = sTotal + parseFloat(purchase.HCP_MENGE);
								purchase.state = "Success";
							}

							if (sTotal) {
								oPurchaseOffers.push({
									HCP_MENGE: "Total " + sTotal,
									HCP_MEINS: "TO",
									state: "Information"
								});
							}

							oPurchaseModel.setProperty("/purchaseOfferList", oPurchaseOffers);

							this._FragmentPurchaseOrderList.setBusy(false);
						} else {
							this._FragmentPurchaseOrderList.setBusy(false);
						}
					},
					error: error => {
						console.log(error);
						this._FragmentPurchaseOrderList.setBusy(false);
					}
				});
			} else {
				this._FragmentPurchaseOrderList.setBusy(false);
			}
		},
		//Pacote Melhorias 06/06/2022 - Função para validar mensagem cancelamento
		selectMessageBox: function (oMessageSucess, isRedirect) {
			if (isRedirect) {
				this.closeBusyDialog();
				var oTableModel = this.getView().getModel("filterTableOffer");
				if (oTableModel.oData.ItemOffeMap.length == 1) {
					oTableModel.setProperty("/ItemOffeMap", []);
					oTableModel.setProperty("/count", 0);
				} else {
					oTableModel.setProperty("/ItemOffeMap", []);
					this._submitFilterOffer().then(function () {
						this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText(
							"messageLoadingPleaseWait"));
						this.getView().getModel().refresh(true);
						//	this.getView().byId("pullToRefreshID").hide();
						this.closeBusyDialog();
					}.bind(this), 1000);
				}
			} else {

				var oModel = this.getView().getModel("offerMapCancelFormModel");
				var oData = oModel.oData;

				MessageBox.success(
					oMessageSucess, {
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function (sAction) {
							this.closeBusyDialog();
							setTimeout(function () {
								this.commoditiesData(oData.HCP_OFFER_ID);
							}.bind(this), 500);
							var oTableModel = this.getView().getModel("filterTableOffer");
							if (oTableModel.oData.ItemOffeMap.length == 1) {
								oTableModel.setProperty("/ItemOffeMap", []);
								oTableModel.setProperty("/count", 0);
							} else {
								oTableModel.setProperty("/ItemOffeMap", []);
								this._submitFilterOffer().then(function () {
									this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText(
										"messageLoadingPleaseWait"));
									this.getView().getModel().refresh(true);
									//	this.getView().byId("pullToRefreshID").hide();
									this.closeBusyDialog();
								}.bind(this), 1000);
							}
						}.bind(this)
					}
				);
			}
		},

		redirectNegociationReport: function () {

			var oModel = this.getView().getModel("offerMapCancelFormModel");
			var oData = oModel.oData;
			var oMessageSucessNew = this.resourceBundle.getText("messageFinaly");
			var oOfferMaopModel = this.getOwnerComponent().getModel();
			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_UNIQUE_KEY',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_UNIQUE_KEY
			}));

			oOfferMaopModel.read("/Offer_Map", {
				filters: aFilters,
				success: function (result) {
					var aResults = result.results;
					if (aResults.length > 0) {

						MessageBox.success(
							oMessageSucessNew, {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									if (sAction === "OK") {
										this.closeBusyDialog();

										this.oRouter.navTo("negotiationReport.New", {
											branch: encodeURIComponent((aResults[0].HCP_EKGRP).toString()),
											cropYear: encodeURIComponent(oData.HCP_CROP),
											matnr: encodeURIComponent((aResults[0].HCP_MATNR).toString()),
											regio: encodeURIComponent(oData.HCP_REGIO),
											state: encodeURIComponent(oData.HCP_STATE),
											material_type: encodeURIComponent((aResults[0].HCP_TPCEREAL).toString()),
											cancel_offer_map_id: encodeURIComponent((aResults[0].HCP_OFFER_ID).toString())
										}, false);

									}
								}.bind(this)
							}
						);

					}
				}.bind(this),
				error: function (error) {
					console.log(error);
				}
			});

			var oCancelModel = this.getView().getModel("offerMapCancelFormModel");

		},

		_onPurchaseOrgChange: function (oEvent) {
			var oProfileModel = this.getView().getModel("profileModel");
			var oOfferMapModel = this.getView().getModel("editOfferMapFormModel");
			var oSource = oEvent.getSource();
			var oProfileData = oProfileModel.getData();
			var oInputValue = oSource.getSelectedKey();

			if (oInputValue) {
				if (oProfileData.ekorg.filter(ekorg => ekorg.EKORG == oInputValue || ekorg.VALOR == '*').length > 0 || oProfileData.fullAccess) {
					oOfferMapModel.setProperty("/enableEditPurchaseOrgValid", true);
				} else {
					oOfferMapModel.setProperty("/enableEditPurchaseOrgValid", false);
				}

			} else {
				oOfferMapModel.setProperty("/enableEditPurchaseOrgValid", true);
			}

			this._validateForm();
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
						if (this.count > 120) {
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

		sendMail: function (results, oMsgNumOffer, screen) {

			var oModel = this.getView().getModel();
			var modelScreen = this.getView().getModel("editOfferMapFormModel");
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

					if (aResults.length > 0) {
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
										dataResults.HCP_OFFER_ID +
										"</p><p><b>Fornecedor:</b> " + dataResults.HCP_PARTNER + " - " + modelScreen.oData.PROVIDER_DESC +
										"</p><p><b>Volume (T):</b> " +
										modelScreen.oData.HCP_VOLUME + "</p><p><b>Período:</b> " + dateObjectStart.toLocaleDateString() + " - " + dateObjectEnd.toLocaleDateString() +
										"</p><p><b>Origem:</b> " + this.getView().byId("localOrigin").getValue() + "</p><p><b>Observação:</b> " + modelScreen.oData
										.HCP_OTHER_LOCAL +
										"</p>";
								} else {
									//prospect
									mensagem = "<b>Olá</b>,<p>Existe cotação de frete pendente de resposta no sistema APP Grãos.</p><p><b>Oferta:</b> " +
										dataResults.HCP_OFFER_ID +
										"</p><p><b>Prospect:</b> " + this.getView().byId("yesProspect").getValue() + "</p><b>Volume (T):</b> " + modelScreen.oData
										.HCP_VOLUME +
										"</p><p><b>Período:</b> " + dateObjectStart.toLocaleDateString() + " - " + dateObjectEnd.toLocaleDateString() +
										"</p><p><b>Origem:</b> " +
										this.getView().byId("localOrigin").getValue() + "</p><p><b>Observação:</b> " + modelScreen.oData.HCP_OTHER_LOCAL + "</p>";
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
											let authToken = "Bearer "+ oResults.results[0].HCP_TOKEN;
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
														screen.resourceBundle.getText("sucessModifyOfferMap"), {
															actions: [sap.m.MessageBox.Action.OK],
															onClose: function (sAction) {

																screen.closeBusyDialog();
																// this.backToIndex();
																screen.commoditiesData(dataResults.HCP_OFFER_ID);

															}.bind(this)
														}
													);

													console.log(data);
												},
												error: function (error) {
													console.log(error);

													if (error.status == 202) {
														MessageBox.success(
															screen.resourceBundle.getText("sucessModifyOfferMap"), {
																actions: [sap.m.MessageBox.Action.OK],
																onClose: function (sAction) {
																	screen.closeBusyDialog();
																	setTimeout(function () {
																		screen.commoditiesData(dataResults.HCP_OFFER_ID);
																	}.bind(this), 500);
																}.bind(this)
															}
														);
													} else {

														MessageBox.success(
															screen.resourceBundle.getText("sucessModifyOfferMap") + ". Houve um erro ao enceminhar e-mail de confirmação", {
																actions: [sap.m.MessageBox.Action.OK],
																onClose: function (sAction) {
																	screen.closeBusyDialog();
																	setTimeout(function () {
																		screen.commoditiesData(dataResults.HCP_OFFER_ID);
																	}.bind(this), 500);
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
					} else {
						MessageBox.success(
							screen.resourceBundle.getText("sucessModifyOfferMap"), {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									screen.closeBusyDialog();
									setTimeout(function () {
										screen.commoditiesData(dataResults.HCP_OFFER_ID);
									}.bind(this), 500);
								}.bind(this)
							}
						);
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

			var oModel = this.getView().getModel("editOfferMapFormModel");
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
					value1: oFilterBar.determineControlByFilterItem(aFilterItems[i]).getValue().toUpperCase()
				}));
			}
			return aFilters;
		},

		onPaymentTermDialogClose: function () {
			this.oPaymentTermFilter.close();
		}

	});
}, /* bExport= */ true);