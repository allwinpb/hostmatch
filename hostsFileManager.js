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
          mapped.target = matched[1].trim()
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
    }
  }
  fileManager.read();
  return fileManager;
}

module.exports = hostsFileManager
