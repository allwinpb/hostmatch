var parser = require('commander');
var hostManager = require('./hostsFileManager');

parser
  .version('0.1.0')
  .option('-H, --hosts <hostsfile>', 'The path to the Hosts file', null)

parser
  .command('list')
  .description('List all the currently active domains')
  .action(function(command){
    // console.log(command.parent.hosts)
    var domainlist = hostManager(command.parent.hosts).list()
    domainlist.map(function(mapped){
      if(mapped.type == "PORT")
        console.log(mapped.domain, "-->", "127.0.0.1:" + mapped.target)
    })
  })

parser
  .command('add <domain> <port>')
  .description('Add a new domain matched to [port]')
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
