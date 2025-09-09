sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function (MainController, MessageBox, History) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.masterData.disableCommercialization", {
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("masterData.disableCommercialization").attachPatternMatched(this.handleRouteMatched, this);
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		handleRouteMatched: function () {
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));
			
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				stateToggle: false
			}), "filterDisableCommercialization");
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
		
		backToIndex: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}
		},

		getParameters: function (status) {
			var oModel = this.getView().getModel();
			var oTableModel = this.getView().getModel("filterDisableCommercialization");
			oTableModel.setProperty("/itemCommercialization", []);

			oModel.read("/Disable_Commercialization", {
				success: function (result) {

					this.countRegister = result.results.length;

					if (result.results.length > 0) {
						oTableModel.setProperty("/itemCommercialization", result.results);
						var oTable = this.getView().byId("table");
						oTable.getBinding("items").refresh();

					}
					this.closeBusyDialog();
				}.bind(this)
			});
		},
		
		onToggleSwitch: function (oEvent) {
			let button = oEvent.getSource();
			let stateSwitch = button.getState();
			var oModel = this.getView().getModel("filterDisableCommercialization");
			oModel.setProperty("/stateToggle", stateSwitch);
		},
		
		onSavePress: async function () {
			var oDeviceModel = this.getView().getModel();
			var oModel = this.getView().getModel("filterDisableCommercialization");
			let stateSwitch = oModel.oData.stateToggle
			
			oDeviceModel.setUseBatch(true);
			let sPath = "/Disable_Commercialization(1)"
			
			let oProperties = {
				HCP_STATUS_COMMERCIALIZATION: stateSwitch == true ? "1" : "0"
 			};

			oDeviceModel.update(sPath, oProperties, {
				groupId: "changes"
			});
			
			await oDeviceModel.submitChanges({
				groupId: "changes",
				success: function () {
					MessageBox.success("Cálculo Automático Alterado com Sucesso.");
					
				}.bind(this),
				error: function () {
					MessageBox.error("Erro ao Alterar Cálculo Automático.");
				}.bind(this)
			});
		},

	});
}, /* bExport= */ true);