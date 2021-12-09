# 미들웨어

Fastify v3.0.0부터, 미들웨어는 더 이상 그 자체만으로는 지원되지 않으며 [`fastify-express`](https://github.com/fastify/fastify-express)나 [`middle`](https://github.com/fastify/middie)과 같은 외부 플러그인을 필요로 합니다.

[`fastify-express`](https://github.com/fastify/fastify-express) 플러그인으로 Express 미들웨어를 `사용`하는 예제입니다:

```js
await fastify.register(require('fastify-express'))
fastify.use(require('cors')())
fastify.use(require('dns-prefetch-control')())
fastify.use(require('frameguard')())
fastify.use(require('hsts')())
fastify.use(require('ienoopen')())
fastify.use(require('x-xss-protection')())
```

또한 당신은 간단히 향상된 성능을 가졌으며 Express 스타일의 미들웨어 지원을 제공하는 [`middle`](https://github.com/fastify/middle)을 사용할 수 있습니다.

```js
await fastify.register(require('middie'))
fastify.use(require('cors')())
```

미들웨어는 캡슐화될 수 있음을 기억하세요; 이것은 [플러그인 가이드](Plugins-Guide.md)에 서술된 것처럼 `register`를 통해 어디에서 미들웨어가 실행되어야 하는지 결정할 수 있음을 의미합니다.

Fastify 미들웨어는 `send` 메서드나 Fastify [응답](Reply.md#reply) 인스턴스에 서술된 메서드를 노출하지 않습니다.
이것은 Fastify가 들어오는 `req`와 `res` 노드 인스턴스를 [요청](Request.md#request)과 [응답](Reply.md#reply)을 통하여 내부적으로 감싸기 때문인데 이것은 미들웨어 실행 이후에 완료되기 때문입니다.
만약 당신이 미들웨어를 만들어야 한다면, 노드의 `req`와 `res` 인스턴스를 사용해야 합니다.
이렇게 하고 싶지 않다면 `preHandler` 훅을 통해 이미 존재하는 [요청](Request.md#request)과 [응답](Reply.md#reply) Fastify 인스턴스를 사용할 수 있습니다.
더 많은 정보는 [훅](Hooks.md#hooks)을 살펴보시기 바랍니다.
<a name="restrict-usage"></a>

#### 미들웨어가 특정 경로에서만 실행되게 하기
만약 당신이 특정 경로에서만 미들웨어를 실행되게 하고자 한다면 단순히 `use`의 첫 번째 파라메터에 경로를 제공하면 됩니다!

*이것은 파라메터를 가진 라우팅을 지원하지 않는다는 점을 참고하세요, (예를 들어 `/user/:id/comments`)와 와일드카드는 다중 경로에서 지원되지 않을 것입니다.*

```js
const path = require('path')
const serveStatic = require('serve-static')

// 단일 경로
fastify.use('/css', serveStatic(path.join(__dirname, '/assets')))

// 와일드카드 경로
fastify.use('/css/(.*)', serveStatic(path.join(__dirname, '/assets')))

// 다중 경로
fastify.use(['/css', '/js'], serveStatic(path.join(__dirname, '/assets')))
```

### 대체제

Fastify는 널리 사용되는 미들웨어에 대해 몇 가지 대체제를 제공하고 있습니다.
[`fastify-helmet`](https://github.com/fastify/fastify-helmet)은 [`helmet`](https://github.com/helmetjs/helmet), [`fastify-cors`](https://github.com/fastify/fastify-cors)은 [`cors`](https://github.com/expressjs/cors), 그리고 [`fastify-static`](https://github.com/fastify/fastify-static)은 [`serve-static`](https://github.com/expressjs/serve-static)로 대체될 수 있습니다.
