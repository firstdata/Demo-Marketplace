<section id="product-accessories" ng-show="recommendedBundles.length">
  <div class="container">
    <h2>Customers have also purchased these products</h2>
    <div class="product-accessory column-2" ng-repeat="b in recommendedBundles | limitTo : 5">
      <a class="link-bold" ng-href="#/product/{{b.productId}}"><img ng-src="{{b.imageUrls[0] ? b.imageUrls[0] : placeholderImageUrl}}"></a>
      <p>{{b.productName | limitToEllipsis:20:0:480}}</p>
      <a class="link-blue" ng-href="#/product/{{b.productId}}">View Details</a>
    </div>
    <div class="product-accessory column-2">
      <a class="link-bold" href="#/products"><img src="img/more-item.jpg"></a>
    </div>
  </div>
</section>
