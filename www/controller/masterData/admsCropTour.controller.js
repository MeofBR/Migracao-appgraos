sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function (MainController, MessageBox, History) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.masterData.admsCropTour", {

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("masterData.admsCropTour").attachPatternMatched(this.handleRouteMatched, this);
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "indexModel");
		},

		handleRouteMatched: function () {
			this.count = 0;
			this.arrayEdit = [];
			this.revertCount = 20;
			this.statusList = "1";
			this.countRegister = 0;
			this.hasFinished = false;
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			if (bIsMobile) {
				this.getView().getModel("indexModel").setProperty("/isMobile", true);
			} else {
				this.getView().getModel("indexModel").setProperty("/isMobile", false);
			}

			var lastUpdate;

			var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/yyyy HH:mm"
			});

			if (localStorage.getItem("lastUpdateOfferMap")) {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdateOfferMap")));
			} else {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdate")));
			}
			this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdate);

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableCreate: false
			}), "filterPageModel");
			
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				itemAdmsCropTour: []
			}), "filterAdmsCropTour");

			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "admsCropTourModel");
			this.getParameters(this.statusList);
		},

		backToIndex: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
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

		//Melhorias//
		_validateForm: function (oEvent) {
			if(oEvent.getSource().getName() == "STATE"){
				this.getParameters(this.statusList);              
			}
			
			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;
				var oFilterModel = this.getView().getModel("filterPageModel");

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required) {
						var sValue = oControl.getValue();
						if (!sValue || oControl.getValueState() !== 'None') {
							oFilterModel.setProperty("/enableCreate", false);
							return;
						}
					}
				}
				oFilterModel.setProperty("/enableCreate", true);
			}.bind(this), 100);
		},
		
		_getFormFields: function () {
			var oMainDataForm = sap.ui.core.Fragment.byId("tablePriceId" + this.getView().getId(), "formPrice").getContent();
			var aControls = [];
			var sControlType;

			for (var i = 0; i < oMainDataForm.length; i++) {
				sControlType = oMainDataForm[i].getMetadata().getName();
				if (sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" || sControlType === "sap.m.Input" ||
					sControlType === "sap.m.DateTimeInput" || sControlType === "sap.m.DatePicker" ||
					sControlType === "sap.m.CheckBox" || sControlType === "sap.m.MaskInput" || sControlType === "sap.m.ComboBox") {
					if (oMainDataForm[i].getVisible()) {
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
		
		getParameters: function (status) {
			this.setBusyDialog("Master Data Permissions", "Carregando Parâmetros...");
			var oModel = this.getView().getModel();
			var oTableModel = this.getView().getModel("filterAdmsCropTour");
			oTableModel.setProperty("/itemAdmsCropTour", []);
			var oTable = this.getView().byId("table");

			oModel.read("/Adms_Croptour", {
				success: function (result) {
					if (result.results.length > 0) {
						oTableModel.setProperty("/itemAdmsCropTour", result.results);
					
						oTable.getBinding("items").refresh();
					}
					this.closeBusyDialog();
				}.bind(this)
			});
		},
		_onEdit: function (oEvent) {
			oEvent.getSource().getParent().close();
			this.setBusyDialog("App Grãos", "Editando, aguarde");

			var oCreateModel = this.getView().getModel("admsCropTourModel");
			var oData = oCreateModel.getProperty("/");
			var oModel = this.getOwnerComponent().getModel();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
            var aDeferredGroups = oModel.getDeferredGroups();
            
			oModel.setUseBatch(true);
			var oProperties = {
				HCP_ID: oData.HCP_ID,
				HCP_USER_ID: oData.HCP_USER_ID,
				HCP_ACTIVE: "1",
			};
			
			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}
	     	var sPath;
			sPath = this.buildEntityPath("Adms_Croptour", oProperties, "HCP_ID");
			oModel.update(sPath, oProperties, {
				groupId: "changes"
			});
			
			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				oModel.submitChanges({
					groupId: "changes",
					success: function () {
						
						MessageBox.success(
							"Parâmetros editados com sucesso.", {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									this.closeBusyDialog();
									this.getParameters();
									this._onDialogAdmsCropTourCancelPress()
								}.bind(this)
							}
						);
					}.bind(this),
					error: function () {
						this.closeBusyDialog();
						MessageBox.error("Erro ao editar Parâmetros.");
						this._onDialogAdmsCropTourCancelPress()
					}.bind(this)
				});

			} else {

				oModel.submitChanges({
					groupId: "changes",
					success: function () {
						MessageBox.success(
							"Parâmetros editados com sucesso.", {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									this.closeBusyDialog();
									this.getParameters();
									this._onDialogAdmsCropTourCancelPress()
								}.bind(this)
							}
						);
					}.bind(this),
					error: function () {
						this.closeBusyDialog();
						MessageBox.error("Erro ao editar Parâmetros.");
						this._onDialogAdmsCropTourCancelPress()
					}.bind(this)
				});
			}

		},
		_onSave: function (oEvent) {

			oEvent.getSource().getParent().close();
			
			this.setBusyDialog("App Grãos", "Cadastrando, aguarde");

			var oCreateModel = this.getView().getModel("admsCropTourModel");
			var oData = oCreateModel.getProperty("/");
			var oModel = this.getOwnerComponent().getModel();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var sTimestamp = new Date().getTime();

			oModel.setUseBatch(true);

			var oProperties = {
				HCP_ID: sTimestamp.toFixed(),
				HCP_USER_ID: oData.HCP_USER_ID,
				HCP_ACTIVE: "1",
			};

			oModel.createEntry("/Adms_Croptour", {
				properties: oProperties
			});

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				oModel.submitChanges({
					success: function () {
						MessageBox.success(
							"Parâmetros cadastrados com sucesso.", {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									//	this.navBack();
									this.closeBusyDialog();
									this.getParameters(this.statusList);
									this._onDialogAdmsCropTourCancelPress()
								}.bind(this)
							}
						);

					}.bind(this),
					error: function () {
						this.closeBusyDialog();
						MessageBox.error("Erro ao cadastrar Parâmetros.");
						this._onDialogAdmsCropTourCancelPress()
					}.bind(this)
				});

			} else {
				oModel.submitChanges({
					success: function () {
						MessageBox.success(
							"Parâmetros cadastrados com sucesso.", {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									//	this.navBack();
									this.closeBusyDialog();
									this.getParameters(this.statusList);
									this._onDialogAdmsCropTourCancelPress()
								}.bind(this)
							}
						);
					}.bind(this),
					error: function () {
						this.closeBusyDialog();
						MessageBox.error("Erro ao cadastrar Parâmetros.");
						this._onDialogAdmsCropTourCancelPress()
					}.bind(this)
				});
			}
		},
		
		_openDialogRegion: function () {
			if (!this._FragmentPrice) {
				this._FragmentPrice = sap.ui.xmlfragment("tablePriceId" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.masterData.fragments.admsCropTourFragment",
					this);
				this.getView().addDependent(this._FragmentPrice);
			}
			
			var oModel = this.getView().getModel("admsCropTourModel");
			
			var oModelMasterDataPermission = new sap.ui.model.json.JSONModel({
				HCP_ID: "",
				HCP_ACTIVE: "1",
			});

			this.getView().setModel(oModelMasterDataPermission, "admsCropTourModel");
			
			var oModelModal = this.getView().getModel("filterPageModel");
			oModelModal.setProperty("/enableCreateButton",true);
			oModelModal.setProperty("/enableEditButton",false);
			oModelModal.setProperty("/enableCreate",false);
			
			this._FragmentPrice.open();
		},
		_onDialogAdmsCropTourCancelPress: function (oEvent) {
			oEvent && oEvent.getSource().getParent().close();
			this.getView().getModel("admsCropTourModel").oData = {}
			this._FragmentPrice.destroy()
			this._FragmentPrice = null;
		},
		
		_onDeleteButton: function(oEvent){
			var oItem = oEvent.getSource();
			var sPlit = oItem.oParent.oParent.oBindingContexts.filterAdmsCropTour.sPath.split("/");
			var sIndex = sPlit[2];
			var oData = oItem.oParent.oParent.oBindingContexts.filterAdmsCropTour.oModel.oData.itemAdmsCropTour[sIndex];
			var oModel = this.getOwnerComponent().getModel();
			
			MessageBox.information("Deseja Inativar o parâmetro?", {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					onClose: function (oAction) {

						if (oAction === "YES") {
							var sPath;
							var aDeferredGroups = oModel.getDeferredGroups();
							
							oModel.setUseBatch(true);
							
							if (aDeferredGroups.indexOf("changes") < 0) {
								aDeferredGroups.push("changes");
								oModel.setDeferredGroups(aDeferredGroups);
							}
							
							var oProperties = {
								HCP_ID: oData.HCP_ID,
								HCP_USER_ID: oData.HCP_USER_ID,
								HCP_ACTIVE: "0",
							};
						
							sPath = this.buildEntityPath("Adms_Croptour", oProperties, "HCP_ID");
							oModel.update(sPath, oProperties, {
								groupId: "changes"
							});
							
							oModel.submitChanges({
								groupId: "changes",
								success: function () {
									MessageBox.success(
										"Parâmetro Inativado com sucesso.", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.closeBusyDialog();
												this.getParameters(this.statusList);	
											}.bind(this)
										}
									);
								}.bind(this),
								error: function () {
									MessageBox.success(
										"Erro ao excluir parâmetro.", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.closeBusyDialog();
												this.getParameters(this.statusList);	
											}.bind(this)
										}
									);
								}.bind(this)
							});
						}
					}.bind(this)
				}
			);
		},
		
		_onEditButton: function (oEvent) {
			var oItem = oEvent.getSource();
			var sPlit = oItem.oParent.oParent.oBindingContexts.filterAdmsCropTour.sPath.split("/");
			var sIndex = sPlit[2];
			var oData = oItem.oParent.oParent.oBindingContexts.filterAdmsCropTour.oModel.oData.itemAdmsCropTour[sIndex];
			
			if (!this._FragmentPrice) {
				this._FragmentPrice = sap.ui.xmlfragment("tablePriceId" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.masterData.fragments.admsCropTourEditFragment",
					this);
				this.getView().addDependent(this._FragmentPrice);
			}
			
			var oModelTablePrice = new sap.ui.model.json.JSONModel({
				HCP_ID: oData.HCP_ID,
				HCP_USER_ID: oData.HCP_USER_ID,
				HCP_ACTIVE: "0"
			});

			this.getView().setModel(oModelTablePrice, "admsCropTourModel");
			
			var oModelModal = this.getView().getModel("filterPageModel");
			
			oModelModal.setProperty("/enableCreate",true);
			oModelModal.setProperty("/enableCreateButton",false);
			oModelModal.setProperty("/enableEditButton",true);
			this.arrayEdit = oModelTablePrice; 
			
			this._FragmentPrice.open();
		},
		
		_onActiveButton: function(oEvent){
			var oItem = oEvent.getSource();
			var sPlit = oItem.oParent.oParent.oBindingContexts.filterAdmsCropTour.sPath.split("/");
			var sIndex = sPlit[2];
			var oData = oItem.oParent.oParent.oBindingContexts.filterAdmsCropTour.oModel.oData.itemAdmsCropTour[sIndex];
			var oModel = this.getOwnerComponent().getModel();
			
			MessageBox.information("Deseja Ativar o parâmetro?", {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					onClose: function (oAction) {
						if (oAction === "YES") {
							var sPath;
							var aDeferredGroups = oModel.getDeferredGroups();

							oModel.setUseBatch(true);

							if (aDeferredGroups.indexOf("changes") < 0) {
								aDeferredGroups.push("changes");
								oModel.setDeferredGroups(aDeferredGroups);
							}
							
							var oProperties = {
								HCP_ID: oData.HCP_ID,
								HCP_USER_ID: oData.HCP_USER_ID,
								HCP_ACTIVE: "1",
							};
				
						
							sPath = this.buildEntityPath("Adms_Croptour", oProperties, "HCP_ID");
							oModel.update(sPath, oProperties, {
								groupId: "changes"
							});
							
							oModel.submitChanges({
								groupId: "changes",
								success: function () {
									MessageBox.success(
										"Parâmetro ativado com sucesso.", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.closeBusyDialog();
												this.getParameters(this.statusList);	
											}.bind(this)
										}
									);
								
								}.bind(this),
								error: function () {
									MessageBox.success(
										"Erro ao ativar parâmetro.", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.closeBusyDialog();
												this.getParameters(this.statusList);	
											}.bind(this)
										}
									);
								}.bind(this)
							});
						}
					}.bind(this)
				}
			);
		},
		
		handleIconTabBarSelect: function (oEvent) {
			var sKey = oEvent.getParameter("key");

			if (sKey == "Ativo") {
				this.statusList = "1";
				this.getParameters("1");
			} else {
				this.statusList = "0";
				this.getParameters("0");
			}
		},
		
		buildEntityPath: function (sEntityName, oEntity, oField) {

			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity[oField] + "l)";
			}
		}

	});
}, /* bExport= */ true);