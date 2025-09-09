sap.ui.define([
	'jquery.sap.global',
	"com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	'sap/ui/model/Filter',
	'sap/ui/model/json/JSONModel',
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (jQuery, MainController, Filter, JSONModel, History, formatter) {
	"use strict";

	var IconTabBarController = MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.visitForm.Edit", {

		formatter: formatter,
		instanceSortDialog: null,
		instanceSortDialogCommercialization: null,
		instanceFilterDialog: null,
		instanceFilterDialogCommercialization: null,

		onInit: function (oEvent) {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("visitForm.Edit").attachDisplay(this.handleRouteMatched, this);
			let oIconTabBar = this.getView().byId("idIconTabBar");
			
			oIconTabBar.setSelectedKey("Yearly")
			sessionStorage.setItem("tabIconVisitForm", "Yearly")
			
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isFilteredYearly: false,
				isFilteredPeriodic: false,
				isFilteredGrains: false,
				isFilteredIndustry: false,
			}), "isFilteredModel");
		},

		handleRouteMatched: function () {
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));
			
			var oIconTabBar = this.getView().byId("idIconTabBar");
			
			let tabIconVisitFormAlreadyExist = sessionStorage.getItem("tabIconVisitForm")
			
			if (!tabIconVisitFormAlreadyExist) {
				oIconTabBar.setSelectedKey("Yearly")
				sessionStorage.setItem("tabIconVisitForm", "Yearly")
			} else {
				oIconTabBar.setSelectedKey(tabIconVisitFormAlreadyExist);
			}
			
			this.getView().getModel().refresh(true);
		},

		handleIconTabBarSelect: function (oEvent) {
			var sKey = oEvent.getParameter("key");

			this._iconTableView(oEvent, sKey);
		},

		onCancelPress: function () {
			this.navBack();
		},

		navBack: function (oEvent) {
			let oHistory = History.getInstance();
			let sPreviousHash = oHistory.getPreviousHash();
			let oIconTabBar = this.getView().byId("idIconTabBar");
			
			let oFilters = [];
			let oSorter = [];
			let oSorterCommercialization = [];
			let listTableViews = [];
			
			oIconTabBar.setSelectedKey("Yearly")
			sessionStorage.setItem("tabIconVisitForm", "Yearly")
			
			this.instanceSortDialog = null;
			this.instanceSortDialogCommercialization = null;
			this.instanceFilterDialog = null;
			this.instanceFilterDialogCommercialization = null;
			
			let oSelectedColumnCommercialization = sap.ui.core.Fragment.byId("sortVisitFormCommecialization" + this.getView().getId(), "group_column");
			let oSelectedSortCommercialization = sap.ui.core.Fragment.byId("sortVisitFormCommecialization" + this.getView().getId(), "group_sort");
			
			let oSelectedColumn = sap.ui.core.Fragment.byId("sortVisitForm" + this.getView().getId(), "group_column");
			let oSelectedSort = sap.ui.core.Fragment.byId("sortVisitForm" + this.getView().getId(), "group_sort");
			
			oSelectedColumnCommercialization && oSelectedColumnCommercialization.destroy();
			oSelectedSortCommercialization && oSelectedSortCommercialization.destroy();
			oSelectedColumn && oSelectedColumn.destroy();
			oSelectedSort && oSelectedSort.destroy();
			
			let oModelFilters = new JSONModel({
				NAME1: "",
				HCP_CONTACT_TYPE: "",
				HCP_CONTACT_INICIATIVE: "",
				HCP_VISIT_FORM: "",
				HCP_CREATED_AT: "",
				HCP_CREATED_BY: ""
			});
	
			let oModelFiltersCommercialization = new JSONModel({
				HCP_COMMERCIALIZATION_ID: "",
				HCP_PARTNER: "",
				HCP_TYPE_COMMERCIALIZATION: "",
				HCP_CREATED_AT: "",
				HCP_CREATED_BY: ""
			});
			
			oSorter.push(new sap.ui.model.Sorter({
				path: 'HCP_CREATED_AT',
				descending: true
			}));
			
			oSorterCommercialization.push(new sap.ui.model.Sorter({
				path: 'HCP_COMMERCIALIZATION_ID',
				descending: true
			}));
			
			this.getView().setModel(oModelFilters, "filters");
			this.getView().setModel(oModelFiltersCommercialization, "filtersCommercialization");
			
			let tableYearly = this.getView().byId("tableYealy")
			let tablePeriodic = this.getView().byId("tablePeriodic")
			let tableGrains = this.getView().byId("tableGrains")
			let tableIndustry = this.getView().byId("tableIndustry")
			let tableCommecializationTab = this.getView().byId("tableCommecializationTab")
			
			listTableViews.push(tableCommecializationTab)
			listTableViews.push(tableIndustry)
			listTableViews.push(tableGrains)
			listTableViews.push(tablePeriodic)
			listTableViews.push(tableYearly)
			
			listTableViews.map(table => {
				let template
				let sBindingPath = "/View_Visit_" + table.oParent.mProperties.key
				
				if (table.oParent.mProperties.key == "Commercialization") {
					template = this.generateColumnListVisitFormCommercialization()
	
					table.bindItems({
						path: sBindingPath,
						sorter: oSorterCommercialization,
						filters: oFilters,
						template: template
					});
				} else {
					template = this.generateColumnListVisitForm()
					
					table.bindItems({
						path: sBindingPath,
						sorter: oSorter,
						filters: oFilters,
						template: template
					});
				}
			})
		
			this.getView().getModel("isFilteredModel").setProperty("/isFilteredYearly", false);
			this.getView().getModel("isFilteredModel").setProperty("/isFilteredPeriodic", false);
			this.getView().getModel("isFilteredModel").setProperty("/isFilteredGrains", false);
			this.getView().getModel("isFilteredModel").setProperty("/isFilteredIndustry", false);
			
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
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
			let oModel = this.getView().getModel("isFilteredModel")
			let oData = oModel.oData
			let oSource = oEvent.getSource();
			let oTabFilters = oSource.getItems();
			let oSelectedTab;
			let oTable;
			let sBindingPath;
			let sExpand;
			let sText;

			sessionStorage.setItem("tabIconVisitForm", sKey);

			for (let filter of oTabFilters) {
				if (filter.getKey() === sKey) {
					oSelectedTab = filter;
				}
			}

			oTable = oSelectedTab.getContent()[0];
			
			if (sKey == 'Commercialization') {
				let oFilterModel = this.getView().getModel("filtersCommercialization");
				let oFilterData = oFilterModel?.getProperty("/");
				
				let oFilters = this.valuesFiltersCommercialization(oFilterData)
				
				sBindingPath = "/View_Visit_" + sKey;
	
				this.onBindingItemsTable(oTable, oFilters)
			} else {
				var oFilterModel = this.getView()?.getModel("filters");
				var oFiltertData = oFilterModel?.getProperty("/");
				let isNeedFilter = false;
				
				let oFilters = this.valuesFilters(oFilterModel, oFiltertData)
				
				if (sKey == "Yearly" && oData.isFilteredYearly) {
					isNeedFilter = true
				} else if (sKey == "Periodic" && oData.isFilteredPeriodic) {
					isNeedFilter = true
				} else if (sKey == "Grains" && oData.isFilteredGrains) {
					isNeedFilter = true
				} else if (sKey == "Industry" && oData.isFilteredIndustry) {
					isNeedFilter = true
				}
				
				if (isNeedFilter)
					this.onBindingItemsTable(oTable, oFilters)
				else
					this.onBindingItemsTable(oTable, [])
			}
		},
		
		onBindingItemsTable: function (oTable, filters) {
			let sKey = sessionStorage.getItem("tabIconVisitForm");
			let oModel = this.getView().getModel("isFilteredModel")
			let oData = oModel.oData
			let template;
			let sorter = []
			
			let sBindingPath = "/View_Visit_" + sKey;
			
			if (sKey == "Commercialization") {
				let oSelectedColumn = sap.ui.core.Fragment.byId("sortVisitFormCommecialization" + this.getView().getId(), "group_column")?.getSelectedButton()?.getId();
				let oSelectedSort = sap.ui.core.Fragment.byId("sortVisitFormCommecialization" + this.getView().getId(), "group_sort")?.getSelectedButton()?.getId();
				
				if (oSelectedColumn && oSelectedSort) {
					oSelectedColumn = oSelectedColumn.split("visitForm.Edit--")
					oSelectedSort = oSelectedSort.split("visitForm.Edit--")
					
					sorter.push(new sap.ui.model.Sorter({
						path: oSelectedColumn[1],
						descending: oSelectedSort[1] === "descending" ? true : false,
						upperCase: false
					}));
				} else {
					sorter.push(new sap.ui.model.Sorter({
						path: 'HCP_COMMERCIALIZATION_ID',
						descending: true
					}));
				}
				
				template = this.generateColumnListVisitFormCommercialization()	
			} else {
				let oSelectedColumn = sap.ui.core.Fragment.byId("sortVisitForm" + this.getView().getId(), "group_column")?.getSelectedButton()?.getId();
				let oSelectedSort = sap.ui.core.Fragment.byId("sortVisitForm" + this.getView().getId(), "group_sort")?.getSelectedButton()?.getId();
				
				if (oSelectedColumn && oSelectedSort) {
					oSelectedColumn = oSelectedColumn.split("visitForm.Edit--")
					oSelectedSort = oSelectedSort.split("visitForm.Edit--")
					
					sorter.push(new sap.ui.model.Sorter({
						path: oSelectedColumn[1],
						descending: oSelectedSort[1] === "descending" ? true : false,
						upperCase: false
					}));
				} else {
					sorter.push(new sap.ui.model.Sorter({
						path: 'HCP_CREATED_AT',
						descending: true
					}));
				}
				
				if (sKey == 'Periodic') {
					template = this.generateColumnListVisitFormPeriodic();
				}else {
					template = this.generateColumnListVisitForm();
				}
				
			}
			
			oTable.bindItems({
				path: sBindingPath,
				sorter: sorter,
				filters: filters,
				template: template
			});
		},
		
		generateColumnListVisitFormPeriodic: function () {
			let oColumnListItem = new sap.m.ColumnListItem({
				type: "Active",
				press: this._onRowPress.bind(this),
				cells: [
					new sap.m.ObjectIdentifier({
					    title: "{= ${NAME_LIFNR} !== null ? ${NAME_LIFNR} : ${NAME_LIFNR_BR} !== null ? ${NAME_LIFNR_BR} : ${NAME_PROSPECT} !== null ? ${NAME_PROSPECT} : ${NAME_LIFNR_EXT} !== null ? ${NAME_LIFNR_EXT} : ${HCP_NAME_REGISTERED}}"
					}),
					(new sap.m.Text()).bindText({
						path: "HCP_CONTACT_TYPE",
						formatter: this.formatter.setContactType
					}),
					new sap.m.Text({
						text: "{HCP_CONTACT_INICIATIVE}",
						width: "auto",
						maxLines: 1,
						wrapping: false,
						textAlign: "Begin",
						textDirection: "Inherit",
						visible: true
					}),
					new sap.m.Text({
						text: "{HCP_VISIT_FORM}",
						width: "auto",
						maxLines: 1,
						wrapping: false,
						textAlign: "Begin",
						textDirection: "Inherit",
						visible: true
					}),
					new sap.m.Text({
						text: "{ path: 'HCP_CREATED_AT', type: 'sap.ui.model.type.DateTime', formatOptions: { style: 'full', UTC: false, pattern: 'dd/MM/yyyy HH:mm:ss' } }",
						width: "auto",
						maxLines: 1,
						wrapping: false,
						textAlign: "Begin",
						textDirection: "Inherit",
						visible: true
					}),
					new sap.m.Text({
						text: "{HCP_CREATED_BY}",
						width: "auto",
						maxLines: 1,
						wrapping: false,
						textAlign: "Begin",
						textDirection: "Inherit",
						visible: true
					})
				]
			});
			
			return oColumnListItem
		},
		
		generateColumnListVisitForm: function () {
			let oColumnListItem = new sap.m.ColumnListItem({
				type: "Active",
				press: this._onRowPress.bind(this),
				cells: [
					new sap.m.ObjectIdentifier({
						title: "{= ${NAME_LIFNR} !== null ? ${NAME_LIFNR} : ${NAME_PROSPECT} !== null ? ${NAME_PROSPECT} : ${HCP_NAME_REGISTERED}}"
					}),
					(new sap.m.Text()).bindText({
						path: "HCP_CONTACT_TYPE",
						formatter: this.formatter.setContactType
					}),
					new sap.m.Text({
						text: "{HCP_CONTACT_INICIATIVE}",
						width: "auto",
						maxLines: 1,
						wrapping: false,
						textAlign: "Begin",
						textDirection: "Inherit",
						visible: true
					}),
					new sap.m.Text({
						text: "{HCP_VISIT_FORM}",
						width: "auto",
						maxLines: 1,
						wrapping: false,
						textAlign: "Begin",
						textDirection: "Inherit",
						visible: true
					}),
					new sap.m.Text({
						text: "{ path: 'HCP_CREATED_AT', type: 'sap.ui.model.type.DateTime', formatOptions: { style: 'full', UTC: false, pattern: 'dd/MM/yyyy HH:mm:ss' } }",
						width: "auto",
						maxLines: 1,
						wrapping: false,
						textAlign: "Begin",
						textDirection: "Inherit",
						visible: true
					}),
					new sap.m.Text({
						text: "{HCP_CREATED_BY}",
						width: "auto",
						maxLines: 1,
						wrapping: false,
						textAlign: "Begin",
						textDirection: "Inherit",
						visible: true
					})
				]
			});
			
			return oColumnListItem
		},
		
		generateColumnListVisitFormCommercialization: function () {
			let oColumnListItem = new sap.m.ColumnListItem({
				type: "Active",
				press: this._onRowPress.bind(this),
				cells: [
					new sap.m.Text({
						text: "{HCP_COMMERCIALIZATION_ID}",
						width: "auto",
						maxLines: 1,
						wrapping: false,
						textAlign: "Begin",
						textDirection: "Inherit",
						visible: true
					}),
					new sap.m.Text({
						text: "{HCP_PARTNER}",
						width: "auto",
						maxLines: 1,
						wrapping: false,
						textAlign: "Begin",
						textDirection: "Inherit",
						visible: true
					}),
					new sap.m.Text({
						text: "{HCP_TYPE_COMMERCIALIZATION}",
						width: "auto",
						maxLines: 1,
						wrapping: false,
						textAlign: "Begin",
						textDirection: "Inherit",
						visible: true
					}),
					new sap.m.Text({
						text: "{ path: 'HCP_CREATED_AT', type: 'sap.ui.model.type.DateTime', formatOptions: { style: 'full', UTC: false, pattern: 'dd/MM/yyyy HH:mm:ss' } }",
						width: "auto",
						maxLines: 1,
						wrapping: false,
						textAlign: "Begin",
						textDirection: "Inherit",
						visible: true
					}),
					new sap.m.Text({
						text: "{HCP_CREATED_BY}",
						width: "auto",
						maxLines: 1,
						wrapping: false,
						textAlign: "Begin",
						textDirection: "Inherit",
						visible: true
					})
				]
			});
			
			return oColumnListItem
		},

		_onRowPress: function (oEvent) {
			var oIconTabBar = this.getView().byId("idIconTabBar");
			var sSelectedTab = oIconTabBar.getSelectedKey();
			var sView = "visitForm.Edit" + sSelectedTab + "VisitForm";
			var oItem = oEvent.getSource();

			this.oRouter.navTo(sView, {
				keyData: encodeURIComponent(oItem.getBindingContext().getPath())
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
					this.flushStore(
						"Visit_Form_Grains,Visit_Form_Yearly,Visit_Form_Industry,Visit_Form_Periodic,Visit_Uf_Planting,Visit_Culture_Type,Visit_Storage_Type,Visit_Form_Tools,Visit_Form_Material,Visit_Form_Criterion,Visit_Form_Certifications,View_Visit_Grains,View_Visit_Industry,View_Visit_Yearly,View_Visit_Periodic"
					).then(function () {
						this.refreshStore(aRefreshView).then(function () {
							this.getView().getModel().refresh(true);
							//this.getView().byId("pullToRefreshID").hide();
							this.closeBusyDialog();
						}.bind(this));
					}.bind(this));
				} else {
					this.getView().getModel().refresh(true);
					//this.getView().byId("pullToRefreshID").hide();
					this.closeBusyDialog();
				}

			}.bind(this), 1000);
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
			if (!this.instanceSortDialog) {
				this.instanceSortDialog = sap.ui.xmlfragment("sortVisitForm" +  this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.visitForm.fragments.SortDialog", this);
		
				this.getView().addDependent(this.instanceSortDialog);
			}
		
			this.instanceSortDialog.openBy(oEvent.getSource());
		},
		
		submitSortList: function (oEvent) {
			let oIconTabBar = this.getView().byId("idIconTabBar");
			let sSelectedTab = oIconTabBar.getSelectedKey();
			let oTabFilters = oIconTabBar.getItems();
			let oSelectedTab;
			let oTable;
			let oSorter = [];
		
			for (let filter of oTabFilters) {
				if (filter.getKey() === sSelectedTab) {
					oSelectedTab = filter;
				}
			}
		
			oTable = oSelectedTab.getContent()[0];
			
			let oSelectedColumn = sap.ui.core.Fragment.byId("sortVisitForm" + this.getView().getId(), "group_column").getSelectedButton().getId();
			let oSelectedSort = sap.ui.core.Fragment.byId("sortVisitForm" + this.getView().getId(), "group_sort").getSelectedButton().getId();
			
			oSelectedColumn = oSelectedColumn.split("visitForm.Edit--")
			oSelectedSort = oSelectedSort.split("visitForm.Edit--")
		
			oSorter.push(new sap.ui.model.Sorter({
				path: oSelectedColumn[1],
				descending: oSelectedSort[1] === "descending" ? true : false,
				upperCase: false
			}));
		
			oTable.getBinding("items").sort(oSorter);
		
			this.instanceSortDialog.close();
		},
		
		filterButtonPressed: function (oEvent) {
			if (!this.instanceFilterDialog) {
				this.instanceFilterDialog = sap.ui.xmlfragment("filterVisitForm" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.visitForm.fragments.FragmentFilter", this);
		
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
				this.getView().addDependent(this.instanceFilterDialog);
			}
		
			this.instanceFilterDialog.openBy(oEvent.getSource());
		},
		
		submitFilterList: function (oEvent) {
			let oIconTabBar = this.getView().byId("idIconTabBar");
			let sSelectedTab = oIconTabBar.getSelectedKey();
			let oTabFilters = oIconTabBar.getItems();
			let oSelectedTab;
			let oTable;
			let oFilterModel = this.getView().getModel("filters");
			let oFiltertData = oFilterModel.getProperty("/");
			let oFilters = [];
			let sPath;
		
			for (let filter of oTabFilters) {
				if (filter.getKey() === sSelectedTab) {
					oSelectedTab = filter;
				}
			}
		
			oTable = oSelectedTab.getContent()[0];
		
			oFilters = this.valuesFilters(oFilterModel, oFiltertData)
			
			this.onBindingItemsTable(oTable, oFilters)
			
			if (oFilters.length == 0) {
				this.getView().getModel("isFilteredModel").setProperty("/isFilteredYearly", false);
				this.getView().getModel("isFilteredModel").setProperty("/isFilteredPeriodic", false);
				this.getView().getModel("isFilteredModel").setProperty("/isFilteredGrains", false);
				this.getView().getModel("isFilteredModel").setProperty("/isFilteredIndustry", false);
			}
			
			if (sSelectedTab == "Yearly") {
				this.getView().getModel("isFilteredModel").setProperty("/isFilteredYearly", true);
			} else if (sSelectedTab == "Periodic") {
				this.getView().getModel("isFilteredModel").setProperty("/isFilteredPeriodic", true);
			} else if (sSelectedTab == "Grains") {
				this.getView().getModel("isFilteredModel").setProperty("/isFilteredGrains", true);
			} else if (sSelectedTab == "Industry") {
				this.getView().getModel("isFilteredModel").setProperty("/isFilteredIndustry", true);
			}
		
			this.instanceFilterDialog.close();
		},
		
		valuesFilters: function (oFilterModel, oFiltertData) {
			let oFilters = [];
			if (oFiltertData) {	
				let oName1 = oFiltertData?.NAME1.toUpperCase();
				let oCreatedBy = oFiltertData.HCP_CREATED_BY;
				
				if (oFilterModel.oData.yesPartner === true) {
					oFiltertData.NAME1 ? oFilters.push(new sap.ui.model.Filter("HCP_NAME_REGISTERED", sap.ui.model.FilterOperator.Contains,
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
		
				let date_start = oFiltertData.HCP_START_DATE ? new Date(oFiltertData.HCP_START_DATE.setHours(0)) : '';
				let HCP_START_DATE = date_start ? date_start.setDate(date_start.getDate() + 1) : false;
		
				let date_end = oFiltertData.HCP_END_DATE ? new Date(oFiltertData.HCP_END_DATE.setHours(23, 40)) : '';
				let HCP_END_DATE = date_end ? date_end.setDate(date_end.getDate() + 1) : false;
		
				if (HCP_START_DATE && HCP_END_DATE) {
					oFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
						.BT,
						new Date(HCP_START_DATE), new Date(HCP_END_DATE)));
				}
			}
			
			return oFilters;
		},
		
		sortCommercializationButtonPressed: function (oEvent) {
			if (!this.instanceSortDialogCommercialization) {
				this.instanceSortDialogCommercialization = sap.ui.xmlfragment("sortVisitFormCommecialization" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.visitForm.fragments.SortDialogCommercialization", this);
				this.getView().addDependent(this.instanceSortDialogCommercialization);
			}

			this.instanceSortDialogCommercialization.openBy(oEvent.getSource());
		},
		
		submitSortCommercializationList: function (oEvent) {
			let oSelectedColumn = sap.ui.core.Fragment.byId("sortVisitFormCommecialization" + this.getView().getId(), "group_column")?.getSelectedButton()?.getId();
			let oSelectedSort = sap.ui.core.Fragment.byId("sortVisitFormCommecialization" + this.getView().getId(), "group_sort")?.getSelectedButton()?.getId();
			let oTable = this.getView().byId("tableCommecializationTab");
			let oSorter = [];
			
			oSelectedColumn = oSelectedColumn.split("visitForm.Edit--")
			oSelectedSort = oSelectedSort.split("visitForm.Edit--")
		
			oSorter.push(new sap.ui.model.Sorter({
				path: oSelectedColumn[1],
				descending: oSelectedSort[1] === "descending" ? true : false,
				upperCase: false
			}));
		
			oTable.getBinding("items").sort(oSorter);
		
			this.instanceSortDialogCommercialization.close();
		},
		
		filterCommercializationButtonPressed: function (oEvent) {
			if (!this.instanceFilterDialogCommercialization) {
				this.instanceFilterDialogCommercialization = sap.ui.xmlfragment("filterVisitFormCommecialization" + this.getView().getId(),
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.visitForm.fragments.FilterDialogCommercialization",
					this);
			
				let oModelFilters = new JSONModel({
					HCP_COMMERCIALIZATION_ID: "",
					HCP_PARTNER: "",
					HCP_TYPE_COMMERCIALIZATION: "",
					HCP_CREATED_AT: "",
					HCP_CREATED_BY: ""
				});
			
				this.getView().setModel(oModelFilters, "filtersCommercialization");
				this.getView().addDependent(this.instanceFilterDialogCommercialization);
			}
		
			this.instanceFilterDialogCommercialization.openBy(oEvent.getSource());
		},
		
		submitFilterListCommercialization: function (oEvent) {
			let oFilterModel = this.getView().getModel("filtersCommercialization");
			let oFilterData = oFilterModel.getProperty("/");
			let oFilters = [];
			let oTable = this.getView().byId("tableCommecializationTab");
			
			oFilters = this.valuesFiltersCommercialization(oFilterData)
			
			this.onBindingItemsTable(oTable, oFilters)
			
			this.instanceFilterDialogCommercialization.close();
		},
		
		valuesFiltersCommercialization: function (oFilterData) {
			if (oFilterData) {
				let oFilters = [];
				
				let partnerName = oFilterData.HCP_PARTNER.toUpperCase();
			
				oFilterData.HCP_COMMERCIALIZATION_ID ? oFilters.push(new sap.ui.model.Filter("HCP_COMMERCIALIZATION_ID", sap.ui.model.FilterOperator
					.EQ, oFilterData.HCP_COMMERCIALIZATION_ID)) : false;
				oFilterData.HCP_PARTNER ? oFilters.push(new sap.ui.model.Filter("HCP_PARTNER", sap.ui.model.FilterOperator.Contains, partnerName)) :
					false;
				oFilterData.HCP_TYPE_COMMERCIALIZATION ? oFilters.push(new sap.ui.model.Filter("HCP_TYPE_COMMERCIALIZATION", sap.ui.model.FilterOperator
					.Contains, oFilterData.HCP_TYPE_COMMERCIALIZATION)) : false;
			
				oFilterData.HCP_CREATED_AT ? oFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator.EQ, oFilterData.HCP_CREATED_AT)) :
					false;
				oFilterData.HCP_CREATED_BY ? oFilters.push(new sap.ui.model.Filter("HCP_CREATED_BY", sap.ui.model.FilterOperator.Contains,
					oFilterData.HCP_CREATED_BY)) : false;
					
				let date_start = oFilterData.HCP_START_DATE ? new Date(oFilterData.HCP_START_DATE.setHours(0)) : '';
				let HCP_START_DATE = date_start ? date_start.setDate(date_start.getDate() + 1) : false;
			
				let date_end = oFilterData.HCP_END_DATE ? new Date(oFilterData.HCP_END_DATE.setHours(23, 40)) : '';
				let HCP_END_DATE = date_end ? date_end.setDate(date_end.getDate() + 1) : false;
			
				if (HCP_START_DATE && HCP_END_DATE) {
					oFilters.push(new sap.ui.model.Filter("HCP_CREATED_AT", sap.ui.model.FilterOperator
						.BT,
						new Date(HCP_START_DATE), new Date(HCP_END_DATE)));
				}
				
				return oFilters;
			}
		}
	});

	return IconTabBarController;

});