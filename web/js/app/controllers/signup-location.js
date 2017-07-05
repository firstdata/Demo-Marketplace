/**
 * Signup Location Controller
 */
app.controller('SignupLocationCtrl', ['$scope', '$rootScope', '$filter', '$location', 'fdService', '$timeout', '$anchorScroll', 'CONST', '$routeParams',
  function($scope, $rootScope, $filter, $location, fdService, $timeout, $anchorScroll, CONST, $routeParams) {

    /**
     * Init function
     * @method _init
     */
    var _init = function() {
      $rootScope.body_id = 'full_body';

      $scope.current_number = $routeParams.num;

      /* percentValues hold indices array for ng-options*/
      $scope.percentValues = (function() {
        var tempArr = [];
        for (var i = 0; i <= 20; i++)
          tempArr.push(i * 5);
        return tempArr;
      })();

      var orderId = fdService.getOrderId();
      var cart = fdService.getOrderedCart(orderId);

      if (!cart) {
        $location.path('/');
      }

      //set category details
      $scope.categoryDetails = {name: cart.data[Object.keys(cart.data)[0]].category};

      $scope.num_locations_selected = cart.num_locations_selected || 1;

      if (!$scope.current_number || $scope.num_locations_selected < $scope.current_number) {
        $scope.current_number = 1;
      }


      $scope.clickedSubmit = false;
      $scope.bankErrorCount = 0;
      $scope.bankError = false;
      $scope.bankErrorServerFails = false;
      $scope.bankCheck = false;
      $scope.bankErrorCount_second = 0;
      $scope.bankError_second = false;
      $scope.bankErrorServerFails_second = false;
      $scope.bankCheck_second = false;

      var ti = fdService.getTransactionInfo();


      $scope.form_error = false;
      $scope.states_list = $rootScope.CONST.STATES;
      $scope.globalFormData = {};

      for (var i = 1; i <= $scope.num_locations_selected; i++) {
        $scope.globalFormData[i] = {};
        $scope.globalFormData[i].bankInformation = {};

        if (!angular.isUndefined(cart.shippingAddress[0])) {
          $scope.globalFormData[i].DBA_NAME = cart.shippingAddress[0].company;

          $scope.globalFormData[i].statementDeliveryEmail = cart.shippingAddress[0].email;
          $scope.globalFormData[i].statementDeliveryType = "Email";
          angular.forEach(CONST.FSPFUNDTYPES, function(value, key) {
            $scope.globalFormData[i].bankInformation[value] = '0';
          });
          $scope.globalFormData[i].name = cart.shippingAddress[0].firstname + " " + cart.shippingAddress[0].lastname;

        }

        if (ti.annualVolume) {
          $scope.globalFormData[i].annualVolume = ti.annualVolume;
        }

        if (ti.annualcardVolume) {
          $scope.globalFormData[i].annualcardVolume = ti.annualcardVolume;
        }

        if (ti.averageTicket) {
          $scope.globalFormData[i].TYPICAL_SALE_AMOUNT = ti.averageTicket;
        }

        if (ti.highestTicket) {
          $scope.globalFormData[i].ANTICIPATED_HIGHEST_TICKET_SALE = ti.highestTicket;
        }
        // $scope.globalFormData[i].mcccodes = ti.mccTypes;

        if (undefined !== cart.shippingAddress[i - 1]) {
          $scope.globalFormData[i].business_address1 = cart.shippingAddress[i - 1].address1;
          $scope.globalFormData[i].business_address2 = cart.shippingAddress[i - 1].address2;
          $scope.globalFormData[i].business_address_zip = cart.shippingAddress[i - 1].zip;
          $scope.globalFormData[i].business_address_city = cart.shippingAddress[i - 1].city;
          $scope.globalFormData[i].business_address_state = cart.shippingAddress[i - 1].state;
          $scope.globalFormData[i].DBA_NAME = cart.shippingAddress[i - 1].company_name;
        }

        $scope.globalFormData[i].products = [];
        $scope.globalFormData[i].rollupIndicator = '2';

      }

      $scope.getWebsiteFlag();
      $scope.formData = $scope.globalFormData[$scope.current_number];

      $timeout(function() {
        angular.element('[name=mcccodes]').trigger('change');
      }, 50);


      // Get MCC Codes
      $scope.mcc_codes = [];
      fdService.getMccCodes($scope.categoryDetails.name).success(function(data, status, headers, config) {
        $scope.mcc_codes = data;
      });

      $scope.products = [];
      $scope.globalFormData[1].noOfRegisters = 1;

      // Get products list
      fdService.getCartOrderProducts(orderId).success(function(data, status, headers, config) {

        $scope.products = data;
        var k;

        for (var i = 0; i < $scope.products.length; i++) {

          if (i >= $scope.num_locations_selected) {
            k = 1;
          } else {
            k = i + 1;
          }

          $scope.products[i].location_num = k;
          $scope.globalFormData[k].products.push($scope.products[i]);
        }


        fdService.getOrderLocations(orderId).success(function(data, status, headers, config) {
          $scope.orderLocationsInfo = data.locationInformation;
          for (var i = 0; i < $scope.orderLocationsInfo.length; i++) {
            var form = $scope.globalFormData[i + 1];
            var formData = $scope.orderLocationsInfo[i];
            form.mcccodes = formData.mccDescription;
            form.mcc = formData.mcc;
            if (formData.dbaName) {
              form.DBA_NAME = formData.dbaName;
            }
            form.annualcardVolume = formData.annualVolume;
            form.merchantId = formData.merchantId;
            form.FACE_TO_FACE = formData.faceToFace;
            form.PHONE_OR_EMAIL = formData.phoneOrEmail;
            form.INTERNET_PAY = formData.internet;

            if (formData.averageTicket) {
              form.TYPICAL_SALE_AMOUNT = formData.averageTicket;
            }

            if (formData.highestTicket) {
              form.ANTICIPATED_HIGHEST_TICKET_SALE = formData.highestTicket;
            }

            if (formData.rollupIndicator != undefined) {
              form.rollupIndicator = formData.rollupIndicator;
            }

            if (formData.siteSurvey) {

              var siteSurvey = formData.siteSurvey;
              form.siteVisitation = siteSurvey.siteVisitation;
              form.DELIVERY0_7 = siteSurvey.deliveryTimeFrame_0_To_7;
              form.DELIVERY8_14 = siteSurvey.deliveryTimeFrame_8_To_14;
              form.DELIVERY15_30 = siteSurvey.deliveryTimeFrame_15_To_30;
              form.DELIVERY31 = siteSurvey.deliveryTimeFrame_Over_30;

              if ('Visitation Completed' === siteSurvey.siteVisitation) {
                $scope.surveyUser = siteSurvey.surveyPerformed;
                form.businessZone = siteSurvey.businessZone;
                form.businessLocationType = siteSurvey.merchantBusinessLocation;
                form.seasonalMerchant = siteSurvey.seasonalMerchant;
                form.buildingFloors = siteSurvey.totalFloors.toString();
                form.floorsOccupied = siteSurvey.floorOccupied.toString();

                var merchantsNameDisplayed = {};
                if (siteSurvey.merchantsNameDisplayed) {
                  var arr = siteSurvey.merchantsNameDisplayed.split(',');
                  for (var k = 0; k < arr.length; k++) {
                    merchantsNameDisplayed[arr[k]] = true;
                  }
                }
                form.merchantsNameDisplayed = merchantsNameDisplayed;
                form.squareFootage = siteSurvey.apartmentSquareFoot;
                form.ownOrRent = siteSurvey.merchantsOwnBuildSpace;
                form.noOfRegisters = siteSurvey.totalRegister;
                form.businessLicenseDisplay = siteSurvey.licenceDisplayed;
                form.returnPolicy = siteSurvey.returnPolicy;
                form.returnPolicyCard = siteSurvey.separateRefundPolicy;
                form.customerDeposit = siteSurvey.customerDeposit;
                form.cardDeposit = siteSurvey.salesDeposit;
                form.orderRenewal = siteSurvey.autoRenew;

                if (form.ownOrRent === 'Rent') {
                  form.buildingSpace = new Date(siteSurvey.rentStartTime);
                  form.leaseExpiry = new Date(siteSurvey.leaseExpires);
                  form.landLordName = siteSurvey.landLordName;
                  form.landLordNumber = siteSurvey.landLordPhoneNumber;
                }
              } else {
                form.returnPolicy = siteSurvey.returnPolicy;
                form.returnPolicyCard = siteSurvey.separateRefundPolicy;
              }
            } else {
              form.ownOrRent === 'Own';
            }

            if (formData.address1) {
              form.business_address1 = formData.address1;
            }
            if (formData.address2) {
              form.business_address2 = formData.address2;
            }
            if (formData.zip) {
              form.business_address_zip = formData.zip;
            }
            if (formData.city) {
              form.business_address_city = formData.city;
            }
            if (formData.state) {
              form.business_address_state = formData.state;
            }

            if (formData.equipmentLocation) {
              form.products = [];
              for (var p = 0; p < formData.equipmentLocation.length; p++) {
                var equipmentId = formData.equipmentLocation[p].lineItemId;
                var idx = $scope.products.map(function(p) { return p.id; }).indexOf(equipmentId);
                if (idx !== -1) {
                  $scope.products[idx].location_num = i + 1;
                  form.products.push($scope.products[idx]);
                  if (formData.equipmentLocation[p].attributes) {
                    var configProduct = $scope.products[idx];
                    var attributes = formData.equipmentLocation[p].attributes;
                    configProduct.attributesReady = {};
                    for (var d = 0; d < attributes.length; d++) {
                      configProduct.attributesReady[attributes[d].attributeName] = {
                        attributeName: attributes[d].attributeName,
                        attributeValue: attributes[d].attributeValue,
                        attributeDomain: attributes[d].attributeDomain,
                      };
                    }
                  }
                }
              }
            }

            $timeout(function() {
              angular.element('[name=SITE_VISITATION]').trigger('change');
              angular.element('[name="FACE_TO_FACE"]').trigger('change');
              angular.element('[name="PHONE_OR_EMAIL"]').trigger('change');
              angular.element('[name="INTERNET_PAY"]').trigger('change');
              angular.element('[name=DELIVERY0_7]').trigger('change');
              angular.element('[name="DELIVERY8_14"]').trigger('change');
              angular.element('[name="DELIVERY15_30"]').trigger('change');
              angular.element('[name="DELIVERY31"]').trigger('change');
              angular.element('[name="rollupIndicator"]').trigger('change');
            }, 0);
          }
          for (var x = 0; x < $scope.num_locations_selected; x++) {
            var formDataMCC = $scope.globalFormData[x + 1];
            formDataMCC.mcccodes = formDataMCC.mcccodes ? formDataMCC.mcccodes : $scope.globalFormData[1].mcccodes;
            formDataMCC.mcc = formDataMCC.mcc ? formDataMCC.mcc : $scope.globalFormData[1].mcc;
            $scope.getMccTypes($scope.globalFormData[x + 1], function() {
              $timeout(function() {
                angular.element('[name=mcccodes]').trigger('change');
                angular.element('[name=mcctypes]').trigger('change');
              }, 0);
            });
          }

        });

      });

      $scope.fullNamePattern = (/^([a-zA-Z]{2,24})\s([a-zA-Z]{2,24})$/);
      $scope.emailPattern = (/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)?(\.(AERO|INT|GG|GH|GI|GL|GM|GN|GP|GQ|GR|GS|JOBS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|MIL|ID|IE|IL|IM|IN|IO|IQ|IR|IS|IT|MOBI|JE|JM|JO|JP|KE|KG|KH|KI|KM|KN|MUSEUM|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|NAME|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|NET|MG|MH|MK|ML|MM|MN|MO|MP|MQ|MR|ORG|MS|MT|MU|MV|MW|MX|MY|MZ|NA|NC|PRO|NE|NF|NG|NI|NL|NO|NP|NR|NU|NZ|TEL|OM|PA|PE|PF|PG|PH|PK|PL|PM|PN|ASIA|TRAVEL|PR|PS|PT|PW|PY|QA|RE|RO|RS|RU|AC|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|AD|SK|SL|SM|SN|SO|SR|ST|SU|SV|SY|AE|SZ|TC|TD|TF|TG|TH|TJ|TK|TL|TM|AF|TN|TO|TP|TR|TT|TV|TW|TZ|UA|UG|AG|UK|UM|US|UY|UZ|VA|VC|VE|VG|VI|AI|VN|VU|WF|WS|YE|YT|YU|ZA|ZM|AL|AM|AN|BIZ|AO|AQ|AR|AS|AT|AU|AW|AX|AZ|BA|CAT|BB|BD|BE|BF|BG|BH|BI|BJ|BM|BN|COM|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CC|COOP|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|EDU|CR|CU|CV|CX|CY|CZ|DE|DJ|DK|DM|GOV|DO|DZ|EC|EE|EG|ER|ES|ET|EU|FI|INFO|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|aero|int|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|jobs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|mil|id|ie|il|im|in|io|iq|ir|is|it|mobi|je|jm|jo|jp|ke|kg|kh|ki|km|kn|museum|kp|kr|kw|ky|kz|la|lb|lc|li|lk|name|lr|ls|lt|lu|lv|ly|ma|mc|md|me|net|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|org|ms|mt|mu|mv|mw|mx|my|mz|na|nc|pro|ne|nf|ng|ni|nl|no|np|nr|nu|nz|tel|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|asia|travel|pr|ps|pt|pw|py|qa|re|ro|rs|ru|ac|rw|sa|sb|sc|sd|se|sg|sh|si|sj|ad|sk|sl|sm|sn|so|sr|st|su|sv|sy|ae|sz|tc|td|tf|tg|th|tj|tk|tl|tm|af|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|ag|uk|um|us|uy|uz|va|vc|ve|vg|vi|ai|vn|vu|wf|ws|ye|yt|yu|za|zm|al|am|an|biz|ao|aq|ar|as|at|au|aw|ax|az|ba|cat|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|com|bo|br|bs|bt|bv|bw|by|bz|ca|cc|coop|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|edu|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|gov|do|dz|ec|ee|eg|er|es|et|eu|fi|info|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf))$/);
      $scope.phoneNumberPattern = (/^\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}$/);
      $scope.ssnPattern = (/^[0-9]{3}-[0-9]{2}-[0-9]{4}$/);
      $scope.streetAddressPattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
      $scope.apartmentPattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
      $scope.cityPattern = (/^[a-zA-Z\s]*$/);
      $scope.zipPattern = (/^[0-9]{5}$/);
      $scope.dbaNamePattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
      //$scope.dbaNamePattern = (/^[a-zA-Z0-9',\s]*$/);
      $scope.einPattern = (/^[0-9]{9}$/);
      $scope.routingNumberPattern = (/^[0-9]{9}$/);
      $scope.numberPattern = (/[0-9-()]*[1-9][0-9-()]*/);
      $scope.urlPattern = (/^((((http(s)?):\/\/)|([www\.]|[WWW\.]))?(?!\.)([a-zA-Z0-9\-]*)\.?([a-zA-Z0-9\-]*)\.(com|org|net|mil|edu|biz|info|us|cc|co|gov|COM|ORG|NET|MIL|EDU|BIZ|INFO|US|CC|CO|GOV)(\.[a-z]{1,3})?)((\/?[^?]*?)\?.*)?$/);
      $scope.amountPattern = (/^[0-9.,]+$/);
      $scope.today = new Date();
      $scope.thisYear = $scope.today.getFullYear();
      $scope.thisMonth = $scope.today.getMonth() + 1;
      $scope.titles = [];


      $timeout(function() {
        angular.forEach($scope.signupForm.$error, function(field, key) {
          angular.forEach(field, function(errorField) {
            if (errorField.$viewValue) {
              errorField.$setTouched();
            }
          })
        });
      }, 0);

      $scope.categoryName = $scope.categoryDetails.name;
      $scope.updateMap();

    };

    /**
     * remove product from this location
     * @method removeProduct
     * @param p
     * @param index
     */
    $scope.removeProduct = function(p, index) {
      p.location_num = null;
      $scope.formData.products.splice(index, 1);
    };

    /**
     * initialize equipment popup
     * @method initEquipment
     */
    $scope.initEquipment = function() {

      $scope.prodLoc = [];

      for (var i = 0; i < $scope.products.length; i++) {
        $scope.prodLoc[i] = $scope.products[i].location_num;
      }
    };

    /**
     * Get Website Flag
     * @method getWebsiteFlag
     */
    $scope.getWebsiteFlag = function() {
      var orderId = fdService.getOrderId();
      fdService.getOrderBusinessinformation(orderId).success(function(data, status, headers, config) {
          if (data.merchantInformation.length > 0 && data.merchantInformation[0].url) {
            $scope.isWebSiteAvailable = true;
          } else {
            $scope.isWebSiteAvailable = false;
          }
        })
        .error(function(data, status, headers, config) {
          $scope.isWebSiteAvailable = false;
        });
    };

    /**
     * save equipment info
     * @method saveEquipment
     */
    $scope.saveEquipment = function() {
      var i, k, p, n;
      for (i = 0; i < $scope.products.length; i++) {
        if ($scope.products[i].location_num != $scope.prodLoc[i]) {

          p = $scope.products[i].location_num ? $scope.products[i].location_num : $scope.prodLoc[i];
          n = $scope.prodLoc[i];

          k = $scope.globalFormData[p].products.indexOf($scope.products[i]);

          if (-1 !== k) {
            $scope.globalFormData[n].products.push($scope.products[i]);
            $scope.globalFormData[p].products.splice(k, 1);
          } else {
            $scope.globalFormData[n].products.push($scope.products[i]);
          }
          $scope.products[i].location_num = $scope.prodLoc[i];
        }

      }

    };

    /**
     * Check Checkbox
     * @method checkCheckbox
     */
    $scope.checkCheckbox = function() {
      $scope.merchantDisplayedArray = [];
      angular.forEach($scope.formData.merchantsNameDisplayed, function(value, key) {
        if (value == true) {
          $scope.merchantDisplayedArray.push(key);
        }
      });
      if ($scope.merchantDisplayedArray.length > 0) {
        $scope.merchantDisplayed = $scope.merchantDisplayedArray.toString();
      } else {
        $scope.merchantDisplayed = '';
      }
    };

    /**
     * Calculate Remaining Values
     * @method calcRemainingValues
     * @param {} input1
     * @param {} input2
     * @param {} input3
     */
    var calcRemainingValues = function(input1, input2, input3) {
      $scope.signupForm.PHONE_OR_EMAIL.$setValidity("total", isTotalValid());
      if ($scope.formData[input1]) {
        if (!$scope.isWebSiteAvailable) {
          $scope.formData.INTERNET_PAY = '0';
        }
        if (!$scope.formData[input2] && !$scope.formData[input3]) {
          if ($scope.formData[input1] == '100') {
            $scope.formData[input2] = '0';
            $scope.formData[input3] = '0';
            $timeout(function() {
              angular.element('[name=' + input2 + ']').trigger('change');
              angular.element('[name=' + input3 + ']').trigger('change');
            }, 1);
            return; //return if remaining 2 fields still empty
          }

        }
        if ($scope.formData[input2] && $scope.formData[input3]) { //Set form validity
          $scope.signupForm.PHONE_OR_EMAIL.$setValidity("total", isTotalValid());
          return;
        }
        if ($scope.formData[input2]) {
          $scope.formData[input3] = $scope.isWebSiteAvailable ? (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]))).toString() : '0';
          $scope.signupForm.PHONE_OR_EMAIL.$setValidity("total", isTotalValid());}
        if ($scope.formData[input3]) {
          $scope.formData[input2] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]))).toString();
          $scope.signupForm.PHONE_OR_EMAIL.$setValidity("total", isTotalValid());}
      } else {
        $scope.formData[input2] = undefined;
        $scope.formData[input3] = undefined;

      }
      $timeout(function() {
        angular.element('[name=' + input2 + ']').trigger('change');
        angular.element('[name=' + input3 + ']').trigger('change');
      }, 1);
    };

    /**
     * Description
     * @method isTotalValid
     * @return BinaryExpression
     */
    var isTotalValid = function() {
      var a = $scope.formData.FACE_TO_FACE ? parseInt($scope.formData.FACE_TO_FACE) : 0;
      var b = $scope.formData.PHONE_OR_EMAIL ? parseInt($scope.formData.PHONE_OR_EMAIL) : 0;
      var c = $scope.formData.INTERNET_PAY ? parseInt($scope.formData.INTERNET_PAY) : 0;
      return a + b + c === 100;
    };


    /**
     * Lookup Business Zip
     * @method lookupBusinessZip
     */
    $scope.lookupBusinessZip = function() {
      if (!$scope.formData.business_address_zip) {
        return;
      } else if ($scope.signupForm && $scope.formData.business_address_zip == '00000') {
        $scope.signupForm.business_address_zip.$setValidity("zipnotValid", false);
      } else if ($scope.signupForm) {
        $scope.signupForm.business_address_zip.$setValidity("zipnotValid", true);
      }

      fdService.lookupByZip($scope.formData.business_address_zip, function(city, state) {
        if (!city) {
          $scope.formData.business_address_city = "";
          $scope.formData.business_address_state = "";
          $timeout(function() {
            angular.element('[name=business_address_state]').trigger('change');
            angular.element('[name=business_address_city]').trigger('keyup');
          }, 0);
        }
        if (!state) {
          $scope.formData.business_address_city = "";
          $scope.formData.business_address_state = "";
          $timeout(function() {
            angular.element('[name=business_address_state]').trigger('change');
            angular.element('[name=business_address_city]').trigger('keyup');
          }, 0);
        } else {
          $scope.formData.business_address_city = city;
          $scope.formData.business_address_state = state;
          $timeout(function() {
            angular.element('[name=business_address_city]').trigger('keyup');
          }, 10);
          $timeout(function() {
            angular.element('[name=business_address_state]').trigger('change');
            // $scope.validateBusiness();
          }, 20);
        }

        $scope.updateMap();
      });
    };


    /**
     * update Google Map
     * @method updateMap
     */
    $scope.updateMap = function() {

      if ($scope.mapTO) {
        $timeout.cancel($scope.mapTO);
      }

      $scope.mapTO = $timeout(function() {

        if (!$scope.geocoder) {
          $scope.geocoder = new google.maps.Geocoder();
        }

        if (!$scope.map) {
          var mapOptions = {
            zoom: 14,
          };
          $scope.map = new google.maps.Map(document.getElementById('google-map-owner'), mapOptions);
        }

        var address = $scope.formData.business_address1 ? $scope.formData.business_address1 : '';
        address += ' ' + $scope.formData.business_address_city + ', ' + $scope.formData.business_address_state + ', ' + $scope.formData.business_address_zip;
        $scope.geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            $scope.map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
              map: $scope.map,
              position: results[0].geometry.location
            });
          }
        });
      }, 1000);
    };

    /**
     * Get Titles for Organozation Owners
     * @method getTitles
     * @return
     */
    $scope.getTitles = function() {
      if ($scope.signupForm.ORGANIZATION_TYPE.$valid) {
        $scope.titles = [];
        $scope.formData.title1 = '';
        var dataToSend = {"businessType": $scope.formData.ORGANIZATION_TYPE};
        fdService.getTitles(dataToSend)
          .success(function(response, status, headers, config) {
            if (!angular.isUndefined(response.titles)) {
              for (var i = 0; i < response.titles.length; i++) {
                $scope.titles.push(response.titles[i]);
              }
            }
          })
          .error(function(data, status, headers, config) {
            console.log('error');
          });
      }
    };

    /**
     * Check Date
     * @method checkDate
     * @param {Object} owner
     * @param {numeric} index
     */
    $scope.checkDate = function(owner, index) {
      if (!owner.dob_day || !owner.dob_month || !owner.dob_year) {
        return;
      }


      var dateValid = true;
      if ((owner.dob_month == 04 || owner.dob_month == 06 || owner.dob_month == 9 || owner.dob_month == 11) && (owner.dob_day >= 31))
        dateValid = false;
      if (owner.dob_month == 02) {
        if (owner.dob_year % 4 != 0) {
          if (owner.dob_day > 28)
            dateValid = false;
        }
        if (owner.dob_year % 4 == 0) {
          if (owner.dob_day > 29)
            dateValid = false;
        }
      }

      var calculateAge = new Date(owner.dob_year, owner.dob_month - 1, owner.dob_day);
      var ageDifMs = Date.now() - calculateAge.getTime();
      var ageDate = new Date(ageDifMs);
      var age = Math.abs(ageDate.getUTCFullYear() - 1970);
      isAgeInsufficient = false;
      if (age < 18) {
        isAgeInsufficient = true;
      } else {
        isAgeInsufficient = false;
      }

      if (dateValid && !isAgeInsufficient) {
        $scope.signupForm['dob_month_' + index].$setValidity('date_format', true);
      } else {
        $scope.signupForm['dob_month_' + index].$setValidity('date_format', false);
      }

      owner.dob = owner.dob_year + '-' + owner.dob_month + '-' + owner.dob_day;

    };

    /**
     * percent owned field's on blur event
     * @method percentBlurred
     * @param owner
     * @param index
     */
    $scope.percentBlurred = function(owner, index) {

      var totalPercent = 0;

      for (var i = 0; i < $scope.formData.owners.length; i++) {
        totalPercent += parseInt($scope.formData.owners[i].percent_owned);
      }

      // Set valid
      $scope.signupForm['percentOwned_0'].$setValidity('percent_more_100', true);
      if ($scope.signupForm['percentOwned_1']) {
        $scope.signupForm['percentOwned_1'].$setValidity('percent_more_100', true);
      }
      if ($scope.signupForm['percentOwned_2']) {
        $scope.signupForm['percentOwned_2'].$setValidity('percent_more_100', true);
      }

      if (totalPercent > 100) {
        $scope.signupForm['percentOwned_0'].$setValidity('percent_more_100', false);
        if ($scope.signupForm['percentOwned_1']) {
          $scope.signupForm['percentOwned_1'].$setValidity('percent_more_100', false);
        }
        if ($scope.signupForm['percentOwned_2']) {
          $scope.signupForm['percentOwned_2'].$setValidity('percent_more_100', false);
        }
      } else if (totalPercent < 100) {
        if ($scope.formData.owners.length >= 3) {
          return;
        }

        if ($scope.formData.owners.length == index + 1) {
          $scope.formData.owners.push({});
        }

      }
    };

    /**
     * Goto Anchor
     * @method gotoAnchor
     * @param {string} anchor
     * @return
     */
    $scope.gotoAnchor = function(anc) {
      $timeout(function() {
        $anchorScroll.yOffset = 50;
        $anchorScroll(anc);
        $anchorScroll.yOffset = 0;
      });
    };

    /**
     * change active location's number
     * @method changeNumber
     * @param {number} n
     */
    $scope.changeNumber = function(n) {
      if (!$scope.signupForm.$valid) {
        $scope.form_error = true;
        $scope.gotoAnchor('form-error');
        angular.forEach($scope.signupForm.$error, function(field) {
          angular.forEach(field, function(errorField) {
            errorField.$setTouched();
          })
        });
        return;
      } else {
        $scope.form_error = false;
      }

      if (!$scope.formData.products.length) {
        return;
      }



      $scope.current_number = n;
      $scope.formData = $scope.globalFormData[$scope.current_number];
      $scope.gotoAnchor('signup-content');

      $timeout(function() {
        angular.forEach($scope.signupForm.$error, function(field) {
          angular.forEach(field, function(errorField) {
            errorField.$setUntouched();
          })
        });

        $('input').trigger('keyup');
        $('select').trigger('change');

      });
    };

    /**
     * show / hide second bank account info
     * @method toggleBankAccount
     */
    $scope.toggleBankAccount = function() {
      $scope.formData.isSecondBankSelected = !$scope.formData.isSecondBankSelected;
      if (!$scope.formData.isSecondBankSelected) {
        $scope.formData.ROUTING_NUMBER_SECOND = '';
        $scope.formData.ACCOUNT_NUMBER_SECOND = '';
        $scope.formData.ACCOUNT_NUMBER_SECOND_confirm = '';
        angular.forEach(CONST.FSPFUNDTYPES, function(value, key) {
          $scope.formData.bankInformation[value] = '0';
        });
      }
    };

    /**
     * Check Account
     * @method checkAccount
     * @return
     */
    $scope.checkAccount = function() {
      if ($scope.formData.isSecondBankSelected) {
        if ($scope.formData.ROUTING_NUMBER == $scope.formData.ROUTING_NUMBER_SECOND) {
          if ($scope.formData.ACCOUNT_NUMBER == $scope.formData.ACCOUNT_NUMBER_SECOND) {
            $scope.signupForm.ACCOUNT_NUMBER_SECOND.$setValidity('accountError', false);
          } else {
            $scope.signupForm.ACCOUNT_NUMBER_SECOND.$setValidity('accountError', true);
          }
        } else {
          $scope.signupForm.ACCOUNT_NUMBER_SECOND.$setValidity('accountError', true);
        }
      }
    };

    /**
     * Check Bank
     * @method checkBank
     */
    $scope.checkBank = function() {
      if ($scope.signupForm.ROUTING_NUMBER.$valid) {
        $scope.bankCheck = true;
        var routingNumber = {
          "routingNumber": $scope.formData.ROUTING_NUMBER
        };
        fdService.getBankName(routingNumber).success(function(response, status, headers, config) {
          $scope.bankCheck = false;
          $scope.bankError = false;
          $scope.bankErrorCount = 0;
          if (response.status.success == 'true') {
            $scope.formData.bankName = (response.data == null ? '' : response.data.bankName);
          } else {
            $scope.formData.bankName = "";
          }
        }).error(function(data, status, headers, config) {
          $scope.formData.bankName = "";
          if (status == 400) {
            $scope.bankCheck = true;
            $scope.bankError = true;
            $scope.bankErrorServerFails = false;
          } else {
            $scope.bankErrorCount++;
            $scope.bankError = false;
            if ($scope.bankErrorCount >= 3) {
              $scope.bankCheck = false;
              $scope.bankErrorServerFails = false;
            } else {
              $scope.bankCheck = true;
              $scope.bankErrorServerFails = true;
            }
          }
        });
      }
    };

    /**
     * Check Second Bank
     * @method CheckSecondBank
     * @return
     */
    $scope.CheckSecondBank = function() {
      if ($scope.signupForm.ROUTING_NUMBER_SECOND.$valid) {
        $scope.bankCheck_second = true;
        var routingNumber = {
          "routingNumber": $scope.formData.ROUTING_NUMBER_SECOND
        };
        fdService.getBankName(routingNumber).success(function(response, status, headers, config) {
          $scope.bankCheck_second = false;
          $scope.bankError_second = false;
          $scope.bankErrorCount_second = 0;
          if (response.status.success == 'true') {
            $scope.formData.bankName_second = (response.data == null ? '' : response.data.bankName);
          } else {
            $scope.formData.bankName_second = "";
          }
        }).error(function(data, status, headers, config) {
          $scope.formData.bankName_second = "";
          if (status == 400) {
            $scope.bankCheck_second = true;
            $scope.bankError_second = true;
            $scope.bankErrorServerFails_second = false;
          } else {
            $scope.bankErrorCount_second++;
            $scope.bankError_second = false;
            if ($scope.bankErrorCount_second >= 3) {
              $scope.bankCheck_second = false;
              $scope.bankErrorServerFails_second = false;
            } else {
              $scope.bankCheck_second = true;
              $scope.bankErrorServerFails_second = true;
            }
          }
        });
      }
    };


    /**
     * Face To Face Change
     * @method faceToFaceChange
     * @param {} tag
     * @return
     */
    $scope.faceToFaceChange = function(tag) {
      $scope.signupForm.PHONE_OR_EMAIL.$setValidity("total", false);
      if (tag == 0) {
        if ($scope.formData.FACE_TO_FACE)
          calcRemainingValues('FACE_TO_FACE', 'PHONE_OR_EMAIL', 'INTERNET_PAY');
      } else if (tag == 1) {
        if ($scope.formData.PHONE_OR_EMAIL)
          calcRemainingValues('PHONE_OR_EMAIL', 'FACE_TO_FACE', 'INTERNET_PAY');
      }
      //Added tag=2 else condition for INTERNET_PAY logic handling
      else if (tag == 2) {
        if ($scope.formData.INTERNET_PAY)
          calcRemainingValues('INTERNET_PAY', 'FACE_TO_FACE', 'PHONE_OR_EMAIL');
      }
    };

    /**
     * Description
     * @method deliveryTotal
     * @return BinaryExpression
     */
    var deliveryTotal = function() {
      var a = $scope.formData.DELIVERY0_7 ? parseInt($scope.formData.DELIVERY0_7) : 0;
      var b = $scope.formData.DELIVERY8_14 ? parseInt($scope.formData.DELIVERY8_14) : 0;
      var c = $scope.formData.DELIVERY15_30 ? parseInt($scope.formData.DELIVERY15_30) : 0;
      var d = $scope.formData.DELIVERY31 ? parseInt($scope.formData.DELIVERY31) : 0;
      return a + b + c + d === 100
    }

    /**
     * Calculate Delivery Values
     * @method calcDeliveryValues
     * @param {} input1
     * @param {} input2
     * @param {} input3
     * @param {} input4
     */
    var calcDeliveryValues = function(input1, input2, input3, input4) {
      $scope.signupForm.DELIVERY31.$setValidity("total", deliveryTotal());
      //$scope.signupForm.DELIVERY31.$setValidity("total", true);
      if ($scope.formData[input1]) {

        if (!$scope.formData[input2] && !$scope.formData[input3] && !$scope.formData[input4]) {
          if ($scope.formData[input1] == '100') {
            $scope.formData[input2] = '0';
            $scope.formData[input3] = '0';
            $scope.formData[input4] = '0';
            $timeout(function() {
              angular.element('[name=' + input2 + ']').trigger('change');
              angular.element('[name=' + input3 + ']').trigger('change');
              angular.element('[name=' + input4 + ']').trigger('change');
            }, 1);
            return; //return if remaining 3 fields still empty
          }

        }
        //return if remaining 3 fields still empty
        if ($scope.formData[input2] && $scope.formData[input3] && $scope.formData[input4]) { //Set form validity if total not equal to 100
          $scope.signupForm.DELIVERY31.$setValidity("total", deliveryTotal());
          return;
        }
        if ($scope.formData[input2]) {
          if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) === 100)) {
            $scope.formData[input3] = '0';
            $scope.formData[input4] = '0';
            $timeout(function() {
              angular.element('[name=' + input3 + ']').trigger('change');
              angular.element('[name=' + input4 + ']').trigger('change');
            }, 1);
          }
          if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) > 100)) {
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
            return;
          }
          if ($scope.formData[input3]) {
            if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input3]) > 100)) {
              $scope.signupForm.DELIVERY31.$setValidity("total", false);
              return;
            }
            $scope.formData[input4] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input3]))).toString();
          }
          if ($scope.formData[input4]) {
            if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input4]) > 100)) {
              $scope.signupForm.DELIVERY31.$setValidity("total", false);
              return;
            }
            $scope.formData[input3] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input4]))).toString();
          }
        }
        if ($scope.formData[input3]) {
          if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) === 100)) {
            $scope.formData[input2] = '0';
            $scope.formData[input4] = '0';
            $timeout(function() {
              angular.element('[name=' + input2 + ']').trigger('change');
              angular.element('[name=' + input4 + ']').trigger('change');
            }, 1);
          }
          if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) > 100)) {
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
            return;
          }
          if ($scope.formData[input2]) {
            if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input3]) > 100)) {
              $scope.signupForm.DELIVERY31.$setValidity("total", false);
              return;
            }
            $scope.formData[input4] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input3]))).toString();
          }
          if ($scope.formData[input4]) {
            if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) + parseInt($scope.formData[input4]) > 100)) {
              $scope.signupForm.DELIVERY31.$setValidity("total", false);
              return;
            }
            $scope.formData[input2] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) + parseInt($scope.formData[input4]))).toString();
          }
        }
        if ($scope.formData[input4]) {
          if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input4]) === 100)) {
            $scope.formData[input2] = '0';
            $scope.formData[input3] = '0';
            $timeout(function() {
              angular.element('[name=' + input2 + ']').trigger('change');
              angular.element('[name=' + input3 + ']').trigger('change');
            }, 1);
          }
          if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input4]) > 100)) {
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
            return;
          }
          if ($scope.formData[input2]) {
            if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input4]) > 100)) {
              $scope.signupForm.DELIVERY31.$setValidity("total", false);
              return;
            }
            $scope.formData[input3] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input4]))).toString();
          }
          if ($scope.formData[input3]) {
            if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) + parseInt($scope.formData[input4]) > 100)) {
              $scope.signupForm.DELIVERY31.$setValidity("total", deliveryTotal());
              return;
            }
            $scope.formData[input2] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) + parseInt($scope.formData[input4]))).toString();
          }
        }
      } else {
        $scope.formData[input2] = undefined;
        $scope.formData[input3] = undefined;
        $scope.formData[input4] = undefined;
      }
      $scope.signupForm.DELIVERY31.$setValidity("total", deliveryTotal());
      $timeout(function() {
        angular.element('[name=' + input2 + ']').trigger('change');
        angular.element('[name=' + input3 + ']').trigger('change');
        angular.element('[name=' + input4 + ']').trigger('change');
      }, 1);
    }

    /**
     * Change Delivery Time Frame
     * @method changeDeliveryTimeFrame
     * @param {} tag
     * @return
     */
    $scope.changeDeliveryTimeFrame = function(tag) {
      if (!($scope.categoryDetails.name == 'ECOMMERCE' || $scope.categoryDetails.name == 'MOTO' || $scope.formData.FACE_TO_FACE < 100)) {
        if (($scope.formData.DELIVERY0_7 && $scope.formData.DELIVERY8_14 && $scope.formData.DELIVERY15_30) || ($scope.formData.DELIVERY8_14 && $scope.formData.DELIVERY15_30 && $scope.formData.DELIVERY31) || ($scope.formData.DELIVERY0_7 && $scope.formData.DELIVERY15_30 && $scope.formData.DELIVERY31) || ($scope.formData.DELIVERY0_7 && $scope.formData.DELIVERY8_14 && $scope.formData.DELIVERY31)) {
          $scope.signupForm.DELIVERY31.$setValidity("total", false);
        }
      }
      if (tag == 0) {
        if ($scope.formData.DELIVERY0_7)
          calcDeliveryValues('DELIVERY0_7', 'DELIVERY8_14', 'DELIVERY15_30', 'DELIVERY31');
      } else if (tag == 1) {
        if ($scope.formData.DELIVERY8_14)
          calcDeliveryValues('DELIVERY8_14', 'DELIVERY0_7', 'DELIVERY15_30', 'DELIVERY31');
      } else if (tag == 2) {
        if ($scope.formData.DELIVERY15_30)
          calcDeliveryValues('DELIVERY15_30', 'DELIVERY0_7', 'DELIVERY8_14', 'DELIVERY31');
      } else if (tag == 3) {
        if ($scope.formData.DELIVERY31)
          calcDeliveryValues('DELIVERY31', 'DELIVERY0_7', 'DELIVERY8_14', 'DELIVERY15_30');
      }
    };

    /**
     * Init Configure Product popup
     * @method configureProduct
     * @param p
     */
    $scope.configureProduct = function(p) {

      $scope.activeProduct = p;

      p.attributeDataDefault = null;
      var orderId = fdService.getOrderId();

      fdService.getProductAttributes(orderId, p.id).success(function(data, status, headers, config) {

        p.attributeDataDefault = data.attributesMap;
        p.lineItemId = data.lineItemId;
        p.configurableLineItemId = data.configurableLineItemId;

        var i, k;
        for (i in p.attributeDataDefault) {

          p.attributeDataDefault[i].value = '';

          for (k = 0; k < p.attributeDataDefault[i].attributeValues.length; k++) {
            if (p.attributeDataDefault[i].attributeValues[k].default) {
              p.attributeDataDefault[i].value = p.attributeDataDefault[i].attributeValues[k].attributeValue;
            }
          }

          if (p.attributesReady) {
            p.attributeDataDefault[i].value = p.attributesReady[i].attributeValue;
          }
        }
      });
    };

    /**
     * save configured product
     * @method saveConfigureProduct
     * @param {Object} p product
     */
    $scope.saveConfigureProduct = function(p) {

      p.attributesReady = {};
      for (i in p.attributeDataDefault) {
        p.attributesReady[i] = {
          attributeName: i,
          attributeValue: p.attributeDataDefault[i].value,
          attributeDomain: p.attributeDataDefault[i].attributeDomain,
        };
      }

    };

    /**
     * Description
     * @method getMccTypes
     * @param {Object} formData
     * @param {} callback
     * @return
     */
    $scope.getMccTypes = function(formData, callback) {
      formData.mccTypes = [];

      var ti = fdService.getTransactionInfo();

      fdService.getMccTypes($scope.categoryDetails.name, formData.mcccodes).success(function(data, status, headers, config) {
        formData.mccTypes = data;
        if (callback) {
          callback.apply(this, []);
        }
      });
    };

    /**
     * submit locations form
     * @method submitLocations
     */
    $scope.submitLocations = function() {

      if ($scope.clickedSubmit) {
        return;
      }

      if (!$scope.signupForm.$valid) {
        $scope.form_error = true;
        $scope.gotoAnchor('form-error');
        angular.forEach($scope.signupForm.$error, function(field) {
          angular.forEach(field, function(errorField) {
            errorField.$setTouched();
          })
        });
        return;
      }

      if (!$scope.formData.products.length) {
        return;
      }

      $scope.form_error = false;
      $scope.clickedSubmit = true;

      var data_to_send = {
        locationInformation: []
      };

      var siteSurvey = {}, equipmentLocation, bankInformation;

      for (var i in $scope.globalFormData) {

        siteSurvey = {};
        siteSurvey.siteVisitation = $scope.globalFormData[i].siteVisitation;
        siteSurvey.deliveryTimeFrame_0_To_7 = $scope.globalFormData[i].DELIVERY0_7;
        siteSurvey.deliveryTimeFrame_8_To_14 = $scope.globalFormData[i].DELIVERY8_14;
        siteSurvey.deliveryTimeFrame_15_To_30 = $scope.globalFormData[i].DELIVERY15_30;
        siteSurvey.deliveryTimeFrame_Over_30 = $scope.globalFormData[i].DELIVERY31;

        if ($scope.globalFormData[i].siteVisitation === 'Visitation Completed') {
          siteSurvey.surveyPerformed = $scope.surveyUser;
          siteSurvey.businessZone = $scope.globalFormData[i].businessZone;
          siteSurvey.merchantBusinessLocation = $scope.globalFormData[i].businessLocationType;
          siteSurvey.seasonalMerchant = $scope.globalFormData[i].seasonalMerchant;
          siteSurvey.totalFloors = $scope.globalFormData[i].buildingFloors;
          siteSurvey.floorOccupied = $scope.globalFormData[i].floorsOccupied;
          siteSurvey.merchantsNameDisplayed = $scope.merchantDisplayed;
          siteSurvey.apartmentSquareFoot = $scope.globalFormData[i].squareFootage;
          siteSurvey.merchantsOwnBuildSpace = $scope.globalFormData[i].ownOrRent;
          siteSurvey.totalRegister = $scope.globalFormData[i].noOfRegisters;
          siteSurvey.licenceDisplayed = $scope.globalFormData[i].businessLicenseDisplay;
          siteSurvey.returnPolicy = $scope.globalFormData[i].returnPolicy;
          siteSurvey.separateRefundPolicy = $scope.globalFormData[i].returnPolicyCard;
          siteSurvey.customerDeposit = $scope.globalFormData[i].customerDeposit;
          siteSurvey.salesDeposit = $scope.globalFormData[i].cardDeposit;
          siteSurvey.autoRenew = $scope.globalFormData[i].orderRenewal;

          if ($scope.globalFormData[i].ownOrRent === 'Rent') {
            siteSurvey.rentStartTime = $filter('date')($scope.globalFormData[i].buildingSpace, "MM/dd/yyyy");
            siteSurvey.leaseExpires = $filter('date')($scope.globalFormData[i].leaseExpiry, "MM/dd/yyyy");
            siteSurvey.landLordName = $scope.globalFormData[i].landLordName;
            siteSurvey.landLordPhoneNumber = $scope.globalFormData[i].landLordNumber;
          }
        } else {
          siteSurvey.returnPolicy = $scope.globalFormData[i].returnPolicy;
          siteSurvey.separateRefundPolicy = $scope.globalFormData[i].returnPolicyCard;
        }

        equipmentLocation = [];

        var attributes;

        for (var k = 0; k < $scope.globalFormData[i].products.length; k++) {
          attributes = [];
          for (j in $scope.globalFormData[i].products[k].attributesReady) {
            attributes.push($scope.globalFormData[i].products[k].attributesReady[j]);
          }

          equipmentLocation.push({
            lineItemId: $scope.globalFormData[i].products[k].id,
            configurableLineItemId: $scope.globalFormData[i].products[k].configurableLineItemId,
            attributes: attributes,
          });
        }

        bankInformation = [];

        var bankInfo = {
          "instName": $scope.globalFormData[i].bankName,
          'abaNumber': $scope.globalFormData[i].ROUTING_NUMBER,
          'accountNumber': $scope.globalFormData[i].ACCOUNT_NUMBER,
          'ordinal': 2
        };

        angular.forEach(CONST.FSPFUNDTYPES, function(value, key) {
          bankInfo[value] = $scope.globalFormData[i].bankInformation[value] == 0 ? 1 : 0;
        });

        bankInformation.push(bankInfo);

        if ($scope.globalFormData[i].isSecondBankSelected) {

          bankInfo = {
            "instName": $scope.globalFormData[i].bankName_second,
            'abaNumber': $scope.globalFormData[i].ROUTING_NUMBER_SECOND,
            'accountNumber': $scope.globalFormData[i].ACCOUNT_NUMBER_SECOND,
            'ordinal': 2
          };

          angular.forEach(CONST.FSPFUNDTYPES, function(value, key) {
            bankInfo[value] = $scope.globalFormData[i].bankInformation[value] == 1 ? 1 : 0;
          });
          bankInformation.push(bankInfo);
        }

        var ti = fdService.getTransactionInfo();

        data_to_send.locationInformation.push({
          dbaName: $scope.globalFormData[i].DBA_NAME,
          merchantId: $scope.globalFormData[i].merchantId ? $scope.globalFormData[i].merchantId : '',
          siteSurvey: siteSurvey,
          averageTicket: $scope.globalFormData[i].TYPICAL_SALE_AMOUNT,
          mccDescription: $scope.globalFormData[i].mcccodes,
          mcc: $scope.globalFormData[i].mcc,
          annualVolume: $scope.globalFormData[i].annualcardVolume,
          highestTicket: $scope.globalFormData[i].ANTICIPATED_HIGHEST_TICKET_SALE,
          isPrimaryLocation: i == 1,
          equipmentLocation: equipmentLocation,
          //bankInformation: bankInformation,
          faceToFace: $scope.globalFormData[i].FACE_TO_FACE,
          phoneOrEmail: $scope.globalFormData[i].PHONE_OR_EMAIL,
          internet: $scope.globalFormData[i].INTERNET_PAY,
          rollupIndicator: $scope.globalFormData[i].rollupIndicator,
          category: ti.category,
          address1: $scope.globalFormData[i].business_address1,
          address2: $scope.globalFormData[i].business_address2,
          city: $scope.globalFormData[i].business_address_city,
          state: $scope.globalFormData[i].business_address_state,
          zip: $scope.globalFormData[i].business_address_zip,
        });

        if ($scope.globalFormData[i].isPrimaryLocation || $scope.globalFormData[i].useSameBank != 'yes') {
          data_to_send.locationInformation[i - 1]['bankInformation'] = bankInformation;
        }

      }

      var orderId = fdService.getOrderId();

      fdService.postOrderLocations(data_to_send, orderId)
        .success(function(data, status, headers, config) {
          $scope.clickedSubmit = false;
          $location.path('/signup/setup');
        })
        .error(function(data, status, headers, config) {
          $scope.clickedSubmit = false;
        });
    };


    ///////////////// MAIN ////////////////////////////////
    _init();
    $(window).on('popstate', function() {
      angular.element('.modal-backdrop').removeClass('modal-backdrop');
      angular.element('body').css('overflow', 'auto');
    });
  }
]);