var fs = require('fs');
var os = require('os')

var defaultHostsFile;
if(os.platform() == "win32"){
  defaultHostsFile = "C:/Windows/System32/drivers/etc/hosts"
}else{
  defaultHostsFile = "/etc/hosts"
}

var hostsFileManager = function(filename){
  filename = filename || defaultHostsFile;
  var content;
  var fileManager = {
    getFilename: function(){
      return filename;
    },
    read: function(){
      content = fs
        .readFileSync(filename, {encoding: 'utf-8', flag: 'r'})
        .split(os.EOL)
      return content;
    },
    getRawContent: function(){
      return content;
    },
    list: function(){
      this.read();
      var validDomains = content
        .filter(function(line){
          return  line.startsWith('127.0.0.1') &&
                  line.split('#').length != 1 &&
                  line.split('#')[0].trim().split(/\s+/).length == 2 &&
                  line.split('#')[1].trim().split(/\s+/).length >= 2 &&
                  ["PORT", "DIR"].indexOf(line.split('#')[1].trim().split(/\s+/)[0]) != -1
        })
        .map(function(line){
          var mapped = {}
          components = line.split('#')
          match = components[0].trim().split(/\s+/)
          mapped.domain = match[1]
          matched = components[1].trim().split(/\s+/)
          mapped.type = matched[0].trim().toUpperCase()
          mapped.target = components[1].trim().split(/\s/).splice(1).join(' ');
          return mapped;
        })
      return validDomains;
    },
    domains: function(){
      var domainList = this.list();
      var domainDict = {};
      for(var i=0; i<domainList.length; i++){
        domainDict[domainList[i].domain] = domainList[i];
      }
      return domainDict;
    },
    write: function(){
      fs.writeFileSync(filename, content.join(os.EOL), 'utf8');
    },
    add: function(domain, type, target){
      this.read();
      // TODO: What if the domain already exists in the hosts file?
      var domainString = "127.0.0.1 " + domain + " # " + type + " " + target;
      content.push(domainString);
      this.write();
    },
    remove: function(targetDomain){
      this.read();
      for(var i=0; i<content.length; i++){
        if(content[i].startsWith("127.0.0.1")){
          var line = content[i].split(/\s+/);
          var domain = line[1];
          if(domain == targetDomain){
            content.splice(i,1);
            i--;
          }
        }
      }
      this.write();
    }
  }
  return fileManager;
}

module.exports = hostsFileManager
