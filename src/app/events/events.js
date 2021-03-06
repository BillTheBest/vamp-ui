angular.module('app').component('events', {
  templateUrl: 'app/events/events.html',
  controller: EventController
});

function EventController($scope, $vamp, $interval, uiStatesFactory, overlayService) {
  var $ctrl = this;

  var maxLength = 50;

  this.events = [];
  this.show = false;

  this.filters = {
    health: true,
    metrics: true,
    allocation: true
  };

  this.toggle = function ($event) {
    if (!$event || !$event.ignore) {
      $ctrl.show = !$ctrl.show;
      uiStatesFactory.setFooterViewState($ctrl.show ? 'expanded' : 'collapsed');
    }
  };

  $scope.filter = function ($event, type) {
    if (!type) {
      return;
    }
    $event.stopPropagation();

    if ($ctrl.filters[type]) {
      $($event.target).find('input[type=checkbox]').prop('checked', true);
    } else {
      var filtered = _.filter($ctrl.events, function (event) {
        return event.type !== type;
      });
      $ctrl.events.length = 0;
      _.forEach(filtered, function (event) {
        $ctrl.events.unshift(event);
      });

      $($event.target).find('input[type=checkbox]').prop('checked', false);
    }
  };

  function start() {
    $ctrl.events.length = 0;
    $vamp.peek('/events');
    $vamp.peek('/events/stream');
  }

  if ($vamp.connected()) {
    start();
  }

  $scope.$on('$vamp:connection', function (e, connection) {
    if (connection === 'opened') {
      start();
    }
  });

  function onEvent(event) {
    if ($ctrl.filters[event.type] === false) {
      return;
    }

    var combined = _.filter(event.tags, function (tag) {
      return tag.indexOf(':') !== -1;
    });

    var single = _.filter(event.tags, function (tag) {
      var found = _.find(combined, function (c) {
        return c.indexOf(tag + ':') !== -1 || c === tag;
      });
      return tag !== event.type && !found;
    });

    $ctrl.events.push({
      type: event.type,
      value: event.value,
      timestamp: event.timestamp,
      tags: _.concat(combined, single)
    });

    while ($ctrl.events.length > maxLength) {
      $ctrl.events.shift();
    }
  }

  $scope.$on('/events', function (e, response) {
    _.forEach(response.data, function (event) {
      onEvent(event);
    });
  });

  $scope.$on('/events/stream', function (e, response) {
    onEvent(response.data);
  });

  // jvm metrics

  var polling;

  $ctrl.connected = false;

  function info() {
    $vamp.peek('/info', '', {on: 'jvm'});
  }

  function startPolling() {
    info();
    if (!polling) {
      polling = $interval(info, 15000);
    }
    $ctrl.connected = true;

    overlayService.hide();
  }

  function stopPolling() {
    $ctrl.connected = false;
    $interval.cancel(polling);
    polling = undefined;

    overlayService.display('error.disconnected');
  }

  if ($vamp.connected()) {
    startPolling();
  }

  $scope.$on('$vamp:connection', function (event, connection) {
    if (connection === 'opened') {
      startPolling();
    } else {
      stopPolling();
    }
  });

  $scope.$on('/info', function (event, data) {
    if (data.content === 'JSON') {
      var info = data.data;
      $ctrl.jvm = {
        systemLoad: info.jvm.operating_system.system_load_average,
        heapCurrent: info.jvm.memory.heap.used / (1024 * 1024),
        heapMax: info.jvm.memory.heap.max / (1024 * 1024)
      };
    }
  });
}
