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

	var IconTabBarController = MainController.extend(
		"com.sap.build.standard.brfAppDeGraosModoEditar.controller.offerMap.ConsultLogisticsFreight", {

			onInit: function (oEvent) {

				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getTarget("offerMap.ConsultLogisticsFreight").attachDisplay(this.handleRouteMatched, this);
				this.getView().setModel(this.getOwnerComponent().getModel());
				this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			},
			

			handleRouteMatched: function (oEvent) {

				this.getView().setModel(new sap.ui.model.json.JSONModel({
					ItemLogist: [],
					filters: []
				}), "filterTableOffer");

				var oTableModel = this.getView().getModel("filterTableOffer");
				this.getUser().then(function (userName) {
					this.userName = userName;
				}.bind(this));

				if (oEvent.getParameter("data")) {

					var sKeyData = oEvent.getParameter("data").keyData;
					var aKeyData = JSON.parse(sKeyData);

				}

				oTableModel.setProperty("/", aKeyData);

				this._submitFilter();

			},

			getGroupHeader: function (oGroup) {

				return new GroupHeaderListItem({
					title: oGroup.key,
					upperCase: false
				});
			},

			_submitFilter: function () {

				var oModelFilters = this.getView().getModel("filterTableOffer");
				var oData = oModelFilters.oData;

				return new Promise(function (resolve, reject) {

					this.setBusyDialog(this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText(
						"messageFilteringData")));

					this._getOfferMap().then(function () {

						if (oData.ItemLogist.length > 0) {

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
										}
									}.bind(this)
								}
							);
							resolve();
						}

					}.bind(this));

				}.bind(this));

			},

			_getOfferMap: function () {

				return new Promise(function (resolve, reject) {

					var oModelLigistics = this.getOwnerComponent().getModel();
					var oModel = this.getView().getModel("filterTableOffer");
					var oDeviceModel = this.getOwnerComponent().getModel("device");
					var bIsMobile = oDeviceModel.getData().browser.mobile;
					var oData = oModel.oData;
					var aFilters = oData.filters;

					oModel.setProperty("/ItemLogist", []);

					oModelLigistics.read("/Offer_Map", {
						filters: aFilters,
						urlParameters: {
							"$expand": "Offer_Cancellation_Reason,Offer_Account_Groups,Offer_Material,View_Offer_Partner,View_Offer_Prospect"
						},
						success: function (result) {

							if (result.results.length > 0) {

								var oDataItem = oModel.getProperty("/ItemLogist");
								var aResults = result.results;
								var oArrayMatnr = [];
								var oArrayEkgrp = [];
								var oArrayPartner = [];
								var oArrayProspect = [];
								var aFiltersKey = [];

								oModel.setProperty("/count", aResults.length);

								for (var i = 0; i < aResults.length; i++) {

									aFiltersKey.push(new sap.ui.model.Filter({
										path: "HCP_UNIQUE_KEY",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: aResults[i].HCP_UNIQUE_KEY
									}));

									var aData = {
										HCP_UNIQUE_KEY: aResults[i].HCP_UNIQUE_KEY,
										HCP_OFFER_ID: aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"] ? "Registro Offline" : aResults[i].HCP_OFFER_ID,
										HCP_PARTNER: aResults[i].HCP_PARTNER,
										HCP_PARTNER_TYPE: aResults[i].HCP_PARTNER_TYPE,
										HCP_VOLUME: aResults[i].HCP_VOLUME,
										HCP_MATNR: aResults[i].HCP_MATNR,
										MAKTX: " ",
										HCP_EKGRP: aResults[i].HCP_EKGRP,
										EKNAM: " ",
										// HCP_STATES_FREIGHT: aResults[i].HCP_STATES_FREIGHT,
										HCP_CANCEL_REASON: aResults[i].HCP_CANCEL_REASON,
										HCP_CREATED_AT: aResults[i].HCP_CREATED_AT,
										HCP_CREATED_BY: aResults[i].HCP_CREATED_BY,
										HCP_DATE_START: aResults[i].HCP_DATE_START,
										HCP_OTHER_LOCAL: aResults[i].HCP_OTHER_LOCAL,
										HCP_LOCAL: aResults[i].HCP_LOCAL
											// GROUP: aResults[i].HCP_STATES_FREIGHT
											// HCP_DESC: aResults[i].HCP_STATES_OFFER
									};

									// if (aResults[i].HCP_STATES_FREIGHT == "1") {
									// 	aData["HCP_STATES_FREIGHT"] = this.resourceBundle.getText("textOpened");
									// } else if (aResults[i].HCP_STATES_OFFER == "6") {
									// 	aData["HCP_STATES_FREIGHT"] = this.resourceBundle.getText("textFinished");
									// }

									// aData["HCP_DESC"] = aData.HCP_STATES_FREIGHT;

									if (aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"]) {
										aData["@com.sap.vocabularies.Offline.v1.isLocal"] = true;
										aData["__metadata"] = aResults[i].__metadata;
									}

									if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

										aData["MAKTX"] = aResults[i].Offer_Material.MAKTX;
										aData["EKNAM"] = aResults[i].Offer_Account_Groups.EKNAM;

										if (aResults[i].View_Offer_Partner) {
											aData["NAME1"] = aResults[i].View_Offer_Partner.NAME1;
										} else if (aResults[i].View_Offer_Prospect) {
											aData["NAME1"] = aResults[i].View_Offer_Prospect.NAME1;
										} else {
											aData["NAME1"] = "";
										}

									} else {

										oArrayMatnr.push(aData.HCP_MATNR);
										oArrayEkgrp.push(aData.HCP_EKGRP);

										if (aData.HCP_PARTNER_TYPE == "1") { //Fornecedor
											oArrayPartner.push(aData.HCP_PARTNER);
										} else { //Prospect
											oArrayProspect.push(aData.HCP_PARTNER);
										}

									}

									oDataItem.push(aData);

								}

								this.getExpandOffDynamic(oArrayMatnr, oDataItem, "View_Material", "HCP_MATNR", "MATNR", "MAKTX").then(function () {
									this.getExpandOffDynamic(oArrayEkgrp, oDataItem, "View_Account_Groups", "HCP_EKGRP", "EKGRP", "EKNAM").then(function () {
										this.getExpandOffDynamic(oArrayPartner, oDataItem, "View_Grouping_Suppliers", "HCP_PARTNER", "HCP_REGISTER", "NAME1")
											.then(
												function () {
													this.getExpandOffDynamic(oArrayProspect, oDataItem, "Prospects", "HCP_PARTNER", "HCP_PROSP_ID", "NAME1").then(
														function () {

															oModel.setProperty("/ItemLogist", oDataItem);

															this._getWerksOfferMap(aFiltersKey).then(function () {
																resolve();
															}.bind(this));

														}.bind(this));
												}.bind(this));
									}.bind(this));
								}.bind(this));

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
											resolve();
										}.bind(this)
									}
								);
							}

						}.bind(this)
					});

				}.bind(this));

			},

			_getWerksOfferMap: function (aFiltersKey) {

				return new Promise(function (resolve, reject) {

					var oModelOffer = this.getOwnerComponent().getModel();
					var oModel = this.getView().getModel("filterTableOffer");
					var oData = oModel.oData;
					var oQuotationFilter = [];

					//Status de Logistica
					if (oData.status && oData.status != "5") { //Todos
						oQuotationFilter.push(new sap.ui.model.Filter({
							path: 'HCP_STATES_FREIGHT',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.status
						}));
					}

					oQuotationFilter.push(new sap.ui.model.Filter({
						path: 'HCP_QUOTATION_FREIGHT',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: "1" //Cotação de Frete - SIM
					}));

					oModelOffer.read("/Offer_Map_Werks", {

						filters: oQuotationFilter,
						success: function (results) {

							var aResultsCenter = results.results;
							var aValidKeys = [];

							for (var keys of aFiltersKey) {
								var oIsThere = aResultsCenter.filter(result => result.HCP_UNIQUE_KEY === keys.oValue1);

								if (oIsThere.length > 0) {
									for (var corresponding of oIsThere) {
										aValidKeys.push(corresponding);
									}

								}
							}

							var aItemLogist = oModel.oData.ItemLogist;

							var oTextOpened = this.resourceBundle.getText("textOpened");
							var oTextFinished = this.resourceBundle.getText("textFinished");

							var oDataItem = aValidKeys.map(function (aCenter) {
								return Object.assign(aCenter, aItemLogist.reduce(function (acc, aOffer) {

									if (aOffer.HCP_UNIQUE_KEY == aCenter.HCP_UNIQUE_KEY) {
										if (aCenter.HCP_STATES_FREIGHT == '1') {
											aOffer['HCP_DESC'] = oTextOpened;
										} else {
											aOffer['HCP_DESC'] = oTextFinished;
										}
										aOffer['HCP_WERKS'] = aCenter.HCP_WERKS;
										aOffer['WERKS_BLAND'] = aCenter.HCP_BLAND;

										return aOffer;
									} else {
										if (aCenter.HCP_STATES_FREIGHT == '1') {
											acc['HCP_DESC'] = oTextOpened;
										} else {
											acc['HCP_DESC'] = oTextFinished;
										}
										acc['HCP_WERKS'] = aCenter.HCP_WERKS;
										aOffer['WERKS_BLAND'] = aCenter.HCP_BLAND;
										return acc;
									}
								}));
							});

							var aPromises = [];
							var oDataItemResult = [];

							for (var item of oDataItem) {

								aPromises.push(new Promise(function (resolve1, reject1) {
									this.getCenterName(item).then(function (dataResult) {
										oDataItemResult.push(dataResult);
										resolve1();
									}.bind(this)).catch(function (error) {
										console.log(error);
										reject1();
									}.bind(this));
								}.bind(this)));
							}

							Promise.all(aPromises).then(data => {

								oModel.setProperty("/ItemLogist", oDataItemResult);
								oModel.setProperty("/count", oDataItemResult.length);
								resolve();

							}).catch(error => {
								console.log(error);
							});

						}.bind(this),
						error: function (error) {
							reject(error);
						}
					});

					// } else {

					// 	var oLenght = oData.ItemLogist.length;
					// 	resolve(oLenght);
					// }
				}.bind(this));

			},

			buildEntityPath: function (sEntityName, oEntity) {

				if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
					var aUri = oEntity.__metadata.uri.split("/");
					return "/" + aUri[aUri.length - 1];
				} else {
					return "/" + sEntityName + "(" + oEntity.HCP_OFFER_ID + "l)";
				}
			},

			_onRowPress: function (oEvent) {

				var oItem = oEvent.getSource();
				var sPath = oItem.oBindingContexts.filterTableOffer.sPath;
				var sPlit = oItem.oBindingContexts.filterTableOffer.sPath.split("/");
				var sIndex = sPlit[2];
				var oData = oItem.oBindingContexts.filterTableOffer.oModel.oData.ItemLogist[sIndex];

				sPath = this.buildEntityPath("Offer_Map", oData);

				this.oRouter.navTo("offerMap.Edit", {
					keyData: encodeURIComponent(sPath),
					option: encodeURIComponent("Freight")
				});
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

				if (this.SortDialog) {
					this.SortDialog.close();
				}

			},

			refreshData: function () {
				var oModel = this.getOwnerComponent().getModel();
				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;
				var aRefreshView = ["Offer_Map", "Offer_Map_Werks"];

				this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText("messageLoadingPleaseWait"));

				setTimeout(function () {
					if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
						oModel.read("/Offer_Map", {
							success: function (oResults) {
								this.flushStore("Offer_Map,Offer_Map_Werks").then(function () {
									this.refreshStore(aRefreshView).then(function () {
										var oTableModel = this.getView().getModel("filterTableOffer");
										oTableModel.setProperty("/ItemLogist", []);
										this._submitFilter().then(function () {
											this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText(
												"messageLoadingPleaseWait"));
											this.getView().getModel().refresh(true);
											this.closeBusyDialog();
										}.bind(this), 1000);
									}.bind(this));
								}.bind(this));
							}.bind(this)
						});
					} else {
						var oTableModel = this.getView().getModel("filterTableOffer");
						oTableModel.setProperty("/ItemOffeMap", []);
						this._submitFilter().then(function () {
							this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText(
								"messageLoadingPleaseWait"));
							this.getView().getModel().refresh(true);
							this.closeBusyDialog();
						}.bind(this), 1000);
					}

				}.bind(this), 1000);
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

				if (!this.SortDialog) {
					this.SortDialog = sap.ui.xmlfragment("sortDialogLogisticID" + this.getView().getId(),
						"com.sap.build.standard.brfAppDeGraosModoEditar.view.offerMap.fragments.SortDialog",
						this);

					this.getView().addDependent(this.SortDialog);
				}

				this.SortDialog.openBy(oEvent.getSource());
			},

			submitSortList: function (oEvent) {

				var oSelectedColumn = sap.ui.core.Fragment.byId("sortDialogLogisticID" + this.getView().getId(), "group_column").getSelectedButton()
					.getId();
				var oSelectedSort = sap.ui.core.Fragment.byId("sortDialogLogisticID" + this.getView().getId(), "group_sort").getSelectedButton().getId();

				oSelectedColumn = oSelectedColumn.split("ConsultLogisticsFreight--");
				oSelectedSort = oSelectedSort.split("ConsultLogisticsFreight--");

				var oSorter = [];

				if (oSelectedColumn[1] !== 'HCP_DESC') {

					oSorter.push(new sap.ui.model.Sorter({
						path: 'HCP_DESC',
						descending: oSelectedSort[1] === "descending" ? true : false,
						group: true,
						upperCase: false
					}));

				}

				oSorter.push(new sap.ui.model.Sorter({
					path: oSelectedColumn[1],
					descending: oSelectedSort[1] === "descending" ? true : false,
					group: true,
					upperCase: false
				}));

				var oTable = this.getView().byId("table");

				oTable.getBinding("items").sort(oSorter);

				this.SortDialog.close();
			},

			_onCancelOfferButton: function (oEvent) {

				var oItem = oEvent.getSource();
				var sPlit = oItem.oParent.oBindingContexts.filterTableOffer.sPath.split("/");
				var sIndex = sPlit[2];
				var oData = oItem.oParent.oBindingContexts.filterTableOffer.oModel.oData.ItemLogist[sIndex];

				this.sPath = this.buildEntityPath("Offer_Map", oData);

				if (!this._FragmentCancelReason) {
					this._FragmentCancelReason = sap.ui.xmlfragment(
						"com.sap.build.standard.brfAppDeGraosModoEditar.view.offerMap.fragments.OfferCancelReason",
						this);

					var oModelCancel = new JSONModel({
						HCP_CANCEL_REASON: ""
					});

					this.getView().setModel(oModelCancel, "offerMapCancelFormModel");
					this.getView().addDependent(this._FragmentCancelReason);

				}

				this._FragmentCancelReason.open();

			},
			getCenterName: function (center) {

				return new Promise(function (resolve, reject) {

					var oModel = this.getView().getModel();
					var aFilters = [];
					aFilters.push(new sap.ui.model.Filter({
						path: 'WERKS',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: center.HCP_WERKS
					}));

					oModel.read("/View_Center", {
						filters: aFilters,
						success: function (result) {
							var oCenterInfo = result.results;
							if (oCenterInfo.length > 0) {

								center.WERKS_NAME1 = oCenterInfo[0].NAME1;
								center.WERKS_DESTINATION = oCenterInfo[0].ORT01;

								this.getSupplierInfo(center).then(function (ORT01) {
									center.SUPLLIER_ORT01 = ORT01;
									resolve(center);
								}.bind(this));
							}

						}.bind(this),
						error: function (err) {
							sap.m.MessageToast.show("Falha ao Buscar Centros.");
							reject(err);
						}
					});
				}.bind(this));
			},
			getSupplierInfo: function (oItem) {

				return new Promise(function (resolve, reject) {

					var oModel = this.getView().getModel();
					//	var oModel = this.getView().getModel("filterTableOffer");
					//	var oData = oModel.oData;
					var aFilters = [];

					if (oItem.HCP_LOCAL) {
						aFilters.push(new sap.ui.model.Filter({
							path: "LIFNR",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oItem.HCP_LOCAL
						}));

						oModel.read("/View_Suppliers", {

							filters: aFilters,
							success: function (results) {

								var aResults = results.results;

								if (aResults.length > 0) {

									//oItem.SUPLLIER_ORT01 = aResults.ORT01;

									resolve(aResults[0].ORT01);

								} else {
									resolve();
								}

							}.bind(this),
							error: function (error) {
								reject();
							}
						});

					} else {
						resolve();
					}

				}.bind(this));

			}

		});

	return IconTabBarController;

});