# 로깅

로깅은 기본적으로 비활성화되어 있지만 Fastify 인스턴스를 만들 때 `{ logger: true }` 혹은 `{ logger: { level: 'info' } }`를 통해 활성화할 수 있습니다.
로거가 비활성화되어 있다면 런타임에서 활성화할 방법은 없다는 점을 명심하세요.
저희는 이 작업에 대해 [abstract-logging](https://www.npmjs.com/package/abstract-logging)을 사용합니다.

Fastify가 성능에 초점을 맞추었듯, [pino](https://github.com/pinojs/pino)를 기본값 로그 레벨로 사용을 하고 활성화되면 `'info'`로 설정됩니다.

로거를 활성화하는 것은 굉장히 쉽습니다:

```js
const fastify = require('fastify')({
  logger: true
})

fastify.get('/', options, function (request, reply) {
  request.log.info('현재 요청에 대한 몇 가지 정보')
  reply.send({ hello: 'world' })
})
```

라우팅 핸들러 외부에서 Fastify 인스턴스의 Pino 인스턴스를 사용하여 새로운 로그를 발생시킬 수도 있습니다:
```js
fastify.log.info('뭔가 중요한 일이 발생했어요!');
```

만약 로거에 몇몇 옵션을 전달하고자 한다면 그것을 그저 단순히 Fastify에 전달시킬 수 있습니다.
그리고 모든 사용가능한 옵션을 [Pino 문서](https://github.com/pinojs/pino/blob/master/docs/api.md#pinooptions-stream)에서 찾을 수 있습니다.
만약 특정 파일 위치를 가리키고 싶으시다면, 다음을 사용하세요:

```js
const fastify = require('fastify')({
  logger: {
    level: 'info',
    file: '/path/to/file' // pino.destination()을 사용할 것입니다!
  }
})

fastify.get('/', options, function (request, reply) {
  request.log.info('현재 요청에 관한 몇 가지 정보')
  reply.send({ hello: 'world' })
})
```

만약 Pino 인스턴스에 특정 스트림을 전달하고 싶으시다면, 그저 로거 객체에 stream 필드를 추가하기만 해도 됩니다.

```js
const split = require('split2')
const stream = split(JSON.parse)

const fastify = require('fastify')({
  logger: {
    level: 'info',
    stream: stream
  }
})
```

<a name="logging-request-id"></a>

기본적으로 Fastify는 더 쉬운 트래킹을 위해서 모든 요청에 ID를 할당합니다.
만약 `request-id` 헤더가 존재한다면 그 값이 사용될 것이며 그렇지 않으면 새로운 증분 ID가 생성될 것입니다.
직접 옵션을 지정하시려면 Fastify Factory [`requestIdHeader`](Server.md#factory-request-id-header)와 [`genReqId`](Server.md#genreqid)를 참조해주세요.

이 기본 로거는 `req`, `res`, 그리고 `err` 프로퍼티를 직렬화하는 표준 직렬화기들을 사용하도록 설정되어 있습니다.
`req`로 받아지는 객체는 Fastify [`요청`](Request.md) 객체이며, `res`는 Fastify [`응답`](Reply.md) 객체입니다.
이 동작은 직접 직렬화기를 지정하므로써 변경될 수 있습니다.
```js
const fastify = require('fastify')({
  logger: {
    serializers: {
      req (request) {
        return { url: request.url }
      }
    }
  }
})
```
예를 들어 응답 본문과 헤더는 다음과 같은 접근으로 로깅될 수 있을 것입니다 (이것이 *권장되지 않더라도*):

```js
const fastify = require('fastify')({
  logger: {
    prettyPrint: true,
    serializers: {
      res (reply) {
        // 기본값
        return {
          statusCode: reply.statusCode
        }
      },
      req (request) {
        return {
          method: request.method,
          url: request.url,
          path: request.path,
          parameters: request.parameters,
          // 로그에 헤더를 포함하는 것은 GDPR과 같은 개인정보 보호법을 위반할 수 있습니다.
          // 반드시 "redact" 옵션을 통해 개인정보가 포함된 필드를 삭제해야 합니다.
          // 이것은 또한 인증 정보를 로그에 흘릴 수도 있다는 것을 의미합니다.
          headers: request.headers
        };
      }
    }
  }
});
```
**참고**: 본문(body)은 `req` 메서드 안에서 직렬화될 수 없는데 이것은 저희가 하위 로거를 생성할 때 요청이 직렬화되기 때문입니다.
또 이 시간에 본문은 파싱되지 않습니다.

`req.body`를 로깅하기 위한 접근을 살펴보세요:

```js
app.addHook('preHandler', function (req, reply, done) {
  if (req.body) {
    req.log.info({ body: req.body }, 'parsed body')
  }
  done()
})
```

*Pino가 아닌 모든 로거는 아래 옵션을 무시할 것입니다.*

또한 자신만의 로거 인스턴스를 설정할 수도 있습니다.
설정 옵션을 전달하는 대신 인스턴스 자체를 전달하세요.
직접 제공할 로거는 반드시 Pino 인터페이스에 맞추어져야 합니다; 이 말인 즉슨, 반드시 다음 메서드를 가지고 있어야 한다는 것을 뜻합니다:
`info`, `error`, `debug`, `fatal`, `warn`, `trace`, `child`.

예시:

```js
const log = require('pino')({ level: 'info' })
const fastify = require('fastify')({ logger: log })

log.info('요청 정보를 가지고 있지 않습니다.')

fastify.get('/', function (request, reply) {
  request.log.info('요청 정보를 가지고 있으나, `log`와 같은 인스턴스입니다.')
  reply.send({ hello: 'world' })
})
```

*현재 요청에 대한 로거 인스턴스는 [라이프사이클](Lifecycle.md)의 모든 부분에서 사용 가능합니다.*

## 로그 변조

[Pino](https://getpino.io)는 이미 기록된 로그의 특정 값을 지우는 낮은 오버헤드의 로그 변조를 지원합니다.
예를 들어서 저희가 보안이 염려되는 `Authorization` 헤더를 제외한 모든 헤더를 로깅하고 싶을 수도 있습니다.

```js
const fastify = Fastify({
  logger: {
    stream: stream,
    redact: ['req.headers.authorization'],
    level: 'info',
    serializers: {
      req (request) {
        return {
          method: request.method,
          url: request.url,
          headers: request.headers,
          hostname: request.hostname,
          remoteAddress: request.ip,
          remotePort: request.socket.remotePort
        }
      }
    }
  }
})
```

더 많은 정보는 https://getpino.io/#/docs/redaction 를 참조해주세요.
