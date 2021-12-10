# 권고 사항

이 문서는 Fastify를 사용할 때의 권장 사항들을 포함하고 있습니다.

* [리버스 프록시 사용하기](#reverseproxy)
* [쿠버네티스](#kubernetes)

## 리버스 프록시 사용하기
<a id="reverseproxy"></a>

Node.JS는 쉽게 사용할 수 있는 웹 서버를 표준 라이브러리에 내장한 선두 주자입니다.
이전에는 PHP나 Python과 같은 언어의 경우에는 이러한 언어를 지원하는 웹 서버가 필요하거나 함께 사용가능한 [GCI 게이트웨이][cgi]를 설정할 수 있는 능력이 요구되었습니다.
Node.JS의 경우에는 이제 _직접적으로_ HTTP 요청을 다룰 수 있는 애플리케이션을 작성할 수 있게 되었습니다.
그 결과로 여러 도메인과 여러 포트를 한 번에 처리가능하여 여러 애플리케이션을 직접적으로 인터넷에 노출시키기 위한 애플리케이션에 대한 요구가 생겨났습니다.

Fastify 팀은 이것이 *강력하게* 안티패턴과 나쁜 습관이 될 것으로 생각하고 있습니다:

1. 이것은 애플리케이션의 목적을 와해하므로써 필요하지 않은 복잡성을 추가합니다.
2. 이것은 [수평적 확장][scale-horiz]을 저지합니다.

리버스 프록시를 사용해야 하는 이유에 대해 더 많은 생각을 보기 위해 [Node.JS가 이미 프로덕션에 준비되어 있다면 왜 내가 리버스 프록시를 사용해야 하나요?][why-use]를 읽어보세요.

명확한 예제로 다음과 같은 상황을 생각해볼 수 있습니다:

1. 애플리케이션이 로드를 처리하기 위해 여러 인스턴스를 필요로 합니다.
1. 애플리케이션이 TLS 만료를 필요로 합니다.
1. 애플리케이션이 HTTP 요청을 HTTPS로 리디렉션 시켜야 합니다.
1. 애플리케이션이 여러 도메인에 제공되어야 합니다.
1. 애플리케이션이 정적 파일들을 제공해야 합니다. 예를 들어 jpeg 파일.

여기에는 많은 리버시 프록시 솔루션이 사용가능하고 여러분의 환경에서 사용할 솔루션을 말할 수도 있습니다, AWS나 GCP와 같이.
위의 것들 말고도 저희는 이러한 요구 사항을 타개하기 위해 [HAProxy][haproxy]나 [Nginx][nginx]와 같은 것들을 사용할 수도 있습니다:

### HAProxy

```conf
# 전역 섹션은 기본 HAProxy (엔진) 설정을 정의합니다.
global
  log /dev/log syslog
  maxconn 4096
  chroot /var/lib/haproxy
  user haproxy
  group haproxy

  # 몇 가지 기반이 될 TLS 옵션을 적어줍니다.
  tune.ssl.default-dh-param 2048
  ssl-default-bind-options no-sslv3 no-tlsv10 no-tlsv11
  ssl-default-bind-ciphers ECDH+AESGCM:DH+AESGCM:ECDH+AES256:DH+AES256:ECDH+AES128:DH+AES:RSA+AESGCM:RSA+AES:!aNULL:!MD5:!DSS
  ssl-default-server-options no-sslv3 no-tlsv10 no-tlsv11
  ssl-default-server-ciphers ECDH+AESGCM:DH+AESGCM:ECDH+AES256:DH+AES256:ECDH+AES128:DH+AES:RSA+AESGCM:RSA+AES:!aNULL:!MD5:!DSS

# 각각의 기본 섹션들은 다른 기본 섹션 전까지 각각의 다음 하위 섹션에 적용될 옵션을 정의합니다
defaults
  log   global
  mode  http
  option        httplog
  option        dontlognull
  retries       3
  option redispatch
  # 다음 옵션은 haproxy가 백엔드 서버로의 연결을 열어두는 대신 끊도록 만듭니다.
  # 이것은 Node.JS 프로세스의 예상치 못한 연결 재설정 오류를 완화시킬 수 있습니다.
  option http-server-close
  maxconn       2000
  timeout connect 5000
  timeout client 50000
  timeout server 50000

  # 특정 컨텐츠 형식에 대한 컨텐츠 압축을 활성화합니다.
  compression algo gzip
  compression type text/html text/plain text/css application/javascript

# "frontend" 부분은 공개적 응답기를 정의합니다, 예를 들어 클라이언트의 입장에서
# "http 서버"가 있습니다.
frontend proxy
  # 여기에 있는 IP 주소는 서버의 _공개_ IP가 되어야 합니다.
  # 여기, 저희는 내부 주소를 예시로 사용할 것입니다.
  bind 10.0.0.10:80
  # 이 리디렉션 규칙은 모든 TLS가 아닌 트래픽을 같은 URL을 가지도록 하여 HTTPS 포트로 리디렉션시킬 것입니다.
  redirect scheme https code 308 if !{ ssl_fc }
  # 기술적으로 이 use_backend 구문은 저희가 단순히 모든 트래픽을 frontend에서 HTTPS frontend로
  # 리디렉션시키고 있기 때문에 쓸모가 없습니다.
  # 이것은 단지 완성도를 위해 여기에 포함되었습니다.
  use_backend default-server

# 이 frontend는 저희가 주된, TLS만을 위한, 트래픽을 받도록 정의되고 있습니다.
# 이것은 저희가 노출할 TLS 인증서를 정의하고 어떻게 들어오는 요청을 처리할 것인지 정의하는 영역입니다.
frontend proxy-ssl
  # 이 예제의 `/etc/haproxy/certs` 디렉터리는 발급된 각각의 도메인 이름으로 되어있는
  # 인증서 PEM 파일들로 구성되어 있습니다.
  # HAProxy가 시작하면, 이 디렉터리를 읽고, 폴더에서 찾은 모든 인증서를 가져올 것입니다.
  # 그리고 SNI 매칭을 통해 연결에 대해 올바른 인증서를 적용합니다.
  bind 10.0.0.10:443 ssl crt /etc/haproxy/certs

  # 여기 저희가 정적 자원을 처리하기 위한 규칙 쌍들을 정의하였습니다.
  # `/static`으로 시작하는 모든 들어오는 요청은, 예를 들어 `https://one.example.com/static/foo.jpeg`는
  # 정적 자원 서버로 리디렉션될 것입니다.
  acl is_static path -i -m beg /static
  use_backend static-backend if is_static

  # 여기에 저희가 요청된 도메인에 대해 적합한 Node.js 서버들에게로 요청을 처리하도록 하는 규칙 쌍을 정의했습니다.
  # `acl` 줄은 들어오는 요청의 호스트이름을 매칭하기 위해 사용되며 일치하면 불(boolean) 형식으로 알려줍니다.
  # `use_backend` 줄은 이 불(boolean)이 참이라면 트래픽을 처리하도록 합니다.
  acl example1 hdr_sub(Host) one.example.com
  use_backend example1-backend if example1

  acl example2 hdr_sub(Host) two.example.com
  use_backend example2-backend if example2

  # 최종적으로, 저희는 요청된 호스트가 위 규칙들에 모두 만족하지 않는 경우 처리할 경로도 정의했습니다.
  default_backend default-server

# "backend"는 HAProxy에게 프록시된 요청을 어디에서 처리할지 알려줍니다.
# 이 부분에서는 저희는 저희의 Node.js 앱과 정적 파일 서버와 같은 것들이 어디에 존재하는지 정의할 것입니다.
backend default-server
  # 이 예제에서 저희는 매칭되지 않은 도메인에 대한 모든 요청들을 하나의 백엔드 서버로 보내고 있습니다.
  # 이 백엔드 서버가 꼭 TLS 요청들을 처리해야 할 필요는 없다는 점을 참고하세요.
  # 이것은 "TLS termination"이라고 불립니다: TLS 연결이 리버스 프록시에서 "종료"됩니다.
  # 또 백엔드 서버들에게 있어서 TLS로 요청들을 직접 전송하도록 프록시할 수도 있습니다만,
  # 이것은 예제의 목적을 벗어납니다.
  server server1 10.10.10.2:80

# 이 백엔드 설정은 3개의 백엔드 서버로 라운드-로빈 규칙에 따라 프록시하며
# `https://one.example.com`에 대한 요청들을 받아줄 겁니다.
backend example1-backend
  server example1-1 10.10.11.2:80
  server example1-2 10.10.11.2:80
  server example2-2 10.10.11.3:80

# 이 설정은 `https://two.example.com`에 대해서 요청을 다룹니다.
backend example2-backend
  server example2-1 10.10.12.2:80
  server example2-2 10.10.12.2:80
  server example2-3 10.10.12.3:80

# 이 백엔드 서버는 정적 자원 요청들을 다룹니다.
# This backend handles the static resources requests.
backend static-backend
  server static-server1 10.10.9.2:80
```

[cgi]: https://en.wikipedia.org/wiki/Common_Gateway_Interface
[scale-horiz]: https://en.wikipedia.org/wiki/Scalability#Horizontal
[why-use]: https://web.archive.org/web/20190821102906/https://medium.com/intrinsic/why-should-i-use-a-reverse-proxy-if-node-js-is-production-ready-5a079408b2ca
[haproxy]: https://www.haproxy.org/

### Nginx

```nginx
# 이 상단부는 3개의 서버로 묶어 그 중 2개의 주 서버로 라운드-로빈 기법을 사용하여 분산 처리하면서
# 2개의 주 서버가 모두 사용하지 못할 때 사용하는 백업 서버를 포함하는
# fastify_app이라는 이름으로 지정된 하나의 백엔드를 구성합니다.
# 또한 여러분의 fastify 서버들이 80번 포트에서 요청을 받고 있음을 유추할 수 있습니다.
# 더 많은 정보: http://nginx.org/en/docs/http/ngx_http_upstream_module.html
upstream fastify_app {
  server 10.10.11.1:80;
  server 10.10.11.2:80;
  server 10.10.11.3:80 backup;
}

# 이 서버 부분은 NGINX에게 80번 포트로 들어오는(형식적인 순수 HTTP) 요청에 대해
# 같은 URL이지만 HTTPS 프로토콜로 리디릭션하도록 합니다.
# 이 부분은 선택적이며 이 예제와 같이 주로 NGINX에서 SSL 종료를 담당하는 경우에 사용됩니다.
server {
  # default_server는 NGINX에게 이 서버 블럭을 이 주소/포트에 대해 기본값으로 사용하라고 하는 것으로
  # 이 경우엔 모든 주소와 80번 포트에 해당합니다
  listen 80 default_server;
  listen [::]:80 default_server;

  # server_name 구문을 사용하면 NGINX에게 하여금 서버 이름과 일치할 때만 서버 블럭을 사용할 수 있도록 합니다
  # listen 80;
  # listen [::]:80;
  # server_name example.tld;

  # 이것은 요청의 모든 경로를 매칭하고 위에 언급한대로 리디렉션으로 응답합니다.
  location / {
    return 301 https://$host$request_uri;
  }
}

# 이 서버 블록은 NGINX에게 SSL이 활성화된 443 포트에서 들어오는 요청과 HTTP/2 연결을 응답하도록 합니다.
# 이 곳은 요청이 3000번 포트를 통해 fastify_app 서버 그룹으로 프록시되는 부분입니다.
server {
  # 이 listen 구문은 NGINX에게 하여금 모든 주소, SSL이 활성화된 443번 포트,
  # 또 가능하다면 HTTP/2 요청을 처리하도록 합니다.
  listen 443 ssl http2 default_server;
  listen [::]:443 ssl http2 default_server;

  # server_name 구문과 함께 NGINX에게 server_name이 일치할 때만
  # 이 서버 블럭를 사용하도록 할 수 있습니다.
  # listen 443 ssl http2;
  # listen [::]:443 ssl http2;
  # server_name example.tld;

  # PEM 형식으로 된 SSL/TLS 인증서 (체인)과 보안 키입니다
  ssl_certificate /path/to/fullchain.pem;
  ssl_certificate_key /path/to/private.pem;

  # https://ssl-config.mozilla.org/ 에 기반을 둔
  # 범용적 모범 사례입니다.
  ssl_session_timeout 1d;
  ssl_session_cache shared:FastifyApp:10m;
  ssl_session_tickets off;

  # 이 부분은 NGINX에게 몇몇 업데이트를 받은 IE와 대부분의 최신 브라우저에서
  # 안전할 TLS 1.3만 허용하도록 합니다.
  # 만약 더 오래된 브라우저를 지원해야 한다면 추가로 프로토콜을 정의해야 할 것입니다.
  ssl_protocols TLSv1.3;
  ssl_prefer_server_ciphers off;

  # 이 부분은 브라우저에게 하여금 이 서버와 함께라면 HTTPS만 사용할 것을 알려줍니다.
  add_header Strict-Transport-Security "max-age=63072000" always;

  # 다음 구문은 OCSP 스태플링을 활성화하는 경우에만 필요합니다.
  ssl_stapling on;
  ssl_stapling_verify on;
  ssl_trusted_certificate /path/to/chain.pem;

  # 상단 서버 이름을 해석하기 위해 지정된 네임 서버
  # resolver 127.0.0.1;

  # 이 부분은 모든 경로와 접두사들에 일치하는 요청들을 위에 정의된 백엔드 서버 그룹으로 프록시 처리합니다.
  # 전달되었다는 정보는 원본 요청에 추가되어 전송될 것임을 기억하세요.
  # 또 trustProxy를 NGINX 서버의 주소로 설정하여 X-Forwarded 필드들이 Fastify에 의해 사용되도록 할 수 있습니다.
  location / {
    # more info: http://nginx.org/en/docs/http/ngx_http_proxy_module.html
    proxy_http_version 1.1;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # 이 구문은 요청을 특정 서버로 프록시하는 역할을 합니다.
    # 만약 upstream 그룹을 사용하고 있다면 포트를 지정할 필요는 없습니다.
    # 만약 직접적으로 서버에 프록시하는 경우에는 포트를 지정해야 합니다.
    # 예를 들어, proxy_pass http://127.0.0.1:3000
    proxy_pass http://fastify_app;
  }
}
```

[nginx]: https://nginx.org/

## Kubernetes
<a id="kubernetes"></a>

`readinessProbe`는 [(기본적으로)](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes) 파드의 IP를 호스트 이름으로 사용합니다.
Fastify는 기본적으로 `127.0.0.1`에서 요청을 수신합니다.
이 경우에는 프로브가 애플리케이션에 도달할 수 없을 것입니다.
동작하게 만들기 위해, 애플리케이션은 반드시 `0.0.0.0`에서 수신하거나 다음 예제와 같이 `readinessProbe.httpGet` 스펙에 있는 특정 호스트 이름으로 지정해야 합니다:

```yaml
readinessProbe:
    httpGet:
        path: /health
        port: 4000
    initialDelaySeconds: 30
    periodSeconds: 30
    timeoutSeconds: 3
    successThreshold: 1
    failureThreshold: 5
