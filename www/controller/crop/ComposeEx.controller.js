sap.ui.define(["com/sap/build/standard/brfAppDeGraosModoEditar/controller/MainController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/formatter"
], function (MainController, MessageBox, History, formatter) {
	"use strict";

	return MainController.extend("com.sap.build.standard.brfAppDeGraosModoEditar.controller.crop.ComposeEx", {
		formatter: formatter,
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("crop.ComposeEx").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				enableConfirm: false,
				regionEnabled: false,
				commercializationTitle: "Comercialização"
			}), "composeExModel");
		},

		handleRouteMatched: function (oParameters) {
			this.getUser().then(function (userName) {
				this.userName = userName;
			}.bind(this));
			var oComposeExModel = this.getView().getModel("composeExModel");
			var sKeyData = oParameters.getParameter("data").keyData;

			if (sKeyData) {
				var oKeys = JSON.parse(sKeyData);
				oComposeExModel.setProperty("/", oKeys);

				this.initializeComposeReport().then(data => {
					this.fillAddInfo();
					// this.setReportData(data);
					// console.log(data);
					this.generateCharts();
				}).catch(error => {
					console.log(error);
				});
				// this.generateCharts();
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
								var oData = data.results[data.results.length-1];
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
								var oData = data.results[data.results.length-1];
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

				var chart = am4core.create("chartdiv", am4charts.XYChart);
				chart.colors.list = [
					am4core.color("#003186"),
					am4core.color("#2b98cd")
				];
				//chart.color (["#333333","#cccccc"]);

				// Add percent sign to all numbers
				chart.numberFormatter.numberFormat = "#'%'";

				// Add data
				chart.data = [{
					"stage": "Plantio",
					"safra1": Math.round(oFirstCrop.HCP_PLANTING_STAGE),
					"safra2": Math.round(oSecondCrop.HCP_PLANTING_STAGE),
					"crop1": oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oFirstCrop.HCP_PERIOD.slice(0, 2),
					"crop2": oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oSecondCrop.HCP_PERIOD.slice(0, 2),
					"color": "#cccccc"
				}, {
					"stage": "Germinação",
					"safra1": Math.round(oFirstCrop.HCP_GERMINATION_STAGE),
					"safra2": Math.round(oSecondCrop.HCP_GERMINATION_STAGE),
					"crop1": oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oFirstCrop.HCP_PERIOD.slice(0, 2),
					"crop2": oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oSecondCrop.HCP_PERIOD.slice(0, 2),
					"color": "#cccccc"
				}, {
					"stage": "Desenvolvimento Vegetativo",
					"safra1": Math.round(oFirstCrop.HCP_VEG_DEV_STAGE),
					"safra2": Math.round(oSecondCrop.HCP_VEG_DEV_STAGE),
					"crop1": oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oFirstCrop.HCP_PERIOD.slice(0, 2),
					"crop2": oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oSecondCrop.HCP_PERIOD.slice(0, 2),
					"color": "#cccccc"
				}, {
					"stage": "Floração",
					"safra1": Math.round(oFirstCrop.HCP_FLOWERING_STAGE),
					"safra2": Math.round(oSecondCrop.HCP_FLOWERING_STAGE),
					"crop1": oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oFirstCrop.HCP_PERIOD.slice(0, 2),
					"crop2": oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oSecondCrop.HCP_PERIOD.slice(0, 2),
					"color": "#cccccc"
				}, {
					"stage": "Formação de Grãos",
					"safra1": Math.round(oFirstCrop.HCP_GRAIN_FORMATION_STAGE),
					"safra2": Math.round(oSecondCrop.HCP_GRAIN_FORMATION_STAGE),
					"crop1": oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oFirstCrop.HCP_PERIOD.slice(0, 2),
					"crop2": oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oSecondCrop.HCP_PERIOD.slice(0, 2),
					"color": "#cccccc"
				}, {
					"stage": "Enchimento de Grãos",
					"safra1": Math.round(oFirstCrop.HCP_GRAIN_FILLING_STAGE),
					"safra2": Math.round(oSecondCrop.HCP_GRAIN_FILLING_STAGE),
					"crop1": oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oFirstCrop.HCP_PERIOD.slice(0, 2),
					"crop2": oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oSecondCrop.HCP_PERIOD.slice(0, 2),
					"color": "#cccccc"
				}, {
					"stage": "Maturação",
					"safra1": Math.round(oFirstCrop.HCP_MATURATION_STAGE),
					"safra2": Math.round(oSecondCrop.HCP_MATURATION_STAGE),
					"crop1": oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oFirstCrop.HCP_PERIOD.slice(0, 2),
					"crop2": oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oSecondCrop.HCP_PERIOD.slice(0, 2),
					"color": "#cccccc"
				}];

				// Create axes
				var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
				categoryAxis.min = 0; // Define o valor mínimo do eixo Y como 0%
				categoryAxis.max = 120; // Define o valor máximo do eixo Y como 120%
				categoryAxis.strictMinMax = true; // Garante que o gráfico respeite os valores min e max
				categoryAxis.dataFields.category = "stage";
				categoryAxis.renderer.grid.template.location = 0;
				categoryAxis.renderer.minGridDistance = 30;
				categoryAxis.renderer.cellStartLocation = 0.1;
				categoryAxis.renderer.cellEndLocation = 0.9;

				if (window.innerWidth > 1366) {
					categoryAxis.renderer.labels.template.fontSize = 13;
				} else {
					categoryAxis.renderer.labels.template.fontSize = 10;
				}
				// categoryAxis.renderer.labels.template.rotation = 20;

				var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
				valueAxis.min = 0; // Define o valor mínimo do eixo Y como 0%
				valueAxis.max = 120; // Define o valor máximo do eixo Y como 120%
				valueAxis.strictMinMax = true; // Garante que o gráfico respeite os valores min e max

				// Create series
				var series = chart.series.push(new am4charts.ColumnSeries());
				series.dataFields.valueY = "safra1";
				series.dataFields.categoryX = "stage";
				series.dataFields.crop1 = "crop1";
				series.clustered = true;
				series.name = "Safra " + oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oFirstCrop.HCP_PERIOD.slice(0, 2) + " - " + oFirstCrop.HCP_PERIOD.slice(2, 6);
				series.tooltipText = "Safra {crop1}: [bold]{valueY}[/]";
				series.columns.template.width = am4core.percent(90);
				

				var series2 = chart.series.push(new am4charts.ColumnSeries());
				series2.dataFields.valueY = "safra2";
				series2.dataFields.categoryX = "stage";
				series.dataFields.crop2 = "crop2";
				series2.clustered = true;
				series2.name = "Safra " + oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oSecondCrop.HCP_PERIOD.slice(0, 2) + " - " + oSecondCrop.HCP_PERIOD.slice(2, 6);
				series2.tooltipText = "Safra {crop2}: [bold]{valueY}[/]";
				series2.columns.template.width = am4core.percent(90);

				var valueLabel = series.bullets.push(new am4charts.LabelBullet());
				valueLabel.label.text = "{valueY}";
				valueLabel.label.dy = -10;
				valueLabel.label.hideOversized = false;
				valueLabel.label.truncate = false;

				var valueLabel2 = series2.bullets.push(new am4charts.LabelBullet());
				valueLabel2.label.text = "{valueY}";
				valueLabel2.label.dy = -10;
				valueLabel2.label.hideOversized = false;
				valueLabel2.label.truncate = false;

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
				
				
				//gráfico avanço colheita
				var chart3 = am4core.create("chartdiv3", am4charts.XYChart);
				chart3.colors.list = [
					am4core.color("#003186"),
					am4core.color("#2b98cd")
				];
				
				chart3.numberFormatter.numberFormat = "#'%'";
				chart3.data = [
				  {
				  	"crop": "Safras",
				    "value1": parseInt(oFirstCrop.HCP_HARVEST_STAGE),
				    "value2": parseInt(oSecondCrop.HCP_HARVEST_STAGE),
				  }
				];
				
				// Crie uma categoria de eixo para anos
				var categoryAxis = chart3.yAxes.push(new am4charts.CategoryAxis());
				categoryAxis.dataFields.category = "crop";
				categoryAxis.renderer.inversed = true;
				categoryAxis.renderer.grid.template.location = 0;
				
				// Crie um eixo de valor para renda e despesas
				var valueAxis = chart3.xAxes.push(new am4charts.ValueAxis());
				valueAxis.min = 0;   // Define o valor mínimo para 0%
				valueAxis.max = 120; // Mantém o valor máximo em 120%
				valueAxis.strictMinMax = true; // Garante que o gráfico respeite os valores min e max
				valueAxis.renderer.minGridDistance = 50;
				
				// Configuração para mostrar marcas a cada 20%
				valueAxis.renderer.minLabelPosition = 0;
				valueAxis.renderer.maxLabelPosition = 1;
				valueAxis.interval = 20;
				
				// Crie colunas
				var series3 = chart3.series.push(new am4charts.ColumnSeries());
				series3.dataFields.categoryY = "crop";
				series3.dataFields.valueX = "value1";
				series3.tooltipText = "Safra " + oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oFirstCrop.HCP_PERIOD.slice(0, 2) + ": [bold]" + oFirstCrop.HCP_HARVEST_STAGE + "[/]";
				series3.name = "Safra " + oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oFirstCrop.HCP_PERIOD.slice(0, 2) + " - " + oFirstCrop.HCP_PERIOD.slice(2, 6);
					
				// Defina as cores individuais para cada série
				series3.columns.template.fill = new am4core.color("#003186"); // Cor para a primeira série
				
				var series4 = chart3.series.push(new am4charts.ColumnSeries());
				series4.dataFields.categoryY = "crop";
				series4.dataFields.valueX = "value2";
				series4.tooltipText = "Safra " + oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oSecondCrop.HCP_PERIOD.slice(0, 2) + ": [bold]" + oSecondCrop.HCP_HARVEST_STAGE + "[/]";
				series4.name = "Safra " + oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC + " - " + oSecondCrop.HCP_PERIOD.slice(0, 2) + " - " + oSecondCrop.HCP_PERIOD.slice(2, 6);
				
				series4.columns.template.fill = new am4core.color("#2b98cd"); // Cor para a segunda série
				
				var valueLabel3 = series3.bullets.push(new am4charts.LabelBullet());
				valueLabel3.label.text = "{valueX}";
				valueLabel3.label.dx = 25;
				
				var valueLabel4 = series4.bullets.push(new am4charts.LabelBullet());
				valueLabel4.label.text = "{valueX}";
				valueLabel4.label.dx = 25;
				
				chart3.cursor = new am4charts.XYCursor();
				chart3.cursor.behavior = "zoomY";
				
				chart3.legend = new am4charts.Legend();
				chart3.legend.useDefaultMarker = true;
				var marker = chart3.legend.markers.template.children.getIndex(0);
				marker.cornerRadius(12, 12, 12, 12);
				marker.strokeWidth = 2;
				marker.strokeOpacity = 1;
				marker.stroke = am4core.color("#ccc");
				
				//se não houver dados de comercialização em nenhuma opção, traz em branco
				if (oData.HCP_COMMERCIALIZATION1 == "" && oData.HCP_COMMERCIALIZATION2 == "") {
					this.setNotFoundCommercialization();
				}else {
					this.loadCommercialization().then(data => {
						this.createComercializationChart();
					}).catch(error => {
						this.setNotFoundCommercialization();
						console.log(error);
					});
				}
				console.log(oComposeExModel.getProperty("/"));

			}.bind(this), 100);

		},

		setNotFoundCommercialization: function () {
			
			
			 var oComposeExModel = this.getView().getModel("composeExModel");
		 	 oComposeExModel.setProperty("/commercializationTitle", "Comercialização não disponível");
			 
			var oModel = this.getView().getModel();
			var oData = oComposeExModel.getData();
			var oFirstCrop = oData.firstCrop;
			var oSecondCrop = oData.secondCrop;
			var oFirstCommercialization = oData.firstCommercialization;
			var oSecondCommercialization = oData.secondCommercialization;

			var chart2 = am4core.create("chartdiv2", am4charts.XYChart);
			chart2.colors.list = [
				am4core.color("#003186"),
				am4core.color("#2b98cd")
			];

			chart2.numberFormatter.numberFormat = "#'%'";

			chart2.data = [];

			//create category axis for years
			var categoryAxis2 = chart2.yAxes.push(new am4charts.CategoryAxis());

			categoryAxis2.dataFields.category = "crop";
			categoryAxis2.renderer.inversed = true;
			categoryAxis2.renderer.grid.template.location = 0;

			var valueAxis2 = chart2.xAxes.push(new am4charts.ValueAxis());

			var series2 = chart2.series.push(new am4charts.ColumnSeries());
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
		  var oModel = this.getView().getModel();
		  var oComposeExModel = this.getView().getModel("composeExModel");
		  var oData = oComposeExModel.getData();
		
		  var oFirstCrop = oData.firstCrop;
		  var oSecondCrop = oData.secondCrop;
		  var oFirst = oData.firstCommercialization || oData.firstCommercializationNew;
		  var oSecond = oData.secondCommercialization || oData.secondCommercializationNew;
		
		  if (!oFirst && !oSecond) {
		    return this.setNotFoundCommercialization();
		  }
		
		  let chartData = [];
		
		  if (oFirst && oSecond) {
		    chartData.push({
		      stage: `[bold]Semana Selecionada[/]\n${oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC} Semana: ${oFirst.HCP_PERIOD.slice(0, 2)} - ${oFirst.HCP_PERIOD.slice(2)}\n${oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC} Semana: ${oSecond.HCP_PERIOD.slice(0, 2)} - ${oSecond.HCP_PERIOD.slice(2)}`,
		      safra1: parseInt(oFirst.HCP_CAPACITY_PERCENT) || 0,
		      safra2: parseInt(oSecond.HCP_CAPACITY_PERCENT) || 0,
		      crop1: `${oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC} - ${oFirst.HCP_PERIOD.slice(0, 2)}`,
		      crop2: `${oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC} - ${oSecond.HCP_PERIOD.slice(0, 2)}`
		    });
		  }
		
		  if (oData.firstCommercializationNew && oData.secondCommercializationNew) {
		    chartData.push({
		      stage: `[bold]Última Semana Cadastrada[/]\n${oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC} Semana: ${oData.firstCommercializationNew.HCP_PERIOD.slice(0, 2)} - ${oData.firstCommercializationNew.HCP_PERIOD.slice(2)}\n${oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC} Semana: ${oData.secondCommercializationNew.HCP_PERIOD.slice(0, 2)} - ${oData.secondCommercializationNew.HCP_PERIOD.slice(2)}`,
		      safra1: parseInt(oData.firstCommercializationNew.HCP_CAPACITY_PERCENT) || 0,
		      safra2: parseInt(oData.secondCommercializationNew.HCP_CAPACITY_PERCENT) || 0,
		      crop1: `${oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC} - ${oData.firstCommercializationNew.HCP_PERIOD.slice(0, 2)}`,
		      crop2: `${oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC} - ${oData.secondCommercializationNew.HCP_PERIOD.slice(0, 2)}`
		    });
		  }
		
		  var chart = am4core.create("chartdiv2", am4charts.XYChart);
		  chart.data = chartData;
		
		  chart.colors.list = [
		    am4core.color("#003186"),
		    am4core.color("#2b98cd")
		  ];
		  chart.numberFormatter.numberFormat = "#'%";
		
		  var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		  categoryAxis.dataFields.category = "stage";
		  categoryAxis.renderer.grid.template.location = 0;
		  categoryAxis.renderer.minGridDistance = 10;
		  categoryAxis.renderer.cellStartLocation = 0.1;
		  categoryAxis.renderer.cellEndLocation = 0.9;
		
		  if (window.innerWidth > 1366) {
		    categoryAxis.renderer.labels.template.fontSize = 13;
		  } else {
		    categoryAxis.renderer.labels.template.fontSize = 10;
		  }
		
		  var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		  valueAxis.min = 0;
		  valueAxis.max = 120;
		  valueAxis.strictMinMax = true;
		
		  var series1 = chart.series.push(new am4charts.ColumnSeries());
		  series1.dataFields.valueY = "safra1";
		  series1.dataFields.categoryX = "stage";
		  series1.name = chartData[0]?.crop1 || "Safra 1";
		  series1.tooltipText = "Safra {crop1}: [bold]{valueY}%[/]";
		  series1.columns.template.width = am4core.percent(90);
		
		  var series2 = chart.series.push(new am4charts.ColumnSeries());
		  series2.dataFields.valueY = "safra2";
		  series2.dataFields.categoryX = "stage";
		  series2.name = chartData[0]?.crop2 || "Safra 2";
		  series2.tooltipText = "Safra {crop2}: [bold]{valueY}%[/]";
		  series2.columns.template.width = am4core.percent(90);
		
		  var valueLabel1 = series1.bullets.push(new am4charts.LabelBullet());
		  valueLabel1.label.text = "{valueY}%";
		  valueLabel1.label.dy = -10;
		
		  var valueLabel2 = series2.bullets.push(new am4charts.LabelBullet());
		  valueLabel2.label.text = "{valueY}%";
		  valueLabel2.label.dy = -10;
		
		  chart.cursor = new am4charts.XYCursor();
		  chart.cursor.lineX.disabled = true;
		  chart.cursor.lineY.disabled = true;
		
		  chart.legend = new am4charts.Legend();
		  chart.legend.useDefaultMarker = true;
		  chart.legend.marginTop = -10;
		  var marker = chart.legend.markers.template.children.getIndex(0);
		  marker.cornerRadius(12, 12, 12, 12);
		  marker.strokeWidth = 2;
		  marker.strokeOpacity = 1;
		  marker.stroke = am4core.color("#ccc");
		},
		
		loadCommercialization: function () {
			return new Promise(function (resolve, reject) {
				var oComposeExModel = this.getView().getModel("composeExModel");
				var oModel = this.getView().getModel();
				var oData = oComposeExModel.getData();
				oModel.setUseBatch(false);
				var aPromises = [];
				var that = this;
				this.firstPeriod = oData.HCP_COMMERCIALIZATION1;
				
				if (oData.HCP_COMMERCIALIZATION1 !== "") {
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
	
						oModel.read("/Commercialization", {
							filters: aFilters,
							success: function (data) {
								if (data.results.length > 0) {
									//	var oData = data.results[0];
									that.firstPeriod;
									var oComposeExModel = that.getView().getModel("composeExModel");
	
									let hasPeriodFromData = data.results.filter(item => item.HCP_PERIOD == that.firstPeriod);
									if (hasPeriodFromData.length > 0) {
										oComposeExModel.setProperty("/firstCommercialization", hasPeriodFromData.sort((a, b) => b.HCP_COMMERC_ID - a.HCP_COMMERC_ID)[0]);
									//	oComposeExModel.setProperty("/firstCommercialization", hasPeriodFromData.sort((a, b) => b.HCP_CREATED_AT - a.HCP_CREATED_AT)[0]);
										if (data.results.length > 1) {
											//let aSameYearData = data.results.filter(item => item.HCP_PERIOD.slice(2) == that.firstPeriod.slice(2));
											//if (aSameYearData.length > 0) {
										// if (data.results[data.results.length - 1].HCP_PERIOD != hasPeriodFromData[0].HCP_PERIOD) {
										oComposeExModel.setProperty("/firstCommercializationNew", data.results.sort((a, b) => b.HCP_COMMERC_ID - a.HCP_COMMERC_ID)[0]);
										//oComposeExModel.setProperty("/firstCommercializationNew", data.results.sort((a, b) => b.HCP_CREATED_AT - a.HCP_CREATED_AT)[0]);
										// }
											//}
										}
									} else {
										oComposeExModel.setProperty("/firstCommercialization", data.results.sort((a, b) => b.HCP_COMMERC_ID - a.HCP_COMMERC_ID)[0]);
										//oComposeExModel.setProperty("/firstCommercialization", data.results.sort((a, b) => b.HCP_CREATED_AT - a.HCP_CREATED_AT)[0]);
									}
	
									resolve();
								} else {
									resolve();
								}
							},
							error: function (error) {
								reject(error);
							}
						});
	
					}.bind(this)));
				}
				if (oData.HCP_COMMERCIALIZATION2 !== "") {
					aPromises.push(new Promise(function (resolve, reject) {
						var aFilters = [];
						var that = this;
						this.secondPeriod = oData.HCP_COMMERCIALIZATION2;
	
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
	
						oModel.read("/Commercialization", {
							filters: aFilters,
							sorters: [new sap.ui.model.Sorter("HCP_COMMERC_ID", false)],
							success: function (data) {
								if (data.results.length > 0) {
									var oData = data.results[0];
									that.secondPeriod;
									var oComposeExModel = that.getView().getModel("composeExModel");
									let hasPeriodFromData = data.results.filter(item => item.HCP_PERIOD == that.secondPeriod);
									if (hasPeriodFromData.length > 0) {
										oComposeExModel.setProperty("/secondCommercialization", hasPeriodFromData.sort((a, b) => b.HCP_COMMERC_ID - a.HCP_COMMERC_ID)[0]);
										if (data.results.length > 1) {
										// if (data.results[data.results.length - 1].HCP_PERIOD != hasPeriodFromData[0].HCP_PERIOD) {
											oComposeExModel.setProperty("/secondCommercializationNew", data.results.sort((a, b) => b.HCP_COMMERC_ID - a.HCP_COMMERC_ID)[0]);
										// }
										}
									} else {
										oComposeExModel.setProperty("/secondCommercialization", data.results.sort((a, b) => b.HCP_COMMERC_ID - a.HCP_COMMERC_ID)[0]);
									}
									resolve();
								} else {
									resolve();
								}
							},
							error: function (error) {
								reject(error);
							}
						});
					}.bind(this)));
				}
				
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
			var sdif = value2 - value1;

			// if (sdif < 0) {
			// 	return 0;
			// } else {
			return parseInt((sdif / value2) * 100);
			// }
		},

		onImagePress: function () {
			var oComposeExModel = this.getView().getModel("composeExModel");
			var oData = oComposeExModel.getData();
			var oFirstCrop = oData.firstCrop;
			var oSecondCrop = oData.secondCrop;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			var sFirstCropRepoKey = oFirstCrop["HCP_CROP"].toString() + oFirstCrop["HCP_STATE"].toString() + oFirstCrop["HCP_REGIO"].toString() +
				oFirstCrop["HCP_MATERIAL"].toString() + oFirstCrop["HCP_PERIOD"].toString();

			var sSecondCropRepoKey = oSecondCrop["HCP_CROP"].toString() + oSecondCrop["HCP_STATE"].toString() + oSecondCrop["HCP_REGIO"].toString() +
				oSecondCrop["HCP_MATERIAL"].toString() + oSecondCrop["HCP_PERIOD"].toString();

			var oKeyData = {
				firstCropRepoKey: sFirstCropRepoKey,
				secondCropRepoKey: sSecondCropRepoKey,
				crop1: oFirstCrop.Crop_Track_Crop_Year.HCP_CROP_DESC,
				crop2: oSecondCrop.Crop_Track_Crop_Year.HCP_CROP_DESC,
				period1: oFirstCrop.HCP_PERIOD.slice(0, 2),
				period2: oSecondCrop.HCP_PERIOD.slice(0, 2)
			};

			oRouter.navTo("crop.ComposeExImages", {
				keyData: encodeURIComponent(JSON.stringify(oKeyData))
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