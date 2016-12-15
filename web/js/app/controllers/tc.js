/**
 * Terms & Conditions Controller
 */
app.controller('TCCtrl', ['$scope', '$rootScope', '$filter', '$location', '$routeParams','$document', 'fdService', '$window', '$timeout',
    function ($scope, $rootScope, $filter, $location, $routeParams,$document, fdService, $window, $timeout) {

  /**
   * Init function
   * @private
   */
  var _init = function(){
    $scope.orderId = fdService.getOrderId();

    // Redirect to the front page if came here from the thank you page
    if ('thankyou' == $rootScope.refUrl) {
      $location.path('/');
    }

    $scope.resetProductList();
    $scope.isLeasedAgreement = false;

    $scope.signature1Empty = true;
    $scope.signature2Empty = true;
    $scope.signature4Empty = true;
    $scope.signature6Empty = true;
    $scope.signature7Empty = true;
    $scope.signature8Empty = true;
    $scope.signature1Date = null;
    $scope.signature6Date = null;
    $scope.signature7Date = null;

    $scope.agreementClicked= false;

    $rootScope.body_id = 'tc';
    $rootScope.bodyClass = 'tc';

    $scope.interchangeScheduleVersion = "";

    $scope.sectionsOpen = {
      1: true,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
      8: false,
      9: false,
      10: false,
      11: false,
    };

    fdService.getMerchantInfo($scope.orderId)
      .success(function(data) {
        $scope.assignMerchantInfo(data);
      })
      .error(function(data, status, headers, config) {
        $location.path('400');
        console.log('error')
      });

    Number.prototype.formatMoney = function(c, d, t){
      var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
      return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };

    Number.prototype.formatRateFee = function(){
      var n = Math.round(this * 10000);
      if(n == 0) {
        return this.toFixed(2);
      } else if(n % 100 == 0) {
        return this.toFixed(2);
      } else if(n % 10 == 0) {
        return this.toFixed(3);
      } else {
        return this.toFixed(4);
      }
    };
  };

  /**
   * mask digit
   * @param value
   * @return {string}
   */
  $scope.maskDigit = function(value){
    if(value){
      var mask="XXXXXX"+value.substring(6);
      return mask;
    }
  }

  /**
   * Round number
   * @param num
   * @return {number}
   */
  $scope.round=function(num) {
    return Math.round(num * 100) / 100;
  }

  /**
   * Reset products list
   */
  $scope.resetProductList = function(){
    $scope.productList = {
        oneTotal: 0,
        multiTotal: 0,
        one: [],
        multi: []
    };
  };

  /**
   * Check if form is not valid
   * @return {boolean}
   */
  $scope.isFormNotValid=function(){

     if($scope.signature1Empty || $scope.signature8Empty || ($scope.isLeasedAgreement && $scope.signature6Empty)) {
       return true
     }
     return false;
   }

  /**
   * Submit Terms & Conditions
   */
  $scope.submitTC = function(){
    if ($scope.isFormNotValid()) return;
    $scope.clickedTCSubmit = true;
    var canvas = $document[0].getElementById('signature1');//jQuery('#signature1')[0];

    var canvas4 = $document[0].getElementById('signature4');
    var canvas6 = $document[0].getElementById('signature6');
    var canvas7 = $document[0].getElementById('signature7');
    var canvas8 = $document[0].getElementById('signature8');

    var pngBin = canvas.toDataURL().replace(/^data:image\/(png);base64,/, "");

    var pngBin4 = canvas4.toDataURL().replace(/^data:image\/(png);base64,/, "");
    var pngBin6 = canvas6.toDataURL().replace(/^data:image\/(png);base64,/, "");
    var pngBin7 = canvas7.toDataURL().replace(/^data:image\/(png);base64,/, "");
    var pngBin8 = canvas8.toDataURL().replace(/^data:image\/(png);base64,/, "");

    var orderId = fdService.getOrderId();

    if (!orderId) {
      alert('no order id!!!');
      $scope.clickedTCSubmit = false;
      return;
    }

    var sdata = {
        "MPAMerchantSignaturePrincipal":pngBin,
         orderId: orderId,
    };

    if(!$scope.signature4Empty){
         sdata['PersonalGuaranteeSignaturePrincipal']=pngBin4;
    }

    if(!$scope.signature6Empty){
        sdata['LeaseAgreementSignature']=pngBin6;
    }

    if(!$scope.signature7Empty){
        sdata['LeaseAgreementPersonalGuaranteeSignature']=pngBin7;
    }

    if(!$scope.signature8Empty){
         sdata['ConfirmationPageSignature']=pngBin8;
    }

    fdService.submitSignature(sdata)
      .success(function(data, status, headers, config) {
        $location.path('/thankyou');
        fdService.clearOrderId();
        fdService.clearSignupData();
        fdService.clearCart();
        fdService.clearCategoryFromSession();
        fdService.clearTransactionInfo();
        fdService.clearOrderedCart();
        fdService.clearAcquiringPricing();
        fdService.clearEquipmentPricing();
        $rootScope.cart = fdService.getCart();
      })
      .error(function(data, status, headers, config) {
        alert('error')
        console.log('error')
         $scope.clickedTCSubmit = false;
      });
  };

   $scope.merchantBean = {};
   $scope.merchantBean.firstName='';
   $scope.merchantBean.lastName='';
   $scope.merchantBean.merchantBusinessBean = {};
   $scope.merchantBean.leaseEquipment = [];
   $scope.merchantBean.equipment = [];
   $scope.merchantBean.organizationTypeReferenceCode='';
   $scope.isLogoVisible = false;
   $scope.isTinTypeSsn = false;
   $scope.isTitleOther = false;
   $scope.isAmexOptBlue = true;
   $scope.equipmentPurchase = 0;
   $scope.totalAmountStartUpFees = 0;

   $scope.assignMerchantInfo = function(data) {

    if(angular.isUndefined(data)) {
      data = {};
    }

    if(!angular.isUndefined(data.dynamicVersionInfo)) {
     for(var i=0;i<data.dynamicVersionInfo.length;i++) {
       if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='PROCESSOR'){
         $scope.merchantBean.processor = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='PROCESSOR_URL'){
         $scope.merchantBean.processorUrl = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='PROCESSOR_ADDRESS'){
         $scope.merchantBean.processorAddress = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='PROCESSOR_CUSTOMER_SERVICE'){
         $scope.merchantBean.processorCustomerService = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='SPONSOR_BANK'){
         $scope.merchantBean.sponsorBank = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='SPONSOR_BANK_ADDRESS'){
         $scope.merchantBean.sponsorBankAddress = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='SPONSOR_BANK_CUST_SERV_NUMBER'){
         $scope.merchantBean.sponsorBankCustServNumber = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='S3_FILE_PATH_FOR_TERMS'){
         $scope.merchantBean.s3PathForTerms = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='TEMPLATE_PATH'){
         $scope.merchantBean.templatePath = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='SERVICERS_TITLE'){
         $scope.merchantBean.serviceTitle = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='SERVICERS_BODY'){
         $scope.merchantBean.serviceBody = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='PERSONAL_GUARANTY'){
         $scope.merchantBean.personalGuaranty = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='CONFIRMATION_VERSION'){
         $scope.merchantBean.pgVersion = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='MPA_VERSION'){
         $scope.merchantBean.version = data.dynamicVersionInfo[i].value;
       }
     }
    }


    if(!angular.isUndefined(data.emvEnabled)) {
      $scope.emvEnabled = data.emvEnabled;
    }
    if(!angular.isUndefined(data.debitEnabled)) {
      $scope.debitEnabled = data.debitEnabled;
    }
    if(!angular.isUndefined(data.amexEnabled)) {
      $scope.amexEnabled = data.amexEnabled;
    }
    if(!angular.isUndefined(data.discoverEnabled)) {
      $scope.discoverEnabled = data.discoverEnabled;
    }
    if(!angular.isUndefined(data.legalName)) {
      $scope.merchantBean.merchantBusinessBean.legalDbaName = data.legalName;
    }
    //===For Section 1 Starts
    if(!angular.isUndefined(data.dbaName)) {
      $scope.merchantBean.merchantBusinessBean.dbaName = data.dbaName;
    }


    if(!angular.isUndefined(data.employeeInformation)) {
      for(var i=0;i<data.employeeInformation.length;i++) {
        if(!(angular.isUndefined(data.employeeInformation[i].firstName)||(data.employeeInformation[i].firstName ==null ))){
          $scope.merchantBean.firstName = data.employeeInformation[i].firstName;
        }
        if(!(angular.isUndefined(data.employeeInformation[i].lastName)||(data.employeeInformation[i].lastName ==null ))){
          $scope.merchantBean.lastName = data.employeeInformation[i].lastName;
        }
        if(!angular.isUndefined(data.employeeInformation[i].ssnMasked)) {
          $scope.merchantBean.merchantBusinessBean.socialSecurityNumber = data.employeeInformation[i].ssnMasked;
        }
        if(!angular.isUndefined(data.employeeInformation[i].dateOfBirth)) {
          $scope.merchantBean.dateOfBirth = $filter('date')(data.employeeInformation[i].dateOfBirth,'XX-XX-yyyy');
        }
        if(!angular.isUndefined(data.employeeInformation[i].ssnMasked) &&
            !angular.isUndefined(data.taxIdMask) &&
            data.employeeInformation[i].ssnMasked == data.taxIdMask) {
          $scope.isTinTypeSsn = true;
        }
        if(!(angular.isUndefined(data.employeeInformation[i].title)||(data.employeeInformation[i].title ==null ))){
          if(data.employeeInformation[i].title != 'OWNER'
            && data.employeeInformation[i].title != 'PARTNER'
            && data.employeeInformation[i].title != 'PRESIDENT'
            && data.employeeInformation[i].title != 'VICE PRESIDENT'
            && data.employeeInformation[i].title != 'MEMBER LLC') {
              $scope.isTitleOther = true;
            }
            $scope.merchantBean.title = data.employeeInformation[i].title;
        }
      }
    }
    if(!angular.isUndefined(data.taxIdMask))
      $scope.merchantBean.merchantBusinessBean.employerIdNumberTax = data.taxIdMask;
    if(!angular.isUndefined(data.contactsInformation)) {
      for(var i=0;i<data.contactsInformation.length;i++) {
        if(!angular.isUndefined(data.contactsInformation[i].accountNumberMasked))
          $scope.merchantBean.accountNumber = data.contactsInformation[i].accountNumberMasked;
        if(!angular.isUndefined(data.contactsInformation[i].abaMasked))
          $scope.merchantBean.abaNumber = data.contactsInformation[i].abaMasked;
        if(!angular.isUndefined(data.contactsInformation[i].instName))
          $scope.merchantBean.instName = data.contactsInformation[i].instName;
      }
    }
    if(!angular.isUndefined(data.merchantContactInformation)) {
      for(var i=0;i<data.merchantContactInformation.length;i++) {
        if(data.merchantContactInformation[i].contactType == "CORPORATE") {
          $scope.merchantBean.merchantBusinessBean.businessAddress = data.merchantContactInformation[i].address1;
          $scope.merchantBean.merchantBusinessBean.businessAptSuite = data.merchantContactInformation[i].address2;
          $scope.merchantBean.merchantBusinessBean.businessCity = data.merchantContactInformation[i].city;
          $scope.merchantBean.merchantBusinessBean.businessState = data.merchantContactInformation[i].state;
          $scope.merchantBean.merchantBusinessBean.businessZipcode = data.merchantContactInformation[i].postalCode;
          $scope.merchantBean.merchantBusinessBean.businessPhoneNumber = data.merchantContactInformation[i].voice;
          $scope.merchantBean.merchantBusinessBean.emailAddress = data.merchantContactInformation[i].email;
          $scope.merchantBean.merchantBusinessBean.businessCountry = data.merchantContactInformation[i].country;
          $scope.merchantBean.merchantBusinessBean.phoneNumber = data.merchantContactInformation[i].mobile;
          $scope.merchantBean.merchantBusinessBean.url = data.merchantContactInformation[i].url;
        }
        if(data.merchantContactInformation[i].contactType == "LOCATION") {
          $scope.merchantBean.homeAddress = data.merchantContactInformation[i].address1;
          $scope.merchantBean.homeAddress2 = data.merchantContactInformation[i].address2;
          $scope.merchantBean.city = data.merchantContactInformation[i].city;
          $scope.merchantBean.country = data.merchantContactInformation[i].country;
          $scope.merchantBean.state = data.merchantContactInformation[i].state;
          $scope.merchantBean.zipCode = data.merchantContactInformation[i].postalCode;
          $scope.merchantBean.emailAddress = data.merchantContactInformation[i].email;
        }
      }
    }
    //===For Section 1 Ends
    
    //===For Section 2 Starts
    if(!angular.isUndefined(data.merchantAttributesInformation )) {
      for(var i=0;i<data.merchantAttributesInformation.length;i++) {
        if(data.merchantAttributesInformation[i].attrName == "ANNUAL_SALE") {
          
          $scope.merchantBean.merchantBusinessBean.anticipatedSales = data.merchantAttributesInformation[i].attrValue;
          
          if(!isNaN(Number($scope.merchantBean.merchantBusinessBean.anticipatedSales))){

            $scope.merchantBean.totalCash = data.merchantAttributesInformation[i].attrValue;

            if(data.amexEnabled && data.discoverEnabled) {
              if($scope.merchantBean.totalCash >= 1000000){
                $scope.totalAnnualAmericanExpress = data.amexAnnualVolume;
                $scope.totalAnnualMC = Math.round((($scope.merchantBean.totalCash - $scope.totalAnnualAmericanExpress) * 96/100));
                $scope.totalAnnualDiscoverVolume = Math.round(($scope.merchantBean.totalCash - $scope.totalAnnualMC - $scope.totalAnnualAmericanExpress));
                if($scope.totalAnnualAmericanExpress >= 1000000) {
                  $scope.isAmexOptBlue = false;
                }
              } else {
                $scope.totalAnnualMC = Math.round((($scope.merchantBean.totalCash) * 81/100));
                $scope.totalAnnualAmericanExpress = Math.round((($scope.merchantBean.totalCash) * 15/100));
                $scope.totalAnnualDiscoverVolume = ($scope.merchantBean.totalCash - $scope.totalAnnualMC - $scope.totalAnnualAmericanExpress);
              }
            } else if(data.discoverEnabled) {
              $scope.totalAnnualAmericanExpress = 0;
              $scope.totalAnnualMC = Math.round((($scope.merchantBean.totalCash) * 96/100));
              $scope.totalAnnualDiscoverVolume = ($scope.merchantBean.totalCash - $scope.totalAnnualMC);
            } else if(data.amexEnabled) {
              if($scope.merchantBean.totalCash >= 1000000){
                $scope.totalAnnualAmericanExpress = data.amexAnnualVolume;
                $scope.totalAnnualMC = Math.round($scope.merchantBean.totalCash - $scope.totalAnnualAmericanExpress);
                $scope.totalAnnualDiscoverVolume = 0;
                if($scope.totalAnnualAmericanExpress >= 1000000) {
                  $scope.isAmexOptBlue = false;
                }
              } else {
                $scope.totalAnnualMC = Math.round((($scope.merchantBean.totalCash) * 85/100));
                $scope.totalAnnualAmericanExpress = Math.round($scope.merchantBean.totalCash - $scope.totalAnnualMC);
                $scope.totalAnnualDiscoverVolume = 0;
              }
            } else {
              $scope.totalAnnualAmericanExpress = 0;
              $scope.totalAnnualMC = Math.round($scope.merchantBean.totalCash);
              $scope.totalAnnualDiscoverVolume = 0;
            }
          } else {
            console.log('AnticipatedSales is not a number.');
            $scope.merchantBean.totalCash = '';
            $scope.totalAnnualMC = '';
            $scope.totalAnnualDiscoverVolume = '';
          }
          $scope.annualAmexFormatted = $scope.totalAnnualAmericanExpress.formatMoney(2);
          $scope.annualMcVisaFormatted = $scope.totalAnnualMC.formatMoney(2);
          $scope.annualDiscFormatted = $scope.totalAnnualDiscoverVolume.formatMoney(2);
        }
        if(data.merchantAttributesInformation[i].attrName == "HI_TKT") {
          $scope.merchantBean.merchantBusinessBean.hiTicket = parseFloat(data.merchantAttributesInformation[i].attrValue).formatMoney(2);
        }
        if(data.merchantAttributesInformation[i].attrName == "INC_STATE" ) {
          $scope.merchantBean.merchantBusinessBean.stateIncorp  = data.merchantAttributesInformation[i].attrValue;
        }
        if(data.merchantAttributesInformation[i].attrName == "IRS_FRGN_IND"  && data.merchantAttributesInformation[i].attrValue == "A" ) {
          $scope.merchantBean.merchantBusinessBean.isCertified  = true;
        }
        if(data.merchantAttributesInformation[i].attrName == "IRS_FIL_NM" ) {
          $scope.merchantBean.merchantBusinessBean.taxBusinessName = data.merchantAttributesInformation[i].attrValue;
        }
        if(data.merchantAttributesInformation[i].attrName == "SWIPED") {
          $scope.merchantBean.merchantBusinessBean.f2fPercent = data.merchantAttributesInformation[i].attrValue;
        }
        if(data.merchantAttributesInformation[i].attrName == "PHONE") {
          $scope.merchantBean.merchantBusinessBean.motoPercent = Number(data.merchantAttributesInformation[i].attrValue);
        }
        if(data.merchantAttributesInformation[i].attrName == "INTERNET") {
          $scope.merchantBean.merchantBusinessBean.internetPercent = Number(data.merchantAttributesInformation[i].attrValue);
        }
      }
    }

    $scope.merchantBean.merchantBusinessBean.businessType = data.industryType;
    $scope.merchantBean.avgTicket = parseFloat(data.averageTicket).formatMoney(2);
    $scope.merchantBean.createdDate = $filter('date')(data.createdDate,'MM-dd-yyyy');
    //===For Section 2 Ends

    //===For Section 3 Starts
    if(!angular.isUndefined(data.yearsInBusiness)) {
      var offset = (new Date().getTimezoneOffset() + 60)* 60000;
      var dateTime = data.yearsInBusiness;
      $scope.merchantBean.businessYearStarted = $filter('date')(offset + dateTime,'MM-yyyy');
    }
    if(!angular.isUndefined(data.organizationTypeReferenceCode)) {
      $scope.merchantBean.organizationTypeReferenceCode = data.organizationTypeReferenceCode;
    }
    if(!angular.isUndefined(data.productDescription)) {
      $scope.merchantBean.merchantBusinessBean.mccDescription = data.productDescription;
    }

    //===For Section 6 and Lease Starts
    $scope.merchantBean.equipment = data.equipmentList;

    for(var i=0;i<data.equipmentList.length;i++) {
      if(data.equipmentList[i].term == "P") {
        $scope.equipmentPurchase += data.equipmentList[i].unitPrice * data.equipmentList[i].quantity;
      }
    }
    if(!angular.isUndefined(data.equipmentListLease) && data.equipmentListLease != null) {
      $scope.merchantBean.leaseEquipment = data.equipmentListLease;
      $scope.merchantBean.totalMonthlyLeaseCharge = data.equipmentListLease[0].leaseSum;
      $scope.merchantBean.totalCostToLease = data.equipmentListLease[0].totalCostToLease;
      $scope.merchantBean.leaseTerm = data.equipmentListLease[0].leaseTerm;
      $scope.isLeasedAgreement = true;
    }
    //===For Section 6 and Lease Ends

    //=== Section 7 Fee Schedule
    if(!angular.isUndefined(data.productList)) {
        for(var i=0;i<data.productList.length;i++) {

          //===Product Subscriptions (Monthly)
          if(data.productList[i].mpaProductKey == 'cloverServiceFee'){
            $scope.merchantBean.cloverServiceFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'insighticsFee'){
            $scope.merchantBean.insighticsFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'transarmorSolution'){
            $scope.merchantBean.transarmorSolution = data.productList[i].value.formatMoney(2);
          }

          //=== Start-Up Fees
          if(data.productList[i].mpaProductKey == 'applicationFee'){
            $scope.merchantBean.applicationFee = data.productList[i].value.formatMoney(2);
            $scope.totalAmountStartUpFees += parseFloat(data.productList[i].value);
          }
          if(data.productList[i].mpaProductKey == 'programmingFee'){
            $scope.merchantBean.programmingFee = data.productList[i].value.formatMoney(2);
            $scope.totalAmountStartUpFees += parseFloat(data.productList[i].value);
          }
          if(data.productList[i].mpaProductKey ==  'debitStartUp'){
            $scope.merchantBean.debitStartUp = data.productList[i].value.formatMoney(2);
            $scope.totalAmountStartUpFees += parseFloat(data.productList[i].value);
          }

          //=== Compliance Fees
          if(data.productList[i].mpaProductKey == 'monthlySVCFee'){
            $scope.merchantBean.monthlySVCFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'annualComplianceFee'){
            $scope.merchantBean.annualComplianceFee = data.productList[i].value.formatMoney(2);
          }

          //=== Debit Fees
          if(data.productList[i].mpaProductKey == 'bundledDebitRate'){
            $scope.merchantBean.bundledDebitRate = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'bundledDebitFee'){
            $scope.merchantBean.bundledDebitFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'unbundledDebitFee'){
            $scope.merchantBean.unbundledDebitFee = data.productList[i].value.formatRateFee();
          }

          //=== Mobile Payments Solution (Clover Go)
          if(data.productList[i].mpaProductKey == 'fdMobilePaySetupFee' ){
            $scope.merchantBean.fdMobilePaySetupFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'mobilePaySVCFee'){
            $scope.merchantBean.mobilePaySVCFee = data.productList[i].value.formatMoney(2);
          }

          //=== eCommerce/Wireless Solutions
          if(data.productList[i].mpaProductKey == 'payeezySetupFee'){
            $scope.merchantBean.payeezySetupFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'e4monthlyFee'){
            $scope.merchantBean.e4monthlyFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'payeezyWebstoreFee'){
            $scope.merchantBean.payeezyWebstoreFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'eComEpricing'){
            $scope.merchantBean.eComEpricing = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'globalGatewaySetupFee'){
            $scope.merchantBean.globalGatewaySetupFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'internetAuthFee'){
            $scope.merchantBean.internetAuthFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'wirelessAccessFee'){
            $scope.merchantBean.wirelessAccessFee = data.productList[i].value.formatMoney(2);
          }

          //=== Miscellaneous Fees
          if(data.productList[i].mpaProductKey == 'transarmorDataProtection'){
            $scope.merchantBean.transarmorDataProtection = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'pciValidation'){
            $scope.merchantBean.pciValidation = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'busAdvPkg'){
            $scope.merchantBean.busAdvPkg = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'minimumProcessingFee'){
            $scope.merchantBean.minimumProcessingFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'paperStatementFee'){
            $scope.merchantBean.paperStatementFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'chargebackFee'){
            $scope.merchantBean.chargebackFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'achRejectFee'){
            $scope.merchantBean.achRejectFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'batchSettlementFee'){
            $scope.merchantBean.batchSettlementFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'monFundAdv'){
            $scope.merchantBean.monFundAdv = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'avsFee'){
            $scope.merchantBean.avsFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'voiceAuthFee'){
            $scope.merchantBean.voiceAuthFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'mcNetworkAccessFee'){
            $scope.merchantBean.mcNetworkAccessFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'mcLicenseFee'){
            $scope.merchantBean.mcLicenseFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'mcCrossBorderFee'){
            $scope.merchantBean.mcCrossBorderFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaIntlNonUSD'){
            $scope.merchantBean.visaIntlNonUSD = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaIntlUSD'){
            $scope.merchantBean.visaIntlUSD= data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'amexPassThru'){
            $scope.merchantBean.amexPassThru = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'ebtFee'){
            $scope.merchantBean.ebtFee = data.productList[i].value.formatRateFee();
          }

          //=== Fee Schedule Table
          if(data.productList[i].mpaProductKey == 'visaCreditFeeRateAuth'){
            $scope.merchantBean.visaCreditFeeRateAuth = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditFeeInterchange'){
            $scope.merchantBean.visaCreditFeeInterchange = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditFeeTier'){
            $scope.merchantBean.visaCreditFeeTier = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditRateRateAuth'){
            $scope.merchantBean.visaCreditRateRateAuth = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditRateInterchange'){
            $scope.merchantBean.visaCreditRateInterchange = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditRateTier2'){
            $scope.merchantBean.visaCreditRateTier2 = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditRateTier3'){
            $scope.merchantBean.visaCreditRateTier3 = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitRateRateAuth'){
            $scope.merchantBean.visaDebitRateRateAuth = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitFeeInterchange'){
            $scope.merchantBean.visaDebitFeeInterchange = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitFeeTier'){
            $scope.merchantBean.visaDebitFeeTier = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitRateInterchange'){
            $scope.merchantBean.visaDebitRateInterchange = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitRateTier2'){
            $scope.merchantBean.visaDebitRateTier2 = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitRateTier3'){
            $scope.merchantBean.visaDebitRateTier3 = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'amexDiscountRate'){
            $scope.merchantBean.amexDiscountRate = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCardMQFee'){
            $scope.merchantBean.visaCardMQFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCardNPMQFee'){
            $scope.merchantBean.visaCardNPMQFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditNonQualFeeTier'){
            $scope.merchantBean.visaCreditNonQualFeeTier = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitNonQualFeeTier'){
            $scope.merchantBean.visaDebitNonQualFeeTier = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCardMQRate'){
            $scope.merchantBean.visaCardMQRate = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCardNPMQRate'){
            $scope.merchantBean.visaCardNPMQRate = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditNonQualRateTier2'){
            $scope.merchantBean.visaCreditNonQualRateTier2 = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditNonQualRateTier3'){
            $scope.merchantBean.visaCreditNonQualRateTier3 = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitNonQualRateTier2'){
            $scope.merchantBean.visaDebitNonQualRateTier2 = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitNonQualRateTier3'){
            $scope.merchantBean.visaDebitNonQualRateTier3 = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'nonQualifiedSurchargeFee'){
            $scope.merchantBean.nonQualifiedSurchargeFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'rewardsSurchargeRate'){
            $scope.merchantBean.rewardsSurchargeRate = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'swipedRate'){
            $scope.merchantBean.swipedRate = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'nonSwipedRate'){
            $scope.merchantBean.nonSwipedRate = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'swipedFee'){
            $scope.merchantBean.swipedFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'nonSwipedFee'){
            $scope.merchantBean.nonSwipedFee = data.productList[i].value.formatRateFee();
          }
        }
    }

    $scope.totalAmountStartUpFees += $scope.equipmentPurchase;
    if(!$scope.equipmentPurchase > 0) {
      $scope.equipmentPurchase = "N/A";
    }
  };

  /**
   * Open print dialogue
   */
  $scope.printWindow = function() {
    $window.print();
  };

  /**
   * execute when mouse up from canvas
   * @param i index of canvas
   */
  $scope.canMouseUp = function(i) {
    var blank = isCanvasBlank(document.getElementById('signature' + i));

    if(!blank) {
      $scope['signature' + i + 'Empty'] = false;
      $scope['signature' + i + 'Date'] = new Date();
    }
  };

  /**
   * Check if canvas is blank
   * @param canvas
   * @return {boolean}
   */
  function isCanvasBlank(canvas) {
    var blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    return canvas.toDataURL() == blank.toDataURL();
  }

  /**
   * clear canvas
   * @param i
   */
  $scope.resetCanvas = function(i){
    var sketch = angular.element('#signature' + i);
    var myCanvas = sketch[0];
    sketch.sketch().actions = [];
    var ctx = myCanvas.getContext('2d');
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    $scope['signature' + i + 'Empty'] = true;
    $scope['signature' + i + 'Date'] = null;
  }

  /**
   * toggle section
   * @param i section index
   */
  $scope.toggleSection = function(i){
    $scope.sectionsOpen[i] = !$scope.sectionsOpen[i];
  };

  /**
   * Close all sections
   */
  $scope.closeAllSections = function(){
    for (var i in $scope.sectionsOpen) {
      $scope.sectionsOpen[i] = false;
    }
  };

  /**
   * Open all sections
   */
  $scope.openAllSections = function(){
    for (var i in $scope.sectionsOpen) {
      $scope.sectionsOpen[i] = true;
    }
  };

  ///////////////// MAIN ////////////////////////////////
  _init();
}]);
