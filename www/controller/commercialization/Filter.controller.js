sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.commercialization.Filter", {
		formatter: formatter,
		onInit: function () {

			this.setBusyDialog("App Grãos", "Carregando dados, por favor aguarde");

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableCreate: false,
				enableRegion: false,
				isLoad: false,
				enableCreateRegioValid: true,
				enableCropYear: false
			}), "filterPageModel");

			var oModel = this.getOwnerComponent().getModel();
			this.oModel = oModel;
			//oModel.refresh(true);

			oModel.attachRequestCompleted(function () {
				var oFilterPageModel = this.getView().getModel("filterPageModel");
				var isLoad = oFilterPageModel.getProperty("/isLoad");
				if (!isLoad) {
					oFilterPageModel.setProperty("/isLoad", true);
					this.closeBusyDialog();
				}
			}.bind(this));

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("commercialization.Filter").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.getView().setModel(this.getOwnerComponent().getModel());
		},

		handleRouteMatched: function () {
			this.getUser().then(function (userName) {
				this.userName = userName;

				this.getUserProfile("View_Profile_Commercialization", this.userName).then(profileData => {
					this.getView().getModel("profileModel").setData(profileData);
					console.log(this.getView().getModel("profileModel").getData());
					//this.closeBusyDialog();
				}).catch(error => {
					console.log(error);
					//this.closeBusyDialog();
				});

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

		_onConfirm: function () {

			var oModelFilters = this.getView().getModel("filterPageModel");
			var oData = oModelFilters.getProperty("/");
			var aFilters = [];
			var bFilters = [];
			var regio = oData.HCP_REGIO.split("-");
			var material = oData.HCP_MATERIAL.split("-");
			var state = oData.HCP_STATE.split("-");
			var period = this.getWeek() + new Date().getFullYear();
			var hasCommerc = false;
			var sPath;

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_CROP',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oData.HCP_CROP
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_STATE',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: state[0]
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_REGIO',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: regio[0]
			}));

			aFilters.push(new sap.ui.model.Filter({
				path: 'HCP_MATERIAL',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: material[0]
			}));

			this.oModel.read("/Commercialization", {
				filters: aFilters,
				sorters: [new sap.ui.model.Sorter({
			     	path: "HCP_UPDATED_AT",
					descending: false
				})],
				success: function (resultCommerc) {
					var oCommerc = resultCommerc.results;
					var oDeviceModel = this.getOwnerComponent().getModel("device");
					var bIsMobile = oDeviceModel.getData().browser.mobile;
					
					if (oCommerc.length > 0) {
						for (var m = 0; m < oCommerc.length; m++) {
							if (oCommerc.length > 0 && this.getWeek() + new Date().getFullYear() == oCommerc[m].HCP_PERIOD) {
	
								if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
									if (oCommerc[m]["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
										this.showOffMessage();
										return;
									} else {
										sPath = "/Commercialization(" + oCommerc[m].HCP_COMMERC_ID + "l)";
										hasCommerc = true;
									}
									if (hasCommerc) {
										if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
											this.goToCreate(sPath);
										} else {
											this.blockOffMessage();
											return;
										}
									}
								} else {
									this.blockOffMessage();
									return;
								}
							
							}
						}
						if (!hasCommerc) {
							if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
								this.goToCreate();
							} else {
								this.blockOffMessage();
								return;
							}
						}
					} else {
						this.goToCreate();
					}

					
					// if (!hasCommerc) {
						
					// bFilters.push(new sap.ui.model.Filter({
					// 	path: 'HCP_CROP',
					// 	operator: sap.ui.model.FilterOperator.EQ,
					// 	value1: oData.HCP_CROP
					// }));
		
					// bFilters.push(new sap.ui.model.Filter({
					// 	path: 'HCP_STATE',
					// 	operator: sap.ui.model.FilterOperator.EQ,
					// 	value1: state[0]
					// }));
		
					// bFilters.push(new sap.ui.model.Filter({
					// 	path: 'HCP_REGIO',
					// 	operator: sap.ui.model.FilterOperator.NE,
					// 	value1: regio[0]
					// }));
		
					// bFilters.push(new sap.ui.model.Filter({
					// 	path: 'HCP_MATERIAL',
					// 	operator: sap.ui.model.FilterOperator.EQ,
					// 	value1: material[0]
					// }));
					
					// bFilters.push(new sap.ui.model.Filter({
					// 	path: 'HCP_PERIOD',
					// 	operator: sap.ui.model.FilterOperator.EQ,
					// 	value1: period
					// }));
					
					// this.oModel.read("/Commercialization", {
					// 	filters: bFilters,
					// 	sorters: [new sap.ui.model.Sorter({
					// 		path: "HCP_COMMERC_ID",
					// 		descending: false
					// 	})],
					// 	success: function (resultCommercConsolidado) {
					// 		var oCommercConsolidado = resultCommercConsolidado.results;
					// 		var oDeviceModel = this.getOwnerComponent().getModel("device");
					// 		var bIsMobile = oDeviceModel.getData().browser.mobile;

					// 		for (var m = 0; m < oCommercConsolidado.length; m++) {
					// 			if (oCommercConsolidado.length > 0 && this.getWeek() + new Date().getFullYear() == oCommercConsolidado[m].HCP_PERIOD) {

					// 				if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
					// 					if (oCommercConsolidado[m]["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
					// 						this.showOffMessage();
					// 						return;
					// 					} else {
					// 						sPath = "/Commercialization(" + oCommercConsolidado[m].HCP_COMMERC_ID + "l)";
					// 						hasCommerc = true;
					// 					}

					// 				} else {
					// 					this.blockOffMessage();
					// 					return;
					// 				}

					// 			}
					// 		}

					// 		if (hasCommerc) {
					// 			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
					// 				this.goToCreate(sPath);
					// 			} else {
					// 				this.blockOffMessage();
					// 				return;
					// 			}

					// 		} else {
					// 			this.goToCreate();
					// 		}

					// 	}.bind(this),
					// 	error: function () {
					// 		sap.m.MessageToast.warning("Falha ao Buscar Acompanhamentos na região Central.");
					// 	}
					// });
					// }
					
				}.bind(this),
				error: function () {
					sap.m.MessageToast.warning("Falha ao Buscar Acompanhamentos.");
				}
			});
		},

		checkForCropValidity: function (oCrop) {
			// var sPath = "/Crop_Tracking(" + oCrop.HCP_CROP_TRACK_ID + "l)";
			var sPath = this.buildEntityPath("Crop_Tracking", oCrop);
			var oCropCreationDate = oCrop.HCP_CREATED_AT;
			var oDateToCompare = new Date(oCropCreationDate);
			var oDateToCompareDay = oDateToCompare.getUTCDate();

			oDateToCompare.setUTCDate(oDateToCompareDay + 7);

			if (oDateToCompare.getUTCDate() < new Date().getUTCDate()) {
				this.goToCreate(sPath);
			} else {
				this.onEditCrop(sPath);
			}
		},

		onEditCrop: function (sPath) {
			this.goToEdit(sPath);
			// sap.m.MessageBox.show(
			// 	"Acompanhamento de Lavoura já existe. Deseja Editar?", {
			// 		icon: sap.m.MessageBox.Icon.INFORMATION,
			// 		actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
			// 		onClose: function (oAction) {
			// 			if (oAction === "YES") {
			// 				this.goToEdit(sPath);
			// 			} else {
			// 				this._oEditCropDialog.close();
			// 			}
			// 		}.bind(this)
			// 	}
			// );
		},

		goToCreate: function (sPath) {
			var oFilterModel = this.getView().getModel("filterPageModel");
			var oModel = this.getView().getModel();
			var oData;
			var sOperation;
			var oMessageDialogTemplate;

			if (sPath) {
				oData = oFilterModel.getData();
				sOperation = "Copy";
			} else {
				oData = oFilterModel.getData();
				sOperation = "New";
			}

			if (sOperation === "New") {
				sap.m.MessageBox.information(
					"Deseja criar um novo registro?", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						onClose: function (oAction) {
							if (oAction === "YES") {
								this.oRouter.navTo("commercialization.Create", {
									keyData: encodeURIComponent(JSON.stringify(oData)),
									operation: sOperation
								}, false);
							}
						}.bind(this)
					}
				);
			} else {
				sap.m.MessageBox.information(
					"Existe um registro da semana atual, deseja edita-lo?", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
						onClose: function (oAction) {
							if (oAction === "YES") {
								this.oRouter.navTo("commercialization.Edit", {
									HCP_COMMERC_ID: encodeURIComponent(sPath),
									keyData: encodeURIComponent(JSON.stringify(oData))
								}, false);
							}
						}.bind(this)
					}
				);
				//this.goToEdit(sPath);
			}
		},

		goToEdit: function (sPath) {
			var oFilterModel = this.getView().getModel("filterPageModel");
			var oData = oFilterModel.getData();

			this.oRouter.navTo("commercialization.Edit", {
				keyData: encodeURIComponent(sPath)
			}, false);
		},
		
		_validateForm: function () {
			var oFilterModel = this.getView().getModel("filterPageModel");
			var oCropYear = this.byId("cropYear");
			
			// if(oCropYear._getSelectedItemText()){
			// 	var cropYear = oCropYear._getSelectedItemText().split("/")[1];
			// 	var currentYear = (new Date().getYear()).toString();
				
			// 	if(cropYear < currentYear.slice(-2)){
			// 		oFilterModel.setProperty("/enableCreate", false);
			// 		oFilterModel.setProperty("/enableCropYear", true);
			// 		return;
			// 	} else {
			// 		oFilterModel.setProperty("/enableCropYear", false);
			// 	}
			// }
			
			
			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;

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
			var oMainDataForm = this.byId("cropTrackKeysForm").getContent();
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
		_changeState: function (oEvent) {
			var oInput = oEvent.getSource();
			var oModel = this.getOwnerComponent().getModel();

			var oTable = this.getView().byId("region");
			var oFilters = [];

			var oFilterModel = this.getView().getModel("filterPageModel");
			oFilterModel.setProperty("/HCP_REGIO", null);
			oFilterModel.setProperty("/enableRegion", false);

			if (oInput.getSelectedKey() !== '') {
				if (this.checkIfRegioIsInUserProfile(oInput.getSelectedKey())) {
					var stateKey = oInput.getSelectedKey().split("-");
					oFilters.push(new sap.ui.model.Filter("HCP_BLAND", sap.ui.model.FilterOperator.Contains, stateKey[0]));

					oFilters.push(new sap.ui.model.Filter({
						path: 'HCP_ACTIVE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '1'
					}));
					
					// oFilters.push(new sap.ui.model.Filter({
					// 	path: 'HCP_BEZEI',
					// 	operator: sap.ui.model.FilterOperator.NE,
					// 	value1: stateKey[1]
					// }));

					oModel.read("/Regions", {
						filters: oFilters,
						success: function (oData) {
							if (oData.results.length > 0) {
								oTable.getBinding("items").filter(oFilters);
								oFilterModel.setProperty("/enableRegion", true);
								oFilterModel.setProperty("/HCP_REGIO", null);
							} else {
								sap.m.MessageToast.show("Estado sem região cadastrada, favor contatar o administrador.", {
									duration: 2000
								});
								oFilterModel.setProperty("/enableRegion", false);
								oFilterModel.setProperty("/HCP_REGIO", null);
							}
						}.bind(this),
						error: function () {
							MessageBox.error("Error");
						}
					});
				} else {
					oFilterModel.setProperty("/enableRegion", false);
					this._validateForm();
				}
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
		
		showOffMessage: function () {
			sap.m.MessageBox.information(
				"Registro offline, favor conectar a internet ou atualizar a lista para acessar esse registro.", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					actions: [sap.m.MessageBox.Action.OK]
				}
			);
		},
		blockOffMessage: function () {
			sap.m.MessageBox.information(
				"Não é possivel editar uma comercialização offline, favor conectar a internet para acessar os dados.", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					actions: [sap.m.MessageBox.Action.OK]
				}
			);
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
			} else {
				oFilterModel.setProperty("/enableCreateRegioValid", true);
				return false;
			}

		}
	});
});