sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/List',
	'sap/m/StandardListItem',
	"sap/ui/core/routing/History"
], function (MainController, MessageBox, JSONModel, Button, Dialog, List, StandardListItem, History) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.visitForm.New", {

		onInit: function () {

			var oModel = this.getOwnerComponent().getModel();
			oModel.attachRequestCompleted(function () {
				this.closeBusyDialog();
			}.bind(this), 2000);
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//this.oRouter.getRoute("visitForm.New").attachPatternMatched(this.handleRouteMatched, this);
			this.oRouter.getTarget("visitForm.New").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				produtorComboBox: false,
				companyComboBox: false,
				enableConfirm: false,
				yesProspect: false,
				yesPartner: true,
				partnerProspect: "Fornecedor"
			}), "visitFormModel");

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
			var oCreateModel = this.getView().getModel("visitFormModel");
			var oData = oCreateModel.oData;

			if (oData.HCP_PROVIDER_ID === undefined) {
				this.getView().getModel("visitFormModel").setData({
					rodutorComboBox: false,
					companyComboBox: false,
					enableConfirm: false,
					yesProspect: false,
					yesPartner: true,
					partnerProspect: "Fornecedor"
				});
			}

			// oCreateModel.setProperty("/enableConfirm", false);

			this._validateForm();

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				create: true,
				edit: true
			}), "profileModel");
			
			if(oEvent.getParameter("data").partner){
				this.getView().getModel("visitFormModel").oData["HCP_PROVIDER_ID"] = oEvent.getParameter("data").partner;
				this.getView().getModel("visitFormModel").oData["PROVIDER_DESC"] = decodeURIComponent(oEvent.getParameter("data").partnerName);
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

		_onInputFormSelect: function (oEvent) {

			var oModelYearly = this.getView().getModel("visitFormModel");
			var oInput = oEvent.getSource();

			oModelYearly.setProperty("/HCP_PROVIDER_ID", null);
			oModelYearly.setProperty("/PROVIDER_DESC", null);

			if (oInput.getSelectedKey() === "Fornecedor") {

				oModelYearly.setProperty("/yesProspect", false);
				oModelYearly.setProperty("/yesPartner", true);

			} else {

				oModelYearly.setProperty("/yesProspect", true);
				oModelYearly.setProperty("/yesPartner", false);

			}

			this._validateForm();

		},

		onCancelPress: function () {
			this.navBack();
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

		onConfirmPress: function () {

			var oModelVisit = this.getView().getModel();
			var oModelFilters = this.getView().getModel("visitFormModel");
			var oData = oModelFilters.getProperty("/");
			var aFilters = [];
			var aSortes = [];
			var oEditedAt;
			var oCreatedAt;

			if (oModelFilters.oData.checkListType === "Periodic" || oModelFilters.oData.checkListType === "Yearly" ||
				oModelFilters.oData.checkListType === "Grains" || oModelFilters.oData.checkListType === "Industry") {

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_PROVIDER_ID',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_PROVIDER_ID
				}));

				aSortes.push(new sap.ui.model.Sorter({
					path: "HCP_CREATED_AT",
					descending: true
				}));

				aSortes.push(new sap.ui.model.Sorter({
					path: "HCP_VISIT_ID",
					descending: true
				}));

				var oTable = "/Visit_Form_" + oModelFilters.oData.checkListType;

				oModelVisit.read(oTable, {

					filters: aFilters,
					sorters: aSortes,

					success: function (result) {
						var oVisit = result.results;
						if (oVisit.length > 0) {

							oCreatedAt = new Date(result.results[0].HCP_CREATED_AT);
							oEditedAt = oCreatedAt.getUTCDate();
							oCreatedAt.setUTCDate(oEditedAt + 7);

							if (new Date() > oCreatedAt) { //Periodo Vencido
								this.goToCreate("Edit");

							} else { //Periodo Válido
								this.onEditVisit(oModelFilters.oData.checkListType, this.buildEntityPath(oModelFilters.oData.checkListType, result.results[
									0]));
							}

						} else {
							this.goToCreate("New");
						}
					}.bind(this),
					error: function () {
						sap.m.MessageToast.show("Falha ao Buscar Acompanhamentos.");
					}
				});

			} else {
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

				MessageBox.information(
					"Interface não disponível", {
						actions: [sap.m.MessageBox.Action.OK],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {}.bind(this)
					}
				);
			}

		},

		buildEntityPath: function (oFormVisit, oEntity) {
			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/Visit_Form_" + oFormVisit + "(" + oEntity.HCP_VISIT_ID + "l)";
			}
		},

		onEditVisit: function (oFormVisit, oVisitPath) {

			MessageBox.information(

				"Lista de Visitas já existe para o período atual. Deseja modificá-la?", {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					onClose: function (oAction) {

						if (oAction === "YES") {

							var sView = "visitForm.Edit" + oFormVisit + "VisitForm";
							// var sPath = "/Visit_Form_" + oFormVisit + "(" + oVisitId + "l)";

							this.oRouter.navTo(sView, {
								keyData: encodeURIComponent(oVisitPath)
							});
						} else {
							this._oEditVisitDialog.close();
						}

					}.bind(this)
				}
			);

			// sap.m.MessageBox.information(
			// 	"Lista de Visitas já existe para o período atual. Deseja modificá-la?", {
			// 		icon: sap.m.MessageBox.Icon.INFORMATION,
			// 		actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
			// 		onClose: function (oAction) {

			// 			if (oAction === "YES") {

			// 				var sView = "visitForm.Edit" + oFormVisit + "VisitForm";
			// 				// var sPath = "/Visit_Form_" + oFormVisit + "(" + oVisitId + "l)";

			// 				this.oRouter.getTargets().display(sView, {
			// 					keyData: encodeURIComponent(oVisitPath)
			// 				});
			// 			} else {
			// 				this._oEditVisitDialog.close();
			// 			}

			// 		}.bind(this)
			// 	}
			// );
		},

		goToCreate: function (oAction) {
			var oModel = this.getView().getModel("visitFormModel");
			var oData = oModel.getData();
			var oNavTo = "visitForm.New" + oModel.oData.checkListType + "VisitForm";
			var aData;

			if (oAction === "Edit") {

				MessageBox.information(

					"Já existe uma ficha criada. Deseja criar nova ficha?", {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						onClose: function (sAction) {
							if (sAction === "YES") {

								aData = {
									HCP_PROVIDER_ID: encodeURIComponent(oData.HCP_PROVIDER_ID),
									HCP_CONTACT_TYPE: encodeURIComponent(oData.HCP_CONTACT_TYPE),
									HCP_CONTACT_INICIATIVE: encodeURIComponent(oData.HCP_CONTACT_INICIATIVE),
									HCP_VISIT_FORM: encodeURIComponent(oData.HCP_VISIT_FORM),
									HCP_INTERACTION_OBJECTIVE: encodeURIComponent(oData.HCP_INTERACTION_OBJECTIVE)
								};

								this.oRouter.navTo(oNavTo, {
									keyData: encodeURIComponent(JSON.stringify(aData))
								}, false);

							} else {
								this._oEditVisitDialog.close();
							}
						}.bind(this)
					}
				);
			} else {

				aData = {
					HCP_PROVIDER_ID: encodeURIComponent(oData.HCP_PROVIDER_ID),
					HCP_CONTACT_TYPE: encodeURIComponent(oData.HCP_CONTACT_TYPE),
					HCP_CONTACT_INICIATIVE: encodeURIComponent(oData.HCP_CONTACT_INICIATIVE),
					HCP_VISIT_FORM: encodeURIComponent(oData.HCP_VISIT_FORM)
				};

				this.oRouter.navTo(oNavTo, {
					keyData: encodeURIComponent(JSON.stringify(aData))
				}, false);
			}

		},

		goToEdit: function (sPath) {

			var oModel = this.getView().getModel("visitFormModel");
			var oNavTo = "visitForm.Edit" + oModel.oData.checkListType + "VisitForm";

			this.oRouter.navTo(oNavTo, {
				keyData: encodeURIComponent(sPath)
			}, false);
		},

		_validateVisitForm: function (oEvent) {
			var oInput = oEvent.getSource();
			var sSelectInput = oInput.getSelectedKey();

			this.getView().getModel("visitFormModel").setProperty("/checkListType", "");

			if (sSelectInput === 'Produtor') {
				this.getView().getModel("visitFormModel").setProperty("/produtorComboBox", true);
				this.getView().getModel("visitFormModel").setProperty("/companyComboBox", false);
			} else {
				this.getView().getModel("visitFormModel").setProperty("/companyComboBox", true);
				this.getView().getModel("visitFormModel").setProperty("/produtorComboBox", false);
			}

			this._validateForm();
		},

		_validateForm: function () {
			var oFilterModel = this.getView().getModel("visitFormModel");

			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required && oControl.getVisible()) {
						var oInputId = aInputControls[m].control.getMetadata();

						if (oInputId.getName() === "sap.m.Input") {
							var sValue = oControl.getValue();
						} else if (oInputId.getName() === "sap.m.ComboBox" || oInputId.getName() ===
							"com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox") {
							sValue = oControl.getSelectedKey();
						}

						if (sValue.length > 0) {
							oFilterModel.setProperty("/enableConfirm", true);
						} else {
							oFilterModel.setProperty("/enableConfirm", false);
							return;
						}
					}
				}
			}.bind(this), 100);
		},

		_getFormFields: function () {
			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();

			var oAllForms = oMainDataForm;
			var aControls = [];
			var sControlType;

			for (var i = 0; i < oAllForms.length; i++) {
				var sControlType1 = oAllForms[i].getMetadata().getName();
				if (sControlType1 === "sap.m.Label") {
					if (sControlType = oAllForms[i + 1]) {
						sControlType = oAllForms[i + 1].getMetadata().getName();
						if (sControlType === "sap.m.Input" || sControlType === "sap.m.ComboBox" || sControlType ===
							"com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox") {
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
			var oVisitModel = this.getView().getModel("visitFormModel");
			var oData = oVisitModel.getProperty("/");
			var SelectedPartner = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

			oData["HCP_PROVIDER_ID"] = SelectedPartner.HCP_REGISTER;
			oData["PROVIDER_DESC"] = SelectedPartner.NAME1;
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
		}
	});
}, /* bExport= */ true);