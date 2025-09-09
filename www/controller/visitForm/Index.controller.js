sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function (MainController, MessageBox, History) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.visitForm.Index", {

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("visitForm.Index").attachPatternMatched(this.handleRouteMatched, this);

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "indexModel");

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

			var lastUpdate;
			var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/yyyy HH:mm"
			});

			if (localStorage.getItem("lastUpdateVisitForm")) {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdateVisitForm")));
			} else {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdate")));
			}
			this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdate);

			this.getView().getModel("indexModel").setProperty("/lastUpdateVisitForm", lastUpdate);

			// this.refreshData();
		},

		refreshData: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			var aRefreshView = ["Visit_Form_Grains", "Visit_Form_Yearly", "Visit_Form_Industry", "Visit_Form_Periodic", "Visit_Uf_Planting",
				"Visit_Culture_Type", "Visit_Storage_Type", "Visit_Form_Tools", "Visit_Form_Material", "Visit_Form_Criterion",
				"Visit_Form_Certifications", "View_Visit_Grains", "View_Visit_Industry", "View_Visit_Yearly", "View_Visit_Periodic"
			];

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

				var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd/MM/yyyy HH:mm"
				});

				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				var sMessage = "Tem certeza que deseja atualizar a base da Ficha de Visitas? Verifique a qualidade da conexão.";

				MessageBox.warning(
					sMessage, {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {

								this.setBusyDialog("App Grãos", "Aguarde");
								this.flushStore(
									"Visit_Form_Grains,Visit_Form_Yearly,Visit_Form_Industry,Visit_Form_Periodic,Visit_Uf_Planting,Visit_Culture_Type,Visit_Storage_Type,Visit_Form_Tools,Visit_Form_Material,Visit_Form_Criterion,Visit_Form_Certifications,View_Visit_Grains,View_Visit_Industry,View_Visit_Yearly,View_Visit_Periodic"
								).then(function () {
									this.refreshStore(aRefreshView).then(function () {
										
										localStorage.setItem("lastUpdateVisitForm", new Date());
										var lastUpdateSchedule = dateFormat.format(new Date(localStorage.getItem("lastUpdateVisitForm")));
	
										this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdateSchedule);
										
										this.getView().getModel().refresh(true);
										
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

		backToIndex: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			// if (sPreviousHash !== undefined) {
			// 	window.history.go(-1);
			// } else {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Index", true);
			// }

		},

		_onCreateVisitFormPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("visitForm.New", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},

		_onStandardListItemPress1: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("visitForm.Edit", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		
		_onSimplifiedContact: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("visitForm.SimplifiedContact", oBindingContext, fnResolve, "");
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

		refreshStore: function (entity1) {
			return new Promise(function (resolve, reject) {
				if (typeof sap.hybrid !== 'undefined') {
					// this.setBusyDialog("App Grãos", "Atualizando banco de dados");
					sap.hybrid.refreshStore(entity1).then(function () {
						resolve();
					}.bind(this));
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
		}
	});
}, /* bExport= */ true);