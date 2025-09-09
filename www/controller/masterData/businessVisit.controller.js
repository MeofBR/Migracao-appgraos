sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter",
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.masterData.businessVisit", {
		formatter: formatter,

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("masterData.businessVisit").attachPatternMatched(this.handleRouteMatched, this);
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		handleRouteMatched: function () {
			this.createModel();
			this.validateMobile();
		},

		createModel: function () {

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isMobile: false
			}), "indexModel");

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isEdit: false,
				isSave: false,
				isCreated: false,
				oFormData: {
					calendarDate: null,
					rankingADD: [],
				},
				oFormDataFilter: {},
			}), "businessVisitModel");

			this.oViewModel = this.getView().getModel("businessVisitModel");
		},

		validateMobile: function () {

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if (bIsMobile) {
				this.getView().getModel("indexModel").setProperty("/isMobile", true);
			} else {
				this.getView().getModel("indexModel").setProperty("/isMobile", false);
			}

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

		// flushStore: function (entities) {
		// 	return new Promise(function (resolve, reject) {
		// 		if (typeof sap.hybrid !== 'undefined') {
		// 			sap.hybrid.flushStore(entities).then(function () {
		// 				resolve();
		// 			});
		// 		} else {
		// 			resolve();
		// 		}
		// 	}.bind(this));

		// },

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

		_validateDate: async function (oEvent) {
			
			if(this.oViewModel.oData.isEdit == false){
				
				let oDataModel = this.getOwnerComponent().getModel();
				let oBusinessVisitSevice = "/Business_Visit";
	
				var date = this.oViewModel.oData.oFormData.calendarDate; 
				var year = date.getFullYear();
				var month = date.getMonth();
	
				var firstDay = new Date(year, month, 1); 
				var lastDay = new Date(year, month + 1, 0);
				
				var oFilter = new sap.ui.model.Filter(
	            	"HCP_DATE", sap.ui.model.FilterOperator.BT, firstDay, lastDay
	            );
	
				const dataBusinessVisit = await new Promise(function (resove, reject) {
					oDataModel.read(oBusinessVisitSevice, {
						filters: [oFilter],
						success: function (data) {
							resove(data.results);
						}.bind(this),
						error: function (oError) {
							reject(oError);
						}.bind(this),
					});
				});
				
				if(dataBusinessVisit.length > 0){
					this.oViewModel.setProperty("/isSave", false);
					this.oViewModel.setProperty("/isCreated", true);
				} else{
					this.oViewModel.setProperty("/isCreated", false);
					this._validateForm();
				}
			} else {
				let oDataModel = this.getOwnerComponent().getModel();
				let oBusinessVisitSevice = "/Business_Visit";
	
				var date = this.oViewModel.oData.oFormData.calendarDate; 
				var year = date.getFullYear();
				var month = date.getMonth();
	
				var firstDay = new Date(year, month, 1); 
				var lastDay = new Date(year, month + 1, 0);
				
				var oFilter = new sap.ui.model.Filter(
	            	"HCP_DATE", sap.ui.model.FilterOperator.BT, firstDay, lastDay
	            );
	
				const dataBusinessVisit = await new Promise(function (resove, reject) {
					oDataModel.read(oBusinessVisitSevice, {
						filters: [oFilter],
						success: function (data) {
							resove(data.results);
						}.bind(this),
						error: function (oError) {
							reject(oError);
						}.bind(this),
					});
				});
				
				if(dataBusinessVisit.length > 0){
					this.oViewModel.setProperty("/isSave", false);
					this.oViewModel.setProperty("/isCreated", true);
				} else {
					this.oViewModel.setProperty("/isCreated", false);
					this._validateForm();
				}
				// this._validateForm();
			}

		},

		_validateForm: function (oEvent) {

			if (this.oViewModel.oData.oFormData.calendarDate && this.oViewModel.oData.oFormData.rankingADD.length > 0)
				this.oViewModel.setProperty("/isSave", true);
			else
				this.oViewModel.setProperty("/isSave", false);
		},

		_onSave: async function (oEvent) {
			this.setBusyDialog("App Grãos", "Cadastrando, aguarde");

			let oDataModel = this.getOwnerComponent().getModel();
			var sTimestamp = new Date().getTime();

			let oBusinessVisitSevice = "/Business_Visit";
			let oBusinessVisitRankSevice = "/Business_Visit_Rank";

			oDataModel.setUseBatch(true);

			if (this.oViewModel.oData.isEdit !== true) {

				let oBusinessVisitProperties = {
					HCP_ID: sTimestamp.toFixed(),
					HCP_DATE: this.oViewModel.oData.oFormData.calendarDate
				};

				const dataBusinessVisit = await new Promise(function (resove, reject) {
					oDataModel.create(oBusinessVisitSevice, oBusinessVisitProperties, {
						success: function (data) {
							resove(data);
						}.bind(this),
						error: function (oError) {
							reject(oError);
						}.bind(this),
					});
				});

				this.oViewModel.oData.oFormData.rankingADD.sort(function (a, b) {
					return a - b;
				});

				for (let i = 0; i < this.oViewModel.oData.oFormData.rankingADD.length; i++) {

					let oBusinessVisitRankProperties = {
						HCP_ID: sTimestamp.toFixed(),
						HCP_RANK_ID: parseInt(this.oViewModel.oData.oFormData.rankingADD[i]),
						HCP_BUSINESS_VISIT_ID: parseInt(dataBusinessVisit.HCP_ID)
					};

					oDataModel.create(oBusinessVisitRankSevice, oBusinessVisitRankProperties, {
						groupId: "changes",
					});
				}
			} else {

				let oBusinessVisitSeviceEdit = oBusinessVisitSevice + "(" + this.oViewModel.oData.oFormData.BusinessVisitID + "l)";

				let oBusinessVisitProperties = {
					HCP_ID: parseInt(this.oViewModel.oData.oFormData.BusinessVisitID),
					HCP_DATE: this.oViewModel.oData.oFormData.calendarDate
				};

				oDataModel.update(oBusinessVisitSeviceEdit, oBusinessVisitProperties, {
					groupId: "changes",
				});

				this.oViewModel.oData.oFormData.rankingADD.sort(function (a, b) {
					return a - b;
				});

				for (let i = 0; i < this.oViewModel.oData.oFormData.rankingADD.length; i++) {

					let oBusinessVisitRankProperties = {
						HCP_ID: sTimestamp.toFixed(),
						HCP_RANK_ID: parseInt(this.oViewModel.oData.oFormData.rankingADD[i]),
						HCP_BUSINESS_VISIT_ID: parseInt(this.oViewModel.oData.oFormData.BusinessVisitID)
					};

					oDataModel.create(oBusinessVisitRankSevice, oBusinessVisitRankProperties, {
						groupId: "changes",
					});
				}

				for (let i = 0; i < this.oViewModel.oData.oFormData.BusinessVisitRankID.length; i++) {

					let oBusinessVisitRankSeviceEdit = oBusinessVisitRankSevice + "(" + this.oViewModel.oData.oFormData.BusinessVisitRankID[i] + "l)";

					oDataModel.remove(oBusinessVisitRankSeviceEdit, {
						groupId: "changes",
					});
				}
			}

			oDataModel.submitChanges({
				groupId: "changes",
				success: function (data) {
					this.byId("table").getModel().refresh();
					MessageBox.success(
						"Parâmetros cadastrados com sucesso.", {
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (sAction) {
								this.closeBusyDialog();
							}.bind(this)
						}
					);
				}.bind(this),
				error: function (oError) {
					MessageBox.error("Erro ao cadastrar Parâmetros.");
				}.bind(this),
			});
			this._onClosePress(oEvent)
		},

		_oEditPress: function (oEvent) {
			this.oViewModel.setProperty("/isCreated", false);
			this.oViewModel.setProperty("/isEdit", true);

			let dataLine = oEvent.getSource().getBindingContext().getObject();

			this.oViewModel.oData.oFormData.calendarDate = dataLine.HCP_DATE;
			this.oViewModel.setProperty("/oFormData/BusinessVisitID", dataLine.HCP_ID);

			if (dataLine.Ranking_Add && dataLine.Ranking_Add.__list) {
				let ListID = [];
				for (var i = 0; i < dataLine.Ranking_Add.__list.length; i++) {
					var dataRankLine = this.getView().getModel().oData[dataLine.Ranking_Add.__list[i]];

					if (dataRankLine) {
						this.oViewModel.oData.oFormData.rankingADD.push(dataRankLine.HCP_RANK_ID);
						ListID.push(dataRankLine.HCP_ID);
					}
				}

				this.oViewModel.setProperty("/oFormData/BusinessVisitRankID", ListID);
			}

			this._openDialogRegion();
		},

		_openDialogRegion: function (oEvent) {
			if (this._FragmentPrice) {
				this._FragmentPrice.destroy();
				this._FragmentPrice = null;
			}
			
			this._FragmentPrice = sap.ui.xmlfragment("tablePriceId" + this.getView().getId(),
				"com.sap.build.standard.brfAppDeGraosModoEditar.view.masterData.fragments.businessVisitFragment",
				this);
			this.getView().addDependent(this._FragmentPrice);

			this._FragmentPrice.open();
		},

		_onClosePress: function (oEvent) {
			oEvent?.getSource?.getParent?.destroy();
			if (oEvent.getSource.getParent == undefined) {
				this._FragmentPrice.close();
			}
			
			this.oViewModel.oData.oFormData = {
				calendarDate: null,
				rankingADD: [],
			};
			this.oViewModel.setProperty("/isSave", false);
			this.oViewModel.setProperty("/isEdit", false);
			this.oViewModel.setProperty("/isCreated", false);
		},
		
		filterButtonPressed: function (oEvent) {
			if (!this._FragmentFilter) {
				this._FragmentFilter = sap.ui.xmlfragment(
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.masterData.fragments.filterDialogBusinessVisit",
					this);

				this.getView().addDependent(this._FragmentFilter);
			}

			this._FragmentFilter.openBy(oEvent.getSource());
		},

		submitFilterList: function (oEvent) {
			let oFilters = [];
			let oTable = this.getView().byId("table");
			
			if (this.oViewModel.oData.oFormDataFilter.dateYear) {
				let firstDayInYear = new Date(this.oViewModel.oData.oFormDataFilter.dateYear.getFullYear(), 0, 1)
				let lastDayInYear = new Date(this.oViewModel.oData.oFormDataFilter.dateYear.getFullYear(), 11, 31)
				
				oFilters.push(new sap.ui.model.Filter("HCP_DATE", sap.ui.model.FilterOperator.BT, firstDayInYear, lastDayInYear))
			}

			oTable.getBinding("items").filter(oFilters);

			this._FragmentFilter.close();
		}

	});
}, /* bExport= */ true);