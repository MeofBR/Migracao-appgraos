sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox"
], function (MainController, MessageBox) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.price.priceIntention.MainIndex", {

		_onCreatePriceIntentionPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {
				this.doNavigate("price.priceIntention.Index", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		refreshData: function () {

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				this.setBusyDialog("App Grãos", "Carregando Tabela de Preços");
				this.refreshStore("Table_Price").then(function () {
					localStorage.setItem("lastUpdateTablePrice", new Date());
					this.getView().getModel().refresh(true);
					this.getView().byId("pullToRefreshID").hide();
					this.closeBusyDialog();
				}.bind(this));
			} else {
				this.getView().getModel().refresh(true);
				this.getView().byId("pullToRefreshID").hide();
				this.closeBusyDialog();
			}
		},
		setBusyDialog: function (aTitle, aMessage) {
			if (!this.busyDialog) {
				this.busyDialog = new sap.m.BusyDialog("busyDialogID" + this.getView().getId());
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
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "indexModel");

			this.oRouter.getRoute("price.priceIntention.MainIndex").attachPatternMatched(this.handleRouteMatched, this);

		},
		handleRouteMatched: function () {

			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if (bIsMobile) {
				this.getView().getModel("indexModel").setProperty("/isMobile", true);
			} else {
				this.getView().getModel("indexModel").setProperty("/isMobile", false);
			}
			//	this.refreshData();
		},
		navBack: function () {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Index", true);

		}
	});
}, /* bExport= */ true);