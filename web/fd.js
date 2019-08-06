/**
 * @license AngularJS v1.2.16
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular, undefined) {'use strict';

var $resourceMinErr = angular.$$minErr('$resource');

// Helper functions and regex to lookup a dotted path on an object
// stopping at undefined/null.  The path must be composed of ASCII
// identifiers (just like $parse)
var MEMBER_NAME_REGEX = /^(\.[a-zA-Z_$][0-9a-zA-Z_$]*)+$/;

function isValidDottedPath(path) {
  return (path != null && path !== '' && path !== 'hasOwnProperty' &&
      MEMBER_NAME_REGEX.test('.' + path));
}

function lookupDottedPath(obj, path) {
  if (!isValidDottedPath(path)) {
    throw $resourceMinErr('badmember', 'Dotted member path "@{0}" is invalid.', path);
  }
  var keys = path.split('.');
  for (var i = 0, ii = keys.length; i < ii && obj !== undefined; i++) {
    var key = keys[i];
    obj = (obj !== null) ? obj[key] : undefined;
  }
  return obj;
}

/**
 * Create a shallow copy of an object and clear other fields from the destination
 */
function shallowClearAndCopy(src, dst) {
  dst = dst || {};

  angular.forEach(dst, function(value, key){
    delete dst[key];
  });

  for (var key in src) {
    if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
      dst[key] = src[key];
    }
  }

  return dst;
}

/**
 * @ngdoc module
 * @name ngResource
 * @description
 *
 * # ngResource
 *
 * The `ngResource` module provides interaction support with RESTful services
 * via the $resource service.
 *
 *
 * <div doc-module-components="ngResource"></div>
 *
 * See {@link ngResource.$resource `$resource`} for usage.
 */

/**
 * @ngdoc service
 * @name $resource
 * @requires $http
 *
 * @description
 * A factory which creates a resource object that lets you interact with
 * [RESTful](http://en.wikipedia.org/wiki/Representational_State_Transfer) server-side data sources.
 *
 * The returned resource object has action methods which provide high-level behaviors without
 * the need to interact with the low level {@link ng.$http $http} service.
 *
 * Requires the {@link ngResource `ngResource`} module to be installed.
 *
 * @param {string} url A parametrized URL template with parameters prefixed by `:` as in
 *   `/user/:username`. If you are using a URL with a port number (e.g.
 *   `http://example.com:8080/api`), it will be respected.
 *
 *   If you are using a url with a suffix, just add the suffix, like this:
 *   `$resource('http://example.com/resource.json')` or `$resource('http://example.com/:id.json')`
 *   or even `$resource('http://example.com/resource/:resource_id.:format')`
 *   If the parameter before the suffix is empty, :resource_id in this case, then the `/.` will be
 *   collapsed down to a single `.`.  If you need this sequence to appear and not collapse then you
 *   can escape it with `/\.`.
 *
 * @param {Object=} paramDefaults Default values for `url` parameters. These can be overridden in
 *   `actions` methods. If any of the parameter value is a function, it will be executed every time
 *   when a param value needs to be obtained for a request (unless the param was overridden).
 *
 *   Each key value in the parameter object is first bound to url template if present and then any
 *   excess keys are appended to the url search query after the `?`.
 *
 *   Given a template `/path/:verb` and parameter `{verb:'greet', salutation:'Hello'}` results in
 *   URL `/path/greet?salutation=Hello`.
 *
 *   If the parameter value is prefixed with `@` then the value of that parameter is extracted from
 *   the data object (useful for non-GET operations).
 *
 * @param {Object.<Object>=} actions Hash with declaration of custom action that should extend
 *   the default set of resource actions. The declaration should be created in the format of {@link
 *   ng.$http#usage_parameters $http.config}:
 *
 *       {action1: {method:?, params:?, isArray:?, headers:?, ...},
 *        action2: {method:?, params:?, isArray:?, headers:?, ...},
 *        ...}
 *
 *   Where:
 *
 *   - **`action`** – {string} – The name of action. This name becomes the name of the method on
 *     your resource object.
 *   - **`method`** – {string} – HTTP request method. Valid methods are: `GET`, `POST`, `PUT`,
 *     `DELETE`, and `JSONP`.
 *   - **`params`** – {Object=} – Optional set of pre-bound parameters for this action. If any of
 *     the parameter value is a function, it will be executed every time when a param value needs to
 *     be obtained for a request (unless the param was overridden).
 *   - **`url`** – {string} – action specific `url` override. The url templating is supported just
 *     like for the resource-level urls.
 *   - **`isArray`** – {boolean=} – If true then the returned object for this action is an array,
 *     see `returns` section.
 *   - **`transformRequest`** –
 *     `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
 *     transform function or an array of such functions. The transform function takes the http
 *     request body and headers and returns its transformed (typically serialized) version.
 *   - **`transformResponse`** –
 *     `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
 *     transform function or an array of such functions. The transform function takes the http
 *     response body and headers and returns its transformed (typically deserialized) version.
 *   - **`cache`** – `{boolean|Cache}` – If true, a default $http cache will be used to cache the
 *     GET request, otherwise if a cache instance built with
 *     {@link ng.$cacheFactory $cacheFactory}, this cache will be used for
 *     caching.
 *   - **`timeout`** – `{number|Promise}` – timeout in milliseconds, or {@link ng.$q promise} that
 *     should abort the request when resolved.
 *   - **`withCredentials`** - `{boolean}` - whether to set the `withCredentials` flag on the
 *     XHR object. See
 *     [requests with credentials](https://developer.mozilla.org/en/http_access_control#section_5)
 *     for more information.
 *   - **`responseType`** - `{string}` - see
 *     [requestType](https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#responseType).
 *   - **`interceptor`** - `{Object=}` - The interceptor object has two optional methods -
 *     `response` and `responseError`. Both `response` and `responseError` interceptors get called
 *     with `http response` object. See {@link ng.$http $http interceptors}.
 *
 * @returns {Object} A resource "class" object with methods for the default set of resource actions
 *   optionally extended with custom `actions`. The default set contains these actions:
 *   ```js
 *   { 'get':    {method:'GET'},
 *     'save':   {method:'POST'},
 *     'query':  {method:'GET', isArray:true},
 *     'remove': {method:'DELETE'},
 *     'delete': {method:'DELETE'} };
 *   ```
 *
 *   Calling these methods invoke an {@link ng.$http} with the specified http method,
 *   destination and parameters. When the data is returned from the server then the object is an
 *   instance of the resource class. The actions `save`, `remove` and `delete` are available on it
 *   as  methods with the `$` prefix. This allows you to easily perform CRUD operations (create,
 *   read, update, delete) on server-side data like this:
 *   ```js
 *   var User = $resource('/user/:userId', {userId:'@id'});
 *   var user = User.get({userId:123}, function() {
 *     user.abc = true;
 *     user.$save();
 *   });
 *   ```
 *
 *   It is important to realize that invoking a $resource object method immediately returns an
 *   empty reference (object or array depending on `isArray`). Once the data is returned from the
 *   server the existing reference is populated with the actual data. This is a useful trick since
 *   usually the resource is assigned to a model which is then rendered by the view. Having an empty
 *   object results in no rendering, once the data arrives from the server then the object is
 *   populated with the data and the view automatically re-renders itself showing the new data. This
 *   means that in most cases one never has to write a callback function for the action methods.
 *
 *   The action methods on the class object or instance object can be invoked with the following
 *   parameters:
 *
 *   - HTTP GET "class" actions: `Resource.action([parameters], [success], [error])`
 *   - non-GET "class" actions: `Resource.action([parameters], postData, [success], [error])`
 *   - non-GET instance actions:  `instance.$action([parameters], [success], [error])`
 *
 *   Success callback is called with (value, responseHeaders) arguments. Error callback is called
 *   with (httpResponse) argument.
 *
 *   Class actions return empty instance (with additional properties below).
 *   Instance actions return promise of the action.
 *
 *   The Resource instances and collection have these additional properties:
 *
 *   - `$promise`: the {@link ng.$q promise} of the original server interaction that created this
 *     instance or collection.
 *
 *     On success, the promise is resolved with the same resource instance or collection object,
 *     updated with data from server. This makes it easy to use in
 *     {@link ngRoute.$routeProvider resolve section of $routeProvider.when()} to defer view
 *     rendering until the resource(s) are loaded.
 *
 *     On failure, the promise is resolved with the {@link ng.$http http response} object, without
 *     the `resource` property.
 *
 *     If an interceptor object was provided, the promise will instead be resolved with the value
 *     returned by the interceptor.
 *
 *   - `$resolved`: `true` after first server interaction is completed (either with success or
 *      rejection), `false` before that. Knowing if the Resource has been resolved is useful in
 *      data-binding.
 *
 * @example
 *
 * # Credit card resource
 *
 * ```js
     // Define CreditCard class
     var CreditCard = $resource('/user/:userId/card/:cardId',
      {userId:123, cardId:'@id'}, {
       charge: {method:'POST', params:{charge:true}}
      });

     // We can retrieve a collection from the server
     var cards = CreditCard.query(function() {
       // GET: /user/123/card
       // server returns: [ {id:456, number:'1234', name:'Smith'} ];

       var card = cards[0];
       // each item is an instance of CreditCard
       expect(card instanceof CreditCard).toEqual(true);
       card.name = "J. Smith";
       // non GET methods are mapped onto the instances
       card.$save();
       // POST: /user/123/card/456 {id:456, number:'1234', name:'J. Smith'}
       // server returns: {id:456, number:'1234', name: 'J. Smith'};

       // our custom method is mapped as well.
       card.$charge({amount:9.99});
       // POST: /user/123/card/456?amount=9.99&charge=true {id:456, number:'1234', name:'J. Smith'}
     });

     // we can create an instance as well
     var newCard = new CreditCard({number:'0123'});
     newCard.name = "Mike Smith";
     newCard.$save();
     // POST: /user/123/card {number:'0123', name:'Mike Smith'}
     // server returns: {id:789, number:'0123', name: 'Mike Smith'};
     expect(newCard.id).toEqual(789);
 * ```
 *
 * The object returned from this function execution is a resource "class" which has "static" method
 * for each action in the definition.
 *
 * Calling these methods invoke `$http` on the `url` template with the given `method`, `params` and
 * `headers`.
 * When the data is returned from the server then the object is an instance of the resource type and
 * all of the non-GET methods are available with `$` prefix. This allows you to easily support CRUD
 * operations (create, read, update, delete) on server-side data.

   ```js
     var User = $resource('/user/:userId', {userId:'@id'});
     User.get({userId:123}, function(user) {
       user.abc = true;
       user.$save();
     });
   ```
 *
 * It's worth noting that the success callback for `get`, `query` and other methods gets passed
 * in the response that came from the server as well as $http header getter function, so one
 * could rewrite the above example and get access to http headers as:
 *
   ```js
     var User = $resource('/user/:userId', {userId:'@id'});
     User.get({userId:123}, function(u, getResponseHeaders){
       u.abc = true;
       u.$save(function(u, putResponseHeaders) {
         //u => saved user object
         //putResponseHeaders => $http header getter
       });
     });
   ```
 *
 * You can also access the raw `$http` promise via the `$promise` property on the object returned
 *
   ```
     var User = $resource('/user/:userId', {userId:'@id'});
     User.get({userId:123})
         .$promise.then(function(user) {
           $scope.user = user;
         });
   ```

 * # Creating a custom 'PUT' request
 * In this example we create a custom method on our resource to make a PUT request
 * ```js
 *		var app = angular.module('app', ['ngResource', 'ngRoute']);
 *
 *		// Some APIs expect a PUT request in the format URL/object/ID
 *		// Here we are creating an 'update' method
 *		app.factory('Notes', ['$resource', function($resource) {
 *    return $resource('/notes/:id', null,
 *        {
 *            'update': { method:'PUT' }
 *        });
 *		}]);
 *
 *		// In our controller we get the ID from the URL using ngRoute and $routeParams
 *		// We pass in $routeParams and our Notes factory along with $scope
 *		app.controller('NotesCtrl', ['$scope', '$routeParams', 'Notes',
                                      function($scope, $routeParams, Notes) {
 *    // First get a note object from the factory
 *    var note = Notes.get({ id:$routeParams.id });
 *    $id = note.id;
 *
 *    // Now call update passing in the ID first then the object you are updating
 *    Notes.update({ id:$id }, note);
 *
 *    // This will PUT /notes/ID with the note object in the request payload
 *		}]);
 * ```
 */
angular.module('ngResource', ['ng']).
  factory('$resource', ['$http', '$q', function($http, $q) {

    var DEFAULT_ACTIONS = {
      'get':    {method:'GET'},
      'save':   {method:'POST'},
      'query':  {method:'GET', isArray:true},
      'remove': {method:'DELETE'},
      'delete': {method:'DELETE'}
    };
    var noop = angular.noop,
        forEach = angular.forEach,
        extend = angular.extend,
        copy = angular.copy,
        isFunction = angular.isFunction;

    /**
     * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
     * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
     * segments:
     *    segment       = *pchar
     *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
     *    pct-encoded   = "%" HEXDIG HEXDIG
     *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
     *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
     *                     / "*" / "+" / "," / ";" / "="
     */
    function encodeUriSegment(val) {
      return encodeUriQuery(val, true).
        replace(/%26/gi, '&').
        replace(/%3D/gi, '=').
        replace(/%2B/gi, '+');
    }


    /**
     * This method is intended for encoding *key* or *value* parts of query component. We need a
     * custom method because encodeURIComponent is too aggressive and encodes stuff that doesn't
     * have to be encoded per http://tools.ietf.org/html/rfc3986:
     *    query       = *( pchar / "/" / "?" )
     *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
     *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
     *    pct-encoded   = "%" HEXDIG HEXDIG
     *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
     *                     / "*" / "+" / "," / ";" / "="
     */
    function encodeUriQuery(val, pctEncodeSpaces) {
      return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
    }

    function Route(template, defaults) {
      this.template = template;
      this.defaults = defaults || {};
      this.urlParams = {};
    }

    Route.prototype = {
      setUrlParams: function(config, params, actionUrl) {
        var self = this,
            url = actionUrl || self.template,
            val,
            encodedVal;

        var urlParams = self.urlParams = {};
        forEach(url.split(/\W/), function(param){
          if (param === 'hasOwnProperty') {
            throw $resourceMinErr('badname', "hasOwnProperty is not a valid parameter name.");
          }
          if (!(new RegExp("^\\d+$").test(param)) && param &&
               (new RegExp("(^|[^\\\\]):" + param + "(\\W|$)").test(url))) {
            urlParams[param] = true;
          }
        });
        url = url.replace(/\\:/g, ':');

        params = params || {};
        forEach(self.urlParams, function(_, urlParam){
          val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam];
          if (angular.isDefined(val) && val !== null) {
            encodedVal = encodeUriSegment(val);
            url = url.replace(new RegExp(":" + urlParam + "(\\W|$)", "g"), function(match, p1) {
              return encodedVal + p1;
            });
          } else {
            url = url.replace(new RegExp("(\/?):" + urlParam + "(\\W|$)", "g"), function(match,
                leadingSlashes, tail) {
              if (tail.charAt(0) == '/') {
                return tail;
              } else {
                return leadingSlashes + tail;
              }
            });
          }
        });

        // strip trailing slashes and set the url
        url = url.replace(/\/+$/, '') || '/';
        // then replace collapse `/.` if found in the last URL path segment before the query
        // E.g. `http://url.com/id./format?q=x` becomes `http://url.com/id.format?q=x`
        url = url.replace(/\/\.(?=\w+($|\?))/, '.');
        // replace escaped `/\.` with `/.`
        config.url = url.replace(/\/\\\./, '/.');


        // set params - delegate param encoding to $http
        forEach(params, function(value, key){
          if (!self.urlParams[key]) {
            config.params = config.params || {};
            config.params[key] = value;
          }
        });
      }
    };


    function resourceFactory(url, paramDefaults, actions) {
      var route = new Route(url);

      actions = extend({}, DEFAULT_ACTIONS, actions);

      function extractParams(data, actionParams){
        var ids = {};
        actionParams = extend({}, paramDefaults, actionParams);
        forEach(actionParams, function(value, key){
          if (isFunction(value)) { value = value(); }
          ids[key] = value && value.charAt && value.charAt(0) == '@' ?
            lookupDottedPath(data, value.substr(1)) : value;
        });
        return ids;
      }

      function defaultResponseInterceptor(response) {
        return response.resource;
      }

      function Resource(value){
        shallowClearAndCopy(value || {}, this);
      }

      forEach(actions, function(action, name) {
        var hasBody = /^(POST|PUT|PATCH)$/i.test(action.method);

        Resource[name] = function(a1, a2, a3, a4) {
          var params = {}, data, success, error;

          /* jshint -W086 */ /* (purposefully fall through case statements) */
          switch(arguments.length) {
          case 4:
            error = a4;
            success = a3;
            //fallthrough
          case 3:
          case 2:
            if (isFunction(a2)) {
              if (isFunction(a1)) {
                success = a1;
                error = a2;
                break;
              }

              success = a2;
              error = a3;
              //fallthrough
            } else {
              params = a1;
              data = a2;
              success = a3;
              break;
            }
          case 1:
            if (isFunction(a1)) success = a1;
            else if (hasBody) data = a1;
            else params = a1;
            break;
          case 0: break;
          default:
            throw $resourceMinErr('badargs',
              "Expected up to 4 arguments [params, data, success, error], got {0} arguments",
              arguments.length);
          }
          /* jshint +W086 */ /* (purposefully fall through case statements) */

          var isInstanceCall = this instanceof Resource;
          var value = isInstanceCall ? data : (action.isArray ? [] : new Resource(data));
          var httpConfig = {};
          var responseInterceptor = action.interceptor && action.interceptor.response ||
                                    defaultResponseInterceptor;
          var responseErrorInterceptor = action.interceptor && action.interceptor.responseError ||
                                    undefined;

          forEach(action, function(value, key) {
            if (key != 'params' && key != 'isArray' && key != 'interceptor') {
              httpConfig[key] = copy(value);
            }
          });

          if (hasBody) httpConfig.data = data;
          route.setUrlParams(httpConfig,
                             extend({}, extractParams(data, action.params || {}), params),
                             action.url);

          var promise = $http(httpConfig).then(function(response) {
            var data = response.data,
                promise = value.$promise;

            if (data) {
              // Need to convert action.isArray to boolean in case it is undefined
              // jshint -W018
              if (angular.isArray(data) !== (!!action.isArray)) {
                throw $resourceMinErr('badcfg', 'Error in resource configuration. Expected ' +
                  'response to contain an {0} but got an {1}',
                  action.isArray?'array':'object', angular.isArray(data)?'array':'object');
              }
              // jshint +W018
              if (action.isArray) {
                value.length = 0;
                forEach(data, function(item) {
                  value.push(new Resource(item));
                });
              } else {
                shallowClearAndCopy(data, value);
                value.$promise = promise;
              }
            }

            value.$resolved = true;

            response.resource = value;

            return response;
          }, function(response) {
            value.$resolved = true;

            (error||noop)(response);

            return $q.reject(response);
          });

          promise = promise.then(
              function(response) {
                var value = responseInterceptor(response);
                (success||noop)(value, response.headers);
                return value;
              },
              responseErrorInterceptor);

          if (!isInstanceCall) {
            // we are creating instance / collection
            // - set the initial promise
            // - return the instance / collection
            value.$promise = promise;
            value.$resolved = false;

            return value;
          }

          // instance call
          return promise;
        };


        Resource.prototype['$' + name] = function(params, success, error) {
          if (isFunction(params)) {
            error = success; success = params; params = {};
          }
          var result = Resource[name].call(this, params, this, success, error);
          return result.$promise || result;
        };
      });

      Resource.bind = function(additionalParamDefaults){
        return resourceFactory(url, extend({}, paramDefaults, additionalParamDefaults), actions);
      };

      return Resource;
    }

    return resourceFactory;
  }]);


})(window, window.angular);
;/*
 AngularJS v1.4.2
 (c) 2010-2015 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(p,c,C){'use strict';function v(r,h,g){return{restrict:"ECA",terminal:!0,priority:400,transclude:"element",link:function(a,f,b,d,y){function z(){k&&(g.cancel(k),k=null);l&&(l.$destroy(),l=null);m&&(k=g.leave(m),k.then(function(){k=null}),m=null)}function x(){var b=r.current&&r.current.locals;if(c.isDefined(b&&b.$template)){var b=a.$new(),d=r.current;m=y(b,function(b){g.enter(b,null,m||f).then(function(){!c.isDefined(t)||t&&!a.$eval(t)||h()});z()});l=d.scope=b;l.$emit("$viewContentLoaded");
l.$eval(w)}else z()}var l,m,k,t=b.autoscroll,w=b.onload||"";a.$on("$routeChangeSuccess",x);x()}}}function A(c,h,g){return{restrict:"ECA",priority:-400,link:function(a,f){var b=g.current,d=b.locals;f.html(d.$template);var y=c(f.contents());b.controller&&(d.$scope=a,d=h(b.controller,d),b.controllerAs&&(a[b.controllerAs]=d),f.data("$ngControllerController",d),f.children().data("$ngControllerController",d));y(a)}}}p=c.module("ngRoute",["ng"]).provider("$route",function(){function r(a,f){return c.extend(Object.create(a),
f)}function h(a,c){var b=c.caseInsensitiveMatch,d={originalPath:a,regexp:a},g=d.keys=[];a=a.replace(/([().])/g,"\\$1").replace(/(\/)?:(\w+)([\?\*])?/g,function(a,c,b,d){a="?"===d?d:null;d="*"===d?d:null;g.push({name:b,optional:!!a});c=c||"";return""+(a?"":c)+"(?:"+(a?c:"")+(d&&"(.+?)"||"([^/]+)")+(a||"")+")"+(a||"")}).replace(/([\/$\*])/g,"\\$1");d.regexp=new RegExp("^"+a+"$",b?"i":"");return d}var g={};this.when=function(a,f){var b=c.copy(f);c.isUndefined(b.reloadOnSearch)&&(b.reloadOnSearch=!0);
c.isUndefined(b.caseInsensitiveMatch)&&(b.caseInsensitiveMatch=this.caseInsensitiveMatch);g[a]=c.extend(b,a&&h(a,b));if(a){var d="/"==a[a.length-1]?a.substr(0,a.length-1):a+"/";g[d]=c.extend({redirectTo:a},h(d,b))}return this};this.caseInsensitiveMatch=!1;this.otherwise=function(a){"string"===typeof a&&(a={redirectTo:a});this.when(null,a);return this};this.$get=["$rootScope","$location","$routeParams","$q","$injector","$templateRequest","$sce",function(a,f,b,d,h,p,x){function l(b){var e=s.current;
(v=(n=k())&&e&&n.$$route===e.$$route&&c.equals(n.pathParams,e.pathParams)&&!n.reloadOnSearch&&!w)||!e&&!n||a.$broadcast("$routeChangeStart",n,e).defaultPrevented&&b&&b.preventDefault()}function m(){var u=s.current,e=n;if(v)u.params=e.params,c.copy(u.params,b),a.$broadcast("$routeUpdate",u);else if(e||u)w=!1,(s.current=e)&&e.redirectTo&&(c.isString(e.redirectTo)?f.path(t(e.redirectTo,e.params)).search(e.params).replace():f.url(e.redirectTo(e.pathParams,f.path(),f.search())).replace()),d.when(e).then(function(){if(e){var a=
c.extend({},e.resolve),b,f;c.forEach(a,function(b,e){a[e]=c.isString(b)?h.get(b):h.invoke(b,null,null,e)});c.isDefined(b=e.template)?c.isFunction(b)&&(b=b(e.params)):c.isDefined(f=e.templateUrl)&&(c.isFunction(f)&&(f=f(e.params)),c.isDefined(f)&&(e.loadedTemplateUrl=x.valueOf(f),b=p(f)));c.isDefined(b)&&(a.$template=b);return d.all(a)}}).then(function(f){e==s.current&&(e&&(e.locals=f,c.copy(e.params,b)),a.$broadcast("$routeChangeSuccess",e,u))},function(b){e==s.current&&a.$broadcast("$routeChangeError",
e,u,b)})}function k(){var a,b;c.forEach(g,function(d,g){var q;if(q=!b){var h=f.path();q=d.keys;var l={};if(d.regexp)if(h=d.regexp.exec(h)){for(var k=1,m=h.length;k<m;++k){var n=q[k-1],p=h[k];n&&p&&(l[n.name]=p)}q=l}else q=null;else q=null;q=a=q}q&&(b=r(d,{params:c.extend({},f.search(),a),pathParams:a}),b.$$route=d)});return b||g[null]&&r(g[null],{params:{},pathParams:{}})}function t(a,b){var d=[];c.forEach((a||"").split(":"),function(a,c){if(0===c)d.push(a);else{var f=a.match(/(\w+)(?:[?*])?(.*)/),
g=f[1];d.push(b[g]);d.push(f[2]||"");delete b[g]}});return d.join("")}var w=!1,n,v,s={routes:g,reload:function(){w=!0;a.$evalAsync(function(){l();m()})},updateParams:function(a){if(this.current&&this.current.$$route)a=c.extend({},this.current.params,a),f.path(t(this.current.$$route.originalPath,a)),f.search(a);else throw B("norout");}};a.$on("$locationChangeStart",l);a.$on("$locationChangeSuccess",m);return s}]});var B=c.$$minErr("ngRoute");p.provider("$routeParams",function(){this.$get=function(){return{}}});
p.directive("ngView",v);p.directive("ngView",A);v.$inject=["$route","$anchorScroll","$animate"];A.$inject=["$compile","$controller","$route"]})(window,window.angular);
//# sourceMappingURL=angular-route.min.js.map
;/**
 * fdApp Module
 */
var app = angular.module('fdApp', ['ngRoute','ui.bootstrap', 'ngResource', 'infinite-scroll']);

/**
 * fdApp routes
 */
app.config(['$routeProvider', function ($routeProvider) {

  $routeProvider
    .when('/',{
      controller: 'IndexCtrl',
      templateUrl: 'view/index.html',
      title: 'FD',
      reloadOnSearch: false,
      resolve: {
        page: function($route){
          $route.current.params.page = 'index';
        }
      }
    })
    .when('/solutions/:sid',{
      controller: 'SolutionCtrl',
      templateUrl: 'view/solution.html',
      resolve: {
        page: function($route){
          $route.current.params.page = 'solutions';
        }
      }
    })
    .when('/product/:pid',{
      controller: 'SolutionCtrl',
      templateUrl: 'view/product.html',
      resolve: {
        page: function($route){
          $route.current.params.page = 'product';
        }
      }
    })
    .when('/family/:fid',{
      controller: 'FamilyCtrl',
      templateUrl: 'view/family.html',
      resolve: {
        page: function($route){
          $route.current.params.page = 'family';
        }
      }
    })
    .when('/processing/:id',{
      controller: 'ProcessingCtrl',
      templateUrl: 'view/processing.html',
      resolve: {
        page: function($route){
          $route.current.params.page = 'processing';
        }
      }
    })
    .when('/checkout/shipping',{
      controller: 'CheckoutCtrl',
      templateUrl: 'view/checkout/shipping.html',
      title: 'Shipping Information | FD',
      resolve: {
        page: function($route){
          $route.current.params.ordered = false;
          $route.current.params.one_step = false;
          $route.current.params.page = 'shipping';
        }
      }
    })
    .when('/product/:bid',{
      controller: 'SolutionCtrl',
      templateUrl: 'view/product.html',
      resolve: {
        page: function($route){
          $route.current.params.page = 'product';
        }
      }
    })
    .when('/transaction/info',{
      controller: 'TransactionInfoCtrl',
      templateUrl: 'view/transaction_info.html',
      resolve: {
        page: function($route){
          $route.current.params.page = 'transaction_info';
        }
      }
    })
    .when('/checkout/summary',{
      controller: 'CheckoutCtrl',
      templateUrl: 'view/checkout/summary.html',
      title: 'Order Summary | FD',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'summary';
        }
      }
    })
    .when('/checkout/thankyou/',{
      controller: 'CheckoutCtrl',
      templateUrl: 'view/checkout/thankyou.html',
      title: 'Thank You | FD',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'thankyou';
        }
      }
    })
    .when('/invalid-item',{
      controller: 'ErrorCtrl',
      templateUrl: 'view/invalid-item.html',
      title: 'Invalid Item | FD',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'invalid_item';
          $route.current.params.nologin = true;
        }
      }
    })
   .when('/400',{
      controller: 'ErrorCtrl',
      templateUrl: 'view/400.html',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'Error';
        }
      }
    })
    .when('/401',{
      controller: 'ErrorCtrl',
      templateUrl: 'view/401.html',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'Error';
        }
      }
    })
    .when('/404',{
      controller: 'ErrorCtrl',
      templateUrl: 'view/404.html',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'Error';
        }
      }
    })
    .when('/products',{
      controller: 'ProductsCtrl',
      templateUrl: 'view/products.html',
      title: 'Products | First Data',
      resolve: {
        page: function($route){
          $route.current.params.page = 'products';
        }
      }
    })
    .when('/products/:type',{
      controller: 'ProductsCtrl',
      templateUrl: 'view/products.html',
      title: 'Products | First Data',
      resolve: {
        page: function($route){
          $route.current.params.page = 'products';
        }
      }
    })
    .when('/products/:pid/recommended-products',{
      controller: 'RecommendedProductsCtrl',
      templateUrl: 'view/recommended_products.html',
      title: 'Recommended Products | First Data',
      resolve: {
        page: function($route){
          $route.current.params.page = 'Recommended Products';
        }
      }
    })
    .when('/products/:type/:typename',{
      controller: 'ProductsCtrl',
      templateUrl: 'view/products.html',
      title: 'Products | First Data',
      resolve: {
        page: function($route){
          $route.current.params.page = 'products';
        }
      }
    })
    .when('/options/:typename',{
      controller: 'OptionsCtrl',
      templateUrl: 'view/options.html',
      title: 'Options | First Data',
      resolve: {
        page: function($route){
          $route.current.params.page = 'options';
        }
      }
    })
    .when('/signup',{
       controller: 'SignupCtrl',
       templateUrl: 'view/signup/index.html',
       title: 'Signup | First Data Marketplace',
       resolve: {
          page: function($route){
            $route.current.params.nologin = true;
          $route.current.params.page = 'signup';
         }
       }
    })
    .when('/signup/owner',{
       controller: 'SignupOwnerCtrl',
       templateUrl: 'view/signup/owner.html',
       title: 'Signup | First Data Marketplace',
       resolve: {
          page: function($route){
            $route.current.params.nologin = true;
            $route.current.params.page = 'signup-owner';
         }
       }
    })
    .when('/signup/location',{
       controller: 'SignupLocationCtrl',
       templateUrl: 'view/signup/location.html',
       title: 'Signup | First Data Marketplace',
       resolve: {
          page: function($route){
            $route.current.params.nologin = true;
            $route.current.params.page = 'signup-location';
         }
       }
    })
    .when('/signup/location/:num',{
       controller: 'SignupLocationCtrl',
       templateUrl: 'view/signup/location.html',
       title: 'Signup | First Data Marketplace',
       resolve: {
          page: function($route){
            $route.current.params.nologin = true;
            $route.current.params.page = 'signup-location';
         }
       }
    })
    .when('/signup/setup',{
       controller: 'SignupSetupCtrl',
       templateUrl: 'view/signup/setup.html',
       title: 'Signup | First Data Marketplace',
       resolve: {
          page: function($route){
            $route.current.params.nologin = true;
            $route.current.params.page = 'signup-setup';
         }
       }
    })
    .when('/signup/terms', {
        controller: 'SignupTermsCtrl',
        templateUrl: 'view/signup/terms.html',
        title: 'Terms & Conditions | First Data Marketplace',
        resolve: {
            page: function($route) {
                $route.current.params.eSignature = true;
                $route.current.params.nologin = true;
                $route.current.params.page = 'merchant-agreement';
            }
        }
    })
    .when('/terms',{
       controller: 'TCCtrl',
       templateUrl: 'view/signup/tc-rsa.html',
       title: 'Terms & Conditions | First Data Marketplace',
       resolve: {
         page: function($route){
           $route.current.params.nologin = true;
           $route.current.params.page = 'terms';
         }
       }
    })
    .when('/thankyou',{
      controller: 'ThankyouCtrl',
      templateUrl: 'view/signup/confirmation.html',
      title: 'Thank You | FD Signup',
      resolve: {
        page: function($route){
          $route.current.params.nologin = true;
          $route.current.params.page = 'thankyouend';
        }
      }
    })
    .when('/multi-locations',{
       controller: 'MultiLocationsCtrl',
       templateUrl: 'view/multi-locations.html',
       title: 'Number of Locations | First Data Marketplace',
       resolve: {
           page: function($route){
              $route.current.params.page = 'multi-locations';
           }
       }
    })
    .otherwise({ redirectTo: '/404' });
  
}]);

app.config([
  '$httpProvider',
  function($httpProvider) {

    $httpProvider.interceptors.push(['$rootScope', '$q', '$location', function($rootScope, $q, $location) {
      return {
        'response': function(response) {
          if(response.status === 200 && response.config.method === 'POST'){
            $rootScope.$emit('resetSessionTimeout');
          }
          return response || $q.when(response);
        },
        'responseError': function(response) {

          var status = response.status;
          var data = response.data;
          if (status === 401) {
            if (data.redirectUrl){
              $rootScope.$emit('logout', [data]);
            } else {
              $location.path('/401');
            }
          } else if (status === 404) {
            $location.path('/404');
          } else if (status === 400 || status === 409 || status === 503 || status === -1) {
            //Caller will handle
          } else {
            $location.path('/400');
          }
          return $q.reject(response);
        }
      };
    }]);
  }
]);

/**
 * Init titles and referrer url
 */
app.run(['$rootScope', function($rootScope) {
  $rootScope.refUrl = '';
  var curUrl;
  
  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    if (curUrl) {
      $rootScope.refUrl = curUrl;
    }
    
    curUrl = current.$$route.originalPath;
    if ('/' != curUrl) {
      curUrl = current.$$route.originalPath.replace(/^\/|\/$/g, '');
    }
    
    $rootScope.title = current.$$route ? current.$$route.title : 'FD';
    if (typeof $rootScope.title == 'undefined') {
      $rootScope.title = 'FD';
    }
  });
  
}]);;(function(){
  var constants = {
      'STATES': [
        {'abbr': 'AL', 'name': 'Alabama'},
        {'abbr': 'AK', 'name': 'Alaska'},
        {'abbr': 'AZ', 'name': 'Arizona'},
        {'abbr': 'AR', 'name': 'Arkansas'},
        {'abbr': 'CA', 'name': 'California'},
        {'abbr': 'CO', 'name': 'Colorado'},
        {'abbr': 'CT', 'name': 'Connecticut'},
        {'abbr': 'DE', 'name': 'Delaware'},
        {'abbr': 'DC', 'name': 'District Of Columbia'},
        {'abbr': 'FL', 'name': 'Florida'},
        {'abbr': 'GA', 'name': 'Georgia'},
        {'abbr': 'HI', 'name': 'Hawaii'},
        {'abbr': 'ID', 'name': 'Idaho'},
        {'abbr': 'IL', 'name': 'Illinois'},
        {'abbr': 'IN', 'name': 'Indiana'},
        {'abbr': 'IA', 'name': 'Iowa'},
        {'abbr': 'KS', 'name': 'Kansas'},
        {'abbr': 'KY', 'name': 'Kentucky'},
        {'abbr': 'LA', 'name': 'Louisiana'},
        {'abbr': 'ME', 'name': 'Maine'},
        {'abbr': 'MD', 'name': 'Maryland'},
        {'abbr': 'MA', 'name': 'Massachusetts'},
        {'abbr': 'MI', 'name': 'Michigan'},
        {'abbr': 'MN', 'name': 'Minnesota'},
        {'abbr': 'MS', 'name': 'Mississippi'},
        {'abbr': 'MO', 'name': 'Missouri'},
        {'abbr': 'MT', 'name': 'Montana'},
        {'abbr': 'NE', 'name': 'Nebraska'},
        {'abbr': 'NV', 'name': 'Nevada'},
        {'abbr': 'NH', 'name': 'New Hampshire'},
        {'abbr': 'NJ', 'name': 'New Jersey'},
        {'abbr': 'NM', 'name': 'New Mexico'},
        {'abbr': 'NY', 'name': 'New York'},
        {'abbr': 'NC', 'name': 'North Carolina'},
        {'abbr': 'ND', 'name': 'North Dakota'},
        {'abbr': 'OH', 'name': 'Ohio'},
        {'abbr': 'OK', 'name': 'Oklahoma'},
        {'abbr': 'OR', 'name': 'Oregon'},
        {'abbr': 'PA', 'name': 'Pennsylvania'},
        {'abbr': 'RI', 'name': 'Rhode Island'},
        {'abbr': 'SC', 'name': 'South Carolina'},
        {'abbr': 'SD', 'name': 'South Dakota'},
        {'abbr': 'TN', 'name': 'Tennessee'},
        {'abbr': 'TX', 'name': 'Texas'},
        {'abbr': 'UT', 'name': 'Utah'},
        {'abbr': 'VT', 'name': 'Vermont'},
        {'abbr': 'VA', 'name': 'Virginia'},
        {'abbr': 'WA', 'name': 'Washington'},
        {'abbr': 'WV', 'name': 'West Virginia'},
        {'abbr': 'WI', 'name': 'Wisconsin'},
        {'abbr': 'WY', 'name': 'Wyoming'}
      ],
      citySpecialChar: {'St.':'Saint','ñ':'n',"'":" "},

      SHIPPING_METHODS:{
          "1":{"id":93224,"productId":50712,"supplierProductName":"Gnd","supplierName":"MAMA","productType":"SHIPPING","productName":"Gnd","productShortDescription":"Shipping Fee - Ground Service","productLongDescription":"Shipping Fee - Ground Service","defaultPurchaseType":"P","price":19.95,"productWithOptions":false,"pinPad":false,"imageUrls":[],"offeringTypes":["Shipping"],"categoryIds":[],"tags":[],"name":"Shipping Fee - Ground Service"},
          "2":{"id":93226,"productId":50714,"supplierProductName":"2da","supplierName":"MAMA","productType":"SHIPPING","productName":"2da","productShortDescription":"Shipping Fee - 2 Day Service","productLongDescription":"Shipping Fee - 2 Day Service","defaultPurchaseType":"P","price":19.95,"productWithOptions":false,"pinPad":false,"imageUrls":[],"offeringTypes":["Shipping"],"categoryIds":[],"tags":[],"name":"Shipping Fee - 2 Day Service"},
          "3":{"id":93227,"productId":50715,"supplierProductName":"1da","supplierName":"MAMA","productType":"SHIPPING","productName":"1da","productShortDescription":"Shipping Fee - Priority Overnight","productLongDescription":"Shipping Fee - Priority Overnight","defaultPurchaseType":"P","price":35.95,"productWithOptions":false,"pinPad":false,"imageUrls":[],"offeringTypes":["Shipping"],"categoryIds":[],"tags":[],"name":"Shipping Fee - Priority Overnight"}
      },
      PURCHASE_CODE: 'P',
      OWNED_CODE: 'O',
      FSPFUNDTYPES : ['deposits', 'nonBankAdjustments', 'depositAdjustments', 'chargebackReversals', 'interchangeAssessments', 'discountServices', 'fees', 'financialAdjustments', 'chargebacks'],
      OPTIONSPRODUCTTYPES : ['Telecheck'],
                
  }
  app.constant('CONST', constants);
})();;/**
 * Cart Controller
 */
app.controller('CartCtrl', ['$scope', '$rootScope', '$window', 'fdService', '$routeParams', 'CONST', '$location', '$timeout', 'filterFilter',
  function($scope, $rootScope, $window, fdService, $routeParams, CONST, $location, $timeout, filterFilter) {

    /**
     * Init function
     * @private
     * @method _init
     */
    var _init = function() {

      $scope.clickedCheckout = false;
      $scope.showRecFee = true;
      $scope.transactionFee = true;
      $scope.disableReviewOrder = false;
      $scope.allowExpand = true;

      $scope.acquiringPricing = [];
      $scope.equipmentPricing = [];
      $scope.globalPricing = [];

      $scope.page = $routeParams.page;


      $scope.orderId = fdService.getOrderId();

      $rootScope.cart = fdService.getCart();

      $scope.$watch(function() {
        return $window.sessionStorage;
      }, function(newVal, oldVal) {
        $scope.orderId = fdService.getOrderId();
      }, true);

      $scope.$watch(function() {
        return $rootScope.cart;
      }, function(newVal, oldVal) {
        $scope.cart = newVal;
      }, true);

      if (($scope.orderId &&
                ('shipping' == $scope.page
                    || 'multi-locations' == $scope.page
                    || 'transaction_info' == $scope.page
                  ))
                  || 'thankyou' == $scope.page
                  || 'summary' == $scope.page
                  || 'proposal' == $scope.page) {
        $scope.allowExpand = false;
        $scope.cart = $rootScope.cart = fdService.getOrderedCart($scope.orderId);
      }

      $("#view-fees-modal").on('show.bs.modal', function() {
        $scope.acquiringPricing = fdService.getAcquiringPricingStorage();
        $scope.acquiringDataGrouping($scope.acquiringPricing);
        console.log($scope.acquiringPricing)
        $scope.equipmentPricing = fdService.getEquipmentPricingStorage();
        $scope.globalPricing = fdService.getGlobalPricingStorage();
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      });
    };

    /**
     * Acquiring Data Grouping
     * @method acquiringDataGrouping
     * @param data acquiringData
     */
    $scope.acquiringDataGrouping = function(data) {
        var result = {};
        var discountRates = [];
        var groupedDiscountRates = {};
        if(undefined != data && undefined != data.discountRates){
            for (var i = 0; i < data.discountRates.length; i++) {
                var temp = data.discountRates[i];
                if (groupedDiscountRates[data.discountRates[i].groupName] && data.discountRates[i].groupName != '') {
                    groupedDiscountRates[data.discountRates[i].groupName].push(temp);
                } else {
                    if (data.discountRates[i].groupName != '')
                        groupedDiscountRates[data.discountRates[i].groupName] = [temp];
                    else {
                        discountRates.push(temp);
                    }
                }
            }
        }
        //setup cardPresentDiscountRates
        if(undefined != data && undefined != data.cardPresentDiscountRates){
            for (var i = 0; i < data.cardPresentDiscountRates.length; i++) {
                var temp = data.cardPresentDiscountRates[i];
                if (result[data.cardPresentDiscountRates[i].groupName] && data.cardPresentDiscountRates[i].groupName != '') {
                    result[data.cardPresentDiscountRates[i].groupName][0].cardPresentDiscountRates.push(temp);
                } else {
                    var tempData = []; 
                    tempData.push(temp);

                    tempData[0].cardPresentDiscountRates = [];
                    tempData[0].cardNotPresentDiscountRates = [];

                    if (data.cardPresentDiscountRates[i].groupName != ''){
                        tempData[0].cardPresentDiscountRates.push(angular.copy(temp));
                        result[data.cardPresentDiscountRates[i].groupName]=tempData;
                    }
                }
            }
        }
        //setup cardNotPresentDiscountRates
        if(undefined != data && undefined != data.cardNotPresentDiscountRates){
            for (var i = 0; i < data.cardNotPresentDiscountRates.length; i++) {
                var temp = data.cardNotPresentDiscountRates[i];
                if (result[data.cardNotPresentDiscountRates[i].groupName] && data.cardNotPresentDiscountRates[i].groupName != '') {
                    result[data.cardNotPresentDiscountRates[i].groupName][0].cardNotPresentDiscountRates.push(temp);
                } else {
                    var tempData = [];
                    tempData.push(temp);

                    tempData[0].cardPresentDiscountRates = [];
                    tempData[0].cardNotPresentDiscountRates = [];

                    if (data.cardNotPresentDiscountRates[i].groupName != ''){
                        tempData[0].cardNotPresentDiscountRates.push(angular.copy(temp));
                        result[data.cardNotPresentDiscountRates[i].groupName]=tempData;
                    }
                }
            }
        }
        //setup scope arrays and objects
        $scope.groupedPricingDetails = result;
        $scope.discountRates = discountRates;
        $scope.groupedDiscountRates = groupedDiscountRates;
    }

    /**
     * Grouping button click
     * @method grouping
     * @param {number} index
     */
    $scope.grouping = function(index) {
        angular.element('.toggle-rates-children' + index).children('i').toggleClass('fa-angle-double-down fa-angle-double-up');
        angular.element('.toggle-rates-children' + index).parent('div').children('table.rate-child' + index).slideToggle('fast');
    }

    /**
     * Subgrouping button click
     * @method grouping
     * @param {number} index
     */
    $scope.subgrouping = function(index) {
        angular.element('.toggle-rates-sub-children' + index).children('i').toggleClass('fa-angle-double-down fa-angle-double-up');
        angular.element('.toggle-rates-sub-children' + index).parent('td').parent('tr').parent('tbody').parent('table').children('tbody.rate-sub-child').slideToggle('fast');
    }

    /**
     * remove product from cart
     * @method removeFromCart
     * @param pid product Id
     */
    $scope.removeFromCart = function(index) {
      $rootScope.cart.data.splice(index, 1);
      // delete $rootScope.cart.data[pid];
      fdService.validateCart($rootScope.cart)
        .success(function(data, status, headers, config) {
          $rootScope.cart.validation = data;
          $scope.cart = $rootScope.cart;
          $scope.cartChanged();
          if (data.iscartvalid)
            fdService.updatePricing();
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

      $scope.cart = $rootScope.cart;
      $scope.cartChanged();

      if (0 === $scope.cart.total_qty) {
        $location.path('/');
      }
    };

    /**
     * Calling in case of changing quantity.
     * @method qtyChanged
     */
    $scope.qtyChanged = function() {
      fdService.resetCartOverridePricing($scope.cart);
      fdService.updatePricing(function() {
        $rootScope.cart = $scope.cart = fdService.getCart();
      });
      $scope.cartChanged();
    };

    /**
     * Calling in case of changing cart.
     * @method cartChanged
     */
    $scope.cartChanged = function() {
      fdService.clearOrderId();
      $rootScope.cart = $scope.cart = fdService.cartChanged($scope.cart);
      $scope.orderId = fdService.getOrderId();
    };

    /**
     * Remove lease from cart
     * @method removeLease
     * @param p product object
     */
    $scope.removeLease = function(p) {
      $scope.cart.data[p.id].term = CONST.PURCHASE_CODE;
      fdService.validateCart($scope.cart)
        .success(function(data, status, headers, config) {
          $scope.cart.validation = data;
          $scope.cartChanged();
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

      fdService.updatePricing();
      $scope.cartChanged();
    };

    /**
     * Remove processing product from cart
     * @method removeProcessing
     * @param p processing product object
     */
    $scope.removeProcessing = function(p) {
      delete $scope.cart.payment_types.products[p.id];
      if (!Object.keys($scope.cart.payment_types.products).length) {
        $scope.cart.payment_types = null;
      }
      fdService.validateCart($scope.cart)
        .success(function(data, status, headers, config) {
          $scope.cart.validation = data;
          $scope.cartChanged();
          if (data.iscartvalid)
            fdService.updatePricing();
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

      $scope.cartChanged();
    };

    /**
     * remove transaction product
     * @method removeTransactionProduct
     * @param p
     */
    $scope.removeTransactionProduct = function(p) {

      var index =  $rootScope.cart.transaction_products.map(function(e) { return e.id; }).indexOf(p.id);

      if (-1 === index) {
        return;
      }

      $rootScope.cart.transaction_products.splice(index, 1);

      fdService.validateCart($scope.cart)
        .success(function(data, status, headers, config) {
          $scope.cart.validation = data;
          $scope.cartChanged();
          if (data.iscartvalid)
            fdService.updatePricing();
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

      $scope.cartChanged();
    };

    /**
     * Remove payment types from cart
     * @method removePaymentTypes
     */
    $scope.removePaymentTypes = function() {
      $scope.cart.payment_types = null;
      fdService.validateCart($scope.cart)
        .success(function(data, status, headers, config) {
          $scope.cart.validation = data;
          $scope.cartChanged();
          if (data.iscartvalid)
            fdService.updatePricing();
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

      $scope.cartChanged();
    };

    /**
     * Lease product
     * @method leaseProduct
     * @param {Object} p product
     */
    $scope.leaseProduct = function(p) {

      var index = fdService.getCartProductIndex($rootScope.cart, p);
      $scope.cart.data.splice(index, 1);

      $rootScope.cart = $scope.cart = fdService.leaseProduct(p, $scope.cart, p.category);
      $scope.showRecFee = true;
      fdService.validateCart($scope.cart)
        .success(function(data, status, headers, config) {
          $scope.cart.validation = data;
          $scope.cartChanged();
          if (data.iscartvalid)
            fdService.updatePricing();
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });
    };

    /**
     * Save transaction info in session
     * @method saveTransactionInfo
     */
    $scope.saveTransactionInfo = function() {

      $scope.transactionFormData.category = $scope.category.name;
      fdService.storeTransactionInfo($scope.transactionFormData);

      fdService.initPricingData(function(status) {
        if (status) {
          $rootScope.cart = $scope.cart = fdService.getCart();
          $location.path('/checkout/shipping');
        } else {
          $location.path('400');
        }
      }, null, fdService.getEquipmentPricingStorage(), fdService.getGlobalPricingStorage());
    };

    /**
     * Submit proposal
     * @method sendProp
     */
    $scope.sendProp = function() {
      fdService.submitProposal();
    };

    /**
     * Get transaction info
     * @method getTI
     * @return {Object} with transaction info
     */
    $scope.getTI = function() {
      return fdService.getTransactionInfo();
    };

    /**
     * Call review order service
     * @method reviewOrder
     */
    $scope.reviewOrder = function() {
      if ($scope.disableReviewOrder)
        return;
      $scope.disableReviewOrder = true;
      var orderId = fdService.getOrderId();
      $rootScope.$emit('Update_address_cart');
      fdService.reviewOrder(orderId)
        .success(function(data, status, headers, config) {
          $scope.disableReviewOrder = false;
          var cart = orderId ? fdService.getOrderedCart(orderId) : fdService.getCart();
          fdService.storeOrderId(data.orderId);
          fdService.storeOrderedCart(data.orderId, cart);
          fdService.clearTmpOrderId();
          $scope.gotoUrl('/checkout/summary');
        })
        .error(function(data, status, headers, config) {
          $scope.disableReviewOrder = false;
          console.log('error');
        });
    };

    /**
     * Redirect to url
     * @method gotoUrl
     * @param url where to redirect
     */
    $scope.gotoUrl = function(url) {
      $location.path(url);
    };

    /**
     * return pricing forms OK status
     * @method pricingFormsOk
     * @return {boolean}
     */
    $scope.pricingFormsOk = function() {
      if (typeof $rootScope._pricingFormsOk == 'function') {
        return $rootScope._pricingFormsOk();
      }
      return true;
    };

    /**
     * Redirect to the checkout page or transation info
     * @method proceedToCheckout
     */
    $scope.proceedToCheckout = function() {
      var ep = fdService.getEquipmentPricingStorage();
      var url;
      if ($rootScope.cart.num_locations > 1 && !$rootScope.cart.num_locations_selected) {
        url = '/multi-locations';
      } else if ($scope.getTI() && ep) {
        url = '/checkout/shipping';
      } else {
        url = '/transaction/info';
      }
      $timeout(function() {
        $scope.gotoUrl(url);
      });
    };

    /**
     * Redirect to checkout page from multi locations
     * @method proceedToCheckoutML
     */
    $scope.proceedToCheckoutML = function() {

      var ep = fdService.getEquipmentPricingStorage();
      if ($scope.getTI() && ep) {
        var url = '/checkout/shipping';
      } else {
        var url = '/transaction/info';
      }
      $timeout(function() {
        $scope.gotoUrl(url);
      });
    };

    /**
     * Check if cart edit is allowed
     * @method isAllowEdit
     * @return {boolean}
     */
    $scope.isAllowEdit = function() {
      if ('shipping' == $scope.page) {
        return false;
      }
      if ('thankyou' == $scope.page) {
        return false;
      }
      if ('summary' == $scope.page) {
        return false;
      }
      if ('proposal' == $scope.page) {
        return false;
      }
      if ('transaction_info' == $scope.page) {
        return false;
      }
      if ('cart' == $scope.page) {
        return false;
      }

      return true;
    };

    /**
     * Check if products clickable
     * @method isProductsClickable
     * @return {boolean}
     */
    $scope.isProductsClickable = function() {
      if ('thankyou' == $scope.page) {
        return false;
      }
      if ('summary' == $scope.page) {
        return false;
      }
      if ('proposal' == $scope.page) {
        return false;
      }
      if ('cart' == $scope.page) {
        return false;
      }
      return true;
    };

    /**
     * Load unique lease options
     * @method models
     * @param {} pricingModel
     * @return {} filteredOptions
     */
    $scope.models = function(pricingModel) {
      var filteredOptions = [];
      angular.forEach(pricingModel, function(item) {
        var index = filteredOptions.map(function(p) {
          return p.paymentType;
        }).indexOf(item.paymentType);
        if (index === -1) {
          filteredOptions.push(item);
        } else {
          filteredOptions[index] = item;
        }
      });
      return filteredOptions;
    };

    /**
     * Payment Type Changed
     * @method paymentTypeChanged
     * @param product
     */
    $scope.paymentTypeChanged = function(product) {
      var leaseTypes = [];
      var index = 0;
      if (product.termPaymentType == 'Lease') {
        leaseTypes = filterFilter(product.pricingModel, {purchaseType: 'LT'});
        //check for LT36 type lease if available.
        var leaseIndex = leaseTypes.map(function(p) {return p.purchaseType;}).indexOf('LT36');
        index = leaseIndex == -1 ? 0 : leaseIndex;
      } else if (product.termPaymentType == 'Installment') {
        leaseTypes = filterFilter(product.pricingModel, {purchaseType: 'IP'});
      } else if (product.termPaymentType == 'Rent') {
        leaseTypes = filterFilter(product.pricingModel, {purchaseType: 'R'});
      }
      if (leaseTypes.length > 0) {
        product.term = leaseTypes[index].purchaseType;
      }
      $scope.qtyChanged();
    };

    /**
     * Change Category
     * @method changeCategory
     * @param categoryName
     */
    $scope.changeCategory = function(categoryName) {
      if (!$scope.categories) {
        fdService.getCategories().success(function(data, status, headers, config) {
            $scope.categories = data;
            $scope.updateCategoryInSession(categoryName);
          })
          .error(function(data, status, headers, config) {
            $location.path('/400');
          });
      } else {
        $scope.updateCategoryInSession(categoryName);
      }
    }

    /**
     * Update Category in Session
     * @method updateCategoryInSession
     * @param categoryName
     */
    $scope.updateCategoryInSession = function(categoryName) {
         var index = $scope.categories.map(function(cat) { return cat.name; }).indexOf(categoryName);
      if (index != -1) {
        var category = $scope.categories[index];
        fdService.storeCategoryInSession(category);
        $rootScope.$emit('Category_Change');
      }
    }

    ///////////////// MAIN ////////////////////////////////

    _init();

  }
]);;/**
 * Checkout Controller
 */
app.controller('CheckoutCtrl', ['$scope', '$rootScope', '$routeParams', '$filter', '$location', '$window', '$timeout', 'fdService',
  function($scope, $rootScope, $routeParams, $filter, $location, $window, $timeout, fdService) {

    /**
     * Init function
     * @private
     */
    var _init = function() {

      $rootScope.body_id = 'checkout';
      $rootScope.bodyClass = '';
      $scope.colorLogo = true;
      if (typeof($rootScope.openPane) === 'function')
        $rootScope.openPane();

      $scope.shippingMethod = 'free';
      //$scope.shippingMethods = fdService.getSessionShippingMethods();

      $scope.placeOrderInProgress = false;
      $scope.signupInProgress = false;

      $scope.form_error = false;

      $scope.monthlyFee = false;
      $scope.transactionFee = false;

      $scope.phoneNumberPattern = (/^\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}$/);
      $scope.addressPattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
      $scope.companyPattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
      $scope.emailPattern = (/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)?(\.(AERO|INT|GG|GH|GI|GL|GM|GN|GP|GQ|GR|GS|JOBS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|MIL|ID|IE|IL|IM|IN|IO|IQ|IR|IS|IT|MOBI|JE|JM|JO|JP|KE|KG|KH|KI|KM|KN|MUSEUM|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|NAME|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|NET|MG|MH|MK|ML|MM|MN|MO|MP|MQ|MR|ORG|MS|MT|MU|MV|MW|MX|MY|MZ|NA|NC|PRO|NE|NF|NG|NI|NL|NO|NP|NR|NU|NZ|TEL|OM|PA|PE|PF|PG|PH|PK|PL|PM|PN|ASIA|TRAVEL|PR|PS|PT|PW|PY|QA|RE|RO|RS|RU|AC|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|AD|SK|SL|SM|SN|SO|SR|ST|SU|SV|SY|AE|SZ|TC|TD|TF|TG|TH|TJ|TK|TL|TM|AF|TN|TO|TP|TR|TT|TV|TW|TZ|UA|UG|AG|UK|UM|US|UY|UZ|VA|VC|VE|VG|VI|AI|VN|VU|WF|WS|YE|YT|YU|ZA|ZM|AL|AM|AN|BIZ|AO|AQ|AR|AS|AT|AU|AW|AX|AZ|BA|CAT|BB|BD|BE|BF|BG|BH|BI|BJ|BM|BN|COM|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CC|COOP|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|EDU|CR|CU|CV|CX|CY|CZ|DE|DJ|DK|DM|GOV|DO|DZ|EC|EE|EG|ER|ES|ET|EU|FI|INFO|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|aero|int|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|jobs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|mil|id|ie|il|im|in|io|iq|ir|is|it|mobi|je|jm|jo|jp|ke|kg|kh|ki|km|kn|museum|kp|kr|kw|ky|kz|la|lb|lc|li|lk|name|lr|ls|lt|lu|lv|ly|ma|mc|md|me|net|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|org|ms|mt|mu|mv|mw|mx|my|mz|na|nc|pro|ne|nf|ng|ni|nl|no|np|nr|nu|nz|tel|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|asia|travel|pr|ps|pt|pw|py|qa|re|ro|rs|ru|ac|rw|sa|sb|sc|sd|se|sg|sh|si|sj|ad|sk|sl|sm|sn|so|sr|st|su|sv|sy|ae|sz|tc|td|tf|tg|th|tj|tk|tl|tm|af|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|ag|uk|um|us|uy|uz|va|vc|ve|vg|vi|ai|vn|vu|wf|ws|ye|yt|yu|za|zm|al|am|an|biz|ao|aq|ar|as|at|au|aw|ax|az|ba|cat|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|com|bo|br|bs|bt|bv|bw|by|bz|ca|cc|coop|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|edu|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|gov|do|dz|ec|ee|eg|er|es|et|eu|fi|info|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf))$/);

      $scope.warningFlag = false;

      $scope.orderId = fdService.getOrderId();

      $scope.states_list = $rootScope.CONST.STATES;

      var updateAddressListener = $rootScope.$on('Update_address_cart', function() {
        $scope.cartChanged();
      });

      $scope.$on('$destroy', updateAddressListener);


      /**
       * $locationChangeStart event listener function
       */
      $scope.$on('$locationChangeStart', function(evt, absNewUrl, absOldUrl) {
        absOldUrl = absOldUrl.split('#');
        absNewUrl = absNewUrl.split('#');
        if (!$scope.warningFlag && absNewUrl[1] == '/transaction/info' && absOldUrl[1] == '/checkout/shipping') {
          evt.preventDefault();
          $timeout(function() {
            angular.element('.backButtonClass').trigger('click');
          });
        }
      });

      if ($scope.orderId) {
        $scope.cart = $rootScope.cart = fdService.getOrderedCart($scope.orderId);
      } else {
        $scope.cart = $rootScope.cart = fdService.getCart();
      }
      $scope.page = $routeParams.page;

      if ('shipping' == $scope.page) {

        $scope.one_step = $routeParams.one_step;
        if ((!$scope.cart.shippingAddress[0].city || !$scope.cart.shippingAddress[0].state) && $scope.cart.shippingAddress[0].zip) {
          $scope.lookupZip(0);
        }
        $timeout(function() {

          if (-2 == $scope.cart.taxPercent) {
            $scope.shippingForm.zip_0.$setValidity("no_tax", false);
          } else {
            $scope.shippingForm.zip_0.$setValidity("no_tax", true);
          }

          if ($scope.cart.shippingAddress[0].firstname && $scope.cart.shippingAddress[0].lastname) {
            if ($scope.cart.shippingAddress[0].firstname.length + $scope.cart.shippingAddress[0].lastname.length > 24) {
              $scope.shippingForm.firstname_0.$setValidity("max_length", false);
              $scope.shippingForm.lastname_0.$setValidity("max_length", false);
            }
          }

          angular.forEach($scope.shippingForm.$error, function(field) {
            angular.forEach(field, function(errorField) {
              if (errorField.$viewValue) {
                errorField.$setTouched();
                errorField.$setDirty();
              }
            })
          });
        }, 0);

        $scope.shippingProdsCart = [];
        $scope.shippingProdsCart.data = [];
        for (var p in $scope.cart.data) {
          for (var q = 0; q < $scope.cart.data[p].qty; q++) {
            $scope.shippingProdsCart.data.push($scope.cart.data[p]);
          }
        };

        if ($scope.orderId) {

          $scope.shipping_prods = {};
          $scope.shipping_prods_value = {};

          for (var i = 0; i < $scope.cart.shippingAddress.length; i++) {
            $scope.shipping_prods_value[i] = {};
            $scope.shipping_prods[i] = {};
            for (var p = 0; p < $scope.cart.shippingAddress[i].productstoShip.length; p++) {
              if ($scope.cart.shippingAddress[i].productstoShip[p].prodId && $scope.cart.shippingAddress[i].productstoShip[p].term) {
                for (var t = 0; t < $scope.shippingProdsCart.data.length; t++) {
                  if ($scope.shippingProdsCart.data[t].id == $scope.cart.shippingAddress[i].productstoShip[p].prodId && $scope.shippingProdsCart.data[t].term == $scope.cart.shippingAddress[i].productstoShip[p].term) {
                    $scope.shipping_prods[i][t] = true;
                  } else {
                    $scope.shipping_prods[i][t] = false;
                  }
                  $scope.shipping_prods_value[i][t] = true;
                }
              }
            }
          }

        } else {

          $scope.cart.shippingAddress[0].productstoShip = [];
          $scope.shipping_prods = {};
          $scope.shipping_prods_value = {};

          for (var i = 0; i < $scope.cart.num_locations_selected; i++) {
            $scope.shipping_prods_value[i] = {};
            $scope.shipping_prods[i] = {};
            for (var t = 0; t < $scope.shippingProdsCart.data.length; t++) {
              if (i == 0) {
                $scope.cart.shippingAddress[0].productstoShip.push({
                  prodId: $scope.shippingProdsCart.data[t].id,
                  term: $scope.shippingProdsCart.data[t].term,
                });
                $scope.shipping_prods[i][t] = true;
              } else {
                $scope.shipping_prods[i][t] = false;
              }
              $scope.shipping_prods_value[i][t] = true;
            }
          }
        }
      }

      if ('shipping' == $scope.page) {
        $rootScope.body_id = 'shipping';
        if (typeof($rootScope.openPane) === 'function') {
          $rootScope.openPane();
        }


      } else if ('thankyou' == $scope.page) {
        $rootScope.bodyClass = 'checkout';
        if (typeof($rootScope.closePane) === 'function')
          $rootScope.closePane();
      } else if ('cart' == $scope.page) {
        $scope.getTaxes();
      }


    };

    /**
     * setFullName function
     * @method setFullName
     * @param {} index
     * @return
     */
    $scope.setFullName = function(index) {
      if ($scope.cart.shippingAddress[index].firstname && $scope.cart.shippingAddress[index].lastname) {
        $scope.cart.shippingAddress[index].name = $scope.cart.shippingAddress[index].firstname + ' ' + $scope.cart.shippingAddress[index].lastname;
        if ($scope.cart.shippingAddress[index].name.length > 24) {
          $scope.shippingForm['firstname_' + index].$setValidity("max_length", false);
          $scope.shippingForm['firstname_' + index].$setTouched(true);
          $scope.shippingForm['lastname_' + index].$setValidity("max_length", false);
          $scope.shippingForm['lastname_' + index].$setTouched(true);
        } else {
          $scope.shippingForm['firstname_' + index].$setValidity("max_length", true);
          $scope.shippingForm['lastname_' + index].$setValidity("max_length", true);
        }
      }
    };

    /**
     * Redirect to transaction info
     * @method gotoTransaction
     * @return
     */
    $scope.gotoTransaction = function() {
      $scope.warningFlag = true;
      $location.path("/transaction/info");
      angular.element('.modal-backdrop').removeClass('modal-backdrop');
      angular.element('body').css('overflow', 'auto');

    }

    /**
     * gotoTransaction function
     * @method gotoMLocation
     * @return
     */
    $scope.gotoMLocation = function() {

      $scope.warningFlag = true;
      $location.path("/multi-locations");
      angular.element('.modal-backdrop').removeClass('modal-backdrop');
      angular.element('body').css('overflow', 'auto');

    }

    /**
     * @method resendProposal
     * @param {orderId}
     * @return
     */
    $scope.resendProposal = function(orderId){
        $scope.clickedResend = true;
        fdService.resendProposal(orderId)
            .success(function(data, status, headers, config) {
                $scope.clickedResend = false;
            })
            .error(function(data, status, headers, config) {
                $rootScope.closePane();
                $scope.clickedResend = false;
                $location.path('400');
            });
  };

    /**
     * Call this method when cart was changed
     * @method cartChanged
     * @return
     */
    $scope.cartChanged = function() {
      $scope.orderId = fdService.getOrderId();
      $rootScope.cart.shippingAddress = $scope.cart.shippingAddress;
      if ($scope.orderId) {
        $rootScope.cart = $scope.cart = fdService.orderedCartChanged($scope.orderId, $rootScope.cart);
      } else {
        $rootScope.cart = $scope.cart = fdService.cartChanged($rootScope.cart);
      }
    };

    /**
     * Call this method when shipping method was changed
     * @method shippingMethosChanged
     * @return
     */
    $scope.shippingMethosChanged = function() {
      $rootScope.cart = $scope.cart;
      $scope.cartChanged();
    };

    /**
     * Redirect to the signup page
     * @method gotoSignup
     * @return
     */
    $scope.gotoSignup = function() {
      if ($scope.signupInProgress) {
        return;
      }
      $window.location.href = '/v1/signup/owner/' + $scope.order_hash;
      $scope.signupInProgress = true;
    };

    /**
     * submitShipping function
     * @method submitShipping
     * @param {Boolean} disabled
     * @return
     */
    $scope.submitShipping = function(disabled) {
      if (disabled) {
        return;
      }

      if (!$scope.shippingForm.$valid) {
        $scope.form_error = true;
        angular.forEach($scope.shippingForm.$error, function(field) {
          angular.forEach(field, function(errorField) {
            errorField.$setTouched();
          })
        });
        return;
      }

      $rootScope.cart = $scope.cart;
      $scope.cartChanged();
      $location.path('/checkout/summary');
    };

    /**
     * _placeOrder function
     * @method _placeOrder
     * @param {Boolean} disabled
     * @return CallExpression
     */
    $rootScope._placeOrder = function(disabled) {
      return $scope.placeOrder(disabled);
    };

    /**
     * placeOrder function
     * @method placeOrder
     * @param {Boolean} disabled
     */
    $scope.placeOrder = function(disabled) {
      if (disabled) {
        return;
      }

      if ($scope.placeOrderInProgress) {
        return;
      }
      $scope.placeOrderInProgress = true;

      $scope.cartChanged();

      if (!$scope.orderId) {
        return;
      }

      fdService.getCartDetails($scope.orderId)
        .success(function(data, status, headers, config) {
          fdService.submitOrder()
            .success(function(data, status, headers, config) {
              fdService.storeOrderedCart($scope.orderId, $rootScope.cart);
              fdService.clearCart();
              $rootScope.cart = $scope.cart = fdService.getCart();
              $scope.placeOrderInProgress = false;
              if ($rootScope.resetPane) {
                $rootScope.resetPane();
              }
              $location.path('/checkout/thankyou/');
            })
            .error(function(data, status, headers, config) {
              $scope.placeOrderInProgress = false;
            });
        })
        .error(function(data, status, headers, config) {
          $scope.placeOrderInProgress = false;
          $location.path('400');
        });


      return;

      fdService.submitOrder()
        .success(function(data, status, headers, config) {
          fdService.storeOrderedCart($scope.orderId, $rootScope.cart);
          fdService.clearCart();
          $rootScope.cart = $scope.cart = fdService.getCart();
          $scope.placeOrderInProgress = false;
          if ($rootScope.resetPane) {
            $rootScope.resetPane();
          }
          $location.path('/checkout/thankyou/');
        })
        .error(function(data, status, headers, config) {
          $scope.placeOrderInProgress = false;
        });
    };

    /**
     * check if place order in progress
     * @method _isPlaceOrderInProgress
     * @return {boolean}
     */
    $rootScope._isPlaceOrderInProgress = function() {
      return $scope.placeOrderInProgress;
    };

    /**
     * getTaxes function
     * @method getTaxes
     */
    $scope.getTaxes = function() {
      if (!$scope.cart.shippingAddress[0].zip || !$scope.cart.shippingAddress[0].city) {
        return;
      }
      fdService.getTaxes($scope.cart.shippingAddress[0].zip, $scope.cart.shippingAddress[0].city)
        .success(function(data, status, headers, config) {
          $scope.cart.taxPercent = data.salesTax;
          $rootScope.cart = $scope.cart;
          $scope.cartChanged();
          if ('shipping' == $scope.page) {
            $scope.shippingForm.zip_0.$setValidity("no_tax", true);
            $scope.shippingForm.zip_0.$setTouched();
            $scope.shippingForm.zip_0.$setDirty();
          }
        })
        .error(function(data, status, headers, config) {
          if ('shipping' == $scope.page) {
            $scope.shippingForm.zip_0.$setValidity("no_tax", false);
            $scope.shippingForm.zip_0.$setTouched();
            $scope.shippingForm.zip_0.$setDirty();
          }
          $scope.cart.taxPercent = -2;
          $rootScope.cart = $scope.cart;
          $scope.cartChanged();
        });
    };

    /**
     * Redirect to the summary page
     * @method gotoSummary
     */
    $scope.gotoSummary = function() {
      $rootScope.cart = $scope.cart;
      $scope.cartChanged();
      $location.path('/checkout/summary');
    }

    /**
     * Lookup city and state by zip code using google API
     * @method lookupZip
     * @param {} index
     */
    $scope.lookupZip = function(index) {
      if (!$scope.cart.shippingAddress[index].zip) {
        return;
      } else if ($scope.shippingForm && $scope.cart.shippingAddress[index].zip == '00000') {
        $scope.shippingForm['zip_' + index].$setValidity("zipnotValid", false);
      } else if ($scope.shippingForm) {
        $scope.shippingForm['zip_' + index].$setValidity("zipnotValid", true);
      }


      fdService.lookupByZip($scope.cart.shippingAddress[index].zip, function(city, state) {
        if (!city || !state) {
          return;
        }
        $scope.cart.shippingAddress[index].city = city.substring(0, 24);
        $scope.cart.shippingAddress[index].state = state;
        $timeout(function() {
          angular.element('[name^=state]').trigger('change');
          angular.element('[name^=city]').trigger('keyup');

          angular.forEach($scope.shippingForm.$error, function(field) {
            angular.forEach(field, function(errorField) {
              if (errorField.$viewValue) {
                errorField.$setTouched();
              }
            })
          });

        }, 0);
        $scope.getTaxes();
      });
    };

    /**
     * Validate Business
     * @method validateBusiness
     * @param {} index
     */
    $scope.validateBusiness = function(index) {
      fdService.validateBusiness($scope.shippingForm['email_' + index], $scope.cart.shippingAddress[index].email);
    }


    /**
     * Add shipping address
     * @method addAddress
     */
    $scope.addAddress = function() {
      if ($scope.cart.shippingAddress.length >= $scope.cart.num_locations_selected) {
        return;
      }
      $scope.cart.shippingAddress.push({
        productstoShip: []
      });
    };

    /**
     * remove shipping address
     * @method removeAddress
     * @param {} index
     */
    $scope.removeAddress = function(index) {
      if (!index) {
        return;
      }
      $scope.cart.shippingAddress.splice(index, 1);
    };

    /**
     * on product in shipping page was checked / unchecked
     * @method productAddressChecked
     * @param {Object} p product
     * @param {Object} ad address
     * @param {numeric} index product index
     * @param {numeric} prod_index product index
     * @param {numeric} address_index address index
     */
    $scope.productAddressChecked = function(p, ad, index, prod_index, address_index) {

      var check = $scope.shipping_prods[index][prod_index][address_index];

      if (check) {
        ad.productstoShip.push({
          prodId: p.id,
          term: p.term,
        });

        p.address_num = p.address_num ? (p.address_num + 1) : 1;
      } else {
        for (var i = 0; i < ad.productstoShip.length; i++) {
          if (ad.productstoShip[i].prodId === p.id && ad.productstoShip[i].term === p.term) {
            ad.productstoShip.splice(i, 1);
            p.address_num--;
            break;
          }
        }
      }
    };

    /**
     * on product in shipping page was checked / unchecked
     * @method productAddressSelected
     * @param {Object} p product
     * @param {Object} ad address
     * @param {numeric} address_index address index
     * @param {numeric} prod_index product index
     */
    $scope.productAddressSelected = function(p, ad, address_index, prod_index) {
      var breakLoop = false;
      for (var l = 0; l < $scope.cart.shippingAddress.length && !breakLoop; l++) {
        for (var i = 0; i < $scope.cart.shippingAddress[l].productstoShip.length && !breakLoop; i++) {
          if ($scope.cart.shippingAddress[l].productstoShip[i].prodId === p.id && $scope.cart.shippingAddress[l].productstoShip[i].term === p.term) {
            $scope.cart.shippingAddress[l].productstoShip.splice(i, 1);
            breakLoop = true;
          }
        }
      }

      $scope.cart.shippingAddress[address_index].productstoShip.push({
        prodId: p.id,
        term: p.term,
      });

    };


    /**
     * check if check box should be disabled
     * @method productAddressDisabled
     * @param p
     * @param ad
     * @param index
     * @param prod_index
     * @param address_index
     * @return {boolean}
     */
    $scope.productAddressDisabled = function(p, ad, index, prod_index, address_index) {
      var check = $scope.shipping_prods[index] && $scope.shipping_prods[index][prod_index] && $scope.shipping_prods[index][prod_index][address_index];

      if ($scope.cart.shippingAddress.length === 1) {
        if (check) {
          return true;
        }
        return false;
      }

      if (check) {
        return false;
      }

      if (p.address_num >= p.qty) {
        return true;
      }

      return false;
    };


    /**
     * getShippingForm function
     * @method getShippingForm
     * @return shippingForm
     */
    $rootScope.getShippingForm = function() {
      return $scope.shippingForm;
    };


    ///////////////// MAIN ////////////////////////////////
    _init();
  }
]);;/**
 * Error Controller
 *
 */
app.controller('ErrorCtrl', ['$scope', '$location', 'fdService', '$window',
    function ($scope, $location, fdService, $window) {

  /**
   * Init function
   * @private
   */
  var _init = function(){
  };

  /**
   * redirect to the previous page
   */
  $scope.goBack = function() {
    $window.history.back();
  };
  
  ///////////////// MAIN ////////////////////////////////
  _init();
  
}]);;/**
 * E-Signature Controller
 */
app.controller('EsignatureCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {

  /**
   * Init function
   * @private
   */
  var _init = function(){

    $scope.showAll = false;
    $scope.showContinue = false;
    $rootScope.$on('Agreement_Unsigned', function() {
        $scope.showAll = true;
    });

  };

  $scope.clickContinue = function () {
    $scope.showAll = false;
  };

  ///////////////// MAIN ////////////////////////////////

  _init();

}]);;/**
 * Family Controller
 */
app.controller('FamilyCtrl', ['$scope', '$rootScope', '$window', 'fdService', '$routeParams', '$location', '$anchorScroll', 'CONST',
  function($scope, $rootScope, $window, fdService, $routeParams, $location, $anchorScroll, CONST) {

    /**
     * Init function
     * @private
     */
    var _init = function() {
      $rootScope.body_id = 'product-detail';
      $scope.family = [];
      $scope.productInfo = [];
      $scope.recommendedBundles = [];
      $scope.includes = [];
      $scope.faqs = [];
      $scope.features = [];
      $scope.specs = {};
      $scope.fid = $routeParams.fid;

      if (!$scope.fid) {
        $location.path('invalid-item');
        return;
      }

      $rootScope.cart = fdService.getCart();
      fdService.getProductOptions($scope.fid)
        .success(function(data, status, headers, config) {
          $scope.family = data;

          if ($scope.family.options && $scope.family.options.length) {
            $scope.loadProduct($scope.family.options[0].productId);
          }
        })
        .error(function(data, status, headers, config) {
          $scope.family = [];
          console.log('error');
        });

    };

    /**
     * Load product information by product Id
     * @method loadProduct
     * @param id {int} product Id
     */
    $scope.loadProduct = function(id) {
      $scope.productId = id;
      fdService.getProduct(id)
        .success(function(data, status, headers, config) {
          $scope.productInfo = data;
        })
        .error(function(data, status, headers, config) {
          $scope.productInfo = [];
          console.log('error');
        });

      fdService.getRecommendedBundles(id)
        .success(function(data, status, headers, config) {
          $scope.recommendedBundles = data;
        })
        .error(function(data, status, headers, config) {
          $scope.recommendedBundles = [];
          console.log('error');
        });

      fdService.getFaqs(id)
        .success(function(data, status, headers, config) {
          $scope.faqs = data;
        })
        .error(function(data, status, headers, config) {
          $scope.faqs = [];
          console.log('error');
        });

      fdService.getFeatures(id)
        .success(function(data, status, headers, config) {
          $scope.features = data;
        })
        .error(function(data, status, headers, config) {
          $scope.features = [];
          console.log('error');
        });
      fdService.getSpecs(id)
        .success(function(data, status, headers, config) {
          $scope.specs = data;
        })
        .error(function(data, status, headers, config) {
          $scope.specs = {};
          console.log('error');
        });
    };

    /**
     * Add product to cart
     * @method addToCart
     * @param {Object} bundle
     * @param {} family
     */
    $scope.addToCart = function(bundle, family) {

      if (!bundle) {
        bundle = JSON.parse(JSON.stringify($scope.bundle_info));
      } else {
        $anchorScroll();
      }

      var category = fdService.getCategoryFromSession();

      var pid = bundle.productId;

      if (!Object.keys(bundle).length) {
        return;
      }

      var cardNotPresent = bundle.cardNotPresent ? true : false;

      if (bundle.offeringTypes && -1 === bundle.offeringTypes.indexOf("Transactions")) {



        var pr = {
          id: pid,
          name: bundle.productName,
          price: bundle.price,
          individualPurchaseEnabled: bundle.pinPad,
          pricingModel: bundle.pricingModel,
          productType: bundle.productType,
          term: bundle.defaultPurchaseType, //Owned
          pmodel: null,
          category: category.name,
          cardNotPresent: cardNotPresent,
          qty: 1
        };

        var index = fdService.getCartProductIndex($rootScope.cart, pr);


        if (-1 !== index) {
          pr = $rootScope.cart.data[index];
          pr.qty++;
          pr.price = bundle.price;
          pr.defaultPrice = bundle.price;
          if (pr.qty > 10) {
            pr.qty = 10;
          }

          $rootScope.cart.data[index] = pr;
        } else {
          $rootScope.cart.data.push(pr);
        }
      } else {

        if (-1 !== $rootScope.cart.transaction_products.map(function(e) { return e.id; }).indexOf(bundle.productId)) {
          return;
        }

        var pr = {
          id: bundle.productId,
          name: bundle.productName,
          price: bundle.price,
          type: bundle.productType,
          term: bundle.defaultPurchaseType,
          category: category.name,
          cardNotPresent: cardNotPresent,
          parentProduct: {
            id: family.productId,
            name: family.productName,
            rate: 0,
            fee: 0,
          },
          qty: 1,
        };

        $rootScope.cart.transaction_products.push(pr);

      }

      fdService.validateCart($rootScope.cart)
        .success(function(data, status, headers, config) {
          $rootScope.cart.validation = data;
          $scope.cartChanged();
          if (data.iscartvalid)
            fdService.updatePricing();
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

      $scope.cartChanged();
      fdService.clearOrderId();


      if (window.matchMedia("(max-width: 740px)").matches) {
        $timeout(function() {
          $location.hash('order-summary-container');
          $anchorScroll();
        });
      }
      fdService.updatePricing();

    };

    /**
     * Redirect to checkout
     * @method goToCheckout
     * @param {} disabled
     */
    $scope.goToCheckout = function(disabled) {
      if (disabled || !$rootScope.cart.purchaseEnabled) {
        return;
      }
      $location.path('/checkout/shipping');
    };

    /**
     * Call this method when cart was changed
     * @method cartChanged
     * @return
     */
    $scope.cartChanged = function() {
      $rootScope.cart = fdService.cartChanged($rootScope.cart);
    };

    ///////////////// MAIN ////////////////////////////////
    _init();

  }
]);;/**
 * Index Controller
 */
app.controller('IndexCtrl', ['$scope', '$rootScope', '$filter', '$location', '$anchorScroll', '$timeout', 'fdService',
  function($scope, $rootScope, $filter, $location, $anchorScroll, $timeout, fdService) {

    /**
     * Init function
     * @private
     */
    var _init = function() {

      $rootScope.wrapperClass = 'home';
      $rootScope.body_id = 'shop';

      $rootScope.show_search = true;

      $scope.heroBundles = [];
      $scope.alacarteBundles = [];
      $scope.categories = [];
      $scope.mcc_code = null;
      $scope.mcc_codes = [];
      $scope.guideMeOnly = false;

      fdService.getCategories()
        .success(function(data, status, headers, config) {
          $scope.categories = data;
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });
    };

    /**
     * Move to anchor
     * @method gotoAnchor
     * @param {} anchor
     * @return
     */
    $scope.gotoAnchor = function(anc) {
      $timeout(function() {
        $location.hash(anc);
        $anchorScroll();
      });
    };

    /**
     * Filter Hero Products
     * @method filterHero
     * @param {} p
     * @return Boolean
     */
    $scope.filterHero = function(p) {
      if (p['tags']) {
        if (p['tags'].indexOf('HOME') != -1) {
          return true;
        }
      }
      return false;
    };

    /**
     * Change active category
     * @method changeCategory
     * @param {Object} category
     */
    $scope.changeCategory = function(category) {
      fdService.storeCategoryInSession(category);
      $location.path('/products/c');
    };

    ///////////////// MAIN ////////////////////////////////

    _init();
  }
]);;/**
 * Main Controller
 */
app.controller('MainCtrl', ['$scope', '$rootScope', '$filter', '$location', 'fdService', '$timeout', '$anchorScroll', '$window', 'CONST', '$routeParams',
  function($scope, $rootScope, $filter, $location, fdService, $timeout, $anchorScroll, $window, CONST, $routeParams) {

    /**
     * Redirect to checkout page
     * @method proceedToCheckout
     */
    $scope.proceedToCheckout = function() {
      var ep = fdService.getEquipmentPricingStorage();
      var ti = fdService.getTransactionInfo();
      var url;


      if ($rootScope.cart.num_locations > 1 && !$rootScope.cart.num_locations_selected) {
        url = '/multi-locations';
      } else if (ti && ep) {
        url = '/checkout/shipping';
      } else {
        url = '/transaction/info';
      }

      $timeout(function() {
        $location.path(url);
      });
    };

    /**
     * Get Shipping Methods Function
     * @method getShippingMethods
     * @return
     */
    $scope.getShippingMethods = function() {
      if (!fdService.getSessionShippingMethods()) {
        fdService.getShippingMethods()
          .success(function(data, status, headers, config) {
            var shippingOptions = {};
            data.sort(function(a, b) {
              return a.price - b.price;
            });
            for (var i = 0; i < data.length; i++) {
              data[i].name = data[i].productShortDescription;
              shippingOptions[i + 1] = data[i];
            }
            fdService.storeShippingMethods(shippingOptions);
          })
          .error(function(data, status, headers, config) {
            $location.path('400');
          });
      }
    };

    /**
     * Init function
     * @private
     */
    var _init = function() {
      $scope.Math = window.Math;
      $rootScope.wrapperId = 'main-wrapper';
      $rootScope.CONST = CONST;
      $rootScope.headerTpl = 'templates/header.tpl';
      $rootScope.cart = fdService.getCart();

      $scope.$on('$routeChangeSuccess', function() {
         if ($routeParams.eSignature) {
           $scope.showEsignature = true;
         } else {
           $scope.showEsignature = false;
         }
      });

      $scope.$watch(function() {
        return fdService.getOrderId();
      }, function(newVal, oldVal) {
        $scope.orderId = fdService.getOrderId();
      }, true);

      $rootScope.placeholderImageUrl = 'img/placeholder-product.jpg';
      // Check if touch device
      if ('ontouchstart' in window || navigator.maxTouchPoints) {
        $rootScope.isTouch = true;
      } else {
        $rootScope.isTouch = false;
      }
      $scope.currentYear = new Date().getFullYear();
    };

    ///////////////// MAIN ////////////////////////////////
    _init();
  }
]);;/**
 * Multi Locations Controller
 */
app.controller('MultiLocationsCtrl', ['$scope', '$rootScope', '$window', 'fdService', '$routeParams', '$location', 'CONST',
  function($scope, $rootScope, $window, fdService, $routeParams, $location, CONST) {

    /**
     * init function
     * @private
     */
    var _init = function() {

      $scope.orderId = fdService.getOrderId();

      if ($scope.orderId) {
        $scope.cart = $rootScope.cart = fdService.getOrderedCart($scope.orderId);
      } else {
        $scope.cart = $rootScope.cart = fdService.getCart();
      }

      // on cart changed
      var offCartChanged = $rootScope.$on('cart-changed', function(e, cart) {
        $scope.cart = cart;
      });

      // Clear pricing
      fdService.clearAcquiringPricing();
      fdService.clearGlobalPricing();
      fdService.clearEquipmentPricing();

      $rootScope.cart = fdService.cartChanged($scope.cart);

      // Destroy on cart changed when scope destroyed to avoid multiple calls
      $scope.$on('$destroy', function() {
        offCartChanged();
      });
    };

    /**
     * change number of selected locations
     * @method changeNumber
     * @param {number} n
     */
    $scope.changeNumber = function(n) {

      if ($scope.cart.num_locations < n) {
        n = $scope.cart.num_locations;
      }
      $scope.cart.num_locations_selected = n;
      $rootScope.cart = fdService.cartChanged($scope.cart);
    };

    ///////////////// MAIN ////////////////////////////////
    _init();
  }
]);;/**
 * Options Controller
 */
app.controller('OptionsCtrl', ['$scope', '$rootScope', '$location', '$routeParams', '$anchorScroll', '$window', 'fdService', '$timeout', '$filter', 'CONST',
  function($scope, $rootScope, $location, $routeParams, $anchorScroll, $window, fdService, $timeout, $filter, CONST) {
    $rootScope.body_id = 'product-detail';

    /**
     * Product Thumb Image
     * @method ProductThumbImg
     * @param imgArray
     */
    $scope.ProductThumbImg = function(imgArray) {
      if (imgArray.length == 0) {
        return $rootScope.placeholderImageUrl;
      }
      for (var i in imgArray) {
        if (imgArray[i].indexOf('/thumb/') !== -1) {
          return imgArray[i];
        }
      }
    };

    /**
     * Add product to cart
     * @method addToCart
     * @param {Object} product object
     */
    $scope.addToCart = function(product) {

      var cart = fdService.getCart();

      var category = fdService.getCategoryFromSession();
      var cardNotPresent = product.cardNotPresent ? true : false;

      var family = product.parentProduct;

      if (!family) {

        if (-1 !== cart.transaction_products.map(function(e) { return e.id; }).indexOf(product.productId)) {
          return;
        }

        var pr = {
          id: product.productId,
          name: product.productName,
          price: product.price,
          type: product.productType,
          term: product.defaultPurchaseType,
          category: category.name,
          cardNotPresent: cardNotPresent,
          qty: 1,
        };

        cart.transaction_products.push(pr);


      } else {
        var fid = family.id;

        if (!Object.keys(family).length) {
          return;
        }

        if (!cart.payment_types || fid != cart.payment_types.id) {
          cart.payment_types = {
            id: fid,
            name: family.name,
            products: {},
          };
        }
        cart.payment_types.products[product.productId] = {
          id: product.productId,
          name: product.productName,
          price: product.price,
          type: product.productType,
          term: product.defaultPurchaseType,
          category: category.name,
          cardNotPresent: cardNotPresent,
          qty: 1,
        }
      }



      $rootScope.cart = fdService.cartChanged(cart);

      fdService.validateCart($rootScope.cart)
        .success(function(data, status, headers, config) {
          $rootScope.cart.validation = data;
          $rootScope.cart = fdService.cartChanged($rootScope.cart);
          if (data.iscartvalid)
            fdService.updatePricing();
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

      fdService.clearOrderId();


      if (window.matchMedia("(max-width: 740px)").matches) {
        $timeout(function() {
          $location.hash('order-summary-container');
          $anchorScroll();
        });
      }
    };

    /**
     * Init function
     * @private
     */
    var _init = function() {
      $scope.productType = $routeParams.typename;
      $rootScope.cart = fdService.getCart();
      if ($rootScope.cart.validation.carterrors) {
        $scope.sortedValidation = $filter('orderBy')($rootScope.cart.validation.carterrors, '_errorOrder');
        var currentCartError = $scope.sortedValidation[0];
        $scope.productDisplayName = currentCartError.errormessage;
      } else {
        $scope.productDisplayName = $scope.productType.charAt(0) + $scope.productType.substr(1).toLowerCase();
      }

      fdService.getProductsByOptionType($scope.productType)
        .success(function(data, status, headers, config) {
          $scope.products = data;
        })
        .error(function(data, status, headers, config) {
          $scope.products = [];
        });
    };

    ///////////////// MAIN ////////////////////////////////
    _init();

  }
]);;/**
 * Processing Controller
 */
app.controller('ProcessingCtrl', ['$scope', '$rootScope', '$window', 'fdService', '$routeParams', '$location', '$anchorScroll', 'CONST', '$timeout',
  function($scope, $rootScope, $window, fdService, $routeParams, $location, $anchorScroll, CONST, $timeout) {

    /**
     * Init function
     * @private
     */
    var _init = function() {
      $scope.id = $routeParams.id;
      $rootScope.body_id = 'product-detail';
      $scope.family = [];
      $scope.faqs = [];
      $scope.features = [];

      $rootScope.cart = fdService.getCart();

      //Redirect if no product Id provided
      if (!$scope.id) {
        $location.path('404');
        return;
      }

      fdService.getProductOptions($scope.id)
        .success(function(data, status, headers, config) {
          $scope.family = data;
          $rootScope.recommendedProductName = $scope.family.productName;
          $scope.bundle_info = {};
          $scope.bundle_info.productName = $scope.family.productName;

        })
        .error(function(data, status, headers, config) {
          $location.path('invalid-item');
        });


      fdService.getFaqs($scope.id)
        .success(function(data, status, headers, config) {
          $scope.faqs = data;
        })
        .error(function(data, status, headers, config) {
          $scope.faqs = [];
          console.log('error');
        });

      fdService.getFeatures($scope.id)
        .success(function(data, status, headers, config) {
          $scope.features = data;
        })
        .error(function(data, status, headers, config) {
          $scope.features = [];
          console.log('error');
        });

      $scope.timestamp = new Date().getTime();
      fdService.getProductsList($scope.id)
        .success(function(data, status, headers, config) {
          $scope.includes = data;
        })
        .error(function(data, status, headers, config) {
          $scope.includes = [];
          console.log('error');
        });
      //Get Recommended products list.
      fdService.getRecommendedBundles($scope.id)
        .success(function(data, status, headers, config) {
          $scope.recommended = data;
        })
        .error(function(data, status, headers, config) {
          $scope.recommended = [];
          console.log('error');
        });

    };

    /**
     * Add processing product to cart
     * @method addToCart
     * @param {Object} parent product
     * @param {Object} product
     */
    $scope.addToCart = function(family, product) {

      var cart = fdService.getCart();

      var category = fdService.getCategoryFromSession();
      var cardNotPresent = product.cardNotPresent ? true : false;

      if (!family) {

      if (-1 !== cart.transaction_products.map(function(e) { return e.id; }).indexOf(product.productId)) {
          return;
        }

        var pr = {
          id: product.productId,
          name: product.productName,
          price: product.price,
          type: product.productType,
          term: product.defaultPurchaseType,
          category: category.name,
          cardNotPresent: cardNotPresent,
          parentProduct: {
            id: null,
            name: null,
            rate: 0,
            fee: 0,
          },
          qty: 1,
        };

        cart.transaction_products.push(pr);


      } else {
        var fid = family.productId;

        if (!Object.keys(family).length) {
          return;
        }

        if (!cart.payment_types || fid != cart.payment_types.id) {
          cart.payment_types = {
            id: fid,
            name: family.productName,
            products: {},
          };
        }
        cart.payment_types.products[product.productId] = {
          id: product.productId,
          name: product.productName,
          price: product.price,
          type: product.productType,
          term: product.defaultPurchaseType,
          category: category.name,
          cardNotPresent: cardNotPresent,
          qty: 1,
        };
      }



      $rootScope.cart = fdService.cartChanged(cart);

      fdService.validateCart($rootScope.cart)
        .success(function(data, status, headers, config) {
          $rootScope.cart.validation = data;
          $rootScope.cart = fdService.cartChanged($rootScope.cart);
          $scope.cartChanged();
          if (data.iscartvalid)
            fdService.updatePricing();
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

      fdService.clearOrderId();

      //Scroll to the cart in case of small screen
      if (window.matchMedia("(max-width: 740px)").matches) {
        $timeout(function() {
          $location.hash('order-summary-container');
          $anchorScroll();
        });
      }
    };

    /**
     * Redirect to the checkout page
     * @method goToCheckout
     * @param {Boolean} if true do nothing
     */
    $scope.goToCheckout = function(disabled) {
      if (disabled || !$rootScope.cart.purchaseEnabled) {
        return;
      }
      $location.path('/checkout/shipping');
    };

    /**
     * Calling in case of changing cart.
     * @method cartChanged
     */
    $scope.cartChanged = function() {
      $rootScope.cart = fdService.cartChanged($rootScope.cart);
    };

    /**
     * Scroll to anchor
     * @method gotoAnchor
     * @param {String} anchor
     */
    $scope.gotoAnchor = function(anc) {
      $timeout(function() {
        $location.hash(anc);
        $anchorScroll();
      });
    };

    ///////////////// MAIN ////////////////////////////////
    _init();

  }
]);;/**
 * Product Controller
 */
app.controller('ProductCtrl', ['$scope', '$rootScope', '$filter', '$location', '$routeParams', '$timeout', '$anchorScroll', '$window', 'fdService', 'CONST',
  function($scope, $rootScope, $filter, $location, $routeParams, $timeout, $anchorScroll, $window, fdService, CONST) {


    /**
     * Image Change Timeout Promise
     */
    var imgPromise;

    /**
     * Init function
     * @private
     */
    var _init = function() {

      $scope.timestamp = new Date().getTime();
      $rootScope.cart.taxPercent = 9; //set sales tax = 9%

      $scope.page = $routeParams.page;

      $rootScope.cart = $rootScope.cart;

      $rootScope.body_id = 'product-detail';

      $scope.bundle_info = {};
      $scope.includes = [];
      $scope.features = [];
      $scope.faqs = [];
      $scope.specs = {};
      $scope.recommendedBundles = [];
      $scope.min_lease_amt = 0;

      $scope.images = [];
      $scope.cimage = $rootScope.placeholderImageUrl;

      if (!$routeParams.pid) {
        $location.path('/');
        return;
      }

      $scope.pid = $routeParams.pid;

      // Get product features
      fdService.getFeatures($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.features = data;
        })
        .error(function(data, status, headers, config) {
          $scope.features = [];
          console.log('error');
        });

      // Get product specifications
      fdService.getSpecs($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.specs = data;
        })
        .error(function(data, status, headers, config) {
          $scope.specs = {};
          console.log('error');
        });

      // Get product details
      fdService.getProduct($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.bundle_info = data;
          $scope.images = $scope.bundle_info.imageUrls ? $scope.bundle_info.imageUrls : [];

          $rootScope.title = $scope.bundle_info.productName;
          $rootScope.recommendedProductName = $scope.bundle_info.productName;
          $scope.min_lease_amt = 0;
          if (data.pricingModel && data.pricingModel.length) {
            for (var i = 0; i < data.pricingModel.length; i++) {
              if (CONST.PURCHASE_CODE != data.pricingModel[i].purchaseType && data.pricingModel[i].defaultAmt && (!$scope.min_lease_amt || data.pricingModel[i].defaultAmt < $scope.min_lease_amt)) {
                $scope.min_lease_amt = data.pricingModel[i].defaultAmt;
              }
            }
          }
          $scope.thumbImages = [];
          $scope.largeImages = [];
          for (var i in $scope.images) {
            if ($scope.images[i].indexOf('/thumb/') !== -1) {
              $scope.thumbImages.push($scope.images[i]);
            }
            if ($scope.images[i].indexOf('/large/') !== -1) {
              $scope.largeImages.push($scope.images[i]);
            }
          }
          $scope.changeImage($scope.thumbImages[0]);

        })
        .error(function(data, status, headers, config) {
          $scope.bundle_info = [];
          $location.path('invalid-item');
          $scope.min_lease_amt = 0;
          console.log('error');
        });

      // Get Recommended bundles for this product
      fdService.getRecommendedBundles($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.recommendedBundles = data;
        })
        .error(function(data, status, headers, config) {
          $scope.recommendedBundles = [];
          console.log('error');
        });

      // Get Products List
      fdService.getProductsList($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.includes = data;
        })
        .error(function(data, status, headers, config) {
          $scope.includes = [];
          console.log('error');
        });

      // Get FAQ list for product
      fdService.getFaqs($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.faqs = data;
        })
        .error(function(data, status, headers, config) {
          $scope.faqs = [];
          console.log('error');
        });
    };

    /**
     * Redirect to checkout
     * @method goToCheckout
     * @param {Boolean} do nothing if true
     */
    $scope.goToCheckout = function(disabled) {
      if (disabled || !$rootScope.cart.purchaseEnabled) {
        return;
      }
      $location.path('/checkout/shipping');
    };

    /**
     * Add product to the cart
     * @method addToCart
     * @param {Object} product
     */
    $scope.addToCart = function(bundle) {
      if (!bundle) {
        bundle = JSON.parse(JSON.stringify($scope.bundle_info));
      } else {
        $anchorScroll();
      }

      var pid = bundle.productId;

      if (!Object.keys(bundle).length) {
        return;
      }
      if ($rootScope.cart.data[pid]) {
        var qty = parseInt($rootScope.cart.data[pid].qty);
        if (qty < 10) {
          qty++;
          $rootScope.cart.data[pid].qty = qty.toString();
        }
      } else {
        $rootScope.cart.data[pid] = {
          id: pid,
          name: bundle.productName,
          price: bundle.price,
          individualPurchaseEnabled: bundle.pinPad,
          pricingModel: bundle.pricingModel,
          productType: bundle.productType,
          term: CONST.PURCHASE_CODE,
          pmodel: null,
          qty: "1"
        };
      }

      // Validate if cart is ready to checkout
      fdService.validateCart($rootScope.cart)
        .success(function(data, status, headers, config) {
          $rootScope.cart.validation = data;
          $scope.cartChanged();
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

      $scope.cartChanged();
      fdService.clearOrderId();

      //Scroll to the cart in case of small screen
      if (window.matchMedia("(max-width: 740px)").matches) {
        $timeout(function() {
          $location.hash('order-summary-container');
          $anchorScroll();
        });
      }

      // Update pricing
      fdService.updatePricing();
    };

    /**
     * Lease product
     * @method leaseProduct
     * @param {Object} product
     */
    $scope.leaseProduct = function(bundle) {

      if (!bundle) {
        bundle = JSON.parse(JSON.stringify($scope.bundle_info));
      } else {
        $anchorScroll();
      }

      fdService.leaseProduct(bundle, $rootScope.cart);
      $scope.cartChanged();

      //Scroll to the cart in case of small screen
      if (window.matchMedia("(max-width: 740px)").matches) {
        $timeout(function() {
          $location.hash('order-summary-container');
          $anchorScroll();
        });
      }

      // Update pricing
      fdService.updatePricing();

      // Validate if cart is ready to checkout
      fdService.validateCart($rootScope.cart)
        .success(function(data, status, headers, config) {
          $rootScope.cart.validation = data;
          $scope.cartChanged();
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });
    };

    /**
     * Calling in case of changing cart.
     * @method cartChanged
     */
    $scope.cartChanged = function() {
      $rootScope.cart = fdService.cartChanged($rootScope.cart);
    };

    /**
     * Change active image
     * @method changeImage
     * @param {String} img
     */
    $scope.changeImage = function(img) {
      if (imgPromise) {
        $timeout.cancel(imgPromise);
      }
      imgPromise = $timeout(function() {
        var cimage = img.replace('/thumb/', '/large/');
        for (var i in $scope.largeImages) {
          if (cimage == $scope.largeImages[i]) {
            $scope.cimage = cimage;
            return;
          } else {
            $scope.cimage = $rootScope.placeholderImageUrl;
          }
        }
      }, 100);
    };
    ///////////////// MAIN ////////////////////////////////
    _init();
  }
]);;/**
 * Products Controller
 */
app.controller('ProductsCtrl', ['$scope', '$rootScope', '$filter', '$location', '$routeParams', '$timeout', '$anchorScroll', '$window', 'fdService', 'CONST',
  function($scope, $rootScope, $filter, $location, $routeParams, $timeout, $anchorScroll, $window, fdService, CONST) {
    $rootScope.body_id = 'products';

    $scope.categoryDisabled = false;

    $scope.prodToShow = [];

    $scope.keyword = '';

    $scope.categoryId = null;
    $scope.categories = [];

    $scope.bundle_info = {};
    $scope.includes = [];
    $scope.features = [];
    $scope.faqs = [];
    $scope.specs = {};
    $scope.recommendedBundles = [];

    $scope.images = [];
    $scope.cimage = $rootScope.placeholderImageUrl;

    $scope.allProducts = [];
    $scope.products = [];

    $scope.monthlyFee = false;
    $scope.transactionFee = false;

    /**
     * Change active category
     * @method changeCategory
     */
    $scope.changeCategory = function() {
      if (!$scope.$$phase) {
        $scope.$apply();
      }

      if ($scope.category) {
        $scope.businessCategory = [$scope.category];
        fdService.storeCategoryInSession($scope.category);
      }

      $scope.generateAcData($scope.allProducts);
      $scope.loadMore();
    };

    /**
     * search products
     * @method search
     */
    $scope.search = function() {
      if (!$scope.$$phase) {
        $scope.$apply();
      }
      $scope.loadMore();
    };

    /**
     * Sort products by tag filter
     * @method sortbytag
     * @param {Object} product
     * @return {number}
     */
    $scope.sortbytag = function(p) {
      if (p['tags'] && p['tags'].indexOf('TOP 10') != -1) {
        return 0;
      }
      return 1;
    };

    /**
     * Filter featured products
     * @method filterHero
     * @param {Object} product
     * @return {boolean}
     */
    $scope.filterHero = function(p) {
      if (p['tags']) {
        if (p['tags'].indexOf('HOME') != -1) {
          return true;
        }
      }
      return false;
    };

    /**
     * Filter products
     * @method filterProd
     * @param {Object} product
     * @return {boolean}
     */
    $scope.filterProd = function(p) {

      var ret = true;
      if ($scope.productType) {
        if (p['productType'] == $scope.productType) {
          ret = true;
        } else {
          ret = false;
        }
      }
      if ($scope.businessCategory && $scope.businessCategory.length) {
        ret = false;
        if (p['categoryIds']) {
          for (var i = 0; i < $scope.businessCategory.length; i++) {
            if (p['categoryIds'].indexOf(parseInt($scope.businessCategory[i].id)) != -1) {
              ret = true;
              break;
            }
          }
        }
      }
      if (!$scope.keyword || !$scope.keyword.length || p.productName.toLowerCase().indexOf($scope.keyword.toLowerCase()) != -1) {
        ret = ret && true;
      } else {
        if (p['tags'] && p['tags'].indexOf($scope.keyword) != -1) {
          ret = ret && true;
        } else {
          ret = false;
        }
      }
      return ret;
    };

    /**
     * Generate autocomplete data
     * @method generateAcData
     * @param data
     * @return {Array}
     */
    $scope.generateAcData = function(data) {

      var acData = [];

      for (var i in data) {
        var p = data[i];
        var incl = true;
        if ($scope.businessCategory && $scope.businessCategory.length) {
          incl = false;
          if (p['categoryIds']) {
            for (var k = 0; k < $scope.businessCategory.length; k++) {
              if (p['categoryIds'].indexOf(parseInt($scope.businessCategory[k].id)) != -1) {
                incl = true;
                break;
              }
            }
          }
        }
        if (!incl) {
          continue;
        }

        if (acData.indexOf(p.productName) == -1) {
          acData.push(p.productName);
        }
        for (var k in p.tags) {
          if (acData.indexOf(p.tags[k]) == -1) {
            acData.push(p.tags[k]);
          }
        }
      }

      $("#search-products").autocomplete({
        delay: 0,
        select: function(event, ui) {
          $scope.keyword = ui.item.value;
          $scope.search();
        },
        source: acData
      });

      return acData;
    };

    /**
     * load more products for the infinite loop
     * @method loadMore
     */
    $scope.loadMore = function() {
      if ($scope.products.length >= $scope.allProducts.length) return;

      var st = $scope.products.length;
      // for(var i = 0; i < 5 || !$scope.prodToShow.length; i++) {
      for (var i = 0; i < 5; i++) {
        var key = st + i;
        if (key > $scope.allProducts.length - 1) return;
        $scope.products.push($scope.allProducts[key]);
      }
      $timeout(function() {
        if ($scope.prodToShow.length < 5) {
          $scope.loadMore();
        }
      });
    };

    fdService.getAllProducts()
      .success(function(data, status, headers, config) {
        $scope.allProducts = [];

        for (var i in data) {
          var p = data[i];
          if (p.productType.indexOf('FEE') != -1) {
            continue;
          }
          if (p.productWithOptions) {
            p.prod_url = 'family/' + p.productFamilyId;
          } else if ('ACQUIRING' == p.productType) {
            p.prod_url = 'processing/' + p.productId;
          } else {
            p.prod_url = 'product/' + p.productId;
          }
          $scope.allProducts.push(p);
        }

        $scope.generateAcData($scope.allProducts);

        $scope.loadMore();
      })
      .error(function(data, status, headers, config) {
        $scope.allProducts = [];
        $scope.generateAcData([]);
      });

    /**
     * Get Taxes
     * @method getTaxes
     * @param {} zip
     * @param {} city
     */
    $scope.getTaxes = function(zip, city) {
      if (!zip || !city) {
        return;
      }
      fdService.getTaxes(zip, city)
        .success(function(data, status, headers, config) {
          $rootScope.cart.taxPercent = data.salesTax;
          $scope.cartChanged();
        })
        .error(function(data, status, headers, config) {
          $rootScope.cart.taxPercent = -2;
          $scope.cartChanged();
          console.log('error');
        });
    };

    /**
     * Redirect to the checkout page
     * @method goToCheckout
     * @param disabled
     */
    $scope.goToCheckout = function(disabled) {
      if (disabled || !$rootScope.cart.purchaseEnabled) {
        return;
      }
      $location.path('/checkout/shipping');
    };

    /**
     * Add To Cart
     * @method addToCart
     * @param {object} product
     */
    $scope.addToCart = function(bundle) {

      if (!bundle) {
        bundle = JSON.parse(JSON.stringify($scope.bundle_info));
      } else {
        $anchorScroll();
      }
      var bid = bundle.productId;

      if (!Object.keys(bundle).length) {
        return;
      }
      var category = fdService.getCategoryFromSession();

      var cardNotPresent = bundle.cardNotPresent ? true : false;


      var pr = {
        id: bid,
        name: bundle.productName,
        price: bundle.price,
        individualPurchaseEnabled: bundle.pinPad,
        pricingModel: bundle.pricingModel,
        productType: bundle.productType,
        term: bundle.defaultPurchaseType,
        pmodel: null,
        category: category.name,
        cardNotPresent: cardNotPresent,
        qty: 1
      };

      var index = fdService.getCartProductIndex($rootScope.cart, pr);

      if (-1 !== index) {
        pr = $rootScope.cart.data[index];
        pr.qty++;
        pr.price = bundle.price;
        pr.defaultPrice = bundle.price;
        if (pr.qty > 10) {
          pr.qty = 10;
        }

        $rootScope.cart.data[index] = pr;
      } else {
        $rootScope.cart.data.push(pr);
      }

      fdService.validateCart($rootScope.cart)
        .success(function(data, status, headers, config) {
          $rootScope.cart.validation = data;
          $scope.cartChanged();
          if (data.iscartvalid)
            fdService.updatePricing();
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

      $scope.cartChanged();
      fdService.clearOrderId();

      //    $scope.showCheckout = true;

      if (window.matchMedia("(max-width: 740px)").matches) {
        $timeout(function() {
          $location.hash('order-summary-container');
          $anchorScroll();
        });
      }
    };

    /**
     * Cart Changed
     * @method cartChanged
     */
    $scope.cartChanged = function() {
      $rootScope.cart = fdService.cartChanged($rootScope.cart);
    };

    var imgPromise;

    /**
     * Change Image
     * @method changeImage
     * @param {} img
     */
    $scope.changeImage = function(img) {
      if (imgPromise) {
        $timeout.cancel(imgPromise);
      }
      imgPromise = $timeout(function() {
        $scope.cimage = img;
      }, 100);
    };


    /**
     * Get image thumbnail for product
     * @method ProductThumbImg
     * @param imgArray
     */
    $scope.ProductThumbImg = function(imgArray) {
      if (imgArray.length == 0) {
        return $rootScope.placeholderImageUrl;
      }
      for (var i in imgArray) {
        if (imgArray[i].indexOf('/thumb/') !== -1) {
          return imgArray[i];
        }
      }
    };

    /**
     * Init function
     * @method _init
     */
    var _init = function() {

      if ('t' == $routeParams.type && $routeParams.typename) {
        $scope.productType = $routeParams.typename;

        if ($scope.productType != 'ACQUIRING') {
          $scope.categoryDisabled = false;
          fdService.getCategories().success(function(data, status, headers, config) {
              var c = fdService.getCategoryFromSession();
              $scope.categories = data;
              if (c) {
                $scope.category = c;
                $timeout(function() {
                  $scope.loadMore();
                }, 1);
              } else {
                $scope.category = null;
              }
            })
            .error(function(data, status, headers, config) {
              $location.path('/400');
            });
        } else {
          $scope.categoryDisabled = true;
          $timeout(function() {
            $scope.loadMore();
          }, 1);
        }

      } else {
        fdService.getCategories().success(function(data, status, headers, config) {
          $scope.categoryDisabled = false;
          var c = fdService.getCategoryFromSession();
          $scope.categories = data;
          if (c) {
            $scope.category = c;
            $scope.businessCategory = [c];
            $timeout(function() {
              angular.element('#categoryfilter').trigger('change');
              $scope.loadMore();
            }, 1);
          } else {
            $scope.category = null;
          }
        });

        if ('c' == $routeParams.type) {

          var c = fdService.getCategoryFromSession();
          if (c) {
            $scope.category = c;
            $scope.businessCategory = [c];
            $timeout(function() {
              angular.element('#categoryfilter').trigger('change');
              $scope.loadMore();
            }, 1);
          } else {
            $scope.category = null;
          }
        } else if ('recommended' == $routeParams.type) {
          $scope.productContentType = $routeParams.type;
          $scope.isRecommendedCallDone = false;
          var pid = $routeParams.typename;
          fdService.getRecommendedBundles(pid)
            .success(function(data, status, headers, config) {
              $scope.recommendedBundles = data;
              $scope.isRecommendedCallDone = true;
            })
            .error(function(data, status, headers, config) {
              $scope.recommendedBundles = [];
              $scope.isRecommendedCallDone = true;
            });
        }

      }
    };

    ///////////////// MAIN ////////////////////////////////
    _init();

  }
]);;/**
 * Recommended Products controller
 */
app.controller('RecommendedProductsCtrl', ['$scope', '$rootScope', '$filter', '$location', '$routeParams', '$anchorScroll', '$window', 'fdService', 'CONST',
  function($scope, $rootScope, $filter, $location, $routeParams, $anchorScroll, $window, fdService, CONST) {
    $rootScope.body_id = 'products';

    /**
     * Product Thumb Image
     * @method ProductThumbImg
     * @param {} imgArray
     */
    $scope.ProductThumbImg = function(imgArray) {
      if (imgArray.length == 0) {
        return $rootScope.placeholderImageUrl;
      }
      for (var i in imgArray) {
        if (imgArray[i].indexOf('/thumb/') !== -1) {
          return imgArray[i];
        }
      }
    };

    /**
     * Init function
     * @method _init
     */
    var _init = function() {
      $scope.recommendedBundles = [];
      $scope.isRecommendedCallDone = false;
      $scope.pid = $routeParams.pid;
      fdService.getRecommendedBundles($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.recommendedBundles = data;
          $scope.isRecommendedCallDone = true;
        })
        .error(function(data, status, headers, config) {
          $scope.recommendedBundles = [];
          $scope.isRecommendedCallDone = true;
        });
    };

    ///////////////// MAIN ////////////////////////////////

    _init();

  }
]);;/**
 * Signup Location Controller
 */
app.controller('SignupLocationCtrl', ['$scope', '$rootScope', '$filter', '$location', 'fdService', '$timeout', '$anchorScroll', 'CONST', '$routeParams',
  function($scope, $rootScope, $filter, $location, fdService, $timeout, $anchorScroll, CONST, $routeParams) {

    /**
     * Init function
     * @method _init
     */
    var _init = function() {
      $rootScope.body_id = 'full_body';

      $scope.current_number = $routeParams.num;

      /* percentValues hold indices array for ng-options*/
      $scope.percentValues = (function() {
        var tempArr = [];
        for (var i = 0; i <= 20; i++)
          tempArr.push(i * 5);
        return tempArr;
      })();

      var orderId = fdService.getOrderId();
      var cart = fdService.getOrderedCart(orderId);

      if (!cart) {
        $location.path('/');
      }

      //set category details
      $scope.categoryDetails = {name: cart.data[Object.keys(cart.data)[0]].category};

      $scope.num_locations_selected = cart.num_locations_selected || 1;

      if (!$scope.current_number || $scope.num_locations_selected < $scope.current_number) {
        $scope.current_number = 1;
      }


      $scope.clickedSubmit = false;
      $scope.bankErrorCount = 0;
      $scope.bankError = false;
      $scope.bankErrorServerFails = false;
      $scope.bankCheck = false;
      $scope.bankErrorCount_second = 0;
      $scope.bankError_second = false;
      $scope.bankErrorServerFails_second = false;
      $scope.bankCheck_second = false;

      var ti = fdService.getTransactionInfo();


      $scope.form_error = false;
      $scope.states_list = $rootScope.CONST.STATES;
      $scope.globalFormData = {};

      for (var i = 1; i <= $scope.num_locations_selected; i++) {
        $scope.globalFormData[i] = {};
        $scope.globalFormData[i].bankInformation = {};

        if (!angular.isUndefined(cart.shippingAddress[0])) {
          $scope.globalFormData[i].DBA_NAME = cart.shippingAddress[0].company;

          $scope.globalFormData[i].statementDeliveryEmail = cart.shippingAddress[0].email;
          $scope.globalFormData[i].statementDeliveryType = "Email";
          angular.forEach(CONST.FSPFUNDTYPES, function(value, key) {
            $scope.globalFormData[i].bankInformation[value] = '0';
          });
          $scope.globalFormData[i].name = cart.shippingAddress[0].firstname + " " + cart.shippingAddress[0].lastname;

        }

        if (ti.annualVolume) {
          $scope.globalFormData[i].annualVolume = ti.annualVolume;
        }

        if (ti.annualcardVolume) {
          $scope.globalFormData[i].annualcardVolume = ti.annualcardVolume;
        }

        if (ti.averageTicket) {
          $scope.globalFormData[i].TYPICAL_SALE_AMOUNT = ti.averageTicket;
        }

        if (ti.highestTicket) {
          $scope.globalFormData[i].ANTICIPATED_HIGHEST_TICKET_SALE = ti.highestTicket;
        }
        // $scope.globalFormData[i].mcccodes = ti.mccTypes;

        if (undefined !== cart.shippingAddress[i - 1]) {
          $scope.globalFormData[i].business_address1 = cart.shippingAddress[i - 1].address1;
          $scope.globalFormData[i].business_address2 = cart.shippingAddress[i - 1].address2;
          $scope.globalFormData[i].business_address_zip = cart.shippingAddress[i - 1].zip;
          $scope.globalFormData[i].business_address_city = cart.shippingAddress[i - 1].city;
          $scope.globalFormData[i].business_address_state = cart.shippingAddress[i - 1].state;
          $scope.globalFormData[i].DBA_NAME = cart.shippingAddress[i - 1].company_name;
        }

        $scope.globalFormData[i].products = [];
        $scope.globalFormData[i].rollupIndicator = '2';

      }

      $scope.getWebsiteFlag();
      $scope.formData = $scope.globalFormData[$scope.current_number];

      $timeout(function() {
        angular.element('[name=mcccodes]').trigger('change');
      }, 50);


      // Get MCC Codes
      $scope.mcc_codes = [];
      fdService.getMccCodes($scope.categoryDetails.name).success(function(data, status, headers, config) {
        $scope.mcc_codes = data;
      });

      $scope.products = [];
      $scope.globalFormData[1].noOfRegisters = 1;

      // Get products list
      fdService.getCartOrderProducts(orderId).success(function(data, status, headers, config) {

        $scope.products = data;
        var k;

        for (var i = 0; i < $scope.products.length; i++) {

          if (i >= $scope.num_locations_selected) {
            k = 1;
          } else {
            k = i + 1;
          }

          $scope.products[i].location_num = k;
          $scope.globalFormData[k].products.push($scope.products[i]);
        }


        fdService.getOrderLocations(orderId).success(function(data, status, headers, config) {
          $scope.orderLocationsInfo = data.locationInformation;
          for (var i = 0; i < $scope.orderLocationsInfo.length; i++) {
            var form = $scope.globalFormData[i + 1];
            var formData = $scope.orderLocationsInfo[i];
            form.mcccodes = formData.mccDescription;
            form.mcc = formData.mcc;
            if (formData.dbaName) {
              form.DBA_NAME = formData.dbaName;
            }
            form.annualcardVolume = formData.annualVolume;
            form.merchantId = formData.merchantId;
            form.FACE_TO_FACE = formData.faceToFace;
            form.PHONE_OR_EMAIL = formData.phoneOrEmail;
            form.INTERNET_PAY = formData.internet;

            if (formData.averageTicket) {
              form.TYPICAL_SALE_AMOUNT = formData.averageTicket;
            }

            if (formData.highestTicket) {
              form.ANTICIPATED_HIGHEST_TICKET_SALE = formData.highestTicket;
            }

            if (formData.rollupIndicator != undefined) {
              form.rollupIndicator = formData.rollupIndicator;
            }

            if (formData.siteSurvey) {

              var siteSurvey = formData.siteSurvey;
              form.siteVisitation = siteSurvey.siteVisitation;
              form.DELIVERY0_7 = siteSurvey.deliveryTimeFrame_0_To_7;
              form.DELIVERY8_14 = siteSurvey.deliveryTimeFrame_8_To_14;
              form.DELIVERY15_30 = siteSurvey.deliveryTimeFrame_15_To_30;
              form.DELIVERY31 = siteSurvey.deliveryTimeFrame_Over_30;

              if ('Visitation Completed' === siteSurvey.siteVisitation) {
                $scope.surveyUser = siteSurvey.surveyPerformed;
                form.businessZone = siteSurvey.businessZone;
                form.businessLocationType = siteSurvey.merchantBusinessLocation;
                form.seasonalMerchant = siteSurvey.seasonalMerchant;
                form.buildingFloors = siteSurvey.totalFloors.toString();
                form.floorsOccupied = siteSurvey.floorOccupied.toString();

                var merchantsNameDisplayed = {};
                if (siteSurvey.merchantsNameDisplayed) {
                  var arr = siteSurvey.merchantsNameDisplayed.split(',');
                  for (var k = 0; k < arr.length; k++) {
                    merchantsNameDisplayed[arr[k]] = true;
                  }
                }
                form.merchantsNameDisplayed = merchantsNameDisplayed;
                form.squareFootage = siteSurvey.apartmentSquareFoot;
                form.ownOrRent = siteSurvey.merchantsOwnBuildSpace;
                form.noOfRegisters = siteSurvey.totalRegister;
                form.businessLicenseDisplay = siteSurvey.licenceDisplayed;
                form.returnPolicy = siteSurvey.returnPolicy;
                form.returnPolicyCard = siteSurvey.separateRefundPolicy;
                form.customerDeposit = siteSurvey.customerDeposit;
                form.cardDeposit = siteSurvey.salesDeposit;
                form.orderRenewal = siteSurvey.autoRenew;

                if (form.ownOrRent === 'Rent') {
                  form.buildingSpace = new Date(siteSurvey.rentStartTime);
                  form.leaseExpiry = new Date(siteSurvey.leaseExpires);
                  form.landLordName = siteSurvey.landLordName;
                  form.landLordNumber = siteSurvey.landLordPhoneNumber;
                }
              } else {
                form.returnPolicy = siteSurvey.returnPolicy;
                form.returnPolicyCard = siteSurvey.separateRefundPolicy;
              }
            } else {
              form.ownOrRent === 'Own';
            }

            if (formData.address1) {
              form.business_address1 = formData.address1;
            }
            if (formData.address2) {
              form.business_address2 = formData.address2;
            }
            if (formData.zip) {
              form.business_address_zip = formData.zip;
            }
            if (formData.city) {
              form.business_address_city = formData.city;
            }
            if (formData.state) {
              form.business_address_state = formData.state;
            }

            if (formData.equipmentLocation) {
              form.products = [];
              for (var p = 0; p < formData.equipmentLocation.length; p++) {
                var equipmentId = formData.equipmentLocation[p].lineItemId;
                var idx = $scope.products.map(function(p) { return p.id; }).indexOf(equipmentId);
                if (idx !== -1) {
                  $scope.products[idx].location_num = i + 1;
                  form.products.push($scope.products[idx]);
                  if (formData.equipmentLocation[p].attributes) {
                    var configProduct = $scope.products[idx];
                    var attributes = formData.equipmentLocation[p].attributes;
                    configProduct.attributesReady = {};
                    for (var d = 0; d < attributes.length; d++) {
                      configProduct.attributesReady[attributes[d].attributeName] = {
                        attributeName: attributes[d].attributeName,
                        attributeValue: attributes[d].attributeValue,
                        attributeDomain: attributes[d].attributeDomain,
                      };
                    }
                  }
                }
              }
            }

            $timeout(function() {
              angular.element('[name=SITE_VISITATION]').trigger('change');
              angular.element('[name="FACE_TO_FACE"]').trigger('change');
              angular.element('[name="PHONE_OR_EMAIL"]').trigger('change');
              angular.element('[name="INTERNET_PAY"]').trigger('change');
              angular.element('[name=DELIVERY0_7]').trigger('change');
              angular.element('[name="DELIVERY8_14"]').trigger('change');
              angular.element('[name="DELIVERY15_30"]').trigger('change');
              angular.element('[name="DELIVERY31"]').trigger('change');
              angular.element('[name="rollupIndicator"]').trigger('change');
            }, 0);
          }
          for (var x = 0; x < $scope.num_locations_selected; x++) {
            var formDataMCC = $scope.globalFormData[x + 1];
            formDataMCC.mcccodes = formDataMCC.mcccodes ? formDataMCC.mcccodes : $scope.globalFormData[1].mcccodes;
            formDataMCC.mcc = formDataMCC.mcc ? formDataMCC.mcc : $scope.globalFormData[1].mcc;
            $scope.getMccTypes($scope.globalFormData[x + 1], function() {
              $timeout(function() {
                angular.element('[name=mcccodes]').trigger('change');
                angular.element('[name=mcctypes]').trigger('change');
              }, 0);
            });
          }

        });

      });

      $scope.fullNamePattern = (/^([a-zA-Z]{2,24})\s([a-zA-Z]{2,24})$/);
      $scope.emailPattern = (/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)?(\.(AERO|INT|GG|GH|GI|GL|GM|GN|GP|GQ|GR|GS|JOBS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|MIL|ID|IE|IL|IM|IN|IO|IQ|IR|IS|IT|MOBI|JE|JM|JO|JP|KE|KG|KH|KI|KM|KN|MUSEUM|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|NAME|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|NET|MG|MH|MK|ML|MM|MN|MO|MP|MQ|MR|ORG|MS|MT|MU|MV|MW|MX|MY|MZ|NA|NC|PRO|NE|NF|NG|NI|NL|NO|NP|NR|NU|NZ|TEL|OM|PA|PE|PF|PG|PH|PK|PL|PM|PN|ASIA|TRAVEL|PR|PS|PT|PW|PY|QA|RE|RO|RS|RU|AC|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|AD|SK|SL|SM|SN|SO|SR|ST|SU|SV|SY|AE|SZ|TC|TD|TF|TG|TH|TJ|TK|TL|TM|AF|TN|TO|TP|TR|TT|TV|TW|TZ|UA|UG|AG|UK|UM|US|UY|UZ|VA|VC|VE|VG|VI|AI|VN|VU|WF|WS|YE|YT|YU|ZA|ZM|AL|AM|AN|BIZ|AO|AQ|AR|AS|AT|AU|AW|AX|AZ|BA|CAT|BB|BD|BE|BF|BG|BH|BI|BJ|BM|BN|COM|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CC|COOP|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|EDU|CR|CU|CV|CX|CY|CZ|DE|DJ|DK|DM|GOV|DO|DZ|EC|EE|EG|ER|ES|ET|EU|FI|INFO|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|aero|int|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|jobs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|mil|id|ie|il|im|in|io|iq|ir|is|it|mobi|je|jm|jo|jp|ke|kg|kh|ki|km|kn|museum|kp|kr|kw|ky|kz|la|lb|lc|li|lk|name|lr|ls|lt|lu|lv|ly|ma|mc|md|me|net|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|org|ms|mt|mu|mv|mw|mx|my|mz|na|nc|pro|ne|nf|ng|ni|nl|no|np|nr|nu|nz|tel|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|asia|travel|pr|ps|pt|pw|py|qa|re|ro|rs|ru|ac|rw|sa|sb|sc|sd|se|sg|sh|si|sj|ad|sk|sl|sm|sn|so|sr|st|su|sv|sy|ae|sz|tc|td|tf|tg|th|tj|tk|tl|tm|af|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|ag|uk|um|us|uy|uz|va|vc|ve|vg|vi|ai|vn|vu|wf|ws|ye|yt|yu|za|zm|al|am|an|biz|ao|aq|ar|as|at|au|aw|ax|az|ba|cat|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|com|bo|br|bs|bt|bv|bw|by|bz|ca|cc|coop|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|edu|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|gov|do|dz|ec|ee|eg|er|es|et|eu|fi|info|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf))$/);
      $scope.phoneNumberPattern = (/^\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}$/);
      $scope.ssnPattern = (/^[0-9]{3}-[0-9]{2}-[0-9]{4}$/);
      $scope.streetAddressPattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
      $scope.apartmentPattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
      $scope.cityPattern = (/^[a-zA-Z\s]*$/);
      $scope.zipPattern = (/^[0-9]{5}$/);
      $scope.dbaNamePattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
      //$scope.dbaNamePattern = (/^[a-zA-Z0-9',\s]*$/);
      $scope.einPattern = (/^[0-9]{9}$/);
      $scope.routingNumberPattern = (/^[0-9]{9}$/);
      $scope.numberPattern = (/[0-9-()]*[1-9][0-9-()]*/);
      $scope.urlPattern = (/^((((http(s)?):\/\/)|([www\.]|[WWW\.]))?(?!\.)([a-zA-Z0-9\-]*)\.?([a-zA-Z0-9\-]*)\.(com|org|net|mil|edu|biz|info|us|cc|co|gov|COM|ORG|NET|MIL|EDU|BIZ|INFO|US|CC|CO|GOV)(\.[a-z]{1,3})?)((\/?[^?]*?)\?.*)?$/);
      $scope.amountPattern = (/^[0-9.,]+$/);
      $scope.today = new Date();
      $scope.thisYear = $scope.today.getFullYear();
      $scope.thisMonth = $scope.today.getMonth() + 1;
      $scope.titles = [];


      $timeout(function() {
        angular.forEach($scope.signupForm.$error, function(field, key) {
          angular.forEach(field, function(errorField) {
            if (errorField.$viewValue) {
              errorField.$setTouched();
            }
          })
        });
      }, 0);

      $scope.categoryName = $scope.categoryDetails.name;
      $scope.updateMap();

    };

    /**
     * remove product from this location
     * @method removeProduct
     * @param p
     * @param index
     */
    $scope.removeProduct = function(p, index) {
      p.location_num = null;
      $scope.formData.products.splice(index, 1);
    };

    /**
     * initialize equipment popup
     * @method initEquipment
     */
    $scope.initEquipment = function() {

      $scope.prodLoc = [];

      for (var i = 0; i < $scope.products.length; i++) {
        $scope.prodLoc[i] = $scope.products[i].location_num;
      }
    };

    /**
     * Get Website Flag
     * @method getWebsiteFlag
     */
    $scope.getWebsiteFlag = function() {
      var orderId = fdService.getOrderId();
      fdService.getOrderBusinessinformation(orderId).success(function(data, status, headers, config) {
          if (data.merchantInformation.length > 0 && data.merchantInformation[0].url) {
            $scope.isWebSiteAvailable = true;
          } else {
            $scope.isWebSiteAvailable = false;
          }
        })
        .error(function(data, status, headers, config) {
          $scope.isWebSiteAvailable = false;
        });
    };

    /**
     * save equipment info
     * @method saveEquipment
     */
    $scope.saveEquipment = function() {
      var i, k, p, n;
      for (i = 0; i < $scope.products.length; i++) {
        if ($scope.products[i].location_num != $scope.prodLoc[i]) {

          p = $scope.products[i].location_num ? $scope.products[i].location_num : $scope.prodLoc[i];
          n = $scope.prodLoc[i];

          k = $scope.globalFormData[p].products.indexOf($scope.products[i]);

          if (-1 !== k) {
            $scope.globalFormData[n].products.push($scope.products[i]);
            $scope.globalFormData[p].products.splice(k, 1);
          } else {
            $scope.globalFormData[n].products.push($scope.products[i]);
          }
          $scope.products[i].location_num = $scope.prodLoc[i];
        }

      }

    };

    /**
     * Check Checkbox
     * @method checkCheckbox
     */
    $scope.checkCheckbox = function() {
      $scope.merchantDisplayedArray = [];
      angular.forEach($scope.formData.merchantsNameDisplayed, function(value, key) {
        if (value == true) {
          $scope.merchantDisplayedArray.push(key);
        }
      });
      if ($scope.merchantDisplayedArray.length > 0) {
        $scope.merchantDisplayed = $scope.merchantDisplayedArray.toString();
      } else {
        $scope.merchantDisplayed = '';
      }
    };

    /**
     * Calculate Remaining Values
     * @method calcRemainingValues
     * @param {} input1
     * @param {} input2
     * @param {} input3
     */
    var calcRemainingValues = function(input1, input2, input3) {
      $scope.signupForm.PHONE_OR_EMAIL.$setValidity("total", isTotalValid());
      if ($scope.formData[input1]) {
        if (!$scope.isWebSiteAvailable) {
          $scope.formData.INTERNET_PAY = '0';
        }
        if (!$scope.formData[input2] && !$scope.formData[input3]) {
          if ($scope.formData[input1] == '100') {
            $scope.formData[input2] = '0';
            $scope.formData[input3] = '0';
            $timeout(function() {
              angular.element('[name=' + input2 + ']').trigger('change');
              angular.element('[name=' + input3 + ']').trigger('change');
            }, 1);
            return; //return if remaining 2 fields still empty
          }

        }
        if ($scope.formData[input2] && $scope.formData[input3]) { //Set form validity
          $scope.signupForm.PHONE_OR_EMAIL.$setValidity("total", isTotalValid());
          return;
        }
        if ($scope.formData[input2]) {
          $scope.formData[input3] = $scope.isWebSiteAvailable ? (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]))).toString() : '0';
          $scope.signupForm.PHONE_OR_EMAIL.$setValidity("total", isTotalValid());}
        if ($scope.formData[input3]) {
          $scope.formData[input2] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]))).toString();
          $scope.signupForm.PHONE_OR_EMAIL.$setValidity("total", isTotalValid());}
      } else {
        $scope.formData[input2] = undefined;
        $scope.formData[input3] = undefined;

      }
      $timeout(function() {
        angular.element('[name=' + input2 + ']').trigger('change');
        angular.element('[name=' + input3 + ']').trigger('change');
      }, 1);
    };

    /**
     * Description
     * @method isTotalValid
     * @return BinaryExpression
     */
    var isTotalValid = function() {
      var a = $scope.formData.FACE_TO_FACE ? parseInt($scope.formData.FACE_TO_FACE) : 0;
      var b = $scope.formData.PHONE_OR_EMAIL ? parseInt($scope.formData.PHONE_OR_EMAIL) : 0;
      var c = $scope.formData.INTERNET_PAY ? parseInt($scope.formData.INTERNET_PAY) : 0;
      return a + b + c === 100;
    };


    /**
     * Lookup Business Zip
     * @method lookupBusinessZip
     */
    $scope.lookupBusinessZip = function() {
      if (!$scope.formData.business_address_zip) {
        return;
      } else if ($scope.signupForm && $scope.formData.business_address_zip == '00000') {
        $scope.signupForm.business_address_zip.$setValidity("zipnotValid", false);
      } else if ($scope.signupForm) {
        $scope.signupForm.business_address_zip.$setValidity("zipnotValid", true);
      }

      fdService.lookupByZip($scope.formData.business_address_zip, function(city, state) {
        if (!city) {
          $scope.formData.business_address_city = "";
          $scope.formData.business_address_state = "";
          $timeout(function() {
            angular.element('[name=business_address_state]').trigger('change');
            angular.element('[name=business_address_city]').trigger('keyup');
          }, 0);
        }
        if (!state) {
          $scope.formData.business_address_city = "";
          $scope.formData.business_address_state = "";
          $timeout(function() {
            angular.element('[name=business_address_state]').trigger('change');
            angular.element('[name=business_address_city]').trigger('keyup');
          }, 0);
        } else {
          $scope.formData.business_address_city = city;
          $scope.formData.business_address_state = state;
          $timeout(function() {
            angular.element('[name=business_address_city]').trigger('keyup');
          }, 10);
          $timeout(function() {
            angular.element('[name=business_address_state]').trigger('change');
            // $scope.validateBusiness();
          }, 20);
        }

        $scope.updateMap();
      });
    };


    /**
     * update Google Map
     * @method updateMap
     */
    $scope.updateMap = function() {

      if ($scope.mapTO) {
        $timeout.cancel($scope.mapTO);
      }

      $scope.mapTO = $timeout(function() {

        if (!$scope.geocoder) {
          $scope.geocoder = new google.maps.Geocoder();
        }

        if (!$scope.map) {
          var mapOptions = {
            zoom: 14,
          };
          $scope.map = new google.maps.Map(document.getElementById('google-map-owner'), mapOptions);
        }

        var address = $scope.formData.business_address1 ? $scope.formData.business_address1 : '';
        address += ' ' + $scope.formData.business_address_city + ', ' + $scope.formData.business_address_state + ', ' + $scope.formData.business_address_zip;
        $scope.geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            $scope.map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
              map: $scope.map,
              position: results[0].geometry.location
            });
          }
        });
      }, 1000);
    };

    /**
     * Get Titles for Organozation Owners
     * @method getTitles
     * @return
     */
    $scope.getTitles = function() {
      if ($scope.signupForm.ORGANIZATION_TYPE.$valid) {
        $scope.titles = [];
        $scope.formData.title1 = '';
        var dataToSend = {"businessType": $scope.formData.ORGANIZATION_TYPE};
        fdService.getTitles(dataToSend)
          .success(function(response, status, headers, config) {
            if (!angular.isUndefined(response.titles)) {
              for (var i = 0; i < response.titles.length; i++) {
                $scope.titles.push(response.titles[i]);
              }
            }
          })
          .error(function(data, status, headers, config) {
            console.log('error');
          });
      }
    };

    /**
     * Check Date
     * @method checkDate
     * @param {Object} owner
     * @param {numeric} index
     */
    $scope.checkDate = function(owner, index) {
      if (!owner.dob_day || !owner.dob_month || !owner.dob_year) {
        return;
      }


      var dateValid = true;
      if ((owner.dob_month == 04 || owner.dob_month == 06 || owner.dob_month == 9 || owner.dob_month == 11) && (owner.dob_day >= 31))
        dateValid = false;
      if (owner.dob_month == 02) {
        if (owner.dob_year % 4 != 0) {
          if (owner.dob_day > 28)
            dateValid = false;
        }
        if (owner.dob_year % 4 == 0) {
          if (owner.dob_day > 29)
            dateValid = false;
        }
      }

      var calculateAge = new Date(owner.dob_year, owner.dob_month - 1, owner.dob_day);
      var ageDifMs = Date.now() - calculateAge.getTime();
      var ageDate = new Date(ageDifMs);
      var age = Math.abs(ageDate.getUTCFullYear() - 1970);
      isAgeInsufficient = false;
      if (age < 18) {
        isAgeInsufficient = true;
      } else {
        isAgeInsufficient = false;
      }

      if (dateValid && !isAgeInsufficient) {
        $scope.signupForm['dob_month_' + index].$setValidity('date_format', true);
      } else {
        $scope.signupForm['dob_month_' + index].$setValidity('date_format', false);
      }

      owner.dob = owner.dob_year + '-' + owner.dob_month + '-' + owner.dob_day;

    };

    /**
     * percent owned field's on blur event
     * @method percentBlurred
     * @param owner
     * @param index
     */
    $scope.percentBlurred = function(owner, index) {

      var totalPercent = 0;

      for (var i = 0; i < $scope.formData.owners.length; i++) {
        totalPercent += parseInt($scope.formData.owners[i].percent_owned);
      }

      // Set valid
      $scope.signupForm['percentOwned_0'].$setValidity('percent_more_100', true);
      if ($scope.signupForm['percentOwned_1']) {
        $scope.signupForm['percentOwned_1'].$setValidity('percent_more_100', true);
      }
      if ($scope.signupForm['percentOwned_2']) {
        $scope.signupForm['percentOwned_2'].$setValidity('percent_more_100', true);
      }

      if (totalPercent > 100) {
        $scope.signupForm['percentOwned_0'].$setValidity('percent_more_100', false);
        if ($scope.signupForm['percentOwned_1']) {
          $scope.signupForm['percentOwned_1'].$setValidity('percent_more_100', false);
        }
        if ($scope.signupForm['percentOwned_2']) {
          $scope.signupForm['percentOwned_2'].$setValidity('percent_more_100', false);
        }
      } else if (totalPercent < 100) {
        if ($scope.formData.owners.length >= 3) {
          return;
        }

        if ($scope.formData.owners.length == index + 1) {
          $scope.formData.owners.push({});
        }

      }
    };

    /**
     * Goto Anchor
     * @method gotoAnchor
     * @param {string} anchor
     * @return
     */
    $scope.gotoAnchor = function(anc) {
      $timeout(function() {
        $anchorScroll.yOffset = 50;
        $anchorScroll(anc);
        $anchorScroll.yOffset = 0;
      });
    };

    /**
     * change active location's number
     * @method changeNumber
     * @param {number} n
     */
    $scope.changeNumber = function(n) {
      if (!$scope.signupForm.$valid) {
        $scope.form_error = true;
        $scope.gotoAnchor('form-error');
        angular.forEach($scope.signupForm.$error, function(field) {
          angular.forEach(field, function(errorField) {
            errorField.$setTouched();
          })
        });
        return;
      } else {
        $scope.form_error = false;
      }

      if (!$scope.formData.products.length) {
        return;
      }



      $scope.current_number = n;
      $scope.formData = $scope.globalFormData[$scope.current_number];
      $scope.gotoAnchor('signup-content');

      $timeout(function() {
        angular.forEach($scope.signupForm.$error, function(field) {
          angular.forEach(field, function(errorField) {
            errorField.$setUntouched();
          })
        });

        $('input').trigger('keyup');
        $('select').trigger('change');

      });
    };

    /**
     * show / hide second bank account info
     * @method toggleBankAccount
     */
    $scope.toggleBankAccount = function() {
      $scope.formData.isSecondBankSelected = !$scope.formData.isSecondBankSelected;
      if (!$scope.formData.isSecondBankSelected) {
        $scope.formData.ROUTING_NUMBER_SECOND = '';
        $scope.formData.ACCOUNT_NUMBER_SECOND = '';
        $scope.formData.ACCOUNT_NUMBER_SECOND_confirm = '';
        angular.forEach(CONST.FSPFUNDTYPES, function(value, key) {
          $scope.formData.bankInformation[value] = '0';
        });
      }
    };

    /**
     * Check Account
     * @method checkAccount
     * @return
     */
    $scope.checkAccount = function() {
      if ($scope.formData.isSecondBankSelected) {
        if ($scope.formData.ROUTING_NUMBER == $scope.formData.ROUTING_NUMBER_SECOND) {
          if ($scope.formData.ACCOUNT_NUMBER == $scope.formData.ACCOUNT_NUMBER_SECOND) {
            $scope.signupForm.ACCOUNT_NUMBER_SECOND.$setValidity('accountError', false);
          } else {
            $scope.signupForm.ACCOUNT_NUMBER_SECOND.$setValidity('accountError', true);
          }
        } else {
          $scope.signupForm.ACCOUNT_NUMBER_SECOND.$setValidity('accountError', true);
        }
      }
    };

    /**
     * Check Bank
     * @method checkBank
     */
    $scope.checkBank = function() {
      if ($scope.signupForm.ROUTING_NUMBER.$valid) {
        $scope.bankCheck = true;
        var routingNumber = {
          "routingNumber": $scope.formData.ROUTING_NUMBER
        };
        fdService.getBankName(routingNumber).success(function(response, status, headers, config) {
          $scope.bankCheck = false;
          $scope.bankError = false;
          $scope.bankErrorCount = 0;
          if (response.status.success == 'true') {
            $scope.formData.bankName = (response.data == null ? '' : response.data.bankName);
          } else {
            $scope.formData.bankName = "";
          }
        }).error(function(data, status, headers, config) {
          $scope.formData.bankName = "";
          if (status == 400) {
            $scope.bankCheck = true;
            $scope.bankError = true;
            $scope.bankErrorServerFails = false;
          } else {
            $scope.bankErrorCount++;
            $scope.bankError = false;
            if ($scope.bankErrorCount >= 3) {
              $scope.bankCheck = false;
              $scope.bankErrorServerFails = false;
            } else {
              $scope.bankCheck = true;
              $scope.bankErrorServerFails = true;
            }
          }
        });
      }
    };

    /**
     * Check Second Bank
     * @method CheckSecondBank
     * @return
     */
    $scope.CheckSecondBank = function() {
      if ($scope.signupForm.ROUTING_NUMBER_SECOND.$valid) {
        $scope.bankCheck_second = true;
        var routingNumber = {
          "routingNumber": $scope.formData.ROUTING_NUMBER_SECOND
        };
        fdService.getBankName(routingNumber).success(function(response, status, headers, config) {
          $scope.bankCheck_second = false;
          $scope.bankError_second = false;
          $scope.bankErrorCount_second = 0;
          if (response.status.success == 'true') {
            $scope.formData.bankName_second = (response.data == null ? '' : response.data.bankName);
          } else {
            $scope.formData.bankName_second = "";
          }
        }).error(function(data, status, headers, config) {
          $scope.formData.bankName_second = "";
          if (status == 400) {
            $scope.bankCheck_second = true;
            $scope.bankError_second = true;
            $scope.bankErrorServerFails_second = false;
          } else {
            $scope.bankErrorCount_second++;
            $scope.bankError_second = false;
            if ($scope.bankErrorCount_second >= 3) {
              $scope.bankCheck_second = false;
              $scope.bankErrorServerFails_second = false;
            } else {
              $scope.bankCheck_second = true;
              $scope.bankErrorServerFails_second = true;
            }
          }
        });
      }
    };


    /**
     * Face To Face Change
     * @method faceToFaceChange
     * @param {} tag
     * @return
     */
    $scope.faceToFaceChange = function(tag) {
      $scope.signupForm.PHONE_OR_EMAIL.$setValidity("total", false);
      if (tag == 0) {
        if ($scope.formData.FACE_TO_FACE)
          calcRemainingValues('FACE_TO_FACE', 'PHONE_OR_EMAIL', 'INTERNET_PAY');
      } else if (tag == 1) {
        if ($scope.formData.PHONE_OR_EMAIL)
          calcRemainingValues('PHONE_OR_EMAIL', 'FACE_TO_FACE', 'INTERNET_PAY');
      }
      //Added tag=2 else condition for INTERNET_PAY logic handling
      else if (tag == 2) {
        if ($scope.formData.INTERNET_PAY)
          calcRemainingValues('INTERNET_PAY', 'FACE_TO_FACE', 'PHONE_OR_EMAIL');
      }
    };

    /**
     * Description
     * @method deliveryTotal
     * @return BinaryExpression
     */
    var deliveryTotal = function() {
      var a = $scope.formData.DELIVERY0_7 ? parseInt($scope.formData.DELIVERY0_7) : 0;
      var b = $scope.formData.DELIVERY8_14 ? parseInt($scope.formData.DELIVERY8_14) : 0;
      var c = $scope.formData.DELIVERY15_30 ? parseInt($scope.formData.DELIVERY15_30) : 0;
      var d = $scope.formData.DELIVERY31 ? parseInt($scope.formData.DELIVERY31) : 0;
      return a + b + c + d === 100
    }

    /**
     * Calculate Delivery Values
     * @method calcDeliveryValues
     * @param {} input1
     * @param {} input2
     * @param {} input3
     * @param {} input4
     */
    var calcDeliveryValues = function(input1, input2, input3, input4) {
      $scope.signupForm.DELIVERY31.$setValidity("total", deliveryTotal());
      //$scope.signupForm.DELIVERY31.$setValidity("total", true);
      if ($scope.formData[input1]) {

        if (!$scope.formData[input2] && !$scope.formData[input3] && !$scope.formData[input4]) {
          if ($scope.formData[input1] == '100') {
            $scope.formData[input2] = '0';
            $scope.formData[input3] = '0';
            $scope.formData[input4] = '0';
            $timeout(function() {
              angular.element('[name=' + input2 + ']').trigger('change');
              angular.element('[name=' + input3 + ']').trigger('change');
              angular.element('[name=' + input4 + ']').trigger('change');
            }, 1);
            return; //return if remaining 3 fields still empty
          }

        }
        //return if remaining 3 fields still empty
        if ($scope.formData[input2] && $scope.formData[input3] && $scope.formData[input4]) { //Set form validity if total not equal to 100
          $scope.signupForm.DELIVERY31.$setValidity("total", deliveryTotal());
          return;
        }
        if ($scope.formData[input2]) {
          if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) === 100)) {
            $scope.formData[input3] = '0';
            $scope.formData[input4] = '0';
            $timeout(function() {
              angular.element('[name=' + input3 + ']').trigger('change');
              angular.element('[name=' + input4 + ']').trigger('change');
            }, 1);
          }
          if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) > 100)) {
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
            return;
          }
          if ($scope.formData[input3]) {
            if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input3]) > 100)) {
              $scope.signupForm.DELIVERY31.$setValidity("total", false);
              return;
            }
            $scope.formData[input4] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input3]))).toString();
          }
          if ($scope.formData[input4]) {
            if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input4]) > 100)) {
              $scope.signupForm.DELIVERY31.$setValidity("total", false);
              return;
            }
            $scope.formData[input3] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input4]))).toString();
          }
        }
        if ($scope.formData[input3]) {
          if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) === 100)) {
            $scope.formData[input2] = '0';
            $scope.formData[input4] = '0';
            $timeout(function() {
              angular.element('[name=' + input2 + ']').trigger('change');
              angular.element('[name=' + input4 + ']').trigger('change');
            }, 1);
          }
          if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) > 100)) {
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
            return;
          }
          if ($scope.formData[input2]) {
            if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input3]) > 100)) {
              $scope.signupForm.DELIVERY31.$setValidity("total", false);
              return;
            }
            $scope.formData[input4] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input3]))).toString();
          }
          if ($scope.formData[input4]) {
            if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) + parseInt($scope.formData[input4]) > 100)) {
              $scope.signupForm.DELIVERY31.$setValidity("total", false);
              return;
            }
            $scope.formData[input2] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) + parseInt($scope.formData[input4]))).toString();
          }
        }
        if ($scope.formData[input4]) {
          if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input4]) === 100)) {
            $scope.formData[input2] = '0';
            $scope.formData[input3] = '0';
            $timeout(function() {
              angular.element('[name=' + input2 + ']').trigger('change');
              angular.element('[name=' + input3 + ']').trigger('change');
            }, 1);
          }
          if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input4]) > 100)) {
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
            return;
          }
          if ($scope.formData[input2]) {
            if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input4]) > 100)) {
              $scope.signupForm.DELIVERY31.$setValidity("total", false);
              return;
            }
            $scope.formData[input3] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input4]))).toString();
          }
          if ($scope.formData[input3]) {
            if ((parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) + parseInt($scope.formData[input4]) > 100)) {
              $scope.signupForm.DELIVERY31.$setValidity("total", deliveryTotal());
              return;
            }
            $scope.formData[input2] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) + parseInt($scope.formData[input4]))).toString();
          }
        }
      } else {
        $scope.formData[input2] = undefined;
        $scope.formData[input3] = undefined;
        $scope.formData[input4] = undefined;
      }
      $scope.signupForm.DELIVERY31.$setValidity("total", deliveryTotal());
      $timeout(function() {
        angular.element('[name=' + input2 + ']').trigger('change');
        angular.element('[name=' + input3 + ']').trigger('change');
        angular.element('[name=' + input4 + ']').trigger('change');
      }, 1);
    }

    /**
     * Change Delivery Time Frame
     * @method changeDeliveryTimeFrame
     * @param {} tag
     * @return
     */
    $scope.changeDeliveryTimeFrame = function(tag) {
      if (!($scope.categoryDetails.name == 'ECOMMERCE' || $scope.categoryDetails.name == 'MOTO' || $scope.formData.FACE_TO_FACE < 100)) {
        if (($scope.formData.DELIVERY0_7 && $scope.formData.DELIVERY8_14 && $scope.formData.DELIVERY15_30) || ($scope.formData.DELIVERY8_14 && $scope.formData.DELIVERY15_30 && $scope.formData.DELIVERY31) || ($scope.formData.DELIVERY0_7 && $scope.formData.DELIVERY15_30 && $scope.formData.DELIVERY31) || ($scope.formData.DELIVERY0_7 && $scope.formData.DELIVERY8_14 && $scope.formData.DELIVERY31)) {
          $scope.signupForm.DELIVERY31.$setValidity("total", false);
        }
      }
      if (tag == 0) {
        if ($scope.formData.DELIVERY0_7)
          calcDeliveryValues('DELIVERY0_7', 'DELIVERY8_14', 'DELIVERY15_30', 'DELIVERY31');
      } else if (tag == 1) {
        if ($scope.formData.DELIVERY8_14)
          calcDeliveryValues('DELIVERY8_14', 'DELIVERY0_7', 'DELIVERY15_30', 'DELIVERY31');
      } else if (tag == 2) {
        if ($scope.formData.DELIVERY15_30)
          calcDeliveryValues('DELIVERY15_30', 'DELIVERY0_7', 'DELIVERY8_14', 'DELIVERY31');
      } else if (tag == 3) {
        if ($scope.formData.DELIVERY31)
          calcDeliveryValues('DELIVERY31', 'DELIVERY0_7', 'DELIVERY8_14', 'DELIVERY15_30');
      }
    };

    /**
     * Init Configure Product popup
     * @method configureProduct
     * @param p
     */
    $scope.configureProduct = function(p) {

      $scope.activeProduct = p;

      p.attributeDataDefault = null;
      var orderId = fdService.getOrderId();

      fdService.getProductAttributes(orderId, p.id).success(function(data, status, headers, config) {

        p.attributeDataDefault = data.attributesMap;
        p.lineItemId = data.lineItemId;
        p.configurableLineItemId = data.configurableLineItemId;

        var i, k;
        for (i in p.attributeDataDefault) {

          p.attributeDataDefault[i].value = '';

          for (k = 0; k < p.attributeDataDefault[i].attributeValues.length; k++) {
            if (p.attributeDataDefault[i].attributeValues[k].default) {
              p.attributeDataDefault[i].value = p.attributeDataDefault[i].attributeValues[k].attributeValue;
            }
          }

          if (p.attributesReady) {
            p.attributeDataDefault[i].value = p.attributesReady[i].attributeValue;
          }
        }
      });
    };

    /**
     * save configured product
     * @method saveConfigureProduct
     * @param {Object} p product
     */
    $scope.saveConfigureProduct = function(p) {

      p.attributesReady = {};
      for (i in p.attributeDataDefault) {
        p.attributesReady[i] = {
          attributeName: i,
          attributeValue: p.attributeDataDefault[i].value,
          attributeDomain: p.attributeDataDefault[i].attributeDomain,
        };
      }

    };

    /**
     * Description
     * @method getMccTypes
     * @param {Object} formData
     * @param {} callback
     * @return
     */
    $scope.getMccTypes = function(formData, callback) {
      formData.mccTypes = [];

      var ti = fdService.getTransactionInfo();

      fdService.getMccTypes($scope.categoryDetails.name, formData.mcccodes).success(function(data, status, headers, config) {
        formData.mccTypes = data;
        if (callback) {
          callback.apply(this, []);
        }
      });
    };

    /**
     * submit locations form
     * @method submitLocations
     */
    $scope.submitLocations = function() {

      if ($scope.clickedSubmit) {
        return;
      }

      if (!$scope.signupForm.$valid) {
        $scope.form_error = true;
        $scope.gotoAnchor('form-error');
        angular.forEach($scope.signupForm.$error, function(field) {
          angular.forEach(field, function(errorField) {
            errorField.$setTouched();
          })
        });
        return;
      }

      if (!$scope.formData.products.length) {
        return;
      }

      $scope.form_error = false;
      $scope.clickedSubmit = true;

      var data_to_send = {
        locationInformation: []
      };

      var siteSurvey = {}, equipmentLocation, bankInformation;

      for (var i in $scope.globalFormData) {

        siteSurvey = {};
        siteSurvey.siteVisitation = $scope.globalFormData[i].siteVisitation;
        siteSurvey.deliveryTimeFrame_0_To_7 = $scope.globalFormData[i].DELIVERY0_7;
        siteSurvey.deliveryTimeFrame_8_To_14 = $scope.globalFormData[i].DELIVERY8_14;
        siteSurvey.deliveryTimeFrame_15_To_30 = $scope.globalFormData[i].DELIVERY15_30;
        siteSurvey.deliveryTimeFrame_Over_30 = $scope.globalFormData[i].DELIVERY31;

        if ($scope.globalFormData[i].siteVisitation === 'Visitation Completed') {
          siteSurvey.surveyPerformed = $scope.surveyUser;
          siteSurvey.businessZone = $scope.globalFormData[i].businessZone;
          siteSurvey.merchantBusinessLocation = $scope.globalFormData[i].businessLocationType;
          siteSurvey.seasonalMerchant = $scope.globalFormData[i].seasonalMerchant;
          siteSurvey.totalFloors = $scope.globalFormData[i].buildingFloors;
          siteSurvey.floorOccupied = $scope.globalFormData[i].floorsOccupied;
          siteSurvey.merchantsNameDisplayed = $scope.merchantDisplayed;
          siteSurvey.apartmentSquareFoot = $scope.globalFormData[i].squareFootage;
          siteSurvey.merchantsOwnBuildSpace = $scope.globalFormData[i].ownOrRent;
          siteSurvey.totalRegister = $scope.globalFormData[i].noOfRegisters;
          siteSurvey.licenceDisplayed = $scope.globalFormData[i].businessLicenseDisplay;
          siteSurvey.returnPolicy = $scope.globalFormData[i].returnPolicy;
          siteSurvey.separateRefundPolicy = $scope.globalFormData[i].returnPolicyCard;
          siteSurvey.customerDeposit = $scope.globalFormData[i].customerDeposit;
          siteSurvey.salesDeposit = $scope.globalFormData[i].cardDeposit;
          siteSurvey.autoRenew = $scope.globalFormData[i].orderRenewal;

          if ($scope.globalFormData[i].ownOrRent === 'Rent') {
            siteSurvey.rentStartTime = $filter('date')($scope.globalFormData[i].buildingSpace, "MM/dd/yyyy");
            siteSurvey.leaseExpires = $filter('date')($scope.globalFormData[i].leaseExpiry, "MM/dd/yyyy");
            siteSurvey.landLordName = $scope.globalFormData[i].landLordName;
            siteSurvey.landLordPhoneNumber = $scope.globalFormData[i].landLordNumber;
          }
        } else {
          siteSurvey.returnPolicy = $scope.globalFormData[i].returnPolicy;
          siteSurvey.separateRefundPolicy = $scope.globalFormData[i].returnPolicyCard;
        }

        equipmentLocation = [];

        var attributes;

        for (var k = 0; k < $scope.globalFormData[i].products.length; k++) {
          attributes = [];
          for (j in $scope.globalFormData[i].products[k].attributesReady) {
            attributes.push($scope.globalFormData[i].products[k].attributesReady[j]);
          }

          equipmentLocation.push({
            lineItemId: $scope.globalFormData[i].products[k].id,
            configurableLineItemId: $scope.globalFormData[i].products[k].configurableLineItemId,
            attributes: attributes,
          });
        }

        bankInformation = [];

        var bankInfo = {
          "instName": $scope.globalFormData[i].bankName,
          'abaNumber': $scope.globalFormData[i].ROUTING_NUMBER,
          'accountNumber': $scope.globalFormData[i].ACCOUNT_NUMBER,
          'ordinal': 2
        };

        angular.forEach(CONST.FSPFUNDTYPES, function(value, key) {
          bankInfo[value] = $scope.globalFormData[i].bankInformation[value] == 0 ? 1 : 0;
        });

        bankInformation.push(bankInfo);

        if ($scope.globalFormData[i].isSecondBankSelected) {

          bankInfo = {
            "instName": $scope.globalFormData[i].bankName_second,
            'abaNumber': $scope.globalFormData[i].ROUTING_NUMBER_SECOND,
            'accountNumber': $scope.globalFormData[i].ACCOUNT_NUMBER_SECOND,
            'ordinal': 2
          };

          angular.forEach(CONST.FSPFUNDTYPES, function(value, key) {
            bankInfo[value] = $scope.globalFormData[i].bankInformation[value] == 1 ? 1 : 0;
          });
          bankInformation.push(bankInfo);
        }

        var ti = fdService.getTransactionInfo();

        data_to_send.locationInformation.push({
          dbaName: $scope.globalFormData[i].DBA_NAME,
          merchantId: $scope.globalFormData[i].merchantId ? $scope.globalFormData[i].merchantId : '',
          siteSurvey: siteSurvey,
          averageTicket: $scope.globalFormData[i].TYPICAL_SALE_AMOUNT,
          mccDescription: $scope.globalFormData[i].mcccodes,
          mcc: $scope.globalFormData[i].mcc,
          annualVolume: $scope.globalFormData[i].annualcardVolume,
          highestTicket: $scope.globalFormData[i].ANTICIPATED_HIGHEST_TICKET_SALE,
          isPrimaryLocation: i == 1,
          equipmentLocation: equipmentLocation,
          //bankInformation: bankInformation,
          faceToFace: $scope.globalFormData[i].FACE_TO_FACE,
          phoneOrEmail: $scope.globalFormData[i].PHONE_OR_EMAIL,
          internet: $scope.globalFormData[i].INTERNET_PAY,
          rollupIndicator: $scope.globalFormData[i].rollupIndicator,
          category: ti.category,
          address1: $scope.globalFormData[i].business_address1,
          address2: $scope.globalFormData[i].business_address2,
          city: $scope.globalFormData[i].business_address_city,
          state: $scope.globalFormData[i].business_address_state,
          zip: $scope.globalFormData[i].business_address_zip,
        });

        if ($scope.globalFormData[i].isPrimaryLocation || $scope.globalFormData[i].useSameBank != 'yes') {
          data_to_send.locationInformation[i - 1]['bankInformation'] = bankInformation;
        }

      }

      var orderId = fdService.getOrderId();

      fdService.postOrderLocations(data_to_send, orderId)
        .success(function(data, status, headers, config) {
          $scope.clickedSubmit = false;
          $location.path('/signup/setup');
        })
        .error(function(data, status, headers, config) {
          $scope.clickedSubmit = false;
        });
    };


    ///////////////// MAIN ////////////////////////////////
    _init();
    $(window).on('popstate', function() {
      angular.element('.modal-backdrop').removeClass('modal-backdrop');
      angular.element('body').css('overflow', 'auto');
    });
  }
]);;/**
 * Signup Owner Controller
 */
app.controller('SignupOwnerCtrl', ['$scope', '$rootScope', '$filter', '$location', 'fdService', '$timeout', '$anchorScroll', 'CONST',
  function($scope, $rootScope, $filter, $location, fdService, $timeout, $anchorScroll, CONST) {

    /**
     * Init function
     * @method _init
     */
    var _init = function() {
      $rootScope.body_id = 'full_body';
      $scope.showPassword = false;
      var orderId = fdService.getOrderId();
      var cart = fdService.getOrderedCart(orderId);
      if (!cart) {
        $location.path('/');
      }
      //set category details
      $scope.categoryDetails = {name: cart.data[Object.keys(cart.data)[0]].category};


      /* percentValues hold indices array for ng-options*/
      $scope.percentValues = (function() {
        var tempArr = [];
        for (var i = 0; i <= 20; i++)
          tempArr.push(i * 5);
        return tempArr;
      })();

      $scope.orgTypes = {
        I: "Sole Proprietorship",
        P: "Partnerships",
        C: "Public Corporation",
        L: "Limited Liability Company (LLC)",
        PRC: "Private Corporation",
        T: "Tax Exempt",
        G: "Government"
      };

      $scope.tinError = false;
      $scope.tinCount = 1;


      $scope.form_error = false;
      $scope.states_list = $rootScope.CONST.STATES;
      $scope.formData = {};
      $scope.formData.owners = [{}];

      $scope.hasEcommerce = false;
      for (var i = 0; i < cart.data.length; i++) {
        if (cart.data[i].category == 'ECOMMERCE') {
          $scope.hasEcommerce = true;
        }
      }

      if (!angular.isUndefined(cart.shippingAddress[0])) {

        if (!angular.isUndefined(cart.shippingAddress[0].address1)) {
          $scope.formData.business_address1 = (cart.shippingAddress[0].address1).substring(0, 24);
        }

        $scope.formData.business_address2 = cart.shippingAddress[0].address2;
        $scope.formData.business_address_zip = cart.shippingAddress[0].zip;
        $scope.formData.business_address_city = cart.shippingAddress[0].city;
        $scope.formData.business_address_state = cart.shippingAddress[0].state;

        if ($scope.formData.business_address_state) {
          for (i = 0; i < $scope.states_list.length; i++) {
            if ($scope.states_list[i].name.toLowerCase() == $scope.formData.business_address_state.toLowerCase()) {
              $scope.formData.business_address_state = $scope.states_list[i].abbr;
              break;
            }
          }
        }
        if (!$scope.formData.business_address_city || !$scope.formData.business_address_state) {
          $scope.lookupBusinessZip();
        }
        $scope.formData.businessPhone = cart.shippingAddress[0].phone;
        $scope.formData.owners[0].email = cart.shippingAddress[0].email;

        $scope.formData.statementDeliveryEmail = cart.shippingAddress[0].email;
        $scope.formData.statementDeliveryType = "Email";
        angular.forEach(CONST.FSPFUNDTYPES, function(value, key) {
          $scope.formData[value] = '0';
        });
        $scope.formData.owners[0].name = cart.shippingAddress[0].firstname + " " + cart.shippingAddress[0].lastname;
        $scope.formData.legal_business_name = cart.shippingAddress[0].company_name;
        angular.element('#LEGAL_BUSINESS_NAME_SAME_AS_DBA').focus().parent().addClass('focused');

      }

      if (fdService.getTransactionInfo().annualVolume) {
        $scope.formData.annualVolume = fdService.getTransactionInfo().annualVolume;
      }
      if (fdService.getTransactionInfo().averageTicket) {
        $scope.formData.TYPICAL_SALE_AMOUNT = fdService.getTransactionInfo().averageTicket;
      }
      if (fdService.getTransactionInfo().highestTicket) {
        $scope.formData.ANTICIPATED_HIGHEST_TICKET_SALE = fdService.getTransactionInfo().highestTicket;
      }

      fdService.getOrderBusinessinformation(orderId).success(function(data, status, headers, config) {

        $scope.orderBusinessInfo = data.merchantInformation[0];
        var formData = $scope.orderBusinessInfo;
        if (formData.legalName) {
          $scope.formData.legal_business_name = formData.legalName;
        }
        if (formData.yearsInBusiness) {
          var date = new Date(formData.yearsInBusiness);
          $scope.formData.YEAR_BUSINESS_STARTED = date.getFullYear().toString();
          $scope.formData.MONTH_BUSINESS_STARTED = ("0" + (date.getMonth() + 1)).slice(-2);
        }
        if (formData.organizationType) {
          var orgType;
          angular.forEach($scope.orgTypes, function(value, key) {
            if (formData.organizationType == value) {
              orgType = key;
            }
          });
          $scope.formData.ORGANIZATION_TYPE = orgType;
        }
        if (formData.taxFilingName) {
          $scope.formData.tax_filing_name = formData.taxFilingName;
          $scope.formData.TAX_FILING_NAME_SAME_AS_BUSINESS_LEGAL_NAME = (formData.taxFilingName == formData.legalName) ? '1' : '0';
        }
        if (formData.tinType) {
          $scope.formData.HOW_BUSINESS_FILES_TAXES = formData.tinType.toString();
        }
        if (formData.url) {
          $scope.formData.BUSINESS_WEBSITE = formData.url;
          $scope.formData.have_website = 'yes';
          $scope.formData.have_business_online = 'yes';
        } else {
          if ($scope.hasEcommerce) {
            $scope.formData.have_website = 'yes';
            $scope.formData.have_business_online = 'yes';
          } else {
            $scope.formData.have_business_online = 'no';
          }
        }
        if (formData.foreignEntityOption) {
          $scope.formData.FOREIGN_OWNERSHIP = formData.foreignEntityOption;
        }
        if (formData.stateOfIncorporation) {
          $scope.formData.INCORPORATION_STATE = formData.stateOfIncorporation;
        }

        $scope.ownerInformation = data.ownerInformation;
        for (var i = 0; i < $scope.ownerInformation.length; i++) {
          var ownerInfo = $scope.ownerInformation[i];
          $scope.formData.owners[i] = {};
          $scope.formData.owners[i].name = ownerInfo.firstName + ' ' + ownerInfo.lastName;
          $scope.formData.owners[i].SocialSecurityNumber = ownerInfo.ssn;

          if (ownerInfo.dateofBirth) {
            var date = new Date(ownerInfo.dateofBirth);
            $scope.formData.owners[i].dob_day = ("0" + date.getDate()).slice(-2);
            $scope.formData.owners[i].dob_month = ("0" + (date.getMonth() + 1)).slice(-2);
            $scope.formData.owners[i].dob_year = date.getFullYear().toString();
          }

          $scope.formData.owners[i].title1 = ownerInfo.title;
          $scope.formData.owners[i].percent_owned = ownerInfo.percentOwned;
          $scope.formData.owners[i].Address1 = ownerInfo.contactInformation.address1;
          $scope.formData.owners[i].Address2 = ownerInfo.contactInformation.address2;
          $scope.formData.owners[i].city = ownerInfo.contactInformation.city;
          $scope.formData.owners[i].state = ownerInfo.contactInformation.state;
          $scope.formData.owners[i].zip = ownerInfo.contactInformation.postalCode;
          if ($scope.formData.owners[i].zip) {
            $scope.lookupZip();
          }
          $scope.formData.owners[i].phone = ownerInfo.contactInformation.phone;
          $scope.formData.owners[i].email = ownerInfo.contactInformation.email;
          $scope.formData.owners[i].employeeId = ownerInfo.employeeId;
          $scope.validateBusiness(i);
        }

        $timeout(function() {
          angular.forEach($scope.signupForm.$error, function(field, key) {
            angular.forEach(field, function(errorField) {
              if (errorField.$viewValue) {
                errorField.$setTouched();
              }
            })
          });
          //$scope.getTitles('init');
        }, 0);
        $timeout(function() {
          angular.element('[name=legal_business_name]').trigger('keyup');
          angular.element('[name=YEAR_BUSINESS_STARTED]').trigger('change');
          angular.element('[name=MONTH_BUSINESS_STARTED]').trigger('change');
          angular.element('[name=ORGANIZATION_TYPE]').trigger('change');
          angular.element('[name=tax_filing_name]').trigger('change');
          angular.element('[name=TAX_FILING_NAME_SAME_AS_BUSINESS_LEGAL_NAME]').trigger('change');
          angular.element('[name=HOW_BUSINESS_FILES_TAXES]').trigger('change');
          angular.element('[name=BUSINESS_WEBSITE]').trigger('change');
          angular.element('[name=have_website]').trigger('change');
          angular.element('[name=have_business_online]').trigger('change');
          angular.element('[name=FOREIGN_OWNERSHIP]').trigger('change');
          angular.element('[name=INCORPORATION_STATE]').trigger('change');
          for (var i = 0; i < $scope.ownerInformation.length; i++) {
            angular.element('[name=name_' + i + ']').trigger('keyup');
            angular.element('[name=phone_' + i + ']').trigger('keyup');
            angular.element('[name=dob_month_' + i + ']').trigger('change');
            angular.element('[name=dob_day_' + i + ']').trigger('change');
            angular.element('[name=dob_year_' + i + ']').trigger('change');
            angular.element('[name=email_' + i + ']').trigger('keyup');
            angular.element('[name=Address1_' + i + ']').trigger('keyup');
            angular.element('[name=Address2_' + i + ']').trigger('keyup');
            angular.element('[name=zip_' + i + ']').trigger('keyup');
            angular.element('[name=city_' + i + ']').trigger('keyup');
            angular.element('[name=state_' + i + ']').trigger('keyup');
            angular.element('[name=percentOwned_' + i + ']').trigger('keyup');
          }
        }, 0);
      });

      $scope.fullNamePattern = (/^([a-zA-Z]{2,24})\s([a-zA-Z]{2,24})$/);
      $scope.emailPattern = (/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)?(\.(AERO|INT|GG|GH|GI|GL|GM|GN|GP|GQ|GR|GS|JOBS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|MIL|ID|IE|IL|IM|IN|IO|IQ|IR|IS|IT|MOBI|JE|JM|JO|JP|KE|KG|KH|KI|KM|KN|MUSEUM|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|NAME|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|NET|MG|MH|MK|ML|MM|MN|MO|MP|MQ|MR|ORG|MS|MT|MU|MV|MW|MX|MY|MZ|NA|NC|PRO|NE|NF|NG|NI|NL|NO|NP|NR|NU|NZ|TEL|OM|PA|PE|PF|PG|PH|PK|PL|PM|PN|ASIA|TRAVEL|PR|PS|PT|PW|PY|QA|RE|RO|RS|RU|AC|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|AD|SK|SL|SM|SN|SO|SR|ST|SU|SV|SY|AE|SZ|TC|TD|TF|TG|TH|TJ|TK|TL|TM|AF|TN|TO|TP|TR|TT|TV|TW|TZ|UA|UG|AG|UK|UM|US|UY|UZ|VA|VC|VE|VG|VI|AI|VN|VU|WF|WS|YE|YT|YU|ZA|ZM|AL|AM|AN|BIZ|AO|AQ|AR|AS|AT|AU|AW|AX|AZ|BA|CAT|BB|BD|BE|BF|BG|BH|BI|BJ|BM|BN|COM|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CC|COOP|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|EDU|CR|CU|CV|CX|CY|CZ|DE|DJ|DK|DM|GOV|DO|DZ|EC|EE|EG|ER|ES|ET|EU|FI|INFO|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|aero|int|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|jobs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|mil|id|ie|il|im|in|io|iq|ir|is|it|mobi|je|jm|jo|jp|ke|kg|kh|ki|km|kn|museum|kp|kr|kw|ky|kz|la|lb|lc|li|lk|name|lr|ls|lt|lu|lv|ly|ma|mc|md|me|net|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|org|ms|mt|mu|mv|mw|mx|my|mz|na|nc|pro|ne|nf|ng|ni|nl|no|np|nr|nu|nz|tel|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|asia|travel|pr|ps|pt|pw|py|qa|re|ro|rs|ru|ac|rw|sa|sb|sc|sd|se|sg|sh|si|sj|ad|sk|sl|sm|sn|so|sr|st|su|sv|sy|ae|sz|tc|td|tf|tg|th|tj|tk|tl|tm|af|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|ag|uk|um|us|uy|uz|va|vc|ve|vg|vi|ai|vn|vu|wf|ws|ye|yt|yu|za|zm|al|am|an|biz|ao|aq|ar|as|at|au|aw|ax|az|ba|cat|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|com|bo|br|bs|bt|bv|bw|by|bz|ca|cc|coop|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|edu|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|gov|do|dz|ec|ee|eg|er|es|et|eu|fi|info|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf))$/);
      $scope.phoneNumberPattern = (/^\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}$/);
      $scope.ssnPattern = (/^[0-9]{3}-[0-9]{2}-[0-9]{4}$/);
      $scope.streetAddressPattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
      $scope.apartmentPattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
      $scope.cityPattern = (/^[a-zA-Z\s]*$/);
      $scope.zipPattern = (/^[0-9]{5}$/);
      $scope.dbaNamePattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
      //$scope.dbaNamePattern = (/^[a-zA-Z0-9',\s]*$/);
      $scope.einPattern = (/^[0-9]{9}$/);
      $scope.routingNumberPattern = (/^[0-9]{9}$/);
      $scope.numberPattern = (/^[0-9]*$/);
      $scope.urlPattern = (/^((((http(s)?):\/\/)|([www\.]|[WWW\.]))?(?!\.)([a-zA-Z0-9\-]*)\.?([a-zA-Z0-9\-]*)\.(com|org|net|mil|edu|biz|info|us|cc|co|gov|COM|ORG|NET|MIL|EDU|BIZ|INFO|US|CC|CO|GOV)(\.[a-z]{1,3})?)((\/?[^?]*?)\?.*)?$/);
      $scope.today = new Date();
      $scope.thisYear = $scope.today.getFullYear();
      $scope.thisMonth = $scope.today.getMonth() + 1;
      $scope.titles = ["Owner", "Partner", "President", "Vice President", "Member LLC", "Secretary", "Treasurer", "CEO", "CFO", "COO"];

      $scope.categoryName = $scope.categoryDetails.name;
      $scope.updateMap();
    };


    /**
     * Validate Business
     * @method validateBusiness
     * @param {number} index
     */
    $scope.validateBusiness = function(index) {

      if (!($scope.formData.owners[index].email && $scope.formData.owners[index].Address1 && $scope.formData.owners[index].zip)) {
        return;
      }
      var dataToValidate = {};
      dataToValidate.merInfo = {};
      dataToValidate.merInfo.contacts = {};
      dataToValidate.merInfo.contacts.contactInfo = [];
      dataToValidate.merInfo.contacts.contactInfo.push({
        "compName": $scope.formData.legal_business_name,
        "address1": $scope.formData.owners[index].Address1,
        "address2": $scope.formData.owners[index].Address2,
        "city": $scope.formData.owners[index].city,
        "state": $scope.formData.owners[index].state,
        "country": 'USA',
        "zipCode": $scope.formData.owners[index].zip,
        "email": $scope.formData.owners[index].email,
        "type": "CORPORATE"
      });

      fdService.validateContact(dataToValidate)
        .success(function(response, status, headers, config) {
          if (response.length != 0) {
            for (var i = 0; i < response.length; i++) {
              if (response[i].errorCode == 8104) {
                $scope.signupForm['email_' + index].$setValidity("emailnotValid", false);
              }
            }
          } else {
            $scope.signupForm['email_' + index].$setValidity("emailnotValid", true);
          }
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

    };

    /**
     * Check SSN is valid or not
     * @method checkSsn
     * @param {} index
     */
    $scope.checkSsn = function(index) {
      fdService.getInvalidSsn()
        .success(function(data, status, headers, config) {
          $scope.excludedSsn = data;
          for (var i = 0; i < $scope.excludedSsn.length; i++) {
            if ($scope.formData.owners[index].SocialSecurityNumber == $scope.excludedSsn[i].ssnInvalidNo) {
              $scope.signupForm['SocialSecurityNumber_' + index].$setValidity("excluded", false);
              return;
            } else {
              $scope.signupForm['SocialSecurityNumber_' + index].$setValidity("excluded", true);
            }
          }
          return;
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

    };

    /**
     * Check EIN is valid or not
     * @method checkEin
     */
    $scope.checkEin = function() {
      fdService.getInvalidSsn()
        .success(function(data, status, headers, config) {
          $scope.excludedSsn = data;
          for (var i = 0; i < $scope.excludedSsn.length; i++) {
            if ($scope.formData.EIN == $scope.excludedSsn[i].ssnInvalidNo) {
              $scope.signupForm.EIN.$setValidity("excluded", false);
              return;
            } else {
              $scope.signupForm.EIN.$setValidity("excluded", true);
            }
          }
          return;
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

    };



    /**
     * Check Business Started Month
     * @method checkBsnMo
     */
    $scope.checkBsnMo = function() {
      if ($scope.formData.YEAR_BUSINESS_STARTED == $scope.thisYear && $scope.formData.MONTH_BUSINESS_STARTED > $scope.thisMonth) {
        $scope.signupForm.MONTH_BUSINESS_STARTED.$setValidity("excluded", false);
      } else {
        $scope.signupForm.MONTH_BUSINESS_STARTED.$setValidity("excluded", true);
      }
    };

    /**
     * Business Web Change
     * @method businessWebChange
     * @param tag
     */
    $scope.businessWebChange = function(tag) {
      if (tag == 1) {
        if ($scope.formData.have_business_online == 'no') {
          $scope.formData.have_website = '';
          $scope.formData.BUSINESS_WEBSITE = '';
        }
      } else if (tag == 2) {
        if ($scope.formData.have_website == 'no') {
          $scope.formData.BUSINESS_WEBSITE = '';
        }
      }
    };

    /**
     * Lookup Zip
     * @method lookupZip
     * @param {object} owner
     * @param {number} index
     */
    $scope.lookupZip = function(owner, index) {
      if (!owner || !owner.zip) {
        return;
      } else if (owner.zip == '00000') {
        $scope.signupForm['zip_' + index].$setValidity("zipnotValid", false);
      } else {
        $scope.signupForm['zip_' + index].$setValidity("zipnotValid", true);
      }

      fdService.lookupByZip(owner.zip, function(city, state) {
        if (!city) {
          owner.city = "";
          owner.state = "";
          $timeout(function() {
            angular.element('[name=state_' + index + ']').trigger('change');
            angular.element('[name=city_' + index + ']').trigger('keyup');
          }, 0);
        }
        if (!state) {
          owner.city = "";
          owner.state = "";
          $timeout(function() {
            angular.element('[name=state_' + index + ']').trigger('change');
            angular.element('[name=city_' + index + ']').trigger('keyup');
            angular.element('[name=city_' + index + ']').trigger('keyup');
          }, 0);
        } else {
          owner.city = city;
          owner.state = state;
          $timeout(function() {
            angular.element('[name=state_' + index + ']').trigger('change');
            angular.element('[name=city_' + index + ']').trigger('keyup');
            $scope.validateBusiness(index);
          });
        }
      });
    };

    /**
     * Lookup Business Zip
     * @method lookupBusinessZip
     * @return
     */
    $scope.lookupBusinessZip = function() {
      if (!$scope.formData.business_address_zip) {
        return;
      } else if ($scope.signupForm && $scope.formData.business_address_zip == '00000') {
        $scope.signupForm.business_address_zip.$setValidity("zipnotValid", false);
      } else if ($scope.signupForm) {
        $scope.signupForm.business_address_zip.$setValidity("zipnotValid", true);
      }

      fdService.lookupByZip($scope.formData.business_address_zip, function(city, state) {
        if (!city) {
          $scope.formData.business_address_city = "";
          $scope.formData.business_address_state = "";
          $timeout(function() {
            angular.element('[name=business_address_state]').trigger('change');
            angular.element('[name=business_address_city]').trigger('keyup');
          }, 0);
        }
        if (!state) {
          $scope.formData.business_address_city = "";
          $scope.formData.business_address_state = "";
          $timeout(function() {
            angular.element('[name=business_address_state]').trigger('change');
            angular.element('[name=business_address_city]').trigger('keyup');
          }, 0);
        } else {
          $scope.formData.business_address_city = city;
          $scope.formData.business_address_state = state;
          $timeout(function() {
            angular.element('[name=business_address_city]').trigger('keyup');
          }, 10);
          $timeout(function() {
            angular.element('[name=business_address_state]').trigger('change');
          }, 20);
        }

        $scope.updateMap();
      });
    };

    /**
     * update Google Map
     * @method updateMap
     */
    $scope.updateMap = function() {

      if ($scope.mapTO) {
        $timeout.cancel($scope.mapTO);
      }

      $scope.mapTO = $timeout(function() {

        if (!$scope.geocoder) {
          $scope.geocoder = new google.maps.Geocoder();
        }

        if (!$scope.map) {
          var mapOptions = {
            zoom: 14,
          };
          $scope.map = new google.maps.Map(document.getElementById('google-map-owner'), mapOptions);
        }

        var address = $scope.formData.business_address1 + ', ' + $scope.formData.business_address_city + ', ' + $scope.formData.business_address_state + ', ' + $scope.formData.business_address_zip;
        $scope.geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            $scope.map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
              map: $scope.map,
              position: results[0].geometry.location
            });
          }
        });
      }, 1000);
    };

    /**
     * Description
     * @method getTitles
     * @param {String} type
     * @return
     */
    $scope.getTitles = function(type) {
      if ($scope.signupForm.ORGANIZATION_TYPE.$valid) {
        $scope.titles = [];
        $scope.formData.title1 = '';

        if ($scope.formData.ORGANIZATION_TYPE == 'I') {
          $scope.formData.owners[0].percent_owned = 100;
          $scope.formData.owners.splice(1);
          $timeout(function() {
            angular.element('[name=percentOwned_0]').trigger('keyup');
          }, 0);
        }

        var dataToSend = {"businessType": $scope.formData.ORGANIZATION_TYPE};
        fdService.getTitles(dataToSend)
          .success(function(response, status, headers, config) {
            if (!angular.isUndefined(response.titles)) {
              for (var i = 0; i < response.titles.length; i++) {
                $scope.titles.push(response.titles[i]);
              }
            }
            $scope.percentBlurred({}, 1);
            if (type != 'init') {
              for (var i = 0; i < $scope.formData.owners.length; i++) {
                $scope.formData.owners[i].title1 = '';
              }
            }
            $timeout(function() {
              for (var i = 0; i < $scope.ownerInformation.length; i++) {
                angular.element('[name=title1_' + i + ']').trigger('change');
              }
            }, 0);
          })
          .error(function(data, status, headers, config) {
            console.log('error');
          });
      }
    };

    /**
     * Check Date
     * @method checkDate
     * @param {Object} owner
     * @param {numeric} index
     * @return
     */
    $scope.checkDate = function(owner, index) {
      if (!owner.dob_day || !owner.dob_month || !owner.dob_year) {
        return;
      }


      var dateValid = true;
      if ((owner.dob_month == 04 || owner.dob_month == 06 || owner.dob_month == 9 || owner.dob_month == 11) && (owner.dob_day >= 31))
        dateValid = false;
      if (owner.dob_month == 02) {
        if (owner.dob_year % 4 != 0) {
          if (owner.dob_day > 28)
            dateValid = false;
        }
        if (owner.dob_year % 4 == 0) {
          if (owner.dob_day > 29)
            dateValid = false;
        }
      }

      var calculateAge = new Date(owner.dob_year, owner.dob_month - 1, owner.dob_day);
      var ageDifMs = Date.now() - calculateAge.getTime();
      var ageDate = new Date(ageDifMs);
      var age = Math.abs(ageDate.getUTCFullYear() - 1970);
      isAgeInsufficient = false;
      if (age < 18) {
        isAgeInsufficient = true;
      } else {
        isAgeInsufficient = false;
      }

      if (dateValid && !isAgeInsufficient) {
        $scope.signupForm['dob_month_' + index].$setValidity('date_format', true);
      } else {
        $scope.signupForm['dob_month_' + index].$setValidity('date_format', false);
      }

      owner.dob = owner.dob_year + '-' + owner.dob_month + '-' + owner.dob_day;

    };

    /**
     * percent owned field's on blur event
     * @method percentBlurred
     * @param {object} owner
     * @param {number} index
     * @param {boolean} isRemoving
     */
    $scope.percentBlurred = function(owner, index, isRemoving) {

      var totalPercent = 0;
      var isTotal100AtIndex;
      $scope.isTotal100 = false;

      for (var i = 0; i < $scope.formData.owners.length; i++) {
        totalPercent += parseInt($scope.formData.owners[i].percent_owned);
        if (totalPercent == 100) {
          isTotal100AtIndex = i;
          $scope.isTotal100 = true;
        }
      }

      // Set valid
      $scope.percentOwnedValidity('percent_more_100', true);
      $scope.percentOwnedValidity('percent_total_100', true);
      $scope.percentOwnedValidity('percent_sole_total_100', true);

      if ($scope.formData.ORGANIZATION_TYPE == 'I' && totalPercent != 100) {
        $scope.percentOwnedValidity('percent_sole_total_100', false);
      } else if ($scope.formData.ORGANIZATION_TYPE == 'P' && totalPercent != 100) {

        if (isTotal100AtIndex >= 0) {
          $scope.formData.owners.splice(isTotal100AtIndex + 1, $scope.formData.owners.length - isTotal100AtIndex);
          return;
        }
        if (totalPercent < 100) {
          if ($scope.formData.owners.length >= 4) {
            $scope.percentOwnedValidity('percent_total_100', false);
            return;
          }
          if (!isRemoving && $scope.formData.owners.length == index + 1) {
            $scope.formData.owners.push({});
            $scope.formData.owners[$scope.formData.owners.length - 1].percent_owned = 100 - totalPercent;
            $scope.isTotal100 = true;
          } else {
            $scope.percentOwnedValidity('percent_total_100', false);
          }
        } else if (totalPercent > 100) {
          $scope.percentOwnedValidity('percent_total_100', false);
        }
      } else if (totalPercent > 100) {
        $scope.percentOwnedValidity('percent_more_100', false);
      }
    };

    /**
     * Percent Owned Validity
     * @method percentOwnedValidity
     * @param {String} errorType
     * @param {boolean} errorValidity
     * @return
     */
    $scope.percentOwnedValidity = function(errorType, errorValidity) {
      $scope.signupForm['percentOwned_0'].$setValidity(errorType, errorValidity);
      if ($scope.signupForm['percentOwned_1']) {
        $scope.signupForm['percentOwned_1'].$setValidity(errorType, errorValidity);
      }
      if ($scope.signupForm['percentOwned_2']) {
        $scope.signupForm['percentOwned_2'].$setValidity(errorType, errorValidity);
      }
      if ($scope.signupForm['percentOwned_3']) {
        $scope.signupForm['percentOwned_3'].$setValidity(errorType, errorValidity);
      }
    }

    /**
     * Description
     * @method addOwner
     */
    $scope.addOwner = function() {
      if ($scope.formData.owners.length < 4) {
        $scope.formData.owners.push({});
      }
    };

    /**
     * remove owner
     * @method removeOwner
     * @param {number} index
     */
    $scope.removeOwner = function(index) {
      $scope.formData.owners.splice(index, 1);
      $scope.percentBlurred({}, index, true);
    };

    /**
     * Goto Anchor
     * @method gotoAnchor
     * @param {string} anchor
     */
    $scope.gotoAnchor = function(anc) {
      $timeout(function() {
        $anchorScroll.yOffset = 50;
        $anchorScroll(anc);
        $anchorScroll.yOffset = 0;
      });
    };

    /**
     * submit owner info
     * @method submitOwnerInfo
     */
    $scope.submitOwnerInfo = function() {
      if (!$scope.signupForm.$valid) {
        $scope.form_error = true;
        $scope.gotoAnchor('form-error');
        angular.forEach($scope.signupForm.$error, function(field) {
          angular.forEach(field, function(errorField) {
            errorField.$setTouched();
          })
        });
        return;
      }

      $scope.form_error = false;
      $scope.clickedSubmit = true;
      $scope.tinError = false;

      var data = {
        "requestHeader": {
          "appName": "FDMP",
          "appId": "FD Marketplace"
        },
        "tinInfo": {
          "taxId": $scope.formData.HOW_BUSINESS_FILES_TAXES == '1' ? $scope.formData.owners[0].SocialSecurityNumber : $scope.formData.EIN,
          "filingName": $scope.formData.TAX_FILING_NAME_SAME_AS_BUSINESS_LEGAL_NAME == '1' ? $scope.formData.legal_business_name : $scope.formData.tax_filing_name,
          "requester": "FDMP"
        }
      };

      fdService.checkTin(data)
        .success(function(data, status, headers, config) {
          if (data.responseCode == '0000' || $scope.tinCount >= 2) {
            $scope.submitSignupForm(data.requestedGuid);
          } else {
            $scope.tinCount++;
            $scope.tinError = true;
            $scope.clickedSubmit = false;
            $anchorScroll();
          }
        })
        .error(function(data, status, headers, config) {
          if ($scope.tinCount >= 2) {
            $scope.submitSignupForm("");
          } else {
            $scope.tinCount++;
            $scope.tinError = true;
            $scope.clickedSubmit = false;
            $anchorScroll();
          }
        });

    };

    /**
     * submit Signup Form
     * @method submitSignupForm
     * @param {} requestedGuid
     * @return
     */
    $scope.submitSignupForm = function(requestedGuid) {
      var orderId = fdService.getOrderId();

      var dataToSend = {};

      dataToSend.ownerInformation = [];


      var secuenceNo = 1;
      for (var i = 0; i < $scope.formData.owners.length; i++) {

        if (!$scope.formData.owners[i].dob) {
          $scope.formData.owners[i].dob = $scope.formData.owners[i].dob_year + '-' + $scope.formData.owners[i].dob_month + '-' + $scope.formData.owners[i].dob_day;
        }

        dataToSend.ownerInformation.push({
          sequenceNo: secuenceNo,
          firstName: $scope.formData.owners[i].name.split(" ")[0],
          lastName: $scope.formData.owners[i].name.split(" ")[1],
          ssn: $scope.formData.owners[i].SocialSecurityNumber,
          dateofBirth: $scope.formData.owners[i].dob,
          title: $scope.formData.owners[i].title1,
          percentOwned: $scope.formData.owners[i].percent_owned,
          employeeId : $scope.formData.owners[i].employeeId,
          driverLicenceNo: $scope.formData.owners[i].DriverLicenseNo,
          dlStateIssued: $scope.formData.owners[i].DriverLicenseState,
          dlExpirationMonth: $scope.formData.owners[i].DriverLicenseMonth,
          dlExpirationYear: $scope.formData.owners[i].DriverLicenseYear,
          contactInformation: {
              contactType: "OWNER",
              address1: $scope.formData.owners[i].Address1,
              address2: $scope.formData.owners[i].Address2,
              city: $scope.formData.owners[i].city,
              state: $scope.formData.owners[i].state,
              postalCode: $scope.formData.owners[i].zip,
              country: "US",
              phone: $scope.formData.owners[i].phone,
              email: $scope.formData.owners[i].email,
          }
        });
        secuenceNo++;
      }
      if ($scope.formData.ORGANIZATION_TYPE == 'G' && $scope.formData.FOREIGN_OWNERSHIP == 'N') {
        $scope.formData.FOREIGN_OWNERSHIP = 'G';
      }
      if ($scope.formData.ORGANIZATION_TYPE == 'T' && $scope.formData.FOREIGN_OWNERSHIP == 'N') {
        $scope.formData.FOREIGN_OWNERSHIP = 'D';
      }

      dataToSend.merchantInformation = [{
        sequenceNo: secuenceNo,
        category: fdService.getCategoryFromSession().name,
        legalName: $scope.formData.legal_business_name,
        taxId: $scope.formData.HOW_BUSINESS_FILES_TAXES == '1' ? $scope.formData.owners[0].SocialSecurityNumber : $scope.formData.EIN,
        yearsInBusiness: $scope.formData.YEAR_BUSINESS_STARTED + '-' + $scope.formData.MONTH_BUSINESS_STARTED + '-01',
        organizationType: $scope.orgTypes[$scope.formData.ORGANIZATION_TYPE],
        stateOfIncorporation: $scope.formData.INCORPORATION_STATE,
        taxFilingName: $scope.formData.TAX_FILING_NAME_SAME_AS_BUSINESS_LEGAL_NAME == '1' ? $scope.formData.legal_business_name : $scope.formData.tax_filing_name,
        foreignEntityOption: $scope.formData.FOREIGN_OWNERSHIP,
        tinRequestedGuid: requestedGuid,
        tinType: $scope.formData.HOW_BUSINESS_FILES_TAXES,
        url: $scope.formData.BUSINESS_WEBSITE,
        contactInformation: [{
          contactType: "CORPORATE",
          address1: $scope.formData.business_address1,
          address2: $scope.formData.business_address2,
          city: $scope.formData.business_address_city,
          state: $scope.formData.business_address_state,
          postalCode: $scope.formData.business_address_zip,
          country: "US",
          phone: $scope.formData.businessPhone,
        }]
      }];

      fdService.postBusinessinformation(dataToSend, orderId)
        .success(function(data, status, headers, config) {
          $scope.clickedSubmit = false;
          $location.path('/signup/location');
        })
        .error(function(data, status, headers, config) {
          $scope.clickedSubmit = false;
        });
    };

    ///////////////// MAIN ////////////////////////////////
    _init();
  }
]);;/**
 * Signup Setup Controller
 */
app.controller('SignupSetupCtrl', ['$scope', '$rootScope', '$filter', '$location', 'fdService', '$timeout', '$anchorScroll', 'CONST',
  function($scope, $rootScope, $filter, $location, fdService, $timeout, $anchorScroll, CONST) {

    /**
     * Init function
     * @method _init
     */
    var _init = function() {
      $rootScope.body_id = 'full_body';

      $scope.clickedSubmit = false;

      $scope.emailPattern = (/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)?(\.(AERO|INT|GG|GH|GI|GL|GM|GN|GP|GQ|GR|GS|JOBS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|MIL|ID|IE|IL|IM|IN|IO|IQ|IR|IS|IT|MOBI|JE|JM|JO|JP|KE|KG|KH|KI|KM|KN|MUSEUM|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|NAME|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|NET|MG|MH|MK|ML|MM|MN|MO|MP|MQ|MR|ORG|MS|MT|MU|MV|MW|MX|MY|MZ|NA|NC|PRO|NE|NF|NG|NI|NL|NO|NP|NR|NU|NZ|TEL|OM|PA|PE|PF|PG|PH|PK|PL|PM|PN|ASIA|TRAVEL|PR|PS|PT|PW|PY|QA|RE|RO|RS|RU|AC|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|AD|SK|SL|SM|SN|SO|SR|ST|SU|SV|SY|AE|SZ|TC|TD|TF|TG|TH|TJ|TK|TL|TM|AF|TN|TO|TP|TR|TT|TV|TW|TZ|UA|UG|AG|UK|UM|US|UY|UZ|VA|VC|VE|VG|VI|AI|VN|VU|WF|WS|YE|YT|YU|ZA|ZM|AL|AM|AN|BIZ|AO|AQ|AR|AS|AT|AU|AW|AX|AZ|BA|CAT|BB|BD|BE|BF|BG|BH|BI|BJ|BM|BN|COM|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CC|COOP|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|EDU|CR|CU|CV|CX|CY|CZ|DE|DJ|DK|DM|GOV|DO|DZ|EC|EE|EG|ER|ES|ET|EU|FI|INFO|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|aero|int|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|jobs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|mil|id|ie|il|im|in|io|iq|ir|is|it|mobi|je|jm|jo|jp|ke|kg|kh|ki|km|kn|museum|kp|kr|kw|ky|kz|la|lb|lc|li|lk|name|lr|ls|lt|lu|lv|ly|ma|mc|md|me|net|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|org|ms|mt|mu|mv|mw|mx|my|mz|na|nc|pro|ne|nf|ng|ni|nl|no|np|nr|nu|nz|tel|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|asia|travel|pr|ps|pt|pw|py|qa|re|ro|rs|ru|ac|rw|sa|sb|sc|sd|se|sg|sh|si|sj|ad|sk|sl|sm|sn|so|sr|st|su|sv|sy|ae|sz|tc|td|tf|tg|th|tj|tk|tl|tm|af|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|ag|uk|um|us|uy|uz|va|vc|ve|vg|vi|ai|vn|vu|wf|ws|ye|yt|yu|za|zm|al|am|an|biz|ao|aq|ar|as|at|au|aw|ax|az|ba|cat|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|com|bo|br|bs|bt|bv|bw|by|bz|ca|cc|coop|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|edu|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|gov|do|dz|ec|ee|eg|er|es|et|eu|fi|info|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf))$/);
      $scope.phoneNumberPattern = (/^\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}$/);

      $timeout(function() {
        angular.forEach($scope.signupForm.$error, function(field, key) {
          angular.forEach(field, function(errorField) {
            if (errorField.$viewValue) {
              errorField.$setTouched();
            }
          })
        });
      }, 0);


      /*var dateFormat = "mm/dd/yy",

          from = $("#trainingContactDateFrom").datepicker({
            showAnim: "slideDown",
            defaultDate: "+2w",
            minDate: +14
          }),

          to = $("#trainingContactDateTo").datepicker({
            showAnim: "slideDown",
            defaultDate: "+2w 1d",
            minDate: "+2w 1d"
          });*/
      var orderId = fdService.getOrderId();
      var cart = fdService.getOrderedCart(orderId);
      if (!cart) {
        $location.path('/');
      }

      $scope.formData = {};
      $scope.states_list = $rootScope.CONST.STATES;
      if (cart.shippingAddress[0]) {

        if (!angular.isUndefined(cart.shippingAddress[0].address1)) {
          $scope.formData.trainingAddress1 = (cart.shippingAddress[0].address1).substring(0, 24);
        }

        $scope.formData.trainingAddress2 = cart.shippingAddress[0].address2;
        $scope.formData.trainingZip = cart.shippingAddress[0].zip;
        $scope.formData.trainingCity = cart.shippingAddress[0].city;
        $scope.formData.trainingState = cart.shippingAddress[0].state;

        if ($scope.formData.trainingState) {
          for (i = 0; i < $scope.states_list.length; i++) {
            if ($scope.states_list[i].name.toLowerCase() == $scope.formData.trainingState.toLowerCase()) {
              $scope.formData.trainingState = $scope.states_list[i].abbr;
              break;
            }
          }
        }
        if (!$scope.formData.trainingCity || !$scope.formData.trainingState) {
          $scope.lookupZip();
        }
        $scope.formData.trainingContactPhone = cart.shippingAddress[0].phone;
        $scope.formData.trainingContactName = cart.shippingAddress[0].first_name + " " + cart.shippingAddress[0].last_name;
        $scope.formData.statementDeliveryType = "Email";
        $scope.formData.statementType = "G";
        $scope.formData.statementDeliveryEmail = cart.shippingAddress[0].email;
        $scope.formData.electronic1099Email = "Yes";
        $scope.formData.chargebackAddress = "1";
        $scope.formData.chargebackDelivery = "Mail";
        $scope.formData.trainingProvider = "MAG";
        $scope.formData.preferredTrainingTime = '12:00PM-01:00PM';
        $scope.formData.thirdPartyProcessor = '00';
        $scope.formData.electronic1099 = "Yes";

      }

      $scope.orderId = fdService.getOrderId();
      fdService.getAccountPreferences($scope.orderId).success(function(data, status, headers, config) {
        if (Object.keys(data).length > 0) {
          $scope.formData.statementDeliveryType = data.statementDeliveryType;
          $scope.formData.statementType = data.statementType;
          $scope.formData.statementDeliveryEmail = data.statementEmailAddress;
          $scope.formData.electronic1099 = data.form1099Electronically;
          $scope.formData.electronic1099Email = data.form1099ToEmail;
          $scope.formData.emailAddressFor1099k = data.emailAddressFor1099k;
          $scope.formData.chargebackAddress = data.chargeBack;
          $scope.formData.chargebackDelivery = data.chargeBackDeliveryType;
          $scope.formData.trainingContactPhone = data.contactPhone;
          $scope.formData.faxNumber = data.fax;
          $scope.formData.trainingProvider = data.trainingProvider;
          $scope.formData.preferredTrainingTime = data.preferredTrainingFrom + '-' + data.preferredTrainingTo;
          $scope.formData.thirdPartyProcessor = data.thirdPartyProcessor;
          $scope.formData.thirdPartyProcessorName = data.thirdPartyProcessorName;
          $scope.formData.thirdPartyProcessorSoftware = data.thirdPartyProcessorSoftware;
        }
        $timeout(function() {
          angular.element('[name="trainingProvider"]').trigger('change');
          angular.element('[name="preferredTrainingTime"]').trigger('change');
        }, 0);
      });
    };


    /**
     * Lookup Zip
     * @method lookupZip
     */
    $scope.lookupZip = function() {
      if (!$scope.formData.trainingZip) {
        return;
      } else if ($scope.signupForm && $scope.formData.trainingZip == '00000') {
        $scope.signupForm.trainingZip.$setValidity("zipnotValid", false);
      } else if ($scope.signupForm) {
        $scope.signupForm.trainingZip.$setValidity("zipnotValid", true);
      }

      fdService.lookupByZip($scope.formData.trainingZip, function(city, state) {
        if (!city) {
          $scope.formData.trainingCity = "";
          $scope.formData.trainingState = "";
          $timeout(function() {
            angular.element('[name=trainingState]').trigger('change');
            angular.element('[name=trainingCity]').trigger('keyup');
          }, 0);
        }
        if (!state) {
          $scope.formData.trainingCity = "";
          $scope.formData.trainingState = "";
          $timeout(function() {
            angular.element('[name=trainingState]').trigger('change');
            angular.element('[name=trainingCity]').trigger('keyup');
          }, 0);
        } else {
          $scope.formData.trainingCity = city;
          $scope.formData.trainingState = state;
          $timeout(function() {
            angular.element('[name=trainingCity]').trigger('keyup');
          }, 10);
          $timeout(function() {
            angular.element('[name=trainingState]').trigger('change');
          }, 20);
        }

      });
    };



    /**
     * Validate Business
     * @method validateBusiness
     * @return
     */
    $scope.validateBusiness = function() {
      fdService.validateBusiness($scope.signupForm.statementDeliveryEmail, $scope.formData.statementDeliveryEmail);
    };

    /**
     * Goto Anchor
     * @method gotoAnchor
     * @param {string} anchor
     * @return
     */
    $scope.gotoAnchor = function(anc) {
      $timeout(function() {
        $anchorScroll.yOffset = 50;
        $anchorScroll(anc);
        $anchorScroll.yOffset = 0;
      });
    };

    /**
     * Description
     * @method getFormattedDate
     * @param {string} date
     * @return {string} mm/dd/yyyy
     */
    $scope.getFormattedDate = function(data) {
      var date = new Date(data);
      var day = ("0" + date.getUTCDate()).slice(-2);
      var month = ("0" + (date.getMonth() + 1)).slice(-2);
      var year = date.getFullYear().toString();
      return month + '/' + day + '/' + year;
    };

    /**
     * submit setup form
     * @method submitForm
     */
    $scope.submitForm = function() {

      if ($scope.clickedSubmit) {
        return;
      }

      if (!$scope.signupForm.$valid) {
        $scope.form_error = true;
        $scope.gotoAnchor('form-error');
        angular.forEach($scope.signupForm.$error, function(field) {
          angular.forEach(field, function(errorField) {
            errorField.$setTouched();
          })
        });
        return;
      }

      $scope.form_error = false;
      $scope.clickedSubmit = true;

      var advancedPreferences = {
        statementDeliveryType: $scope.formData.statementDeliveryType,
        statementType: $scope.formData.statementType,
        statementEmailAddress: $scope.formData.statementDeliveryEmail,
        form1099Electronically: $scope.formData.electronic1099,
        form1099ToEmail: $scope.formData.electronic1099Email,
        emailAddressFor1099k: $scope.formData.emailAddressFor1099k,
        chargeBack: $scope.formData.chargebackAddress,
        chargeBackDeliveryType: $scope.formData.chargebackDelivery,
        contactName: $scope.formData.trainingContactName,
        contactPhone: $scope.formData.trainingContactPhone,
        fax: $scope.formData.faxNumber,
        trainingProvider: $scope.formData.trainingProvider,
        preferredTrainingFrom: $scope.formData.preferredTrainingTime.split('-')[0],
        preferredTrainingTo: $scope.formData.preferredTrainingTime.split('-')[1],
        thirdPartyProcessor: $scope.formData.thirdPartyProcessor,
      };

      if ($scope.formData.thirdPartyProcessorName) {
        advancedPreferences.thirdPartyProcessorName = $scope.formData.thirdPartyProcessorName;
      }
      if ($scope.formData.thirdPartyProcessorSoftware) {
        advancedPreferences.thirdPartyProcessorSoftware = $scope.formData.thirdPartyProcessorSoftware;
      }

      var data_to_send = {
        advancedPreferences: advancedPreferences
      };
      var orderId = fdService.getOrderId();

      fdService.postAccountPreferences(data_to_send, orderId)
        .success(function(data, status, headers, config) {
          $scope.clickedSubmit = false;
          $location.path('/signup/terms');
        })
        .error(function(data, status, headers, config) {
          $scope.clickedSubmit = false;
        });
    };
    /**
     * Validate 1099k Email Address
     * @method validate1099kEmail
     * @return
     */
    $scope.validate1099kEmail = function() {
      fdService.validateBusiness($scope.signupForm.emailAddressFor1099k, $scope.formData.emailAddressFor1099k);
    };


    ///////////////// MAIN ////////////////////////////////
    _init();
  }
]);;/**
 * Terms and Conditions Controller
 */
app.controller('SignupTermsCtrl', ['$scope', '$rootScope', '$filter', '$location', 'fdService', '$document', '$timeout', '$anchorScroll', 'CONST', '$routeParams',
  function($scope, $rootScope, $filter, $location, fdService, $document, $timeout, $anchorScroll, CONST, $routeParams) {
    /**
     * Init function
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
            if (!data.Signatures[i].readOnly && !data.Signatures[i].signature)
              $scope.showSignatures = false;
          }
          $scope.totalSigns = $scope.signatures.length;
          $scope.componentsData = {};
          $scope.leaseData = {};
          $scope.fixedSectionsLength = 5;
          $scope.dynamicSectionsLength = 0;
          for (var j = 0; j < $scope.components.length; j++) {
            if ($scope.components[j].valueType == 'AGREEMENT') {
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
                  if ($scope.ownerID) {
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
          $scope.signatureRefs['CONFIRMATION'] = {};
          $scope.signatureRefs['CONFIRMATION'].sectionNum = $scope.fixedSectionsLength + $scope.dynamicSectionsLength + 1;
          if ($scope.ownerID) {
                    var ind = $scope.signs['CONFIRMATION'].map(function(s) { return s.ownerId; }).indexOf($scope.ownerID);
            $scope.signatureRefs['CONFIRMATION'].idx = $scope.signs['CONFIRMATION'][ind].idx;
          } else {
            $scope.signatureRefs['CONFIRMATION'].idx = $scope.signs['CONFIRMATION'][0].idx;
          }

          $scope.leaseSectionsLength = 0;
          for (var j = 0; j < $scope.components.length; j++) {
            if ($scope.components[j].valueType == 'MISC_AGREEMENT') {
              var section = $scope.components[j].label;
              $scope.leaseData[section] = $scope.components[j];
              $scope.leaseData[section].signs = $scope.signs[section];
              $scope.leaseSectionsLength++;
              if (section == 'LEASE') {
                $scope.leaseData[section].lease = data.Lease;
              } else if (section == 'CLOVER_SERVICES' || section == 'CLOVER_GO_SERVICES') {
                $scope.leaseData[section].cloverLease = data.CloverAgreement;
              }
              $scope.leaseData[section].sectionNum = $scope.fixedSectionsLength + $scope.dynamicSectionsLength + $scope.leaseSectionsLength + 1;
              if ($scope.signs[section]) {
                            var isOptionalSignSection = $scope.signs[section].map(function(s) { return s.optional; }).indexOf(false);
                if (isOptionalSignSection != -1) {
                  if (!$scope.signatureRefs[section])
                    $scope.signatureRefs[section] = {};
                  $scope.signatureRefs[section].sectionNum = $scope.leaseData[section].sectionNum;
                  if ($scope.ownerID) {
                                    var ind = $scope.signs[section].map(function(s) { return s.ownerId; }).indexOf($scope.ownerID);
                    $scope.signatureRefs[section].idx = $scope.signs[section][ind].idx;
                  } else {
                    $scope.signatureRefs[section].idx = $scope.signs[section][0].idx;
                  }
                }
              }
            }
          }

          if ($scope.ownerID) {
            $rootScope.thankyouPageFlag = $scope.getPendingSignaturesCount(data);
          }

          if (!$scope.showSignatures) {
            $rootScope.$emit('Agreement_Unsigned');
          }
        })
        .error(function(data, status, headers, config) {
          $location.path('/400');
        });
    };


    /**
     * Get Pending Signatures Count
     * @method getPendingSignaturesCount
     * @param {} data
     * @return remainingSigns
     */
    $scope.getPendingSignaturesCount = function(data) {
      $scope.signsStatus = {};
      var ownersTotalCount = 0;
      var ownersSignCount = 0;
      for (var i = 0; i < data.Signatures.length; i++) {
        var ownerId = data.Signatures[i].ownerId;
        if ($scope.signsStatus[ownerId])
          $scope.signsStatus[ownerId].push(data.Signatures[i].signature ? true : false);
        else {
          $scope.signsStatus[ownerId] = [data.Signatures[i].signature ? true : false];
          ownersTotalCount++;
        }
      }
      for (var ownersSign in $scope.signsStatus) {
        var ind = $scope.signsStatus[ownersSign].indexOf(false);
        if (ind == -1) {
          ownersSignCount++;
        }
      }
      var remainingSigns = ownersTotalCount - ownersSignCount;
      return remainingSigns == 1 ? false : true;
    };

    /**
     * Description
     * @method isSigned
     * @param {} id
     * @return LogicalExpression
     */
    $scope.isSigned = function(id) {
        return !$scope['signature' + id + 'Empty'] && $scope.signature_texts[id];
      };
      /**
       * Reset Canvas
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
    };

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
     * Goto Anchor
     * @method gotoAnchor
     * @param {} anchor
     */
    $scope.gotoAnchor = function(anc) {
      $timeout(function() {
        $anchorScroll(anc);
      });
    };

    /**
     * redirect to the url
     * @method goToUrl
     * @param url
     */
    $scope.goToUrl = function(url) {
      $location.path(url);
      angular.element('.modal-backdrop').removeClass('modal-backdrop');
      angular.element('body').css('overflow', 'auto');
    };

    /**
     * Description
     * @method showSignBox
     * @return LogicalExpression
     */
    $scope.showSignBox = function() {
      return $rootScope.logged_in && $rootScope.isTouch;
    };

    /**
     * Description
     * @method getSignDate
     * @param {} idx
     * @return MemberExpression
     */
    $scope.getSignDate = function(idx) {
      return $scope['signature' + idx + 'Date'];
    };

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
     * is Form Not Valid
     * @method isFormNotValid
     * @return {Boolean}
     */
    $scope.isFormNotValid = function() {
      for (var i = 0; i < $scope.totalSigns; i++) {
        if (!$scope.signatures[i].readOnly && $scope['signature' + (i + 1) + 'Empty'] && !$scope.signatures[i].optional)
          return true;
      }
      return false;
    };

    /**
     * check if terms form is valid
     * @method _isTermsFormNotValid
     * @return {Boolean}
     */
    $rootScope._isTermsFormNotValid = function() {
      return $scope.isFormNotValid();
    };

    /**
     * Can Mouse Up
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
     * @param {number} i
     */
    $scope.signTextChanged = function(i) {
      $scope.isSignInProg = true;
      if ($scope.toProm[i]) {
        $timeout.cancel($scope.toProm[i]);
      }
      $scope.toProm[i] = $timeout(function() {
        html2canvas(document.getElementById('type-signature-' + i), {

          /**
           * On Clone
           * @method onclone
           * @param {document} document
           * @return promise
           */
          onclone: function(document) {
            return $timeout(function() {
              var elements = document.getElementsByClassName('mpa-legal-copy');
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
     * Check for Canvas is Blank or not
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
     * Reset Canvas
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
    };

    /**
     * Get merchant signatures
     * @method getMerchantSignatures
     * @param {} orderStatus
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
     * submit Terms and Conditions
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
        if (!$scope.signatures[i].readOnly) {
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
      var orderId = fdService.getOrderId();
      var cart = fdService.getOrderedCart(orderId);
      if (cart.shippingAddress.length > 0) {
        var cd = cart.shippingAddress[0];
        var merchantName = cd.firstname + ' ' + cd.lastname;
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
      }

      fdService.submitSignature(sdata)
        .success(function(data, status, headers, config) {
          fdService.clearOrderId();
          fdService.clearCart();
          fdService.clearOrderedCart();
          fdService.clearCategoryFromSession();
          fdService.clearTransactionInfo();
          fdService.clearAcquiringPricing();
          fdService.clearEquipmentPricing();
          $rootScope.cart = fdService.getCart();
          $location.path('/thankyou');
        })
        .error(function(data, status, headers, config) {
          $scope.clickedTCSubmit = false;
          $location.path('/400');
        });
    };

    ///////////////// MAIN ////////////////////////////////


    _init();




  }
]);;/**
 * SignUp Controller
 */
app.controller('SignupCtrl', ['$scope', '$rootScope', '$filter', '$location', 'fdService','$timeout', '$anchorScroll', 'CONST',
    function ($scope, $rootScope, $filter, $location, fdService, $timeout, $anchorScroll, CONST) {

  /**
   * Init function
   * @private
   */
  var _init = function(){

    var orderId = fdService.getOrderId();
    var cart = fdService.getOrderedCart(orderId);

    $rootScope.body_id = 'signup';
    $rootScope.bodyClass = 'signup';
    $scope.tinError = false;
    $scope.tinCount = 1;
    $scope.bankErrorCount = 0;
    $scope.bankError = false;
    $scope.bankErrorServerFails=false;
    $scope.bankCheck = false;

    //set category details
    $scope.categoryDetails = fdService.getCategoryFromSession();
    $scope.categoryName = fdService.getCategoryFromSession().name;

    $scope.form_error = false;
    $scope.states_list = CONST.STATES;
    $scope.formData = {};
    $scope.formData.DBA_NAME = cart.shippingAddress.company_name;
    $scope.formData.business_address1 = cart.shippingAddress.address1;
    $scope.formData.business_address2 = cart.shippingAddress.address2;
    $scope.formData.business_address_zip = cart.shippingAddress.zip;
    $scope.formData.business_address_city = cart.shippingAddress.city;
    $scope.formData.business_address_state = cart.shippingAddress.state;
    $scope.formData.email = cart.shippingAddress.email;
    $scope.formData.businessPhone = cart.shippingAddress.phone;
    $scope.formData.name = cart.shippingAddress.name;

    if(!$scope.formData.business_address_city || !$scope.formData.business_address_state)
    {
      $scope.lookupBusinessZip();
    }

    angular.element('#LEGAL_BUSINESS_NAME_SAME_AS_DBA').focus().parent().addClass('focused');

    if(fdService.getTransactionInfo().annualVolume){
      $scope.formData.annualVolume = fdService.getTransactionInfo().annualVolume;
    }
    if(fdService.getTransactionInfo().averageTicket){
      $scope.formData.TYPICAL_SALE_AMOUNT = fdService.getTransactionInfo().averageTicket;
    }
    if(fdService.getTransactionInfo().highestTicket){
      $scope.formData.ANTICIPATED_HIGHEST_TICKET_SALE = fdService.getTransactionInfo().highestTicket;
    }
    $scope.mcc_codes = [];

    $scope.fullNamePattern = (/^([a-zA-Z]{2,24})+\s([a-zA-Z]{2,24})+$/);
    $scope.emailPattern = (/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)?(\.(AERO|INT|GG|GH|GI|GL|GM|GN|GP|GQ|GR|GS|JOBS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|MIL|ID|IE|IL|IM|IN|IO|IQ|IR|IS|IT|MOBI|JE|JM|JO|JP|KE|KG|KH|KI|KM|KN|MUSEUM|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|NAME|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|NET|MG|MH|MK|ML|MM|MN|MO|MP|MQ|MR|ORG|MS|MT|MU|MV|MW|MX|MY|MZ|NA|NC|PRO|NE|NF|NG|NI|NL|NO|NP|NR|NU|NZ|TEL|OM|PA|PE|PF|PG|PH|PK|PL|PM|PN|ASIA|TRAVEL|PR|PS|PT|PW|PY|QA|RE|RO|RS|RU|AC|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|AD|SK|SL|SM|SN|SO|SR|ST|SU|SV|SY|AE|SZ|TC|TD|TF|TG|TH|TJ|TK|TL|TM|AF|TN|TO|TP|TR|TT|TV|TW|TZ|UA|UG|AG|UK|UM|US|UY|UZ|VA|VC|VE|VG|VI|AI|VN|VU|WF|WS|YE|YT|YU|ZA|ZM|AL|AM|AN|BIZ|AO|AQ|AR|AS|AT|AU|AW|AX|AZ|BA|CAT|BB|BD|BE|BF|BG|BH|BI|BJ|BM|BN|COM|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CC|COOP|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|EDU|CR|CU|CV|CX|CY|CZ|DE|DJ|DK|DM|GOV|DO|DZ|EC|EE|EG|ER|ES|ET|EU|FI|INFO|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|aero|int|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|jobs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|mil|id|ie|il|im|in|io|iq|ir|is|it|mobi|je|jm|jo|jp|ke|kg|kh|ki|km|kn|museum|kp|kr|kw|ky|kz|la|lb|lc|li|lk|name|lr|ls|lt|lu|lv|ly|ma|mc|md|me|net|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|org|ms|mt|mu|mv|mw|mx|my|mz|na|nc|pro|ne|nf|ng|ni|nl|no|np|nr|nu|nz|tel|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|asia|travel|pr|ps|pt|pw|py|qa|re|ro|rs|ru|ac|rw|sa|sb|sc|sd|se|sg|sh|si|sj|ad|sk|sl|sm|sn|so|sr|st|su|sv|sy|ae|sz|tc|td|tf|tg|th|tj|tk|tl|tm|af|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|ag|uk|um|us|uy|uz|va|vc|ve|vg|vi|ai|vn|vu|wf|ws|ye|yt|yu|za|zm|al|am|an|biz|ao|aq|ar|as|at|au|aw|ax|az|ba|cat|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|com|bo|br|bs|bt|bv|bw|by|bz|ca|cc|coop|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|edu|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|gov|do|dz|ec|ee|eg|er|es|et|eu|fi|info|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf))$/);
    $scope.phoneNumberPattern = (/^\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}$/);
    $scope.ssnPattern = (/^[0-9]{3}-[0-9]{2}-[0-9]{4}$/);
    $scope.streetAddressPattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
    $scope.apartmentPattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
    $scope.cityPattern = (/^[a-zA-Z\s]*$/);
    $scope.zipPattern =(/^[0-9]{5}$/);
    $scope.dbaNamePattern = (/^[a-zA-Z0-9',\s][^{}|~]*$/);
    //$scope.dbaNamePattern = (/^[a-zA-Z0-9',\s]*$/);
    $scope.einPattern = (/^[0-9]{9}$/);
    $scope.routingNumberPattern = (/^[0-9]{9}$/);
    $scope.numberPattern = (/^[0-9]*$/);
    $scope.urlPattern = (/^((((http(s)?):\/\/)|([www\.]|[WWW\.]))?(?!\.)([a-zA-Z0-9\-]*)\.?([a-zA-Z0-9\-]*)\.(com|org|net|mil|edu|biz|info|us|cc|co|COM|ORG|NET|MIL|EDU|BIZ|INFO|US|CC|CO)(\.[a-z]{1,3})?)((\/?[^?]*?)\?.*)?$/);
    $scope.today = new Date();
    $scope.thisYear = $scope.today.getFullYear();
    $scope.thisMonth = $scope.today.getMonth() + 1;
    $scope.titles = ["Owner","Partner","President","Vice President","Member LLC","Secretary","Treasurer","CEO","CFO","COO"];

    $timeout(function() {
      angular.forEach($scope.signupForm.$error, function (field, key) {
        angular.forEach(field, function(errorField){
          if (errorField.$viewValue) {
            errorField.$setTouched();
          }
        })
      });

    }, 0);

    // Get MCC Codes
    fdService.getMccCodes()
      .success(function(data, status, headers, config) {
        $scope.mccCodes = data;
      })
      .error(function(data, status, headers, config) {
        console.log('error')
      });

    //Init percent values
    $scope.percentValues = (function() {
      var tempArr = [];
      for (var i = 0; i <= 100; i++){
        tempArr.push(i);
      }
      return tempArr;
    })();

  };

  /**
   * Check if total percentage is valid
   * @return {boolean}
   */
  var isTotalValid = function() {
    var a = parseInt($scope.formData.FACE_TO_FACE);
    var b = parseInt($scope.formData.PHONE_OR_EMAIL);
    var c = parseInt($scope.formData.INTERNET_PAY);
    return a + b + c === 100
  };

  /**
   * Calculate remain percent values
   * @param {number} input1
   * @param {number} input2
   * @param {number} input3
   */
  var calcRemainingValues =  function(input1, input2, input3) {
    if ($scope.formData[input1]) {
      if (!$scope.formData[input2] && !$scope.formData[input3]) return;//return if remaining 2 fields still empty
      if ($scope.formData[input2] && $scope.formData[input3]) {//Set form validity
        $scope.signupForm.PHONE_OR_EMAIL.$setValidity("total", isTotalValid());
        return;
      }
      if ($scope.formData[input2])
        $scope.formData[input3] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]))).toString();
      if ($scope.formData[input3])
        $scope.formData[input2] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]))).toString();
    } else {
      $scope.formData[input2] = undefined;
      $scope.formData[input3] = undefined;

    }
    $timeout(function() {
      angular.element('[name='+input2+']').trigger('change');
      angular.element('[name='+input3+']').trigger('change');
    }, 1);
  };

  /**
   * check if delivery total percent is 100
   * @return {boolean}
   */
  var deliveryTotal = function() {
    var a = parseInt($scope.formData.DELIVERY0_7);
    var b = parseInt($scope.formData.DELIVERY8_14);
    var c = parseInt($scope.formData.DELIVERY15_30);
    var d = parseInt($scope.formData.DELIVERY31);
    return a + b + c + d === 100
  };

  /**
   * Calculate delivery values
   * @param input1
   * @param input2
   * @param input3
   * @param input4
   */
  var calcDeliveryValues =  function(input1, input2, input3, input4) {
    if ($scope.formData[input1]) {
      if (!$scope.formData[input2] && !$scope.formData[input3] && !$scope.formData[input4]) return;//return if remaining 3 fields still empty
      if ($scope.formData[input2] && $scope.formData[input3] && $scope.formData[input4]) {//Set form validity if total not equal to 100
        $scope.signupForm.DELIVERY31.$setValidity("total", deliveryTotal());
        return;
      }
      if ($scope.formData[input2]) {
        if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) > 100)){
          $scope.signupForm.DELIVERY31.$setValidity("total", false);
          return;
        }
        if($scope.formData[input3]) {
          if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input3]) > 100)){
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
            return;
          }
          $scope.formData[input4] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input3]))).toString();
        }
        if($scope.formData[input4]){
          if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input4]) > 100)){
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
            return;
          }
          $scope.formData[input3] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input4]))).toString();
        }
      }
      if ($scope.formData[input3]) {
        if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) > 100)){
          $scope.signupForm.DELIVERY31.$setValidity("total", false);
          return;
        }
        if($scope.formData[input2]) {
          if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input3]) > 100)){
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
            return;
          }
          $scope.formData[input4] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input3]))).toString();
        }
        if($scope.formData[input4]){
          if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) + parseInt($scope.formData[input4]) > 100)){
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
            return;
          }
          $scope.formData[input2] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) + parseInt($scope.formData[input4]))).toString();
        }
      }
      if ($scope.formData[input4]) {
        if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input4]) > 100)){
          $scope.signupForm.DELIVERY31.$setValidity("total", false);
          return;
        }
        if($scope.formData[input2]) {
          if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input4]) > 100)){
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
            return;
          }
          $scope.formData[input3] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input2]) + parseInt($scope.formData[input4]))).toString();
        }
        if($scope.formData[input3]){
          if((parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) + parseInt($scope.formData[input4]) > 100)){
            $scope.signupForm.DELIVERY31.$setValidity("total", false);
            return;
          }
          $scope.formData[input2] = (100 - (parseInt($scope.formData[input1]) + parseInt($scope.formData[input3]) + parseInt($scope.formData[input4]))).toString();
        }
      }
    } else {
      $scope.formData[input2] = undefined;
      $scope.formData[input3] = undefined;
      $scope.formData[input4] = undefined;
    }
    $timeout(function() {
      angular.element('[name='+input2+']').trigger('change');
      angular.element('[name='+input3+']').trigger('change');
      angular.element('[name='+input4+']').trigger('change');
    }, 1);
  };

  /**
   * Scroll to anchor
   * @param anc
   */
  $scope.gotoAnchor = function(anc){
    $timeout(function() {
      $location.hash(anc);
      $anchorScroll();
    });
  };

  /**
   * Get city and state by zip code
   */
  $scope.lookupZip = function(){
    if (!$scope.formData.zip) {
      return;
    }

    fdService.lookupByZip($scope.formData.zip, function(city, state){
      if (!city) {
        $scope.formData.city = "";
        $scope.formData.state = "";
        $timeout(function() {
           angular.element('[name=state]').trigger('change');
           angular.element('[name=city]').trigger('keyup');
        }, 0);
      }
      if (!state) {
        $scope.formData.city = "";
        $scope.formData.state = "";
        $timeout(function() {
           angular.element('[name=state]').trigger('change');
           angular.element('[name=city]').trigger('keyup');
           angular.element('[name=city]').trigger('keyup');
        }, 0);
      }
      else{
          $scope.formData.city = city;
          $scope.formData.state = state;
          $timeout(function() {
             angular.element('[name=state]').trigger('change');
             angular.element('[name=city]').trigger('keyup');
          });
      }
    });
  };

  /**
   * get  city and state by business zip code
   */
  $scope.lookupBusinessZip = function(){
    if (!$scope.formData.business_address_zip) {
      return;
    }

    fdService.lookupByZip($scope.formData.business_address_zip, function(city, state){
      if (!city) {
        $scope.formData.business_address_city = "";
        $scope.formData.business_address_state = "";
        $timeout(function() {
           angular.element('[name=business_address_state]').trigger('change');
           angular.element('[name=business_address_city]').trigger('keyup');
        }, 0);
      }
      if (!state) {
        $scope.formData.business_address_city = "";
        $scope.formData.business_address_state = "";
        $timeout(function() {
           angular.element('[name=business_address_state]').trigger('change');
           angular.element('[name=business_address_city]').trigger('keyup');
        }, 0);
      }
      else{
          $scope.formData.business_address_city = city;
          $scope.formData.business_address_state = state;
         $timeout(function() {
           angular.element('[name=business_address_city]').trigger('keyup');
          },10);
         $timeout(function() {
            angular.element('[name=business_address_state]').trigger('change');
          },20);
      }
    });
  };

  /**
   * Submit signup form
   */
  $scope.formSubmit = function(){
    if($scope.formData.name){
        $scope.formData.firstName = $scope.formData.name.split(" ")[0];
        $scope.formData.lastName = $scope.formData.name.split(" ")[1];
    }
    if($scope.formData.LEGAL_BUSINESS_NAME_SAME_AS_DBA != '0'){
        $scope.formData.legal_business_name = $scope.formData.DBA_NAME;
    }
    if($scope.formData.TAX_FILING_NAME_SAME_AS_BUSINESS_LEGAL_NAME != '0'){
        $scope.formData.tax_filing_name = $scope.formData.legal_business_name;
    }
    if($scope.formData.HOW_BUSINESS_FILES_TAXES != 'business_tax_id'){
        $scope.formData.EIN = $scope.formData.SocialSecurityNumber;
    }
    if($scope.formData.ORGANIZATION_TYPE == 'G' && $scope.formData.FOREIGN_OWNERSHIP == 'N'){
        $scope.formData.FOREIGN_OWNERSHIP = 'G';
    }
    if($scope.formData.ORGANIZATION_TYPE == 'T' && $scope.formData.FOREIGN_OWNERSHIP == 'N'){
        $scope.formData.FOREIGN_OWNERSHIP = 'D';
    }
    if($scope.formData.YEAR_BUSINESS_STARTED == $scope.thisYear && $scope.formData.MONTH_BUSINESS_STARTED > $scope.thisMonth) {
      $scope.signupForm.MONTH_BUSINESS_STARTED.$invalid = true;
      $scope.signupForm.$valid = false;
    }

    $scope.formData.dob = $scope.dob_year + '-' + $scope.dob_month + '-' + $scope.dob_day;
    var calculateAge = new Date($scope.dob_year,$scope.dob_month,$scope.dob_day );

    var ageDifMs = Date.now() - calculateAge.getTime();
    var ageDate = new Date(ageDifMs);
    var age =  Math.abs(ageDate.getUTCFullYear() - 1970);

    var a = parseInt($scope.formData.FACE_TO_FACE);
    var b = parseInt($scope.formData.PHONE_OR_EMAIL);
    var c = parseInt($scope.formData.INTERNET_PAY); // Considering Internet value in the Sum for Validation, Total must be 100%

    if(a+b+c != 100){
        $scope.signupForm.FACE_TO_FACE.$invalid = true;
        $scope.signupForm.$valid = false;
    }

    if(age<18){
         $scope.signupForm.dob_month.$invalid = true;
         $scope.signupForm.$valid = false;
    }

    if (!$scope.signupForm.$valid) {
      $scope.form_error = true;
      $scope.gotoAnchor('form-error');
      angular.forEach($scope.signupForm.$error, function (field) {
        angular.forEach(field, function(errorField){
            errorField.$setTouched();
        })
      });

      return;
    } else{
        $scope.form_error = false;
        $scope.clickedSubmit = true;
        $scope.tinError= false;
        $scope.submitSignupForm();
      }
  };

  /**
   * Callback when Face To Face changed
   * @param tag
   */
  $scope.faceToFaceChange = function(tag) {
    if (tag == 0) {
      if ($scope.formData.FACE_TO_FACE){
        calcRemainingValues('FACE_TO_FACE','PHONE_OR_EMAIL','INTERNET_PAY');
      }
    } else if (tag == 1) {
      if ($scope.formData.PHONE_OR_EMAIL){
        calcRemainingValues('PHONE_OR_EMAIL','FACE_TO_FACE','INTERNET_PAY');
      }
    } else if (tag == 2) {
      if ($scope.formData.INTERNET_PAY) {
        calcRemainingValues('INTERNET_PAY','FACE_TO_FACE','PHONE_OR_EMAIL');
      }
    }
  };

  /**
   * Check if business started date valid
   */
  $scope.checkBsnMo = function(){
    if($scope.formData.YEAR_BUSINESS_STARTED == $scope.thisYear && $scope.formData.MONTH_BUSINESS_STARTED > $scope.thisMonth) {
      $scope.signupForm.MONTH_BUSINESS_STARTED.$setValidity("excluded", false);
    } else {
      $scope.signupForm.MONTH_BUSINESS_STARTED.$setValidity("excluded", true);
    }
  };

  /**
   * Check if How is the merchant's name displayed checkbox
   */
  $scope.checkCheckbox = function(){
    $scope.merchantDisplayedArray = [];
      angular.forEach($scope.formData.merchantsNameDisplayed, function (value, key) {
          if(value == true){
            $scope.merchantDisplayedArray.push(key);
          }
      });
      if ($scope.merchantDisplayedArray.length > 0){
          $scope.merchantDisplayed = $scope.merchantDisplayedArray.toString();
      }
      else{
        $scope.merchantDisplayed = '';
      }
  };

  /**
   * Change delivery timeframe
   * @param tag
   */
  $scope.changeDeliveryTimeFrame = function(tag) {
    $scope.signupForm.DELIVERY31.$setValidity("total", true);
    if (tag == 0) {
      if ($scope.formData.DELIVERY0_7)
         calcDeliveryValues('DELIVERY0_7','DELIVERY8_14','DELIVERY15_30','DELIVERY31');
    }
    else if (tag == 1) {
      if ($scope.formData.DELIVERY8_14)
           calcDeliveryValues('DELIVERY8_14','DELIVERY0_7','DELIVERY15_30','DELIVERY31');
    }
    else if (tag == 2) {
      if ($scope.formData.DELIVERY15_30)
           calcDeliveryValues('DELIVERY15_30','DELIVERY0_7','DELIVERY8_14','DELIVERY31');
    }
    else if (tag == 3) {
      if ($scope.formData.DELIVERY31)
           calcDeliveryValues('DELIVERY31','DELIVERY0_7','DELIVERY8_14','DELIVERY15_30');
    }
  };

  /**
   * Submit SignUp Form
   */
  $scope.submitSignupForm = function(){
      $scope.updatedFormData = {};
      $scope.updatedFormData.merchantContactInformation = [];
      $scope.updatedFormData.merchantAttributesRequestInformation = [];
      $scope.updatedFormData.contactsInformation = [];
      $scope.updatedFormData.employeeInformation = [];

      $scope.updatedFormData.merchantReferenceCode = 'MERC';
      $scope.updatedFormData.merchantType = 'Retail';
      $scope.updatedFormData.dbaName = $scope.formData.DBA_NAME;
      $scope.updatedFormData.legalName = $scope.formData.legal_business_name;
      $scope.updatedFormData.taxId = $scope.formData.EIN;
      $scope.updatedFormData.sicCode = ' ';
      $scope.updatedFormData.yearsInBusiness = $scope.formData.YEAR_BUSINESS_STARTED + '-' + $scope.formData.MONTH_BUSINESS_STARTED + '-01';
      $scope.updatedFormData.yearsAtLocation = $scope.formData.YEAR_BUSINESS_STARTED + '-' + $scope.formData.MONTH_BUSINESS_STARTED + '-01';
      $scope.updatedFormData.productDescription = "";
      $scope.updatedFormData.createdByCoId = 10;
      $scope.updatedFormData.billReferenceCode = 'O';
      $scope.updatedFormData.organizationTypeReferenceCode = $scope.formData.ORGANIZATION_TYPE;

      var orderId = fdService.getOrderId();

      $scope.updatedFormData.employeeInformation.push({
          'lastName': $scope.formData.lastName,
          'firstName':  $scope.formData.firstName,
          'ssn' : $scope.formData.SocialSecurityNumber,
          'dateOfBirth' : $scope.formData.dob,
          'title' : $scope.formData.title1,
          'homeContactId' : '111'
      });

      $scope.updatedFormData.merchantAttributesRequestInformation.push({
          "orderId":orderId,
          "highestTicket": $scope.formData.ANTICIPATED_HIGHEST_TICKET_SALE,
          "faceToFace": $scope.formData.FACE_TO_FACE,
          "phoneOrEmail": $scope.formData.PHONE_OR_EMAIL,
          "internet":$scope.formData.INTERNET_PAY,/*Added new field to hold internet percent*/
          "businessWebsite": $scope.formData.BUSINESS_WEBSITE,
          "typicalSaleAmount": $scope.formData.TYPICAL_SALE_AMOUNT,
          "stateOfIncorporation": $scope.formData.INCORPORATION_STATE,
          "IRSFilingName": $scope.formData.tax_filing_name,
          "IRSForeignIndicator": $scope.formData.FOREIGN_OWNERSHIP,
          "guid":''
      });

      $scope.updatedFormData.merchantContactInformation.push({
          'contactType': 'LOCATION',
          'state': $scope.formData.state,
          'postalCode':  $scope.formData.zip,
          'address1': $scope.formData.Address1,
          'address2': $scope.formData.Address2,
          'email': $scope.formData.email,
          'url': $scope.formData.BUSINESS_WEBSITE,
          'mobile': $scope.formData.phone,
          'voice': $scope.formData.businessPhone,
          'country': 'USA',
          'name': $scope.formData.legal_business_name,
          'city': $scope.formData.city
      },{
          'contactType': 'CORPORATE',
          'state': $scope.formData.business_address_state,
          'postalCode':  $scope.formData.business_address_zip,
          'address1': $scope.formData.business_address1,
          'address2': $scope.formData.business_address2,
          'mobile': $scope.formData.phone,
          'voice': $scope.formData.businessPhone,
          'country': 'USA',
          'name': $scope.formData.legal_business_name,
          'city': $scope.formData.business_address_city,
          'email': $scope.formData.email,
          'url': $scope.formData.BUSINESS_WEBSITE
      });

      $scope.updatedFormData.contactsInformation.push({
          "instName": $scope.bankName,
          'abaNumber': $scope.formData.ROUTING_NUMBER,
          'accountNumber': $scope.formData.ACCOUNT_NUMBER,
          'ordinal': 2
      });

      fdService.submitMerchantApplication($scope.updatedFormData)
        .success(function(data, status, headers, config) {
          $location.path('/terms');
          $scope.clickedSubmit = false;
        })
        .error(function(data, status, headers, config) {
          $scope.clickedSubmit = false;
          console.log('error');
        });
  };

  ///////////////// MAIN ////////////////////////////////

  _init();

}]);


;/**
 * Solution Controller
 */
app.controller('SolutionCtrl', ['$scope', '$rootScope', '$filter', '$location', '$routeParams', '$timeout', '$anchorScroll', '$window', 'fdService', 'CONST',
  function($scope, $rootScope, $filter, $location, $routeParams, $timeout, $anchorScroll, $window, fdService, CONST) {

    /**
     * image timeout promise
     */
    var imgPromise;

    /**
     * Init function
     * @private
     */
    var _init = function() {

      $scope.category = fdService.getCategoryFromSession();

      if (!$scope.category) {
        $location.path('/');
        return;
      }

      $rootScope.wrapperClass = 'product-detail';
      $rootScope.wrapperId = 'product';
      $rootScope.body_id = 'product-detail';

      $scope.bundle_info = {};
      $scope.includes = [];
      $scope.features = [];
      $scope.faqs = [];
      $scope.specs = {};
      $scope.recommendedBundles = [];
      $scope.min_lease_amt = 0;

      $scope.images = [];
      $scope.cimage = $rootScope.placeholderImageUrl;

      $scope.monthlyFee = false;
      $scope.transactionFee = false;

      $scope.timestamp = new Date().getTime();

      $scope.page = $routeParams.page;

      $rootScope.cart = $rootScope.cart;
      if (!$routeParams.pid) {
        $location.path('/');
        return;
      }

      $scope.pid = $routeParams.pid;

      fdService.getFeatures($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.features = data;
        })
        .error(function(data, status, headers, config) {
          $scope.features = [];
        });
      fdService.getSpecs($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.specs = data;
        })
        .error(function(data, status, headers, config) {
          $scope.specs = {};
        });

      fdService.getProduct($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.bundle_info = data;
          $scope.images = $scope.bundle_info.imageUrls ? $scope.bundle_info.imageUrls : [];

          $rootScope.title = $scope.bundle_info.productName;
          $rootScope.recommendedProductName = $scope.bundle_info.productName;
          $scope.min_lease_amt = 0;
          if (data.pricingModel && data.pricingModel.length) {
            for (var i = 0; i < data.pricingModel.length; i++) {
              if (CONST.PURCHASE_CODE != data.pricingModel[i].purchaseType && data.pricingModel[i].defaultAmt && (!$scope.min_lease_amt || data.pricingModel[i].defaultAmt < $scope.min_lease_amt)) {
                $scope.min_lease_amt = data.pricingModel[i].defaultAmt;
              }
            }
          }
          $scope.thumbImages = [];
          $scope.largeImages = [];
          for (var i in $scope.images) {
            if ($scope.images[i].indexOf('/thumb/') !== -1) {
              $scope.thumbImages.push($scope.images[i]);
            }
            if ($scope.images[i].indexOf('/large/') !== -1) {
              $scope.largeImages.push($scope.images[i]);
            }
          }
          $scope.changeImage($scope.thumbImages[0], 0);

        })
        .error(function(data, status, headers, config) {
          $scope.bundle_info = [];
          $location.path('invalid-item');
          $scope.min_lease_amt = 0;
        });

      fdService.getRecommendedBundles($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.recommendedBundles = data;
        })
        .error(function(data, status, headers, config) {
          $scope.recommendedBundles = [];
        });

      fdService.getProductsList($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.includes = data;
        })
        .error(function(data, status, headers, config) {
          $scope.includes = [];
        });

      fdService.getFaqs($scope.pid)
        .success(function(data, status, headers, config) {
          $scope.faqs = data;
        })
        .error(function(data, status, headers, config) {
          $scope.faqs = [];
        });

      $rootScope.$on('Category_Change', function() {
        $scope.category = fdService.getCategoryFromSession();
      });

    };

    /**
     * Get taxes by city and state
     * @method getTaxes
     * @param zip
     * @param city
     */
    $scope.getTaxes = function(zip, city) {
      if (!zip || !city) {
        return;
      }
      fdService.getTaxes(zip, city)
        .success(function(data, status, headers, config) {
          $rootScope.cart.taxPercent = data.salesTax;
          $scope.cartChanged();
        })
        .error(function(data, status, headers, config) {
          $rootScope.cart.taxPercent = -2;
          $scope.cartChanged();
        });
    };


    /**
     * Redirect to the checkout page
     * @method goToCheckout
     * @param disabled
     */
    $scope.goToCheckout = function(disabled) {
      if (disabled || !$rootScope.cart.purchaseEnabled) {
        return;
      }
      $location.path('/checkout/shipping');
    };

    /**
     * Add product to the cart
     * @method addToCart
     * @param {Object} bundle product object
     */
    $scope.addToCart = function(bundle) {
      if (!bundle) {
        bundle = JSON.parse(JSON.stringify($scope.bundle_info));
      } else {
        $anchorScroll();
      }

      var pid = bundle.productId;

      var category = fdService.getCategoryFromSession();

      if (!Object.keys(bundle).length) {
        return;
      }

      var cardNotPresent = bundle.cardNotPresent ? true : false;

      if (bundle.offeringTypes && bundle.offeringTypes.indexOf('Transactions') > -1) {

        if (-1 !== $rootScope.cart.transaction_products.map(function(e) { return e.id; }).indexOf(bundle.productId)) {
          return;
        }

        var pr = {
          id: bundle.productId,
          name: bundle.productName,
          price: bundle.price,
          type: bundle.productType,
          term: bundle.defaultPurchaseType,
          category: category.name,
          cardNotPresent: cardNotPresent,
          parentProduct: {
            id: null,
            name: null,
            rate: 0,
            fee: 0,
          },
          qty: 1,
        };

        $rootScope.cart.transaction_products.push(pr);

      } else {

        var pr = {
          id: pid,
          name: bundle.productName,
          price: bundle.price,
          defaultPrice: bundle.price,
          individualPurchaseEnabled: bundle.pinPad,
          pricingModel: bundle.pricingModel,
          productType: bundle.productType,
          term: bundle.defaultPurchaseType,
          pmodel: null,
          category: category.name,
          cardNotPresent: cardNotPresent,
          qty: 1
        };

        var index = fdService.getCartProductIndex($rootScope.cart, pr);

        if (-1 !== index) {
          pr = $rootScope.cart.data[index];
          pr.qty++;
          pr.price = bundle.price;
          pr.defaultPrice = bundle.price;
          if (pr.qty > 10) {
            pr.qty = 10;
          }

          $rootScope.cart.data[index] = pr;
        } else {
          $rootScope.cart.data.push(pr);
        }
      }

      fdService.resetCartOverridePricing($rootScope.cart);
      fdService.validateCart($rootScope.cart)
        .success(function(data, status, headers, config) {
          $rootScope.cart.validation = data;
          $scope.cartChanged();
          if (data.iscartvalid) {
            fdService.updatePricing(function() {
              $rootScope.cart = fdService.getCart();
            });
          }
        })
        .error(function(data, status, headers, config) {

        });

      $scope.cartChanged();
      fdService.clearOrderId();

      if (window.matchMedia("(max-width: 740px)").matches) {
        $timeout(function() {
          $location.hash('order-summary-container');
          $anchorScroll();
        });
      }


    };

    /**
     * Lease product
     * @method leaseProduct
     * @param {Object} bundle product object
     */
    $scope.leaseProduct = function(bundle) {

      if (!bundle) {
        bundle = JSON.parse(JSON.stringify($scope.bundle_info));
      } else {
        $anchorScroll();
      }

      fdService.resetCartOverridePricing($rootScope.cart);
      fdService.leaseProduct(bundle, $rootScope.cart);
      $scope.cartChanged();


      if (window.matchMedia("(max-width: 740px)").matches) {
        $timeout(function() {
          $location.hash('order-summary-container');
          $anchorScroll();
        });
      }
      fdService.validateCart($rootScope.cart)
        .success(function(data, status, headers, config) {
          $rootScope.cart.validation = data;
          $scope.cartChanged();
          if (data.iscartvalid) {
            fdService.updatePricing(function() {
              $rootScope.cart = fdService.getCart();
            });
          }
        })
        .error(function(data, status, headers, config) {

        });


    };

    /**
     * Cart Changed
     * @method cartChanged
     */
    $scope.cartChanged = function() {
      $rootScope.cart = fdService.cartChanged($rootScope.cart);
    };

    /**
     * Change current active image
     * @method changeImage
     * @param img
     * @param {number} timeout
     */
    $scope.changeImage = function(img, to) {
      if (undefined == to) {
        to = 100;
      }
      if (imgPromise) {
        $timeout.cancel(imgPromise);
      }
      imgPromise = $timeout(function() {
        var cimage = img.replace('/thumb/', '/large/');
        for (var i in $scope.largeImages) {
          if (cimage == $scope.largeImages[i]) {
            $scope.cimage = cimage;
            return;
          } else {
            $scope.cimage = $rootScope.placeholderImageUrl;
          }

        }

      }, to);
    };
    ///////////////// MAIN ////////////////////////////////


    _init();

  }
]);;/**
 * Terms & Conditions Controller
 */
app.controller('TCCtrl', ['$scope', '$rootScope', '$filter', '$location', '$routeParams','$document', 'fdService', '$window', '$timeout',
    function ($scope, $rootScope, $filter, $location, $routeParams,$document, fdService, $window, $timeout) {

  /**
   * Init function
   * @private
   */
  var _init = function(){
    $scope.orderId = fdService.getOrderId();

    // Redirect to the front page if came here from the thank you page
    if ('thankyou' == $rootScope.refUrl) {
      $location.path('/');
    }

    $scope.resetProductList();
    $scope.isLeasedAgreement = false;

    $scope.signature1Empty = true;
    $scope.signature2Empty = true;
    $scope.signature4Empty = true;
    $scope.signature6Empty = true;
    $scope.signature7Empty = true;
    $scope.signature8Empty = true;
    $scope.signature1Date = null;
    $scope.signature6Date = null;
    $scope.signature7Date = null;

    $scope.agreementClicked= false;

    $rootScope.body_id = 'tc';
    $rootScope.bodyClass = 'tc';

    $scope.interchangeScheduleVersion = "";

    $scope.sectionsOpen = {
      1: true,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
      8: false,
      9: false,
      10: false,
      11: false,
    };

    fdService.getMerchantInfo($scope.orderId)
      .success(function(data) {
        $scope.assignMerchantInfo(data);
      })
      .error(function(data, status, headers, config) {
        $location.path('400');
        console.log('error')
      });

    Number.prototype.formatMoney = function(c, d, t){
      var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
      return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };

    Number.prototype.formatRateFee = function(){
      var n = Math.round(this * 10000);
      if(n == 0) {
        return this.toFixed(2);
      } else if(n % 100 == 0) {
        return this.toFixed(2);
      } else if(n % 10 == 0) {
        return this.toFixed(3);
      } else {
        return this.toFixed(4);
      }
    };
  };

  /**
   * mask digit
   * @param value
   * @return {string}
   */
  $scope.maskDigit = function(value){
    if(value){
      var mask="XXXXXX"+value.substring(6);
      return mask;
    }
  }

  /**
   * Round number
   * @param num
   * @return {number}
   */
  $scope.round=function(num) {
    return Math.round(num * 100) / 100;
  }

  /**
   * Reset products list
   */
  $scope.resetProductList = function(){
    $scope.productList = {
        oneTotal: 0,
        multiTotal: 0,
        one: [],
        multi: []
    };
  };

  /**
   * Check if form is not valid
   * @return {boolean}
   */
  $scope.isFormNotValid=function(){

     if($scope.signature1Empty || $scope.signature8Empty || ($scope.isLeasedAgreement && $scope.signature6Empty)) {
       return true
     }
     return false;
   }

  /**
   * Submit Terms & Conditions
   */
  $scope.submitTC = function(){
    if ($scope.isFormNotValid()) return;
    $scope.clickedTCSubmit = true;
    var canvas = $document[0].getElementById('signature1');//jQuery('#signature1')[0];

    var canvas4 = $document[0].getElementById('signature4');
    var canvas6 = $document[0].getElementById('signature6');
    var canvas7 = $document[0].getElementById('signature7');
    var canvas8 = $document[0].getElementById('signature8');

    var pngBin = canvas.toDataURL().replace(/^data:image\/(png);base64,/, "");

    var pngBin4 = canvas4.toDataURL().replace(/^data:image\/(png);base64,/, "");
    var pngBin6 = canvas6.toDataURL().replace(/^data:image\/(png);base64,/, "");
    var pngBin7 = canvas7.toDataURL().replace(/^data:image\/(png);base64,/, "");
    var pngBin8 = canvas8.toDataURL().replace(/^data:image\/(png);base64,/, "");

    var orderId = fdService.getOrderId();

    if (!orderId) {
      alert('no order id!!!');
      $scope.clickedTCSubmit = false;
      return;
    }

    var sdata = {
        "MPAMerchantSignaturePrincipal":pngBin,
         orderId: orderId,
    };

    if(!$scope.signature4Empty){
         sdata['PersonalGuaranteeSignaturePrincipal']=pngBin4;
    }

    if(!$scope.signature6Empty){
        sdata['LeaseAgreementSignature']=pngBin6;
    }

    if(!$scope.signature7Empty){
        sdata['LeaseAgreementPersonalGuaranteeSignature']=pngBin7;
    }

    if(!$scope.signature8Empty){
         sdata['ConfirmationPageSignature']=pngBin8;
    }

    fdService.submitSignature(sdata)
      .success(function(data, status, headers, config) {
        $location.path('/thankyou');
        fdService.clearOrderId();
        fdService.clearSignupData();
        fdService.clearCart();
        fdService.clearCategoryFromSession();
        fdService.clearTransactionInfo();
        fdService.clearOrderedCart();
        fdService.clearAcquiringPricing();
        fdService.clearEquipmentPricing();
        $rootScope.cart = fdService.getCart();
      })
      .error(function(data, status, headers, config) {
        alert('error')
        console.log('error')
         $scope.clickedTCSubmit = false;
      });
  };

   $scope.merchantBean = {};
   $scope.merchantBean.firstName='';
   $scope.merchantBean.lastName='';
   $scope.merchantBean.merchantBusinessBean = {};
   $scope.merchantBean.leaseEquipment = [];
   $scope.merchantBean.equipment = [];
   $scope.merchantBean.organizationTypeReferenceCode='';
   $scope.isLogoVisible = false;
   $scope.isTinTypeSsn = false;
   $scope.isTitleOther = false;
   $scope.isAmexOptBlue = true;
   $scope.equipmentPurchase = 0;
   $scope.totalAmountStartUpFees = 0;

   $scope.assignMerchantInfo = function(data) {

    if(angular.isUndefined(data)) {
      data = {};
    }

    if(!angular.isUndefined(data.dynamicVersionInfo)) {
     for(var i=0;i<data.dynamicVersionInfo.length;i++) {
       if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='PROCESSOR'){
         $scope.merchantBean.processor = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='PROCESSOR_URL'){
         $scope.merchantBean.processorUrl = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='PROCESSOR_ADDRESS'){
         $scope.merchantBean.processorAddress = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='PROCESSOR_CUSTOMER_SERVICE'){
         $scope.merchantBean.processorCustomerService = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='SPONSOR_BANK'){
         $scope.merchantBean.sponsorBank = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='SPONSOR_BANK_ADDRESS'){
         $scope.merchantBean.sponsorBankAddress = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='SPONSOR_BANK_CUST_SERV_NUMBER'){
         $scope.merchantBean.sponsorBankCustServNumber = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='S3_FILE_PATH_FOR_TERMS'){
         $scope.merchantBean.s3PathForTerms = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='TEMPLATE_PATH'){
         $scope.merchantBean.templatePath = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='SERVICERS_TITLE'){
         $scope.merchantBean.serviceTitle = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='SERVICERS_BODY'){
         $scope.merchantBean.serviceBody = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='PERSONAL_GUARANTY'){
         $scope.merchantBean.personalGuaranty = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='CONFIRMATION_VERSION'){
         $scope.merchantBean.pgVersion = data.dynamicVersionInfo[i].value;
       } else if(!angular.isUndefined(data.dynamicVersionInfo[i].property) && data.dynamicVersionInfo[i].property=='MPA_VERSION'){
         $scope.merchantBean.version = data.dynamicVersionInfo[i].value;
       }
     }
    }


    if(!angular.isUndefined(data.emvEnabled)) {
      $scope.emvEnabled = data.emvEnabled;
    }
    if(!angular.isUndefined(data.debitEnabled)) {
      $scope.debitEnabled = data.debitEnabled;
    }
    if(!angular.isUndefined(data.amexEnabled)) {
      $scope.amexEnabled = data.amexEnabled;
    }
    if(!angular.isUndefined(data.discoverEnabled)) {
      $scope.discoverEnabled = data.discoverEnabled;
    }
    if(!angular.isUndefined(data.legalName)) {
      $scope.merchantBean.merchantBusinessBean.legalDbaName = data.legalName;
    }
    //===For Section 1 Starts
    if(!angular.isUndefined(data.dbaName)) {
      $scope.merchantBean.merchantBusinessBean.dbaName = data.dbaName;
    }


    if(!angular.isUndefined(data.employeeInformation)) {
      for(var i=0;i<data.employeeInformation.length;i++) {
        if(!(angular.isUndefined(data.employeeInformation[i].firstName)||(data.employeeInformation[i].firstName ==null ))){
          $scope.merchantBean.firstName = data.employeeInformation[i].firstName;
        }
        if(!(angular.isUndefined(data.employeeInformation[i].lastName)||(data.employeeInformation[i].lastName ==null ))){
          $scope.merchantBean.lastName = data.employeeInformation[i].lastName;
        }
        if(!angular.isUndefined(data.employeeInformation[i].ssnMasked)) {
          $scope.merchantBean.merchantBusinessBean.socialSecurityNumber = data.employeeInformation[i].ssnMasked;
        }
        if(!angular.isUndefined(data.employeeInformation[i].dateOfBirth)) {
          $scope.merchantBean.dateOfBirth = $filter('date')(data.employeeInformation[i].dateOfBirth,'XX-XX-yyyy');
        }
        if(!angular.isUndefined(data.employeeInformation[i].ssnMasked) &&
            !angular.isUndefined(data.taxIdMask) &&
            data.employeeInformation[i].ssnMasked == data.taxIdMask) {
          $scope.isTinTypeSsn = true;
        }
        if(!(angular.isUndefined(data.employeeInformation[i].title)||(data.employeeInformation[i].title ==null ))){
          if(data.employeeInformation[i].title != 'OWNER'
            && data.employeeInformation[i].title != 'PARTNER'
            && data.employeeInformation[i].title != 'PRESIDENT'
            && data.employeeInformation[i].title != 'VICE PRESIDENT'
            && data.employeeInformation[i].title != 'MEMBER LLC') {
              $scope.isTitleOther = true;
            }
            $scope.merchantBean.title = data.employeeInformation[i].title;
        }
      }
    }
    if(!angular.isUndefined(data.taxIdMask))
      $scope.merchantBean.merchantBusinessBean.employerIdNumberTax = data.taxIdMask;
    if(!angular.isUndefined(data.contactsInformation)) {
      for(var i=0;i<data.contactsInformation.length;i++) {
        if(!angular.isUndefined(data.contactsInformation[i].accountNumberMasked))
          $scope.merchantBean.accountNumber = data.contactsInformation[i].accountNumberMasked;
        if(!angular.isUndefined(data.contactsInformation[i].abaMasked))
          $scope.merchantBean.abaNumber = data.contactsInformation[i].abaMasked;
        if(!angular.isUndefined(data.contactsInformation[i].instName))
          $scope.merchantBean.instName = data.contactsInformation[i].instName;
      }
    }
    if(!angular.isUndefined(data.merchantContactInformation)) {
      for(var i=0;i<data.merchantContactInformation.length;i++) {
        if(data.merchantContactInformation[i].contactType == "CORPORATE") {
          $scope.merchantBean.merchantBusinessBean.businessAddress = data.merchantContactInformation[i].address1;
          $scope.merchantBean.merchantBusinessBean.businessAptSuite = data.merchantContactInformation[i].address2;
          $scope.merchantBean.merchantBusinessBean.businessCity = data.merchantContactInformation[i].city;
          $scope.merchantBean.merchantBusinessBean.businessState = data.merchantContactInformation[i].state;
          $scope.merchantBean.merchantBusinessBean.businessZipcode = data.merchantContactInformation[i].postalCode;
          $scope.merchantBean.merchantBusinessBean.businessPhoneNumber = data.merchantContactInformation[i].voice;
          $scope.merchantBean.merchantBusinessBean.emailAddress = data.merchantContactInformation[i].email;
          $scope.merchantBean.merchantBusinessBean.businessCountry = data.merchantContactInformation[i].country;
          $scope.merchantBean.merchantBusinessBean.phoneNumber = data.merchantContactInformation[i].mobile;
          $scope.merchantBean.merchantBusinessBean.url = data.merchantContactInformation[i].url;
        }
        if(data.merchantContactInformation[i].contactType == "LOCATION") {
          $scope.merchantBean.homeAddress = data.merchantContactInformation[i].address1;
          $scope.merchantBean.homeAddress2 = data.merchantContactInformation[i].address2;
          $scope.merchantBean.city = data.merchantContactInformation[i].city;
          $scope.merchantBean.country = data.merchantContactInformation[i].country;
          $scope.merchantBean.state = data.merchantContactInformation[i].state;
          $scope.merchantBean.zipCode = data.merchantContactInformation[i].postalCode;
          $scope.merchantBean.emailAddress = data.merchantContactInformation[i].email;
        }
      }
    }
    //===For Section 1 Ends
    
    //===For Section 2 Starts
    if(!angular.isUndefined(data.merchantAttributesInformation )) {
      for(var i=0;i<data.merchantAttributesInformation.length;i++) {
        if(data.merchantAttributesInformation[i].attrName == "ANNUAL_SALE") {
          
          $scope.merchantBean.merchantBusinessBean.anticipatedSales = data.merchantAttributesInformation[i].attrValue;
          
          if(!isNaN(Number($scope.merchantBean.merchantBusinessBean.anticipatedSales))){

            $scope.merchantBean.totalCash = data.merchantAttributesInformation[i].attrValue;

            if(data.amexEnabled && data.discoverEnabled) {
              if($scope.merchantBean.totalCash >= 1000000){
                $scope.totalAnnualAmericanExpress = data.amexAnnualVolume;
                $scope.totalAnnualMC = Math.round((($scope.merchantBean.totalCash - $scope.totalAnnualAmericanExpress) * 96/100));
                $scope.totalAnnualDiscoverVolume = Math.round(($scope.merchantBean.totalCash - $scope.totalAnnualMC - $scope.totalAnnualAmericanExpress));
                if($scope.totalAnnualAmericanExpress >= 1000000) {
                  $scope.isAmexOptBlue = false;
                }
              } else {
                $scope.totalAnnualMC = Math.round((($scope.merchantBean.totalCash) * 81/100));
                $scope.totalAnnualAmericanExpress = Math.round((($scope.merchantBean.totalCash) * 15/100));
                $scope.totalAnnualDiscoverVolume = ($scope.merchantBean.totalCash - $scope.totalAnnualMC - $scope.totalAnnualAmericanExpress);
              }
            } else if(data.discoverEnabled) {
              $scope.totalAnnualAmericanExpress = 0;
              $scope.totalAnnualMC = Math.round((($scope.merchantBean.totalCash) * 96/100));
              $scope.totalAnnualDiscoverVolume = ($scope.merchantBean.totalCash - $scope.totalAnnualMC);
            } else if(data.amexEnabled) {
              if($scope.merchantBean.totalCash >= 1000000){
                $scope.totalAnnualAmericanExpress = data.amexAnnualVolume;
                $scope.totalAnnualMC = Math.round($scope.merchantBean.totalCash - $scope.totalAnnualAmericanExpress);
                $scope.totalAnnualDiscoverVolume = 0;
                if($scope.totalAnnualAmericanExpress >= 1000000) {
                  $scope.isAmexOptBlue = false;
                }
              } else {
                $scope.totalAnnualMC = Math.round((($scope.merchantBean.totalCash) * 85/100));
                $scope.totalAnnualAmericanExpress = Math.round($scope.merchantBean.totalCash - $scope.totalAnnualMC);
                $scope.totalAnnualDiscoverVolume = 0;
              }
            } else {
              $scope.totalAnnualAmericanExpress = 0;
              $scope.totalAnnualMC = Math.round($scope.merchantBean.totalCash);
              $scope.totalAnnualDiscoverVolume = 0;
            }
          } else {
            console.log('AnticipatedSales is not a number.');
            $scope.merchantBean.totalCash = '';
            $scope.totalAnnualMC = '';
            $scope.totalAnnualDiscoverVolume = '';
          }
          $scope.annualAmexFormatted = $scope.totalAnnualAmericanExpress.formatMoney(2);
          $scope.annualMcVisaFormatted = $scope.totalAnnualMC.formatMoney(2);
          $scope.annualDiscFormatted = $scope.totalAnnualDiscoverVolume.formatMoney(2);
        }
        if(data.merchantAttributesInformation[i].attrName == "HI_TKT") {
          $scope.merchantBean.merchantBusinessBean.hiTicket = parseFloat(data.merchantAttributesInformation[i].attrValue).formatMoney(2);
        }
        if(data.merchantAttributesInformation[i].attrName == "INC_STATE" ) {
          $scope.merchantBean.merchantBusinessBean.stateIncorp  = data.merchantAttributesInformation[i].attrValue;
        }
        if(data.merchantAttributesInformation[i].attrName == "IRS_FRGN_IND"  && data.merchantAttributesInformation[i].attrValue == "A" ) {
          $scope.merchantBean.merchantBusinessBean.isCertified  = true;
        }
        if(data.merchantAttributesInformation[i].attrName == "IRS_FIL_NM" ) {
          $scope.merchantBean.merchantBusinessBean.taxBusinessName = data.merchantAttributesInformation[i].attrValue;
        }
        if(data.merchantAttributesInformation[i].attrName == "SWIPED") {
          $scope.merchantBean.merchantBusinessBean.f2fPercent = data.merchantAttributesInformation[i].attrValue;
        }
        if(data.merchantAttributesInformation[i].attrName == "PHONE") {
          $scope.merchantBean.merchantBusinessBean.motoPercent = Number(data.merchantAttributesInformation[i].attrValue);
        }
        if(data.merchantAttributesInformation[i].attrName == "INTERNET") {
          $scope.merchantBean.merchantBusinessBean.internetPercent = Number(data.merchantAttributesInformation[i].attrValue);
        }
      }
    }

    $scope.merchantBean.merchantBusinessBean.businessType = data.industryType;
    $scope.merchantBean.avgTicket = parseFloat(data.averageTicket).formatMoney(2);
    $scope.merchantBean.createdDate = $filter('date')(data.createdDate,'MM-dd-yyyy');
    //===For Section 2 Ends

    //===For Section 3 Starts
    if(!angular.isUndefined(data.yearsInBusiness)) {
      var offset = (new Date().getTimezoneOffset() + 60)* 60000;
      var dateTime = data.yearsInBusiness;
      $scope.merchantBean.businessYearStarted = $filter('date')(offset + dateTime,'MM-yyyy');
    }
    if(!angular.isUndefined(data.organizationTypeReferenceCode)) {
      $scope.merchantBean.organizationTypeReferenceCode = data.organizationTypeReferenceCode;
    }
    if(!angular.isUndefined(data.productDescription)) {
      $scope.merchantBean.merchantBusinessBean.mccDescription = data.productDescription;
    }

    //===For Section 6 and Lease Starts
    $scope.merchantBean.equipment = data.equipmentList;

    for(var i=0;i<data.equipmentList.length;i++) {
      if(data.equipmentList[i].term == "P") {
        $scope.equipmentPurchase += data.equipmentList[i].unitPrice * data.equipmentList[i].quantity;
      }
    }
    if(!angular.isUndefined(data.equipmentListLease) && data.equipmentListLease != null) {
      $scope.merchantBean.leaseEquipment = data.equipmentListLease;
      $scope.merchantBean.totalMonthlyLeaseCharge = data.equipmentListLease[0].leaseSum;
      $scope.merchantBean.totalCostToLease = data.equipmentListLease[0].totalCostToLease;
      $scope.merchantBean.leaseTerm = data.equipmentListLease[0].leaseTerm;
      $scope.isLeasedAgreement = true;
    }
    //===For Section 6 and Lease Ends

    //=== Section 7 Fee Schedule
    if(!angular.isUndefined(data.productList)) {
        for(var i=0;i<data.productList.length;i++) {

          //===Product Subscriptions (Monthly)
          if(data.productList[i].mpaProductKey == 'cloverServiceFee'){
            $scope.merchantBean.cloverServiceFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'insighticsFee'){
            $scope.merchantBean.insighticsFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'transarmorSolution'){
            $scope.merchantBean.transarmorSolution = data.productList[i].value.formatMoney(2);
          }

          //=== Start-Up Fees
          if(data.productList[i].mpaProductKey == 'applicationFee'){
            $scope.merchantBean.applicationFee = data.productList[i].value.formatMoney(2);
            $scope.totalAmountStartUpFees += parseFloat(data.productList[i].value);
          }
          if(data.productList[i].mpaProductKey == 'programmingFee'){
            $scope.merchantBean.programmingFee = data.productList[i].value.formatMoney(2);
            $scope.totalAmountStartUpFees += parseFloat(data.productList[i].value);
          }
          if(data.productList[i].mpaProductKey ==  'debitStartUp'){
            $scope.merchantBean.debitStartUp = data.productList[i].value.formatMoney(2);
            $scope.totalAmountStartUpFees += parseFloat(data.productList[i].value);
          }

          //=== Compliance Fees
          if(data.productList[i].mpaProductKey == 'monthlySVCFee'){
            $scope.merchantBean.monthlySVCFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'annualComplianceFee'){
            $scope.merchantBean.annualComplianceFee = data.productList[i].value.formatMoney(2);
          }

          //=== Debit Fees
          if(data.productList[i].mpaProductKey == 'bundledDebitRate'){
            $scope.merchantBean.bundledDebitRate = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'bundledDebitFee'){
            $scope.merchantBean.bundledDebitFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'unbundledDebitFee'){
            $scope.merchantBean.unbundledDebitFee = data.productList[i].value.formatRateFee();
          }

          //=== Mobile Payments Solution (Clover Go)
          if(data.productList[i].mpaProductKey == 'fdMobilePaySetupFee' ){
            $scope.merchantBean.fdMobilePaySetupFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'mobilePaySVCFee'){
            $scope.merchantBean.mobilePaySVCFee = data.productList[i].value.formatMoney(2);
          }

          //=== eCommerce/Wireless Solutions
          if(data.productList[i].mpaProductKey == 'payeezySetupFee'){
            $scope.merchantBean.payeezySetupFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'e4monthlyFee'){
            $scope.merchantBean.e4monthlyFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'payeezyWebstoreFee'){
            $scope.merchantBean.payeezyWebstoreFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'eComEpricing'){
            $scope.merchantBean.eComEpricing = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'globalGatewaySetupFee'){
            $scope.merchantBean.globalGatewaySetupFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'internetAuthFee'){
            $scope.merchantBean.internetAuthFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'wirelessAccessFee'){
            $scope.merchantBean.wirelessAccessFee = data.productList[i].value.formatMoney(2);
          }

          //=== Miscellaneous Fees
          if(data.productList[i].mpaProductKey == 'transarmorDataProtection'){
            $scope.merchantBean.transarmorDataProtection = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'pciValidation'){
            $scope.merchantBean.pciValidation = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'busAdvPkg'){
            $scope.merchantBean.busAdvPkg = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'minimumProcessingFee'){
            $scope.merchantBean.minimumProcessingFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'paperStatementFee'){
            $scope.merchantBean.paperStatementFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'chargebackFee'){
            $scope.merchantBean.chargebackFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'achRejectFee'){
            $scope.merchantBean.achRejectFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'batchSettlementFee'){
            $scope.merchantBean.batchSettlementFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'monFundAdv'){
            $scope.merchantBean.monFundAdv = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'avsFee'){
            $scope.merchantBean.avsFee = data.productList[i].value.formatMoney(2);
          }
          if(data.productList[i].mpaProductKey == 'voiceAuthFee'){
            $scope.merchantBean.voiceAuthFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'mcNetworkAccessFee'){
            $scope.merchantBean.mcNetworkAccessFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'mcLicenseFee'){
            $scope.merchantBean.mcLicenseFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'mcCrossBorderFee'){
            $scope.merchantBean.mcCrossBorderFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaIntlNonUSD'){
            $scope.merchantBean.visaIntlNonUSD = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaIntlUSD'){
            $scope.merchantBean.visaIntlUSD= data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'amexPassThru'){
            $scope.merchantBean.amexPassThru = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'ebtFee'){
            $scope.merchantBean.ebtFee = data.productList[i].value.formatRateFee();
          }

          //=== Fee Schedule Table
          if(data.productList[i].mpaProductKey == 'visaCreditFeeRateAuth'){
            $scope.merchantBean.visaCreditFeeRateAuth = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditFeeInterchange'){
            $scope.merchantBean.visaCreditFeeInterchange = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditFeeTier'){
            $scope.merchantBean.visaCreditFeeTier = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditRateRateAuth'){
            $scope.merchantBean.visaCreditRateRateAuth = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditRateInterchange'){
            $scope.merchantBean.visaCreditRateInterchange = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditRateTier2'){
            $scope.merchantBean.visaCreditRateTier2 = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditRateTier3'){
            $scope.merchantBean.visaCreditRateTier3 = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitRateRateAuth'){
            $scope.merchantBean.visaDebitRateRateAuth = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitFeeInterchange'){
            $scope.merchantBean.visaDebitFeeInterchange = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitFeeTier'){
            $scope.merchantBean.visaDebitFeeTier = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitRateInterchange'){
            $scope.merchantBean.visaDebitRateInterchange = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitRateTier2'){
            $scope.merchantBean.visaDebitRateTier2 = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitRateTier3'){
            $scope.merchantBean.visaDebitRateTier3 = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'amexDiscountRate'){
            $scope.merchantBean.amexDiscountRate = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCardMQFee'){
            $scope.merchantBean.visaCardMQFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCardNPMQFee'){
            $scope.merchantBean.visaCardNPMQFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditNonQualFeeTier'){
            $scope.merchantBean.visaCreditNonQualFeeTier = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitNonQualFeeTier'){
            $scope.merchantBean.visaDebitNonQualFeeTier = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCardMQRate'){
            $scope.merchantBean.visaCardMQRate = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCardNPMQRate'){
            $scope.merchantBean.visaCardNPMQRate = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditNonQualRateTier2'){
            $scope.merchantBean.visaCreditNonQualRateTier2 = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaCreditNonQualRateTier3'){
            $scope.merchantBean.visaCreditNonQualRateTier3 = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitNonQualRateTier2'){
            $scope.merchantBean.visaDebitNonQualRateTier2 = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'visaDebitNonQualRateTier3'){
            $scope.merchantBean.visaDebitNonQualRateTier3 = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'nonQualifiedSurchargeFee'){
            $scope.merchantBean.nonQualifiedSurchargeFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'rewardsSurchargeRate'){
            $scope.merchantBean.rewardsSurchargeRate = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'swipedRate'){
            $scope.merchantBean.swipedRate = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'nonSwipedRate'){
            $scope.merchantBean.nonSwipedRate = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'swipedFee'){
            $scope.merchantBean.swipedFee = data.productList[i].value.formatRateFee();
          }
          if(data.productList[i].mpaProductKey == 'nonSwipedFee'){
            $scope.merchantBean.nonSwipedFee = data.productList[i].value.formatRateFee();
          }
        }
    }

    $scope.totalAmountStartUpFees += $scope.equipmentPurchase;
    if(!$scope.equipmentPurchase > 0) {
      $scope.equipmentPurchase = "N/A";
    }
  };

  /**
   * Open print dialogue
   */
  $scope.printWindow = function() {
    $window.print();
  };

  /**
   * execute when mouse up from canvas
   * @param i index of canvas
   */
  $scope.canMouseUp = function(i) {
    var blank = isCanvasBlank(document.getElementById('signature' + i));

    if(!blank) {
      $scope['signature' + i + 'Empty'] = false;
      $scope['signature' + i + 'Date'] = new Date();
    }
  };

  /**
   * Check if canvas is blank
   * @param canvas
   * @return {boolean}
   */
  function isCanvasBlank(canvas) {
    var blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    return canvas.toDataURL() == blank.toDataURL();
  }

  /**
   * clear canvas
   * @param i
   */
  $scope.resetCanvas = function(i){
    var sketch = angular.element('#signature' + i);
    var myCanvas = sketch[0];
    sketch.sketch().actions = [];
    var ctx = myCanvas.getContext('2d');
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    $scope['signature' + i + 'Empty'] = true;
    $scope['signature' + i + 'Date'] = null;
  }

  /**
   * toggle section
   * @param i section index
   */
  $scope.toggleSection = function(i){
    $scope.sectionsOpen[i] = !$scope.sectionsOpen[i];
  };

  /**
   * Close all sections
   */
  $scope.closeAllSections = function(){
    for (var i in $scope.sectionsOpen) {
      $scope.sectionsOpen[i] = false;
    }
  };

  /**
   * Open all sections
   */
  $scope.openAllSections = function(){
    for (var i in $scope.sectionsOpen) {
      $scope.sectionsOpen[i] = true;
    }
  };

  ///////////////// MAIN ////////////////////////////////
  _init();
}]);
;/**
 * Thank You Controller
 */
app.controller('ThankyouCtrl', ['$scope', '$rootScope', '$filter', '$location', '$routeParams', 'fdService', '$window',
  function($scope, $rootScope, $filter, $location, $routeParams, fdService, $window) {

    /**
     * Init function
     * @private
     */
    var _init = function() {
      $rootScope.body_id = 'ty';
      $rootScope.bodyClass = 'ty';
      $scope.thankyouPageFlag = $rootScope.thankyouPageFlag;
    };

    /**
     * Redirect to the main page
     * @method learnMore
     */
    $scope.learnMore = function() {
      $window.location.href = 'https://www.firstdata.com/en_us/home.html';
    };
    ///////////////// MAIN ////////////////////////////////
    _init();
  }
]);;/**
 * Transaction Info Controller
 */
app.controller('TransactionInfoCtrl', ['$scope', '$rootScope', '$filter', '$location', '$routeParams', 'fdService', '$timeout',
  function($scope, $rootScope, $filter, $location, $routeParams, fdService, $timeout) {

    /**
     * Init function
     * @private
     */
    var _init = function() {

      $rootScope.body_id = 'shipping';
      $scope.transactionFormData = {};

      $scope.category = fdService.getCategoryFromSession();
      var ti = fdService.getTransactionInfo();
      $scope.mccTypeIn = ti.mcc;
      $scope.isMCCValid = true;

      var orderId = fdService.getOrderId();

      if (orderId) {
        var cart = fdService.getOrderedCart(orderId);
        cart = fdService.cartChanged(cart);
        fdService.storeTmpOrderId(orderId);
        fdService.clearOrderId();
      } else {
        var cart = fdService.getCart();
      }

      //reset cart.data product pricing
      //fdService.resetCartOverridePricing(cart);

      fdService.clearAcquiringPricing();
      //fdService.clearGlobalPricing();
      //fdService.clearEquipmentPricing();

      cart.onetimeFees = {};
      cart.mFees = {};
      cart.onetimeAmount = 0;
      cart.mfeeAmount = 0;
      cart = fdService.setPricingToCart(cart, fdService.getGlobalPricingStorage());
      cart = fdService.setPricingToCart(cart, fdService.getEquipmentPricingStorage());
      // cart.transaction_fee = null;
      if (cart.payment_types != null) {
        cart.payment_types.groups = [];
      }

      for (var i in cart.transaction_products) {
        cart.transaction_products[i].parentProduct = null;
      }

      cart = fdService.setPricingToCart(cart, fdService.getAcquiringPricingStorage());
      $rootScope.cart = fdService.cartChanged(cart);


      // Autopopulate transaction info from the session
      $scope.initPricingProposal(function() {
        if (ti.mccTypes) {
          $scope.getMccTypes(ti.mccTypes, function() {
            $scope.transactionFormData = ti;
            showMccAdditionalDetails($scope.transactionFormData.mcc);
            $timeout(function() {
              angular.element('[name=mcccodes]').trigger('change');
              angular.element('[name=mcctypes]').trigger('change');
              angular.element('[name=mcctypein]').trigger('change');
              angular.element('[name=sales]').trigger('keyup');
              angular.element('[name=ticket]').trigger('keyup');
              angular.element('[name=highestTicket]').trigger('keyup');
              angular.element('[name=amexVolume]').trigger('keyup');
              angular.element('[name=amexMemberId]').trigger('keyup');
            }, 0);
          });
        }

      });

      //isAmexPresent: A flag which holds American Express card selected or not, check if product is swiped, non swiped and telecheck
      $scope.isAmexPresent = false;
      $scope.isSwipedNonSwiped = false;
      $scope.isTeleCheck = false;
      if (cart.payment_types) {
        for (var i in cart.payment_types.products) {
          if (cart.payment_types.products[i].name == 'American Express')
            $scope.isAmexPresent = true;
          if (cart.payment_types.products[i].name == 'Swiped/Non Swiped')
            $scope.isSwipedNonSwiped = true;
          if (cart.payment_types.products[i].type == 'TELECHECK')
            $scope.isTeleCheck = true;
        }
      }
      if (cart.data) {
        for (var i in cart.data) {
          if (cart.data[i].productType == 'TELECHECK')
            $scope.isTeleCheck = true;
        }
      }
      if (cart.transaction_products) {
        for (var i in cart.transaction_products) {
          if (cart.transaction_products[i].type == 'TELECHECK')
            $scope.isTeleCheck = true;
        }
      }

    };

    /**
     * Initialize pricing proposal
     * @method initPricingProposal
     * @param callback function
     */
    $scope.initPricingProposal = function(callback) {

      $scope.transactionFormData = {};
      var categoryName = $rootScope.cart.data[Object.keys($rootScope.cart.data)[0]].category;

      fdService.getMccCodes(categoryName)
        .success(function(data, status, headers, config) {
          $scope.mccCodes = data;
          if (callback) {
            callback.apply(this, []);
          }

        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });
    };

    /**
     * Get MCC Code by category and type
     * @method getMccTypes
     * @param value
     * @param callback
     */
    $scope.getMccTypes = function(value, callback) {
      $scope.mccTypes = [];
      if (value === undefined)
        return;

      var categoryName = $rootScope.cart.data[Object.keys($rootScope.cart.data)[0]].category;
      fdService.getMccTypes(categoryName, value)
        .success(function(data, status, headers, config) {
          $scope.mccTypes = data;
          if (callback) {
            callback.apply(this, []);
          }
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });
    };

    /**
     * Check Misc 99
     * @method checkMisc99
     */
    $scope.checkMisc99 = function() {
      showMccAdditionalDetails($scope.transactionFormData.mcc);
      $scope.validateCart();
      if ($scope.transactionFormData.mcc >= 4) {
        $scope.mccTypeIn = $scope.transactionFormData.mcc;
        $timeout(function() {
          angular.element('[name=mcctypein]').trigger('change');
          $scope.transactionInfoForm.mcctypein.$setTouched();
          $scope.isMCCValid = true;
        }, 0);
      }
    };

    /**
     * Get MCC Details
     * @method getMCCDetails
     */
    $scope.getMCCDetails = function() {
      var categoryName = $rootScope.cart.data[Object.keys($rootScope.cart.data)[0]].category;
      var mccCode = $scope.mccTypeIn;
      if (mccCode === undefined || mccCode.length < 4) {
        $scope.invalidateMCCDetails();
        return;
      }
      fdService.getMCCDetails(categoryName, mccCode)
        .success(function(data, status, headers, config) {
          $scope.isMCCValid = true;
          $scope.transactionFormData.mcc = data.mcc;
          $scope.transactionFormData.mccTypes = data.industryDescription;
          $scope.getMccTypes($scope.transactionFormData.mccTypes, function() {
            $timeout(function() {
              angular.element('[name=mcccodes]').trigger('change');
              angular.element('[name=mcctypes]').trigger('change');
              showMccAdditionalDetails($scope.transactionFormData.mcc);
              $scope.validateCart();
            }, 0);
          });
        })
        .error(function(data, status, headers, config) {
          $scope.invalidateMCCDetails();
        });
    };

    /**
     * Invalidate MCC Details
     * @method invalidateMCCDetails
     */
    $scope.invalidateMCCDetails = function() {
      $scope.isMCCValid = false;
      $scope.transactionFormData.mccTypes = '';
      $scope.transactionInfoForm.mcccodes.$setTouched();
      $timeout(function() {
        angular.element('[name=mcccodes]').trigger('change');
        if ($scope.transactionInfoForm.mcctypes) {
          angular.element('[name=mcctypes]').trigger('change');
          $scope.transactionInfoForm.mcctypes.$setTouched();
        }
      }, 0);
    };

    /**
     * Show Mcc Additional Details
     * @method showMccAdditionalDetails
     * @param {} miscVal
     * @return
     */
    function showMccAdditionalDetails(miscVal) {
      if (miscVal % 100 == 99)
        $scope.misc99 = true;
      else
        $scope.misc99 = false;
    }


    /**
     * Get Transaction Form
     * @method getTransactionForm
     * @return MemberExpression
     */
    $rootScope.getTransactionForm = function() {
      return $scope.transactionInfoForm;
    };
    /**
     * Get Transaction Form Data
     * @method getTransactionFormData
     * @return MemberExpression
     */
    $rootScope.getTransactionFormData = function() {
      return $scope.transactionFormData;
    };
    /**
     * Update Lead Status
     * @method updateLeadStatus
     */
    $rootScope.updateLeadStatus = function() {
      $rootScope.isLeadSelected = false;
      if (fdService.getCDFromSession()) {
        $rootScope.isLeadSelected = true;
      } else {
        $timeout(function() {
          $rootScope.openPane();
        }, 200);
      }
    };

    /**
     * Validate Cart
     * @method validateCart
     */
    $scope.validateCart = function() {
      fdService.validateCart($rootScope.cart, $scope.transactionFormData)
        .success(function(data, status, headers, config) {
          $rootScope.cart.validation = data;
          $rootScope.cart = fdService.cartChanged($rootScope.cart);
        });
    };

    /**
     * validate cart on average ticket changed
     * @method avgTicketChanged
     */
    $scope.avgTicketChanged = function() {

      $rootScope.cart.validation.iscartvalid = false;
      if ($scope.toATS) {
        $timeout.cancel($scope.toATS);
      }

      $scope.toATS = $timeout(function() {
        $scope.validateCart();
      }, 1000);
    };

    /**
     * validate the annual sales volume
     * @method checkAnnualSalesVolume
     */
    $scope.checkAnnualSalesVolume = function() {

      var totalVol;
      if ($scope.transactionFormData.annualcardVolume && $scope.transactionFormData.telecheckVolume) {
        totalVol = parseFloat($scope.transactionFormData.annualcardVolume) + parseFloat($scope.transactionFormData.telecheckVolume);
        if ($scope.transactionFormData.amexVolume) {
          totalVol = totalVol + parseFloat($scope.transactionFormData.amexVolume);
        }
      } else {
        return;
      }

      if ($scope.transactionFormData.annualVolume > totalVol) {
        $scope.transactionInfoForm.sales.$setValidity('maxError', true);
      } else {
        $scope.transactionInfoForm.sales.$setValidity('maxError', false);
      }

    };

    ///////////////// MAIN ////////////////////////////////
    _init();

  }
]);;/**
 * validate if 2 fields are equal
 */
app.directive("compareTo", function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {
            ngModel.$validators.compareTo = function(modelValue) {
                var l = (typeof modelValue == 'undefined' ? '' : modelValue);
                var r = (typeof scope.otherModelValue == 'undefined' ? '' : scope.otherModelValue);
                return l.toLowerCase() == r.toLowerCase();
            };
            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
});
/**
 * Compare Numbers
 */
app.directive("compareNumTo", function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareNumTo"
        },
        link: function(scope, element, attributes, ngModel) {
            ngModel.$validators.compareNumTo = function(modelValue) {
                var l = (typeof modelValue == 'undefined' ? '' : modelValue);
                var r = (typeof scope.otherModelValue == 'undefined' ? '' : scope.otherModelValue);
                return l === r;
            };
            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
});

/**
 * toggle mobile menu
 */
app.directive("toggleMenu", function() {
    return function(scope, element, attrs) {
        element.on('click', function() {
            $(attrs.toggleMenu).slideToggle();
        });
    };
});

/**
 * Sketch canvas
 */
app.directive("sketch", function() {
    return function(scope, element, attrs) {
        element.sketch();
    };
});

/**
 * Add Video Modal Directive
 */
app.directive("addVideoModal", function() {
    return function(scope, element, attrs) {
        element.on('click', function() {
            $(attrs.addVideoModal).modal('show');
            $(attrs.addVideoModal).on('hidden.bs.modal', function() {
                $(attrs.addVideoModal + ' iframe').attr("src", $(attrs.addVideoModal + ' iframe').attr("src"));
                var video = $(attrs.addVideoModal + ' video')[0];
                if (video && !video.paused) {
                    video.pause();
                }
            });
        });
    };
});

/**
 * Open Video Directive
 */
app.directive("openVideo", function() {
    return function(scope, element, attrs) {
        element.YouTubePopup({
            autoplay: true,
            draggable: false,
            title: 'Clover Overview',
            useYoutTubeTitle: false
        });
    };
});

/**
 * Scroll links
 */
app.directive("scrollLinks", ['$timeout', function($timeout) {
    return function(scope, element, attrs) {
        $timeout(function() {
            var quicklinkPosition = element.offset();
            $(window).scroll(function() {
                if ($(window).scrollTop() > quicklinkPosition.top) {
                    element.css('position', 'fixed').css('top', '0');
                } else {
                    element.css('position', 'static');
                }
            });
        }, false);
    };
}]);

/**
 * Use select2 plugin
 */
app.directive("useSelect2", function() {
    return function(scope, element, attrs) {
        element.select2({
            placeholder: attrs.placeholder
        });
    };
});

/**
 * init breadcrumb
 */
app.directive("breadcrumb", function($window) {
    return function(scope, element, attrs) {
        var sticky_relocate = function() {
            var window_top = $(window).scrollTop();
            var div_top = $('#breadcrumb-anchor').offset().top;
            if (window_top > div_top) {
                element.addClass('stick');
                $('#breadcrumb-anchor').height($('#breadcrumb').outerHeight());
            } else {
                element.removeClass('stick');
                $('#breadcrumb-anchor').height(0);
            }
        };
        if (!parseInt(attrs.nostick)) {
            $(window).scroll(sticky_relocate);
            sticky_relocate();
        }
        $('.breadcrumb-mobile a', element).click(function() {
            $('.breadcrumb-inner ul', element).slideToggle();
            $(this).children('span').toggle();
            $(this).children('i').toggleClass('fa-chevron-down fa-chevron-up');
        });
        $(window).resize(function() {
            if ($window.innerWidth >= 800) {
                $('.breadcrumb-inner ul', element).show();
            } else {
                $('.breadcrumb-inner ul', element).hide();
                $('.breadcrumb-mobile a span', element).show();
                $('.breadcrumb-mobile a i', element).addClass('fa-chevron-down').removeClass('fa-chevron-up');
            }
        });
    };
});

/**
 * Format SSN
 */
app.directive('ssnField', function($filter) {
    var ssnFilter, ssnReverse;
    ssnFilter = $filter('ssnFilter');
    ssnReverse = $filter('ssnReverse');
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            var formatter, mask, parser;
            mask = attrs.ssnFieldMask;
            formatter = function(value) {
                return ssnFilter(value);
            };
            parser = function(value) {
                var formatted;
                formatted = ssnReverse(value);
                element.val(ssnFilter(formatted));
                setTimeout(function() {
                    var strLength = ssnFilter(formatted).length;
                    element[0].focus();
                    element[0].setSelectionRange(strLength, strLength);
                }, 10);
                return formatted;
            };
            modelCtrl.$formatters.push(formatter);
            return modelCtrl.$parsers.unshift(parser);
        }
    };
});

/**
 * Use Autocomplete
 */
app.directive('autoComplete', function($timeout) {
    return function(scope, el, attr) {
        el.autocomplete({
            source: scope[attr.uiItems],
            select: function() {
                $timeout(function() {
                    el.trigger('input');
                }, 0);
            }
        });
    };
});

/**
 * Format phone
 */
app.directive('formatPhone', function($filter) {
    var phoneFilter, phoneReverse;
    phoneFilter = $filter('phoneFilter');
    phoneReverse = $filter('phoneReverse');
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            var formatter, parser;
            formatter = function(value) {
                return phoneFilter(value);
            };
            parser = function(value) {
                var formatted;
                formatted = phoneReverse(value);
                element.val(phoneFilter(formatted));
                setTimeout(function() {
                    var strLength = phoneFilter(formatted).length;
                    element[0].focus();
                    element[0].setSelectionRange(strLength, strLength);
                }, 10);
                return formatted;
            };
            modelCtrl.$formatters.push(formatter);
            return modelCtrl.$parsers.unshift(parser);
        }
    };
});

/**
 * Format Number
 */
app.directive('formatNum', function($filter) {
    var numFilter = $filter('number');
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            var formatter, parser;
            formatter = function(value) {
                return numFilter(value);
            };
            parser = function(value) {
                var formatted;
                var val = value.split('.');
                var decimals = val[1] != undefined ? '.'+val[1] : '';
                formatted = val[0].replace(/\D/g, "")+decimals;
                if(decimals != '.')
                    element.val(numFilter(formatted));
                return parseFloat(formatted);
            };
            modelCtrl.$formatters.push(formatter);
            return modelCtrl.$parsers.unshift(parser);
        }
    };
});

/**
 * Validate if element is more than ng-min value
 */
app.directive('ngMin', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
            function isEmpty(value) {
                return angular.isUndefined(value) || value === '' || value === null || value !== value;
            }
            scope.$watch(attr.ngMin, function() {
                ctrl.$setViewValue(ctrl.$viewValue);
            });
            ctrl.$validators.ngMin = function(value) {
                var minVal = parseFloat(attr.ngMin) || 0;
                return ctrl.$isEmpty(value) || angular.isUndefined(minVal) || value >= minVal;
            };
            attr.$observe('min', function(val) {
                ctrl.$validate();
            });
            var minValidator = function(value) {
                var min = parseFloat(attr.ngMin) || 0;//scope.$eval(attr.ngMin) || 0;
                if (!isEmpty(value) && value >= min) {
                    ctrl.$setValidity('ngMin', true);
                    return value;
                } else {
                    ctrl.$setValidity('ngMin', false);
                    return value;
                }
            };
            ctrl.$parsers.push(minValidator);
            ctrl.$formatters.push(minValidator);
        }
    };
});

/**
 * Validate if element is less than ng-max value
 */
app.directive('ngMax', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
            function isEmpty(value) {
                return angular.isUndefined(value) || value === '' || value === null || value !== value;
            }
            scope.$watch(attr.ngMax, function() {
                ctrl.$setViewValue(ctrl.$viewValue);
            });
            ctrl.$validators.ngMax = function(value) {
                var maxVal = parseFloat(attr.ngMax) || Infinity;
                return ctrl.$isEmpty(value) || angular.isUndefined(maxVal) || value <= maxVal;
            };
            attr.$observe('max', function(val) {
                ctrl.$validate();
            });
            var maxValidator = function(value) {
                var max = parseFloat(attr.ngMax) || Infinity;//scope.$eval(attr.ngMax) || Infinity;
                if (!isEmpty(value) && value <= max) {
                    ctrl.$setValidity('ngMax', true);
                    return value;
                } else {
                    ctrl.$setValidity('ngMax', false);
                    return value;
                }
            };
            ctrl.$parsers.push(maxValidator);
            ctrl.$formatters.push(maxValidator);
        }
    };
});

/**
 * place decimals
 */
app.directive('decimalPlaces', function($parse, $filter) {
    return {
        require: 'ngModel',
        scope: {
            modelValue: '=ngModel'
        },
        link: function(scope, ele, attrs, ngModel) {
            ngModel.$setViewValue($filter('decimalConvert')(scope.modelValue));
            ngModel.$render();
            ele.bind('keypress', function(e) {
                var newVal = $(this).val() + (e.charCode !== 0 ? String.fromCharCode(e.charCode) : '');
                if ($(this).val().search(/(.*)\.[0-9][0-9][0-9][0-9][0-9]/) === 0 && newVal.length > $(this).val().length) {
                    e.preventDefault();
                }
            });
            ele.bind('focusout', function(e) {
                if(scope.modelValue)
                    ngModel.$setViewValue($filter('decimalConvert')(scope.modelValue));
                ngModel.$render();
            });
        }
    };
});

/**
 * Check if touch if ended
 */
app.directive('myTouchend', [function() {
    return function(scope, element, attr) {
        element.on('touchend', function(event) {
            scope.$apply(function() {
                scope.$eval(attr.myTouchend);
            });
        });
    };
}]);

/**
 * redirect to url
 */
app.directive('goTo', ['$location', '$timeout', function($location, $timeout) {
    return {
        link: function(scope, element, attrs) {
            element.on('click', function() {
                $timeout(function() {
                    $location.path(attrs.goTo);
                });
            });
        }
    }
}]);

/**
 * validate web field of signup form
 */
app.directive('angWebValidate', function() {
    return {
        restrict: 'A',
        scope: {
            internet: "=",
        },
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
            scope.$watch("internet", function() {
                ctrl.$validate();
            });
            ctrl.$validators.WebValidate = function(modelValue) {
                if (!parseInt(scope.internet)) {
                    return true;
                }
                if (modelValue && modelValue.length) {
                    return true;
                }
                return false;
            };
        }
    };
});;/*! =======================================================================
 * Fancyfy Fields: fancyfy-fields.js v1.0.0
 * ========================================================================
 * Copyright 2016 Judit Hummel
 * ======================================================================== */

app.directive("fancyField", function($timeout){
  return {
    scope: {
      modelValue: '=ngModel'
    },
    
    link: function(scope, element, attrs) {
      
      $timeout(function() {
        
        
        var fancyField = element;
        
        var fancyInput = fancyField.find('input[type=text],input[type=password],input[type=email],input[type=number],input[type=tel]');
        var fancySelect = fancyField.find('select');
        var fancyFields = fancyInput.add(fancySelect);
        
        // focus and blur
        fancyFields.focus(function() {
          $(this).parent('.fancy-field').addClass('focused');
        });
        fancyFields.blur(function() {
          $(this).parent('.fancy-field').removeClass('focused');
        });
        // insert faux placeholder to each .fancy-field element
        // check if field already has a value, if yes then initialize with faux placeholder visible
        fancyFields.each(function() {
          // create faux placeholder for <input> element
          if ($(this).is('input')) {
            var palceHolderText = $(this).attr('placeholder');
            if ($(this).val() != '') {
              $(this)
              .addClass('hasvalue')
              .parent('.fancy-field').addClass('active');
            } else {
              $(this)
              .removeClass('hasvalue')
              .parent('.fancy-field').removeClass('active');
            }
            
            // create faux placeholder for <select> element
          } else if ($(this).is('select')) {
            var palceHolderText = $(this).attr('placeholder');
            if ($(this).val() !== '') {
              $(this)
              .addClass('hasvalue')
              .parent('.fancy-field').addClass('active');
            } else {
              $(this)
              .removeClass('hasvalue')
              .parent('.fancy-field').removeClass('active');
            }
          }
          
          // add faux placeholder to element
          var fancyLabel = '<span>' + palceHolderText + '</span>';
          $(this).before(fancyLabel);
          
        });
        
        // basic JS throttle function
        function throttle(fn, threshhold, scope) {
          threshhold || (threshhold = 250);
          var last,
          deferTimer;
          return function () {
            var context = scope || this;
            var now = +new Date,
            args = arguments;
            if (last && now < last + threshhold) {
              clearTimeout(deferTimer);
              deferTimer = setTimeout(function () {
                last = now;
                fn.apply(context, args);
              }, threshhold);
            } else {
              last = now;
              fn.apply(context, args);
            }
          };
        }
        
        // show/hide <input> element faux placeholder when user types/deletes
        // use JS throttle to prevent animation jitter during typing
        fancyInput.keyup(throttle(function(){
          if ($(this).val()) {
            $(this)
            .addClass('hasvalue')
            .parent('.fancy-field').addClass('active');
          } else {
            $(this)
            .removeClass('hasvalue')
            .parent('.fancy-field').removeClass('active');
          }
        },300)); // set to same time as css transition-duration
        fancyInput.on('change', function(){
          if ($(this).val()) {
            $(this)
              .addClass('hasvalue')
              .parent('.fancy-field').addClass('active');
          } else {
            $(this)
              .removeClass('hasvalue')
              .parent('.fancy-field').removeClass('active');
          }
        });
        
        // show/hide <select> element faux placeholder on change
        fancySelect.change(function() {
          if ($(this).val() !== '') {
            $(this)
            .addClass('hasvalue')
            .parent('.fancy-field').addClass('active');
          } else {
            $(this)
            .removeClass('hasvalue')
            .parent('.fancy-field').removeClass('active');
          }
        });
      }, 0);
    
  }};
});
;/**
 * Number dollar filter
 */
app.filter('numberDollar', ['$filter', function($filter) {
  return function(number, fractionSize) {
    if (!isNaN(parseFloat(number)) && isFinite(number)) {
      return '$' +  $filter('numberNF')(number, fractionSize);
    } 
    return number;
  };
}]);

/**
 * Number no franction
 */
app.filter('numberNF', ['$filter', function($filter) {
  return function(number, fractionSize) {
    if (Math.floor(number) == number) {
      return $filter('number')(number, 0);
    }
    return $filter('number')(number, fractionSize);
  };
}]);

/**
 * Limit string length and add ellipsis at the end
 */
app.filter('limitToEllipsis', ['$filter', function($filter) {
  return function(input, limit, begin, maxRes) {
    if (!maxRes || window.matchMedia('(max-width: ' + maxRes + 'px)').matches) {
      var str = $filter('limitTo')(input, limit, begin);
      
      if (null != input && str.length < input.length) {
        str += '...';
      } 
    } else {
      var str = input;
    }
    
    return str;
  };
}]);

/**
 * Create range
 */
app.filter('range', function() {
  return function(input, start, end) {
    start = parseInt(start);
    end = parseInt(end);
    if (start > end) {
      for (var i = start; i >= end; i--) {
        input.push(i);
      }
    } else {
      for (var i = start; i <= end; i++) {
        input.push(i);
      }
    }
    return input;
  };
});

/**
 * Create range of string
 */
app.filter('range_s', function() {
  return function(input, start, end) {
    start = parseInt(start);
    end = parseInt(end);
    if (start > end) {
      for (var i = start; i >= end; i--) {
        input.push(i.toString());
      }
    } else {
      for (var i = start; i <= end; i++) {
        input.push(i.toString());
      }
    }
    return input;
  };
});

/**
 * return months list
 */
app.filter('monthName', [function() {
  return function (monthNumber) { //1 = January
      var monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December' ];
      return monthNames[monthNumber - 1];
  }
}]);

/**
 * Filter to check if object is empty
 */
app.filter('isEmpty', [function() {
  return function (obj) {
     return !obj || !Object.keys(obj).length;
  }
}]);

/**
 * set trustAsResourceUrl
 */
app.filter('trustAsResourceUrl', ['$sce', function($sce) {
  return function(val) {
    return $sce.trustAsResourceUrl(val);
  };
}]);

/**
 * format phone number
 */
app.filter('tel', function () {
  return function (tel) {
      if (!tel) { return ''; }

      var value = tel.toString().trim().replace(/^\+/, '');

      if (value.match(/[^0-9]/)) {
          return tel;
      }

      var country, city, number;

      switch (value.length) {
          case 10: // +1PPP####### -> C (PPP) ###-####
              country = 1;
              city = value.slice(0, 3);
              number = value.slice(3);
              break;

          case 11: // +CPPP####### -> CCC (PP) ###-####
              country = value[0];
              city = value.slice(1, 4);
              number = value.slice(4);
              break;

          case 12: // +CCCPP####### -> CCC (PP) ###-####
              country = value.slice(0, 3);
              city = value.slice(3, 5);
              number = value.slice(5);
              break;

          default:
              return tel;
      }
      if (country == 1) {
          country = "";
      }

      number = number.slice(0, 3) + '-' + number.slice(3);

      return (country + "("+ city + ") " + number).trim();
  };
});

/**
 * get length of object
 */
app.filter('lengthOfObject', function() {
  return function(obj) {
    if ('object' !== typeof obj || obj === null) {
      return null;
    }
    return Object.keys(obj).length;
 }
});

/**
 * Validate SSN number format
 */
app.filter('ssnFilter', function() {
  return function(value, mask) {
    var len, val;
    if (mask == null) {
      mask = false;
    }
    if (value) {
      val = value.toString().replace(/\D/g, "");
      len = val.length;
      if (len < 4) {
        return val;
      } else if ((3 < len && len < 6)) {
        if (mask) {
          return "***-" + (val.substr(3));
        } else {
          return (val.substr(0, 3)) + "-" + (val.substr(3));
        }
      } else if (len > 5) {
        if (mask) {
          return "***-**-" + (val.substr(5, 4));
        } else {
          return (val.substr(0, 3)) + "-" + (val.substr(3, 2)) + "-" + (val.substr(5, 4));
        }
      }
    }
    return value;
  }
});

/**
 * Reverse SSN
 */
app.filter("ssnReverse", function() {
  return function(value) {
    if (!!value) {
      return value.replace(/\D/g, "").substr(0, 9);
    }
    return value;
  };
});

/**
 * Set number of fixed length
 */
app.filter('numberFixedLen', function () {
  return function (n, len) {
    var num = parseInt(n, 10);
    len = parseInt(len, 10);
    if (isNaN(num) || isNaN(len)) {
        return n;
    }
    num = '' + num;
    while (num.length < len) {
        num = '0'+num;
    }
    return num;
  };
});

/**
 * get array started from some number
 */
app.filter('startFrom', function () {
	return function (input, start) {
		if (input) {
			start = +start;
			return input.slice(start);
		}
		return [];
	};
});

/**
 * Filter phone
 */
app.filter('phoneFilter', function() {
  return function(value) {
    var len, val;
    if (value) {
      val = value.toString().replace(/\D/g, "");
      len = val.length;
      if (len < 4) {
        return  val;
      } else if ((3 < len && len < 7)) {
          return "(" + (val.substr(0, 3)) + ") " + (val.substr(3));
      } else if (len > 6) {
          return "(" + (val.substr(0, 3)) + ") " + (val.substr(3, 3)) + "-" + (val.substr(6, 4));
      }
    }
    return value;
  }
});

/**
 * Reformat phone number
 */
app.filter('phoneDisplay', function() {
  return function(value) {
    var len, val;
    if (value) {
      val = value.toString().replace(/\D/g, "");
      len = val.length;
      if (len < 4) {
        return  val;
      } else if ((3 < len && len < 7)) {
          return "(" + (val.substr(0, 3)) + ") " + (val.substr(3));
      } else if (len > 6) {
          return "(" + (val.substr(0, 3)) + ") " + (val.substr(3, 3)) + "-" + (val.substr(6, 4));
      }
    }
    return value;
  }
});

/**
 * Reverse phone number
 */
app.filter("phoneReverse", function() {
  return function(value) {
    if (!!value) {
      return value.replace(/\D/g, "").substr(0, 10);
    }
    return value;
  };
});

/**
 * Slice array
 */
app.filter('slice', function() {
  return function(arr, start, end) {
    return (arr || []).slice(start, end);
  };
});

/**
 * Convert decimal to string
 */
app.filter('decimalConvert', function() {
  
  return function(input) {
    if (undefined == input) {
      return 0;
    }
    var str = input.toString();
    var result;
    var n =str.toString().indexOf(".");
    if(n<0){
      result = str+".00"
      return result;
    }
    
    var afterDecimal=str.substring(n+1,str.length);
    var beforeDecimal=str.substring(0,n);
    if(afterDecimal.length==1){
      afterDecimal=afterDecimal+'0';
      result=beforeDecimal+'.'+afterDecimal;
      return result ;
    }
    
    if(afterDecimal.length>5)
    {
      afterDecimal=afterDecimal.substring(0,5);
    }
    
    afterDecimal=afterDecimal.split('');
    for(var i=afterDecimal.length-1;i>=0;i--){
      if(i>1 && parseInt(afterDecimal[i])<1){
        afterDecimal.splice(i, 1);
      }else{
        break;
      }
    }
    if(afterDecimal instanceof Array){
      afterDecimal=afterDecimal.join("")
    }
    result=beforeDecimal+'.'+afterDecimal;
    return result;
    
  }
});

/**
 * Sort object elements
 */
app.filter('orderByObj', function() {
  return function(items, field, reverseOrder) {
    reverseOrder = reverseOrder ? -1 : 1;

    if ((field.charAt(0) == '+' || field.charAt(0) == '-')) {
      reverseOrder = field.charAt(0) == '-' ? -1 : 1;
      field = field.substring(1);
    }

    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1) * reverseOrder;
    });

    var newItems = {};

    for (var i = 0; i < filtered.length; i++) {
      newItems[filtered[i][field]] = filtered[i];
    }
    return newItems;
  };
});

/**
 * Trusted HTML content
 */
app.filter('to_trusted', ['$sce', function($sce){
  return function(text) {
    return $sce.trustAsHtml(text);
  };
}]);

/**
 * Order By ParentOrder
 */
app.filter('orderByParentOrder', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    for(var i=0; i<filtered.length;i++){
        filtered[i].parentOrder = filtered[i][0].parentOrder;
    }
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
});
;/**
 * FD App Services
 */
app.service('fdService', ['$http', '$filter', '$window', '$cacheFactory', 'CONST', '$timeout', '$rootScope',
  function($http, $filter, $window, $cacheFactory, CONST, $timeout, $rootScope) {


    // Prefix for urls. Empty for now
    var urlPrefix = '';

    // Cache Factory Object
    var cache = $cacheFactory('fd');

    // Cart name in session storage
    var storage_cart = 'cart_s';

    // Order Id name in session storage
    var order_id = 'order_id';

    // Temp Order Id name in session storage
    var tmp_order_id = 'tmp_order_id';

    // Category Id name session storage
    var category_id = 'category_id';

    // Ordered cart name in session storage
    var ordered_cart = 'cart_ordered';

    // Products list name in session storage
    var products_list = 'products_list';

    // Transaction Info name in session storage
    var transaction_info = 'transaction_info';

    // Equipment Pricing name in session storage
    var equipment_pricing = 'equipment_pricing';

    // Acquiring Pricing name in session storage
    var acquiring_pricing = 'acquiring_pricing';

    // Global Pricing name in session storage
    var global_pricing = 'global_pricing';

    // Geo Data name in session storage
    var geo_data = 'geo_data';

    // Shipping options in session storage
    var shipping_options = 'shipping_options';

    /**
     * recursively change to upper object data
     * @method changeToUpper
     * @param data
     * @return {Object} data
     */
    function changeToUpper(data) {
      for (var key in data) {
        if (!data.hasOwnProperty(key)) continue;
        if (typeof data[key] == "string") {
          data[key] = data[key].toUpperCase();
        } else if (typeof data[key] != "object" || typeof data[key] != "array") {
          data[key] = changeToUpper(data[key]);
        }
      }
      return data;
    }

    /**
     * Get Categories list
     * @method getCategories
     * @return {HTTPPromise}
     */
    this.getCategories = function() {
      return $http.get(urlPrefix + '/marketplace/v1/categories');
    };

    /**
     * Get Product Line Items
     * @method getProductLineItems
     * @param {} id
     * @return {HTTPPromise}
     */
    this.getProductLineItems = function(id) {
      return $http.get(urlPrefix + '/marketplace/v1/application/' + id + '/lineItems/');
    };

    /**
     * Get category codes
     * @method getMccCodes
     * @param {} category
     * @return {HTTPPromise}
     */
    this.getMccCodes = function(category) {
      return $http.get(urlPrefix + '/marketplace/v1/categories/' + category + '/industries/');
    };

    /**
     * Get MCC codes by type
     * @method getMccTypes
     * @param {} category
     * @param {} type
     * @return {HTTPPromise}
     */
    this.getMccTypes = function(category, type) {
      return $http.get(urlPrefix + '/marketplace/v1/categories/' + category + '/industries/' + type + '/merchantcategorycodes/');
    };

    /**
     * Get Product
     * @method getProduct
     * @param {} pid
     * @return {HTTPPromise}
     */
    this.getProduct = function(pid) {
      return $http.get(urlPrefix + '/marketplace/v1/products/' + pid + '/details/');
    };

    /**
     * Get Recommended products
     * @method getRecommendedBundles
     * @param {number} id
     * @return {HTTPPromise}
     */
    this.getRecommendedBundles = function(id) {
      return $http.get(urlPrefix + '/marketplace/v1/products/'+ id + '/recommended/');
    };

    /**
     * Check Tin
     * @method checkTin
     * @param {} data
     * @return {HTTPPromise}
     */
    this.checkTin = function(data) {
      return $http.post(urlPrefix + '/marketplace/v1/tin/validate', data);
    };

    /**
     * Get Bank Name
     * @method getBankName
     * @param {} data
     * @return {HTTPPromise}
     */
    this.getBankName = function(data) {
      return $http.post(urlPrefix + '/marketplace/v1/banks/validate', data, {timeout : 3000});
    };

    /**
     * Description
     * @method getTitles
     * @param {} data
     * @return {HTTPPromise}
     */
    this.getTitles = function(data) {
      return $http.post(urlPrefix + '/marketplace/v1/signup/titles', data);
    };

    /**
     * Description
     * @method validateContact
     * @param {} data
     * @return {HTTPPromise}
     */
    this.validateContact = function(data) {
      return $http.post(urlPrefix + '/marketplace/v1/validate/contact', data);
    };

    /**
     * Get all products
     * @method getAllProducts
     * @return {HTTPPromise}
     */
    this.getAllProducts = function() {
      var self = this;
      var ret = {
        success: function() {
          return this;
        },
        error: function(callback) {
          return this;
        },
      };
      var data = this.getProductListFromSession();

      if (data) {
        ret.success = function(callback) {
          callback.apply(this, [data, 200]);
          return this;
        };

      } else {
        var res = $http({method: 'GET', cache: true, url: urlPrefix + '/marketplace/v1/products/'});
        ret.error = res.error;
        ret.success = function(callback) {
          res.success(function(data, status, headers, config) {
            self.storeProductListSession(data);
            callback.apply(this, [data, status, headers, config]);
          });
          return this;
        };
      }
      return ret;
    };

    /**
     * Get Product Features
     * @method getFeatures
     * @param {} id
     * @return {HTTPPromise}
     */
    this.getFeatures = function(id) {
      return $http.get(urlPrefix + '/marketplace/v1/products/' + id + '/features/');
    };

    /**
     * Get Product specifications
     * @method getSpecs
     * @param {} id
     * @return {HTTPPromise}
     */
    this.getSpecs = function(id) {
      return $http.get(urlPrefix + '/marketplace/v1/products/' + id + '/specs/');
    };

    /**
     * Get Included Products
     * @method getProductsList
     * @param {} pid
     * @return {HTTPPromise}
     */
    this.getProductsList = function(pid) {
      return $http.get(urlPrefix + '/marketplace/v1/products/' + pid + '/includes/');
    };

    /**
     * Get Product FAQ list
     * @method getFaqs
     * @param {} pid
     * @return {HTTPPromise}
     */
    this.getFaqs = function(pid) {
      return $http.get(urlPrefix + '/marketplace/v1/products/' + pid + '/faq/');
    };

    /**
     * Get Product Options
     * @method getProductOptions
     * @param {} pid
     * @return {HTTPPromise}
     */
    this.getProductOptions = function(pid) {
      return $http.get(urlPrefix + '/marketplace/v1/products/' + pid + '/options/');
    };

    /**
     * Get Data By Ip
     * @method getDataByIp
     * @return {HTTPPromise}
     */
    this.getDataByIp = function() {
      return $http.get(urlPrefix + '/marketplace/v1/zipcode/');
    };

    /**
     * Get Taxes
     * @method getTaxes
     * @param {} zip
     * @param {} city
     * @return {HTTPPromise}
     */
    this.getTaxes = function(zip, city) {
      return $http.get(urlPrefix + '/marketplace/v1/salestax/' + zip + '/' + city);
    };

    /**
     * Service to validate a cart
     * @method validateCart
     * @param {} cart
     * @param {} ti
     * @return {HTTPPromise}
     */
    this.validateCart = function(cart, ti) {
      ti = ti || this.getTransactionInfo();
      var category = this.getCategoryFromSession();

      var categoryName = category ? category.name : ti.category;
      var data = {
        merchant: "",
        cartdetails: [],
        transactionInfo: {
          mccTypes: ti.mccTypes || '',
          mcc: ti.mcc || null,
          annualVolume: ti.annualVolume || null,
          averageTicket: ti.averageTicket || null,
          amexVolume: ti.amexVolume || null,
          amexMemberId: ti.amexMemberId || null,
          highestTicket: ti.highestTicket || null,
          category: categoryName || null
        }
      };

      if (Object.keys(cart.data).length) {
        for (var i in cart.data) {
          data.cartdetails.push(
            {
            "productId": cart.data[i].id,
            "category": cart.data[i].category,
            }
          );
        }
      }

      if (cart.payment_types && Object.keys(cart.payment_types.products).length) {
        for (var i in cart.payment_types.products) {
          data.cartdetails.push(
            {
            "productId": cart.payment_types.products[i].id,
            "category": cart.payment_types.products[i].category,
            }
          );
        }

      }

      if (cart.transaction_products && cart.transaction_products.length) {
        for (var i in cart.transaction_products) {
          data.cartdetails.push(
              {
            "productId": cart.transaction_products[i].id,
            "category": cart.transaction_products[i].category,
              }
          );
        }

      }

      return $http.post(urlPrefix + '/marketplace/v2/cart/validate', data);
    };

    /**
     * Get signed order information
     * @method getMerchantInfo
     * @param {} orderId
     * @return {HTTPPromise}
     */
    this.getMerchantInfo = function(orderId) {
      return $http.get(urlPrefix + '/marketplace/v1/contracts/' + orderId + '/agreement/');
    };

    /**
     * Get signed order signatures
     * @method getMerchantSignatures
     * @param {} orderId
     * @return {HTTPPromise}
     */
    this.getMerchantSignatures = function(orderId) {
      return $http.get(urlPrefix + '/marketplace/v1/contracts/' + orderId + '/signatures/');
    };

    /**
     * Get equipment pricing list
     * @method getEquipmentPricing
     * @param {} cart
     * @param {} ti
     * @return {HTTPPromise}
     */
    this.getEquipmentPricing = function(cart, ti) {

      ti = ti || this.getTransactionInfo();
      data = {
        "transactionInfo": ti,
        "cardNotPresent": cart.cardNotPresent,
        "cartDetails": []
      };

      if (cart.data && cart.data.length) {
        for (var i in cart.data) {
          data.cartDetails.push({
            "productId": cart.data[i].id,
            "name": cart.data[i].name,
            "price": cart.data[i].price,
            "type": cart.data[i].productType,
            "term": cart.data[i].term,
            "category": cart.data[i].category,
            "qty": cart.data[i].qty
          });
        }
      }

      return $http.post(urlPrefix + '/marketplace/v2/pricing/equipment', data);
    };

    /**
     * Get global pricing list
     * @method getGlobalPricing
     * @return {HTTPPromise}
     */
    this.getGlobalPricing = function() {
      data = {};
      return $http.post(urlPrefix + '/marketplace/v1/pricing/global', data);
    };

    /**
     * Get acquiring pricing list
     * @method getAcquiringPricing
     * @param {} cart
     * @param {} ti
     * @return {HTTPPromise}
     */
    this.getAcquiringPricing = function(cart, ti) {
      ti = ti || this.getTransactionInfo();

      data = {
        "transactionInfo": ti,
        "cardNotPresent": cart.cardNotPresent,
        "cartDetails": []
      };

      if (cart.data && cart.data.length) {
        for (var i in cart.data) {
              data.cartDetails.push(
                  {
            "productId": cart.data[i].id,
            "category": cart.data[i].category,
            // "cardNotPresent": false,
            "productType": cart.data[i].productType
                  }
              );
        }
      }

      if (cart.payment_types && Object.keys(cart.payment_types.products).length) {
        for (var i in cart.payment_types.products) {
          data.cartDetails.push(
            {
            "productId": cart.payment_types.products[i].id,
            "category": cart.payment_types.products[i].category,
            // "cardNotPresent": false,
            "productType": cart.payment_types.products[i].type
            }
          );
        }

      }

      if (cart.transaction_products && cart.transaction_products.length) {
        for (var i in cart.transaction_products) {
          data.cartDetails.push(
              {
            "productId": cart.transaction_products[i].id,
            "category": cart.transaction_products[i].category,
            // "cardNotPresent": false,
            "productType": cart.transaction_products[i].type
              }
          );
        }

      }

      return $http.post(urlPrefix + '/marketplace/v2/pricing/acquiring', data);
    };

    /**
     * Review Order
     * @method reviewOrder
     * @param orderId
     * @param cd
     * @param cart
     * @param user
     * @param ti
     * @param ap
     * @param ep
     * @param gp
     * @return {HTTPPromise}
     */
    this.reviewOrder = function(orderId, cd, cart, user, ti, ap, ep, gp) {

      cart = cart || orderId ? this.getOrderedCart(orderId) : this.getCart();
      ti = ti || this.getTransactionInfo();
      ap = ap || this.getAcquiringPricingStorage();
      ep = ep || this.getEquipmentPricingStorage();
      gp = gp || this.getGlobalPricingStorage();

      var pricingDetails = [];
      var discountRates = ap.discountRates !== undefined ? ap.discountRates : [];
      ep = ep !== undefined ? ep : [];
      gp = gp !== undefined ? gp : [];

      pricingDetails = pricingDetails.concat(discountRates);
      pricingDetails = pricingDetails.concat(ep);
      pricingDetails = pricingDetails.concat(gp);

      var cardPresentDiscountRates = ap.cardPresentDiscountRates !== undefined ? ap.cardPresentDiscountRates : [];
      var cardNotPresentDiscountRates = ap.cardNotPresentDiscountRates !== undefined ? ap.cardNotPresentDiscountRates : [];

      var cartDetails = {
        data: [],
        amount: cart.amount,
        shipping_amount: cart.shipping_amount,
        tax: cart.tax,
        taxPercent: cart.taxPercent,
        total: cart.total,
        status: 0,
        monthly: [],
        shipping_option_id: cart.shipping_option_id,
        numberofLocations: cart.num_locations_selected,
        purchaseEnabled: true,
        total_qty: cart.total_qty,
      };

      for (var i in cart.data) {
        cartDetails.data.push({
          id: cart.data[i].id,
          name: cart.data[i].name,
          price: cart.data[i].price,
          monthly: [],
          term: cart.data[i].term,
          category: cart.data[i].category,
          qty: cart.data[i].qty,
          productType: cart.data[i].productType,
        });
      }

      //send Shipping details
      //var shippingMethods = this.getSessionShippingMethods();
      var shipProduct = CONST.SHIPPING_METHODS[cart.shipping_option_id];
      if (shipProduct !== undefined && (cart.amount > 0 || cart.lease_amount > 0)) {
        cartDetails.data.push({
          id: shipProduct.productId,
          name: shipProduct.productName,
          price: shipProduct.price,
          monthly: [],
          term: 'P',
          qty: 1,
          category: cart.data[0].category,
          productType: shipProduct.productType
        });
      }

      for (var i in cart.payment_types.products) {
        cartDetails.data.push({
          id: cart.payment_types.products[i].id,
          name: cart.payment_types.products[i].name,
          price: cart.payment_types.products[i].price,
          monthly: [],
          term: cart.payment_types.products[i].term,
          category: cart.payment_types.products[i].category,
          qty: cart.payment_types.products[i].qty,
          productType: cart.payment_types.products[i].type,
        });
      }

      for (var i in cart.transaction_products) {
        cartDetails.data.push({
          id: cart.transaction_products[i].id,
          name: cart.transaction_products[i].name,
          price: cart.transaction_products[i].price,
          monthly: [],
          term: cart.transaction_products[i].term,
          category: cart.transaction_products[i].category,
          qty: cart.transaction_products[i].qty,
          productType: cart.transaction_products[i].type,
        });
      }

      var transactionInfo = {
        mccTypes: ti.mccTypes,
        mcc: ti.mcc,
        annualVolume: ti.annualVolume,
        creditCardVolume: ti.annualcardVolume,
        telecheckVolume: ti.telecheckVolume,
        averageTicket: ti.averageTicket,
        highestTicket: ti.highestTicket,
        category: ti.category,
        amexMemberId: ti.amexMemberId,
        amexVolume: ti.amexVolume,
      };

      var data = {
        company: cart.shippingAddress[0].company_name,
        first_name: cart.shippingAddress[0].firstname,
        last_name: cart.shippingAddress[0].lastname,
        email: cart.shippingAddress[0].email,
        phone: cart.shippingAddress[0].phone,
        address1: cart.shippingAddress[0].address1,
        city: cart.shippingAddress[0].city,
        state: cart.shippingAddress[0].state,
        zip: cart.shippingAddress[0].zip,
        recordType: 'Lead',
        pricingDetails: pricingDetails,
        cardPresentDiscountRates: cardPresentDiscountRates,
        cardNotPresentDiscountRates: cardNotPresentDiscountRates,
        pricingOptions: {
          transactionInfo: transactionInfo,
        },
        shippingAddress: cart.shippingAddress,
        cardNotPresent: cart.cardNotPresent,
        cartDetails: cartDetails
      };

      var oid = orderId || this.getTmpOrderId();
      if (oid) {
        return $http.post(urlPrefix + '/marketplace/v1/merchantorders/' + oid + '/updateorder', data);
      } else {
        return $http.post(urlPrefix + '/marketplace/v1/merchantorders', data);
      }
    };

    /**
     * Submit signature
     * @method submitSignature
     * @param {} data
     * @return {HTTPPromise}
     */
    this.submitSignature = function(data) {
      return $http.post(urlPrefix + '/marketplace/v2/application/submit', data);
    };

    /**
     * Submit Merchant Application
     * @method submitMerchantApplication
     * @param {} data
     * @return {HTTPPromise}
     */
    this.submitMerchantApplication = function(data) {
      data = changeToUpper(data);
      return $http.post(urlPrefix + '/marketplace/v1/application/update', data);
    };

    /**
     * submit / place empty order
     * @method submitOrderEmpty
     * @return {HTTPPromise}
     */
    this.submitOrderEmpty = function() {
      var orderId = this.getOrderId();
      var data = {orderId: orderId};
      return $http.post(urlPrefix + '/marketplace/v1/merchantorders/' + orderId + '/updateorder', data);
    }

    /**
     * submit / place order
     * @method submitOrder
     * @param cartDetails
     * @return {HTTPPromise}
     */
    this.submitOrder = function(cartDetails) {

      var orderId = this.getOrderId();
      var cart = orderId ? this.getOrderedCart(orderId) : this.getCart();
      var ti = this.getTransactionInfo();
      var ap = this.getAcquiringPricingStorage();
      var ep = this.getEquipmentPricingStorage();
      var gp = this.getGlobalPricingStorage();

      var pricingDetails = [];
      var discountRates = ap.discountRates !== undefined ? ap.discountRates : [];
      ep = ep !== undefined ? ep : [];
      gp = gp !== undefined ? gp : [];

      pricingDetails = pricingDetails.concat(discountRates);
      pricingDetails = pricingDetails.concat(ep);
      pricingDetails = pricingDetails.concat(gp);

      var cardPresentDiscountRates = ap.cardPresentDiscountRates !== undefined ? ap.cardPresentDiscountRates : [];
      var cardNotPresentDiscountRates = ap.cardNotPresentDiscountRates !== undefined ? ap.cardNotPresentDiscountRates : [];

      if (!cartDetails) {
        var cartDetails = {
          data: [],
          amount: cart.amount,
          shipping_amount: cart.shipping_amount,
          tax: cart.tax,
          taxPercent: cart.taxPercent,
          total: cart.total,
          status: 0,
          monthly: [],
          shipping_option_id: cart.shipping_option_id,
          numberofLocations: cart.num_locations_selected,
          purchaseEnabled: true,
          total_qty: cart.total_qty,
        };

        for (var i in cart.data) {
          cartDetails.data.push({
            id: cart.data[i].id,
            name: cart.data[i].name,
            price: cart.data[i].price,
            monthly: [],
            term: cart.data[i].term,
            qty: cart.data[i].qty,
            category: cart.data[i].category,
            productType: cart.data[i].productType,
          });
        }

        //send Shipping details
        //var shippingMethods = this.getSessionShippingMethods();
        var shipProduct = CONST.SHIPPING_METHODS[cart.shipping_option_id];
        if (shipProduct !== undefined && (cart.amount > 0 || cart.lease_amount > 0)) {
          cartDetails.data.push({
            id: shipProduct.productId,
            name: shipProduct.productName,
            price: shipProduct.price,
            monthly: [],
            term: 'P',
            qty: 1,
            category: ti.category,
            productType: shipProduct.productType
          });
        }

        for (var i in cart.payment_types.products) {
          cartDetails.data.push({
            id: cart.payment_types.products[i].id,
            name: cart.payment_types.products[i].name,
            price: cart.payment_types.products[i].price,
            monthly: [],
            term: cart.payment_types.products[i].term,
            qty: cart.payment_types.products[i].qty,
            category: cart.payment_types.products[i].category,
            productType: cart.payment_types.products[i].type,
          });
        }

        for (var i in cart.transaction_products) {
          cartDetails.data.push({
            id: cart.transaction_products[i].id,
            name: cart.transaction_products[i].name,
            price: cart.transaction_products[i].price,
            monthly: [],
            term: cart.transaction_products[i].term,
            category: cart.transaction_products[i].category,
            qty: cart.transaction_products[i].qty,
            productType: cart.transaction_products[i].type,
          });
        }
      }

      var transactionInfo = {
        mccTypes: ti.mccTypes,
        mcc: ti.mcc,
        annualVolume: ti.annualVolume,
        creditCardVolume: ti.annualcardVolume,
        telecheckVolume: ti.telecheckVolume,
        averageTicket: ti.averageTicket,
        highestTicket: ti.highestTicket,
        category: ti.category,
        amexMemberId: ti.amexMemberId,
        amexVolume: ti.amexVolume,
      };

      var data = {
        orderId: orderId,
        company: cart.shippingAddress[0].company_name,
        first_name: cart.shippingAddress[0].firstname,
        last_name: cart.shippingAddress[0].lastname,
        email: cart.shippingAddress[0].email,
        phone: cart.shippingAddress[0].phone,
        address1: cart.shippingAddress[0].address1,
        city: cart.shippingAddress[0].city,
        state: cart.shippingAddress[0].state,
        zip: cart.shippingAddress[0].zip,
        recordType: 'Lead',
        pricingDetails: pricingDetails,
        cardPresentDiscountRates: cardPresentDiscountRates,
        cardNotPresentDiscountRates: cardNotPresentDiscountRates,
        pricingOptions: {
          transactionInfo: transactionInfo,
        },
        shippingAddress: cart.shippingAddress,
        cardNotPresent: cart.cardNotPresent,
        cartDetails: cartDetails
      };

      return $http.post(urlPrefix + '/marketplace/v1/merchantorders/' + orderId + '/updateorder', data);
    };

    /**
     * Store Order Id into session
     * @method storeOrderId
     * @param data
     */
    this.storeOrderId = function(data) {
      if (undefined == data) return;
      $window.sessionStorage.setItem(order_id, JSON.stringify(data));
    };

    /**
     * Clear Order Id From session
     * @method clearOrderId
     */
    this.clearOrderId = function() {
      $window.sessionStorage.removeItem(order_id);
    };

    /**
     * Get Order Id from session
     * @method getOrderId
     * @return {number} Order Id or false
     */
    this.getOrderId = function() {
      var data = $window.sessionStorage.getItem(order_id);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    /**
     * Description
     * @method storeTmpOrderId
     * @param {} data
     */
    this.storeTmpOrderId = function(data) {
      if (undefined == data) return;
      $window.sessionStorage.setItem(tmp_order_id, JSON.stringify(data));
    };

    /**
     * Description
     * @method clearTmpOrderId
     */
    this.clearTmpOrderId = function() {
      $window.sessionStorage.removeItem(tmp_order_id);
    };

    /**
     * Description
     * @method getTmpOrderId
     * @return OrderId or false
     */
    this.getTmpOrderId = function() {
      var data = $window.sessionStorage.getItem(tmp_order_id);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    /**
     * Store category information into session
     * @method storeCategoryInSession
     * @param data
     */
    this.storeCategoryInSession = function(data) {
      $window.sessionStorage.setItem(category_id, JSON.stringify(data));
    };

    /**
     * Clear category from session
     * @method clearCategoryFromSession
     */
    this.clearCategoryFromSession = function() {
      $window.sessionStorage.removeItem(category_id);
    };

    /**
     * Get category from session
     * @method getCategoryFromSession
     * @return {Object} Category or false
     */
    this.getCategoryFromSession = function() {
      var data = $window.sessionStorage.getItem(category_id);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    /**
     * Store products list in session
     * @method storeProductListSession
     * @param {Array} data
     */
    this.storeProductListSession = function(data) {
      $window.sessionStorage.setItem(products_list, JSON.stringify(data));
    };

    /**
     * Clear products list from session
     * @method clearProductListSession
     */
    this.clearProductListSession = function() {
      $window.sessionStorage.removeItem(products_list);
    };

    /**
     * get product list from session
     * @method getProductListFromSession
     * @return {Array} product list or false
     */
    this.getProductListFromSession = function() {
      var data = $window.sessionStorage.getItem(products_list);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    /**
     * Store Geo Data in cache
     * @method storeGeoData
     * @param data
     */
    this.storeGeoData = function(data) {
      cache.put(geo_data, data);
    };

    /**
     * Clear Geo Data from cache
     * @method clearGeoData
     */
    this.clearGeoData = function() {
      cache.put(geo_data, null);
    };

    /**
     * Get Geo Data from cache
     * @method getGeoData
     * @return GeoData
     */
    this.getGeoData = function() {
      return cache.get(geo_data);
    };

    /**
     * Store Cart in session
     * @method storeCart
     * @param cart
     */
    this.storeCart = function(cart) {
      window.sessionStorage.setItem(storage_cart, JSON.stringify(cart));
      $rootScope.$emit('cart-changed', cart);
    };

    /**
     * Store ordered cart in session
     * @method storeOrderedCart
     * @param order_id
     * @param cart
     */
    this.storeOrderedCart = function(order_id, cart) {
      var s = {};
      s[order_id] = cart
      window.sessionStorage.setItem(ordered_cart, JSON.stringify(s));
    };

    /**
     * Clear Cart from session
     * @method clearCart
     */
    this.clearCart = function() {
      window.sessionStorage.removeItem(storage_cart);
    };

    /**
     * Clear ordered cart from session
     * @method clearOrderedCart
     */
    this.clearOrderedCart = function() {
      window.sessionStorage.removeItem(ordered_cart);
    };

    /**
     * Get Cart From session or if empty create cart object
     * @method getCart
     * @return {Object} Cart
     */
    this.getCart = function() {
      var cart = window.sessionStorage.getItem(storage_cart);
      if (cart) {
        return JSON.parse(cart);
      }
      return {
        data: [],
        payment_types: null,
        amount: 0,
        lease_amount: 0,
        shipping_amount: 0,
        tax: 0,
        leaseTax: 0,
        taxPercent: -1,
        total: 0,
        status: 0,
        onetimeAmount: 0,
        mfeeAmount: 0,
        monthly: [],
        mFees: {},
        onetimeFees: {},
        shipping_option_id: 1,
        shippingAddress: [{}],
        validation: {},
        total_lease_qty: 0,
        total_product_fee_amount: 0,
        product_fees: {},
        transaction_products: [],
        // transaction_fee: null,
        total_qty: 0
      };
    };

    /**
     * Get ordered cart from session
     * @method getOrderedCart
     * @param order_id
     * @return Literal
     */
    this.getOrderedCart = function(order_id) {
      var carts = window.sessionStorage.getItem(ordered_cart);
      var cs, c;
      if (carts) {
        cs = JSON.parse(carts);
      }
      if (carts) {
        return cs[order_id];
      }
      return null;
    };

    /**
     * Store transaction info in session
     * @method storeTransactionInfo
     * @param data
     */
    this.storeTransactionInfo = function(data) {
      $window.sessionStorage.setItem(transaction_info, JSON.stringify(data));
    };

    /**
     * Clear transaction info from session
     * @method clearTransactionInfo
     */
    this.clearTransactionInfo = function() {
      $window.sessionStorage.removeItem(transaction_info);
    };

    /**
     * Get transaction info from session
     * @method getTransactionInfo
     * @return {boolean}
     */
    this.getTransactionInfo = function() {
      var data = $window.sessionStorage.getItem(transaction_info);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    /**
     * Store equipment pricing in session
     * @method storeEquipmentPricing
     * @param data
     */
    this.storeEquipmentPricing = function(data) {
      $window.sessionStorage.setItem(equipment_pricing, JSON.stringify(data));
    };

    /**
     * Clear equipment pricing from session
     * @method clearEquipmentPricing
     */
    this.clearEquipmentPricing = function() {
      $window.sessionStorage.removeItem(equipment_pricing);
    };

    /**
     * Get equipment pricing from session
     * @method getEquipmentPricingStorage
     * @return {Array}
     */
    this.getEquipmentPricingStorage = function() {
      var data = $window.sessionStorage.getItem(equipment_pricing);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    /**
     * Store acquiring pricing in session
     * @method storeAcquiringPricing
     * @param data
     */
    this.storeAcquiringPricing = function(data) {
      $window.sessionStorage.setItem(acquiring_pricing, JSON.stringify(data));
    };

    /**
     * Clear acquiring pricing from session
     * @method clearAcquiringPricing
     */
    this.clearAcquiringPricing = function() {
      $window.sessionStorage.removeItem(acquiring_pricing);
    };

    /**
     * Get acquiring pricing from session
     * @method getAcquiringPricingStorage
     * @return {Array}
     */
    this.getAcquiringPricingStorage = function() {
      var data = $window.sessionStorage.getItem(acquiring_pricing);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    /**
     * Store global pricing in session
     * @method storeGlobalPricing
     * @param data
     */
    this.storeGlobalPricing = function(data) {
      $window.sessionStorage.setItem(global_pricing, JSON.stringify(data));
    };

    /**
     * Clear global pricing from session
     * @method clearGlobalPricing
     */
    this.clearGlobalPricing = function() {
      $window.sessionStorage.removeItem(global_pricing);
    };

    /**
     * Get global pricing from session
     * @method getGlobalPricingStorage
     * @return {Array}
     */
    this.getGlobalPricingStorage = function() {
      var data = $window.sessionStorage.getItem(global_pricing);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    /**
     * Recalculate cart
     * @method recalculateCart
     * @param cart
     * @param taxAmt
     * @return cart
     */
    this.recalculateCart = function(cart, taxAmt) {

      var prev_num_locations = cart.num_locations;

      cart.amount = 0;
      cart.cardNotPresent = 0;
      cart.num_locations = 0;
      cart.num_locations_selected = cart.num_locations_selected || 0;
      cart.lease_amount = 0;
      cart.total_qty = 0;
      cart.total_lease_qty = 0;
      cart.total_purchase_qty = 0;
      cart.product_fees = {};
      cart.total_product_fee_amount = 0;
      //var shippingMethods = this.getSessionShippingMethods();

      var total_product_fee_amount = 0;
      var product_fees = {};

      var noproduct_fees = [];

      for (var i in cart.data) {

        cart.total_product_fee_amount = total_product_fee_amount;
        cart.product_fees = product_fees;

        if ('Terminal' == cart.data[i].productType || 'Gateway' == cart.data[i].productType || 'VAR' == cart.data[i].productType || 'TERM' == cart.data[i].productType) {
          cart.num_locations = cart.num_locations + cart.data[i].qty;
        }

        cart.data[i].min_lease_amount = 0;

        cart.total_qty += parseInt(cart.data[i].qty);

        cart.cardNotPresent |= (cart.data[i].cardNotPresent ? 2 : 1);

        if (CONST.PURCHASE_CODE == cart.data[i].term || CONST.OWNED_CODE == cart.data[i].term) {
          if (cart.data[i].pricingModel) {
            for (var j = 0; j < cart.data[i].pricingModel.length; j++) {
              if (CONST.PURCHASE_CODE != cart.data[i].pricingModel[j].purchaseType
                && CONST.OWNED_CODE != cart.data[i].pricingModel[j].purchaseType
                && cart.data[i].pricingModel[j].defaultAmt
                && (!cart.data[i].min_lease_amount || cart.data[i].pricingModel[j].defaultAmt < cart.data[i].min_lease_amount)) {
                cart.data[i].min_lease_amount = cart.data[i].pricingModel[j].defaultAmt;
              }
            }
          }
          if (cart.data[i].price) {
            cart.amount += cart.data[i].qty * cart.data[i].price;
          }
          cart.total_purchase_qty += parseInt(cart.data[i].qty);
          cart.data[i].pmodel = null;
        } else {
          var pmodel;
          if (cart.data[i].pricingModel) {
            for (var j = 0; j < cart.data[i].pricingModel.length; j++) {
              if (cart.data[i].pricingModel[j].purchaseType == cart.data[i].term) {
                pmodel = cart.data[i].pricingModel[j];
                break;
              }
            }
          }
          if (!pmodel) {
            console.log('no pricing model!!')
            return;
          }
          cart.data[i].pmodel = pmodel;
          cart.lease_amount += cart.data[i].qty * pmodel.defaultAmt;
          cart.total_lease_qty += parseInt(cart.data[i].qty);
        }
      }

      if (taxAmt) {
        cart.tax = taxAmt;
      } else {
        if (cart.taxPercent < 0) {
          cart.tax = 0;
        } else {
          cart.tax = cart.amount * cart.taxPercent;
          cart.leaseTax = cart.lease_amount * cart.taxPercent;
        }
      }

      if (cart.amount > 0 || cart.lease_amount > 0)
        cart.shipping_amount = CONST.SHIPPING_METHODS[cart.shipping_option_id].price;
      else
        cart.shipping_amount = 0;

      cart.total = cart.amount + cart.shipping_amount + cart.tax;

      // reset locations
      if (prev_num_locations !== cart.num_locations) {
        cart.num_locations_selected = 0;
      }

      if (1 === cart.num_locations) {
        cart.num_locations_selected = 1;
      }

      return cart;
    };

    /**
     * Reset Cart Pricing, if TransactionInfo available
     * @method resetCartOverridePricing
     * @param {} cart
     */
    this.resetCartOverridePricing = function(cart) {
      var ti = this.getTransactionInfo();
      if (!ti) {
        return;
      }
      for (var i in cart.data) {
        var p = cart.data[i];
        var isLeased = (p.term != CONST.PURCHASE_CODE && p.term != CONST.OWNED_CODE) ? true : false;
        if (!isLeased) {
          if (cart.data[i].defaultPrice)
            cart.data[i].price = cart.data[i].defaultPrice;
          }
          else{
              var idx = p.pricingModel_default.map(function(priceModel){ return priceModel.id; }).indexOf(p.pmodel.id);
          p.price = p.pricingModel_default[idx].defaultAmt;
          p.pricingModel[idx].defaultAmt = p.pricingModel_default[idx].defaultAmt;
        }
      }
    }

    /**
     * Lease product
     * @method leaseProduct
     * @param bundle product
     * @param cart
     * @param {} category
     * @return cart
     */
    this.leaseProduct = function(bundle, cart, category) {

      if (!bundle) {
        return;
      }

      var pid = bundle.productId || bundle.id;
      var name = bundle.productName || bundle.name;

      var qty = bundle.qty || 1;

      category = category || this.getCategoryFromSession().name;

      if (!Object.keys(bundle).length) {
        return;
      }

      if (!bundle.pricingModel || !bundle.pricingModel.length) {
        return;
      }
      var term;
      for (var i = 0; i < bundle.pricingModel.length; i++) {
        if (bundle.pricingModel[i].purchaseType == "LT36") {
          term = bundle.pricingModel[i].purchaseType;
          termPaymentType = bundle.pricingModel[i].paymentType;
          break;
        } else {
          term = bundle.pricingModel[0].purchaseType;
          termPaymentType = bundle.pricingModel[0].paymentType;
        }
      };

      var cardNotPresent = bundle.cardNotPresent ? true : false;

      var pr = {
        id: pid,
        name: name,
        price: bundle.price,
        pricingModel: bundle.pricingModel,
        pricingModel_default: angular.copy(bundle.pricingModel),
        term: term,
        termPaymentType: termPaymentType,
        pmodel: null,
        category: category,
        cardNotPresent: cardNotPresent,
        productType: bundle.productType,
        qty: qty
      };

      var index = this.getCartProductIndex(cart, pr);

      if (-1 !== index) {
        pr = cart.data[index];
        pr.term = term;
        pr.termPaymentType = termPaymentType;
        pr.pricingModel = bundle.pricingModel;
        pr.pricingModel_default = angular.copy(bundle.pricingModel);
        cart.data[index] = pr;
      } else {
        cart.data.push(pr);
      }

      cart = this.cartChanged(cart);
      this.clearOrderId();
      return cart;
    };

    /**
     * Recalculate cart and store it in session
     * @method cartChanged
     * @param cart
     * @return cart
     */
    this.cartChanged = function(cart) {
      cart = this.recalculateCart(cart);
      this.storeCart(cart);
      return cart;
    };

    /**
     * Recalculate ordered cart and store it in session
     * @method orderedCartChanged
     * @param orderId
     * @param cart
     * @return cart
     */
    this.orderedCartChanged = function(orderId, cart) {
      cart = this.recalculateCart(cart);
      this.storeOrderedCart(orderId, cart);
      return cart;
    };

    /**
     * Lookup city and state using Google Map API
     * @method lookupByZip
     * @param zip
     * @param callback function
     */
    this.lookupByZip = function(zip, callback) {

      if (zip.length < 5) {
        callback.apply(this, [null, null]);
        return;
      }

      var geocoder = new google.maps.Geocoder();
      geocoder.geocode( { "address": zip }, function(result, status) {
        var city = '';
        var state = '';
        var neighborhood = '';
        var sublocality = '';
        if (status == google.maps.GeocoderStatus.OK && result.length > 0) {
          for (var component in result[0]['address_components']) {
            for (var i in result[0]['address_components'][component]['types']) {
              if (result[0]['address_components'][component]['types'][i] == "administrative_area_level_1") {
                state = result[0]['address_components'][component]['short_name'];
              }
              if (result[0]['address_components'][component]['types'][i] == "locality") {
                city = result[0]['address_components'][component]['long_name'].replace(/(St.|'|ñ)/g, function(match){return CONST.citySpecialChar[match];});
              }
              if (result[0]['address_components'][component]['types'][i] == "neighborhood") {
                neighborhood = result[0]['address_components'][component]['long_name'];
              }
              if (result[0]['address_components'][component]['types'][i] == "sublocality") {
                sublocality = result[0]['address_components'][component]['long_name'];
              }
              if (result[0]['address_components'][component]['types'][i] == "country") {
                country = result[0]['address_components'][component]['short_name'];
              }
            }
          }

          if (!city.length && neighborhood.length) {
            city = neighborhood;
          }
          if (!city.length && sublocality.length) {
            city = sublocality;
          }
        }

        if ('US' == country) {
          callback.apply(this, [city, state]);
        } else {
          callback.apply(this, [null, null]);
        }
      });
    };

    /**
     * Description
     * @method getInvalidSsn
     * @return {HTTPPromise}
     */
    this.getInvalidSsn = function() {
      return $http.get('../../invalidSsn.json');
    };

    /**
     * Set pricing data to cart
     * @method setPricingToCart
     * @param cart
     * @param dt
     * @param addData {Boolean} if true add one time payments to cart
     * @return {Object} cart
     */
    this.setPricingToCart = function(cart, dt, addData) {

      var data = angular.copy(dt);
      var paymentProducts = {
        products: {}
      };

      addData = addData || false;
      var productAttributes = {}, pid;
      for (var i = 0; i < data.length; i++) {
        if (data[i].productAttribute && data[i].showoncart) {
          var tmpId = data[i].productAttribute.name + data[i].productAttribute.value;
          if (productAttributes[tmpId]) {
            data[i].showoncart = false;
          } else {
            productAttributes[tmpId] = {
              defaultAmt: 0,
              index: i
            };
            data[i].productName = data[i].productAttribute.value;
          }
          productAttributes[tmpId].defaultAmt += data[i].defaultAmt
          data[productAttributes[tmpId].index].defaultAmt = productAttributes[tmpId].defaultAmt;
        }
      }

      for (var i = 0; i < data.length; i++) {

        if ('Transaction' == data[i].occurrence.type) {
          // if (2 == data[i].productId || 80382 == data[i].productId){
          //   cart.transaction_fee = {
          //     fee: data[i].defaultAmt,
          //     rate: data[i].rateDefault,
          //   };
          // }
        } else {

          if (data[i].showoncart) {
            if ('Recurring' == data[i].occurrence.type) {
              if (data[i].paymentType == 'Installment' || data[i].paymentType == 'Lease' || data[i].paymentType == 'Rent') {
                var pricingModel = [];
                pricingModel[0] = {
                  defaultAmt: data[i].defaultAmt,
                  fkProdId: data[i].productId,
                  id: '',
                  occurrence: data[i].occurrence.type,
                  paymentTerm: data[i].paymentTerm,
                  paymentType: data[i].paymentType,
                  purchaseType: data[i].purchaseType,
                  purchaseTypeLabel: ''
                }

                cart.data.push({
                  id: data[i].productId,
                  name: data[i].productName,
                  price: data[i].defaultAmt,
                  defaultPrice: data[i].defaultAmt,
                  productType: data[i].productType,
                  term: data[i].purchaseType,
                  qty: data[i].quantity,
                  category: data[i].category ? data[i].category : transactionFormData.category,
                  cardNotPresent: data[i].cardNotPresent,
                  pricingModel: pricingModel
                });
              } else {
                cart.mFees[data[i].productId] = {
                  name: data[i].productName,
                  amount: data[i].defaultAmt,
                  disclosure: data[i].disclosure,
                };
                cart.mfeeAmount += cart.mFees[data[i].productId].amount;
              }

            } else if ('Onetime_Fee' == data[i].occurrence.type) {

              cart.onetimeFees[data[i].productId] = {
                name: data[i].productName,
                amount: data[i].defaultAmt,
              };

              cart.onetimeAmount += cart.onetimeFees[data[i].productId].amount;
            } else if ('Onetime_Product' == data[i].occurrence.type) {
              if (addData) {
                cart.data.push({
                  id: data[i].productId,
                  name: data[i].productName,
                  price: data[i].defaultAmt,
                  defaultPrice: data[i].defaultAmt,
                  productType: data[i].productType,
                  term: data[i].purchaseType,
                  category: data[i].category,
                  cardNotPresent: data[i].cardNotPresent,
                  qty: data[i].quantity,
                });
              }
            } else if ('Acquiring' == data[i].occurrence.type) {
              paymentProducts.id = data[i].parentProduct ? data[i].parentProduct.id : null;
              paymentProducts.name = data[i].parentProduct ? data[i].parentProduct.name : null;
              paymentProducts.products[data[i].productId] = {
                id: data[i].productId,
                name: data[i].productName,
                price: data[i].defaultAmt,
                productType: data[i].productType,
                term: data[i].purchaseType,
                category: data[i].category,
                cardNotPresent: data[i].cardNotPresent,
                qty: data[i].quantity,
              };

            }
          }
        }
      }

      if (addData) {
        cart.payment_types = paymentProducts;

        for (var i = 0; i < cart.cartTransactionRates.length; i++) {
          pid = cart.cartTransactionRates[i].parentProduct ? cart.cartTransactionRates[i].parentProduct.id : cart.cartTransactionRates[i].productId;

          if ('ACQUIRING' == cart.cartTransactionRates[i].productType) {
            if (!cart.payment_types) {
              cart.payment_types = {};
            }

            if (!cart.payment_types.groups) {
              cart.payment_types.groups = [];
            }

            if (-1 == cart.payment_types.groups.map(function(e) {return e.name;}).indexOf(cart.cartTransactionRates[i].groupName)) {
              cart.payment_types.groups.push({
                pid: cart.cartTransactionRates[i].groupName,
                name: cart.cartTransactionRates[i].groupName,
                fee: cart.cartTransactionRates[i].parentProduct.fee,
                rate: cart.cartTransactionRates[i].parentProduct.rate,
              })

            }

          } else {

            index = cart.transaction_products.map(function(e) {return e.id;}).indexOf(pid);

            if (-1 !== index) {
              cart.transaction_products[index].parentProduct = cart.cartTransactionRates[i].parentProduct;
            }
          }
        }

      }
      return cart;
    };

    /**
     * Initialize pricing data
     * @method initPricingData
     * @param callback function
     * @param ap Acquiring pricing
     * @param ep Equipment Pricing
     * @param gp Global Pricing
     */
    this.initPricingData = function(callback, ap, ep, gp) {
      var cbf = function() {
        if (ap && ep && gp) {
          fdService.cartChanged(cart);
          if (ap && ep && gp) {
            callback.apply(this, [1]);
          }
        }
      };

      ap = ap || null;
      ep = ep || null;
      gp = gp || null;

      var fdService = this;
      var cart = fdService.getCart();
      cart.onetimeFees = {};
      cart.mFees = {};
      cart.onetimeAmount = 0;
      cart.mfeeAmount = 0;

      var ti = fdService.getTransactionInfo();

      fdService.clearAcquiringPricing();
      fdService.clearGlobalPricing();
      fdService.clearEquipmentPricing();

      if (!ap) {
        fdService.getAcquiringPricing(cart, ti)
          .success(function(data, status, headers, config) {
            fdService.storeAcquiringPricing(data);

            var index, pid;
            var newData = [];
            for (var i in data) {
              if ('cartTransactionRates' == i) {
                cart.cartTransactionRates = data[i];
              } else {
                newData = newData.concat(data[i]);
              }
            }

            for (i in data.cartTransactionRates) {
              pid = data.cartTransactionRates[i].parentProduct ? data.cartTransactionRates[i].parentProduct.id : data.cartTransactionRates[i].productId;
              if ('ACQUIRING' == data.cartTransactionRates[i].productType) {
                if (!cart.payment_types) {
                  cart.payment_types = {};
                }
                if (!cart.payment_types.groups) {
                  cart.payment_types.groups = [];
                }

                  if (-1 == cart.payment_types.groups.map(function(e) {return e.name;}).indexOf(data.cartTransactionRates[i].groupName)) {
                  cart.payment_types.groups.push({
                    pid: data.cartTransactionRates[i].groupName,
                    name: data.cartTransactionRates[i].groupName,
                    fee: data.cartTransactionRates[i].parentProduct.fee,
                    rate: data.cartTransactionRates[i].parentProduct.rate,
                  })

                }
              } else {

                index = cart.transaction_products.map(function(e) {return e.id;}).indexOf(pid);

                if (-1 !== index) {
                  cart.transaction_products[index].parentProduct = data.cartTransactionRates[i].parentProduct;
                }
              }
            }

            cart = fdService.setPricingToCart(cart, newData);
            ap = data;
            cbf();

          })
          .error(function(data, status, headers, config) {
            callback.apply(this, [0]);
            console.log('error')
          });
      }

      if (!ep) {
        fdService.getEquipmentPricing(cart, ti)
          .success(function(data, status, headers, config) {
            fdService.storeEquipmentPricing(data);
            cart = fdService.setPricingToCart(cart, data);

            ep = data;

            cbf();

          })
          .error(function(data, status, headers, config) {
            callback.apply(this, [0]);
            console.log('error')
          });
      } else {
        //restore Equipment Pricing details into session
        fdService.storeEquipmentPricing(ep);
        cart = fdService.setPricingToCart(cart, ep);
        cbf();
      }

      if (!gp) {
        fdService.getGlobalPricing(cart, ti)
          .success(function(data, status, headers, config) {
            fdService.storeGlobalPricing(data);
            cart = fdService.setPricingToCart(cart, data);

            gp = data;

            cbf();

          })
          .error(function(data, status, headers, config) {
            callback.apply(this, [0]);
            console.log('error')
          });
      } else {
        //restore Global Pricing details into session
        fdService.storeGlobalPricing(gp);
        cart = fdService.setPricingToCart(cart, gp);
        cbf();
      }
    };

    /**
     * Description
     * @method updatePricing
     * @param {} callback
     */
    this.updatePricing = function(callback) {
      var ti = this.getTransactionInfo();
      var gp = this.getGlobalPricingStorage();

      if (!ti) {
        return;
      }
      $timeout(function() {
        this.initPricingData(function(status) {
          if (status) {
            if ('function' === typeof callback) {
              callback();
            }
            console.log('updated');
          } else {
            console.log('error');
          }
        }, null, null, gp);
      }.bind(this));
    };

    /**
     * Description get FSP company flag to enable Multiple DDA
     * @method getFspCompany
     * @param {} orderId
     * @return {HTTPPromise}
     */
    this.getFspCompany = function(orderId) {
        return $http.get(urlPrefix + '/marketplace/v2/signup/fspcompany/' + orderId);
    }

    /**
     * Description get MCC Code Details
     * @method getMCCDetails
     * @param {} categoryName
     * @param {} mccNumber
     * @return {HTTPPromise}
     */
    this.getMCCDetails = function(categoryName, mccNumber) {
      return $http.get(urlPrefix + '/marketplace/v1/companies/category/' + categoryName + '/merchantcategorycodes/' + mccNumber + '/industries');
    };

    /**
     * Post Signup Merchant Owner Information
     * @method postBusinessinformation
     * @param data
     * @param orderId
     * @return {HTTPPromise}
     */
    this.postBusinessinformation = function(data, orderId) {
      return $http.post(urlPrefix + '/marketplace/v1/merchantorders/' + orderId + '/businessinformation', data);
    };


    /**
     * get products list for order
     * @method getOrderProducts
     * @param orderId
     * @return {HTTPPromise}
     */
    this.getOrderProducts = function(orderId) {
      return $http.get(urlPrefix + '/marketplace/v1/cart/' + orderId + '/products/');
    };

    /**
     * get list of products for order
     * @method getCartOrderProducts
     * @param orderId
     * @return {HTTPPromise}
     */
    this.getCartOrderProducts = function(orderId) {
      return $http.get(urlPrefix + '/marketplace/v1/merchantorders/' + orderId + '/cart/products');
    };

    /**
     * get cart details for order
     * @method getCartDetails
     * @param orderId
     * @return {HTTPPromise}
     */
    this.getCartDetails = function(orderId) {
      return $http.get(urlPrefix + '/marketplace/v1/merchantorders/' + orderId + '/cart/details');
    };

    /**
     * get product attributes
     * @method getProductAttributes
     * @param {} orderId
     * @param {} lineItemId
     * @return {HTTPPromise}
     */
    this.getProductAttributes = function(orderId, lineItemId) {
      return $http.get(urlPrefix + '/marketplace/v1/merchantorders/' + orderId + '/orderLineItems/' + lineItemId + '/attributes/');
    };

    /**
     * post order locations
     * @method postOrderLocations
     * @param data
     * @param orderId
     * @return {HTTPPromise}
     */
    this.postOrderLocations = function(data, orderId) {
      return $http.post(urlPrefix + '/marketplace/v1/merchantorders/' + orderId + '/locations', data);
    };

    /**
     * post account preferences
     * @method postAccountPreferences
     * @param data
     * @param orderId
     * @return {HTTPPromise}
     */
    this.postAccountPreferences = function(data, orderId) {
      return $http.post(urlPrefix + '/marketplace/v1/merchantorders/' + orderId + '/accountpreferences', data);
    };

    /**
     * Description Get All Shipping Methods
     * @method getShippingMethods
     * @return {HTTPPromise}
     */
    this.getShippingMethods = function() {
      return $http.get(urlPrefix + '/marketplace/v1/companies/products/shipping');
    };

    /**
     * Get order locations
     * @method getOrderLocations
     * @param {} orderId
     * @return {HTTPPromise}
     */
    this.getOrderLocations = function(orderId) {
      return $http.get(urlPrefix + '/marketplace/v1/merchantorders/' + orderId + '/locations');
    };

    /**
     * get order business information
     * @method getOrderBusinessinformation
     * @param orderId
     * @return {HTTPPromise}
     */
    this.getOrderBusinessinformation = function(orderId) {
      return $http.get(urlPrefix + '/marketplace/v1/merchantorders/' + orderId + '/businessinformation');
    };

    /**
     * Get account preferences
     * @method getAccountPreferences
     * @param orderId
     * @return {HTTPPromise}
     */
    this.getAccountPreferences = function(orderId) {
      return $http.get(urlPrefix + '/marketplace/v1/merchantorders/' + orderId + '/accountpreferences');
    };

    /**
     * get merchant order agreement
     * @method getOrderAgreementInformation
     * @param orderId
     * @param {} ownerId
     * @return {HTTPPromise}
     */
    this.getOrderAgreementInformation = function(orderId, ownerId) {
      var appendURL = ownerId ? '/' + ownerId : '';
      return $http.get(urlPrefix + '/marketplace/v1/merchantorders/' + orderId + '/agreement' + appendURL);
    };

    /**
     * Store Shipping Methods into Session storage
     * @method storeShippingMethods
     * @param {} data
     */
    this.storeShippingMethods = function(data) {
      if (undefined == data) return;
      $window.sessionStorage.setItem(shipping_options, JSON.stringify(data));
    };

    /**
     * Get Shipping Methods from Session storage
     * @method getSessionShippingMethods
     * @return Literal
     */
    this.getSessionShippingMethods = function() {
      var data = $window.sessionStorage.getItem(shipping_options);
      if (data) {
        return JSON.parse(data);
      }
      return false;
    };

    /**
     * Clear Shipping Methods from Session storage
     * @method clearSessionShippingMethods
     */
    this.clearSessionShippingMethods = function() {
      $window.sessionStorage.removeItem(shipping_options);
    };

    /**
     * Get Products By Option Type
     * @method getProductsByOptionType
     * @param type
     * @return {HTTPPromise}
     */
    this.getProductsByOptionType = function(type) {
      return $http.get(urlPrefix + '/marketplace/v1/products/' + type + '/types/');
    };


    /**
     * get index of product in the cart.data array
     * @method getCartProductIndex
     * @param cart
     * @param pr
     * @return number
     */
    this.getCartProductIndex = function(cart, pr) {

      for (var i in cart.data) {
        if (pr.id == cart.data[i].id && pr.term == cart.data[i].term && pr.category == cart.data[i].category) {
          return i;
        }
      }
      return -1;
    };

    /**
     * Description
     * @return
     * @method validateBusiness
     * @param {} element
     * @param {} model
     */
    this.validateBusiness = function(element, model) {
      if (!model) {
        return;
      }

      var dataToValidate = {};
      dataToValidate.merInfo = {};
      dataToValidate.merInfo.contacts = {};
      dataToValidate.merInfo.contacts.contactInfo = [];
      dataToValidate.merInfo.contacts.contactInfo.push({
        "email": model
      });
      this.validateContact(dataToValidate)
        .success(function(response, status, headers, config) {
          if (response.length != 0) {
            for (var i = 0; i < response.length; i++) {
              if (response[i].errorCode = 8104) {
                element.$setValidity("emailnotValid", false);
                return;
              }
            }
          } else {
            element.$setValidity("emailnotValid", true);
          }
        })
        .error(function(data, status, headers, config) {
          console.log('error');
        });

    };

  }
]);;/**
 * Detect.js: User-Agent Parser
 * https://github.com/darcyclarke/Detect.js
 * Dual licensed under the MIT and GPL licenses.
 *
 * @version 2.2.2
 * @author Darcy Clarke
 * @url http://darcyclarke.me
 * @createdat Mon Oct 26 2015 08:21:54 GMT-0200 (Horário brasileiro de verão)
 *
 * Based on UA-Parser (https://github.com/tobie/ua-parser) by Tobie Langel
 *
 * Example Usage:
 * var agentInfo = detect.parse(navigator.userAgent);
 * console.log(agentInfo.browser.family); // Chrome
 *
 */
(function(root, undefined) {
    // Shim Array.prototype.map if necessary
    // Production steps of ECMA-262, Edition 5, 15.4.4.19
    // Reference: http://es5.github.com/#x15.4.4.19
    if (!Array.prototype.map) {
        Array.prototype.map = function(callback, thisArg) {
            var T, A, k;
            if (this == null) {
                throw new TypeError(" this is null or not defined");
            }
            // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
            var O = Object(this);
            // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;
            // 4. If IsCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if (typeof callback !== "function") {
                throw new TypeError(callback + " is not a function");
            }
            // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if (thisArg) {
                T = thisArg;
            }
            // 6. Let A be a new array created as if by the expression new Array(len) where Array is
            // the standard built-in constructor with that name and len is the value of len.
            A = new Array(len);
            // 7. Let k be 0
            k = 0;
            // 8. Repeat, while k < len
            while (k < len) {
                var kValue, mappedValue;
                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                if (k in O) {
                    // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                    kValue = O[k];
                    // ii. Let mappedValue be the result of calling the Call internal method of callback
                    // with T as the this value and argument list containing kValue, k, and O.
                    mappedValue = callback.call(T, kValue, k, O);
                    // iii. Call the DefineOwnProperty internal method of A with arguments
                    // Pk, Property Descriptor {Value: mappedValue, : true, Enumerable: true, Configurable: true},
                    // and false.
                    // In browsers that support Object.defineProperty, use the following:
                    // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });
                    // For best browser support, use the following:
                    A[k] = mappedValue;
                }
                // d. Increase k by 1.
                k++;
            }
            // 9. return A
            return A;
        };
    }
    // Detect
    var detect = root.detect = function() {
        // Context
        var _this = function() {};
        // Regexes
        var regexes = {
            browser_parsers: [ {
                regex: "^(Opera)/(\\d+)\\.(\\d+) \\(Nintendo Wii",
                family_replacement: "Wii",
                manufacturer: "Nintendo"
            }, {
                regex: "(SeaMonkey|Camino)/(\\d+)\\.(\\d+)\\.?([ab]?\\d+[a-z]*)",
                family_replacement: "Camino",
                other: true
            }, {
                regex: "(Pale[Mm]oon)/(\\d+)\\.(\\d+)\\.?(\\d+)?",
                family_replacement: "Pale Moon (Firefox Variant)",
                other: true
            }, {
                regex: "(Fennec)/(\\d+)\\.(\\d+)\\.?([ab]?\\d+[a-z]*)",
                family_replacement: "Firefox Mobile"
            }, {
                regex: "(Fennec)/(\\d+)\\.(\\d+)(pre)",
                family_replacment: "Firefox Mobile"
            }, {
                regex: "(Fennec)/(\\d+)\\.(\\d+)",
                family_replacement: "Firefox Mobile"
            }, {
                regex: "Mobile.*(Firefox)/(\\d+)\\.(\\d+)",
                family_replacement: "Firefox Mobile"
            }, {
                regex: "(Namoroka|Shiretoko|Minefield)/(\\d+)\\.(\\d+)\\.(\\d+(?:pre)?)",
                family_replacement: "Firefox ($1)"
            }, {
                regex: "(Firefox)/(\\d+)\\.(\\d+)(a\\d+[a-z]*)",
                family_replacement: "Firefox Alpha"
            }, {
                regex: "(Firefox)/(\\d+)\\.(\\d+)(b\\d+[a-z]*)",
                family_replacement: "Firefox Beta"
            }, {
                regex: "(Firefox)-(?:\\d+\\.\\d+)?/(\\d+)\\.(\\d+)(a\\d+[a-z]*)",
                family_replacement: "Firefox Alpha"
            }, {
                regex: "(Firefox)-(?:\\d+\\.\\d+)?/(\\d+)\\.(\\d+)(b\\d+[a-z]*)",
                family_replacement: "Firefox Beta"
            }, {
                regex: "(Namoroka|Shiretoko|Minefield)/(\\d+)\\.(\\d+)([ab]\\d+[a-z]*)?",
                family_replacement: "Firefox ($1)"
            }, {
                regex: "(Firefox).*Tablet browser (\\d+)\\.(\\d+)\\.(\\d+)",
                family_replacement: "MicroB",
                tablet: true
            }, {
                regex: "(MozillaDeveloperPreview)/(\\d+)\\.(\\d+)([ab]\\d+[a-z]*)?"
            }, {
                regex: "(Flock)/(\\d+)\\.(\\d+)(b\\d+?)",
                family_replacement: "Flock",
                other: true
            }, {
                regex: "(RockMelt)/(\\d+)\\.(\\d+)\\.(\\d+)",
                family_replacement: "Rockmelt",
                other: true
            }, {
                regex: "(Navigator)/(\\d+)\\.(\\d+)\\.(\\d+)",
                family_replacement: "Netscape"
            }, {
                regex: "(Navigator)/(\\d+)\\.(\\d+)([ab]\\d+)",
                family_replacement: "Netscape"
            }, {
                regex: "(Netscape6)/(\\d+)\\.(\\d+)\\.(\\d+)",
                family_replacement: "Netscape"
            }, {
                regex: "(MyIBrow)/(\\d+)\\.(\\d+)",
                family_replacement: "My Internet Browser",
                other: true
            }, {
                regex: "(Opera Tablet).*Version/(\\d+)\\.(\\d+)(?:\\.(\\d+))?",
                family_replacement: "Opera Tablet",
                tablet: true
            }, {
                regex: "(Opera)/.+Opera Mobi.+Version/(\\d+)\\.(\\d+)",
                family_replacement: "Opera Mobile"
            }, {
                regex: "Opera Mobi",
                family_replacement: "Opera Mobile"
            }, {
                regex: "(Opera Mini)/(\\d+)\\.(\\d+)",
                family_replacement: "Opera Mini"
            }, {
                regex: "(Opera Mini)/att/(\\d+)\\.(\\d+)",
                family_replacement: "Opera Mini"
            }, {
                regex: "(Opera)/9.80.*Version/(\\d+)\\.(\\d+)(?:\\.(\\d+))?",
                family_replacement: "Opera"
            }, {
                regex: "(OPR)/(\\d+)\\.(\\d+)(?:\\.(\\d+))?",
                family_replacement: "Opera"
            }, {
                regex: "(webOSBrowser)/(\\d+)\\.(\\d+)",
                family_replacement: "webOS"
            }, {
                regex: "(webOS)/(\\d+)\\.(\\d+)",
                family_replacement: "webOS"
            }, {
                regex: "(wOSBrowser).+TouchPad/(\\d+)\\.(\\d+)",
                family_replacement: "webOS TouchPad"
            }, {
                regex: "(luakit)",
                family_replacement: "LuaKit",
                other: true
            }, {
                regex: "(Lightning)/(\\d+)\\.(\\d+)([ab]?\\d+[a-z]*)",
                family_replacement: "Lightning",
                other: true
            }, {
                regex: "(Firefox)/(\\d+)\\.(\\d+)\\.(\\d+(?:pre)?) \\(Swiftfox\\)",
                family_replacement: "Swiftfox",
                other: true
            }, {
                regex: "(Firefox)/(\\d+)\\.(\\d+)([ab]\\d+[a-z]*)? \\(Swiftfox\\)",
                family_replacement: "Swiftfox",
                other: true
            }, {
                regex: "rekonq",
                family_replacement: "Rekonq",
                other: true
            }, {
                regex: "(conkeror|Conkeror)/(\\d+)\\.(\\d+)\\.?(\\d+)?",
                family_replacement: "Conkeror",
                other: true
            }, {
                regex: "(konqueror)/(\\d+)\\.(\\d+)\\.(\\d+)",
                family_replacement: "Konqueror",
                other: true
            }, {
                regex: "(WeTab)-Browser",
                family_replacement: "WeTab",
                other: true
            }, {
                regex: "(Comodo_Dragon)/(\\d+)\\.(\\d+)\\.(\\d+)",
                family_replacement: "Comodo Dragon",
                other: true
            }, {
                regex: "(YottaaMonitor)",
                family_replacement: "Yottaa Monitor",
                other: true
            }, {
                regex: "(Kindle)/(\\d+)\\.(\\d+)",
                family_replacement: "Kindle"
            }, {
                regex: "(Symphony) (\\d+).(\\d+)",
                family_replacement: "Symphony",
                other: true
            }, {
                regex: "Minimo",
                family_replacement: "Minimo",
                other: true
            }, {
                regex: "(Edge)/(\\d+)\\.(\\d+)",
                family_replacement: "Edge"
            }, {
                regex: "(CrMo)/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)",
                family_replacement: "Chrome Mobile"
            }, {
                regex: "(CriOS)/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)",
                family_replacement: "Chrome Mobile iOS"
            }, {
                regex: "(Chrome)/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+) Mobile",
                family_replacement: "Chrome Mobile"
            }, {
                regex: "(chromeframe)/(\\d+)\\.(\\d+)\\.(\\d+)",
                family_replacement: "Chrome Frame"
            }, {
                regex: "(UC Browser)(\\d+)\\.(\\d+)\\.(\\d+)",
                family_replacement: "UC Browser",
                other: true
            }, {
                regex: "(SLP Browser)/(\\d+)\\.(\\d+)",
                family_replacement: "Tizen Browser",
                other: true
            }, {
                regex: "(Epiphany)/(\\d+)\\.(\\d+).(\\d+)",
                family_replacement: "Epiphany",
                other: true
            }, {
                regex: "(SE 2\\.X) MetaSr (\\d+)\\.(\\d+)",
                family_replacement: "Sogou Explorer",
                other: true
            }, {
                regex: "(Pingdom.com_bot_version_)(\\d+)\\.(\\d+)",
                family_replacement: "PingdomBot",
                other: true
            }, {
                regex: "(facebookexternalhit)/(\\d+)\\.(\\d+)",
                family_replacement: "FacebookBot"
            }, {
                regex: "(Twitterbot)/(\\d+)\\.(\\d+)",
                family_replacement: "TwitterBot"
            }, {
                regex: "(AdobeAIR|Chromium|FireWeb|Jasmine|ANTGalio|Midori|Fresco|Lobo|PaleMoon|Maxthon|Lynx|OmniWeb|Dillo|Camino|Demeter|Fluid|Fennec|Shiira|Sunrise|Chrome|Flock|Netscape|Lunascape|WebPilot|NetFront|Netfront|Konqueror|SeaMonkey|Kazehakase|Vienna|Iceape|Iceweasel|IceWeasel|Iron|K-Meleon|Sleipnir|Galeon|GranParadiso|Opera Mini|iCab|NetNewsWire|ThunderBrowse|Iron|Iris|UP\\.Browser|Bunjaloo|Google Earth|Raven for Mac)/(\\d+)\\.(\\d+)\\.(\\d+)"
            }, {
                regex: "(Bolt|Jasmine|IceCat|Skyfire|Midori|Maxthon|Lynx|Arora|IBrowse|Dillo|Camino|Shiira|Fennec|Phoenix|Chrome|Flock|Netscape|Lunascape|Epiphany|WebPilot|Opera Mini|Opera|NetFront|Netfront|Konqueror|Googlebot|SeaMonkey|Kazehakase|Vienna|Iceape|Iceweasel|IceWeasel|Iron|K-Meleon|Sleipnir|Galeon|GranParadiso|iCab|NetNewsWire|Iron|Space Bison|Stainless|Orca|Dolfin|BOLT|Minimo|Tizen Browser|Polaris)/(\\d+)\\.(\\d+)"
            }, {
                regex: "(iRider|Crazy Browser|SkipStone|iCab|Lunascape|Sleipnir|Maemo Browser) (\\d+)\\.(\\d+)\\.(\\d+)"
            }, {
                regex: "(iCab|Lunascape|Opera|Android|Jasmine|Polaris|BREW) (\\d+)\\.(\\d+)\\.?(\\d+)?"
            }, {
                regex: "(Android) Donut",
                v2_replacement: "2",
                v1_replacement: "1"
            }, {
                regex: "(Android) Eclair",
                v2_replacement: "1",
                v1_replacement: "2"
            }, {
                regex: "(Android) Froyo",
                v2_replacement: "2",
                v1_replacement: "2"
            }, {
                regex: "(Android) Gingerbread",
                v2_replacement: "3",
                v1_replacement: "2"
            }, {
                regex: "(Android) Honeycomb",
                v1_replacement: "3"
            }, {
                regex: "(IEMobile)[ /](\\d+)\\.(\\d+)",
                family_replacement: "IE Mobile"
            }, {
                regex: "(MSIE) (\\d+)\\.(\\d+).*XBLWP7",
                family_replacement: "IE Large Screen"
            }, {
                regex: "(Firefox)/(\\d+)\\.(\\d+)\\.(\\d+)"
            }, {
                regex: "(Firefox)/(\\d+)\\.(\\d+)(pre|[ab]\\d+[a-z]*)?"
            }, {
                regex: "(Obigo)InternetBrowser",
                other: true
            }, {
                regex: "(Obigo)\\-Browser",
                other: true
            }, {
                regex: "(Obigo|OBIGO)[^\\d]*(\\d+)(?:.(\\d+))?",
                other: true
            }, {
                regex: "(MAXTHON|Maxthon) (\\d+)\\.(\\d+)",
                family_replacement: "Maxthon",
                other: true
            }, {
                regex: "(Maxthon|MyIE2|Uzbl|Shiira)",
                v1_replacement: "0",
                other: true
            }, {
                regex: "(PLAYSTATION) (\\d+)",
                family_replacement: "PlayStation",
                manufacturer: "Sony"
            }, {
                regex: "(PlayStation Portable)[^\\d]+(\\d+).(\\d+)",
                manufacturer: "Sony"
            }, {
                regex: "(BrowseX) \\((\\d+)\\.(\\d+)\\.(\\d+)",
                other: true
            }, {
                regex: "(POLARIS)/(\\d+)\\.(\\d+)",
                family_replacement: "Polaris",
                other: true
            }, {
                regex: "(Embider)/(\\d+)\\.(\\d+)",
                family_replacement: "Polaris",
                other: true
            }, {
                regex: "(BonEcho)/(\\d+)\\.(\\d+)\\.(\\d+)",
                family_replacement: "Bon Echo",
                other: true
            }, {
                regex: "(iPod).+Version/(\\d+)\\.(\\d+)\\.(\\d+)",
                family_replacement: "Mobile Safari",
                manufacturer: "Apple"
            }, {
                regex: "(iPod).*Version/(\\d+)\\.(\\d+)",
                family_replacement: "Mobile Safari",
                manufacturer: "Apple"
            }, {
                regex: "(iPod)",
                family_replacement: "Mobile Safari",
                manufacturer: "Apple"
            }, {
                regex: "(iPhone).*Version/(\\d+)\\.(\\d+)\\.(\\d+)",
                family_replacement: "Mobile Safari",
                manufacturer: "Apple"
            }, {
                regex: "(iPhone).*Version/(\\d+)\\.(\\d+)",
                family_replacement: "Mobile Safari",
                manufacturer: "Apple"
            }, {
                regex: "(iPhone)",
                family_replacement: "Mobile Safari",
                manufacturer: "Apple"
            }, {
                regex: "(iPad).*Version/(\\d+)\\.(\\d+)\\.(\\d+)",
                family_replacement: "Mobile Safari",
                tablet: true,
                manufacturer: "Apple"
            }, {
                regex: "(iPad).*Version/(\\d+)\\.(\\d+)",
                family_replacement: "Mobile Safari",
                tablet: true,
                manufacturer: "Apple"
            }, {
                regex: "(iPad)",
                family_replacement: "Mobile Safari",
                tablet: true,
                manufacturer: "Apple"
            }, {
                regex: "(AvantGo) (\\d+).(\\d+)",
                other: true
            }, {
                regex: "(Avant)",
                v1_replacement: "1",
                other: true
            }, {
                regex: "^(Nokia)",
                family_replacement: "Nokia Services (WAP) Browser",
                manufacturer: "Nokia"
            }, {
                regex: "(NokiaBrowser)/(\\d+)\\.(\\d+).(\\d+)\\.(\\d+)",
                manufacturer: "Nokia"
            }, {
                regex: "(NokiaBrowser)/(\\d+)\\.(\\d+).(\\d+)",
                manufacturer: "Nokia"
            }, {
                regex: "(NokiaBrowser)/(\\d+)\\.(\\d+)",
                manufacturer: "Nokia"
            }, {
                regex: "(BrowserNG)/(\\d+)\\.(\\d+).(\\d+)",
                family_replacement: "NokiaBrowser",
                manufacturer: "Nokia"
            }, {
                regex: "(Series60)/5\\.0",
                v2_replacement: "0",
                v1_replacement: "7",
                family_replacement: "NokiaBrowser",
                manufacturer: "Nokia"
            }, {
                regex: "(Series60)/(\\d+)\\.(\\d+)",
                family_replacement: "Nokia OSS Browser",
                manufacturer: "Nokia"
            }, {
                regex: "(S40OviBrowser)/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)",
                family_replacement: "Nokia Series 40 Ovi Browser",
                manufacturer: "Nokia"
            }, {
                regex: "(Nokia)[EN]?(\\d+)",
                manufacturer: "Nokia"
            }, {
                regex: "(PlayBook).+RIM Tablet OS (\\d+)\\.(\\d+)\\.(\\d+)",
                family_replacement: "Blackberry WebKit",
                tablet: true,
                manufacturer: "Nokia"
            }, {
                regex: "(Black[bB]erry).+Version/(\\d+)\\.(\\d+)\\.(\\d+)",
                family_replacement: "Blackberry WebKit",
                manufacturer: "RIM"
            }, {
                regex: "(Black[bB]erry)\\s?(\\d+)",
                family_replacement: "Blackberry",
                manufacturer: "RIM"
            }, {
                regex: "(OmniWeb)/v(\\d+)\\.(\\d+)",
                other: true
            }, {
                regex: "(Blazer)/(\\d+)\\.(\\d+)",
                family_replacement: "Palm Blazer",
                manufacturer: "Palm"
            }, {
                regex: "(Pre)/(\\d+)\\.(\\d+)",
                family_replacement: "Palm Pre",
                manufacturer: "Palm"
            }, {
                regex: "(Links) \\((\\d+)\\.(\\d+)",
                other: true
            }, {
                regex: "(QtWeb) Internet Browser/(\\d+)\\.(\\d+)",
                other: true
            }, {
                regex: "(Silk)/(\\d+)\\.(\\d+)(?:\\.([0-9\\-]+))?",
                other: true,
                tablet: true
            }, {
                regex: "(AppleWebKit)/(\\d+)\\.?(\\d+)?\\+ .* Version/\\d+\\.\\d+.\\d+ Safari/",
                family_replacement: "WebKit Nightly"
            }, {
                regex: "(Version)/(\\d+)\\.(\\d+)(?:\\.(\\d+))?.*Safari/",
                family_replacement: "Safari"
            }, {
                regex: "(Safari)/\\d+"
            }, {
                regex: "(OLPC)/Update(\\d+)\\.(\\d+)",
                other: true
            }, {
                regex: "(OLPC)/Update()\\.(\\d+)",
                v1_replacement: "0",
                other: true
            }, {
                regex: "(SEMC\\-Browser)/(\\d+)\\.(\\d+)",
                other: true
            }, {
                regex: "(Teleca)",
                family_replacement: "Teleca Browser",
                other: true
            }, {
                regex: "Trident(.*)rv.(\\d+)\\.(\\d+)",
                family_replacement: "IE"
            }, {
                regex: "(MSIE) (\\d+)\\.(\\d+)",
                family_replacement: "IE"
            } ],
            os_parsers: [ {
                regex: "(Android) (\\d+)\\.(\\d+)(?:[.\\-]([a-z0-9]+))?"
            }, {
                regex: "(Android)\\-(\\d+)\\.(\\d+)(?:[.\\-]([a-z0-9]+))?"
            }, {
                regex: "(Android) Donut",
                os_v2_replacement: "2",
                os_v1_replacement: "1"
            }, {
                regex: "(Android) Eclair",
                os_v2_replacement: "1",
                os_v1_replacement: "2"
            }, {
                regex: "(Android) Froyo",
                os_v2_replacement: "2",
                os_v1_replacement: "2"
            }, {
                regex: "(Android) Gingerbread",
                os_v2_replacement: "3",
                os_v1_replacement: "2"
            }, {
                regex: "(Android) Honeycomb",
                os_v1_replacement: "3"
            }, {
                regex: "(Silk-Accelerated=[a-z]{4,5})",
                os_replacement: "Android"
            }, {
                regex: "(Windows Phone 6\\.5)"
            }, {
                regex: "(Windows (?:NT 5\\.2|NT 5\\.1))",
                os_replacement: "Windows XP"
            }, {
                regex: "(XBLWP7)",
                os_replacement: "Windows Phone OS"
            }, {
                regex: "(Windows NT 6\\.1)",
                os_replacement: "Windows 7"
            }, {
                regex: "(Windows NT 6\\.0)",
                os_replacement: "Windows Vista"
            }, {
                regex: "(Windows 98|Windows XP|Windows ME|Windows 95|Windows CE|Windows 7|Windows NT 4\\.0|Windows Vista|Windows 2000)"
            }, {
                regex: "(Windows NT 6\\.4|Windows NT 10\\.0)",
                os_replacement: "Windows 10"
            }, {
                regex: "(Windows NT 6\\.2)",
                os_replacement: "Windows 8"
            }, {
                regex: "(Windows Phone 8)",
                os_replacement: "Windows Phone 8"
            }, {
                regex: "(Windows NT 5\\.0)",
                os_replacement: "Windows 2000"
            }, {
                regex: "(Windows Phone OS) (\\d+)\\.(\\d+)"
            }, {
                regex: "(Windows ?Mobile)",
                os_replacement: "Windows Mobile"
            }, {
                regex: "(WinNT4.0)",
                os_replacement: "Windows NT 4.0"
            }, {
                regex: "(Win98)",
                os_replacement: "Windows 98"
            }, {
                regex: "(Tizen)/(\\d+)\\.(\\d+)",
                other: true
            }, {
                regex: "(Mac OS X) (\\d+)[_.](\\d+)(?:[_.](\\d+))?",
                manufacturer: "Apple"
            }, {
                regex: "(?:PPC|Intel) (Mac OS X)",
                manufacturer: "Apple"
            }, {
                regex: "(CPU OS|iPhone OS) (\\d+)_(\\d+)(?:_(\\d+))?",
                os_replacement: "iOS",
                manufacturer: "Apple"
            }, {
                regex: "(iPhone|iPad|iPod); Opera",
                os_replacement: "iOS",
                manufacturer: "Apple"
            }, {
                regex: "(iPad); Opera",
                tablet: true,
                manufacturer: "Apple"
            }, {
                regex: "(iPhone|iPad|iPod).*Mac OS X.*Version/(\\d+)\\.(\\d+)",
                os_replacement: "iOS",
                manufacturer: "Apple"
            }, {
                regex: "(CrOS) [a-z0-9_]+ (\\d+)\\.(\\d+)(?:\\.(\\d+))?",
                os_replacement: "Chrome OS"
            }, {
                regex: "(Debian)-(\\d+)\\.(\\d+)\\.(\\d+)(?:\\.(\\d+))?",
                other: true
            }, {
                regex: "(Linux Mint)(?:/(\\d+))?",
                other: true
            }, {
                regex: "(Mandriva)(?: Linux)?/(\\d+)\\.(\\d+)\\.(\\d+)(?:\\.(\\d+))?",
                other: true
            }, {
                regex: "(Symbian[Oo][Ss])/(\\d+)\\.(\\d+)",
                os_replacement: "Symbian OS"
            }, {
                regex: "(Symbian/3).+NokiaBrowser/7\\.3",
                os_replacement: "Symbian^3 Anna"
            }, {
                regex: "(Symbian/3).+NokiaBrowser/7\\.4",
                os_replacement: "Symbian^3 Belle"
            }, {
                regex: "(Symbian/3)",
                os_replacement: "Symbian^3"
            }, {
                regex: "(Series 60|SymbOS|S60)",
                os_replacement: "Symbian OS"
            }, {
                regex: "(MeeGo)",
                other: true
            }, {
                regex: "Symbian [Oo][Ss]",
                os_replacement: "Symbian OS"
            }, {
                regex: "(Black[Bb]erry)[0-9a-z]+/(\\d+)\\.(\\d+)\\.(\\d+)(?:\\.(\\d+))?",
                os_replacement: "BlackBerry OS",
                manufacturer: "RIM"
            }, {
                regex: "(Black[Bb]erry).+Version/(\\d+)\\.(\\d+)\\.(\\d+)(?:\\.(\\d+))?",
                os_replacement: "BlackBerry OS",
                manufacturer: "RIM"
            }, {
                regex: "(RIM Tablet OS) (\\d+)\\.(\\d+)\\.(\\d+)",
                os_replacement: "BlackBerry Tablet OS",
                tablet: true,
                manufacturer: "RIM"
            }, {
                regex: "(Play[Bb]ook)",
                os_replacement: "BlackBerry Tablet OS",
                tablet: true,
                manufacturer: "RIM"
            }, {
                regex: "(Black[Bb]erry)",
                os_replacement: "Blackberry OS",
                manufacturer: "RIM"
            }, {
                regex: "(webOS|hpwOS)/(\\d+)\\.(\\d+)(?:\\.(\\d+))?",
                os_replacement: "webOS"
            }, {
                regex: "(SUSE|Fedora|Red Hat|PCLinuxOS)/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)",
                other: true
            }, {
                regex: "(SUSE|Fedora|Red Hat|Puppy|PCLinuxOS|CentOS)/(\\d+)\\.(\\d+)\\.(\\d+)",
                other: true
            }, {
                regex: "(Ubuntu|Kindle|Bada|Lubuntu|BackTrack|Red Hat|Slackware)/(\\d+)\\.(\\d+)"
            }, {
                regex: "(Windows|OpenBSD|FreeBSD|NetBSD|Ubuntu|Kubuntu|Android|Arch Linux|CentOS|WeTab|Slackware)"
            }, {
                regex: "(Linux|BSD)",
                other: true
            } ],
            mobile_os_families: [ "Windows Phone 6.5", "Windows CE", "Symbian OS" ],
            device_parsers: [ {
                regex: "HTC ([A-Z][a-z0-9]+) Build",
                device_replacement: "HTC $1",
                manufacturer: "HTC"
            }, {
                regex: "HTC ([A-Z][a-z0-9 ]+) \\d+\\.\\d+\\.\\d+\\.\\d+",
                device_replacement: "HTC $1",
                manufacturer: "HTC"
            }, {
                regex: "HTC_Touch_([A-Za-z0-9]+)",
                device_replacement: "HTC Touch ($1)",
                manufacturer: "HTC"
            }, {
                regex: "USCCHTC(\\d+)",
                device_replacement: "HTC $1 (US Cellular)",
                manufacturer: "HTC"
            }, {
                regex: "Sprint APA(9292)",
                device_replacement: "HTC $1 (Sprint)",
                manufacturer: "HTC"
            }, {
                regex: "HTC ([A-Za-z0-9]+ [A-Z])",
                device_replacement: "HTC $1",
                manufacturer: "HTC"
            }, {
                regex: "HTC-([A-Za-z0-9]+)",
                device_replacement: "HTC $1",
                manufacturer: "HTC"
            }, {
                regex: "HTC_([A-Za-z0-9]+)",
                device_replacement: "HTC $1",
                manufacturer: "HTC"
            }, {
                regex: "HTC ([A-Za-z0-9]+)",
                device_replacement: "HTC $1",
                manufacturer: "HTC"
            }, {
                regex: "(ADR[A-Za-z0-9]+)",
                device_replacement: "HTC $1",
                manufacturer: "HTC"
            }, {
                regex: "(HTC)",
                manufacturer: "HTC"
            }, {
                regex: "SonyEricsson([A-Za-z0-9]+)/",
                device_replacement: "Ericsson $1",
                other: true,
                manufacturer: "Sony"
            }, {
                regex: "Android[\\- ][\\d]+\\.[\\d]+\\; [A-Za-z]{2}\\-[A-Za-z]{2}\\; WOWMobile (.+) Build"
            }, {
                regex: "Android[\\- ][\\d]+\\.[\\d]+\\.[\\d]+; [A-Za-z]{2}\\-[A-Za-z]{2}\\; (.+) Build"
            }, {
                regex: "Android[\\- ][\\d]+\\.[\\d]+\\-update1\\; [A-Za-z]{2}\\-[A-Za-z]{2}\\; (.+) Build"
            }, {
                regex: "Android[\\- ][\\d]+\\.[\\d]+\\; [A-Za-z]{2}\\-[A-Za-z]{2}\\; (.+) Build"
            }, {
                regex: "Android[\\- ][\\d]+\\.[\\d]+\\.[\\d]+; (.+) Build"
            }, {
                regex: "NokiaN([0-9]+)",
                device_replacement: "Nokia N$1",
                manufacturer: "Nokia"
            }, {
                regex: "Nokia([A-Za-z0-9\\v-]+)",
                device_replacement: "Nokia $1",
                manufacturer: "Nokia"
            }, {
                regex: "NOKIA ([A-Za-z0-9\\-]+)",
                device_replacement: "Nokia $1",
                manufacturer: "Nokia"
            }, {
                regex: "Nokia ([A-Za-z0-9\\-]+)",
                device_replacement: "Nokia $1",
                manufacturer: "Nokia"
            }, {
                regex: "Lumia ([A-Za-z0-9\\-]+)",
                device_replacement: "Lumia $1",
                manufacturer: "Nokia"
            }, {
                regex: "Symbian",
                device_replacement: "Nokia",
                manufacturer: "Nokia"
            }, {
                regex: "(PlayBook).+RIM Tablet OS",
                device_replacement: "Blackberry Playbook",
                tablet: true,
                manufacturer: "RIM"
            }, {
                regex: "(Black[Bb]erry [0-9]+);",
                manufacturer: "RIM"
            }, {
                regex: "Black[Bb]erry([0-9]+)",
                device_replacement: "BlackBerry $1",
                manufacturer: "RIM"
            }, {
                regex: "(Pre)/(\\d+)\\.(\\d+)",
                device_replacement: "Palm Pre",
                manufacturer: "Palm"
            }, {
                regex: "(Pixi)/(\\d+)\\.(\\d+)",
                device_replacement: "Palm Pixi",
                manufacturer: "Palm"
            }, {
                regex: "(Touchpad)/(\\d+)\\.(\\d+)",
                device_replacement: "HP Touchpad",
                manufacturer: "HP"
            }, {
                regex: "HPiPAQ([A-Za-z0-9]+)/(\\d+).(\\d+)",
                device_replacement: "HP iPAQ $1",
                manufacturer: "HP"
            }, {
                regex: "Palm([A-Za-z0-9]+)",
                device_replacement: "Palm $1",
                manufacturer: "Palm"
            }, {
                regex: "Treo([A-Za-z0-9]+)",
                device_replacement: "Palm Treo $1",
                manufacturer: "Palm"
            }, {
                regex: "webOS.*(P160UNA)/(\\d+).(\\d+)",
                device_replacement: "HP Veer",
                manufacturer: "HP"
            }, {
                regex: "(Kindle Fire)",
                manufacturer: "Amazon"
            }, {
                regex: "(Kindle)",
                manufacturer: "Amazon"
            }, {
                regex: "(Silk)/(\\d+)\\.(\\d+)(?:\\.([0-9\\-]+))?",
                device_replacement: "Kindle Fire",
                tablet: true,
                manufacturer: "Amazon"
            }, {
                regex: "(iPad) Simulator;",
                manufacturer: "Apple"
            }, {
                regex: "(iPad);",
                manufacturer: "Apple"
            }, {
                regex: "(iPod);",
                manufacturer: "Apple"
            }, {
                regex: "(iPhone) Simulator;",
                manufacturer: "Apple"
            }, {
                regex: "(iPhone);",
                manufacturer: "Apple"
            }, {
                regex: "Nexus\\ ([A-Za-z0-9\\-]+)",
                device_replacement: "Nexus $1"
            }, {
                regex: "acer_([A-Za-z0-9]+)_",
                device_replacement: "Acer $1",
                manufacturer: "Acer"
            }, {
                regex: "acer_([A-Za-z0-9]+)_",
                device_replacement: "Acer $1",
                manufacturer: "Acer"
            }, {
                regex: "Amoi\\-([A-Za-z0-9]+)",
                device_replacement: "Amoi $1",
                other: true,
                manufacturer: "Amoi"
            }, {
                regex: "AMOI\\-([A-Za-z0-9]+)",
                device_replacement: "Amoi $1",
                other: true,
                manufacturer: "Amoi"
            }, {
                regex: "Asus\\-([A-Za-z0-9]+)",
                device_replacement: "Asus $1",
                manufacturer: "Asus"
            }, {
                regex: "ASUS\\-([A-Za-z0-9]+)",
                device_replacement: "Asus $1",
                manufacturer: "Asus"
            }, {
                regex: "BIRD\\-([A-Za-z0-9]+)",
                device_replacement: "Bird $1",
                other: true
            }, {
                regex: "BIRD\\.([A-Za-z0-9]+)",
                device_replacement: "Bird $1",
                other: true
            }, {
                regex: "BIRD ([A-Za-z0-9]+)",
                device_replacement: "Bird $1",
                other: true
            }, {
                regex: "Dell ([A-Za-z0-9]+)",
                device_replacement: "Dell $1",
                manufacturer: "Dell"
            }, {
                regex: "DoCoMo/2\\.0 ([A-Za-z0-9]+)",
                device_replacement: "DoCoMo $1",
                other: true
            }, {
                regex: "([A-Za-z0-9]+)\\_W\\;FOMA",
                device_replacement: "DoCoMo $1",
                other: true
            }, {
                regex: "([A-Za-z0-9]+)\\;FOMA",
                device_replacement: "DoCoMo $1",
                other: true
            }, {
                regex: "vodafone([A-Za-z0-9]+)",
                device_replacement: "Huawei Vodafone $1",
                other: true
            }, {
                regex: "i\\-mate ([A-Za-z0-9]+)",
                device_replacement: "i-mate $1",
                other: true
            }, {
                regex: "Kyocera\\-([A-Za-z0-9]+)",
                device_replacement: "Kyocera $1",
                other: true
            }, {
                regex: "KWC\\-([A-Za-z0-9]+)",
                device_replacement: "Kyocera $1",
                other: true
            }, {
                regex: "Lenovo\\-([A-Za-z0-9]+)",
                device_replacement: "Lenovo $1",
                manufacturer: "Lenovo"
            }, {
                regex: "Lenovo\\_([A-Za-z0-9]+)",
                device_replacement: "Lenovo $1",
                manufacturer: "Levovo"
            }, {
                regex: "LG/([A-Za-z0-9]+)",
                device_replacement: "LG $1",
                manufacturer: "LG"
            }, {
                regex: "LG-LG([A-Za-z0-9]+)",
                device_replacement: "LG $1",
                manufacturer: "LG"
            }, {
                regex: "LGE-LG([A-Za-z0-9]+)",
                device_replacement: "LG $1",
                manufacturer: "LG"
            }, {
                regex: "LGE VX([A-Za-z0-9]+)",
                device_replacement: "LG $1",
                manufacturer: "LG"
            }, {
                regex: "LG ([A-Za-z0-9]+)",
                device_replacement: "LG $1",
                manufacturer: "LG"
            }, {
                regex: "LGE LG\\-AX([A-Za-z0-9]+)",
                device_replacement: "LG $1",
                manufacturer: "LG"
            }, {
                regex: "LG\\-([A-Za-z0-9]+)",
                device_replacement: "LG $1",
                manufacturer: "LG"
            }, {
                regex: "LGE\\-([A-Za-z0-9]+)",
                device_replacement: "LG $1",
                manufacturer: "LG"
            }, {
                regex: "LG([A-Za-z0-9]+)",
                device_replacement: "LG $1",
                manufacturer: "LG"
            }, {
                regex: "(KIN)\\.One (\\d+)\\.(\\d+)",
                device_replacement: "Microsoft $1"
            }, {
                regex: "(KIN)\\.Two (\\d+)\\.(\\d+)",
                device_replacement: "Microsoft $1"
            }, {
                regex: "(Motorola)\\-([A-Za-z0-9]+)",
                manufacturer: "Motorola"
            }, {
                regex: "MOTO\\-([A-Za-z0-9]+)",
                device_replacement: "Motorola $1",
                manufacturer: "Motorola"
            }, {
                regex: "MOT\\-([A-Za-z0-9]+)",
                device_replacement: "Motorola $1",
                manufacturer: "Motorola"
            }, {
                regex: "Philips([A-Za-z0-9]+)",
                device_replacement: "Philips $1",
                manufacturer: "Philips"
            }, {
                regex: "Philips ([A-Za-z0-9]+)",
                device_replacement: "Philips $1",
                manufacturer: "Philips"
            }, {
                regex: "SAMSUNG-([A-Za-z0-9\\-]+)",
                device_replacement: "Samsung $1",
                manufacturer: "Samsung"
            }, {
                regex: "SAMSUNG\\; ([A-Za-z0-9\\-]+)",
                device_replacement: "Samsung $1",
                manufacturer: "Samsung"
            }, {
                regex: "Softbank/1\\.0/([A-Za-z0-9]+)",
                device_replacement: "Softbank $1",
                other: true
            }, {
                regex: "Softbank/2\\.0/([A-Za-z0-9]+)",
                device_replacement: "Softbank $1",
                other: true
            }, {
                regex: "(hiptop|avantgo|plucker|xiino|blazer|elaine|up.browser|up.link|mmp|smartphone|midp|wap|vodafone|o2|pocket|mobile|pda)",
                device_replacement: "Generic Smartphone"
            }, {
                regex: "^(1207|3gso|4thp|501i|502i|503i|504i|505i|506i|6310|6590|770s|802s|a wa|acer|acs\\-|airn|alav|asus|attw|au\\-m|aur |aus |abac|acoo|aiko|alco|alca|amoi|anex|anny|anyw|aptu|arch|argo|bell|bird|bw\\-n|bw\\-u|beck|benq|bilb|blac|c55/|cdm\\-|chtm|capi|comp|cond|craw|dall|dbte|dc\\-s|dica|ds\\-d|ds12|dait|devi|dmob|doco|dopo|el49|erk0|esl8|ez40|ez60|ez70|ezos|ezze|elai|emul|eric|ezwa|fake|fly\\-|fly\\_|g\\-mo|g1 u|g560|gf\\-5|grun|gene|go.w|good|grad|hcit|hd\\-m|hd\\-p|hd\\-t|hei\\-|hp i|hpip|hs\\-c|htc |htc\\-|htca|htcg)",
                device_replacement: "Generic Feature Phone"
            }, {
                regex: "^(htcp|htcs|htct|htc\\_|haie|hita|huaw|hutc|i\\-20|i\\-go|i\\-ma|i230|iac|iac\\-|iac/|ig01|im1k|inno|iris|jata|java|kddi|kgt|kgt/|kpt |kwc\\-|klon|lexi|lg g|lg\\-a|lg\\-b|lg\\-c|lg\\-d|lg\\-f|lg\\-g|lg\\-k|lg\\-l|lg\\-m|lg\\-o|lg\\-p|lg\\-s|lg\\-t|lg\\-u|lg\\-w|lg/k|lg/l|lg/u|lg50|lg54|lge\\-|lge/|lynx|leno|m1\\-w|m3ga|m50/|maui|mc01|mc21|mcca|medi|meri|mio8|mioa|mo01|mo02|mode|modo|mot |mot\\-|mt50|mtp1|mtv |mate|maxo|merc|mits|mobi|motv|mozz|n100|n101|n102|n202|n203|n300|n302|n500|n502|n505|n700|n701|n710|nec\\-|nem\\-|newg|neon)",
                device_replacement: "Generic Feature Phone"
            }, {
                regex: "^(netf|noki|nzph|o2 x|o2\\-x|opwv|owg1|opti|oran|ot\\-s|p800|pand|pg\\-1|pg\\-2|pg\\-3|pg\\-6|pg\\-8|pg\\-c|pg13|phil|pn\\-2|pt\\-g|palm|pana|pire|pock|pose|psio|qa\\-a|qc\\-2|qc\\-3|qc\\-5|qc\\-7|qc07|qc12|qc21|qc32|qc60|qci\\-|qwap|qtek|r380|r600|raks|rim9|rove|s55/|sage|sams|sc01|sch\\-|scp\\-|sdk/|se47|sec\\-|sec0|sec1|semc|sgh\\-|shar|sie\\-|sk\\-0|sl45|slid|smb3|smt5|sp01|sph\\-|spv |spv\\-|sy01|samm|sany|sava|scoo|send|siem|smar|smit|soft|sony|t\\-mo|t218|t250|t600|t610|t618|tcl\\-|tdg\\-|telm|tim\\-|ts70|tsm\\-|tsm3|tsm5|tx\\-9|tagt)",
                device_replacement: "Generic Feature Phone"
            }, {
                regex: "^(talk|teli|topl|tosh|up.b|upg1|utst|v400|v750|veri|vk\\-v|vk40|vk50|vk52|vk53|vm40|vx98|virg|vite|voda|vulc|w3c |w3c\\-|wapj|wapp|wapu|wapm|wig |wapi|wapr|wapv|wapy|wapa|waps|wapt|winc|winw|wonu|x700|xda2|xdag|yas\\-|your|zte\\-|zeto|aste|audi|avan|blaz|brew|brvw|bumb|ccwa|cell|cldc|cmd\\-|dang|eml2|fetc|hipt|http|ibro|idea|ikom|ipaq|jbro|jemu|jigs|keji|kyoc|kyok|libw|m\\-cr|midp|mmef|moto|mwbp|mywa|newt|nok6|o2im|pant|pdxg|play|pluc|port|prox|rozo|sama|seri|smal|symb|treo|upsi|vx52|vx53|vx60|vx61|vx70|vx80|vx81|vx83|vx85|wap\\-|webc|whit|wmlb|xda\\-|xda\\_)",
                device_replacement: "Generic Feature Phone"
            }, {
                regex: "(bot|borg|google(^tv)|yahoo|slurp|msnbot|msrbot|openbot|archiver|netresearch|lycos|scooter|altavista|teoma|gigabot|baiduspider|blitzbot|oegp|charlotte|furlbot|http%20client|polybot|htdig|ichiro|mogimogi|larbin|pompos|scrubby|searchsight|seekbot|semanticdiscovery|silk|snappy|speedy|spider|voila|vortex|voyager|zao|zeal|fast\\-webcrawler|converacrawler|dataparksearch|findlinks)",
                device_replacement: "Spider"
            } ],
            mobile_browser_families: [ "Firefox Mobile", "Opera Mobile", "Opera Mini", "Mobile Safari", "webOS", "IE Mobile", "Playstation Portable", "Nokia", "Blackberry", "Palm", "Silk", "Android", "Maemo", "Obigo", "Netfront", "AvantGo", "Teleca", "SEMC-Browser", "Bolt", "Iris", "UP.Browser", "Symphony", "Minimo", "Bunjaloo", "Jasmine", "Dolfin", "Polaris", "BREW", "Chrome Mobile", "Chrome Mobile iOS", "UC Browser", "Tizen Browser" ]
        };
        // Parsers
        _this.parsers = [ "device_parsers", "browser_parsers", "os_parsers", "mobile_os_families", "mobile_browser_families" ];
        // Types
        _this.types = [ "browser", "os", "device" ];
        // Regular Expressions
        _this.regexes = regexes || function() {
            var results = {};
            _this.parsers.map(function(parser) {
                results[parser] = [];
            });
            return results;
        }();
        // Families
        _this.families = function() {
            var results = {};
            _this.types.map(function(type) {
                results[type] = [];
            });
            return results;
        }();
        // Utility Variables
        var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype, nativeForEach = ArrayProto.forEach, nativeIndexOf = ArrayProto.indexOf;
        // Find Utility
        var find = function(ua, obj) {
            var ret = {};
            for (var i = 0; i < obj.length; i++) {
                ret = obj[i](ua);
                if (ret) {
                    break;
                }
            }
            return ret;
        };
        // Remove Utility
        var remove = function(arr, props) {
            each(arr, function(obj) {
                each(props, function(prop) {
                    delete obj[prop];
                });
            });
        };
        // Contains Utility
        var contains = function(obj, target) {
            var found = false;
            if (obj == null) return found;
            if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
            found = any(obj, function(value) {
                return value === target;
            });
            return found;
        };
        // Each Utility
        var each = forEach = function(obj, iterator, context) {
            if (obj == null) return;
            if (nativeForEach && obj.forEach === nativeForEach) {
                obj.forEach(iterator, context);
            } else if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    iterator.call(context, obj[i], i, obj);
                }
            } else {
                for (var key in obj) {
                    if (_.has(obj, key)) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            }
        };
        // Extend Utiltiy
        var extend = function(obj) {
            each(slice.call(arguments, 1), function(source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            });
            return obj;
        };
        // Check String Utility
        var check = function(str) {
            return !!(str && typeof str != "undefined" && str != null);
        };
        // To Version String Utility
        var toVersionString = function(obj) {
            var output = "";
            obj = obj || {};
            if (check(obj)) {
                if (check(obj.major)) {
                    output += obj.major;
                    if (check(obj.minor)) {
                        output += "." + obj.minor;
                        if (check(obj.patch)) {
                            output += "." + obj.patch;
                        }
                    }
                }
            }
            return output;
        };
        // To String Utility
        var toString = function(obj) {
            obj = obj || {};
            var suffix = toVersionString(obj);
            if (suffix) suffix = " " + suffix;
            return obj && check(obj.family) ? obj.family + suffix : "";
        };
        // Parse User-Agent String
        _this.parse = function(ua) {
            // Parsers Utility
            var parsers = function(type) {
                return _this.regexes[type + "_parsers"].map(function(obj) {
                    var regexp = new RegExp(obj.regex), rep = obj[(type === "browser" ? "family" : type) + "_replacement"], major_rep = obj.major_version_replacement;
                    function parser(ua) {
                        var m = ua.match(regexp);
                        if (!m) return null;
                        var ret = {};
                        ret.family = (rep ? rep.replace("$1", m[1]) : m[1]) || "other";
                        ret.major = parseInt(major_rep ? major_rep : m[2]) || null;
                        ret.minor = m[3] ? parseInt(m[3]) : null;
                        ret.patch = m[4] ? parseInt(m[4]) : null;
                        ret.tablet = obj.tablet;
                        ret.man = obj.manufacturer || null;
                        return ret;
                    }
                    return parser;
                });
            };
            // User Agent
            var UserAgent = function() {};
            // Browsers Parsed
            var browser_parsers = parsers("browser");
            // Operating Systems Parsed
            var os_parsers = parsers("os");
            // Devices Parsed
            var device_parsers = parsers("device");
            // Set Agent
            var a = new UserAgent();
            // Remember the original user agent string
            a.source = ua;
            // Set Browser
            a.browser = find(ua, browser_parsers);
            if (check(a.browser)) {
                a.browser.name = toString(a.browser);
                a.browser.version = toVersionString(a.browser);
            } else {
                a.browser = {};
            }
            // Set OS
            a.os = find(ua, os_parsers);
            if (check(a.os)) {
                a.os.name = toString(a.os);
                a.os.version = toVersionString(a.os);
            } else {
                a.os = {};
            }
            // Set Device
            a.device = find(ua, device_parsers);
            if (check(a.device)) {
                a.device.name = toString(a.device);
                a.device.version = toVersionString(a.device);
            } else {
                a.device = {
                    tablet: false,
                    family: "Other"
                };
            }
            // Determine Device Type
            var mobile_agents = {};
            var mobile_browser_families = _this.regexes.mobile_browser_families.map(function(str) {
                mobile_agents[str] = true;
            });
            var mobile_os_families = _this.regexes.mobile_os_families.map(function(str) {
                mobile_agents[str] = true;
            });
            // Is Spider
            if (a.browser.family === "Spider") {
                a.device.type = "Spider";
            } else if (a.browser.tablet || a.os.tablet || a.device.tablet) {
                a.device.type = "Tablet";
            } else if (mobile_agents.hasOwnProperty(a.browser.family)) {
                a.device.type = "Mobile";
            } else {
                a.device.type = "Desktop";
            }
            // Determine Device Manufacturer
            a.device.manufacturer = a.browser.man || a.os.man || a.device.man || null;
            // Cleanup Objects
            remove([ a.browser, a.os, a.device ], [ "tablet", "man" ]);
            // Return Agent
            return a;
        };
        // Return context
        return _this;
    }();
    // Export the Underscore object for **Node.js** and **"CommonJS"**,
    // backwards-compatibility for the old `require()` API. If we're not
    // CommonJS, add `_` to the global object via a string identifier
    // the Closure Compiler "advanced" mode. Registration as an AMD
    // via define() happens at the end of this file
    if (typeof exports !== "undefined") {
        if (typeof module !== "undefined" && module.exports) {
            exports = module.exports = detect;
        }
        exports.detect = detect;
    } else {
        root["detect"] = detect;
    }
    // AMD define happens at the end for compatibility with AMD
    // that don't enforce next-turn semantics on modules
    if (typeof define === "function" && define.amd) {
        define(function(require) {
            return detect;
        });
    }
})(window);;/*! =======================================================================
 * Fancyfy Fields: fancyfy-fields.js v1.0.0
 * ========================================================================
 * Copyright 2016 Judit Hummel
 * ======================================================================== */

function fancyfyFields(els) {
  els = els || $('.fancy-field');

  var fancyField = els;
  var fancyInput = fancyField.find('input[type=text],input[type=password],input[type=email],input[type=number],input[type=tel]');
  var fancySelect = fancyField.find('select');
  var fancyFields = fancyInput.add(fancySelect);

  // focus and blur
  fancyFields.focus(function() {
    $(this).parent('.fancy-field').addClass('focused');
  });
  fancyFields.blur(function() {
    $(this).parent('.fancy-field').removeClass('focused');
  });

  // insert faux placeholder to each .fancy-field element
  // check if field already has a value, if yes then initialize with faux placeholder visible
  fancyFields.each(function() {

    // create faux placeholder for <input> element
    if ($(this).is('input')) {
      var palceHolderText = $(this).attr('placeholder');

      if ($(this).val() != '') {
        $(this)
          .addClass('hasvalue')
          .parent('.fancy-field').addClass('active');
      } else {
        $(this)
          .removeClass('hasvalue')
          .parent('.fancy-field').removeClass('active');
      }

      // create faux placeholder for <select> element
    } else if ($(this).is('select')) {
      var palceHolderText = $(this).children('option[value="placeholder"]').text();

      if ($(this).val() !== 'placeholder') {
        $(this)
          .addClass('hasvalue')
          .parent('.fancy-field').addClass('active');
      } else {
        $(this)
          .removeClass('hasvalue')
          .parent('.fancy-field').removeClass('active');
      }
    }

    // add faux placeholder to element
    var fancyLabel = '<span>' + palceHolderText + '</span>';
    $(this).before(fancyLabel);

  });

  // basic JS throttle function
  function throttle(fn, threshhold, scope) {
    threshhold || (threshhold = 250);
    var last,
      deferTimer;
    return function () {
      var context = scope || this;
      var now = +new Date,
        args = arguments;
      if (last && now < last + threshhold) {
        clearTimeout(deferTimer);
        deferTimer = setTimeout(function () {
          last = now;
          fn.apply(context, args);
        }, threshhold);
      } else {
        last = now;
        fn.apply(context, args);
      }
    };
  }

  // show/hide <input> element faux placeholder when user types/deletes
  // use JS throttle to prevent animation jitter during typing
  fancyInput.keyup(throttle(function(){
    if ($(this).val()) {
      $(this)
        .addClass('hasvalue')
        .parent('.fancy-field').addClass('active');
    } else {
      $(this)
        .removeClass('hasvalue')
        .parent('.fancy-field').removeClass('active');
    }
  },300)); // set to same time as css transition-duration

  // show/hide <select> element faux placeholder on change
  fancySelect.change(function() {
    console.log($(this).val())
    console.log('e')
    if ($(this).val() !== 'placeholder') {
      $(this)
        .addClass('hasvalue')
        .parent('.fancy-field').addClass('active');
    } else {
      $(this)
        .removeClass('hasvalue')
        .parent('.fancy-field').removeClass('active');
    }
  });
};
;/*
  html2canvas 0.5.0-alpha1 <http://html2canvas.hertzen.com>
  Copyright (c) 2015 Niklas von Hertzen

  Released under MIT License
*/
(function(a,b,c,d,e,f){function g(a,b,c,d,e){return p(a,a,c,d,b,a.defaultView.pageXOffset,a.defaultView.pageYOffset).then(function(f){I("Document cloned");var g=Vb+e,i="["+g+"='"+e+"']";a.querySelector(i).removeAttribute(g);var j=f.contentWindow,k=j.document.querySelector(i),l=Promise.resolve("function"==typeof b.onclone?b.onclone(j.document):!0);return l.then(function(){return h(k,f,b,c,d)})})}function h(a,c,d,e,f){var g=c.contentWindow,h=new Lb(g.document),m=new G(d,h),n=Q(a),o="view"===d.type?e:k(g.document),p="view"===d.type?f:l(g.document),q=new d.renderer(o,p,m,d,b),r=new S(a,q,h,m,d);return r.ready.then(function(){I("Finished rendering");var b;return b="view"===d.type?j(q.canvas,{width:q.canvas.width,height:q.canvas.height,top:0,left:0,x:0,y:0}):a===g.document.body||a===g.document.documentElement||null!=d.canvas?q.canvas:j(q.canvas,{width:null!=d.width?d.width:n.width,height:null!=d.height?d.height:n.height,top:n.top,left:n.left,x:g.pageXOffset,y:g.pageYOffset}),i(c,d),b})}function i(a,b){b.removeContainer&&(a.parentNode.removeChild(a),I("Cleaned up container"))}function j(a,c){var d=b.createElement("canvas"),e=Math.min(a.width-1,Math.max(0,c.left)),f=Math.min(a.width,Math.max(1,c.left+c.width)),g=Math.min(a.height-1,Math.max(0,c.top)),h=Math.min(a.height,Math.max(1,c.top+c.height));return d.width=c.width,d.height=c.height,I("Cropping canvas at:","left:",c.left,"top:",c.top,"width:",f-e,"height:",h-g),I("Resulting crop with width",c.width,"and height",c.height," with x",e,"and y",g),d.getContext("2d").drawImage(a,e,g,f-e,h-g,c.x,c.y,f-e,h-g),d}function k(a){return Math.max(Math.max(a.body.scrollWidth,a.documentElement.scrollWidth),Math.max(a.body.offsetWidth,a.documentElement.offsetWidth),Math.max(a.body.clientWidth,a.documentElement.clientWidth))}function l(a){return Math.max(Math.max(a.body.scrollHeight,a.documentElement.scrollHeight),Math.max(a.body.offsetHeight,a.documentElement.offsetHeight),Math.max(a.body.clientHeight,a.documentElement.clientHeight))}function m(){return"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}function n(){return b.documentMode&&b.documentMode<=9}function o(a,c){for(var d=3===a.nodeType?b.createTextNode(a.nodeValue):a.cloneNode(!1),e=a.firstChild;e;)(c===!0||1!==e.nodeType||"SCRIPT"!==e.nodeName)&&d.appendChild(o(e,c)),e=e.nextSibling;return d}function p(a,b,c,d,e,f,g){u(a);var h=n()?o(a.documentElement,e.javascriptEnabled):a.documentElement.cloneNode(!0),i=b.createElement("iframe");return i.className="html2canvas-container",i.style.visibility="hidden",i.style.position="fixed",i.style.left="-10000px",i.style.top="0px",i.style.border="0",i.width=c,i.height=d,i.scrolling="no",b.body.appendChild(i),new Promise(function(b){var c=i.contentWindow.document;q(a.documentElement,h,"textarea"),q(a.documentElement,h,"select"),i.contentWindow.onload=i.onload=function(){var d=setInterval(function(){c.body.childNodes.length>0&&(v(a,c),clearInterval(d),"view"===e.type&&i.contentWindow.scrollTo(f,g),b(i))},50)},c.open(),c.write("<!DOCTYPE html><html></html>"),r(a,f,g),c.replaceChild(e.javascriptEnabled===!0?c.adoptNode(h):w(c.adoptNode(h)),c.documentElement),c.close()})}function q(a,b,c){for(var d=a.getElementsByTagName(c),e=b.getElementsByTagName(c),f=d.length,g=0;f>g;g++)e[g].value=d[g].value}function r(a,b,c){!a.defaultView||b===a.defaultView.pageXOffset&&c===a.defaultView.pageYOffset||a.defaultView.scrollTo(b,c)}function s(b,c,d,e,f,g){return new Cb(b,c,a.document).then(t(b)).then(function(a){return p(a,d,e,f,g,0,0)})}function t(a){return function(c){var d,e=new DOMParser;try{d=e.parseFromString(c,"text/html")}catch(f){I("DOMParser not supported, falling back to createHTMLDocument"),d=b.implementation.createHTMLDocument("");try{d.open(),d.write(c),d.close()}catch(g){I("createHTMLDocument write not supported, falling back to document.body.innerHTML"),d.body.innerHTML=c}}var h=d.querySelector("base");if(!h||!h.href.host){var i=d.createElement("base");i.href=a,d.head.insertBefore(i,d.head.firstChild)}return d}}function u(a){[].slice.call(a.querySelectorAll("canvas"),0).forEach(function(a){a.setAttribute(Wb,"canvas-"+Xb++)})}function v(a,b){[].slice.call(a.querySelectorAll("["+Wb+"]"),0).forEach(function(a){try{var c=b.querySelector("["+Wb+'="'+a.getAttribute(Wb)+'"]');c&&(c.width=a.width,c.height=a.height,c.getContext("2d").putImageData(a.getContext("2d").getImageData(0,0,a.width,a.height),0,0))}catch(d){I("Unable to copy canvas content from",a,d)}a.removeAttribute(Wb)})}function w(a){return[].slice.call(a.childNodes,0).filter(x).forEach(function(b){"SCRIPT"===b.tagName?a.removeChild(b):w(b)}),a}function x(a){return a.nodeType===Node.ELEMENT_NODE}function y(a){var c=b.createElement("a");return c.href=a,c.href=c.href,c}function z(a){this.r=0,this.g=0,this.b=0,this.a=null;this.fromArray(a)||this.namedColor(a)||this.rgb(a)||this.rgba(a)||this.hex6(a)||this.hex3(a)}function A(a){if(this.src=a,I("DummyImageContainer for",a),!this.promise||!this.image){I("Initiating DummyImageContainer"),A.prototype.image=new Image;var b=this.image;A.prototype.promise=new Promise(function(a,c){b.onload=a,b.onerror=c,b.src=m(),b.complete===!0&&a(b)})}}function B(a,c){var d,e,f=b.createElement("div"),g=b.createElement("img"),h=b.createElement("span"),i="Hidden Text";f.style.visibility="hidden",f.style.fontFamily=a,f.style.fontSize=c,f.style.margin=0,f.style.padding=0,b.body.appendChild(f),g.src=m(),g.width=1,g.height=1,g.style.margin=0,g.style.padding=0,g.style.verticalAlign="baseline",h.style.fontFamily=a,h.style.fontSize=c,h.style.margin=0,h.style.padding=0,h.appendChild(b.createTextNode(i)),f.appendChild(h),f.appendChild(g),d=g.offsetTop-h.offsetTop+1,f.removeChild(h),f.appendChild(b.createTextNode(i)),f.style.lineHeight="normal",g.style.verticalAlign="super",e=g.offsetTop-f.offsetTop+1,b.body.removeChild(f),this.baseline=d,this.lineWidth=1,this.middle=e}function C(){this.data={}}function D(a,b,c){this.image=null,this.src=a;var d=this,e=Q(a);this.promise=(b?new Promise(function(b){"about:blank"===a.contentWindow.document.URL||null==a.contentWindow.document.documentElement?a.contentWindow.onload=a.onload=function(){b(a)}:b(a)}):this.proxyLoad(c.proxy,e,c)).then(function(a){return html2canvas(a.contentWindow.document.documentElement,{type:"view",width:a.width,height:a.height,proxy:c.proxy,javascriptEnabled:c.javascriptEnabled,removeContainer:c.removeContainer,allowTaint:c.allowTaint,imageTimeout:c.imageTimeout/2})}).then(function(a){return d.image=a})}function E(a){this.src=a.value,this.colorStops=[],this.type=null,this.x0=.5,this.y0=.5,this.x1=.5,this.y1=.5,this.promise=Promise.resolve(!0)}function F(a,b){this.src=a,this.image=new Image;var c=this;this.tainted=null,this.promise=new Promise(function(d,e){c.image.onload=d,c.image.onerror=e,b&&(c.image.crossOrigin="anonymous"),c.image.src=a,c.image.complete===!0&&d(c.image)})}function G(b,c){this.link=null,this.options=b,this.support=c,this.origin=this.getOrigin(a.location.href)}function H(a){E.apply(this,arguments),this.type=this.TYPES.LINEAR;var b=null===a.args[0].match(this.stepRegExp);b?a.args[0].split(" ").reverse().forEach(function(a){switch(a){case"left":this.x0=0,this.x1=1;break;case"top":this.y0=0,this.y1=1;break;case"right":this.x0=1,this.x1=0;break;case"bottom":this.y0=1,this.y1=0;break;case"to":var b=this.y0,c=this.x0;this.y0=this.y1,this.x0=this.x1,this.x1=c,this.y1=b}},this):(this.y0=0,this.y1=1),this.colorStops=a.args.slice(b?1:0).map(function(a){var b=a.match(this.stepRegExp);return{color:new z(b[1]),stop:"%"===b[3]?b[2]/100:null}},this),null===this.colorStops[0].stop&&(this.colorStops[0].stop=0),null===this.colorStops[this.colorStops.length-1].stop&&(this.colorStops[this.colorStops.length-1].stop=1),this.colorStops.forEach(function(a,b){null===a.stop&&this.colorStops.slice(b).some(function(c,d){return null!==c.stop?(a.stop=(c.stop-this.colorStops[b-1].stop)/(d+1)+this.colorStops[b-1].stop,!0):!1},this)},this)}function I(){a.html2canvas.logging&&a.console&&a.console.log&&Function.prototype.bind.call(a.console.log,a.console).apply(a.console,[Date.now()-a.html2canvas.start+"ms","html2canvas:"].concat([].slice.call(arguments,0)))}function J(a,b){this.node=a,this.parent=b,this.stack=null,this.bounds=null,this.borders=null,this.clip=[],this.backgroundClip=[],this.offsetBounds=null,this.visible=null,this.computedStyles=null,this.colors={},this.styles={},this.backgroundImages=null,this.transformData=null,this.transformMatrix=null,this.isPseudoElement=!1,this.opacity=null}function K(a){var b=a.options[a.selectedIndex||0];return b?b.text||"":""}function L(a){return a&&"matrix"===a[1]?a[2].split(",").map(function(a){return parseFloat(a.trim())}):void 0}function M(a){return-1!==a.toString().indexOf("%")}function N(a){var b,c,d,e,f,g,h,i=" \r\n	",j=[],k=0,l=0,m=function(){b&&('"'===c.substr(0,1)&&(c=c.substr(1,c.length-2)),c&&h.push(c),"-"===b.substr(0,1)&&(e=b.indexOf("-",1)+1)>0&&(d=b.substr(0,e),b=b.substr(e)),j.push({prefix:d,method:b.toLowerCase(),value:f,args:h,image:null})),h=[],b=d=c=f=""};return h=[],b=d=c=f="",a.split("").forEach(function(a){if(!(0===k&&i.indexOf(a)>-1)){switch(a){case'"':g?g===a&&(g=null):g=a;break;case"(":if(g)break;if(0===k)return k=1,void(f+=a);l++;break;case")":if(g)break;if(1===k){if(0===l)return k=0,f+=a,void m();l--}break;case",":if(g)break;if(0===k)return void m();if(1===k&&0===l&&!b.match(/^url$/i))return h.push(c),c="",void(f+=a)}f+=a,0===k?b+=a:c+=a}}),m(),j}function O(a){return a.replace("px","")}function P(a){return parseFloat(a)}function Q(a){if(a.getBoundingClientRect){var b=a.getBoundingClientRect(),c=null==a.offsetWidth?b.width:a.offsetWidth;return{top:b.top,bottom:b.bottom||b.top+b.height,right:b.left+c,left:b.left,width:c,height:null==a.offsetHeight?b.height:a.offsetHeight}}return{}}function R(a){var b=a.offsetParent?R(a.offsetParent):{top:0,left:0};return{top:a.offsetTop+b.top,bottom:a.offsetTop+a.offsetHeight+b.top,right:a.offsetLeft+b.left+a.offsetWidth,left:a.offsetLeft+b.left,width:a.offsetWidth,height:a.offsetHeight}}function S(a,b,c,d,e){I("Starting NodeParser"),this.renderer=b,this.options=e,this.range=null,this.support=c,this.renderQueue=[],this.stack=new Kb(!0,1,a.ownerDocument,null);var f=new J(a,null);if(e.background&&b.rectangle(0,0,b.width,b.height,new z(e.background)),a===a.ownerDocument.documentElement){var g=new J(f.color("backgroundColor").isTransparent()?a.ownerDocument.body:a.ownerDocument.documentElement,null);b.rectangle(0,0,b.width,b.height,g.color("backgroundColor"))}f.visibile=f.isElementVisible(),this.createPseudoHideStyles(a.ownerDocument),this.disableAnimations(a.ownerDocument),this.nodes=xb([f].concat(this.getChildren(f)).filter(function(a){return a.visible=a.isElementVisible()}).map(this.getPseudoElements,this)),this.fontMetrics=new C,I("Fetched nodes, total:",this.nodes.length),I("Calculate overflow clips"),this.calculateOverflowClips(),I("Start fetching images"),this.images=d.fetch(this.nodes.filter(ob)),this.ready=this.images.ready.then(tb(function(){return I("Images loaded, starting parsing"),I("Creating stacking contexts"),this.createStackingContexts(),I("Sorting stacking contexts"),this.sortStackingContexts(this.stack),this.parse(this.stack),I("Render queue created with "+this.renderQueue.length+" items"),new Promise(tb(function(a){e.async?"function"==typeof e.async?e.async.call(this,this.renderQueue,a):this.renderQueue.length>0?(this.renderIndex=0,this.asyncRenderer(this.renderQueue,a)):a():(this.renderQueue.forEach(this.paint,this),a())},this))},this))}function T(a){return a.parent&&a.parent.clip.length}function U(a){return a.replace(/(\-[a-z])/g,function(a){return a.toUpperCase().replace("-","")})}function V(){}function W(a,b,c,d){return a.map(function(e,f){if(e.width>0){var g=b.left,h=b.top,i=b.width,j=b.height-a[2].width;switch(f){case 0:j=a[0].width,e.args=$({c1:[g,h],c2:[g+i,h],c3:[g+i-a[1].width,h+j],c4:[g+a[3].width,h+j]},d[0],d[1],c.topLeftOuter,c.topLeftInner,c.topRightOuter,c.topRightInner);break;case 1:g=b.left+b.width-a[1].width,i=a[1].width,e.args=$({c1:[g+i,h],c2:[g+i,h+j+a[2].width],c3:[g,h+j],c4:[g,h+a[0].width]},d[1],d[2],c.topRightOuter,c.topRightInner,c.bottomRightOuter,c.bottomRightInner);break;case 2:h=h+b.height-a[2].width,j=a[2].width,e.args=$({c1:[g+i,h+j],c2:[g,h+j],c3:[g+a[3].width,h],c4:[g+i-a[3].width,h]},d[2],d[3],c.bottomRightOuter,c.bottomRightInner,c.bottomLeftOuter,c.bottomLeftInner);break;case 3:i=a[3].width,e.args=$({c1:[g,h+j+a[2].width],c2:[g,h],c3:[g+i,h+a[0].width],c4:[g+i,h+j]},d[3],d[0],c.bottomLeftOuter,c.bottomLeftInner,c.topLeftOuter,c.topLeftInner)}}return e})}function X(a,b,c,d){var e=4*((Math.sqrt(2)-1)/3),f=c*e,g=d*e,h=a+c,i=b+d;return{topLeft:Z({x:a,y:i},{x:a,y:i-g},{x:h-f,y:b},{x:h,y:b}),topRight:Z({x:a,y:b},{x:a+f,y:b},{x:h,y:i-g},{x:h,y:i}),bottomRight:Z({x:h,y:b},{x:h,y:b+g},{x:a+f,y:i},{x:a,y:i}),bottomLeft:Z({x:h,y:i},{x:h-f,y:i},{x:a,y:b+g},{x:a,y:b})}}function Y(a,b,c){var d=a.left,e=a.top,f=a.width,g=a.height,h=b[0][0],i=b[0][1],j=b[1][0],k=b[1][1],l=b[2][0],m=b[2][1],n=b[3][0],o=b[3][1],p=f-j,q=g-m,r=f-l,s=g-o;return{topLeftOuter:X(d,e,h,i).topLeft.subdivide(.5),topLeftInner:X(d+c[3].width,e+c[0].width,Math.max(0,h-c[3].width),Math.max(0,i-c[0].width)).topLeft.subdivide(.5),topRightOuter:X(d+p,e,j,k).topRight.subdivide(.5),topRightInner:X(d+Math.min(p,f+c[3].width),e+c[0].width,p>f+c[3].width?0:j-c[3].width,k-c[0].width).topRight.subdivide(.5),bottomRightOuter:X(d+r,e+q,l,m).bottomRight.subdivide(.5),bottomRightInner:X(d+Math.min(r,f-c[3].width),e+Math.min(q,g+c[0].width),Math.max(0,l-c[1].width),m-c[2].width).bottomRight.subdivide(.5),bottomLeftOuter:X(d,e+s,n,o).bottomLeft.subdivide(.5),bottomLeftInner:X(d+c[3].width,e+s,Math.max(0,n-c[3].width),o-c[2].width).bottomLeft.subdivide(.5)}}function Z(a,b,c,d){var e=function(a,b,c){return{x:a.x+(b.x-a.x)*c,y:a.y+(b.y-a.y)*c}};return{start:a,startControl:b,endControl:c,end:d,subdivide:function(f){var g=e(a,b,f),h=e(b,c,f),i=e(c,d,f),j=e(g,h,f),k=e(h,i,f),l=e(j,k,f);return[Z(a,g,j,l),Z(l,k,i,d)]},curveTo:function(a){a.push(["bezierCurve",b.x,b.y,c.x,c.y,d.x,d.y])},curveToReversed:function(d){d.push(["bezierCurve",c.x,c.y,b.x,b.y,a.x,a.y])}}}function $(a,b,c,d,e,f,g){var h=[];return b[0]>0||b[1]>0?(h.push(["line",d[1].start.x,d[1].start.y]),d[1].curveTo(h)):h.push(["line",a.c1[0],a.c1[1]]),c[0]>0||c[1]>0?(h.push(["line",f[0].start.x,f[0].start.y]),f[0].curveTo(h),h.push(["line",g[0].end.x,g[0].end.y]),g[0].curveToReversed(h)):(h.push(["line",a.c2[0],a.c2[1]]),h.push(["line",a.c3[0],a.c3[1]])),b[0]>0||b[1]>0?(h.push(["line",e[1].end.x,e[1].end.y]),e[1].curveToReversed(h)):h.push(["line",a.c4[0],a.c4[1]]),h}function _(a,b,c,d,e,f,g){b[0]>0||b[1]>0?(a.push(["line",d[0].start.x,d[0].start.y]),d[0].curveTo(a),d[1].curveTo(a)):a.push(["line",f,g]),(c[0]>0||c[1]>0)&&a.push(["line",e[0].start.x,e[0].start.y])}function ab(a){return a.cssInt("zIndex")<0}function bb(a){return a.cssInt("zIndex")>0}function cb(a){return 0===a.cssInt("zIndex")}function db(a){return-1!==["inline","inline-block","inline-table"].indexOf(a.css("display"))}function eb(a){return a instanceof Kb}function fb(a){return a.node.data.trim().length>0}function gb(a){return/^(normal|none|0px)$/.test(a.parent.css("letterSpacing"))}function hb(a){return["TopLeft","TopRight","BottomRight","BottomLeft"].map(function(b){var c=a.css("border"+b+"Radius"),d=c.split(" ");return d.length<=1&&(d[1]=d[0]),d.map(ub)})}function ib(a){return a.nodeType===Node.TEXT_NODE||a.nodeType===Node.ELEMENT_NODE}function jb(a){var b=a.css("position"),c=-1!==["absolute","relative","fixed"].indexOf(b)?a.css("zIndex"):"auto";return"auto"!==c}function kb(a){return"static"!==a.css("position")}function lb(a){return"none"!==a.css("float")}function mb(a){return-1!==["inline-block","inline-table"].indexOf(a.css("display"))}function nb(a){var b=this;return function(){return!a.apply(b,arguments)}}function ob(a){return a.node.nodeType===Node.ELEMENT_NODE}function pb(a){return a.isPseudoElement===!0}function qb(a){return a.node.nodeType===Node.TEXT_NODE}function rb(a){return function(b,c){return b.cssInt("zIndex")+a.indexOf(b)/a.length-(c.cssInt("zIndex")+a.indexOf(c)/a.length)}}function sb(a){return a.getOpacity()<1}function tb(a,b){return function(){return a.apply(b,arguments)}}function ub(a){return parseInt(a,10)}function vb(a){return a.width}function wb(a){return a.node.nodeType!==Node.ELEMENT_NODE||-1===["SCRIPT","HEAD","TITLE","OBJECT","BR","OPTION"].indexOf(a.node.nodeName)}function xb(a){return[].concat.apply([],a)}function yb(a){var b=a.substr(0,1);return b===a.substr(a.length-1)&&b.match(/'|"/)?a.substr(1,a.length-2):a}function zb(b){for(var c,d=[],e=0,f=!1;b.length;)Ab(b[e])===f?(c=b.splice(0,e),c.length&&d.push(a.html2canvas.punycode.ucs2.encode(c)),f=!f,e=0):e++,e>=b.length&&(c=b.splice(0,e),c.length&&d.push(a.html2canvas.punycode.ucs2.encode(c)));return d}function Ab(a){return-1!==[32,13,10,9,45].indexOf(a)}function Bb(a){return/[^\u0000-\u00ff]/.test(a)}function Cb(a,b,c){if(!b)return Promise.reject("No proxy configured");var d=Fb(ec),e=Gb(b,a,d);return ec?Sb(e):Eb(c,e,d).then(function(a){return Nb(a.content)})}function Db(a,b,c){var d=Fb(fc),e=Gb(b,a,d);return fc?Promise.resolve(e):Eb(c,e,d).then(function(a){return"data:"+a.type+";base64,"+a.content})}function Eb(b,c,d){return new Promise(function(e,f){var g=b.createElement("script"),h=function(){delete a.html2canvas.proxy[d],b.body.removeChild(g)};a.html2canvas.proxy[d]=function(a){h(),e(a)},g.src=c,g.onerror=function(a){h(),f(a)},b.body.appendChild(g)})}function Fb(a){return a?"":"html2canvas_"+Date.now()+"_"+ ++dc+"_"+Math.round(1e5*Math.random())}function Gb(a,b,c){return a+"?url="+encodeURIComponent(b)+(c.length?"&callback=html2canvas.proxy."+c:"")}function Hb(a,c){var d=(b.createElement("script"),b.createElement("a"));d.href=a,a=d.href,this.src=a,this.image=new Image;var e=this;this.promise=new Promise(function(d,f){e.image.crossOrigin="Anonymous",e.image.onload=d,e.image.onerror=f,new Db(a,c,b).then(function(a){e.image.src=a})["catch"](f)})}function Ib(a,b,c){J.call(this,a,b),this.isPseudoElement=!0,this.before=":before"===c}function Jb(a,b,c,d,e){this.width=a,this.height=b,this.images=c,this.options=d,this.document=e}function Kb(a,b,c,d){J.call(this,c,d),this.ownStacking=a,this.contexts=[],this.children=[],this.opacity=(this.parent?this.parent.stack.opacity:1)*b}function Lb(a){this.rangeBounds=this.testRangeBounds(a),this.cors=this.testCORS(),this.svg=this.testSVG()}function Mb(a){this.src=a,this.image=null;var b=this;this.promise=this.hasFabric().then(function(){return b.isInline(a)?Promise.resolve(b.inlineFormatting(a)):Sb(a)}).then(function(a){return new Promise(function(c){html2canvas.fabric.loadSVGFromString(a,b.createCanvas.call(b,c))})})}function Nb(a){var b,c,d,e,f,g,h,i,j="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",k=a.length,l="";for(b=0;k>b;b+=4)c=j.indexOf(a[b]),d=j.indexOf(a[b+1]),e=j.indexOf(a[b+2]),f=j.indexOf(a[b+3]),g=c<<2|d>>4,h=(15&d)<<4|e>>2,i=(3&e)<<6|f,l+=64===e?String.fromCharCode(g):64===f||-1===f?String.fromCharCode(g,h):String.fromCharCode(g,h,i);return l}function Ob(a,b){this.src=a,this.image=null;var c=this;this.promise=b?new Promise(function(b,d){c.image=new Image,c.image.onload=b,c.image.onerror=d,c.image.src="data:image/svg+xml,"+(new XMLSerializer).serializeToString(a),c.image.complete===!0&&b(c.image)}):this.hasFabric().then(function(){return new Promise(function(b){html2canvas.fabric.parseSVGDocument(a,c.createCanvas.call(c,b))})})}function Pb(a,b){J.call(this,a,b)}function Qb(a,b,c){return a.length>0?b+c.toUpperCase():void 0}function Rb(a){E.apply(this,arguments),this.type="linear"===a.args[0]?this.TYPES.LINEAR:this.TYPES.RADIAL}function Sb(a){return new Promise(function(b,c){var d=new XMLHttpRequest;d.open("GET",a),d.onload=function(){200===d.status?b(d.responseText):c(new Error(d.statusText))},d.onerror=function(){c(new Error("Network Error"))},d.send()})}function Tb(a,b){Jb.apply(this,arguments),this.canvas=this.options.canvas||this.document.createElement("canvas"),this.options.canvas||(this.canvas.width=a,this.canvas.height=b),this.ctx=this.canvas.getContext("2d"),this.taintCtx=this.document.createElement("canvas").getContext("2d"),this.ctx.textBaseline="bottom",this.variables={},I("Initialized CanvasRenderer with size",a,"x",b)}function Ub(a){return a.length>0}if(function(){function c(a,b){F[C]=a,F[C+1]=b,C+=2,2===C&&A()}function f(a){return"function"==typeof a}function g(){return function(){process.nextTick(k)}}function h(){var a=0,c=new E(k),d=b.createTextNode("");return c.observe(d,{characterData:!0}),function(){d.data=a=++a%2}}function i(){var a=new MessageChannel;return a.port1.onmessage=k,function(){a.port2.postMessage(0)}}function j(){return function(){setTimeout(k,1)}}function k(){for(var a=0;C>a;a+=2)F[a](F[a+1]),F[a]=void 0,F[a+1]=void 0;C=0}function l(){}function m(a,b,c,d){try{a.call(b,c,d)}catch(e){return e}}function n(a,b,d){c(function(a){var c=!1,e=m(d,b,function(d){c||(c=!0,b!==d?p(a,d):r(a,d))},function(b){c||(c=!0,s(a,b))});!c&&e&&(c=!0,s(a,e))},a)}function o(a,b){1===b.a?r(a,b.b):2===a.a?s(a,b.b):t(b,void 0,function(b){p(a,b)},function(b){s(a,b)})}function p(a,b){if(a===b)s(a,new TypeError("You cannot resolve a promise with itself"));else if("function"==typeof b||"object"==typeof b&&null!==b)if(b.constructor===a.constructor)o(a,b);else{var c;try{c=b.then}catch(d){G.error=d,c=G}c===G?s(a,G.error):void 0===c?r(a,b):f(c)?n(a,b,c):r(a,b)}else r(a,b)}function q(a){a.f&&a.f(a.b),u(a)}function r(a,b){void 0===a.a&&(a.b=b,a.a=1,0!==a.e.length&&c(u,a))}function s(a,b){void 0===a.a&&(a.a=2,a.b=b,c(q,a))}function t(a,b,d,e){var f=a.e,g=f.length;a.f=null,f[g]=b,f[g+1]=d,f[g+2]=e,0===g&&a.a&&c(u,a)}function u(a){var b=a.e,c=a.a;if(0!==b.length){for(var d,e,f=a.b,g=0;g<b.length;g+=3)d=b[g],e=b[g+c],d?w(c,d,e,f):e(f);a.e.length=0}}function v(){this.error=null}function w(a,b,c,d){var e,g,h,i,j=f(c);if(j){try{e=c(d)}catch(k){H.error=k,e=H}if(e===H?(i=!0,g=e.error,e=null):h=!0,b===e)return void s(b,new TypeError("A promises callback cannot return that same promise."))}else e=d,h=!0;void 0===b.a&&(j&&h?p(b,e):i?s(b,g):1===a?r(b,e):2===a&&s(b,e))}function x(a,b){try{b(function(b){p(a,b)},function(b){s(a,b)})}catch(c){s(a,c)}}function y(a,b,c,d){this.n=a,this.c=new a(l,d),this.i=c,this.o(b)?(this.m=b,this.d=this.length=b.length,this.l(),0===this.length?r(this.c,this.b):(this.length=this.length||0,this.k(),0===this.d&&r(this.c,this.b))):s(this.c,this.p())}function z(a){if(I++,this.b=this.a=void 0,this.e=[],l!==a){if(!f(a))throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");if(!(this instanceof z))throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");x(this,a)}}var A,B=Array.isArray?Array.isArray:function(a){return"[object Array]"===Object.prototype.toString.call(a)},C=0,D="undefined"!=typeof a?a:{},E=D.MutationObserver||D.WebKitMutationObserver,D="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel,F=Array(1e3);A="undefined"!=typeof process&&"[object process]"==={}.toString.call(process)?g():E?h():D?i():j();var G=new v,H=new v;y.prototype.o=function(a){return B(a)},y.prototype.p=function(){return Error("Array Methods must be provided an Array")},y.prototype.l=function(){this.b=Array(this.length)},y.prototype.k=function(){for(var a=this.length,b=this.c,c=this.m,d=0;void 0===b.a&&a>d;d++)this.j(c[d],d)},y.prototype.j=function(a,b){var c=this.n;"object"==typeof a&&null!==a?a.constructor===c&&void 0!==a.a?(a.f=null,this.g(a.a,b,a.b)):this.q(c.resolve(a),b):(this.d--,this.b[b]=this.h(a))},y.prototype.g=function(a,b,c){var d=this.c;void 0===d.a&&(this.d--,this.i&&2===a?s(d,c):this.b[b]=this.h(c)),0===this.d&&r(d,this.b)},y.prototype.h=function(a){return a},y.prototype.q=function(a,b){var c=this;t(a,void 0,function(a){c.g(1,b,a)},function(a){c.g(2,b,a)})};var I=0;z.all=function(a,b){return new y(this,a,!0,b).c},z.race=function(a,b){function c(a){p(e,a)}function d(a){s(e,a)}var e=new this(l,b);if(!B(a))return s(e,new TypeError("You must pass an array to race.")),e;for(var f=a.length,g=0;void 0===e.a&&f>g;g++)t(this.resolve(a[g]),void 0,c,d);return e},z.resolve=function(a,b){if(a&&"object"==typeof a&&a.constructor===this)return a;var c=new this(l,b);return p(c,a),c},z.reject=function(a,b){var c=new this(l,b);return s(c,a),c},z.prototype={constructor:z,then:function(a,b){var d=this.a;if(1===d&&!a||2===d&&!b)return this;var e=new this.constructor(l),f=this.b;if(d){var g=arguments[d-1];c(function(){w(d,e,g,f)})}else t(this,e,a,b);return e},"catch":function(a){return this.then(null,a)}};var J={Promise:z,polyfill:function(){var b;b="undefined"!=typeof d?d:"undefined"!=typeof a&&a.document?a:self,"Promise"in b&&"resolve"in b.Promise&&"reject"in b.Promise&&"all"in b.Promise&&"race"in b.Promise&&function(){var a;return new b.Promise(function(b){a=b}),f(a)}()||(b.Promise=z)}};"function"==typeof e&&e.amd?e(function(){return J}):"undefined"!=typeof module&&module.exports?module.exports=J:"undefined"!=typeof this&&(this.ES6Promise=J)}.call(a),a&&a.ES6Promise.polyfill(),"undefined"==typeof b||"function"!=typeof Object.create||"function"!=typeof b.createElement("canvas").getContext)return void((a||module.exports).html2canvas=function(){return Promise.reject("No canvas support")});!function(a){function b(a){throw RangeError(H[a])}function f(a,b){for(var c=a.length,d=[];c--;)d[c]=b(a[c]);return d}function g(a,b){var c=a.split("@"),d="";c.length>1&&(d=c[0]+"@",a=c[1]);var e=a.split(G),g=f(e,b).join(".");return d+g}function h(a){for(var b,c,d=[],e=0,f=a.length;f>e;)b=a.charCodeAt(e++),b>=55296&&56319>=b&&f>e?(c=a.charCodeAt(e++),56320==(64512&c)?d.push(((1023&b)<<10)+(1023&c)+65536):(d.push(b),e--)):d.push(b);return d}function i(a){return f(a,function(a){var b="";return a>65535&&(a-=65536,b+=K(a>>>10&1023|55296),a=56320|1023&a),b+=K(a)}).join("")}function j(a){return 10>a-48?a-22:26>a-65?a-65:26>a-97?a-97:w}function k(a,b){return a+22+75*(26>a)-((0!=b)<<5)}function l(a,b,c){var d=0;for(a=c?J(a/A):a>>1,a+=J(a/b);a>I*y>>1;d+=w)a=J(a/I);return J(d+(I+1)*a/(a+z))}function m(a){var c,d,e,f,g,h,k,m,n,o,p=[],q=a.length,r=0,s=C,t=B;for(d=a.lastIndexOf(D),0>d&&(d=0),e=0;d>e;++e)a.charCodeAt(e)>=128&&b("not-basic"),p.push(a.charCodeAt(e));for(f=d>0?d+1:0;q>f;){for(g=r,h=1,k=w;f>=q&&b("invalid-input"),m=j(a.charCodeAt(f++)),(m>=w||m>J((v-r)/h))&&b("overflow"),r+=m*h,n=t>=k?x:k>=t+y?y:k-t,!(n>m);k+=w)o=w-n,h>J(v/o)&&b("overflow"),h*=o;c=p.length+1,t=l(r-g,c,0==g),J(r/c)>v-s&&b("overflow"),s+=J(r/c),r%=c,p.splice(r++,0,s)}return i(p)}function n(a){var c,d,e,f,g,i,j,m,n,o,p,q,r,s,t,u=[];for(a=h(a),q=a.length,c=C,d=0,g=B,i=0;q>i;++i)p=a[i],128>p&&u.push(K(p));for(e=f=u.length,f&&u.push(D);q>e;){for(j=v,i=0;q>i;++i)p=a[i],p>=c&&j>p&&(j=p);for(r=e+1,j-c>J((v-d)/r)&&b("overflow"),d+=(j-c)*r,c=j,i=0;q>i;++i)if(p=a[i],c>p&&++d>v&&b("overflow"),p==c){for(m=d,n=w;o=g>=n?x:n>=g+y?y:n-g,!(o>m);n+=w)t=m-o,s=w-o,u.push(K(k(o+t%s,0))),m=J(t/s);u.push(K(k(m,0))),g=l(d,r,e==f),d=0,++e}++d,++c}return u.join("")}function o(a){return g(a,function(a){return E.test(a)?m(a.slice(4).toLowerCase()):a})}function p(a){return g(a,function(a){return F.test(a)?"xn--"+n(a):a})}var q="object"==typeof c&&c&&!c.nodeType&&c,r="object"==typeof module&&module&&!module.nodeType&&module,s="object"==typeof d&&d;(s.global===s||s.window===s||s.self===s)&&(a=s);var t,u,v=2147483647,w=36,x=1,y=26,z=38,A=700,B=72,C=128,D="-",E=/^xn--/,F=/[^\x20-\x7E]/,G=/[\x2E\u3002\uFF0E\uFF61]/g,H={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},I=w-x,J=Math.floor,K=String.fromCharCode;if(t={version:"1.3.1",ucs2:{decode:h,encode:i},decode:m,encode:n,toASCII:p,toUnicode:o},"function"==typeof e&&"object"==typeof e.amd&&e.amd)e("punycode",function(){return t});else if(q&&r)if(module.exports==q)r.exports=t;else for(u in t)t.hasOwnProperty(u)&&(q[u]=t[u]);else a.punycode=t}(this);var Vb="data-html2canvas-node",Wb="data-html2canvas-canvas-clone",Xb=0,Yb=0;a.html2canvas=function(c,d){var e=Yb++;if(d=d||{},d.logging&&(a.html2canvas.logging=!0,a.html2canvas.start=Date.now()),d.async="undefined"==typeof d.async?!0:d.async,d.allowTaint="undefined"==typeof d.allowTaint?!1:d.allowTaint,d.removeContainer="undefined"==typeof d.removeContainer?!0:d.removeContainer,d.javascriptEnabled="undefined"==typeof d.javascriptEnabled?!1:d.javascriptEnabled,d.imageTimeout="undefined"==typeof d.imageTimeout?1e4:d.imageTimeout,d.renderer="function"==typeof d.renderer?d.renderer:Tb,d.strict=!!d.strict,"string"==typeof c){if("string"!=typeof d.proxy)return Promise.reject("Proxy must be used when rendering url");var i=null!=d.width?d.width:a.innerWidth,j=null!=d.height?d.height:a.innerHeight;return s(y(c),d.proxy,b,i,j,d).then(function(a){return h(a.contentWindow.document.documentElement,a,d,i,j)})}var k=(c===f?[b.documentElement]:c.length?c:[c])[0];return k.setAttribute(Vb+e,e),g(k.ownerDocument,d,k.ownerDocument.defaultView.innerWidth,k.ownerDocument.defaultView.innerHeight,e).then(function(a){return"function"==typeof d.onrendered&&(I("options.onrendered is deprecated, html2canvas returns a Promise containing the canvas"),d.onrendered(a)),a})},a.html2canvas.punycode=this.punycode,a.html2canvas.proxy={},z.prototype.darken=function(a){var b=1-a;return new z([Math.round(this.r*b),Math.round(this.g*b),Math.round(this.b*b),this.a])},z.prototype.isTransparent=function(){return 0===this.a},z.prototype.isBlack=function(){return 0===this.r&&0===this.g&&0===this.b},z.prototype.fromArray=function(a){return Array.isArray(a)&&(this.r=Math.min(a[0],255),this.g=Math.min(a[1],255),this.b=Math.min(a[2],255),a.length>3&&(this.a=a[3])),Array.isArray(a)};var Zb=/^#([a-f0-9]{3})$/i;z.prototype.hex3=function(a){var b=null;return null!==(b=a.match(Zb))&&(this.r=parseInt(b[1][0]+b[1][0],16),this.g=parseInt(b[1][1]+b[1][1],16),this.b=parseInt(b[1][2]+b[1][2],16)),null!==b};var $b=/^#([a-f0-9]{6})$/i;z.prototype.hex6=function(a){var b=null;return null!==(b=a.match($b))&&(this.r=parseInt(b[1].substring(0,2),16),this.g=parseInt(b[1].substring(2,4),16),this.b=parseInt(b[1].substring(4,6),16)),null!==b};var _b=/^rgb\((\d{1,3}) *, *(\d{1,3}) *, *(\d{1,3})\)$/;z.prototype.rgb=function(a){var b=null;return null!==(b=a.match(_b))&&(this.r=Number(b[1]),this.g=Number(b[2]),this.b=Number(b[3])),null!==b};var ac=/^rgba\((\d{1,3}) *, *(\d{1,3}) *, *(\d{1,3}) *, *(\d+\.?\d*)\)$/;z.prototype.rgba=function(a){var b=null;return null!==(b=a.match(ac))&&(this.r=Number(b[1]),this.g=Number(b[2]),this.b=Number(b[3]),this.a=Number(b[4])),null!==b},z.prototype.toString=function(){return null!==this.a&&1!==this.a?"rgba("+[this.r,this.g,this.b,this.a].join(",")+")":"rgb("+[this.r,this.g,this.b].join(",")+")"},z.prototype.namedColor=function(a){var b=bc[a.toLowerCase()];if(b)this.r=b[0],this.g=b[1],this.b=b[2];else if("transparent"===a.toLowerCase())return this.r=this.g=this.b=this.a=0,!0;return!!b},z.prototype.isColor=!0;var bc={aliceblue:[240,248,255],antiquewhite:[250,235,215],aqua:[0,255,255],aquamarine:[127,255,212],azure:[240,255,255],beige:[245,245,220],bisque:[255,228,196],black:[0,0,0],blanchedalmond:[255,235,205],blue:[0,0,255],blueviolet:[138,43,226],brown:[165,42,42],burlywood:[222,184,135],cadetblue:[95,158,160],chartreuse:[127,255,0],chocolate:[210,105,30],coral:[255,127,80],cornflowerblue:[100,149,237],cornsilk:[255,248,220],crimson:[220,20,60],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgoldenrod:[184,134,11],darkgray:[169,169,169],darkgreen:[0,100,0],darkgrey:[169,169,169],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkseagreen:[143,188,143],darkslateblue:[72,61,139],darkslategray:[47,79,79],darkslategrey:[47,79,79],darkturquoise:[0,206,209],darkviolet:[148,0,211],deeppink:[255,20,147],deepskyblue:[0,191,255],dimgray:[105,105,105],dimgrey:[105,105,105],dodgerblue:[30,144,255],firebrick:[178,34,34],floralwhite:[255,250,240],forestgreen:[34,139,34],fuchsia:[255,0,255],gainsboro:[220,220,220],ghostwhite:[248,248,255],gold:[255,215,0],goldenrod:[218,165,32],gray:[128,128,128],green:[0,128,0],greenyellow:[173,255,47],grey:[128,128,128],honeydew:[240,255,240],hotpink:[255,105,180],indianred:[205,92,92],indigo:[75,0,130],ivory:[255,255,240],khaki:[240,230,140],lavender:[230,230,250],lavenderblush:[255,240,245],lawngreen:[124,252,0],lemonchiffon:[255,250,205],lightblue:[173,216,230],lightcoral:[240,128,128],lightcyan:[224,255,255],lightgoldenrodyellow:[250,250,210],lightgray:[211,211,211],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightsalmon:[255,160,122],lightseagreen:[32,178,170],lightskyblue:[135,206,250],lightslategray:[119,136,153],lightslategrey:[119,136,153],lightsteelblue:[176,196,222],lightyellow:[255,255,224],lime:[0,255,0],limegreen:[50,205,50],linen:[250,240,230],magenta:[255,0,255],maroon:[128,0,0],mediumaquamarine:[102,205,170],mediumblue:[0,0,205],mediumorchid:[186,85,211],mediumpurple:[147,112,219],mediumseagreen:[60,179,113],mediumslateblue:[123,104,238],mediumspringgreen:[0,250,154],mediumturquoise:[72,209,204],mediumvioletred:[199,21,133],midnightblue:[25,25,112],mintcream:[245,255,250],mistyrose:[255,228,225],moccasin:[255,228,181],navajowhite:[255,222,173],navy:[0,0,128],oldlace:[253,245,230],olive:[128,128,0],olivedrab:[107,142,35],orange:[255,165,0],orangered:[255,69,0],orchid:[218,112,214],palegoldenrod:[238,232,170],palegreen:[152,251,152],paleturquoise:[175,238,238],palevioletred:[219,112,147],papayawhip:[255,239,213],peachpuff:[255,218,185],peru:[205,133,63],pink:[255,192,203],plum:[221,160,221],powderblue:[176,224,230],purple:[128,0,128],rebeccapurple:[102,51,153],red:[255,0,0],rosybrown:[188,143,143],royalblue:[65,105,225],saddlebrown:[139,69,19],salmon:[250,128,114],sandybrown:[244,164,96],seagreen:[46,139,87],seashell:[255,245,238],sienna:[160,82,45],silver:[192,192,192],skyblue:[135,206,235],slateblue:[106,90,205],slategray:[112,128,144],slategrey:[112,128,144],snow:[255,250,250],springgreen:[0,255,127],steelblue:[70,130,180],tan:[210,180,140],teal:[0,128,128],thistle:[216,191,216],tomato:[255,99,71],turquoise:[64,224,208],violet:[238,130,238],wheat:[245,222,179],white:[255,255,255],whitesmoke:[245,245,245],yellow:[255,255,0],yellowgreen:[154,205,50]};
C.prototype.getMetrics=function(a,b){return this.data[a+"-"+b]===f&&(this.data[a+"-"+b]=new B(a,b)),this.data[a+"-"+b]},D.prototype.proxyLoad=function(a,b,c){var d=this.src;return s(d.src,a,d.ownerDocument,b.width,b.height,c)},E.prototype.TYPES={LINEAR:1,RADIAL:2},G.prototype.findImages=function(a){var b=[];return a.reduce(function(a,b){switch(b.node.nodeName){case"IMG":return a.concat([{args:[b.node.src],method:"url"}]);case"svg":case"IFRAME":return a.concat([{args:[b.node],method:b.node.nodeName}])}return a},[]).forEach(this.addImage(b,this.loadImage),this),b},G.prototype.findBackgroundImage=function(a,b){return b.parseBackgroundImages().filter(this.hasImageBackground).forEach(this.addImage(a,this.loadImage),this),a},G.prototype.addImage=function(a,b){return function(c){c.args.forEach(function(d){this.imageExists(a,d)||(a.splice(0,0,b.call(this,c)),I("Added image #"+a.length,"string"==typeof d?d.substring(0,100):d))},this)}},G.prototype.hasImageBackground=function(a){return"none"!==a.method},G.prototype.loadImage=function(a){if("url"===a.method){var b=a.args[0];return!this.isSVG(b)||this.support.svg||this.options.allowTaint?b.match(/data:image\/.*;base64,/i)?new F(b.replace(/url\(['"]{0,}|['"]{0,}\)$/gi,""),!1):this.isSameOrigin(b)||this.options.allowTaint===!0||this.isSVG(b)?new F(b,!1):this.support.cors&&!this.options.allowTaint&&this.options.useCORS?new F(b,!0):this.options.proxy?new Hb(b,this.options.proxy):new A(b):new Mb(b)}return"linear-gradient"===a.method?new H(a):"gradient"===a.method?new Rb(a):"svg"===a.method?new Ob(a.args[0],this.support.svg):"IFRAME"===a.method?new D(a.args[0],this.isSameOrigin(a.args[0].src),this.options):new A(a)},G.prototype.isSVG=function(a){return"svg"===a.substring(a.length-3).toLowerCase()||Mb.prototype.isInline(a)},G.prototype.imageExists=function(a,b){return a.some(function(a){return a.src===b})},G.prototype.isSameOrigin=function(a){return this.getOrigin(a)===this.origin},G.prototype.getOrigin=function(a){var c=this.link||(this.link=b.createElement("a"));return c.href=a,c.href=c.href,c.protocol+c.hostname+c.port},G.prototype.getPromise=function(a){return this.timeout(a,this.options.imageTimeout)["catch"](function(){var b=new A(a.src);return b.promise.then(function(b){a.image=b})})},G.prototype.get=function(a){var b=null;return this.images.some(function(c){return(b=c).src===a})?b:null},G.prototype.fetch=function(a){return this.images=a.reduce(tb(this.findBackgroundImage,this),this.findImages(a)),this.images.forEach(function(a,b){a.promise.then(function(){I("Succesfully loaded image #"+(b+1),a)},function(c){I("Failed loading image #"+(b+1),a,c)})}),this.ready=Promise.all(this.images.map(this.getPromise,this)),I("Finished searching images"),this},G.prototype.timeout=function(a,b){var c,d=Promise.race([a.promise,new Promise(function(d,e){c=setTimeout(function(){I("Timed out loading image",a),e(a)},b)})]).then(function(a){return clearTimeout(c),a});return d["catch"](function(){clearTimeout(c)}),d},H.prototype=Object.create(E.prototype),H.prototype.stepRegExp=/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/,J.prototype.cloneTo=function(a){a.visible=this.visible,a.borders=this.borders,a.bounds=this.bounds,a.clip=this.clip,a.backgroundClip=this.backgroundClip,a.computedStyles=this.computedStyles,a.styles=this.styles,a.backgroundImages=this.backgroundImages,a.opacity=this.opacity},J.prototype.getOpacity=function(){return null===this.opacity?this.opacity=this.cssFloat("opacity"):this.opacity},J.prototype.assignStack=function(a){this.stack=a,a.children.push(this)},J.prototype.isElementVisible=function(){return this.node.nodeType===Node.TEXT_NODE?this.parent.visible:"none"!==this.css("display")&&"hidden"!==this.css("visibility")&&!this.node.hasAttribute("data-html2canvas-ignore")&&("INPUT"!==this.node.nodeName||"hidden"!==this.node.getAttribute("type"))},J.prototype.css=function(a){return this.computedStyles||(this.computedStyles=this.isPseudoElement?this.parent.computedStyle(this.before?":before":":after"):this.computedStyle(null)),this.styles[a]||(this.styles[a]=this.computedStyles[a])},J.prototype.prefixedCss=function(a){var b=["webkit","moz","ms","o"],c=this.css(a);return c===f&&b.some(function(b){return c=this.css(b+a.substr(0,1).toUpperCase()+a.substr(1)),c!==f},this),c===f?null:c},J.prototype.computedStyle=function(a){return this.node.ownerDocument.defaultView.getComputedStyle(this.node,a)},J.prototype.cssInt=function(a){var b=parseInt(this.css(a),10);return isNaN(b)?0:b},J.prototype.color=function(a){return this.colors[a]||(this.colors[a]=new z(this.css(a)))},J.prototype.cssFloat=function(a){var b=parseFloat(this.css(a));return isNaN(b)?0:b},J.prototype.fontWeight=function(){var a=this.css("fontWeight");switch(parseInt(a,10)){case 401:a="bold";break;case 400:a="normal"}return a},J.prototype.parseClip=function(){var a=this.css("clip").match(this.CLIP);return a?{top:parseInt(a[1],10),right:parseInt(a[2],10),bottom:parseInt(a[3],10),left:parseInt(a[4],10)}:null},J.prototype.parseBackgroundImages=function(){return this.backgroundImages||(this.backgroundImages=N(this.css("backgroundImage")))},J.prototype.cssList=function(a,b){var c=(this.css(a)||"").split(",");return c=c[b||0]||c[0]||"auto",c=c.trim().split(" "),1===c.length&&(c=[c[0],c[0]]),c},J.prototype.parseBackgroundSize=function(a,b,c){var d,e,f=this.cssList("backgroundSize",c);if(M(f[0]))d=a.width*parseFloat(f[0])/100;else{if(/contain|cover/.test(f[0])){var g=a.width/a.height,h=b.width/b.height;return h>g^"contain"===f[0]?{width:a.height*h,height:a.height}:{width:a.width,height:a.width/h}}d=parseInt(f[0],10)}return e="auto"===f[0]&&"auto"===f[1]?b.height:"auto"===f[1]?d/b.width*b.height:M(f[1])?a.height*parseFloat(f[1])/100:parseInt(f[1],10),"auto"===f[0]&&(d=e/b.height*b.width),{width:d,height:e}},J.prototype.parseBackgroundPosition=function(a,b,c,d){var e,f,g=this.cssList("backgroundPosition",c);return e=M(g[0])?(a.width-(d||b).width)*(parseFloat(g[0])/100):parseInt(g[0],10),f="auto"===g[1]?e/b.width*b.height:M(g[1])?(a.height-(d||b).height)*parseFloat(g[1])/100:parseInt(g[1],10),"auto"===g[0]&&(e=f/b.height*b.width),{left:e,top:f}},J.prototype.parseBackgroundRepeat=function(a){return this.cssList("backgroundRepeat",a)[0]},J.prototype.parseTextShadows=function(){var a=this.css("textShadow"),b=[];if(a&&"none"!==a)for(var c=a.match(this.TEXT_SHADOW_PROPERTY),d=0;c&&d<c.length;d++){var e=c[d].match(this.TEXT_SHADOW_VALUES);b.push({color:new z(e[0]),offsetX:e[1]?parseFloat(e[1].replace("px","")):0,offsetY:e[2]?parseFloat(e[2].replace("px","")):0,blur:e[3]?e[3].replace("px",""):0})}return b},J.prototype.parseTransform=function(){if(!this.transformData)if(this.hasTransform()){var a=this.parseBounds(),b=this.prefixedCss("transformOrigin").split(" ").map(O).map(P);b[0]+=a.left,b[1]+=a.top,this.transformData={origin:b,matrix:this.parseTransformMatrix()}}else this.transformData={origin:[0,0],matrix:[1,0,0,1,0,0]};return this.transformData},J.prototype.parseTransformMatrix=function(){if(!this.transformMatrix){var a=this.prefixedCss("transform"),b=a?L(a.match(this.MATRIX_PROPERTY)):null;this.transformMatrix=b?b:[1,0,0,1,0,0]}return this.transformMatrix},J.prototype.parseBounds=function(){return this.bounds||(this.bounds=this.hasTransform()?R(this.node):Q(this.node))},J.prototype.hasTransform=function(){return"1,0,0,1,0,0"!==this.parseTransformMatrix().join(",")||this.parent&&this.parent.hasTransform()},J.prototype.getValue=function(){var a=this.node.value||"";return"SELECT"===this.node.tagName?a=K(this.node):"password"===this.node.type&&(a=Array(a.length+1).join("•")),0===a.length?this.node.placeholder||"":a},J.prototype.MATRIX_PROPERTY=/(matrix)\((.+)\)/,J.prototype.TEXT_SHADOW_PROPERTY=/((rgba|rgb)\([^\)]+\)(\s-?\d+px){0,})/g,J.prototype.TEXT_SHADOW_VALUES=/(-?\d+px)|(#.+)|(rgb\(.+\))|(rgba\(.+\))/g,J.prototype.CLIP=/^rect\((\d+)px,? (\d+)px,? (\d+)px,? (\d+)px\)$/,S.prototype.calculateOverflowClips=function(){this.nodes.forEach(function(a){if(ob(a)){pb(a)&&a.appendToDOM(),a.borders=this.parseBorders(a);var b="hidden"===a.css("overflow")?[a.borders.clip]:[],c=a.parseClip();c&&-1!==["absolute","fixed"].indexOf(a.css("position"))&&b.push([["rect",a.bounds.left+c.left,a.bounds.top+c.top,c.right-c.left,c.bottom-c.top]]),a.clip=T(a)?a.parent.clip.concat(b):b,a.backgroundClip="hidden"!==a.css("overflow")?a.clip.concat([a.borders.clip]):a.clip,pb(a)&&a.cleanDOM()}else qb(a)&&(a.clip=T(a)?a.parent.clip:[]);pb(a)||(a.bounds=null)},this)},S.prototype.asyncRenderer=function(a,b,c){c=c||Date.now(),this.paint(a[this.renderIndex++]),a.length===this.renderIndex?b():c+20>Date.now()?this.asyncRenderer(a,b,c):setTimeout(tb(function(){this.asyncRenderer(a,b)},this),0)},S.prototype.createPseudoHideStyles=function(a){this.createStyles(a,"."+Ib.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE+':before { content: "" !important; display: none !important; }.'+Ib.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER+':after { content: "" !important; display: none !important; }')},S.prototype.disableAnimations=function(a){this.createStyles(a,"* { -webkit-animation: none !important; -moz-animation: none !important; -o-animation: none !important; animation: none !important; -webkit-transition: none !important; -moz-transition: none !important; -o-transition: none !important; transition: none !important;}")},S.prototype.createStyles=function(a,b){var c=a.createElement("style");c.innerHTML=b,a.body.appendChild(c)},S.prototype.getPseudoElements=function(a){var b=[[a]];if(a.node.nodeType===Node.ELEMENT_NODE){var c=this.getPseudoElement(a,":before"),d=this.getPseudoElement(a,":after");c&&b.push(c),d&&b.push(d)}return xb(b)},S.prototype.getPseudoElement=function(a,c){var d=a.computedStyle(c);if(!d||!d.content||"none"===d.content||"-moz-alt-content"===d.content||"none"===d.display)return null;for(var e=yb(d.content),f="url"===e.substr(0,3),g=b.createElement(f?"img":"html2canvaspseudoelement"),h=new Ib(g,a,c),i=d.length-1;i>=0;i--){var j=U(d.item(i));g.style[j]=d[j]}if(g.className=Ib.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE+" "+Ib.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER,f)return g.src=N(e)[0].args[0],[h];var k=b.createTextNode(e);return g.appendChild(k),[h,new Pb(k,h)]},S.prototype.getChildren=function(a){return xb([].filter.call(a.node.childNodes,ib).map(function(b){var c=[b.nodeType===Node.TEXT_NODE?new Pb(b,a):new J(b,a)].filter(wb);return b.nodeType===Node.ELEMENT_NODE&&c.length&&"TEXTAREA"!==b.tagName?c[0].isElementVisible()?c.concat(this.getChildren(c[0])):[]:c},this))},S.prototype.newStackingContext=function(a,b){var c=new Kb(b,a.getOpacity(),a.node,a.parent);a.cloneTo(c);var d=b?c.getParentStack(this):c.parent.stack;d.contexts.push(c),a.stack=c},S.prototype.createStackingContexts=function(){this.nodes.forEach(function(a){ob(a)&&(this.isRootElement(a)||sb(a)||jb(a)||this.isBodyWithTransparentRoot(a)||a.hasTransform())?this.newStackingContext(a,!0):ob(a)&&(kb(a)&&cb(a)||mb(a)||lb(a))?this.newStackingContext(a,!1):a.assignStack(a.parent.stack)},this)},S.prototype.isBodyWithTransparentRoot=function(a){return"BODY"===a.node.nodeName&&a.parent.color("backgroundColor").isTransparent()},S.prototype.isRootElement=function(a){return null===a.parent},S.prototype.sortStackingContexts=function(a){a.contexts.sort(rb(a.contexts.slice(0))),a.contexts.forEach(this.sortStackingContexts,this)},S.prototype.parseTextBounds=function(a){return function(b,c,d){if("none"!==a.parent.css("textDecoration").substr(0,4)||0!==b.trim().length){if(this.support.rangeBounds&&!a.parent.hasTransform()){var e=d.slice(0,c).join("").length;return this.getRangeBounds(a.node,e,b.length)}if(a.node&&"string"==typeof a.node.data){var f=a.node.splitText(b.length),g=this.getWrapperBounds(a.node,a.parent.hasTransform());return a.node=f,g}}else(!this.support.rangeBounds||a.parent.hasTransform())&&(a.node=a.node.splitText(b.length));return{}}},S.prototype.getWrapperBounds=function(a,b){var c=a.ownerDocument.createElement("html2canvaswrapper"),d=a.parentNode,e=a.cloneNode(!0);c.appendChild(a.cloneNode(!0)),d.replaceChild(c,a);var f=b?R(c):Q(c);return d.replaceChild(e,c),f},S.prototype.getRangeBounds=function(a,b,c){var d=this.range||(this.range=a.ownerDocument.createRange());return d.setStart(a,b),d.setEnd(a,b+c),d.getBoundingClientRect()},S.prototype.parse=function(a){var b=a.contexts.filter(ab),c=a.children.filter(ob),d=c.filter(nb(lb)),e=d.filter(nb(kb)).filter(nb(db)),f=c.filter(nb(kb)).filter(lb),g=d.filter(nb(kb)).filter(db),h=a.contexts.concat(d.filter(kb)).filter(cb),i=a.children.filter(qb).filter(fb),j=a.contexts.filter(bb);b.concat(e).concat(f).concat(g).concat(h).concat(i).concat(j).forEach(function(a){this.renderQueue.push(a),eb(a)&&(this.parse(a),this.renderQueue.push(new V))},this)},S.prototype.paint=function(a){try{a instanceof V?this.renderer.ctx.restore():qb(a)?(pb(a.parent)&&a.parent.appendToDOM(),this.paintText(a),pb(a.parent)&&a.parent.cleanDOM()):this.paintNode(a)}catch(b){if(I(b),this.options.strict)throw b}},S.prototype.paintNode=function(a){eb(a)&&(this.renderer.setOpacity(a.opacity),this.renderer.ctx.save(),a.hasTransform()&&this.renderer.setTransform(a.parseTransform())),"INPUT"===a.node.nodeName&&"checkbox"===a.node.type?this.paintCheckbox(a):"INPUT"===a.node.nodeName&&"radio"===a.node.type?this.paintRadio(a):this.paintElement(a)},S.prototype.paintElement=function(a){var b=a.parseBounds();this.renderer.clip(a.backgroundClip,function(){this.renderer.renderBackground(a,b,a.borders.borders.map(vb))},this),this.renderer.clip(a.clip,function(){this.renderer.renderBorders(a.borders.borders)},this),this.renderer.clip(a.backgroundClip,function(){switch(a.node.nodeName){case"svg":case"IFRAME":var c=this.images.get(a.node);c?this.renderer.renderImage(a,b,a.borders,c):I("Error loading <"+a.node.nodeName+">",a.node);break;case"IMG":var d=this.images.get(a.node.src);d?this.renderer.renderImage(a,b,a.borders,d):I("Error loading <img>",a.node.src);break;case"CANVAS":this.renderer.renderImage(a,b,a.borders,{image:a.node});break;case"SELECT":case"INPUT":case"TEXTAREA":this.paintFormValue(a)}},this)},S.prototype.paintCheckbox=function(a){var b=a.parseBounds(),c=Math.min(b.width,b.height),d={width:c-1,height:c-1,top:b.top,left:b.left},e=[3,3],f=[e,e,e,e],g=[1,1,1,1].map(function(a){return{color:new z("#A5A5A5"),width:a}}),h=Y(d,f,g);this.renderer.clip(a.backgroundClip,function(){this.renderer.rectangle(d.left+1,d.top+1,d.width-2,d.height-2,new z("#DEDEDE")),this.renderer.renderBorders(W(g,d,h,f)),a.node.checked&&(this.renderer.font(new z("#424242"),"normal","normal","bold",c-3+"px","arial"),this.renderer.text("✔",d.left+c/6,d.top+c-1))},this)},S.prototype.paintRadio=function(a){var b=a.parseBounds(),c=Math.min(b.width,b.height)-2;this.renderer.clip(a.backgroundClip,function(){this.renderer.circleStroke(b.left+1,b.top+1,c,new z("#DEDEDE"),1,new z("#A5A5A5")),a.node.checked&&this.renderer.circle(Math.ceil(b.left+c/4)+1,Math.ceil(b.top+c/4)+1,Math.floor(c/2),new z("#424242"))},this)},S.prototype.paintFormValue=function(a){var b=a.getValue();if(b.length>0){var c=a.node.ownerDocument,d=c.createElement("html2canvaswrapper"),e=["lineHeight","textAlign","fontFamily","fontWeight","fontSize","color","paddingLeft","paddingTop","paddingRight","paddingBottom","width","height","borderLeftStyle","borderTopStyle","borderLeftWidth","borderTopWidth","boxSizing","whiteSpace","wordWrap"];e.forEach(function(b){try{d.style[b]=a.css(b)}catch(c){I("html2canvas: Parse: Exception caught in renderFormValue: "+c.message)}});var f=a.parseBounds();d.style.position="fixed",d.style.left=f.left+"px",d.style.top=f.top+"px",d.textContent=b,c.body.appendChild(d),this.paintText(new Pb(d.firstChild,a)),c.body.removeChild(d)}},S.prototype.paintText=function(b){b.applyTextTransform();var c=a.html2canvas.punycode.ucs2.decode(b.node.data),d=this.options.letterRendering&&!gb(b)||Bb(b.node.data)?c.map(function(b){return a.html2canvas.punycode.ucs2.encode([b])}):zb(c),e=b.parent.fontWeight(),f=b.parent.css("fontSize"),g=b.parent.css("fontFamily"),h=b.parent.parseTextShadows();this.renderer.font(b.parent.color("color"),b.parent.css("fontStyle"),b.parent.css("fontVariant"),e,f,g),h.length?this.renderer.fontShadow(h[0].color,h[0].offsetX,h[0].offsetY,h[0].blur):this.renderer.clearShadow(),this.renderer.clip(b.parent.clip,function(){d.map(this.parseTextBounds(b),this).forEach(function(a,c){a&&(this.renderer.text(d[c],a.left,a.bottom),this.renderTextDecoration(b.parent,a,this.fontMetrics.getMetrics(g,f)))},this)},this)},S.prototype.renderTextDecoration=function(a,b,c){switch(a.css("textDecoration").split(" ")[0]){case"underline":this.renderer.rectangle(b.left,Math.round(b.top+c.baseline+c.lineWidth),b.width,1,a.color("color"));break;case"overline":this.renderer.rectangle(b.left,Math.round(b.top),b.width,1,a.color("color"));break;case"line-through":this.renderer.rectangle(b.left,Math.ceil(b.top+c.middle+c.lineWidth),b.width,1,a.color("color"))}};var cc={inset:[["darken",.6],["darken",.1],["darken",.1],["darken",.6]]};S.prototype.parseBorders=function(a){var b=a.parseBounds(),c=hb(a),d=["Top","Right","Bottom","Left"].map(function(b,c){var d=a.css("border"+b+"Style"),e=a.color("border"+b+"Color");"inset"===d&&e.isBlack()&&(e=new z([255,255,255,e.a]));var f=cc[d]?cc[d][c]:null;return{width:a.cssInt("border"+b+"Width"),color:f?e[f[0]](f[1]):e,args:null}}),e=Y(b,c,d);return{clip:this.parseBackgroundClip(a,e,d,c,b),borders:W(d,b,e,c)}},S.prototype.parseBackgroundClip=function(a,b,c,d,e){var f=a.css("backgroundClip"),g=[];switch(f){case"content-box":case"padding-box":_(g,d[0],d[1],b.topLeftInner,b.topRightInner,e.left+c[3].width,e.top+c[0].width),_(g,d[1],d[2],b.topRightInner,b.bottomRightInner,e.left+e.width-c[1].width,e.top+c[0].width),_(g,d[2],d[3],b.bottomRightInner,b.bottomLeftInner,e.left+e.width-c[1].width,e.top+e.height-c[2].width),_(g,d[3],d[0],b.bottomLeftInner,b.topLeftInner,e.left+c[3].width,e.top+e.height-c[2].width);break;default:_(g,d[0],d[1],b.topLeftOuter,b.topRightOuter,e.left,e.top),_(g,d[1],d[2],b.topRightOuter,b.bottomRightOuter,e.left+e.width,e.top),_(g,d[2],d[3],b.bottomRightOuter,b.bottomLeftOuter,e.left+e.width,e.top+e.height),_(g,d[3],d[0],b.bottomLeftOuter,b.topLeftOuter,e.left,e.top+e.height)}return g};var dc=0,ec="withCredentials"in new XMLHttpRequest,fc="crossOrigin"in new Image;Ib.prototype.cloneTo=function(a){Ib.prototype.cloneTo.call(this,a),a.isPseudoElement=!0,a.before=this.before},Ib.prototype=Object.create(J.prototype),Ib.prototype.appendToDOM=function(){this.before?this.parent.node.insertBefore(this.node,this.parent.node.firstChild):this.parent.node.appendChild(this.node),this.parent.node.className+=" "+this.getHideClass()},Ib.prototype.cleanDOM=function(){this.node.parentNode.removeChild(this.node),this.parent.node.className=this.parent.node.className.replace(this.getHideClass(),"")},Ib.prototype.getHideClass=function(){return this["PSEUDO_HIDE_ELEMENT_CLASS_"+(this.before?"BEFORE":"AFTER")]},Ib.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE="___html2canvas___pseudoelement_before",Ib.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER="___html2canvas___pseudoelement_after",Jb.prototype.renderImage=function(a,b,c,d){var e=a.cssInt("paddingLeft"),f=a.cssInt("paddingTop"),g=a.cssInt("paddingRight"),h=a.cssInt("paddingBottom"),i=c.borders,j=b.width-(i[1].width+i[3].width+e+g),k=b.height-(i[0].width+i[2].width+f+h);this.drawImage(d,0,0,d.image.width||j,d.image.height||k,b.left+e+i[3].width,b.top+f+i[0].width,j,k)},Jb.prototype.renderBackground=function(a,b,c){b.height>0&&b.width>0&&(this.renderBackgroundColor(a,b),this.renderBackgroundImage(a,b,c))},Jb.prototype.renderBackgroundColor=function(a,b){var c=a.color("backgroundColor");c.isTransparent()||this.rectangle(b.left,b.top,b.width,b.height,c)},Jb.prototype.renderBorders=function(a){a.forEach(this.renderBorder,this)},Jb.prototype.renderBorder=function(a){a.color.isTransparent()||null===a.args||this.drawShape(a.args,a.color)},Jb.prototype.renderBackgroundImage=function(a,b,c){var d=a.parseBackgroundImages();d.reverse().forEach(function(d,e,f){switch(d.method){case"url":var g=this.images.get(d.args[0]);g?this.renderBackgroundRepeating(a,b,g,f.length-(e+1),c):I("Error loading background-image",d.args[0]);break;case"linear-gradient":case"gradient":var h=this.images.get(d.value);h?this.renderBackgroundGradient(h,b,c):I("Error loading background-image",d.args[0]);break;case"none":break;default:I("Unknown background-image type",d.args[0])}},this)},Jb.prototype.renderBackgroundRepeating=function(a,b,c,d,e){var f=a.parseBackgroundSize(b,c.image,d),g=a.parseBackgroundPosition(b,c.image,d,f),h=a.parseBackgroundRepeat(d);switch(h){case"repeat-x":case"repeat no-repeat":this.backgroundRepeatShape(c,g,f,b,b.left+e[3],b.top+g.top+e[0],99999,f.height,e);break;case"repeat-y":case"no-repeat repeat":this.backgroundRepeatShape(c,g,f,b,b.left+g.left+e[3],b.top+e[0],f.width,99999,e);break;case"no-repeat":this.backgroundRepeatShape(c,g,f,b,b.left+g.left+e[3],b.top+g.top+e[0],f.width,f.height,e);break;default:this.renderBackgroundRepeat(c,g,f,{top:b.top,left:b.left},e[3],e[0])}},Kb.prototype=Object.create(J.prototype),Kb.prototype.getParentStack=function(a){var b=this.parent?this.parent.stack:null;return b?b.ownStacking?b:b.getParentStack(a):a.stack},Lb.prototype.testRangeBounds=function(a){var b,c,d,e,f=!1;return a.createRange&&(b=a.createRange(),b.getBoundingClientRect&&(c=a.createElement("boundtest"),c.style.height="123px",c.style.display="block",a.body.appendChild(c),b.selectNode(c),d=b.getBoundingClientRect(),e=d.height,123===e&&(f=!0),a.body.removeChild(c))),f},Lb.prototype.testCORS=function(){return"undefined"!=typeof(new Image).crossOrigin},Lb.prototype.testSVG=function(){var a=new Image,c=b.createElement("canvas"),d=c.getContext("2d");a.src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>";try{d.drawImage(a,0,0),c.toDataURL()}catch(e){return!1}return!0},Mb.prototype.hasFabric=function(){return html2canvas.fabric?Promise.resolve():Promise.reject(new Error("html2canvas.svg.js is not loaded, cannot render svg"))},Mb.prototype.inlineFormatting=function(a){return/^data:image\/svg\+xml;base64,/.test(a)?this.decode64(this.removeContentType(a)):this.removeContentType(a)},Mb.prototype.removeContentType=function(a){return a.replace(/^data:image\/svg\+xml(;base64)?,/,"")},Mb.prototype.isInline=function(a){return/^data:image\/svg\+xml/i.test(a)},Mb.prototype.createCanvas=function(a){var b=this;return function(c,d){var e=new html2canvas.fabric.StaticCanvas("c");b.image=e.lowerCanvasEl,e.setWidth(d.width).setHeight(d.height).add(html2canvas.fabric.util.groupSVGElements(c,d)).renderAll(),a(e.lowerCanvasEl)}},Mb.prototype.decode64=function(b){return"function"==typeof a.atob?a.atob(b):Nb(b)},Ob.prototype=Object.create(Mb.prototype),Pb.prototype=Object.create(J.prototype),Pb.prototype.applyTextTransform=function(){this.node.data=this.transform(this.parent.css("textTransform"))},Pb.prototype.transform=function(a){var b=this.node.data;switch(a){case"lowercase":return b.toLowerCase();case"capitalize":return b.replace(/(^|\s|:|-|\(|\))([a-z])/g,Qb);case"uppercase":return b.toUpperCase();default:return b}},Rb.prototype=Object.create(E.prototype),Tb.prototype=Object.create(Jb.prototype),Tb.prototype.setFillStyle=function(a){return this.ctx.fillStyle="object"==typeof a&&a.isColor?a.toString():a,this.ctx},Tb.prototype.rectangle=function(a,b,c,d,e){this.setFillStyle(e).fillRect(a,b,c,d)},Tb.prototype.circle=function(a,b,c,d){this.setFillStyle(d),this.ctx.beginPath(),this.ctx.arc(a+c/2,b+c/2,c/2,0,2*Math.PI,!0),this.ctx.closePath(),this.ctx.fill()},Tb.prototype.circleStroke=function(a,b,c,d,e,f){this.circle(a,b,c,d),this.ctx.strokeStyle=f.toString(),this.ctx.stroke()},Tb.prototype.drawShape=function(a,b){this.shape(a),this.setFillStyle(b).fill()},Tb.prototype.taints=function(a){if(null===a.tainted){this.taintCtx.drawImage(a.image,0,0);try{this.taintCtx.getImageData(0,0,1,1),a.tainted=!1}catch(c){this.taintCtx=b.createElement("canvas").getContext("2d"),a.tainted=!0}}return a.tainted},Tb.prototype.drawImage=function(a,b,c,d,e,f,g,h,i){(!this.taints(a)||this.options.allowTaint)&&this.ctx.drawImage(a.image,b,c,d,e,f,g,h,i)},Tb.prototype.clip=function(a,b,c){this.ctx.save(),a.filter(Ub).forEach(function(a){this.shape(a).clip()},this),b.call(c),this.ctx.restore()},Tb.prototype.shape=function(a){return this.ctx.beginPath(),a.forEach(function(a,b){"rect"===a[0]?this.ctx.rect.apply(this.ctx,a.slice(1)):this.ctx[0===b?"moveTo":a[0]+"To"].apply(this.ctx,a.slice(1))},this),this.ctx.closePath(),this.ctx},Tb.prototype.font=function(a,b,c,d,e,f){this.setFillStyle(a).font=[b,c,d,e,f].join(" ").split(",")[0]},Tb.prototype.fontShadow=function(a,b,c,d){this.setVariable("shadowColor",a.toString()).setVariable("shadowOffsetY",b).setVariable("shadowOffsetX",c).setVariable("shadowBlur",d)},Tb.prototype.clearShadow=function(){this.setVariable("shadowColor","rgba(0,0,0,0)")},Tb.prototype.setOpacity=function(a){this.ctx.globalAlpha=a},Tb.prototype.setTransform=function(a){this.ctx.translate(a.origin[0],a.origin[1]),this.ctx.transform.apply(this.ctx,a.matrix),this.ctx.translate(-a.origin[0],-a.origin[1])},Tb.prototype.setVariable=function(a,b){return this.variables[a]!==b&&(this.variables[a]=this.ctx[a]=b),this},Tb.prototype.text=function(a,b,c){this.ctx.fillText(a,b,c)},Tb.prototype.backgroundRepeatShape=function(a,b,c,d,e,f,g,h,i){var j=[["line",Math.round(e),Math.round(f)],["line",Math.round(e+g),Math.round(f)],["line",Math.round(e+g),Math.round(h+f)],["line",Math.round(e),Math.round(h+f)]];this.clip([j],function(){this.renderBackgroundRepeat(a,b,c,d,i[3],i[0])},this)},Tb.prototype.renderBackgroundRepeat=function(a,b,c,d,e,f){var g=Math.round(d.left+b.left+e),h=Math.round(d.top+b.top+f);this.setFillStyle(this.ctx.createPattern(this.resizeImage(a,c),"repeat")),this.ctx.translate(g,h),this.ctx.fill(),this.ctx.translate(-g,-h)},Tb.prototype.renderBackgroundGradient=function(a,b){if(a instanceof H){var c=this.ctx.createLinearGradient(b.left+b.width*a.x0,b.top+b.height*a.y0,b.left+b.width*a.x1,b.top+b.height*a.y1);a.colorStops.forEach(function(a){c.addColorStop(a.stop,a.color.toString())}),this.rectangle(b.left,b.top,b.width,b.height,c)}},Tb.prototype.resizeImage=function(a,c){var d=a.image;if(d.width===c.width&&d.height===c.height)return d;var e,f=b.createElement("canvas");return f.width=c.width,f.height=c.height,e=f.getContext("2d"),e.drawImage(d,0,0,d.width,d.height,0,0,c.width,c.height),f}}).call({},"undefined"!=typeof window?window:void 0,"undefined"!=typeof document?document:void 0);;/* ========================================================================
 * Bootstrap: modal.js v3.3.6
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options             = options
    this.$body               = $(document.body)
    this.$element            = $(element)
    this.$dialog             = this.$element.find('.modal-dialog')
    this.$backdrop           = null
    this.isShown             = null
    this.originalBodyPad     = null
    this.scrollbarWidth      = 0
    this.ignoreBackdropClick = false

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.3.6'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element.addClass('in')

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $(document.createElement('div'))
        .addClass('modal-backdrop ' + animate)
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);
;/* ng-infinite-scroll - v1.0.0 - 2013-02-23 */
var mod;

mod = angular.module('infinite-scroll', []);

mod.directive('infiniteScroll', [
  '$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
    return {
      link: function(scope, elem, attrs) {
        var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
        $window = angular.element($window);
        scrollDistance = 0;
        if (attrs.infiniteScrollDistance != null) {
          scope.$watch(attrs.infiniteScrollDistance, function(value) {
            return scrollDistance = parseInt(value, 10);
          });
        }
        scrollEnabled = true;
        checkWhenEnabled = false;
        if (attrs.infiniteScrollDisabled != null) {
          scope.$watch(attrs.infiniteScrollDisabled, function(value) {
            scrollEnabled = !value;
            if (scrollEnabled && checkWhenEnabled) {
              checkWhenEnabled = false;
              return handler();
            }
          });
        }
        handler = function() {
          var elementBottom, remaining, shouldScroll, windowBottom;
          windowBottom = $window.height() + $window.scrollTop();
          elementBottom = elem.offset().top + elem.height();
          remaining = elementBottom - windowBottom;
          shouldScroll = remaining <= $window.height() * scrollDistance;
          if (shouldScroll && scrollEnabled) {
            if ($rootScope.$$phase) {
              return scope.$eval(attrs.infiniteScroll);
            } else {
              return scope.$apply(attrs.infiniteScroll);
            }
          } else if (shouldScroll) {
            return checkWhenEnabled = true;
          }
        };
        $window.on('scroll', handler);
        scope.$on('$destroy', function() {
          return $window.off('scroll', handler);
        });
        return $timeout((function() {
          if (attrs.infiniteScrollImmediateCheck) {
            if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
              return handler();
            }
          } else {
            return handler();
          }
        }), 0);
      }
    };
  }
]);
;var __slice = Array.prototype.slice;
(function($) {
  var Sketch;
  $.fn.sketch = function() {
    var args, key, sketch;
    key = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (this.length > 1) {
      $.error('Sketch.js can only be called on one element at a time.');
    }
    sketch = this.data('sketch');
    if (typeof key === 'string' && sketch) {
      if (sketch[key]) {
        if (typeof sketch[key] === 'function') {
          return sketch[key].apply(sketch, args);
        } else if (args.length === 0) {
          return sketch[key];
        } else if (args.length === 1) {
          return sketch[key] = args[0];
        }
      } else {
        return $.error('Sketch.js did not recognize the given command.');
      }
    } else if (sketch) {
      return sketch;
    } else {
      this.data('sketch', new Sketch(this.get(0), key));
      return this;
    }
  };
  Sketch = (function() {
    function Sketch(el, opts) {
      this.el = el;
      this.canvas = $(el);
      this.context = el.getContext('2d');
      this.options = $.extend({
        toolLinks: true,
        defaultTool: 'marker',
        defaultColor: '#000000',
        defaultSize: 5
      }, opts);
      this.painting = false;
      this.color = this.options.defaultColor;
      this.size = this.options.defaultSize;
      this.tool = this.options.defaultTool;
      this.actions = [];
      this.action = [];
      this.canvas.bind('click mousedown mouseup mousemove mouseleave mouseout touchstart touchmove touchend touchcancel', this.onEvent);
      if (this.options.toolLinks) {
        $('body').delegate("a[href=\"#" + (this.canvas.attr('id')) + "\"]", 'click', function(e) {
          var $canvas, $this, key, sketch, _i, _len, _ref;
          $this = $(this);
          $canvas = $($this.attr('href'));
          sketch = $canvas.data('sketch');
          _ref = ['color', 'size', 'tool'];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            key = _ref[_i];
            if ($this.attr("data-" + key)) {
              sketch.set(key, $(this).attr("data-" + key));
            }
          }
          if ($(this).attr('data-download')) {
            sketch.download($(this).attr('data-download'));
          }
          return false;
        });
      }
    }
    Sketch.prototype.download = function(format) {
      var mime;
      format || (format = "png");
      if (format === "jpg") {
        format = "jpeg";
      }
      mime = "image/" + format;
      return window.open(this.el.toDataURL(mime));
    };
    Sketch.prototype.set = function(key, value) {
      this[key] = value;
      return this.canvas.trigger("sketch.change" + key, value);
    };
    Sketch.prototype.startPainting = function() {
      this.painting = true;
      return this.action = {
        tool: this.tool,
        color: this.color,
        size: parseFloat(this.size),
        events: []
      };
    };
    Sketch.prototype.stopPainting = function() {
      if (this.action) {
        this.actions.push(this.action);
      }
      this.painting = false;
      this.action = null;
      return this.redraw();
    };
    Sketch.prototype.onEvent = function(e) {
      if (e.originalEvent && e.originalEvent.targetTouches) {
        if (e.originalEvent.targetTouches[0] !== undefined && e.originalEvent.targetTouches[0].pageX!==undefined){
          e.pageX = e.originalEvent.targetTouches[0].pageX;
        }
        if (e.originalEvent.targetTouches[0] !== undefined &&e.originalEvent.targetTouches[0].pageY){
          e.pageY = e.originalEvent.targetTouches[0].pageY;
        }
      }
      $.sketch.tools[$(this).data('sketch').tool].onEvent.call($(this).data('sketch'), e);
      e.preventDefault();
      return false;
    };
    Sketch.prototype.redraw = function() {
      var sketch;
      this.el.width = this.canvas.width();
      this.context = this.el.getContext('2d');
      sketch = this;
      $.each(this.actions, function() {
        if (this.tool) {
          return $.sketch.tools[this.tool].draw.call(sketch, this);
        }
      });
      if (this.painting && this.action) {
        return $.sketch.tools[this.action.tool].draw.call(sketch, this.action);
      }
    };
    return Sketch;
  })();
  $.sketch = {
    tools: {}
  };
  $.sketch.tools.marker = {
    onEvent: function(e) {
      switch (e.type) {
        case 'mousedown':
        case 'touchstart':
          this.startPainting();
          break;
        case 'mouseup':
        case 'mouseout':
        case 'mouseleave':
        case 'touchend':
        case 'touchcancel':
          this.stopPainting();
      }
      if (this.painting) {
        this.action.events.push({
          x: e.pageX - this.canvas.offset().left,
          y: e.pageY - this.canvas.offset().top,
          event: e.type
        });
        return this.redraw();
      }
    },
    draw: function(action) {
      var event, previous, _i, _len, _ref;
      this.context.lineJoin = "round";
      this.context.lineCap = "round";
      this.context.beginPath();
      this.context.moveTo(action.events[0].x, action.events[0].y);
      _ref = action.events;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event = _ref[_i];
        this.context.lineTo(event.x, event.y);
        previous = event;
      }
      this.context.strokeStyle = action.color;
      this.context.lineWidth = action.size;
      return this.context.stroke();
    }
  };
  return $.sketch.tools.eraser = {
    onEvent: function(e) {
      return $.sketch.tools.marker.onEvent.call(this, e);
    },
    draw: function(action) {
      var oldcomposite;
      oldcomposite = this.context.globalCompositeOperation;
      this.context.globalCompositeOperation = "copy";
      action.color = "rgba(0,0,0,0)";
      $.sketch.tools.marker.draw.call(this, action);
      return this.context.globalCompositeOperation = oldcomposite;
    }
  };
})(jQuery);;/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.10.0 - 2014-01-13
 * License: MIT
 */
angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.transition","ui.bootstrap.collapse","ui.bootstrap.accordion","ui.bootstrap.alert","ui.bootstrap.bindHtml","ui.bootstrap.buttons","ui.bootstrap.carousel","ui.bootstrap.position","ui.bootstrap.datepicker","ui.bootstrap.dropdownToggle","ui.bootstrap.modal","ui.bootstrap.pagination","ui.bootstrap.tooltip","ui.bootstrap.popover","ui.bootstrap.progressbar","ui.bootstrap.rating","ui.bootstrap.tabs","ui.bootstrap.timepicker","ui.bootstrap.typeahead"]);
angular.module("ui.bootstrap.tpls", ["template/accordion/accordion-group.html","template/accordion/accordion.html","template/alert/alert.html","template/carousel/carousel.html","template/carousel/slide.html","template/datepicker/datepicker.html","template/datepicker/popup.html","template/modal/backdrop.html","template/modal/window.html","template/pagination/pager.html","template/pagination/pagination.html","template/tooltip/tooltip-html-unsafe-popup.html","template/tooltip/tooltip-popup.html","template/popover/popover.html","template/progressbar/bar.html","template/progressbar/progress.html","template/progressbar/progressbar.html","template/rating/rating.html","template/tabs/tab.html","template/tabs/tabset.html","template/timepicker/timepicker.html","template/typeahead/typeahead-match.html","template/typeahead/typeahead-popup.html"]);
angular.module('ui.bootstrap.transition', [])

/**
 * $transition service provides a consistent interface to trigger CSS 3 transitions and to be informed when they complete.
 * @param  {DOMElement} element  The DOMElement that will be animated.
 * @param  {string|object|function} trigger  The thing that will cause the transition to start:
 *   - As a string, it represents the css class to be added to the element.
 *   - As an object, it represents a hash of style attributes to be applied to the element.
 *   - As a function, it represents a function to be called that will cause the transition to occur.
 * @return {Promise}  A promise that is resolved when the transition finishes.
 */
.factory('$transition', ['$q', '$timeout', '$rootScope', function($q, $timeout, $rootScope) {

  var $transition = function(element, trigger, options) {
    options = options || {};
    var deferred = $q.defer();
    var endEventName = $transition[options.animation ? "animationEndEventName" : "transitionEndEventName"];

    var transitionEndHandler = function(event) {
      $rootScope.$apply(function() {
        element.unbind(endEventName, transitionEndHandler);
        deferred.resolve(element);
      });
    };

    if (endEventName) {
      element.bind(endEventName, transitionEndHandler);
    }

    // Wrap in a timeout to allow the browser time to update the DOM before the transition is to occur
    $timeout(function() {
      if ( angular.isString(trigger) ) {
        element.addClass(trigger);
      } else if ( angular.isFunction(trigger) ) {
        trigger(element);
      } else if ( angular.isObject(trigger) ) {
        element.css(trigger);
      }
      //If browser does not support transitions, instantly resolve
      if ( !endEventName ) {
        deferred.resolve(element);
      }
    });

    // Add our custom cancel function to the promise that is returned
    // We can call this if we are about to run a new transition, which we know will prevent this transition from ending,
    // i.e. it will therefore never raise a transitionEnd event for that transition
    deferred.promise.cancel = function() {
      if ( endEventName ) {
        element.unbind(endEventName, transitionEndHandler);
      }
      deferred.reject('Transition cancelled');
    };

    return deferred.promise;
  };

  // Work out the name of the transitionEnd event
  var transElement = document.createElement('trans');
  var transitionEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'transition': 'transitionend'
  };
  var animationEndEventNames = {
    'WebkitTransition': 'webkitAnimationEnd',
    'MozTransition': 'animationend',
    'OTransition': 'oAnimationEnd',
    'transition': 'animationend'
  };
  function findEndEventName(endEventNames) {
    for (var name in endEventNames){
      if (transElement.style[name] !== undefined) {
        return endEventNames[name];
      }
    }
  }
  $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
  $transition.animationEndEventName = findEndEventName(animationEndEventNames);
  return $transition;
}]);

angular.module('ui.bootstrap.collapse', ['ui.bootstrap.transition'])

  .directive('collapse', ['$transition', function ($transition, $timeout) {

    return {
      link: function (scope, element, attrs) {

        var initialAnimSkip = true;
        var currentTransition;

        function doTransition(change) {
          var newTransition = $transition(element, change);
          if (currentTransition) {
            currentTransition.cancel();
          }
          currentTransition = newTransition;
          newTransition.then(newTransitionDone, newTransitionDone);
          return newTransition;

          function newTransitionDone() {
            // Make sure it's this transition, otherwise, leave it alone.
            if (currentTransition === newTransition) {
              currentTransition = undefined;
            }
          }
        }

        function expand() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            expandDone();
          } else {
            element.removeClass('collapse').addClass('collapsing');
            doTransition({ height: element[0].scrollHeight + 'px' }).then(expandDone);
          }
        }

        function expandDone() {
          element.removeClass('collapsing');
          element.addClass('collapse in');
          element.css({height: 'auto'});
        }

        function collapse() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            collapseDone();
            element.css({height: 0});
          } else {
            // CSS transitions don't work with height: auto, so we have to manually change the height to a specific value
            element.css({ height: element[0].scrollHeight + 'px' });
            //trigger reflow so a browser realizes that height was updated from auto to a specific value
            var x = element[0].offsetWidth;

            element.removeClass('collapse in').addClass('collapsing');

            doTransition({ height: 0 }).then(collapseDone);
          }
        }

        function collapseDone() {
          element.removeClass('collapsing');
          element.addClass('collapse');
        }

        scope.$watch(attrs.collapse, function (shouldCollapse) {
          if (shouldCollapse) {
            collapse();
          } else {
            expand();
          }
        });
      }
    };
  }]);

angular.module('ui.bootstrap.accordion', ['ui.bootstrap.collapse'])

.constant('accordionConfig', {
  closeOthers: true
})

.controller('AccordionController', ['$scope', '$attrs', 'accordionConfig', function ($scope, $attrs, accordionConfig) {

  // This array keeps track of the accordion groups
  this.groups = [];

  // Ensure that all the groups in this accordion are closed, unless close-others explicitly says not to
  this.closeOthers = function(openGroup) {
    var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
    if ( closeOthers ) {
      angular.forEach(this.groups, function (group) {
        if ( group !== openGroup ) {
          group.isOpen = false;
        }
      });
    }
  };
  
  // This is called from the accordion-group directive to add itself to the accordion
  this.addGroup = function(groupScope) {
    var that = this;
    this.groups.push(groupScope);

    groupScope.$on('$destroy', function (event) {
      that.removeGroup(groupScope);
    });
  };

  // This is called from the accordion-group directive when to remove itself
  this.removeGroup = function(group) {
    var index = this.groups.indexOf(group);
    if ( index !== -1 ) {
      this.groups.splice(this.groups.indexOf(group), 1);
    }
  };

}])

// The accordion directive simply sets up the directive controller
// and adds an accordion CSS class to itself element.
.directive('accordion', function () {
  return {
    restrict:'EA',
    controller:'AccordionController',
    transclude: true,
    replace: false,
    templateUrl: 'template/accordion/accordion.html'
  };
})

// The accordion-group directive indicates a block of html that will expand and collapse in an accordion
.directive('accordionGroup', ['$parse', function($parse) {
  return {
    require:'^accordion',         // We need this directive to be inside an accordion
    restrict:'EA',
    transclude:true,              // It transcludes the contents of the directive into the template
    replace: true,                // The element containing the directive will be replaced with the template
    templateUrl:'template/accordion/accordion-group.html',
    scope:{ heading:'@' },        // Create an isolated scope and interpolate the heading attribute onto this scope
    controller: function() {
      this.setHeading = function(element) {
        this.heading = element;
      };
    },
    link: function(scope, element, attrs, accordionCtrl) {
      var getIsOpen, setIsOpen;

      accordionCtrl.addGroup(scope);

      scope.isOpen = false;
      
      if ( attrs.isOpen ) {
        getIsOpen = $parse(attrs.isOpen);
        setIsOpen = getIsOpen.assign;

        scope.$parent.$watch(getIsOpen, function(value) {
          scope.isOpen = !!value;
        });
      }

      scope.$watch('isOpen', function(value) {
        if ( value ) {
          accordionCtrl.closeOthers(scope);
        }
        if ( setIsOpen ) {
          setIsOpen(scope.$parent, value);
        }
      });
    }
  };
}])

// Use accordion-heading below an accordion-group to provide a heading containing HTML
// <accordion-group>
//   <accordion-heading>Heading containing HTML - <img src="..."></accordion-heading>
// </accordion-group>
.directive('accordionHeading', function() {
  return {
    restrict: 'EA',
    transclude: true,   // Grab the contents to be used as the heading
    template: '',       // In effect remove this element!
    replace: true,
    require: '^accordionGroup',
    compile: function(element, attr, transclude) {
      return function link(scope, element, attr, accordionGroupCtrl) {
        // Pass the heading to the accordion-group controller
        // so that it can be transcluded into the right place in the template
        // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
        accordionGroupCtrl.setHeading(transclude(scope, function() {}));
      };
    }
  };
})

// Use in the accordion-group template to indicate where you want the heading to be transcluded
// You must provide the property on the accordion-group controller that will hold the transcluded element
// <div class="accordion-group">
//   <div class="accordion-heading" ><a ... accordion-transclude="heading">...</a></div>
//   ...
// </div>
.directive('accordionTransclude', function() {
  return {
    require: '^accordionGroup',
    link: function(scope, element, attr, controller) {
      scope.$watch(function() { return controller[attr.accordionTransclude]; }, function(heading) {
        if ( heading ) {
          element.html('');
          element.append(heading);
        }
      });
    }
  };
});

angular.module("ui.bootstrap.alert", [])

.controller('AlertController', ['$scope', '$attrs', function ($scope, $attrs) {
  $scope.closeable = 'close' in $attrs;
}])

.directive('alert', function () {
  return {
    restrict:'EA',
    controller:'AlertController',
    templateUrl:'template/alert/alert.html',
    transclude:true,
    replace:true,
    scope: {
      type: '=',
      close: '&'
    }
  };
});

angular.module('ui.bootstrap.bindHtml', [])

  .directive('bindHtmlUnsafe', function () {
    return function (scope, element, attr) {
      element.addClass('ng-binding').data('$binding', attr.bindHtmlUnsafe);
      scope.$watch(attr.bindHtmlUnsafe, function bindHtmlUnsafeWatchAction(value) {
        element.html(value || '');
      });
    };
  });
angular.module('ui.bootstrap.buttons', [])

.constant('buttonConfig', {
  activeClass: 'active',
  toggleEvent: 'click'
})

.controller('ButtonsController', ['buttonConfig', function(buttonConfig) {
  this.activeClass = buttonConfig.activeClass || 'active';
  this.toggleEvent = buttonConfig.toggleEvent || 'click';
}])

.directive('btnRadio', function () {
  return {
    require: ['btnRadio', 'ngModel'],
    controller: 'ButtonsController',
    link: function (scope, element, attrs, ctrls) {
      var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      //model -> UI
      ngModelCtrl.$render = function () {
        element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.btnRadio)));
      };

      //ui->model
      element.bind(buttonsCtrl.toggleEvent, function () {
        if (!element.hasClass(buttonsCtrl.activeClass)) {
          scope.$apply(function () {
            ngModelCtrl.$setViewValue(scope.$eval(attrs.btnRadio));
            ngModelCtrl.$render();
          });
        }
      });
    }
  };
})

.directive('btnCheckbox', function () {
  return {
    require: ['btnCheckbox', 'ngModel'],
    controller: 'ButtonsController',
    link: function (scope, element, attrs, ctrls) {
      var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      function getTrueValue() {
        return getCheckboxValue(attrs.btnCheckboxTrue, true);
      }

      function getFalseValue() {
        return getCheckboxValue(attrs.btnCheckboxFalse, false);
      }
      
      function getCheckboxValue(attributeValue, defaultValue) {
        var val = scope.$eval(attributeValue);
        return angular.isDefined(val) ? val : defaultValue;
      }

      //model -> UI
      ngModelCtrl.$render = function () {
        element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()));
      };

      //ui->model
      element.bind(buttonsCtrl.toggleEvent, function () {
        scope.$apply(function () {
          ngModelCtrl.$setViewValue(element.hasClass(buttonsCtrl.activeClass) ? getFalseValue() : getTrueValue());
          ngModelCtrl.$render();
        });
      });
    }
  };
});

/**
* @ngdoc overview
* @name ui.bootstrap.carousel
*
* @description
* AngularJS version of an image carousel.
*
*/
angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
.controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', function ($scope, $timeout, $transition, $q) {
  var self = this,
    slides = self.slides = [],
    currentIndex = -1,
    currentTimeout, isPlaying;
  self.currentSlide = null;

  var destroyed = false;
  /* direction: "prev" or "next" */
  self.select = function(nextSlide, direction) {
    var nextIndex = slides.indexOf(nextSlide);
    //Decide direction if it's not given
    if (direction === undefined) {
      direction = nextIndex > currentIndex ? "next" : "prev";
    }
    if (nextSlide && nextSlide !== self.currentSlide) {
      if ($scope.$currentTransition) {
        $scope.$currentTransition.cancel();
        //Timeout so ng-class in template has time to fix classes for finished slide
        $timeout(goNext);
      } else {
        goNext();
      }
    }
    function goNext() {
      // Scope has been destroyed, stop here.
      if (destroyed) { return; }
      //If we have a slide to transition from and we have a transition type and we're allowed, go
      if (self.currentSlide && angular.isString(direction) && !$scope.noTransition && nextSlide.$element) {
        //We shouldn't do class manip in here, but it's the same weird thing bootstrap does. need to fix sometime
        nextSlide.$element.addClass(direction);
        var reflow = nextSlide.$element[0].offsetWidth; //force reflow

        //Set all other slides to stop doing their stuff for the new transition
        angular.forEach(slides, function(slide) {
          angular.extend(slide, {direction: '', entering: false, leaving: false, active: false});
        });
        angular.extend(nextSlide, {direction: direction, active: true, entering: true});
        angular.extend(self.currentSlide||{}, {direction: direction, leaving: true});

        $scope.$currentTransition = $transition(nextSlide.$element, {});
        //We have to create new pointers inside a closure since next & current will change
        (function(next,current) {
          $scope.$currentTransition.then(
            function(){ transitionDone(next, current); },
            function(){ transitionDone(next, current); }
          );
        }(nextSlide, self.currentSlide));
      } else {
        transitionDone(nextSlide, self.currentSlide);
      }
      self.currentSlide = nextSlide;
      currentIndex = nextIndex;
      //every time you change slides, reset the timer
      restartTimer();
    }
    function transitionDone(next, current) {
      angular.extend(next, {direction: '', active: true, leaving: false, entering: false});
      angular.extend(current||{}, {direction: '', active: false, leaving: false, entering: false});
      $scope.$currentTransition = null;
    }
  };
  $scope.$on('$destroy', function () {
    destroyed = true;
  });

  /* Allow outside people to call indexOf on slides array */
  self.indexOfSlide = function(slide) {
    return slides.indexOf(slide);
  };

  $scope.next = function() {
    var newIndex = (currentIndex + 1) % slides.length;

    //Prevent this user-triggered transition from occurring if there is already one in progress
    if (!$scope.$currentTransition) {
      return self.select(slides[newIndex], 'next');
    }
  };

  $scope.prev = function() {
    var newIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;

    //Prevent this user-triggered transition from occurring if there is already one in progress
    if (!$scope.$currentTransition) {
      return self.select(slides[newIndex], 'prev');
    }
  };

  $scope.select = function(slide) {
    self.select(slide);
  };

  $scope.isActive = function(slide) {
     return self.currentSlide === slide;
  };

  $scope.slides = function() {
    return slides;
  };

  $scope.$watch('interval', restartTimer);
  $scope.$on('$destroy', resetTimer);

  function restartTimer() {
    resetTimer();
    var interval = +$scope.interval;
    if (!isNaN(interval) && interval>=0) {
      currentTimeout = $timeout(timerFn, interval);
    }
  }

  function resetTimer() {
    if (currentTimeout) {
      $timeout.cancel(currentTimeout);
      currentTimeout = null;
    }
  }

  function timerFn() {
    if (isPlaying) {
      $scope.next();
      restartTimer();
    } else {
      $scope.pause();
    }
  }

  $scope.play = function() {
    if (!isPlaying) {
      isPlaying = true;
      restartTimer();
    }
  };
  $scope.pause = function() {
    if (!$scope.noPause) {
      isPlaying = false;
      resetTimer();
    }
  };

  self.addSlide = function(slide, element) {
    slide.$element = element;
    slides.push(slide);
    //if this is the first slide or the slide is set to active, select it
    if(slides.length === 1 || slide.active) {
      self.select(slides[slides.length-1]);
      if (slides.length == 1) {
        $scope.play();
      }
    } else {
      slide.active = false;
    }
  };

  self.removeSlide = function(slide) {
    //get the index of the slide inside the carousel
    var index = slides.indexOf(slide);
    slides.splice(index, 1);
    if (slides.length > 0 && slide.active) {
      if (index >= slides.length) {
        self.select(slides[index-1]);
      } else {
        self.select(slides[index]);
      }
    } else if (currentIndex > index) {
      currentIndex--;
    }
  };

}])

/**
 * @ngdoc directive
 * @name ui.bootstrap.carousel.directive:carousel
 * @restrict EA
 *
 * @description
 * Carousel is the outer container for a set of image 'slides' to showcase.
 *
 * @param {number=} interval The time, in milliseconds, that it will take the carousel to go to the next slide.
 * @param {boolean=} noTransition Whether to disable transitions on the carousel.
 * @param {boolean=} noPause Whether to disable pausing on the carousel (by default, the carousel interval pauses on hover).
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
    <carousel>
      <slide>
        <img src="http://placekitten.com/150/150" style="margin:auto;">
        <div class="carousel-caption">
          <p>Beautiful!</p>
        </div>
      </slide>
      <slide>
        <img src="http://placekitten.com/100/150" style="margin:auto;">
        <div class="carousel-caption">
          <p>D'aww!</p>
        </div>
      </slide>
    </carousel>
  </file>
  <file name="demo.css">
    .carousel-indicators {
      top: auto;
      bottom: 15px;
    }
  </file>
</example>
 */
.directive('carousel', [function() {
  return {
    restrict: 'EA',
    transclude: true,
    replace: true,
    controller: 'CarouselController',
    require: 'carousel',
    templateUrl: 'template/carousel/carousel.html',
    scope: {
      interval: '=',
      noTransition: '=',
      noPause: '='
    }
  };
}])

/**
 * @ngdoc directive
 * @name ui.bootstrap.carousel.directive:slide
 * @restrict EA
 *
 * @description
 * Creates a slide inside a {@link ui.bootstrap.carousel.directive:carousel carousel}.  Must be placed as a child of a carousel element.
 *
 * @param {boolean=} active Model binding, whether or not this slide is currently active.
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
<div ng-controller="CarouselDemoCtrl">
  <carousel>
    <slide ng-repeat="slide in slides" active="slide.active">
      <img ng-src="{{slide.image}}" style="margin:auto;">
      <div class="carousel-caption">
        <h4>Slide {{$index}}</h4>
        <p>{{slide.text}}</p>
      </div>
    </slide>
  </carousel>
  <div class="row-fluid">
    <div class="span6">
      <ul>
        <li ng-repeat="slide in slides">
          <button class="btn btn-mini" ng-class="{'btn-info': !slide.active, 'btn-success': slide.active}" ng-disabled="slide.active" ng-click="slide.active = true">select</button>
          {{$index}}: {{slide.text}}
        </li>
      </ul>
      <a class="btn" ng-click="addSlide()">Add Slide</a>
    </div>
    <div class="span6">
      Interval, in milliseconds: <input type="number" ng-model="myInterval">
      <br />Enter a negative number to stop the interval.
    </div>
  </div>
</div>
  </file>
  <file name="script.js">
function CarouselDemoCtrl($scope) {
  $scope.myInterval = 5000;
  var slides = $scope.slides = [];
  $scope.addSlide = function() {
    var newWidth = 200 + ((slides.length + (25 * slides.length)) % 150);
    slides.push({
      image: 'http://placekitten.com/' + newWidth + '/200',
      text: ['More','Extra','Lots of','Surplus'][slides.length % 4] + ' '
        ['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
    });
  };
  for (var i=0; i<4; i++) $scope.addSlide();
}
  </file>
  <file name="demo.css">
    .carousel-indicators {
      top: auto;
      bottom: 15px;
    }
  </file>
</example>
*/

.directive('slide', ['$parse', function($parse) {
  return {
    require: '^carousel',
    restrict: 'EA',
    transclude: true,
    replace: true,
    templateUrl: 'template/carousel/slide.html',
    scope: {
    },
    link: function (scope, element, attrs, carouselCtrl) {
      //Set up optional 'active' = binding
      if (attrs.active) {
        var getActive = $parse(attrs.active);
        var setActive = getActive.assign;
        var lastValue = scope.active = getActive(scope.$parent);
        scope.$watch(function parentActiveWatch() {
          var parentActive = getActive(scope.$parent);

          if (parentActive !== scope.active) {
            // we are out of sync and need to copy
            if (parentActive !== lastValue) {
              // parent changed and it has precedence
              lastValue = scope.active = parentActive;
            } else {
              // if the parent can be assigned then do so
              setActive(scope.$parent, parentActive = lastValue = scope.active);
            }
          }
          return parentActive;
        });
      }

      carouselCtrl.addSlide(scope, element);
      //when the scope is destroyed then remove the slide from the current slides array
      scope.$on('$destroy', function() {
        carouselCtrl.removeSlide(scope);
      });

      scope.$watch('active', function(active) {
        if (active) {
          carouselCtrl.select(scope);
        }
      });
    }
  };
}]);

angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
  .factory('$position', ['$document', '$window', function ($document, $window) {

    function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
      return (getStyle(element, "position") || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft  || $document[0].documentElement.scrollLeft)
        };
      }
    };
  }]);

angular.module('ui.bootstrap.datepicker', ['ui.bootstrap.position'])

.constant('datepickerConfig', {
  dayFormat: 'dd',
  monthFormat: 'MMMM',
  yearFormat: 'yyyy',
  dayHeaderFormat: 'EEE',
  dayTitleFormat: 'MMMM yyyy',
  monthTitleFormat: 'yyyy',
  showWeeks: true,
  startingDay: 0,
  yearRange: 20,
  minDate: null,
  maxDate: null
})

.controller('DatepickerController', ['$scope', '$attrs', 'dateFilter', 'datepickerConfig', function($scope, $attrs, dateFilter, dtConfig) {
  var format = {
    day:        getValue($attrs.dayFormat,        dtConfig.dayFormat),
    month:      getValue($attrs.monthFormat,      dtConfig.monthFormat),
    year:       getValue($attrs.yearFormat,       dtConfig.yearFormat),
    dayHeader:  getValue($attrs.dayHeaderFormat,  dtConfig.dayHeaderFormat),
    dayTitle:   getValue($attrs.dayTitleFormat,   dtConfig.dayTitleFormat),
    monthTitle: getValue($attrs.monthTitleFormat, dtConfig.monthTitleFormat)
  },
  startingDay = getValue($attrs.startingDay,      dtConfig.startingDay),
  yearRange =   getValue($attrs.yearRange,        dtConfig.yearRange);

  this.minDate = dtConfig.minDate ? new Date(dtConfig.minDate) : null;
  this.maxDate = dtConfig.maxDate ? new Date(dtConfig.maxDate) : null;

  function getValue(value, defaultValue) {
    return angular.isDefined(value) ? $scope.$parent.$eval(value) : defaultValue;
  }

  function getDaysInMonth( year, month ) {
    return new Date(year, month, 0).getDate();
  }

  function getDates(startDate, n) {
    var dates = new Array(n);
    var current = startDate, i = 0;
    while (i < n) {
      dates[i++] = new Date(current);
      current.setDate( current.getDate() + 1 );
    }
    return dates;
  }

  function makeDate(date, format, isSelected, isSecondary) {
    return { date: date, label: dateFilter(date, format), selected: !!isSelected, secondary: !!isSecondary };
  }

  this.modes = [
    {
      name: 'day',
      getVisibleDates: function(date, selected) {
        var year = date.getFullYear(), month = date.getMonth(), firstDayOfMonth = new Date(year, month, 1);
        var difference = startingDay - firstDayOfMonth.getDay(),
        numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : - difference,
        firstDate = new Date(firstDayOfMonth), numDates = 0;

        if ( numDisplayedFromPreviousMonth > 0 ) {
          firstDate.setDate( - numDisplayedFromPreviousMonth + 1 );
          numDates += numDisplayedFromPreviousMonth; // Previous
        }
        numDates += getDaysInMonth(year, month + 1); // Current
        numDates += (7 - numDates % 7) % 7; // Next

        var days = getDates(firstDate, numDates), labels = new Array(7);
        for (var i = 0; i < numDates; i ++) {
          var dt = new Date(days[i]);
          days[i] = makeDate(dt, format.day, (selected && selected.getDate() === dt.getDate() && selected.getMonth() === dt.getMonth() && selected.getFullYear() === dt.getFullYear()), dt.getMonth() !== month);
        }
        for (var j = 0; j < 7; j++) {
          labels[j] = dateFilter(days[j].date, format.dayHeader);
        }
        return { objects: days, title: dateFilter(date, format.dayTitle), labels: labels };
      },
      compare: function(date1, date2) {
        return (new Date( date1.getFullYear(), date1.getMonth(), date1.getDate() ) - new Date( date2.getFullYear(), date2.getMonth(), date2.getDate() ) );
      },
      split: 7,
      step: { months: 1 }
    },
    {
      name: 'month',
      getVisibleDates: function(date, selected) {
        var months = new Array(12), year = date.getFullYear();
        for ( var i = 0; i < 12; i++ ) {
          var dt = new Date(year, i, 1);
          months[i] = makeDate(dt, format.month, (selected && selected.getMonth() === i && selected.getFullYear() === year));
        }
        return { objects: months, title: dateFilter(date, format.monthTitle) };
      },
      compare: function(date1, date2) {
        return new Date( date1.getFullYear(), date1.getMonth() ) - new Date( date2.getFullYear(), date2.getMonth() );
      },
      split: 3,
      step: { years: 1 }
    },
    {
      name: 'year',
      getVisibleDates: function(date, selected) {
        var years = new Array(yearRange), year = date.getFullYear(), startYear = parseInt((year - 1) / yearRange, 10) * yearRange + 1;
        for ( var i = 0; i < yearRange; i++ ) {
          var dt = new Date(startYear + i, 0, 1);
          years[i] = makeDate(dt, format.year, (selected && selected.getFullYear() === dt.getFullYear()));
        }
        return { objects: years, title: [years[0].label, years[yearRange - 1].label].join(' - ') };
      },
      compare: function(date1, date2) {
        return date1.getFullYear() - date2.getFullYear();
      },
      split: 5,
      step: { years: yearRange }
    }
  ];

  this.isDisabled = function(date, mode) {
    var currentMode = this.modes[mode || 0];
    return ((this.minDate && currentMode.compare(date, this.minDate) < 0) || (this.maxDate && currentMode.compare(date, this.maxDate) > 0) || ($scope.dateDisabled && $scope.dateDisabled({date: date, mode: currentMode.name})));
  };
}])

.directive( 'datepicker', ['dateFilter', '$parse', 'datepickerConfig', '$log', function (dateFilter, $parse, datepickerConfig, $log) {
  return {
    restrict: 'EA',
    replace: true,
    templateUrl: 'template/datepicker/datepicker.html',
    scope: {
      dateDisabled: '&'
    },
    require: ['datepicker', '?^ngModel'],
    controller: 'DatepickerController',
    link: function(scope, element, attrs, ctrls) {
      var datepickerCtrl = ctrls[0], ngModel = ctrls[1];

      if (!ngModel) {
        return; // do nothing if no ng-model
      }

      // Configuration parameters
      var mode = 0, selected = new Date(), showWeeks = datepickerConfig.showWeeks;

      if (attrs.showWeeks) {
        scope.$parent.$watch($parse(attrs.showWeeks), function(value) {
          showWeeks = !! value;
          updateShowWeekNumbers();
        });
      } else {
        updateShowWeekNumbers();
      }

      if (attrs.min) {
        scope.$parent.$watch($parse(attrs.min), function(value) {
          datepickerCtrl.minDate = value ? new Date(value) : null;
          refill();
        });
      }
      if (attrs.max) {
        scope.$parent.$watch($parse(attrs.max), function(value) {
          datepickerCtrl.maxDate = value ? new Date(value) : null;
          refill();
        });
      }

      function updateShowWeekNumbers() {
        scope.showWeekNumbers = mode === 0 && showWeeks;
      }

      // Split array into smaller arrays
      function split(arr, size) {
        var arrays = [];
        while (arr.length > 0) {
          arrays.push(arr.splice(0, size));
        }
        return arrays;
      }

      function refill( updateSelected ) {
        var date = null, valid = true;

        if ( ngModel.$modelValue ) {
          date = new Date( ngModel.$modelValue );

          if ( isNaN(date) ) {
            valid = false;
            $log.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
          } else if ( updateSelected ) {
            selected = date;
          }
        }
        ngModel.$setValidity('date', valid);

        var currentMode = datepickerCtrl.modes[mode], data = currentMode.getVisibleDates(selected, date);
        angular.forEach(data.objects, function(obj) {
          obj.disabled = datepickerCtrl.isDisabled(obj.date, mode);
        });

        ngModel.$setValidity('date-disabled', (!date || !datepickerCtrl.isDisabled(date)));

        scope.rows = split(data.objects, currentMode.split);
        scope.labels = data.labels || [];
        scope.title = data.title;
      }

      function setMode(value) {
        mode = value;
        updateShowWeekNumbers();
        refill();
      }

      ngModel.$render = function() {
        refill( true );
      };

      scope.select = function( date ) {
        if ( mode === 0 ) {
          var dt = ngModel.$modelValue ? new Date( ngModel.$modelValue ) : new Date(0, 0, 0, 0, 0, 0, 0);
          dt.setFullYear( date.getFullYear(), date.getMonth(), date.getDate() );
          ngModel.$setViewValue( dt );
          refill( true );
        } else {
          selected = date;
          setMode( mode - 1 );
        }
      };
      scope.move = function(direction) {
        var step = datepickerCtrl.modes[mode].step;
        selected.setMonth( selected.getMonth() + direction * (step.months || 0) );
        selected.setFullYear( selected.getFullYear() + direction * (step.years || 0) );
        refill();
      };
      scope.toggleMode = function() {
        setMode( (mode + 1) % datepickerCtrl.modes.length );
      };
      scope.getWeekNumber = function(row) {
        return ( mode === 0 && scope.showWeekNumbers && row.length === 7 ) ? getISO8601WeekNumber(row[0].date) : null;
      };

      function getISO8601WeekNumber(date) {
        var checkDate = new Date(date);
        checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
        var time = checkDate.getTime();
        checkDate.setMonth(0); // Compare with Jan 1
        checkDate.setDate(1);
        return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
      }
    }
  };
}])

.constant('datepickerPopupConfig', {
  dateFormat: 'yyyy-MM-dd',
  currentText: 'Today',
  toggleWeeksText: 'Weeks',
  clearText: 'Clear',
  closeText: 'Done',
  closeOnDateSelection: true,
  appendToBody: false,
  showButtonBar: true
})

.directive('datepickerPopup', ['$compile', '$parse', '$document', '$position', 'dateFilter', 'datepickerPopupConfig', 'datepickerConfig',
function ($compile, $parse, $document, $position, dateFilter, datepickerPopupConfig, datepickerConfig) {
  return {
    restrict: 'EA',
    require: 'ngModel',
    link: function(originalScope, element, attrs, ngModel) {
      var scope = originalScope.$new(), // create a child scope so we are not polluting original one
          dateFormat,
          closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? originalScope.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection,
          appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? originalScope.$eval(attrs.datepickerAppendToBody) : datepickerPopupConfig.appendToBody;

      attrs.$observe('datepickerPopup', function(value) {
          dateFormat = value || datepickerPopupConfig.dateFormat;
          ngModel.$render();
      });

      scope.showButtonBar = angular.isDefined(attrs.showButtonBar) ? originalScope.$eval(attrs.showButtonBar) : datepickerPopupConfig.showButtonBar;

      originalScope.$on('$destroy', function() {
        $popup.remove();
        scope.$destroy();
      });

      attrs.$observe('currentText', function(text) {
        scope.currentText = angular.isDefined(text) ? text : datepickerPopupConfig.currentText;
      });
      attrs.$observe('toggleWeeksText', function(text) {
        scope.toggleWeeksText = angular.isDefined(text) ? text : datepickerPopupConfig.toggleWeeksText;
      });
      attrs.$observe('clearText', function(text) {
        scope.clearText = angular.isDefined(text) ? text : datepickerPopupConfig.clearText;
      });
      attrs.$observe('closeText', function(text) {
        scope.closeText = angular.isDefined(text) ? text : datepickerPopupConfig.closeText;
      });

      var getIsOpen, setIsOpen;
      if ( attrs.isOpen ) {
        getIsOpen = $parse(attrs.isOpen);
        setIsOpen = getIsOpen.assign;

        originalScope.$watch(getIsOpen, function updateOpen(value) {
          scope.isOpen = !! value;
        });
      }
      scope.isOpen = getIsOpen ? getIsOpen(originalScope) : false; // Initial state

      function setOpen( value ) {
        if (setIsOpen) {
          setIsOpen(originalScope, !!value);
        } else {
          scope.isOpen = !!value;
        }
      }

      var documentClickBind = function(event) {
        if (scope.isOpen && event.target !== element[0]) {
          scope.$apply(function() {
            setOpen(false);
          });
        }
      };

      var elementFocusBind = function() {
        scope.$apply(function() {
          setOpen( true );
        });
      };

      // popup element used to display calendar
      var popupEl = angular.element('<div datepicker-popup-wrap><div datepicker></div></div>');
      popupEl.attr({
        'ng-model': 'date',
        'ng-change': 'dateSelection()'
      });
      var datepickerEl = angular.element(popupEl.children()[0]),
          datepickerOptions = {};
      if (attrs.datepickerOptions) {
        datepickerOptions = originalScope.$eval(attrs.datepickerOptions);
        datepickerEl.attr(angular.extend({}, datepickerOptions));
      }

      // TODO: reverse from dateFilter string to Date object
      function parseDate(viewValue) {
        if (!viewValue) {
          ngModel.$setValidity('date', true);
          return null;
        } else if (angular.isDate(viewValue)) {
          ngModel.$setValidity('date', true);
          return viewValue;
        } else if (angular.isString(viewValue)) {
          var date = new Date(viewValue);
          if (isNaN(date)) {
            ngModel.$setValidity('date', false);
            return undefined;
          } else {
            ngModel.$setValidity('date', true);
            return date;
          }
        } else {
          ngModel.$setValidity('date', false);
          return undefined;
        }
      }
      ngModel.$parsers.unshift(parseDate);

      // Inner change
      scope.dateSelection = function(dt) {
        if (angular.isDefined(dt)) {
          scope.date = dt;
        }
        ngModel.$setViewValue(scope.date);
        ngModel.$render();

        if (closeOnDateSelection) {
          setOpen( false );
        }
      };

      element.bind('input change keyup', function() {
        scope.$apply(function() {
          scope.date = ngModel.$modelValue;
        });
      });

      // Outter change
      ngModel.$render = function() {
        var date = ngModel.$viewValue ? dateFilter(ngModel.$viewValue, dateFormat) : '';
        element.val(date);
        scope.date = ngModel.$modelValue;
      };

      function addWatchableAttribute(attribute, scopeProperty, datepickerAttribute) {
        if (attribute) {
          originalScope.$watch($parse(attribute), function(value){
            scope[scopeProperty] = value;
          });
          datepickerEl.attr(datepickerAttribute || scopeProperty, scopeProperty);
        }
      }
      addWatchableAttribute(attrs.min, 'min');
      addWatchableAttribute(attrs.max, 'max');
      if (attrs.showWeeks) {
        addWatchableAttribute(attrs.showWeeks, 'showWeeks', 'show-weeks');
      } else {
        scope.showWeeks = 'show-weeks' in datepickerOptions ? datepickerOptions['show-weeks'] : datepickerConfig.showWeeks;
        datepickerEl.attr('show-weeks', 'showWeeks');
      }
      if (attrs.dateDisabled) {
        datepickerEl.attr('date-disabled', attrs.dateDisabled);
      }

      function updatePosition() {
        scope.position = appendToBody ? $position.offset(element) : $position.position(element);
        scope.position.top = scope.position.top + element.prop('offsetHeight');
      }

      var documentBindingInitialized = false, elementFocusInitialized = false;
      scope.$watch('isOpen', function(value) {
        if (value) {
          updatePosition();
          $document.bind('click', documentClickBind);
          if(elementFocusInitialized) {
            element.unbind('focus', elementFocusBind);
          }
          element[0].focus();
          documentBindingInitialized = true;
        } else {
          if(documentBindingInitialized) {
            $document.unbind('click', documentClickBind);
          }
          element.bind('focus', elementFocusBind);
          elementFocusInitialized = true;
        }

        if ( setIsOpen ) {
          setIsOpen(originalScope, value);
        }
      });

      scope.today = function() {
        scope.dateSelection(new Date());
      };
      scope.clear = function() {
        scope.dateSelection(null);
      };

      var $popup = $compile(popupEl)(scope);
      if ( appendToBody ) {
        $document.find('body').append($popup);
      } else {
        element.after($popup);
      }
    }
  };
}])

.directive('datepickerPopupWrap', function() {
  return {
    restrict:'EA',
    replace: true,
    transclude: true,
    templateUrl: 'template/datepicker/popup.html',
    link:function (scope, element, attrs) {
      element.bind('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
      });
    }
  };
});

/*
 * dropdownToggle - Provides dropdown menu functionality in place of bootstrap js
 * @restrict class or attribute
 * @example:
   <li class="dropdown">
     <a class="dropdown-toggle">My Dropdown Menu</a>
     <ul class="dropdown-menu">
       <li ng-repeat="choice in dropChoices">
         <a ng-href="{{choice.href}}">{{choice.text}}</a>
       </li>
     </ul>
   </li>
 */

angular.module('ui.bootstrap.dropdownToggle', []).directive('dropdownToggle', ['$document', '$location', function ($document, $location) {
  var openElement = null,
      closeMenu   = angular.noop;
  return {
    restrict: 'CA',
    link: function(scope, element, attrs) {
      scope.$watch('$location.path', function() { closeMenu(); });
      element.parent().bind('click', function() { closeMenu(); });
      element.bind('click', function (event) {

        var elementWasOpen = (element === openElement);

        event.preventDefault();
        event.stopPropagation();

        if (!!openElement) {
          closeMenu();
        }

        if (!elementWasOpen && !element.hasClass('disabled') && !element.prop('disabled')) {
          element.parent().addClass('open');
          openElement = element;
          closeMenu = function (event) {
            if (event) {
              event.preventDefault();
              event.stopPropagation();
            }
            $document.unbind('click', closeMenu);
            element.parent().removeClass('open');
            closeMenu = angular.noop;
            openElement = null;
          };
          $document.bind('click', closeMenu);
        }
      });
    }
  };
}]);

angular.module('ui.bootstrap.modal', ['ui.bootstrap.transition'])

/**
 * A helper, internal data structure that acts as a map but also allows getting / removing
 * elements in the LIFO order
 */
  .factory('$$stackedMap', function () {
    return {
      createNew: function () {
        var stack = [];

        return {
          add: function (key, value) {
            stack.push({
              key: key,
              value: value
            });
          },
          get: function (key) {
            for (var i = 0; i < stack.length; i++) {
              if (key == stack[i].key) {
                return stack[i];
              }
            }
          },
          keys: function() {
            var keys = [];
            for (var i = 0; i < stack.length; i++) {
              keys.push(stack[i].key);
            }
            return keys;
          },
          top: function () {
            return stack[stack.length - 1];
          },
          remove: function (key) {
            var idx = -1;
            for (var i = 0; i < stack.length; i++) {
              if (key == stack[i].key) {
                idx = i;
                break;
              }
            }
            return stack.splice(idx, 1)[0];
          },
          removeTop: function () {
            return stack.splice(stack.length - 1, 1)[0];
          },
          length: function () {
            return stack.length;
          }
        };
      }
    };
  })

/**
 * A helper directive for the $modal service. It creates a backdrop element.
 */
  .directive('modalBackdrop', ['$timeout', function ($timeout) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/modal/backdrop.html',
      link: function (scope) {

        scope.animate = false;

        //trigger CSS transitions
        $timeout(function () {
          scope.animate = true;
        });
      }
    };
  }])

  .directive('modalWindow', ['$modalStack', '$timeout', function ($modalStack, $timeout) {
    return {
      restrict: 'EA',
      scope: {
        index: '@',
        animate: '='
      },
      replace: true,
      transclude: true,
      templateUrl: 'template/modal/window.html',
      link: function (scope, element, attrs) {
        scope.windowClass = attrs.windowClass || '';

        $timeout(function () {
          // trigger CSS transitions
          scope.animate = true;
          // focus a freshly-opened modal
          element[0].focus();
        });

        scope.close = function (evt) {
          var modal = $modalStack.getTop();
          if (modal && modal.value.backdrop && modal.value.backdrop != 'static' && (evt.target === evt.currentTarget)) {
            evt.preventDefault();
            evt.stopPropagation();
            $modalStack.dismiss(modal.key, 'backdrop click');
          }
        };
      }
    };
  }])

  .factory('$modalStack', ['$transition', '$timeout', '$document', '$compile', '$rootScope', '$$stackedMap',
    function ($transition, $timeout, $document, $compile, $rootScope, $$stackedMap) {

      var OPENED_MODAL_CLASS = 'modal-open';

      var backdropDomEl, backdropScope;
      var openedWindows = $$stackedMap.createNew();
      var $modalStack = {};

      function backdropIndex() {
        var topBackdropIndex = -1;
        var opened = openedWindows.keys();
        for (var i = 0; i < opened.length; i++) {
          if (openedWindows.get(opened[i]).value.backdrop) {
            topBackdropIndex = i;
          }
        }
        return topBackdropIndex;
      }

      $rootScope.$watch(backdropIndex, function(newBackdropIndex){
        if (backdropScope) {
          backdropScope.index = newBackdropIndex;
        }
      });

      function removeModalWindow(modalInstance) {

        var body = $document.find('body').eq(0);
        var modalWindow = openedWindows.get(modalInstance).value;

        //clean up the stack
        openedWindows.remove(modalInstance);

        //remove window DOM element
        removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, 300, checkRemoveBackdrop);
        body.toggleClass(OPENED_MODAL_CLASS, openedWindows.length() > 0);
      }

      function checkRemoveBackdrop() {
          //remove backdrop if no longer needed
          if (backdropDomEl && backdropIndex() == -1) {
            var backdropScopeRef = backdropScope;
            removeAfterAnimate(backdropDomEl, backdropScope, 150, function () {
              backdropScopeRef.$destroy();
              backdropScopeRef = null;
            });
            backdropDomEl = undefined;
            backdropScope = undefined;
          }
      }

      function removeAfterAnimate(domEl, scope, emulateTime, done) {
        // Closing animation
        scope.animate = false;

        var transitionEndEventName = $transition.transitionEndEventName;
        if (transitionEndEventName) {
          // transition out
          var timeout = $timeout(afterAnimating, emulateTime);

          domEl.bind(transitionEndEventName, function () {
            $timeout.cancel(timeout);
            afterAnimating();
            scope.$apply();
          });
        } else {
          // Ensure this call is async
          $timeout(afterAnimating, 0);
        }

        function afterAnimating() {
          if (afterAnimating.done) {
            return;
          }
          afterAnimating.done = true;

          domEl.remove();
          if (done) {
            done();
          }
        }
      }

      $document.bind('keydown', function (evt) {
        var modal;

        if (evt.which === 27) {
          modal = openedWindows.top();
          if (modal && modal.value.keyboard) {
            $rootScope.$apply(function () {
              $modalStack.dismiss(modal.key);
            });
          }
        }
      });

      $modalStack.open = function (modalInstance, modal) {

        openedWindows.add(modalInstance, {
          deferred: modal.deferred,
          modalScope: modal.scope,
          backdrop: modal.backdrop,
          keyboard: modal.keyboard
        });

        var body = $document.find('body').eq(0),
            currBackdropIndex = backdropIndex();

        if (currBackdropIndex >= 0 && !backdropDomEl) {
          backdropScope = $rootScope.$new(true);
          backdropScope.index = currBackdropIndex;
          backdropDomEl = $compile('<div modal-backdrop></div>')(backdropScope);
          body.append(backdropDomEl);
        }
          
        var angularDomEl = angular.element('<div modal-window></div>');
        angularDomEl.attr('window-class', modal.windowClass);
        angularDomEl.attr('index', openedWindows.length() - 1);
        angularDomEl.attr('animate', 'animate');
        angularDomEl.html(modal.content);

        var modalDomEl = $compile(angularDomEl)(modal.scope);
        openedWindows.top().value.modalDomEl = modalDomEl;
        body.append(modalDomEl);
        body.addClass(OPENED_MODAL_CLASS);
      };

      $modalStack.close = function (modalInstance, result) {
        var modalWindow = openedWindows.get(modalInstance).value;
        if (modalWindow) {
          modalWindow.deferred.resolve(result);
          removeModalWindow(modalInstance);
        }
      };

      $modalStack.dismiss = function (modalInstance, reason) {
        var modalWindow = openedWindows.get(modalInstance).value;
        if (modalWindow) {
          modalWindow.deferred.reject(reason);
          removeModalWindow(modalInstance);
        }
      };

      $modalStack.dismissAll = function (reason) {
        var topModal = this.getTop();
        while (topModal) {
          this.dismiss(topModal.key, reason);
          topModal = this.getTop();
        }
      };

      $modalStack.getTop = function () {
        return openedWindows.top();
      };

      return $modalStack;
    }])

  .provider('$modal', function () {

    var $modalProvider = {
      options: {
        backdrop: true, //can be also false or 'static'
        keyboard: true
      },
      $get: ['$injector', '$rootScope', '$q', '$http', '$templateCache', '$controller', '$modalStack',
        function ($injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack) {

          var $modal = {};

          function getTemplatePromise(options) {
            return options.template ? $q.when(options.template) :
              $http.get(options.templateUrl, {cache: $templateCache}).then(function (result) {
                return result.data;
              });
          }

          function getResolvePromises(resolves) {
            var promisesArr = [];
            angular.forEach(resolves, function (value, key) {
              if (angular.isFunction(value) || angular.isArray(value)) {
                promisesArr.push($q.when($injector.invoke(value)));
              }
            });
            return promisesArr;
          }

          $modal.open = function (modalOptions) {

            var modalResultDeferred = $q.defer();
            var modalOpenedDeferred = $q.defer();

            //prepare an instance of a modal to be injected into controllers and returned to a caller
            var modalInstance = {
              result: modalResultDeferred.promise,
              opened: modalOpenedDeferred.promise,
              close: function (result) {
                $modalStack.close(modalInstance, result);
              },
              dismiss: function (reason) {
                $modalStack.dismiss(modalInstance, reason);
              }
            };

            //merge and clean up options
            modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
            modalOptions.resolve = modalOptions.resolve || {};

            //verify options
            if (!modalOptions.template && !modalOptions.templateUrl) {
              throw new Error('One of template or templateUrl options is required.');
            }

            var templateAndResolvePromise =
              $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));


            templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {

              var modalScope = (modalOptions.scope || $rootScope).$new();
              modalScope.$close = modalInstance.close;
              modalScope.$dismiss = modalInstance.dismiss;

              var ctrlInstance, ctrlLocals = {};
              var resolveIter = 1;

              //controllers
              if (modalOptions.controller) {
                ctrlLocals.$scope = modalScope;
                ctrlLocals.$modalInstance = modalInstance;
                angular.forEach(modalOptions.resolve, function (value, key) {
                  ctrlLocals[key] = tplAndVars[resolveIter++];
                });

                ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
              }

              $modalStack.open(modalInstance, {
                scope: modalScope,
                deferred: modalResultDeferred,
                content: tplAndVars[0],
                backdrop: modalOptions.backdrop,
                keyboard: modalOptions.keyboard,
                windowClass: modalOptions.windowClass
              });

            }, function resolveError(reason) {
              modalResultDeferred.reject(reason);
            });

            templateAndResolvePromise.then(function () {
              modalOpenedDeferred.resolve(true);
            }, function () {
              modalOpenedDeferred.reject(false);
            });

            return modalInstance;
          };

          return $modal;
        }]
    };

    return $modalProvider;
  });

angular.module('ui.bootstrap.pagination', [])

.controller('PaginationController', ['$scope', '$attrs', '$parse', '$interpolate', function ($scope, $attrs, $parse, $interpolate) {
  var self = this,
      setNumPages = $attrs.numPages ? $parse($attrs.numPages).assign : angular.noop;

  this.init = function(defaultItemsPerPage) {
    if ($attrs.itemsPerPage) {
      $scope.$parent.$watch($parse($attrs.itemsPerPage), function(value) {
        self.itemsPerPage = parseInt(value, 10);
        $scope.totalPages = self.calculateTotalPages();
      });
    } else {
      this.itemsPerPage = defaultItemsPerPage;
    }
  };

  this.noPrevious = function() {
    return this.page === 1;
  };
  this.noNext = function() {
    return this.page === $scope.totalPages;
  };

  this.isActive = function(page) {
    return this.page === page;
  };

  this.calculateTotalPages = function() {
    var totalPages = this.itemsPerPage < 1 ? 1 : Math.ceil($scope.totalItems / this.itemsPerPage);
    return Math.max(totalPages || 0, 1);
  };

  this.getAttributeValue = function(attribute, defaultValue, interpolate) {
    return angular.isDefined(attribute) ? (interpolate ? $interpolate(attribute)($scope.$parent) : $scope.$parent.$eval(attribute)) : defaultValue;
  };

  this.render = function() {
    this.page = parseInt($scope.page, 10) || 1;
    if (this.page > 0 && this.page <= $scope.totalPages) {
      $scope.pages = this.getPages(this.page, $scope.totalPages);
    }
  };

  $scope.selectPage = function(page) {
    if ( ! self.isActive(page) && page > 0 && page <= $scope.totalPages) {
      $scope.page = page;
      $scope.onSelectPage({ page: page });
    }
  };

  $scope.$watch('page', function() {
    self.render();
  });

  $scope.$watch('totalItems', function() {
    $scope.totalPages = self.calculateTotalPages();
  });

  $scope.$watch('totalPages', function(value) {
    setNumPages($scope.$parent, value); // Readonly variable

    if ( self.page > value ) {
      $scope.selectPage(value);
    } else {
      self.render();
    }
  });
}])

.constant('paginationConfig', {
  itemsPerPage: 10,
  boundaryLinks: false,
  directionLinks: true,
  firstText: 'First',
  previousText: 'Previous',
  nextText: 'Next',
  lastText: 'Last',
  rotate: true
})

.directive('pagination', ['$parse', 'paginationConfig', function($parse, config) {
  return {
    restrict: 'EA',
    scope: {
      page: '=',
      totalItems: '=',
      onSelectPage:' &'
    },
    controller: 'PaginationController',
    templateUrl: 'template/pagination/pagination.html',
    replace: true,
    link: function(scope, element, attrs, paginationCtrl) {

      // Setup configuration parameters
      var maxSize,
      boundaryLinks  = paginationCtrl.getAttributeValue(attrs.boundaryLinks,  config.boundaryLinks      ),
      directionLinks = paginationCtrl.getAttributeValue(attrs.directionLinks, config.directionLinks     ),
      firstText      = paginationCtrl.getAttributeValue(attrs.firstText,      config.firstText,     true),
      previousText   = paginationCtrl.getAttributeValue(attrs.previousText,   config.previousText,  true),
      nextText       = paginationCtrl.getAttributeValue(attrs.nextText,       config.nextText,      true),
      lastText       = paginationCtrl.getAttributeValue(attrs.lastText,       config.lastText,      true),
      rotate         = paginationCtrl.getAttributeValue(attrs.rotate,         config.rotate);

      paginationCtrl.init(config.itemsPerPage);

      if (attrs.maxSize) {
        scope.$parent.$watch($parse(attrs.maxSize), function(value) {
          maxSize = parseInt(value, 10);
          paginationCtrl.render();
        });
      }

      // Create page object used in template
      function makePage(number, text, isActive, isDisabled) {
        return {
          number: number,
          text: text,
          active: isActive,
          disabled: isDisabled
        };
      }

      paginationCtrl.getPages = function(currentPage, totalPages) {
        var pages = [];

        // Default page limits
        var startPage = 1, endPage = totalPages;
        var isMaxSized = ( angular.isDefined(maxSize) && maxSize < totalPages );

        // recompute if maxSize
        if ( isMaxSized ) {
          if ( rotate ) {
            // Current page is displayed in the middle of the visible ones
            startPage = Math.max(currentPage - Math.floor(maxSize/2), 1);
            endPage   = startPage + maxSize - 1;

            // Adjust if limit is exceeded
            if (endPage > totalPages) {
              endPage   = totalPages;
              startPage = endPage - maxSize + 1;
            }
          } else {
            // Visible pages are paginated with maxSize
            startPage = ((Math.ceil(currentPage / maxSize) - 1) * maxSize) + 1;

            // Adjust last page if limit is exceeded
            endPage = Math.min(startPage + maxSize - 1, totalPages);
          }
        }

        // Add page number links
        for (var number = startPage; number <= endPage; number++) {
          var page = makePage(number, number, paginationCtrl.isActive(number), false);
          pages.push(page);
        }

        // Add links to move between page sets
        if ( isMaxSized && ! rotate ) {
          if ( startPage > 1 ) {
            var previousPageSet = makePage(startPage - 1, '...', false, false);
            pages.unshift(previousPageSet);
          }

          if ( endPage < totalPages ) {
            var nextPageSet = makePage(endPage + 1, '...', false, false);
            pages.push(nextPageSet);
          }
        }

        // Add previous & next links
        if (directionLinks) {
          var previousPage = makePage(currentPage - 1, previousText, false, paginationCtrl.noPrevious());
          pages.unshift(previousPage);

          var nextPage = makePage(currentPage + 1, nextText, false, paginationCtrl.noNext());
          pages.push(nextPage);
        }

        // Add first & last links
        if (boundaryLinks) {
          var firstPage = makePage(1, firstText, false, paginationCtrl.noPrevious());
          pages.unshift(firstPage);

          var lastPage = makePage(totalPages, lastText, false, paginationCtrl.noNext());
          pages.push(lastPage);
        }

        return pages;
      };
    }
  };
}])

.constant('pagerConfig', {
  itemsPerPage: 10,
  previousText: '« Previous',
  nextText: 'Next »',
  align: true
})

.directive('pager', ['pagerConfig', function(config) {
  return {
    restrict: 'EA',
    scope: {
      page: '=',
      totalItems: '=',
      onSelectPage:' &'
    },
    controller: 'PaginationController',
    templateUrl: 'template/pagination/pager.html',
    replace: true,
    link: function(scope, element, attrs, paginationCtrl) {

      // Setup configuration parameters
      var previousText = paginationCtrl.getAttributeValue(attrs.previousText, config.previousText, true),
      nextText         = paginationCtrl.getAttributeValue(attrs.nextText,     config.nextText,     true),
      align            = paginationCtrl.getAttributeValue(attrs.align,        config.align);

      paginationCtrl.init(config.itemsPerPage);

      // Create page object used in template
      function makePage(number, text, isDisabled, isPrevious, isNext) {
        return {
          number: number,
          text: text,
          disabled: isDisabled,
          previous: ( align && isPrevious ),
          next: ( align && isNext )
        };
      }

      paginationCtrl.getPages = function(currentPage) {
        return [
          makePage(currentPage - 1, previousText, paginationCtrl.noPrevious(), true, false),
          makePage(currentPage + 1, nextText, paginationCtrl.noNext(), false, true)
        ];
      };
    }
  };
}]);

/**
 * The following features are still outstanding: animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html tooltips, and selector delegation.
 */
angular.module( 'ui.bootstrap.tooltip', [ 'ui.bootstrap.position', 'ui.bootstrap.bindHtml' ] )

/**
 * The $tooltip service creates tooltip- and popover-like directives as well as
 * houses global options for them.
 */
.provider( '$tooltip', function () {
  // The default options tooltip and popover.
  var defaultOptions = {
    placement: 'top',
    animation: true,
    popupDelay: 0
  };

  // Default hide triggers for each show trigger
  var triggerMap = {
    'mouseenter': 'mouseleave',
    'click': 'click',
    'focus': 'blur'
  };

  // The options specified to the provider globally.
  var globalOptions = {};
  
  /**
   * `options({})` allows global configuration of all tooltips in the
   * application.
   *
   *   var app = angular.module( 'App', ['ui.bootstrap.tooltip'], function( $tooltipProvider ) {
   *     // place tooltips left instead of top by default
   *     $tooltipProvider.options( { placement: 'left' } );
   *   });
   */
	this.options = function( value ) {
		angular.extend( globalOptions, value );
	};

  /**
   * This allows you to extend the set of trigger mappings available. E.g.:
   *
   *   $tooltipProvider.setTriggers( 'openTrigger': 'closeTrigger' );
   */
  this.setTriggers = function setTriggers ( triggers ) {
    angular.extend( triggerMap, triggers );
  };

  /**
   * This is a helper function for translating camel-case to snake-case.
   */
  function snake_case(name){
    var regexp = /[A-Z]/g;
    var separator = '-';
    return name.replace(regexp, function(letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  }

  /**
   * Returns the actual instance of the $tooltip service.
   * TODO support multiple triggers
   */
  this.$get = [ '$window', '$compile', '$timeout', '$parse', '$document', '$position', '$interpolate', function ( $window, $compile, $timeout, $parse, $document, $position, $interpolate ) {
    return function $tooltip ( type, prefix, defaultTriggerShow ) {
      var options = angular.extend( {}, defaultOptions, globalOptions );

      /**
       * Returns an object of show and hide triggers.
       *
       * If a trigger is supplied,
       * it is used to show the tooltip; otherwise, it will use the `trigger`
       * option passed to the `$tooltipProvider.options` method; else it will
       * default to the trigger supplied to this directive factory.
       *
       * The hide trigger is based on the show trigger. If the `trigger` option
       * was passed to the `$tooltipProvider.options` method, it will use the
       * mapped trigger from `triggerMap` or the passed trigger if the map is
       * undefined; otherwise, it uses the `triggerMap` value of the show
       * trigger; else it will just use the show trigger.
       */
      function getTriggers ( trigger ) {
        var show = trigger || options.trigger || defaultTriggerShow;
        var hide = triggerMap[show] || show;
        return {
          show: show,
          hide: hide
        };
      }

      var directiveName = snake_case( type );

      var startSym = $interpolate.startSymbol();
      var endSym = $interpolate.endSymbol();
      var template = 
        '<div '+ directiveName +'-popup '+
          'title="'+startSym+'tt_title'+endSym+'" '+
          'content="'+startSym+'tt_content'+endSym+'" '+
          'placement="'+startSym+'tt_placement'+endSym+'" '+
          'animation="tt_animation" '+
          'is-open="tt_isOpen"'+
          '>'+
        '</div>';

      return {
        restrict: 'EA',
        scope: true,
        compile: function (tElem, tAttrs) {
          var tooltipLinker = $compile( template );

          return function link ( scope, element, attrs ) {
            var tooltip;
            var transitionTimeout;
            var popupTimeout;
            var appendToBody = angular.isDefined( options.appendToBody ) ? options.appendToBody : false;
            var triggers = getTriggers( undefined );
            var hasRegisteredTriggers = false;
            var hasEnableExp = angular.isDefined(attrs[prefix+'Enable']);

            var positionTooltip = function (){
              var position,
                ttWidth,
                ttHeight,
                ttPosition;
              // Get the position of the directive element.
              position = appendToBody ? $position.offset( element ) : $position.position( element );

              // Get the height and width of the tooltip so we can center it.
              ttWidth = tooltip.prop( 'offsetWidth' );
              ttHeight = tooltip.prop( 'offsetHeight' );

              // Calculate the tooltip's top and left coordinates to center it with
              // this directive.
              switch ( scope.tt_placement ) {
                case 'right':
                  ttPosition = {
                    top: position.top + position.height / 2 - ttHeight / 2,
                    left: position.left + position.width
                  };
                  break;
                case 'bottom':
                  ttPosition = {
                    top: position.top + position.height,
                    left: position.left + position.width / 2 - ttWidth / 2
                  };
                  break;
                case 'left':
                  ttPosition = {
                    top: position.top + position.height / 2 - ttHeight / 2,
                    left: position.left - ttWidth
                  };
                  break;
                default:
                  ttPosition = {
                    top: position.top - ttHeight,
                    left: position.left + position.width / 2 - ttWidth / 2
                  };
                  break;
              }

              ttPosition.top += 'px';
              ttPosition.left += 'px';

              // Now set the calculated positioning.
              tooltip.css( ttPosition );

            };

            // By default, the tooltip is not open.
            // TODO add ability to start tooltip opened
            scope.tt_isOpen = false;

            function toggleTooltipBind () {
              if ( ! scope.tt_isOpen ) {
                showTooltipBind();
              } else {
                hideTooltipBind();
              }
            }

            // Show the tooltip with delay if specified, otherwise show it immediately
            function showTooltipBind() {
              if(hasEnableExp && !scope.$eval(attrs[prefix+'Enable'])) {
                return;
              }
              if ( scope.tt_popupDelay ) {
                popupTimeout = $timeout( show, scope.tt_popupDelay, false );
                popupTimeout.then(function(reposition){reposition();});
              } else {
                show()();
              }
            }

            function hideTooltipBind () {
              scope.$apply(function () {
                hide();
              });
            }

            // Show the tooltip popup element.
            function show() {


              // Don't show empty tooltips.
              if ( ! scope.tt_content ) {
                return angular.noop;
              }

              createTooltip();

              // If there is a pending remove transition, we must cancel it, lest the
              // tooltip be mysteriously removed.
              if ( transitionTimeout ) {
                $timeout.cancel( transitionTimeout );
              }

              // Set the initial positioning.
              tooltip.css({ top: 0, left: 0, display: 'block' });

              // Now we add it to the DOM because need some info about it. But it's not 
              // visible yet anyway.
              if ( appendToBody ) {
                  $document.find( 'body' ).append( tooltip );
              } else {
                element.after( tooltip );
              }

              positionTooltip();

              // And show the tooltip.
              scope.tt_isOpen = true;
              scope.$digest(); // digest required as $apply is not called

              // Return positioning function as promise callback for correct
              // positioning after draw.
              return positionTooltip;
            }

            // Hide the tooltip popup element.
            function hide() {
              // First things first: we don't show it anymore.
              scope.tt_isOpen = false;

              //if tooltip is going to be shown after delay, we must cancel this
              $timeout.cancel( popupTimeout );

              // And now we remove it from the DOM. However, if we have animation, we 
              // need to wait for it to expire beforehand.
              // FIXME: this is a placeholder for a port of the transitions library.
              if ( scope.tt_animation ) {
                transitionTimeout = $timeout(removeTooltip, 500);
              } else {
                removeTooltip();
              }
            }

            function createTooltip() {
              // There can only be one tooltip element per directive shown at once.
              if (tooltip) {
                removeTooltip();
              }
              tooltip = tooltipLinker(scope, function () {});

              // Get contents rendered into the tooltip
              scope.$digest();
            }

            function removeTooltip() {
              if (tooltip) {
                tooltip.remove();
                tooltip = null;
              }
            }

            /**
             * Observe the relevant attributes.
             */
            attrs.$observe( type, function ( val ) {
              scope.tt_content = val;

              if (!val && scope.tt_isOpen ) {
                hide();
              }
            });

            attrs.$observe( prefix+'Title', function ( val ) {
              scope.tt_title = val;
            });

            attrs.$observe( prefix+'Placement', function ( val ) {
              scope.tt_placement = angular.isDefined( val ) ? val : options.placement;
            });

            attrs.$observe( prefix+'PopupDelay', function ( val ) {
              var delay = parseInt( val, 10 );
              scope.tt_popupDelay = ! isNaN(delay) ? delay : options.popupDelay;
            });

            var unregisterTriggers = function() {
              if (hasRegisteredTriggers) {
                element.unbind( triggers.show, showTooltipBind );
                element.unbind( triggers.hide, hideTooltipBind );
              }
            };

            attrs.$observe( prefix+'Trigger', function ( val ) {
              unregisterTriggers();

              triggers = getTriggers( val );

              if ( triggers.show === triggers.hide ) {
                element.bind( triggers.show, toggleTooltipBind );
              } else {
                element.bind( triggers.show, showTooltipBind );
                element.bind( triggers.hide, hideTooltipBind );
              }

              hasRegisteredTriggers = true;
            });

            var animation = scope.$eval(attrs[prefix + 'Animation']);
            scope.tt_animation = angular.isDefined(animation) ? !!animation : options.animation;

            attrs.$observe( prefix+'AppendToBody', function ( val ) {
              appendToBody = angular.isDefined( val ) ? $parse( val )( scope ) : appendToBody;
            });

            // if a tooltip is attached to <body> we need to remove it on
            // location change as its parent scope will probably not be destroyed
            // by the change.
            if ( appendToBody ) {
              scope.$on('$locationChangeSuccess', function closeTooltipOnLocationChangeSuccess () {
              if ( scope.tt_isOpen ) {
                hide();
              }
            });
            }

            // Make sure tooltip is destroyed and removed.
            scope.$on('$destroy', function onDestroyTooltip() {
              $timeout.cancel( transitionTimeout );
              $timeout.cancel( popupTimeout );
              unregisterTriggers();
              removeTooltip();
            });
          };
        }
      };
    };
  }];
})

.directive( 'tooltipPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'template/tooltip/tooltip-popup.html'
  };
})

.directive( 'tooltip', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'tooltip', 'tooltip', 'mouseenter' );
}])

.directive( 'tooltipHtmlUnsafePopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'template/tooltip/tooltip-html-unsafe-popup.html'
  };
})

.directive( 'tooltipHtmlUnsafe', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'tooltipHtmlUnsafe', 'tooltip', 'mouseenter' );
}]);

/**
 * The following features are still outstanding: popup delay, animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html popovers, and selector delegatation.
 */
angular.module( 'ui.bootstrap.popover', [ 'ui.bootstrap.tooltip' ] )

.directive( 'popoverPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'template/popover/popover.html'
  };
})

.directive( 'popover', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'popover', 'popover', 'click' );
}]);

angular.module('ui.bootstrap.progressbar', ['ui.bootstrap.transition'])

.constant('progressConfig', {
  animate: true,
  max: 100
})

.controller('ProgressController', ['$scope', '$attrs', 'progressConfig', '$transition', function($scope, $attrs, progressConfig, $transition) {
    var self = this,
        bars = [],
        max = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : progressConfig.max,
        animate = angular.isDefined($attrs.animate) ? $scope.$parent.$eval($attrs.animate) : progressConfig.animate;

    this.addBar = function(bar, element) {
        var oldValue = 0, index = bar.$parent.$index;
        if ( angular.isDefined(index) &&  bars[index] ) {
            oldValue = bars[index].value;
        }
        bars.push(bar);

        this.update(element, bar.value, oldValue);

        bar.$watch('value', function(value, oldValue) {
            if (value !== oldValue) {
                self.update(element, value, oldValue);
            }
        });

        bar.$on('$destroy', function() {
            self.removeBar(bar);
        });
    };

    // Update bar element width
    this.update = function(element, newValue, oldValue) {
        var percent = this.getPercentage(newValue);

        if (animate) {
            element.css('width', this.getPercentage(oldValue) + '%');
            $transition(element, {width: percent + '%'});
        } else {
            element.css({'transition': 'none', 'width': percent + '%'});
        }
    };

    this.removeBar = function(bar) {
        bars.splice(bars.indexOf(bar), 1);
    };

    this.getPercentage = function(value) {
        return Math.round(100 * value / max);
    };
}])

.directive('progress', function() {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        controller: 'ProgressController',
        require: 'progress',
        scope: {},
        template: '<div class="progress" ng-transclude></div>'
        //templateUrl: 'template/progressbar/progress.html' // Works in AngularJS 1.2
    };
})

.directive('bar', function() {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        require: '^progress',
        scope: {
            value: '=',
            type: '@'
        },
        templateUrl: 'template/progressbar/bar.html',
        link: function(scope, element, attrs, progressCtrl) {
            progressCtrl.addBar(scope, element);
        }
    };
})

.directive('progressbar', function() {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        controller: 'ProgressController',
        scope: {
            value: '=',
            type: '@'
        },
        templateUrl: 'template/progressbar/progressbar.html',
        link: function(scope, element, attrs, progressCtrl) {
            progressCtrl.addBar(scope, angular.element(element.children()[0]));
        }
    };
});
angular.module('ui.bootstrap.rating', [])

.constant('ratingConfig', {
  max: 5,
  stateOn: null,
  stateOff: null
})

.controller('RatingController', ['$scope', '$attrs', '$parse', 'ratingConfig', function($scope, $attrs, $parse, ratingConfig) {

  this.maxRange = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : ratingConfig.max;
  this.stateOn = angular.isDefined($attrs.stateOn) ? $scope.$parent.$eval($attrs.stateOn) : ratingConfig.stateOn;
  this.stateOff = angular.isDefined($attrs.stateOff) ? $scope.$parent.$eval($attrs.stateOff) : ratingConfig.stateOff;

  this.createRateObjects = function(states) {
    var defaultOptions = {
      stateOn: this.stateOn,
      stateOff: this.stateOff
    };

    for (var i = 0, n = states.length; i < n; i++) {
      states[i] = angular.extend({ index: i }, defaultOptions, states[i]);
    }
    return states;
  };

  // Get objects used in template
  $scope.range = angular.isDefined($attrs.ratingStates) ?  this.createRateObjects(angular.copy($scope.$parent.$eval($attrs.ratingStates))): this.createRateObjects(new Array(this.maxRange));

  $scope.rate = function(value) {
    if ( $scope.value !== value && !$scope.readonly ) {
      $scope.value = value;
    }
  };

  $scope.enter = function(value) {
    if ( ! $scope.readonly ) {
      $scope.val = value;
    }
    $scope.onHover({value: value});
  };

  $scope.reset = function() {
    $scope.val = angular.copy($scope.value);
    $scope.onLeave();
  };

  $scope.$watch('value', function(value) {
    $scope.val = value;
  });

  $scope.readonly = false;
  if ($attrs.readonly) {
    $scope.$parent.$watch($parse($attrs.readonly), function(value) {
      $scope.readonly = !!value;
    });
  }
}])

.directive('rating', function() {
  return {
    restrict: 'EA',
    scope: {
      value: '=',
      onHover: '&',
      onLeave: '&'
    },
    controller: 'RatingController',
    templateUrl: 'template/rating/rating.html',
    replace: true
  };
});

/**
 * @ngdoc overview
 * @name ui.bootstrap.tabs
 *
 * @description
 * AngularJS version of the tabs directive.
 */

angular.module('ui.bootstrap.tabs', [])

.controller('TabsetController', ['$scope', function TabsetCtrl($scope) {
  var ctrl = this,
      tabs = ctrl.tabs = $scope.tabs = [];

  ctrl.select = function(tab) {
    angular.forEach(tabs, function(tab) {
      tab.active = false;
    });
    tab.active = true;
  };

  ctrl.addTab = function addTab(tab) {
    tabs.push(tab);
    if (tabs.length === 1 || tab.active) {
      ctrl.select(tab);
    }
  };

  ctrl.removeTab = function removeTab(tab) {
    var index = tabs.indexOf(tab);
    //Select a new tab if the tab to be removed is selected
    if (tab.active && tabs.length > 1) {
      //If this is the last tab, select the previous tab. else, the next tab.
      var newActiveIndex = index == tabs.length - 1 ? index - 1 : index + 1;
      ctrl.select(tabs[newActiveIndex]);
    }
    tabs.splice(index, 1);
  };
}])

/**
 * @ngdoc directive
 * @name ui.bootstrap.tabs.directive:tabset
 * @restrict EA
 *
 * @description
 * Tabset is the outer container for the tabs directive
 *
 * @param {boolean=} vertical Whether or not to use vertical styling for the tabs.
 * @param {boolean=} justified Whether or not to use justified styling for the tabs.
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
    <tabset>
      <tab heading="Tab 1"><b>First</b> Content!</tab>
      <tab heading="Tab 2"><i>Second</i> Content!</tab>
    </tabset>
    <hr />
    <tabset vertical="true">
      <tab heading="Vertical Tab 1"><b>First</b> Vertical Content!</tab>
      <tab heading="Vertical Tab 2"><i>Second</i> Vertical Content!</tab>
    </tabset>
    <tabset justified="true">
      <tab heading="Justified Tab 1"><b>First</b> Justified Content!</tab>
      <tab heading="Justified Tab 2"><i>Second</i> Justified Content!</tab>
    </tabset>
  </file>
</example>
 */
.directive('tabset', function() {
  return {
    restrict: 'EA',
    transclude: true,
    replace: true,
    scope: {},
    controller: 'TabsetController',
    templateUrl: 'template/tabs/tabset.html',
    link: function(scope, element, attrs) {
      scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
      scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
      scope.type = angular.isDefined(attrs.type) ? scope.$parent.$eval(attrs.type) : 'tabs';
    }
  };
})

/**
 * @ngdoc directive
 * @name ui.bootstrap.tabs.directive:tab
 * @restrict EA
 *
 * @param {string=} heading The visible heading, or title, of the tab. Set HTML headings with {@link ui.bootstrap.tabs.directive:tabHeading tabHeading}.
 * @param {string=} select An expression to evaluate when the tab is selected.
 * @param {boolean=} active A binding, telling whether or not this tab is selected.
 * @param {boolean=} disabled A binding, telling whether or not this tab is disabled.
 *
 * @description
 * Creates a tab with a heading and content. Must be placed within a {@link ui.bootstrap.tabs.directive:tabset tabset}.
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
    <div ng-controller="TabsDemoCtrl">
      <button class="btn btn-small" ng-click="items[0].active = true">
        Select item 1, using active binding
      </button>
      <button class="btn btn-small" ng-click="items[1].disabled = !items[1].disabled">
        Enable/disable item 2, using disabled binding
      </button>
      <br />
      <tabset>
        <tab heading="Tab 1">First Tab</tab>
        <tab select="alertMe()">
          <tab-heading><i class="icon-bell"></i> Alert me!</tab-heading>
          Second Tab, with alert callback and html heading!
        </tab>
        <tab ng-repeat="item in items"
          heading="{{item.title}}"
          disabled="item.disabled"
          active="item.active">
          {{item.content}}
        </tab>
      </tabset>
    </div>
  </file>
  <file name="script.js">
    function TabsDemoCtrl($scope) {
      $scope.items = [
        { title:"Dynamic Title 1", content:"Dynamic Item 0" },
        { title:"Dynamic Title 2", content:"Dynamic Item 1", disabled: true }
      ];

      $scope.alertMe = function() {
        setTimeout(function() {
          alert("You've selected the alert tab!");
        });
      };
    };
  </file>
</example>
 */

/**
 * @ngdoc directive
 * @name ui.bootstrap.tabs.directive:tabHeading
 * @restrict EA
 *
 * @description
 * Creates an HTML heading for a {@link ui.bootstrap.tabs.directive:tab tab}. Must be placed as a child of a tab element.
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
    <tabset>
      <tab>
        <tab-heading><b>HTML</b> in my titles?!</tab-heading>
        And some content, too!
      </tab>
      <tab>
        <tab-heading><i class="icon-heart"></i> Icon heading?!?</tab-heading>
        That's right.
      </tab>
    </tabset>
  </file>
</example>
 */
.directive('tab', ['$parse', function($parse) {
  return {
    require: '^tabset',
    restrict: 'EA',
    replace: true,
    templateUrl: 'template/tabs/tab.html',
    transclude: true,
    scope: {
      heading: '@',
      onSelect: '&select', //This callback is called in contentHeadingTransclude
                          //once it inserts the tab's content into the dom
      onDeselect: '&deselect'
    },
    controller: function() {
      //Empty controller so other directives can require being 'under' a tab
    },
    compile: function(elm, attrs, transclude) {
      return function postLink(scope, elm, attrs, tabsetCtrl) {
        var getActive, setActive;
        if (attrs.active) {
          getActive = $parse(attrs.active);
          setActive = getActive.assign;
          scope.$parent.$watch(getActive, function updateActive(value, oldVal) {
            // Avoid re-initializing scope.active as it is already initialized
            // below. (watcher is called async during init with value ===
            // oldVal)
            if (value !== oldVal) {
              scope.active = !!value;
            }
          });
          scope.active = getActive(scope.$parent);
        } else {
          setActive = getActive = angular.noop;
        }

        scope.$watch('active', function(active) {
          // Note this watcher also initializes and assigns scope.active to the
          // attrs.active expression.
          setActive(scope.$parent, active);
          if (active) {
            tabsetCtrl.select(scope);
            scope.onSelect();
          } else {
            scope.onDeselect();
          }
        });

        scope.disabled = false;
        if ( attrs.disabled ) {
          scope.$parent.$watch($parse(attrs.disabled), function(value) {
            scope.disabled = !! value;
          });
        }

        scope.select = function() {
          if ( ! scope.disabled ) {
            scope.active = true;
          }
        };

        tabsetCtrl.addTab(scope);
        scope.$on('$destroy', function() {
          tabsetCtrl.removeTab(scope);
        });


        //We need to transclude later, once the content container is ready.
        //when this link happens, we're inside a tab heading.
        scope.$transcludeFn = transclude;
      };
    }
  };
}])

.directive('tabHeadingTransclude', [function() {
  return {
    restrict: 'A',
    require: '^tab',
    link: function(scope, elm, attrs, tabCtrl) {
      scope.$watch('headingElement', function updateHeadingElement(heading) {
        if (heading) {
          elm.html('');
          elm.append(heading);
        }
      });
    }
  };
}])

.directive('tabContentTransclude', function() {
  return {
    restrict: 'A',
    require: '^tabset',
    link: function(scope, elm, attrs) {
      var tab = scope.$eval(attrs.tabContentTransclude);

      //Now our tab is ready to be transcluded: both the tab heading area
      //and the tab content area are loaded.  Transclude 'em both.
      tab.$transcludeFn(tab.$parent, function(contents) {
        angular.forEach(contents, function(node) {
          if (isTabHeading(node)) {
            //Let tabHeadingTransclude know.
            tab.headingElement = node;
          } else {
            elm.append(node);
          }
        });
      });
    }
  };
  function isTabHeading(node) {
    return node.tagName &&  (
      node.hasAttribute('tab-heading') ||
      node.hasAttribute('data-tab-heading') ||
      node.tagName.toLowerCase() === 'tab-heading' ||
      node.tagName.toLowerCase() === 'data-tab-heading'
    );
  }
})

;

angular.module('ui.bootstrap.timepicker', [])

.constant('timepickerConfig', {
  hourStep: 1,
  minuteStep: 1,
  showMeridian: true,
  meridians: null,
  readonlyInput: false,
  mousewheel: true
})

.directive('timepicker', ['$parse', '$log', 'timepickerConfig', '$locale', function ($parse, $log, timepickerConfig, $locale) {
  return {
    restrict: 'EA',
    require:'?^ngModel',
    replace: true,
    scope: {},
    templateUrl: 'template/timepicker/timepicker.html',
    link: function(scope, element, attrs, ngModel) {
      if ( !ngModel ) {
        return; // do nothing if no ng-model
      }

      var selected = new Date(),
          meridians = angular.isDefined(attrs.meridians) ? scope.$parent.$eval(attrs.meridians) : timepickerConfig.meridians || $locale.DATETIME_FORMATS.AMPMS;

      var hourStep = timepickerConfig.hourStep;
      if (attrs.hourStep) {
        scope.$parent.$watch($parse(attrs.hourStep), function(value) {
          hourStep = parseInt(value, 10);
        });
      }

      var minuteStep = timepickerConfig.minuteStep;
      if (attrs.minuteStep) {
        scope.$parent.$watch($parse(attrs.minuteStep), function(value) {
          minuteStep = parseInt(value, 10);
        });
      }

      // 12H / 24H mode
      scope.showMeridian = timepickerConfig.showMeridian;
      if (attrs.showMeridian) {
        scope.$parent.$watch($parse(attrs.showMeridian), function(value) {
          scope.showMeridian = !!value;

          if ( ngModel.$error.time ) {
            // Evaluate from template
            var hours = getHoursFromTemplate(), minutes = getMinutesFromTemplate();
            if (angular.isDefined( hours ) && angular.isDefined( minutes )) {
              selected.setHours( hours );
              refresh();
            }
          } else {
            updateTemplate();
          }
        });
      }

      // Get scope.hours in 24H mode if valid
      function getHoursFromTemplate ( ) {
        var hours = parseInt( scope.hours, 10 );
        var valid = ( scope.showMeridian ) ? (hours > 0 && hours < 13) : (hours >= 0 && hours < 24);
        if ( !valid ) {
          return undefined;
        }

        if ( scope.showMeridian ) {
          if ( hours === 12 ) {
            hours = 0;
          }
          if ( scope.meridian === meridians[1] ) {
            hours = hours + 12;
          }
        }
        return hours;
      }

      function getMinutesFromTemplate() {
        var minutes = parseInt(scope.minutes, 10);
        return ( minutes >= 0 && minutes < 60 ) ? minutes : undefined;
      }

      function pad( value ) {
        return ( angular.isDefined(value) && value.toString().length < 2 ) ? '0' + value : value;
      }

      // Input elements
      var inputs = element.find('input'), hoursInputEl = inputs.eq(0), minutesInputEl = inputs.eq(1);

      // Respond on mousewheel spin
      var mousewheel = (angular.isDefined(attrs.mousewheel)) ? scope.$eval(attrs.mousewheel) : timepickerConfig.mousewheel;
      if ( mousewheel ) {

        var isScrollingUp = function(e) {
          if (e.originalEvent) {
            e = e.originalEvent;
          }
          //pick correct delta variable depending on event
          var delta = (e.wheelDelta) ? e.wheelDelta : -e.deltaY;
          return (e.detail || delta > 0);
        };

        hoursInputEl.bind('mousewheel wheel', function(e) {
          scope.$apply( (isScrollingUp(e)) ? scope.incrementHours() : scope.decrementHours() );
          e.preventDefault();
        });

        minutesInputEl.bind('mousewheel wheel', function(e) {
          scope.$apply( (isScrollingUp(e)) ? scope.incrementMinutes() : scope.decrementMinutes() );
          e.preventDefault();
        });
      }

      scope.readonlyInput = (angular.isDefined(attrs.readonlyInput)) ? scope.$eval(attrs.readonlyInput) : timepickerConfig.readonlyInput;
      if ( ! scope.readonlyInput ) {

        var invalidate = function(invalidHours, invalidMinutes) {
          ngModel.$setViewValue( null );
          ngModel.$setValidity('time', false);
          if (angular.isDefined(invalidHours)) {
            scope.invalidHours = invalidHours;
          }
          if (angular.isDefined(invalidMinutes)) {
            scope.invalidMinutes = invalidMinutes;
          }
        };

        scope.updateHours = function() {
          var hours = getHoursFromTemplate();

          if ( angular.isDefined(hours) ) {
            selected.setHours( hours );
            refresh( 'h' );
          } else {
            invalidate(true);
          }
        };

        hoursInputEl.bind('blur', function(e) {
          if ( !scope.validHours && scope.hours < 10) {
            scope.$apply( function() {
              scope.hours = pad( scope.hours );
            });
          }
        });

        scope.updateMinutes = function() {
          var minutes = getMinutesFromTemplate();

          if ( angular.isDefined(minutes) ) {
            selected.setMinutes( minutes );
            refresh( 'm' );
          } else {
            invalidate(undefined, true);
          }
        };

        minutesInputEl.bind('blur', function(e) {
          if ( !scope.invalidMinutes && scope.minutes < 10 ) {
            scope.$apply( function() {
              scope.minutes = pad( scope.minutes );
            });
          }
        });
      } else {
        scope.updateHours = angular.noop;
        scope.updateMinutes = angular.noop;
      }

      ngModel.$render = function() {
        var date = ngModel.$modelValue ? new Date( ngModel.$modelValue ) : null;

        if ( isNaN(date) ) {
          ngModel.$setValidity('time', false);
          $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
        } else {
          if ( date ) {
            selected = date;
          }
          makeValid();
          updateTemplate();
        }
      };

      // Call internally when we know that model is valid.
      function refresh( keyboardChange ) {
        makeValid();
        ngModel.$setViewValue( new Date(selected) );
        updateTemplate( keyboardChange );
      }

      function makeValid() {
        ngModel.$setValidity('time', true);
        scope.invalidHours = false;
        scope.invalidMinutes = false;
      }

      function updateTemplate( keyboardChange ) {
        var hours = selected.getHours(), minutes = selected.getMinutes();

        if ( scope.showMeridian ) {
          hours = ( hours === 0 || hours === 12 ) ? 12 : hours % 12; // Convert 24 to 12 hour system
        }
        scope.hours =  keyboardChange === 'h' ? hours : pad(hours);
        scope.minutes = keyboardChange === 'm' ? minutes : pad(minutes);
        scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];
      }

      function addMinutes( minutes ) {
        var dt = new Date( selected.getTime() + minutes * 60000 );
        selected.setHours( dt.getHours(), dt.getMinutes() );
        refresh();
      }

      scope.incrementHours = function() {
        addMinutes( hourStep * 60 );
      };
      scope.decrementHours = function() {
        addMinutes( - hourStep * 60 );
      };
      scope.incrementMinutes = function() {
        addMinutes( minuteStep );
      };
      scope.decrementMinutes = function() {
        addMinutes( - minuteStep );
      };
      scope.toggleMeridian = function() {
        addMinutes( 12 * 60 * (( selected.getHours() < 12 ) ? 1 : -1) );
      };
    }
  };
}]);

angular.module('ui.bootstrap.typeahead', ['ui.bootstrap.position', 'ui.bootstrap.bindHtml'])

/**
 * A helper service that can parse typeahead's syntax (string provided by users)
 * Extracted to a separate service for ease of unit testing
 */
  .factory('typeaheadParser', ['$parse', function ($parse) {

  //                      00000111000000000000022200000000000000003333333333333330000000000044000
  var TYPEAHEAD_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;

  return {
    parse:function (input) {

      var match = input.match(TYPEAHEAD_REGEXP), modelMapper, viewMapper, source;
      if (!match) {
        throw new Error(
          "Expected typeahead specification in form of '_modelValue_ (as _label_)? for _item_ in _collection_'" +
            " but got '" + input + "'.");
      }

      return {
        itemName:match[3],
        source:$parse(match[4]),
        viewMapper:$parse(match[2] || match[1]),
        modelMapper:$parse(match[1])
      };
    }
  };
}])

  .directive('typeahead', ['$compile', '$parse', '$q', '$timeout', '$document', '$position', 'typeaheadParser',
    function ($compile, $parse, $q, $timeout, $document, $position, typeaheadParser) {

  var HOT_KEYS = [9, 13, 27, 38, 40];

  return {
    require:'ngModel',
    link:function (originalScope, element, attrs, modelCtrl) {

      //SUPPORTED ATTRIBUTES (OPTIONS)

      //minimal no of characters that needs to be entered before typeahead kicks-in
      var minSearch = originalScope.$eval(attrs.typeaheadMinLength) || 1;

      //minimal wait time after last character typed before typehead kicks-in
      var waitTime = originalScope.$eval(attrs.typeaheadWaitMs) || 0;

      //should it restrict model values to the ones selected from the popup only?
      var isEditable = originalScope.$eval(attrs.typeaheadEditable) !== false;

      //binding to a variable that indicates if matches are being retrieved asynchronously
      var isLoadingSetter = $parse(attrs.typeaheadLoading).assign || angular.noop;

      //a callback executed when a match is selected
      var onSelectCallback = $parse(attrs.typeaheadOnSelect);

      var inputFormatter = attrs.typeaheadInputFormatter ? $parse(attrs.typeaheadInputFormatter) : undefined;

      var appendToBody =  attrs.typeaheadAppendToBody ? $parse(attrs.typeaheadAppendToBody) : false;

      //INTERNAL VARIABLES

      //model setter executed upon match selection
      var $setModelValue = $parse(attrs.ngModel).assign;

      //expressions used by typeahead
      var parserResult = typeaheadParser.parse(attrs.typeahead);

      var hasFocus;

      //pop-up element used to display matches
      var popUpEl = angular.element('<div typeahead-popup></div>');
      popUpEl.attr({
        matches: 'matches',
        active: 'activeIdx',
        select: 'select(activeIdx)',
        query: 'query',
        position: 'position'
      });
      //custom item template
      if (angular.isDefined(attrs.typeaheadTemplateUrl)) {
        popUpEl.attr('template-url', attrs.typeaheadTemplateUrl);
      }

      //create a child scope for the typeahead directive so we are not polluting original scope
      //with typeahead-specific data (matches, query etc.)
      var scope = originalScope.$new();
      originalScope.$on('$destroy', function(){
        scope.$destroy();
      });

      var resetMatches = function() {
        scope.matches = [];
        scope.activeIdx = -1;
      };

      var getMatchesAsync = function(inputValue) {

        var locals = {$viewValue: inputValue};
        isLoadingSetter(originalScope, true);
        $q.when(parserResult.source(originalScope, locals)).then(function(matches) {

          //it might happen that several async queries were in progress if a user were typing fast
          //but we are interested only in responses that correspond to the current view value
          if (inputValue === modelCtrl.$viewValue && hasFocus) {
            if (matches.length > 0) {

              scope.activeIdx = 0;
              scope.matches.length = 0;

              //transform labels
              for(var i=0; i<matches.length; i++) {
                locals[parserResult.itemName] = matches[i];
                scope.matches.push({
                  label: parserResult.viewMapper(scope, locals),
                  model: matches[i]
                });
              }

              scope.query = inputValue;
              //position pop-up with matches - we need to re-calculate its position each time we are opening a window
              //with matches as a pop-up might be absolute-positioned and position of an input might have changed on a page
              //due to other elements being rendered
              scope.position = appendToBody ? $position.offset(element) : $position.position(element);
              scope.position.top = scope.position.top + element.prop('offsetHeight');

            } else {
              resetMatches();
            }
            isLoadingSetter(originalScope, false);
          }
        }, function(){
          resetMatches();
          isLoadingSetter(originalScope, false);
        });
      };

      resetMatches();

      //we need to propagate user's query so we can higlight matches
      scope.query = undefined;

      //Declare the timeout promise var outside the function scope so that stacked calls can be cancelled later 
      var timeoutPromise;

      //plug into $parsers pipeline to open a typeahead on view changes initiated from DOM
      //$parsers kick-in on all the changes coming from the view as well as manually triggered by $setViewValue
      modelCtrl.$parsers.unshift(function (inputValue) {

        hasFocus = true;

        if (inputValue && inputValue.length >= minSearch) {
          if (waitTime > 0) {
            if (timeoutPromise) {
              $timeout.cancel(timeoutPromise);//cancel previous timeout
            }
            timeoutPromise = $timeout(function () {
              getMatchesAsync(inputValue);
            }, waitTime);
          } else {
            getMatchesAsync(inputValue);
          }
        } else {
          isLoadingSetter(originalScope, false);
          resetMatches();
        }

        if (isEditable) {
          return inputValue;
        } else {
          if (!inputValue) {
            // Reset in case user had typed something previously.
            modelCtrl.$setValidity('editable', true);
            return inputValue;
          } else {
            modelCtrl.$setValidity('editable', false);
            return undefined;
          }
        }
      });

      modelCtrl.$formatters.push(function (modelValue) {

        var candidateViewValue, emptyViewValue;
        var locals = {};

        if (inputFormatter) {

          locals['$model'] = modelValue;
          return inputFormatter(originalScope, locals);

        } else {

          //it might happen that we don't have enough info to properly render input value
          //we need to check for this situation and simply return model value if we can't apply custom formatting
          locals[parserResult.itemName] = modelValue;
          candidateViewValue = parserResult.viewMapper(originalScope, locals);
          locals[parserResult.itemName] = undefined;
          emptyViewValue = parserResult.viewMapper(originalScope, locals);

          return candidateViewValue!== emptyViewValue ? candidateViewValue : modelValue;
        }
      });

      scope.select = function (activeIdx) {
        //called from within the $digest() cycle
        var locals = {};
        var model, item;

        locals[parserResult.itemName] = item = scope.matches[activeIdx].model;
        model = parserResult.modelMapper(originalScope, locals);
        $setModelValue(originalScope, model);
        modelCtrl.$setValidity('editable', true);

        onSelectCallback(originalScope, {
          $item: item,
          $model: model,
          $label: parserResult.viewMapper(originalScope, locals)
        });

        resetMatches();

        //return focus to the input element if a mach was selected via a mouse click event
        element[0].focus();
      };

      //bind keyboard events: arrows up(38) / down(40), enter(13) and tab(9), esc(27)
      element.bind('keydown', function (evt) {

        //typeahead is open and an "interesting" key was pressed
        if (scope.matches.length === 0 || HOT_KEYS.indexOf(evt.which) === -1) {
          return;
        }

        evt.preventDefault();

        if (evt.which === 40) {
          scope.activeIdx = (scope.activeIdx + 1) % scope.matches.length;
          scope.$digest();

        } else if (evt.which === 38) {
          scope.activeIdx = (scope.activeIdx ? scope.activeIdx : scope.matches.length) - 1;
          scope.$digest();

        } else if (evt.which === 13 || evt.which === 9) {
          scope.$apply(function () {
            scope.select(scope.activeIdx);
          });

        } else if (evt.which === 27) {
          evt.stopPropagation();

          resetMatches();
          scope.$digest();
        }
      });

      element.bind('blur', function (evt) {
        hasFocus = false;
      });

      // Keep reference to click handler to unbind it.
      var dismissClickHandler = function (evt) {
        if (element[0] !== evt.target) {
          resetMatches();
          scope.$digest();
        }
      };

      $document.bind('click', dismissClickHandler);

      originalScope.$on('$destroy', function(){
        $document.unbind('click', dismissClickHandler);
      });

      var $popup = $compile(popUpEl)(scope);
      if ( appendToBody ) {
        $document.find('body').append($popup);
      } else {
        element.after($popup);
      }
    }
  };

}])

  .directive('typeaheadPopup', function () {
    return {
      restrict:'EA',
      scope:{
        matches:'=',
        query:'=',
        active:'=',
        position:'=',
        select:'&'
      },
      replace:true,
      templateUrl:'template/typeahead/typeahead-popup.html',
      link:function (scope, element, attrs) {

        scope.templateUrl = attrs.templateUrl;

        scope.isOpen = function () {
          return scope.matches.length > 0;
        };

        scope.isActive = function (matchIdx) {
          return scope.active == matchIdx;
        };

        scope.selectActive = function (matchIdx) {
          scope.active = matchIdx;
        };

        scope.selectMatch = function (activeIdx) {
          scope.select({activeIdx:activeIdx});
        };
      }
    };
  })

  .directive('typeaheadMatch', ['$http', '$templateCache', '$compile', '$parse', function ($http, $templateCache, $compile, $parse) {
    return {
      restrict:'EA',
      scope:{
        index:'=',
        match:'=',
        query:'='
      },
      link:function (scope, element, attrs) {
        var tplUrl = $parse(attrs.templateUrl)(scope.$parent) || 'template/typeahead/typeahead-match.html';
        $http.get(tplUrl, {cache: $templateCache}).success(function(tplContent){
           element.replaceWith($compile(tplContent.trim())(scope));
        });
      }
    };
  }])

  .filter('typeaheadHighlight', function() {

    function escapeRegexp(queryToEscape) {
      return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    }

    return function(matchItem, query) {
      return query ? matchItem.replace(new RegExp(escapeRegexp(query), 'gi'), '<strong>$&</strong>') : matchItem;
    };
  });
angular.module("template/accordion/accordion-group.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/accordion/accordion-group.html",
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h4 class=\"panel-title\">\n" +
    "      <a class=\"accordion-toggle\" ng-click=\"isOpen = !isOpen\" accordion-transclude=\"heading\">{{heading}}</a>\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <div class=\"panel-collapse\" collapse=\"!isOpen\">\n" +
    "	  <div class=\"panel-body\" ng-transclude></div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("template/accordion/accordion.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/accordion/accordion.html",
    "<div class=\"panel-group\" ng-transclude></div>");
}]);

angular.module("template/alert/alert.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/alert/alert.html",
    "<div class='alert' ng-class='\"alert-\" + (type || \"warning\")'>\n" +
    "    <button ng-show='closeable' type='button' class='close' ng-click='close()'>&times;</button>\n" +
    "    <div ng-transclude></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/carousel/carousel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/carousel/carousel.html",
    "<div ng-mouseenter=\"pause()\" ng-mouseleave=\"play()\" class=\"carousel\">\n" +
    "    <ol class=\"carousel-indicators\" ng-show=\"slides().length > 1\">\n" +
    "        <li ng-repeat=\"slide in slides()\" ng-class=\"{active: isActive(slide)}\" ng-click=\"select(slide)\"></li>\n" +
    "    </ol>\n" +
    "    <div class=\"carousel-inner\" ng-transclude></div>\n" +
    "    <a class=\"left carousel-control\" ng-click=\"prev()\" ng-show=\"slides().length > 1\"><span class=\"icon-prev\"></span></a>\n" +
    "    <a class=\"right carousel-control\" ng-click=\"next()\" ng-show=\"slides().length > 1\"><span class=\"icon-next\"></span></a>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/carousel/slide.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/carousel/slide.html",
    "<div ng-class=\"{\n" +
    "    'active': leaving || (active && !entering),\n" +
    "    'prev': (next || active) && direction=='prev',\n" +
    "    'next': (next || active) && direction=='next',\n" +
    "    'right': direction=='prev',\n" +
    "    'left': direction=='next'\n" +
    "  }\" class=\"item text-center\" ng-transclude></div>\n" +
    "");
}]);

angular.module("template/datepicker/datepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/datepicker.html",
    "<table>\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th colspan=\"{{rows[0].length - 2 + showWeekNumbers}}\"><button type=\"button\" class=\"btn btn-default btn-sm btn-block\" ng-click=\"toggleMode()\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "    <tr ng-show=\"labels.length > 0\" class=\"h6\">\n" +
    "      <th ng-show=\"showWeekNumbers\" class=\"text-center\">#</th>\n" +
    "      <th ng-repeat=\"label in labels\" class=\"text-center\">{{label}}</th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr ng-repeat=\"row in rows\">\n" +
    "      <td ng-show=\"showWeekNumbers\" class=\"text-center\"><em>{{ getWeekNumber(row) }}</em></td>\n" +
    "      <td ng-repeat=\"dt in row\" class=\"text-center\">\n" +
    "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default btn-sm\" ng-class=\"{'btn-info': dt.selected}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\"><span ng-class=\"{'text-muted': dt.secondary}\">{{dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("template/datepicker/popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/popup.html",
    "<ul class=\"dropdown-menu\" ng-style=\"{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}\">\n" +
    "	<li ng-transclude></li>\n" +
    "	<li ng-show=\"showButtonBar\" style=\"padding:10px 9px 2px\">\n" +
    "		<span class=\"btn-group\">\n" +
    "			<button type=\"button\" class=\"btn btn-sm btn-info\" ng-click=\"today()\">{{currentText}}</button>\n" +
    "			<button type=\"button\" class=\"btn btn-sm btn-default\" ng-click=\"showWeeks = ! showWeeks\" ng-class=\"{active: showWeeks}\">{{toggleWeeksText}}</button>\n" +
    "			<button type=\"button\" class=\"btn btn-sm btn-danger\" ng-click=\"clear()\">{{clearText}}</button>\n" +
    "		</span>\n" +
    "		<button type=\"button\" class=\"btn btn-sm btn-success pull-right\" ng-click=\"isOpen = false\">{{closeText}}</button>\n" +
    "	</li>\n" +
    "</ul>\n" +
    "");
}]);

angular.module("template/modal/backdrop.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/modal/backdrop.html",
    "<div class=\"modal-backdrop fade\" ng-class=\"{in: animate}\" ng-style=\"{'z-index': 1040 + index*10}\"></div>");
}]);

angular.module("template/modal/window.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/modal/window.html",
    "<div tabindex=\"-1\" class=\"modal fade {{ windowClass }}\" ng-class=\"{in: animate}\" ng-style=\"{'z-index': 1050 + index*10, display: 'block'}\" ng-click=\"close($event)\">\n" +
    "    <div class=\"modal-dialog\"><div class=\"modal-content\" ng-transclude></div></div>\n" +
    "</div>");
}]);

angular.module("template/pagination/pager.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/pagination/pager.html",
    "<ul class=\"pager\">\n" +
    "  <li ng-repeat=\"page in pages\" ng-class=\"{disabled: page.disabled, previous: page.previous, next: page.next}\"><a ng-click=\"selectPage(page.number)\">{{page.text}}</a></li>\n" +
    "</ul>");
}]);

angular.module("template/pagination/pagination.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/pagination/pagination.html",
    "<ul class=\"pagination\">\n" +
    "  <li ng-repeat=\"page in pages\" ng-class=\"{active: page.active, disabled: page.disabled}\"><a ng-click=\"selectPage(page.number)\">{{page.text}}</a></li>\n" +
    "</ul>");
}]);

angular.module("template/tooltip/tooltip-html-unsafe-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tooltip/tooltip-html-unsafe-popup.html",
    "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
    "  <div class=\"tooltip-arrow\"></div>\n" +
    "  <div class=\"tooltip-inner\" bind-html-unsafe=\"content\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/tooltip/tooltip-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tooltip/tooltip-popup.html",
    "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
    "  <div class=\"tooltip-arrow\"></div>\n" +
    "  <div class=\"tooltip-inner\" ng-bind=\"content\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/popover/popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/popover/popover.html",
    "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
    "  <div class=\"arrow\"></div>\n" +
    "\n" +
    "  <div class=\"popover-inner\">\n" +
    "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3>\n" +
    "      <div class=\"popover-content\" ng-bind=\"content\"></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/progressbar/bar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/progressbar/bar.html",
    "<div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" ng-transclude></div>");
}]);

angular.module("template/progressbar/progress.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/progressbar/progress.html",
    "<div class=\"progress\" ng-transclude></div>");
}]);

angular.module("template/progressbar/progressbar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/progressbar/progressbar.html",
    "<div class=\"progress\"><div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" ng-transclude></div></div>");
}]);

angular.module("template/rating/rating.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/rating/rating.html",
    "<span ng-mouseleave=\"reset()\">\n" +
    "    <i ng-repeat=\"r in range\" ng-mouseenter=\"enter($index + 1)\" ng-click=\"rate($index + 1)\" class=\"glyphicon\" ng-class=\"$index < val && (r.stateOn || 'glyphicon-star') || (r.stateOff || 'glyphicon-star-empty')\"></i>\n" +
    "</span>");
}]);

angular.module("template/tabs/tab.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tabs/tab.html",
    "<li ng-class=\"{active: active, disabled: disabled}\">\n" +
    "  <a ng-click=\"select()\" tab-heading-transclude>{{heading}}</a>\n" +
    "</li>\n" +
    "");
}]);

angular.module("template/tabs/tabset-titles.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tabs/tabset-titles.html",
    "<ul class=\"nav {{type && 'nav-' + type}}\" ng-class=\"{'nav-stacked': vertical}\">\n" +
    "</ul>\n" +
    "");
}]);

angular.module("template/tabs/tabset.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tabs/tabset.html",
    "\n" +
    "<div class=\"tabbable\">\n" +
    "  <ul class=\"nav {{type && 'nav-' + type}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
    "  <div class=\"tab-content\">\n" +
    "    <div class=\"tab-pane\" \n" +
    "         ng-repeat=\"tab in tabs\" \n" +
    "         ng-class=\"{active: tab.active}\"\n" +
    "         tab-content-transclude=\"tab\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/timepicker/timepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/timepicker/timepicker.html",
    "<table>\n" +
    "	<tbody>\n" +
    "		<tr class=\"text-center\">\n" +
    "			<td><a ng-click=\"incrementHours()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
    "			<td>&nbsp;</td>\n" +
    "			<td><a ng-click=\"incrementMinutes()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
    "			<td ng-show=\"showMeridian\"></td>\n" +
    "		</tr>\n" +
    "		<tr>\n" +
    "			<td style=\"width:50px;\" class=\"form-group\" ng-class=\"{'has-error': invalidHours}\">\n" +
    "				<input type=\"text\" ng-model=\"hours\" ng-change=\"updateHours()\" class=\"form-control text-center\" ng-mousewheel=\"incrementHours()\" ng-readonly=\"readonlyInput\" maxlength=\"2\">\n" +
    "			</td>\n" +
    "			<td>:</td>\n" +
    "			<td style=\"width:50px;\" class=\"form-group\" ng-class=\"{'has-error': invalidMinutes}\">\n" +
    "				<input type=\"text\" ng-model=\"minutes\" ng-change=\"updateMinutes()\" class=\"form-control text-center\" ng-readonly=\"readonlyInput\" maxlength=\"2\">\n" +
    "			</td>\n" +
    "			<td ng-show=\"showMeridian\"><button type=\"button\" class=\"btn btn-default text-center\" ng-click=\"toggleMeridian()\">{{meridian}}</button></td>\n" +
    "		</tr>\n" +
    "		<tr class=\"text-center\">\n" +
    "			<td><a ng-click=\"decrementHours()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
    "			<td>&nbsp;</td>\n" +
    "			<td><a ng-click=\"decrementMinutes()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
    "			<td ng-show=\"showMeridian\"></td>\n" +
    "		</tr>\n" +
    "	</tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("template/typeahead/typeahead-match.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/typeahead/typeahead-match.html",
    "<a tabindex=\"-1\" bind-html-unsafe=\"match.label | typeaheadHighlight:query\"></a>");
}]);

angular.module("template/typeahead/typeahead-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/typeahead/typeahead-popup.html",
    "<ul class=\"dropdown-menu\" ng-style=\"{display: isOpen()&&'block' || 'none', top: position.top+'px', left: position.left+'px'}\">\n" +
    "    <li ng-repeat=\"match in matches\" ng-class=\"{active: isActive($index) }\" ng-mouseenter=\"selectActive($index)\" ng-click=\"selectMatch($index)\">\n" +
    "        <div typeahead-match index=\"$index\" match=\"match\" query=\"query\" template-url=\"templateUrl\"></div>\n" +
    "    </li>\n" +
    "</ul>");
}]);
