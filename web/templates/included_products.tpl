<div ng-if="includes.length">
 <section>
   <div class="container" id="product-contents">
     <h3>Includes</h3>
     <div>
       <a class="product-content column-2 link" ng-repeat="p in includes" data-toggle="modal" data-target="#include-{{p.productId}}-{{timestamp}}">
         <img ng-src="{{p.imageUrls[0] ? p.imageUrls[0] : placeholderImageUrl}}" />
         <p>{{p.productName}}</p>
       </a>
     </div>
   </div>
 </section>
 <div class="modal fade" tabindex="-1" role="dialog" ng-attr-id="include-{{p.productId}}-{{timestamp}}" ng-repeat="p in includes">
   <div class="vertical-alignment-helper">
     <div class="modal-dialog vertical-align-center">
       <div class="modal-content">
         <div class="modal-header">
           <a class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true"><i class="fa fa-times"></i></span></a>
           <h4 class="modal-title">{{bundle_info.productName}} <i>&raquo;</i> <strong>{{p.productName}}</strong></h4>
         </div>
         <div class="modal-body row">
           <div class="column-12 include-detail">
             <div class="column-3">
               <img ng-src="{{p.imageUrls[0] ? p.imageUrls[0] : placeholderImageUrl}}" />
             </div>
             <div class="column-9">
               <h1>{{p.productName}}</h1>
               <h3 class="green" ng-show="p.price">{{p.price|currency}}/mo</h3>
               <p>{{p.productLongDescription}}</p>
             </div>
           </div>
         </div>
         </div>
     </div>
   </div>
 </div>
</div>