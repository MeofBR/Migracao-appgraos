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

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.commodities.EditDepositTransf", {

		onInit: function () {

			var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
			var sLocale = sCurrentLocale.split("-");
			var oLocale = new sap.ui.core.Locale(sLocale[0], sLocale[1]);
			this.oNumberFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance(oLocale);

			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("commodities.EditDepositTransf").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				localeId: this.oNumberFormat.oLocale.sLocaleId,
				enabledConfirm: false,
				enabledCadence: false,
				enabledMessage: true,
				enabled: true,
				cadence: false,
				processado: false,
				visibleOrder: false,
				visibleCadence: false,
				visibleDelivery: false,
				comoditiesCandece: false,
				errorQntCadence: false,
				errorQntOffer: false,
				noOfferThreshold: true,
				edit: false,
				yesPercent: false,
				noPercent: false,
				visibleOffer: false,
				daysBoardingInputs: [],
				tableApprover: [],
				tableCadence: [],
				tableCadenceNew: [],
				enableHeaderFields: true,
				lockFieldsFromOffer: true,
				enableEditWerksValid: true,
				enableCreateWerksValid: false
			}), "purchaseFormModel");

			var oModelOwner = this.getOwnerComponent().getModel();
			oModelOwner.refresh(true);

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				create: true,
				edit: true
			}), "profileModel");

		},

		handleRouteMatched: function (oEvent) {

			this.count = 0;
			this.revertCount = 120;
			this.hasFinished = false;
			this.timeOut = 120;
			this.setBusyDialog(this.resourceBundle.getText("messageLoadingWait"));

			this.getView().getModel("purchaseFormModel").setData({
				localeId: this.oNumberFormat.oLocale.sLocaleId,
				enabledConfirm: false,
				enabledCadence: false,
				enabledMessage: true,
				enabled: true,
				cadence: false,
				processado: false,
				visibleOrder: false,
				visibleCadence: false,
				visibleDelivery: false,
				comoditiesCandece: false,
				errorQntCadence: false,
				errorQntOffer: false,
				noOfferThreshold: true,
				edit: false,
				yesPercent: false,
				noPercent: false,
				visibleOffer: false,
				daysBoardingInputs: [],
				tableApprover: [],
				tableCadence: [],
				tableCadenceNew: [],
				enableHeaderFields: true,
				lockFieldsFromOffer: true,
				enableEditWerksValid: true
			});

			var oModel = this.getView().getModel();
			var oEditModel = this.getView().getModel("purchaseFormModel");
			var oData = oEditModel.oData;
			var date = new Date();
			var timezone = date.getTimezoneOffset() * 60 * 1000;

			if (oEvent.getParameter("data")) {

				var sPathKeyData = oEvent.getParameter("data").keyData;
				var aKeyData = oModel.getProperty(decodeURIComponent(sPathKeyData));
				aKeyData = JSON.parse(JSON.stringify(aKeyData));

				aKeyData.HCP_DT_ENTR_INI = new Date(aKeyData.HCP_DT_ENTR_INI);
				aKeyData.HCP_DT_ENTR_FIM = new Date(aKeyData.HCP_DT_ENTR_FIM);

				aKeyData.HCP_DT_ENTR_INI = new Date(aKeyData.HCP_DT_ENTR_INI.setTime(aKeyData.HCP_DT_ENTR_INI.getTime() + timezone));
				aKeyData.HCP_DT_ENTR_FIM = new Date(aKeyData.HCP_DT_ENTR_FIM.setTime(aKeyData.HCP_DT_ENTR_FIM.getTime() + timezone));

				aKeyData.HCP_CREATED_AT = new Date(aKeyData.HCP_CREATED_AT);
				aKeyData.HCP_UPDATED_AT = new Date(aKeyData.HCP_UPDATED_AT);

				if (aKeyData.HCP_PEDIDO_FIM == "X") {
					aKeyData.HCP_PEDIDO_FIM = true;
				} else {
					aKeyData.HCP_PEDIDO_FIM = false;
				}

				for (var key in aKeyData) {
					oData[key] = aKeyData[key];
				}
				if (oEvent.getParameter("data").tableCadence) {
					var cadenceJson = JSON.parse(decodeURIComponent(oEvent.getParameter("data").tableCadence));
					oEditModel.setProperty("/tableCadenceNew", cadenceJson);
				}

			}

			oEditModel.setProperty("/", oData);

			this.getUser().then(function (userName) {
				this.userName = userName;

				this._getApprover().then(function () {

					this._setProperties().then(function () {
						
						var oMatnr = parseFloat(oData.HCP_MATERIAL);
						
						this._getTvarvSap("S", "Z_Z586011_ATIVA_TP_CEREAL", oMatnr, 'checkCereal').then(function () {
								oModel.setProperty("/matCereal", oData.checkCereal);
						}.bind(this));
						
					
						// oEditModel.setProperty("/edit", false);
						// var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
						// // oEditModel.setProperty("/messageCadence", this.resourceBundle.getText("messageNotCadence"));
						// oMainDataForm[19].fireChange();
						// this.closeBusyDialog();
						//PROFILE
						this._searchDescriptionName();
						this.getUserProfile("View_Profile_Commodities", this.userName).then(profileData => {
							oEditModel.setProperty("/edit", false);
							this.getView().getModel("profileModel").setData(profileData);
							console.log(this.getView().getModel("profileModel").getData());
							var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
							oMainDataForm[19].fireChange(); //fire date field change
							this.checkWerks();
							this.closeBusyDialog();
						}).catch(error => {
							console.log(error);
							oEditModel.setProperty("/edit", false);
							var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
							oMainDataForm[19].fireChange(); //fire date field change
							this.closeBusyDialog();
						});
					}.bind(this));

				}.bind(this));
			}.bind(this));
		},

		checkWerks: function () {
			var oFixedOrderModel = this.getView().getModel("purchaseFormModel");
			var oProfileModel = this.getView().getModel("profileModel");
			var oProfileData = oProfileModel.getData();
			var sWerks = oFixedOrderModel.getData().HCP_WERKS;

			if (sWerks) {
				if (oProfileData.werks.filter(werks => werks.WERKS == sWerks || werks.VALOR == '*').length > 0 || oProfileData.fullAccess) {
					oFixedOrderModel.setProperty("/enableEditWerksValid", true);
				} else {
					oFixedOrderModel.setProperty("/enableEditWerksValid", false);
				}
			}else{
					oFixedOrderModel.setProperty("/enableEditWerksValid", true);
			}
		},
		
		_getTvarvSap: function (oType, oName, oLow, oProperty) {

			return new Promise(function (resolve, reject) {

				var oModelCommodities = this.getView().getModel();
				var oModel = this.getView().getModel("purchaseFormModel");
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

		_getCadenceRequired: function () {

			return new Promise(function (resolve, reject) {

				var oModelCommodities = this.getView().getModel();
				var oModel = this.getView().getModel("purchaseFormModel");
				var oData = oModel.oData;
				var aFilters = [];

				if (oData.HCP_WERKS && oData.HCP_MATNR) {

					oModel.setProperty("/flagCadence", false);
					oModel.setProperty("/visibleCadence", false);
					oModel.setProperty("/cadence", true);

					aFilters.push(new sap.ui.model.Filter({
						path: "WERKS",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_WERKS
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: "MATNR",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_MATNR
					}));

					oModelCommodities.read("/Z040041", {

						filters: aFilters,
						success: function (results) {

							var aResults = results.results;

							if (aResults.length > 0) {
								if (aResults[0].FLAG_CADENCIA == "X") {
									oModel.setProperty("/flagCadence", true);
									var oCadence = false;

									for (var i = 0; i < oData.tableCadence.length; i++) {

										var oQuantity = parseFloat(oData.tableCadence[i].HCP_QUANTIDADE).toFixed(2);

										if (oQuantity != "NaN" && oQuantity > "0.00") {
											oCadence = true;
										}

									}

									oModel.setProperty("/cadence", oCadence);

									if (oData.messageCadence != null) {
										oModel.setProperty("/visibleCadence", true);
									}

									resolve();
								}

								resolve();

							} else {
								resolve();
							}

						}.bind(this),
						error: function (error) {
							reject(error);
						}
					});

				} else {
					resolve();
				}

			}.bind(this));
		},
		
		

		_setProperties: function () {

			return new Promise(function (resolve, reject) {

				var oEditModel = this.getView().getModel("purchaseFormModel");
				var oData = oEditModel.oData;
				var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
				var oArrayDays = [];

				// oMainDataForm[19].setTo(oData.HCP_DT_ENTR_INI);
				// oMainDataForm[19].setFrom(oData.HCP_DT_ENTR_FIM);

				this.sType = oData.HCP_TIPO;

				if (oData.HCP_PEDIDO_DEP) {
					oEditModel.setProperty("/enableHeaderFields", false);
					oEditModel.setProperty("/visibleOrder", true);
				}

				if (oData.HCP_UNIQUE_KEY_OFFER) {
					oEditModel.setProperty("/lockFieldsFromOffer", false);
				}

				oMainDataForm[19].setMinDate(new Date(oData.HCP_DT_ENTR_INI.getFullYear(), oData.HCP_DT_ENTR_INI.getMonth(), 1));
				oMainDataForm[19].setMaxDate(new Date(oData.HCP_DT_ENTR_FIM.getFullYear(), oData.HCP_DT_ENTR_FIM.getMonth() + 1, 0));

				if (this.sType == "2") { //Depósito
					oEditModel.setProperty("/yesDeposit", true);
					oEditModel.setProperty("/yesTransf", false);
					oEditModel.setProperty("/visibleBase", true);
					oEditModel.setProperty("/textOption", this.resourceBundle.getText("optionBuyDepositi"));

					if (oData.HCP_BASE_PRECIF != "5") { //Outros
						oEditModel.setProperty("/yesDeposit", true);
					} else {
						oEditModel.setProperty("/yesDeposit", false);
					}

				} else {
					oEditModel.setProperty("/yesDeposit", false);
					oEditModel.setProperty("/yesTransf", true);
					oEditModel.setProperty("/visibleBase", false);
					oEditModel.setProperty("/textOption", this.resourceBundle.getText("optionTransfer"));
				}

				if (oData.HCP_STATUS == "2") { //Processado
					oEditModel.setProperty("/processado", true);
					oEditModel.setProperty("/enabled", false);
					// oEditModel.setProperty("/visibleOrder", true);
				}

				if (oData.HCP_MONDAY == "X") {
					oArrayDays.push("HCP_MONDAY");
				}
				if (oData.HCP_TUESDAY == "X") {
					oArrayDays.push("HCP_TUESDAY");
				}
				if (oData.HCP_WEDNESDAY == "X") {
					oArrayDays.push("HCP_WEDNESDAY");
				}
				if (oData.HCP_THURSDAY == "X") {
					oArrayDays.push("HCP_THURSDAY");
				}
				if (oData.HCP_FRIDAY == "X") {
					oArrayDays.push("HCP_FRIDAY");
				}
				if (oData.HCP_SATURDAY == "X") {
					oArrayDays.push("HCP_SATURDAY");
				}
				if (oData.HCP_SUNDAY == "X") {
					oArrayDays.push("HCP_SUNDAY");
				}

				oEditModel.setProperty("/HCP_MONDAY", "");
				oEditModel.setProperty("/HCP_TUESDAY", "");
				oEditModel.setProperty("/HCP_WEDNESDAY", "");
				oEditModel.setProperty("/HCP_THURSDAY", "");
				oEditModel.setProperty("/HCP_FRIDAY", "");
				oEditModel.setProperty("/HCP_SATURDAY", "");
				oEditModel.setProperty("/HCP_SUNDAY", "");
				oEditModel.setProperty("/daysBoardingInputs", oArrayDays);

				// Removido 07.09.2024 Incidente: 8000056673
				// if (oData.HCP_IDTR_NF == "S") {
				// 	oEditModel.setProperty("/yesNfExchange", true);
				// } else {
				// 	oEditModel.setProperty("/yesNfExchange", false);
				// }

				if (oData.HCP_INCOTERMS == "FOB") {
					oEditModel.setProperty("/yesFob", true);
				} else if ((oData.HCP_INCOTERMS === "FOB" || oData.HCP_INCOTERMS === "CIF") && this.sType == "3") { //Transferência
					oEditModel.setProperty("/yesFob", true);
				} else {
					oEditModel.setProperty("/yesFob", false);
				}

				if (oData.HCP_UNID_PRECIF) {
					if (oData.HCP_UNID_PRECIF == "1") {
						oEditModel.setProperty("/yesPercent", true);
					} else {
						oEditModel.setProperty("/noPercent", true);
					}
				}

				if (oData.HCP_FRETE == "0") {
					oEditModel.setProperty("/HCP_FRETE", null);
				}

				if (oData.HCP_CADENCIA == "0") {
					oEditModel.setProperty("/HCP_CADENCIA", null);
				}

				if (oData.HCP_KMSPAVIM == "0") {
					oEditModel.setProperty("/HCP_KMSPAVIM", null);
				}

				if (oData.HCP_CAPEMBDIA == "0") {
					oEditModel.setProperty("/HCP_CAPEMBDIA", null);
				}

				if (oData.HCP_STATUS == '3') {
					oEditModel.setProperty("/enabled", false);
					oEditModel.setProperty("/enabledOffer", false);

				}
					

				this._getOffer().then(function () {
					this._getCadenceRequired().then(function () {
						this._getCadence().then(function () {
							this._searchPartnerName().then(function () {
								// this._getHistoricOffer().then(function () {
								oEditModel.refresh();
								resolve();
								// }.bind(this)).catch(error => {
								// 	console.log(error);
								// 	oEditModel.refresh();
								// 	resolve();
								// });
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		},
	//Retorno de descrição HCP_TEXT1
			_searchDescriptionName: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var oEditModel = this.getView().getModel("purchaseFormModel");
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'ZTERM',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oEditModel.oData.HCP_COND_PGTO
				}));


				oModel.read("/View_Payment_Conditions", {

					filters: aFilters,

					success: function (result) {

						if (result.results.length > 0) {
							oEditModel.setProperty("/HCP_TEXT1", result.results[0].TEXT1);
						}

						resolve(result.results[0]);

					}.bind(this),
					error: function () {
						reject(error);
					}
				});

			}.bind(this));

		},

		_getApprover: function () {

			return new Promise(function (resolve, reject) {

				var oModelCommodities = this.getView().getModel();
				var oModel = this.getView().getModel("purchaseFormModel");
				var aFilters = [];

				oModel.setProperty("/tableApprover", []);

				oModelCommodities.read("/Z5133", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;
						var oDataItem = oModel.getProperty("/tableApprover");

						if (aResults.length > 0) {

							for (var i = 0; i < aResults.length; i++) {

								var aData = {
									ID_USER: aResults[i].ID_USER,
									NAME_TEXT: aResults[i].NAME_TEXT
								};

								oDataItem.push(aData);

							}

							//	var oDataResult = [...new Set(oDataItem.map(x => x.ID_USER))];
							var result = [];
							const map = new Map();
							for (const item of oDataItem) {
								if (!map.has(item.ID_USER)) {
									map.set(item.ID_USER, true); // set any value to Map
									result.push({
										ID_USER: item.ID_USER,
										NAME_TEXT: item.NAME_TEXT
									});
								}
							}

							oModel.setProperty("/tableApprover", result);
							resolve();
						} else {
							resolve();
						}

					}.bind(this),
					error: function (error) {
						resolve();
					}
				});

			}.bind(this));
		},

		_getParameters: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel("purchaseFormModel");
				var oModelCommodities = this.getView().getModel();
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_TYPE",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "Commodities"
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_PARAMETER",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "CADENCE"
				}));

				oModelCommodities.read("/Parameters", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;

						if (aResults[0].HCP_VALUE == "X") {
							oModel.setProperty("/comoditiesCandece", true);

							this._getCadence().then(function () {
								resolve();
							}.bind(this));

						} else {
							oModel.setProperty("/comoditiesCandece", false);
						}
						resolve();

					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));

		},

		_getCadence: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel("purchaseFormModel");
				var oData = oModel.oData;
				var oModelCommodities = this.getView().getModel();
				var aFilters = [];
				var oTableCadence = oData.tableCadence;
				var oDataItem = oModel.getProperty("/tableCadence");

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_TIPO",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_TIPO
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_UNIQUE_KEY
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_EXCLUDED',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: '0'
				}));

				oModelCommodities.read("/Cadence", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;

						for (var i = 0; i < aResults.length; i++) {

							var aData = {
								HCP_DATA_ATUAL: aResults[i].HCP_DATA_ATUAL,
								HCP_QUANTIDADE: aResults[i].HCP_QUANTIDADE
							};

							oDataItem.push(aData);

						}

						oModel.setProperty("/enabledCadence", true);
						oModel.setProperty("/cadence", true);
						oModel.setProperty("/tableCadence", oDataItem);
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
				var oEditModel = this.getView().getModel("purchaseFormModel");
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'LIFNR',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oEditModel.oData.HCP_LIFNR
				}));

				oModel.read("/View_Suppliers", {

					filters: aFilters,

					success: function (result) {

						if (result.results.length > 0) {
							oEditModel.setProperty("/PROVIDER_DESC", result.results[0].NAME1);
						}

						resolve();

					}.bind(this),
					error: function () {
						reject(error);
					}
				});

			}.bind(this));

		},

		onMessagePress: function () {

			var oModel = this.getView().getModel("purchaseFormModel");
			var oData = oModel.oData;
			var oDataTable = oModel.oData;

			this._getMessage().then(function () {

				if (oDataTable.itemMessages.length > 0) {

					if (!this._FragmentMessageLog) {
						this._FragmentMessageLog = sap.ui.xmlfragment("messageID" + this.getView().getId(),
							"com.sap.build.standard.brfAppDeGraosModoEditar.view.commodities.fragments.LogMessage",
							this);

						this.getView().addDependent(this._FragmentMessageLog);
					}

					var oModelMessageLog = new JSONModel({
						tableMessage: oDataTable.itemMessages
					});

					this.getView().setModel(oModelMessageLog, "messageLogFormModel");

					this._FragmentMessageLog.open();
				}

			}.bind(this));

		},

		_getMessage: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel("purchaseFormModel");
				var oData = oModel.oData;
				var oModelCommodities = this.getView().getModel();
				var aFilters = [];

				oModel.setProperty("/itemMessages", []);

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_UNIQUE_KEY
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_TIPO",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_TIPO
				}));

				oModelCommodities.read("/Commodities_Log_Messages", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;
						var oDataItem = oModel.getProperty("/itemMessages");

						if (aResults.length) {

							for (var i = 0; i < aResults.length; i++) {

								if (aResults[i].HCP_MSGTYP == "S") {
									var aIcon = "sap-icon://message-success";
								} else if (aResults[i].hcpMstyp == "E") {
									aIcon = "sap-icon://message-error";
								} else {
									aIcon = "sap-icon://message-information";
								}

								var aData = {
									HCP_MESSAGE_ID: aResults[i].HCP_MESSAGE_ID,
									HCP_MSGTYP: aResults[i].HCP_MSGTYP,
									ICON: aIcon,
									HCP_MESSAGE: aResults[i].HCP_MESSAGE
								};

								oDataItem.push(aData);

							}

							oModel.setProperty("/enabledMessage", true);
							oModel.setProperty("/itemMessages", oDataItem);
							resolve();

						} else {
							MessageBox.information(
								this.resourceBundle.getText("messageNotMessage"), {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										resolve();
									}.bind(this)
								}
							);

						}

					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));

		},

		_validateCadence: function (oEvent) {
			var oInput = oEvent.getSource();
			var oCenter = oInput.getSelectedKey();

			this._getCadenceRequired().then(function () {
				this._validateForm();
			}.bind(this));

		},
		
		onInputMaterialFormSelect: function (oEvent) {

			var oInput = oEvent.getSource();
			var oMaterial = oInput.getSelectedKey();

			this._validateMaterial(oMaterial).then(function () {
				this._validateForm();
			}.bind(this));

		},
		
		_validateMaterial: function (oMaterial) {

			return new Promise(function (resolve, reject) {
				var oModel = this.getView().getModel("purchaseFormModel");
				var oData = oModel.oData;

				oModel.setProperty("/messageMaterial", null);
				oModel.setProperty("/errorMaterial", false);

				if (oMaterial) {
					var oMatnr = oMaterial;
					oMaterial = parseFloat(oMaterial);

					this._getCadenceRequired().then(function () {
						this._getTvarvSap("S", "Z_Z586011_ATIVA_TP_CEREAL", oMaterial, 'checkCereal').then(function () {
								oModel.setProperty("/matCereal", oData.checkCereal);
								resolve();
								this._validateForm();
						}.bind(this));
					}.bind(this));

				} else {
					resolve();
				}

			}.bind(this));

		},

		_validateInputWerks: function (oEvent) {
			var oInput = oEvent.getSource();
			var oCenter = oInput.getSelectedKey();

			if (this.checkIfWerksIsInUserProfile(oCenter)) {
				this._getCadenceRequired().then(function () {
					this._validateForm();
				}.bind(this));
			} else {
				this._validateForm();
			}
		},

		checkIfWerksIsInUserProfile: function (sWerks) {
			var oProfileModel = this.getView().getModel("profileModel");
			var oFixedOrderFormModel = this.getView().getModel("purchaseFormModel");
			var oProfileData = oProfileModel.getData();

			if (sWerks) {
				if (oProfileData.werks.filter(werks => werks.WERKS == sWerks || werks.VALOR == '*').length > 0 || oProfileData.fullAccess) {
					oFixedOrderFormModel.setProperty("/enableCreateWerksValid", true);
					return true;
				} else {
					oFixedOrderFormModel.setProperty("/enableCreateWerksValid", false);
					return false;
				}
			} else {
				oFixedOrderFormModel.setProperty("/enableCreateWerksValid", true);
				return false;
			}

		},

		_onInputBaseFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("purchaseFormModel");
			var oData = oModel.oData;
			var oInput = oEvent.getSource();

			oModel.setProperty("/yesDeposit", false);

			if (oInput.getSelectedKey() === "5") { //Outros
				oModel.setProperty("/yesPercent", false);
				oModel.setProperty("/noPercent", false);
				oModel.setProperty("/HCP_UNID_PRECIF", null);
				oModel.setProperty("/HCP_VALOR_PERCENTUAL", null);
				oModel.setProperty("/HCP_VALOR_PRECIF", null);
			} else {
				if (this.sType === "2") { //Depósito
					oModel.setProperty("/yesDeposit", true);
				}
			}

			this._validateForm();

		},

		_valideInputNumber: function (oProperty) {

			var oSource = oProperty.getSource();
			var sValue;

			sValue = oProperty.mParameters.newValue;
			sValue = sValue.replace(/[^0-9,]/g, "");

			oSource.setValue(sValue);

			this._validateForm();
		},

		_validateAmountField: function (oEvent) {
			var oSource = oEvent.getSource();
			var sValue = oEvent.getParameter("newValue");

			sValue = sValue.replace(/[^0-9,-]/g, "");

			if (sValue.indexOf("-") !== -1 && sValue !== "-") {
				sValue = parseFloat("-" + sValue.replace(/[^0-9,]/g, ""));
			}

			if (!isNaN(sValue)) {
				oSource.setValue(sValue);
			} else {
				if (sValue !== "-") {
					oSource.setValue(null);
				} else {
					oSource.setValue(sValue);
				}
			}
			// oSource.setValue(sValue);

			this._validateForm();
		},

		_onInputMengeDepFormSelect: function (oEvent) {

			var oSource = oEvent.getSource();
			var sValue;

			sValue = oEvent.mParameters.newValue;
			sValue = sValue.replace(/[^0-9,]/g, "");

			oSource.setValue(sValue);

			var oModel = this.getView().getModel("purchaseFormModel");
			var oData = oModel.oData;
			var oInput = oEvent.getSource();
			var oMengeDep = oInput.getValue();
			oMengeDep = parseInt(oMengeDep.replace(/[.*+?^${}()|[\]\\]/g, ""));

			oModel.setProperty("/errorQntCadence", false);

			if (oMengeDep && oData.tableCadence.length > 0) {
				oModel.setProperty("/enabledCadence", true);
				if (oData.flagCadence === true) {
					oModel.setProperty("/visibleCadence", true);
				}
			} else {
				oModel.setProperty("/enabledCadence", false);
			}

			if (oMengeDep) {
				oModel.setProperty("/HCP_MENGE_ENTR", oMengeDep);

				var oQuantityTotal = 0;

				for (var i = 0; i < oData.tableCadence.length; i++) {

					if (oData.tableCadence[i].HCP_QUANTIDADE) {
						var oQuantity = parseInt(oData.tableCadence[i].HCP_QUANTIDADE);

						oQuantityTotal = oQuantityTotal + oQuantity;

					}

				}

				if (oQuantityTotal > oMengeDep) {
					oModel.setProperty("/errorQntCadence", true);
				}

				if (this.oMengeDispOffer < oMengeDep && oData.HCP_UNIQUE_KEY_OFFER) {
					oModel.setProperty("/errorQntOffer", true);
					oModel.setProperty("/noOfferThreshold", false);
				} else {
					oModel.setProperty("/errorQntOffer", false);
					oModel.setProperty("/noOfferThreshold", true);
				}
			}

			this._validateForm();
		},

		_onInputUnityFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("purchaseFormModel");
			var oInput = oEvent.getSource();

			oModel.setProperty("/yesPercent", false);
			oModel.setProperty("/noPercent", false);
			oModel.setProperty("/HCP_VALOR_PERCENTUAL", null);
			oModel.setProperty("/HCP_VALOR_PRECIF", null);

			if (oInput.getSelectedKey()) {
				if (oInput.getSelectedKey() === "1") {
					oModel.setProperty("/yesPercent", true);
				} else {
					oModel.setProperty("/noPercent", true);
				}
			}

			this._validateForm();

		},

		_onInputIncotermsFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("purchaseFormModel");
			var oInput = oEvent.getSource();

			if (oInput.getSelectedKey() === "FOB") {
				oModel.setProperty("/yesFob", true);
			} else if ((oInput.getSelectedKey() === "FOB" || oInput.getSelectedKey() === "CIF") && this.sType == "3") { //Transferência
				oModel.setProperty("/yesFob", true);
			} else {
				oModel.setProperty("/yesFob", false);
			}

			this._validateForm();

		},

		_onInputNfExchangeFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("purchaseFormModel");
			var oInput = oEvent.getSource();

			if (oInput.getSelectedKey() === "S") {
				oModel.setProperty("/yesNfExchange", true);
			} else {
				oModel.setProperty("/yesNfExchange", false);
			}

			this._validateForm();

		},

		// _onDateCreateRangeSelectionChange: function (oEvent) {

		// 	var oSource = oEvent.getSource();
		// 	var oModel = this.getView().getModel("purchaseFormModel");
		// 	var oData = oModel.oData;
		// 	var oDateFrom = oEvent.getParameter("from");
		// 	var oDateTo = oEvent.getParameter("to");

		// 	oSource.setValueState("None");
		// 	oSource.setValueStateText("");

		// 	oModel.setProperty("/HCP_DT_ENTR_INI", null);
		// 	oModel.setProperty("/HCP_DT_ENTR_FIM", null);
		// 	oModel.setProperty("/cadence", false);
		// 	oModel.setProperty("/visibleCadence", false);
		// 	oModel.setProperty("/messageCadence", null);

		// 	if (oEvent.getParameter("from") != null) {

		// 		if (oEvent.mParameters.valid === false) {
		// 			oSource.setValueState("Error");
		// 			oSource.setValueStateText(this.resourceBundle.getText("errorDateInvalid"));
		// 		} else {

		// 			var oDateToday = new Date();
		// 			oDateToday.setHours(10);

		// 			oDateFrom = new Date(oEvent.getParameter("from").setHours(12));

		// 			if (oDateFrom && oDateFrom < oDateToday) {
		// 				oSource.setValueState("Error");
		// 				oSource.setValueStateText(this.resourceBundle.getText("errorDateCurrentDate"));
		// 				oDateFrom = null;
		// 			} else {
		// 				if (oEvent.mParameters.to === null) {
		// 					var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
		// 					oMainDataForm[61].setTo(oDateFrom);
		// 				} else {

		// 					oDateTo = new Date(oEvent.getParameter("to").setHours(12));

		// 					var oMonthFrom = oDateFrom.getMonth();
		// 					var oMonthTo = oDateTo.getMonth();

		// 					if (oMonthFrom !== oMonthTo) {
		// 						oSource.setValueState("Error");
		// 						oSource.setValueStateText(this.resourceBundle.getText("errorDateSameMonth"));
		// 					} else {
		// 						oModel.setProperty("/HCP_DT_ENTR_INI", oDateFrom);
		// 						oModel.setProperty("/HCP_DT_ENTR_FIM", oDateTo);
		// 					}

		// 				}
		// 			}

		// 		}

		// 		if (oSource.getValueState() === "None") {

		// 			if (oData.flagCadence === true) {
		// 				oModel.setProperty("/visibleCadence", true);
		// 				oModel.setProperty("/messageCadence", this.resourceBundle.getText("messageNotCadence"));
		// 			} else {
		// 				oModel.setProperty("/visibleCadence", false);
		// 			}

		// 			if (oData.HCP_MENGE_PED_DEP > 0) {
		// 				oModel.setProperty("/enabledCadence", true);
		// 			} else {
		// 				oModel.setProperty("/enabledCadence", false);
		// 				oModel.setProperty("/visibleCadence", false);
		// 			}

		// 			oModel.setProperty("/tableCadence", []);

		// 			var oTableCadence = oData.tableCadence;
		// 			var oDataItem = oModel.getProperty("/tableCadence");

		// 			var oDatum = oData.HCP_DT_ENTR_INI;
		// 			var oDay = oData.HCP_DT_ENTR_INI.getUTCDate();
		// 			var oMonth = oData.HCP_DT_ENTR_INI.getMonth();
		// 			var oYear = oData.HCP_DT_ENTR_INI.getFullYear();
		// 			var oRangeDate = true;

		// 			while (oRangeDate === true) {

		// 				if (oDatum > oData.HCP_DT_ENTR_FIM) {
		// 					oRangeDate = false;
		// 				} else {

		// 					var aData = {
		// 						HCP_DATA_ATUAL: oDatum,
		// 						HCP_QUANTIDADE: null
		// 					};

		// 					oDataItem.push(aData);
		// 					oDay = oDay + 1;
		// 					oDatum = new Date(oYear, oMonth, oDay);
		// 					oDatum.setHours(12);

		// 				}
		// 			}

		// 			oModel.setProperty("/tableCadence", oDataItem);

		// 		} else {
		// 			oModel.setProperty("/tableCadence", []);
		// 			oModel.setProperty("/enabledCadence", false);
		// 		}

		// 	} else {
		// 		oModel.setProperty("/tableCadence", []);
		// 		oModel.setProperty("/enableCadence", false);
		// 	}

		// 	this._validateForm();

		// },

		_onDateCreateRangeSelectionChange: function (oEvent) {

			if (oEvent.getParameter("from")) {

				var oSource = oEvent.getSource();
				var oModel = this.getView().getModel("purchaseFormModel");
				var oData = oModel.oData;
				var oDateFrom = oEvent.getParameter("from");
				var oDateTo = oEvent.getParameter("to");

				var oStartDate = oData.HCP_DT_ENTR_INI;
				var oEndDate = oData.HCP_DT_ENTR_FIM;

				oSource.setValueState("None");
				oSource.setValueStateText("");

				oModel.setProperty("/HCP_DT_ENTR_INI", null);
				oModel.setProperty("/HCP_DT_ENTR_FIM", null);
				oModel.setProperty("/visibleCadence", false);
				oModel.setProperty("/messageCadence", null);

				if (oStartDate && oEndDate) {

					if (!(oStartDate instanceof Date && !isNaN(oStartDate)) && !(oEndDate instanceof Date && !isNaN(oEndDate))) {
						oSource.setValueState("Error");
						oSource.setValueStateText(this.resourceBundle.getText("errorDateInvalid"));
					} else {

						var oDateToday = new Date();
						oDateToday.setHours(10);

						oDateFrom = new Date(oStartDate.setHours(12));

						if (oDateFrom && (oDateFrom < oDateToday)) {
							oSource.setValueState("Error");
							oSource.setValueStateText(this.resourceBundle.getText("errorDateCurrentDate"));
							oDateFrom = null;
						} else {
							if (oEndDate === null) {
								var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
								oMainDataForm[19].setTo(oDateFrom);
							} else {

								oDateTo = new Date(oEndDate.setHours(12));

								var oMonthFrom = oDateFrom.getMonth();
								var oMonthTo = oDateTo.getMonth();

								if (oMonthFrom !== oMonthTo) {
									oSource.setValueState("Error");
									oSource.setValueStateText(this.resourceBundle.getText("errorDateSameMonth"));
								} else {
									oModel.setProperty("/HCP_DT_ENTR_INI", oDateFrom);
									oModel.setProperty("/HCP_DT_ENTR_FIM", oDateTo);
								}

							}
						}

					}

					if (oSource.getValueState() === "None") {

						if (oData.HCP_MENGE_PED_DEP > 0) {
							oModel.setProperty("/enabledCadence", true);
						}

						if (oData.flagCadence === true) {
							oModel.setProperty("/visibleCadence", true);
							oModel.setProperty("/messageCadence", this.resourceBundle.getText("messageNotCadence"));
							oModel.setProperty("/cadence", false);
						} else {
							oModel.setProperty("/visibleCadence", false);
							oModel.setProperty("/cadence", true);
						}

						if (oModel.oData.tableCadenceNew.length > 0) {
							oModel.setProperty("/visibleCadence", false);
							oModel.setProperty("/cadence", true);
						}

						oModel.setProperty("/tableCadence", []);

						var oTableCadence = oData.tableCadence;
						var oDataItem = oModel.getProperty("/tableCadence");

						var oDatum = oData.HCP_DT_ENTR_INI;
						var oDay = oData.HCP_DT_ENTR_INI.getUTCDate();
						var oMonth = oData.HCP_DT_ENTR_INI.getMonth();
						var oYear = oData.HCP_DT_ENTR_INI.getFullYear();
						var oRangeDate = true;
						var oDataFim = new Date(oData.HCP_DT_ENTR_FIM);
						oDataFim.setHours(12);

						while (oRangeDate === true) {

							if (oDatum > oDataFim) {
								oRangeDate = false;
							} else {

								var aData = {
									HCP_DATA_ATUAL: oDatum,
									HCP_QUANTIDADE: null
								};

								oDataItem.push(aData);
								oDay = oDay + 1;
								oDatum = new Date(oYear, oMonth, oDay);
								oDatum.setHours(12);

							}
						}

						oModel.setProperty("/tableCadence", oDataItem);

					} else {
						oModel.setProperty("/tableCadence", []);
						oModel.setProperty("/enabledCadence", false);
					}

				} else {
					oModel.setProperty("/tableCadence", []);
					oModel.setProperty("/enableCadence", false);
				}

				this._validateForm();
			}

		},

		onCadencePress: function () {

			var oModel = this.getView().getModel("purchaseFormModel");
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			var oData = oModel.oData;
			if (!this._FragmentCadence) {
				this._FragmentCadence = sap.ui.xmlfragment("cadenceEditOrderId" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.cadence.fragment.ModalCadence",
					this);

				this.getView().addDependent(this._FragmentCadence);

			}

			var oCopiedData;
			if (oData.tableCadenceNew.length > 0) {
				oCopiedData = JSON.parse(JSON.stringify(oData.tableCadenceNew));
				oData.tableCadenceNew = [];
			} else {
				oCopiedData = JSON.parse(JSON.stringify(oData.tableCadence));
			}

			for (var data of oCopiedData) {
				data.HCP_DATA_ATUAL = new Date(data.HCP_DATA_ATUAL);
			}

			if (oData.HCP_MENGE_PED_DEP) {
				this.total = oData.HCP_MENGE_PED_DEP;
				this.enableCalcule = true;
			} else {
				this.total = 0;
				this.enableCalcule = false;
			}

			var oModelCadence;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				oModelCadence = new JSONModel({
					enabledConfCadence: false,
					tableCadence: oCopiedData,
					enableHeader: false,
					enableColumn: false,
					maxValue: false,
					minValue: false,
					valorTotal: parseFloat(this.total).toFixed(),
					valorRestante: parseFloat(0).toFixed(),
					ItemCadence: oCopiedData,
					isSelected: false,
					count: oCopiedData.length,
					enableAction: true,
					modeSelect: "MultiSelect"
				});
			} else {
				oModelCadence = new JSONModel({
					enabledConfCadence: false,
					tableCadence: oCopiedData,
					enableHeader: false,
					enableColumn: false,
					maxValue: false,
					minValue: false,
					valorTotal: parseFloat(this.total).toFixed(),
					valorRestante: parseFloat(0).toFixed(),
					ItemCadence: oCopiedData,
					isSelected: false,
					count: oCopiedData.length,
					enableAction: false,
					modeSelect: "None"

				});
			}

			this.getView().setModel(oModelCadence, "cadenceFormModel");

			this._FragmentCadence.open();

			oModel.refresh();

		},

		_calculateCadence: function () {

			var tableModel = this.getView().getModel("cadenceFormModel");
			var totalPedido = parseFloat(tableModel.oData.valorTotal).toFixed(2);
			var valoresNaoSelecionados = parseFloat(0.00).toFixed(2);
			var valoresSelecionados = parseFloat(0.00).toFixed(2);
			var totalDividido = totalPedido / this.cadenceSelected.length;

			return new Promise(function (resolve, reject) {

				var oTable = sap.ui.core.Fragment.byId("cadenceEditOrderId" + this.getView().getId(), "tableCadencia");
				var items = oTable.getItems();
				var total = parseFloat(0.00).toFixed(2);
				var totalGeral = parseFloat(0.00).toFixed(2);
				var aPromises = [];

				for (var i = 0; i < items.length; i++) {
					aPromises.push(new Promise(function (resolves, reject) {

						var sPlit = items[i].oBindingContexts.cadenceFormModel.sPath.split("/");
						var sIndex = sPlit[2];
						var oData = items[i].oBindingContexts.cadenceFormModel.oModel.oData.ItemCadence[sIndex];
						if (!oData.HCP_QUANTIDADE) {
							oData.HCP_QUANTIDADE = 0;
						}
						if (!items[i].mProperties.selected) {
							oData.HCP_QUANTIDADE = 0;
							valoresNaoSelecionados = Number(valoresNaoSelecionados) + Number(parseFloat(oData.HCP_QUANTIDADE).toFixed(2));
						} else {
							valoresSelecionados = Number(valoresSelecionados) + Number(parseFloat(oData.HCP_QUANTIDADE).toFixed(2));
						}

						resolves();
					}.bind(this)));

					if (oTable.getBinding("items")) {
						oTable.getBinding("items").refresh();
					}

					tableModel.refresh();
				}

				Promise.all(aPromises).then(function () {
					resolve();

					var newPromises = [];
					var totalNovo;
					var totalSoma = valoresSelecionados + valoresNaoSelecionados;

					if (totalSoma > totalPedido) {
						totalNovo = totalPedido;
					} else {
						totalNovo = totalPedido - valoresNaoSelecionados;
					}

					var totalNovoDividido = totalNovo / this.cadenceSelected.length;
					total = parseFloat(0.00).toFixed(2);

					for (var i = 0; i < items.length; i++) {
						newPromises.push(new Promise(function (resolvesNew, reject) {
							var sPlit = items[i].oBindingContexts.cadenceFormModel.sPath.split("/");
							var sIndex = sPlit[2];
							var oData = items[i].oBindingContexts.cadenceFormModel.oModel.oData.ItemCadence[sIndex];

							if (items[i].mProperties.selected) {
								oData.HCP_QUANTIDADE = parseFloat(totalNovoDividido).toFixed(2);
								total = Number(parseFloat(total).toFixed(2)) + Number(parseFloat(oData.HCP_QUANTIDADE).toFixed(2));
							}

							totalGeral = Number(parseFloat(totalGeral).toFixed(2)) + Number(parseFloat(oData.HCP_QUANTIDADE).toFixed(2));

							resolvesNew();
						}.bind(this)));
					}

					Promise.all(newPromises).then(function () {

						var restante = parseFloat(totalNovo).toFixed(2) - parseFloat(total).toFixed(2);

						if (parseFloat(restante).toFixed(2) < 0) {
							this.cadenceSelected[0].HCP_QUANTIDADE = Number(parseFloat(this.cadenceSelected[0].HCP_QUANTIDADE).toFixed(2)) -
								Number(
									Math
									.abs(parseFloat(restante).toFixed(2)));
							total = total - Number(Math.abs(parseFloat(restante).toFixed(2)));
							totalGeral = totalGeral - Number(Math.abs(parseFloat(restante).toFixed(2)));

						} else {
							this.cadenceSelected[0].HCP_QUANTIDADE = parseFloat(Number(parseFloat(this.cadenceSelected[0].HCP_QUANTIDADE).toFixed(
									2)) +
								Number(parseFloat(restante).toFixed(2))).toFixed(2);
							total = total + Number(parseFloat(restante).toFixed(2));
							totalGeral = totalGeral + Number(parseFloat(restante).toFixed(2));
						}

						if (oTable.getBinding("items")) {
							oTable.getBinding("items").refresh();
						}

						if (total > 0 && totalGeral < totalPedido) {
							tableModel.setProperty("/enabledConfCadence", true);
						} else {
							tableModel.setProperty("/enabledConfCadence", false);
						}

						this.verifyTotal(parseFloat(totalGeral).toFixed(2), parseFloat(totalPedido).toFixed(2), this.cadenceSelected[0].HCP_DATA_ATUAL);

						tableModel.refresh();

					}.bind(this));

				}.bind(this));

			}.bind(this));
		},

		_onCadenceCancelPress: function (oEvent) {

			var oCancelModel = this.getView().getModel("cadenceFormModel");
			var oData = oCancelModel.oData;

			oCancelModel.setProperty("/enabledConfCadence", false);

			for (var i = 0; i < oData.tableCadence.length; i++) {

				oData.tableCadence[i].HCP_QUANTIDADE = null;
			}

			oEvent.getSource().getParent().close();
		},

		_onCadenceConfirPress: function (oEvent) {

			var oModel = this.getView().getModel("purchaseFormModel");
			var oCadencelModel = this.getView().getModel("cadenceFormModel");
			var oTableCadence = oCadencelModel.oData.tableCadence;

			oModel.setProperty("/tableCadence", oTableCadence);
			oModel.setProperty("/cadence", true);
			oModel.setProperty("/visibleCadence", false);
			oModel.setProperty("/messageCadence", null);
			oModel.setProperty("/errorQntCadence", false);

			oEvent.getSource().getParent().close();

			this._validateForm();
		},

		onSelectionChange: function (oEvent) {

			return new Promise(function (resolve, reject) {

				var oTable = sap.ui.core.Fragment.byId("cadenceEditOrderId" + this.getView().getId(), "tableCadencia");
				var tableModel = this.getView().getModel("cadenceFormModel");
				var itemArray = oEvent.getSource().getItems();
				tableModel.oData.isSelected = false;

				var aPromises = [];
				this.cadenceSelected = [];
				for (var i = 0; i < itemArray.length; i++) {
					aPromises.push(new Promise(function (resolves, reject) {
						if (itemArray[i].mProperties.selected) {
							this.totalSelected = parseInt(this.totalSelected) + parseInt(1);
							this.cadenceSelected.push(tableModel.getProperty(itemArray[i].getBindingContext("cadenceFormModel").getPath()));
							tableModel.oData.isSelected = true;
						}
						/*else {
							var fieldNotSelected = tableModel.getProperty(itemArray[i].getBindingContext("cadenceFormModel").getPath());
							fieldNotSelected.HCP_QUANTIDADE = 0;
						}*/
						resolves();
					}.bind(this)));
				}

				Promise.all(aPromises).then(function () {
					resolve();
					if (oTable.getBinding("items")) {
						oTable.getBinding("items").refresh();
					}
					tableModel.refresh();

				}.bind(this));
			}.bind(this));
		},

		_changeValueCadence: function (oEvent) {

			return new Promise(function (resolve, reject) {
				var oSource = oEvent.getSource();
				var oValue = oSource.getValue();
				var tableModel = this.getView().getModel("cadenceFormModel");
				var sPlit = oEvent.getSource().oParent.oBindingContexts.cadenceFormModel.sPath.split("/");
				var sIndex = sPlit[2];
				var oData = oEvent.getSource().oParent.oBindingContexts.cadenceFormModel.oModel.oData.ItemCadence[sIndex];

				if (oEvent.getParameters().value == "") {
					tableModel.oData.ItemCadence[sIndex].HCP_QUANTIDADE = 0;
				}

				if (oEvent.getSource().oParent.mProperties.selected) {
					this.cadenceSelected.splice(sIndex, 1);
					oEvent.getSource().getParent().setSelected(false);
				}

				var totalPedido = parseFloat(tableModel.oData.valorTotal).toFixed(2);
				var totalCadencia = parseFloat(0).toFixed(2);

				var aPromises = [];

				if (oValue == null || oValue == 0) {

					for (var i = 0; i < tableModel.oData.tableCadence.length; i++) {

						if (tableModel.oData.tableCadence[i].HCP_QUANTIDADE <= 0 || tableModel.oData.tableCadence[i].HCP_QUANTIDADE == null) {
							tableModel.setProperty("/enabledConfCadence", false);
						} else {
							tableModel.setProperty("/maxValue", false);
							tableModel.setProperty("/enabledConfCadence", true);
							return;
						}
					}

				} else {

					for (var i = 0; i < tableModel.oData.ItemCadence.length; i++) {

						if (!tableModel.oData.ItemCadence[i].HCP_QUANTIDADE) {
							tableModel.oData.ItemCadence[i].HCP_QUANTIDADE = 0;
						}

						aPromises.push(new Promise(function (resolves, reject) {
							totalCadencia = Number(totalCadencia) + Number(parseFloat(tableModel.oData.ItemCadence[i].HCP_QUANTIDADE).toFixed(2));
							resolves();
						}.bind(this)));

					}

					Promise.all(aPromises).then(function () {
						resolve();
						this.verifyTotal(totalCadencia, totalPedido, tableModel.oData.ItemCadence[0].HCP_DATA_ATUAL);

						if (this.cadenceSelected.length > 0) {
							tableModel.setProperty("/isSelected", true);
						} else {
							tableModel.setProperty("/isSelected", false);
						}

					}.bind(this));

				}

			}.bind(this));

		},

		verifyTotal: function (valorTotal, totalPedido) {

			var tableModel = this.getView().getModel("cadenceFormModel");
			tableModel.oData.maxValue = false;
			tableModel.oData.minValue = false;

			if (valorTotal > totalPedido) {
				tableModel.oData.maxValue = true;
				tableModel.oData.isEnable = false;
				tableModel.oData.enabledConfCadence = false;
			} else if (valorTotal == totalPedido) {
				tableModel.oData.maxValue = false;
				tableModel.oData.isEnable = true;
				tableModel.oData.enabledConfCadence = true;
			} else {
				var valor = totalPedido - valorTotal;
				tableModel.oData.valorRestante = parseFloat(valor).toFixed(2);
				tableModel.oData.minValue = true;
				tableModel.oData.isEnable = true;
				tableModel.oData.enabledConfCadence = true;
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

		onCancelPress: function () {

			var oEditModel = this.getView().getModel("purchaseFormModel");
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
			var oModel = this.getView().getModel("purchaseFormModel");

			oModel.setProperty("/", []);

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}

		},

		_validateForm: function () {
			var oFilterModel = this.getView().getModel("purchaseFormModel");
			var oData = oFilterModel.oData;

			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;

				oFilterModel.setProperty("/edit", true);

				if (oData.cadence === true && oData.errorQntCadence === false) {

					for (var m = 0; m < aInputControls.length; m++) {
						oControl = aInputControls[m].control;
						if (aInputControls[m].required && oControl.getVisible()) {
							var oInputId = aInputControls[m].control.getMetadata();

							if (oInputId.getName() === "sap.m.Input" || oInputId.getName() === "sap.m.TextArea" ||
								oInputId.getName() === "sap.m.DatePicker") {
								var sValue = oControl.getValue();
							} else if (oInputId.getName() === "sap.m.StepInput") {
								sValue = oControl.getValue();

								if (sValue > 0.0) {
									sValue = "1";
								}
							} else if (oInputId.getName() === "sap.m.MultiComboBox") {
								if (oControl.getSelectedKeys().length > 0) {
									oFilterModel.setProperty("/enabledConfirm", true);
								} else {
									oFilterModel.setProperty("/enabledConfirm", false);
									return;
								}
							} else {
								sValue = oControl.getSelectedKey();
							}

							if (sValue.length > 0 && oControl.getValueState() !== "Error") {
								if (oControl.mProperties.name === "HCP_MENGE_ENTR" || oControl.mProperties.name === "HCP_MENGE_PED_DEP" ||
									oData.HCP_INCOTERMS == "FOB" && oControl.mProperties.name === "HCP_FRETE") {

									var aValue = parseFloat(sValue);
									if (aValue > 0) {
										oFilterModel.setProperty("/enabledConfirm", true);
									} else {
										oFilterModel.setProperty("/enabledConfirm", false);
										return;
									}

								} else if (oControl.mProperties.name === "HCP_VALOR_PRECIF") {
									if (sValue === "-") {
										// oControl.setValue(null);
										oFilterModel.setProperty("/enabledConfirm", false);
										return;
									}
								} else {
									oFilterModel.setProperty("/enabledConfirm", true);
								}

							} else {
								oFilterModel.setProperty("/enabledConfirm", false);
								return;
							}
						}
					}
				} else {
					oFilterModel.setProperty("/enabledConfirm", false);
				}

			}.bind(this), 100);
		},

		_getFormFields: function () {
			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var aControls = [];
			var sControlType;

			for (var i = 0; i < oMainDataForm.length; i++) {
				var sControlType1 = oMainDataForm[i].getMetadata().getName();
				if (sControlType1 === "sap.m.Label") {
					if (sControlType = oMainDataForm[i + 1]) {
						sControlType = oMainDataForm[i + 1].getMetadata().getName();
						if (sControlType === "sap.m.Input" || sControlType === "sap.m.ComboBox" || sControlType === "sap.m.DatePicker" ||
							sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" ||
							sControlType === "sap.m.DatePicker" || sControlType === "sap.m.TextArea" || sControlType === "sap.m.StepInput" || sControlType ===
							"sap.m.MultiComboBox") {
							aControls.push({
								control: oMainDataForm[i + 1],
								required: oMainDataForm[i].getRequired(),
								text: oMainDataForm[i].getText()
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
		},

		closeBusyDialog: function () {
			if (this.busyDialog) {
				this.busyDialog.close();
			}
		},

		backToIndex: function () {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//oRouter.navTo("commodities.Index", true);
			oRouter.navTo("offerMap.FilterOfferMap", true);

		},

		_handlePartnerFilterPress: function (oEvent) {
			var oFilterBar;
			if (!this.oPartnerFilter || this.oPartnerFilter.bIsDestroyed) {
				this.oPartnerFilter = sap.ui.xmlfragment("partnerFilterID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.commodities.fragments.PartnerFilter", this);
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
			var oModel = this.getView().getModel("purchaseFormModel");
			var oData = oModel.getProperty("/");
			var SelectedPartner = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

			oData["HCP_LIFNR"] = SelectedPartner.LIFNR;
			oData["PROVIDER_DESC"] = SelectedPartner.NAME1;

			oModel.refresh();
			this.oPartnerFilter.destroy();

			this._validateForm();

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

		redirectEdit: function () {

			var oModel = this.getView().getModel();
			var oCreateModel = this.getView().getModel("purchaseFormModel");
			var oData = oCreateModel.oData;
			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_UNIQUE_KEY",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.uniqueKey
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_TIPO",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.sType
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_CREATED_BY",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.userName
			}));

			var aMessage = this.resourceBundle.getText("errorCreateOrder") + " " + oData.textOption;

			oModel.read("/Commodities_Order", {
				filters: aFilters,
				success: function (results) {

					var aResults = results.results;
					if (aResults.length > 0) {

						var sPath = this.buildEntityPath("Commodities_Order", aResults[0], "HCP_ORDER_ID");

						this.oRouter.navTo("commodities.EditDepositTransf", {
							keyData: encodeURIComponent(sPath)
						});
					}

				}.bind(this),
				error: function () {
					MessageBox.error(
						aMessage, {
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (sAction) {
								this.closeBusyDialog();
							}.bind(this)
						}
					);
				}.bind(this)
			});

		},

		deleteCadence: function (aUniqueKey) {

			return new Promise(function (resolve, reject) {

				var oModelCommodities = this.getView().getModel();
				oModelCommodities.setUseBatch(true);
				var aDeferredGroups = oModelCommodities.getDeferredGroups();
				var sPath;
				var aFilters = [];

				var oModel = this.getView().getModel("purchaseFormModel");
				var oData = oModel.oData;

				// if (oData.processado === false) { //Pendente

				if (aDeferredGroups.indexOf("removes") < 0) {
					aDeferredGroups.push("removes");
					oModelCommodities.setDeferredGroups(aDeferredGroups);
				}

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_UNIQUE_KEY
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_TIPO",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_TIPO
				}));

				oModelCommodities.read("/Cadence", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;

						if (aResults.length > 0) {

							for (var i = 0; i < aResults.length; i++) {

								sPath = this.buildEntityPath("Cadence", aResults[i], "HCP_CADENCE_ID");

								oModelCommodities.remove(sPath, {
									groupId: "removes"
								});

							}

							oModelCommodities.submitChanges({
								groupId: "removes",
								success: function () {
									resolve();
								}.bind(this),
								error: function () {
									resolve();
								}.bind(this)
							});

						} else {
							resolve();
						}

					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});

				// } else {
				// 	resolve();
				// }
			}.bind(this));

		},

		onSavePress: function (oEvent) {

			this.count = 0;
			this.revertCount = 120;
			this.hasFinished = false;
			this.timeOut = 120;
			this.message = "Enviando dados, por favor aguarde (";
			this.verifyTimeOut(true);
			var aUserName = this.userName;
			var sCounter = 0;
			var sTimestamp = new Date().getTime() + sCounter;
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var aDeferredGroups = oModel.getDeferredGroups();

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			var oEditModel = this.getView().getModel("purchaseFormModel");
			oEditModel.setProperty("/enabledConfirm", false);
			var oData = oEditModel.oData;

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}

			this.uniqueKey = oData.HCP_UNIQUE_KEY;
			this.oType = oData.HCP_TIPO;

			this.deleteCadence(this.uniqueKey).then(function () {

				sCounter = sCounter + 1;

				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
					var oStatus = "1"; //Pendente
				} else {
					oStatus = "0"; //Registro criado Off, não será enviado ao ECC
				}

				for (var i = 0; i < oData.daysBoardingInputs.length; i++) {

					oData[oData.daysBoardingInputs[i]] = "X";

				}

				var aData = {
					HCP_ORDER_ID: oData.HCP_ORDER_ID,
					HCP_UNIQUE_KEY: oData.HCP_UNIQUE_KEY,
					HCP_PEDIDO_DEP: oData.HCP_PEDIDO_DEP,
					HCP_STATUS: oStatus,
					HCP_TIPO: oData.HCP_TIPO,
					HCP_OFFER_NUMBER: oData.HCP_OFFER_NUMBER,
					HCP_LIFNR: oData.HCP_LIFNR,
					HCP_MATNR: oData.HCP_MATNR,
					HCP_WERKS: oData.HCP_WERKS,
					HCP_COND_PGTO: oData.HCP_COND_PGTO,
					HCP_EKGRP: oData.HCP_EKGRP,
					HCP_MENGE_ENTR: parseFloat(oData.HCP_MENGE_ENTR).toFixed(2),
					HCP_DT_ENTR_INI: oData.HCP_DT_ENTR_INI,
					HCP_DT_ENTR_FIM: oData.HCP_DT_ENTR_FIM,
					HCP_INCOTERMS: oData.HCP_INCOTERMS,
					HCP_FRETE: oData.HCP_FRETE ? parseFloat(oData.HCP_FRETE).toFixed(2) : "0.00",
					HCP_LOC_RET: oData.HCP_LOC_RET,
					HCP_OBS_PRECO: oData.HCP_OBS_PRECO,
					HCP_MENGE_PED_DEP: parseFloat(oData.HCP_MENGE_PED_DEP).toFixed(2),
					HCP_CADENCIA: oData.HCP_CADENCIA ? parseFloat(oData.HCP_CADENCIA).toFixed(2) : "0.00",
					HCP_BASE_PRECIF: oData.HCP_BASE_PRECIF,
					HCP_UNID_PRECIF: oData.HCP_UNID_PRECIF,
					HCP_VALOR_PERCENTUAL: oData.HCP_VALOR_PERCENTUAL ? parseFloat(oData.HCP_VALOR_PERCENTUAL).toFixed(2) : "0.00",
					HCP_VALOR_PRECIF: oData.HCP_VALOR_PRECIF ? parseFloat(oData.HCP_VALOR_PRECIF).toFixed(2) : "0.00",
					HCP_PEDIDO_FIM: oData.HCP_PEDIDO_FIM === true ? "X" : " ",
					HCP_BEDNR: oData.HCP_BEDNR,
					HCP_CITY_EMB: oData.HCP_CITY_EMB,
					HCP_REFER_EMB: oData.HCP_REFER_EMB,
					HCP_KMSPAVIM: oData.HCP_KMSPAVIM ? parseFloat(oData.HCP_KMSPAVIM).toFixed(2) : "0.00",
					HCP_HORAEMB: oData.HCP_HORAEMB,
					HCP_EMBCHUVA: oData.HCP_EMBCHUVA,
					HCP_CAPEMBDIA: oData.HCP_CAPEMBDIA ? parseFloat(oData.HCP_CAPEMBDIA).toFixed(2) : "0.00",
					HCP_MONDAY: oData.HCP_MONDAY,
					HCP_TUESDAY: oData.HCP_TUESDAY,
					HCP_WEDNESDAY: oData.HCP_WEDNESDAY,
					HCP_THURSDAY: oData.HCP_THURSDAY,
					HCP_FRIDAY: oData.HCP_FRIDAY,
					HCP_SATURDAY: oData.HCP_SATURDAY,
					HCP_SUNDAY: oData.HCP_SUNDAY,
					HCP_TPCEREAL: oData.HCP_TPCEREAL,
					HCP_CREATED_BY: oData.HCP_CREATED_BY,
					HCP_UPDATED_BY: aUserName,
					HCP_CREATED_AT: oData.HCP_CREATED_AT,
					HCP_UPDATED_AT: new Date()

				};

				if (oData.HCP_UNIQUE_KEY_OFFER) {
					var oHistoricRecord = oEditModel.getProperty("/historicOffer");
					var sHistoricPath = this.buildEntityPath("Commodities_Historic_Offer", oHistoricRecord, "HCP_HISTORIC_ID");

					var aDataHistoric = {
						HCP_WERKS: oData.HCP_WERKS,
						HCP_LOCAL: oData.HCP_LIFNR,
						HCP_MENGE: parseFloat(oData.HCP_MENGE_PED_DEP / 1000).toFixed(2),
						HCP_UPDATED_BY: aUserName,
						HCP_UPDATED_AT: new Date(),
						HCP_EBELN: oData.HCP_PEDIDO_DEP || null
					};

					oModel.update(sHistoricPath, aDataHistoric, {
						groupId: "changes"
					});

				}

				var sPath = this.buildEntityPath("Commodities_Order", aData, "HCP_ORDER_ID");

				oModel.update(sPath, aData, {
					groupId: "changes"
				});

				sCounter = sCounter + 1;

				for (var i = 0; i < oData.tableCadence.length; i++) {

					var sCadenceKey = new Date().getTime() + sCounter;
					sCounter = sCounter + 1;

					if (oData.tableCadence[i].HCP_QUANTIDADE == null || oData.tableCadence[i].HCP_QUANTIDADE == " ") {
						oData.tableCadence[i].HCP_QUANTIDADE = "0.00";
					}

					var aDataCadence = {
						HCP_CADENCE_ID: sCadenceKey.toFixed(),
						HCP_UNIQUE_KEY: this.uniqueKey,
						HCP_CENTER: oData.HCP_WERKS,
						HCP_DATA_ATUAL: oData.tableCadence[i].HCP_DATA_ATUAL,
						HCP_QUANTIDADE: parseFloat(oData.tableCadence[i].HCP_QUANTIDADE).toFixed(2),
						HCP_SALDO: "0.00",
						HCP_TIPO: oData.HCP_TIPO,
						HCP_CREATED_BY: aUserName,
						HCP_CREATED_AT: new Date()
					};

					oModel.createEntry("/Cadence", {
						properties: aDataCadence
					}, {
						groupId: "changes"
					});

				}
				var aMessage = this.resourceBundle.getText("errorCreateOrder") + " " + oData.textOption;

				//this.setBusyDialog(this.resourceBundle.getText("messageSaving"));

				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
					oModel.submitChanges({
						groupId: "changes",
						success: function () {
							this.flushStore("Commodities_Order,Cadence,Commodities_Historic_Offer").then(function () {
								//this.refreshStore("Commodities_Order", "Cadence", "Commodities_Historic_Offer").then(function () {

									this.hasFinished = true;

									if (bIsMobile) {
										localStorage.setItem("lastUpdateCommodities", new Date());
										localStorage.setItem("countStorageCommodities", 0);
									}

									var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
									var sMessage = "A compra foi salva com sucesso! Deseja se comunicar com o SAP?";

									MessageBox.success(
										sMessage, {
											actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
											styleClass: bCompact ? "sapUiSizeCompact" : "",
											onClose: function (sAction) {
												if (sAction === "YES") {

													this.count = 0;
													this.revertCount = 500;
													this.timeOut = 500;
													this.hasFinished = false;
													this.message = "Processando dados, por favor aguarde (";
													this.verifyTimeOut();

													this.submitCommoditiesEcc(this.uniqueKey, this.oType, false, false).then(function (oSucess) {

														this.hasFinished = true;
														if (oSucess == true) {
															//this.closeBusyDialog();
															this.backToIndex();
														}

													}.bind(this));

												} else {
													this.backToIndex();
												}
											}.bind(this)
										}
									);

								//}.bind(this));
							}.bind(this));
						}.bind(this),
						error: function () {
							this.hasFinished = true;
							MessageBox.error(
								aMessage, {
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
							MessageBox.information(
								this.resourceBundle.getText("messageOffCommodities"), {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										//this.closeBusyDialog();
										this.backToIndex();
									}.bind(this)
								}
							);
						}.bind(this),
						error: function () {
							this.hasFinished = true;
							MessageBox.error(
								aMessage, {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
										//this.backToIndex();
									}.bind(this)
								}
							);
						}.bind(this)
					});
				}

			}.bind(this));

		},

		_getOffer: function (oKeyOffer, oUserArray) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var oEditModel = this.getView().getModel("purchaseFormModel");
				var oData = oEditModel.oData;
				var aFilters = [];
				var oDateTo;
				var oDataFrom;

				// if (oData.HCP_UNIQUE_KEY_OFFER && oData.HCP_STATUS != "2") {
				if (oData.HCP_UNIQUE_KEY_OFFER) {

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_UNIQUE_KEY',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_UNIQUE_KEY_OFFER
					}));

					oModel.read("/Offer_Map", {

						filters: aFilters,
						success: function (results) {

							var aResults = results.results;

							if (aResults.length > 0) {

								oEditModel.setProperty("/visibleOffer", true);

								var oDate = new Date();

								//Ano menor igual e mês menor
								if (aResults[0].HCP_DATE_START.getFullYear() < oDate.getFullYear() || //Ano Menor
									(aResults[0].HCP_DATE_START.getFullYear() <= oDate.getFullYear() && aResults[0].HCP_DATE_START.getMonth() < oDate.getMonth())
								) {

									oEditModel.setProperty("/processado", true);
									oEditModel.setProperty("/enabled", false);

									var oMessage = this.resourceBundle.getText("messageNotCommodities") + this.resourceBundle.getText(
										"messageErrorShipment");
									oEditModel.setProperty("/messageShipment", oMessage);

									oFirstDay = new Date(aResults[0].HCP_DATE_START.getFullYear(), aResults[0].HCP_DATE_START.getMonth(), 1);

								} else {

									if (oDate.getMonth() == aResults[0].HCP_DATE_START.getMonth()) {

										if (aResults[0].HCP_DATE_START < new Date()) {
											aResults[0].HCP_DATE_START = new Date();
										}

										var oFirstDay = new Date();

									} else {
										oFirstDay = new Date(oDate.getFullYear(), oDate.getMonth(), 1);
									}

								}

								var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
								var oDate = new Date();

								var oLastDay = new Date(oDate.getFullYear(), oDate.getMonth() + 1, 0);

								if (oDate.getFullYear() != aResults[0].HCP_DATE_START.getFullYear()) {
									oFirstDay = new Date(aResults[0].HCP_DATE_START.getFullYear(), aResults[0].HCP_DATE_START.getMonth(), 1);
									oLastDay = new Date(aResults[0].HCP_DATE_START.getFullYear(), aResults[0].HCP_DATE_START.getMonth() + 1, 0);
								}

								// oMainDataForm[19].setFrom(aResults[0].HCP_DATE_START);
								// oMainDataForm[19].setTo(aResults[0].HCP_DATE_END);

								// oMainDataForm[19].setMinDate(oFirstDay);
								// oMainDataForm[19].setMaxDate(oLastDay);

								var aDateStart = aResults[0].HCP_DATE_START;

								aResults[0].HCP_DATE_START = this.getTimeZoneData(aResults[0].HCP_DATE_START, true);

								oEditModel.setProperty("/visibleDelivery", true);

								this.oMengeDispOffer = parseFloat(aResults[0].HCP_VOLUME);

								if (oEditModel.oData.errorShipment == false) {

									var oDateToday = new Date();
									oDateToday = this.getTimeZoneData(oDateToday, false);

									if (oDateToday > aResults[0].HCP_DATE_START) {
										aResults[0].HCP_DATE_START = oDateToday;
									}
								}

								this.formatterDate(oFirstDay).then(function (oDataFrom) {
									this.formatterDate(oLastDay).then(function (oDateTo) {

										if (!oMessage) {
											oMessage = this.resourceBundle.getText("messageDelivery") + oDataFrom + " - " + oDateTo;
											oEditModel.setProperty("/messageDelivery", oMessage);
										}

										this._getHistoricOffer().then(function () {
											resolve();
										}.bind(this));
									}.bind(this));
								}.bind(this));

							} else {
								resolve();
							}

						}.bind(this),
						error: function (error) {
							resolve();
						}
					});

				} else {
					// this._getHistoricOffer().then(function () {
					resolve();
					// }.bind(this));
				}
			}.bind(this));

		},

		formatterDate: function (oDateOffer) {

			return new Promise(function (resolve, reject) {

				if (oDateOffer) {
					var oDay = oDateOffer.getUTCDate();

					if (oDay < 10) {
						oDay = "0" + oDay;
					}

					var oMonth = oDateOffer.getMonth() + 1;

					if (oMonth < 10) {
						oMonth = "0" + oMonth;
					} else {
						oMonth = oMonth.toString();
					}
					var oYear = oDateOffer.getFullYear();

					var oDate = oDay.toString() + "/" + oMonth.toString() + "/" + oYear.toString();

					resolve(oDate);

				} else {
					resolve();
				}

			}.bind(this));

		},

		_getHistoricOffer: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var oEditModel = this.getView().getModel("purchaseFormModel");
				var oData = oEditModel.oData;
				var aFilters = [];

				if (oData.HCP_UNIQUE_KEY_OFFER) {
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_UNIQUE_KEY_OFFER',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_UNIQUE_KEY_OFFER
					}));

					oModel.read("/Commodities_Historic_Offer", {
						filters: aFilters,
						success: function (result) {
							var aResults = result.results;

							for (var i = 0; i < aResults.length; i++) {

								if (aResults[i].HCP_UNIQUE_KEY_ORDER == oData.HCP_UNIQUE_KEY) {
									oEditModel.setProperty("/HCP_HISTORIC_ID", aResults[i].HCP_HISTORIC_ID);
									oEditModel.setProperty("/historicOffer", aResults[i]);
								} else {
									this.oMengeDispOffer = this.oMengeDispOffer - aResults[i].HCP_MENGE;
								}
							}

							if (this.oMengeDispOffer > 0) { //Quantidade Disponivel da oferta para compra
								oEditModel.setProperty("/errorMenge", false);
								oEditModel.setProperty("/errorQntOffer", false);
								oEditModel.setProperty("/noOfferThreshold", true);
								// oEditModel.setProperty("/HCP_MENGE", this.oMengeDispOffer);
								oEditModel.setProperty("/HCP_MENGE_OFFER", this.oMengeDispOffer * 1000);

							} else {
								oEditModel.setProperty("/errorMenge", true);
								oEditModel.setProperty("/errorQntOffer", true);
								oEditModel.setProperty("/noOfferThreshold", false);
							}

							this.oMengeDispOffer = this.oMengeDispOffer * 1000;

							resolve();

						}.bind(this),
						error: function (error) {
							reject(error);
						}
					});
				} else {
					resolve();
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
						this.setBusyDialog("App Grãos", this.message + this.revertCount +
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

			var oModel = this.getView().getModel("purchaseFormModel");
				var oData = oModel.getProperty("/");
			var SelectedPaymentTerm = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

			oData["HCP_ZTERM"] = SelectedPaymentTerm.ZTERM;
			oData["HCP_COND_PGTO"] = SelectedPaymentTerm.ZTERM;
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