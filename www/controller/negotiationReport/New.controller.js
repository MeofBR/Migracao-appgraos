sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.negotiation.New", {
		formatter: formatter,
		onInit: function () {

			this._createYear();
			this._createMonth();
			this.setBusyDialog("Relato de Negociação da Região", "Carregando dados, por favor aguarde");
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.userName = this.getOwnerComponent().userName;
			this.oRouter.getTarget("negotiationReport.New").attachDisplay(this.handleRouteMatched, this);

			var oModel = this.getOwnerComponent().getModel();
			oModel.attachRequestCompleted(function () {
				var oFilterPageModel = this.getView().getModel("newNegotiationReportModel");
				var isLoad = oFilterPageModel.getProperty("/isLoad");
				if (!isLoad) {
					oFilterPageModel.setProperty("/isLoad", true);
					this.closeBusyDialog();
				}
			}.bind(this));

		},

		handleRouteMatched: function (oEvent) {

			this.getUser().then(function (userName) {
				this.userName = userName;

				this.getUserProfile("View_Profile_Negotiation_Report", this.userName).then(profileData => {
					this.getView().getModel("profileModel").setData(profileData);
					console.log(this.getView().getModel("profileModel").getData());
					//this.closeBusyDialog();
				}).catch(error => {
					console.log(error);
					//this.closeBusyDialog();
				});
				//this.verifyAccountGroup();
			}.bind(this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableCreate: false,
				HCP_INCOTERMS: 1,
				HCP_PAYMENT_TERM: 0,
				HCP_MODALITY: 0,
				enableCounty: false,
				enableCountyDestination: false,
				requiredDeposit: false,
				requiredPrice: true,
				HCP_PRICE_LIST: 0,
				HCP_PRICE_CALCULATED: 0,
				HCP_PRICE_DIFF: 0,
				HCP_VALUE_FREIGHT: null,
				HCP_CURRENCY: "BRL",
				HCP_PARTNER_BRF_SUP: 1,
				HCP_BUYER_BRF_SUP: 1,
				HCP_UNIT_MEASURE: "SC",
				yesPartner: true,
				noPartner: false,
				enablePartner: true,
				yesBuyer: true,
				noBuyer: false,
				enableModality: false,
				enableModalityDesc: false,
				yesProspect: false,
				yesBuyerProspect: false,
				HCP_TYPE_PERSON: 'Fornecedor',
				HCP_TYPE_BUYER_PERSON: 'Comprador',
				priceListStatus: 'Information',
				noPriceBRF: false,
				isLoad: false,
				enableFreight: false,
				enableDaysQuantity: true,
				HCP_PRICE: 0
			}), "newNegotiationReportModel");

			var oFilterModel = this.getView().getModel("newNegotiationReportModel");

			if (oEvent.getParameter("data")) {

				this.branch = oEvent.getParameter("data").branch === 'undefined' || oEvent.getParameter("data").branch === 'null' ? '' :
					decodeURIComponent(oEvent.getParameter("data").branch);
				this.regio = oEvent.getParameter("data").regio === 'undefined' || oEvent.getParameter("data").regio === 'null' ? '' :
					decodeURIComponent(oEvent.getParameter("data").regio);
				this.cropYear = decodeURIComponent(oEvent.getParameter("data").cropYear);
				this.matnr = decodeURIComponent(oEvent.getParameter("data").matnr);
				this.state = decodeURIComponent(oEvent.getParameter("data").state);
				this.material_type = decodeURIComponent(oEvent.getParameter("data").material_type);

				if (oEvent.getParameter("data").cancel_offer_map_id > 0) {
					this.cancel_offer_map_id = decodeURIComponent(oEvent.getParameter("data").cancel_offer_map_id);

					oFilterModel.setProperty("/hasOfferMapID", true);
					oFilterModel.setProperty("/HCP_CANCEL_OFFER_MAP_ID", this.cancel_offer_map_id);

					this._fieldsOfferMap();

				} else {
					oFilterModel.setProperty("/hasOfferMapID", false);
				}

				oFilterModel.setProperty("/HCP_STATE", this.state);
				oFilterModel.setProperty("/HCP_MATERIAL", this.matnr);
				oFilterModel.setProperty("/HCP_CROP", this.cropYear);
				oFilterModel.setProperty("/HCP_MATERIAL_TYPE", this.material_type);
				oFilterModel.setProperty("/HCP_BUYER_GROUP", this.branch);
				this.freteDigitado = null;

				if (this.regio) {
					oFilterModel.setProperty("/HCP_REGIO", this.regio);
				} else {
					oFilterModel.setProperty("/hasRegio", false);
				}
				if (this.branch) {
					oFilterModel.setProperty("/HCP_BRANCH", this.branch);
				} else {
					oFilterModel.setProperty("/hasBranch", false);
				}

				var oTable = this.getView().byId("county"); 
				var oFilters = [];

				oFilters.push(new sap.ui.model.Filter("TAXJURCODE", sap.ui.model.FilterOperator.Contains, this.state));
				oTable.getBinding("items").filter(oFilters);

			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("negotiationReport.Filter", true);
			}

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				create: true,
				edit: true
			}), "profileModel");

		},

		_searchPartnerName: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var oEditModel = this.getView().getModel("newNegotiationReportModel");
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_REGISTER',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oEditModel.oData.HCP_PARTNER_BRF_SUP
				}));

				oModel.read("/View_Grouping_Suppliers", {

					filters: aFilters,

					success: function (result) {

						if (result.results.length > 0) {
							oEditModel.setProperty("/HCP_SUPPLIER_DESC", result.results[0].NAME1);
						}

						resolve(result.results[0]);

					}.bind(this),
					error: function () {
						reject(error);
					}
				});

			}.bind(this));

		},

		_fieldsOfferMap: function () {

			var oOwnerModel = this.getView().getModel("newNegotiationReportModel");
			var oModel = this.getOwnerComponent().getModel();
			var aFiltersOfferMap = [];
			var aFiltersOfferMapWerks = [];

			aFiltersOfferMap.push(new sap.ui.model.Filter({
				path: 'HCP_OFFER_ID',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.cancel_offer_map_id
			}));

			oModel.read("/Offer_Map", {
				filters: aFiltersOfferMap,
				success: function (result) {
					var aResults = result.results;
					if (aResults.length > 0) {

						oOwnerModel.setProperty("/HCP_TYPE_PERSON", (aResults[0].HCP_PARTNER_TYPE).toString());
						oOwnerModel.setProperty("/HCP_PARTNER_BRF_SUP", (aResults[0].HCP_PARTNER).toString());
						oOwnerModel.setProperty("/HCP_TONNAGE", (aResults[0].HCP_VOLUME).toString());
						oOwnerModel.setProperty("/HCP_MODALITY", (aResults[0].HCP_MODALITY).toString());
						oOwnerModel.setProperty("/HCP_PLAYERS_ID", (aResults[0].HCP_PLAYERS).toString());
						oOwnerModel.setProperty("/HCP_INCOTERMS", (aResults[0].HCP_INCOTERM).toString());
						oOwnerModel.setProperty("/HCP_UNIT_MEASURE", (aResults[0].HCP_UM).toString());
						oOwnerModel.setProperty("/HCP_CURRENCY", (aResults[0].HCP_MOEDA).toString());
						oOwnerModel.setProperty("/HCP_SUPPLIER", aResults[0].HCP_PARTNER);
						this._searchPartnerName();

						let month = String((aResults[0].HCP_DATE_END).getMonth()).padStart(2, '0');
						oOwnerModel.setProperty("/HCP_MONTH", month);
						oOwnerModel.setProperty("/HCP_YEAR", (aResults[0].HCP_DATE_END).getFullYear().toString());

						aFiltersOfferMapWerks.push(new sap.ui.model.Filter({
							path: 'HCP_UNIQUE_KEY',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: aResults[0].HCP_UNIQUE_KEY
						}));

						oModel.read("/Offer_Map_Werks", {
							filters: aFiltersOfferMapWerks,
							success: function (resultWerks) {
								var aResultsWerks = resultWerks.results;
								if (aResultsWerks.length > 0) {

									oOwnerModel.setProperty("/HCP_CENTER", (aResultsWerks[0].HCP_WERKS).toString());

									if (aResults[0].HCP_INCOTERM == '2') {
										oOwnerModel.setProperty("/HCP_PRICE", parseFloat(aResultsWerks[0].HCP_PRICE_FOB).toFixed(2));
									} else {
										oOwnerModel.setProperty("/HCP_PRICE", parseFloat(aResultsWerks[0].HCP_PRICE_OFFER).toFixed(2));
									}
								}
							}.bind(this),
							error: function (error) {
								console.log(error);
							}
						});

					}
				}.bind(this),
				error: function (error) {
					console.log(error);
				}
			});

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

		_validateForm: function (oEvent) {
			//	var oFilterModel = this.getView().getModel("newNegotiationReportModel");
			//	var HCP_PRICE_LIST = oFilterModel.getProperty("/HCP_PRICE_LIST");
			var fieldName = '';

			if (oEvent) {
				fieldName = oEvent.getSource().getName();
			}

			if (fieldName === 'TABLE_PRICE') {
				this.updateTablePrice();
			} else if (fieldName === 'FIELD_CALC_COMBO') {
				this._validateFinalPrice(oEvent, true);
			} else if (fieldName === 'FIELD_CALC') {
				this._validateFinalPrice(oEvent, false);
			}

			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;
				var oCreateModel = this.getView().getModel("newNegotiationReportModel");

				oCreateModel.setProperty("/enableCreate", true);

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required) {
						var sValue = oControl.getValue();
						if (!sValue || oControl.getValueState() !== 'None') {
							oCreateModel.setProperty("/enableCreate", false);
							return;
						}
					}
				}
				oCreateModel.setProperty("/enableCreate", true);
				if (fieldName === 'TABLE_PRICE') {
					this.updateTablePrice();
				}

			}.bind(this), 100);

			//	

		},

		_getFormFields: function () {
			var oMainDataForm = this.byId("negociationReportCreateFormID").getContent();
			var aControls = [];
			var sControlType;

			for (var i = 0; i < oMainDataForm.length; i++) {
				sControlType = oMainDataForm[i].getMetadata().getName();
				if (sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" || sControlType === "sap.m.Input" ||
					sControlType === "sap.m.DateTimeInput" || sControlType === "sap.m.DatePicker" ||
					sControlType === "sap.m.CheckBox" || sControlType === "sap.m.MaskInput" || sControlType === "sap.m.ComboBox") {
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

		_calculateCommercializationMaterial: async function (oProperties) {
			var oModel = this.getOwnerComponent().getModel();
			var aFilters = [];
			
			let productionTotal, 
				qtdeBuying, 
				percentageBuying, 
				remainingVolume,
				cropDesc,
				visitFormPeriodic,
				visitType = "Relato de Negócio";
			
			let sCounter = 0;
			var sTimestamp = new Date().getTime() + sCounter;
			sCounter = sCounter + 1;

			if (oProperties.HCP_TYPE_PERSON == "Fornecedor") {
				const getViewSuppliers = await new Promise((resolve, reject) => {
					oModel.read("/View_Grouping_Suppliers", {
						filters: [new sap.ui.model.Filter({
							path: "NAME1",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oProperties.HCP_SUPPLIER_DESC
						})],
						success: function (results) {
							return resolve(results.results[0])
						}.bind(this),
						error: function (error) {
							return reject(MessageBox.error("Erro ao Buscar Fornecedor!"));
						}
					})
				})
				
				if (getViewSuppliers != undefined) {
					aFilters.push(new sap.ui.model.Filter({
						path: "HCP_PROVIDER_ID",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: getViewSuppliers.LIFNR
					}));
				}
			} else {
				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_PROVIDER_ID",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oProperties.HCP_SUPPLIER
				}));
			}
			
			const getSafraYear = await new Promise((resolve, reject) => {
				oModel.read("/Crop_Year", {
					filters: [new sap.ui.model.Filter({
						path: "HCP_CROP_ID",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: parseInt(oProperties.HCP_CROP)
					})],
					success: function (results) {
						return resolve(results.results[0])
					}.bind(this),
					error: function (error) {
						return reject(MessageBox.error("Erro ao Buscar Ano da Safra."));
					}
				})
			})
			
			if (getSafraYear != undefined) {
				cropDesc = getSafraYear.HCP_CROP_DESC
			}
			
			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_MATERIAL",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oProperties.HCP_MATERIAL
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_SAFRA_YEAR",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oProperties.HCP_CROP.toString()
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_VISIT_TYPE",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: 'Grains'
			}));
			
			let aFiltersVisitForm = [];
			if (oProperties.HCP_TYPE_PERSON == "Fornecedor") {
				aFiltersVisitForm.push(new sap.ui.model.Filter({
					path: "HCP_NAME_REGISTERED",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oProperties.HCP_SUPPLIER_DESC
				}));
			} else {
				aFiltersVisitForm.push(new sap.ui.model.Filter({
					path: "HCP_PROVIDER_ID",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oProperties.HCP_SUPPLIER
				}));
			}
			
			const getVisitFormGrains = await new Promise((resolve, reject) => {
				oModel.read("/Visit_Form_Grains", {
					filters: aFiltersVisitForm,
					sorters: [new sap.ui.model.Sorter("HCP_VISIT_ID", true)],
					success: function (results) {
						return resolve(results.results[0])
					}.bind(this),
					error: function (error) {
						return reject(MessageBox.error("Erro ao Buscar Ficha Periódica!"));
					}
				})
			})
			
			if (getVisitFormGrains != undefined) {
				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_PERIOD",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: getVisitFormGrains.HCP_PERIOD
				}));
			}

			const getMaterial = await new Promise((resolve, reject) => {
				oModel.read("/Visit_Form_Material", {
					filters: aFilters,
					sorters: [new sap.ui.model.Sorter("HCP_VISIT_ID", true)],
					success: function (results) {
						return resolve(results.results[0])
					}.bind(this),
					error: function (error) {
						return reject(MessageBox.error("Erro ao Buscar Material."))
					}
				});
			})
			
			if (getMaterial == undefined) {
				return false;
			}
			
			if (getMaterial != undefined) {
				let HCP_VOLUME = Number(getMaterial.HCP_VOLUME)
				if (getMaterial.HCP_VOLUME) {
					productionTotal = HCP_VOLUME.toFixed(0);
					qtdeBuying = (Number(oProperties.HCP_TONNAGE) / HCP_VOLUME.toFixed(0)) * 100;
				}
				if (getMaterial.HCP_PERCENT_MARKETED) {
					percentageBuying = (Number(qtdeBuying) + Number(getMaterial.HCP_PERCENT_MARKETED))
				} else {
					getMaterial.HCP_PERCENT_MARKETED = 0
					percentageBuying = (Number(qtdeBuying) + Number(getMaterial.HCP_PERCENT_MARKETED))
				}
				if (getMaterial.HCP_NEGOTIATION_BALANCE) {
					remainingVolume = Number(getMaterial.HCP_NEGOTIATION_BALANCE) - Number(oProperties.HCP_TONNAGE)
				}

				const propertiesMaterial = {
					HCP_COMMERCIALIZATION_ID: sTimestamp.toFixed(),
					HCP_PARTNER: oProperties.HCP_SUPPLIER_DESC ? oProperties.HCP_SUPPLIER_DESC : oProperties.response.NAME1 ? oProperties.response.NAME1 : '', 
					HCP_TYPE_COMMERCIALIZATION: visitType,
					HCP_CREATED_AT: new Date(),
					HCP_CREATED_BY: oProperties.HCP_CREATED_BY,
					HCP_CROP_ID: cropDesc.toString(),
					HCP_CULTURE_TYPE: oProperties.HCP_MATERIAL,
					HCP_PRODUCTIVITY_TOTAL: productionTotal == undefined ? '' : parseFloat(productionTotal).toFixed(2),
					HCP_COMMERCIALIZED_CROP: percentageBuying == undefined ? '0' : Number(percentageBuying) > 100 ? '100' : percentageBuying.toString(),
					HCP_NEW_CROP: remainingVolume == undefined ? '0' : Number(remainingVolume) < 0 ? '0' : parseFloat(remainingVolume).toFixed(2),
					HCP_DESCRIPTION: ''
				}

				let ServiceUpdateMaterial = "/Visit_Form_Material(" + getMaterial.HCP_VISIT_ID + ")";

				const updateMaterial = {
					HCP_PERCENT_MARKETED: Number(parseFloat(percentageBuying).toFixed(0)),
					HCP_NEGOTIATION_BALANCE: remainingVolume.toString()
				};

				const getStateDisableCommercialization = await new Promise((resolve, reject) => {
					oModel.read("/Disable_Commercialization(1)", {
						success: function (results) {
							return resolve(results)
						}.bind(this),
						error: function (error) {
							return reject(MessageBox.error("Erro ao Buscar Master Data."));
						}
					})
				})

				oModel.create("/Visit_Form_Commercialization", propertiesMaterial);

				if (getStateDisableCommercialization != undefined) {
					if (getStateDisableCommercialization.HCP_STATUS_COMMERCIALIZATION == "1") {
						oModel.update(ServiceUpdateMaterial, updateMaterial, {
							groupId: "changes",
						});

						oModel.submitChanges({
							groupId: "changes",
							success: function () {
								MessageBox.success(
									"Ficha de Grãos Atualizada com Sucesso!", {
										actions: [sap.m.MessageBox.Action.OK]
											// onClose: function (sAction) {
											// 	//this.navBack();
											// 	// this.closeBusyDialog();
											// 	// this.backToIndex();
											// }.bind(this)
									}
								);
							}.bind(this),
							error: function () {
								MessageBox.error("Erro ao Atualizar Ficha!");
							}.bind(this)
						});
					}
				}
				
				return true;
			}
		},

		_calculateCommercializationCulture: async function (oProperties) {
			var oModel = this.getOwnerComponent().getModel();
			var aFilters = [];
			let productionTotal, qtdeBuying, percentageBuying, remainingVolume, cropDesc;
			let visitType = "Relato de Negócio"
			
			let sCounter = 0;
			var sTimestamp = new Date().getTime() + sCounter;
			sCounter = sCounter + 1;
			
			if (oProperties.HCP_TYPE_PERSON == "Fornecedor") {
				const getViewSuppliers = await new Promise((resolve, reject) => {
					oModel.read("/View_Grouping_Suppliers", {
						filters: [new sap.ui.model.Filter({
							path: "NAME1",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oProperties.HCP_SUPPLIER_DESC
						})],
						success: function (results) {
							return resolve(results.results[0])
						}.bind(this),
						error: function (error) {
							return reject(MessageBox.error("Erro ao Buscar Fornecedor!"));
						}
					})
				})
				
				if (getViewSuppliers != undefined) {
					aFilters.push(new sap.ui.model.Filter({
						path: "HCP_PROVIDER_ID",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: getViewSuppliers.LIFNR
					}));
				}
			} else {
				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_PROVIDER_ID",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oProperties.HCP_SUPPLIER
				}));
			}
			
			const getSafraYear = await new Promise((resolve, reject) => {
				oModel.read("/Crop_Year", {
					filters: [new sap.ui.model.Filter({
						path: "HCP_CROP_ID",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: parseInt(oProperties.HCP_CROP)
					})],
					success: function (results) {
						return resolve(results.results[0])
					}.bind(this),
					error: function (error) {
						return reject(MessageBox.error("Erro ao Buscar Ano da Safra."));
					}
				})
			})
			
			if (getSafraYear != undefined) {
				cropDesc = getSafraYear.HCP_CROP_DESC
			}
			
			let aFiltersVisitForm = [];
			if (oProperties.HCP_TYPE_PERSON == "Fornecedor") {
				aFiltersVisitForm.push(new sap.ui.model.Filter({
					path: "HCP_NAME_REGISTERED",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oProperties.HCP_SUPPLIER_DESC
				}));
			} else {
				aFiltersVisitForm.push(new sap.ui.model.Filter({
					path: "HCP_PROVIDER_ID",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oProperties.HCP_SUPPLIER
				}));
			}
			
			const getVisitFormPeriodic = await new Promise((resolve, reject) => {
				oModel.read("/Visit_Form_Periodic", {
					filters: aFiltersVisitForm,
					sorters: [new sap.ui.model.Sorter("HCP_VISIT_ID", true)],
					success: function (results) {
						return resolve(results.results[0])
					}.bind(this),
					error: function (error) {
						return reject(MessageBox.error("Erro ao Buscar Ficha Periódica!"));
					}
				})
			})
			
			if (getVisitFormPeriodic != undefined) {
				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_PERIOD",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: getVisitFormPeriodic.HCP_PERIOD
				}));
			}
			
			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_CULTURE_TYPE",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oProperties.HCP_MATERIAL
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_SAFRA_YEAR",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oProperties.HCP_CROP.toString()
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_VISIT_TYPE",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: 'Periodic'
			}));

			const getCulture = await new Promise((resolve, reject) => {
				oModel.read("/Visit_Culture_Type", {
					filters: aFilters,
					sorters: [new sap.ui.model.Sorter("HCP_VISIT_ID", true)],
					success: function (results) {
						return resolve(results.results[0])
					}.bind(this),
					error: function (error) {
						return reject(MessageBox.error("Erro ao Buscar Cultura."));
					}
				});
			})
			
			if (getCulture == undefined) {
				return false;
			}

			if (getCulture != undefined) {
				let HCP_PRODUCTIVITY_TOTAL = Number(getCulture.HCP_PRODUCTIVITY_TOTAL)
				if (getCulture.HCP_PRODUCTIVITY_TOTAL) {
					productionTotal = HCP_PRODUCTIVITY_TOTAL.toFixed(0);
					qtdeBuying = (Number(oProperties.HCP_TONNAGE) / HCP_PRODUCTIVITY_TOTAL.toFixed(0)) * 100;
				}
				if (getCulture.HCP_SAFRA_PERCENTAGE) {
					percentageBuying = (Number(qtdeBuying) + Number(getCulture.HCP_SAFRA_PERCENTAGE))
				} else {
					getCulture.HCP_SAFRA_PERCENTAGE = 0
					percentageBuying = (Number(qtdeBuying) + Number(getCulture.HCP_SAFRA_PERCENTAGE))
				}
				if (getCulture.HCP_AVAILABLE_VOLUME) {
					remainingVolume = Number(getCulture.HCP_AVAILABLE_VOLUME) - Number(oProperties.HCP_TONNAGE)
				}

				const propertiesCulture = {
					HCP_COMMERCIALIZATION_ID: sTimestamp.toFixed(),
					HCP_PARTNER: oProperties.HCP_SUPPLIER_DESC ? oProperties.HCP_SUPPLIER_DESC : oProperties.response.NAME1 ? oProperties.response.NAME1 : '', 
					HCP_TYPE_COMMERCIALIZATION: visitType,
					HCP_CREATED_AT: new Date(),
					HCP_CREATED_BY: oProperties.HCP_CREATED_BY,
					HCP_CROP_ID: cropDesc.toString(),
					HCP_CULTURE_TYPE: oProperties.HCP_MATERIAL,
					HCP_PRODUCTIVITY_TOTAL: productionTotal == undefined ? '' : parseFloat(productionTotal).toFixed(2),
					HCP_COMMERCIALIZED_CROP: percentageBuying == undefined ? '0' : Number(percentageBuying) > 100 ? '100' : percentageBuying.toString(),
					HCP_NEW_CROP: remainingVolume == undefined ? '0' : Number(remainingVolume) < 0 ? '0' : parseFloat(remainingVolume).toFixed(2),
					HCP_DESCRIPTION: ''
				}

				let ServiceUpdateCulture = "/Visit_Culture_Type(" + getCulture.HCP_VISIT_ID + ")";

				const updateCulture = {
					HCP_SAFRA_PERCENTAGE: Number(parseFloat(percentageBuying).toFixed(0)),
					HCP_AVAILABLE_VOLUME: parseFloat(remainingVolume).toFixed(2)
				};

				const getStateDisableCommercialization = await new Promise((resolve, reject) => {
					oModel.read("/Disable_Commercialization(1)", {
						success: function (results) {
							return resolve(results)
						}.bind(this),
						error: function (error) {
							return reject(MessageBox.error("Erro ao Buscar Master Data."));
						}
					})
				})

				oModel.create("/Visit_Form_Commercialization", propertiesCulture);

				if (getStateDisableCommercialization != undefined) {
					if (getStateDisableCommercialization.HCP_STATUS_COMMERCIALIZATION == "1") {
						oModel.update(ServiceUpdateCulture, updateCulture, {
							groupId: "changes",
						});

						oModel.submitChanges({
							groupId: "changes",
							success: function () {
								MessageBox.success(
									"Ficha Periódica Atualizada com Sucesso!", {
										actions: [sap.m.MessageBox.Action.OK]
										// onClose: function (sAction) {
										// 	//this.navBack();
										// 	// this.closeBusyDialog();
										// 	// this.backToIndex();
										// }.bind(this)
									}
								);
							}.bind(this),
							error: function () {
								MessageBox.error("Erro ao Atualizar Ficha!");
							}.bind(this)
						});
					}
				}
				
				return true;
			}
		},

		_onSave: function () {

			this.setBusyDialog("App Grãos", "Cadastrando, aguarde");

			var oCreateModel = this.getView().getModel("newNegotiationReportModel");
			var oData = oCreateModel.getProperty("/");
			var oModel = this.getOwnerComponent().getModel();
			oModel.setUseBatch(true);
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var sTimestamp = new Date().getTime();

			var valorFrete = 0;

			var oProperties = {
				HCP_NEGO_REPORT_ID: sTimestamp.toFixed(),
				HCP_CROP: this.cropYear,
				HCP_STATE: this.state,
				HCP_REGIO: this.regio,
				HCP_MATERIAL: this.matnr,
				HCP_BRANCH: this.branch,
				HCP_REPORT_BROKER: oData.HCP_REPORT_BROKER ? oData.HCP_REPORT_BROKER.toString() : '',
				HCP_SUPPLIER: oData.HCP_SUPPLIER,
				HCP_SUPPLIER_DESC: oData.HCP_SUPPLIER_DESC,
				HCP_BUYER: oData.HCP_BUYER,
				HCP_BUYER_DESC: oData.HCP_BUYER_DESC,
				HCP_TONNAGE: oData.HCP_TONNAGE ? parseInt(oData.HCP_TONNAGE).toFixed() : null,
				HCP_CURRENCY: oData.HCP_CURRENCY,
				HCP_PRICE: oData.HCP_PRICE ? parseFloat(oData.HCP_PRICE).toFixed(2) : null,
				HCP_MATERIAL_TYPE: oData.HCP_MATERIAL_TYPE,
				HCP_STATE_ORIGIN: oData.HCP_STATE_ORIGIN,
				HCP_CITY_ORIGIN: oData.HCP_CITY_ORIGIN,
				HCP_INCOTERMS: oData.HCP_INCOTERMS.toString(),
				HCP_STATE_DESTINATION: oData.HCP_STATE_DESTINATION,
				HCP_CITY_DESTINATION: oData.HCP_CITY_DESTINATION,
				HCP_PAYMENT_TERM: oData.HCP_PAYMENT_TERM.toString(),
				HCP_NUMBER_DAYS: oData.HCP_NUMBER_DAYS ? parseFloat(oData.HCP_NUMBER_DAYS).toFixed() : null,
				HCP_MONTH: oData.HCP_MONTH,
				HCP_YEAR: oData.HCP_YEAR,
				HCP_BUYER_GROUP: oData.HCP_BUYER_GROUP,
				HCP_CENTER: oData.HCP_CENTER,
				HCP_PRICE_LIST: oData.HCP_PRICE_LIST.toString(),
				HCP_MODALITY: oData.HCP_MODALITY.toString(),
				HCP_DEPOSIT_CONDITION: oData.HCP_DEPOSIT_CONDITION,
				HCP_DEPOSIT_CONDITION_DESC: oData.HCP_DEPOSIT_CONDITION_DESC,
				HCP_PARTNER_BRF_SUP: oData.HCP_PARTNER_BRF_SUP.toString(),
				HCP_BUYER_BRF_SUP: oData.HCP_BUYER_BRF_SUP.toString(),
				HCP_UNIT_MEASURE: oData.HCP_UNIT_MEASURE,
				HCP_TYPE_PERSON: oData.HCP_TYPE_PERSON.toString(),
				HCP_TYPE_BUYER_PERSON: oData.HCP_TYPE_BUYER_PERSON.toString(),
				HCP_STATUS: '0',
				HCP_VALUE_FREIGHT: oData.HCP_VALUE_FREIGHT === null ? parseFloat(valorFrete).toFixed(2) : parseFloat(oData.HCP_VALUE_FREIGHT).toFixed(
					2),
				HCP_PRICE_CALCULATED: parseFloat(oData.HCP_PRICE_CALCULATED).toFixed(2),
				HCP_PRICE_DIFF: parseFloat(oData.HCP_PRICE_DIFF).toFixed(2),
				HCP_PLATAFORM: bIsMobile ? '1' : '2',
				HCP_CREATED_BY: this.userName,
				HCP_UPDATED_BY: this.userName,
				HCP_UPDATED_AT: this._formatDate(new Date()),
				HCP_CREATED_AT: this._formatDate(new Date()),
				HCP_PLAYERS_ID: oData.HCP_PLAYERS_ID,
				HCP_OFFER_ID: oData.HCP_CANCEL_OFFER_MAP_ID
			};

			oModel.createEntry("/Negotiation_Report", {
				properties: oProperties
			});

			oModel.submitChanges({
				success: function () {
					MessageBox.success(
						"Relato Cadastrado com sucesso.", {
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (sAction) {
								//	this.navBack();
								this.closeBusyDialog();
								this.backToIndex();
							}.bind(this)
						}
					);
				}.bind(this),
				error: function () {
					this.closeBusyDialog();
					MessageBox.error("Erro ao cadastrar Relato.");

				}.bind(this)
			});

			if (oProperties.HCP_SUPPLIER) {
				if (oProperties.HCP_TYPE_PERSON == "Fornecedor") {
					oModel.read("/View_Suppliers", {
						filters: [new sap.ui.model.Filter({
							path: "LIFNR",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oProperties.HCP_SUPPLIER
						})],
						success: async function (res) {
							let isExistComercialization = false;
							let response = res.results[0];
							if (response) {
								isExistComercialization = await this._calculateCommercializationCulture({...oProperties,
									response
								})
								if (isExistComercialization == false)
									await this._calculateCommercializationMaterial({...oProperties,
										response
									})
							}
						}.bind(this)
					});	
				} else {
					oModel.read("/Prospects", {
						filters: [new sap.ui.model.Filter({
							path: "HCP_PROSP_ID",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oProperties.HCP_SUPPLIER
						})],
						success: async function (res) {
							let isExistComercialization = false;
							let response = res.results[0];
							if (response) {
								isExistComercialization = await this._calculateCommercializationCulture({...oProperties,
									response
								})
								if (isExistComercialization == false)
									await this._calculateCommercializationMaterial({...oProperties,
										response
									})
							}
						}.bind(this)
					});	
				}
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
		backToIndex: function () {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("negotiationReport.Index", true);
		},
		_handlePartnerFilterPress: function (oEvent) {
			var oFilterBar;
			var sId = oEvent.getSource().sId;

			var oVisitModel = this.getView().getModel("newNegotiationReportModel");
			if (sId.substring(sId.length, sId.length - 10) !== "yesPartner") {
				oVisitModel.setProperty("/partnerType", "buyer");
			} else {
				oVisitModel.setProperty("/partnerType", "supplier");
			}

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
			var oPartnerInput = sap.ui.core.Fragment.byId("newNegociationFragmentID" + this.getView().getId(), "inputpartnerID");
			var oVisitModel = this.getView().getModel("newNegotiationReportModel");
			var oData = oVisitModel.getProperty("/");
			var SelectedPartner = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

			if (oData.partnerType === "buyer") {
				oData["HCP_BUYER"] = SelectedPartner.HCP_REGISTER;
				oData["HCP_BUYER_DESC"] = SelectedPartner.NAME1;
			} else {
				oData["HCP_SUPPLIER"] = SelectedPartner.HCP_REGISTER;
				oData["HCP_SUPPLIER_DESC"] = SelectedPartner.NAME1;
			}

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
		_onCancel: function (oEvent) {
			this.setBusyDialog("App Grãos", "Aguarde");
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			MessageBox.warning(
				"Tem certeza que deseja voltar? As informações cadastradas não serão salvas!", {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						if (sAction === "YES") {
							this.navBack();
							this.closeBusyDialog();
						} else {
							this.closeBusyDialog();
						}
					}.bind(this)
				}
			);
		},
		_validateStates: function (oEvent) {

			var oInput = oEvent.getSource();
			oInput.getValue();

			var oTable = this.getView().byId("county");
			var oFilters = [];

			var oModel = this.getView().getModel();
			var oCreateModelIndustry = this.getView().getModel("newNegotiationReportModel");

			oFilters.push(new sap.ui.model.Filter("TAXJURCODE", sap.ui.model.FilterOperator.Contains, oInput.getSelectedKey()));
			oTable.getBinding("items").filter(oFilters);

		},
		_onInputUfFormSelect: function (oEvent) {

			var oCreateModelIndustry = this.getView().getModel("newNegotiationReportModel");

			if (oCreateModelIndustry.oData.HCP_STATE_ORIGIN) {
				oCreateModelIndustry.setProperty("/enableCounty", true);
			} else {
				oCreateModelIndustry.setProperty("/enableCounty", false);
				oCreateModelIndustry.setProperty("/HCP_CITY_ORIGIN", null);
			}

			this._validateStates(oEvent);
			this._validateForm();

		},
		_validateCounty: function () {

			var oCreateModelIndustry = this.getView().getModel("newNegotiationReportModel");

			if (!oCreateModelIndustry.oData.HCP_CITY_ORIGIN) {
				oCreateModelIndustry.setProperty("/HCP_STATE_ORIGIN", null);
			}

			this._validateForm();
		},

		_validateStatesDestination: function (oEvent) {

			var oInput = oEvent.getSource();
			oInput.getValue();

			var oTable = this.getView().byId("countyDestination");
			var oFilters = [];

			var oModel = this.getView().getModel();
			var oCreateModelIndustry = this.getView().getModel("newNegotiationReportModel");

			oFilters.push(new sap.ui.model.Filter("TAXJURCODE", sap.ui.model.FilterOperator.Contains, oInput.getSelectedKey()));
			oTable.getBinding("items").filter(oFilters);

		},
		_onInputUfFormSelectDestination: function (oEvent) {

			var oCreateModelIndustry = this.getView().getModel("newNegotiationReportModel");

			if (oCreateModelIndustry.oData.HCP_STATE_DESTINATION) {
				oCreateModelIndustry.setProperty("/enableCountyDestination", true);
			} else {
				oCreateModelIndustry.setProperty("/enableCountyDestination", false);
				oCreateModelIndustry.setProperty("/HCP_CITY_DESTINATION", null);
			}

			this._validateStatesDestination(oEvent);
			this._validateForm();

		},
		_validateCountyDestination: function () {

			var oCreateModelIndustry = this.getView().getModel("newNegotiationReportModel");

			if (oCreateModelIndustry.oData.HCP_STATE_DESTINATION) {
				oCreateModelIndustry.setProperty("/enableCountyDestination", true);
			} else {
				oCreateModelIndustry.setProperty("/enableCountyDestination", false);
				oCreateModelIndustry.setProperty("/HCP_CITY_DESTINATION", null);
			}

			if (!oCreateModelIndustry.oData.HCP_STATE_DESTINATION) {
				oCreateModelIndustry.setProperty("/HCP_STATE_DESTINATION", null);
			}

			this._validateForm();
		},
		_validateUnity: function (oEvent) {

			var oInput = oEvent.getSource();
			var oModelNegociationReport = this.getView().getModel("newNegotiationReportModel");
			var oData = oModelNegociationReport.getProperty("/");

			if (oData.HCP_PRICE_LIST != 0) {

				var freteDigitado = oData.HCP_VALUE_FREIGHT !== null ? oData.HCP_VALUE_FREIGHT : 0;

				if (oInput.getSelectedKey() == "TO") {
					var calc = parseFloat(oData.HCP_PRICE) + parseFloat(freteDigitado);
					oModelNegociationReport.setProperty("/HCP_PRICE_CALCULATED", calc);

					if (oData.HCP_PRICE_LIST) {
						oData.HCP_PRICE_DIFF = parseFloat(oData.HCP_PRICE_LIST) - parseFloat(oData.HCP_PRICE_CALCULATED);
					}

				} else if (oInput.getSelectedKey() == "SC") {
					var calcSC = ((parseFloat(freteDigitado) * 60) / 1000) + parseFloat(oData.HCP_PRICE);
					oModelNegociationReport.setProperty("/HCP_PRICE_CALCULATED", calcSC);

					if (oData.HCP_PRICE_LIST) {
						oData.HCP_PRICE_DIFF = parseFloat(oData.HCP_PRICE_LIST) - parseFloat(oData.HCP_PRICE_CALCULATED);
					}
				} else {
					oModelNegociationReport.setProperty("/HCP_PRICE_CALCULATED", 0);
				}
			}

			this._validateForm();
		},
		_validateFinalPrice: function (oEvent, field) {

			if (!field) {
				var oSource = oEvent.getSource();
				var oNewValue = oSource.getValue();
				oNewValue = oNewValue.replace(/[^0-9,]/g, "");
				oSource.setValue(oNewValue);
			}
			var oModelNegociationReport = this.getView().getModel("newNegotiationReportModel");
			var oData = oModelNegociationReport.getProperty("/");

			this.freteDigitado = oData.HCP_VALUE_FREIGHT;
			var freteDigitado = oData.HCP_VALUE_FREIGHT !== null ? oData.HCP_VALUE_FREIGHT : 0;

			if (oData.HCP_PRICE_LIST != 0) {
				if (oData.HCP_UNIT_MEASURE == "TO") {
					var calc = parseFloat(oData.HCP_PRICE) + parseFloat(freteDigitado);
					oModelNegociationReport.setProperty("/HCP_PRICE_CALCULATED", calc);
					oData.HCP_PRICE_DIFF = parseFloat(oData.HCP_PRICE_LIST) - parseFloat(oData.HCP_PRICE_CALCULATED);
				} else if (oData.HCP_UNIT_MEASURE == "SC") {
					var calcSC = ((parseFloat(freteDigitado) * 60) / 1000) + parseFloat(oData.HCP_PRICE);
					oModelNegociationReport.setProperty("/HCP_PRICE_CALCULATED", calcSC);
					oData.HCP_PRICE_DIFF = parseFloat(oData.HCP_PRICE_LIST) - parseFloat(oData.HCP_PRICE_CALCULATED);

				} else {
					oModelNegociationReport.setProperty("/HCP_PRICE_CALCULATED", 0);
				}
			}

			this._validateForm();
		},
		_onInputPartnerFormSelect: function (oEvent) {

			var oModelNegociationReport = this.getView().getModel("newNegotiationReportModel");
			var oInput = oEvent.getSource();

			oModelNegociationReport.setProperty("/HCP_SUPPLIER", null);
			oModelNegociationReport.setProperty("/HCP_SUPPLIER_DESC", null);
			oModelNegociationReport.setProperty("/enableCreate", false);

			if (oInput.getSelectedKey() === "1") {
				oModelNegociationReport.setProperty("/noPartner", false);
				oModelNegociationReport.setProperty("/yesPartner", true);
				oModelNegociationReport.setProperty("/HCP_PARTNER_BRF_SUP", 1);
				oModelNegociationReport.setProperty("/enablePartner", true);

			} else {
				oModelNegociationReport.setProperty("/enablePartner", false);
				oModelNegociationReport.setProperty("/noPartner", true);
				oModelNegociationReport.setProperty("/yesPartner", false);
				oModelNegociationReport.setProperty("/HCP_PARTNER_BRF_SUP", 0);

			}

			this._validateForm();

		},
		_onInputBuyerFormSelect: function (oEvent) {

			var oModelNegociationReport = this.getView().getModel("newNegotiationReportModel");
			var oInput = oEvent.getSource();

			oModelNegociationReport.setProperty("/HCP_BUYER", null);
			oModelNegociationReport.setProperty("/HCP_BUYER_DESC", null);

			if (oInput.getSelectedKey() === "1") {
				oModelNegociationReport.setProperty("/noBuyer", false);
				oModelNegociationReport.setProperty("/yesBuyer", true);
				oModelNegociationReport.setProperty("/HCP_BUYER_BRF_SUP", 1);

			} else {
				oModelNegociationReport.setProperty("/noBuyer", true);
				oModelNegociationReport.setProperty("/yesBuyer", false);
				oModelNegociationReport.setProperty("/HCP_BUYER_BRF_SUP", 0);

			}

			this._validateForm();

		},
		_changeModality: function (oEvent) {

			var oInput = oEvent.getSource();
			var oEditModel = this.getView().getModel("newNegotiationReportModel");

			if (oInput.getSelectedKey() === "1") {
				oEditModel.setProperty("/enableModality", true);
				oEditModel.setProperty("/HCP_DEPOSIT_CONDITION", null);
				oEditModel.setProperty("/enableModalityDesc", true);
				oEditModel.setProperty("/requiredDeposit", true);
				oEditModel.setProperty("/requiredPrice", false);
			} else {
				oEditModel.setProperty("/enableModalityDesc", false);
				oEditModel.setProperty("/enableModality", false);
				oEditModel.setProperty("/HCP_DEPOSIT_CONDITION_DESC", null);
				oEditModel.setProperty("/requiredDeposit", false);
				oEditModel.setProperty("/requiredPrice", true);
			}

			this._validateForm();

		},
		_changeModalityCondition: function (oEvent) {

			var oInput = oEvent.getSource();
			var oEditModel = this.getView().getModel("newNegotiationReportModel");

			if (oInput.getSelectedKey() !== "5") {
				oEditModel.setProperty("/enableModalityDesc", true);

			} else {
				oEditModel.setProperty("/enableModalityDesc", false);
				oEditModel.setProperty("/HCP_DEPOSIT_CONDITION_DESC", null);
			}

			this._validateForm();

		},
		refreshStore: function (entity) {
			return new Promise(function (resolve, reject) {
				if (typeof sap.hybrid !== 'undefined') {
					this.setBusyDialog("App Grãos", "Atualizando banco de dados");
					sap.hybrid.refreshStore(entity).then(function () {
						resolve();
					}.bind(this));
				} else {
					resolve();
				}
			}.bind(this));
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
		_valideInputNumber: function (oEvent) {

			var oSource = oEvent.getSource();
			var oNewValue = oSource.getValue();

			oNewValue = oNewValue.replace(/[^0-9,]/g, "");

			oSource.setValue(oNewValue);

			setTimeout(function () {

				this._validateForm();

			}.bind(this), 500);
		},
		_onInputPartnerProsp: function (oEvent) {

			var oModelCreate = this.getView().getModel("newNegotiationReportModel");
			var oInput = oEvent.getSource();

			oModelCreate.setProperty("/HCP_SUPPLIER", null);
			oModelCreate.setProperty("/HCP_SUPPLIER_DESC", null);
			oModelCreate.setProperty("/enableCreate", false);

			if (oInput.getSelectedKey() === "Fornecedor") {

				oModelCreate.setProperty("/HCP_PARTNER_BRF_SUP", '1');
				oModelCreate.setProperty("/yesProspect", false);
				oModelCreate.setProperty("/yesPartner", true);

			} else {
				oModelCreate.setProperty("/yesProspect", true);
				oModelCreate.setProperty("/yesPartner", false);
				oModelCreate.setProperty("/noPartner", false);
			}

			this._validateForm();

		},

		_onInputBuyerProsp: function (oEvent) {

			var oModelCreate = this.getView().getModel("newNegotiationReportModel");
			var oInput = oEvent.getSource();

			oModelCreate.setProperty("/HCP_BUYER", null);
			oModelCreate.setProperty("/HCP_BUYER_DESC", null);
			oModelCreate.setProperty("/enableCreate", false);

			if (oInput.getSelectedKey() === "Comprador") {

				oModelCreate.setProperty("/HCP_Buyer_BRF_SUP", '1');
				oModelCreate.setProperty("/yesBuyerProspect", false);
				oModelCreate.setProperty("/yesBuyer", true);

			} else {
				oModelCreate.setProperty("/yesBuyerProspect", true);
				oModelCreate.setProperty("/yesBuyer", false);
				oModelCreate.setProperty("/noBuyer", false);
			}

			this._validateForm();

		},

		_createYear: function () {

			var dif = 1;
			var min = (new Date().getFullYear()) - dif;
			var max = (min + 4) + dif;
			var comboAno = this.getView().byId("comboAno");

			for (var i = min; i <= max; i++) {
				var newItem = new sap.ui.core.Item({
					key: i,
					text: i,
					enable: true
				});
				comboAno.addItem(newItem);
			}
		},
		_createMonth: function () {

			var comboMes = this.getView().byId("comboMes");
			for (var mesList = 1; mesList <= 12; mesList++) {

				if (mesList < 10) {
					mesList = "0" + mesList;
				}

				var newItem = new sap.ui.core.Item({
					key: mesList,
					text: this._createMonthText(mesList),
					enable: true
				});
				comboMes.addItem(newItem);
			}
		},
		_createMonthText: function (month) {

			if (month === "01") {
				return "Janeiro";
			} else if (month === "02") {
				return "Fevereiro";
			} else if (month === "03") {
				return "Março";
			} else if (month === "04") {
				return "Abril";
			} else if (month === "05") {
				return "Maio";
			} else if (month === "06") {
				return "Junho";
			} else if (month === "07") {
				return "Julho";
			} else if (month === "08") {
				return "Agosto";
			} else if (month === "09") {
				return "Setembro";
			} else if (month === 10) {
				return "Outubro";
			} else if (month === 11) {
				return "Novembro";
			} else {
				return "Dezembro";
			}
		},

		updateTablePrice: function () {

			var oCreateModel = this.getView().getModel("newNegotiationReportModel");
			var oData = oCreateModel.getProperty("/");
			oData.HCP_PRICE_CALCULATED = 0;
			var oModel = this.getOwnerComponent().getModel();
			var aFilters = [];
			var oFieldMont = "PRECO_" + oData.HCP_MONTH;
			var self = this;
			var oCurrData = new Date();

			oCurrData.setHours(0);
			oCurrData.setSeconds(0);
			oCurrData.setMinutes(0);

			if (oData.HCP_BRANCH && oData.HCP_CENTER && oData.HCP_STATE && oData.HCP_MATERIAL && oData.HCP_YEAR &&
				oData.HCP_MONTH) {

				this.setBusyDialog("Relato de negócios", "Consultando Tabela de Preços para o centro. Aguarde!");

				aFilters.push(new sap.ui.model.Filter({
					path: "EKGRP",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_BRANCH
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "WERKS",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_CENTER
				}));

				/*
						aFilters.push(new sap.ui.model.Filter({
							path: "REGIO",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.HCP_STATE
						}));

						*/

				aFilters.push(new sap.ui.model.Filter({
					path: "MATNR",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_MATERIAL
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "TPCEREAL",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_MATERIAL_TYPE
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "FND_YEAR",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_YEAR
				}));

				oModel.read("/Table_Price", {

					filters: aFilters,
					success: function (results) {

						if (results.results.length > 0) {

							var oPrice = results.results[0];
							var oDate = new Date();
							var sMonth = oDate.getMonth();
							if (sMonth < 10) {
								sMonth = "0" + sMonth;
							} else {
								sMonth = sMonth.toString();
							}
							var aMonthPrice = oPrice["PRECO_" + oData.HCP_MONTH];
							var oMonthValidity = new Date(this.formatDate(oPrice["VIGENCIA_" + oData.HCP_MONTH]));

							var oIntention = oPrice;
							var aPrice = aMonthPrice;
							var oValidityData = oMonthValidity;
							var bDateIsValid = oCurrData > oValidityData ? false : true;
							var bDateIsEqual = oCurrData.toUTCString() === oValidityData.toUTCString() ? true : false;

							if (oValidityData instanceof Date && isFinite(oValidityData)) {
								if (bDateIsValid || bDateIsEqual) {

									if (results.results[0][oFieldMont] != "0") {

										var freteDigitado = oData.HCP_VALUE_FREIGHT !== null ? oData.HCP_VALUE_FREIGHT : 0;

										if (oData.HCP_UNIT_MEASURE == "TO") {
											oData.HCP_PRICE_LIST = results.results[0][oFieldMont];
											oData.HCP_PRICE_CALCULATED = parseFloat(oData.HCP_PRICE) + parseFloat(freteDigitado);
											oData.HCP_PRICE_DIFF = parseFloat(results.results[0][oFieldMont]) - parseFloat(oData.HCP_PRICE_CALCULATED);
										} else if (oData.HCP_UNIT_MEASURE == "SC") {
											var calcSC = ((parseFloat(freteDigitado) * 60) / 1000) + parseFloat(oData.HCP_PRICE);
											oData.HCP_PRICE_LIST = results.results[0][oFieldMont];
											oData.HCP_PRICE_CALCULATED = calcSC;
											oData.HCP_PRICE_DIFF = parseFloat(results.results[0][oFieldMont]) - parseFloat(oData.HCP_PRICE_CALCULATED);
										} else {
											oData.HCP_PRICE_LIST = results.results[0][oFieldMont];
											//oData.HCP_PRICE_CALCULATED = 0;
											//oData.HCP_PRICE_DIFF = 0;
										}

									} else {
										oData.HCP_PRICE_LIST = 0;
										oData.HCP_PRICE_CALCULATED = 0;
										oData.HCP_PRICE_DIFF = 0;
									}

									oCreateModel.setProperty("/priceListStatus", "Success");
									oCreateModel.setProperty("/noPriceBRF", false);

								} else {
									oCreateModel.setProperty("/priceListStatus", "Information");
									oData.HCP_PRICE_LIST = 0;
									oData.HCP_PRICE_CALCULATED = 0;
									oData.HCP_PRICE_DIFF = 0;
									oCreateModel.setProperty("/noPriceBRF", true);
								}
							}

						} else {
							oCreateModel.setProperty("/priceListStatus", "Information");
							oData.HCP_PRICE_LIST = 0;
							oData.HCP_PRICE_CALCULATED = 0;
							oData.HCP_PRICE_DIFF = 0;
							oCreateModel.setProperty("/noPriceBRF", true);
						}

						if (oData.HCP_PRICE_LIST <= 0) {
							//oCreateModel.setProperty("/enableCreate", false);
							oCreateModel.setProperty("/noPriceBRF", true);
							oCreateModel.setProperty("/priceListStatus", "Information");
						} else {
							oCreateModel.setProperty("/priceListStatus", "Success");
						}

						oCreateModel.refresh();
						self.closeBusyDialog();
						self._validateForm();

					}.bind(this),
					error: function (error) {
						self.closeBusyDialog();
					}
				});

			} else {
				//oCreateModel.setProperty("/enableCreate", false);
			}
		},
		verifyAccountGroup: function () {
			setTimeout(function () {

				var oModel = this.getOwnerComponent().getModel();

				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'BNAME',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: this.userName.toString().toUpperCase()
				}));

				oModel.read("/View_Users", {
					filters: aFilters,
					success: function (oData) {
						if (oData.results.length > 0) {
							var oFilterModel = this.getView().getModel("newNegotiationReportModel");
							if (oData.results[0].EKGRP) {
								oFilterModel.setProperty("/HCP_BUYER_GROUP", oData.results[0].EKGRP);
							}
						}
						//this.closeBusyDialog();
					}.bind(this),
					error: function () {
						//	MessageBox.error("Erro ao buscar grupo de compra.");
						//this.closeBusyDialog();
					}
				});

			}.bind(this), 500);
		},
		_validateIncoterms: function () {

			var oCreateModel = this.getView().getModel("newNegotiationReportModel");
			var oData = oCreateModel.getProperty("/");

			//cif
			if (oData.HCP_INCOTERMS == 2) {
				oCreateModel.setProperty("/enableFreight", true);
				oCreateModel.setProperty("/HCP_VALUE_FREIGHT", this.freteDigitado);
			} else {
				oCreateModel.setProperty("/enableFreight", false);
				oCreateModel.setProperty("/HCP_VALUE_FREIGHT", null);

			}

			if (oData.HCP_PRICE_LIST != 0) {

				var freteDigitado = oData.HCP_VALUE_FREIGHT !== null ? oData.HCP_VALUE_FREIGHT : 0;

				if (oData.HCP_UNIT_MEASURE == "TO") {
					var calc = parseFloat(oData.HCP_PRICE) + parseFloat(freteDigitado);
					oCreateModel.setProperty("/HCP_PRICE_CALCULATED", calc);

					if (oData.HCP_PRICE_LIST) {
						oData.HCP_PRICE_DIFF = parseFloat(oData.HCP_PRICE_LIST) - parseFloat(oData.HCP_PRICE_CALCULATED);
					}

				} else if (oData.HCP_UNIT_MEASURE == "SC") {
					var calcSC = ((parseFloat(freteDigitado) * 60) / 1000) + parseFloat(oData.HCP_PRICE);
					oCreateModel.setProperty("/HCP_PRICE_CALCULATED", calcSC);

					if (oData.HCP_PRICE_LIST) {
						oData.HCP_PRICE_DIFF = parseFloat(oData.HCP_PRICE_LIST) - parseFloat(oData.HCP_PRICE_CALCULATED);
					}
				} else {
					oCreateModel.setProperty("/HCP_PRICE_CALCULATED", 0);
				}

			}

			this._validateForm();
		},
		_validatePayment: function () {

			var oEditModel = this.getView().getModel("newNegotiationReportModel");
			var oData = oEditModel.getProperty("/");

			if (oData.HCP_PAYMENT_TERM == 0) {
				oEditModel.setProperty("/enableDaysQuantity", true);
			} else {
				oEditModel.setProperty("/enableDaysQuantity", false);
				oEditModel.setProperty("/HCP_NUMBER_DAYS", null);
			}

			this._validateForm();
		}
	});
});