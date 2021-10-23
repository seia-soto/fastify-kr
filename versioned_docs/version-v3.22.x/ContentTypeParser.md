# 컨텐츠 타입 파서

기본적으로 Fastify는 `'application/json'`과 `'text/plain'` 컨텐츠 타입만 지원합니다.
현재 기본적인 인코딩은 `utf-8`입니다.
만약에 다른 컨텐츠 타입을 지원하고 싶으시다면 `addContentTypeParser` API를 사용하실 수 있습니다.
*기본적인 JSON 혹은 순수 텍스트 파서는 변경되거나 제거될 수도 있습니다.*

*노트: 만약 당신이 `Content-Type` 헤더에 따라 자신만의 컨텐츠 타입 파서를 작성하기로 하였다면 UTF-8이 기본값이 되지 않을 것입니다. 반드시 `text/html; charset=utf-8`과 같이 UTF-8을 포함하도록 하세요.*

다른 API와 마찬가지로 `addContentTypeParser`는 현재 스코프 내에서 캡슐화되어 있습니다.
이것은 만약 당신이 최상단 스코프에 그것을 정의한다면 그것은 모든 곳에서 사용할 수 있을 것이라는 것입니다.
반면에 당신이 그것을 플러그인 내부에 정의하면 그것은 그 스코프와 하위 스코프들 내에서만 사용 가능해질 것입니다.

Fastify는 자동으로 파싱된 요청 본문을 [Fastify request](Request.md) object에 `request.body`로 접근할 수 있도록 추가해줍니다.

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

// 기본적인 JSON/Text 파서를 다른 컨텐츠 타입에도 사용할 수 있습니다
fastify.addContentTypeParser('text/json', { parseAs: 'string' }, fastify.getDefaultJsonParser('ignore', 'ignore'))
```

Fastify는 `RegExp`를 매칭하기 전에 `string` 값으로된 컨텐츠 파서를 먼저 매칭하려고 시도합니다.
만약 당신이 컨텐츠 파서를 덮어씌우고 있다면 Fastify는 마지막으로 주어진 컨텐츠 파서부터 첫 번째의 것 순서로 매칭하려고 할 것입니다.
그래서 만약 당신이 범용 컨텐츠 타입을 더 세부적으로 지정하고 싶다면 아래와 같이 먼저 범용 컨텐츠 타입을 정의하고 나중에 더 세부적인 것을 정의해야 합니다.

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
이 메서드는 `string`과 `RegExp` 컨텐츠 타입 모두를 지원합니다.

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

방금 전의 위의 예제처럼 저희는 저희가 제거하고 싶은 특정 컨텐츠 타입을 모두 지정해야 한다는 점을 알 수 있습니다.
이러한 문제점을 해결하기 위해 Fastify는 `removeAllContentTypeParsers` API를 제공합니다.
이것은 현재 사용되고 있는 존재하는 모든 컨텐츠 타입 파서들을 제거하는데에 사용될 수 있습니다.
아래의 예제에서 저희는 각각의 컨텐츠 타입 파서를 모두 지정하지 않고도 정확히 위의 예제와 같은 동작을 달성할 수 있습니다.
`removeContentTypeParser`와 같이 이 API도 캡슐화를 지원합니다.
이 당신이 내장 파서들을 무시하면서 모든 컨텐츠 타입에서 실행되어야 하는 [catch-all 컨텐츠 타입 파서](#Catch-All)를 등록하고 싶은 경우에 특별히 유용합니다.

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
당신은 요청의 본문을 2가지 방법으로 해석할 수 있습니다.
첫 번째 방법은 위에서 나왔습니다: 직접 컨텐츠 타입 파서를 추가하고 요청 스트림을 처리하는 것입니다.
그리고 두 번째는 본문을 어떻게 가지고 싶은지 원하는 곳에 `parseAs` 옵션을 `addContentTypeParser` API에 전달하는 것입니다.
이것은 `'string'`이나 `'buffer'` 타입이 되어야만 합니다.
만약 당신이 `parseAs` 옵션을 사용한다면 Fastify는 내부적으로 스트림을 처리하고 [최대 크기](Server.md#factory-body-limit)나 컨텐츠 길이와 같은 몇 가지 사항을 확인할 것입니다.
만약 제한 사항을 초과한 경우 커스텀 파서는 실행되지 않을 것입니다.

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

[`example/parser.js`](../examples/parser.js)를 예시로 보세요.

### 커스텀 파서 옵션
+ `parseAs` (string): `'string'`과 `'buffer'` 모두 들어오는 데이터가 어떻게 수집되어야 할지 가리킵니다. 기본값: `'buffer'`.
+ `bodyLimit` (number): 커스텀 파서가 허용하는 최대 본문 크기, 바이트로 작성해주세요. [`Fastify factory function`](Server.md#body-limit)에 전달된 전역 본문 크기 제한이 기본값입니다.

### Catch-All
컨텐츠 타입과 상관없이 모든 요청을 처리해야 하는 몇몇 상황들이 있습니다.
Fastify와 함께 당신은 그저 `'*'` 컨텐츠 타입을 지정하기만 하면 됩니다.
```js
fastify.addContentTypeParser('*', function (request, payload, done) {
  var data = ''
  payload.on('data', chunk => { data += chunk })
  payload.on('end', () => {
    done(null, data)
  })
})
```

이것을 사용함으로써 올바른 컨텐츠 타입 파서를 가지지 않은 모든 요청들은 이 지정된 함수에서 처리될 것입니다.

또한 이것은 요청 스트림을 파이핑하는데에도 유용합니다.
당신은 그저 컨텐츠 파서를 다음과 같이 작성할 수 있습니다:

```js
fastify.addContentTypeParser('*', function (request, payload, done) {
  done()
})
```

그리고 원하는 곳에 파이핑하기 위해 핵심 HTTP 요청에 즉시 접근합니다:

```js
app.post('/hello', (request, reply) => {
  reply.send(request.raw)
})
```

여기 들어오는 [json line](https://jsonlines.org/) 객체들을 로그하는 완전한 예제가 있습니다:

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
    req.body.on('data', d => console.log(d)) // log every incoming object
  }
})
```

파일 업로드를 파이핑할 때에는 당신은 [이 플러그인](https://github.com/fastify/fastify-multipart)에 관심을 가지고 싶을 것입니다.

만약 당신이 컨텐츠 타입 파서가 정말로 지정된 것이 없는 컨텐츠 타입 뿐만 아니라 모든 컨텐츠 타입에 실행되길 원하신다면 반드시 `removeAllContentTypeParsers`를 먼저 실행해야 합니다.

```js
// 이것을 실행하지 않고서야 application/json 타입의 요청 본문은 내장된 json 파서에 의해 처리될 것입니다
fastify.removeAllContentTypeParsers()

fastify.addContentTypeParser('*', function (request, payload, done) {
  var data = ''
  payload.on('data', chunk => { data += chunk })
  payload.on('end', () => {
    done(null, data)
  })
})
```
