# 시작하기

안녕하세요! Fastify를 확인해주셔서 고마워요!<br/>
이 문서에서는 프레임워크와 기능을 친절하게 소개할 수 있도록 하고 있습니다.
이것은 문서의 다른 부분들로의 링크를 포함한 예제들과 함께하고 있는 기초적인 서문입니다.
<br/>
그럼 시작해보죠!

<a name="install"></a>

### 설치하기
npm으로 설치하기:
```
npm i fastify --save
```
yarn으로 설치하기:
```
yarn add fastify
```

<a name="first-server"></a>

### 첫 번째 서버
우리 첫 번째 서버를 짜보아요:
```js
// 프레임워크를 가져오고 초기화합니다

// ESM
import Fastify from 'fastify'
const fastify = Fastify({
  logger: true
})
// CommonJs
const fastify = require('fastify')({
  logger: true
})

// 라우팅 정의
fastify.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})

// 서버 실행!
fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // ${address}에서 이제 서버가 기다리고 있습니다
})
```

`async/await`을 쓰길 원하세요? Fastify는 별 다른 것없이도 지원합니다.<br/>
*(또 저희는 파일 설명자와 메모리 누수를 피하기 위해 [make-promises-safe](https://github.com/mcollina/make-promises-safe)를 사용하는 것도 추천드려요.)*
```js
// ESM
import Fastify from 'fastify'
const fastify = Fastify({
  logger: true
})
// CommonJs
const fastify = require('fastify')({
  logger: true
})

fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
```

좋아요, 이건 쉬웠습니다.<br/>
하지만 안타깝게도, 복잡한 애플리케이션을 작성하는 것은 위 예제보단 더 많은 코드들을 필요로 한답니다.
새로운 애플리케이션을 만들 때 여러개의 파일과 비동기적인 시작 그리고 코드를 설계하는 것은 전통적인 문제점이죠.<br/>
Fastify는 위에서 언급된 문제점을 포함한 수많은 문제들을 한 번에 해결해줄 수 있는 쉬운 플랫폼을 제안합니다.

> ## 참고
> 위의 예제와 이 문서의 하위 예제들은 기본적으로 로컬호스트 `127.0.0.1` 인터페이스*에서만* 대기하도록 설정되어 있습니다.
> 모든 사용가능한 인터페이스에서 서버를 대기시키려면 예제는 `0.0.0.0`에서 듣도록 수정되어야 합니다. 다음과 같이요:
>
> ```js
> fastify.listen(3000, '0.0.0.0', function (err, address) {
>   if (err) {
>     fastify.log.error(err)
>     process.exit(1)
>   }
>   fastify.log.info(`server listening on ${address}`)
> })
> ```
>
> 비슷하게, `::1`로 지정하면 모든 로컬의 IPv6 연결을 수락할 것입니다.
> 아니면 `::`로 지정하여 모든 IPv6 연결을 수락하고, 또 운영체제가 지원한다면 IPv4 주소들로부터도 수락할 것입니다.
>
> 도커나 컨테이너 등으로 배포할 때에는 `0.0.0.0`이나 `::`로 지정하는 것이 애플리케이션을 노출하는데에 가장 쉬운 방법일 것입니다.

<a name="first-plugin"></a>

### 첫 번째 플러그인
JavaScript와 함께, 모든 것은 객체이고, Fastify와 함께, 모든 것은 플러그인입니다.<br/>
깊게 파기 전에 먼저 어떻게 작동하는지 살펴봅시다!<br/>
먼저 기본적인 서버를 정의하는데, 단, 엔트리포인트에 모든 라우팅을 정의하는 대신 외부의 파일에 정의를 할 것입니다. ([라우팅 정의](Routes.md) 문서를 확인해보세요)
```js
// ESM
import Fastify from 'fastify'
import firstRoute from './our-first-route'
const fastify = Fastify({
  logger: true
})

fastify.register(firstRoute)

fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // 서버는 이제 ${address}에서 대기 중입니다
})
```

```js
// CommonJs
const fastify = require('fastify')({
  logger: true
})

fastify.register(require('./our-first-route'))

fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // 서버는 이제 ${address}에서 대기 중입니다
})
```

```js
// our-first-route.js

async function routes (fastify, options) {
  fastify.get('/', async (request, reply) => {
    return { hello: 'world' }
  })
}

module.exports = routes
```
위의 예제에서 저희는 Fastify 프레임워크의 핵심인 `register` API를 사용했습니다.
이것은 라우팅, 플러그인 등을 추가하기 위한 유일한 방법입니다.

이 가이드에 앞서서 저희는 Fastify가 여러분의 애플리케이션의 비동기적인 시작을 돕는 기반을 제공한다는 것을 알 수 있었습니다.
왜 이게 중요할까요?
데이터 스토리지를 다루기 위해 데이터베이스 연결이 필요한 상황을 생각해보세요.
데이터베이스 연결은 서버가 연결을 수락하기 전에 사용가능해야 합니다.
우리는 어떻게 이 문제를 설명할까요?<br/>
전형적인 해결책은 복잡한 콜백이나 프라미스를 사용하는 것입니다 - 프레임워크 API와 다른 라이브러리들 그리고 애플리케이션을 한데 섞을 시스템이죠.<br/>
Fastify는 이것을 내부적으로 다룹니다, 최소한의 노력만으로요!

위 예제를 데이터베이스 연결과 함께 다시 작성해볼게요.<br/>

먼저, `fastify-plugin`과 `fastify-mongodb`를 설치해주세요:

```
npm i --save fastify-plugin fastify-mongodb
```

**server.js**
```js
// ESM
import Fastify from 'fastify'
import dbConnector from './our-db-connector'
import firstRoute from './our-first-route'

const fastify = Fastify({
  logger: true
})
fastify.register(dbConnector)
fastify.register(firstRoute)

fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // 서버는 이제 ${address}에서 대기 중입니다
})
```

```js
// CommonJs
const fastify = require('fastify')({
  logger: true
})

fastify.register(require('./our-db-connector'))
fastify.register(require('./our-first-route'))

fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // 서버는 이제 ${address}에서 대기 중입니다
})

```

**our-db-connector.js**
```js
// ESM
import fastifyPlugin from 'fastify-plugin'
import fastifyMongo from 'fastify-mongodb'

async function dbConnector (fastify, options) {
  fastify.register(fastifyMongo, {
    url: 'mongodb://localhost:27017/test_database'
  })
}

// 플러그인 함수를 fastify-plugin으로 감싼다는 것은 플러그인 내부적으로 선언된 데코레이터와 훅을 상위 범주로 노출시킨다는 것을 의미합니다.
module.exports = fastifyPlugin(dbConnector)

```

```js
// CommonJs
const fastifyPlugin = require('fastify-plugin')

async function dbConnector (fastify, options) {
  fastify.register(require('fastify-mongodb'), {
    url: 'mongodb://localhost:27017/test_database'
  })
}

// 플러그인 함수를 fastify-plugin으로 감싼다는 것은 플러그인 내부적으로 선언된 데코레이터와 훅을 상위 범주로 노출시킨다는 것을 의미합니다.
module.exports = fastifyPlugin(dbConnector)

```

**our-first-route.js**
```js
async function routes (fastify, options) {
  const collection = fastify.mongo.db.collection('test_collection')

  fastify.get('/', async (request, reply) => {
    return { hello: 'world' }
  })

  fastify.get('/animals', async (request, reply) => {
    const result = await collection.find().toArray()
    if (result.length === 0) {
      throw new Error('No documents found')
    }
    return result
  })

  fastify.get('/animals/:animal', async (request, reply) => {
    const result = await collection.findOne({ animal: request.params.animal })
    if (!result) {
      throw new Error('Invalid value')
    }
    return result
  })
}

module.exports = routes
```

헉, 정말 빠르네요! (비꼬는 것 아닙니다 ㅜㅜ)<br/>
이제 저희가 제시한 새로운 개념을 다시 요약해보겠습니다.<br/>
볼 수 있듯이 저희는 `register`를 데이터베이스 커넥터와 라우팅 정의에 모두 사용했습니다.
이 것은 Fastify의 가장 멋진 기능 중에 하나로 당신의 정의한 순서대로 플러그인을 가져오고 다음 플러그인을 현재 플러그인의 로드가 완료되었을 때만 로드할 것입니다.
이러한 방식으로 저희는 데이터베이스 커넥터를 첫 번째 플러그인으로 정의했고 두 번째 것에서 사용했습니다. *(플러그인의 스코프를 다루는 것을 이해하기 위해서는 [이 것](Plugins.md#handle-the-scope)을 읽어보세요)*
플러그인 로드는 `fastify.listen()`, `fastify.inject()` 혹은 `fastify.ready()`를 호출하면 시작됩니다.

MongoDB 플러그인은 `decorate` API를 Fastify 인스턴스에 새로운 객체들을 모든 곳에서 샤용가능하도록 추가합니다.
이 API를 사용하는 것은 쉬운 코드 재사용과 중복 로직을 줄이기 위해 권장됩니다.

Fastify 플러그인이 작동하는 방식을 더 깊게 파고들어, 비동기식으로 애플리케이션을 시작하는 문제를 다루기 위해 어떻게 새로운 플러그인을 작성하고 모든 Fastify API를 사용하는 방법에 대해서는 [hitchhiker의 플러그인 가이드](Plugins-Guide.md)를 읽어보세요.

<a name="plugin-loading-order"></a>

### 플러그인 로드 순서
예측 가능하고 지속적인 애플리케이션 동작을 보장하기 위해서 저희는 다음과 같이 코드를 로드하는 것을 강력히 권고드립니다:
```
└── 플러그인 (Fastify 생태계에서)
└── 사용자 플러그인
└── 데코레이터
└── 훅
└── 서비스
```
이러한 방식을 사용하면 저희는 언제나 현재 스코프에서 정의된 모든 프로퍼티에 접근할 수 있을 것입니다.<br/>
이전에 이야기한 것처러 Fastify는 여러분이 애플리케이션을 하나의 독립적인 서비스로 작성할 수 있도록 solid 캡슐화 모델을 제공합니다.
만약 당신이 하위 라우팅에 대해서만 플러그인을 등록하고 싶으시다면 그냥 다시 위의 구조를 반복하기만 하면 됩니다.
```
└── 플러그인 (Fastify 생태계에서)
└── 사용자 플러그인
└── 데코레이터
└── 훅
└── 서비스
    │
    └──  서비스 A
    │     └── 플러그인 (Fastify 생태계에서)
    │     └── 사용자 플러그인
    │     └── 데코레이터
    │     └── 훅
    │     └── 서비스
    │
    └──  서비스 B
          └── 플러그인 (Fastify 생태계에서)
          └── 사용자 플러그인
          └── 데코레이터
          └── 훅
          └── 서비스
```

<a name="validate-data"></a>

### 데이터 검증
데이터 검증은 굉장히 중요하고 프레임워크의 핵심 개념 중 하나입니다.<br/>
들어오는 요청들을 검증하기 위해 Fastify는 [JSON 스키마](https://json-schema.org/)를 사용합니다.
(JTD 스키마는 조금 지원되기는 하지만 `jsonShorthand`는 먼저 반드시 비활성화되어야 합니다)

이제 라우팅에서 검증을 하는 아래 예제를 살펴볼게요:
```js
const opts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        someKey: { type: 'string' },
        someOtherKey: { type: 'number' }
      }
    }
  }
}

fastify.post('/', opts, async (request, reply) => {
  return { hello: 'world' }
})
```
이 예제는 어떻게 옵션 객체를 라우팅에 전달해야 하는지 보여줍니다.
`body`, `querystring`, `params`, 그리고 `headers`까지 라우팅에서 필요한 모든 스키마를 `schema` 키로 받습니다.<br/>
더 알아보고 싶으시다면 [검증과 직렬화](Validation-and-Serialization.md)를 읽어보세요.

<a name="serialize-data"></a>

### 데이터 직렬화
Fastify는 JSON을 완벽히 지원하고 있습니다.
JSON 본문을 해석하고 출력을 직렬화하는데에 엄청나게 최적화되어 있죠.<br/>
JSON 직렬화(맞아요, 확실히 느려요!)를 빠르게 하기 위해서는 스키마 옵션의 `response` 키를 다음 예제와 같이 사용하면 됩니다:
```js
const opts = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          hello: { type: 'string' }
        }
      }
    }
  }
}

fastify.get('/', opts, async (request, reply) => {
  return { hello: 'world' }
})
```
위와 같이 스키마를 지정함으로써 2-3배 정도 직렬화를 빠르게 할 수 있습니다.
그리고 Fastify가 응답 스키마에 있는 데이터만 직렬화할 것이니 이것은 중요한 데이터의 유출을 막는 것을 도와주기도 합니다.
더 알아보고 싶으시다면 [검증과 직렬화](Validation-and-Serialization.md)를 읽어보세요.

<a name="extend-server"></a>

### 서버 확장하기
Fastify는 굉장히 작고 확장성있게 설계되었고 저희는 멋진 애플리케이션을 만들기 위해 필수적인 것이 준비된 베어-본 프레임워크만으로도 충분하다고 믿습니다.<br/>
다시 말하자면, Fastify는 "batteries included"한 (모든 것이 준비된) 프레임워크가 아니라 엄청난 [생태계](Echosystem.md)에 의존하는 프레임워크라는 것입니다!

<a name="test-server"></a>

### 서버 테스트하기
Fastify는 테스팅 프레임워크를 제공하지 않지만 Fastify의 기능과 아키텍쳐를 사용하는 테스트를 권장하고 있습니다.<br/>
[테스트](Testing.md) 문서를 더 읽어보세요!

<a name="cli"></a>

### CLI로 서버 실행하기
[fastify-cli](https://github.com/fastify/fastify-cli) 덕분에 Fastify는 CLI 통합 기능도 가지고 있습니다.

먼저 `fastify-cli`를 설치하세요:

```
npm i fastify-cli
```

`-g` 옵션으로 전역에 설치할 수도 있습니다.

그리고 `package.json`에 다음 줄을 추가해보세요:
```json
{
  "scripts": {
    "start": "fastify start server.js"
  }
}
```

그리고 서버 파일을 만듭니다:
```js
// server.js
'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    return { hello: 'world' }
  })
}
```

이제 서버를 다음 명령어로 시작할 수 있습니다:
```bash
npm start
```

<a name="slides"></a>

### 프레젠테이션과 비디오
- 프레젠테이션
  - [Take your HTTP server to ludicrous speed](https://mcollina.github.io/take-your-http-server-to-ludicrous-speed) by [@mcollina](https://github.com/mcollina)
  - [What if I told you that HTTP can be fast](https://delvedor.github.io/What-if-I-told-you-that-HTTP-can-be-fast) by [@delvedor](https://github.com/delvedor)

- 비디오
  - [Take your HTTP server to ludicrous speed](https://www.youtube.com/watch?v=5z46jJZNe8k) by [@mcollina](https://github.com/mcollina)
  - [What if I told you that HTTP can be fast](https://www.webexpo.net/prague2017/talk/what-if-i-told-you-that-http-can-be-fast/) by [@delvedor](https://github.com/delvedor)
