데코레이터 API는 서버 인스턴스 그 자체나 HTTP 라이프사이클 중에 모든 요청과 응답 객체 등 Fastify 핵심 객체들을 수정하는 것을 허용해줍니다.
데코레이터 API는 핵심 객체들에 그 어떤 타입의 속성이라도 추가해줄 수 있게 해줍니다.
예를 들어 함수나 순수 객체 혹은 내장 타입들이 있습니다.
이 API는 *동적*입니다.
데코레이터를 비동기적으로 정의하는 것은 Fastify 인스턴스가 데코레이터가 완전히 초기화되기 전에 실행하는 결과를 초래할 수도 있습니다.
이 문제를 피하기 위해서는 `fastify-plugin`과 혼합된 `register` API를 사용하여 비동기 데코레이터를 대신 정의해야만 합니다.
더 알아보고 싶으시다면 [Plugins](Plugins.md) 문서를 확인하세요.

핵심 객체들을 이 API로 수정하는 것은 내부적인 JavaScript 엔진이 서버, 요청 그리고 응답 객체에 대한 처리를 효율적으로 할 수 있게 해줍니다.
이 것은 그들이 모두 초기화되고 쓰이기 전에 모든 객체 인스턴스의 모양을 정의해주게 되므로써 달성됩니다.
예제와 같이 아래는 라이프사이클 중에 객체들의 모양을 변경하기 때문에 권장되지 않습니다:

```js
// 이건 나쁜 예제입니다! 계속 읽으세요.

// user 속성을 들어오는 요청 핸들러에 요청이 처리되기 전에 추가합니다.
fastify.addHook('preHandler', function (req, reply, done) {
  req.user = 'Bob Dylan'
  done()
})

// 추가된 user 속성을 요청 핸들러에서 사용합니다.
fastify.get('/', function (req, reply) {
  reply.send(`Hello, ${req.user}`)
})
```

위의 예제가 요청 객체를 그것이 이미 인스턴스화된 후에 변경하므로써 JavaScript 엔진은 반드시 비효율적으로 요청 객체에 접근해야 합니다.
데코레이터 API를 사용하면 이런 비효율을 피할 수 있습니다:

```js
// 요청을 'user' 속성으로 꾸며줍니다.
fastify.decorateRequest('user', '')

// 속성을 업데이트합니다.
fastify.addHook('preHandler', (req, reply, done) => {
  req.user = 'Bob Dylan'
  done()
})
// 그리고 최종적으로 접근합니다.
fastify.get('/', (req, reply) => {
  reply.send(`Hello, ${req.user}!`)
})
```

이후에 동적으로 설정되도록 의도된 값들에 최대한 유사하게 꾸며진 초기의 모양을 유지해야 한다는 것을 기억하세요.
데코레이터를 `''`로 초기화하는 것은 그 값이 문자열이라는 것을 의도하며 그것이 객체나 함수일 때는 `null`을 사용하게 됩니다.

