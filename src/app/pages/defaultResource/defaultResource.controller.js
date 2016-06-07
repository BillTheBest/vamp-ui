(function() {
  'use strict';

  angular
    .module('revampUi')
    .controller('DefaultResource', DefaultResource);

  /** @ngInject */
  function DefaultResource($http, $stateParams) {
    var vm = this;


    var baseUrl = 'http://192.168.99.100:8080/api/v1/';
    
    vm.resource = $stateParams.resource;

    vm.test = 'test';
  }
})();
