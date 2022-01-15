# 컨텐츠 타입 파서

Fastify는 `'application/json'`과 `'text/plain'`만 지원하며 `utf-8` 인코딩을 기본값으로 사용합니다.
다른 컨텐츠 타입 지원을 위해서는 `addContentTypeParser` API를 사용해야 합니다.

*내장된 JSON과 텍스트 바디 파서는 변경되거나 제거될 수 있습니다.*

*참고: `Content-Type`에 따른 컨텐츠 타입 파서를 만들기로 했다면 UTF-8이 기본값이 되지 않기 때문에 `text/html; charset=utf-8`과 같이 UTF-8을 포함해야 합니다.*

타 API들과 마찬가지로 `addContentTypeParser`는 스코프 내에서 캡슐화됩니다.
최상단 스코프에 정의하면 모든 곳에 사용할 수 있다는 것이고 플러그인 내부에 정의할 경우에는 플러그인과 하위 스코프에서만 사용 가능하다는 것입니다.

Fastify는 파싱된 본문을 [Fastify 요청](Request.md) 객체에 `request.body`로 접근할 수 있게 속성을 추가합니다.

## 사용법

```js
fastify.addContentTypeParser('application/jsoff', function (request, payload, done) {
  jsoffParser(payload, function (err, body) {
    done(err, body)
  })
})

// 하나의 함수로 여러 Content-Type 처리하기
fastify.addContentTypeParser(['text/xml', 'application/xml'], function (request, payload, done) {
  xmlParser(payload, function (err, body) {
    done(err, body)
  })
})

// Node 버전 >= 8.0.0부터는 async도 지원됩니다
fastify.addContentTypeParser('application/jsoff', async function (request, payload) {
  var res = await jsoffParserAsync(payload)

  return res
})

// 정규식에 부합하는 모든 경우를 처리하기
fastify.addContentTypeParser(/^image\/.*/, function (request, payload, done) {
  imageParser(payload, function (err, body) {
    done(err, body)
  })
})

// 기본적인 JSON/텍스트 파서를 다른 컨텐츠 타입에도 사용할 수 있습니다
fastify.addContentTypeParser('text/json', { parseAs: 'string' }, fastify.getDefaultJsonParser('ignore', 'ignore'))
```

Fastify는 `RegExp` 매칭 전에 `string` 값으로 등록된 컨텐츠 파서를 먼저 확인하고 시도합니다.
컨텐츠 파서를 덮어씌우는 경우에는 Fastify는 마지막으로 주어진 컨텐츠 파서부터 사용하려고 할 것입니다.
그래서 범용 컨텐츠 타입을 세부적으로 지정하기 위해서는 아래와 같이 먼저 범용의 것을 정의하고 그 이후에 세부적인 것들을 정의해야 합니다.

```js
// 여기에서는 첫 번째의 것도 매칭되기 때문에 두 번째 컨텐츠 타입 파서만 호출됩니다
fastify.addContentTypeParser('application/vnd.custom+xml', (request, body, done) => {} )
fastify.addContentTypeParser('application/vnd.custom', (request, body, done) => {} )

// fastify가 `application/vnd.custom+xml`을 먼저 매칭하려고 하기 때문에 이것이 저희가 원했던 동작입니다
fastify.addContentTypeParser('application/vnd.custom', (request, body, done) => {} )
fastify.addContentTypeParser('application/vnd.custom+xml', (request, body, done) => {} )
```

`addContentTypeParser` API 뿐만 아니라 사용가능한 더 많은 API들이 있습니다.
또 `hasContentTypeParser`, `removeContentTypeParser`, 그리고 `removeAllciontentTypeParsers`도 있습니다.

### hasContentTypeParser

특정한 컨텐츠 타입 파서가 있는지 확인하기 위해 `hasContentTypeParser`를 사용할 수 있습니다.

```js
if (!fastify.hasContentTypeParser('application/jsoff')){
  fastify.addContentTypeParser('application/jsoff', function (request, payload, done) {
    jsoffParser(payload, function (err, body) {
      done(err, body)
    })
  })
}
```

### removeContentTypeParser

`removeContentTypeParser`를 사용하면 하나의 혹은 배열로된 컨텐츠 타입들을 제거할 수 있습니다.
이 메서드는 `string`과 `RegExp`로 된 컨텐츠 타입 모두를 지원합니다.

```js
fastify.addContentTypeParser('text/xml', function (request, payload, done) {
  xmlParser(payload, function (err, body) {
    done(err, body)
  })
})

// text/html만 사용가능하도록 내장된 컨텐츠 타입 파서들을 모두 제거합니다
fastify.removeContentTypeParser(['application/json', 'text/plain'])
```

### removeAllContentTypeParsers

