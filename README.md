# HostMatch

`hostmatch` is a developer tool to assign custom domain names (`workproject.dev` etc...) to local webservers (`localhost:3000`). Thus you can access webservers running on localhost by typing the corresponding domain name in your browser.

For example,  
`petproject.dev --> localhost:1337`  
`workproject.dev --> localhost:3000`

It achieves this by running its own proxy server locally at port 80. Administrator privileges are required to start the proxy server (it
needs to open port 80) as well as adding or removing domains (involves editing the hosts file).

## Commands

`hostmatch start` - Start the proxy server at port 80  
`hostmatch stop` - Stop the proxy server  
`hostmatch status` - Displays the current status of the routing server  
`hostmatch list` - List all the active matches  
`hostmatch add <domain> <port>` - Match domain to local server at port  
`hostmatch rm <domain>` - Remove domain
