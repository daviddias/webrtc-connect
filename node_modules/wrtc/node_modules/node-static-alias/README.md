# node-static-alias

Serve static file which is not requested file. (e.g. `file.min.js` is requested, serve `file.js`)  
node-static-alias wraps (inherits) the useful module [node-static](https://github.com/cloudhead/node-static/), and this add `alias` option to it.  
The working is like [Alias](http://httpd.apache.org/docs/2.4/mod/mod_alias.html) mapping or [mod_rewrite
](http://httpd.apache.org/docs/2.4/mod/mod_rewrite.html) of Apache. It is like [DirectoryIndex](http://httpd.apache.org/docs/2.4/mod/mod_dir.html#directoryindex) too. And this can check the file exists or not.

+ Serve `file.js` instead of `file.min.js` which is not made yet, in test phase.
+ Serve the outside files of document-root which are shared by multiple web site in one machine.
+ Serve the default page which is not `index.html` when *`/` is requested.

## Synopsis

```js
var staticAlias = require('node-static-alias');

// Document-Root: './public' directory
var fileServer = new staticAlias.Server('./public', {
  alias: {
    match: '/path/to/file.min.js',
    serve: '/path/to/file.js'
  }
});

require('http').createServer(function(request, response) {
  request.addListener('end', function() {
    fileServer.serve(request, response);
  }).resume();
}).listen(8080);
```

## Usage

node-static-alias add `alias` option to node-static via `require('node-static-alias')` instead of `require('node-static')`. See [node-static](https://github.com/cloudhead/node-static/) to use it.

### alias
The `alias` included in constructor options is a Alias-Rule Object, or an array which includes multiple Alias-Rule Objects.

```js
  alias: {
    match: /file\.min\.(?:js|css)$/,
    serve: '/path/to/file.<% suffix %>'
  }
```

Or

```js
  alias: [
    {
      match: '/path/to/file.min.js',
      serve: '/path/to/file.js'
    },
    {
      match: 'suffix=png',
      serve: '../outer/<% fileName %>',
      allowOutside: true
    }
  ]
```

The Alias-Rule Object can have following properties.

### `match`

**Type:** String, RegExp, Function or Array

Specify one of below or Array which includes multiple things of those.  
If one or more things match, `serve` is parsed. If anything doesn't match, it go to next Alias-Rule. If all Alias-Rules don't match, serving the requested file is tried.

+ **String:**  
If the requested path is equal to this string, it's matched.  
Or, this can be `parameter=value` format (e.g. `suffix=png`). See [Parameters](#parameters). If the `value` is equal to specified parameter, it's matched.

```js
  alias: [
    {
      match: '/path/to/file.min.js',
      serve: '/path/to/file.js'
    },
    // Image files are not made yet.
    {
      match: 'suffix=png',
      serve: '/path/to/dummy.png'
    }
  ]
```

+ **RegExp:**  
The RegExp which test the requested path.

```js
  // These image files are not made yet.
  alias: {
    match: /\/(?:foo|bar)\.png$/,
    serve: '/path/to/dummy.png'
  }
```

+ **Function:**  
The Function which returns `true` or `false`.
The Object which has parameters is passed to this Function. See [Parameters](#parameters).

```js
  // Kick direct access from outside web site.
  alias: {
    match: function(params) {
      return params.suffix === 'jpg' &&
        params.referer.indexOf('http://mysite.com/') !== 0;
    },
    serve: '/path/to/denial.jpg'
  }
```

### `serve`

**Type:** String, Function or Array

Specify one of below or Array which includes multiple things of those.  
By default, the first file which exist is chosen to try serving. See [force](#force). If anything doesn't exist, it go to next Alias-Rule. If all files of Alias-Rules don't exist, serving the requested file is tried.

+ **String:**  
The absolute path or relative path from document-root of file to serve.  
This can include parameters like `<% parameter %>`. See [Parameters](#parameters).

```js
  // directoryIndex isn't index.html
  alias: {
    match: /\/$/,
    serve: '<% absPath %>/default.html'
  }
```

*NOTE:* If the first character of this string is `/` (it may be parameter), this string is absolute path. This `/` doesn't point document-root. It's root of the local filesystem. If you want relative path from document-root, don't specify leading `/`, or add `.` to left of leading `/`.

+ **Function:**  
The Function which returns the absolute path or relative path from document-root of file to serve.  
The Object which has parameters is passed to this Function. See [Parameters](#parameters).

```js
  // Minified files are not made yet.
  alias: {
    match: /\.min\.(?:js|css)$/,
    serve: function(params) {
      return params.absDir + '/' +
        params.basename.replace(/\.min$/, '.') + params.suffix;
    }
  }
```

```js
  // Compile unwatched SASS now.
  alias: {
    match: 'suffix=css',
    serve: function(params) {
      require('exec-sync')('sass ' +
        params.absDir + '/' + params.basename + '.scss:' + params.absPath);
      return params.absPath;
    }
  }
```

### <a name ="force">`force`</a>

**Type:** Boolean

If `true` is specified, first file in `serve` is chosen to try serving without checking it's existing or not. And if it doesn't exist, a 404 error occur. Default is `false`.  
This is used to prevent another file from being chosen unintentionally.

### `allowOutside`

If `true` is specified, serving the outside files of document-root is allowed. Default is `false`.  

```js
  // Shared files.
  alias: {
    match: /^\/common_lib/,
    serve: '/path/to/lib/<% fileName %>',
    allowOutside: true
  }
```

*NOTE:* If you specify `true` in public server, you should specify absolute path to `serve`. Otherwise the user may access to the file that must be hidden from them.

## <a name ="parameters">Parameters</a>

The string `parameter=value` can be specified to `match`. And, the Object which has parameters is passed to Function which specified to `match` and `serve`.  
These parameters are below.

+ `reqPath`  
The path which is requested by user. e.g. `/path/to/file.ext`  
This may be directory. e.g. `/`
+ `reqDir`  
The path to directory which is part of `reqPath`. e.g. `/path/to`  
+ `absPath`  
The absolute path to requested file. e.g. `/var/www/public/path/to/file.ext`  
+ `absDir`  
The absolute path to directory which is part of `absPath`. e.g. `/var/www/public/path/to`  
+ `fileName`  
The file name of requested file. e.g. `file.ext`  
This may be directory name e.g. `to`  
If document-root is requested, this is empty string.
+ `basename`  
The part of file name except file-suffix. (`.` isn't included) e.g. `file`
+ `suffix`  
The part of file name which is extracted file-suffix. (`.` isn't included) e.g. `ext`
+ Request Headers  
The HTTP Request Headers from client. These are lower-cased. e.g. `referer`, `user-agent`, etc.

## Logging

The `logger` included in constructor options is a Logger instance of standard Logging Library (e.g. [log4js](https://github.com/nomiddlename/log4js-node)) which has `info` method or `log` method.

```js
var log4js = require('log4js');
var logger = log4js.getLogger('node-static-alias');
logger.setLevel(log4js.levels.INFO);

var fileServer = new staticAlias.Server('./public' {
  alias: { ... },
  logger: logger
});
```

You can specify simple Object which has `info` method or `log` method (e.g. `console` or `util`).  
Most easy:

```js
var fileServer = new staticAlias.Server('./public' {
  alias: { ... },
  logger: console
  //logger: require('util') // Add timestamp
});
```

Add project name: (But, you probably use your favorite library.)

```js
var fileServer = new staticAlias.Server('./public' {
  alias: { ... },
  logger: {log: function() {
    var util = require('util');
    console.log('[node-static-alias] ' +  util.format.apply(util, arguments));
  }}
});
```

Log message example:

```shell
(/) Requested: "/var/public"
(/file.min.css) Requested: "/var/public/file.min.css"
(/file.min.css) For Serve: "/var/public/file.css" alias[3] match[1] serve[0]
(/file.min.js) Requested: "/var/public/file.min.js"
(/file.min.js) For Serve: "/var/public/file.js" alias[2] match[0] serve[1]
```

The `(path)` is path which is requested by user. The `[number]` means index of Array.

## Release History
 * 2013-12-29			v0.1.0			Initial release.
