sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.crop.ComposeExImages", {
		formatter: formatter,
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("crop.ComposeExImages").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableConfirm: false,
				regionEnabled: false,
			}), "ComposeExImages");
		},

		handleRouteMatched: function (oParameters) {
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));
			var oComposeExImagesModel = this.getView().getModel("ComposeExImages");
			var sKeyData = oParameters.getParameter("data").keyData;

			if (sKeyData) {
				var oKeys = JSON.parse(decodeURIComponent(sKeyData));
				oComposeExImagesModel.setProperty("/", oKeys);

				if (this.firstCropRepoKey && this.secondCropRepoKey) {
					var bNeedToLoad = this.firstCropRepoKey === oKeys.firstCropRepoKey && this.secondCropRepoKey === oKeys.secondCropRepoKey ? false :
						true;
					if (bNeedToLoad) {
						this.firstCropRepoKey = oKeys.firstCropRepoKey;
						this.secondCropRepoKey = oKeys.secondCropRepoKey;
						this.unsetImages();
						this.engageImageLoad(oKeys);
					}
				} else {
					this.firstCropRepoKey = oKeys.firstCropRepoKey;
					this.secondCropRepoKey = oKeys.secondCropRepoKey;
					this.unsetImages();
					this.engageImageLoad(oKeys);
				}
			}
		},

		engageImageLoad: function (oKeys) {
			this.getFolder(oKeys.firstCropRepoKey).then(data => {	
				this.loadImages(oKeys.firstCropRepoKey, "PLANTING_STAGE", 0, "crop1PlantingStageBusy");
			});

			this.getFolder(oKeys.secondCropRepoKey).then(data => {
				this.loadImages(oKeys.secondCropRepoKey, "PLANTING_STAGE", 1, "crop2PlantingStageBusy");
			});

			this.getFolder(oKeys.firstCropRepoKey).then(data => {
				this.loadImages(oKeys.firstCropRepoKey, "GERMINATION_STAGE", 0, "crop1GerminationStageBusy");
			});

			this.getFolder(oKeys.secondCropRepoKey).then(data => {
				this.loadImages(oKeys.secondCropRepoKey, "GERMINATION_STAGE", 1, "crop2GerminationStageBusy");
			});

			this.getFolder(oKeys.firstCropRepoKey).then(data => {
				this.loadImages(oKeys.firstCropRepoKey, "VEG_DEV_STAGE", 0, "crop1VegDevBusy");
			});

			this.getFolder(oKeys.secondCropRepoKey).then(data => {
				this.loadImages(oKeys.secondCropRepoKey, "VEG_DEV_STAGE", 1, "crop2VegDevBusy");
			});

			this.getFolder(oKeys.firstCropRepoKey).then(data => {
				this.loadImages(oKeys.firstCropRepoKey, "FLOWERING_STAGE", 0, "crop1FloweringBusy");
			});

			this.getFolder(oKeys.secondCropRepoKey).then(data => {
				this.loadImages(oKeys.secondCropRepoKey, "FLOWERING_STAGE", 1, "crop2FloweringBusy");
			});

			this.getFolder(oKeys.firstCropRepoKey).then(data => {
				this.loadImages(oKeys.firstCropRepoKey, "GRAIN_FORMATION_STAGE", 0, "crop1GrainFormationBusy");
			});

			this.getFolder(oKeys.secondCropRepoKey).then(data => {
				this.loadImages(oKeys.secondCropRepoKey, "GRAIN_FORMATION_STAGE", 1, "crop2GrainFormationBusy");
			});

			this.getFolder(oKeys.firstCropRepoKey).then(data => {
				this.loadImages(oKeys.firstCropRepoKey, "GRAIN_FILLING_STAGE", 0, "crop1GrainFillingBusy");
			});

			this.getFolder(oKeys.secondCropRepoKey).then(data => {
				this.loadImages(oKeys.secondCropRepoKey, "GRAIN_FILLING_STAGE", 1, "crop2GrainFillingBusy");
			});

			this.getFolder(oKeys.firstCropRepoKey).then(data => {
				this.loadImages(oKeys.firstCropRepoKey, "MATURATION_STAGE", 0, "crop1MaturationBusy");
			});

			this.getFolder(oKeys.secondCropRepoKey).then(data => {
				this.loadImages(oKeys.secondCropRepoKey, "MATURATION_STAGE", 1, "crop2MaturationBusy");
			});

			this.getFolder(oKeys.firstCropRepoKey).then(data => {
				this.loadImages(oKeys.firstCropRepoKey, "HARVEST_STAGE", 0, "crop1HarvestBusy");
			});

			this.getFolder(oKeys.secondCropRepoKey).then(data => {
				this.loadImages(oKeys.secondCropRepoKey, "HARVEST_STAGE", 1, "crop2HarvestBusy");
			});
		},

		loadImages: function (sRepoKey, sStageName, position, sBusy) {
			return new Promise(function (resolve, reject) {
				var aPromises = [];
				var oComposeExImagesModel = this.getView().getModel("ComposeExImages");

				this.getFolder(sRepoKey).then(data => {
					aPromises.push(new Promise(function (resolve, reject) {
						this.getFolder(sRepoKey + "/" + sStageName).then(data => {
							oComposeExImagesModel.setProperty("/" + sBusy, true);
							this.setImages(data, sRepoKey, sStageName, position).then(data => {
								oComposeExImagesModel.setProperty("/" + sBusy, false);
								resolve();
							}).catch(error => {
								reject(error);
							});
						}).catch(error => {
							console.log(error);
						});
					}.bind(this)));
				}).catch(error => {
					console.log(error);
				});
			}.bind(this));
		},

		getFolder: function (folderName) {
			return new Promise(function (resolve, reject) {
				var data = {
					cmisaction: "getFolderTree"
				};
				$.ajax("/cmisrepository/root/cropTracking/" + folderName, {
					type: "GET",
					data: data
				}).done(function (oData) {
					resolve(oData);
				}).fail(function (jqXHR) {
					reject(jqXHR);
				});
			}.bind(this));
		},

		setImages: function (data, sRepoKey, sStageName, position) {
			return new Promise(function (resolve, reject) {
				var aPromises = [];
				var oPanel = this.getView().byId(sStageName);
				var oCropRow = oPanel.getContent()[0].getContent()[0].getContent()[position];

				for (var prop in data.objects) {
					aPromises.push(new Promise(function (resolve, reject) {
						var oObject = data.objects[prop];
						$.ajax({
							type: 'GET',
							url: "/cmisrepository/root/cropTracking/" + sRepoKey + "/" + sStageName + "/" + oObject.object.properties[
								'cmis:name'].value,
							cache: false,
							async: true,
							xhr: function () {
								var xhr = new XMLHttpRequest();
								xhr.responseType = 'blob';
								return xhr;
							},
							success: function (data) {
								data.name = oObject.object.properties['cmis:name'].value;
								data.lastModifiedDate = new Date();
								resolve(data);
							},
							error: function (error) {
								reject(error);
							}
						});
					}.bind(this)));
				}

				Promise.all(aPromises).then(data => {
					var oPanel = this.getView().byId(sStageName);
					var oCropRow = oPanel.getContent()[0].getContent()[0].getContent()[position];
					var sCounter = 0;

					for (var image of data) {
						var url = URL.createObjectURL(image);
						var oImageContainer = oCropRow.getContent()[sCounter].getContent()[0];
						var oImageDetailBox = oImageContainer.getDetailBox().getImageContent()[0];

						oImageContainer.setSrc(url);
						oImageDetailBox.setImageSrc(url);
						sCounter = sCounter + 1;
					}
					resolve();
					console.log(data);
				}).catch(error => {
					reject(error);
				});
			}.bind(this));
		},

		unsetImages: function () {
			var oScrollContainer = this.getView().byId("scrollContainerID");
			var oPanels = oScrollContainer.getContent();

			for (var panel of oPanels) {
				var oCropRows = panel.getContent()[0].getContent()[0].getContent();

				for (var cropRow of oCropRows) {
					var oCropCells = cropRow.getContent();

					for (var cell of oCropCells) {
						var oImage = cell.getContent()[0];
						var oImageDetailBox = oImage.getDetailBox().getImageContent()[0];

						oImage.setSrc("");
						oImageDetailBox.setImageSrc("");
					}
				}
			}
		},

		initializeComposeReport: function () {
			return new Promise(function (resolve, reject) {
				var oComposeExModel = this.getView().getModel("composeExModel");
				var oModel = this.getView().getModel();
				var oData = oComposeExModel.getData();
				oModel.setUseBatch(false);
				var aPromises = [];

				aPromises.push(new Promise(function (resolve, reject) {
					var aFilters = [];

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_CROP',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_CROP_YEAR1
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_STATE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_STATE
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_REGIO',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_REGION
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_MATERIAL',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_MATERIAL
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_PERIOD',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_PERIOD1
					}));

					oModel.read("/Crop_Tracking", {
						filters: aFilters,
						urlParameters: {
							"$expand": "Crop_Track_Material,Crop_Track_Crop_Year,Crop_Track_Region"
						},
						success: function (data) {
							if (data.results.length > 0) {
								var oData = data.results[0];
								oComposeExModel.setProperty("/firstCrop", oData);
								resolve();
							}
						},
						error: function (error) {
							reject(error);
						}
					});

				}.bind(this)));
				aPromises.push(new Promise(function (resolve, reject) {
					var aFilters = [];

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_CROP',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_CROP_YEAR2
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_STATE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_STATE
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_REGIO',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_REGION
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_MATERIAL',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_MATERIAL
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_PERIOD',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_PERIOD2
					}));

					oModel.read("/Crop_Tracking", {
						filters: aFilters,
						urlParameters: {
							"$expand": "Crop_Track_Material,Crop_Track_Crop_Year,Crop_Track_Region"
						},
						success: function (data) {
							if (data.results.length > 0) {
								var oData = data.results[0];
								oComposeExModel.setProperty("/secondCrop", oData);
								resolve();
							}
						},
						error: function (error) {
							reject(error);
						}
					});
				}.bind(this)));

				Promise.all(aPromises).then(data => {
					resolve();
				}).catch(error => {
					reject(error);
				});
			}.bind(this));
		},

		setReportData: function (oData) {
			var teste = 1;

		},

		generateCharts: function () {

			setTimeout(function () {
				var oComposeExModel = this.getView().getModel("composeExModel");
				var oData = oComposeExModel.getData();
				var oFirstCrop = oData.firstCrop;
				var oSecondCrop = oData.secondCrop;

				am4core.useTheme(am4themes_animated);
				// am4core.useTheme(am4themes_dataviz);
				// Themes end

				// Create chart instance
				var chart = am4core.create("chartdiv", am4charts.XYChart3D);

				// Add percent sign to all numbers
				chart.numberFormatter.numberFormat = "#'%'";

				// Add data
				chart.data = [{
					"stage": "Germinação",
					"safra1": oFirstCrop.HCP_GERMINATION_STAGE,
					"safra2": oSecondCrop.HCP_GERMINATION_STAGE,
					"crop1": oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC,
					"crop2": oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC
				}, {
					"stage": "Desenvolvimento Vegetativo",
					"safra1": oFirstCrop.HCP_VEG_DEV_STAGE,
					"safra2": oSecondCrop.HCP_VEG_DEV_STAGE,
					"crop1": oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC,
					"crop2": oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC
				}, {
					"stage": "Floração",
					"safra1": oFirstCrop.HCP_FLOWERING_STAGE,
					"safra2": oSecondCrop.HCP_FLOWERING_STAGE,
					"crop1": oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC,
					"crop2": oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC
				}, {
					"stage": "Formação de Grãos",
					"safra1": oFirstCrop.HCP_GRAIN_FORMATION_STAGE,
					"safra2": oSecondCrop.HCP_GRAIN_FORMATION_STAGE,
					"crop1": oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC,
					"crop2": oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC
				}, {
					"stage": "Enchimento de Grãos",
					"safra1": oFirstCrop.HCP_GRAIN_FILLING_STAGE,
					"safra2": oSecondCrop.HCP_GRAIN_FILLING_STAGE,
					"crop1": oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC,
					"crop2": oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC
				}, {
					"stage": "Maturação",
					"safra1": oFirstCrop.HCP_MATURATION_STAGE,
					"safra2": oSecondCrop.HCP_MATURATION_STAGE,
					"crop1": oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC,
					"crop2": oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC
				}];

				// Create axes
				var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
				categoryAxis.dataFields.category = "stage";
				categoryAxis.renderer.grid.template.location = 0;
				categoryAxis.renderer.minGridDistance = 30;
				categoryAxis.renderer.labels.template.fontSize = 13;
				// categoryAxis.renderer.labels.template.rotation = 20;

				var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

				// Create series
				var series = chart.series.push(new am4charts.ColumnSeries3D());
				series.dataFields.valueY = "safra1";
				series.dataFields.categoryX = "stage";
				series.dataFields.crop1 = "crop1";
				series.clustered = false;
				series.name = "Safra " + oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC;
				series.tooltipText = "Safra {crop1}: [bold]{valueY}[/]";

				var series2 = chart.series.push(new am4charts.ColumnSeries3D());
				series2.dataFields.valueY = "safra2";
				series2.dataFields.categoryX = "stage";
				series.dataFields.crop2 = "crop2";
				series2.clustered = false;
				series2.name = "Safra " + oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC;
				series2.tooltipText = "Safra {crop2}: [bold]{valueY}[/]";

				var valueLabel = series.bullets.push(new am4charts.LabelBullet());
				valueLabel.label.text = "{valueY}";
				// valueLabel.label.horizontalCenter = "left";
				// valueLabel.label.dx = 2;
				// valueLabel.label.dy = 2;
				valueLabel.label.hideOversized = false;
				valueLabel.label.truncate = false;
				// valueLabel.locationY = 0.1;

				var valueLabel2 = series2.bullets.push(new am4charts.LabelBullet());
				valueLabel2.label.text = "{valueY}";
				// valueLabel2.label.horizontalCenter = "left";
				valueLabel2.label.dx = -4;
				valueLabel2.label.dy = -4;
				valueLabel2.label.hideOversized = false;
				valueLabel2.label.truncate = false;
				// valueLabel2.locationY = 0.2;

				chart.cursor = new am4charts.XYCursor();
				chart.cursor.lineX.disabled = true;
				chart.cursor.lineY.disabled = true;

				chart.legend = new am4charts.Legend();
				chart.legend.useDefaultMarker = true;
				var marker = chart.legend.markers.template.children.getIndex(0);
				marker.cornerRadius(12, 12, 12, 12);
				marker.strokeWidth = 2;
				marker.strokeOpacity = 1;
				marker.stroke = am4core.color("#ccc");

				var chart3 = am4core.create("chartdiv3", am4charts.XYChart3D);

				chart3.numberFormatter.numberFormat = "#'%'";

				chart3.data = [{
					"crop": oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC,
					"value": 20
				}, {
					"crop": oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC,
					"value": 50
				}];

				//create category axis for years
				var categoryAxis = chart3.yAxes.push(new am4charts.CategoryAxis());
				categoryAxis.dataFields.category = "crop";
				categoryAxis.renderer.inversed = true;
				categoryAxis.renderer.grid.template.location = 0;

				//create value axis for income and expenses
				var valueAxis = chart3.xAxes.push(new am4charts.ValueAxis());

				//create columns
				var series3 = chart3.series.push(new am4charts.ColumnSeries3D());
				series3.dataFields.categoryY = "crop";
				series3.dataFields.valueX = "value";
				series3.name = "Comercialização";
				series3.tooltipText = "{categoryY}: {valueX}";

				var valueLabel3 = series3.bullets.push(new am4charts.LabelBullet());
				valueLabel3.label.text = "{valueX}";
				//create line
				// var lineSeries = chart2.series.push(new am4charts.LineSeries());
				// lineSeries.dataFields.categoryY = "year";
				// lineSeries.dataFields.valueX = "expenses";
				// lineSeries.name = "Expenses";
				// lineSeries.strokeWidth = 3;
				// lineSeries.tooltipText = "Expenses in {categoryY}: {valueX.value}";

				// //add bullets
				// var circleBullet = lineSeries.bullets.push(new am4charts.CircleBullet());
				// circleBullet.circle.fill = am4core.color("#fff");
				// circleBullet.circle.strokeWidth = 2;

				//add chart cursor
				chart3.cursor = new am4charts.XYCursor();
				chart3.cursor.behavior = "zoomY";

				this.loadCommercialization().then(data => {
					this.createComercializationChart();
				}).catch(error => {
					this.setNotFoundCommercialization();
					console.log(error);
				});

				console.log(oComposeExModel.getProperty("/"));

			}.bind(this), 100);

		},

		setNotFoundCommercialization: function () {
			var oComposeExModel = this.getView().getModel("composeExModel");
			var oModel = this.getView().getModel();
			var oData = oComposeExModel.getData();
			var oFirstCrop = oData.firstCrop;
			var oSecondCrop = oData.secondCrop;
			var oFirstCommercialization = oData.firstCommercialization;
			var oSecondCommercialization = oData.secondCommercialization;

			var chart2 = am4core.create("chartdiv2", am4charts.XYChart3D);

			chart2.numberFormatter.numberFormat = "#'%'";

			chart2.data = [];

			//create category axis for years
			var categoryAxis2 = chart2.yAxes.push(new am4charts.CategoryAxis());

			categoryAxis2.dataFields.category = "crop";
			categoryAxis2.renderer.inversed = true;
			categoryAxis2.renderer.grid.template.location = 0;

			var valueAxis2 = chart2.xAxes.push(new am4charts.ValueAxis());

			var series2 = chart2.series.push(new am4charts.ColumnSeries3D());
			series2.dataFields.categoryY = "crop";
			series2.dataFields.valueX = "value";
			series2.name = "value";
			series2.tooltipText = "Sem Correspondência";

			var valueLabel2 = series2.bullets.push(new am4charts.LabelBullet());
			valueLabel2.label.text = "{valueX}";
			chart2.cursor = new am4charts.XYCursor();
			chart2.cursor.behavior = "zoomY";

		},

		createComercializationChart: function () {
			var oComposeExModel = this.getView().getModel("composeExModel");
			var oModel = this.getView().getModel();
			var oData = oComposeExModel.getData();
			var oFirstCrop = oData.firstCrop;
			var oSecondCrop = oData.secondCrop;
			var oFirstCommercialization = oData.firstCommercialization;
			var oSecondCommercialization = oData.secondCommercialization;

			var chart2 = am4core.create("chartdiv2", am4charts.XYChart3D);

			chart2.numberFormatter.numberFormat = "#'%'";

			chart2.data = [{
				"crop": oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC,
				"value": oFirstCommercialization.HCP_TOTAL_NEGOTIATION_PERCENT
			}, {
				"crop": oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC,
				"value": oSecondCommercialization.HCP_TOTAL_NEGOTIATION_PERCENT
			}];

			//create category axis for years
			var categoryAxis2 = chart2.yAxes.push(new am4charts.CategoryAxis());

			categoryAxis2.dataFields.category = "crop";
			categoryAxis2.renderer.inversed = true;
			categoryAxis2.renderer.grid.template.location = 0;

			var valueAxis2 = chart2.xAxes.push(new am4charts.ValueAxis());

			var series2 = chart2.series.push(new am4charts.ColumnSeries3D());
			series2.dataFields.categoryY = "crop";
			series2.dataFields.valueX = "value";
			series2.name = "value";
			series2.tooltipText = "{categoryY}: {valueX.value}";

			var valueLabel2 = series2.bullets.push(new am4charts.LabelBullet());
			valueLabel2.label.text = "{valueX}";
			chart2.cursor = new am4charts.XYCursor();
			chart2.cursor.behavior = "zoomY";
		},

		loadCommercialization: function () {
			return new Promise(function (resolve, reject) {
				var oComposeExModel = this.getView().getModel("composeExModel");
				var oModel = this.getView().getModel();
				var oData = oComposeExModel.getData();
				oModel.setUseBatch(false);
				var aPromises = [];

				aPromises.push(new Promise(function (resolve, reject) {
					var aFilters = [];

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_CROP',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_CROP_YEAR1
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_STATE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_STATE
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_REGIO',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_REGION
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_MATERIAL',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_MATERIAL
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_PERIOD',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_PERIOD1.slice(0, 2)
					}));

					oModel.read("/Commercialization", {
						filters: aFilters,
						success: function (data) {
							if (data.results.length > 0) {
								var oData = data.results[0];
								oComposeExModel.setProperty("/firstCommercialization", oData);
								resolve();
							} else {
								reject();
							}
						},
						error: function (error) {
							reject(error);
						}
					});

				}.bind(this)));
				aPromises.push(new Promise(function (resolve, reject) {
					var aFilters = [];

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_CROP',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_CROP_YEAR2
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_STATE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_STATE
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_REGIO',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_REGION
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_MATERIAL',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_MATERIAL
					}));

					aFilters.push(new sap.ui.model.Filter({
						path: 'HCP_PERIOD',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oData.HCP_PERIOD2.slice(0, 2)
					}));

					oModel.read("/Commercialization", {
						filters: aFilters,
						success: function (data) {
							if (data.results.length > 0) {
								var oData = data.results[0];
								oComposeExModel.setProperty("/secondCommercialization", oData);
								resolve();
							} else {
								reject();
							}
						},
						error: function (error) {
							reject(error);
						}
					});
				}.bind(this)));

				Promise.all(aPromises).then(data => {
					resolve();
					console.log(data);
				}).catch(error => {
					reject(error);
				});
			}.bind(this));
		},

		fillAddInfo: function () {
			var oComposeExModel = this.getView().getModel("composeExModel");
			var oFirstCrop = oComposeExModel.getProperty("/firstCrop");
			var oSecondCrop = oComposeExModel.getProperty("/secondCrop");
			var aScFirstCropCost = (parseInt(oFirstCrop.HCP_PROD_COST) / parseInt(oFirstCrop.HCP_PRODUCTIVITY)) / 16.67;
			var aScSecondCropCost = (parseInt(oSecondCrop.HCP_PROD_COST) / parseInt(oSecondCrop.HCP_PRODUCTIVITY)) / 16.67;
			var aCropPlantVariation = this.getDaysBetweenDates(oFirstCrop.HCP_START_CROP, oSecondCrop.HCP_START_CROP);
			var aCropHvstVariation = this.getDaysBetweenDates(oFirstCrop.HCP_START_HRVST, oSecondCrop.HCP_START_HRVST);
			var aPlantingAreaVariation = this.getPercentageBetweenValues(oFirstCrop.HCP_PLANTING_AREA, oSecondCrop.HCP_PLANTING_AREA);
			var aProductivityVariation = this.getPercentageBetweenValues(oFirstCrop.HCP_PRODUCTIVITY, oSecondCrop.HCP_PRODUCTIVITY);
			var aProdCostVariation = this.getPercentageBetweenValues(oFirstCrop.HCP_PROD_COST, oSecondCrop.HCP_PROD_COST);
			var aProdCostSCVariation = this.getPercentageBetweenValues(aScFirstCropCost, aScSecondCropCost);

			oComposeExModel.setProperty("/firstCrop/HCP_PROD_COST_SC", aScFirstCropCost);
			oComposeExModel.setProperty("/secondCrop/HCP_PROD_COST_SC", aScSecondCropCost);
			oComposeExModel.setProperty("/HCP_CROP_PLANT_VAR", aCropPlantVariation);
			oComposeExModel.setProperty("/HCP_CROP_HVST_VAR", aCropHvstVariation);
			oComposeExModel.setProperty("/HCP_PLANTING_AREA_VAR", aPlantingAreaVariation);
			oComposeExModel.setProperty("/HCP_PPRODUCTIVITY_VAR", aProductivityVariation);
			oComposeExModel.setProperty("/HCP_PROD_COST_VAR", aProdCostVariation);
			oComposeExModel.setProperty("/HCP_PROD_COST_SC_VAR", aProdCostSCVariation);

			oComposeExModel.refresh();
		},

		getDaysBetweenDates: function (data1, data2) {
			return Math.floor((data1 - data2) / 86400000);
		},

		getPercentageBetweenValues: function (value1, value2) {
			var sdif = parseInt(value2) - parseInt(value1);

			if (sdif === 0) {
				return sdif
			} else {
				return parseInt(sdif / parseInt(value2) * 100);
			}
		},

		onImagePress: function () {
			var oComposeExModel = this.getView().getModel("composeExModel");
			var oData = oComposeExModel.getData();
			var oFirstCrop = oData.firstCrop;
			var oSecondCrop = oData.secondCrop;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.navTo("crop.ComposeExImages", {
				keyData: JSON.stringify(oKeyData)
			});
		},

		refreshData: function () {
			var oDeviceModel = this.getOwnerComponent().getModel("device");
			var bIsMobile = oDeviceModel.getData().browser.mobile;

			if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				this.setBusyDialog("App Grãos", "Aguarde");
				this.flushStore().then(function () {
					this.refreshStore("Crop_Tracking").then(function () {
						this.getView().getModel().refresh(true);
						this.getView().byId("pullToRefreshID").hide();
						this.closeBusyDialog();
					}.bind(this));
				}.bind(this));
			} else {
				this.getView().getModel().refresh(true);
				this.getView().byId("pullToRefreshID").hide();
				this.closeBusyDialog();
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

		onCreateOrEditCrop: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("crop.Filter", true);
		},

		_onConfirm: function () {
			var oComposeFilterModel = this.getView().getModel("composeExFilterModel");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

		},

		sortButtonPressed: function (oEvent) {
			if (!this.SortDialog) {
				this.SortDialog = sap.ui.xmlfragment("com.sap.build.standard.brfAppDeGraosModoEditar.view.prospects.fragments.SortDialog",
					this);

				this.getView().addDependent(this.SortDialog);
			}

			this.SortDialog.openBy(oEvent.getSource());
		},

		filterButtonPressed: function (oEvent) {
			if (!this._FragmentFilter) {
				this._FragmentFilter = sap.ui.xmlfragment(
					"com.sap.build.standard.brfAppDeGraosModoEditar.view.prospects.fragments.FragmentFilter",
					this);

				var oModelFilters = new sap.ui.model.json.JSONModel({
					HCP_CODE: "",
					NAME1: "",
					BLAND: "",
					HCP_CREATED_AT: ""
				});

				this.getView().setModel(oModelFilters, "filters");
				this.getView().addDependent(this._FragmentFilter);

			}

			this._FragmentFilter.openBy(oEvent.getSource());
		},

		_validateForm: function () {
			setTimeout(function () {
				var aInputControls = this._getFormFields();
				var oControl;
				var oComposeFilterModel = this.getView().getModel("composeExFilterModel");

				for (var m = 0; m < aInputControls.length; m++) {
					oControl = aInputControls[m].control;
					if (aInputControls[m].required) {
						var sValue = oControl.getValue();
						if (!sValue || oControl.getValueState() !== 'None') {
							oComposeFilterModel.setProperty("/enableConfirm", false);
							return;
						}
					}
				}
				oComposeFilterModel.setProperty("/enableConfirm", true);
			}.bind(this), 100);
		},

		_validateStates: function (oEvent) {
			var oComposeFilterModel = this.getView().getModel("composeExFilterModel");
			var sSelectedKey = oEvent.getSource().getSelectedKey();
			var oRegionCB = this.getView().byId("regionCBId");
			var oData = oComposeFilterModel.getData();
			var oFilters = [];

			oFilters.push(new sap.ui.model.Filter("HCP_BLAND", sap.ui.model.FilterOperator.EQ, sSelectedKey));

			oRegionCB.getBinding("items").filter(oFilters);

			setTimeout(function () {
				if (oRegionCB.getItems().length > 0) {
					oComposeFilterModel.setProperty("/regionEnabled", true);
				} else {
					oComposeFilterModel.setProperty("/regionEnabled", false);
				}
			}.bind(this), 500);
			this._validateForm();
		},

		_getFormFields: function () {
			var oKeysForm = this.byId("locationform").getContent();
			var oCrop1Form = this.byId("cropkeysform1").getContent();
			var oCrop2Form = this.byId("cropkeysform2").getContent();

			var oMainDataForm = [];

			oMainDataForm = oMainDataForm.concat(oKeysForm).concat(oCrop1Form).concat(oCrop2Form);

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
		}
	});
});