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

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.commodities.Filter", {

		onInit: function () {

			var oModel = this.getOwnerComponent().getModel();
			oModel.attachRequestCompleted(function () {
				this.closeBusyDialog();
			}.bind(this), 2000);

			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("commodities.Filter").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				HCP_DT_START_SHIPPING: null,
				HCP_DT_END_SHIPPING: null,
				HCP_DT_START_CREATE: null,
				HCP_DT_END_CREATE: null,
				textPeriodic: this.resourceBundle.getText("textShippingPeriod"),
				textPlacePeriodic: this.resourceBundle.getText("placeSelectShippingPeriod"),
				entity: null,
				visibleOffer: false,
				filters: [],
				enableConsult: false
			}), "filterCommMapFormModel");

			this.getView().byId("DT_CREATE").setValue(null);
			this.getView().byId("DT_SHIPPING").setValue(null);

		},

		handleRouteMatched: function (oEvent) {
			this.setBusyDialog(this.resourceBundle.getText("messageLoadingPleaseWait"));
			var oCreateModel = this.getView().getModel("filterCommMapFormModel");
			var oData = oCreateModel.oData;

			this.getUser().then(function (userName) {
				this.userName = userName;
				this.checkUserInfo(this.userName).then(function (userArray) {
					if (oData.HCP_EKGRP) {
						this.getView().getModel("filterCommMapFormModel").setProperty("/HCP_EKGRP", oData.HCP_EKGRP);
					} else if (userArray.EKGRP) {
						this.getView().getModel("filterCommMapFormModel").setProperty("/HCP_EKGRP", userArray.EKGRP);
					}

					if (userArray.WERKS_D) {
						this.getView().getModel("filterCommMapFormModel").setProperty("/HCP_WERKS", userArray.WERKS_D);
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
			var oVisitModel = this.getView().getModel("filterCommMapFormModel");

			oVisitModel.setProperty("/", []);

			this.getView().byId("DT_CREATE").setValue(null);
			this.getView().byId("DT_SHIPPING").setValue(null);

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}

		},

		_onDateCreateRangeSelectionChange: function (oEvent) {

			var oFilterModel = this.getView().getModel("filterCommMapFormModel");
			var oDateFrom = oEvent.getParameter("from");
			var oDateTo = oEvent.getParameter("to");

			oFilterModel.setProperty("/HCP_DT_START_CREATE", oDateFrom);
			oFilterModel.setProperty("/HCP_DT_END_CREATE", oDateTo);

			this._validateForm();

		},

		_onDateShippingRangeSelectionChange: function (oEvent) {

			var oFilterModel = this.getView().getModel("filterCommMapFormModel");
			var oDateFrom = oEvent.getParameter("from");
			var oDateTo = oEvent.getParameter("to");

			oFilterModel.setProperty("/HCP_DT_START_SHIPPING", oDateFrom);
			oFilterModel.setProperty("/HCP_DT_END_DSHIPPING", oDateTo);

			this._validateForm();

		},

		onConsultPress: function (oEvent) {

			var oModel = this.getView().getModel("filterCommMapFormModel");
			var oData = oModel.oData;
			var oLenght = 0;

			this.setBusyDialog(this.resourceBundle.getText("messageFilteringData"));

			this._getCommodities().then(function (oLenght) {

				if (oLenght > 0) {

					var aKeyData = {
						filters: oData.filters,
						entity: oData.entity
					};

					this.closeBusyDialog();

					this.oRouter.navTo("commodities.Consult", {
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

		_getCommodities: function () {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getOwnerComponent().getModel();
				var oModel = this.getView().getModel("filterCommMapFormModel");
				var oData = oModel.oData;
				var aFilters = [];
				var oLenght = 0;
				var oEntity = "Commodities_Fixed_Order";

				oModel.setProperty("/filters", []);

				//Tipo de Pedido
				if (oData.HCP_ORDER_TYPE != "1") { //Pedido Fixo

					oEntity = "Commodities_Order";

					if (oData.HCP_ORDER_TYPE == "2") { //Pedido Depósito

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_TIPO',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: "2"
						}));

					} else { //Transferência

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_TIPO',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: "3"
						}));

					}
				}

				//Período de Remessa/Entrega
				if (oData.HCP_DT_START_SHIPPING) {
					var oShippingStartDate = new Date(oData.HCP_DT_START_SHIPPING);
					oShippingStartDate.setHours(oData.HCP_DT_START_SHIPPING.getHours() + 3);

					oDateStart = this.getTimeZoneData(oShippingStartDate, true);
					if (oDateStart) {

						aFilters.push(new sap.ui.model.Filter({
							path: oData.dateFrom,
							operator: sap.ui.model.FilterOperator.GE,
							value1: oDateStart
						}));
					}
				}

				if (oData.HCP_DT_END_SHIPPING) {
					var oShippingEndDate = new Date(oData.HCP_DT_END_SHIPPING);
					oShippingEndDate.setHours(oData.HCP_DT_END_SHIPPING.getHours() + 27);

					oDateEnd = this.getTimeZoneData(oShippingEndDate, false);
					if (oDateEnd) {

						aFilters.push(new sap.ui.model.Filter({
							path: oData.dateTo,
							operator: sap.ui.model.FilterOperator.LE,
							value1: oDateEnd
						}));
					}
				}

				oModel.setProperty("/entity", oEntity);
				oEntity = "/" + oEntity;

				//Período de Criação
				if (oData.HCP_DT_START_CREATE) {
					var oStartCreateDate = new Date(oData.HCP_DT_START_CREATE);
					oStartCreateDate.setHours(oData.HCP_DT_START_CREATE.getHours() + 3);

					var oEndCreateDate = new Date(oData.HCP_DT_END_CREATE);
					oEndCreateDate.setHours(oData.HCP_DT_END_CREATE.getHours() + 27);

					var oDateStart = this.getTimeZoneData(oData.HCP_DT_START_CREATE, true);
					var oDateEnd = this.getTimeZoneData(oData.HCP_DT_END_CREATE, false);
					if (oDateStart && oDateEnd) {

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_CREATED_AT',
							operator: sap.ui.model.FilterOperator.BT,
							value1: oStartCreateDate,
							value2: oEndCreateDate
						}));
					}
				}

				//Comprador
				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_EKGRP',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_EKGRP
				}));

				//Centro
					if (oData.HCP_WERKS) {
				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_WERKS',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_WERKS
				}));
					}

				//Fornecedor
				if (oData.HCP_LIFNR) {
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_LIFNR',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_LIFNR
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

				//Usuário
				if (oData.HCP_CREATED_BY) {
					var oCreatedBy = oData.HCP_CREATED_BY;
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_CREATED_BY',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oCreatedBy
					}));
				}

				//Oferta
				if (oData.HCP_OFFER_NUMBER) {
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_OFFER_NUMBER',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_OFFER_NUMBER
					}));
				}

				//Status
				if (oData.HCP_STATUS && oData.HCP_STATUS != "4") {
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_STATUS',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_STATUS
					}));

					if (oData.HCP_STATUS == "1") { //Pendente
						//Offline
						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_STATUS',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: "0"
						}));
					}
					
						if (oData.HCP_STATUS == "3") { //Cancelado
						//Offline
						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_STATUS',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: "3"
						}));
					}
				}

				oModel.setProperty("/filters", aFilters);

				oModelOffer.read(oEntity, {
					filters: aFilters,

					success: function (results) {

						var aResults = results.results;
						oLenght = aResults.length;
						resolve(oLenght);

					}.bind(this),
					error: function (error) {
						resolve(oLenght);
					}
				});

			}.bind(this));

		},

		onInputOrderTypeFormSelect: function (oEvent) {

			var oSource = oEvent.getSource();
			var oModel = this.getView().getModel("filterCommMapFormModel");

			if (oSource.getSelectedKey() === "1") { //Fixo
				oModel.setProperty("/textPeriodic", this.resourceBundle.getText("textShippingPeriod"));
				oModel.setProperty("/textPlacePeriodic", this.resourceBundle.getText("placeSelectShippingPeriod"));
				oModel.setProperty("/dateFrom", "HCP_ZDTREMDE");
				oModel.setProperty("/dateTo", "HCP_ZDTREMATE");
			} else {
				oModel.setProperty("/textPeriodic", this.resourceBundle.getText("textDeliveryPeriod"));
				oModel.setProperty("/textPlacePeriodic", this.resourceBundle.getText("placeSelectDeliveryPeriod"));
				oModel.setProperty("/dateFrom", "HCP_DT_ENTR_INI");
				oModel.setProperty("/dateTo", "HCP_DT_ENTR_FIM");
			}

			if (oSource.getSelectedKey() !== "3") { //Transferência
				oModel.setProperty("/visibleOffer", true);
			} else {
				oModel.setProperty("/visibleOffer", false);
				oModel.setProperty("/HCP_OFFER_NUMBER", null);
			}

			this._validateForm();

		},

		_validateForm: function () {
			var oFilterModel = this.getView().getModel("filterCommMapFormModel");

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
			var oModel = this.getView().getModel("filterCommMapFormModel");
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