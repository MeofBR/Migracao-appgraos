/* global cordova */
sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.crop.Edit", {
		formatter: formatter,
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("crop.Edit").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			
		},

		handleRouteMatched: async function (oEvent) {
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableSave: false,
				stagesValid: false,
				totalPercentageCount: 0,
				totalPercentageState: "Neutral",
				minDate: new Date(),
				dateValueState: "None",
				dateValueStateText: null,
				alredyInitialized: false,
				hasChanges: false,
				maturationAboveHarvest: false,
				iconColor: "green",
				oldCrop: false,
				notCrop: false,
				editCropTracking: [],
				commercialization: []
			}), "editCropModel");

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				create: true,
				edit: true
			}), "profileModel");
			
			let oEditModel = this.getView().getModel("editCropModel");
			let oModel = this.getView().getModel();
			let oDeviceModel = this.getOwnerComponent().getModel("device");
			let bIsMobile = oDeviceModel.getData().browser.mobile;
			let oDataCommercialization;
			this.firstLoad = true;
			this.getUser().then(function (userName) {
				this.userName = userName;

				this.getUserProfile("View_Profile_Crop", this.userName).then(profileData => {
					this.getView().getModel("profileModel").setData(profileData);
					console.log(this.getView().getModel("profileModel").getData());
					this.closeBusyDialog();
				}).catch(error => {
					console.log(error);
					this.closeBusyDialog();
				});

			}.bind(this)).catch(function (error) {
				console.log(error);
			}.bind(this));
			var oData;
			var state;
			var regio;
			let notCrop = null;
			
			if (oEvent.getParameter("data")?.notCrop){
				notCrop =  JSON.parse(decodeURIComponent(oEvent.getParameter("data").notCrop));
				oEditModel.setProperty("/notCrop", true);
				let editProperty = {
					HCP_CROP_ID:		notCrop.HCP_CROP_ID,
					HCP_STATE_ID:		notCrop.HCP_STATE.split("-")[0],
					HCP_STATE_NAME: 	notCrop.HCP_STATE.split("-")[1],
					HCP_REGIO_ID:		notCrop.HCP_REGIO.split("-")[0],
					HCP_REGIO_NAME: 	notCrop.HCP_REGIO.split("-")[1],
					HCP_MATERIAL_ID:	notCrop.HCP_MATERIAL,
					HCP_MATERIAL_NAME:	notCrop.HCP_MATERIAL_COD_NAME,
					HCP_COMMERCIALIZATION: { HCP_CAPACITY_PERCENT: 0 }
				}
				oEditModel.setProperty("/editCropTracking", editProperty);
				this.oldCrop(notCrop);
				oEditModel.setProperty("/editCropTracking/isEnable", false);
				let commercialization = await this.getCommercialization(editProperty);
				oEditModel.setProperty("/commercialization", commercialization);
			
				if(commercialization){
					oEditModel.setProperty("/editCropTracking/HCP_COMMERCIALIZATION/HCP_CAPACITY_PERCENT", parseFloat(commercialization.HCP_CAPACITY_PERCENT))
				}else{
					oEditModel.setProperty("/editCropTracking/HCP_COMMERCIALIZATION/HCP_CAPACITY_PERCENT", 0)
				}
			}

			if(notCrop == null){
				if (oEvent.getParameter("data")) {
				// this.setIconColor();
				if (this.sKeyData !== oEvent.getParameter("data").keyData) {
					this.sKeyData = oEvent.getParameter("data").keyData;
					oData = oModel.getProperty(decodeURIComponent(this.sKeyData));
					this.filterData = oEvent.getParameter("data").filterData;
					var oFilterData = JSON.parse(decodeURIComponent(this.filterData));
					
					this.oldCrop(oFilterData);
					
					if (oEvent.getParameter("data").operation) {
						oEditModel.setProperty("/enableEditConsult", false);
						this.operation = "consult";
					} else {
						oEditModel.setProperty("/enableEditConsult", true);
						this.operation = "edit";
					}

					if (oData["Crop_Track_Partner"]) {
						if (oData["Crop_Track_Partner"].length > 0) {
							var oSupplierData = oModel.getProperty("/" + oData.Crop_Track_Partner.__ref);
							oData["HCP_SUPPLIER_DESC"] = oSupplierData.NAME1;
							// this.supplyMissingExpands(oData);
						} else {
							this.supplyMissingExpands(oData);
						}
					}

					oData["HCP_STATE"] = oFilterData.HCP_STATE;
					oData["HCP_REGIO"] = oFilterData.HCP_REGIO;

					oData["HCP_PLANTING_STAGE"] = parseFloat(oData["HCP_PLANTING_STAGE"]);
					oData["HCP_GERMINATION_STAGE"] = parseFloat(oData["HCP_GERMINATION_STAGE"]);
					oData["HCP_VEG_DEV_STAGE"] = parseFloat(oData["HCP_VEG_DEV_STAGE"]);
					oData["HCP_FLOWERING_STAGE"] = parseFloat(oData["HCP_FLOWERING_STAGE"]);
					oData["HCP_GRAIN_FORMATION_STAGE"] = parseFloat(oData["HCP_GRAIN_FORMATION_STAGE"]);
					oData["HCP_GRAIN_FILLING_STAGE"] = parseFloat(oData["HCP_GRAIN_FILLING_STAGE"]);
					oData["HCP_MATURATION_STAGE"] = parseFloat(oData["HCP_MATURATION_STAGE"]);
					oData["HCP_HARVEST_STAGE"] = parseFloat(oData["HCP_HARVEST_STAGE"]);
					
					// if (oData.HCP_COMMERCIALIZATION) {
					// 	oData?.HCP_COMMERCIALIZATION?.HCP_CAPACITY_PERCENT = Number(oData?.HCP_COMMERCIALIZATION?.HCP_CAPACITY_PERCENT);
					// }
					
					// if (!oData.HCP_COMMERCIALIZATION) {
						if (oData.Crop_Track_Commercialization && oData.Crop_Track_Commercialization.__list.length > 0) {
							// Filtra todas as comercializações com o mesmo periodo
							let filterCommercialization = oData.Crop_Track_Commercialization.__list.filter(value => {
								let getObjCommercialization = this.getView().getModel().oData[value];
								return getObjCommercialization
							})
							// Ordena filterCommercialization baseado nos números extraídos
							filterCommercialization.sort((a, b) => this.extractNumber(a) - this.extractNumber(b));
							
							let getLastIndexCommercialization = filterCommercialization[filterCommercialization.length - 1]
							let getObjCurrentCommercialization = this.getView().getModel().oData[getLastIndexCommercialization]
							if (getObjCurrentCommercialization) {
								oData["HCP_COMMERCIALIZATION"] = getObjCurrentCommercialization
							} else {
								let HCP_COMMERCIALIZATION = {
									HCP_CAPACITY_PERCENT: 0
								}
	
								oData["HCP_COMMERCIALIZATION"] = HCP_COMMERCIALIZATION
							}
						} else {
							if (bIsMobile) {
								var CommercializationFilters = [];
								let state = oData.HCP_STATE.split("-");
								let regio = oData.HCP_REGIO.split("-");
								CommercializationFilters.push(new sap.ui.model.Filter({
									path: 'HCP_CROP',
									operator: sap.ui.model.FilterOperator.EQ,
									value1: oData.HCP_CROP
								}));
		
								CommercializationFilters.push(new sap.ui.model.Filter({
									path: 'HCP_STATE',
									operator: sap.ui.model.FilterOperator.EQ,
									value1: state[0]
								}));
		
								CommercializationFilters.push(new sap.ui.model.Filter({
									path: 'HCP_MATERIAL',
									operator: sap.ui.model.FilterOperator.EQ,
									value1: oData.HCP_MATERIAL
								}));
		
								CommercializationFilters.push(new sap.ui.model.Filter({
									path: 'HCP_REGIO',
									operator: sap.ui.model.FilterOperator.EQ,
									value1: regio[0]
								}));
								
								oModel.read("/Commercialization", {
								    filters: CommercializationFilters,
								    sorters: [new sap.ui.model.Sorter({
								        path: "HCP_CREATED_AT",
								        descending: true
								    })],
								    success: function (results) {
								        let resultsArray = results.results;
								        // let elementWithoutOffline;
								       
								        // for (var i = 0; i < resultsArray.length; i++) {
								        //     if (!resultsArray[i]["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
								        //         elementWithoutOffline = resultsArray[i];
								        //         break; 
								        //     }
								        // }
								        if (resultsArray) {
											oData["HCP_COMMERCIALIZATION"] = resultsArray[0];
											if (oData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT) {
												oData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT = Number(oData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT)
											}
								        } 
								    }.bind(this),
								    error: function () {
								        sap.m.MessageToast.show("Falha ao Buscar Comercialização.");
								    }
								});
							} else {
								let HCP_COMMERCIALIZATION = {
									HCP_CAPACITY_PERCENT: 0
								}
								oData["HCP_COMMERCIALIZATION"] = HCP_COMMERCIALIZATION
								if (oData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT) {
									oData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT = Number(oData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT);
								}
							}
							
						}
					// }
					
					if (oData?.HCP_COMMERCIALIZATION?.HCP_CAPACITY_PERCENT) {
						oData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT = Number(oData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT);
					}
					
					state = oData.HCP_STATE.split("-");
					regio = oData.HCP_REGIO.split("-");

					if (state[1] == regio[1]) {
						oData["isEnable"] = false;

					} else {
						oData["isEnable"] = true;
					}

					if (!oData["isEnable"]) {

						var aFilters = [];

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_CROP',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.HCP_CROP
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_STATE',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: state[0]
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_MATERIAL',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.HCP_MATERIAL
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_REGIO',
							operator: sap.ui.model.FilterOperator.NE,
							value1: regio[0]
						}));

						oModel.read("/Crop_Tracking", {
							filters: aFilters,
							success: function (result) {
								var oCrops = result.results;
								if (oCrops.length > 0) {
									oData["isEnable"] = false;
								} else {
									oData["isEnable"] = true;
								}

								oData["HCP_PLANTING_STAGE"] = parseFloat(oData["HCP_PLANTING_STAGE"]);
								oData["HCP_GERMINATION_STAGE"] = parseFloat(oData["HCP_GERMINATION_STAGE"]);
								oData["HCP_VEG_DEV_STAGE"] = parseFloat(oData["HCP_VEG_DEV_STAGE"]);
								oData["HCP_FLOWERING_STAGE"] = parseFloat(oData["HCP_FLOWERING_STAGE"]);
								oData["HCP_GRAIN_FORMATION_STAGE"] = parseFloat(oData["HCP_GRAIN_FORMATION_STAGE"]);
								oData["HCP_GRAIN_FILLING_STAGE"] = parseFloat(oData["HCP_GRAIN_FILLING_STAGE"]);
								oData["HCP_MATURATION_STAGE"] = parseFloat(oData["HCP_MATURATION_STAGE"]);
								oData["HCP_HARVEST_STAGE"] = parseFloat(oData["HCP_HARVEST_STAGE"]);

								oEditModel.setProperty("/editCropTracking", oData);
								// setTimeout(function () {
								this.onStagesChange();
								// 	this._validateForm();
								// }.bind(this), 100);
							}.bind(this),
							error: function (err) {
								sap.m.MessageToast.show("Falha ao Buscar Acompanhamentos.");
							}
						});
					} else {
						oEditModel.setProperty("/editCropTracking", oData);
						// setTimeout(function () {
						this.onStagesChange();
						// 	this._validateForm();
						// }.bind(this), 100);
					}

				} else {
					oData = oModel.getProperty(decodeURIComponent(this.sKeyData));
					var oDataFilter = JSON.parse(decodeURIComponent(this.filterData));
					
					this.oldCrop(oDataFilter);
					
					if (!oData.HCP_COMMERCIALIZATION) {
						if (oData.Crop_Track_Commercialization && oData.Crop_Track_Commercialization.__list.length > 0) {
							// Filtra todas as comercializações com o mesmo periodo
							let filterCommercialization = oData.Crop_Track_Commercialization.__list.filter(value => {
								let getObjCommercialization = this.getView().getModel().oData[value];
								return getObjCommercialization
							})
							
							let getLastIndexCommercialization = filterCommercialization[filterCommercialization.length - 1]
							let getObjCurrentCommercialization = this.getView().getModel().oData[getLastIndexCommercialization]
							if (getObjCurrentCommercialization) {
								oData["HCP_COMMERCIALIZATION"] = getObjCurrentCommercialization
							} else {
								let HCP_COMMERCIALIZATION = {
									HCP_CAPACITY_PERCENT: 0
								}
	
								oData["HCP_COMMERCIALIZATION"] = HCP_COMMERCIALIZATION
							}
							
						} else {
							let HCP_COMMERCIALIZATION = {
								HCP_CAPACITY_PERCENT: 0
							}
	
							oData["HCP_COMMERCIALIZATION"] = HCP_COMMERCIALIZATION
						}
					}
					
					if (oData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT) {
						oData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT = Number(oData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT)
					}

					oData.HCP_STATE = oDataFilter.HCP_STATE;
					oData.HCP_REGIO = oDataFilter.HCP_REGIO;

					state = oData.HCP_STATE.split("-");
					regio = oData.HCP_REGIO.split("-");

					if (oEvent.getParameter("data").operation) {
						oEditModel.setProperty("/enableEditConsult", false);
						this.operation = "consult";
					} else {
						oEditModel.setProperty("/enableEditConsult", true);
						this.operation = "edit";
					}

					if (state[1] == regio[1]) {
						oEditModel.setProperty("/editCropTracking/isEnable", false);
					} else {
						oEditModel.setProperty("/editCropTracking/isEnable", true);
					}

					if (!oEditModel.getProperty("/editCropTracking/isEnable")) {

						var aFilters = [];

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_CROP',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.HCP_CROP
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_STATE',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: state[0]
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_MATERIAL',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.HCP_MATERIAL
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: 'HCP_REGIO',
							operator: sap.ui.model.FilterOperator.NE,
							value1: regio[0]
						}));
						oModel.read("/Crop_Tracking", {
							filters: aFilters,
							success: function (result) {
								var oCrops = result.results;
								if (oCrops.length > 0) {
									oEditModel.setProperty("/editCropTracking", oData)
									oEditModel.setProperty("/editCropTracking/isEnable", false);
									this.onStagesChange();
								} else {
									oEditModel.setProperty("/editCropTracking", oData)
									oEditModel.setProperty("/editCropTracking/isEnable", true);
									this.onStagesChange();
								}
							}.bind(this),
							error: function (err) {
								sap.m.MessageToast.show("Falha ao Buscar Acompanhamentos.");
							}
						});
					}else{
						oEditModel.setProperty("/editCropTracking", oData)
						this.onStagesChange();
					}

				}
				}
			}
		},
		
		oldCrop: function(filterData){
			let oEditModel = this.getView().getModel("editCropModel");
			let oModel = this.getView().getModel();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			let bIsMobile = oDeviceModel.getData().browser.mobile;
			
			if(filterData.HCP_CROP_ID){
				let oFilters = [];
				oFilters.push(new sap.ui.model.Filter("HCP_CROP_ID", sap.ui.model.FilterOperator.EQ, filterData.HCP_CROP_ID));
				
				new Promise(function (resolve, reject) {
					oModel.read("/Crop_Year", {
						filters: oFilters,
						sorters: [new sap.ui.model.Sorter("HCP_RANGE_START", false)],
						success: function (results) {
							if(this.testOldCrop(results.results[0].HCP_CROP_DESC)){
								if(!filterData.isCentralRegion && bIsMobile){
									oEditModel.setProperty("/oldCrop", true)
								}
								if(!bIsMobile){
									oEditModel.setProperty("/oldCrop", true)
								}
								
								oEditModel.setProperty("/editCropTracking/isEnable", false);
								oEditModel.setProperty("/editCropTracking/HCP_CROP_NAME", results.results[0].HCP_CROP_DESC)
							} else {
								oEditModel.setProperty("/oldCrop", false)
							}
							return resolve()
						}.bind(this),
						error: function (error) {
							return reject(MessageBox.error("Erro ao Buscar Ano da Safra!"));
						}
					})
				}.bind(this))
				
			}
		},
		
		getCommercialization: async function(data){
			
			let oDataModel = this.getOwnerComponent().getModel();
			var aFilters = [];
			let ServiceCommercialization = "/Commercialization"
			let oEditModel = this.getView().getModel("editCropModel");
			
			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_CROP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: (data.HCP_CROP_ID).toString()
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_STATE',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: data.HCP_STATE_ID
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_REGIO',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: data.HCP_REGIO_ID
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_MATERIAL',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: data.HCP_MATERIAL_ID
			}));
			
			return await new Promise(function (resolve, reject) {
				oDataModel.read(ServiceCommercialization, {
					filters: aFilters,
					sorters: [new sap.ui.model.Sorter("HCP_COMMERC_ID", true)],
					success: function (data) {
						resolve(data.results ? data.results[0] : null);
					}.bind(this),
					error: function (oError) {
						reject(oError);
					}.bind(this),
				});
			});
			
		},
		
		testOldCrop: function(oCropYear){
			if (oCropYear) {
				var cropYear = oCropYear.split("/")[1];
				var currentYear = (new Date().getYear()).toString();

				if (cropYear < currentYear.slice(-2)) {
					return true;
				} else {
					return false;
				}
			}
		},
		
		// Função para extrair o número dos itens
		extractNumber: function (item) {
		    let match = item.match(/\((\d+)l\)/);  // Expressão regular para extrair o número
		    if (match && match[1]) {
		        return parseInt(match[1], 10);  // Converta a string para um número
		    }
		    return 0;  // Retorna 0 se não encontrar um número
		},

		setIconColor: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var oEditModel = this.getView().getModel("editCropModel");

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				oEditModel.setProperty("/iconColor", "green");
			} else {
				oEditModel.setProperty("/iconColor", "grey");
			}
		},

		supplyMissingExpands: function (oData) {
			return new Promise(function (resolve, reject) {
				var aPromises = [];
				var oModel = this.getView().getModel();

				aPromises.push(new Promise(function (resolve, reject) {
					oModel.read("/View_Grouping_Suppliers", {
						filters: [
							new sap.ui.model.Filter({
								path: "HCP_REGISTER",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oData.HCP_SUPPLIER
							})
						],
						success: function (result) {
							var aPartnerData = result.results;

							if (aPartnerData) {
								oData.Crop_Track_Partner["__ref"] = aPartnerData[0];
								oData["HCP_SUPPLIER_DESC"] = aPartnerData[0].NAME1;
							}
							resolve();
						},
						error: function () {
							reject();
						}
					});
				}.bind(this)));

				Promise.all(aPromises).then(function () {
					var oEditModel = this.getView().getModel("editCropModel");

					oEditModel.refresh();
					resolve();
				}.bind(this));
			}.bind(this));
		},

		navBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
				if (sPreviousHash !== undefined) {
					window.history.go(-1);
				} else {
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.navTo("crop.Filter", true);
				}
		},

		navToIndex: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.navTo("crop.Index", true);
		},

		_validateForm: function () {
			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;
				var oCreateModel = this.getView().getModel("editCropModel");
				let enableSave = true;

				oCreateModel.setProperty("/hasChanges", true);

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required) {
						var sValue = oControl.getValue();
						if (!sValue || oControl.getValueState() !== 'None') {
							if(oControl.getSelectedKey() == ''){
								enableSave = false;
								return;
							}
						}
					}
				}
				
				if(this.firstLoad || oCreateModel?.oData?.editCropTracking?.HCP_STATE?.split("-")[1] == oCreateModel?.oData?.editCropTracking?.HCP_REGIO?.split("-")[1]){
					oCreateModel.setProperty("/enableSave", false);
					this.firstLoad = false;
				}
				else
					oCreateModel.setProperty("/enableSave", enableSave);
					
				this._validateStages();
			}.bind(this), 100);
		},

		_validateStages: function () {
			var oEditModel = this.getView().getModel("editCropModel");
			var sPercentageStage = oEditModel.getProperty("/totalPercentageCount");
			var bIsAboveOneHundred = sPercentageStage > 100 || sPercentageStage === 0 ? true : false;
			var bIsOneHundred = sPercentageStage === 100 ? true : false;

			if (bIsAboveOneHundred) {

				oEditModel.setProperty("/stagesValid", false);
			} else {
				if (bIsOneHundred) {
				//	this._validateForm();
					oEditModel.setProperty("/stagesValid", true);
				} else {
					oEditModel.setProperty("/stagesValid", false);
				}

			}
		},

		_showMessageToastStages: function () {
			var oEditModel = this.getView().getModel("editCropModel");
			var sPercentageStage = oEditModel.getProperty("/totalPercentageCount");
			var sMaturationAboveHarvest = oEditModel.getProperty("/maturationAboveHarvest");
			var bIsAboveOneHundred = sPercentageStage > 100 || sPercentageStage === 0 ? true : false;

			if (bIsAboveOneHundred) {
				// oEditModel.setProperty("/stagesValid", false);
				sap.m.MessageToast.show("A soma dos estágios, fora o plantio e colheita, deve somar 100%");
			} else {
				// oEditModel.setProperty("/stagesValid", true);
			}

			if (!sMaturationAboveHarvest) {
				sap.m.MessageToast.show("O percentual de colheita não pode ser maior que o percentual de maturação");
			}
		},

		_getFormFields: function () {
			var oMainDataForm = this.byId("cropEditFormID").getContent();
			var aControls = [];
			var sControlType;

			for (var i = 0; i < oMainDataForm.length; i++) {
				sControlType = oMainDataForm[i].getMetadata().getName();
				if (sControlType === "sap.m.Input" || sControlType === "sap.m.DateTimeInput" || sControlType === "sap.m.DatePicker" ||
					sControlType === "sap.m.CheckBox" || sControlType === "sap.m.MaskInput" || sControlType === "sap.m.ComboBox" || sControlType ===
					"com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox") {
					if (oMainDataForm[i].getEnabled()) {
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

		generateUniqueKey: function () {
			return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
				(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
			);
		},

		_onChange: function () {
			var teste = 1;
		},
		
		_onSave: function (oEvent) {
			var oEditModel = this.getView().getModel("editCropModel");
			
			if(oEditModel.oData.notCrop){
				this.notCropSave(oEvent);
			}else{
				this.normalSave(oEvent);
			}
			
		},
		
		notCropSave: async function(oEvent){
			let oModel = this.getView().getModel();
			let oEditModel = this.getView().getModel("editCropModel");
			oModel.setUseBatch(true);
			this.setBusyDialog("App Grãos", "Salvando dados, por favor aguarde");
			
			let dataCommercialization = await this.validateCommercialization(oEditModel.oData.editCropTracking)
			
			oModel.submitChanges({
				groupId: "changes",
				success: function () {
					this.closeBusyDialog();
					MessageBox.success("Parâmetros editados com sucesso.");
					MessageBox.success(
						"Parâmetros editados com sucesso.", {
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (sAction) {
								this.navBack();
							}.bind(this)
						}
					);
				}.bind(this),
				error: function () {
					this.closeBusyDialog();
					MessageBox.error(
						"Erro ao editar Parâmetros.", {
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (sAction) {
								this.navBack();
							}.bind(this)
						}
					);
				}.bind(this)
			});
			
		},
		
		validateCommercialization: async function(data){
			
			let oDataModel = this.getOwnerComponent().getModel();
			let dataCommercialization = null;
			let ServiceCommercialization = "/Commercialization"
			let oEditModel = this.getView().getModel("editCropModel");
			
			dataCommercialization = oEditModel.oData.commercialization;
			
			let oProperty = {
				HCP_CAPACITY_PERCENT: parseFloat(oEditModel.oData.editCropTracking.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT).toFixed(2),
				//Data Base
				HCP_REGIO:		data.HCP_REGIO_ID,
				HCP_CROP:		data.HCP_CROP_ID, 
				HCP_STATE:		data.HCP_STATE_ID,
				HCP_MATERIAL:	data.HCP_MATERIAL_ID,
			}
			
			if(dataCommercialization && dataCommercialization.HCP_PERIOD == this.getWeek() + new Date().getFullYear()){
				oProperty = {
					...oProperty,
					HCP_COMMERC_ID: dataCommercialization.HCP_COMMERC_ID,
					HCP_UPDATED_BY: this.userName,
					HCP_UPDATED_AT: new Date(),
				}
				
				let sPath = ServiceCommercialization + "("+ oProperty.HCP_COMMERC_ID + "l)";
				oDataModel.update(sPath, oProperty, {
					groupId: "changes"
				});
					
					
			}else if(dataCommercialization && dataCommercialization.HCP_PERIOD != this.getWeek() + new Date().getFullYear()){
				oProperty = {
					...oProperty,
					HCP_COMMERC_ID: new Date().getTime().toFixed(),
					HCP_PERIOD: this.getWeek() + new Date().getFullYear(),
					HCP_PLATAFORM: dataCommercialization.HCP_PLATAFORM,
					HCP_TEXT: dataCommercialization.HCP_TEXT,
					HCP_NEGO_REPORT_ID: dataCommercialization.HCP_NEGO_REPORT_ID,
					HCP_TOTAL_NEGOTIATION: dataCommercialization.HCP_TOTAL_NEGOTIATION,
					HCP_TOTAL_NEGOTIATION_PERCENT: dataCommercialization.HCP_TOTAL_NEGOTIATION_PERCENT,
					HCP_CAPACITY_TYPE: dataCommercialization.HCP_CAPACITY_TYPE,
					HCP_CREATED_BY: this.userName,
					HCP_CREATED_AT: new Date() 
				}
				
				oDataModel.create(ServiceCommercialization, oProperty, {
					groupId: "changes"
				});
					
			}else{
				oProperty = {
					...oProperty,
					HCP_COMMERC_ID: new Date().getTime().toFixed(),
					HCP_PERIOD: this.getWeek() + new Date().getFullYear(),
					HCP_PLATAFORM: '2',
					HCP_TEXT: "",
					HCP_NEGO_REPORT_ID: "0",
					HCP_TOTAL_NEGOTIATION: "0",
					HCP_TOTAL_NEGOTIATION_PERCENT: "0.00",
					HCP_CAPACITY_TYPE: "0",
					HCP_CREATED_BY: this.userName,
					HCP_CREATED_AT: new Date() 
				}
				
				oDataModel.create(ServiceCommercialization, oProperty, {
					groupId: "changes"
				});
			}
			
			return oProperty;
		},
		
		normalSave: function(oEvent){
			var aUserName = this.userName;
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var aDeferredGroups = oModel.getDeferredGroups();
			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}
			var oEditModel = this.getView().getModel("editCropModel");
			oEditModel.setProperty("/enableSave", false);
			var oData = oEditModel.getProperty("/editCropTracking");
			// var sPath = "/Crop_Tracking(" + oData.HCP_CROP_TRACK_ID + "l)";
			var sPath = this.buildEntityPath("Crop_Tracking", oData);
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			oEditModel.setProperty("/bkpoData", Object.assign({}, oData))
			oEditModel.setProperty("/bkpoDataCommercialization", Object.assign({}, oData.HCP_COMMERCIALIZATION))

			// this._verifyCommercialization(oData).then(function (hasError) {
			let hasError = false	
			var sMessage;
			
			if (hasError) {
				sMessage =
					"Existe uma comercialização cadastrada com o valor comercializado maior que a produção total deste acompanhamento, favor verifique.";
			}

			if (oData.HCP_PLANTING_AREA <= 0) {
				sMessage = "O valor da Área de plantio deve ser maior que 0.";
				hasError = true;
			} else if (oData.HCP_TOTAL_PRODUCTION <= 0) {
				sMessage = "O valor da Produtividade deve ser maior que 0.";
				hasError = true;
			}

			if (hasError) {
				sap.m.MessageBox.warning(
					sMessage, {
						icon: sap.m.MessageBox.Icon.WARNING,
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function (oAction) {}.bind(this)
					}
				);
			} else {
				var aData = {
					HCP_START_CROP: oData.HCP_START_CROP,
					HCP_END_CROP: oData.HCP_END_CROP,
					HCP_START_HRVST: oData.HCP_START_HRVST,
					HCP_END_HRVST: oData.HCP_END_HRVST,
					HCP_PLANTING_AREA: parseFloat(oData.HCP_PLANTING_AREA).toFixed(2),
					HCP_PRODUCTIVITY: parseFloat(oData.HCP_PRODUCTIVITY).toFixed(2),
					HCP_TOTAL_PRODUCTION: parseFloat(oData.HCP_TOTAL_PRODUCTION).toFixed(2),
					HCP_RAINFALL_LEVEL: parseFloat(oData.HCP_RAINFALL_LEVEL).toFixed(2),
					HCP_CROP_CONDITION: oData.HCP_CROP_CONDITION,
					HCP_TECH_LEVEL: oData.HCP_TECH_LEVEL,
					HCP_PROD_COST: parseFloat(oData.HCP_PROD_COST).toFixed(2),
					HCP_SUPPLIER: oData.HCP_SUPPLIER || null,
					HCP_PLANTING_STAGE: parseFloat(oData.HCP_PLANTING_STAGE).toFixed(2) || 0,
					HCP_GERMINATION_STAGE: parseFloat(oData.HCP_GERMINATION_STAGE).toFixed(2) || 0,
					HCP_VEG_DEV_STAGE: parseFloat(oData.HCP_VEG_DEV_STAGE).toFixed(2) || 0,
					HCP_FLOWERING_STAGE: parseFloat(oData.HCP_FLOWERING_STAGE).toFixed(2) || 0,
					HCP_GRAIN_FORMATION_STAGE: parseFloat(oData.HCP_GRAIN_FORMATION_STAGE).toFixed(2) || 0,
					HCP_GRAIN_FILLING_STAGE: parseFloat(oData.HCP_GRAIN_FILLING_STAGE).toFixed(2) || 0,
					HCP_MATURATION_STAGE: parseFloat(oData.HCP_MATURATION_STAGE).toFixed(2) || 0,
					HCP_HARVEST_STAGE: parseFloat(oData.HCP_HARVEST_STAGE).toFixed(2) || 0,
					HCP_UPDATED_BY: aUserName,
					HCP_UPDATED_AT: new Date(),
					HCP_CROP: oData.HCP_CROP,
					HCP_STATE: oData.HCP_STATE,
					HCP_REGIO: oData.HCP_REGIO,
					HCP_MATERIAL: oData.HCP_MATERIAL
				};

				let fullNameState = aData.HCP_STATE;

				this.setBusyDialog("Acompanhamento de Lavoura", "Salvando");

				this.getCentralRegion(aData, "Crop_Tracking").then(function (regioCenter) {

					if (!regioCenter) {
						regioCenter = [];
						regioCenter.HCP_REGIO = oData.HCP_REGIO;
					}

					var state = aData.HCP_STATE.split("-");
					if (state.length > 1) {
						aData.HCP_STATE = state[0];
					}
					var regio = aData.HCP_REGIO.split("-");
					if (regio.length > 1) {
						aData.HCP_REGIO = regio[0];
					}

					oModel.update(sPath, aData, {
						groupId: "changes"
					});

					var sCropPath = this.buildEntityPath("Crop_Tracking", regioCenter);

					let HCP_COMMERCIALIZATION = {
						HCP_CAPACITY_PERCENT: 0
					}

					aData["HCP_COMMERCIALIZATION"] = oData.HCP_COMMERCIALIZATION ? oData.HCP_COMMERCIALIZATION : HCP_COMMERCIALIZATION

					this.checkCentralRegion(aData, regioCenter.HCP_REGIO).then(function (oPropertiesEdit) {
						oData = oEditModel.getProperty("/bkpoData");
						oData.HCP_COMMERCIALIZATION = oEditModel.getProperty("/bkpoDataCommercialization")
						oEditModel.setProperty("/editCropTracking", oData)
						
						let oPropertiesEditWithCommercialization = {...oPropertiesEdit}
						delete oPropertiesEdit.HCP_CAPACITY_PERCENT

						if (regioCenter.HCP_REGIO != oData.HCP_REGIO) {
							if (oPropertiesEdit && regioCenter.HCP_CROP_TRACK_ID) {
								// oModel.update(sCropPath, oPropertiesEdit, {
								// 	groupId: "changes"
								// });
								if (oPropertiesEdit) {
									if (regioCenter.HCP_PERIOD == this.getWeek() + new Date().getFullYear()) {
										oModel.update(sCropPath, oPropertiesEdit, {
											groupId: "changes"
										});

									} else {
										oModel.createEntry("/Crop_Tracking", {
											properties: {
												HCP_CROP_TRACK_ID: new Date().getTime().toFixed(),
												HCP_CROP: regioCenter.HCP_CROP.toString(),
												HCP_STATE: regioCenter.HCP_STATE,
												HCP_REGIO: regioCenter.HCP_REGIO,
												HCP_MATERIAL: regioCenter.HCP_MATERIAL,
												HCP_UNIQUE_KEY: regioCenter.HCP_UNIQUE_KEY, //verificar
												HCP_START_CROP: oPropertiesEdit.HCP_START_CROP,
												HCP_END_CROP: oPropertiesEdit.HCP_END_CROP,
												HCP_START_HRVST: oPropertiesEdit.HCP_START_HRVST,
												HCP_END_HRVST: oPropertiesEdit.HCP_END_HRVST,
												HCP_PLANTING_AREA: parseFloat(oPropertiesEdit.HCP_PLANTING_AREA).toFixed(2),
												HCP_PRODUCTIVITY: parseFloat(oPropertiesEdit.HCP_PRODUCTIVITY).toFixed(2),
												HCP_TOTAL_PRODUCTION: parseFloat(oPropertiesEdit.HCP_TOTAL_PRODUCTION).toFixed(2),
												HCP_RAINFALL_LEVEL: parseFloat(oPropertiesEdit.HCP_RAINFALL_LEVEL).toFixed(2),
												HCP_CROP_CONDITION: regioCenter.HCP_CROP_CONDITION,
												HCP_TECH_LEVEL: regioCenter.HCP_TECH_LEVEL,
												HCP_PROD_COST: parseFloat(oPropertiesEdit.HCP_PROD_COST).toFixed(2),
												HCP_SUPPLIER: regioCenter.HCP_SUPPLIER || null,
												HCP_PLANTING_STAGE: parseFloat(regioCenter.HCP_PLANTING_STAGE).toFixed(2) || 0,
												HCP_GERMINATION_STAGE: parseFloat(regioCenter.HCP_GERMINATION_STAGE).toFixed(2) || 0,
												HCP_VEG_DEV_STAGE: parseFloat(regioCenter.HCP_VEG_DEV_STAGE).toFixed(2) || 0,
												HCP_FLOWERING_STAGE: parseFloat(regioCenter.HCP_FLOWERING_STAGE).toFixed(2) || 0,
												HCP_GRAIN_FORMATION_STAGE: parseFloat(regioCenter.HCP_GRAIN_FORMATION_STAGE).toFixed(2) || 0,
												HCP_GRAIN_FILLING_STAGE: parseFloat(regioCenter.HCP_GRAIN_FILLING_STAGE).toFixed(2) || 0,
												HCP_MATURATION_STAGE: parseFloat(regioCenter.HCP_MATURATION_STAGE).toFixed(2) || 0,
												HCP_HARVEST_STAGE: parseFloat(regioCenter.HCP_HARVEST_STAGE).toFixed(2) || 0,
												HCP_PERIOD: this.getWeek() + new Date().getFullYear(),
												HCP_CREATED_BY: aUserName,
												HCP_CREATED_AT: new Date()
											}
										}, {
											groupId: "changes"
										});
									}
								}
							}
						}

						if ((bIsMobile && navigator.connection.type !== "none")) {
							//console.log(5);
							//Mobile
							oModel.submitChanges({
								groupId: "changes",
								success: function () {
									//this.flushStore("Crop_Tracking").then(function () {
									//this.refreshStore("Crop_Tracking").then(function () {
									this._getCommercialization(aData,oPropertiesEditWithCommercialization).then(function () {
										setTimeout(() => {
											this._onUpsertCentralRegioCommercialization({...oData,
												fullNameState
											}, oPropertiesEditWithCommercialization).then(function () {
													MessageBox.success(
														"Acompanhamento de lavoura editado com sucesso!", {
															actions: [sap.m.MessageBox.Action.OK],
															onClose: function (sAction) {
	
																if (localStorage.getItem("countStorageCrop")) {
																	localStorage.setItem("countStorageCrop", (parseInt(localStorage.getItem("countStorageCrop")) + 1));
																} else {
																	localStorage.setItem("countStorageCrop", 1);
																}
	
																this.closeBusyDialog();
																this.navBack();
															}.bind(this)
														}
													);
											}.bind(this));
										}, 100);
									}.bind(this));

									//	}.bind(this));
									//}.bind(this));
								}.bind(this),
								error: function () {
									MessageBox.success(
										"Erro ao criar acompanhamento.", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.closeBusyDialog();
											}.bind(this)
										}
									);
								}.bind(this)
							});
						} else {
							oModel.submitChanges({
								groupId: "changes",
								success: function () {
									this._getCommercialization(aData,oPropertiesEditWithCommercialization).then(function () {
										setTimeout(() => {
											this._onUpsertCentralRegioCommercialization({...oData,
												fullNameState
											}, oPropertiesEditWithCommercialization).then(function () {
												MessageBox.success(
													"Acompanhamento de lavoura editado com sucesso!", {
														actions: [sap.m.MessageBox.Action.OK],
														onClose: function (sAction) {
															this.closeBusyDialog();
															this.navBack();
														}.bind(this)
													}
												);
											}.bind(this));
										}, 100);
									}.bind(this));
								}.bind(this),
								error: function () {
									MessageBox.success(
										"Erro ao criar acompanhamento.", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.closeBusyDialog();
											}.bind(this)
										}
									);
								}.bind(this)
							});
						}
					}.bind(this));

				}.bind(this)).catch(function (error) {
					console.log(error);
				}.bind(this));
			}
			// }.bind(this));
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
                        this.getView().getModel().refresh(true);
                        localStorage.setItem("lastUpdateCrop", new Date());
                        this.getView().getModel().refresh(true);
                        localStorage.setItem("countStorageCrop", 0);
                         this.closeBusyDialog();
                    }.bind(this));
                }.bind(this));
            } else {
				this.getView().getModel().refresh(true);
			}
		},
		
		
		_validateCommercialization: function(oEvent) {
			
			let oEditModel = this.getView().getModel("editCropModel");
		    var oInput = oEvent.getSource();
		    var sValue = oInput.getValue();
		    
		    // Remover caracteres não numéricos
		    sValue = sValue.replace(/[^0-9]/g, '');
		    
		    // Converter para número e validar intervalo
		    var iValue = parseInt(sValue, 10);
		    if (iValue < 0 || iValue > 100) {
		        iValue = Math.min(Math.max(iValue, 0), 100); 
		        oInput.setValue(iValue.toString()); 
		    } else {
		        oInput.setValue(iValue.toString()); 
		    }
		    
		    oEditModel.setProperty("/enableSave", true);
		    
		    if(oEditModel.oData.notCrop){
		    	oEditModel.setProperty("/stagesValid", true);
		    	oEditModel.setProperty("/maturationAboveHarvest", true);
		    	oEditModel.setProperty("/enableEditConsult", true);
		    	oEditModel.setProperty("/edit", true);
		    }
		},

		onPhotoDataSuccess: function (imageData) {
			/*var oView = this.getView();
			var myImage = oView.byId("myImage");
			myImage.setSrc("data:image/jpeg;base64," + imageData);*/
		},

		onFail: function (message) {
			console.log("Erro: " + message);
		},

		_onIconPress: function (oEvent) {

			var oNav = navigator.camera;
			oNav.getPicture(this.onPhotoDataSuccess, this.onFail, {
				quality: 10,
				destinationType: oNav.DestinationType.DATA_URL
			});

		},

		onStagesChange: function (oEvent) {
			var oModel = this.getView().getModel("editCropModel");
			var oData = oModel.getProperty("/editCropTracking");
			// var sCount = (oData["HCP_GERMINATION_STAGE"] || 0) + (oData["HCP_VEG_DEV_STAGE"] || 0) + (oData["HCP_FLOWERING_STAGE"] || 0) + (
			// 	oData["HCP_GRAIN_FORMATION_STAGE"] || 0) + (oData["HCP_GRAIN_FILLING_STAGE"] || 0) + (oData["HCP_MATURATION_STAGE"] || 0) + (
			// 	oData["HCP_HARVEST_STAGE"] || 0);
			// var sState = sCount > 100 ? "Error" : (sCount === 0 ? "Neutral" : "Good");
			var sCount = 0;
			var bIsStageValid = oData["HCP_MATURATION_STAGE"] < oData["HCP_HARVEST_STAGE"] ? false : true;

			// for (var index in oData) {
			// 	if (index.indexOf("STAGE") !== -1) {
			// 		if (index !== "HCP_PLANTING_STAGE" && index !== "HCP_HARVEST_STAGE" && oData[index] !== 100) {
			// 			sCount = sCount + oData[index];
			// 		}
			// 	}
			// }
			for (var index in oData) {
				if (index.indexOf("STAGE") !== -1 && index.indexOf("_IMGCOUNT") === -1) {
					if (index !== "HCP_PLANTING_STAGE" && index !== "HCP_HARVEST_STAGE") {
						sCount = Number(sCount) + Number(oData[index]);
					}
				}
			}

			var sState = sCount > 100 || !bIsStageValid ? "Error" : ((sCount === 0 ? "Neutral" : (sCount === 100 ? "Good" : "Critical")));

			oModel.setProperty("/totalPercentageCount", sCount);
			oModel.setProperty("/totalPercentageState", sState);
			oModel.setProperty("/maturationAboveHarvest", bIsStageValid);
			this._validateForm();
		},

		_generateMsgStrip: function () {
			var aTypes = ["Information", "Warning", "Error", "Success"],
				oStageForm = this.byId("stageEditFormID"),
				oMsgStrip = sap.ui.getCore().byId("msgStrip");

			if (!oMsgStrip) {
				oMsgStrip = new sap.m.MessageStrip("msgStrip", {
					text: "A soma dos estágios, fora o Plantio, não deve passar de 100%",
					showIcon: true,
					type: "Error"
				});
			}

			oStageForm.addContent(oMsgStrip);
		},

		_onCancel: function () {
			var oEditCropModel = this.getView().getModel("editCropModel");
			var bHasChanges = oEditCropModel.getProperty("/hasChanges");

			if (bHasChanges) {
				sap.m.MessageBox.information(
					"Deseja mesmo cancelar? Os dados informados serão perdidos.", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						onClose: function (oAction) {
							if (oAction === "YES") {
								// this.removeRepository(sKey).then(function () {
								// 	this.navBack();
								// }.bind(this)).catch(function () {
								// 	this.navBack();
								// }.bind(this));
								oEditCropModel.setProperty("/editCropTracking", []);
								oEditCropModel.setProperty("/hasChanges", false);
								this.sKeyData = null;
								this.navBack();
							}
						}.bind(this)
					}
				);
			} else {
				this.navBack();
			}
		},

		_handlePartnerFilterPress: function () {
			var oFilterBar;
			if (!this.oPartnerFilter) {
				this.oPartnerFilter = sap.ui.xmlfragment("partnerFilterID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.prospects.fragments.PartnerFilter", this);
				this.getView().addDependent(this.oPartnerFilter);
				oFilterBar = sap.ui.core.Fragment.byId("partnerFilterID" + this.getView().getId(), "fbPartner");
				oFilterBar.attachBrowserEvent("keyup", jQuery.proxy(function (e) {
					if (e.which === 13) {
						this._onPartnerApplySearch();
					}
				}, this));
			}
			this.oPartnerFilter.getContent()[1].removeSelections();
			this.oPartnerFilter.open();
		},

		_onPartnerApplySearch: function (oEvent) {
			var oList = sap.ui.core.Fragment.byId("partnerFilterID" + this.getView().getId(), "partnerListID");
			var oFilterBar = sap.ui.core.Fragment.byId("partnerFilterID" + this.getView().getId(), "fbPartner");
			var oFilters = this._getPartnerFilters(oFilterBar);

			oList.getBinding("items").filter(oFilters);
		},

		_getPartnerFilters: function (oFilterBar) {
			var aFilterItems = oFilterBar.getAllFilterItems();
			var aFilters = [];
			for (var i = 0; i < aFilterItems.length; i++) {
				aFilters.push(new sap.ui.model.Filter({
					path: aFilterItems[i].getName(),
					operator: sap.ui.model.FilterOperator.Contains,
					value1: oFilterBar.determineControlByFilterItem(aFilterItems[i]).getValue().toUpperCase()
				}));
			}
			return aFilters;
		},

		onPartnerSelected: function (oEvent) {
			var oSource = oEvent.getSource();
			var oPartnerInput = sap.ui.core.Fragment.byId("newScheduleFragmentID" + this.getView().getId(), "inputpartnerID");
			var oPlanningModel = this.getView().getModel("editCropModel");
			var oData = oPlanningModel.getProperty("/editCropTracking");
			var SelectedPartner = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

			oData["HCP_SUPPLIER"] = SelectedPartner.HCP_REGISTER;
			oData["HCP_SUPPLIER_DESC"] = SelectedPartner.NAME1;
			// oPartnerInput.setDescription(SelectedPartner.NAME1);
			oPlanningModel.refresh();
			this._validateForm();
			this.oPartnerFilter.close();
		},

		onPartnerDialogClose: function () {
			this.oPartnerFilter.close();
		},

		validateDateRange: function () {
			var oEditModel = this.getView().getModel("editCropModel");
			var oData = oEditModel.getProperty("/editCropTracking");
			var bIsValid = true;

			if (oData["HCP_START_HRVST"] && oData["HCP_END_HRVST"] && oData["HCP_START_CROP"] && oData["HCP_END_CROP"]) {
				bIsValid = oData["HCP_START_HRVST"] > oData["HCP_START_CROP"] ? true : false;
			}

			if (!bIsValid) {
				oEditModel.setProperty("/dateValueState", "Error");
				oEditModel.setProperty("/dateValueStateText", "O Início da plantação deve ser maior que o início da colheita.");
				oEditModel.setProperty("/enableSave", false);
			} else {
				oEditModel.setProperty("/dateValueState", "None");
				oEditModel.setProperty("/dateValueStateText", null);
				this._validateForm();
			}
		},

		onPictureIconPress: function (oEvent) {
			var oSource = oEvent.getSource();
			var oCreateModel = this.getView().getModel("editCropModel");
			var oData = oCreateModel.getProperty("/editCropTracking");
			var oStageName = oSource.getParent().getFields()[0].getName();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if (bIsMobile) {
				if (device.platform === "iOS" && navigator.connection.type === "none") {
					sap.m.MessageToast.show("ação offline não compatível com seu dispositivo");
				} else {
					this.goToImages(oData, oStageName);
				}
			} else {
				this.goToImages(oData, oStageName);
			}

			// this.goToImages(oData, oStageName);
		},

		goToImages: function (okeyData, sStageName) {

			var regio = okeyData.HCP_REGIO.split("-");
			var state = okeyData.HCP_STATE.split("-");

			okeyData.HCP_REGIO = regio[0];
			okeyData.HCP_STATE = state[0];

			this.oRouter.navTo("crop.Images", {
				keyData: encodeURIComponent(JSON.stringify(okeyData)),
				stageName: sStageName,
				operation: this.operation
			}, false);
		},

		_valideInputNumber: function (oEvent) {
			var oSource = oEvent.getSource();
			var oNewValue = oSource.getValue();

			oNewValue = oNewValue.replace(/[^0-9,]/g, "");

			oSource.setValue(oNewValue);
			this._validateForm();
		},

		_validateProductionAmount: function (oEvent) {
			this._valideInputNumber(oEvent);
			this.calculateTotalProduction();
		},

		calculateTotalProduction: function () {
			var oEditModel = this.getView().getModel("editCropModel");
			var oData = oEditModel.getProperty("/editCropTracking");
			var sPlantingArea = oData["HCP_PLANTING_AREA"];
			var sProductivity = oData["HCP_PRODUCTIVITY"];

			if (sPlantingArea && sProductivity) {
				oData["HCP_TOTAL_PRODUCTION"] = oData["HCP_PLANTING_AREA"] * oData["HCP_PRODUCTIVITY"];
			} else {
				oData["HCP_TOTAL_PRODUCTION"] = 0;
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

		buildEntityPath: function (sEntityName, oEntity) {
			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity.HCP_CROP_TRACK_ID + "l)";
			}
		},

		// _verifyCommercialization: function (editModel) {
		// 	return new Promise(function (resolve, reject) {
		// 		if (editModel.HCP_COMMERCIALIZATION) {
		// 			if (editModel.HCP_COMMERCIALIZATION.HCP_CAPACITY_TYPE && editModel.HCP_COMMERCIALIZATION.HCP_CAPACITY_TYPE == 0) {
		// 				if (parseFloat(editModel.HCP_COMMERCIALIZATION.HCP_CAPACITY_TONNE) <= parseFloat(editModel.HCP_TOTAL_PRODUCTION)) {
		// 					resolve(false);
		// 				} else {
		// 					resolve(true);
		// 				}
		// 			} else {
		// 				resolve(false);
		// 			}
		// 		} else {
		// 			resolve (false);
		// 		}

				// var aFilters = [];
				// var oModel = this.getOwnerComponent().getModel();
				// var oData = editModel;
				// var regio = oData.HCP_REGIO.split("-");
				// var state = oData.HCP_STATE.split("-");

				// aFilters.push(new sap.ui.model.Filter({
				// 	path: 'HCP_CROP',
				// 	operator: sap.ui.model.FilterOperator.EQ,
				// 	value1: oData.HCP_CROP
				// }));

				// aFilters.push(new sap.ui.model.Filter({
				// 	path: 'HCP_STATE',
				// 	operator: sap.ui.model.FilterOperator.EQ,
				// 	value1: state[0]
				// }));

				// aFilters.push(new sap.ui.model.Filter({
				// 	path: 'HCP_REGIO',
				// 	operator: sap.ui.model.FilterOperator.EQ,
				// 	value1: regio[0]
				// }));

				// aFilters.push(new sap.ui.model.Filter({
				// 	path: 'HCP_MATERIAL',
				// 	operator: sap.ui.model.FilterOperator.EQ,
				// 	value1: oData.HCP_MATERIAL
				// }));

				// aFilters.push(new sap.ui.model.Filter({
				// 	path: 'HCP_PERIOD',
				// 	operator: sap.ui.model.FilterOperator.EQ,
				// 	value1: this.getWeek() + new Date().getFullYear()
				// }));

				// oModel.read("/Commercialization", {
				// 	filters: aFilters,
				// 	success: function (resultCommerc) {
				// 		// var oCommerc = resultCommerc.results;
				// 		// var hasCommerc = false;
				// 		// var sPath;

				// 		// if (oCommerc.length > 0) {

				// 		// 	if (oCommerc[0].HCP_CAPACITY_TYPE == 0) {
				// 		// 		if (parseFloat(oCommerc[0].HCP_CAPACITY_TONNE) <= parseFloat(oData.HCP_TOTAL_PRODUCTION)) {
				// 		// 			resolve(false);
				// 		// 		} else {
				// 		// 			resolve(true);
				// 		// 		}
				// 		// 	} else {
				// 		// 		resolve(false);
				// 		// 	}

				// 		// } else {
				// 		// 	resolve(false);
				// 		// }
				// 		resolve(false)

				// 	}.bind(this),
				// 	error: function () {
				// 		sap.m.MessageToast.warning("Falha ao Buscar Acompanhamentos.");
				// 	}
				// });

		// 	}.bind(this));
		// },
		
		getCentralRegion: function (oData, sPath) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var state = oData.HCP_STATE.split("-");
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_BEZEI',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: state[1]
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_ACTIVE',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: '1'
				}));

				oModel.read("/Regions", {
					filters: aFilters,
					success: function (result) {
						var oRegio = result.results;
						if (oRegio.length > 0) {

							var aCropFilters = [];

							aCropFilters.push(new sap.ui.model.Filter({
								path: 'HCP_CROP',
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oData.HCP_CROP
							}));

							aCropFilters.push(new sap.ui.model.Filter({
								path: 'HCP_STATE',
								operator: sap.ui.model.FilterOperator.EQ,
								value1: state[0]
							}));

							aCropFilters.push(new sap.ui.model.Filter({
								path: 'HCP_MATERIAL',
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oData.HCP_MATERIAL
							}));
							/*
							aCropFilters.push(new sap.ui.model.Filter({
								path: 'HCP_PERIOD',
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oData.HCP_PERIOD
							}));
							*/

							aCropFilters.push(new sap.ui.model.Filter({
								path: 'HCP_REGIO',
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oRegio[0].HCP_ID
							}));
							
							if (sPath == 'Commercialization') {
								oModel.read(`/${sPath}`, {
									filters: aCropFilters,
									sorters: [new sap.ui.model.Sorter({
										path: "HCP_COMMERC_ID",
										descending: true
									})],
									success: function (result) {
										var oCrop = result.results;
										if (oCrop.length > 0) {
											resolve(oCrop[0]);
										} else {
											resolve(oRegio[0]);
										}
									}.bind(this),
									error: function (err) {
										sap.m.MessageToast.show("Falha ao Buscar Acompanhamento.");
										reject(err);
									}
								});
							}else {
								oModel.read(`/${sPath}`, {
									filters: aCropFilters,
									sorters: [new sap.ui.model.Sorter({
										path: "HCP_CREATED_AT",
										descending: true
									})],
									success: function (result) {
										var oCrop = result.results;
										if (oCrop.length > 0) {
											resolve(oCrop[0]);
										} else {
											resolve(oRegio[0]);
										}
									}.bind(this),
									error: function (err) {
										sap.m.MessageToast.show("Falha ao Buscar Acompanhamento.");
										reject(err);
									}
								});
							}
							

						}
					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Regiões.");
						reject(err);
					}
				});

			}.bind(this));

		},
		checkCentralRegion: function (oData, regioID) {
			return new Promise(function (resolve, reject) {
				var oModel = this.getView().getModel();
				var state = oData.HCP_STATE.split("-");
				var regio = regioID.split("-");
				var aFilters = [];

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
					path: 'HCP_MATERIAL',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_MATERIAL
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_REGIO',
					operator: sap.ui.model.FilterOperator.NE,
					value1: regio[0]
				}));

				oModel.read("/Crop_Tracking", {
					urlParameters: {
						"$expand": "Crop_Track_Partner,Crop_Track_Commercialization"
					},
					sorters: [new sap.ui.model.Sorter({
						path: "HCP_CREATED_AT",
						descending: true
					})],
					filters: aFilters,
					success: function (result) {
						var oCrops = result.results;
						var oCropsResult = [];
						if (oCrops.length > 0) {
							oData.HCP_COMMERCIALIZATION = this.getView().getModel("editCropModel").getProperty("/bkpoDataCommercialization")

							var aCropData = [];
							//oCrops.push(oData);

							const map = new Map();
							for (const item of oCrops) {
								if (!map.has(item.HCP_REGIO)) {
									map.set(item.HCP_REGIO, true); // set any value to Map
									oCropsResult.push(item);
								}
							}

							for (var crop in oCropsResult) {
								if (oData.HCP_REGIO == oCropsResult[crop].HCP_REGIO) {
									oCropsResult[crop] = oData;
								}
							}

							oCrops = oCropsResult;

							var oCompareCrops = this.prepareDataBtCrops2(oCrops);

							aCropData = {
								HCP_START_CROP: oCompareCrops.HCP_START_CROP,
								HCP_END_CROP: oCompareCrops.HCP_END_CROP,
								HCP_START_HRVST: oCompareCrops.HCP_START_HRVST,
								HCP_END_HRVST: oCompareCrops.HCP_END_HRVST,
								HCP_PLANTING_AREA: parseFloat(oCompareCrops.HCP_PLANTING_AREA).toFixed(2),
								HCP_PRODUCTIVITY: parseFloat(oCompareCrops.HCP_PRODUCTIVITY).toFixed(2),
								HCP_TOTAL_PRODUCTION: parseFloat(oCompareCrops.HCP_TOTAL_PRODUCTION).toFixed(2),
								HCP_RAINFALL_LEVEL: parseFloat(oCompareCrops.HCP_RAINFALL_LEVEL).toFixed(2),
								HCP_PROD_COST: parseFloat(oCompareCrops.HCP_PROD_COST).toFixed(2),
								//CR2
								HCP_PLANTING_STAGE: parseFloat(oCompareCrops.HCP_PLANTING_STAGE).toFixed(2),
								HCP_GERMINATION_STAGE: parseFloat(oCompareCrops.HCP_GERMINATION_STAGE).toFixed(2),
								HCP_VEG_DEV_STAGE: parseFloat(oCompareCrops.HCP_VEG_DEV_STAGE).toFixed(2),
								HCP_FLOWERING_STAGE: parseFloat(oCompareCrops.HCP_FLOWERING_STAGE).toFixed(2),
								HCP_GRAIN_FORMATION_STAGE: parseFloat(oCompareCrops.HCP_GRAIN_FORMATION_STAGE).toFixed(2),
								HCP_GRAIN_FILLING_STAGE: parseFloat(oCompareCrops.HCP_GRAIN_FILLING_STAGE).toFixed(2),
								HCP_MATURATION_STAGE: parseFloat(oCompareCrops.HCP_MATURATION_STAGE).toFixed(2),
								HCP_HARVEST_STAGE: parseFloat(oCompareCrops.HCP_HARVEST_STAGE).toFixed(2),
								//CR2
								HCP_UPDATED_AT: new Date(),
								HCP_UPDATED_BY: this.userName,
								HCP_CAPACITY_PERCENT: Number(oCompareCrops.HCP_CAPACITY_PERCENT)
							};

							resolve(aCropData);
						} else {
							resolve();
						}
					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Acompanhamentos.");
						reject(err);
					}
				});

			}.bind(this));

		},

		prepareDataBtCrops2: function (oCrops) {

			var oCompareCrops = {
				HCP_PLANTING_AREA: 0,
				HCP_TOTAL_PRODUCTION: 0,
				HCP_RAINFALL_LEVEL: 0,
				HCP_PROD_COST: 0,
				HCP_PRODUCTIVITY: 0,
				//Itens CR2	
				HCP_PLANTING_STAGE: 0,
				HCP_GERMINATION_STAGE: 0,
				HCP_VEG_DEV_STAGE: 0,
				HCP_FLOWERING_STAGE: 0,
				HCP_GRAIN_FORMATION_STAGE: 0,
				HCP_GRAIN_FILLING_STAGE: 0,
				HCP_MATURATION_STAGE: 0,
				HCP_HARVEST_STAGE: 0,
				HCP_CAPACITY_PERCENT: 0
			};

			var calcTotalCropArea = Number(0);
			var calcPlanting = Number(0);
			var calcGerm = Number(0);
			var calcVeg = Number(0);
			var calcFlower = Number(0);
			var calcFormation = Number(0);
			var calcFill = Number(0);
			var calcMaturation = Number(0);
			var calcHarv = Number(0);
			let calcCommercialization = Number(0);

			for (var m = 0; m < oCrops.length; m++) {
				let dataMoreCurrent = null

				if (oCrops[m].HCP_START_CROP) {
					if (oCrops[m].HCP_START_CROP < oCompareCrops.HCP_START_CROP || oCompareCrops.HCP_START_CROP == null) {
						oCompareCrops.HCP_START_CROP = oCrops[m].HCP_START_CROP;
					}
				}

				if (oCrops[m].HCP_END_CROP) {
					if (oCrops[m].HCP_END_CROP > oCompareCrops.HCP_END_CROP || oCompareCrops.HCP_END_CROP == null) {
						oCompareCrops.HCP_END_CROP = oCrops[m].HCP_END_CROP;
					}
				}

				if (oCrops[m].HCP_START_HRVST) {
					if (oCrops[m].HCP_START_HRVST < oCompareCrops.HCP_START_HRVST || oCompareCrops.HCP_START_HRVST == null) {
						oCompareCrops.HCP_START_HRVST = oCrops[m].HCP_START_HRVST;
					}
				}

				if (oCrops[m].HCP_END_HRVST) {
					if (oCrops[m].HCP_END_HRVST > oCompareCrops.HCP_END_HRVST || oCompareCrops.HCP_END_HRVST == null) {
						oCompareCrops.HCP_END_HRVST = oCrops[m].HCP_END_HRVST;
					}
				}

				//itens CR2

				if (oCrops[m].HCP_PLANTING_STAGE) {
					if (oCrops[m].HCP_PLANTING_STAGE > oCompareCrops.HCP_PLANTING_STAGE || oCompareCrops.HCP_PLANTING_STAGE == null) {
						oCompareCrops.HCP_PLANTING_STAGE = oCrops[m].HCP_PLANTING_STAGE;
					}
				}

				if (oCrops[m].HCP_GERMINATION_STAGE) {
					if (oCrops[m].HCP_GERMINATION_STAGE > oCompareCrops.HCP_GERMINATION_STAGE || oCompareCrops.HCP_GERMINATION_STAGE == null) {
						oCompareCrops.HCP_GERMINATION_STAGE = oCrops[m].HCP_GERMINATION_STAGE;
					}
				}

				if (oCrops[m].HCP_VEG_DEV_STAGE) {
					if (oCrops[m].HCP_VEG_DEV_STAGE > oCompareCrops.HCP_VEG_DEV_STAGE || oCompareCrops.HCP_VEG_DEV_STAGE == null) {
						oCompareCrops.HCP_VEG_DEV_STAGE = oCrops[m].HCP_VEG_DEV_STAGE;
					}
				}

				if (oCrops[m].HCP_FLOWERING_STAGE) {
					if (oCrops[m].HCP_FLOWERING_STAGE > oCompareCrops.HCP_FLOWERING_STAGE || oCompareCrops.HCP_FLOWERING_STAGE == null) {
						oCompareCrops.HCP_FLOWERING_STAGE = oCrops[m].HCP_FLOWERING_STAGE;
					}
				}

				if (oCrops[m].HCP_GRAIN_FORMATION_STAGE) {
					if (oCrops[m].HCP_GRAIN_FORMATION_STAGE > oCompareCrops.HCP_GRAIN_FORMATION_STAGE || oCompareCrops.HCP_GRAIN_FORMATION_STAGE ==
						null) {
						oCompareCrops.HCP_GRAIN_FORMATION_STAGE = oCrops[m].HCP_GRAIN_FORMATION_STAGE;
					}
				}

				if (oCrops[m].HCP_GRAIN_FILLING_STAGE) {
					if (oCrops[m].HCP_GRAIN_FILLING_STAGE > oCompareCrops.HCP_GRAIN_FILLING_STAGE || oCompareCrops.HCP_GRAIN_FILLING_STAGE == null) {
						oCompareCrops.HCP_GRAIN_FILLING_STAGE = oCrops[m].HCP_GRAIN_FILLING_STAGE;
					}
				}

				if (oCrops[m].HCP_MATURATION_STAGE) {
					if (oCrops[m].HCP_MATURATION_STAGE > oCompareCrops.HCP_MATURATION_STAGE || oCompareCrops.HCP_MATURATION_STAGE == null) {
						oCompareCrops.HCP_MATURATION_STAGE = oCrops[m].HCP_MATURATION_STAGE;
					}
				}

				if (oCrops[m].HCP_HARVEST_STAGE) {
					if (oCrops[m].HCP_HARVEST_STAGE > oCompareCrops.HCP_HARVEST_STAGE || oCompareCrops.HCP_HARVEST_STAGE == null) {
						oCompareCrops.HCP_HARVEST_STAGE = oCrops[m].HCP_HARVEST_STAGE;
					}
				}

				if (oCrops[m].Crop_Track_Commercialization && oCrops[m].Crop_Track_Commercialization.results.length > 0) {
					dataMoreCurrent = oCrops[m].Crop_Track_Commercialization.results.reduce(function (prev, current) {
						return prev.HCP_UPDATED_AT > current.HCP_UPDATED_AT ? prev : current;
					});
				}

				calcTotalCropArea = Number(calcTotalCropArea + Number(oCrops[m].HCP_PLANTING_AREA)); //ha

				//calcPlanting = parseFloat(oCrops[m].HCP_PLANTING_STAGE).toFixed(2) * parseFloat(oCrops[m].HCP_TOTAL_PRODUCTION).toFixed(2);
				//oCompareCrops.HCP_PLANTING_STAGE = Number(parseFloat(oCompareCrops.HCP_PLANTING_STAGE).toFixed(2)) + Number(parseFloat(calcPlanting).toFixed(2));

				calcPlanting = parseFloat(calcPlanting) + (parseFloat(oCrops[m].HCP_PLANTING_STAGE) * parseFloat(
					oCrops[m].HCP_PLANTING_AREA)); //ha

				calcGerm = parseFloat(calcGerm) + (parseFloat(oCrops[m].HCP_GERMINATION_STAGE) * parseFloat(
					oCrops[m].HCP_PLANTING_AREA)); //ha

				calcVeg = parseFloat(calcVeg) + (parseFloat(oCrops[m].HCP_VEG_DEV_STAGE) * parseFloat(
					oCrops[m].HCP_PLANTING_AREA)); //ha

				calcFlower = parseFloat(calcFlower) + (parseFloat(oCrops[m].HCP_FLOWERING_STAGE) * parseFloat(
					oCrops[m].HCP_PLANTING_AREA)); //ha

				calcFormation = parseFloat(calcFormation) + (parseFloat(oCrops[m].HCP_GRAIN_FORMATION_STAGE) * parseFloat(
					oCrops[m].HCP_PLANTING_AREA)); //ha

				calcFill = parseFloat(calcFill) + (parseFloat(oCrops[m].HCP_GRAIN_FILLING_STAGE) * parseFloat(
					oCrops[m].HCP_PLANTING_AREA)); //ha

				calcMaturation = parseFloat(calcMaturation) + (parseFloat(oCrops[m].HCP_MATURATION_STAGE) * parseFloat(
					oCrops[m].HCP_PLANTING_AREA)); //ha

				calcHarv = parseFloat(calcHarv) + (parseFloat(oCrops[m].HCP_HARVEST_STAGE) * parseFloat(
					oCrops[m].HCP_PLANTING_AREA)); //ha

				if (oCrops[m].HCP_COMMERCIALIZATION) {
					let calcTotalTonne = (Number(oCrops[m].HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT) / 100) * Number(oCrops[m].HCP_TOTAL_PRODUCTION)
					calcCommercialization = Number(calcCommercialization) + Number(calcTotalTonne)

					delete oCrops[m].HCP_COMMERCIALIZATION
				} else if (dataMoreCurrent) {
					calcCommercialization = Number(calcCommercialization) + Number(dataMoreCurrent.HCP_CAPACITY_TONNE)
				}
				//Fecha itens CR2

				oCompareCrops.HCP_PLANTING_AREA = parseFloat(oCompareCrops.HCP_PLANTING_AREA) + parseFloat(oCrops[m].HCP_PLANTING_AREA);
				oCompareCrops.HCP_TOTAL_PRODUCTION = Number(parseFloat(oCompareCrops.HCP_TOTAL_PRODUCTION).toFixed(2)) + Number(parseFloat(oCrops[
					m].HCP_TOTAL_PRODUCTION).toFixed(2));
				oCompareCrops.HCP_RAINFALL_LEVEL = parseFloat(oCompareCrops.HCP_RAINFALL_LEVEL) + parseFloat(oCrops[m].HCP_RAINFALL_LEVEL);
				oCompareCrops.HCP_PROD_COST = parseFloat(oCompareCrops.HCP_PROD_COST) + parseFloat(oCrops[m].HCP_PROD_COST);
			}

			oCompareCrops.HCP_PRODUCTIVITY = parseFloat(oCompareCrops.HCP_TOTAL_PRODUCTION) / parseFloat(oCompareCrops.HCP_PLANTING_AREA);
			oCompareCrops.HCP_RAINFALL_LEVEL = parseFloat(oCompareCrops.HCP_RAINFALL_LEVEL) / oCrops.length;
			oCompareCrops.HCP_PROD_COST = parseFloat(oCompareCrops.HCP_PROD_COST) / oCrops.length;

			//CR2
			oCompareCrops.HCP_PLANTING_STAGE = (Number(parseFloat(calcPlanting)) / Number(parseFloat(calcTotalCropArea))); //%
			oCompareCrops.HCP_GERMINATION_STAGE = (Number(parseFloat(calcGerm)) / Number(parseFloat(calcTotalCropArea))); //%
			oCompareCrops.HCP_VEG_DEV_STAGE = (Number(parseFloat(calcVeg)) / Number(parseFloat(calcTotalCropArea))); //%
			oCompareCrops.HCP_FLOWERING_STAGE = (Number(parseFloat(calcFlower)) / Number(parseFloat(calcTotalCropArea))); //%
			oCompareCrops.HCP_GRAIN_FORMATION_STAGE = (Number(parseFloat(calcFormation)) / Number(parseFloat(calcTotalCropArea))); //%
			oCompareCrops.HCP_GRAIN_FILLING_STAGE = (Number(parseFloat(calcFill)) / Number(parseFloat(calcTotalCropArea))); //%
			oCompareCrops.HCP_MATURATION_STAGE = (Number(parseFloat(calcMaturation)) / Number(parseFloat(calcTotalCropArea))); //%
			oCompareCrops.HCP_HARVEST_STAGE = (Number(parseFloat(calcHarv)) / Number(parseFloat(calcTotalCropArea))); //%
			oCompareCrops.HCP_CAPACITY_PERCENT = ((Number(calcCommercialization) / Number(oCompareCrops.HCP_TOTAL_PRODUCTION)) * 100); //%
			//Fecha itens CR2

			return oCompareCrops;
		},
		
		roundingRule: function (valor) {
			const parteDecimal = valor - Math.floor(valor);
			 
		    if (parteDecimal >= 0.5)
		    	return Math.ceil(valor);
		    else
		    	return Math.floor(valor);
		},

		_getCommercialization: function (aData,oPropertiesEdit) {
			return new Promise(async function (resolve, reject) {

				var aFilters = [];
				var oModel = this.getOwnerComponent().getModel();
				var oEditModel = this.getView().getModel("editCropModel");
				var oData = oEditModel.getProperty("/editCropTracking");
				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;

				var regio = oData.HCP_REGIO.split("-");
				var state = oData.HCP_STATE.split("-");

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_CROP',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_CROP.toString()
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

				await oModel.read("/Commercialization", {
					filters: aFilters,
					sorters: [new sap.ui.model.Sorter("HCP_COMMERC_ID", true)],
					success: function (resultCommerc) {
						var oResults = resultCommerc.results;
						// var oEditModel = this.getView().getModel("editCropModel");
						// var oData = oEditModel.getProperty("/editCropTracking");
						var sTimestamp = new Date().getTime();

						let percentCommercialized = oData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT
						let capacityTonne = (percentCommercialized / 100) * Number(aData.HCP_TOTAL_PRODUCTION)
						let totalAvailable = Number(aData.HCP_TOTAL_PRODUCTION) - capacityTonne
						
						capacityTonne = this.roundingRule(capacityTonne)
						totalAvailable = this.roundingRule(totalAvailable)
						let totalProduction = this.roundingRule(Number(aData.HCP_TOTAL_PRODUCTION))

						if (oResults.length > 0) {
							var aDataCommerc = {
								HCP_CAPACITY_PERCENT: parseFloat(percentCommercialized).toFixed(2),
								HCP_CAPACITY_TONNE: capacityTonne.toString(),
								HCP_CAPACITY_TYPE: oResults[0].HCP_CAPACITY_TYPE,
								HCP_COMMERC_ID: oResults[0].HCP_COMMERC_ID,
								HCP_CREATED_AT: oResults[0].HCP_CREATED_AT,
								HCP_CREATED_BY: oResults[0].HCP_CREATED_BY,
								HCP_CROP: oResults[0].HCP_CROP,
								HCP_MATERIAL: oResults[0].HCP_MATERIAL,
								HCP_NEGO_REPORT_ID: oResults[0].HCP_NEGO_REPORT_ID,
								HCP_PERIOD: oResults[0].HCP_PERIOD,
								HCP_PLATAFORM: oResults[0].HCP_PLATAFORM,
								HCP_REGIO: oResults[0].HCP_REGIO,
								HCP_STATE: oResults[0].HCP_STATE,
								HCP_TEXT: oResults[0].HCP_TEXT,
								HCP_TOTAL: totalAvailable.toString(),
								HCP_TOTAL_CROP_TRACK: totalProduction.toString(),
								HCP_TOTAL_NEGOTIATION: oResults[0].HCP_TOTAL_NEGOTIATION,
								HCP_TOTAL_NEGOTIATION_PERCENT: parseFloat(oResults[0].HCP_TOTAL_NEGOTIATION_PERCENT).toFixed(2),
								HCP_UPDATED_AT: this._formatDate(new Date()),
								HCP_UPDATED_BY: this.userName
							};

							//CALCULATE NEGOTIATION
							var calcPercentNegotiation = aDataCommerc.HCP_TOTAL_NEGOTIATION ? aDataCommerc.HCP_TOTAL_NEGOTIATION : "0" / aDataCommerc.HCP_TOTAL_CROP_TRACK;
							aDataCommerc.HCP_TOTAL_NEGOTIATION_PERCENT = parseFloat((calcPercentNegotiation * 100).toFixed(2));
							aDataCommerc.HCP_TOTAL_NEGOTIATION_PERCENT = parseFloat(aDataCommerc.HCP_TOTAL_NEGOTIATION_PERCENT).toFixed(2);

							let sPath = `/Commercialization(${aDataCommerc.HCP_COMMERC_ID}l)`;

							oModel.update(sPath, aDataCommerc, {
								groupId: "changes"
							});

							if ((bIsMobile && navigator.connection.type !== "none")) {

								oModel.submitChanges({
									groupId: "changes",
									success: function () {
										this.flushStore("Crop_Track_Partner,Crop_Track_Material,Crop_Track_Region,Crop_Track_Crop_Year,Crop_Track_Commercialization,Commercialization,Regions,Negotiation_Report").then(function () {
											this.refreshStore("Crop_Tracking", "Commercialization","Regions","Negotiation_Report").then(function () {
												resolve();
											}.bind(this));
										}.bind(this));
									}.bind(this),
									error: function () {
										reject();
									}.bind(this)
								});
							} else {
								oModel.submitChanges({
									groupId: "changes",
									success: function () {
										resolve();
									}.bind(this),
									error: function () {
										reject();
									}.bind(this)
								});
							}
							resolve();

						} else {
							let that = this

							this.getNegotiationReport(oData).then(function (result) {
								let totalNegociationPercent = "0.00";

								if (result) {
									let calcPercentNegotiation = result.HCP_TOTAL_NEGOTIATION ? result.HCP_TOTAL_NEGOTIATION : "0" / oPropertiesEdit.HCP_TOTAL_PRODUCTION;
									totalNegociationPercent = parseFloat((calcPercentNegotiation * 100).toFixed(2)).toFixed(2);
								}

								let aDataCommercialization = {
									HCP_COMMERC_ID: sTimestamp.toFixed(),
									HCP_CROP: oData.HCP_CROP_ID ? oData.HCP_CROP_ID.toString() : oData.HCP_CROP.toString(),
									HCP_STATE: oData.HCP_STATE.split("-")[0],
									HCP_REGIO: oData.HCP_REGIO.split("-")[0],
									HCP_MATERIAL: oData.HCP_MATERIAL,
									HCP_CAPACITY_TONNE: capacityTonne.toString(),
									HCP_CAPACITY_PERCENT: parseFloat(percentCommercialized).toFixed(2),
									HCP_NEGO_REPORT_ID: result ? result.HCP_NEGO_REPORT_ID : "0",
									HCP_TOTAL_NEGOTIATION: result ? result.HCP_TOTAL_NEGOTIATION : "0",
									HCP_TOTAL_NEGOTIATION_PERCENT: totalNegociationPercent,
									HCP_TOTAL_CROP_TRACK: totalProduction.toString(),
									HCP_TOTAL: totalAvailable.toString(),
									HCP_TEXT: "",
									HCP_PERIOD: that.getWeek() + new Date().getFullYear(),
									HCP_CAPACITY_TYPE: "0",
									HCP_PLATAFORM: bIsMobile ? '1' : '2',
									HCP_CREATED_BY: that.userName,
									HCP_UPDATED_BY: that.userName,
									HCP_UPDATED_AT: that._formatDate(new Date()),
									HCP_CREATED_AT: that._formatDate(new Date())
								};

								oModel.createEntry("/Commercialization", {
									properties: aDataCommercialization
								}, {
									groupId: "changes"
								});

								if ((bIsMobile && navigator.connection.type !== "none")) {
									oModel.submitChanges({
										groupId: "changes",
										success: function () {
											that.flushStore("Crop_Track_Partner,Crop_Track_Material,Crop_Track_Region,Crop_Track_Crop_Year,Crop_Track_Commercialization,Commercialization,Regions,Negotiation_Report").then(function () {
												that.refreshStore("Crop_Tracking", "Commercialization","Regions","Negotiation_Report").then(function () {}.bind(that));
											}.bind(that));
										}.bind(that)
									});
								} else {
									oModel.submitChanges({
										groupId: "changes"
									});
								}
							})
							resolve();
						}
					}.bind(this),
					error: function () {
						reject();
					}
				});

			}.bind(this));
		},

		_onUpsertCentralRegioCommercialization: async function (oData, oPropertiesEdit) {
			var oModel = this.getView().getModel();
			var sTimestamp = new Date().getTime();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			oData.HCP_STATE = oData.fullNameState
			let that = this;

			await this.getCentralRegion(oData, "Commercialization").then(function (regioCenterCommecialization) {
				if (regioCenterCommecialization.HCP_COMMERC_ID) {
					let sCommecializationCrop = `/Commercialization(${regioCenterCommecialization.HCP_COMMERC_ID}l)`;

					let percentCommercialized = Number(oPropertiesEdit.HCP_CAPACITY_PERCENT)
					let capacityTonne = (percentCommercialized / 100) * oPropertiesEdit.HCP_TOTAL_PRODUCTION
					let totalAvailable = oPropertiesEdit.HCP_TOTAL_PRODUCTION - capacityTonne
					
					capacityTonne = that.roundingRule(capacityTonne)
					totalAvailable = that.roundingRule(totalAvailable)
					let totalProduction = that.roundingRule(oPropertiesEdit.HCP_TOTAL_PRODUCTION)

					if (regioCenterCommecialization.HCP_PERIOD == that.getWeek() + new Date().getFullYear()) {
						let calcPercentNegotiation = regioCenterCommecialization.HCP_TOTAL_NEGOTIATION ? regioCenterCommecialization.HCP_TOTAL_NEGOTIATION : "0" / oPropertiesEdit.HCP_TOTAL_PRODUCTION;
						regioCenterCommecialization.HCP_TOTAL_NEGOTIATION_PERCENT = parseFloat((calcPercentNegotiation * 100).toFixed(2)).toFixed(2);

						let aDataCommercialization = {
							HCP_CAPACITY_PERCENT: parseFloat(percentCommercialized).toFixed(2),
							HCP_CAPACITY_TONNE: capacityTonne.toString(),
							HCP_CAPACITY_TYPE: regioCenterCommecialization.HCP_CAPACITY_TYPE,
							HCP_COMMERC_ID: regioCenterCommecialization.HCP_COMMERC_ID,
							HCP_CREATED_AT: regioCenterCommecialization.HCP_CREATED_AT,
							HCP_CREATED_BY: regioCenterCommecialization.HCP_CREATED_BY,
							HCP_CROP: regioCenterCommecialization.HCP_CROP.toString(),
							HCP_MATERIAL: regioCenterCommecialization.HCP_MATERIAL,
							HCP_NEGO_REPORT_ID: regioCenterCommecialization.HCP_NEGO_REPORT_ID,
							HCP_PERIOD: regioCenterCommecialization.HCP_PERIOD,
							HCP_PLATAFORM: regioCenterCommecialization.HCP_PLATAFORM,
							HCP_REGIO: regioCenterCommecialization.HCP_REGIO,
							HCP_STATE: regioCenterCommecialization.HCP_STATE,
							HCP_TEXT: regioCenterCommecialization.HCP_TEXT,
							HCP_TOTAL: totalAvailable.toString(),
							HCP_TOTAL_CROP_TRACK: totalProduction.toString(),
							HCP_TOTAL_NEGOTIATION: regioCenterCommecialization.HCP_TOTAL_NEGOTIATION,
							HCP_TOTAL_NEGOTIATION_PERCENT: parseFloat(regioCenterCommecialization.HCP_TOTAL_NEGOTIATION_PERCENT).toFixed(2),
							HCP_UPDATED_AT: that._formatDate(new Date()),
							HCP_UPDATED_BY: that.userName
						};

						oModel.update(sCommecializationCrop, aDataCommercialization, {
							groupId: "changes"
						});

						if ((bIsMobile && navigator.connection.type !== "none")) {
							oModel.submitChanges({
								groupId: "changes",
								success: function () {
									that.flushStore("Crop_Track_Partner,Crop_Track_Material,Crop_Track_Region,Crop_Track_Crop_Year,Crop_Track_Commercialization,Commercialization,Regions,Negotiation_Report").then(function () {
										that.refreshStore("Crop_Tracking", "Commercialization","Regions","Negotiation_Report").then(function () {}.bind(that));
									}.bind(that));
								}.bind(that)
							});
						} else {
							oModel.submitChanges({
								groupId: "changes"
							});
						}
					} else {
						that.getNegotiationReport(regioCenterCommecialization).then(function (result) {
							let totalNegociationPercent = "0.00";

							if (result) {
								let calcPercentNegotiation = result.HCP_TOTAL_NEGOTIATION ? result.HCP_TOTAL_NEGOTIATION : "0" / oPropertiesEdit.HCP_TOTAL_PRODUCTION;
								totalNegociationPercent = parseFloat((calcPercentNegotiation * 100).toFixed(2)).toFixed(2);
							}

							let aDataCommercialization = {
								HCP_COMMERC_ID: sTimestamp.toFixed(),
								HCP_CROP: regioCenterCommecialization.HCP_CROP.toString(),
								HCP_STATE: regioCenterCommecialization.HCP_STATE,
								HCP_REGIO: regioCenterCommecialization.HCP_REGIO,
								HCP_MATERIAL: regioCenterCommecialization.HCP_MATERIAL,
								HCP_CAPACITY_TONNE: capacityTonne.toString(),
								HCP_CAPACITY_PERCENT: parseFloat(percentCommercialized).toFixed(2),
								HCP_NEGO_REPORT_ID: result ? result.HCP_NEGO_REPORT_ID : "0",
								HCP_TOTAL_NEGOTIATION: result ? result.HCP_TOTAL_NEGOTIATION : "0",
								HCP_TOTAL_NEGOTIATION_PERCENT: totalNegociationPercent,
								HCP_TOTAL_CROP_TRACK: totalProduction.toString(),
								HCP_TOTAL: totalAvailable.toString(),
								HCP_TEXT: "",
								HCP_PERIOD: that.getWeek() + new Date().getFullYear(),
								HCP_CAPACITY_TYPE: regioCenterCommecialization.HCP_CAPACITY_TYPE,
								HCP_PLATAFORM: bIsMobile ? '1' : '2',
								HCP_CREATED_BY: that.userName,
								HCP_UPDATED_BY: that.userName,
								HCP_UPDATED_AT: that._formatDate(new Date()),
								HCP_CREATED_AT: that._formatDate(new Date())
							};

							oModel.createEntry("/Commercialization", {
								properties: aDataCommercialization
							}, {
								groupId: "changes"
							});

							if ((bIsMobile && navigator.connection.type !== "none")) {
								oModel.submitChanges({
									groupId: "changes",
									success: function () {
										that.flushStore("Crop_Track_Partner,Crop_Track_Material,Crop_Track_Region,Crop_Track_Crop_Year,Crop_Track_Commercialization,Commercialization,Regions,Negotiation_Report").then(function () {
											that.refreshStore("Crop_Tracking", "Commercialization","Regions","Negotiation_Report").then(function () {}.bind(that));
										}.bind(that));
									}.bind(that)
								});
							} else {
								oModel.submitChanges({
									groupId: "changes"
								});
							}
						})
					}
				} else {
					let dataToGetCenterCommerc = {
						HCP_CROP: oData.HCP_CROP_ID ? oData.HCP_CROP_ID : oData.HCP_CROP,
						HCP_STATE: regioCenterCommecialization.HCP_BLAND,
						HCP_REGIO: regioCenterCommecialization.HCP_ID,
						HCP_MATERIAL: oData.HCP_MATERIAL
					}

					that.getNegotiationReport(dataToGetCenterCommerc).then(function (result) {
						let percentCommercialized = Number(oPropertiesEdit.HCP_CAPACITY_PERCENT)
						
						let capacityTonne = (percentCommercialized / 100) * oPropertiesEdit.HCP_TOTAL_PRODUCTION
						let totalAvailable = oPropertiesEdit.HCP_TOTAL_PRODUCTION - capacityTonne
						let totalNegociationPercent = "0.00";
						
						capacityTonne = that.roundingRule(capacityTonne)
						totalAvailable = that.roundingRule(totalAvailable)
						let totalProduction = that.roundingRule(oPropertiesEdit.HCP_TOTAL_PRODUCTION)

						if (result) {
							let calcPercentNegotiation = result.HCP_TOTAL_NEGOTIATION ? result.HCP_TOTAL_NEGOTIATION : "0" / oPropertiesEdit.HCP_TOTAL_PRODUCTION;
							totalNegociationPercent = parseFloat((calcPercentNegotiation * 100).toFixed(2)).toFixed(2);
						}

						let aDataCommercialization = {
							HCP_COMMERC_ID: sTimestamp.toFixed(),
							HCP_CROP: oData.HCP_CROP_ID ? oData.HCP_CROP_ID.toString() : oData.HCP_CROP.toString(),
							HCP_STATE: regioCenterCommecialization.HCP_BLAND,
							HCP_REGIO: regioCenterCommecialization.HCP_ID,
							HCP_MATERIAL: oData.HCP_MATERIAL,
							HCP_CAPACITY_TONNE: capacityTonne.toString(),
							HCP_CAPACITY_PERCENT: parseFloat(percentCommercialized).toFixed(2),
							HCP_NEGO_REPORT_ID: result ? result.HCP_NEGO_REPORT_ID : "0",
							HCP_TOTAL_NEGOTIATION: result ? result.HCP_TOTAL_NEGOTIATION : "0",
							HCP_TOTAL_NEGOTIATION_PERCENT: totalNegociationPercent,
							HCP_TOTAL_CROP_TRACK: totalProduction.toString(),
							HCP_TOTAL: totalAvailable.toString(),
							HCP_TEXT: "",
							HCP_PERIOD: that.getWeek() + new Date().getFullYear(),
							HCP_CAPACITY_TYPE: "0",
							HCP_PLATAFORM: bIsMobile ? '1' : '2',
							HCP_CREATED_BY: that.userName,
							HCP_UPDATED_BY: that.userName,
							HCP_UPDATED_AT: that._formatDate(new Date()),
							HCP_CREATED_AT: that._formatDate(new Date())
						};

						oModel.createEntry("/Commercialization", {
							properties: aDataCommercialization
						}, {
							groupId: "changes"
						});

						if ((bIsMobile && navigator.connection.type !== "none")) {
							oModel.submitChanges({
								groupId: "changes",
								success: function () {
									that.flushStore("Crop_Track_Partner,Crop_Track_Material,Crop_Track_Region,Crop_Track_Crop_Year,Crop_Track_Commercialization,Commercialization,Regions,Negotiation_Report").then(function () {
										that.refreshStore("Crop_Tracking", "Commercialization","Regions","Negotiation_Report").then(function () {}.bind(that));
									}.bind(that));
								}.bind(that)
							});
						} else {
							oModel.submitChanges({groupId: "changes"});
						}
					})
				}

			})
		},

		getNegotiationReport: function (props) {
			return new Promise(function (resolve, reject) {
				var oModel = this.getView().getModel();

				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_CROP',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: props.HCP_CROP
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_STATE',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: props.HCP_STATE.split("-")[0]
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_MATERIAL',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: props.HCP_MATERIAL
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_REGIO',
					operator: sap.ui.model.FilterOperator.NE,
					value1: props.HCP_REGIO.split("-")[0]
				}));

				oModel.read("/Negotiation_Report", {
					filters: aFilters,
					success: function (result) {
						var negociation = result.results;
						if (negociation.length > 0) {
							resolve(negociation[0]);
						} else {
							resolve();
						}
					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Relato de Negociação.");
						reject(err);
					}
				});

			}.bind(this));
		}

	});
});