import winston from "winston";
import Transport from 'winston-transport';

const customLevels = {
    levels: {
        incode: 6,
        trace: 5,
        debug: 4,
        info: 3,
        warn: 2,
        error: 1,
        fatal: 0,
    },
    colors: {
        trace: 'white',
        debug: 'green',
        info: 'green',
        warn: 'yellow',
        error: 'red',
        fatal: 'red',
    },
};

const formatter = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.splat(),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info;
        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
    }),
);

class SimpleConsole extends Transport {
    name: string;

    constructor(options: any = {}) {
        super(options);
        this.name = 'incode';
    }

    log(info: any, callback: any) {
        setImmediate(() => this.emit('logged', info));

        const MESSAGE = Symbol.for('message');
        console.log(info[MESSAGE]);

        if (callback) {
            callback();
        }
    }
};


class Logger {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: 'incode',
            levels: customLevels.levels,
            transports: [
                new SimpleConsole({}),
                new (winston.transports.File)({ filename: 'app.log'})
            ]
        })
    }

    trace(msg: any, meta?: any) {
        this.logger.log('trace', msg, meta);
    }

    debug(msg: any, meta?: any) {
        this.logger.debug(msg, meta, () => { });
    }

    info(msg: any, meta?: any) {
        this.logger.info(msg, meta, () => { });
    }

    warn(msg: any, meta?: any) {
        this.logger.warn(msg, meta, () => { });
    }

    error(msg: any, meta?: any) {
        this.logger.error(msg, meta, () => { });
    }

    fatal(msg: any, meta?: any) {
        this.logger.log('fatal', msg, meta);
    }
}


export const logger = new Logger();