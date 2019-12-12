var http = require('http');
var fs = require('fs');
const { spawn } = require('child_process');

var redisStatus = "N/A";
var redisActiveStatus = "N/A";
var redisSubStatus = "N/A";
var openPortsLog = "N/A";
var cpuLog = "N/A";
var url = "N/A";
var hostname = "N/A";

function updateOpenPortsLog() {
  const systemctl = spawn('sudo', ['netstat', '-tulpn', '|', 'grep', 'LISTEN']);

  systemctl.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    openPortsLog = data.toString().replace('\n', '<br>\n');
  });

  systemctl.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  systemctl.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

function updateCPULog() {
  const systemctl = spawn('sh', ['-c', 'top -n 1 -b -o %CPU | head -n 15']);

  systemctl.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    cpuLog = data.toString();
  });

  systemctl.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    cpuLog = data;
  });

  systemctl.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

function updateHostname() {
  const systemctl = spawn('hostname');
  // systemctl show -p ActiveState --value redis-status-web
  // systemctl show -p SubState --value redis-status-web

  systemctl.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    hostname = data.toString().replace('\n', '');
  });

  systemctl.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  systemctl.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

function updateRedisStatus() {
  const systemctl = spawn('systemctl', ['status', 'redis']);
  // systemctl show -p ActiveState --value redis-status-web
  // systemctl show -p SubState --value redis-status-web

  systemctl.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    redisStatus = data.toString().replace('\n', '<br>\n');
  });

  systemctl.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  systemctl.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

function updateRedisActiveStatus() {
  // systemctl show -p ActiveState --value  redis
  const systemctl = spawn('systemctl', ['show', '-p', 'ActiveState', '--value', 'redis']);

  systemctl.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    redisActiveStatus = data.toString();
  });

  systemctl.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  systemctl.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

function updateRedisSubStatus() {
  // systemctl show -p SubState --value  redis
  const systemctl = spawn('systemctl', ['show', '-p', 'SubState', '--value', 'redis']);

  systemctl.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    redisSubStatus = data.toString();
  });

  systemctl.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  systemctl.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};

function setHtmlValue(html, tag, value) {
  html = html.toString().replace(new RegExp(tag, 'g'), value);
  return html;
}

function parseHtml(html) {
  var parsedHtml = html;
  parsedHtml = setHtmlValue(parsedHtml, "{redisActiveStatus}", redisActiveStatus);
  parsedHtml = setHtmlValue(parsedHtml, "{redisSubStatus}", redisSubStatus);
  parsedHtml = setHtmlValue(parsedHtml, "{redisStatus}", redisStatus);
  parsedHtml = setHtmlValue(parsedHtml, "{openPortsLog}", openPortsLog);
  parsedHtml = setHtmlValue(parsedHtml, "{cpuLog}", cpuLog);
  parsedHtml = setHtmlValue(parsedHtml, "{url}", url);
  parsedHtml = setHtmlValue(parsedHtml, "{hostname}", hostname);
  return parsedHtml;
}

function writeCss(response) {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  fs.readFile('./css/main.css', null, function (error, css) {
    if (error) {
      response.writeHead(404);
      response.write('file not found');
    } 
    else {
      response.write(css);
    }
    response.end();
  });
}

function writeHtmlPage(response, pagePath) {
  response.writeHead(200, { 'Content-Type': 'text/html' });

  fs.readFile(pagePath, null, function (error, html) {
    if (error) {
      response.writeHead(404);
      response.write('file not found');
    } else {
      response.write(parseHtml(html));
    }
    response.end();
  });
}

function writeRedisHealth(response) {
  if(redisActiveStatus.trim().toLocaleLowerCase() == "inactive" || redisActiveStatus.trim().toLocaleLowerCase() == "deactivating") {
    response.writeHead(503, { 'Content-Type': 'application/json' });
    var jsonStatus = JSON.stringify({ status : "Unavailable"});
    response.end(jsonStatus);
  }
  else {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    var jsonStatus = JSON.stringify({ status : "OK"});
    response.end(jsonStatus);
  }  
}

http.createServer(function (request, response) {
  updateHostname();
  updateRedisStatus();
  updateRedisActiveStatus();
  updateRedisSubStatus();
  updateOpenPortsLog();
  updateCPULog();
  url = request.url;
  //writeCss(response)
  if(url == '/redis-health')
    writeRedisHealth(response);
  else
    writeHtmlPage(response, './html/index.html');
}).listen(8081);

console.log('Server running at port 8081/');


