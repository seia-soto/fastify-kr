# 요청

핸들러 함수의 첫 번째 파라메터는 `Request`입니다.<br/>
요청은 다음 속성들을 가지고 있는 Fastify의 핵심 객체입니다:
- `query` - 파싱된 쿼리스트링이며 형태는 [`querystringParser`](Server.md#querystringparser)에 의해 지정됩니다
- `body` - 본문입니다
- `params` - URL에 매칭된 파라메터입니다
- [`headers`](#headers) - 헤더의 getter와 setter입니다
- `raw` - Node.JS 코어에 기반한 들어오는 HTTP 요청입니다
- `req` *(더 이상 사용되지 않음, `.raw`를 대신 사용하세요)* - Node.JS 코어에 기반한 들어오는 HTTP 요청입니다
- `server` - Fastify의 서버 인스턴스이며 현재 [캡슐화 컨텍스트](Encapsulation.md)로 스코핑됩니다
- `id` - 현재 요청 ID입니다
- `log` - 들어오는 요청에 대한 로깅 인스턴스입니다
- `ip` - 들어오는 요청의 IP 주소입니다
- `ips` - `X-Forwarded-For` 헤더에 적힌 IP 주소들의 배열이며 가까운 지점부터 배치됩니다 ([`trustProxy`](Server.md#factory-trust-proxy) 옵션이 활성화되었을 때만 사용가능합니다)
- `hostname` - 들어오는 요청의 호스트이름입니다 ([`trustProxy`](Server.md#factory-trust-proxy) 옵션이 활성화되었다면 `X-Forwarded-Host`에서 가져오게 됩니다)
- `protocol` - 들어오는 요청의 프로토콜입니다 (`https` 혹은 `http`)
- `method` - 들어오는 요청의 메서드입니다
- `url` - 들어오는 요청의 URL입니다
- `routerMethod` - 현재 요청을 처리하는 라우터에 지정된 메서드입니다
- `routerPath` - 현재 요청을 처리하는 라우터에 지정된 경로 패턴입니다
- `is404` - 404 핸들러에 의해서 처리된다면 true가 되고 그렇지 않으면 false가 됩니다
- `connection` - 더 이상 사용되지 않으며 `socket`을 대신 사용해야 합니다. 들어오는 요청의 내부적인 커넥션입니다.
- `socket` - 들어오는 요청의 내부적인 커넥션입니다.
- `context` - Fastify의 내부 객체입니다. 직접적으로 사용하거나 수정해서는 안 됩니다. 이것은 특별한 키 하나에 접근할 때 유용합니다:
  - `context.config` - 라우팅의 [`config`](Routes.md#routes-config) 객체입니다

### 헤더

`request.headers`는 들어오는 요청의 헤더의 객체를 반환하는 getter입니다.
헤더를 다음과 같이 직접 지정할 수도 있습니다:

```js
request.headers = {
  'foo': 'bar',
  'baz': 'qux'
}
```

이 동작은 요청 헤더에 `request.headers.bar`로 읽을 수 있는 새로운 값들을 추가할 것입니다.
더 나아가, 여러분은 여전히 표준 요청 객체의 헤더를 `request.raw.headers` 속성을 통해 접근할 수 있습니다.

```js
fastify.post('/:params', options, function (request, reply) {
  console.log(request.body)
  console.log(request.query)
  console.log(request.params)
  console.log(request.headers)
  console.log(request.raw)
  console.log(request.server)
  console.log(request.id)
  console.log(request.ip)
  console.log(request.ips)
  console.log(request.hostname)
  console.log(request.protocol)
  console.log(request.url)
  console.log(request.routerMethod)
  console.log(request.routerPath)
  request.log.info('some info')
})
```
