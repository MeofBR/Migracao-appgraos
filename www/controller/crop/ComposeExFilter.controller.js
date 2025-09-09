sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.crop.ComposeExFilter", {
		formatter: formatter,
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("crop.ComposeExFilter").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableConfirm: false,
				regionEnabled: false,
				period1Enabled: false,
				period2Enabled: false,
				HCP_STATE: '',
				HCP_REGION: '',
				HCP_MATERIAL: '',
				HCP_CROP_YEAR1: '',
				HCP_CROP_YEAR2: '',
				HCP_COMMERCIALIZATION1: '',
				HCP_COMMERCIALIZATION2: ''
			}), "composeExFilterModel");
		},

		handleRouteMatched: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var oComposeFilterModel = this.getView().getModel("composeExFilterModel");

			oComposeFilterModel.setProperty("/regionEnabled", false);

			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			// this.refreshData();
		},

		refreshData: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				this.setBusyDialog("App Grãos", "Aguarde");
				this.flushStore().then(function () {
					this.refreshStore("Crop_Tracking").then(function () {
						this.getView().getModel().refresh(true);
						this.getView().byId("pullToRefreshID").hide();
						this.closeBusyDialog();
					}.bind(this));
				}.bind(this));
			} else {
				this.getView().getModel().refresh(true);
				this.getView().byId("pullToRefreshID").hide();
				this.closeBusyDialog();
			}
		},

		onCropYearChange: function (oEvent) {
			var oComposeFilterModel = this.getView().getModel("composeExFilterModel");
			var oSource = oEvent.getSource();
			var sName = oSource.getName();
			var sSelectedKey = oSource.getSelectedKey();
			var oFilters = [];
			var oCBPeriod1 = this.getView().byId("cbPeriod1");
			var oCBPeriod2 = this.getView().byId("cbPeriod2");
			var oStateKey = oComposeFilterModel.getProperty("/HCP_STATE");
			var oRegionKey = oComposeFilterModel.getProperty("/HCP_REGION");
			var oMaterialKey = oComposeFilterModel.getProperty("/HCP_MATERIAL");

			if (sSelectedKey) {
				oFilters.push(new sap.ui.model.Filter("HCP_CROP_ID", sap.ui.model.FilterOperator.EQ, sSelectedKey));
				oFilters.push(new sap.ui.model.Filter("HCP_STATE", sap.ui.model.FilterOperator.EQ, oStateKey));
				oFilters.push(new sap.ui.model.Filter("HCP_REGIO", sap.ui.model.FilterOperator.EQ, oRegionKey));
				oFilters.push(new sap.ui.model.Filter("HCP_MATERIAL", sap.ui.model.FilterOperator.EQ, oMaterialKey));
				
				var sProperty = sName === "crop1" ? "/period1Enabled" : "/period2Enabled";
				var oCB = sName === "crop1" ? oCBPeriod1 : oCBPeriod2;
				
				oCB.getBinding("items").filter(oFilters);
				
				setTimeout(function () {
					if (oCB.getItems().length > 0) {
						oComposeFilterModel.setProperty(sProperty, true);
						this.onKeyInfoFill();
					} else {
						oComposeFilterModel.setProperty(sProperty, false);
					}
				}.bind(this), 500);
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
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}
		},

		onCreateOrEditCrop: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("crop.Filter", true);
		},

		_onConfirm: function () {
			this.initializeComposeReport().then(data => {
				var oComposeFilterModel = this.getView().getModel("composeExFilterModel");
				var oData = oComposeFilterModel.getData();
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				var oKeyData = {
					HCP_STATE: oData.HCP_STATE,
					HCP_REGION: oData.HCP_REGION,
					HCP_MATERIAL: oData.HCP_MATERIAL,
					HCP_CROP_YEAR1: oData.HCP_CROP_YEAR1,
					HCP_PERIOD1: oData.HCP_PERIOD1,
					HCP_CROP_YEAR2: oData.HCP_CROP_YEAR2,
					HCP_PERIOD2: oData.HCP_PERIOD2,
					HCP_COMMERCIALIZATION1: oData.HCP_COMMERCIALIZATION1,
					HCP_COMMERCIALIZATION2: oData.HCP_COMMERCIALIZATION2
				};

				oRouter.navTo("crop.ComposeEx", {
					keyData: JSON.stringify(oKeyData)
				});
			}).catch(error => {
				MessageBox.information(
					"Valores não encontrados para a chave selecionada.", {
						actions: [sap.m.MessageBox.Action.OK],
						onClose: sAction => {

						}
					}
				);
				console.log(error);

			});
		},

		initializeComposeReport: function () {
			return new Promise(function (resolve, reject) {
				var oComposeExModel = this.getView().getModel("composeExFilterModel");
				var oModel = this.getView().getModel();
				var oData = oComposeExModel.getData();
				oModel.setUseBatch(false);
				var aPromises = [];

				aPromises.push(new Promise(function (resolve, reject) {
					var aFilters = [];

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_CROP',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_CROP_YEAR1
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_STATE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_STATE
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_REGIO',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_REGION
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_MATERIAL',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_MATERIAL
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_PERIOD',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_PERIOD1
					}));

					oModel.read("/Crop_Tracking", {
						filters: aFilters,
						success: function (data) {
							if (data.results.length > 0) {
								resolve();
							} else {
								reject();
							}
						},
						error: function (error) {
							reject(error);
						}
					});

				}.bind(this)));
				aPromises.push(new Promise(function (resolve, reject) {
					var aFilters = [];

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_CROP',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_CROP_YEAR2
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_STATE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_STATE
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_REGIO',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_REGION
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_MATERIAL',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_MATERIAL
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_PERIOD',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_PERIOD2
					}));

					oModel.read("/Crop_Tracking", {
						filters: aFilters,
						success: function (data) {
							if (data.results.length > 0) {
								resolve();
							} else {
								reject();
							}
						},
						error: function (error) {
							reject(error);
						}
					});
				}.bind(this)));

				Promise.all(aPromises).then(data => {
					resolve();
				}).catch(error => {
					reject(error);
				});
			}.bind(this));
		},

		sortButtonPressed: function (oEvent) {
			if (!this.SortDialog) {
				this.SortDialog = sap.ui.xmlfragment("com.sap.build.standard.brfAppDeGraosModoEditar.view.prospects.fragments.SortDialog",
					this);

				this.getView().addDependent(this.SortDialog);
			}

			this.SortDialog.openBy(oEvent.getSource());
		},

		filterButtonPressed: function (oEvent) {
			if (!this._FragmentFilter) {
				this._FragmentFilter = sap.ui.xmlfragment(
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.prospects.fragments.FragmentFilter",
					this);

				var oModelFilters = new sap.ui.model.json.JSONModel({
					HCP_CODE: "",
					NAME1: "",
					BLAND: "",
					HCP_CREATED_AT: ""
				});

				this.getView().setModel(oModelFilters, "filters");
				this.getView().addDependent(this._FragmentFilter);

			}

			this._FragmentFilter.openBy(oEvent.getSource());
		},
		
		_validateForm: function () {
			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;
				var oComposeFilterModel = this.getView().getModel("composeExFilterModel");

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required) {
						var sValue = oControl.getValue();
						if (!sValue || oControl.getValueState() !== 'None') {
							oComposeFilterModel.setProperty("/enableConfirm", false);
							return;
						}
					}
				}
				oComposeFilterModel.setProperty("/enableConfirm", true);
			}.bind(this), 100);
		},

		_validateStates: function (oEvent) {
			var oComposeFilterModel = this.getView().getModel("composeExFilterModel");
			var sSelectedKey = oEvent.getSource().getSelectedKey();
			var oRegionCB = this.getView().byId("regionCBId");
			var oData = oComposeFilterModel.getData();
			var oFilters = [];

			oFilters.push(new sap.ui.model.Filter("HCP_BLAND", sap.ui.model.FilterOperator.EQ, sSelectedKey));

			oRegionCB.getBinding("items").filter(oFilters);

			setTimeout(function () {
				if (oRegionCB.getItems().length > 0) {
					oComposeFilterModel.setProperty("/regionEnabled", true);
				} else {
					oComposeFilterModel.setProperty("/regionEnabled", false);
				}
			}.bind(this), 500);
			this._validateForm();
		},

		_getFormFields: function () {
			var oKeysForm = this.byId("locationform").getContent();
			var oCrop1Form = this.byId("cropkeysform1").getContent();
			var oCrop2Form = this.byId("cropkeysform2").getContent();

			var oMainDataForm = [];

			oMainDataForm = oMainDataForm.concat(oKeysForm).concat(oCrop1Form).concat(oCrop2Form);

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
		onKeyInfoChange: function (oEvent) {
			var oComposeFilterModel = this.getView().getModel("composeExFilterModel");
			var oSource = oEvent.getSource();
			var oName = oSource.getName();

			// Obtenha os valores das safras
			var cropYear1 = oComposeFilterModel.getProperty("/HCP_CROP_YEAR1");
			var cropYear2 = oComposeFilterModel.getProperty("/HCP_CROP_YEAR2");

			// Validação de que Safra 1 > Safra 2
			if (cropYear2 && cropYear1 && cropYear2 > cropYear1) {
				MessageBox.warning("A Safra 1 deve ser maior ou igual à Safra 2. Por favor, selecione novamente.");
				
				if (oName === "crop1") {
					oComposeFilterModel.setProperty("/HCP_CROP_YEAR1", "");
					this.getView().byId("cropYear1CBId").setSelectedKey("");
				} else if (oName === "crop2") {
					oComposeFilterModel.setProperty("/HCP_CROP_YEAR2", "");
					this.getView().byId("cropYear2CBId").setSelectedKey("");
				}
			}

			// Demais lógicas de validação que já estavam no método
			var oStateKey = oComposeFilterModel.getProperty("/HCP_STATE");
			var oRegionKey = oComposeFilterModel.getProperty("/HCP_REGION");
			var oMaterialKey = oComposeFilterModel.getProperty("/HCP_MATERIAL");
			var bEnableToLoadCropYear = oStateKey !== '' && oRegionKey !== '' && oMaterialKey !== '' ? true : false;

			if (oName === "state" || oName === "region" || oName === "material") {
				oComposeFilterModel.setProperty("/HCP_CROP_YEAR1", "");
				oComposeFilterModel.setProperty("/HCP_CROP_YEAR2", "");
				oComposeFilterModel.setProperty("/HCP_COMMERCIALIZATION1", "");
				oComposeFilterModel.setProperty("/HCP_COMMERCIALIZATION2", "");	
				oComposeFilterModel.setProperty("/HCP_PERIOD1", "");
				oComposeFilterModel.setProperty("/HCP_PERIOD2", "");
				this.getView().byId("CBCommercialization1").setSelectedKey("");
				this.getView().byId("CBCommercialization2").setSelectedKey("");
			}

			if (bEnableToLoadCropYear && (oName === "state" || oName === "region" || oName === "material")) {
				this.onKeyInfoFill();
			}

			if (oName === "crop1") {
				oComposeFilterModel.setProperty("/HCP_PERIOD1", "");
				oComposeFilterModel.setProperty("/HCP_COMMERCIALIZATION1", "");
				this.onCropYearChange(oEvent);
			}

			if (oName === "crop2") {
				oComposeFilterModel.setProperty("/HCP_PERIOD2", "");
				oComposeFilterModel.setProperty("/HCP_COMMERCIALIZATION2", "");	
				this.onCropYearChange(oEvent);
			}

			if (oName === "state") {
				this._validateStates(oEvent);
			}
			
			if (oName === "CBCommer1") {
				let sCommer1 = oEvent.getSource().getSelectedKey();
				oComposeFilterModel.setProperty("/HCP_COMMERCIALIZATION1", sCommer1);
			}
			
			if (oName === "CBCommer2") {
				let sCommer2 = oEvent.getSource().getSelectedKey();
				oComposeFilterModel.setProperty("/HCP_COMMERCIALIZATION2", sCommer2);
			}
			this._validateForm();
		},

		onKeyInfoFill: function () {
			var oComposeFilterModel = this.getView().getModel("composeExFilterModel");
			var oStateKey = oComposeFilterModel.getProperty("/HCP_STATE");
			var oRegionKey = oComposeFilterModel.getProperty("/HCP_REGION");
			var oMaterialKey = oComposeFilterModel.getProperty("/HCP_MATERIAL");
			var oCropYearKey1 = oComposeFilterModel.getProperty("/HCP_CROP_YEAR1");
			var oCropYearKey2 = oComposeFilterModel.getProperty("/HCP_CROP_YEAR2");
			var oCB1 = this.getView().byId("cropYear1CBId");
			var oCommercialization1 = this.getView().byId("CBCommercialization1");
			var oCommercialization2 = this.getView().byId("CBCommercialization2");
			var oCB2 = this.getView().byId("cropYear2CBId");
			var oFilter1 = [];
			var oFilter2 = [];
			var oCommerFilter1 = [];
			var oCommerFilter2 = [];
			
			oFilter1.push(new sap.ui.model.Filter("HCP_STATE", sap.ui.model.FilterOperator.EQ, oStateKey));
			oFilter1.push(new sap.ui.model.Filter("HCP_REGIO", sap.ui.model.FilterOperator.EQ, oRegionKey));
			oFilter1.push(new sap.ui.model.Filter("HCP_MATERIAL", sap.ui.model.FilterOperator.EQ, oMaterialKey));

			oFilter2.push(new sap.ui.model.Filter("HCP_STATE", sap.ui.model.FilterOperator.EQ, oStateKey));
			oFilter2.push(new sap.ui.model.Filter("HCP_REGIO", sap.ui.model.FilterOperator.EQ, oRegionKey));
			oFilter2.push(new sap.ui.model.Filter("HCP_MATERIAL", sap.ui.model.FilterOperator.EQ, oMaterialKey));
			
			if (oCropYearKey1 !== "") {
				oCommerFilter1.push(new sap.ui.model.Filter("HCP_STATE", sap.ui.model.FilterOperator.EQ, oStateKey));
				oCommerFilter1.push(new sap.ui.model.Filter("HCP_REGIO", sap.ui.model.FilterOperator.EQ, oRegionKey));
				oCommerFilter1.push(new sap.ui.model.Filter("HCP_MATERIAL", sap.ui.model.FilterOperator.EQ, oMaterialKey));
				oCommerFilter1.push(new sap.ui.model.Filter("HCP_CROP", sap.ui.model.FilterOperator.EQ, oCropYearKey1));
				
				oCommercialization1.getBinding("items").filter(oCommerFilter1);
			}
			
			if (oCropYearKey2 !== "") {
				oCommerFilter2.push(new sap.ui.model.Filter("HCP_STATE", sap.ui.model.FilterOperator.EQ, oStateKey));
				oCommerFilter2.push(new sap.ui.model.Filter("HCP_REGIO", sap.ui.model.FilterOperator.EQ, oRegionKey));
				oCommerFilter2.push(new sap.ui.model.Filter("HCP_MATERIAL", sap.ui.model.FilterOperator.EQ, oMaterialKey));
				oCommerFilter2.push(new sap.ui.model.Filter("HCP_CROP", sap.ui.model.FilterOperator.EQ, oCropYearKey2));
				
				oCommercialization2.getBinding("items").filter(oCommerFilter2);
			}
			
			if (oCB1 !== "") {
				oCB1.getBinding("items").filter(oFilter1);
			}
			if (oCB2 !== "") {
				oCB2.getBinding("items").filter(oFilter2);
			}
			

		}
	});
});