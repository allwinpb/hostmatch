var parser = require('commander');
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
      console.log(req.headers.host + " --> " + 'http://localhost:' + port);
    }
  }else{
    res.end(req.headers.host);
    console.log(req.headers.host + " --> ???");
  }
});

refreshHosts();
router.listen(80);
console.log("Routing Server running...")
