<header>
  <div id="top">
    <nav class="container">
      <a id="logo" href="#/"><img src="img/clover-logo-mono-white.svg" /></a>
      <ul id="main-menu" class="">
        <li><a class="nav-main-item" href="https://www.clover.com/">Our Solutions</a></li>
        <li><a class="nav-main-item" ng-href="https://www.clover.com/get-started">Get Started</a></li>
        <li><a class="nav-main-item" href="https://www.clover.com/">Resources</a></li>
        <li id="cart-icon" ng-show="cart.total_qty"><a href="#/checkout/shipping"><img src="img/cart-white.svg"/><span>{{cart.total_qty}}</span></a></li>
      </ul>
      <a id="mobile-menu-toggle" toggle-menu="#mobile-menu"><i class="fa fa-bars"></i></a>
    </nav>
    <ul id="mobile-menu" style="display:none;">
      <li><a class="nav-main-item" href="https://www.clover.com/">Our Solutions</a></li>
      <li><a class="nav-main-item" ng-href="https://www.clover.com/get-started">Get Started</a></li>
      <li><a class="nav-main-item" href="https://www.clover.com/">Resources</a></li>
      <li id="cart-icon" ng-show="cart.total_qty"><a href="#/checkout/shipping"><img src="img/cart-white.svg"/><span>{{cart.total_qty}}</span>&nbsp;&nbsp;Cart</a></li>
    </ul>
  </div>
</header>
