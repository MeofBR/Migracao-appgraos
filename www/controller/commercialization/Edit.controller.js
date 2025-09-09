sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, JSONModel, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.commercialization.Edit", {
		formatter: formatter,
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("commercialization.Edit").attachPatternMatched(this.handleRouteMatched, this);
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		handleRouteMatched: function (oEvent) {
			this.getUser().then(function (userName) {
				this.userName = userName;

				this.getUserProfile("View_Profile_Commercialization", this.userName).then(profileData => {
					this.getView().getModel("profileModel").setData(profileData);
					console.log(this.getView().getModel("profileModel").getData());
					this.closeBusyDialog();
				}).catch(error => {
					console.log(error);
					this.closeBusyDialog();
				});
			}.bind(this));
			this.setBusyDialog("Comercialização", "Carregando");

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableTonelada: true,
				enablePorcentagem: false,
				HCP_CAPACITY_TYPE: 0,
				enableCreate: true,
				dataWeek: "",
				dataValueState: "Success",
				HCP_CAPACITY_TONNE: 0,
				HCP_CAPACITY_PERCENT: 0,
				HCP_CROP_TRACK_ID: 0,
				HCP_NEGO_REPORT_ID: 0,
				HCP_TOTAL_NEGOTIATION: 0,
				HCP_TOTAL_NEGOTIATION_PERCENT: "",
				HCP_TOTAL_CROP_TRACK: 0,
				HCP_TOTAL: 0,
				HCP_TEXT: "",
				hasLastWeek: false,
				noExistsCropTrack: true,
				visibleCentralRegion: true
			}), "editCommercializationModel");

			var oEditModel = this.getView().getModel("editCommercializationModel");
			var oModel = this.getView().getModel();
			var oData;

			if (oEvent.getParameter("arguments")) {
				var sPathKeyData = oEvent.getParameter("arguments").HCP_COMMERC_ID;
				oData = oModel.getProperty(decodeURIComponent(sPathKeyData));
				//oData = JSON.parse(JSON.stringify(oData));
				oEditModel.setProperty("/", oData);

				if (oEditModel.getProperty("/HCP_TOTAL_NEGOTIATION_PERCENT") > 100) {
					oEditModel.setProperty("/dataValueState", "Error");
				} else {
					oEditModel.setProperty("/dataValueState", "Success");
				}

				oEditModel.setProperty("/dataWeek", oEditModel.getProperty("/HCP_PERIOD"));

				if (oEditModel.getProperty("/HCP_CAPACITY_TYPE") == 0) {
					oEditModel.setProperty("/enableTonelada", true);
					oEditModel.setProperty("/enablePorcentagem", false);
				} else {
					oEditModel.setProperty("/enableTonelada", false);
					oEditModel.setProperty("/enablePorcentagem", true);
				}

				oEditModel.setProperty("/enableCreate", false);

				//oEditModel.setProperty("/HCP_CAPACITY_PERCENT", parseFloat(parseFloat(oData.HCP_CAPACITY_PERCENT).toFixed(2)));
				//oEditModel.setProperty("/HCP_TOTAL_NEGOTIATION_PERCENT", parseFloat(parseFloat(oData.HCP_TOTAL_NEGOTIATION_PERCENT).toFixed(2)));

				var aKeyData = JSON.parse(decodeURIComponent(oEvent.getParameter("arguments").keyData));
				this._findCropTracking(aKeyData);
				//this.closeBusyDialog();
			}

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				create: true,
				edit: true
			}), "profileModel");

		},

		navBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Filter", true);
			}
		},

		_findCropTracking: function (aKeyData) {

			//var oModelWeek = new sap.ui.model.json.JSONModel({});
			var oModelWeek = this.getView().getModel("editCommercializationModel");
			var oData = oModelWeek.getProperty("/");
			this.regio = aKeyData.HCP_REGIO.split("-");
			this.material = aKeyData.HCP_MATERIAL.split("-");
			this.state = aKeyData.HCP_STATE.split("-");
			var oModel = this.getOwnerComponent().getModel();

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				estado: this.state[1],
				regiao: this.regio[1],
				material: this.material[1]
			}), "modelFilter");

			var oModelFilter = this.getView().getModel("modelFilter");

			oModelWeek.setProperty("/estado", this.state[1]);
			oModelWeek.setProperty("/regiao", this.regio[1]);
			
			if (oModelWeek.oData.estado == oModelWeek.oData.regiao)
				oModelWeek.setProperty("/visibleCentralRegion", false)
			else
				oModelWeek.setProperty("/visibleCentralRegion", true)

			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_CROP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: aKeyData.HCP_CROP
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_STATE',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.state[0]
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_REGIO',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.regio[0]
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_MATERIAL',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.material[0]
			}));

			oModel.read("/Commercialization", {
				filters: aFilters,
				sorters: [new sap.ui.model.Sorter({
					path: "HCP_CREATED_AT",
					descending: true
				})],
				success: function (resultCommerc) {

					this.getCropTracking(aKeyData).then(function () {

						this.closeBusyDialog();
						var key = (resultCommerc.results.length) - 2;

						if (resultCommerc.results.length > 0 && key >= 0) {

							if (resultCommerc.results[1].HCP_PERIOD === resultCommerc.results[0].HCP_PERIOD) {
								oModelWeek.setProperty("/HCP_CAPACITY_PERCENT_LW", resultCommerc.results[2].HCP_CAPACITY_PERCENT);
								oModelWeek.setProperty("/dataLastWeek", resultCommerc.results[2].HCP_PERIOD.slice(0, 2));
								oModelWeek.setProperty("/HCP_TOTAL_PRODUCTION_LAST_WEEK", resultCommerc.results[2].HCP_CAPACITY_TONNE);

							} else {
								oModelWeek.setProperty("/HCP_CAPACITY_PERCENT_LW", resultCommerc.results[1].HCP_CAPACITY_PERCENT);
								oModelWeek.setProperty("/dataLastWeek", resultCommerc.results[1].HCP_PERIOD.slice(0, 2));
								oModelWeek.setProperty("/HCP_TOTAL_PRODUCTION_LAST_WEEK", resultCommerc.results[1].HCP_CAPACITY_TONNE);
							}

						} else {
							oModelWeek.setProperty("/dataLastWeek", "(N/A)");
							oModelWeek.setProperty("/hasDataLastWeek", false);
						}

					}.bind(this));

				}.bind(this),
				error: function () {
					this.closeBusyDialog();
					sap.m.MessageToast.show("Falha ao Buscar Acompanhamentos / Comercialização.");
				}
			});

			//	this.closeBusyDialog();

			/*
			var self = this;

			oModel.read("/Crop_Tracking", {
				urlParameters: {
					"$expand": "Crop_Track_Partner",
					"$top": 2
				},
				filters: aFilters,
				sorters: [new sap.ui.model.Sorter({
					path: "HCP_CREATED_AT",
					descending: true
				})],
				success: function (result) {
					//this.closeBusyDialog();
					var oFilterModel = this.getView().getModel("editCommercializationModel");

					for (var m = 0; m < result.results.length; m++) {

						if (m === 0) {
							oFilterModel.setProperty("/HCP_CROP_TRACK_ID", result.results[0].HCP_CROP_TRACK_ID);
							oFilterModel.setProperty("/dataWeek", result.results[m].HCP_PERIOD.slice(0, 2));
							oFilterModel.setProperty("/HCP_TOTAL_CROP_TRACK", result.results[m].HCP_TOTAL_PRODUCTION);
							this.getView().setModel(oModelWeek, "modelFilter");
						}

					}

					oModel.read("/Commercialization", {
						filters: aFilters,
						sorters: [new sap.ui.model.Sorter({
							path: "HCP_CREATED_AT",
							descending: true
						})],
						success: function (resultCommerc) {
							self.closeBusyDialog();
							var key = (resultCommerc.results.length) - 1;

							if (resultCommerc.results.length > 0) {

								var totalCropTrack = oFilterModel.getProperty("/HCP_TOTAL_CROP_TRACK");
								var totalNegotiationReport = oFilterModel.getProperty("/HCP_TOTAL_NEGOTIATION");

								oFilterModel.setProperty("/HCP_CAPACITY_PERCENT_LW", resultCommerc.results[key].HCP_CAPACITY_PERCENT);
								oFilterModel.setProperty("/dataLastWeek", resultCommerc.results[key].HCP_PERIOD.slice(0, 2));
								oFilterModel.setProperty("/HCP_TOTAL_PRODUCTION_LAST_WEEK", resultCommerc.results[key].HCP_CAPACITY_TONNE);
								oFilterModel.setProperty("/HCP_CAPACITY_TONNE", resultCommerc.results[key].HCP_CAPACITY_TONNE);

								var calcPercent = resultCommerc.results[key].HCP_CAPACITY_TONNE / totalCropTrack;
								oFilterModel.setProperty("/HCP_CAPACITY_PERCENT", Math.round(calcPercent * 100));
								oFilterModel.setProperty("/HCP_TOTAL", totalCropTrack - resultCommerc.results[key].HCP_CAPACITY_TONNE);

								var calcPercentNegotiations = totalNegotiationReport / totalCropTrack;
								oFilterModel.setProperty("/HCP_TOTAL_NEGOTIATION_PERCENT", Math.round(calcPercentNegotiations * 100));

								if (oFilterModel.getProperty("/HCP_TOTAL_NEGOTIATION_PERCENT") > 100) {
									oFilterModel.setProperty("/dataValueState", "Error");
								} else {
									oFilterModel.setProperty("/dataValueState", "Success");
								}

								oFilterModel.setProperty("/hasLastWeek", true);
							}

						}.bind(this),
						error: function () {
							self.closeBusyDialog();
							sap.m.MessageToast.show("Falha ao Buscar Acompanhamentos / Comercialização.");
						}
					});

				}.bind(this),
				error: function () {
					self.closeBusyDialog();
					sap.m.MessageToast.show("Falha ao Buscar Acompanhamentos / Comercialização.");
				}
			});
			*/

		},

		_findNegotiation: function (aKeyData, oModel) {

			var oModelWeek = new sap.ui.model.json.JSONModel({});
			this.regio = aKeyData.HCP_REGIO.split("-");
			oModelWeek.setProperty("/estado", this.state[1]);
			oModelWeek.setProperty("/regiao", this.regio[1]);

			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_CROP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: aKeyData.HCP_CROP
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_STATE',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.state[0]
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_REGIO',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.regio[0]
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_MATERIAL',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: aKeyData.HCP_MATERIAL
			}));

			oModel.read("/Negotiation_Report", {
				filters: aFilters,
				sorters: [new sap.ui.model.Sorter({
					path: "HCP_CREATED_AT",
					descending: true
				})],
				success: function (result) {
					this.closeBusyDialog();
					var totalNegotiaton = parseInt(0);
					var oFilterModel = this.getView().getModel("editCommercializationModel");
					oFilterModel.setProperty("/HCP_NEGO_REPORT_ID", result.results[0].HCP_NEGO_REPORT_ID);

					for (var m = 0; m < result.results.length; m++) {
						if (result.results[m].HCP_STATUS != 1) {
							totalNegotiaton = parseInt(totalNegotiaton) + parseInt(result.results[m].HCP_TONNAGE);
							this.getView().setModel(oModelWeek, "modelReport");
							oFilterModel.setProperty("/HCP_TOTAL_NEGOTIATION", totalNegotiaton);
						}
					}
				}.bind(this),
				error: function () {
					this.closeBusyDialog();
					sap.m.MessageToast.show("Falha ao Buscar Relatos de Negociação / Comercialização.");
				}
			});
		},
		_commercializationButtonPressed: function (oEvent) {

			var oSource = oEvent.getSource();
			var oModelWeek = this.getView().getModel("editCommercializationModel");
			var oData = oModelWeek.getProperty("/");
			oModelWeek.setProperty("/HCP_CAPACITY_PERCENT", parseFloat(parseFloat(oData.HCP_CAPACITY_PERCENT).toFixed(2)));
			oModelWeek.setProperty("/HCP_CAPACITY_PERCENT_CLONE", parseFloat(parseFloat(oData.HCP_CAPACITY_PERCENT).toFixed(2)));
			oModelWeek.setProperty("/HCP_CAPACITY_TONNE_CLONE", parseFloat(parseFloat(oData.HCP_CAPACITY_TONNE).toFixed(2)));

			if (oSource.getId().includes('idPercent') == false) {

				if (!this._FragmentFilterEdit) {
					this._FragmentFilterEdit = sap.ui.xmlfragment("editComID" + this.getView().getId(),
						"com.sap.build.standard.brfAppDeGraosModoEditar.view.commercialization.fragments.EditCom",
						this);
					this.getView().addDependent(this._FragmentFilterEdit);
				}
				this._FragmentFilterEdit.open();

			} else {

				if (!this._FragmentProdTot) {
					this._FragmentProdTot = sap.ui.xmlfragment("addProdTotID" + this.getView().getId(),
						"com.sap.build.standard.brfAppDeGraosModoEditar.view.commercialization.fragments.AddProdTot",
						this);
					this.getView().addDependent(this._FragmentProdTot);
				}

				var oModelAdd = new sap.ui.model.json.JSONModel({
					HCP_TOTAL_CROP_TRACK_CLONE: oData.HCP_TOTAL_CROP_TRACK
				});

				this.getView().setModel(oModelAdd, "addProdTotalModel");
				this._FragmentProdTot.open();

			}

		},
		_onChangeCheck: function () {

			var oceditCommercializationModel = this.getView().getModel("editCommercializationModel");
			var oData = oceditCommercializationModel.getProperty("/");

			if (oData.HCP_CAPACITY_TYPE == 0) {
				oceditCommercializationModel.setProperty("/enableTonelada", true);
				oceditCommercializationModel.setProperty("/enablePorcentagem", false);
			} else {
				oceditCommercializationModel.setProperty("/enableTonelada", false);
				oceditCommercializationModel.setProperty("/enablePorcentagem", true);
			}

		},
		onCancelDialogPressed: function (oEvent) {
			oEvent.getSource().getParent().close();
		},
		onConfirm: function (oEvent) {
			//CALCULATE COMMERCIALIZATION
			var oceditCommercializationModel = this.getView().getModel("editCommercializationModel");
			var oData = oceditCommercializationModel.oData;

			oData.HCP_CAPACITY_PERCENT = oData.HCP_CAPACITY_PERCENT_CLONE;
			oData.HCP_CAPACITY_TONNE = oData.HCP_CAPACITY_TONNE_CLONE;

			//Verifica se o valor selecionado é tonelada ou porcentagem 
			if (oData["enableTonelada"]) {

				if (parseFloat(oData.HCP_CAPACITY_TONNE) < 0) {
					MessageBox.warning(
						"Valor comercializado deve ser maior que 0.", {
							actions: [sap.m.MessageBox.Action.OK]
						}
					);
					oceditCommercializationModel.setProperty("/HCP_CAPACITY_TONNE", 0);
				} else if (parseFloat(oData.HCP_CAPACITY_TONNE) > parseFloat(oData.HCP_TOTAL_CROP_TRACK)) {
					MessageBox.warning(
						"Valor comercializado deve ser menor que a produção total.", {
							actions: [sap.m.MessageBox.Action.OK]
						}
					);
					oceditCommercializationModel.setProperty("/HCP_CAPACITY_TONNE", 0);
				}

				oceditCommercializationModel.setProperty("/enablePorcentagem", false);
				var calc = oData["HCP_TOTAL_CROP_TRACK"] - oData["HCP_CAPACITY_TONNE"];
				oceditCommercializationModel.setProperty("/HCP_TOTAL", calc.toFixed());
				var calcPercent = oData["HCP_CAPACITY_TONNE"] / oData["HCP_TOTAL_CROP_TRACK"];
				oceditCommercializationModel.setProperty("/HCP_CAPACITY_PERCENT", parseFloat((calcPercent * 100).toFixed(2)));

				//CALCULATE NEGOTIATION
				var calcPercentNegotiation = oData["HCP_TOTAL_NEGOTIATION"] ? oData["HCP_TOTAL_NEGOTIATION"] : "0" / oData["HCP_TOTAL_CROP_TRACK"];
				if (Math.round(calcPercentNegotiation * 100) > 100) {
					oceditCommercializationModel.setProperty("/dataValueState", "Error");
				} else {
					oceditCommercializationModel.setProperty("/dataValueState", "Success");
				}
				oceditCommercializationModel.setProperty("/HCP_TOTAL_NEGOTIATION_PERCENT", parseFloat((calcPercentNegotiation * 100).toFixed(2)));

			} else {

				oceditCommercializationModel.setProperty("/enableTonelada", false);
				var percent = parseFloat((oData["HCP_CAPACITY_PERCENT"] / 100).toFixed(2));
				var calc = oData["HCP_TOTAL_CROP_TRACK"] * percent;
				oceditCommercializationModel.setProperty("/HCP_TOTAL", (oData["HCP_TOTAL_CROP_TRACK"] - calc).toFixed());
				oceditCommercializationModel.setProperty("/HCP_CAPACITY_PERCENT", parseFloat(oData["HCP_CAPACITY_PERCENT"].toFixed(2)));
				oceditCommercializationModel.setProperty("/HCP_CAPACITY_TONNE", parseInt(calc.toFixed(2)));

				//CALCULATE NEGOTIATION
				var calcPercentNegotiations = oData["HCP_TOTAL_NEGOTIATION"] ? oData["HCP_TOTAL_NEGOTIATION"] : "0" / oData["HCP_TOTAL_CROP_TRACK"];
				if (Math.round(calcPercentNegotiations * 100) > 100) {
					oceditCommercializationModel.setProperty("/dataValueState", "Error");
				} else {
					oceditCommercializationModel.setProperty("/dataValueState", "Success");
				}
				oceditCommercializationModel.setProperty("/HCP_TOTAL_NEGOTIATION_PERCENT", Math.round(calcPercentNegotiations * 100));

			}

			oEvent.getSource().getParent().close();
		},
		calcCommercialization: function () {

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

		_validateForm: function () {
			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;
				var oFilterModel = this.getView().getModel("editCommercializationModel");

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

			var oMainDataForm = sap.ui.core.Fragment.byId("editComID" + this.getView().getId(), "commercializationKeysForm").getContent();
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
		_confirmData: function () {
			//editCommercializationModel>/HCP_CAPACITY_PERCENT
			//editCommercializationModel>/HCP_CAPACITY_TONNE

		},
		_onButtonSave: function () {
			//var oFilterModel = this.getView().getModel("editCommercializationModel");
			//oFilterModel.oData["HCP_CROP_TRACK_ID"] = this.cropId;
			//console.log(oFilterModel.oData);
		},
		_onSave: function (oEvent) {

			this.setBusyDialog("Comercialização", "Salvando, aguarde");
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var oEditModel = this.getView().getModel("editCommercializationModel");
			var oData = oEditModel.getProperty("/");
			var sPeriod = this.getWeek() + new Date().getFullYear();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var sPath;
			var aDeferredGroups = oModel.getDeferredGroups();

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}

			var aData = {
				HCP_CROP: oData.HCP_CROP,
				HCP_STATE: oData.HCP_STATE,
				HCP_REGIO: oData.HCP_REGIO,
				HCP_MATERIAL: oData.HCP_MATERIAL,
				HCP_CAPACITY_TONNE: parseFloat(oData.HCP_CAPACITY_TONNE).toFixed(),
				HCP_CAPACITY_PERCENT: parseFloat(oData.HCP_CAPACITY_PERCENT).toFixed(2),
				HCP_NEGO_REPORT_ID: oData.HCP_NEGO_REPORT_ID,
				HCP_TOTAL_NEGOTIATION: parseInt(oData.HCP_TOTAL_NEGOTIATION).toFixed(),
				HCP_TOTAL_NEGOTIATION_PERCENT: parseFloat(oData.HCP_TOTAL_NEGOTIATION_PERCENT).toFixed(2),
				//HCP_TOTAL_CROP_TRACK: parseInt(oData.HCP_TOTAL_CROP_TRACK).toFixed(),
				HCP_TOTAL: parseInt(oData.HCP_TOTAL).toFixed(),
				HCP_TEXT: oData.HCP_TEXT,
				HCP_PERIOD: oData.HCP_PERIOD,
				HCP_CAPACITY_TYPE: oData.HCP_CAPACITY_TYPE.toString(),
				HCP_CREATED_BY: this.userName,
				HCP_UPDATED_BY: this.userName,
				HCP_UPDATED_AT: this._formatDate(new Date()),
				HCP_CREATED_AT: this._formatDate(new Date())
			};

			sPath = this.buildEntityPath("Commercialization", oData);

			oModel.update(sPath, aData, {
				groupId: "changes"
			});

			if ((bIsMobile && navigator.connection.type !== "none")) {

				oModel.submitChanges({
					groupId: "changes",
					success: function () {
						this.flushStore("Commercialization").then(function () {
							this.refreshStore("Commercialization").then(function () {
								this._onUpsertCentralRegioCommercialization(oData).then(function () {
									MessageBox.success(
										"Comercialização Editada com sucesso.", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												//this.navBack();
												this.closeBusyDialog();
												this.backToIndex();
											}.bind(this)
										}
									);
								}.bind(this))
							}.bind(this));
						}.bind(this));
					}.bind(this),
					error: function () {
						this.closeBusyDialog();
						MessageBox.error("Erro ao editar Comercialização.");
					}.bind(this)
				});
			} else {
				oModel.submitChanges({
					groupId: "changes",
					success: function () {
						this._onUpsertCentralRegioCommercialization(oData).then(function () {
							MessageBox.success(
								"Comercialização Editado com sucesso.", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										//this.navBack();
										this.closeBusyDialog();
										this.backToIndex();
									}.bind(this)
								}
							);
						}.bind(this))
					}.bind(this),
					error: function () {
						MessageBox.error("Erro ao editar Comercialização.");
					}.bind(this)
				});
			}

		},
		
		roundingRule: function (valor) {
			const parteDecimal = valor - Math.floor(valor);
			 
		    if (parteDecimal >= 0.5)
		    	return Math.ceil(valor);
		    else
		    	return Math.floor(valor);
		},
		
		_onUpsertCentralRegioCommercialization: async function (oData) {
			var oModel = this.getView().getModel();
			var sTimestamp = new Date().getTime();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			
			let that = this;

			await this.getCentralRegion(oData).then(function (regioCenterCommecialization) {
				let regionCentralId = regioCenterCommecialization.HCP_REGIO ? regioCenterCommecialization.HCP_REGIO : regioCenterCommecialization.HCP_ID
				
				that.checkCentralRegion(oData, regionCentralId).then(function (resultCalcConsolidado) {
					
					if (regioCenterCommecialization.HCP_COMMERC_ID) {
						let sCommecializationCrop = `/Commercialization(${regioCenterCommecialization.HCP_COMMERC_ID}l)`;
	
						let percentCommercialized = resultCalcConsolidado.HCP_CAPACITY_PERCENT
						let capacityTonne = (percentCommercialized / 100) * resultCalcConsolidado.HCP_TOTAL_PRODUCTION
						let totalAvailable = resultCalcConsolidado.HCP_TOTAL_PRODUCTION - capacityTonne
						
						percentCommercialized = parseFloat(percentCommercialized).toFixed(2)
						capacityTonne = that.roundingRule(capacityTonne)
						totalAvailable = that.roundingRule(totalAvailable)
						let totalProduction = that.roundingRule(resultCalcConsolidado.HCP_TOTAL_PRODUCTION)
	
						if (regioCenterCommecialization.HCP_PERIOD == that.getWeek() + new Date().getFullYear()) {
							let calcPercentNegotiation = regioCenterCommecialization.HCP_TOTAL_NEGOTIATION ? regioCenterCommecialization.HCP_TOTAL_NEGOTIATION : "0" / totalProduction;
							regioCenterCommecialization.HCP_TOTAL_NEGOTIATION_PERCENT = parseFloat((calcPercentNegotiation * 100).toFixed(2)).toFixed(2);
	
							let aDataCommercialization = {
								HCP_CAPACITY_PERCENT: percentCommercialized,
								HCP_CAPACITY_TONNE: capacityTonne.toString(),
								HCP_CAPACITY_TYPE: regioCenterCommecialization.HCP_CAPACITY_TYPE,
								HCP_COMMERC_ID: regioCenterCommecialization.HCP_COMMERC_ID,
								HCP_CREATED_AT: regioCenterCommecialization.HCP_CREATED_AT,
								HCP_CREATED_BY: regioCenterCommecialization.HCP_CREATED_BY,
								HCP_CROP: regioCenterCommecialization.HCP_CROP.toString(),
								HCP_MATERIAL: regioCenterCommecialization.HCP_MATERIAL,
								HCP_NEGO_REPORT_ID: regioCenterCommecialization.HCP_NEGO_REPORT_ID,
								HCP_PERIOD: regioCenterCommecialization.HCP_PERIOD,
								HCP_PLATAFORM: regioCenterCommecialization.HCP_PLATAFORM,
								HCP_REGIO: regioCenterCommecialization.HCP_REGIO,
								HCP_STATE: regioCenterCommecialization.HCP_STATE,
								HCP_TEXT: regioCenterCommecialization.HCP_TEXT,
								HCP_TOTAL: totalAvailable.toString(),
								HCP_TOTAL_CROP_TRACK: totalProduction.toString(),
								HCP_TOTAL_NEGOTIATION: regioCenterCommecialization.HCP_TOTAL_NEGOTIATION,
								HCP_TOTAL_NEGOTIATION_PERCENT: parseFloat(regioCenterCommecialization.HCP_TOTAL_NEGOTIATION_PERCENT).toFixed(2),
								HCP_UPDATED_AT: that._formatDate(new Date()),
								HCP_UPDATED_BY: that.userName
							};
	
							oModel.update(sCommecializationCrop, aDataCommercialization, {
								groupId: "changes"
							});
	
							if ((bIsMobile && navigator.connection.type !== "none")) {
								oModel.submitChanges({
									groupId: "changes",
									success: function () {
										that.flushStore("Commercialization").then(function () {
											that.refreshStore("Commercialization").then(function () {
											}.bind(that));
										}.bind(that));
									}.bind(that)
								});
							} else {
								oModel.submitChanges({
									groupId: "changes"
								});
							}
						} else {
							that.getNegotiationReport(regioCenterCommecialization).then(function (result) {
								let totalNegociationPercent = "0.00";
	
								if (result?.HCP_TOTAL_NEGOTIATION) {
									let calcPercentNegotiation = parseFloat(result.HCP_TOTAL_NEGOTIATION ? result.HCP_TOTAL_NEGOTIATION : "0") / totalProduction;
									totalNegociationPercent = parseFloat((calcPercentNegotiation * 100).toFixed(2)).toFixed(2);
								}
	
								let aDataCommercialization = {
									HCP_COMMERC_ID: sTimestamp.toFixed(),
									HCP_CROP: regioCenterCommecialization.HCP_CROP.toString(),
									HCP_STATE: regioCenterCommecialization.HCP_STATE,
									HCP_REGIO: regioCenterCommecialization.HCP_REGIO,
									HCP_MATERIAL: regioCenterCommecialization.HCP_MATERIAL,
									HCP_CAPACITY_TONNE: capacityTonne.toString(),
									HCP_CAPACITY_PERCENT: percentCommercialized,
									HCP_NEGO_REPORT_ID: result ? result.HCP_NEGO_REPORT_ID : "0",
									HCP_TOTAL_NEGOTIATION: result ? result.HCP_TOTAL_NEGOTIATION : "0",
									HCP_TOTAL_NEGOTIATION_PERCENT: totalNegociationPercent,
									HCP_TOTAL_CROP_TRACK: totalProduction.toString(),
									HCP_TOTAL: totalAvailable.toString(),
									HCP_TEXT: regioCenterCommecialization.HCP_TEXT,
									HCP_PERIOD: that.getWeek() + new Date().getFullYear(),
									HCP_CAPACITY_TYPE: "0",
									HCP_PLATAFORM: bIsMobile ? '1' : '2',
									HCP_CREATED_BY: that.userName,
									HCP_UPDATED_BY: that.userName,
									HCP_UPDATED_AT: that._formatDate(new Date()),
									HCP_CREATED_AT: that._formatDate(new Date()),
								};
								
								oModel.createEntry("/Commercialization", {
									properties: aDataCommercialization
								}, {
									groupId: "changes"
								});
	
								if ((bIsMobile && navigator.connection.type !== "none")) {
									oModel.submitChanges({
										groupId: "changes",
										success: function () {
											that.flushStore("Commercialization").then(function () {
												that.refreshStore("Commercialization").then(function () {
												}.bind(that));
											}.bind(that));
										}.bind(that)
									});
								} else {
									oModel.submitChanges({
										groupId: "changes"
									});
								}
							})
						}
					} else {
						let dataToGetCenterCommerc = {
							HCP_CROP: oData.HCP_CROP_ID ? oData.HCP_CROP_ID : oData.HCP_CROP,
							HCP_STATE: regioCenterCommecialization.HCP_BLAND,
							HCP_REGIO: regioCenterCommecialization.HCP_ID,
							HCP_MATERIAL: oData.HCP_MATERIAL
						}
	
						that.getNegotiationReport(dataToGetCenterCommerc).then(function (result) {
							let percentCommercialized = oData.HCP_CAPACITY_PERCENT
							let capacityTonne = (percentCommercialized / 100) * oData.HCP_TOTAL_PRODUCTION
							let totalAvailable = oData.HCP_TOTAL_PRODUCTION - capacityTonne
							
							percentCommercialized = parseFloat(percentCommercialized).toFixed(2)
							capacityTonne = that.roundingRule(capacityTonne)
							totalAvailable = that.roundingRule(totalAvailable)
							let totalProduction = that.roundingRule(oData.HCP_TOTAL_PRODUCTION)
							
							let totalNegociationPercent = "0.00";
	
							if (result.HCP_TOTAL_NEGOTIATION) {
								let calcPercentNegotiation = parseFloat(result.HCP_TOTAL_NEGOTIATION ? result.HCP_TOTAL_NEGOTIATION : "0") / oData.HCP_TOTAL_PRODUCTION;
								totalNegociationPercent = parseFloat((calcPercentNegotiation * 100).toFixed(2)).toFixed(2);
							}
	
							let aDataCommercialization = {
								HCP_COMMERC_ID: sTimestamp.toFixed(),
								HCP_CROP: oData.HCP_CROP_ID ? oData.HCP_CROP_ID : oData.HCP_CROP,
								HCP_STATE: regioCenterCommecialization.HCP_BLAND,
								HCP_REGIO: regioCenterCommecialization.HCP_ID,
								HCP_MATERIAL: oData.HCP_MATERIAL,
								HCP_CAPACITY_TONNE: capacityTonne.toString(),
								HCP_CAPACITY_PERCENT: percentCommercialized,
								HCP_NEGO_REPORT_ID: result ? result.HCP_NEGO_REPORT_ID : "0",
								HCP_TOTAL_NEGOTIATION: result ? result.HCP_TOTAL_NEGOTIATION : "0",
								HCP_TOTAL_NEGOTIATION_PERCENT: totalNegociationPercent,
								HCP_TOTAL_CROP_TRACK: totalProduction.toString(),
								HCP_TOTAL: totalAvailable.toString(),
								HCP_TEXT: "",
								HCP_PERIOD: that.getWeek() + new Date().getFullYear(),
								HCP_CAPACITY_TYPE: "0",
								HCP_PLATAFORM: bIsMobile ? '1' : '2',
								HCP_CREATED_BY: that.userName,
								HCP_UPDATED_BY: that.userName,
								HCP_UPDATED_AT: that._formatDate(new Date()),
								HCP_CREATED_AT: that._formatDate(new Date())
							};
	
							oModel.createEntry("/Commercialization", {
								properties: aDataCommercialization
							}, {
								groupId: "changes"
							});
	
							if ((bIsMobile && navigator.connection.type !== "none")) {
								oModel.submitChanges({
									groupId: "changes",
									success: function () {
										that.flushStore("Commercialization").then(function () {
											that.refreshStore("Commercialization").then(function () {}.bind(that));
										}.bind(that));
									}.bind(that)
								});
							} else {
								oModel.submitChanges({groupId: "changes"});
							}
						})
					}
				})
			})
		},
		
		prepareDataBtCrops2: function (oCrops) {
			let oCompareCrops = {
				HCP_TOTAL_PRODUCTION: 0,
				HCP_CAPACITY_PERCENT: 0
			};

			let calcTotalCommercialization = Number(0);

			for (let m = 0; m < oCrops.length; m++) {
				calcTotalCommercialization = parseFloat(calcTotalCommercialization) + Number(oCrops[m].HCP_CAPACITY_TONNE)
				oCompareCrops.HCP_TOTAL_PRODUCTION = Number(oCompareCrops.HCP_TOTAL_PRODUCTION) + Number(oCrops[m].HCP_TOTAL_CROP_TRACK);
			}
			
			oCompareCrops.HCP_CAPACITY_PERCENT = ((Number(calcTotalCommercialization) / Number(oCompareCrops.HCP_TOTAL_PRODUCTION)) * 100); //%
			return oCompareCrops;
		},
		
		getCentralRegion: function (oData) {
			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var regio = oData.HCP_REGIO.split("-");
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_BEZEI',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.estado
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_ACTIVE',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: '1'
				}));

				oModel.read("/Regions", {
					filters: aFilters,
					success: function (result) {
						var oRegio = result.results;
						if (oRegio.length > 0) {

							var aCropFilters = [];

							aCropFilters.push(new sap.ui.model.Filter({
								path: 'HCP_CROP',
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oData.HCP_CROP_ID ? oData.HCP_CROP_ID : oData.HCP_CROP
							}));

							aCropFilters.push(new sap.ui.model.Filter({
								path: 'HCP_STATE',
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oData.HCP_STATE
							}));

							aCropFilters.push(new sap.ui.model.Filter({
								path: 'HCP_MATERIAL',
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oData.HCP_MATERIAL
							}));

							aCropFilters.push(new sap.ui.model.Filter({
								path: 'HCP_REGIO',
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oRegio[0].HCP_ID
							}));

							oModel.read("/Commercialization", {
								filters: aCropFilters,
								sorters: [new sap.ui.model.Sorter({
									path: "HCP_CREATED_AT",
									descending: true
								})],
								success: function (result) {
									var oCrop = result.results;
									if (oCrop.length > 0) {
										resolve(oCrop[0]);
									} else if (oRegio[0].HCP_BEZEI != regio[1]) {
										resolve(oRegio[0]);
									} else {
										resolve();
									}
								}.bind(this),
								error: function (err) {
									sap.m.MessageToast.show("Falha ao Buscar Comercialização.");
									reject(err);
								}
							});
						}
					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Regiões.");
						reject(err);
					}
				});

			}.bind(this));
		},
		
		checkCentralRegion: function (oData, regioID) {
			return new Promise(function (resolve, reject) {
				let oModel = this.getView().getModel();
				let state = oData.HCP_STATE.split("-");
				
				let aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_CROP',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_CROP_ID ? oData.HCP_CROP_ID : oData.HCP_CROP
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_STATE',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: state[0]
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_MATERIAL',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_MATERIAL
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_REGIO',
					operator: sap.ui.model.FilterOperator.NE,
					value1: regioID
				}));

				oModel.read("/Commercialization", {
					sorters: [new sap.ui.model.Sorter({
						path: "HCP_CREATED_AT",
						descending: true
					})],
					filters: aFilters,
					success: function (result) {
						let oCrops = result.results;
						let oCropsResult = [];
						if (oCrops.length > 0) {

							let aCropData = [];
							
							const map = new Map();
							for (const item of oCrops) {
								if (!map.has(item.HCP_REGIO)) {
									map.set(item.HCP_REGIO, true); // set any value to Map
									oCropsResult.push(item);
								}
							}

							for (var crop in oCropsResult) {
								if (oData.HCP_REGIO == oCropsResult[crop].HCP_REGIO) {
									oCropsResult[crop] = oCropsResult[crop];
								}
							}

							oCrops = oCropsResult;
							
							let oCompareCrops = this.prepareDataBtCrops2(oCrops);

							aCropData = {
								HCP_TOTAL_PRODUCTION: parseFloat(oCompareCrops.HCP_TOTAL_PRODUCTION).toFixed(2),
								HCP_CAPACITY_PERCENT: parseFloat(oCompareCrops.HCP_CAPACITY_PERCENT).toFixed(2),
							};

							resolve(aCropData);
						}
					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Acompanhamentos.");
						reject(err);
					}
				});

			}.bind(this));

		},
		
		getNegotiationReport: function (props) {
			return new Promise(function (resolve, reject) {
				var oModel = this.getView().getModel();

				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_CROP',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: props.HCP_CROP
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_STATE',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: props.HCP_STATE.split("-")[0]
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_MATERIAL',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: props.HCP_MATERIAL
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_REGIO',
					operator: sap.ui.model.FilterOperator.NE,
					value1: props.HCP_REGIO.split("-")[0]
				}));

				oModel.read("/Negotiation_Report", {
					filters: aFilters,
					success: function (result) {
						var negociation = result.results;
						if (negociation.length > 0) {
							resolve(negociation[0]);
						} else {
							resolve();
						}
					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Relato de Negociação.");
						reject(err);
					}
				});

			}.bind(this));
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
		refreshStore: function (entity) {
			return new Promise(function (resolve, reject) {
				if (typeof sap.hybrid !== 'undefined') {
					// this.setBusyDialog("App Grãos", "Atualizando banco de dados");
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
			oRouter.navTo("commercialization.Index", true);
		},
		buildEntityPath: function (sEntityName, oEntity) {
			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity.HCP_COMMERC_ID + "l)";
			}
		},
		_onCancel: function (oEvent) {
			this.setBusyDialog("App Grãos", "Aguarde");
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			var oEditModel = this.getView().getModel("editCommercializationModel");
			var oData = oEditModel.getProperty("/");

			if (oData.enableCreate) {
				MessageBox.warning(
					"Tem certeza que deseja voltar? As informações editadas não serão salvas", {
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
			} else {
				this.navBack();
				this.closeBusyDialog();
			}

		},

		getCropTracking: function (aKeyData) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getOwnerComponent().getModel();
				var oEditModel = this.getView().getModel("editCommercializationModel");
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_CROP',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: aKeyData.HCP_CROP
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_STATE',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: this.state[0]
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_REGIO',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: this.regio[0]
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_MATERIAL',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: this.material[0]
				}));

				oModel.read("/Crop_Tracking", {
					urlParameters: {
						"$expand": "Crop_Track_Partner",
						"$top": 2
					},
					filters: aFilters,
					sorters: [new sap.ui.model.Sorter({
						path: "HCP_CREATED_AT",
						descending: true
					})],
					success: function (result) {

						if (result.results.length > 0) {
							oEditModel.setProperty("/noExistsCropTrack", false);
						} else {
							oEditModel.setProperty("/noExistsCropTrack", true);
						}

						resolve();

					}.bind(this),
					error: function () {
						reject();
					}
				});

			}.bind(this));

		},

		_valideInputQuantidade: function (oEvent) {

			var oSource = oEvent.getSource();
			var sValue;

			sValue = oEvent.mParameters.newValue;
			sValue = sValue.replace(/[^0-9,]/g, "");

			if (!sValue) {
				sValue = 0;
			}

			if (sValue > 0) {
				oSource.setValueState("None");
				oSource.setValueStateText("");
			} else {
				oSource.setValueState("Error");
				oSource.setValueStateText(this.resourceBundle.getText("messageErrorProdTotal"));
				
			}

			oSource.setValue(sValue);

		},

		onConfirmProdTotal: function (oEvent) {

			var oModelCommercialization = this.getView().getModel("editCommercializationModel");
			var oDataCommercialization = oModelCommercialization.getData();

			var oModelAdd = this.getView().getModel("addProdTotalModel");
			var oDataAdd = oModelAdd.getData();

			oModelCommercialization.setProperty("/HCP_TOTAL_CROP_TRACK", oDataAdd.HCP_TOTAL_CROP_TRACK_CLONE);

			if (!oDataCommercialization.HCP_CAPACITY_PERCENT_CLONE) {
				oModelCommercialization.setProperty("/HCP_CAPACITY_PERCENT_CLONE", 0);
			}

			if (!oDataCommercialization.HCP_CAPACITY_TONNE_CLONE) {
				oModelCommercialization.setProperty("/HCP_CAPACITY_TONNE_CLONE", 0);
			}

			oModelCommercialization.setProperty("/enableCreate", true);
			this.onConfirm(oEvent);
		}

	});
});