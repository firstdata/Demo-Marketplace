/**
 * Checkout Controller
 */
app.controller('CheckoutCtrl', ['$scope', '$rootScope', '$routeParams', '$filter', '$location', '$window', '$timeout', 'fdService',
    function ($scope, $rootScope, $routeParams, $filter, $location, $window, $timeout, fdService) {

  /**
   * Init function
   * @private
   */
  var _init = function(){

    $rootScope.body_id = 'checkout';
    $rootScope.bodyClass = '';
    $scope.colorLogo = true;
    if(typeof ($rootScope.openPane) === 'function')
      $rootScope.openPane();

    $scope.shippingMethod = 'free';
    $scope.shippingMethods = fdService.getSessionShippingMethods();

    $scope.placeOrderInProgress = false;
    $scope.signupInProgress = false;

    $scope.form_error = false;

    $scope.monthlyFee = false;
    $scope.transactionFee = false;

    $scope.phoneNumberPattern = (/^\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}$/);
    $scope.addressPattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
    $scope.companyPattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
    $scope.emailPattern = (/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)?(\.(AERO|INT|GG|GH|GI|GL|GM|GN|GP|GQ|GR|GS|JOBS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|MIL|ID|IE|IL|IM|IN|IO|IQ|IR|IS|IT|MOBI|JE|JM|JO|JP|KE|KG|KH|KI|KM|KN|MUSEUM|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|NAME|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|NET|MG|MH|MK|ML|MM|MN|MO|MP|MQ|MR|ORG|MS|MT|MU|MV|MW|MX|MY|MZ|NA|NC|PRO|NE|NF|NG|NI|NL|NO|NP|NR|NU|NZ|TEL|OM|PA|PE|PF|PG|PH|PK|PL|PM|PN|ASIA|TRAVEL|PR|PS|PT|PW|PY|QA|RE|RO|RS|RU|AC|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|AD|SK|SL|SM|SN|SO|SR|ST|SU|SV|SY|AE|SZ|TC|TD|TF|TG|TH|TJ|TK|TL|TM|AF|TN|TO|TP|TR|TT|TV|TW|TZ|UA|UG|AG|UK|UM|US|UY|UZ|VA|VC|VE|VG|VI|AI|VN|VU|WF|WS|YE|YT|YU|ZA|ZM|AL|AM|AN|BIZ|AO|AQ|AR|AS|AT|AU|AW|AX|AZ|BA|CAT|BB|BD|BE|BF|BG|BH|BI|BJ|BM|BN|COM|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CC|COOP|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|EDU|CR|CU|CV|CX|CY|CZ|DE|DJ|DK|DM|GOV|DO|DZ|EC|EE|EG|ER|ES|ET|EU|FI|INFO|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|aero|int|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|jobs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|mil|id|ie|il|im|in|io|iq|ir|is|it|mobi|je|jm|jo|jp|ke|kg|kh|ki|km|kn|museum|kp|kr|kw|ky|kz|la|lb|lc|li|lk|name|lr|ls|lt|lu|lv|ly|ma|mc|md|me|net|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|org|ms|mt|mu|mv|mw|mx|my|mz|na|nc|pro|ne|nf|ng|ni|nl|no|np|nr|nu|nz|tel|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|asia|travel|pr|ps|pt|pw|py|qa|re|ro|rs|ru|ac|rw|sa|sb|sc|sd|se|sg|sh|si|sj|ad|sk|sl|sm|sn|so|sr|st|su|sv|sy|ae|sz|tc|td|tf|tg|th|tj|tk|tl|tm|af|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|ag|uk|um|us|uy|uz|va|vc|ve|vg|vi|ai|vn|vu|wf|ws|ye|yt|yu|za|zm|al|am|an|biz|ao|aq|ar|as|at|au|aw|ax|az|ba|cat|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|com|bo|br|bs|bt|bv|bw|by|bz|ca|cc|coop|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|edu|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|gov|do|dz|ec|ee|eg|er|es|et|eu|fi|info|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf))$/);

      $scope.warningFlag = false;

    $scope.orderId = fdService.getOrderId();

    $scope.states_list = $rootScope.CONST.STATES;

    var updateAddressListener = $rootScope.$on('Update_address_cart', function() {
      $scope.cartChanged();
    });

    $scope.$on('$destroy', updateAddressListener);


    /**
     * $locationChangeStart event listener function
     */
    $scope.$on('$locationChangeStart', function(evt, absNewUrl, absOldUrl) {
      absOldUrl = absOldUrl.split('#');
      absNewUrl = absNewUrl.split('#');
      if (!$scope.warningFlag && absNewUrl[1] == '/transaction/info' && absOldUrl[1] == '/checkout/shipping') {
        evt.preventDefault();
        $timeout(function() {
          angular.element('.backButtonClass').trigger('click');
        });
      }
    });

    if ($scope.orderId) {
      $scope.cart = $rootScope.cart = fdService.getOrderedCart($scope.orderId);
    } else {
      $scope.cart = $rootScope.cart = fdService.getCart();
    }
    $scope.page = $routeParams.page;

    if ('shipping' == $scope.page) {

        $scope.one_step = $routeParams.one_step;
        if ((!$scope.cart.shippingAddress[0].city || !$scope.cart.shippingAddress[0].state) && $scope.cart.shippingAddress[0].zip) {
          $scope.lookupZip(0);
        }
      $timeout(function() {

          if (-2 == $scope.cart.taxPercent) {
            $scope.shippingForm.zip_0.$setValidity("no_tax", false);
          } else {
            $scope.shippingForm.zip_0.$setValidity("no_tax", true);
          }

          if($scope.cart.shippingAddress[0].firstname && $scope.cart.shippingAddress[0].lastname) {
            if($scope.cart.shippingAddress[0].firstname.length + $scope.cart.shippingAddress[0].lastname.length > 24){
              $scope.shippingForm.firstname_0.$setValidity("max_length", false);
              $scope.shippingForm.lastname_0.$setValidity("max_length", false);
            }
          }

        angular.forEach($scope.shippingForm.$error, function (field) {
          angular.forEach(field, function(errorField){
            if (errorField.$viewValue) {
              errorField.$setTouched();
              errorField.$setDirty();
            }
          })
        });
      }, 0);

        $scope.shippingProdsCart = [];
        $scope.shippingProdsCart.data = [];
        for(var p in $scope.cart.data){
            for (var q=0 ;q < $scope.cart.data[p].qty; q++) {
                $scope.shippingProdsCart.data.push($scope.cart.data[p]);
            }
        };

        if ($scope.orderId) {

            $scope.shipping_prods = {};
            $scope.shipping_prods_value = {};

            for(var i=0; i < $scope.cart.shippingAddress.length; i++){
                $scope.shipping_prods_value[i] = {};
                $scope.shipping_prods[i] = {};
                for(var p = 0; p < $scope.cart.shippingAddress[i].productstoShip.length; p++){
                    if($scope.cart.shippingAddress[i].productstoShip[p].prodId && $scope.cart.shippingAddress[i].productstoShip[p].term){
                        for(var t = 0; t < $scope.shippingProdsCart.data.length; t++){
                            if($scope.shippingProdsCart.data[t].id == $scope.cart.shippingAddress[i].productstoShip[p].prodId && $scope.shippingProdsCart.data[t].term == $scope.cart.shippingAddress[i].productstoShip[p].term){
                                $scope.shipping_prods[i][t] = true;
                            }
                            else {
                                $scope.shipping_prods[i][t] = false;
                            }
                            $scope.shipping_prods_value[i][t] = true;
                        }
                    }
                }
            }

        } else {

            $scope.cart.shippingAddress[0].productstoShip = [];
            $scope.shipping_prods = {};
            $scope.shipping_prods_value = {};

            for(var i=0; i < $scope.cart.num_locations_selected; i++){
                $scope.shipping_prods_value[i] = {};
                $scope.shipping_prods[i] = {};
                for(var t = 0; t < $scope.shippingProdsCart.data.length; t++){
                    if(i == 0){
                        $scope.cart.shippingAddress[0].productstoShip.push({
                          prodId: $scope.shippingProdsCart.data[t].id,
                          term: $scope.shippingProdsCart.data[t].term,
                        });
                        $scope.shipping_prods[i][t] = true;
                    }
                    else {
                        $scope.shipping_prods[i][t] = false;
                    }
                    $scope.shipping_prods_value[i][t] = true;
                }
            }
        }
      }

      if ('shipping' == $scope.page) {
      $rootScope.body_id = 'shipping';
        if(typeof ($rootScope.openPane) === 'function'){
          $rootScope.openPane();
        }


    } else if ('thankyou' == $scope.page) {
      $rootScope.bodyClass = 'checkout';
        if(typeof ($rootScope.closePane) === 'function')
          $rootScope.closePane();
      } else if ('cart' == $scope.page) {
        $scope.getTaxes();
    }


    };

    /**
     * setFullName function
     */
    $scope.setFullName = function(index){
      if($scope.cart.shippingAddress[index].firstname && $scope.cart.shippingAddress[index].lastname) {
        $scope.cart.shippingAddress[index].name = $scope.cart.shippingAddress[index].firstname + ' ' + $scope.cart.shippingAddress[index].lastname;
        if($scope.cart.shippingAddress[index].name.length > 24){
          $scope.shippingForm['firstname_' + index].$setValidity("max_length", false);
          $scope.shippingForm['firstname_' + index].$setTouched(true);
          $scope.shippingForm['lastname_' + index].$setValidity("max_length", false);
          $scope.shippingForm['lastname_' + index].$setTouched(true);
        } else {
          $scope.shippingForm['firstname_' + index].$setValidity("max_length", true);
          $scope.shippingForm['lastname_' + index].$setValidity("max_length", true);
      }
      }
  };

  /**
   * Redirect to transaction info
   */
  $scope.gotoTransaction = function() {
    $scope.warningFlag = true;
    $location.path("/transaction/info");
    angular.element('.modal-backdrop').removeClass('modal-backdrop');
    angular.element('body').css('overflow','auto');

    }

    /**
     * gotoTransaction function
     */
    $scope.gotoMLocation = function() {

      $scope.warningFlag = true;
      $location.path("/multi-locations");
      angular.element('.modal-backdrop').removeClass('modal-backdrop');
      angular.element('body').css('overflow','auto');

    }

    /**
     * @method resendProposal
     * @param {orderId}
     * @return
     */
    $scope.resendProposal = function(orderId){
        $scope.clickedResend = true;
        fdService.resendProposal(orderId)
            .success(function(data, status, headers, config) {
                $scope.clickedResend = false;
            })
            .error(function(data, status, headers, config) {
                $rootScope.closePane();
                $scope.clickedResend = false;
                $location.path('400');
            });
  };

  /**
   * Call this method when cart was changed
   */
  $scope.cartChanged = function(){
      $scope.orderId = fdService.getOrderId();
      $rootScope.cart.shippingAddress = $scope.cart.shippingAddress;
    if ($scope.orderId) {
      $rootScope.cart = $scope.cart = fdService.orderedCartChanged($scope.orderId, $rootScope.cart);
    } else {
      $rootScope.cart = $scope.cart = fdService.cartChanged($rootScope.cart);
    }
  };

  /**
   * Call this method when shipping method was changed
   */
  $scope.shippingMethosChanged = function(){
    $rootScope.cart = $scope.cart;
    $scope.cartChanged();
  };

  /**
   * Redirect to the signup page
   */
  $scope.gotoSignup = function(){
    if ($scope.signupInProgress) {
      return;
    }
      $window.location.href = '/v1/signup/owner/' + $scope.order_hash;
    $scope.signupInProgress = true;
  };

    /**
     * submitShipping function
     * @param {Boolean} disabled
     * @return
     */
    $scope.submitShipping = function(disabled){
      if (disabled) {
        return;
      }

      if (!$scope.shippingForm.$valid) {
        $scope.form_error = true;
        angular.forEach($scope.shippingForm.$error, function (field) {
          angular.forEach(field, function(errorField){
            errorField.$setTouched();
          })
        });
        return;
      }

      $rootScope.cart = $scope.cart;
      $scope.cartChanged();
      $location.path('/checkout/summary');
    };

        /**
         * _placeOrder function
         * @param {Boolean} disabled
         */
        $rootScope._placeOrder = function(disabled){
          return $scope.placeOrder(disabled);
        };

        /**
         * placeOrder function
         * @param {Boolean} disabled
         */
        $scope.placeOrder = function(disabled){
          if (disabled) {
            return;
          }

          if ($scope.placeOrderInProgress) {
            return;
          }
          $scope.placeOrderInProgress = true;

          $scope.cartChanged();

          if (!$scope.orderId) {
            return;
          }

          fdService.getCartDetails($scope.orderId)
              .success(function(data, status, headers, config) {
                fdService.submitOrder()
                    .success(function(data, status, headers, config) {
                      fdService.storeOrderedCart($scope.orderId, $rootScope.cart);
                      fdService.clearCart();
                      $rootScope.cart = $scope.cart = fdService.getCart();
                      $scope.placeOrderInProgress = false;
                      if ($rootScope.resetPane) {
                        $rootScope.resetPane();
                      }
                      $location.path('/checkout/thankyou/');
                    })
                    .error(function(data, status, headers, config) {
                      $scope.placeOrderInProgress = false;
                    });
              })
              .error(function(data, status, headers, config) {
                $scope.placeOrderInProgress = false;
                $location.path('400');
              });


          return;

          fdService.submitOrder()
              .success(function(data, status, headers, config) {
                fdService.storeOrderedCart($scope.orderId, $rootScope.cart);
                fdService.clearCart();
                $rootScope.cart = $scope.cart = fdService.getCart();
                $scope.placeOrderInProgress = false;
                if ($rootScope.resetPane) {
                  $rootScope.resetPane();
                }
                $location.path('/checkout/thankyou/');
              })
              .error(function(data, status, headers, config) {
                $scope.placeOrderInProgress = false;
              });
        };

        /**
         * check if place order in progress
         * @return {boolean}
         * @private
         */
        $rootScope._isPlaceOrderInProgress = function () {
          return $scope.placeOrderInProgress;
        };

        /**
         * getTaxes function
         */
        $scope.getTaxes = function(){
          if (!$scope.cart.shippingAddress[0].zip || !$scope.cart.shippingAddress[0].city) {
            return;
          }
          fdService.getTaxes($scope.cart.shippingAddress[0].zip, $scope.cart.shippingAddress[0].city)
              .success(function(data, status, headers, config) {
                $scope.cart.taxPercent = data.salesTax;
                $rootScope.cart = $scope.cart;
                $scope.cartChanged();
                if('shipping' == $scope.page){
                    $scope.shippingForm.zip_0.$setValidity("no_tax", true);
                    $scope.shippingForm.zip_0.$setTouched();
                    $scope.shippingForm.zip_0.$setDirty();
                }
              })
              .error(function(data, status, headers, config) {
                if('shipping' == $scope.page){
                    $scope.shippingForm.zip_0.$setValidity("no_tax", false);
                    $scope.shippingForm.zip_0.$setTouched();
                    $scope.shippingForm.zip_0.$setDirty();
                }
                $scope.cart.taxPercent = -2;
                $rootScope.cart = $scope.cart;
                $scope.cartChanged();
              });
        };

  /**
   * Redirect to the summary page
   */
  $scope.gotoSummary = function () {
    $rootScope.cart = $scope.cart;
    $scope.cartChanged();
    $location.path('/checkout/summary');
  }

  /**
   * Lookup city and state by zip code using google API
   */
  $scope.lookupZip = function(index){
    if (!$scope.cart.shippingAddress[index].zip) {
      return;
      } else if ($scope.shippingForm && $scope.cart.shippingAddress[index].zip == '00000') {
        $scope.shippingForm['zip_' + index].$setValidity("zipnotValid", false);
      } else if ($scope.shippingForm) {
        $scope.shippingForm['zip_' + index].$setValidity("zipnotValid", true);
    }


      fdService.lookupByZip($scope.cart.shippingAddress[index].zip, function(city, state) {
      if (!city || !state) {
        return;
      }
      $scope.cart.shippingAddress[index].city = city.substring(0, 24);
      $scope.cart.shippingAddress[index].state = state;
      $timeout(function() {
        angular.element('[name^=state]').trigger('change');
        angular.element('[name^=city]').trigger('keyup');

        angular.forEach($scope.shippingForm.$error, function (field) {
          angular.forEach(field, function(errorField){
            if (errorField.$viewValue) {
              errorField.$setTouched();
            }
          })
        });

      }, 0);
      $scope.getTaxes();
    });
  };

  /**
   * Description
   * @method validateBusiness
   * @return
   */
  $scope.validateBusiness = function(index) {
      fdService.validateBusiness($scope.shippingForm['email_' + index], $scope.cart.shippingAddress[index].email);
  }


  /**
   * add shipping address
   */
  $scope.addAddress = function () {
    if ($scope.cart.shippingAddress.length >= $scope.cart.num_locations_selected) {
      return;
    }
    $scope.cart.shippingAddress.push({
      productstoShip: []
    });
  };

  /**
   * remove shipping address
   */
  $scope.removeAddress = function (index) {
    if (!index) {
      return;
    }
    $scope.cart.shippingAddress.splice(index, 1);
  };

  /**
   * on product in shipping page was checked / unchecked
   * @param {Object} p product
   * @param {Object} ad address
   * @param {numeric} index product index
   * @param {numeric} prod_index product index
   * @param {numeric} address_index address index
   */
  $scope.productAddressChecked = function(p, ad, index, prod_index, address_index) {

    var check = $scope.shipping_prods[index][prod_index][address_index];

    if (check) {
      ad.productstoShip.push({
        prodId: p.id,
        term: p.term,
      });

      p.address_num = p.address_num ? (p.address_num + 1) : 1;
    } else {
      for (var i = 0; i < ad.productstoShip.length; i++) {
        if (ad.productstoShip[i].prodId === p.id && ad.productstoShip[i].term === p.term) {
          ad.productstoShip.splice(i, 1);
          p.address_num--;
          break;
        }
      }
    }
  };

  /**
  * on product in shipping page was checked / unchecked
  * @param {Object} p product
  * @param {Object} ad address
  * @param {numeric} address_index address index
  * @param {numeric} prod_index product index
  */
  $scope.productAddressSelected = function(p, ad, address_index, prod_index) {
      var breakLoop = false;
      for(var l=0; l < $scope.cart.shippingAddress.length && !breakLoop; l++){
          for(var i=0; i < $scope.cart.shippingAddress[l].productstoShip.length && !breakLoop; i++){
              if($scope.cart.shippingAddress[l].productstoShip[i].prodId === p.id && $scope.cart.shippingAddress[l].productstoShip[i].term === p.term){
                  $scope.cart.shippingAddress[l].productstoShip.splice(i, 1);
                  breakLoop = true;
              }
          }
      }

      $scope.cart.shippingAddress[address_index].productstoShip.push({
           prodId: p.id,
           term: p.term,
      });

  };


  /**
   * check if check box should be disabled
   *
   * @param p
   * @param ad
   * @param index
   * @param prod_index
   * @param address_index
   * @return {boolean}
   */
  $scope.productAddressDisabled = function(p, ad, index, prod_index, address_index) {
    var check = $scope.shipping_prods[index] && $scope.shipping_prods[index][prod_index] && $scope.shipping_prods[index][prod_index][address_index];

    if ($scope.cart.shippingAddress.length === 1) {
      if (check) {
        return true;
      }
      return false;
    }

    if (check) {
      return false;
    }

    if (p.address_num >= p.qty) {
      return true;
    }

    return false;
  };


  /**
   * getShippingForm function
   * @return shippingForm
   */
  $rootScope.getShippingForm = function(){
    return $scope.shippingForm;
  };


  ///////////////// MAIN ////////////////////////////////
  _init();
}]);