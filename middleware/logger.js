const { createLogger, format, transports } = require('winston');
require('winston-mongodb');
const { existsSync, mkdirSync } = require('fs');
const { join, basename } = require('path');
const config = require('./env');

const env = config().env || 'development';
const logDir = 'log';

// Create the log directory if not exits create
if (!existsSync(logDir)) {
    mkdirSync(logDir);
}

const log_filename = join(logDir, 'log_file.log');
const exception_filename = join(logDir, 'exception_file.log');
const db = config().db;
const bname = (process.mainModule) ? process.mainModule.filename : 'UTest' ;

const fixErrors = format(info => {
    // Only modify the info it there was an error
    if (info.metadata === undefined) {
        return info;
    }

    const {message} = info;

    // Get the original error message
    const errorMessage = info[Symbol.for('splat')] &&
        info[Symbol.for('splat')][0] &&
        info[Symbol.for('splat')][0].message;

        // Check that the original error message was concatenated to the message
    if ( errorMessage === undefined ||
        message.length <= errorMessage.length ||
        !message.endsWith(errorMessage)
    ) {
        return info;
    }

    // Slice off the original error message from the log message
    info.message = message.slice(0, errorMessage.length * -1);
    return info;
});

const logger = createLogger({
    level: env === 'production' ? 'info' : 'debug',
    format: format.combine(
        format.label({ label: basename(bname) }),
        format.timestamp({ format: 'YYYY-MM-MM HH:mm:ss'}),
        format.splat(),
        format.json(),
        fixErrors(),
        format.printf(
            info => {
                let out = `${info.timestamp} ${info.level.toUpperCase()} [${info.label}]: ${info.message}`;
                if (info.metadata) {
                    out =  `${info.timestamp} ${info.level.toUpperCase()} [${info.label}]: ${info.message} -> ${info.metadata.stack}`;
                }
                
                return out;
            }
        )
    ),
    transports: [
        new transports.Console({
            handleExceptions: true,
            colorize: true
        }),
        new transports.File({
            filename: log_filename,
            handleExceptions: true,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            colorize: false
        }),
        new transports.MongoDB({
            level: 'error',
            db: db,
            options: { useUnifiedTopology: true},
            collection: 'error_log',
            handleExceptions: true
        })
    ],
    exceptionHandlers: [
        new transports.File({
            filename: exception_filename,
            handleExceptions: true,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            colorize: false
        }),
        new transports.Console({
            handleExceptions: true,
            colorize: true
        })
    ],
    exitOnError: true


});


module.exports = logger;;