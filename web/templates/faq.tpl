<section id="faq" ng-show="faqs.length">
    <div class="container">
      <h2>Commonly Asked Questions</h2>
      <div class="faq-question" ng-repeat="f in faqs track by $index">
        <i class="fa fa-info-circle"></i>
        <a ng-href="{{f.url}}" target="_blank">{{f.header}}</a>
        <p>{{f.shortAnswer | limitToEllipsis : 230}}</p>
      </div>
      <div class="faq-question">
        <i class="fa fa-ellipsis-h"></i>
        <a href="https://gyftteam.atlassian.net/wiki/display/KB/Knowledge+Base" target="_blank">More</a>
      </div>
    </div>
  </section>

</div><!-- end .content -->