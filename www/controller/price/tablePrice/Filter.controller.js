sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter",
	'sap/ui/model/Filter',
	'sap/m/Label'
], function (MainController, MessageBox, History, JSONModel, formatter, Filter, Label) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.price.tablePrice.Filter", {
		formatter: formatter,

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
		formatDateUTCtoLocale: function (dDate) {
			if (dDate) {
				return new Date(dDate.getUTCFullYear(), dDate.getUTCMonth(), dDate.getUTCDate());
			}
			return dDate;

		},

		refreshData: function () {

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			this.count = 0;
			this.revertCount = 20;
			this.hasFinished = false;

			var aRefreshView = ["Table_Price"];

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

				var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd/MM/yyyy HH:mm"
				});

				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				var sMessage = "Tem certeza que deseja atualizar a base da Tabela de Preços? Verifique a qualidade da conexão.";

				MessageBox.warning(
					sMessage, {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {

								this.verifyTimeOut();
								this.refreshStore(aRefreshView).then(function () {
									localStorage.setItem("lastUpdateTablePrice", new Date());
									var lastUpdateSchedule = dateFormat.format(new Date(localStorage.getItem("lastUpdateTablePrice")));

									this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdateSchedule);
									
									this.getView().getModel("indexModel").setProperty("/lastUpdateTablePrice", localStorage);
									this.getView().getModel().refresh(true);
									this.hasFinished = true;
									//this.getView().byId("pullToRefreshID").hide();
									//this.closeBusyDialog();
								}.bind(this));

							}
						}.bind(this)
					}
				);

			} else {
				this.getView().getModel().refresh(true);
				//this.getView().byId("pullToRefreshID").hide();
				this.closeBusyDialog();
				this.hasFinished = true;
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				var sMessage = "Conexão com internet não encontrada, verifique e tente novamente!";

				MessageBox.warning(
					sMessage, {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {}.bind(this)
					}
				);
			}

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
		flushStore: function () {
			return new Promise(function (resolve, reject) {
				if (typeof sap.hybrid !== 'undefined') {
					sap.hybrid.flushStore().then(function () {
						resolve();
					});
				} else {
					resolve();
				}
			}.bind(this));

		},
		createData: function (data, finalDoDia = false) {
		    var mes = data.getMonth() + 1;
		    var dia = data.getDate();
		    if (dia < 10) {
		        dia = "0" + dia;
		    } else {
		        dia = dia.toString();
		    }
		    if (mes < 10) {
		        mes = "0" + mes;
		    } else {
		        mes = mes.toString();
		    }
		
		    if (finalDoDia) {
		        // Criar data no formato yyyyMMdd com a hora ajustada para 23:59:59 (final do dia)
		        return Date.UTC(data.getFullYear(), data.getMonth(), data.getDate(), 23, 59, 59); // Final do dia UTC
		    } else {
		        return Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()); // Data no formato yyyyMMdd UTC
		    }
		},
		onInit: function () {

			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "indexModel");

			this.oRouter.getTarget("price.tablePrice.Filter").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
		},
		handleRouteMatched: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			this.count = 0;
			this.revertCount = 20;
			this.hasFinished = false;

			this.setBusyDialog("App Grãos", "Carregando dados, por favor aguarde");

			this.getUser().then(function (userName) {
				this.userName = userName;
				this.verifyAccountGroup();

			}.bind(this));
			var lastUpdate;
			var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/yyyy HH:mm"
			});

			if (localStorage.getItem("lastUpdateTablePrice")) {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdateTablePrice")));
			} else {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdate")));
			}
			this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdate);

			this.getView().getModel("indexModel").setProperty("/lastUpdateTablePrice", lastUpdate);

			if (bIsMobile) {
				this.getView().getModel("indexModel").setProperty("/isMobile", true);
				this.getView().getModel("indexModel").setProperty("/isWeb", false);
			} else {
				this.getView().getModel("indexModel").setProperty("/isMobile", false);
				this.getView().getModel("indexModel").setProperty("/isWeb", true);
			}

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				ItemPrice: []
			}), "filterTable");

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				EKGRP: "",
				MATERIAL: "000000000000013307|06|13307 (MILHO GRANEL) / 06 (MILHO SECO)",
				WERKS: "",
				MATNR_DESC: "13307 (MILHO GRANEL) / 06 (MILHO SECO)",
				noOptions: true,
				showMateriais: false,
				moreOptionsColor: "Positive",
				moreOptionsIcon: "sap-icon://horizontal-grip",
				moreOptionsText: "Mais Opções"
			}), "filters");

			//this.refreshData();

			this.getParameters();

		},
		formataData: function (data) {
			var newday = data;
			var newmonth = data;
			var newyear = data;
			return newday.slice(6, 8) + "/" + newmonth.slice(4, 6) + "/" + newyear.slice(0, 4);

		},

		_createMonthText: function (month) {

			if (month === "01") {
				return this.resourceBundle.getText("jan");
			} else if (month === "02") {
				return this.resourceBundle.getText("feb");
			} else if (month === "03") {
				return this.resourceBundle.getText("mar");
			} else if (month === "04") {
				return this.resourceBundle.getText("apr");
			} else if (month === "05") {
				return this.resourceBundle.getText("mayy");
			} else if (month === "06") {
				return this.resourceBundle.getText("jun");
			} else if (month === "07") {
				return this.resourceBundle.getText("jul");
			} else if (month === "08") {
				return this.resourceBundle.getText("aug");
			} else if (month === "09") {
				return this.resourceBundle.getText("sep");
			} else if (month === "10") {
				return this.resourceBundle.getText("oct");
			} else if (month === "11") {
				return this.resourceBundle.getText("nov");
			} else {
				return this.resourceBundle.getText("dec");
			}
		},

		_validateForm: function (oEvent) {

			var fieldName = '';

			if (oEvent) {
				fieldName = oEvent.getSource().getName();
			}

			var oModelFilters = this.getView().getModel("filters");

			if (this.getView().getModel("filters").getProperty("/moreOptionsColor") == "Positive") {
				var plant = this.getView().byId("PLANT").mProperties.value;
				if (plant != "") {
					this.getView().getModel("filters").setProperty("/noOptions", true);
				}
			}

			if (!oModelFilters.oData.noOptions) {

				return new Promise(function (resolve, reject) {

					//mais opçoes selecionados

					var arrayFields = ["PLANT", "MATERIAL", "CEREAL"];
					var enableFilter = true;
					var aControlss = [];
					var aPromises = [];

					for (var i = 0; i < arrayFields.length; i++) {

						aPromises.push(new Promise(function (resolves, reject) {

							var campo = this.getView().byId(arrayFields[i]);

							aControlss.push({
								control: campo,
								required: campo.oParent.mAggregations.items[0].getRequired && campo.oParent.mAggregations.items[0].getRequired(),
								text: campo.oParent.mAggregations.items[0].getText
							});

							var aInputControls = aControlss;
							var oControl;

							for (var m = 0; m < aInputControls.length; m++) {
								oControl = aInputControls[m].control;
								oControl.setValueState("None");

								if (aInputControls[m].required) {
									var sValue = oControl.getValue();
									if (sValue.length > 0) {
										resolves();
									} else {
										enableFilter = false;
										oControl.setValueState("Error");
										resolves();
										return;
									}
								}
							}
						}.bind(this)));

					}

					//fim
					Promise.all(aPromises).then(function () {
						resolve();
						if (enableFilter) {

							var oModelFilters = this.getView().getModel("filters");
							var material = this.getView().byId("MATERIAL").mProperties.selectedKey;
							var cereal = this.getView().byId("CEREAL").mProperties.selectedKey;
							var materialId = material.split("-");
							oModelFilters.setProperty("/MATERIAL", materialId[0] + "|" + cereal + "|" + this.getView().byId("MATERIAL").mProperties.value +
								" / " + this.getView().byId("CEREAL").mProperties.value + "");

							this.getPriceMaterial();
						}
					}.bind(this));
				}.bind(this));

			} else {

				//filtro padrao
				var campos = this.getView().byId("PLANT");

				var aControls = [];

				aControls.push({
					control: campos,
					required: campos.oParent.mAggregations.items[0].getRequired && campos.oParent.mAggregations.items[0].getRequired(),
					text: campos.oParent.mAggregations.items[0].getText
				});

				setTimeout(function () {
					var aInputControls = aControls;
					var oControl;

					for (var m = 0; m < aInputControls.length; m++) {
						oControl = aInputControls[m].control;
						oControl.setValueState("None");
						if (aInputControls[m].required) {
							var sValue = oControl.getValue();
							if (sValue.length > 0) {
								this.getPriceMaterial();
							} else {
								this.getView().getModel("filters").setProperty("/noOptions", false);
								oControl.setValueState("Error");
								return;
							}
						}
					}
				}.bind(this), 100);

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
		changeDate: function (oEvent) {
			var date = oEvent.getSource();

			//  data.getData()
		},
		verifyAccountGroup: function () {

			var oModel = this.getOwnerComponent().getModel();

			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'BNAME',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.userName.toString().toUpperCase()
			}));

			oModel.read("/View_Users", {
				filters: aFilters,
				success: function (oData) {
					if (oData.results.length > 0) {
						var oFilterModel = this.getView().getModel("filters");

						if (oData.results[0].WERKS_D) {
							oFilterModel.setProperty("/WERKS", oData.results[0].WERKS_D);
							this.getPriceMaterial();
						} else {
							this.getView().getModel("filters").setProperty("/noOptions", false);
						}

					} else {
						this.getView().getModel("filters").setProperty("/noOptions", false);
					}
					this.closeBusyDialog();
				}.bind(this),
				error: function () {
					//  MessageBox.error("Erro ao buscar grupo de compra.");
					this.closeBusyDialog();
				}
			});

		},
		onExit: function () {
			this.aKeys = [];
			this.aFilters = [];
			this.oModel = null;
		},

		onSelectChange: function () {
			var aCurrentFilterValues = [];

			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectName));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectCategory));
			aCurrentFilterValues.push(this.getSelectedItemText(this.oSelectSupplierName));

			this.filterTable(aCurrentFilterValues);
		},

		/*NOVA TABELA DE PREÇOS*/

		handleIconTabBarSelect: function (oEvent) {
			var sKey = oEvent.getParameter("key");
			console.log(sKey);
			var arrayMaterial = sKey.split("|");
			var oModelFilters = this.getView().getModel("filters");
			var oTable = this.getView().byId("table");

			if (arrayMaterial[1] != "00") {
				oModelFilters.setProperty("/MATERIAL", sKey);
				this.getPriceMaterial();
			} else {
				this.changeMoreOptions();
			}

		},

		getPriceMaterial: function () {
		    var oTable = this.getView().byId("table");
		    var tableModel = this.getView().getModel("filterTable");
		    var oModelFilters = this.getView().getModel("filters");
		
		    if (oModelFilters.oData.WERKS != "") {
		        tableModel.setProperty("/ItemPrice", []);
		        oTable.getBinding("items").refresh();
		
		        return new Promise(function (resolve, reject) {
		
		            this.getView().byId("table").setNoDataText("Carregando...");
		            this.setBusyDialog("Tabela de Preços", "Filtrando dados...");
		            var oModel = this.getOwnerComponent().getModel();
		
		            var aFilters = [];
		            var arrayMaterial = oModelFilters.oData.MATERIAL.split("|");
		            oModelFilters.setProperty("/MATNR_DESC", arrayMaterial[2]);
		
		            if (oModelFilters.oData.EKGRP != "") {
		                aFilters.push(new sap.ui.model.Filter({
		                    path: 'EKGRP',
		                    operator: sap.ui.model.FilterOperator.EQ,
		                    value1: oModelFilters.oData.EKGRP
		                }));
		            }
		
		            if (oModelFilters.oData.WERKS != "") {
		                aFilters.push(new sap.ui.model.Filter({
		                    path: 'WERKS',
		                    operator: sap.ui.model.FilterOperator.EQ,
		                    value1: oModelFilters.oData.WERKS
		                }));
		            }
		
		            aFilters.push(new sap.ui.model.Filter({
		                path: 'MATNR',
		                operator: sap.ui.model.FilterOperator.EQ,
		                value1: arrayMaterial[0]
		            }));
		
		            if (arrayMaterial[1]) {
		                aFilters.push(new sap.ui.model.Filter({
		                    path: 'TPCEREAL',
		                    operator: sap.ui.model.FilterOperator.EQ,
		                    value1: arrayMaterial[1]
		                }));
		            }
		
		            var moedatipo;
		            if (arrayMaterial[1] == "72") {
		                moedatipo = "USD";
		                this.getView().getModel("filters").setProperty("/medidatipo", "/ton");
		            } else {
		                moedatipo = "BRL";
		                this.getView().getModel("filters").setProperty("/medidatipo", "/sc");
		            }
		
		            oModel.read("/Table_Price", {
		                filters: aFilters,
		                success: function (result) {
		                    var dataHoje = this.createData(new Date(), true);  // Considera até o final do dia (23:59:59) em UTC
		
		                    if (result.results.length > 0) {
		                        // Ordena por valor
		                        var arrayPrice = result.results.sort(function (a, b) {
		                            return a.FND_YEAR - b.FND_YEAR;
		                        });
		
		                        var tableModel = this.getView().getModel("filterTable");
		                        var dataItem = tableModel.getProperty("/ItemPrice");
		                        var vigenciaNumber = 12;
		                        var vigText;
		                        var arrayVerify = [];
		                        var totalVolume = parseInt(0);
		
		                        for (var i = 0; i < arrayPrice.length; i++) {
		                            for (var v = 1; v <= vigenciaNumber; v++) {
		                                if (v < 10) {
		                                    vigText = "0" + v;
		                                } else {
		                                    vigText = v.toString();
		                                }
		
		                                // Ajusta a data de vigência para comparar com o final do dia
		                                var vigenciaData = arrayPrice[i]["VIGENCIA_" + vigText];
		                                if (vigenciaData !== "00000000") {
		                                    // Convertendo a data de vigência para UTC e ajustando a hora para 23:59:59
		                                    var vigenciaFinalDia = new Date(Date.UTC(
		                                        parseInt(vigenciaData.substring(0, 4)), // Ano
		                                        parseInt(vigenciaData.substring(4, 6)) - 1, // Mês (zero-based)
		                                        parseInt(vigenciaData.substring(6, 8)), // Dia
		                                        23, 59, 59 // Hora final do dia
		                                    )).getTime();
		
		                                    // Comparação de datas
		                                    if (dataHoje <= vigenciaFinalDia) {
		                                        var data = {
		                                            mes: this._createMonthText(vigText),
		                                            mesAno: vigText + "-" + arrayPrice[i].FND_YEAR,
		                                            mesNumero: vigText,
		                                            material: arrayPrice[i].MATNR,
		                                            cereal: arrayPrice[i].TPCEREAL_,
		                                            ano: arrayPrice[i].FND_YEAR,
		                                            precoCompra: arrayPrice[i]["PRECO_" + vigText],
		                                            volumeCompra: arrayPrice[i]["VOLUME_" + vigText],
		                                            unidade: moedatipo,
		                                            moeda: arrayPrice[i].WAERS
		                                        };
		
		                                        dataItem.push(data);
		
		                                        arrayVerify.push({
		                                            "posicao": dataItem.length - 1,
		                                            "mes": this._createMonthText(vigText) + "-" + arrayPrice[i].FND_YEAR,
		                                            "ano": arrayPrice[i].FND_YEAR,
		                                            "valorVolume": Number(parseInt(arrayPrice[i]["VOLUME_" + vigText]))
		                                        });
		                                    }
		                                } else {
		                                    this.getView().byId("table").setNoDataText("Não existe vigência para os filtros selecionados");
		                                }
		                            }
		
		                            if (i == arrayPrice.length - 1) {
		                                var result = [];
		                                dataItem.reduce(function (res, value) {
		                                    if (!res[value.mesAno]) {
		                                        res[value.mesAno] = {
		                                            mes: value.mes,
		                                            mesAno: value.mesAno,
		                                            mesNumero: value.mesNumero,
		                                            material: value.material,
		                                            cereal: value.cereal,
		                                            ano: value.ano,
		                                            precoCompra: value.precoCompra,
		                                            volumeCompra: 0,
		                                            unidade: value.unidade,
		                                            moeda: value.moeda
		                                        };
		                                        result.push(res[value.mesAno])
		                                    }
		                                    res[value.mesAno].volumeCompra += Number(value.volumeCompra);
		                                    return res;
		                                }, {});
		
		                                tableModel.setProperty("/ItemPrice", result);
		                                this.closeBusyDialog();
		
		                                if (oTable.getBinding("items")) {
		                                    oTable.getBinding("items").refresh();
		                                }
		                            }
		
		                        }
		
		                    } else {
		                        this.closeBusyDialog();
		                        this.getView().byId("table").setNoDataText("Sem dados");
		                        sap.m.MessageBox.show(
		                            "Não existe tabela de preços com os filtros selecionados.", {
		                                title: "Advertência",
		                                icon: sap.m.MessageBox.Icon.WARNING,
		                                actions: [sap.m.MessageBox.Action.OK],
		                                onClose: function (oAction) {
		                                    if (oAction === "OK") {
		                                        console.log("ok");
		                                    }
		                                }.bind(this)
		                            }
		                        );
		                    }
		                }.bind(this)
		            });
		
		        }.bind(this));
		
		    }
		
		},
		sortButtonPressed: function (oEvent) {
			if (!this.SortDialog) {
				this.SortDialog = sap.ui.xmlfragment("com.sap.build.standard.brfAppDeGraosModoEditar.view.price.tablePrice.fragments.SortDialog",
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
				upperCase: false,
				group: true
			}));

			var oTable = this.getView().byId("table");

			oTable.getBinding("items").sort(oSorter);

			this.SortDialog.close();
		},

		changeMoreOptions: function () {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var sMessage = "Deseja exibir a lista completa de materiais?";

			if (this.getView().getModel("filters").getProperty("/moreOptionsColor") == "Negative") {

				var plant = this.getView().byId("PLANT").mProperties.value;

				if (plant != "") {

					this.getView().getModel("filters").setProperty("/noOptions", true);
				}

				this.getView().getModel("filters").setProperty("/showMateriais", false);
				this.getView().getModel("filters").setProperty("/moreOptionsColor", "Positive");
				this.getView().getModel("filters").setProperty("/moreOptionsIcon", "sap-icon://horizontal-grip");
				this.getView().getModel("filters").setProperty("/moreOptionsText", "Mais Opções");
				this.getView().getModel("filters").setProperty("/TPCEREAL", "");
				this.getView().getModel("filters").setProperty("/MATNR", "");
				this.getView().getModel("filters").setProperty("/MATNR_DESC", "");
				var oTable = this.getView().byId("table");
				var tableModel = this.getView().getModel("filterTable");
				tableModel.setProperty("/ItemPrice", []);
				oTable.getBinding("items").refresh();

			} else {
				MessageBox.information(
					sMessage, {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {

								this.getView().getModel("filters").setProperty("/noOptions", false);
								this.getView().getModel("filters").setProperty("/showMateriais", true);
								this.getView().getModel("filters").setProperty("/moreOptionsColor", "Negative");
								this.getView().getModel("filters").setProperty("/moreOptionsIcon", "sap-icon://decline");
								this.getView().getModel("filters").setProperty("/moreOptionsText", "Fechar");
								this.getView().getModel("filters").setProperty("/MATNR_DESC", "");
								var oTable = this.getView().byId("table");
								var tableModel = this.getView().getModel("filterTable");
								tableModel.setProperty("/ItemPrice", []);
								oTable.getBinding("items").refresh();

							} else {

								var plant = this.getView().byId("PLANT").mProperties.value;

								if (plant != "") {
									this.getView().getModel("filters").setProperty("/noOptions", true);
									this.getView().getModel("filters").setProperty("/showMateriais", false);
									this.getView().getModel("filters").setProperty("/moreOptionsColor", "Positive");
									this.getView().getModel("filters").setProperty("/moreOptionsIcon", "sap-icon://horizontal-grip");
									this.getView().getModel("filters").setProperty("/moreOptionsText", "Mais Opções");
									this.getView().getModel("filters").setProperty("/TPCEREAL", "");
									this.getView().getModel("filters").setProperty("/MATNR", "");
								}

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

		},
		verifyTimeOut: function () {

			if (!this.hasFinished) {
				setTimeout(function () {
					this.setBusyDialog("App Grãos", "Enviando dados, por favor aguarde (" + this.revertCount +
						")");
					this.count++;
					this.revertCount--;
					//	console.log("Countador está em: " + this.count);
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

		//parametros tabela de preços

		getParameters: function () {

			this.setBusyDialog("Tabela de Preços", "Carregando Parâmetros...");
			var oModel = this.getView().getModel();

			if (!sap.ui.getCore().byId("idIconTabBar")) {

				var oMainDataForm = this.byId("tabsFilter");

				var tabFilter = new sap.m.IconTabBar("idIconTabBar", {
					select: this.handleIconTabBarSelect.bind(this),
					expanded: true,
					expandable: false
				}).addStyleClass("sapUiResponsiveContentPadding removeBoxShadow");
				oMainDataForm.addItem(tabFilter);
			}

			oModel.read("/Table_Price_Parameters", {
				sorters: [new sap.ui.model.Sorter({
					path: "HCP_POSITION",
					descending: false
				})],
				success: function (result) {

					if (result.results.length > 0) {

						for (var i = 0; i < result.results.length; i++) {

							tabFilter.addItem(new sap.m.IconTabFilter({
								icon: "sap-icon://activity-items",
								enabled: "{filters>/noOptions}",
								iconColor: result.results[i]["HCP_GROUP_COLOR"],
								text: result.results[i]["HCP_GROUP_DESCRIPTION"],
								key: result.results[i]["HCP_MATERIAL"] + "|" + result.results[i]["HCP_TYPE_MATERIAL"] + "|" + result.results[i][
									"HCP_MATERIAL_DESCRIPTION"
								] + "/" + result.results[i]["HCP_TYPE_MATERIAL_DESCRIPTION"]
							}));

							if (i == result.results.length - 1) {
								tabFilter.addItem(new sap.m.IconTabFilter({
									icon: "{filters>/moreOptionsIcon}",
									iconColor: "{filters>/moreOptionsColor}",
									text: "{filters>/moreOptionsText}",
									key: "000000000000000000|00|00"
								}));
							}

						}

					}
					this.closeBusyDialog();
				}.bind(this)
			});
		},

		showMessage: function () {
			localStorage.setItem("isNeededToReload", true);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("errorPages.timeOutConnection", true);
		}

	});
}, /* bExport= */ true);