<div ng-controller="CartCtrl" id="cart" class="column-4" ng-class="{'faded': showTrDetailBox}" ng-show="cart.total_qty || cart.payment_types" ng-init="showTrDetailBox = false; sampleTransAmount = 25;">
  
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
    
    <h2>Order Summary</h2>
    <p class="sub">One Time Cost</p>
    <table id="cart-items" ng-show="cart.total_purchase_qty || cart.payment_types || (cart.onetimeFees | lengthOfObject) || (!cart.purchaseEnabled && cart.total_lease_qty)">
      <tr ng-repeat="(key, p) in cart.data">
        <td>
          <div ng-if="p.term == CONST.PURCHASE_CODE || p.term == CONST.OWNED_CODE">
           <p><a class="link" ng-href="#/product/{{p.id}}">{{p.name}}</a></p>
           <div id="cart-item-actions">Quantity: <span ng-hide="isAllowEdit()">{{p.qty}}</span>
             <span ng-show="isAllowEdit()">
               <select ng-model="p.qty" ng-change="qtyChanged()" >
                 <option ng-repeat="n in [] | range_s:1:10" ng-value="n">{{n}}</option>
               </select>
               <a class="link" id="remove-from-cart" ng-click="removeFromCart(p.id)">Remove</a>
             </span>
           </div>
           <p><a ng-show="isAllowEdit() && p.min_lease_amount" ng-click="leaseProduct(p)" class="link small lease-now">Lease for for as low as {{p.min_lease_amount|currency}}/mo</p>
         </div>
        </td>
        <td class="align-right"><div ng-if="p.term == CONST.PURCHASE_CODE || p.term == CONST.OWNED_CODE"><div ng-if="p.term == CONST.PURCHASE_CODE || p.term == CONST.OWNED_CODE">${{p.price | numberNF : 2}}</div></div></td>
      </tr>
      <tr ng-if="cart.onetimeFees | lengthOfObject" ng-repeat="fee in cart.onetimeFees | orderByObj:'name'">
         <td>
           <p>{{fee.name}}</p>
         </td>
         <td class="align-right">${{fee.amount | numberNF : 2}}</td>
       </tr>
      
      
      <tr class="product-requirement-notification" ng-repeat="err in cart.validation.carterrors" ng-hide="cart.validation.iscartvalid">
        <td colspan="2">
          <p class="red"><strong>Required:</strong> {{err.errormessage}}</p>
          <div id="cart-item-actions">
            <a class="link" id="remove-from-cart" ng-href="#/products/t/{{err.errortype}}">Browse Products</a>
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
     <p class="sub cart-table-toggle" ng-click="showRecFee = !showRecFee">Recurring Fee <i ng-show="allowExpand" class="fa cart-table-toggle" ng-class="{'fa-chevron-down': !showRecFee, 'fa-chevron-up': showRecFee}"></i><span>${{cart.total_product_fee_amount + cart.mfeeAmount + cart.lease_amount | number : 2}}/mo</span></p>
     <table class="cart-items" id="recurring-fees" ng-show="showRecFee || !allowExpand">
       <tr ng-if="cart.product_fees | lengthOfObject" ng-repeat="fee in cart.product_fees">
         <td>
           <p>{{fee.name}}</p>
         </td>
         <td class="align-right">${{fee.amount | numberNF : 2}}/mo</td>
       </tr>
        <tr class="lease" ng-repeat="(key, p) in cart.data" ng-show="cart.total_lease_qty">
         <td>
          <div ng-if="p.term != CONST.PURCHASE_CODE && p.term != CONST.OWNED_CODE">
            <p><a class="link" ng-href="#/product/{{p.id}}">{{p.name}}</a></p>
            <div id="cart-item-actions">
              <div>
                Quantity: <span ng-hide="isAllowEdit()">{{p.qty}}</span>
                <span ng-show="isAllowEdit()">
                   <select ng-model="p.qty" ng-change="qtyChanged()" >
                     <option ng-repeat="n in [] | range_s:1:10" ng-value="n">{{n}}</option>
                   </select>
                 </span>
              </div>
              <div>
                Leasing Option: Monthly
              </div>
              <div>
                Leasing Term: <span ng-hide="isAllowEdit()">{{p.pmodel.purchaseTypeLabel}}</span>
                <span ng-if="isAllowEdit()">
                 <select id="leasing-term" ng-model="p.term" ng-change="qtyChanged()">
                   <option ng-repeat="m in p.pricingModel | filter:{purchaseType: '!P'}:true | filter:{purchaseType: '!O'}:true" value="{{m.purchaseType}}" >{{m.purchaseTypeLabel}}</option>
                 </select>
                </span>
              </div>
              <span ng-show="isAllowEdit()"><a class="link" id="remove-lease" ng-click="removeFromCart(p.id)">Remove</a></span>
            </div>
          </div>
         </td>
         <td class="align-right" id="leasing-fee"><div ng-if="p.term != CONST.PURCHASE_CODE && p.term != CONST.OWNED_CODE"><div ng-if="p.term != CONST.PURCHASE_CODE && p.term != CONST.OWNED_CODE">{{p.pmodel.defaultAmt|currency}}/mo</div></div></td>
       </tr>
       <tr ng-if="cart.mFees | lengthOfObject" ng-repeat="fee in cart.mFees">
         <td>
           <p>{{fee.name}}</p>
         </td>
         <td class="align-right">${{fee.amount | numberNF : 2}}/mo</td>
       </tr>
       <tr class="order-summary-total">
         <td>Total</td>
         <td class="align-right">${{cart.total_product_fee_amount + cart.mfeeAmount + cart.lease_amount | numberNF : 2}}/mo</td>
       </tr>
     </table>
     <br>
    </div>
    
    <div ng-if="cart.payment_types">
     <p class="sub cart-table-toggle" ng-click="transactionFee = !transactionFee">Transaction Fee <i ng-show="allowExpand" class="fa cart-table-toggle" ng-class="{'fa-chevron-down': !transactionFee, 'fa-chevron-up': transactionFee}"></i><span ng-show="cart.transaction_fee">{{cart.transaction_fee.rate}}% + {{cart.transaction_fee.fee|currency}}</span><span ng-hide="cart.transaction_fee.rate || cart.transaction_fee.fee">TBD</span></p>
     <table class="cart-items" ng-show="transactionFee || !allowExpand">
       <tr>
         <td>
           <p><strong><a class="link" ng-href="#/processing/{{cart.payment_types.id}}">{{cart.payment_types.name}}</a></strong><span ng-show="isAllowEdit()"> | <a class="small link" ng-click="removePaymentTypes()">Remove</a></span></p>
           <p ng-repeat="p in cart.payment_types.products track by $index">&nbsp;&bullet; {{p.name}} <a class="small link" ng-click="removeProcessing(p)" ng-show="isAllowEdit()">Remove</a></p>
         </td>
         <td class="align-right">
             <div ng-show="cart.transaction_fee">
                 <span>{{cart.transaction_fee.rate}}% + {{cart.transaction_fee.fee|currency}}</span>
                <p><a class="small link" data-toggle="modal" data-target="#view-fees-modal">View Details</a>
             </div>
             <div ng-hide="cart.transaction_fee.rate || cart.transaction_fee.fee">TBD</div>
         </td>
       </tr>
     </table>
    </div>
    
     <div id="cart-actions">
      <a ng-if="!orderId" ng-hide="page == 'thankyou' || !logged_in" class="link-blue align-center" ng-href="{{!showTrDetailBox ? '#/products/c' : null}}">Continue Shopping</a>
      <a ng-if="page == 'proposal'" ng-href="#/signup" class="btn" ng-class="{'disabled': !orderId}">Sign Up</a>
      <a ng-if="page == 'solution' || page == 'product' || page == 'family' || page == 'processing'" ng-click="!cart.validation.iscartvalid || proceedToCheckout()" class="btn" ng-class="{'disabled': !cart.validation.iscartvalid}">PROCEED TO CHECKOUT</a>
      <a ng-if="page == 'shipping'" class="btn" ng-click="!shippingForm.$valid || !cart.validation.iscartvalid || gotoSummary()" ng-class="{'disabled': !shippingForm.$valid || !cart.validation.iscartvalid}">Review Order</a>

      <a ng-if="page == 'transaction_info'" class="btn" ng-click="!cart.validation.iscartvalid || !transactionInfoForm.$valid || saveTransactionInfo(transactionInfoForm)" ng-class="{'disabled': !cart.validation.iscartvalid || !transactionInfoForm.$valid}">Next</a>
     
      <div ng-if="page == 'summary'">
        <a class="btn" ng-class="{'disabled': !cart.validation.iscartvalid}" ng-click="!cart.validation.iscartvalid || placeOrder()">Place Order</a>
      </div>
      <br ng-hide="page == 'thankyou'">
      <p class="small">Payment Processing Fees will be determined based on industry, transactional volume, estimated average ticket, and estimated highest ticket size.</p>
    </div>
  </div>
    <!-- View Fees Modal -->
    <div class="modal fade include-detail-modal" tabindex="-1" role="dialog" id="view-fees-modal">
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
                                            <strong>{{cart.transaction_fee.rate}}% + {{cart.transaction_fee.fee|currency}} is the qualified rate</strong>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody style="border: none;">
                                        <tr>
                                            <td><strong>Description</strong></td>
                                            <td class="align-right"><strong>Rate (%)</strong></td>
                                            <td class="align-right"><strong>Fee ($)</strong></td>
                                        </tr>
                                        <tr ng-repeat="p in acquiringPricing track by $index">
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
</div>