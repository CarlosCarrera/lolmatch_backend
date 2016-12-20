var globalHttpAgent = null;
var globalHttpsAgent = null;
var noProxy = null;

var isInNoProxyList = function(noProxyList) {
    if (!noProxyList) return function() {
        return false;
    };
    var regEx = noProxyList.replace(/,/gi, '|').replace(/ /gi, '').replace(/(^\*)/gi, '.*').replace(/\|\*/gi, '|.*');
    return function(address) {
        return new RegExp(regEx).test(address);
    };
};
function fixHttpTunnel(requestObj) {
    var instance = requestObj.globalAgent;
    var original = instance.addRequest;
    if (!instance.fixedInstances) {
        instance.addRequest = function(request, options, port, localAddress) {
            if (typeof options === 'object')
                return original.call(this, request, options.host, options.port);
            return original.call(this, request, options, port, localAddress);
        };
        requestObj.substitutions = (requestObj.substitutions) ? requestObj.substitutions + 1 : 1;
    }
    instance.fixedInstances = true;
}
var tls = require('tls');
function fixTls(instance, options) {
    if (instance.constructor.toString().indexOf('TunnelingAgent') !== -1) {
        var originalTsl = tls.connect;
        tls.connect = function() {
            var tlsOptions = arguments[1];
            if (tlsOptions && options.cert || options.agentOptions) {
                tlsOptions.cert = options.cert ? options.cert : options.agentOptions.cert;
                tlsOptions.key = options.key ? options.key : options.agentOptions.key;
            }
            return originalTsl.call(this, arguments[0], tlsOptions);
        };
    }
}
function fixLoopbackContext(req, theOriginalArguments) {
    var originalOn = req.on;
    req.on = function() {
        var callback = arguments[1];
        var contextAwareCallback = process.domain.restoreLoopbackContext(callback);
        arguments[1] = contextAwareCallback;
        return originalOn.apply(req, arguments);
    };
    return req;
}
function fixHttpsTunnel(requestObj) {
    var instance = requestObj.globalAgent;
    var original = instance.createSocket;
    var originalRequest = requestObj.request;
    if (!instance.fixedInstances) {
        instance.createSocket = function(options, cb) {
            if (typeof options.host === 'object')    /*back compatibility for node versions */ {
                var request = options.request;
                options = options.host;
                options.request = request;
            }
            if (options.port === 80) { /*see test: for fixing Knox library */
                options.port = 443;
            }
            fixTls(instance, options);
            return original.call(this, options, cb);
        };
        requestObj.request = function() {       /*see test: for fixing Knox library */
            var options = arguments[0];
            if (typeof options === 'object') {
                if (noProxy(options.host)) {
                    console.log('bypassing proxy for host: [',options.host, ']');
                    options.agent = globalHttpsAgent;
                } else {
                    options.agent = instance;
                }
            }
            var req = originalRequest.apply(this, arguments);
            if (!process.domain || !process.domain.restoreLoopbackContext) return req;
            var reqContextAware = fixLoopbackContext(req, arguments);
            return reqContextAware;
        };
        requestObj.substitutions = (requestObj.substitutions) ? requestObj.substitutions + 1 : 1;
    }
    instance.fixedInstances = true;
}
function initDevEnvironment() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    //with env-var: http_proxy=http://192.168.62.7:3128
    var http = require('http');
    if (!globalHttpAgent) globalHttpAgent = http.globalAgent;
    var https = require('https');
    if (!globalHttpsAgent) globalHttpsAgent = https.globalAgent;
    var noProxyList = process.env.no_proxy ? process.env.no_proxy : process.env.NO_PROXY ? process.env.NO_PROXY : '';
    noProxy = isInNoProxyList(noProxyList);
    var globalTunnel = require('global-tunnel');
    globalTunnel.initialize();
    fixHttpTunnel(http);
    fixHttpsTunnel(https);
    console.log('initialized global tunnel for https and http..');
}
if (process.env.http_proxy) {
    initDevEnvironment();
}
module.exports = initDevEnvironment;
module.exports.isInNoProxyList = isInNoProxyList;
