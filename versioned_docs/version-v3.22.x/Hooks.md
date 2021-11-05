# 훅

훅은 `fastify.addHook` 메서드로 등록될 수 있으며 애플리케이션이나 요청/응답 생명 주기의 특정 이벤트를 들을 수 있게 해줍니다.
훅을 이벤트 전에 등록하지 않으면 이벤트는 소실될 것입니다.

이러한 훅을 사용하므로써 Fastify의 생명 주기와 직접적으로 상호작용할 수 있습니다.
애플리케이션과 요청/응답 훅 모두 사용 가능합니다:

- [요청/응답 훅](#requestreply-hooks)
  - [onRequest](#onrequest)
  - [preParsing](#preparsing)
  - [preValidation](#prevalidation)
  - [preHandler](#prehandler)
  - [preSerialization](#preserialization)
  - [onError](#onerror)
  - [onSend](#onsend)
  - [onResponse](#onresponse)
  - [onTimeout](#ontimeout)
  - [훅에서의 오류 관리](#manage-errors-from-a-hook)
  - [훅에서 응답하기](#respond-to-a-request-from-a-hook)
- [애플리케이션 훅](#application-hooks)
  - [onReady](#onready)
  - [onClose](#onclose)
  - [onRoute](#onroute)
  - [onRegister](#onregister)
- [스코프](#scope)
- [라우팅 단위 훅](#route-level-hooks)

**알림:** `done` 콜백은 `async`/`await`을 사용할 때 혹은 `Promise`를 반환할 때 사용가능하지 않습니다.
먄약에 `done` 콜백을 이러한 상황에서 호출하면 예상치 못한 동작이 발생할 수 있습니다. 예) 핸들러의 중복 호출

## 요청/응답 훅

[요청](Request.md)과 [응답](Reply.md)는 Fastify 핵심 객체들입니다.<br/>
`done`은 [생명 주기](Lifecycle.md)를 지속하기 위한 함수입니다.

[생명 주기 페이지](Lifecycle.md)에서 각각의 훅이 어디에서 실행되는지 이해하기가 쉽습니다.<br/>
훅은 Fastify의 캡슐화에 의해 영향을 받으며 선택적으로 라우팅에 적용될 수 있습니다.
더 많은 정보를 확인하려면 [스코프](#scope) 섹션을 참고하세요.

요청/응답에는 8개의 다른 사용가능한 훅이 있습니다 *(순서대로)*:

### onRequest
```js
fastify.addHook('onRequest', (request, reply, done) => {
  // 코드 몇 줄
  done()
})
```
또는 `async/await`:
```js
fastify.addHook('onRequest', async (request, reply) => {
  // 코드 몇 줄
  await asyncMethod()
})
```

**알림:** [onRequest](#onrequest) 훅에서는 본문 파싱이 [preValidation](#prevalidation) 훅 전에 일어나므로 `request.body`가 언제나 `null`입니다.

### preParsing

만약 `preParsing` 훅을 사용하고 있으시다면 요청 본문 스트림을 파싱되기 전에 변경할 수 있습니다.
이 훅은 다른 훅과 마찬가지로 요청과 응답 객체를 받고 또 현재 요청 본문의 스트림을 받습니다.

만약 값을 반환할 경우(`return` 또는 콜백 함수를 통해), 반드시 스트림을 반환해야 합니다.

예를 들어, 요청 본문을 압축 해제할 수 있습니다:

```js
fastify.addHook('preParsing', (request, reply, payload, done) => {
  // 코드 몇 줄
  done(null, newPayload)
})
```
또는 `async/await`:
```js
fastify.addHook('preParsing', async (request, reply, payload) => {
  // 코드 몇 줄
  await asyncMethod()
  return newPayload
})
```

**안내:** [preParsing](#preparsing) 훅에서는 본문 파싱이 [preValidation](#prevalidation) 훅 전에 일어나므로 `request.body`가 언제나 `null`이 될 것입니다.

**안내:** 또한 반드시 `receivedEncodedLength` 속성을 반환하는 스트림에 추가해야 합니다. 이 속성은 요청 본문이 `Content-Length` 헤더 값과 일치하는지 확인하는데에 사용됩니다.

**안내:** 파서에 대한 `function (request, reply, done)`과 `async function (request, reply)`와 같은 오래된 문법들은 여전히 지원되지만 더 이상 사용되지는 않습니다.

### preValidation

만약 `preValidation` 훅을 사용하고 있으시다면 본문이 검증되기 전에 변경해야 합니다.
예를 들어:

```js
fastify.addHook('preValidation', (request, reply, done) => {
  request.body = { ...request.body, importantKey: 'randomString' }
  done()
})
```
또는 `async/await`:
```js
fastify.addHook('preValidation', async (request, reply) => {
  const importantKey = await generateRandomString()
  request.body = { ...request.body, importantKey }
})
```

### preHandler

```js
fastify.addHook('preHandler', (request, reply, done) => {
  // 코드 몇 줄
  done()
})
```
또는 `async/await`:
```js
fastify.addHook('preHandler', async (request, reply) => {
  // 코드 몇 줄
  await asyncMethod()
})
```

### preSerialization

만약 `preSerialization` 훅을 사용하고 있으시다면 응답 본문이 직렬화되기 전에 변경 (혹은 대체)할 수 있습니다.
예를 들어:

```js
fastify.addHook('preSerialization', (request, reply, payload, done) => {
  const err = null
  const newPayload = { wrapped: payload }
  done(err, newPayload)
})
```
또는 `async/await`:
```js
fastify.addHook('preSerialization', async (request, reply, payload) => {
  return { wrapped: payload }
})
```

안내: 이 훅은 응답 본문이 `string`, `Buffer`, `stream`, 혹은 `null`이면 실행되지 않습니다.

### onError
```js
fastify.addHook('onError', (request, reply, error, done) => {
  // 코드 몇 줄
  done()
})
```
또는 `async/await`:
```js
fastify.addHook('onError', async (request, reply, error) => {
  // 직접 오류 로깅을 하는데에 효과적입니다
  // 오류를 업데이트하는데에는 이 훅을 사용해서는 안 됩니다
})
```

이 훅은 직접 오류 로깅을 해야 하거나 오류에 따라 몇 가지 헤더를 추가하려는 경우 유용합니다.<br/>
이것은 오류를 변경하기 위하지 않으며 `reply.send`를 호출하는 것은 예외를 발생시킬 것입니다.<br/>
또 훅은 `customErrorHandler`가 실행될 후에 `customErrorHandler`가 오류를 다시 사용자에게 전달해야만 실행될 것입니다.
*(기본 `customErrorHandler`는 언제나 사용자에게 오류를 전달하고 있음을 명심해주세요)*<br/>
**안내:** 다른 훅들과 달리 `done` 함수로 오류를 전달하는 것은 지원되지 않습니다.

### onSend
`onSend` 훅을 사용하는 경우 응답 본문을 변경할 수 있습니다.
예를 들어:

```js
fastify.addHook('onSend', (request, reply, payload, done) => {
  const err = null;
  const newPayload = payload.replace('some-text', 'some-new-text')
  done(err, newPayload)
})
```
또는 `async/await`:
```js
fastify.addHook('onSend', async (request, reply, payload) => {
  const newPayload = payload.replace('some-text', 'some-new-text')
  return newPayload
})
```

또한 응답 본문을 없애거나 비우기 위해 본문을 `null`로 교체할 수 있습니다:

```js
fastify.addHook('onSend', (request, reply, payload, done) => {
  reply.code(304)
  const newPayload = null
  done(null, newPayload)
})
```

> You can also send an empty body by replacing the payload with the empty string `''`, but be aware that this will cause the `Content-Length` header to be set to `0`, whereas the `Content-Length` header will not be set if the payload is `null`.

Note: If you change the payload, you may only change it to a `string`, a `Buffer`, a `stream`, or `null`.


### onResponse
```js

fastify.addHook('onResponse', (request, reply, done) => {
  // Some code
  done()
})
```
Or `async/await`:
```js
fastify.addHook('onResponse', async (request, reply) => {
  // Some code
  await asyncMethod()
})
```

The `onResponse` hook is executed when a response has been sent, so you will not be able to send more data to the client. It can however be useful for sending data to external services, for example, to gather statistics.

### onTimeout

```js

fastify.addHook('onTimeout', (request, reply, done) => {
  // Some code
  done()
})
```
Or `async/await`:
```js
fastify.addHook('onTimeout', async (request, reply) => {
  // Some code
  await asyncMethod()
})
```
`onTimeout` is useful if you need to monitor the request timed out in your service (if the `connectionTimeout` property is set on the Fastify instance). The `onTimeout` hook is executed when a request is timed out and the HTTP socket has been hanged up. Therefore ,you will not be able to send data to the client.


### Manage Errors from a hook
If you get an error during the execution of your hook, just pass it to `done()` and Fastify will automatically close the request and send the appropriate error code to the user.

```js
fastify.addHook('onRequest', (request, reply, done) => {
  done(new Error('Some error'))
})
```

If you want to pass a custom error code to the user, just use `reply.code()`:
```js
fastify.addHook('preHandler', (request, reply, done) => {
  reply.code(400)
  done(new Error('Some error'))
})
```
*The error will be handled by [`Reply`](Reply.md#errors).*

Or if you're using `async/await` you can just throw an error:
```js
fastify.addHook('onResponse', async (request, reply) => {
  throw new Error('Some error')
})
```

### Respond to a request from a hook

If needed, you can respond to a request before you reach the route handler,
for example when implementing an authentication hook.
Replying from a hook implies that the hook chain is __stopped__ and
the rest of the hooks and handlers are not executed. If the hook is
using the callback approach, i.e. it is not an `async` function or it
returns a `Promise`, it is as simple as calling `reply.send()` and avoiding
calling the callback. If the hook is `async`, `reply.send()` __must__ be
called _before_ the function returns or the promise resolves, otherwise, the
request will proceed. When `reply.send()` is called outside of the
promise chain, it is important to `return reply` otherwise the request
will be executed twice.

It is important to __not mix callbacks and `async`/`Promise`__, otherwise
the hook chain will be executed twice.

If you are using `onRequest` or `preHandler` use `reply.send`.

```js
fastify.addHook('onRequest', (request, reply, done) => {
  reply.send('Early response')
})

// Works with async functions too
fastify.addHook('preHandler', async (request, reply) => {
  await something()
  reply.send({ hello: 'world' })
  return reply // optional in this case, but it is a good practice
})
```

If you want to respond with a stream, you should avoid using an `async` function for the hook. If you must use an `async` function, your code will need to follow the pattern in [test/hooks-async.js](https://github.com/fastify/fastify/blob/94ea67ef2d8dce8a955d510cd9081aabd036fa85/test/hooks-async.js#L269-L275).

```js
fastify.addHook('onRequest', (request, reply, done) => {
  const stream = fs.createReadStream('some-file', 'utf8')
  reply.send(stream)
})
```

If you are sending a response without `await` on it, make sure to always
`return reply`:

```js
fastify.addHook('preHandler', async (request, reply) => {
  setImmediate(() => { reply.send('hello') })

  // This is needed to signal the handler to wait for a response
  // to be sent outside of the promise chain
  return reply
})

fastify.addHook('preHandler', async (request, reply) => {
  // the fastify-static plugin will send a file asynchronously,
  // so we should return reply
  reply.sendFile('myfile')
  return reply
})
```

## Application Hooks

You can hook into the application-lifecycle as well.

- [onReady](#onready)
- [onClose](#onclose)
- [onRoute](#onroute)
- [onRegister](#onregister)

### onReady
Triggered before the server starts listening for requests and when `.ready()` is invoked. It cannot change the routes or add new hooks.
Registered hook functions are executed serially.
Only after all `onReady` hook functions have completed will the server start listening for requests.
Hook functions accept one argument: a callback, `done`, to be invoked after the hook function is complete.
Hook functions are invoked with `this` bound to the associated Fastify instance.

```js
// callback style
fastify.addHook('onReady', function (done) {
  // Some code
  const err = null;
  done(err)
})

// or async/await style
fastify.addHook('onReady', async function () {
  // Some async code
  await loadCacheFromDatabase()
})
```

<a name="on-close"></a>

### onClose
Triggered when `fastify.close()` is invoked to stop the server. It is useful when [plugins](Plugins.md) need a "shutdown" event, for example, to close an open connection to a database.<br/>
The first argument is the Fastify instance, the second one the `done` callback.
```js
fastify.addHook('onClose', (instance, done) => {
  // Some code
  done()
})
```

<a name="on-route"></a>

### onRoute
Triggered when a new route is registered. Listeners are passed a `routeOptions` object as the sole parameter. The interface is synchronous, and, as such, the listeners are not passed a callback. This hook is encapsulated.
```js
fastify.addHook('onRoute', (routeOptions) => {
  //Some code
  routeOptions.method
  routeOptions.schema
  routeOptions.url // the complete URL of the route, it will include the prefix if any
  routeOptions.path // `url` alias
  routeOptions.routePath // the URL of the route without the prefix
  routeOptions.bodyLimit
  routeOptions.logLevel
  routeOptions.logSerializers
  routeOptions.prefix
})
```

If you are authoring a plugin and you need to customize application routes, like modifying the options or adding new route hooks, this is the right place.

```js
fastify.addHook('onRoute', (routeOptions) => {
  function onPreSerialization(request, reply, payload, done) {
    // Your code
    done(null, payload)
  }
  // preSerialization can be an array or undefined
  routeOptions.preSerialization = [...(routeOptions.preSerialization || []), onPreSerialization]
})
```

<a name="on-register"></a>

### onRegister
Triggered when a new plugin is registered and a new encapsulation context is created. The hook will be executed **before** the registered code.<br/>
This hook can be useful if you are developing a plugin that needs to know when a plugin context is formed, and you want to operate in that specific context, thus this hook is encapsulated.<br/>
**Note:** This hook will not be called if a plugin is wrapped inside [`fastify-plugin`](https://github.com/fastify/fastify-plugin).
```js
fastify.decorate('data', [])

fastify.register(async (instance, opts) => {
  instance.data.push('hello')
  console.log(instance.data) // ['hello']

  instance.register(async (instance, opts) => {
    instance.data.push('world')
    console.log(instance.data) // ['hello', 'world']
  }, { prefix: '/hola' })
}, { prefix: '/ciao' })

fastify.register(async (instance, opts) => {
  console.log(instance.data) // []
}, { prefix: '/hello' })

fastify.addHook('onRegister', (instance, opts) => {
  // Create a new array from the old one
  // but without keeping the reference
  // allowing the user to have encapsulated
  // instances of the `data` property
  instance.data = instance.data.slice()

  // the options of the new registered instance
  console.log(opts.prefix)
})
```

<a name="scope"></a>

## Scope
Except for [onClose](#onclose), all hooks are encapsulated. This means that you can decide where your hooks should run by using `register` as explained in the [plugins guide](Plugins-Guide.md). If you pass a function, that function is bound to the right Fastify context and from there you have full access to the Fastify API.

```js
fastify.addHook('onRequest', function (request, reply, done) {
  const self = this // Fastify context
  done()
})
```

Note that the Fastify context in each hook is the same as the plugin where the route was registered, for example:

```js
fastify.addHook('onRequest', async function (req, reply) {
  if (req.raw.url === '/nested') {
    assert.strictEqual(this.foo, 'bar')
  } else {
    assert.strictEqual(this.foo, undefined)
  }
})

fastify.get('/', async function (req, reply) {
  assert.strictEqual(this.foo, undefined)
  return { hello: 'world' }
})

fastify.register(async function plugin (fastify, opts) {
  fastify.decorate('foo', 'bar')

  fastify.get('/nested', async function (req, reply) {
    assert.strictEqual(this.foo, 'bar')
    return { hello: 'world' }
  })
})
```

Warn: if you declare the function with an [arrow function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions), the `this` will not be Fastify, but the one of the current scope.

<a name="route-hooks"></a>

## Route level hooks
You can declare one or more custom lifecycle hooks ([onRequest](#onrequest), [onResponse](#onresponse), [preParsing](#preparsing), [preValidation](#prevalidation), [preHandler](#prehandler), [preSerialization](#preserialization), [onSend](#onsend), [onTimeout](#ontimeout), and [onError](#onerror)) hook(s) that will be **unique** for the route.
If you do so, those hooks are always executed as the last hook in their category. <br/>
This can be useful if you need to implement authentication, where the [preParsing](#preparsing) or [preValidation](#prevalidation) hooks are exactly what you need.
Multiple route-level hooks can also be specified as an array.

```js
fastify.addHook('onRequest', (request, reply, done) => {
  // Your code
  done()
})

fastify.addHook('onResponse', (request, reply, done) => {
  // your code
  done()
})

fastify.addHook('preParsing', (request, reply, done) => {
  // Your code
  done()
})

fastify.addHook('preValidation', (request, reply, done) => {
  // Your code
  done()
})

fastify.addHook('preHandler', (request, reply, done) => {
  // Your code
  done()
})

fastify.addHook('preSerialization', (request, reply, payload, done) => {
  // Your code
  done(null, payload)
})

fastify.addHook('onSend', (request, reply, payload, done) => {
  // Your code
  done(null, payload)
})

fastify.addHook('onTimeout', (request, reply, done) => {
  // Your code
  done()
})

fastify.addHook('onError', (request, reply, error, done) => {
  // Your code
  done()
})

fastify.route({
  method: 'GET',
  url: '/',
  schema: { ... },
  onRequest: function (request, reply, done) {
    // This hook will always be executed after the shared `onRequest` hooks
    done()
  },
  onResponse: function (request, reply, done) {
    // this hook will always be executed after the shared `onResponse` hooks
    done()
  },
  preParsing: function (request, reply, done) {
    // This hook will always be executed after the shared `preParsing` hooks
    done()
  },
  preValidation: function (request, reply, done) {
    // This hook will always be executed after the shared `preValidation` hooks
    done()
  },
  preHandler: function (request, reply, done) {
    // This hook will always be executed after the shared `preHandler` hooks
    done()
  },
  // // Example with an array. All hooks support this syntax.
  //
  // preHandler: [function (request, reply, done) {
  //   // This hook will always be executed after the shared `preHandler` hooks
  //   done()
  // }],
  preSerialization: (request, reply, payload, done) => {
    // This hook will always be executed after the shared `preSerialization` hooks
    done(null, payload)
  },
  onSend: (request, reply, payload, done) => {
    // This hook will always be executed after the shared `onSend` hooks
    done(null, payload)
  },
  onTimeout: (request, reply, done) => {
    // This hook will always be executed after the shared `onTimeout` hooks
    done()
  },
  onError: (request, reply, error, done) => {
    // This hook will always be executed after the shared `onError` hooks
    done()
  },
  handler: function (request, reply) {
    reply.send({ hello: 'world' })
  }
})
```

**Note**: both options also accept an array of functions.

## Diagnostics Channel Hooks

> **Note:** The `diagnostics_channel` is currently experimental on Node.js, so
> its API is subject to change even in semver-patch releases of Node.js. For
> versions of Node.js supported by Fastify where `diagnostics_channel` is
> unavailable, the hook will use the
> [polyfill](https://www.npmjs.com/package/diagnostics_channel) if it is
> available. Otherwise this feature will not be present.

Currently, one
[`diagnostics_channel`](https://nodejs.org/api/diagnostics_channel.html) publish
event, `'fastify.initialization'`, happens at initialization time. The Fastify
instance is passed into the hook as a property of the object passed in. At this
point, the instance can be interacted with to add hooks, plugins, routes or any
other sort of modification.

For example, a tracing package might do something like the following (which is,
of course, a simplification). This would be in a file loaded in the
initialization of the tracking package, in the typical "require instrumentation
tools first" fashion.

```js
const tracer = /* retrieved from elsehwere in the package */
const dc = require('diagnostics_channel')
const channel = dc.channel('fastify.initialization')
const spans = new WeakMap()

channel.subscribe(function ({ fastify }) {
  fastify.addHook('onRequest', (request, reply, done) => {
    const span = tracer.startSpan('fastify.request')
    spans.set(request, span)
    done()
  })

  fastify.addHook('onResponse', (request, reply, done) => {
    const span = spans.get(request)
    span.finish()
    done()
  })
})
```
