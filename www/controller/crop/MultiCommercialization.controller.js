sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter",
	'sap/ui/model/Filter',
	'sap/m/Label',
	"sap/ui/model/FilterOperator",
	"sap/ui/table/library"
], function (MainController, MessageBox, History, JSONModel, formatter, Filter, Label, FilterOperator) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.crop.MultiCommercialization", {
		formatter: formatter,

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("crop.MultiCommercialization").attachDisplay(this.handleRouteMatched, this);
		},

		handleRouteMatched: async function (oEvent) {

			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.setBusyDialog("App Grãos", "Carregando dados, por favor aguarde");

			this.createModel();
			
			this.getURLparameter(oEvent);
			this.getUserIfReload();
			await this.oldCrop();
			this.getfollowUpData();
			// this.validateCenterRegion();

			this.closeBusyDialog();
		},

		createModel: function () {
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				oURLparameter: {},
				oWindowTableData: [],
				oWindowDataRegion: [],
				oWindowTableDataLength: 0,
				oTableData: [],
				enableSave: false,
				oldCrop: false,
			}), "MultiCommercializationModel");

			this.oViewModel = this.getView().getModel('MultiCommercializationModel');
		},

		getURLparameter: function (oEvent) {
			if (oEvent.getParameter("data"))
				this.oViewModel.setProperty("/oURLparameter", JSON.parse(decodeURIComponent(oEvent.getParameter("data").keyData)));
		},

		getUserIfReload: function () {
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));
		},
		
		oldCrop: async function(){
			let oModel = this.getView().getModel();
			let crop_id = this.oViewModel.oData?.oURLparameter?.HCP_CROP_ID;
			
			if(crop_id){
				let oFilters = [];
				oFilters.push(new sap.ui.model.Filter("HCP_CROP_ID", sap.ui.model.FilterOperator.EQ, crop_id));
				
				await new Promise((resolve, reject) => {
					oModel.read("/Crop_Year", {
						filters: oFilters,
						sorters: [new sap.ui.model.Sorter("HCP_RANGE_START", false)],
						success: function (results) {
							if(this.testOldCrop(results.results[0].HCP_CROP_DESC)){
								this.oViewModel.setProperty("/oldCrop", true)
							}
							return resolve()
						}.bind(this),
						error: function (error) {
							return reject(MessageBox.error("Erro ao Buscar Ano da Safra!"));
						}
					})
				})
				
			}
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

		getfollowUpData: async function () {
			let oDataModel = this.getOwnerComponent().getModel();
			let regions = await this.getRegions();
			let regionsFilter = this.configFilterRegionsOR(regions);
			let aFilters = [];

			let service = "/Crop_Tracking";

			aFilters.push(regionsFilter);

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_MATERIAL',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.oViewModel.oData.oURLparameter.HCP_MATERIAL
			}));
			
			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_CROP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.oViewModel.oData.oURLparameter.HCP_CROP_ID
			}));

			const response = await new Promise(function (resolve, reject) {
				oDataModel.read(service, {
					urlParameters: {
						"$expand": "Crop_Track_Commercialization,Crop_Track_Region"
					},
					sorters: [new sap.ui.model.Sorter({
						path: "HCP_CREATED_AT",
						descending: true
					})],
					filters: [aFilters],
					success: function (data) {
						resolve(data.results);
					}.bind(this),
					error: function (oError) {
						reject(oError);
					}.bind(this),
				});
			});
			
			this.configDataTable(regions, response);

		},

		configDataTable: async function (regions, crops) {

			let usedRegion = [];
			for (const region of regions) {
				for (const crop of crops) {
					if (crop.HCP_REGIO == region.HCP_ID) {
						if(regions.length === 1){
							let newLine = this.createLineTable(crop);
							this.oViewModel.oData.oTableData.push(newLine);
							usedRegion.push({
								HCP_ID: crop.HCP_REGIO
							})
						}
						if (crop.HCP_REGIO != this.oViewModel.oData.oURLparameter.HCP_REGIO_NUMBER) {
							let newLine = this.createLineTable(crop);
							this.oViewModel.oData.oTableData.push(newLine);
							usedRegion.push({
								HCP_ID: crop.HCP_REGIO
							})
						} else {
							let newLine = this.createLineTable(crop);
							newLine.HCP_TOTAL_PERCENTAGE = newLine.HCP_TOTAL_PERCENTAGE >= 99.97 && newLine.HCP_TOTAL_PERCENTAGE <= 100.03 ? 100 : parseFloat(newLine.HCP_TOTAL_PERCENTAGE);
							this.oViewModel.setProperty("/oWindowDataRegion", [newLine]);
							usedRegion.push({
								HCP_ID: crop.HCP_REGIO
							})
						}
						break;
					}
				}
			}

			if (regions.length > usedRegion.length) {
				let restRegions = regions.filter(item1 => !usedRegion.some(item2 => item2.HCP_ID === item1.HCP_ID));
				let commercialization = null;
				
				if(regions.length === 1){
					let newLine = this.createLineTable(null);
					if(this.oViewModel.oData.oldCrop){
						commercialization = await this.getCommercialization(restRegions[0].HCP_ID); 
						newLine.HCP_COMMERCIALIZATION = commercialization ? parseFloat(commercialization.HCP_CAPACITY_PERCENT) : 0;
					}
					newLine.HCP_BEZEI = restRegions[0].HCP_BEZEI;
					newLine.HCP_REGIO = restRegions[0].HCP_ID;
					this.oViewModel.setProperty("/oWindowDataRegion", [newLine]);
				}
				for (const restRegion of restRegions) {
					if((restRegion.HCP_ID != this.oViewModel.oData.oURLparameter.HCP_REGIO_NUMBER) || regions.length === 1){
						let newLine = this.createLineTable(null);
						if(this.oViewModel.oData.oldCrop){
							commercialization = await this.getCommercialization(restRegion.HCP_ID); 
							newLine.HCP_COMMERCIALIZATION =commercialization ? parseFloat(commercialization.HCP_CAPACITY_PERCENT) : 0;
						}
						newLine.HCP_BEZEI = restRegion.HCP_BEZEI;
						newLine.HCP_REGIO = restRegion.HCP_ID;
						this.oViewModel.oData.oTableData.push(newLine);
					}else{
						let newLine = this.createLineTable(null);
						if(this.oViewModel.oData.oldCrop){
							commercialization = await this.getCommercialization(restRegion.HCP_ID);
							newLine.HCP_COMMERCIALIZATION = commercialization ? parseFloat(commercialization.HCP_CAPACITY_PERCENT) : 0;
						}
						newLine.HCP_BEZEI = restRegion.HCP_BEZEI;
						newLine.HCP_REGIO = restRegion.HCP_ID;
						this.oViewModel.setProperty("/oWindowDataRegion", [newLine]);
					}
				}
			}

			this.oViewModel.setProperty("/oWindowTableData", Object.assign({}, this.oViewModel.oData.oTableData));
			this.oViewModel.setProperty("/oWindowTableDataLength", this.oViewModel.oData.oTableData.length);
			this.oViewModel.oData.oTableData.push(Object.assign({}, this.oViewModel.oData.oWindowDataRegion[0]));
		},
		
		getCommercialization: async function(HCP_REGIO){
			
			let oDataModel = this.getOwnerComponent().getModel();
			var aFilters = [];
			let ServiceCommercialization = "/Commercialization"
			
			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_CROP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: (this.oViewModel.oData.oURLparameter.HCP_CROP_ID).toString()
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_STATE',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.oViewModel.oData.oURLparameter.HCP_STATE_ACRONYM
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_REGIO',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: HCP_REGIO
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_MATERIAL',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.oViewModel.oData.oURLparameter.HCP_MATERIAL
			}));
			
			let dataCommercialization = await new Promise(function (resolve, reject) {
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
			
			return dataCommercialization;
			
		},

		calculationTotal: function (oItemData) {
			return parseFloat(oItemData.HCP_GERMINATION_STAGE) + parseFloat(oItemData.HCP_VEG_DEV_STAGE) + 
				   parseFloat(oItemData.HCP_FLOWERING_STAGE) + parseFloat(oItemData.HCP_GRAIN_FORMATION_STAGE) + 
				   parseFloat(oItemData.HCP_GRAIN_FILLING_STAGE) + parseFloat(oItemData.HCP_MATURATION_STAGE);
		},

		createLineTable: function (data) {

			let oProperty = {};

			if (data) {
				oProperty = {
					//Data Principal para create update
					HCP_START_CROP: 			data.HCP_START_CROP,
					HCP_END_CROP:				data.HCP_END_CROP,
					HCP_START_HRVST:			data.HCP_START_HRVST,
					HCP_END_HRVST:				data.HCP_END_HRVST,
					
					HCP_PLANTING_AREA:			parseFloat(data.HCP_PLANTING_AREA),
					HCP_PRODUCTIVITY:			parseFloat(data.HCP_PRODUCTIVITY),
					HCP_TOTAL_PRODUCTION:		parseFloat(data.HCP_TOTAL_PRODUCTION),
					HCP_RAINFALL_LEVEL: 		parseFloat(data.HCP_RAINFALL_LEVEL),
					HCP_CROP_CONDITION: 		data.HCP_CROP_CONDITION,
					HCP_TECH_LEVEL: 			data.HCP_TECH_LEVEL,
					HCP_PROD_COST:				parseFloat(data.HCP_PROD_COST),
					HCP_PLANTING_STAGE: 		parseFloat(data.HCP_PLANTING_STAGE),
					HCP_HARVEST_STAGE:			parseFloat(data.HCP_HARVEST_STAGE),
					HCP_GERMINATION_STAGE:		parseFloat(data.HCP_GERMINATION_STAGE),
					HCP_VEG_DEV_STAGE:			parseFloat(data.HCP_VEG_DEV_STAGE),
					HCP_FLOWERING_STAGE:		parseFloat(data.HCP_FLOWERING_STAGE),
					HCP_GRAIN_FORMATION_STAGE:	parseFloat(data.HCP_GRAIN_FORMATION_STAGE),
					HCP_GRAIN_FILLING_STAGE:	parseFloat(data.HCP_GRAIN_FILLING_STAGE),
					HCP_MATURATION_STAGE:		parseFloat(data.HCP_MATURATION_STAGE),
					
					//Data Secundario para auxilio
					HCP_BEZEI: data.Crop_Track_Region.HCP_BEZEI,	
					HCP_REGIO: data.Crop_Track_Region.HCP_ID,	
					TABLE_COMMERCIALIZATION: data.Crop_Track_Commercialization.results.length > 0 ? this.returnTheLastCommercialization(data.Crop_Track_Commercialization.results) : null,
					TABLE_CROP: data,
				}
				oProperty = {
					...oProperty,
					HCP_COMMERCIALIZATION: oProperty.TABLE_COMMERCIALIZATION ? parseFloat(oProperty.TABLE_COMMERCIALIZATION.HCP_CAPACITY_PERCENT) : 0,
				}
			} else {
				oProperty = {
					//Data Principal para create update
					HCP_START_CROP: null,
					HCP_END_CROP: null,
					HCP_START_HRVST: null,
					HCP_END_HRVST: null,
					HCP_PLANTING_AREA: 0,
					HCP_PRODUCTIVITY: 0,
					HCP_TOTAL_PRODUCTION: 0,
					HCP_RAINFALL_LEVEL: 0,
					HCP_CROP_CONDITION: null,
					HCP_TECH_LEVEL: null,
					HCP_PROD_COST: 0,
					HCP_PLANTING_STAGE: 0,
					HCP_GERMINATION_STAGE: 0,
					HCP_VEG_DEV_STAGE: 0,
					HCP_FLOWERING_STAGE: 0,
					HCP_GRAIN_FORMATION_STAGE: 0,
					HCP_GRAIN_FILLING_STAGE: 0,
					HCP_MATURATION_STAGE: 0,
					HCP_HARVEST_STAGE: 0,
					
					//Data Secundario para auxilio
					HCP_BEZEI: null,
					HCP_REGIO: null,
					HCP_COMMERCIALIZATION: 0,
					TABLE_CROP: null
				}
			}

			oProperty["HCP_TOTAL_PERCENTAGE"] = parseFloat(this.calculationTotal(oProperty));

			return oProperty;
		},
		
		returnTheLastCommercialization: function(data){
			if(data.length > 1){
				data.sort((a, b) => b.HCP_COMMERC_ID - a.HCP_COMMERC_ID);
				return data[0];
			}else
				return data[0];
			
		},

		getRegions: async function () {
			let oDataModel = this.getOwnerComponent().getModel();
			let oFilter = [];

			let service = "/Regions";
			oFilter.push(new sap.ui.model.Filter("HCP_BLAND", sap.ui.model.FilterOperator.EQ, this.oViewModel.oData.oURLparameter.HCP_STATE_ACRONYM));
			oFilter.push(new sap.ui.model.Filter("HCP_ACTIVE", sap.ui.model.FilterOperator.EQ, '1'));

			return await new Promise(function (resolve, reject) {
				oDataModel.read(service, {
					filters: oFilter,
					success: function (data) {
						resolve(data.results);
					}.bind(this),
					error: function (oError) {
						reject(oError);
					}.bind(this),
				});
			});
		},

		configFilterRegionsOR: function (regions) {
			let aFilters = [],
				orFilters;

			if (regions.length > 0) {
				for (let i = 0; i < regions.length; i++) {
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_REGIO',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: regions[i].HCP_ID
					}));
				}

				orFilters = new sap.ui.model.Filter({
					filters: aFilters,
					and: false
				});
			}

			return orFilters;
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
		},
		
		validateDot: function (sValue){
			
			sValue = sValue.toString();
			//Se tiver mais de um ponto, ou se as casas decimais forem maior que 2 casas, ou se foi digitado somente o ponto sem valor anterior a ele.
			if(sValue.includes("."))
				if(sValue.split(".").length > 2 || (sValue.split(".").length == 2 && (sValue.split(".")[1].length > 2 || (sValue.split(".")[1].length > 0 && sValue.split(".")[0].length == 0))))
					return parseFloat(sValue).toFixed(2);
				else
					return sValue;
			else
				return parseFloat(sValue).toFixed();
		},
		
		validateValueCamp: function (oEvent,oType) {
			
			let oInput = oEvent.getSource();
			let sNewValue = oEvent.getParameter("value");
			let sNumericValue = sNewValue.replace(/[^0-9.,]/g, '');
			let sValue = sNumericValue.replace(/,/g, '.');
			let oBindingContext = oInput.getBindingContext("MultiCommercializationModel");
			
			sValue = sValue != "" ? this.validateDot(sValue) : sValue;

			if(sValue.charAt(sValue.length - 1) != '.'){
					
				switch (oType) {
				  case "calculateProdutivityTotal":
				  	
				  	oInput.setValue(sValue != "" ? sValue : 0);
				  	
				  	if (oBindingContext) {
						let object = oBindingContext.getObject();
						let calc = object.HCP_PLANTING_AREA * object.HCP_PRODUCTIVITY;
						object["HCP_TOTAL_PRODUCTION"] = parseFloat(calc);
					}
					
				    break;
				  case "verifyPercentage":
				  	
				  	if (sValue > 100)
						sValue = 100;
						
				  	oInput.setValue(sValue);
				  	
				  	if(oBindingContext){
				  		let idInput = oEvent.getParameter("id").split("--")[2].split("-")[0];
				  		
				  		if (idInput != "plantingStage" && idInput != "harvestStage" && idInput != "commercialization"){
							oBindingContext.getObject()["HCP_TOTAL_PERCENTAGE"] = this.calculationTotal(oBindingContext.getObject());
							
							if(oBindingContext.getObject().HCP_TOTAL_PERCENTAGE > 100)
								sap.m.MessageToast.show("A soma dos estágios, fora o plantio e colheita, deve somar 100%");
						}
						
						if((idInput == "harvestStage" || idInput == "maturationStage") && oBindingContext.getObject().HCP_HARVEST_STAGE > oBindingContext.getObject().HCP_MATURATION_STAGE)
							sap.m.MessageToast.show("O percentual de colheita não pode ser maior que o percentual de maturação");
				  	}
				    break;
				    
				  default:
				    oInput.setValue(sValue != "" ? sValue : 0);
				}
				
				this.updateCenterRegion();
			}
		},

		updateCenterRegion: function () {
			this.validateCenterRegion();
			this.validateForm();
		},

		validateCenterRegion: function () {
			let centerRegion = this.prepareDataBtCrops(this.oViewModel.oData.oWindowTableData);
			
			if(this.oViewModel.oData.oldCrop)
			{
				let percentNotData = 0;
				let qtd = 0;
				
				let tableLength = this.oViewModel.oData.oWindowTableData.length ? this.oViewModel.oData.oWindowTableData.length : Object.keys(this.oViewModel.oData.oWindowTableData).length;
				
				for (var m = 0; m < tableLength; m++) {
					if(this.oViewModel.oData.oWindowTableData[m].HCP_START_CROP == null){
						qtd  += 1;
						percentNotData += parseFloat(this.oViewModel.oData.oWindowTableData[m].HCP_COMMERCIALIZATION);
					}
				}
				
				if(qtd == tableLength){
					this.oViewModel.oData.oWindowDataRegion[0].HCP_COMMERCIALIZATION = this.validateDot((percentNotData));
				}else{
					this.oViewModel.oData.oWindowDataRegion[0].HCP_COMMERCIALIZATION = this.validateDot((centerRegion.HCP_COMMERCIALIZATION));
				}	
				
			}
			else
			{
			
				this.oViewModel.oData.oWindowDataRegion[0].HCP_START_HRVST				= centerRegion.HCP_START_HRVST;
				this.oViewModel.oData.oWindowDataRegion[0].HCP_END_HRVST				= centerRegion.HCP_END_HRVST;
				this.oViewModel.oData.oWindowDataRegion[0].HCP_START_CROP				= centerRegion.HCP_START_CROP;
				this.oViewModel.oData.oWindowDataRegion[0].HCP_END_CROP					= centerRegion.HCP_END_CROP;
				this.oViewModel.oData.oWindowDataRegion[0].HCP_PLANTING_AREA			= this.validateDot(centerRegion.HCP_PLANTING_AREA);
				this.oViewModel.oData.oWindowDataRegion[0].HCP_PRODUCTIVITY 			= this.validateDot(centerRegion.HCP_PRODUCTIVITY);
				this.oViewModel.oData.oWindowDataRegion[0].HCP_COMMERCIALIZATION 		= this.validateDot(centerRegion.HCP_COMMERCIALIZATION);
				this.oViewModel.oData.oWindowDataRegion[0].HCP_TOTAL_PRODUCTION 		= this.validateDot(centerRegion.HCP_TOTAL_PRODUCTION);
				this.oViewModel.oData.oWindowDataRegion[0].HCP_RAINFALL_LEVEL			= this.validateDot(centerRegion.HCP_RAINFALL_LEVEL);
				this.oViewModel.oData.oWindowDataRegion[0].HCP_PROD_COST				= this.validateDot(centerRegion.HCP_PROD_COST);
				this.oViewModel.oData.oWindowDataRegion[0].HCP_PLANTING_STAGE			= this.validateDot(centerRegion.HCP_PLANTING_STAGE);
				this.oViewModel.oData.oWindowDataRegion[0].HCP_HARVEST_STAGE			= this.validateDot(centerRegion.HCP_HARVEST_STAGE);
				this.oViewModel.oData.oWindowDataRegion[0].HCP_GERMINATION_STAGE		= this.validateDot(centerRegion.HCP_GERMINATION_STAGE);
				this.oViewModel.oData.oWindowDataRegion[0].HCP_VEG_DEV_STAGE			= this.validateDot(centerRegion.HCP_VEG_DEV_STAGE);
				this.oViewModel.oData.oWindowDataRegion[0].HCP_FLOWERING_STAGE			= this.validateDot(centerRegion.HCP_FLOWERING_STAGE);
				this.oViewModel.oData.oWindowDataRegion[0].HCP_GRAIN_FORMATION_STAGE	= this.validateDot(centerRegion.HCP_GRAIN_FORMATION_STAGE);
				this.oViewModel.oData.oWindowDataRegion[0].HCP_GRAIN_FILLING_STAGE		= this.validateDot(centerRegion.HCP_GRAIN_FILLING_STAGE);
				this.oViewModel.oData.oWindowDataRegion[0].HCP_MATURATION_STAGE 		= this.validateDot(centerRegion.HCP_MATURATION_STAGE);
				
			}
			
			let valueTotal = this.validateDot(this.calculationTotal(this.oViewModel.oData.oWindowDataRegion[0]));
			
			this.oViewModel.oData.oWindowDataRegion[0].HCP_TOTAL_PERCENTAGE	= valueTotal >= 99.97 && valueTotal <= 100.03 ? 100 : valueTotal;		
		},

		validateForm: function () {

			let enableSave = true;
			
			for (let line = 0; line < Object.keys(this.oViewModel.oData.oWindowTableData).length; line++) {
				let lineTable = this.oViewModel.oData.oWindowTableData[line];
				
				
				if(this.oViewModel.oData.oldCrop){
					if ( this.isNotEmptyOrNull(lineTable.HCP_COMMERCIALIZATION) ){
						enableSave = false;
						break;
					}
				}else{
					if (     this.isNotEmptyOrNull(this.oViewModel.oData.oWindowDataRegion[0].HCP_CROP_CONDITION)
						  || this.isNotEmptyOrNull(this.oViewModel.oData.oWindowDataRegion[0].HCP_TECH_LEVEL)
						  || this.isNotEmptyOrNull(lineTable.HCP_START_CROP) 
						  || this.isNotEmptyOrNull(lineTable.HCP_END_CROP) 
						  || this.isNotEmptyOrNull(lineTable.HCP_START_HRVST) 
						  || this.isNotEmptyOrNull(lineTable.HCP_END_HRVST) 
						  || this.isNotEmptyOrNull(lineTable.HCP_COMMERCIALIZATION)
						  || this.isNotEmptyOrNull(lineTable.HCP_CROP_CONDITION) 
						  || this.isNotEmptyOrNull(lineTable.HCP_TECH_LEVEL) 
						  || lineTable.HCP_TOTAL_PERCENTAGE != 100
						  || this.isNotEmptyOrNull(lineTable.HCP_PLANTING_AREA) 
						  || this.isNotEmptyOrNull(lineTable.HCP_PRODUCTIVITY) 
						  || this.isNotEmptyOrNull(lineTable.HCP_TOTAL_PRODUCTION) 
						  || this.isNotEmptyOrNull(lineTable.HCP_RAINFALL_LEVEL) 
						  || this.isNotEmptyOrNull(lineTable.HCP_PROD_COST) 
						  || this.isNotEmptyOrNull(lineTable.HCP_PLANTING_STAGE) 
						  || this.isNotEmptyOrNull(lineTable.HCP_HARVEST_STAGE)
						  || this.isNotEmptyOrNull(lineTable.HCP_GERMINATION_STAGE) 
						  || this.isNotEmptyOrNull(lineTable.HCP_VEG_DEV_STAGE) 
						  || this.isNotEmptyOrNull(lineTable.HCP_FLOWERING_STAGE) 
						  || this.isNotEmptyOrNull(lineTable.HCP_GRAIN_FORMATION_STAGE) 
						  || this.isNotEmptyOrNull(lineTable.HCP_GRAIN_FILLING_STAGE) 
						  || this.isNotEmptyOrNull(lineTable.HCP_MATURATION_STAGE) 
					) {
						enableSave = false;
						break;
					}
				}
			}
			
			this.oViewModel.setProperty("/enableSave", enableSave);
		},

		isNotEmptyOrNull: function (value) {
			return value === "" || value === null;
		},
		
		validateRules: function (Table) {
			let isCorrect = true;
			
			for (let line = 0; line < Object.keys(Table).length; line++) {
				let lineTable = Table[line];
				
				
				if(this.oViewModel.oData.oldCrop && lineTable.HCP_START_CROP == null){
					continue;
				}
				
				if(lineTable.HCP_START_CROP.getDate() == lineTable.HCP_START_HRVST.getDate() && 
				   lineTable.HCP_START_CROP.getMonth() == lineTable.HCP_START_HRVST.getMonth() &&
				   lineTable.HCP_START_CROP.getFullYear() == lineTable.HCP_START_HRVST.getFullYear()
				   ){
				   	MessageBox.error("Região: " + lineTable.HCP_BEZEI + "\n" + "O inicio da plantação deve ser maior que o inicio da colheita")
					isCorrect = false;
					break;
					
				}else if(parseFloat(lineTable.HCP_PLANTING_AREA) == 0 || parseFloat(lineTable.HCP_PRODUCTIVITY) == 0){
					let menssagePlantingArea = this.getView().getModel("i18n").getProperty("lblPlantingArea");
					let menssageProductivity = this.getView().getModel("i18n").getProperty("lblProductivity");
					MessageBox.error("Região: " + lineTable.HCP_BEZEI + "\n" + menssagePlantingArea + " e " + menssageProductivity + " tem que ser diferente de 0.")
					isCorrect = false;
					break;
					
				}else if(parseFloat(lineTable.HCP_HARVEST_STAGE) > parseFloat(lineTable.HCP_MATURATION_STAGE)){
					let menssageHarvest = this.getView().getModel("i18n").getProperty("lblHarvest");
					let menssageMaturation = this.getView().getModel("i18n").getProperty("lblMaturation");
					MessageBox.error("Região: " + lineTable.HCP_BEZEI + "\n" + menssageHarvest + " não pode ser maior que " + menssageMaturation + ".")
					isCorrect = false;
					break;
				}
			}
			
			return isCorrect;
		},
		
		onSave: async function() {
			
			if(!this.validateRules(this.oViewModel.oData.oWindowTableData))
				return null;
			
			this.setBusyDialog("App Grãos", "Salvando dados, por favor aguarde");
			this.oViewModel.oData.oTableData = [];
			this.oViewModel.oData.oTableData = Object.assign([], this.oViewModel.oData.oWindowTableData);
			this.oViewModel.oData.oTableData.push(Object.assign({}, this.oViewModel.oData.oWindowDataRegion[0]));
			
			let oDataModel = this.getOwnerComponent().getModel();
			let ServiceCrop = "/Crop_Tracking";
			
			oDataModel.setUseBatch(true);
			
			for (let line = 0; line < this.oViewModel.oData.oTableData.length; line++) {
				
				let dataLine = this.oViewModel.oData.oTableData[line];
				let oPropertiesCrop;
				let oPropertiesCommercialization;
				
				if(this.oViewModel.oData.oldCrop){
					
					oPropertiesCommercialization = await this.validateCommercialization(dataLine);
					
				}else if(dataLine.TABLE_CROP != null && (dataLine.TABLE_CROP.HCP_PERIOD == (this.getWeek() + new Date().getFullYear()))){
					
					oPropertiesCrop = this.prepareCrop(dataLine,false);
					let sPath = ServiceCrop + "("+ oPropertiesCrop.HCP_CROP_TRACK_ID + "l)";
					oDataModel.update(sPath, oPropertiesCrop, {
						groupId: "changes"
					});
					
					oPropertiesCommercialization = await this.validateCommercialization(dataLine);
					
				}else{
					oPropertiesCrop = this.prepareCrop(dataLine,true);
					oDataModel.create(ServiceCrop, oPropertiesCrop, {
						groupId: "changes"
					});
					
					oPropertiesCommercialization = await this.validateCommercialization(dataLine);
				}
			}
			
			oDataModel.submitChanges({
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
		
		prepareCrop: function(data,create){
			
			let oProperty = {
				//Data da tela
				HCP_START_CROP: 			data.HCP_START_CROP,
				HCP_END_CROP:				data.HCP_END_CROP,
				HCP_START_HRVST:			data.HCP_START_HRVST,
				HCP_END_HRVST:				data.HCP_END_HRVST,
				HCP_PLANTING_AREA:			parseFloat(data.HCP_PLANTING_AREA).toFixed(2),
				HCP_PRODUCTIVITY:			parseFloat(data.HCP_PRODUCTIVITY).toFixed(2),
				HCP_TOTAL_PRODUCTION:		parseFloat(data.HCP_TOTAL_PRODUCTION).toFixed(2),
				HCP_RAINFALL_LEVEL: 		parseFloat(data.HCP_RAINFALL_LEVEL).toFixed(2),
				HCP_CROP_CONDITION: 		data.HCP_CROP_CONDITION,
				HCP_TECH_LEVEL: 			data.HCP_TECH_LEVEL,
				HCP_PROD_COST:				parseFloat(data.HCP_PROD_COST).toFixed(2),
				HCP_PLANTING_STAGE: 		parseFloat(data.HCP_PLANTING_STAGE).toFixed(2),
				HCP_HARVEST_STAGE:			parseFloat(data.HCP_HARVEST_STAGE).toFixed(2),
				HCP_GERMINATION_STAGE:		parseFloat(data.HCP_GERMINATION_STAGE).toFixed(2),
				HCP_VEG_DEV_STAGE:			parseFloat(data.HCP_VEG_DEV_STAGE).toFixed(2),
				HCP_FLOWERING_STAGE:		parseFloat(data.HCP_FLOWERING_STAGE).toFixed(2),
				HCP_GRAIN_FORMATION_STAGE:	parseFloat(data.HCP_GRAIN_FORMATION_STAGE).toFixed(2),
				HCP_GRAIN_FILLING_STAGE:	parseFloat(data.HCP_GRAIN_FILLING_STAGE).toFixed(2),
				HCP_MATURATION_STAGE:		parseFloat(data.HCP_MATURATION_STAGE).toFixed(2),
				
				//Data Base
				HCP_REGIO:		data.HCP_REGIO,
				HCP_CROP:		this.oViewModel.oData.oURLparameter.HCP_CROP_ID, 
				HCP_STATE:		this.oViewModel.oData.oURLparameter.HCP_STATE_ACRONYM,
				HCP_MATERIAL:	this.oViewModel.oData.oURLparameter.HCP_MATERIAL,
			}
				
			if(create){
				oProperty = {
					...oProperty,
					HCP_CROP_TRACK_ID: new Date().getTime().toFixed(),
					HCP_UNIQUE_KEY: this.generateUniqueKey(),
					HCP_PERIOD: this.getWeek() + new Date().getFullYear(),
					HCP_PLATAFORM: '2',
					HCP_CREATED_BY: this.userName,
					HCP_CREATED_AT: new Date()
				}
			}else{
				oProperty = {
					...oProperty,
					HCP_CROP_TRACK_ID: data.TABLE_CROP.HCP_CROP_TRACK_ID,
					HCP_UPDATED_BY: this.userName,
					HCP_UPDATED_AT: new Date(),
				}
			}
			return oProperty;
		},
		
		validateCommercialization: async function(linhaTabela){
			
			let oDataModel = this.getOwnerComponent().getModel();
			let dataCommercialization = null;
			let ServiceCommercialization = "/Commercialization"
			
			if(linhaTabela.TABLE_COMMERCIALIZATION){
				dataCommercialization = linhaTabela.TABLE_COMMERCIALIZATION;
			}else{
				dataCommercialization = await this.getCommercialization(linhaTabela.HCP_REGIO)
			}
			
			let capacityTonne = parseFloat((linhaTabela.HCP_COMMERCIALIZATION/100)*linhaTabela.HCP_TOTAL_PRODUCTION);
			let totalAvailable = parseFloat(linhaTabela.HCP_TOTAL_PRODUCTION) - capacityTonne;
			
			let oProperty = {
				HCP_CAPACITY_TONNE: parseFloat(capacityTonne).toFixed(),
				HCP_CAPACITY_PERCENT: parseFloat(linhaTabela.HCP_COMMERCIALIZATION).toFixed(2),
				HCP_TOTAL_CROP_TRACK: parseInt(linhaTabela.HCP_TOTAL_PRODUCTION).toFixed(2),
				HCP_TOTAL: parseFloat(totalAvailable).toFixed(2), 
				//Data Base
				HCP_REGIO:		linhaTabela.HCP_REGIO,
				HCP_CROP:		this.oViewModel.oData.oURLparameter.HCP_CROP_ID, 
				HCP_STATE:		this.oViewModel.oData.oURLparameter.HCP_STATE_ACRONYM,
				HCP_MATERIAL:	this.oViewModel.oData.oURLparameter.HCP_MATERIAL,
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
	});
}, /* bExport= */ true);