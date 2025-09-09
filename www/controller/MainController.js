sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (BaseController, History, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.MainController", {
		
		prepareDataBtCrops: function (oCrops) {
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
				HCP_COMMERCIALIZATION: 0,
				quantity: 0
			};

			var calcTotalCropArea = Number(0);
			var calcTotalProduction = Number(0);
			var calcPlanting = Number(0);
			var calcGerm = Number(0);
			var calcVeg = Number(0);
			var calcFlower = Number(0);
			var calcFormation = Number(0);
			var calcFill = Number(0);
			var calcMaturation = Number(0);
			var calcHarv = Number(0);
			var calcCommercialization = Number(0);
			
			let cropLength = oCrops.length ? oCrops.length : Object.keys(oCrops).length;

			for (var m = 0; m < cropLength; m++) {
				
				// if(oCrops[m].TABLE_CROP != null){
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
					
					if (oCrops[m].HCP_COMMERCIALIZATION) {
						if (oCrops[m].HCP_COMMERCIALIZATION > oCompareCrops.HCP_COMMERCIALIZATION || oCompareCrops.HCP_COMMERCIALIZATION ==	null) {
							oCompareCrops.HCP_COMMERCIALIZATION = oCrops[m].HCP_COMMERCIALIZATION;
						}
					}else {
						oCrops[m].HCP_COMMERCIALIZATION = 0;
					}
	
					calcTotalCropArea = Number(calcTotalCropArea + Number(oCrops[m].HCP_PLANTING_AREA)); //ha
					calcTotalProduction = Number(calcTotalProduction + Number(oCrops[m].HCP_TOTAL_PRODUCTION)); //ha
	
					//calcPlanting = parseFloat(oCrops[m].HCP_PLANTING_STAGE).toFixed(2) * parseFloat(oCrops[m].HCP_TOTAL_PRODUCTION).toFixed(2);
					//oCompareCrops.HCP_PLANTING_STAGE = Number(parseFloat(oCompareCrops.HCP_PLANTING_STAGE).toFixed(2)) + Number(parseFloat(calcPlanting).toFixed(2));
	
					calcPlanting = parseFloat(calcPlanting) + (parseFloat(oCrops[m].HCP_PLANTING_STAGE) * parseFloat(oCrops[m].HCP_PLANTING_AREA)); //ha
					calcGerm = parseFloat(calcGerm) + (parseFloat(oCrops[m].HCP_GERMINATION_STAGE) * parseFloat(oCrops[m].HCP_PLANTING_AREA)); //ha
					calcVeg = parseFloat(calcVeg) + (parseFloat(oCrops[m].HCP_VEG_DEV_STAGE) * parseFloat(oCrops[m].HCP_PLANTING_AREA)); //ha
					calcFlower = parseFloat(calcFlower) + (parseFloat(oCrops[m].HCP_FLOWERING_STAGE) * parseFloat(oCrops[m].HCP_PLANTING_AREA)); //ha
					calcFormation = parseFloat(calcFormation) + (parseFloat(oCrops[m].HCP_GRAIN_FORMATION_STAGE) * parseFloat(oCrops[m].HCP_PLANTING_AREA)); //ha
					calcFill = parseFloat(calcFill) + (parseFloat(oCrops[m].HCP_GRAIN_FILLING_STAGE) * parseFloat(oCrops[m].HCP_PLANTING_AREA)); //ha
					calcMaturation = parseFloat(calcMaturation) + (parseFloat(oCrops[m].HCP_MATURATION_STAGE) * parseFloat(oCrops[m].HCP_PLANTING_AREA)); //ha
					calcHarv = parseFloat(calcHarv) + (parseFloat(oCrops[m].HCP_HARVEST_STAGE) * parseFloat(oCrops[m].HCP_PLANTING_AREA)); //ha
					calcCommercialization = parseFloat(calcCommercialization) + (parseFloat(oCrops[m].HCP_COMMERCIALIZATION) * parseFloat(oCrops[m].HCP_TOTAL_PRODUCTION)); //ha
					//Fecha itens CR2
					oCompareCrops.HCP_PLANTING_AREA = parseFloat(oCompareCrops.HCP_PLANTING_AREA) + parseFloat(oCrops[m].HCP_PLANTING_AREA);
					oCompareCrops.HCP_TOTAL_PRODUCTION = Number(parseFloat(oCompareCrops.HCP_TOTAL_PRODUCTION).toFixed(2)) + Number(parseFloat(oCrops[m].HCP_TOTAL_PRODUCTION).toFixed(2));
					oCompareCrops.HCP_RAINFALL_LEVEL = parseFloat(oCompareCrops.HCP_RAINFALL_LEVEL) + parseFloat(oCrops[m].HCP_RAINFALL_LEVEL);
					oCompareCrops.HCP_PROD_COST = parseFloat(oCompareCrops.HCP_PROD_COST) + parseFloat(oCrops[m].HCP_PROD_COST);
					oCompareCrops.quantity = oCompareCrops.quantity + 1;
				//	} 
			}

			oCompareCrops.HCP_PRODUCTIVITY = this.validateZeroDivision(parseFloat(oCompareCrops.HCP_TOTAL_PRODUCTION), parseFloat(oCompareCrops.HCP_PLANTING_AREA));
			oCompareCrops.HCP_RAINFALL_LEVEL = this.validateZeroDivision(parseFloat(oCompareCrops.HCP_RAINFALL_LEVEL), cropLength)
			oCompareCrops.HCP_PROD_COST = this.validateZeroDivision(parseFloat(oCompareCrops.HCP_PROD_COST), cropLength)

			//CR2
			oCompareCrops.HCP_PLANTING_STAGE = this.validateZeroDivision(Number(parseFloat(calcPlanting)), Number(parseFloat(calcTotalCropArea)) ); //%
			oCompareCrops.HCP_GERMINATION_STAGE = this.validateZeroDivision(Number(parseFloat(calcGerm)), Number(parseFloat(calcTotalCropArea)) ); //%
			oCompareCrops.HCP_VEG_DEV_STAGE = this.validateZeroDivision(Number(parseFloat(calcVeg)), Number(parseFloat(calcTotalCropArea)) ); //%
			oCompareCrops.HCP_FLOWERING_STAGE = this.validateZeroDivision(Number(parseFloat(calcFlower)), Number(parseFloat(calcTotalCropArea)) ); //%
			oCompareCrops.HCP_GRAIN_FORMATION_STAGE = this.validateZeroDivision(Number(parseFloat(calcFormation)), Number(parseFloat(calcTotalCropArea)) ); //%
			oCompareCrops.HCP_GRAIN_FILLING_STAGE = this.validateZeroDivision(Number(parseFloat(calcFill)), Number(parseFloat(calcTotalCropArea)) ); //%
			oCompareCrops.HCP_MATURATION_STAGE = this.validateZeroDivision(Number(parseFloat(calcMaturation)), Number(parseFloat(calcTotalCropArea)) ); //%
			oCompareCrops.HCP_HARVEST_STAGE = this.validateZeroDivision(Number(parseFloat(calcHarv)), Number(parseFloat(calcTotalCropArea)) ); //%
			oCompareCrops.HCP_COMMERCIALIZATION = this.validateZeroDivision(Number(parseFloat(calcCommercialization)), Number(parseFloat(calcTotalProduction)) ); //%
			//Fecha itens CR2

			return oCompareCrops;
		},
		
		prepareEqualize: async function(Component,VisitForm){
			
			let equalizeFunction = false;
			
			for (var i = 0; i < Component.cultureType.length; i++) {
				
				if (Component.cultureType[i].status !== "Deleted") {
			
					var aDataCultureType = {
						HCP_PROVIDER_ID: Component.HCP_PROVIDER_ID,
						HCP_VISIT_TYPE: VisitForm == 'Periodic' ? 'Yearly' : 'Periodic',
						HCP_CULTURE_TYPE: Component.cultureType[i].HCP_CULTURE_TYPE,
						HCP_SAFRA_YEAR: Component.cultureType[i].HCP_SAFRA_YEAR,
						HCP_HECTARE_PLANT_AREA: parseFloat(Component.cultureType[i].HCP_HECTARE_PLANT_AREA).toFixed(2),
						HCP_PRODUCTIVITY: parseFloat(Component.cultureType[i].HCP_PRODUCTIVITY).toFixed(2),
						HCP_PRODUCTIVITY_TOTAL: parseFloat(Component.cultureType[i].HCP_PRODUCTIVITY_TOTAL).toFixed(2),
						HCP_UPDATED_BY: this.userName,
					};
					
					let returnEqualizeFunction = await this.EqualizeVisitForm(aDataCultureType);													   
																			   
					if(returnEqualizeFunction == true && equalizeFunction == false)
						equalizeFunction = true;
				}
			}	
			
			return equalizeFunction;
		},
		
		validateZeroDivision: function (numerator, denominator) {
			if (denominator == 0) {
				return numerator;
			} else {
				return numerator / denominator;
			}
		},
		
		EqualizeVisitForm: async function(aDataCultureType){
			
			let oDataModel = this.getOwnerComponent().getModel();
			let Service = "/Visit_Culture_Type";
			let returnFunction = false;
			
			let aFilters = [];
			
			aFilters.push(new sap.ui.model.Filter("HCP_VISIT_TYPE", sap.ui.model.FilterOperator.Contains, aDataCultureType.HCP_VISIT_TYPE));
			aFilters.push(new sap.ui.model.Filter("HCP_PROVIDER_ID", sap.ui.model.FilterOperator.Contains, aDataCultureType.HCP_PROVIDER_ID));
			aFilters.push(new sap.ui.model.Filter("HCP_CULTURE_TYPE", sap.ui.model.FilterOperator.Contains, aDataCultureType.HCP_CULTURE_TYPE));
			aFilters.push(new sap.ui.model.Filter("HCP_SAFRA_YEAR", sap.ui.model.FilterOperator.Contains, aDataCultureType.HCP_SAFRA_YEAR));
			
			const dataSimplifiedContact = await new Promise(function (resolve, reject) {
			    oDataModel.read(Service, {
			        filters: aFilters,
			        sorters: [new sap.ui.model.Sorter("HCP_VISIT_ID", true)],
			        success: function (data) {
			            resolve(data.results[0] != undefined ? data.results[0] : false);
			        }.bind(this),
			        error: function (oError) {
			            reject(oError);
			        }.bind(this),
			    });
			});
			
			if(dataSimplifiedContact){
				
				let	sPath = Service + "(" + dataSimplifiedContact.HCP_VISIT_ID + "l)";
				
				let oProperties = {
					HCP_HECTARE_PLANT_AREA: aDataCultureType.HCP_HECTARE_PLANT_AREA,
					HCP_PRODUCTIVITY: aDataCultureType.HCP_PRODUCTIVITY,
					HCP_PRODUCTIVITY_TOTAL: aDataCultureType.HCP_PRODUCTIVITY_TOTAL,
					HCP_UPDATED_BY: aDataCultureType.HCP_UPDATED_BY,
					HCP_UPDATED_AT: new Date()
				};
				
				if(aDataCultureType.HCP_VISIT_TYPE == 'Yearly'){
					
					let qtdeCommercialized = aDataCultureType.HCP_PRODUCTIVITY_TOTAL * (dataSimplifiedContact.HCP_SAFRA_PERCENTAGE / 100);
					let sTotal = Number(aDataCultureType.HCP_PRODUCTIVITY_TOTAL) - qtdeCommercialized;
					oProperties["HCP_AVAILABLE_VOLUME"] = parseFloat(sTotal).toFixed(2);                                 
				}
				
				const resolveData = await new Promise(function (resove, reject) {
					oDataModel.update(sPath, oProperties, {
						success: function (data) {
							resove(true);
						}.bind(this),
						error: function (oError) {
							reject(oError);
						}.bind(this),
					});
				});
				
				if(resolveData)
					returnFunction = true;
			}
			return returnFunction;
		},
		
		getBusinessVisit: async function(oldMonth){
			
			let oDataModel = this.getOwnerComponent().getModel();
			var oModel = this.getView().getModel("indexModel");
			let DateValue = new Date();
            
            let Service = "/Business_Visit";
            
            if(oldMonth)
				DateValue.setMonth(DateValue.getMonth() - 1);
            
            var oFirstDayOfMonth = DateValue;
                oFirstDayOfMonth.setDate(1);
                oFirstDayOfMonth.setHours(0, 0, 0, 0);
                
            var oLastDayOfMonth = new Date(oFirstDayOfMonth);
	            oLastDayOfMonth.setMonth(oLastDayOfMonth.getMonth() + 1);
	            oLastDayOfMonth.setDate(0);
	            oLastDayOfMonth.setHours(20, 0, 0, 0);

            let oFilter = new sap.ui.model.Filter({
                    path: "HCP_DATE",
                    operator: sap.ui.model.FilterOperator.BT,
                    value1: oFirstDayOfMonth,
                    value2: oLastDayOfMonth
                });
			
			let data = await new Promise(function (resove, reject) {
                oDataModel.read(Service, {
                	urlParameters: {
						"$expand": 'Ranking_Add,Ranking_Add/Ranking_Name'
					},
                	filters: [oFilter],
                    success: function (data) {
                        resove(data?.results[0]?.Ranking_Add?.results);
                    }.bind(this),
                    error: function (oError) {
                        reject(oError);
                    }.bind(this),
                });
            }); 
            
            if(data)
            	return data;
            else
            	return null;
		},
		
		
		updateSimplifyContact: async function(PARTNER , PARTNERNAME){
			
			let oDataModel = this.getOwnerComponent().getModel();
			let Service = "/Simplified_Contact";
			
			let oFilterPartner = new sap.ui.model.Filter("HCP_PARTNER", sap.ui.model.FilterOperator.EQ, PARTNER);
			let oFilterPartnerName = new sap.ui.model.Filter("HCP_PARTNER_NAME", sap.ui.model.FilterOperator.EQ, PARTNERNAME);
			
			let oCombinedFilter = new sap.ui.model.Filter({
			    filters: [oFilterPartner, oFilterPartnerName],
			    and: false
			});
			
			const dataSimplifiedContact = await new Promise(function (resolve, reject) {
			    oDataModel.read(Service, {
			        filters: [oCombinedFilter],
			        success: function (data) {
			            resolve(data.results[0] != undefined ? data.results[0] : false);
			        }.bind(this),
			        error: function (oError) {
			            reject(oError);
			        }.bind(this),
			    });
			});
			
			if(dataSimplifiedContact){
				
				let	sPath = Service + "(" + dataSimplifiedContact.HCP_ID + "l)";
				
				let oProperties = {
					HCP_VISIT_FORM: 1,
					HCP_UPDATED_BY_VISIT_FORM: this.userName,
					HCP_UPDATED_AT_VISIT_FORM: new Date()
				};
				
				await new Promise(function (resove, reject) {
					oDataModel.update(sPath, oProperties, {
						success: function (data) {
							resove(data);
						}.bind(this),
						error: function (oError) {
							reject(oError);
						}.bind(this),
					});
				});
			}
		},
		
		validateSubmiteChange: function(data){
			let returnValue = true;
			
			for(let i = 0; i < data?.__batchResponses[0]?.__changeResponses?.length; i++){
				returnValue = data.__batchResponses[0].__changeResponses[i].statusCode < 400 ? true : false;
				
				if(!returnValue)
					return false;
			}
			
			return returnValue;
		},

		getUser: function () {

			var self = this;
			return new Promise(function (resolve, reject) {

				var oComponent = this.getOwnerComponent();
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.userName = oComponent.userName;

				if (this.userName === null || this.userName === undefined || this.userName === '' || this.userName === 'none') {

					setTimeout((function () {
						oComponent.loadUser().then(function () {
							if (oComponent.userName) {
								this.userName = oComponent.userName;
								self.checkOpid(this.userName).then(function (userName) {
									resolve(userName);
								}.bind(this));

							} else {
								oRouter.navTo("errorPages.noUserFound");
							}

						}.bind(this)).catch(function () {
							oRouter.navTo("errorPages.noUserFound");
						}.bind(this));
					}), 1500);
				} else {
					this.checkOpid(this.userName).then(function (userName) {
						resolve(userName);
					}.bind(this));
				}

			}.bind(this));
		},
		
		getWeek: function () {
			let oDate = new Date();
			let oYear = oDate.getFullYear();
			let firstDayofYear = new Date(oYear, 0, 1);
			  
			let diff = oDate - firstDayofYear;
			let oWeek = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
			
			if(oWeek < 10){
				if (oWeek == 0){
					oWeek = 1;
				}
				oWeek = "0" + oWeek.toString();
			}else {
				oWeek =	oWeek.toString();
			}

			return oWeek;
		},

		checkIntentions: function () {
			return new Promise(function (resolve, reject) {
				var oModel = this.getView().getModel();
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_CREATED_BY',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: this.userName
				}));

				oModel.read("/Price_Intention", {
					filters: aFilters,
					urlParameters: {
						"$expand": "View_Intention_Suppliers,View_Intention_Material_Type"
					},
					success: function (oIntentions) {
						// console.log(oIntentions);
						var aPromises = [];

						for (var intention of oIntentions.results) {

							if (intention.HCP_STATUS === "1") {
								aPromises.push(new Promise(function (resolve, reject) {
									var currIntention = intention;
									var aPriceTableFilters = [];

									aPriceTableFilters.push(new sap.ui.model.Filter({
										path: 'FND_YEAR',
										operator: sap.ui.model.FilterOperator.EQ,
										value1: currIntention.HCP_YEAR
									}));
									aPriceTableFilters.push(new sap.ui.model.Filter({
										path: 'MATNR',
										operator: sap.ui.model.FilterOperator.EQ,
										value1: currIntention.HCP_MATERIAL
									}));
									aPriceTableFilters.push(new sap.ui.model.Filter({
										path: 'TPCEREAL',
										operator: sap.ui.model.FilterOperator.EQ,
										value1: currIntention.HCP_TPCEREAL
									}));
									aPriceTableFilters.push(new sap.ui.model.Filter({
										path: 'WERKS',
										operator: sap.ui.model.FilterOperator.EQ,
										value1: currIntention.HCP_CENTER
									}));
									aPriceTableFilters.push(new sap.ui.model.Filter({
										path: 'EKGRP',
										operator: sap.ui.model.FilterOperator.EQ,
										value1: currIntention.HCP_BUYER_GROUP
									}));

									oModel.read("/Table_Price", {
										filters: aPriceTableFilters,
										success: data => {
											if (data.results.length > 0) {
												var oPrice = data.results[0];
												var sMonth = currIntention["HCP_MONTH"].length > 1 ? currIntention["HCP_MONTH"] : "0" + currIntention[
													"HCP_MONTH"];
												var aMonthPrice = oPrice["PRECO_" + sMonth];
												var oMonthValidity = new Date(this.formatDate(oPrice["VIGENCIA_" + sMonth]));

												resolve({
													processed: currIntention,
													rawPrice: aMonthPrice,
													validity: oMonthValidity
												});
											} else {
												resolve();
											}
										},
										error: function (error) {
											reject(error);
										}
									});
								}.bind(this)));
							}
						}

						Promise.all(aPromises).then(function (results) {
							resolve(results);
						}.bind(this)).catch(function (error) {
							console.log(error);
						}.bind(this));
					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});
			}.bind(this));
		},

		getValidIntentions: function (oIntentions) {
			var aValidIntentions = [];
			var oCurrData = new Date();

			oCurrData.setHours(0);
			oCurrData.setSeconds(0);
			oCurrData.setMinutes(0);

			for (var item of oIntentions) {
				if (item !== undefined) {
					if (item.processed["@com.sap.vocabularies.Offline.v1.isLocal"] !== true) {
						var oIntention = item.processed;
						var aPrice = item.rawPrice;
						var oValidityData = item.validity;
						var bDateIsValid = oCurrData > oValidityData ? false : true;
						var bDateIsEqual = oCurrData.toUTCString() === oValidityData.toUTCString() ? true : false;

						if (oValidityData instanceof Date && isFinite(oValidityData)) {
							if (bDateIsValid || bDateIsEqual) {
								if (oIntention.HCP_MIN_PRICE === "0") {
									if (parseFloat(aPrice) >= parseFloat(oIntention.HCP_PRICE)) {
										aValidIntentions.push(item);
									}
								} else {
									if (parseFloat(aPrice) >= parseFloat(oIntention.HCP_MIN_PRICE)) {
										aValidIntentions.push(item);
									}
								}
							}
						}
					}
				}
			}
			return aValidIntentions;
		},

		setupIntentionMessages: function (aValidIntentions) {
			this.oMessageModel = new sap.ui.model.json.JSONModel();
			this.oMessageModel.setProperty("/", aValidIntentions);
			this.oMessageModel.refresh();
		},
		
		createMessageDialog: async function (props) {
			let oModelIndex = this.getView().getModel("indexModel");
			let aMockMessages
			var oLink = new sap.m.Link({
				text: oModelIndex.oData.hasPartnerVisitFormPending,
				href: ""
			});
			
			var oMessageTemplateTesting = new sap.m.MessageItem({
				type: '{type}',
				title: '{title}',
				description: '{description}',
				subtitle: '{subtitle}',
				counter: '{counter}',
				markupDescription: '{markupDescription}',
				link: oLink
			});

			var oBackButton = new sap.m.Button({
				icon: sap.ui.core.IconPool.getIconURI("nav-back"),
				visible: false,
				press: function () {
					this.oMessageView.navigateBack();
					oBackButton.setVisible(false);
				}.bind(this)
			});
			
			if (oModelIndex.oData.hasPartnerVisitFormPending > 0) {
				aMockMessages = [{
					type: 'Warning',
					title: 'Quantidade de Fornecedores sem Ficha de Visita no mês atual',
					counter: oModelIndex.oData.hasPartnerVisitFormPending                               
				}];
			}
			
			var oModel = new JSONModel();

			oModel.setData(aMockMessages);
			
			this.getView().getModel("indexModel").setProperty("/messageCounter", oModelIndex.oData.hasPartnerVisitFormPending > 0 ? 1 : 0);
			
			this.oMessageView = new sap.m.MessageView({
				showDetailsPageHeader: false,
				itemSelect: function () {
					oBackButton.setVisible(true);
				},
				items: {
					path: "/",
					template: oMessageTemplateTesting
				}
			});
			
			this.oMessageView.setModel(oModel);

			if (this.oMessageDialog) {
				this.oMessageDialog.close();
			}

			this.oMessageDialog = new sap.m.Dialog({
				resizable: true,
				content: this.oMessageView,
				state: 'Success',
				beginButton: new sap.m.Button({
					press: function () {
						this.getParent().close();
					},
					text: "Fechar"
				}),
				customHeader: new sap.m.Bar({
					contentMiddle: [
						new sap.m.Text({
							text: "Mensagens"
						})
					],
					contentLeft: [oBackButton]
				}),
				contentHeight: "300px",
				contentWidth: "500px",
				verticalScrolling: false
			});
		},

		showMessageDialog: async function () {
			await this.createMessageDialog();
			this.oMessageDialog.open();
		},

		// createMessageDialog: function () {
		// 	var oLink = new sap.m.Link({
		// 		text: "Ligar para {processed/HCP_TEL_LOCAL}",
		// 		href: "tel:{processed/HCP_TEL_LOCAL}"
		// 	});

		// 	var oMessageTemplate = new sap.m.MessageItem({
		// 		type: '{= ${processed/HCP_READ_MESSAGE} === "0" ? "Warning" : "Success" }',
		// 		title: 'Intenção {processed/HCP_PRICE_INTENTION_ID} atingiu o preço.',
		// 		description: 'A intenção {processed/HCP_PRICE_INTENTION_ID}, cadastrada com o preço {= ${processed/HCP_MIN_PRICE} === "0" ? "" : "mínimo "}R$ {= ${processed/HCP_MIN_PRICE} === "0" ? parseFloat(${processed/HCP_PRICE}).toFixed(2) : parseFloat(${processed/HCP_MIN_PRICE}).toFixed(2)} atingiu o preço do dia de R$ {= parseFloat(${rawPrice}).toFixed(2)}. Entre em contato com o fornecedor {processed/View_Intention_Suppliers/NAME1}',
		// 		subtitle: '{= ${processed/HCP_READ_MESSAGE} === "0" ? "Não lida" : "Lida" }',
		// 		counter: '{counter}',
		// 		markupDescription: '{markupDescription}',
		// 		link: oLink
		// 	});

		// 	var oBackButton = new sap.m.Button({
		// 		icon: sap.ui.core.IconPool.getIconURI("nav-back"),
		// 		visible: false,
		// 		press: function () {
		// 			this.oMessageView.navigateBack();
		// 			oBackButton.setVisible(false);
		// 		}.bind(this)
		// 	});

		// 	this.oMessageView = new sap.m.MessageView({
		// 		showDetailsPageHeader: false,
		// 		itemSelect: function (oSource) {
		// 			var oItem = oSource.getParameter("item");
		// 			var sPath = oItem.getBindingContext().getPath();
		// 			var oData = this.oMessageModel.getProperty(sPath);
		// 			var oModel = this.getView().getModel();

		// 			if (oData) {
		// 				var oIntention = oData.processed;

		// 				if (oIntention.HCP_READ_MESSAGE === "0") {
		// 					oModel.update("/Price_Intention(" + oIntention.HCP_PRICE_INTENTION_ID + ")", {
		// 						HCP_READ_MESSAGE: "1"
		// 					}, {
		// 						success: function (msg) {
		// 							this.flushStore("Price_Intention").then(function () {
		// 								this.refreshStore("Price_Intention").then(function () {
		// 									oData.processed.HCP_READ_MESSAGE = "1";
		// 									this.oMessageModel.refresh();
		// 									var sUnreadMessages = this.oMessageModel.getData().filter(message => message.processed.HCP_READ_MESSAGE === "0").length;
		// 									this.getView().getModel("indexModel").setProperty("/messageCounter", sUnreadMessages > 0 ? sUnreadMessages : 0);
		// 								}.bind(this));
		// 							}.bind(this));
		// 						}.bind(this),
		// 						error: function (error) {
		// 							console.log(error);
		// 						}
		// 					});
		// 				}
		// 			}
		// 			oBackButton.setVisible(true);
		// 		}.bind(this),
		// 		items: {
		// 			path: "/",
		// 			template: oMessageTemplate
		// 		}
		// 	}).addStyleClass("messageModal");

		// 	this.oMessageView.setModel(this.oMessageModel);

		// 	if (this.oMessageDialog) {
		// 		this.oMessageDialog.close();
		// 	}

		// 	this.oMessageDialog = new sap.m.Dialog({
		// 		resizable: true,
		// 		content: this.oMessageView,
		// 		state: 'Success',
		// 		beginButton: new sap.m.Button({
		// 			press: function () {
		// 				this.getParent().close();
		// 			},
		// 			text: "Fechar"
		// 		}),
		// 		customHeader: new sap.m.Bar({
		// 			contentMiddle: [
		// 				new sap.m.Text({
		// 					text: "Mensagens"
		// 				})
		// 			],
		// 			contentLeft: [oBackButton]
		// 		}),
		// 		contentHeight: "300px",
		// 		contentWidth: "500px",
		// 		verticalScrolling: false
		// 	});
		// },

		checkOpid: function (aUserName) {
			return new Promise(function (resolve, reject) {

				var oModel = this.getOwnerComponent().getModel();

				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'OPID',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: aUserName.toString().toUpperCase()
				}));

				oModel.read("/View_Users", {
					filters: aFilters,
					success: function (oData) {
						if (oData.results.length > 0) {
							if (oData.results[0].BNAME) {
								this.getOwnerComponent().userName = oData.results[0].BNAME;
								resolve(this.getOwnerComponent().userName);
							} else {
								resolve(aUserName);
							}

						} else {
							resolve(aUserName);
						}
					}.bind(this),
					error: function (error) {
						console.log(error);
						resolve(aUserName);
					}
				});
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
		checkUserInfo: function (aUserName) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getOwnerComponent().getModel();

				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'BNAME',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: aUserName.toString().toUpperCase()
				}));

				oModel.read("/View_Users", {
					filters: aFilters,
					success: function (oData) {
						if (oData.results.length > 0) {
							resolve(oData.results[0]);
						} else {
							var array = [];
							resolve(array);
						}
						//this.closeBusyDialog();
					}.bind(this),
					error: function () {
						//	MessageBox.error("Erro ao buscar grupo de compra.");
						//this.closeBusyDialog();
						resolve(false);
					}
				});

			}.bind(this));
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
		getTimeZoneData: function (date, isStartDate) {
			var newDate = new Date();
			var timezone = newDate.getTimezoneOffset() * 60 * 1000;
			var formatedDate;

			if (isStartDate) {
				formatedDate = new Date(new Date(date).setHours(0, 0, 0));
			} else {
				formatedDate = new Date(new Date(date).setHours(23, 59, 59));
			}

			formatedDate = formatedDate.setTime(formatedDate.getTime() - timezone);

			return formatedDate;
		},

		getTimeZoneDataFilter: function (date, isStartDate) {
			var newDate = new Date();
			var timezone = newDate.getTimezoneOffset() * 60 * 1000;
			var formatedDate;

			if (isStartDate) {
				formatedDate = new Date(new Date(date).setHours(0, 0, 0));
			} else {
				formatedDate = new Date(new Date(date).setHours(23, 59, 59));
			}

			formatedDate = formatedDate.setTime(formatedDate.getTime() + timezone);

			return formatedDate;
		},

		formatDate: function (sDate) {
			return sDate.slice(0, 4) + "/" + sDate.slice(4, 6) + "/" + sDate.slice(6);
		},

		getExpandOffDynamic: function (oArray, oItemTable, oEntity, oKeyTable, oKeyFilter, oGetField) {

			return new Promise(function (resolve, reject) {

				if (oArray.length > 0) {

					var oModelOffer = this.getView().getModel();
					var aFilters = [];
					var aPromises = [];

					oArray = oArray.filter((v, i, a) => a.indexOf(v) === i);

					for (var data in oArray) {

						aPromises.push(new Promise(function (resolve, reject) {

							aFilters = [];
							var oArrayKey = oArray[data];

							aFilters.push(new sap.ui.model.Filter({
								path: oKeyFilter,
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oArray[data]
							}));

							var sEntity = "/" + oEntity;

							oModelOffer.read(sEntity, {

								filters: aFilters,
								success: function (results) {

									var aResults = results.results;
									if (aResults.length > 0) {
										resolve({
											results: results,
											key: oArrayKey
										});
									} else {
										resolve();
									}

								}.bind(this),
								error: function (error) {
									resolve();
								}
							});
						}.bind(this)));

					}

					Promise.all(aPromises).then(function (results) {

						if (results.length > 0) {
							for (var processed of results) {

								if (processed !== undefined) {

									var oValueKey = processed.key;
									var oFieldResult = processed.results.results[0];
									var oProcessedItem = oItemTable.filter(key => key[oKeyTable] === oValueKey);

									if (oProcessedItem) {
										if (oProcessedItem.length > 0) {
											for (var m = 0; m < oProcessedItem.length; m++) {
												oProcessedItem[m][oGetField] = oFieldResult[oGetField];
											}

										}
									}

								}

								resolve();
							}
						}

					});

				} else {
					resolve();
				}

			}.bind(this));

		},
		generateUniqueKey: function () {
			return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
				(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
			);
		},
		_getPeriod: function () {

			var oDate = new Date();
			var oYear = oDate.getFullYear();

			oDate.setHours(0, 0, 0);
			oDate.setDate(oDate.getDate() + 4 - (oDate.getDay() || 7));

			var oWeek = Math.ceil((((oDate - new Date(oDate.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
			oWeek = oWeek.toString().length == 1 ? ("0".concat(oWeek.toString())) : oWeek;
			var oPeriod = oWeek + "/" + oYear;
			return oPeriod;

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

		_onHome: function (oEvent) {

			var oHistory = History.getInstance();
			oHistory.aHistory = [];

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Index", true);

		},

		//Commodities
		submitCommoditiesEcc: function (oUniqueKey, oType, oRefresh, oCadence) {
		    return new Promise(function (resolve, reject) {
		        var oDeviceModel = this.getOwnerComponent().getModel("device");
		        var bIsMobile = oDeviceModel.getData().browser.mobile;
		        var oSuccess = false;
		
		        this.flushStore("Offer_Map, Offer_Map_Werks, Commodities_Fixed_Order, Commodities_Log_Messages, Commodities_Order, Cadence, Commodities_Check")
		            .then(function () {
		                this.updateOfferIdCommodities().then(function () {
		                    return new Promise(function (resolveDelay) {
		                        setTimeout(resolveDelay, 5000); // Atraso de 5 segundos para evitar overflow/read no mobile.
		                    });
		                })
		                .then(function () {
		                    this.verifyCommoditiesHasSeq().then(function () {
		                        this.getSearchDataCommodities(oUniqueKey, oType, oCadence).then(function (data) {
		                            var oEccModel = this.getOwnerComponent().getModel("eccModel");
		                            var aCadenceArray = data.cadence;
		                            var aDataArray = data.data;
		                            var aUniqueKeys = data.uniqueKeys;
		
		                            var oMessageLog = oUniqueKey ? true : false;
		
		                            var aCallFunction;
		                            if (!oCadence) {
		                                if (oType === "1") {
		                                    aCallFunction = "/createFixedOrder";
		                                } else if (oType === "2" || oType === "3") {
		                                    aCallFunction = "/createOrder";
		                                }
		                            } else {
		                                aCallFunction = "/editCadence";
		                            }
		
		                            if (aDataArray.length > 0) {
		                                if (!bIsMobile && oRefresh) {
		                                    this.setBusyDialog(
		                                        this.resourceBundle.getText("textGrainApp"),
		                                        this.resourceBundle.getText("messagePendingCommodities")
		                                    );
		                                }
		
		                                this.aCadenceArray = aCadenceArray;
		                                this.aDataArray = aDataArray;
		
		                                oEccModel.callFunction(aCallFunction, {
		                                    method: "GET",
		                                    urlParameters: {
		                                        cadence: JSON.stringify(aCadenceArray),
		                                        data: JSON.stringify(aDataArray)
		                                    },
		                                    success: function (results) {
		                                        var aResults = JSON.parse(results.return);
		                                        var aDates;
		
		                                        if (oType !== "1" && results.data !== "") {
		                                            aDates = JSON.parse(results.data);
		                                        }
		
		                                        if (aResults.length > 0) {
		                                            this.deleteMessageLog(aUniqueKeys).then(function () {
		                                                this.onSubmitChanges(aResults, aDates, oMessageLog).then(function (oSuccess) {
		                                                    if (!bIsMobile) {
		                                                        this.closeBusyDialog();
		                                                    }
		                                                    resolve(oSuccess);
		                                                    
		                                                    let tonExceeded = aResults.find((obj) => obj.hcpMsgnr === '860');
		                                                    if (tonExceeded !== undefined) {
		                                                        this.sendMail({...aDataArray[0], tonExceeded}, this);
		                                                    }
		                                                }.bind(this));
		                                            }.bind(this));
		                                        } else {
		                                            resolve(oSuccess);
		                                        }
		                                    }.bind(this),
		                                    error: function (error) {
		                                        if (!bIsMobile) {
		                                            this.closeBusyDialog();
		                                        }
		                                        sap.m.MessageToast.show(error);
		                                        reject(error);
		                                    }.bind(this)
		                                });
		                            } else {
		                                resolve(oSuccess);
		                            }
		                        }.bind(this));
		                    }.bind(this));
		                }.bind(this));
		            }.bind(this));
		    }.bind(this));
		},

		//Atualizar número da oferta para compras criadas offline
		updateOfferNumberOrder: function (aDataOrder, oUniqueKeyOffer, oType) {

			return new Promise(function (resolve, reject) {

				this.aDataOrder = aDataOrder;
				var oModel = this.getView().getModel();
				oModel.setUseBatch(true);
				var aDeferredGroups = oModel.getDeferredGroups();
				var aUserName = this.userName;
				var sPath;

				if (aDeferredGroups.indexOf("changes") < 0) {
					aDeferredGroups.push("changes");
					oModel.setDeferredGroups(aDeferredGroups);
				}

				if (oUniqueKeyOffer.length > 0) {

					if (oType == "1") { //Fixo
						var oEntity = "Commodities_Fixed_Order";
						var oField = "HCP_PURCHASE_ID";
					} else { //Depósito ou Transferência
						oEntity = "Commodities_Order";
						oField = "HCP_ORDER_ID";
					}

					oModel.read("/Offer_Map", {

						filters: oUniqueKeyOffer,
						success: function (results) {

							var aResults = results.results;
							if (aResults.length > 0) {

								for (var i = 0; i < aResults.length; i++) {

									var aArrayOrder = this.aDataOrder.filter(result => result.HCP_UNIQUE_KEY_OFFER === aResults[i].HCP_UNIQUE_KEY);
									if (aArrayOrder.length > 0) {

										var aDataOrder = {
											HCP_OFFER_NUMBER: aResults[0].HCP_OFFER_ID,
											HCP_UPDATED_BY: aUserName,
											HCP_UPDATED_AT: new Date()
										};

										sPath = this.buildEntityPath(oEntity, aArrayOrder[0], oField);

										oModel.update(sPath, aDataOrder, {
											groupId: "changes"
										});

									}

									oModel.submitChanges({
										groupId: "changes",
										success: function () {
											this.flushStore("Commodities_Fixed_Order,Commodities_Order").then(function () {
												this.refreshStore("Commodities_Fixed_Order", "Commodities_Order", "Commodities_Check").then(function () {
													resolve();
												}.bind(this));
											}.bind(this));

										}.bind(this),
										error: function () {
											resolve();
										}.bind(this)
									});

								}

							} else {
								resolve();
							}

						}.bind(this),
						error: function (error) {
							resolve();
						}
					});

				} else {
					resolve();
				}

			}.bind(this));

		},

		getSearchDataCommodities: function (oUniqueKey, oType, oCadence) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var aFilters = [];
				var aDataArray = [];
				var aCadenceArray = [];
				var oEntity = "/Commodities_Fixed_Order";

				if (oUniqueKey) {

					aFilters.push(new sap.ui.model.Filter({
						path: "HCP_UNIQUE_KEY",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oUniqueKey
					}));

					var oStatus = "1"; //Criado Online e está Pendente

				} else {
					oStatus = "0"; //Criado Offline e nunca enviado ao ECC
				}

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_STATUS",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oStatus
				}));

				if (oType != "1") { //Depósito ou Transferência
					oEntity = "/Commodities_Order";

					if (oType) {
						aFilters.push(new sap.ui.model.Filter({
							path: "HCP_TIPO",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oType
						}));

					}
				}
				
				//29.01.2022 Added year period filter to improve the logic of commodities update index entry
					
				this.start_year_date = new Date(new Date().getFullYear(), 0, 1);
				this.end_year_date  = new Date(new Date().getFullYear(), 11, 31);
				aFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
					.BT,
					this.start_year_date.getTime(), this.end_year_date.getTime()));
				
				//29.01.2022 end

				oModel.read(oEntity, {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;
						var aDate;
						var aDataOrder = [];

						var aFiltersKeys = [];
						var aFiltersOffer = [];

						for (var i = 0; i < aResults.length; i++) {

							aFiltersKeys.push(new sap.ui.model.Filter({
								path: "HCP_UNIQUE_KEY",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: aResults[i].HCP_UNIQUE_KEY
							}));

							aDate = aResults[i];

							if (aResults[i].HCP_UNIQUE_KEY_OFFER && !aResults[i].HCP_OFFER_NUMBER) {

								aDataOrder.push(aDate);

								aFiltersOffer.push(new sap.ui.model.Filter({
									path: "HCP_UNIQUE_KEY",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: aResults[i].HCP_UNIQUE_KEY_OFFER
								}));

							}

							if (oCadence == false) {

								this.formatterSapDate(aDate, "HCP_ZDTPGTO1").then(function (aDate) {
									this.formatterSapDate(aDate, "HCP_ZDTPGTO2").then(function (aDate) {
										this.formatterSapDate(aDate, "HCP_ZDTPGTO3").then(function (aDate) {
											this.formatterSapDate(aDate, "HCP_ZDTREMDE").then(function (aDate) {
												this.formatterSapDate(aDate, "HCP_ZDTREMATE").then(function (aDate) {
													this.formatterSapDate(aDate, "HCP_DT_ENTR_INI").then(function (aDate) {
														this.formatterSapDate(aDate, "HCP_DT_ENTR_FIM").then(function (aDate) {
															this.formatterSapDate(aDate, "HCP_CREATED_AT").then(function (aDate) {
																this.formatterSapDate(aDate, "HCP_UPDATED_AT").then(function (aDate) {
																	aDataArray.push(aDate);
																	if (oType != "1") {
																		aDataArray[0]["HCP_OPERATION"] = aDataArray[0].HCP_PEDIDO_DEP === null ? "create" : "edit";
																	}
																}.bind(this));
															}.bind(this));
														}.bind(this));
													}.bind(this));
												}.bind(this));
											}.bind(this));
										}.bind(this));
									}.bind(this));
								}.bind(this));

							} else {

								if (oType == "1") {
									var aDataOrder = {
										HCP_ID: aDate.HCP_PURCHASE_ID,
										HCP_UNIQUE_KEY: aDate.HCP_UNIQUE_KEY,
										HCP_SEQUENCE: aDate.HCP_ZSEQUE,
										HCP_TYPE: oType,
										HCP_LIFNR: aDate.HCP_LIFNR,
										HCP_MATNR: aDate.HCP_MATNR,
										HCP_WERKS: aDate.HCP_WERKS
									};
								} else {
									aDataOrder = {
										HCP_ID: aDate.HCP_ORDER_ID,
										HCP_UNIQUE_KEY: aDate.HCP_UNIQUE_KEY,
										HCP_SEQUENCE: aDate.HCP_PEDIDO_DEP,
										HCP_TYPE: oType,
										HCP_LIFNR: aDate.HCP_LIFNR,
										HCP_MATNR: aDate.HCP_MATNR,
										HCP_WERKS: aDate.HCP_WERKS,
										HCP_OPERATION: "create"
									};
								}

								aDataArray.push(aDataOrder);
							}
						}

						if (oType) {
							aFiltersKeys.push(new sap.ui.model.Filter({
								path: "HCP_TIPO",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oType
							}));
						}

							//this.updateOfferNumberOrder(aDataOrder, aFiltersOffer, oType).then(function () {
						
							//29.01.2022 Added year period filter to improve the logic of commodities update index entry
				
							aFiltersKeys.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
								.BT,
								this.start_year_date.getTime(), this.end_year_date.getTime()));
							
							//29.01.2022 end

						oModel.read("/Cadence", {

							filters: aFiltersKeys,
							success: function (results) {

								var aResults = results.results;
								var aDateCadence;

								if (aResults.length) {

									var aPromises = [];

									for (var i = 0; i < aResults.length; i++) {

										aPromises.push(new Promise(function (resolves, reject) {

											aDateCadence = aResults[i];

											this.formatterSapDate(aDateCadence, "HCP_DATA_ATUAL").then(function (aDateCadence) {

												aCadenceArray.push(aDateCadence);

												resolves();

											}.bind(this));

										}.bind(this)));
									}

									Promise.all(aPromises).then(function () {
										resolve({
											cadence: aCadenceArray,
											data: aDataArray,
											uniqueKeys: aFiltersKeys
										});
									}.bind(this));

								} else {
									resolve({
										cadence: aCadenceArray,
										data: aDataArray,
										uniqueKeys: aFiltersKeys
									});
								}

							}.bind(this),
							error: function (error) {
								reject(error);
							}
						});

						//	}.bind(this));

					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));
		},

		deleteMessageLog: function (aUniqueKey) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				oModel.setUseBatch(true);
				var aDeferredGroups = oModel.getDeferredGroups();
				var sPath;
				var aFilters = [];

				if (aDeferredGroups.indexOf("removes") < 0) {
					aDeferredGroups.push("removes");
					oModel.setDeferredGroups(aDeferredGroups);
				}

				oModel.read("/Commodities_Log_Messages", {

					filters: aUniqueKey,
					success: function (results) {

						var aResults = results.results;

						if (aResults.length > 0) {

							for (var i = 0; i < aResults.length; i++) {

								sPath = this.buildEntityPath("Commodities_Log_Messages", aResults[i], "HCP_MESSAGE_ID");

								oModel.remove(sPath, {
									groupId: "removes"
								});

							}

							oModel.submitChanges({
								groupId: "removes",
								success: function () {
									resolve();
								}.bind(this),
								error: function () {
									resolve();
								}.bind(this)
							});

						} else {
							resolve();
						}

					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));
		},

		onSubmitChanges: function (aResults, aDates, aMessageLog) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var oSucess = false;
				var sCounter = 0;
				var sPath;
				var sTimestamp = new Date().getTime() + sCounter;
				var aUserName = this.userName;
				oModel.setUseBatch(true);

				var aFilterHistoric = [];
				var aUpdateHistoric = [];
				var aFilterOffer = [];

				var aSecPath = [];
				var aResultSec = [];
				var aEntitySec = [];

				for (var i = 0; i < aResults.length; i++) {

					var sMessageKey = new Date().getTime() + sCounter;
					sCounter = sCounter + 1;

					var oStatus = "1"; //Pendente
					var oHistoric = false;

					var aDataMessage = {
						HCP_MESSAGE_ID: sMessageKey.toFixed(),
						HCP_UNIQUE_KEY: aResults[i].hcpUniqueKey,
						HCP_TIPO: aResults[i].hcpType,
						HCP_TRANSACTION: aResults[i].hcpTransaction,
						HCP_MSGTYP: aResults[i].hcpMsgtyp,
						HCP_MSGID: aResults[i].hcpMsgid,
						HCP_MSGNR: aResults[i].hcpMsgnr,
						HCP_MESSAGE: aResults[i].hcpMessage,
						HCP_CREATED_BY: aResults[i].hcpCreatedBy,
						HCP_UPDATED_BY: aResults[i].hcpCreatedBy,
						HCP_CREATED_AT: new Date(),
						HCP_UPDATED_AT: new Date()
					};

					if (aResults[i].hcpType == "1") { //Fixo
						if (aResults[i].hcpMsgnr == "860") {
							var oMsgnr = "860";
							var oEntity = "Commodities_Fixed_Order";
	
							var aDataUpdate = {
								HCP_UNIQUE_KEY: aResults[i].hcpUniqueKey,
								HCP_ZSEQUE: aResults[i].hcpZseque,
								HCP_STATUS: "1", //Pendente
								HCP_UPDATED_BY: aResults[i].hcpCreatedBy,
								HCP_UPDATED_AT: new Date()
							};
						} else if (aResults[i].hcpMsgnr == "747") {
							var oMsgnr = "747";
							var oEntity = "Commodities_Fixed_Order";
	
							var aDataUpdate = {
								HCP_UNIQUE_KEY: aResults[i].hcpUniqueKey,
								HCP_ZSEQUE: aResults[i].hcpZseque,
								HCP_STATUS: "1", //Pendente
								HCP_UPDATED_BY: aResults[i].hcpCreatedBy,
								HCP_UPDATED_AT: new Date()
							};
						}else {
							var oEntity = "Commodities_Fixed_Order";
							var oMsgnr = aResults[i].hcpMsgnr;

							var aDataUpdate = {
								HCP_UNIQUE_KEY: aResults[i].hcpUniqueKey,
								HCP_ZSEQUE: aResults[i].hcpZseque,
								HCP_STATUS: "1", //Pendente
								HCP_UPDATED_BY: aResults[i].hcpCreatedBy,
								HCP_UPDATED_AT: new Date()
							};
					}

					} else { //Depósito ou Transferência
						oMsgnr = "761";
						oEntity = "Commodities_Order";

						aDataUpdate = {
							HCP_UNIQUE_KEY: aResults[i].hcpUniqueKey,
							HCP_PEDIDO_DEP: aResults[i].hcpZseque,
							HCP_STATUS: "1", //Pendente
							HCP_UPDATED_BY: aResults[i].hcpCreatedBy,
							HCP_UPDATED_AT: new Date()
						};

					}

					if (aResults[i].hcpMsgid == "Z_MM" && aResults[i].hcpMsgnr == oMsgnr) {
						var oError = false;
						oStatus = "2"; //Processada
					} else {
						oError = true;
					}

					//Compra x Oferta
					var oArrayOrder = this.aDataArray.filter(result => result.HCP_UNIQUE_KEY === aResults[i].hcpUniqueKey);
					if (oArrayOrder.length > 0) {

						if (oArrayOrder[0].HCP_UNIQUE_KEY_OFFER) {

							aFilterHistoric.push(new sap.ui.model.Filter({
								path: "HCP_UNIQUE_KEY_OFFER",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oArrayOrder[0].HCP_UNIQUE_KEY_OFFER
							}));

							aFilterOffer.push(new sap.ui.model.Filter({
								path: "HCP_UNIQUE_KEY",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oArrayOrder[0].HCP_UNIQUE_KEY_OFFER
							}));

							if (oError == false) {
								var aDataHistoric = {
									HCP_UNIQUE_KEY_ORDER: aResults[i].hcpUniqueKey,
									HCP_EBELN: aResults[i].hcpZseque,
									HCP_UPDATED_BY: aUserName,
									HCP_UPDATED_AT: new Date()
								};

								aUpdateHistoric.push(aDataHistoric);
							}

						}
					}

					if (oError == false) {

						if (aMessageLog) {
							var aMessage = aResults[i].hcpMessage;
							oSucess = true;
						}

						aDataUpdate.HCP_STATUS = oStatus;

						var oArrayCadenceUnique = this.aCadenceArray.filter(result => result.HCP_UNIQUE_KEY === aResults[i].hcpUniqueKey);

						if (oArrayCadenceUnique.length > 0) {

							if (!oArrayCadenceUnique[0].HCP_EBELN) {

								for (var j = 0; j < oArrayCadenceUnique.length; j++) {

									var aCadenceUpdate = {
										HCP_UNIQUE_KEY: oArrayCadenceUnique[j].HCP_UNIQUE_KEY,
										HCP_EBELN: aResults[i].hcpZseque
									};

									sPath = this.buildEntityPath("Cadence", oArrayCadenceUnique[j], "HCP_CADENCE_ID");

									oModel.update(sPath, aCadenceUpdate, {
										groupId: "changes"
									});

								}

							}

						}

					}

					sPath = this.buildEntityPath(oEntity, aResults[i], "hcpId");

					oModel.update(sPath, aDataUpdate, {
						groupId: "changes"
					});
					oModel.createEntry("/Commodities_Log_Messages", {
						properties: aDataMessage
					}, {
						groupId: "changes"
					});

				}

				//Casos de erro na modificação de Pedidos Depósito/Transferência
				if (aDates && aDates.length > 0) {
					for (var i = 0; i < aDates.length; i++) {

						var oYear = aDates[i].hcpDtEntrIni.substr(0, 4);
						var oMonth = aDates[i].hcpDtEntrIni.substr(5, 2);
						oMonth = oMonth - 1;
						var oDay = aDates[i].hcpDtEntrIni.substr(8, 2);

						var oStartDate = new Date(oYear, oMonth, oDay, 0, 0, 0);

						oYear = aDates[i].hcpDtEntrFim.substr(0, 4);
						oMonth = aDates[i].hcpDtEntrFim.substr(5, 2);
						oMonth = oMonth - 1;
						oDay = aDates[i].hcpDtEntrFim.substr(8, 2);

						var oEndtDate = new Date(oYear, oMonth, oDay, 0, 0, 0);

						aDataUpdate = {
							HCP_STATUS: "1", //Pendente
							HCP_COND_PGTO: aDates[i].hcpCondPgto,
							HCP_EKGRP: aDates[i].hcpEkgrp,
							HCP_MENGE_ENTR: aDates[i].hcpMengeEntr ? parseFloat(aDates[i].hcpMengeEntr).toFixed(2) : "0.00",
							HCP_DT_ENTR_INI: oStartDate,
							HCP_DT_ENTR_FIM: oEndtDate,
							HCP_INCOTERMS: aDates[i].hcpIncoterms,
							HCP_FRETE: aDates[i].hcpFrete ? parseFloat(aDates[i].hcpFrete).toFixed(2) : "0.00",
							HCP_LOC_RET: aDates[i].hcpLocRet,
							HCP_OBS_PRECO: aDates[i].hcpObsPreco,
							HCP_MENGE_PED_DEP: aDates[i].hcpMengePedDep ? parseFloat(aDates[i].hcpMengePedDep).toFixed(2) : "0.00",
							HCP_CADENCIA: aDates[i].hcpCadencia ? parseFloat(aDates[i].hcpCadencia).toFixed(2) : "0.00",
							HCP_BASE_PRECIF: aDates[i].hcpBasePrecif,
							HCP_UNID_PRECIF: aDates[i].hcpUnidPrecif,
							HCP_VALOR_PERCENTUAL: aDates[i].hcpValorPercentual ? parseFloat(aDates[i].hcpValorPercentual).toFixed(2) : "0.00",
							HCP_VALOR_PRECIF: aDates[i].hcpValorPrecif ? parseFloat(aDates[i].hcpValorPrecif).toFixed(2) : "0.00",
							HCP_PEDIDO_FIM: aDates[i].hcpPedidoFim,
							HCP_BEDNR: aDates[i].hcpBednr,
							HCP_CITY_EMB: aDates[i].hcpCityEmb,
							HCP_REFER_EMB: aDates[i].hcpReferEmb,
							HCP_KMSPAVIM: aDates[i].hcpKmspavim ? parseFloat(aDates[i].hcpKmspavim).toFixed(2) : "0.00",
							HCP_HORAEMB: aDates[i].hcpHoraemb,
							HCP_EMBCHUVA: aDates[i].hcpEmbchuva,
							HCP_CAPEMBDIA: aDates[i].hcpCapembdia ? parseFloat(aDates[i].hcpCapembdia).toFixed(2) : "0.00",
							HCP_MONDAY: aDates[i].hcpMonday == "X" ? aDates[i].hcpMonday : " ",
							HCP_TUESDAY: aDates[i].hcpTuesday == "X" ? aDates[i].hcpTuesday : " ",
							HCP_WEDNESDAY: aDates[i].hcpWednesday == "X" ? aDates[i].hcpWednesday : " ",
							HCP_THURSDAY: aDates[i].hcpThursday == "X" ? aDates[i].hcpThursday : " ",
							HCP_FRIDAY: aDates[i].hcpFriday == "X" ? aDates[i].hcpFriday : " ",
							HCP_SATURDAY: aDates[i].hcpSaturday == "X" ? aDates[i].hcpSaturday : " ",
							HCP_SUNDAY: aDates[i].hcpSunday == "X" ? aDates[i].hcpSunday : " ",
							HCP_UPDATED_AT: new Date()
						};

						sPath = this.buildEntityPath("Commodities_Order", aDates[i], "hcpOrderId");

						oModel.update(sPath, aDataUpdate, {
							groupId: "changes"
						});

					}
				}

				oModel.submitChanges({
					groupId: "changes",
					success: function () {
						this.flushStore(
								"Offer_Map, Offer_Map_Werks, Commodities_Fixed_Order, Commodities_Log_Messages, Commodities_Order, Cadence")
							.then(function () {

								//this.refreshStore("Offer_Map", "Offer_Map_Werks", "Commodities_Fixed_Order", "Commodities_Log_Messages",
								//	"Commodities_Order", "Cadence").then(function () {

									this.updateHistoricOffer(aUpdateHistoric, aFilterHistoric, aFilterOffer).then(function () {
										this.refreshStore("Offer_Map").then(function () {
											this.hasFinished = true;
											if (aMessageLog) {
												if (!oError) {
													MessageBox.success(
														aMessage, {
															actions: [sap.m.MessageBox.Action.OK],
															onClose: function (sAction) {
																resolve(oSucess);
															}.bind(this)
														}
													);
												} else {
													this.displayMessageLog(aResults);
													resolve(false);
												}
											} else {
												resolve(null);
											}
										}.bind(this));
									}.bind(this));
								//}.bind(this));
							}.bind(this));

					}.bind(this),
					error: function () {
						resolve();
					}.bind(this)
				});

			}.bind(this));
		},

		//Atualizar a tabela de Histórico de Compras x Ofertas 
		//aUpdateHistoric = compras criadas com sucesso
		//aFilterHistoric = todos as compras que possuem oferta
		updateHistoricOffer: function (aUpdateHistoric, aFilterHistoric, aFilterOffer) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				oModel.setUseBatch(true);
				var aDeferredGroups = oModel.getDeferredGroups();
				var aUserName = this.userName;
				var sPath;

				if (aDeferredGroups.indexOf("changes") < 0) {
					aDeferredGroups.push("changes");
					oModel.setDeferredGroups(aDeferredGroups);
				}

				if (aFilterHistoric.length > 0 && aFilterOffer.length > 0) {

					//Buscar Dados da Oferta
					oModel.read("/Offer_Map", {

						filters: aFilterOffer,
						success: function (results) {

							var aResultsOffer = results.results;

							if (aResultsOffer.length > 0) {

								//Buscar todas as compras atreladas para a oferta
								oModel.read("/Commodities_Historic_Offer", {

									filters: aFilterHistoric,
									success: function (results) {

										if (results.results.length > 0) {

											var aResultsHistoric = [];
											var aResultHistoricCom = [];

											//Atualizar Status da Oferta, conforme os pedidos criados
											//2 = Comprado Parcialmente (Não atingiu o saldo da oferta)
											//3 - Finalizado(Saldo total utilizado)
											//5 - Erro(Oferta com pelo menos 1 compra com)
											for (var i = 0; i < aResultsOffer.length; i++) {

												var oErro = false;
												var oMengeTotalOffer = parseFloat(aResultsOffer[i].HCP_VOLUME);
												var aMenge = 0;

												//Histórico Total da Oferta
												aResultsHistoric = results.results.filter(result => result.HCP_UNIQUE_KEY_OFFER == aResultsOffer[i].HCP_UNIQUE_KEY);
												if (aResultsHistoric.length > 0) {

													//Atualizar o pedido na tabela de histórico
													for (var j = 0; j < aResultsHistoric.length; j++) {

														var oMengeOrder = parseFloat(aResultsHistoric[j].HCP_MENGE);
														aMenge = aMenge + oMengeOrder;

														//Compra x Oferta - Atualizar o pedido criado
														aResultHistoricCom = aUpdateHistoric.filter(result => result.HCP_UNIQUE_KEY_ORDER === aResultsHistoric[j].HCP_UNIQUE_KEY_ORDER);
														if (aResultHistoricCom.length > 0) {

															aResultsHistoric[j].HCP_EBELN = aResultHistoricCom[0].HCP_EBELN;
															sPath = this.buildEntityPath("Commodities_Historic_Offer", aResultsHistoric[j], "HCP_HISTORIC_ID");

															oModel.update(sPath, aResultHistoricCom[0], {
																groupId: "changes"
															});

														}

														if (!aResultsHistoric[j].HCP_EBELN) {
															oErro = true;
														}

													}

												}

												if (oErro == true) {
													var oStatusOffer = "5"; //Erro
												} else {

													if (aMenge < oMengeTotalOffer) {
														oStatusOffer = "2"; //Comprado Parcialmente
													} else {
														oStatusOffer = "3"; //Finalizada
													}
												}

												var aDataOffer = {
													HCP_STATES_OFFER: oStatusOffer,
													HCP_UPDATED_BY: aUserName,
													HCP_UPDATED_AT: new Date()
												};

												sPath = this.buildEntityPath("Offer_Map", aResultsOffer[i], "HCP_OFFER_ID");

												oModel.update(sPath, aDataOffer, {
													groupId: "changes"
												});

											}

											oModel.submitChanges({
												groupId: "changes",
												success: function () {
													this.flushStore("Commodities_Historic_Offer").then(function () {
														var aRefreshView = ["Commodities_Historic_Offer"];
														this.refreshStore(aRefreshView).then(function () {
															resolve();
														}.bind(this));
													}.bind(this));

												}.bind(this),
												error: function () {
													resolve();
												}.bind(this)
											});

										} else {
											resolve();
										}

									}.bind(this),
									error: function (error) {
										reject(error);
									}
								});

							} else {
								resolve();
							}

						}.bind(this),
						error: function (error) {
							reject(error);
						}
					});

				} else {
					resolve();
				}

			}.bind(this));

		},

		//Atualizar o Status da Oferta conforme o retorno do processamentos das compras no SAP
		updateStatusOffer: function (aFilterOffer, aFilterKey) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				oModel.setUseBatch(true);
				var aDeferredGroups = oModel.getDeferredGroups();
				var aUserName = this.userName;

				if (aDeferredGroups.indexOf("changes") < 0) {
					aDeferredGroups.push("changes");
					oModel.setDeferredGroups(aDeferredGroups);
				}

				if (aFilterKey.length > 0) {

					oModel.read("/Offer_Map", {

						filters: aFilterKey,
						success: function (results) {

							var aResultsOffer = results.results;

							if (aResultsOffer.length > 0) {

								oModel.read("/Commodities_Historic_Offer", {

									filters: aFilterOffer,
									success: function (results) {

										var aResults = results.results;
										var aHistoricProc = aResults.filter(result => result.HCP_EBELN !== ""); //Processado
										var aHistoricPend = aResults.filter(result => result.HCP_STATUS == ""); //Pendente
										var aKeyffer = [];
										var aMenge = 0;
										var oStatusOffer = "2";

										if (aHistoricProc.length > 0) {

											//Atualizar Status da Oferta, conforme os pedidos criados
											//2 = Comprado Parcialmente (Não atingiu o saldo da oferta)
											//3 - Finalizado(Saldo total utilizado)
											for (var i = 0; i < aResultsOffer.length; i++) {

												aMenge = 0;
												oStatusOffer = "2";
												aKeyffer = aHistoricProc.filter(result => result.HCP_UNIQUE_KEY_OFFER === aResultsOffer[i].HCP_UNIQUE_KEY);

												if (aKeyffer.length > 0) {
													//Soma de quantidade dos pedidos criados a partir da oferta
													for (var j = 0; j < aKeyffer.length; j++) {
														var oMengeOrder = parseFloat(aKeyffer[j].HCP_MENGE);
														aMenge = aMenge + oMengeOrder;
													}

													var oMengeTotalOffer = parseFloat(aResultsOffer[i].HCP_VOLUME);
													if (aMenge < oMengeTotalOffer) {
														oStatusOffer = "2"; //Comprado Parcialmente
													} else if (aMenge == oMengeTotalOffer) {
														oStatusOffer = "3"; //Finalizada

														var aHistPendOffer = aHistoricPend.filter(result => result.HCP_UNIQUE_KEY_OFFER === aResultsOffer[i].HCP_UNIQUE_KEY);

														for (var j = 0; j < aHistPendOffer.length; j++) {

															//Atualizar compra como finalizada
															var aDataHistoric = {
																HCP_HISTORIC_ID: aHistPendOffer[j].HCP_HISTORIC_ID,
																HCP_STATUS: "3" //Cancelada/Finalizada
															};

															var sPath = this.buildEntityPath("Commodities_Historic_Offer", aResultsOffer[i], "HCP_HISTORIC_ID");

															oModel.update(sPath, aDataHistoric, {
																groupId: "changes"
															});

														}

													}

													var aDataOffer = {
														HCP_OFFER_ID: aResultsOffer[i].HCP_OFFER_ID,
														HCP_STATES_OFFER: oStatusOffer,
														HCP_UPDATED_BY: aUserName,
														HCP_UPDATED_AT: new Date()
													};

													var sPath = this.buildEntityPath("Offer_Map", aResultsOffer[i], "HCP_OFFER_ID");

													oModel.update(sPath, aDataOffer, {
														groupId: "changes"
													});

												}

											}

											oModel.submitChanges({
												groupId: "changes",
												success: function () {
													this.flushStore("Offer_Map").then(function () {
														var aRefreshView = ["Offer_Map"];
														this.refreshStore(aRefreshView).then(function () {
															resolve();
														}.bind(this));
													}.bind(this));

												}.bind(this),
												error: function () {
													resolve();
												}.bind(this)
											});

										} else {
											resolve();
										}

									}.bind(this),
									error: function (error) {
										reject(error);
									}
								});

							} else {
								resolve();
							}

						}.bind(this),
						error: function (error) {
							reject(error);
						}
					});

				}

			}.bind(this));

		},

		displayMessageLog: function (aResults) {

			var oDataItem = [];
			var aIcon;
			var oType;

			if (aResults.length > 0) {

				for (var i = 0; i < aResults.length; i++) {

					if (aResults[i].hcpMstyp == "S") {
						aIcon = "sap-icon://message-success";
					} else if (aResults[i].hcpMstyp == "E") {
						aIcon = "sap-icon://message-error";
					} else {
						aIcon = "sap-icon://message-information";
					}

					var aData = {
						HCP_MSGTYP: aResults[i].hcpMstyp,
						ICON: aIcon,
						HCP_MESSAGE: aResults[i].hcpMessage
					};

					oType = aResults[i].hcpType;

					oDataItem.push(aData);

				}

				if (!this._FragmentMessageLog) {
					this._FragmentMessageLog = sap.ui.xmlfragment("messageID" + this.getView().getId(),
						"com.sap.build.standard.brfAppDeGraosModoEditar.view.commodities.fragments.LogMessage",
						this);

					this.getView().addDependent(this._FragmentMessageLog);

				}

				var oModelMessageLog = new JSONModel({
					type: oType,
					tableMessage: oDataItem
				});

				this.getView().setModel(oModelMessageLog, "messageLogFormModel");

				this._FragmentMessageLog.open();

			}

		},

		_onMsgLogConfirPress: function (oEvent) {

			var oCancelModel = this.getView().getModel("messageLogFormModel");
			var oData = oCancelModel.oData;

			oCancelModel.setProperty("/tableMessage", []);

			oEvent.getSource().getParent().close();

			if (oData.type) {
				this.redirectEdit();
			}

		},

		redirectEdit: function () {

			var oModel = this.getView().getModel();
			var oCancelModel = this.getView().getModel("messageLogFormModel");
			var oData = oCancelModel.oData;
			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_UNIQUE_KEY",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.uniqueKey
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_CREATED_BY",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.userName
			}));

			if (oData.type == "1") { //Fixo
				var oEntity = "/Commodities_Fixed_Order";
			} else {
				oEntity = "/Commodities_Order";

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_TIPO",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.type
				}));
			}

			oModel.read(oEntity, {
				filters: aFilters,
				success: function (results) {

					var aResults = results.results;
					if (aResults.length > 0) {

						if (aResults[0]["HCP_PURCHASE_ID"]) {
							var oEntity = "Commodities_Fixed_Order";
							var oField = "HCP_PURCHASE_ID";
							var oRouterView = "commodities.EditFixedOrder";

						} else {

							oEntity = "Commodities_Order";
							oField = "HCP_ORDER_ID";
							oRouterView = "commodities.EditOrder";

						}

						var sPath = this.buildEntityPath(oEntity, aResults[0], oField);
						this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);

						this.oRouter.navTo(oRouterView, {
							keyData: encodeURIComponent(sPath)
						});

						//	this.oRouter.getTargets().display(oRouterView, {
						//		keyData: encodeURIComponent(sPath)
						//	});

					}

				}.bind(this),
				error: function () {
					MessageBox.error(
						this.resourceBundle.getText("errorFixedValue"), {
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (sAction) {
								this.closeBusyDialog();
							}.bind(this)
						}
					);
				}.bind(this)
			});

		},

		buildEntityPath: function (sEntityName, oEntity, oField) {

			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity[oField] + "l)";
			}
		},

		formatterSapDate: function (oData, oField) {

			return new Promise(function (resolve, reject) {

				if (oData[oField]) {
					// 06/02/2022 Chamado 8000035005 - INC0887940 - App Grãos Identificado classe global que formata valores de data para envio ao SAP utilizando formatação com UTC (getUTCdate() para getDate())
					var oDay = oData[oField].getDate();
 
					if (oDay < 10) {
						oDay = "0" + oDay;
					}

					var oMonth = oData[oField].getMonth() + 1;

					if (oMonth < 10) {
						oMonth = "0" + oMonth;
					} else {
						oMonth = oMonth.toString();
					}
					var oYear = oData[oField].getFullYear();

					oData[oField] = oYear.toString() + oMonth.toString() + oDay.toString();
				}

				resolve(oData);

			}.bind(this));

		},

		getUserProfile: function (sProfileEntityName, sUserName) {
			var oModel = this.getOwnerComponent().getModel();
			var oProfile;
			//const enableProfile = false;

			return new Promise(function (resolve, reject) {

				oModel.read("/Has_Permissions", {

					success: function (result) {

						const enableProfile = result.results[0].HCP_HAS_PERMISSIONS == 0 ? false : true;

						var aFilters = [];
						aFilters.push(new sap.ui.model.Filter({
							path: "UNAME",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: sUserName
						}));

						oModel.read("/" + sProfileEntityName, {
							filters: aFilters,
							success: data => {
								if (data.results.length > 0) {

									oModel.read("/View_Profile_Werks_Ekorgs", {
										filters: aFilters,
										success: function (result) {

											var oProfileData = data.results;

											for (var i = 0; i < result.results.length; i++) {
												oProfileData.push(result.results[i]);
											}

											if (sProfileEntityName == "View_Profile_Offer_Map" || sProfileEntityName == "View_Profile_Offer_Map_Logistics") {
												oProfile = this.buildOfferMapProfile(oProfileData, enableProfile);
											} else if (sProfileEntityName == "View_Profile_Commodities" || sProfileEntityName == "View_Profile_Cadence") {
												oProfile = this.buildPurchaseSetProfile(oProfileData, enableProfile);
											} else if (sProfileEntityName == "View_Profile_Prospects") {
												oProfile = this.buildProspectsSetProfile(oProfileData, enableProfile);
											} else if (sProfileEntityName == "View_Profile_Crop") {
												oProfile = this.buildCropSetProfile(oProfileData, enableProfile);
											} else if (sProfileEntityName == "View_Profile_Appointments") {
												oProfile = this.buildAppointmentsSetProfile(oProfileData, enableProfile);
											} else if (sProfileEntityName == "View_Profile_Extract") {
												oProfile = this.buildExtractSetProfile(oProfileData, enableProfile);
											} else if (sProfileEntityName == "View_Profile_Warehouse") {
												oProfile = this.buildWareHouseSetProfile(oProfileData, enableProfile);
											} else if (sProfileEntityName == "View_Profile_Table_Price") {
												oProfile = this.buildTablePriceSetProfile(oProfileData, enableProfile);
											} else if (sProfileEntityName == "View_Profile_Visit") {
												oProfile = this.buildVisitSetProfile(oProfileData, enableProfile);
											} else if (sProfileEntityName == "View_Profile_Calculate_Freight") {
												oProfile = this.buildCalculateFreightSetProfile(oProfileData, enableProfile);
											} else if (sProfileEntityName == "View_Profile_Intention_Price") {
												oProfile = this.buildIntentionPriceSetProfile(oProfileData, enableProfile);
											} else if (sProfileEntityName == "View_Profile_Register") {
												oProfile = this.buildRegisterSetProfile(oProfileData, enableProfile);
											} else if (sProfileEntityName == "View_Profile_Negotiation_Report") {
												oProfile = this.buildNegotiationReportSetProfile(oProfileData, enableProfile);
											} else if (sProfileEntityName == "View_Profile_Commercialization") {
												oProfile = this.buildCommercializationSetProfile(oProfileData, enableProfile);
											}

											resolve(oProfile);

										}.bind(this),
										error: function (err) {
											sap.m.MessageToast.show("Falha ao Buscar Permissões.");
											reject(err);
										}
									});
								} else {
									if (enableProfile) {
										resolve({
											create: false,
											edit: false,
											hasAccess: false,
											fullAccess: false,
											werks: [],
											ekorg: []
										});
									} else {
										resolve({
											create: true,
											edit: true,
											hasAccess: true,
											fullAccess: true,
											werks: [],
											ekorg: []
										});
									}
								}

							},
							error: error => {
								reject(error);
							}
						});

					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Permissões.");
						reject(err);
					}
				});

			}.bind(this));
		},
		
		getUserProfileMasterData: function (sUserName) {
		var oModel = this.getOwnerComponent().getModel();
		var oProfile;
		//const enableProfile = false;

		return new Promise(function (resolve, reject) {
			
			var aFilters = [];
					aFilters.push(new sap.ui.model.Filter({
						path: "HCP_USER_ID",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: sUserName
			}));
			
				aFilters.push(new sap.ui.model.Filter({
						path: "HCP_ACTIVE",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '1'
			}));

			oModel.read("/Master_Data_Permissions", {
				filters: aFilters,
				success: function (result) {
					if (result.results.length > 0) {
						resolve(true);
					}else{
						resolve(false);
					}
				}.bind(this),
				error: function (err) {
					sap.m.MessageToast.show("Falha ao Buscar Permissões.");
					reject(false);
				}
			});

		}.bind(this));
	},

		buildOfferMapProfile: function (oProfileData, enableProfile) {
			var oProfile;
			var bCanCreate;
			var bCanEdit;
			var aEkorg;
			var bHasAccess;
			var bFullAccess;

			bCanCreate = oProfileData.filter(profile => profile.FIELD == "ACTVT" && profile.VALOR == "01").length > 0 ? true : false;
			bCanEdit = oProfileData.filter(profile => profile.FIELD == "ACTVT" && profile.VALOR == "02").length > 0 ? true : false;
			aEkorg = oProfileData.filter(profile => (profile.FIELD == "EKORG" && profile.VALOR !== '*') || (profile.FIELD === "EKORG" &&
				profile.VALOR === '*' && profile.OBJECT === 'Z:MAPA_OFE'));
			// aEkorg = oProfileData.filter(profile => profile.FIELD === "EKORG" && profile.VALOR === "EKORG" && profile.EKORG !== "*" && profile
			// 	.EKORG !== null && profile.EKORG !== "X");
			bHasAccess = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "07").length > 0 ? true : oProfileData
				.filter(
					profile => profile.FIELD === "EKORG").length > 0 ? true : false;
			bFullAccess = oProfileData.filter(profile => profile.FIELD === "EKORG" && profile.EKORG === "*").length > 0 ? true : false;

			if (enableProfile) {
				oProfile = {
					create: bCanCreate,
					edit: bCanEdit,
					hasAccess: bHasAccess,
					fullAccess: bFullAccess,
					ekorg: aEkorg
				};
			} else {
				oProfile = {
					create: true,
					edit: true,
					hasAccess: true,
					fullAccess: true,
					ekorg: []
				};
			}
			return oProfile;
		},

		buildPurchaseSetProfile: function (oProfileData, enableProfile) {
			var oProfile;
			var bCanCreate;
			var bCanEdit;
			var bHasAccess;
			var bFullAccess;
			var aWerks;

			bCanCreate = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "01").length > 0 ? true : false;
			bCanEdit = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "02").length > 0 ? true : false;
			bHasAccess = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "07").length > 0 ? true : false;
			bFullAccess = oProfileData.filter(profile => profile.FIELD === "WERKS" && profile.VALOR === "$WERKS" && profile.WERKS ===
				"*").length > 0 ? true : false;
			//aWerks = oProfileData.filter(profile => profile.FIELD === "WERKS" && profile.VALOR === "$WERKS" && profile.WERKS !== "*" && profile
			//	.WERKS !== null && profile.WERKS !== "X");

			aWerks = oProfileData.filter(profile => (profile.FIELD === "WERKS" && profile.VALOR !== '*') || (profile.FIELD === "WERKS" &&
				profile.VALOR === '*' && profile.OBJECT === 'Z:COMPRA'));

			if (enableProfile) {
				oProfile = {
					create: bCanCreate,
					edit: bCanEdit,
					hasAccess: bHasAccess,
					fullAccess: bFullAccess,
					werks: aWerks
				};
			} else {
				oProfile = {
					create: true,
					edit: true,
					hasAccess: true,
					fullAccess: true,
					werks: []
				};
			}
			return oProfile;
		},

		buildProspectsSetProfile: function (oProfileData, enableProfile) {
			var oProfile;
			var bHasAccess;

			bHasAccess = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "07").length > 0 ? true : false;

			if (enableProfile) {
				oProfile = {
					hasAccess: bHasAccess
				};
			} else {
				oProfile = {
					hasAccess: true
				};
			}
			return oProfile;
		},

		buildAppointmentsSetProfile: function (oProfileData, enableProfile) {
			var oProfile;
			var bHasAccess;

			bHasAccess = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "07").length > 0 ? true : false;

			if (enableProfile) {
				oProfile = {
					hasAccess: bHasAccess
				};
			} else {
				oProfile = {
					hasAccess: true
				};
			}
			return oProfile;
		},

		buildCropSetProfile: function (oProfileData, enableProfile) {
			var oProfile;
			var bCanCreate;
			var bCanEdit;
			var bHasAccess;
			var bFullAccess;
			var aWerks;

			bCanCreate = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "01").length > 0 ? true : false;
			bCanEdit = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "02").length > 0 ? true : false;
			bHasAccess = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "07").length > 0 ? true : false;
			bFullAccess = oProfileData.filter(profile => profile.FIELD === "WERKS" && profile.VALOR === "$WERKS" && profile.WERKS ===
				"*").length > 0 ? true : false;
			//aWerks = oProfileData.filter(profile => profile.FIELD === "WERKS" && profile.VALOR === "$WERKS" && profile.WERKS !== "*" && profile
			//	.WERKS !== null && profile.WERKS !== "X");

			aWerks = oProfileData.filter(profile => (profile.FIELD === "WERKS" && profile.VALOR !== '*') || (profile.FIELD === "WERKS" &&
				profile.VALOR === '*' && profile.OBJECT === 'Z:LAVOURA'));

			if (enableProfile) {
				oProfile = {
					create: bCanCreate,
					edit: bCanEdit,
					hasAccess: bHasAccess,
					fullAccess: bFullAccess,
					werks: aWerks
				};
			} else {
				oProfile = {
					create: true,
					edit: true,
					hasAccess: true,
					fullAccess: true,
					werks: []
				};
			}
			return oProfile;
		},

		buildVisitSetProfile: function (oProfileData, enableProfile) {
			var oProfile;
			var bCanCreate;
			var bCanEdit;
			var bHasAccess;
			var bFullAccess;
			var aWerks;

			bCanCreate = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "01").length > 0 ? true : false;
			bCanEdit = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "02").length > 0 ? true : false;
			bHasAccess = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "07").length > 0 ? true : false;
			bFullAccess = oProfileData.filter(profile => profile.FIELD === "WERKS" && profile.VALOR === "$WERKS" && profile.WERKS ===
				"*").length > 0 ? true : false;
			//aWerks = oProfileData.filter(profile => profile.FIELD === "WERKS" && profile.VALOR === "$WERKS" && profile.WERKS !== "*" && profile
			//	.WERKS !== null && profile.WERKS !== "X");

			aWerks = oProfileData.filter(profile => (profile.FIELD === "WERKS" && profile.VALOR !== '*') || (profile.FIELD === "WERKS" &&
				profile.VALOR === '*' && profile.OBJECT === 'Z:FICHA_VI'));

			if (enableProfile) {
				oProfile = {
					create: bCanCreate,
					edit: bCanEdit,
					hasAccess: bHasAccess,
					fullAccess: bFullAccess,
					werks: aWerks
				};
			} else {
				oProfile = {
					create: true,
					edit: true,
					hasAccess: true,
					fullAccess: true,
					werks: []
				};
			}
			return oProfile;
		},

		buildExtractSetProfile: function (oProfileData, enableProfile) {
			var oProfile;
			var bHasAccess;

			bHasAccess = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "07").length > 0 ? true : false;

			if (enableProfile) {
				oProfile = {
					hasAccess: bHasAccess
				};
			} else {
				oProfile = {
					hasAccess: true
				};
			}
			return oProfile;
		},
		buildWareHouseSetProfile: function (oProfileData, enableProfile) {
			var oProfile;
			var bHasAccess;

			bHasAccess = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "07").length > 0 ? true : false;

			if (enableProfile) {
				oProfile = {
					hasAccess: bHasAccess
				};
			} else {
				oProfile = {
					hasAccess: true
				};
			}
			return oProfile;
		},

		buildTablePriceSetProfile: function (oProfileData, enableProfile) {
			var oProfile;
			var bHasAccess;

			bHasAccess = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "07").length > 0 ? true : false;

			if (enableProfile) {
				oProfile = {
					hasAccess: bHasAccess
				};
			} else {
				oProfile = {
					hasAccess: true
				};
			}
			return oProfile;
		},

		buildCalculateFreightSetProfile: function (oProfileData, enableProfile) {
			var oProfile;
			var bHasAccess;

			bHasAccess = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "07").length > 0 ? true : false;

			if (enableProfile) {
				oProfile = {
					hasAccess: bHasAccess
				};
			} else {
				oProfile = {
					hasAccess: true
				};
			}
			return oProfile;
		},

		buildRegisterSetProfile: function (oProfileData, enableProfile) {
			var oProfile;
			var bHasAccess;

			bHasAccess = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "07").length > 0 ? true : false;

			if (enableProfile) {
				oProfile = {
					hasAccess: bHasAccess
				};
			} else {
				oProfile = {
					hasAccess: true
				};
			}
			return oProfile;
		},

		buildNegotiationReportSetProfile: function (oProfileData, enableProfile) {
			var oProfile;
			var bCanCreate;
			var bCanEdit;
			var bHasAccess;
			var bFullAccess;
			var aWerks;

			bCanCreate = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "01").length > 0 ? true : false;
			bCanEdit = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "02").length > 0 ? true : false;
			bHasAccess = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "07").length > 0 ? true : false;

			bFullAccess = oProfileData.filter(profile => profile.FIELD === "WERKS" && profile.VALOR === "$WERKS" && profile.WERKS ===
				"*").length > 0 ? true : false;
			//aWerks = oProfileData.filter(profile => profile.FIELD === "WERKS" && profile.VALOR === "$WERKS" && profile.WERKS !== "*" && profile
			//	.WERKS !== null && profile.WERKS !== "X");

			aWerks = oProfileData.filter(profile => (profile.FIELD === "WERKS" && profile.VALOR !== '*') || (profile.FIELD === "WERKS" &&
				profile.VALOR === '*' && profile.OBJECT === 'Z:RELATO_N'));

			if (enableProfile) {
				oProfile = {
					create: bCanCreate,
					edit: bCanEdit,
					hasAccess: bHasAccess,
					fullAccess: bFullAccess,
					werks: aWerks
				};
			} else {
				oProfile = {
					create: true,
					edit: true,
					hasAccess: true,
					fullAccess: true,
					werks: []
				};
			}
			return oProfile;
		},

		buildCommercializationSetProfile: function (oProfileData, enableProfile) {
			var oProfile;
			var bCanCreate;
			var bCanEdit;
			var bHasAccess;
			var bFullAccess;
			var aWerks;

			bCanCreate = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "01").length > 0 ? true : false;
			bCanEdit = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "02").length > 0 ? true : false;
			bHasAccess = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "07").length > 0 ? true : false;
			bFullAccess = oProfileData.filter(profile => profile.FIELD === "WERKS" && profile.VALOR === "$WERKS" && profile.WERKS ===
				"*").length > 0 ? true : false;
			//aWerks = oProfileData.filter(profile => profile.FIELD === "WERKS" && profile.VALOR === "$WERKS" && profile.WERKS !== "*" && profile
			//	.WERKS !== null && profile.WERKS !== "X");

			aWerks = oProfileData.filter(profile => (profile.FIELD === "WERKS" && profile.VALOR !== '*') || (profile.FIELD === "WERKS" &&
				profile.VALOR === '*' && profile.OBJECT === 'Z:COMERC'));

			if (enableProfile) {
				oProfile = {
					create: bCanCreate,
					edit: bCanEdit,
					hasAccess: bHasAccess,
					fullAccess: bFullAccess,
					werks: aWerks
				};
			} else {
				oProfile = {
					create: true,
					edit: true,
					hasAccess: true,
					fullAccess: true,
					werks: []
				};
			}
			return oProfile;
		},

		buildIntentionPriceSetProfile: function (oProfileData, enableProfile) {
			var oProfile;
			var bHasAccess;

			bHasAccess = oProfileData.filter(profile => profile.FIELD === "ACTVT" && profile.VALOR === "07").length > 0 ? true : false;

			if (enableProfile) {
				oProfile = {
					hasAccess: bHasAccess
				};
			} else {
				oProfile = {
					hasAccess: true
				};
			}
			return oProfile;
		},

		verifyViewSuppliers: function (supplierID) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'LIFNR',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: supplierID
				}));

				oModel.read("/View_Suppliers", {
					filters: aFilters,
					success: function (result) {
						var oSupplier = result.results;
						var path;
						var value;
						aFilters = [];
						var isUnique = false;

						if (oSupplier[0].LAND1 == 'BR') {

							if (oSupplier[0].STCD1) {
								value = (oSupplier[0].STCD1).substring(0, 8);
								path = 'STCD1';
							} else if (oSupplier[0].STCD2) {
								value = oSupplier[0].STCD2;
								path = 'STCD2';
							}

							aFilters.push(new sap.ui.model.Filter({
								path: path,
								operator: sap.ui.model.FilterOperator.Contains,
								value1: value
							}));
						} else {

							if (oSupplier[0].STCD1 && oSupplier[0].STCD2) {

								aFilters.push(new sap.ui.model.Filter({
									path: 'STCD1',
									operator: sap.ui.model.FilterOperator.Contains,
									value1: oSupplier[0].STCD1
								}));

								aFilters.push(new sap.ui.model.Filter({
									path: 'STCD2',
									operator: sap.ui.model.FilterOperator.Contains,
									value1: oSupplier[0].STCD2
								}));

							} else if (oSupplier[0].STCD1) {
								aFilters.push(new sap.ui.model.Filter({
									path: 'STCD1',
									operator: sap.ui.model.FilterOperator.Contains,
									value1: oSupplier[0].STCD1
								}));
							} else if (oSupplier[0].STCD2) {
								aFilters.push(new sap.ui.model.Filter({
									path: 'STCD2',
									operator: sap.ui.model.FilterOperator.Contains,
									value1: oSupplier[0].STCD2
								}));
							} else if (!oSupplier[0].STCD1 && !oSupplier[0].STCD2) {
								isUnique = true;
							}

						}

						if (!isUnique) {
							oModel.read("/View_Suppliers", {
								filters: aFilters,
								success: function (resultNew) {

									var oSuppliers = resultNew.results;

									resolve(oSuppliers);

								}.bind(this),
								error: function (err) {
									sap.m.MessageToast.show("Falha ao Buscar Fornecedores.");
									reject(err);
								}
							});
						} else {
							resolve(oSupplier);
						}

					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Fornecedores.");
						reject(err);
					}
				});
			}.bind(this));
		},
		
		verifyFixedDateViewSuppliers: function (supplierID, pgtoDate) {
		    return new Promise(function (resolve, reject) {
		        var oModel = this.getView().getModel();
		        var aFilters = [];
		        aFilters.push(new sap.ui.model.Filter({
		            path: 'LIFNR',
		            operator: sap.ui.model.FilterOperator.EQ,
		            value1: supplierID
		        }));
		        
		        oModel.read("/View_Suppliers", {
		            filters: aFilters,
		            success: function (result) {
		                var oSupplier = result.results;
		                
		                // Verifica se existe o fornecedor
		                if (oSupplier.length === 0) {
		                    sap.m.MessageBox.error("Fornecedor não encontrado.");
		                    reject("Fornecedor não encontrado");
		                    return;
		                }
		                
		                // Converte a data para objeto Date
		                var paymentDate = new Date(pgtoDate);
		                var day = paymentDate.getDate();
		                var dayOfWeek = paymentDate.getDay(); // 0 = Domingo, 1 = Segunda, 2 = Terça, etc.
		                
		                // Se o campo ZVENCTO estiver preenchido, aceita a data informada
		                if (oSupplier[0].ZVENCTO === 'X') {
		                    resolve(true);
		                } 
		                // Senão, valida de acordo com a regra ZCODRU
		                else if (oSupplier[0].ZCODRU) {
		                    var isValid = false;
		                    
		                    switch (oSupplier[0].ZCODRU) {
		                        case '001': // PAGAMENTO TERÇA-FEIRA
		                            isValid = (dayOfWeek === 2); // 2 = terça-feira
		                            break;
		                            
		                        case '002': // PAGAMENTOS DIA 03
		                            isValid = (day === 3);
		                            break;
		                            
		                        case '003': // PAGAMENTO DIA 01 E 15
		                            isValid = (day === 1 || day === 15);
		                            break;
		                            
		                        case '004': // PAGAMENTO DIA 26
		                            isValid = (day === 26);
		                            break;
		                            
		                        case '005': // PAGAMENTOS DIA 01
		                            isValid = (day === 1);
		                            break;
		                            
		                        case '006': // PAGAMENTO DIA 01, 10, 20
		                            isValid = (day === 1 || day === 10 || day === 20);
		                            break;
		                            
		                        case '007': // PAGAMENTO DIA 14 E 26
		                            isValid = (day === 14 || day === 26);
		                            break;
		                            
		                        default:
		                            // Caso não seja nenhum destes ou esteja em branco
		                            sap.m.MessageBox.error("Fornecedor sem regra de pagamento, verificar");
		                            reject("Fornecedor sem regra de pagamento");
		                            return;
		                    }
		                    
		                    if (isValid) {
		                        resolve(true);
		                    } else {
		                        sap.m.MessageBox.error("Data informada não corresponde a regra de fornecedor, verifique");
		                        reject("Data informada não corresponde a regra de fornecedor");
		                    }
		                } 
		                // Se não tem ZVENCTO nem ZCODRU
		                else {
		                    sap.m.MessageBox.error("Fornecedor sem regra de pagamento, verificar");
		                    reject("Fornecedor sem regra de pagamento");
		                }
		            }.bind(this),
		            error: function (err) {
		                sap.m.MessageToast.show("Falha ao Buscar Fornecedores.");
		                reject(err);
		            }
		        });
		    }.bind(this));
		},

		getPictures: function (sKey) {
			var oComponent = this.getOwnerComponent();
			return new Promise((resolve, reject) => {
				if (oComponent) {
					oComponent.getPictures(sKey).then(data => {
						resolve(data);
					}).catch(error => {
						reject(error);
					});
				} else {
					reject("component not defined yet");
				}
			});
		},

		setPicture: function (oImageRecord) {
			var oComponent = this.getOwnerComponent();
			return new Promise((resolve, reject) => {
				if (oComponent) {
					oComponent.setPicture(oImageRecord).then(data => {
						resolve(data);
					}).catch(error => {
						reject(error);
					});
				} else {
					reject("component not defined yet");
				}
			});
		},

		deletePicture: function (oOptions) {
			var oComponent = this.getOwnerComponent();
			return new Promise((resolve, reject) => {
				if (oComponent) {
					oComponent.deletePicture(oOptions).then(data => {
						resolve(data);
					}).catch(error => {
						reject(error);
					});
				} else {
					reject("component not defined yet");
				}
			});
		},

		//Atualizar o sequencial para compras criadas após retorno ECC
		updateSecNumberOrder: function (aSecPath, aDataSec, oEntity) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				oModel.setUseBatch(true);
				var aDeferredGroups = oModel.getDeferredGroups();
				var sPath;

				if (aDeferredGroups.indexOf("changes2") < 0) {
					aDeferredGroups.push("changes2");
					oModel.setDeferredGroups(aDeferredGroups);
				}

				if (aDataSec.length > 0) {
					for (var i = 0; i < aDataSec.length; i++) {
						oModel.update(aSecPath[i], aDataSec[i], {
							groupId: "changes2"
						});
					}

					oModel.submitChanges({
						groupId: "changes2",
						success: function () {
							resolve();
						}.bind(this),
						error: function () {
							resolve();
						}.bind(this)
					});
				} else {
					resolve();
				}

			}.bind(this));

		},

		//Atualiza o numero da oferta em compras pela unique key de ofertas
		updateOfferIdCommodities: function () {
			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;

				if (bIsMobile) {
					oModel.read("/Commodities_Fixed_Order", {
						sorters: [new sap.ui.model.Sorter({
							path: "HCP_CREATED_AT",
							descending: true
						})],
						success: function (result) {
							var oCommoditiesFixedOrder = result.results;

							var aPromises = [];

							if (oCommoditiesFixedOrder.length > 0) {

								for (var item of oCommoditiesFixedOrder) {

									if ((item.HCP_UNIQUE_KEY_OFFER && !item.HCP_OFFER_NUMBER) || (item.HCP_UNIQUE_KEY_OFFER && item.HCP_OFFER_NUMBER ==
											'Registro Offline')) {
										aPromises.push(new Promise(function (resolve1, rejec1t1) {
											this.updateByUniqueKeyOfferMap(item, "Commodities_Fixed_Order", "HCP_PURCHASE_ID").then(function () {
												resolve1();
											}.bind(this)).catch(function (error) {
												rejec1t1();
											}.bind(this));
										}.bind(this)));
									}

								}
							} else {
								aPromises.push(new Promise(function (resolve1, rejec1t1) {
									resolve1();
								}.bind(this)));
							}

							oModel.read("/Commodities_Order", {
								sorters: [new sap.ui.model.Sorter({
									path: "HCP_CREATED_AT",
									descending: true
								})],
								success: function (resultOrder) {
									var oCommoditiesOrder = resultOrder.results;

									if (oCommoditiesOrder.length > 0) {

										for (var item2 of oCommoditiesOrder) {

											if ((item2.HCP_UNIQUE_KEY_OFFER && !item2.HCP_OFFER_NUMBER) || (item2.HCP_UNIQUE_KEY_OFFER && item2.HCP_OFFER_NUMBER ==
													'Registro Offline')) {
												aPromises.push(new Promise(function (resolve1, rejec1t1) {
													this.updateByUniqueKeyOfferMap(item2, "Commodities_Order", "HCP_ORDER_ID").then(function () {
														resolve1();
													}.bind(this)).catch(function (error) {
														rejec1t1();
													}.bind(this));
												}.bind(this)));
											}

										}
									} else {
										aPromises.push(new Promise(function (resolve1, rejec1t1) {
											resolve1();
										}.bind(this)));
									}

									Promise.all(aPromises).then(data => {

										oModel.submitChanges({
											groupId: "changes",
											success: function () {

												this.refreshStore("Commodities_Fixed_Order").then(function () {
													this.refreshStore("Commodities_Order").then(function () {
														resolve();
													}.bind(this));
												}.bind(this));

											}.bind(this),
											error: function () {
												resolve();
											}.bind(this)
										});

										resolve();

									}).catch(error => {
										reject();
									});

								}.bind(this),
								error: function (err) {
									sap.m.MessageToast.show("Ocorreu um erro.");
									reject(err);
								}
							});

						}.bind(this),
						error: function (err) {
							sap.m.MessageToast.show("Ocorreu um erro.");
							reject(err);
						}
					});
				} else {
					resolve();
				}

			}.bind(this));
		},
		updateByUniqueKeyOfferMap: function (item, oType, oId) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var aFilters = [];
				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_UNIQUE_KEY',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: item.HCP_UNIQUE_KEY_OFFER
				}));

				oModel.read("/Offer_Map", {
					filters: aFilters,
					success: function (resultOfferMap) {
						var oOfferMap = resultOfferMap.results;

						if (oOfferMap.length > 0) {
							if (oOfferMap[0]["@com.sap.vocabularies.Offline.v1.isLocal"] == true) {
								resolve();
							} else {

								var sPath = this.buildEntityPath(oType, item, oId);

								var oData = {
									HCP_OFFER_NUMBER: oOfferMap[0].HCP_OFFER_ID,
									HCP_UPDATED_AT: new Date()
								};

								oModel.update(sPath, oData, {
									groupId: "changes"
								});

								resolve();
							}
						} else {
							resolve();
						}

					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Ofertas.");
						reject(err);
					}
				});
			}.bind(this));
		},

		//Verifica todas compras que não possuem sequencial
		verifyCommoditiesHasSeq: function () {
			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var aFiltersFixedOrder = [];
				// aFiltersFixedOrder.push(new sap.ui.model.Filter({
				// 	path: 'HCP_ZSEQUE',
				// 	operator: sap.ui.model.FilterOperator.EQ,
				// 	value1: 'null'
				// }));

				var aFiltersOrder = [];
				aFiltersOrder.push(new sap.ui.model.Filter({
					path: 'HCP_PEDIDO_DEP',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: ''
				}));
	
				//29.01.2022 Added year period filter to improve the logic of commodities update index entry
					
				this.start_year_date = new Date(new Date().getFullYear(), 0, 1);
				this.end_year_date  = new Date(new Date().getFullYear(), 11, 31);
				aFiltersOrder.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
					.BT,
					this.start_year_date.getTime(), this.end_year_date.getTime()));
					
				aFiltersFixedOrder.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
				.BT,
				this.start_year_date.getTime(), this.end_year_date.getTime()));	
				
				//29.01.2022 end
				
				oModel.read("/Commodities_Fixed_Order", {
					filters: aFiltersFixedOrder,
					sorters: [new sap.ui.model.Sorter({
						path: "HCP_CREATED_AT",
						descending: true
					})],
					success: function (result) {
						var oCommoditiesFixedOrder = result.results;

						var aPromises = [];

						if (oCommoditiesFixedOrder.length > 0) {

							for (var item of oCommoditiesFixedOrder) {

								if (item.HCP_ZSEQUE == null || item.HCP_ZSEQUE == '') {
									aPromises.push(new Promise(function (resolve1, rejec1t1) {
										this.verifyCommoditiesHasFinished(item, "Commodities_Fixed_Order", "HCP_PURCHASE_ID").then(function () {
											resolve1();
										}.bind(this)).catch(function (error) {
											rejec1t1();
										}.bind(this));
									}.bind(this)));
								}

							}
						} else {
							aPromises.push(new Promise(function (resolve1, rejec1t1) {
								resolve1();
							}.bind(this)));
						}

						oModel.read("/Commodities_Order", {
							filters: aFiltersOrder,
							sorters: [new sap.ui.model.Sorter({
								path: "HCP_CREATED_AT",
								descending: true
							})],
							success: function (resultOrder) {
								var oCommoditiesOrder = resultOrder.results;

								if (oCommoditiesOrder.length > 0) {

									for (var item2 of oCommoditiesOrder) {

										if (item.HCP_PEDIDO_DEP == null || item.HCP_PEDIDO_DEP == '') {

											aPromises.push(new Promise(function (resolve1, rejec1t1) {
												this.verifyCommoditiesHasFinished(item2, "Commodities_Order", "HCP_ORDER_ID").then(function () {
													resolve1();
												}.bind(this)).catch(function (error) {
													rejec1t1();
												}.bind(this));
											}.bind(this)));
										}

									}
								} else {
									aPromises.push(new Promise(function (resolve1, rejec1t1) {
										resolve1();
									}.bind(this)));
								}

								Promise.all(aPromises).then(data => {

									oModel.submitChanges({
										groupId: "changes",
										success: function () {

											this.refreshStore("Commodities_Fixed_Order").then(function () {
												this.refreshStore("Commodities_Order").then(function () {
													resolve();
												}.bind(this));
											}.bind(this));

										}.bind(this),
										error: function () {
											resolve();
										}.bind(this)
									});

									resolve();

								}).catch(error => {
									reject();
								});

							}.bind(this),
							error: function (err) {
								sap.m.MessageToast.show("Ocorreu um erro.");
								reject(err);
							}
						});

					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Ocorreu um erro.");
						reject(err);
					}
				});

			}.bind(this));
		},

		//Verifica se o item enviado já possui compra atrelada no ECC e atualiza a compra
		verifyCommoditiesHasFinished: function (item, oType, oId) {
			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				oModel.read("/Commodities_Check", {

					success: function (results) {
						var oResult = results.results;

						if (oResult.length > 0) {

							for (var result of oResult) {

								if (result.HCP_UNIQUE_KEY == item.HCP_UNIQUE_KEY) {
									var sPath = this.buildEntityPath(oType, item, oId);

									var oData;

									if (oType == 'Commodities_Fixed_Order') {

										if (!item.HCP_ZSEQUE) {
											oData = {
												HCP_ZSEQUE: result.ZSEQUE,
												HCP_STATUS: '2',
												HCP_UPDATED_AT: new Date()
											};

											oModel.update(sPath, oData, {
												groupId: "changes"
											});
										} else {
											resolve();
										}

									} else {
										if (!item.HCP_PEDIDO_DEP) {
											oData = {
												HCP_PEDIDO_DEP: result.ZSEQUE,
												HCP_STATUS: '2',
												HCP_UPDATED_AT: new Date()
											};

											oModel.update(sPath, oData, {
												groupId: "changes"
											});
										} else {
											resolve();
										}

									}

									resolve();
								}

							}

							resolve();

						} else {
							resolve();
						}

					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Compras.");
						reject(err);
					}
				});
			}.bind(this));

		}

	});

});
//# sourceURL=file:///android_asset/www/controller/MainController.js?eval