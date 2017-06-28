<div ng-controller="CartCtrl" ng-attr-id="{{page == 'cart' ? 'cart-page' : 'cart'}}" ng-class="{'faded': showTrDetailBox, 'column-4': (page != 'cart')}" ng-show="cart.total_qty || cart.payment_types || cart.transaction_products.length" ng-init="showTrDetailBox = false; sampleTransAmount = 25;">

    <div class="transaction-fee-detail" ng-show="showTrDetailBox">
        <p class="sub">Transaction fee detail <a class="transaction-fee-detail-toggle" ng-click="showTrDetailBox = false">Hide Details <i class="fa fa-times"></i></a></p>
        <table class="cart-items">
            <tr>
                <td colspan="2" align="center" class="align-center">
                    <p><strong>Here is the rate detail</strong></p>
                </td>
            </tr>
            <tr>
                <td>Swiped</td>
                <td class="align-right"> 2.69% + $0.05</td>
            </tr>
            <tr>
                <td>Non-swiped</td>
                <td class="align-right"> 3.69% + $0.05</td>
            </tr>
            <tr>
                <td colspan="2" align="center" class="align-center">
                    <p><strong>Sample costs per sale amount</strong></p>
                    <table id="sample-amount-toggle">
                        <tr>
                            <td class="sample-amount-toggle" ng-class="{'selected': 5 == sampleTransAmount}" ng-click="sampleTransAmount = 5"><a>$5</a></td>
                            <td class="sample-amount-toggle" ng-class="{'selected': 10 == sampleTransAmount}" ng-click="sampleTransAmount = 10"><a>$10</a></td>
                            <td class="sample-amount-toggle" ng-class="{'selected': 25 == sampleTransAmount}" ng-click="sampleTransAmount = 25"><a>$25</a></td>
                            <td class="sample-amount-toggle" ng-class="{'selected': 100 == sampleTransAmount}" ng-click="sampleTransAmount = 100"><a>$100</a></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>Swiped</td>
                <td class="align-right"> ${{sampleTransAmount * 0.0269 + 0.05 | number : 2}}  ~ {{(sampleTransAmount * 0.0269 + 0.05) * 100 / sampleTransAmount | number : 2}}%</td>
            </tr>
            <tr>
                <td>Non-swiped</td>
                <td class="align-right"> ${{sampleTransAmount * 0.0369 + 0.05 | number : 2}}  ~ {{(sampleTransAmount * 0.0369 + 0.05) * 100 / sampleTransAmount | number : 2}}%</td>
            </tr>
        </table>
        <p class="sub transaction-fee-detail-toggle" ng-click="showTrDetailBox = false">Hide Details</p>
    </div>
    <div class="cart-contents" id="order-summary-container">

        <h2 ng-if="page != 'cart' ">Order Summary</h2>
        <p class="sub">One Time Cost</p>
        <table id="cart-items" ng-show="cart.total_purchase_qty || cart.payment_types || (cart.onetimeFees | lengthOfObject) || (!cart.purchaseEnabled && cart.total_lease_qty)">
            <tr ng-repeat="(key, p) in cart.data" ng-if="p.term == CONST.PURCHASE_CODE || p.term == CONST.OWNED_CODE">
                <td>
                    <div>
                        <p ng-show="!isProductsClickable()" class="link">{{p.name}} <span class="small gray">({{p.category}})</span></p>
                        <p ng-show="isProductsClickable()"><a class="link" ng-click="changeCategory(p.category)" ng-href="#/product/{{p.id}}">{{p.name}}</a> <span class="small gray">({{p.category}})</span></p>
                        <div id="cart-item-actions">Quantity: <span ng-hide="isAllowEdit()">{{p.qty}}</span>
                            <span ng-show="isAllowEdit()">
                              <select ng-model="p.qty" ng-change="qtyChanged()" ng-options="n as n for n in [] | range:1:10"></select>
                              <a class="link" id="remove-from-cart" ng-click="removeFromCart(key)">Remove</a>
                            </span>
                        </div>
                        <p><a ng-show="isAllowEdit() && p.min_lease_amount" ng-click="leaseProduct(p)" class="link small lease-now">Lease for as low as {{p.min_lease_amount|currency}}/mo</p>
                    </div>
                </td>
                <td class="align-right"><div ng-if="p.term == CONST.PURCHASE_CODE || p.term == CONST.OWNED_CODE"><div ng-if="p.price != undefined">${{p.price | numberNF : 2}}</div><div ng-if="p.price == undefined">TBD</div></div></td>
            </tr>
            <tr ng-if="cart.onetimeFees | lengthOfObject" ng-repeat="fee in cart.onetimeFees | orderByObj:'name'">
                <td>
                    <p>{{fee.name}}</p>
                </td>
                <td class="align-right">${{fee.amount | numberNF : 2}}</td>
            </tr>


            <tr class="product-requirement-notification" ng-repeat="err in cart.validation.carterrors | orderBy:'_errorOrder' | limitTo:1" ng-hide="cart.validation.iscartvalid">
                <td colspan="2">
                    <p class="red">{{err.errormessage}}</p>
                    <div id="cart-item-actions2" ng-if="err.errortype">
                        <a class="link" ng-attr-id="remove-from-cart2" ng-if="err.productType != 'Options'" ng-href="{{!cart.total_qty ? '#/products/c' : ('#/products/t/' + err.errortype)}}">Browse Products</a>
                        <a class="link" ng-attr-id="remove-from-cart2" ng-if="err.productType == 'Options'" ng-href="{{'#/options/' + err.errortype}}">Browse Products</a>
                    </div>
                </td>
            </tr>
        </table>
        <table id="order-summary">
            <tr ng-show="cart.total_purchase_qty">
                <td>Total before tax</td>
                <td class="align-right">${{cart.amount + cart.onetimeAmount | numberNF : 2}}</td>
            </tr>
            <tr>
                <td>Shipping & handling</td>
                <td class="align-right">{{cart.shipping_amount ? '$' + cart.shipping_amount : 'Free'}}</td>
            </tr>
            <tr>
                <td><span ng-show="cart.taxPercent < 0 || !cart.shippingAddress.zip || !cart.shippingAddress.city">Estimated tax</span><span ng-hide="cart.taxPercent < 0 || !cart.shippingAddress.zip || !cart.shippingAddress.city">Tax</span></td>
                <td class="align-right">{{cart.tax ? cart.tax : (cart.taxPercent >= 0 ? 0 : 'TBD' ) | numberDollar : 2}}</td>
            </tr>
            <tr id="order-summary-total">
                <td>One-Time Total</td>
                <td class="align-right">${{cart.total + cart.onetimeAmount | number : 2}}</td>
            </tr>
        </table>
        <div ng-show="(cart.product_fees | lengthOfObject) || (cart.mFees | lengthOfObject) || cart.total_lease_qty">
            <p class="sub cart-table-toggle" ng-click="showRecFee = !showRecFee">Recurring Fee <i ng-show="allowExpand" class="fa cart-table-toggle" ng-class="{'fa-chevron-down': !showRecFee, 'fa-chevron-up': showRecFee}"></i><span>${{cart.total_product_fee_amount + cart.mfeeAmount + cart.lease_amount + cart.leaseTax | number : 2}}/mo</span></p>
            <table class="cart-items" id="recurring-fees" ng-show="showRecFee || !allowExpand">
                <tr ng-if="cart.product_fees | lengthOfObject" ng-repeat="fee in cart.product_fees">
                    <td>
                        <p>{{fee.name}}</p>
                    </td>
                    <td class="align-right">${{fee.amount | numberNF : 2}}/mo</td>
                </tr>

                <tr class="lease" ng-repeat="(key, p) in cart.data" ng-show="cart.total_lease_qty" ng-if="p.term != CONST.PURCHASE_CODE && p.term != CONST.OWNED_CODE">
                    <td>
                        <div>
                            <p ng-show="!isProductsClickable()">{{p.name}} <span class="small gray">({{p.category}})</span></p>
                            <p ng-show="isProductsClickable()"><a class="link" ng-click="changeCategory(p.category)" ng-href="#/product/{{p.id}}">{{p.name}}</a> <span class="small gray">({{p.category}})</span></p>
                            <div id="cart-item-actions">
                                <div>
                                    Quantity: <span ng-hide="isAllowEdit()">{{p.qty}}</span>
                                    <span ng-show="isAllowEdit()">
                                       <select ng-model="p.qty" ng-change="qtyChanged()" ng-options="n as n for n in [] | range:1:10"></select>
                                    </span>
                                </div>
                                <div>
                                    Financing Option: Monthly
                                </div>
                                <div>
                                    Financing Term: <span ng-hide="isAllowEdit()">{{p.pmodel.purchaseTypeLabel}}</span>
                                    <div ng-if="isAllowEdit()">
                                        <select ng-attr-id="leasing-term" ng-model="p.termPaymentType" ng-change="paymentTypeChanged(p)">
                                           <option ng-repeat="m in models(p.pricingModel) | filter:{purchaseType: '!P'}:true | filter:{purchaseType: '!O'}:true" value="{{m.paymentType}}" >{{m.paymentType}}</option>
                                        </select>
                                        <select ng-attr-id="leasing-term" ng-show="((p.term).indexOf('LT') !== -1)" ng-model="p.term" ng-change="qtyChanged()">
                                            <option ng-repeat="m in p.pricingModel | filter:{purchaseType: 'LT'}" value="{{m.purchaseType}}">{{m.paymentTerm}} Months</option>
                                        </select>
                                        <select id="installment-payments" ng-show="((p.term).indexOf('IP') !== -1)" ng-model="p.term" ng-change="qtyChanged()">
                                            <option ng-repeat="m in p.pricingModel | filter:{purchaseType: 'IP'}" value="{{m.purchaseType}}">{{m.paymentTerm}} Months</option>
                                        </select>
                                    </div>
                                </div>
                                <span ng-show="isAllowEdit()"><a class="link" id="remove-lease" ng-click="removeFromCart(key)">Remove</a></span>
                            </div>
                        </div>
                    </td>
                    <td class="align-right" id="leasing-fee">
                        <div ng-if="p.term != CONST.PURCHASE_CODE && p.term != CONST.OWNED_CODE">
                            <div ng-if="p.term != CONST.PURCHASE_CODE && p.term != CONST.OWNED_CODE">{{p.pmodel.defaultAmt|currency}}/mo</div>
                        </div>
                    </td>
                </tr>
                <tr ng-if="cart.mFees | lengthOfObject" ng-repeat="fee in cart.mFees">
                    <td>
                        <p>{{fee.name}}</p>
                    </td>
                    <td class="align-right">${{fee.amount | numberNF : 2}}/mo
                        <span class="block small gray" ng-if="fee.disclosure">Per Location</span>
                    </td>
                </tr>
                <tr>
                    <td><span ng-show="cart.taxPercent < 0 || !cart.shippingAddress.zip || !cart.shippingAddress.city">Estimated tax</span><span ng-hide="cart.taxPercent < 0 || !cart.shippingAddress.zip || !cart.shippingAddress.city">Tax</span></td>
                    <td class="align-right">{{cart.leaseTax ? cart.leaseTax : (cart.taxPercent >= 0 ? 0 : 'TBD' ) | numberDollar : 2}}</td>
                </tr>
                <tr class="order-summary-total">
                    <td>Total</td>
                    <td class="align-right">${{cart.total_product_fee_amount + cart.mfeeAmount + cart.lease_amount + cart.leaseTax | numberNF : 2}}/mo</td>
                </tr>
            </table>
            <br>
        </div>

        <div ng-if="cart.payment_types || cart.transaction_products.length">
            <p class="sub cart-table-toggle" ng-click="transactionFee = !transactionFee">Transaction Fee <i ng-show="allowExpand" class="fa cart-table-toggle" ng-class="{'fa-chevron-down': !transactionFee, 'fa-chevron-up': transactionFee}"></i></p>
            <table class="cart-items" ng-show="transactionFee || !allowExpand">
              <tbody ng-if="cart.payment_types && !(cart.payment_types.groups && cart.payment_types.groups.length)">
                <tr>
                    <td>
                        <p><strong><p ng-show="!isProductsClickable()">{{cart.payment_types.name}}</p><a ng-show="isProductsClickable()" class="link" ng-href="#/processing/{{cart.payment_types.id}}">{{cart.payment_types.name}}</a></strong><span ng-show="isAllowEdit()"> | <a class="small link" ng-click="removePaymentTypes()">Remove</a></span></p>
                        <p ng-repeat="p in cart.payment_types.products track by $index">&nbsp;&bullet; {{p.name}} <a class="small link" ng-click="removeProcessing(p)" ng-show="isAllowEdit()">Remove</a></p>
                    </td>
                    <td class="align-right">TBD</td>
                </tr>
              </tbody>
              <tbody>
              <tbody ng-repeat="g in cart.payment_types.groups track by $index" ng-if="cart.payment_types && cart.payment_types.groups && cart.payment_types.groups.length">
                <tr>
                    <td>
                        <p><strong><p ng-show="!isProductsClickable()">{{cart.payment_types.name}}</p><a ng-show="isProductsClickable()" class="link" ng-href="#/processing/{{cart.payment_types.id}}">{{cart.payment_types.name}}</a> <span class="small">({{g.name}})</span></strong><span ng-show="isAllowEdit()"> | <a class="small link" ng-click="removePaymentTypes()">Remove</a></span></p>
                        <p ng-repeat="p in cart.payment_types.products track by $index">&nbsp;&bullet; {{p.name}} <a class="small link" ng-click="removeProcessing(p)" ng-show="isAllowEdit()">Remove</a></p>
                    </td>
                    <td class="align-right">{{g.rate}}% + {{g.fee|currency}}</td>
                </tr>
              </tbody>
              <tbody>
                <tr ng-repeat="p in cart.transaction_products track by $index">
                  <td>
                    <p><p ng-show="!isProductsClickable()">{{p.name}}</p><a ng-show="isProductsClickable()" class="link" ng-href="#/{{p.parentProduct.id ? 'family' : 'product'}}/{{p.parentProduct.id ? p.parentProduct.id : p.id}}">{{p.name}}</a><span ng-show="isAllowEdit()"> | <a class="small link" ng-click="removeTransactionProduct(p)">Remove</a></span></p>
                  </td>


                  <td class="align-right">
                    <span ng-show="p.parentProduct.fee || p.parentProduct.rate">{{p.parentProduct.rate}}% + {{p.parentProduct.fee|currency}}</span><span ng-hide="p.parentProduct">TBD</span>
                  </td>
                </tr>
              </tbody>
              <tbody ng-show="cart.payment_types.products">
              <tr>
              <td></td>
              <td class="align-right">
              <div ng-show="cart.payment_types.products">
                <p><a class="small link" data-toggle="modal" data-target="#view-fees-modal">View Details</a>
              </div>
              </td>
              </tr>
              </tbody>
            </table>
        </div>

        <!-- <a class="btn" ng-click="sendProp()">prop</a> -->

        <div id="cart-actions">
            <a ng-if="!orderId" ng-hide="page == 'cart' || page == 'thankyou' || !logged_in" class="link-blue align-center" ng-href="{{!showTrDetailBox ? '#/products/c' : null}}">Continue Shopping</a>
            <a ng-if="page == 'multi-locations'" ng-click="!cart.validation.iscartvalid || !cart.num_locations_selected || proceedToCheckoutML()" class="btn" ng-class="{'disabled': !cart.validation.iscartvalid || !cart.num_locations_selected}">Next</a>
            <a ng-if="page == 'proposal'" ng-href="#/signup/owner" class="btn" ng-class="{'disabled': !orderId}">Sign Up</a>
            <a ng-if="page == 'solution' || page == 'product' || page == 'family' || page == 'processing' || page == 'options'" ng-click="!cart.validation.iscartvalid || proceedToCheckout()" class="btn" ng-class="{'disabled': !cart.validation.iscartvalid}">PROCEED TO CHECKOUT</a>
            <a ng-if="page == 'shipping'" class="btn" ng-click="!shippingForm.$valid || !pricingFormsOk() || !cart.validation.iscartvalid || reviewOrder()" ng-class="{'disabled': !shippingForm.$valid || !pricingFormsOk() || !cart.validation.iscartvalid || disableReviewOrder}"><i ng-show="disableReviewOrder" class="fa fa-spinner fa-spin fa-lg fa-fw"></i>Review Order</a>
            <!-- <a ng-if="one_step && page == 'shipping'" class="btn" ng-click="placeOrder(!shippingForm.$valid || !cart.purchaseEnabled || !orderId)" ng-class="{'disabled': !shippingForm.$valid || !cart.purchaseEnabled || !orderId}" ng-disabled="!shippingForm.$valid || !cart.purchaseEnabled || !orderId">Place Order</a> -->

            <a ng-if="page == 'transaction_info'" class="btn" ng-click="!cart.validation.iscartvalid || !transactionInfoForm.$valid || saveTransactionInfo(transactionInfoForm)" ng-class="{'disabled': !cart.validation.iscartvalid || !transactionInfoForm.$valid}">Next</a>

            <div ng-if="page == 'summary'">
                <a class="btn" ng-class="{'disabled': !orderId}" ng-click="placeOrder(showTrDetailBox)" ng-disabled="!orderId"><i ng-show="placeOrderInProgress" class="fa fa-spinner fa-spin fa-lg fa-fw"></i>Place Order</a>
            </div>
            <br ng-hide="page == 'thankyou'">
            <p class="small">Payment Processing Fees will be determined based on industry, transactional volume, estimated average ticket, and estimated highest ticket size.</p>
    </div>
  </div>
