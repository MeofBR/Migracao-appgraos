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
	
	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.visitForm.SimplifiedContact", {
		formatter: formatter,
		
		onInit: function () {
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false,
				oVisitFormPending: 0, 
				oTableContact: [],
				oTableDialog: [],
				oRankingValid: []
			}), "indexModel");
			this.oRouter.getTarget("visitForm.SimplifiedContact").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
		},
		
		handleRouteMatched: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			
			var oModel = this.getView().getModel("indexModel");
			oModel.setData({});
			
			this.setBusyDialog("App Grãos", "Carregando dados, por favor aguarde");
			
			this.awaitFunction();
			
			this.validateJOB();
			
			this.getUser().then(function (userName) {
				this.userName = userName;
				this.setGroup();
				this.closeBusyDialog();
			}.bind(this));
			
			var lastUpdate;
			var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/yyyy HH:mm"
			});
			
			this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdate);

			this.getView().getModel("indexModel").setProperty("/lastUpdateTablePrice", lastUpdate);

			if (bIsMobile) {
				this.getView().getModel("indexModel").setProperty("/isMobile", true);
				this.getView().getModel("indexModel").setProperty("/isWeb", false);
			} else {
				this.getView().getModel("indexModel").setProperty("/isMobile", false);
				this.getView().getModel("indexModel").setProperty("/isWeb", true);
			}
		},
		
		setGroup: async function(){
			let oDataModel = this.getOwnerComponent().getModel();
		
			let serviceZmm = "/ZMM5005";
            let oFilterZmm = new sap.ui.model.Filter("BNAME", sap.ui.model.FilterOperator.EQ, this.userName);
			
			const responseZmm = await new Promise(function (resolve, reject) {
                oDataModel.read(serviceZmm, {
                	filters: [oFilterZmm],
                    success: function (data) {
                        resolve(data.results[0] != undefined ? data.results[0] : false);
                    }.bind(this),
                    error: function (oError) {
                        reject(oError);
                    }.bind(this),
                });
            });
            
            if(responseZmm.EKGRP){
            	this.getView().getModel("indexModel").setProperty("/EKGRP", responseZmm.EKGRP);
            	this._validateBuyerGroups();
            }
		},
		
		awaitFunction: async function(){
			var oModel = this.getView().getModel("indexModel");
			let data = await this.getBusinessVisit(false);
            oModel.setProperty("/oRankingValid", data)
		},
		
		awaitUpdateSimplifiedContact: async function (oData, list) {
			let oDataModel = this.getOwnerComponent().getModel();
			if(list.HCP_PROVIDER_ID != oData.partner){
					let updateData = {
				HCP_PARTNER: list.HCP_PROVIDER_ID,
				HCP_PARTNER_NAME: list.HCP_NAME_REGISTERED
			}
				let sPath = "/Simplified_Contact(" + oData.simplifiedId + "l)";
				oDataModel.update(sPath, updateData, {
					groupId: "changes"
				});
				
				oDataModel.submitChanges({
					groupId: "changes"
				});
			}
		},
		
		validateJOB: async function(){
			
			let oDataModel = this.getOwnerComponent().getModel();
			let oModel = this.getView().getModel("indexModel");
			let Service = "/Job_Date(1l)";
			
			const data = await new Promise(function (resove, reject) {
                oDataModel.read(Service, {
                    success: function (data) {
                        resove(data);
                    }.bind(this),
                    error: function (oError) {
                        reject(oError);
                    }.bind(this),
                });
            });
            
            let dateJOB = this.convertTimeStamp(data.HCP_DATE);
            let dateToday = this.convertTimeStamp(new Date());
            
            if(dateToday != dateJOB){
            		
        		let oProperties = {
            		HCP_DATE: new Date(),
        		};
        		
        		this.resetTable(Service, oProperties);
            }
		},
		
		convertTimeStamp : function(data){
			
			var dia = data.getDate();
			var mes = data.getMonth() + 1; // adicione 1, pois o mês começa em 0 (janeiro)
			var ano = data.getFullYear();
			
			return (dia + "/" + mes + "/" + ano)
			
		},
		
		resetTable :  async function(ServiceDate, oPropertiesDate) {
			let oDataModel = this.getOwnerComponent().getModel();
            let oModel = this.getView().getModel("indexModel");
            let oData = oModel.oData;
            oDataModel.setUseBatch(true);
            let aFilters = [];
            
            let Service = "/Simplified_Contact";
            aFilters.push(new sap.ui.model.Filter("HCP_CONTACT", sap.ui.model.FilterOperator.EQ, 1));
            	
            let oCombinedFilter = new sap.ui.model.Filter({
			  filters: aFilters,
			  and: false // vira OR
			});	
			
			const data = await new Promise(function (resove, reject) {
                oDataModel.read(Service, {
                	filters: [oCombinedFilter],
                    success: function (data) {
                        resove(data.results);
                    }.bind(this),
                    error: function (oError) {
                        reject(oError);
                    }.bind(this),
                });
            });
            
            if(data.length > 0){
            	
            	for( let i = 0; i < data.length ; i++){
        			let oProperties = {
    					HCP_CONTACT: 0
            		};
            		
            		let sPath = Service + "(" + data[i].HCP_ID + "l)"; 
					oDataModel.update(sPath, oProperties, {
						groupId: "changes"
					});
            	}
            	
	        	oDataModel.submitChanges({
					groupId: "changes",
					success: function() {
					    MessageBox.success(
							'Atualização diaria bem sucedida!', {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									oDataModel.update(ServiceDate, oPropertiesDate);
									this.closeBusyDialog();
									window.location.reload(true);
								}.bind(this)
							}
						);
					}.bind(this),
					error: function () {
						MessageBox.error(
							'Erro ao executar o JOB!', {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									this.closeBusyDialog();
									window.location.reload(true);
								}.bind(this)
							}
						);
					}.bind(this)
				});
            }
            else{
            	oDataModel.update(ServiceDate, oPropertiesDate);	
            };
		},
		
		getSixMonthsBeforeDate: function (date) {
		  const newDate = new Date(date);
		  newDate.setMonth(newDate.getMonth() - 6);
		  return newDate;
		},

		getSixMonthsAfterDate: function (date) {
		  const newDate = new Date(date);
		  newDate.setMonth(newDate.getMonth() + 6);
		  return newDate;
		},
		
		_validateBuyerGroups: async function(){
			
            let oDataModel = this.getOwnerComponent().getModel();
            let oModel = this.getView().getModel("indexModel");
            let oData = oModel.oData;
            let aFilters = [];
            
            let Service = "/Simplified_Contact";
            let visitFormPending
            
            let oSorterNome = new sap.ui.model.Sorter("HCP_RANK", true); // false significa ordem crescente
			let oSorterSobrenome = new sap.ui.model.Sorter("HCP_PARTNER_NAME", false);
            
            aFilters.push(new sap.ui.model.Filter("HCP_EKGRP", sap.ui.model.FilterOperator.EQ, oData.EKGRP));
            aFilters.push(new sap.ui.model.Filter("HCP_ACTIVE", sap.ui.model.FilterOperator.EQ, "1"));
            
            let aSorters = [oSorterNome, oSorterSobrenome];
			const data = await new Promise(function (resove, reject) {
                oDataModel.read(Service, {
                	sorters: aSorters,
                	filters: aFilters,
                	urlParameters: {
						"$expand": "Offer_Map_association/Offer_Map_Werks_association,Offer_Map_association/Offer_Material,Appointments_association/Appoint_IntTyp,Appointments_association/Appoint_IntObj,Appointments_association/Appoint_Commit,Price_Intention_association/View_Intention_Material_Type,Price_Intention_association/View_Intention_Suppliers"
					},
                    success: function (data) {
                        resove(data);
                    }.bind(this),
                    error: function (oError) {
                    	oModel.setProperty("/oTableContact", []);
                        reject(oError);
                    }.bind(this),
                });
            });
            
            data.results.map(result => {
            	if(!(oData.oRankingValid?.some( obj =>  obj.HCP_RANK_ID == result.HCP_RANK))) {
            		if (result.HCP_VISIT_FORM == 1)
						result.HCP_VISIT_FORM = 3;
					else
						result.HCP_VISIT_FORM = 4;
            	}
            	
			    if (result.Price_Intention_association.results.length > 0) {
			        let filteredPriceIntention = result.Price_Intention_association.results.filter(price => price.HCP_STATUS === "1");
			        
			        if (this.userName) {
			        	let filteredPriceIntentionName = filteredPriceIntention.filter(priceName => priceName.HCP_CREATED_BY == this.userName);
			          	result.Price_Intention_association.results = filteredPriceIntentionName
			        } else {
		        		result.Price_Intention_association.results = filteredPriceIntention	
		        	}
			    } else {
			        result.Price_Intention_association.results = []
			    }
			    
			    if (result.Appointments_association.results.length > 0) {
			        let filteredAppointments = result.Appointments_association.results.filter(appointment => appointment.HCP_STATUS === "1");
			        
			        if (this.userName) {
			        	let currentDate = new Date();
			        	currentDate.setHours(0);
						currentDate.setMinutes(0);
						currentDate.setSeconds(0);
						currentDate.setMilliseconds(0);
						
						const sixMonthsAfterDate = this.getSixMonthsAfterDate(currentDate);
						
			        	let filteredAppointmentsByUser = filteredAppointments
			        	.filter(appointment => appointment.HCP_CREATED_BY == this.userName)
			        	.filter(appointment => new Date(appointment.HCP_START_DATE) >= currentDate && new Date(appointment.HCP_START_DATE) <= sixMonthsAfterDate)
			        	.sort((a, b) => {
			        		return new Date(a.HCP_START_DATE) - new Date(b.HCP_START_DATE)
			        	})
			        	
			           	result.Appointments_association.results = filteredAppointmentsByUser
			        } else {
		        		result.Appointments_association.results = []
		        	}
			        
			    } else {
			        result.Appointments_association.results = []
			    }
			    
			    if (result.Offer_Map_association.results.length > 0) {
					const currentDate = new Date();
			    	currentDate.setHours(0);
					currentDate.setMinutes(0);
					currentDate.setSeconds(0);
					currentDate.setMilliseconds(0);
					
					const sixMonthsBeforeDate = this.getSixMonthsBeforeDate(currentDate);
					const sixMonthsAfterDate = this.getSixMonthsAfterDate(currentDate);
					
					const offerMapFiltered = result.Offer_Map_association.results.filter((obj) => {
						const dateCreatedOfferMap = new Date(obj.HCP_CREATED_AT_OFFER);
						obj["HCP_WERKS"] = obj.Offer_Map_Werks_association?.results[0]?.HCP_WERKS;
						
						if(obj.HCP_INCOTERM == 1 || obj.HCP_INCOTERM == 3)
							obj["HCP_PRICE"] = obj.Offer_Map_Werks_association?.results[0]?.HCP_PRICE_OFFER;
						else
							obj["HCP_PRICE"] = obj.Offer_Map_Werks_association?.results[0]?.HCP_PRICE_FINAL;
							
						return dateCreatedOfferMap >= sixMonthsBeforeDate && dateCreatedOfferMap <= sixMonthsAfterDate && obj.HCP_STATES_OFFER == "1";
					});		
						
					result.Offer_Map_association.results = offerMapFiltered;
			        
			    } else {
			        result.Offer_Map_association.results = []
			    }
			})
			
    		if (data) {
            	visitFormPending = data.results.filter(obj => obj.HCP_VISIT_FORM == 0 && obj.HCP_VISIT_FORM != null)
    		}
    		
    		oModel.setProperty("/oVisitFormPending", visitFormPending.length);
			
            oData.oTableContact = data.results;
            
            if (oData.oTableContact.length === 0)
            	MessageBox.warning("Nenhuma informação foi encontrada!");
            
            oModel.refresh();
		},
		
		onCheckBox: function(oEvent) {
			
			let oDataModel = this.getOwnerComponent().getModel();
            let oModel = this.getView().getModel("indexModel");
            let oData = oModel.oData;
            let Service = "/Simplified_Contact";
        	var sPath = oEvent.getSource().mBindingInfos.selected.binding.aBindings[0].oContext.sPath;
			var sPlit = sPath.split("/");
			var sIndex = sPlit[2];
			let oPropertiesLog, oPropertiesNormal;
			let messageAlert = '';
			let sCounter = 0;
			var sTimestamp = new Date().getTime() + sCounter;
			
			oDataModel.setUseBatch(true);
			
            if (oData.oTableContact[sIndex].HCP_CONTACT == 0) {
            	oData.oTableContact[sIndex].HCP_CONTACT = 1;
            	oPropertiesLog = {
            		HCP_ID: 			sTimestamp.toFixed(),
            		HCP_CONTACT:		oData.oTableContact[sIndex].HCP_CONTACT,
            		HCP_UPDATED_AT:		new Date(),
            		HCP_UPDATED_BY: 	this.userName,
            		HCP_EKGRP: 			oData.oTableContact[sIndex].HCP_EKGRP,
            		HCP_PARTNER: 		oData.oTableContact[sIndex].HCP_PARTNER,
            		HCP_PARTNER_NAME: 	oData.oTableContact[sIndex].HCP_PARTNER_NAME
				};
            	
            } else {
            	oData.oTableContact[sIndex].HCP_CONTACT = 0;
            	oPropertiesLog = {
            		HCP_ID: 			sTimestamp.toFixed(),
            		HCP_CONTACT:		oData.oTableContact[sIndex].HCP_CONTACT,
            		HCP_UPDATED_AT:		oData.oTableContact[sIndex].HCP_UPDATED_AT_BKP,
            		HCP_UPDATED_BY: 	oData.oTableContact[sIndex].HCP_UPDATED_BY_BKP,
            		HCP_EKGRP: 			oData.oTableContact[sIndex].HCP_EKGRP,
            		HCP_PARTNER: 		oData.oTableContact[sIndex].HCP_PARTNER,
            		HCP_PARTNER_NAME: 	oData.oTableContact[sIndex].HCP_PARTNER_NAME
				};
				
				messageAlert = "Evite desmarcar o campo contato, faça somente em casos de erro!";
            }
            
			oDataModel.create("/Simplified_Contact_Log", oPropertiesLog, {
				groupId: "changes"
			});
			
			sCounter = sCounter + 1;
			
			oPropertiesNormal = Object.assign({}, oPropertiesLog, { HCP_ID: oData.oTableContact[sIndex].HCP_ID });
			
	    	if(oData.oTableContact[sIndex].HCP_CONTACT == 1) {
	    		oPropertiesNormal["HCP_UPDATED_AT_BKP"] = oData.oTableContact[sIndex].HCP_UPDATED_AT;
	    		oPropertiesNormal["HCP_UPDATED_BY_BKP"] = oData.oTableContact[sIndex].HCP_UPDATED_BY;
	    		
	    		oData.oTableContact[sIndex].HCP_UPDATED_AT_BKP = oData.oTableContact[sIndex].HCP_UPDATED_AT
	  			oData.oTableContact[sIndex].HCP_UPDATED_BY_BKP = oData.oTableContact[sIndex].HCP_UPDATED_BY
	    	} else {
	    		oPropertiesNormal.HCP_UPDATED_AT = oData.oTableContact[sIndex].HCP_UPDATED_AT_BKP;
	    		oPropertiesNormal.HCP_UPDATED_BY = oData.oTableContact[sIndex].HCP_UPDATED_BY_BKP;
	    	}
	    	
			let sPath2 = "/Simplified_Contact("+ oPropertiesNormal.HCP_ID + "l)";
			oDataModel.update(sPath2, oPropertiesNormal, {
				groupId: "changes"
			});
	    	
			oDataModel.submitChanges({
				groupId: "changes",
				success: function () {
					oData.oTableContact[sIndex].HCP_UPDATED_AT = oPropertiesNormal.HCP_UPDATED_AT
					oData.oTableContact[sIndex].HCP_UPDATED_BY = oPropertiesNormal.HCP_UPDATED_BY
					oModel.refresh();
					messageAlert ? MessageBox.warning(`Parâmetros editados com sucesso. ${messageAlert}`) : MessageBox.success(`Parâmetros editados com sucesso.`);
				}.bind(this),
				error: function () {
					MessageBox.error("Erro ao editar Parâmetros.");
				}.bind(this)
			});
         	
         },
		
		// doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
		// 	var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
		// 	var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

		// 	var sEntityNameSet;
		// 	if (sPath !== null && sPath !== "") {
		// 		if (sPath.substring(0, 1) === "/") {
		// 			sPath = sPath.substring(1);
		// 		}
		// 		sEntityNameSet = sPath.split("(")[0];
		// 	}
		// 	var sNavigationPropertyName;
		// 	var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

		// 	if (sEntityNameSet !== null) {
		// 		sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
		// 			sRouteName);
		// 	}
		// 	if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
		// 		if (sNavigationPropertyName === "") {
		// 			this.oRouter.navTo(sRouteName, {
		// 				context: sPath,
		// 				masterContext: sMasterContext
		// 			}, false);
		// 		} else {
		// 			oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
		// 				if (bindingContext) {
		// 					sPath = bindingContext.getPath();
		// 					if (sPath.substring(0, 1) === "/") {
		// 						sPath = sPath.substring(1);
		// 					}
		// 				} else {
		// 					sPath = "undefined";
		// 				}
		// 				// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
		// 				if (sPath === "undefined") {
		// 					this.oRouter.navTo(sRouteName);
		// 				} else {
		// 					this.oRouter.navTo(sRouteName, {
		// 						context: sPath,
		// 						masterContext: sMasterContext
		// 					}, false);
		// 				}
		// 			}.bind(this));
		// 		}
		// 	} else {
		// 		this.oRouter.navTo(sRouteName);
		// 	}

		// 	if (typeof fnPromiseResolve === "function") {
		// 		fnPromiseResolve();
		// 	}

		// },
		
		openDialog: function(oEvent) {
            var oView = this.getView();
            let objectList; 
            
            if(oEvent.getParameter("listItem")){
            	objectList = oEvent.getParameter("listItem").getBindingContext("indexModel").getObject();
            	this.nameDialog = "VisitForm";
            }else{
            	objectList = oEvent.getSource().getParent().oBindingContexts.indexModel.getObject()
            	this.nameDialog = oEvent.getSource().getId().split("--")[2].split("Button")[0];
            }
            
            //Verifica se há espaços nos caracteres.
            if (typeof objectList === 'object' && objectList !== null) {
			    Object.keys(objectList).forEach(key => {
			        if (typeof objectList[key] === 'string') {
			            let trimmedString = objectList[key].trimEnd();
			            objectList[key] = trimmedString;
			        }
			    });
			}
            
            this.loadTable(objectList);
            
            let oDialog = sap.ui.xmlfragment(oView.getId(),"com.sap.build.standard.brfAppDeGraosModoEditar.view.visitForm.fragments." + this.nameDialog, this);
            
            oView.addDependent(oDialog);
            oDialog.attachAfterClose(function() {
                oDialog.destroy();
            });
            oDialog.open();
        },
        
        getVisitForms: async function(PARTNER, PARTNER_NAME){
			let oDataModel = this.getOwnerComponent().getModel();
			let list = [];
			let that = this;
		
			let oFilterPartner = new sap.ui.model.Filter("HCP_PROVIDER_ID", sap.ui.model.FilterOperator.Contains, PARTNER);
			let oFilterPartnerName = new sap.ui.model.Filter("HCP_NAME_REGISTERED", sap.ui.model.FilterOperator.Contains, PARTNER_NAME);
			
			let aFilters = new sap.ui.model.Filter({
			    filters: [oFilterPartner, oFilterPartnerName],
			    and: false
			});
			
			let aSorters = new sap.ui.model.Sorter("HCP_VISIT_ID", true); // false significa ordem crescente
			
			let ServicePeriodic = "/Visit_Form_Periodic";
			let ServiceYearly = "/Visit_Form_Yearly";
			let ServiceGrains = "/Visit_Form_Grains";
			let ServiceIndustry = "/Visit_Form_Industry";
 
			list.push(await new Promise(function (resolve, reject) {
                oDataModel.read(ServicePeriodic, {
                	sorters: [aSorters],
                	filters: [aFilters],
                    success: function (data) {
                    	if(data.results[0] != undefined){
                    		data.results[0].HCP_TYPE_VISIT_FORM = that.getView().getModel("i18n").getProperty("textPeriodic");
                    		resolve(data.results[0])
                    	}else
                    		resolve(null);
                    }.bind(this),
                    error: function (oError) {
                        reject(null);
                    }.bind(this),
                });
            })); 
            
			list.push(await new Promise(function (resolve, reject) {
                oDataModel.read(ServiceYearly, {
                	sorters: [aSorters],
                	filters: [aFilters],
                    success: function (data) {
                        if(data.results[0] != undefined){
                    		data.results[0].HCP_TYPE_VISIT_FORM = that.getView().getModel("i18n").getProperty("textYearly");
                    		resolve(data.results[0])
                    	}else
                    		resolve(null);
                    }.bind(this),
                    error: function (oError) {
                        reject(null);
                    }.bind(this),
                });
            }));
            
			list.push(await new Promise(function (resolve, reject) {
                oDataModel.read(ServiceGrains, {
                	sorters: [aSorters],
                	filters: [aFilters],
                    success: function (data) {
                        if(data.results[0] != undefined){
                    		data.results[0].HCP_TYPE_VISIT_FORM = that.getView().getModel("i18n").getProperty("textGrains");
                    		resolve(data.results[0])
                    	}else
                    		resolve(null);
                    }.bind(this),
                    error: function (oError) {
                        reject(null);
                    }.bind(this),
                });
            }));
            
			list.push(await new Promise(function (resolve, reject) {
                oDataModel.read(ServiceIndustry, {
                	sorters: [aSorters],
                	filters: [aFilters],
                    success: function (data) {
                        if(data.results[0] != undefined){
                    		data.results[0].HCP_TYPE_VISIT_FORM = that.getView().getModel("i18n").getProperty("textIndustry");
                    		resolve(data.results[0])
                    	}else
                    		resolve(null);
                    }.bind(this),
                    error: function (oError) {
                        reject(null);
                    }.bind(this),
                });
            }));
            
            return list.filter(item => item !== null);
		},
		
		loadTable: async function(objectList) {
         	let oModel = this.getView().getModel("indexModel");
            let oData = oModel.oData;
            let list = [];
			
			oData.partner = objectList.HCP_PARTNER;
			oData.partnerName = objectList.HCP_PARTNER_NAME;
			oData.simplifiedId = objectList.HCP_ID;
			oModel.setProperty("/oTableDialog", []);
			
			switch(this.nameDialog){
				case 'VisitForm':
					list = await this.getVisitForms(objectList.HCP_PARTNER, objectList.HCP_PARTNER_NAME);
            		break;
            	case 'OfferMap':
            		list = objectList?.Offer_Map_association?.results?.sort((a, b) => {
            			let valueA = a.HCP_WERKS.replace(/\D/g, "");
            			let valueB = b.HCP_WERKS.replace(/\D/g, "");
            			return valueA - valueB
            		});
            		break;
            	case 'Appointments':
            		list = objectList?.Appointments_association?.results?.filter(data => data.HCP_STATUS == "1")
            		break;
            	case 'PriceIntention':
            		list = objectList?.Price_Intention_association?.results?.filter(data => data.HCP_STATUS == "1");
            		break;
            	default:
            		oModel.setProperty("/oTableDialog", []);
            }
            if(list.length > 0){
            	for (let i = 0; i < list.length; i++) {
				  list[i].HCP_PARTNER_NAME = objectList.HCP_PARTNER_NAME;
				}
            	oModel.setProperty("/oTableDialog", list)	
            }
			oModel.refresh();
    	},
    	
		handleCreate: function (oEvent) {
			var oModel = this.getView().getModel("indexModel");
			var oData = oModel.oData;
			
			switch(this.nameDialog){
				case 'VisitForm':
					MessageBox.warning(
						this.resourceBundle.getText("questionGoCreateVisitForm"), {
							actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
							onClose: function (sAction) {
								if (sAction === "YES") {
									this.oRouter.navTo("visitForm.New", {
										partner: encodeURIComponent(oData.partner),
										partnerName: encodeURIComponent(oData.partnerName),
									});
								}
							}.bind(this)
						}
					);
            		break;
            	case 'OfferMap':
            		MessageBox.warning(
						this.resourceBundle.getText("questionGoCreateOfferMap"), {
							actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
							onClose: function (sAction) {
								if (sAction === "YES") {
									this.oRouter.navTo("offerMap.New", {
										partner: encodeURIComponent(oData.partner),
										partnerName: encodeURIComponent(oData.partnerName),
										ekgrp: encodeURIComponent(oData.EKGRP)
									});
								}
							}.bind(this)
						}
					);
            		break;
            	case 'Appointments':
            		MessageBox.warning(
						this.resourceBundle.getText("questionGoCreateAppointments"), {
							actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
							onClose: function (sAction) {
								if (sAction === "YES") {
									this.oRouter.navTo("schedule.Index", {
										partner: encodeURIComponent(oData.partner),
										partnerName: encodeURIComponent(oData.partnerName),
										keyData: encodeURIComponent(null)
									});
								}
							}.bind(this)
						}
					);
            		break;
            	case 'PriceIntention':
            		MessageBox.warning(
						this.resourceBundle.getText("questionGoCreatePriceIntent"), {
							actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
							onClose: function (sAction) {
								if (sAction === "YES") {
									this.oRouter.navTo("price.priceIntention.New", {
										partner: encodeURIComponent(oData.partner),
										ekgrp: encodeURIComponent(oData.EKGRP)
									});
								}
							}.bind(this)
						}
					);
            		break;
            }
		},
		
		handleEdit: function (oEvent) {
			var sPath = oEvent.getSource().getParent().oBindingContexts.indexModel.sPath;
			let oDataModel = this.getOwnerComponent().getModel();
			let oModel = this.getView().getModel("indexModel");
            let oData = oModel.oData;
			var sPlit = sPath.split("/");
			var sIndex = sPlit[2];
			let list = oData.oTableDialog[sIndex];
			let sendDataUrl = JSON.stringify(list);
			let senderRoute = null;
			
			this.awaitUpdateSimplifiedContact(oData, list);
			
			switch(this.nameDialog){
				case 'VisitForm':
					
					let URLVisitForm;
					
					switch(list.HCP_TYPE_VISIT_FORM){
						case this.getView().getModel("i18n").getProperty("textPeriodic"):
							URLVisitForm = 'visitForm.EditPeriodicVisitForm'
							break;
						case this.getView().getModel("i18n").getProperty("textYearly"):
							URLVisitForm = 'visitForm.EditYearlyVisitForm'
							break;
						case this.getView().getModel("i18n").getProperty("textGrains"):
							URLVisitForm = 'visitForm.EditGrainsVisitForm'
							break;
						case this.getView().getModel("i18n").getProperty("textIndustry"):
							URLVisitForm = 'visitForm.EditIndustryVisitForm'
							break;
					}
					
            		MessageBox.warning(
						this.resourceBundle.getText("questionGoEditVisitForm"), {
							actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
							onClose: function (sAction) {
								if (sAction === "YES") {
									this.oRouter.navTo(URLVisitForm, {
										keyData: encodeURIComponent(sendDataUrl)
									}, false);
								}
							}.bind(this)
						}
					);
            		break;
            	case 'OfferMap':
            		
            		senderRoute = "/Offer_Map("+ list.HCP_OFFER_ID + "l)";
            		
            		MessageBox.warning(
						this.resourceBundle.getText("questionGoEditOfferMap"), {
							actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
							onClose: function (sAction) {
								if (sAction === "YES") {
									this.oRouter.navTo("offerMap.Edit", {
										keyData: encodeURIComponent(senderRoute)
									}, false);
								}
							}.bind(this)
						}
					);
            		break;
            	case 'Appointments':
            		
            		MessageBox.warning(
						this.resourceBundle.getText("questionGoEditAppointments"), {
							actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
							onClose: function (sAction) {
								if (sAction === "YES") {
									this.oRouter.navTo("schedule.Index", {
										partner: encodeURIComponent(oData.partner),
										partnerName: encodeURIComponent(oData.partnerName),
										keyData: encodeURIComponent(sendDataUrl)
									}, false);
								}
							}.bind(this)
						}
					);
            		break;
            	case 'PriceIntention':
            		senderRoute = "/Price_Intention("+ list.HCP_PRICE_INTENTION_ID + "l)";
            		
            		MessageBox.warning(
						this.resourceBundle.getText("questionGoEditPriceIntent"), {
							actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
							onClose: function (sAction) {
								if (sAction === "YES") {
									
									this.oRouter.navTo("price.priceIntention.Edit", {
										keyData: encodeURIComponent(senderRoute),
										option: encodeURIComponent("priceIntention")
									}, false);
								}
							}.bind(this)
						}
					);
            		break;
            }
		},
		
		handleCancel: function() {
			let oModel = this.getView().getModel("indexModel");
            oModel.setProperty("/oTableDialog", []);
    		
    		var oDialog = this.getView().byId(this.nameDialog);
            oDialog.close();			
        },
         
        _validateForm: function (oEvent) {
			var fieldName = '';

			if (oEvent) {
				fieldName = oEvent.getSource().getName();
			}

			var oModelFilters = this.getView().getModel("filters");

			if (this.getView().getModel("filters").getProperty("/moreOptionsColor") == "Positive") {
				var plant = this.getView().byId("PLANT").mProperties.value;
				if (plant != "") {
					this.getView().getModel("filters").setProperty("/noOptions", true);
				}
			}

			if (!oModelFilters.oData.noOptions) {
				return new Promise(function (resolve, reject) {

					//mais opçoes selecionados

					var arrayFields = ["PLANT", "MATERIAL", "CEREAL"];
					var enableFilter = true;
					var aControlss = [];
					var aPromises = [];

					for (var i = 0; i < arrayFields.length; i++) {
						aPromises.push(new Promise(function (resolves, reject) {

							var campo = this.getView().byId(arrayFields[i]);

							aControlss.push({
								control: campo,
								required: campo.oParent.mAggregations.items[0].getRequired && campo.oParent.mAggregations.items[0].getRequired(),
								text: campo.oParent.mAggregations.items[0].getText
							});

							var aInputControls = aControlss;
							var oControl;

							for (var m = 0; m < aInputControls.length; m++) {
								oControl = aInputControls[m].control;
								oControl.setValueState("None");

								if (aInputControls[m].required) {
									var sValue = oControl.getValue();
									if (sValue.length > 0) {
										resolves();
									} else {
										enableFilter = false;
										oControl.setValueState("Error");
										resolves();
										return;
									}
								}
							}
						}.bind(this)));
					}

					//fim
					Promise.all(aPromises).then(function () {
						resolve();
						if (enableFilter) {

							var oModelFilters = this.getView().getModel("filters");
							var material = this.getView().byId("MATERIAL").mProperties.selectedKey;
							var cereal = this.getView().byId("CEREAL").mProperties.selectedKey;
							var materialId = material.split("-");
							oModelFilters.setProperty("/MATERIAL", materialId[0] + "|" + cereal + "|" + this.getView().byId("MATERIAL").mProperties.value +
								" / " + this.getView().byId("CEREAL").mProperties.value + "");

							this.getPriceMaterial();
						}
					}.bind(this));
				}.bind(this));
			} else {
				//filtro padrao
				var campos = this.getView().byId("PLANT");

				var aControls = [];

				aControls.push({
					control: campos,
					required: campos.oParent.mAggregations.items[0].getRequired && campos.oParent.mAggregations.items[0].getRequired(),
					text: campos.oParent.mAggregations.items[0].getText
				});

				setTimeout(function () {
					var aInputControls = aControls;
					var oControl;

					for (var m = 0; m < aInputControls.length; m++) {
						oControl = aInputControls[m].control;
						oControl.setValueState("None");
						if (aInputControls[m].required) {
							var sValue = oControl.getValue();
							if (sValue.length > 0) {
								this.getPriceMaterial();
							} else {
								this.getView().getModel("filters").setProperty("/noOptions", false);
								oControl.setValueState("Error");
								return;
							}
						}
					}
				}.bind(this), 100);
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

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}
		},
		
		// verifyTimeOut: function () {
		// 	if (!this.hasFinished) {
		// 		setTimeout(function () {
		// 			this.setBusyDialog("App Grãos", "Enviando dados, por favor aguarde (" + this.revertCount +
		// 				")");
		// 			this.count++;
		// 			this.revertCount--;
		// 			//	console.log("Countador está em: " + this.count);
		// 			if (this.count > 20) {
		// 				this.showMessage();
		// 			} else {
		// 				this.verifyTimeOut();
		// 			}

		// 		}.bind(this), 1000);
		// 	} else {
		// 		if (this.busyDialog) {
		// 			this.busyDialog.close();
		// 		}
		// 	}
		// },

		// showMessage: function () {
		// 	localStorage.setItem("isNeededToReload", true);
		// 	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		// 	oRouter.navTo("errorPages.timeOutConnection", true);
		// },
		
		sortButtonPressed: function (oEvent) {
			if (!this.SortDialog) {
				this.SortDialog = sap.ui.xmlfragment("com.sap.build.standard.brfAppDeGraosModoEditar.view.visitForm.fragments.SortDialogSimplifiedContact", this);
				this.getView().addDependent(this.SortDialog);
			}

			this.SortDialog.openBy(oEvent.getSource());
		},
		
		submitSortList: function (oEvent) {
			var oSelectedColumn = sap.ui.getCore().byId("group_column").getSelectedButton().getId();
			var oSelectedSort = sap.ui.getCore().byId("group_sort").getSelectedButton().getId();
			var oTable;
			oTable = this.getView().byId("table");
			
			var oSorter = [];
	
			oSorter.push(new sap.ui.model.Sorter({
				path: oSelectedColumn,
				descending: oSelectedSort === "descending" ? true : false,
				upperCase: false
			}));
	
			oTable.getBinding("items").sort(oSorter);
	
			this.SortDialog.close();
		},
		
		filterButtonPressed: function (oEvent) {
			if (!this._FragmentFilter) {
				this._FragmentFilter = sap.ui.xmlfragment(
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.visitForm.fragments.FilterDialogSimplifiedContact",
					this);

				var oModelFilters = new JSONModel({
					HCP_STCD1: "",
					HCP_PARTNER_NAME: "",
					HCP_RANK: "",
					HCP_VISIT_FORM: ""
				});

				this.getView().setModel(oModelFilters, "filters");
				this.getView().addDependent(this._FragmentFilter);
			}

			this._FragmentFilter.openBy(oEvent.getSource());
		},

		submitFilterList: function (oEvent) {
			let oFilterModel = this.getView().getModel("filters");
			let oFiltertData = oFilterModel.getProperty("/");
			let oFilters = [];
			let oTable = this.getView().byId("table");
			
			let formatCPFCNPJ
			
			if (oFiltertData.HCP_STCD1)
				formatCPFCNPJ = oFiltertData.HCP_STCD1.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim();

			oFiltertData.HCP_STCD1 ? oFilters.push(new sap.ui.model.Filter("HCP_STCD1", sap.ui.model.FilterOperator.Contains, formatCPFCNPJ)) : false;
			oFiltertData.HCP_PARTNER_NAME ? oFilters.push(new sap.ui.model.Filter("HCP_PARTNER_NAME", sap.ui.model.FilterOperator.Contains, oFiltertData.HCP_PARTNER_NAME)) : false;
			oFiltertData.HCP_RANK ? oFilters.push(new sap.ui.model.Filter("HCP_RANK", sap.ui.model.FilterOperator.Contains, oFiltertData.HCP_RANK)) : false;
			oFiltertData.HCP_VISIT_FORM ? oFilters.push(new sap.ui.model.Filter("HCP_VISIT_FORM", sap.ui.model.FilterOperator.EQ, oFiltertData.HCP_VISIT_FORM)) : false;

			oTable.getBinding("items").filter(oFilters);

			this._FragmentFilter.close();
		}
		
	});
}, /* bExport= */ true);

