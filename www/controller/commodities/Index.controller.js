sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function (MainController, MessageBox, History) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.commodities.Index", {

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("commodities.Index").attachPatternMatched(this.handleRouteMatched, this);
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "indexModel");

			if (!bIsMobile) {
				//this.refreshData();
			}

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

			if (localStorage.getItem("lastUpdateCommodities")) {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdateCommodities")));
			} else {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdate")));
			}
			this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdate);

		},

		_onCreateFixedPriceFormPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("commodities.NewFixedOrder", oBindingContext, fnResolve, "", "", true);
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},

		_onCreateDepositFormPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("commodities.NewDepositTransf", oBindingContext, fnResolve, "", "2", true);
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},

		_onCreateTransferFormPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("commodities.NewDepositTransf", oBindingContext, fnResolve, "", "3", "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},

		_onConsultFormPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("commodities.Filter", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},

		refreshData: function () {

			this.count = 0;
			this.revertCount = 120;
			this.hasFinished = false;
			this.timeOut = 120;
			this.message = "Processando dados, por favor aguarde (";
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

				var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd/MM/yyyy HH:mm"
				});

				//	this.setBusyDialog(
				//		this.resourceBundle.getText("textGrainApp"), this.resourceBundle.getText("textWait"));
				if (bIsMobile) {
					var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
					var sMessage = "Tem certeza que deseja atualizar a base de compras? Verifique a qualidade da conexão.";

					MessageBox.information(
						sMessage, {
							actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
							styleClass: bCompact ? "sapUiSizeCompact" : "",
							onClose: function (sAction) {
								if (sAction === "YES") {

									this.verifyTimeOut();
									this.submitDatesPending().then(function () {

										this.count = 0;
										this.timeOut = 120;
										this.hasFinished = false;
										this.message = "Enviando dados, por favor aguarde (";

										this.flushStore("Commodities_Fixed_Order,Commodities_Log_Messages,Commodities_Order,Commodities_Check,Commodities_Log_Messages").then(function () {
											this.refreshStore("Commodities_Fixed_Order", "Commodities_Order").then(function () {

													localStorage.setItem("lastUpdateCommodities", new Date());
													var lastUpdateCommodities = dateFormat.format(new Date(localStorage.getItem("lastUpdateCommodities")));

													this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdateCommodities);

													this.hasFinished = true;
													if (bIsMobile) {
														localStorage.setItem("countStorageCommodities", 0);
													}

													this.getView().getModel().refresh(true);

													//this.closeBusyDialog();
												}.bind(this));
										}.bind(this));
									}.bind(this));

								}
							}.bind(this)
						}
					);
				} else {
					this.verifyTimeOut();
					this.submitDatesPending().then(function () {
						this.hasFinished = true;
						this.getView().getModel().refresh(true);
					}.bind(this));
				}

			} else {
				this.hasFinished = true;
				this.getView().getModel().refresh(true);
				//	this.getView().byId("pullToRefreshID").hide();
				this.closeBusyDialog();
			}
		},

		submitDatesPending: function () {

			return new Promise(function (resolve, reject) {

				var oSucess;

				this.submitCommoditiesEcc(null, "1", true, false).then(function (oSucess) { //Fixo
					this.submitCommoditiesEcc(null, "2", true, false).then(function (oSucess) { //Depósito
						this.submitCommoditiesEcc(null, "3", true, false).then(function (oSucess) { //Transferência
							//this.closeBusyDialog();
							resolve();
						}.bind(this));
					}.bind(this));
				}.bind(this));

			}.bind(this));
		},

		backToIndex: function () {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Index", true);

		},

		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation, sType, sKeyData) {
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
				if (sType) {
					this.oRouter.navTo(sRouteName, {
						type: sType
					}, false);
				} else if (sKeyData) {
					this.oRouter.navTo(sRouteName, {
						keyData: sKeyData
					}, false);

				} else {
					this.oRouter.navTo(sRouteName);
				}
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