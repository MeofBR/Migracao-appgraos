	sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
		"sap/m/MessageBox",
		"sap/ui/core/routing/History",
		"sap/ui/model/json/JSONModel",
		"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
	], function (MainController, MessageBox, History, JSONModel, formatter) {
		"use strict";

		return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.price.priceIntention.Index", {
			formatter: formatter,

			onInit: function () {

				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getRoute("price.priceIntention.Index").attachPatternMatched(this.handleRouteMatched, this);
				this.getView().setModel(new sap.ui.model.json.JSONModel({
					isMobile: false,
					isWeb: false
				}), "indexModel");
				this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			},

			handleRouteMatched: function (oEvent) {
				this.getUser().then(function (userName) {
					this.userName = userName;
					this.getIntention("1");
				}.bind(this));

				this.getView().setModel(new sap.ui.model.json.JSONModel({
					ItemIntention: [],
					ItemIntentionInactive: []
				}), "priceIntention");
				
				
				var oModelFilters = new JSONModel({
					HCP_MATERIAL: "",
					HCP_STATE: ""
				});

				this.getView().setModel(oModelFilters, "filters");

				var tableModel = this.getView().getModel("priceIntention");
				tableModel.setProperty("/materialNumero", 0);
				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;
				this.getUser().then(function (userName) {
					this.userName = userName;
				}.bind(this));

				var lastUpdate;

				var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd/MM/yyyy HH:mm"
				});

				if (localStorage.getItem("lastUpdatePriceIntention")) {
					lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdatePriceIntention")));
				} else {
					lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdate")));
				}
				this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdate);

				if (bIsMobile) {
					this.getView().getModel("indexModel").setProperty("/isMobile", true);
					this.getView().getModel("indexModel").setProperty("/isWeb", false);
				} else {
					this.getView().getModel("indexModel").setProperty("/isMobile", false);
					this.getView().getModel("indexModel").setProperty("/isWeb", true);
				}

				var oIconTabBar = this.getView().byId("idIconTabBarMulti");
				oIconTabBar.setSelectedKey("Ativo");
				this.statusList = "1";

				//this.refreshData();

			},
			getIntention: function (status) {

				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;
				this.setBusyDialog("Intenção de preços", "Filtrando dados...");
				var oModel = this.getView().getModel();
				var oModelFilter = this.getView().getModel("filters");
				var aFilters = [];
				var oView = this.getView();
				
			
				if(oModelFilter.oData.HCP_MATERIAL != ""){
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_TPCEREAL',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oModelFilter.oData.HCP_MATERIAL
					}));
				}
				
				
				if(oModelFilter.oData.HCP_STATE != ""){
					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_STATE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oModelFilter.oData.HCP_STATE
					}));
				}
				
			
				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_STATUS',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: status
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_CREATED_BY',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: this.userName
				}));
				

				oModel.read("/Price_Intention", {
					filters: aFilters,
					urlParameters: {
						"$expand": "View_Intention_Material_Type,View_Intention_Suppliers,View_Prospect"
					},
					success: function (result) {
						
						var priceIntention = oView.getModel("priceIntention");
							
						priceIntention.setProperty("/ItemIntention", []);
						priceIntention.setProperty("/ItemIntentionInactive", []);
					

						if (result.results.length > 0) {

							if (status == "1") {
								priceIntention.setProperty("/ItemIntention", result.results);
							} else {
								priceIntention.setProperty("/ItemIntentionInactive", result.results);
							}

							if (bIsMobile) {

								this.onUpdateFinished(status).then(function () {
									var oTableActive;
									if (status == "1") {
										oTableActive = oView.byId("listIntention");
									} else {
										oTableActive = oView.byId("listIntentionInactive");
									}
									oTableActive.getBinding("items").refresh();

								});
							}
						}
						this.closeBusyDialog();
					}.bind(this)
				});
			},
			handleIconTabBarSelect: function (oEvent) {
				var sKey = oEvent.getParameter("key");

				if (sKey == "Ativo") {
					this.statusList = "1";
					this.getIntention("1");
				} else {
					this.statusList = "0";
					this.getIntention("0");
				}

			},
			handleRadioButtonGroupsSelectedIndex: function () {
				var that = this;
				this.aRadioButtonGroupIds.forEach(function (sRadioButtonGroupId) {
					var oRadioButtonGroup = that.byId(sRadioButtonGroupId);
					var oButtonsBinding = oRadioButtonGroup ? oRadioButtonGroup.getBinding("buttons") : undefined;
					if (oButtonsBinding) {
						var oSelectedIndexBinding = oRadioButtonGroup.getBinding("selectedIndex");
						var iSelectedIndex = oRadioButtonGroup.getSelectedIndex();
						oButtonsBinding.attachEventOnce("change", function () {
							if (oSelectedIndexBinding) {
								oSelectedIndexBinding.refresh(true);
							} else {
								oRadioButtonGroup.setSelectedIndex(iSelectedIndex);
							}
						});
					}
				});

			},
			_onPageNavButtonPress: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {

					this.doNavigate("Index", oBindingContext, fnResolve, "");
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
			convertTextToIndexFormatter: function (sTextValue) {
				var oRadioButtonGroup = this.byId(
					"sap_Responsive_Page_0-mem6err5w501nofalvq871fc4_S4-content-build_simple_form_Form-1539702593366-formContainers-build_simple_form_FormContainer-1-formElements-build_simple_form_FormElement-1539702908392-fields-sap_m_RadioButtonGroup-1539703677050-hcjk5pn9tfli3robr87mmgw279_S79"
				);
				var oButtonsBindingInfo = oRadioButtonGroup.getBindingInfo("buttons");
				if (oButtonsBindingInfo && oButtonsBindingInfo.binding) {
					// look up index in bound context
					var sTextBindingPath = oButtonsBindingInfo.template.getBindingPath("text");
					return oButtonsBindingInfo.binding.getContexts(oButtonsBindingInfo.startIndex, oButtonsBindingInfo.length).findIndex(function (
						oButtonContext) {
						return oButtonContext.getProperty(sTextBindingPath) === sTextValue;
					});
				} else {
					// look up index in static items
					return oRadioButtonGroup.getButtons().findIndex(function (oButton) {
						return oButton.getText() === sTextValue;
					});
				}

			},
			formatDateUTCtoLocale: function (dDate) {
				if (dDate) {
					return new Date(dDate.getUTCFullYear(), dDate.getUTCMonth(), dDate.getUTCDate());
				}
				return dDate;

			},
			_onRowPress: function (oEvent) {

				var sPath = oEvent.getSource().oBindingContexts.priceIntention.sPath;
				var sPlit = oEvent.getSource().oBindingContexts.priceIntention.sPath.split("/");
				var sIndex = sPlit[2];
				var oData;
				if (this.statusList == "1") {
					oData = oEvent.getSource().oBindingContexts.priceIntention.oModel.oData.ItemIntention[sIndex];
				} else {
					oData = oEvent.getSource().oBindingContexts.priceIntention.oModel.oData.ItemIntentionInactive[sIndex];
				}

				sPath = this.buildEntityPath("Price_Intention", oData);

				this.oRouter.navTo("price.priceIntention.Edit", {
					keyData: encodeURIComponent(sPath),
					option: encodeURIComponent("priceIntention")
				}, false);
			},

			_onEditIntentionFormPress: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {
					this.doNavigate("price.priceIntention.Edit", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});

			},
			_createMonthText: function (month) {

				if (month === 1) {
					return this.resourceBundle.getText("january");
				} else if (month === 2) {
					return this.resourceBundle.getText("february");
				} else if (month === 3) {
					return this.resourceBundle.getText("march");
				} else if (month === 4) {
					return this.resourceBundle.getText("april");
				} else if (month === 5) {
					return this.resourceBundle.getText("may");
				} else if (month === 6) {
					return this.resourceBundle.getText("june");
				} else if (month === 7) {
					return this.resourceBundle.getText("july");
				} else if (month === 8) {
					return this.resourceBundle.getText("august");
				} else if (month === 9) {
					return this.resourceBundle.getText("september");
				} else if (month === 10) {
					return this.resourceBundle.getText("october");
				} else if (month === 11) {
					return this.resourceBundle.getText("november");
				} else {
					return this.resourceBundle.getText("december");
				}
			},
			buildEntityPath: function (sEntityName, oEntity) {

				if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
					var aUri = oEntity.__metadata.uri.split("/");
					return "/" + aUri[aUri.length - 1];
				} else {
					return "/" + sEntityName + "(" + oEntity.HCP_PRICE_INTENTION_ID + "l)";
				}
			},
			onRefreshButton: function () {
				if (typeof sap.hybrid !== 'undefined') {
					sap.hybrid.refreshStore();
				}
			},

			onFlushButton: function () {
				if (typeof sap.hybrid !== 'undefined') {
					sap.hybrid.flushStore();
				}
			},

			refreshStore: function (entity1, entity2, entity3, entity4) {
				return new Promise(function (resolve, reject) {
					if (typeof sap.hybrid !== 'undefined') {
						this.setBusyDialog("App Grãos", "Atualizando banco de dados");
						sap.hybrid.refreshStore(entity1, entity2, entity3, entity4).then(function () {
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
			_onButtonPress1: function (oEvent) {

				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {

					this.doNavigate("price.priceIntention.New", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});

			},

			refreshData: function () {

				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;

				var aRefreshView = ["Price_Intention"];

				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

					var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
						pattern: "dd/MM/yyyy HH:mm"
					});

					var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
					var sMessage = "Tem certeza que deseja atualizar a base da Intenção de Preços? Verifique a qualidade da conexão.";

					MessageBox.warning(
						sMessage, {
							actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
							styleClass: bCompact ? "sapUiSizeCompact" : "",
							onClose: function (sAction) {
								if (sAction === "YES") {
									this.setBusyDialog(
										this.resourceBundle.getText("textGrainApp"), this.resourceBundle.getText("textWait"));
									this.flushStore("Price_Intention").then(function () {
										this.refreshStore(aRefreshView).then(function () {
											localStorage.setItem("lastUpdatePriceIntention", new Date());
											var lastUpdateSchedule = dateFormat.format(new Date(localStorage.getItem("lastUpdatePriceIntention")));

											this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdateSchedule);
											this.getView().getModel().refresh(true);
											//this.getView().byId("pullToRefreshID").hide();
											this.closeBusyDialog();
										}.bind(this));
									}.bind(this));

								}
							}.bind(this)
						}
					);

				} else {
					this.getView().getModel().refresh(true);
					//this.getView().byId("pullToRefreshID").hide();
					this.closeBusyDialog();
				}

			},

			onUpdateFinished: function (status) {

				this.setBusyDialog(this.resourceBundle.getText("textGrainApp"), this.resourceBundle.getText("textWait"));

				return new Promise(function (resolve, reject) {

					var oView = this.getView();
					var oModel = this.getView().getModel();
					var priceIntention = this.getView().getModel("priceIntention");
					var oTableActive;

					if (status == "1") {
						oTableActive = oView.byId("listIntention");
					} else {
						oTableActive = oView.byId("listIntentionInactive");
					}

					var items = oTableActive.getBinding("items");
					var oList = items.oList;

					var aPromises = [];

					for (var i = 0; i < oList.length; i++) {

						var aFilters = [];
						var aFiltersSupplier = [];
						var aFiltersProspect = [];

						if (oList[i]["@com.sap.vocabularies.Offline.v1.isLocal"]) {

							aPromises.push(new Promise(function (resolveMaterial, reject) {

								var index = i;

								aFilters.push(new sap.ui.model.Filter({
									path: "TPCEREAL",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: oList[i].HCP_TPCEREAL
								}));

								oModel.read("/View_Material_Type_Price", {
									filters: aFilters,
									success: function (result) {

										var aResults = result.results;

										if (aResults.length > 0) {
											priceIntention.setProperty("/ItemIntention/" + index + "/View_Intention_Material_Type", aResults[0]);
											priceIntention.setProperty("/ItemIntention/" + index + "/HCP_PRICE_INTENTION_ID", "Registro Offline");
											priceIntention.refresh();

										}

										resolveMaterial();

									}.bind(this),
									error: function () {
										console.log("error");
									}
								});

							}.bind(this)));

							if (oList[i].HCP_LOCAL != null) {

								aPromises.push(new Promise(function (resolves, reject) {

									var index = i;

									aFiltersSupplier.push(new sap.ui.model.Filter({
										path: "LIFNR",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: oList[i].HCP_LOCAL
									}));
									oModel.read("/View_Suppliers", {
										filters: aFiltersSupplier,
										success: function (result) {

											var aResultsSup = result.results;

											if (aResultsSup.length > 0) {
												priceIntention.setProperty("/ItemIntention/" + index + "/View_Intention_Suppliers", aResultsSup[0]);
												priceIntention.refresh();
											}
											resolves();

											this.closeBusyDialog();

										}.bind(this),
										error: function () {
											console.log("error");
										}
									});

									aFiltersProspect.push(new sap.ui.model.Filter({
										path: "HCP_PROSP_ID",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: oList[i].HCP_LOCAL
									}));
									oModel.read("/Prospects", {
										filters: aFiltersProspect,
										success: function (result) {

											var aResultsPro = result.results;

											if (aResultsPro.length > 0) {
												priceIntention.setProperty("/ItemIntention/" + index + "/View_Prospect", aResultsPro[0]);
												priceIntention.refresh();
											}
											resolves();

											this.closeBusyDialog();

										}.bind(this),
										error: function () {
											console.log("error");
										}
									});

								}.bind(this)));
							}

						}
					}

					Promise.all(aPromises).then(function () {
						resolve();
					}.bind(this));

				}.bind(this));

			},
			filterButtonPressed: function (oEvent) {
				if (!this._FragmentFilter) {
					this._FragmentFilter = sap.ui.xmlfragment(
						"com.sap.build.standard.brfAppDeGraosModoEditar.view.price.priceIntention.fragments.FragmentFilter",
						this);

					var oModelFilters = new JSONModel({
						HCP_MATERIAL: "",
						HCP_STATE: ""
					});

					this.getView().setModel(oModelFilters, "filters");
					this.getView().addDependent(this._FragmentFilter);

				}

				this._FragmentFilter.openBy(oEvent.getSource());
			},
			submitFilterList: function (oEvent) {
				console.log(this.statusList);
				
				
				if(this.statusList == "1"){
					this.getIntention("1");
				}else{
					this.getIntention("0");
				}
			}

		});
	}, /* bExport= */ true);