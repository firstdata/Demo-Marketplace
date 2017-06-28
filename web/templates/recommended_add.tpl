<section id="product-accessories" ng-show="recommendedBundles.length">
  <div class="container">
    <h2>Customers have also purchased these products</h2>
    <div class="product-accessory column-2" ng-repeat="b in recommendedBundles | limitTo : (recommendedBundles.length > 6 ? 5 : 6)">
      <a class="link-bold" ng-href="#/product/{{b.productId}}"><img ng-src="{{b.imageUrls[0] ? b.imageUrls[0] : placeholderImageUrl}}"></a>
      <p>{{b.productName | limitToEllipsis:20:0:480}}</p>
      <a class="link-blue" ng-click="addToCart(b)" data-bid="{{b.productId}}">Add to Cart</a>
    </div>
    <div class="product-accessory column-2" ng-show="recommendedBundles.length > 6">
      <a class="link-blue" href="#/products/{{pid}}/recommended-products"><img ng-src="{{ASSETS_FOLDER}}/img/more-item.jpg"></a>
    </div>
  </div>
</section>
