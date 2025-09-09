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

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.visitForm.NewGrainsVisitForm", {

		onInit: function () {

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("visitForm.NewGrainsVisitForm").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				toolsInputs: [],
				negotiationFramesInputs: [],
				materialInputs: [],
				criterionsInputs: [],
				certificationsInputs: [],
				HCP_PARTNER_PRODUCERS: 1,
				HCP_OWN_FLEET: 1,
				HCP_PARTNER_BRF_SUP: 1,
				// HCP_SCHEDULE_NEXT_VISIT: 1,
				HCP_PERCENT_OWN_FLEET: 0,
				HCP_STORAGE_STRUCTURE: 1,
				enableCounty: false,
				yesPartner: true,
				yesSiloBag: false,
				HCP_SILOS_BAG: 0,
				noPartner: false,
				yesPartnerBRF: true,
				yesProspect: false,
				yesBartner: true,
				yesStorage: true,
				yesOthersTools: false,
				yesOthersCriterion: false,
				yesOthersCertication: false,
				yesOwnFleet: true,
				edit: false,
				enableSave: false,
				negotiationInputs: [],
				enableCreateRegioValid: true
			}), "grainsVisitModel");

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
			}.bind(this));
			var oCreateModelGrains = this.getView().getModel("grainsVisitModel");
			var oModel = this.getView().getModel();

			this.clearContainers("newMaterialSimpleForm");

			if (oEvent.getParameter("data")) {

				var sKeyData = oEvent.getParameter("data").keyData;
				var aKeyData = JSON.parse(decodeURIComponent(sKeyData));

				var aProperties = {
					negotiationFramesInputs: [],
					materialInputs: [],
					criterionsInputs: [],
					certificationsInputs: [],
					HCP_PARTNER_PRODUCERS: 1,
					HCP_OWN_FLEET: 1,
					HCP_PARTNER_BRF_SUP: 1,
					// HCP_SCHEDULE_NEXT_VISIT: 1,
					HCP_PERCENT_OWN_FLEET: 0,
					HCP_SILOS_BAG: 0,
					enableCounty: false,
					yesPartner: true,
					noPartner: false,
					yesSilosBag: false,
					yesPartnerBRF: true,
					yesStorage: true,
					yesProspect: false,
					yesBartner: true,
					yesOthersTools: false,
					yesOthersCriterion: false,
					yesOthersCertication: false,
					yesOwnFleet: true,
					edit: false,
					enableSave: false,
					negotiationInputs: [],
					enableCreateRegioValid: true
				};

				for (var key in aProperties) {
					aKeyData[key] = aProperties[key];
				}

				oCreateModelGrains.setProperty("/", aKeyData);
				//this.insertTemplateMaterial();
				this._validateForm();

				setTimeout(function () {
					oCreateModelGrains.setProperty("/enableSave", false);
					oCreateModelGrains.setProperty("/edit", false);
				}.bind(this), 150);

			}
			this.initForm();
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				create: true,
				edit: true
			}), "profileModel");

			var oData = oCreateModelGrains.oData;

			this._getProviderName(oData.HCP_PROVIDER_ID).then(function (nameRegistered) {

				oCreateModelGrains.setProperty("/HCP_NAME_REGISTERED", nameRegistered);

			}.bind(this)).catch(function (error) {
				console.log(error);
			}.bind(this));

		},

		_onbarterExchangeFormSelect: function () {

			var oEditModel = this.getView().getModel("grainsVisitModel");
			var oData = oEditModel.oData;

			oEditModel.setProperty("/yesBartner", true);

			if (oData.HCP_PARTNER_PRODUCERS == 0) {
				oEditModel.setProperty("/yesBartner", false);
				oEditModel.setProperty("/HCP_OTHER_BARTER", null);
			}

			this._validateForm();

		},

		_validateToolsInputs: function () {

			var oModelPeriodic = this.getView().getModel("grainsVisitModel");
			var oData = oModelPeriodic.oData;
			var oOthers = oData.HCP_OTHERS_TOOLS;

			oModelPeriodic.setProperty("/yesOthersTools", false);
			oModelPeriodic.setProperty("/HCP_OTHERS_TOOLS", null);

			for (var i = 0; i < oData.toolsInputs.length; i++) {

				if (oData.toolsInputs[i] === '8') {
					oModelPeriodic.setProperty("/yesOthersTools", true);
					oModelPeriodic.setProperty("/HCP_OTHERS_TOOLS", oOthers);
					// return;
					// } else {
					// 	oModelPeriodic.setProperty("/yesOthersTools", false);
				}
			}

			this._validateForm();

		},

		_validateCriterionInputs: function () {

			var oModelPeriodic = this.getView().getModel("grainsVisitModel");
			var oData = oModelPeriodic.oData;
			var oOthers = oData.HCP_OTHER_CRITERION;

			oModelPeriodic.setProperty("/yesOthersCriterion", false);
			oModelPeriodic.setProperty("/HCP_OTHER_CRITERION", null);

			for (var i = 0; i < oData.criterionsInputs.length; i++) {

				if (oData.criterionsInputs[i] === '6') {
					oModelPeriodic.setProperty("/yesOthersCriterion", true);
					oModelPeriodic.setProperty("/HCP_OTHER_CRITERION", oOthers);
					return;
				} else {
					oModelPeriodic.setProperty("/yesOthersCriterion", false);
				}
			}

			this._validateForm();

		},

		_onInputStorageStructure: function () {

			var oEditModel = this.getView().getModel("grainsVisitModel");
			var oData = oEditModel.oData;

			oEditModel.setProperty("/yesStorage", true);

			if (oData.HCP_SILOS_BAG == 0) {
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
				oEditModel.setProperty("/HCP_SILOS_BAG", 0);

			}

			this._validateForm();

		},

		_onInputSilosStructure: function () {

			let oEditModel = this.getView().getModel("grainsVisitModel");
			let oData = oEditModel.oData;

			oEditModel.setProperty("/yesSilosBag", true);

			if (oData.HCP_SILOS_BAG == 0) {
				oEditModel.setProperty("/yesSilosBag", false);
				oEditModel.setProperty("/HCP_SILO_VOLUME", null);
			}

			this._validateForm();
		},

		insertTemplateMaterial: function () {

			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var oCharTemplate;

			oCharTemplate = this.buildMaterialTypeTemplate();

			oMainDataForm[11].addContent(new sap.m.Label({
				text: ""
			}));

			oMainDataForm[11].addContent(oCharTemplate);

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

		searchValuesTools: function (oModel, oRemove) {
			return new Promise(function (resolve, reject) {
				var oModelVisit = this.getView().getModel();
				var oEditModel = this.getView().getModel("grainsVisitModel");
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
					value1: "Grains"
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_PERIOD",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_PERIOD
				}));

				if (!oRemove) {
					oEditModel.setProperty("/toolsInputs", []);

				} else {

					if (aDeferredGroups.indexOf("removes") < 0) {
						aDeferredGroups.push("removes");
						oModel.setDeferredGroups(aDeferredGroups);
					}

				}

				oModelVisit.read("/Visit_Form_Tools", {
					filters: aFilters,
					success: function (results) {
						var aResults = results.results;

						var oTools = [];

						for (var i = 0; i < aResults.length; i++) {

							if (!oRemove) {

								oTools.push(aResults[i].HCP_TOOLS);
								oEditModel.setProperty("/negotiationDesc", aResults[i].HCP_OTHERS);

							} else {

								var sPath = "/Visit_Form_Tools(" + aResults[i].HCP_VISIT_ID + "l)";
								oModel.remove(sPath, {
									groupId: "removes"
								});

								oEditModel.setProperty("/groupRemoves", true);

							}
						}

						if (!oRemove) {
							oEditModel.setProperty("/toolsInputs", oTools);
						}
						resolve();
					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});
			}.bind(this));
		},

		searchFieldValues: function () {

			var oEditModel = this.getView().getModel("grainsVisitModel");
			var oData = oEditModel.oData;
			var oNegotiationFramesInputs = [];

			if (oData.HCP_PARTNER_BRF_SUP === 1) {
				oEditModel.setProperty("/noPartner", false);
				oEditModel.setProperty("/yesPartner", true);
			} else {
				oEditModel.setProperty("/noPartner", true);
				oEditModel.setProperty("/yesPartner", false);
			}

			if (oData.HCP_OWN_FLEET === 1) { //Sim
				oEditModel.setProperty("/yesOwnFleet", true);
			} else {
				oEditModel.setProperty("/yesOwnFleet", false);
			}

			oNegotiationFramesInputs.push(oData.HCP_JANUARY === '1' ? "HCP_JANUARY" : false);
			oNegotiationFramesInputs.push(oData.HCP_FEBRUARY === '1' ? "HCP_FEBRUARY" : false);
			oNegotiationFramesInputs.push(oData.HCP_MARCH === '1' ? "HCP_MARCH" : false);
			oNegotiationFramesInputs.push(oData.HCP_APRIL === '1' ? "HCP_APRIL" : false);
			oNegotiationFramesInputs.push(oData.HCP_MAY === '1' ? "HCP_MAY" : false);
			oNegotiationFramesInputs.push(oData.HCP_JUNE === '1' ? "HCP_JUNE" : false);
			oNegotiationFramesInputs.push(oData.HCP_JULY === '1' ? "HCP_JULY" : false);
			oNegotiationFramesInputs.push(oData.HCP_AUGUST === '1' ? "HCP_AUGUST" : false);
			oNegotiationFramesInputs.push(oData.HCP_SEPTEMBER === '1' ? "HCP_SEPTEMBER" : false);
			oNegotiationFramesInputs.push(oData.HCP_OCTOBER === '1' ? "HCP_OCTOBER" : false);
			oNegotiationFramesInputs.push(oData.HCP_NOVEMBER === '1' ? "HCP_NOVEMBER" : false);
			oNegotiationFramesInputs.push(oData.HCP_DECEMBER === '1' ? "HCP_DECEMBER" : false);

			oEditModel.setProperty("/negotiationFramesInputs", oNegotiationFramesInputs);

			this._validateInputCriterion();

		},

		searchValuesCertifications: function (oModel, oRemove) {
			return new Promise(function (resolve, reject) {
				var oModelVisit = this.getView().getModel();
				var oEditModel = this.getView().getModel("grainsVisitModel");
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
					value1: "Grains"
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_PERIOD",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_PERIOD
				}));

				if (!oRemove) {
					oEditModel.setProperty("/certificationsInputs", []);
					oEditModel.setProperty("/yesOthersCertication", false);

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
									oEditModel.setProperty("/yesOthersCertication", true);
									oEditModel.setProperty("/HCP_OTHERS", aResults[i].HCP_OTHERS);
								}

							} else {

								var sPath = "/Visit_Form_Certifications(" + aResults[i].HCP_VISIT_ID + "l)";
								oModel.remove(sPath, {
									groupId: "removes"
								});

								oEditModel.setProperty("/groupRemoves", true);

							}
						}

						if (!oRemove) {
							oEditModel.setProperty("/certificationsInputs", oCertifications);
						}
						resolve();
					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});
			}.bind(this));
		},

		searchValuesMaterial: function () {

			var oModelVisit = this.getView().getModel();
			var oEditModel = this.getView().getModel("grainsVisitModel");
			var oData = oEditModel.oData;
			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var oCharTemplate;
			var aFilters = [];

			oEditModel.setProperty("/materialInputs", []);

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

			oModelVisit.read("/Visit_Form_Material", {

				filters: aFilters,
				success: function (results) {

					var aResults = results.results;

					for (var i = 0; i < aResults.length; i++) {

						oCharTemplate = this.buildMaterialTypeTemplate();

						oMainDataForm[9].addContent(new sap.m.Label({
							text: ""
						}));
						oMainDataForm[9].addContent(oCharTemplate);

						oEditModel.setProperty("/materialInputs/" + i + "/status", "Edit");
						oEditModel.setProperty("/materialInputs/" + i + "/HCP_VISIT_ID", aResults[i].HCP_VISIT_ID);
						oEditModel.setProperty("/materialInputs/" + i + "/HCP_MATERIAL", aResults[i].HCP_MATERIAL);
						oEditModel.setProperty("/materialInputs/" + i + "/HCP_VOLUME", aResults[i].HCP_VOLUME);
						oEditModel.setProperty("/materialInputs/" + i + "/HCP_SAFRA_YEAR", aResults[i].HCP_SAFRA_YEAR);
						oEditModel.setProperty("/materialInputs/" + i + "/HCP_PERCENT_MARKETED", aResults[i].HCP_PERCENT_MARKETED);
						oEditModel.setProperty("/materialInputs/" + i + "/HCP_INTERN_MARKET", aResults[i].HCP_INTERN_MARKET);
						oEditModel.setProperty("/materialInputs/" + i + "/HCP_EXPORT", aResults[i].HCP_EXPORT);
					}
					oEditModel.refresh();
				}.bind(this),
				error: function (error) {

				}
			});

		},

		_onInputUfFormSelect: function (oEvent) {

			var oCreateModelGrains = this.getView().getModel("grainsVisitModel");

			oCreateModelGrains.setProperty("/HCP_CITY", null);
			oCreateModelGrains.setProperty("/enableSave", false);

			if (oCreateModelGrains.oData.HCP_UF) {
				if (this.checkIfRegioIsInUserProfile(oCreateModelGrains.oData.HCP_UF)) {
					oCreateModelGrains.setProperty("/enableCounty", true);

					this._validateStates(oEvent).then(function () {
						this._validateForm();
					}.bind(this));
				} else {
					oCreateModelGrains.setProperty("/enableCounty", false);
					this._validateForm();
				}

			} else {
				oCreateModelGrains.setProperty("/enableCounty", false);
				oCreateModelGrains.setProperty("/enableCreateRegioValid", true);
				this._validateForm();
			}

		},

		_onInputFormSelect: function (oEvent) {

			var oModelYearly = this.getView().getModel("grainsVisitModel");
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

		_validateStates: function (oEvent) {

			return new Promise(function (resolve, reject) {

				var oEditModelGrains = this.getView().getModel("grainsVisitModel");
				var oInput = oEvent.getSource();
				oInput.getValue();

				var oTable = this.getView().byId("county");
				var oFilters = [];

				var oModel = this.getView().getModel();
				var oUf;

				if (oInput.getSelectedKey()) {
					oUf = oInput.getSelectedKey();
				} else {
					oUf = oEditModelGrains.oData.HCP_UF;
				}

				if (oUf) {

					oFilters.push(new sap.ui.model.Filter("TAXJURCODE", sap.ui.model.FilterOperator.Contains, oUf));
					oTable.getBinding("items").filter(oFilters);

					oModel.read("/View_City", {
						filters: oFilters,
						success: function (result) {
							if (result.results.length > 0) {
								oEditModelGrains.setProperty("/yesCity", true);
							} else {
								oEditModelGrains.setProperty("/yesCity", false);
							}
							resolve();
						}.bind(this),
						error: function () {
							oEditModelGrains.setProperty("/yesCity", false);
							reject(error);
						}
					});

				}
				this._validateForm();

			}.bind(this));

		},

		_validateCounty: function () {

			var oCreateModelGrains = this.getView().getModel("grainsVisitModel");

			if (!oCreateModelGrains.oData.HCP_CITY) {
				oCreateModelGrains.setProperty("/HCP_UF", null);
			}

			this._validateForm();
		},

		_onOwnFleetFormSelect: function (oEvent) {

			var oCreateModelGrains = this.getView().getModel("grainsVisitModel");
			var oInput = oEvent.getSource();

			if (oInput.getSelectedKey() === "1") { //Sim
				oCreateModelGrains.setProperty("/yesOwnFleet", true);
			} else {
				oCreateModelGrains.setProperty("/yesOwnFleet", false);
				oCreateModelGrains.setProperty("/HCP_PERCENT_OWN_FLEET", 0);
			}

			this._validateForm();

		},

		_validateInputCriterion: function () {

			var oCreateModelGrains = this.getView().getModel("grainsVisitModel");
			var oData = oCreateModelGrains.oData;
			var oOthers = oData.HCP_OTHER_CRITERION;

			oCreateModelGrains.setProperty("/yesOthersCriterion", false);
			oCreateModelGrains.setProperty("/HCP_OTHER_CRITERION", null);

			if (oData.HCP_CRITERION === '6') {
				oCreateModelGrains.setProperty("/yesOthersCriterion", true);
				oCreateModelGrains.setProperty("/HCP_OTHER_CRITERION", oOthers);
				return;
			} else {
				oCreateModelGrains.setProperty("/yesOthersCriterion", false);
			}

			this._validateForm();
		},

		_onInputPartnerFormSelect: function (oEvent) {

			var oCreateModelGrains = this.getView().getModel("grainsVisitModel");
			var oInput = oEvent.getSource();

			oCreateModelGrains.setProperty("/HCP_PARTNER", null);
			oCreateModelGrains.setProperty("/partnerDesc", null);

			if (oInput.getSelectedKey() === "1") { //Sim

				oCreateModelGrains.setProperty("/noPartner", false);
				oCreateModelGrains.setProperty("/yesPartner", true);
				oCreateModelGrains.setProperty("/HCP_PARTNER_BRF_SUP", 1);

			} else {

				oCreateModelGrains.setProperty("/noPartner", true);
				oCreateModelGrains.setProperty("/yesPartner", false);
				oCreateModelGrains.setProperty("/HCP_PARTNER_BRF_SUP", 0);

			}

			this._validateForm();

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
			var oVisitModel = this.getView().getModel("grainsVisitModel");
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

		_validateFormSpecialCharacters: function (sErro) {

			setTimeout(function () {
				var oFilterModel = this.getView().getModel("grainsVisitModel");
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
			var oFilterModel = this.getView().getModel("grainsVisitModel");
			var aMaterialInputs = oFilterModel.oData.materialInputs;

			if (typeof (oProperty) !== 'undefined') {
				let oValueInput = oProperty.getParameters().value;
				let oInputName = oProperty.getSource().getName();
				let oLastValue = oProperty.getSource()._lastValue;

				if (typeof (oLastValue) !== 'undefined') {

					oLastValue = oLastValue.replace(",", "");
					oLastValue = oLastValue.replace(".", "");

					if (oValueInput === '' || oValueInput === "") {
						oFilterModel.setProperty("/enableSave", false);
						for (var k = 0; k < aMaterialInputs.length; k++) {
							let oCompareValue = aMaterialInputs[k].HCP_VOLUME.toFixed(2);

							oCompareValue = oCompareValue.replace(".", "");
							oCompareValue = oCompareValue.replace(",", "");

							if (oInputName === 'HCP_VOLUME' && oLastValue == oCompareValue) {
								oFilterModel.setProperty("/materialInputs/" + k + "/HCP_VOLUME", '');
							}
						}
						return;
					}
				}
			}

			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;
				var oLenght;
				var sErro;
				let aMaterialInputs = oFilterModel.oData.materialInputs;

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

								if (oControl.mProperties.name === "HCP_INTERN_MARKET" ||
									oControl.mProperties.name === "HCP_EXPORT") {

									for (var i = 0; i < oFilterModel.oData.materialInputs.length; i++) {

										if (oFilterModel.oData.materialInputs[i].status !== "Deleted") {
											if (oFilterModel.oData.materialInputs[i].HCP_INTERN_MARKET !== 0 ||
												oFilterModel.oData.materialInputs[i].HCP_EXPORT !== 0) {
												oLenght = 1;
											}

										}
									}
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

								if (typeof (aMaterialInputs) !== 'undefined') {

									for (var k = 0; k < aMaterialInputs.length; k++) {
										if (aMaterialInputs[k].status != "Deleted") {

											if (((typeof (aMaterialInputs[k].HCP_MATERIAL) === 'undefined') || (aMaterialInputs[k].HCP_MATERIAL === '') || (typeof (
													aMaterialInputs[k].HCP_SAFRA_YEAR) === 'undefined')) || (aMaterialInputs[k].HCP_SAFRA_YEAR === '') || (typeof (
													aMaterialInputs[k].HCP_VOLUME) === 'undefined') || (aMaterialInputs[k].HCP_VOLUME === '') || (aMaterialInputs[k].HCP_VOLUME ===
													'0')) {
												oFilterModel.setProperty("/enableSave", false);
											}
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
			var oMaterialFormFields = this.getDynamicFormFields(this.getView().byId("newMaterialSimpleForm")) || [];
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

		_validateInputCertification: function () {

			var oModelGrains = this.getView().getModel("grainsVisitModel");
			var oData = oModelGrains.oData;
			var oOthers = oData.HCP_OTHERS;

			oModelGrains.setProperty("/yesOthersCertication", false);
			oModelGrains.setProperty("/HCP_OTHERS", null);

			for (var i = 0; i < oData.certificationsInputs.length; i++) {

				if (oData.certificationsInputs[i] === '11') {
					oModelGrains.setProperty("/yesOthersCertication", true);
					oModelGrains.setProperty("/HCP_OTHERS", oOthers);
					return;
				} else {
					oModelGrains.setProperty("/yesOthersCertication", false);
				}
			}

			this._validateForm();
		},

		initForm: function (oEvent) {
			var oFormId = 'newMaterialSimpleForm';
			var oForm = this.getView().byId(oFormId);
			var oCharTemplate;
			var oText;

			oCharTemplate = this.buildMaterialTypeTemplate();
			oForm.addContent(new sap.m.Label({
				text: ""
			}));
			oForm.addContent(oCharTemplate);
			this._validateForm();
		},

		_onAddNewForm: function (oEvent) {
			var oButton = oEvent.getSource();
			var oFormId = oButton.getCustomData()[0].getValue();
			var oForm = this.getView().byId(oFormId);

			MessageBox.information(

				"Deseja adicionar um novo material?", {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					onClose: function (sAction) {
						if (sAction === "YES") {
							oForm.addContent(new sap.m.Label({
								text: ""
							}));
							oForm.addContent(this.buildMaterialTypeTemplate());
							this._validateForm();
						}
					}.bind(this)
				}
			);
		},

		buildMaterialTypeTemplate: function () {

			var oVisitFormModel = this.getView().getModel("grainsVisitModel");
			var oData = oVisitFormModel.oData;
			var sChars = oVisitFormModel.getProperty("/materialInputs");
			var sCounter = oData.materialInputs.length + 1;
			var aCustomData = [];
			var oEnableCancel = true;

			if (!sChars) {
				oVisitFormModel.setProperty("/materialInputs", []);
			}

			var sCharLength = oVisitFormModel.getProperty("/materialInputs").length;
			oVisitFormModel.setProperty("/materialInputs/" + sCharLength, {});
			oVisitFormModel.setProperty("/materialInputs/" + sCharLength + "/status", "New");

			if (sCharLength === 0) {
				oEnableCancel = false;
			}

			aCustomData.push(new sap.ui.core.CustomData({
				key: "sPath",
				value: "/materialInputs/" + sCharLength
			}));

			var oItemTemplateMaterial = new sap.ui.core.ListItem({
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
						title: ["Material " + sCounter, "H1"],
						content: [
							new sap.m.Label({
								text: "Qual material Vendido/Comercializado?",
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),
							new CustomComboBox({
								showSecondaryValues: true,
								selectedKey: "{grainsVisitModel>/materialInputs/" + sCharLength + "/HCP_MATERIAL}",
								placeholder: "Selecione o Tipo de Material",
								name: "HCP_MATERIAL",
								editable: true,
								enabled: true,
								visible: true,
								width: 'auto',
								maxWidth: '100%',
								selectionChange: this._validateMaterialInput.bind(this),
								items: {
									path: '/View_Material',
									length: '999999',

									sorter: new sap.ui.model.Sorter({
										path: "MATNR",
										descending: false
									}),

									template: oItemTemplateMaterial
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
								selectedKey: "{grainsVisitModel>/materialInputs/" + sCharLength + "/HCP_SAFRA_YEAR}",
								placeholder: "Selecione Ano da Safra",
								name: "HCP_SAFRA_YEAR",
								editable: true,
								enabled: true,
								visible: true,
								width: 'auto',
								maxWidth: '100%',
								selectionChange: this._validateMaterialInput.bind(this),
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
								text: "Qual a expectativa de volume de produção (T)?",
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),

							new sap.m.Input({
								value: "{ path: 'grainsVisitModel>/materialInputs/" + sCharLength +
									"/HCP_VOLUME' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true,
								enabled: true,
								name: "HCP_VOLUME",
								placeholder: "Digite o Volume em Toneladas",
								change: this._calculateTotalBalance.bind(this)

							}),

							new sap.m.Label({
								text: "{i18n>textNegotiationBalance}",
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),

							new sap.m.Input({
								value: "{ path: 'grainsVisitModel>/materialInputs/" + sCharLength +
									"/HCP_NEGOTIATION_BALANCE' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_NEGOTIATION_BALANCE",
								width: "100%",
								enabled: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),

							new sap.m.Label({
								text: "Selecionar o % comercializado:",
								design: "Standard",
								width: "100%",
								required: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),

							new com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomSlider({
								value: "{grainsVisitModel>/materialInputs/" + sCharLength + "/HCP_PERCENT_MARKETED}",
								min: 0,
								max: 100,
								step: 1,
								showAdvancedTooltip: false,
								width: "auto",
								required: false,
								visible: true,
								change: this._calculateTotalBalance.bind(this),
								layoutData: [
									new sap.ui.layout.GridData({
										span: "L9 M9 S9"
									})
								]
							}),

							new sap.m.NumericContent({
								animateTextChange: true,
								value: "{grainsVisitModel>/materialInputs/" + sCharLength + "/HCP_PERCENT_MARKETED}",
								scale: "%",
								withMargin: true,
								nullifyValue: true,
								layoutData: [
									new sap.ui.layout.GridData({
										span: "L3 M3 S3"
									})
								]
							}).addStyleClass("percentageIndicator"),
							// new sap.m.Input({
							// 	value: "{grainsVisitModel>/materialInputs/" + sCharLength + "/HCP_PERCENT_MARKETED} %",
							// 	showValueHelp: false,
							// 	enabled: false,
							// 	visible: true,
							// 	width: "30%",
							// 	valueHelpOnly: false,
							// 	change: this._validateForm.bind(this)
							// }),

							new sap.m.Label({
								text: "Partic.Faturamento(%) Mercado Interno:",
								design: "Standard",
								width: "100%",
								required: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),

							new com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomSlider({
								value: "{grainsVisitModel>/materialInputs/" + sCharLength + "/HCP_INTERN_MARKET}",
								min: 0,
								max: 100,
								step: 1,
								showAdvancedTooltip: false,
								width: "auto",
								name: "HCP_INTERN_MARKET",
								required: false,
								visible: true,
								liveChange: this._calculateTotalMarket.bind(this),
								layoutData: [
									new sap.ui.layout.GridData({
										span: "L9 M9 S9"
									})
								]
							}),

							new sap.m.NumericContent({
								animateTextChange: true,
								value: "{grainsVisitModel>/materialInputs/" + sCharLength + "/HCP_INTERN_MARKET}",
								scale: "%",
								withMargin: true,
								nullifyValue: true,
								layoutData: [
									new sap.ui.layout.GridData({
										span: "L3 M3 S3"
									})
								]
							}).addStyleClass("percentageIndicator"),
							// new sap.m.Input({
							// 	value: "{grainsVisitModel>/materialInputs/" + sCharLength + "/HCP_INTERN_MARKET} %",
							// 	showValueHelp: false,
							// 	enabled: false,
							// 	visible: true,
							// 	width: "30%",
							// 	valueHelpOnly: false,
							// 	change: this._calculateTotalMarket.bind(this)
							// }),

							new sap.m.Label({
								text: "Exportação:",
								design: "Standard",
								width: "100%",
								required: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),

							new com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomSlider({
								value: "{grainsVisitModel>/materialInputs/" + sCharLength + "/HCP_EXPORT}",
								min: 0,
								max: 100,
								step: 1,
								showAdvancedTooltip: false,
								name: "HCP_EXPORT",
								width: "auto",
								required: false,
								visible: true,
								change: this._calculateTotalMarket.bind(this),
								layoutData: [
									new sap.ui.layout.GridData({
										span: "L9 M9 S9"
									})
								]
							}),

							new sap.m.NumericContent({
								animateTextChange: true,
								value: "{grainsVisitModel>/materialInputs/" + sCharLength + "/HCP_EXPORT}",
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
							press: this.removeNewForm.bind(this)
						})
					]
				}));
			}

			oVisitFormModel.oData.materialInputs[sCharLength].HCP_PERCENT_MARKETED = 0;
			oVisitFormModel.oData.materialInputs[sCharLength].HCP_EXPORT = 0;
			oVisitFormModel.oData.materialInputs[sCharLength].HCP_INTERN_MARKET = 0;

			return oTemplate;
		},

		_validateMaterialInput: function (oProperty) {

			var oVisitModel = this.getView().getModel("grainsVisitModel");
			var oSource = oProperty.getSource();
			var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
			var oDataNewMaterial = oVisitModel.getProperty(sPath);
			var oData = oVisitModel.oData;
			var oNumber = 0;

			for (var i = 0; i < oData.materialInputs.length; i++) {

				if (oData.materialInputs[i].status !== "Deleted" &&
					oDataNewMaterial.HCP_MATERIAL === oData.materialInputs[i].HCP_MATERIAL &&
					oDataNewMaterial.HCP_SAFRA_YEAR === oData.materialInputs[i].HCP_SAFRA_YEAR) {
					oNumber = oNumber + 1;
				}

			}

			if (oNumber > 1) {
				oSource.setValueState("Error");
				oSource.setValueStateText("Duplicidade de Material/Safra. Verificar!");
			} else {
				this.lookForDuplicities(oSource, oDataNewMaterial, oNumber);
			}

			this._validateForm();

		},

		_calculateTotalBalance: function (oProperty) {

			var oModelYearly = this.getView().getModel("grainsVisitModel");
			var oSource = oProperty.getSource();
			var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
			var oData = oModelYearly.getProperty(sPath);
			var sTotal;

			let oValueInput = oProperty.getParameters().value;
			let oInputName = oProperty.getSource().getName();

			this._valideInputNumber(oProperty);

			if (oValueInput === '' || oValueInput === "") {
				oData[oInputName] = "0";
			}

			sTotal = oData.HCP_VOLUME * ((100 - oData.HCP_PERCENT_MARKETED) / 100);
			oData["HCP_NEGOTIATION_BALANCE"] = sTotal;
			oModelYearly.refresh();

			this._validateForm(oProperty);

		},

		lookForDuplicities: function (oSource, oData, oNumber) {

			var oForm = this.getView().byId("newMaterialSimpleForm");
			var oItems = oForm.getContent().filter(content => content.getMetadata().getName() === "sap.m.VBox");
			var sName = oSource.getName();

			var sLastValueMaterial;
			var sLastValueSafra;
			var oValuematerial;
			var oValueSafra;

			if (sName === "HCP_MATERIAL") {
				sLastValueMaterial = oSource._lastValue;
				sLastValueSafra = oData["HCP_SAFRA_YEAR"];
			} else {
				sLastValueSafra = oSource._lastValue;
				sLastValueMaterial = oData["HCP_MATERIAL"];
			}

			if (oItems.length > 0) {
				for (var item of oItems) {
					var oFieldCulture = item.getItems()[0].getContent()[1];
					var oFieldSafra = item.getItems()[0].getContent()[3];

					if (sName === "HCP_MATERIAL") {
						oValuematerial = oFieldCulture.getValue();
						oValueSafra = oFieldSafra.getSelectedKey();
					} else {
						oValuematerial = oFieldCulture.getSelectedKey();
						oValueSafra = oFieldSafra.getValue();
					}

					if (oNumber > 1) {
						if (sLastValueMaterial === oValuematerial &&
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

		_valideInputNumber: function (oProperty) {

			var oModelYearly = this.getView().getModel("grainsVisitModel");
			var oSource = oProperty.getSource();
			var sName = oSource.getName();
			var oData;
			var sValue;
			var sValueAux;

			if (sName !== "HCP_CAPACITY" && sName !== "HCP_SILO_VOLUME") {
				var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
				oData = oModelYearly.getProperty(sPath);
			} else {
				oData = oModelYearly.oData;
			}

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

		removeNewForm: function (oEvent) {
			var oVisitModel = this.getView().getModel("grainsVisitModel");
			var oVBox = oEvent.getSource().getParent().getParent().getParent().getParent().getParent();
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			MessageBox.warning(
				"Tem certeza que deseja remover este Material?", {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						if (sAction === "YES") {
							if (oVBox) {
								var sPath = oVBox.getCustomData()[0].getValue();
								var oData = oVisitModel.getProperty(sPath);
								var oNewModel = this.getView().getModel("grainsVisitModel");
								var oVisitData = oNewModel.oData;

								oData.status = "Deleted";
								oVBox.destroy();
								this._validateForm();
								// oVisitData.cultureType.pop();
							}
						}
					}.bind(this)
				}
			);

		},

		_calculateTotalMarket: function (oProperty) {
			var oModelGrains = this.getView().getModel("grainsVisitModel");
			var oExport;
			var oSource = oProperty.getSource();
			var sName = oSource.getName();
			var sPath = oSource.getParent().getParent().getParent().getParent().getParent().getCustomData()[0].getValue();
			var oData = oModelGrains.getProperty(sPath);

			let oValueInput = oProperty.getParameters().value;
			let oInputName = oProperty.getSource().getName();

			if (oValueInput === '' || oValueInput === "") {
				oData[oInputName] = " ";
			}

			if (sName === "HCP_INTERN_MARKET") {
				oExport = 100 - oData["HCP_INTERN_MARKET"];
				oData["HCP_EXPORT"] = oExport;
			} else {
				oExport = 100 - oData["HCP_EXPORT"];
				oData["HCP_INTERN_MARKET"] = oExport;
			}
			// oData["total"] = 100;

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
			var oVisitModel = this.getView().getModel("grainsVisitModel");

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
			var oVisitModel = this.getView().getModel("grainsVisitModel");
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
		
		_calculateCommercializationMaterial: async function (oProperties) {
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			let cropId;
			let visitType = "Grãos";
			
			let sCounter = 0;
			var sTimestamp = new Date().getTime() + sCounter;
			sCounter = sCounter + 1;
			
			const getSafraYear = new Promise((resolve, reject) => {
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

			await getSafraYear.then((crop) => {
				cropId = crop;
			})
			
			const propertiesMaterial = {
				HCP_COMMERCIALIZATION_ID: sTimestamp.toFixed(),
				HCP_PARTNER: oProperties.oData.HCP_NAME_REGISTERED == null ? '' : oProperties.oData.HCP_NAME_REGISTERED,
				HCP_TYPE_COMMERCIALIZATION: visitType,
				HCP_CREATED_AT: new Date(),
				HCP_CREATED_BY: oProperties.HCP_CREATED_BY,
				HCP_CROP_ID: cropId.toString(),
				HCP_CULTURE_TYPE: oProperties.HCP_MATERIAL.toString(),
				HCP_PRODUCTIVITY_TOTAL: oProperties.HCP_VOLUME == undefined ? '' : parseFloat(oProperties.HCP_VOLUME).toFixed(2),
				HCP_COMMERCIALIZED_CROP: oProperties.HCP_PERCENT_MARKETED == undefined ? '' : oProperties.HCP_PERCENT_MARKETED.toString(),
				HCP_NEW_CROP: oProperties.HCP_NEGOTIATION_BALANCE == undefined ? '' : parseFloat(oProperties.HCP_NEGOTIATION_BALANCE).toFixed(2),
				HCP_DESCRIPTION: ''
			}
			
			oModel.create("/Visit_Form_Commercialization", propertiesMaterial);
		},

		onSavePress: function (oEvent) {

			var aUserName = this.userName;
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var aDeferredGroups = oModel.getDeferredGroups();
			var sCounter = 0;

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			var oCreateModelGrains = this.getView().getModel("grainsVisitModel");
			var oData = oCreateModelGrains.oData;
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
				HCP_UF: oData.HCP_UF,
				HCP_CITY: oData.HCP_CITY,
				HCP_CAPACITY: oData.HCP_CAPACITY !== null ? parseFloat(oData.HCP_CAPACITY).toFixed(2) : "0",
				HCP_PARTNER_PRODUCERS: oData.HCP_PARTNER_PRODUCERS,
				HCP_SILOS_BAG: oData.HCP_SILOS_BAG !== 0 ? "1" : "0",
				HCP_SILO_VOLUME: (typeof (oData.HCP_SILO_VOLUME) !== 'undefined') && (oData.HCP_SILO_VOLUME !== null) ? oData.HCP_SILO_VOLUME.toString() : "null",
				HCP_OTHER_BARTER: oData.HCP_OTHER_BARTER,
				HCP_OWN_FLEET: oData.HCP_OWN_FLEET,
				HCP_PERCENT_OWN_FLEET: oData.HCP_PERCENT_OWN_FLEET,
				// HCP_CRITERION: oData.HCP_CRITERION,
				// HCP_OTHER_CRITERION: oData.HCP_OTHER_CRITERION,
				HCP_DECISION_FACTOR: oData.HCP_DECISION_FACTOR,
				HCP_PARTNER_BRF_SUP: oData.HCP_PARTNER_BRF_SUP,
				HCP_PARTNER: oData.HCP_PARTNER,
				// HCP_SCHEDULE_NEXT_VISIT: oData.HCP_SCHEDULE_NEXT_VISIT,
				HCP_REPORT_VISIT: oData.HCP_REPORT_VISIT,
				HCP_CREATED_BY: aUserName,
				HCP_UPDATED_BY: aUserName,
				HCP_CREATED_AT: new Date(),
				HCP_UPDATED_AT: new Date(),
				HCP_CONTRACT_MODALITY: oData.HCP_CONTRACT_MODALITY,
				HCP_INTERACTION_OBJECTIVE: oData.HCP_INTERACTION_OBJECTIVE,
				HCP_STORAGE_STRUCTURE: oData.HCP_STORAGE_STRUCTURE,
				HCP_NAME_REGISTERED: nameFound
			};

			for (var i = 0; i < oData.negotiationFramesInputs.length; i++) {
				if (oData.negotiationFramesInputs[i]) {
					aData[oData.negotiationFramesInputs[i]] = "1";
				}
			}

			oModel.createEntry("/Visit_Form_Grains", {
				properties: aData
			}, {
				groupId: "changes"
			});

			sCounter = sCounter + 1;

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
					HCP_VISIT_TYPE: "Grains",
					HCP_UNIQUE_KEY: this.uniqueKey,
					HCP_PERIOD: oData.HCP_PERIOD,
					HCP_STORAGE_STRUCTURE: oData.negotiationInputs[i],
					HCP_UPDATED_BY: aUserName,
					HCP_UPDATED_AT: new Date()
				};

				oModel.createEntry("/Visit_Storage_Type", {
					properties: aDataNegotiationInput
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
					HCP_VISIT_TYPE: "Grains",
					HCP_UNIQUE_KEY: this.uniqueKey,
					HCP_PERIOD: this.period,
					HCP_CRITERION: oData.criterionsInputs[i],
					HCP_OTHERS: oData.criterionsInputs[i] === "6" ? oData.HCP_OTHER_CRITERION : null,
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
					HCP_VISIT_TYPE: "Grains",
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
					HCP_VISIT_TYPE: "Grains",
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
				sCounter = sCounter + 1;
			}

			//Material
			for (var i = 0; i < oData.materialInputs.length; i++) {
				var sMaterialKey = new Date().getTime() + sCounter;
				sCounter = sCounter + 1;

				var aDataMaterialInput = {
					HCP_VISIT_ID: sMaterialKey.toFixed(),
					HCP_PROVIDER_ID: oData.HCP_PROVIDER_ID,
					HCP_CONTACT_TYPE: oData.HCP_CONTACT_TYPE,
					HCP_CONTACT_INICIATIVE: oData.HCP_CONTACT_INICIATIVE,
					HCP_VISIT_FORM: oData.HCP_VISIT_FORM,
					HCP_UNIQUE_KEY: this.uniqueKey,
					HCP_PERIOD: this.period,
					HCP_VISIT_TYPE: "Grains",
					HCP_MATERIAL: oData.materialInputs[i].HCP_MATERIAL,
					HCP_VOLUME: parseFloat(oData.materialInputs[i].HCP_VOLUME).toFixed(2),
					HCP_NEGOTIATION_BALANCE: parseFloat(oData.materialInputs[i].HCP_NEGOTIATION_BALANCE).toFixed(2),
					HCP_SAFRA_YEAR: oData.materialInputs[i].HCP_SAFRA_YEAR,
					HCP_PERCENT_MARKETED: oData.materialInputs[i].HCP_PERCENT_MARKETED,
					HCP_INTERN_MARKET: oData.materialInputs[i].HCP_INTERN_MARKET,
					HCP_EXPORT: oData.materialInputs[i].HCP_EXPORT,
					HCP_CREATED_BY: aUserName,
					HCP_UPDATED_BY: aUserName,
					HCP_CREATED_AT: new Date(),
					HCP_UPDATED_AT: new Date()
				};

				if (oData.materialInputs[i].status !== "Deleted") {

					oModel.createEntry("/Visit_Form_Material", {
						properties: aDataMaterialInput
					}, {
						groupId: "changes"
					});
					
					this._calculateCommercializationMaterial({...aDataMaterialInput, oData})
				}

			}

			this.setBusyDialog("Ficha de Visita", "Salvando");
			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				oModel.submitChanges({
					groupId: "changes",
					success: function (data) {
						this.flushStore("Visit_Form_Grains,Visit_Form_Criterion,Visit_Form_Certifications,Visit_Form_Tools,Visit_Form_Material").then(function () {
							this.refreshStore("Visit_Form_Grains", "Visit_Form_Criterion",
							"Visit_Form_Certifications", "Visit_Form_Tools", "Visit_Form_Material").then(function () {
								if(this.validateSubmiteChange(data))
									this.updateSimplifyContact(this.getView().getModel("grainsVisitModel").oData.HCP_PROVIDER_ID, this.getView().getModel("grainsVisitModel").oData.HCP_NAME_REGISTERED);
								MessageBox.success(
									"Ficha de visita cadastrada com sucesso!", {
										actions: [sap.m.MessageBox.Action.OK],
										onClose: function (sAction) {
											this.closeBusyDialog();
											this.backToIndex();
										}.bind(this)
									}
								);
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
					success: function (data) {
						if(this.validateSubmiteChange(data))
							this.updateSimplifyContact(this.getView().getModel("grainsVisitModel").oData.HCP_PROVIDER_ID, this.getView().getModel("grainsVisitModel").oData.HCP_NAME_REGISTERED);
						MessageBox.success(
							"Ficha de visita cadastrada com sucesso!", {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									this.closeBusyDialog();
									this.backToIndex();
								}.bind(this)
							}
						);
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
		
		checkIfRegioIsInUserProfile: function (sRegio) {
			var oProfileModel = this.getView().getModel("profileModel");
			var oFilterModel = this.getView().getModel("grainsVisitModel");
			var oProfileData = oProfileModel.getData();

			if (oProfileData.werks && sRegio) {
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

}, /* bExport= */ true);