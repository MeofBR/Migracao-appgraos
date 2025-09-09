sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.crop.Filter", {
		formatter: formatter,
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("crop.Filter").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.getView().setModel(this.getOwnerComponent().getModel());
				this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableCreate: false,
				regionEnabled: false,
				enableCreateRegioValid: true,
				enableCropYear: false,
				itemsCropYear: []
			}), "filterPageModel");
			// this.getView().setModel(new sap.ui.model.json.JSONModel({
			// 	enableCreate: true,
			// 	regionEnabled: false,
			// 	enableCreateRegioValid: true,
			// 	enableCropYear: false,
			// 	itemsCropYear: [],
			// 	HCP_CROP_ID: 47,
			// 	HCP_STATE: "MG-Minas Gerais",
			// 	HCP_REGIO: "11-Sul (Lavras)",
			// 	HCP_MATERIAL: "000000000000005287"
			// }), "filterPageModel");

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				create: true,
				edit: true
			}), "profileModel");
		},

		handleRouteMatched: function () {
			this.getUser().then(function (userName) {
				this.userName = userName;

				this.getUserProfile("View_Profile_Crop", this.userName).then(profileData => {
					this.getView().getModel("profileModel").setData(profileData);
					console.log(this.getView().getModel("profileModel").getData());
					//this.closeBusyDialog();
				}).catch(error => {
					console.log(error);
					//this.closeBusyDialog();
				});

			}.bind(this));
			this.getCropYear();

			var oModel = this.getView().getModel();
			oModel.refresh();
			this.refreshData();
		},
		
		refreshData: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;


            var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

            if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
            	var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern: "dd/MM/yyyy HH:mm"
                });
        	 this.setBusyDialog("App Grãos", "Aguarde");
                this.flushStore("Crop_Track_Partner,Crop_Track_Material,Crop_Track_Region,Crop_Track_Crop_Year,Crop_Track_Commercialization,Commercialization,Regions,Negotiation_Report").then(function () {
                    this.refreshStore("Crop_Tracking", "Commercialization","Regions","Negotiation_Report").then(function () {
						this.flushStore("Crop_Track_Partner,Crop_Track_Material,Crop_Track_Region,Crop_Track_Crop_Year,Crop_Track_Commercialization,Commercialization,Regions,Negotiation_Report").then(function () {
		                    this.refreshStore("Crop_Tracking", "Commercialization","Regions","Negotiation_Report").then(function () {
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
		
		getCropYear: async function () {
			let oModel = this.getView().getModel()
			let oModelCropYear = this.getView().getModel("filterPageModel")
            let oFilters = [];
            let currentDate = new Date()
            
        //	oFilters.push(new sap.ui.model.Filter("HCP_RANGE_END", sap.ui.model.FilterOperator.GT, currentDate));
				
        	oFilters.push(new sap.ui.model.Filter("HCP_ACTIVE", sap.ui.model.FilterOperator.EQ, "1"));
				
			const listCropYears = await new Promise((resolve, reject) => {
				oModel.read("/Crop_Year", {
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
		
		_onConfirm: async function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			
			var oModelFilters = this.getView().getModel("filterPageModel");
			var oData = oModelFilters.getProperty("/");
			var regio = oData.HCP_REGIO.split("-");
			var state = oData.HCP_STATE.split("-");
			
			let cropForData = await this.searchCropForData();
			let oldSafra = await this.testeOldSafra();
			
			if(regio[1] == state[1] && bIsMobile == false){
				
				let setKeyData = {
					HCP_CROP_ID:			oData.HCP_CROP_ID,
					HCP_MATERIAL:			oData.HCP_MATERIAL,
					HCP_MATERIAL_COD_NAME:	oData.HCP_MATERIAL_COD_NAME,
					HCP_REGIO:				oData.HCP_REGIO,
					HCP_STATE:				oData.HCP_STATE,
					HCP_REGIO_NUMBER:   	regio[0],
					HCP_STATE_ACRONYM:		state[0]
				};
				
				this.MultiCommercialization(setKeyData);

			}
			else{
				if(oldSafra){
					let sPath;
					let isCentralRegion;
						if(regio[1] == state[1]){
							isCentralRegion = true;
						}else{
							isCentralRegion = false;
						}
					
					if(cropForData[0]){
						this.onEditCrop(this.buildEntityPath("Crop_Tracking", cropForData[0]), isCentralRegion)
					}else{
						
						let oProperty = {
							HCP_CROP_ID:			oData.HCP_CROP_ID,
							HCP_MATERIAL:			oData.HCP_MATERIAL,
							HCP_MATERIAL_COD_NAME:	oData.HCP_MATERIAL_COD_NAME,
							HCP_REGIO:				oData.HCP_REGIO,
							HCP_STATE:				oData.HCP_STATE,
							isCentralRegion:        isCentralRegion
						}
						
						this.oRouter.navTo("crop.Edit", {
							notCrop: encodeURIComponent(JSON.stringify(oProperty)),
						}, false);
					}
					
					
				}else{
					this.CreateEditSingleCommercialization(cropForData);
				}
			}
				
				
		},
		
		CreateEditSingleCommercialization: function(oCrops){
			var oModelFilters = this.getView().getModel("filterPageModel");
			var oData = oModelFilters.getProperty("/");
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var regio = oData.HCP_REGIO.split("-");
			var state = oData.HCP_STATE.split("-");
			
			if (oCrops.length > 0) {
				this.checkForCropValidity(oCrops[0]);
			} else {
				if(regio[1] == state[1] && bIsMobile == true) {
					sap.m.MessageBox.information(
						"Registro do consolidado do estado não encontrado!", {
							icon: sap.m.MessageBox.Icon.INFORMATION,
							actions: [sap.m.MessageBox.Action.OK]
						}
					);
				} else {
					this.goToCreate();
				}
			}
		},
		
		testeOldSafra: function(){
			var oCropYear = this.byId("cropYear"); 
					
			if (oCropYear._getSelectedItemText()) {
				var cropYear = oCropYear._getSelectedItemText().split("/")[1];
				var currentYear = (new Date().getYear()).toString();

				if (cropYear < currentYear.slice(-2)) {
					return true;
				} else {
					return false;
				}
			}
		},
		
		MultiCommercialization: function (KeyData) {
			this.oRouter.navTo("crop.MultiCommercialization", {
				keyData: encodeURIComponent(JSON.stringify(KeyData)),
			}, false);
		},

		searchCropForData: async function () {
			var oModel = this.getView().getModel();
			var oModelFilters = this.getView().getModel("filterPageModel");
			var oData = oModelFilters.getProperty("/");
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var regio = oData.HCP_REGIO.split("-");
			var state = oData.HCP_STATE.split("-");
			var aFilters = [];
			let oFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_CROP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_CROP_ID
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_STATE',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: state[0]
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_REGIO',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: regio[0]
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_MATERIAL',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_MATERIAL
			}));
			
			return await new Promise((resolve, reject) => {
				oModel.read("/Crop_Tracking", {
					urlParameters: {
						"$expand": "Crop_Track_Partner,Crop_Track_Commercialization"
					},
					filters: aFilters,
					sorters: [new sap.ui.model.Sorter({
						path: "HCP_CREATED_AT",
						descending: true
					})],
					success: function (result) {
						return resolve(result.results)
					}.bind(this),
					error: function () {
						return reject(sap.m.MessageToast.show("Falha ao Buscar Acompanhamentos."));
					}
				});
			})
		},
		
		_getCommercialization: function () {
			var oModel = this.getView().getModel();
			var oModelFilters = this.getView().getModel("filterPageModel");
			var oData = oModelFilters.getProperty("/");
			var regio = oData.HCP_REGIO.split("-");
			var state = oData.HCP_STATE.split("-");
			var aFilters = [];
			
			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_CROP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_CROP_ID
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_STATE',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: state[0]
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_REGIO',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: regio[0]
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_MATERIAL',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_MATERIAL
			}));
			
			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_PERIOD',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.getWeek() + new Date().getFullYear()
			}));
			
			oModel.read("/Commercialization", {
				filters: aFilters,
				sorters: [new sap.ui.model.Sorter({
					path: "HCP_CREATED_AT",
					descending: true
				})],
				success: function (results) {
					this.getView().getModel("filterPageModel").setProperty("/HCP_COMMERCIALIZATION", results.results[0])
				}.bind(this),
				error: function () {
					sap.m.MessageToast.show("Falha ao Buscar Comercialização.");
				}
			})
		},

		checkForCropValidity: function (oCrop) {
			// var sPath = "/Crop_Tracking(" + oCrop.HCP_CROP_TRACK_ID + "l)";
			var sPath = this.buildEntityPath("Crop_Tracking", oCrop);
			var oCropCreationDate = oCrop.HCP_CREATED_AT;
			var oDateToCompare = new Date(oCropCreationDate);
			var oDateToCompareDay = oDateToCompare.getUTCDate();
			var sCurrWeek = parseInt(this.getWeek());
			var sCurrYear = new Date().getFullYear();
			var sCropWeek = parseInt(oCrop.HCP_PERIOD.slice(0, 2));
			var sCropYear = parseInt(oCrop.HCP_PERIOD.slice(2, 6));

			var bHasToCreateNew = (sCropWeek < sCurrWeek || sCropYear < sCurrYear) || (sCropYear == sCurrYear && sCropWeek == '53') ? true :
				false;

			// oDateToCompare.setUTCDate(oDateToCompareDay + 7);

			if (bHasToCreateNew) {
				this.goToCreate(sPath);
			} else {
				this.onEditCrop(sPath);
			}
		},

		onEditCrop: function (sPath, isCentralRegion) {
			this.goToEdit(sPath, isCentralRegion);
			// sap.m.MessageBox.show(
			// 	"Acompanhamento de Lavoura já existe. Deseja Editar?", {
			// 		icon: sap.m.MessageBox.Icon.INFORMATION,
			// 		actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
			// 		onClose: function (oAction) {
			// 			if (oAction === "YES") {
			// 				this.goToEdit(sPath);
			// 			} else {
			// 				this._oEditCropDialog.close();
			// 			}
			// 		}.bind(this)
			// 	}
			// );
		},

		goToCreate: function (sPath) {
			var oFilterModel = this.getView().getModel("filterPageModel");
			var oFilterData = oFilterModel.oData;
			var oModel = this.getView().getModel();
			var oData;
			var sOperation;
			var oMessageDialogTemplate;
			var regio = oFilterData.HCP_REGIO.split("-");
			var state = oFilterData.HCP_STATE.split("-");
			var ofilterData = [];

			if (sPath) {
				oData = sPath;
				sOperation = "Copy";
				ofilterData = oFilterModel.getData();
			} else if (!sPath && regio[1] === state[1]) {
				oData = oFilterModel.getData();
				sOperation = "NewGeral";
			} else {
				oData = oFilterModel.getData();
				sOperation = "New";
			}

			if (sOperation === "New") {
				this._getCommercialization()

				sap.m.MessageBox.information(
					"Acompanhamento de Lavoura ainda não existe para esta chave. Deseja criar um novo registro?", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						onClose: function (oAction) {
							if (oAction === "YES") {
								this.oRouter.navTo("crop.Create", {
									keyData: encodeURIComponent(JSON.stringify(oData)),
									filterData: encodeURIComponent(JSON.stringify(ofilterData)),
									operation: sOperation
								}, false);
							}
						}.bind(this)
					}
				);

			} else if (sOperation === "NewGeral") {
				sap.m.MessageBox.information(
					"Deseja criar um novo registro para a região estadual?", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						onClose: function (oAction) {
							if (oAction === "YES") {
								this.oRouter.navTo("crop.Create", {
									keyData: encodeURIComponent(JSON.stringify(oData)),
									filterData: encodeURIComponent(JSON.stringify(ofilterData)),
									operation: sOperation
								}, false);
							}
						}.bind(this)
					}
				);
			} else {
				this.oRouter.navTo("crop.Create", {
					keyData: encodeURIComponent(JSON.stringify(oData)),
					filterData: encodeURIComponent(JSON.stringify(ofilterData)),
					operation: sOperation
				}, false);
			}
		},

		goToEdit: function (sPath, isCentralRegion) {
			var oFilterModel = this.getView().getModel("filterPageModel");
			var oData = oFilterModel.getData();
			var ofilterData = oFilterModel.getData();
			ofilterData.isCentralRegion = isCentralRegion;

			this.oRouter.navTo("crop.Edit", {
				keyData: encodeURIComponent(sPath),
				filterData: encodeURIComponent(JSON.stringify(ofilterData))
			}, false);
		},

		_validateForm: function () {
			var oFilterModel = this.getView().getModel("filterPageModel");
			var oCropYear = this.byId("cropYear"); 
			
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
			var oMainDataForm = this.byId("cropTrackKeysForm").getContent();
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
			var oInput = oEvent.getSource();

			var oTable = this.getView().byId("regions");
			var oModel = this.getView().getModel();
			var oFilterModel = this.getView().getModel("filterPageModel");
			var oData = oFilterModel.getData();
			var oRegions = oTable.getBinding("items");

			var oFilters = [];
			var regio = oInput.getSelectedKey().split("-");

			oFilters.push(new sap.ui.model.Filter("HCP_BLAND", sap.ui.model.FilterOperator.Contains, regio[0]));

			oRegions.filter(oFilters);

			oData["HCP_REGIO"] = null;

			setTimeout(function () {
				if (oTable.getItems().length > 0) {
					if (regio[0] != '') {
						if (this.checkIfRegioIsInUserProfile(regio[0])) {
							oFilterModel.setProperty("/regionEnabled", true);
							this._validateForm();
						} else {
							oFilterModel.setProperty("/regionEnabled", false);
							this._validateForm();
						}
					} else {
						oFilterModel.setProperty("/enableCreateRegioValid", true);
						this._validateForm();
					}

				} else {
					oFilterModel.setProperty("/regionEnabled", false);
					oFilterModel.setProperty("/enableCreateRegioValid", true);
					this._validateForm();
				}
			}.bind(this), 500);
			this._validateForm();
		},

		buildEntityPath: function (sEntityName, oEntity) {
			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity.HCP_CROP_TRACK_ID + "l)";
			}
		},

		onInputRegioFormSelect: function (oEvent) {

			var oInput = oEvent.getSource();
			var oRegio = oInput.getSelectedKey();

			if (oRegio != "") {
				if (this.checkIfRegioIsInUserProfile(oRegio)) {
					this._validateForm();
				}
			}

		},

		checkIfRegioIsInUserProfile: function (sRegio) {
			var oProfileModel = this.getView().getModel("profileModel");
			var oFilterModel = this.getView().getModel("filterPageModel");
			var oProfileData = oProfileModel.getData();

			if (sRegio) {
				if (oProfileData.werks.filter(werks => werks.REGIO == sRegio || werks.VALOR == '*').length > 0 || oProfileData.fullAccess) {
					oFilterModel.setProperty("/enableCreateRegioValid", true);
					return true;
				} else {
					oFilterModel.setProperty("/enableCreateRegioValid", false);
					return false;
				}
			} else {
				oFilterModel.setProperty("/enableCreateRegioValid", true);
				return false;
			}

		}
	});
});