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

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.commodities.NewDepositTransf", {

		onInit: function () {

			var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
			var sLocale = sCurrentLocale.split("-");
			var oLocale = new sap.ui.core.Locale(sLocale[0], sLocale[1]);
			this.oNumberFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance(oLocale);

			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("commodities.NewDepositTransf").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				localeId: this.oNumberFormat.oLocale.sLocaleId,
				enabledConfirm: false,
				enabledCadence: false,
				cadence: false,
				visibleCadence: false,
				comoditiesCandece: false,
				errorQntCadence: false,
				edit: false,
				visibleBase: false,
				yesDeposit: false,
				yesTransf: false,
				yesFob: false,
				yesPercent: false,
				noPercent: false,
				yesNfExchange: false,
				visibleOffer: false,
				visibleDelivery: false,
				HCP_PEDIDO_FIM: false,
				HCP_EMBCHUVA: "N",
				HCP_MONDAY: "",
				HCP_TUESDAY: "",
				HCP_WEDNESDAY: "",
				HCP_THURSDAY: "",
				HCP_FRIDAY: "",
				HCP_SATURDAY: "",
				HCP_SUNDAY: "",
				daysBoardingInputs: ["HCP_MONDAY", "HCP_TUESDAY", "HCP_WEDNESDAY", "HCP_THURSDAY", "HCP_FRIDAY"],
				tableCadence: [],
				tableApprover: [],
				lockFieldsFromOffer: true,
				errorQntOffer: false,
				enableCreateWerksValid: true,
				errorNoQntLeft: false,
				matCereal: false,
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

			if (oEvent.getParameter("data")) {
				this.sType = oEvent.getParameter("data").type;

				var sKeyData = oEvent.getParameter("data").keyData;
				var aKeyData = true;

				if (sKeyData) {
					aKeyData = JSON.parse(sKeyData);
				}
				
			

				if (this.sType == "2" || aKeyData.HCP_TIPO == "2") { //Depósito
					var aDeposit = true;
					var aTransf = false;
					var aTextOption = this.resourceBundle.getText("optionBuyDepositi");
				} else {
					aDeposit = false;
					aTransf = true;
					aTextOption = this.resourceBundle.getText("optionTransfer");
				}
			}

			this.getView().getModel("purchaseFormModel").setData({
				localeId: this.oNumberFormat.oLocale.sLocaleId,
				enabledConfirm: false,
				enabledCadence: false,
				freightMsg: false,
				cadence: false,
				visibleCadence: false,
				comoditiesCandece: false,
				errorQntCadence: false,
				visibleBase: aDeposit,
				yesDeposit: aDeposit,
				yesTransf: aTransf,
				textOption: aTextOption,
				edit: false,
				yesFob: false,
				yesPercent: false,
				noPercent: false,
				yesNfExchange: false,
				visibleOffer: false,
				visibleDelivery: false,
				HCP_TIPO: this.sType || aKeyData.HCP_TIPO.toString(),
				HCP_PEDIDO_FIM: false,
				HCP_EMBCHUVA: "N",
				HCP_MONDAY: "",
				HCP_TUESDAY: "",
				HCP_WEDNESDAY: "",
				HCP_THURSDAY: "",
				HCP_FRIDAY: "",
				HCP_SATURDAY: "",
				HCP_SUNDAY: "",
				daysBoardingInputs: ["HCP_MONDAY", "HCP_TUESDAY", "HCP_WEDNESDAY", "HCP_THURSDAY", "HCP_FRIDAY"],
				tableCadence: [],
				tableApprover: [],
				lockFieldsFromOffer: true,
				errorQntOffer: false,
				enableCreateWerksValid: true,
				errorNoQntLeft: false,
				matCereal: false,
			});

			// if (oEvent.getParameter("data")) {
			// 	var sKeyData = oEvent.getParameter("data").keyData;
			// 	var aKeyData = true;

			// 	if (sKeyData) {
			// 		aKeyData = JSON.parse(sKeyData);
			// 	}
			// }

			// var aKeyData = {
			// 	HCP_UNIQUE_KEY_OFFER: "b8f931ab-589a-41da-b905-f415b10ea341",
			// 	HCP_TIPO: "2",
			// 	HCP_WERKS: "208",
			// 	HCP_LOCAL: "0000388622"
			// };
			
			if (aKeyData.HCP_TPCEREAL) { 
				this.getView().getModel("purchaseFormModel").setProperty("/matCereal", true);
			} 
			this.getUser().then(function (userName) {
				this.userName = userName;
				this.checkUserInfo(this.userName).then(function (userArray) {
					this._getTvarvSap("P", "Z_Z586011_ATIVAR_REGRAS", null, 'checkActive').then(function () {
						if (userArray) {
							this.getView().getModel("purchaseFormModel").setProperty("/HCP_EKGRP", userArray.EKGRP);
							this.getView().getModel("purchaseFormModel").setProperty("/HCP_WERKS", userArray.WERKS_D);
							this.getView().getModel("purchaseFormModel").setProperty("/HCP_MAILSOL", userArray.EMAIL);
						}
						this._getOffer(aKeyData, userArray).then(function () {
							this._getDepositForWerks(userArray.WERKS_D).then(function () {
								this._getApprover(userArray.WAERS).then(function () {
									//PROFILE
									this.getUserProfile("View_Profile_Commodities", this.userName).then(profileData => {
										this.closeBusyDialog();
										this.getView().getModel("profileModel").setData(profileData);
										console.log(this.getView().getModel("profileModel").getData());
										var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
										oMainDataForm[17].fireChange(); //fire date field change
											
									}).catch(error => {
										console.log(error);
										var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
										oMainDataForm[17].fireChange(); //fire date field change
										this.closeBusyDialog();
									});
								}.bind(this));
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this)).catch(error => {
				console.log(error);
				this.closeBusyDialog();
			});
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

							oModel.setProperty("/flagCadence", false);
							oModel.setProperty("/cadence", true);
							oModel.setProperty("/visibleCadence", false);

							if (aResults.length > 0) {
								if (aResults[0].FLAG_CADENCIA == "X") {
									oModel.setProperty("/flagCadence", true);
									oModel.setProperty("/cadence", false);
									oModel.setProperty("/visibleCadence", true);
								}
							}

							if (oData.HCP_UNIQUE_KEY_OFFER) {
								this._defineRangeCadence().then(function () {
									resolve();
								}.bind(this));
							} else {
								resolve();
							}

							// if (aResults.length > 0) {
							// 	if (aResults[0].FLAG_CADENCIA == "X") {
							// 		oModel.setProperty("/flagCadence", true);
							// 		var oCadence = false;

							// 		for (var i = 0; i < oData.tableCadence.length; i++) {

							// 			var oQuantity = parseFloat(oData.tableCadence[i].HCP_QUANTIDADE).toFixed(2);

							// 			if (oQuantity != "NaN" && oQuantity > "0.00") {
							// 				oCadence = true;
							// 			}

							// 		}

							// 		oModel.setProperty("/cadence", oCadence);

							// 		if (oData.messageCadence != null) {
							// 			oModel.setProperty("/visibleCadence", true);
							// 		}

							// 		resolve();
							// 	}

							// 	resolve();

							// } else {
							// 	resolve();
							// }

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
								if(!oData.checkCereal){
										oModel.setProperty("/HCP_TPCEREAL", null);
								}
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
			} else{
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

				if (this.oMengeDispOffer < oMengeDep && !oData.lockFieldsFromOffer) { //lockFieldsFromOffer diz se veio da oferta, se false significa que sim, portanto não validar histórico.
					oModel.setProperty("/errorQntOffer", true);
				} else {
					oModel.setProperty("/errorQntOffer", false);
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
					oModel.setProperty("/HCP_VALOR_PERCENTUAL", "0.1");
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

			if (this.sType == "2") { //Depósito

				if (oInput.getSelectedKey() === "S") {
					oModel.setProperty("/yesNfExchange", true);
				} else {
					oModel.setProperty("/yesNfExchange", false);
				}

			} else {
				oModel.setProperty("/yesNfExchange", false);
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

		_defineRangeCadence: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel("purchaseFormModel");
				var oData = oModel.oData;
				var oTableCadence = oData.tableCadence;
				var oDataItem = oModel.getProperty("/tableCadence");
				var oDatum = oData.HCP_DT_ENTR_INI;
				var oDay = oData.HCP_DT_ENTR_INI.getUTCDate();
				var oMonth = oData.HCP_DT_ENTR_FIM.getMonth();
				var oYear = oData.HCP_DT_ENTR_FIM.getFullYear();
				var oRangeDate = true;

				if (oData.HCP_MENGE > 0) {
					oModel.setProperty("/enabledCadence", true);
				}

				if (oData.flagCadence === true) {
					oModel.setProperty("/visibleCadence", true);
				} else {
					oModel.setProperty("/visibleCadence", false);
				}

				oModel.setProperty("/tableCadence", []);

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
				resolve();

			}.bind(this));

		},

		_onDateCreateRangeSelectionChange: function (oEvent) {

			var oSource = oEvent.getSource();
			var oModel = this.getView().getModel("purchaseFormModel");
			var oData = oModel.oData;
			var oDateFrom = oEvent.getParameter("from");
			var oDateTo = oEvent.getParameter("to");
			var bIsFromOffer = oModel.getProperty("/lockFieldsFromOffer");

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
							oMainDataForm[17].setTo(oDateFrom);
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
				oModel.setProperty("/enabledCadence", false);
			}

			this._validateForm();
		},

		onCadencePress: function () {

			var oModel = this.getView().getModel("purchaseFormModel");
			var oData = oModel.oData;

			if (!this._FragmentCadence) {
				this._FragmentCadence = sap.ui.xmlfragment("cadenceNewOrderId" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.cadence.fragment.ModalCadence",
					this);
				this.getView().addDependent(this._FragmentCadence);

			}

			var oCopiedData = JSON.parse(JSON.stringify(oData.tableCadence));

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

			var oModelCadence = new JSONModel({
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

				var oTable = sap.ui.core.Fragment.byId("cadenceNewOrderId" + this.getView().getId(), "tableCadencia");
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
							this.cadenceSelected[0].HCP_QUANTIDADE = Number(parseFloat(this.cadenceSelected[0].HCP_QUANTIDADE).toFixed(2)) - Number(
								Math
								.abs(parseFloat(restante).toFixed(2)));
							total = total - Number(Math.abs(parseFloat(restante).toFixed(2)));
							totalGeral = totalGeral - Number(Math.abs(parseFloat(restante).toFixed(2)));

						} else {
							this.cadenceSelected[0].HCP_QUANTIDADE = parseFloat(Number(parseFloat(this.cadenceSelected[0].HCP_QUANTIDADE).toFixed(2)) +
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

				var oTable = sap.ui.core.Fragment.byId("cadenceNewOrderId" + this.getView().getId(), "tableCadencia");
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

		_validateForm: function (oEvent) {
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
				value1: oData.HCP_TIPO
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
							keyData: encodeURIComponent(sPath),
							tableCadence: encodeURIComponent(JSON.stringify(oData.tableCadence))
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

		onSavePress: function (oEvent) {

			this.count = 0;
			this.revertCount = 80; //old 40
			this.hasFinished = false;
			this.timeOut = 80; //old 40
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

			var oCreateModel = this.getView().getModel("purchaseFormModel");
			oCreateModel.setProperty("/enabledConfirm", false);
			var oData = oCreateModel.oData;
			var sCounter = 0;

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}

			this.uniqueKey = this.generateUniqueKey();
			this.oType = oData.HCP_TIPO;

			var sTimestamp = new Date().getTime() + sCounter;
			sCounter = sCounter + 1;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				var oStatus = "1"; //Pendente
			} else {
				oStatus = "0"; //Registro criado Off, não será enviado ao ECC
				oData.HCP_OFFER_NUMBER = "";
			}

			for (var i = 0; i < oData.daysBoardingInputs.length; i++) {

				oData[oData.daysBoardingInputs[i]] = "X";

			}

			var aData = {
				HCP_ORDER_ID: sTimestamp.toFixed(),
				HCP_UNIQUE_KEY: this.uniqueKey,
				HCP_STATUS: oStatus,
				HCP_TIPO: oData.HCP_TIPO,
				HCP_OFFER_NUMBER: oData.HCP_OFFER_NUMBER,
				HCP_UNIQUE_KEY_OFFER: oData.HCP_UNIQUE_KEY_OFFER,
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
				HCP_PLATAFORM: bIsMobile ? '1' : '2',
				HCP_CREATED_BY: aUserName,
				HCP_CREATED_AT: new Date()

			};

			oModel.createEntry("/Commodities_Order", {
				properties: aData
			}, {
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
					HCP_PLATAFORM: bIsMobile ? '1' : '2',
					HCP_CREATED_BY: aUserName,
					HCP_CREATED_AT: new Date()
				};

				oModel.createEntry("/Cadence", {
					properties: aDataCadence
				}, {
					groupId: "changes"
				});

			}

			if (oData.HCP_UNIQUE_KEY_OFFER) {

				var sHistoricKey = new Date().getTime() + sCounter;
				sCounter = sCounter + 1;

				var aDataHistoric = {
					HCP_HISTORIC_ID: sHistoricKey.toFixed(),
					HCP_UNIQUE_KEY_OFFER: oData.HCP_UNIQUE_KEY_OFFER,
					HCP_UNIQUE_KEY_ORDER: this.uniqueKey,
					HCP_TIPO: oData.HCP_TIPO,
					HCP_WERKS: oData.HCP_WERKS,
					HCP_LOCAL: oData.HCP_LIFNR,
					HCP_MENGE_OFFER: parseFloat(oData.HCP_MENGE_ORIGINAL).toFixed(2),
					HCP_MENGE: parseFloat(oData.HCP_MENGE_PED_DEP / 1000).toFixed(2),
					HCP_MEINS: "TO",
					HCP_CREATED_BY: aUserName,
					HCP_CREATED_AT: new Date()
				};

				oModel.createEntry("/Commodities_Historic_Offer", {
					properties: aDataHistoric
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
												this.revertCount = 500; //old 60
												this.timeOut = 500; //old 60
												this.hasFinished = false;
												this.message = "Processando dados, por favor aguarde (";
												this.verifyTimeOut();

												this.submitCommoditiesEcc(this.uniqueKey, this.oType, false, false).then(function (oSucess) {

													this.hasFinished = true;
													if (oSucess == true) {
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
									//this.closeBusyDialog();
									this.backToIndex();
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

						if (localStorage.getItem("countStorageCommodities")) {
							localStorage.setItem("countStorageCommodities", (parseInt(localStorage.getItem("countStorageCommodities")) + 1));
						} else {
							localStorage.setItem("countStorageCommodities", 1);
						}

						var message;

						if (localStorage.getItem("countStorageCommodities") > 1) {
							message = 'Você possui ' + localStorage.getItem("countStorageCommodities") +
								' compras criadas, acesse o app e atualize a interface!';
						} else {
							message = 'Você possui ' + localStorage.getItem("countStorageCommodities") +
								' compra criada, acesse o app e atualize a interface!';
						}

						MessageBox.information(
							this.resourceBundle.getText("messageOffCommodities"), {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									//	this.closeBusyDialog();
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
									//	this.closeBusyDialog();
									this.backToIndex();
								}.bind(this)
							}
						);
					}.bind(this)
				});
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

		_getOffer: function (oKeyOffer, oUserArray) {
			return new Promise(function (resolve, reject) {
				var oModelCommodities = this.getView().getModel();
				var oModel = this.getView().getModel("purchaseFormModel");
				var oData = oModel.oData;
				var aFilters = [];
				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;
				this.oMengeDispOffer = 0;

				this.sType = oKeyOffer.HCP_TIPO || this.sType;

				if (oKeyOffer.HCP_TIPO == "2") {

					oModel.setProperty("/visibleDelivery", true);
					oModel.setProperty("/lockFieldsFromOffer", false);

					aFilters.push(new sap.ui.model.Filter({
						path: "HCP_UNIQUE_KEY",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oKeyOffer.HCP_UNIQUE_KEY_OFFER
					}));

					oModelCommodities.read("/Offer_Map", {

						filters: aFilters,
						success: function (results) {
							var aResults = results.results;

							if (aResults.length > 0) {
								oUserArray.WERKS_D = oKeyOffer.HCP_WERKS;
								oUserArray.WAERS = aResults[0].HCP_MOEDA;
								oModel.setProperty("/visibleOffer", true);
								oModel.setProperty("/enabled", false);
								oModel.setProperty("/HCP_UNIQUE_KEY_OFFER", oKeyOffer.HCP_UNIQUE_KEY_OFFER);

								if (aResults[0]["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
									oModel.setProperty("/HCP_OFFER_NUMBER", "Registro Offline");
								} else {
									oModel.setProperty("/HCP_OFFER_NUMBER", aResults[0].HCP_OFFER_ID);
								}

								this.oMengeDispOffer = parseFloat(aResults[0].HCP_VOLUME);
								
								if(aResults[0].HCP_TPCEREAL){
									oModel.setProperty("/matCereal", true);
								}

								oModel.setProperty("/HCP_EKGRP", aResults[0].HCP_EKGRP); //grupo de comprador
								oModel.setProperty("/HCP_LIFNR", oKeyOffer.HCP_LOCAL); // fornecedor
								oModel.setProperty("/HCP_MATNR", aResults[0].HCP_MATNR); //material
								oModel.setProperty("/HCP_TPCEREAL", aResults[0].HCP_TPCEREAL); //tipo de cereall
								//oModel.setProperty("/HCP_MENGE_PED_DEP", aResults[0].HCP_VOLUME * 1000); // volume
								oModel.setProperty("/HCP_MENGE_ORIGINAL", aResults[0].HCP_VOLUME); // volume
								oModel.setProperty("/HCP_MENGE_ENTR", aResults[0].HCP_VOLUME * 1000); // volume entrega
								oModel.setProperty("/HCP_BASE_PRECIF", aResults[0].HCP_DEPOSIT_TYPE); // tipo de deposito
								// oModel.setProperty("/HCP_OBS_PRECO", aResults[0].HCP_DESC_DEPOSIT); // observações de preço
								oModel.setProperty("/HCP_DATE_START", aResults[0].HCP_DATE_START); // data inicio
								oModel.setProperty("/HCP_DATE_END", aResults[0].HCP_DATE_END); // data fim
								oModel.setProperty("/HCP_DT_ENTR_INI", aResults[0].HCP_DATE_START); // data inicio
								oModel.setProperty("/HCP_DT_ENTR_FIM", aResults[0].HCP_DATE_END); // data fim
								oModel.setProperty("/HCP_COND_PGTO", aResults[0].HCP_ZTERM); // Condição de pagamento
								oModel.setProperty("/HCP_WERKS", oKeyOffer.HCP_WERKS); // Centro
								// if (aResults[0].HCP_DESC_DEPOSIT) {
								oModel.setProperty("/HCP_OBS_PRECO", this.resourceBundle.getText("priceObsMsgAddInfo", [aResults[0].HCP_OFFER_ID,
									aResults[0].HCP_DESC_DEPOSIT !== null ? " - " + aResults[0].HCP_DESC_DEPOSIT : ""
								])); // Observações de Preço
								// }

								if (aResults[0].HCP_INCOTERM == "1") { //CIF
									oModel.setProperty("/HCP_ZFRETE", "CIF");
									oModel.setProperty("/HCP_INCOTERMS", "CIF");
									oModel.setProperty("/yesFob", false);

								} else if (aResults[0].HCP_INCOTERM == "2") { //FOB
									oModel.setProperty("/HCP_ZFRETE", "FOB");
									oModel.setProperty("/HCP_INCOTERMS", "FOB");
									oModel.setProperty("/yesFob", true);
									
								} else if (aResults[0].HCP_INCOTERM == "3") { //CPT
									oModel.setProperty("/HCP_ZFRETE", "CPT");
									oModel.setProperty("/HCP_INCOTERMS", "CPT");
									oModel.setProperty("/yesFob", false);

								} 

								var bSameMonth = aResults[0].HCP_DATE_START.getMonth() === new Date().getMonth() ? true : false;
								var oMainDataForm = this.byId("newEntitySimpleForm").getContent();

								var oDate = new Date();

								if (bSameMonth) {
									var oFirstDay = new Date();
									var oLastDay = new Date(oDate.getFullYear(), oDate.getMonth() + 1, 0);
									oMainDataForm[17].setMinDate(new Date(aResults[0].HCP_DATE_START));
									oMainDataForm[17].setMaxDate(oLastDay);
								} else {
									oDate = aResults[0].HCP_DATE_START;
									oFirstDay = new Date(oDate.getFullYear(), oDate.getMonth(), 1);
									oLastDay = new Date(oDate.getFullYear(), oDate.getMonth() + 1, 0);

									oMainDataForm[17].setMinDate(new Date(oFirstDay));
									oMainDataForm[17].setMaxDate(new Date(oLastDay));
								}

								if (oDate.getFullYear() != aResults[0].HCP_DATE_START.getFullYear()) {
									oFirstDay = new Date(aResults[0].HCP_DATE_START.getFullYear(), aResults[0].HCP_DATE_START.getMonth(), 1);
									oLastDay = new Date(aResults[0].HCP_DATE_START.getFullYear(), aResults[0].HCP_DATE_START.getMonth() + 1, 0);
									oMainDataForm[17].setMinDate(new Date(oFirstDay));
									oMainDataForm[17].setMaxDate(new Date(oLastDay));
								}

								this.formatterDate(oFirstDay).then(function (oDataFrom) {
									this.formatterDate(oLastDay).then(function (oDateTo) {

										var oMessage = this.resourceBundle.getText("messageDelivery") + oDataFrom + " - " + oDateTo;
										oModel.setProperty("/messageDelivery", oMessage);

										aFilters.push(new sap.ui.model.Filter({
											path: "HCP_WERKS",
											operator: sap.ui.model.FilterOperator.EQ,
											value1: oKeyOffer.HCP_WERKS
										}));

										oModelCommodities.read("/Offer_Map_Werks", {
											filters: aFilters,
											success: function (results) {
												var aResults = results.results;

												if (aResults.length > 0) {
													if (oData.HCP_ZFRETE == "CIF" || oData.HCP_ZFRETE == "CPT" ) {
														oModel.setProperty("/HCP_NETWR", parseInt(aResults[0].HCP_PRICE_OFFER.replace(".", "")));
													} else {
														oModel.setProperty("/HCP_NETWR", parseInt(aResults[0].HCP_PRICE_FOB.replace(".", "")));
														if (aResults[0].HCP_QUOTATION_FREIGHT == "1") {
															if (parseInt(aResults[0].HCP_LOGISTICS_FREIGHT.replace(".", "")) > 0) {
																oModel.setProperty("/HCP_FRETE", aResults[0].HCP_LOGISTICS_FREIGHT);
																oModel.setProperty("/freightMsg", false);
															} else {
																if (parseInt(aResults[0].HCP_PRICE_CALC_FREIGHT.replace(".", "")) > 0) {
																	oModel.setProperty("/HCP_FRETE", aResults[0].HCP_PRICE_CALC_FREIGHT);
																	oModel.setProperty("/freightMsg", true);
																	oModel.setProperty("/HCP_FRETEMSG", this.resourceBundle.getText("valueFoundForCalcFreight"));
																} else {
																	oModel.setProperty("/freightMsg", true);
																	oModel.setProperty("/HCP_FRETEMSG", this.resourceBundle.getText("noValueFoundForFreight"));
																}
															}
														} else {
															if (parseInt(aResults[0].HCP_PRICE_CALC_FREIGHT.replace(".", "")) > 0) {
																oModel.setProperty("/HCP_FRETE", aResults[0].HCP_PRICE_CALC_FREIGHT);
																oModel.setProperty("/freightMsg", true);
																oModel.setProperty("/HCP_FRETEMSG", this.resourceBundle.getText("valueFoundForCalcFreight"));
															} else {
																oModel.setProperty("/freightMsg", true);
																oModel.setProperty("/HCP_FRETEMSG", this.resourceBundle.getText("noValueFoundForFreight"));
															}
														}
														if (aResults[0].HCP_PAVED === 1) {
															oModel.setProperty("/HCP_KMSPAVIM", aResults[0].HCP_TRECHO_KM);
														}
													}
													this._getHistoricOffer().then(function () {
														this._searchPartnerName().then(function () {
															resolve();
														}.bind(this));
													}.bind(this));
												} else {
													reject();
												}
											}.bind(this),
											error: function (error) {
												resolve();
											}
										});

									}.bind(this));
								}.bind(this));

							}

						}.bind(this),
						error: function (error) {
							resolve();
						}
					});
				} else {
					var oMainDataForm = this.byId("newEntitySimpleForm").getContent();

					oMainDataForm[17].setTo(null);
					oMainDataForm[17].setFrom(null);
					oMainDataForm[17].setMaxDate(null);
					oMainDataForm[17].setMinDate(null);
					oUserArray.WAERS = "BRL";

					resolve();
				}
			}.bind(this));
		},

		_searchPartnerName: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var oPurchaseModel = this.getView().getModel("purchaseFormModel");
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'LIFNR',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oPurchaseModel.oData.HCP_LIFNR
				}));

				oModel.read("/View_Suppliers", {

					filters: aFilters,

					success: function (result) {

						if (result.results.length > 0) {
							oPurchaseModel.setProperty("/PROVIDER_DESC", result.results[0].NAME1);

							if (result.results.KTOKK === "F3") {
								oPurchaseModel.setProperty("/HCP_ZTPNF", "1");
							} else {
								oPurchaseModel.setProperty("/HCP_ZTPNF", "2");
							}

							oPurchaseModel.setProperty("/PROVIDER_DESC", result.results[0].NAME1);
						}

						resolve();

					}.bind(this),
					error: function () {
						reject(error);
					}
				});

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

		_getDepositForWerks: function (oCenter) {

			var oModelFixed = this.getView().getModel();
			var oModel = this.getView().getModel("purchaseFormModel");
			var aFilters = [];
			var aSorters = [];

			return new Promise(function (resolve, reject) {

				oModel.setProperty("/HCP_LGORT", null);
				oModel.setProperty("/tableDeposit", []);

				if (oCenter) {

					aFilters.push(new sap.ui.model.Filter({
						path: "WERKS",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oCenter
					}));

					aSorters.push(new sap.ui.model.Sorter({
						path: "LGORT",
						descending: false
					}));

					oModelFixed.read("/View_Deposity", {

						filters: aFilters,
						sorters: aSorters,
						success: function (results) {

							var aResults = results.results;
							var oDataItem = oModel.getProperty("/tableDeposit");

							if (aResults.length > 0) {

								for (var i = 0; i < aResults.length; i++) {

									var aData = {
										LGORT: aResults[i].LGORT,
										LGOBE: aResults[i].LGOBE
									};

									oDataItem.push(aData);

								}

								oModel.setProperty("/enabledLgort", true);
								oModel.setProperty("/tableDeposit", oDataItem);
								resolve();
							}

						}.bind(this),
						error: function (error) {
							resolve();
						}
					});

				} else {
					oModel.setProperty("/enabledLgort", false);
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
							this.oMengeDispOffer = this.oMengeDispOffer - aResults[i].HCP_MENGE;
						}

						console.log(aResults);
						console.log(this.oMengeDispOffer);

						if (this.oMengeDispOffer > 0) { //Quantidade Disponivel da oferta para compra
							oEditModel.setProperty("/errorMenge", false);
							oEditModel.setProperty("/errorNoQntLeft", false);
							oEditModel.setProperty("/HCP_MENGE_PED_DEP", this.oMengeDispOffer * 1000);
							oEditModel.setProperty("/HCP_MENGE_ENTR", this.oMengeDispOffer * 1000);
							// oEditModel.setProperty("/HCP_MENGE_OFFER", this.oMengeDispOffer);
						} else {
							oEditModel.setProperty("/errorMenge", true);
							oEditModel.setProperty("/errorNoQntLeft", true);
							// this.oMengeDispOffer = oEditModel.getProperty("/HCP_MENGE_PED_DEP");
							oEditModel.setProperty("/HCP_MENGE_PED_DEP", 0);

							oEditModel.setProperty("/HCP_MENGE_ENTR", oEditModel.getProperty("/HCP_MENGE_PED_DEP"));
						}

						this.oMengeDispOffer = this.oMengeDispOffer * 1000;

						resolve();
					}.bind(this),
					error: function () {
						reject(error);
					}
				});
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
							if (bIsMobile) {
								if (localStorage.getItem("countStorageCommodities")) {
									localStorage.setItem("countStorageCommodities", (parseInt(localStorage.getItem("countStorageCommodities")) + 1));
								} else {
									localStorage.setItem("countStorageCommodities", 1);
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

				if (localStorage.getItem("countStorageCommodities") > 1) {
					message = 'Você possui ' + localStorage.getItem("countStorageCommodities") +
						' compras criadas, acesse o app e atualize a interface!';
				} else {
					message = 'Você possui ' + localStorage.getItem("countStorageCommodities") +
						' compra criada, acesse o app e atualize a interface!';
				}

			}

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