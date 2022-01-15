# 오류

<a name="error-handling"></a>

### Node.JS에서의 오류 처리

#### 예상치 못한 오류
Node.JS에서 예상치 못한 오류들은 메모리 누수, 파일 설명자 유출, 혹은 다른 주요 프로덕션 문제를 일으킬 수 있습니다.
[Domains](https://nodejs.org/en/docs/guides/domain-postmortem/)는 이에 대한 실패한 사례입니다.

상식적으로 모든 예상치 못한 오류들을 처리하는 것은 불가능하지만 이것들을 다루는 가장 좋은 방법은 [크래시](https://nodejs.org/api/process.html#process_warning_using_uncaughtexception_correctly)를 내는 것입니다.

#### 프라미스에서의 오류 처리
Node.JS에서 처리되지 않은 프라미스 예외 (`.catch()` 핸들러가 없는 프라미스) 또한 메모리 누수와 파일 설명자 유출을 발생시킬 수 있습니다.
`unhandledRejection`이 Node.JS에서 더 이상 사용되지 않아 처리되지 않은 프라미스 예외는 발생하지 않겠지만 여전히 유출의 가능성이 있습니다.
[`make-promises-safe`](https://github.com/mcollina/make-promises-safe)와 같은 모듈을 사용하여 반드시 _언제나_ 처리되지 않은 프라미스 예외들이 발생하도록 해야 합니다.

만약 프라미스를 사용하고 있다면 반드시 `.catch()` 핸들러를 동적으로 추가하도록 하세요.

### Fastify의 오류들
Fastify는 all-or-nothing 접근을 따르고 되도록이면 효율적이도록 하고 있습니다.
개발자는 모든 오류가 적절하게 처리되게 만들어야 한다는 책임이 있습니다.

#### 입력 데이터의 오류
대부분의 오류는 예상치 못한 데이터 입력으로 발생하므로 저희는 [입력 데이터를 JSON 스키마를 사용하여 검증](Validation-and-Serialization.md)하는 것을 추천드립니다.

#### Fastify에서 예상치 못한 오류 잡기
Fastify는 가능한 많은 예상치 못한 오류를 성능 저하없이 잡으려고 노력하고 있습니다.
이것은 다음을 포함합니다:

1. 동적 라우팅, 예를 들어 `app.get('/', () => { throw new Error('kaboom') })`
2. `async` 라우팅, 예를 들어 `app.get('/', async () => { throw new Error('kaboom') })`

둘의 경우 모두 오류는 안전하게 처리될 것이고 Fastify의 기본 오류 핸들러로 범용 `500 Internal Server Error`로 전달될 것입니다.

이 동작을 직접 지정하려면 [`setErrorHandler`](Server.md#seterrorhandler)를 사용해야만 합니다.

### Fastify 생명 주기에서의 오류와 사용지 지정 오류 핸들러

[훅 문서](Hooks.md#manage-errors-from-a-hook)에서:
> 훅 실행 중 오류가 발생했을 때 그대로 `done()`에 보낸다면 Fastify가 자동으로 요청을 닫고 사용자에게 적절한 오류 코드를 전달할 것입니다.

만약 사용자 지정의 오류 핸들러를 `setErrorHandler`를 사용하여 정의하였다면 오류는 여기로 향하게 됩니다.
그렇지 않다면 그것은 Fastify의 범용 오류 핸들러로 전달될 것입니다.

오류 핸들러를 지정하기 전에 몇 가지 생각해야 할 것들이 있습니다:

- [일반적인 라우팅 핸들러](Reply.md#senddata)처럼 동작하도록 `reply.send(data)`를 사용할 수 있습니다.
	- 객체는 직렬화될 것이고 `preSerialization` 생명 주기 훅을 정의했다면 실행할 것입니다
	- 문자열, 버퍼, 혹은 스트림은 클라이언트에 적절한 헤더와 함께 전달될 것입니다 (직렬화없이)

- 직접 지정한 오류 핸들러에 오류를 전달할 수도 있습니다.
	- 오류 (새 오류 혹은 전달받은 error 파라메터가 다시 던져집니다) - `onError` 생명 주기 훅을 실행시키고 사용자에게 오류를 전달할 것입니다
	- 오류가 라이프사이클 훅에서 2번 호출되지 않을 것입니다 - Fastify가 내부적으로 오류의 발생을 확인하고 생명 주기의 응답 과정에서 무한히 오류가 던져지지 않도록 합니다. (라우팅 핸들러 이후에)

<a name="fastify-error-codes"></a>

### Fastify 오류 코드

<a name="FST_ERR_BAD_URL"></a>

#### FST_ERR_BAD_URL

라우터가 잘못된 URL을 전달받음.

<a name="FST_ERR_CTP_ALREADY_PRESENT"></a>

#### FST_ERR_CTP_ALREADY_PRESENT

해당 컨텐츠 타입 파서가 이미 정의됨.

<a name="FST_ERR_CTP_BODY_TOO_LARGE"></a>

#### FST_ERR_CTP_BODY_TOO_LARGE

요청 본문이 지정된 크기 제한보다 큼.

이 설정은 Fastify 서버 인스턴스에서 지정될 수 있습니다: [`bodyLimit`](Server.md#bodyLimit)

<a name="FST_ERR_CTP_EMPTY_TYPE"></a>

#### FST_ERR_CTP_EMPTY_TYPE

이 컨텐츠 타입은 빈 문자열이 될 수 없음.

<a name="FST_ERR_CTP_INVALID_CONTENT_LENGTH"></a>

#### FST_ERR_CTP_INVALID_CONTENT_LENGTH

요청 본문 크기가 Content-Length와 일치하지 않음.

<a name="FST_ERR_CTP_INVALID_HANDLER"></a>

#### FST_ERR_CTP_INVALID_HANDLER

잘못된 헤더가 컨텐츠 타입에 전달됨.

<a name="FST_ERR_CTP_INVALID_MEDIA_TYPE"></a>

#### FST_ERR_CTP_INVALID_MEDIA_TYPE

전달받은 미디어 타입은 지원되지 않음. (예를 들어 적절한 `Content-Type` 파서가 없는 경우)

<a name="FST_ERR_CTP_INVALID_PARSE_TYPE"></a>

#### FST_ERR_CTP_INVALID_PARSE_TYPE

파싱할 타입이 지원되지 않음. `string`이나 `buffer`만 허용됩니다.

<a name="FST_ERR_CTP_INVALID_TYPE"></a>

#### FST_ERR_CTP_INVALID_TYPE

`Content-Type`은 문자열이여야만 함.

<a name="FST_ERR_DEC_ALREADY_PRESENT"></a>

#### FST_ERR_DEC_ALREADY_PRESENT

같은 이름으로 이미 데코레이터가 등록됨.

<a name="FST_ERR_DEC_MISSING_DEPENDENCY"></a>

#### FST_ERR_DEC_MISSING_DEPENDENCY

데코레이터가 의존성이 존재하지 않아 등록될 수 없음.

<a name="FST_ERR_HOOK_INVALID_HANDLER"></a>

#### FST_ERR_HOOK_INVALID_HANDLER

훅의 콜백은 반드시 함수여야 함.

<a name="FST_ERR_HOOK_INVALID_TYPE"></a>

#### FST_ERR_HOOK_INVALID_TYPE

훅 이름은 반드시 문자열이여야 함.

<a name="FST_ERR_LOG_INVALID_DESTINATION"></a>

#### FST_ERR_LOG_INVALID_DESTINATION

로거가 `'stream'`이나 `'file'`을 출력으로 허용함.

<a name="FST_ERR_PROMISE_NOT_FULFILLED"></a>

#### FST_ERR_PROMISE_NOT_FULFILLED

응답코드가 204가 아니라면 프라미스는 'undefined'로 끝날 수 없음.

<a id="FST_ERR_REP_ALREADY_SENT"></a>

#### FST_ERR_REP_ALREADY_SENT

응답이 이미 전송됨.

<a name="FST_ERR_REP_INVALID_PAYLOAD_TYPE"></a>

#### FST_ERR_REP_INVALID_PAYLOAD_TYPE

응답 본문은 `string`이나 `Buffer`가 되어야 함.

<a name="FST_ERR_SCH_ALREADY_PRESENT"></a>

#### FST_ERR_SCH_ALREADY_PRESENT

`$id` 이름으로 된 스키마가 이미 존재함.

<a name="FST_ERR_SCH_MISSING_ID"></a>

#### FST_ERR_SCH_MISSING_ID

주어진 스키마는 `$id` 속성이 없음.

<a name="FST_ERR_SCH_SERIALIZATION_BUILD"></a>

#### FST_ERR_SCH_SERIALIZATION_BUILD

라우팅 응답 직렬화를 위해 주어진 JSON 스키마가 올바르지 않음.

<a name="FST_ERR_SCH_VALIDATION_BUILD"></a>

#### FST_ERR_SCH_VALIDATION_BUILD

검증을 위해 주어진 JSON 스키마가 올바르지 않음.

<a id="FST_ERR_SEND_INSIDE_ONERR"></a>

#### FST_ERR_SEND_INSIDE_ONERR

`onError` 훅 내부에서는 `send`를 사용할 수 없음.

<a name="FST_ERR_SEND_UNDEFINED_ERR"></a>

#### FST_ERR_SEND_UNDEFINED_ERR

정의되지 않은 오류가 발생함.
