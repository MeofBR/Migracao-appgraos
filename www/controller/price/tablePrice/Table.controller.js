sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter",
	"sap/ui/table/Table"
], function (MainController, MessageBox, History, JSONModel, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.price.tablePrice.Table", {
		formatter: formatter,

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("price.tablePrice.Table").attachPatternMatched(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(this.getOwnerComponent().getModel("i18n"));
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

		},
		handleRouteMatched: function (oEvent) {

			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				ItemPrice: []
			}), "filterTable");
			var tableModel = this.getView().getModel("filterTable");
			tableModel.setProperty("/materialNumero", 0);

			this.getOwnerComponent().getModel().resetChanges();
			this.setBusyDialog("App Grãos", "Atualizando lista, por favor aguarde");

			if (oEvent.getParameter("arguments")) {
				this.ekgrp = oEvent.getParameter("arguments").ekgrp;
				this.werks = oEvent.getParameter("arguments").werks;
				this.matnr = oEvent.getParameter("arguments").matnr;
				this.tpcereal = oEvent.getParameter("arguments").tpcereal;
				this.mesSelecionado = oEvent.getParameter("arguments").mes;
				this.anoSelecionado = oEvent.getParameter("arguments").ano;
				this.year_start = this.anoSelecionado;
				this.year_end = this.anoSelecionado;
				this.startMonth = this.mesSelecionado;
				this.endMonth = this.mesSelecionado;
			}
			this.ano = this.anoSelecionado;
			this._submitFilter();
		},
		_submitFilter: function () {

			var oModel = this.getOwnerComponent().getModel();
			var oComponent = this.getOwnerComponent();
			var oTable = this.getView().byId("table");
			var oDeviceModel = oComponent.getModel("device");
			this.getView().setModel(oDeviceModel, "device");
			var objekgrp = this.ekgrp.split("-");
			var material = this.matnr.split("-");
			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'EKGRP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: objekgrp[0]
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: 'WERKS',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.werks
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: 'MATNR',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: material[0]
			}));

			if (this.tpcereal !== "false") {
				aFilters.push(new sap.ui.model.Filter({
					path: 'TPCEREAL',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: this.tpcereal
				}));
			}
			aFilters.push(new sap.ui.model.Filter({
				path: 'FND_YEAR',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.ano
			}));

			oModel.read("/Table_Price", {
				filters: aFilters,
				urlParameters: {
					"$expand": "Price_Material_Type"
				},
				success: function (oData) {

					var dataHoje = this.createData(new Date());
					this.closeBusyDialog();

					for (var m = 0; m < oData.results.length; m++) {
						var valueMesInicio = this.startMonth;
						var valueMesFim = this.endMonth;

						if (this.ano !== this.year_end) {
							valueMesInicio = 1;
							valueMesFim = 12;
						} else {
							if ((this.year_start !== this.year_end) && (valueMesInicio === valueMesFim)) {
								valueMesInicio = 1;
							}
						}

						for (var mesList = valueMesInicio; mesList <= valueMesFim; mesList++) {

							var data = {
								mes: this._createMonth(mesList),
								mesNumero: mesList,
								material: oData.results[m].MATNR,
								cereal: oData.results[m].TPCEREAL_,
								ano: oData.results[m].FND_YEAR,
								precoCompra: oData.results[m]["PRECO_" + mesList],
								volumeCompra: oData.results[m]["VOLUME_" + mesList],
								unidade: oData.results[m].UNIT,
								moeda: oData.results[m].WAERS
							};

							var tableModel = this.getView().getModel("filterTable");
							var dataItem = tableModel.getProperty("/ItemPrice");

							if (dataHoje <= oData.results[m]["VIGENCIA_" + mesList]) {
								dataItem.push(data);
								tableModel.setProperty("/ItemPrice", dataItem);
								tableModel.setProperty("/centroTexto", oData.results[m].WERKS + " - " + oData.results[m].NAME1);
								tableModel.setProperty("/grupoTexto", objekgrp[0] + " - " + objekgrp[1]);
								tableModel.setProperty("/materialNumero", material[0]);
								tableModel.setProperty("/materialTexto", material[1]);

								tableModel.setProperty("/mesTexto", this._createMonth(mesList));
								tableModel.setProperty("/anoTexto", oData.results[m].FND_YEAR);
								tableModel.setProperty("/data", this.formatDate(oData.results[m].AEDAT));
								tableModel.setProperty("/hora", this.formatHour(oData.results[m].AEZET));
								tableModel.setProperty("/dataVig", this.formatDate(oData.results[m].VIG_DATE));
								tableModel.setProperty("/horaVig", this.formatHour(oData.results[m].VIG_TIME));
								this.getView().setModel(tableModel, "filterTable");
							}

							if (oTable.getBinding("items")) {
								oTable.getBinding("items").refresh();
							}
						}
					}

					//if (this.ano <= this.year_end) {
					//	this.ano = this.ano + 1;
					//this._submitFilter();
					//}

				}.bind(this)
			});

		},
		createData: function (data) {
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
			return data.getFullYear() + mes + dia;
		},
		formatDate: function (data) {
			var newday = data;
			var newmonth = data;
			var newyear = data;
			return newday.slice(6, 8) + "/" + newmonth.slice(4, 6) + "/" + newyear.slice(0, 4);

		},
		formatHour: function (data) {
			var hour = data;
			var minute = data;
			var seconds = data;
			return hour.slice(0, 2) + ":" + minute.slice(2, 4) + ":" + seconds.slice(4, 6);

		},
		_createMonth: function (month) {

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
			} else if (month === "10") {
				return this.resourceBundle.getText("october");
			} else if (month === "11") {
				return this.resourceBundle.getText("november");
			} else {
				return this.resourceBundle.getText("december");
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
		setBusyDialog: function (aTitle, aMessage) {
			if (!this.busyDialog) {
				this.busyDialog = new sap.m.BusyDialog("busyDialogID" + this.getView().getId());
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
			//	data.getData()
		}
	});
}, /* bExport= */ true);