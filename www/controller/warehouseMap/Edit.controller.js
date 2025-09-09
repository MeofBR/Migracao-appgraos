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

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.warehouseMap.Edit", {

		onInit: function () {

			var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
			var sLocale = sCurrentLocale.split("-");
			var oLocale = new sap.ui.core.Locale(sLocale[0], sLocale[1]);
			this.oNumberFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance(oLocale);

			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("warehouseMap.Edit").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());

			this.setBusyDialog(this.resourceBundle.getText("textWareHouseMap"), this.resourceBundle.getText("messageLoadingPleaseWait"));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				HCP_STORAGE_TYPE: [],
				enableCreate: false,
				yesProspect: false,
				yesPartner: true,
				enableRegion: false,
				enableCity: false,
				edited: false,
				HCP_PARTNER_TYPE: "1",
				HCP_WAREHOUSE: "1",
				HCP_DISCHARGE_TYPE: "1",
				HCP_HAS_SCALES: "1",
				HCP_CAN_EXPAND_MATERIAL: "1",
				HCP_LATITUDE: 0,
				HCP_LONGITUDE: 0,
				hasScales: false,
				isLoad: false
			}), "warehouseMapEditModel");

			var oModel = this.getOwnerComponent().getModel();
			oModel.attachRequestCompleted(function () {
				var oEditModel = this.getView().getModel("warehouseMapEditModel");
				var isLoad = oEditModel.getProperty("/isLoad");
				if (!isLoad) {
					oEditModel.setProperty("/isLoad", true);
					this.closeBusyDialog();
				}
			}.bind(this));
			
			this._validateForm();

			//var oModelOwner = this.getOwnerComponent().getModel();
			//oModelOwner.refresh(true);

		},

		handleRouteMatched: function (oEvent) {
			
			var oModel = this.getView().getModel();
			oModel.refresh(true);
			var oData;
			var suppliersName;
			var param;
			var oEditModel = this.getView().getModel("warehouseMapEditModel");

			if (oEvent.getParameter("data")) {
				var sPathKeyData = oEvent.getParameter("data").keyData;

				var isJson = this.isJson(decodeURIComponent(sPathKeyData));
				if (isJson) {
					oData = JSON.parse(decodeURIComponent(sPathKeyData));
				} else {
					param = decodeURIComponent(sPathKeyData).split(',');

					oData = oModel.getProperty(param[0]);
					suppliersName = param[1];

				}
				
				oEditModel.setProperty("/", oData);
				
				
				if(!suppliersName){
					oEditModel.setProperty("/PROVIDER_DESC", oData.PROVIDER_DESC);
				}else{
					oEditModel.setProperty("/PROVIDER_DESC", suppliersName);
				}
			

				this.uniqueKey = oData.HCP_UNIQUE_KEY;
				this.period = oData.HCP_PERIOD;

				if (oData.HCP_PARTNER_TYPE === '1') {
					oEditModel.setProperty("/noPartner", false);
					oEditModel.setProperty("/yesPartner", true);
					oEditModel.setProperty("/yesProspect", false);
				} else {
					oEditModel.setProperty("/noPartner", true);
					oEditModel.setProperty("/yesPartner", false);
				}

				if (oData.HCP_HAS_SCALES == 1) {
					oEditModel.setProperty("/hasScales", true);
				} else {
					oEditModel.setProperty("/hasScales", false);
					oEditModel.setProperty("/HCP_SCALE_SYZE", null);

				}
				
				if(oData.HCP_CITY){
					oEditModel.setProperty("/HCP_CITY", oData.HCP_CITY);
				}

				if (oData.HCP_STATE) {

					var oTable = this.getView().byId("region");
					var oFilters = [];

					oFilters.push(new sap.ui.model.Filter("HCP_BLAND", sap.ui.model.FilterOperator.Contains, oData.HCP_STATE));
					oTable.getBinding("items").filter(oFilters);

					oEditModel.setProperty("/enableRegion", true);
					oEditModel.setProperty("/isLoad", false);

					this.getCities(oData.HCP_STATE);

				} else {
					oEditModel.setProperty("/enableRegion", false);
				}

			}
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			//this.setBusyDialog(this.resourceBundle.getText("textWareHouseMap"), this.resourceBundle.getText("messageLoadingWarehouseMap"));

			this.clearContainers("materialSimpleForm");
			this.searchMaterial();

			if (oData.HCP_STORAGE_TYPE) {
				this.searchValuesStorageTypes(oModel, false);
			}
			

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

			var oModel = this.getView().getModel("warehouseMapEditModel");
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

			var oSource = oProperty.getSource();
			var sValue;
			var oModel = this.getView().getModel("warehouseMapEditModel");

			sValue = oProperty.mParameters.newValue;
			sValue = sValue.replace(/[^0-9,]/g, "");

			if (!sValue) {
				sValue = "";
			}

			oSource.setValue(sValue);
			
			if (sValue == ""){
			oCreateModel.setProperty("/enableCreate", false);
			} else {
				this._validateForm();	
			}
		},

		_valideInputNumberDynamic: function (oProperty) {

			var oSource = oProperty.getSource();
			var sValue;
			var oModel = this.getView().getModel("warehouseMapEditModel");

			sValue = oProperty.mParameters.newValue;
			sValue = sValue.replace(/[^0-9,]/g, "");

			if (!sValue) {
				sValue = 0;
			}

			oSource.setValue(sValue);

			this._validateForm();
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
			var oEditModel = this.getView().getModel("warehouseMapEditModel");
			var oData = oEditModel.oData;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			if (oData.edited) {
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
			var oModel = this.getView().getModel("warehouseMapEditModel");

			oModel.setProperty("/", []);

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("warehouseMap.List", oBindingContext, fnResolve, "");
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
				var oEditModel = this.getView().getModel("warehouseMapEditModel");
				let aMaterialInputs = oEditModel.oData.materialModel;

				oEditModel.setProperty("/enableCreate", true);
				oEditModel.setProperty("/edited", true);

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required) {
						var sValue = oControl.getValue();
						if (!sValue || oControl.getValueState() !== 'None') {
							oEditModel.setProperty("/enableCreate", false);
							return;
						}
					}
				}
				if (typeof (aMaterialInputs) !== 'undefined') {

				for (var k = 0; k < aMaterialInputs.length; k++) {
					if (aMaterialInputs[k].status != "Deleted") {

						if (((typeof (aMaterialInputs[k].HCP_MATERIAL_STOCKED) === 'undefined') || (aMaterialInputs[k].HCP_CURRENT_STOCK === undefined) || (aMaterialInputs[k].HCP_CURRENT_STOCK === 0))) {
							oEditModel.setProperty("/enableCreate", false);
							return;
						}
					}
				}
				}
				oEditModel.setProperty("/enableCreate", true);
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
			var oModel = this.getView().getModel("warehouseMapEditModel");
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

			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var oGroupRemoves;
			var oEditModelOffer = this.getView().getModel("warehouseMapEditModel");
			var oData = oEditModelOffer.oData;

			this.setBusyDialog(this.resourceBundle.getText("textWareHouseMap"), this.resourceBundle.getText("messageSaving"));

			this.searchValuesStorageTypes(oModel, true).then(function () {
				oGroupRemoves = oData.groupRemoves;

				if (oGroupRemoves) {
					oModel.submitChanges({
						groupId: "removes",
						success: function () {
							this.onSubmitChanges();
						}.bind(this),
						error: function () {
							console.log("Error");
						}.bind(this)
					});
				} else {
					this.onSubmitChanges();
				}

			}.bind(this)).catch(function () {
				console.log("error");
			}.bind(this));

		},
		onSubmitChanges: function () {

			var aUserName = this.userName;
			var sCounter = 0;
			var sPath;
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var aDeferredGroups = oModel.getDeferredGroups();

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			var oEditModelOffer = this.getView().getModel("warehouseMapEditModel");
			var oData = oEditModelOffer.oData;
			var aEntitys = ["Warehouse_Map", "Warehouse_Material", "Warehouse_Storage_Type"];

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}

			this.period = this._getPeriod();

			var aData = {
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
				HCP_STATE: oData.HCP_STATE,
				HCP_REGIO: oData.HCP_REGIO,
				HCP_CITY: oData.HCP_CITY,
				HCP_LATITUDE: oData.HCP_LATITUDE.toString(),
				HCP_LONGITUDE: oData.HCP_LONGITUDE.toString(),
				HCP_UPDATED_BY: aUserName,
				HCP_UPDATED_AT: new Date()
			};

			sPath = this.buildEntityPath("Warehouse_Map", oData);

			sCounter = sCounter + 1;
			oModel.update(sPath, aData, {
				groupId: "changes"
			});

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

				if (this.period !== oData.HCP_PERIOD) {

					aDataStorageType.HCP_PERIOD = this.period;
					aDataStorageType.HCP_CREATED_BY = aUserName;
					aDataStorageType.HCP_UPDATED_BY = aUserName;
					aDataStorageType.HCP_CREATED_AT = new Date();
					aDataStorageType.HCP_UPDATED_AT = new Date();

				}

				oModel.createEntry("/Warehouse_Storage_Type", {
					properties: aDataStorageType
				}, {
					groupId: "changes"
				});
				sCounter = sCounter + 1;
			}
			
			// Material
			if (oData.materialModel.length > 0) {
				for (var i = 0; i < oData.materialModel.length; i++) {
					var sPlantingKey = new Date().getTime() + sCounter;
					sCounter = sCounter + 1;
	
					var aDataMaterials = {
						HCP_UNIQUE_KEY: this.uniqueKey,
						HCP_PERIOD: this.period,
						HCP_MATERIAL_STOCKED: oData.materialModel[i].HCP_MATERIAL_STOCKED,
						HCP_CURRENT_STOCK: oData.materialModel[i].HCP_CURRENT_STOCK == null || oData.materialModel[i].HCP_CURRENT_STOCK == 0 ? null : parseFloat(
							oData.materialModel[i].HCP_CURRENT_STOCK).toFixed(
							2),
						HCP_WAREHOUSE_MAT_ID: oData.materialModel[i].HCP_WAREHOUSE_MAT_ID,
						HCP_CREATED_BY: aUserName,
						HCP_UPDATED_BY: aUserName,
						HCP_CREATED_AT: new Date(),
						HCP_UPDATED_AT: new Date()
					};
	
					var sMaterialPath = this.buildEntityPathMat("Warehouse_Material", oData.materialModel[i]);
	
					if (oData.materialModel[i].status === "New" && (aDataMaterials.HCP_CURRENT_STOCK || aDataMaterials.HCP_MATERIAL_STOCKED)) {
	
						aDataMaterials["HCP_WAREHOUSE_MAT_ID"] = sPlantingKey.toFixed(),
	
							oModel.createEntry("/Warehouse_Material", {
								properties: aDataMaterials
							}, {
								groupId: "changes"
							});
					} else if (oData.materialModel[i].status === "Edit" && (aDataMaterials.HCP_CURRENT_STOCK || aDataMaterials.HCP_MATERIAL_STOCKED)) {
	
						oModel.update(sMaterialPath, aDataMaterials, {
							groupId: "changes"
						});
					} else if (oData.materialModel[i].status === "Edit" && ((aDataMaterials.HCP_CURRENT_STOCK == null || aDataMaterials.HCP_CURRENT_STOCK ==
							"") && (aDataMaterials.HCP_MATERIAL_STOCKED == null || aDataMaterials.HCP_MATERIAL_STOCKED == ""))) {
	
						oModel.update(sMaterialPath, {
							groupId: "changes"
						});
					} else if (oData.materialModel[i].status === "Deleted") {
						if(oData.materialModel[i].HCP_WAREHOUSE_MAT_ID){
								oModel.remove(sMaterialPath, {
							groupId: "changes"
						});
						}
					}

				}
			}
			

			oModel.submitChanges({
				groupId: "changes",
				success: function () {
					MessageBox.success(
						this.resourceBundle.getText("sucessWareHouseMap"), {
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

			var oFilterModel = this.getView().getModel("warehouseMapEditModel");
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
		insertMaterialDefault: function (isInitial) {

			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var oCharTemplate;

			oCharTemplate = this.buildMaterialTemplate(isInitial);

			oMainDataForm[21].addContent(new sap.m.Label({
				text: ""
			}));

			oMainDataForm[21].addContent(oCharTemplate);

		},
		buildMaterialTemplate: function (isInitial) {

			var oVisitFormModel = this.getView().getModel("warehouseMapEditModel");
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
								selectedKey: "{warehouseMapEditModel>/materialModel/" + sCharLength + "/HCP_MATERIAL_STOCKED}",
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
								value: "{ path: 'warehouseMapEditModel>/materialModel/" + sCharLength +
									"/HCP_CURRENT_STOCK' , type: 'sap.ui.model.type.Float', formatOptions: { groupingEnabled: true, groupingSeparator: '.', decimalSeparator: ',', maxFractionDigits: 2 }}",
								type: "Tel",
								design: "Standard",
								name: "HCP_CURRENT_STOCK",
								width: "100%",
								required: true,
								textAlign: "Begin",
								textDirection: "Inherit",
								visible: "{warehouseMapEditModel>/materialModel/" + sCharLength + "/idHectaresArea}",
								placeholder: "Digite o Estoque Atual em Toneladas",
								// liveChange: this._valideInputNumber.bind(this),
								change: this._valideInputNumberDynamic.bind(this),
								liveChange: this._valideInputNumberDynamic.bind(this)
							})
						]
					})
				]
			});

			if(!isInitial){
				if (sCharLength >= 0 ) {
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
			}
			return oTemplate;

		},
		removeNewForm: function (oEvent) {
			var oWareHouseModel = this.getView().getModel("warehouseMapEditModel");
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

								oWareHouseModel.setProperty("/edited", true);
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
						var oWareHouseModel = this.getView().getModel("warehouseMapEditModel");
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
			var oEditModel = this.getView().getModel("warehouseMapEditModel");
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				oEditModel.setProperty("/repositoryCreated", true);
				this.goToImages(oEditModel.oData);
			} else {
				sap.m.MessageToast.show("Para acessar as imagens é necessário conexão com a internet");
			}
		},
		goToImages: function (okeyData) {

			var oEditModel = this.getView().getModel("warehouseMapEditModel");
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var oData = oEditModel.oData;
			oData.isEdit = true;

			this.oRouter.navTo("warehouseMap.Images", {
				keyData: encodeURIComponent(JSON.stringify(okeyData)),
				operation: "Create"
			}, false);
		},
		onMapIconPress: function () {
			var oEditModel = this.getView().getModel("warehouseMapEditModel");
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var oData = oEditModel.oData;
			oData.isEdit = true;


			console.log(oEditModel);
			this.oRouter.navTo("warehouseMap.Map", {
				keyData: encodeURIComponent(JSON.stringify(oEditModel.oData)),
				operation: "Create"
			}, false);
		},

		searchMaterial: function () {

			var oModelVisit = this.getView().getModel();
			var oEditModel = this.getView().getModel("warehouseMapEditModel");
			var oData = oEditModel.oData;
			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var oCharTemplate;
			var aFilters = [];

			oEditModel.setProperty("/materialModel", []);

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

			oModelVisit.read("/Warehouse_Material", {

				filters: aFilters,
				success: function (results) {

					var aResults = results.results;
					var oNegotiationInputs = [];
					
					if(aResults.length > 0){
							for (var i = 0; i < aResults.length; i++) {

						var oCharTemplate;
						if(aResults.length == 1){
							oCharTemplate = this.buildMaterialTemplate(true);
						}else{
							oCharTemplate = this.buildMaterialTemplate();
						}
						
						console.log(oMainDataForm[21]);

						oMainDataForm[21].addContent(new sap.m.Label({
							text: ""
						}));

						oMainDataForm[21].addContent(oCharTemplate);

						oEditModel.setProperty("/materialModel/" + i + "/status", "Edit");
						oEditModel.setProperty("/materialModel/" + i + "/HCP_WAREHOUSE_MAT_ID", aResults[i].HCP_WAREHOUSE_MAT_ID);
						oEditModel.setProperty("/materialModel/" + i + "/HCP_MATERIAL_STOCKED", aResults[i].HCP_MATERIAL_STOCKED);
						oEditModel.setProperty("/materialModel/" + i + "/HCP_CURRENT_STOCK", aResults[i].HCP_CURRENT_STOCK);

						if (aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
							oEditModel.setProperty("/materialModel/" + i + "/@com.sap.vocabularies.Offline.v1.isLocal", true);
							oEditModel.setProperty("/materialModel/" + i + "/__metadata", aResults[i].__metadata);
						}

					}

					}else{
						this.insertMaterialDefault(true);
					}

				
					// if (oEditModel.getProperty("/materialModel").length == 0) {
					// 	this.insertMaterialDefault();
					// }

					oEditModel.refresh();

				}.bind(this),
				error: function (error) {

				}
			});

		},
		buildEntityPath: function (sEntityName, oEntity) {
			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity.HCP_WAREHOUSE_ID + "l)";
			}
		},
		buildEntityPathMat: function (sEntityName, oEntity) {
			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity.HCP_WAREHOUSE_MAT_ID + "l)";
			}
		},
		
		buildEntityPathMatNew: function (sEntityName, oEntity) {
			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity.HCP_MATERIAL_STOCKED + "l)";
			}
		},
		buildEntityPathStorage: function (sEntityName, oEntity) {
			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity.HCP_WAREHOUSE_STORAGE_TYPE_ID + "l)";
			}
		},

		searchValuesStorageTypes: function (oModel, oRemove) {
			return new Promise(function (resolve, reject) {
				var oModelVisit = this.getView().getModel();
				var oEditModel = this.getView().getModel("warehouseMapEditModel");
				var oData = oEditModel.oData;
				var aFilters = [];
				var aDeferredGroups = oModel.getDeferredGroups();

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

				if (!oRemove) {
					oEditModel.setProperty("/HCP_STORAGE_TYPE", []);

				} else {

					if (aDeferredGroups.indexOf("removes") < 0) {
						aDeferredGroups.push("removes");
						oModel.setDeferredGroups(aDeferredGroups);
					}

				}

				oModelVisit.read("/Warehouse_Storage_Type", {
					filters: aFilters,
					success: function (results) {
						var aResults = results.results;

						var oStorageTypes = [];

						for (var i = 0; i < aResults.length; i++) {

							if (!oRemove) {

								oStorageTypes.push(aResults[i].HCP_STORAGE_TYPE);

							} else if (this.period === aResults[i].HCP_PERIOD) {

								// var sPath = "/Visit_Form_Certifications(" + aResults[i].HCP_VISIT_ID + "l)";
								var sPath = this.buildEntityPathStorage("Warehouse_Storage_Type", aResults[i]);
								oModel.remove(sPath, {
									groupId: "removes"
								});
								oEditModel.setProperty("/groupRemoves", true);
							}
						}
						if (!oRemove) {
							oEditModel.setProperty("/HCP_STORAGE_TYPE", oStorageTypes);
						}
						resolve();
					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});
			}.bind(this));
		},
		_validateScales: function () {

			var oEditModel = this.getView().getModel("warehouseMapEditModel");
			var oData = oEditModel.getProperty("/");

			//cif
			if (oData.HCP_HAS_SCALES == 1) {
				oEditModel.setProperty("/hasScales", true);
			} else {
				oEditModel.setProperty("/hasScales", false);
				oEditModel.setProperty("/HCP_SCALE_SYZE", null);

			}

			this._validateForm();
		},

		isJson: function (item) {
			item = typeof item !== "string" ? JSON.stringify(item) : item;

			try {
				item = JSON.parse(item);
			} catch (e) {
				return false;
			}

			if (typeof item === "object" && item !== null) {
				return true;
			}

			return false;
		},
		createMaterials: function (aResults) {

			var oEditModel = this.getView().getModel("warehouseMapEditModel");
			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			oEditModel.setProperty("/materialModel", []);

			for (var i = 0; i < aResults.length; i++) {

				var oCharTemplate;

				if (aResults[i].status != 'Deleted') {
					oCharTemplate = this.buildMaterialTemplate();

					oMainDataForm[21].addContent(new sap.m.Label({
						text: ""
					}));

					oMainDataForm[21].addContent(oCharTemplate);

					oEditModel.setProperty("/materialModel/" + i + "/status", aResults[i].status);
					oEditModel.setProperty("/materialModel/" + i + "/HCP_WAREHOUSE_MAT_ID", aResults[i].HCP_WAREHOUSE_MAT_ID);
					oEditModel.setProperty("/materialModel/" + i + "/HCP_MATERIAL_STOCKED", aResults[i].HCP_MATERIAL_STOCKED);
					oEditModel.setProperty("/materialModel/" + i + "/HCP_CURRENT_STOCK", aResults[i].HCP_CURRENT_STOCK);
					oEditModel.setProperty("/materialModel/" + i + "/HCP_UNIQUE_KEY", oEditModel.oData.HCP_UNIQUE_KEY);
					

					if (aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
						oEditModel.setProperty("/materialModel/" + i + "/@com.sap.vocabularies.Offline.v1.isLocal", true);
						oEditModel.setProperty("/materialModel/" + i + "/__metadata", aResults[i].__metadata);
					}
				}

			}

			oEditModel.refresh();
		},
		
		//melhorias
		
		getCities: function(regiao){
			
		
			var oModel = this.getOwnerComponent().getModel();
			var oFilterModel = this.getView().getModel("warehouseMapEditModel");
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