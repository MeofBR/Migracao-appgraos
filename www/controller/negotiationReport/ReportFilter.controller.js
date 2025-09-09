sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.negotiationReport.ReportFilter", {
		formatter: formatter,
		onInit: function () {
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableCreate: false
			}), "reportFilterModel");
			
			var oModel = this.getOwnerComponent().getModel();
			this.oModel = oModel;
			
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("negotiationReport.ReportFilter").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.getView().setModel(this.getOwnerComponent().getModel());
		},

		handleRouteMatched: function () {
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));
		},

		navBack: function () {
			let oHistory = History.getInstance();
			let sPreviousHash = oHistory.getPreviousHash();
			let oModel = this.getView().getModel("reportFilterModel");
			// let oSorter = []
			// let oTable = this.getView().byId("table");
			// let oFilters = []
			
			oModel.setProperty("/", []);
		
			// oSorter.push(new sap.ui.model.Sorter({
			// 	path: 'HCP_CREATED_AT',
			// 	descending: true
			// }));
			
			// oTable.getBinding("items").sort(oSorter).filter(oFilters);
			
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}
		},

		_onConfirm: function () {
			var oFilterModel = this.getView().getModel("reportFilterModel");
			var oData = oFilterModel.getData();
			
			this.oRouter.navTo("negotiationReport.ReportIndex", {
				start_date: encodeURIComponent(oData.start_date),
				end_date: encodeURIComponent(oData.end_date),
				state: encodeURIComponent(oData.state)
			}, false);
		},

		_validateForm: function () {
			var oFilterModel = this.getView().getModel("reportFilterModel");

			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;

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
			}.bind(this), 100);
		},

		_getFormFields: function () {
			var oMainDataForm = this.byId("NegotiationReportKeysForm").getContent();
			var aControls = [];
			var sControlType;

			for (var i = 0; i < oMainDataForm.length; i++) {
				sControlType = oMainDataForm[i].getMetadata().getName();
				if (sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" || sControlType === "sap.m.Input" || sControlType === "sap.m.DateTimeInput" || sControlType === "sap.m.DatePicker" ||
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
		}
	});
});