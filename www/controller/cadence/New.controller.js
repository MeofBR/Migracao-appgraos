sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.cadence.New", {
		formatter: formatter,
		onInit: function () {
			var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
			var sLocale = sCurrentLocale.split("-");
			var oLocale = new sap.ui.core.Locale(sLocale[0], sLocale[1]);
			this.oNumberFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance(oLocale);
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("cadence.New").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "indexModel");

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				create: true,
				edit: true
			}), "profileModel");
		},

		handleRouteMatched: function (oEvent) {

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var oEventVar = oEvent.getParameter("data");

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				yesSequence: true,
				isSelected: false,
				enableHeader: true,
				valueFilter: "0",
				yesGeral: false,
				maxValue: false,
				minValue: false,
				isEnable: false,
				dateWarning: false,
				enableColumn: true,
				enableAction: true,
				modeSelect: "MultiSelect",
				valorTotal: parseFloat(0).toFixed(),
				valorRestante: parseFloat(0).toFixed(),
				ItemCadence: [],
				ItemPrice: [],
				enableCreateWerksValid: true,
				selectedWerks: ""
			}), "cadenceFormModel");

			if (bIsMobile) {
				if (navigator.connection.type == "none") {
					this.getView().getModel("cadenceFormModel").setProperty("/isEnable", false);
					this.getView().getModel("cadenceFormModel").setProperty("/modeSelect", "None");
				}
				this.getView().getModel("indexModel").setProperty("/isMobile", true);
			} else {
				this.getView().getModel("indexModel").setProperty("/isMobile", false);
			}

			this.setBusyDialog("Cadência de recebimento", "Carregando Informações");
			this.getUser().then(function (userName) {
				this.userName = userName;
				this.getUserProfile("View_Profile_Cadence", this.userName).then(profileData => {
					this.getView().getModel("profileModel").setData(profileData);
					console.log(this.getView().getModel("profileModel").getData());

					if (oEventVar) {
						var oFilterModel = this.getView().getModel("cadenceFormModel");

						this.supplier = oEventVar.supplier;
						this.unique = oEventVar.unique;
						this.offerNumer = oEventVar.offerNumer;
						this.sequence = oEventVar.sequence;
						this.totalCadence = oEventVar.totalCadence;
						this.lifnr = oEventVar.lifnr;
						this.matnr = oEventVar.matnr;
						oFilterModel.setProperty("/valorTotal", parseFloat(this.totalCadence).toFixed(2));
						this.getCadence(this.unique, this.offerNumer);
					}
					this.cadenceSelected = [];
					this.totalSelected = 0;
				}).catch(error => {
					console.log(error);
					this.closeBusyDialog();
				});
			}.bind(this));

			// if (oEvent.getParameter("data")) {
			// 	var oFilterModel = this.getView().getModel("cadenceFormModel");

			// 	this.supplier = oEvent.getParameter("data").supplier;
			// 	this.unique = oEvent.getParameter("data").unique;
			// 	this.offerNumer = oEvent.getParameter("data").offerNumer;
			// 	this.sequence = oEvent.getParameter("data").sequence;
			// 	this.totalCadence = oEvent.getParameter("data").totalCadence;
			// 	this.lifnr = oEvent.getParameter("data").lifnr;
			// 	this.matnr = oEvent.getParameter("data").matnr;
			// 	oFilterModel.setProperty("/valorTotal", parseFloat(this.totalCadence).toFixed(2));
			// 	this.getCadence(this.unique, this.offerNumer);
			// }
			// this.cadenceSelected = [];
			// this.totalSelected = 0;
		},
		_onSearchPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("cadence.List", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_changeTypeFilter: function (oEvent) {

			var oInput = oEvent.getSource();
			var oFilterModel = this.getView().getModel("cadenceFormModel");

			if (oInput.getSelectedKey() === "1") {
				oFilterModel.setProperty("/yesSequence", false);
				oFilterModel.setProperty("/yesGeral", true);
			} else {
				oFilterModel.setProperty("/yesSequence", true);
				oFilterModel.setProperty("/yesGeral", false);
			}
		},
		_changeValueCadence: function (oEvent) {

			return new Promise(function (resolve, reject) {

				var tableModel = this.getView().getModel("cadenceFormModel");
				var sPlit = oEvent.getSource().oParent.oBindingContexts.cadenceFormModel.sPath.split("/");
				var sIndex = sPlit[2];
				var oData = oEvent.getSource().oParent.oBindingContexts.cadenceFormModel.oModel.oData.ItemCadence[sIndex];

				if (oEvent.getParameters().value == "") {
					tableModel.oData.ItemCadence[sIndex].HCP_QUANTIDADE = 0;
				}

				if (oEvent.getSource().oParent.mProperties.selected) {
					this.cadenceSelected.splice(sIndex, 1);
					oEvent.getSource().getParent().setSelected(false);
				}

				var totalPedido = parseFloat(tableModel.oData.valorTotal).toFixed(2);
				var totalCadencia = parseFloat(0).toFixed(2);

				var aPromises = [];
				for (var i = 0; i < tableModel.oData.ItemCadence.length; i++) {

					aPromises.push(new Promise(function (resolves, reject) {
						totalCadencia = Number(totalCadencia) + Number(parseFloat(tableModel.oData.ItemCadence[i].HCP_QUANTIDADE).toFixed(2));
						resolves();
					}.bind(this)));

				}

				Promise.all(aPromises).then(function () {
					resolve();
					this.verifyTotal(totalCadencia, totalPedido, tableModel.oData.ItemCadence[0].HCP_DATA_ATUAL);
				}.bind(this));

			}.bind(this));

		},
		verifyTotal: function (valorTotal, totalPedido, data) {

			var tableModel = this.getView().getModel("cadenceFormModel");
			tableModel.oData.maxValue = false;
			tableModel.oData.minValue = false;

			if (valorTotal > totalPedido) {
				this.verificaRemessa(data);
				tableModel.oData.maxValue = true;
			} else if (valorTotal == totalPedido) {
				this.verificaRemessa(data);
				tableModel.oData.maxValue = false;
				tableModel.oData.minValue = false;
			} else {
				this.verificaRemessa(data);
				var valor = totalPedido - valorTotal;
				tableModel.oData.valorRestante = parseFloat(valor).toFixed(2);
				tableModel.oData.minValue = true;
				tableModel.oData.maxValue = false;
			}

			tableModel.refresh();

		},
		_valideInputNumber: function (oProperty) {

			var oSource = oProperty.getSource();
			var sValue;

			sValue = oProperty.mParameters.newValue;
			sValue = sValue.replace(/[^0-9,]/g, "");

			oSource.setValue(sValue);
		},
		onSelectionChange: function (oEvent) {

			return new Promise(function (resolve, reject) {
				var oTable = this.getView().byId("tableCadencia");
				var tableModel = this.getView().getModel("cadenceFormModel");
				var itemArray = oEvent.getSource().getItems();
				tableModel.oData.isSelected = false;

				var aPromises = [];
				this.cadenceSelected = [];
				for (var i = 0; i < itemArray.length; i++) {
					aPromises.push(new Promise(function (resolves, reject) {
						if (itemArray[i].mProperties.selected) {
							this.totalSelected = parseInt(this.totalSelected) + parseInt(1);
							this.cadenceSelected.push(tableModel.getProperty(itemArray[i].getBindingContext("cadenceFormModel").getPath()));
							tableModel.oData.isSelected = true;
						} //else {
						//	var fieldNotSelected = tableModel.getProperty(itemArray[i].getBindingContext("cadenceFormModel").getPath());
						//	fieldNotSelected.HCP_QUANTIDADE = 0;
						//}
						resolves();
					}.bind(this)));
				}

				Promise.all(aPromises).then(function () {
					resolve();
					if (oTable.getBinding("items")) {
						oTable.getBinding("items").refresh();
					}
					tableModel.refresh();

				}.bind(this));
			}.bind(this));
		},

		_calculateCadence: function () {

			var tableModel = this.getView().getModel("cadenceFormModel");
			var totalPedido = parseFloat(tableModel.oData.valorTotal).toFixed(2);
			var valoresNaoSelecionados = parseFloat(0.00).toFixed(2);
			var valoresSelecionados = parseFloat(0.00).toFixed(2);
			var totalDividido = totalPedido / this.cadenceSelected.length;

			return new Promise(function (resolve, reject) {

				var oTable = this.getView().byId("tableCadencia");
				var items = oTable.getItems();
				var total = parseFloat(0.00).toFixed(2);
				var totalGeral = parseFloat(0.00).toFixed(2);
				var aPromises = [];

				for (var i = 0; i < items.length; i++) {
					aPromises.push(new Promise(function (resolves, reject) {

						var sPlit = items[i].oBindingContexts.cadenceFormModel.sPath.split("/");
						var sIndex = sPlit[2];
						var oData = items[i].oBindingContexts.cadenceFormModel.oModel.oData.ItemCadence[sIndex];
						if (!oData.HCP_QUANTIDADE) {
							oData.HCP_QUANTIDADE = 0;
						}
						if (!items[i].mProperties.selected) {
							oData.HCP_QUANTIDADE = 0;
							valoresNaoSelecionados = Number(valoresNaoSelecionados) + Number(parseFloat(oData.HCP_QUANTIDADE).toFixed(2));
						} else {
							valoresSelecionados = Number(valoresSelecionados) + Number(parseFloat(oData.HCP_QUANTIDADE).toFixed(2));
						}

						resolves();
					}.bind(this)));

					if (oTable.getBinding("items")) {
						oTable.getBinding("items").refresh();
					}

					tableModel.refresh();
				}

				Promise.all(aPromises).then(function () {
					resolve();

					var newPromises = [];
					var totalNovo;
					var totalSoma = valoresSelecionados + valoresNaoSelecionados;

					if (totalSoma > totalPedido) {
						totalNovo = totalPedido;
					} else {
						totalNovo = totalPedido - valoresNaoSelecionados;
					}

					var totalNovoDividido = totalNovo / this.cadenceSelected.length;
					total = parseFloat(0.00).toFixed(2);

					for (var i = 0; i < items.length; i++) {
						newPromises.push(new Promise(function (resolvesNew, reject) {
							var sPlit = items[i].oBindingContexts.cadenceFormModel.sPath.split("/");
							var sIndex = sPlit[2];
							var oData = items[i].oBindingContexts.cadenceFormModel.oModel.oData.ItemCadence[sIndex];

							if (items[i].mProperties.selected) {
								oData.HCP_QUANTIDADE = parseFloat(totalNovoDividido).toFixed(2);
								total = Number(parseFloat(total).toFixed(2)) + Number(parseFloat(oData.HCP_QUANTIDADE).toFixed(2));
							}

							totalGeral = Number(parseFloat(totalGeral).toFixed(2)) + Number(parseFloat(oData.HCP_QUANTIDADE).toFixed(2));

							resolvesNew();
						}.bind(this)));
					}

					Promise.all(newPromises).then(function () {

						var restante = parseFloat(totalNovo).toFixed(2) - parseFloat(total).toFixed(2);

						if (parseFloat(restante).toFixed(2) < 0) {
							this.cadenceSelected[0].HCP_QUANTIDADE = Number(parseFloat(this.cadenceSelected[0].HCP_QUANTIDADE).toFixed(2)) - Number(
								Math
								.abs(parseFloat(restante).toFixed(2)));
							total = total - Number(Math.abs(parseFloat(restante).toFixed(2)));
							totalGeral = totalGeral - Number(Math.abs(parseFloat(restante).toFixed(2)));

						} else {
							this.cadenceSelected[0].HCP_QUANTIDADE = parseFloat(Number(parseFloat(this.cadenceSelected[0].HCP_QUANTIDADE).toFixed(2)) +
								Number(parseFloat(restante).toFixed(2))).toFixed(2);
							total = total + Number(parseFloat(restante).toFixed(2));
							totalGeral = totalGeral + Number(parseFloat(restante).toFixed(2));
						}

						if (oTable.getBinding("items")) {
							oTable.getBinding("items").refresh();
						}

						if (total > 0 && totalGeral < totalPedido) {
							tableModel.setProperty("/enabledConfCadence", true);
						} else {
							tableModel.setProperty("/enabledConfCadence", false);
						}

						this.verifyTotal(parseFloat(totalGeral).toFixed(2), parseFloat(totalPedido).toFixed(2), this.cadenceSelected[0].HCP_DATA_ATUAL);

						tableModel.refresh();

					}.bind(this));

				}.bind(this));

			}.bind(this));
		},
		getCadence: function (unique, offer) {

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			this.setBusyDialog("Cadência de recebimento", "Filtrando dados...");
			var oModel = this.getView().getModel();
			var aFilters = [];
			var oView = this.getView();
			var oTable = this.getView().byId("tableCadencia");
			var aPromises = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_UNIQUE_KEY',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: unique
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_EXCLUDED',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: '0'
			}));

			oModel.read("/Cadence", {
				filters: aFilters,
				and: true,
				success: function (result) {

					var priceIntention = oView.getModel("cadenceFormModel");
					priceIntention.setProperty("/count", result.results.length);
					priceIntention.setProperty("/supplier", this.supplier);

					if (offer == "0") {
						priceIntention.setProperty("/labelOffer", "Nº do Pedido ");
						priceIntention.setProperty("/offerNumber", offer);
						priceIntention.setProperty("/sequence", this.sequence);
					} else {
						priceIntention.setProperty("/labelOffer", "Nº do Pedido ");
						priceIntention.setProperty("/offerNumber", offer);
						priceIntention.setProperty("/sequence", this.sequence);
					}

					if (result.results.length > 0) {
						//PROFILE
						this.checkWerks(result.results[0]);
						//PROFILE

						this.verificaRemessa(result.results[0].HCP_DATA_ATUAL);

						for (var m = 0; m < result.results.length; m++) {

							var dataItem = priceIntention.getProperty("/ItemCadence");

							var data = {
								HCP_CADENCE_ID: result.results[m].HCP_CADENCE_ID,
								HCP_UNIQUE_KEY: result.results[m].HCP_UNIQUE_KEY,
								HCP_DATA_ATUAL: result.results[m].HCP_DATA_ATUAL,
								HCP_CENTER: result.results[m].HCP_CENTER,
								HCP_TIPO: result.results[m].HCP_TIPO,
								HCP_QUANTIDADE: parseFloat(result.results[m].HCP_QUANTIDADE),
								quantidadeb: result.results[m].HCP_MENGE_B3,
								saldo: result.results[m].HCP_SALDO
							};

							dataItem.push(data);
							if (oTable.getBinding("items")) {
								oTable.getBinding("items").refresh();
							}
						}
					}
					this.closeBusyDialog();
				}.bind(this)

			});
		},

		checkWerks: function (oFirstCadence) {
			var oProfileModel = this.getView().getModel("profileModel");
			var oCadenceModel = this.getView().getModel("cadenceFormModel");
			var oProfileData = oProfileModel.getData();
			var sWerks = oFirstCadence.HCP_CENTER;

			if (sWerks) {
				if (oProfileData.werks.filter(werks => werks.WERKS == sWerks || werks.VALOR == '*').length > 0 || oProfileData.fullAccess) {
					oCadenceModel.setProperty("/enableCreateWerksValid", true);
					return true;
				} else {
					oCadenceModel.setProperty("/enableCreateWerksValid", false);
					oCadenceModel.setProperty("/selectedWerks", sWerks);
					return false;
				}
			} else {
				oCadenceModel.setProperty("/enableCreateWerksValid", true);
				return false;
			}

		},

		deleteMessageLog: function (aUniqueKey) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				oModel.setUseBatch(true);
				var aDeferredGroups = oModel.getDeferredGroups();
				var sPath;
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_UNIQUE_KEY',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: aUniqueKey
				}));

				if (aDeferredGroups.indexOf("removes") < 0) {
					aDeferredGroups.push("removes");
					oModel.setDeferredGroups(aDeferredGroups);
				}

				oModel.read("/Commodities_Log_Messages", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;

						if (aResults.length > 0) {

							for (var i = 0; i < aResults.length; i++) {

								sPath = this.buildEntityPath("Commodities_Log_Messages", aResults[i], "HCP_MESSAGE_ID");

								oModel.remove(sPath, {
									groupId: "removes"
								});

							}

							oModel.submitChanges({
								groupId: "removes",
								success: function () {
									resolve();
								}.bind(this),
								error: function () {
									resolve();
								}.bind(this)
							});

						} else {
							resolve();
						}

					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));
		},

		verificaRemessa: function (dataRemessa) {

			var hoje = new Date();
			hoje.setHours(0, 0, 0, 0);

			var timezone = hoje.getTimezoneOffset() * 60 * 1000;
			hoje.setTime(hoje.getTime() - timezone);

			var tableModel = this.getView().getModel("cadenceFormModel");
			var novadata = new Date(dataRemessa);
			novadata.setTime(novadata.getTime() + timezone);

			hoje.setTime(hoje.getTime() + timezone);

			if (hoje > novadata) {
				tableModel.oData.isEnable = false;
				tableModel.oData.dateWarning = true;
				tableModel.oData.modeSelect = "None";

			} else {
				tableModel.oData.modeSelect = "MultiSelect";

				if (navigator.connection.type == "none") {
					tableModel.oData.isEnable = false;
				} else {
					tableModel.oData.isEnable = true;
				}
				tableModel.oData.dateWarning = false;
			}

			tableModel.refresh();
		},
		_onSave: function (oEvent) {

			return new Promise(function (resolve, reject) {

				var oModelCadence = this.getView().getModel("cadenceFormModel");
				var oData = oModelCadence.getProperty("/ItemCadence");
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

				//createproperty
				var oProperties = {};
				var arrayCadence = [];
				var arrayPath = [];
				var aPromises = [];

				for (var i = 0; i < oModelCadence.oData.ItemCadence.length; i++) {

					aPromises.push(new Promise(function (resolveCadence, reject) {

						var crateArray = {
							HCP_DATA_ATUAL: oModelCadence.oData.ItemCadence[i].HCP_DATA_ATUAL,
							HCP_CADENCE_ID: oModelCadence.oData.ItemCadence[i].HCP_CADENCE_ID,
							HCP_QUANTIDADE: parseFloat(oModelCadence.oData.ItemCadence[i].HCP_QUANTIDADE).toFixed(2),
							HCP_UNIQUE_KEY: oModelCadence.oData.ItemCadence[i].HCP_UNIQUE_KEY,
							HCP_CENTER: oModelCadence.oData.ItemCadence[i].HCP_CENTER,
							HCP_UPDATED_AT: this._formatDate(new Date()),
							HCP_UPDATED_BY: this.userName
						};

						arrayCadence.push(crateArray);

						oProperties = crateArray;
						sPath = this.buildEntityPath("Cadence", crateArray, "HCP_CADENCE_ID");

						oModel.update(sPath, oProperties, {
							groupId: "changes"
						});

						resolveCadence();

					}.bind(this)));

				}
				var createArrayCommodities;

				if (oModelCadence.oData.ItemCadence[0].HCP_TIPO == "1") {
					createArrayCommodities = {
						HCP_UNIQUE_KEY: oModelCadence.oData.ItemCadence[0].HCP_UNIQUE_KEY,
						HCP_SEQUENCE: this.sequence,
						HCP_TYPE: oModelCadence.oData.ItemCadence[0].HCP_TIPO,
						HCP_LIFNR: this.lifnr,
						HCP_MATNR: this.matnr,
						HCP_WERKS: oModelCadence.oData.ItemCadence[0].HCP_CENTER
					};
				} else {
					createArrayCommodities = {
						HCP_UNIQUE_KEY: oModelCadence.oData.ItemCadence[0].HCP_UNIQUE_KEY,
						HCP_SEQUENCE: this.offerNumer,
						HCP_TYPE: oModelCadence.oData.ItemCadence[0].HCP_TIPO,
						HCP_LIFNR: this.lifnr,
						HCP_MATNR: this.matnr,
						HCP_WERKS: oModelCadence.oData.ItemCadence[0].HCP_CENTER
					};
				}

				arrayPath.push(createArrayCommodities);

				Promise.all(aPromises).then(function () {
					resolve();
					//salvando / editando cadencia.......

					if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

						this.deleteMessageLog(oModelCadence.oData.ItemCadence[0].HCP_UNIQUE_KEY).then(function () {
							this.submitEditFixedOrderEcc(arrayPath, arrayCadence).then(function (oSucess) {

								if (oSucess == true) {
									oModel.submitChanges({
										groupId: "changes",
										success: function () {
											this.flushStore("Cadence").then(function () {
												this.refreshStore("Cadence").then(function () {
													this.closeBusyDialog();
													//	this.backToIndex();
												}.bind(this));
											}.bind(this));
										}.bind(this),
										error: function () {
											this.closeBusyDialog();
											this.backToIndex();
											MessageBox.error("Erro ao editar Cadência.");
										}.bind(this)
									});

								} else {
									this.closeBusyDialog();
								}
							}.bind(this));
						}.bind(this));
					} else {

						this.deleteMessageLog(oModelCadence.oData.ItemCadence[0].HCP_UNIQUE_KEY).then(function () {
							this.submitEditFixedOrderEcc(arrayCadence, arrayCadence).then(function (oSucess) {

								if (oSucess == true) {
									oModel.submitChanges({
										groupId: "changes",
										success: function () {
											this.closeBusyDialog();
											this.backToIndex();
										}.bind(this),
										error: function () {
											this.closeBusyDialog();
											this.backToIndex();
											MessageBox.error("Erro ao editar Cadência.");
										}.bind(this)
									});

								} else {
									//Enviar para edição
									this.closeBusyDialog();
								}
							}.bind(this));
						}.bind(this));
					}

				}.bind(this));

			}.bind(this));
		},

		submitEditFixedOrderEcc: function (arrayCommodities, arrayCadence) {

			return new Promise(function (resolve, reject) {

				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;

				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

					this.setBusyDialog(this.resourceBundle.getText("messageProcessingWait"));

					var oEccModel = this.getOwnerComponent().getModel("eccModel");

					oEccModel.callFunction("/editCadence", {
						method: "GET",
						urlParameters: {
							cadence: JSON.stringify(arrayCadence),
							data: JSON.stringify(arrayCommodities)
						},
						success: function (results) {

							var aResults = JSON.parse(results.return);
							if (aResults.length > 0) {
								this.displayMessageLog(aResults).then(function (oSucess) {
									resolve(oSucess);
								}.bind(this));
							} else {
								resolve(false);
							}
						}.bind(this),
						error: function (error) {
							sap.m.MessageToast.show(error);
							reject(error);
						}
					});
				}

			}.bind(this));

		},

		displayMessageLog: function (aResults) {

			return new Promise(function (resolve, reject) {
				var updateTable = true;
				var oDataItem = [];
				var aIcon;
				var oType;
				var aPromises = [];

				if (aResults.length > 0) {

					for (var i = 0; i < aResults.length; i++) {
						aPromises.push(new Promise(function (resolves, reject) {

							if (aResults[i].hcpMsgtyp == "S") {
								aIcon = "sap-icon://message-success";
							} else if (aResults[i].hcpMsgtyp == "E") {
								updateTable = false;
								aIcon = "sap-icon://message-error";
							} else {
								aIcon = "sap-icon://message-information";
							}

							var aData = {
								HCP_MSGTYP: aResults[i].hcpMstyp,
								ICON: aIcon,
								HCP_MESSAGE: aResults[i].hcpMessage
							};

							oType = aResults[i].hcpType;

							oDataItem.push(aData);

							resolves();
						}.bind(this)));

					}

					Promise.all(aPromises).then(function () {
						resolve(updateTable);
					}.bind(this));

					if (!this._FragmentMessageLog) {
						this._FragmentMessageLog = sap.ui.xmlfragment("messageID" + this.getView().getId(),
							"com.sap.build.standard.brfAppDeGraosModoEditar.view.commodities.fragments.LogMessage",
							this);

						this.getView().addDependent(this._FragmentMessageLog);

					}

					this.getView().setModel(new sap.ui.model.json.JSONModel({
						type: oType,
						tableMessage: oDataItem
					}), "messageLogFormModel");

					this._FragmentMessageLog.open();

				}

			}.bind(this));

		},

		_onMsgLogConfirPress: function (oEvent) {

			oEvent.getSource().getParent().close();

		},

		buildEntityPath: function (sEntityName, oEntity, oField) {

			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity[oField] + "l)";
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

		}
	});
});