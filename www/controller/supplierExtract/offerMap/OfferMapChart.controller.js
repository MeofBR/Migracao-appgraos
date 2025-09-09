sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function (MainController, MessageBox, History) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.supplierExtract.offerMap.OfferMapChart", {
		handleRouteMatched: function (oEvent) {

			if (oEvent.getParameter("arguments")) {
				this.filters = JSON.parse(decodeURIComponent(decodeURIComponent(oEvent.getParameter("arguments").filters)));

				var typeData = this.filters.typeData;
				this.supplierID = this.filters.supplierID;
				this.start_date = this.filters.start_date;
				this.end_date = this.filters.end_date;

				this.getChartData();
			}

		},

		getChartData: function (status) {

			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;
			//	this.setBusyDialog("Intenção de preços", "Filtrando dados...");

			var oView = this.getView(),
				oData = {},
				self = this;
			var oModel = new sap.ui.model.json.JSONModel();
			oView.setModel(oModel, "offerDataModel");
			self.oBindingParameters = {};

			var statusOfferMap = oView.getModel("offerMapChart");

			var filteredStatus1 = this.filters.TileCollection[0].filter(function (item) {
				return item.HCP_STATES_OFFER == '1'; //Em aberto
			});

			var filteredStatus2 = this.filters.TileCollection[0].filter(function (item) {
				return item.HCP_STATES_OFFER == '2'; //Comprado Parcialmente
			});

			var filteredStatus3 = this.filters.TileCollection[0].filter(function (item) {
				return item.HCP_STATES_OFFER == '3'; //Finalizado
			});

			var filteredStatus4 = this.filters.TileCollection[0].filter(function (item) {
				return item.HCP_STATES_OFFER == '4'; //Cancelada
			});

			var filteredStatus5 = this.filters.TileCollection[0].filter(function (item) {
				return item.HCP_STATES_OFFER == '5'; //Com Erro
			});

			oData[
				"offerMapChart"
			] = {};

			oData[
				"offerMapChart"
			]["data"] = [{
				"Status": "Em Aberto",
				"Quantidade": filteredStatus1.length,
				"__id": 0
			}, {
				"Status": "Comprada Parcialmente",
				"Quantidade": filteredStatus2.length,
				"__id": 1
			}, {
				"Status": "Finalizada",
				"Quantidade": filteredStatus3.length,
				"__id": 2
			}, {
				"Status": "Cancelada",
				"Quantidade": filteredStatus4.length,
				"__id": 3
			}, {
				"Status": "Com Erro",
				"Quantidade": filteredStatus5.length,
				"__id": 4
			}];

			self.oBindingParameters[
				'offerMapChart'
			] = {
				"path": "/offerMapChart/data",
				"model": "offerDataModel",
				"parameters": {}
			};

			oData[
				"offerMapChart"
			]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oView.getModel("offerDataModel").setData(oData, true);

			function dateDimensionFormatter(oDimensionValue, sTextValue) {
				var oValueToFormat = sTextValue !== undefined ? sTextValue : oDimensionValue;
				if (oValueToFormat instanceof Date) {
					var oFormat = sap.ui.core.format.DateFormat.getDateInstance({
						style: "short"
					});
					return oFormat.format(oValueToFormat);
				}
				return oValueToFormat;
			}
			var aDimensions = oView.byId(
				"offerMapChart"
			).getDimensions();
			aDimensions.forEach(function (oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			//statusOfferMap.setProperty("/ItemIntentionInactive", filteredStatus1);
			//statusOfferMap.setProperty("/ItemIntentionInactive", filteredStatus2);
			//statusOfferMap.setProperty("/ItemIntentionInactive", filteredStatus3);
			//statusOfferMap.setProperty("/ItemIntentionInactive", filteredStatus4);
			//statusOfferMap.setProperty("/ItemIntentionInactive", filteredStatus5);

			var oChart,
				oBindingParameters = this.oBindingParameters;

			oChart = oView.byId(
				"offerMapChart"
			);
			oChart.bindData(oBindingParameters[
				'offerMapChart'
			]);

			//this.closeBusyDialog();

		},

		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;
			var oOfferModel = this.getView().getModel("offerDataModel");
			var oData = oOfferModel.oData;
			oOfferModel.setProperty("/start_date", this.start_date);
			oOfferModel.setProperty("/end_date", this.end_date);

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
								masterContext: sMasterContext,
								filters: encodeURIComponent(JSON.stringify(oData))
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName, {
					filters: encodeURIComponent(JSON.stringify(oData))
				}, false);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}
		},
		applyFiltersAndSorters: function (sControlId, sAggregationName, chartBindingInfo) {
			if (chartBindingInfo) {
				var oBindingInfo = chartBindingInfo;
			} else {
				var oBindingInfo = this.getView().byId(sControlId).getBindingInfo(sAggregationName);
			}
			var oBindingOptions = this.updateBindingOptions(sControlId);
			this.getView().byId(sControlId).bindAggregation(sAggregationName, {
				model: oBindingInfo.model,
				path: oBindingInfo.path,
				parameters: oBindingInfo.parameters,
				template: oBindingInfo.template,
				templateShareable: true,
				sorter: oBindingOptions.sorters,
				filters: oBindingOptions.filters
			});

		},
		updateBindingOptions: function (sCollectionId, oBindingData, sSourceId) {
			this.mBindingOptions = this.mBindingOptions || {};
			this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};

			var aSorters = this.mBindingOptions[sCollectionId].sorters;
			var aGroupby = this.mBindingOptions[sCollectionId].groupby;

			// If there is no oBindingData parameter, we just need the processed filters and sorters from this function
			if (oBindingData) {
				if (oBindingData.sorters) {
					aSorters = oBindingData.sorters;
				}
				if (oBindingData.groupby || oBindingData.groupby === null) {
					aGroupby = oBindingData.groupby;
				}
				// 1) Update the filters map for the given collection and source
				this.mBindingOptions[sCollectionId].sorters = aSorters;
				this.mBindingOptions[sCollectionId].groupby = aGroupby;
				this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
				this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];
			}

			// 2) Reapply all the filters and sorters
			var aFilters = [];
			for (var key in this.mBindingOptions[sCollectionId].filters) {
				aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
			}

			// Add the groupby first in the sorters array
			if (aGroupby) {
				aSorters = aSorters ? aGroupby.concat(aSorters) : aGroupby;
			}

			var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
			return {
				filters: aFinalFilters,
				sorters: aSorters
			};

		},
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//	this.oRouter.getTarget("JExtratoFornOfertasStatus").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.oRouter.getRoute("supplierExtract.offerMap.OfferMapChart").attachPatternMatched(this.handleRouteMatched, this);

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
			_onOfferMapFormTile: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			var oOfferModel = this.getView().getModel("offerDataModel");

			//	var sPath = oEvent.getSource().oBindingContexts.supplierExtract.sPath;
			//	var lastChar = sPath.substr(sPath.length - 1);
			var sRoute;

			oOfferModel.setProperty("/typeData", 'OfferMap');
			oOfferModel.setProperty("/TileCollection", this.filters.TileCollection[0]);
			sRoute = "supplierExtract.offerMap.Index";

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("supplierExtract.offerMap.Index", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		}
	});
}, /* bExport= */ true);