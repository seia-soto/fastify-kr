# HTTP2

_Fastify_는 플래그없이 HTTPS2 기능을 가지고 있는 Node.JS 8 LTS부터 **실험적으로** HTTP2를 지원합니다;
HTTP2는 HTTPS 혹은 평문으로도 제공됩니다.

현재, _Fastify_에서 HTTP2 전용의 API는 제공하고 있지 않지만 저희의 `Request`와 `Reply` 인터페이스를 통하여 Node.JS의 `req`와 `res`에 직접적으로 접근할 수 있습니다.
PR은 환영이예요.

### 보안됨 (HTTPS)

HTTP2는 모든 최신 웹 브라우저에서 __보안 연결 위에서__ 지원됩니다:

```js
'use strict'

const fs = require('fs')
const path = require('path')
const fastify = require('fastify')({
  http2: true,
  https: {
    key: fs.readFileSync(path.join(__dirname, '..', 'https', 'fastify.key')),
    cert: fs.readFileSync(path.join(__dirname, '..', 'https', 'fastify.cert'))
  }
})

fastify.get('/', function (request, reply) {
  reply.code(200).send({ hello: 'world' })
})

fastify.listen(3000)
```

ALPN 협상 방식은 동일 소켓에서 HTTPS와 HTTP/2 모두 지원되도록 해줍니다.
Node.JS의 핵심 `req`와 `res` 객체들은 [HTTP/1](https://nodejs.org/api/http.html)과 [HTTP/2](https://nodejs.org/api/http2.html) 그 어떠한 것도 될 수 있습니다.
_Fastify_는 별다른 설정없이도 지원합니다:

```js
'use strict'

const fs = require('fs')
const path = require('path')
const fastify = require('fastify')({
  http2: true,
  https: {
    allowHTTP1: true, // HTTP1 지원 추가
    key: fs.readFileSync(path.join(__dirname, '..', 'https', 'fastify.key')),
    cert: fs.readFileSync(path.join(__dirname, '..', 'https', 'fastify.cert'))
  }
})

// 이 라우팅은 모든 프로토콜에서 접근 가능합니다
fastify.get('/', function (request, reply) {
  reply.code(200).send({ hello: 'world' })
})

fastify.listen(3000)
```

새로운 서버를 아래 명령어로 테스트해보세요:

```
$ npx h2url https://localhost:3000
```

### 평문 혹은 비보안

만약 마이크로서비스를 만들고 있다면 HTTP2를 평문으로 연결할 수 있습니다.
하지만 이것은 웹 브라우저들에서는 지원되지 않습니다.

```js
'use strict'

const fastify = require('fastify')({
  http2: true
})

fastify.get('/', function (request, reply) {
  reply.code(200).send({ hello: 'world' })
})

fastify.listen(3000)
```

새로운 서버를 아래의 명령어로 테스트해보세요:

```
$ npx h2url http://localhost:3000
```
