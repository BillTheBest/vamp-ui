angular.module('app')
  .controller('BlueprintsController', BlueprintsController)
  .controller('DeployBlueprintController', DeployBlueprintController)
  .controller('UpdateDeploymentController', UpdateDeploymentController)
  .factory('$vampBlueprint', ['$rootScope', '$vamp', function ($rootScope, $vamp) {
    return new BlueprintService($rootScope, $vamp);
  }]);

/** @ngInject */
function BlueprintsController($scope, artifactsMetadata, $vampBlueprint, $controller) {
  var $ctrl = this;
  $controller('BaseArtifactsController', {$ctrl: $ctrl, $scope: $scope, artifactsMetadata: artifactsMetadata});
}

/** @ngInject */
function DeployBlueprintController($scope, $uibModalInstance, blueprint) {
  $scope.blueprint = blueprint;
  $scope.name = angular.copy(blueprint.name);

  $scope.ok = function () {
    $uibModalInstance.close({name: $scope.name});
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

/** @ngInject */
function UpdateDeploymentController($scope, $uibModalInstance, blueprint, deployments, title, text, buttonText, buttonClass) {
  $scope.blueprint = blueprint;
  $scope.title = title;
  $scope.text = text;
  $scope.buttonText = buttonText;
  $scope.buttonClass = buttonClass;
  $scope.deployments = deployments;
  $scope.chosenDeployment = deployments[0];

  $scope.deploymentChosen = function (deployment) {
    $scope.chosenDeployment = deployment;
  };

  $scope.ok = function () {
    $uibModalInstance.close({deployment: $scope.chosenDeployment});
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

function BlueprintService($rootScope, $vamp) {
  var deployments = [];

  var peek = _.throttle(function () {
    $vamp.peek('/deployments');
  }, 1000, {
    leading: true,
    trailing: false
  });

  peek();

  $rootScope.$on('/deployments', function (e, response) {
    if (response.status === 'OK') {
      deployments = _.sortBy(response.data, ['name']);
      $rootScope.$broadcast('deployments');
    }
  });

  this.mergeWithDeployments = function (list) {
    list.length = 0;

    _.forEach(_.sortBy(deployments, ['name']), function (deployment) {
      list.unshift(deployment);
    });
  };

  this.removeFromDeployments = function (list, blueprint) {
    list.length = 0;

    var filtered = _.filter(deployments, function (deployment) {
      return _.find(blueprint.clusters, function (bc, name) {
        var dc = deployment.clusters[name];
        if (_.isEmpty(dc)) {
          return false;
        }
        return _.find(bc.services, function (bs) {
          return _.find(dc.services, function (ds) {
            return bs.breed.name === ds.breed.name;
          });
        });
      });
    });

    _.forEach(_.sortBy(filtered, ['name']), function (deployment) {
      list.unshift(deployment);
    });
  };

  $rootScope.$on('/events/stream', function (e, response) {
    if ((_.includes(response.data.tags, 'deployments') && _.includes(response.data.tags, 'archive')) || _.includes(response.data.tags, 'synchronization')) {
      peek();
    }
  });
}
