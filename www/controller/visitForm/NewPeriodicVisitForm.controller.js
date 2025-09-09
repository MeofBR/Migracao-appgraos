sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/List',
	'sap/m/StandardListItem',
	"sap/ui/core/routing/History",
	'com/sap/build/standard/brfAppDeGraosModoEditar/controls/CustomComboBox',
	'com/sap/build/standard/brfAppDeGraosModoEditar/controls/CustomSlider'
], function (MainController, MessageBox, JSONModel, Button, Dialog, List, StandardListItem, History, CustomComboBox) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.visitForm.NewPeriodicVisitForm", {

		onInit: function () {

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("visitForm.NewPeriodicVisitForm").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				toolsInputs: [],
				certificationsInputs: [],
				cultureType: [],
				storedProductInputs: [],
				criterionsInputs: [],
				yesOthersTools: false,
				yesOthersCriterion: false,
				yesOthersCertication: false,
				HCP_CHECK_MANUAL_TAB: 1,
				// HCP_SCHEDULE_NEXT_VISIT: 1,
				HCP_FIXED_PRICE: 0,
				HCP_OPEN_PRICE: 0,
				edit: false,
				enableSave: false
			}), "visitFormModel");

			//	var oModelOwner = this.getOwnerComponent().getModel();
			//	oModelOwner.refresh(true);
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

			}.bind(this));
			var oCreateModelPeriodic = this.getView().getModel("visitFormModel");
			var oModel = this.getView().getModel();

			if (oEvent.getParameter("data")) {

				var sKeyData = oEvent.getParameter("data").keyData;
				var aKeyData = JSON.parse(decodeURIComponent(sKeyData));

				this.clearContainers("newCultureSimpleForm");

				// if (!aKeyData.HCP_UNIQUE_KEY) {
				var aProperties = {
					toolsInputs: [],
					certificationsInputs: [],
					cultureType: [],
					yesOthersTools: false,
					yesOthersCriterion: false,
					yesOthersCertication: false,
					HCP_CHECK_MANUAL_TAB: 1,
					// HCP_SCHEDULE_NEXT_VISIT: 1,
					HCP_FIXED_PRICE: 0,
					HCP_OPEN_PRICE: 0,
					enableSave: false
				};

				for (var key in aProperties) {
					aKeyData[key] = aProperties[key];
				}

				oCreateModelPeriodic.setProperty("/", aKeyData);

				// } else {

				// 	oCreateModelPeriodic.setProperty("/", aKeyData);
				// this.searchFieldValues();
				// this.searchValuesCertifications(oModel, false);
				// this.searchValuesTools(oModel, false);
				// this.searchValuesMaterial();
				// this._validateForm();
				// }

				// this.clearContainers("newMaterialSimpleForm");
			}

			//this.insertTemplateCultureType();
			this.initForm();

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				create: true,
				edit: true
			}), "profileModel");

			var oData = oCreateModelPeriodic.oData;

			this._getProviderName(oData.HCP_PROVIDER_ID).then(function (nameRegistered) {

				oCreateModelPeriodic.setProperty("/HCP_NAME_REGISTERED", nameRegistered);

			}.bind(this)).catch(function (error) {
				console.log(error);
			}.bind(this));

		},

		searchValuesCultureAPTP: function () {

			let oModelVisit = this.getView().getModel();
			let oEditModel = this.getView().getModel("visitFormModel");
			let oData = oEditModel.oData;
			let oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			let oCharTemplate;
			let aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_PROVIDER_ID",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_PROVIDER_ID
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_VISIT_TYPE",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: "Yearly"
			}));

			oModelVisit.read("/Visit_Culture_Type", {

				filters: aFilters,
				success: function (results) {

					var aResults = results.results;

					for (var i = aResults.length - 1; i < aResults.length; i++) {
						oEditModel.setProperty("/cultureType/" + 0 + "/HCP_HECTARE_PLANT_AREA", aResults[i].HCP_HECTARE_PLANT_AREA);
						oEditModel.setProperty("/cultureType/" + 0 + "/HCP_PRODUCTIVITY", aResults[i].HCP_PRODUCTIVITY);
						oEditModel.setProperty("/cultureType/" + 0 + "/HCP_PRODUCTIVITY_TOTAL", aResults[i].HCP_PRODUCTIVITY_TOTAL);

						if (aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
							oEditModel.setProperty("/cultureType/" + 0 + "/@com.sap.vocabularies.Offline.v1.isLocal", true);
							oEditModel.setProperty("/cultureType/" + 0 + "/__metadata", aResults[i].__metadata);
						}
					}
					oEditModel.refresh();
					this.closeBusyDialog();

				}.bind(this),
				error: function (error) {

				}
			});
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

		insertTemplateCultureType: function () {

			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var oCharTemplate;

			oCharTemplate = this.buildCultureTypeTemplate();

			oMainDataForm[12].addContent(new sap.m.Label({
				text: ""
			}));

			oMainDataForm[12].addContent(oCharTemplate);

		},

		navBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oVisitModel = this.getView().getModel("visitFormModel");

			oVisitModel.setProperty("/", []);

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}

		},

		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
					sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},

		onCancelPress: function () {
			var oVisitModel = this.getView().getModel("visitFormModel");
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

		_getPeriod: function () {

			var oDate = new Date();
			var oYear = oDate.getFullYear();

			oDate.setHours(0, 0, 0);
			oDate.setDate(oDate.getDate() + 4 - (oDate.getDay() || 7));

			var oWeek = Math.ceil((((oDate - new Date(oDate.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
			var oPeriod = oWeek + "/" + oYear;
			return oPeriod;

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

		_calculateCommercializationCulture: async function (oProperties) {
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			let visitType = "Periódica";
			
			let sCounter = 0;
			var sTimestamp = new Date().getTime() + sCounter;
			sCounter = sCounter + 1;

			let cropId;
			
			const getSafraDesc = new Promise((resolve, reject) => {
				let serviceGetCrop = "/Crop_Year(" + oProperties.HCP_SAFRA_YEAR + ")";
				
				oModel.read(serviceGetCrop, {
					success: function (result) {
						return resolve(result.HCP_CROP_DESC)
					}.bind(this),
					error: function (error) {
						return reject(MessageBox.error("Erro ao Buscar Ano da Safra!"));
					}
				})
			})

			await getSafraDesc.then((crop) => {
				cropId = crop;
			})

			const propertiesCulture = {
				HCP_COMMERCIALIZATION_ID: sTimestamp.toFixed(),
				HCP_PARTNER: oProperties.oData.HCP_NAME_REGISTERED == null ? '' : oProperties.oData.HCP_NAME_REGISTERED,
				HCP_TYPE_COMMERCIALIZATION: visitType,
				HCP_CREATED_AT: new Date(),
				HCP_CREATED_BY: oProperties.HCP_CREATED_BY,
				HCP_CROP_ID: cropId.toString(),
				HCP_CULTURE_TYPE: oProperties.HCP_CULTURE_TYPE,
				HCP_PRODUCTIVITY_TOTAL: parseFloat(oProperties.HCP_PRODUCTIVITY_TOTAL).toFixed(2),
				HCP_COMMERCIALIZED_CROP: oProperties.HCP_SAFRA_PERCENTAGE.toString(),
				HCP_NEW_CROP: parseFloat(oProperties.HCP_AVAILABLE_VOLUME).toFixed(2),
				HCP_DESCRIPTION: ''
			}
			
			oModel.create("/Visit_Form_Commercialization", propertiesCulture);
		},

		onSavePress: async function (oEvent) {

			var aUserName = this.userName;
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var aDeferredGroups = oModel.getDeferredGroups();
			var sCounter = 0;
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var oCreateModelPeriodic = this.getView().getModel("visitFormModel");
			var oData = oCreateModelPeriodic.oData;
			let nameFound;

			if (!oData.HCP_UNIQUE_KEY) {
				this.uniqueKey = this.generateUniqueKey();
			} else {
				this.uniqueKey = oData.HCP_UNIQUE_KEY;
			}

			this.period = this._getPeriod();

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

			var sTimestamp = new Date().getTime() + sCounter;
			sCounter = sCounter + 1;

			var aData = {
				HCP_VISIT_ID: sTimestamp.toFixed(),
				HCP_PROVIDER_ID: oData.HCP_PROVIDER_ID,
				HCP_CONTACT_TYPE: oData.HCP_CONTACT_TYPE,
				HCP_CONTACT_INICIATIVE: oData.HCP_CONTACT_INICIATIVE,
				HCP_VISIT_FORM: oData.HCP_VISIT_FORM,
				HCP_UNIQUE_KEY: this.uniqueKey,
				HCP_PERIOD: this.period,
				HCP_CONTRACT_MODALITY: oData.HCP_CONTRACT_MODALITY,
				// HCP_AVAILABLE_VOLUME: oData.HCP_AVAILABLE_VOLUME,
				HCP_FIXED_PRICE: oData.HCP_FIXED_PRICE,
				HCP_OPEN_PRICE: oData.HCP_OPEN_PRICE,
				// HCP_CRITERION: oData.HCP_CRITERION,
				// HCP_OTHER_CRITERION: oData.HCP_OTHER_CRITERION,
				HCP_DECISION_FACTOR: oData.HCP_DECISION_FACTOR,
				HCP_REPORT_VISIT: oData.HCP_REPORT_VISIT,
				HCP_CHECK_MANUAL_TAB: oData.HCP_CHECK_MANUAL_TAB,
				// HCP_SCHEDULE_NEXT_VISIT: oData.HCP_SCHEDULE_NEXT_VISIT,
				HCP_CREATED_BY: aUserName,
				HCP_UPDATED_BY: aUserName,
				HCP_CREATED_AT: new Date(),
				HCP_UPDATED_AT: new Date(),
				HCP_INTERACTION_OBJECTIVE: oData.HCP_INTERACTION_OBJECTIVE,
				HCP_NAME_REGISTERED: nameFound
			};

			oModel.createEntry("/Visit_Form_Periodic", {
				properties: aData
			}, {
				groupId: "changes"
			});

			//Certificações
			for (var i = 0; i < oData.certificationsInputs.length; i++) {
				var sCertificationKey = new Date().getTime() + sCounter;
				sCounter = sCounter + 1;

				var aDataCertificationsInput = {
					HCP_VISIT_ID: sCertificationKey.toFixed(),
					HCP_PROVIDER_ID: oData.HCP_PROVIDER_ID,
					HCP_CONTACT_TYPE: oData.HCP_CONTACT_TYPE,
					HCP_CONTACT_INICIATIVE: oData.HCP_CONTACT_INICIATIVE,
					HCP_VISIT_FORM: oData.HCP_VISIT_FORM,
					HCP_VISIT_TYPE: "Periodic",
					HCP_UNIQUE_KEY: this.uniqueKey,
					HCP_PERIOD: this.period,
					HCP_CERTIFICATION: oData.certificationsInputs[i],
					HCP_OTHERS: oData.certificationsInputs[i] === "11" ? oData.HCP_OTHERS : null,
					HCP_CREATED_BY: aUserName,
					HCP_UPDATED_BY: aUserName,
					HCP_CREATED_AT: new Date(),
					HCP_UPDATED_AT: new Date()
				};

				oModel.createEntry("/Visit_Form_Certifications", {
					properties: aDataCertificationsInput
				}, {
					groupId: "changes"
				});
			}

			//Critérios Comercialização Volume
			for (var i = 0; i < oData.criterionsInputs.length; i++) {
				var sCriterionKey = new Date().getTime() + sCounter;
				sCounter = sCounter + 1;

				var aDataCriterionsInputs = {
					HCP_VISIT_ID: sCriterionKey.toFixed(),
					HCP_PROVIDER_ID: oData.HCP_PROVIDER_ID,
					HCP_CONTACT_TYPE: oData.HCP_CONTACT_TYPE,
					HCP_CONTACT_INICIATIVE: oData.HCP_CONTACT_INICIATIVE,
					HCP_VISIT_FORM: oData.HCP_VISIT_FORM,
					HCP_VISIT_TYPE: "Periodic",
					HCP_UNIQUE_KEY: this.uniqueKey,
					HCP_PERIOD: this.period,
					HCP_CRITERION: oData.criterionsInputs[i],
					HCP_OTHERS: oData.criterionsInputs[i] === "6" ? oData.HCP_OTHERS_CRITERION : null,
					HCP_CREATED_BY: aUserName,
					HCP_UPDATED_BY: aUserName,
					HCP_CREATED_AT: new Date(),
					HCP_UPDATED_AT: new Date()
				};

				oModel.createEntry("/Visit_Form_Criterion", {
					properties: aDataCriterionsInputs
				}, {
					groupId: "changes"
				});
			}

			//Tipos de negociação(Ferramentas)
			for (var i = 0; i < oData.toolsInputs.length; i++) {
				var sToolsKey = new Date().getTime() + sCounter;
				sCounter = sCounter + 1;

				var aDataToolsInput = {
					HCP_VISIT_ID: sToolsKey.toFixed(),
					HCP_PROVIDER_ID: oData.HCP_PROVIDER_ID,
					HCP_CONTACT_TYPE: oData.HCP_CONTACT_TYPE,
					HCP_CONTACT_INICIATIVE: oData.HCP_CONTACT_INICIATIVE,
					HCP_VISIT_FORM: oData.HCP_VISIT_FORM,
					HCP_VISIT_TYPE: "Periodic",
					HCP_UNIQUE_KEY: this.uniqueKey,
					HCP_PERIOD: this.period,
					HCP_TOOLS: oData.toolsInputs[i],
					HCP_OTHERS: oData.toolsInputs[i] === "8" ? oData.HCP_OTHERS_TOOLS : null,
					HCP_CREATED_BY: aUserName,
					HCP_UPDATED_BY: aUserName,
					HCP_CREATED_AT: new Date(),
					HCP_UPDATED_AT: new Date()
				};

				oModel.createEntry("/Visit_Form_Tools", {
					properties: aDataToolsInput
				}, {
					groupId: "changes"
				});
			}

			//Local de Armanezamento do Produto
			for (var i = 0; i < oData.storedProductInputs.length; i++) {
				var sStoredKey = new Date().getTime() + sCounter;
				sCounter = sCounter + 1;

				var aDataNegotiationInput = {
					HCP_VISIT_ID: sStoredKey.toFixed(),
					HCP_PROVIDER_ID: oData.HCP_PROVIDER_ID,
					HCP_CONTACT_TYPE: oData.HCP_CONTACT_TYPE,
					HCP_CONTACT_INICIATIVE: oData.HCP_CONTACT_INICIATIVE,
					HCP_VISIT_TYPE: "Periodic",
					HCP_VISIT_FORM: oData.HCP_VISIT_FORM,
					HCP_UNIQUE_KEY: this.uniqueKey,
					HCP_PERIOD: this.period,
					HCP_STORAGE_STRUCTURE: oData.storedProductInputs[i],
					HCP_DESC_STORAGE_TYPE: oData.HCP_DESC_STORAGE_TYPE,
					HCP_CREATED_BY: aUserName,
					HCP_UPDATED_BY: aUserName,
					HCP_CREATED_AT: new Date(),
					HCP_UPDATED_AT: new Date()
				};

				oModel.createEntry("/Visit_Storage_Type", {
					properties: aDataNegotiationInput
				}, {
					groupId: "changes"
				});
			}

			//Tipo de Cultura
			for (var i = 0; i < oData.cultureType.length; i++) {
				var sCultureKey = new Date().getTime() + sCounter;
				sCounter = sCounter + 1;

				if (oData.cultureType[i].status === "New") {

					var aDataCultureType = {
						HCP_VISIT_ID: sCultureKey.toFixed(),
						HCP_PROVIDER_ID: oData.HCP_PROVIDER_ID,
						HCP_CONTACT_TYPE: oData.HCP_CONTACT_TYPE,
						HCP_CONTACT_INICIATIVE: oData.HCP_CONTACT_INICIATIVE,
						HCP_VISIT_FORM: oData.HCP_VISIT_FORM,
						HCP_UNIQUE_KEY: this.uniqueKey,
						HCP_PERIOD: this.period,
						HCP_VISIT_TYPE: "Periodic",
						HCP_CULTURE_TYPE: oData.cultureType[i].HCP_CULTURE_TYPE,
						HCP_SAFRA_YEAR: oData.cultureType[i].HCP_SAFRA_YEAR,
						HCP_SAFRA_PERCENTAGE: oData.cultureType[i].HCP_SAFRA_PERCENTAGE,
						HCP_HECTARE_PLANT_AREA: parseFloat(oData.cultureType[i].HCP_HECTARE_PLANT_AREA).toFixed(2),
						HCP_PRODUCTIVITY: parseFloat(oData.cultureType[i].HCP_PRODUCTIVITY).toFixed(2),
						HCP_PRODUCTIVITY_TOTAL: parseFloat(oData.cultureType[i].HCP_PRODUCTIVITY_TOTAL).toFixed(2),
						HCP_AVAILABLE_VOLUME: parseFloat(oData.cultureType[i].HCP_AVAILABLE_VOLUME).toFixed(2),
						HCP_OPEN_PRICE: oData.cultureType[i].HCP_OPEN_PRICE,
						HCP_FIXED_PRICE: oData.cultureType[i].HCP_FIXED_PRICE,
						HCP_CREATED_BY: aUserName,
						HCP_UPDATED_BY: aUserName,
						HCP_CREATED_AT: new Date(),
						HCP_UPDATED_AT: new Date()
					};

					oModel.createEntry("/Visit_Culture_Type", {
						properties: aDataCultureType
					}, {
						groupId: "changes"
					});
					
					this._calculateCommercializationCulture({...aDataCultureType, oData});
				}
			}
			this.setBusyDialog("Ficha de Visita", "Salvando");
			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				oModel.submitChanges({
					groupId: "changes",
					success: function (data) {
						this.flushStore(
							"Visit_Form_Periodic,Visit_Form_Certifications,Visit_Storage_Type,Visit_Form_Tools,Visit_Culture_Type,Visit_Form_Criterion"
						).then(function () {
							this.refreshStore("Visit_Form_Periodic", "Visit_Form_Certifications", "Visit_Storage_Type",
							"Visit_Form_Tools", "Visit_Culture_Type", "Visit_Form_Criterion").then(async function () {
								if(this.validateSubmiteChange(data))
									this.updateSimplifyContact(this.getView().getModel("visitFormModel").oData.HCP_PROVIDER_ID, this.getView().getModel("visitFormModel").oData.HCP_NAME_REGISTERED);
								if(await this.prepareEqualize(this.getView().getModel("visitFormModel").oData, 'Periodic')){
									MessageBox.success(
										"Ficha de visita cadastrada com sucesso!\n\nAtualizações replicadas na Ficha Anual.", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.closeBusyDialog();
												this.redirectYearly();
												// this.backToIndex();
											}.bind(this)
										}
									);
								}
								else{
									MessageBox.success(
										"Ficha de visita cadastrada com sucesso!", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.closeBusyDialog();
												this.redirectYearly();
												// this.backToIndex();
											}.bind(this)
										}
									);
								}
							}.bind(this));
						}.bind(this));
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
			} else {
				oModel.submitChanges({
					groupId: "changes",
					success: async function (data) {
						if(this.validateSubmiteChange(data))
							this.updateSimplifyContact(this.getView().getModel("visitFormModel").oData.HCP_PROVIDER_ID, this.getView().getModel("visitFormModel").oData.HCP_NAME_REGISTERED);
						if(await this.prepareEqualize(this.getView().getModel("visitFormModel").oData, 'Periodic')){
							MessageBox.success(
								"Ficha de visita cadastrada com sucesso!\n\nAtualizações replicadas na Ficha Anual.", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
										this.redirectYearly();
										// this.backToIndex();
									}.bind(this)
								}
							);
						}
						else{
							MessageBox.success(
								"Ficha de visita cadastrada com sucesso!", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
										this.redirectYearly();
										// this.backToIndex();
									}.bind(this)
								}
							);
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
			}
		},

		buildEntityPath: function (sEntityName, oEntity) {

			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity.HCP_VISIT_ID + "l)";
			}
		},

		redirectYearly: function (oEvent) {

			var oModelVisit = this.getView().getModel();
			var aFilters = [];
			var aSortes = [];
			var oCreateModelPeriodic = this.getView().getModel("visitFormModel");
			var oData = oCreateModelPeriodic.oData;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var sPath;
			var aData;

			if (oData.HCP_CHECK_MANUAL_TAB == 1) {

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_PROVIDER_ID',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_PROVIDER_ID
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_CONTACT_TYPE',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_CONTACT_TYPE
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_CONTACT_INICIATIVE',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_CONTACT_INICIATIVE
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_VISIT_FORM',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_VISIT_FORM
				}));

				aSortes.push(new sap.ui.model.Sorter({
					path: "HCP_CREATED_AT",
					descending: true
				}));

				aSortes.push(new sap.ui.model.Sorter({
					path: "HCP_VISIT_ID",
					descending: true
				}));
				oModelVisit.read("/Visit_Form_Yearly", {

					filters: aFilters,
					sorters: aSortes,

					success: function (result) {
						var oVisit = result.results;
						if (oVisit.length > 0) {

							// sPath = "/Visit_Form_Yearly(" + oVisit[0].HCP_VISIT_ID + "l)";
							// aData = this.getView().getModel().getProperty(sPath);
							sPath = this.buildEntityPath("Visit_Form_Yearly", oVisit[0]);

							MessageBox.success(
								"Você será redirecionado para a Ficha de Visitas Anual!", {
									actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
									styleClass: bCompact ? "sapUiSizeCompact" : "",
									onClose: function (sAction) {
										if (sAction === "YES") {

											// this.oRouter.navTo("visitForm.EditYearlyVisitForm", {
											// 	keyData: encodeURIComponent(sPath)
											// }, false);

											this.oRouter.navTo("visitForm.EditYearlyVisitForm", {
												keyData: encodeURIComponent(sPath)
											});
										}
									}.bind(this)
								}
							);

						} else {
							MessageBox.success(
								"Ficha de Visitas Anual não encontrada!", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
										this.backToIndex();
									}.bind(this)
								}
							);
						}
					}.bind(this),
					error: function () {
						MessageBox.success(
							"Falha ao Buscar Acompanhamentos!", {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									this.closeBusyDialog();
									this.backToIndex();
								}.bind(this)
							}
						);
					}
				});

			} else {
				this.backToIndex();
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

		initForm: function (oEvent) {
			var oFormId = 'newCultureSimpleForm';
			var oForm = this.getView().byId(oFormId);
			var oCharTemplate;
			var oText;

			oCharTemplate = this.buildCultureTypeTemplate();
			oForm.addContent(new sap.m.Label({
				text: ""
			}));
			oForm.addContent(oCharTemplate);
			this._validateForm();
		},

		_onAddCultureType: function (oEvent) {

			var oButton = oEvent.getSource();
			var oFormId = oButton.getCustomData()[0].getValue();
			var oForm = this.getView().byId(oFormId);

			MessageBox.information(
				"Deseja adicionar um novo tipo de cultura?", {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					onClose: function (sAction) {
						if (sAction === "YES") {
							oForm.addContent(new sap.m.Label({
								text: ""
							}));
							this.searchValuesCultureAPTP();
							oForm.addContent(this.buildCultureTypeTemplate());
							this._validateForm();
						}
					}.bind(this)
				}
			);
		},
		
		_calculateTotalBalance: function (oProperty) {
			var oVisitModel = this.getView().getModel("visitFormModel");
			var oSource = oProperty.getSource();
			var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
			var oData = oVisitModel.getProperty(sPath);
			var sTotal;
			
			let oValueInput = oProperty.getParameters().value;
			let oInputName = oProperty.getSource().getName();
		
			this._valideInputNumber(oProperty);
		
			if (oValueInput === '' || oValueInput === "") {
				oData[oInputName]  = "0";
			}

			let tradedBalance = oData.HCP_SAFRA_PERCENTAGE / 100

			sTotal = oData.HCP_PRODUCTIVITY_TOTAL * (1 - tradedBalance);
			oData["HCP_AVAILABLE_VOLUME"] = sTotal;
			oVisitModel.refresh();

			this._validateForm(oProperty);
		},

		buildCultureTypeTemplate: function () {

			var oVisitFormModel = this.getView().getModel("visitFormModel");
			var oData = oVisitFormModel.oData;
			var sChars = oVisitFormModel.getProperty("/cultureType");
			var sCounter = oData.cultureType.length + 1;
			var aCustomData = [];
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

			var oItemTemplateCultureType = new sap.ui.core.ListItem({
				key: "{MATNR}",
				text: "{= parseFloat(${MATNR}) } - {MAKTX}"
			});

			var oItemTemplateSafraYear = new sap.ui.core.ListItem({
				key: "{HCP_CROP_ID}",
				text: "{HCP_CROP_DESC}"
			});

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
						editable: true,
						emptySpanM: 0,
						emptySpanL: 0,
						emptySpanL: 0,
						emptySpanXL: 0,
						labelSpanM: 3,
						labelSpanL: 3,
						labelSpanXL: 3,
						singleContainerFullSize: false,
						adjustLabelSpan: false,
						backgroundDesign: "Solid",
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
								selectedKey: "{visitFormModel>/cultureType/" + sCharLength + "/HCP_CULTURE_TYPE}",
								placeholder: "Selecione o Tipo de Cultura",
								name: "HCP_CULTURE_TYPE",
								editable: true,
								enabled: true,
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
								selectedKey: "{visitFormModel>/cultureType/" + sCharLength + "/HCP_SAFRA_YEAR}",
								placeholder: "Selecione Ano da Safra",
								name: "HCP_SAFRA_YEAR",
								editable: true,
								enabled: true,
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
								text: "{i18n>textPlantingArea}",
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),

							new sap.m.Input({
								value: "{ path: 'visitFormModel>/cultureType/" + sCharLength +
									"/HCP_HECTARE_PLANT_AREA' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								editable: "{visitFormModel>/isEnable}",
								enabled: "{visitFormModel>/isEnable}",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true,
								name: "HCP_HECTARE_PLANT_AREA",
								placeholder: "{i18n>textEnterPlantingArea}",
								change: this._calculateProducTotal.bind(this)
							}),
							new sap.m.Label({
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true,
								text: "{i18n>textAvProductivity}"
							}),
							new sap.m.Input({
								value: "{ path: 'visitFormModel>/cultureType/" + sCharLength +
									"/HCP_PRODUCTIVITY' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_PRODUCTIVITY",
								width: "100%",
								editable: "{visitFormModel>/isEnable}",
								enabled: "{visitFormModel>/isEnable}",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true,
								placeholder: "{i18n>textEnterAvProdctivity}",
								change: this._calculateProducTotal.bind(this)
							}),
							new sap.m.Label({
								design: "Standard",
								width: "100%",
								enabled: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true,
								text: "{i18n>textTotProductivity}"
							}),
							new sap.m.Input({
								value: "{ path: 'visitFormModel>/cultureType/" + sCharLength +
									"/HCP_PRODUCTIVITY_TOTAL' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_PRODUCTIVITY_TOTAL",
								width: "100%",
								enabled: false,
								editable: "{visitFormModel>/isEnable}",
								textAlign: "Begin",
								textDirection: "Inherit",
								change: this._calculateProducTotal.bind(this),
								visible: true
							}),
							new sap.m.Label({
								text: "% da Safra Comercializada",
								design: "Standard",
								width: "100%",
								required: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),
							new com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomSlider({
								min: 0,
								max: 100,
								value: "{visitFormModel>/cultureType/" + sCharLength + "/HCP_SAFRA_PERCENTAGE}",
								Step: 1,
								progress: true,
								width: "100%",
								change: this._calculateProducTotal.bind(this),
								layoutData: [
									new sap.ui.layout.GridData({
										span: "L9 M9 S9"
									})
								]
							}),
							new sap.m.NumericContent({
								animateTextChange: true,
								value: "{visitFormModel>/cultureType/" + sCharLength + "/HCP_SAFRA_PERCENTAGE}",
								scale: "%",
								withMargin: true,
								nullifyValue: true,
								layoutData: [
									new sap.ui.layout.GridData({
										span: "L3 M3 S3"
									})
								]
							}).addStyleClass("percentageIndicator"),
							new sap.m.Label({
								text: "Saldo/Volume Disponível para Venda(T)",
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),
							new sap.m.Input({
								value: "{ path: 'visitFormModel>/cultureType/" + sCharLength +
									"/HCP_AVAILABLE_VOLUME' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true,
								name: "HCP_AVAILABLE_VOLUME",
								placeholder: "Digite em Toneladas (Ex: 100)",
								enabled: false,
								change: this._calculateProducTotal.bind(this)
							}),
							new sap.m.Label({
								text: "% de Venda com Preço Fixo?",
								design: "Standard",
								width: "100%",
								required: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),
							new com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomSlider({
								min: 0,
								max: 100,
								value: "{visitFormModel>/cultureType/" + sCharLength + "/HCP_FIXED_PRICE}",
								Step: 1,
								progress: true,
								width: "100%",
								name: "HCP_FIXED_PRICE",
								liveChange: this._calculateTotalPrice.bind(this),
								layoutData: [
									new sap.ui.layout.GridData({
										span: "L9 M9 S9"
									})
								]
							}),
							new sap.m.NumericContent({
								animateTextChange: true,
								value: "{visitFormModel>/cultureType/" + sCharLength + "/HCP_FIXED_PRICE}",
								scale: "%",
								withMargin: true,
								nullifyValue: true,
								layoutData: [
									new sap.ui.layout.GridData({
										span: "L3 M3 S3"
									})
								]
							}).addStyleClass("percentageIndicator"),

							new sap.m.Label({
								text: "% de Venda com Preço Aberto (Depósito)?",
								design: "Standard",
								width: "100%",
								required: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),
							new com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomSlider({
								min: 0,
								max: 100,
								value: "{visitFormModel>/cultureType/" + sCharLength + "/HCP_OPEN_PRICE}",
								Step: 1,
								progress: true,
								width: "100%",
								name: "HCP_OPEN_PRICE",
								liveChange: this._calculateTotalPrice.bind(this),
								layoutData: [
									new sap.ui.layout.GridData({
										span: "L9 M9 S9"
									})
								]
							}),
							new sap.m.NumericContent({
								animateTextChange: true,
								value: "{visitFormModel>/cultureType/" + sCharLength + "/HCP_OPEN_PRICE}",
								scale: "%",
								withMargin: true,
								nullifyValue: true,
								layoutData: [
									new sap.ui.layout.GridData({
										span: "L3 M3 S3"
									})
								]
							}).addStyleClass("percentageIndicator")
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
							press: this.removeCultureType.bind(this)
						})
					]
				}));
			}

			oVisitFormModel.oData.cultureType[sCharLength].HCP_SAFRA_PERCENTAGE = 0;

			return oTemplate;

		},

		_validateCultureInput: function (oProperty) {

			var oVisitModel = this.getView().getModel("visitFormModel");
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
				oVisitModel.setProperty("/enableSave", false);
			} else {
				this.lookForDuplicities(oSource, oDataNewCulture, oNumber);
				this._validateForm();
			}
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
			var oModelYearly = this.getView().getModel("visitFormModel");
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

			this._calculateTotalBalance(oProperty);
			this._validateForm(oProperty);
		},

		_valideInputNumber: function (oProperty) {

			var oModelYearly = this.getView().getModel("visitFormModel");
			var oSource = oProperty.getSource();
			var sName = oSource.getName();
			var oData;
			var sValue;

			var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
			oData = oModelYearly.getProperty(sPath);
			
			if (oProperty.mParameters.id.includes('input') === true) {
				sValue = oProperty.mParameters.newValue;
				sValue = sValue.replace(/[^0-9,]/g, "");
				oSource.setValue(sValue);
				this._validateForm(oProperty);
			} else {
				sValue = oProperty.mParameters.value;
				oSource.setValue(sValue);
				this._validateForm();
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

		generateUniqueKey: function () {
			return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
				(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
			);
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

		getCultureTypes: function (sUniqueKey) {
			var oModel = this.getView().getModel("visitFormModel");
			var oCultureType = oModel.getProperty("/Culture_Type");
			var oChars = [];
			if (oCultureType) {
				var oValidCultureType = oCultureType.filter(culturetype => culturetype.status === "New");

				if (oValidCultureType) {
					for (var char of oValidCultureType) {

						var sTimestamp = new Date().getTime();

						oChars.push({
							HCP_CULTURE_TYPE_ID: sTimestamp.toFixed(),
							HCP_UNIQUE_KEY: sUniqueKey,
							HCP_CULTURE_TYPE: char.CULTURE_TYPE,
							HCP_CROP_YEAR: char.CROP_YEAR,
							HCP_CROP_PERCENTAGE: char.CROP_PERCENTAGE,
							HCP_OPEN_PRICE: char.HCP_OPEN_PRICE,
							HCP_FIXED_PRICE: char.HCP_FIXED_PRICE,
							HCP_UPDATED_AT: this._formatDate(new Date()),
							HCP_CREATED_AT: this._formatDate(new Date())
						});
					}
				}
			}
			return oChars;
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

		_getTextsFields: function () {
			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var oCutureTypeDataForm = this.byId("cutureTypeDataSimpleForm").getContent();

			var oCultureType = this.getCultureTypeFields();

			var oAllForms = oMainDataForm.concat(oCutureTypeDataForm).concat(oCultureType);
			var aControls = [];
			var sControlType;

			for (var i = 0; i < oAllForms.length; i++) {
				var sControlType1 = oAllForms[i].getMetadata().getName();
				if (sControlType1 === "sap.m.Label") {
					if (sControlType = oAllForms[i + 1]) {
						sControlType = oAllForms[i + 1].getMetadata().getName();
						if (sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" || sControlType === "sap.m.Input" ||
							sControlType === "sap.m.DateTimeInput" || sControlType === "sap.m.DatePicker" ||
							sControlType === "sap.m.CheckBox" || sControlType === "sap.m.MaskInput" || sControlType === "sap.m.ComboBox" || sControlType ===
							"sap.m.MultiComboBox") {
							aControls.push({
								control: oAllForms[i + 1],
								required: oAllForms[i].getRequired(),
								text: oAllForms[i].getText()
							});
						}
					}

				}
			}
			return aControls;
		},

		_calculateTotalPrice: function (oProperty) {

			var oModelPeriodic = this.getView().getModel("visitFormModel");
			var oPrice;
			var oSource = oProperty.getSource();
			var sName = oSource.getName();
			var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();

			var field = oModelPeriodic.getProperty(sPath);

			if (sName === "HCP_OPEN_PRICE") {
				oPrice = 100 - field.HCP_OPEN_PRICE;
				field.HCP_FIXED_PRICE = oPrice;
			} else {
				oPrice = 100 - field.HCP_FIXED_PRICE;
				field.HCP_OPEN_PRICE = oPrice;
			}

			this._validateForm();
		},

		_validateInputCriterion: function () {

			var oCreateModelPeriodic = this.getView().getModel("visitFormModel");
			var oData = oCreateModelPeriodic.oData;
			var oOthers = oData.HCP_OTHER_CRITERION;

			oCreateModelPeriodic.setProperty("/yesOthersCriterion", false);
			oCreateModelPeriodic.setProperty("/HCP_OTHER_CRITERION", null);

			if (oData.HCP_CRITERION === '6') {
				oCreateModelPeriodic.setProperty("/yesOthersCriterion", true);
				oCreateModelPeriodic.setProperty("/HCP_OTHER_CRITERION", oOthers);
				return;
			} else {
				oCreateModelPeriodic.setProperty("/yesOthersCriterion", false);
			}

			this._validateForm();
		},

		_validateInputCertification: function () {

			var oModelPeriodic = this.getView().getModel("visitFormModel");
			var oData = oModelPeriodic.oData;
			var oOthers = oData.HCP_OTHERS;

			oModelPeriodic.setProperty("/yesOthersCertication", false);
			oModelPeriodic.setProperty("/HCP_OTHERS", null);

			for (var i = 0; i < oData.certificationsInputs.length; i++) {

				if (oData.certificationsInputs[i] === '11') {
					oModelPeriodic.setProperty("/yesOthersCertication", true);
					oModelPeriodic.setProperty("/HCP_OTHERS", oOthers);
					return;
				} else {
					oModelPeriodic.setProperty("/yesOthersCertication", false);
				}
			}

			this._validateForm();
		},

		_getFormFields: function () {
			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var oMaterialFormFields = this.getDynamicFormFields(this.getView().byId("newCultureSimpleForm")) || [];
			var aControls = [];
			var sControlType;

			var oAllFields = oMainDataForm.concat(oMaterialFormFields);

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

		getCultureTypeFields: function () {
			var oCharDataFormContent = this.getView().byId("cutureTypeDataSimpleForm").getContent();
			var oCharContainers = oCharDataFormContent.filter(control => control.getMetadata().getName() === "sap.m.VBox");
			var aControls = [];

			if (oCharContainers) {
				for (var container of oCharContainers) {
					var oContainerItems = container.getItems()[0].getContent();
					aControls = aControls.concat(oContainerItems);
				}
			}
			return aControls;
		},
		onDialogRequiredItems: function (araryFields) {

			var oModel = new JSONModel({});

			this.getView().setModel(oModel, "requiredFields");
			oModel.setProperty("/fields", araryFields);

			if (!this.pressDialog) {
				this.pressDialog = new Dialog({
					title: 'Campos requeridos',
					content: new List({
						items: {
							path: "requiredFields>/fields/",
							template: new StandardListItem({
								title: "{requiredFields>field}",
								info: "Requerido",
								infoState: "Error"

							})
						}
					}),
					beginButton: new Button({
						text: 'Fechar',
						press: function () {
							this.pressDialog.close();
						}.bind(this)
					})
				});

				//to get access to the global model
				this.getView().addDependent(this.pressDialog);
			}

			this.pressDialog.open();
		},

		_validateCriterionInputs: function () {

			var oModelPeriodic = this.getView().getModel("visitFormModel");
			var oData = oModelPeriodic.oData;
			var oOthers = oData.HCP_OTHERS_CRITERION;

			oModelPeriodic.setProperty("/yesOthersCriterion", false);
			oModelPeriodic.setProperty("/HCP_OTHERS_CRITERION", null);

			for (var i = 0; i < oData.criterionsInputs.length; i++) {

				if (oData.criterionsInputs[i] === '6') {
					oModelPeriodic.setProperty("/yesOthersCriterion", true);
					oModelPeriodic.setProperty("/HCP_OTHERS_CRITERION", oOthers);
					return;
				} else {
					oModelPeriodic.setProperty("/yesOthersCriterion", false);
				}
			}

			this._validateForm();

		},

		_validateToolsInputs: function () {

			var oModelPeriodic = this.getView().getModel("visitFormModel");
			var oData = oModelPeriodic.oData;
			var oOthers = oData.HCP_OTHERS_TOOLS;

			oModelPeriodic.setProperty("/yesOthersTools", false);
			oModelPeriodic.setProperty("/HCP_OTHERS_TOOLS", null);

			for (var i = 0; i < oData.toolsInputs.length; i++) {

				if (oData.toolsInputs[i] === '8') {
					oModelPeriodic.setProperty("/yesOthersTools", true);
					oModelPeriodic.setProperty("/HCP_OTHERS_TOOLS", oOthers);
					// 	// return;
					// } else {
					// 	oModelPeriodic.setProperty("/yesOthersTools", false);
				}
			}

			this._validateForm();

		},

		_validateFormSpecialCharacters: function (sErro) {

			setTimeout(function () {
				var oFilterModel = this.getView().getModel("visitFormModel");
				var aInputControls = this._getFormFields();
				var oControl;

				var emoJiRegex =
					/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					var oInputId = aInputControls[m].control.getMetadata();
					if (oInputId.getName() === "sap.m.TextArea") {
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
			var oFilterModel = this.getView().getModel("visitFormModel");
			var aCultureType = oFilterModel.oData.cultureType;

			if (typeof (oProperty) !== 'undefined') {
				let oValueInput = oProperty.getParameters().value;
				let oInputName = oProperty.getSource().getName();
				let oLastValue = oProperty.getSource()._lastValue;

				if (oValueInput === '' || oValueInput === "") {
					oFilterModel.setProperty("/enableSave", false);
					for (var k = 0; k < aCultureType.length; k++) {
						if (oInputName === 'HCP_PRODUCTIVITY' && oLastValue == aCultureType[k].HCP_PRODUCTIVITY) {
							oFilterModel.setProperty("/cultureType/" + k + "/HCP_PRODUCTIVITY", '');
						}
						if (oInputName === 'HCP_HECTARE_PLANT_AREA' && oLastValue == aCultureType[k].HCP_HECTARE_PLANT_AREA) {
							oFilterModel.setProperty("/cultureType/" + k + "/HCP_HECTARE_PLANT_AREA", '');
						}
						if (oInputName === 'HCP_AVAILABLE_VOLUME' && oLastValue == aCultureType[k].HCP_AVAILABLE_VOLUME) {
							oFilterModel.setProperty("/cultureType/" + k + "/HCP_AVAILABLE_VOLUME", '');
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

								if (oControl.mProperties.name === "HCP_FIXED_PRICE" ||
									oControl.mProperties.name === "HCP_OPEN_PRICE") {

									if (oControl.mProperties.value === 0) {
										oLenght = 0;
									}

								} else {
									oLenght = sValue.toString();
								}

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
									if (aCultureType[k].status != "Deleted") {

										if (((typeof (aCultureType[k].HCP_AVAILABLE_VOLUME) === 'undefined') || (aCultureType[k].HCP_AVAILABLE_VOLUME === '') || (
												typeof (aCultureType[k].HCP_CULTURE_TYPE) === 'undefined')) || (aCultureType[k].HCP_CULTURE_TYPE === '') || (typeof (
												aCultureType[k].HCP_HECTARE_PLANT_AREA) === 'undefined') || (aCultureType[k].HCP_HECTARE_PLANT_AREA === '') || (typeof (
												aCultureType[k].HCP_PRODUCTIVITY) === 'undefined') || (aCultureType[k].HCP_PRODUCTIVITY === '') || (typeof (aCultureType[
												k].HCP_SAFRA_YEAR) === 'undefined') || (aCultureType[k].HCP_SAFRA_YEAR === '')) {
											oFilterModel.setProperty("/enableSave", false);
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

		removeCultureType: function (oEvent) {
			var oPropertyModel = this.getView().getModel("visitFormModel");
			var oVBox = oEvent.getSource().getParent().getParent().getParent().getParent().getParent();
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			MessageBox.warning(
				"Tem certeza que deseja remover este tipo de cultura?", {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						if (sAction === "YES") {
							if (oVBox) {
								var sPath = oVBox.getCustomData()[0].getValue();
								var oData = oPropertyModel.getProperty(sPath);
								var oVisitModel = this.getView().getModel("visitFormModel");
								var oVisitData = oVisitModel.oData;

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
		redirectSchedule: function (oEvent) {

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			MessageBox.warning(
				"Gostaria de cadastrar um compromisso? Você será redirecionado para a agenda.", {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						if (sAction === "YES") {
							var oBindingContext = oEvent.getSource().getBindingContext();

							return new Promise(function (fnResolve) {

								this.doNavigate("schedule.Index", oBindingContext, fnResolve, "");
							}.bind(this)).catch(function (err) {
								if (err !== undefined) {
									MessageBox.error(err.message);
								}
							});
						}
					}.bind(this)
				}
			);

		},
		_onAppointmentSelect: function (oEvent) {
			var oModel = this.getView().getModel("visitFormModel");
			var oItem = oEvent.getSource();

			oModel.setProperty("/APPOINTMENT", oItem.getSelectedKey());

		},
		_onYearFormSelect: function (oEvent) {
			var oModel = this.getView().getModel("visitFormModel");
			var oItem = oEvent.getSource();

			oModel.setProperty("/YEAR_FORM", oItem.getSelectedKey());
		}

	});
}, /* bExport= */ true);