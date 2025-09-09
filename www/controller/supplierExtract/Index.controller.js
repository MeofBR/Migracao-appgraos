sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History"
], function (MainController, MessageBox, JSONModel, History) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.supplierExtract.Index", {

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("supplierExtract.Index").attachPatternMatched(this.handleRouteMatched, this);
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		handleRouteMatched: function (oEvent) {
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "indexModel");

			this.setBusyDialog("App Grãos", "Buscando informações, aguarde...");

			var oIndexModel = this.getView().getModel("indexModel");

			var arrayCollection = {
				"TileCollection": []
			};

			if (oEvent.getParameter("arguments")) {
				this.start_date = decodeURIComponent(oEvent.getParameter("arguments").start_date);
				this.end_date = decodeURIComponent(oEvent.getParameter("arguments").end_date);
				this.state = decodeURIComponent(oEvent.getParameter("arguments").state);

				var newDate = new Date();
				var timezone = newDate.getTimezoneOffset() * 60 * 1000;

				var start_date = this.formatterDate(new Date(this.start_date));
				var end_date = this.formatterDate(new Date(this.end_date));

				oIndexModel.setProperty("/start_date", start_date);
				oIndexModel.setProperty("/end_date", end_date);

				this.start_date = new Date(new Date(this.start_date).setHours(0, 0, 0));
				this.start_date = this.start_date.setTime(this.start_date.getTime() - timezone);

				this.end_date = new Date(new Date(this.end_date).setHours(23, 59, 59));
				this.end_date = this.end_date.setTime(this.end_date.getTime() - timezone);

				this.supplierID = decodeURIComponent(oEvent.getParameter("arguments").supplier);
				this.supplierName = decodeURIComponent(oEvent.getParameter("arguments").supplierName);
				oIndexModel.setProperty("/supplierID", this.supplierID);
				oIndexModel.setProperty("/supplierName", this.supplierName);

				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;

				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
					oIndexModel.setProperty("/isMobile", true);
				} else {
					oIndexModel.setProperty("/isMobile", false);
				}

			}

			//this.cropTrakingResult = 0;
			this.intentionResult = 0;
			this.appointmentsResult = 0;
			this.visitFormResult = 0;
			this.offerMapResult = 0;
			this.commoditiesResult = 0;
			this.commoditiesVolume = 0;
			this.certificationsResult = 0;
			this.totalVolumeOfferMap = 0;
			this.offerMapVolume = 0;
			this.percentageOfferMap = 0;

			//this.oCropTraking = [];
			this.oIntention = [];
			this.oAppointments = [];
			this.oAppointmentsOpened = [];
			this.oAppointmentsClosed = [];
			this.oAppointmentsCanceled = [];

			this.oVisitFormYearly = [];
			this.oVisitFormGrains = [];
			this.oVisitFormIndustry = [];
			this.oVisitFormPeriodic = [];
			this.oVisitForms = [];
			this.oOfferMap = [];
			this.oCommodities = [];
			this.oCommoditiesFixed = [];
			this.oCertifications = [];
			this.allSuppliers = [];

			this.verifyViewSuppliers(this.supplierID).then(function (aSuppliersLIFNR) {

				var aPromises = [];

				for (var supplier of aSuppliersLIFNR) {

					this.allSuppliers.push(supplier.LIFNR);

					aPromises.push(new Promise(function (resolve, reject) {
						this.callCalculateFunction(supplier).then(function () {
							resolve();
						}.bind(this)).catch(function (error) {
							console.log(error);
							reject();
						}.bind(this));
					}.bind(this)));
				}

				Promise.all(aPromises).then(data => {
					//var aCropTraking = this.createTileCollection("sap-icon://e-care", this.cropTrakingResult, this.cropTrakingResult == 1 ?
					//	"Registro" : "Registros", "Acompanhamento de Lavoura", "Nº Acompanhamentos");
					if (this.oOfferMap.length > 0) {
						for (var item of this.oOfferMap[0]) {
							this.offerMapVolume = parseFloat(this.offerMapVolume) + parseFloat(item.HCP_VOLUME);
						}
					}

					this.oVisitForms.push(this.oVisitFormYearly);
					this.oVisitForms.push(this.oVisitFormGrains);
					this.oVisitForms.push(this.oVisitFormIndustry);
					this.oVisitForms.push(this.oVisitFormPeriodic);

					this.oAppointments.push(this.oAppointmentsOpened);
					this.oAppointments.push(this.oAppointmentsClosed);
					this.oAppointments.push(this.oAppointmentsCanceled);

					this.getVolumeOfferMap(this.oOfferMap).then(function (result) {

						if (result == 0) {
							this.percentageOfferMap = result;
						} else {
							this.percentageOfferMap = (result / this.offerMapVolume) * 100;
						}

						var aIntention = this.createTileCollection("sap-icon://opportunities", this.intentionResult, this.intentionResult == 1 ?
							"Registro" : "Registros", "Intenção de Preço", "Nº Intenções");

						var aAppointments = this.createTileCollection("sap-icon://date-time", this.appointmentsResult, this.appointmentsResult ==
							1 ?
							"Registro" :
							"Registros", "Agendamentos", "Nº de Visitas");

						var aVisitForms = this.createTileCollection("sap-icon://payment-approval", this.visitFormResult, this.visitFormResult == 1 ?
							"Registro" : "Registros", "Fichas de Visitas", "Nº de Fichas");

						var aOfferMap = this.createTileCollection("sap-icon://e-care", this.offerMapResult, this.offerMapResult == 1 ? "Registro" :
							"Registros", "Ofertas", "Nº de Ofertas");

						var aCommodities = this.createTileCollection("sap-icon://expense-report", this.commoditiesResult, this.commoditiesResult ==
							1 ?
							"Registro" : "Registros", "Compras", "Nº de Compras");

						var aCommoditiesVolume = this.createTileCollection("sap-icon://expense-report", this.commoditiesVolume, "Volume",
							"Compras",
							"Volume de Compras");

						var aCertifications = this.createTileCollection("sap-icon://e-learning", this.certificationsResult, this.certificationsResult ==
							1 ?
							"Registro" : "Registros", "Histórico de Certificações", "Quantidade Ano Vigente");

						oIndexModel.setProperty("/visitFormResult", this.visitFormResult);
						oIndexModel.setProperty("/intentionResult", this.intentionResult);
						oIndexModel.setProperty("/appointmentsResult", this.appointmentsResult);
						oIndexModel.setProperty("/offerMapResult", this.offerMapVolume);
						oIndexModel.setProperty("/percentageOfferMap", (this.percentageOfferMap).toFixed(2));

						//arrayCollection["TileCollection"].push(aCropTraking);
						arrayCollection["TileCollection"].push(aIntention);
						arrayCollection["TileCollection"].push(aAppointments);
						arrayCollection["TileCollection"].push(aVisitForms);
						arrayCollection["TileCollection"].push(aOfferMap);
						arrayCollection["TileCollection"].push(aCommodities);
						arrayCollection["TileCollection"].push(aCommoditiesVolume);
						arrayCollection["TileCollection"].push(aCertifications);

						var oModelJson = new JSONModel(arrayCollection);
						this.getView().setModel(oModelJson, "supplierExtract");
						this.closeBusyDialog();

					}.bind(this)).catch(function (error) {
						console.log(error);
					}.bind(this));

				}).catch(error => {
					console.log(error);
				});

			}.bind(this)).catch(function (error) {
				console.log(error);
			}.bind(this));

			//	var oModelJson = new JSONModel(arrayTest);
			//	this.getView().setModel(oModelJson, "teste");

		},

		filterButtonPressed: function (oEvent) {
			if (!this._FragmentFilter) {
				this._FragmentFilter = sap.ui.xmlfragment(
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.supplierExtract.fragments.FragmentFilter",
					this);

				var oModelFilters = new JSONModel({
					HCP_CREATED_BY: "",
					HCP_NEGO_REPORT_ID: "",
					HCP_CROP: "",
					HCP_STATE: "",
					HCP_START_DATE: "",
					HCP_END_DATE: ""
				});

				this.getView().setModel(oModelFilters, "filters");
				this.getView().addDependent(this._FragmentFilter);

			}

			this._FragmentFilter.openBy(oEvent.getSource());
		},

		_onCreateFormPress: function (oEvent) {

			this.oRouter.navTo("supplierExtract.New", {
				keyData: encodeURIComponent(JSON.stringify([]))
			}, false);

		},
		//	backToIndex: function () {
		//		var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		//		oRouter.navTo("Index", true);
		//	},

		backToIndex: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("supplierExtract.Filter", true);
			}
		},

		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;
			var oIndexModel = this.getView().getModel("indexModel");
			var oData = oIndexModel.oData;
			oIndexModel.setProperty("/start_date", this.start_date);
			oIndexModel.setProperty("/end_date", this.end_date);

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
								masterContext: sMasterContext,
								filters: encodeURIComponent(JSON.stringify(oData))
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName, {
					filters: encodeURIComponent(JSON.stringify(oData))
				}, false);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
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
		_onEditFormPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("supplierExtract.List", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		getCropTrackingData: function (supplierLIFNR) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_SUPPLIER',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: supplierLIFNR
				}));

				aFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
					.BT,
					this.start_date, this.end_date));

				oModel.read("/Crop_Tracking", {
					filters: aFilters,
					sorters: [new sap.ui.model.Sorter({
						path: "HCP_CREATED_AT",
						descending: true
					})],
					success: function (result) {
						var oCrop = result.results;
						var result = [];
						if (oCrop.length > 0) {
							//var novoaArray = [...new Set(oCrop.map(x => x.HCP_CROP_TRACK_ID))];
							var map = new Map();
							for (var item of oCrop) {
								if (!map.has(item.HCP_CROP + item.HCP_STATE + item.HCP_MATERIAL + item.HCP_REGIO)) {
									map.set((item.HCP_CROP + item.HCP_STATE + item.HCP_MATERIAL + item.HCP_REGIO), true);
									// set any value to Map
									result.push({
										HCP_CROP_TRACK_ID: item.HCP_CROP_TRACK_ID,
										HCP_CROP: item.HCP_CROP,
										HCP_STATE: item.HCP_STATE,
										HCP_MATERIAL: item.HCP_MATERIAL,
										HCP_REGIO: item.HCP_REGIO
									});
								}
							}

						}

						this.cropTrakingResult = this.cropTrakingResult + result.length;

						resolve();
					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Acompanhamentos.");
						reject(err);
					}
				});
			}.bind(this));
		},
		getIntentionData: function (supplierLIFNR) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var aFilters = [];
				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;
				var oView = this.getView();

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_PROVIDER',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: supplierLIFNR
				}));

				aFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
					.BT,
					this.start_date, this.end_date));

				oModel.read("/Price_Intention", {
					filters: aFilters,
					sorters: [new sap.ui.model.Sorter({
						path: "HCP_CREATED_AT",
						descending: true
					})],
					urlParameters: {
						"$expand": "View_Intention_Material_Type,View_Intention_Suppliers"
					},
					success: function (result) {
						var oIntentionPrice = result.results;
						if (oIntentionPrice.length > 0) {
							var novoaArray = [...new Set(oIntentionPrice.map(x => x.HCP_CROP_TRACK_ID))];

							/*
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
														*/

							this.oIntention.push(oIntentionPrice);
						}

						this.intentionResult = this.intentionResult + oIntentionPrice.length;

						resolve();
					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Intenções de Preço.");
						reject(err);
					}
				});
			}.bind(this));
		},
		getIScheduleData: function (supplierLIFNR) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_NAME',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: supplierLIFNR
				}));

				aFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
					.BT,
					this.start_date, this.end_date));

				oModel.read("/Appointments", {
					filters: aFilters,
					sorters: [new sap.ui.model.Sorter({
						path: "HCP_CREATED_AT",
						descending: true
					})],
					success: function (result) {
						var oAppointments = result.results;
						if (oAppointments.length > 0) {
							var novoaArray = [...new Set(oAppointments.map(x => x.HCP_CROP_TRACK_ID))];

							var aPromises = [];

							for (var item of oAppointments) {

								aPromises.push(new Promise(function (resolve1, rejec1t1) {
									this.getAppointmentsCheck(item).then(function (aAppointmentsCheck) {

										switch (aAppointmentsCheck.type) {
										case "Opened":
											this.oAppointmentsOpened.push(aAppointmentsCheck);
											this.appointmentsResult = this.appointmentsResult + 1;
											break;
										case "Closed":
											this.oAppointmentsClosed.push(aAppointmentsCheck);
											this.appointmentsResult = this.appointmentsResult + 1;
											break;
										case "Canceled":
											this.oAppointmentsCanceled.push(aAppointmentsCheck);
											this.appointmentsResult = this.appointmentsResult + 1;
											break;
										default:
										}

										resolve1();
									}.bind(this)).catch(function (error) {
										rejec1t1();
									}.bind(this));
								}.bind(this)));
							}

							Promise.all(aPromises).then(data => {
								resolve();
							}).catch(error => {
								reject();
							});
						}

						resolve();
					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Acompanhamentos.");
						reject(err);
					}
				});
			}.bind(this));
		},
		getVisitFormsData: function (supplierLIFNR) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_PROVIDER_ID',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: supplierLIFNR
				}));

				aFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
					.BT,
					this.start_date, this.end_date));

				var resultYearly = [];
				var resultGrains = [];
				var resultIndustry = [];
				var resultPeriodic = [];

				oModel.read("/Visit_Form_Yearly", {
					filters: aFilters,
					sorters: [new sap.ui.model.Sorter({
						path: "HCP_CREATED_AT",
						descending: true
					})],
					urlParameters: {
						"$expand": "Visit_Form_Partner_Yearly,Visit_Form_Prospect_Yearly"
					},
					success: function (result) {
						var oVisitYearly = result.results;
						if (oVisitYearly.length > 0) {
							resultYearly = [...new Set(oVisitYearly.map(x => x.HCP_PROVIDER_ID))];
							//	oVisitYearly[0].type = "Yearly";
							for (var oYearly of oVisitYearly) {
								this.oVisitFormYearly.push(oYearly);
							}

						}

						this.visitFormResult = this.visitFormResult + oVisitYearly.length;

						oModel.read("/Visit_Form_Grains", {
							filters: aFilters,
							sorters: [new sap.ui.model.Sorter({
								path: "HCP_CREATED_AT",
								descending: true
							})],

							urlParameters: {
								"$expand": "Visit_Form_Partner_Grains,Visit_Form_Prospect_Grains"
							},
							success: function (result) {
								var oVisitGrains = result.results;
								if (oVisitGrains.length > 0) {
									resultGrains = [...new Set(oVisitGrains.map(x => x.HCP_PROVIDER_ID))];

									for (var oGrais of oVisitGrains) {
										this.oVisitFormGrains.push(oGrais);
									}

									this.visitFormResult = this.visitFormResult + oVisitGrains.length;
								}

								oModel.read("/Visit_Form_Industry", {
									filters: aFilters,
									sorters: [new sap.ui.model.Sorter({
										path: "HCP_CREATED_AT",
										descending: true
									})],
									urlParameters: {
										"$expand": "Visit_Form_Partner_Industry,Visit_Form_Prospect_Industry"
									},
									success: function (result) {
										var oVisitIndustry = result.results;

										if (oVisitIndustry.length > 0) {
											resultIndustry = [...new Set(oVisitIndustry.map(x => x.HCP_PROVIDER_ID))];
											//oVisitIndustry[0].type = "Industry";

											for (var oIndustry of oVisitIndustry) {
												this.oVisitFormIndustry.push(oIndustry);
											}
											this.visitFormResult = this.visitFormResult + oVisitIndustry.length;
										}

										oModel.read("/Visit_Form_Periodic", {
											filters: aFilters,
											sorters: [new sap.ui.model.Sorter({
												path: "HCP_CREATED_AT",
												descending: true
											})],
											urlParameters: {
												"$expand": "Visit_Form_Partner_Periodic,Visit_Form_Prospect_Periodic"
											},
											success: function (result) {
												var oVisitPeriodic = result.results;

												if (oVisitPeriodic.length > 0) {
													resultPeriodic = [...new Set(oVisitPeriodic.map(x => x.HCP_PROVIDER_ID))];
													//oVisitPeriodic[0].type = "Periodic";

													for (var oPeriodic of oVisitPeriodic) {
														this.oVisitFormPeriodic.push(oPeriodic);
													}

													this.visitFormResult = this.visitFormResult + oVisitPeriodic.length;

												}

												resolve();

											}.bind(this),
											error: function (err) {
												sap.m.MessageToast.show("Falha ao Buscar Ficha de Visitas Periodica.");
												reject(err);
											}
										});

									}.bind(this),
									error: function (err) {
										sap.m.MessageToast.show("Falha ao Buscar Ficha de Visitas Industria.");
										reject(err);
									}
								});

							}.bind(this),
							error: function (err) {
								sap.m.MessageToast.show("Falha ao Buscar Ficha de Visitas Grãos.");
								reject(err);
							}
						});

					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Ficha de Visitas Anual.");
						reject(err);
					}
				});
			}.bind(this));
		},
		getIOfferMapData: function (supplierLIFNR) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_PARTNER',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: supplierLIFNR
				}));

				aFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
					.BT,
					this.start_date, this.end_date));

				oModel.read("/Offer_Map", {
					filters: aFilters,
					sorters: [new sap.ui.model.Sorter({
						path: "HCP_CREATED_AT",
						descending: true
					})],
					urlParameters: {
						"$expand": "Offer_Account_Groups,Offer_Material"
					},
					success: function (result) {
						var oOfferMap = result.results;
						if (oOfferMap.length > 0) {
							var novoaArray = [...new Set(oOfferMap.map(x => x.HCP_CROP_TRACK_ID))];
							this.oOfferMap.push(oOfferMap);
						}

						this.offerMapResult = this.offerMapResult + oOfferMap.length;

						resolve();
					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Ofertas.");
						reject(err);
					}
				});
			}.bind(this));
		},
		getICommoditiesFixedMapData: function (supplierLIFNR) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_LIFNR',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: supplierLIFNR
				}));

				aFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
					.BT,
					this.start_date, this.end_date));

				oModel.read("/Commodities_Fixed_Order", {
					filters: aFilters,
					sorters: [new sap.ui.model.Sorter({
						path: "HCP_CREATED_AT",
						descending: true
					})],
					urlParameters: {
						"$expand": "Fixed_Account_Groups,Fixed_Material"
					},
					success: function (result) {
						var oCommodities = result.results;

						var novoaArray = [...new Set(oCommodities.map(x => x.HCP_CROP_TRACK_ID))];

						if (oCommodities.length > 0) {

							for (var item of oCommodities) {
								if (item.HCP_MENGE) {
									if (item.HCP_MEINS == 'SC') {
										this.commoditiesVolume = this.commoditiesVolume + (parseFloat(item.HCP_MENGE)).toFixed(2);
									}

								}
							}

							this.commoditiesResult = this.commoditiesResult + oCommodities.length;
							this.oCommoditiesFixed.push(oCommodities);
						}

						resolve();

					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Compras.");
						reject(err);
					}
				});
			}.bind(this));
		},
		getICommoditiesMapData: function (supplierLIFNR) {

			return new Promise(function (resolve, reject) {

				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;

				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
					var oModel = this.getView().getModel();
					var aMaterials = [];
					var aPlants = [];
					var aSuppliers = this.allSuppliers;
					var oEccModel = this.getOwnerComponent().getModel("eccModel");

					oModel.read("/View_Material", {
						success: function (resultMaterials) {
							var resultsMaterial = resultMaterials.results;
							if (resultsMaterial.length > 0) {
								for (var item of resultsMaterial) {
									aMaterials.push(item.MATNR);
								}

							}

							oModel.read("/View_Center", {
								success: function (resultCenters) {
									var resultsCenter = resultCenters.results;
									if (resultsCenter.length > 0) {
										for (var item2 of resultsCenter) {
											aPlants.push(item2.WERKS);
										}
									}

									oEccModel.callFunction("/getPurchaseExtract", {
										method: "GET",
										urlParameters: {
											dateFrom: new Date(this.end_date),
											dateTo: new Date(this.start_date),
											materials: JSON.stringify(aMaterials),
											plants: JSON.stringify(aPlants),
											suppliiers: JSON.stringify(aSuppliers)
										},
										success: function (result) {

											if (result.json) {
												var aResult = JSON.parse(result.json);

												var oIndexModel = this.getView().getModel("indexModel");
												oIndexModel.setProperty("/hcpTotalPedidos", aResult.hcpTotalPedidos);
												oIndexModel.setProperty("/hcpTotalPedidosFixo", aResult.hcpTotalPedidosFixo);
												oIndexModel.setProperty("/hcpTotalPedidosDep", aResult.hcpTotalPedidosDep);
												oIndexModel.setProperty("/hcpPrazoMedio", aResult.hcpPrazoMedio);
												oIndexModel.setProperty("/hcpZterm", aResult.hcpZterm);
												oIndexModel.setProperty("/hcpPedido", aResult.hcpPedido);

												oIndexModel.setProperty("/hcpDepAno1", aResult.hcpDepAno1);
												oIndexModel.setProperty("/hcpDepAno2", aResult.hcpDepAno2);
												oIndexModel.setProperty("/hcpDepAno3", aResult.hcpDepAno3);
												oIndexModel.setProperty("/hcpDepAno4", aResult.hcpDepAno4);
												oIndexModel.setProperty("/hcpFixoAno1", aResult.hcpFixoAno1);
												oIndexModel.setProperty("/hcpFixoAno2", aResult.hcpFixoAno2);
												oIndexModel.setProperty("/hcpFixoAno3", aResult.hcpFixoAno3);
												oIndexModel.setProperty("/hcpFixoAno4", aResult.hcpFixoAno4);

												oIndexModel.setProperty("/hcpAno1Total", aResult.hcpDepAno1 + aResult.hcpFixoAno1);
												oIndexModel.setProperty("/hcpAno2Total", aResult.hcpDepAno2 + aResult.hcpFixoAno2);
												oIndexModel.setProperty("/hcpAno3Total", aResult.hcpDepAno3 + aResult.hcpFixoAno3);
												oIndexModel.setProperty("/hcpAno4Total", aResult.hcpDepAno4 + aResult.hcpFixoAno4);

												var totalDep = aResult.hcpDepAno1 + aResult.hcpDepAno2 + aResult.hcpDepAno3 + aResult.hcpDepAno4;
												var totalFixo = aResult.hcpFixoAno1 + aResult.hcpFixoAno2 + aResult.hcpFixoAno3 +
													aResult.hcpFixoAno4;

												oIndexModel.setProperty("/hcpTotalDep", totalDep);
												oIndexModel.setProperty("/hcpTotalFixo", totalFixo);

												oIndexModel.setProperty("/hcpTotal", totalDep + totalFixo);

											}
											resolve();

											console.log(result);
										}.bind(this),
										error: function (error) {
											sap.m.MessageToast.show(error);
										}
									});

								}.bind(this),
								error: function (err) {
									sap.m.MessageToast.show("Falha ao Buscar Certificações.");
									reject(err);
								}
							});

							//resolve();

						}.bind(this),
						error: function (err) {
							sap.m.MessageToast.show("Falha ao Buscar Certificações.");
							reject(err);
						}
					});
				} else {
					resolve();
				}

			}.bind(this));
		},
		getICertificationsData: function (supplierLIFNR) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_PROVIDER_ID',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: supplierLIFNR
				}));

				aFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
					.BT,
					this.start_date, this.end_date));

				oModel.read("/Visit_Form_Certifications", {
					filters: aFilters,
					sorters: [new sap.ui.model.Sorter({
						path: "HCP_CREATED_AT",
						descending: true
					})],
					success: function (resultCertifications) {
						var oCertifications = resultCertifications.results;

						var aCertifications = [...new Set(oCertifications.map(x => x.HCP_CERTIFICATION))];

						var result = [];
						var map = new Map();
						for (var item of oCertifications) {
							if (!map.has(item.HCP_VISIT_ID)) {
								map.set((item.HCP_VISIT_ID), true);
								// set any value to Map
								result.push({
									HCP_CERTIFICATION: item.HCP_CERTIFICATION,
									HCP_PROVIDER_ID: item.HCP_PROVIDER_ID,
									HCP_UNIQUE_KEY: item.HCP_UNIQUE_KEY,
									HCP_VISIT_TYPE: item.HCP_VISIT_TYPE
								});
							}
						}

						this.certificationsResult = this.certificationsResult + aCertifications.length;
						if (result.length > 0) {
							this.oCertifications.push(result);
						}

						resolve();

					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Certificações.");
						reject(err);
					}
				});
			}.bind(this));
		},
		formatterDate: function (date, getHours) {

			if (date) {
				var oDay = date.getUTCDate();

				if (oDay < 10) {
					oDay = "0" + oDay;
				}

				var oMonth = date.getMonth() + 1;

				if (oMonth < 10) {
					oMonth = "0" + oMonth;
				}
				var oYear = date.getFullYear();

				var oHours = date.getHours();

				if (oHours < 10) {
					oHours = "0" + oHours;
				}

				var oMinutes = date.getMinutes();

				if (oMinutes < 10) {
					oMinutes = "0" + oMinutes;
				}

				if (getHours) {
					date = oDay.toString() + "/" + oMonth.toString() + "/" + oYear.toString() + " " + oHours.toString() + ":" + oMinutes.toString();
				} else {
					date = oDay.toString() + "/" + oMonth.toString() + "/" + oYear.toString();
				}

			}

			return date;
		},
		_onTilePress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			var oIndexModel = this.getView().getModel("indexModel");

			var sPath = oEvent.getSource().oBindingContexts.supplierExtract.sPath;
			var lastChar = sPath.substr(sPath.length - 1);
			var sRoute;

			switch (lastChar) {
			case '0':
				oIndexModel.setProperty("/typeData", 'Intention');
				oIndexModel.setProperty("/TileCollection", this.oIntention);
				sRoute = "supplierExtract.ExtractView";
				break;
			case '1':
				oIndexModel.setProperty("/typeData", 'Appointments');
				oIndexModel.setProperty("/TileCollection", this.oAppointments);
				sRoute = "supplierExtract.ExtractView";
				break;
			case '2':
				oIndexModel.setProperty("/typeData", 'VisitForm');
				oIndexModel.setProperty("/TileCollection", this.oVisitForms);
				sRoute = "supplierExtract.visitForm.Edit";
				break;
			case '3':
				oIndexModel.setProperty("/typeData", 'OfferMap');
				oIndexModel.setProperty("/TileCollection", this.oOfferMap);
				break;
			case '4':
				oIndexModel.setProperty("/typeData", 'Commodities');
				oIndexModel.setProperty("/TileCollection", this.oCommodities);
				oIndexModel.setProperty("/TileCollection2", this.oCommoditiesFixed);
				break;
			case '5':
				oIndexModel.setProperty("/typeData", 'Commodities');
				oIndexModel.setProperty("/TileCollection", this.oCommodities);
				oIndexModel.setProperty("/TileCollection2", this.oCommoditiesFixed);
				break;

			case '6':
				oIndexModel.setProperty("/typeData", 'Certifications');
				oIndexModel.setProperty("/TileCollection", this.oCertifications);
				break;

			default:
				// code block
			}

			return new Promise(function (fnResolve) {

				if (oEvent.getSource().oBindingContexts.supplierExtract.sPath) {
					this.doNavigate(sRoute, oBindingContext, fnResolve, "");
				}

			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},

		_onVisitFormTile: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			var oIndexModel = this.getView().getModel("indexModel");

			//	var sPath = oEvent.getSource().oBindingContexts.supplierExtract.sPath;
			//	var lastChar = sPath.substr(sPath.length - 1);
			var sRoute;

			oIndexModel.setProperty("/typeData", 'VisitForm');
			oIndexModel.setProperty("/TileCollection", this.oVisitForms);
			sRoute = "supplierExtract.visitForm.Edit";

			var oBindingContext = oEvent.getSource().getBindingContext();

			if (this.oVisitForms[0].length == 0 && this.oVisitForms[1].length == 0 && this.oVisitForms[2].length == 0) {
				sap.m.MessageToast.show("Não foram encontrado registros para os filtros selecionados!");
			} else {
				return new Promise(function (fnResolve) {

					this.doNavigate("supplierExtract.visitForm.Edit", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			}

		},

		_onCancel: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("supplierExtract.Filter", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},

		getDataCalculated: function (supplierLIFNR) {

			return new Promise(function (resolve, reject) {

				//	this.getCropTrackingData(supplierLIFNR).then(function () {
				this.getIntentionData(supplierLIFNR).then(function () {
					this.getIScheduleData(supplierLIFNR).then(function () {
						this.getVisitFormsData(supplierLIFNR).then(function () {
							this.getIOfferMapData(supplierLIFNR).then(function () {
								this.getICommoditiesMapData(supplierLIFNR).then(function () {
									//this.getICommoditiesFixedMapData(supplierLIFNR).then(function () {
									//this.getICertificationsData(supplierLIFNR).then(function () {

									resolve();

								}.bind(this)).catch(function (error) {
									reject();
								}.bind(this));
							}.bind(this)).catch(function (error) {
								reject();
							}.bind(this));
						}.bind(this)).catch(function (error) {
							reject();
						}.bind(this));
					}.bind(this)).catch(function (error) {
						reject();
					}.bind(this));
				}.bind(this)).catch(function (error) {
					reject();
				}.bind(this));
				//}.bind(this)).catch(function (error) {
				//	reject();
				//}.bind(this));
				//}.bind(this)).catch(function (error) {
				//	reject();
				//}.bind(this));
				//	}.bind(this)).catch(function (error) {
				//		reject();
				//	}.bind(this));

			}.bind(this));

		},
		callCalculateFunction: function (supplier) {

			return new Promise(function (resolve, reject) {
				this.getDataCalculated(supplier.LIFNR).then(function () {
					resolve();
				}.bind(this)).catch(function (error) {
					reject();
				}.bind(this));

			}.bind(this));

		},
		createTileCollection: function (icon, number, numberUnit, title, info) {

			return {
				icon: icon,
				number: number,
				numberUnit: numberUnit,
				title: title,
				info: info
			};

		},
		getAppointmentsCheck: function (appointment) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var aFilters = [];
				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_UNIQUE_KEY',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: appointment.HCP_UNIQUE_KEY
				}));

				oModel.read("/Appointments_Check", {
					filters: aFilters,
					success: function (result) {
						var oAppointmentsCheck = result.results;

						var aInteractType = ["", "Presencial", "Telefone", "Mensagem via Telefone", "Skype", "E-mail"];
						var aInteractObjective = ["", "Visita Comercial", "Fomento de Alternativos", "Aplicação de Questionários", "Tema Qualidade"];
						var aCanselReason = ["", "Alteração Devido a Solicitação da Gerência", "Indisponibilidade do Fornecedor",
							"Condições Climáticas Desfavoráveis", "Imprevisto na Agenda", "Problema Operacional na Unidade", "Imprevisto Pessoal",
							"Alteração de Fornecedor na Agenda"
						];
						var result;
						var check_in;
						var check_out;

						var start_date = this.formatterDate(new Date(appointment.HCP_START_DATE), true);
						var end_date = this.formatterDate(new Date(appointment.HCP_END_DATE), true);

						if (appointment.HCP_CANCEL_REASON) {

							result = {
								id: appointment.HCP_APPOINT_ID,
								start_date: start_date,
								end_date: end_date,
								interactType: aInteractType[parseInt(appointment.HCP_INTERACTION_TYPE)],
								interactObjective: aInteractObjective[parseInt(appointment.HCP_INTERACTION_OBJECTIVE)],
								cancel_reason: aCanselReason[parseInt(appointment.HCP_CANCEL_REASON)],
								cancel_obs: appointment.HCP_CANCEL_OBS,
								type: "Canceled"
							};

							resolve(result);
						} else if (oAppointmentsCheck.length == 2) {

							check_in = this.formatterDate(new Date(oAppointmentsCheck[0].HCP_START_DATE), true);
							check_out = this.formatterDate(new Date(oAppointmentsCheck[1].HCP_END_DATE), true);

							result = {
								id: appointment.HCP_APPOINT_ID,
								start_date: start_date,
								end_date: end_date,
								interactType: aInteractType[parseInt(appointment.HCP_INTERACTION_TYPE)],
								interactObjective: aInteractObjective[parseInt(appointment.HCP_INTERACTION_OBJECTIVE)],
								check_in: check_in,
								check_out: check_out,
								type: "Closed"
							};

							resolve(result);
						} else if (oAppointmentsCheck.length == 1 && oAppointmentsCheck[0].HCP_START_DATE) {

							check_in = this.formatterDate(new Date(oAppointmentsCheck[0].HCP_START_DATE), true);

							result = {
								id: appointment.HCP_APPOINT_ID,
								start_date: start_date,
								end_date: end_date,
								interactType: aInteractType[parseInt(appointment.HCP_INTERACTION_TYPE)],
								interactObjective: aInteractObjective[parseInt(appointment.HCP_INTERACTION_OBJECTIVE)],
								check_in: check_in,
								check_out: "",
								type: "Opened"
							};

							resolve(result);
						} else {

							result = {
								id: appointment.HCP_APPOINT_ID,
								start_date: start_date,
								end_date: end_date,
								interactType: aInteractType[parseInt(appointment.HCP_INTERACTION_TYPE)],
								interactObjective: aInteractObjective[parseInt(appointment.HCP_INTERACTION_OBJECTIVE)],
								check_in: "Check_in não realizado",
								check_out: "",
								type: "Opened"
							};

							resolve(result);
						}

					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Apontamentos.");
						reject(err);
					}
				});
			}.bind(this));
		},
		_onPriceIntentionTile: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			var oIndexModel = this.getView().getModel("indexModel");

			//	var sPath = oEvent.getSource().oBindingContexts.supplierExtract.sPath;
			//	var lastChar = sPath.substr(sPath.length - 1);
			var sRoute;

			oIndexModel.setProperty("/typeData", 'Intention');
			oIndexModel.setProperty("/TileCollection", this.oIntention);
			sRoute = "supplierExtract.priceIntention.Index";

			if (this.oIntention.length == 0) {
				sap.m.MessageToast.show("Não foram encontrado registros para os filtros selecionados!");
			} else {
				var oBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function (fnResolve) {

					this.doNavigate(sRoute, oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			}

		},
		onUpdateFinished: function (oList) {

			this.setBusyDialog(this.resourceBundle.getText("textGrainApp"), this.resourceBundle.getText("textWait"));

			return new Promise(function (resolve, reject) {

				var oView = this.getView();
				var oModel = this.getView().getModel();
				var priceIntention = this.getView().getModel("priceIntention");
				var oTableActive;

				var aPromises = [];

				for (var i = 0; i < oList.length; i++) {

					var aFilters = [];
					var aFiltersSupplier = [];

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

							}.bind(this)));
						}

					}
				}

				Promise.all(aPromises).then(function () {
					resolve();
				}.bind(this));

			}.bind(this));

		},
		_onAppointmentFormTile: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			var oIndexModel = this.getView().getModel("indexModel");

			//	var sPath = oEvent.getSource().oBindingContexts.supplierExtract.sPath;
			//	var lastChar = sPath.substr(sPath.length - 1);
			var sRoute;

			oIndexModel.setProperty("/typeData", 'Appointments');
			oIndexModel.setProperty("/TileCollection", this.oAppointments);
			sRoute = "supplierExtract.ExtractView";

			var oBindingContext = oEvent.getSource().getBindingContext();

			if (this.oAppointments[0].length == 0 && this.oAppointments[1].length == 0 && this.oAppointments[2].length == 0) {
				sap.m.MessageToast.show("Não foram encontrado registros para os filtros selecionados!");
			} else {
				return new Promise(function (fnResolve) {

					this.doNavigate("supplierExtract.ExtractView", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			}

		},
		getVolumeOfferMap: function (oList) {

			//	this.setBusyDialog(this.resourceBundle.getText("textGrainApp"), this.resourceBundle.getText("textWait"));

			return new Promise(function (resolve2, reject) {

				if (oList.length > 0) {
					var oView = this.getView();
					var oModel = this.getView().getModel();
					var priceIntention = this.getView().getModel("priceIntention");
					var oTableActive;

					var aPromises2 = [];

					for (var i = 0; i < oList[0].length; i++) {

						var aFilters = [];
						var aFiltersSupplier = [];

						aPromises2.push(new Promise(function (resolveMaterial, reject) {

							var index = i;

							aFilters.push(new sap.ui.model.Filter({
								path: "HCP_UNIQUE_KEY_OFFER",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: oList[0][i].HCP_UNIQUE_KEY
							}));

							oModel.read("/Commodities_Historic_Offer", {
								filters: aFilters,
								success: function (result) {

									var aResults = result.results;

									if (aResults.length > 0) {

										for (var item of aResults) {
											if (item.HCP_EBELN) {
												this.totalVolumeOfferMap = parseFloat(this.totalVolumeOfferMap) + parseFloat(item.HCP_MENGE);
											}
										}

									}

									resolveMaterial();

								}.bind(this),
								error: function () {
									console.log("error");
								}
							});

						}.bind(this)));

					}

					Promise.all(aPromises2).then(function () {
						resolve2(this.totalVolumeOfferMap);
					}.bind(this));
				} else {
					resolve2(0);
				}

			}.bind(this));

		},
		_onOfferMapFormTile: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			var oIndexModel = this.getView().getModel("indexModel");

			//	var sPath = oEvent.getSource().oBindingContexts.supplierExtract.sPath;
			//	var lastChar = sPath.substr(sPath.length - 1);
			var sRoute;

			oIndexModel.setProperty("/typeData", 'OfferMap');
			oIndexModel.setProperty("/TileCollection", this.oOfferMap);
			sRoute = "supplierExtract.offerMap.OfferMapChart";

			var oBindingContext = oEvent.getSource().getBindingContext();

			if (this.oOfferMap.length == 0) {
				sap.m.MessageToast.show("Não foram encontrado registros para os filtros selecionados!");
			} else {
				return new Promise(function (fnResolve) {

					this.doNavigate("supplierExtract.offerMap.OfferMapChart", oBindingContext, fnResolve, "");
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			}

		},
		_onCommoditiesFormTile: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			var oIndexModel = this.getView().getModel("indexModel");

			//	var sPath = oEvent.getSource().oBindingContexts.supplierExtract.sPath;
			//	var lastChar = sPath.substr(sPath.length - 1);
			var sRoute;

			oIndexModel.setProperty("/typeData", 'Commodities');
			sRoute = "supplierExtract.commodities.Index";

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate(sRoute, oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		}
	});
}, /* bExport= */ true);