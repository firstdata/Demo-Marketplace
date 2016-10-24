'use strict';

angular.module('shipping', ['ngRoute' ])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/shipping', {
    templateUrl: 'public/shipping/shipping.html',
    controller: 'shippingCtrl'
  });
}])

.controller('shippingCtrl', ["$scope","$http", "FDService", function ($scope, $http, FDService) {
  $scope.categories = [];
  $scope.products = FDService.get();
  $scope.total = 0;

var product = $scope.products;

var json2 = [];
var json6 = [];

var json1 = '{"company": "MMIS TEST QA 09291", "first_name": "Jon", "last_name": "Consumer", "email": "santhosh.rao.m@gmail.com", "phone": "3487548375", "address1": "123 DO NOT SHIP", "city": "Omaha", "state": "NE", "zip": "68106", "pricingDetails": ['
for (var i = 0; i < product.length; i++) {

	json2.push('{' + '"pricingDetailId": 712, "pricingTypeId": 4, "productId":' + '"' + product[i].id + '"' + ', "description": "VISA_DEBIT", "feeMin": 0, "feeDefault": 0, "feeMax": 0, "defaultAmt": 0.29, "minAmt": 0, "maxAmt": 10, "quantity": 1, "rateMin": 1.56, "rateDefault": 2.31, "rateMax": 2.31, "productName": "Visa Qualified Non-Pin Debit", "productType": "NET_FEE", "isOverride": false, "override": false, "showoncart": false,  "occurrence": { "type": "Transaction" } }' );
	json6.push('{' + '"id": ' + product[i].id + ', "name":' + '"' + product[i].name + '",' + '"price":' + product[i].price + ', "monthly": [], "term": "P", "qty": ' + product[i].qty + ' , "productType": "ACQUIRING" }' );
}
var json3 = '],'
var json4 = '"pricingOptions": { "companyId": 386, "transactionInfo": { "mccTypes": "Clothing and Shoes", "mcc": "5681", "annualVolume": 20000, "averageTicket": 10, "highestTicket": 20, "category": "RETAIL" } },'
var json5 = '"shippingAddress": { "company_name": "MMIS TEST QA 09291", "firstname": "Jon", "lastname": "Consumer", "address1": "123 DO NOT SHIP", "city": "Omaha", "state": "NE", "zip": "68106", "email": "santhosh.rao.m@gmail.com", "email2": "santhosh.rao.m@gmail.com", "phone": "3487548375" }, "cartDetails": { "data": ['
var json7 = '], "amount": 0, "shipping_amount": 19.99, "tax": 0, "taxPercent": 0.059999998658895, "total": 19.99, "status": 0, "monthly": [], "shipping_option_id": 1, "purchaseEnabled": true, "total_qty": 1 } }'

var data = json1 + json2 + json3 + json4 + json5 + json6 + json7;

/*
var data = JSON.stringify(
  {
  	"company": "MMIS TEST QA 09291",
  	"first_name": "Jon",
  	"last_name": "Consumer",
  	"email": "santhosh.rao.m@gmail.com",
  	"phone": "3487548375",
  	"address1": "123 DO NOT SHIP",
  	"city": "Omaha",
  	"state": "NE",
  	"zip": "68106",
  	"pricingDetails": [{
  		"pricingDetailId": 712,
  		"pricingTypeId": 4,
  		"productId": 45608,
  		"description": "VISA_DEBIT",
  		"feeMin": 0,
  		"feeDefault": 0,
  		"feeMax": 0,
  		"defaultAmt": 0.29,
  		"minAmt": 0,
  		"maxAmt": 10,
  		"quantity": 1,
  		"rateMin": 1.56,
  		"rateDefault": 2.31,
  		"rateMax": 2.31,
  		"productName": "Visa Qualified Non-Pin Debit",
  		"productType": "NET_FEE",
  		"isOverride": false,
  		"override": false,
  		"showoncart": false,
  		"occurrence": {
  			"type": "Transaction"
  		}
  	}],
  	"pricingOptions": {
  		"companyId": 386,
  		"transactionInfo": {
  			"mccTypes": "Clothing and Shoes",
  			"mcc": "5681",
  			"annualVolume": 20000,
  			"averageTicket": 10,
  			"highestTicket": 20,
  			"category": "RETAIL"
  		}
  	},
  	"shippingAddress": {
  		"company_name": "MMIS TEST QA 09291",
  		"firstname": "Jon",
  		"lastname": "Consumer",
  		"address1": "123 DO NOT SHIP",
  		"city": "Omaha",
  		"state": "NE",
  		"zip": "68106",
  		"email": "santhosh.rao.m@gmail.com",
  		"email2": "santhosh.rao.m@gmail.com",
  		"phone": "3487548375"
  	},
  	"cartDetails": {
  		"data": [{
  			"id": 74842,
  			"name": "Clover Go",
  			"price": 0,
  			"monthly": [],
  			"term": "P",
  			"qty": 1,
  			"productType": "ACQUIRING"
  		}],
  		"amount": 0,
  		"shipping_amount": 19.99,
  		"tax": 0,
  		"taxPercent": 0.059999998658895,
  		"total": 19.99,
  		"status": 0,
  		"monthly": [],
  		"shipping_option_id": 1,
  		"purchaseEnabled": true,
  		"total_qty": 1
  	}
  }); */

$scope.placeOrder = function() {
  console.log(json1 + json2 + json3 + json4 + json5 + json6 + json7 );

  $http({
    method: 'GET',
    url: '/checkout/' + data
  }).then(function successCallback(response) {
    console.log(response);
    }, function errorCallback(response) { });
}

  for (var i = 0; i < $scope.products.length; i++) {
    $scope.total += $scope.products[i].price;
  }

  $scope.shippingPrice = function(value) {
      $scope.total += parseInt(value);
  };

  $scope.removeItem = function(index) {
    FDService.remove(index);

    if (FDService.get().length == 0) {
      alert('Your Cart is Empty. Please select an item.')
    }
  }
}]);
