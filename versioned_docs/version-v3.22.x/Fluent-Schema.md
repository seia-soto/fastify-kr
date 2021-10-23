# Fluent 스키마

[검증과 직렬화](Validation-and-Serialization.md) 문서는 입력을 검증하고 출력을 효율적으로 하기 위해 JSON 스키마 검증과 직렬화를 설정하도록 Fastify가 허락하는 모든 파라메터를 언급합니다.

[`fluent-json-schema`](https://github.com/fastify/fluent-json-schema)는 이런 과정을 상수의 재사용을 가능케하여 단순히 합니다.

### 기본 설정

```js
const S = require('fluent-json-schema')

// DB를 쿼리하여 다음과 같은 값들을 가져올 수 있는 다음과 같은 객체가 있다고 합시다
const MY_KEYS = {
  KEY1: 'ONE',
  KEY2: 'TWO'
}

const bodyJsonSchema = S.object()
  .prop('someKey', S.string())
  .prop('someOtherKey', S.number())
  .prop('requiredKey', S.array().maxItems(3).items(S.integer()).required())
  .prop('nullableKey', S.mixed([S.TYPES.NUMBER, S.TYPES.NULL]))
  .prop('multipleTypesKey', S.mixed([S.TYPES.BOOLEAN, S.TYPES.NUMBER]))
  .prop('multipleRestrictedTypesKey', S.oneOf([S.string().maxLength(5), S.number().minimum(10)]))
  .prop('enumKey', S.enum(Object.values(MY_KEYS)))
  .prop('notTypeKey', S.not(S.array()))

const queryStringJsonSchema = S.object()
  .prop('name', S.string())
  .prop('excitement', S.integer())

const paramsJsonSchema = S.object()
  .prop('par1', S.string())
  .prop('par2', S.integer())

const headersJsonSchema = S.object()
  .prop('x-foo', S.string().required())

// `.valueOf()`를 호출할 필요가 없음을 명심하세요!
const schema = {
  body: bodyJsonSchema,
  querystring: queryStringJsonSchema, // (혹은) query: queryStringJsonSchema
  params: paramsJsonSchema,
  headers: headersJsonSchema
}

fastify.post('/the/url', { schema }, handler)
```

### 재사용

`fleunt-json-schema`와 함께라면 스키마를 더욱 더 쉽고 프로그래밍적으로 조작하고 `addSchema()` 메서드를 사용하여 재사용할 수 있습니다.
또 동시에 이 스키마를 2개의 방식으로 참조할 수도 있습니다.
자세히는 [검증과 직렬화](Validation-and-Serialization.md#adding-a-shared-schema) 문서에 나와있습니다.

여기에 몇 가지 사용 예가 있습니다:

**`$ref-방식`**: 외부 스키마로 참조.

```js
const addressSchema = S.object()
  .id('#address')
  .prop('line1').required()
  .prop('line2')
  .prop('country').required()
  .prop('city').required()
  .prop('zipcode').required()

const commonSchemas = S.object()
  .id('https://fastify/demo')
  .definition('addressSchema', addressSchema)
  .definition('otherSchema', otherSchema) // 필요한 그 어떤 스키마라도 추가하세요

fastify.addSchema(commonSchemas)

const bodyJsonSchema = S.object()
  .prop('residence', S.ref('https://fastify/demo#address')).required()
  .prop('office', S.ref('https://fastify/demo#/definitions/addressSchema')).required()

const schema = { body: bodyJsonSchema }

fastify.post('/the/url', { schema }, handler)
```

**`replace-방식`**: 검증 절차 전에 공유된 스키마를 참조하여 교체합니다.

```js
const sharedAddressSchema = {
  $id: 'sharedAddress',
  type: 'object',
  required: ['line1', 'country', 'city', 'zipcode'],
  properties: {
    line1: { type: 'string' },
    line2: { type: 'string' },
    country: { type: 'string' },
    city: { type: 'string' },
    zipcode: { type: 'string' }
  }
}
fastify.addSchema(sharedAddressSchema)

const bodyJsonSchema = {
  type: 'object',
  properties: {
    vacation: 'sharedAddress#'
  }
}

const schema = { body: bodyJsonSchema }

fastify.post('/the/url', { schema }, handler)
```

`fastify.addSchema`를 사용할 때에는 `$ref-방식`과 `replace-방식` 모두 섞어 사용할 수 있습니다.
