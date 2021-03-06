#!/usr/bin/env node
var parser = require('commander');
var hostManager = require('./hostsFileManager');
var fs = require('fs');
var path = require('path');

var getProcessPid = require('./utility').getProcessPid;

parser
  .version('0.1.0')
  .option('-H, --hosts <hostsfile>', 'The path to the Hosts file', null)

parser
  .command('status')
  .description('Check the status of the server')
  .action(function(command){
    var pid = getProcessPid();
    if(pid){
      console.log('Hostmatch Routing Server running with PID: ' + pid + '.');
      return;
    }else{
      console.log('Hostmatch Routing Server is not running.');
      console.log('Use the `start` command to start the server.');
    }
  })

parser
  .command('start')
  .description('Starts the server (only if it is not already running)')
  .action(function(command){
    var pid = getProcessPid();
    if(pid){
      console.log('Hostmatch Routing Server is already running at PID: ' + pid + '.');
      return;
    }
    var spawn = require('child_process').spawn;
    var out = fs.openSync(__dirname + '/out.log', 'a');
    var err = fs.openSync(__dirname + '/out.log', 'a');

    var child = spawn(
      process.execPath,
      [__dirname + '/server', '-H', command.parent.hosts || ''],
      {
        detached: true,
        stdio: [ 'ignore', out, err ]
      }
    );
    child.unref();
    setTimeout(function(){
      try{
        fs.accessSync(__dirname + '/server.pid');
      } catch(e){
        console.log('Unable to start the routing server for some reason.')
        console.log('Are you sure you are root?')
      }
    },500)
  })

parser
  .command('stop')
  .description('Stops the server (only if it is running)')
  .action(function(command){
    var pid = getProcessPid();
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
    var domainlist = hostManager(command.parent.hosts).list()
    domainlist.map(function(mapped){
      if(mapped.type == "PORT")
        console.log(mapped.domain, "-->", "localhost:" + mapped.target + " (PORT)");
      else if(mapped.type == "DIR")
        console.log(mapped.domain, "-->", mapped.target + " (DIR)");
    })
  })

parser
  .command('add <domain> <target>')
  .description('Add a new [domain] matched to [target]. [target] can be either a port number or a directory path')
  .action(function(domain, target, command){
    var type = "DIR";
    if(target.match(/^\d+$/)){
      type = "PORT";
    }else{
      type = "DIR";
      target = path.resolve(process.cwd(), target);
    }
    hostManager(command.parent.hosts).add(domain, type, target);
  })

parser
  .command('remove <domain>')
  .description('Remove a domain from the list of matched domains')
  .action(function(domain, command){
    hostManager(command.parent.hosts).remove(domain);
  })

parser.parse(process.argv);