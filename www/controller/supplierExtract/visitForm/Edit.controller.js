sap.ui.define([
	'jquery.sap.global',
	"com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	'sap/ui/model/Filter',
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/routing/History"
], function (jQuery, MainController, Filter, JSONModel, History) {
	"use strict";

	var IconTabBarController = MainController.extend(
		"com.sap.build.standard.brfAppDeGraosModoEditar.controller.supplierExtract.visitForm.Edit", {

			onInit: function (oEvent) {

				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getTarget("supplierExtract.visitForm.Edit").attachDisplay(this.handleRouteMatched, this);
			},

			handleRouteMatched: function (oEvent) {

				this.getUser().then(function (userName) {
					this.userName = userName;
				}.bind(this));
				var oIconTabBar = this.getView().byId("idIconTabBar");
				oIconTabBar.setSelectedKey("Yearly");
				//this.getView().getModel().refresh(true);
				this.getView().setModel(new sap.ui.model.json.JSONModel({
					isMobile: false
				}), "ExtractViewModel");

				if (oEvent.getParameter("data")) {
					this.filters = JSON.parse(decodeURIComponent(oEvent.getParameter("data").filters));

					var typeData = this.filters.typeData;
					this.supplierID = this.filters.supplierID;
					this.start_date = this.filters.start_date;
					this.end_date = this.filters.end_date;
				}

				this.getVisitFormData();
				//	this.refreshData();
			},

			handleIconTabBarSelect: function (oEvent) {
				var sKey = oEvent.getParameter("key");

				this._iconTableView(oEvent, sKey);

			},

			onCancelPress: function () {
				this.navBack();
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

			setTypePartner: function () {

				var oModelFilter = this.getView().getModel("filters");
				oModelFilter.setProperty("/yesProspect", false);
				oModelFilter.setProperty("/yesPartner", true);
				oModelFilter.setProperty("/typeFilterr", "Digite o nome do Fornecedor");

			},

			_onInputFormSelect: function (oEvent) {

				var oModelFilter = this.getView().getModel("filters");
				var oInput = oEvent.getSource();

				if (oInput.getSelectedKey() === "Fornecedor") {

					oModelFilter.setProperty("/yesProspect", false);
					oModelFilter.setProperty("/yesPartner", true);

				} else {

					oModelFilter.setProperty("/yesProspect", true);
					oModelFilter.setProperty("/yesPartner", false);

				}

				oModelFilter.setProperty("/typeFilterr", "Digite o nome do " + oInput.getSelectedKey());

			},

			_iconTableView: function (oEvent, sKey) {

				var oData;
				var result = [];
				var oCreatedAt;
				var array;
				var oExtractModel = this.getView().getModel("ExtractViewModel");

				switch (sKey) {
				case 'Yearly':
					oData = this.filters.TileCollection[0];
					break;
				case 'Grains':
					oData = this.filters.TileCollection[1];
					break;
				case 'Industry':
					oData = this.filters.TileCollection[2];
					break;
				case 'Periodic':
					oData = this.filters.TileCollection[3];
					break;
				default:
				}

				var expandKey = "Visit_Form_Partner_" + sKey;

				for (var item of oData) {

					oCreatedAt = this.formatterDate(new Date(item.HCP_CREATED_AT), true);

					array = {
						id: item.HCP_VISIT_ID,
						SUPPLIER_NAME: item[expandKey].NAME1 ? item[expandKey].NAME1 : item[expandKey].NAME1,
						HCP_CONTACT_TYPE: item.HCP_CONTACT_TYPE,
						HCP_CONTACT_INICIATIVE: item.HCP_CONTACT_INICIATIVE,
						HCP_VISIT_FORM: item.HCP_VISIT_FORM,
						HCP_CREATED_AT: oCreatedAt,
						HCP_CREATED_BY: item.HCP_CREATED_BY
					};

					result.push(array);
				}

				oExtractModel.setProperty("/data", result);

			},

			_onRowPress: function (oEvent) {

				var oIconTabBar = this.getView().byId("idIconTabBar");
				var sSelectedTab = oIconTabBar.getSelectedKey();
				var sView = "visitForm.Edit" + sSelectedTab + "VisitForm";
				var oItem = oEvent.getSource();

				var sPlit = oEvent.getSource().oBindingContexts.ExtractViewModel.sPath.split("/");
				var sIndex = sPlit[2];
				var oId = oEvent.getSource().oBindingContexts.ExtractViewModel.oModel.oData.data[sIndex].id;
				var sPath;
				
				sPath = this.buildPath("Visit_Form_" + sSelectedTab, oId);

				this.oRouter.navTo(sView, {
					keyData: encodeURIComponent(sPath),
					operation: "View"
				});

			},

			refreshData: function (oEvent, sKey) {
				var oDeviceModel = this.getOwnerComponent().getModel("device");
				var bIsMobile = oDeviceModel.getData().browser.mobile;
				var aRefreshView = ["Visit_Form_Grains", "Visit_Form_Yearly", "Visit_Form_Industry", "Visit_Form_Periodic", "Visit_Uf_Planting",
					"Visit_Culture_Type", "Visit_Storage_Type", "Visit_Form_Tools", "Visit_Form_Material", "Visit_Form_Criterion",
					"Visit_Form_Certifications", "View_Visit_Grains", "View_Visit_Industry", "View_Visit_Yearly", "View_Visit_Periodic"
				];

				// this._iconTableView(oEvent, sKey);
				this.setBusyDialog("App Grãos", "Aguarde");
				setTimeout(function () {
					if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
						this.flushStore().then(function () {
							this.refreshStore(aRefreshView).then(function () {
								this.getView().getModel().refresh(true);
								//this.getView().byId("pullToRefreshID").hide();
								this.closeBusyDialog();
							}.bind(this));
						}.bind(this));
					} else {
						this.getView().getModel().refresh(true);
					//	this.getView().byId("pullToRefreshID").hide();
						this.closeBusyDialog();
					}

				}.bind(this), 1000);
			},

			flushStore: function () {
				return new Promise(function (resolve, reject) {
					if (typeof sap.hybrid !== 'undefined') {
						sap.hybrid.flushStore().then(function () {
							resolve();
						});
					} else {
						resolve();
					}
				}.bind(this));

			},

			refreshStore: function (entity1) {
				return new Promise(function (resolve, reject) {
					if (typeof sap.hybrid !== 'undefined') {
						// this.setBusyDialog("App Grãos", "Atualizando banco de dados");
						sap.hybrid.refreshStore(entity1).then(function () {
							resolve();
						}.bind(this));
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

			sortButtonPressed: function (oEvent) {

				if (!this.SortDialog) {
					this.SortDialog = sap.ui.xmlfragment("com.sap.build.standard.brfAppDeGraosModoEditar.view.visitForm.fragments.SortDialog",
						this);

					this.getView().addDependent(this.SortDialog);
				}

				this.SortDialog.openBy(oEvent.getSource());
			},

			submitSortList: function (oEvent) {
				var oIconTabBar = this.getView().byId("idIconTabBar");
				var sSelectedTab = oIconTabBar.getSelectedKey();
				var oTabFilters = oIconTabBar.getItems();
				var oSelectedTab;
				var oTable;

				for (var filter of oTabFilters) {
					if (filter.getKey() === sSelectedTab) {
						oSelectedTab = filter;
					}
				}

				oTable = oSelectedTab.getContent()[0];

				var oSelectedColumn = sap.ui.getCore().byId("group_column").getSelectedButton().getId();
				var oSelectedSort = sap.ui.getCore().byId("group_sort").getSelectedButton().getId();

				var oSorter = [];

				oSorter.push(new sap.ui.model.Sorter({
					path: oSelectedColumn,
					descending: oSelectedSort === "descending" ? true : false,
					upperCase: false
				}));

				oTable.getBinding("items").sort(oSorter);

				this.SortDialog.close();
			},

			filterButtonPressed: function (oEvent) {

				if (!this._FragmentFilter) {
					this._FragmentFilter = sap.ui.xmlfragment(
						"com.sap.build.standard.brfAppDeGraosModoEditar.view.visitForm.fragments.FragmentFilter",
						this);

					var oModelFilters = new JSONModel({
						NAME1: "",
						HCP_CONTACT_TYPE: "",
						HCP_CONTACT_INICIATIVE: "",
						HCP_VISIT_FORM: "",
						HCP_CREATED_AT: "",
						HCP_CREATED_BY: ""
					});

					this.getView().setModel(oModelFilters, "filters");
					this.setTypePartner();
					this.getView().addDependent(this._FragmentFilter);

				}

				this._FragmentFilter.openBy(oEvent.getSource());
			},

			submitFilterList: function (oEvent) {

				var oIconTabBar = this.getView().byId("idIconTabBar");
				var sSelectedTab = oIconTabBar.getSelectedKey();
				var oTabFilters = oIconTabBar.getItems();
				var oSelectedTab;
				var oTable;

				for (var filter of oTabFilters) {
					if (filter.getKey() === sSelectedTab) {
						oSelectedTab = filter;
					}
				}

				oTable = oSelectedTab.getContent()[0];

				var oFilterModel = this.getView().getModel("filters");
				var oFiltertData = oFilterModel.getProperty("/");
				var oFilters = [];
				var sPath;

				var oName1 = oFiltertData.NAME1.toUpperCase();
				var oCreatedBy = oFiltertData.HCP_CREATED_BY;

				if (oFilterModel.oData.yesPartner === true) {
					oFiltertData.NAME1 ? oFilters.push(new sap.ui.model.Filter("NAME_LIFNR", sap.ui.model.FilterOperator.Contains,
							oName1)) :
						false;
				} else {
					oFiltertData.NAME1 ? oFilters.push(new sap.ui.model.Filter("NAME_PROSPECT", sap.ui.model.FilterOperator.Contains,
							oName1)) :
						false;
				}

				oFiltertData.HCP_CONTACT_TYPE ? oFilters.push(new sap.ui.model.Filter("HCP_CONTACT_TYPE", sap.ui.model.FilterOperator.Contains,
						oFiltertData.HCP_CONTACT_TYPE)) :
					false;

				oFiltertData.HCP_CONTACT_INICIATIVE ? oFilters.push(new sap.ui.model.Filter("HCP_CONTACT_INICIATIVE", sap.ui.model.FilterOperator
					.EQ,
					oFiltertData.HCP_CONTACT_INICIATIVE)) : false;

				oFiltertData.HCP_VISIT_FORM ? oFilters.push(new sap.ui.model.Filter("HCP_VISIT_FORM", sap.ui.model.FilterOperator.EQ,
					oFiltertData.HCP_VISIT_FORM)) : false;

				oFiltertData.HCP_CREATED_BY ? oFilters.push(new sap.ui.model.Filter("HCP_CREATED_BY", sap.ui.model.FilterOperator.EQ,
					oCreatedBy)) : false;

				var date_start = oFiltertData.HCP_START_DATE ? new Date(oFiltertData.HCP_START_DATE.setHours(0)) : '';
				var HCP_START_DATE = date_start ? date_start.setDate(date_start.getDate() + 1) : false;

				var date_end = oFiltertData.HCP_END_DATE ? new Date(oFiltertData.HCP_END_DATE.setHours(23, 40)) : '';
				var HCP_END_DATE = date_end ? date_end.setDate(date_end.getDate() + 1) : false;

				if (HCP_START_DATE && HCP_END_DATE) {
					oFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
						.BT,
						new Date(HCP_START_DATE), new Date(HCP_END_DATE)));
				}

				oTable.getBinding("items").filter(oFilters);

				this._FragmentFilter.close();
			},
			getVisitFormData: function () {
				var oData = this.filters.TileCollection[0];
				var result = [];
				var oCreatedAt;
				var array;

				var oExtractModel = this.getView().getModel("ExtractViewModel");

				for (var item of oData) {

					oCreatedAt = this.formatterDate(new Date(item.HCP_CREATED_AT), true);

					array = {
						id: item.HCP_VISIT_ID,
						SUPPLIER_NAME: item.Visit_Form_Partner_Yearly.NAME1 ? item.Visit_Form_Partner_Yearly.NAME1 : item.Visit_Form_Prospect_Yearly.NAME1,
						HCP_CONTACT_TYPE: item.HCP_CONTACT_TYPE,
						HCP_CONTACT_INICIATIVE: item.HCP_CONTACT_INICIATIVE,
						HCP_VISIT_FORM: item.HCP_VISIT_FORM,
						HCP_CREATED_AT: oCreatedAt,
						HCP_CREATED_BY: item.HCP_CREATED_BY
					};

					result.push(array);
				}

				oExtractModel.setProperty("/data", result);

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
				buildPath: function (sEntityName, id) {

			return "/" + sEntityName + "(" + id + "l)";

		}
		});

	return IconTabBarController;

});