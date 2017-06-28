/**
 * validate if 2 fields are equal
 */
app.directive("compareTo", function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {
            ngModel.$validators.compareTo = function(modelValue) {
                var l = (typeof modelValue == 'undefined' ? '' : modelValue);
                var r = (typeof scope.otherModelValue == 'undefined' ? '' : scope.otherModelValue);
                return l.toLowerCase() == r.toLowerCase();
            };
            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
});
/**
 * Compare Numbers
 */
app.directive("compareNumTo", function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareNumTo"
        },
        link: function(scope, element, attributes, ngModel) {
            ngModel.$validators.compareNumTo = function(modelValue) {
                var l = (typeof modelValue == 'undefined' ? '' : modelValue);
                var r = (typeof scope.otherModelValue == 'undefined' ? '' : scope.otherModelValue);
                return l === r;
            };
            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
});

/**
 * toggle mobile menu
 */
app.directive("toggleMenu", function() {
    return function(scope, element, attrs) {
        element.on('click', function() {
            $(attrs.toggleMenu).slideToggle();
        });
    };
});

/**
 * Sketch canvas
 */
app.directive("sketch", function() {
    return function(scope, element, attrs) {
        element.sketch();
    };
});

/**
 * Add Video Modal Directive
 */
app.directive("addVideoModal", function() {
    return function(scope, element, attrs) {
        element.on('click', function() {
            $(attrs.addVideoModal).modal('show');
            $(attrs.addVideoModal).on('hidden.bs.modal', function() {
                $(attrs.addVideoModal + ' iframe').attr("src", $(attrs.addVideoModal + ' iframe').attr("src"));
                var video = $(attrs.addVideoModal + ' video')[0];
                if (video && !video.paused) {
                    video.pause();
                }
            });
        });
    };
});

/**
 * Open Video Directive
 */
app.directive("openVideo", function() {
    return function(scope, element, attrs) {
        element.YouTubePopup({
            autoplay: true,
            draggable: false,
            title: 'Clover Overview',
            useYoutTubeTitle: false
        });
    };
});

/**
 * Scroll links
 */
app.directive("scrollLinks", ['$timeout', function($timeout) {
    return function(scope, element, attrs) {
        $timeout(function() {
            var quicklinkPosition = element.offset();
            $(window).scroll(function() {
                if ($(window).scrollTop() > quicklinkPosition.top) {
                    element.css('position', 'fixed').css('top', '0');
                } else {
                    element.css('position', 'static');
                }
            });
        }, false);
    };
}]);

/**
 * Use select2 plugin
 */
app.directive("useSelect2", function() {
    return function(scope, element, attrs) {
        element.select2({
            placeholder: attrs.placeholder
        });
    };
});

/**
 * init breadcrumb
 */
app.directive("breadcrumb", function($window) {
    return function(scope, element, attrs) {
        var sticky_relocate = function() {
            var window_top = $(window).scrollTop();
            var div_top = $('#breadcrumb-anchor').offset().top;
            if (window_top > div_top) {
                element.addClass('stick');
                $('#breadcrumb-anchor').height($('#breadcrumb').outerHeight());
            } else {
                element.removeClass('stick');
                $('#breadcrumb-anchor').height(0);
            }
        };
        if (!parseInt(attrs.nostick)) {
            $(window).scroll(sticky_relocate);
            sticky_relocate();
        }
        $('.breadcrumb-mobile a', element).click(function() {
            $('.breadcrumb-inner ul', element).slideToggle();
            $(this).children('span').toggle();
            $(this).children('i').toggleClass('fa-chevron-down fa-chevron-up');
        });
        $(window).resize(function() {
            if ($window.innerWidth >= 800) {
                $('.breadcrumb-inner ul', element).show();
            } else {
                $('.breadcrumb-inner ul', element).hide();
                $('.breadcrumb-mobile a span', element).show();
                $('.breadcrumb-mobile a i', element).addClass('fa-chevron-down').removeClass('fa-chevron-up');
            }
        });
    };
});

/**
 * Format SSN
 */