방금 전 위의 예제와 같이 제거하고 싶은 특정 컨텐츠 타입을 모두 지정해야 한다는 점을 알 수 있습니다.
Fastify는 이러한 문제점 해결을 위해 `removeAllContentTypeParsers` API를 제공합니다.
이는 현재 사용되는 모든 컨텐츠 타입 파서를 제거하는데에 사용할 수 있습니다.
이를 사용하여 저희는 예제에서 각각의 컨텐츠 타입 파서를 모두 지정하지 않고도 위 예제와 같은 동작을 구현할 수 있습니다.
`removeContentTypeParser`와 마찬가지로 이 API도 캡슐화를 지원합니다.
내장 파서들을 무시하면서 모든 컨텐츠 타입에서 실행되어야 하는 [catch-all 컨텐츠 타입 파서](#Catch-All)를 등록하려는 경우 특히 유용합니다.

```js
fastify.removeAllContentTypeParsers()

fastify.addContentTypeParser('text/xml', function (request, payload, done) {
  xmlParser(payload, function (err, body) {
    done(err, body)
  })
})
```

**경고**: `function (req, done)`이나 `async function (req)`와 같은 오래된 문법들은 여전히 지원되지만 더 이상 사용되지는 않습니다.

### Body 파서

요청의 본문은 2가지 방법으로 해석될 수 있는데 첫 번째 방법은 직접 컨텐츠 타입 파서를 추가하고 요청 스트림을 처리하는 것으로 위에서 설명하였습니다.
그리고 두 번째는 본문을 어떻게 처리할 것인지 원하는 곳에 `parseAs` 옵션을 `addContentTypeParser` API에 전달하는 것입니다.
`parseAs` 옵션은 `'string'`이나 `'buffer'` 타입이 되어야만 하며 Fastify는 내부에서 스트림을 처리하고 [최대 크기](Server.md#factory-body-limit)와 컨텐츠 길이같은 것들을 확인할 것입니다.
이러한 제한을 초과하는 경우에 직접 지정하신 파서는 실행되지 않습니다.

```js
fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
  try {
    var json = JSON.parse(body)
    done(null, json)
  } catch (err) {
    err.statusCode = 400
    done(err, undefined)
  }
})
```

[`example/parser.js`](../examples/parser.js)를 예시로 확인해보세요.

### 커스텀 파서 옵션

+ `parseAs` (string): `'string'`과 `'buffer'` 모두 들어오는 데이터가 어떻게 수집되어야 할지 가리키며 기본값은 `'buffer'`입니다.
+ `bodyLimit` (number): 커스텀 파서가 허용하는 최대 본문 크기를 바이트로 작성합니다. 기본값은 [`Fastify factory function`](Server.md#body-limit)에 전달된 전역 본문 크기 제한입니다.

### Catch-All

컨텐츠 타입과 상관없이 모든 요청을 처리해야 하는 몇몇 상황들이 있습니다.
Fastify를 사용하면 `'*'` 컨텐츠 타입을 지정하기만 하면 됩니다.

```js
fastify.addContentTypeParser('*', function (request, payload, done) {
  var data = ''
  payload.on('data', chunk => { data += chunk })
  payload.on('end', () => {
    done(null, data)
  })
})
```

이렇게 하면 올바른 컨텐츠 타입 파서를 가지지 않은 모든 요청들은 지정된 함수에서 처리될 것입니다.

또한 이것은 요청 스트림을 파이핑하는데에도 유용합니다.
컨텐츠 파서를 다음과 같이 작성할 수 있습니다:

```js
fastify.addContentTypeParser('*', function (request, payload, done) {
  done()
})
```

그리고 원하는 곳에 파이핑하기 위해 핵심 HTTP 요청에 즉시 접근할 수 있습니다:

```js
app.post('/hello', (request, reply) => {
  reply.send(request.raw)
})
```

아래는 들어오는 [json line](https://jsonlines.org/) 객체들을 로그하는 완전한 예제입니다:

```js
const split2 = require('split2')
const pump = require('pump')

fastify.addContentTypeParser('*', (request, payload, done) => {
  done(null, pump(payload, split2(JSON.parse)))
})

fastify.route({
  method: 'POST',
  url: '/api/log/jsons',
  handler: (req, res) => {
    req.body.on('data', d => console.log(d)) // 들어오는 모든 객체를 로깅합니다
  }
})
```

파일 업로드를 파이핑할 때에는 [fastify-multipart](https://github.com/fastify/fastify-multipart)에 관심이 있으실 겁니다.

컨텐츠 타입 파서가 정말 지정된 것이 없는 컨텐츠 타입 뿐만 아니라 모든 컨텐츠 타입에서 실행되길 원하시는 경우 `removeAllContentTypeParsers`를 반드시 먼저 실행해야 합니다.

```js
// 이것을 실행하지 않는다면 application/json 타입의 요청 본문은 내장된 json 파서에 의해 처리될 것입니다
fastify.removeAllContentTypeParsers()

fastify.addContentTypeParser('*', function (request, payload, done) {
  var data = ''
  payload.on('data', chunk => { data += chunk })
  payload.on('end', () => {
    done(null, data)
  })
})
```
