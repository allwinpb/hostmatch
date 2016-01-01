var parser = require('commander');
var hostManager = require('./hostsFileManager');
var fs = require('fs');

var checkPidFile = require('./utility').checkPidFile;

// function startServer(command){
//   var spawn = require('child_process').spawn;
//   var child = spawn(
//     process.execPath,
//     [__dirname + '/server', '-H', command.parent.hosts || ''],
//     {
//       detached: true,
//       stdio: 'ignore'
//     }
//   );
//   child.unref();
// }

parser
  .version('0.1.0')
  .option('-H, --hosts <hostsfile>', 'The path to the Hosts file', null)

parser
  .command('status')
  .description('Check the status of the server')
  .action(function(command){
    var pid = checkPidFile();
    if(pid){
      console.log('Hostmatch Routing Server running with PID: ' + pid + '.');
    }else{
      console.log('Hostmatch Routing Server is not running.');
      console.log('Use the `start` command to start the server.');
    }
  })

parser
  .command('start')
  .description('Starts the server (only if it is not already running)')
  .action(function(command){
    var pid = checkPidFile();
    if(pid){
      console.log('Hostmatch Routing Server is already running at PID: ' + pid + '.');
      return;
    }
    var spawn = require('child_process').spawn;
    var child = spawn(
      process.execPath,
      [__dirname + '/server', '-H', command.parent.hosts || ''],
      {
        detached: true,
        stdio: 'ignore'
      }
    );
    child.unref();
  })

parser
  .command('stop')
  .description('Stops the server (only if it is running)')
  .action(function(command){
    var pid = checkPidFile();
    if(!pid){
      console.log('Unable to find the PID file.');
      console.log('Are you sure the server is running?');
      return;
    }
    process.kill(parseInt(pid),'SIGTERM');
  })

parser
  .command('list')
  .description('List all the currently active domains')
  .action(function(command){
    // console.log(command.parent.hosts)
    var domainlist = hostManager(command.parent.hosts).list()
    domainlist.map(function(mapped){
      if(mapped.type == "PORT")
        console.log(mapped.domain, "-->", "localhost:" + mapped.target)
    })
  })

parser
  .command('add <domain> <port>')
  .description('Add a new [domain] matched to [port]')
  .action(function(domain, port, command){
    hostManager(command.parent.hosts).add(domain, "PORT", port);
  })

parser
  .command('remove <domain>')
  .description('Remove a domain from the list of matched domains')
  .action(function(domain, command){
    hostManager(command.parent.hosts).remove(domain);
  })

parser.parse(process.argv);
