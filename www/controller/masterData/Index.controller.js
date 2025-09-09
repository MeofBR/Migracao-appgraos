sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function (MainController, MessageBox, History) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.masterData.Index", {

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("masterData.Index").attachPatternMatched(this.handleRouteMatched, this);
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "indexModel");

		},

		handleRouteMatched: function () {

			this.count = 0;
			this.revertCount = 20;
			this.hasFinished = false;
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			if (bIsMobile) {
				this.getView().getModel("indexModel").setProperty("/isMobile", true);
			} else {
				this.getView().getModel("indexModel").setProperty("/isMobile", false);
			}

			var lastUpdate;

			var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/yyyy HH:mm"
			});

			if (localStorage.getItem("lastUpdateOfferMap")) {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdateOfferMap")));
			} else {
				lastUpdate = dateFormat.format(new Date(localStorage.getItem("lastUpdate")));
			}
			this.getView().getModel("indexModel").setProperty("/lastUpdate", lastUpdate);

			this.getView().getModel("indexModel").setProperty("/countSafra", 0);
			this.getView().getModel("indexModel").setProperty("/countCertificate", 0);
			this.getView().getModel("indexModel").setProperty("/countRegion", 0);
			this.getView().getModel("indexModel").setProperty("/countFreight", 0);
			this.getView().getModel("indexModel").setProperty("/countTablePrice", 0);
			this.getView().getModel("indexModel").setProperty("/countCommit", 0);
			this.getView().getModel("indexModel").setProperty("/countPlayers", 0);
			this.getView().getModel("indexModel").setProperty("/countSuppliersContact", 0);
			this.getView().getModel("indexModel").setProperty("/countCancellationReason", 0);
			this.getView().getModel("indexModel").setProperty("/countCancelAppointment", 0);
			this.getView().getModel("indexModel").setProperty("/countMasterDataPermission", 0);
			this.getView().getModel("indexModel").setProperty("/countAdmCropTour", 0);
			this.getView().getModel("indexModel").setProperty("/countBusinessVisit", 0);

			this.getParameters();

		},
		_onFreightPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.freight", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onTablePricePress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.tablePrice", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},

		_onCropFormPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.cropForm", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},

		_onCertificationPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.certification", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onRegionPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.region", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},

		_onCommitPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.commit", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onObjectivePress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.objective", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onTypePress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.typeInteract", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onStorageTypePress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.storageType", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onConditionsPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.conditions", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onSourceInformationPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.sourceInformation", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onTechPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.tech", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onVisualConditionPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.visualCondition", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onDepositConditionPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.depositCondition", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onUserLogisticsPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.userLogistics", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onPlayersPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.players", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		
		_onSuppliersContactPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.suppliersContact", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		
		_onCancellationReasonPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.cancellationReason", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},

		_onCancelAppointmentPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.cancelAppointment", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onBlockMasterDataPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.masterDataPermission", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onCropFormCropTourPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {
				this.doNavigate("masterData.cropFormCropTour", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onUserAdmCroptour: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.admsCropTour", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onCountryCroptour: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.countryCropTour", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		_onBusinessVisitPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.businessVisit", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		
		_onDisableCommercializationPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("masterData.disableCommercialization", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
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
		getParameters: function () {

			this.setBusyDialog("Dados Mestres", "Carregando Contadores...");
			var oModel = this.getView().getModel();

			oModel.read("/Table_Price_Parameters", {

				success: function (result) {
					this.getView().getModel("indexModel").setProperty("/countTablePrice", result.results.length);
					this.closeBusyDialog();

					oModel.read("/Regions", {
						success: function (result) {
							this.getView().getModel("indexModel").setProperty("/countRegion", result.results.length);

							oModel.read("/Visit_Certifications", {
								success: function (result) {
									this.getView().getModel("indexModel").setProperty("/countCertificate", result.results.length);
									oModel.read("/Crop_Year", {
										success: function (result) {
											this.getView().getModel("indexModel").setProperty("/countSafra", result.results.length);

											oModel.read("/Commitments", {
												success: function (result) {
													this.getView().getModel("indexModel").setProperty("/countCommit", result.results.length);
													oModel.read("/Interact_Objectives", {
														success: function (result) {
															this.getView().getModel("indexModel").setProperty("/countObjective", result.results.length);

															oModel.read("/Interact_Types", {
																success: function (result) {
																	this.getView().getModel("indexModel").setProperty("/countTypeInteract", result.results.length);
																	oModel.read("/Storage_Type", {
																		success: function (result) {
																			this.getView().getModel("indexModel").setProperty("/countTypeStorage", result.results.length);

																			oModel.read("/Crop_Conditions", {
																				success: function (result) {
																					this.getView().getModel("indexModel").setProperty("/countConditions", result.results.length);

																					oModel.read("/Crop_Tech_Level", {
																						success: function (result) {
																							this.getView().getModel("indexModel").setProperty("/countTech", result.results
																								.length);
																							oModel.read("/Source_Information", {
																								success: function (result) {
																									this.getView().getModel("indexModel").setProperty("/countSourceInformation",
																										result.results
																										.length);
																									oModel.read("/Warehouse_Visual_Condition", {
																										success: function (result) {
																											this.getView().getModel("indexModel").setProperty(
																												"/countVisualCondition", result.results
																												.length);

																											oModel.read("/Deposit_Condition", {
																												success: function (result) {
																													this.getView().getModel("indexModel").setProperty(
																														"/countDepositCondition", result.results
																														.length);

																													oModel.read("/User_Logistics", {
																														success: function (result) {
																															this.getView().getModel("indexModel").setProperty(
																																"/countUserLogistics", result.results
																																.length);

																															oModel.read("/Players", {
																																success: function (result) {
																																	this.getView().getModel("indexModel").setProperty(
																																		"/countPlayers", result.results
																																		.length);
																																	oModel.read("/Simplified_Contact", {
																																	success: function (result) {
																																		this.getView().getModel("indexModel").setProperty(
																																			"/countSuppliersContact", result.results
																																			.length);	

																																			oModel.read("/Cancellation_Reason", {
																																				success: function (result) {
																																					this.getView().getModel("indexModel").setProperty(
																																						"/countCancellationReason", result.results
																																						.length);

																																					oModel.read("/Cancel_Reason", {
																																						success: function (result) {
																																							this.getView().getModel("indexModel").setProperty(
																																								"/countCancelAppointment", result.results
																																								.length);
																																								
																																							oModel.read("/Business_Visit", {
																																								success: function (result) {
																																									this.getView().getModel("indexModel").setProperty(
																																										"/countBusinessVisit", result.results
																																										.length);
																																											oModel.read("/Master_Data_Permissions", {
																																												success: function (result) {
																																													this.getView().getModel("indexModel").setProperty(
																																														"/countMasterDataPermission", result.results
																																														.length);
																																														
																																													oModel.read("/Adms_Croptour", {
																																														success: function (result) {
																																															this.getView().getModel("indexModel").setProperty(
																																																"/countAdmCropTour", result.results
																																																.length);
																																															
																																															oModel.read("/Regions_Croptour", {
																																																success: function (result) {
																																																	this.getView().getModel("indexModel").setProperty(
																																																		"/countContryCropTour", result.results
																																																		.length);
																																																		
																																																	oModel.read("/Crop_Year_Croptour", {
																																																		success: function (result) {
																																																			this.getView().getModel("indexModel").setProperty(
																																																				"/countSafraCropTour", result.results
																																																				.length);
																																																		}.bind(this)
																																																	});
																																																}.bind(this)
																																															});
																																														}.bind(this)
																																													});	
																																												}.bind(this)
																																											});	
																																								}.bind(this)
																																							});	
																																						}.bind(this)
																																					});
																																				}.bind(this)
																																			});
																																		}.bind(this)
																																	});
																																}.bind(this)
																															});
																														}.bind(this)
																													});
																												}.bind(this)
																											});
																										}.bind(this)
																									});
																								}.bind(this)
																							});
																						}.bind(this)
																					});
																				}.bind(this)
																			});
																		}.bind(this)
																	});
																}.bind(this)
															});
														}.bind(this)
													});
												}.bind(this)
											});
										}.bind(this)
									});
								}.bind(this)
							});
						}.bind(this)
					});
				}.bind(this)
			});
		}

	});
}, /* bExport= */ true);