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
또 `customErrorHandler`가 실행된 후에 `customErrorHandler`가 오류를 다시 사용자에게 전달해야만 실행될 것입니다.
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

> 또한 비어있는 본문을 전송하기 위해 비어있는 문자열 `''`을 반환하여 본문을 교체할 수 있지만 이 때에는 `null`을 반환할 때와는 달리 `Content-Length` 헤더가 `0`으로 설정된다는 점을 주의해야 합니다.

안내: 만약 본문을 변경한다면 `string`, `Buffer`, `stream`, 또는 `null`로만 변경할 수 있습니다.

### onResponse
```js

fastify.addHook('onResponse', (request, reply, done) => {
  // 코드 몇 줄
  done()
})
```
또는 `async/await`:
```js
fastify.addHook('onResponse', async (request, reply) => {
  // 코드 몇 줄
  await asyncMethod()
})
```

`onResponse` 훅은 응답이 전송되고 나서 실행되어 더 이상 클라이언트에 추가 데이터를 보낼 수 없습니다.
하지만 이것은 외부 서비스로 데이터를 전송하는 경우에 유용합니다.
예를 들어 통계 수집을 위한 것이 있습니다.

### onTimeout

```js

fastify.addHook('onTimeout', (request, reply, done) => {
  // 코드 몇 줄
  done()
})
```
또는 `async/await`:
```js
fastify.addHook('onTimeout', async (request, reply) => {
  // 코드 몇 줄
  await asyncMethod()
})
```
`onTimeout`은 서비스에서 요청의 시간 초과를 확인하려는 경우 유용합니다 (만약 `connectionTimeout` 속성이 Fastify 객체에 설정이 되어 있다면).
`onTimeout` 훅은 요청이 일정 시간을 초과하여 HTTP 소켓이 끊겼을 때 실행됩니다.
또 클라이언트에 추가 데이터를 보낼 수는 없게 됩니다.

### 훅에서 오류 관리하기

만약 훅 실행 중에 오류를 발생시키게 된다면 그것을 `done()`으로 전달하여 Fastify가 자동적으로 요청을 종료하고 사용자에게 적절한 오류 코드를 전달하도록 하세요.

```js
fastify.addHook('onRequest', (request, reply, done) => {
  done(new Error('Some error'))
})
```

