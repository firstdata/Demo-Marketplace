/**
 * SignUp Controller
 */
app.controller('SignupCtrl', ['$scope', '$rootScope', '$filter', '$location', 'fdService','$timeout', '$anchorScroll', 'CONST',
    function ($scope, $rootScope, $filter, $location, fdService, $timeout, $anchorScroll, CONST) {

  /**
   * Init function
   * @private
   */
  var _init = function(){

    var orderId = fdService.getOrderId();
    var cart = fdService.getOrderedCart(orderId);

    $rootScope.body_id = 'signup';
    $rootScope.bodyClass = 'signup';
    $scope.tinError = false;
    $scope.tinCount = 1;
    $scope.bankErrorCount = 0;
    $scope.bankError = false;
    $scope.bankErrorServerFails=false;
    $scope.bankCheck = false;

    //set category details
    $scope.categoryDetails = fdService.getCategoryFromSession();
    $scope.categoryName = fdService.getCategoryFromSession().name;

    $scope.form_error = false;
    $scope.states_list = CONST.STATES;
    $scope.formData = {};
    $scope.formData.DBA_NAME = cart.shippingAddress.company_name;
    $scope.formData.business_address1 = cart.shippingAddress.address1;
    $scope.formData.business_address2 = cart.shippingAddress.address2;
    $scope.formData.business_address_zip = cart.shippingAddress.zip;
    $scope.formData.business_address_city = cart.shippingAddress.city;
    $scope.formData.business_address_state = cart.shippingAddress.state;
    $scope.formData.email = cart.shippingAddress.email;
    $scope.formData.businessPhone = cart.shippingAddress.phone;
    $scope.formData.name = cart.shippingAddress.name;

    if(!$scope.formData.business_address_city || !$scope.formData.business_address_state)
    {
      $scope.lookupBusinessZip();
    }

    angular.element('#LEGAL_BUSINESS_NAME_SAME_AS_DBA').focus().parent().addClass('focused');

    if(fdService.getTransactionInfo().annualVolume){
      $scope.formData.annualVolume = fdService.getTransactionInfo().annualVolume;
    }
    if(fdService.getTransactionInfo().averageTicket){
      $scope.formData.TYPICAL_SALE_AMOUNT = fdService.getTransactionInfo().averageTicket;
    }
    if(fdService.getTransactionInfo().highestTicket){
      $scope.formData.ANTICIPATED_HIGHEST_TICKET_SALE = fdService.getTransactionInfo().highestTicket;
    }
    $scope.mcc_codes = [];

    $scope.fullNamePattern = (/^([a-zA-Z]{2,24})+\s([a-zA-Z]{2,24})+$/);
    $scope.emailPattern = (/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)?(\.(AERO|INT|GG|GH|GI|GL|GM|GN|GP|GQ|GR|GS|JOBS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|MIL|ID|IE|IL|IM|IN|IO|IQ|IR|IS|IT|MOBI|JE|JM|JO|JP|KE|KG|KH|KI|KM|KN|MUSEUM|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|NAME|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|NET|MG|MH|MK|ML|MM|MN|MO|MP|MQ|MR|ORG|MS|MT|MU|MV|MW|MX|MY|MZ|NA|NC|PRO|NE|NF|NG|NI|NL|NO|NP|NR|NU|NZ|TEL|OM|PA|PE|PF|PG|PH|PK|PL|PM|PN|ASIA|TRAVEL|PR|PS|PT|PW|PY|QA|RE|RO|RS|RU|AC|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|AD|SK|SL|SM|SN|SO|SR|ST|SU|SV|SY|AE|SZ|TC|TD|TF|TG|TH|TJ|TK|TL|TM|AF|TN|TO|TP|TR|TT|TV|TW|TZ|UA|UG|AG|UK|UM|US|UY|UZ|VA|VC|VE|VG|VI|AI|VN|VU|WF|WS|YE|YT|YU|ZA|ZM|AL|AM|AN|BIZ|AO|AQ|AR|AS|AT|AU|AW|AX|AZ|BA|CAT|BB|BD|BE|BF|BG|BH|BI|BJ|BM|BN|COM|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CC|COOP|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|EDU|CR|CU|CV|CX|CY|CZ|DE|DJ|DK|DM|GOV|DO|DZ|EC|EE|EG|ER|ES|ET|EU|FI|INFO|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|aero|int|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|jobs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|mil|id|ie|il|im|in|io|iq|ir|is|it|mobi|je|jm|jo|jp|ke|kg|kh|ki|km|kn|museum|kp|kr|kw|ky|kz|la|lb|lc|li|lk|name|lr|ls|lt|lu|lv|ly|ma|mc|md|me|net|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|org|ms|mt|mu|mv|mw|mx|my|mz|na|nc|pro|ne|nf|ng|ni|nl|no|np|nr|nu|nz|tel|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|asia|travel|pr|ps|pt|pw|py|qa|re|ro|rs|ru|ac|rw|sa|sb|sc|sd|se|sg|sh|si|sj|ad|sk|sl|sm|sn|so|sr|st|su|sv|sy|ae|sz|tc|td|tf|tg|th|tj|tk|tl|tm|af|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|ag|uk|um|us|uy|uz|va|vc|ve|vg|vi|ai|vn|vu|wf|ws|ye|yt|yu|za|zm|al|am|an|biz|ao|aq|ar|as|at|au|aw|ax|az|ba|cat|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|com|bo|br|bs|bt|bv|bw|by|bz|ca|cc|coop|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|edu|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|gov|do|dz|ec|ee|eg|er|es|et|eu|fi|info|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf))$/);
    $scope.phoneNumberPattern = (/^\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}$/);
    $scope.ssnPattern = (/^[0-9]{3}-[0-9]{2}-[0-9]{4}$/);
    $scope.streetAddressPattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
    $scope.apartmentPattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
    $scope.cityPattern = (/^[a-zA-Z\s]*$/);
    $scope.zipPattern =(/^[0-9]{5}$/);
    $scope.dbaNamePattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
    //$scope.dbaNamePattern = (/^[a-zA-Z0-9',\s]*$/);
    $scope.einPattern = (/^[0-9]{9}$/);
    $scope.routingNumberPattern = (/^[0-9]{9}$/);
    $scope.numberPattern = (/^[0-9]*$/);
    $scope.urlPattern = (/^((((http(s)?):\/\/)|([www\.]|[WWW\.]))?(?!\.)([a-zA-Z0-9\-]*)\.?([a-zA-Z0-9\-]*)\.(com|org|net|mil|edu|biz|info|us|cc|co|COM|ORG|NET|MIL|EDU|BIZ|INFO|US|CC|CO)(\.[a-z]{1,3})?)((\/?[^?]*?)\?.*)?$/);
    $scope.today = new Date();
    $scope.thisYear = $scope.today.getFullYear();
    $scope.thisMonth = $scope.today.getMonth() + 1;
    $scope.titles = ["Owner","Partner","President","Vice President","Member LLC","Secretary","Treasurer","CEO","CFO","COO"];

    $timeout(function() {
      angular.forEach($scope.signupForm.$error, function (field, key) {
        angular.forEach(field, function(errorField){
          if (errorField.$viewValue) {
            errorField.$setTouched();
          }
        })
      });

    }, 0);

    // Get MCC Codes
    fdService.getMccCodes()
      .success(function(data, status, headers, config) {
        $scope.mccCodes = data;
      })
      .error(function(data, status, headers, config) {
        console.log('error')
      });

    //Init percent values
    $scope.percentValues = (function() {
      var tempArr = [];
      for (var i = 0; i <= 100; i++){
        tempArr.push(i);
      }
      return tempArr;
    })();

  };

  /**
   * Check if total percentage is valid
   * @return {boolean}
   */
  var isTotalValid = function() {
    var a = parseInt($scope.formData.FACE_TO_FACE);
    var b = parseInt($scope.formData.PHONE_OR_EMAIL);
    var c = parseInt($scope.formData.INTERNET_PAY);
    return a + b + c === 100
  };

  /**
   * Calculate remain percent values
   * @param {number} input1
   * @param {number} input2
   * @param {number} input3
   */
  var calcRemainingValues =  function(input1, input2, input3) {
    if ($scope.formData[input1]) {
      if (!$scope.formData[input2] && !$scope.formData[input3]) return;//return if remaining 2 fields still empty
      if ($scope.formData[input2] && $scope.formData[input3]) {//Set form validity
        $scope.signupForm.PHONE_OR_EMAIL.$setValidity("total", isTotalValid());
        return;
      }
      if ($scope.formData[input2])
        $scope.formData[input3] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]))).toString();
      if ($scope.formData[input3])
        $scope.formData[input2] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]))).toString();
    } else {
      $scope.formData[input2] = undefined;
      $scope.formData[input3] = undefined;

    }
    $timeout(function() {
      angular.element('[name='+input2+']').trigger('change');
      angular.element('[name='+input3+']').trigger('change');
    }, 1);
  };

  /**
   * check if delivery total percent is 100
   * @return {boolean}
   */
  var deliveryTotal = function() {
    var a = parseInt($scope.formData.DELIVERY0_7);
    var b = parseInt($scope.formData.DELIVERY8_14);
    var c = parseInt($scope.formData.DELIVERY15_30);
    var d = parseInt($scope.formData.DELIVERY31);
    return a + b + c + d === 100
  };

  /**
   * Calculate delivery values
   * @param input1
   * @param input2
   * @param input3
   * @param input4
   */
  var calcDeliveryValues =  function(input1, input2, input3, input4) {
    if ($scope.formData[input1]) {
      if (!$scope.formData[input2] && !$scope.formData[input3] && !$scope.formData[input4]) return;//return if remaining 3 fields still empty
      if ($scope.formData[input2] && $scope.formData[input3] && $scope.formData[input4]) {//Set form validity if total not equal to 100
        $scope.signupForm.DELIVERY31.$setValidity("total", deliveryTotal());
        return;
      }
      if ($scope.formData[input2]) {
        if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) > 100)){
          $scope.signupForm.DELIVERY31.$setValidity("total", false);
          return;
        }
        if($scope.formData[input3]) {
          if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input3]) > 100)){
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
            return;
          }
          $scope.formData[input4] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input3]))).toString();
        }
        if($scope.formData[input4]){
          if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input4]) > 100)){
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
            return;
          }
          $scope.formData[input3] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input4]))).toString();
        }
      }
      if ($scope.formData[input3]) {
        if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) > 100)){
          $scope.signupForm.DELIVERY31.$setValidity("total", false);
          return;
        }
        if($scope.formData[input2]) {
          if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input3]) > 100)){
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
            return;
          }
          $scope.formData[input4] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input3]))).toString();
        }
        if($scope.formData[input4]){
          if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) + parseInt($scope.formData[input4]) > 100)){
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
            return;
          }
          $scope.formData[input2] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) + parseInt($scope.formData[input4]))).toString();
        }
      }
      if ($scope.formData[input4]) {
        if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input4]) > 100)){
          $scope.signupForm.DELIVERY31.$setValidity("total", false);
          return;
        }
        if($scope.formData[input2]) {
          if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input4]) > 100)){
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
            return;
          }
          $scope.formData[input3] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input4]))).toString();
        }
        if($scope.formData[input3]){
          if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) + parseInt($scope.formData[input4]) > 100)){
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
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
    $timeout(function() {
      angular.element('[name='+input2+']').trigger('change');
      angular.element('[name='+input3+']').trigger('change');
      angular.element('[name='+input4+']').trigger('change');
    }, 1);
  };

  /**
   * Scroll to anchor
   * @param anc
   */
  $scope.gotoAnchor = function(anc){
    $timeout(function() {
      $location.hash(anc);
      $anchorScroll();
    });
  };

  /**
   * Get city and state by zip code
   */
  $scope.lookupZip = function(){
    if (!$scope.formData.zip) {
      return;
    }

    fdService.lookupByZip($scope.formData.zip, function(city, state){
      if (!city) {
        $scope.formData.city = "";
        $scope.formData.state = "";
        $timeout(function() {
           angular.element('[name=state]').trigger('change');
           angular.element('[name=city]').trigger('keyup');
        }, 0);
      }
      if (!state) {
        $scope.formData.city = "";
        $scope.formData.state = "";
        $timeout(function() {
           angular.element('[name=state]').trigger('change');
           angular.element('[name=city]').trigger('keyup');
           angular.element('[name=city]').trigger('keyup');
        }, 0);
      }
      else{
          $scope.formData.city = city;
          $scope.formData.state = state;
          $timeout(function() {
             angular.element('[name=state]').trigger('change');
             angular.element('[name=city]').trigger('keyup');
          });
      }
    });
  };

  /**
   * get  city and state by business zip code
   */
  $scope.lookupBusinessZip = function(){
    if (!$scope.formData.business_address_zip) {
      return;
    }

    fdService.lookupByZip($scope.formData.business_address_zip, function(city, state){
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
      }
      else{
          $scope.formData.business_address_city = city;
          $scope.formData.business_address_state = state;
         $timeout(function() {
           angular.element('[name=business_address_city]').trigger('keyup');
          },10);
         $timeout(function() {
            angular.element('[name=business_address_state]').trigger('change');
          },20);
      }
    });
  };

  /**
   * Submit signup form
   */
  $scope.formSubmit = function(){
    if($scope.formData.name){
        $scope.formData.firstName = $scope.formData.name.split(" ")[0];
        $scope.formData.lastName = $scope.formData.name.split(" ")[1];
    }
    if($scope.formData.LEGAL_BUSINESS_NAME_SAME_AS_DBA != '0'){
        $scope.formData.legal_business_name = $scope.formData.DBA_NAME;
    }
    if($scope.formData.TAX_FILING_NAME_SAME_AS_BUSINESS_LEGAL_NAME != '0'){
        $scope.formData.tax_filing_name = $scope.formData.legal_business_name;
    }
    if($scope.formData.HOW_BUSINESS_FILES_TAXES != 'business_tax_id'){
        $scope.formData.EIN = $scope.formData.SocialSecurityNumber;
    }
    if($scope.formData.ORGANIZATION_TYPE == 'G' && $scope.formData.FOREIGN_OWNERSHIP == 'N'){
        $scope.formData.FOREIGN_OWNERSHIP = 'G';
    }
    if($scope.formData.ORGANIZATION_TYPE == 'T' && $scope.formData.FOREIGN_OWNERSHIP == 'N'){
        $scope.formData.FOREIGN_OWNERSHIP = 'D';
    }
    if($scope.formData.YEAR_BUSINESS_STARTED == $scope.thisYear && $scope.formData.MONTH_BUSINESS_STARTED > $scope.thisMonth) {
      $scope.signupForm.MONTH_BUSINESS_STARTED.$invalid = true;
      $scope.signupForm.$valid = false;
    }

    $scope.formData.dob = $scope.dob_year + '-' + $scope.dob_month + '-' + $scope.dob_day;
    var calculateAge = new Date($scope.dob_year,$scope.dob_month,$scope.dob_day );

    var ageDifMs = Date.now() - calculateAge.getTime();
    var ageDate = new Date(ageDifMs);
    var age =  Math.abs(ageDate.getUTCFullYear() - 1970);

    var a = parseInt($scope.formData.FACE_TO_FACE);
    var b = parseInt($scope.formData.PHONE_OR_EMAIL);
    var c = parseInt($scope.formData.INTERNET_PAY); // Considering Internet value in the Sum for Validation, Total must be 100%

    if(a+b+c != 100){
        $scope.signupForm.FACE_TO_FACE.$invalid = true;
        $scope.signupForm.$valid = false;
    }

    if(age<18){
         $scope.signupForm.dob_month.$invalid = true;
         $scope.signupForm.$valid = false;
    }

    if (!$scope.signupForm.$valid) {
      $scope.form_error = true;
      $scope.gotoAnchor('form-error');
      angular.forEach($scope.signupForm.$error, function (field) {
        angular.forEach(field, function(errorField){
            errorField.$setTouched();
        })
      });

      return;
    } else{
        $scope.form_error = false;
        $scope.clickedSubmit = true;
        $scope.tinError= false;
        $scope.submitSignupForm();
      }
  };

  /**
   * Callback when Face To Face changed
   * @param tag
   */
  $scope.faceToFaceChange = function(tag) {
    if (tag == 0) {
      if ($scope.formData.FACE_TO_FACE){
        calcRemainingValues('FACE_TO_FACE','PHONE_OR_EMAIL','INTERNET_PAY');
      }
    } else if (tag == 1) {
      if ($scope.formData.PHONE_OR_EMAIL){
        calcRemainingValues('PHONE_OR_EMAIL','FACE_TO_FACE','INTERNET_PAY');
      }
    } else if (tag == 2) {
      if ($scope.formData.INTERNET_PAY) {
        calcRemainingValues('INTERNET_PAY','FACE_TO_FACE','PHONE_OR_EMAIL');
      }
    }
  };

  /**
   * Check if business started date valid
   */
  $scope.checkBsnMo = function(){
    if($scope.formData.YEAR_BUSINESS_STARTED == $scope.thisYear && $scope.formData.MONTH_BUSINESS_STARTED > $scope.thisMonth) {
      $scope.signupForm.MONTH_BUSINESS_STARTED.$setValidity("excluded", false);
    } else {
      $scope.signupForm.MONTH_BUSINESS_STARTED.$setValidity("excluded", true);
    }
  };

  /**
   * Check if How is the merchant's name displayed checkbox
   */
  $scope.checkCheckbox = function(){
    $scope.merchantDisplayedArray = [];
      angular.forEach($scope.formData.merchantsNameDisplayed, function (value, key) {
          if(value == true){
            $scope.merchantDisplayedArray.push(key);
          }
      });
      if ($scope.merchantDisplayedArray.length > 0){
          $scope.merchantDisplayed = $scope.merchantDisplayedArray.toString();
      }
      else{
        $scope.merchantDisplayed = '';
      }
  };

  /**
   * Change delivery timeframe
   * @param tag
   */
  $scope.changeDeliveryTimeFrame = function(tag) {
    $scope.signupForm.DELIVERY31.$setValidity("total", true);
    if (tag == 0) {
      if ($scope.formData.DELIVERY0_7)
         calcDeliveryValues('DELIVERY0_7','DELIVERY8_14','DELIVERY15_30','DELIVERY31');
    }
    else if (tag == 1) {
      if ($scope.formData.DELIVERY8_14)
           calcDeliveryValues('DELIVERY8_14','DELIVERY0_7','DELIVERY15_30','DELIVERY31');
    }
    else if (tag == 2) {
      if ($scope.formData.DELIVERY15_30)
           calcDeliveryValues('DELIVERY15_30','DELIVERY0_7','DELIVERY8_14','DELIVERY31');
    }
    else if (tag == 3) {
      if ($scope.formData.DELIVERY31)
           calcDeliveryValues('DELIVERY31','DELIVERY0_7','DELIVERY8_14','DELIVERY15_30');
    }
  };

  /**
   * Submit SignUp Form
   */
  $scope.submitSignupForm = function(){
      $scope.updatedFormData = {};
      $scope.updatedFormData.merchantContactInformation = [];
      $scope.updatedFormData.merchantAttributesRequestInformation = [];
      $scope.updatedFormData.contactsInformation = [];
      $scope.updatedFormData.employeeInformation = [];

      $scope.updatedFormData.merchantReferenceCode = 'MERC';
      $scope.updatedFormData.merchantType = 'Retail';
      $scope.updatedFormData.dbaName = $scope.formData.DBA_NAME;
      $scope.updatedFormData.legalName = $scope.formData.legal_business_name;
      $scope.updatedFormData.taxId = $scope.formData.EIN;
      $scope.updatedFormData.sicCode = ' ';
      $scope.updatedFormData.yearsInBusiness = $scope.formData.YEAR_BUSINESS_STARTED + '-' + $scope.formData.MONTH_BUSINESS_STARTED + '-01';
      $scope.updatedFormData.yearsAtLocation = $scope.formData.YEAR_BUSINESS_STARTED + '-' + $scope.formData.MONTH_BUSINESS_STARTED + '-01';
      $scope.updatedFormData.productDescription = "";
      $scope.updatedFormData.createdByCoId = 10;
      $scope.updatedFormData.billReferenceCode = 'O';
      $scope.updatedFormData.organizationTypeReferenceCode = $scope.formData.ORGANIZATION_TYPE;

      var orderId = fdService.getOrderId();

      $scope.updatedFormData.employeeInformation.push({
          'lastName': $scope.formData.lastName,
          'firstName':  $scope.formData.firstName,
          'ssn' : $scope.formData.SocialSecurityNumber,
          'dateOfBirth' : $scope.formData.dob,
          'title' : $scope.formData.title1,
          'homeContactId' : '111'
      });

      $scope.updatedFormData.merchantAttributesRequestInformation.push({
          "orderId":orderId,
          "highestTicket": $scope.formData.ANTICIPATED_HIGHEST_TICKET_SALE,
          "faceToFace": $scope.formData.FACE_TO_FACE,
          "phoneOrEmail": $scope.formData.PHONE_OR_EMAIL,
          "internet":$scope.formData.INTERNET_PAY,/*Added new field to hold internet percent*/
          "businessWebsite": $scope.formData.BUSINESS_WEBSITE,
          "typicalSaleAmount": $scope.formData.TYPICAL_SALE_AMOUNT,
          "stateOfIncorporation": $scope.formData.INCORPORATION_STATE,
          "IRSFilingName": $scope.formData.tax_filing_name,
          "IRSForeignIndicator": $scope.formData.FOREIGN_OWNERSHIP,
          "guid":''
      });

      $scope.updatedFormData.merchantContactInformation.push({
          'contactType': 'LOCATION',
          'state': $scope.formData.state,
          'postalCode':  $scope.formData.zip,
          'address1': $scope.formData.Address1,
          'address2': $scope.formData.Address2,
          'email': $scope.formData.email,
          'url': $scope.formData.BUSINESS_WEBSITE,
          'mobile': $scope.formData.phone,
          'voice': $scope.formData.businessPhone,
          'country': 'USA',
          'name': $scope.formData.legal_business_name,
          'city': $scope.formData.city
      },{
          'contactType': 'CORPORATE',
          'state': $scope.formData.business_address_state,
          'postalCode':  $scope.formData.business_address_zip,
          'address1': $scope.formData.business_address1,
          'address2': $scope.formData.business_address2,
          'mobile': $scope.formData.phone,
          'voice': $scope.formData.businessPhone,
          'country': 'USA',
          'name': $scope.formData.legal_business_name,
          'city': $scope.formData.business_address_city,
          'email': $scope.formData.email,
          'url': $scope.formData.BUSINESS_WEBSITE
      });

      $scope.updatedFormData.contactsInformation.push({
          "instName": $scope.bankName,
          'abaNumber': $scope.formData.ROUTING_NUMBER,
          'accountNumber': $scope.formData.ACCOUNT_NUMBER,
          'ordinal': 2
      });

      fdService.submitMerchantApplication($scope.updatedFormData)
        .success(function(data, status, headers, config) {
          $location.path('/terms');
          $scope.clickedSubmit = false;
        })
        .error(function(data, status, headers, config) {
          $scope.clickedSubmit = false;
          console.log('error');
        });
  };

  ///////////////// MAIN ////////////////////////////////

  _init();

}]);


