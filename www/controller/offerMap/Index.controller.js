
sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function (MainController, MessageBox, History) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.offerMap.Index", {

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("offerMap.Index").attachPatternMatched(this.handleRouteMatched, this);
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "indexModel");

		},

		handleRouteMatched: function () {

			this.count = 0;
			this.revertCount = 120;
			this.hasFinished = false;
			this.timeOut = 120;
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			if (bIsMobile) {
				this.getView().getModel("indexModel").setProperty("/isMobile", true);
			} else {
				this.getView().getModel("indexModel").setProperty("/isMobile", false);
			}

			var lastUpdate;

			var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/yyyy HH:mm"
			});

			if (localStorage.getItem("lastUpdateOfferMap")) {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdateOfferMap")));
			} else {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdate")));
			}
			this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdate);

		},

		_onCreateOfferFormPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("offerMap.New", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},

		_onEditOfferFormPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("offerMap.FilterOfferMap", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},

		_onEditFreightFormPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			this.getUserProfile("View_Profile_Offer_Map_Logistics", this.userName).then(profileData => {
				if (profileData.hasAccess) {
					return new Promise(function (fnResolve) {

						this.doNavigate("offerMap.FilterLogisticsFreight", oBindingContext, fnResolve, "");
					}.bind(this)).catch(function (err) {
						if (err !== undefined) {
							MessageBox.error(err.message);
						}
					});
				} else {
					MessageBox.information("Você não possui permissão para acessar essa funcionalidade");
				}
			}).catch(error => {
				console.log(error);
			});
		},

		refreshData: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

				var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd/MM/yyyy HH:mm"
				});

				//	this.setBusyDialog(
				//		this.resourceBundle.getText("textGrainApp"), this.resourceBundle.getText("textWait"));

				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				var sMessage = "Tem certeza que deseja atualizar a base de ofertas? Verifique a qualidade da conexão.";

				MessageBox.information(
					sMessage, {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {

								this.count = 0;
								this.revertCount = 120;
								this.timeOut = 120;
								this.hasFinished = false;
								this.message = "Enviando dados, por favor aguarde (";
								this.verifyTimeOut();
								this.flushStore("Offer_Map,Offer_Map_Werks,Simplified_Contact").then(function () {
									this.refreshStore("Offer_Map", "Offer_Map_Werks", "Simplified_Contact").then(function () {

										localStorage.setItem("lastUpdateOfferMap", new Date());
										var lastUpdateOfferMap = dateFormat.format(new Date(localStorage.getItem("lastUpdateOfferMap")));

										this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdateOfferMap);

										this.hasFinished = true;
										if (bIsMobile) {
											localStorage.setItem("countStorageOfferMap", 0);
										}

										this.getView().getModel().refresh(true);
										//this.closeBusyDialog();
									}.bind(this));
								}.bind(this));

							}
						}.bind(this)
					}
				);

			} else {
				this.getView().getModel().refresh(true);
				this.closeBusyDialog();
			}
		},

		backToIndex: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Index", true);
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
		refreshDataTest: function () {

			var bIsMobile = window.fiori_client_appConfig;
			this.verifyTimeOut();

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				this.flushStore().then(function () {
					this.refreshStore().then(function () {
						this.hasFinished = true;
					}.bind(this));
				}.bind(this));
			} else {
				this.getView().getModel().refresh();
			}
		},
		verifyTimeOut: function () {

			if (!this.hasFinished) {
				setTimeout(function () {
					this.setBusyDialog("App Grãos", this.message + this.revertCount + ")");
					this.count++;
					this.revertCount--;
					//console.log("Countador está em: " + this.count);
					if (this.count > this.timeOut) {
						this.showMessage();
					} else {
						this.verifyTimeOut();
					}

				}.bind(this), 1000);
			} else {
				if (this.busyDialog) {
					this.busyDialog.close();
				}
			}
		},

		showMessage: function () {
			localStorage.setItem("isNeededToReload", true);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("errorPages.timeOutConnection", true);
		},
		navBack: function () {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
		}

	});
}, /* bExport= */ true);