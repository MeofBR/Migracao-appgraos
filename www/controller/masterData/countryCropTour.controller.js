sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function (MainController, MessageBox, History) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.masterData.countryCropTour", {

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("masterData.countryCropTour").attachPatternMatched(this.handleRouteMatched, this);
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

			// var lastUpdate;

			// var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
			// 	pattern: "dd/MM/yyyy HH:mm"
			// });

			// if (localStorage.getItem("lastUpdateOfferMap")) {
			// 	lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdateOfferMap")));
			// } else {
			// 	lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdate")));
			// }
			// this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdate);

			
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableCreate: false,
				enableSelectRegion: false
			}), "filterPageModel");
			
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				itemRegion: [],
				itemCountry: [],
				itemStates: []
			}), "filterRegion");

			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "countryFormModel");
			
			this.getCountry(this.statusList);
		},

		// refreshData: function () {
		// 	var oDeviceModel = this.getOwnerComponent().getModel("device");
		// 	var bIsMobile = oDeviceModel.getData().browser.mobile;

		// 	if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

		// 		var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
		// 			pattern: "dd/MM/yyyy HH:mm"
		// 		});

		// 		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		// 		var sMessage = "Tem certeza que deseja atualizar a base de ofertas? Verifique a qualidade da conexão.";

		// 		MessageBox.information(
		// 			sMessage, {
		// 				actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
		// 				styleClass: bCompact ? "sapUiSizeCompact" : "",
		// 				onClose: function (sAction) {
		// 					if (sAction === "YES") {

		// 						this.count = 0;
		// 						this.revertCount = 20;
		// 						this.timeOut = 20;
		// 						this.hasFinished = false;
		// 						this.message = "Enviando dados, por favor aguarde (";
		// 						this.verifyTimeOut();
		// 						this.flushStore("Offer_Map,Offer_Map_Werks").then(function () {
		// 							this.refreshStore("Offer_Map", "Offer_Map_Werks").then(function () {

		// 								localStorage.setItem("lastUpdateOfferMap", new Date());
		// 								var lastUpdateOfferMap = dateFormat.format(new Date(localStorage.getItem("lastUpdateOfferMap")));

		// 								this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdateOfferMap);

		// 								this.hasFinished = true;
		// 								if (bIsMobile) {
		// 									localStorage.setItem("countStorageOfferMap", 0);
									
		// 								}

		// 								this.getView().getModel().refresh(true);
		// 								//this.closeBusyDialog();
		// 							}.bind(this));
		// 						}.bind(this));

		// 					}
		// 				}.bind(this)
		// 			}
		// 		);

		// 	} else {
		// 		this.getView().getModel().refresh(true);
		// 		this.closeBusyDialog();
		// 	}
		// },

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
		
		// refreshDataTest: function () {
		// 	var bIsMobile = window.fiori_client_appConfig;
		// 	this.verifyTimeOut();

		// 	if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
		// 		this.flushStore().then(function () {
		// 			this.refreshStore().then(function () {
		// 				this.hasFinished = true;
		// 			}.bind(this));
		// 		}.bind(this));
		// 	} else {
		// 		this.getView().getModel().refresh();
		// 	}
		// },
		
		// verifyTimeOut: function () {

		// 	if (!this.hasFinished) {
		// 		setTimeout(function () {
		// 			this.setBusyDialog("App Grãos", this.message + this.revertCount + ")");
		// 			this.count++;
		// 			this.revertCount--;
		// 			//console.log("Countador está em: " + this.count);
		// 			if (this.count > this.timeOut) {
		// 				this.showMessage();
		// 			} else {
		// 				this.verifyTimeOut();
		// 			}

		// 		}.bind(this), 1000);
		// 	} else {
		// 		if (this.busyDialog) {
		// 			this.busyDialog.close();
		// 		}
		// 	}
		// },

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
		
		getStates: function (actionName) {
			let oModel = this.getView().getModel()
			let oCountryModel = this.getView().getModel('countryFormModel').oData
			var oTableModel = this.getView().getModel("filterRegion");
			
			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'LAND1',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: actionName === "COUNTRY" ? oCountryModel.HCP_LAND1 : oCountryModel.HCP_LAND1_MODAL
			}));
			
			if (oCountryModel.HCP_LAND1 && actionName === "COUNTRY" || oCountryModel.HCP_LAND1_MODAL && actionName === "COUNTRYModal") {
				oModel.read("/View_States", {
					filters: aFilters,
					sorter: [new sap.ui.model.Sorter({ path: 'BEZEI', descending: false })],
					success: function (result) {
						if (result.results.length > 0) {
							if (actionName === "COUNTRY") {
								oTableModel.setProperty("/itemStates", result.results);
							} else {
								oTableModel.setProperty("/itemStatesModal", result.results);
							}
							var oTable = this.getView().byId("table");
							oTable.getBinding("items").refresh();
						}
						this.closeBusyDialog();
					}.bind(this)
				});
			}
		},

		//Melhorias//
		_validateForm: function (oEvent) {
			let oModel = this.getView().getModel("filterPageModel")
			let oData = this.getView().getModel("countryFormModel").oData
			if (oEvent.getSource().getName() == "STATE"){
				this.getParameters(this.statusList);
			} else if (oEvent.getSource().getName() == 'COUNTRY' || oEvent.getSource().getName() == 'COUNTRYModal') {
				this.getStates(oEvent.getSource().getName())
				
				if (oData.HCP_LAND1) {
					oModel.setProperty("/enableSelectRegion", true)
				} else {
					oModel.setProperty("/enableSelectRegion", false)
				}
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
		
		getCountry: function (status) {
			this.setBusyDialog("Países", "Carregando Parâmetros...");
			var oModel = this.getView().getModel();
			var formModel = this.getView().getModel("countryFormModel");
			var oTableModel = this.getView().getModel("filterRegion");
			
			oModel.read("/Country_Croptour", {
				success: function (result) {
					if (result.results.length > 0) {
						oTableModel.setProperty("/itemCountry", result.results);
						var oTable = this.getView().byId("table");
						oTable.getBinding("items").refresh();
					}
					this.closeBusyDialog();
				}.bind(this)
			});
		},
		
		getParameters: function (status) {
			var oModel = this.getView().getModel();
			var formModel = this.getView().getModel("countryFormModel");
			var oTableModel = this.getView().getModel("filterRegion");
			oTableModel.setProperty("/itemRegion", []);
			
			var aFilters = [];
			
			if (formModel.oData.HCP_BLAND) {
				this.setBusyDialog("Regiões", "Carregando Parâmetros...");
				
				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_LAND1',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: formModel.oData.HCP_LAND1
				}));
				
				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_BLAND',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: formModel.oData.HCP_BLAND
				}));
				
				oModel.read("/Regions_Croptour", {
					filters: aFilters,
					success: function (result) {
						if (result.results.length > 0) {
							oTableModel.setProperty("/itemRegion", result.results);
							var oTable = this.getView().byId("table");
							oTable.getBinding("items").refresh();
	
						}
						this.closeBusyDialog();
					}.bind(this)
				});
			}
		},
		
		_onSave: function (oEvent) {
			oEvent.getSource().getParent().close();
			
			this.setBusyDialog("App Grãos", "Cadastrando, aguarde");

			var oCreateModel = this.getView().getModel("countryFormModel");
			var oData = oCreateModel.getProperty("/");
			var oModel = this.getOwnerComponent().getModel();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var sTimestamp = new Date().getTime();

			oModel.setUseBatch(true);

			var oProperties = {
				HCP_ID: sTimestamp.toFixed(),
				HCP_LAND1: oData.HCP_LAND1_MODAL,
				HCP_BLAND: oData.HCP_BLANDMODAL,
				HCP_BEZEI: oData.HCP_BEZEI,
				HCP_ACTIVE: "1"
			};

			oModel.createEntry("/Regions_Croptour", {
				properties: oProperties
			});

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				oModel.submitChanges({
					success: function () {
						MessageBox.success(
							"Parâmetros cadastrados com sucesso.", {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
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
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.masterData.fragments.croptourRegionFragment",
					this);
				this.getView().addDependent(this._FragmentPrice);
			}
			
			var oModel = this.getView().getModel("countryFormModel");
			
			var oModelCertification = new sap.ui.model.json.JSONModel({
				HCP_ID: "",
				HCP_LAND1: "BR",
				HCP_BLAND: oModel.oData.HCP_BLAND,
				HCP_BLANDMODAL: oModel.oData.HCP_BLAND,
				HCP_BEZEI: "",
				HCP_ACTIVE: "1"
			});

			this.getView().setModel(oModelCertification, "countryFormModel");
			
			var oModelModal = this.getView().getModel("filterPageModel");
			oModelModal.setProperty("/enableCreateButton",true);
			oModelModal.setProperty("/enableEditButton",false);
			oModelModal.setProperty("/enableCreate",false);
			

			this._FragmentPrice.open();
		},
		_onDialogTablePricCancelPress: function (oEvent) {

			oEvent.getSource().getParent().close();
		},
		
		_onDeleteButton: function(oEvent){
			var oItem = oEvent.getSource();
			var sPlit = oItem.oParent.oParent.oBindingContexts.filterRegion.sPath.split("/");
			var sIndex = sPlit[2];
			var oData = oItem.oParent.oParent.oBindingContexts.filterRegion.oModel.oData.itemRegion[sIndex];
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

							sPath = this.buildEntityPath("Regions_Croptour", oProperties, "HCP_ID");
							oModel.update(sPath, oProperties, {
								groupId: "changes"
							});
							
							oModel.submitChanges({
								groupId: "changes",
								success: function () {
									MessageBox.success("Parâmetro inativado com sucesso.", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.closeBusyDialog();
												this.getParameters(this.statusList);	
											}.bind(this)
										}
									);
								}.bind(this),
								error: function () {
									MessageBox.success("Erro ao inativar parâmetro.", {
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
		_onActiveButton: function(oEvent){
			
			var oItem = oEvent.getSource();
			var sPlit = oItem.oParent.oParent.oBindingContexts.filterRegion.sPath.split("/");
			var sIndex = sPlit[2];
			var oData = oItem.oParent.oParent.oBindingContexts.filterRegion.oModel.oData.itemRegion[sIndex];
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
								HCP_ACTIVE: "1"
							};

							sPath = this.buildEntityPath("Regions_Croptour", oProperties, "HCP_ID");
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