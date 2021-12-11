# Fastify 스타일 가이드

## 시작하기

*Fastify 스타일 가이드*에 오신 것을 환영합니다.
이 가이드는 개발자 문서를 작성하고 계시거나 오픈소스 프레임워크를 작성하고 계신 여러분을 위해 관습적인 필기체를 알려드리기 위해 만들어졌습니다.
각각의 구간은 사용자가 문서를 쉽고 정확하게 이해할 수 있는 문서를 작성할 수 있도록 여러분에게 정확하고 잘 설명해줄 것입니다.

## 이 가이드를 읽어야 하는 사람은 누구인가요?

이 가이드는 Fastify를 만들고 싶어하거나 저희의 문서에 기여하고자 하는 모든 분들을 위한 것입니다.
기술 문서 작성에 있어서 꼭 전문가가 되어야 하는 것은 아닙니다.
이 가이드가 여러분을 돕기 위해 여기에 있습니다.

저희의 오픈소스 동료가 되기 위해서는 저희 웹 사이트의 [기여](https://www.fastify.io/contribute) 페이지를 방문하시거나 GitHub의 [CONTRIBUTING.md](https://github.com/fastify/fastify/blob/main/CONTRIBUTING.md) 파일을 읽어주세요.

## 작성 전

여러분은 다음의 것들에 대해 알아야 할 필요가 있습니다:

* JavaScript
* Node.js
* Git
* GitHub
* Markdown
* HTTP
* NPM

### 청중을 고려하세요

글을 적어나가기 시작하기 전에 여러분의 청중에 대해 생각해보세요.
이 경우에는 여러분의 청중은 분명히 이미 HTTP, JavaScript, NPM, 그리고 Node.JS를 알고 있을 것입니다.
이 것은 저희 글을 읽게 될 독자를 생각하는 것이며 필수적입니다.
여러분은 분명 청중에게 가능한 한 많은 유용한 정보를 전달하고 싶으실 겁니다.
그들이 알아야할 필수적인 것과 그들이 어떻게 이해할지 생각해보세요.
독자들이 쉽게 관계지을 수 있는 용어를 사용하세요.
커뮤니티에 의견을 물어보는 것은 여러분이 성취하고자 하는 사용자 입장에서 생각하는 더 나은 문서화 작업을 할 수 있게 도울 수 있습니다.

### 핵심에 다가가기

독자들에게 그들이 해야 할 정확하고 명확한 동작을 설명하세요.
무엇이 가장 중요한지 설명하는 것부터 시작해야 합니다.
이 방식으로 당신은 독자들이 찾고자 하는 것을 더욱 빨리 찾도록 할 수 있습니다.
주로 독자들은 페이지를 스크롤하지 않고 첫 번째 콘텐츠만 보는 경향이 있기 때문입니다.

**예시**

피하세요: 콜론은 동적 경로를 등록하는데 있어서 굉장히 중요합니다.
이 것은 프레임워크에게 새로운 파라메터가 생성되었다는 것을 알립니다.
콜론을 파라메터 이름 앞에 위치시켜 동적 경로를 생성할 수 있습니다.

이렇게 하세요: 동적 경로를 등록하기 위해서는 파라메터 이름 앞에 콜론을 넣으세요.
콜론을 사용하여 프레임워크에게 이것이 정적이 아닌 동적 경로라는 것을 알릴 수 있습니다.

### 영상이나 이미지를 추가하는 것을 피하세요

문서에 영상이나 스크린샷을 추가하지 마세요.
이렇게 하면 버전 관리에서 더 관리하기가 쉽습니다.
영상과 이미지는 결국에 새로운 업데이트가 출시됨에 따라서 더 이상 사용하지 못할 가능성이 농후합니다.
대신 참고 링크나 YouTube 영상을 추가하세요.
마크다운에서 `[Title](www.websitename.com)`와 같은 형식으로 추가할 수 있습니다.

**예시**

```
훅에 대해서 더 알아보길 원하신다면 [Fastify 훅](https://www.fastify.io/docs/latest/Hooks)을 보세요.
```

결과:
> 훅에 대해서 더 알아보길 원하신다면 [Fastify 훅](https://www.fastify.io/docs/latest/Hooks)을 보세요.

### 표절하지 마세요

다른 사람들의 작업물을 빼앗지 않도록 하세요.
여러분들의 고유한 작업물을 가능한 한 최대한 유지하세요.
여러분은 그들이 무엇을 했는지 배울 수 있고 인용했다면 그것의 출처를 표기할 수도 있습니다.

## 단어 선택

There are a few things you need to use and avoid when writing your documentation to improve readability for readers and make documentation neat, direct, and clean.


### When to use the second person "you" as the pronoun

When writing articles or guides, your content should communicate directly to readers in the second person ("you") addressed form. It is easier to give them direct instruction on what to do on a particular topic. To see an example, visit the [Plugins-guide.md](Plugins-Guide.md) page on Github.

**Example**

Less like this: we can use the following plugins.

More like this: You can use the following plugins.

> According to [Wikipedia](#), ***You*** is usually a second person pronoun. Also, used to refer to an indeterminate person, as a more common alternative to a very formal indefinite pronoun.

## When to avoid the second person "you" as the pronoun

One of the main rules of formal writing such as reference documentation, or API documentation, is to avoid the second person ("you") or directly addressing the reader.

**Example**

Less like this: You can use the following recommendation as an example.

More like this: As an example, the following recommendations should be referenced.

To view a live example, refer to the [Decorators.md](Decorators.md) reference document.


### Avoid using contractions

Contractions are the shortened version of written and spoken forms of a word, i.e. using "don't" instead of "do not".
Avoid contractions to provide a more formal tone.

### Avoid using condescending terms

Condescending terms are words that include:

* Just
* Easy
* Simply
* Basically
* Obviously

The reader may not find it easy to use Fastify's framework and plugins; avoid words that make it sound simple, easy, offensive, or insensitive. Not everyone who reads the documentation has the same level of understanding.


### Starting with a verb

Mostly start your description with a verb, which makes it simple and precise for the reader to follow. Prefer using present tense because it is easier to read and understand than the past or future tense.

**Example**

 Less like this: There is a need for Node.js to be installed before you can be able to use Fastify.

 More like this: Install Node.js to make use of Fastify.

### Grammatical moods

Grammatical moods are a great way to express your writing. Avoid sounding too bossy while making a direct statement. Know when to switch between indicative, imperative, and subjunctive moods.


**Indicative** - Use when making a factual statement or question.

Example: Since there is no testing framework available, "Fastify recommends ways to write tests".

**Imperative** - Use when giving instructions, actions, commands, or when you write your headings.

Example: Install dependencies before starting development.


**Subjunctive** -  Use when making suggestions, hypotheses, or non-factual statements.

Example: Reading the documentation on our website is recommended to get comprehensive knowledge of the framework.

### Use **active** voice instead of **passive**

Using active voice is a more compact and direct way of conveying your documentation.

**Example**


Passive: The node dependencies and packages are installed by npm.

Active:  npm installs packages and node dependencies.

## Writing Style

### Documentation titles

When creating a new guide, API, or reference in the `/docs/` directory, use short titles that best describe the topic of your documentation. Name your files in kebab-cases and avoid Raw or camelCase. To learn more about kebab-case you can visit this medium article on [Case Styles](https://medium.com/better-programming/string-case-styles-camel-pascal-snake-and-kebab-case-981407998841).

**Examples**: <br/>
>`hook-and-plugins.md`, <br/>
 `adding-test-plugins.md`, <br/>
 `removing-requests.md`.

### Hyperlinks

Hyperlinks should have a clear title of what it references.
Here is how your hyperlink should look:

```MD
<!-- More like this -->

// Add clear & brief description
[Fastify Plugins] (https://www.fastify.io/docs/latest/Plugins/)

<!--Less like this -->

// incomplete description
[Fastify] (https://www.fastify.io/docs/latest/Plugins/)

// Adding title in link brackets
[](https://www.fastify.io/docs/latest/Plugins/ "fastify plugin")

// Empty title
[](https://www.fastify.io/docs/latest/Plugins/)

// Adding links localhost URLs instead of using code strings (``)
[http://localhost:3000/](http://localhost:3000/)

```

Include in your documentation as many essential references as possible, but avoid having numerous links when writing for beginners to avoid distractions.
