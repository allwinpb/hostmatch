# HostMatch

`hostmatch` is a tool to easily generate reader-friendly hostnames for faster
concurrent local web development. For example, instead of typing

`localhost:3000`

every time you need to view the page of a local webserver, hostmatch allows you
to do something like this:

`projectname.dev`

This can be done by simply editing the hosts file, but only for servers running
on port 80. HostMatch extends this to local servers running at any port.

## Commands

`hostmatch list` or `hostmatch ls` - List all the active matches
`hostmatch add <domain> <port>` - Match <domain> to local server at <port>
`hostmatch rm <domain>` - Remove <domain>
