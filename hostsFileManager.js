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
          return line.startsWith('127.0.0.1')
        })
        .map(function(line){
          var mapped = {}
          components = line.split('#')
          if(components.length == 1){
            // definitely not valid entry for hostmatch
            return false;
          }
          match = components[0].trim().split(/\s+/)
          if(match.length != 2){
            //valid hosts file entry but not valid hostmatch entry
            return false;
          }else{
            mapped.domain = match[1]
          }
          matched = components[1].trim().split(/\s+/)
          if(matched.length != 2){
            //valid hosts file entry but not valid hostmatch entry
            return false;
          }
          if(["PORT"].indexOf(matched[0].trim().toUpperCase()) != -1){
            mapped.type = matched[0].trim().toUpperCase()
          }else{
            return false;
          }
          mapped.target = matched[1].trim();
          return mapped;
        })
        .filter(function(mapped){
          return mapped != false;
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
            break;
          }
        }
      }
      this.write();
    }
  }
  return fileManager;
}

module.exports = hostsFileManager
