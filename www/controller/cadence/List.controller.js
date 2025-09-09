sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.cadence.List", {
		formatter: formatter,
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("cadence.List").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "indexModel");
			
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		handleRouteMatched: function (oEvent) {
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

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				yesSequence: true,
				valueFilter: "0",
				yesGeral: false,
				itemCadence: []
			}), "cadenceFormModel");
			
			if (oEvent.getParameter("data")) {
				this.type = oEvent.getParameter("data").type;
				this.lifnr = oEvent.getParameter("data").lifnr;
				this.matnr = oEvent.getParameter("data").matnr;
				this.werks = oEvent.getParameter("data").werks;
				this.ekgrp = oEvent.getParameter("data").ekgrp;
				this.ekorg = oEvent.getParameter("data").ekorg;
				
				this.slpitLifnr = this.lifnr.split("-");
				var oFilterModel = this.getView().getModel("cadenceFormModel");
				oFilterModel.setProperty("/supplier", parseFloat(this.slpitLifnr[0]).toFixed() +" - "+ this.slpitLifnr[1]);
				
				if(this.type == "1"){
					oFilterModel.setProperty("/typeTitle", "Sequencial");
					this.typeTitle = "Sequencial";
					this._searchFixed();
				}else{
					oFilterModel.setProperty("/typeTitle", "Número do Pedido");
					this._searchOrder();
				}
			}

		},
		
		_searchOrder: function () {
			
			this.setBusyDialog(
			this.resourceBundle.getText("textGrainApp"), this.resourceBundle.getText("textWait"));
			var oFilterModel = this.getView().getModel("cadenceFormModel");
			var oData = oFilterModel.getProperty("/");
			var oModel = this.getOwnerComponent().getModel();
			var oTable = this.getView().byId("tableCadencia");
			
			var aFilters = [];
			
			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_LIFNR',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.slpitLifnr[0]
			}));
			
			if(this.matnr != 0){
				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_MATNR',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: this.matnr
				}));
			}
			
			if(this.werks != 0){
				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_WERKS',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: this.werks
				}));
			}

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_EKGRP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.ekgrp
			}));
			
			/*aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_STATUS',
				operator: sap.ui.model.FilterOperator.NE,
				value1: '1'
			}));*/
			
			oModel.read("/Commodities_Order", {
			filters: aFilters,
				success: function (result) {
					
					if (result.results.length > 0) {
						
						for (var m = 0; m < result.results.length; m++) {
							if(result.results[m].HCP_PEDIDO_DEP){
								var data = {
								
									HCP_PEDIDO_DEP: result.results[m].HCP_PEDIDO_DEP,
									HCP_UNIQUE_KEY: result.results[m].HCP_UNIQUE_KEY,
									HCP_MENGE_PED_DEP: result.results[m].HCP_MENGE_PED_DEP,
									HCP_LIFNR: result.results[m].HCP_LIFNR,
									HCP_MATNR: result.results[m].HCP_MATNR
								};
								var dataItem = oFilterModel.getProperty("/itemCadence");
								dataItem.push(data);
								oFilterModel.setProperty("/itemCadence", dataItem);
								
								if (oTable.getBinding("items")) {
									oTable.getBinding("items").refresh();
								}
							}
							
						}
						
						
					//	oFilterModel.setProperty("/itemCadence", result.results);
					
					}else{
							sap.m.MessageBox.show(
								"Não foram encontrados dados de pedido fixo.", {
									title: "Advertência",
									icon: sap.m.MessageBox.Icon.WARNING,
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (oAction) {
										if (oAction === "OK") {
											this.closeBusyDialog();
										}
									}.bind(this)
								}
							);
					}

				}.bind(this)	
			});
			this.closeBusyDialog();
		},
		_searchFixed: function () {
			
			this.setBusyDialog(
			this.resourceBundle.getText("textGrainApp"), this.resourceBundle.getText("textWait"));
			var oFilterModel = this.getView().getModel("cadenceFormModel");
			var oData = oFilterModel.getProperty("/");
			var oModel = this.getOwnerComponent().getModel();
			var oTable = this.getView().byId("tableCadencia");
			
			var aFilters = [];
			
			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_LIFNR',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.slpitLifnr[0]
			}));

			if(this.matnr != 0){
				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_MATNR',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: this.matnr
				}));
			}
			
			if(this.werks != 0){
				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_WERKS',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: this.werks
				}));
			}
			
			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_EKGRP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.ekgrp
			}));
			
			/*aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_STATUS',
				operator: sap.ui.model.FilterOperator.NE,
				value1: '1'
			}));*/
			
			
			oModel.read("/Commodities_Fixed_Order", {
			filters: aFilters,
				success: function (result) {
					
					if (result.results.length > 0) {
						//oFilterModel.setProperty("/itemCadence", result.results);
						for (var m = 0; m < result.results.length; m++) {
						
							if(result.results[m].HCP_ZSEQUE){
								var data = {
								
									HCP_ZSEQUE: result.results[m].HCP_ZSEQUE,
									HCP_UNIQUE_KEY: result.results[m].HCP_UNIQUE_KEY,
									HCP_MENGE: result.results[m].HCP_MENGE,
									HCP_LIFNR: result.results[m].HCP_LIFNR,
									HCP_MATNR: result.results[m].HCP_MATNR
								};
								var dataItem = oFilterModel.getProperty("/itemCadence");
								dataItem.push(data);
								oFilterModel.setProperty("/itemCadence", dataItem);
								
								if (oTable.getBinding("items")) {
									oTable.getBinding("items").refresh();
								}
							
							}
							
						}
						
					}else{
							sap.m.MessageBox.show(
								"Não foram encontrados dados de pedido fixo.", {
									title: "Advertência",
									icon: sap.m.MessageBox.Icon.WARNING,
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (oAction) {
										if (oAction === "OK") {
											this.closeBusyDialog();
										}
									}.bind(this)
								}
							);
					}

				}.bind(this)	
			});
			this.closeBusyDialog();
		},
		_changeTypeFilter: function (oEvent) {

			var oInput = oEvent.getSource();
			var oFilterModel = this.getView().getModel("cadenceFormModel");

			if (oInput.getSelectedKey() === "1") {
				oFilterModel.setProperty("/yesSequence", false);
				oFilterModel.setProperty("/yesGeral", true);
			} else {
				oFilterModel.setProperty("/yesSequence", true);
				oFilterModel.setProperty("/yesGeral", false);
			}
		},
		_onRowPress: function (oEvent) {
			
				var sPath = oEvent.getSource().oBindingContexts.cadenceFormModel.sPath;
				var sPlit = oEvent.getSource().oBindingContexts.cadenceFormModel.sPath.split("/");
				var sIndex = sPlit[2];
				var oData;
				
				oData = oEvent.getSource().oBindingContexts.cadenceFormModel.oModel.oData.itemCadence[sIndex];
				
				var offer = oData.HCP_PEDIDO_DEP;
				var sequence = oData.HCP_ZSEQUE;
				
				var totalCadence;
				
				if(oData.HCP_MENGE){
					totalCadence = oData.HCP_MENGE;
				}else{
					totalCadence = oData.HCP_MENGE_PED_DEP;
				}
				
				if((offer == null) || (offer == "")){
					offer = "0";
				}
				
				if((sequence == null) || (sequence == "")){
					sequence = "0";
				}
				
				this.oRouter.navTo("cadence.New", {
					unique: oData.HCP_UNIQUE_KEY,
					offerNumer: offer,
					sequence: sequence,
					supplier: parseFloat(oData.HCP_LIFNR),
					totalCadence: totalCadence,
					lifnr:oData.HCP_LIFNR,
					matnr:oData.HCP_MATNR
				}, false);
			
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
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(
					sEntityNameSet,
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
		flushStore: function () {
			return new Promise(function (resolve, reject) {
				if (typeof sap.hybrid !== 'undefined') {
					sap.hybrid.flushStore().then(function () {
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
		}
	});
});