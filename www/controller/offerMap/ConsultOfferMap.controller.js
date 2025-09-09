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

	var IconTabBarController = MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.offerMap.ConsultOfferMap", {

		onInit: function (oEvent) {

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("offerMap.ConsultOfferMap").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
			var sLocale = sCurrentLocale.split("-");
			var oLocale = new sap.ui.core.Locale(sLocale[0], sLocale[1]);
			this.oNumberFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance(oLocale);

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isVisible: false
			}), "appModelVisible");

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isVisiblePlayers: false
			}), "appModelVisible");

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isVisible: false,
				isVisibleOthers: false
			}), "appModelVisible");

		},

		selectedCombobox: function (oEvent) {
			let selectedItem = oEvent.getSource().getSelectedItem(); 
			let selectedKey = oEvent.getSource().getSelectedKey();
			let selectedText = selectedItem ? selectedItem.getText() : "";
			let oModel = this.getView().getModel("appModelVisible");
			let oModelEnable = this.getView().getModel("offerMapCancelFormModel");
			var oData = oModelEnable.oData;
			
			oModelEnable.setProperty("/HCP_CANCEL_REASON_DESC", "");

			if (selectedKey === '11') {
				oModel.setProperty("/isVisiblePlayers", true);
				oModel.setProperty("/isVisible", false);
				oModelEnable.setProperty("/enabledConfir", false);
				oModel.setProperty("/isVisibleOthers", false);
			} else {
				oModel.setProperty("/isVisibleOthers", false);
				oModel.setProperty("/isVisiblePlayers", false);
				oModel.setProperty("/isVisible", false);
				var oCancelModel = this.getView().getModel("offerMapCancelFormModel");
				oCancelModel.setProperty("/HCP_PLAYERS", null);
				if (oData.HCP_CANCEL_REASON.length > 0) {
					oModelEnable.setProperty("/enabledConfir", true);
				} else {
					oModelEnable.setProperty("/enabledConfir", false);
					return;
				}
			}
			
			if (selectedText == "outros") {
				oModel.setProperty("/isVisibleOthers", true);
				oModelEnable.setProperty("/enabledConfir", false);
			}

		},

		validateComboboxPlayer: function (oEvent) {

			let selectedItem = oEvent.getSource().getSelectedKey();
			let oModel = this.getView().getModel("appModelVisible");
			var oCancelModel = this.getView().getModel("offerMapCancelFormModel");
			oCancelModel.setProperty("/HCP_CROP", null);
			oCancelModel.setProperty("/HCP_STATE", null);
			oCancelModel.setProperty("/HCP_REGIO", null);

			if (selectedItem !== "") {
				oModel.setProperty("/isVisible", true);

			} else {
				oModel.setProperty("/isVisible", false);
				return;
			}

		},

		validateComboboxPlayerOtherFields: function (oEvent) {
			let selectedItem = oEvent.getSource().getSelectedKey();
			let valueText = oEvent.getSource().getValue();
			let oModelCancel = this.getView().getModel("offerMapCancelFormModel");
			var oInput = oEvent.getSource();
			var oModel = this.getOwnerComponent().getModel();
			var oTable = sap.ui.core.Fragment.byId("cancelReasonFilterID" + this.getView().getId(), "region");
			var oFilters = [];

			var oData = oModelCancel.oData;
			if (selectedItem !== "" || valueText) {
				if (oData.HCP_CANCEL_REASON_DESC !== "" && oData.HCP_CROP !== null && oData.HCP_STATE !== null && oData.HCP_REGIO !== null && oData.HCP_STATE !== undefined && oData.HCP_REGIO !==
					undefined) {
					oModelCancel.setProperty("/enabledConfir", true);
				}
				
				if (oData.HCP_CANCEL_REASON_DESC !== "") {
					oModelCancel.setProperty("/enabledConfir", true);
				}
				
				if(oData.HCP_CANCEL_REASON == "11"){
					if (oData.HCP_CROP !== null && oData.HCP_STATE !== null && oData.HCP_REGIO !== null && oData.HCP_STATE !== undefined && oData.HCP_REGIO !==
					undefined) {
						oModelCancel.setProperty("/enabledConfir", true);
					}
				}

			} else {
				oModelCancel.setProperty("/enabledConfir", false);
				return;
			}

			var oFilterModel = this.getView().getModel("offerMapCancelFormModel");
			oFilterModel.setProperty("/regio", null);
			oFilterModel.setProperty("/enableRegion", false);

			if (oInput.getSelectedKey() !== '') {

				if (this.checkIfRegioIsInUserProfile(oInput.getSelectedKey())) {
					oFilters.push(new sap.ui.model.Filter("HCP_BLAND", sap.ui.model.FilterOperator.Contains, oInput.getSelectedKey()));

					oModel.read("/Regions", {
						filters: oFilters,
						success: function (oData) {
							if (oData.results.length > 0) {
								oTable.getBinding("items").filter(oFilters);
								oFilterModel.setProperty("/enableRegion", true);
								oFilterModel.setProperty("/regio", null);
							} else {
								oFilterModel.setProperty("/enableRegion", false);
								oFilterModel.setProperty("/regio", null);
							}

						}.bind(this),
						error: function () {
							MessageBox.error("Error");
						}
					});
				} else {
					oFilterModel.setProperty("/enableRegion", false);
					oFilterModel.setProperty("/regio", null);

				}

			} else {
				oFilterModel.setProperty("/enableCreateRegioValid", true);

			}

		},

		checkIfRegioIsInUserProfile: function (sRegio) {
			var oProfileModel = this.getView().getModel("profileModel");
			var oFilterModel = this.getView().getModel("offerMapCancelFormModel");
			var oProfileData = oProfileModel.getData();

			if (sRegio) {
				if (oProfileData.werks.filter(werks => werks.REGIO == sRegio || werks.VALOR == '*').length > 0 || oProfileData.fullAccess) {
					oFilterModel.setProperty("/enableCreateRegioValid", true);
					return true;
				} else {
					oFilterModel.setProperty("/enableCreateRegioValid", false);
					return false;
				}
			} else {
				oFilterModel.setProperty("/enableCreateRegioValid", true);
				return false;
			}

		},

		handleRouteMatched: function (oEvent) {

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				checkTpCompra: false,
				checkMat: false,
				checkActive: false,
				checkPreco: false,
				checkCereal: false,
				ItemOffeMap: [],
				localeId: this.oNumberFormat.oLocale.sLocaleId
			}), "filterTableOffer");

			var oTableModel = this.getView().getModel("filterTableOffer");
			this.getUser().then(function (userName) {
				this.userName = userName;
				this.getUserProfile("View_Profile_Negotiation_Report", this.userName).then(profileData => {
					this.getView().getModel("profileModel").setData(profileData);
				}).catch();
			}.bind(this));

			if (oEvent.getParameter("data")) {

				var sKeyData = oEvent.getParameter("data").keyData;
				var aKeyData = JSON.parse(sKeyData);

			}

			oTableModel.setProperty("/", aKeyData);

			this._getTvarvSap("P", "Z_Z586011_ATIVAR_REGRAS", null, 'checkActive').then(function () {
				this._submitFilterOffer();
			}.bind(this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				create: true,
				edit: true
			}), "profileModel");

		},

		getGroupHeader: function (oGroup) {

			return new GroupHeaderListItem({
				title: this.resourceBundle.getText("labelPlant") + ": " + oGroup.key,
				upperCase: false
			});
		},

		backToIndex: function () {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("offerMap.Index", true);
		},

		_submitFilterOffer: function () {

			var oModelFilters = this.getView().getModel("filterTableOffer");
			var oData = oModelFilters.oData;

			return new Promise(function (resolve, reject) {

				this.setBusyDialog(this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText(
					"messageFilteringData")));

				this._getOfferMap().then(function () {

					if (oData.ItemOffeMap.length > 0) {

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

		_getOfferMap: function () {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getOwnerComponent().getModel();
				var oModel = this.getView().getModel("filterTableOffer");
				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;
				var oData = oModel.oData;
				var aFilters = oData.filters;

				oModel.setProperty("/ItemOffeMap", []);

				//Puxando as informaçoes do hana
				oModelOffer.read("/Offer_Map", {
					filters: aFilters,
					urlParameters: {
						"$expand": "Offer_Account_Groups,Offer_Material,Offer_Partner,Offer_Prospect"
					},
					success: function (results) {

						var oDataItem = oModel.getProperty("/ItemOffeMap");
						var aResults = results.results;
						var aFiltersKey = [];
						var oArrayMatnr = [];
						var oArrayEkgrp = [];

						if (aResults.length > 0) {

							for (var i = 0; i < aResults.length; i++) {

								aFiltersKey.push(new sap.ui.model.Filter({
									path: "HCP_UNIQUE_KEY",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: aResults[i].HCP_UNIQUE_KEY
								}));

								if (aResults[i].HCP_INCOTERM == "1") {
									var aIncoterm = this.resourceBundle.getText("textCIF");
								} else if (aResults[i].HCP_INCOTERM == "2") {
									aIncoterm = this.resourceBundle.getText("textFOB");
								} else if (aResults[i].HCP_INCOTERM == "3") {
									aIncoterm = this.resourceBundle.getText("textCPT");
								}

								var aDataDelivery = aResults[i].HCP_DATE_START;
								// Atendimento chamado 8000035243 - Problema filtro adicionado IF verifica se a oferta possui data de inicio
								if (aDataDelivery) {
									var aYear = aDataDelivery.getFullYear();
									var aMonth = aDataDelivery.getUTCMonth() + 1;
									aDataDelivery = aMonth + "/" + aYear;
								}

								var aButtonCanceloffer = false;

								if (aResults[i].HCP_STATES_OFFER === "3" || aResults[i].HCP_STATES_OFFER === "4") { //Cancelado/Finalizado
									var aButtonPurchaseOffer = false;
								} else {
									aButtonCanceloffer = true;
									if (aResults[i].HCP_PARTNER_TYPE == "1" && (aResults[i].HCP_MODALITY == "1" || aResults[i].HCP_MODALITY == "2")) {
										aButtonPurchaseOffer = true;
									}
								}

								if (typeof (aResults[i]["Offer_Partner"].results[i]) === 'undefined') {
									var aData = {
										HCP_UNIQUE_KEY: aResults[i].HCP_UNIQUE_KEY,
										HCP_OFFER_ID: aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"] ? "Registro Offline" : aResults[i].HCP_OFFER_ID,
										HCP_MATNR: aResults[i].HCP_MATNR,
										MAKTX: "",
										DT_DELIVERY: aDataDelivery,
										HCP_EKGRP: aResults[i].HCP_EKGRP,
										EKNAM: "",
										HCP_INCOTERM: aIncoterm,
										HCP_STATUS: aResults[i].HCP_STATES_OFFER,
										cancelOffer: aButtonCanceloffer,
										purchaseOffer: aButtonPurchaseOffer,
										HCP_VOLUME: aResults[i].HCP_VOLUME,
										HCP_CREATED_AT: aResults[i].HCP_CREATED_AT,
										HCP_DATE_START: aResults[i].HCP_DATE_START,
										HCP_DATE_END: aResults[i].HCP_DATE_END,
										HCP_TPCEREAL: aResults[i].HCP_TPCEREAL,
										HCP_PARTNER: aResults[i].HCP_PARTNER,
										HCP_PARTNER_TYPE: aResults[i].HCP_PARTNER_TYPE,
										HCP_LOCAL: aResults[i].HCP_LOCAL,
										HCP_MODALITY: aResults[i].HCP_MODALITY,
										HCP_PROVIDER_DESC: aResults[i]["Offer_Prospect"] ? aResults[i].Offer_Prospect.NAME1 : (aResults[i]["Offer_Partner"].results ? aResults[i].Offer_Partner?.results[0]?.NAME1 : "Sem fornecedor/prospect")
									    };
								} else {
									var aData = {
										HCP_UNIQUE_KEY: aResults[i].HCP_UNIQUE_KEY,
										HCP_OFFER_ID: aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"] ? "Registro Offline" : aResults[i].HCP_OFFER_ID,
										HCP_MATNR: aResults[i].HCP_MATNR,
										MAKTX: "",
										DT_DELIVERY: aDataDelivery,
										HCP_EKGRP: aResults[i].HCP_EKGRP,
										EKNAM: "",
										HCP_INCOTERM: aIncoterm,
										HCP_STATUS: aResults[i].HCP_STATES_OFFER,
										cancelOffer: aButtonCanceloffer,
										purchaseOffer: aButtonPurchaseOffer,
										HCP_VOLUME: aResults[i].HCP_VOLUME,
										HCP_CREATED_AT: aResults[i].HCP_CREATED_AT,
										HCP_DATE_START: aResults[i].HCP_DATE_START,
										HCP_DATE_END: aResults[i].HCP_DATE_END,
										HCP_TPCEREAL: aResults[i].HCP_TPCEREAL,
										HCP_PARTNER: aResults[i].HCP_PARTNER,
										HCP_PARTNER_TYPE: aResults[i].HCP_PARTNER_TYPE,
										HCP_LOCAL: aResults[i].HCP_LOCAL,
										HCP_MODALITY: aResults[i].HCP_MODALITY,
										HCP_PROVIDER_DESC: aResults[i]["Offer_Partner"].results ? aResults[i].Offer_Partner.results[0].NAME1 : "Sem fornecedor"
									 };
								}
								aData["TEXT_BUTTON_01"] = this.resourceBundle.getText("buttonCancelOffer");

								if (aResults[i].HCP_STATES_OFFER == "1") { //Em aberto
									aData["HCP_STATES_OFFER"] = this.resourceBundle.getText("textOpened");
								} else if (aResults[i].HCP_STATES_OFFER == "2") { //Comprado Parcialmente
									aData["HCP_STATES_OFFER"] = this.resourceBundle.getText("textPartiallyRequested");
									aData["TEXT_BUTTON_01"] = this.resourceBundle.getText("buttonFinish");
								} else if (aResults[i].HCP_STATES_OFFER == "3") { //Finalizado
									aData["HCP_STATES_OFFER"] = this.resourceBundle.getText("textFinished");
								} else if (aResults[i].HCP_STATES_OFFER == "4") { //Cancelado
									aData["HCP_STATES_OFFER"] = this.resourceBundle.getText("textCanceled");
								} else if (aResults[i].HCP_STATES_OFFER == "5") { //Erro
									aData["HCP_STATES_OFFER"] = this.resourceBundle.getText("textError");
									aData["TEXT_BUTTON_01"] = this.resourceBundle.getText("buttonFinish");
								} else if (aResults[i].HCP_STATES_OFFER == "6") { //Reativados
									aData["HCP_STATES_OFFER"] = this.resourceBundle.getText("textReactivate");
								}
								if (aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"]) {
									aData["@com.sap.vocabularies.Offline.v1.isLocal"] = true;
									aData["__metadata"] = aResults[i].__metadata;
								}

								if (!aResults[i]["@com.sap.vocabularies.Offline.v1.isLocal"]) {

									aData["MAKTX"] = aResults[i]?.Offer_Material?.MAKTX;
									aData["EKNAM"] = aResults[i]?.Offer_Account_Groups?.EKNAM;

								} else {

									oArrayMatnr.push(aResults[i].HCP_MATNR);
									oArrayEkgrp.push(aResults[i].HCP_EKGRP);

								}

								if (i > 55) {
									console.log(true)
								}

								oDataItem.push(aData);

							}

							this.getExpandOffDynamic(oArrayMatnr, oDataItem, "View_Material", "HCP_MATNR", "MATNR", "MAKTX").then(function () {
								this.getExpandOffDynamic(oArrayEkgrp, oDataItem, "View_Account_Groups", "HCP_EKGRP", "EKGRP", "EKNAM").then(function () {
									oModel.setProperty("/ItemOffeMap", oDataItem);
									this._getWerksOfferMap(aFiltersKey).then(function () {
										resolve();
									}.bind(this));
								}.bind(this));
							}.bind(this));

						} else {
							resolve();
						}

					}.bind(this),
					error: function (error) {
						reject();
					}
				});

			}.bind(this));

		},

		_getWerksOfferMap: function (aFiltersKey) {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getOwnerComponent().getModel();
				var oModel = this.getView().getModel("filterTableOffer");
				var oData = oModel.oData;
				var oWerksFilter = [];

				//Centro de Destino
				if (oData.werks) {

					oWerksFilter.push(new sap.ui.model.Filter({
						path: 'HCP_WERKS',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.werks
					}));

				}

				oModelOffer.read("/Offer_Map_Werks", {

					filters: oWerksFilter,
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

						var aItemOffer = oModel.oData.ItemOffeMap;

						var oDataItem = aValidKeys.map(function (aCenter) {
							return Object.assign(aCenter, aItemOffer.reduce(function (acc, aOffer) {
								if (aOffer.HCP_UNIQUE_KEY == aCenter.HCP_UNIQUE_KEY) {
									return aOffer;
								} else {
									return acc;
								}
							}));
						});

						oModel.setProperty("/ItemOffeMap", oDataItem);
						oModel.setProperty("/count", aValidKeys.length);
						resolve();

					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));
		},

		buildEntityPath: function (sEntityName, oEntity, oField) {

			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity[oField] + "l)";
			}

		},

		_onRowPress: function (oEvent) {

			var oItem = oEvent.getSource();
			var sPath = oItem.oBindingContexts.filterTableOffer.sPath;
			var sPlit = oItem.oBindingContexts.filterTableOffer.sPath.split("/");
			var sIndex = sPlit[2];
			var oData = oItem.oBindingContexts.filterTableOffer.oModel.oData.ItemOffeMap[sIndex];

			sPath = this.buildEntityPath("Offer_Map", oData, "HCP_OFFER_ID");

			this.oRouter.navTo("offerMap.Edit", {
				keyData: encodeURIComponent(sPath),
				option: encodeURIComponent("OfferMap")
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

			if (this.SortDialogOfferMap) {
				this.SortDialogOfferMap.close();
			}

		},

		refreshData: function () {
			var oModel = this.getOwnerComponent().getModel();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var aRefreshView = ["Offer_Map", "Offer_Map_Werks"];

			// this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText("messageLoadingPleaseWait"));

			setTimeout(function () {
				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
					oModel.read("/Offer_Map", {
						success: function (oResults) {
							this.flushStore("Offer_Map,Offer_Map_Werks,Commodities_Fixed_Order,Commodities_Log_Messages,Commodities_Order,Cadence").then(	function () {
							this.refreshStore(aRefreshView).then(function () {
							var oTableModel = this.getView().getModel("filterTableOffer");
							oTableModel.setProperty("/ItemOffeMap", []);
							this._submitFilterOffer().then(function () {
								this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText(
									"messageLoadingPleaseWait"));
								this.getView().getModel().refresh(true);
								//this.getView().byId("pullToRefreshID").hide();
								this.closeBusyDialog();
							}.bind(this), 1000);
							}.bind(this));
							}.bind(this));
						}.bind(this)
					});
				} else {
					var oTableModel = this.getView().getModel("filterTableOffer");
					oTableModel.setProperty("/ItemOffeMap", []);
					this._submitFilterOffer().then(function () {
						this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText(
							"messageLoadingPleaseWait"));
						this.getView().getModel().refresh(true);
						//this.getView().byId("pullToRefreshID").hide();
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

			if (!this.SortDialogOfferMap) {
				this.SortDialogOfferMap = sap.ui.xmlfragment("sortDialogID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.offerMap.fragments.SortDialog",
					this);

				this.getView().addDependent(this.SortDialogOfferMap);
			}

			this.SortDialogOfferMap.openBy(oEvent.getSource());
		},

		submitSortList: function (oEvent) {

			var oSelectedColumn = sap.ui.core.Fragment.byId("sortDialogID" + this.getView().getId(), "group_column").getSelectedButton().getId();
			var oSelectedSort = sap.ui.core.Fragment.byId("sortDialogID" + this.getView().getId(), "group_sort").getSelectedButton().getId();

			oSelectedColumn = oSelectedColumn.split("ConsultOfferMap--");
			oSelectedSort = oSelectedSort.split("ConsultOfferMap--");

			var oSorter = [];

			if (oSelectedColumn[1] !== 'HCP_WERKS') {

				oSorter.push(new sap.ui.model.Sorter({
					path: 'HCP_CREATED_AT',
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

			this.SortDialogOfferMap.close();
		},

		_validateFormCancelReason: function () {

			var oModelCancel = this.getView().getModel("offerMapCancelFormModel");
			var oData = oModelCancel.oData;

			setTimeout(function () {

				if (oData.HCP_CANCEL_REASON.length > 0) {
					oModelCancel.setProperty("/enabledConfir", true);
				} else {
					oModelCancel.setProperty("/enabledConfir", false);
					return;
				}

			}.bind(this), 100);
		},

		_getGrainMaterial: function (oMaterial) {

			return new Promise(function (resolve, reject) {

				var oModelCommodities = this.getView().getModel();
				var oModel = this.getView().getModel("filterTableOffer");
				var oData = oModel.oData;
				var aFilters = [];

				if (oData.checkActive == true) {

					if (oMaterial) {

						aFilters.push(new sap.ui.model.Filter({
							path: "MATNR",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oMaterial
						}));

						oModelCommodities.read("/Z041028", {

							filters: aFilters,
							success: function (results) {

								var aResults = results.results;

								if (aResults.length > 0) {
									oModel.setProperty("/checkMat", true);
								}

								resolve();

							}.bind(this),
							error: function (error) {
								resolve();
							}
						});

					} else {
						resolve();
					}

				} else {
					resolve();
				}

			}.bind(this));

		},

		_getTvarvSap: function (oType, oName, oLow, oProperty) {

			return new Promise(function (resolve, reject) {

				var oModelCommodities = this.getView().getModel();
				var oModel = this.getView().getModel("filterTableOffer");
				var oData = oModel.oData;
				var aFilters = [];

				oData[oProperty] = false;

				aFilters.push(new sap.ui.model.Filter({
					path: "NAME",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oName
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "TYPE",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oType
				}));

				if (oType == "S") {
					aFilters.push(new sap.ui.model.Filter({
						path: "SIGN",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: "I"
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: "OPTI",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: "EQ"
					}));
				}

				if (oLow) {
					aFilters.push(new sap.ui.model.Filter({
						path: "LOW",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oLow
					}));
				}

				oModelCommodities.read("/Tvarvc", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;

						if (aResults.length > 0) {

							if (aResults[0].LOW) {
								oData[oProperty] = true;
							}

						}

						resolve();

					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));

		},

		_getPriceTypeMaterial: function (oDataRow) {

			return new Promise(function (resolve, reject) {

				var oModelCommodities = this.getView().getModel();
				var oModel = this.getView().getModel("filterTableOffer");
				var oData = oModel.oData;
				var aFilters = [];

				if (oDataRow.HCP_EKGRP && oDataRow.HCP_MATNR && oDataRow.HCP_WERKS && oDataRow.HCP_TPCEREAL && oDataRow.HCP_DATE_START) {

					var oMonth = (oDataRow.HCP_DATE_START.getMonth()) + 1;
					if (oMonth < 10) {
						oMonth = "0" + oMonth;
					} else {
						oMonth = oMonth.toString();
					}

					var oVigencia = "VIGENCIA_" + oMonth;

					//	var oDay = new Date().getUTCDate();
					var oDay = new Date().getDate();
					if (oDay < 10) {
						oDay = "0" + oDay;
					}

					oMonth = new Date().getMonth() + 1;
					if (oMonth < 10) {
						oMonth = "0" + oMonth;
					} else {
						oMonth = oMonth.toString();
					}

					var oDatum = new Date().getFullYear() + oMonth + oDay;

					var oYear = oDataRow.HCP_DATE_END.getFullYear();

					aFilters.push(new sap.ui.model.Filter({
						path: "EKGRP",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oDataRow.HCP_EKGRP
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: "MATNR",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oDataRow.HCP_MATNR
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'WERKS',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oDataRow.HCP_WERKS
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'TPCEREAL',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oDataRow.HCP_TPCEREAL
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: oVigencia,
						operator: sap.ui.model.FilterOperator.GE,
						value1: oDatum
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: "FND_YEAR",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oYear
					}));

					oModelCommodities.read("/Table_Price", {

						filters: aFilters,
						success: function (results) {

							var aResults = results.results;

							if (aResults.length > 0) {
								resolve(true);
							} else {
								resolve(false);
							}

						}.bind(this),
						error: function (error) {
							resolve(false);
						}
					});

				} else {
					resolve(true);
				}

			}.bind(this));
		},

		_getProspect: function (oData, oLocalArray) {

			return new Promise(function (resolve, reject) {

				var oModelOffer = this.getView().getModel();
				var oDataItemLocal = [];
				var aFilters = [];

				if (oData.HCP_PARTNER_TYPE == 2) { //Prospect

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_PROSP_ID',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_PARTNER
					}));

					oModelOffer.read("/Prospects", {

						filters: aFilters,

						success: function (results) {

							var aResults = results.results;

							if (aResults.length > 0) {
								oData["LIFNR_PROSPECT"] = aResults[0].LIFNR;

								var sName = '';

								if (aResults[0].NAME1) {
									sName = aResults[0].NAME1;
								}

								if (aResults[0].NAME2) {
									sName = sName + aResults[0].NAME2;
								}

								if (aResults[0].STCD1) {
									var oStcdx = aResults[0].STCD1;
								} else {
									oStcdx = aResults[0].STCD2;
								}

								var aData = {
									LIFNR: aResults[0].HCP_PROSP_ID,
									NAME1: sName,
									REGIO: aResults[0].BLAND,
									STCDX: oStcdx,
									ORT01: aResults[0].ORT01
								};

								oDataItemLocal.push(aData);

							}

							resolve(oDataItemLocal);

						}.bind(this),
						error: function () {
							reject(oDataItemLocal);
						}
					});

				} else {
					resolve(oLocalArray);
				}
			}.bind(this));

		},

		_getPartner: function (oData, oLocalArray) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var aFilters = [];
				var oItemLocal = [];

				if (oData.HCP_PARTNER_TYPE == "1") { //Fornecedor

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_REGISTER',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_PARTNER
					}));

					oModel.read("/View_Grouping_Suppliers", {

						filters: aFilters,

						success: function (result) {

							var aResultsGrouping = result.results;
							var aFilters = [];

							if (aResultsGrouping.length > 0) {

								if (aResultsGrouping[0].AGRUPADO === 0) { //Não Agrupado

									aFilters.push(new sap.ui.model.Filter({
										path: "LIFNR",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: aResultsGrouping[0].HCP_REGISTER
									}));

								} else { //Agrupado

									if (aResultsGrouping[0].STCD1 != "") {

										if (aResultsGrouping[0].LAND1 !== "BR") {

											aFilters.push(new sap.ui.model.Filter({
												path: "STCD1",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: aResultsGrouping[0].STCD1
											}));

										} else {
											var oStcd1 = aResultsGrouping[0].STCD1.substr(0, 8);

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
											value1: aResultsGrouping[0].STCD2
										}));

									}

								}

								oModel.read("/View_Suppliers", {

									filters: aFilters,
									success: function (results) {

										var aResultsSuppliers = results.results;
										aFilters = [];

										if (aResultsSuppliers.length > 0) {

											for (var i = 0; i < aResultsSuppliers.length; i++) {

												if (aResultsSuppliers[i].STCD1) {
													var oStcdx = aResultsSuppliers[i].STCD1;
												} else {
													oStcdx = aResultsSuppliers[i].STCD2;
												}

												var sName = '';

												if (aResultsSuppliers[i].NAME1) {
													sName = aResultsSuppliers[i].NAME1;
												}

												var aData = {
													LIFNR: aResultsSuppliers[i].LIFNR,
													NAME1: sName,
													REGIO: aResultsSuppliers[i].REGIO,
													STCDX: oStcdx,
													ORT01: aResultsSuppliers[i].ORT01
													
												};
												oItemLocal.push(aData);
											}
											resolve(oItemLocal);
										}
									}.bind(this),
									error: function (error) {
										reject(oItemLocal);
									}
								});

							} else {
								resolve(oItemLocal);
							}

						}.bind(this),
						error: function () {
							reject(oItemLocal);
						}
					});

				} else {
					resolve(oLocalArray);
				}
			}.bind(this));

		},

		commoditiesData: async function (oData) {

			var aUserName = this.userName;
			var oModel = this.getView().getModel();
			let aNewFilters = [];
			let oLocalWarehouse = [];

			oModel.setUseBatch(true);
			var aDeferredGroups = oModel.getDeferredGroups();
			var aFilters = [];
			var oLocalArray = [];
			var aCenterArray = [];
			var oEnabledLocal = false;

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}
			
			if(oData.HCP_STATUS == "2"){
				let calcFinal = await this._getHistoricOffer(oData.HCP_UNIQUE_KEY, oData.HCP_VOLUME);
				oData["HCP_VOLUME_COMMERCIALIZED"] = parseFloat(oData.HCP_VOLUME) - parseFloat(calcFinal);
				oData["HCP_VOLUME_FINAL"] = calcFinal;	
			}

			this.sPath = this.buildEntityPath("Offer_Map", oData, "HCP_OFFER_ID");

			var aDataUpdate = {
				HCP_CREATE_OFFER: "1",
				HCP_UPDATED_BY: aUserName,
				HCP_UPDATED_AT: new Date()
			};

			//Editar uma informação no banco
			oModel.update(this.sPath, aDataUpdate, {
				groupId: "changes"
			});

			aNewFilters.push(new sap.ui.model.Filter({
				path: "HCP_OFFER_ID",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_OFFER_ID
			}));

			oModel.read("/Offer_Map", {

				filters: aNewFilters,
				success: function (results) {

					var aResults = results.results;
					oLocalWarehouse.push(aResults[0].HCP_WAREHOUSE);
				},
				error: function (error) {}
			});

			oModel.submitChanges({
				groupId: "changes",
				success: function () {

					if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
						this.flushStore("Offer_Map").then(function () {
						var aRefreshView = ["Offer_Map"];
						this.refreshStore(aRefreshView).then(function () {

						if (oData.HCP_MODALITY == "1") { //Fixo
							var oText = this.resourceBundle.getText("optionBuyFixedPrice") + ": " + oData.HCP_OFFER_ID;
						} else {
							oText = this.resourceBundle.getText("optionBuyDepositi") + ": " + oData.HCP_OFFER_ID;
						}

						this._getPartner(oData, oLocalArray).then(function (oLocalArray) {
							this._getProspect(oData, oLocalArray).then(function (oLocalArray) {
								
								//VERIFICA SE HCP_LOCAL É UM NUMERO
								var isOnlyNumbers = /^\d+$/.test(oData.HCP_LOCAL);

								aFilters = [];

								aFilters.push(new sap.ui.model.Filter({
									path: "WERKS",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: oData.HCP_WERKS
								}));

								if (!this._FragmentCommodities) {
									this._FragmentCommodities = sap.ui.xmlfragment(
										"com.sap.build.standard.brfAppDeGraosModoEditar.view.offerMap.fragments.Commodities",
										this);

									this.getView().addDependent(this._FragmentCommodities);
								}

								oModel.read("/View_Center", {

									filters: aFilters,
									success: function (results) {

										var aResults = results.results;

										for (var i = 0; i < aResults.length; i++) {

											var sName = '';

											if (aResults[i].NAME1) {
												sName = aResults[i].NAME1;
											}

											var aData = {
												WERKS: aResults[i].WERKS,
												NAME1: sName
											};

											aCenterArray.push(aData);

										}

										if (oData.HCP_LOCAL) {
											var oConfirm = true;
										} else {
											oConfirm = false;
										}

										var oModelCommodities = new JSONModel({
											textCommodities: oText,
											enabledConfir: oConfirm,
											enabledLocal: oEnabledLocal,
											enabledCenter: false,
											enabledOtherVol: oData.HCP_STATUS != "2" ? false : true,
											ItemWerks: aCenterArray,
											ItemLocal: oLocalArray,
											HCP_WERKS: oData.HCP_WERKS,
											HCP_LOCAL: oData.HCP_LOCAL,
											HCP_UNIQUE_KEY: oData.HCP_UNIQUE_KEY,
											HCP_TIPO: oData.HCP_MODALITY,
											HCP_MENGE: oData.HCP_STATUS != "2" ? oData.HCP_VOLUME : oData.HCP_VOLUME_FINAL,
											HCP_VOLUME: oData.HCP_STATUS != "2" ? 0 : oData.HCP_VOLUME,
											HCP_VOLUME_COMMERCIALIZED: oData.HCP_STATUS != "2" ? 0 : oData.HCP_VOLUME_COMMERCIALIZED,
											HCP_OFFER: oData.HCP_OFFER_ID
										});

										this.getView().setModel(oModelCommodities, "commoditiesFormModel");

										this._FragmentCommodities.open();

									}.bind(this),
									error: function (error) {

									}
								});

							}.bind(this));
						}.bind(this));

						}.bind(this));
						}.bind(this));
					} else {
						var aRefreshView = ["Offer_Map"];

						if (oData.HCP_MODALITY == "1") { //Fixo
							var oText = this.resourceBundle.getText("optionBuyFixedPrice") + ": " + oData.HCP_OFFER_ID;
						} else {
							oText = this.resourceBundle.getText("optionBuyDepositi") + ": " + oData.HCP_OFFER_ID;
						}

						this._getPartner(oData, oLocalArray).then(function (oLocalArray) {
							this._getProspect(oData, oLocalArray).then(function (oLocalArray) {

								aFilters = [];

								aFilters.push(new sap.ui.model.Filter({
									path: "WERKS",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: oData.HCP_WERKS
								}));

								if (!this._FragmentCommodities) {
									this._FragmentCommodities = sap.ui.xmlfragment(
										"com.sap.build.standard.brfAppDeGraosModoEditar.view.offerMap.fragments.Commodities",
										this);

									this.getView().addDependent(this._FragmentCommodities);

								}

								oModel.read("/View_Center", {

									filters: aFilters,
									success: function (results) {

										var aResults = results.results;

										for (var i = 0; i < aResults.length; i++) {

											var sName = '';

											if (aResults[i].NAME1) {
												sName = aResults[i].NAME1;
											}
											var aData = {
												WERKS: aResults[i].WERKS,
												NAME1: sName
											};

											aCenterArray.push(aData);

										}

										if (oData.HCP_LOCAL) {
											var oConfirm = true;
										} else {
											oConfirm = false;
										}

										var oModelCommodities = new JSONModel({
											textCommodities: oText,
											enabledConfir: oConfirm,
											enabledLocal: oEnabledLocal,
											enabledCenter: false,
											enabledOtherVol: oData.HCP_STATUS != "2" ? false : true,
											ItemWerks: aCenterArray,
											ItemLocal: oLocalArray,
											HCP_WERKS: oData.HCP_WERKS,
											HCP_LOCAL: oData.HCP_LOCAL,
											HCP_UNIQUE_KEY: oData.HCP_UNIQUE_KEY,
											HCP_TIPO: oData.HCP_MODALITY,
											HCP_MENGE: oData.HCP_STATUS != "2" ? oData.HCP_VOLUME : oData.HCP_VOLUME_FINAL,
											HCP_VOLUME: oData.HCP_STATUS != "2" ? 0 : oData.HCP_VOLUME,
											HCP_VOLUME_COMMERCIALIZED: oData.HCP_STATUS != "2" ? 0 : oData.HCP_VOLUME_COMMERCIALIZED,
											HCP_OFFER: oData.HCP_OFFER_ID
										});

										this.getView().setModel(oModelCommodities, "commoditiesFormModel");

										this._FragmentCommodities.open();

									}.bind(this),
									error: function (error) {

									}
								});

							}.bind(this));
						}.bind(this));
					}

				}.bind(this),
				error: function () {}.bind(this)
			});
		},
		
		_getHistoricOffer: async function (HCP_UNIQUE_KEY,HCP_VOLUME) {

			var oModel = this.getView().getModel();
			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_UNIQUE_KEY_OFFER',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: HCP_UNIQUE_KEY
			}));
			
			const historicOffer = await new Promise(function (resolve, reject) {
                oModel.read("/Commodities_Historic_Offer", {
                	filters: aFilters,
                    success: function (data) {
                        resolve(data.results != undefined ? data.results : false);
                    }.bind(this),
                    error: function (oError) {
                        reject(oError);
                    }.bind(this),
                });
            });
            
            let volumeFinal = HCP_VOLUME;
            
			if (historicOffer.length > 0) {
				for (var i = 0; i < historicOffer.length; i++) {
					volumeFinal = volumeFinal - historicOffer[i].HCP_MENGE;
				}
			}
			return volumeFinal;
		},
		
		_valideInputNumber: function (oProperty) {

			var oSource = oProperty.getSource();
			var sValue;

			sValue = oProperty.mParameters.newValue;
			sValue = sValue.replace(/[^0-9,]/g, "");
			
			if(sValue == "" || sValue == undefined || sValue == null)
				sValue = 0;

			oSource.setValue(sValue);

			this._validateFormCommodities();
		},

		_validateFormCommodities: function (oEvent) {
			var oModel = this._FragmentCommodities.getModel("commoditiesFormModel");
			var oData = oModel.getData();

			if (oData.HCP_LOCAL && oData.HCP_WERKS && oData.HCP_MENGE != 0) {
				oModel.setProperty("/enabledConfir", true);
			} else {
				oModel.setProperty("/enabledConfir", false);
			}
		},

		_onConfirComPress: function () {

			this.redirectCommodities();
			this.busyDialog.close();

		},

		_onCancelComPress: function (oEvent) {
			oEvent.getSource().getParent().close();
			this.busyDialog.close();
		},

		redirectCommodities: function () {

			var oModel = this.getView().getModel("commoditiesFormModel");
			var oData = oModel.oData;
			var oText = this.resourceBundle.getText("messageRedirectCommodities");

			if (oData.HCP_TIPO == "1") { //Fixo
				oText = oText + this.resourceBundle.getText("optionBuyFixedPrice");
				var oRouter = "commodities." + "NewFixedOrder";
			} else {
				oText = oText + this.resourceBundle.getText("optionBuyDepositi");
				oRouter = "commodities." + "NewDepositTransf";
			}

			MessageBox.success(
				oText, {
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function (sAction) {
						if (sAction === "OK") {
							this.closeBusyDialog();
							var sKeyOffer = oData;

							var sKeyOffer = {
								HCP_UNIQUE_KEY_OFFER: oData.HCP_UNIQUE_KEY,
								HCP_TIPO: oData.HCP_TIPO,
								HCP_WERKS: oData.HCP_WERKS,
								HCP_LOCAL: oData.HCP_LOCAL,
								HCP_MENGE: oData.HCP_MENGE
							};

							this.oRouter.navTo(oRouter, {
								keyData: JSON.stringify(sKeyOffer)
							});
						}
					}.bind(this)
				}
			);

		},

		_validateFormCadence: function () {

			var oModel = this.getView().getModel("commoditiesFormModel");
			var oData = oModel.oData;

			if (oData.HCP_WERKS && oData.HCP_LOCAL) {
				oModel.setProperty("/enabledConfir", true);
			} else {
				oModel.setProperty("/enabledConfir", false);
			}

		},

		_onPurchaseButton: function (oEvent) {

			this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText(
				"messageLoadingPleaseWait"));
			var oModel = this.getView().getModel("filterTableOffer");
			var oDataView = oModel.oData;
			var oItem = oEvent.getSource();
			var sPlit = oItem.oParent.oBindingContexts.filterTableOffer.sPath.split("/");
			var sIndex = sPlit[2];
			var oData = oItem.oParent.oBindingContexts.filterTableOffer.oModel.oData.ItemOffeMap[sIndex];

			if (oData.HCP_MODALITY == "1") { //FIxo

				var oMaterial = parseFloat(oData.HCP_MATNR);

				this._getTvarvSap("S", "Z_Z586011_ATIVA_TP_COMPRA", oMaterial, 'checkTpCompra').then(function () {

					this._getGrainMaterial(oData.HCP_MATNR).then(function () {
						this._getTvarvSap("S", "Z_Z586011_ATIVA_PRECO", oMaterial, 'checkPreco').then(function () {
							this._getTvarvSap("S", "Z_Z586011_ATIVA_TP_CEREAL", oMaterial, 'checkCereal').then(function () {
								this.closeBusyDialog();

								if (oDataView.checkActive === true && oDataView.checkPreco === true &&
									oDataView.checkCereal === true && oDataView.checkMat === true) {

									this._getPriceTypeMaterial(oData).then(function (oSucess) {
										this.closeBusyDialog();
										if (oSucess == true) {

											this.commoditiesData(oData).then(function () {}.bind(this));

										} else {

											let oMessage = this.resourceBundle.getText("messageNotCommodities") + " " + this.resourceBundle.getText(
												"messageMaterialPrice") + " " + oMaterial + " " + this.resourceBundle.getText(
												"messageNotRegistered");

											MessageBox.error(
												oMessage, {
													actions: [sap.m.MessageBox.Action.OK],
													onClose: function (sAction) {
														if (sAction === "OK") {
															this.closeBusyDialog();
														}
													}.bind(this)
												}
											);
										}

									}.bind(this));

								} else {
									this.closeBusyDialog();
									this.commoditiesData(oData).then(function () {}.bind(this));
								}

							}.bind(this));
						}.bind(this));
					}.bind(this));

				}.bind(this));

			} else {
				this.busyDialog.close();
				this.commoditiesData(oData).then(function () {}.bind(this));
			}
			
		},

		_onCancelOfferButton: function (oEvent) {

			var oItem = oEvent.getSource();
			var sPlit = oItem.oParent.oBindingContexts.filterTableOffer.sPath.split("/");
			var sIndex = sPlit[2];
			var oData = oItem.oParent.oBindingContexts.filterTableOffer.oModel.oData.ItemOffeMap[sIndex];

			this.sPath = this.buildEntityPath("Offer_Map", oData, "HCP_OFFER_ID"); //Offer_map tabela-------------------------------------------------------------------------

			if (oData.HCP_STATUS == "2" || oData.HCP_STATUS == "5") { //Comprado Parcialmente ou Erro
				var oTextCancelOffer = this.resourceBundle.getText("buttonFinish") + ": " + oData.HCP_OFFER_ID;
				var oTextHeader = this.resourceBundle.getText("buttonFinish");
				var oTextCancelReason = this.resourceBundle.getText("textFinishReason");
			} else {
				oTextCancelOffer = this.resourceBundle.getText("buttonCancelOffer") + ": " + oData.HCP_OFFER_ID;
				oTextHeader = this.resourceBundle.getText("buttonCancelOffer");
				oTextCancelReason = this.resourceBundle.getText("textCancellationReason");
			}
			
				var oModelCancel = new JSONModel({
					HCP_UNIQUE_KEY: oData.HCP_UNIQUE_KEY,
					HCP_MODALITY: oData.HCP_MODALITY,
					HCP_STATUS: oData.HCP_STATUS,
					HCP_CANCEL_REASON: "",
					HCP_PLAYERS: "",
					HCP_CANCEL_REASON_DESC: "",

					textHeader: oTextHeader,
					textCancelReason: oTextCancelReason,
					enabledConfir: false
				});

				this.getView().setModel(oModelCancel, "offerMapCancelFormModel");
				
				let oVisibleModel = this.getView().getModel("appModelVisible");
				oVisibleModel.setProperty("/isVisible", false);
				oVisibleModel.setProperty("/isVisiblePlayers", false);
				oVisibleModel.setProperty("/isVisibleOthers", false);

			if (!this._FragmentCancelReason) {
				this._FragmentCancelReason = sap.ui.xmlfragment("cancelReasonFilterID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.offerMap.fragments.OfferCancelReason",
					this);

				this.getView().addDependent(this._FragmentCancelReason);

			}
			this._FragmentCancelReason.setTitle(oTextCancelOffer);
			this._FragmentCancelReason.open();
			oVisibleModel.setProperty("/isVisible", false);
			oVisibleModel.setProperty("/isVisiblePlayers", false);

		},

		_onCancelPress: function (oEvent) {

			var oCancelModel = this.getView().getModel("offerMapCancelFormModel");
			let oVisibleModel = this.getView().getModel("appModelVisible");

			oCancelModel.setProperty("/enabledConfir", false);
			oCancelModel.setProperty("/HCP_CANCEL_REASON", null);
			oCancelModel.setProperty("/HCP_CANCEL_REASON_DESC", null);
			oCancelModel.setProperty("/HCP_CROP", null);
			oCancelModel.setProperty("/HCP_STATE", null);
			oCancelModel.setProperty("/HCP_REGIO", null);
			oCancelModel.setProperty("/HCP_PLAYERS", null);
			oVisibleModel.setProperty("/isVisible", false);
			oVisibleModel.setProperty("/isVisiblePlayers", false);
			oEvent.getSource().getParent().close();
		},
		//Pacote Melhorias 06/06/2022 - Função para validar mensagem cancelamento
		selectMessageBox: function (oMessageSucess, isRedirect) {
			if (isRedirect) {
				this.closeBusyDialog();
				var oTableModel = this.getView().getModel("filterTableOffer");
				if (oTableModel.oData.ItemOffeMap.length == 1) {
					oTableModel.setProperty("/ItemOffeMap", []);
					oTableModel.setProperty("/count", 0);
				} else {
					oTableModel.setProperty("/ItemOffeMap", []);
					this._submitFilterOffer().then(function () {
						this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText(
							"messageLoadingPleaseWait"));
						this.getView().getModel().refresh(true);
						//	this.getView().byId("pullToRefreshID").hide();
						this.closeBusyDialog();
					}.bind(this), 1000);
				}
			} else {
				MessageBox.success(
					oMessageSucess, {
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function (sAction) {
							this.closeBusyDialog();
							var oTableModel = this.getView().getModel("filterTableOffer");
							if (oTableModel.oData.ItemOffeMap.length == 1) {
								oTableModel.setProperty("/ItemOffeMap", []);
								oTableModel.setProperty("/count", 0);
							} else {
								oTableModel.setProperty("/ItemOffeMap", []);
								this._submitFilterOffer().then(function () {
									this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText(
										"messageLoadingPleaseWait"));
									this.getView().getModel().refresh(true);
									//	this.getView().byId("pullToRefreshID").hide();
									this.closeBusyDialog();
								}.bind(this), 1000);
							}
						}.bind(this)
					}
				);
			}
		},

		_onConfirPress: function (oEvent) {

			var aUserName = this.userName;
			var oCancelModel = this.getView().getModel("offerMapCancelFormModel");
			var oCancelData = oCancelModel.getProperty("/");

			let oVisibleModel = this.getView().getModel("appModelVisible");

			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var aDeferredGroups = oModel.getDeferredGroups();
			var aFilters = [];

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}

			if (oCancelData.HCP_STATUS == "2") { //Comprado Parcialmente
				var oStatusOffer = "3"; //Finalizado
				var oMessageSucess = this.resourceBundle.getText("sucessFinishfferMap");
				var oMessageError = this.resourceBundle.getText("errorCancelOfferMap");
			} else {
				oStatusOffer = "4"; //Cancelado
				oMessageSucess = this.resourceBundle.getText("sucessCancelOfferMap");
				oMessageError = this.resourceBundle.getText("errorFinishOfferMap");
			}

			var aData = {
				HCP_STATES_OFFER: oStatusOffer,
				HCP_CANCEL_REASON: oCancelData.HCP_CANCEL_REASON,
				HCP_CANCEL_REASON_DESC: oCancelData.HCP_CANCEL_REASON_DESC,
				HCP_PLAYERS: oCancelData.HCP_PLAYERS,
				HCP_UPDATED_BY: aUserName,
				HCP_UPDATED_AT: new Date()
			};

			oModel.update(this.sPath, aData, {
				groupId: "changes"
			});

			//Atualizar compras atreladas a oferta
			if (oCancelData.HCP_MODALITY == "1") { //Fixo
				var oEntity = "Commodities_Fixed_Order";
				var oField = "HCP_PURCHASE_ID";
				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_ZSEQUE",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: ""
				}));
			} else { //Depósito ou Transferência
				oEntity = "Commodities_Order";
				oField = "HCP_ORDER_ID";

			}

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_UNIQUE_KEY_OFFER",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oCancelData.HCP_UNIQUE_KEY
			}));

			//Cancelar compras nao efetivadas da oferta
			oModel.read("/" + oEntity, {

				filters: aFilters,
				success: function (results) {

					var aResults = results.results;

					for (var i = 0; i < aResults.length; i++) {

						var sPath = this.buildEntityPath(oEntity, aResults[i], oField);

						var aDataOrder = {
							HCP_STATUS: "3", //Compra Cancelada
							HCP_UPDATED_BY: aUserName,
							HCP_UPDATED_AT: new Date()
						};

						oModel.update(sPath, aDataOrder, {
							groupId: "changes"
						});

					}

					var aRefreshView = ["Offer_Map", "Offer_Map_Werks", "Commodities_Fixed_Order", "Commodities_Log_Messages",
						"Commodities_Order",
						"Cadence"
					];

					oModel.submitChanges({
						groupId: "changes",
						success: function () {
							if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
								//this.flushStore("Offer_Map, Offer_Map_Werks, Commodities_Fixed_Order, Commodities_Log_Messages, Commodities_Order, Cadence").then(function () {
								//this.refreshStore(aRefreshView).then(function () {
								if (oCancelModel.getProperty("/HCP_PLAYERS") != null && oCancelModel.getProperty("/HCP_PLAYERS") != "") {
									this.selectMessageBox(oMessageSucess, true);
								} else {
									this.selectMessageBox(oMessageSucess, false);
								}
								oCancelModel.setProperty("/HCP_PLAYERS", null);
								//}.bind(this));
								//}.bind(this));
							} else {
								MessageBox.success(
									oMessageSucess, {
										actions: [sap.m.MessageBox.Action.OK],
										onClose: function (sAction) {
											this.closeBusyDialog();
											var oTableModel = this.getView().getModel("filterTableOffer");
											oTableModel.setProperty("/ItemOffeMap", []);
											this._submitFilterOffer().then(function () {
												this.setBusyDialog(this.resourceBundle.getText("textOfferMap"), this.resourceBundle.getText(
													"messageLoadingPleaseWait"));
												this.getView().getModel().refresh(true);
												//this.getView().byId("pullToRefreshID").hide();
												this.closeBusyDialog();
											}.bind(this), 1000);
										}.bind(this)
									}
								);
							}
						}.bind(this),
						error: function () {
							MessageBox.error(
								oMessageError, {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
									}.bind(this)
								}
							);
						}.bind(this)
					});

				}.bind(this),
				error: function (error) {

				}
			});

			if (oCancelModel.getProperty("/HCP_PLAYERS") != null && oCancelModel.getProperty("/HCP_PLAYERS") != "") {
				this.redirectNegociationReport();
			}

			oCancelModel.setProperty("/HCP_CANCEL_REASON", null);
			oEvent.getSource().getParent().close();
			oCancelModel.setProperty("/enabledConfir", false);
		},

		redirectNegociationReport: function () {

			var oModel = this.getView().getModel("offerMapCancelFormModel");
			var oData = oModel.oData;
			var oMessageSucessNew = this.resourceBundle.getText("messageFinaly");
			var oOfferMaopModel = this.getOwnerComponent().getModel();
			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_UNIQUE_KEY',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_UNIQUE_KEY
			}));

			oOfferMaopModel.read("/Offer_Map", {
				filters: aFilters,
				success: function (result) {
					var aResults = result.results;
					if (aResults.length > 0) {

						MessageBox.success(
							oMessageSucessNew, {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									if (sAction === "OK") {
										this.closeBusyDialog();

										this.oRouter.navTo("negotiationReport.New", {
											branch: encodeURIComponent((aResults[0].HCP_EKGRP).toString()),
											cropYear: encodeURIComponent(oData.HCP_CROP),
											matnr: encodeURIComponent((aResults[0].HCP_MATNR).toString()),
											regio: encodeURIComponent(oData.HCP_REGIO),
											state: encodeURIComponent(oData.HCP_STATE),
											material_type: encodeURIComponent((aResults[0].HCP_TPCEREAL).toString()),
											cancel_offer_map_id: encodeURIComponent((aResults[0].HCP_OFFER_ID).toString())
										}, false);

									}
								}.bind(this)
							}
						);

					}
				}.bind(this),
				error: function (error) {
					console.log(error);
				}
			});

		}

	});

	return IconTabBarController;

});