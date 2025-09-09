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

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.freightCalculator.New", {

		onInit: function () {

			this._createYear();
			this._createMonth();
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("freightCalculator.New").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.setBusyDialog(this.resourceBundle.getText("textFreightCalculator"), this.resourceBundle.getText("messageLoadingPleaseWait"));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableCalculate: false,
				STRETCH: "2",
				hasStretch: false,
				noPricesCalculator: false,
				hasFreight: false
			}), "freightCalculatorFormModel");

			var oModel = this.getOwnerComponent().getModel();
			oModel.attachRequestCompleted(function () {
				var oCreateModel = this.getView().getModel("freightCalculatorFormModel");
				var isLoad = oCreateModel.getProperty("/isLoad");
				if (!isLoad) {
					oCreateModel.setProperty("/isLoad", true);
					this.closeBusyDialog();
				}
			}.bind(this));

		},

		handleRouteMatched: function (oEvent) {

			var oCreateModel = this.getView().getModel("freightCalculatorFormModel");

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableCalculate: false,
				STRETCH: "2",
				hasStretch: false,
				noPricesCalculator: false,
				hasFreight: false
			}), "freightCalculatorFormModel");

			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			this.getPriceKm();

		},

		_valideInputNumber: function (oProperty) {

			var oSource = oProperty.getSource();
			var sValue;

			sValue = oProperty.mParameters.newValue;
			sValue = sValue.replace(/[^0-9,]/g, "");

			oSource.setValue(sValue);

			this._validateForm(oProperty);
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

		onCancelPress: function (oEvent) {

			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oModel = this.getView().getModel("freightCalculatorFormModel");

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("Index", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},

		_validateForm: function (oEvent) {

			var oCreateModel = this.getView().getModel("freightCalculatorFormModel");
			var oData = oCreateModel.oData;
			if (oEvent) {
				var fieldName = '';
				var oSource = oEvent.getSource();
				var oSetValueState = "None";
				var oSetValueStateText = "";
				var sValueKM = 0;
				var sValueTrecho = 0;
				var isError = false;

				if (oEvent) {
					fieldName = oEvent.getSource().getName();
				}
				if (fieldName == 'KM') {
					sValueKM = oEvent.getSource().getValue();

					if (oData.TRECHO > sValueKM.replace(/[^0-9,]/g, "")) {
						oSetValueState = "Error";
						oSetValueStateText = this.resourceBundle.getText("errorUnpavedDistance");
						isError = true;
					}
					oSource.setValueState(oSetValueState);
					oSource.setValueStateText(oSetValueStateText);
				} else if (fieldName == 'TRECHO') {
					sValueTrecho = oEvent.getSource().getValue();
					if (sValueTrecho.replace(/[^0-9,]/g, "") > oData.KM) {
						oSetValueState = "Error";
						oSetValueStateText = this.resourceBundle.getText("errorUnpavedDistance");
						isError = true;
					}
					oSource.setValueState(oSetValueState);
					oSource.setValueStateText(oSetValueStateText);

				}
			}

			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;

				oCreateModel.setProperty("/enableCalculate", true);

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required) {
						var sValue = oControl.getValue();
						if (!sValue || oControl.getValueState() !== 'None') {
							oCreateModel.setProperty("/enableCalculate", false);
							return;
						}
					}
				}
				if (isError) {
					oCreateModel.setProperty("/enableCalculate", true);
				}

			}.bind(this), 100);

		},

		_getFormFields: function () {
			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var aControls = [];
			var sControlType;

			for (var i = 0; i < oMainDataForm.length; i++) {
				sControlType = oMainDataForm[i].getMetadata().getName();
				if (sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" || sControlType === "sap.m.Input" ||
					sControlType === "sap.m.DateTimeInput" || sControlType === "sap.m.DatePicker" ||
					sControlType === "sap.m.CheckBox" || sControlType === "sap.m.MaskInput" || sControlType === "sap.m.ComboBox") {
					if (oMainDataForm[i].getEnabled()) {
						aControls.push({
							control: oMainDataForm[i],
							required: oMainDataForm[i - 1].getRequired && oMainDataForm[i - 1].getRequired(),
							text: oMainDataForm[i - 1].getText
						});
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
			oRouter.navTo("freightCalculator.Index", true);
		},

		_calculatePriceFreight: function (oInputCenter) {

			var oModel = this.getView().getModel();
			var oModelFreight = this.getView().getModel("freightCalculatorFormModel");
			var oData = oModelFreight.oData;
			var aFilters = [];

			if (oData.REGIO_ORIGEM && oData.REGIO_DESTINO && oData.MES && oData.ANO &&
				oData.KM) {

				var oDistance = oData.KM;

				this.setBusyDialog(this.resourceBundle.getText("textFreightCalculator"), this.resourceBundle.getText("textModalCalculateFreight"));

				aFilters.push(new sap.ui.model.Filter({
					path: "REGIO_ORIGEM",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.REGIO_ORIGEM
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "REGIO_DESTINO",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.REGIO_DESTINO
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "MES",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.MES
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "ANO",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.ANO
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "KM_INICIAL",
					operator: sap.ui.model.FilterOperator.LE,
					value1: oData.KM
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "KM_FINAL",
					operator: sap.ui.model.FilterOperator.GE,
					value1: oData.KM
				}));

				oModel.read("/Price_Freight", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;

						if (aResults.length > 0) {

							var oPriceDistance = aResults[0].TARIFA * oDistance;
							var oPrice;
							var oPriceSC;

							if (oData.TRECHO) {
								oDistance = parseFloat(oDistance) - parseFloat(oData.TRECHO);
								var oPriceDistance = parseFloat(aResults[0].TARIFA) * parseFloat(oDistance);
								var oPriceKm = parseFloat(oData.tarifaKm) * parseFloat(oData.TRECHO);
								oPrice = parseFloat(oPriceKm) + parseFloat(oPriceDistance);
							} else {
								oPrice = parseFloat(aResults[0].TARIFA) * parseFloat(oDistance);
							}

							oModelFreight.setProperty("/FREIGHT", oPrice.toFixed(2));
							oModelFreight.setProperty("/noPricesCalculator", false);
							oModelFreight.setProperty("/hasFreight", true);

							oPriceSC = (oPrice * 60) / 1000;
							oModelFreight.setProperty("/FREIGHTSC", oPriceSC.toFixed(2));

						} else {
							oModelFreight.setProperty("/noPricesCalculator", true);
							oModelFreight.setProperty("/hasFreight", false);

							//oModel.setProperty("/enableManualFreight", false);
						}
						this.closeBusyDialog();
					}.bind(this),
					error: function (error) {
						this.closeBusyDialog();
						oModelFreight.setProperty("/noPricesCalculator", true);
						//	oModel.setProperty("/enableManualFreight", false);
					}
				});
			}

			this._validateForm();

		},

		_validateStretch: function () {

			var oCreateModel = this.getView().getModel("freightCalculatorFormModel");
			var oData = oCreateModel.getProperty("/");
			oData.hasFreight = false;
			oData.noPricesCalculator = false;

			//cif
			if (oData.STRETCH == 1) {
				oCreateModel.setProperty("/hasStretch", true);
			} else {
				oCreateModel.setProperty("/hasStretch", false);
				oCreateModel.setProperty("/TRECHO", null);

			}

			this._validateForm();
		},
		_createYear: function () {

			var min = new Date().getFullYear();
			var max = min + 4;
			var comboAno = this.getView().byId("comboAno");

			for (var i = min; i <= max; i++) {
				var newItem = new sap.ui.core.Item({
					key: i,
					text: i,
					enable: true
				});
				comboAno.addItem(newItem);
			}
		},
		_createMonth: function () {

			var comboMes = this.getView().byId("comboMes");
			for (var mesList = 1; mesList <= 12; mesList++) {

				if (mesList < 10) {
					mesList = "0" + mesList;
				}

				var newItem = new sap.ui.core.Item({
					key: mesList,
					text: this._createMonthText(mesList),
					enable: true
				});
				comboMes.addItem(newItem);
			}
		},
		_createMonthText: function (month) {

			if (month === "01") {
				return "Janeiro";
			} else if (month === "02") {
				return "Fevereiro";
			} else if (month === "03") {
				return "Março";
			} else if (month === "04") {
				return "Abril";
			} else if (month === "05") {
				return "Maio";
			} else if (month === "06") {
				return "Junho";
			} else if (month === "07") {
				return "Julho";
			} else if (month === "08") {
				return "Agosto";
			} else if (month === "09") {
				return "Setembro";
			} else if (month === 10) {
				return "Outubro";
			} else if (month === 11) {
				return "Novembro";
			} else {
				return "Dezembro";
			}
		},
		getPriceKm: function () {

			var oModelOffer = this.getView().getModel();
			var oModel = this.getView().getModel("freightCalculatorFormModel");
			var oData = oModel.oData;
			var aFilters = [];

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

		}
	});
}, /* bExport= */ true);