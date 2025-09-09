sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/List',
	'sap/m/StandardListItem',
	"sap/ui/core/routing/History",
	'com/sap/build/standard/brfAppDeGraosModoEditar/controls/CustomComboBox'
], function (MainController, MessageBox, JSONModel, Button, Dialog, List, StandardListItem, History, CustomComboBox) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.visitForm.EditYearlyVisitForm", {

		onInit: function () {

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("visitForm.EditYearlyVisitForm").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableSave: false,
				edit: false,
				yesOthers: false,
				yesStorage: true,
				yesSiloBag: false,
				yesBarter: true,
				ufPlanting: [],
				cultureType: [],
				negotiationInputs: [],
				certifications: []
			}), "editYearlyVisitModel");

			this.period = this._getPeriod();
			//var oModelOwner = this.getOwnerComponent().getModel();
			//oModelOwner.refresh(true);
		},

		handleRouteMatched: function (oEvent) {

			this.getUser().then(function (userName) {
				this.userName = userName;
				
				this.getUserProfile("View_Profile_Visit", this.userName).then(profileData => {
					this.getView().getModel("profileModel").setData(profileData);
					console.log(this.getView().getModel("profileModel").getData());
					this.closeBusyDialog();
				}).catch(error => {
					console.log(error);
					this.closeBusyDialog();
				});
				this.searchValuesCultureType();
			}.bind(this));
			var oEditModel = this.getView().getModel("editYearlyVisitModel");
			var oModel = this.getView().getModel();
			var oData;
			var oModelData = oEditModel.oData;

			this.clearContainers("ufPlantingDataSimpleForm");
			this.clearContainers("newCultureSimpleForm");

			if (oEvent.getParameter("data")) {
				var sPathKeyData = oEvent.getParameter("data").keyData;
				var sOperation = oEvent.getParameter("data").operation;
				oData = oModel.getProperty(decodeURIComponent(sPathKeyData));
				if(oData)
					oData = JSON.parse(JSON.stringify(oData));
				else
					oData = JSON.parse(decodeURIComponent(sPathKeyData));
			}

			oEditModel.setProperty("/", oData);
			if (sOperation == "View") {
				oEditModel.setProperty("/isEnable", false);
			} else {
				oEditModel.setProperty("/isEnable", true);
			}

			this.setBusyDialog("Ficha de Visitas", "Carregando dados, por favor aguarde");
			this.searchFieldValues();
			this.searchValuesStorageType(oModel, false);
			this.searchValuesCertifications(oModel, false);
			this._searchPartnerName();
			this.searchValuesUpPlanting();

			setTimeout(function () {
				oEditModel.setProperty("/enableSave", false);
				oEditModel.setProperty("/edit", false);
			}.bind(this), 150);

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				create: true,
				edit: true
			}), "profileModel");
			
			if(!oData.NAME_LIFNR && !oData.NAME_PROSPECT){
				this._getProviderName(oData.HCP_PROVIDER_ID).then(function (nameRegistered) {
				oEditModel.setProperty("/HCP_NAME_REGISTERED", nameRegistered);
				}.bind(this)).catch(function (error) {
					console.log(error);
				}.bind(this));
			}
		},
		
		getCropYear: async function () {
			let oModel = this.getView().getModel()
			let oModelCropYear = this.getView().getModel("editYearlyVisitModel")
            let oFilters = [];
				
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
			
			const dataAtual = new Date();

			const safrasAtuaisEFuturas = listCropYears.filter(safra => {
			    const inicioSafra = new Date(safra.HCP_RANGE_START);
			    const fimSafra = new Date(safra.HCP_RANGE_END);

			    return fimSafra >= dataAtual;
			});
			
			if (safrasAtuaisEFuturas)
				oModelCropYear.setProperty("/itemsCropYear", safrasAtuaisEFuturas)
		},
		
		getUserProfileMasterData: async function (sUserName) {
			var oModel = this.getView().getModel();
			var oVisitFormModel = this.getView().getModel("editYearlyVisitModel");

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

		clearContainers: function (oContainerId) {
			var oCharDataFormContent = this.getView().byId(oContainerId).getContent();
			var oCharContainers = oCharDataFormContent.filter(control => control.getMetadata().getName() === "sap.m.VBox");

			if (oCharContainers) {
				for (var container of oCharContainers) {
					container.destroy();
				}
			}
		},

		_getPeriod: function () {

			var oDate = new Date();
			var oYear = oDate.getFullYear();

			oDate.setHours(0, 0, 0);
			oDate.setDate(oDate.getDate() + 4 - (oDate.getDay() || 7));

			var oWeek = Math.ceil((((oDate - new Date(oDate.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
			var oPeriod = oWeek + "/" + oYear;
			return oPeriod;

		},

		searchFieldValues: function () {

			var oEditModel = this.getView().getModel("editYearlyVisitModel");
			var oData = oEditModel.oData;

			oEditModel.setProperty("/yesProspect", false);
			oEditModel.setProperty("/yesPartnerBRF", true);
			oEditModel.setProperty("/partnerProspect", "Fornecedor");

			if (oData.HCP_PARTNER_BRF_SUP == 1) { //Sim

				oEditModel.setProperty("/noPartner", false);
				oEditModel.setProperty("/yesPartner", true);

			} else if (oData.HCP_PARTNER_BRF_SUP == 0) { //Não

				oEditModel.setProperty("/noPartner", true);
				oEditModel.setProperty("/yesPartner", false);

			} else { //Prospect

				oEditModel.setProperty("/yesProspect", true);
				oEditModel.setProperty("/yesPartnerBRF", false);
				oEditModel.setProperty("/partnerProspect", "Prospect");

				oEditModel.setProperty("/noPartner", false);
				oEditModel.setProperty("/yesPartner", false);
				oEditModel.setProperty("/yesProspect", true);
			}

			if (oData.HCP_STORAGE_STRUCTURE == 1) {
				oEditModel.setProperty("/yesStorage", true);
				// oEditModel.setProperty("/negotiationInputs", []);
				// oEditModel.setProperty("/HCP_CAPACITY", null);
			} else {
				oEditModel.setProperty("/yesStorage", false);
			}

			if (oData.HCP_BARTER_EXCHANGE == 0) {
				oEditModel.setProperty("/yesBarter", false);
				oEditModel.setProperty("/HCP_AMOUNT", 0);
			}

			if (oData.HCP_SILOS_BAG == 0 ) {
				oEditModel.setProperty("/yesSilosBag", false);
				oEditModel.setProperty("/HCP_SILO_VOLUME", null);
			} else {
				oEditModel.setProperty("/yesSilosBag", true);
				oEditModel.setProperty("/HCP_SILO_VOLUME", oData.HCP_SILO_VOLUME);
			}

		},

		_onInputFormSelect: function (oEvent) {

			var oModelYearly = this.getView().getModel("editYearlyVisitModel");
			var oInput = oEvent.getSource();

			oModelYearly.setProperty("/HCP_PARTNER", null);

			if (oInput.getSelectedKey() === "Fornecedor") {

				oModelYearly.setProperty("/yesProspect", false);
				oModelYearly.setProperty("/yesPartner", true);
				oModelYearly.setProperty("/yesPartnerBRF", true);
				oModelYearly.setProperty("/HCP_PARTNER_BRF_SUP", "1");

			} else {

				oModelYearly.setProperty("/yesProspect", true);
				oModelYearly.setProperty("/yesPartner", false);
				oModelYearly.setProperty("/yesPartnerBRF", false);
				oModelYearly.setProperty("/noPartner", false);

				oModelYearly.setProperty("/partnerDesc", null);
				oModelYearly.setProperty("/HCP_PARTNER_BRF_SUP", null);
			}

			this._validateForm();

		},

		_onInputStorageStructure: function () {

			var oEditModel = this.getView().getModel("editYearlyVisitModel");
			var oData = oEditModel.oData;

			oEditModel.setProperty("/yesStorage", true);

			if (oData.HCP_SILOS_BAG == 0 ) {
				oEditModel.setProperty("/yesSilosBag", false);
				oEditModel.setProperty("/HCP_SILO_VOLUME", null);
			} else {
				oEditModel.setProperty("/yesSilosBag", true);
			}

			if (oData.HCP_STORAGE_STRUCTURE == 0) {
				oEditModel.setProperty("/yesStorage", false);
				oEditModel.setProperty("/negotiationInputs", []);
				oEditModel.setProperty("/HCP_CAPACITY", null);
				oEditModel.setProperty("/HCP_SILO_VOLUME", null);
				oEditModel.setProperty("/yesSilosBag", false);
				oEditModel.setProperty("/HCP_SILOS_BAG", "0");
			}

			this._validateForm();

		},
		
		_getProviderName: function (PROVIDER_ID) {
			return new Promise(function (resolve, reject) {
				var oModel = this.getView().getModel();
				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;
				var aFilters = [];
				var bFilters = [];
				var nameRegistered;
	
				aFilters.push(new sap.ui.model.Filter({
					path: "LIFNR",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: PROVIDER_ID
				}));
	
				bFilters.push(new sap.ui.model.Filter({
					path: "HCP_PROSP_ID",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: PROVIDER_ID
				}));
			
				//No mobile, não entrar nessa LFA1, pesada demais para o banco offline.
				if (!bIsMobile){
					oModel.read("/View_LFA1", {
						filters: aFilters,
						success: function (results) {
							var aResults = results.results;
	
							if (aResults[0].NAME1) {
								nameRegistered = aResults[0]?.NAME1;
							} else if (aResults[0].NAME2) {
								nameRegistered = aResults[0]?.NAME2;
							} else if (aResults[0].NAME3) {
								nameRegistered = aResults[0]?.NAME3;
							} else if (aResults[0].NAME4) {
								nameRegistered = aResults[0]?.NAME4;
							}
							resolve(nameRegistered);
						}.bind(this),
						error: function (error) {
						}
					});
				}
				
				//Consulta normal WEB e Mobile
				oModel.read("/View_Grouping_Suppliers", {
					filters: aFilters,
					success: function (results) {
						var aResults = results.results;
	
						if (aResults[0].NAME1) {
							nameRegistered = aResults[0]?.NAME1;
						} else if (aResults[0].NAME2) {
							nameRegistered = aResults[0]?.NAME2;
						} else if (aResults[0].NAME3) {
							nameRegistered = aResults[0]?.NAME3;
						} else if (aResults[0].NAME4) {
							nameRegistered = aResults[0]?.NAME4;
						}
						resolve(nameRegistered);
					}.bind(this),
					error: function (error) {
					}
				});
				
				//ULTIMA CONSULTA Á TABELA PROSPECTS WEB + MOBILE
				oModel.read("/Prospects", {
					filters: bFilters,
					success: function (results) {
						var bResults = results?.results;
	
						if (bResults[0].NAME1) {
							nameRegistered = bResults[0]?.NAME1;
						} else if (bResults[0].NAME1) {
							nameRegistered = bResults[0]?.NAME2;
						}
						resolve(nameRegistered);
					}.bind(this),
					error: function (error) {
						nameRegistered = "ERROR NAME";
						resolve(nameRegistered);
					}
				});
			}.bind(this));
		},

		_onInputSilosStructure: function () {

			let oEditModel = this.getView().getModel("editYearlyVisitModel");
			let oData = oEditModel.oData;

			oEditModel.setProperty("/yesSilosBag", true);

			if (oData.HCP_SILOS_BAG == 0) {
				oEditModel.setProperty("/yesSilosBag", false);
				oEditModel.setProperty("/HCP_SILO_VOLUME", null);
			}
			
			this._validateForm();
		},

		_onInputBarterExchange: function () {

			var oEditModel = this.getView().getModel("editYearlyVisitModel");
			var oData = oEditModel.oData;

			oEditModel.setProperty("/yesBarter", true);

			if (oData.HCP_BARTER_EXCHANGE == 0) {
				oEditModel.setProperty("/yesBarter", false);
				oEditModel.setProperty("/HCP_AMOUNT", 0);
			}

			this._validateForm();

		},

		searchValuesStorageType: function (oModel, oRemove) {
			return new Promise(function (resolve, reject) {
				var oModelVisit = this.getView().getModel();
				var oEditModel = this.getView().getModel("editYearlyVisitModel");
				var oData = oEditModel.oData;
				var aFilters = [];
				var aDeferredGroups = oModel.getDeferredGroups();

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_UNIQUE_KEY
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_VISIT_TYPE",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "Yearly"
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_PERIOD",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_PERIOD
				}));

				if (!oRemove) {
					oEditModel.setProperty("/negotiationInputs", []);
				} else {

					if (aDeferredGroups.indexOf("removes") < 0) {
						aDeferredGroups.push("removes");
						oModel.setDeferredGroups(aDeferredGroups);
					}
				}

				oModelVisit.read("/Visit_Storage_Type", {
					filters: aFilters,
					success: function (results) {
						var aResults = results.results;

						var negotiationInputs = [];

						for (var i = 0; i < aResults.length; i++) {

							if (!oRemove) {
								negotiationInputs.push(aResults[i].HCP_STORAGE_STRUCTURE);

							} else if (this.period === aResults[i].HCP_PERIOD) {
								// var sPath = "/Visit_Storage_Type(" + aResults[i].HCP_VISIT_ID + "l)";
								var sPath = this.buildEntityPath("Visit_Storage_Type", aResults[i]);
								oModel.remove(sPath, {
									groupId: "removes"
								});

								oEditModel.setProperty("/groupRemoves", true);
							}
						}
						if (!oRemove) {
							oEditModel.setProperty("/negotiationInputs", negotiationInputs);
						}
						resolve();
					}.bind(this),
					error: function (error) {
						reject();
					}
				});
			}.bind(this));
		},

		searchValuesCertifications: function (oModel, oRemove) {
			return new Promise(function (resolve, reject) {
				var oModelVisit = this.getView().getModel();
				var oEditModel = this.getView().getModel("editYearlyVisitModel");
				var oData = oEditModel.oData;
				var aFilters = [];
				var aDeferredGroups = oModel.getDeferredGroups();

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_UNIQUE_KEY
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_VISIT_TYPE",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "Yearly"
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_PERIOD",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_PERIOD
				}));

				if (!oRemove) {
					oEditModel.setProperty("/certification", []);
					oEditModel.setProperty("/yesOthers", false);

				} else {

					if (aDeferredGroups.indexOf("removes") < 0) {
						aDeferredGroups.push("removes");
						oModel.setDeferredGroups(aDeferredGroups);
					}

				}

				oModelVisit.read("/Visit_Form_Certifications", {
					filters: aFilters,
					success: function (results) {
						var aResults = results.results;

						var oCertifications = [];

						for (var i = 0; i < aResults.length; i++) {

							if (!oRemove) {

								oCertifications.push(aResults[i].HCP_CERTIFICATION);

								if (aResults[i].HCP_CERTIFICATION === '11') {
									oEditModel.setProperty("/yesOthers", true);
									oEditModel.setProperty("/HCP_OTHERS", aResults[i].HCP_OTHERS);
								}

							} else if (this.period === aResults[i].HCP_PERIOD) {

								// var sPath = "/Visit_Form_Certifications(" + aResults[i].HCP_VISIT_ID + "l)";
								var sPath = this.buildEntityPath("Visit_Form_Certifications", aResults[i]);
								oModel.remove(sPath, {
									groupId: "removes"
								});
								oEditModel.setProperty("/groupRemoves", true);
							}
						}
						if (!oRemove) {
							oEditModel.setProperty("/certifications", oCertifications);
						}
						resolve();
					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});
			}.bind(this));
		},

		searchValuesUpPlanting: function () {

			var oModelVisit = this.getView().getModel();
			var oEditModel = this.getView().getModel("editYearlyVisitModel");
			var oData = oEditModel.oData;
			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var oCharTemplate;
			var aFilters = [];

			oEditModel.setProperty("/ufPlanting", []);

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_UNIQUE_KEY",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_UNIQUE_KEY
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_PERIOD",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_PERIOD
			}));

			oModelVisit.read("/Visit_Uf_Planting", {

				filters: aFilters,
				success: function (results) {

					var aResults = results.results;

					for (var i = 0; i < aResults.length; i++) {

						oCharTemplate = this.buildUFTemplate();

						oMainDataForm[1].addContent(new sap.m.Label({
							text: ""
						}));
						oMainDataForm[1].addContent(oCharTemplate);

						oEditModel.setProperty("/ufPlanting/" + i + "/status", "Edit");
						oEditModel.setProperty("/ufPlanting/" + i + "/HCP_VISIT_ID", aResults[i].HCP_VISIT_ID);
						oEditModel.setProperty("/ufPlanting/" + i + "/HCP_UF_PLANTING", aResults[i].HCP_UF_PLANTING);
						oEditModel.setProperty("/ufPlanting/" + i + "/HCP_HECTARESAREA", aResults[i].HCP_HECTARESAREA);
						oEditModel.setProperty("/ufPlanting/" + i + "/HCP_LEASED_AREA", aResults[i].HCP_LEASED_AREA);
						oEditModel.setProperty("/ufPlanting/" + i + "/idHectaresArea", aResults[i].HCP_LEASED_AREA === 0 ? false : true);

						if (aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
							oEditModel.setProperty("/ufPlanting/" + i + "/@com.sap.vocabularies.Offline.v1.isLocal", true);
							oEditModel.setProperty("/ufPlanting/" + i + "/__metadata", aResults[i].__metadata);

						}

					}

					oEditModel.refresh();
					this.closeBusyDialog();

				}.bind(this),
				error: function (error) {

				}
			});

		},

		searchValuesCultureType: async function () {

			var oModelVisit = this.getView().getModel();
			var oEditModel = this.getView().getModel("editYearlyVisitModel");
			var oData = oEditModel.oData;
			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var oCharTemplate;
			var aFilters = [];

			oEditModel.setProperty("/cultureType", []);
			
			let hasAutorizationToEdit = await this.getUserProfileMasterData(this.userName)
			await this.getCropYear()

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_UNIQUE_KEY",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_UNIQUE_KEY
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_VISIT_TYPE",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: "Yearly"
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_PERIOD",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_PERIOD
			}));

			oModelVisit.read("/Visit_Culture_Type", {

				filters: aFilters,
				success: function (results) {

					var aResults = results.results;
					var oNegotiationInputs = [];

					for (var i = 0; i < aResults.length; i++) {
						let currentSafraYear = oEditModel.oData.itemsCropYear.some(item => item.HCP_CROP_ID === aResults[i].HCP_SAFRA_YEAR);
						
						if (hasAutorizationToEdit) {
							oEditModel.setProperty("/hasPermissionToEditOldSafra", true)
						} else if (!hasAutorizationToEdit && !currentSafraYear) {
							oEditModel.setProperty("/hasPermissionToEditOldSafra", false)
						} else {
							oEditModel.setProperty("/hasPermissionToEditOldSafra", true)
						}

						oCharTemplate = this.buildCultureTypeTemplate();

						oMainDataForm[7].addContent(new sap.m.Label({
							text: ""
						}));

						oMainDataForm[7].addContent(oCharTemplate);

						oEditModel.setProperty("/cultureType/" + i + "/status", "Edit");
						oEditModel.setProperty("/cultureType/" + i + "/HCP_VISIT_ID", aResults[i].HCP_VISIT_ID);
						oEditModel.setProperty("/cultureType/" + i + "/HCP_CULTURE_TYPE", aResults[i].HCP_CULTURE_TYPE);
						oEditModel.setProperty("/cultureType/" + i + "/HCP_SAFRA_YEAR", aResults[i].HCP_SAFRA_YEAR);
						oEditModel.setProperty("/cultureType/" + i + "/HCP_HECTARE_PLANT_AREA", aResults[i].HCP_HECTARE_PLANT_AREA);
						oEditModel.setProperty("/cultureType/" + i + "/HCP_PRODUCTIVITY", aResults[i].HCP_PRODUCTIVITY);
						oEditModel.setProperty("/cultureType/" + i + "/HCP_PRODUCTIVITY_TOTAL", aResults[i].HCP_PRODUCTIVITY_TOTAL);

						if (aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
							oEditModel.setProperty("/cultureType/" + i + "/@com.sap.vocabularies.Offline.v1.isLocal", true);
							oEditModel.setProperty("/cultureType/" + i + "/__metadata", aResults[i].__metadata);
						}

						oNegotiationInputs.push(aResults[i].HCP_JANUARY === '1' ? "HCP_JANUARY" : false);
						oNegotiationInputs.push(aResults[i].HCP_FEBRUARY === '1' ? "HCP_FEBRUARY" : false);
						oNegotiationInputs.push(aResults[i].HCP_MARCH === '1' ? "HCP_MARCH" : false);
						oNegotiationInputs.push(aResults[i].HCP_APRIL === '1' ? "HCP_APRIL" : false);
						oNegotiationInputs.push(aResults[i].HCP_MAY === '1' ? "HCP_MAY" : false);
						oNegotiationInputs.push(aResults[i].HCP_JUNE === '1' ? "HCP_JUNE" : false);
						oNegotiationInputs.push(aResults[i].HCP_JULY === '1' ? "HCP_JULY" : false);
						oNegotiationInputs.push(aResults[i].HCP_AUGUST === '1' ? "HCP_AUGUST" : false);
						oNegotiationInputs.push(aResults[i].HCP_SEPTEMBER === '1' ? "HCP_SEPTEMBER" : false);
						oNegotiationInputs.push(aResults[i].HCP_OCTOBER === '1' ? "HCP_OCTOBER" : false);
						oNegotiationInputs.push(aResults[i].HCP_NOVEMBER === '1' ? "HCP_NOVEMBER" : false);
						oNegotiationInputs.push(aResults[i].HCP_DECEMBER === '1' ? "HCP_DECEMBER" : false);

						oEditModel.setProperty("/cultureType/" + i + "/negotiationInputs", oNegotiationInputs);
						oNegotiationInputs = [];

					}

					oEditModel.refresh();

				}.bind(this),
				error: function (error) {

				}
			});

		},
		_onInputPartnerFormSelect: function (oEvent) {

			var oModelYearly = this.getView().getModel("editYearlyVisitModel");
			var oInput = oEvent.getSource();

			oModelYearly.setProperty("/HCP_PARTNER", null);
			oModelYearly.setProperty("/partnerDesc", null);

			if (oInput.getSelectedKey() == 1) {

				oModelYearly.setProperty("/noPartner", false);
				oModelYearly.setProperty("/yesPartner", true);

			} else {

				oModelYearly.setProperty("/noPartner", true);
				oModelYearly.setProperty("/yesPartner", false);

			}

			this._validateForm();

		},

		_searchPartnerName: function () {

			var oModelVisit = this.getView().getModel();
			var oModelYearly = this.getView().getModel("editYearlyVisitModel");
			var aFilters = [];

			if (oModelYearly.oData.HCP_PARTNER && oModelYearly.oData.HCP_PARTNER_BRF_SUP == "1") {

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_REGISTER',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oModelYearly.oData.HCP_PARTNER
				}));

				oModelVisit.read("/View_Grouping_Suppliers", {

					filters: aFilters,

					success: function (result) {

						oModelYearly.setProperty("/partnerDesc", result.results[0].NAME1);

					}.bind(this),
					error: function () {

					}
				});

			}

		},

		_handlePartnerFilterPress: function () {
			var oFilterBar;
			if (!this.oPartnerFilter || this.oPartnerFilter.bIsDestroyed) {
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
			this.oPartnerFilter.open();
		},

		_onPartnerApplySearch: function (oEvent) {
			var oList = sap.ui.core.Fragment.byId("partnerFilterID" + this.getView().getId(), "partnerListID");
			var oFilterBar = sap.ui.core.Fragment.byId("partnerFilterID" + this.getView().getId(), "fbPartner");
			var oFilters = this._getPartnerFilters(oFilterBar);

			oList.getBinding("items").filter(oFilters);
		},

		onPartnerSelected: function (oEvent) {
			var oSource = oEvent.getSource();
			var oPartnerInput = sap.ui.core.Fragment.byId("newVisitFormFragmentID" + this.getView().getId(), "inputpartnerID");
			var oVisitModel = this.getView().getModel("editYearlyVisitModel");
			var oData = oVisitModel.getProperty("/");
			var SelectedPartner = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

			oData["HCP_PARTNER"] = SelectedPartner.HCP_REGISTER;
			oData["partnerDesc"] = SelectedPartner.NAME1;
			// oPartnerInput.setDescription(SelectedPartner.NAME1);
			this._validateForm();
			oVisitModel.refresh();
			this.oPartnerFilter.destroy();

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

		onPartnerDialogClose: function () {
			this.oPartnerFilter.close();
		},

		_onLeasedAreaFormSelect: function (oEvent) {

			var oModelYearly = this.getView().getModel("editYearlyVisitModel");
			var oInput = oEvent.getSource();
			var oPath = oEvent.getSource().getCustomData()[0].getValue();
			oModelYearly.setProperty(oPath + "/HCP_HECTARESAREA", null);

			if (oInput.getSelectedKey() === "1") {

				oModelYearly.setProperty(oPath + "/idHectaresArea", true);

			} else {

				oModelYearly.setProperty(oPath + "/idHectaresArea", false);

			}

			this._validateForm();

		},

		_validateFormSpecialCharacters: function (sErro) {

			setTimeout(function () {
				var oFilterModel = this.getView().getModel("editYearlyVisitModel");
				var aInputControls = this._getFormFields();
				var oControl;

				var emoJiRegex =
					/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					var oInputId = aInputControls[m].control.getMetadata();
					if (oInputId.getName() === "sap.m.TextArea" || oInputId.getName() === "sap.m.Input") {
						var bValid = emoJiRegex.test(oControl.getValue());

						if (bValid) {
							oControl.setValueState('Error');
							oControl.setValueStateText('Caractere inválido');
							oFilterModel.setProperty("/enableSave", false);
							sErro = "Error";
						} else {
							oControl.setValueState("None");
							oControl.setValueStateText("");
						}

					}
				}

			}.bind(this), 100);

			return sErro;

		},

		_validateForm: function (oProperty) {
			var oFilterModel = this.getView().getModel("editYearlyVisitModel");
			var aCultureType = oFilterModel.oData.cultureType;
			var oCheckNegotiation = false;
			
			if (typeof(oProperty) !== 'undefined'){
				let oValueInput = oProperty.getParameters().value;
				let oInputName = oProperty.getSource().getName();
				let oLastValue = oProperty.getSource()._lastValue;
				
				if (oValueInput === '' || oValueInput === "") {
					oFilterModel.setProperty("/enableSave", false);
					for (var k = 0; k < aCultureType.length; k++) {
						if(oInputName === 'HCP_PRODUCTIVITY' && oLastValue == aCultureType[k].HCP_PRODUCTIVITY){
							oFilterModel.setProperty("/cultureType/" + k + "/HCP_PRODUCTIVITY", '');
						}
						if(oInputName === 'HCP_HECTARE_PLANT_AREA' && oLastValue == aCultureType[k].HCP_HECTARE_PLANT_AREA){
							oFilterModel.setProperty("/cultureType/" + k + "/HCP_HECTARE_PLANT_AREA", '');
						}
					}
					return;
				}
			}

			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;
				var oLenght;
				var sErro;
				
				oFilterModel.setProperty("/edit", true);

				this._validateFormSpecialCharacters(sErro);

				if (!sErro) {

					for (var m = 0; m < aInputControls.length; m++) {
						oControl = aInputControls[m].control;
						if (aInputControls[m].required && oControl.getVisible()) {
							var oInputId = aInputControls[m].control.getMetadata();

							if (oInputId.getName() === "sap.m.Input" || oInputId.getName() ===
								"com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomSlider" ||
								oInputId.getName() === "sap.m.TextArea") {
								var sValue = oControl.getValue();
							} else if (oInputId.getName() === "sap.m.MultiComboBox") {
								sValue = oControl.getSelectedKeys();
							} else {
								sValue = oControl.getSelectedKey();
							}

							if (oInputId.getName() !== "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomSlider") {
								oLenght = sValue.length;
							} else {
								oLenght = sValue.toString();
							}

							if (sValue == "0") {
								oLenght = 0;
							}

							if (oLenght > 0) {
								if (oInputId.getName() !== "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomSlider") {
									if (oControl.getValueState() !== "Error") {
										oFilterModel.setProperty("/enableSave", true);
									} else {
										oFilterModel.setProperty("/enableSave", false);
										return;
									}
								} else {
									oFilterModel.setProperty("/enableSave", true);
								}

								for (var k = 0; k < aCultureType.length; k++) {
									if( aCultureType[k].status != "Deleted" ) {
										if (typeof(aCultureType[k].negotiationInputs) !== 'undefined'){
											for (var j = 0; j < aCultureType[k].negotiationInputs.length; j++) {
												if (aCultureType[k].negotiationInputs[j] != 'false' ) {
													oCheckNegotiation = true;
													}
												}
										}
							
										if ( (typeof(aCultureType[k].negotiationInputs) === 'undefined') || (oCheckNegotiation === false)
										|| (typeof(aCultureType[k].HCP_CULTURE_TYPE) === 'undefined') || (aCultureType[k].HCP_CULTURE_TYPE === '')		
										|| (typeof(aCultureType[k].HCP_HECTARE_PLANT_AREA) === 'undefined') || (aCultureType[k].HCP_HECTARE_PLANT_AREA === '')
										|| (typeof(aCultureType[k].HCP_PRODUCTIVITY) === 'undefined') || (aCultureType[k].HCP_PRODUCTIVITY === '')
										|| (typeof(aCultureType[k].HCP_SAFRA_YEAR) === 'undefined') || (aCultureType[k].HCP_SAFRA_YEAR === '')
										) {
											oFilterModel.setProperty("/enableSave", false);
											return;
										} else{
											oCheckNegotiation = false;
										}	
									}	
								}

							} else {
								oFilterModel.setProperty("/enableSave", false);
								return;
							}
						}
					}

				}

			}.bind(this), 100);
		},

		_getFormFields: function () {
			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var oUFPlantingFormFields = this.getDynamicFormFields(this.getView().byId("ufPlantingDataSimpleForm")) || [];
			var oCultureFormFields = this.getDynamicFormFields(this.getView().byId("newCultureSimpleForm")) || [];
			var aControls = [];
			var sControlType;

			var oAllFields = oMainDataForm.concat(oUFPlantingFormFields).concat(oCultureFormFields);

			for (var i = 0; i < oAllFields.length; i++) {
				sControlType = oAllFields[i].getMetadata().getName();
				if (sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" || sControlType === "sap.m.Input" ||
					sControlType === "sap.m.MultiComboBox" ||
					sControlType === "sap.m.ComboBox" || sControlType === "sap.m.TextArea" ||
					sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomSlider") {
					if (oAllFields[i].getEnabled()) {
						aControls.push({
							control: oAllFields[i],
							required: oAllFields[i - 1].getRequired && oAllFields[i - 1].getRequired(),
							text: oAllFields[i - 1].getText
						});
					}
				}
			}
			return aControls;
		},

		getDynamicFormFields: function (oForm) {
			var aFields;

			for (var content of oForm.getContent()) {
				if (content.getMetadata().getName() === "sap.m.VBox") {
					var oForm = content.getItems()[0];
					aFields = oForm.getContent();
				}
			}
			return aFields;
		},

		_validateInputCertification: function () {

			var oModelYearly = this.getView().getModel("editYearlyVisitModel");
			var oData = oModelYearly.oData;
			var oOthers = oData.HCP_OTHERS;

			oModelYearly.setProperty("/yesOthers", false);
			oModelYearly.setProperty("/HCP_OTHERS", null);

			for (var i = 0; i < oData.certifications.length; i++) {

				if (oData.certifications[i] === '11') {
					oModelYearly.setProperty("/yesOthers", true);
					oModelYearly.setProperty("/HCP_OTHERS", oOthers);
					this._validateForm();
					return;
				} else {
					oModelYearly.setProperty("/yesOthers", false);
					this._validateForm();
				}
			}

		},

		_onAddNewForm: function (oEvent) {
			var oButton = oEvent.getSource();
			var oFormId = oButton.getCustomData()[0].getValue();
			var oForm = this.getView().byId(oFormId);
			var oCharTemplate;
			var oText;

			if (oFormId === "newCultureSimpleForm") {
				oText = "Deseja adicionar um novo tipo de cultura?";
				oCharTemplate = this.buildCultureTypeTemplate();
			} else if (oFormId === "ufPlantingDataSimpleForm") {
				oText = "Deseja adicionar um novo UF Plantio?";
				oCharTemplate = this.buildUFTemplate();
			}

			MessageBox.information(

				oText, {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					onClose: function (sAction) {
						if (sAction === "YES") {
							oForm.addContent(new sap.m.Label({
								text: ""
							}));
							oForm.addContent(oCharTemplate);
							this._validateForm();
						}
					}.bind(this)
				}
			);
		},

		buildCultureTypeTemplate: function () {

			var oVisitFormModel = this.getView().getModel("editYearlyVisitModel");
			var oData = oVisitFormModel.oData;
			var sChars = oVisitFormModel.getProperty("/cultureType");
			var sCounter = oData.cultureType.length + 1;
			var aCustomData = [];
			let isEditable = false;
			var oEnableCancel = true;

			if (!sChars) {
				oVisitFormModel.setProperty("/cultureType", []);
			}

			var sCharLength = oVisitFormModel.getProperty("/cultureType").length;
			oVisitFormModel.setProperty("/cultureType/" + sCharLength, {});
			oVisitFormModel.setProperty("/cultureType/" + sCharLength + "/status", "New");

			if (sCharLength === 0) {
				oEnableCancel = false;
			}

			aCustomData.push(new sap.ui.core.CustomData({
				key: "sPath",
				value: "/cultureType/" + sCharLength
			}));

			aCustomData.push(new sap.ui.core.CustomData({
				key: "name",
				value: "cultureType"
			}));

			var oItemTemplateCultureType = new sap.ui.core.ListItem({
				key: "{MATNR}",
				text: "{= parseFloat(${MATNR}) } - {MAKTX}"
			});

			var oItemTemplateSafraYear = new sap.ui.core.ListItem({
				key: "{HCP_CROP_ID}",
				text: "{HCP_CROP_DESC}"
			});
			
			if (oData.hasPermissionToEditOldSafra !== undefined) {
				isEditable = oData.isEnable && oData.hasPermissionToEditOldSafra ? true : false;
			} else {
				isEditable = oData.isEnable
			}
			oVisitFormModel.setProperty("/hasPermissionToEditOldSafra", undefined)

			var oTemplate = new sap.m.VBox({
				fitContainer: true,
				justifyContent: "Center",
				backgroundDesign: "Solid",
				customData: aCustomData,
				items: [
					new sap.ui.layout.form.SimpleForm({
						columnsL: 1,
						columnsM: 1,
						columnsS: 1,
						columnsXL: 1,
						editable: "{editYearlyVisitModel>/isEnable}",
						emptySpanM: 3,
						emptySpanL: 3,
						emptySpanL: 3,
						emptySpanXL: 3,
						labelSpanM: 3,
						labelSpanL: 3,
						labelSpanXL: 3,
						singleContainerFullSize: false,
						adjustLabelSpan: false,
						backgroundDesign: "Solid",
						layout: 'ResponsiveLayout',
						title: ["Cultura " + sCounter, "H1"],
						content: [
							new sap.m.Label({
								text: "Tipo de Cultura",
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),
							new CustomComboBox({
								showSecondaryValues: true,
								selectedKey: "{editYearlyVisitModel>/cultureType/" + sCharLength + "/HCP_CULTURE_TYPE}",
								placeholder: "Selecione o Tipo de Cultura",
								name: "HCP_CULTURE_TYPE",
								editable: isEditable,
								enabled: "{editYearlyVisitModel>/isEnable}",
								visible: true,
								width: 'auto',
								maxWidth: '100%',
								selectionChange: this._validateCultureInput.bind(this),
								items: {
									path: '/View_Material',
									length: '999999',

									sorter: new sap.ui.model.Sorter({
										path: "MATNR",
										descending: false
									}),

									template: oItemTemplateCultureType
								}
							}),
							new sap.m.Label({
								text: "Ano Safra",
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),
							new CustomComboBox({
								showSecondaryValues: true,
								selectedKey: "{editYearlyVisitModel>/cultureType/" + sCharLength + "/HCP_SAFRA_YEAR}",
								placeholder: "Selecione Ano da Safra",
								name: "HCP_SAFRA_YEAR",
								editable: isEditable,
								enabled: "{editYearlyVisitModel>/isEnable}",
								visible: true,
								width: 'auto',
								maxWidth: '100%',
								selectionChange: this._validateCultureInput.bind(this),
								items: {
									path: '/Crop_Year',
									length: '999999',
									filters: new sap.ui.model.Filter({
										path: "HCP_ACTIVE",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: "1"
									}),
									template: oItemTemplateSafraYear
								}
							}),
							new sap.m.Label({
								text: "Área de Plantio (HA)",
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),

							new sap.m.Input({
								value: "{ path: 'editYearlyVisitModel>/cultureType/" + sCharLength +
									"/HCP_HECTARE_PLANT_AREA' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								editable: "{editYearlyVisitModel>/isEnable}",
								enabled: "{editYearlyVisitModel>/isEnable}",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true,
								name: "HCP_HECTARE_PLANT_AREA",
								placeholder: "Digite Àrea de Plantio em Hectares (Ex: 1.000)",
								liveChange: this._validateForm.bind(this),
								change: this._calculateProducTotal.bind(this)

							}),
							new sap.m.Label({
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true,
								text: "Produtividade média (T/HA)"
							}),
							new sap.m.Input({
								value: "{ path: 'editYearlyVisitModel>/cultureType/" + sCharLength +
									"/HCP_PRODUCTIVITY' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_PRODUCTIVITY",
								width: "100%",
								editable: "{editYearlyVisitModel>/isEnable}",
								enabled: "{editYearlyVisitModel>/isEnable}",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true,
								placeholder: "Digite Produt.Média (T/HA) (Ex 5,5)",
								liveChange: this._validateForm.bind(this),
								change: this._calculateProducTotal.bind(this)
							}),
							new sap.m.Label({
								design: "Standard",
								width: "100%",
								enabled: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true,
								text: "Produção Total"
							}),
							new sap.m.Input({
								value: "{ path: 'editYearlyVisitModel>/cultureType/" + sCharLength +
									"/HCP_PRODUCTIVITY_TOTAL' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_PRODUCTIVITY_TOTAL",
								width: "100%",
								enabled: false,
								editable: "{editYearlyVisitModel>/isEnable}",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),
							new sap.m.Label({
								text: "Quando é Feita a Negociação dos Insumos?",
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),
							new sap.m.MultiComboBox({
								showSecondaryValues: true,
								selectedKeys: "{editYearlyVisitModel>/cultureType/" + sCharLength + "/negotiationInputs}",
								placeholder: "Selecione Negociação dos Insumos",
								editable: "{editYearlyVisitModel>/isEnable}",
								enabled: "{editYearlyVisitModel>/isEnable}",
								visible: true,
								width: 'auto',
								maxWidth: '100%',
								selectionChange: this._validateForm.bind(this),
								items: [
									new sap.ui.core.Item({
										text: "Janeiro",
										enabled: true,
										key: "HCP_JANUARY"
									}),

									new sap.ui.core.Item({
										text: "Fevereiro",
										enabled: true,
										key: "HCP_FEBRUARY"
									}),

									new sap.ui.core.Item({
										text: "Março",
										enabled: true,
										key: "HCP_MARCH"
									}),

									new sap.ui.core.Item({
										text: "Abril",
										enabled: true,
										key: "HCP_APRIL"
									}),

									new sap.ui.core.Item({
										text: "Maio",
										enabled: true,
										key: "HCP_MAY"
									}),

									new sap.ui.core.Item({
										text: "Junho",
										enabled: true,
										key: "HCP_JUNE"
									}),

									new sap.ui.core.Item({
										text: "Julho",
										enabled: true,
										key: "HCP_JULY"
									}),
									new sap.ui.core.Item({
										text: "Agosto",
										enabled: true,
										key: "HCP_AUGUST"
									}),
									new sap.ui.core.Item({
										text: "Setembro",
										enabled: true,
										key: "HCP_SEPTEMBER"
									}),
									new sap.ui.core.Item({
										text: "Outubro",
										enabled: true,
										key: "HCP_OCTOBER"
									}),
									new sap.ui.core.Item({
										text: "Novembro",
										enabled: true,
										key: "HCP_NOVEMBER"
									}),
									new sap.ui.core.Item({
										text: "Dezembro",
										enabled: true,
										key: "HCP_DECEMBER"
									})
								]
							})
						]
					}).addStyleClass("addCulture")
				]
			});

			if (sCharLength !== 0) {
				oTemplate.getItems()[0].addContent(new sap.m.Toolbar({
					content: [
						new sap.m.ToolbarSpacer(),
						new sap.m.Button({
							icon: "sap-icon://sys-cancel",
							type: "Reject",
							width: "40%",
							text: "Excluir",
							enabled: isEditable,
							press: this.removeNewForm.bind(this)
						})
					]
				}));
			}

			return oTemplate;
		},

		_validateCultureInput: function (oProperty) {

			var oVisitModel = this.getView().getModel("editYearlyVisitModel");
			var oSource = oProperty.getSource();
			var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
			var oDataNewCulture = oVisitModel.getProperty(sPath);
			var oData = oVisitModel.oData;
			var oNumber = 0;

			for (var i = 0; i < oData.cultureType.length; i++) {

				if (oData.cultureType[i].status !== "Deleted" &&
					oDataNewCulture.HCP_CULTURE_TYPE === oData.cultureType[i].HCP_CULTURE_TYPE &&
					oDataNewCulture.HCP_SAFRA_YEAR === oData.cultureType[i].HCP_SAFRA_YEAR) {
					oNumber = oNumber + 1;
				}

			}

			if (oNumber > 1) {
				oSource.setValueState("Error");
				oSource.setValueStateText("Duplicidade de Material/Safra. Verificar!");
			} else {
				this.lookForDuplicities(oSource, oDataNewCulture, oNumber);
			}

			this._validateForm();

		},

		lookForDuplicities: function (oSource, oData, oNumber) {

			var oForm = this.getView().byId("newCultureSimpleForm");
			var oItems = oForm.getContent().filter(content => content.getMetadata().getName() === "sap.m.VBox");
			var sName = oSource.getName();

			var sLastValueCulture;
			var sLastValueSafra;
			var oValueCulture;
			var oValueSafra;

			if (sName === "HCP_CULTURE_TYPE") {
				sLastValueCulture = oSource._lastValue;
				sLastValueSafra = oData["HCP_SAFRA_YEAR"];
			} else {
				sLastValueSafra = oSource._lastValue;
				sLastValueCulture = oData["HCP_CULTURE_TYPE"];
			}

			if (oItems.length > 0) {
				for (var item of oItems) {
					var oFieldCulture = item.getItems()[0].getContent()[1];
					var oFieldSafra = item.getItems()[0].getContent()[3];

					if (sName === "HCP_CULTURE_TYPE") {
						oValueCulture = oFieldCulture.getValue();
						oValueSafra = oFieldSafra.getSelectedKey();
					} else {
						oValueCulture = oFieldCulture.getSelectedKey();
						oValueSafra = oFieldSafra.getValue();
					}

					if (oNumber > 1) {
						if (sLastValueCulture === oValueCulture &&
							sLastValueSafra === oValueSafra) {
							oFieldCulture.setValueState("None");
							oFieldCulture.setValueStateText("");
							oFieldSafra.setValueState("None");
							oFieldSafra.setValueStateText("");
						}
					} else {
						oFieldCulture.setValueState("None");
						oFieldCulture.setValueStateText("");
						oFieldSafra.setValueState("None");
						oFieldSafra.setValueStateText("");
					}

				}
			}
		},

		_calculateProducTotal: function (oProperty) {

			var oModelYearly = this.getView().getModel("editYearlyVisitModel");
			var oSource = oProperty.getSource();
			var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
			var oData = oModelYearly.getProperty(sPath);
			var sTotal;
			
			let oValueInput = oProperty.getParameters().value;
			let oInputName = oProperty.getSource().getName();
		
			if (oValueInput === '' || oValueInput === "") {
				oData[oInputName]  = " ";
			}

			this._valideInputNumber(oProperty);

			sTotal = oData.HCP_HECTARE_PLANT_AREA * oData.HCP_PRODUCTIVITY;
			oData["HCP_PRODUCTIVITY_TOTAL"] = sTotal;
			oModelYearly.refresh();

			this._validateForm(oProperty);

		},

		buildUFTemplate: function (oEvent) {

			var oVisitFormModel = this.getView().getModel("editYearlyVisitModel");
			var sChars = oVisitFormModel.getProperty("/ufPlanting");
			var aCustomData = [];
			var aCustomData2 = [];
			var oEnableCancel = true;

			if (!sChars) {
				oVisitFormModel.setProperty("/ufPlanting", []);
			}

			var sCharLength = oVisitFormModel.getProperty("/ufPlanting").length;
			oVisitFormModel.setProperty("/ufPlanting/" + sCharLength, {});
			oVisitFormModel.setProperty("/ufPlanting/" + sCharLength + "/status", "New");

			if (sCharLength === 0) {
				oEnableCancel = false;
			}

			aCustomData.push(new sap.ui.core.CustomData({
				key: "sPath",
				value: "/ufPlanting/" + sCharLength
			}));

			aCustomData.push(new sap.ui.core.CustomData({
				key: "name",
				value: "ufPlanting"
			}));

			aCustomData2.push(new sap.ui.core.CustomData({
				key: "sPath",
				value: "/ufPlanting/" + sCharLength
			}));

			var oItemTemplateufPlanting = new sap.ui.core.ListItem({
				key: "{BLAND}",
				text: "{BLAND} - {BEZEI}"
			});

			var oTemplate = new sap.m.VBox({
				fitContainer: true,
				justifyContent: "Center",
				backgroundDesign: "Transparent",
				customData: aCustomData,
				items: [
					new sap.ui.layout.form.SimpleForm({
						columnsL: 1,
						columnsM: 1,
						columnsS: 1,
						columnsXL: 1,
						editable: "{editYearlyVisitModel>/isEnable}",
						emptySpanM: 0,
						emptySpanL: 0,
						emptySpanL: 0,
						emptySpanXL: 0,
						labelSpanM: 3,
						labelSpanL: 3,
						labelSpanXL: 3,
						singleContainerFullSize: false,
						adjustLabelSpan: false,
						layout: "ResponsiveGridLayout",
						content: [
							new sap.m.Label({
								text: "UF Plantio",
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),
							new CustomComboBox({
								showSecondaryValues: true,
								selectedKey: "{editYearlyVisitModel>/ufPlanting/" + sCharLength + "/HCP_UF_PLANTING}",
								placeholder: "Selecione UF Plantio",
								editable: "{editYearlyVisitModel>/isEnable}",
								enabled: "{editYearlyVisitModel>/isEnable}",
								visible: true,
								width: "100%",
								maxWidth: '100%',
								selectionChange: this._validateForm.bind(this),
								items: {
									path: '/View_States',
									length: '999999',

									sorter: new sap.ui.model.Sorter({
										path: "BLAND",
										descending: false
									}),

									filters: new sap.ui.model.Filter({
										path: "LAND1",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: "BR"
									}),

									template: oItemTemplateufPlanting
								}
							}),
							new sap.m.Label({
								text: "Área Arrendada?",
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),
							new sap.m.SegmentedButton({
								width: "auto",
								selectedKey: "{editYearlyVisitModel>/ufPlanting/" + sCharLength + "/HCP_LEASED_AREA}",
								editable: "{editYearlyVisitModel>/isEnable}",
								enabled: "{editYearlyVisitModel>/isEnable}",
								selectionChange: this._onLeasedAreaFormSelect.bind(this),
								items: [
									new sap.m.SegmentedButtonItem({
										text: "Sim",
										enabled: true,
										key: "1"
									}),

									new sap.m.SegmentedButtonItem({
										text: "Não",
										enabled: true,
										key: "0"
									})

								],
								customData: aCustomData2
							}),
							new sap.m.Label({
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true,
								text: "Área Arrendada(HA)"
							}),
							new sap.m.Input({
								value: "{ path: 'editYearlyVisitModel>/ufPlanting/" + sCharLength +
									"/HCP_HECTARESAREA' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_HECTARESAREA",
								width: "100%",
								required: "{editYearlyVisitModel>/ufPlanting/" + sCharLength + "/idHectaresArea}",
								editable: "{editYearlyVisitModel>/isEnable}",
								enabled: "{editYearlyVisitModel>/isEnable}",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{editYearlyVisitModel>/ufPlanting/" + sCharLength + "/idHectaresArea}",
								placeholder: "Digite a Área em Hectares (Ex: 1.000)",
								// liveChange: this._valideInputNumber.bind(this),
								change: this._valideInputNumber.bind(this)
							})
						]
					})
				]
			});

			if (sCharLength !== 0) {
				oTemplate.getItems()[0].addContent(new sap.m.Toolbar({
					content: [
						new sap.m.ToolbarSpacer(),
						new sap.m.Button({
							icon: "sap-icon://sys-cancel",
							type: "Reject",
							width: "40%",
							text: "Excluir",
							press: this.removeNewForm.bind(this)
						})
					]
				}));
			}
			return oTemplate;

		},

		_valideInputNumber: function (oProperty) {

			var oModelYearly = this.getView().getModel("editYearlyVisitModel");
			var oSource = oProperty.getSource();
			var sName = oSource.getName();
			var oData;
			var sValue;
			if (sName !== "HCP_CAPACITY" && sName !== "HCP_SILO_VOLUME") {
				var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
				oData = oModelYearly.getProperty(sPath);
			} else {
				oData = oModelYearly.oData;
			}

			sValue = oProperty.mParameters.newValue;
			sValue = sValue.replace(/[^0-9,]/g, "");

			oSource.setValue(sValue);

			this._validateForm(oProperty);
		},
		removeNewForm: function (oEvent) {
			var oVisitModel = this.getView().getModel("editYearlyVisitModel");
			var oVBox = oEvent.getSource().getParent().getParent().getParent().getParent().getParent();
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var sMessage = oVBox.getCustomData()[1].getValue() === "ufPlanting" ? "Tem certeza que deseja remover o Plantio?" :
				"Tem certeza que deseja remover a Cultura?";

			MessageBox.warning(
				sMessage, {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						if (sAction === "YES") {
							if (oVBox) {
								var sPath = oVBox.getCustomData()[0].getValue();
								var oData = oVisitModel.getProperty(sPath);
								var oNewModel = this.getView().getModel("editYearlyVisitModel");
								var oVisitData = oNewModel.oData;

								oData.status = "Deleted";
								oVBox.destroy();
								this._validateForm();
							}
						}
					}.bind(this)
				}
			);

			this._validateForm();

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

		navBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oVisitModel = this.getView().getModel("editYearlyVisitModel");

			oVisitModel.setProperty("/", []);

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}

		},

		backToIndex: function () {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("visitForm.Index", true);
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

		generateUniqueKey: function () {
			return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
				(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
			);
		},

		onCancelPress: function () {
			var oVisitModel = this.getView().getModel("editYearlyVisitModel");
			var oData = oVisitModel.oData;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			if (oData.edit) {
				MessageBox.warning(
					"Tem certeza que deseja voltar? As informações cadastradas não serão salvas!", {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {
								oVisitModel.setProperty("/", []);
								this.navBack();
							}
						}.bind(this)
					}
				);
			} else {
				this.navBack();
			}

		},

		onSavePress: function (oEvent) {

			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var aDeferredGroups = oModel.getDeferredGroups();
			var oEditModel = this.getView().getModel("editYearlyVisitModel");
			var oData = oEditModel.oData;
			var oGroupRemoves;
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			// sap.m.MessageBox.show(
			// 	"Lista de Acompanhamento alterada. Deseja Salvar?", {
			// 		icon: sap.m.MessageBox.Icon.INFORMATION,
			// 		actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
			// 		onClose: function (oAction) {
			// 			if (oAction === "YES") {

			// if (aDeferredGroups.indexOf("changes") < 0) {
			// 	aDeferredGroups.push("changes");
			// 	oModel.setDeferredGroups(aDeferredGroups);
			// }

			this.setBusyDialog("Ficha de Visita", "Salvando");
			this.searchValuesStorageType(oModel, true).then(function () {
				this.searchValuesCertifications(oModel, true).then(function () {
					oGroupRemoves = oData.groupRemoves;

					if (oGroupRemoves) {
						oModel.submitChanges({
							groupId: "removes",
							success: function () {
								// if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
								// 	this.flushStore().then(function () {
								// 		this.refreshStore("Visit_Storage_Type", "Visit_Yearly_Certifications").then(function () {
								// 			this.onSubmitChanges();
								// 		}.bind(this));
								// 	}.bind(this));
								// }
								this.onSubmitChanges();
							}.bind(this),
							error: function () {
								var teste = 1;
							}.bind(this)
						});
					} else {
						this.onSubmitChanges();
					}

				}.bind(this)).catch(function (error) {
					console.log(error);
				}.bind(this));
			}.bind(this)).catch(function () {
				console.log(error);
			}.bind(this));
			// 			}
			// 		}.bind(this)
			// 	}
			// );

		},

		onSubmitChanges: async function () {

			var aUserName = this.userName;
			var sCounter = 0;
			var sTimestamp = new Date().getTime() + sCounter;
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var aDeferredGroups = oModel.getDeferredGroups();
			var oEditModel = this.getView().getModel("editYearlyVisitModel");
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var oData = oEditModel.oData;
			var sPath;
			let nameFound;

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}
			
			if (oData?.NAME_LIFNR) {
				nameFound = oData.NAME_LIFNR;
			}else if (oData?.NAME_LIFNR_BR) {
				nameFound = oData.NAME_LIFNR_BR;
			}else if (oData?.NAME_LIFNR_EXT) {
				nameFound = oData.NAME_LIFNR_EXT;
			}else if (oData?.HCP_NAME_REGISTERED) {
				nameFound = oData.HCP_NAME_REGISTERED;
			}else if (oData?.NAME_PROSPECT) {
				nameFound = oData.NAME_PROSPECT;
			}	

			var aData = {
				HCP_PROVIDER_ID: oData.HCP_PROVIDER_ID,
				HCP_CONTACT_TYPE: oData.HCP_CONTACT_TYPE,
				HCP_CONTACT_INICIATIVE: oData.HCP_CONTACT_INICIATIVE,
				HCP_VISIT_FORM: oData.HCP_VISIT_FORM,
				HCP_UNIQUE_KEY: oData.HCP_UNIQUE_KEY,
				HCP_PERIOD: oData.HCP_PERIOD,
				HCP_STORAGE_STRUCTURE: parseInt(oData.HCP_STORAGE_STRUCTURE),
				HCP_CAPACITY: oData.HCP_CAPACITY !== null ? parseFloat(oData.HCP_CAPACITY).toFixed(2) : "0",	
				HCP_BARTER_EXCHANGE: oData.HCP_BARTER_EXCHANGE,
				HCP_AMOUNT: oData.HCP_AMOUNT,
				HCP_PARTNER_BRF_SUP: oData.HCP_PARTNER_BRF_SUP,
				HCP_PARTNER: oData.HCP_PARTNER,
				HCP_UPDATED_BY: aUserName,
				HCP_UPDATED_AT: new Date(),
				HCP_SILOS_BAG: oData.HCP_SILOS_BAG,
				HCP_SILO_VOLUME: oData.HCP_SILO_VOLUME !== null ? oData.HCP_SILO_VOLUME.toString() : null,
				HCP_NAME_REGISTERED: nameFound
			};  

			if (this.period === oData.HCP_PERIOD) {

				sPath = this.buildEntityPath("Visit_Form_Yearly", oData);

				oModel.update(sPath, aData, {
					groupId: "changes"
				});

			} else {

				sCounter = sCounter + 1;

				aData.HCP_VISIT_ID = sTimestamp.toFixed();
				aData.HCP_PERIOD = this.period;
				aData.HCP_CREATED_BY = aUserName;
				aData.HCP_UPDATED_BY = aUserName;
				aData.HCP_CREATED_AT = new Date();
				aData.HCP_UPDATED_AT = new Date();

				oModel.createEntry("/Visit_Form_Yearly", {
					properties: aData
				}, {
					groupId: "changes"
				});

			}

			// UF Plantio
			for (var i = 0; i < oData.ufPlanting.length; i++) {
				var ufPlantingKey = new Date().getTime() + sCounter;
				sCounter = sCounter + 1;

				var aDataUfPlanting = {
					HCP_PROVIDER_ID: oData.HCP_PROVIDER_ID,
					HCP_CONTACT_TYPE: oData.HCP_CONTACT_TYPE,
					HCP_CONTACT_INICIATIVE: oData.HCP_CONTACT_INICIATIVE,
					HCP_VISIT_FORM: oData.HCP_VISIT_FORM,
					HCP_UNIQUE_KEY: oData.HCP_UNIQUE_KEY,
					HCP_PERIOD: oData.HCP_PERIOD,
					HCP_UF_PLANTING: oData.ufPlanting[i].HCP_UF_PLANTING,
					HCP_LEASED_AREA: oData.ufPlanting[i].HCP_LEASED_AREA,
					HCP_HECTARESAREA: oData.ufPlanting[i].HCP_HECTARESAREA !== null ? parseFloat(oData.ufPlanting[i].HCP_HECTARESAREA).toFixed(2) : "0",
					HCP_UPDATED_BY: aUserName,
					HCP_UPDATED_AT: new Date()
				};

				if (aDataUfPlanting.HCP_LEASED_AREA === undefined) {
					aDataUfPlanting.HCP_LEASED_AREA = 1;
				}

				if (this.period === oData.HCP_PERIOD) {

					sPath = this.buildEntityPath("Visit_Uf_Planting", oData.ufPlanting[i]);

					if (oData.ufPlanting[i].status === "New") {
						aDataUfPlanting["HCP_VISIT_ID"] = ufPlantingKey.toFixed();

						oModel.createEntry("/Visit_Uf_Planting", {
							properties: aDataUfPlanting
						}, {
							groupId: "changes"
						});

					} else if (oData.ufPlanting[i].status === "Edit") {
						oModel.update(sPath, aDataUfPlanting, {
							groupId: "changes"
						});

					} else if (oData.ufPlanting[i].status === "Deleted") {

						oModel.remove(sPath, {
							groupId: "changes"
						});

					}

				} else if (oData.ufPlanting[i].status !== "Deleted") {

					aDataUfPlanting.HCP_VISIT_ID = ufPlantingKey.toFixed();
					aDataUfPlanting.HCP_PERIOD = this.period;
					aDataUfPlanting.HCP_CREATED_BY = aUserName;
					aDataUfPlanting.HCP_UPDATED_BY = aUserName;
					aDataUfPlanting.HCP_CREATED_AT = new Date();
					aDataUfPlanting.HCP_UPDATED_AT = new Date();

					oModel.createEntry("/Visit_Uf_Planting", {
						properties: aDataUfPlanting
					}, {
						groupId: "changes"
					});

				}

			}

			//Tipo de Cultura
			for (var i = 0; i < oData.cultureType.length; i++) {
				var sCultureKey = new Date().getTime() + sCounter;
				sCounter = sCounter + 1;

				var aDataCultureType = {
					HCP_PROVIDER_ID: oData.HCP_PROVIDER_ID,
					HCP_CONTACT_TYPE: oData.HCP_CONTACT_TYPE,
					HCP_CONTACT_INICIATIVE: oData.HCP_CONTACT_INICIATIVE,
					HCP_VISIT_FORM: oData.HCP_VISIT_FORM,
					HCP_UNIQUE_KEY: oData.HCP_UNIQUE_KEY,
					HCP_PERIOD: oData.HCP_PERIOD,
					HCP_VISIT_TYPE: "Yearly",
					HCP_CULTURE_TYPE: oData.cultureType[i].HCP_CULTURE_TYPE,
					HCP_SAFRA_YEAR: oData.cultureType[i].HCP_SAFRA_YEAR,
					HCP_HECTARE_PLANT_AREA: parseFloat(oData.cultureType[i].HCP_HECTARE_PLANT_AREA).toFixed(2),
					HCP_PRODUCTIVITY: parseFloat(oData.cultureType[i].HCP_PRODUCTIVITY).toFixed(2),
					HCP_PRODUCTIVITY_TOTAL: parseFloat(oData.cultureType[i].HCP_PRODUCTIVITY_TOTAL).toFixed(2),
					HCP_JANUARY: "0",
					HCP_FEBRUARY: "0",
					HCP_MARCH: "0",
					HCP_APRIL: "0",
					HCP_MAY: "0",
					HCP_JUNE: "0",
					HCP_JULY: "0",
					HCP_AUGUST: "0",
					HCP_SEPTEMBER: "0",
					HCP_OCTOBER: "0",
					HCP_NOVEMBER: "0",
					HCP_DECEMBER: "0",
					HCP_UPDATED_BY: aUserName,
					HCP_UPDATED_AT: new Date()
				};

				if (typeof(oData.cultureType[i].negotiationInputs) !== 'undefined'){

					for (var input of oData.cultureType[i].negotiationInputs) {
						if (input != false && input != "false") {
							aDataCultureType[input] = "1";
						}
					}
	
					if (this.period === oData.HCP_PERIOD) {
	
						// sPath = "/Visit_Culture_Type(" + oData.cultureType[i].HCP_VISIT_ID + "l)";
						sPath = this.buildEntityPath("Visit_Culture_Type", oData.cultureType[i]);
	
						if (oData.cultureType[i].status === "New") {
							aDataCultureType["HCP_VISIT_ID"] = sCultureKey.toFixed();
	
							oModel.createEntry("/Visit_Culture_Type", {
								properties: aDataCultureType
							}, {
								groupId: "changes"
							});
	
						} else if (oData.cultureType[i].status === "Edit") {
	
							oModel.update(sPath, aDataCultureType, {
								groupId: "changes"
							});
	
						} else if ((oData.cultureType[i].status === "Deleted") && (sPath.includes('undefinedl') !== true)) {
	
							oModel.remove(sPath, {
								groupId: "changes"
							});
	
						}
	
					} else if (oData.cultureType[i].status !== "Deleted") {
	
						aDataCultureType.HCP_VISIT_ID = sCultureKey.toFixed();
						aDataCultureType.HCP_PERIOD = this.period;
						aDataCultureType.HCP_CREATED_BY = aUserName;
						aDataCultureType.HCP_UPDATED_BY = aUserName;
						aDataCultureType.HCP_CREATED_AT = new Date();
						aDataCultureType.HCP_UPDATED_AT = new Date();
	
						oModel.createEntry("/Visit_Culture_Type", {
							properties: aDataCultureType
						}, {
							groupId: "changes"
						});
					}
				}
			}

			//Tipo de Armazenagem
			for (var i = 0; i < oData.negotiationInputs.length; i++) {
				var sNegotiationKey = new Date().getTime() + sCounter;
				sCounter = sCounter + 1;

				var aDataNegotiationInput = {
					HCP_VISIT_ID: sNegotiationKey.toFixed(),
					HCP_PROVIDER_ID: oData.HCP_PROVIDER_ID,
					HCP_CONTACT_TYPE: oData.HCP_CONTACT_TYPE,
					HCP_CONTACT_INICIATIVE: oData.HCP_CONTACT_INICIATIVE,
					HCP_VISIT_FORM: oData.HCP_VISIT_FORM,
					HCP_VISIT_TYPE: "Yearly",
					HCP_UNIQUE_KEY: oData.HCP_UNIQUE_KEY,
					HCP_PERIOD: oData.HCP_PERIOD,
					HCP_STORAGE_STRUCTURE: oData.negotiationInputs[i],
					HCP_UPDATED_BY: aUserName,
					HCP_UPDATED_AT: new Date()
				};

				if (this.period !== oData.HCP_PERIOD) {

					aDataNegotiationInput.HCP_VISIT_ID = sNegotiationKey.toFixed();
					aDataNegotiationInput.HCP_PERIOD = this.period;
					aDataNegotiationInput.HCP_CREATED_BY = aUserName;
					aDataNegotiationInput.HCP_UPDATED_BY = aUserName;
					aDataNegotiationInput.HCP_CREATED_AT = new Date();
					aDataNegotiationInput.HCP_UPDATED_AT = new Date();

				}

				oModel.createEntry("/Visit_Storage_Type", {
					properties: aDataNegotiationInput
				}, {
					groupId: "changes"
				});
			}

			//Certificações
			for (var i = 0; i < oData.certifications.length; i++) {
				var sCertificationKey = new Date().getTime() + sCounter;
				sCounter = sCounter + 1;

				var aDataCertificationsInput = {
					HCP_VISIT_ID: sCertificationKey.toFixed(),
					HCP_PROVIDER_ID: oData.HCP_PROVIDER_ID,
					HCP_CONTACT_TYPE: oData.HCP_CONTACT_TYPE,
					HCP_CONTACT_INICIATIVE: oData.HCP_CONTACT_INICIATIVE,
					HCP_VISIT_FORM: oData.HCP_VISIT_FORM,
					HCP_VISIT_TYPE: "Yearly",
					HCP_UNIQUE_KEY: oData.HCP_UNIQUE_KEY,
					HCP_PERIOD: oData.HCP_PERIOD,
					HCP_CERTIFICATION: oData.certifications[i],
					HCP_OTHERS: oData.certifications[i] === "11" ? oData.HCP_OTHERS : null,
					HCP_CREATED_AT: new Date(),
					HCP_CREATED_BY: aUserName,
					HCP_UPDATED_BY: aUserName,
					HCP_UPDATED_AT: new Date()
				};

				if (this.period !== oData.HCP_PERIOD) {

					aDataCertificationsInput.HCP_PERIOD = this.period;
					aDataCertificationsInput.HCP_CREATED_BY = aUserName;
					aDataCertificationsInput.HCP_UPDATED_BY = aUserName;
					aDataCertificationsInput.HCP_CREATED_AT = new Date();
					aDataCertificationsInput.HCP_UPDATED_AT = new Date();

				}

				oModel.createEntry("/Visit_Form_Certifications", {
					properties: aDataCertificationsInput
				}, {
					groupId: "changes"
				});
			}

			oModel.submitChanges({
				groupId: "changes",
				success: async function (data) {
					if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
						//this.flushStore("Visit_Form_Certifications,Visit_Storage_Type,Visit_Form_Yearly,Visit_Culture_Type,Visit_Uf_Planting").then(
						//		function () {
						//		this.refreshStore("Visit_Form_Certifications", "Visit_Storage_Type", "Visit_Form_Yearly",
						//			"Visit_Culture_Type", "Visit_Uf_Planting").then(function () {
						this.closeBusyDialog();
						if(this.validateSubmiteChange(data))
							this.updateSimplifyContact(this.getView().getModel("editYearlyVisitModel").oData.HCP_PROVIDER_ID, this.getView().getModel("editYearlyVisitModel").oData.HCP_NAME_REGISTERED);
						if(await this.prepareEqualize(this.getView().getModel("editYearlyVisitModel").oData, 'Yearly')){
							MessageBox.success(
								"Ficha de visita modificada com sucesso!\n\nAtualizações replicadas na Ficha Periodica.", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
										this.backToIndex();
									}.bind(this)
								}
							);	
						}
						else{
							MessageBox.success(
								"Ficha de visita modificada com sucesso!", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
										this.backToIndex();
									}.bind(this)
								}
							);
						}
						//	}.bind(this));
						//	}.bind(this));
					} else {
						if(this.validateSubmiteChange(data))
							this.updateSimplifyContact(this.getView().getModel("editYearlyVisitModel").oData.HCP_PROVIDER_ID, this.getView().getModel("editYearlyVisitModel").oData.HCP_NAME_REGISTERED);
						if(await this.prepareEqualize(this.getView().getModel("editYearlyVisitModel").oData, 'Yearly')){
							MessageBox.success(
								"Ficha de visita modificada com sucesso!\n\nAtualizações replicadas na Ficha Periodica.", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
										this.backToIndex();
									}.bind(this)
								}
							);	
						}
						else{
							MessageBox.success(
								"Ficha de visita modificada com sucesso!", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
										this.backToIndex();
									}.bind(this)
								}
							);
						}
					}
				}.bind(this),
				error: function () {
					MessageBox.success(
						"Erro ao cadastrar ficha de visita!", {
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (sAction) {
								this.closeBusyDialog();
							}.bind(this)
						}
					);
				}.bind(this)
			});

		},

		buildEntityPath: function (sEntityName, oEntity) {
			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity.HCP_VISIT_ID + "l)";
			}
		}

	});

}, /* bExport= */ true);