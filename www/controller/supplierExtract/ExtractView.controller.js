sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History"
], function (MainController, MessageBox, JSONModel, History) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.supplierExtract.ExtractView", {

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("supplierExtract.ExtractView").attachPatternMatched(this.handleRouteMatched, this);
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		handleRouteMatched: function (oEvent) {
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "ExtractViewModel");
			this.resultData = false;
			this.result2 = [];
			this.result3 = [];

			if (oEvent.getParameter("arguments")) {
				this.filters = JSON.parse(decodeURIComponent(decodeURIComponent(oEvent.getParameter("arguments").filters)));

				var typeData = this.filters.typeData;
				this.supplierID = this.filters.supplierID;
				this.start_date = this.filters.start_date;
				this.end_date = this.filters.end_date;
			}

			var oExtractModel = this.getView().getModel("ExtractViewModel");

			this.getData(typeData).then(function (result) {

				oExtractModel.setProperty("/data", result);
				if (this.resultData) {
					oExtractModel.setProperty("/data2Visible", true);
					oExtractModel.setProperty("/data2", this.result2);
					oExtractModel.setProperty("/data3Visible", true);
					oExtractModel.setProperty("/data3", this.result3);
				} else {
					oExtractModel.setProperty("/data2Visible", false);
				}

			}.bind(this)).catch(function (error) {
				console.log(error);
			}.bind(this));

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
		backToIndex: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Index", true);

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
		_onTilePress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			var rotes = ["crop.Index", "price.priceIntention.Index", "schedule.Index", "visitForm.Index", "offerMap.Index", "commodities.Index",
				"visitForm.Index"
			];
			var sPath = oEvent.getSource().oBindingContexts.supplierExtract.sPath;
			var lastChar = sPath.substr(sPath.length - 1);

			return new Promise(function (fnResolve) {

				if (oEvent.getSource().oBindingContexts.supplierExtract.sPath) {
					this.doNavigate(rotes[lastChar], oBindingContext, fnResolve, "");
				}

			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
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
		getICertificationsData: function () {

			return new Promise(function (resolve, reject) {

				var oData = this.filters.TileCollection[0];

				var aPromises = [];
				var aCertitications = [];

				for (var item of oData) {

					aPromises.push(new Promise(function (resolve1, rejec1t1) {
						this.getCertificationInfo(item).then(function (aCertificationInfo) {
							aCertitications.push(aCertificationInfo);
							resolve1();
						}.bind(this)).catch(function (error) {
							rejec1t1();
						}.bind(this));
					}.bind(this)));
				}

				Promise.all(aPromises).then(data => {
					resolve(aCertitications);
				}).catch(error => {
					reject();
				});

			}.bind(this));
		},
		getData: function (typeData) {

			return new Promise(function (resolve, reject) {

				var oExtractModel = this.getView().getModel("ExtractViewModel");

				switch (typeData) {

				case 'Intention':
					oExtractModel.setProperty("/mainTitle", "Intenções de preço");
					resolve(this.getIntentionsData());
					break;
				case 'Appointments':
					oExtractModel.setProperty("/mainTitle", "Agendamentos Abertos");
					oExtractModel.setProperty("/mainTitle2", "Agendamentos Fechados");
					oExtractModel.setProperty("/mainTitle3", "Agendamentos Cancelados");
					resolve(this.getAppointmentsData());
					break;
				case 'VisitForm':
					oExtractModel.setProperty("/mainTitle", "Fichas de Visitas");
					resolve(this.getVisitFormData());
					break;
				case 'OfferMap':
					oExtractModel.setProperty("/mainTitle", "Ofertas");
					resolve(this.getOfferMapData());
					break;
				case 'Commodities':
					oExtractModel.setProperty("/mainTitle2", "Compra Fixo");
					oExtractModel.setProperty("/mainTitle", "Compra Depósito");
					resolve(this.getCommoditiesData());
					break;
				case 'Certifications':
					oExtractModel.setProperty("/mainTitle", "Certificações");
					this.getICertificationsData().then(function (result) {
						resolve(result);
					}.bind(this)).catch(function (error) {
						reject(error);
					}.bind(this));
					break;
				default:

				}
			}.bind(this));
		},
		getIntentionsData: function () {
			var oData = this.filters.TileCollection[0];
			var result = [];

			if (oData) {
				for (var item of oData) {

					var array = {
						title: "Número da Intenção",
						name_sub_title1: 'Mês Entrega',
						name_sub_title2: 'Volume',
						name_number2: 'Preço de Alerta',
						name_sub_title3: 'Material',
						name_sub_title4: 'Centro',
						id: item.HCP_PRICE_INTENTION_ID,
						sub_title1: item.HCP_MONTH,
						sub_title2: item.HCP_VOLUME + "(T)",
						sub_title3: "MILHO GRANEL",
						sub_title4: "FÁB. RAÇÃO",
						number1: parseFloat(item.HCP_PRICE).toFixed(2),
						number2: parseFloat(item.HCP_MIN_PRICE).toFixed(2),
						number_unit: item.HCP_MOEDA,
						idVisible: false,
						number1Visible: true,
						number2Visible: true,
						sub_title1Visible: true,
						sub_title2Visible: true,
						sub_title3Visible: true,
						sub_title4Visible: true,
						number_unitVisible: true
					};

					result.push(array);
				}

			}

			return result;

		},
		getOfferMapData: function () {
			var oData = this.filters.TileCollection[0];
			var result = [];

			for (var item of oData) {

				var oCreatedAt = this.formatterDate(new Date(item.HCP_DATE_END), true);
				var oModality = ["", "Fixo", "Depósito"];
				var oStatus = ["Comprado Parcialmente", "Finalizado", "Cancelado", "Erro", "Todos"];

				var array = {
					title: "Número da Oferta",
					name_sub_title1: 'Material',
					name_sub_title2: 'Centro',
					name_sub_title3: 'Data de Entrega',
					name_sub_title4: 'Modalidade',
					name_number2: "Status",
					id: item.HCP_OFFER_ID,
					sub_title1: parseFloat(item.Offer_Material.MATNR).toFixed(2) + "-" + item.Offer_Material.MAKTX,
					sub_title2: item.Offer_Account_Groups.EKGRP + "-" + item.Offer_Account_Groups.EKNAM,
					sub_title3: oCreatedAt,
					sub_title4: oModality[parseInt(item.HCP_MODALITY)],
					number1: item.HCP_VOLUME + "(T)",
					number2: oStatus[parseInt(item.HCP_STATES_OFFER)],
					//number_unit: item.HCP_MOEDA,
					idVisible: false,
					number1Visible: true,
					number2Visible: true,
					sub_title1Visible: true,
					sub_title2Visible: true,
					sub_title3Visible: true,
					sub_title4Visible: true,
					number_unitVisible: false
				};

				result.push(array);
			}

			return result;

		},
		getCertificationInfo: function (certification) {

			return new Promise(function (resolve, reject) {

				var sPath;
				switch (certification.HCP_VISIT_TYPE) {
				case 'Industry':
					sPath = '/Visit_Form_Industry';
					break;
				case 'Grains':
					sPath = '/Visit_Form_Grains';
					break;
				case 'Yearly':
					sPath = '/Visit_Form_Yearly';
					break;
				case 'Periodic':
					sPath = '/Visit_Form_Periodic';
					break;
				default:
				}

				var oModel = this.getView().getModel();
				var aFilters = [];
				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_UNIQUE_KEY',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: certification.HCP_UNIQUE_KEY
				}));

				oModel.read(sPath, {
					filters: aFilters,
					success: function (result) {
						var oCertificationsInfo = result.results;
						if (oCertificationsInfo.length > 0) {

							this.getVisitCertificationName(certification.HCP_CERTIFICATION).then(function (visitName) {
								var resultFinal = {
									title: "Ficha",
									id: oCertificationsInfo[0].HCP_VISIT_ID,
									sub_title1: visitName,
									name_sub_title1: 'Certificado: ',
									idVisible: false,
									type: certification.HCP_VISIT_TYPE,
									number1Visible: false,
									number2Visible: false,
									sub_title1Visible: true,
									sub_title2Visible: false,
									sub_title3Visible: false,
									sub_title4Visible: false,
									number_unitVisible: false

								};

								resolve(resultFinal);
							}.bind(this)).catch(function (error) {
								console.log(error);
							}.bind(this));

						}

					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Certificações.");
						reject(err);
					}
				});
			}.bind(this));
		},

		getVisitCertificationName: function (visitCertificationID) {
			return new Promise(function (resolve, reject) {

				var oModel = this.getView().getModel();
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_ID',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: visitCertificationID
				}));

				oModel.read("/Visit_Certifications", {
					filters: aFilters,
					success: function (resultVisitCert) {
						var oVisitCertificationsInfo = resultVisitCert.results;
						resolve(oVisitCertificationsInfo[0].HCP_DESC);

					}.bind(this),
					error: function (err) {
						sap.m.MessageToast.show("Falha ao Buscar Certificações.");
						reject(err);
					}
				});
			}.bind(this));
		},
		getAppointmentsData: function () {
			var oAppointmentsOpened = this.filters.TileCollection[0];
			var oAppointmentsClosed = this.filters.TileCollection[1];
			var oAppointmentsCanceled = this.filters.TileCollection[2];
			var result = [];
			var array = [];
			var array2 = [];
			var array3 = [];
			this.resultData = true;

			for (var item of oAppointmentsOpened) {

				array = {
					title: "ID",
					name_sub_title1: 'Objetivo da interação',
					name_sub_title2: 'Tipo da interação',
					name_sub_title3: 'De',
					name_sub_title4: 'Check-In',
					id: item.id,
					sub_title1: item.interactObjective,
					sub_title2: item.interactType,
					sub_title3: item.start_date + " / Até: " + item.end_date,
					sub_title4: item.check_in,
					idVisible: false,
					number1Visible: false,
					number2Visible: false,
					sub_title1Visible: true,
					sub_title2Visible: true,
					sub_title3Visible: true,
					sub_title4Visible: true,
					number_unitVisible: false
				};

				result.push(array);
			}

			for (var item2 of oAppointmentsClosed) {

				array2 = {
					title: "ID",
					name_sub_title1: 'Objetivo da interação',
					name_sub_title2: 'Tipo da interação',
					name_sub_title3: 'De',
					name_sub_title4: 'Check-In',
					id: item2.id,
					sub_title1: item2.interactObjective,
					sub_title2: item2.interactType,
					sub_title3: item2.start_date + " / Até: " + item2.end_date,
					sub_title4: item2.check_in + " / Check-Out: " + item2.check_out,
					idVisible: false,
					number1Visible: false,
					number2Visible: false,
					sub_title1Visible: true,
					sub_title2Visible: true,
					sub_title3Visible: true,
					sub_title4Visible: true,
					number_unitVisible: false
				};

				this.result2.push(array2);
			}
			for (var item3 of oAppointmentsCanceled) {

				array3 = {
					title: "ID",
					name_sub_title1: 'Objetivo da interação',
					name_sub_title2: 'Tipo da interação',
					name_sub_title3: 'De',
					name_sub_title4: 'Motivo',
					id: item3.id,
					sub_title1: item3.interactObjective,
					sub_title2: item3.interactType,
					sub_title3: item3.start_date + " / Até: " + item3.end_date,
					sub_title4: item3.cancel_reason + " / Observação: " + item3.cancel_reason,
					idVisible: false,
					number1Visible: false,
					number2Visible: false,
					sub_title1Visible: true,
					sub_title2Visible: true,
					sub_title3Visible: true,
					sub_title4Visible: true,
					number_unitVisible: false
				};

				this.result3.push(array3);
			}

			return result;

		},

		getVisitFormData: function () {
			var oData = this.filters.TileCollection;
			var result = [];
			var oCreatedAt;
			var array;
			for (var item of oData) {

				oCreatedAt = this.formatterDate(new Date(item[0].HCP_CREATED_AT), true);

				array = {
					title: "Ficha número",
					name_sub_title1: 'Tipo da ficha',
					name_sub_title2: 'Tipo do Contato',
					name_sub_title3: 'Iniciativa',
					name_sub_title4: 'Data de criação',
					type: item[0].type,
					id: item[0].HCP_VISIT_ID,
					sub_title1: item[0].HCP_VISIT_FORM,
					sub_title2: item[0].HCP_CONTACT_TYPE,
					sub_title3: item[0].HCP_CONTACT_INICIATIVE,
					sub_title4: oCreatedAt + " / Criado por: " + item[0].HCP_CREATED_BY,
					idVisible: false,
					number1Visible: false,
					number2Visible: false,
					sub_title1Visible: true,
					sub_title2Visible: true,
					sub_title3Visible: true,
					sub_title4Visible: true,
					number_unitVisible: false
				};

				result.push(array);
			}

			return result;

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
		getCommoditiesData: function () {
			var oData = this.filters.TileCollection[0];
			var oData2 = this.filters.TileCollection2[0];
			var result = [];
			this.resultData = true;

			for (var item of oData) {

				//var oCreatedAt = this.formatterDate(new Date(item.HCP_DATE_END), true);
				//var oModality = ["", "Fixo", "Depósito"];
				//var oStatus = ["Comprado Parcialmente", "Finalizado", "Cancelado", "Erro", "Todos"];

				var array = {
					title: "Sequencial",
					name_sub_title1: 'Material',
					name_sub_title2: 'Centro',
					name_sub_title3: 'Base',
					//	name_sub_title4: 'Incoterms',
					name_number2: "Quantidade",
					id: item.HCP_ORDER_ID,
					sub_title1: parseFloat(item.Order_Material.MATNR).toFixed(2) + "-" + item.Order_Material.MAKTX,
					sub_title2: item.Order_Account_Groups.EKGRP + "-" + item.Order_Account_Groups.EKNAM,
					sub_title3: item.HCP_BASE_PRECIF,
					sub_title4: item.HCP_INCOTERMS,
					number1: parseFloat(item.HCP_NETWR),
					number2: item.HCP_MENGE_ENTR + " (KG)",
					//number_unit: item.HCP_MOEDA,
					idVisible: false,
					number1Visible: true,
					number2Visible: true,
					sub_title1Visible: true,
					sub_title2Visible: true,
					sub_title3Visible: true,
					sub_title4Visible: false,
					number_unitVisible: false
				};

				result.push(array);
			}

			if (oData2) {
				for (var item2 of oData2) {

					//var oCreatedAt = this.formatterDate(new Date(item.HCP_DATE_END), true);
					//var oModality = ["", "Fixo", "Depósito"];
					//var oStatus = ["Comprado Parcialmente", "Finalizado", "Cancelado", "Erro", "Todos"];

					var array2 = {
						title: "Sequencial",
						name_sub_title1: 'Material',
						name_sub_title2: 'Centro',
						name_sub_title3: 'Modalidade',
						name_sub_title4: 'Incoterms',
						name_number2: "Quantidade",
						id: item2.HCP_ORDER_ID,
						sub_title1: parseFloat(item2.Fixed_Material.MATNR).toFixed(2) + "-" + item2.Fixed_Material.MAKTX,
						sub_title2: item2.Fixed_Account_Groups.EKGRP + "-" + item2.Fixed_Account_Groups.EKNAM,
						sub_title3: item2.HCP_ZMODAL,
						sub_title4: item2.HCP_ZFRETE,
						number1: parseFloat(item2.HCP_NETWR).toFixed(2),
						number2: item2.HCP_MENGE + "(" + item2.HCP_MEINS + ")",
						//number_unit: item.HCP_MOEDA,
						idVisible: false,
						number1Visible: true,
						number2Visible: true,
						sub_title1Visible: true,
						sub_title2Visible: true,
						sub_title3Visible: true,
						sub_title4Visible: true,
						number_unitVisible: false
					};

					this.resultFixed.push(array2);
				}
			}

			return result;

		},
		_onRowPress: function (oEvent) {

			//var dataType = oEvent.getSource().oBindingContexts.ExtractViewModel.oModel.oData.mainTitle;
			var sPlit = oEvent.getSource().oBindingContexts.ExtractViewModel.sPath.split("/");
			var sIndex = sPlit[2];
			var oId = oEvent.getSource().oBindingContexts.ExtractViewModel.oModel.oData.data[sIndex].id;
			var sPath;
			var dataType = this.filters.typeData;

			switch (dataType) {

			case 'Intention':
				sPath = this.buildIntentionPath("Price_Intention", oId);

				this.oRouter.navTo("price.priceIntention.Edit", {
					keyData: encodeURIComponent(sPath),
					option: encodeURIComponent("priceIntention")
				}, false);
				break;
			case 'Appointments':

				break;
			case 'VisitForm':
				var typeVisit = oEvent.getSource().oBindingContexts.ExtractViewModel.oModel.oData.data[sIndex].type;
				var sView = "visitForm.Edit" + typeVisit + "VisitForm";

				sPath = this.buildIntentionPath("Visit_Form_" + typeVisit, oId);

				this.oRouter.navTo(sView, {
					keyData: encodeURIComponent(sPath)
				});
				break;
			case 'OfferMap':

				sPath = this.buildIntentionPath("Offer_Map", oId);

				this.oRouter.navTo("offerMap.Edit", {
					keyData: encodeURIComponent(sPath),
					option: encodeURIComponent("Freight")
				});

				break;
			case 'Commodities':

				var oView = "commodities.EditDepositTransf";

				sPath = this.buildEntityPath("Commodities_Order", oId);

				this.oRouter.navTo(oView, {
					keyData: encodeURIComponent(sPath)
				});

				break;
			case 'Certifications':
				var typeVisitCert = oEvent.getSource().oBindingContexts.ExtractViewModel.oModel.oData.data[sIndex].type;
				var sViewCert = "visitForm.Edit" + typeVisitCert + "VisitForm";

				sPath = this.buildIntentionPath("Visit_Form_" + typeVisitCert, oId);

				this.oRouter.navTo(sViewCert, {
					keyData: encodeURIComponent(sPath)
				});
				break;
			default:

			}

		},
		buildIntentionPath: function (sEntityName, id) {

			return "/" + sEntityName + "(" + id + "l)";

		}

	});
}, /* bExport= */ true);