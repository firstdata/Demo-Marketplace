/**
 * FD App Services
 */
app.service('fdService', ['$http', '$filter', '$window', '$cacheFactory', 'CONST', '$timeout', '$rootScope',
  function ($http, $filter, $window, $cacheFactory, CONST, $timeout, $rootScope) {


    // Prefix for urls. Empty for now
    var urlPrefix = '';

    // Cache Factory Object
    var cache = $cacheFactory('fd');

    // Cart name in session storage
    var storage_cart = 'cart_s';

    // Order Id name in session storage
    var order_id = 'order_id';

    // Temp Order Id name in session storage
    var tmp_order_id = 'tmp_order_id';

    // Category Id name session storage
    var category_id = 'category_id';

    // Ordered cart name in session storage
    var ordered_cart = 'cart_ordered';

    // Products list name in session storage
    var products_list = 'products_list';

    // Transaction Info name in session storage
    var transaction_info = 'transaction_info';

    // Equipment Pricing name in session storage
    var equipment_pricing = 'equipment_pricing';

    // Acquiring Pricing name in session storage
    var acquiring_pricing = 'acquiring_pricing';

    // Global Pricing name in session storage
    var global_pricing = 'global_pricing';

    // Geo Data name in session storage
    var geo_data = 'geo_data';

    // Shipping options in session storage
    var shipping_options = 'shipping_options';


    var _bankProviders = '';
    var _skipResponses = '';


    /**
     * recursively change to upper object data
     * @param data
     * @return {Object}
     */
    function changeToUpper(data) {
      for (var key in data) {
        if (!data.hasOwnProperty(key)) continue;
        if(typeof data[key] == "string") {
          data[key] = data[key].toUpperCase();
        } else if (typeof data[key] != "object" || typeof data[key] != "array") {
          data[key] = changeToUpper(data[key]);
        }
      }
      return data;
    }


    /**
     * Get Categories list
     * @return {HttpPromise}
     */
    this.getCategories = function(){
      return $http.get(urlPrefix + '/v1/categories');
    };

    /**
     * Get Product Line Items
     * @return {HttpPromise}
     */
    this.getProductLineItems = function(id){
      return $http.get(urlPrefix + '/v1/application/' + id + '/lineItems/');
    };

    /**
     * Get category codes
     * @return {HttpPromise}
     */
    this.getMccCodes = function(category){
      return $http.get(urlPrefix + '/v1/categories/'+ category +'/industries/');
    };

    /**
     * Get MCC codes by type
     * @return {HttpPromise}
     */
    this.getMccTypes = function(category, type){
      return $http.get(urlPrefix + '/v1/categories/'+ category +'/industries/'+ type +'/merchantcategorycodes/' );
    };

    this.getBanks = function(data){
      return $http.post(urlPrefix + '/v1/businessconsultant/banks', data);
    };

    this.saveTransactionInfo = function(data){
      return $http.post(urlPrefix + '/v1/application', data);
    };

    this.getPricingOptions = function(data){
      return $http.get(urlPrefix + '/v1/pricing/' + CONST.COMPANY_ID + '/options/');
    };

    this.sendPricingOptions = function(data){
      return $http.post(urlPrefix + '/v1/pricing', data);
    };

    this.loginBusinessConsultant = function(data){
      return $http.post(urlPrefix + '/v1/businessconsultant/login', data);
    };

    this.getCategory = function(cid){
      return $http.get(urlPrefix + '/v1/categories/' + cid + '/details');
    };

    //changed
    this.getProduct = function(pid){
      //return $http.get(urlPrefix + '/v1/products/' + pid + '/details/');
      return $http.get(urlPrefix + '/v1/companies/386/products/' + pid + '/details/');
    };

    this.getHeroBundles = function(){
      return $http.get(urlPrefix + '/v1/Products/Hero/' + CONST.COMPANY_ID);
    };

    this.getAlacarteBundles = function(){
      return $http.get(urlPrefix + '/v1/products/alacarte');
    };

    this.setBankProviders = function(data){
      _bankProviders = data;
    };
    this.getBankProviders = function(){
      return _bankProviders;
    };

    this.setSkipResponses = function(data){
      _skipResponses = data;
    };
    this.getSkipResponses = function(){
      return _skipResponses;
    };

    this.getProviders = function(){
      return $http.get(urlPrefix + '/v1/Banks');
    };


    /**
     * Get Recommended products
     * @return {HttpPromise}
     */
    this.getRecommendedBundles = function(id){
      //return $http.get(urlPrefix + '/v1/products/'+ id + '/recommended/');
      return $http.get(urlPrefix + '/v1/companies/386/products/'+ id + '/recommended/');
    };
    this.getProductsListCategory = function(cid){
      return $http.get(urlPrefix + '/v1/products/' + cid);
    };


    this.getVerifyIdentityQuestions = function(data, orderId){
      return $http.post(urlPrefix + '/v2/identity/'+ orderId +'/questions', data, {timeout : 5000});
    };

    this.submitIdologyAnswers = function(data, orderId){
      return $http.post(urlPrefix + '/v2/identity/'+ orderId +'/answers', data);
    };

    this.checkTin = function(data){
      return $http.post(urlPrefix + '/v1/tin/validate', data);
    };

    this.getBankName = function(data){
      return $http.post(urlPrefix + '/v1/banks/validate', data, {timeout : 3000});
    };

    this.getTitles = function(data){
      return $http.post(urlPrefix + '/v1/signup/titles', data);
    };

    this.validateContact = function(data){
      return $http.post(urlPrefix + '/v1/validate/contact', data);
    };

    /**
     * Get all products
     * @return {HttpPromise}
     */
    this.getAllProducts = function(){
      var self = this;
      var ret = {
        success: function(){
          return this;
        },
        error: function(callback){
          return this;
        },
      };
      var data = this.getProductListFromSession();

      if (data) {
        ret.success = function(callback){
          callback.apply(this, [data, 200]);
          return this;
        };

      } else {
        //var res = $http({method: 'GET', cache: true, url: urlPrefix + 'v1/products/'});
        var res = $http({method: 'GET', cache: true, url: urlPrefix + 'v1/companies/386/products/'});
        ret.error = res.error;
        ret.success = function(callback){
          res.success(function(data, status, headers, config) {
            self.storeProductListSession(data);
            callback.apply(this, [data, status, headers, config]);
          });
          return this;
        };
      }
      return ret;
    };

    /**
     * Get Product Features
     * @return {HttpPromise}
     */
    this.getFeatures = function(id){
      return $http.get(urlPrefix + '/v1/products/' + id + '/features/');
    };

    /**
     * Get Product specifications
     * @return {HttpPromise}
     */
    this.getSpecs = function(id){
      return $http.get(urlPrefix + '/v1/products/' + id + '/specs/');
    };

    /**
     * Get Included Products
     * @return {HttpPromise}
     */
    this.getProductsList = function(pid){
      //return $http.get(urlPrefix + '/v1/products/' + pid + '/includes/');
      return $http.get(urlPrefix + '/v1/companies/386/products/' + pid + '/includes/');
    };

    /**
     * Get Product FAQ list
     * @return {HttpPromise}
     */
    this.getFaqs = function(pid){
      return $http.get(urlPrefix + '/v1/products/' + pid + '/faq/');
    };

    /**
     * Get Product Options
     * @return {HttpPromise}
     */
    this.getProductOptions = function(pid){
      return $http.get(urlPrefix + '/v1/products/' + pid + '/options/');
    };

    this.merchantLookupGeo = function(lat, lng){
      return $http.get(urlPrefix + '/v1/lookup/' + lat + ',' + lng);
    };

    this.merchantLookupZip = function(zip){
      return $http.get(urlPrefix + '/v1/lookup/' + zip);
    };

    this.merchantLookupByGeo = function(lat, lng, keyword){
      return $http.get(urlPrefix + '/v1/lookup/locations/' + lat + ',' + lng + '/keywords/' + keyword);
    };

    this.merchantLookupByZip = function(zip, keyword){
      return $http.get(urlPrefix + '/v1/lookup/zip/' + zip + '/keywords/' + keyword);
    };

    this.merchantZipByPlaceId = function(placeId){
      return $http.get(urlPrefix + ' /v1/place/' + placeId + '/details/');
    };

    this.getDataByIp = function(){
      return $http.get(urlPrefix + '/v1/zipcode/');
//    return $http.jsonp('http://ip-api.com/json?callback=JSON_CALLBACK');
    };

    this.getTaxes = function(zip, city){
      return $http.get(urlPrefix + '/v1/salestax/' + zip + '/' + city);
    };

    this.getPhoneData = function(phone){
      return $http.get(urlPrefix + '/v1/MerchantLookup/' + phone);
    };

    /**
     * Service to validate a cart
     * @return {HttpPromise}
     */
    this.validateCart = function(cart, ti){

      ti = ti || this.getTransactionInfo();
      var category = this.getCategoryFromSession();
      var categoryName = category ? category.name : ti.category;


      var data = {
        merchant : "",
        cartdetails : [],
        transactionInfo: {
          mccTypes: ti.mccTypes || '',
          mcc: ti.mcc || null,
          annualVolume: ti.annualVolume || null,
          averageTicket: ti.averageTicket || null,
          amexVolume: ti.amexVolume || null,
          amexMemberId: ti.amexMemberId || null,
          highestTicket: ti.highestTicket || null,
          category: categoryName || null
        }
      };

      if (Object.keys(cart.data).length) {
        for (var i in cart.data) {
          data.cartdetails.push(
            {
              "productId": cart.data[i].id,
              "category": cart.data[i].category,
            }
          );
        }
      }

      if (cart.payment_types && Object.keys(cart.payment_types.products).length) {
        for (var i in cart.payment_types.products) {
          data.cartdetails.push(
            {
              "productId": cart.payment_types.products[i].id,
              "category": cart.payment_types.products[i].category,
            }
          );
        }

      }
      if (cart.transaction_products && cart.transaction_products.length) {
        for (var i in cart.transaction_products) {
          data.cartdetails.push(
              {
                "productId": cart.transaction_products[i].id,
                "category": cart.transaction_products[i].category,
              }
          );
        }

      }

      return $http.post(urlPrefix + '/v1/cart/validate', data);//386
    };

    /**
     * Get signed order information
     * @return {HttpPromise}
     */
    this.getMerchantInfo = function(orderId){
      return $http.get(urlPrefix + '/marketplace/v1/contracts/' + orderId + '/agreement/');
    };

    /**
     * Get signed order signatures
     * @return {HttpPromise}
     */
    this.getMerchantSignatures = function(orderId){
      return $http.get(urlPrefix + '/marketplace/v1/contracts/' + orderId + '/signatures/');
    };

    /**
     * Get equipment pricing list
     * @return {HttpPromise}
     */
    this.getEquipmentPricing = function(cart, ti){

      ti = ti || this.getTransactionInfo();
      data = {
        "companyId":CONST.COMPANY_ID,
        "transactionInfo": ti,
          "cardNotPresent": cart.cardNotPresent,
          "cartDetails": []
      };

      if (cart.data && cart.data.length) {
      for (var i in cart.data) {
            data.cartDetails.push({
            "productId": cart.data[i].id,
            "name": cart.data[i].name,
            "price": cart.data[i].price,
            "type": cart.data[i].productType,
            "term": cart.data[i].term,
            "category": cart.data[i].category,
            "qty": cart.data[i].qty
            });
          }
      }

      //return $http.post(urlPrefix + '/v1/pricing/equipment', data);
      return $http.post(urlPrefix + '/v2/pricing/equipment', data);//386
    };

    /**
     * Get global pricing list
     * @return {HttpPromise}
     */
    this.getGlobalPricing = function(){

      data = {
        "companyId":CONST.COMPANY_ID
      };
      return $http.post(urlPrefix + '/v1/pricing/global', data);
    };

    /**
     * Get acquiring pricing list
     * @return {HttpPromise}
     */
    this.getAcquiringPricing = function(cart, ti){
      ti = ti || this.getTransactionInfo();

      data = {
        "companyId":CONST.COMPANY_ID,
        "transactionInfo": ti,
        "cardNotPresent": cart.cardNotPresent,
        "cartDetails": []
      };

      if (cart.data && cart.data.length) {
          for (var i in cart.data) {
              data.cartDetails.push(
                  {
                      "productId": cart.data[i].id,
                      "category": cart.data[i].category,
                      // "cardNotPresent": false,
                      "productType": cart.data[i].productType
                  }
              );
          }
      }

      if (cart.payment_types && Object.keys(cart.payment_types.products).length) {
        for (var i in cart.payment_types.products) {
          data.cartDetails.push(
            {
                  "productId": cart.payment_types.products[i].id,
                  "category": cart.payment_types.products[i].category,
                  // "cardNotPresent": false,
                  "productType": cart.payment_types.products[i].type
            }
          );
        }

      }

      if (cart.transaction_products && cart.transaction_products.length) {
        for (var i in cart.transaction_products) {
          data.cartDetails.push(
              {
                  "productId": cart.transaction_products[i].id,
                  "category": cart.transaction_products[i].category,
                  // "cardNotPresent": false,
                  "productType": cart.transaction_products[i].type
              }
          );
        }

      }

      //return $http.post(urlPrefix + '/v1/pricing/acquiring', data);
      return $http.post(urlPrefix + '/v2/pricing/acquiring', data);//386
    };

    /**
     * review order
     * @param orderId
     * @param cd
     * @param cart
     * @param user
     * @param ti
     * @param ap
     * @param ep
     * @param gp
     * @return {*}
     */
    this.reviewOrder = function(orderId, cd, cart, user, ti, ap, ep, gp){

      cart = cart || orderId ? this.getOrderedCart(orderId) : this.getCart();
      ti = ti || this.getTransactionInfo();
      ap = ap || this.getAcquiringPricingStorage();
      ep = ep || this.getEquipmentPricingStorage();
      gp = gp || this.getGlobalPricingStorage();

      var pricingDetails = [];
      var discountRates = ap.discountRates !== undefined ? ap.discountRates:[];
      ep = ep !== undefined ? ep : [];
      gp = gp !== undefined ? gp : [];

      pricingDetails = pricingDetails.concat(discountRates);
      pricingDetails = pricingDetails.concat(ep);
      pricingDetails = pricingDetails.concat(gp);

      var cardPresentDiscountRates = ap.cardPresentDiscountRates !== undefined ? ap.cardPresentDiscountRates:[];
      var cardNotPresentDiscountRates = ap.cardNotPresentDiscountRates !== undefined ? ap.cardNotPresentDiscountRates:[];

      var cartDetails = {
        data: [],
        amount: cart.amount,
        shipping_amount: cart.shipping_amount,
        tax: cart.tax,
        taxPercent: cart.taxPercent,
        total: cart.total,
        status: 0,
        monthly: [],
        shipping_option_id: cart.shipping_option_id,
        numberofLocations: cart.num_locations_selected,
        purchaseEnabled: true,
        total_qty: cart.total_qty,
      };



      for (var i in cart.data) {
        cartDetails.data.push({
          id: cart.data[i].id,
          name: cart.data[i].name,
          price: cart.data[i].price,
          monthly:[],
          term: cart.data[i].term,
          category: cart.data[i].category,
          qty: cart.data[i].qty,
          productType: cart.data[i].productType,
        });
      }

      //send Shipping details
      var shippingMethods = this.getSessionShippingMethods();
      var shipProduct = shippingMethods[cart.shipping_option_id];
      if(shipProduct !== undefined && (cart.amount > 0 || cart.lease_amount > 0)){
          cartDetails.data.push({
            id: shipProduct.productId,
            name: shipProduct.productName,
            price: shipProduct.price,
            monthly: [],
            term: 'P',
            qty: 1,
            category: cart.data[0].category,
            productType: shipProduct.productType
          });
      }

      for (var i in cart.payment_types.products) {
        cartDetails.data.push({
          id: cart.payment_types.products[i].id,
          name: cart.payment_types.products[i].name,
          price: cart.payment_types.products[i].price,
          monthly:[],
          term: cart.payment_types.products[i].term,
          category: cart.payment_types.products[i].category,
          qty: cart.payment_types.products[i].qty,
          productType: cart.payment_types.products[i].type,
        });
      }

      for (var i in cart.transaction_products) {
        cartDetails.data.push({
          id: cart.transaction_products[i].id,
          name: cart.transaction_products[i].name,
          price: cart.transaction_products[i].price,
          monthly:[],
          term: cart.transaction_products[i].term,
          category: cart.transaction_products[i].category,
          qty: cart.transaction_products[i].qty,
          productType: cart.transaction_products[i].type,
        });
      }

      var transactionInfo = {
        mccTypes: ti.mccTypes,
        mcc: ti.mcc,
        annualVolume: ti.annualVolume,
        creditCardVolume: ti.annualcardVolume,
        telecheckVolume: ti.telecheckVolume,
        averageTicket: ti.averageTicket,
        highestTicket: ti.highestTicket,
        category: ti.category,
        amexMemberId: ti.amexMemberId,
        amexVolume: ti.amexVolume,
      };

      var data = {
        company: cart.shippingAddress[0].company_name,
        first_name: cart.shippingAddress[0].firstname,
        last_name: cart.shippingAddress[0].lastname,
        email: cart.shippingAddress[0].email,
        phone: cart.shippingAddress[0].phone,
        address1: cart.shippingAddress[0].address1,
        city: cart.shippingAddress[0].city,
        state: cart.shippingAddress[0].state,
        zip: cart.shippingAddress[0].zip,
        recordType: 'Lead',
        pricingDetails: pricingDetails,
        cardPresentDiscountRates: cardPresentDiscountRates,
        cardNotPresentDiscountRates: cardNotPresentDiscountRates,
        pricingOptions: {
          companyId: CONST.COMPANY_ID,
          transactionInfo: transactionInfo,
        },
        shippingAddress: cart.shippingAddress,
        cardNotPresent: cart.cardNotPresent,
        cartDetails: cartDetails
      };

      var oid = orderId || this.getTmpOrderId();

      if(oid){
        return $http.post(urlPrefix + ' /v1/merchantorders/' + oid + '/updateorder', data);
      }else{
        return $http.post(urlPrefix + '/v1/merchantorders', data);
      }
    };

    /**
     * Checkout order
     * @return {HttpPromise}
     */
    this.placeOrder = function(orderId, cart, ti, ap, ep, gp){

      cart = cart || orderId ? this.getOrderedCart(orderId) : this.getCart();
      ti = ti || this.getTransactionInfo();
      ap = ap || this.getAcquiringPricingStorage();
      ep = ep || this.getEquipmentPricingStorage();
      gp = gp || this.getGlobalPricingStorage();

      var pricingDetails = [];
      var discountRates = ap.discountRates !== undefined ? ap.discountRates:[];
      ep = ep !== undefined ? ep : [];
      gp = gp !== undefined ? gp : [];

      pricingDetails = pricingDetails.concat(discountRates);
      pricingDetails = pricingDetails.concat(ep);
      pricingDetails = pricingDetails.concat(gp);

      var cardPresentDiscountRates = ap.cardPresentDiscountRates !== undefined ? ap.cardPresentDiscountRates:[];
      var cardNotPresentDiscountRates = ap.cardNotPresentDiscountRates !== undefined ? ap.cardNotPresentDiscountRates:[];

      var cartDetails = {
        data: [],
        amount: cart.amount,
        shipping_amount: cart.shipping_amount,
        tax: cart.tax,
        taxPercent: cart.taxPercent,
        total: cart.total,
        status: 0,
        monthly: [],
        shipping_option_id: cart.shipping_option_id,
        numberofLocations: cart.num_locations_selected,
        purchaseEnabled: true,
        total_qty: cart.total_qty,
      };



      for (var i in cart.data) {
        cartDetails.data.push({
          id: cart.data[i].id,
          name: cart.data[i].name,
          price: cart.data[i].price,
          monthly:[],
          term: cart.data[i].term,
          category: cart.data[i].category,
          qty: cart.data[i].qty,
          productType: cart.data[i].productType,
        });
      }

      //send Shipping details
      var shippingMethods = this.getSessionShippingMethods();
      var shipProduct = shippingMethods[cart.shipping_option_id];
      if(shipProduct !== undefined && (cart.amount > 0 || cart.lease_amount > 0)){
          cartDetails.data.push({
            id: shipProduct.productId,
            name: shipProduct.productName,
            price: shipProduct.price,
            monthly: [],
            term: 'P',
            qty: 1,
            category: cart.data[0].category,
            productType: shipProduct.productType
          });
      }

      for (var i in cart.payment_types.products) {
        cartDetails.data.push({
          id: cart.payment_types.products[i].id,
          name: cart.payment_types.products[i].name,
          price: cart.payment_types.products[i].price,
          monthly:[],
          term: cart.payment_types.products[i].term,
          category: cart.payment_types.products[i].category,
          qty: cart.payment_types.products[i].qty,
          productType: cart.payment_types.products[i].type,
        });
      }

      for (var i in cart.transaction_products) {
        cartDetails.data.push({
          id: cart.transaction_products[i].id,
          name: cart.transaction_products[i].name,
          price: cart.transaction_products[i].price,
          monthly:[],
          term: cart.transaction_products[i].term,
          category: cart.transaction_products[i].category,
          qty: cart.transaction_products[i].qty,
          productType: cart.transaction_products[i].type,
        });
      }

      var transactionInfo = {
        mccTypes: ti.mccTypes,
        mcc: ti.mcc,
        annualVolume: ti.annualVolume,
        creditCardVolume: ti.annualcardVolume,
        telecheckVolume: ti.telecheckVolume,
        averageTicket: ti.averageTicket,
        highestTicket: ti.highestTicket,
        category: ti.category,
        amexMemberId: ti.amexMemberId,
        amexVolume: ti.amexVolume,
      };

      var data = {
        company: cd.company,
        first_name: cd.first_name,
        last_name: cd.last_name,
        email: cd.email,
        phone: cd.phone,
        address1: cd.address1,
        city: cd.city,
        state: cd.state,
        zip: cd.zip,
        recordType: cd.recordType,
        pricingDetails: pricingDetails,
        cardPresentDiscountRates: cardPresentDiscountRates,
        cardNotPresentDiscountRates: cardNotPresentDiscountRates,
        pricingOptions: {
          companyId: CONST.COMPANY_ID,
          transactionInfo: transactionInfo,
        },
        shippingAddress: cart.shippingAddress,
        cardNotPresent: cart.cardNotPresent,
        cartDetails: cartDetails
      };


      var oid = orderId || this.getTmpOrderId();

      if(oid){
        return $http.post(urlPrefix + ' /v1/merchantorders/' + oid + '/updateorder', data);
      }else{
        return $http.post(urlPrefix + '/v1/merchantorders', data);
      }
    };

    /**
     * Submit signature
     * @return {HttpPromise}
     */
    this.submitSignature = function(data){
      return $http.post(urlPrefix + '/v2/application/submit', data);
    };

    /**
     * Sipnup order
     * @return {HttpPromise}
     */
    this.signatureNotification = function(data){
      return $http.post(urlPrefix + '/v2/notification/remotesignature', data);
    };
    this.submitMerchantApplication = function(data){
      data = changeToUpper(data);
      return $http.post(urlPrefix + '/v1/application/update', data);
    };

    /**
     * submit / place empty order
     * @return {HTTPPromise}
     */
    this.submitOrderEmpty = function(){
      var orderId = this.getOrderId();
      var data = {orderId: orderId};
      return $http.post(urlPrefix + '/v1/merchantorders/' + orderId + '/updateorder', data);
    }

    /**
     * submit / place order
     * @param cartDetails
     * @return {HTTPPromise}
     */
    this.submitOrder = function(cartDetails){

      var orderId = this.getOrderId();

      var cart = orderId ? this.getOrderedCart(orderId) : this.getCart();
      var ti = this.getTransactionInfo();
      var ap = this.getAcquiringPricingStorage();
      var ep = this.getEquipmentPricingStorage();
      var gp = this.getGlobalPricingStorage();

      var pricingDetails = [];
      var discountRates = ap.discountRates !== undefined ? ap.discountRates:[];
      ep = ep !== undefined ? ep : [];
      gp = gp !== undefined ? gp : [];

      pricingDetails = pricingDetails.concat(discountRates);
      pricingDetails = pricingDetails.concat(ep);
      pricingDetails = pricingDetails.concat(gp);

      var cardPresentDiscountRates = ap.cardPresentDiscountRates !== undefined ? ap.cardPresentDiscountRates:[];
      var cardNotPresentDiscountRates = ap.cardNotPresentDiscountRates !== undefined ? ap.cardNotPresentDiscountRates:[];

      if (!cartDetails) {
        var cartDetails = {
          data: [],
          amount: cart.amount,
          shipping_amount: cart.shipping_amount,
          tax: cart.tax,
          taxPercent: cart.taxPercent,
          total: cart.total,
          status: 0,
          monthly: [],
          shipping_option_id: cart.shipping_option_id,
          numberofLocations: cart.num_locations_selected,
          purchaseEnabled: true,
          total_qty: cart.total_qty,
        };


        for (var i in cart.data) {
          cartDetails.data.push({
            id: cart.data[i].id,
            name: cart.data[i].name,
            price: cart.data[i].price,
            monthly:[],
            term: cart.data[i].term,
            qty: cart.data[i].qty,
            category: cart.data[i].category,
            productType: cart.data[i].productType,
          });
        }

        //send Shipping details
        var shippingMethods = this.getSessionShippingMethods();
        var shipProduct = shippingMethods[cart.shipping_option_id];
        if(shipProduct !== undefined && (cart.amount > 0 || cart.lease_amount > 0)){
          cartDetails.data.push({
            id: shipProduct.productId,
            name: shipProduct.productName,
            price: shipProduct.price,
            monthly: [],
            term: 'P',
            qty: 1,
            category: ti.category,
            productType: shipProduct.productType
          });
        }

        for (var i in cart.payment_types.products) {
          cartDetails.data.push({
            id: cart.payment_types.products[i].id,
            name: cart.payment_types.products[i].name,
            price: cart.payment_types.products[i].price,
            monthly:[],
            term: cart.payment_types.products[i].term,
            qty: cart.payment_types.products[i].qty,
            category: cart.payment_types.products[i].category,
            productType: cart.payment_types.products[i].type,
          });
        }

        for (var i in cart.transaction_products) {
          cartDetails.data.push({
            id: cart.transaction_products[i].id,
            name: cart.transaction_products[i].name,
            price: cart.transaction_products[i].price,
            monthly:[],
            term: cart.transaction_products[i].term,
            category: cart.transaction_products[i].category,
            qty: cart.transaction_products[i].qty,
            productType: cart.transaction_products[i].type,
          });
        }
      }

      var transactionInfo = {
          mccTypes: ti.mccTypes,
          mcc: ti.mcc,
          annualVolume: ti.annualVolume,
          creditCardVolume: ti.annualcardVolume,
          telecheckVolume: ti.telecheckVolume,
          averageTicket: ti.averageTicket,
          highestTicket: ti.highestTicket,
          category: ti.category,
          amexMemberId: ti.amexMemberId,
          amexVolume: ti.amexVolume,
      };

      var data = {
        orderId: orderId,
        company: cart.shippingAddress[0].company_name,
        first_name: cart.shippingAddress[0].firstname,
        last_name: cart.shippingAddress[0].lastname,
        email: cart.shippingAddress[0].email,
        phone: cart.shippingAddress[0].phone,
        address1: cart.shippingAddress[0].address1,
        city: cart.shippingAddress[0].city,
        state: cart.shippingAddress[0].state,
        zip: cart.shippingAddress[0].zip,
        recordType: 'Lead',
        pricingDetails: pricingDetails,
        cardPresentDiscountRates: cardPresentDiscountRates,
        cardNotPresentDiscountRates: cardNotPresentDiscountRates,
        pricingOptions: {
          companyId: CONST.COMPANY_ID,
          transactionInfo: transactionInfo,
        },
        shippingAddress: cart.shippingAddress,
        cardNotPresent: cart.cardNotPresent,
        cartDetails: cartDetails
      };

      return $http.post(urlPrefix + '/v1/merchantorders/' + orderId + '/updateorder', data);
    };


    /**
     * Store Order Id into session
     * @param data
     */
    this.storeOrderId = function(data){
      if (undefined == data) return;
      $window.sessionStorage.setItem(order_id, JSON.stringify(data));
    };

    /**
     * Clear Order Id From session
     */
    this.clearOrderId = function(){
      $window.sessionStorage.removeItem(order_id);
    };

    /**
     * Get Order Id from session
     * @return {number} Order Id or false
     */
    this.getOrderId = function(){
      var data = $window.sessionStorage.getItem(order_id);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    this.storeTmpOrderId = function(data){
      if (undefined == data) return;
      $window.sessionStorage.setItem(tmp_order_id, JSON.stringify(data));
    };

    this.clearTmpOrderId = function(){
      $window.sessionStorage.removeItem(tmp_order_id);
    };

    this.getTmpOrderId = function(){
      var data = $window.sessionStorage.getItem(tmp_order_id);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    /**
     * Store category information into session
     * @param data
     */
    this.storeCategoryInSession = function(data){
      $window.sessionStorage.setItem(category_id, JSON.stringify(data));
    };

    /**
     * Clear category from session
     */
    this.clearCategoryFromSession = function(){
      $window.sessionStorage.removeItem(category_id);
    };

    /**
     * Get category from session
     * @return {Object} Category or false
     */
    this.getCategoryFromSession = function(){
      var data = $window.sessionStorage.getItem(category_id);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    /**
     * Store products list in session
     * @param {Array} data
     */
    this.storeProductListSession = function(data){
//    cache.put(products_list, data);
      $window.sessionStorage.setItem(products_list, JSON.stringify(data));
    };

    /**
     * Clear products list from session
     */
    this.clearProductListSession = function(){
      $window.sessionStorage.removeItem(products_list);
//    cache.put(products_list, null);
    };

    /**
     * get product list from session
     * @return {Array} product list or false
     */
    this.getProductListFromSession = function(){
//    return cache.get(products_list);
      var data = $window.sessionStorage.getItem(products_list);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    /**
     * Store Geo Data in cache
     * @param data
     */
    this.storeGeoData = function(data){
      cache.put(geo_data, data);
    };

    /**
     * Clear Geo Data from cache
     */
    this.clearGeoData = function(){
      cache.put(geo_data, null);
    };

    /**
     * Get Geo Data from cache
     * @return {Object}
     */
    this.getGeoData = function(){
      return cache.get(geo_data);
    };

    /**
     * Store Cart in session
     * @param cart
     */
    this.storeCart = function(cart){
      window.sessionStorage.setItem(storage_cart, JSON.stringify(cart));
      $rootScope.$emit('cart-changed', cart);
    };

    /**
     * Store ordered cart in session
     * @param order_id
     * @param cart
     */
    this.storeOrderedCart = function(order_id, cart){
      var s = {};
      s[order_id] = cart
      window.sessionStorage.setItem(ordered_cart, JSON.stringify(s));
    };

    /**
     * Clear Cart from session
     */
    this.clearCart = function(){
      window.sessionStorage.removeItem(storage_cart);
    };

    /**
     * Clear ordered cart from session
     */
    this.clearOrderedCart = function(){
      window.sessionStorage.removeItem(ordered_cart);
    };

    /**
     * Get Cart From session or if empty create cart object
     * @return {Object}
     */
    this.getCart = function(){
      var cart = window.sessionStorage.getItem(storage_cart);
      if (cart){
        return JSON.parse(cart);
      }
      return {
        data: [],
        payment_types: null,
        amount: 0,
        lease_amount: 0,
        shipping_amount: 0,
        tax: 0,
        leaseTax: 0,
        taxPercent: -1,
        total: 0,
        status: 0,
        onetimeAmount: 0,
        mfeeAmount: 0,
        monthly: [],
        mFees: {},
        onetimeFees: {},
        shipping_option_id: 1,
        shippingAddress: [{}],
        validation: {},
        total_lease_qty: 0,
        total_product_fee_amount: 0,
        product_fees: {},
        transaction_products: [],
        // transaction_fee: null,
        total_qty: 0
      };
    };

    /**
     * Get ordered cart from session
     * @param order_id
     * @return {*}
     */
    this.getOrderedCart = function(order_id){
      var carts = window.sessionStorage.getItem(ordered_cart);
      var cs, c;
      if (carts){
        cs = JSON.parse(carts);
      }
      if (carts) {
        return cs[order_id];
      }
      return null;

    };

    /**
     * Store transaction info in session
     * @param data
     */
    this.storeTransactionInfo = function(data){
      $window.sessionStorage.setItem(transaction_info, JSON.stringify(data));
    };

    /**
     * Clear transaction info from session
     */
    this.clearTransactionInfo = function(){
      $window.sessionStorage.removeItem(transaction_info);
    };

    /**
     * Get transaction info from session
     * @return {boolean}
     */
    this.getTransactionInfo = function(){
      var data = $window.sessionStorage.getItem(transaction_info);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    /**
     * Store equipment pricing in session
     * @param data
     */
    this.storeEquipmentPricing = function(data){
      $window.sessionStorage.setItem(equipment_pricing, JSON.stringify(data));
    };

    /**
     * Clear equipment pricing from session
     */
    this.clearEquipmentPricing = function(){
      $window.sessionStorage.removeItem(equipment_pricing);
    };

    /**
     * Get equipment pricing from session
     * @return {Array}
     */
    this.getEquipmentPricingStorage = function(){
      var data = $window.sessionStorage.getItem(equipment_pricing);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    /**
     * Store acquiring pricing in session
     * @param data
     */
    this.storeAcquiringPricing = function(data){
      $window.sessionStorage.setItem(acquiring_pricing, JSON.stringify(data));
    };

    /**
     * Clear acquiring pricing from session
     */
    this.clearAcquiringPricing = function(){
      $window.sessionStorage.removeItem(acquiring_pricing);
    };

    /**
     * Get acquiring pricing from session
     * @return {Array}
     */
    this.getAcquiringPricingStorage = function(){
      var data = $window.sessionStorage.getItem(acquiring_pricing);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    /**
     * Store global pricing in session
     * @param data
     */
    this.storeGlobalPricing = function(data){
      $window.sessionStorage.setItem(global_pricing, JSON.stringify(data));
    };

    /**
     * Clear global pricing from session
     */
    this.clearGlobalPricing = function(){
      $window.sessionStorage.removeItem(global_pricing);
    };

    /**
     * Get global pricing from session
     * @return {Array}
     */
    this.getGlobalPricingStorage = function(){
      var data = $window.sessionStorage.getItem(global_pricing);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    /**
     * Recalculate cart
     * @param cart
     * @param taxAmt
     * @return {Object}
     */
    this.recalculateCart = function(cart, taxAmt) {

      var prev_num_locations = cart.num_locations;

      cart.amount = 0;
      cart.cardNotPresent = 0;
      cart.num_locations = 0;
      cart.num_locations_selected = cart.num_locations_selected || 0;
      cart.lease_amount = 0;
      cart.total_qty = 0;
      cart.total_lease_qty = 0;
      cart.total_purchase_qty = 0;
      cart.product_fees = {};
      cart.total_product_fee_amount = 0;
      var shippingMethods = this.getSessionShippingMethods();

      var total_product_fee_amount = 0;
      var product_fees = {};

      var noproduct_fees = [];

      for (var i in cart.data) {

        cart.total_product_fee_amount = total_product_fee_amount;
        cart.product_fees = product_fees;

        if ('Terminal' == cart.data[i].productType || 'Gateway' == cart.data[i].productType || 'VAR' == cart.data[i].productType || 'TERM' == cart.data[i].productType) {
          cart.num_locations = cart.num_locations + cart.data[i].qty;
        }

        cart.data[i].min_lease_amount = 0;

        cart.total_qty += parseInt(cart.data[i].qty);

        cart.cardNotPresent |= (cart.data[i].cardNotPresent ? 2 : 1);

        if (CONST.PURCHASE_CODE == cart.data[i].term || CONST.OWNED_CODE == cart.data[i].term) {
          if (cart.data[i].pricingModel) {
            for (var j = 0; j < cart.data[i].pricingModel.length; j++) {
              if (CONST.PURCHASE_CODE != cart.data[i].pricingModel[j].purchaseType
                && CONST.OWNED_CODE != cart.data[i].pricingModel[j].purchaseType
                && cart.data[i].pricingModel[j].defaultAmt
                && (!cart.data[i].min_lease_amount || cart.data[i].pricingModel[j].defaultAmt < cart.data[i].min_lease_amount)) {
                cart.data[i].min_lease_amount = cart.data[i].pricingModel[j].defaultAmt;
              }
            }
          }
          if(cart.data[i].price){
          cart.amount += cart.data[i].qty * cart.data[i].price;
          }
          cart.total_purchase_qty += parseInt(cart.data[i].qty);
          cart.data[i].pmodel = null;
        } else {
          var pmodel;
          if (cart.data[i].pricingModel) {
            for (var j = 0; j < cart.data[i].pricingModel.length; j++) {
              if (cart.data[i].pricingModel[j].purchaseType == cart.data[i].term) {
                pmodel = cart.data[i].pricingModel[j];
                break;
              }
            }
          }
          if (!pmodel) {
            console.log('no pricing model!!')
            return;
          }
          cart.data[i].pmodel = pmodel;
          cart.lease_amount += cart.data[i].qty * pmodel.defaultAmt;
          cart.total_lease_qty += parseInt(cart.data[i].qty);
        }
      }


      if (taxAmt) {
        cart.tax = taxAmt;
      } else {
        if (cart.taxPercent < 0) {
          cart.tax = 0;
        } else {
          cart.tax = cart.amount * cart.taxPercent;
          cart.leaseTax = cart.lease_amount * cart.taxPercent;
        }
      }

      if(cart.amount > 0 || cart.lease_amount > 0)
        cart.shipping_amount = shippingMethods[cart.shipping_option_id].price;
      else
        cart.shipping_amount = 0;

      cart.total = cart.amount + cart.shipping_amount + cart.tax;

      // reset locations
      if (prev_num_locations !== cart.num_locations) {
        cart.num_locations_selected = 0;
      }

      if (1 === cart.num_locations) {
        cart.num_locations_selected = 1;
      }

      return cart;
    };

    /**
     * Reset Cart Pricing, if TransactionInfo available
     *
     */
    this.resetCartOverridePricing = function(cart){
        var ti = this.getTransactionInfo();
        if (!ti) {
          return;
        }
        for(var i in cart.data){
          var p = cart.data[i];
          var isLeased = (p.term != CONST.PURCHASE_CODE && p.term != CONST.OWNED_CODE) ? true : false;
          if(!isLeased){
              if(cart.data[i].defaultPrice)
                cart.data[i].price = cart.data[i].defaultPrice;
          }
          else{
              var idx = p.pricingModel_default.map(function(priceModel){ return priceModel.id; }).indexOf(p.pmodel.id);
              p.price = p.pricingModel_default[idx].defaultAmt;
              p.pricingModel[idx].defaultAmt = p.pricingModel_default[idx].defaultAmt;
          }
       }
    }

    /**
     * Lease product
     * @param bundle product
     * @param cart
     * @param pid
     * @return {Object} cart
     */
    this.leaseProduct = function(bundle, cart, category){

      if (!bundle) {
        return;
      }

      var pid = bundle.productId || bundle.id;
      var name = bundle.productName || bundle.name;

      var qty = bundle.qty || 1;

      category = category || this.getCategoryFromSession().name;

      if (!Object.keys(bundle).length) {
        return;
      }

      if (!bundle.pricingModel || !bundle.pricingModel.length) {
        return;
      }
      var term;
      for(var i = 0; i < bundle.pricingModel.length; i++) {
         if (bundle.pricingModel[i].purchaseType == "LT36"){
             term = bundle.pricingModel[i].purchaseType;
             termPaymentType = bundle.pricingModel[i].paymentType;
             break;
      } else {
             term = bundle.pricingModel[0].purchaseType;
             termPaymentType = bundle.pricingModel[0].paymentType;
          }
      };

      var cardNotPresent = bundle.cardNotPresent ? true : false;

      var pr = {
          id: pid,
        name: name,
          price: bundle.price,
          pricingModel: bundle.pricingModel,
        pricingModel_default: angular.copy(bundle.pricingModel),
          term: term,
        termPaymentType: termPaymentType,
          pmodel: null,
        category: category,
        cardNotPresent: cardNotPresent,
        productType: bundle.productType,
        qty: qty
        };

      var index = this.getCartProductIndex(cart, pr);

      if (-1 !== index){
        pr = cart.data[index];
        pr.term = term;
        pr.termPaymentType = termPaymentType;
        pr.pricingModel = bundle.pricingModel;
        pr.pricingModel_default = angular.copy(bundle.pricingModel);
        cart.data[index] = pr;
      } else {
        cart.data.push(pr);
      }

      cart = this.cartChanged(cart);
      this.clearOrderId();
      return cart;
    };

    /**
     * Recalculate cart and store it in session
     * @param cart
     * @return {Object}
     */
    this.cartChanged = function(cart){
      cart = this.recalculateCart(cart);
      this.storeCart(cart);
      return cart;
    };

    /**
     * Recalculate ordered cart and store it in session
     * @param orderId
     * @param cart
     * @return {Object}
     */
    this.orderedCartChanged = function(orderId, cart){
      cart = this.recalculateCart(cart);
      this.storeOrderedCart(orderId, cart);
      return cart;
    };

    /**
     * Lookup city and state using Google Map API
     * @param zip
     * @param callback function
     */
    this.lookupByZip = function(zip, callback){

      if (zip.length < 5) {
        callback.apply(this, [null, null]);
        return;
      }

      var geocoder = new google.maps.Geocoder();
      geocoder.geocode( { "address": zip }, function(result, status) {
        var city = '';
        var state = '';
        var neighborhood = '';
        var sublocality = '';
        if (status == google.maps.GeocoderStatus.OK && result.length > 0) {
          for (var component in result[0]['address_components']) {
            for (var i in result[0]['address_components'][component]['types']) {
              if (result[0]['address_components'][component]['types'][i] == "administrative_area_level_1") {
                state = result[0]['address_components'][component]['short_name'];
              }
              if (result[0]['address_components'][component]['types'][i] == "locality") {
                city = result[0]['address_components'][component]['long_name'].replace(/(St.|'|ñ)/g, function(match){return CONST.citySpecialChar[match];});
              }
              if (result[0]['address_components'][component]['types'][i] == "neighborhood") {
                neighborhood = result[0]['address_components'][component]['long_name'];
              }
              if (result[0]['address_components'][component]['types'][i] == "sublocality") {
                sublocality = result[0]['address_components'][component]['long_name'];
              }
              if (result[0]['address_components'][component]['types'][i] == "country") {
                country = result[0]['address_components'][component]['short_name'];
              }
            }
          }

          if (!city.length && neighborhood.length) {
            city = neighborhood;
          }
          if (!city.length && sublocality.length) {
            city = sublocality;
          }
        }

        if ('US' == country) {
          callback.apply(this, [city, state]);
        } else {
          callback.apply(this, [null, null]);
        }

      });
    };

    this.getInvalidSsn = function(){
      return $http.get('../../invalidSsn.json');
    };

    /**
     * Set pricing data to cart
     * @param cart
     * @param dt
     * @param addData {Boolean} if true add one time payments to cart
     * @return {Object} cart
     */
    this.setPricingToCart = function(cart, dt, addData){

      var data = angular.copy(dt);

      var paymentProducts = {
        products: {}
      };

      addData = addData || false;

      var productAttributes = {}, pid;

      for (var i = 0; i < data.length; i++){
        if (data[i].productAttribute && data[i].showoncart) {

          var tmpId = data[i].productAttribute.name + data[i].productAttribute.value;
          if (productAttributes[tmpId]) {
            data[i].showoncart = false;
          } else {
            productAttributes[tmpId] = {
              defaultAmt: 0,
              index: i
            };
            data[i].productName = data[i].productAttribute.value;
          }
          productAttributes[tmpId].defaultAmt += data[i].defaultAmt
          data[productAttributes[tmpId].index].defaultAmt = productAttributes[tmpId].defaultAmt;
        }
      }

      for (var i = 0; i < data.length; i++){

        if ('Transaction' == data[i].occurrence.type) {
          // if (2 == data[i].productId || 80382 == data[i].productId){
          //   cart.transaction_fee = {
          //     fee: data[i].defaultAmt,
          //     rate: data[i].rateDefault,
          //   };
          // }
        } else {

          if (data[i].showoncart) {

            if('Recurring' == data[i].occurrence.type) {
              if (data[i].paymentType == 'Installment' || data[i].paymentType == 'Lease' || data[i].paymentType == 'Rent') {
                var pricingModel = [];
                pricingModel[0] = {
                  defaultAmt: data[i].defaultAmt,
                  fkProdId: data[i].productId,
                  id: '',
                  occurrence: data[i].occurrence.type,
                  paymentTerm: data[i].paymentTerm,
                  paymentType: data[i].paymentType,
                  purchaseType: data[i].purchaseType,
                  purchaseTypeLabel: ''
                }

                cart.data.push({
                  id: data[i].productId,
                  name: data[i].productName,
                  price: data[i].defaultAmt,
                  defaultPrice: data[i].defaultAmt,
                productType: data[i].productType,
                term: data[i].purchaseType,
                qty: data[i].quantity,
                  category: data[i].category ? data[i].category : transactionFormData.category,
                  cardNotPresent: data[i].cardNotPresent,
                  pricingModel: pricingModel
                });
              }else{
                  cart.mFees[data[i].productId] = {
                    name: data[i].productName,
                    amount: data[i].defaultAmt,
                    disclosure: data[i].disclosure,
              };
                  cart.mfeeAmount +=  cart.mFees[data[i].productId].amount;
              }

            } else if ('Onetime_Fee' == data[i].occurrence.type){

              cart.onetimeFees[data[i].productId] = {
                name: data[i].productName,
                amount: data[i].defaultAmt,
              };

              cart.onetimeAmount += cart.onetimeFees[data[i].productId].amount;
            } else if ('Onetime_Product' == data[i].occurrence.type) {
              if (addData) {
                cart.data.push({
                  id: data[i].productId,
                  name: data[i].productName,
                  price: data[i].defaultAmt,
                  defaultPrice: data[i].defaultAmt,
                  productType: data[i].productType,
                  term: data[i].purchaseType,
                  category: data[i].category,
                  cardNotPresent: data[i].cardNotPresent,
                  qty: data[i].quantity,
                });
              }
            } else if ('Acquiring' == data[i].occurrence.type) {
              paymentProducts.id = data[i].parentProduct ? data[i].parentProduct.id : null;
              paymentProducts.name = data[i].parentProduct ? data[i].parentProduct.name : null;
              paymentProducts.products[data[i].productId] = {
                id: data[i].productId,
                name: data[i].productName,
                price: data[i].defaultAmt,
                productType: data[i].productType,
                term: data[i].purchaseType,
                category: data[i].category,
                cardNotPresent: data[i].cardNotPresent,
                qty: data[i].quantity,
              };

            }
          }
        }
      }

      if (addData) {
        cart.payment_types = paymentProducts;

        for (var i = 0; i < cart.cartTransactionRates.length; i++) {
          pid = cart.cartTransactionRates[i].parentProduct ? cart.cartTransactionRates[i].parentProduct.id : cart.cartTransactionRates[i].productId;

          if ('ACQUIRING' == cart.cartTransactionRates[i].productType) {
            if (!cart.payment_types) {
              cart.payment_types = {};
            }

            if (!cart.payment_types.groups) {
              cart.payment_types.groups = [];
            }

            if (-1 == cart.payment_types.groups.map(function(e) {return e.name;}).indexOf(cart.cartTransactionRates[i].groupName)) {
              cart.payment_types.groups.push({
                pid: cart.cartTransactionRates[i].groupName,
                name: cart.cartTransactionRates[i].groupName,
                fee: cart.cartTransactionRates[i].parentProduct.fee,
                rate: cart.cartTransactionRates[i].parentProduct.rate,
              })

            }

          } else {

            index = cart.transaction_products.map(function(e) {return e.id;}).indexOf(pid);

            if (-1 !== index) {
              cart.transaction_products[index].parentProduct = cart.cartTransactionRates[i].parentProduct;
            }
          }
        }

      }
      return cart;
    };

    /**
     * Initialize pricing data
     * @param callback function
     * @param ap Acquiring pricing
     * @param ep Equipment Pricing
     * @param gp Global Pricing
     */
    this.initPricingData = function(callback, ap, ep, gp){
      var cbf = function(){
        if (ap && ep && gp) {
          fdService.cartChanged(cart);
          if (ap && ep && gp) {
          callback.apply(this, [1]);

          }
        }
      };

      ap = ap || null;
      ep = ep || null;
      gp = gp || null;

      var fdService = this;
      var cart = fdService.getCart();
      cart.onetimeFees = {};
      cart.mFees = {};
      cart.onetimeAmount = 0;
      cart.mfeeAmount = 0;

      var ti = fdService.getTransactionInfo();

      fdService.clearAcquiringPricing();
      fdService.clearGlobalPricing();
      fdService.clearEquipmentPricing();

      if (!ap) {
        fdService.getAcquiringPricing(cart, ti)
          .success(function(data, status, headers, config) {
            fdService.storeAcquiringPricing(data);

              var index, pid;

              var newData = [];
              for (var i in data) {

                if ('cartTransactionRates' == i) {
                  cart.cartTransactionRates = data[i];
                } else {
                  newData = newData.concat(data[i]);
                }

              }


              for (i in data.cartTransactionRates) {

                pid = data.cartTransactionRates[i].parentProduct ? data.cartTransactionRates[i].parentProduct.id : data.cartTransactionRates[i].productId;

                if ('ACQUIRING' == data.cartTransactionRates[i].productType) {
                  if (!cart.payment_types) {
                    cart.payment_types = {};
                  }
                  if (!cart.payment_types.groups) {
                    cart.payment_types.groups = [];
                  }

                  if (-1 == cart.payment_types.groups.map(function(e) {return e.name;}).indexOf(data.cartTransactionRates[i].groupName)) {
                    cart.payment_types.groups.push({
                      pid: data.cartTransactionRates[i].groupName,
                      name: data.cartTransactionRates[i].groupName,
                      fee: data.cartTransactionRates[i].parentProduct.fee,
                      rate: data.cartTransactionRates[i].parentProduct.rate,
                    })

                  }

                } else {

                  index = cart.transaction_products.map(function(e) {return e.id;}).indexOf(pid);

                  if (-1 !== index) {
                    cart.transaction_products[index].parentProduct = data.cartTransactionRates[i].parentProduct;
                  }
                }
              }

              cart = fdService.setPricingToCart(cart, newData);

            ap = data;
            cbf();

          })
          .error(function(data, status, headers, config) {
            callback.apply(this, [0]);
            console.log('error')
          });
      }

      if (!ep) {
        fdService.getEquipmentPricing(cart, ti)
          .success(function(data, status, headers, config) {
            fdService.storeEquipmentPricing(data);
            cart = fdService.setPricingToCart(cart, data);

            ep = data;

            cbf();

          })
          .error(function(data, status, headers, config) {
            callback.apply(this, [0]);
            console.log('error')
          });
      }
      else{
        //restore Equipment Pricing details into session
        fdService.storeEquipmentPricing(ep);
        cart = fdService.setPricingToCart(cart, ep);
        cbf();
      }

      if (!gp) {
        fdService.getGlobalPricing(cart, ti)
          .success(function(data, status, headers, config) {
            fdService.storeGlobalPricing(data);
            cart = fdService.setPricingToCart(cart, data);

            gp = data;

            cbf();

          })
          .error(function(data, status, headers, config) {
            callback.apply(this, [0]);
            console.log('error')
          });
      }
      else{
        //restore Global Pricing details into session
        fdService.storeGlobalPricing(gp);
        cart = fdService.setPricingToCart(cart, gp);
        cbf();
      }
    };

    this.updatePricing = function(callback){
      var ti = this.getTransactionInfo();
      var gp = this.getGlobalPricingStorage();

      if (!ti) {
        return;
      }
      $timeout(function(){
        this.initPricingData(function(status){
          if (status) {
            if('function' === typeof callback){
              callback();
            }
            console.log('updated');
          } else {
            console.log('error');
          }
        }, null, null, gp);
      }.bind(this));

    };

    /**
     * Description get FSP company flag to enable Multiple DDA
     * @method getFspCompany
     * @return {HTTPPromise}
     */
    this.getFspCompany = function(orderId) {
      return $http.get(urlPrefix + 'v2/signup/fspcompany/'+orderId);
    }
    /**
     * Description get MCC Code Details
     * @method getMCCDetails
     * @return {HTTPPromise}
     */
    this.getMCCDetails = function(categoryName, mccNumber) {
      return $http.get(urlPrefix + '/v1/companies/'+ CONST.COMPANY_ID +'/category/'+ categoryName +'/merchantcategorycodes/'+ mccNumber +'/industries');
    };

    /**
     * Post Signup Merchant Owner Information
     * @param data
     * @param orderId
     * @return {HTTPPromise}
     */
    this.postBusinessinformation = function(data, orderId) {
      return $http.post(urlPrefix + '/v1/merchantorders/' + orderId + '/businessinformation', data);
    };


    /**
     * get products list for order
     * @param orderId
     * @return {HTTPPromise}
     */
    this.getOrderProducts = function(orderId) {
      return $http.get(urlPrefix + '/v1/cart/' + orderId + '/products/');
    };

    /**
     * get list of products for order
     * @param orderId
     * @return {HTTPPromise}
     */
    this.getCartOrderProducts = function(orderId) {
      return $http.get(urlPrefix + '/v1/merchantorders/' + orderId + '/cart/products');
    };

    /**
     * get cart details for order
     * @param orderId
     * @return {HTTPPromise}
     */
    this.getCartDetails = function(orderId) {
      return $http.get(urlPrefix + '/v1/merchantorders/' + orderId + '/cart/details');
    };

    /**
     * get product attributes
     * @param productId
     * @return {HTTPPromise}
     */
    this.getProductAttributes = function(orderId, lineItemId) {
      return $http.get(urlPrefix + '/v1/merchantorders/'+ orderId +'/orderLineItems/'+ lineItemId +'/attributes/');
    };

    /**
     * post order locations
     * @param data
     * @param orderId
     * @return {HTTPPromise}
     */
    this.postOrderLocations = function(data, orderId) {
      return $http.post(urlPrefix + '/v1/merchantorders/' + orderId + '/locations', data);
    };

    /**
     * post account preferences
     * @param data
     * @param orderId
     * @return {HTTPPromise}
     */
    this.postAccountPreferences = function(data, orderId) {
      return $http.post(urlPrefix + '/v1/merchantorders/' + orderId + '/accountpreferences', data);
    };

    /**
     * Description Get All Shipping Methods
     * @method getShippingMethods
     * @return {HTTPPromise}
     */
    this.getShippingMethods = function() {
      return $http.get(urlPrefix +'/v1/companies/'+ CONST.COMPANY_ID +'/products/shipping');
    };

    /**
     * Get order locations
     * @return {HTTPPromise}
     */
    this.getOrderLocations = function(orderId) {
      return $http.get(urlPrefix +'/v1/merchantorders/' + orderId + '/locations');
    };

    /**
     * get order business information
     * @param orderId
     * @return {HTTPPromise}
     */
    this.getOrderBusinessinformation = function(orderId) {
      return $http.get(urlPrefix +'/v1/merchantorders/' + orderId + '/businessinformation');
    };

    /**
     * Get account preferences
     * @param orderId
     * @return {HTTPPromise}
     */
    this.getAccountPreferences = function(orderId) {
      return $http.get(urlPrefix + '/v1/merchantorders/' + orderId + '/accountpreferences');
    };

    /**
     * get merchant order agreement
     * @param orderId
     * @return {HTTPPromise}
     */
    this.getOrderAgreementInformation = function(orderId, ownerId) {
        var appendURL = ownerId ? '/' + ownerId : '';
        return $http.get(urlPrefix + '/v1/merchantorders/' + orderId + '/agreement' + appendURL);
    };




    /**
     * Store Shipping Methods into Session storage
     * @method storeShippingMethods
     * @param shippingMethods
     */
    this.storeShippingMethods = function(data){
      if (undefined == data) return;
      $window.sessionStorage.setItem(shipping_options, JSON.stringify(data));
    };

    /**
     * Get Shipping Methods from Session storage
     * @method getShippingMethods
     * @return shippingMethods
     */
    this.getSessionShippingMethods = function(){
      var data = $window.sessionStorage.getItem(shipping_options);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    /**
     * Clear Shipping Methods from Session storage
     * @method clearShippingOptions
     */
    this.clearSessionShippingMethods = function(){
      $window.sessionStorage.removeItem(shipping_options);
    };

    /**
     * Get Products By Option Type
     * @param type
     * @return {HTTPPromise}
     */
    this.getProductsByOptionType = function(type) {
      return $http.get(urlPrefix +'/v1/companies/'+ CONST.COMPANY_ID +'/products/'+ type +'/types/');
    };


    /**
     * get index of product in the cart.data array
     * @param cart
     * @param pr
     * @return {number}
     */
    this.getCartProductIndex = function (cart, pr) {

      for (var i in cart.data) {
        if (pr.id == cart.data[i].id && pr.term == cart.data[i].term && pr.category == cart.data[i].category) {
          return i;
        }
      }
      return -1;

    };

    /**
     * Get Owners signature status
     * @param type
     * @return {HTTPPromise}
     */
    this.getOwnersSignStatus = function(orderId) {
      return $http.get(urlPrefix +'v1/remotesignature/status/' + orderId);
    };


    /**
     * Description
     * @method validateBusiness
     * @param {} element
     * @param {} model
     * @return
     */
    this.validateBusiness = function(element, model) {
        if (!model) {
            return;
        }

        var dataToValidate = {};
        dataToValidate.merInfo = {};
        dataToValidate.merInfo.contacts = {};
        dataToValidate.merInfo.contacts.contactInfo = [];
        dataToValidate.merInfo.contacts.contactInfo.push({
            "email": model
        });
        this.validateContact(dataToValidate)
            .success(function(response, status, headers, config) {
                if (response.length != 0) {
                    for (var i = 0; i < response.length; i++) {
                        if (response[i].errorCode = 8104) {
                            element.$setValidity("emailnotValid", false);
                            return;
                        }
                    }
                } else {
                    element.$setValidity("emailnotValid", true);
                }
            })
            .error(function(data, status, headers, config) {
                console.log('error');
            });

    };

  }]);