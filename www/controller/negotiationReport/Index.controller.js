sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox"

], function (MainController, MessageBox) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.negociationReport.Index", {
		_onCreateNegotiationReportPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {
				this.doNavigate("negotiationReport.Filter", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

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

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "indexModel");

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("negotiationReport.Index").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		},
		handleRouteMatched: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			this.count = 0;
			this.revertCount = 20;
			this.hasFinished = false;

			if (bIsMobile) {
				this.getView().getModel("indexModel").setProperty("/isMobile", true);
			} else {
				this.getView().getModel("indexModel").setProperty("/isMobile", false);
			}

			var lastUpdate;

			var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/yyyy HH:mm"
			});

			if (localStorage.getItem("lastUpdateNegotiationReport")) {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdateNegotiationReport")));
			} else {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdate")));
			}
			this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdate);
		},
		navBack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Index", true);
		},
		_onReportFilterPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {
				this.doNavigate("negotiationReport.ReportFilter", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onListNegotiationReportPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {
				this.doNavigate("negotiationReport.ReportList", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		refreshData: function () {

			this.hasFinished = false;
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

				var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd/MM/yyyy HH:mm"
				});

				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				var sMessage = "Tem certeza que deseja atualizar a base de Relatos de Negócios? Verifique a qualidade da conexão.";

				MessageBox.information(
					sMessage, {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {
								this.verifyTimeOut();

								//this.setBusyDialog(
								//	this.resourceBundle.getText("textGrainApp"), this.resourceBundle.getText("textWait"));
								this.flushStore("Negotiation_Report").then(function () {
									this.refreshStore("Negotiation_Report").then(function () {

										localStorage.setItem("lastUpdateNegotiationReport", new Date());
										var lastUpdateNegotiationReport = dateFormat.format(new Date(localStorage.getItem("lastUpdateNegotiationReport")));

										this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdateNegotiationReport);
										this.getView().getModel().refresh(true);
										this.hasFinished = true;
										//this.getView().byId("pullToRefreshID").hide();
										//this.closeBusyDialog();
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
				this.hasFinished = true;
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				var sMessage = "Conexão com internet não encontrada, verifique e tente novamente!";

				MessageBox.warning(
					sMessage, {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {}.bind(this)
					}
				);

			}
		},
		verifyTimeOut: function () {

			if (!this.hasFinished) {
				setTimeout(function () {
					this.setBusyDialog("App Grãos", "Enviando dados, por favor aguarde (" + this.revertCount +
						")");
					this.count++;
					this.revertCount--;
				//	console.log("Countador está em: " + this.count);
					if (this.count > 20) {
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

	});
}, /* bExport= */ true);