이 예제가 레퍼런스 타입과만 동작하고 모든 요청에 공유된다는 것을 기억하세요.
[decorateRequest](#decorate-request)를 참고해주세요.

이 주제에 관련해서 더 알아보시려면
[JavaScript engine fundamentals: Shapes and Inline Caches](https://mathiasbynens.be/notes/shapes-ics)
를 확인해보세요.

## 사용법
<a name="usage"></a>

### `decorate(name, value, [dependencies])`
<a name="decorate"></a>

이 메서드는 Fastify [서버](Server.md) 인스턴스를 수정하는데 사용됩니다.

예를 들어 서버 인스턴스에 새로운 메서드를 붙이려면:

```js
fastify.decorate('utility', function () {
  // 뭔가 유용한 것
})
```

위에서 언급된대로 함수가 아닌 값들도 추가될 수 있습니다:

```js
fastify.decorate('conf', {
  db: 'some.db',
  port: 3000
})
```

꾸며진 속성들에 접근하려면 데코레이터 API에 주었던 이름을 사용하세요:

```js
fastify.utility()

console.log(fastify.conf.db)
```

꾸며진 [Fastify 서버](Server.md)는 [라우팅](Routes.md) 핸들러의 `this`에 바운딩됩니다:

```js
fastify.decorate('db', new DbConnection())

fastify.get('/', async function (request, reply) {
  reply({hello: await this.db.query('world')})
})
```

`dependencies` 파라메터는 데코레이터들의 선택적인 목록이며 정의되는 데코레이터는 다음 것들에 의존함을 의미합니다.
이 목록은 단순히 다른 데코레이터들의 문자열 이름들입니다.
다음 예제에서 "utility" 데코레이터는 "greet"과 "log" 데코레이터에 의존합니다:

```js
fastify.decorate('utility', fn, ['greet', 'log'])
```

참고: 화살표 함수를 사용하는 것은 `FastifyInstance`의 `this` 바인딩을 망칠 것입니다.

만약 의존성이 충족되지 않았다면 `decorate` 메서드는 예외를 발생시킬 것입니다.
의존성 확인은 서버 인스턴스가 부팅되기 전에 이루어집니다.
그러므로 런타임 중에서는 일어날 수가 없습니다.

###  `decorateReply(name, value, [dependencies])`
<a name="decorate-reply"></a>

이름에서 보이듯이 이 API는 핵심 `Reply` 객체에 새로운 메서드나 속성을 추가하는데 쓰입니다:

```js
fastify.decorateReply('utility', function () {
  // 뭔가 굉장히 유용한 것
})
```

참고: 화살표 함수를 사용하는 것은 Fastify `Reply` 인스턴스의 `this` 바인딩을 망가뜨릴 것입니다.

참고: 만약 레퍼런스 타입과 함께 `decorateReply`를 사용했다면 경고가 출력될 것입니다:

```js
// 이거 하지마세요
fastify.decorateReply('foo', { bar: 'fizz'})
```
위의 예제에서 레퍼런스 타입인 객체는 다른 모든 요청들과 공유될 것입니다: **모든 수정 사항은 모든 요청에 걸쳐서 영향을 줄 것이며 잠재적으로 보안 취약점이나 메모리 누수를 초래할 수 있습니다**.
요청간의 올바른 캡슐화를 달성하려면 들어오는 요청에 대해 [`'onRequest'` 훅](Hooks.md#onrequest)에서 새 값을 설정하세요.
예시:

```js
const fp = require('fastify-plugin')

async function myPlugin (app) {
  app.decorateRequest('foo', null)
  app.addHook('onRequest', async (req, reply) => {
    req.foo = { bar: 42 }
  })
}

module.exports = fp(myPlugin)
```

`depedencies` 파라메터에 관련한 더 많은 정보는 [`decorate`](#decorate)를 참조하세요.

### `decorateRequest(name, value, [dependencies])`
<a name="decorate-request"></a>

위의 [`decorateReply`](#decorate-reply)와 같이, 이 API는 새로운 메서드나 속성을 핵심 `Request` 객체에 추가하는데에 쓰입니다:

```js
fastify.decorateRequest('utility', function () {
  // 뭔가 굉장히 유용한 것
})
```

참고: 화살표 함수를 사용하는 것은 Fastify `Request` 인스턴스에 대한 `this` 바인딩을 망가뜨릴 것입니다.

참고: `decorateRequest`를 레퍼런스 타입과 함께 사용하면 경고가 출력될 것입니다:

```js
// 이건 하지마세요
fastify.decorateRequest('foo', { bar: 'fizz'})
```
이 예제에서 레퍼런스 타입인 객체는 모든 요청과 함께 공유될 것입니다: **그 어떤 변경
위의 예제에서 레퍼런스 타입인 객체는 다른 모든 요청들과 공유될 것입니다: **모든 수정 사항은 모든 요청에 걸쳐서 영향을 줄 것이며 잠재적으로 보안 취약점이나 메모리 누수를 초래할 수 있습니다**.

요청간의 올바른 캡슐화를 달성하려면 들어오는 요청에 대해 [`'onRequest'` 훅](Hooks.md#onrequest)에서 새 값을 설정하세요.
예시:

```js
const fp = require('fastify-plugin')

async function myPlugin (app) {
  app.decorateRequest('foo', null)
  app.addHook('onRequest', async (req, reply) => {
    req.foo = { bar: 42 }
  })
}

module.exports = fp(myPlugin)
```

`depedencies` 파라메터에 관련한 더 많은 정보는 [`decorate`](#decorate)를 참조하세요.

###  `hasDecorator(name)`
<a name="has-decorator"></a>

서버 인스턴스에 꾸며진 속성이 있는지 확인하는데 사용됩니다:

```js
fastify.hasDecorator('utility')
```

#### hasRequestDecorator
<a name="has-request-decorator"></a>

Request에 꾸며진 속성이 있는지 확인하는데 사용됩니다:

```js
fastify.hasRequestDecorator('utility')
```

#### hasReplyDecorator
<a name="has-reply-decorator"></a>

Reply에 꾸며진 속성이 있는지 확인하는데 사용됩니다:

```js
fastify.hasReplyDecorator('utility')
```

## 데코레이터와 캡슐화
<a name="decorators-encapsulation"></a>

(`decorate`, `decorateRequest`, 혹은 `decorateReply`를 사용하여) 같은 이름의 데코레이터를 한 번 이상 같은 **캡슐화** 범위에서 정의하는 것은 예외를 발생시킵니다.

따라서 아래 예제는 예외를 발생시킵니다:

```js
const server = require('fastify')()

server.decorateReply('view', function (template, args) {
  // 개쩌는 렌더링 뷰 엔진
})

server.get('/', (req, reply) => {
  reply.view('/index.html', { hello: 'world' })
})

// 어딘가 다른 곳에서 저희는 다른 뷰 데코레이터를 정의합니다.
// 그리고 예외를 발생시켜요.
server.decorateReply('view', function (template, args) {
  // 다른 렌더링 엔진
})

server.listen(3000)
```

그러나 이것은 예외를 발생시키지 않을 것입니다:

```js
const server = require('fastify')()

server.decorateReply('view', function (template, args) {
  // 개쩌는 렌더링 뷰 엔진.
})

server.register(async function (server, opts) {
  // 저희는 현재 캡슐화 범위에 뷰 데코레이터를 추가했습니다.
  // 이것은 캡슐화된 플러그인 밖의 영역이므로 예외를 발생시키지 않을 것입니다.
  server.decorateReply('view', function (template, args) {
    // 또 다른 렌더링 엔진
  })

  server.get('/', (req, reply) => {
    reply.view('/index.page', { hello: 'world' })
  })
}, { prefix: '/bar' })

server.listen(3000)
```

### Getters와 Setters
<a name="getters-setters"></a>

데코레이터들은 특별한 "getter/setter" 객체들을 가집니다.
이러한 객체들은 `getter`와 `setter`로 명명된 함수들을 가집니다 (`setter` 함수는 선택적이예요).
이것은 데코레이터로 속성을 정의할 수 있게 해줍니다, 예를 들어:

```js
fastify.decorate('foo', {
  getter () {
    return 'a getter'
  }
})
```

Fastify 인스턴스에 `foo` 속성을 정의할 것입니다:

```js
console.log(fastify.foo) // 'a getter'
```
