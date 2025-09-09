sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
		"sap/m/MessageBox",
		"sap/ui/core/routing/History",
		"sap/ui/model/json/JSONModel",
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/List',
		'sap/m/StandardListItem'
	], function (MainController, MessageBox, History, JSONModel, Button, Dialog, List, StandardListItem) {
		"use strict";

		return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.prospects.New", {

			onInit: function () {

				this.setBusyDialog("Prospect", "Carregando dados, por favor aguarde");

				var oProspects = new JSONModel({
					KTOKK: "F2",
					STCD2: "",
					STCD1: "",
					LAND1: "BR",
					ZWELS: "XYZ",
					AKONT: "210001",
					BUKRS: "2500",
					enableCreate: true,
					AdditionalAdressPress: false,
					isLoad: false
				});

				var oModel = this.getOwnerComponent().getModel();
				oModel.attachRequestCompleted(function () {

					var oProspectModel = this.getView().getModel("prospectModel");
					var isLoad = oProspectModel.getProperty("/isLoad");

					//this.userName = this.getOwnerComponent().userName;
					if (!isLoad) {
						oProspectModel.setProperty("/isLoad", true);
						this.closeBusyDialog();
					}

				}.bind(this));

				this.getView().setModel(oProspects, "prospectModel");
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getTarget("prospects.New").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			},

			handleRouteMatched: function (oEvent) {

				this.getUser().then(function (userName) {
					this.userName = userName;
					this.verifyAccountGroup();
				}.bind(this));

				var oProspects = {
					KTOKK: "F2",
					STCD2: "",
					STCD1: "",
					LAND1: "BR",
					ZWELS: "XYZ",
					AKONT: "210001",
					BUKRS: "2500",
					enableCreate: true,
					AdditionalAdressPress: false
				};
				this.getView().getModel("prospectModel").setData(oProspects);

				this.clearValueStateFields();
				this.clearCharacteristicContainers();
				this.clearBankContainers();
				this.clearIrfContainers();

				var oTable = this.getView().byId("states");
				var oFilters = [];

				oFilters.push(new sap.ui.model.Filter("LAND1", sap.ui.model.FilterOperator.Contains, "BR"));
				oTable.getBinding("items").filter(oFilters);

			},
			handleRadioButtonGroupsSelectedIndex: function () {
				var that = this;
				this.aRadioButtonGroupIds.forEach(function (sRadioButtonGroupId) {
					var oRadioButtonGroup = that.byId(sRadioButtonGroupId);
					var oButtonsBinding = oRadioButtonGroup ? oRadioButtonGroup.getBinding("buttons") : undefined;
					if (oButtonsBinding) {
						var oSelectedIndexBinding = oRadioButtonGroup.getBinding("selectedIndex");
						var iSelectedIndex = oRadioButtonGroup.getSelectedIndex();
						oButtonsBinding.attachEventOnce("change", function () {
							if (oSelectedIndexBinding) {
								oSelectedIndexBinding.refresh(true);
							} else {
								oRadioButtonGroup.setSelectedIndex(iSelectedIndex);
							}
						});
					}
				});

			},

			clearValueStateFields: function () {
				var sFields = this._getFormFields();

				for (var field of sFields) {
					field.control.setValueState("None");
				}
			},

			clearCharacteristicContainers: function () {
				var oCharDataFormContent = this.getView().byId("CharacteristicsSimpleForm").getContent();
				var oCharContainers = oCharDataFormContent.filter(control => control.getMetadata().getName() === "sap.m.VBox");

				if (oCharContainers) {
					for (var container of oCharContainers) {
						container.destroy();
					}
				}
			},

			clearBankContainers: function () {
				var oCharDataFormContent = this.getView().byId("bankDataSimpleForm").getContent();
				var oCharContainers = oCharDataFormContent.filter(control => control.getMetadata().getName() === "sap.m.VBox");

				if (oCharContainers) {
					for (var container of oCharContainers) {
						container.destroy();
					}
				}
			},

			clearIrfContainers: function () {
				var oCharDataFormContent = this.getView().byId("irfSimpleForm").getContent();
				var oCharContainers = oCharDataFormContent.filter(control => control.getMetadata().getName() === "sap.m.VBox");

				if (oCharContainers) {
					for (var container of oCharContainers) {
						container.destroy();
					}
				}
			},

			convertTextToIndexFormatter: function (sTextValue) {
				var oRadioButtonGroup = this.byId(
					"sap_uxap_ObjectPageLayout_0-sections-sap_uxap_ObjectPageSection-2-subSections-sap_uxap_ObjectPageSubSection-1-blocks-build_simple_form_Form-1537889366673-formContainers-build_simple_form_FormContainer-1-formElements-build_simple_form_FormElement-1537889779797-fields-sap_m_RadioButtonGroup-1537889854058-miv9ovz125lyr72ymexli7ui6_S6-c9sm7etwa1vlnkxgxcit549z80_S80"
				);
				var oButtonsBindingInfo = oRadioButtonGroup.getBindingInfo("buttons");
				if (oButtonsBindingInfo && oButtonsBindingInfo.binding) {
					// look up index in bound context
					var sTextBindingPath = oButtonsBindingInfo.template.getBindingPath("text");
					return oButtonsBindingInfo.binding.getContexts(oButtonsBindingInfo.startIndex, oButtonsBindingInfo.length).findIndex(function (
						oButtonContext) {
						return oButtonContext.getProperty(sTextBindingPath) === sTextValue;
					});
				} else {
					// look up index in static items
					return oRadioButtonGroup.getButtons().findIndex(function (oButton) {
						return oButton.getText() === sTextValue;
					});
				}

			},
			_onPersonTypeSelect: function (oEvent) {
				var oModel = this.getView().getModel("prospectModel");

				oModel.setProperty("/STCD1", "");
				oModel.setProperty("/STCD2", "");
				this.getView().byId("CPFInputID").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("CNPJInputID").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("CPFInputID").setValueStateText('');
				this.getView().byId("CNPJInputID").setValueStateText('');
				this.getView().byId("CPFInputIDF3").setValueState(sap.ui.core.ValueState.None);
				//	this.getView().byId("CNPJInputID").setValueState(sap.ui.core.ValueState.None);
				this.getView().byId("CPFInputIDF3").setValueStateText('');
				//	this.getView().byId("CNPJInputID").setValueStateText('');
				this._validateForm();
			},

			_onCPFChange: function (oEvent) {
				var oSource = oEvent.getSource();
				var oValue = oSource.getValue().replace(/[._-]/g, '');
				var sValueState = oValue.length === 11 || oValue.length === 0 ? 'None' : 'Error';
				var sValueStateMessage = oValue.length === 11 || oValue.length === 0 ? '' : 'Campo inválido';

				oSource.setValueState(sValueState);
				oSource.setValueStateText(sValueStateMessage);
				//this._validateForm();

				if (sValueState === 'Error') {
					sap.m.MessageToast.show(sValueStateMessage);
				}
			},

			_onCNPJChange: function (oEvent) {
				var oSource = oEvent.getSource();
				var oValue = oSource.getValue().replace(/[._/-]/g, '');
				var sValueState = oValue.length === 14 || oValue.length === 0 ? 'None' : 'Error';
				var sValueStateMessage = oValue.length === 14 || oValue.length === 0 ? '' : 'Valor invalido';

				oSource.setValueState(sValueState);
				oSource.setValueStateText(sValueStateMessage);
				//this._validateForm();

				if (sValueState === 'Error') {
					sap.m.MessageToast.show(sValueStateMessage);
				}
			},

			_onPhoneNumberChange: function (oEvent) {
				var oSource = oEvent.getSource();
				var oValue = oSource.getValue().replace(/[()._/-]/g, '');

				var personType = this.getView().byId("segmentedPersonID").getSelectedKey();
				var sValueState;
				var sValueStateMessage;

				if (personType === "F3") {
					sValueState = oValue.length >= 12 || oValue.length === 0 ? 'None' : 'Error';
					sValueStateMessage = oValue.length >= 12 || oValue.length === 0 ? '' : 'Invalid Input';
				} else {
					sValueState = oValue.length >= 11 || oValue.length === 0 ? 'None' : 'Error';
					sValueStateMessage = oValue.length >= 11 || oValue.length === 0 ? '' : 'Invalid Input';

				}

				oSource.setValueState(sValueState);
				oSource.setValueStateText(sValueStateMessage);
				//this._validateForm();

				if (sValueState === 'Error') {
					sap.m.MessageToast.show(sValueStateMessage);
				}
			},

			_onCepChange: function (oEvent) {
				var oSource = oEvent.getSource();
				var oValue = oSource.getValue().replace(/[()._/-]/g, '');
				var sValueState = oValue.length >= 8 || oValue.length === 0 ? 'None' : 'Error';
				var sValueStateMessage = oValue.length >= 8 || oValue.length === 0 ? '' : 'Valor inválido';

				oSource.setValueState(sValueState);
				oSource.setValueStateText(sValueStateMessage);
				//this._validateForm();

				if (sValueState === 'Error') {
					sap.m.MessageToast.show(sValueStateMessage);
				}
			},

			_onStateRegChange: function (oEvent) {
				var oSource = oEvent.getSource();
				var oValue = oSource.getValue().replace(/[()._/-]/g, '');
				var sValueState = oValue.length === 10 || oValue.length === 0 ? 'None' : 'Error';
				var sValueStateMessage = oValue.length === 10 || oValue.length === 0 ? '' : 'Valor inválido';

				oSource.setValueState(sValueState);
				oSource.setValueStateText(sValueStateMessage);
				//this._validateForm();

				if (sValueState === 'Error') {
					sap.m.MessageToast.show(sValueStateMessage);
				}

			},

			onAdditionalAdressPress: function () {
				var oAdditionalAdressField = this.getView().byId("additionalAdressID");

				oAdditionalAdressField.setValue("");
				this._validateForm();
			},

			_validateEmail: function (oEvent) {
				var oInput = oEvent.getSource();
				var mailRegex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
				var bValid = mailRegex.test(oInput.getValue());
				var sValueState = bValid || oInput.getValue().length === 0 ? 'None' : 'Error';
				var sValueStateMessage = bValid || oInput.getValue().length === 0 ? '' : 'Digite um email valido.';

				oInput.setValueState(sValueState);
				oInput.setValueStateText(sValueStateMessage);

				if (sValueState === 'Error') {
					sap.m.MessageToast.show(sValueStateMessage);
				}

				//this._validateForm();
			},

			_validateCountries: function (oEvent) {
				var oInput = oEvent.getSource();
				oInput.getValue();

				var oTable = this.getView().byId("states");
				var oFilters = [];

				if (oInput.getSelectedKey() === "PY") {
					this.getView().getModel("prospectModel").setProperty("/isPY", true);
				} else {
					this.getView().getModel("prospectModel").setProperty("/isPY", false);
				}

				oFilters.push(new sap.ui.model.Filter("LAND1", sap.ui.model.FilterOperator.Contains, oInput.getSelectedKey()));
				oTable.getBinding("items").filter(oFilters);
				//	this._validateForm();
			},
			_validateCompanyBank: function (oEvent) {
				var oInput = oEvent.getSource();
				oInput.getValue();

				var oTableCompanyBank = this.getView().byId("company_bank");
				var oFiltersCompanyBank = [];

				oFiltersCompanyBank.push(new sap.ui.model.Filter("BUKRS", sap.ui.model.FilterOperator.Contains, oInput.getSelectedKey()));
				oTableCompanyBank.getBinding("items").filter(oFiltersCompanyBank);
				//	this._validateForm();
			},
			_validateForm: function (oEvent) {

				var oInput = oEvent.getSource();
				var mailRegex =
					/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
				var bValid = mailRegex.test(oInput.getValue());
				var sValueState = bValid ? 'Error' : 'None';
				var sValueStateMessage = bValid ? 'Caracteres inválidos' : '';

				oInput.setValueState(sValueState);
				oInput.setValueStateText(sValueStateMessage);

				if (sValueState !== "Error") {
					var aInputControls = this._getFormFields();
					var oControl;
					//	var oProspectModel = this.getView().getModel("prospectModel");

					for (var m = 0; m < aInputControls.length; m++) {
						oControl = aInputControls[m].control;
						if (aInputControls[m].required) {
							var sValue = oControl.getValue();
							if (sValue && oControl.getValueStateText() !== 'Digite um email valido.' && oControl.getValueStateText() !== 'Invalid Input') {
								oControl.setValueState('None');
								//	oControl.setValueStateText('Campo requerido');
								//return;
							}
						}
					}
				} else {
					sap.m.MessageToast.show(sValueStateMessage);
				}

				// this._checkForErrorMessages();

			},

			_getFormFields: function () {
				var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
				var oAdressDataForm = this.byId("adressSimpleForm").getContent();
				var oAccountDataForm = this.byId("accountSimpleForm").getContent();
				var oBankDataForm = this.byId("bankDataSimpleForm").getContent();
				var oIrfDataForm = this.byId("irfSimpleForm").getContent();

				var oCharacteristics = this.getCharacteristicsFields();
				var oBanks = this.getBanksFields();
				var oIrf = this.getIrfFields();
				var oAllForms = oMainDataForm.concat(oAdressDataForm).concat(oAccountDataForm).concat(oIrfDataForm).concat(
					oBankDataForm).concat(oCharacteristics).concat(oBanks).concat(oIrf);
				var aControls = [];
				var sControlType;

				for (var i = 0; i < oAllForms.length; i++) {
					sControlType = oAllForms[i].getMetadata().getName();
					if (sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" || sControlType === "sap.m.Input" ||
						sControlType === "sap.m.DateTimeInput" || sControlType === "sap.m.DatePicker" ||
						sControlType === "sap.m.CheckBox" || sControlType === "sap.m.MaskInput" || sControlType === "sap.m.ComboBox") {
						if (oAllForms[i].getEnabled()) {
							aControls.push({
								control: oAllForms[i],
								required: oAllForms[i - 1].getRequired && oAllForms[i - 1].getRequired(),
								text: oAllForms[i - 1].getText
							});
						}
					}
				}
				return aControls;
			},

			_getTextsFields: function () {
				var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
				var oAdressDataForm = this.byId("adressSimpleForm").getContent();
				var oAccountDataForm = this.byId("accountSimpleForm").getContent();
				var oBankDataForm = this.byId("bankDataSimpleForm").getContent();
				var oIrfDataForm = this.byId("irfSimpleForm").getContent();

				var oCharacteristics = this.getCharacteristicsFields();
				var oBanks = this.getBanksFields();
				var oIrf = this.getIrfFields();
				var oAllForms = oMainDataForm.concat(oAdressDataForm).concat(oAccountDataForm).concat(oIrfDataForm).concat(
					oBankDataForm).concat(oCharacteristics).concat(oBanks).concat(oIrf);
				var aControls = [];
				var sControlType;

				for (var i = 0; i < oAllForms.length; i++) {
					var sControlType1 = oAllForms[i].getMetadata().getName();
					if (sControlType1 === "sap.m.Label") {
						if (sControlType = oAllForms[i + 1]) {
							sControlType = oAllForms[i + 1].getMetadata().getName();
							if (sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" || sControlType === "sap.m.Input" ||
								sControlType === "sap.m.DateTimeInput" || sControlType === "sap.m.DatePicker" ||
								sControlType === "sap.m.CheckBox" || sControlType === "sap.m.MaskInput" || sControlType === "sap.m.ComboBox") {
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

			generateUniqueKey: function () {
				return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
					(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
				);
			},

			getCharacteristicsFields: function () {
				var oCharDataFormContent = this.getView().byId("CharacteristicsSimpleForm").getContent();
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

			getIrfFields: function () {
				var oCharDataFormContent = this.getView().byId("irfSimpleForm").getContent();
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

			_onAddIrf: function () {

				var oModel = this.getOwnerComponent().getModel();

				var oTableCountries = this.getView().byId("countries");
				var oTableCountriesKey = oTableCountries.getSelectedKey();
				var oValidIrfArary;

				oModel.read("/View_Irf_Catogory", {
					success: function (oDataProspect) {
						oValidIrfArary = oDataProspect.results.filter(char => char.LAND1 === oTableCountriesKey);
						this.getView().getModel("prospectModel").setProperty("/data", oValidIrfArary);

						if (!this._oPlantPopoverIrf) {
							this._oPlantPopoverIrf = sap.ui.xmlfragment("popoverFragmentIrfID" + this.getView().getId(),
								"com.sap.build.standard.brfAppDeGraosModoEditar.view.prospects.fragments.IrfSelect",
								this);
							this.getView().addDependent(this._oPlantPopoverIrf);
							this._oPlantPopoverIrf.setModel(this.getView().getModel("prospectModel").getProperty("/data"));
						}
						this._oPlantPopoverIrf.open();
					}.bind(this)
				});
			},

			buildIrfTemplate: function (sPlant) {

				var oProspectModel = this.getView().getModel("prospectModel");
				var sChars = oProspectModel.getProperty("/Irf");
				var oTableCountries = this.getView().byId("countries");
				var oTableCountriesKey = oTableCountries.getSelectedKey();
				self = this;

				var aCustomData = [];
				if (!sChars) {
					oProspectModel.setProperty("/Irf", []);
				}

				var sCharLength = oProspectModel.getProperty("/Irf").length;
				oProspectModel.setProperty("/Irf/" + sCharLength, {});
				oProspectModel.setProperty("/Irf/" + sCharLength + "/status", "New");
				//oProspectModel.setProperty("/Banks/" + sCharLength + "/plant", sPlant);
				oProspectModel.setProperty("/Irf/" + sCharLength + "/WT_SUBJCT", "1");
				oProspectModel.setProperty("/Irf/" + sCharLength + "/WITHT", sPlant);

				aCustomData.push(new sap.ui.core.CustomData({
					key: "sPath",
					value: "/Irf/" + sCharLength
				}));

				var oItemTemplate = new sap.ui.core.ListItem({
					key: "{WITHT}",
					text: "{WITHT} - {TEXT40}",
					additionalText: "{addText}"
				});

				var oItemTemplate2 = new sap.ui.core.ListItem({
					key: "{WT_WITHCD}",
					text: "{WT_WITHCD} - {TEXT40}",
					additionalText: "{addText}"
				});

				return new sap.m.VBox({
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
							editable: true,
							emptySpanM: 0,
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
									text: "Categoria de IRF",
									design: "Standard",
									width: "100%",
									required: true,
									textAlign: "Begin",
									textDirection: "Inherit",
									visible: true
								}),
								new com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox({
									showSecondaryValues: true,
									selectedKey: "{prospectModel>/Irf/" + sCharLength + "/WITHT}",
									placeholder: "Selecione",
									editable: true,
									enabled: true,
									visible: true,
									width: 'auto',
									maxWidth: '100%',
									selectionChange: this._validateForm.bind(this),
									items: {
										path: '/View_Irf_Catogory',
										sorter: new sap.ui.model.Sorter("WITHT"),
										filters: new sap.ui.model.Filter("LAND1", sap.ui.model.FilterOperator.EQ, oTableCountriesKey),
										length: '999999',
										template: oItemTemplate
									}
								}),
								new sap.m.Label({
									text: "Código IRF",
									design: "Standard",
									width: "100%",
									required: true,
									textAlign: "Begin",
									textDirection: "Inherit",
									visible: true
								}),
								new com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox({
									showSecondaryValues: true,
									selectedKey: "{prospectModel>/Irf/" + sCharLength + "/WT_WITHCD}",
									placeholder: "Selecione",
									editable: true,
									enabled: true,
									visible: true,
									width: 'auto',
									maxWidth: '100%',
									selectionChange: this._validateForm.bind(this),
									items: {
										path: '/View_Irf_CODE',
										sorter: new sap.ui.model.Sorter("WT_WITHCD"),
										filters: [new sap.ui.model.Filter("WITHT", sap.ui.model.FilterOperator.EQ, this.getView().getModel("prospectModel").getProperty(
												"/Irf/" + sCharLength + "/WITHT")),
											new sap.ui.model.Filter("LAND1", sap.ui.model.FilterOperator.EQ, oTableCountriesKey)
										],
										length: '999999',
										template: oItemTemplate2
									}
								}),
								new sap.m.Label({
									text: "Sujeito IRF",
									design: "Standard",
									width: "100%",
									required: true,
									textAlign: "Begin",
									textDirection: "Inherit",
									visible: true
								}),
								new sap.m.SegmentedButton({
									width: "auto",
									selectedKey: "{prospectModel>/Irf/" + sCharLength + "/WT_SUBJCT}",
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
									customData: aCustomData
								}),
								new sap.m.Label({
									text: ""
								}),
								new sap.m.Toolbar({
									content: [
										new sap.m.ToolbarSpacer(),
										new sap.m.Button({
											icon: "sap-icon://sys-cancel",
											type: "Reject",
											width: "40%",
											text: "Excluir",
											press: this.removeIrf.bind(this)
										})
									]
								})
							]
						})
					]
				});
			},

			removeIrf: function (oEvent) {
				var oPropertyModel = this.getView().getModel("prospectModel");
				var oVBox = oEvent.getSource().getParent().getParent().getParent().getParent().getParent();
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

				MessageBox.warning(
					"Tem certeza que deseja remover esse IRF?", {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {
								if (oVBox) {
									var sPath = oVBox.getCustomData()[0].getValue();
									var oData = oPropertyModel.getProperty(sPath);

									oData.status = "Deleted";
									oVBox.destroy();
								}
							}
						}.bind(this)
					}
				);

				this._validateForm();
			},

			getBanksFields: function () {
				var oCharDataFormContent = this.getView().byId("bankDataSimpleForm").getContent();
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

			_onAddBanks: function () {

				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				var oCharForm = this.getView().byId("bankDataSimpleForm");

				MessageBox.information(
					"Deseja adicionar um novo banco?", {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {
								var oCharTemplate = this.buildBankTemplate();
								oCharForm.addContent(new sap.m.Label({
									text: ""
								}));
								oCharForm.addContent(oCharTemplate);
							}
						}.bind(this)
					}
				);
			},

			buildBankTemplate: function () {

				var oProspectModel = this.getView().getModel("prospectModel");
				var sChars = oProspectModel.getProperty("/Banks");
				var aCustomData = [];
				if (!sChars) {
					oProspectModel.setProperty("/Banks", []);
				}

				var sCharLength = oProspectModel.getProperty("/Banks").length;
				oProspectModel.setProperty("/Banks/" + sCharLength, {});
				oProspectModel.setProperty("/Banks/" + sCharLength + "/status", "New");
				//oProspectModel.setProperty("/Banks/" + sCharLength + "/plant", sPlant);

				aCustomData.push(new sap.ui.core.CustomData({
					key: "sPath",
					value: "/Banks/" + sCharLength
				}));

				var oItemTemplate = new sap.ui.core.ListItem({
					key: "{BANCO}",
					text: "{BANCO} - {NOME}",
					additionalText: "{addText}"
				});

				return new sap.m.VBox({
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
							layout: "ResponsiveGridLayout",
							content: [
								new sap.m.Label({
									text: "Titular Conta",
									design: "Standard",
									width: "100%",
									required: true,
									textAlign: "Begin",
									textDirection: "Inherit",
									visible: true
								}),
								new sap.m.Input({
									placeholder: "Digite o nome do Titular",
									width: "auto",
									maxLength: 0,
									value: "{prospectModel>/Banks/" + sCharLength + "/K0INH}"
								}),
								new sap.m.Label({
									text: "Banco",
									design: "Standard",
									width: "100%",
									required: true,
									textAlign: "Begin",
									textDirection: "Inherit",
									visible: true
								}),
								new com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox({
									showSecondaryValues: true,
									selectedKey: "{prospectModel>/Banks/" + sCharLength + "/BANCO}",
									placeholder: "Selecione o Banco",
									editable: true,
									enabled: true,
									visible: true,
									width: 'auto',
									maxWidth: '100%',
									selectionChange: this._validateForm.bind(this),
									items: {
										path: '/View_Banks',
										sorter: new sap.ui.model.Sorter("BANCO"),
										length: '999999',
										template: oItemTemplate
									}
								}),
								new sap.m.Label({
									text: "Agência",
									design: "Standard",
									width: "100%",
									required: true,
									textAlign: "Begin",
									textDirection: "Inherit",
									visible: true
								}),
								new sap.m.Input({
									placeholder: "Digite a Agência",
									type: "Text",
									width: "100%",
									required: true,
									maxLength: 0,
									value: "{prospectModel>/Banks/" + sCharLength + "/AGENCIA}"
								}),
								new sap.m.Input({
									placeholder: "Digito Agência",
									type: "Text",
									width: "30%",
									required: true,
									maxLength: 1,
									value: "{prospectModel>/Banks/" + sCharLength + "/DIG_AGENCIA}"
								}),
								new sap.m.Label({
									text: "Conta Corrente",
									design: "Standard",
									width: "100%",
									required: true,
									textAlign: "Begin",
									textDirection: "Inherit",
									visible: true
								}),
								new sap.m.Input({
									placeholder: "Digite a Conta Corrente",
									type: "Text",
									width: "auto",
									maxLength: 0,
									value: "{prospectModel>/Banks/" + sCharLength + "/CONTA}"
								}),
								new sap.m.Input({
									placeholder: "Digito Conta",
									type: "Text",
									width: "30%",
									required: true,
									maxLength: 1,
									value: "{prospectModel>/Banks/" + sCharLength + "/DIG_CONTA}"
								}),

								new sap.m.Label({
									text: ""
								}),
								new sap.m.Toolbar({
									content: [
										new sap.m.ToolbarSpacer(),
										new sap.m.Button({
											icon: "sap-icon://sys-cancel",
											type: "Reject",
											width: "40%",
											text: "Excluir",
											press: this.removeBanks.bind(this)
										})
									]
								})
							]
						})
					]
				});
			},

			removeBanks: function (oEvent) {
				var oPropertyModel = this.getView().getModel("prospectModel");
				var oVBox = oEvent.getSource().getParent().getParent().getParent().getParent().getParent();

				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

				MessageBox.warning(
					"Tem certeza que deseja remover esse Banco?", {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {
								if (oVBox) {
									var sPath = oVBox.getCustomData()[0].getValue();
									var oData = oPropertyModel.getProperty(sPath);

									oData.status = "Deleted";
									oVBox.destroy();
								}
							}
						}.bind(this)
					}
				);

				this._validateForm();
			},

			_onAddCharacteristics: function () {
				if (!this._oPlantPopover || this._oPlantPopover.bIsDestroyed) {
					this._oPlantPopover = sap.ui.xmlfragment("popoverFragmentID" + this.getView().getId(),
						"com.sap.build.standard.brfAppDeGraosModoEditar.view.prospects.fragments.PlantSelect",
						this);
					this.getView().addDependent(this._oPlantPopover);
					this._oPlantPopover.setModel(this.getView().getModel("popoverModel"));
				}
				this._oPlantPopover.open();
			},
			onCancelDialogPressed: function (oEvent) {
				oEvent.getSource().getParent().close();
			},

			buildCharacteristicTemplate: function (sPlant, sText) {

				var oProspectModel = this.getView().getModel("prospectModel");
				var sChars = oProspectModel.getProperty("/Characteristics");
				var aCustomData = [];
				if (!sChars) {
					oProspectModel.setProperty("/Characteristics", []);
				}

				var sCharLength = oProspectModel.getProperty("/Characteristics").length;
				oProspectModel.setProperty("/Characteristics/" + sCharLength, {});
				oProspectModel.setProperty("/Characteristics/" + sCharLength + "/status", "New");
				oProspectModel.setProperty("/Characteristics/" + sCharLength + "/plant", sPlant);
				oProspectModel.setProperty("/Characteristics/" + sCharLength + "/NAME1", sText);

				aCustomData.push(new sap.ui.core.CustomData({
					key: "sPath",
					value: "/Characteristics/" + sCharLength
				}));

				return new sap.m.VBox({
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
							layout: "ResponsiveGridLayout",
							title: "Centro: " + sPlant + " - " + sText,
							content: [
								new sap.m.Label({
									text: "Quilometragem (KM)",
									design: "Standard",
									width: "100%",
									required: true,
									textAlign: "Begin",
									textDirection: "Inherit",
									visible: true,
									change: this._validateForm.bind(this)
								}),
								new sap.m.Input({
									placeholder: "Digite e Distância em Km",
									type: "Number",
									required: true,
									width: "auto",
									maxLength: 0,
									value: "{prospectModel>/Characteristics/" + sCharLength + "/ATFLV}"
								}),
								new sap.m.Label({
									text: "Observações",
									design: "Standard",
									width: "100%",
									required: false,
									textAlign: "Begin",
									textDirection: "Inherit",
									visible: true
								}),
								new sap.m.TextArea({
									rows: 2,
									placeholder: "Adicione Observações. Exemplo: Trecho sem pavimentação",
									cols: 20,
									required: false,
									width: "auto",
									maxLength: 0,
									wrapping: "None",
									value: "{prospectModel>/Characteristics/" + sCharLength + "/HCP_COMMENTS}",
									change: this._validateForm.bind(this)
								}),
								new sap.m.Label({
									text: ""
								}),
								new sap.m.Toolbar({
									content: [
										new sap.m.ToolbarSpacer(),
										new sap.m.Button({
											icon: "sap-icon://sys-cancel",
											type: "Reject",
											width: "40%",
											text: "Excluir",
											press: this.removeCharacteristics.bind(this)
										})
									]
								})
							]
						})
					]
				});
			},

			removeCharacteristics: function (oEvent) {
				var oPropertyModel = this.getView().getModel("prospectModel");
				var oVBox = oEvent.getSource().getParent().getParent().getParent().getParent().getParent();

				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

				MessageBox.warning(
					"Tem certeza que deseja remover esse Centro/Km?", {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {
								if (oVBox) {
									var sPath = oVBox.getCustomData()[0].getValue();
									var oData = oPropertyModel.getProperty(sPath);

									oData.status = "Deleted";
									oVBox.destroy();
								}
							}
						}.bind(this)
					}
				);

				this._validateForm();
			},

			removeMask: function (sValue) {
				return sValue.replace(/[()._/-]/g, '');
			},

			findControlVBox: function (oControl) {
				if (oControl.getMetadata().getName() === "sap.m.VBox") {
					return oControl;
				} else {
					this.findControlVBox(oControl.getParent());
				}
				return oControl;
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
			_onButtonPress1: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {

					this.doNavigate("JConsultaTEste", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});

			},
			_onButtonPress2: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {

					this.doNavigate("JConsultaTEste", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
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

			getCharacteristics: function (sUniqueKey) {
				var oModel = this.getView().getModel("prospectModel");
				var oCharacteristics = oModel.getProperty("/Characteristics");
				var oChars = [];
				var nCount = 0;
				if (oCharacteristics) {
					var oValidCharacteristics = oCharacteristics.filter(characteristics => characteristics.status === "New");

					if (oValidCharacteristics) {
						for (var char of oValidCharacteristics) {

							nCount++;
							var sTimestamp = new Date().getTime() + nCount;

							oChars.push({
								HCP_CHARAC_ID: sTimestamp.toFixed(),
								HCP_UNIQUE_KEY: sUniqueKey,
								NAME1: char.NAME1,
								ATINN: char.plant,
								ATFLV: char.ATFLV,
								HCP_COMMENTS: char.HCP_COMMENTS,
								HCP_UPDATED_AT: this._formatDate(new Date()),
								HCP_CREATED_AT: this._formatDate(new Date())
							});
						}
					}
				}
				return oChars;
			},

			getBanks: function (sUniqueKey) {
				var oModel = this.getView().getModel("prospectModel");
				var oBanks = oModel.getProperty("/Banks");
				var oChars = [];
				var nCount = 0;
				if (oBanks) {
					var oValidBanks = oBanks.filter(characteristics => characteristics.status === "New");

					if (oValidBanks) {
						for (var char of oValidBanks) {

							nCount++;
							var sTimestamp = new Date().getTime() + nCount;

							oChars.push({
								HCP_BANK_ID: sTimestamp.toFixed(),
								HCP_UNIQUE_KEY: sUniqueKey,
								K0INH: char.K0INH,
								BANCO: char.BANCO,
								CONTA: char.CONTA,
								AGENCIA: char.AGENCIA,
								DIG_AGENCIA: char.DIG_AGENCIA,
								DIG_CONTA: char.DIG_CONTA,
								HCP_UPDATED_AT: this._formatDate(new Date()),
								HCP_CREATED_AT: this._formatDate(new Date())
							});
						}
					}
				}
				return oChars;
			},

			getIrf: function (sUniqueKey) {
				var oModel = this.getView().getModel("prospectModel");
				var oIrf = oModel.getProperty("/Irf");
				var oChars = [];
				var nCount = 0;

				if (oIrf) {
					var oValidIrf = oIrf.filter(characteristics => characteristics.status === "New");

					if (oValidIrf) {
						for (var char of oValidIrf) {

							nCount++;
							var sTimestamp = new Date().getTime() + nCount;

							oChars.push({
								HCP_IRF_ID: sTimestamp.toFixed(),
								HCP_UNIQUE_KEY: sUniqueKey,
								WITHT: char.WITHT,
								WT_WITHCD: char.WT_WITHCD,
								WT_SUBJCT: char.WT_SUBJCT,
								HCP_UPDATED_AT: this._formatDate(new Date()),
								HCP_CREATED_AT: this._formatDate(new Date())
							});
						}
					}
				}
				return oChars;
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

			onSave: function () {

				this.setBusyDialog("Prospect", "Cadastrando Prospect");

				var aInputControls = this._getTextsFields();
				var array = [];
				var oControl;
				var oProspectModel = this.getView().getModel("prospectModel");
				var oProspectData = oProspectModel.getProperty("/");

				// if (oProspectData.KTOKK === "F3" && !oProspectData.STCD1 && !oProspectData.STCD2) {
				// 	array.push({
				// 		field: 'CPF ou CNPJ'
				// 	});
				// }

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required) {
						var sHasValue = oControl.getValue() !== '' ? false : true;
						var sValue = aInputControls[m].text;
						var bValidate = true;

						var emoJiRegex =
							/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
						var bValid = emoJiRegex.test(oControl.getValue());

						if (sValue === "Email" && !bValid) {
							var mailRegex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
							bValidate = mailRegex.test(oControl.getValue());
						} else if (sValue === "Telefone" && !bValid) {
							var phoneRegex = /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/;
							bValidate = phoneRegex.test(oControl.getValue());
						} else if (sValue === "Telefone 2" && !bValid) {
							var phoneRegex2 = /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/;
							bValidate = phoneRegex2.test(oControl.getValue());
						} else if (sValue === "CPF" && !bValid) {
							var oValue = oControl.getValue().replace(/[._-]/g, '');
							bValidate = oValue.length === 11 || oValue.length === 0 ? true : false;
						} else if (sValue === "CNPJ" && !bValid) {
							var oValueCNPJ = oControl.getValue().replace(/[._/-]/g, '');
							bValidate = oValueCNPJ.length === 14 || oValueCNPJ.length === 0 ? true : false;
						}

						if (bValid || !bValidate) {
							oControl.setValueState('Error');
							oControl.setValueStateText('Campo inválido');
							array.push({
								field: sValue
							});
						} else {
							if (sHasValue) {
								oControl.setValueState('Error');
								oControl.setValueStateText('Campo requerido');
								array.push({
									field: sValue
								});
							} else {
								oControl.setValueState('None');
							}
						}

					}
				}

				if (array.length > 0) {
					this.closeBusyDialog();
					this.onDialogRequiredItems(array);
				} else {

					self = this;
					var aFilters = [];
					var oModel = this.getOwnerComponent().getModel();

					var sFilter = this.removeMask(oProspectData.STCD2) ? "STCD2" : "STCD1";
					var sValueType = this.removeMask(oProspectData.STCD2) ? this.removeMask(oProspectData.STCD2) : this.removeMask(oProspectData.STCD1);
					var sColumn = sFilter === "STCD2" ? "CPF" : "CNPJ";
					var aFiltersLocality = [];
					var sOrt1 = this.removeAccent(oProspectData.ORT01);

					aFiltersLocality.push(new sap.ui.model.Filter({
						path: "TEXT",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: sOrt1
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: sFilter,
						operator: sap.ui.model.FilterOperator.EQ,
						value1: sValueType
					}));

					oModel.read("/Prospects", {
						filters: aFilters,
						success: function (oResults) {
							if (oResults.results.length > 0) {

								if (oResults.results[0].HCP_STATUS === '4') {
									var bCompact = !!self.getView().$().closest(".sapUiSizeCompact").length;

									MessageBox.warning(
										"Já existe um prospect cadastrado com status recusa referente a esse " + sColumn + " , deseja atualiza-lo?", {
											actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
											styleClass: bCompact ? "sapUiSizeCompact" : "",
											onClose: function (sAction) {
												if (sAction === "YES") {
													self.updateProspect(oResults.results[0].HCP_PROSP_ID);
												}
											}.bind(this)
										}
									);
								} else if (sColumn === "CPF" && oProspectData.BRSCH === '0014') {

									if (oProspectData.KTOKK === "F3") {
										self.validateFormProspect(aFilters, oProspectData, sColumn);
									} else {
										self.getResponseViewLocality(aFiltersLocality).then(function () {
											self.validateFormProspect(aFilters, oProspectData, sColumn);
										}.bind(self));
									}
								} else {
									let cpfValue = aInputControls.find(item => item.text == "CNPJ").control.getValue();
									if (oProspectData.KTOKK !== "F2" && cpfValue !== "") {
										MessageBox.information("Coluna " + sColumn + " já existe como prospect, por favor verifique e tente novamente");
										self.closeBusyDialog();
									} else {
										if (!oProspectData.STCD1) {
											self.getResponseViewLocality(aFiltersLocality).then(function () {
												self.createProspect();
											}.bind(self));
										}
									}
								}

							} else {

								if (oProspectData.KTOKK === "F3") {
									self.validateFormProspect(aFilters, oProspectData, sColumn);
								} else {
									self.getResponseViewLocality(aFiltersLocality).then(function () {
										self.validateFormProspect(aFilters, oProspectData, sColumn);
									}.bind(self));
								}
							}
						}
					});
				}
			},

			createProspect: function () {
				return new Promise(function (resolve, reject) {
					var oModel = this.getOwnerComponent().getModel();
					var oProspectModel = this.getView().getModel("prospectModel");
					var oProspectData = oProspectModel.getProperty("/");

					var oDeviceModel = this.getOwnerComponent().getModel("device");
					var bIsMobile = oDeviceModel.getData().browser.mobile;

					var sUniqueKey = this.generateUniqueKey();
					var oCharacteristics = this.getCharacteristics(sUniqueKey);
					var oBanks = this.getBanks(sUniqueKey);
					var oIrf = this.getIrf(sUniqueKey);

					var sTimestamp = new Date().getTime();

					var oProperties = {
						HCP_PROSP_ID: sTimestamp.toFixed(),
						NAME1: oProspectData.NAME1,
						NAME2: oProspectData.NAME2,
						KTOKK: oProspectData.KTOKK,
						STCD2: this.removeMask(oProspectData.STCD2),
						STCD1: this.removeMask(oProspectData.STCD1),
						EMAIL: oProspectData.EMAIL ? oProspectData.EMAIL : '',
						TELF1: this.removeMask(oProspectData.TELF1),
						BLAND: oProspectData.BLAND,
						ORT02: oProspectData.ORT02 ? oProspectData.ORT02 : '',
						STRAS: oProspectData.STRAS ? oProspectData.STRAS : '',
						HOUSE_NUM1: oProspectData.HOUSE_NUM1 ? oProspectData.HOUSE_NUM1 : '',
						PSTLZ: oProspectData.PSTLZ ? oProspectData.PSTLZ : '',
						STRAS2: oProspectData.STRAS2,
						BRSCH: oProspectData.BRSCH,
						EKORG: oProspectData.EKORG,
						STCD3: oProspectData.STCD3,
						OBSER: oProspectData.OBSER,
						HCP_STATUS: "1",
						HCP_UNIQUE_KEY: sUniqueKey,
						ZDTNASC: oProspectData.ZDTNASC ? this._formatDate(oProspectData.ZDTNASC) : null,
						ORT01: this.removeAccent(oProspectData.ORT01),
						LAND1: oProspectData.LAND1,
						TXJCD: oProspectData.BLAND,
						FDGRV: oProspectData.FDGRV,
						INTAD: oProspectData.INTAD,
						ZWELS: oProspectData.ZWELS,
						AKONT: oProspectData.AKONT,
						ZLOW: oProspectData.KTOKK,
						BUKRS: oProspectData.BUKRS,
						SIGLA: this.userName,
						TELFX: oProspectData.TELFX,
						HCP_PLATAFORM: bIsMobile ? '1' : '2',
						HCP_CREATED_BY: this.userName,
						HCP_UPDATED_BY: this.userName,
						HCP_UPDATED_AT: this._formatDate(new Date()),
						HCP_CREATED_AT: this._formatDate(new Date())
					};

					oModel.createEntry("/Prospects", {
						properties: oProperties
					});

					for (var char of oCharacteristics) {
						oModel.createEntry("/Characteristics", {
							properties: char
						});
					}

					for (var charBanks of oBanks) {
						oModel.createEntry("/Banks", {
							properties: charBanks
						});
					}

					for (var charIrf of oIrf) {
						oModel.createEntry("/Irf", {
							properties: charIrf
						});
					}

					if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
						oModel.submitChanges({
							success: function () {
								//	this.flushStore("Prospects,Characteristics,Banks,Irf").then(function () {
								//		this.refreshStore("Prospects").then(function () {
								//			this.refreshStore("Characteristics").then(function () {
								//				this.refreshStore("Banks").then(function () {
								//					this.refreshStore("Irf").then(function () {
								MessageBox.success(
									"Prospect cadastrado com sucesso!.", {
										actions: [sap.m.MessageBox.Action.OK],
										onClose: function (sAction) {
											this.closeBusyDialog();
											this.navBack();
										}.bind(this)
									}
								);
								resolve();
								//					}.bind(this));
								//				}.bind(this));
								//			}.bind(this));
								//		}.bind(this));
								//	}.bind(this));
							}.bind(this),
							error: function () {
								MessageBox.error("Erro ao cadastrar prospect.");
								this.closeBusyDialog();
							}.bind(this)
						});
					} else {
						oModel.submitChanges({
							success: function () {
								MessageBox.success(
									"Prospect cadastrado com sucesso!.", {
										actions: [sap.m.MessageBox.Action.OK],
										onClose: function (sAction) {
											this.closeBusyDialog();
											this.navBack();
										}.bind(this)
									}
								);
							}.bind(this),
							error: function () {
								MessageBox.error("Erro ao cadastrar prospect.");
								this.closeBusyDialog();
							}.bind(this)
						});
					}

				}.bind(this));

			},

			updateProspect: function (HCP_PROSP_ID) {

				var aFilters = [];
				var oModel = this.getOwnerComponent().getModel();
				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;
				self = this;

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_PROSP_ID",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: HCP_PROSP_ID
				}));

				oModel.read("/Prospects", {
					filters: aFilters,
					success: function (oResultsProspects) {

						if (oResultsProspects.results.length > 0) {

							var oProspectModel = self.getView().getModel("prospectModel");
							var oProspectData = oProspectModel.getProperty("/");

							var oCharacteristics = self.getCharacteristics(oResultsProspects.results[0].HCP_UNIQUE_KEY);
							var oBanks = self.getBanks(oResultsProspects.results[0].HCP_UNIQUE_KEY);
							var oIrf = self.getIrf(oResultsProspects.results[0].HCP_UNIQUE_KEY);

							var oPropertiesRefused = {
								NAME1: oProspectData.NAME1,
								NAME2: oProspectData.NAME2,
								KTOKK: oProspectData.KTOKK,
								STCD2: self.removeMask(oProspectData.STCD2),
								STCD1: self.removeMask(oProspectData.STCD1),
								EMAIL: oProspectData.EMAIL,
								TELF1: self.removeMask(oProspectData.TELF1),
								BLAND: oProspectData.BLAND,
								ORT02: oProspectData.ORT02,
								STRAS: oProspectData.STRAS,
								HOUSE_NUM1: oProspectData.HOUSE_NUM1,
								PSTLZ: oProspectData.PSTLZ,
								STRAS2: oProspectData.STRAS2,
								BRSCH: oProspectData.BRSCH,
								EKORG: oProspectData.EKORG,
								STCD3: oProspectData.STCD3,
								OBSER: oProspectData.OBSER,
								HCP_STATUS: "1",
								ZDTNASC: oProspectData.ZDTNASC ? self._formatDate(oProspectData.ZDTNASC) : null,
								ORT01: self.removeAccent(oProspectData.ORT01),
								LAND1: oProspectData.LAND1,
								TXJCD: oProspectData.BLAND,
								FDGRV: oProspectData.FDGRV,
								INTAD: oProspectData.INTAD,
								ZWELS: oProspectData.ZWELS,
								AKONT: oProspectData.AKONT,
								ZLOW: oProspectData.KTOKK,
								BUKRS: oProspectData.BUKRS,
								SIGLA: self.userName,
								TELFX: oProspectData.TELFX,
								HCP_UPDATED_BY: self.userName,
								HCP_UPDATED_AT: self._formatDate(new Date())
							};

							var sPathSuccess = "%252FProspects(" + oResultsProspects.results[0].HCP_PROSP_ID + "l)";

							oModel.update("/Prospects(" + oResultsProspects.results[0].HCP_PROSP_ID + ")", oPropertiesRefused, {
								success: function () {
									sap.m.MessageToast.show("Prospect salvo com sucesso!");

									oModel.read("/Prospects", {
										success: function (oData) {
											//console.log(oData, 'maylon');
											self.getView().getModel("prospects").setProperty("/data", oData.results);
											self.getView().getModel("prospects").setProperty("/count", oData.results.length);
											//	this.getView().getModel("prospects").setProperty("/user", userModel.oData.name);
											//	this.getView().getModel("prospects").setProperty("/user2", userModel.oData.email);
											this.closeBusyDialog();
										}.bind(this)
									});

									setTimeout(function () {
										self.oRouter.navTo("prospects.Edit", {
											PROSP_ID: decodeURIComponent(sPathSuccess)
										});
									}.bind(this), 500);
								},
								error: function () {
									sap.m.MessageToast.show("Ocorreu um erro.");
									this.closeBusyDialog();
								}
							});

							for (var char of oCharacteristics) {
								oModel.createEntry("/Characteristics", {
									properties: char
								});
							}

							for (var charBanks of oBanks) {
								oModel.createEntry("/Banks", {
									properties: charBanks
								});
							}

							for (var charIrf of oIrf) {
								oModel.createEntry("/Irf", {
									properties: charIrf
								});
							}

							if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
								oModel.submitChanges({
									groupId: "changes",
									success: function () {
										//this.flushStore("Prospects,Characteristics,Banks,Irf").then(function () {
										//	this.refreshStore("Prospects").then(function () {
										//		this.refreshStore("Characteristics").then(function () {
										//			this.refreshStore("Banks").then(function () {
										//				this.refreshStore("Irf").then(function () {
										MessageBox.success(
											"Prospect salvo com sucesso!.", {
												actions: [sap.m.MessageBox.Action.OK],
												onClose: function (sAction) {
													this.closeBusyDialog();
													this.navBack();
												}.bind(this)
											}
										);
										//				}.bind(this));
										//			}.bind(this));
										//		}.bind(this));
										//	}.bind(this));

										//}.bind(this));
									}.bind(this),
									error: function () {
										console.log("Erro ao cadastrar prospect.");
									}.bind(this)
								});
							} else {
								oModel.submitChanges({
									groupId: "changes",
									success: function () {
										MessageBox.success(
											"Prospect salvo com sucesso!.", {
												actions: [sap.m.MessageBox.Action.OK],
												onClose: function (sAction) {
													this.closeBusyDialog();
													this.navBack();
												}.bind(this)
											}
										);
									}.bind(this),
									error: function () {
										console.log("Erro ao cadastrar prospect.");
									}.bind(this)
								});
							}

						}
					}.bind(this)
				});

			},

			_onUpdateSuccess: function (sPath) {
				sap.m.MessageToast.show("Prospect salvo com sucesso!");
				/*
			setTimeout(function () {
				this.oRouter.navTo("prospects.Edit", {
					PROSP_ID: decodeURIComponent(sPath)
				});
			}.bind(this), 500);
*/
			},
			_onUpdateError: function () {
				sap.m.MessageToast.show("Ocorreu um erro.");

			},

			_onCreateError: function () {
				sap.m.MessageToast.show("Erro ao salvar Prospect");
			},
			handleUploadPress: function (oEvent) {

				var oFileUploader = this.getView().byId("fileUploader");
				var file = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];
				this.getView().byId("cmisname").setValue(file.name);
				//this.getView().byId("cmis:name").setValue(file.name);

				oFileUploader.setUploadUrl("/cmis/3154222f4892b2883153bdb5/root");
				oFileUploader.setFileType("multipart/form-data");
				jQuery.sap.delayedCall(100, this, function () {
					oFileUploader.upload();
				});
				sap.m.MessageToast.show(file.name + " salvo com sucesso!");

			},
			getOutlookToken: function () {
				window.location.href = 'https://addressmanagerapplicane6300ec0.br1.hana.ondemand.com/address-manager-application';
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
			onCancel: function (oEvent) {
				//this.setBusyDialog("App Grãos", "Aguarde");
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

				MessageBox.warning(
					"Tem certeza que deseja voltar? As infomações cadastradas não serão salvas!", {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {
								this.navBack();
							} else {
								this.closeBusyDialog();
							}
						}.bind(this)
					}
				);
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
			_onCharacteristicsApplySearch: function (oEvent) {
				var oList = sap.ui.core.Fragment.byId("popoverFragmentID" + this.getView().getId(), "popoverFragmentID");
				var oFilterBar = sap.ui.core.Fragment.byId("popoverFragmentID" + this.getView().getId(), "fbCharacteristics");
				var oFilters = this._getCharacteristicsFilter(oFilterBar);

				oList.getBinding("items").filter(oFilters);
			},

			_getCharacteristicsFilter: function (oFilterBar) {
				var aFilterItems = oFilterBar.getAllFilterItems();
				var aFilters = [];
				for (var i = 0; i < aFilterItems.length; i++) {
					aFilters.push(new sap.ui.model.Filter({
						path: aFilterItems[i].getName(),
						operator: sap.ui.model.FilterOperator.Contains,
						value1: oFilterBar.determineControlByFilterItem(aFilterItems[i]).getValue()
					}));
				}
				return aFilters;
			},
			onPartnerDialogClose: function () {
				this._oPlantPopover.close();
				//this._oNewScheduleDialog.openBy(this._scheduleRequestSource);
			},
			onCharPlantSelected: function (oEvent) {

				var oSource = oEvent.getSource();
				var SelectedPartner = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

				var sPlant = SelectedPartner.WERKS;
				var sText = SelectedPartner.NAME1;
				var oCharForm = this.getView().byId("CharacteristicsSimpleForm");
				var oProspectModel = this.getView().getModel("prospectModel");
				var sCurrentChars = oProspectModel.getProperty("/Characteristics") || [];
				var bHasPlant = sCurrentChars.filter(char => char.plant.toString() === sPlant && char.status === "New").length > 0 ? true : false;

				if (bHasPlant) {
					MessageBox.information("Centro já cadastrado, por favor selecione outro.");
					this._oPlantPopover.destroy();
				} else {
					this._oPlantPopover.destroy();
					var oCharTemplate = this.buildCharacteristicTemplate(sPlant, sText);
					oCharForm.addContent(new sap.m.Label({
						text: ""
					}));
					oCharForm.addContent(oCharTemplate);
					this._validateForm();
					// setTimeout(function () {
					// 	oCharTemplate.getDomRef().focus();
					// }, 500);
				}
			},
			removeAccent: function (text) {
				text = text.toLowerCase();
				text = text.replace(new RegExp('[ÁÀÂÃ]', 'gi'), 'a');
				text = text.replace(new RegExp('[ÉÈÊ]', 'gi'), 'e');
				text = text.replace(new RegExp('[ÍÌÎ]', 'gi'), 'i');
				text = text.replace(new RegExp('[ÓÒÔÕ]', 'gi'), 'o');
				text = text.replace(new RegExp('[ÚÙÛ]', 'gi'), 'u');
				text = text.replace(new RegExp('[Ç]', 'gi'), 'c');
				return text.toUpperCase();
			},
			validateFormProspect: function (aFilters, oProspectData, sColumn) {

				var oModel = this.getOwnerComponent().getModel();
				self = this;

				oModel.read("/View_Suppliers", {
					filters: aFilters,
					success: function (oResultsSuppliers) {
						if (oResultsSuppliers.results.length > 0) {

							if (sColumn === "CPF" && oProspectData.BRSCH === '0014') {

								if (!oProspectData.STCD3) {
									MessageBox.information("Inscrição estadual deve ser preenchido.");
								} else {
									var sIESaved = '';

									for (var data in oResultsSuppliers.results) {
										if (sIESaved != '') {
											sIESaved = sIESaved + ", " + oResultsSuppliers.results[data].STCD3;
										} else {
											sIESaved = sIESaved + oResultsSuppliers.results[data].STCD3;
										}
									}

									var bCompact = !!self.getView().$().closest(".sapUiSizeCompact").length;

									MessageBox.warning(
										"Você já possui cadastros atrelados a esse CPF, deseja continuar? Campo Incrição estadual deve ser diferente dos cadastrados : " +
										sIESaved, {
											actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
											styleClass: bCompact ? "sapUiSizeCompact" : "",
											onClose: function (sAction) {
												if (sAction === "YES") {

													var hasError = false;
													for (var dataStcd3 in oResultsSuppliers.results) {
														if (oProspectData.STCD3 === oResultsSuppliers.results[dataStcd3].STCD3) {
															hasError = true;
														}
													}
													if (hasError) {
														MessageBox.warning("Inscrição estadual deve ser diferente de: " + sIESaved);
													} else {
														self.createProspect();
													}
												}
											}.bind(this)
										}
									);
								}

							} else {
								MessageBox.information("Coluna " + sColumn +
									" já existe como um fornecedor, por favor verifique e tente novamente");
								self.closeBusyDialog();
							}
						} else {
							self.createProspect();
						}
					}
				});
			},
			onIrfPlantSelected: function (oEvent) {

				var sPlant = oEvent.getParameter("item").getKey();

				var oCharForm = this.getView().byId("irfSimpleForm");

				var oCharTemplate = this.buildIrfTemplate(sPlant);
				oCharForm.addContent(new sap.m.Label({
					text: ""
				}));
				oCharForm.addContent(oCharTemplate);
				this._oPlantPopoverIrf.close();

			},
			getResponseViewLocality: function (aFiltersLocality) {
				self = this;
				return new Promise(function (resolve, reject) {
					var oModel = this.getOwnerComponent().getModel();
					oModel.read("/View_Locality", {
						filters: aFiltersLocality,
						success: function (oResultsLocality) {
							if (oResultsLocality.results.length > 0) {
								resolve();
							} else {
								var oMunicipio = self.getView().byId("municipio");
								oMunicipio.setValueState('Error');
								oMunicipio.setValueStateText('Campo Município inválido');
								MessageBox.warning("Campo Município inválido, por favor verifique.");
								self.closeBusyDialog();
								reject();
							}
						}
					});
				}.bind(this));
			},
			_validatePhone: function (oEvent) {

				var oInput = oEvent.getSource();
				var mailRegex = /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/;
				var bValid = mailRegex.test(oInput.getValue());
				var sValueState = bValid || oInput.getValue().length === 0 ? 'None' : 'Error';
				var sValueStateMessage = bValid || oInput.getValue().length === 0 ? '' : 'Digite um telefone valido Ex: (99) 9999-9999';

				oInput.setValueState(sValueState);
				oInput.setValueStateText(sValueStateMessage);
				//this._validateForm();
				if (sValueState === 'Error') {
					sap.m.MessageToast.show(sValueStateMessage);
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
								var oProspectModel = this.getView().getModel("prospectModel");
								if (oData.results[0].EKORG) {
									oProspectModel.setProperty("/EKORG", oData.results[0].EKORG);
								}
							}
							this.closeBusyDialog();
						}.bind(this),
						error: function (eError) {
							//	MessageBox.error("Erro ao buscar grupo de compra.");
							this.closeBusyDialog();
						}
					});

				}.bind(this), 500);
			}
		});
	},
	/* bExport= */
	true);