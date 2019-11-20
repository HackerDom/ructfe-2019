import tables
import strformat
import asynchttpserver, asyncdispatch

var flags = initTable[string, string]()
var server = newAsyncHttpServer()

# example service
proc cb(req: Request) {.async.} =
  {.gcsafe.}:
    case req.reqMethod
    of HttpGet:
      if flags.hasKey(req.url.path):
          await req.respond(Http200, fmt"flags[{req.url.path}]={flags[req.url.path]}")
      else:
          await req.respond(Http404, "Nnnna =(")
    of HttpPost:
      # example "vulnerability": just brute force all strings to get all flags
      flags[req.url.path.substr(0, 4)] = req.body
      await req.respond(Http200, fmt"flags[{req.url.path}]={req.body}")
    else:
      await req.respond(Http200, "This is just an example")

waitFor server.serve(Port(8080), cb)
