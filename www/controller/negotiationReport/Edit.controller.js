sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.negotiation.Edit", {
		formatter: formatter,
		onInit: function (oEvent) {

			this._createYear();
			this._createMonth();
			this.setBusyDialog("Relato de Negociação da Região", "Carregando dados, por favor aguarde");
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("negotiationReport.Edit").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());

			var oModel = this.getOwnerComponent().getModel();
			//	oModel.refresh(true);

			oModel.attachRequestCompleted(function () {
				var oFilterPageModel = this.getView().getModel("editNegotiationReportModel");
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

			}.bind(this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableCreate: false,
				priceListStatus: 'Success',
				noPriceBRF: false,
				isLoad: false,
				requiredDeposit: false
			}), "editNegotiationReportModel");

			var oEditModel = this.getView().getModel("editNegotiationReportModel");
			var oModel = this.getView().getModel();
			var oData;

			if (oEvent.getParameter("data")) {
				var sPathKeyData = oEvent.getParameter("data").HCP_NEGO_REPORT_ID;
				oData = oModel.getProperty(decodeURIComponent(sPathKeyData));
				//oData = JSON.parse(JSON.stringify(oData));
				oEditModel.setProperty("/", oData);
				this.freteDigitado = oEditModel.getProperty("/").HCP_VALUE_FREIGHT;

				if (oEvent.getParameter("data").isEdit === '1') {
					oEditModel.setProperty("/isEdit", true);
					oEditModel.setProperty("/priceListStatus", "Success");

				} else {
					oEditModel.setProperty("/isEdit", false);
					oEditModel.setProperty("/enableCreate", false);
					oEditModel.setProperty("/enableCountyDestination", false);
				}

				if (oEditModel.getProperty("/").HCP_REGIO) {
					oEditModel.setProperty("/hasRegio", true);
				} else {
					oEditModel.setProperty("/hasRegio", false);
				}

				if (oEditModel.getProperty("/").HCP_BRANCH) {
					oEditModel.setProperty("/HCP_BUYER_GROUP", oEditModel.getProperty("/").HCP_BRANCH);
					oEditModel.setProperty("/hasBranch", true);
				} else {
					oEditModel.setProperty("/hasBranch", false);
				}

				if (oEditModel.getProperty("/").HCP_STATUS == 1) {
					oEditModel.setProperty("/isNegotiationActive", true);
				} else {
					oEditModel.setProperty("/isNegotiationActive", false);
				}

				if (oEditModel.getProperty("/").HCP_STATE) {

					var oTable = this.getView().byId("county");
					var oFilters = [];

					oFilters.push(new sap.ui.model.Filter("TAXJURCODE", sap.ui.model.FilterOperator.Contains, oEditModel.getProperty("/").HCP_STATE));
					oTable.getBinding("items").filter(oFilters);

				}
				oEditModel.setProperty("/noPriceBRF", false);

				if (oEditModel.getProperty("/").HCP_INCOTERMS == 1 || oEditModel.getProperty("/").HCP_INCOTERMS == 3) {
					oEditModel.setProperty("/enableFreight", true);
				} else {
					oEditModel.setProperty("/enableFreight", false);
				}

				if (oEditModel.getProperty("/").HCP_PAYMENT_TERM == 0) {
					oEditModel.setProperty("/enableDaysQuantity", true);
				} else {
					oEditModel.setProperty("/enableDaysQuantity", false);
				}

				if (oEditModel.getProperty("/").HCP_PARTNER_BRF_SUP == 1) {
					oEditModel.setProperty("/noProspect", false);
					oEditModel.setProperty("/yesProspect", true);
					oEditModel.setProperty("/enablePartner", true);

				} else {
					oEditModel.setProperty("/noProspect", true);
					oEditModel.setProperty("/yesProspect", false);
					oEditModel.setProperty("/enablePartner", false);
				}

				if (oEditModel.getProperty("/").HCP_BUYER_BRF_SUP == 1) {
					oEditModel.setProperty("/noPartner", false);
					oEditModel.setProperty("/yesPartner", true);

				} else {
					oEditModel.setProperty("/noPartner", true);
					oEditModel.setProperty("/yesPartner", false);
				}

			}
			this.searchFieldValues();
			//this._validateForm();
			//var oModelOwner = this.getOwnerComponent().getModel();
			//	oModelOwner.refresh(true);

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				create: true,
				edit: true
			}), "profileModel");

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
				var oCreateModel = this.getView().getModel("editNegotiationReportModel");

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
			let productionTotal, Negotiation_Balance_Material;
			let qtdeBuying, percentageBuying, remainingVolume, cropDesc;
			let visitType = "Relato de Negócio";

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
					HCP_CREATED_BY: oProperties.HCP_UPDATED_BY,
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
							resolve(results)
						}.bind(this),
						error: function (error) {
							reject(MessageBox.error("Erro ao Buscar Master Data."));
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
					HCP_CREATED_BY: oProperties.HCP_UPDATED_BY,
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
							resolve(results)
						}.bind(this),
						error: function (error) {
							reject(MessageBox.error("Erro ao Buscar Master Data."));
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

			this.setBusyDialog("App Grãos", "Salvando, aguarde");
			var oModel = this.getOwnerComponent().getModel();
			oModel.setUseBatch(true);

			var oEditModel = this.getView().getModel("editNegotiationReportModel");
			var sPath;
			var oData = oEditModel.oData;
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var aDeferredGroups = oModel.getDeferredGroups();
			var aFilters = [];

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}

			var valorFrete = 0;

			var oProperties = {
				HCP_CROP: oData.HCP_CROP,
				HCP_STATE: oData.HCP_STATE,
				HCP_REGIO: oData.HCP_REGIO,
				HCP_MATERIAL: oData.HCP_MATERIAL,
				HCP_BRANCH: oData.HCP_BRANCH,
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
				HCP_STATUS: oData.isNegotiationActive ? '1' : '0',
				HCP_VALUE_FREIGHT: oData.HCP_VALUE_FREIGHT === null ? parseFloat(valorFrete).toFixed(2) : parseFloat(oData.HCP_VALUE_FREIGHT).toFixed(
					2),
				HCP_PRICE_CALCULATED: parseFloat(oData.HCP_PRICE_CALCULATED).toFixed(2),
				HCP_PRICE_DIFF: parseFloat(oData.HCP_PRICE_DIFF).toFixed(2),
				HCP_UPDATED_BY: this.userName,
				HCP_UPDATED_AT: this._formatDate(new Date()),
				HCP_PLAYERS_ID: oData.HCP_PLAYERS_ID
			};

			sPath = this.buildEntityPath("Negotiation_Report", oData);

			oModel.update(sPath, oProperties, {
				groupId: "changes"
			});

			oModel.submitChanges({
				groupId: "changes",
				success: function () {
					MessageBox.success(
						"Relato Editado com sucesso.", {
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (sAction) {
								//this.navBack();
								this.closeBusyDialog();
								this.backToIndex();
							}.bind(this)
						}
					);
				}.bind(this),
				error: function () {
					MessageBox.error("Erro ao editar Relato.");
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

		_validateFinalPrice: function (oEvent, field) {

			if (!field) {
				var oSource = oEvent.getSource();
				var oNewValue = oSource.getValue();
				oNewValue = oNewValue.replace(/[^0-9,]/g, "");
				oSource.setValue(oNewValue);
			}
			var oModelNegociationReport = this.getView().getModel("editNegotiationReportModel");
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
					oData.HCP_PRICE_DIFF = parseFloat(oData.HCP_PRICE_LIST) - (oData.HCP_PRICE_CALCULATED);

				} else {
					oModelNegociationReport.setProperty("/HCP_PRICE_CALCULATED", 0);
				}
			}

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

			var oVisitModel = this.getView().getModel("editNegotiationReportModel");
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
			var oVisitModel = this.getView().getModel("editNegotiationReportModel");
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

			var oEditModel = this.getView().getModel("editNegotiationReportModel");
			var oData = oEditModel.getProperty("/");

			if (oData.enableCreate) {
				MessageBox.warning(
					"Tem certeza que deseja voltar? As informações editadas não serão salvas", {
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
			} else {
				this.navBack();
				this.closeBusyDialog();
			}

		},
		_validateStates: function (oEvent) {

			var oInput = oEvent.getSource();
			oInput.getValue();

			var oTable = this.getView().byId("county");
			var oFilters = [];

			var oModel = this.getView().getModel();
			var oCreateModelIndustry = this.getView().getModel("editNegotiationReportModel");

			oFilters.push(new sap.ui.model.Filter("TAXJURCODE", sap.ui.model.FilterOperator.Contains, oInput.getSelectedKey()));
			oTable.getBinding("items").filter(oFilters);

		},
		_onInputUfFormSelect: function (oEvent) {

			var oCreateModelIndustry = this.getView().getModel("editNegotiationReportModel");

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

			var oCreateModelIndustry = this.getView().getModel("editNegotiationReportModel");

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
			var oCreateModelIndustry = this.getView().getModel("editNegotiationReportModel");

			oFilters.push(new sap.ui.model.Filter("TAXJURCODE", sap.ui.model.FilterOperator.Contains, oInput.getSelectedKey()));
			oTable.getBinding("items").filter(oFilters);

		},
		_onInputUfFormSelectDestination: function (oEvent) {

			var oCreateModelIndustry = this.getView().getModel("editNegotiationReportModel");

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

			var oCreateModelIndustry = this.getView().getModel("editNegotiationReportModel");

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
		_onInputPartnerFormSelect: function (oEvent) {

			var oModelNegociationReport = this.getView().getModel("editNegotiationReportModel");
			var oInput = oEvent.getSource();

			oModelNegociationReport.setProperty("/HCP_SUPPLIER", null);
			oModelNegociationReport.setProperty("/HCP_SUPPLIER_DESC", null);
			oModelNegociationReport.setProperty("/enableCreate", false);

			if (oInput.getSelectedKey() === "1" || oInput.getSelectedKey() === "3") {
				oModelNegociationReport.setProperty("/noPartner", false);
				oModelNegociationReport.setProperty("/yesPartner", true);
				oModelNegociationReport.setProperty("/HCP_PARTNER_BRF_SUP", 1);
				oModelNegociationReport.setProperty("/enablePartner", true);

			} else {
				oModelNegociationReport.setProperty("/noPartner", true);
				oModelNegociationReport.setProperty("/yesPartner", false);
				oModelNegociationReport.setProperty("/HCP_PARTNER_BRF_SUP", 0);
				oModelNegociationReport.setProperty("/enablePartner", false);

			}

			this._validateForm();

		},
		_onInputBuyerFormSelect: function (oEvent) {

			var oModelNegociationReport = this.getView().getModel("editNegotiationReportModel");
			var oInput = oEvent.getSource();

			oModelNegociationReport.setProperty("/HCP_BUYER", null);
			oModelNegociationReport.setProperty("/HCP_BUYER_DESC", null);

			if (oInput.getSelectedKey() === "1" || oInput.getSelectedKey() === "3") {
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
		searchFieldValues: function () {

			var oEditModel = this.getView().getModel("editNegotiationReportModel");
			var oData = oEditModel.oData;

			if (oData.HCP_TYPE_PERSON === 'Fornecedor') {

				if (oData.HCP_PARTNER_BRF_SUP === '1') {
					oEditModel.setProperty("/noPartner", false);
					oEditModel.setProperty("/yesPartner", true);
					oEditModel.setProperty("/yesProspect", false);
				} else {
					oEditModel.setProperty("/noPartner", true);
					oEditModel.setProperty("/yesPartner", false);
				}

			} else {
				oEditModel.setProperty("/yesProspect", true);
				oEditModel.setProperty("/yesPartner", false);
				oEditModel.setProperty("/noPartner", false);
			}

			if (oData.HCP_TYPE_BUYER_PERSON === 'Comprador') {
				oEditModel.setProperty("/yesBuyerProspect", false);

				if (oData.HCP_BUYER_BRF_SUP === '1') {
					oEditModel.setProperty("/noBuyer", false);
					oEditModel.setProperty("/yesBuyer", true);
				} else {
					oEditModel.setProperty("/noBuyer", true);
					oEditModel.setProperty("/yesBuyer", false);
				}
			} else {

				oEditModel.setProperty("/yesBuyerProspect", true);
				oEditModel.setProperty("/yesBuyer", false);
				oEditModel.setProperty("/noBuyer", false);
			}

			if (oData.HCP_MODALITY === '1') {
				oEditModel.setProperty("/enableModality", true);
				oEditModel.setProperty("/requiredDeposit", true);
				oEditModel.setProperty("/requiredPrice", false);

			} else {
				oEditModel.setProperty("/enableModality", false);
				oEditModel.setProperty("/requiredDeposit", false);
				oEditModel.setProperty("/enableModalityDesc", false);
				oEditModel.setProperty("/requiredPrice", true);
			}

			if (oData.HCP_DEPOSIT_CONDITION !== '5' && oData.HCP_MODALITY === '1') {
				oEditModel.setProperty("/enableModalityDesc", true);
			} else {
				oEditModel.setProperty("/enableModalityDesc", false);
			}

			oEditModel.setProperty("/enableCreate", false);
		},
		_changeModality: function (oEvent) {

			var oInput = oEvent.getSource();
			var oEditModel = this.getView().getModel("editNegotiationReportModel");

			if (oInput.getSelectedKey() === "1" || oInput.getSelectedKey() === "3") {
				oEditModel.setProperty("/enableModality", true);
				oEditModel.setProperty("/enableModalityDesc", true);
				oEditModel.setProperty("/HCP_DEPOSIT_CONDITION", null);
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
			var oEditModel = this.getView().getModel("editNegotiationReportModel");

			if (oInput.getSelectedKey() !== "5") {
				oEditModel.setProperty("/enableModalityDesc", true);

			} else {
				oEditModel.setProperty("/enableModalityDesc", false);
				oEditModel.setProperty("/HCP_DEPOSIT_CONDITION_DESC", null);
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

		_valideInputNumber: function (oProperty) {

			var oSource = oProperty.getSource();
			var oNewValue = oSource.getValue();

			oNewValue = oNewValue.replace(/[^0-9,]/g, "");

			oSource.setValue(oNewValue);

			this._validateForm();
		},
		_onInputPartnerProsp: function (oEvent) {

			var oModelCreate = this.getView().getModel("editNegotiationReportModel");
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
		_createYear: function () {

			var min = new Date().getFullYear();
			var max = min + 4;
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
		buildEntityPath: function (sEntityName, oEntity) {
			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity.HCP_NEGO_REPORT_ID + "l)";
			}
		},
		updateTablePrice: function () {

			var oCreateModel = this.getView().getModel("editNegotiationReportModel");
			var oData = oCreateModel.getProperty("/");
			var oModel = this.getOwnerComponent().getModel();
			var aFilters = [];
			var oFieldMont = "PRECO_" + oData.HCP_MONTH;
			var self = this;
			var oCurrData = new Date();

			oCurrData.setHours(0);
			oCurrData.setSeconds(0);
			oCurrData.setMinutes(0);

			if (oData.HCP_BUYER_GROUP && oData.HCP_CENTER && oData.HCP_STATE && oData.HCP_MATERIAL && oData.HCP_YEAR &&
				oData.HCP_MONTH) {

				this.setBusyDialog("Relato de negócios", "Consultando Tabela de Preços para o centro. Aguarde!");

				aFilters.push(new sap.ui.model.Filter({
					path: "EKGRP",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_BUYER_GROUP
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
											var calcSC = ((freteDigitado * 60) / 1000) + oData.HCP_PRICE;
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
							//oCreateModel.setProperty("/enableCreate", true);
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
				//oCreateModel.setProperty("/enableCreate", true);
			}
		},
		_validateIncoterms: function () {

			var oEditModel = this.getView().getModel("editNegotiationReportModel");
			var oData = oEditModel.getProperty("/");

			if (oData.HCP_INCOTERMS == 2) {
				oEditModel.setProperty("/enableFreight", true);
			} else {
				oEditModel.setProperty("/enableFreight", false);
				oEditModel.setProperty("/HCP_VALUE_FREIGHT", null);
			}

			this._validateForm();
		},

		_validatePayment: function () {

			var oEditModel = this.getView().getModel("editNegotiationReportModel");
			var oData = oEditModel.getProperty("/");

			if (oData.HCP_PAYMENT_TERM == 0) {
				oEditModel.setProperty("/enableDaysQuantity", true);
			} else {
				oEditModel.setProperty("/enableDaysQuantity", false);
				oEditModel.setProperty("/HCP_NUMBER_DAYS", null);
			}

			this._validateForm();
		},
		_onInputBuyerProsp: function (oEvent) {

			var oModelCreate = this.getView().getModel("editNegotiationReportModel");
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

		}
	});
});