sap.ui.define([
	'jquery.sap.global',
	'sap/m/GroupHeaderListItem',
	'com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController',
	'sap/ui/model/json/JSONModel',
	'sap/m/Menu',
	'sap/m/MenuItem',
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (jQuery, GroupHeaderListItem, MainController, JSONModel, Menu, MenuItem, History, MessageBox) {
	"use strict";

	var IconTabBarController = MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.commodities.Consult", {

		onInit: function (oEvent) {

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("commodities.Consult").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		handleRouteMatched: function (oEvent) {

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				itemCommodities: [],
				itemMessages: [],
				itemCadence: []
			}), "filterTableCommodities");

			var oTableModel = this.getView().getModel("filterTableCommodities");
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			if (oEvent.getParameter("data")) {

				var sKeyData = oEvent.getParameter("data").keyData;
				var aKeyData = JSON.parse(sKeyData);

			}

			oTableModel.setProperty("/", aKeyData);

			this._submitFilterCommodities();

		},

		getGroupHeader: function (oGroup) {

			return new GroupHeaderListItem({
				title: this.resourceBundle.getText("labelPlant") + ": " + oGroup.key,
				upperCase: false
			});
		},

		backToIndex: function () {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("commodities.Index", true);
		},

		backToIndex2: function () {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Index", true);
		},

		_submitFilterCommodities: function () {

			var oModelFilters = this.getView().getModel("filterTableCommodities");
			var oData = oModelFilters.oData;

			return new Promise(function (resolve, reject) {

				this.setBusyDialog(this.resourceBundle.getText("messageFilteringData"));

				this._getCommodities().then(function () {

					if (oData.itemCommodities.length > 0) {

						this.closeBusyDialog();
						resolve();

					} else {
						sap.m.MessageBox.show(
							this.resourceBundle.getText("erroDataNotFounded"), {
								title: this.resourceBundle.getText("messageWarning"),
								icon: sap.m.MessageBox.Icon.WARNING,
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (oAction) {
									if (oAction === "OK") {
										this.closeBusyDialog();
										this.backToIndex();
									}
								}.bind(this)
							}
						);
						resolve();
					}

				}.bind(this));

			}.bind(this));

		},

		_getCommodities: function () {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getOwnerComponent().getModel();
				var oModel = this.getView().getModel("filterTableCommodities");
				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;
				var oData = oModel.oData;
				var aFilters = oData.filters;
				var oEntity = "/" + oData.entity;
				var oExpand = "Fixed_Account_Groups,Fixed_Material,Fixed_Partner,Commodities_Log_Messages_Association";

				oModel.setProperty("/itemCommodities", []);

				if (oData.entity != "Commodities_Fixed_Order") {
					oExpand = "Order_Account_Groups,Order_Material,Order_Partner";
				}

				oModelOffer.read(oEntity, {
					filters: aFilters,
					urlParameters: {
						"$expand": oExpand
					},

					success: function (results) {
						var oDataItem = oModel.getProperty("/itemCommodities");
						var aResults = results.results;
						var aFiltersKey = [];
						var oArrayMatnr = [];
						var oArrayEkgrp = [];
						var oArrayLifnr = [];
						var isCancel;
						var sTextSequence;
						let listConvertSacasToTon = [];
						let listConvertKgToTon = [];
						let listTons = [];

						if (aResults.length > 0) {

							for (var i = 0; i < aResults.length; i++) {

								if (aResults[i].HCP_STATUS == "0" || aResults[i].HCP_STATUS == "1") { //Pendente
									var aStatus = this.resourceBundle.getText("placeSelectPending");
									isCancel = true;
								} else if (aResults[i].HCP_STATUS == "2") { //Processado
									aStatus = this.resourceBundle.getText("placeSelectprocessed");
								} else {
									aStatus = this.resourceBundle.getText("placeSelectCanceled");
									isCancel = false;
									sTextSequence = 'N/A';
								}
								
								let cndIsExceeded = false;
								let getMsgnr = aResults[i].Commodities_Log_Messages_Association?.results.find((commodities) => commodities.HCP_MSGNR == "860");
								
								if (getMsgnr)
									cndIsExceeded = true;
								else
									cndIsExceeded = false;

								// ///Verificar se existe cadência
								var aButtonCadence = true;

								var aData = {
									HCP_UNIQUE_KEY: aResults[i].HCP_UNIQUE_KEY,
									HCP_OFFER_NUMBER: aResults[i].HCP_OFFER_NUMBER,
									HCP_LIFNR: aResults[i].HCP_LIFNR,
									NAME1: "",
									HCP_MATNR: aResults[i].HCP_MATNR,
									MAKTX: "",
									HCP_WERKS: aResults[i].HCP_WERKS,
									HCP_EKGRP: aResults[i].HCP_EKGRP,
									EKNAM: "",
									HCP_STATUS: aResults[i].HCP_STATUS,
									TEXT_STATUS: aStatus,
									isCancel: isCancel,
									enabledCadence: aButtonCadence,
									HCP_CREATED_AT: aResults[i].HCP_CREATED_AT,
									HCP_CREATED_BY: aResults[i].HCP_CREATED_BY
								};

								if (!aResults[i]["HCP_TIPO"]) { //Fixo
									aData["HCP_TIPO"] = "1";
									aData["HCP_ZSEQUE"] = !aResults[i].HCP_ZSEQUE === false ? parseFloat(aResults[i].HCP_ZSEQUE) : null;
									aData["HCP_PURCHASE_ID"] = aResults[i].HCP_PURCHASE_ID;
									aData["HCP_ZDTREMDE"] = aResults[i].HCP_ZDTREMDE;
									aData["HCP_ZDTREMATE"] = aResults[i].HCP_ZDTREMATE;
								} else { //Depósito ou Transferência
									aData["HCP_TIPO"] = aResults[i].HCP_TIPO;
									aData["HCP_ZSEQUE"] = !aResults[i].HCP_PEDIDO_DEP === false ? parseFloat(aResults[i].HCP_PEDIDO_DEP) : null;
									aData["HCP_PURCHASE_ID"] = aResults[i].HCP_ORDER_ID;
									aData["HCP_ZDTREMDE"] = aResults[i].HCP_DT_ENTR_INI;
									aData["HCP_ZDTREMATE"] = aResults[i].HCP_DT_ENTR_FIM;
								}

								if (aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"]) {
									aData["@com.sap.vocabularies.Offline.v1.isLocal"] = true;
									aData["__metadata"] = aResults[i].__metadata;
								}

								if (aResults[i].HCP_STATUS == "3") { //Cancelado
									aStatus = this.resourceBundle.getText("placeSelectprocessed");
									aData["HCP_ZSEQUE"] = sTextSequence;
								}

								if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

									if (!aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"]) {
										if (aData.HCP_TIPO == "1") { //Fixo
											aData["MAKTX"] = aResults[i].Fixed_Material ? aResults[i]?.Fixed_Material?.MAKTX : "N/A";
											aData["EKNAM"] = aResults[i].Fixed_Account_Groups ? aResults[i]?.Fixed_Account_Groups?.EKNAM : "N/A";
											aData["NAME1"] = aResults[i].Fixed_Partner ? aResults[i]?.Fixed_Partner?.results[0]?.NAME1 : "N/A";
										} else {
											aData["MAKTX"] = aResults[i].Order_Material ? aResults[i]?.Order_Material?.MAKTX : "N/A";
											aData["EKNAM"] = aResults[i].Order_Account_Groups ? aResults[i]?.Order_Account_Groups?.EKNAM : "N/A";
											aData["NAME1"] = aResults[i].Order_Partner ? aResults[i]?.Order_Partner?.results[0]?.NAME1 : "N/A";
										}
									}

								} else {
									oArrayMatnr.push(aResults[i].HCP_MATNR);
									oArrayEkgrp.push(aResults[i].HCP_EKGRP);
									oArrayLifnr.push(aResults[i].HCP_LIFNR);
								}
								
								// cndIsRequired.map((obj) => {
								// 	if (aResults[i].Fixed_Partner.NAME1 == obj.NAME1)
								// 		aData["cndIsRequired"] = obj.CND_IS_REQUIRED
								// })
								
								aData["cndIsExceeded"] = cndIsExceeded;

								oDataItem.push(aData);
							}
							var aTextOrder = this.resourceBundle.getText("textOriginalOrder");

							//Tipo de Pedido
							if (aData.HCP_TIPO == "1") { //Pedido Fixo
								var aTextOrderType = this.resourceBundle.getText("optionBuyFixedPrice");
								aTextOrder = this.resourceBundle.getText("textSequence");
							} else if (aData.HCP_TIPO == "2") { //Pedido Depósito
								aTextOrderType = this.resourceBundle.getText("optionBuyDepositi");
							} else { //Transferência
								aTextOrderType = this.resourceBundle.getText("optionTransfer");
							}

							oModel.setProperty("/textOrderType", aTextOrderType);
							oModel.setProperty("/textOrder", aTextOrder);

							this.getExpandOffDynamic(oArrayMatnr, oDataItem, "View_Material", "HCP_MATNR", "MATNR", "MAKTX").then(function () {
								this.getExpandOffDynamic(oArrayEkgrp, oDataItem, "View_Account_Groups", "HCP_EKGRP", "EKGRP", "EKNAM").then(function () {
									this.getExpandOffDynamic(oArrayLifnr, oDataItem, "View_Suppliers", "HCP_LIFNR", "LIFNR", "NAME1").then(function () {

										oModel.setProperty("/itemCommodities", oDataItem);
										oModel.setProperty("/count", oDataItem.length);

										resolve();
									}.bind(this));
								}.bind(this));
							}.bind(this));

						} else {
							var oTableModel = this.getView().getModel("filterTableCommodities");
							oTableModel.setProperty("/itemCommodities", []);
							oTableModel.setProperty("/count", 0);
							this.closeBusyDialog();
							this.backToIndex2();
							reject();
						}

					}.bind(this),
					error: function (error) {
						reject();
					}
				});

			}.bind(this));

		},

		buildEntityPath: function (sEntityName, oEntity) {

			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity["HCP_PURCHASE_ID"] + "l)";
			}
		},
		buildEntityHistoricPath: function (sEntityName, oEntity) {

			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity["HCP_HISTORIC_ID"] + "l)";
			}
		},

		_onRowPress: function (oEvent) {

			var oItem = oEvent.getSource();
			var sPath = oItem.oBindingContexts.filterTableCommodities.sPath;
			var sPlit = oItem.oBindingContexts.filterTableCommodities.sPath.split("/");
			var sIndex = sPlit[2];
			var oData = oItem.oBindingContexts.filterTableCommodities.oModel.oData.itemCommodities[sIndex];
			var oModel = this.getView().getModel("filterTableCommodities");
			var oDataCommodities = oModel.oData;
			var oEntity = oDataCommodities.entity;

			//Tipo de Pedido
			if (oDataCommodities.entity == "Commodities_Fixed_Order") { //Pedido Fixo
				var oView = "commodities.EditFixedOrder";
			} else { //Pedido Depósito/Transferência
				oView = "commodities.EditDepositTransf";
			}

			sPath = this.buildEntityPath(oEntity, oData);

			this.oRouter.navTo(oView, {
				keyData: encodeURIComponent(sPath)
			});
			//	this.oRouter.getTargets().display(oView, {
			//		keyData: encodeURIComponent(sPath)
			//	});
		},

		onCancelPress: function () {
			this.navBack();
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

			this.SortDialogCommodities.close();

		},

		refreshData: function () {
			var oModel = this.getOwnerComponent().getModel();
			var oTableModel = this.getView().getModel("filterTableCommodities");
			var oData = oTableModel.oData;
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var aRefreshView = ["Offer_Map", "Offer_Map_Werks", "Commodities_Fixed_Order", "Commodities_Log_Messages", "Commodities_Order",
				"Cadence"
			];
			var oEntity = "/" + oData.entity;

			setTimeout(function () {
				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
					oModel.read(oEntity, {
						success: function (oResults) {
							this.submitDatesPending().then(function () {
								this.flushStore(
									"Offer_Map, Offer_Map_Werks, Commodities_Fixed_Order, Commodities_Log_Messages, Commodities_Order, Cadence").then(
									function () {
										this.refreshStore(aRefreshView).then(function () {
											var oTableModel = this.getView().getModel("filterTableCommodities");
											oTableModel.setProperty("/itemCommodities", []);
											this._submitFilterCommodities().then(function () {
												this.setBusyDialog(this.resourceBundle.getText("messageLoadingPleaseWait"));
												this.getView().getModel().refresh(true);
												//this.getView().byId("pullToRefreshID").hide();
												this.closeBusyDialog();
											}.bind(this), 1000);
										}.bind(this));
									}.bind(this));
							}.bind(this));
						}.bind(this)
					});
				} else {
					var oTableModel = this.getView().getModel("filterTableCommodities");
					oTableModel.setProperty("/itemCommodities", []);
					this._submitFilterCommodities().then(function () {
						this.setBusyDialog(this.resourceBundle.getText("messageLoadingPleaseWait"));
						this.getView().getModel().refresh(true);
						//this.getView().byId("pullToRefreshID").hide();
						this.closeBusyDialog();
					}.bind(this), 1000);
				}

			}.bind(this), 1000);
		},

		submitDatesPending: function () {

			return new Promise(function (resolve, reject) {

				var oSucess;

				this.submitCommoditiesEcc(null, "1").then(function (oSucess) { //Fixo
					this.submitCommoditiesEcc(null, null).then(function (oSucess) { //Depósito e Transferência
						resolve();
					}.bind(this));
				}.bind(this));

			}.bind(this));
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

		sortButtonPressed: function (oEvent) {

			if (!this.SortDialogCommodities) {
				this.SortDialogCommodities = sap.ui.xmlfragment("sortDialogID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.commodities.fragments.SortDialog",
					this);

				this.getView().addDependent(this.SortDialogCommodities);
			}

			this.SortDialogCommodities.openBy(oEvent.getSource());
		},

		submitSortList: function (oEvent) {

			var oSelectedColumn = sap.ui.core.Fragment.byId("sortDialogID" + this.getView().getId(), "group_column").getSelectedButton().getId();
			var oSelectedSort = sap.ui.core.Fragment.byId("sortDialogID" + this.getView().getId(), "group_sort").getSelectedButton().getId();

			oSelectedColumn = oSelectedColumn.split("Consult--");
			oSelectedSort = oSelectedSort.split("Consult--");

			var oSorter = [];

			oSorter.push(new sap.ui.model.Sorter({
				path: 'HCP_WERKS',
				descending: oSelectedSort[1] === "descending" ? true : false,
				group: true,
				upperCase: false
			}));

			oSorter.push(new sap.ui.model.Sorter({
				path: oSelectedColumn[1],
				descending: oSelectedSort[1] === "descending" ? true : false,
				// group: true,
				upperCase: false
			}));

			var oTable = this.getView().byId("table");

			oTable.getBinding("items").sort(oSorter);

			this.SortDialogCommodities.close();
		},

		_onCadenceButton: function (oEvent) {
			var oTableModel = this.getView().getModel("filterTableCommodities");
			var oDataTable = oTableModel.oData;
			var oEntity = oDataTable.entity;
			var oItem = oEvent.getSource();
			var sPlit = oItem.oParent.oBindingContexts.filterTableCommodities.sPath.split("/");
			var sIndex = sPlit[2];
			var oData = oItem.oParent.oBindingContexts.filterTableCommodities.oModel.oData.itemCommodities[sIndex];

			var _FragmentCadence;
			var viewFragment = this.getView();
			var thisFragment = this;

			this.getCadence(oData.HCP_UNIQUE_KEY).then(function () {
				var timestamp = new Date().getTime();
				var oDataItem = oTableModel.getProperty("/itemCadence");

				if (!_FragmentCadence) {
					_FragmentCadence = sap.ui.xmlfragment("cadenceNewOrderId" + viewFragment.getId() + timestamp,
						"com.sap.build.standard.brfAppDeGraosModoEditar.view.cadence.fragment.ModalCadence",
						thisFragment);
					viewFragment.addDependent(_FragmentCadence);

				}

				var oCopiedData = JSON.parse(JSON.stringify(oDataItem));

				for (var data of oCopiedData) {
					data.HCP_DATA_ATUAL = new Date(data.HCP_DATA_ATUAL);
				}

				if (oData.HCP_MENGE_PED_DEP) {
					thisFragment.total = oData.HCP_MENGE_PED_DEP;
					thisFragment.enableCalcule = true;
				} else {
					thisFragment.total = 0;
					thisFragment.enableCalcule = false;
				}

				var oModelCadence = new JSONModel({
					enabledConfCadence: false,
					tableCadence: oCopiedData,
					enableHeader: false,
					enableColumn: false,
					maxValue: false,
					minValue: false,
					valorTotal: parseFloat(thisFragment.total).toFixed(),
					ItemCadence: oCopiedData,
					isSelected: false,
					count: oCopiedData.length,
					enableAction: false,
					modeSelect: "None"
				});

				viewFragment.setModel(oModelCadence, "cadenceFormModel");

				_FragmentCadence.open();

				oTableModel.refresh();

			});
		},
		_onCadenceConfirPress: function (oEvent) {

			var oCancelModel = this.getView().getModel("cadenceFormModel");
			var oData = oCancelModel.oData;

			oCancelModel.setProperty("/enabledConfCadence", false);

			for (var i = 0; i < oData.tableCadence.length; i++) {

				oData.tableCadence[i].HCP_QUANTIDADE = null;
			}

			oEvent.getSource().getParent().close();
		},
		_onCadenceCancelPress: function (oEvent) {

			var oCancelModel = this.getView().getModel("cadenceFormModel");
			var oData = oCancelModel.oData;

			oCancelModel.setProperty("/enabledConfCadence", false);

			for (var i = 0; i < oData.tableCadence.length; i++) {

				oData.tableCadence[i].HCP_QUANTIDADE = null;
			}

			oEvent.getSource().getParent().close();
		},
		_onMessageButton: function (oEvent) {

			var oTableModel = this.getView().getModel("filterTableCommodities");
			var oDataTable = oTableModel.oData;
			var oEntity = oDataTable.entity;
			var oItem = oEvent.getSource();
			var sPlit = oItem.oParent.oBindingContexts.filterTableCommodities.sPath.split("/");
			var sIndex = sPlit[2];
			var oData = oItem.oParent.oBindingContexts.filterTableCommodities.oModel.oData.itemCommodities[sIndex];

			this.sPath = this.buildEntityPath(oEntity, oData);

			this.getMessageEcc(oData.HCP_UNIQUE_KEY).then(function () {

				if (oDataTable.itemMessages.length > 0) {

					if (!this._FragmentMessageLog) {
						this._FragmentMessageLog = sap.ui.xmlfragment("messageID" + this.getView().getId(),
							"com.sap.build.standard.brfAppDeGraosModoEditar.view.commodities.fragments.LogMessage",
							this);

						this.getView().addDependent(this._FragmentMessageLog);
					}

					var oModelMessageLog = new JSONModel({
						tableMessage: oDataTable.itemMessages
					});

					this.getView().setModel(oModelMessageLog, "messageLogFormModel");

					this._FragmentMessageLog.open();
				}

			}.bind(this));

		},
		getCadence: function (oUniqueKey) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel("filterTableCommodities");
				var oModelCommodities = this.getView().getModel();
				var aFilters = [];

				oModel.setProperty("/itemCadence", []);

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oUniqueKey
				}));

				oModelCommodities.read("/Cadence", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;
						var oDataItem = oModel.getProperty("/itemCadence");

						if (aResults.length) {
							oModel.setProperty("/itemCadence", aResults);
							oModel.refresh();
							resolve();

						} else {
							MessageBox.information(
								this.resourceBundle.getText("messageNotMessage"), {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										resolve();
									}.bind(this)
								}
							);

						}

					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));

		},

		getMessageEcc: function (oUniqueKey) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel("filterTableCommodities");
				var oModelCommodities = this.getView().getModel();
				var aFilters = [];

				oModel.setProperty("/itemMessages", []);

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oUniqueKey
				}));

				oModelCommodities.read("/Commodities_Log_Messages", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;
						var oDataItem = oModel.getProperty("/itemMessages");

						if (aResults.length) {

							for (var i = 0; i < aResults.length; i++) {

								if (aResults[i].HCP_MSGTYP == "S") {
									var aIcon = "sap-icon://message-success";
								} else if (aResults[i].hcpMstyp == "E") {
									aIcon = "sap-icon://message-error";
								} else {
									aIcon = "sap-icon://message-information";
								}

								var aData = {
									HCP_MSGTYP: aResults[i].HCP_MSGTYP,
									ICON: aIcon,
									HCP_MESSAGE: aResults[i].HCP_MESSAGE
								};

								oDataItem.push(aData);

							}

							oModel.setProperty("/itemMessages", oDataItem);
							resolve();

						} else {
							MessageBox.information(
								this.resourceBundle.getText("messageNotMessage"), {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										resolve();
									}.bind(this)
								}
							);

						}

					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));

		},
		_onCancelButton: function (oEvent) {

			var oTableModel = this.getView().getModel("filterTableCommodities");
			var oDataTable = oTableModel.oData;
			var oEntity = oDataTable.entity;
			var oItem = oEvent.getSource();
			var sPlit = oItem.oParent.oBindingContexts.filterTableCommodities.sPath.split("/");
			var sIndex = sPlit[2];
			var oData = oItem.oParent.oBindingContexts.filterTableCommodities.oModel.oData.itemCommodities[sIndex];
			var oModel = this.getOwnerComponent().getModel();
			this.sPath = this.buildEntityPath(oEntity, oData);
			var aDeferredGroups = oModel.getDeferredGroups();
			oModel.setUseBatch(true);

			if (aDeferredGroups.indexOf("removes") < 0) {
				aDeferredGroups.push("removes");
				oModel.setDeferredGroups(aDeferredGroups);
			}

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if (oData.HCP_ZSEQUE) {
				MessageBox.warning(

					"Não é possivel cancelar um pedido com sequencial.", {
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function (oAction) {

						}.bind(this)
					}
				);
			} else {

				MessageBox.information(

					"Deseja cancelar a compra?", {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						onClose: function (oAction) {

							if (oAction === "YES") {

								this.verifyQuantityByUniqueKeyOfferMap(oData.HCP_UNIQUE_KEY).then(function () {

									this.count = 0;
									this.revertCount = 30;
									this.timeOut = 30;
									this.hasFinished = false;
									this.message = "Enviando dados, por favor aguarde (";

									var aData = {
										HCP_UNIQUE_KEY: oData.HCP_UNIQUE_KEY,
										HCP_STATUS: '3',
										HCP_UPDATED_BY: this.userName,
										HCP_UPDATED_AT: new Date()
									};

									oModel.update(this.sPath, aData, {
										groupId: "changes"
									});

									this.verifyTimeOut(true);
									if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
										oModel.submitChanges({
											groupId: "changes",
											success: function () {
												this.flushStore("Commodities_Fixed_Order,Cadence,Commodities_Historic_Offer").then(function () {
													this.refreshStore("Commodities_Fixed_Order", "Cadence", "Commodities_Historic_Offer", "Commodities_Check").then(
														function () {

															this.hasFinished = true;

															if (bIsMobile) {
																localStorage.setItem("lastUpdateCommodities", new Date());
																localStorage.setItem("countStorageCommodities", 0);
															}

															this.hasFinished = true;
															var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
															var sMessage = "A compra foi cancelada com sucesso!";

															MessageBox.success(
																sMessage, {
																	actions: [sap.m.MessageBox.Action.OK],
																	styleClass: bCompact ? "sapUiSizeCompact" : "",
																	onClose: function (sAction) {
																		if (sAction === "OK") {
																			oTableModel = this.getView().getModel("filterTableCommodities");

																			if (oTableModel.oData.itemCommodities.length < 1) {
																				oTableModel.setProperty("/itemCommodities", []);
																				oTableModel.setProperty("/count", 0);
																			} else {
																				oTableModel.setProperty("/itemCommodities", []);
																				this._submitFilterCommodities().then(function () {
																					this.setBusyDialog(this.resourceBundle.getText("messageLoadingPleaseWait"));
																					this.getView().getModel().refresh(true);
																					//this.getView().byId("pullToRefreshID").hide();
																					this.closeBusyDialog();
																				}.bind(this), 1000);
																			}

																		}
																	}.bind(this)
																});

														}.bind(this));
												}.bind(this));
											}.bind(this),
											error: function () {
												this.hasFinished = true;
												MessageBox.error(
													"Ocorreu um erro", {
														actions: [sap.m.MessageBox.Action.OK],
														onClose: function (sAction) {
															//this.closeBusyDialog();
															this.navBack();
														}.bind(this)
													}
												);
											}.bind(this)
										});
									} else {
										oModel.submitChanges({
											groupId: "changes",
											success: function () {
												this.hasFinished = true;

												var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
												var sMessage = "A compra foi cancelada com sucesso!";

												MessageBox.success(
													sMessage, {
														actions: [sap.m.MessageBox.Action.OK],
														styleClass: bCompact ? "sapUiSizeCompact" : "",
														onClose: function (sAction) {
															if (sAction === "OK") {
																var oTableModel = this.getView().getModel("filterTableCommodities");
																oTableModel.setProperty("/itemCommodities", []);
																this._submitFilterCommodities().then(function () {
																	this.setBusyDialog(this.resourceBundle.getText("messageLoadingPleaseWait"));
																	this.getView().getModel().refresh(true);
																	//this.getView().byId("pullToRefreshID").hide();
																	this.closeBusyDialog();
																}.bind(this), 1000);
															}
														}.bind(this)
													}.bind(this));
											}.bind(this),
											error: function () {
												this.hasFinished = true;
												MessageBox.error(
													"Ocorreu um erro.", {
														actions: [sap.m.MessageBox.Action.OK],
														onClose: function (sAction) {
															//	this.closeBusyDialog();
															this.navBack();
														}.bind(this)
													}
												);
											}.bind(this)
										});
									}

								}.bind(this));

							}

						}.bind(this)
					}
				);
			}
		},

		verifyTimeOut: function (isFirstTime) {

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if (isFirstTime) {
				this.setBusyDialog("App Grãos", "Enviando dados, por favor aguarde");

				this.verifyTimeOut();

			} else {
				if (!this.hasFinished) {
					setTimeout(function () {
						this.setBusyDialog("App Grãos", this.message + this.revertCount +
							")");
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
			}

		},

		showMessage: function () {

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			localStorage.setItem("isNeededToReload", true);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("errorPages.timeOutConnection", true);
		},
		verifyQuantityByUniqueKeyOfferMap: function (uniqueKey) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var aFilters = [];
				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_UNIQUE_KEY_ORDER',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: uniqueKey
				}));

				oModel.read("/Commodities_Historic_Offer", {
					filters: aFilters,
					success: function (resultHistoricOffer) {
						var oHistoricOffer = resultHistoricOffer.results;

						if (oHistoricOffer.length > 0) {

							var aData = {
								HCP_MENGE: '0',
								HCP_UPDATED_BY: this.userName,
								HCP_UPDATED_AT: new Date()
							};

							var sPath = this.buildEntityHistoricPath("Commodities_Historic_Offer", oHistoricOffer[0]);

							oModel.update(sPath, aData, {
								groupId: "changes"
							});

							resolve();

						} else {
							resolve();
						}

					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Ofertas.");
						reject(err);
					}
				});
			}.bind(this));
		}

	});

	return IconTabBarController;

});