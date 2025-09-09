sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.warehouseMap.Index", {
		formatter: formatter,
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("warehouseMap.Map").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.getView().setModel(this.getOwnerComponent().getModel());
			this.getView().setModel(new sap.ui.model.json.JSONModel(), "warehouseMapModel");
			var oComponent = this.getOwnerComponent();
			var oDeviceModel = oComponent.getModel("device");
			this.getView().setModel(oDeviceModel, "device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			var oGeoMap = this.getView().byId("GeoMap");
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));

		},

		handleRouteMatched: function (oEvent) {

			var oParameters = oEvent.getParameter("data");
			var oKeyData = JSON.parse(decodeURIComponent(oParameters.keyData));
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				checkInOn: true,
				textButtonCheckIn: "Realizar Check-In"

			}), "warehouseMapModel");

		 var oGeoMap = this.getView().byId("GeoMap");
            var oMapConfig = {
                "MapProvider": [{
                    "name": "HEREMAPS",
                    "type": "",
                    "description": "",
                    "tileX": "256",
                    "tileY": "256",
                    "maxLOD": "20",
                    "copyright": "Tiles Courtesy of HERE Maps",
                    "Source": [{
                        "id": "s1",
                        "url": "https://maps.hereapi.com/v3/base/mc/{LOD}/{X}/{Y}/png8?apiKey=GBbgU5wK1E9FNRKVZ4BSBcqEdyohjTbiP0pVxvRiQP0&style=explore.day"
                    }, {
                        "id": "s2",
                        "url": "https://maps.hereapi.com/v3/base/mc/{LOD}/{X}/{Y}/png8?apiKey=GBbgU5wK1E9FNRKVZ4BSBcqEdyohjTbiP0pVxvRiQP0&style=explore.day"
                    }]
                }],
                "MapLayerStacks": [{
                    "name": "DEFAULT",
                    "MapLayer": {
                        "name": "layer1",
                        "refMapProvider": "HEREMAPS",
                        "opacity": "1.0",
                        "colBkgnd": "RGB(255,255,255)"
                    }
                }]
            };

            // Configurar e inicializar o mapa
            oGeoMap.setMapConfiguration(oMapConfig);
            oGeoMap.setRefMapLayerStack("DEFAULT");

			this.oKeyData = oKeyData;
			var oPlanningModel = this.getView().getModel("warehouseMapModel");
			
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				data: this.oKeyData
			}), "warehouseModalModel");
		
			var modalModel = this.getView().getModel("warehouseModalModel");
			var modalData = modalModel.oData.data;
		
		
			
			if (oKeyData.isEdit) {
				this.isEdit = true;
				var oModel = this.getOwnerComponent().getModel();
				var aFilters = [];

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oKeyData.HCP_UNIQUE_KEY
				}));

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_PERIOD",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oKeyData.HCP_PERIOD
				}));

				oModel.read("/Warehouse_Map", {

					filters: aFilters,
					success: function (results) {

						var aResults = results.results;
						
						if(aResults[0].HCP_CHECKIN_BY){
				
							var dataJS = new Date(aResults[0].HCP_CHECKIN_AT);
							oPlanningModel.setProperty("/visibleEdit", true);
							oPlanningModel.setProperty("/textCreatedDate", "Check-In Realizado:");
							oPlanningModel.setProperty("/textCreated", "Check-In Realizado Por:");
							oPlanningModel.setProperty("/provider", modalData.PROVIDER_DESC);
							oPlanningModel.setProperty("/created", aResults[0].HCP_CHECKIN_BY);
							oPlanningModel.setProperty("/createdDate", dataJS.toLocaleString());
						}else{
							oPlanningModel.setProperty("/visibleEdit", true);
							var dataJS = new Date(aResults[0].HCP_CREATED_AT);
							oPlanningModel.setProperty("/textCreatedDate", "Data de Criação:");
							oPlanningModel.setProperty("/textCreated", "Criado Por:");
							oPlanningModel.setProperty("/provider", modalData.PROVIDER_DESC);
							oPlanningModel.setProperty("/created", aResults[0].HCP_CREATED_BY);
							oPlanningModel.setProperty("/createdDate", dataJS.toLocaleString());
						}

						if (aResults.length > 0) {
							if (aResults[0].HCP_LATITUDE != 0 && aResults[0].HCP_LONGITUDE != 0) {
								oPlanningModel.setProperty("/checkInOn", false);
								oPlanningModel.setProperty("/textButtonCheckIn", "Check-In Realizado");
								oPlanningModel.setProperty("/lat", aResults[0].HCP_LATITUDE);
								oPlanningModel.setProperty("/long", aResults[0].HCP_LONGITUDE);
								if (this.oKeyData.materialModel) {
									oPlanningModel.setProperty("/materialModel", this.oKeyData.materialModel);
								}

							} else {
								if (this.oKeyData.materialModel) {
									oPlanningModel.setProperty("/materialModel", this.oKeyData.materialModel);
								}
								this.onFeedListPress(oKeyData);
							}

						} else {
							if (this.oKeyData.materialModel) {
								oPlanningModel.setProperty("/materialModel", this.oKeyData.materialModel);
							}
							this.onFeedListPress(oKeyData);
						}

					}.bind(this),
					error: function (error) {

					}
				});

			} else {
				oPlanningModel.setProperty("/visibleEdit", false);
				this.isEdit = false;
				if (this.oKeyData.materialModel) {
					oPlanningModel.setProperty("/materialModel", this.oKeyData.materialModel);
				}
				this.onFeedListPress(oKeyData);
			}

		},
		/*
				refreshData: function () {
					var oComponent = this.getOwnerComponent();
					var oDeviceModel = oComponent.getModel("device");
					var bIsMobile = oDeviceModel.getData().browser.mobile;

					if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
						this.flushStore("Appointments,Appointments_Check").then(function () {
							this.refreshStore("Appointments", "Appointments_Check").then(function () {
								this.closeBusyDialog();
								this.getTokenAndInitializeThings();
								this.getView().byId("pullToRefreshID").hide();
							}.bind(this));
						}.bind(this));
					} else {
						this.getView().byId("pullToRefreshID").hide();
					}
				},
				*/

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

		formatDate: function (oDate) {
			var oExplodedDate = oDate.split("/");

			return oExplodedDate[2] + "-" + oExplodedDate[1] + "-" + oExplodedDate[0];
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

		onFeedListPress: function (oArrayData) {
			var bCanDoCheck = false;
			//	var oSplitApp = this.getView().byId("SplitContDemo");
			var bNeedLocation = true;
			var oPlanningModel = this.getView().getModel("warehouseMapModel");
			var oData = oPlanningModel.getProperty(this.selectedDailyAppointment);

			if (oArrayData.HCP_LATITUDE == 0 && oArrayData.HCP_LONGITUDE == 0) {
				bCanDoCheck = true;
			}

			if (bCanDoCheck) {
				this.getView().byId("map").setBusy(true);
				if (this._oNewScheduleDialog) {
					this._oNewScheduleDialog.close();
				}

				navigator.geolocation.getCurrentPosition(function (position) {
					var iLat = position.coords.latitude;
					var iLong = position.coords.longitude;
					var oGeoMap = this.getView().byId("GeoMap");

					oPlanningModel.setProperty("/lat", iLat);
					oPlanningModel.setProperty("/long", iLong);
					if (this.oKeyData.materialModel) {
						oPlanningModel.setProperty("/materialModel", this.oKeyData.materialModel);
					}

					//	this.getView().byId("map").bindElement(this.selectedDailyAppointment);
					this.getView().byId("map").setBusy(false);
				}.bind(this), function (error) {
					
					var iLat = -1;
					var iLong = -1;
					var oGeoMap = this.getView().byId("GeoMap");

					oPlanningModel.setProperty("/lat", iLat);
					oPlanningModel.setProperty("/long", iLong);
					this.getView().byId("map").setBusy(false);
					sap.m.MessageToast.show("Erro ao encontrar localização");
					if (this.oKeyData.materialModel) {
						oPlanningModel.setProperty("/materialModel", this.oKeyData.materialModel);
					}
					//	oSplitApp.backMaster();
				}.bind(this), {
					timeout: 5000,
					enableHighAccuracy : true
				});

			} else {

				oPlanningModel.setProperty("/checkInOn", false);
				oPlanningModel.setProperty("/textButtonCheckIn", "Check-In Realizado");
				oPlanningModel.setProperty("/lat", oArrayData.HCP_LATITUDE);
				oPlanningModel.setProperty("/long", oArrayData.HCP_LONGITUDE);

			}
		},

		onCloseCancel: function () {
			this._oCheckOutDialog.close();
		},

		getEntityByUniqueKey: function (uniqueKey, sEntityName) {
			return new Promise(function (resolve, reject) {
				var aFilters = [];
				var oModel = this.getView().getModel();

				aFilters.push(new sap.ui.model.Filter({
					path: "HCP_UNIQUE_KEY",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: uniqueKey
				}));

				oModel.read("/" + sEntityName, {
					filters: aFilters,
					success: function (results) {
						var aResults = results.results;

						if (aResults.length > 0) {
							for (var index in aResults) {
								var aUri = aResults[index].__metadata.uri.split("/");
								resolve(aUri[aUri.length - 1]);
							}
						}
					},
					error: function () {
						reject();
					}
				});
			}.bind(this));
		},

		generateUniqueKey: function () {
			return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
				(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
			);
		},

		backToTheMaster: function () {
			var oSplitApp = this.getView().byId("SplitContDemo");
			oSplitApp.backMaster();
		},

		backToIndex: function () {

			if (this.isEdit) {
				this.oRouter.navTo("warehouseMap.Edit", {
					keyData: encodeURIComponent(JSON.stringify(this.oKeyData))
				}, false);
			} else {
				var oWarehouseMapModel = this.getView().getModel("warehouseMapModel");
				var oData = oWarehouseMapModel.oData;

				this.oRouter.navTo("warehouseMap.New", {
					keyData: encodeURIComponent(JSON.stringify(oData))
				}, false);
			}

		},

		_onCheckInPress: function (oEvent) {

			var oWarehouseMapModel = this.getView().getModel("warehouseMapModel");
			var oData = oWarehouseMapModel.oData;
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			var aDeferredGroups = oModel.getDeferredGroups();
			var sPath;
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			if (this.oKeyData.materialModel) {
				oWarehouseMapModel.setProperty("/materialModel", this.oKeyData.materialModel);
			}

			if (aDeferredGroups.indexOf("changes") < 0) {
				aDeferredGroups.push("changes");
				oModel.setDeferredGroups(aDeferredGroups);
			}

			var aEntitys = ["Warehouse_Map"];

			if (this.isEdit) {
				var aData = {
					HCP_CHECKIN_AT: new Date(),
					HCP_CHECKIN_BY: this.userName,
					HCP_LATITUDE: oData.lat.toString(),
					HCP_LONGITUDE: oData.long.toString()
				};

				sPath = this.buildEntityPath("Warehouse_Map", this.oKeyData);
				this.oKeyData.HCP_LATITUDE = oData.lat.toString();
				this.oKeyData.HCP_LONGITUDE = oData.long.toString();

				oModel.update(sPath, aData, {
					groupId: "changes"
				});

				oModel.submitChanges({
					groupId: "changes",
					success: function () {
						MessageBox.success(
							"Check-In realizado com sucesso.", {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									this.closeBusyDialog();
									this.backToIndex();
								}.bind(this)
							}
						);
					}.bind(this),
					error: function () {
						MessageBox.success(
							this.resourceBundle.getText("errorOfferMap"), {
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function (sAction) {
									this.closeBusyDialog();
								}.bind(this)
							}
						);
					}.bind(this)
				});

			} else {
				MessageBox.success(
					"Check-In realizado com sucesso.", {
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function (sAction) {
							//	this.navBack();
							this.closeBusyDialog();

							this.oRouter.navTo("warehouseMap.New", {
								keyData: encodeURIComponent(JSON.stringify(oData))
							}, false);

						}.bind(this)
					}
				);
			}

		},

		onCommitmentChange: function (oEvent) {
			var oPlanningModel = this.getView().getModel("warehouseMapModel");
			var oSource = oEvent.getSource();
			var oBindingContext = oSource.getBindingContext("warehouseMapModel");
			var oData = oPlanningModel.getProperty(oBindingContext.getPath());
			oData["HCP_NAME"] = null;
			oData["HCP_NAME_DESC"] = null;
			this._validateForm();
			// this.validateComboBoxInput(oEvent);
		},

		validateComboBoxInput: function (oEvent) {
			var oPlanningModel = this.getView().getModel("warehouseMapModel");
			var oCombobox = oEvent.getSource();
			var oText = oCombobox.getValue();
			var oComboboxItems = oCombobox.getItems();
			var bIsValidValue = oComboboxItems.filter(item => item.getText() === oText).length > 0 ? true : false;

			if (!bIsValidValue && oText !== "") {
				oCombobox.setValueState("Error");
				oCombobox.setValueStateText("Valor Inválido");
				oPlanningModel.setProperty("/enableScheduleSave", false);
			} else {
				oCombobox.setValueState("None");
				oCombobox.setValueStateText("");
				oPlanningModel.setProperty("/enableScheduleSave", true);
			}
			this._validateForm();
		},

		_validateForm: function () {
			var oScheduleForm = sap.ui.core.Fragment.byId("newScheduleFragmentID" + this.getView().getId(), "ScheduleFormID");

			setTimeout(function () {
				var aInputControls = this._getFormFields(oScheduleForm.getContent());
				var oControl;
				var oPlanningModel = this.getView().getModel("warehouseMapModel");

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required) {
						var sValue = oControl.getValue();
						if (!sValue || oControl.getValueState() !== 'None') {
							oPlanningModel.setProperty("/enableScheduleSave", false);
							return;
						}
					}
				}
				oPlanningModel.setProperty("/enableScheduleSave", true);
			}.bind(this), 100);
		},

		_getFormFields: function (oFormFields) {
			var aControls = [];
			var sControlType;

			for (var i = 0; i < oFormFields.length; i++) {
				sControlType = oFormFields[i].getMetadata().getName();
				if (sControlType === "com.sap.build.standard.brfAppDeGraosModoEditar.controls.CustomComboBox" || sControlType === "sap.m.Input" ||
					sControlType === "sap.m.DateTimePicker" ||
					sControlType === "sap.m.CheckBox" || sControlType === "sap.m.MaskInput" || sControlType === "sap.m.ComboBox") {
					if (oFormFields[i].getVisible()) {
						aControls.push({
							control: oFormFields[i],
							required: oFormFields[i - 1].getRequired && oFormFields[i - 1].getRequired()
						});
					}
				}
			}
			return aControls;
		},

		_onCancelPress: function () {
			
			console.log(this.oKeyData);

			if (this.isEdit) {
				this.oRouter.navTo("warehouseMap.Edit", {
					keyData: encodeURIComponent(JSON.stringify(this.oKeyData))
				}, false);
			} else {
				var oWarehouseMapModel = this.getView().getModel("warehouseMapModel");
				var oData = oWarehouseMapModel.oData;

				if (oData.checkInOn) {
					oWarehouseMapModel.setProperty("/lat", '0');
					oWarehouseMapModel.setProperty("/long", '0');
				}

				this.oRouter.navTo("warehouseMap.New", {
					keyData: encodeURIComponent(JSON.stringify(oData))
				}, false);
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
		buildEntityPath: function (sEntityName, oEntity) {
			if (oEntity["@com.sap.vocabularies.Offline.v1.isLocal"] === true) {
				var aUri = oEntity.__metadata.uri.split("/");
				return "/" + aUri[aUri.length - 1];
			} else {
				return "/" + sEntityName + "(" + oEntity.HCP_WAREHOUSE_ID + "l)";
			}
		}
	});
}, /* bExport= */ true);