app.directive('ssnField', function($filter) {
    var ssnFilter, ssnReverse;
    ssnFilter = $filter('ssnFilter');
    ssnReverse = $filter('ssnReverse');
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            var formatter, mask, parser;
            mask = attrs.ssnFieldMask;
            formatter = function(value) {
                return ssnFilter(value);
            };
            parser = function(value) {
                var formatted;
                formatted = ssnReverse(value);
                element.val(ssnFilter(formatted));
                setTimeout(function() {
                    var strLength = ssnFilter(formatted).length;
                    element[0].focus();
                    element[0].setSelectionRange(strLength, strLength);
                }, 10);
                return formatted;
            };
            modelCtrl.$formatters.push(formatter);
            return modelCtrl.$parsers.unshift(parser);
        }
    };
});

/**
 * Use Autocomplete
 */
app.directive('autoComplete', function($timeout) {
    return function(scope, el, attr) {
        el.autocomplete({
            source: scope[attr.uiItems],
            select: function() {
                $timeout(function() {
                    el.trigger('input');
                }, 0);
            }
        });
    };
});

/**
 * Format phone
 */
app.directive('formatPhone', function($filter) {
    var phoneFilter, phoneReverse;
    phoneFilter = $filter('phoneFilter');
    phoneReverse = $filter('phoneReverse');
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            var formatter, parser;
            formatter = function(value) {
                return phoneFilter(value);
            };
            parser = function(value) {
                var formatted;
                formatted = phoneReverse(value);
                element.val(phoneFilter(formatted));
                setTimeout(function() {
                    var strLength = phoneFilter(formatted).length;
                    element[0].focus();
                    element[0].setSelectionRange(strLength, strLength);
                }, 10);
                return formatted;
            };
            modelCtrl.$formatters.push(formatter);
            return modelCtrl.$parsers.unshift(parser);
        }
    };
});

/**
 * Format Number
 */
app.directive('formatNum', function($filter) {
    var numFilter = $filter('number');
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            var formatter, parser;
            formatter = function(value) {
                return numFilter(value);
            };
            parser = function(value) {
                var formatted;
                var val = value.split('.');
                var decimals = val[1] != undefined ? '.'+val[1] : '';
                formatted = val[0].replace(/\D/g, "")+decimals;
                if(decimals != '.')
                    element.val(numFilter(formatted));
                return parseFloat(formatted);
            };
            modelCtrl.$formatters.push(formatter);
            return modelCtrl.$parsers.unshift(parser);
        }
    };
});

/**
 * Validate if element is more than ng-min value
 */
app.directive('ngMin', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
            function isEmpty(value) {
                return angular.isUndefined(value) || value === '' || value === null || value !== value;
            }
            scope.$watch(attr.ngMin, function() {
                ctrl.$setViewValue(ctrl.$viewValue);
            });
            ctrl.$validators.ngMin = function(value) {
                var minVal = parseFloat(attr.ngMin) || 0;
                return ctrl.$isEmpty(value) || angular.isUndefined(minVal) || value >= minVal;
            };
            attr.$observe('min', function(val) {
                ctrl.$validate();
            });
            var minValidator = function(value) {
                var min = parseFloat(attr.ngMin) || 0;//scope.$eval(attr.ngMin) || 0;
                if (!isEmpty(value) && value >= min) {
                    ctrl.$setValidity('ngMin', true);
                    return value;
                } else {
                    ctrl.$setValidity('ngMin', false);
                    return value;
                }
            };
            ctrl.$parsers.push(minValidator);
            ctrl.$formatters.push(minValidator);
        }
    };
});

/**
 * Validate if element is less than ng-max value
 */
