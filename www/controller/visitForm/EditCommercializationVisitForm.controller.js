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

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.visitForm.EditCommercializationVisitForm", {

		onInit: function () {

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("visitForm.EditCommercializationVisitForm").attachDisplay(this.handleRouteMatched, this);
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel(), "editCommercializationVisitModel");
			this.period = this._getPeriod();
		},

		handleRouteMatched: function (oEvent) {

			this.getUser().then(function (userName) {
				this.userName = userName;

				this.getUserProfile("View_Profile_Visit", this.userName).then(profileData => {
					this.getView().getModel("profileModel").setData(profileData);
					console.log(this.getView().getModel("profileModel").getData());
					this.closeBusyDialog();
				}).catch(error => {
					console.log(error);
					this.closeBusyDialog();
				});
			}.bind(this));
			var oEditModel = this.getView().getModel("editCommercializationVisitModel");
			var oModel = this.getView().getModel();
			var oData;

			if (oEvent.getParameter("data")) {
				var sPathKeyData = oEvent.getParameter("data").keyData;
				var sOperation = oEvent.getParameter("data").operation;
				oData = oModel.getProperty(decodeURIComponent(sPathKeyData));
				oData = JSON.parse(JSON.stringify(oData));
			}

			oEditModel.setProperty("/", oData);

			this._getCommercializationValues();

		},

		closeBusyDialog: function () {
			if (this.busyDialog) {
				this.busyDialog.close();
			}
		},

		_getCommercializationValues: function (oData) {

			var oModelVisit = this.getView().getModel();
			var oEditModel = this.getView().getModel("editCommercializationVisitModel");
			var oData = oEditModel.oData;
			var oMainDataForm = this.byId("newEntitySimpleForm").getContent();
			var oCharTemplate;
			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: "HCP_COMMERCIALIZATION_ID",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_COMMERCIALIZATION_ID
			}));

			oModelVisit.read("/Visit_Form_Commercialization", {
				filters: aFilters,
				success: async function (results) {
					var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
						pattern: "dd/MM/yyyy HH:mm:ss"
					});

					var aResults = results.results;

					var HCP_CREATED_AT = dateFormat.format(aResults[0].HCP_CREATED_AT);

					let productivityTotalFormated,
						remaingFormated,
						commercializedCrop;
					
					if (aResults[0].HCP_PRODUCTIVITY_TOTAL) {
						productivityTotalFormated = aResults[0].HCP_PRODUCTIVITY_TOTAL.replace(/\.00$/, '');
					}
					
					if (aResults[0].HCP_NEW_CROP) {
						remaingFormated = aResults[0].HCP_NEW_CROP.replace(/\.00$/, '');
					}
					
					if (aResults[0].HCP_COMMERCIALIZED_CROP) {
						let formatCommercialized = parseFloat(aResults[0].HCP_COMMERCIALIZED_CROP).toFixed(0)
						commercializedCrop = formatCommercialized
					}

					oEditModel.setProperty("/HCP_COMMERCIALIZATION_ID", aResults[0].HCP_COMMERCIALIZATION_ID);
					oEditModel.setProperty("/HCP_PARTNER", aResults[0].HCP_PARTNER);
					oEditModel.setProperty("/HCP_TYPE_COMMERCIALIZATION", aResults[0].HCP_TYPE_COMMERCIALIZATION);
					oEditModel.setProperty("/HCP_CREATED_AT", HCP_CREATED_AT);
					oEditModel.setProperty("/HCP_CREATED_BY", aResults[0].HCP_CREATED_BY);
					oEditModel.setProperty("/HCP_CROP_ID", aResults[0].HCP_CROP_ID);
					oEditModel.setProperty("/HCP_CULTURE_TYPE", parseInt(aResults[0].HCP_CULTURE_TYPE).toString());
					oEditModel.setProperty("/HCP_PRODUCTIVITY_TOTAL", productivityTotalFormated);
					oEditModel.setProperty("/HCP_COMMERCIALIZED_CROP", commercializedCrop);
					oEditModel.setProperty("/HCP_NEW_CROP", remaingFormated);
					oEditModel.setProperty("/HCP_DESCRIPTION", aResults[0].HCP_DESCRIPTION);

					const getCulture = new Promise((resolve, reject) => {
						oModelVisit.read("/View_Material", {
							filters: [new sap.ui.model.Filter({
								path: "MATNR",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: aResults[0].HCP_CULTURE_TYPE
							})],
							success: function (results) {
								return resolve(results.results[0].MAKTX)
							}.bind(this),
							error: function (error) {
								return reject(MessageBox.error("Erro ao Buscar Material."));
							}
						});
					})

					await getCulture.then((result) => {
						oEditModel.setProperty("/providerName", result)
					})

				}.bind(this),
				error: function (error) {
					console.log(error);
				}
			});

		},

		navBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oVisitModel = this.getView().getModel("editCommercializationVisitModel");

			oVisitModel.setProperty("/", []);

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Index", true);
			}

		},

		_getPeriod: function () {

			var oDate = new Date();
			var oYear = oDate.getFullYear();

			oDate.setHours(0, 0, 0);
			oDate.setDate(oDate.getDate() + 4 - (oDate.getDay() || 7));

			var oWeek = Math.ceil((((oDate - new Date(oDate.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
			var oPeriod = oWeek + "/" + oYear;
			return oPeriod;

		},

		onSavePress: function (oEvent) {

			var oModel = this.getView().getModel();
			var oEditModel = this.getView().getModel("editCommercializationVisitModel");
			var oData = oEditModel.oData;

			var oPropertiesReactivate = {
				HCP_DESCRIPTION: oData.HCP_DESCRIPTION
			};

			var sPath = this.buildEntityPath("Visit_Form_Commercialization", oData, "HCP_COMMERCIALIZATION_ID"); // Pegar ID da Oferta

			oModel.update(sPath, oPropertiesReactivate);

			oModel.submitChanges({
				groupId: "changes",
				success: function () {
					MessageBox.success(
						'Descrição salva com Sucesso!!!', {
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (sAction) {
								this.closeBusyDialog();
								this.navBack();
							}.bind(this)
						}
					);
				}.bind(this),
				error: function () {
					MessageBox.success(
						'Não foi possivel salvar a Descrição!!!', {
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (sAction) {
								this.closeBusyDialog();
							}.bind(this)
						}
					);
				}.bind(this)
			});
		}
	});

}, /* bExport= */ true);