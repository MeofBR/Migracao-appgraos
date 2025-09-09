sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/List',
	'sap/m/StandardListItem',
	"sap/ui/core/routing/History",
	'com/sap/build/standard/brfAppDeGraosModoEditar/controls/CustomComboBox'
], function (MainController, MessageBox, JSONModel, Button, Dialog, List, StandardListItem, History, CustomComboBox) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.commodities.EditFixedOrder", {

		onInit: function () {

			var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
			var sLocale = sCurrentLocale.split("-");
			var oLocale = new sap.ui.core.Locale(sLocale[0], sLocale[1]);
			this.oNumberFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance(oLocale);

			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("commodities.EditFixedOrder").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				localeId: this.oNumberFormat.oLocale.sLocaleId,
				enabledShipment: true,
				enabledConfirm: false,
				enabledCadence: false,
				enabledMessage: true,
				enabledLgort: false,
				enabledOffer: true,
				visibleSequence: false,
				cadence: true,
				edit: false,
				yesFob: false,
				matCereal: false,
				yesOrdeRep: false,
				justPreco: false,
				fixedDate: true,
				errorMaterial: false,
				errorMaterialDisponible: false,
				errorPrice: false,
				errorMenge: false,
				errorShipment: false,
				errorDeposit: false,
				visibleCadence: false,
				visibleShipment: false,
				comoditiesCandece: false,
				checkTpCompra: false,
				checkMat: false,
				checkActive: false,
				checkPreco: false,
				checkCereal: false,
				processado: false,
				enabled: true,
				visibleOffer: false,
				tableDeposit: [],
				tableCadence: [],
				tableApprover: [],
				itemMessages: [],
				enableEditWerksValid: true,
				isFrameType: false
			}), "fixedOrderFormModel");

			this.cadenceSelected = [];
			this.totalSelected = 0;

			var oModelOwner = this.getOwnerComponent().getModel();
			oModelOwner.refresh(true);

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				create: true,
				edit: true
			}), "profileModel");

		},

		handleRouteMatched: function (oEvent) {

			this.count = 0;
			this.revertCount = 120;
			this.hasFinished = false;
			this.timeOut = 120;
			this.setBusyDialog(this.resourceBundle.getText("messageLoadingWait"));

			this.getView().getModel("fixedOrderFormModel").setData({
				localeId: this.oNumberFormat.oLocale.sLocaleId,
				enabledShipment: true,
				enabledConfirm: false,
				enabledCadence: false,
				enabledMessage: true,
				enabledLgort: false,
				enabledOffer: true,
				visibleSequence: false,
				cadence: true,
				edit: false,
				yesFob: false,
				matCereal: false,
				yesOrdeRep: false,
				justPreco: false,
				fixedDate: true,
				errorMaterial: false,
				errorPrice: true,
				errorMenge: false,
				errorShipment: false,
				visibleCadence: false,
				visibleShipment: false,
				comoditiesCandece: false,
				checkTpCompra: false,
				checkMat: false,
				checkActive: false,
				checkPreco: false,
				checkCereal: false,
				processado: false,
				enabled: true,
				visibleOffer: false,
				tableDeposit: [],
				tableCadence: [],
				tableApprover: [],
				itemMessages: [],
				enableEditWerksValid: true,
				isFrameType: false
			});

			var oModel = this.getView().getModel();
			var oEditModel = this.getView().getModel("fixedOrderFormModel");
			var oData = oEditModel.oData;
			var date = new Date();
			var timezone = date.getTimezoneOffset() * 60 * 1000;

			if (oEvent.getParameter("data")) {
				var sPathKeyData = oEvent.getParameter("data").keyData;
				var aKeyData = oModel.getProperty(decodeURIComponent(sPathKeyData));
				aKeyData = JSON.parse(JSON.stringify(aKeyData));

				aKeyData.HCP_ZDTREMATE = new Date(aKeyData.HCP_ZDTREMATE);
				aKeyData.HCP_ZDTREMDE = new Date(aKeyData.HCP_ZDTREMDE);

				aKeyData.HCP_ZDTREMATE = new Date(aKeyData.HCP_ZDTREMATE.setTime(aKeyData.HCP_ZDTREMATE.getTime() + timezone));
				aKeyData.HCP_ZDTREMDE = new Date(aKeyData.HCP_ZDTREMDE.setTime(aKeyData.HCP_ZDTREMDE.getTime() + timezone));

				//aKeyData.HCP_ZDTREMATE = new Date(aKeyData.HCP_ZDTREMATE);
				//aKeyData.HCP_ZDTREMDE = new Date(aKeyData.HCP_ZDTREMDE);
				aKeyData.HCP_CREATED_AT = new Date(aKeyData.HCP_CREATED_AT);
				aKeyData.HCP_UPDATED_AT = new Date(aKeyData.HCP_UPDATED_AT);

				if (aKeyData.HCP_ZDTPGTO1) {
					aKeyData.HCP_ZDTPGTO1 = new Date(aKeyData.HCP_ZDTPGTO1);
				}

				if (aKeyData.HCP_ZDTPGTO2) {
					aKeyData.HCP_ZDTPGTO2 = new Date(aKeyData.HCP_ZDTPGTO2);
				}

				if (aKeyData.HCP_ZDTPGTO3) {
					aKeyData.HCP_ZDTPGTO3 = new Date(aKeyData.HCP_ZDTPGTO3);
				}

				if (aKeyData.HCP_DTFIX === "X") {
					aKeyData.HCP_DTFIX = true;
				} else {
					aKeyData.HCP_DTFIX = false;
				}

				if (aKeyData.HCP_ZZTPCOMPRA == '2') {
					aKeyData.isFrameType = true;
				} else {
					aKeyData.isFrameType = false;
				}
				
				

				for (var key in aKeyData) {
					oData[key] = aKeyData[key];
				}
			}

			oEditModel.setProperty("/", oData);
			
			if(!aKeyData.HCP_DTFIX){
				oEditModel.setProperty("/visibleFixedDate", false);
			}else {
				oEditModel.setProperty("/visibleFixedDate", true);
					if(aKeyData.HCP_ZDTPGTO1){
							var oDateInput1 = this.getView().byId("idDateInput1");
						  this.verifyFixedDateViewSuppliers(aKeyData.HCP_LIFNR, aKeyData.HCP_ZDTPGTO1)
	                        .then(function(isValid) {
	                            // Se a validação passar, continua o processamento
	                            oDateInput1.setValueState("None");
	                        })
	                        .catch(function(error) {
	                            // Se a validação falhar, mostra erro no campo
	                            oDateInput1.setValueState("Error");
	                            oDateInput1.setValueStateText(error);
	                            oErro = true;
	                            this._validateForm();
	                        }.bind(this));
					}
			}

			this.getUser().then(function (userName) {
				this.userName = userName;
				this.checkUserInfo(this.userName).then(function (userArray) {
					this._getTvarvSap("P", "Z_Z586011_ATIVAR_REGRAS", null, 'checkActive').then(function () {

						if (userArray) {
							this.getView().getModel("fixedOrderFormModel").setProperty("/HCP_MAILSOL", userArray.EMAIL);
						}

						this._getDepositForWerks(oData.HCP_WERKS).then(function () {

							oEditModel.setProperty("/HCP_LGORT", aKeyData.HCP_LGORT);

							this._setProperties().then(function () {
								this._searchDescriptionName();
								//PROFILE
								this.getUserProfile("View_Profile_Commodities", this.userName).then(profileData => {
									this.getView().getModel("profileModel").setData(profileData);
									console.log(this.getView().getModel("profileModel").getData());
									oEditModel.setProperty("/edit", false);
									this.checkWerks();
									this.closeBusyDialog();
								}).catch(error => {
									console.log(error);
									oEditModel.setProperty("/edit", false);
									this.closeBusyDialog();
								});
							}.bind(this));

						}.bind(this));

					}.bind(this));
				}.bind(this));
			}.bind(this));
		},

		checkWerks: function () {
			var oFixedOrderModel = this.getView().getModel("fixedOrderFormModel");
			var oProfileModel = this.getView().getModel("profileModel");
			var oProfileData = oProfileModel.getData();
			var sWerks = oFixedOrderModel.getData().HCP_WERKS;

			if (sWerks) {
				if (oProfileData.werks.filter(werks => werks.WERKS == sWerks || werks.VALOR == '*').length > 0 || oProfileData.fullAccess) {
					oFixedOrderModel.setProperty("/enableEditWerksValid", true);
				} else {
					oFixedOrderModel.setProperty("/enableEditWerksValid", false);
				}
			} else {
				oFixedOrderModel.setProperty("/enableEditWerksValid", true);
			}
		},

		checkIfWerksIsInUserProfile: function (sWerks) {
			var oProfileModel = this.getView().getModel("profileModel");
			var oFixedOrderFormModel = this.getView().getModel("fixedOrderFormModel");
			var oProfileData = oProfileModel.getData();

			if (sWerks) {
				if (oProfileData.werks.filter(werks => werks.WERKS == sWerks || werks.VALOR == '*').length > 0 || oProfileData.fullAccess) {
					oFixedOrderFormModel.setProperty("/enableCreateWerksValid", true);
					return true;
				} else {
					oFixedOrderFormModel.setProperty("/enableCreateWerksValid", false);
					return false;
				}
			} else {
				oFixedOrderFormModel.setProperty("/enableCreateWerksValid", true);
				return false;
			}

		},

		_getCadenceRequired: function () {

			return new Promise(function (resolve, reject) {

				var oModelCommodities = this.getView().getModel();
				var oModel = this.getView().getModel("fixedOrderFormModel");
				var oData = oModel.oData;
				var aFilters = [];

				if (oData.HCP_WERKS && oData.HCP_MATNR) {

					oModel.setProperty("/flagCadence", false);
					oModel.setProperty("/visibleCadence", false);
					oModel.setProperty("/cadence", true);

					aFilters.push(new sap.ui.model.Filter({
						path: "WERKS",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_WERKS
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: "MATNR",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_MATNR
					}));

					oModelCommodities.read("/Z040041", {

						filters: aFilters,
						success: function (results) {

							var aResults = results.results;

							if (aResults.length > 0) {
								if (aResults[0].FLAG_CADENCIA == "X") {
									oModel.setProperty("/flagCadence", true);
									var oCadence = false;

									for (var i = 0; i < oData.tableCadence.length; i++) {

										var oQuantity = parseFloat(oData.tableCadence[i].HCP_QUANTIDADE).toFixed(2);

										if (oQuantity != "NaN" && oQuantity > "0.00") {
											oCadence = true;
										}

									}

									oModel.setProperty("/cadence", oCadence);

									if (oData.messageCadence != null) {
										oModel.setProperty("/visibleCadence", true);
									}

									resolve();
								}

								resolve();

							} else {
								resolve();
							}

						}.bind(this),
						error: function (error) {
							reject(error);
						}
					});

				} else {
					resolve();
				}

			}.bind(this));
		},

		_setProperties: function () {

			return new Promise(function (resolve, reject) {

				var oEditModel = this.getView().getModel("fixedOrderFormModel");
				var oData = oEditModel.oData;
				var oMainDataForm = this.byId("newEntitySimpleForm").getContent();

				if (oData.HCP_UNIQUE_KEY_OFFER) {
					oEditModel.setProperty("/visibleOffer", true);
					oEditModel.setProperty("/enabledOffer", false);
				} else {
					oMainDataForm[49].setTo(oData.HCP_ZDTREMATE);

					if (oData.HCP_ZDTREMDE < new Date()) {
						oMainDataForm[49].setFrom(new Date());
					} else {
						oMainDataForm[49].setFrom(oData.HCP_ZDTREMDE);
					}

				}

				if (oData.HCP_ZSEQUE) {
					oEditModel.setProperty("/processado", true);
					oEditModel.setProperty("/enabled", false);
					oEditModel.setProperty("/enabledShipment", false);
					oEditModel.setProperty("/visibleSequence", true);
					oEditModel.setProperty("/enabledOffer", false);
				}

				if (oData.HCP_DTFIX === false) {
					oEditModel.setProperty("/fixedDate", true);
				} else {
					oEditModel.setProperty("/fixedDate", false);
				}

				if (oData.HCP_SUBST === "S") { //Sim
					oEditModel.setProperty("/yesOrdeRep", true);
				} else {
					oEditModel.setProperty("/yesOrdeRep", false);
				}

				if (oData.HCP_ZUMIDADE == "0") {
					oEditModel.setProperty("/HCP_ZUMIDADE", null);
				}

				if (oData.HCP_ZIMPUREZA == "0") {
					oEditModel.setProperty("/HCP_ZIMPUREZA", null);
				}

				if (oData.HCP_ZARDIDOS == "0") {
					oEditModel.setProperty("/HCP_ZARDIDOS", null);
				}

				if (oData.HCP_ZFRETE == "FOB") {
					oEditModel.setProperty("/yesFob", true);
				}

				oEditModel.setProperty("/justOtherPreco", false);

				if (oData.HCP_JUST_PRECO) {
					oEditModel.setProperty("/justPreco", true);
					oEditModel.setProperty("/errorPrice", true);

					if (oData.HCP_JUST_PRECO == "9") {
						oEditModel.setProperty("/justOtherPreco", true);
					}

				} else {
					oEditModel.setProperty("/justPreco", false);
					oEditModel.setProperty("/errorPrice", false);
				}

				if (oData.HCP_STATUS == '3') {
					oEditModel.setProperty("/enabled", false);
					oEditModel.setProperty("/enabledOffer", false);

				}

				if (oData.HCP_BWERT) {

					//oEditModel.setProperty("/errorMaterialDisponible", true);
					//oEditModel.setProperty("/isFrameType", true);
				} else {

					oEditModel.setProperty("/errorMaterialDisponible", false);
					oEditModel.setProperty("/isFrameType", false);
				}

				var oApprover = oData.HCP_BEDNR;

				this._getOffer().then(function () {
					this._getCadenceRequired().then(function () {
						this._getCadence().then(function () {
							this._getApprover(oData.HCP_WAERS).then(function () {

								oEditModel.setProperty("/HCP_BEDNR", oApprover);

								this._searchPartnerName().then(function () {

									if (!oData.HCP_ZSEQUE) {

										var oMaterial = oData.HCP_MATNR;

										if (oMaterial) {

											var oMatnr = oMaterial;
											oMaterial = parseFloat(oMaterial);

											this._getTvarvSap("S", "Z_Z586011_ATIVA_TP_COMPRA", oMaterial, 'checkTpCompra').then(function () {

												if (oData.checkActive == true && oData.checkTpCompra == false) {

													oEditModel.setProperty("/errorMaterialDisponible", false);
													oEditModel.setProperty("/isFrameType", false);
													oEditModel.setProperty("/HCP_ZZTPCOMPRA", null);
													oEditModel.setProperty("/HCP_BWERT", null);
													oEditModel.setProperty("/HCP_ZZCAMBIO", null);
													oEditModel.setProperty("/HCP_ACTZZTPCOMPRA", null);
													oEditModel.setProperty("/HCP_ZZPREMIO_CEREAL", null);

													this._getGrainMaterial(oMatnr).then(function () {
														this._getTvarvSap("S", "Z_Z586011_ATIVA_PRECO", oMaterial, 'checkPreco').then(function () {
															this._getTvarvSap("S", "Z_Z586011_ATIVA_TP_CEREAL", oMaterial, 'checkCereal').then(function () {
																this._getPriceTypeMaterial().then(function () {
																	resolve();
																}.bind(this));
															}.bind(this));
														}.bind(this));
													}.bind(this));

												} else {

													if (oData.checkTpCompra == true) {

														oEditModel.setProperty("/errorMaterialDisponible", true);
														oEditModel.setProperty("/matCereal", false);
														oEditModel.setProperty("/HCP_TPCEREAL", null);
														resolve();
														this._validateForm();

													} else {
														oEditModel.setProperty("/errorMaterialDisponible", false);
														oEditModel.setProperty("/isFrameType", false);
														oEditModel.setProperty("/HCP_ZZTPCOMPRA", null);
														oEditModel.setProperty("/HCP_BWERT", null);
														oEditModel.setProperty("/HCP_ZZCAMBIO", null);
														oEditModel.setProperty("/HCP_ACTZZTPCOMPRA", null);
														oEditModel.setProperty("/HCP_ZZPREMIO_CEREAL", null);
														oEditModel.setProperty("/matCereal", false);
														oEditModel.setProperty("/HCP_TPCEREAL", null);
														resolve();
														this._validateForm();
													}

												}

											}.bind(this));

										}

									} else {

										if (oData.HCP_JUST_PRECO != null) {
											oEditModel.setProperty("/justPreco", true);
										}

										resolve();

									}

								}.bind(this));
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));

		},

		formatterDate: function (oDateOffer) {

			return new Promise(function (resolve, reject) {

				if (oDateOffer) {
					var oDay = oDateOffer.getUTCDate();

					if (oDay < 10) {
						oDay = "0" + oDay;
					}

					var oMonth = oDateOffer.getMonth() + 1;

					if (oMonth < 10) {
						oMonth = "0" + oMonth;
					} else {
						oMonth = oMonth.toString();
					}
					var oYear = oDateOffer.getFullYear();

					var oDate = oDay.toString() + "/" + oMonth.toString() + "/" + oYear.toString();

					resolve(oDate);

				} else {
					resolve();
				}

			}.bind(this));

		},

		_getOffer: function (oKeyOffer, oUserArray) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var oEditModel = this.getView().getModel("fixedOrderFormModel");
				var oData = oEditModel.oData;
				var aFilters = [];
				var oDateTo;
				var oDataFrom;

				if (oData.HCP_UNIQUE_KEY_OFFER && oData.HCP_STATUS != "2") {

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_UNIQUE_KEY',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_UNIQUE_KEY_OFFER
					}));

					oModel.read("/Offer_Map", {

						filters: aFilters,
						success: function (results) {

							var aResults = results.results;

							if (aResults.length > 0) {

								var oDate = new Date();

								//Ano menor igual e mês menor
								if (aResults[0].HCP_DATE_START.getFullYear() < oDate.getFullYear() || //Ano Menor
									(aResults[0].HCP_DATE_START.getFullYear() <= oDate.getFullYear() && aResults[0].HCP_DATE_START.getMonth() < oDate.getMonth())
								) {

									oEditModel.setProperty("/processado", true);
									oEditModel.setProperty("/enabled", false);
									oEditModel.setProperty("/enabledShipment", false);

									var oMessage = this.resourceBundle.getText("messageNotCommodities") + this.resourceBundle.getText("messageErrorShipment");
									oEditModel.setProperty("/messageShipment", oMessage);

									oFirstDay = new Date(aResults[0].HCP_DATE_START.getFullYear(), aResults[0].HCP_DATE_START.getMonth(), 1);

								} else {

									if (oDate.getMonth() == aResults[0].HCP_DATE_START.getMonth()) {

										if (aResults[0].HCP_DATE_START < new Date()) {
											aResults[0].HCP_DATE_START = new Date();
										}

										var oFirstDay = new Date();

									} else {
										oDate = aResults[0].HCP_DATE_START;
										oFirstDay = new Date(oDate.getFullYear(), oDate.getMonth(), 1);
									}

								}

								var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
								//var oDate = new Date();

								var oLastDay = new Date(oDate.getFullYear(), oDate.getMonth() + 1, 0);

								if (oDate.getFullYear() != aResults[0].HCP_DATE_START.getFullYear()) {
									oFirstDay = new Date(aResults[0].HCP_DATE_START.getFullYear(), aResults[0].HCP_DATE_START.getMonth(), 1);
									oLastDay = new Date(aResults[0].HCP_DATE_START.getFullYear(), aResults[0].HCP_DATE_START.getMonth() + 1, 0);
								}

								//	oMainDataForm[49].setFrom(aResults[0].HCP_DATE_START);
								//	oMainDataForm[49].setTo(aResults[0].HCP_DATE_END);

								oMainDataForm[49].setMinDate(oFirstDay);
								oMainDataForm[49].setMaxDate(oLastDay);

								var aDateStart = aResults[0].HCP_DATE_START;

								aResults[0].HCP_DATE_START = this.getTimeZoneData(aResults[0].HCP_DATE_START, true);

								oEditModel.setProperty("/visibleShipment", true);

								this.oMengeDispOffer = parseFloat(aResults[0].HCP_VOLUME);

								if (oEditModel.oData.errorShipment == false) {

									var oDateToday = new Date();
									oDateToday = this.getTimeZoneData(oDateToday, false);

									if (oDateToday > aResults[0].HCP_DATE_START) {
										aResults[0].HCP_DATE_START = oDateToday;
									}
								}

								this.formatterDate(oFirstDay).then(function (oDataFrom) {
									this.formatterDate(oLastDay).then(function (oDateTo) {

										if (!oMessage) {
											oMessage = this.resourceBundle.getText("messageShipment") + oDataFrom + " - " + oDateTo;
											oEditModel.setProperty("/messageShipment", oMessage);
										}

										this._getHistoricOffer().then(function () {
											resolve();
										}.bind(this));
									}.bind(this));
								}.bind(this));

							} else {
								resolve();
							}

						}.bind(this),
						error: function (error) {
							resolve();
						}
					});

				} else {
					resolve();
				}
			}.bind(this));

		},

		_getHistoricOffer: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var oEditModel = this.getView().getModel("fixedOrderFormModel");
				var oData = oEditModel.oData;
				var aFilters = [];

				if (oData.HCP_UNIQUE_KEY_OFFER && oData.HCP_STATUS != "2") {

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_UNIQUE_KEY_OFFER',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_UNIQUE_KEY_OFFER
					}));

					// aFilters.push(new sap.ui.model.Filter({
					// 	path: 'HCP_UNIQUE_KEY_ORDER',
					// 	operator: sap.ui.model.FilterOperator.NE,
					// 	value1: oData.HCP_UNIQUE_KEY
					// }));

					oModel.read("/Commodities_Historic_Offer", {
						filters: aFilters,
						success: function (result) {

							var aResults = result.results;

							for (var i = 0; i < aResults.length; i++) {

								if (aResults[i].HCP_UNIQUE_KEY_ORDER == oData.HCP_UNIQUE_KEY) {
									oEditModel.setProperty("/HCP_HISTORIC_ID", aResults[i].HCP_HISTORIC_ID);
									oEditModel.setProperty("/historicOffer", aResults[i]);

								} else {
									this.oMengeDispOffer = this.oMengeDispOffer - aResults[i].HCP_MENGE;
								}

							}

							if (this.oMengeDispOffer > 0) { //Quantidade Disponivel da oferta para compra
								oEditModel.setProperty("/errorMenge", false);
								// oEditModel.setProperty("/HCP_MENGE", this.oMengeDispOffer);
								oEditModel.setProperty("/HCP_MENGE_OFFER", this.oMengeDispOffer);
							} else {
								oEditModel.setProperty("/errorMenge", true);
							}

							resolve();

						}.bind(this),
						error: function () {
							reject(error);
						}
					});

				} else {
					resolve();
				}
			}.bind(this));

		},

		_searchPartnerName: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var oEditModel = this.getView().getModel("fixedOrderFormModel");
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'LIFNR',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oEditModel.oData.HCP_LIFNR
				}));

				oModel.read("/View_Suppliers", {

					filters: aFilters,

					success: function (result) {

						if (result.results.length > 0) {
							oEditModel.setProperty("/PROVIDER_DESC", result.results[0].NAME1);
						}

						resolve();

					}.bind(this),
					error: function () {
						reject(error);
					}
				});

			}.bind(this));

		},

		_getMessage: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel("fixedOrderFormModel");
				var oData = oModel.oData;
				var oModelCommodities = this.getView().getModel();
				var aFilters = [];

				oModel.setProperty("/itemMessages", []);

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_UNIQUE_KEY
				}));

				oModelCommodities.read("/Commodities_Log_Messages", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;
						var oDataItem = oModel.getProperty("/itemMessages");

						if (aResults.length) {

							for (var i = 0; i < aResults.length; i++) {

								if (aResults[i].HCP_MSGTYP == "S") {
									var aIcon = "sap-icon://message-success";
								} else if (aResults[i].hcpMstyp == "E") {
									aIcon = "sap-icon://message-error";
								} else {
									aIcon = "sap-icon://message-information";
								}

								var aData = {
									HCP_MESSAGE_ID: aResults[i].HCP_MESSAGE_ID,
									HCP_MSGTYP: aResults[i].HCP_MSGTYP,
									ICON: aIcon,
									HCP_MESSAGE: aResults[i].HCP_MESSAGE
								};

								oDataItem.push(aData);

							}

							oModel.setProperty("/enabledMessage", true);
							oModel.setProperty("/itemMessages", oDataItem);
							resolve();

						} else {
							MessageBox.information(
								this.resourceBundle.getText("messageNotMessage"), {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										resolve();
									}.bind(this)
								}
							);

						}

					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));

		},

		_getCadence: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel("fixedOrderFormModel");
				var oData = oModel.oData;
				var oModelCommodities = this.getView().getModel();
				var aFilters = [];
				var oTableCadence = oData.tableCadence;
				var oDataItem = oModel.getProperty("/tableCadence");

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_TIPO",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "1" //Pedido Fixo
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_UNIQUE_KEY
				}));

				oModelCommodities.read("/Cadence", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;

						for (var i = 0; i < aResults.length; i++) {

							var aData = {
								HCP_DATA_ATUAL: aResults[i].HCP_DATA_ATUAL,
								HCP_QUANTIDADE: aResults[i].HCP_QUANTIDADE
							};

							oDataItem.push(aData);

						}

						oModel.setProperty("/enabledCadence", true);
						oModel.setProperty("/cadence", true);
						oModel.setProperty("/tableCadence", oDataItem);
						resolve();

					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));

		},

		_getTvarvSap: function (oType, oName, oLow, oProperty) {

			return new Promise(function (resolve, reject) {

				var oModelCommodities = this.getView().getModel();
				var oModel = this.getView().getModel("fixedOrderFormModel");
				var oData = oModel.oData;
				var aFilters = [];

				oData[oProperty] = false;

				aFilters.push(new sap.ui.model.Filter({
					path: "NAME",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oName
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "TYPE",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oType
				}));

				if (oType == "S") {
					aFilters.push(new sap.ui.model.Filter({
						path: "SIGN",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: "I"
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: "OPTI",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: "EQ"
					}));
				}

				if (oLow) {
					aFilters.push(new sap.ui.model.Filter({
						path: "LOW",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oLow
					}));
				}

				oModelCommodities.read("/Tvarvc", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;

						if (aResults.length > 0) {

							if (aResults[0].LOW) {
								oData[oProperty] = true;
							}

						}

						resolve();

					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));

		},

		_onInputJustificationFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("fixedOrderFormModel");
			var oInput = oEvent.getSource();

			if (oInput.getSelectedKey() === "9") { //Outra
				oModel.setProperty("/justOtherPreco", true);
			} else {
				oModel.setProperty("/justOtherPreco", false);
			}

			oModel.setProperty("/HCP_TEXT_PRECO", null);

			this._validateForm();

		},

		_onInputFreightFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("fixedOrderFormModel");
			var oInput = oEvent.getSource();

			if (oInput.getSelectedKey() === "FOB") { //Sim
				oModel.setProperty("/yesFob", true);
			} else {
				oModel.setProperty("/yesFob", false);
			}

			this._calculatePriceMaterial().then(function () {
				this._validateForm();
			}.bind(this));

		},

		_onInputOrderReplacementFormSelect: function (oEvent) {

			var oModel = this.getView().getModel("fixedOrderFormModel");
			var oInput = oEvent.getSource();

			if (oInput.getSelectedKey() === "S") { //Sim
				oModel.setProperty("/yesOrdeRep", true);
				oModel.setProperty("/HCP_EBELP_SUB", "0010");
			} else {
				oModel.setProperty("/yesOrdeRep", false);
				oModel.setProperty("/HCP_EBELP_SUB", null);
			}

			this._validateForm();

		},

		_getDepositForWerks: function (oCenter) {

			var oModelFixed = this.getView().getModel();
			var oModel = this.getView().getModel("fixedOrderFormModel");
			var aFilters = [];
			var aSorters = [];

			return new Promise(function (resolve, reject) {

				oModel.setProperty("/HCP_LGORT", null);
				oModel.setProperty("/tableDeposit", []);

				if (oCenter) {

					aFilters.push(new sap.ui.model.Filter({
						path: "WERKS",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oCenter
					}));

					aSorters.push(new sap.ui.model.Sorter({
						path: "LGORT",
						descending: false
					}));

					oModelFixed.read("/View_Deposity", {

						filters: aFilters,
						sorters: aSorters,
						success: function (results) {

							var aResults = results.results;
							var oDataItem = oModel.getProperty("/tableDeposit");

							if (aResults.length > 0) {

								for (var i = 0; i < aResults.length; i++) {

									var aData = {
										LGORT: aResults[i].LGORT,
										LGOBE: aResults[i].LGOBE
									};

									oDataItem.push(aData);

								}

								oModel.setProperty("/enabledLgort", true);
								oModel.setProperty("/tableDeposit", oDataItem);
								resolve();
							}

						}.bind(this),
						error: function (error) {
							resolve();
						}
					});

				} else {
					oModel.setProperty("/enabledLgort", false);
					resolve();
				}

			}.bind(this));

		},

		_getApprover: function (oMoeda) {

			var oModelCommodities = this.getView().getModel();
			var oModel = this.getView().getModel("fixedOrderFormModel");
			var aFilters = [];

			return new Promise(function (resolve, reject) {

				oModel.setProperty("/HCP_BEDNR", null);
				oModel.setProperty("/tableApprover", []);

				//	if (oMoeda) {

				//	aFilters.push(new sap.ui.model.Filter({
				//		path: "WAERS",
				//		operator: sap.ui.model.FilterOperator.EQ,
				//		value1: oMoeda
				//	}));

				oModelCommodities.read("/Z5133", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;
						var oDataItem = oModel.getProperty("/tableApprover");

						if (aResults.length > 0) {

							for (var i = 0; i < aResults.length; i++) {

								var aData = {
									ID_USER: aResults[i].ID_USER,
									NAME_TEXT: aResults[i].NAME_TEXT
								};

								oDataItem.push(aData);

							}

							//	var oDataResult = [...new Set(oDataItem.map(x => x.ID_USER))];
							var result = [];
							const map = new Map();
							for (const item of oDataItem) {
								if (!map.has(item.ID_USER)) {
									map.set(item.ID_USER, true); // set any value to Map
									result.push({
										ID_USER: item.ID_USER,
										NAME_TEXT: item.NAME_TEXT
									});
								}
							}

							oModel.setProperty("/tableApprover", result);
							resolve();
						} else {
							resolve();
						}

					}.bind(this),
					error: function (error) {
						resolve();
					}
				});

				//	} else {
				//		resolve();
				//	}

			}.bind(this));
		},

		onInputWerksFormSelect: function (oEvent) {

			var oInput = oEvent.getSource();
			var oCenter = oInput.getSelectedKey();
			var oModel = this.getView().getModel("fixedOrderFormModel");
			
			// Limpar o depósito quando o centro for alterado
			oModel.setProperty("/HCP_LGORT", null);
			oModel.setProperty("/errorDeposit", false);

			if (this.checkIfWerksIsInUserProfile(oCenter)) {
				this._getCadenceRequired().then(function () {
					this._getDepositForWerks(oCenter).then(function () {
						this._getPriceTypeMaterial(oCenter).then(function () {
							this._validateForm();
						}.bind(this));
					}.bind(this));
				}.bind(this));
			} else {
				this._validateForm();
			}
		},

		_getGrainMaterial: function (oMaterial) {

			return new Promise(function (resolve, reject) {

				var oModelCommodities = this.getView().getModel();
				var oModel = this.getView().getModel("fixedOrderFormModel");
				var oData = oModel.oData;
				var aFilters = [];

				if (oData.checkActive == true) {

					if (oMaterial) {

						aFilters.push(new sap.ui.model.Filter({
							path: "MATNR",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oMaterial
						}));

						oModelCommodities.read("/Z041028", {

							filters: aFilters,
							success: function (results) {

								var aResults = results.results;

								if (aResults.length > 0) {
									oModel.setProperty("/checkMat", true);
								}

								resolve();

							}.bind(this),
							error: function (error) {
								resolve();
							}
						});

					} else {
						resolve();
					}

				} else {
					resolve();
				}

			}.bind(this));

		},

		_checkPrice: function (oEvent) {

			this._getPriceTypeMaterial().then(function () {
				this._validateForm();
			}.bind(this));

		},

		_getPriceTypeMaterial: function () {

			return new Promise(function (resolve, reject) {

				var oModelCommodities = this.getView().getModel();
				var oModel = this.getView().getModel("fixedOrderFormModel");
				var oData = oModel.oData;
				var aFilters = [];
				var oErrorMaterial = oData.errorMaterial;
				var oTpCereal = oData.HCP_TPCEREAL;

				oModel.setProperty("/matCereal", false);
				oModel.setProperty("/HCP_TPCEREAL", null);

				if (oData.checkActive === true && oData.checkPreco === true &&
					oData.checkCereal === true && oData.checkMat === true) {

					oModel.setProperty("/matCereal", true);
					oModel.setProperty("/HCP_TPCEREAL", oTpCereal);
					oModel.setProperty("/messageMaterial", null);
					oModel.setProperty("/errorMaterial", false);

					var aData = {
						HCP_EKGRP: oData.HCP_EKGRP,
						HCP_MATNR: oData.HCP_MATNR,
						HCP_WERKS: oData.HCP_WERKS,
						HCP_TPCEREAL: oData.HCP_TPCEREAL,
						HCP_ZDTREMDE: oData.HCP_ZDTREMDE
					};

					if (aData.HCP_EKGRP && aData.HCP_MATNR && aData.HCP_WERKS && aData.HCP_TPCEREAL && aData.HCP_ZDTREMDE) {

						var oDay = new Date().getUTCDate();
						if (oDay < 10) {
							oDay = "0" + oDay;
						}

						var oMonth = new Date().getMonth() + 1;
						if (oMonth < 10) {
							oMonth = "0" + oMonth;
						} else {
							oMonth = oMonth.toString();
						}

						var oDatum = new Date().getFullYear() + oMonth + oDay;

						var oYear = aData.HCP_ZDTREMDE.getFullYear();

						oMonth = (aData.HCP_ZDTREMDE.getMonth()) + 1;
						if (oMonth < 10) {
							oMonth = "0" + oMonth;
						} else {
							oMonth = oMonth.toString();
						}

						var oVigencia = "VIGENCIA_" + oMonth;

						aFilters.push(new sap.ui.model.Filter({
							path: "EKGRP",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: aData.HCP_EKGRP
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: "MATNR",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: aData.HCP_MATNR
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: 'WERKS',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: aData.HCP_WERKS
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: 'TPCEREAL',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: aData.HCP_TPCEREAL
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: oVigencia,
							operator: sap.ui.model.FilterOperator.GE,
							value1: oDatum
						}));

						aFilters.push(new sap.ui.model.Filter({
							path: "FND_YEAR",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oYear
						}));

						oModelCommodities.read("/Table_Price", {

							filters: aFilters,
							success: function (results) {

								var aResults = results.results;

								if (aResults.length > 0) {

									var oPreco_ = "PRECO_" + oMonth;
									var oNetwr = aResults[0][oPreco_];
									oModel.setProperty("/PRICE_NETWR", oNetwr);

									this._calculatePriceMaterial().then(function () {
										resolve();
									}.bind(this));

								} else {

									var oMatnr = parseFloat(aData.HCP_MATNR);
									var oMessage = this.resourceBundle.getText("messageMaterialPrice") + " " + oMatnr + " " + this.resourceBundle.getText(
										"messageNotRegistered");

									MessageBox.error(

										oMessage, {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												if (sAction === "OK") {
													this.closeBusyDialog();
												}
											}.bind(this)
										}
									);

									oModel.setProperty("/messageMaterial", oMessage);
									oModel.setProperty("/errorMaterial", true);

									resolve();

								}

							}.bind(this),
							error: function (error) {
								resolve();
							}
						});

					} else {
						resolve();
					}

				} else {
					
					if(oData.checkCereal === true){
						oModel.setProperty("/matCereal", true);
					}else{
						oModel.setProperty("/matCereal", false);
					}
					oModel.setProperty("/PRICE_NETWR", 0);
					oModel.setProperty("/HCP_JUST_PRECO", null);
					oModel.setProperty("/errorPrice", false);
					oModel.setProperty("/justPreco", false);
					resolve();
				}

			}.bind(this));
		},

		_onInputCalcutatePriceMaterial: function () {

			this._calculatePriceMaterial().then(function () {
				this._validateForm();
			}.bind(this));

		},

		_calculatePriceMaterial: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel("fixedOrderFormModel");
				var oData = oModel.oData;
				var oPriceNetwr = parseFloat(oData.PRICE_NETWR);
				var oErrorPrice = oData.errorPrice;

				oModel.setProperty("/errorPrice", false);
				oModel.setProperty("/justPreco", false);

				if (oData.HCP_ZFRETE && oData.HCP_NETWR && oPriceNetwr > 0) {

					oData.HCP_FRETE_PREV = parseFloat(oData.HCP_FRETE_PREV);
					oData.HCP_MENGE = parseFloat(oData.HCP_MENGE);
					oData.HCP_ZICMS = parseFloat(oData.HCP_ZICMS);
					oData.HCP_NETWR = parseFloat(oData.HCP_NETWR);

					if (oData.HCP_ZFRETE == "FOB") {

						if (oData.HCP_FRETE_PREV) {
							var oValue;
							if (oData.HCP_ZMEINS == "SC") {
								if (oData.HCP_ZICMS) {
									oValue = oData.HCP_NETWR - (oData.HCP_NETWR * (oData.HCP_ZICMS / 100)) + (oData.HCP_FRETE_PREV / 16.677);
								} else {
									oValue = oData.HCP_NETWR + (oData.HCP_FRETE_PREV / 16.677);
								}

							} else {
								if (oData.HCP_ZICMS) {
									oValue = oData.HCP_NETWR - (oData.HCP_NETWR * (oData.HCP_ZICMS / 100)) + oData.HCP_FRETE_PREV;
								} else {
									oValue = oData.HCP_NETWR + oData.HCP_FRETE_PREV;
								}

							}

						}
					} else {

						if (oData.HCP_ZICMS) {
							oValue = oData.HCP_NETWR - (oData.HCP_NETWR * (oData.HCP_ZICMS / 100));
						} else {
							oValue = oData.HCP_NETWR;
						}

					}

					if (oValue > oPriceNetwr) {

						oModel.setProperty("/errorPrice", true);
						oModel.setProperty("/justPreco", true);
						resolve();

					} else {
						oModel.setProperty("/HCP_JUST_PRECO", null);
						oModel.setProperty("/errorPrice", false);
						oModel.setProperty("/justPreco", false);
						resolve();
					}

				} else {
					resolve();
				}

			}.bind(this));

		},

		_calculateTotalValue: function () {

			var oModel = this.getView().getModel("fixedOrderFormModel");
			var oData = oModel.oData;
			if (oData.HCP_UNIQUE_KEY_OFFER && oData.HCP_MEINS && oData.HCP_MENGE) {

				if (oData.HCP_MEINS != "TO") {
					if (oData.HCP_MEINS == "KG") {
						var oMengeOffer = oData.HCP_MENGE / 1000;
					} else {
						oMengeOffer = oData.HCP_MENGE * 0.06;
					}
				} else {
					oMengeOffer = oData.HCP_MENGE;
				}

				oModel.setProperty("/HCP_MENGE_OFFER", oMengeOffer);

				if (oMengeOffer > this.oMengeDispOffer) {
					oModel.setProperty("/errorMenge", true);
				} else {
					oModel.setProperty("/errorMenge", false);
				}
			}

			if (oData.HCP_MENGE && oData.HCP_MEINS && oData.HCP_NETWR && oData.HCP_ZMEINS) {

				if (oData.HCP_MEINS == oData.HCP_ZMEINS) {
					oData.HCP_VALOR_TOTAL = oData.HCP_MENGE * oData.HCP_NETWR;
				} else {

					if (oData.HCP_MEINS == "KG") {

						if (oData.HCP_ZMEINS == "TO") {
							oData.HCP_VALOR_TOTAL = oData.HCP_MENGE / 1000 * oData.HCP_NETWR;
						} else {
							oData.HCP_VALOR_TOTAL = oData.HCP_MENGE / 60 * oData.HCP_NETWR;
						}

					} else if (oData.HCP_MEINS == "TO") {

						if (oData.HCP_ZMEINS == "KG") {
							oData.HCP_VALOR_TOTAL = oData.HCP_MENGE * 1000 * oData.HCP_NETWR;
						} else {
							oData.HCP_VALOR_TOTAL = oData.HCP_MENGE / 0.06 * oData.HCP_NETWR;
						}

					} else { //SC

						if (oData.HCP_ZMEINS == "KG") {
							oData.HCP_VALOR_TOTAL = oData.HCP_MENGE * 60 * oData.HCP_NETWR;
						} else {
							oData.HCP_VALOR_TOTAL = oData.HCP_MENGE * 0.06 * oData.HCP_NETWR;
						}

					}

				}

			} else {
				oData.HCP_VALOR_TOTAL = 0;
			}

			if (oData.HCP_MENGE && oData.tableCadence.length > 0) {
				oModel.setProperty("/enabledCadence", true);
			} else {
				oModel.setProperty("/enabledCadence", false);
			}

			this._calculatePriceMaterial().then(function () {
				this._validateForm();
			}.bind(this));

		},

		_onDateCreateRangeSelectionChange: function (oEvent) {

			var oSource = oEvent.getSource();
			var oModel = this.getView().getModel("fixedOrderFormModel");
			var oData = oModel.oData;
			var oDateFrom = oEvent.getParameter("from");
			var oDateTo = oEvent.getParameter("to");

			oSource.setValueState("None");
			oSource.setValueStateText("");

			oModel.setProperty("/HCP_ZDTREMDE", null);
			oModel.setProperty("/HCP_ZDTREMATE", null);
			oModel.setProperty("/visibleCadence", false);
			oModel.setProperty("/messageCadence", null);

			if (oEvent.getParameter("from") != null) {

				if (oEvent.mParameters.valid === false) {
					oSource.setValueState("Error");
					oSource.setValueStateText(this.resourceBundle.getText("errorDateInvalid"));
				} else {

					var oDateToday = new Date();
					oDateToday.setHours(10);

					oDateFrom = new Date(oEvent.getParameter("from").setHours(12));

					if (oEvent.mParameters.to === null) {
						var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
						oMainDataForm[49].setTo(oDateFrom);
					} else {

						oDateTo = new Date(oEvent.getParameter("to").setHours(12));

						var oMonthFrom = oDateFrom.getMonth();
						var oMonthTo = oDateTo.getMonth();

						if (oMonthFrom !== oMonthTo) {
							oSource.setValueState("Error");
							oSource.setValueStateText(this.resourceBundle.getText("errorDateSameMonth"));
						} else {
							oModel.setProperty("/HCP_ZDTREMDE", oDateFrom);
							oModel.setProperty("/HCP_ZDTREMATE", oDateTo);
						}

					}

				}

				if (oSource.getValueState() === "None" && oData.errorShipment == false) {

					if (oData.HCP_MENGE > 0) {
						oModel.setProperty("/enabledCadence", true);
					}

					if (oData.flagCadence === true) {
						oModel.setProperty("/visibleCadence", true);
						oModel.setProperty("/messageCadence", this.resourceBundle.getText("messageNotCadence"));
						oModel.setProperty("/cadence", false);
					} else {
						oModel.setProperty("/visibleCadence", false);
						oModel.setProperty("/cadence", true);
					}

					oModel.setProperty("/tableCadence", []);

					var oTableCadence = oData.tableCadence;
					var oDataItem = oModel.getProperty("/tableCadence");

					var oDatum = oData.HCP_ZDTREMDE;
					var oDay = oData.HCP_ZDTREMDE.getUTCDate();
					var oMonth = oData.HCP_ZDTREMDE.getMonth();
					var oYear = oData.HCP_ZDTREMDE.getFullYear();
					var oRangeDate = true;
					var oDataAte = new Date(oData.HCP_ZDTREMATE);
					oDataAte.setHours(12);

					while (oRangeDate === true) {

						if (oDatum > oDataAte) {
							oRangeDate = false;
						} else {

							var aData = {
								HCP_DATA_ATUAL: oDatum,
								HCP_QUANTIDADE: null
							};

							oDataItem.push(aData);
							oDay = oDay + 1;
							oDatum = new Date(oYear, oMonth, oDay);
							oDatum.setHours(12);

						}
					}

					oModel.setProperty("/tableCadence", oDataItem);

				} else {
					oModel.setProperty("/tableCadence", []);
					oModel.setProperty("/enabledCadence", false);
				}

			} else {
				oModel.setProperty("/tableCadence", []);
				oModel.setProperty("/enabledCadence", false);
			}

			this._getPriceTypeMaterial().then(function () {
				this._validateForm();
			}.bind(this));

		},

		onCadencePress: function () {

			var oModel = this.getView().getModel("fixedOrderFormModel");
			var oData = oModel.oData;
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if (!this._FragmentCadence) {
				this._FragmentCadence = sap.ui.xmlfragment("cadenceEditFixedId" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.cadence.fragment.ModalCadence",
					this);

				this.getView().addDependent(this._FragmentCadence);

			}

			var oCopiedData = JSON.parse(JSON.stringify(oData.tableCadence));

			for (var data of oCopiedData) {
				data.HCP_DATA_ATUAL = new Date(data.HCP_DATA_ATUAL);
			}

			if (oData.HCP_MENGE) {
				this.total = oData.HCP_MENGE;
				this.enableCalcule = true;
			} else {
				this.total = 0;
				this.enableCalcule = false;
			}

			var oModelCadence;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				oModelCadence = new JSONModel({
					enabledConfCadence: false,
					tableCadence: oCopiedData,
					enableHeader: false,
					enableColumn: false,
					maxValue: false,
					minValue: false,
					valorTotal: parseFloat(this.total).toFixed(),
					valorRestante: parseFloat(0).toFixed(),
					ItemCadence: oCopiedData,
					isSelected: false,
					count: oCopiedData.length,
					enableAction: true,
					modeSelect: "MultiSelect"
				});
			} else {
				oModelCadence = new JSONModel({
					enabledConfCadence: false,
					tableCadence: oCopiedData,
					enableHeader: false,
					enableColumn: false,
					maxValue: false,
					minValue: false,
					valorTotal: parseFloat(this.total).toFixed(),
					valorRestante: parseFloat(0).toFixed(),
					ItemCadence: oCopiedData,
					isSelected: false,
					count: oCopiedData.length,
					enableAction: false,
					modeSelect: "None"

				});
			}

			this.getView().setModel(oModelCadence, "cadenceFormModel");

			this._FragmentCadence.open();

			oModel.refresh();

		},

		_calculateCadence: function () {

			var tableModel = this.getView().getModel("cadenceFormModel");
			var totalPedido = parseFloat(tableModel.oData.valorTotal).toFixed(2);
			var valoresNaoSelecionados = parseFloat(0.00).toFixed(2);
			var valoresSelecionados = parseFloat(0.00).toFixed(2);
			var totalDividido = totalPedido / this.cadenceSelected.length;

			return new Promise(function (resolve, reject) {

				var oTable = sap.ui.core.Fragment.byId("cadenceEditFixedId" + this.getView().getId(), "tableCadencia");
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

		_onCadenceCancelPress: function (oEvent) {

			var oCancelModel = this.getView().getModel("cadenceFormModel");
			var oData = oCancelModel.oData;

			oCancelModel.setProperty("/enabledConfCadence", false);

			for (var i = 0; i < oData.tableCadence.length; i++) {

				oData.tableCadence[i].HCP_QUANTIDADE = null;
			}

			oEvent.getSource().getParent().close();
		},

		_onCadenceConfirPress: function (oEvent) {

			var oModel = this.getView().getModel("fixedOrderFormModel");
			var oCadencelModel = this.getView().getModel("cadenceFormModel");
			var oTableCadence = oCadencelModel.oData.tableCadence;

			oModel.setProperty("/tableCadence", oTableCadence);
			oModel.setProperty("/cadence", true);
			oModel.setProperty("/visibleCadence", false);
			oModel.setProperty("/messageCadence", null);

			oEvent.getSource().getParent().close();

			this._validateForm();
		},

		onSelectionChange: function (oEvent) {

			return new Promise(function (resolve, reject) {

				var oTable = sap.ui.core.Fragment.byId("cadenceEditFixedId" + this.getView().getId(), "tableCadencia");
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
						}
						/*else {
							var fieldNotSelected = tableModel.getProperty(itemArray[i].getBindingContext("cadenceFormModel").getPath());
							fieldNotSelected.HCP_QUANTIDADE = 0;
						}*/
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

		_changeValueCadence: function (oEvent) {

			return new Promise(function (resolve, reject) {
				var oSource = oEvent.getSource();
				var oValue = oSource.getValue();
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

				if (oValue == null || oValue == 0) {

					for (var i = 0; i < tableModel.oData.tableCadence.length; i++) {

						if (tableModel.oData.tableCadence[i].HCP_QUANTIDADE <= 0 || tableModel.oData.tableCadence[i].HCP_QUANTIDADE == null) {
							tableModel.setProperty("/enabledConfCadence", false);
						} else {
							tableModel.setProperty("/maxValue", false);
							tableModel.setProperty("/enabledConfCadence", true);
							return;
						}
					}

				} else {

					for (var i = 0; i < tableModel.oData.ItemCadence.length; i++) {

						if (!tableModel.oData.ItemCadence[i].HCP_QUANTIDADE) {
							tableModel.oData.ItemCadence[i].HCP_QUANTIDADE = 0;
						}

						aPromises.push(new Promise(function (resolves, reject) {
							totalCadencia = Number(totalCadencia) + Number(parseFloat(tableModel.oData.ItemCadence[i].HCP_QUANTIDADE).toFixed(2));
							resolves();
						}.bind(this)));

					}

					Promise.all(aPromises).then(function () {
						resolve();
						this.verifyTotal(totalCadencia, totalPedido, tableModel.oData.ItemCadence[0].HCP_DATA_ATUAL);

						if (this.cadenceSelected.length > 0) {
							tableModel.setProperty("/isSelected", true);
						} else {
							tableModel.setProperty("/isSelected", false);
						}
					}.bind(this));

				}

			}.bind(this));

		},

		verifyTotal: function (valorTotal, totalPedido) {

			var tableModel = this.getView().getModel("cadenceFormModel");
			tableModel.oData.maxValue = false;
			tableModel.oData.minValue = false;

			if (valorTotal > totalPedido) {
				tableModel.oData.maxValue = true;
				tableModel.oData.isEnable = false;
				tableModel.oData.enabledConfCadence = false;
			} else if (valorTotal == totalPedido) {
				tableModel.oData.maxValue = false;
				tableModel.oData.isEnable = true;
				tableModel.oData.enabledConfCadence = true;
			} else {
				var valor = totalPedido - valorTotal;
				tableModel.oData.valorRestante = parseFloat(valor).toFixed(2);
				tableModel.oData.minValue = true;
				tableModel.oData.isEnable = true;
				tableModel.oData.enabledConfCadence = true;
			}

		},

		_onInputFixedDate: function (oEvent) {
		    var oSource = oEvent.getSource();
		    var oModel = this.getView().getModel("fixedOrderFormModel");
		    if (oSource.getSelected() === false) {
		        // Quando desmarcar a opção, limpar campos de data
		        oModel.setProperty("/fixedDate", true);
		        oModel.setProperty("/visibleFixedDate", false);
		        
		        // Limpar os campos de data
		        oModel.setProperty("/HCP_ZDTPGTO1", null);
		        oModel.setProperty("/HCP_ZDTPGTO2", null);
		        oModel.setProperty("/HCP_ZDTPGTO3", null);
		        
		        // Limpar também os controles de data na view, se existirem
		        var oDateInput1 = this.getView().byId("idDateInput1");
		        var oDateInput2 = this.getView().byId("idDateInput2");
		        var oDateInput3 = this.getView().byId("idDateInput3");
		        
		        if (oDateInput1) {
		            oDateInput1.setValue("");
		            oDateInput1.setDateValue(null);
		            oDateInput1.setValueState("None");
		        }
		        
		        if (oDateInput2) {
		            oDateInput2.setValue("");
		            oDateInput2.setDateValue(null);
		            oDateInput2.setValueState("None");
		        }
		        
		        if (oDateInput3) {
		            oDateInput3.setValue("");
		            oDateInput3.setDateValue(null);
		            oDateInput3.setValueState("None");
		        }
		    } else {
		        oModel.setProperty("/visibleFixedDate", true);
		        oModel.setProperty("/fixedDate", false);
		    }
		    this._validateForm();
		},
		
		_onInputPaymentDate1FormSelect: function (oEvent) {
		    var oSource = oEvent.getSource();
		    var oModel = this.getView().getModel("fixedOrderFormModel");
		    var oData = oModel.oData;
		    var oErro = false;
		    oSource.setValueState("None");
		    oSource.setValueStateText("");
		    
		     // Obter ID do fornecedor atual
		     var supplierID = oData.HCP_LIFNR;
		     
		     if (!supplierID) {
	     		sap.m.MessageBox.error("Selecione um Fornecedor");
		        oSource.setDateValue(null);
		        oSource.setValueState("Error");
		        oSource.setValueStateText("Selecione um fornecedor");
		        oModel.setProperty("/enabledConfirm", false);
		     }
		    
		    if (oSource.getDateValue()) {
		        var oSplit = oSource.mProperties.value.split('/');
		        if (oSplit.length == 3) {
		            var oDateToday = new Date();
		            oDateToday.setHours(10);
		            var oInputDate = new Date(oSplit[2].substr(0, 4), oSplit[1] - 1, oSplit[0]).setHours(12);
		            if (oInputDate && oInputDate < oDateToday) {
		                oSource.setValueState("Error");
		                oSource.setValueStateText(this.resourceBundle.getText("errorDateCurrentDate"));
		                oErro = true;
		            } else {
	                    this.verifyFixedDateViewSuppliers(supplierID, oSource.getDateValue())
	                        .then(function(isValid) {
	                            // Se a validação passar, continua o processamento
	                            oSource.setValueState("None");
	                        })
	                        .catch(function(error) {
	                            // Se a validação falhar, mostra erro no campo
	                            oSource.setValueState("Error");
	                            oSource.setValueStateText(error);
	                            oErro = true;
	                            oModel.setProperty("/enabledConfirm", false);
	                            this._validateForm();
	                        }.bind(this));
		            }
		        } else {
		            oSource.setValueState("Error");
		            oSource.setValueStateText(this.resourceBundle.getText("errorDateInvalid"));
		            oErro = true;
		        }
		    }
		    this._validateForm();
		},

		_onInputPaymentDateFormSelect: function (oEvent) {

			var oSource = oEvent.getSource();
			var oModel = this.getView().getModel("fixedOrderFormModel");
			var oData = oModel.oData;
			var oErro = false;

			oSource.setValueState("None");
			oSource.setValueStateText("");

			if (oSource.getDateValue()) {

				var oSplit = oSource.mProperties.value.split('/');
				if (oSplit.length == 3) {

					var oDateToday = new Date();
					oDateToday.setHours(10);
					var oInputDate = new Date(oSplit[2].substr(0, 4), oSplit[1] - 1, oSplit[0]).setHours(12);

					if (oInputDate && oInputDate < oDateToday) {
						oSource.setValueState("Error");
						oSource.setValueStateText(this.resourceBundle.getText("errorDateCurrentDate"));
						oErro = true;
					}

				} else {
					oSource.setValueState("Error");
					oSource.setValueStateText(this.resourceBundle.getText("errorDateInvalid"));
					oErro = true;
				}

			}

			this._validateForm();

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

		onCancelPress: function () {

			var oEditModel = this.getView().getModel("fixedOrderFormModel");
			var oData = oEditModel.oData;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

			if (oData.edit) {
				MessageBox.warning(
					this.resourceBundle.getText("questionGoBack"), {
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "YES") {
								oEditModel.setProperty("/", []);
								this.navBack();
							}
						}.bind(this)
					}
				);
			} else {
				this.navBack();
			}

		},

		navBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oModel = this.getView().getModel("fixedOrderFormModel");

			oModel.setProperty("/", []);

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}

		},

		_validateForm: function () {
			var oFilterModel = this.getView().getModel("fixedOrderFormModel");
			var oData = oFilterModel.oData;

			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;

				oFilterModel.setProperty("/edit", true);

				if (oData.errorMaterial === false && oData.cadence === true && oData.errorMenge === false && oData.errorShipment === false && oData.errorDeposit === false) {

					for (var m = 0; m < aInputControls.length; m++) {
						oControl = aInputControls[m].control;
						if (aInputControls[m].required && oControl.getVisible()) {
							var oInputId = aInputControls[m].control.getMetadata();

							if (oInputId.getName() === "sap.m.Input" || oInputId.getName() === "sap.m.TextArea" ||
								oInputId.getName() === "sap.m.DatePicker") {
								var sValue = oControl.getValue();
							} else {
								sValue = oControl.getSelectedKey();
							}

							if (sValue.length > 0 && oControl.getValueState() !== "Error") {
								// if (oControl.mProperties.name === "HCP_MENGE" || oControl.mProperties.name === "HCP_NETWR" ||
								// 	oControl.mProperties.name === "HCP_ZICMS" || oControl.mProperties.name === "HCP_FRETE_PREV") {
								if (oControl.mProperties.name === "HCP_MENGE" || oControl.mProperties.name === "HCP_NETWR" || oControl.mProperties.name ===
									"HCP_FRETE_PREV" || oControl.mProperties.name === "HCP_BWERT" || oControl.mProperties.name === "HCP_ZZPREMIO_CEREAL" ||
									oControl.mProperties.name === "HCP_ZZCAMBIO") {

									var aValue = parseFloat(sValue);
									if (aValue > 0) {
										oFilterModel.setProperty("/enabledConfirm", true);
									} else {
										oFilterModel.setProperty("/enabledConfirm", false);
										return;
									}

								} else {
									oFilterModel.setProperty("/enabledConfirm", true);
								}

							} else {
								oFilterModel.setProperty("/enabledConfirm", false);
								return;
							}
						}
					}
				} else {
					oFilterModel.setProperty("/enabledConfirm", false);
				}

			}.bind(this), 100);
		},

		_getFormFields: function () {
			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var aControls = [];
			var sControlType;

			for (var i = 0; i < oMainDataForm.length; i++) {
				var sControlType1 = oMainDataForm[i].getMetadata().getName();
				if (sControlType1 === "sap.m.Label") {
					if (sControlType = oMainDataForm[i + 1]) {
						sControlType = oMainDataForm[i + 1].getMetadata().getName();
						if (sControlType === "sap.m.Input" || sControlType === "sap.m.ComboBox" || sControlType === "sap.m.DatePicker" ||
							sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" ||
							sControlType === "sap.m.DatePicker" || sControlType === "sap.m.TextArea") {
							aControls.push({
								control: oMainDataForm[i + 1],
								required: oMainDataForm[i].getRequired(),
								text: oMainDataForm[i].getText()
							});
						}
					}

				}
			}
			return aControls;
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

		backToIndex: function () {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//oRouter.navTo("commodities.Index", true);
			oRouter.navTo("offerMap.FilterOfferMap", true);

		},

		_handlePartnerFilterPress: function (oEvent) {
			var oFilterBar;
			if (!this.oPartnerFilter || this.oPartnerFilter.bIsDestroyed) {
				this.oPartnerFilter = sap.ui.xmlfragment("partnerFilterID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.commodities.fragments.PartnerFilter", this);
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

		onPartnerSelected: function (oEvent) {
		    var oSource = oEvent.getSource();
		    var oModel = this.getView().getModel("fixedOrderFormModel");
		    var oData = oModel.getProperty("/");
		    var SelectedPartner = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());
		    oData["HCP_LIFNR"] = SelectedPartner.LIFNR;
		    oData["PROVIDER_DESC"] = SelectedPartner.NAME1;
		    if (SelectedPartner.KTOKK === "F3") {
		        oData["HCP_ZTPNF"] = '1';
		    } else {
		        oData["HCP_ZTPNF"] = '2';
		    }
		    
		    // Limpar campos de data fixa ao mudar de fornecedor
		    oData["HCP_ZDTPGTO1"] = null;
		    oData["HCP_ZDTPGTO2"] = null;
		    oData["HCP_ZDTPGTO3"] = null;
		    
		    // Limpar também os controles de data na view, se existirem
		    var oDateInput1 = this.getView().byId("idDateInput1");
		    var oDateInput2 = this.getView().byId("idDateInput2");
		    var oDateInput3 = this.getView().byId("idDateInput3");
		    
		    if (oDateInput1) {
		        oDateInput1.setValue("");
		        oDateInput1.setDateValue(null);
		        oDateInput1.setValueState("None");
		    }
		    
		    if (oDateInput2) {
		        oDateInput2.setValue("");
		        oDateInput2.setDateValue(null);
		        oDateInput2.setValueState("None");
		    }
		    
		    if (oDateInput3) {
		        oDateInput3.setValue("");
		        oDateInput3.setDateValue(null);
		        oDateInput3.setValueState("None");
		    }
		    
		    oModel.refresh();
		    this.oPartnerFilter.destroy();
		    this._validateForm();
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

		onPartnerDialogClose: function () {
			this.oPartnerFilter.close();
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

		generateUniqueKey: function () {
			return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
				(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
			);
		},

		onOrderStatusPress: function (oEvent) {

			var oModel = this.getView().getModel("fixedOrderFormModel");
			var oData = oModel.oData;

			if (!this._FragmentOrderStatus) {
				this._FragmentOrderStatus = sap.ui.xmlfragment("orderStatusID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.commodities.fragments.OrderStatus",
					this);

				this.getView().addDependent(this._FragmentOrderStatus);
			}

			if (oData.HCP_Z5110_ZSTATUS == "1") {
				var oStatus = this.resourceBundle.getText("textRequestCreated");
			} else if (oData.HCP_Z5110_ZSTATUS == "2") {
				oStatus = this.resourceBundle.getText("textPcEffected");
			} else if (oData.HCP_Z5110_ZSTATUS == "3") {
				oStatus = this.resourceBundle.getText("textReversed");
			}

			if (oData.HCP_Z5110_ZCRDAT) {
				var oHour = oData.HCP_Z5110_ZCRHOR;
				var oDateCR = new Date(oData.HCP_Z5110_ZCRDAT.substr(0, 4), oData.HCP_Z5110_ZCRDAT.substr(5, 2), oData.HCP_Z5110_ZCRDAT.substr(8,
					2));
				oDateCR.setHours(oHour.substr(0, 2), oHour.substr(2, 2), oHour.substr(4, 2), 0);
			}

			if (oData.HCP_Z5110_ZPCXDAT) {
				oHour = oData.HCP_Z5110_ZPCHOR;
				var oDateCX = new Date(oData.HCP_Z5110_ZPCXDAT.substr(0, 4), oData.HCP_Z5110_ZPCXDAT.substr(5, 2), oData.HCP_Z5110_ZPCXDAT.substr(
					8, 2));
				oDateCX.setHours(oHour.substr(0, 2), oHour.substr(2, 2), oHour.substr(4, 2), 0);
			}

			if (oData.HCP_Z5110_ZESTDAT) {
				oHour = oData.HCP_Z5110_ZESTHOR;
				var oDateES = new Date(oData.HCP_Z5110_ZESTDAT.substr(0, 4), oData.HCP_Z5110_ZESTDAT.substr(5, 2), oData.HCP_Z5110_ZESTDAT.substr(
					8, 2));
				oDateES.setHours(oHour.substr(0, 2), oHour.substr(2, 2), oHour.substr(4, 2), 0);

			}

			if (oData.HCP_Z5110_ZAPDAT) {
				oHour = oData.HCP_Z5110_ZAPHOR;
				var oDateAP = new Date(oData.HCP_Z5110_ZAPDAT.substr(0, 4), oData.HCP_Z5110_ZAPDAT.substr(5, 2), oData.HCP_Z5110_ZAPDAT.substr(8,
					2));
				oDateAP.setHours(oHour.substr(0, 2), oHour.substr(2, 2), oHour.substr(4, 2), 0);

			}

			var oModelOrderStatus = new JSONModel({
				HCP_Z5110_EBELN: oData.HCP_Z5110_EBELN,
				HCP_Z5110_EBELP: oData.HCP_Z5110_EBELP,
				HCP_Z5110_ZSTATUS: oStatus,
				HCP_ZCRDAT: oDateCR,
				HCP_Z5110_ERNAM: oData.HCP_Z5110_ERNAM,
				HCP_ZPCXDAT: oDateCX,
				HCP_Z5110_ZERNAM: oData.HCP_Z5110_ZERNAM,
				HCP_ZESTDAT: oDateES,
				HCP_Z5110_ZESTERN: oData.HCP_Z5110_ZESTERN,
				HCP_ZAPDAT: oDateAP,
				HCP_Z5110_ZAPERN: oData.HCP_Z5110_ZAPERN
			});

			this.getView().setModel(oModelOrderStatus, "orderStatusFormModel");

			this._FragmentOrderStatus.open();

		},

		_onOkOrderStatusPress: function (oEvent) {

			oEvent.getSource().getParent().close();

		},

		onMessagePress: function (oEvent) {

			var oTableModel = this.getView().getModel("fixedOrderFormModel");
			var oDataTable = oTableModel.oData;
			var oEntity = oDataTable.entity;
			var oItem = oEvent.getSource();

			this.sPath = this.buildEntityPath(oEntity, oDataTable);

			this.getMessageEcc(oDataTable.HCP_UNIQUE_KEY).then(function () {

				if (oDataTable.itemMessages.length > 0) {

					if (!this._FragmentMessageLog) {
						this._FragmentMessageLog = sap.ui.xmlfragment("messageID" + this.getView().getId(),
							"com.sap.build.standard.brfAppDeGraosModoEditar.view.commodities.fragments.LogMessage",
							this);

						this.getView().addDependent(this._FragmentMessageLog);
					}

					var oModelMessageLog = new JSONModel({
						tableMessage: oDataTable.itemMessages
					});

					this.getView().setModel(oModelMessageLog, "messageLogFormModel");

					this._FragmentMessageLog.open();
				}

			}.bind(this));

		},

		getMessageEcc: function (oUniqueKey) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel("fixedOrderFormModel");
				var oModelCommodities = this.getView().getModel();
				var aFilters = [];

				oModel.setProperty("/itemMessages", []);

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oUniqueKey
				}));

				oModelCommodities.read("/Commodities_Log_Messages", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;
						var oDataItem = oModel.getProperty("/itemMessages");

						if (aResults.length) {

							for (var i = 0; i < aResults.length; i++) {

								if (aResults[i].HCP_MSGTYP == "S") {
									var aIcon = "sap-icon://message-success";
								} else if (aResults[i].hcpMstyp == "E") {
									aIcon = "sap-icon://message-error";
								} else {
									aIcon = "sap-icon://message-information";
								}

								var aData = {
									HCP_MSGTYP: aResults[i].HCP_MSGTYP,
									ICON: aIcon,
									HCP_MESSAGE: aResults[i].HCP_MESSAGE
								};

								oDataItem.push(aData);

							}

							oModel.setProperty("/itemMessages", oDataItem);
							resolve();

						} else {
							MessageBox.information(
								this.resourceBundle.getText("messageNotMessage"), {
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function (sAction) {
										resolve();
									}.bind(this)
								}
							);

						}

					}.bind(this),
					error: function (error) {
						reject(error);
					}
				});

			}.bind(this));

		},

		deleteCadence: function (aUniqueKey) {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel("fixedOrderFormModel");
				var oData = oModel.oData;
				var oModelCommodities = this.getView().getModel();
				oModelCommodities.setUseBatch(true);
				var aDeferredGroups = oModelCommodities.getDeferredGroups();
				var sPath;
				var aFilters = [];

				// if (oData.processado === false) { //Pendente

				if (aDeferredGroups.indexOf("removes") < 0) {
					aDeferredGroups.push("removes");
					oModelCommodities.setDeferredGroups(aDeferredGroups);
				}

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.HCP_UNIQUE_KEY
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_TIPO",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "1"
				}));

				oModelCommodities.read("/Cadence", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;

						if (aResults.length > 0) {

							for (var i = 0; i < aResults.length; i++) {

								sPath = this.buildEntityPath("Cadence", aResults[i], "HCP_CADENCE_ID");

								oModelCommodities.remove(sPath, {
									groupId: "removes"
								});

							}

							oModelCommodities.submitChanges({
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

				// } else {
				// 	resolve();
				// }
			}.bind(this));

		},

		_formatterDateRange: function (date) {
			let data = new Date(date);

			let dataFormatada = data.toLocaleDateString("pt-BR", {
				timeZone: "America/Sao_Paulo"
			});

			let dataFormatadaString = `${dataFormatada.substring(0,2)}/${dataFormatada.substring(3,5)}/${dataFormatada.substring(6,10)}`;

			return dataFormatadaString;
		},

		// _calculateRangeData: function (data) {
		// 	const mes = data.getMonth();
		// 	const anoFull = data.getFullYear();
		// 	const ano = anoFull % 100;
		// 	let safraYear;

		// 	if (mes < 4)
		// 		safraYear = (ano - 1 + "/" + ano);
		// 	else if (mes > 3 && mes < 9)
		// 		safraYear = (ano + "/" + ano);
		// 	else if (mes > 8)
		// 		safraYear = (ano + "/" + parseInt(ano + 1))

		// 	return safraYear;
		// },

		_calculateCommercializationMaterial: async function (oProperties) {
			var oModel = this.getOwnerComponent().getModel();
			var aFilters = [];
			let convertMengeToTon;
			let productionTotal, qtdeBuying, percentageBuying, remainingVolume;
			let VisitType = "Compra de Commodities";

			let sCounter = 0;
			var sTimestamp = new Date().getTime() + sCounter;
			sCounter = sCounter + 1;

			let cropDesc;

			if (oProperties.HCP_MEINS == "SC") {
				const sacasToKg = Number(parseFloat(oProperties.HCP_MENGE)) * 60
				const kgToTons = sacasToKg / 1000
				convertMengeToTon = kgToTons
			}
			if (oProperties.HCP_MEINS == "KG") {
				const kgToTons = Number(parseFloat(oProperties.HCP_MENGE)) / 1000
				convertMengeToTon = kgToTons
			}
			if (oProperties.HCP_MEINS == "TO") {
				convertMengeToTon = Number(parseFloat(oProperties.HCP_MENGE))
			}

			// let dateCropSelected = this._calculateRangeData(oProperties.HCP_ZDTREMDE)
			// let dateCurrentCrop = this._calculateRangeData(new Date())

			let oFilters = [];

			oFilters.push(new sap.ui.model.Filter("HCP_RANGE_START", sap.ui.model.FilterOperator
				.LE, new Date(oProperties.HCP_ZDTREMDE)));

			oFilters.push(new sap.ui.model.Filter("HCP_RANGE_END", sap.ui.model.FilterOperator
				.GE, new Date(oProperties.HCP_ZDTREMDE)));

			oFilters.push(new sap.ui.model.Filter("HCP_ACTIVE", sap.ui.model.FilterOperator
				.EQ, "1"));

			const getViewSuppliers = await new Promise((resolve, reject) => {
				oModel.read("/View_Grouping_Suppliers", {
					filters: [new sap.ui.model.Filter({
						path: "NAME1",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oProperties.PROVIDER_DESC
					})],
					success: function (results) {
						return resolve(results.results[0])
					}.bind(this),
					error: function (error) {
						return reject(MessageBox.error("Erro ao Buscar Fornecedor!"));
					}
				})
			})

			if (getViewSuppliers != undefined) {
				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_PROVIDER_ID",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: getViewSuppliers.LIFNR
				}));
			}

			const getSafraYear = await new Promise((resolve, reject) => {
				oModel.read("/Crop_Year", {
					filters: oFilters,
					sorters: [new sap.ui.model.Sorter("HCP_RANGE_START", false)],
					success: function (results) {
						return resolve(results.results[0])
					}.bind(this),
					error: function (error) {
						return reject(MessageBox.error("Erro ao Buscar Ano da Safra!"));
					}
				})
			})

			if (getSafraYear != undefined) {
				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_SAFRA_YEAR",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: getSafraYear.HCP_CROP_ID
				}));
				cropDesc = getSafraYear.HCP_CROP_DESC
			}

			const getVisitFormGrains = await new Promise((resolve, reject) => {
				oModel.read("/Visit_Form_Grains", {
					filters: [new sap.ui.model.Filter({
						path: "HCP_NAME_REGISTERED",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oProperties.PROVIDER_DESC
					})],
					sorters: [new sap.ui.model.Sorter("HCP_VISIT_ID", true)],
					success: function (results) {
						return resolve(results.results[0])
					}.bind(this),
					error: function (error) {
						return reject(MessageBox.error("Erro ao Buscar Ficha Periódica!"));
					}
				})
			})

			if (getVisitFormGrains != undefined) {
				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_PERIOD",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: getVisitFormGrains.HCP_PERIOD
				}));
			}

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_MATERIAL",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oProperties.HCP_MATNR
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_VISIT_TYPE",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: 'Grains'
			}));

			if (aFilters.length == 5) {
				const getMaterial = await new Promise((resolve, reject) => {
					oModel.read("/Visit_Form_Material", {
						filters: aFilters,
						sorters: [new sap.ui.model.Sorter("HCP_VISIT_ID", true)],
						success: function (results) {
							return resolve(results.results[0])
						}.bind(this),
						error: function (error) {
							return reject(MessageBox.error("Erro ao Buscar Material."))
						}
					});
				})

				if (getMaterial == undefined) {
					return false;
				}

				if (getMaterial != undefined) {
					let HCP_VOLUME = Number(getMaterial.HCP_VOLUME)
					if (getMaterial.HCP_VOLUME) {
						productionTotal = HCP_VOLUME.toFixed(0);
						qtdeBuying = (Number(convertMengeToTon) / HCP_VOLUME.toFixed(0)) * 100;
					}
					if (getMaterial.HCP_PERCENT_MARKETED) {
						percentageBuying = (Number(qtdeBuying) + Number(getMaterial.HCP_PERCENT_MARKETED))
					} else {
						getMaterial.HCP_PERCENT_MARKETED = 0
						percentageBuying = (Number(qtdeBuying) + Number(getMaterial.HCP_PERCENT_MARKETED))
					}
					if (getMaterial.HCP_NEGOTIATION_BALANCE) {
						remainingVolume = Number(getMaterial.HCP_NEGOTIATION_BALANCE) - Number(convertMengeToTon);
					}

					const propertiesMaterial = {
						HCP_COMMERCIALIZATION_ID: sTimestamp.toFixed(),
						HCP_PARTNER: oProperties.PROVIDER_DESC == null ? '' : oProperties.PROVIDER_DESC,
						HCP_TYPE_COMMERCIALIZATION: VisitType,
						HCP_CREATED_AT: new Date(),
						HCP_CREATED_BY: oProperties.HCP_CREATED_BY,
						HCP_CROP_ID: cropDesc,
						HCP_CULTURE_TYPE: oProperties.HCP_MATNR,
						HCP_PRODUCTIVITY_TOTAL: productionTotal == undefined ? '' : parseFloat(productionTotal).toFixed(2),
						HCP_COMMERCIALIZED_CROP: percentageBuying == undefined ? '0' : Number(percentageBuying) > 100 ? '100' : percentageBuying.toString(),
						HCP_NEW_CROP: remainingVolume == undefined ? '0' : Number(remainingVolume) < 0 ? '0' : parseFloat(remainingVolume).toFixed(2),
						HCP_DESCRIPTION: ''
					}

					let ServiceUpdateMaterial = "/Visit_Form_Material(" + getMaterial.HCP_VISIT_ID + ")";

					const updateMaterial = {
						HCP_PERCENT_MARKETED: Number(parseFloat(percentageBuying).toFixed(0)),
						HCP_NEGOTIATION_BALANCE: parseFloat(remainingVolume).toFixed(2)
					};

					const getStateDisableCommercialization = await new Promise((resolve, reject) => {
						oModel.read("/Disable_Commercialization(1)", {
							success: function (results) {
								return resolve(results)
							}.bind(this),
							error: function (error) {
								return reject(MessageBox.error("Erro ao Buscar Master Data."));
							}
						})
					})

					oModel.create("/Visit_Form_Commercialization", propertiesMaterial);

					if (getStateDisableCommercialization != undefined) {
						if (getStateDisableCommercialization.HCP_STATUS_COMMERCIALIZATION == "1") {
							oModel.update(ServiceUpdateMaterial, updateMaterial, {
								groupId: "changes",
							});

							oModel.submitChanges({
								groupId: "changes",
								success: function () {
									MessageBox.success(
										"Ficha de Grãos Atualizada com Sucesso!", {
											actions: [sap.m.MessageBox.Action.OK]
												// onClose: function (sAction) {
												// 	//this.navBack();
												// 	// this.closeBusyDialog();
												// 	// this.backToIndex();
												// }.bind(this)
										}
									);
								}.bind(this),
								error: function () {
									MessageBox.error("Erro ao Atualizar Ficha!");
								}.bind(this)
							});
						}
					}

					return true;
				}
			} else {
				return false;
			}
		},

		_calculateCommercializationCulture: async function (oProperties) {
			var oModel = this.getOwnerComponent().getModel();
			var aFilters = [];
			let convertMengeToTon;
			let productionTotal, qtdeBuying, percentageBuying, remainingVolume, cropDesc;
			let visitType = "Compra de Commodities"

			let sCounter = 0;
			var sTimestamp = new Date().getTime() + sCounter;
			sCounter = sCounter + 1;

			if (oProperties.HCP_MEINS == "SC") {
				const sacasToKg = Number(parseFloat(oProperties.HCP_MENGE)) * 60
				const kgToTons = sacasToKg / 1000
				convertMengeToTon = kgToTons
			}
			if (oProperties.HCP_MEINS == "KG") {
				const kgToTons = Number(parseFloat(oProperties.HCP_MENGE)) / 1000
				convertMengeToTon = kgToTons
			}
			if (oProperties.HCP_MEINS == "TO") {
				convertMengeToTon = Number(parseFloat(oProperties.HCP_MENGE))
			}

			// let dateCropSelected = this._calculateRangeData(oProperties.HCP_ZDTREMDE)

			let oFilters = [];

			oFilters.push(new sap.ui.model.Filter("HCP_RANGE_START", sap.ui.model.FilterOperator
				.LE, new Date(oProperties.HCP_ZDTREMDE)));

			oFilters.push(new sap.ui.model.Filter("HCP_RANGE_END", sap.ui.model.FilterOperator
				.GE, new Date(oProperties.HCP_ZDTREMDE)));

			oFilters.push(new sap.ui.model.Filter("HCP_ACTIVE", sap.ui.model.FilterOperator
				.EQ, "1"));

			const getViewSuppliers = await new Promise((resolve, reject) => {
				oModel.read("/View_Grouping_Suppliers", {
					filters: [new sap.ui.model.Filter({
						path: "NAME1",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oProperties.PROVIDER_DESC
					})],
					success: function (results) {
						return resolve(results.results[0])
					}.bind(this),
					error: function (error) {
						return reject(MessageBox.error("Erro ao Buscar Fornecedor!"));
					}
				})
			})

			if (getViewSuppliers != undefined) {
				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_PROVIDER_ID",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: getViewSuppliers.LIFNR
				}));
			}

			const getSafraYear = await new Promise((resolve, reject) => {
				oModel.read("/Crop_Year", {
					filters: oFilters,
					sorters: [new sap.ui.model.Sorter("HCP_RANGE_START", false)],
					success: function (results) {
						return resolve(results.results[0])
					}.bind(this),
					error: function (error) {
						return reject(MessageBox.error("Erro ao Buscar Ano da Safra."));
					}
				})
			})

			if (getSafraYear != undefined) {
				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_SAFRA_YEAR",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: getSafraYear.HCP_CROP_ID
				}));

				cropDesc = getSafraYear.HCP_CROP_DESC
			}

			const getVisitFormPeriodic = await new Promise((resolve, reject) => {
				oModel.read("/Visit_Form_Periodic", {
					filters: [new sap.ui.model.Filter({
						path: "HCP_NAME_REGISTERED",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oProperties.PROVIDER_DESC
					})],
					sorters: [new sap.ui.model.Sorter("HCP_VISIT_ID", true)],
					success: function (results) {
						return resolve(results.results[0])
					}.bind(this),
					error: function (error) {
						return reject(MessageBox.error("Erro ao Buscar Ficha Periódica!"));
					}
				})
			})

			if (getVisitFormPeriodic != undefined) {
				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_PERIOD",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: getVisitFormPeriodic.HCP_PERIOD
				}));
			}

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_CULTURE_TYPE",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oProperties.HCP_MATNR
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_VISIT_TYPE",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: 'Periodic'
			}));

			if (aFilters.length == 5) {
				const getCulture = await new Promise((resolve, reject) => {
					oModel.read("/Visit_Culture_Type", {
						filters: aFilters,
						sorters: [new sap.ui.model.Sorter("HCP_VISIT_ID", true)],
						success: function (results) {
							return resolve(results.results[0])
						}.bind(this),
						error: function (error) {
							return reject(MessageBox.error("Erro ao Buscar Cultura."));
						}
					});
				})

				if (getCulture == undefined) {
					return false;
				}

				if (getCulture != undefined) {
					let HCP_PRODUCTIVITY_TOTAL = Number(getCulture.HCP_PRODUCTIVITY_TOTAL)
					if (getCulture.HCP_PRODUCTIVITY_TOTAL) {
						productionTotal = HCP_PRODUCTIVITY_TOTAL.toFixed(0);
						qtdeBuying = (Number(convertMengeToTon) / HCP_PRODUCTIVITY_TOTAL.toFixed(0)) * 100;
					}
					if (getCulture.HCP_SAFRA_PERCENTAGE) {
						percentageBuying = (Number(qtdeBuying) + Number(getCulture.HCP_SAFRA_PERCENTAGE))
					} else {
						getCulture.HCP_SAFRA_PERCENTAGE = 0
						percentageBuying = (Number(qtdeBuying) + Number(getCulture.HCP_SAFRA_PERCENTAGE))
					}
					if (getCulture.HCP_AVAILABLE_VOLUME) {
						remainingVolume = Number(getCulture.HCP_AVAILABLE_VOLUME) - Number(convertMengeToTon)
					}

					const propertiesCulture = {
						HCP_COMMERCIALIZATION_ID: sTimestamp.toFixed(),
						HCP_PARTNER: oProperties.PROVIDER_DESC == null ? '' : oProperties.PROVIDER_DESC,
						HCP_TYPE_COMMERCIALIZATION: visitType,
						HCP_CREATED_AT: new Date(),
						HCP_CREATED_BY: oProperties.HCP_CREATED_BY,
						HCP_CROP_ID: cropDesc.toString(),
						HCP_CULTURE_TYPE: oProperties.HCP_MATNR,
						HCP_PRODUCTIVITY_TOTAL: productionTotal == undefined ? '' : parseFloat(productionTotal).toFixed(2),
						HCP_COMMERCIALIZED_CROP: percentageBuying == undefined ? '0' : Number(percentageBuying) > 100 ? '100' : percentageBuying.toString(),
						HCP_NEW_CROP: remainingVolume == undefined ? '0' : Number(remainingVolume) < 0 ? '0' : parseFloat(remainingVolume).toFixed(2),
						HCP_DESCRIPTION: ''
					}

					let ServiceUpdateCulture = "/Visit_Culture_Type(" + getCulture.HCP_VISIT_ID + ")";

					const updateCulture = {
						HCP_SAFRA_PERCENTAGE: Number(parseFloat(percentageBuying).toFixed(0)),
						HCP_AVAILABLE_VOLUME: parseFloat(remainingVolume).toFixed(2)
					};

					const getStateDisableCommercialization = await new Promise((resolve, reject) => {
						oModel.read("/Disable_Commercialization(1)", {
							success: function (results) {
								return resolve(results)
							}.bind(this),
							error: function (error) {
								return reject(MessageBox.error("Erro ao Buscar Master Data."));
							}
						})
					})

					oModel.create("/Visit_Form_Commercialization", propertiesCulture);

					if (getStateDisableCommercialization != undefined) {
						if (getStateDisableCommercialization.HCP_STATUS_COMMERCIALIZATION == "1") {
							oModel.update(ServiceUpdateCulture, updateCulture, {
								groupId: "changes",
							});

							oModel.submitChanges({
								groupId: "changes",
								success: function () {
									MessageBox.success(
										"Ficha Periódica Atualizada com Sucesso!", {
											actions: [sap.m.MessageBox.Action.OK]
												// onClose: function (sAction) {
												// 	//this.navBack();
												// 	// this.closeBusyDialog();
												// 	// this.backToIndex();
												// }.bind(this)
										}
									);
								}.bind(this),
								error: function () {
									MessageBox.error("Erro ao Atualizar Ficha!");
								}.bind(this)
							});
						}
					}

					return true;
				}
			} else {
				return false;
			}
		},

		onSavePress: function (oEvent) {

			this.count = 0;
			this.revertCount = 120;
			this.hasFinished = false;
			this.timeOut = 120;
			this.message = "Enviando dados, por favor aguarde (";
			this.verifyTimeOut(true);
			var aUserName = this.userName;
			var sCounter = 0;
			var sTimestamp = new Date().getTime() + sCounter;
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var aDeferredGroups = oModel.getDeferredGroups();

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			var oEditModel = this.getView().getModel("fixedOrderFormModel");
			oEditModel.setProperty("/enabledConfirm", false);
			var oData = oEditModel.oData;

			var aFilters = [];

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}

			this.deleteCadence(this.uniqueKey).then(function () {
				// this.refreshStore("Commodities_Check").then(function () {

				this.uniqueKey = oData.HCP_UNIQUE_KEY;
				sCounter = sCounter + 1;
				var ZSEQ;

				if (oData.HCP_ZFRETE != "FOB") {
					oData.HCP_FRETE_PREV = "0.00";
				}

				if (!oData.HCP_ZSEQUE) {
					var oCadence = false; //Criar Pedido Fixo
				} else {
					oCadence = true; //Editar a Cadência
				}

				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
					var oStatus = "1"; //Pendente
				} else {
					oStatus = "0"; //Registro criado Off, não será enviado ao ECC
				}

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: this.uniqueKey
				}));
				oModel.read("/Commodities_Check", {
					filters: aFilters,
					sorters: [new sap.ui.model.Sorter({
						path: "ZSEQUE",
						descending: true
					})],
					success: function (results) {
						var oResult = results.results;

						for (var result of oResult) {

							if (result.HCP_UNIQUE_KEY == this.uniqueKey) {

								ZSEQ = result.ZSEQUE;
								oStatus = 2;

							} else {
								ZSEQ = oData.HCP_ZSEQUE;
							}
						}

						var aData = {
							HCP_ZSEQUE: ZSEQ,
							HCP_STATUS: oStatus,
							HCP_OFFER_NUMBER: oData.HCP_OFFER_NUMBER,
							HCP_LIFNR: oData.HCP_LIFNR,
							HCP_MATNR: oData.HCP_MATNR,
							HCP_TPCEREAL: oData.HCP_TPCEREAL,
							HCP_WERKS: oData.HCP_WERKS,
							HCP_LGORT: oData.HCP_LGORT,
							HCP_EKORG: oData.HCP_EKORG,
							HCP_EKGRP: oData.HCP_EKGRP,
							HCP_LIFNRCR: oData.HCP_LIFNRCR,
							HCP_MENGE: parseFloat(oData.HCP_MENGE).toFixed(2),
							HCP_MEINS: oData.HCP_MEINS,
							HCP_WAERS: oData.HCP_WAERS,
							HCP_NETWR: parseFloat(oData.HCP_NETWR).toFixed(2),
							HCP_ZMEINS: oData.HCP_ZMEINS,
							HCP_ZICMS: parseFloat(oData.HCP_ZICMS).toFixed(2),
							HCP_ZFRETE: oData.HCP_ZFRETE,
							HCP_UNID_FRETE: oData.HCP_UNID_FRETE,
							HCP_VALOR_TOTAL: oData.HCP_VALOR_TOTAL ? parseFloat(oData.HCP_VALOR_TOTAL).toFixed(2) : "0.00",
							HCP_JUST_PRECO: oData.HCP_JUST_PRECO,
							HCP_TEXT_PRECO: oData.HCP_TEXT_PRECO,
							HCP_ZTERM: oData.HCP_ZTERM,
							HCP_ZLOCRET: oData.HCP_ZLOCRET,
							HCP_FRETE_PREV: parseFloat(oData.HCP_FRETE_PREV).toFixed(2),
							HCP_DTFIX: oData.HCP_DTFIX === true ? "X" : " ",
							HCP_ZDTPGTO1: oData.HCP_ZDTPGTO1,
							HCP_ZDTPGTO2: oData.HCP_ZDTPGTO2,
							HCP_ZDTPGTO3: oData.HCP_ZDTPGTO3,
							HCP_ZMODAL: oData.HCP_ZMODAL,
							HCP_ZADIAMTO: oData.HCP_ZADIAMTO,
							HCP_ZPRIORI: oData.HCP_ZPRIORI,
							HCP_ZIVA: oData.HCP_ZIVA,
							HCP_ZDTREMDE: oData.HCP_ZDTREMDE,
							HCP_ZDTREMATE: oData.HCP_ZDTREMATE,
							HCP_SUBST: oData.HCP_SUBST,
							HCP_EBELN_SUB: oData.HCP_EBELN_SUB,
							HCP_EBELP_SUB: oData.HCP_EBELP_SUB,
							HCP_JUST_SUB: oData.HCP_JUST_SUB,
							HCP_ZUMIDADE: oData.HCP_ZUMIDADE ? parseFloat(oData.HCP_ZUMIDADE).toFixed(2) : "0.00",
							HCP_ZIMPUREZA: oData.HCP_ZIMPUREZA ? parseFloat(oData.HCP_ZIMPUREZA).toFixed(2) : "0.00",
							HCP_ZARDIDOS: oData.HCP_ZARDIDOS ? parseFloat(oData.HCP_ZARDIDOS).toFixed(2) : "0.00",
							HCP_ZCONTRATO: oData.HCP_ZCONTRATO,
							HCP_ZTPNF: oData.HCP_ZTPNF,
							HCP_ZOBS: oData.HCP_ZOBS,
							HCP_BEDNR: oData.HCP_BEDNR,
							HCP_MAILSOL: oData.HCP_MAILSOL,
							HCP_ZZTPCOMPRA: oData.HCP_ZZTPCOMPRA,
							HCP_BWERT: oData.HCP_BWERT ? parseFloat(oData.HCP_BWERT).toFixed(2) : null,
							HCP_ZZPREMIO_CEREAL: oData.HCP_ZZPREMIO_CEREAL ? parseFloat(oData.HCP_ZZPREMIO_CEREAL).toFixed(2) : null,
							HCP_ZZCAMBIO: oData.HCP_ZZCAMBIO ? parseFloat(oData.HCP_ZZCAMBIO).toFixed(2) : null,
							HCP_ACTZZTPCOMPRA: oData.HCP_ZZTPCOMPRA ? oData.HCP_ZZTPCOMPRA : null,
							HCP_UPDATED_BY: aUserName,
							HCP_UPDATED_AT: new Date()
						};

						var sPath = this.buildEntityPath("Commodities_Fixed_Order", oData, "HCP_PURCHASE_ID");

						oModel.update(sPath, aData, {
							groupId: "changes"
						});

						sCounter = sCounter + 1;

						for (var i = 0; i < oData.tableCadence.length; i++) {

							var sCadenceKey = new Date().getTime() + sCounter;
							sCounter = sCounter + 1;

							if (oData.tableCadence[i].HCP_QUANTIDADE == null || oData.tableCadence[i].HCP_QUANTIDADE == " ") {
								oData.tableCadence[i].HCP_QUANTIDADE = "0.00";
							}

							var aDataCadence = {
								HCP_CADENCE_ID: sCadenceKey.toFixed(),
								HCP_UNIQUE_KEY: this.uniqueKey,
								HCP_CENTER: oData.HCP_WERKS,
								HCP_DATA_ATUAL: oData.tableCadence[i].HCP_DATA_ATUAL,
								HCP_QUANTIDADE: parseFloat(oData.tableCadence[i].HCP_QUANTIDADE).toFixed(2),
								HCP_EBELN: oData.HCP_ZSEQUE,
								HCP_SALDO: "0.00",
								HCP_TIPO: "1", //Pedido Fixo
								HCP_CREATED_BY: aUserName,
								HCP_UPDATED_BY: aUserName,
								HCP_CREATED_AT: new Date(),
								HCP_UPDATED_AT: new Date()
							};

							oModel.createEntry("/Cadence", {
								properties: aDataCadence
							}, {
								groupId: "changes"
							});

						}

						sCounter = sCounter + 1;

						if (oStatus == "0") { //Registro offline

							var sMessageKey = new Date().getTime() + sCounter;
							sCounter = sCounter + 1;

							var aDataMessage = {
								HCP_MESSAGE_ID: sMessageKey.toFixed(),
								HCP_UNIQUE_KEY: this.uniqueKey,
								HCP_TIPO: "1",
								HCP_TRANSACTION: "Z5S3",
								HCP_MSGTYP: "I",
								HCP_MESSAGE: this.resourceBundle.getText("messageOffCommodities"),
								HCP_CREATED_BY: aUserName,
								HCP_CREATED_AT: new Date()
							};

							oModel.createEntry("/Commodities_Log_Messages", {
								properties: aDataMessage
							}, {
								groupId: "changes"
							});

						}

						if (oData.HCP_UNIQUE_KEY_OFFER) {

							var volumeTotal;
							if (oData.HCP_MEINS == "KG") {
								volumeTotal = parseFloat(oData.HCP_MENGE / 1000).toFixed(2);
							} else if (oData.HCP_MEINS == "SC") {
								volumeTotal = parseFloat(oData.HCP_MENGE * 0.06).toFixed(2);
							} else {
								volumeTotal = parseFloat(oData.HCP_MENGE).toFixed(2);
							}

							var aDataHistoric = {
								HCP_MENGE: volumeTotal,
								HCP_UPDATED_BY: aUserName,
								HCP_UPDATED_AT: new Date()
							};

							if(oData.historicOffer){
								var sPath = this.buildEntityPath("Commodities_Historic_Offer", oData.historicOffer, "HCP_HISTORIC_ID");

							oModel.update(sPath, aDataHistoric, {
								groupId: "changes"
							});
							}

						}

						//this.setBusyDialog(this.resourceBundle.getText("messageSaving"));

						if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
							oModel.submitChanges({
								groupId: "changes",
								success: function () {
									this.flushStore("Commodities_Fixed_Order,Cadence,Commodities_Historic_Offer").then(function () {
										//this.refreshStore("Commodities_Fixed_Order", "Cadence", "Commodities_Historic_Offer", "Commodities_Check").then(
										//	function () {

										this.hasFinished = true;

										if (bIsMobile) {
											localStorage.setItem("lastUpdateCommodities", new Date());
											localStorage.setItem("countStorageCommodities", 0);
										}

										if (oStatus == '2') {
											var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
											var sMessage = "Foi identificado que a compra possui sequencial (" + ZSEQ + "), o mesmo foi atualizado!";

											MessageBox.success(
												sMessage, {
													actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
													styleClass: bCompact ? "sapUiSizeCompact" : "",
													onClose: function (sAction) {
														if (sAction === "YES") {
															this.hasFinished = true;
															this.backToIndex();
														}

													}.bind(this)
												}

											);
										} else {
											var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
											var sMessage = "A compra foi salva com sucesso! Deseja se comunicar com o SAP?";

											MessageBox.success(
												sMessage, {
													actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
													styleClass: bCompact ? "sapUiSizeCompact" : "",
													onClose: async function (sAction) {
														if (sAction === "YES") {

															this.count = 0;
															this.revertCount = 500;
															this.timeOut = 500;
															this.hasFinished = false;
															this.message = "Processando dados, por favor aguarde (";
															this.verifyTimeOut();

															this.submitCommoditiesEcc(this.uniqueKey, "1", false, oCadence).then(function (oSucess) {

																this.hasFinished = true;

																if (oSucess == true) {
																	const oProperties = {
																		PROVIDER_DESC: oData.PROVIDER_DESC,
																		HCP_LIFNR: oData.HCP_LIFNR,
																		HCP_CREATED_BY: aUserName,
																		HCP_ZDTREMATE: oData.HCP_ZDTREMATE,
																		HCP_ZDTREMDE: oData.HCP_ZDTREMDE,
																		HCP_MATNR: oData.HCP_MATNR,
																		HCP_MEINS: oData.HCP_MEINS,
																		HCP_MENGE: oData.HCP_MENGE,
																		processado: oData.processado
																	}

																	if (oProperties.HCP_LIFNR) {
																		oModel.read("/View_Suppliers", {
																			filters: [new sap.ui.model.Filter({
																				path: "LIFNR",
																				operator: sap.ui.model.FilterOperator.EQ,
																				value1: oProperties.HCP_LIFNR
																			})],
																			success: async function (res) {
																				let isExistComercialization = false;
																				let response = res.results[0];
																				if (response) {
																					isExistComercialization = await this._calculateCommercializationCulture({...oProperties,
																						response
																					})
																					if (isExistComercialization == false)
																						await this._calculateCommercializationMaterial({...oProperties,
																							response
																						})
																				}
																			}.bind(this)
																		});
																	}
																	this.backToIndex();
																}

															}.bind(this));

														} else {
															this.backToIndex();
														}
													}.bind(this)
												}
											);
										}

										//}.bind(this));
									}.bind(this));
								}.bind(this),
								error: function () {
									this.hasFinished = true;
									MessageBox.error(
										this.resourceBundle.getText("errorFixedValue"), {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.closeBusyDialog();
												this.backToIndex();
											}.bind(this)
										}
									);
								}.bind(this)
							});
						} else {
							oModel.submitChanges({
								groupId: "changes",
								success: function () {
									this.hasFinished = true;
									MessageBox.information(
										this.resourceBundle.getText("messageOffCommodities"), {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.closeBusyDialog();
												this.backToIndex();
											}.bind(this)
										}
									);
								}.bind(this),
								error: function () {
									this.hasFinished = true;
									MessageBox.error(
										this.resourceBundle.getText("errorFixedValue"), {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												this.closeBusyDialog();
												this.backToIndex();
											}.bind(this)
										}
									);
								}.bind(this)
							});
						}
					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Compras.");
					}
				});

				// }.bind(this));
			}.bind(this));
		},

		sendMail: function (oData, screen) {
			let userName = this.userName;

			var oModel = this.getView().getModel("fixedOrderFormModel");
			var data = oModel.oData;

			var mailTo = {};
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var mensagem;
			var aData = {
				email: data.HCP_MAILSOL
			};
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);

			var mailto = [];
			mailto.push(aData)

			let tonToSendMail, providerDesc

			if (oData.HCP_MEINS == "SC") {
				const sacasToKg = parseFloat(oData.HCP_MENGE) * 60
				const kgToTons = sacasToKg / 1000
				tonToSendMail = kgToTons
			}
			if (oData.HCP_MEINS == "KG") {
				const kgToTons = parseFloat(oData.HCP_MENGE) / 1000
				tonToSendMail = kgToTons
			}
			if (oData.HCP_MEINS == "TO") {
				tonToSendMail = oData.HCP_MENGE
			}

			const getProvider = new Promise((resolve, reject) => {
				let Service = "/View_Suppliers";
				oModel.read(Service, {
					filters: [new sap.ui.model.Filter({
						path: "LIFNR",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_LIFNR
					})],
					success: function (res) {
						let response = res.results[0];
						resolve(response)
					}.bind(this)
				});
			})

			getProvider.then((providerObj) => {
				mensagem = "<p>Compra lançada no App de Grãos, sequencial " + oData.tonExceeded.hcpZseque +
					" do Fornecedor excedeu os limites de volume.</p><p>Favor solicitar CND.</p>" +
					"<p><b>Código fornecedor:</b> " + oData.HCP_LIFNR + "</p><p><b>Nome do Fornecedor:</b> " + providerObj.NAME1 +
					"</p><p><b>Sequencial:</b> " + oData.tonExceeded.hcpZseque + "</p>" +
					"<p><b>Volume da Compra (Ton):</b> " + tonToSendMail +
					"</p><p><b>Material:</b> " + oData.HCP_MATNR + "</p><p><b>Centro:</b> " + oData.HCP_WERKS + "</p>" +
					"<p>Att,</p>";

				var payload = {
					"personalizations": [{
						"to": mailto,
						"subject": `${oData.tonExceeded.hcpZseque} - Solicitar CND Compra AppGrãos`
					}],
					"from": {
						"email": "no-reply@appgraosfrete.brfmail.com"
					},
					"content": [{
						"type": "text/html",
						"value": mensagem
					}]
				};

				var jsonDados = JSON.stringify(payload);
				var sUrl;

				if (bIsMobile) {
					sUrl = "https://api.sendgrid.com/v3/mail/send";
				} else {
					sUrl = "/APPGRAOSMAIL/mail/send";
				}

				oModel.read("/Token_SendGrid", {
					success: function (oResults) {
						if (oResults.results.length > 0) {
							let authToken = "Bearer " + oResults.results[0].HCP_TOKEN;
							let headersToken = {
								"Authorization": authToken
							};

							$.ajax({
								url: sUrl,
								headers: headersToken,
								type: 'POST',
								contentType: "application/json",
								dataType: "json",
								data: jsonDados,
								success: function (data) {
									MessageBox.success(
										"Informações para solicitação de CND foram enviadas para seu email", {
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function (sAction) {
												screen.closeBusyDialog();
											}.bind(this)
										}
									);
								},
								error: function (error) {
									if (error.status == 202) {
										MessageBox.success(
											"Informações para solicitação de CND foram enviadas para seu email", {
												actions: [sap.m.MessageBox.Action.OK],
												onClose: function (sAction) {
													screen.closeBusyDialog();
												}.bind(this)
											}
										);
									} else {
										MessageBox.success(
											"Houve um erro ao encaminhar e-mail de solicitação de CND", {
												actions: [sap.m.MessageBox.Action.OK],
												onClose: function (sAction) {
													screen.closeBusyDialog();
												}.bind(this)
											}
										);
									}
								},
								async: true
							});
						} else {
							//Mensagem sem token
						}
					}.bind(this),
					error: function () {
						console.log("Falha ao Buscar Token");
					}
				});

			}).catch(err => err)
		},

		verifyTimeOut: function (isFirstTime) {

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if (isFirstTime) {
				this.setBusyDialog("App Grãos", "Enviando dados, por favor aguarde");

				this.verifyTimeOut();

			} else {
				if (!this.hasFinished) {
					setTimeout(function () {
						this.setBusyDialog("App Grãos", this.message + this.revertCount +
							")");
						this.count++;
						this.revertCount--;
						//console.log("Countador está em: " + this.count);
						if (this.count > this.timeOut) {
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
			}

		},

		showMessage: function () {

			localStorage.setItem("isNeededToReload", true);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("errorPages.timeOutConnection", true);
		},
		_changePurchaseType: function (oEvent) {
			var oCreateModelOffer = this.getView().getModel("fixedOrderFormModel");
			var oSource = oEvent.getSource();
			var oInputValue = oSource.getSelectedKey();

			if (oInputValue == '2') {
				oCreateModelOffer.setProperty("/isFrameType", true);
			} else {

				oCreateModelOffer.setProperty("/HCP_BWERT", null);
				oCreateModelOffer.setProperty("/HCP_ZZCAMBIO", null);
				oCreateModelOffer.setProperty("/HCP_ACTZZTPCOMPRA", null);
				oCreateModelOffer.setProperty("/HCP_ZZPREMIO_CEREAL", null);
				oCreateModelOffer.setProperty("/isFrameType", false);

			}

			this._validateForm();

		},
		_valideInputNumber: function (oProperty) {

			var oSource = oProperty.getSource();
			var sValue;

			sValue = oProperty.mParameters.newValue;
			sValue = sValue.replace(/[^0-9,]/g, "");

			oSource.setValue(sValue);

			this._validateForm();
		},

		//Pacote de melhorias 02/06/2022 adicionado filtro para condições de pagamento dinamico. 
		_handlePaymentTermFilterPress: function (oEvent) {
			var oFilterBar;
			//	var sId = oEvent.getSource().sId;

			if (!this.oPaymentTermFilter || this.oPaymentTermFilter.bIsDestroyed) {
				this.oPaymentTermFilter = sap.ui.xmlfragment("paymentTermFilterID" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.offerMap.fragments.PaymentTermsFilter", this);
				this.getView().addDependent(this.oPaymentTermFilter);
				oFilterBar = sap.ui.core.Fragment.byId("paymentTermFilterID" + this.getView().getId(), "fbPaymentTerm");
				oFilterBar.attachBrowserEvent("keyup", jQuery.proxy(function (e) {
					if (e.which === 13) {
						this._onPaymentTermApplySearch();
					}
				}, this));
			}

			this.oPaymentTermFilter.open();
		},

		_onPaymentTermApplySearch: function (oEvent) {
			var oList = sap.ui.core.Fragment.byId("paymentTermFilterID" + this.getView().getId(), "paymentTermListID");
			var oFilterBar = sap.ui.core.Fragment.byId("paymentTermFilterID" + this.getView().getId(), "fbPaymentTerm");
			var oFilters = this._getPaymentTermFilters(oFilterBar);

			oList.getBinding("items").filter(oFilters);
		},
		_searchDescriptionName: function () {

			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var oEditModel = this.getView().getModel("fixedOrderFormModel");
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'ZTERM',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oEditModel.oData.HCP_ZTERM
				}));

				oModel.read("/View_Payment_Conditions", {

					filters: aFilters,

					success: function (result) {

						if (result.results.length > 0) {
							oEditModel.setProperty("/HCP_TEXT1", result.results[0].TEXT1);
						}

						resolve(result.results[0]);

					}.bind(this),
					error: function () {
						reject(error);
					}
				});

			}.bind(this));

		},

		onPaymentTermSelected: function (oEvent) {
			var oSource = oEvent.getSource();

			var oModel = this.getView().getModel("fixedOrderFormModel");
			var oData = oModel.getProperty("/");
			var SelectedPaymentTerm = this.getView().getModel().getProperty(oSource.getSelectedItem().getBindingContext().getPath());

			oData["HCP_ZTERM"] = SelectedPaymentTerm.ZTERM;
			oData["HCP_TEXT1"] = SelectedPaymentTerm.TEXT1;
			oModel.refresh();
			this.oPaymentTermFilter.destroy();

		},

		_getPaymentTermFilters: function (oFilterBar) {
			var aFilterItems = oFilterBar.getAllFilterItems();
			var aFilters = [];
			for (var i = 0; i < aFilterItems.length; i++) {
				aFilters.push(new sap.ui.model.Filter({
					path: aFilterItems[i].getName(),
					operator: sap.ui.model.FilterOperator.Contains,
					value1: oFilterBar.determineControlByFilterItem(aFilterItems[i]).getValue()
				}));
			}
			return aFilters;
		},

		onPaymentTermDialogClose: function () {
			this.oPaymentTermFilter.close();
		},

		onInputLgortFormSelect: function (oEvent) {
			var oInput = oEvent.getSource();
			var oDepot = oInput.getSelectedKey();
			
			this._validateDeposit(oDepot).then(function() {
				this._validateForm();
			}.bind(this));
		},
		
		_validateDeposit: function(oDepot) {
			return new Promise(function(resolve, reject) {
				var oModel = this.getView().getModel("fixedOrderFormModel");
				var oData = oModel.getData();
				
				// Verificar na TVARV Z_DEP_PADRAO 
				this._getTvarvSap("P", "Z_DEP_PADRAO", null, 'checkDepValidation').then(function() {
					// Se não encontrar o valor, pula a validação do depósito
					if (!oData.checkDepValidation) {
						oModel.setProperty("/errorDeposit", false);
						resolve();
						return;
					}
					
					// Se estiver configurado na TVARV, valida o depósito pelo material e centro
					if (oData.HCP_MATNR && oData.HCP_WERKS && oDepot) {
						var oModelFixed = this.getView().getModel();
						var aFilters = [];
						
						aFilters.push(new sap.ui.model.Filter({
							path: "MATERIAL",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.HCP_MATNR
						}));
						
						aFilters.push(new sap.ui.model.Filter({
							path: "CENTRO",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oData.HCP_WERKS
						}));
						
						oModelFixed.read("/View_Z5222", {
							filters: aFilters,
							success: function(results) {
								// Se não encontrar nenhum registro, o material não tem tratamento
								if (!results.results || results.results.length === 0) {
									oModel.setProperty("/errorDeposit", false);
									resolve();
									return;
								}
								
								// Verificar se o depósito informado está na relação encontrada
								var bDepositoValido = false;
								for (var i = 0; i < results.results.length; i++) {
									if (results.results[i].DEPOSITO === oDepot) {
										bDepositoValido = true;
										break;
									}
								}
								
								if (bDepositoValido) {
									// Depósito válido para o material e centro
									oModel.setProperty("/errorDeposit", false);
									resolve();
								} else {
									// Depósito incompatível com os cadastrados para o material
									oModel.setProperty("/errorDeposit", true);
									oModel.setProperty("/HCP_LGORT", null);
									MessageBox.error(this.resourceBundle.getText("messageErrorDeposit"));
									resolve();
								}
							}.bind(this),
							error: function(error) {
								oModel.setProperty("/errorDeposit", false);
								resolve();
							}.bind(this)
						});
					} else {
						resolve();
					}
				}.bind(this));
			}.bind(this));
		}

	});

}, /* bExport= */ true);