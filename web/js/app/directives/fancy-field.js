/*! =======================================================================
 * Fancyfy Fields: fancyfy-fields.js v1.0.0
 * ========================================================================
 * Copyright 2016 Judit Hummel
 * ======================================================================== */

app.directive("fancyField", function($timeout){
  return {
    scope: {
      modelValue: '=ngModel'
    },
    
    link: function(scope, element, attrs) {
      
      $timeout(function() {
        
        
        var fancyField = element;
        
        var fancyInput = fancyField.find('input[type=text],input[type=password],input[type=email],input[type=number],input[type=tel]');
        var fancySelect = fancyField.find('select');
        var fancyFields = fancyInput.add(fancySelect);
        
        // focus and blur
        fancyFields.focus(function() {
          $(this).parent('.fancy-field').addClass('focused');
        });
        fancyFields.blur(function() {
          $(this).parent('.fancy-field').removeClass('focused');
        });
        // insert faux placeholder to each .fancy-field element
        // check if field already has a value, if yes then initialize with faux placeholder visible
        fancyFields.each(function() {
          // create faux placeholder for <input> element
          if ($(this).is('input')) {
            var palceHolderText = $(this).attr('placeholder');
            if ($(this).val() != '') {
              $(this)
              .addClass('hasvalue')
              .parent('.fancy-field').addClass('active');
            } else {
              $(this)
              .removeClass('hasvalue')
              .parent('.fancy-field').removeClass('active');
            }
            
            // create faux placeholder for <select> element
          } else if ($(this).is('select')) {
            var palceHolderText = $(this).attr('placeholder');
            if ($(this).val() !== '') {
              $(this)
              .addClass('hasvalue')
              .parent('.fancy-field').addClass('active');
            } else {
              $(this)
              .removeClass('hasvalue')
              .parent('.fancy-field').removeClass('active');
            }
          }
          
          // add faux placeholder to element
          var fancyLabel = '<span>' + palceHolderText + '</span>';
          $(this).before(fancyLabel);
          
        });
        
        // basic JS throttle function
        function throttle(fn, threshhold, scope) {
          threshhold || (threshhold = 250);
          var last,
          deferTimer;
          return function () {
            var context = scope || this;
            var now = +new Date,
            args = arguments;
            if (last && now < last + threshhold) {
              clearTimeout(deferTimer);
              deferTimer = setTimeout(function () {
                last = now;
                fn.apply(context, args);
              }, threshhold);
            } else {
              last = now;
              fn.apply(context, args);
            }
          };
        }
        
        // show/hide <input> element faux placeholder when user types/deletes
        // use JS throttle to prevent animation jitter during typing
        fancyInput.keyup(throttle(function(){
          if ($(this).val()) {
            $(this)
            .addClass('hasvalue')
            .parent('.fancy-field').addClass('active');
          } else {
            $(this)
            .removeClass('hasvalue')
            .parent('.fancy-field').removeClass('active');
          }
        },300)); // set to same time as css transition-duration
        fancyInput.on('change', function(){
          if ($(this).val()) {
            $(this)
              .addClass('hasvalue')
              .parent('.fancy-field').addClass('active');
          } else {
            $(this)
              .removeClass('hasvalue')
              .parent('.fancy-field').removeClass('active');
          }
        });
        
        // show/hide <select> element faux placeholder on change
        fancySelect.change(function() {
          if ($(this).val() !== '') {
            $(this)
            .addClass('hasvalue')
            .parent('.fancy-field').addClass('active');
          } else {
            $(this)
            .removeClass('hasvalue')
            .parent('.fancy-field').removeClass('active');
          }
        });
      }, 0);
    
  }};
});
