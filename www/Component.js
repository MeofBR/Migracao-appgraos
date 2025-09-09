/*global sqlitePlugin */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/sap/build/standard/brfAppDeGraosModoEditar/model/models",
	"./model/errorHandling"
], function (UIComponent, Device, models, errorHandling) {
	"use strict";

	var navigationWithContext = {

	};

	return UIComponent.extend("com.sap.build.standard.brfAppDeGraosModoEditar.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			// set the FLP model
			this.setModel(models.createFLPModel(), "FLP");

			// set the dataSource model
			this.setModel(new sap.ui.model.json.JSONModel({}), "dataSource");

			// set application model
			var oApplicationModel = new sap.ui.model.json.JSONModel({
				"mapConfig": null
			});
			this.setModel(oApplicationModel, "applicationModel");

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// delegate error handling
			errorHandling.register(this);

		
			//sap.ui.getCore().setThemeRoot("newtema", '{"newtema":"newtema/UI5/"}'); 
			//sap.ui.getCore().setThemeRoot("newtema", "newtema/UI5/");
			//sap.ui.getCore().applyTheme("newtema"); 

			// create the views based on the url/hash
			this.getRouter().initialize();

			this.oMainController = sap.ui.controller("com.sap.build.standard.brfAppDeGraosModoEditar.controller.MainController");

				var bIsMobile = window.fiori_client_appConfig;

			try {
				if (bIsMobile) {
					this.openLocalDatabase();
				}
				// if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {
				// 	this.loadUser();
				// } else {
				// 	this.getUser().then(function (userName) {
				// 		this.userName = userName;
				// 	}.bind(this));
				// }
			} catch (err) {
				console.log(err);
			}
			// this.showMessageDialog();
		},

		showNotEqualUserMessage: function (userName) {
			if (!this.escapePreventDialog) {
				this.escapePreventDialog = new sap.m.Dialog({
					title: 'Aviso',
					state: 'Warning',
					content: [
						new sap.m.Text({
							text: "O usuário atual é diferente do usuário cadastrado para este aparelho. Feche a aplicação e entre com o usuário " +
								userName + " ou reinstale a aplicação para utilizar outro usuário.",
							textAlign: "Center"
						}).addStyleClass("sapUiSmallMargin")
					]
				});
			}
			this.escapePreventDialog.open();
		},

		openLocalDatabase: function () {
			this.oDatabase = sqlitePlugin.openDatabase({
				name: 'appGraosDB',
				location: 'default'
			});
			this.oDatabase.transaction(function (transaction) {
				transaction.executeSql('CREATE TABLE IF NOT EXISTS UserInfo (userName STRING)');
			}, function (error) {
				console.log('Transaction ERROR: ' + error.message);
			}, function () {
				console.log('database OK');
			});
			this.oDatabase.transaction(function (transaction) {
				transaction.executeSql(
					'CREATE TABLE IF NOT EXISTS offlinePictures (HCP_OFFLINE_ID INT PRIMARY KEY, HCP_PATH_KEY STRING ,HCP_IMAGE_NAME STRING, HCP_BASE_IMAGE STRING, HCP_CREATED_BY STRING, hcp_created_at STRING, HCP_UNIQUE_KEY STRING, HCP_PERIOD STRING)'
				);
			}, function (error) {
				console.log('Transaction ERROR: ' + error.message);
			}, function () {
				console.log('database OK');
			});
		},
		
		getPictures: function (sKey) {
			sKey = sKey + "%";
			return new Promise(function (resolve, reject) {
				if (this.oDatabase) {
					this.oDatabase.transaction(function (transaction) {
						transaction.executeSql('SELECT * FROM offlinePictures WHERE hcp_path_key LIKE ?', [sKey], function (db, result) {
							var oResult = [];
							if (result.rows.length > 0) {
								for (var a = 0; a < result.rows.length; a++) {
									oResult.push(result.rows.item(a));
								}
								resolve(oResult);
							} else {
								resolve(oResult);
							}
						});
					}, function (error) {
						console.log('Transaction ERROR: ' + error.message);
					}, function () {
						console.log('Read User Completed');
					});
				}
			}.bind(this));
		},
		setPicture: function (oImageRecord) {
			if (this.oDatabase) {
				return new Promise(function (resolve, reject) {
					this.oDatabase.transaction(function (transaction) {
						transaction.executeSql(
							'INSERT INTO offlinePictures(HCP_OFFLINE_ID, HCP_PATH_KEY,HCP_IMAGE_NAME,HCP_BASE_IMAGE,HCP_CREATED_BY,HCP_CREATED_AT,HCP_UNIQUE_KEY,HCP_PERIOD) VALUES (?, ?, ?, ?, ?, ?, ?,?)', [
								oImageRecord.HCP_OFFLINE_ID,
								oImageRecord.HCP_PATH_KEY, oImageRecord.HCP_IMAGE_NAME, oImageRecord.HCP_BASE_IMAGE, oImageRecord.HCP_CREATED_BY,
								oImageRecord.HCP_CREATED_AT, oImageRecord.HCP_UNIQUE_KEY, oImageRecord.HCP_PERIOD
							]);
					}, function (error) {
						console.log('Transaction ERROR: ' + error.message);
					}, function () {
						console.log('picture set in offline DB');
						resolve();
					});
				}.bind(this));
			}
		},
		deletePicture: function (oOptions) { //[deleteAll, sKey, sId]
			if (this.oDatabase) {
				return new Promise(function (resolve, reject) {
					if (oOptions.deleteAll) {
						oOptions.sKey = "%" + oOptions.sKey + "%";
						this.oDatabase.transaction(function (transaction) {
							transaction.executeSql('DELETE FROM offlinePictures WHERE HCP_PATH_KEY LIKE ?', [oOptions.sKey], function (err) {
								// if (err) {
								// 	resolve("erro - " + err);
								// } else {
								// 	resolve("success");
								// }
								resolve("success");
							});
						}, function (error) {
							console.log('Transaction ERROR: ' + error.message);
						}, function () {
							console.log('Read User Completed');
						});
					} else {
						this.oDatabase.transaction(function (transaction) {
							transaction.executeSql('DELETE FROM offlinePictures WHERE HCP_OFFLINE_ID = ?', [oOptions.sId], function (err) {
								if (err) {
									resolve("erro - " + err);
								} else {
									resolve("success");
								}
							});
						}, function (error) {
							console.log('Transaction ERROR: ' + error.message);
						}, function () {
							console.log('Read User Completed');
						});
					}
				}.bind(this));
			}
		},

		getUser: function () {
			return new Promise(function (resolve, reject) {
				if (this.oDatabase) {
					this.oDatabase.transaction(function (transaction) {
						transaction.executeSql('SELECT * FROM UserInfo', [], function (db, result) {
							if (result.rows.length > 0) {
								resolve(result.rows.item(0).userName);
							} else {
								resolve("");
							}

						});
					}, function (error) {
						console.log('Transaction ERROR: ' + error.message);
					}, function () {
						console.log('Read User Completed');
					});
				}
			}.bind(this));
		},

		setUser: function (userName) {
			if (this.oDatabase) {
				return new Promise(function (resolve, reject) {
					this.oDatabase.transaction(function (transaction) {
						transaction.executeSql('INSERT or REPLACE INTO UserInfo VALUES (?)', [userName]);
					}, function (error) {
						console.log('Transaction ERROR: ' + error.message);
					}, function () {
						console.log('User Updated in offline DB');
						resolve();
					});
				}.bind(this));
			}
		},

		loadUser: function () {
			var bIsMobile = window.fiori_client_appConfig;

			return new Promise(function (resolve, reject) {
				this.oUserModel = new sap.ui.model.json.JSONModel("/services/userapi/currentUser");
				this.oUserModel.attachRequestCompleted(function (result) {
					this.statusHttp = result.mParameters.success;
					if(result.mParameters.errorobject){
						this.httpCode = result.mParameters.errorobject.statusCode;
					}else{
						this.httpCode = '000';
					}
					//this.httpCode = result.mParameters.errorobject.statusCode;

					if (bIsMobile) {
						this.getUser().then(function (userName) {

							if ((bIsMobile && navigator.connection.type !== "none") || !bIsMobile) {

								if (this.oUserModel.oData.name === null || this.oUserModel.oData.name === undefined) {
									if (userName === "") {
										sap.m.MessageBox.warning(
											"Falha ao buscar usuário. A aplicação será reiniciada.", {
												actions: [sap.m.MessageBox.Action.OK],
												onClose: function (sAction) {
													window.location.reload();
												}.bind(this)
											}
										);
									} else {
										if (!this.statusHttp && this.httpCode == '403') {
											this.showNotEqualUserMessage(userName);
										} else {
											this.userName = userName;
											resolve();
										}

									}
								} else if (userName != this.oUserModel.oData.name && userName !== "") {
									//Desenvolvimento Maylon Zanardi 12/02, nova dialog de bloqueio do usuário.
									if (!this.statusHttp  && this.httpCode == '403') {
										this.showNotEqualUserMessage(userName);
									} else {
										this.userName = userName;
										resolve();
									}
								} else {
									this.setUser(this.oUserModel.oData.name).then(function () {
										this.getUser().then(function (userName) {
											this.userName = userName;
											resolve();
										}.bind(this));
									}.bind(this));
								}

							} else {
								this.userName = userName;
								resolve();
							}
						}.bind(this));
					} else {
						this.userName = this.oUserModel.oData.name;
						resolve();
					}
				}.bind(this));
			}.bind(this));
		},

		createContent: function () {
			var app = new sap.m.App({
				id: "App"
			});
			var appType = "App";
			var appBackgroundColor = "#FFFFFF";
			if (appType === "App" && appBackgroundColor) {
				app.setBackgroundColor(appBackgroundColor);
			}

			return app;
		},

		getNavigationPropertyForNavigationWithContext: function (sEntityNameSet, targetPageName) {
			var entityNavigations = navigationWithContext[sEntityNameSet];
			return entityNavigations == null ? null : entityNavigations[targetPageName];
		},

		setMessage: function () {

		},

		getMessage: function () {

		},

		removeMessage: function () {

		},

		showMessageDialog: function () {
			if (!this.oDialog) {
				this.createMessageDialog();
			}
			this.oDialog.open();
		},

		createMessageDialog: function () {
			var that = this;

			var oLink = new sap.m.Link({
				text: "Show more information",
				href: "http://sap.com",
				target: "_blank"
			});

			var oMessageTemplate = new sap.m.MessageItem({
				type: '{type}',
				title: '{title}',
				description: '{description}',
				subtitle: '{subtitle}',
				counter: '{counter}',
				markupDescription: '{markupDescription}',
				link: oLink
			});

			var aMockMessages = [{
				type: 'Error',
				title: 'Error message',
				description: 'First Error message description. \n' +
					'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod',
				subtitle: 'Example of subtitle',
				counter: 1
			}, {
				type: 'Warning',
				title: 'Warning without description',
				description: ''
			}, {
				type: 'Success',
				title: 'Success message',
				description: 'First Success message description',
				subtitle: 'Example of subtitle',
				counter: 1
			}, {
				type: 'Error',
				title: 'Error message',
				description: 'Second Error message description',
				subtitle: 'Example of subtitle',
				counter: 2
			}, {
				type: 'Information',
				title: 'Information message',
				description: 'First Information message description',
				subtitle: 'Example of subtitle',
				counter: 1
			}];

			var oModel = new sap.ui.model.json.JSONModel();

			oModel.setData(aMockMessages);

			this.oMessageView = new sap.m.MessageView({
				showDetailsPageHeader: false,
				itemSelect: function () {
					oBackButton.setVisible(true);
				},
				items: {
					path: "/",
					template: oMessageTemplate
				}
			});

			var oBackButton = new sap.m.Button({
				icon: sap.ui.core.IconPool.getIconURI("nav-back"),
				visible: false,
				press: function () {
					that.oMessageView.navigateBack();
					this.setVisible(false);
				}
			});

			this.oMessageView.setModel(oModel);

			this.oDialog = new sap.m.Dialog({
				resizable: true,
				content: this.oMessageView,
				state: 'Error',
				beginButton: new sap.m.Button({
					press: function () {
						this.getParent().close();
					},
					text: "Close"
				}),
				customHeader: new sap.m.Bar({
					contentMiddle: [
						new sap.m.Text({
							text: "Mensagens"
						})
					],
					contentLeft: [oBackButton]
				}),
				contentHeight: "300px",
				contentWidth: "500px",
				verticalScrolling: false
			});
		},

		closeMessageDialog: function () {

		}

	});

});