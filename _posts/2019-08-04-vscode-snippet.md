---
layout: post
title: vscode user snippet 스니펫 사용하기
subtitle: vscode user snippet 스니펫 사용하기
categories: programming
tags: tips
comments: true
---

## user snippet이란
스니펫이란 재사용 가능한 소스 코드를 의미한다.
즉, 자주 쓰는 코드를 저장해두고, 필요할 때마다 별칭을 통해 불러올 수 있다.

## user snippet 만들기
`File > Preferences > User snippet` 
![new snippet](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/16_1.png?raw=true)
로컬에서만 쓸거면 `New Global Snippets file...`  
계정에서 사용할거면 `New Snippet file for 계정...` 을 눌러서 새 스니펫을 만들수있다.

## snippet templete
자주사용하는 코드내용을 작성해서 저장해놓으면 되는데,  
placeholder 를 지정해서 작성해야하는 부분에 자동으로 커서를 이동하게할수있다.
예를들면 나는 github io 포스팅 마크다운언어의 헤더부분을 스닛페화해놨는데 
```
{
	"File Header": {
		"prefix": "header",
		"description": "Output a file header with the file name and date",
		"body": [
			"---",
			"title: ${1:title:Enter title}",
			"date: $CURRENT_YEAR-$CURRENT_MONTH-$CURRENT_DATE $CURRENT_HOUR:$CURRENT_MINUTE:$CURRENT_SECOND",
			"categories: ${2:categories:Enter categories}",
			"tags: ${3:tags:Enter tags}",
			"sidebar:",
			" nav: \"categories\"",
			"toc: true",
			"toc_label: \"List\"",
			"toc_icon: \"list\"",
			"---"
		]
	}
}
``` 
`${1:title:Enter title}` 이런식으로 지정해놓은 placeholder에 자동으로 커서가 지정되어  
해당부분을 자동으로 채우게 만든다.  
위와같이 여러개의 placeholder가 있으면 `tab` 키로 이동하며 빠르게 작성할 수 있다.  

또한 내가 지정해놓은 `$CURRENT_YEAR-$CURRENT_MONTH-$CURRENT_DATE $CURRENT_HOUR:$CURRENT_MINUTE:$CURRENT_SECOND"` 부분처럼
자동으로 컴퓨터의 시간을 불러올 수도 있다. 