---
title: "Jekyll 드디어 검색 기능 수정하다."
description: "검색기능을 붙이는데 꽤 애먹었다."
pubDate: 2018-05-11
tags:
  - Jekyll
lang: ko
---

검색기능을 붙이는데 꽤 애먹었다.

처음에는 lunr.js 는 내가 [참고한 블로그](https://moon9342.github.io/jekyll-search) 에서 말하는 것처럼 바로 [lunrjs](https://lunrjs.com/) 사이트에서 최신 버전 받아서 테스트해보았으나 검색이 되지 않았다.

결국 몇번의 삽질 끝에 [lunrjs](https://lunrjs.com/) 사이트에서 바로 받으면 사용하지 못하고 [0.7.2 버전](https://github.com/olivernn/lunr.js/releases?after=v2.0.0-alpha.1)을 받아서 검색기능되게끔 구현 완료했다.
