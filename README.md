# Fastify-KR

Fastify-KR은 docusaurus로 만들어진 비공식 Fastify 한국어 웹 사이트입니다.

> Fastify-KR is unofficial Korean Fastify website built with docusaurus.

- [Translation](#translation)

----

# Translation

번역을 어떻게 해야 하는데 설명하는 문서입니다.

> 주로 CONTRIBUTION.md 등에 서술하는 내용이기도 하지만 편의 상 README.md에서 관리합니다.

## Stages

현재 번역을 진행하는데에는 정해진 단계가 있습니다.

> 이 단계들은 더 효율적인 방법이 있다면 언제든지 교체될 수 있으니 언제든 **제안**해주세요!

1. **Stage 1**

Fastify 공식 레포지토리에서 새로운 릴리즈가 발생했을 때의 상황입니다.
시작하려면 먼저 이 레포지토리를 로컬에 클론한 뒤에 `github:fastify/fastify`를 `upstream` 원격 레포지토리로 설정해야 합니다.

```
git remote add upstream https://github.com/fastify/fastify
```

그리고 새 문서를 다운로드합니다.

> **중요!**
> 아래 명령어는 새 번역이 있을 때에만 실행해주세요. 기존 번역을 덮어씌울 것입니다.

```
yarn docs:update
```

Fastify의 기존 문서들은 Docusaurus가 사용하는 MDX와 호환되지 않기 때문에 명령어를 실행하여 먼저 이를 고쳐야 합니다.

```
yarn docs:fix
```

2. **Stage 2**

Stage 2는 이미 Stage 1을 거쳤으므로 기존 번역을 사용가능한 상태라고 볼 수 있습니다.
현재 어떤 버전의 번역이 진행 중인지 알고 싶으시다면 [`version.json`](/version.json)을 참고해주세요.

이제 더 별다른 과정없이 번역을 시작하면 됩니다!

3. **Stage 3**

번역이 완료되면 이제 Docusaurus 태그 기능을 사용하여 새로운 릴리즈를 만듭니다.

```
yarn create-version v[VERSION]
```

그리고 [`version.json`](/version.json)을 적절히 수정해주세요.

## 몇 가지 규칙

저는 문서가 읽는 편의에 대해서 중점을 맞춰서 작성되어야 한다고 생각합니다.
그래서 꼭 여러분이 맞춤법 등을 강력하게 지켜야 한다고는 생각하지 않아요.
읽기 편하게 작성해주세요.

**원문의 번역이라고는 하지만 여러분의 생각이 충분히 들어갈 수 있습니다.**

1. `you`의 번역

`you`라는 단어는 없는 것이 자연스러우나 번역 시에 필요로 하게 될 수 있습니다.
이 때 문맥에 맞추어서 다음 중 하나로 번역할 수 있습니다:

- 여러분
- 당신
- (생략)

2. 문장 끝에 _다음_ 등으로 추가되는 콜론

**그대로 써주세요.**
이유는 그 뒤에 나오는 정렬된 컨텐츠들이 읽기 쉽기 때문입니다.
