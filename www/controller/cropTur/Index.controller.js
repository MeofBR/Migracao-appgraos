/* global cordova */ 
sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.cropTur.Index", {
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("cropTur.Index").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false,
				enableCreate: false
			}), "indexModel");
		},

		handleRouteMatched: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			// Configurar a data de última atualização
			var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/yyyy HH:mm"
			});
			
			var lastUpdate;
			if (localStorage.getItem("lastUpdateCrop")) {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdateCrop")));
			} else {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdate")));
			}
			this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdate);

			if (bIsMobile) {
				this.getView().getModel("indexModel").setProperty("/isMobile", true);
				this.getView().getModel("indexModel").setProperty("/enableComposeReport", false);
			} else {
				this.getView().getModel("indexModel").setProperty("/isMobile", false);
				this.getView().getModel("indexModel").setProperty("/enableComposeReport", true);
			}
		},
		
		backToIndex: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", {});
			}
		},

		refreshData: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd/MM/yyyy HH:mm"
				});
				
				var sMessage = "Tem certeza que deseja atualizar a base de CropTour? Verifique a qualidade da conexão.";

				MessageBox.warning(
					sMessage, {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {
								this.setBusyDialog("App Grãos", "Aguarde");
								this.flushStore(
									"CropTur_Collection, View_CropTur_Distinct, Country_Croptour, Regions_Croptour, Crop_Year_Croptour_Dist"
								).then(function () {
									this.refreshStore("CropTur_Collection", "View_CropTur_Distinct", "Country_Croptour", "Regions_Croptour", "Crop_Year_Croptour_Dist", "Adms_Croptour", "Regions_Croptour").then(function () {
										this.getView().getModel().refresh();
										localStorage.setItem("lastUpdateCrop", new Date());
										var lastUpdateCrop = dateFormat.format(new Date(localStorage.getItem("lastUpdateCrop")));
										this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdateCrop);
										this.getView().getModel().refresh();
										localStorage.setItem("countStorageCrop", 0);
										this.closeBusyDialog();
									}.bind(this));
								}.bind(this));
							}
						}.bind(this)
					}
				);
			} else {
				this.getView().getModel().refresh();
			}
		},

		setBusyDialog: function (sTitle, sMessage) {
			var timestamp = new Date().getTime();
			if (!this.busyDialog) {
				this.busyDialog = new sap.m.BusyDialog("busyDialogID" + this.getView().getId() + timestamp);
			}
			this.busyDialog.setText(sMessage);
			this.busyDialog.setTitle(sTitle);
			this.busyDialog.open();
		},

		closeBusyDialog: function () {
			if (this.busyDialog) {
				this.busyDialog.close();
			}
		},

		onCreateOrEditCropTur: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("cropTur.Filter", {});
		},

		onConsult: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("cropTur.FilterConsult", {});
		}
		
	});
}); 