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

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.warehouseMap.New", {

		onInit: function () {
			var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
			var sLocale = sCurrentLocale.split("-");
			var oLocale = new sap.ui.core.Locale(sLocale[0], sLocale[1]);
			this.oNumberFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance(oLocale);

			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("warehouseMap.New").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.setBusyDialog(this.resourceBundle.getText("textWareHouseMap"), this.resourceBundle.getText("messageLoadingPleaseWait"));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				HCP_STORAGE_TYPE: [],
				enableCreate: false,
				yesProspect: false,
				yesPartner: true,
				enableRegion: false,
				enableCity: false,
				HCP_PARTNER_TYPE: "1",
				HCP_WAREHOUSE: "1",
				HCP_DISCHARGE_TYPE: "1",
				HCP_HAS_SCALES: "1",
				HCP_CAN_EXPAND_MATERIAL: "1",
				HCP_LATITUDE: 0,
				HCP_LONGITUDE: 0,
				hasScales: true,
				isLoad: false,
				cities: []
			}), "warehouseMapFormModel");

			var oModel = this.getOwnerComponent().getModel();
			oModel.attachRequestCompleted(function () {
				var oCreateModel = this.getView().getModel("warehouseMapFormModel");
				var isLoad = oCreateModel.getProperty("/isLoad");
				if (!isLoad) {
					oCreateModel.setProperty("/isLoad", true);
					this.closeBusyDialog();
				}
			}.bind(this));

			//var oModelOwner = this.getOwnerComponent().getModel();
			//oModelOwner.refresh(true);

			this.uniqueKey = this.generateUniqueKey();
			var oCreateModel = this.getView().getModel("warehouseMapFormModel");
			oCreateModel.setProperty("/HCP_UNIQUE_KEY", this.uniqueKey);

		},

		handleRouteMatched: function (oEvent) {

			var oCreateModel = this.getView().getModel("warehouseMapFormModel");
			var oData = oCreateModel.oData;
			if (oData.length <= 0) {
				this.getView().setModel(new sap.ui.model.json.JSONModel({
					HCP_STORAGE_TYPE: [],
					enableCreate: false,
					yesProspect: false,
					yesPartner: true,
					enableRegion: false,
					HCP_PARTNER_TYPE: "1",
					HCP_WAREHOUSE: "1",
					HCP_DISCHARGE_TYPE: "1",
					HCP_HAS_SCALES: "1",
					HCP_CAN_EXPAND_MATERIAL: "1",
					HCP_UNIQUE_KEY: '',
					HCP_LATITUDE: 0,
					HCP_LONGITUDE: 0
				}), "warehouseMapFormModel");
			}

			var oParameters = oEvent.getParameter("data");
			var oKeyData = JSON.parse(decodeURIComponent(oParameters.keyData));

			if (oKeyData.lat && oKeyData.long) {
				oCreateModel.setProperty("/HCP_LATITUDE", oKeyData.lat);
				oCreateModel.setProperty("/HCP_LONGITUDE", oKeyData.long);
				//	oData.HCP_LATITUDE = 123;
				//	oData.HCP_LONGITUDE = '123';
			}

			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			if (oKeyData.materialModel) {
				oCreateModel.setProperty("/materialModel", []);
				this.clearContainers("materialSimpleForm");
				this.createMaterials(oKeyData.materialModel);
			} else {
				this.clearContainers("materialSimpleForm");
				// this.insertMaterialDefault();
			}

			oCreateModel = this.getView().getModel("warehouseMapFormModel");
			oData = oCreateModel.oData;

			if (!oData.HCP_UNIQUE_KEY) {
				this.uniqueKey = this.generateUniqueKey();
				oCreateModel.setProperty("/HCP_UNIQUE_KEY", this.uniqueKey);
			}
			
			this.insertTemplateMaterial();

		},
		insertTemplateMaterial: function (oEvent) {
			var oButton = this.getView().byId("add-material");
			var oFormId = oButton.getCustomData()[0].getValue();
			var oForm = this.getView().byId(oFormId);
			var oCharTemplate;
			var oText;

			oCharTemplate = this.buildMaterialTemplateDefault();
			oForm.addContent(new sap.m.Label({
				text: ""
			}));
			oForm.addContent(oCharTemplate);
			this._validateForm();
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

		insertTemplateCenter: function () {

			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();

			oMainDataForm[51].addContent(new sap.m.Label({
				text: ""
			}));

			oMainDataForm[51].addContent(this.buildCenterTemplate());

		},

		_onInputPartnerFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("warehouseMapFormModel");
			var oInput = oEvent.getSource();
			var oData = oModel.oData;

			oModel.setProperty("/HCP_PARTNER", null);
			oModel.setProperty("/PROVIDER_DESC", null);

			if (oInput.getSelectedKey() == "1") { //Fornecedor
				oModel.setProperty("/yesPartner", true);
				oModel.setProperty("/yesProspect", false);
			} else { //Prospect
				oModel.setProperty("/yesProspect", true);
				oModel.setProperty("/yesPartner", false);
			}

			this._validateForm();
		},

		_valideInputNumber: function (oProperty) {
			
			//this._validateForm();
			var oCreateModel = this.getView().getModel("warehouseMapFormModel");
	

			var oSource = oProperty.getSource();
			var sValue;

			sValue = oProperty.mParameters.newValue;
			sValue = sValue.replace(/[^0-9,]/g, "");
			oSource.setValue(sValue);
			
			if (!sValue) {
				sValue = 0;
				oSource.setValue(sValue);
				oCreateModel.setProperty("/enableCreate", false);
			}else {
				this._validateForm();	
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

		_onAddNewCenterForm: function (oEvent) {
			var oButton = oEvent.getSource();
			var oFormId = oButton.getCustomData()[0].getValue();
			var oForm = this.getView().byId(oFormId);

			MessageBox.information(

				this.resourceBundle.getText("questionNewPlant"), {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					onClose: function (sAction) {
						if (sAction === "YES") {
							oForm.addContent(new sap.m.Label({
								text: ""
							}));
							oForm.addContent(this.buildCenterTemplate());
							this._validateForm();
						}
					}.bind(this)
				}
			);
		},

		lookForDuplicities: function (oSource, oData, oNumber) {

			var oForm = this.getView().byId("newCenterSimpleForm");
			var oItems = oForm.getContent().filter(content => content.getMetadata().getName() === "sap.m.VBox");

			var sLastValueCenter;
			var oValueCenter;

			sLastValueCenter = oSource._lastValue;

			if (oItems.length > 0) {
				for (var item of oItems) {
					var oFieldCenter = item.getItems()[0].getContent()[1];

					oValueCenter = oFieldCenter.getValue();

					if (oNumber > 1) {
						if (sLastValueCenter === oValueCenter) {
							oFieldCenter.setValueState("None");
							oFieldCenter.setValueStateText("");
						}
					} else {
						oFieldCenter.setValueState("None");
						oFieldCenter.setValueStateText("");
					}

				}
			}
		},

		onCancelPress: function (oEvent) {

			this.setBusyDialog("App Grãos", "Aguarde");
			var oEditModel = this.getView().getModel("warehouseMapFormModel");
			var oData = oEditModel.oData;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			if (oData.enableCreate) {
				MessageBox.warning(
					"Tem certeza que deseja voltar? As informações cadastradas não serão salvas!", {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {
								oEditModel.setProperty("/", []);
								this.navBack(oEvent);
								this.closeBusyDialog();
							} else {
								this.closeBusyDialog();
							}
						}.bind(this)
					}
				);
			} else {
				this.navBack(oEvent);
				this.closeBusyDialog();
			}

		},

		navBack: function (oEvent) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oModel = this.getView().getModel("warehouseMapFormModel");

			oModel.setProperty("/", []);

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("warehouseMap.Index", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},

		_validateForm: function (oEvent) {

			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;
				var oCreateModel = this.getView().getModel("warehouseMapFormModel");
				let aMaterialInputs = oCreateModel.oData.materialModel;

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
				if (typeof (aMaterialInputs) !== 'undefined') {

					for (var k = 0; k < aMaterialInputs.length; k++) {
						if (aMaterialInputs[k].status != "Deleted") {

							if (((typeof (aMaterialInputs[k].HCP_MATERIAL_STOCKED) === 'undefined') || (aMaterialInputs[k].HCP_CURRENT_STOCK === undefined) || (aMaterialInputs[k].HCP_CURRENT_STOCK === 0))) {
								oCreateModel.setProperty("/enableCreate", false);
								return;
							}
						}
					}
				}
				oCreateModel.setProperty("/enableCreate", true);
			}.bind(this), 100);
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

		_getFormFields: function () {
			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
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
			oRouter.navTo("warehouseMap.Index", true);
		},

		_handlePartnerFilterPress: function (oEvent) {
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
			var oModel = this.getView().getModel("warehouseMapFormModel");
			var oData = oModel.getProperty("/");
			var SelectedPartner = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

			oData["HCP_PARTNER"] = SelectedPartner.HCP_REGISTER;
			oData["PROVIDER_DESC"] = SelectedPartner.NAME1;
			// oPartnerInput.setDescription(SelectedPartner.NAME1);
			// this._validateForm();
			oModel.refresh();
			this.oPartnerFilter.destroy();

			this._validateForm();
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

		onSavePress: function (oEvent) {

			this.setBusyDialog(this.resourceBundle.getText("textWareHouseMap"), this.resourceBundle.getText("messageSaving"));
			var aUserName = this.userName;
			var sCounter = 0;
			var sTimestamp = new Date().getTime() + sCounter;
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var aDeferredGroups = oModel.getDeferredGroups();

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			var oCreateModelOffer = this.getView().getModel("warehouseMapFormModel");
			var oData = oCreateModelOffer.oData;
			var aEntitys = ["Warehouse_Map", "Warehouse_Material", "Warehouse_Storage_Type"];

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}

			this.period = this._getPeriod();

			var aData = {
				HCP_WAREHOUSE_ID: sTimestamp.toFixed(),
				HCP_PARTNER: oData.HCP_PARTNER,
				HCP_STORAGE_CAPACITY: oData.HCP_STORAGE_CAPACITY ? parseFloat(oData.HCP_STORAGE_CAPACITY).toFixed() : null,
				HCP_TONS_FLOW: oData.HCP_TONS_FLOW ? parseFloat(oData.HCP_TONS_FLOW).toFixed() : null,
				HCP_WORKING_HOURS: oData.HCP_WORKING_HOURS,
				HCP_EXPEDITION_CAPACITY: oData.HCP_EXPEDITION_CAPACITY ? parseFloat(oData.HCP_EXPEDITION_CAPACITY).toFixed() : null,
				HCP_EXPEDITION_CONDITION: oData.HCP_EXPEDITION_CONDITION,
				HCP_SCALE_SYZE: oData.HCP_SCALE_SYZE ? parseFloat(oData.HCP_SCALE_SYZE).toFixed() : null,
				HCP_WAREHOUSE_VISUAL_CONDITION: oData.HCP_WAREHOUSE_VISUAL_CONDITION,
				HCP_STORAGE_QUANTITY: oData.HCP_STORAGE_QUANTITY ? parseFloat(oData.HCP_STORAGE_QUANTITY).toFixed() : null,
				HCP_CAN_EXPAND_MATERIAL: oData.HCP_CAN_EXPAND_MATERIAL.toString(),
				HCP_PARTNER_TYPE: oData.HCP_PARTNER_TYPE.toString(),
				HCP_WAREHOUSE: oData.HCP_WAREHOUSE.toString(),
				HCP_DISCHARGE_TYPE: oData.HCP_DISCHARGE_TYPE.toString(),
				HCP_HAS_SCALES: oData.HCP_HAS_SCALES.toString(),
				HCP_STORAGE_TYPE: oData.HCP_STORAGE_TYPE.toString(),
				HCP_PERIOD: this.period,
				HCP_UNIQUE_KEY: oData.HCP_UNIQUE_KEY,
				HCP_STATE: oData.HCP_STATE,
				HCP_REGIO: oData.HCP_REGIO,
				HCP_CITY: oData.HCP_CITY,
				HCP_LATITUDE: oData.HCP_LATITUDE.toString(),
				HCP_LONGITUDE: oData.HCP_LONGITUDE.toString(),
				HCP_CREATED_BY: aUserName,
				HCP_UPDATED_BY: aUserName,
				HCP_CREATED_AT: new Date(),
				HCP_UPDATED_AT: new Date()
			};

			sCounter = sCounter + 1;

			oModel.createEntry("/Warehouse_Map", {
				properties: aData
			}, {
				groupId: "changes"
			});

			// Material
			if (oData.materialModel) {
				for (var i = 0; i < oData.materialModel.length; i++) {
					var sPlantingKey = new Date().getTime() + sCounter;
					sCounter = sCounter + 1;
	
					if (oData.materialModel[i].status === "New" && (oData.materialModel[i].HCP_CURRENT_STOCK || oData.materialModel[i].HCP_MATERIAL_STOCKED)) {
	
						var aDataMaterials = {
							HCP_WAREHOUSE_MAT_ID: sPlantingKey.toFixed(),
							HCP_UNIQUE_KEY: this.uniqueKey,
							HCP_PERIOD: this.period,
							HCP_MATERIAL_STOCKED: oData.materialModel[i].HCP_MATERIAL_STOCKED,
							HCP_CURRENT_STOCK: oData.materialModel[i].HCP_CURRENT_STOCK !== null && oData.materialModel[i].HCP_CURRENT_STOCK !== undefined ?
								parseFloat(oData.materialModel[i].HCP_CURRENT_STOCK).toFixed(
									2) : null,
							HCP_CREATED_BY: aUserName,
							HCP_UPDATED_BY: aUserName,
							HCP_CREATED_AT: new Date(),
							HCP_UPDATED_AT: new Date()
						};
	
						oModel.createEntry("/Warehouse_Material", {
							properties: aDataMaterials
						}, {
							groupId: "changes"
						});
					}
	
				}
			}

			//Tipo de armazenagem (multselect)
			for (var i = 0; i < oData.HCP_STORAGE_TYPE.length; i++) {
				var sToolsKey = new Date().getTime() + sCounter;
				sCounter = sCounter + 1;

				var aDataStorageType = {
					HCP_WAREHOUSE_STORAGE_TYPE_ID: sToolsKey.toFixed(),
					HCP_UNIQUE_KEY: this.uniqueKey,
					HCP_PERIOD: this.period,
					HCP_STORAGE_TYPE: oData.HCP_STORAGE_TYPE[i].toString(),
					HCP_CREATED_BY: aUserName,
					HCP_UPDATED_BY: aUserName,
					HCP_CREATED_AT: new Date(),
					HCP_UPDATED_AT: new Date()
				};

				oModel.createEntry("/Warehouse_Storage_Type", {
					properties: aDataStorageType
				}, {
					groupId: "changes"
				});
				sCounter = sCounter + 1;
			}

			oModel.submitChanges({
				groupId: "changes",
				success: function () {
					MessageBox.success(
						this.resourceBundle.getText("sucessWareHouseMap"), {
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (sAction) {
								oCreateModelOffer.setProperty("/", []);
								this.closeBusyDialog();
								this.backToIndex();
							}.bind(this)
						}
					);
				}.bind(this),
				error: function () {
					MessageBox.success(
						this.resourceBundle.getText("errorWareHouseMap"), {
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (sAction) {
								this.closeBusyDialog();
							}.bind(this)
						}
					);
				}.bind(this)
			});

		},
		_changeState: function (oEvent) {
			var oInput = oEvent.getSource();
			var oModel = this.getOwnerComponent().getModel();

			var oTable = this.getView().byId("region");
			var oFilters = [];

			var oFilterModel = this.getView().getModel("warehouseMapFormModel");
			oFilterModel.setProperty("/HCP_REGIO", null);
			oFilterModel.setProperty("/enableRegion", false);

			if (oInput.getSelectedKey() !== '') {
				oFilters.push(new sap.ui.model.Filter("HCP_BLAND", sap.ui.model.FilterOperator.Contains, oInput.getSelectedKey()));
				oFilters.push(new sap.ui.model.Filter("HCP_ACTIVE", sap.ui.model.FilterOperator.EQ, '1'));
				
				oModel.read("/Regions", {
					filters: oFilters,
					success: function (oData) {
						if (oData.results.length > 0) {
							oTable.getBinding("items").filter(oFilters);
							oFilterModel.setProperty("/enableRegion", true);
							oFilterModel.setProperty("/HCP_REGIO", null);
						} else {
							oFilterModel.setProperty("/enableRegion", false);
							oFilterModel.setProperty("/HCP_REGIO", null);
						}

						this.getCities(oInput.getSelectedKey());

					}.bind(this),
					error: function () {
						MessageBox.error("Error");
					}
				});
			}

			this._validateForm();
		},
		insertMaterialDefault: function () {

			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var oCharTemplate;

			oCharTemplate = this.buildMaterialTemplate();

			oMainDataForm[21].addContent(new sap.m.Label({
				text: ""
			}));

			oMainDataForm[21].addContent(oCharTemplate);

		},
		buildMaterialTemplate: function (oEvent) {

			var oVisitFormModel = this.getView().getModel("warehouseMapFormModel");
			var sChars = oVisitFormModel.getProperty("/materialModel");
			var aCustomData = [];
			var oEnableCancel = true;

			if (!sChars) {
				oVisitFormModel.setProperty("/materialModel", []);
			}

			var sCharLength = oVisitFormModel.getProperty("/materialModel").length;
			oVisitFormModel.setProperty("/materialModel/" + sCharLength, {});
			oVisitFormModel.setProperty("/materialModel/" + sCharLength + "/status", "New");

			if (sCharLength === 0) {
				oEnableCancel = false;
			}

			aCustomData.push(new sap.ui.core.CustomData({
				key: "sPath",
				value: "/materialModel/" + sCharLength
			}));

			aCustomData.push(new sap.ui.core.CustomData({
				key: "name",
				value: "materialModel"
			}));

			var oItemTemplateMaterial = new sap.ui.core.ListItem({
				key: "{MATNR}",
				text: "{= parseFloat(${MATNR}) } - {MAKTX}"
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
								text: "Material Estocado",
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),
							new CustomComboBox({
								showSecondaryValues: true,
								selectedKey: "{warehouseMapFormModel>/materialModel/" + sCharLength + "/HCP_MATERIAL_STOCKED}",
								placeholder: "Selecione Material Estocado",
								editable: true,
								enabled: true,
								visible: true,
								required: true,
								width: "100%",
								maxWidth: '100%',
								selectionChange: this._validateForm.bind(this),
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
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true,
								text: "Estoque Atual (T)"
							}),
							new sap.m.Input({
								value: "{ path: 'warehouseMapFormModel>/materialModel/" + sCharLength +
									"/HCP_CURRENT_STOCK' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_CURRENT_STOCK",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{warehouseMapFormModel>/materialModel/" + sCharLength + "/idHectaresArea}",
								placeholder: "Digite o Estoque Atual em Toneladas",
								// liveChange: this._valideInputNumber.bind(this),
								change: this._valideInputNumber.bind(this),
								liveChange: this._valideInputNumber.bind(this)

							})
						]
					})
				]
			});

			if (sCharLength >= 0) {
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
		buildMaterialTemplateDefault: function (oEvent) {

			var oVisitFormModel = this.getView().getModel("warehouseMapFormModel");
			var sChars = oVisitFormModel.getProperty("/materialModel");
			var aCustomData = [];
			var oEnableCancel = true;

			if (!sChars) {
				oVisitFormModel.setProperty("/materialModel", []);
			}

			var sCharLength = oVisitFormModel.getProperty("/materialModel").length;
			oVisitFormModel.setProperty("/materialModel/" + sCharLength, {});
			oVisitFormModel.setProperty("/materialModel/" + sCharLength + "/status", "New");

			if (sCharLength === 0) {
				oEnableCancel = false;
			}

			aCustomData.push(new sap.ui.core.CustomData({
				key: "sPath",
				value: "/materialModel/" + sCharLength
			}));

			aCustomData.push(new sap.ui.core.CustomData({
				key: "name",
				value: "materialModel"
			}));

			var oItemTemplateMaterial = new sap.ui.core.ListItem({
				key: "{MATNR}",
				text: "{= parseFloat(${MATNR}) } - {MAKTX}"
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
								text: "Material Estocado",
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true
							}),
							new CustomComboBox({
								showSecondaryValues: true,
								selectedKey: "{warehouseMapFormModel>/materialModel/" + sCharLength + "/HCP_MATERIAL_STOCKED}",
								placeholder: "Selecione Material Estocado",
								editable: true,
								enabled: true,
								visible: true,
								required: true,
								width: "100%",
								maxWidth: '100%',
								selectionChange: this._validateForm.bind(this),
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
								design: "Standard",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: true,
								text: "Estoque Atual (T)"
							}),
							new sap.m.Input({
								value: "{ path: 'warehouseMapFormModel>/materialModel/" + sCharLength +
									"/HCP_CURRENT_STOCK' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_CURRENT_STOCK",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{warehouseMapFormModel>/materialModel/" + sCharLength + "/idHectaresArea}",
								placeholder: "Digite o Estoque Atual em Toneladas",
								// liveChange: this._valideInputNumber.bind(this),
								change: this._valideInputNumber.bind(this),
								liveChange: this._valideInputNumber.bind(this)

							})
						]
					})
				]
			});

			return oTemplate;

		},
		removeNewForm: function (oEvent) {
			var oWareHouseModel = this.getView().getModel("warehouseMapFormModel");
			var oVBox = oEvent.getSource().getParent().getParent().getParent().getParent().getParent();
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var sMessage = "Tem certeza que deseja remover o Material?";

			MessageBox.warning(
				sMessage, {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						if (sAction === "YES") {
							if (oVBox) {
								var sPath = oVBox.getCustomData()[0].getValue();
								var oData = oWareHouseModel.getProperty(sPath);

								oData.status = "Deleted";
								oVBox.destroy();
							}
						}
					}.bind(this)
				}
			);

		},
		_onAddNewForm: function (oEvent) {
			var oButton = oEvent.getSource();
			var oFormId = oButton.getCustomData()[0].getValue();
			var oForm = this.getView().byId(oFormId);
			var oCharTemplate;
			var oText;

			oText = "Deseja adicionar um novo material?";
			oCharTemplate = this.buildMaterialTemplate();

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
		_validateStorageTypeInputs: function () {
			/*
						var oWareHouseModel = this.getView().getModel("warehouseMapFormModel");
						var oData = oWareHouseModel.oData;
						var oOthers = oData.HCP_OTHERS_TOOLS;

						oWareHouseModel.setProperty("/yesOthersTools", false);
						oWareHouseModel.setProperty("/HCP_OTHERS_TOOLS", null);

						for (var i = 0; i < oData.HCP_STORAGE_TYPE.length; i++) {

							if (oData.HCP_STORAGE_TYPE[i] === '8') {
								oWareHouseModel.setProperty("/yesOthersTools", true);
								oWareHouseModel.setProperty("/HCP_OTHERS_TOOLS", oOthers);
								// return;
								// } else {
								// 	oModelPeriodic.setProperty("/yesOthersTools", false);
							}
						}
						
						*/

			this._validateForm();

		},
		onPictureIconPress: function () {
			var oCreateModel = this.getView().getModel("warehouseMapFormModel");
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				oCreateModel.setProperty("/repositoryCreated", true);
				this.goToImages(oCreateModel.oData);
			} else {
				sap.m.MessageToast.show("Para acessar as imagens é necessário conexão com a internet");
			}
		},
		goToImages: function (okeyData) {
			this.oRouter.navTo("warehouseMap.Images", {
				keyData: encodeURIComponent(JSON.stringify(okeyData)),
				operation: "Create"
			}, false);
		},
		onMapIconPress: function () {
			var oCreateModel = this.getView().getModel("warehouseMapFormModel");
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			this.oRouter.navTo("warehouseMap.Map", {
				keyData: encodeURIComponent(JSON.stringify(oCreateModel.oData)),
				operation: "Create"
			}, false);
		},
		createMaterials: function (aResults) {

			var oCreateModel = this.getView().getModel("warehouseMapFormModel");
			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();

			for (var i = 0; i < aResults.length; i++) {

				var oCharTemplate;

				if (aResults[i].status != 'Deleted') {
					oCharTemplate = this.buildMaterialTemplate();

					oMainDataForm[21].addContent(new sap.m.Label({
						text: ""
					}));

					oMainDataForm[21].addContent(oCharTemplate);

					oCreateModel.setProperty("/materialModel/" + i + "/status", "New");
					oCreateModel.setProperty("/materialModel/" + i + "/HCP_WAREHOUSE_MAT_ID", aResults[i].HCP_WAREHOUSE_MAT_ID);
					oCreateModel.setProperty("/materialModel/" + i + "/HCP_MATERIAL_STOCKED", aResults[i].HCP_MATERIAL_STOCKED);
					oCreateModel.setProperty("/materialModel/" + i + "/HCP_CURRENT_STOCK", aResults[i].HCP_CURRENT_STOCK);

					if (aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
						oCreateModel.setProperty("/cultureType/" + i + "/@com.sap.vocabularies.Offline.v1.isLocal", true);
						oCreateModel.setProperty("/cultureType/" + i + "/__metadata", aResults[i].__metadata);
					}
				}

			}

			oCreateModel.refresh();
		},
		_validateScales: function () {

			var oCreateModel = this.getView().getModel("warehouseMapFormModel");
			var oData = oCreateModel.getProperty("/");

			//cif
			if (oData.HCP_HAS_SCALES == 1) {
				oCreateModel.setProperty("/hasScales", true);
			} else {
				oCreateModel.setProperty("/hasScales", false);
				oCreateModel.setProperty("/HCP_SCALE_SYZE", null);

			}

			this._validateForm();
		},
		
		//melhorias
		
		getCities: function(regiao){
			
		
			var oModel = this.getOwnerComponent().getModel();
			var oFilterModel = this.getView().getModel("warehouseMapFormModel");
			var filterCity = [];
			filterCity.push(new sap.ui.model.Filter("TAXJURCODE", sap.ui.model.FilterOperator.Contains, regiao));
			filterCity.push(new sap.ui.model.Filter("COUNTRY", sap.ui.model.FilterOperator.Contains, "BR"));

			//aqui//
			oModel.read("/View_City", {
				filters: filterCity,
				success: function (oData) {
					oFilterModel.setProperty("/cities", oData.results);
					oFilterModel.setProperty("/enableCity", true);
				}.bind(this),
				error: function () {
					MessageBox.error("Error");
				}
			});
		}

	});
}, /* bExport= */ true);