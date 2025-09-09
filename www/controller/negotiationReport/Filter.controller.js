sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.negotiationReport.Filter", {
		formatter: formatter,
		onInit: function () {

			this.setBusyDialog("App Grãos", "Carregando dados, por favor aguarde");

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableCreate: false,
				enableRegion: false,
				isLoad: false,
				enableCreateRegioValid: true
			}), "filterPageModel");

			var oModel = this.getOwnerComponent().getModel();
			oModel.refresh(true);

			oModel.attachRequestCompleted(function () {
				var oFilterPageModel = this.getView().getModel("filterPageModel");
				var isLoad = oFilterPageModel.getProperty("/isLoad");
				if (!isLoad) {
					oFilterPageModel.setProperty("/isLoad", true);
					this.closeBusyDialog();
				}
			}.bind(this));

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("negotiationReport.Filter").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.getView().setModel(this.getOwnerComponent().getModel());
		},

		handleRouteMatched: function () {
			this.getUser().then(function (userName) {
				this.userName = userName;

				this.getUserProfile("View_Profile_Negotiation_Report", this.userName).then(profileData => {
					this.getView().getModel("profileModel").setData(profileData);
					console.log(this.getView().getModel("profileModel").getData());
					//this.closeBusyDialog();
				}).catch(error => {
					console.log(error);
					//this.closeBusyDialog();
				});

				this.checkUserInfo(this.userName).then(function (userArray) {
					if (userArray) {
						this.getView().getModel("filterPageModel").setProperty("/branch", userArray.EKGRP);
					}
				}.bind(this));
			}.bind(this));

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
				oRouter.navTo("Index", true);
			}
		},

		verifyAccountGroup2: function () {
			setTimeout(function () {

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
							var oFilterModel = this.getView().getModel("filterPageModel");
							if (oData.results[0].EKGRP) {
								oFilterModel.setProperty("/branch", oData.results[0].EKGRP);
							}
						}
						//this.closeBusyDialog();
					}.bind(this),
					error: function () {
						//	MessageBox.error("Erro ao buscar grupo de compra.");
						//this.closeBusyDialog();
					}
				});

			}.bind(this), 500);
		},

		_onConfirm: function () {
			var oModel = this.getView().getModel();
			var oModelFilters = this.getView().getModel("filterPageModel");
			var oData = oModelFilters.getProperty("/");
			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_CROP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.cropYear
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_STATE',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.state
			}));

			if (oData.regio) {
				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_REGIO',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.regio
				}));
			}

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_MATERIAL',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.matnr
			}));

			/*
				aFilters.push(new sap.ui.model.Filter({
					path: 'HCP_BRANCH',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oData.branch
				}));
			*/

			oModel.read("/Negotiation_Report", {
				filters: aFilters,
				success: function (result) {
					var oNegotiationReport = result.results;
					if (oNegotiationReport.length > 0) {
						this.checkForNegotiationReportExistance(oNegotiationReport);
					} else {
						this.goToCreate();
					}
				}.bind(this),
				error: function () {
					sap.m.MessageToast.show("Falha ao Buscar Acompanhamentos.");
				}
			});
		},

		checkForNegotiationReportExistance: function (oNegotiationReport) {
			var aNegotiationReport = oNegotiationReport[0];
			var sPath = "/Negotiation_Report(" + aNegotiationReport.HCP_NEGO_REPORT_ID + "l)";

			sap.m.MessageBox.information(
				"Relato de negócio já existe. Deseja Editar?", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
					onClose: function (oAction) {
						if (oAction === "YES") {
							this.goToEdit(sPath);
						}
					}.bind(this)
				}
			);
		},

		goToCreate: function () {
			var oFilterModel = this.getView().getModel("filterPageModel");
			var oData = oFilterModel.getData();
			if (oData.branch === '') {
				oData.branch = null;
			}
			if (oData.regio === '') {
				oData.regio = null;
			}

			this.oRouter.navTo("negotiationReport.New", {
				branch: encodeURIComponent(oData.branch),
				cropYear: encodeURIComponent(oData.cropYear),
				matnr: encodeURIComponent(oData.matnr),
				regio: encodeURIComponent(oData.regio),
				state: encodeURIComponent(oData.state),
				material_type: encodeURIComponent(oData.material_type)
			}, false);
		},

		goToEdit: function (sPath) {
			var oFilterModel = this.getView().getModel("filterPageModel");
			var oData = oFilterModel.getData();

			this.oRouter.navTo("negotiationReport.Edit", {
				HCP_NEGO_REPORT_ID: encodeURIComponent(sPath),
				isEdit: '1'
			}, false);
		},

		_validateForm: function () {
			var oFilterModel = this.getView().getModel("filterPageModel");

			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required) {
						var sValue = oControl.getValue();
						if (sValue.length > 0) {
							oFilterModel.setProperty("/enableCreate", true);
						} else {
							oFilterModel.setProperty("/enableCreate", false);
							return;
						}
					}
				}
			}.bind(this), 100);
		},

		_getFormFields: function () {
			var oMainDataForm = this.byId("NegotiationReportKeysForm").getContent();
			var aControls = [];
			var sControlType;

			for (var i = 0; i < oMainDataForm.length; i++) {
				sControlType = oMainDataForm[i].getMetadata().getName();
				if (sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" || sControlType === "sap.m.Input" ||
					sControlType === "sap.m.DateTimeInput" || sControlType === "sap.m.DatePicker" ||
					sControlType === "sap.m.CheckBox" || sControlType === "sap.m.MaskInput" || sControlType === "sap.m.ComboBox") {
					if (oMainDataForm[i].getEnabled()) {
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
		_changeState: function (oEvent) {
			var oInput = oEvent.getSource();
			var oModel = this.getOwnerComponent().getModel();

			var oTable = this.getView().byId("region");
			var oFilters = [];

			var oFilterModel = this.getView().getModel("filterPageModel");
			oFilterModel.setProperty("/regio", null);
			oFilterModel.setProperty("/enableRegion", false);

			if (oInput.getSelectedKey() !== '') {

				if (this.checkIfRegioIsInUserProfile(oInput.getSelectedKey())) {
					oFilters.push(new sap.ui.model.Filter("HCP_BLAND", sap.ui.model.FilterOperator.Contains, oInput.getSelectedKey()));

					oModel.read("/Regions", {
						filters: oFilters,
						success: function (oData) {
							if (oData.results.length > 0) {
								oTable.getBinding("items").filter(oFilters);
								oFilterModel.setProperty("/enableRegion", true);
								oFilterModel.setProperty("/regio", null);
							} else {
								oFilterModel.setProperty("/enableRegion", false);
								oFilterModel.setProperty("/regio", null);
							}
							this._validateForm();
						}.bind(this),
						error: function () {
							MessageBox.error("Error");
						}
					});
				} else {
					oFilterModel.setProperty("/enableRegion", false);
					oFilterModel.setProperty("/regio", null);
					 
					this._validateForm();
				}

			}else{
					oFilterModel.setProperty("/enableCreateRegioValid", true);
					this._validateForm();
			}

			this._validateForm();
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
		_changeBranch: function (oEvent) {
			var oInput = oEvent.getSource();

			if (oInput.getSelectedKey() === '') {
				var oFilterModel = this.getView().getModel("filterPageModel");
				oFilterModel.setProperty("/branch", null);
			}

			this._validateForm();
		},
		checkIfRegioIsInUserProfile: function (sRegio) {
			var oProfileModel = this.getView().getModel("profileModel");
			var oFilterModel = this.getView().getModel("filterPageModel");
			var oProfileData = oProfileModel.getData();

			if (sRegio) {
				if (oProfileData.werks.filter(werks => werks.REGIO == sRegio || werks.VALOR == '*').length > 0 || oProfileData.fullAccess) {
					oFilterModel.setProperty("/enableCreateRegioValid", true);
					return true;
				} else {
					oFilterModel.setProperty("/enableCreateRegioValid", false);
					return false;
				}
			} else{
					oFilterModel.setProperty("/enableCreateRegioValid", true);
					return false;
			}

		}
	});
});