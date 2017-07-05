<div class="modal" tabindex="-1" role="dialog" ng-attr-id="video-{{bundle.productId}}">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <a class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true"><i class="fa fa-times"></i></span></a>
        <h4 class="modal-title">Meet {{bundle.bundleName}}</h4>
      </div>
      <div class="modal-body">
        <div style="display: block; position: relative; max-width: 100%;">
          <div style="height:270px;">
            <video data-video-id="{{bundle.video_id[0]}}"
            data-account="940277645001"
            data-player="V1ELY5Apl"
            data-embed="default"
            class="video-js"
            controls
            style="width: 100%; position: absolute; top: 0px; bottom: 0px; right: 0px; left: 0px;"></video>
            <script src="https://players.brightcove.net/940277645001/V1ELY5Apl_default/index.min.js"></script>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>