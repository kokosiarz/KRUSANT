/* eslint-disable prettier/prettier */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _core = require("@nestjs/core");
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _appmodule = require("./app.module");
const _cookieparser = /*#__PURE__*/ _interop_require_default(require("cookie-parser"));
const _fs = /*#__PURE__*/ _interop_require_wildcard(require("fs"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
async function bootstrap() {
    const app = await _core.NestFactory.create(_appmodule.AppModule, {
        logger: [
            'error',
            'warn',
            'log'
        ],
        abortOnError: false
    });
    app.enableCors({
        origin: 'http://localhost:3001',
        credentials: true
    });
    app.use((0, _cookieparser.default)());
    app.useGlobalPipes(new _common.ValidationPipe({
        whitelist: true
    }));
    const config = new _swagger.DocumentBuilder().setTitle('KRUSANT API').setDescription('API documentation for KRUSANT backend').setVersion('1.0').addBearerAuth().build();
    const document = _swagger.SwaggerModule.createDocument(app, config);
    _swagger.SwaggerModule.setup('docs', app, document);
    // Export OpenAPI schema to JSON file
    _fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
    _fs.writeFileSync('../frontend/backend_openapi.json', JSON.stringify(document, null, 2));
    console.log('OpenAPI schema exported to openapi.json');
    await app.listen(3002);
    console.log(`Application is running on: ${await app.getUrl()}`);
    console.log(`Swagger docs available at: ${await app.getUrl()}/docs`);
}
bootstrap().catch((err)=>{
    console.error('Failed to start application:', err);
    process.exit(1);
});

//# sourceMappingURL=main.js.map