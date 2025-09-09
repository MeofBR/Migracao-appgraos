sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.errorPages.noUserFound", {
		formatter: formatter,
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("errorPages.noUserFound").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "noUserFoundModel");
		},

		handleRouteMatched: function () {
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));
		},

		reloadUser: function () {
			var oComponent = this.getOwnerComponent();

			this.setBusyDialog("Usuário", "Carregando Usuário");
			oComponent.loadUser().then(function () {
				this.closeBusyDialog();
				sap.m.MessageBox.success(
					"Usuário carregado com sucesso!", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function (oAction) {
							this.navBack();
						}.bind(this)
					}
				);
			}.bind(this)).catch(function () {
				sap.m.MessageBox.error(
					"Falha ao carregar Usuário", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						actions: [sap.m.MessageBox.Action.OK]
					}
				);
				this.closeBusyDialog();
			}.bind(this));
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
});