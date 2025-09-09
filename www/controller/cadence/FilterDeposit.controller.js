sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.cadence.FilterDeposit", {
		formatter: formatter,
		onInit: function () {

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("cadence.FilterDeposit").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "indexModel");
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		handleRouteMatched: function () {
		

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if (bIsMobile) {
				this.getView().getModel("indexModel").setProperty("/isMobile", true);
			} else {
				this.getView().getModel("indexModel").setProperty("/isMobile", false);
			}
			
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				yesSequence: true,
				enableFilter: false
			}), "cadenceFormModel");
			
			this.getUser().then(function (userName) {
				this.userName = userName;
				this.checkUserInfo(this.userName).then(function (userArray) {

					if (userArray.WERKS_D) {
						this.getView().getModel("cadenceFormModel").setProperty("/HCP_WERKS", userArray.WERKS_D);
					}

				}.bind(this));
			}.bind(this));

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
		
		_numberFormat : function(number, width) {
		    return new Array(+width + 1 - (number + '').length).join('0') + number;
		},
		_onFilterPress: function (oEvent) {

			this.setBusyDialog(this.resourceBundle.getText("textGrainApp"), this.resourceBundle.getText("textWait"));
			var oBindingContext = oEvent.getSource().getBindingContext();
			var oFilterModel = this.getView().getModel("cadenceFormModel");
			var oData = oFilterModel.getProperty("/");
			
			var oModel = this.getOwnerComponent().getModel();
			
			var aFilters = [];
			
			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_LIFNR',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_PROVIDER
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_MATNR',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_MATNR
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_WERKS',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_WERKS
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_PEDIDO_DEP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this._numberFormat(oData.HCP_OFFER_NUMBER, 10)
			}));
			
			oModel.read("/Commodities_Order", {
				filters: aFilters,
				success: function (result) {
					
					if (result.results.length > 0) {
							
						this.closeBusyDialog();
						this.oRouter.navTo("cadence.New", {
							unique: result.results[0].HCP_UNIQUE_KEY,
							offerNumer: result.results[0].HCP_PEDIDO_DEP,
							sequence: 0,
							supplier: parseFloat(oData.HCP_PROVIDER) +" - "+ oData["PROVIDER_DESC"],
							totalCadence: parseFloat(result.results[0].HCP_MENGE_ENTR).toFixed(2),
							lifnr:result.results[0].HCP_LIFNR,
							matnr:result.results[0].HCP_MATNR
						}, false);
						
					} else {
						sap.m.MessageBox.show(
							"Não foram encontrados dados de pedido depósito.", {
								title: "Advertência",
								icon: sap.m.MessageBox.Icon.WARNING,
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (oAction) {
									if (oAction === "OK") {
										this.closeBusyDialog();
									}
								}.bind(this)
							}
						);
					}

				}.bind(this)
			});
			this.closeBusyDialog();

		},
		_handlePartnerFilterPress: function () {
			var oFilterBar;
			if (!this.oPartnerFilter || this.oPartnerFilter.bIsDestroyed) {
				this.oPartnerFilter = sap.ui.xmlfragment("partnerFilterID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.commodities.fragments.PartnerFilter", this);
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
			this._validateForm();
		},
		onPartnerDialogClose: function () {
			this.oPartnerFilter.close();
		},
		onPartnerSelected: function (oEvent) {

			var oSource = oEvent.getSource();
			var oPartnerInput = sap.ui.core.Fragment.byId("newVisitFormFragmentID" + this.getView().getId(), "inputpartnerID");
			var oVisitModel = this.getView().getModel("cadenceFormModel");
			var oData = oVisitModel.getProperty("/");
			var SelectedPartner = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

			oData["HCP_PROVIDER"] = SelectedPartner.LIFNR;
			oData["PROVIDER_DESC"] = SelectedPartner.NAME1;

			// oPartnerInput.setDescription(SelectedPartner.NAME1);
			
			oVisitModel.refresh();
			this._validateForm();
			this.oPartnerFilter.destroy();

		},
		_validateForm: function (oEvent) {

			var oFilterModel = this.getView().getModel("cadenceFormModel");

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
							oFilterModel.setProperty("/enableFilter", true);
						} else {
							oFilterModel.setProperty("/enableFilter", false);
							return;
						}
					}
				}
			}.bind(this), 100);
		},

		_getFormFields: function () {

			var oMainDataForm = this.byId("cadenceFormID").getContent();
			var aControls = [];
			var sControlType;

			for (var i = 0; i < oMainDataForm.length; i++) {
				sControlType = oMainDataForm[i].getMetadata().getName();

				if (sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomSlider" || sControlType ===
					"com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" || sControlType === "sap.m.Input" ||
					sControlType === "sap.m.DateTimeInput" || sControlType === "sap.m.DatePicker" ||
					sControlType === "sap.m.CheckBox" || sControlType === "sap.m.MaskInput" || sControlType === "sap.m.ComboBox" || sControlType ===
					"sap.m.DateRangeSelection") {

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
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(
					sEntityNameSet,
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
		flushStore: function () {
			return new Promise(function (resolve, reject) {
				if (typeof sap.hybrid !== 'undefined') {
					sap.hybrid.flushStore().then(function () {
						resolve();
					});
				} else {
					resolve();
				}
			}.bind(this));

		},

		refreshStore: function (entity1) {
			return new Promise(function (resolve, reject) {
				if (typeof sap.hybrid !== 'undefined') {
					// this.setBusyDialog("App Grãos", "Atualizando banco de dados");
					sap.hybrid.refreshStore(entity1).then(function () {
						resolve();
					}.bind(this));
				} else {
					resolve();
				}
			}.bind(this));
		}
	});
});