app.directive('ngMax', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
            function isEmpty(value) {
                return angular.isUndefined(value) || value === '' || value === null || value !== value;
            }
            scope.$watch(attr.ngMax, function() {
                ctrl.$setViewValue(ctrl.$viewValue);
            });
            ctrl.$validators.ngMax = function(value) {
                var maxVal = parseFloat(attr.ngMax) || Infinity;
                return ctrl.$isEmpty(value) || angular.isUndefined(maxVal) || value <= maxVal;
            };
            attr.$observe('max', function(val) {
                ctrl.$validate();
            });
            var maxValidator = function(value) {
                var max = parseFloat(attr.ngMax) || Infinity;//scope.$eval(attr.ngMax) || Infinity;
                if (!isEmpty(value) && value <= max) {
                    ctrl.$setValidity('ngMax', true);
                    return value;
                } else {
                    ctrl.$setValidity('ngMax', false);
                    return value;
                }
            };
            ctrl.$parsers.push(maxValidator);
            ctrl.$formatters.push(maxValidator);
        }
    };
});

/**
 * place decimals
 */
app.directive('decimalPlaces', function($parse, $filter) {
    return {
        require: 'ngModel',
        scope: {
            modelValue: '=ngModel'
        },
        link: function(scope, ele, attrs, ngModel) {
            ngModel.$setViewValue($filter('decimalConvert')(scope.modelValue));
            ngModel.$render();
            ele.bind('keypress', function(e) {
                var newVal = $(this).val() + (e.charCode !== 0 ? String.fromCharCode(e.charCode) : '');
                if ($(this).val().search(/(.*)\.[0-9][0-9][0-9][0-9][0-9]/) === 0 && newVal.length > $(this).val().length) {
                    e.preventDefault();
                }
            });
            ele.bind('focusout', function(e) {
                if(scope.modelValue)
                    ngModel.$setViewValue($filter('decimalConvert')(scope.modelValue));
                ngModel.$render();
            });
        }
    };
});

/**
 * Description
 * @method absMax
 * @param {}
 * @return
 */
app.directive('absMax', function() {
    return {
        require: ['^form','ngModel'],
        priority: 0,
        link: function($scope, element, attrs, ctrls) {
            var form1 = ctrls[0];
            var ngModel = ctrls[1];
            var form2 = form1.$$parentForm.$name ? form1.$$parentForm : null;


            $scope.$watch(attrs['ngModel'], function (v) {
                absMaxFun(ngModel.$viewValue, attrs);
            });

            var absMaxFun = function (value, attrs) {
                // console.log(Object.keys(ngModel.warn).length)
                ngModel.warn = {};
                if (parseFloat(attrs.max) === parseFloat(attrs.min))
                    return;
                if (parseFloat(value) > parseFloat(attrs.absMax) && parseFloat(value) <= parseFloat(attrs.max)) {
                    ngModel.warn = {'absMax': true};
                } else if (parseFloat(value) >= parseFloat(attrs.min) && parseFloat(value) < parseFloat(attrs.absMin)) {
                    ngModel.warn = {'absMin': true};
                }

                updateFormScope(form1, form2, ngModel);

            }

            /**
             * Description
             * @method updateFormScope
             * @param {} parent form 1
             * @param {} parent form 2
             * @param {} ngModel
             * @return
             */
            var updateFormScope = function (f1, f2, ngModel){
                if(f1) {
                    f1.warns = f1.warns || [];
                    var i = f1.warns.indexOf(ngModel);
                    if (-1 !== i) {
                        f1.warns.splice(i, 1);
                    }
                    if (Object.keys(ngModel.warn).length) {
                        f1.warn = ngModel.warn;
                        f1.warns.push(ngModel);
                    }

                    if (!f1.warns.length) {
                        f1.warn = {};
                    }
                }

                if(f2) {
                    f2.warns = f2.warns || [];
                    var i = f2.warns.indexOf(ngModel);
                    if (-1 !== i) {
                        f2.warns.splice(i, 1);
                    }
                    if (Object.keys(ngModel.warn).length) {
                        f2.warn = ngModel.warn;
                        f2.warns.push(ngModel);
                    }

                    if (!f2.warns.length) {
                        f2.warn = {};
                    }
                }

            };



        }
    };
});
/**
 * Description
 * @method dateCheck
 * @param {}
 * @return
 */
