---
title: "MySQL 일부 문자열 검색 기능 like"
description: "회사에서 전화번호 뒷자리번호로 검색할 사용자를 검색할 필요가 있어 검색하는데 SQL 문이 기억이 안났다."
pubDate: 2018-06-30
tags:
  - MySQL
lang: ko
---

회사에서 전화번호 뒷자리번호로 검색할 사용자를 검색할 필요가 있어 검색하는데 SQL 문이 기억이 안났다.

막연히
```{.sql}
select * from member where mobile = '*4558';
```
이런식으로 치는 나를 발견.. 당연히 되지 않았다.

```{.sql}
select * from member where mobile like '4558%';
```
로 해야지 조회된다.
