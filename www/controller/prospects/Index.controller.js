sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, JSONModel, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.prospects.Index", {
		formatter: formatter,
		handleRouteMatched: function (oEvent) {

			this.count = 0;
			this.revertCount = 20;
			this.hasFinished = false;
			//this.getOwnerComponent().getModel().resetChanges();
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));
			var oProspects = new JSONModel();
			this.getView().setModel(oProspects, "prospects");
			var oModel = this.getOwnerComponent().getModel();
			var oComponent = this.getOwnerComponent();
			var oDeviceModel = oComponent.getModel("device");
			this.getView().setModel(oDeviceModel, "device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			this.arrayProspect = [];
			this.arrayRefused = [];

			this.setBusyDialog("App Grãos", "Carregando dados, por favor aguarde");

			setTimeout(function () {

				oModel.read("/Prospects", {
					success: function (oData) {
						this.arrayProspect = oData.results;
						oModel.read("/View_Refused", {
							success: function (oResultsRefuseds) {
								this.arrayRefused = oResultsRefuseds.results;
								this.changeRefusedList(this.arrayProspect, this.arrayRefused);
								this.closeBusyDialog();
							}.bind(this)
						});
					}.bind(this)
				});

			}.bind(this), 500);

			var lastUpdate;

			var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/yyyy HH:mm"
			});

			if (localStorage.getItem("lastUpdateProspects")) {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdateProspects")));
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

			this.closeBusyDialog();
			//var oModelOwner = this.getOwnerComponent().getModel();
			//oModelOwner.refresh(true);

		},

		onInit: function () {

			this.setBusyDialog("App Grãos", "Carregando dados, por favor aguarde");
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false,
				isWeb: false
			}), "indexModel");
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("prospects.Index").attachPatternMatched(this.handleRouteMatched, this);

		},

		changeRefusedList: function (arrayProspect, arrayRefused) {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var oModel = this.getOwnerComponent().getModel();
			var prospectModel = this.getView().getModel("prospects");
			var oTable = this.getView().byId("table");
			var arrayCharacteristics = [];

			oModel.setUseBatch(true);

			for (var data in arrayProspect) {

				if (arrayProspect[data].LIFNR && arrayProspect[data].HCP_STATUS !== '5') {

					var oPropertiesSuppler = {
						HCP_STATUS: "5",
						HCP_UPDATED_AT: new Date()
					};

					oModel.update("/Prospects(" + arrayProspect[data].HCP_PROSP_ID + ")", oPropertiesSuppler, {
						groupId: "changes"
					});
				} else {
					if (arrayProspect[data].NRSOL) {
						for (var data2 in arrayRefused) {
							if (arrayProspect[data].NRSOL === arrayRefused[data2].NRSOL && arrayProspect[data].HCP_STATUS !== '4') {
								var oPropertiesRefused = {
									HCP_STATUS: "4",
									HCP_UPDATED_AT: new Date()
								};

								oModel.update("/Prospects(" + arrayProspect[data].HCP_PROSP_ID + ")", oPropertiesRefused, {
									groupId: "changes"
								});
							}
						}

					}
				}

				if (arrayProspect[data].LIFNR) {
					arrayCharacteristics.push(arrayProspect[data]);
				}
			}
			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

				if (arrayCharacteristics.length > 0) {
					this.checkCharacteristics(arrayCharacteristics).then(function () {
						oModel.read("/Prospects", {
							success: function (oDataProspect) {
								//this.flushStore("Prospects,Characteristics,Banks,Irf").then(function () {
								//this.refreshStore("Prospects", "Characteristics", "Banks", "Irf").then(function () {
								prospectModel.setProperty("/data", oDataProspect.results);
								prospectModel.setProperty("/count", oDataProspect.results.length);
								if (oTable.getBinding("items")) {
									oTable.getBinding("items").refresh();
								}
								this.closeBusyDialog();
								//}.bind(this));
								//}.bind(this));
							}.bind(this)
						});

					}.bind(this)).catch(function (err) {
						console.log("erro ao enviar características : " + err);
					});
				} else {

					oModel.read("/Prospects", {
						success: function (oDataProspect) {
							//this.flushStore("Prospects,Characteristics,Banks,Irf").then(function () {
							//this.refreshStore("Prospects", "Characteristics", "Banks", "Irf").then(function () {
							prospectModel.setProperty("/data", oDataProspect.results);
							prospectModel.setProperty("/count", oDataProspect.results.length);
							if (oTable.getBinding("items")) {
								oTable.getBinding("items").refresh();
							}
							this.closeBusyDialog();
							//}.bind(this));
							//}.bind(this));
						}.bind(this)
					});
				}

			} else {
				oModel.read("/Prospects", {
					success: function (oDataProspect) {
						prospectModel.setProperty("/data", oDataProspect.results);
						prospectModel.setProperty("/count", oDataProspect.results.length);
						if (oTable.getBinding("items")) {
							oTable.getBinding("items").refresh();
						}
						this.closeBusyDialog();
					}.bind(this)
				});
			}
			oModel.submitChanges();
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

			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}

		},

		_onRowPress: function (oEvent) {

			var oItem = oEvent.getSource();

			this.oRouter.navTo("prospects.Edit", {
				PROSP_ID: encodeURIComponent(oItem.getBindingContext().getPath())
			});

		},
		_onButtonPress: function (oEvent) {

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
	_onButtonPress1: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("prospects.New", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		filterButtonPressed: function (oEvent) {
			if (!this._FragmentFilter) {
				this._FragmentFilter = sap.ui.xmlfragment(
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.prospects.fragments.FragmentFilter",
					this);

				var oModelFilters = new JSONModel({
					HCP_CODE: "",
					NAME1: "",
					BLAND: "",
					HCP_CREATED_AT: ""
				});

				this.getView().setModel(oModelFilters, "filters");
				this.getView().addDependent(this._FragmentFilter);

			}

			this._FragmentFilter.openBy(oEvent.getSource());
		},
		submitFilterList: function (oEvent) {
			var oFilterModel = this.getView().getModel("filters");
			var oFiltertData = oFilterModel.getProperty("/");

			var oTable = this.getView().byId("table");
			var oFilters = [];

			oFiltertData.HCP_CODE ? oFilters.push(new sap.ui.model.Filter("Prosp_Code/HCP_CODE", sap.ui.model.FilterOperator.Contains,
					oFiltertData.HCP_CODE)) :
				false;

			oFiltertData.NAME1 ? oFilters.push(new sap.ui.model.Filter("NAME1", sap.ui.model.FilterOperator.Contains, oFiltertData.NAME1)) :
				false;
			oFiltertData.BLAND ? oFilters.push(new sap.ui.model.Filter("BLAND", sap.ui.model.FilterOperator.EQ, oFiltertData.BLAND)) : false;

			var date_start = oFiltertData.HCP_START_DATE ? new Date(oFiltertData.HCP_START_DATE.setHours(0)) : '';
			var HCP_START_DATE = date_start ? date_start.setDate(date_start.getDate() + 1) : false;

			var date_end = oFiltertData.HCP_END_DATE ? new Date(oFiltertData.HCP_END_DATE.setHours(23, 40)) : '';
			var HCP_END_DATE = date_end ? date_end.setDate(date_end.getDate() + 1) : false;

			if (HCP_START_DATE && HCP_END_DATE) {
				oFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
					.BT,
					new Date(HCP_START_DATE), new Date(HCP_END_DATE)));
			}

			oFiltertData.HCP_CREATED_BY ? oFilters.push(new sap.ui.model.Filter("HCP_CREATED_BY", sap.ui.model.FilterOperator.Contains,
					oFiltertData.HCP_CREATED_BY)) :
				false;

			oTable.getBinding("items").filter(oFilters);

			this._FragmentFilter.close();
		},
		sortButtonPressed: function (oEvent) {
			if (!this.SortDialog) {
				this.SortDialog = sap.ui.xmlfragment("com.sap.build.standard.brfAppDeGraosModoEditar.view.prospects.fragments.SortDialog",
					this);

				this.getView().addDependent(this.SortDialog);
			}

			this.SortDialog.openBy(oEvent.getSource());
		},
		submitSortList: function () {

			var oSelectedColumn = sap.ui.getCore().byId("group_column").getSelectedButton().getId();
			var oSelectedSort = sap.ui.getCore().byId("group_sort").getSelectedButton().getId();

			var oSorter = [];

			oSorter.push(new sap.ui.model.Sorter({
				path: oSelectedColumn,
				descending: oSelectedSort === "descending" ? true : false,
				upperCase: false
			}));

			var oTable = this.getView().byId("table");

			oTable.getBinding("items").sort(oSorter);

			this.SortDialog.close();
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

		refreshStore: function (entity1, entity2, entity3, entity4) {
			return new Promise(function (resolve, reject) {
				if (typeof sap.hybrid !== 'undefined') {
					//this.setBusyDialog("App Grãos", "Atualizando banco de dados");
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

		refreshData: function () {
			
			this.hasFinished = false;

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

				var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd/MM/yyyy HH:mm"
				});

				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				var sMessage = "Tem certeza que deseja atualizar a base de Prospects? Verifique a qualidade da conexão.";

				MessageBox.warning(
					sMessage, {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {
							
								this.verifyTimeOut();
								this.flushStore("Prospects,Characteristics,Banks,Irf").then(function () {
									this.refreshStore("Prospects", "Characteristics", "Banks", "Irf").then(function () {
										localStorage.setItem("lastUpdateProspect", new Date());
										var lastUpdateProspect = dateFormat.format(new Date(localStorage.getItem("lastUpdateProspect")));

										this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdateProspect);
										this.getView().getModel().refresh(true);
										this.hasFinished = true;
										//this.getView().byId("pullToRefreshID").hide();
										//this.closeBusyDialog();
									}.bind(this));
								}.bind(this));

							}
						}.bind(this)
					}
				);

			}
			else {

				this.getView().getModel().refresh(true);
				//this.getView().byId("pullToRefreshID").hide();
				this.closeBusyDialog();
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				var sMessage = "Conexão com internet não encontrada, verifique e tente novamente!";

				this.hasFinished = true;
				MessageBox.warning(
					sMessage, {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {}.bind(this)
					}
				);

			}

		},

		changeDate: function (oEvent) {
			var date = oEvent.getSource();

			//	data.getData()
		},

		checkCharacteristics: function (arrayCharacteristics) {
			return new Promise(function (resolve, reject) {
				var oModel = this.getOwnerComponent().getModel();
				var arrayCharacECC = [];
				var aPromises = [];

				for (var data in arrayCharacteristics) {
					aPromises.push(new Promise(function (resolve, reject) {
						var aFilters = [];
						var aPartner = arrayCharacteristics[data].LIFNR;

						aFilters.push(new sap.ui.model.Filter({
							path: "HCP_UNIQUE_KEY",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: arrayCharacteristics[data].HCP_UNIQUE_KEY
						}));

						oModel.read("/Characteristics", {
							filters: aFilters,
							success: function (oDataCharacteristics) {
								if (oDataCharacteristics.results.length > 0) {

									for (var charac in oDataCharacteristics.results) {
										if (oDataCharacteristics.results[charac].HCP_SENT !== 'X') {
											oDataCharacteristics.results[charac].LIFNR = arrayCharacteristics[data].LIFNR;
											arrayCharacECC.push(oDataCharacteristics.results[charac]);
										}
									}
									if (arrayCharacECC.length > 0) {
										this.saveCharacteristcsECC(arrayCharacECC, aPartner).then(function () {
											resolve();
										});
									}
								}
							}.bind(this),
							error: function () {
								reject();
							}
						});
					}.bind(this)));
				}
				Promise.all(aPromises).then(response => {
					resolve();
					console.log("Características salvas com sucesso");
				}).catch(reject => {
					reject();
				});
				resolve();
			}.bind(this));
		},

		saveCharacteristcsECC: function (oDataCharacteristics, aPartner) {
			return new Promise(function (resolve, reject) {
				var aSupplierData;
				var oEccModel = this.getOwnerComponent().getModel("eccModel");
				var oModel = this.getOwnerComponent().getModel();
				var aCharArray = [];

				for (var characteristic of oDataCharacteristics) {
					aCharArray.push({
						CHARACT: characteristic.ATINN,
						VALUE_FROM: parseFloat(characteristic.ATFLV),
						VALUE_RELATION: "1",
						CHARACT_DESCR: characteristic.HCP_COMMENTS
					});
				}

				oEccModel.callFunction("/saveCharacteristics", {
					method: "GET",
					urlParameters: {
						supplier: aPartner,
						characteristics: JSON.stringify(aCharArray)
					},
					success: function (oData) {
						var aMessage = [];
						var sNrsol;
						var bError = false;
						var sError;

						if (!bError) {
							var oCharacteristicsEdit = {
								HCP_SENT: "X",
								HCP_UPDATED_AT: new Date()
							};

							for (var characteristic of oDataCharacteristics) {
								oModel.update("/Characteristics(" + characteristic.HCP_CHARAC_ID + "l)", oCharacteristicsEdit, {
									success: function () {
										resolve();
									},
									error: function (error) {
										reject(error);
									}
								});
							}
						} else {
							this.closeBusyDialog();
							MessageBox.information(sError);
							reject(sError);
						}
					}.bind(this),
					error: function (error) {
						sap.m.MessageToast.show(error);
						reject(error);
					}
				});
			}.bind(this));

			// for (var charac in oDataCharacteristics) {

			// var aCharacteristcsData = {
			// 	CHARACT: oDataCharacteristics[charac].ATINN,
			// 	VALUE_FROM: parseFloat(oDataCharacteristics[charac].ATFLV),
			// 	VALUE_RELATION: "1",
			// 	CHARACT_DESCR: oDataCharacteristics[charac].HCP_COMMENTS
			// };

			// oEccModel.callFunction("/saveCharacteristics", {
			// 	method: "GET",
			// 	urlParameters: {
			// 		supplier: aPartner,
			// 		characteristics: JSON.stringify(oDataCharacteristics)
			// 	},
			// 	success: function (oData) {
			// 		var aMessage = [];
			// 		var sNrsol;
			// 		var bError = false;
			// 		var sError;

			// 		if (!bError) {

			// 			var oCharacteristicsEdit = {
			// 				HCP_SENT: "X",
			// 				HCP_UPDATED_AT: this._formatDate(new Date())
			// 			};

			// 			oModel.update("/Prospects(" + oDataCharacteristics[charac].HCP_CHARAC_ID + "l)", oCharacteristicsEdit, {
			// 				groupId: "changes"
			// 			});

			// 		} else {
			// 			this.closeBusyDialog();
			// 			MessageBox.information(sError);
			// 		}

			// 	}.bind(this),
			// 	error: function (error) {
			// 		sap.m.MessageToast.show(error);
			// 	}
			// });
			// }
		},
		verifyTimeOut: function () {

			if (!this.hasFinished) {
				setTimeout(function () {
					this.setBusyDialog("App Grãos", "Enviando dados, por favor aguarde (" + this.revertCount +
						")");
					this.count++;
					this.revertCount--;
					//console.log("Countador está em: " + this.count);
					if (this.count > 20) {
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
		}

	});
}, /* bExport= */ true);