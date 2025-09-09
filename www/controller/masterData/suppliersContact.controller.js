sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/export/Spreadsheet",
	'sap/m/MessageToast',
], function (MainController, MessageBox, History, formatter, JSONModel, Spreadsheet, MessageToast) {
	//XLSX, CPExcel
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.masterData.suppliersContact", {
		formatter: formatter,

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("masterData.suppliersContact").attachPatternMatched(this.handleRouteMatched, this);
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
				itemAllSuppliers: []
			}), "View_Grouping_Suppliers");

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				itemSuppliersContact: []
			}), "filterSuppliersContact");

			this.getView().setModel(new sap.ui.model.json.JSONModel({

			}), "suppliersContactModel");

			this.getParameters(this.statusList);

		},

		refreshData: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

				var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd/MM/yyyy HH:mm"
				});

				//	this.setBusyDialog(
				//		this.resourceBundle.getText("textGrainApp"), this.resourceBundle.getText("textWait"));

				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				var sMessage = "Tem certeza que deseja atualizar a base de ofertas? Verifique a qualidade da conexão.";

				MessageBox.information(
					sMessage, {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {

								this.count = 0;
								this.revertCount = 20;
								this.timeOut = 20;
								this.hasFinished = false;
								this.message = "Enviando dados, por favor aguarde (";
								this.verifyTimeOut();
								this.flushStore("Offer_Map,Offer_Map_Werks").then(function () {
									this.refreshStore("Offer_Map", "Offer_Map_Werks").then(function () {

										localStorage.setItem("lastUpdateOfferMap", new Date());
										var lastUpdateOfferMap = dateFormat.format(new Date(localStorage.getItem("lastUpdateOfferMap")));

										this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdateOfferMap);

										this.hasFinished = true;
										if (bIsMobile) {
											localStorage.setItem("countStorageOfferMap", 0);
									
										}

										this.getView().getModel().refresh(true);
										//this.closeBusyDialog();
									}.bind(this));
								}.bind(this));

							}
						}.bind(this)
					}
				);

			} else {
				this.getView().getModel().refresh(true);
				this.closeBusyDialog();
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
		refreshDataTest: function () {

			var bIsMobile = window.fiori_client_appConfig;
			this.verifyTimeOut();

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				this.flushStore().then(function () {
					this.refreshStore().then(function () {
						this.hasFinished = true;
					}.bind(this));
				}.bind(this));
			} else {
				this.getView().getModel().refresh();
			}
		},
		verifyTimeOut: function () {

			if (!this.hasFinished) {
				setTimeout(function () {
					this.setBusyDialog("App Grãos", this.message + this.revertCount + ")");
					this.count++;
					this.revertCount--;
					//console.log("Countador está em: " + this.count);
					if (this.count > this.timeOut) {
						this.showMessage();
					} else {
						this.verifyTimeOut();
					}

				}.bind(this), 1000);
			} else {
				if (this.busyDialog) {
					this.busyDialog.close();
				}
			}
		},

		showMessage: function () {
			localStorage.setItem("isNeededToReload", true);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("errorPages.timeOutConnection", true);
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

		_handlePartnerFilterPress: function (oEvent) {
			var oFilterBar;
			if (!this.oPartnerFilter || this.oPartnerFilter.bIsDestroyed) {
				this.oPartnerFilter = sap.ui.xmlfragment("partnerFilterID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.masterData.fragments.PartnerFilter", this);
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

		onPartnerSelected: function (oEvent) {
			var oSource = oEvent.getSource();
			var oPartnerInput = sap.ui.core.Fragment.byId("newVisitFormFragmentID" + this.getView().getId(), "inputpartnerID");
			var oModel = this.getView().getModel("suppliersContactModel");
			var oData = oModel.getProperty("/");
			var SelectedPartner = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

			oData["HCP_PARTNER"] = SelectedPartner.HCP_REGISTER;
			oData["HCP_PARTNER_NAME"] = SelectedPartner.NAME1;
			if (SelectedPartner.STCD1)
				oData["HCP_STCD1"] = SelectedPartner.STCD1;
			else if (SelectedPartner.STCD2)
				oData["HCP_STCD1"] = SelectedPartner.STCD2;

			oData["PROVIDER_DESC"] = SelectedPartner.NAME1;
			oModel.refresh();
			this.oPartnerFilter.destroy();

			// this._onInputPartner(SelectedPartner).then(function () {
			this._validateForm();
			// }.bind(this));

		},

		onPartnerDialogClose: function () {
			this.oPartnerFilter.close();
		},

		_onInputPartner: function (oSelectedPartner) {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getView().getModel();
				var oModel = this.getView().getModel("suppliersContactModel");
				var oData = oModel.oData;
				var aFilters = [];

				oModel.setProperty("/filterPartner", []);
				if (oSelectedPartner.AGRUPADO === 0) { //Não Agrupado
					aFilters.push(new sap.ui.model.Filter({
						path: "LIFNR",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oSelectedPartner.HCP_REGISTER
					}));
				} else { //Agrupado
					if (oSelectedPartner.STCD1 != "") {
						if (oSelectedPartner.LAND1 !== "BR") {
							aFilters.push(new sap.ui.model.Filter({
								path: "STCD1",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oSelectedPartner.STCD1
							}));
						} else {
							var oStcd1 = oSelectedPartner.STCD1.substr(0, 8);

							aFilters.push(new sap.ui.model.Filter({
								path: "STCD1",
								operator: sap.ui.model.FilterOperator.Contains,
								value1: oStcd1
							}));
						}
					} else {
						aFilters.push(new sap.ui.model.Filter({
							path: "STCD2",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oSelectedPartner.STCD2
						}));
					}
				}

				oModelOffer.read("/", {
					filters: aFilters,
					success: function (results) {

						var aResults = results.results;
						var aFilterPartner = [];

						if (aResults.length > 0) {
							for (var i = 0; i < aResults.length; i++) {
								aFilterPartner.push(new sap.ui.model.Filter({
									path: "HCP_PARTNER",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: aResults[i].LIFNR
								}));
							}
							oModel.setProperty("/filterPartner", aFilterPartner);
						}
						resolve();
					}.bind(this),
					error: function (error) {
						reject();
					}
				});
			}.bind(this));

		},

		_onPartnerApplySearch: function (oEvent) {
			var oList = sap.ui.core.Fragment.byId("partnerFilterID" + this.getView().getId(), "partnerListID");
			var oFilterBar = sap.ui.core.Fragment.byId("partnerFilterID" + this.getView().getId(), "fbPartner");
			var oFilters = this._getPartnerFilters(oFilterBar);

			oList.getBinding("items").filter(oFilters);
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

		getParameters: function (status) {

			this.setBusyDialog("SuppliersContact", "Carregando Parâmetros...");
			var oModel = this.getView().getModel();
			var formModel = this.getView().getModel("suppliersContactModel");
			var oTableModel = this.getView().getModel("filterSuppliersContact");
			oTableModel.setProperty("/itemSuppliersContact", []);
			var oTable = this.getView().byId("table");

			oModel.read("/Simplified_Contact", {
				//View_Suppliers
				success: function (result) {
					if (result.results.length > 0) {
						oTableModel.setProperty("/itemSuppliersContact", result.results);

						oTable.getBinding("items").refresh();

					}
					this.closeBusyDialog();
				}.bind(this)
			});
		},

		_onEditButton: function (oEvent) {
			var oItem = oEvent.getSource();
			var sPlit = oItem.oParent.oParent.oBindingContexts.filterSuppliersContact.sPath.split("/");
			var sIndex = sPlit[2];
			var oData = oItem.oParent.oParent.oBindingContexts.filterSuppliersContact.oModel.oData.itemSuppliersContact[sIndex];

			if (!this._FragmentPrice) {
				this._FragmentPrice = sap.ui.xmlfragment("tablePriceId" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.masterData.fragments.suppliersContactFragment",
					this);
				this.getView().addDependent(this._FragmentPrice);

			}

			var oModelTablePrice = new sap.ui.model.json.JSONModel({
				HCP_ID: oData.HCP_ID,
				HCP_PARTNER: oData.HCP_PARTNER,
				HCP_PARTNER_NAME: oData.HCP_PARTNER_NAME,
				HCP_STCD1: oData.HCP_STCD1,
				HCP_EKGRP: oData.HCP_EKGRP,
				HCP_RANK: oData.HCP_RANK,
				HCP_ACTIVE: "0"
			});

			this.getView().setModel(oModelTablePrice, "suppliersContactModel");

			var oModelModal = this.getView().getModel("filterPageModel");

			oModelModal.setProperty("/enableCreate", false);
			this.arrayEdit = oModelTablePrice;

			this._FragmentPrice.open();

		},

		getViewProvider: async function () {
			let oDataModel = this.getOwnerComponent().getModel();
			let Service = "/View_Grouping_Provider_Simplified_Contact"

			return await new Promise(function (resove, reject) {
				oDataModel.read(Service, {
					success: function (data) {
						resove(data);
					}.bind(this),
					error: function (oError) {
						reject(oError);
					}.bind(this),
				});
			});
		},

		createColumn: function () {
			return [
			{
				label: 'ERDAT', // this.getView().getModel("i18n").getResourceBundle().getText('lblCNPJ'),
				property: 'ERDAT',
				width: '50'
			},
			{
				label: 'HCP_PARTNER', // this.getView().getModel("i18n").getResourceBundle().getText('lblProcessDate'), // Provider
				property: 'HCP_PARTNER',
				width: '50'
			}, {
				label: 'HCP_PARTNER_NAME', // this.getView().getModel("i18n").getResourceBundle().getText('lblProcessDate'), // Provider
				property: 'HCP_PARTNER_NAME',
				width: '50'
			}, {
				label: 'HCP_STCD1', // this.getView().getModel("i18n").getResourceBundle().getText('lblProcessDate'), // Provider
				property: 'HCP_STCD1',
				width: '50'
			}, {
				label: 'HCP_EKGRP', // this.getView().getModel("i18n").getResourceBundle().getText('lblDocument'),
				property: 'HCP_EKGRP',
				width: '50'
			},
			{
				label: 'HCP_RANK', // this.getView().getModel("i18n").getResourceBundle().getText('lblCNPJ'),
				property: 'HCP_RANK',
				width: '50'
			}];
		},

		onExport: async function () {
			var aCols, oBinding = [],
				oSettings, oSheet;
			let getViewProvider = await this.getViewProvider();

			var oModel = this.getView().getModel("filterSuppliersContact");
			let oData = oModel.oData;

			const oDataClean = Object.assign({}, oData)

			aCols = this.createColumn();

			oBinding.push(...oDataClean.itemSuppliersContact)

			oBinding.push(...getViewProvider.results)

			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: oBinding
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function () {
					MessageToast.show('Spreadsheet export has finished');
				}).finally(function () {
					oSheet.destroy();
				});
		},

		onExportSuppliersContact: async function () {
			var aCols, oBinding = [],
				oSettings, oSheet;
			let getViewProvider = await this.getViewProvider();

			var oModel = this.getView().getModel("filterSuppliersContact");
			let oData = oModel.oData;

			const oDataClean = Object.assign({}, oData)

			aCols = this.createColumn();

			oBinding.push(...oDataClean.itemSuppliersContact)

			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: oBinding
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function () {
					MessageToast.show('Spreadsheet export has finished');
				}).finally(function () {
					oSheet.destroy();
				});
		},

		onExportProvider: async function () {
			var aCols, oBinding = [],
				oSettings, oSheet;
			let getViewProvider = await this.getViewProvider();

			var oModel = this.getView().getModel("filterSuppliersContact");
			let oData = oModel.oData;

			const oDataClean = Object.assign({}, oData)

			aCols = this.createColumn();

			oBinding.push(...getViewProvider.results)

			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: oBinding
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function () {
					MessageToast.show('Spreadsheet export has finished');
				}).finally(function () {
					oSheet.destroy();
				});
		},

		onImport: async function (oEvent) {
			
			this.setBusyDialog("App Grãos", "Realizando importação, por favor aguarde...");
			let oDataModel = this.getOwnerComponent().getModel();
			let oModel = this.getView().getModel("filterSuppliersContact");
			let oData = oModel.oData;
			let that = this;

			let jsonFilter = []
			let filterListDiffNull = []

			let oCreate = false;

			let qtdAll = 0,
				qtdCreate = 0,
				qtdAlter = 0,
				qtdNotData = 0,
				qtdNotAlter = 0;

			oDataModel.setUseBatch(true);

			var oFileUploader = oEvent.getSource();
			var oFile = oEvent.getParameter("files")[0];
			if (oFile && window.FileReader) {
				var reader = new FileReader();
				// reader.onload = await

				// function (e) {
				reader.onload = async (e) => {
					let oModelSuppliers = this.getOwnerComponent().getModel();
					oModelSuppliers.read("/View_Grouping_Suppliers", {
						success: function (resultNew) {
							var oAllSuppliers = resultNew.results;
							// resolve(oSuppliers);
							var data = e.target.result;
							var workbook = XLSX.read(data, {
								type: "binary"
							});
							var sheetName = workbook.SheetNames[0];
							var worksheet = workbook.Sheets[sheetName];
							let jsonData = XLSX.utils.sheet_to_json(worksheet);
							// Process the jsonData and update your model
		
							qtdAll = jsonData.length;
		
							filterListDiffNull = jsonData.filter((data, i) => jsonData[i].HCP_EKGRP != null && jsonData[i].HCP_PARTNER != null && jsonData[i].HCP_RANK != null && jsonData[i].HCP_STCD1 != null)
		
							qtdNotData = qtdAll - filterListDiffNull.length;
							
							if(filterListDiffNull.length > 500){
		                        MessageBox.error("Registros acima do limite maximo de 500 dados", {
		                            actions: [sap.m.MessageBox.Action.OK],
		                            onClose: function (sAction) {
		                                that.closeBusyDialog();
		                                return;
		                            }.bind(that)
		                        });    
		                        return;
		                    };
		
							//Faço um loop no xlsx
							for (var i = 0; i < filterListDiffNull.length; i++) {
		
								//monto propriedade que ira para tabela
								var oProperties = {
									HCP_PARTNER: filterListDiffNull[i].HCP_PARTNER,
									HCP_PARTNER_NAME: filterListDiffNull[i].HCP_PARTNER_NAME,
									HCP_STCD1: filterListDiffNull[i].HCP_STCD1.toString(),
									HCP_EKGRP: (filterListDiffNull[i].HCP_EKGRP).toString(),
									HCP_RANK: (filterListDiffNull[i].HCP_RANK).toString(),
									HCP_ACTIVE: "1"
								};
		
								//Faço um loop na minha tabela
								for (var j = 0; j < oData.itemSuppliersContact.length; j++) {
									//Verifico se existe o registro do fornecedor em no xlsx e na tabela
									//Se existir é um update
									//Se não existir é um created
									if (filterListDiffNull[i].HCP_PARTNER == oData.itemSuppliersContact[j].HCP_PARTNER &&
										filterListDiffNull[i].HCP_PARTNER_NAME == oData.itemSuppliersContact[j].HCP_PARTNER_NAME &&
										(filterListDiffNull[i].HCP_STCD1   == oData.itemSuppliersContact[j].HCP_STCD1 || filterListDiffNull[i].HCP_STCD1   == oData.itemSuppliersContact[j].HCP_STCD2)) {
										//Verifico se os registros a serem registrados estão diferentes
										//Se sim da gera um opdate do dado
										//se estiver igual não necessita de update
										if (filterListDiffNull[i].HCP_EKGRP != oData.itemSuppliersContact[j].HCP_EKGRP ||
											filterListDiffNull[i].HCP_RANK != oData.itemSuppliersContact[j].HCP_RANK) {
		
											oProperties = {
												...oProperties,
												HCP_ID: oData.itemSuppliersContact[j].HCP_ID
											}
											
											let sPath = that.buildEntityPath("Simplified_Contact", oProperties, "HCP_ID");
											oDataModel.update(sPath, oProperties);
		
											qtdAlter += 1;
											oCreate = false;
											break;
										} else {
											qtdNotAlter += 1;
											oCreate = false;
											break;
										}
									} else {
										for (var x = 0; x < oAllSuppliers.length; x++) {
											if (filterListDiffNull[i].HCP_PARTNER == oAllSuppliers[x].HCP_REGISTER &&
												filterListDiffNull[i].HCP_PARTNER_NAME == oAllSuppliers[x].NAME1 &&
												(filterListDiffNull[i].HCP_STCD1 == oAllSuppliers[x].STCD1 ||
												filterListDiffNull[i].HCP_STCD1 == oAllSuppliers[x].STCD2 )) {
													
												oCreate = true;	
												
											}
										}
									}
								}
		
								//Se ele retorno controle de Create
								if (oCreate == true) {
									oProperties = {
										...oProperties,
										HCP_ID: "0",
									}
							
									oDataModel.createEntry("/Simplified_Contact", {
										properties: oProperties
									});
		
									qtdCreate += 1;
								
								}
							}
							
							if(qtdCreate > 0 || qtdAlter > 0) {
								that.onExportSuppliersContact()
								oDataModel.submitChanges({
									groupId: "changes",
									success: function () {
										MessageBox.success(`
											Registros editados com sucesso. \n
											Quantidade total de registro na importação: ${qtdAll} \n
											Quantidade de registros com campos vazios: ${qtdNotData} \n
											Quantidade de registros que foram preservados: ${qtdNotAlter} \n
											Quantidade de registros que foram modificados: ${qtdAlter} \n
											Quantidade de registros que foram criados: ${qtdCreate} `, {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												that.closeBusyDialog();
												that.getParameters();
											}.bind(that)}
										);
									}.bind(that),
									error: function () {
										MessageBox.error("Erro ao realizar importação.", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												that.closeBusyDialog();
												that.getParameters(that.statusList);
											}.bind(that)
										});
									}.bind(that)
								});
							}
							else
							{
								MessageBox.warning("Nenhuma Alteração/Novo Cadastro encontrado! Todos os registros mantiveram-se iguais!", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										that.closeBusyDialog();
										that.getParameters(that.statusList);
									}.bind(that)
								});	
							}
		
						}.bind(this),
						error: function (err) {
							sap.m.MessageToast.show("Falha ao Buscar Fornecedores.");
							reject(err);
						}
					});
				};
			}
			reader.readAsBinaryString(oFile);
		},

		_onEdit: function (oEvent) {

			oEvent.getSource().getParent().close();

			this.setBusyDialog("App Grãos", "Editando, aguarde");

			var oCreateModel = this.getView().getModel("suppliersContactModel");
			var oData = oCreateModel.getProperty("/");
			var oModel = this.getOwnerComponent().getModel();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var aDeferredGroups = oModel.getDeferredGroups();

			oModel.setUseBatch(true);

			var oProperties = {
				HCP_ID: this.arrayEdit.oData.HCP_ID,
				HCP_PARTNER: oData.HCP_PARTNER,
				HCP_PARTNER_NAME: oData.HCP_PARTNER_NAME,
				HCP_STCD1: oData.HCP_STCD1,
				HCP_EKGRP: oData.HCP_EKGRP,
				HCP_RANK: oData.HCP_RANK,
				HCP_ACTIVE: "1"
			};

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}
			var sPath;
			sPath = this.buildEntityPath("Simplified_Contact", oProperties, "HCP_ID");
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
								}.bind(this)
							}
						);
					}.bind(this),
					error: function () {
						this.closeBusyDialog();
						MessageBox.error("Erro ao editar Parâmetros.");

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
								}.bind(this)
							}
						);
					}.bind(this),
					error: function () {
						this.closeBusyDialog();
						MessageBox.error("Erro ao editar Parâmetros.");

					}.bind(this)
				});
			}

		},

		_onSave: function (oEvent) {

			oEvent.getSource().getParent().close();

			this.setBusyDialog("App Grãos", "Cadastrando, aguarde");

			var oCreateModel = this.getView().getModel("suppliersContactModel");
			var oData = oCreateModel.getProperty("/");
			var oModel = this.getOwnerComponent().getModel();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var sTimestamp = new Date().getTime();
			var oProperties = {};

			oModel.setUseBatch(true);

			if (oData.enableCreate == true) {

				oProperties = {
					HCP_ID: sTimestamp.toFixed(),
					HCP_PARTNER: oData.HCP_PARTNER,
					HCP_PARTNER_NAME: oData.HCP_PARTNER_NAME,
					HCP_STCD1: oData.HCP_STCD1,
					HCP_EKGRP: oData.HCP_EKGRP,
					HCP_RANK: oData.HCP_RANK,
					HCP_ACTIVE: "1"
				};

				oModel.createEntry("/Simplified_Contact", {
					properties: oProperties
				});
			} else {

				oProperties = {
					HCP_ID: oData.HCP_ID,
					HCP_PARTNER: oData.HCP_PARTNER,
					HCP_PARTNER_NAME: oData.HCP_PARTNER_NAME,
					HCP_STCD1: oData.HCP_STCD1,
					HCP_EKGRP: oData.HCP_EKGRP,
					HCP_RANK: oData.HCP_RANK,
					HCP_ACTIVE: "1"
				};

				let sPath = this.buildEntityPath("Simplified_Contact", oProperties, "HCP_ID");
				oModel.update(sPath, oProperties);
			}

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
								}.bind(this)
							}
						);

					}.bind(this),
					error: function () {
						this.closeBusyDialog();
						MessageBox.error("Erro ao cadastrar Parâmetros.");

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
								}.bind(this)
							}
						);
					}.bind(this),
					error: function () {
						this.closeBusyDialog();
						MessageBox.error("Erro ao cadastrar Parâmetros.");

					}.bind(this)
				});
			}

		},

		_openDialogRegion: function () {
			if (!this._FragmentPrice) {
				this._FragmentPrice = sap.ui.xmlfragment("tablePriceId" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.masterData.fragments.suppliersContactFragment",
					this);
				this.getView().addDependent(this._FragmentPrice);
			}

			var oModel = this.getView().getModel("suppliersContactModel");

			var oModelSuppliersContact = new sap.ui.model.json.JSONModel({
				HCP_ID: "",
				HCP_PARTNER: "",
				HCP_PARTNER_NAME: "",
				HCP_STCD1: "",
				HCP_EKGRP: "",
				HCP_RANK: "",
				HCP_ACTIVE: "1"
			});

			this.getView().setModel(oModelSuppliersContact, "suppliersContactModel");

			var oModelModal = this.getView().getModel("suppliersContactModel");
			oModelModal.setProperty("/enableCreate", true);

			this._FragmentPrice.open();
		},
		_onDialogSuppliersContactCancelPress: function (oEvent) {

			let oModel = this.getView().getModel("filterPageModel");
			oModel.setProperty("enableCreate", false);
			oEvent.getSource().getParent().close();
		},

		_onDeleteButton: function (oEvent) {
			var oItem = oEvent.getSource();
			var sPlit = oItem.oParent.oParent.oBindingContexts.filterSuppliersContact.sPath.split("/");
			var sIndex = sPlit[2];
			var oData = oItem.oParent.oParent.oBindingContexts.filterSuppliersContact.oModel.oData.itemSuppliersContact[sIndex];
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
								HCP_ACTIVE: "0"
							};

							sPath = this.buildEntityPath("Simplified_Contact", oProperties, "HCP_ID");
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

		_onActiveButton: function (oEvent) {

			var oItem = oEvent.getSource();
			var sPlit = oItem.oParent.oParent.oBindingContexts.filterSuppliersContact.sPath.split("/");
			var sIndex = sPlit[2];
			var oData = oItem.oParent.oParent.oBindingContexts.filterSuppliersContact.oModel.oData.itemSuppliersContact[sIndex];
			var oModel = this.getOwnerComponent().getModel();

			MessageBox.information(

				"Deseja Ativar o parâmetro?", {
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
								HCP_PARTNER: oData.HCP_PARTNER,
								HCP_PARTNER_NAME: oData.HCP_PARTNER_NAME,
								HCP_STCD1: oData.HCP_STCD1,
								HCP_EKGRP: oData.HCP_EKGRP,
								HCP_RANK: oData.HCP_RANK,
								HCP_ACTIVE: "1"
							};

							sPath = this.buildEntityPath("Simplified_Contact", oProperties, "HCP_ID");
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
		},

		sortButtonPressed: function (oEvent) {
			if (!this.SortDialog) {
				this.SortDialog = sap.ui.xmlfragment(
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.masterData.fragments.sortDialogSimplifiedContact", this);
				this.getView().addDependent(this.SortDialog);
			}

			this.SortDialog.openBy(oEvent.getSource());
		},

		submitSortList: function (oEvent) {
			var oSelectedColumn = sap.ui.getCore().byId("group_column").getSelectedButton().getId();
			var oSelectedSort = sap.ui.getCore().byId("group_sort").getSelectedButton().getId();
			var oTable;
			oTable = this.getView().byId("table");

			var oSorter = [];

			oSorter.push(new sap.ui.model.Sorter({
				path: oSelectedColumn,
				descending: oSelectedSort === "descending" ? true : false,
				upperCase: false
			}));

			oTable.getBinding("items").sort(oSorter);

			this.SortDialog.close();
		},

		filterButtonPressed: function (oEvent) {
			if (!this._FragmentFilter) {
				this._FragmentFilter = sap.ui.xmlfragment(
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.masterData.fragments.FilterDialogSimplifiedContact",
					this);

				var oModelFilters = new JSONModel({
					HCP_STCD1: "",
					HCP_PARTNER_NAME: "",
					HCP_EKGRP: "",
					HCP_RANK: ""
				});

				this.getView().setModel(oModelFilters, "filters");
				this.getView().addDependent(this._FragmentFilter);
			}

			this._FragmentFilter.openBy(oEvent.getSource());
		},

		submitFilterList: function (oEvent) {
			let oFilterModel = this.getView().getModel("filters");
			let oFiltertData = oFilterModel.getProperty("/");
			let oFilters = [];
			let oTable = this.getView().byId("table");

			let formatCPFCNPJ

			if (oFiltertData.HCP_STCD1)
				formatCPFCNPJ = oFiltertData.HCP_STCD1.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim();

			oFiltertData.HCP_STCD1 ? oFilters.push(new sap.ui.model.Filter("HCP_STCD1", sap.ui.model.FilterOperator.Contains, formatCPFCNPJ)) :
				false;
			oFiltertData.HCP_PARTNER_NAME ? oFilters.push(new sap.ui.model.Filter("HCP_PARTNER_NAME", sap.ui.model.FilterOperator.Contains,
				oFiltertData.HCP_PARTNER_NAME)) : false;
			oFiltertData.HCP_EKGRP ? oFilters.push(new sap.ui.model.Filter("HCP_EKGRP", sap.ui.model.FilterOperator.Contains, oFiltertData.HCP_EKGRP)) :
				false;
			oFiltertData.HCP_RANK ? oFilters.push(new sap.ui.model.Filter("HCP_RANK", sap.ui.model.FilterOperator.Contains, oFiltertData.HCP_RANK)) :
				false;
				
			oFilters.push(new sap.ui.model.Filter("HCP_ACTIVE", sap.ui.model.FilterOperator.EQ, '1'))

			oTable.getBinding("items").filter(oFilters);

			this._FragmentFilter.close();
		}

	});
}, /* bExport= */ true);