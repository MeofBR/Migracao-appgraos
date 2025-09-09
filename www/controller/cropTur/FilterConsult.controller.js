/* global cordova */
sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.cropTur.FilterConsult", {
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("cropTur.FilterConsult").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false,
				regionEnabled: false,
				itemsCountry: [],
				itemsCropYear: [],
				enableCrop: false,
				enableState: false
			}), "filterPageModel");
		},

		handleRouteMatched: function () {
			this.getDataCountryAndStates()
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			var oModel = this.getView().getModel();
			this.getCropYear();
			oModel.refresh();
			this.refreshData();
		},
		
		getDataCountryAndStates: function () {
			let oModelLocal = this.getView().getModel("filterPageModel")
			let oModel = this.getView().getModel()
			
			oModel.read("/Country_Croptour", {
				sorter: [new sap.ui.model.Sorter({ path: 'HCP_LAND1', descending: false })],
				success: function (result) {
					if (result.results.length > 0) {
						oModelLocal.setProperty("/itemsCountry", result.results);
					}
				}.bind(this)
			});
		},
		
		getCropYear: async function () {
			let oModel = this.getView().getModel()
			let oModelCropYear = this.getView().getModel("filterPageModel")
            let oFilters = [];
            let currentDate = new Date()
				
        	oFilters.push(new sap.ui.model.Filter("HCP_ACTIVE", sap.ui.model.FilterOperator.EQ, "1"));
				
			const listCropYears = await new Promise((resolve, reject) => {
				oModel.read("/Crop_Year_Croptour", {
					filters: oFilters,
					sorters: [new sap.ui.model.Sorter("HCP_RANGE_START", false)],
					success: function (results) {
						return resolve(results.results)
					}.bind(this),
					error: function (error) {
						return reject(MessageBox.error("Erro ao Buscar Ano da Safra!"));
					}
				})
			})
			
			if (listCropYears)
				oModelCropYear.setProperty("/itemsCropYear", listCropYears)
		},

		refreshData: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			let oData = this.getView().getModel("filterPageModel").oData

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			
			if (oData.HCP_COUNTRY_ID)
				oData.HCP_COUNTRY_ID = ""
			if (oData.HCP_CREATED_BY)	
				oData.HCP_CREATED_BY = ""
			if (oData.HCP_CROP_ID)
				oData.HCP_CROP_ID = ""
			if (oData.HCP_MATERIAL)
				oData.HCP_MATERIAL = ""
			if (oData.HCP_MATERIAL_COD_NAME)
				oData.HCP_MATERIAL_COD_NAME = ""
			if (oData.HCP_REGIO)
				oData.HCP_REGIO = ""
			if (oData.HCP_STATE)
				oData.HCP_STATE = ""
			
			this.getView().getModel("filterPageModel").refresh()

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd/MM/yyyy HH:mm"
				});
				this.setBusyDialog("App Grãos", "Aguarde");
				this.flushStore(
					"Crop_Track_Partner,Crop_Track_Material,Crop_Track_Region,Crop_Track_Crop_Year,Crop_Track_Commercialization,Commercialization,Regions,Negotiation_Report"
				).then(function () {
					this.refreshStore("Crop_Tracking", "Commercialization", "Regions", "Regions_Croptour", "Negotiation_Report", "View_CropTur_Distinct").then(function () {
						this.flushStore(
							"Crop_Track_Partner,Crop_Track_Material,Crop_Track_Region,Crop_Track_Crop_Year,Crop_Track_Commercialization,Commercialization,Regions,Negotiation_Report"
						).then(function () {
							this.refreshStore("Crop_Tracking", "Commercialization", "Regions", "Regions_Croptour", "Negotiation_Report", "View_CropTur_Distinct").then(function () {
								this.getView().getModel().refresh(true);
								localStorage.setItem("lastUpdateCrop", new Date());
								this.getView().getModel().refresh(true);
								localStorage.setItem("countStorageCrop", 0);
								this.closeBusyDialog();
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			} else {
				this.getView().getModel().refresh(true);
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

		navBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
		    var oFilterPageModel = this.getView().getModel("filterPageModel");
		    if (oFilterPageModel) {
		        oFilterPageModel.setData({}); // Redefine os dados do modelo
		    }

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}
		},
		
		getCropTourView: function (data) {
			let oModel = this.getView().getModel()
			let oData = this.getView().getModel("filterPageModel").oData
			let aFilters = []
			
			let getCountry = oData.itemsCountry.filter(obj => obj.HCP_LAND1 === oData.HCP_LAND1)[0]
			
			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_COUNTRY',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: getCountry.HCP_ID
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_CROP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: data.HCP_CROP_ID.split('-')[0]
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_STATE',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: data.HCP_BLAND
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_REGIO',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: data.HCP_REGIO.split('-')[0]
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_MATERIAL',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: data.HCP_MATERIAL
			}));
			
			
			return new Promise(function (resolve, reject) {
				oModel.read("/View_CropTur_Distinct", {
						length: '999999',
						filters: aFilters,
						sorters: [new sap.ui.model.Sorter({
							path: "HCP_CREATED_AT",
							descending: true
						})],
						success: function (results) {
							if (results.results.length > 0) {
								var oCropTurData = results.results;
								if (oCropTurData[2]) {
									resolve(oCropTurData[2]);
								} else {
									resolve()
								}
							} else {
								resolve()
							}
						}.bind(this),
						error: function (error) {
							reject(error);
						}
					});
			}.bind(this));
		},

		_onConfirm: async function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var oModelFilters = this.getView().getModel("filterPageModel");
			
			let materialSelected = this.getView().byId("InputMaterialId").getSelectedKey()
			if (materialSelected) {
				oModelFilters.setProperty("/HCP_MATERIAL", materialSelected)
				if  (materialSelected == '000000000000013307') {
					oModelFilters.setProperty("/HCP_MATERIAL_COD_NAME", 'Milho Granel')
				} else {
					oModelFilters.setProperty("/HCP_MATERIAL_COD_NAME", 'Soja Granel')
				}
			}

			var oData = oModelFilters.getProperty("/");
			
			let getCountry =  oData.itemsCountry && oData.itemsCountry.filter(obj => obj.HCP_LAND1 === oData.HCP_LAND1)[0]
			let getState = oData.itemStates && oData.itemStates.filter(obj => obj.BLAND === oData.HCP_BLAND)[0]
			
			getCountry && oModelFilters.setProperty("/HCP_COUNTRY_ID", `${getCountry.HCP_ID}-${getCountry.HCP_COUNTRY_NAME}`)
			getState && oModelFilters.setProperty("/HCP_STATE", `${getState.BLAND}-${getState.BEZEI}`)
			
			if (oData) {
				this.oRouter.navTo("cropTur.Consult", {
					context: encodeURIComponent(JSON.stringify(oData))
				}, false);
			}
		},
		
		getStates: function (actionName) {
			let oModel = this.getView().getModel()
			let oFilterModel = this.getView().getModel('filterPageModel')
			let oData = oFilterModel.oData
			
			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'LAND1',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_LAND1
			}));
			
			if (oData.HCP_LAND1) {
				oModel.read("/View_States", {
					filters: aFilters,
					sorter: [new sap.ui.model.Sorter({ path: 'BEZEI', descending: false })],
					success: function (result) {
						if (result.results.length > 0) {
							oFilterModel.setProperty("/itemStates", result.results);
						}
						this.closeBusyDialog();
					}.bind(this)
				});
			}
		},

		_validateForm: async function (oEvent) {
			let oFilterModel = this.getView().getModel("filterPageModel");
			let oData = oFilterModel.oData
			var oCropYear = this.byId("cropYear");
			
			if (oEvent && oEvent.getSource().getName() == 'CountryName') {
				await this.getStates(oEvent.getSource().getName())
				
				if (oData.HCP_LAND1) {
					oFilterModel.setProperty("/enableState", true)
					oFilterModel.setProperty("/enableCrop", true)
					
					let items = oData.itemsCropYear.filter(obj => obj.HCP_LAND1 === oData.HCP_LAND1)
					oFilterModel.setProperty("/itemsCropYearFiltered", items)
				} else {
					oFilterModel.setProperty("/enableState", false)
					oFilterModel.setProperty("/enableCrop", false)
				}
				delete oData.HCP_REGIO
				delete oData.HCP_BLAND
				oFilterModel.setProperty("/regionEnabled", false)
				oFilterModel.refresh()
			}

			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required) {
						var sValue = oControl.getValue();
						if (!sValue || oControl.getValueState() !== 'None') {
							oFilterModel.setProperty("/enableCreate", false);
							return;
						}
					}
				}
				oFilterModel.setProperty("/enableCreate", true);
			}.bind(this), 100);
		},

		_getFormFields: function () {
			var oMainDataForm = this.byId("cropTurKeysForm").getContent();
			var aControls = [];
			var sControlType;

			for (var i = 0; i < oMainDataForm.length; i++) {
				sControlType = oMainDataForm[i].getMetadata().getName();
				if (sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" || sControlType === "sap.m.Input" ||
					sControlType === "sap.m.DateTimeInput" || sControlType === "sap.m.DatePicker" ||
					sControlType === "sap.m.CheckBox" || sControlType === "sap.m.MaskInput" || sControlType === "sap.m.ComboBox") {
					if (oMainDataForm[i].getVisible()) {
						aControls.push({
							control: oMainDataForm[i],
							required: oMainDataForm[i - 1].getRequired && oMainDataForm[i - 1].getRequired(),
							text: oMainDataForm[i - 1].getText
						});
					}
				}
			}
			return aControls;
		},

		_validateStates: function (oEvent) {
			var oTable = this.getView().byId("regions");
			var oRegions = oTable.getBinding("items");

			var oFilterModel = this.getView().getModel("filterPageModel");
			var oData = oFilterModel.getData();

			var oFilters = [];

			if (oData.HCP_BLAND) {
				oFilters.push(new sap.ui.model.Filter("HCP_BLAND", sap.ui.model.FilterOperator.Contains, oData.HCP_BLAND));
				oRegions.filter(oFilters);

				oFilterModel.setProperty("/regionEnabled", true)
			} else {
				oFilterModel.setProperty("/regionEnabled", false)
			}
		},

		_buildEntityPath: function (sEntityName, oEntity) {
			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity.HCP_CROP_TRACK_ID + "l)";
			}
		}

	});
});