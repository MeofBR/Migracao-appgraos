/* global cordova */ 
sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.crop.Index", {
		formatter: formatter,
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("crop.Index").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "indexModel");
		},

		handleRouteMatched: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			if (bIsMobile) {
				this.getView().getModel("indexModel").setProperty("/isMobile", true);
				this.getView().getModel("indexModel").setProperty("/enableComposeReport", false);
			} else {
				this.getView().getModel("indexModel").setProperty("/isMobile", false);
				this.getView().getModel("indexModel").setProperty("/enableComposeReport", true);
			}



				var lastUpdate;

                var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern: "dd/MM/yyyy HH:mm"
                });

                if (localStorage.getItem("lastUpdateCrop")) {
                    lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdateCrop")));
                } else {
                    lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdate")));
                }
                this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdate);




			// this.refreshData();
		},

		refreshData: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;


            var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
            var sMessage = "Tem certeza que deseja atualizar a base de Acompanhamento de Lavoura? Verifique a qualidade da conexão.";

            if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

            	var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern: "dd/MM/yyyy HH:mm"
                });

                MessageBox.warning(
                    sMessage, {
                        actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
                        styleClass: bCompact ? "sapUiSizeCompact" : "",
                        onClose: function (sAction) {
                            if (sAction === "YES") {

                            this.setBusyDialog("App Grãos", "Aguarde");
                            this.flushStore("Crop_Track_Partner,Crop_Track_Material,Crop_Track_Region,Crop_Track_Crop_Year,Crop_Track_Commercialization,Commercialization,Regions,Negotiation_Report").then(function () {
                                this.refreshStore("Crop_Tracking", "Commercialization","Regions","Negotiation_Report").then(function () {
                                    this.getView().getModel().refresh(true);
                                    //this.getView().byId("pullToRefreshID").hide();
                                    localStorage.setItem("lastUpdateCrop", new Date());

                                    var lastUpdateSchedule = dateFormat.format(new Date(localStorage.getItem("lastUpdateCrop")));

                                    this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdateSchedule);
                                    this.getView().getModel().refresh(true);
                                    localStorage.setItem("countStorageCrop", 0);

                                    this.closeBusyDialog();
                                }.bind(this));
                            }.bind(this));

                            }
                        }.bind(this)
                    }
                );

			} else {
				this.getView().getModel().refresh(true);
				//this.getView().byId("pullToRefreshID").hide();
				this.closeBusyDialog();
			}
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
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}
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

		refreshStore: function (entity1, entity2, entity3, entity4, entity5, entity6) {
			return new Promise(function (resolve, reject) {
				if (typeof sap.hybrid !== 'undefined') {
					// this.setBusyDialog("App Grãos", "Atualizando banco de dados");
					sap.hybrid.refreshStore(entity1, entity2, entity3, entity4, entity5, entity6).then(function () {
						resolve();
					}.bind(this));
				} else {
					resolve();
				}
			}.bind(this));
		},

		onCreateOrEditCrop: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("crop.Filter", true);
		},

		onConsult: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("crop.Consult", true);
		},

		onComposeExtraction: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("crop.ComposeExFilter", true);
		}
	});
});