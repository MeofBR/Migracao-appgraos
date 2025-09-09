sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/List', 
	'sap/m/StandardListItem',
	"sap/ui/core/routing/History"
], function (MainController, MessageBox, JSONModel, Button, Dialog, List, StandardListItem, History) {
	"use strict"; 

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.offerMap.FilterLogisticsFreight", {

		onInit: function () {

			var oModel = this.getOwnerComponent().getModel();
			oModel.attachRequestCompleted(function () {
				this.closeBusyDialog(); 
			}.bind(this), 2000);

			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("offerMap.FilterLogisticsFreight").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				HCP_MODALITY: "3",
				HCP_CREATED_BY: null,
				HCP_EKGRP: null,
				HCP_EKORG: null,
				HCP_DT_START_CREATE: null,
				HCP_DT_END_CREATE: null,
				HCP_STATES_FREIGHT: "1",
				filters: [],
				enableConsult: false
			}), "filterFreightFormModel");

			this.getView().byId("DT_CREATE").setValue(null);
			
			var oFilterModel = this.getView().getModel("filterFreightFormModel");
			var oDateTo = new Date();
			var oDateFrom = new Date(new Date().setMonth(-1));
			
			oFilterModel.setProperty("/HCP_DT_START_CREATE", oDateFrom);
			oFilterModel.setProperty("/HCP_DT_END_CREATE", oDateTo);
		},

		handleRouteMatched: function (oEvent) {
			this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText("messageLoadingPleaseWait"));
			var oCreateModel = this.getView().getModel("filterFreightFormModel");
			var oData = oCreateModel.oData;
			
			var oFilterModel = this.getView().getModel("filterFreightFormModel");
			var oDateTo = new Date();
			var oDateFrom = new Date(new Date().setMonth(-1));

			if (!oFilterModel.oData.HCP_DT_END_CREATE && !oFilterModel.oData.HCP_DT_START_CREATE) {
				oFilterModel.setProperty("/HCP_DT_START_CREATE", oDateFrom);
				oFilterModel.setProperty("/HCP_DT_END_CREATE", oDateTo);
			}

			this.getUser().then(function (userName) {
				this.userName = userName;
				this.checkUserInfo(this.userName).then(function (userArray) {

					//this.getView().getModel("filterFreightFormModel").setProperty("/HCP_EKGRP", userArray.EKGRP);
					//this.getView().getModel("filterFreightFormModel").setProperty("/HCP_EKORG", userArray.EKORG);

				}.bind(this));
			}.bind(this));

			this._validateForm();

			oCreateModel.attachRequestCompleted(function () {
				this.closeBusyDialog();
			}.bind(this), 2000);

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
			this.navBack();
		},

		navBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				HCP_MODALITY: "3",
				HCP_CREATED_BY: null,
				HCP_EKGRP: null,
				HCP_EKORG: null,
				HCP_DT_START_CREATE: null,
				HCP_DT_END_CREATE: null,
				HCP_STATES_FREIGHT: "1",
				filters: [],
				enableConsult: false
			}), "filterFreightFormModel");

			this.getView().byId("DT_CREATE").setValue(null);

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}

		},

		_onDateCreateRangeSelectionChange: function (oEvent) {

			var oFilterModel = this.getView().getModel("filterFreightFormModel");
			var oDateFrom = oEvent.getParameter("from");
			var oDateTo = oEvent.getParameter("to");

			oFilterModel.setProperty("/HCP_DT_START_CREATE", oDateFrom);
			oFilterModel.setProperty("/HCP_DT_END_CREATE", oDateTo);

			this._validateForm()
		},

		onConsultPress: function (oEvent) {

			var oModel = this.getView().getModel("filterFreightFormModel");
			var oData = oModel.oData;
			var oLenght = 0;

			this.setBusyDialog(this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText(
				"messageFilteringData")));

			this._getOfferMap().then(function (oLenght) {

				if (oLenght > 0) {

					var aKeyData = {
						filters: oData.filters,
						status: oData.HCP_STATES_FREIGHT
					};

					this.closeBusyDialog();

					this.oRouter.navTo("offerMap.ConsultLogisticsFreight", {
						keyData: JSON.stringify(aKeyData)
					}, false);

				} else {
					sap.m.MessageBox.show(
						this.resourceBundle.getText("erroDataNotFounded"), {
							title: this.resourceBundle.getText("messageWarning"),
							icon: sap.m.MessageBox.Icon.WARNING,
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (oAction) {
								if (oAction === "OK") {
									this.closeBusyDialog();
								}
							}.bind(this)
						}
					);
				}

			}.bind(this));

		},

		_getOfferMap: function () {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getOwnerComponent().getModel();
				var oModel = this.getView().getModel("filterFreightFormModel");
				var oData = oModel.oData;
				var aFilters = [];
				var oLenght = 0;

				oModel.setProperty("/filters", []);

				//Período de Criação
				if (oData.HCP_DT_START_CREATE) {
					var oDateStart = this.getTimeZoneData(oData.HCP_DT_START_CREATE, true);
					var oDateEnd = this.getTimeZoneData(oData.HCP_DT_END_CREATE, false);
					if (oDateStart && oDateEnd) {

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_CREATED_AT',
							operator: sap.ui.model.FilterOperator.BT,
							value1: oDateStart,
							value2: oDateEnd
						}));
					}
				}

				//Grupo de Comprador
				if (oData.HCP_EKGRP) {
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_EKGRP',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_EKGRP
					}));
				}

				//Organização de Compras
				if (oData.HCP_EKORG) {
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_EKORG',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_EKORG
					}));
				}

				//Modalidade
				if (oData.HCP_MODALITY && oData.HCP_MODALITY != "3") { //Todos
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_MODALITY',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_MODALITY
					}));
				}

				//Usuário
				if (oData.HCP_CREATED_BY) {
					var oCreatedBy = oData.HCP_CREATED_BY;
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_CREATED_BY',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oCreatedBy
					}));
				}

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_INCOTERM',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "2" //FOB
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_STATES_OFFER',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "1"
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_STATES_OFFER',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "2"
				}));

				oModel.setProperty("/filters", aFilters);

				oModelOffer.read("/Offer_Map", {
					filters: aFilters,

					success: function (results) {

						var aResults = results.results;
						var aFiltersKey = [];

						if (aResults.length > 0) {

							for (var i = 0; i < aResults.length; i++) {

								aFiltersKey.push(new sap.ui.model.Filter({
									path: "HCP_UNIQUE_KEY",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: aResults[i].HCP_UNIQUE_KEY
								}));

							}

							this._getWerksOfferMap(aFiltersKey).then(function (oLenght) {
								resolve(oLenght);
							}.bind(this));

						} else {
							resolve(oLenght);
						}

					}.bind(this),
					error: function (error) {
						resolve(oLenght);
					}
				});

			}.bind(this));

		},

		_getWerksOfferMap: function (aFiltersKey) {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getOwnerComponent().getModel();
				var oModel = this.getView().getModel("filterFreightFormModel");
				var oData = oModel.oData;
				var oQuotationFilter = [];

				//Status de Logistica
				if (oData.HCP_STATES_FREIGHT && oData.HCP_STATES_FREIGHT != "5") { //Todos
					oQuotationFilter.push(new sap.ui.model.Filter({
						path: 'HCP_STATES_FREIGHT',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_STATES_FREIGHT
					}));

				}

				oQuotationFilter.push(new sap.ui.model.Filter({
					path: 'HCP_QUOTATION_FREIGHT',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "1" //Cotação de Frete - SIM
				}));

				oModelOffer.read("/Offer_Map_Werks", {

					filters: oQuotationFilter,
					success: function (results) {

						// aFiltersKey = [];
						// var aResults = results.results;
						// resolve(aResults.length);

						var aValidKeys = [];
						var aResults = results.results;
						for (var keys of aFiltersKey) {
							var oIsThere = aResults.filter(result => result.HCP_UNIQUE_KEY === keys.oValue1);

							if (oIsThere.length > 0) {
								for (var corresponding of oIsThere) {
									aValidKeys.push(corresponding);
								}

							}
						}
						resolve(aValidKeys.length);

					}.bind(this),
					error: function (error) {
						resolve(0);
					}
				});

			}.bind(this));

		},

		_validateForm: function () {
			var oFilterModel = this.getView().getModel("filterFreightFormModel");

			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required && oControl.getVisible()) {
						var oInputId = aInputControls[m].control.getMetadata();

						if (oInputId.getName() === "sap.m.Input" || oInputId.getName() === "sap.m.DatePicker" || oInputId.getName() === "sap.m.DateRangeSelection") {
							var sValue = oControl.getValue();
						} else if (oInputId.getName() === "sap.m.ComboBox" || oInputId.getName() ===
							"com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox") {
							sValue = oControl.getSelectedKey();
						}

						if (sValue.length > 0) {
							oFilterModel.setProperty("/enableConsult", true);
						} else {
							oFilterModel.setProperty("/enableConsult", false);
							return;
						}
					}
				}
			}.bind(this), 100);
		},

		_getFormFields: function () {
			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();

			var oAllForms = oMainDataForm;
			var aControls = [];
			var sControlType;
			var oControl;

			for (var i = 0; i < oAllForms.length; i++) {
				var sControlType1 = oAllForms[i].getMetadata().getName();
				// oControl = aInputControls[m].control;
				if (sControlType1 === "sap.m.Label") {
					if (sControlType = oAllForms[i + 1]) {
						sControlType = oAllForms[i + 1].getMetadata().getName();
						if (sControlType === "sap.m.Input" || sControlType === "sap.m.ComboBox" || sControlType ===
							"com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" || sControlType === "sap.m.DatePicker" || sControlType === "sap.m.DateRangeSelection") {
							aControls.push({
								control: oAllForms[i + 1],
								required: oAllForms[i].getRequired(),
								text: oAllForms[i].getText()
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
		}
	});
}, /* bExport= */ true);