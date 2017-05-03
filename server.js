(function () {

    'use strict';

    var PORT = 5000,
        PROXY_URL = 'https://api.vk.com',
        LONG_POLL_URL = 'https://newimv4.vk.com',
        PHOTO_UPLOAD_URL = 'https://pu.vk.com/';

    var http = require('http'),
        url = require('url'),
        path = require('path'),
        fs = require('fs'),
        request = require('request'),
        mime = require('mime'),
        bodyParser = require('body-parser');

    var server = http.createServer(function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Request-Method', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        res.setHeader('Access-Control-Allow-Headers', '*');

        var urlData = url.parse(req.url),
            theUrl = urlData.pathname,
            someFileName = path.join(process.cwd(), theUrl);

        res.on('error', function (err) {
            console.log(err);
        });

        if (~theUrl.indexOf('method') || ~theUrl.indexOf('access_token')) {
            var proxyUrl = PROXY_URL + theUrl + (urlData.search || '');
            var proxyStream = request(proxyUrl);
            proxyStream.on('error', function (e) {
                console.log(e);
                res.end();
                proxyStream.destroy();
            });

            req.pipe(proxyStream).pipe(res);

            req.on('close', function () {
                proxyStream.destroy();
                res.destroy();
            });

        } else if (~theUrl.indexOf('nim0800')) {
            var proxyUrl = LONG_POLL_URL + theUrl + (urlData.search || '');
            var proxyStream = request(proxyUrl);
            proxyStream.on('error', function (e) {
                res.end();
                proxyStream.destroy();
            });

            req.pipe(proxyStream).pipe(res);

            req.on('close', function () {
                proxyStream.destroy();
                res.destroy();
            });
        } else if (~theUrl.indexOf('pu.vk.com')) {

            var proxyUrl = theUrl.substr(1, theUrl.length) + (urlData.search || '');
            var proxyStream = request.post(proxyUrl);

            proxyStream.on('error', function (e) {
                res.end();
                proxyStream.destroy();
            });

            req.pipe(proxyStream).pipe(res);

            req.on('close', function () {
                proxyStream.destroy();
                res.destroy();
            });

        } else {

            if (theUrl === '/') {
                someFileName += 'web/index.html';
            }
            if (theUrl === '/messages' || theUrl === '/friends' || theUrl === '/photos' || theUrl === '/news') {
                someFileName = 'web/index.html';
            }
            if (theUrl === '/stylesheets/app.css') {
                someFileName = 'web/css/app.css';
            }

            fs.exists(someFileName, function (exists) {
                var type = mime.lookup(someFileName);
                if (!exists) {
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    res.write('404 Nothing Here\n');
                    res.end();
                    return;
                }
                fs.readFile(someFileName, 'binary', function (err, file) {
                    if (err) {
                        res.writeHead(500, {'Content-Type': 'text/plain'});
                        res.write(err + '\n');
                        res.end();
                        return;
                    }

                    res.writeHead(200, {'Content-Type': type});
                    res.write(file, 'binary');
                    res.end();
                });
            });
        }
    });

    server.listen(PORT);

    console.log('Server running at http://localhost:' + PORT);

    server.on('error', function () {
        server.listen(PORT);
    });
}());

