// Inspired from Apex: https://github.com/apex/apex/blob/master/shim/index.js
console.log('[shim] start function');
var child = require('child_process');

const jh = process.env.JUMP_HOST;
const jhPort = process.env.JUMP_HOST_PORT;
const jhUser = process.env.JUMP_HOST_USER;
const keyPath = process.env.KEY_PATH;
const port = process.env.PORT;
const tunnelPort = process.env.TUNNEL_PORT;

const proc = child.spawn('/opt/bin/faassh',
    `-i ${keyPath} -port ${port} tunnel -jh ${jh} -jh-user ${jhUser} -jh-port ${jhPort} -tunnel-port ${tunnelPort}`.split(' '));

proc.on('error', function(err){
  console.error('[shim] error: %s', err)
  process.exit(1)
})

proc.on('exit', function(code, signal){
  console.error('[shim] exit: code=%s signal=%s', code, signal)
  process.exit(1)
});

proc.stderr.on('data', function(line){
  console.error('[faassh] data from faassh: `%s`', line)
});

proc.stdout.on('data', function(line){
  console.log('[faassh] data from faassh: `%s`', line)
});

exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    // TODO: Don't kill the process, just close the session.
    setInterval(() => {
        var timeRemaining = context.getRemainingTimeInMillis();
        if (timeRemaining < 2000) {
            console.log(`Less than ${timeRemaining}ms left before timeout. Shutting down...`);
            proc.kill('SIGINT');
        }
    }, 500);
};
