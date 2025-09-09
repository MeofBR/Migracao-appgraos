sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, JSONModel, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.negotiationReport.ReportList", {
		formatter: formatter,
		handleRouteMatched: function (oEvent) {
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));
			this.setBusyDialog("App Grãos", "Atualizando lista, por favor aguarde");
			
			let oModel = this.getOwnerComponent().getModel();
			let oFilterModel = this.getView().getModel("reportIndexModel");
			let oTable = this.getView().byId("table");
			// let oFilters = [];

			let oDeviceModel = this.getOwnerComponent().getModel("device");
			let bIsMobile = oDeviceModel.getData().browser.mobile;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				oModel.read("/Negotiation_Report", {
					success: function (oDataProspect) {
						oTable.getBinding("items").aFilters.length > 0 
							? oFilterModel.setProperty("/count", oTable.getBinding("items").getLength()) 
							: oFilterModel.setProperty("/count", oDataProspect.results.length);
							
						oTable.getBinding("items");
						if (oTable.getBinding("items")) {
							oTable.getBinding("items").refresh();
						}
						this.closeBusyDialog();

					}.bind(this)
				});
			} else {
				oModel.read("/Negotiation_Report", {
					success: function (oDataProspect) {
						oTable.getBinding("items").aFilters.length > 0 
							? oFilterModel.setProperty("/count", oTable.getBinding("items").getLength()) 
							: oFilterModel.setProperty("/count", oDataProspect.results.length);

						oTable.getBinding("items");
						if (oTable.getBinding("items")) {
							oTable.getBinding("items").refresh();
						}
						this.closeBusyDialog();
					}.bind(this)
				});
			}

		},

		onInit: function () {
			this.getView().setModel(new sap.ui.model.json.JSONModel(), "reportIndexModel");
			this.getView().setModel(new sap.ui.model.json.JSONModel(), "filters");
			
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("negotiationReport.ReportList").attachPatternMatched(this.handleRouteMatched, this);
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

		_onCancel: function (oEvent) {
			let oHistory = History.getInstance();
			let sPreviousHash = oHistory.getPreviousHash();
			let oSorter = [];
			let oTable = this.getView().byId("table");
			let oFilters = [];
			
			this.getView().setModel(new sap.ui.model.json.JSONModel(), "filters");

			oSorter.push(new sap.ui.model.Sorter({
				path: 'HCP_CREATED_AT',
				descending: true
			}));
			
			oTable.getBinding("items").sort(oSorter).filter(oFilters);
			
			let oSelectedColumn = sap.ui.getCore().byId("group_column")?.getSelectedButton()?.getId();
			let oSelectedSort = sap.ui.getCore().byId("group_sort")?.getSelectedButton()?.getId();
			
			if (oSelectedColumn && oSelectedSort) {
				sap.ui.getCore().byId("group_column").setSelectedIndex(3);
				sap.ui.getCore().byId("group_sort").setSelectedIndex(1);
			}

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}
		},

		_onRowPress: function (oEvent) {

			var oItem = oEvent.getSource();

			this.oRouter.navTo("negotiationReport.Edit", {
				HCP_NEGO_REPORT_ID: encodeURIComponent(oItem.getBindingContext().getPath()),
				isEdit: '1'
			}, false);

		},
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
		filterButtonPressed: function (oEvent) {
			if (!this._FragmentFilter) {
				this._FragmentFilter = sap.ui.xmlfragment(
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.negotiationReport.fragments.FragmentFilter",
					this);

				var oModelFilters = new JSONModel({
					HCP_CREATED_BY: "",
					HCP_NEGO_REPORT_ID: "",
					HCP_CROP: "",
					HCP_STATE: "",
					HCP_START_DATE: "",
					HCP_END_DATE: ""
				});

				this.getView().setModel(oModelFilters, "filters");
				this.getView().addDependent(this._FragmentFilter);

			}

			this._FragmentFilter.openBy(oEvent.getSource());
		},
		
		submitFilterList: function (oEvent) {
			var oFilterModel = this.getView().getModel("filters");
			var oFiltertData = oFilterModel.getProperty("/");

			var oTable = this.getView().byId("table");
			var oFilters = [];

			oFiltertData.HCP_CREATED_BY ? oFilters.push(new sap.ui.model.Filter("HCP_CREATED_BY", sap.ui.model.FilterOperator.Contains,
					oFiltertData.HCP_CREATED_BY)) :
				false;

			var teste = oFiltertData.HCP_NEGO_REPORT_ID;

			oFiltertData.HCP_NEGO_REPORT_ID ? oFilters.push(new sap.ui.model.Filter("HCP_NEGO_REPORT_ID", sap.ui.model.FilterOperator.Contains,
					teste.toString())) :
				false;

			oFiltertData.HCP_CROP ? oFilters.push(new sap.ui.model.Filter("HCP_CROP", sap.ui.model.FilterOperator.EQ, parseInt(oFiltertData.HCP_CROP))) :
				false;

			oFiltertData.HCP_STATE ? oFilters.push(new sap.ui.model.Filter("HCP_STATE", sap.ui.model.FilterOperator.EQ, oFiltertData.HCP_STATE)) :
				false;

			oFiltertData.HCP_MATERIAL ? oFilters.push(new sap.ui.model.Filter("HCP_MATERIAL", sap.ui.model.FilterOperator.EQ, oFiltertData.HCP_MATERIAL)) :
				false;

			oFiltertData.start_date ? oFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
				.BT,
				oFiltertData.start_date, oFiltertData.end_date)) : false;

			oTable.getBinding("items").filter(oFilters);

			var oModel = this.getOwnerComponent().getModel();
			var oReportModel = this.getView().getModel("reportIndexModel");

			oModel.read("/Negotiation_Report", {
				filters: oFilters,
				success: function (oDataProspect) {
					oReportModel.setProperty("/count", oDataProspect.results.length);
					this.closeBusyDialog();
				}.bind(this)
			});

			this._FragmentFilter.close();
		},
		sortButtonPressed: function (oEvent) {
			if (!this.SortDialog) {
				this.SortDialog = sap.ui.xmlfragment("com.sap.build.standard.brfAppDeGraosModoEditar.view.negotiationReport.fragments.SortDialog",
					this);

				this.getView().addDependent(this.SortDialog);
			}

			this.SortDialog.openBy(oEvent.getSource());
		},
		submitSortList: function () {
			var oSelectedColumn = sap.ui.getCore().byId("group_column").getSelectedButton().getId();
			var oSelectedSort = sap.ui.getCore().byId("group_sort").getSelectedButton().getId();

			var oSorter = [];

			oSorter.push(new sap.ui.model.Sorter({
				path: oSelectedColumn,
				descending: oSelectedSort === "descending" ? true : false,
				upperCase: false
			}));

			var oTable = this.getView().byId("table");

			oTable.getBinding("items").sort(oSorter);

			this.SortDialog.close();
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

		refreshStore: function (entity1) {
			return new Promise(function (resolve, reject) {
				if (typeof sap.hybrid !== 'undefined') {
					this.setBusyDialog("App Grãos", "Atualizando banco de dados");
					sap.hybrid.refreshStore(entity1).then(function () {
						resolve();
					}.bind(this));
				} else {
					resolve();
				}
			}.bind(this));
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

		refreshData: function (oEvent, sKey) {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var oModel = this.getOwnerComponent().getModel();

			// this._iconTableView(oEvent, sKey);
			this.setBusyDialog("App Grãos", "Aguarde");
			setTimeout(function () {
				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

					this.getView().getModel().refresh(true);
					var oFilterModel = this.getView().getModel("reportIndexModel");
					var oTable = this.getView().byId("table");
					var oFilters = [];

					oModel.read("/Negotiation_Report", {
						success: function (oDataProspect) {
							//	oFilterModel.setProperty("/data", oDataProspect.results);
							oFilterModel.setProperty("/count", oDataProspect.results.length);
							oTable.getBinding("items").filter(oFilters);
							if (oTable.getBinding("items")) {
								oTable.getBinding("items").refresh();
							}
							this.closeBusyDialog();
						}.bind(this)
					});

				} else {
					this.getView().getModel().refresh(true);

					this.closeBusyDialog();
				}

			}.bind(this), 1000);
		}

	});
}, /* bExport= */ true);