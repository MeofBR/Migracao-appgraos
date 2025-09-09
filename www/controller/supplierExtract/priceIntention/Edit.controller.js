sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
		"sap/m/MessageBox",
		"sap/ui/core/routing/History",
		"sap/ui/model/json/JSONModel",
		'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/List',
		'sap/m/StandardListItem'
	], function (MainController, MessageBox, History, JSONModel, Button, Dialog, List, StandardListItem) {
		"use strict";

		return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.supplierExtract.priceIntention.Edit", {

			onInit: function () {

				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getTarget("supplierExtract.priceIntention.Edit").attachDisplay(this.handleRouteMatched, this);
				this.getView().setModel(this.getOwnerComponent().getModel());
				this.getView().setModel(new sap.ui.model.json.JSONModel({
					rodutorComboBox: false,
					companyComboBox: false,
					enableConfirm: false,
					yesProspect: false,
					yesPartner: true,
					enablefob: false,
					enablecif: true,
					enableCreate: true,
					enabledLocal: false,
					enabledBland: true,
					yesCalculator: false,
					noPricesCalculator: false,
					enablefreight: false,
					priceFormated: 0,
					tablePriceFormated: 0,
					noPriceBRF: true,
					yesTerceiro: false,
					ItemLocal: [],
					ItemStates: []
				}), "priceIntentionFormModel");

				var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
				var sLocale = sCurrentLocale.split("-");
				var oLocale = new sap.ui.core.Locale(sLocale[0], sLocale[1]);
				this.oNumberFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance(oLocale);

				this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				var oModelOwner = this.getOwnerComponent().getModel();
				oModelOwner.refresh(true);
				this._createYear();
				this._createMonth();
			},
			handleRouteMatched: function (oEvent) {

				this.setBusyDialog("App Grãos", "Carregando, aguarde!");
				var oEditModel = this.getView().getModel("priceIntentionFormModel");
				var oModel = this.getView().getModel();
				var oData;

				if (oEvent.getParameter("data")) {

					var sPathKeyData = oEvent.getParameter("data").keyData;
					oData = oModel.getProperty(decodeURIComponent(sPathKeyData));
					//oData = JSON.parse(JSON.stringify(oData));

					this.sPathOption = oEvent.getParameter("data").option;
					this.minprice = parseFloat(oData.HCP_MIN_PRICE).toFixed(2);
					oData.HCP_MIN_PRICE = this.minprice;
					this.price = parseFloat(oData.HCP_PRICE).toFixed(2);
					oData.HCP_PRICE = this.price;
					this.sOperation = oEvent.getParameter("data").operation;
					if (this.sOperation == 'View') {
						oData.isEnable = false;
						oEditModel.setProperty("/enableCreate", false);
					} else {
						oData.isEnable = true;
					}
					oEditModel.setProperty("/editPriceIntention", oData);

					if (oData.HCP_PRICE_FOB > 0) { //fob
						oEditModel.setProperty("/noPriceBRF", false);
						oEditModel.setProperty("/yesCalculator", true);
						oEditModel.setProperty("/enablefob", true);
						oEditModel.setProperty("/enablecif", false);

					} else {
						oEditModel.setProperty("/yesCalculator", false);
						oEditModel.setProperty("/noPriceBRF", true);
						oEditModel.setProperty("/enablefob", false);
						oEditModel.setProperty("/enablecif", true);

					}

					oEditModel.setProperty("/tablePriceFormated", parseFloat(oEditModel.getProperty("/editPriceIntention/HCP_TABLE_PRICE")).toFixed(2));
					oEditModel.setProperty("/priceFormated", parseFloat(oEditModel.getProperty("/editPriceIntention/HCP_PRICE")).toFixed(2));
					oModel.setProperty("/editPriceIntention/HCP_TRECHO_KM", oData.HCP_PAVED);
					if (oData.HCP_STATUS == "0") {
						oEditModel.setProperty("/statusIntention", false);
					} else {
						oEditModel.setProperty("/statusIntention", true);
					}

					this.searchKmPartner(oData.HCP_LOCAL, oData.HCP_WERKS);

					if (oData.HCP_WAREHOUSE == "0") {
						oEditModel.setProperty("/yesTerceiro", false);
						oEditModel.setProperty("/yesLocalItem", true);
					} else {
						oEditModel.setProperty("/yesTerceiro", true);
						oEditModel.setProperty("/yesLocalItem", false);
					}

					if (oData.HCP_PAVED == "2") {
						oEditModel.setProperty("/yesPaved", true);
					} else {
						oEditModel.setProperty("/yesPaved", false);
					}

					if (oData.HCP_LOCAL != null) {
						this._searchProspectName();
					} else {
						this.closeBusyDialog();
					}

				}

				this.getUser().then(function (userName) {
					this.userName = userName;
				}.bind(this));

			},
			_changeModality: function (oEvent) {
				var oInput = oEvent.getSource();
				var oCreateModel = this.getView().getModel("priceIntentionFormModel");
				oCreateModel.setProperty("/enableCreate", false);
				oCreateModel.setProperty("/noPricesCalculator", false);

				oCreateModel.setProperty("/editPriceIntention/HCP_LOCAL", null);

				if (oInput.getSelectedKey() === "1") { //fob
					oCreateModel.setProperty("/noPriceBRF", false);
					oCreateModel.setProperty("/yesCalculator", true);
					oCreateModel.setProperty("/enablefob", true);
					oCreateModel.setProperty("/enablecif", false);
					oCreateModel.setProperty("/HCP_PRICE", null);
					oCreateModel.setProperty("/yesRequiredLocal", false);
				} else {
					oCreateModel.setProperty("/enabledLocal", false);
					oCreateModel.setProperty("/yesCalculator", false);
					oCreateModel.setProperty("/noPriceBRF", true);
					oCreateModel.setProperty("/enablefob", false);
					oCreateModel.setProperty("/enablecif", true);
					oCreateModel.setProperty("/HCP_KM", null);
					oCreateModel.setProperty("/HCP_AXES", null);
					oCreateModel.setProperty("/HCP_FREIGHT", null);
					oCreateModel.setProperty("/HCP_PRICE", null);
					oCreateModel.setProperty("/HCP_WAREHOUSE", "0");
					oCreateModel.setProperty("/yesRequiredLocal", true);
					oCreateModel.setProperty("/yesLocalItem", true);
					oCreateModel.setProperty("/yesTerceiro", false);

				}

			},
			_onInputArmazemFormSelect: function (oEvent) {

				var oModel = this.getView().getModel("priceIntentionFormModel");
				var oInput = oEvent.getSource();
				var oData = oModel.oData;

				oModel.setProperty("/editPriceIntention/HCP_LOCAL", null);
				// oModel.setProperty("/HCP_BLAND", null);
				oModel.setProperty("/enabledLocal", true);
				oModel.setProperty("/enabledBland", true);

				if (oInput.getSelectedKey() === "0") { //Próprio
					oModel.setProperty("/yesTerceiro", false);
					oModel.setProperty("/yesLocalItem", true);
					oModel.setProperty("/yesBlandItem", true);
					oModel.setProperty("/yesBlandView", false);
					oModel.setProperty("/yesDistance", true);

					if (oModel.oData.ItemLocal.length === 1) {
						oModel.setProperty("/enabledLocal", false);
						oModel.setProperty("/editPriceIntention/HCP_LOCAL", oModel.oData.ItemLocal[0].LIFNR);
					} else if (oModel.oData.ItemLocal.length === 0) {
						oModel.setProperty("/enabledLocal", false);
					}

					if (oModel.oData.ItemStates.length === 1) {
						oModel.setProperty("/enabledBland", false);
						oModel.setProperty("/editPriceIntention/HCP_BLAND", oModel.oData.ItemStates[0].BLAND);
					} else if (oModel.oData.ItemLocal.length === 0) {
						oModel.setProperty("/enabledBland", false);
					}

					if (oModel.oData.HCP_PARTNER_TYPE == "1") {
						oModel.setProperty("/yesTextDistance", false);
						this.searchKmPartner(oData.HCP_LOCAL, oData.HCP_WERKS).then(function () {}.bind(this));
					} else {
						oModel.setProperty("/yesTextDistance", true);
						oModel.setProperty("/editPriceIntention/HCP_DISTANCE", null);
						oModel.setProperty("/textDistance", this.resourceBundle.getText("errorDistanceNotFounded"));
					}

				} else {
					oModel.setProperty("/yesBlandItem", false);
					oModel.setProperty("/yesBlandView", true);
					oModel.setProperty("/yesTerceiro", true);
					oModel.setProperty("/yesLocalItem", false);
					oModel.setProperty("/enabledLocal", false);
					oModel.setProperty("/enabledBland", true);
					oModel.setProperty("/yesTextDistance", true);
					oModel.setProperty("/editPriceIntention/HCP_DISTANCE", null);
					oModel.setProperty("/textDistance", this.resourceBundle.getText("errorDistanceNotFounded"));
					oModel.setProperty("/yesDistance", false);
				}

				this._validateForm();
			},
			_createYear: function () {

				var min = new Date().getFullYear();
				var max = min + 1;
				var comboAno = this.getView().byId("comboAno");

				for (var i = min; i <= max; i++) {
					var newItem = new sap.ui.core.Item({
						key: i,
						text: i
					});
					comboAno.addItem(newItem);
				}
			},
			_onInputProspect: function (oEvent) {

				var oModelOffer = this.getView().getModel();
				var oModel = this.getView().getModel("priceIntentionFormModel");
				var oInput = oEvent.getSource();
				var aFilters = [];
				var oDataItemLocal = oModel.getProperty("/ItemLocal");
				oDataItemLocal = [];
				var oProspect = oInput.getSelectedKey();

				if (oProspect != "") {

					aFilters.push(new sap.ui.model.Filter({
						path: "HCP_PROSP_ID",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oProspect
					}));

					oModelOffer.read("/Prospects", {

						filters: aFilters,
						success: function (results) {

							var aResults = results.results;

							if (aResults.length > 0) {

								var sName = aResults[0].NAME1;
								if (aResults[0].NAME2) {
									sName = sName + aResults[0].NAME2;
								}

								var aData = {
									LIFNR: aResults[0].HCP_PROSP_ID,
									NAME1: sName,
									REGIO: aResults[0].BLAND,
									ORT01: aResults[0].ORT01
								};

								oDataItemLocal.push(aData);
								oModel.setProperty("/ItemLocal", oDataItemLocal);
								oModel.setProperty("/enabledLocal", false);
								oModel.setProperty("/HCP_LOCAL", aResults[0].HCP_PROSP_ID);
								oModel.setProperty("/enabledBland", false);
								oModel.setProperty("/HCP_STATE", aResults[0].BLAND);

								aFilters = [];

								aFilters.push(new sap.ui.model.Filter({
									path: "LAND1",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: aResults[0].LAND1
								}));

								aFilters.push(new sap.ui.model.Filter({
									path: "BLAND",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: aResults[0].BLAND
								}));

								this.getStatesOrigem(aFilters).then(function () {
									this._validateForm();
								}.bind(this));
							}

						}.bind(this),
						error: function (error) {}
					});

				}

				this._validateForm();

			},

			_onInputLocal: function (oEvent) {

				var oModelOffer = this.getView().getModel();
				var oModel = this.getView().getModel("priceIntentionFormModel");
				var oData = oModel.oData;
				var oInput = oEvent.getSource();
				var aFilters = [];
				var oLocal = oInput.getSelectedKey();

				this.searchKmPartner(oData.HCP_LOCAL, oData.HCP_WERKS);

				if ( /*oData.HCP_PARTNER_TYPE == '1' && */ oData.ItemLocal.length > 1 && oLocal != "") { //Fornecedor

					aFilters.push(new sap.ui.model.Filter({
						path: "LIFNR",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oLocal
					}));

					oModelOffer.read("/View_Suppliers", {

						filters: aFilters,
						success: function (results) {

							var aResults = results.results;

							if (aResults.length > 0) {
								oModel.setProperty("/ItemsLocal", aResults);
								oModel.setProperty("/HCP_STATE", aResults[0].REGIO);
								oModel.setProperty("/enabledBland", false);

							}

						}.bind(this),
						error: function (error) {
							aFilters = [];
						}
					});

				}

			},

			searchKmPartner: function (oPartner, oWerks) {

				var oModelVisit = this.getView().getModel();
				var oEditModel = this.getView().getModel("priceIntentionFormModel");
				var oData = oEditModel.oData;
				var aFilters = [];

				if (oPartner && oWerks && oData.HCP_INCOTERM == '2') {

					if (oData.HCP_WAREHOUSE == '1' && oData.HCP_PARTNER_TYPE == "1") {

						oEditModel.setProperty("/yesTextDistance", true);
						oEditModel.setProperty("/HCP_KM", 0);

						aFilters.push(new sap.ui.model.Filter({
							path: "OBJEK",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oPartner
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: "WERKS",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oWerks
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: "KLART",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: "010"
						}));

						oModelVisit.read("/View_Suppliers_Characteristics", {

							filters: aFilters,
							success: function (results) {

								var aResults = results.results;

								if (aResults.length > 0) {
									oEditModel.setProperty("/HCP_KM", aResults[0].ATFLV);
									oEditModel.setProperty("/textDistance", this.resourceBundle.getText("sucessProposedDistance"));
								} else {
									oEditModel.setProperty("/textDistance", this.resourceBundle.getText("errorDistanceNotFounded"));
								}

								this._calculatePriceFreight();
								this._calculatePriceFinal();
								this._validateForm();
								oEditModel.refresh();

							}.bind(this),
							error: function (error) {}
						});

					} else {
						oEditModel.setProperty("/yesTextDistance", true);
						oEditModel.setProperty("/HCP_KM", 0);
						oEditModel.setProperty("/textDistance", this.resourceBundle.getText("errorDistanceNotFounded"));
					}

				} else {
					oEditModel.setProperty("/yesTextDistance", false);
					this._calculatePriceFreight();
					this._calculatePriceFinal();
					this._validateForm();
				}

			},
			_createMonth: function () {

				var comboMes = this.getView().byId("comboMes");
				for (var mesList = 1; mesList <= 12; mesList++) {

					if (mesList < 10) {
						mesList = "0" + mesList;
					}

					var newItem = new sap.ui.core.Item({
						key: mesList,
						text: this._createMonthText(mesList)
					});
					comboMes.addItem(newItem);
				}
			},
			_createMonthText: function (month) {

				if (month === "01") {
					return this.resourceBundle.getText("january");
				} else if (month === "02") {
					return this.resourceBundle.getText("february");
				} else if (month === "03") {
					return this.resourceBundle.getText("march");
				} else if (month === "04") {
					return this.resourceBundle.getText("april");
				} else if (month === "05") {
					return this.resourceBundle.getText("may");
				} else if (month === "06") {
					return this.resourceBundle.getText("june");
				} else if (month === "07") {
					return this.resourceBundle.getText("july");
				} else if (month === "08") {
					return this.resourceBundle.getText("august");
				} else if (month === "09") {
					return this.resourceBundle.getText("september");
				} else if (month === 10) {
					return this.resourceBundle.getText("october");
				} else if (month === 11) {
					return this.resourceBundle.getText("november");
				} else {
					return this.resourceBundle.getText("december");
				}
			},

			refreshStore: function (entity) {
				return new Promise(function (resolve, reject) {
					if (typeof sap.hybrid !== 'undefined') {
						this.setBusyDialog("App Grãos", "Atualizando banco de dados");
						sap.hybrid.refreshStore(entity).then(function () {
							resolve();
						}.bind(this));
					} else {
						resolve();
					}
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
			backToIndex: function () {

				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("supplierExtract.priceIntention.Index", true);
			},
			_formatDate: function (oValue) {
				var oDate = null;
				// can be of type Date if consumed with OData (XML format)
				if (oValue instanceof Date) {
					oDate = oValue;
				}
				// can be a string primitive in JSON, but we need a number
				else if ((typeof oValue) === "string") {
					// can be of type JSON Date if consumed with OData (JSON format)
					if (oValue.indexOf("/") === 0) {
						oValue = oValue.replace(new RegExp("/", 'g'), "");
						oValue = oValue.replace(new RegExp("\\(", 'g'), "");
						oValue = oValue.replace(new RegExp("\\)", 'g'), "");
						oValue = oValue.replace("Date", "");
						oValue = parseInt(oValue);
						oDate = new Date(oValue);
					} else {
						// backward compatibility, old type was long, new type is date
						// check if not a number
						var result = isNaN(Number(oValue));
						if (result) {
							// FF and Ie cannot create Dates using 'DD-MM-YYYY HH:MM:SS.ss' format but
							// 'DD-MM-YYYYTHH:MM:SS.ss'
							oValue = oValue.replace(" ", "T");
							// this is a date type
							oDate = new Date(oValue);
						} else {
							// this is a long type
							oValue = parseInt(oValue);
							// ensure that UNIX timestamps are converted to milliseconds
							oDate = new Date(oValue * 1000);
						}
					}
				} else {
					// ensure that UNIX timestamps are converted to milliseconds
					oDate = new Date(oValue * 1000);
				}
				return oDate;
			},
			_onPageNavButtonPress: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {
					this.doNavigate("supplierExtract.priceIntention.Index", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
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
			_onNotificationListItemClose: function (oEvent) {
				var oCtrl = oEvent.getSource();
				var oParent = oCtrl.getParent();
				if (oParent instanceof sap.m.NotificationListGroup || oParent['removeItem']) {
					oParent.removeItem(oCtrl);
				} else if (oParent['removeContent']) {
					oParent.removeContent(oCtrl);
				} else {
					throw new Error('Cannot delete control', oCtrl.getMetadata().getName());
				}
			},
			_onRadioButtonSelect: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {

					this.doNavigate("priceIntention.New", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			},
			_handlePartnerFilterPress: function () {
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
			onPartnerDialogClose: function () {
				this.oPartnerFilter.close();
			},
			onPartnerSelected: function (oEvent) {
				var oSource = oEvent.getSource();
				var oPartnerInput = sap.ui.core.Fragment.byId("newVisitFormFragmentID" + this.getView().getId(), "inputpartnerID");
				var oVisitModel = this.getView().getModel("priceIntentionFormModel");
				var oData = oVisitModel.getProperty("/editPriceIntention");
				var SelectedPartner = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

				oData["HCP_PROVIDER"] = SelectedPartner.LIFNR;
				oData["PROVIDER_DESC"] = SelectedPartner.NAME1;

				// oPartnerInput.setDescription(SelectedPartner.NAME1);
				this._validateForm();
				oVisitModel.refresh();
				this.oPartnerFilter.destroy();

				this._onInputPartner(SelectedPartner);
				this._calculatePriceFreight();
				this._validateForm();

			},
			_onInputPartner: function (oSelectedPartner) {

				var oModelOffer = this.getView().getModel();
				var oModel = this.getView().getModel("priceIntentionFormModel");
				var oData = oModel.oData;
				var aFilters = [];

				oModel.setProperty("/editPriceIntention/HCP_STATE", null);
				oModel.setProperty("/ItemStates", []);
				oModel.setProperty("/ItemLocal", []);

				if (oSelectedPartner.AGRUPADO === 0) { //Não Agrupado

					oModel.setProperty("/enabledBland", false);
					oModel.setProperty("/enabledLocal", false);

					aFilters.push(new sap.ui.model.Filter({
						path: "LIFNR",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oSelectedPartner.HCP_REGISTER
					}));

				} else { //Agrupado

					oModel.setProperty("/enabledBland", true);
					oModel.setProperty("/enabledLocal", true);

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

				oModelOffer.read("/View_Suppliers", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;
						var oDataItem = oModel.getProperty("/ItemLocal");
						aFilters = [];

						if (aResults.length > 0) {

							aFilters.push(new sap.ui.model.Filter({
								path: "LAND1",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oSelectedPartner.LAND1
							}));

							for (var i = 0; i < aResults.length; i++) {

								aFilters.push(new sap.ui.model.Filter({
									path: "BLAND",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: aResults[i].REGIO
								}));

								if (aResults[i].STCD1) {
									var oStcdx = aResults[i].STCD1;
								} else {
									oStcdx = aResults[i].STCD2;
								}

								var aData = {
									LIFNR: aResults[i].LIFNR,
									NAME1: aResults[i].NAME1,
									REGIO: aResults[i].REGIO,
									STCDX: oStcdx
								};

								oDataItem.push(aData);

							}

							oModel.setProperty("/ItemLocal", oDataItem);

							if (oSelectedPartner.AGRUPADO === 0) { //Não Agrupado

								oModel.setProperty("/editPriceIntention/HCP_LOCAL", aResults[0].LIFNR);

							}

							var aFiltersAux = aFilters.filter(function (m, n) {
								return aFilters.indexOf(m) == n;
							});

							this.getStatesOrigem(aFilters).then(function () {
								this.searchKmPartner(oData.HCP_LOCAL, oData.HCP_WERKS);
								this._validateForm();
							}.bind(this));
						}

					}.bind(this),
					error: function (error) {
						aFilters = [];
					}
				});

			},
			_searchProspectName: function () {

				return new Promise(function (resolve, reject) {

					var oModelOffer = this.getView().getModel();
					var oEditModel = this.getView().getModel("priceIntentionFormModel");
					var oDataItemLocal = oEditModel.getProperty("/ItemLocal");
					oDataItemLocal = [];
					var aFilters = [];

					aFilters.push(new sap.ui.model.Filter({
						path: 'LIFNR',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oEditModel.oData.editPriceIntention.HCP_LOCAL
					}));

					oEditModel.setProperty("/enabledBland", false);

					oModelOffer.read("/View_Suppliers", {

						filters: aFilters,

						success: function (results) {

							var aResults = results.results;

							if (aResults.length > 0) {

								var sName = aResults[0].NAME1;
								if (aResults[0].NAME2) {
									sName = sName + aResults[0].NAME2;
								}

								if (aResults[0].STCD1) {
									var oStcdx = aResults[0].STCD1;
								} else {
									oStcdx = aResults[0].STCD2;
								}

								var aData = {
									LIFNR: aResults[0].LIFNR,
									NAME1: sName,
									REGIO: aResults[0].REGIO,
									ORT01: aResults[0].ORT01
								};

								oDataItemLocal.push(aData);
								oEditModel.setProperty("/ItemLocal", oDataItemLocal);
								oEditModel.setProperty("/editPriceIntention/PROVIDER_DESC", sName);
								this.closeBusyDialog();
							}

						}.bind(this),
						error: function () {
							reject();
						}
					});

				}.bind(this));

			},
			getStatesOrigem: function (oFilters) {

				return new Promise(function (resolve, reject) {

					var oModelOffer = this.getView().getModel();
					var oTableModel = this.getView().getModel("priceIntentionFormModel");
					var oDataItem = oTableModel.getProperty("/ItemStates");

					oModelOffer.read("/View_States", {

						filters: oFilters,
						success: function (results) {

							var aResults = results.results;

							if (aResults.length === 1) {
								oTableModel.setProperty("/enabledBland", false);
								oTableModel.setProperty("/editPriceIntention/HCP_STATE", aResults[0].BLAND);
							}

							for (var i = 0; i < aResults.length; i++) {

								var aData = {
									BLAND: aResults[i].BLAND,
									BEZEI: aResults[i].BEZEI
								};

								oDataItem.push(aData);
							}

							oTableModel.setProperty("/ItemStates", oDataItem);
							this._validateForm();
							resolve();

						}.bind(this),
						error: function (error) {
							this._validateForm();
							resolve();
						}
					});

				}.bind(this));

			},
			_calculatePriceFinal: function () {

				var oModel = this.getView().getModel("priceIntentionFormModel");
				var oData = oModel.oData;
				var oPrice = oData.HCP_PRICE_FOB;

				if (oData.yesCalculator === true) {
					if (oData.HCP_FREIGHT) {
						var oPriceFreight = oData.HCP_FREIGHT;
					}
				} else {
					if (oData.HCP_FREIGHT) {
						oPriceFreight = oData.HCP_FREIGHT;
					}
				}

				if (oPriceFreight) {

					if (oData.HCP_UM === 'SC') {
						oPrice = (oPriceFreight * 60) / 1000;
						oModel.setProperty("/priceFormated", parseFloat(oPrice).toFixed(2));
					} else {
						oPrice = oPriceFreight;
						oModel.setProperty("/priceFormated", parseFloat(oPrice).toFixed(2));
					}

					if (oData.HCP_PRICE_FOB) {

						oPrice = parseFloat(oPrice) + parseFloat(oData.HCP_PRICE_FOB);
						oModel.setProperty("/priceFormated", parseFloat(oPrice).toFixed(2));
					}

				}

				oModel.setProperty("/HCP_PRICE", oPrice);

			},

			_calculatePriceFreight: function () {

				var oModelOffer = this.getView().getModel();
				var oModel = this.getView().getModel("priceIntentionFormModel");
				var oData = oModel.oData;
				var aFilters = [];

				var iconterms = oModel.getProperty("/HCP_INCOTERMS");

				if (iconterms != "0") {

					oModel.setProperty("/HCP_FREIGHT", "0");
					oModel.setProperty("/HCP_PRICE", "0");
					oModel.setProperty("/noPricesCalculator", false);

					if (oData.HCP_CENTER && oData.HCP_STATE && oData.HCP_KM &&
						oData.HCP_UM && oData.HCP_MONTH && oData.HCP_YEAR && oData.yesCalculator === true) {

						this.getStates(oData.HCP_CENTER).then(function (oRegioDest) {

							if (oRegioDest) {

								var oDistance = oData.HCP_KM;
								// if (oData.HCP_TRECHO_KM) {
								// 	oDistance = oDistance - oData.HCP_TRECHO_KM;
								// }

								var oMonth = oData.HCP_MONTH;
								var oYear = oData.HCP_YEAR;

								/*NOVA*/

								aFilters.push(new sap.ui.model.Filter({
									path: "REGIO_ORIGEM",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: oData.HCP_STATE
								}));

								aFilters.push(new sap.ui.model.Filter({
									path: "REGIO_DESTINO",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: oRegioDest
								}));

								aFilters.push(new sap.ui.model.Filter({
									path: "MES",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: oMonth
								}));

								aFilters.push(new sap.ui.model.Filter({
									path: "ANO",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: oYear
								}));

								aFilters.push(new sap.ui.model.Filter({
									path: "KM_INICIAL",
									operator: sap.ui.model.FilterOperator.LE,
									value1: oDistance
								}));

								aFilters.push(new sap.ui.model.Filter({
									path: "KM_FINAL",
									operator: sap.ui.model.FilterOperator.GE,
									value1: oDistance
								}));

								oModelOffer.read("/Price_Freight", {

									filters: aFilters,
									success: function (results) {

										var aResults = results.results;

										if (aResults.length > 0) {

											var oPriceDistance = aResults[0].TARIFA * oDistance;

											if (oData.HCP_TRECHO_KM) {
												var oPriceKm = oData.tarifaKm * oData.HCP_TRECHO_KM;
												var oPrice = parseFloat(oPriceKm) + parseFloat(oPriceDistance);
											} else {
												oPrice = oPriceDistance;
											}

											oModel.setProperty("/HCP_FREIGHT", oPrice);

											if (oData.HCP_UM === 'SC') {
												oPrice = (oPrice * 60) / 1000;
											}

											if (oData.HCP_PRICE_FOB) {
												oPrice = parseFloat(oPrice) + parseFloat(oData.HCP_PRICE_FOB);
											}
											oModel.setProperty("/enablefreight", false);
											oModel.setProperty("/noPriceBRF", false);
											oModel.setProperty("/HCP_PRICE", oPrice);
											oModel.setProperty("/priceFormated", parseFloat(oPrice).toFixed(2));

										} else {
											oModel.setProperty("/enablefreight", true);
											oModel.setProperty("/noPricesCalculator", true);
										}

									}.bind(this),
									error: function (error) {
										oModel.setProperty("/noPricesCalculator", true);
									}
								});
							}

						}.bind(this));

					}

					this._calculatePriceFinal();

				}
				this._validateForm();

			},
			getStates: function (oPlant) {

				return new Promise(function (resolve, reject) {

					var oModelOffer = this.getView().getModel();
					var oModel = this.getView().getModel("priceIntentionFormModel");
					var aFilters = [];

					aFilters.push(new sap.ui.model.Filter({
						path: "WERKS",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oPlant
					}));

					// aFilters.push(new sap.ui.model.Filter({
					// 	path: "LAND1",
					// 	operator: sap.ui.model.FilterOperator.EQ,
					// 	value1: "BR"
					// }));

					oModelOffer.read("/View_Center", {

						filters: aFilters,
						success: function (results) {

							var aResults = results.results;
							resolve(aResults[0].REGIO);

						}.bind(this),
						error: function (error) {
							this.closeBusyDialog();
							resolve();
						}
					});

				}.bind(this));

			},
			_valideInputPrice: function (oProperty) {

				var oSource = oProperty.getSource();
				var sValue;

				sValue = oProperty.mParameters.newValue;
				sValue = sValue.replace(/[^0-9,]/g, "");
				this.oNumberFormat.format(sValue);

				oSource.setValue(sValue);

				this._calculatePriceFreight();
				this._validateForm();
			},

			_getFormFields: function () {

				var oMainDataForm = this.byId("priceIntentionCreateFormID").getContent();
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
			_validateForm: function (oEvent) {

				var fieldName = '';
				var oFilterModel = this.getView().getModel("priceIntentionFormModel");
				var iconterms = oFilterModel.getProperty("/editPriceIntention/HCP_INCOTERMS");

				if (oEvent) {
					fieldName = oEvent.getSource().getName();
				}

				if (fieldName === 'TABLE_PRICE') {
					this.updateTablePrice();
					if (iconterms != "0") {
						this._calculatePriceFreight();
					}
				}
				if (iconterms != "0") {
					if (fieldName === 'FRETE') {
						this._calculatePriceFreight();
					}
				}

				if (fieldName === 'FIELD_PRICE') {

					oFilterModel.setProperty("/priceFormated", oEvent.getSource().getValue() === null ? parseFloat(0).toFixed() : oEvent.getSource().getValue() ===
						"" ? parseFloat(0).toFixed() : parseFloat(oEvent.getSource().getValue()).toFixed(2));
				}

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
								oFilterModel.setProperty("/enableCreate", true);
							} else {
								oFilterModel.setProperty("/enableCreate", false);
								return;
							}
						}
					}
				}.bind(this), 100);
			},

			updateTablePrice: function () {

				var oCreateModel = this.getView().getModel("priceIntentionFormModel");
				var oData = oCreateModel.getProperty("/editPriceIntention");
				var oModel = this.getOwnerComponent().getModel();
				var aFilters = [];
				var oFieldMont;
				if (oData.HCP_MONTH < 10) {
					oFieldMont = "PRECO_0" + oData.HCP_MONTH;
				} else {
					oFieldMont = "PRECO_" + oData.HCP_MONTH;
				}
				var self = this;

				if (oData.HCP_BUYER_GROUP && oData.HCP_CENTER && oData.HCP_TPCEREAL && oData.HCP_STATE && oData.HCP_MATERIAL && oData.HCP_YEAR &&
					oData.HCP_MONTH) {

					this.setBusyDialog("Intenção de Preços", "Consultando Tabela de Preços para o centro. Aguarde!");

					var oRegioDest;
					this.getStates(oData.HCP_CENTER).then(function (oRegioDest) {

						aFilters.push(new sap.ui.model.Filter({
							path: "EKGRP",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.HCP_BUYER_GROUP
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: "WERKS",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.HCP_CENTER
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: "REGIO",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oRegioDest
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: "MATNR",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.HCP_MATERIAL
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: "TPCEREAL",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.HCP_TPCEREAL
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: "FND_YEAR",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.HCP_YEAR
						}));

						oModel.read("/Table_Price", {

							filters: aFilters,
							success: function (results) {

								if (results.results.length > 0) {

									if (results.results[0][oFieldMont] != "0") {
										oCreateModel.setProperty("/tablePriceFormated", parseFloat(results.results[0][oFieldMont]).toFixed(2));
										oData.HCP_TABLE_PRICE = results.results[0][oFieldMont];
									} else {
										oData.HCP_TABLE_PRICE = 0;
										oCreateModel.setProperty("/tablePriceFormated", 0);
									}
									var iconterms = oCreateModel.getProperty("/HCP_INCOTERMS");
									if (iconterms != "1") {
										oCreateModel.setProperty("/noPriceBRF", true);
									} else {
										oCreateModel.setProperty("/noPriceBRF", false);
									}

									oCreateModel.setProperty("/priceListStatus", "Success");

								} else {
									oCreateModel.setProperty("/priceListStatus", "Information");
									oData.HCP_TABLE_PRICE = 0;
									oData.HCP_PRICE_LIST = 0;
									oData.HCP_PRICE_CALCULATED = 0;
									oData.HCP_PRICE_DIFF = 0;
									oCreateModel.setProperty("/noPriceBRF", true);
								}

								oCreateModel.refresh();
								self.closeBusyDialog();
								self._validateForm();

							}.bind(this),
							error: function (error) {
								self.closeBusyDialog();
							}
						});

					});
				} else {
					//oCreateModel.setProperty("/enableCreate", false);
				}
			},
			_onSave: function () {

				this.setBusyDialog("App Grãos", "Editando, aguarde");

				var oCreateModel = this.getView().getModel("priceIntentionFormModel");

				var oData = oCreateModel.getProperty("/editPriceIntention");

				var oModel = this.getOwnerComponent().getModel();
				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;
				var sPath;
				var aDeferredGroups = oModel.getDeferredGroups();

				oModel.setUseBatch(true);

				if (aDeferredGroups.indexOf("changes") < 0) {
					aDeferredGroups.push("changes");
					oModel.setDeferredGroups(aDeferredGroups);
				}

				var status;

				if (oCreateModel.getProperty("/statusIntention")) {
					status = "1";
				} else {
					status = "0";
				}

				var oProperties = {
					HCP_BUYER_GROUP: oData.HCP_BUYER_GROUP,
					HCP_LIFNR: oData.HCP_LIFNR,
					HCP_STATE: oData.HCP_STATE,
					HCP_CENTER: oData.HCP_CENTER,
					HCP_PROVIDER: oData.HCP_PROVIDER,
					HCP_LOCAL: oData.HCP_LOCAL,
					HCP_MATERIAL: oData.HCP_MATERIAL,
					HCP_TPCEREAL: oData.HCP_TPCEREAL,
					HCP_INCOTERMS: oData.HCP_INCOTERMS,
					HCP_WAREHOUSE: oData.HCP_WAREHOUSE,
					HCP_MONTH: oData.HCP_MONTH,
					HCP_YEAR: oData.HCP_YEAR,
					HCP_PRICE: oData.HCP_PRICE === null ? parseFloat(0).toFixed() : parseFloat(oData.HCP_PRICE).toFixed(2),
					HCP_UM: oData.HCP_UM,
					HCP_KM: oData.HCP_KM === null ? parseFloat(0).toFixed() : parseFloat(oData.HCP_KM).toFixed(),
					HCP_AXES: oData.HCP_AXES === null ? parseFloat(0).toFixed() : parseFloat(oData.HCP_AXES).toFixed(),
					HCP_FREIGHT: oData.HCP_FREIGHT === null ? parseFloat(0).toFixed() : parseFloat(oData.HCP_FREIGHT).toFixed(2),
					HCP_TABLE_PRICE: oData.HCP_TABLE_PRICE === null ? parseFloat(0).toFixed() : parseFloat(oData.HCP_TABLE_PRICE).toFixed(2),
					HCP_MOEDA: oData.HCP_MOEDA,
					HCP_CREATED_BY: this.userName,
					HCP_UPDATED_BY: this.userName,
					HCP_UPDATED_AT: this._formatDate(new Date()),
					HCP_CREATED_AT: this._formatDate(new Date()),
					HCP_VOLUME: oData.HCP_VOLUME === null ? parseFloat(0).toFixed() : parseFloat(oData.HCP_VOLUME).toFixed(),
					HCP_PRICE_FOB: oData.HCP_PRICE_FOB === null ? parseFloat(0).toFixed() : parseFloat(oData.HCP_PRICE_FOB).toFixed(2),
					HCP_TOTAL_PRICE: parseFloat(0).toFixed(2),
					HCP_STATUS: status,
					HCP_READ_MESSAGE: "0",
					HCP_OTHER_LOCAL: oData.HCP_OTHER_LOCAL,
					HCP_TEL_LOCAL: oData.HCP_TEL_LOCAL,
					HCP_MIN_PRICE: oData.HCP_MIN_PRICE === null ? parseFloat(0).toFixed() : parseFloat(oData.HCP_MIN_PRICE).toFixed(2),
					HCP_TRECHO_KM: oData.HCP_TRECHO_KM,
					HCP_PAVED: oData.HCP_PAVED
				};

				sPath = this.buildEntityPath("Price_Intention", oData);

				oModel.update(sPath, oProperties, {
					groupId: "changes"
				});

				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

					oModel.submitChanges({
						groupId: "changes",
						success: function () {
							this.flushStore("Price_Intention").then(function () {
								this.refreshStore("Price_Intention").then(function () {

									MessageBox.success(
										"Intenção Editada com sucesso.", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												//this.navBack();
												this.closeBusyDialog();
												this.backToIndex();

											}.bind(this)
										}
									);

								}.bind(this));
							}.bind(this));
						}.bind(this),
						error: function () {
							this.closeBusyDialog();
							MessageBox.error("Erro ao editar Intenção.");
						}.bind(this)
					});

				} else {

					oModel.submitChanges({
						groupId: "changes",
						success: function () {
							MessageBox.success(
								"Intenção Editada com sucesso.", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										//this.navBack();
										this.closeBusyDialog();
										this.backToIndex();
									}.bind(this)
								}
							);
						}.bind(this),
						error: function () {
							MessageBox.error("Erro ao editar Intenção.");
						}.bind(this)
					});
				}

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
			buildEntityPath: function (sEntityName, oEntity) {

				if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
					var aUri = oEntity.__metadata.uri.split("/");
					return "/" + aUri[aUri.length - 1];
				} else {
					return "/" + sEntityName + "(" + oEntity.HCP_PRICE_INTENTION_ID + "l)";
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
			_onCancel: function (oEvent) {

				if (this.sOperation == 'View') {
					this.navBack();
				} else {
					this.setBusyDialog("App Grãos", "Aguarde");
					var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

					MessageBox.warning(
						"Tem certeza que deseja voltar? As informações cadastradas não serão salvas!", {
							actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
							styleClass: bCompact ? "sapUiSizeCompact" : "",
							onClose: function (sAction) {
								if (sAction === "YES") {
									this.navBack();
									this.closeBusyDialog();
								} else {
									this.closeBusyDialog();
								}
							}.bind(this)
						}
					);
				}

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
			}
		});
	},
	/* bExport= */
	true);