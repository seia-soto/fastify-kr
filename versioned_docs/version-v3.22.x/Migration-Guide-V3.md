# V3 마이그레이션 가이드

이 가이드는 Fastify v2에서 v3로 마이그레이션을 돕기 위해 만들어졌습니다.

시작하기 전에 모든 더 사용되지 않는다는 경고들을 고쳐졌다는 것을 확실 시 해주세요.
모든 v2에서 더 이상 사용되지 않는 리소스는 제거되거나 업그레이드 이후 더 이상 작동하지 않을 것입니다. ([#1750](https://github.com/fastify/fastify/pull/1750))

## 중요 변경 사항

### 미들웨어 지원 변경 ([#2014](https://github.com/fastify/fastify/pull/2014))

Fastify v3부터, 미들웨어 지원은 프레임워크 자체에서 더 이상 바로 지원되지 않습니다.

만약 Express 미들웨어를 애플리케이션에서 사용하시고 싶으시다면 [`fastify-express`](https://github.com/fastify/fastify-express)이나
[`middie`](https://github.com/fastify/middie)를 먼저 설치하고 등록해주세요.

**v2:**

```js
// Fastify v2에서 Express `cors` 미들웨어 사용.
fastify.use(require('cors')());
```

**v3:**

```js
// Fastify v3에서 Express `cors` 미들웨어 사용.
await fastify.register(require('fastify-express'));
fastify.use(require('cors')());
```

### 로깅 직렬화 변경 ([#2017](https://github.com/fastify/fastify/pull/2017))

로깅 [직렬화기](Logging.md)들은 이제 네이티브 대신 Fastify의 [`Request`](Request.md)와 [`Reply`](Reply.md) 객체를 대신 사용하도록 업데이트되었습니다.

모든 외부 직렬화기들은 Fastify가 아닌 네이티브 객체의 `request`나 `reply` 프로퍼티에 의존하고 있다면 업데이트되어야 합니다.

**v2:**

```js
const fastify = require('fastify')({
  logger: {
    serializers: {
      res(res) {
        return {
          statusCode: res.statusCode,
          customProp: res.customProp
        };
      }
    }
  }
});
```

**v3:**

```js
const fastify = require('fastify')({
  logger: {
    serializers: {
      res(reply) {
        return {
          statusCode: reply.statusCode, // 변경 필요 없음
          customProp: reply.raw.customProp // res 객체의 특정 프로퍼티를 로그
        };
      }
    }
  }
});
```

### 스키마 대입 변경 ([#2023](https://github.com/fastify/fastify/pull/2023))

비표준의 `replace-way` 공유 스키마 지원이 제거되었습니다.
이 기능은 JSON 스키마 스펙인 `$ref` 기반으로 변경되었습니다.
이 변경 사항에 대해서 더 알아보려면 [Validation and Serialization in Fastify v3](https://dev.to/eomm/validation-and-serialization-in-fastify-v3-2e8l)을 읽어주세요.

**v2:**

```js
const schema = {
  body: 'schemaId#'
};
fastify.route({ method, url, schema, handler });
```

**v3:**

```js
const schema = {
  body: {
    $ref: 'schemaId#'
  }
};
fastify.route({ method, url, schema, handler });
```

### 스키마 검증 옵션 변경 ([#2023](https://github.com/fastify/fastify/pull/2023))

`setSchemaCompiler`와 `setSchemaResolver` 옵션이 이후 툴링 향상을 위해 `setValidatorCompiler`로 대체되었습니다.
이 변경 사항에 대해서 더 알아보려면 [Validation and Serialization in Fastify v3](https://dev.to/eomm/validation-and-serialization-in-fastify-v3-2e8l)을 읽어주세요.

**v2:**

```js
const fastify = Fastify();
const ajv = new AJV();
ajv.addSchema(schemaA);
ajv.addSchema(schemaB);

fastify.setSchemaCompiler(schema => ajv.compile(schema));
fastify.setSchemaResolver(ref => ajv.getSchema(ref).schema);
```

**v3:**

```js
const fastify = Fastify();
const ajv = new AJV();
ajv.addSchema(schemaA);
ajv.addSchema(schemaB);

fastify.setValidatorCompiler(({ schema, method, url, httpPart }) =>
  ajv.compile(schema)
);
```

### preParsing 훅 동작 변경 ([#2286](https://github.com/fastify/fastify/pull/2286))

Fastify v3부터 `preParsing` 훅의 동작은 요청 본문 조작을 위해 약간 변경될 것입니다.

이 훅은 이제 새로운 인자인 `payload`를 받습니다.
그리고 새로운 훅은 `fn(request, reply, payload, done)` 또는 `async fn(request, reply, payload)`와 같은 형태를 띄게 됩니다.

이 훅은 `done(null, stream)` 혹은 async 함수인 경우 스트림을 반환하여 선택적으로 새로운 스트림을 반환할 수 있습니다.

만약 훅이 새로운 스트림을 반환한다면 그 스트림이 본래의 것 대신 이후 훅들에서 사용될 것입니다.
예를 들어 압축된 요청들을 처리할 때 사용할 수 있을 것입니다.

새로운 스트림은 반드시 클라이언트에게 받은 실제 크기를 반영하는 `receivedEncodedLength` 속성을 추가해야 합니다.
예를 들어 압축된 요청의 경우 반드시 압축된 본문의 크기가 되어야 합니다.
이 속성은 `data` 이벤트에 따라 동적으로 업데이트될 수 있습니다.

payload가 없는 Fastify v2의 오래된 문법은 여전히 지원되지만 더 이상 사용되지는 않습니다.

### 훅 동작 변경 ([#2004](https://github.com/fastify/fastify/pull/2004))

Fastify v3부터 `onRoute`와 `onRegister` 훅의 동작이 훅 캡슐화 지원을 위해 약간 변경될 것입니다.

- `onRoute` - 훅이 비동기적으로 호출될 것입니다. 이 훅은 이제 동일한 캡슐화 범위의 새 플러그인을 등록할 때 상속됩니다. 그러므로, 이 훅은 반드시 플러그인 등록 _이전에_ 등록되어야 합니다.
- `onRegister` - onRoute 훅과 같습니다. 유일하게 다른 점은 가장 첫 번째 호출이 더 이상 프레임워크 그 자체가 아닌 처음 등록된 플러그인이 된다는 것입니다.

### 컨텐츠 타입 파서 문법 변경 ([#2286](https://github.com/fastify/fastify/pull/2286))

Fastify v3에서는 이제 컨텐츠 타입 파서들이 파서들에 대해 하나의 형태만 가지게 됩니다.

새로운 형태는 `fn(request, payload, done)` 혹은 `async fn(request, payload)`가 될 것입니다.
`request`가 이제 `IncomingMessage`가 아닌 Fastify 요청이 된다는 사실을 숙지하세요.
본문은 이제 기본적으로 스트림입니다.
만약 `parseAs` 옵션이 `addContentTypeParser`에 사용되었다면 `payload`는 옵션 값을 반영할 것입니다 (문자열 혹은 버퍼).

오래된 형태인 `fn(req, [done])` 또는 `fn(req, payload, [done])` (`req`는 `IncomingMessage`)은 여전히 지원되지만 더 이상 사용되지는 않습니다.

### TypeScript 지원 변경

Fastify 3버전부터는 타입 시스템이 변경되었습니다.
새로운 타입 시스템은 기본값을 가진 제너릭 적용과 더붙어 본문과 쿼리 등의 스키마 타입을 정의할 새로운 방법을 소개합니다.

**v2:**

```ts
interface PingQuerystring {
  foo?: number;
}

interface PingParams {
  bar?: string;
}

interface PingHeaders {
  a?: string;
}

interface PingBody {
  baz?: string;
}

server.get<PingQuerystring, PingParams, PingHeaders, PingBody>(
  '/ping/:bar',
  opts,
  (request, reply) => {
    console.log(request.query); // `PingQuerystring` 타입입니다
    console.log(request.params); // `PingParams` 타입입니다
    console.log(request.headers); // `PingHeaders` 타입입니다
    console.log(request.body); // `PingBody` 타입입니다
  }
);
```

**v3:**

```ts
server.get<{
  Querystring: PingQuerystring;
  Params: PingParams;
  Headers: PingHeaders;
  Body: PingBody;
}>('/ping/:bar', opts, async (request, reply) => {
  console.log(request.query); // `PingQuerystring` 타입입니다
  console.log(request.params); // `PingParams` 타입입니다
  console.log(request.headers); // `PingHeaders` 타입입니다
  console.log(request.body); // `PingBody` 타입입니다
});
```

### 예상치 못한 예외 다루기 ([#2073](https://github.com/fastify/fastify/pull/2073))

동적 라우팅 핸들러에서 에러가 발생한다면 서버가 설정된 `.setErrorHandler()`를 호출하지 않고 크래시를 일으켰습니다.
이 것은 이제 변경되었으며 모든 동기 및 비동기 상태의 예상치 못한 오류가 관리됩니다.

**v2:**

```js
fastify.setErrorHandler((error, request, reply) => {
  // 이는 호출되지 않습니다
  reply.send(error)
})
fastify.get('/', (request, reply) => {
  const maybeAnArray = request.body.something ? [] : 'I am a string'
  maybeAnArray.substr() // Thrown: [].substr is not a function and crash the server
})
```

**v3:**

```js
fastify.setErrorHandler((error, request, reply) => {
  // "이제" 호출됩니다
  reply.send(error)
})
fastify.get('/', (request, reply) => {
  const maybeAnArray = request.body.something ? [] : 'I am a string'
  maybeAnArray.substr() // Thrown: [].substr is not a function, but it is handled
})
```

## 그 외 추가되거나 향상된 사항

- 훅은 이제 등록된 방법과 상관없이 지속적인 컨텍스트를 가지게 되었습니다
([#2005](https://github.com/fastify/fastify/pull/2005))
- [`request.raw`](Request.md)와 [`reply.raw`](Reply.md)에서 `request.req`와 `reply.res`는 더 이상 사용되지 않습니다 ([#2008](https://github.com/fastify/fastify/pull/2008))
- `modifyCoreObjects` 옵션을 제거했습니다 ([#2015](https://github.com/fastify/fastify/pull/2015))
- [`connectionTimeout`](Server.md#factory-connection-timeout) 옵션을 추가했습니다 ([#2086](https://github.com/fastify/fastify/pull/2086))
- [`keepAliveTimeout`](Server.md#factory-keep-alive-timeout) 옵션을 추가했습니다 ([#2086](https://github.com/fastify/fastify/pull/2086))
- [plugins](Plugins.md#async-await)에 async-await 지원을 추가했습니다 ([#2093](https://github.com/fastify/fastify/pull/2093))
- 객체를 오류로 취급할 수 있게 변경했습니다 ([#2134](https://github.com/fastify/fastify/pull/2134))
