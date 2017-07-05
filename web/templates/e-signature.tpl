<div ng-controller="EsignatureCtrl" ng-show="showAll">
    <div id="esignature-optin" class="clearfix">
        <i class="fa fa-long-arrow-right fa-3x float-left orange" aria-hidden="true"></i>
        <div class="float-left checkbox">
            <input id="esignature-optin-check" type="checkbox" ng-model="agree">
            <label for="esignature-optin-check">
                I agree to electronic records and e-signature.
            </label>
        </div>
        <a class="button float-right" id="esignature-optin-button" ng-show="agree" ng-click="clickContinue()">Continue</a>
    </div>
    <div id="esignature-optin-overlay" class="in"></div>
</div>
