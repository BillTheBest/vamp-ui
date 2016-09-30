/* global YAML*/
function updateDeploymentController(Api, $state, toastr, $stateParams, $mixpanel) {
  var self = this;
  self.data = {};
  self.deploymentId = $stateParams.id;
  self.update = update;

  self.canBeParsed = true;

  Api.read('deployments', self.deploymentId).then(deploymentLoaded);

  $mixpanel.track('Update Deployments button clicked');
  function update(deploymentData) {
    Api.update('deployments', self.deploymentId, deploymentData).then(deploymentUpdated, deploymentNotUpdated);
  }

  function deploymentLoaded(response) {
    self.data = response.data;
    self.sourceCode = YAML.stringify(self.data, 20);
  }

  function deploymentUpdated() {
    toastr.success(self.deploymentId, 'Updated Deployment');
    $mixpanel.track('Deployment updated trough UI');
    $mixpanel.track('Deployment updated');
    $state.go('readAllDeployments');
  }

  function deploymentNotUpdated(error) {
    toastr.error(error, 'Could not update Deployment');
  }
}

angular
  .module('app')
  .component('updateDeployment', {
    templateUrl: 'app/updateDeployment/updateDeployment.html',
    controller: updateDeploymentController
  });