sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.crop.Consult", {
		formatter: formatter,
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("crop.Consult").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false,
				cropCount: ""
			}), "consultModel");
		},

		handleRouteMatched: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			if (bIsMobile) {
				this.getView().getModel("consultModel").setProperty("/isMobile", true);
			} else {
				this.getView().getModel("consultModel").setProperty("/isMobile", false);
			}
			this.refreshData();
		},

		refreshData: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var oCropModel = this.getView().getModel("consultModel");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				this.setBusyDialog("App Grãos", "Aguarde");
				this.flushStore("Crop_Tracking").then(function () {
					this.refreshStore("Crop_Tracking").then(function () {
						this.getCropData().then(data => {
							oCropModel.refresh();
							this.getView().getModel().refresh(true);
							this.getView().byId("pullToRefreshID").hide();
							this.closeBusyDialog();
						}).catch(error => {
							this.getView().byId("pullToRefreshID").hide();
							this.closeBusyDialog();
						});
					}.bind(this));
				}.bind(this));
			} else {
				this.getCropData().then(data => {
					oCropModel.refresh();
					this.getView().getModel().refresh(true);
					this.getView().byId("pullToRefreshID").hide();
					this.closeBusyDialog();
				}).catch(error => {
					this.getView().byId("pullToRefreshID").hide();
					this.closeBusyDialog();
				});
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

		getCropData: function () {
			var oModel = this.getView().getModel();
			var oConsultModel = this.getView().getModel("consultModel");

			return new Promise(function (resolve, reject) {
				oModel.read("/Crop_Tracking", {
					urlParameters: {
						"$expand": "Crop_Track_Partner,Crop_Track_Material,Crop_Track_Region,Crop_Track_Commercialization"
					},
					sorters: [new sap.ui.model.Sorter({
						path: "HCP_CROP_TRACK_ID",
						descending: true
					})],
					success: function (results) {
						if (results.results.length > 0) {
							var oCropData = results.results;
							 // Ordenar o sub-array "Crop_Track_Commercialization"
				            oCropData.forEach(function(track) {
				                if (track.Crop_Track_Commercialization.results.length > 0) {
				                    track.Crop_Track_Commercialization.results.sort(function(a, b) {
				                        return a.HCP_COMMERC_ID - b.HCP_COMMERC_ID;
				                    });
				                }
				            });
							oConsultModel.setProperty("/crop_tracks", oCropData);

							this.supplyMissingExpands(oCropData).then(function (results) {
								oConsultModel.refresh();
								resolve();
							}.bind(this));
						}
					}.bind(this),
					error: function (error) {
						console.log(error);
						reject();
					}
				});
			}.bind(this));
		},

		closeBusyDialog: function () {
			if (this.busyDialog) {
				this.busyDialog.close();
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

		refreshStore: function (entity1, entity2, entity3, entity4, entity5, entity6) {
			return new Promise(function (resolve, reject) {
				if (typeof sap.hybrid !== 'undefined') {
					// this.setBusyDialog("App Grãos", "Atualizando banco de dados");
					sap.hybrid.refreshStore(entity1, entity2, entity3, entity4, entity5, entity6).then(function () {
						resolve();
					}.bind(this));
				} else {
					resolve();
				}
			}.bind(this));
		},

		onCreateOrEditCrop: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("crop.Filter", true);
		},

		onConsult: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("crop.Consult", true);
		},

		sortButtonPressed: function (oEvent) {
			if (!this.SortDialog) {
				this.SortDialog = sap.ui.xmlfragment("sortFragmentCropTrackConsultID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.crop.fragments.SortDialog",
					this);

				this.getView().addDependent(this.SortDialog);
			}

			this.SortDialog.openBy(oEvent.getSource());
		},

		filterButtonPressed: function (oEvent) {
			if (!this._FragmentFilter) {
				this._FragmentFilter = sap.ui.xmlfragment("filterFragmentCropTrackConsultID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.crop.fragments.FragmentFilter",
					this);

				var oModelFilters = new sap.ui.model.json.JSONModel({
					HCP_CODE: "",
					NAME1: "",
					BLAND: "",
					HCP_CREATED_AT: ""
				});

				this.getView().setModel(oModelFilters, "filters");
				this.getView().addDependent(this._FragmentFilter);

			}

			this._FragmentFilter.openBy(oEvent.getSource());
		},

		_validateStates: function (oEvent) {
			var oInput = oEvent.getSource();
			var oRegionCB = sap.ui.core.Fragment.byId("filterFragmentCropTrackConsultID" + this.getView().getId(), "regionCBFilterID");
			var oRegionsItems = oRegionCB.getBinding("items");
			var oFilters = [];

			oFilters.push(new sap.ui.model.Filter("HCP_BLAND", sap.ui.model.FilterOperator.Contains, oInput.getSelectedKey()));

			oRegionsItems.filter(oFilters);
		},

		onUpdateFinished: function (oEvent) {
			var oTable = oEvent.getSource();
			var oConsultModel = this.getView().getModel("consultModel");
			var sCropCount = oTable.getBinding("items").getLength();
			var currTableKeys = oTable.getBinding("items").aKeys;

			oConsultModel.setProperty("/cropCount", sCropCount);

			// if (oEvent.getParameter("reason") === "Filter" || oEvent.getParameter("reason") === "Sort") {
			// 	this.supplyMissingExpands(currTableKeys).then(function (results) {
			// 		// if(results.length > 0){
			// 		this.getView().getModel().refresh();
			// 		// }
			// 	}.bind(this));
			// }
		},

		submitFilter: function (oEvent) {
			var oFilterModel = this._FragmentFilter.getModel("filters");
			var oData = oFilterModel.getData();
			var oTable = this.getView().byId("table");
			var oFilter = [];
			var oStartDate;
			var oEndtDate;

			oData.HCP_CODE && oData.HCP_CODE !== null && oData.HCP_CODE !== "" ? oFilter.push(new sap.ui.model.Filter("HCP_CROP_TRACK_ID", sap.ui
				.model.FilterOperator.EQ, oData.HCP_CODE)) : false;

			oData.HCP_CROP && oData.HCP_CROP !== null && oData.HCP_CROP !== "" ? oFilter.push(new sap.ui.model.Filter("HCP_CROP", sap.ui
				.model.FilterOperator.EQ, oData.HCP_CROP)) : false;

			oData.BLAND && oData.BLAND !== null && oData.BLAND !== "" ? oFilter.push(new sap.ui.model.Filter("HCP_STATE", sap.ui
				.model.FilterOperator.EQ, oData.BLAND)) : false;

			oData.HCP_REGIO && oData.HCP_REGIO !== null && oData.HCP_REGIO !== "" ? oFilter.push(new sap.ui.model.Filter("HCP_REGIO", sap.ui
				.model.FilterOperator.EQ, oData.HCP_REGIO)) : false;

			oData.HCP_MATERIAL && oData.HCP_MATERIAL !== null && oData.HCP_MATERIAL !== "" ? oFilter.push(new sap.ui.model.Filter(
				"HCP_MATERIAL", sap.ui
				.model.FilterOperator.Contains, oData.HCP_MATERIAL)) : false;

			oData.HCP_CREATED_BY && oData.HCP_CREATED_BY !== null && oData.HCP_CREATED_BY !== "" ? oFilter.push(new sap.ui.model.Filter(
				"HCP_CREATED_BY", sap.ui
				.model.FilterOperator.Contains, oData.HCP_CREATED_BY)) : false;

			if (oData.HCP_START_DATE && oData.HCP_END_DATE) {
				oStartDate = new Date(oData.HCP_START_DATE.setHours(-3));
				var oFilterStartDate = new Date(oStartDate.setDate(oStartDate.getDate() + 1));
				oEndtDate = new Date(oData.HCP_END_DATE.setHours(23, 40));
				var oFilterEndDate = new Date(oEndtDate.setDate(oEndtDate.getDate() + 1));

				oFilter.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator.BT, oFilterStartDate, oFilterEndDate));
			} else if (oData.HCP_START_DATE && !oData.HCP_END_DATE) {
				oStartDate = new Date(oData.HCP_START_DATE.setHours(-3));
				var oFilterStartDate = new Date(oStartDate.setDate(oStartDate.getDate() + 1));

				oFilter.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator.GE, oFilterStartDate));
			} else if (oData.HCP_END_DATE) {
				oEndtDate = new Date(oData.HCP_END_DATE.setHours(23, 40));
				var oFilterEndDate = new Date(oEndtDate.setDate(oEndtDate.getDate() + 1));

				oFilter.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator.LE, oFilterEndDate));
			}

			oTable.getBinding("items").filter(oFilter);
			this._FragmentFilter.close();
		},

		submitSortList: function () {
			var oSelectedColumn = sap.ui.core.Fragment.byId("sortFragmentCropTrackConsultID" + this.getView().getId(), "group_column").getSelectedButton()
				.getId().split("--")[2];
			var oSelectedSort = sap.ui.core.Fragment.byId("sortFragmentCropTrackConsultID" + this.getView().getId(), "group_sort").getSelectedButton()
				.getId().split("--")[2];
			var oTable = this.getView().byId("table");
			var oSorter = [];

			oSorter.push(new sap.ui.model.Sorter({
				path: oSelectedColumn,
				descending: oSelectedSort === "descending" ? true : false,
				upperCase: false
			}));
			oTable.getBinding("items").sort(oSorter);
			this.SortDialog.close();
		},

		onCropPress: function (oEvent) {
			var oSource = oEvent.getSource();
			var oModel = this.getView().getModel();
			var oConsultModel = this.getView().getModel("consultModel");
			var oBindingContextPath = oEvent.getParameter("listItem").getBindingContextPath();
			var oData = oConsultModel.getProperty(oBindingContextPath);
			var sPath = this.buildEntityPath("Crop_Tracking", oData);
			var oData = oModel.getProperty(sPath);
			
			// if (bIsMobile) {
			// 	oData["HCP_COMMERCIALIZATION"] = getObjCurrentCommercialization
			// }
			
			
			// if (oData.Crop_Track_Commercialization.__list.length > 0) {
			// 	let hasCommercialization = oData.Crop_Track_Commercialization.__list[oData.Crop_Track_Commercialization.__list.length - 1]
			// 	let getCurrentCommercialization = this.getView().getModel().oData[hasCommercialization]
			// 	oData["HCP_COMMERCIALIZATION"] = getCurrentCommercialization
			// }

			this.oRouter.navTo("crop.Edit", {
				keyData: encodeURIComponent(sPath),
				filterData: encodeURIComponent(JSON.stringify(oData)),
				operation: "consult"
			}, false);

			// this.checkForCropValidity(oData);
		},

		buildEntityPath: function (sEntityName, oEntity) {
			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity.HCP_CROP_TRACK_ID + "l)";
			}
		},

		checkForCropValidity: function (oCrop) {
			var sPath = this.buildEntityPath("Crop_Tracking", oCrop);
			var oCropCreationDate = oCrop.HCP_CREATED_AT;
			var oDateToCompare = new Date(oCropCreationDate);
			var oDateToCompareDay = oDateToCompare.getUTCDate();

			oDateToCompare.setUTCDate(oDateToCompareDay + 7);

			if (oDateToCompare < new Date()) {
				this.checkForCreateOrEdit(sPath);
				// this.goToCreate(sPath);
			} else {
				this.goToEdit(sPath);
			}
		},

		checkForCreateOrEdit: function (sPath) {
			var oModel = this.getView().getModel();
			var oData = oModel.getProperty(sPath);
			var aFilters = [];
			var sCurrWeek = this.getWeek();

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_CROP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_CROP
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_STATE',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_STATE
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_REGIO',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_REGIO
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_MATERIAL',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_MATERIAL
			}));

			oModel.read("/Crop_Tracking", {
				filters: aFilters,
				sorters: [new sap.ui.model.Sorter({
					path: "HCP_CREATED_AT",
					descending: true
				})],
				success: function (results) {
					if (results.results.length > 0) {
						var oFirstCropFound = results.results[0];

						if (oFirstCropFound.HCP_PERIOD === (sCurrWeek + new Date().getFullYear())) {
							this.goToEdit(this.buildEntityPath("Crop_Tracking", oFirstCropFound));
						} else {
							this.goToCreate(sPath);
						}
					}
				}.bind(this),
				error: function (error) {
					console.log(error);
				}
			});
		},

		goToEdit: function (sPath) {
			var oModel = this.getView().getModel();
			var oData = oModel.getProperty(sPath);

			this.oRouter.navTo("crop.Edit", {
				keyData: encodeURIComponent(sPath),
				filterData: encodeURIComponent(JSON.stringify(oData))
			}, false);
		},
		
		goToCreate: function (sPath) {
			var oFilterModel = this.getView().getModel("filterPageModel");
			var oModel = this.getView().getModel();
			var oFilterData = oModel.getProperty(sPath);
			var oData;
			var sOperation;
			var oMessageDialogTemplate;
			var regio = oFilterData.HCP_REGIO.split("-");
			var state = oFilterData.HCP_STATE.split("-");
			var ofilterData = [];

			if (sPath) {
				oData = sPath;
				sOperation = "Copy";
				ofilterData = oFilterData;
			} else if (!sPath && regio[1] === state[1]) {
				oData = oFilterData;
				sOperation = "NewGeral";
			} else {
				oData = oFilterData;
				sOperation = "New";
			}

			if (sOperation === "New") {
				sap.m.MessageBox.show(
					"Acompanhamento de Lavoura ainda não existe para esta chave. Deseja criar um novo registro?", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						onClose: function (oAction) {
							if (oAction === "YES") {
								this.oRouter.navTo("crop.Create", {
									keyData: encodeURIComponent(JSON.stringify(oData)),
									operation: sOperation
								}, false);
							}
						}.bind(this)
					}
				);
			} else {
				this.oRouter.navTo("crop.Create", {
					keyData: encodeURIComponent(JSON.stringify(oData)),
					operation: sOperation,
					filterData: encodeURIComponent(JSON.stringify(oFilterData))
				}, false);
			}
		},

		supplyMissingExpands: function (oData) {
			return new Promise(function (resolve, reject) {
				var aPromises = [];
				var oModel = this.getView().getModel();

				for (var key of oData) {
						aPromises.push(new Promise(function (resolve, reject) {
								var sEntity = key;
								oModel.read("/Crop_Year", {
									filters: [
										new sap.ui.model.Filter({
											path: "HCP_CROP_ID",
											operator: sap.ui.model.FilterOperator.EQ,
											value1: sEntity.HCP_CROP
										})
									],
									success: function (result) {
										var aCropData = result.results;

										if (aCropData) {
											// sEntity["Crop_Track_Crop_Year"]["__ref"] = aCropData[0];
											sEntity.Crop_Track_Crop_Year = aCropData[0];

											// oModel.setProperty("/" + sEntity + "/Crop_Track_Crop_Year/__ref", aCropData[0]);
											// sData.Crop_Track_Crop_Year["__ref"] = aCropData[0];
										}
										resolve();
									},
									error: function () {
										reject();
									}
								});
							}.bind(this)));
					// var sData = oModel.getProperty("/" + key);
					if (key["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {

						if (key.Crop_Track_Crop_Year === null) {
							aPromises.push(new Promise(function (resolve, reject) {
								var sEntity = key;
								oModel.read("/Crop_Year", {
									filters: [
										new sap.ui.model.Filter({
											path: "HCP_CROP_ID",
											operator: sap.ui.model.FilterOperator.EQ,
											value1: sEntity.HCP_CROP
										})
									],
									success: function (result) {
										var aCropData = result.results;

										if (aCropData) {
											// sEntity["Crop_Track_Crop_Year"]["__ref"] = aCropData[0];
											sEntity.Crop_Track_Crop_Year = aCropData[0];

											// oModel.setProperty("/" + sEntity + "/Crop_Track_Crop_Year/__ref", aCropData[0]);
											// sData.Crop_Track_Crop_Year["__ref"] = aCropData[0];
										}
										resolve();
									},
									error: function () {
										reject();
									}
								});
							}.bind(this)));
						}

						if (key.Crop_Track_Region === null) {
							aPromises.push(new Promise(function (resolve, reject) {
								var sEntity = key;
								oModel.read("/Regions", {
									filters: [
										new sap.ui.model.Filter({
											path: "HCP_ID",
											operator: sap.ui.model.FilterOperator.EQ,
											value1: key.HCP_REGIO
										})
									],
									success: function (result) {
										var aRegionData = result.results;

										if (aRegionData) {
											// sData.Crop_Track_Region["__ref"] = aRegionData[0];
											// sEntity["Crop_Track_Region"]["__ref"] = aRegionData[0];
											sEntity.Crop_Track_Region = aRegionData[0];

											// oModel.setProperty("/" + sEntity + "/Crop_Track_Region/__ref", aRegionData[0]);
										}
										resolve();
									},
									error: function () {
										reject();
									}
								});
							}.bind(this)));
						}

						if (key.Crop_Track_Material === null) {
							aPromises.push(new Promise(function (resolve, reject) {
								var sEntity = key;
								oModel.read("/View_Material", {
									filters: [
										new sap.ui.model.Filter({
											path: "MATNR",
											operator: sap.ui.model.FilterOperator.EQ,
											value1: key.HCP_MATERIAL
										})
									],
									success: function (result) {
										var aMaterialData = result.results;

										if (aMaterialData) {
											// sData.Crop_Track_Material["__ref"] = aMaterialData[0];
											// sEntity["Crop_Track_Material"]["__ref"] = aMaterialData[0];
											sEntity.Crop_Track_Material = aMaterialData[0];

											// oModel.setProperty("/" + sEntity + "/Crop_Track_Material/__ref", aMaterialData[0]);
										}
										resolve();
									},
									error: function () {
										reject();
									}
								});
							}.bind(this)));
						}
					}
				}

				Promise.all(aPromises).then(function (results) {
					resolve(results);
				}.bind(this));
			}.bind(this));
		}
	});
});