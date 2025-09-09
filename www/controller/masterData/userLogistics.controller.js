sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function (MainController, MessageBox, History) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.masterData.userLogistics", {

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("masterData.userLogistics").attachPatternMatched(this.handleRouteMatched, this);
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "indexModel");

		},

		handleRouteMatched: function () {

			this.count = 0;
			this.arrayEdit = [];
			this.revertCount = 20;
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
				itemUserLogistics: []
			}), "filterUserLogistics");

			this.getParameters();

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

			var oCreateModel = this.getView().getModel("userLogisticsFormModel");

			if (oEvent.getSource().getName() == "MATERIAL") {
				oCreateModel.setProperty("/HCP_MATERIAL_DESCRIPTION", oEvent.getSource().getValue());
			}

			if (oEvent.getSource().getName() == "CEREAL") {
				oCreateModel.setProperty("/HCP_TYPE_MATERIAL_DESCRIPTION", oEvent.getSource().getValue());
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

		getParameters: function () {

			this.setBusyDialog("Logística", "Carregando Parâmetros...");
			var oModel = this.getView().getModel();
			var oTableModel = this.getView().getModel("filterUserLogistics");
			oTableModel.setProperty("/itemUserLogistics", []);

			oModel.read("/User_Logistics", {

				success: function (result) {

					this.countRegister = result.results.length;

					if (result.results.length > 0) {
						oTableModel.setProperty("/itemUserLogistics", result.results);
						var oTable = this.getView().byId("table");
						oTable.getBinding("items").refresh();

					}
					this.closeBusyDialog();
				}.bind(this)
			});
		},
		_onSave: function (oEvent) {

			oEvent.getSource().getParent().close();

			this.setBusyDialog("App Grãos", "Cadastrando, aguarde");

			var oCreateModel = this.getView().getModel("userLogisticsFormModel");
			var oData = oCreateModel.getProperty("/");
			var oModel = this.getOwnerComponent().getModel();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var sTimestamp = new Date().getTime();

			var arrayUser = oData.userSelected.split("|");

			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_EMAIL',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: arrayUser[1]
			}));

			oModel.read("/User_Logistics", {
				filters: aFilters,
				success: function (result) {

					this.countRegister = result.results.length;

					if (result.results.length > 0) {

						MessageBox.success(
							"E-mail já existente, tente outro e-mail de usuário.", {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									//	this.navBack();
									this.closeBusyDialog();
									this.getParameters();
								}.bind(this)
							}
						);

					} else {

						oModel.setUseBatch(true);

						var oProperties = {
							HCP_ID: sTimestamp.toFixed(),
							HCP_BNAME: arrayUser[0],
							HCP_EMAIL: arrayUser[1],
							HCP_CREATED_BY: this.userName,
							HCP_CREATED_AT: this._formatDate(new Date())

						};

						oModel.createEntry("/User_Logistics", {
							properties: oProperties
						});

						if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

							oModel.submitChanges({
								success: function () {
									//	this.flushStore("Price_Intention").then(function () {
									//	this.refreshStore("Price_Intention").then(function () {
									MessageBox.success(
										"Parâmetros cadastrados com sucesso.", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												//	this.navBack();
												this.closeBusyDialog();
												this.getParameters();
											}.bind(this)
										}
									);
									//}.bind(this));
									//}.bind(this));

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
												this.getParameters();
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

					}

				}.bind(this)
			});

		},

		_onEdit: function (oEvent) {

			oEvent.getSource().getParent().close();

			this.setBusyDialog("App Grãos", "Editando, aguarde");

			var oCreateModel = this.getView().getModel("userLogisticsFormModel");
			var oData = oCreateModel.getProperty("/");
			var oModel = this.getOwnerComponent().getModel();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var sTimestamp = new Date().getTime();
			var sPath;
			var aDeferredGroups = oModel.getDeferredGroups();

			oModel.setUseBatch(true);

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}

			var oProperties = {
				HCP_TABLE_PRICE_ID: this.arrayEdit.oData.HCP_TABLE_PRICE_ID,
				HCP_POSITION: parseInt(oData.HCP_POSITION),
				HCP_MATERIAL: oData.HCP_MATERIAL,
				HCP_MATERIAL_DESCRIPTION: oData.HCP_MATERIAL_DESCRIPTION,
				HCP_TYPE_MATERIAL: oData.HCP_TYPE_MATERIAL,
				HCP_TYPE_MATERIAL_DESCRIPTION: oData.HCP_TYPE_MATERIAL_DESCRIPTION,
				HCP_GROUP_DESCRIPTION: oData.HCP_GROUP_DESCRIPTION,
				HCP_GROUP_COLOR: oData.HCP_GROUP_COLOR
			};

			sPath = this.buildEntityPath("Table_Price_Parameters", oProperties, "HCP_TABLE_PRICE_ID");
			oModel.update(sPath, oProperties, {
				groupId: "changes"
			});

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

				oModel.submitChanges({
					groupId: "changes",
					success: function () {
						//	this.flushStore("Price_Intention").then(function () {
						//	this.refreshStore("Price_Intention").then(function () {
						MessageBox.success(
							"Parâmetros editados com sucesso.", {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									this.closeBusyDialog();
									this.getParameters();
								}.bind(this)
							}
						);
						//}.bind(this));
						//}.bind(this));

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
		_onPriceEditButton: function (oEvent) {

			var oItem = oEvent.getSource();
			var sPlit = oItem.oParent.oParent.oBindingContexts.filterUserLogistics.sPath.split("/");
			var sIndex = sPlit[2];
			var oData = oItem.oParent.oParent.oBindingContexts.filterUserLogistics.oModel.oData.itemUserLogistics[sIndex];

			if (!this._FragmentPrice) {
				this._FragmentPrice = sap.ui.xmlfragment("tablePriceId" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.masterData.fragments.userLogisticsFragment",
					this);
				this.getView().addDependent(this._FragmentPrice);

			}

			var oModelTablePrice = new sap.ui.model.json.JSONModel({
				userSelected: oData.HCP_BNAME + "|" + oData.HCP_EMAIL,
				HCP_BNAME: oData.HCP_BNAME,
				HCP_EMAIL: oData.HCP_EMAIL
			});

			this.getView().setModel(oModelTablePrice, "userLogisticsFormModel");

			var oModelModal = this.getView().getModel("filterPageModel");

			oModelModal.setProperty("/enableCreate", true);
			oModelModal.setProperty("/enableCreateButton", false);
			oModelModal.setProperty("/enableEditButton", true);
			this.arrayEdit = oModelTablePrice;

			this._FragmentPrice.open();

		},

		_openDialogTablePrice: function () {
			if (!this._FragmentPrice) {
				this._FragmentPrice = sap.ui.xmlfragment("tablePriceId" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.masterData.fragments.userLogisticsFragment",
					this);
				this.getView().addDependent(this._FragmentPrice);

			}

			var oModelTablePrice = new sap.ui.model.json.JSONModel({
				HCP_BNAME: "",
				HCP_EMAIL: "",
				HCP_CREATED_BY: this.userName,
				HCP_CREATED_AT: this._formatDate(new Date())
			});

			this.getView().setModel(oModelTablePrice, "userLogisticsFormModel");

			var oModelModal = this.getView().getModel("filterPageModel");
			oModelModal.setProperty("/enableCreateButton", true);
			oModelModal.setProperty("/enableEditButton", false);
			oModelModal.setProperty("/enableCreate", false);

			this._FragmentPrice.open();
		},
		_onDialogTablePricCancelPress: function (oEvent) {

			oEvent.getSource().getParent().close();
		},

		_onDeleteButton: function (oEvent) {

			var oItem = oEvent.getSource();
			var sPlit = oItem.oParent.oParent.oBindingContexts.filterUserLogistics.sPath.split("/");
			var sIndex = sPlit[2];
			var oData = oItem.oParent.oParent.oBindingContexts.filterUserLogistics.oModel.oData.itemUserLogistics[sIndex];
			var oModel = this.getOwnerComponent().getModel();

			MessageBox.information(

				"Deseja Deletar o parâmetro?", {
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					onClose: function (oAction) {

						if (oAction === "YES") {

							var sPath;
							var aDeferredGroups = oModel.getDeferredGroups();

							oModel.setUseBatch(true);

							if (aDeferredGroups.indexOf("removes") < 0) {
								aDeferredGroups.push("removes");
								oModel.setDeferredGroups(aDeferredGroups);
							}

							var oModelTablePrice = new sap.ui.model.json.JSONModel({
								HCP_ID: oData.HCP_ID,
								HCP_BNAME: oData.HCP_BNAME,
								HCP_EMAIL: oData.HCP_EMAIL,
								HCP_CREATED_BY: oData.HCP_CREATED_BY,
								HCP_CREATED_AT: oData.HCP_CREATED_AT
							});

							sPath = this.buildEntityPath("User_Logistics", oModelTablePrice.oData, "HCP_ID");

							console.log(sPath);

							oModel.remove(sPath, {
								groupId: "removes"
							});

							oModel.submitChanges({
								groupId: "removes",
								success: function () {

									MessageBox.success(
										"Parâmetro Deletado com sucesso.", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.closeBusyDialog();
												this.getParameters();
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
												this.getParameters();
											}.bind(this)
										}
									);
								}.bind(this)
							});

						}

					}.bind(this)
				}
			);

			//console.log(oModelTablePrice.oData);

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