sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/List',
	'sap/m/StandardListItem'
], function (MainController, MessageBox, History, JSONModel, formatter, Button, Dialog, List, StandardListItem) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.prospects.Edit", {
		formatter: formatter,

		onInit: function () {

			this.setBusyDialog("Prospect", "Carregando dados, por favor aguarde");
			var oModel = this.getOwnerComponent().getModel();
			var oProspects = new JSONModel({
				enableSave: false,
				enableApprove: false,
				AdditionalAdressPress: false,
				cancelProspect: false,
				rotateProspect: false,
				approvedProspect: false,
				rotateButton: false,
				isLoad: false
			});

			this.getView().setModel(oProspects, "prospectModel");

			oModel.attachRequestCompleted(function () {

				var oProspectModel = this.getView().getModel("prospectModel");
				var isLoad = oProspectModel.getProperty("/isLoad");
				//this.userName = this.getOwnerComponent().userName;
				if (!isLoad) {
					oProspectModel.setProperty("/isLoad", true);
					this.closeBusyDialog();
				}

			}.bind(this));

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("prospects.Edit").attachPatternMatched(this._onObjectMatched, this);

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
		convertTextToIndexFormatter: function (sTextValue) {
			var oRadioButtonGroup = this.byId(
				"sap_uxap_ObjectPageLayout_0-sections-sap_uxap_ObjectPageSection-2-subSections-sap_uxap_ObjectPageSubSection-1-blocks-build_simple_form_Form-1537889366673-formContainers-build_simple_form_FormContainer-1-formElements-build_simple_form_FormElement-1537889779797-fields-sap_m_RadioButtonGroup-1537889854058-miv9ovz125lyr72ymexli7ui6_S6-c9sm7etwa1vlnkxgxcit549z80_S80-w4y3untxj6vere9mcj3jwges87_S87"
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
		_onRadioButtonGroupSelect: function () {

		},
		_onButtonPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("JCentroKm", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

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

				this.doNavigate("Consulta", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onButtonPress2: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("prospects.Index", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},

		getOdataArray: function (oObject) {

			var oModel = this.getView().getModel();
			var sSavedChars = [];

			if (oObject) {
				for (var index in oObject.__list) {
					var sCharPath = oObject.__list[index];

					sSavedChars.push({
						data: oModel.getProperty("/" + sCharPath),
						sPath: "/" + sCharPath
					});
				}
			}
			return sSavedChars;
		},

		onDialogRequiredItems: function (araryFields, title) {

			var oModel = new JSONModel({});

			this.getView().setModel(oModel, "requiredFields");
			oModel.setProperty("/fields", araryFields);

			if (!this.pressDialog) {
				this.pressDialog = new Dialog({
					title: title,
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

		onEdit: function (isApprove) {

			// //var aInputControls = this._getFormFields();
			this.setBusyDialog("App Grãos", "Salvando prospect, aguarde");

			var aInputControls = this._getTextsFields();
			var array = [];
			var arrayAvaliableFields = ['Domicílio Fiscal', 'Agrupamento da estrutura regional',
				'Condições pagto', 'Incoterms', 'Condições pagto Empresa', 'Grp. De Adm. Tesouraria', 'Forma de pagamento',
				'Conta conciliação', 'Org. Compras', 'Setor Industrial'
			];
			var oControl;

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
				for (var sField of arrayAvaliableFields) {
					if (sField === aInputControls[m].text) {
						oControl.setValueState('None');
					}
				}
			}

			if (array.length > 0) {
				this.closeBusyDialog();
				this.onDialogRequiredItems(array, 'Campos requeridos');
			} else {

				//this.setBusyDialog("App Grãos", "Salvando prospect");
				self = this;
				var sPath = this.getView().getElementBinding().getPath();
				var oObject = this.getView().getModel().getObject(sPath);
				var oModel = this.getOwnerComponent().getModel();
				var aFilters = [];
				var aFiltersLocality = [];
				var sFilter = this.removeMask(oObject.STCD2) ? "STCD2" : "STCD1";
				var sOrt1 = this.removeAccent(oObject.ORT01);

				aFiltersLocality.push(new sap.ui.model.Filter({
					path: "TEXT",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: sOrt1
				}));

				if (oObject.KTOKK === "F3") {
					self.validateFormProspect(aFilters, oObject, sFilter, isApprove);
				} else {
					oModel.read("/View_Locality", {
						filters: aFiltersLocality,
						success: function (oResultsLocality) {
							if (oResultsLocality.results.length > 0) {
								self.validateFormProspect(aFilters, oObject, sFilter, isApprove);
							} else {
								self.closeBusyDialog();
								var oMunicipio = self.getView().byId("municipio");
								oMunicipio.setValueState('Error');
								oMunicipio.setValueStateText('Campo Município inválido');
								MessageBox.warning("Campo Município inválido, por favor verifique.");
							}
						}
					});
				}

			}
		},

		updateProspect: function (isApprove) {

			var sPath = this.getView().getElementBinding().getPath();
			var oObject = this.getView().getModel().getObject(sPath);
			var oModel = this.getOwnerComponent().getModel();

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			var oCharacteristicsOdata = this.getOdataArray(oObject.Prosp_Characteristics);
			var oBanksOdata = this.getOdataArray(oObject.Prosp_Banks);
			var oIrfOdata = this.getOdataArray(oObject.Prosp_Irf);

			var oCharacteristics = this.getCharacteristics(oObject.HCP_UNIQUE_KEY);
			var oBanks = this.getBanks(oObject.HCP_UNIQUE_KEY);
			var oIrf = this.getIrf(oObject.HCP_UNIQUE_KEY);

			var oPropertiesEdit = {
				NAME1: oObject.NAME1,
				NAME2: oObject.NAME2,
				KTOKK: oObject.KTOKK,
				STCD2: this.removeMask(oObject.STCD2),
				STCD1: this.removeMask(oObject.STCD1),
				EMAIL: oObject.EMAIL ? oObject.EMAIL : '',
				TELF1: this.removeMask(oObject.TELF1),
				BLAND: oObject.BLAND,
				ORT02: oObject.ORT02 ? oObject.ORT02 : '',
				STRAS: oObject.STRAS ? oObject.STRAS : '',
				HOUSE_NUM1: oObject.HOUSE_NUM1 ? oObject.HOUSE_NUM1 : '',
				PSTLZ: oObject.PSTLZ ? oObject.PSTLZ : '',
				STRAS2: oObject.STRAS2,
				BRSCH: oObject.BRSCH,
				EKORG: oObject.EKORG,
				STCD3: oObject.STCD3,
				OBSER: oObject.OBSER,
				ZDTNASC: oObject.ZDTNASC ? this._formatDate(oObject.ZDTNASC) : null,
				ORT01: this.removeAccent(oObject.ORT01),
				LAND1: oObject.LAND1,
				TXJCD: oObject.KTOKK === "F3" ? oObject.BLAND : '',
				FDGRV: oObject.FDGRV,
				INTAD: oObject.INTAD,
				ZWELS: oObject.ZWELS,
				AKONT: oObject.AKONT,
				ZLOW: oObject.KTOKK,
				BUKRS: oObject.BUKRS,
				TELFX: oObject.TELFX,
				HCP_UPDATED_AT: this._formatDate(new Date()),
				HCP_UPDATED_BY: this.userName
			};

			oModel.update(sPath, oPropertiesEdit, {
				groupId: "changes"
			});

			for (var charOdata of oCharacteristicsOdata) {
				oModel.update(charOdata.sPath, charOdata.data);
			}

			for (var charBankOdata of oBanksOdata) {

				oModel.update(charBankOdata.sPath, charBankOdata.data);
			}

			for (var charIrfOdata of oIrfOdata) {

				oModel.update(charIrfOdata.sPath, charIrfOdata.data);

			}

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
						//	this.flushStore("Prospects,Characteristics,Banks,Irf").then(function () {
						//		this.refreshStore("Prospects").then(function () {
						//			this.refreshStore("Characteristics").then(function () {
						//				this.refreshStore("Banks").then(function () {
						//					this.refreshStore("Irf").then(function () {
						if (isApprove === true) {
							this.saveECC();
						} else {
							this.closeBusyDialog();
							var oProspectModel = this.getView().getModel("prospectModel");
							oProspectModel.setProperty("/Banks", []);
							oProspectModel.setProperty("/Irf", []);
							oProspectModel.setProperty("/Characteristics", []);

							var sObjectPath = "/Prospects(" + oObject.HCP_PROSP_ID + "l)";
							this.clearCharacteristicContainers();
							this.setCharacteristicsContainer(sObjectPath);
							this.clearBankContainers();
							this.setBanksContainer(sObjectPath);
							this.clearIrfContainers();
							this.setIrfContainer(sObjectPath);
							MessageBox.success(
								"Prospect salvo com sucesso!.", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
										this.navBack();
									}.bind(this)
								}
							);
						}
						//						}.bind(this));
						//					}.bind(this));
						//				}.bind(this));
						//			}.bind(this));

						//		}.bind(this));
					}.bind(this),
					error: function () {
						console.log("Erro ao editar prospect.");
						this.closeBusyDialog();
					}.bind(this)
				});
			} else {
				oModel.submitChanges({
					groupId: "changes",
					success: function () {
						this.closeBusyDialog();
						var oProspectModel = this.getView().getModel("prospectModel");
						oProspectModel.setProperty("/Banks", []);
						oProspectModel.setProperty("/Irf", []);
						oProspectModel.setProperty("/Characteristics", []);
						if (isApprove === true) {
							MessageBox.information(
								"Processo de liberação não pode ser feito offline.", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.navBack();
									}.bind(this)
								}
							);
						} else {
							MessageBox.success(
								"Prospect salvo com sucesso!.", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
										this.navBack();
									}.bind(this)
								}
							);
						}

					}.bind(this),
					error: function () {
						console.log("Erro ao editar prospect.");
						this.closeBusyDialog();
					}.bind(this)
				});
			}

		},

		validateFormData: function (arrayAvaliableApproveFields, aInputControls, oObject) {

			var array = [];
			var oControl;

			var oBanksOdata = this.getOdataArray(oObject.Prosp_Banks);
			var oIrfOdata = this.getOdataArray(oObject.Prosp_Irf);
			var oBanks = this.getBanks(oObject.HCP_UNIQUE_KEY);
			var oIrf = this.getIrf(oObject.HCP_UNIQUE_KEY);
			var shasBanks = (oBanksOdata.length > 0 || oBanks.length > 0) || oObject.KTOKK === "F3" ? true : false;
			var shasIrf = oIrfOdata.length > 0 || oIrf.length > 0 ? true : false;

			for (var m = 0; m < aInputControls.length; m++) {
				oControl = aInputControls[m].control;
				if (aInputControls[m].required) {
					var sHasValue = oControl.getValue() !== '' ? false : true;
					var sValue = aInputControls[m].text;

					if (sHasValue) {
						oControl.setValueState('Error');
						oControl.setValueStateText('Campo requerido');
						array.push({
							field: sValue
						});
					} else {
						oControl.setValueState('None');
					}

				} else {

					for (var sField of arrayAvaliableApproveFields) {
						if (sField === aInputControls[m].text) {
							var sHasValueApprove = oControl.getValue() !== '' ? false : true;
							var sValueApprove = aInputControls[m].text;

							if (oObject.KTOKK === "F3") {

								if (sValueApprove == "CNPJ") {
									let cpfValue = aInputControls.find(item => item.text == "CPF").control.getValue();
									if (cpfValue == '') {
										if (sHasValueApprove) {
											oControl.setValueState('Error');
											oControl.setValueStateText('Campo requerido');
											array.push({
												field: sValueApprove
											});
										} else {
											oControl.setValueState('None');
										}

										array = array.filter(item => item.field != "CPF" && item.field != "Data de nascimento");
									}
								} else {
									if (sHasValueApprove) {
										oControl.setValueState('Error');
										oControl.setValueStateText('Campo requerido');
										array.push({
											field: sValueApprove
										});
									} else {
										oControl.setValueState('None');
									}
								}

							} else {

								if (sHasValueApprove) {
									oControl.setValueState('Error');
									oControl.setValueStateText('Campo requerido');
									array.push({
										field: sValueApprove
									});
								} else {
									oControl.setValueState('None');
								}

							}

						}
					}

				}
			}

			if (!shasBanks) {
				array.push({
					field: 'Cadastro Banco'
				});
			}

			let arrayUnique = [];

			array.forEach((item) => {
				var duplicated = arrayUnique.findIndex(redItem => {
					return item.field == redItem.field;
				}) > -1;

				if (!duplicated) {
					arrayUnique.push(item);
				}
			});

			return arrayUnique;

		},

		onApprove: function () {

			this.setBusyDialog("App Grãos", "Liberando prospect, aguarde");

			var sPath = this.getView().getElementBinding().getPath();
			var oObject = this.getView().getModel().getObject(sPath);
			var aInputControls = this._getTextsFields();
			let arrayRequiredFields;
			var arrayAvaliablePFApproveFields = ['Org. Compras',
				'Nome',
				'Data de nascimento',
				'CPF',
				'Inscrição Estadual',
				'Email',
				'Telefone',
				'País',
				'Estado',
				'Zona',
				'Município',
				'Endereço',
				'Número',
				'CEP',
				'Setor Industrial',
				'Grp. De Adm. Tesouraria'
			];

			var arrayAvaliablePJApproveFields = ['Org. Compras',
				'Nome',
				'CNPJ',
				'Inscrição Estadual',
				'Email',
				'Telefone',
				'País',
				'Estado',
				'Zona',
				'Município',
				'Endereço',
				'Número',
				'CEP',
				'Setor Industrial',
				'Grp. De Adm. Tesouraria'
			];

			var arrayAvaliablePEApproveFields = ['Org. Compras',
				'Nome',
				'Data de nascimento',
				'CPF',
				'CNPJ',
				'Inscrição Estadual',
				'Email',
				'Telefone',
				'País',
				'Estado',
				'Zona',
				'Município',
				'Endereço',
				'Número',
				'CEP',
				'Setor Industrial',
				'Grp. De Adm. Tesouraria'
			];

			if (oObject.KTOKK === "F1") {
				arrayRequiredFields = this.validateFormData(arrayAvaliablePJApproveFields, aInputControls, oObject);
			} else if (oObject.KTOKK === "F2") {
				arrayRequiredFields = this.validateFormData(arrayAvaliablePFApproveFields, aInputControls, oObject);
			} else {
				arrayRequiredFields = this.validateFormData(arrayAvaliablePEApproveFields, aInputControls, oObject);
			}

			if (arrayRequiredFields.length > 0) {
				this.closeBusyDialog();
				this.onDialogRequiredItems(arrayRequiredFields, 'Campos necessarios para liberação');
			} else {
				this.onEdit(true);
			}

		},

		approveSave: function () {

			this.setBusyDialog("App Grãos", "Salvando prospect");
			var sPath = this.getView().getElementBinding().getPath();
			var oObject = this.getView().getModel().getObject(sPath);
			var oModel = this.getOwnerComponent().getModel();
			var aDeferredGroups = oModel.getDeferredGroups();
			oModel.setUseBatch(true);

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			var oCharacteristicsOdata = this.getOdataArray(oObject.Prosp_Characteristics);
			var oBanksOdata = this.getOdataArray(oObject.Prosp_Banks);
			var oIrfOdata = this.getOdataArray(oObject.Prosp_Irf);

			var oCharacteristics = this.getCharacteristics(oObject.HCP_UNIQUE_KEY);
			var oBanks = this.getBanks(oObject.HCP_UNIQUE_KEY);
			var oIrf = this.getIrf(oObject.HCP_UNIQUE_KEY);

			var oPropertiesApprove = {
				NAME1: oObject.NAME1,
				NAME2: oObject.NAME2,
				KTOKK: oObject.KTOKK,
				STCD2: this.removeMask(oObject.STCD2),
				STCD1: this.removeMask(oObject.STCD1),
				EMAIL: oObject.EMAIL,
				TELF1: this.removeMask(oObject.TELF1),
				BLAND: oObject.BLAND,
				ORT02: oObject.ORT02,
				STRAS: oObject.STRAS,
				HOUSE_NUM1: oObject.HOUSE_NUM1,
				PSTLZ: oObject.PSTLZ,
				STRAS2: oObject.STRAS2,
				BRSCH: oObject.BRSCH,
				EKORG: oObject.EKORG,
				STCD3: oObject.STCD3,
				OBSER: oObject.OBSER,
				//HCP_STATUS: "2",
				ZDTNASC: oObject.ZDTNASC ? this._formatDate(oObject.ZDTNASC) : null,
				ORT01: this.removeAccent(oObject.ORT01),
				LAND1: oObject.LAND1,
				TXJCD: oObject.BLAND,
				FDGRV: oObject.FDGRV,
				INTAD: oObject.INTAD,
				ZWELS: oObject.ZWELS,
				AKONT: oObject.AKONT,
				ZLOW: oObject.KTOKK,
				BUKRS: oObject.BUKRS,
				TELFX: oObject.TELFX,
				HCP_UPDATED_AT: this._formatDate(new Date())
			};

			oModel.update(sPath, oPropertiesApprove, {
				groupId: "changes"
			});

			for (var charOdata of oCharacteristicsOdata) {
				oModel.update(charOdata.sPath, charOdata.data, {
					groupId: "changes"
				});
			}

			for (var charBankOdata of oBanksOdata) {
				oModel.update(charBankOdata.sPath, charBankOdata.data, {
					groupId: "changes"
				});
			}

			for (var charIrfOdata of oIrfOdata) {
				oModel.update(charIrfOdata.sPath, charIrfOdata.data, {
					groupId: "changes"
				});
			}

			for (var char of oCharacteristics) {
				oModel.createEntry("/Characteristics", {
					properties: char
				}, {
					groupId: "changes"
				});
			}

			for (var charBanks of oBanks) {
				oModel.createEntry("/Banks", {
					properties: charBanks
				}, {
					groupId: "changes"
				});
			}

			for (var charIrf of oIrf) {
				oModel.createEntry("/Irf", {
					properties: charIrf
				}, {
					groupId: "changes"
				});
			}

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

				oModel.submitChanges({
					groupId: "changes",
					success: function () {
						//	this.flushStore("Prospects,Characteristics,Banks,Irf").then(function () {
						//		this.refreshStore("Prospects").then(function () {
						//			this.refreshStore("Characteristics").then(function () {
						//				this.refreshStore("Banks").then(function () {
						//					this.refreshStore("Irf").then(function () {
						this.saveECC();
						//						}.bind(this));
						//					}.bind(this));
						//				}.bind(this));
						//			}.bind(this));

						//	}.bind(this));
					}.bind(this),
					error: function () {
						console.log("Erro ao liberar prospect.");
						this.closeBusyDialog();
					}.bind(this)
				});

			} else {
				oModel.submitChanges({
					groupId: "changes",
					success: function () {
						sap.m.MessageToast.show("Você deve se conectar-se a internet para liberação.");
						this.closeBusyDialog();
						setTimeout(function () {
							this.navBack();
						}.bind(this), 500);
					}.bind(this),
					error: function () {
						console.log("Erro ao editar prospect.");
						this.closeBusyDialog();
					}.bind(this)
				});
			}

			/*
						if (!this.getOwnerComponent().getModel().hasPendingChanges()) {
							this.closeBusyDialog();
							this.saveECC();
						}
			*/
		},

		saveECC: function () {
			this.setBusyDialog("App Grãos", "Liberando prospect");
			var oComponent = this.getOwnerComponent();
			var oDeviceModel = oComponent.getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			var sPath = this.getView().getElementBinding().getPath();
			var oObject = this.getView().getModel().getObject(sPath);
			var oEccModel = this.getOwnerComponent().getModel("eccModel");
			var oModel = this.getOwnerComponent().getModel();
			var aDeferredGroups = oModel.getDeferredGroups();
			oModel.setUseBatch(true);

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}

			var oBanksOdata = this.getOdataArray(oObject.Prosp_Banks);
			var oIrfOdata = this.getOdataArray(oObject.Prosp_Irf);

			var aBanksData = [];
			var aIRFData = [];
			var aAddInfo = [];
			var aSupplierData = [];

			if (oObject.KTOKK === "F3") {
				aSupplierData = {
					OBSER: oObject.OBSER,
					FONE: oObject.TELF1,
					SIGLA: oObject.SIGLA,
					INTAD: oObject.INTAD,
					BRSCH: oObject.BRSCH,
					FDGRV: oObject.FDGRV,
					AKONT: oObject.AKONT,
					STCD3: oObject.STCD3 ? oObject.STCD3.toUpperCase() : oObject.STCD3,
					STCD2: oObject.STCD2,
					STCD1: oObject.STCD1,
					X_FISICO: oObject.KTOKK === "F2" || (oObject.STCD2 && oObject.KTOKK === "F3") ? true : false,
					X_JURIDICO: oObject.KTOKK === "F1" || (oObject.STCD1 && oObject.KTOKK === "F3") ? true : false,
					EMAIL: oObject.EMAIL,
					TELF1: oObject.TELF1,
					TXJCD: oObject.KTOKK === "F3" ? '' : oObject.BLAND,
					REGIO: oObject.BLAND,
					LAND1: oObject.LAND1,
					ORT01: this.removeAccent(oObject.ORT01),
					PSTLZ: oObject.PSTLZ,
					ORT02: oObject.ORT02,
					STRAS2: oObject.STRAS2,
					HOUSE_NUM1: oObject.HOUSE_NUM1,
					STRAS: oObject.STRAS,
					ZDTNASC: oObject.ZDTNASC,
					NAME2: oObject.NAME2,
					NAME1: oObject.NAME1,
					X_EXCLUIR_FORNECEDOR: false,
					LIFNR: null,
					KTOKK: oObject.KTOKK,
					EKORG: oObject.EKORG,
					BUKRS: oObject.BUKRS,
					TELFX: oObject.TELFX,
					REGIOGROUP: '',
					ZTERM: '',
					ZTERME: '',
					ZTERMC: '',
					INCO2: '',
					INCO1: '',
					HBKID: ''
				};
			} else {
				aSupplierData = {
					OBSER: oObject.OBSER,
					FONE: oObject.TELF1,
					SIGLA: oObject.SIGLA,
					INTAD: oObject.INTAD,
					BRSCH: oObject.BRSCH,
					FDGRV: oObject.FDGRV,
					AKONT: oObject.AKONT,
					ZWELS: oObject.ZWELS,
					STCD3: oObject.STCD3 ? oObject.STCD3.toUpperCase() : oObject.STCD3,
					STCD2: oObject.STCD2,
					STCD1: oObject.STCD1,
					X_FISICO: oObject.KTOKK === "F2" || (oObject.STCD2 && oObject.KTOKK === "F3") ? true : false,
					X_JURIDICO: oObject.KTOKK === "F1" || (oObject.STCD1 && oObject.KTOKK === "F3") ? true : false,
					EMAIL: oObject.EMAIL,
					TELF1: oObject.TELF1,
					TXJCD: oObject.KTOKK === "F3" ? '' : oObject.BLAND,
					REGIO: oObject.BLAND,
					LAND1: oObject.LAND1,
					ORT01: this.removeAccent(oObject.ORT01),
					PSTLZ: oObject.PSTLZ,
					ORT02: oObject.ORT02,
					STRAS2: oObject.STRAS2,
					HOUSE_NUM1: oObject.HOUSE_NUM1,
					STRAS: oObject.STRAS,
					ZDTNASC: oObject.ZDTNASC,
					NAME2: oObject.NAME2,
					NAME1: oObject.NAME1,
					X_EXCLUIR_FORNECEDOR: false,
					LIFNR: null,
					KTOKK: oObject.KTOKK,
					EKORG: oObject.EKORG,
					BUKRS: oObject.BUKRS,
					TELFX: oObject.TELFX,
					REGIOGROUP: '',
					ZTERM: '',
					ZTERME: '',
					ZTERMC: '',
					INCO2: '',
					INCO1: '',
					HBKID: ''
				};
			}

			for (var bank of oBanksOdata) {
				aBanksData.push({
					BANCO: bank.data.BANCO,
					AGENCIA: bank.data.AGENCIA,
					CONTA: bank.data.CONTA,
					TITULAR: bank.data.K0INH,
					dig_agencia: bank.data.DIG_AGENCIA,
					dig_conta: bank.data.DIG_CONTA
				});
			}

			for (var irf of oIrfOdata) {
				aIRFData.push({
					WITHT: irf.data.WITHT,
					WT_WITHCD: irf.data.WT_WITHCD,
					WT_SUBJCT: irf.data.WT_SUBJCT == 1 ? 'X' : ''
				});
			}

			oEccModel.callFunction("/supplierCreate", {
				method: "GET",
				urlParameters: {
					supplier: JSON.stringify(aSupplierData),
					banks: JSON.stringify(aBanksData),
					irf: JSON.stringify(aIRFData),
					addInfo: JSON.stringify(aAddInfo)
				},
				success: function (oData) {
					var aMessage = [];
					var sNrsol;
					var bError = false;
					var sError;

					if (oData.bdc.length > 0) {
						var aMessages = JSON.parse(oData.bdc);
						for (var message of aMessages) {
							if (message.msgtyp === "E") {
								bError = true;
								sError = "Erro ECC: " + message.msgv1 + " " + message.msgv2 + " " + message.msgv3 + " " + message.msgv4 +
									", Codígo do erro: " + message.msgid + message.msgnr + " Campo: " + message.fldname +
									", em caso de dúvidas, contate o administrador.";
							}
						}
					}
					if (oData.nrsol.length > 0) {
						var sNrsol = JSON.parse(oData.nrsol);
					}

					if (!bError) {

						var oPropertiesEdit = {
							HCP_STATUS: "2",
							NRSOL: sNrsol,
							HCP_UPDATED_AT: this._formatDate(new Date())
						};

						oModel.update(sPath, oPropertiesEdit, {
							groupId: "changes"
						});

						if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

							oModel.submitChanges({
								groupId: "changes",
								success: function () {
									//	this.flushStore("Prospects,Characteristics,Banks,Irf").then(function () {
									//		this.refreshStore("Prospects").then(function () {
									//			this.refreshStore("Characteristics").then(function () {
									//				this.refreshStore("Banks").then(function () {
									//					this.refreshStore("Irf").then(function () {
									MessageBox.success(
										"Prospect liberado com sucesso!.", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.closeBusyDialog();
												this.navBack();
											}.bind(this)
										}
									);
									//					}.bind(this));
									//				}.bind(this));
									//			}.bind(this));
									//		}.bind(this));

									//	}.bind(this));
								}.bind(this),
								error: function () {
									sap.m.MessageToast.show("Erro ao liberar prospect.");
									this.closeBusyDialog();
								}.bind(this)
							});

						} else {
							oModel.submitChanges({
								groupId: "changes",
								success: function () {
									MessageBox.success(
										"Prospect liberado com sucesso!.", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.closeBusyDialog();
												this.navBack();
											}.bind(this)
										}
									);
								}.bind(this),
								error: function () {
									console.log("Erro ao liberar prospect.");
									this.closeBusyDialog();
								}.bind(this)
							});
						}

					} else {
						this.closeBusyDialog();
						var oProspectModel = this.getView().getModel("prospectModel");
						oProspectModel.setProperty("/Banks", []);
						oProspectModel.setProperty("/Irf", []);
						oProspectModel.setProperty("/Characteristics", []);

						var sObjectPath = "/Prospects(" + oObject.HCP_PROSP_ID + "l)";
						this.clearCharacteristicContainers();
						this.setCharacteristicsContainer(sObjectPath);
						this.clearBankContainers();
						this.setBanksContainer(sObjectPath);
						this.clearIrfContainers();
						this.setIrfContainer(sObjectPath);

						MessageBox.information(sError);
					}

				}.bind(this),
				error: function (error) {
					sap.m.MessageToast.show(error);
				}
			});

		},

		_onObjectMatched: function (oEvent) {
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));
			var prospId = decodeURIComponent(oEvent.getParameter("arguments").PROSP_ID);
			var sObjectPath = prospId;
			var oModel = this.getOwnerComponent().getModel();
			var oProspect = oModel.getProperty(sObjectPath);

			var hasAdditionalAdress = oProspect.STRAS2 ? true : false;
			var cancelProspect = oProspect.HCP_STATUS === '1' ? true : false;
			var rotateProspect = oProspect.HCP_STATUS === '3' || oProspect.HCP_STATUS === '4' || oProspect.HCP_STATUS === '5' || oProspect.HCP_STATUS ===
				'2' ? true : false;
			var approvedProspect = oProspect.HCP_STATUS === '2' || oProspect.HCP_STATUS === '3' || oProspect.HCP_STATUS === '4' || oProspect.HCP_STATUS ===
				'5' ? true : false;
			var rotateButton = oProspect.HCP_STATUS === '3' || oProspect.HCP_STATUS === '4' ? true : false;

			this.getView().getModel("prospectModel").setProperty("/AdditionalAdressPress", hasAdditionalAdress);
			this.getView().getModel("prospectModel").setProperty("/cancelProspect", cancelProspect);
			this.getView().getModel("prospectModel").setProperty("/rotateProspect", rotateProspect);
			this.getView().getModel("prospectModel").setProperty("/approvedProspect", approvedProspect);
			this.getView().getModel("prospectModel").setProperty("/rotateButton", rotateButton);

			this._bindView(sObjectPath);

			var aInputControls = this._getTextsFields();
			var oControl;

			for (var m = 0; m < aInputControls.length; m++) {
				oControl = aInputControls[m].control;
				oControl.setValueState('None');
			}

			if (oProspect.LAND1 === "PY") {
				this.getView().getModel("prospectModel").setProperty("/isPY", true);
			} else {
				this.getView().getModel("prospectModel").setProperty("/isPY", false);
			}

			var oTable = this.getView().byId("states");
			var oFilters = [];

			oFilters.push(new sap.ui.model.Filter("LAND1", sap.ui.model.FilterOperator.Contains, oProspect.LAND1));
			oTable.getBinding("items").filter(oFilters);

			//var oModelOwner = this.getOwnerComponent().getModel();
			//oModelOwner.refresh(true);

		},
		_bindView: function (sObjectPath) {

			this.getView().bindElement({
				path: sObjectPath
			});
			this.clearCharacteristicContainers();
			this.setCharacteristicsContainer(sObjectPath);
			this.clearBankContainers();
			this.setBanksContainer(sObjectPath);
			this.clearIrfContainers();
			this.setIrfContainer(sObjectPath);
			//this._validateForm();
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

		getSavedCharacteristics: function () {
			var oModel = this.getView().getModel();
			var oCharacteristics = oModel.getProperty(this.getView().getBindingContext().sPath).Prosp_Characteristics;
			var sSavedChars = [];

			if (oCharacteristics) {
				for (var index in oCharacteristics.__list) {
					var sCharPath = oCharacteristics.__list[index];

					sSavedChars.push({
						plant: oModel.getProperty("/" + sCharPath).ATINN
					});
				}
			}
			return sSavedChars;
		},

		removeCharacteristics: function (oEvent) {
			var oPropertyModel = this.getView().getModel("prospectModel");
			var oModel = this.getOwnerComponent().getModel();
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

								if (oData) {
									oData.status = "Deleted";
									oVBox.destroy();
								} else {
									oData = oModel.getProperty("/" + sPath);
									if (oData) {
										oModel.remove("/Characteristics(" + oData.HCP_CHARAC_ID + ")", {
											method: "DELETE",
											success: function () {
												sap.m.MessageToast.show("Características Excluída.");
											},
											error: function () {
												sap.m.MessageToast.show("Erro ao excluir característica.");
											}
										});
										oVBox.destroy();
									}
								}
							}
						}
					}.bind(this)
				}
			);

			//	this._validateForm();
		},

		removeBanks: function (oEvent) {
			var oPropertyModel = this.getView().getModel("prospectModel");
			var oModel = this.getOwnerComponent().getModel();
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

								if (oData) {
									oData.status = "Deleted";
									oVBox.destroy();
								} else {
									oData = oModel.getProperty("/" + sPath);
									if (oData) {
										oModel.remove("/Banks(" + oData.HCP_BANK_ID + ")", {
											method: "DELETE",
											success: function () {
												sap.m.MessageToast.show("Banco Excluído.");
											},
											error: function () {
												sap.m.MessageToast.show("Erro ao excluir o banco.");
											}
										});
										oVBox.destroy();
									}
								}
							}
						}
					}.bind(this)
				}
			);

			//	this._validateForm();
		},

		removeIrf: function (oEvent) {
			var oPropertyModel = this.getView().getModel("prospectModel");
			var oModel = this.getOwnerComponent().getModel();
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

								if (oData) {
									oData.status = "Deleted";
									oVBox.destroy();
								} else {
									oData = oModel.getProperty("/" + sPath);
									if (oData) {
										oModel.remove("/Irf(" + oData.HCP_IRF_ID + ")", {
											method: "DELETE",
											success: function () {
												sap.m.MessageToast.show("Irf Excluído.");
											},
											error: function () {
												sap.m.MessageToast.show("Erro ao excluir IRF.");
											}
										});
										oVBox.destroy();
									}
								}
							}
						}
					}.bind(this)
				}
			);

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
				var oControlText;

				var arrayAvaliableFields = ['Domicílio Fiscal', 'Agrupamento da estrutura regional',
					'Condições pagto', 'Incoterms', 'Condições pagto Empresa', 'Grp. De Adm. Tesouraria', 'Forma de pagamento',
					'Conta conciliação', 'Org. Compras', 'Setor Industrial'
				];

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

				var aInputControlsText = this._getTextsFields();

				for (var m = 0; m < aInputControlsText.length; m++) {
					oControlText = aInputControlsText[m].control;
					for (var sField of arrayAvaliableFields) {
						if (sField === aInputControlsText[m].text) {
							oControlText.setValueState('None');
						}
					}

				}
			} else {
				sap.m.MessageToast.show(sValueStateMessage);
			}

		},

		_validateEmail: function (oEvent) {
			var oInput = oEvent.getSource();
			var mailRegex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
			var bValid = mailRegex.test(oInput.getValue());
			var sValueState = bValid || oInput.getValue().length === 0 ? 'None' : 'Error';
			var sValueStateMessage = bValid || oInput.getValue().length === 0 ? '' : 'Digite um email valido';

			oInput.setValueState(sValueState);
			oInput.setValueStateText(sValueStateMessage);
			//this._validateForm();

			if (sValueState === 'Error') {
				sap.m.MessageToast.show(sValueStateMessage);
			}
		},

		_validateCountries: function (oEvent) {
			var oInput = oEvent.getSource();
			oInput.getValue();

			//var sCountries = this.getView().byId("countries");
			//sCountries.focus();
			//$(this.getView().byId("nome2").getDomRef()).focus();
			if (oInput.getSelectedKey() === "PY") {
				this.getView().getModel("prospectModel").setProperty("/isPY", true);
			} else {
				this.getView().getModel("prospectModel").setProperty("/isPY", false);
			}

			var oTable = this.getView().byId("states");
			var oFilters = [];

			oFilters.push(new sap.ui.model.Filter("LAND1", sap.ui.model.FilterOperator.Contains, oInput.getSelectedKey()));
			oTable.getBinding("items").filter(oFilters);
			//this._validateForm();
		},

		_onCPFChange: function (oEvent) {
			var oSource = oEvent.getSource();
			var oValue = oSource.getValue().replace(/[._-]/g, '');
			var sValueState = oValue.length === 11 || oValue.length === 0 ? 'None' : 'Error';
			var sValueStateMessage = oValue.length === 11 || oValue.length === 0 ? '' : 'Valor inválido';

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
			var sValueStateMessage = oValue.length === 14 || oValue.length === 0 ? '' : 'Invalid Input';

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
				sValueStateMessage = oValue.length >= 12 || oValue.length === 0 ? '' : 'Valor inválido';
			} else {
				sValueState = oValue.length >= 11 || oValue.length === 0 ? 'None' : 'Error';
				sValueStateMessage = oValue.length >= 11 || oValue.length === 0 ? '' : 'Valor inválido';

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
			//	this._validateForm();
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
							required: oAllForms[i - 1].getRequired && oAllForms[i - 1].getRequired()
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

		getCharacteristics: function (sUniqueKey) {
			var oModel = this.getView().getModel("prospectModel");
			var oCharacteristics = oModel.getProperty("/Characteristics");
			var oChars = [];
			if (oCharacteristics) {
				var oValidCharacteristics = oCharacteristics.filter(characteristics => characteristics.status === "New");
				var oValidCharacteristicsContainer = oCharacteristics.filter(characteristics => characteristics.container === true);

				if (oValidCharacteristics && oValidCharacteristicsContainer) {
					for (var char of oValidCharacteristics) {
						var sTimestamp = new Date().getTime();

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
			if (oBanks) {
				var oValidBanks = oBanks.filter(characteristics => characteristics.status === "New");
				var oValidBanksContainer = oBanks.filter(characteristics => characteristics.container === true);

				if (oValidBanks || oValidBanksContainer) {
					for (var char of oValidBanks) {
						var sTimestamp = new Date().getTime();

						oChars.push({
							HCP_BANK_ID: sTimestamp.toFixed(),
							HCP_UNIQUE_KEY: sUniqueKey,
							K0INH: char.K0INH,
							BANCO: char.BANCO,
							CONTA: char.CONTA,
							AGENCIA: char.AGENCIA,
							DIG_CONTA: char.DIG_CONTA,
							DIG_AGENCIA: char.DIG_AGENCIA,
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
			if (oIrf) {
				var oValidIrf = oIrf.filter(characteristics => characteristics.status === "New");
				var oValidIrfContainer = oIrf.filter(characteristics => characteristics.container === true);

				if (oValidIrf && oValidIrfContainer) {
					for (var char of oValidIrf) {
						var sTimestamp = new Date().getTime();

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

		setCharacteristicsContainer: function (sObjectPath) {
			var oModel = this.getOwnerComponent().getModel();
			var oData = oModel.getProperty(sObjectPath);
			var oCharForm = this.getView().byId("CharacteristicsSimpleForm");
			var aFilters = [];

			if (oData["@com.sap.vocabularies.Offline.v1.isLocal"]) {

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_UNIQUE_KEY
				}));

				oModel.read("/Characteristics", {
					filters: aFilters,
					success: function (results) {
						var aCharacteristics = results.results;

						if (aCharacteristics.length > 0) {
							for (var index in aCharacteristics) {
								var sCharPath = aCharacteristics[index].__metadata.uri.split("/")[4];
								if (!oData.Prosp_Characteristics["__list"]) {
									oData.Prosp_Characteristics["__list"] = [];
								}
								oData.Prosp_Characteristics["__list"].push(sCharPath);
								var oCharTemplate = this.buildCharacteristicTemplate(sCharPath, null, true, '', true);
								oCharForm.addContent(new sap.m.Label({
									text: ""
								}));
								oCharForm.addContent(oCharTemplate);
							}
						}
					}.bind(this),
					error: function (error) {

					}
				});

			} else {
				var oCharacteristics = oData.Prosp_Characteristics;

				if (oCharacteristics) {
					for (var index in oCharacteristics.__list) {
						var sCharPath = oCharacteristics.__list[index];

						var oCharTemplate = this.buildCharacteristicTemplate(sCharPath, null, true, '', true);
						oCharForm.addContent(new sap.m.Label({
							text: ""
						}));
						oCharForm.addContent(oCharTemplate);
					}
				}
			}
		},

		setBanksContainer: function (sObjectPath) {
			var oModel = this.getOwnerComponent().getModel();
			var oData = oModel.getProperty(sObjectPath);
			var oCharForm = this.getView().byId("bankDataSimpleForm");
			var aFilters = [];

			if (oData["@com.sap.vocabularies.Offline.v1.isLocal"]) {

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_UNIQUE_KEY
				}));

				oModel.read("/Banks", {
					filters: aFilters,
					success: function (results) {
						var aBanks = results.results;

						if (aBanks.length > 0) {
							for (var index in aBanks) {
								var sCharPath = aBanks[index].__metadata.uri.split("/")[4];
								if (!oData.Prosp_Banks["__list"]) {
									oData.Prosp_Banks["__list"] = [];
								}
								oData.Prosp_Banks["__list"].push(sCharPath);
								var oCharTemplate = this.buildBanksTemplate(sCharPath, true, true);
								oCharForm.addContent(new sap.m.Label({
									text: ""
								}));
								oCharForm.addContent(oCharTemplate);
							}
						}
					}.bind(this),
					error: function (error) {

					}
				});

			} else {

				var oBanks = oData.Prosp_Banks;

				if (oBanks) {
					for (var index in oBanks.__list) {
						var sCharPath = oBanks.__list[index];

						var oCharTemplate = this.buildBanksTemplate(sCharPath, true, true);
						oCharForm.addContent(new sap.m.Label({
							text: ""
						}));
						oCharForm.addContent(oCharTemplate);
					}
				}
			}

		},

		setIrfContainer: function (sObjectPath) {

			var oModel = this.getOwnerComponent().getModel();
			var oData = oModel.getProperty(sObjectPath);
			var oCharForm = this.getView().byId("irfSimpleForm");
			var aFilters = [];

			if (oData["@com.sap.vocabularies.Offline.v1.isLocal"]) {

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_UNIQUE_KEY
				}));

				oModel.read("/Irf", {
					filters: aFilters,
					success: function (results) {
						var aIrf = results.results;

						if (aIrf.length > 0) {
							for (var index in aIrf) {
								var sCharPath = aIrf[index].__metadata.uri.split("/")[4];
								if (!oData.Prosp_Irf["__list"]) {
									oData.Prosp_Irf["__list"] = [];
								}
								oData.Prosp_Irf["__list"].push(sCharPath);
								var oCharTemplate = this.buildIrfTemplate(sCharPath, true, '', true);
								oCharForm.addContent(new sap.m.Label({
									text: ""
								}));
								oCharForm.addContent(oCharTemplate);
							}
						}
					}.bind(this),
					error: function (error) {

					}
				});

			} else {

				var oIrf = oData.Prosp_Irf;

				if (oIrf) {
					for (var index in oIrf.__list) {
						var sCharPath = oIrf.__list[index];

						var oCharTemplate = this.buildIrfTemplate(sCharPath, true, '', true);
						oCharForm.addContent(new sap.m.Label({
							text: ""
						}));
						oCharForm.addContent(oCharTemplate);
					}
				}
			}

		},
		buildBanksTemplate: function (sCharPath, bsaved, isContainer) {
			var aCustomData = [];
			var oProspectModel = this.getView().getModel("prospectModel");
			var isEnable = oProspectModel.getProperty("/rotateProspect") === true ? false : true;

			if (!bsaved) {

				var sChars = oProspectModel.getProperty("/Banks");

				if (!sChars) {
					oProspectModel.setProperty("/Banks", []);
				}

				var sCharLength = oProspectModel.getProperty("/Banks").length;
				oProspectModel.setProperty("/Banks/" + sCharLength, {});
				oProspectModel.setProperty("/Banks/" + sCharLength + "/status", "New");

				if (isContainer === true) {
					oProspectModel.setProperty("/Banks/" + sCharLength + "/container", true);
					oProspectModel.setProperty("/Banks/" + sCharLength + "/status", "Old");
				}

				aCustomData.push(new sap.ui.core.CustomData({
					key: "sPath",
					value: "/Banks/" + sCharLength
				}));
				sCharPath = "{prospectModel>/Banks/" + sCharLength;

			} else {
				aCustomData.push(new sap.ui.core.CustomData({
					key: "sPath",
					value: sCharPath
				}));
				sCharPath = "{/" + sCharPath;
			}

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
								editable: isEnable,
								enabled: isEnable,
								value: sCharPath + "/K0INH}"
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
								selectedKey: sCharPath + "/BANCO}",
								placeholder: "Selecione o Banco",
								editable: isEnable,
								enabled: isEnable,
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
								width: "auto",
								editable: isEnable,
								enabled: isEnable,
								maxLength: 0,
								value: sCharPath + "/AGENCIA}"
							}),
							new sap.m.Input({
								placeholder: "Dígito Agência",
								type: "Text",
								width: "30%",
								editable: isEnable,
								enabled: isEnable,
								maxLength: 0,
								value: sCharPath + "/DIG_AGENCIA}"
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
								editable: isEnable,
								enabled: isEnable,
								maxLength: 0,
								value: sCharPath + "/CONTA}"
							}),
							new sap.m.Input({
								placeholder: "Dígito Conta",
								type: "Text",
								width: "30%",
								editable: isEnable,
								enabled: isEnable,
								maxLength: 0,
								value: sCharPath + "/DIG_CONTA}"
							}),
							new sap.m.Label({
								text: ""
							}),
							new sap.m.Toolbar({
								content: [
									new sap.m.ToolbarSpacer(),
									new sap.m.Button({
										icon: "sap-icon://sys-cancel",
										enabled: isEnable,
										type: "Reject",
										width: "40%",
										text: 'Excluir',
										press: this.removeBanks.bind(this)
									})
								]
							})
						]
					})
				]
			});
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

		buildIrfTemplate: function (sCharPath, bsaved, sPlant, isContainer) {
			var aCustomData = [];
			var aCustomData2 = [];
			var oProspectModel = this.getView().getModel("prospectModel");
			var isEnable = oProspectModel.getProperty("/rotateProspect") === true ? false : true;
			var oTableCountries = this.getView().byId("countries");
			var oTableCountriesKey = oTableCountries.getSelectedKey();

			if (!bsaved) {

				var sChars = oProspectModel.getProperty("/Irf");

				if (!sChars) {
					oProspectModel.setProperty("/Irf", []);
				}

				var sCharLength = oProspectModel.getProperty("/Irf").length;
				oProspectModel.setProperty("/Irf/" + sCharLength, {});
				oProspectModel.setProperty("/Irf/" + sCharLength + "/status", "New");
				oProspectModel.setProperty("/Irf/" + sCharLength + "/WT_SUBJCT", "1");
				oProspectModel.setProperty("/Irf/" + sCharLength + "/WITHT", sPlant);
				if (isContainer === true) {
					oProspectModel.setProperty("/Irf/" + sCharLength + "/container", true);
					oProspectModel.setProperty("/Irf/" + sCharLength + "/status", "Old");
				}

				aCustomData.push(new sap.ui.core.CustomData({
					key: "sPath",
					value: "/Irf/" + sCharLength
				}));

				aCustomData2.push(new sap.ui.core.CustomData({
					key: "sPath",
					value: "/Irf/" + sCharLength
				}));

				sCharPath = "{prospectModel>/Irf/" + sCharLength;

			} else {

				var oModel = this.getOwnerComponent().getModel();
				var oData = oModel.getProperty("/" + sCharPath);

				oProspectModel.setProperty("/Irf/" + sCharLength + "/WITHT", oData.WITHT);
				oProspectModel.setProperty("/Irf/" + sCharLength + "/WT_SUBJCT", "1");

				aCustomData.push(new sap.ui.core.CustomData({
					key: "sPath",
					value: sCharPath
				}));

				aCustomData2.push(new sap.ui.core.CustomData({
					key: "sPath",
					value: sCharPath
				}));

				sCharPath = "{/" + sCharPath;

			}

			var irfFilter;
			if (sPlant) {
				irfFilter = this.getView().getModel("prospectModel").getProperty("/Irf/" + sCharLength + "/WITHT");
			} else {
				irfFilter = oData.WITHT;
			}

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
								selectedKey: sCharPath + "/WITHT}",
								placeholder: "Selecione",
								editable: isEnable,
								enabled: isEnable,
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
								selectedKey: sCharPath + "/WT_WITHCD}",
								placeholder: "Selecione",
								editable: isEnable,
								enabled: isEnable,
								visible: true,
								width: 'auto',
								maxWidth: '100%',
								selectionChange: this._validateForm.bind(this),
								items: {
									path: '/View_Irf_CODE',
									sorter: new sap.ui.model.Sorter("WT_WITHCD"),
									filters: [new sap.ui.model.Filter("WITHT", sap.ui.model.FilterOperator.EQ, irfFilter),
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
								required: false,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),
							new sap.m.SegmentedButton({
								width: "auto",
								selectedKey: sCharPath + "/WT_SUBJCT}",
								enable: isEnable,
								editable: isEnable,
								items: [
									new sap.m.SegmentedButtonItem({
										text: "Sim",
										enabled: isEnable,
										editable: isEnable,
										key: "1"
									}),

									new sap.m.SegmentedButtonItem({
										text: "Não",
										enabled: isEnable,
										editable: isEnable,
										key: "0"
									})
								],
								customData: aCustomData2
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
										enabled: isEnable,
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

		buildCharacteristicTemplate: function (sCharPath, sPlant, bsaved, sText, isContainer) {
			var aCustomData = [];

			var oProspectModel = this.getView().getModel("prospectModel");
			var isEnable = oProspectModel.getProperty("/rotateProspect") === true ? false : true;

			if (!bsaved) {
				var sChars = oProspectModel.getProperty("/Characteristics");

				if (!sChars) {
					oProspectModel.setProperty("/Characteristics", []);
				}

				var sCharLength = oProspectModel.getProperty("/Characteristics").length;
				var sText = sText ? "Centro " + sPlant + " - " + sText : sCharPath + "/NAME1}";

				oProspectModel.setProperty("/Characteristics/" + sCharLength, {});
				oProspectModel.setProperty("/Characteristics/" + sCharLength + "/status", "New");
				oProspectModel.setProperty("/Characteristics/" + sCharLength + "/plant", sPlant);
				oProspectModel.setProperty("/Characteristics/" + sCharLength + "/NAME1", sText);

				if (isContainer === true) {
					oProspectModel.setProperty("/Characteristics/" + sCharLength + "/container", true);
					oProspectModel.setProperty("/Characteristics/" + sCharLength + "/status", "Old");
				}

				aCustomData.push(new sap.ui.core.CustomData({
					key: "sPath",
					value: "/Characteristics/" + sCharLength
				}));
				sCharPath = "{prospectModel>/Characteristics/" + sCharLength;

			} else {
				aCustomData.push(new sap.ui.core.CustomData({
					key: "sPath",
					value: sCharPath
				}));
				sCharPath = "{/" + sCharPath;
			}

			var sMainPlant = sPlant ? sPlant : sCharPath + "/HCP_CHARAC_ID}";
			var sCenter = sPlant ? sPlant : sCharPath + "/ATINN}";
			var sText = sText ? sText : sCharPath + "/NAME1}";

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
								text: "Centro",
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),
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
								editable: isEnable,
								width: "auto",
								maxLength: 0,
								value: sCharPath + "/ATFLV}"
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
								editable: isEnable,
								width: "auto",
								maxLength: 0,
								wrapping: "None",
								value: sCharPath + "/HCP_COMMENTS}",
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
										enabled: isEnable,
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

		removeMask: function (sValue) {
			return sValue.replace(/[()._/-]/g, '');
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

		buildBankTemplate: function () {

			var oProspectModel = this.getView().getModel("prospectModel");
			var isEnable = oProspectModel.getProperty("/rotateProspect") === true ? false : true;
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
								editable: isEnable,
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
								placeholder: "Selecione",
								editable: isEnable,
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
								editable: isEnable,
								width: "auto",
								maxLength: 0,
								value: "{prospectModel>/Banks/" + sCharLength + "/AGENCIA}"
							}),
							new sap.m.Input({
								placeholder: "Dígito Agencia",
								type: "Text",
								editable: isEnable,
								width: "auto",
								maxLength: 0,
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
								placeholder: "Digite Conta Corrente",
								type: "Text",
								editable: isEnable,
								width: "auto",
								maxLength: 0,
								value: "{prospectModel>/Banks/" + sCharLength + "/CONTA}"
							}),
							new sap.m.Input({
								placeholder: "Dígito Conta",
								type: "Text",
								editable: isEnable,
								width: "auto",
								maxLength: 0,
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
										enabled: isEnable,
										width: "40%",
										text: 'Excluir',
										press: this.removeBanks.bind(this)
									})
								]
							})
						]
					})
				]
			});
		},

		onCancel: function (oEvent) {
			//this.setBusyDialog("App Grãos", "Aguarde");
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			if (this.getOwnerComponent().getModel().hasPendingChanges()) {
				MessageBox.warning(
					"As modificações serão perdidas. Deseja Continuar?", {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {
								this.getOwnerComponent().getModel().resetChanges();

								this.navBack();
							} else {
								this.closeBusyDialog();
							}
						}.bind(this)
					}
				);
			} else {
				this.navBack();
			}
		},
		onExit: function (oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			if (this.getOwnerComponent().getModel().hasPendingChanges()) {
				MessageBox.warning(
					"As modificações serão perdidas. Deseja Continuar?", {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "OK") {
								this.getOwnerComponent().getModel().resetChanges();
								this.navBack();
							} else {
								this.closeBusyDialog();
							}
						}.bind(this)
					}
				);
			} else {
				this.navBack();
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

		_onCreateSuccess: function () {
			sap.m.MessageToast.show("Prospect salvo com sucesso!");
			setTimeout(function () {
				this.navBack();
			}.bind(this), 500);

		},
		_onCreateError: function () {
			sap.m.MessageToast.show("Erro ao salvar Prospect");
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
		cancelProspect: function () {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			MessageBox.warning(
				"Tem certeza que deseja cancelar este project?", {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						if (sAction === "YES") {
							var sPath = this.getView().getElementBinding().getPath();
							var oModel = this.getOwnerComponent().getModel();

							var oPropertiesEdit = {
								HCP_STATUS: "3",
								HCP_UPDATED_AT: this._formatDate(new Date())
							};

							oModel.update(sPath, oPropertiesEdit, {
								groupId: "changes"
							});

							if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

								oModel.submitChanges({
									groupId: "changes",
									success: function () {
										//		this.flushStore("Prospects", "Characteristics", "Banks", "Irf").then(function () {
										//			this.refreshStore("Prospects").then(function () {
										//				this.refreshStore("Characteristics").then(function () {
										//					this.refreshStore("Banks").then(function () {
										//						this.refreshStore("Irf").then(function () {
										sap.m.MessageToast.show("Prospect cancelado com sucesso!");
										this.closeBusyDialog();
										setTimeout(function () {
											this.navBack();
										}.bind(this), 500);
										//						}.bind(this));
										//					}.bind(this));
										//				}.bind(this));
										//			}.bind(this));

										//		}.bind(this));
									}.bind(this),
									error: function () {
										console.log("Erro ao cancelar prospect.");
										this.closeBusyDialog();
									}.bind(this)
								});

							} else {
								oModel.submitChanges({
									groupId: "changes",
									success: function () {
										sap.m.MessageToast.show("Prospect cancelado com sucesso!");
										this.closeBusyDialog();
										setTimeout(function () {
											this.navBack();
										}.bind(this), 500);
									}.bind(this),
									error: function () {
										console.log("Erro ao cancelar prospect.");
										this.closeBusyDialog();
									}.bind(this)
								});
							}

						}
					}.bind(this)
				}
			);
		},
		rotateProspect: function () {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			MessageBox.warning(
				"Tem certeza que deseja retomar este project?", {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						if (sAction === "YES") {
							var sPath = this.getView().getElementBinding().getPath();
							var oModel = this.getOwnerComponent().getModel();
							var aDeferredGroups = oModel.getDeferredGroups();
							oModel.setUseBatch(true);

							if (aDeferredGroups.indexOf("changes") < 0) {
								aDeferredGroups.push("changes");
								oModel.setDeferredGroups(aDeferredGroups);
							}

							var oPropertiesEdit = {
								HCP_STATUS: "1",
								NRSOL: "",
								HCP_UPDATED_AT: this._formatDate(new Date())
							};

							oModel.update(sPath, oPropertiesEdit, {
								groupId: "changes"
							});

							if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

								oModel.submitChanges({
									groupId: "changes",
									success: function () {
										//		this.flushStore("Prospects", "Characteristics", "Banks", "Irf").then(function () {
										//			this.refreshStore("Prospects").then(function () {
										//				this.refreshStore("Characteristics").then(function () {
										//					this.refreshStore("Banks").then(function () {
										//						this.refreshStore("Irf").then(function () {
										sap.m.MessageToast.show("Prospect retomado com sucesso!");
										this.closeBusyDialog();
										setTimeout(function () {
											this.navBack();
										}.bind(this), 500);
										//							}.bind(this));
										//						}.bind(this));
										//					}.bind(this));
										//				}.bind(this));
										//
										//			}.bind(this));
									}.bind(this),
									error: function () {
										console.log("Erro ao retomar prospect.");
										this.closeBusyDialog();
									}.bind(this)
								});

							} else {
								oModel.submitChanges({
									groupId: "changes",
									success: function () {
										sap.m.MessageToast.show("Prospect retomado com sucesso!");
										this.closeBusyDialog();
										setTimeout(function () {
											this.navBack();
										}.bind(this), 500);
									}.bind(this),
									error: function () {
										console.log("Erro ao retomar prospect.");
										this.closeBusyDialog();
									}.bind(this)
								});
							}

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
			var oPopoverModel = this.getView().getModel("prospectModel");
			var oCharForm = this.getView().byId("CharacteristicsSimpleForm");
			var sCurrentChars = oPopoverModel.getProperty("/Characteristics") || [];
			var sSavedChars = this.getSavedCharacteristics() || [];
			var bHasPlant = sCurrentChars.concat(sSavedChars).filter(char => char.plant.toString() === sPlant && char.status === "New").length >
				0 ? true : false;

			if (bHasPlant) {
				MessageBox.information("Centro já cadastrado, por favor selecione outro.");
				this._oPlantPopover.destroy();
			} else {
				this._oPlantPopover.destroy();
				var oCharTemplate = this.buildCharacteristicTemplate(null, sPlant, false, sText);

				oCharForm.addContent(new sap.m.Label({
					text: ""
				}));
				oCharForm.addContent(oCharTemplate);
				//this._validateForm();

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
		validateFormProspect: function (aFilters, oObject, sFilter, isApprove) {

			var oModel = this.getOwnerComponent().getModel();
			self = this;
			if (sFilter === "STCD2") {

				var sCpf = self.removeMask(oObject.STCD2);

				aFilters.push(new sap.ui.model.Filter({
					path: "STCD2",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: sCpf
				}));

				oModel.read("/View_Suppliers", {
					filters: aFilters,
					success: function (oResultsSuppliers) {
						if (oResultsSuppliers.results.length > 0) {

							if (oObject.BRSCH === '0014') {

								if (!oObject.STCD3) {
									self.closeBusyDialog();
									MessageBox.warning("Inscrição estadual deve ser preenchido.");

								} else {
									var sIESaved = '';

									for (var data in oResultsSuppliers.results) {
										if (sIESaved !== '') {
											sIESaved = sIESaved + ", " + oResultsSuppliers.results[data].STCD3;
										} else {
											sIESaved = sIESaved + oResultsSuppliers.results[data].STCD3;
										}

									}

									var hasError = false;
									for (var dataStcd3 in oResultsSuppliers.results) {
										if (oObject.STCD3 === oResultsSuppliers.results[dataStcd3].STCD3) {
											hasError = true;
										}
									}
									if (hasError) {
										self.closeBusyDialog();
										MessageBox.warning("Inscrição estadual deve ser diferente de: " + sIESaved);

									} else {
										self.updateProspect(isApprove);
									}
								}
							}
						} else {
							self.updateProspect(isApprove);
						}
					}
				});
			} else {
				self.updateProspect(isApprove);
			}
		},
		onIrfPlantSelected: function (oEvent) {

			var sPlant = oEvent.getParameter("item").getKey();

			var oCharForm = this.getView().byId("irfSimpleForm");

			var oCharTemplate = this.buildIrfTemplate("", false, sPlant);
			oCharForm.addContent(new sap.m.Label({
				text: ""
			}));
			oCharForm.addContent(oCharTemplate);
			this._oPlantPopoverIrf.close();

		},
		onCancelDialogPressed: function (oEvent) {
			oEvent.getSource().getParent().close();
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

		}
	});
}, /* bExport= */ true);