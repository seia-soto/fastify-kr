# 장기 지원

Fastify의 장기 지원 (LTS)은 현재 문서에 있는 스케쥴에 따라서 제공됩니다:

1. 주요 릴리즈, X.Y.Z [세만텍 버저닝][semver]의 "X" 릴리즈 버전들은 릴리즈 날짜 이후 최소 6개월동안 지원됩니다.
   그리고 버전들의 출시 일자들은 [https://github.com/fastify/fastify/releases](https://github.com/fastify/fastify/releases)에서 찾아볼 수 있습니다.

2. 주요 릴리즈는 다음 주요 릴리즈 이후 6개월 동안 보안 업데이트를 받게 됩니다.
   이 기간 이후에도 여전히 다른 제약 조건을 위반하지 않으면서 팀이 커뮤니티에 기반하여 보안 패치를 리뷰하고 출시할 것입니다.
   예를 들어서 다른 제약 조건은 최소 지원 Node.JS 버전과 같은 것들입니다.

3. 주요 릴리즈들은 Fastify LTS 출시 일정에 맞춰 [Node.JS LTS 정책](https://github.com/nodejs/Release)에 따라 지원되는 모든 Node.JS 출시 제품군은 검증되고 테스트될 것입니다.
   이것은 일정 내에 가장 최신 버전의 Node.JS 릴리즈만 지원될 것이라는 것을 내포하고 있습니다.

한 "달"은 연속된 30일로 정의됩니다.

> ## 세만틱 버저닝과 보안 릴리즈
>
> 주요 릴리즈에 장기 지원을 제공함에 따라 여기에는 중요한 변경 사항을 _마이너_ 버전으로 릴리즈해야 하는 문제가 있습니다.
> 이러한 변경 사항은 _언제나_ [릴리즈 노트](https://github.com/fastify/fastify/releases)에 언급될 것입니다.
>
> 자동으로 중대 변경 사항을 받는 것을 피하려면 `~`를 버전 범위에 사용하는 것이 가능합니다.
> 예를 들어서 3.15 릴리즈에 대한 패치를 받고 3.16 릴리즈를 받지 않으려면 의존성을 `"fastify": "~3.15.x"`와 같이 작성해야 합니다.
> 이것은 여러분의 애플리케이션을 취약한 상태로 남겨둘테니 꼭 주의해서 사용해야 합니다.

[semver]: https://semver.org/

<a name="lts-schedule"></a>

### 스케쥴

| 버전     | 릴리즈 일자     | LTS 지원 종료 기간 | Node.js              |
| :------ | :----------- | :-------------- | :------------------- |
| 1.0.0   | 2018-03-06   | 2019-09-01      | 6, 8, 9, 10, 11      |
| 2.0.0   | 2019-02-25   | 2021-01-31      | 6, 8, 10, 12, 14     |
| 3.0.0   | 2020-07-07   | TBD             | 10, 12, 14, 16       |

<a name="supported-os"></a>

### CI로 테스트된 운영체제

Fastify는 GitHub Actions를 CI 테스트에 사용합니다.
아래의 YAML 워크플로우 라벨에 따른 최신 가상 환경이 어떻게 관련되어 있는지 더 자세히 알아보기 위해서는 [워크플로우 runner에 관한 GitHub 문서](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners#supported-runners-and-hardware-resources)를 참고해주세요:

| OS      | YAML Workflow Label    | Package Manager           | Node.js      |
|---------|------------------------|---------------------------|--------------|
| Linux   | `ubuntu-latest`        | npm                       | 10,12,14,16  |
| Linux   | `ubuntu-18.04`         | yarn,pnpm                 | 10,12        |
| Windows | `windows-latest`       | npm                       | 10,12,14,16  |
| MacOS   | `macos-latest`         | npm                       | 10,12,14,16  |

[yarn](https://yarnpkg.com/)을 사용하는 것은 `--ignore-engines` 플래그를 필요로 할 수도 있습니다.
