app.service('fdService', ['$http', '$filter', '$window', '$cacheFactory', 'CONST', '$timeout',
  function ($http, $filter, $window, $cacheFactory, CONST, $timeout) {


    // Prefix for urls. Empty for now
    var urlPrefix = '';

    // Cache Factory Object
    var cache = $cacheFactory('fd');

    // Cart name in session storage
    var storage_cart = 'cart_s';

    // Order Id name in session storage
    var order_id = 'order_id';

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
      return $http.get(urlPrefix + '/marketplace/v1/categories');
    };

    /**
     * Get category codes
     * @return {HttpPromise}
     */
    this.getMccCodes = function(category){
      return $http.get(urlPrefix + '/marketplace/v1/categories/'+ category +'/industries/');
    };

    /**
     * Get MCC codes by type
     * @return {HttpPromise}
     */
    this.getMccTypes = function(category, type){
      return $http.get(urlPrefix + '/marketplace/v1/categories/'+ category +'/industries/'+ type +'/merchantcategorycodes/' );
    };

    //changed
    this.getProduct = function(pid){
      return $http.get(urlPrefix + '/marketplace/v1/products/' + pid + '/details/');
    };

    /**
     * Get Recommended products
     * @return {HttpPromise}
     */
    this.getRecommendedBundles = function(id){
      return $http.get(urlPrefix + '/marketplace/v1/products/'+ id + '/recommended/');
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
        var res = $http({method: 'GET', cache: true, url: urlPrefix + '/marketplace/v1/products'});
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
      return $http.get(urlPrefix + '/marketplace/v1/products/' + id + '/features/');
    };

    /**
     * Get Product specifications
     * @return {HttpPromise}
     */
    this.getSpecs = function(id){
      return $http.get(urlPrefix + '/marketplace/v1/products/' + id + '/specs/');
    };

    /**
     * Get Included Products
     * @return {HttpPromise}
     */
    this.getProductsList = function(pid){
      return $http.get(urlPrefix + '/marketplace/v1/products/' + pid + '/includes/');
    };

    /**
     * Get Product FAQ list
     * @return {HttpPromise}
     */
    this.getFaqs = function(pid){
      return $http.get(urlPrefix + '/marketplace/v1/products/' + pid + '/faq/');
    };

    /**
     * Get Product Options
     * @return {HttpPromise}
     */
    this.getProductOptions = function(pid){
      return $http.get(urlPrefix + '/marketplace/v1/products/' + pid + '/options/');
    };

    /**
     * Service to validate a cart
     * @return {HttpPromise}
     */
    this.validateCart = function(cart, ti){

      ti = ti || this.getTransactionInfo();


      var data = {
        merchant : "",
        cartdetails : [],
        transactionInfo: {
          mccTypes: ti.mccTypes || '',
          mcc: ti.mcc || null,
          annualVolume: ti.annualVolume || null,
          averageTicket: ti.averageTicket || null,
          amexVolume: ti.amexVolume || null,
          highestTicket: ti.highestTicket || null,
          category: ti.category || null
        }
      };

      if (Object.keys(cart.data).length) {
        for (var i in cart.data) {
          data.cartdetails.push(
            {
              "productid": cart.data[i].id,
            }
          );
        }
      }

      if (cart.payment_types && Object.keys(cart.payment_types.products).length) {
        for (var i in cart.payment_types.products) {
          data.cartdetails.push(
            {
              "productid": cart.payment_types.products[i].id,
            }
          );
        }

      }
      return $http.post(urlPrefix + 'marketplace/v1/cart/validate', data);
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
        "transactionInfo": ti,
        "products": []
      };
      for (var i in cart.data) {
        data.products.push(
          {
            "id": cart.data[i].id,
            "name": cart.data[i].name,
            "price": cart.data[i].price,
            "type": cart.data[i].name,
            "term": cart.data[i].term,
            "qty": cart.data[i].qty,
          }
        );
      }
      return $http.post(urlPrefix + '/marketplace/v1/pricing/equipment', data);
    };

    /**
     * Get global pricing list
     * @return {HttpPromise}
     */
    this.getGlobalPricing = function(){
      return $http.post(urlPrefix + '/marketplace/v1/pricing/global', {});
    };

    /**
     * Get acquiring pricing list
     * @return {HttpPromise}
     */
    this.getAcquiringPricing = function(cart, ti){

      ti = ti || this.getTransactionInfo();

      data = {
        "transactionInfo": ti,
        "products": []
      };
      if (cart.payment_types && Object.keys(cart.payment_types.products).length) {
        for (var i in cart.payment_types.products) {
          data.products.push(
            {
              "id": cart.payment_types.products[i].id,
              "name": cart.payment_types.products[i].name,
              "price": cart.payment_types.products[i].price,
              "type": 'Acquiring', // Hardcoded
              "term": cart.payment_types.products[i].term,
              "qty": cart.payment_types.products[i].qty,
            }
          );
        }

      }

      return $http.post(urlPrefix + '/marketplace/v1/pricing/acquiring', data);
    };

    /**
     * Checkout order
     * @return {HttpPromise}
     */
    this.placeOrder = function(orderId, cart, ti, ap, ep, gp){

      cart = cart || this.getCart();
      ti = ti || this.getTransactionInfo();
      ap = ap || this.getAcquiringPricingStorage();
      ep = ep || this.getEquipmentPricingStorage();
      gp = gp || this.getGlobalPricingStorage();

      var pricingDetails = [];
      pricingDetails = pricingDetails.concat(ap);
      pricingDetails = pricingDetails.concat(ep);
      pricingDetails = pricingDetails.concat(gp);

      var cartDetails = {
        data: [],
        amount: cart.amount,
        shipping_amount: cart.shipping_amount,
        tax: cart.tax,
        taxPercent: cart.taxPercent,
        total: cart.total,
        status: 0,
        shipping_option_id: cart.shipping_option_id,
        purchaseEnabled: true,
        total_qty: cart.total_qty,
      };


      for (var i in cart.data) {
        cartDetails.data.push({
          id: cart.data[i].id,
          name: cart.data[i].name,
          price: cart.data[i].price,
          term: cart.data[i].term,
          qty: cart.data[i].qty,
          productType: cart.data[i].productType,
        });
      }

      for (var i in cart.payment_types.products) {
        cartDetails.data.push({
          id: cart.payment_types.products[i].id,
          name: cart.payment_types.products[i].name,
          price: cart.payment_types.products[i].price,
          term: cart.payment_types.products[i].term,
          qty: cart.payment_types.products[i].qty,
          productType: cart.payment_types.products[i].type,
        });
      }

      var data = {
        first_name: cart.shippingAddress.firstname,
        last_name: cart.shippingAddress.lastname,
        email: cart.shippingAddress.email,
        company: cart.shippingAddress.company_name,
        pricingOptions: {
          transactionInfo: ti,
        },
        shippingAddress: cart.shippingAddress,
        pricingDetails: pricingDetails,
        cartDetails: cartDetails
      };

      return $http.post(urlPrefix + '/marketplace/v1/application/checkout', data);
    };

    /**
     * Submit signature
     * @return {HttpPromise}
     */
    this.submitSignature = function(data){
      return $http.post(urlPrefix + '/marketplace/v1/application/submit/', data);
    };

    /**
     * Sipnup order
     * @return {HttpPromise}
     */
    this.submitMerchantApplication = function(data){
      data = changeToUpper(data);
      return $http.post(urlPrefix + '/marketplace/v1/application/update', data);
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
      cache.put(products_list, data);
    };

    /**
     * Clear products list from session
     */
    this.clearProductListSession = function(){
      cache.put(products_list, null);
    };

    /**
     * get product list from session
     * @return {Array} product list or false
     */
    this.getProductListFromSession = function(){
      return cache.get(products_list);
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
        data: {},
        payment_types: null,
        amount: 0,
        lease_amount: 0,
        shipping_amount: 0,
        tax: 0,
        taxPercent: -1,
        total: 0,
        status: 0,
        onetimeAmount: 0,
        mfeeAmount: 0,
        monthly: [],
        mFees: {},
        onetimeFees: {},
        shipping_option_id: 1,
        shippingAddress: {},
        validation: {},
        total_lease_qty: 0,
        total_product_fee_amount: 0,
        product_fees: {},
        transaction_fee: null,
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

      cart.amount = 0;
      cart.lease_amount = 0;
      cart.total_qty = 0;
      cart.total_lease_qty = 0;
      cart.total_purchase_qty = 0;
      cart.product_fees = {};
      cart.total_product_fee_amount = 0;

      var total_product_fee_amount = 0;
      var product_fees = {};

      var noproduct_fees = [];

      for (var i in cart.data) {

        cart.total_product_fee_amount = total_product_fee_amount;
        cart.product_fees = product_fees;

        cart.data[i].min_lease_amount = 0;

        cart.total_qty += parseInt(cart.data[i].qty);


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
          cart.amount += cart.data[i].qty * cart.data[i].price;
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
        }
      }

      cart.shipping_amount = CONST.SHIPPING_METHODS[cart.shipping_option_id].price;

      cart.total = cart.amount + cart.shipping_amount + cart.tax;

      return cart;
    };

    /**
     * Lease product
     * @param bundle product
     * @param cart
     * @param pid
     * @return {Object} cart
     */
    this.leaseProduct = function(bundle, cart, pid){

      if (!bundle) {
        return;
      }

      pid = pid || bundle.productId;

      if (!Object.keys(bundle).length) {
        return;
      }

      if (!bundle.pricingModel || !bundle.pricingModel.length) {
        return;
      }
      var term = bundle.pricingModel[0].purchaseType;

      if (cart.data[pid]){
        cart.data[pid].term = term;
      } else {
        cart.data[pid] = {
          id: pid,
          name: bundle.productName,
          price: bundle.price,
          pricingModel: bundle.pricingModel,
          term: term,
          pmodel: null,
          qty: "1"
        };
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
      if (zip.length < 5) return;
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode( { "address": zip }, function(result, status) {
        var city = '';
        var state = '';
        if (status == google.maps.GeocoderStatus.OK && result.length > 0) {
          for (var component in result[0]['address_components']) {
            for (var i in result[0]['address_components'][component]['types']) {
              if (result[0]['address_components'][component]['types'][i] == "administrative_area_level_1") {
                city = result[0]['address_components'][1]['long_name'];
                state = result[0]['address_components'][component]['short_name'];
              }
              if (result[0]['address_components'][component]['types'][i] == "country") {
                country = result[0]['address_components'][component]['short_name'];
              }
            }
          }
        }

        if ('US' == country) {
          callback.apply(this, [city, state]);
        } else {
          callback.apply(this, [null, null]);
        }

      });
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

      var productAttributes = {};


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
          if (2 == data[i].productId || 80382 == data[i].productId){
            cart.transaction_fee = {
              fee: data[i].defaultAmt,
              rate: data[i].rateDefault,
            };
          }
        } else {

          if (data[i].showoncart) {

            if('Recurring' == data[i].occurrence.type) {
              cart.mFees[data[i].productId] = {
                name: data[i].productName,
                amount: data[i].defaultAmt,
              };
              cart.mfeeAmount +=  cart.mFees[data[i].productId].amount;
            } else if ('Onetime_Fee' == data[i].occurrence.type){
              cart.onetimeFees[data[i].productId] = {
                name: data[i].productName,
                amount: data[i].defaultAmt,
              };
              cart.onetimeAmount += cart.onetimeFees[data[i].productId].amount;
            } else if ('Onetime_Product' == data[i].occurrence.type) {
              if (addData) {
                cart.data[data[i].productId] = {
                  id: data[i].productId,
                  name: data[i].productName,
                  price: data[i].defaultAmt,
                  productType: data[i].productType,
                  term: data[i].purchaseType,
                  qty: data[i].quantity,
                };
              }
            } else if ('Acquiring' == data[i].occurrence.type) {
              paymentProducts.id = data[i].parentProduct.id;
              paymentProducts.name = data[i].parentProduct.name;
              paymentProducts.products[data[i].productId] = {
                id: data[i].productId,
                name: data[i].productName,
                price: data[i].defaultAmt,
                productType: data[i].productType,
                term: data[i].purchaseType,
                qty: data[i].quantity,
              };

            }
          }
        }
      }

      if (addData) {
        cart.payment_types = paymentProducts;
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
          callback.apply(this, [1]);
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
            cart = fdService.setPricingToCart(cart, data);

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
        fdService.storeGlobalPricing(gp);
      }
    };

    /**
     * Update pricing if transaction info exists
     */
    this.updatePricing = function(){
      var ti = this.getTransactionInfo();
      var gp = this.getGlobalPricingStorage();

      if (!ti) {
        return;
      }

      $timeout(function(){
        this.initPricingData(function(status){
          if (status) {
            console.log('updated');
          } else {
            console.log('error');
          }
        }, null, null, gp);
      }.bind(this));

    };
  }]);