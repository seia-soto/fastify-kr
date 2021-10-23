# Fastify-KR

Fastify-KR은 docusaurus로 만들어진 비공식 Fastify 한국어 웹 사이트입니다.

> Fastify-KR is unofficial Korean Fastify website built with docusaurus.

## Contributing

Fastify-KR에 기여하는 방법은 여러가지가 있습니다.

### Translations

번역은 2단계로 진행됩니다.

#### Stage 1

Stage 1은 Fastify 공식 레포지토리에서 새로운 릴리즈가 발생했을 때의 상황입니다.
시작하려면 먼저 이 레포지토리를 로컬에 클론한 뒤에 `github:fastify/fastify`를 `upstream` 원격 레포지토리로 설정해야 합니다.

```
git remote add upstream https://github.com/fastify/fastify
```

그리고 문서를 다운로드합니다.

> **중요!**
> 아래 명령어는 새 번역이 있을 때에만 실행해주세요. 기존 번역을 덮어씌울 것입니다.

```
yarn docs:update
```

Fastify의 기존 문서들은 Docusaurus가 사용하는 MDX와 호환되지 않기 때문에 명령어를 실행하여 먼저 이를 고쳐야 합니다.

```
yarn docs:fix
```

#### Stage 2

Stage 2는 이미 Stage 1을 거쳤으므로 기존 번역을 사용가능한 상태라고 볼 수 있습니다.

별다른 과정없이 번역을 시작하면 됩니다!
