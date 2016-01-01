var fs = require('fs');

module.exports = {
  checkPidFile: function(){
    var pid = null;
    var pidfile = __dirname + "/server.pid";
    if(fs.existsSync(pidfile)){
      pid = fs.readFileSync(pidfile);
    }
    return pid;
  }
}
