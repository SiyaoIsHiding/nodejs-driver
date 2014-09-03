var util = require('util');

var loadBalancing = require('./policies/load-balancing.js');
var reconnection = require('./policies/reconnection.js');
var retry = require('./policies/retry.js');
var types = require('./types.js');
var utils = require('./utils.js');


var defaultOptions = {
  policies: {
    loadBalancing: new loadBalancing.RoundRobinPolicy(),
    reconnection: new reconnection.ExponentialReconnectionPolicy(1000, 10 * 60 * 1000, false),
    retry: new retry.RetryPolicy()
  },
  queryOptions: {
    consistency: types.consistencies.one,
    fetchSize: 5000,
    prepare: false
  },
  pooling: {
    coreConnectionsPerHost: {
      '0': 2,
      '1': 1,
      '2': 0
    },
    maxConnectionsPerHost: {}
  },
  maxPrepared: 500
};

/**
 * Extends and validates the user options
 * @param {Object} userOptions
 * @returns {Object}
 */
function extend(userOptions) {
  var options = utils.deepExtend({}, defaultOptions, userOptions);
  if (!util.isArray(options.contactPoints) || options.contactPoints.length === 0) {
    throw new TypeError('Contacts points are not defined.');
  }
  for (var i = 0; i < options.contactPoints.length; i++) {
    var hostName = options.contactPoints[i];
    if (!hostName || hostName.indexOf(':') > 0) {
      throw new TypeError(util.format('Contact point %s (%s) is not a valid host name, ' +
        'use ip address or host name without specifying the port number', i, hostName));
    }
  }
  if (!options.policies) {
    throw new TypeError('policies not defined in options');
  }
  if (!(options.policies.loadBalancing instanceof loadBalancing.LoadBalancingPolicy)) {
    throw new TypeError('Load balancing policy must be an instance of LoadBalancingPolicy');
  }
  if (!(options.policies.reconnection instanceof reconnection.ReconnectionPolicy)) {
    throw new TypeError('Reconnection policy must be an instance of ReconnectionPolicy');
  }
  if (!(options.policies.retry instanceof retry.RetryPolicy)) {
    throw new TypeError('Retry policy must be an instance of RetryPolicy');
  }
  if (!options.queryOptions) {
    throw new TypeError('queryOptions not defined in options');
  }
  return options;
}

exports.extend = extend;
exports.defaultOptions = defaultOptions;