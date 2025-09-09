sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function (MainController, MessageBox, History) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.warehouseMap.Index", {

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("warehouseMap.Index").attachPatternMatched(this.handleRouteMatched, this);
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

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

			if (localStorage.getItem("lastUpdateWareHouse")) {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdateWareHouse")));
			} else {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdate")));
			}
			this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdate);

			//this.refreshData();
		},

		_onCreateFormPress: function (oEvent) {

			this.oRouter.navTo("warehouseMap.New", {
				keyData: encodeURIComponent(JSON.stringify([]))
			}, false);

		},

		refreshData: function () {
			
			this.count = 0;
			this.revertCount = 20;
			this.hasFinished = false;
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			var aRefreshView = ["Warehouse_Map", "Warehouse_Material", "Warehouse_Storage_Type", "Material_Stocked", "Working_Hours",
				"Warehouse_Visual_Condition", "Storage_Type"
			];

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

				var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd/MM/yyyy HH:mm"
				});

				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				var sMessage = "Tem certeza que deseja atualizar a base do Mapa de Armazém? Verifique a qualidade da conexão.";

				MessageBox.information(
					sMessage, {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {
								this.verifyTimeOut();

								//this.setBusyDialog(
								//	this.resourceBundle.getText("textGrainApp"), this.resourceBundle.getText("textWait"));
								this.flushStore(
									"Warehouse_Map, Warehouse_Material, Warehouse_Storage_Type, Material_Stocked, Working_Hours, Warehouse_Visual_Condition, Storage_Type"
								).then(function () {
									this.refreshStore(aRefreshView).then(function () {

										localStorage.setItem("lastUpdateWareHouse", new Date());
										var lastUpdateWareHouse = dateFormat.format(new Date(localStorage.getItem("lastUpdateWareHouse")));

										this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdateWareHouse);
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
		},
		_onEditFormPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("warehouseMap.List", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

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
		navBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}
		}
	});
}, /* bExport= */ true);