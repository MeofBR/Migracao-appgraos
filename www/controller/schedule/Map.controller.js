sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function (MainController, MessageBox, Utilities, History) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.schedule.Map", {
		handleRouteMatched: function (oEvent) {

			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));
			var sAppId = "App5bc5fa855cf709010573d699";

			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function (oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype") {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}

			var oPath;

			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}

		},
		_onPageNavButtonPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("AgendaVisualizarSmart", oBindingContext, fnResolve, "");
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
		avatarInitialsFormatter: function (sTextValue) {
			return typeof sTextValue === 'string' ? sTextValue.substr(0, 2) : undefined;

		},
		_onButtonPress: function (oEvent) {

			oEvent = jQuery.extend(true, {}, oEvent);
			return new Promise(function (fnResolve) {
					fnResolve(true);
				})
				.then(function (result) {

					var oBindingContext = oEvent.getSource().getBindingContext();

					return new Promise(function (fnResolve) {

						this.doNavigate("AgendaMapaFinalSmart", oBindingContext, fnResolve, "");
					}.bind(this));

				}.bind(this))
				.then(function (result) {
					if (result === false) {
						return false;
					} else {
						return new Promise(function (fnResolve) {
							var sTargetPos = "";
							sTargetPos = (sTargetPos === "default") ? undefined : sTargetPos;
							sap.m.MessageToast.show("Check-in realizado com sucesso", {
								onClose: fnResolve,
								duration: 2000 || 3000,
								at: sTargetPos,
								my: sTargetPos
							});
						});

					}
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
		},
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("AgendaMapaSmart").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		}
	});
}, /* bExport= */ true);