app.directive("dateCheck", function() {
    return {
        require: "ngModel",
        scope: {
            startDate: "=dateCheck"
        },
        link: function(scope, element, attributes, ngModel) {
            ngModel.$validators.dateCheck = function(modelValue) {
                var endDateStr = (typeof modelValue == 'undefined' ? '' : modelValue);
                var startDateStr = (typeof scope.startDate == 'undefined' ? '' : scope.startDate);
                return (new Date(endDateStr)) >= (new Date(startDateStr));
            };
            scope.$watch('startDate', function() {
                ngModel.$validate();
            });
        }
    };
});

app.directive('slideToggle', function() {
    return {
        restrict: 'A',
        scope: {
            isOpen: "=slideToggle" // 'data-slide-toggle' in our html
        },
        link: function(scope, element, attr) {
            var slideDuration = parseInt(attr.slideToggleDuration, 10) || 200;
            // Watch for when the value bound to isOpen changes
            // When it changes trigger a slideToggle
            scope.$watch('isOpen', function(newIsOpenVal, oldIsOpenVal) {
                if (newIsOpenVal !== oldIsOpenVal) {
                    element.stop().slideToggle(slideDuration);
                }
            });
        }
    };
});


/**
 * Check if touch if ended
 */
app.directive('myTouchend', [function() {
    return function(scope, element, attr) {
        element.on('touchend', function(event) {
            scope.$apply(function() {
                scope.$eval(attr.myTouchend);
            });
        });
    };
}]);

/**
 * redirect to url
 */
app.directive('goTo', ['$location', '$timeout', function($location, $timeout) {
    return {
        link: function(scope, element, attrs) {
            element.on('click', function() {
                $timeout(function() {
                    $location.path(attrs.goTo);
                });
                //              scope.$apply(function() {
                //              });
            });
        }
    }
}]);

/**
 * validate web field of signup form
 */
app.directive('angWebValidate', function() {
    return {
        restrict: 'A',
        scope: {
            internet: "=",
        },
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
            scope.$watch("internet", function() {
                ctrl.$validate();
            });
            ctrl.$validators.WebValidate = function(modelValue) {
                if (!parseInt(scope.internet)) {
                    return true;
                }
                if (modelValue && modelValue.length) {
                    return true;
                }
                return false;
            };
        }
    };
});

/**
 * Directive for grouping pricing table
 */
