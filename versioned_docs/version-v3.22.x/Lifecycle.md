# 생명 주기

다음은 Fastify의 내부적 생명 주기 스키마입니다.<br/>
각각의 항목의 오른쪽 부분은 생명 주기의 다음 단계이고 왼쪽 부분은 오류가 발생하는 경우 그에 해당하는 생성될 오류 코드입니다.
*(모든 오류는 자동으로 Fastify에서 처리될 것이라는 점을 명심하세요)*.

```
Incoming Request
  │
  └─▶ Routing
        │
        └─▶ Instance Logger
             │
   4**/5** ◀─┴─▶ onRequest Hook
                  │
        4**/5** ◀─┴─▶ preParsing Hook
                        │
              4**/5** ◀─┴─▶ Parsing
                             │
                   4**/5** ◀─┴─▶ preValidation Hook
                                  │
                            400 ◀─┴─▶ Validation
                                        │
                              4**/5** ◀─┴─▶ preHandler Hook
                                              │
                                    4**/5** ◀─┴─▶ User Handler
                                                    │
                                                    └─▶ Reply
                                                          │
                                                4**/5** ◀─┴─▶ preSerialization Hook
                                                                │
                                                                └─▶ onSend Hook
                                                                      │
                                                            4**/5** ◀─┴─▶ Outgoing Response
                                                                            │
                                                                            └─▶ onResponse Hook
```

어떤 지점 이전에든 혹은 `User Handler` 중에, `reply.hijack()`이 Fastify가 다음 동작을 하는 것을 막기 위해 호출될 수 있습니다:
- 이어지는 모든 훅과 유저 핸들러 실행
- 응답을 자동으로 보내기

NB (*): 만약 `reply.raw`가 사용자에게 응답을 다시 보내기 위해 사용되었다면 `onResponse` 훅은 여전히 실행될 것입니다.

## 응답 생명 주기

언제든지 사용자가 요청을 처리하면 결과는 다음과 같을 것입니다:

- 비동기 핸들러에서: 본문을 반환합니다
- 비동기 핸들러에서: `Error`를 던집니다
- 동기 핸들러에서: 본문을 전달합니다
- 동기 핸들러에서: `Error` 인스턴스를 전달합니다

만약 응답이 중간에 정지되었다면, 저희는 아래의 모든 과정을 넘겨버릴 것입니다.
그렇지 않다면, 응답이 전송되었다면 데이터 흐름이 다음과 같이 진행됩니다:

```
                        ★ schema validation Error
                                    │
                                    └─▶ schemaErrorFormatter
                                               │
                          reply sent ◀── JSON ─┴─ Error instance
                                                      │
                                                      │         ★ throw an Error
                     ★ send or return                 │                 │
                            │                         │                 │
                            │                         ▼                 │
       reply sent ◀── JSON ─┴─ Error instance ──▶ setErrorHandler ◀─────┘
                                                      │
                                 reply sent ◀── JSON ─┴─ Error instance ──▶ onError Hook
                                                                                │
                                                                                └─▶ reply sent
```

참고 사항: `reply sent`는 JSON 본문이 다음 것들로 직렬화된다는 것을 의미합니다:

- [응답 직렬화기](Server.md#setreplyserializer)가 설정되었거나
- 또는 JSON 스키마가 응답 HTTP 코드에 지정되었다면 [직렬화 컴파일러](Server.md#setserializercompiler)에 의해 직렬화되거나
- 또는 기본적인 `JSON.stringify` 함수로 직렬화됩니다
