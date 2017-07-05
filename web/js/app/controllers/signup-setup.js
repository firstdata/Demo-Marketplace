/**
 * Signup Setup Controller
 */
app.controller('SignupSetupCtrl', ['$scope', '$rootScope', '$filter', '$location', 'fdService', '$timeout', '$anchorScroll', 'CONST',
  function($scope, $rootScope, $filter, $location, fdService, $timeout, $anchorScroll, CONST) {

    /**
     * Init function
     * @method _init
     */
    var _init = function() {
      $rootScope.body_id = 'full_body';

      $scope.clickedSubmit = false;

      $scope.emailPattern = (/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)?(\.(AERO|INT|GG|GH|GI|GL|GM|GN|GP|GQ|GR|GS|JOBS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|MIL|ID|IE|IL|IM|IN|IO|IQ|IR|IS|IT|MOBI|JE|JM|JO|JP|KE|KG|KH|KI|KM|KN|MUSEUM|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|NAME|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|NET|MG|MH|MK|ML|MM|MN|MO|MP|MQ|MR|ORG|MS|MT|MU|MV|MW|MX|MY|MZ|NA|NC|PRO|NE|NF|NG|NI|NL|NO|NP|NR|NU|NZ|TEL|OM|PA|PE|PF|PG|PH|PK|PL|PM|PN|ASIA|TRAVEL|PR|PS|PT|PW|PY|QA|RE|RO|RS|RU|AC|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|AD|SK|SL|SM|SN|SO|SR|ST|SU|SV|SY|AE|SZ|TC|TD|TF|TG|TH|TJ|TK|TL|TM|AF|TN|TO|TP|TR|TT|TV|TW|TZ|UA|UG|AG|UK|UM|US|UY|UZ|VA|VC|VE|VG|VI|AI|VN|VU|WF|WS|YE|YT|YU|ZA|ZM|AL|AM|AN|BIZ|AO|AQ|AR|AS|AT|AU|AW|AX|AZ|BA|CAT|BB|BD|BE|BF|BG|BH|BI|BJ|BM|BN|COM|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CC|COOP|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|EDU|CR|CU|CV|CX|CY|CZ|DE|DJ|DK|DM|GOV|DO|DZ|EC|EE|EG|ER|ES|ET|EU|FI|INFO|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|aero|int|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|jobs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|mil|id|ie|il|im|in|io|iq|ir|is|it|mobi|je|jm|jo|jp|ke|kg|kh|ki|km|kn|museum|kp|kr|kw|ky|kz|la|lb|lc|li|lk|name|lr|ls|lt|lu|lv|ly|ma|mc|md|me|net|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|org|ms|mt|mu|mv|mw|mx|my|mz|na|nc|pro|ne|nf|ng|ni|nl|no|np|nr|nu|nz|tel|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|asia|travel|pr|ps|pt|pw|py|qa|re|ro|rs|ru|ac|rw|sa|sb|sc|sd|se|sg|sh|si|sj|ad|sk|sl|sm|sn|so|sr|st|su|sv|sy|ae|sz|tc|td|tf|tg|th|tj|tk|tl|tm|af|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|ag|uk|um|us|uy|uz|va|vc|ve|vg|vi|ai|vn|vu|wf|ws|ye|yt|yu|za|zm|al|am|an|biz|ao|aq|ar|as|at|au|aw|ax|az|ba|cat|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|com|bo|br|bs|bt|bv|bw|by|bz|ca|cc|coop|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|edu|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|gov|do|dz|ec|ee|eg|er|es|et|eu|fi|info|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf))$/);
      $scope.phoneNumberPattern = (/^\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}$/);

      $timeout(function() {
        angular.forEach($scope.signupForm.$error, function(field, key) {
          angular.forEach(field, function(errorField) {
            if (errorField.$viewValue) {
              errorField.$setTouched();
            }
          })
        });
      }, 0);


      /*var dateFormat = "mm/dd/yy",

          from = $("#trainingContactDateFrom").datepicker({
            showAnim: "slideDown",
            defaultDate: "+2w",
            minDate: +14
          }),

          to = $("#trainingContactDateTo").datepicker({
            showAnim: "slideDown",
            defaultDate: "+2w 1d",
            minDate: "+2w 1d"
          });*/
      var orderId = fdService.getOrderId();
      var cart = fdService.getOrderedCart(orderId);
      if (!cart) {
        $location.path('/');
      }

      $scope.formData = {};
      $scope.states_list = $rootScope.CONST.STATES;
      if (cart.shippingAddress[0]) {

        if (!angular.isUndefined(cart.shippingAddress[0].address1)) {
          $scope.formData.trainingAddress1 = (cart.shippingAddress[0].address1).substring(0, 24);
        }

        $scope.formData.trainingAddress2 = cart.shippingAddress[0].address2;
        $scope.formData.trainingZip = cart.shippingAddress[0].zip;
        $scope.formData.trainingCity = cart.shippingAddress[0].city;
        $scope.formData.trainingState = cart.shippingAddress[0].state;

        if ($scope.formData.trainingState) {
          for (i = 0; i < $scope.states_list.length; i++) {
            if ($scope.states_list[i].name.toLowerCase() == $scope.formData.trainingState.toLowerCase()) {
              $scope.formData.trainingState = $scope.states_list[i].abbr;
              break;
            }
          }
        }
        if (!$scope.formData.trainingCity || !$scope.formData.trainingState) {
          $scope.lookupZip();
        }
        $scope.formData.trainingContactPhone = cart.shippingAddress[0].phone;
        $scope.formData.trainingContactName = cart.shippingAddress[0].first_name + " " + cart.shippingAddress[0].last_name;
        $scope.formData.statementDeliveryType = "Email";
        $scope.formData.statementType = "G";
        $scope.formData.statementDeliveryEmail = cart.shippingAddress[0].email;
        $scope.formData.electronic1099Email = "Yes";
        $scope.formData.chargebackAddress = "1";
        $scope.formData.chargebackDelivery = "Mail";
        $scope.formData.trainingProvider = "MAG";
        $scope.formData.preferredTrainingTime = '12:00PM-01:00PM';
        $scope.formData.thirdPartyProcessor = '00';
        $scope.formData.electronic1099 = "Yes";

      }

      $scope.orderId = fdService.getOrderId();
      fdService.getAccountPreferences($scope.orderId).success(function(data, status, headers, config) {
        if (Object.keys(data).length > 0) {
          $scope.formData.statementDeliveryType = data.statementDeliveryType;
          $scope.formData.statementType = data.statementType;
          $scope.formData.statementDeliveryEmail = data.statementEmailAddress;
          $scope.formData.electronic1099 = data.form1099Electronically;
          $scope.formData.electronic1099Email = data.form1099ToEmail;
          $scope.formData.emailAddressFor1099k = data.emailAddressFor1099k;
          $scope.formData.chargebackAddress = data.chargeBack;
          $scope.formData.chargebackDelivery = data.chargeBackDeliveryType;
          $scope.formData.trainingContactPhone = data.contactPhone;
          $scope.formData.faxNumber = data.fax;
          $scope.formData.trainingProvider = data.trainingProvider;
          $scope.formData.preferredTrainingTime = data.preferredTrainingFrom + '-' + data.preferredTrainingTo;
          $scope.formData.thirdPartyProcessor = data.thirdPartyProcessor;
          $scope.formData.thirdPartyProcessorName = data.thirdPartyProcessorName;
          $scope.formData.thirdPartyProcessorSoftware = data.thirdPartyProcessorSoftware;
        }
        $timeout(function() {
          angular.element('[name="trainingProvider"]').trigger('change');
          angular.element('[name="preferredTrainingTime"]').trigger('change');
        }, 0);
      });
    };


    /**
     * Lookup Zip
     * @method lookupZip
     */
    $scope.lookupZip = function() {
      if (!$scope.formData.trainingZip) {
        return;
      } else if ($scope.signupForm && $scope.formData.trainingZip == '00000') {
        $scope.signupForm.trainingZip.$setValidity("zipnotValid", false);
      } else if ($scope.signupForm) {
        $scope.signupForm.trainingZip.$setValidity("zipnotValid", true);
      }

      fdService.lookupByZip($scope.formData.trainingZip, function(city, state) {
        if (!city) {
          $scope.formData.trainingCity = "";
          $scope.formData.trainingState = "";
          $timeout(function() {
            angular.element('[name=trainingState]').trigger('change');
            angular.element('[name=trainingCity]').trigger('keyup');
          }, 0);
        }
        if (!state) {
          $scope.formData.trainingCity = "";
          $scope.formData.trainingState = "";
          $timeout(function() {
            angular.element('[name=trainingState]').trigger('change');
            angular.element('[name=trainingCity]').trigger('keyup');
          }, 0);
        } else {
          $scope.formData.trainingCity = city;
          $scope.formData.trainingState = state;
          $timeout(function() {
            angular.element('[name=trainingCity]').trigger('keyup');
          }, 10);
          $timeout(function() {
            angular.element('[name=trainingState]').trigger('change');
          }, 20);
        }

      });
    };



    /**
     * Validate Business
     * @method validateBusiness
     * @return
     */
    $scope.validateBusiness = function() {
      fdService.validateBusiness($scope.signupForm.statementDeliveryEmail, $scope.formData.statementDeliveryEmail);
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
     * Description
     * @method getFormattedDate
     * @param {string} date
     * @return {string} mm/dd/yyyy
     */
    $scope.getFormattedDate = function(data) {
      var date = new Date(data);
      var day = ("0" + date.getUTCDate()).slice(-2);
      var month = ("0" + (date.getMonth() + 1)).slice(-2);
      var year = date.getFullYear().toString();
      return month + '/' + day + '/' + year;
    };

    /**
     * submit setup form
     * @method submitForm
     */
    $scope.submitForm = function() {

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

      $scope.form_error = false;
      $scope.clickedSubmit = true;

      var advancedPreferences = {
        statementDeliveryType: $scope.formData.statementDeliveryType,
        statementType: $scope.formData.statementType,
        statementEmailAddress: $scope.formData.statementDeliveryEmail,
        form1099Electronically: $scope.formData.electronic1099,
        form1099ToEmail: $scope.formData.electronic1099Email,
        emailAddressFor1099k: $scope.formData.emailAddressFor1099k,
        chargeBack: $scope.formData.chargebackAddress,
        chargeBackDeliveryType: $scope.formData.chargebackDelivery,
        contactName: $scope.formData.trainingContactName,
        contactPhone: $scope.formData.trainingContactPhone,
        fax: $scope.formData.faxNumber,
        trainingProvider: $scope.formData.trainingProvider,
        preferredTrainingFrom: $scope.formData.preferredTrainingTime.split('-')[0],
        preferredTrainingTo: $scope.formData.preferredTrainingTime.split('-')[1],
        thirdPartyProcessor: $scope.formData.thirdPartyProcessor,
      };

      if ($scope.formData.thirdPartyProcessorName) {
        advancedPreferences.thirdPartyProcessorName = $scope.formData.thirdPartyProcessorName;
      }
      if ($scope.formData.thirdPartyProcessorSoftware) {
        advancedPreferences.thirdPartyProcessorSoftware = $scope.formData.thirdPartyProcessorSoftware;
      }

      var data_to_send = {
        advancedPreferences: advancedPreferences
      };
      var orderId = fdService.getOrderId();

      fdService.postAccountPreferences(data_to_send, orderId)
        .success(function(data, status, headers, config) {
          $scope.clickedSubmit = false;
          $location.path('/signup/terms');
        })
        .error(function(data, status, headers, config) {
          $scope.clickedSubmit = false;
        });
    };
    /**
     * Validate 1099k Email Address
     * @method validate1099kEmail
     * @return
     */
    $scope.validate1099kEmail = function() {
      fdService.validateBusiness($scope.signupForm.emailAddressFor1099k, $scope.formData.emailAddressFor1099k);
    };


    ///////////////// MAIN ////////////////////////////////
    _init();
  }
]);