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
			this.oRouter.getTarget("cropTur.Consult").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false,
				cropTurCount: "",
				isEnabledState: false
			}), "consultModel");
		},

		handleRouteMatched: function (oEvent) {
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
			
			this.decodeComponent = JSON.parse(decodeURIComponent(oEvent.getParameter("data").context))
			this.getCropTurData(this.decodeComponent)
			this.refreshData();
			this.getCountry()
		},
		
		getCountry: function () {
			let oModelLocal = this.getView().getModel("consultModel")
			let oModel = this.getView().getModel()
			
			oModel.read("/Country_Croptour", {
				success: function (result) {
					if (result.results.length > 0) {
						oModelLocal.setProperty("/itemsCountry", result.results);
					}
				}.bind(this)
			});
		},

		refreshData: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var oCropModel = this.getView().getModel("consultModel");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				this.setBusyDialog("App Grãos", "Aguarde");
				this.flushStore("CropTur_Collection, View_CropTur_Distinct, Country_Croptour, Regions_Croptour, Crop_Year_Croptour_Dist").then(function () {
					this.refreshStore("CropTur_Collection", "View_CropTur_Distinct", "Country_Croptour", "Regions_Croptour", "Crop_Year_Croptour_Dist", "Adms_Croptour").then(function () {
							this.getCropTurData(this.decodeComponent).then(data => {
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
				this.getCropTurData(this.decodeComponent).then(data => {
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

		getCropTurData: function (data) {
			if(data != undefined){
				var oModel = this.getView().getModel();
				var oConsultModel = this.getView().getModel("consultModel");
				let aFilters = []
	
				data.HCP_COUNTRY_ID && aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_COUNTRY',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: data.HCP_COUNTRY_ID.split('-')[0]
				}));
	
				data.HCP_CROP_ID && aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_CROP',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: data.HCP_CROP_ID.split('-')[0]
				}));
	
				data.HCP_STATE && aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_STATE',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: data.HCP_STATE.split('-')[0]
				}));
	
				data.HCP_REGIO && aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_REGIO',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: data.HCP_REGIO.split('-')[0]
				}));
	
				data.HCP_MATERIAL && aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_MATERIAL',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: data.HCP_MATERIAL
				}));
				
				data.HCP_CREATED_BY && aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_CREATED_BY',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: data.HCP_CREATED_BY
				}));
	
				return new Promise(function (resolve, reject) {
					oModel.read("/View_CropTur_Distinct", {
						filters: aFilters,
						length: '999999',
						sorters: [new sap.ui.model.Sorter({
							path: "HCP_COLLECT",
							descending: true
						})],
						urlParameters: {
							"$expand": "View_Country_Unique,View_Regio_Unique"
						},
						success: function (results) {
							if (results.results.length > 0) {
								var oCropTurData = results.results;
								oCropTurData.map(obj => {
									obj.HCP_QUANTITY = Math.floor(obj.HCP_QUANTITY * 100) / 100
									obj.HCP_GRAIN_TOTAL = Math.floor(obj.HCP_GRAIN_TOTAL * 100) / 100
									obj.HCP_PRODUCTIVITY = Math.floor(obj.HCP_PRODUCTIVITY * 100) / 100
									obj.HCP_ROW_COUNT = Math.floor(obj.HCP_ROW_COUNT * 100) / 100
									obj.HCP_GRAIN_COUNT_PER_ROW = Math.floor(obj.HCP_GRAIN_COUNT_PER_ROW * 100) / 100
									obj.HCP_PRODUCTIVITY_MEDIA = Math.floor(obj.HCP_PRODUCTIVITY_MEDIA * 100) / 100
									
									obj.HCP_COUNTRY_NAME = obj.View_Country_Unique.HCP_COUNTRY_NAME
									obj.HCP_REGIO_NAME = obj.View_Regio_Unique.HCP_BEZEI
								})
								oConsultModel.setProperty("/crop_tur", oCropTurData);
								oConsultModel.refresh();
								this.closeBusyDialog();
								resolve();
							} else {
								oConsultModel.setProperty("/crop_tur", results.results);
								oConsultModel.refresh();
							}
						}.bind(this),
						error: function (error) {
							console.log(error);
								this.closeBusyDialog();
							reject(error);
						}.bind(this)
					});
				}.bind(this));
			}else{
				this.closeBusyDialog();
			}
		},
		
		getCropTur: async function (data) {
			var oModel = this.getView().getModel();
			var aFilters = [];
			
			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_COUNTRY',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: data.HCP_COUNTRY
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_CROP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: data.HCP_CROP
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_STATE',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: data.HCP_STATE
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_REGIO',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: data.HCP_REGIO
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_MATERIAL',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: data.HCP_MATERIAL
			}));
			
			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_COLLECT',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: data.HCP_COLLECT
			}));

			return new Promise(function (resolve, reject) {
				oModel.read("/CropTur_Collection", {
					filters: aFilters,
					urlParameters: {
						"$expand": "Crop_Tur_Material,Crop_Tur_Region,Crop_Tur_Year,Crop_Tur_Country"
					},
					sorters: [new sap.ui.model.Sorter({
						path: "HCP_SAMPLE_TYPE",
						descending: false
					})],
					success: function (results) {
						if (results.results.length > 0) {
							var oCropTurData = results.results
							resolve(oCropTurData);
						}
					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});
			}.bind(this));
		},
		
		onCropTurPress: async function (oEvent) {
			var oSource = oEvent.getSource();
			var oModel = this.getView().getModel();
			var oConsultModel = this.getView().getModel("consultModel");
			var oBindingContextPath = oEvent.getParameter("listItem").getBindingContextPath();
			var oData = oConsultModel.getProperty(oBindingContextPath);
			
			sap.m.MessageBox.information("Deseja editar coleta selecionada?", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					actions: [sap.m.MessageBox.Action.YES,sap.m.MessageBox.Action.NO],
					onClose: async function (oAction) {
						if (oAction === "YES") {
						let data = await this.getCropTur(oData)
							
						this.oRouter.navTo("cropTur.Edit", {
							contextData: encodeURIComponent(JSON.stringify(data))
						}, false);
						}
					}.bind(this)
				}
			);
		},

		buildEntityPath: function (sEntityName, oEntity) {
			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity.HCP_ID + "l)";
			}
		},

		closeBusyDialog: function () {
			if (this.busyDialog) {
				this.busyDialog.close();
			}
		},

		backToIndex: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			let oModelFilter = this.getView().getModel("filters")

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}
			if (oModelFilter) {
				oModelFilter.setData({})
				oModelFilter.refresh()
				var oTable = this.getView().byId("table");
				oTable.getBinding("items").filter([]);
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

		sortButtonPressed: function (oEvent) {
			if (!this.SortDialog) {
				this.SortDialog = sap.ui.xmlfragment("sortFragmentCropTurConsultID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.cropTur.fragments.SortDialog",
					this);

				this.getView().addDependent(this.SortDialog);
			}

			this.SortDialog.openBy(oEvent.getSource());
		},

		filterButtonPressed: function (oEvent) {
			if (!this._FragmentFilter) {
				this._FragmentFilter = sap.ui.xmlfragment("filterFragmentCropTurConsultID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.cropTur.fragments.FragmentFilter",
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
			var oRegionCB = sap.ui.core.Fragment.byId("filterFragmentCropTurConsultID" + this.getView().getId(), "regionCBFilterID");
			var oRegionsItems = oRegionCB.getBinding("items");
			var oFilters = [];

			oFilters.push(new sap.ui.model.Filter("HCP_BLAND", sap.ui.model.FilterOperator.Contains, oInput.getSelectedKey()));

			oRegionsItems.filter(oFilters);
		},
		
		_filteredStates: function (oEvent) {
		    let oFilter = []
		    let oModel = this.getView().getModel("consultModel")
			let sSelectedCountry = oEvent.getSource().getSelectedKey();
			let objCountry = oModel.getData().itemsCountry.filter(obj => obj.HCP_COUNTRY_NAME === sSelectedCountry)[0]
		    
		    if (objCountry) {
			    oFilter.push(new sap.ui.model.Filter("LAND1", sap.ui.model.FilterOperator.EQ, objCountry.HCP_LAND1));
			
				var oStateFrag = sap.ui.core.Fragment.byId("filterFragmentCropTurConsultID" + this.getView().getId(), "idComboBoxEstado");
				var oStatesItems = oStateFrag.getBinding("items");
			    oStatesItems.filter(oFilter);
		    	
		    	oModel.setProperty("/isEnabledState", true)
		    } else {
		    	oModel.setProperty("/isEnabledState", false)
		    }
		},

		onUpdateFinished: function (oEvent) {
			var oTable = oEvent.getSource();
			var oConsultModel = this.getView().getModel("consultModel");
			var sCropCount = oTable.getBinding("items").getLength();
			var currTableKeys = oTable.getBinding("items").aKeys;

			oConsultModel.setProperty("/cropTurCount", sCropCount);
		},

		submitFilter: function (oEvent) {
			var oFilterModel = this._FragmentFilter.getModel("filters");
			var oData = oFilterModel.getData();
			var oTable = this.getView().byId("table");
			var oFilter = [];
			var oStartDate;
			var oEndtDate;

			oData.HCP_COLLECT && oData.HCP_COLLECT !== null && oData.HCP_COLLECT !== "" ? oFilter.push(new sap.ui.model.Filter("HCP_COLLECT", sap.ui
				.model.FilterOperator.EQ, oData.HCP_COLLECT)) : false;
				
			oData.HCP_COUNTRY_NAME && oData.HCP_COUNTRY_NAME !== null && oData.HCP_COUNTRY_NAME !== "" ? oFilter.push(new sap.ui.model.Filter("HCP_COUNTRY_NAME", sap.ui
				.model.FilterOperator.EQ, oData.HCP_COUNTRY_NAME)) : false;

			oData.HCP_CROP_DESC && oData.HCP_CROP_DESC !== null && oData.HCP_CROP_DESC !== "" ? oFilter.push(new sap.ui.model.Filter("HCP_CROP_DESC", sap.ui
				.model.FilterOperator.EQ, oData.HCP_CROP_DESC)) : false;

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
			var oSelectedColumn = sap.ui.core.Fragment.byId("sortFragmentCropTurConsultID" + this.getView().getId(), "group_column").getSelectedButton()
				.getId().split("--")[2];
			var oSelectedSort = sap.ui.core.Fragment.byId("sortFragmentCropTurConsultID" + this.getView().getId(), "group_sort").getSelectedButton()
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
		}
	});
});