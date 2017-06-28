/**
 * Terms and Conditions Controller
 */
app.controller('SignupTermsCtrl', ['$scope', '$rootScope', '$filter', '$location', 'fdService', '$document', '$timeout', '$anchorScroll', 'CONST', '$routeParams',
    function($scope, $rootScope, $filter, $location, fdService, $document, $timeout, $anchorScroll, CONST, $routeParams) {
        /**
         * Description
         * @method _init
         * @return
         */
        var _init = function() {

            if (navigator.geolocation && !fdService.getGeoData()) {
                navigator.geolocation.getCurrentPosition(function(p) {
                    fdService.storeGeoData(p);
                });
            }
            $scope.orderId = fdService.getOrderId() || $routeParams.orderID;
            $scope.ownerID = $routeParams.ownerID;
            if (!$scope.orderId || 'thankyou' == $rootScope.refUrl) {
                $location.path('/');
                return;
            }
            fdService.getOrderAgreementInformation($scope.orderId, $scope.ownerID).success(function(data, status, headers, config) {
                $scope.logo = data.Logo;
                $scope.businessinformation = data.Business_Information;
                $scope.businessinformationArr = $scope.getElements(data.Business_Information);
                $scope.ownerinformation = data.Owner_Information;
                $scope.components = data.Components;
                $scope.locations = data.Locations;
                $scope.entitlements = data.Entitlements;
                $scope.feeSchedule = data.Fee_Schedule;
                $scope.confirmation = data.Confirmation;
                $scope.signatures = data.Signatures;
                $scope.agreementStatus = data.Status;
                $scope.signs = {};
                $scope.showSignatures = true;
                $scope.signatureRefs = {};
                for (var i = 0; i < data.Signatures.length; i++) {
                    var type = data.Signatures[i].type;
                    data.Signatures[i].idx = i + 1;
                    if ($scope.signs[type])
                        $scope.signs[type].push(data.Signatures[i]);
                    else {
                        $scope.signs[type] = [data.Signatures[i]];
                    }
                    $scope['signature' + (i + 1) + 'Empty'] = true;
                    if(!data.Signatures[i].readOnly && !data.Signatures[i].signature)
                        $scope.showSignatures = false;
                }
                $scope.totalSigns = $scope.signatures.length;
                $scope.componentsData = {};
                $scope.leaseData = {};
                $scope.fixedSectionsLength = 5;
                $scope.dynamicSectionsLength = 0;
                for(var j = 0; j < $scope.components.length; j++){
                    if($scope.components[j].valueType == 'AGREEMENT'){
                        var section = $scope.components[j].label;
                        $scope.componentsData[section] = $scope.components[j];
                        $scope.componentsData[section].signs = $scope.signs[section];
                        $scope.dynamicSectionsLength++;
                    if ($scope.signs[section]) {
                        var isOptionalSignSection = $scope.signs[section].map(function(s) {
                            return s.optional;
                        }).indexOf(false);
                        if (isOptionalSignSection != -1) {
                            if (!$scope.signatureRefs[section])
                                $scope.signatureRefs[section] = {};
                            $scope.signatureRefs[section].sectionNum = $scope.fixedSectionsLength + $scope.dynamicSectionsLength;
                            if($scope.ownerID){
                                var ind = $scope.signs[section].map(function(s) { return s.ownerId; }).indexOf($scope.ownerID);
                                $scope.signatureRefs[section].idx = $scope.signs[section][ind].idx;
                            } else {
                                $scope.signatureRefs[section].idx = $scope.signs[section][0].idx;
                            }
                        }
                    }
                    }
                }

                //CONFIRMATION section signature for Signature Required Section(s)
                $scope.signatureRefs['CONFIRMATION'] = {}
                $scope.signatureRefs['CONFIRMATION'].sectionNum = $scope.fixedSectionsLength + $scope.dynamicSectionsLength + 1;
                if($scope.ownerID){
                    var ind = $scope.signs['CONFIRMATION'].map(function(s) { return s.ownerId; }).indexOf($scope.ownerID);
                    $scope.signatureRefs['CONFIRMATION'].idx = $scope.signs['CONFIRMATION'][ind].idx;
                } else {
                    $scope.signatureRefs['CONFIRMATION'].idx = $scope.signs['CONFIRMATION'][0].idx;
                }

                $scope.leaseSectionsLength = 0;
                for(var j = 0; j < $scope.components.length; j++){
                    if($scope.components[j].valueType == 'MISC_AGREEMENT'){
                        var section = $scope.components[j].label;
                        $scope.leaseData[section] = $scope.components[j];
                        $scope.leaseData[section].signs = $scope.signs[section];
                        $scope.leaseSectionsLength++;
                        if(section == 'LEASE'){
                            $scope.leaseData[section].lease = data.Lease;
                        } else if(section == 'CLOVER_SERVICES' || section == 'CLOVER_GO_SERVICES'){
                            $scope.leaseData[section].cloverLease = data.CloverAgreement;
                        }
                        $scope.leaseData[section].sectionNum = $scope.fixedSectionsLength + $scope.dynamicSectionsLength + $scope.leaseSectionsLength + 1;
                        if ($scope.signs[section]) {
                            var isOptionalSignSection = $scope.signs[section].map(function(s) { return s.optional; }).indexOf(false);
                            if (isOptionalSignSection != -1) {
                                if (!$scope.signatureRefs[section])
                                    $scope.signatureRefs[section] = {};
                                $scope.signatureRefs[section].sectionNum = $scope.leaseData[section].sectionNum;
                                if($scope.ownerID){
                                    var ind = $scope.signs[section].map(function(s) { return s.ownerId; }).indexOf($scope.ownerID);
                                    $scope.signatureRefs[section].idx = $scope.signs[section][ind].idx;
                                } else {
                                    $scope.signatureRefs[section].idx = $scope.signs[section][0].idx;
                                }
                            }
                        }
                    }
                }

                if($scope.ownerID){
                    $rootScope.thankyouPageFlag = $scope.getPendingSignaturesCount(data);
                }

                if(!$scope.showSignatures){
                    $rootScope.$emit('Agreement_Unsigned');
                }
            })
            .error(function(data, status, headers, config) {
              $location.path('/400');
            });

            $scope.setThreatMetrixIframe();
        };


        /**
         * Description
         * @method getPendingSignaturesCount
         * @param {} data
         * @return remainingSigns
         */
        $scope.getPendingSignaturesCount = function(data){
            $scope.signsStatus = {};
            var ownersTotalCount = 0;
            var ownersSignCount = 0;
            for (var i = 0; i < data.Signatures.length; i++) {
                var ownerId = data.Signatures[i].ownerId;
                if ($scope.signsStatus[ownerId])
                    $scope.signsStatus[ownerId].push(data.Signatures[i].signature? true : false);
                else {
                    $scope.signsStatus[ownerId] = [data.Signatures[i].signature? true : false];
                    ownersTotalCount++;
                }
            }
            for (ownersSign in $scope.signsStatus) {
                var ind = $scope.signsStatus[ownersSign].indexOf(false);
                if(ind == -1){
                    ownersSignCount++;
                }
            }
            var remainingSigns = ownersTotalCount - ownersSignCount;
            return remainingSigns == 1 ? false : true;
        }

        /**
         * Description
         * @method isSigned
         * @param {} id
         * @return LogicalExpression
         */
        $scope.isSigned = function(id) {
            return !$scope['signature' + id + 'Empty'] && $scope.signature_texts[id];
        }
        /**
         * Description
         * @method resetCanvas
         * @param {Number} i
         * @return
         */
        $scope.resetCanvas = function(i) {
            var sketch = angular.element('#signature' + i);
            var myCanvas = sketch[0];
            sketch.sketch().actions = [];
            var ctx = myCanvas.getContext('2d');
            ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
            $scope['signature' + i + 'Empty'] = true;
            $scope['signature' + i + 'Date'] = null;
        }

        /**
         * Description
         * @method getElements
         * @param {} object
         * @return CallExpression
         */
        $scope.getElements = function(object) {
            return Object.keys(object).map(function(key) {
                return key;
            })
        };

        /**
         * Description
         * @method gotoAnchor
         * @param {} anc
         * @return
         */
        $scope.gotoAnchor = function(anc) {
            $timeout(function() {
                $anchorScroll(anc);
            });
        };

        /**
         * redirect to the url
         * @param url
         */
        $scope.goToUrl = function (url) {
          $location.path(url);
          angular.element('.modal-backdrop').removeClass('modal-backdrop');
          angular.element('body').css('overflow','auto');
        };

        /**
         * Description
         * @method showSignBox
         * @return LogicalExpression
         */
        $scope.showSignBox = function() {
            return $rootScope.logged_in && $rootScope.isTouch;
        }

        /**
         * Description
         * @method getSignDate
         * @param {} idx
         * @return MemberExpression
         */
        $scope.getSignDate = function(idx) {
            return $scope['signature' + idx + 'Date'];
        }

        $scope.toProm = {};
        $scope.signCanvases = {};
        $scope.signature_texts = {
            1: '',
            2: '',
            3: '',
            4: '',
            5: '',
            6: '',
            7: '',
            8: '',
            9: '',
            10: '',
        };

        /**
         * Description
         * @method isFormNotValid
         * @return Literal
         */
        $scope.isFormNotValid = function() {
            for (var i = 0; i < $scope.totalSigns; i++) {
                if (!$scope.signatures[i].readOnly && $scope['signature' + (i + 1) + 'Empty'] && !$scope.signatures[i].optional)
                    return true;
            }
            return false;
        }

        /**
         * check if terms form is valid
         * @return {Literal|Boolean}
         * @private
         */
        $rootScope._isTermsFormNotValid = function() {
            return $scope.isFormNotValid();
        }

        /**
         * Description
         * @method canMouseUp
         * @param {} i
         * @return
         */
        $scope.canMouseUp = function(i) {
            var blank = isCanvasBlank(document.getElementById('signature' + i));
            if (!blank) {
                $scope['signature' + i + 'Empty'] = false;
                $scope['signature' + i + 'Date'] = new Date();
            }
        };

        /**
         * on text signature changed
         * @method signTextChanged
         * @param i index
         * @return
         */
        $scope.signTextChanged = function(i) {
            $scope.isSignInProg = true;
            if ($scope.toProm[i]) {
                $timeout.cancel($scope.toProm[i]);
            }
            $scope.toProm[i] = $timeout(function() {
                html2canvas(document.getElementById('type-signature-' + i), {

                    onclone: function(document) {
                        return $timeout(function() {
                          var elements = document.getElementsByClassName('mpa-legal-copy')
                          for (var i = 0; i < elements.length; i++)
                            elements[i].style.display = "none";
                        });
                    },
                    /**
                     * Description
                     * @method onrendered
                     * @param {} canvas
                     * @return
                     */
                    onrendered: function(canvas) {
                        $scope.signCanvases[i] = canvas;
                        $timeout(function(){$scope.isSignInProg = false;},0);
                    }
                });
            }, 500);

            if ($scope.signature_texts[i]) {
                $scope['signature' + i + 'Empty'] = false;
                $scope['signature' + i + 'Date'] = new Date();
            } else {
                $scope['signature' + i + 'Empty'] = true;
                $scope['signature' + i + 'Date'] = null;
            }
        };

        /**
         * Description
         * @method setThreatMetrixIframe
         * @return
         */
        $scope.setThreatMetrixIframe = function() {

            $timeout(function() {
                if (document.getElementById("threatmetrix") !== null && !$scope.showSignatures) {
                    $scope.GUID = $scope.createGUID();
                    document.getElementById("threatmetrix").src = "https://h.online-metrix.net/tags?org_id=huumuzel&session_id=" + $scope.GUID;
                } else {
                    $scope.setThreatMetrixIframe();
                }
            }, 1000);
        }

        /**
         * Description
         * @method isCanvasBlank
         * @param {} canvas
         * @return BinaryExpression
         */
        function isCanvasBlank(canvas) {
            var blank = document.createElement('canvas');
            blank.width = canvas.width;
            blank.height = canvas.height;
            return canvas.toDataURL() == blank.toDataURL();
        }

        /**
         * Description
         * @method resetCanvas
         * @param {Number} i
         * @return
         */
        $scope.resetCanvas = function(i) {
            var sketch = angular.element('#signature' + i);
            var myCanvas = sketch[0];
            sketch.sketch().actions = [];
            var ctx = myCanvas.getContext('2d');
            ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
            $scope['signature' + i + 'Empty'] = true;
            $scope['signature' + i + 'Date'] = null;
        }

        /**
         * Get merchant signatures
         * @method getMerchantSignatures
         * @param {} orderStatus
         * @return
         */
        $scope.getMerchantSignatures = function(orderStatus) {
            if (orderStatus && orderStatus == 'Application Signed') {
                $scope.showSignatures = true;
                fdService.getMerchantSignatures($scope.orderId)
                    .success(function(data) {
                        $scope.assignMerchantSignatures = data;
                    })
                    .error(function(data, status, headers, config) {});
            } else {
                $scope.assignMerchantSignatures = "";
            }

        };

        /**
         * Description
         * @method createGUID
         * @return BinaryExpression
         */
        $scope.createGUID = function() {
            /**
             * Description
             * @method random
             * @return CallExpression
             */
            function random() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return random() + random() + '-' + random() + '-' + random() + '-' +
                random() + '-' + random() + random() + random();
        }

        /**
         * Description
         * @method submitTC
         * @return
         */
        $scope.submitTC = function() {
            if ($scope.isFormNotValid()) return;
            $scope.clickedTCSubmit = true;

            var orderId = fdService.getOrderId() || $routeParams.orderID;
            if (!orderId) {
                $scope.clickedTCSubmit = false;
                return;
            }

            var sdata = {
                orderId: orderId,
            };
            sdata.signatures = [];

            for (var i = 0; i < $scope.totalSigns; i++) {
                if(!$scope.signatures[i].readOnly){
                    var canvas;
                    if (!$scope.showSignBox()) {
                        canvas = $scope.signCanvases[i + 1] ? $scope.signCanvases[i + 1] : null;
                    } else {
                        canvas = $document[0].getElementById('signature' + (i + 1));
                    }
                    var signature = canvas ? canvas.toDataURL().replace(/^data:image\/(png);base64,/, "") : 'NA';
                    var name = $scope.signatures[i].type + '_' + $scope.signatures[i].position;
                    sdata.signatures.push({
                        name: name,
                        ownerId: $scope.signatures[i].ownerId,
                        signature: signature
                    });
                }
            }

            //Audit trail information to backend
            var cd = fdService.getCDFromSession();
            var merchantName = cd.first_name + ' ' + cd.last_name;
            var email = cd.email;
            var p = fdService.getGeoData();
            var langAndLat = p ? p.coords.latitude + ',' + p.coords.longitude : '';
            var acceptedAgreementDate = $scope.acceptedAgreementDate;
            sdata['contractAuditTrailRequestModel'] = {
                'merchantName': merchantName,
                'merchantEmail': email,
                'geoLocation': langAndLat,
                'signDate': new Date().toJSON(),
                'acceptedAgreementDate': new Date().toJSON()
            }

            if (!angular.isUndefined($scope.GUID) && !$rootScope.logged_in) {
                sdata['threatmetrixGuid'] = $scope.GUID;
            }

            fdService.submitSignature(sdata)
                .success(function(data, status, headers, config) {
                    if (!$rootScope.logged_in) {
                        $location.path('/verify-identity/' + orderId);
                    } else {
                        $location.path('/thankyou');
                    }
                    fdService.clearOrderId();
                    fdService.clearSignupData();
                    fdService.clearCart();
                    fdService.clearCategoryFromSession();
                    fdService.clearCDSession();
                    fdService.clearTransactionInfo();
                    fdService.clearOrderedCart();
                    fdService.clearAcquiringPricing();
                    fdService.clearEquipmentPricing();
                    $rootScope.cart = fdService.getCart();
                })
                .error(function(data, status, headers, config) {
                    $scope.clickedTCSubmit = false;
                });
        };

        ///////////////// MAIN ////////////////////////////////


        _init();




    }
]);