sap.ui.define([], function () {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		 
		 formatterThousandHouse: function (sState) {
	 		if (sState !== null && sState !== undefined) {
	 			if(sState != "NaN"){
		 			return sap.ui.core.format.NumberFormat.getFloatInstance({
					    maxFractionDigits: 2,
					    groupingEnabled: true,
					    groupingSeparator: " ",
					    decimalSeparator: "."
					}).format(sState);
	 			}else
	 				return sState;
	 		}
		 },
		 
		 /**
		 * Formata valores decimais para exibição com separador de milhares e decimal
		 * @public
		 * @param {number} sValue o valor a ser formatado
		 * @returns {string} valor formatado com separadores adequados
		 */
		 formatDecimalValue: function(sValue) {
		 	if (sValue !== null && sValue !== undefined && sValue !== "NaN") {
		 		return sap.ui.core.format.NumberFormat.getFloatInstance({
		 			maxFractionDigits: 2,
		 			groupingEnabled: true,
		 			groupingSeparator: ".",
		 			decimalSeparator: ","
		 		}).format(sValue);
		 	} else {
		 		return sValue;
		 	}
		 },
		 
		  formatterTableViewWareHouse: function (sData) {
	 	     if(sData.length === 0){
	 	     	return false;
	 	     } else {
	 	     	return true;
	 	     }
		 },
		 
		 formatterExtraPercentage: function (sTotal,sHarvest,sMaturation){
			if (sTotal !== null && sTotal !== undefined && sHarvest !== null && sHarvest !== undefined && sMaturation !== null && sMaturation !== undefined) {
				if(parseFloat(sHarvest) > parseFloat(sMaturation) || sTotal > 100)
					return '<span style="color:rgb(255, 0, 0)">' + sTotal + '%' + '</span>' ; //Red
				else if(sTotal < 100)
					return '<span style="color:rgb(255, 165, 0)">' + sTotal + '%' + '</span>' ; //Orange
				else if(sTotal == 100)
					return '<span style="color:rgb(0, 128, 0)">' + sTotal + '%' + '</span>' ; //Green
				else
					return '<span style="color:rgb(255, 0, 0)">' + sTotal + '%' + '</span>' ; //Red
			}
			else
				return '<span style="color:rgb(0, 0, 0)">' + sTotal + '%' + '</span>'
		},
		
		
		 getMonth: function (sState) {
	 		if (sState !== null && sState !== undefined) {
	 			return sState.getMonth() + 1;
	 		}
		 },
		 
		 getYear: function (sState) {
		 	if (sState !== null && sState !== undefined) {
		 		return sState.getFullYear();
	 		}
		 },
		 concatRankings: function (sState) {
		 	if (sState !== null && sState !== undefined) {
		 		let concatRank; 
		 		for (var i = 0; i < sState.length; i++) {
		 			let reference = this.getView().getModel().oData[sState[i]].Ranking_Name.__ref;
		 			
		 			if(concatRank !== undefined)
		 				concatRank = concatRank + ', ' + this.getView().getModel().oData[reference].HCP_NAME;
		 			else
		 				concatRank = this.getView().getModel().oData[reference].HCP_NAME;
				}
				return concatRank;
		 	}
		 },
		 
		stateStatusProspect: function (sState) {
			if (sState === '1' || sState === '5') {
				return "Success";
			} else if (sState === '2') {
				return "Warning";
			} else if (sState === '3' || sState === '4') {
				return "Error";
			}

		},
		
		formatterVisitForm: function (sState){
			if (sState !== null && sState !== undefined) {
				if(sState == 1)
					return '<span style="color:rgb(0, 128, 0)">' + "Realizada" + '</span>' ;
				else if (sState == 0)
					return '<span style="color:rgb(144, 0, 32)">' + "Pendente" + '</span>' ;
				else if (sState == 3)
					return '<span style="color:rgb(192, 192, 192)">' + "Atualizada" + '</span>' ;
				else if (sState == 4)
					return '<span style="color:rgb(0, 0, 0)">' + "-" + '</span>' ;
			}
			else
				return '<span style="color:rgb(0, 0, 0)">' + "-" + '</span>'
		},
		
		formatterRank: function (sState) {
			if (sState !== null) {
				if(sState == "1")
					return '<span style="color:rgb(205, 127, 50)">' + "Bronze" + '</span>' ;
				
				else if(sState == "2")
					return '<span style="color:rgb(192, 192, 192)">' + "Prata" + '</span>' ; 
					
				else if(sState == "3")
					return '<span style="color:rgb(255, 215, 0)">' + "Ouro" + '</span>' ;
					
				else if(sState == "4")
					return '<span style="color:rgb(0, 191, 255)">' + "Diamante" + '</span>' ; 
				
				else
					return '<span style="color:red">' + "Error" + '</span>'
					
			}
		},
		
		maskCNPJ: function (sState) {
			if (sState !== null) {
				const removedBlankSpaces = sState.replace(/\D/g, '');
				if (removedBlankSpaces.length === 11) {
					return removedBlankSpaces.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
				} else if (removedBlankSpaces.length === 14) {
					return removedBlankSpaces.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
				}
			}
		},
		
		formatSupplierName: function(sName1, sNameRegistered) {
		    return sName1 && sName1.trim() ? sName1 : sNameRegistered;
		},
		
		formatDate: function (timestamp) {
			if (timestamp !== null) {
			var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
						pattern: "dd/MM/yyyy HH:mm:ss"
					});
			return	dateFormat.format(timestamp);
					
			}
		},
		
		textStatusProspect: function (sState) {
			//console.log(sState, 'maylon'); 
			if (sState === '1') {
				return "Criado";
			} else if (sState === '2') {
				return "Liberado";
			} else if (sState === '3') {
				return "Cancelado";
			} else if (sState === '4') {
				return "Recusado";
			} else if (sState === '5') {
				return "Fornecedor";
			}
		},
		
		maskVisitBusiness: function (sState) {
			if (sState == true)
				return '<span style="color:rgb(0, 128, 0)">' + "Realizada" + '</span>';
			else
				return '<span style="color:rgb(255, 99, 71)">' + "Pendente" + '</span>';
		},

		iconStatusProspect: function (sState) {
			//console.log(sState, 'maylon'); 
			if (sState === '1') {
				return "sap-icon://create-form";
			} else if (sState === '2') {
				return "sap-icon://alert";
			} else if (sState === '3') {
				return "sap-icon://decline";
			} else if (sState === '4') {
				return "sap-icon://private";
			} else if (sState === '5') {
				return "sap-icon://accept";
			}

		},
		maskDocument: function (sDocument) {
			//	console.log(sDocument, 'maylon');

			var sReturn = "000.000.000-00";

			if (sDocument) {
				sReturn = sDocument.length === 11 ? '000.000.000-00' : '00.000.000/0000-00';
			}

			return sReturn;
		},

		setScheduleStatus: function (sValue) {
			if (sValue === "1") {
				return "Checkin Pendente";
			} else if (sValue === "2") {
				return "Checkin Realizado";
			} else if (sValue === "3") {
				return "Checkout Realizado";
			}
		},

		setScheduleState: function (sValue) {
			if (sValue === "1") {
				return "Warning";
			} else if (sValue === "2") {
				return "Success";
			} else if (sValue === "3") {
				return "Error";
			}
		},
		
		setContactType: function (sValue) {
			if (sValue === "presencial") {
				return "Presencial";
			} else if (sValue === "telefone") {
				return "Telefone";
			} else if (sValue === "mensagemtelefone") {
				return "Mensagem Via telefone";
			} else if (sValue === "skype") {
				return "Skype";
			} else if (sValue === "email") {
				return "E-mail";
			} else if (sValue === "outros") {
				return "Outros";
			}
		},

		setScheduleType: function (sValue) {
			if (sValue === "1") {
				return "Type06";
			} else if (sValue === "2") {
				return "Type08";
			} else if (sValue === "3") {
				return "Type02";
			}
		},
		setScheduleEnable: function (sStatus) {
			if (sStatus === "3") {
				return false;
			} else if (sStatus === "1") {
				return true;
			} else if (!sStatus) {
				return true;
			} else {
				return false;
			}
		}
	};

});