sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, JSONModel, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.negotiationReport.ReportIndex", {
		formatter: formatter,
		onInit: function () {

			this.setBusyDialog("App Grãos", "Atualizando lista, por favor aguarde");

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("negotiationReport.ReportIndex").attachPatternMatched(this.handleRouteMatched, this);

		},
		handleRouteMatched: function (oEvent) {

			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));
			var oModel = this.getOwnerComponent().getModel();
			var oComponent = this.getOwnerComponent();
			var oDeviceModel = oComponent.getModel("device");
			this.getView().setModel(oDeviceModel, "device");
			var oTable = this.getView().byId("table");
			this.getView().setModel(new sap.ui.model.json.JSONModel(), "reportIndexModel");

			if (oEvent.getParameter("arguments")) {
				this.start_date = decodeURIComponent(oEvent.getParameter("arguments").start_date);
				this.end_date = decodeURIComponent(oEvent.getParameter("arguments").end_date);
				this.state = decodeURIComponent(oEvent.getParameter("arguments").state);
				
				var newDate = new Date();
				var timezone = newDate.getTimezoneOffset()*60*1000;
				
			
				this.start_date = new Date(new Date(this.start_date).setHours(0,0,0));
				this.start_date = this.start_date.setTime( this.start_date.getTime() - timezone );
				

				this.end_date = new Date(new Date(this.end_date).setHours(23,59,59));
				this.end_date = this.end_date.setTime( this.end_date.getTime() - timezone );
			}

			var oFilterModel = this.getView().getModel("reportIndexModel");
			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_STATE',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.state
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_STATUS',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: '0'
			}));

			aFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
				.BT,
				this.start_date, this.end_date));

			oModel.read("/Negotiation_Report", {
				filters: aFilters,
				success: function (oDataProspect) {
					//	oFilterModel.setProperty("/data", oDataProspect.results);
					oFilterModel.setProperty("/count", oDataProspect.results.length);
					oFilterModel.setProperty("/state", this.state);

					oTable.getBinding("items").filter(aFilters);
					if (oTable.getBinding("items")) {
						oTable.getBinding("items").refresh();
					}
					this.closeBusyDialog();
				}.bind(this)
			});
		},

		_onRowPress: function (oEvent) {

			var oItem = oEvent.getSource();

			this.oRouter.navTo("negotiationReport.Edit", {
				HCP_NEGO_REPORT_ID: encodeURIComponent(oItem.getBindingContext().getPath()),
				isEdit: '2'
			});

		},
		_onCancelPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("Index", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_formatDate: function (oValue) {
			var oDate = null;
			// can be of type Date if consumed with OData (XML format)
			if (oValue instanceof Date) {
				oDate = oValue;
			}
			// can be a string primitive in JSON, but we need a number
			else if ((typeof oValue) === "string") {
				// can be of type JSON Date if consumed with OData (JSON format)
				if (oValue.indexOf("/") === 0) {
					oValue = oValue.replace(new RegExp("/", 'g'), "");
					oValue = oValue.replace(new RegExp("\\(", 'g'), "");
					oValue = oValue.replace(new RegExp("\\)", 'g'), "");
					oValue = oValue.replace("Date", "");
					oValue = parseInt(oValue);
					oDate = new Date(oValue);
				} else {
					// backward compatibility, old type was long, new type is date
					// check if not a number
					var result = isNaN(Number(oValue));
					if (result) {
						// FF and Ie cannot create Dates using 'DD-MM-YYYY HH:MM:SS.ss' format but
						// 'DD-MM-YYYYTHH:MM:SS.ss'
						oValue = oValue.replace(" ", "T");
						// this is a date type
						oDate = new Date(oValue);
					} else {
						// this is a long type
						oValue = parseInt(oValue);
						// ensure that UNIX timestamps are converted to milliseconds
						oDate = new Date(oValue * 1000);
					}
				}
			} else {
				// ensure that UNIX timestamps are converted to milliseconds
				oDate = new Date(oValue * 1000);
			}
			return oDate;
		},

		refreshStore: function (entity1, entity2, entity3, entity4) {
			return new Promise(function (resolve, reject) {
				if (typeof sap.hybrid !== 'undefined') {
					this.setBusyDialog("App Grãos", "Atualizando banco de dados");
					sap.hybrid.refreshStore(entity1, entity2, entity3, entity4).then(function () {
						resolve();
					}.bind(this));
				} else {
					resolve();
				}
			}.bind(this));
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