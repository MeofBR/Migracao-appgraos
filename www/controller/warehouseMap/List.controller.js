sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, JSONModel, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.warehouseMap.List", {
		formatter: formatter,
		handleRouteMatched: function (oEvent) {

			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));
			this.setBusyDialog("App Grãos", "Atualizando lista, por favor aguarde");
			var oModel = this.getOwnerComponent().getModel();
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				ItemsWareHouseMaps: [],
				filters: []
			}), "wareHouseIndexModel");
			this.getView().setModel(new sap.ui.model.json.JSONModel(), "filters");
			var oFilterModel = this.getView().getModel("wareHouseIndexModel");
			var oTable = this.getView().byId("table");
			var oFilters = [];

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			oModel.read("/Warehouse_Map", {
				success: function (oDataProspect) {
					if (oDataProspect.results.length > 0) {
						oFilterModel.setProperty("/", oDataProspect.results);
						this._getWareHouseMap().then(function () {
							this.closeBusyDialog();
						}.bind(this));
					} else {
						oFilterModel.setProperty("/", []);
						oFilterModel.setProperty("/count", 0);
						this.closeBusyDialog();
					}
				}.bind(this)
			});

		},

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("warehouseMap.List").attachPatternMatched(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
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

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("warehouseMap.Index", true);
		},

		_onRowPress: function (oEvent) {
			var sPath = oEvent.getSource().oBindingContexts.wareHouseIndexModel.sPath.split("/");
			var sIndex = sPath[2];
			var oData = oEvent.getSource().oBindingContexts.wareHouseIndexModel.oModel.oData.ItemsWareHouseMaps[sIndex];
			sPath = this.buildEntityPath("Warehouse_Map", oData);
			var data = [sPath, oData.NAME1];

			this.oRouter.navTo("warehouseMap.Edit", {
				keyData: encodeURIComponent(data)
			}, false);

		},
		_onCreateWareHouseMapPress: function (oEvent) {

			this.oRouter.navTo("warehouseMap.New", {
				keyData: encodeURIComponent(JSON.stringify([]))
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
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.warehouseMap.fragments.FragmentFilter",
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
			var oWareHouseModel = this.getView().getModel("wareHouseIndexModel");

			oModel.read("/Warehouse_Map", {
				filters: oFilters,
				success: function (oDataProspect) {
					var aResults = oDataProspect.results;
					var count = 0;
					for (var i = 0; i < aResults.length; i++) {
						if (aResults[i].HCP_REMOVED != 'X') {
							count++;
						}
					}
					oWareHouseModel.setProperty("/count", count);
					this.closeBusyDialog();
				}.bind(this)
			});

			this._FragmentFilter.close();
		},
		sortButtonPressed: function (oEvent) {
			if (!this.SortDialog) {
				this.SortDialog = sap.ui.xmlfragment("com.sap.build.standard.brfAppDeGraosModoEditar.view.warehouseMap.fragments.SortDialog",
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
			var oFilterModel = this.getView().getModel("wareHouseIndexModel");
			var oTable = this.getView().byId("table");
			var oFilters = [];

			// this._iconTableView(oEvent, sKey);
			this.setBusyDialog("App Grãos", "Aguarde");
			setTimeout(function () {

				oModel.read("/Warehouse_Map", {
					success: function (oDataProspect) {
						if (oDataProspect.results.length > 0) {
							oFilterModel.setProperty("/", oDataProspect.results);
							this._getWareHouseMap().then(function () {
								oTable.getBinding("items").filter(oFilters);
								if (oTable.getBinding("items")) {
									oTable.getBinding("items").refresh();
								}
								this.closeBusyDialog();
							}.bind(this));
						} else {
							oFilterModel.setProperty("/", []);
							oFilterModel.setProperty("/count", 0);
							oTable.getBinding("items").filter(oFilters);
							if (oTable.getBinding("items")) {
								oTable.getBinding("items").refresh();
							}
							this.closeBusyDialog();
						}
						this.getView().byId("pullToRefreshID").hide();
					}.bind(this)
				});

			}.bind(this), 1000);
		},
		_getWareHouseMap: function () {

			return new Promise(function (resolve, reject) {

				var oOwnerModel = this.getOwnerComponent().getModel();
				var oModel = this.getView().getModel("wareHouseIndexModel");
				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;
				var oData = oModel.oData;
				var aFilters = oData.filters;

				oModel.setProperty("/ItemsWareHouseMaps", []);

				oOwnerModel.read("/Warehouse_Map", {
					filters: aFilters,
					urlParameters: {
						"$expand": "Warehouse_Regions,Warehouse_Suppliers,Warehouse_Prospects"
					},
					success: function (result) {

						if (result.results.length > 0) {

							var oDataItem = oModel.getProperty("/ItemsWareHouseMaps");
							var aResults = result.results;
							var oArrayRegio = [];
							var oArrayPartner = [];
							var oArrayProspect = [];
							var aFiltersKey = [];
							var count = 0;

							for (var i = 0; i < aResults.length; i++) {
								if (aResults[i].HCP_REMOVED != 'X') {
									count++;
								}
							}

							oModel.setProperty("/count", count);

							for (var i = 0; i < aResults.length; i++) {

								if (aResults[i].HCP_REMOVED != 'X') {
									aFiltersKey.push(new sap.ui.model.Filter({
										path: "HCP_UNIQUE_KEY",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: aResults[i].HCP_UNIQUE_KEY
									}));

									var aData = {
										HCP_UNIQUE_KEY: aResults[i].HCP_UNIQUE_KEY,
										HCP_WAREHOUSE_ID: aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"] ? "Registro Offline" : aResults[i].HCP_WAREHOUSE_ID,
										NAME1: "",
										HCP_STATE: aResults[i].HCP_STATE,
										HCP_BEZEI: "",
										HCP_PARTNER: aResults[i].HCP_PARTNER,
										HCP_NAME_REGISTERED: aResults[i].HCP_NAME_REGISTERED,
										HCP_REGIO: aResults[i].HCP_REGIO,
										HCP_PARTNER_TYPE: aResults[i].HCP_PARTNER_TYPE,
										HCP_CREATED_AT: aResults[i].HCP_CREATED_AT,
										HCP_CREATED_BY: aResults[i].HCP_CREATED_BY
									};

									if (aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"]) {
										aData["@com.sap.vocabularies.Offline.v1.isLocal"] = true;
										aData["__metadata"] = aResults[i].__metadata;
									}

									if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

										if (aResults[i].Warehouse_Regions) {
											aData["HCP_BEZEI"] = aResults[i].Warehouse_Regions.HCP_BEZEI;
										} else {
											aData["HCP_BEZEI"] = "";
										}

										if (aResults[i].Warehouse_Suppliers) {
											aData["NAME1"] = aResults[i].Warehouse_Suppliers.NAME1;
										} else {
											if (aResults[i].Warehouse_Prospects) {
												aData["NAME1"] = aResults[i].Warehouse_Prospects.NAME1;
											}
										}

									} else {

										oArrayRegio.push(aData.HCP_REGIO);

										if (aData.HCP_PARTNER_TYPE == "1") { //Fornecedor
											oArrayPartner.push(aData.HCP_PARTNER);
										} else { //Prospect
											oArrayProspect.push(aData.HCP_PARTNER);
										}

									}

									oDataItem.push(aData);
								}

							}

							this.getExpandOffDynamic(oArrayRegio, oDataItem, "Regions", "HCP_REGIO", "HCP_LAND1", "HCP_BEZEI").then(function () {
								this.getExpandOffDynamic(oArrayPartner, oDataItem, "View_Grouping_Suppliers", "HCP_PARTNER", "HCP_REGISTER", "NAME1")
									.then(
										function () {
											this.getExpandOffDynamic(oArrayProspect, oDataItem, "Prospects", "HCP_PARTNER", "HCP_PROSP_ID", "NAME1").then(
												function () {

													oModel.setProperty("/ItemsWareHouseMaps", oDataItem);

													resolve();

												}.bind(this));
										}.bind(this));
							}.bind(this));

						} else {
							sap.m.MessageBox.show(
								this.resourceBundle.getText("erroDataNotFounded"), {
									title: this.resourceBundle.getText("messageWarning"),
									icon: sap.m.MessageBox.Icon.WARNING,
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (oAction) {
										if (oAction === "OK") {
											this.closeBusyDialog();
											this.backToIndex();
										}
										resolve();
									}.bind(this)
								}
							);
						}
					}.bind(this)
				});
			}.bind(this));
		},
		buildEntityPath: function (sEntityName, oEntity) {

			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity.HCP_WAREHOUSE_ID + "l)";
			}
		},
		_onRemoveWareHouse: function (oEvent) {

			var sPath = oEvent.getSource().oParent.oBindingContexts.wareHouseIndexModel.sPath.split("/");
			var sIndex = sPath[2];
			var oData = oEvent.getSource().oParent.oBindingContexts.wareHouseIndexModel.oModel.oData.ItemsWareHouseMaps[sIndex];
			sPath = this.buildEntityPath("Warehouse_Map", oData);
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var aDeferredGroups = oModel.getDeferredGroups();
			var oFilterModel = this.getView().getModel("wareHouseIndexModel");
			var oTable = this.getView().byId("table");
			var oFilters = [];

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}

			MessageBox.information(

				"Tem certeza que deseja remover esse registro?", {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					onClose: function (sAction) {
						if (sAction === "YES") {
							this.setBusyDialog("App Grãos", "Removendo registro, por favor aguarde");

							var aData = {
								HCP_REMOVED: 'X',
								HCP_UPDATED_AT: new Date()
							};

							oModel.update(sPath, aData, {
								groupId: "changes"
							});
							oModel.submitChanges({
								groupId: "changes",
								success: function () {
									MessageBox.success(
										this.resourceBundle.getText("Registro removido com sucesso!"), {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.setBusyDialog("App Grãos", "Atualizando lista, por favor aguarde");
												oModel.read("/Warehouse_Map", {
													success: function (oDataProspect) {
														if (oDataProspect.results.length > 0) {
															oFilterModel.setProperty("/", oDataProspect.results);
															this._getWareHouseMap().then(function () {
																this.closeBusyDialog();
															}.bind(this));
														} else {
															oFilterModel.setProperty("/", []);
															oFilterModel.setProperty("/count", 0);
															this.closeBusyDialog();
														}
													}.bind(this)
												});
											}.bind(this)
										}
									);
								}.bind(this),
								error: function () {
									MessageBox.success(
										this.resourceBundle.getText("errorOfferMap"), {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.closeBusyDialog();
											}.bind(this)
										}
									);
								}.bind(this)
							});

						}
					}.bind(this)
				}
			);

		}
	});
}, /* bExport= */ true);