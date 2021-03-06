var parser = require('commander');
var fs = require('fs');
var httpProxy = require('http-proxy').createProxyServer({});
var serveStatic = require('serve-static');
var finalhandler = require('finalhandler');

parser
  .version('0.1.0')
  .option('-H, --hosts [hostsfile]', 'The path to the Hosts file', null)
  .parse(process.argv);

var hostManager = require('./hostsFileManager.js')(parser.hosts);

var http = require('http');
var path = require('path');

var matches;

var staticServers = {};

function refreshHosts(){
  matches = hostManager.domains();
}

var router = http.createServer(function(req, res){
  refreshHosts();
  if(req.headers.host in matches){
    if(matches[req.headers.host].type == "PORT"){
      var port = matches[req.headers.host].target;
      httpProxy.web(req, res, {target: 'http://localhost:' + port}, function(e){
        if(e.message.indexOf('ECONNREFUSED') != -1){
          console.log('Unable to access local webserver at port ' + port);
        }else{
          console.log(e.name + '\t' + e.message);
        }
        res.end('ERROR: Unable to access local webserver at port ' + port);
      });
      // console.log(req.headers.host + " --> " + 'localhost:' + port);
    }else if(matches[req.headers.host].type == "DIR"){
      var rootDir = matches[req.headers.host].target;
      if(rootDir in staticServers){
      }else{
        staticServers[rootDir] = serveStatic(rootDir, {
          index: ['index.html', 'index.htm'],
          fallthrough: true
        });
      }
      var done = finalhandler(req, res);
      staticServers[rootDir](req, res, done);
    }
  }else{
    res.end(req.headers.host);
    console.log(req.headers.host + " --> ???");
  }
});

refreshHosts();
router.on('error', function(e){
  if(e.message.indexOf('EACCES') != -1){
    console.log('Inadequate permissions to open port 80.');
    console.log('Please run using administrator privileges.');
  }else{
    console.log(e.name + '\t' + e.message);
  }
});

fs.writeFileSync(__dirname + '/server.pid', process.pid);

router.listen(80, function(){
  console.log('Hostmatch proxy running at port 80');
  process.setuid && process.setuid(502);
});

function exitHandler(code){
  if(fs.existsSync(__dirname + '/server.pid'))
    fs.unlinkSync(__dirname + '/server.pid');
  process.exit(code);
}
process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGTERM', exitHandler);
process.on('uncaughtException', exitHandler);
