var fs = require('fs');

module.exports = {
  getProcessPid: function(){
    var pid = null;
    var pidfile = __dirname + "/server.pid";
    if(fs.existsSync(pidfile)){
      pid = fs.readFileSync(pidfile);
    }
    if(!pid) return pid;
    try {
      // Throws error if pid does not exist
      // Does nothing if it does
      process.kill(pid, 0);
      return pid;
    }catch(e){
      // Process with pid does not exist
      // Remove the erraneous pid file
      fs.unlinkSync(__dirname + "/server.pid");
      // return null
      return null;
    }
  }
}
