/**
 * Signup Owner Controller
 */
app.controller('SignupOwnerCtrl', ['$scope', '$rootScope', '$filter', '$location', 'fdService', '$timeout', '$anchorScroll', 'CONST',
  function($scope, $rootScope, $filter, $location, fdService, $timeout, $anchorScroll, CONST) {

    /**
     * Init function
     * @method _init
     */
    var _init = function() {
      $rootScope.body_id = 'full_body';
      $scope.showPassword = false;
      var orderId = fdService.getOrderId();
      var cart = fdService.getOrderedCart(orderId);
      if (!cart) {
        $location.path('/');
      }
      //set category details
      $scope.categoryDetails = {name: cart.data[Object.keys(cart.data)[0]].category};


      /* percentValues hold indices array for ng-options*/
      $scope.percentValues = (function() {
        var tempArr = [];
        for (var i = 0; i <= 20; i++)
          tempArr.push(i * 5);
        return tempArr;
      })();

      $scope.orgTypes = {
        I: "Sole Proprietorship",
        P: "Partnerships",
        C: "Public Corporation",
        L: "Limited Liability Company (LLC)",
        PRC: "Private Corporation",
        T: "Tax Exempt",
        G: "Government"
      };

      $scope.tinError = false;
      $scope.tinCount = 1;


      $scope.form_error = false;
      $scope.states_list = $rootScope.CONST.STATES;
      $scope.formData = {};
      $scope.formData.owners = [{}];

      $scope.hasEcommerce = false;
      for (var i = 0; i < cart.data.length; i++) {
        if (cart.data[i].category == 'ECOMMERCE') {
          $scope.hasEcommerce = true;
        }
      }

      if (!angular.isUndefined(cart.shippingAddress[0])) {

        if (!angular.isUndefined(cart.shippingAddress[0].address1)) {
          $scope.formData.business_address1 = (cart.shippingAddress[0].address1).substring(0, 24);
        }

        $scope.formData.business_address2 = cart.shippingAddress[0].address2;
        $scope.formData.business_address_zip = cart.shippingAddress[0].zip;
        $scope.formData.business_address_city = cart.shippingAddress[0].city;
        $scope.formData.business_address_state = cart.shippingAddress[0].state;

        if ($scope.formData.business_address_state) {
          for (i = 0; i < $scope.states_list.length; i++) {
            if ($scope.states_list[i].name.toLowerCase() == $scope.formData.business_address_state.toLowerCase()) {
              $scope.formData.business_address_state = $scope.states_list[i].abbr;
              break;
            }
          }
        }
        if (!$scope.formData.business_address_city || !$scope.formData.business_address_state) {
          $scope.lookupBusinessZip();
        }
        $scope.formData.businessPhone = cart.shippingAddress[0].phone;
        $scope.formData.owners[0].email = cart.shippingAddress[0].email;

        $scope.formData.statementDeliveryEmail = cart.shippingAddress[0].email;
        $scope.formData.statementDeliveryType = "Email";
        angular.forEach(CONST.FSPFUNDTYPES, function(value, key) {
          $scope.formData[value] = '0';
        });
        $scope.formData.owners[0].name = cart.shippingAddress[0].firstname + " " + cart.shippingAddress[0].lastname;
        $scope.formData.legal_business_name = cart.shippingAddress[0].company_name;
        angular.element('#LEGAL_BUSINESS_NAME_SAME_AS_DBA').focus().parent().addClass('focused');

      }

      if (fdService.getTransactionInfo().annualVolume) {
        $scope.formData.annualVolume = fdService.getTransactionInfo().annualVolume;
      }
      if (fdService.getTransactionInfo().averageTicket) {
        $scope.formData.TYPICAL_SALE_AMOUNT = fdService.getTransactionInfo().averageTicket;
      }
      if (fdService.getTransactionInfo().highestTicket) {
        $scope.formData.ANTICIPATED_HIGHEST_TICKET_SALE = fdService.getTransactionInfo().highestTicket;
      }

      fdService.getOrderBusinessinformation(orderId).success(function(data, status, headers, config) {

        $scope.orderBusinessInfo = data.merchantInformation[0];
        var formData = $scope.orderBusinessInfo;
        if (formData.legalName) {
          $scope.formData.legal_business_name = formData.legalName;
        }
        if (formData.yearsInBusiness) {
          var date = new Date(formData.yearsInBusiness);
          $scope.formData.YEAR_BUSINESS_STARTED = date.getFullYear().toString();
          $scope.formData.MONTH_BUSINESS_STARTED = ("0" + (date.getMonth() + 1)).slice(-2);
        }
        if (formData.organizationType) {
          var orgType;
          angular.forEach($scope.orgTypes, function(value, key) {
            if (formData.organizationType == value) {
              orgType = key;
            }
          });
          $scope.formData.ORGANIZATION_TYPE = orgType;
        }
        if (formData.taxFilingName) {
          $scope.formData.tax_filing_name = formData.taxFilingName;
          $scope.formData.TAX_FILING_NAME_SAME_AS_BUSINESS_LEGAL_NAME = (formData.taxFilingName == formData.legalName) ? '1' : '0';
        }
        if (formData.tinType) {
          $scope.formData.HOW_BUSINESS_FILES_TAXES = formData.tinType.toString();
        }
        if (formData.url) {
          $scope.formData.BUSINESS_WEBSITE = formData.url;
          $scope.formData.have_website = 'yes';
          $scope.formData.have_business_online = 'yes';
        } else {
          if ($scope.hasEcommerce) {
            $scope.formData.have_website = 'yes';
            $scope.formData.have_business_online = 'yes';
          } else {
            $scope.formData.have_business_online = 'no';
          }
        }
        if (formData.foreignEntityOption) {
          $scope.formData.FOREIGN_OWNERSHIP = formData.foreignEntityOption;
        }
        if (formData.stateOfIncorporation) {
          $scope.formData.INCORPORATION_STATE = formData.stateOfIncorporation;
        }

        $scope.ownerInformation = data.ownerInformation;
        for (var i = 0; i < $scope.ownerInformation.length; i++) {
          var ownerInfo = $scope.ownerInformation[i];
          $scope.formData.owners[i] = {};
          $scope.formData.owners[i].name = ownerInfo.firstName + ' ' + ownerInfo.lastName;
          $scope.formData.owners[i].SocialSecurityNumber = ownerInfo.ssn;

          if (ownerInfo.dateofBirth) {
            var date = new Date(ownerInfo.dateofBirth);
            $scope.formData.owners[i].dob_day = ("0" + date.getDate()).slice(-2);
            $scope.formData.owners[i].dob_month = ("0" + (date.getMonth() + 1)).slice(-2);
            $scope.formData.owners[i].dob_year = date.getFullYear().toString();
          }

          $scope.formData.owners[i].title1 = ownerInfo.title;
          $scope.formData.owners[i].percent_owned = ownerInfo.percentOwned;
          $scope.formData.owners[i].Address1 = ownerInfo.contactInformation.address1;
          $scope.formData.owners[i].Address2 = ownerInfo.contactInformation.address2;
          $scope.formData.owners[i].city = ownerInfo.contactInformation.city;
          $scope.formData.owners[i].state = ownerInfo.contactInformation.state;
          $scope.formData.owners[i].zip = ownerInfo.contactInformation.postalCode;
          if ($scope.formData.owners[i].zip) {
            $scope.lookupZip();
          }
          $scope.formData.owners[i].phone = ownerInfo.contactInformation.phone;
          $scope.formData.owners[i].email = ownerInfo.contactInformation.email;
          $scope.formData.owners[i].employeeId = ownerInfo.employeeId;
          $scope.validateBusiness(i);
        }

        $timeout(function() {
          angular.forEach($scope.signupForm.$error, function(field, key) {
            angular.forEach(field, function(errorField) {
              if (errorField.$viewValue) {
                errorField.$setTouched();
              }
            })
          });
          //$scope.getTitles('init');
        }, 0);
        $timeout(function() {
          angular.element('[name=legal_business_name]').trigger('keyup');
          angular.element('[name=YEAR_BUSINESS_STARTED]').trigger('change');
          angular.element('[name=MONTH_BUSINESS_STARTED]').trigger('change');
          angular.element('[name=ORGANIZATION_TYPE]').trigger('change');
          angular.element('[name=tax_filing_name]').trigger('change');
          angular.element('[name=TAX_FILING_NAME_SAME_AS_BUSINESS_LEGAL_NAME]').trigger('change');
          angular.element('[name=HOW_BUSINESS_FILES_TAXES]').trigger('change');
          angular.element('[name=BUSINESS_WEBSITE]').trigger('change');
          angular.element('[name=have_website]').trigger('change');
          angular.element('[name=have_business_online]').trigger('change');
          angular.element('[name=FOREIGN_OWNERSHIP]').trigger('change');
          angular.element('[name=INCORPORATION_STATE]').trigger('change');
          for (var i = 0; i < $scope.ownerInformation.length; i++) {
            angular.element('[name=name_' + i + ']').trigger('keyup');
            angular.element('[name=phone_' + i + ']').trigger('keyup');
            angular.element('[name=dob_month_' + i + ']').trigger('change');
            angular.element('[name=dob_day_' + i + ']').trigger('change');
            angular.element('[name=dob_year_' + i + ']').trigger('change');
            angular.element('[name=email_' + i + ']').trigger('keyup');
            angular.element('[name=Address1_' + i + ']').trigger('keyup');
            angular.element('[name=Address2_' + i + ']').trigger('keyup');
            angular.element('[name=zip_' + i + ']').trigger('keyup');
            angular.element('[name=city_' + i + ']').trigger('keyup');
            angular.element('[name=state_' + i + ']').trigger('keyup');
            angular.element('[name=percentOwned_' + i + ']').trigger('keyup');
          }
        }, 0);
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
      $scope.numberPattern = (/^[0-9]*$/);
      $scope.urlPattern = (/^((((http(s)?):\/\/)|([www\.]|[WWW\.]))?(?!\.)([a-zA-Z0-9\-]*)\.?([a-zA-Z0-9\-]*)\.(com|org|net|mil|edu|biz|info|us|cc|co|gov|COM|ORG|NET|MIL|EDU|BIZ|INFO|US|CC|CO|GOV)(\.[a-z]{1,3})?)((\/?[^?]*?)\?.*)?$/);
      $scope.today = new Date();
      $scope.thisYear = $scope.today.getFullYear();
      $scope.thisMonth = $scope.today.getMonth() + 1;
      $scope.titles = ["Owner", "Partner", "President", "Vice President", "Member LLC", "Secretary", "Treasurer", "CEO", "CFO", "COO"];

      $scope.categoryName = $scope.categoryDetails.name;
      $scope.updateMap();
    };


    /**
     * Validate Business
     * @method validateBusiness
     * @param {number} index
     */
    $scope.validateBusiness = function(index) {

      if (!($scope.formData.owners[index].email && $scope.formData.owners[index].Address1 && $scope.formData.owners[index].zip)) {
        return;
      }
      var dataToValidate = {};
      dataToValidate.merInfo = {};
      dataToValidate.merInfo.contacts = {};
      dataToValidate.merInfo.contacts.contactInfo = [];
      dataToValidate.merInfo.contacts.contactInfo.push({
        "compName": $scope.formData.legal_business_name,
        "address1": $scope.formData.owners[index].Address1,
        "address2": $scope.formData.owners[index].Address2,
        "city": $scope.formData.owners[index].city,
        "state": $scope.formData.owners[index].state,
        "country": 'USA',
        "zipCode": $scope.formData.owners[index].zip,
        "email": $scope.formData.owners[index].email,
        "type": "CORPORATE"
      });

      fdService.validateContact(dataToValidate)
        .success(function(response, status, headers, config) {
          if (response.length != 0) {
            for (var i = 0; i < response.length; i++) {
              if (response[i].errorCode == 8104) {
                $scope.signupForm['email_' + index].$setValidity("emailnotValid", false);
              }
            }
          } else {
            $scope.signupForm['email_' + index].$setValidity("emailnotValid", true);
          }
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

    };

    /**
     * Check SSN is valid or not
     * @method checkSsn
     * @param {} index
     */
    $scope.checkSsn = function(index) {
      fdService.getInvalidSsn()
        .success(function(data, status, headers, config) {
          $scope.excludedSsn = data;
          for (var i = 0; i < $scope.excludedSsn.length; i++) {
            if ($scope.formData.owners[index].SocialSecurityNumber == $scope.excludedSsn[i].ssnInvalidNo) {
              $scope.signupForm['SocialSecurityNumber_' + index].$setValidity("excluded", false);
              return;
            } else {
              $scope.signupForm['SocialSecurityNumber_' + index].$setValidity("excluded", true);
            }
          }
          return;
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

    };

    /**
     * Check EIN is valid or not
     * @method checkEin
     */
    $scope.checkEin = function() {
      fdService.getInvalidSsn()
        .success(function(data, status, headers, config) {
          $scope.excludedSsn = data;
          for (var i = 0; i < $scope.excludedSsn.length; i++) {
            if ($scope.formData.EIN == $scope.excludedSsn[i].ssnInvalidNo) {
              $scope.signupForm.EIN.$setValidity("excluded", false);
              return;
            } else {
              $scope.signupForm.EIN.$setValidity("excluded", true);
            }
          }
          return;
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

    };



    /**
     * Check Business Started Month
     * @method checkBsnMo
     */
    $scope.checkBsnMo = function() {
      if ($scope.formData.YEAR_BUSINESS_STARTED == $scope.thisYear && $scope.formData.MONTH_BUSINESS_STARTED > $scope.thisMonth) {
        $scope.signupForm.MONTH_BUSINESS_STARTED.$setValidity("excluded", false);
      } else {
        $scope.signupForm.MONTH_BUSINESS_STARTED.$setValidity("excluded", true);
      }
    };

    /**
     * Business Web Change
     * @method businessWebChange
     * @param tag
     */
    $scope.businessWebChange = function(tag) {
      if (tag == 1) {
        if ($scope.formData.have_business_online == 'no') {
          $scope.formData.have_website = '';
          $scope.formData.BUSINESS_WEBSITE = '';
        }
      } else if (tag == 2) {
        if ($scope.formData.have_website == 'no') {
          $scope.formData.BUSINESS_WEBSITE = '';
        }
      }
    };

    /**
     * Lookup Zip
     * @method lookupZip
     * @param {object} owner
     * @param {number} index
     */
    $scope.lookupZip = function(owner, index) {
      if (!owner || !owner.zip) {
        return;
      } else if (owner.zip == '00000') {
        $scope.signupForm['zip_' + index].$setValidity("zipnotValid", false);
      } else {
        $scope.signupForm['zip_' + index].$setValidity("zipnotValid", true);
      }

      fdService.lookupByZip(owner.zip, function(city, state) {
        if (!city) {
          owner.city = "";
          owner.state = "";
          $timeout(function() {
            angular.element('[name=state_' + index + ']').trigger('change');
            angular.element('[name=city_' + index + ']').trigger('keyup');
          }, 0);
        }
        if (!state) {
          owner.city = "";
          owner.state = "";
          $timeout(function() {
            angular.element('[name=state_' + index + ']').trigger('change');
            angular.element('[name=city_' + index + ']').trigger('keyup');
            angular.element('[name=city_' + index + ']').trigger('keyup');
          }, 0);
        } else {
          owner.city = city;
          owner.state = state;
          $timeout(function() {
            angular.element('[name=state_' + index + ']').trigger('change');
            angular.element('[name=city_' + index + ']').trigger('keyup');
            $scope.validateBusiness(index);
          });
        }
      });
    };

    /**
     * Lookup Business Zip
     * @method lookupBusinessZip
     * @return
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

        var address = $scope.formData.business_address1 + ', ' + $scope.formData.business_address_city + ', ' + $scope.formData.business_address_state + ', ' + $scope.formData.business_address_zip;
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
     * Description
     * @method getTitles
     * @param {String} type
     * @return
     */
    $scope.getTitles = function(type) {
      if ($scope.signupForm.ORGANIZATION_TYPE.$valid) {
        $scope.titles = [];
        $scope.formData.title1 = '';

        if ($scope.formData.ORGANIZATION_TYPE == 'I') {
          $scope.formData.owners[0].percent_owned = 100;
          $scope.formData.owners.splice(1);
          $timeout(function() {
            angular.element('[name=percentOwned_0]').trigger('keyup');
          }, 0);
        }

        var dataToSend = {"businessType": $scope.formData.ORGANIZATION_TYPE};
        fdService.getTitles(dataToSend)
          .success(function(response, status, headers, config) {
            if (!angular.isUndefined(response.titles)) {
              for (var i = 0; i < response.titles.length; i++) {
                $scope.titles.push(response.titles[i]);
              }
            }
            $scope.percentBlurred({}, 1);
            if (type != 'init') {
              for (var i = 0; i < $scope.formData.owners.length; i++) {
                $scope.formData.owners[i].title1 = '';
              }
            }
            $timeout(function() {
              for (var i = 0; i < $scope.ownerInformation.length; i++) {
                angular.element('[name=title1_' + i + ']').trigger('change');
              }
            }, 0);
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
     * @return
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
     * @param {object} owner
     * @param {number} index
     * @param {boolean} isRemoving
     */
    $scope.percentBlurred = function(owner, index, isRemoving) {

      var totalPercent = 0;
      var isTotal100AtIndex;
      $scope.isTotal100 = false;

      for (var i = 0; i < $scope.formData.owners.length; i++) {
        totalPercent += parseInt($scope.formData.owners[i].percent_owned);
        if (totalPercent == 100) {
          isTotal100AtIndex = i;
          $scope.isTotal100 = true;
        }
      }

      // Set valid
      $scope.percentOwnedValidity('percent_more_100', true);
      $scope.percentOwnedValidity('percent_total_100', true);
      $scope.percentOwnedValidity('percent_sole_total_100', true);

      if ($scope.formData.ORGANIZATION_TYPE == 'I' && totalPercent != 100) {
        $scope.percentOwnedValidity('percent_sole_total_100', false);
      } else if ($scope.formData.ORGANIZATION_TYPE == 'P' && totalPercent != 100) {

        if (isTotal100AtIndex >= 0) {
          $scope.formData.owners.splice(isTotal100AtIndex + 1, $scope.formData.owners.length - isTotal100AtIndex);
          return;
        }
        if (totalPercent < 100) {
          if ($scope.formData.owners.length >= 4) {
            $scope.percentOwnedValidity('percent_total_100', false);
            return;
          }
          if (!isRemoving && $scope.formData.owners.length == index + 1) {
            $scope.formData.owners.push({});
            $scope.formData.owners[$scope.formData.owners.length - 1].percent_owned = 100 - totalPercent;
            $scope.isTotal100 = true;
          } else {
            $scope.percentOwnedValidity('percent_total_100', false);
          }
        } else if (totalPercent > 100) {
          $scope.percentOwnedValidity('percent_total_100', false);
        }
      } else if (totalPercent > 100) {
        $scope.percentOwnedValidity('percent_more_100', false);
      }
    };

    /**
     * Percent Owned Validity
     * @method percentOwnedValidity
     * @param {String} errorType
     * @param {boolean} errorValidity
     * @return
     */
    $scope.percentOwnedValidity = function(errorType, errorValidity) {
      $scope.signupForm['percentOwned_0'].$setValidity(errorType, errorValidity);
      if ($scope.signupForm['percentOwned_1']) {
        $scope.signupForm['percentOwned_1'].$setValidity(errorType, errorValidity);
      }
      if ($scope.signupForm['percentOwned_2']) {
        $scope.signupForm['percentOwned_2'].$setValidity(errorType, errorValidity);
      }
      if ($scope.signupForm['percentOwned_3']) {
        $scope.signupForm['percentOwned_3'].$setValidity(errorType, errorValidity);
      }
    }

    /**
     * Description
     * @method addOwner
     */
    $scope.addOwner = function() {
      if ($scope.formData.owners.length < 4) {
        $scope.formData.owners.push({});
      }
    };

    /**
     * remove owner
     * @method removeOwner
     * @param {number} index
     */
    $scope.removeOwner = function(index) {
      $scope.formData.owners.splice(index, 1);
      $scope.percentBlurred({}, index, true);
    };

    /**
     * Goto Anchor
     * @method gotoAnchor
     * @param {string} anchor
     */
    $scope.gotoAnchor = function(anc) {
      $timeout(function() {
        $anchorScroll.yOffset = 50;
        $anchorScroll(anc);
        $anchorScroll.yOffset = 0;
      });
    };

    /**
     * submit owner info
     * @method submitOwnerInfo
     */
    $scope.submitOwnerInfo = function() {
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

      $scope.form_error = false;
      $scope.clickedSubmit = true;
      $scope.tinError = false;

      var data = {
        "requestHeader": {
          "appName": "FDMP",
          "appId": "FD Marketplace"
        },
        "tinInfo": {
          "taxId": $scope.formData.HOW_BUSINESS_FILES_TAXES == '1' ? $scope.formData.owners[0].SocialSecurityNumber : $scope.formData.EIN,
          "filingName": $scope.formData.TAX_FILING_NAME_SAME_AS_BUSINESS_LEGAL_NAME == '1' ? $scope.formData.legal_business_name : $scope.formData.tax_filing_name,
          "requester": "FDMP"
        }
      };

      fdService.checkTin(data)
        .success(function(data, status, headers, config) {
          if (data.responseCode == '0000' || $scope.tinCount >= 2) {
            $scope.submitSignupForm(data.requestedGuid);
          } else {
            $scope.tinCount++;
            $scope.tinError = true;
            $scope.clickedSubmit = false;
            $anchorScroll();
          }
        })
        .error(function(data, status, headers, config) {
          if ($scope.tinCount >= 2) {
            $scope.submitSignupForm("");
          } else {
            $scope.tinCount++;
            $scope.tinError = true;
            $scope.clickedSubmit = false;
            $anchorScroll();
          }
        });

    };

    /**
     * submit Signup Form
     * @method submitSignupForm
     * @param {} requestedGuid
     * @return
     */
    $scope.submitSignupForm = function(requestedGuid) {
      var orderId = fdService.getOrderId();

      var dataToSend = {};

      dataToSend.ownerInformation = [];


      var secuenceNo = 1;
      for (var i = 0; i < $scope.formData.owners.length; i++) {

        if (!$scope.formData.owners[i].dob) {
          $scope.formData.owners[i].dob = $scope.formData.owners[i].dob_year + '-' + $scope.formData.owners[i].dob_month + '-' + $scope.formData.owners[i].dob_day;
        }

        dataToSend.ownerInformation.push({
          sequenceNo: secuenceNo,
          firstName: $scope.formData.owners[i].name.split(" ")[0],
          lastName: $scope.formData.owners[i].name.split(" ")[1],
          ssn: $scope.formData.owners[i].SocialSecurityNumber,
          dateofBirth: $scope.formData.owners[i].dob,
          title: $scope.formData.owners[i].title1,
          percentOwned: $scope.formData.owners[i].percent_owned,
          employeeId : $scope.formData.owners[i].employeeId,
          driverLicenceNo: $scope.formData.owners[i].DriverLicenseNo,
          dlStateIssued: $scope.formData.owners[i].DriverLicenseState,
          dlExpirationMonth: $scope.formData.owners[i].DriverLicenseMonth,
          dlExpirationYear: $scope.formData.owners[i].DriverLicenseYear,
          contactInformation: {
              contactType: "OWNER",
              address1: $scope.formData.owners[i].Address1,
              address2: $scope.formData.owners[i].Address2,
              city: $scope.formData.owners[i].city,
              state: $scope.formData.owners[i].state,
              postalCode: $scope.formData.owners[i].zip,
              country: "US",
              phone: $scope.formData.owners[i].phone,
              email: $scope.formData.owners[i].email,
          }
        });
        secuenceNo++;
      }
      if ($scope.formData.ORGANIZATION_TYPE == 'G' && $scope.formData.FOREIGN_OWNERSHIP == 'N') {
        $scope.formData.FOREIGN_OWNERSHIP = 'G';
      }
      if ($scope.formData.ORGANIZATION_TYPE == 'T' && $scope.formData.FOREIGN_OWNERSHIP == 'N') {
        $scope.formData.FOREIGN_OWNERSHIP = 'D';
      }

      dataToSend.merchantInformation = [{
        sequenceNo: secuenceNo,
        category: fdService.getCategoryFromSession().name,
        legalName: $scope.formData.legal_business_name,
        taxId: $scope.formData.HOW_BUSINESS_FILES_TAXES == '1' ? $scope.formData.owners[0].SocialSecurityNumber : $scope.formData.EIN,
        yearsInBusiness: $scope.formData.YEAR_BUSINESS_STARTED + '-' + $scope.formData.MONTH_BUSINESS_STARTED + '-01',
        organizationType: $scope.orgTypes[$scope.formData.ORGANIZATION_TYPE],
        stateOfIncorporation: $scope.formData.INCORPORATION_STATE,
        taxFilingName: $scope.formData.TAX_FILING_NAME_SAME_AS_BUSINESS_LEGAL_NAME == '1' ? $scope.formData.legal_business_name : $scope.formData.tax_filing_name,
        foreignEntityOption: $scope.formData.FOREIGN_OWNERSHIP,
        tinRequestedGuid: requestedGuid,
        tinType: $scope.formData.HOW_BUSINESS_FILES_TAXES,
        url: $scope.formData.BUSINESS_WEBSITE,
        contactInformation: [{
          contactType: "CORPORATE",
          address1: $scope.formData.business_address1,
          address2: $scope.formData.business_address2,
          city: $scope.formData.business_address_city,
          state: $scope.formData.business_address_state,
          postalCode: $scope.formData.business_address_zip,
          country: "US",
          phone: $scope.formData.businessPhone,
        }]
      }];

      fdService.postBusinessinformation(dataToSend, orderId)
        .success(function(data, status, headers, config) {
          $scope.clickedSubmit = false;
          $location.path('/signup/location');
        })
        .error(function(data, status, headers, config) {
          $scope.clickedSubmit = false;
        });
    };

    ///////////////// MAIN ////////////////////////////////
    _init();
  }
]);