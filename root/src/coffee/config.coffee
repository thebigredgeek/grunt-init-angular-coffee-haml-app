angular.module("{%= sterileName %}").config ($routeProvider) ->
  $routeProvider.when("/",
    templateUrl: "partials/demoPartial.html"
    controller: "demoController"
  ).otherwise redirectTo: "/"
