sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, JSONModel, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.commercialization.Create", {
		formatter: formatter,
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("commercialization.Create").attachPatternMatched(this.handleRouteMatched, this);
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
				isCentralRegion: true,
				HCP_CAPACITY_TYPE: 0,
				enableCreate: false,
				dataWeek: this.getWeek(),
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
			}), "createCommercializationModel");

			if (oEvent.getParameter("arguments")) {
				var oModel = this.getView().getModel();
				this.oData = oModel.getProperty(decodeURIComponent(oEvent.getParameter("arguments").keyData));
				var aKeyData = JSON.parse(decodeURIComponent(oEvent.getParameter("arguments").keyData));
				this._findCropTracking(aKeyData, oModel);
				this._findNegotiation(aKeyData, oModel);
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

		_findCropTracking: function (aKeyData, oModel) {

			//var oModelWeek = new sap.ui.model.json.JSONModel({});
			var oModelWeek = this.getView().getModel("createCommercializationModel");
			this.regio = aKeyData.HCP_REGIO.split("-");
			this.material = aKeyData.HCP_MATERIAL.split("-");
			this.state = aKeyData.HCP_STATE.split("-");

			oModelWeek.setProperty("/estado", this.state[1]);
			oModelWeek.setProperty("/regiao", this.regio[1]);
			oModelWeek.setProperty("/material", this.material[1]);

			oModelWeek.setProperty("/HCP_CROP", aKeyData.HCP_CROP);
			oModelWeek.setProperty("/HCP_STATE", this.state[0]);
			oModelWeek.setProperty("/HCP_REGIO", this.regio[0]);
			oModelWeek.setProperty("/HCP_MATERIAL", this.material[0]);

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

			var self = this;
			var aCommercFilter = [];

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
					var oFilterModel = this.getView().getModel("createCommercializationModel");

					for (var m = 0; m < result.results.length; m++) {

						if (m === 0) {
							oFilterModel.setProperty("/HCP_CROP_TRACK_ID", result.results[0].HCP_CROP_TRACK_ID);
							//oFilterModel.setProperty("/dataWeek", result.results[m].HCP_PERIOD.slice(0, 2));
							oFilterModel.setProperty("/HCP_TOTAL_CROP_TRACK", result.results[m].HCP_TOTAL_PRODUCTION);

						}

					}

					if (result.results.length > 0) {
						oFilterModel.setProperty("/noExistsCropTrack", false);
						if (oModelWeek.oData.estado == oModelWeek.oData.regiao)
							oModelWeek.setProperty("/visibleCentralRegion", false)
						else
							oModelWeek.setProperty("/visibleCentralRegion", true)
					} else {
						oFilterModel.setProperty("/noExistsCropTrack", true);
					}

					this.getView().setModel(oModelWeek, "modelFilter");

					oModel.read("/Commercialization", {
						filters: aFilters,
						sorters: [new sap.ui.model.Sorter({
							path: "HCP_CREATED_AT",
							descending: false
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
								oFilterModel.setProperty("/HCP_CAPACITY_PERCENT", parseFloat((calcPercent * 100).toFixed(2)));
								oFilterModel.setProperty("/HCP_TOTAL", totalCropTrack - resultCommerc.results[key].HCP_CAPACITY_TONNE);

								var calcPercentNegotiations = totalNegotiationReport ? totalNegotiationReport : "0"  / totalCropTrack;
								oFilterModel.setProperty("/HCP_TOTAL_NEGOTIATION_PERCENT", parseFloat((calcPercentNegotiations * 100).toFixed(2)));

								if (oFilterModel.getProperty("/HCP_TOTAL_NEGOTIATION_PERCENT") > 100) {
									oFilterModel.setProperty("/dataValueState", "Error");
								} else {
									oFilterModel.setProperty("/dataValueState", "Success");
								}

								oFilterModel.setProperty("/hasLastWeek", true);
								// oFilterModel.setProperty("/enableCreate", true);
							} else {
								oFilterModel.setProperty("/dataLastWeek", "(N/A)");
								oFilterModel.setProperty("/HCP_TOTAL", oFilterModel.getProperty("/HCP_TOTAL_CROP_TRACK"));
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

		},

		_findNegotiation: function (aKeyData, oModel) {

			var oModelWeek = new sap.ui.model.json.JSONModel({});
			this.regio = aKeyData.HCP_REGIO.split("-");
			oModelWeek.setProperty("/estado", aKeyData.HCP_STATE);
			oModelWeek.setProperty("/regiao", this.regio[1]);
			this.material = aKeyData.HCP_MATERIAL.split("-");
			this.state = aKeyData.HCP_STATE.split("-");

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

			oModel.read("/Negotiation_Report", {
				filters: aFilters,
				sorters: [new sap.ui.model.Sorter({
					path: "HCP_CREATED_AT",
					descending: true
				})],
				success: function (result) {
					this.closeBusyDialog();
					var totalNegotiaton = parseInt(0);
					var oFilterModel = this.getView().getModel("createCommercializationModel");

					if (result.results.length > 0) {
						oFilterModel.setProperty("/HCP_NEGO_REPORT_ID", result.results[0].HCP_NEGO_REPORT_ID);

						for (var m = 0; m < result.results.length; m++) {
							if (result.results[m].HCP_STATUS != 1) {
								totalNegotiaton = parseInt(totalNegotiaton) + parseInt(result.results[m].HCP_TONNAGE);
								this.getView().setModel(oModelWeek, "modelReport");
								oFilterModel.setProperty("/HCP_TOTAL_NEGOTIATION", totalNegotiaton);
							}
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

			var oModelWeek = this.getView().getModel("createCommercializationModel");
			var oData = oModelWeek.getProperty("/");
			var oSource = oEvent.getSource();

			if (oSource.getId().includes('idPercent') == false) {

				oModelWeek.setProperty("/HCP_CAPACITY_PERCENT_CLONE", parseFloat(parseFloat(oData.HCP_CAPACITY_PERCENT).toFixed(2)));
				oModelWeek.setProperty("/HCP_CAPACITY_TONNE_CLONE", parseFloat(parseFloat(oData.HCP_CAPACITY_TONNE).toFixed(2)));

				if (!this._FragmentFilter) {
					this._FragmentFilter = sap.ui.xmlfragment("addComID" + this.getView().getId(),
						"com.sap.build.standard.brfAppDeGraosModoEditar.view.commercialization.fragments.AddCom",
						this);
					this.getView().addDependent(this._FragmentFilter);
				}
				this._FragmentFilter.open();

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

			var ocCreateCommercializationModel = this.getView().getModel("createCommercializationModel");
			var oData = ocCreateCommercializationModel.oData;

			if (oData.HCP_CAPACITY_TYPE == 0) {
				ocCreateCommercializationModel.setProperty("/enableTonelada", true);
				ocCreateCommercializationModel.setProperty("/enablePorcentagem", false);
			} else {
				ocCreateCommercializationModel.setProperty("/enableTonelada", false);
				ocCreateCommercializationModel.setProperty("/enablePorcentagem", true);
			}

		},
		onCancelDialogPressed: function (oEvent) {

			oEvent.getSource().getParent().close();
		},
		onConfirm: function (oEvent) {
			//CALCULATE COMMERCIALIZATION
			var ocCreateCommercializationModel = this.getView().getModel("createCommercializationModel");

			var oData = ocCreateCommercializationModel.oData;
			oData.HCP_CAPACITY_PERCENT = oData.HCP_CAPACITY_PERCENT_CLONE;
			oData.HCP_CAPACITY_TONNE = oData.HCP_CAPACITY_TONNE_CLONE;

			//Verifica se o valor selecionado é tonelada ou porcentagem 
			if (oData["enableTonelada"]) {

				if (oData.HCP_CAPACITY_TONNE < 0) {
					MessageBox.warning(
						"Valor comercializado deve ser maior que 0.", {
							actions: [sap.m.MessageBox.Action.OK]
						}
					);
					ocCreateCommercializationModel.setProperty("/HCP_CAPACITY_TONNE", 0);
				} else if (oData.HCP_CAPACITY_TONNE > oData.HCP_TOTAL_CROP_TRACK) {
					MessageBox.warning(
						"Valor comercializado deve ser menor que a produção total.", {
							actions: [sap.m.MessageBox.Action.OK]
						}
					);
					ocCreateCommercializationModel.setProperty("/HCP_CAPACITY_TONNE", 0);
				}

				ocCreateCommercializationModel.setProperty("/enablePorcentagem", false);
				var calc = oData["HCP_TOTAL_CROP_TRACK"] - oData["HCP_CAPACITY_TONNE"];
				ocCreateCommercializationModel.setProperty("/HCP_TOTAL", calc.toFixed());
				var calcPercent = oData["HCP_CAPACITY_TONNE"] / oData["HCP_TOTAL_CROP_TRACK"];
				ocCreateCommercializationModel.setProperty("/HCP_CAPACITY_PERCENT", parseFloat((calcPercent * 100).toFixed(2)));

				//CALCULATE NEGOTIATION
				var calcPercentNegotiation = oData["HCP_TOTAL_NEGOTIATION"] ? oData["HCP_TOTAL_NEGOTIATION"] : "0" / oData["HCP_TOTAL_CROP_TRACK"];
				if (Math.round(calcPercentNegotiation * 100) > 100) {
					ocCreateCommercializationModel.setProperty("/dataValueState", "Error");
				} else {
					ocCreateCommercializationModel.setProperty("/dataValueState", "Success");
				}
				ocCreateCommercializationModel.setProperty("/HCP_TOTAL_NEGOTIATION_PERCENT", parseFloat((calcPercentNegotiation * 100).toFixed(2)));

			} else {

				ocCreateCommercializationModel.setProperty("/enableTonelada", false);
				var percent = parseFloat((oData["HCP_CAPACITY_PERCENT"] / 100).toFixed(2));
				var calc = oData["HCP_TOTAL_CROP_TRACK"] * percent;
				ocCreateCommercializationModel.setProperty("/HCP_TOTAL", (oData["HCP_TOTAL_CROP_TRACK"] - calc).toFixed());
				ocCreateCommercializationModel.setProperty("/HCP_CAPACITY_PERCENT", parseFloat(oData["HCP_CAPACITY_PERCENT"].toFixed(2)));
				ocCreateCommercializationModel.setProperty("/HCP_CAPACITY_TONNE", parseInt(calc.toFixed(2)));

				//CALCULATE NEGOTIATION
				var calcPercentNegotiations = oData["HCP_TOTAL_NEGOTIATION"] ? oData["HCP_TOTAL_NEGOTIATION"] : "0" / oData["HCP_TOTAL_CROP_TRACK"];
				if (Math.round(calcPercentNegotiations * 100) > 100) {
					ocCreateCommercializationModel.setProperty("/dataValueState", "Error");
				} else {
					ocCreateCommercializationModel.setProperty("/dataValueState", "Success");
				}
				ocCreateCommercializationModel.setProperty("/HCP_TOTAL_NEGOTIATION_PERCENT", parseFloat((calcPercentNegotiations * 100).toFixed(2)));

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
				var oFilterModel = this.getView().getModel("createCommercializationModel");

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

			var oMainDataForm = sap.ui.core.Fragment.byId("addComID" + this.getView().getId(), "commercializationKeysForm").getContent();
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
			//createCommercializationModel>/HCP_CAPACITY_PERCENT
			//createCommercializationModel>/HCP_CAPACITY_TONNE

		},
		_onButtonSave: function () {
			//var oFilterModel = this.getView().getModel("createCommercializationModel");
			//oFilterModel.oData["HCP_CROP_TRACK_ID"] = this.cropId;
			//console.log(oFilterModel.oData);
		},
		_onSave: function (oEvent) {
			var sTimestamp = new Date().getTime();
			var oModel = this.getView().getModel();
			var oCreateModel = this.getView().getModel("createCommercializationModel");
			var oData = oCreateModel.getProperty("/");
			var sPeriod = this.getWeek() + new Date().getFullYear();
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			var aData = {
				HCP_COMMERC_ID: sTimestamp.toFixed(),
				HCP_CROP: oData.HCP_CROP,
				HCP_STATE: oData.HCP_STATE,
				HCP_REGIO: oData.HCP_REGIO,
				HCP_MATERIAL: oData.HCP_MATERIAL,
				HCP_CAPACITY_TONNE: parseFloat(oData.HCP_CAPACITY_TONNE).toFixed(2),
				HCP_CAPACITY_PERCENT: parseFloat(oData.HCP_CAPACITY_PERCENT).toFixed(2),
				HCP_NEGO_REPORT_ID: parseInt(oData.HCP_NEGO_REPORT_ID).toFixed(),
				HCP_TOTAL_NEGOTIATION: parseFloat(oData.HCP_TOTAL_NEGOTIATION).toFixed(),
				HCP_TOTAL_NEGOTIATION_PERCENT: parseFloat(oData.HCP_TOTAL_NEGOTIATION_PERCENT).toFixed(2),
				HCP_TOTAL_CROP_TRACK: parseInt(oData.HCP_TOTAL_CROP_TRACK).toFixed(),
				HCP_TOTAL: parseFloat(oData.HCP_TOTAL).toFixed(),
				HCP_TEXT: oData.HCP_TEXT,
				HCP_PERIOD: sPeriod,
				HCP_CAPACITY_TYPE: oData.HCP_CAPACITY_TYPE.toString(),
				HCP_PLATAFORM: bIsMobile ? '1' : '2',
				HCP_CREATED_BY: this.userName,
				HCP_UPDATED_BY: this.userName,
				HCP_UPDATED_AT: this._formatDate(new Date()),
				HCP_CREATED_AT: this._formatDate(new Date())
			};

			this.setBusyDialog("Comercialização", "Salvando, aguarde");
			oModel.createEntry("/Commercialization", {
				properties: aData,
				success: function (oCreatedCommerc) {
					this._onUpsertCentralRegioCommercialization(oData).then(function () {
						if ((bIsMobile && navigator.connection.type !== "none")) {
							this.flushStore("Commercialization").then(function () {
								this.refreshStore("Commercialization").then(function () {
									MessageBox.success(
										"Commercialização cadastrada com sucesso!", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.closeBusyDialog();
												this.navBack();
											}.bind(this)
										}
									);
								}.bind(this));
							}.bind(this));
						} else {
							MessageBox.success(
								"Comercialização cadastrada com sucesso!", {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										this.closeBusyDialog();
										this.navBack();
									}.bind(this)
								}
							);
						}
					}.bind(this))
				}.bind(this),
				error: function () {
					MessageBox.error(
						"Erro ao criar Comercialização.", {
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (sAction) {
								this.closeBusyDialog();
							}.bind(this)
						}
					);
				}.bind(this)
			});

			oModel.submitChanges();
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
							let capacityTonne = (percentCommercialized / 100) * oData.HCP_TOTAL_CROP_TRACK
							let totalAvailable = oData.HCP_TOTAL_CROP_TRACK - capacityTonne
							
							percentCommercialized = parseFloat(percentCommercialized).toFixed(2)
							capacityTonne = that.roundingRule(capacityTonne)
							totalAvailable = that.roundingRule(totalAvailable)
							let totalProduction = that.roundingRule(oData.HCP_TOTAL_CROP_TRACK)
							
							let totalNegociationPercent = "0.00";
	
							if (result.HCP_TOTAL_NEGOTIATION) {
								let calcPercentNegotiation = parseFloat(result.HCP_TOTAL_NEGOTIATION ? result.HCP_TOTAL_NEGOTIATION : "0") / oData.HCP_TOTAL_CROP_TRACK;
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
		_onCancel: function (oEvent) {
			this.setBusyDialog("App Grãos", "Aguarde");
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			var oEditModel = this.getView().getModel("createCommercializationModel");
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

			var oModelCommercialization = this.getView().getModel("createCommercializationModel");
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

			this.onConfirm(oEvent);
		}

	});
});