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

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.visitForm.NewYearlyVisitForm", {

		onInit: function () {

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("visitForm.NewYearlyVisitForm").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableSave: false,
				edit: false,
				yesPartner: true,
				noPartner: false,
				yesPartnerBRF: true,
				yesProspect: false,
				yesOthers: false,
				yesStorage: true,
				yesSiloBag: false,
				yesBarter: true,
				HCP_PARTNER_BRF_SUP: 1,
				HCP_STORAGE_STRUCTURE: 1,
				HCP_BARTER_EXCHANGE: 1,
				HCP_AMOUNT: 0,
				HCP_SILOS_BAG: "0",
				ufPlanting: [],
				cultureType: [],
				negotiationInputs: [],
				certifications: []

			}), "yearlyVisitModel");
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
			var oCreateModelYearly = this.getView().getModel("yearlyVisitModel");

			var sKeyData = oEvent.getParameter("data").keyData;
			var aKeyData = JSON.parse(decodeURIComponent(sKeyData));

			this.clearContainers("ufPlantingDataSimpleForm");
			this.clearContainers("newCultureSimpleForm");

			if (oEvent.getParameter("data")) {

				var aProperties = {
					enableSave: false,
					edit: false,
					yesPartner: true,
					noPartner: false,
					yesPartnerBRF: true,
					yesProspect: false,
					yesOthers: false,
					yesStorage: true,
					yesSilosBag: false,
					yesBarter: true,
					HCP_PARTNER_BRF_SUP: 1,
					HCP_STORAGE_STRUCTURE: 1,
					HCP_BARTER_EXCHANGE: 1,
					HCP_AMOUNT: 0,
					HCP_SILOS_BAG: "0",
					ufPlanting: [],
					cultureType: [],
					negotiationInputs: [],
					certifications: []
				};

				for (var key in aProperties) {
					aKeyData[key] = aProperties[key];
				}

				oCreateModelYearly.setProperty("/", aKeyData);

				//this.insertTemplateCultureType();
				this.insertUfPlanting();
				this.initForm();

			}

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				create: true,
				edit: true
			}), "profileModel");

			var oData = oCreateModelYearly.oData;

			this._getProviderName(oData.HCP_PROVIDER_ID).then(function (nameRegistered) {

				oCreateModelYearly.setProperty("/HCP_NAME_REGISTERED", nameRegistered);

			}.bind(this)).catch(function (error) {
				console.log(error);
			}.bind(this));

		},

		insertTemplateCultureType: function () {

			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var oCharTemplate;

			oCharTemplate = this.buildCultureTypeTemplate();

			oMainDataForm[11].addContent(new sap.m.Label({
				text: ""
			}));

			oMainDataForm[11].addContent(oCharTemplate);

		},

		insertUfPlanting: function () {

			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var oCharTemplate;

			oCharTemplate = this.buildUFTemplate();

			oMainDataForm[1].addContent(new sap.m.Label({
				text: ""
			}));

			oMainDataForm[1].addContent(oCharTemplate);

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

		_onInputStorageStructure: function () {

			var oEditModel = this.getView().getModel("yearlyVisitModel");
			var oData = oEditModel.oData;

			oEditModel.setProperty("/yesStorage", true);

			if (oData.HCP_SILOS_BAG === "0") {
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

		_onInputSilosStructure: function () {

			let oEditModel = this.getView().getModel("yearlyVisitModel");
			let oData = oEditModel.oData;

			oEditModel.setProperty("/yesSilosBag", true);

			if (oData.HCP_SILOS_BAG === "0") {
				oEditModel.setProperty("/yesSilosBag", false);
				oEditModel.setProperty("/HCP_SILO_VOLUME", null);
			}

			this._validateForm();
		},

		_onInputFormSelect: function (oEvent) {

			var oModelYearly = this.getView().getModel("yearlyVisitModel");
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

		_onInputBarterExchange: function () {

			var oEditModel = this.getView().getModel("yearlyVisitModel");
			var oData = oEditModel.oData;

			oEditModel.setProperty("/yesBarter", true);

			if (oData.HCP_BARTER_EXCHANGE == 0) {
				oEditModel.setProperty("/yesBarter", false);
				oEditModel.setProperty("/HCP_AMOUNT", 0);
			}

			this._validateForm();

		},

		_onInputPartnerFormSelect: function (oEvent) {

			var oModelYearly = this.getView().getModel("yearlyVisitModel");
			var oInput = oEvent.getSource();

			oModelYearly.setProperty("/HCP_PARTNER", null);
			oModelYearly.setProperty("/partnerDesc", null);

			if (oInput.getSelectedKey() === "1") { //Sim

				oModelYearly.setProperty("/noPartner", false);
				oModelYearly.setProperty("/yesPartner", true);
				oModelYearly.setProperty("/HCP_PARTNER_BRF_SUP", 1);

			} else {

				oModelYearly.setProperty("/noPartner", true);
				oModelYearly.setProperty("/yesPartner", false);
				oModelYearly.setProperty("/HCP_PARTNER_BRF_SUP", 0);

			}

			this._validateForm();

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
			var oVisitModel = this.getView().getModel("yearlyVisitModel");
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

			var oModelYearly = this.getView().getModel("yearlyVisitModel");
			var oInput = oEvent.getSource();
			var oPath = oEvent.getSource().getCustomData()[0].getValue();

			if (oInput.getSelectedKey() === "1") { //Sim

				oModelYearly.setProperty(oPath + "/idHectaresArea", true);

			} else {

				oModelYearly.setProperty(oPath + "/idHectaresArea", false);
				oModelYearly.setProperty(oPath + "/HCP_HECTARESAREA", null);
			}

			this._validateForm();

		},

		_validateFormSpecialCharacters: function (sErro) {

			setTimeout(function () {
				var oFilterModel = this.getView().getModel("yearlyVisitModel");
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
			var oFilterModel = this.getView().getModel("yearlyVisitModel");
			var aCultureType = oFilterModel.oData.cultureType;
			var oCheckNegotiation = false;

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
									if (aCultureType[k].status != "Deleted") {
										if (typeof (aCultureType[k].negotiationInputs) !== 'undefined') {
											for (var j = 0; j < aCultureType[k].negotiationInputs.length; j++) {
												if (aCultureType[k].negotiationInputs[j] != 'false') {
													oCheckNegotiation = true;
												}
											}
										}

										if ((typeof (aCultureType[k].negotiationInputs) === 'undefined') || (oCheckNegotiation === false) || (typeof (aCultureType[
												k].HCP_CULTURE_TYPE) === 'undefined') || (aCultureType[k].HCP_CULTURE_TYPE === '') || (typeof (aCultureType[k].HCP_HECTARE_PLANT_AREA) ===
												'undefined') || (aCultureType[k].HCP_HECTARE_PLANT_AREA === '') || (typeof (aCultureType[k].HCP_PRODUCTIVITY) ===
												'undefined') || (aCultureType[k].HCP_PRODUCTIVITY === '') || (typeof (aCultureType[k].HCP_SAFRA_YEAR) === 'undefined') ||
											(aCultureType[k].HCP_SAFRA_YEAR === '')
										) {
											oFilterModel.setProperty("/enableSave", false);
											return;
										} else {
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

			var oModelYearly = this.getView().getModel("yearlyVisitModel");
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

			var oVisitFormModel = this.getView().getModel("yearlyVisitModel");
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

			var oTitle = new sap.ui.core.Title({
				level: "H2",
				text: "Cultura " + sCounter
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
						emptySpanXL: 0,
						labelSpanM: 3,
						labelSpanL: 3,
						labelSpanXL: 3,
						singleContainerFullSize: false,
						adjustLabelSpan: false,
						backgroundDesign: "Solid",
						title: oTitle,
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
								selectedKey: "{yearlyVisitModel>/cultureType/" + sCharLength + "/HCP_CULTURE_TYPE}",
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
								selectedKey: "{yearlyVisitModel>/cultureType/" + sCharLength + "/HCP_SAFRA_YEAR}",
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
								text: "Área de Plantio (HA)",
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),

							new sap.m.Input({
								value: "{ path: 'yearlyVisitModel>/cultureType/" + sCharLength +
									"/HCP_HECTARE_PLANT_AREA' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
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
								value: "{ path: 'yearlyVisitModel>/cultureType/" + sCharLength +
									"/HCP_PRODUCTIVITY' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_PRODUCTIVITY",
								width: "100%",
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
								value: "{ path: 'yearlyVisitModel>/cultureType/" + sCharLength +
									"/HCP_PRODUCTIVITY_TOTAL' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_PRODUCTIVITY_TOTAL",
								width: "100%",
								enabled: false,
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
								selectedKeys: "{yearlyVisitModel>/cultureType/" + sCharLength + "/negotiationInputs}",
								placeholder: "Selecione Negociação dos Insumos",
								editable: true,
								enabled: true,
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
							press: this.removeNewForm.bind(this)
						})
					]
				}));
			}
			return oTemplate;
		},

		_validateCultureInput: function (oProperty) {

			var oVisitModel = this.getView().getModel("yearlyVisitModel");
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

			var oModelYearly = this.getView().getModel("yearlyVisitModel");
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

			var oVisitFormModel = this.getView().getModel("yearlyVisitModel");
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
						editable: true,
						emptySpanM: 4,
						emptySpanL: 4,
						labelSpanM: 3,
						labelSpanL: 3,
						layout: "ResponsiveGridLayout",
						maxContainerCols: 1,
						minWidth: 1024,
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
								selectedKey: "{yearlyVisitModel>/ufPlanting/" + sCharLength + "/HCP_UF_PLANTING}",
								placeholder: "Selecione UF Plantio",
								editable: true,
								enabled: true,
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
								selectedKey: "{yearlyVisitModel>/ufPlanting/" + sCharLength + "/HCP_LEASED_AREA}",
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
								value: "{ path: 'yearlyVisitModel>/ufPlanting/" + sCharLength +
									"/HCP_HECTARESAREA' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_HECTARESAREA",
								width: "100%",
								required: "{yearlyVisitModel>/ufPlanting/" + sCharLength + "/idHectaresArea}",
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{yearlyVisitModel>/ufPlanting/" + sCharLength + "/idHectaresArea}",
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

			var oModelYearly = this.getView().getModel("yearlyVisitModel");
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
			var oVisitModel = this.getView().getModel("yearlyVisitModel");
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
								var oNewModel = this.getView().getModel("yearlyVisitModel");
								var oVisitData = oNewModel.oData;

								oData.status = "Deleted";
								oVBox.destroy();
								this._validateForm();
								//oVisitData.cultureType.pop();
							}
						}
					}.bind(this)
				}
			);

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
			var oVisitModel = this.getView().getModel("yearlyVisitModel");

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
			var oVisitModel = this.getView().getModel("yearlyVisitModel");
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

		onSavePress: async function (oEvent) {

			this.uniqueKey = this.generateUniqueKey();
			var aUserName = this.userName;
			var sCounter = 0;
			var sTimestamp = new Date().getTime() + sCounter;
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var aDeferredGroups = oModel.getDeferredGroups();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var oCreateModelYearly = this.getView().getModel("yearlyVisitModel");
			var oData = oCreateModelYearly.oData;
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

			this.uniqueKey = this.generateUniqueKey();
			this.period = this._getPeriod();

			var aData = {
				HCP_VISIT_ID: sTimestamp.toFixed(),
				HCP_PROVIDER_ID: oData.HCP_PROVIDER_ID,
				HCP_CONTACT_TYPE: oData.HCP_CONTACT_TYPE,
				HCP_CONTACT_INICIATIVE: oData.HCP_CONTACT_INICIATIVE,
				HCP_VISIT_FORM: oData.HCP_VISIT_FORM,
				HCP_UNIQUE_KEY: this.uniqueKey,
				HCP_PERIOD: this.period,
				HCP_STORAGE_STRUCTURE: oData.HCP_STORAGE_STRUCTURE,
				HCP_CAPACITY: oData.HCP_CAPACITY !== null ? parseFloat(oData.HCP_CAPACITY).toFixed(2) : "0",
				HCP_SILOS_BAG: oData.HCP_SILOS_BAG,
				HCP_SILO_VOLUME: ((oData.HCP_SILO_VOLUME !== null) && (oData.HCP_SILO_VOLUME !== undefined)) ? oData.HCP_SILO_VOLUME.toString() : '',
				HCP_BARTER_EXCHANGE: oData.HCP_BARTER_EXCHANGE,
				HCP_AMOUNT: oData.HCP_AMOUNT,
				HCP_PARTNER_BRF_SUP: oData.HCP_PARTNER_BRF_SUP,
				HCP_PARTNER: oData.HCP_PARTNER,
				HCP_CREATED_BY: aUserName,
				HCP_UPDATED_BY: aUserName,
				HCP_CREATED_AT: new Date(),
				HCP_UPDATED_AT: new Date(),
				HCP_INTERACTION_OBJECTIVE: oData.HCP_INTERACTION_OBJECTIVE,
				HCP_NAME_REGISTERED: nameFound
			};
			sCounter = sCounter + 1;

			oModel.createEntry("/Visit_Form_Yearly", {
				properties: aData
			}, {
				groupId: "changes"
			});

			// UF Plantio
			for (var i = 0; i < oData.ufPlanting.length; i++) {
				var sPlantingKey = new Date().getTime() + sCounter;
				sCounter = sCounter + 1;

				if (oData.ufPlanting[i].status === "New") {

					var aDataUfPlanting = {
						HCP_VISIT_ID: sPlantingKey.toFixed(),
						HCP_PROVIDER_ID: oData.HCP_PROVIDER_ID,
						HCP_CONTACT_TYPE: oData.HCP_CONTACT_TYPE,
						HCP_CONTACT_INICIATIVE: oData.HCP_CONTACT_INICIATIVE,
						HCP_VISIT_FORM: oData.HCP_VISIT_FORM,
						HCP_UNIQUE_KEY: this.uniqueKey,
						HCP_PERIOD: this.period,
						HCP_UF_PLANTING: oData.ufPlanting[i].HCP_UF_PLANTING,
						HCP_LEASED_AREA: oData.ufPlanting[i].HCP_LEASED_AREA,
						HCP_HECTARESAREA: oData.ufPlanting[i].HCP_HECTARESAREA !== null ? parseFloat(oData.ufPlanting[i].HCP_HECTARESAREA).toFixed(2) : "0",
						HCP_CREATED_BY: aUserName,
						HCP_UPDATED_BY: aUserName,
						HCP_CREATED_AT: new Date(),
						HCP_UPDATED_AT: new Date()
					};

					if (aDataUfPlanting.HCP_LEASED_AREA === undefined) {
						aDataUfPlanting.HCP_LEASED_AREA = 1;
					}

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

				if (oData.cultureType[i].status === "New") {

					var aDataCultureType = {
						HCP_VISIT_ID: sCultureKey.toFixed(),
						HCP_PROVIDER_ID: oData.HCP_PROVIDER_ID,
						HCP_CONTACT_TYPE: oData.HCP_CONTACT_TYPE,
						HCP_CONTACT_INICIATIVE: oData.HCP_CONTACT_INICIATIVE,
						HCP_VISIT_FORM: oData.HCP_VISIT_FORM,
						HCP_UNIQUE_KEY: this.uniqueKey,
						HCP_PERIOD: this.period,
						HCP_VISIT_TYPE: "Yearly",
						HCP_CULTURE_TYPE: oData.cultureType[i].HCP_CULTURE_TYPE,
						HCP_SAFRA_YEAR: oData.cultureType[i].HCP_SAFRA_YEAR,
						HCP_HECTARE_PLANT_AREA: parseFloat(oData.cultureType[i].HCP_HECTARE_PLANT_AREA).toFixed(2),
						HCP_PRODUCTIVITY: parseFloat(oData.cultureType[i].HCP_PRODUCTIVITY).toFixed(2),
						HCP_PRODUCTIVITY_TOTAL: parseFloat(oData.cultureType[i].HCP_PRODUCTIVITY_TOTAL).toFixed(2),
						HCP_CREATED_BY: aUserName,
						HCP_UPDATED_BY: aUserName,
						HCP_CREATED_AT: new Date(),
						HCP_UPDATED_AT: new Date()
					};

					for (var input of oData.cultureType[i].negotiationInputs) {
						aDataCultureType[input] = "1";
					}

					oModel.createEntry("/Visit_Culture_Type", {
						properties: aDataCultureType
					}, {
						groupId: "changes"
					});
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
					HCP_VISIT_TYPE: "Yearly",
					HCP_VISIT_FORM: oData.HCP_VISIT_FORM,
					HCP_UNIQUE_KEY: this.uniqueKey,
					HCP_PERIOD: this.period,
					HCP_STORAGE_STRUCTURE: oData.negotiationInputs[i],
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
					HCP_UNIQUE_KEY: this.uniqueKey,
					HCP_PERIOD: this.period,
					HCP_CERTIFICATION: oData.certifications[i],
					HCP_OTHERS: oData.certifications[i] === "11" ? oData.HCP_OTHERS : null,
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
			this.setBusyDialog("Ficha de Visita", "Salvando");
			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				oModel.submitChanges({
					groupId: "changes",
					success: async function (data) {
						//this.flushStore("Visit_Form_Certifications,Visit_Storage_Type,Visit_Form_Yearly,Visit_Uf_Planting,Visit_Culture_Type").then(
						//	function () {
						//	this.refreshStore("Visit_Form_Certifications", "Visit_Storage_Type",
						//		"Visit_Form_Yearly", "Visit_Uf_Planting", "Visit_Culture_Type").then(function () {
						if(this.validateSubmiteChange(data))
							this.updateSimplifyContact(this.getView().getModel("yearlyVisitModel").oData.HCP_PROVIDER_ID, this.getView().getModel("yearlyVisitModel").oData.HCP_NAME_REGISTERED);
						if(await this.prepareEqualize(this.getView().getModel("yearlyVisitModel").oData, 'Yearly')){
							MessageBox.success(
								"Ficha de visita cadastrada com sucesso!\n\nAtualizações replicadas na Ficha Periodica.", {
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
								"Ficha de visita cadastrada com sucesso!", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
										this.backToIndex();
									}.bind(this)
								}
							);
						}
						//	}.bind(this));
						//}.bind(this));
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
							this.updateSimplifyContact(this.getView().getModel("yearlyVisitModel").oData.HCP_PROVIDER_ID, this.getView().getModel("yearlyVisitModel").oData.HCP_NAME_REGISTERED);
						if(await this.prepareEqualize(this.getView().getModel("yearlyVisitModel").oData, 'Yearly')){
							MessageBox.success(
								"Ficha de visita cadastrada com sucesso!\n\nAtualizações replicadas na Ficha Periodica.", {
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
								"Ficha de visita cadastrada com sucesso!", {
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

		}

	});

}, /* bExport= */ true);