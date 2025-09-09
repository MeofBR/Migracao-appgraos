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

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.offerMap.FilterOfferMap", {

		onInit: function () {

			var oModel = this.getOwnerComponent().getModel();
			oModel.attachRequestCompleted(function () {
				this.closeBusyDialog();
			}.bind(this), 2000);

			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("offerMap.FilterOfferMap").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				HCP_INCOTERM: "4",
				HCP_MODALITY: "3",
				HCP_MATNR: null,
				HCP_CREATED_BY: null,
				HCP_EKGRP: null,
				HCP_WERKS: null,
				HCP_DT_START_DELIVERY: null,
				HCP_DT_END_DELIVERY: null,
				HCP_DT_START_CREATE: null,
				HCP_DT_END_CREATE: null,
				HCP_STATES_OFFER: "1",
				HCP_PARTNER_TYPE: "1",
				filters: [],
				filterPartner: [],
				yesPartner: true,
				yesProspect: false,
				enableConsult: false
			}), "filterOfferMapFormModel");

			this.getView().byId("DT_CREATE").setValue(null);
			this.getView().byId("DT_DELIVERY").setValue(null);

		},

		handleRouteMatched: function (oEvent) {

			this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText("messageLoadingPleaseWait"));
			var oCreateModel = this.getView().getModel("filterOfferMapFormModel");
			var oData = oCreateModel.oData;

			// this.getView().getModel("filterOfferMapFormModel").setData({
			// 	HCP_MODALITY: "3",
			// 	HCP_MATNR: null,
			// 	HCP_CREATED_BY: null,
			// 	HCP_EKGRP: null,
			// 	HCP_WERKS: null,
			// 	HCP_DT_START_DELIVERY: null,
			// 	HCP_DT_END_DELIVERY: null,
			// 	HCP_DT_START_CREATE: null,
			// 	HCP_DT_END_CREATE: null,
			// 	HCP_STATES_OFFER: "1",
			// 	HCP_INCOTERM: "4",
			// 	HCP_PARTNER_TYPE: "1",
			// 	filters: [],
			// 	filterPartner: [],
			// 	yesPartner: true,
			// 	yesProspect: false,
			// 	enableConsult: false
			// });

			// this.getView().byId("DT_CREATE").setValue(null);
			// this.getView().byId("DT_DELIVERY").setValue(null);

			this.getUser().then(function (userName) {
				this.userName = userName;
				this.checkUserInfo(this.userName).then(function (userArray) {
					if (oData.HCP_EKGRP) {
						var oModel = this.getView().getModel();
						oModel.read("/View_Account_Groups", {
							success: function (results) {
								var oResult = results.results;
								if (oResult.length > 0) {
									for (var result of oResult) {
										if (result.EKGRP == oData.HCP_EKGRP) {
											this.getView().getModel("filterOfferMapFormModel").setProperty("/HCP_EKGRP", oData.HCP_EKGRP);
										}
									}
								}

							}.bind(this),
							error: function (err) {
								console.log(err);
							}
						});
						
						if (userArray.EKGRP != "") {
							this.getView().getModel("filterOfferMapFormModel").setProperty("/enableConsult", true);
						}
					} else if (userArray.EKGRP) {
						var oModel = this.getView().getModel();
						oModel.read("/View_Account_Groups", {

							success: function (results) {
								var oResult = results.results;
								if (oResult.length > 0) {
									for (var result of oResult) {
										if (result.EKGRP == userArray.EKGRP) {
											this.getView().getModel("filterOfferMapFormModel").setProperty("/HCP_EKGRP", userArray.EKGRP);
										}
									}
								}

							}.bind(this),
							error: function (err) {
								console.log(err);
							}
						});

						//this.getView().getModel("filterOfferMapFormModel").setProperty("/HCP_EKGRP", userArray.EKGRP);

						if (userArray.EKGRP != "") {
							this.getView().getModel("filterOfferMapFormModel").setProperty("/enableConsult", true);
						}
					}

					if (userArray.EKORG) {
						this.getView().getModel("filterOfferMapFormModel").setProperty("/HCP_EKORG", userArray.EKORG);
					}

					if (userArray.WERKS_D) {
						this.getView().getModel("filterOfferMapFormModel").setProperty("/HCP_WERKS", userArray.WERKS_D);
					}

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

			this.getView().byId("DT_CREATE").setValue(null);
			this.getView().byId("DT_DELIVERY").setValue(null);
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				HCP_INCOTERM: "4",
				HCP_MODALITY: "3",
				HCP_MATNR: null,
				HCP_CREATED_BY: null,
				HCP_EKGRP: null,
				HCP_WERKS: null,
				HCP_DT_START_DELIVERY: null,
				HCP_DT_END_DELIVERY: null,
				HCP_DT_START_CREATE: null,
				HCP_DT_END_CREATE: null,
				HCP_STATES_OFFER: "1",
				HCP_PARTNER_TYPE: "1",
				filters: [],
				filterPartner: [],
				yesPartner: true,
				yesProspect: false,
				enableConsult: false
			}), "filterOfferMapFormModel");

			this.getView().byId("DT_CREATE").setValue(null);
			this.getView().byId("DT_DELIVERY").setValue(null);

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//oRouter.navTo("commodities.Index", true);
			oRouter.navTo("offerMap.Index", true);

		},

		_onDateCreateRangeSelectionChange: function (oEvent) {

			var oFilterModel = this.getView().getModel("filterOfferMapFormModel");
			var oDateFrom = oEvent.getParameter("from");
			var oDateTo = oEvent.getParameter("to");

			oFilterModel.setProperty("/HCP_DT_START_CREATE", oDateFrom);
			oFilterModel.setProperty("/HCP_DT_END_CREATE", oDateTo);

		},

		_onDateDeliveryRangeSelectionChange: function (oEvent) {

			var oFilterModel = this.getView().getModel("filterOfferMapFormModel");
			var oDateFrom = oEvent.getParameter("from");
			var oDateTo = oEvent.getParameter("to");

			oFilterModel.setProperty("/HCP_DT_START_DELIVERY", oDateFrom);
			oFilterModel.setProperty("/HCP_DT_END_DELIVERY", oDateTo);

		},

		_onInputProspect: function (oEvent) {

			var oModel = this.getView().getModel("filterOfferMapFormModel");
			var oProspect = oEvent.getSelectedKey();
			var aFilterPartner = [];

			oModel.setProperty("/filterPartner", []);

			if (oProspect != "") {

				aFilterPartner.push(new sap.ui.model.Filter({
					path: "HCP_PROSP_ID",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oProspect
				}));

				oModel.setProperty("/filterPartner", aFilterPartner);

			}

			this._validateForm();

		},

		onConsultPress: function (oEvent) {

			var oModel = this.getView().getModel("filterOfferMapFormModel");
			var oData = oModel.oData;
			var oLenght = 0;
			this.setBusyDialog(this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText(
				"messageFilteringData")));

			this._getOfferMap().then(function (oLenght) {

				if (oLenght > 0) {

					var aKeyData = {
						filters: oData.filters,
						werks: oData.HCP_WERKS
					};

					this.closeBusyDialog();

					this.oRouter.navTo("offerMap.ConsultOfferMap", {
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
				var oModel = this.getView().getModel("filterOfferMapFormModel");
				var oData = oModel.oData;
				var aFilters = [];
				var oLenght = 0;
				

				oModel.setProperty("/filters", []);
				if (oData.filterPartner && oData.filterPartner.length > 0) {
					aFilters = oData.filterPartner;
				}

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_PARTNER_TYPE',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_PARTNER_TYPE
				}));

				//Período de Criação
				if (oData.HCP_DT_START_CREATE) {
				//	var oDateStart = this.getTimeZoneDataFilter(oData.HCP_DT_START_CREATE, true);
				//	var oDateEnd = this.getTimeZoneDataFilter(oData.HCP_DT_END_CREATE, false);
					
					var oDateStart = new Date(new Date(oData.HCP_DT_START_CREATE).setHours(0, 0, 0));
					var oDateEnd  = new Date(new Date(oData.HCP_DT_END_CREATE).setHours(23, 59, 59));
					
					if (oDateStart && oDateEnd) {

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_CREATED_AT',
							operator: sap.ui.model.FilterOperator.BT,
							value1: oDateStart,
							value2: oDateEnd
						}));
					}
				}

				//Período de Entrega
				if (oData.HCP_DT_START_DELIVERY) {
					oDateStart = this.getTimeZoneData(oData.HCP_DT_START_DELIVERY, true);
					if (oDateStart) {

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_DATE_START',
							operator: sap.ui.model.FilterOperator.GE,
							value1: oDateStart
						}));
					}
				}

				if (oData.HCP_DT_END_DELIVERY) {
					oDateEnd = this.getTimeZoneData(oData.HCP_DT_END_DELIVERY, false);
					if (oDateEnd) {

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_DATE_END',
							operator: sap.ui.model.FilterOperator.LE,
							value1: oDateEnd
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

				//Modalidade
				if (oData.HCP_MODALITY && oData.HCP_MODALITY !== "3" ) { //Todos
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_MODALITY',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_MODALITY
					}));
				}

				//Material
				if (oData.HCP_MATNR) {
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_MATNR',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_MATNR
					}));
				}

				//Status
				if (oData.HCP_STATES_OFFER && oData.HCP_STATES_OFFER !== "7") { //Todos
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_STATES_OFFER',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_STATES_OFFER
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
	
            if (oData.HCP_INCOTERM !== "4") {
				if (oData.HCP_INCOTERM) { //Todos
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_INCOTERM',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_INCOTERM
					}));
				}
            } else {
                //Incoterm
				if (oData.HCP_INCOTERM && oData.HCP_INCOTERM !== "4") { //Todos
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_INCOTERM',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_INCOTERM
					}));
				}
            }

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
				var oModel = this.getView().getModel("filterOfferMapFormModel");
				var oData = oModel.oData;
				var oWerksFilter = [];

				//Centro de Destino
				if (oData.HCP_WERKS) {
					oWerksFilter.push(new sap.ui.model.Filter({
						path: 'HCP_WERKS',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_WERKS
					}));

					oModelOffer.read("/Offer_Map_Werks", {

						filters: oWerksFilter,
						success: function (results) {
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

				} else {
					resolve(1);
				}

			}.bind(this));

		},

		_validateForm: function () {
			var oFilterModel = this.getView().getModel("filterOfferMapFormModel");

			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required && oControl.getVisible()) {
						var oInputId = aInputControls[m].control.getMetadata();

						if (oInputId.getName() === "sap.m.Input") {
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

			for (var i = 0; i < oAllForms.length; i++) {
				var sControlType1 = oAllForms[i].getMetadata().getName();
				if (sControlType1 === "sap.m.Label") {
					if (sControlType = oAllForms[i + 1]) {
						sControlType = oAllForms[i + 1].getMetadata().getName();
						if (sControlType === "sap.m.Input" || sControlType === "sap.m.ComboBox" || sControlType ===
							"com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox") {
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

		_onInputPartnerFormSelect: function (oEvent) {
			var oModel = this.getView().getModel("filterOfferMapFormModel");
			var oInput = oEvent.getSource();

			oModel.setProperty("/HCP_PARTNER", null);
			oModel.setProperty("/PROVIDER_DESC", null);
			oModel.setProperty("/filterPartner", []);

			if (oInput.getSelectedKey() == "1") { //Fornecedor
				oModel.setProperty("/yesPartner", true);
				oModel.setProperty("/yesProspect", false);
			} else {
				oModel.setProperty("/yesPartner", false);
				oModel.setProperty("/yesProspect", true);
			}
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
			var oPartnerInput = sap.ui.core.Fragment.byId("newVisitFormFragmentID" + this.getView().getId(), "inputpartnerID");
			var oModel = this.getView().getModel("filterOfferMapFormModel");
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

		_onInputPartner: function (oSelectedPartner) {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getView().getModel();
				var oModel = this.getView().getModel("filterOfferMapFormModel");
				var oData = oModel.oData;
				var aFilters = [];

				oModel.setProperty("/filterPartner", []);

				if (oSelectedPartner.AGRUPADO === 0) { //Não Agrupado

					aFilters.push(new sap.ui.model.Filter({
						path: "LIFNR",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oSelectedPartner.HCP_REGISTER
					}));

				} else { //Agrupado

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
						var aFilterPartner = [];

						if (aResults.length > 0) {

							for (var i = 0; i < aResults.length; i++) {

								aFilterPartner.push(new sap.ui.model.Filter({
									path: "HCP_PARTNER",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: aResults[i].LIFNR
								}));

							}

							oModel.setProperty("/filterPartner", aFilterPartner);

						}

						resolve();

					}.bind(this),
					error: function (error) {
						reject();
					}
				});

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