</div>

<!-- View Fees Modal -->
    <div ng-controller="CartCtrl" class="modal fade include-detail-modal" tabindex="-1" role="dialog" id="view-fees-modal">
        <div class="vertical-alignment-helper">
            <div class="modal-dialog vertical-align-center">
                <div class="modal-content">
                    <div class="modal-header">
                        <a class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true"><i class="fa fa-times"></i></span></a>
                        <h4 class="modal-title">Rates and Fees</strong></h4>
                    </div>
                    <div class="modal-body row">
                        <div class="rates-details-modal">
                            <div class="column-6">

                                <table class="table rates">
                                    <thead>
                                    <tr>
                                        <th colspan="3">
                                            <h3 style="margin-bottom:0;">{{cart.payment_types.name}}</h3>
                                            <strong>{{cart.payment_types.groups[0].rate}}% + {{cart.payment_types.groups[0].fee|currency}} is the qualified rate</strong>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody style="border: none;">
									    <tr>
											<td><strong>DiscountRates</strong></td>
                                            <td class="align-right"></td>
                                            <td class="align-right"></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Description</strong></td>
                                            <td class="align-right"><strong>Rate (%)</strong></td>
                                            <td class="align-right"><strong>Fee ($)</strong></td>
                                        </tr>
                                        <tr ng-repeat="p in acquiringPricing.discountRates track by $index">
                                            <td>{{p.productName}}</td>
                                            <td class="align-right"><span>{{p.rateDefault}}</span></td>
                                            <td class="align-right"><span>{{p.defaultAmt}}</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="column-6">
                                <table class="table rates">
                                    <thead>
                                    <tr>
                                        <th colspan="3">
                                            <h3 style="margin-bottom:0;">Product Pricing</h3>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody style="border: none;">
                                        <tr>
                                            <td><strong>Description</strong></td>
                                            <td class="align-right"><strong>Rate (%)</strong></td>
                                            <td class="align-right"><strong>Fee ($)</strong></td>
                                        </tr>
                                        <tr ng-repeat="p in equipmentPricing track by $index">
                                            <td>{{p.productName}}</td>
                                            <td class="align-right"><span>{{p.rateDefault}}</span></td>
                                            <td class="align-right"><span>{{p.defaultAmt}}</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table class="table rates">
                                    <thead>
                                    <tr>
                                        <th colspan="3">
                                            <h3 style="margin-bottom:0;">Rates - Applies to all</h3>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody style="border: none;">
                                        <tr>
                                            <td><strong>Description</strong></td>
                                            <td class="align-right"><strong>Rate (%)</strong></td>
                                            <td class="align-right"><strong>Fee ($)</strong></td>
                                        </tr>
                                        <tr ng-repeat="p in globalPricing track by $index">
                                            <td>{{p.productName}}</td>
                                            <td class="align-right"><span>{{p.rateDefault}}</span></td>
                                            <td class="align-right"><span>{{p.defaultAmt}}</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>