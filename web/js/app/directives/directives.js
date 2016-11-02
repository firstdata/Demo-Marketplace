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
                return formatted;
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
            var minValidator = function(value) {
                var min = scope.$eval(attr.ngMin) || 0;
                if (!isEmpty(value) && value <= min) {
                    ctrl.$setValidity('ngMin', false);
                    return undefined;
                } else {
                    ctrl.$setValidity('ngMin', true);
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
            var maxValidator = function(value) {
                var max = scope.$eval(attr.ngMax) || Infinity;
                if (!isEmpty(value) && value >= max) {
                    ctrl.$setValidity('ngMax', false);
                    return undefined;
                } else {
                    ctrl.$setValidity('ngMax', true);
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
                ngModel.$setViewValue($filter('decimalConvert')(scope.modelValue));
                ngModel.$render();
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