만약 사용자에게 직접 오류 코드를 전송하고 싶으시다면 `reply.code()`를 사용하세요:
```js
fastify.addHook('preHandler', (request, reply, done) => {
  reply.code(400)
  done(new Error('Some error'))
})
```
*이 오류는 [`응답`](Reply.md#errors)에 의해서 처리됩니다.*

또는 `async/await`을 사용하는 경우 단순히 오류를 발생시킬 수도 있습니다:
```js
fastify.addHook('onResponse', async (request, reply) => {
  throw new Error('Some error')
})
```

### 훅에서 요청에 응답하기

필요하다면 라우팅의 핸들러에 요청이 도달하기 전에 응답할 수 있습니다.
예로는 인증 훅의 구현이 있습니다.
훅에서 요청에 응답한다는 것은 훅 체인이 __중지됨__을 뜻하며 남은 훅과 핸들러가 실행되지 않을 것임을 의미합니.
만약 훅이 콜백 방식을 사용한다면 콜백 방식을 피하면서 `reply.send()`를 호출하는 것만큼이나 간단합니다.
만약 훅이 `async`라면, `reply.send()`는 __반드시__ 함수가 값을 반환하거나 프라미스가 해결되기 __전__에 호출되어야 합니다.
그렇지 않으면 요청이 계속 진행될 것입니다.
`reply.send()`가 프라미스 체인 외에서 호출되었다면 `return reply`를 추가하는 것은 중요합니다.
그렇지 않으면 요청이 2번 실행될 것입니다.

__콜백과 `async`/`Promise`를 섞지 않는 것__은 굉장히 중요합니다.
그렇지 않으면 훅 체인이 2번 실행될 것입니다.

만약 `onRequest`나 `preHandler`를 사용하시고 계시다면 `reply.send`를 사용하세요.

```js
fastify.addHook('onRequest', (request, reply, done) => {
  reply.send('Early response')
})

// 비동기 함수로도 작동합니다
fastify.addHook('preHandler', async (request, reply) => {
  await something()
  reply.send({ hello: 'world' })
  return reply // 이 경우에는 선택적이지만 권장됩니다
})
```

만약 스트림으로 응답하고 싶으시다면 훅에 `async` 함수를 사용하는 것을 피해야 합니다.
반드시 `async` 함수를 사용해야 한다면 코드는 다음 패턴을 따라야 할 것입니다:
[test/hooks-async.js](https://github.com/fastify/fastify/blob/94ea67ef2d8dce8a955d510cd9081aabd036fa85/test/hooks-async.js#L269-L275)

```js
fastify.addHook('onRequest', (request, reply, done) => {
  const stream = fs.createReadStream('some-file', 'utf8')
  reply.send(stream)
})
```

만약 `await`없이 요청을 반환하고 있다면 단순히 언제나 `return reply`를 하면 됩니다:

```js
fastify.addHook('preHandler', async (request, reply) => {
  setImmediate(() => { reply.send('hello') })

  // 핸들러에 요청이 프라미스 체인 외부에서 전달될 때까지 기다리라고 알려주기 위해 필요합니다
  return reply
})

fastify.addHook('preHandler', async (request, reply) => {
  // fastify-static 플러그인이 파일을 비동기적으로 전송하기 때문에 return reply가 필요합니다
  reply.sendFile('myfile')
  return reply
})
```

## 애플리케이션 훅

애플리케이션 생명 주기에도 훅을 주입할 수 있습니다.

- [onReady](#onready)
- [onClose](#onclose)
- [onRoute](#onroute)
- [onRegister](#onregister)

### onReady

서버가 요청을 받아들이기 전과 `.ready()`가 실행되었을 때 작동합니다.
기존 라우팅을 변경하거나 새 훅을 추가할 수는 없습니다.
등록된 훅들은 순서대로 실행됩니다.
모든 `onReady` 훅 함수들이 완료된 이후에만 서버가 요청을 받기 시작할 것입니다.
훅 함수들은 하나의 인자를 받습니다: 훅 함수가 완료된 후 호출되기 위한 콜백, `done`.
훅 함수들은 Fastify 인스턴스의 `this` 바운딩과 함께 호출됩니다.

```js
// 콜백 스타일
fastify.addHook('onReady', function (done) {
  // 코드 몇 줄
  const err = null;
  done(err)
})

// async/await 스타일
fastify.addHook('onReady', async function () {
  // 비동기 코드 몇 줄
  await loadCacheFromDatabase()
})
```

<a name="on-close"></a>

### onClose

`fastify.close()`가 서버를 중지시키기 위해 호출되었을 때 작동합니다.
[플러그인](Plugins.md)가 "종료" 이벤트를 필요로 한다면 유용합니다.
예를 들어 데이터베이스 연결을 닫을 때입니다.
첫 번째 인자는 Fastify 인스턴스이고 두 번째는 `done` 콜백입니다.
```js
fastify.addHook('onClose', (instance, done) => {
  // 코드 몇 줄
  done()
})
```

<a name="on-route"></a>

### onRoute

새로운 라우팅이 등록되었을 때 작동합니다.
리스너에게는 `routeOptions`라는 한 가지 객체가 인자로 주어집니다.
이 인터페이스는 동기식이며 이러한 리스너는 콜백으로 전달되어서는 안 됩니다.
이 훅은 캡슐화되어 있습니다.
```js
fastify.addHook('onRoute', (routeOptions) => {
  // 코드 몇 줄
  routeOptions.method
  routeOptions.schema
  routeOptions.url // 라우팅에 대한 완전한 URL이며 접두사를 포함할 것입니다
  routeOptions.path // `url` 별칭
  routeOptions.routePath // 접두사를 제외한 라우팅 URL입니다
  routeOptions.bodyLimit
  routeOptions.logLevel
  routeOptions.logSerializers
  routeOptions.prefix
})
```

만약 플러그인을 작성하고 있고 옵션을 수정하거나 새로운 라우팅 훅을 추가하는 등 애플리케이션 라우팅을 직접 설정할 필요가 있으시다면 여기에서 시작해야 합니다.

```js
fastify.addHook('onRoute', (routeOptions) => {
  function onPreSerialization(request, reply, payload, done) {
    // 사용자 코드
    done(null, payload)
  }
  // preSerialization은 배열 혹은 undefined가 되어야 합니다
  routeOptions.preSerialization = [...(routeOptions.preSerialization || []), onPreSerialization]
})
```

<a name="on-register"></a>

### onRegister

새로운 플러그인이 등록되거나 새로운 캡슐화 컨텍스트가 생성되었을 때 작동합니다.
이 훅은 등록된 코드 **이전에** 실행될 것입니다.<br/>
이 훅은 캡슐화되기 때문에 플러그인 컨텍스트가 형성될 시기를 알거나 특정 컨텍스트에서 무언가를 실행하고 싶을 때 유용합니다.<br/>
**안내:** 이 훅은 만약 플러그인이 [`fastify-plugin`](https://github.com/fastify/fastify-plugin)으로 랩되어 있다면 호출되지 않을 것입니다.
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
  // 참조를 유지하면서 사용자가 `data` 속성의 캡슐화된 인스턴스를 가질 수 있도록 이전의 것에서 새로운 배열을 만듭니다
  instance.data = instance.data.slice()

  // 새롭게 등록된 인스턴스 옵션
  console.log(opts.prefix)
})
```

<a name="scope"></a>

## 스코
[onClose](#onclose)를 제외하고서 모든 훅은 캡슐화되어 있습니다.
이것은 [플러그인 가이드](Plugins-Guide.md)에 설명된 것과 같이 `register`를 사용하여 어느 지점에서 훅들이 실행되어야 할지 결정할 수 있다는 것을 의미합니다.
만약 함수를 인자로 전달한다면 함수는 Fastify 컨텍스트에 바운드되고 Fastify API에 전체 액세스를 가지게 됩니다.

```js
fastify.addHook('onRequest', function (request, reply, done) {
  const self = this // Fastify 컨텍스트
  done()
})
```

각각의 훅의 Fastify 컨텍스트는 등록된 라우팅과 같은 것이라는 것을 확인하세요. 예를 들어:

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

경고: 만약 [화살표 함수](https://developer.mozilla.org/ko-KR/docs/Web/JavaScript/Reference/Functions/Arrow_functions)로 정의한다면 `this`가 Fastify가 아닌 현재 스코프의 것 중 하나가 될 것입니다.

<a name="route-hooks"></a>

## 라우팅 수준의 훅
라우팅에 대해 *고유한* 하나 혹은 그 이상의 생명 주기 훅([onRequest](#onrequest), [onResponse](#onresponse), [preParsing](#preparsing), [preValidation](#prevalidation), [preHandler](#prehandler), [preSerialization](#preserialization), [onSend](#onsend), [onTimeout](#ontimeout), 그리고 [onError](#onerror))을 정의할 수 있습니다.
만약 이렇게 하면 훅은 언제나 동일 부류의 훅들 중 마지막에 실행될 것입니다.<br/>
이것은 인증 절차를 구현할 때 유용한데, [preParsing](#preparsing)이나 [preValidation](#prevalidation) 훅은 정확히 당신이 필요로 하는 것입니다.
여러개의 라우팅 수준의 훅은 배열로도 정의될 수 있습니다.

```js
fastify.addHook('onRequest', (request, reply, done) => {
  // 코드 몇 줄
  done()
})

fastify.addHook('onResponse', (request, reply, done) => {
  // 코드 몇 줄
  done()
})

fastify.addHook('preParsing', (request, reply, done) => {
  // 코드 몇 줄
  done()
})

fastify.addHook('preValidation', (request, reply, done) => {
  // 코드 몇 줄
  done()
})

fastify.addHook('preHandler', (request, reply, done) => {
  // 코드 몇 줄
  done()
})

fastify.addHook('preSerialization', (request, reply, payload, done) => {
  // 코드 몇 줄
  done(null, payload)
})

fastify.addHook('onSend', (request, reply, payload, done) => {
  // 코드 몇 줄
  done(null, payload)
})

fastify.addHook('onTimeout', (request, reply, done) => {
  // 코드 몇 줄
  done()
})

fastify.addHook('onError', (request, reply, error, done) => {
  // 코드 몇 줄
  done()
})

fastify.route({
  method: 'GET',
  url: '/',
  schema: { ... },
  onRequest: function (request, reply, done) {
    // 이 훅은 언제나 공유된 `onRequest` 이후에 실행됩니다
    done()
  },
  onResponse: function (request, reply, done) {
    // 이 훅은 언제나 공유된 `onResponse` 이후에 실행됩니다
    done()
  },
  preParsing: function (request, reply, done) {
    // 이 훅은 언제나 공유된 `preParsing` 이후에 실행됩니다
    done()
  },
  preValidation: function (request, reply, done) {
    // 이 훅은 언제나 공유된 `preValidation` 이후에 실행됩니다
    done()
  },
  preHandler: function (request, reply, done) {
    // 이 훅은 언제나 공유된 `preHandler` 이후에 실행됩니다
    done()
  },
  // // 배열 예제. 모든 훅은 아래 형식을 지원합니다.
  //
  // preHandler: [function (request, reply, done) {
  //   // 이 훅은 언제나 공유된 `preHandler` 이후에 실행됩니다
  //   done()
  // }],
  preSerialization: (request, reply, payload, done) => {
    // 이 훅은 언제나 공유된 `preSerialization` 이후에 실행됩니다
    done(null, payload)
  },
  onSend: (request, reply, payload, done) => {
    // 이 훅은 언제나 공유된 `onSend` 이후에 실행됩니다
    done(null, payload)
  },
  onTimeout: (request, reply, done) => {
    // 이 훅은 언제나 공유된 `onTimeout` 이후에 실행됩니다
    done()
  },
  onError: (request, reply, error, done) => {
    // 이 훅은 언제나 공유된 `onError` 이후에 실행됩니다
    done()
  },
  handler: function (request, reply) {
    reply.send({ hello: 'world' })
  }
})
```

**참고**: 모든 옵션은 함수 배열도 지원합니다.

## Diagnostics Channel 훅

> **참고**: `diagnostics_channel`은 Node.JS에서 현재 실험 기능이기 때문에 API가 Node.JS의 semver-패치 릴리즈에서 변경될 수 있습니다.
> Fastify가 지원하는 Node.JS 버전 중 `diagnostics_channel`를 지원하지 않는 버전은 가능하면 이 [polyfill](https://www.npmjs.com/package/diagnostics_channel)을 사용할 것입니다.
> polyfill을 사용할 수 없다면 이 기능은 비활성화됩니다.

현재, [`diagnostics_channel`](https://nodejs.org/api/diagnostics_channel.html)은 하나의 `'fastify.initialization'` 이벤트를 초기화 시간에 발행할 것입니다.
Fastify 객체는 훅에 객체의 속성으로 전달됩니다.
이 점에서 볼 때, 객체에 훅, 플러그인, 라우팅 혹은 그 어떤 수정 사항이라도 추가될 수 있습니다.

예를 들어, 추적 중인 패키지가 다음과 같은 것(당연히, 단순화한 것입니다)을 할 수 있습니다.
형식적으로 "필요한 도구가 선 요구되는", 이것은 추적 중인 패키지가 초기화될 때 로드된 파일이 될 수 있습니다.

```js
const tracer = /* 패키지의 다른 곳에서 가져와지는 */
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
