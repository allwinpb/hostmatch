var parser = require('commander');
var fs = require('fs');
var httpProxy = require('http-proxy').createProxyServer({});

parser
  .version('0.1.0')
  .option('-H, --hosts [hostsfile]', 'The path to the Hosts file', null)
  .parse(process.argv);

var hostManager = require('./hostsFileManager.js')(parser.hosts);

var http = require('http');

var matches;

function refreshHosts(){
  matches = hostManager.domains();
}

var router = http.createServer(function(req, res){
  if(req.headers.host in matches){
    if(matches[req.headers.host].type == "PORT"){
      var port = matches[req.headers.host].target;
      try{
        httpProxy.web(req, res, {target: 'http://localhost:' + port});
      }catch(e){

      }
      console.log(req.headers.host + " --> " + 'localhost:' + port);
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
fs.writeFileSync(__dirname + '/server.pid',process.pid);
router.listen(80);

function exitHandler(code){
  if(fs.existsSync(__dirname + '/server.pid'))
    fs.unlinkSync(__dirname + '/server.pid');
  process.exit(code);
}
process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGTERM', exitHandler);
process.on('uncaughtException', exitHandler);
