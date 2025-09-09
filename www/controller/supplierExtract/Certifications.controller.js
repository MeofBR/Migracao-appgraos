sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History"
], function (MainController, MessageBox, JSONModel, History) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.supplierExtract.Certifications", {

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("supplierExtract.Certifications").attachPatternMatched(this.handleRouteMatched, this);
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		handleRouteMatched: function (oEvent) {
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "certificationsModel");

			if (oEvent.getParameter("arguments")) {
				this.filters = JSON.parse(decodeURIComponent(decodeURIComponent(oEvent.getParameter("arguments").filters)));

				var typeData = this.filters.typeData;
				this.supplierID = this.filters.supplierID;
				this.start_date = this.filters.start_date;
				this.end_date = this.filters.end_date;
			}

			var oIndexModel = this.getView().getModel("certificationsModel");

			this.getData(typeData).then(function (result) {

				oIndexModel.setProperty("/data", result);

			}.bind(this)).catch(function (error) {
				console.log(error);
			}.bind(this));

		},

		filterButtonPressed: function (oEvent) {
			if (!this._FragmentFilter) {
				this._FragmentFilter = sap.ui.xmlfragment(
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.supplierExtract.fragments.FragmentFilter",
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

		_onCreateFormPress: function (oEvent) {

			this.oRouter.navTo("supplierExtract.New", {
				keyData: encodeURIComponent(JSON.stringify([]))
			}, false);

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

				this.doNavigate("supplierExtract.List", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		formatterDate: function (date) {

			if (date) {
				var oDay = date.getUTCDate();

				if (oDay < 10) {
					oDay = "0" + oDay;
				}

				var oMonth = date.getMonth() + 1;

				if (oMonth < 10) {
					oMonth = "0" + oMonth;
				}
				var oYear = date.getFullYear();

				date = oDay.toString() + "/" + oMonth.toString() + "/" + oYear.toString();
			}

			return date;
		},
		_onTilePress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			var rotes = ["crop.Index", "price.priceIntention.Index", "schedule.Index", "visitForm.Index", "offerMap.Index", "commodities.Index",
				"visitForm.Index"
			];
			var sPath = oEvent.getSource().oBindingContexts.supplierExtract.sPath;
			var lastChar = sPath.substr(sPath.length - 1);

			return new Promise(function (fnResolve) {

				if (oEvent.getSource().oBindingContexts.supplierExtract.sPath) {
					this.doNavigate(rotes[lastChar], oBindingContext, fnResolve, "");
				}

			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onCancel: function (oEvent) {

			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}

		},
		getICertificationsData: function (supplierLIFNR) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_PROVIDER_ID',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: supplierLIFNR
				}));

				aFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
					.BT,
					this.start_date, this.end_date));

				oModel.read("/Visit_Form_Certifications", {
					filters: aFilters,
					sorters: [new sap.ui.model.Sorter({
						path: "HCP_CREATED_AT",
						descending: true
					})],
					success: function (result) {
						var oCertifications = result.results;
						var result = [];

						var aCertifications = [...new Set(oCertifications.map(x => x.HCP_CERTIFICATION))];

						var map = new Map();
						for (var item of oCertifications) {
							if (!map.has(item.HCP_VISIT_ID)) {
								map.set((item.HCP_VISIT_ID), true);
								// set any value to Map
								result.push({
									HCP_CERTIFICATION: item.HCP_CERTIFICATION,
									HCP_PROVIDER_ID: item.HCP_PROVIDER_ID,
									HCP_UNIQUE_KEY: item.HCP_UNIQUE_KEY
								});
							}
						}

						resolve(result);

					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Certificações.");
						reject(err);
					}
				});
			}.bind(this));
		},
		getData: function (typeData) {

			return new Promise(function (resolve, reject) {

				switch (typeData) {
				case 'Certifications':
					this.getICertificationsData(this.supplierID).then(function (result) {
						resolve(result);
					}.bind(this)).catch(function (error) {
						reject(error);
					}.bind(this));
					break;
				case 'Intention':
					// code block
					break;
				default:
					// code block
				}
			}.bind(this));
		}
	});
}, /* bExport= */ true);