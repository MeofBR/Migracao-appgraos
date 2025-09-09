/* global cordova */
sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.crop.Create", {
		formatter: formatter,
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("crop.Create").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableSave: false,
				stagesValid: false,
				totalPercentageCount: 0,
				totalPercentageState: "Neutral",
				minDate: new Date(),
				dateValueState: "None",
				dateValueStateText: null,
				repositoryCreated: false,
				alredyInitialized: false,
				hasChanges: false,
				maturationAboveHarvest: false,
				iconColor: "green",
			}), "createCropModel");

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				create: true,
				edit: true
			}), "profileModel");
		},

		handleRouteMatched: function (oEvent) {
			var oCreateModel = this.getView().getModel("createCropModel");
			var oModel = this.getView().getModel();
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

			if (oEvent.getParameter("data")) {
				if (this.sKeydata !== oEvent.getParameter("data").keyData) {
					this.sKeydata = oEvent.getParameter("data").keyData;
					this.sOperation = oEvent.getParameter("data").operation;
					this.filterData = oEvent.getParameter("data").filterData;
					var aKeyData = JSON.parse(decodeURIComponent(this.sKeydata));
					var oFilterData = JSON.parse(decodeURIComponent(this.filterData));
					var oData;
					var oSupplierData;
					var regio;
					var state;

					var aStageData = {
						HCP_PLANTING_STAGE: 0,
						HCP_GERMINATION_STAGE: 0,
						HCP_VEG_DEV_STAGE: 0,
						HCP_FLOWERING_STAGE: 0,
						HCP_GRAIN_FORMATION_STAGE: 0,
						HCP_GRAIN_FILLING_STAGE: 0,
						HCP_MATURATION_STAGE: 0,
						HCP_HARVEST_STAGE: 0
					};

					oCreateModel.setData({
						enableSave: false,
						stagesValid: false,
						cropCondition: false,
						cropTechnology: false,
						totalPercentageCount: 0,
						totalPercentageState: "Neutral",
						minDate: new Date(),
						dateValueState: "None",
						dateValueStateText: null,
						repositoryCreated: false,
						hasChanges: false,
						maturationAboveHarvest: false,
						isEnable: true,
						iconColor: "green"
					});

					if (this.sOperation === "New") {
						for (var stage in aStageData) {
							aKeyData[stage] = aStageData[stage];
						}

						if (aKeyData.HCP_COMMERCIALIZATION) {
							aKeyData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT = Number(aKeyData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT)
							aKeyData["HCP_COMMERCIALIZATION"] = aKeyData.HCP_COMMERCIALIZATION
							aKeyData.HCP_TOTAL_PRODUCTION = aKeyData.HCP_COMMERCIALIZATION.HCP_TOTAL_CROP_TRACK
						} else {
							let HCP_COMMERCIALIZATION = {
								HCP_CAPACITY_PERCENT: 0
							}

							aKeyData["HCP_COMMERCIALIZATION"] = HCP_COMMERCIALIZATION
						}

						aKeyData["HCP_PERIOD"] = this.getWeek() + new Date().getFullYear();
						aKeyData["HCP_CROP_TRACK_ID"] = null;
						oCreateModel.setProperty("/newCropTracking", aKeyData);
						aKeyData["HCP_UNIQUE_KEY"] = this.generateUniqueKey();
						aKeyData["HCP_OLD_STATE"] = aKeyData["HCP_STATE"].split("-")[0];
						aKeyData["HCP_OLD_REGIO"] = aKeyData["HCP_REGIO"].split("-")[0];
					} else if (this.sOperation === "Copy") {
						oData = oModel.getProperty(aKeyData);
						if (oData.HCP_SUPPLIER) {
							if (oData.Crop_Track_Partner) {
								oSupplierData = oModel.getProperty("/" + oData.Crop_Track_Partner.__ref);
								oData["HCP_SUPPLIER_DESC"] = oSupplierData.NAME1;
							}
						}
						// oSupplierData = oModel.getProperty("/" + oData.Crop_Track_Partner.__ref);
						// oData["HCP_SUPPLIER_DESC"] = oSupplierData.NAME1;
						oData["HCP_PERIOD"] = this.getWeek() + new Date().getFullYear();
						oData["HCP_OLD_STATE"] = oData["HCP_STATE"];
						oData["HCP_OLD_REGIO"] = oData["HCP_REGIO"];
						oData["HCP_STATE"] = oFilterData.HCP_STATE;
						oData["HCP_REGIO"] = oFilterData.HCP_REGIO;
						oData["HCP_CROP_TRACK_ID"] = null;
						oData["HCP_PLANTING_STAGE_IMGCOUNT"] = 0;
						oData["HCP_GERMINATION_STAGE_IMGCOUNT"] = 0;
						oData["HCP_VEG_DEV_STAGE_IMGCOUNT"] = 0;
						oData["HCP_FLOWERING_STAGE_IMGCOUNT"] = 0;
						oData["HCP_GRAIN_FORMATION_STAGE_IMGCOUNT"] = 0;
						oData["HCP_GRAIN_FILLING_STAGE_IMGCOUNT"] = 0;
						oData["HCP_MATURATION_STAGE_IMGCOUNT"] = 0;
						oData["HCP_HARVEST_STAGE_IMGCOUNT"] = 0;
						
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

						state = oData.HCP_STATE.split("-");
						regio = oData.HCP_REGIO.split("-");

						oCreateModel.setProperty("/enableSave", true);

						if (state[1] == regio[1]) {
							oCreateModel.setProperty("/isEnable", false);
						} else {
							oCreateModel.setProperty("/isEnable", true);
						}

						if (!oCreateModel.getProperty("/isEnable")) {

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
										oCreateModel.setProperty("/isEnable", false);
									} else {
										oCreateModel.setProperty("/isEnable", true);
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

									console.log(oData);
									oCreateModel.setProperty("/newCropTracking", oData);

									oCreateModel.setProperty("/repositoryCreated", false);
									this.onStagesChange();
									// this.setIconColor();
									this._clearFocus();

								}.bind(this),
								error: function (err) {
									sap.m.MessageToast.show("Falha ao Buscar Acompanhamentos.");
								}
							});
						} else {

							oData["HCP_PLANTING_STAGE"] = parseFloat(oData["HCP_PLANTING_STAGE"]);
							oData["HCP_GERMINATION_STAGE"] = parseFloat(oData["HCP_GERMINATION_STAGE"]);
							oData["HCP_VEG_DEV_STAGE"] = parseFloat(oData["HCP_VEG_DEV_STAGE"]);
							oData["HCP_FLOWERING_STAGE"] = parseFloat(oData["HCP_FLOWERING_STAGE"]);
							oData["HCP_GRAIN_FORMATION_STAGE"] = parseFloat(oData["HCP_GRAIN_FORMATION_STAGE"]);
							oData["HCP_GRAIN_FILLING_STAGE"] = parseFloat(oData["HCP_GRAIN_FILLING_STAGE"]);
							oData["HCP_MATURATION_STAGE"] = parseFloat(oData["HCP_MATURATION_STAGE"]);
							oData["HCP_HARVEST_STAGE"] = parseFloat(oData["HCP_HARVEST_STAGE"]);

							oCreateModel.setProperty("/newCropTracking", oData);

							oCreateModel.setProperty("/repositoryCreated", false);
							oCreateModel.setProperty("/enableSave", true);
							this.onStagesChange();
							// this.setIconColor();
							this._clearFocus();
						}

					} else if (this.sOperation === "NewGeral") {
						regio = aKeyData.HCP_REGIO.split("-");
						oCreateModel.setProperty("/newCropTracking/HCP_STATE", aKeyData.HCP_STATE);
						oCreateModel.setProperty("/newCropTracking/HCP_REGIO", aKeyData.HCP_REGIO);
						oCreateModel.setProperty("/enableSave", true);

						this.regio = regio[0];
						this.getGeralInf(aKeyData, aStageData);
					}
				} else {
					var aKeyData = JSON.parse(decodeURIComponent(this.sKeydata));
					var oFilterData = JSON.parse(decodeURIComponent(this.filterData));
					var oData = oCreateModel.getProperty("/newCropTracking");
					
					if (!aKeyData.HCP_COMMERCIALIZATION) {
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

					if (this.sOperation === "Copy") {
						oData["HCP_PERIOD"] = this.getWeek() + new Date().getFullYear();
						oData["HCP_CROP_TRACK_ID"] = null;
					}

					if (this.sOperation === "New") {
						oData["HCP_UNIQUE_KEY"] = this.generateUniqueKey();
						oData["HCP_CROP_TRACK_ID"] = null;
					}

					oData["HCP_OLD_STATE"] = oData["HCP_STATE"];
					oData["HCP_OLD_REGIO"] = oData["HCP_REGIO"];

					if ((oFilterData.HCP_STATE !== null && oFilterData.HCP_STATE !== undefined) && (oFilterData.HCP_REGIO !== null && oFilterData.HCP_REGIO !==
							undefined)) {
						oCreateModel.setProperty("/newCropTracking/HCP_STATE", oFilterData.HCP_STATE);
						oCreateModel.setProperty("/newCropTracking/HCP_REGIO", oFilterData.HCP_REGIO);
					} else {
						if (aKeyData) {
							oCreateModel.setProperty("/newCropTracking/HCP_STATE", aKeyData.HCP_STATE);
							oCreateModel.setProperty("/newCropTracking/HCP_REGIO", aKeyData.HCP_REGIO);
						}
					}

					oCreateModel.setProperty("/repositoryCreated", false);
					this.onStagesChange();
					// this.setIconColor();
					this._clearFocus();

				}

			}
		},

		_clearFocus: function () {
			document.addEventListener('touchend', function (e) {
				//Remove os campos ativos do focmulario
				document.activeElement.blur();

			});
		},
		setIconColor: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var oCreateModel = this.getView().getModel("createCropModel");

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				oCreateModel.setProperty("/iconColor", "green");
			} else {
				oCreateModel.setProperty("/iconColor", "grey");
			}
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
				var oCreateModel = this.getView().getModel("createCropModel");
				let enableSave = true;

				oCreateModel.setProperty("/hasChanges", true);

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required) {
						var sValue = oControl.getValue();
						if (!sValue || oControl.getValueState() !== 'None') {
							enableSave = false;
							return;
						}
					}
				}
				
				if(this.firstLoad || oCreateModel?.oData?.newCropTracking?.HCP_STATE?.split("-")[1] == oCreateModel?.oData?.newCropTracking?.HCP_REGIO?.split("-")[1]){
					oCreateModel.setProperty("/enableSave", false);
					this.firstLoad = false;
				}	
				else
					oCreateModel.setProperty("/enableSave", enableSave);
					
				this._validateStages();
			}.bind(this), 100);
		},

		_validateStages: function () {
			var oEditModel = this.getView().getModel("createCropModel");
			var sPercentageStage = oEditModel.getProperty("/totalPercentageCount");
			var sMaturationAboveHarvest = oEditModel.getProperty("/maturationAboveHarvest");
			var bIsAboveOneHundred = sPercentageStage > 100 || sPercentageStage === 0 ? true : false;
			var bIsOneHundred = sPercentageStage === 100 ? true : false;

			if (bIsAboveOneHundred) {
				oEditModel.setProperty("/stagesValid", false);
			} else {
				if (bIsOneHundred) {
					//this._validateForm();
					oEditModel.setProperty("/stagesValid", true);
				} else {
					oEditModel.setProperty("/stagesValid", false);
				}

			}
		},

		_showMessageToastStages: function () {
			var oEditModel = this.getView().getModel("createCropModel");
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

		onStagesChange: function (oEvent) {
			var oModel = this.getView().getModel("createCropModel");
			var oData = oModel.getProperty("/newCropTracking");
			// var sCount = (oData["HCP_GERMINATION_STAGE"] || 0) + (oData["HCP_VEG_DEV_STAGE"] || 0) + (oData["HCP_FLOWERING_STAGE"] || 0) + (
			// 	oData["HCP_GRAIN_FORMATION_STAGE"] || 0) + (oData["HCP_GRAIN_FILLING_STAGE"] || 0) + (oData["HCP_MATURATION_STAGE"] || 0) + (
			// 	oData["HCP_HARVEST_STAGE"] || 0);
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

		_getFormFields: function () {
			var oMainDataForm = this.byId("cropCreateFormID").getContent();
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

		validateDateRange: function () {
			var oCreateModel = this.getView().getModel("createCropModel");
			var oData = oCreateModel.getProperty("/newCropTracking");
			var bIsValid = true;

			if (oData["HCP_START_HRVST"] && oData["HCP_END_HRVST"] && oData["HCP_START_CROP"] && oData["HCP_END_CROP"]) {
				bIsValid = oData["HCP_START_HRVST"] > oData["HCP_START_CROP"] ? true : false;
			}

			if (!bIsValid) {
				oCreateModel.setProperty("/dateValueState", "Error");
				oCreateModel.setProperty("/dateValueStateText", "O Início da plantação deve ser maior que o início da colheita.");
				oCreateModel.setProperty("/enableSave", false);
			} else {
				oCreateModel.setProperty("/dateValueState", "None");
				oCreateModel.setProperty("/dateValueStateText", null);
				this._validateForm();
			}
		},

		onPlantingDateRangeChange: function (oEvent) {
			var oSource = oEvent.getSource();
			var oCreateModel = this.getView().getModel("createCropModel");
			var oData = oCreateModel.getProperty("/newCropTracking");

			this._validateForm();
		},

		onCropDateRangeChange: function (oEvent) {
			var oSource = oEvent.getSource();
			var oCreateModel = this.getView().getModel("createCropModel");
			var oData = oCreateModel.getProperty("/newCropTracking");

			if (oData["HCP_START_HRVST"] && oData["HCP_END_HRVST"]) {
				var bIsValid = this.validateDateRange(oData["HCP_START_HRVST"], oData["HCP_END_HRVST"]);
				if (!bIsValid) {
					oSource.setValueState("Error");
				} else {
					oSource.setValueState("None");
				}
			}
			this._validateForm();
		},

		_onSave: function (oEvent) {
			var aUserName = this.userName;
			var sTimestamp = new Date().getTime();
			var oSource = oEvent.getSource();
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var aDeferredGroups = oModel.getDeferredGroups();
			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}
			var oCreateModel = this.getView().getModel("createCropModel");
			var oData = oCreateModel.getProperty("/newCropTracking");
			var sPeriod = this.getWeek() + new Date().getFullYear();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			//this.uniqueKey = this.sOperation === "Copy" ? oData.HCP_UNIQUE_KEY : this.generateUniqueKey();
			
			oCreateModel.setProperty("/bkpoData", Object.assign({}, oData))
			oCreateModel.setProperty("/bkpoDataCommercialization", Object.assign({}, oData.HCP_COMMERCIALIZATION))
			
			this.uniqueKey = oData.HCP_UNIQUE_KEY;

			var aData = {
				HCP_CROP_TRACK_ID: sTimestamp.toFixed(),
				HCP_CROP: oData.HCP_CROP_ID ? oData.HCP_CROP_ID : oData.HCP_CROP,
				HCP_STATE: oData.HCP_STATE,
				HCP_REGIO: oData.HCP_REGIO,
				HCP_MATERIAL: oData.HCP_MATERIAL,
				HCP_UNIQUE_KEY: this.uniqueKey,
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
				HCP_PERIOD: oData.HCP_PERIOD,
				HCP_PLATAFORM: bIsMobile ? '1' : '2',
				HCP_CREATED_BY: aUserName,
				HCP_CREATED_AT: new Date()
			};

			let fullNameState = aData.HCP_STATE;

			var state;
			var regio;

			this.setBusyDialog("Acompanhamento de Lavoura", "Salvando");

			this.getCentralRegion(aData, "Crop_Tracking").then(function (regioCenter) {
				let regionCentralId = regioCenter.HCP_REGIO ? regioCenter.HCP_REGIO : regioCenter.HCP_ID
				let isNew = false;
				
				if (!regioCenter) {
					regioCenter = [];
					regioCenter.HCP_REGIO = oData.HCP_REGIO;
				} else if (regioCenter.isNew) {
					isNew = true;
				}

				state = aData.HCP_STATE.split("-");
				if (state.length > 1) {
					aData.HCP_STATE = state[0];
				}
				regio = aData.HCP_REGIO.split("-");
				if (regio.length > 1) {
					aData.HCP_REGIO = regio[0];
				}

				if (!isNew && !regioCenter.HCP_CROP_TRACK_ID) {
					aData.HCP_UNIQUE_KEY = this.generateUniqueKey();
				}

				oModel.createEntry("/Crop_Tracking", {
					properties: aData
				}, {
					groupId: "changes"
				});

				let HCP_COMMERCIALIZATION = {
					HCP_CAPACITY_PERCENT: 0
				}

				aData["HCP_COMMERCIALIZATION"] = oData.HCP_COMMERCIALIZATION ? oData.HCP_COMMERCIALIZATION : HCP_COMMERCIALIZATION

				if (isNew || regioCenter.HCP_CROP_TRACK_ID) {
					this.checkCentralRegion(aData, regionCentralId).then(function (oPropertiesEdit) {
						oData = oCreateModel.getProperty("/bkpoData");
						oData.HCP_COMMERCIALIZATION = oCreateModel.getProperty("/bkpoDataCommercialization")
						oCreateModel.setProperty("/newCropTracking", oData)
						
						let oPropertiesEditWithCommercialization = {...oPropertiesEdit}
						delete oPropertiesEdit.HCP_CAPACITY_PERCENT
							// if (oPropertiesEdit) {
							// 	oModel.update(sCropPath, oPropertiesEdit, {
							// 		groupId: "changes"
							// 	});
							// }

						if (oPropertiesEdit && regioCenter.HCP_CROP_TRACK_ID) {
							var sCropPath = this.buildEntityPath("Crop_Tracking", regioCenter, "HCP_CROP_TRACK_ID");
							if (regioCenter.HCP_PERIOD == this.getWeek() + new Date().getFullYear()) {
								oModel.update(sCropPath, oPropertiesEdit, {
									groupId: "changes"
								});
							} else {
								oModel.createEntry("/Crop_Tracking", {
									properties: {
										HCP_CROP_TRACK_ID: (sTimestamp + 1).toFixed(),
										HCP_CROP: regioCenter.HCP_CROP.toString(),
										HCP_STATE: regioCenter.HCP_STATE,
										HCP_REGIO: regionCentralId,
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
										HCP_PLANTING_STAGE: regioCenter.HCP_PLANTING_STAGE || 0,
										HCP_GERMINATION_STAGE: regioCenter.HCP_GERMINATION_STAGE || 0,
										HCP_VEG_DEV_STAGE: regioCenter.HCP_VEG_DEV_STAGE || 0,
										HCP_FLOWERING_STAGE: regioCenter.HCP_FLOWERING_STAGE || 0,
										HCP_GRAIN_FORMATION_STAGE: regioCenter.HCP_GRAIN_FORMATION_STAGE || 0,
										HCP_GRAIN_FILLING_STAGE: regioCenter.HCP_GRAIN_FILLING_STAGE || 0,
										HCP_MATURATION_STAGE: regioCenter.HCP_MATURATION_STAGE || 0,
										HCP_HARVEST_STAGE: regioCenter.HCP_HARVEST_STAGE || 0,
										HCP_PERIOD: this.getWeek() + new Date().getFullYear(),
										HCP_PLATAFORM: bIsMobile ? '1' : '2',
										HCP_CREATED_BY: aUserName,
										HCP_CREATED_AT: new Date()
									}
								}, {
									groupId: "changes"
								});
							}

						} else if (oPropertiesEdit) {
							oModel.createEntry("/Crop_Tracking", {
								properties: {
									HCP_CROP_TRACK_ID: (sTimestamp + 1).toFixed(),
									HCP_CROP: aData.HCP_CROP.toString(),
									HCP_STATE: aData.HCP_STATE,
									HCP_REGIO: regionCentralId,
									HCP_MATERIAL: aData.HCP_MATERIAL,
									HCP_UNIQUE_KEY: this.generateUniqueKey(), //verificar
									HCP_START_CROP: oPropertiesEdit.HCP_START_CROP,
									HCP_END_CROP: oPropertiesEdit.HCP_END_CROP,
									HCP_START_HRVST: oPropertiesEdit.HCP_START_HRVST,
									HCP_END_HRVST: oPropertiesEdit.HCP_END_HRVST,
									HCP_PLANTING_AREA: parseFloat(oPropertiesEdit.HCP_PLANTING_AREA).toFixed(2),
									HCP_PRODUCTIVITY: parseFloat(oPropertiesEdit.HCP_PRODUCTIVITY).toFixed(2),
									HCP_TOTAL_PRODUCTION: parseFloat(oPropertiesEdit.HCP_TOTAL_PRODUCTION).toFixed(2),
									HCP_RAINFALL_LEVEL: parseFloat(oPropertiesEdit.HCP_RAINFALL_LEVEL).toFixed(2),
									HCP_CROP_CONDITION: aData.HCP_CROP_CONDITION,
									HCP_TECH_LEVEL: aData.HCP_TECH_LEVEL,
									HCP_PROD_COST: parseFloat(oPropertiesEdit.HCP_PROD_COST).toFixed(2),
									HCP_SUPPLIER: null,
									HCP_PLANTING_STAGE: parseFloat(oPropertiesEdit.HCP_PLANTING_STAGE).toFixed(2),
									HCP_GERMINATION_STAGE: parseFloat(oPropertiesEdit.HCP_GERMINATION_STAGE).toFixed(2),
									HCP_VEG_DEV_STAGE: parseFloat(oPropertiesEdit.HCP_VEG_DEV_STAGE).toFixed(2),
									HCP_FLOWERING_STAGE: parseFloat(oPropertiesEdit.HCP_FLOWERING_STAGE).toFixed(2),
									HCP_GRAIN_FORMATION_STAGE: parseFloat(oPropertiesEdit.HCP_GRAIN_FORMATION_STAGE).toFixed(2),
									HCP_GRAIN_FILLING_STAGE: parseFloat(oPropertiesEdit.HCP_GRAIN_FILLING_STAGE).toFixed(2),
									HCP_MATURATION_STAGE: parseFloat(oPropertiesEdit.HCP_MATURATION_STAGE).toFixed(2),
									HCP_HARVEST_STAGE: parseFloat(oPropertiesEdit.HCP_HARVEST_STAGE).toFixed(2),
									HCP_PERIOD: this.getWeek() + new Date().getFullYear(),
									HCP_PLATAFORM: bIsMobile ? '1' : '2',
									HCP_CREATED_BY: aUserName,
									HCP_CREATED_AT: new Date()
								}
							}, {
								groupId: "changes"
							});

						}

						if ((bIsMobile && navigator.connection.type !== "none")) {
							oModel.submitChanges({
								groupId: "changes",
								success: function () {
									this.flushStore().then(function () {
										this.refreshStore("Crop_Tracking").then(function () {
											this._getCommercialization().then(function () {
												setTimeout(() => {
													this._onUpsertCentralRegioCommercialization({...oData, fullNameState}, oPropertiesEditWithCommercialization).then(function () {
														MessageBox.success(
															"Acompanhamento de lavoura criado com sucesso!", {
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
													}.bind(this))
												}, 100)
											}.bind(this));
										}.bind(this));
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
						} else {
							oModel.submitChanges({
								groupId: "changes",
								success: function () {
									this._getCommercialization().then(function () {
										setTimeout(() => {
											this._onUpsertCentralRegioCommercialization({...oData, fullNameState}, oPropertiesEditWithCommercialization).then(function () {
												MessageBox.success(
													"Acompanhamento de lavoura cadastrado com sucesso!", {
														actions: [sap.m.MessageBox.Action.OK],
														onClose: function (sAction) {
															this.closeBusyDialog();
															this.navBack();
														}.bind(this)
													}
												);
											}.bind(this))
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

					}.bind(this)).catch(function (error) {
						console.log(error);
					}.bind(this));
				} else {
					if ((bIsMobile && navigator.connection.type !== "none")) {
						oModel.submitChanges({
							groupId: "changes",
							success: function () {
								this.flushStore("Crop_Tracking").then(function () {
									this.refreshStore("Crop_Tracking").then(function () {
										this._getCommercialization().then(function () {
											setTimeout(() => {
												this._onUpsertCentralRegioCommercialization({...oData, fullNameState}, oPropertiesEditWithCommercialization).then(function () {
													MessageBox.success(
														"Acompanhamento de lavoura cadastrado com sucesso!", {
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
												}.bind(this))
											}, 100)
										}.bind(this));
									}.bind(this));
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
					} else {
						oModel.submitChanges({
							groupId: "changes",
							success: function () {
								this._getCommercialization().then(function () {
									setTimeout(() => {
										this._onUpsertCentralRegioCommercialization({...oData, fullNameState}, oPropertiesEditWithCommercialization).then(function () {
											MessageBox.success(
												"Acompanhamento de lavoura cadastrado com sucesso!", {
													actions: [sap.m.MessageBox.Action.OK],
													onClose: function (sAction) {
														this.closeBusyDialog();
														this.navBack();
													}.bind(this)
												}
											);
										}.bind(this))
									}, 100)
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
				}

			}.bind(this)).catch(function (error) {
				console.log(error);
			}.bind(this));

		},

		_onCancel: function () {
			var oCreateModel = this.getView().getModel("createCropModel");
			var oData = oCreateModel.getProperty("/newCropTracking");
			var bRepositoryCreated = oCreateModel.getProperty("/repositoryCreated");
			// var sKey = oData["HCP_CROP"].toString() + oData["HCP_STATE"].toString() + (oData["HCP_REGIO"].toString() || "") +
			// 	oData["HCP_MATERIAL"].toString() + oData["HCP_PERIOD"].toString();
			var bHasChanges = oCreateModel.getProperty("/hasChanges");

			if (bHasChanges || this.offlinePictureAccess) {
				sap.m.MessageBox.information(
					this.offlinePictureAccess ? "Deseja mesmo cancelar? Fotos offline e dados informados serão perdidos." :
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
								this.removeOfflineImagesBeforeLeave().then(data => {
									oCreateModel.setProperty("/newCropTracking", []);
									oCreateModel.setProperty("/hasChanges", false);
									this.sKeydata = null;
									this.repositoryEntered = false;
									this.offlinePictureAccess = false;
									this.navBack();
								}).catch(error => {
									console.log(error);
								});
							}
						}.bind(this)
					}
				);
			} else {
				oCreateModel.setProperty("/newCropTracking", []);
				oCreateModel.setProperty("/hasChanges", false);
				this.sKeydata = null;
				this.repositoryEntered = false;
				this.offlinePictureAccess = false;
				this.navBack();
			}
			// else {
			// 	this.removeOfflineImagesBeforeLeave().then(data => {
			// 		oCreateModel.setProperty("/newCropTracking", []);
			// 		oCreateModel.setProperty("/hasChanges", false);
			// 		this.sKeydata = null;
			// 		this.navBack();
			// 	}).catch(error => {
			// 		console.log(error);
			// 	});
			// }
		},

		removeOfflineImagesBeforeLeave: function () {
			return new Promise((resolve, reject) => {
				var oCreateModel = this.getView().getModel("createCropModel");
				var oData = oCreateModel.getProperty("/newCropTracking");
				var oModel = this.getView().getModel();

				if (this.repositoryEntered && !oData.HCP_CROP_TRACK_ID) {
					// this.loadOfflineImages().then(images => {
					this.removeOfflineImages().then(data => {
						oModel.setUseBatch(false);
						this.closeBusyDialog();
						resolve();
					}).catch(error => {
						this.closeBusyDialog();
						reject(error);
					});
					// }).catch(error => {

					// });
				} else {
					resolve();
				}
			});
		},

		loadOfflineImages: function (sStageName) {
			var oCreateModel = this.getView().getModel("createCropModel");
			var oModel = this.getView().getModel();
			var oKeyData = oCreateModel.getProperty("/newCropTracking");
			var sKey = oKeyData["HCP_CROP"].toString() + (oKeyData["HCP_OLD_STATE"].toString() || oKeyData["HCP_STATE"].toString()) + ((
					oKeyData["HCP_OLD_REGIO"].toString() || oKeyData["HCP_REGIO"].toString()) || "") +
				oKeyData["HCP_MATERIAL"].toString() + oKeyData["HCP_PERIOD"].toString();
			var sPathKey = "/cropTracking/" + sKey;
			var oImages;

			return new Promise(function (resolve, reject) {

				var oLocalStorageOffline = localStorage.getItem("fotosOff");

				if (oLocalStorageOffline) {
					var oParsedImages = JSON.parse(oLocalStorageOffline);
					oImages = oParsedImages.filter(image => image.HCP_PATH_KEY.includes("/cropTracking/" + sKey));
				}

				resolve(oImages ? oImages : null);
				// var aFilters = [];
				// aFilters.push(new sap.ui.model.Filter({
				// 	path: 'HCP_CREATED_BY',
				// 	operator: sap.ui.model.FilterOperator.EQ,
				// 	value1: this.userName
				// }));

				// aFilters.push(new sap.ui.model.Filter({
				// 	path: 'HCP_PATH_KEY',
				// 	operator: sap.ui.model.FilterOperator.Contains,
				// 	value1: sPathKey
				// }));
				// this.setBusyDialog("Acompanhamento de Lavoura", "Aguarde");
				// oModel.read("/Offline_Picture", {
				// 	filters: aFilters,
				// 	success: function (result) {
				// 		if (result.results.length > 0) {
				// 			resolve(result.results);
				// 		} else {
				// 			resolve(null);
				// 		}
				// 	}.bind(this),
				// 	error: error => {
				// 		reject();
				// 	}
				// });
			}.bind(this));
		},

		removeOfflineImages: function () {
			var oCreateModel = this.getView().getModel("createCropModel");
			var oKeyData = oCreateModel.getProperty("/newCropTracking");
			var sKey = oKeyData["HCP_CROP"].toString() + (oKeyData["HCP_OLD_STATE"].toString() || oKeyData["HCP_STATE"].toString()) + ((
					oKeyData["HCP_OLD_REGIO"].toString() || oKeyData["HCP_REGIO"].toString()) || "") +
				oKeyData["HCP_MATERIAL"].toString() + oKeyData["HCP_PERIOD"].toString();
			var sPathKey = "/cropTracking/" + sKey;
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			return new Promise((resolve, reject) => {

				if (bIsMobile) {
					this.deletePicture({
						deleteAll: true,
						sKey: sPathKey,
						sId: null
					}).then(data => {
						resolve();
					}).catch(error => {
						reject(error);
					});
				} else {
					resolve();
				}
				// if (aDeferredGroups.indexOf("changeImages") < 0) {
				// 	aDeferredGroups.push("changeImages");
				// 	oModel.setDeferredGroups(aDeferredGroups);
				// }
				// oModel.setUseBatch(true);

				// for (var image of oImages) {
				// 	var oEntityPath = this.buildEntityPath("Offline_Picture", image, "HCP_OFFLINE_ID");

				// 	oModel.remove(oEntityPath, {
				// 		groupId: "changeImages"
				// 	});
				// }

				// oModel.submitChanges({
				// 	groupId: "changeImages",
				// 	success: data => {
				// 		resolve();
				// 	},
				// 	error: error => {
				// 		reject();
				// 	}
				// });
			});
		},

		removeRepository: function (sKey) {
			return new Promise(function (resolve, reject) {
				$.ajax({
						type: 'POST',
						url: "/cmisrepository/root/cropTracking/" + sKey,
						data: {
							cmisaction: "delete"
						}
					}).done(function (results) {
						resolve();
					}.bind(this)())
					.fail(function (err) {
						reject(err);
					});
			}.bind(this));
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
			var oCreateModel = this.getView().getModel("createCropModel");
			var oData = oCreateModel.getProperty("/newCropTracking");
			var SelectedPartner = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

			oData["HCP_SUPPLIER"] = SelectedPartner.HCP_REGISTER;
			oData["HCP_SUPPLIER_DESC"] = SelectedPartner.NAME1;
			// oPartnerInput.setDescription(SelectedPartner.NAME1);
			oCreateModel.refresh();
			this._validateForm();
			this.oPartnerFilter.close();
		},

		onPartnerDialogClose: function () {
			this.oPartnerFilter.close();
		},

		onPictureIconPress: function (oEvent) {
			var oSource = oEvent.getSource();
			var oCreateModel = this.getView().getModel("createCropModel");
			var oData = oCreateModel.getProperty("/newCropTracking");
			var oStageName = oSource.getParent().getFields()[0].getName();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if (bIsMobile) {
				if (device.platform === "iOS" && navigator.connection.type === "none") {
					sap.m.MessageToast.show("ação offline não compatível com seu dispositivo");
				} else {
					oCreateModel.setProperty("/repositoryCreated", true);
					this.repositoryEntered = true;
					this.offlinePictureAccess = bIsMobile && navigator.connection.type === "none" ? true : false;
					this.goToImages(oData, oStageName);
				}
			} else {
				oCreateModel.setProperty("/repositoryCreated", true);
				this.repositoryEntered = true;
				this.offlinePictureAccess = false;
				this.goToImages(oData, oStageName);
			}
			// oCreateModel.setProperty("/repositoryCreated", true);
			// this.repositoryEntered = true;
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
				operation: "Create"
			}, false);
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

		_valideInputNumber: function (oEvent) {
			var oSource = oEvent.getSource();
			var oNewValue = oSource.getValue();

			oNewValue = oNewValue.replace(/[^0-9,]/g, "");

			oSource.setValue(oNewValue);
			this._validateForm();
		},

		_validateProductionAmount: function (oEvent) {
			var oSource = oEvent.getSource();
			var oCreateModel = this.getView().getModel("createCropModel");
			var oData = oCreateModel.getProperty("/newCropTracking");
			var oInputedFieldName = oSource.getName();

			// if (oInputedFieldName === "totalProduction") {
			// 	oCreateModel.setProperty("/amountFieldsRequired", false);
			// 	oCreateModel.setProperty("/totalAmountRequired", true);
			// } else {
			// 	oData["HCP_TOTAL_PRODUCTION"] = null;
			// 	this.calculateTotalProduction();
			// 	oCreateModel.setProperty("/amountFieldsRequired", true);
			// 	oCreateModel.refresh();
			// }
			this.calculateTotalProduction();
			this._valideInputNumber(oEvent);
		},

		calculateTotalProduction: function () {
			var oCreateModel = this.getView().getModel("createCropModel");
			var oData = oCreateModel.getProperty("/newCropTracking");
			var sPlantingArea = oData["HCP_PLANTING_AREA"];
			var sProductivity = oData["HCP_PRODUCTIVITY"];

			if (sPlantingArea && sProductivity) {
				oData["HCP_TOTAL_PRODUCTION"] = oData["HCP_PLANTING_AREA"] * oData["HCP_PRODUCTIVITY"];
			} else {
				oData["HCP_TOTAL_PRODUCTION"] = 0;
			}
		},
		getGeralInf: function (oData, aStageData) {

			var oCreateModel = this.getView().getModel("createCropModel");
			var oModel = this.getView().getModel();
			for (var stage in aStageData) {
				oData[stage] = aStageData[stage];
			}
			oData["HCP_PERIOD"] = this.getWeek() + new Date().getFullYear();

			if (oData.HCP_COMMERCIALIZATION) {
				oData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT = Number(oData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT)
				oData["HCP_COMMERCIALIZATION"] = oData.HCP_COMMERCIALIZATION;
			} else {
				let HCP_COMMERCIALIZATION = {
					HCP_CAPACITY_PERCENT: 0
				}

				oData["HCP_COMMERCIALIZATION"] = HCP_COMMERCIALIZATION
			}

			var regio = oData.HCP_REGIO.split("-");
			var state = oData.HCP_STATE.split("-");
			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_CROP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_CROP_ID ? oData.HCP_CROP_ID : oData.HCP_CROP
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
					var oCrops = result.results;
					var oCropsResult = [];
					var oCrops2 = [];
					if (oCrops.length > 0) {

						const map = new Map();
						for (const item of oCrops) {
							if (!map.has(item.HCP_REGIO)) {
								map.set(item.HCP_REGIO, true); // set any value to Map
								oCropsResult.push(item);
							}
						}

						var aCropData = [];
						var oCompareCrops = [];
						oCrops = oCropsResult;

						if (oCrops.length == 1) {

							aCropData = {
								HCP_START_CROP: oCrops[0].HCP_START_CROP,
								HCP_END_CROP: oCrops[0].HCP_END_CROP,
								HCP_START_HRVST: oCrops[0].HCP_START_HRVST,
								HCP_END_HRVST: oCrops[0].HCP_END_HRVST,
								HCP_PLANTING_AREA: oCrops[0].HCP_PLANTING_AREA,
								HCP_RAINFALL_LEVEL: oCrops[0].HCP_RAINFALL_LEVEL,
								HCP_PROD_COST: oCrops[0].HCP_PROD_COST,
								HCP_PRODUCTIVITY: oCrops[0].HCP_PRODUCTIVITY,
								HCP_TOTAL_PRODUCTION: oCrops[0].HCP_TOTAL_PRODUCTION,

								HCP_CROP: oCrops[0].HCP_CROP,
								HCP_STATE: oData.HCP_STATE,
								HCP_MATERIAL: oCrops[0].HCP_MATERIAL,
								HCP_REGIO: this.regio,
								HCP_CREATED_BY: null,
								HCP_CROP_CONDITION: null,
								HCP_CROP_TRACK_ID: null,
								HCP_FLOWERING_STAGE: 0,
								HCP_GERMINATION_STAGE: 0,
								HCP_GRAIN_FILLING_STAGE: 0,
								HCP_GRAIN_FORMATION_STAGE: 0,
								HCP_HARVEST_STAGE: 0,
								HCP_MATURATION_STAGE: 0,
								HCP_COMMERCIALIZATION: oData.HCP_COMMERCIALIZATION ? oData.HCP_COMMERCIALIZATION : 0,
								HCP_PERIOD: this.getWeek() + new Date().getFullYear(),
								HCP_PLANTING_STAGE: 0,
								HCP_SUPPLIER: null,
								HCP_TECH_LEVEL: null,
								HCP_UNIQUE_KEY: null,
								HCP_UPDATED_AT: null,
								HCP_UPDATED_BY: null,
								HCP_VEG_DEV_STAGE: 0
							};

							oCreateModel.setProperty("/newCropTracking", aCropData);
							oCreateModel.setProperty("/isEnable", false);

						} else {

							oCompareCrops = this.prepareDataBtCrops2(oCrops);

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

								HCP_CROP: oCompareCrops.HCP_CROP,
								HCP_STATE: oData.HCP_STATE,
								HCP_MATERIAL: oCompareCrops.HCP_MATERIAL,
								HCP_REGIO: this.regio,
								isEnable: false,
								HCP_CREATED_BY: null,
								HCP_CROP_CONDITION: null,
								HCP_CROP_TRACK_ID: null,
								HCP_FLOWERING_STAGE: 0,
								HCP_GERMINATION_STAGE: 0,
								HCP_GRAIN_FILLING_STAGE: 0,
								HCP_GRAIN_FORMATION_STAGE: 0,
								HCP_HARVEST_STAGE: 0,
								HCP_MATURATION_STAGE: 0,
								HCP_COMMERCIALIZATION: oData.HCP_COMMERCIALIZATION ? oData.HCP_COMMERCIALIZATION : 0,
								HCP_PERIOD: this.getWeek() + new Date().getFullYear(),
								HCP_PLANTING_STAGE: 0,
								HCP_SUPPLIER: null,
								HCP_TECH_LEVEL: null,
								HCP_UNIQUE_KEY: null,
								HCP_UPDATED_AT: null,
								HCP_UPDATED_BY: null,
								HCP_VEG_DEV_STAGE: 0
							};

						}

						oCreateModel.setProperty("/newCropTracking", aCropData);
						oCreateModel.setProperty("/isEnable", false);

					} else {
						oCreateModel.setProperty("/isEnable", true);
					}
				}.bind(this),
				error: function () {
					sap.m.MessageToast.show("Falha ao Buscar Acompanhamentos.");
				}
			});

			oCreateModel.setProperty("/newCropTracking", oData);
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
				} else if (dataMoreCurrent) {
					calcCommercialization = Number(calcCommercialization) + Number(dataMoreCurrent.HCP_CAPACITY_TONNE)
				}
				
				//Fecha itens CR2

				oCompareCrops.HCP_PLANTING_AREA = parseFloat(oCompareCrops.HCP_PLANTING_AREA) + parseFloat(oCrops[m].HCP_PLANTING_AREA);
				oCompareCrops.HCP_TOTAL_PRODUCTION = Number(parseFloat(oCompareCrops.HCP_TOTAL_PRODUCTION).toFixed(2)) + Number(parseFloat(oCrops[m].HCP_TOTAL_PRODUCTION).toFixed(2));
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

		getCentralRegion: function (oData, sPath) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var state = oData.HCP_STATE.split("-");
				var regio = oData.HCP_REGIO.split("-");
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
								value1: oData.HCP_CROP_ID ? oData.HCP_CROP_ID : oData.HCP_CROP
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
									} else if (oRegio[0].HCP_BEZEI != regio[1]) {

										var object = {...oRegio[0], isNew: true};

										resolve(object);
									} else {
										resolve();
									}
								}.bind(this),
								error: function (err) {
									sap.m.MessageToast.show("Falha ao Buscar Acompanhamento.");
									reject(err);
								}
							});
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
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_CROP',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_CROP_ID ? oData.HCP_CROP_ID : oData.HCP_CROP
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
					value1: regioID
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
							oData.HCP_COMMERCIALIZATION = this.getView().getModel("createCropModel").getProperty("/bkpoDataCommercialization")
							var aCropData = [];
							//	oCrops.push(oData);

							const map = new Map();
							for (const item of oCrops) {
								if (!map.has(item.HCP_REGIO)) {
									map.set(item.HCP_REGIO, true); // set any value to Map
									oCropsResult.push(item);
								}
							}

							if (this.sOperation == 'New') {
								oCropsResult.push(oData);
							} else {
								for (var crop in oCropsResult) {
									if (oData.HCP_REGIO == oCropsResult[crop].HCP_REGIO) {
										oCropsResult[crop] = oData;
									}
								}
							}

							oCrops = oCropsResult;
							//aqui
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
								HCP_CAPACITY_PERCENT: Number(oCompareCrops.HCP_CAPACITY_PERCENT),
								//CR2
								HCP_UPDATED_AT: new Date(),
								HCP_UPDATED_BY: this.userName
							};

							resolve(aCropData);
						} else {
							if (regioID != oData.HCP_REGIO) {

								aCropData = {
									HCP_START_CROP: oData.HCP_START_CROP,
									HCP_END_CROP: oData.HCP_END_CROP,
									HCP_START_HRVST: oData.HCP_START_HRVST,
									HCP_END_HRVST: oData.HCP_END_HRVST,
									HCP_PLANTING_AREA: parseFloat(oData.HCP_PLANTING_AREA).toFixed(2),
									HCP_PRODUCTIVITY: parseFloat(oData.HCP_PRODUCTIVITY).toFixed(2),
									HCP_TOTAL_PRODUCTION: parseFloat(oData.HCP_TOTAL_PRODUCTION).toFixed(2),
									HCP_RAINFALL_LEVEL: parseFloat(oData.HCP_RAINFALL_LEVEL).toFixed(2),
									HCP_PROD_COST: parseFloat(oData.HCP_PROD_COST).toFixed(2),
									//CR2
									HCP_PLANTING_STAGE: parseFloat(oData.HCP_PLANTING_STAGE).toFixed(2),
									HCP_GERMINATION_STAGE: parseFloat(oData.HCP_GERMINATION_STAGE).toFixed(2),
									HCP_VEG_DEV_STAGE: parseFloat(oData.HCP_VEG_DEV_STAGE).toFixed(2),
									HCP_FLOWERING_STAGE: parseFloat(oData.HCP_FLOWERING_STAGE).toFixed(2),
									HCP_GRAIN_FORMATION_STAGE: parseFloat(oData.HCP_GRAIN_FORMATION_STAGE).toFixed(2),
									HCP_GRAIN_FILLING_STAGE: parseFloat(oData.HCP_GRAIN_FILLING_STAGE).toFixed(2),
									HCP_MATURATION_STAGE: parseFloat(oData.HCP_MATURATION_STAGE).toFixed(2),
									HCP_HARVEST_STAGE: parseFloat(oData.HCP_HARVEST_STAGE).toFixed(2),
									HCP_CAPACITY_PERCENT: Number(oData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT),
										//CR2
									HCP_UPDATED_AT: new Date(),
									HCP_UPDATED_BY: this.userName
								};

								resolve(aCropData);
							}
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
		buildEntityPath: function (sEntityName, oEntity, sFieldKey) {
			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity[sFieldKey] + "l)";
			}
		},
		
		roundingRule: function (valor) {
			const parteDecimal = valor - Math.floor(valor);
			 
		    if (parteDecimal >= 0.5)
		    	return Math.ceil(valor);
		    else
		    	return Math.floor(valor);
		},
		
		_getCommercialization: function () {
			return new Promise(function (resolve, reject) {

				var aFilters = [];
				var oModel = this.getOwnerComponent().getModel();
				var oCreateModel = this.getView().getModel("createCropModel");
				var oData = oCreateModel.getProperty("/newCropTracking");
				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;

				var regio = oData.HCP_REGIO.split("-");
				var state = oData.HCP_STATE.split("-");

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_CROP',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_CROP_ID ? oData.HCP_CROP_ID : oData.HCP_CROP
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
					success: function (resultCommerc) {
						var oResults = resultCommerc.results;
						var oCreateModel = this.getView().getModel("createCropModel");
						var oData = oCreateModel.getProperty("/newCropTracking");
						var sTimestamp = new Date().getTime();
						
						let percentCommercialized = oData.HCP_COMMERCIALIZATION.HCP_CAPACITY_PERCENT
						let capacityTonne = (percentCommercialized / 100) * oData.HCP_TOTAL_PRODUCTION
						let totalAvailable = oData.HCP_TOTAL_PRODUCTION - capacityTonne
						
						capacityTonne = this.roundingRule(capacityTonne)
						totalAvailable = this.roundingRule(totalAvailable)
						let totalProduction = this.roundingRule(oData.HCP_TOTAL_PRODUCTION)

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
							var calcPercentNegotiation = aDataCommerc.HCP_TOTAL_NEGOTIATION ? aDataCommerc.HCP_TOTAL_NEGOTIATION : "0" ? aDataCommerc.HCP_TOTAL_NEGOTIATION : "0" / aDataCommerc.HCP_TOTAL_CROP_TRACK;
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
										this.flushStore("Commercialization").then(function () {
											this.refreshStore("Commercialization").then(function () {
												resolve();
											}.bind(this));
										}.bind(this));
									}.bind(this),
									error: function () {
										reject();
									}.bind(this)
								});
							} else {
								oModel.submitChanges({groupId: "changes"});
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
									HCP_CROP: oData.HCP_CROP_ID ? oData.HCP_CROP_ID : oData.HCP_CROP,
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
											that.flushStore("Commercialization").then(function () {
												that.refreshStore("Commercialization").then(function () {
												}.bind(that));
											}.bind(that));
										}.bind(that)
									});
								} else {
									oModel.submitChanges({groupId: "changes"});
								}
							}.bind(this))
							
							resolve()
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
									that.flushStore("Commercialization").then(function () {
										that.refreshStore("Commercialization").then(function () {
										}.bind(that));
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
								HCP_TEXT: regioCenterCommecialization.HCP_TEXT,
								HCP_PERIOD: that.getWeek() + new Date().getFullYear(),
								HCP_CAPACITY_TYPE: "0",
								HCP_PLATAFORM: bIsMobile ? '1' : '2',
								HCP_CREATED_BY: that.userName,
								HCP_UPDATED_BY: that.userName,
								HCP_UPDATED_AT: that._formatDate(new Date()),
								HCP_CREATED_AT: that._formatDate(new Date()),
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
										that.flushStore("Commercialization").then(function () {
											that.refreshStore("Commercialization").then(function () {
											}.bind(that));
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
						
						capacityTonne = that.roundingRule(capacityTonne)
						totalAvailable = that.roundingRule(totalAvailable)
						let totalProduction = that.roundingRule(oPropertiesEdit.HCP_TOTAL_PRODUCTION)
						
						let totalNegociationPercent = "0.00";

						if (result) {
							let calcPercentNegotiation = result.HCP_TOTAL_NEGOTIATION ? result.HCP_TOTAL_NEGOTIATION : "0" / oPropertiesEdit.HCP_TOTAL_PRODUCTION;
							totalNegociationPercent = parseFloat((calcPercentNegotiation * 100).toFixed(2)).toFixed(2);
						}

						let aDataCommercialization = {
							HCP_COMMERC_ID: sTimestamp.toFixed(),
							HCP_CROP: oData.HCP_CROP_ID ? oData.HCP_CROP_ID : oData.HCP_CROP,
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
									that.flushStore("Commercialization").then(function () {
										that.refreshStore("Commercialization").then(function () {}.bind(that));
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
					value1: props.HCP_CROP_ID ? props.HCP_CROP_ID : props.HCP_CROP
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