app.directive('groupingTable', ['fdService', '$rootScope', function(fdService, $rootScope) {
    return {
        restrict: "E",
        priority: 10,
        scope: {
            groupingData: '=',
            cartContents: '='
        },
        link: function(scope, element, attrs) {

            var groupingResult = [];
            var result = {};

            var discountRates = [];
            var groupedDiscountRates = {};
            var transRateProductIDs = [];

            scope.$watch('groupingData', function(data){
                result = {};
                discountRates = [];
                groupedDiscountRates = {};
                scope.showError = false;
                scope.showWarning = false;

                if(undefined != data && undefined != data.cartTransactionRates){
                    transRateProductIDs = data.cartTransactionRates.map(function(p) { return p.pricingDetailId; });
                }

                //setup grouping in discount rates
                if(undefined != data && undefined != data.discountRates){
                    for (var i = 0; i < data.discountRates.length; i++) {
                        //check if input control should be disabled rateMinAbsolute === rateMaxAbsolute
                        var temp = data.discountRates[i];
                        var isDisabled = false;
                        var isFeeDisabled = false;

                        if ((temp.rateMinAbsolute === null) || (temp.rateMinAbsolute === temp.rateMaxAbsolute)) {
                            isDisabled = true;
                        }
                        if ((temp.minAmountAbsolute === null) || (temp.minAmountAbsolute === temp.maxAmountAbsolute)) {
                          isFeeDisabled = true;
                        }

                        temp.isDisabled = isDisabled;
                        temp.isFeeDisabled = isFeeDisabled;

                        //check for error configurations
                        if (isRateError(temp) || isFeeError(temp)) {
                            scope.showError = true;
                        }

                        //check for warning configurations
                        if (isRateWarning(temp) || isFeeWarning(temp)){
                            scope.showWarning = true;
                        }

                        if (groupedDiscountRates[data.discountRates[i].groupName] && data.discountRates[i].groupName != '') {
                            groupedDiscountRates[data.discountRates[i].groupName].push(temp);
                        } else {
                            var tempData = [];
                            tempData.push(temp);

                            if (data.discountRates[i].groupName != '')
                                groupedDiscountRates[data.discountRates[i].groupName] = tempData;
                            else {
                                discountRates.push(temp);
                            }

                        }
                    }
                }

                //setup cardPresentDiscountRates
                if(undefined != data && undefined != data.cardPresentDiscountRates){
                    for (var i = 0; i < data.cardPresentDiscountRates.length; i++) {
                        //check if input control should be disabled rateMinAbsolute === rateMaxAbsolute
                        var temp = data.cardPresentDiscountRates[i];
                        var isDisabled = false;

                        if ((temp.rateMinAbsolute === null) || (temp.rateMinAbsolute === temp.rateMaxAbsolute)) {
                            isDisabled = true;
                        }
                        temp.isDisabled = isDisabled;

                        //check for error configurations
                        if (isRateError(temp) || isFeeError(temp)) {
                            scope.showError = true;
                        }

                        //check for warning configurations
                        if (isRateWarning(temp) || isFeeWarning(temp)){
                            scope.showWarning = true;
                        }


                        if (result[data.cardPresentDiscountRates[i].groupName] && data.cardPresentDiscountRates[i].groupName != '') {
                            result[data.cardPresentDiscountRates[i].groupName][0].cardPresentDiscountRates.push(temp);

                            if(transRateProductIDs.indexOf(temp.pricingDetailId) != -1){
                                result[data.cardPresentDiscountRates[i].groupName][0].cardPresentDiscountRates[0].transRateProduct = temp;
                            }

                        } else {
                            var tempData = []; 
                            tempData.push(temp);

                            if(transRateProductIDs.indexOf(temp.pricingDetailId) != -1){
                                tempData[0].transRateProduct = temp;
                            }

                            tempData[0].cardPresentDiscountRates = [];
                            tempData[0].cardNotPresentDiscountRates = [];

                            if (data.cardPresentDiscountRates[i].groupName != ''){
                                tempData[0].cardPresentDiscountRates.push(temp);
                                result[data.cardPresentDiscountRates[i].groupName]=tempData;
                            }
                        }
                    }
                }

                //setup cardNotPresentDiscountRates
                if(undefined != data && undefined != data.cardNotPresentDiscountRates){
                    for (var i = 0; i < data.cardNotPresentDiscountRates.length; i++) {
                        //check if input control should be disabled rateMinAbsolute === rateMaxAbsolute
                        var temp = data.cardNotPresentDiscountRates[i];
                        var isDisabled = false;

                        if ((temp.rateMinAbsolute === null) || (temp.rateMinAbsolute === temp.rateMaxAbsolute)) {
                            isDisabled = true;
                        }
                        temp.isDisabled = isDisabled;

                        //check for error configurations
                        if (isRateError(temp) || isFeeError(temp)) {
                            scope.showError = true;
                        }

                        //check for warning configurations
                        if (isRateWarning(temp) || isFeeWarning(temp)){
                            scope.showWarning = true;
                        }

                        if (result[data.cardNotPresentDiscountRates[i].groupName] && data.cardNotPresentDiscountRates[i].groupName != '') {
                            result[data.cardNotPresentDiscountRates[i].groupName][0].cardNotPresentDiscountRates.push(temp);

                                if(transRateProductIDs.indexOf(temp.pricingDetailId) != -1){
                                    result[data.cardNotPresentDiscountRates[i].groupName][0].cardNotPresentDiscountRates[0].transRateProduct = temp;
                                }

                        } else {
                            var tempData = [];
                            tempData.push(temp);
                            tempData[0].cardPresentDiscountRates = [];
                            tempData[0].cardNotPresentDiscountRates = [];

                            if (data.cardNotPresentDiscountRates[i].groupName != ''){
                                tempData[0].cardNotPresentDiscountRates.push(temp);

                                if(transRateProductIDs.indexOf(temp.pricingDetailId) != -1){
                                    tempData[0].cardNotPresentDiscountRates[0].transRateProduct = temp;
                                }

                                result[data.cardNotPresentDiscountRates[i].groupName]=tempData;
                            }
                        }
                    }
                }
                //setup scope arrays and objects
                scope.groupedPricingDetails = result;
                scope.discountRates = discountRates;
                scope.groupedDiscountRates = groupedDiscountRates;
            });


            scope.grouping = function(index) {
                angular.element('.toggle-rates-children' + index).children('i').toggleClass('fa-angle-double-down fa-angle-double-up');
                angular.element('.toggle-rates-children' + index).parent('div').children('table.rate-child' + index).slideToggle('fast');
            }
            scope.subgrouping = function(index) {
                angular.element('.toggle-rates-sub-children' + index).children('i').toggleClass('fa-angle-double-down fa-angle-double-up');
                angular.element('.toggle-rates-sub-children' + index).parent('td').parent('tr').parent('tbody').parent('table').children('tbody.rate-sub-child').slideToggle('fast');
            }

            var isRateWarning = function(product){
                var isWarning = false;
                var newRate = parseFloat(product.rateDefault);
                var errMax = parseFloat(product.rateMaxAbsolute);
                var warnMax = parseFloat(product.rateMax);
                var errMin = parseFloat(product.rateMinAbsolute);
                var warnMin = parseFloat(product.rateMin);

                if (newRate > warnMax && newRate <= errMax) {
                    isWarning = true;
                } else if (newRate >= errMin && newRate < warnMin) {
                    isWarning = true;
                }

                return isWarning;
            };
            var isFeeWarning = function(product){
                var isWarning = false;
                var newFee = parseFloat(product.defaultAmt);
                var errMax = parseFloat(product.maxAmountAbsolute);
                var warnMax = parseFloat(product.maxAmt);
                var errMin = parseFloat(product.minAmountAbsolute);
                var warnMin = parseFloat(product.minAmt);

                if (newFee > warnMax && newFee <= errMax) {
                    isWarning = true;
                } else if (newFee >= errMin && newFee < warnMin) {
                    isWarning = true;
                }

                return isWarning;
            };

            var isRateError = function(product) {
                var isError = false;
                var newRate = parseFloat(product.rateDefault);
                var errMax = parseFloat(product.rateMaxAbsolute);
                var errMin = parseFloat(product.rateMinAbsolute);

                if (newRate > errMax || newRate < errMin) {
                    isError = true;
                }

                return isError;
            };

            var isFeeError = function(product) {
                var isError = false;
                var newFee = parseFloat(product.defaultAmt);
                var errMax = parseFloat(product.maxAmountAbsolute);
                var errMin = parseFloat(product.minAmountAbsolute);
                if (newFee > errMax || newFee < errMin) {
                    isError = true;
                }

                return isError;
            };

            var updateNgModel = function(product, type) {
                var cardArr = [];
                Object.keys(scope.groupedPricingDetails).forEach(function(key) {
                    if(key === product.groupName) {
                        //card present
                        if(type === 'cp') {
                            cardArr = scope.groupedPricingDetails[key][0].cardPresentDiscountRates;
                        }
                        //card not present
                        else if(type === 'np'){
                            cardArr = scope.groupedPricingDetails[key][0].cardNotPresentDiscountRates;
                        }
                        for (var i=0; i < cardArr.length; i++) {
                            cardArr[i].rateDefault = product.rateDefault;
                            cardArr[i].defaultAmt = product.defaultAmt;
                        }
                    }
                });
            };

            scope.inputChanged = function(product, type) {

                //update screen values for card present and card not present groups
                if (type && type !== '') {
                    updateNgModel(product, type);
                }

                if (isRateError(product) || isFeeError(product)) {
                    scope.showError = true;
                    return;
                }
                else
                    scope.showError = false;

                if (isRateWarning(product) || isFeeWarning(product)){
                    scope.showWarning = true;
                }
                else
                    scope.showWarning = false;

                var acq_data = fdService.getAcquiringPricingStorage();
                var cart = fdService.getCart();

                if ('Transaction' == product.occurrence.type) {

                  for (var i in cart.cartTransactionRates) {

                    var productID = product.transRateProduct ? product.transRateProduct.productId : product.productId;
                    if (cart.cartTransactionRates[i].productId === productID) {
                      if (cart.cartTransactionRates[i].parentProduct && cart.cartTransactionRates[i].parentProduct.id == cart.payment_types.id) {
                        // Payment type
                        var cardType = type == 'np' ? "Card Not Present" : "Card Present";
                        for (var k in cart.payment_types.groups) {
                          if (cart.payment_types.groups[k].name == cardType) {
                            cart.payment_types.groups[k].fee = product.defaultAmt;
                            cart.payment_types.groups[k].rate = product.rateDefault;
                            break;
                          }
                        }
                      } else {
                        // transaction products

                        for (var k in cart.transaction_products) {

                          if (cart.transaction_products[k].id == cart.cartTransactionRates[i].parentProduct.id) {
                            cart.transaction_products[k].fee = product.defaultAmt;
                            cart.transaction_products[k].rate = product.rateDefault;
                            cart.transaction_products[k].parentProduct.fee = product.defaultAmt;
                            cart.transaction_products[k].parentProduct.rate = product.rateDefault;
                            break;
                          }
                        }
                      }
                      cart.cartTransactionRates[i].parentProduct.fee = product.defaultAmt;
                      cart.cartTransactionRates[i].parentProduct.rate = product.rateDefault;
                      break;

                    }
                  }
                }

                //card present
                if(type === 'cp'){
                    acq_data.cardPresentDiscountRates.forEach(function(element) {
                        if (element.groupName == product.groupName) {
                            element.rateDefault = product.rateDefault;
                            element.defaultAmt = product.defaultAmt;
                        }
                    });
                }
                //card not present
                else if(type === 'np'){
                    acq_data.cardNotPresentDiscountRates.forEach(function(element) {
                        if (element.groupName == product.groupName) {
                            element.rateDefault = product.rateDefault;
                            element.defaultAmt = product.defaultAmt;
                        }
                    });
                }
                //default
                else if(type === ''){
                    acq_data.discountRates.forEach(function(element) {
                        if (element.productId == product.productId) {

                            element.rateDefault = product.rateDefault;
                            element.defaultAmt = product.defaultAmt;
                            return;
                        }
                    });
                }

                fdService.storeAcquiringPricing(acq_data);

                cart.onetimeFees = {};
                cart.mFees = {};
                cart.onetimeAmount = 0;
                cart.mfeeAmount = 0;
                cart = fdService.setPricingToCart(cart, fdService.getGlobalPricingStorage());
                cart = fdService.setPricingToCart(cart, fdService.getEquipmentPricingStorage());
                var newData = [];
                for (var i in acq_data) {
                    if ('cartTransactionRates' != i) {
                        newData = newData.concat(acq_data[i]);
                    }
                }
                cart = fdService.setPricingToCart(cart, newData);
                $rootScope.cart = scope.cartContents = fdService.cartChanged(cart);
            };
        },
        templateUrl: "templates/groupingProducts.tpl"
    }
}]);


/**
 * Description
 * @method tooltip
 * @param {}
 * @return
 */

app.directive("toolTip", function() {
    return function(scope, element, attrs) {
        $('#proposal .minError').prop('title', '<h1>Low Profitability</h1><p>Values entered result in low profitability</p>');
        $('#proposal .absMinError').prop('title', '<h1>Not Profitable</h1><p>Values entered result in a loss</p>');
        $('#proposal .maxError').prop('title', '<h1>High Profitability</h1><p>Values entered result in high profitability</p>');
        $('#proposal .absMaxError').prop('title', '<h1>High Profitability</h1><p>Values not allowed</p>');
        $('#proposal .minError').tooltipsy({offset: [10, 0],});
        $('#proposal .absMinError').tooltipsy({offset: [10, 0],});
        $('#proposal .maxError').tooltipsy({offset: [10, 0],});
        $('#proposal .absMaxError').tooltipsy({offset: [10, 0],});
    };
});
