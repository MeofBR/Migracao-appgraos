sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.supplierExtract.Filter", {
		formatter: formatter,
		onInit: function () {
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableCreate: false
			}), "reportFilterModel");
			
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("supplierExtract.Filter").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.getView().setModel(this.getOwnerComponent().getModel());
		},

		handleRouteMatched: function () {
			var oDataSelect = this.getView().byId("dataRangeSelect");
			var sValueState = 'None';
			var sValueStateMessage = '';
			oDataSelect.setValueState(sValueState);
			oDataSelect.setValueStateText(sValueStateMessage);

			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));
		},

		navBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oModel = this.getView().getModel("reportFilterModel");

			oModel.setProperty("/", []);

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Index", true);
		},

		_onConfirm: function () {

			var oFilterModel = this.getView().getModel("reportFilterModel");
			var oData = oFilterModel.getData();

			this.oRouter.navTo("supplierExtract.Index", {
				start_date: encodeURIComponent(oData.start_date),
				end_date: encodeURIComponent(oData.end_date),
				supplier: encodeURIComponent(oData.HCP_PARTNER),
				supplierName: encodeURIComponent(oData.PROVIDER_DESC)
			}, false);

		},

		_validateForm: function (oEvent) {
			var oFilterModel = this.getView().getModel("reportFilterModel");
			var oSource = oEvent.getSource();

			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;
				var hasError = false;

				if (oSource.mProperties.dateValue && oSource.mProperties.secondDateValue) {

					var newDate = new Date();
					var dateRange = newDate.getYear() - oSource.mProperties.dateValue.getYear();

					if (dateRange > 3) {
						var sValueState = 'Error';
						var sValueStateMessage = 'Campo inválido, selecione uma data com intervalo menor que 4 anos.';

						oSource.setValueState(sValueState);
						oSource.setValueStateText(sValueStateMessage);
						hasError = true;
						oFilterModel.setProperty("/enableCreate", false);
					} else {
						var sValueState = 'None';
						var sValueStateMessage = '';

						oSource.setValueState(sValueState);
						oSource.setValueStateText(sValueStateMessage);
					}
				}

				if (!hasError) {
					for (var m = 0; m < aInputControls.length; m++) {
						oControl = aInputControls[m].control;
						if (aInputControls[m].required) {
							var sValue = oControl.getValue();
							if (sValue.length > 0) {
								oFilterModel.setProperty("/enableCreate", true);
							} else {
								oFilterModel.setProperty("/enableCreate", false);
								return;
							}
						}
					}
				}

			}.bind(this), 100);
		},

		_getFormFields: function () {
			var oMainDataForm = this.byId("supplierExtractKeysForm").getContent();
			var aControls = [];
			var sControlType;

			for (var i = 0; i < oMainDataForm.length; i++) {
				sControlType = oMainDataForm[i].getMetadata().getName();
				if (sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" || sControlType === "sap.m.Input" ||
					sControlType === "sap.m.DateTimeInput" || sControlType === "sap.m.DatePicker" ||
					sControlType === "sap.m.CheckBox" || sControlType === "sap.m.MaskInput" || sControlType === "sap.m.ComboBox" || sControlType ===
					"sap.m.DateRangeSelection") {
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

		_handlePartnerFilterPress: function (oEvent) {
			var oFilterBar;

			var oVisitModel = this.getView().getModel("reportFilterModel");

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
			var oModel = this.getView().getModel("reportFilterModel");
			var oData = oModel.getProperty("/");
			var SelectedPartner = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

			oData["HCP_PARTNER"] = SelectedPartner.HCP_REGISTER;
			oData["PROVIDER_DESC"] = SelectedPartner.NAME1;
			// oPartnerInput.setDescription(SelectedPartner.NAME1);
			// this._validateForm();
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
		}

	});
});