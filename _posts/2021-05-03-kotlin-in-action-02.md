---
layout: post
title: "[Kotlin in action] 2. 코틀린 기초"
subtitle: "[Kotlin in action] 2. 코틀린 기초"
categories: programming
tags: kotlin
comments: true
---


코틀린 코딩을 위한 기본개념을 익혀보는 장

변수/함수/클래스/프로퍼티 등 Kotlin 기본요소를 알아봅시다.

참고로 intellij 유저라면 Tools > Kotlin > kotlin REPL 에서 대화형 콘솔 킬수있으므로 이를 적극활용..

아님 [이걸](https://try.kotlinlang.org/) 쓰셔도 좋음 

## 1) 기본요소

### 1-1) Hello, World!

```kotlin
fun main(args: Array<String>) { 
	println("Hello, world!")
} 
```

- 함수선언시 `fun` 키워드 사용.
- 파라미터 이름 뒤에 파라미터 타입을 씀.
- 함수를 최상위 수준에 정의 가능.
- 배열도 일반적인 클래스와 마찬가지.
- `println` 처럼 표준 자바 라이브러리 함수를 간결히 사용할 수 있게 감싼 wrapper를 제공
- 최신유행에 발맞춰 줄 끝에 세미콜론 안붙임

### 1-2) 함수

- 코틀린 함수의 기본구조

![2021-05-03-kotlin02.png](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/2021-05-03-kotlin02.png?raw=true)

코틀린의 if는 expression(식) 이지 statement(문) 가 아님. 

**문(statement)과 식(expression)의 구분**

- **식(expression)**은 **값을 만들어 내며** 다른 식의 **하위요소**로 계산에 참여 할 수 있다.
- 반면 **문(statement)**은 **아무런값을 만들어 내지 않으며** 자신을 둘러 싸고 있는 안쪽의 블록이 최상위 요소로 존재 한다.

자바의 모든 제어구조가 statement인 반면 코틀린은 루프를 제외한 대부분이 expression 형태임.

단, 대입문은 자바에서는 expression 이었지만 코틀린에서는 statement가 됨.

- 블록이 본문인 함수(block body) : 본문이 중괄호로 둘러싸인 함수

    ```kotlin
    fun max(a: Int, b: Int): Int { 
    	return if (a > b) a else b 
    }
    ```

- 식이 본문인 함수(expression body) : 등호와 식으로 이뤄진 함수

    ```kotlin
    fun max(a: Int, b: Int): Int = if (a > b) a else b
    ```

- 타입추론(type inference) : expression body를 사용할 경우 컴파일러가 타입추론할수있으므로 굳이 반환타입 안쓰고 생략가능. block body 사용시에는 반드시 반환타입 지정 및 return사용해 반환값을 명시해야함.

    ```kotlin
    fun max(a: Int, b: Int) = if (a > b) a else b
    ```

### 1-3) 변수

```kotlin
val question = "삶, 우주"
val answer = 42
val answer : Int = 42
```

자바에서는 변수선언시 타입을 맨앞에씀. 코틀린에서는 변수 뒤에 타입을 쓰는데, 자주 생략함. (타입을 앞에쓰면 식/변수 구분이 어려움) 

생략시 컴파일러가 초기화문을 분석해 변수타입을 자동으로 지정함.  (초기화안할거면 반드시 타입명시해야함)

- val (=value, 값) : 변경불가능(immutable)한 변수. 초기화 후 재대입 불가능. (=java의 final변수)
- var (=variable, 변수) : 변경가능(mutable)한 참조. 변수값 변경 가능. (=java의 일반변수)

 기본적으로 모든 변수는 `val` 키워드로 선언하고 꼭 필요할때만 `var` 로 변경. → 함수형 코드에 가까워짐. 

val 변수는 블록 실행시 1번만 초기화돼야함. 그러나 여러 블록에서 한 초기화 문장만 실행됨을 컴파일러가 확인할 수 있다면 조건에 따라 여러번 초기화문을 선언하는것도 가능

```kotlin
val message: String
if (canPerFormOperation()){
	message = "success"
}
else{
	message = "fail"
}
```

val 참조 자체는 불편이라도 참조가 가리키는 객체 내부값은 변경될 수 있음

```kotlin
val languages = arrayListOf("java")
languages.add("Kotlin")
```

var 키워드 사용시 변수의 값은 변경가능하지만 변수의 타입은 변경될수없음. 변경하고싶으면 변환함수 혹은 강제 형변환을 사용하여 값을 변수에 대입할 수 있는 타입으로 변환해야함. 

### 1-4) 문자열템플릿

```kotlin
fun main(args: Array<String>) {
	val name = if (args.size > 0) args[0] else "Kotlin"
	println("Hello, $name!")
	println("Hello, ${name}!")
}
```

`${name}` 과 같이 달러/중괄호를 통해 string interpolation 사용할수있다.

중괄호식 안에서 또 문자열 템플릿을 쓸수도있음

```kotlin
${if (s.length > 2) "too short" else "normal string ${s}"}
```

## 2) 클래스 / 프로퍼티

간단한 자바 Person 클래스

```java
public class Person {

	private final String name;

	public Person(String name) { 
		this.name = name;
	}

	public String getName() { 
		return name;
	}

}
```

더간단한 코틀린 Person  클래스

```java
class Person(val name: String)
```

이렇게 코드가 없이 데이터만 저장하는 클래스 → value object 라고함. 

java의 접근제어자 (access level modifier  : public/private/protected) 사라짐. 코틀린의 기본 modifier는 public으로 public이면 생략가능. 

생성자, getter, setter 묵시적으로 생성해줌. 🍯

### 2-1) 프로퍼티

코틀린의 property = 자바의 필드 + 접근자메소드(getter/setter) 

- val : 읽기전용 property.  field, getter 생성
- var : 읽기/쓰기 가능 property.  field, getter, setter 생성

```kotlin
class Person(
	val name: String,         // read-only
	var isMarried: Boolean    // writable
)
```

사용방법을 비교해보자..

```java
/* Java */
>>> Person person = new Person("Bob", true);
>>> System.out.println(person.getName());
Bob
>>> System.out.println(person.isMarried());
true
>>> person.setMarried(false)
```

```kotlin
>>> val person = Person("Bob", true)
>>> println(person.name)
Bob
>>> println(person.isMarried)
true
>>> person.isMarried = false
```

- new 키워드 사용안하고 생성자 호출
- property 이름을 직접 사용해도 자동으로 getter 호출됨.

### 2-2) 커스텀 접근자

프로퍼티의 접근자를 직접 작성할수도 있다

```kotlin
class Rectangle(val height: Int, val width: Int) { 
	val isSquare: Boolean
	get() {
		return height == width
	}
}
```

❓ 파라미터가 없는 함수 vs 커스텀 게터 

클래스의 특성을 정의하고 싶다면 property(+custom getter) 로 정의하세요~ 

### 2-3) 디렉터리와 패키지

- 코틀린에서도 자바와 비슷하게 패키지개념이 적용되어있음.
- 파일 맨앞에 package문을 넣으면 그 파일안의 모든 선언이 해당 패키지에 소속됨. 같은 패키지에 속해있으면 파일이 달라도 직접 사용 가능. 다른 패키지의 선언을 사용하려면 `import` 해서 사용.
- 코틀린에서는 클래스 import와 함수 import가 차이가 없음. 모든 선언을 import로 가져올수있음
- `.*` 붙이면 해당 패키지안의 모든 선언을 임포트할수있음
- java에서는 패키지구조/ 디렉터리 계층구조가 일치했음. 코틀린은 패키지구조/디렉터리 구조가 일치할필요는 없음. 근데 그래도 자바처럼 동일하게 구성하는걸 추천함 (mig 문제 등..)
- 그렇다고 여러 클래스를 한 파일에 넣는거를 두려워 ㄴㄴ 코틀린에는 작은클래스가 많음..

## 3) 선택표현 , 처리 : enum / when

### 3-1) enum

```kotlin
enum class Color(val r: Int, val g: Int, val b: Int) {  // (1) 
	RED(255, 0, 0), ORANGE(255, 165, 0),
	YELLOW(255, 255, 0), GREEN(0, 255, 0), BLUE(0, 0, 255),    // (2) 
	INDIGO(75, 0, 130), VIOLET(238, 130, 238);

	fun rgb() = (r * 256 + g) * 256 + b    // (3) 
}
```

- (1) 프로퍼티 선언
- (2) enum의 각 상수 선언시 상수에 해당하는 프로퍼티값 지정. ( `;` 필수 )
- (3) 메소드 정의

### 3-2) when으로 enum 다루기

코틀린 when = 자바의 switch

if와 마찬가지로 when도 값을 만들어내는 expression(식)이다. expression body에 when을 바로 사용 가능. 

```kotlin
fun getMnemonic(color: Color) =
	when (color) {
		Color.RED -> "Richard"
		Color.ORANGE -> "Of"
		Color.YELLOW -> "York"
		Color.GREEN -> "Gave"
		Color.BLUE -> "Battle"
		Color.INDIGO -> "In"
		Color.VIOLET -> "Vain"
	}
>>> println(getMnemonic(Color.BLUE))
Battle
```

자바와 달리 `break;` 필요없음 🍯

한 분기 안에서 여러값 사용가능

```kotlin
fun getWarmth(color: Color) = when(color) { 
	Color.RED, Color.ORANGE, Color.YELLOW -> "warm" 
	Color.GREEN -> "neutral"
	Color.BLUE, Color.INDIGO, Color.VIOLET -> "cold"
}
>>> println(getWarmth(Color.ORANGE))
warm
```

### 3-3) when 과 임의의 객체를 함께 사용

```kotlin
fun mix(c1: Color, c2: Color) =
	when (setOf(c1, c2)) {
		setOf(RED, YELLOW) -> ORANGE
		setOf(YELLOW, BLUE) -> GREEN
		setOf(BLUE, VIOLET) -> INDIGO
		else -> throw Exception("Dirty color")  // 매치되는거 없으면 얘가실행됨
}
>>> println(mix(BLUE, YELLOW))
GREEN
```

이렇게 when 식의 인자로 아무 객체나 사용 가능. 

when의 분기조건부분에 expression(식)을 넣을수 있기때문에 많은 문제를 간결하고 아름답게 작성가능

### 3-4) 인자없는 when 사용

```kotlin
fun mixOptimized(c1: Color, c2: Color) =
	when {
		(c1 == RED && c2 == YELLOW) || (c1 == YELLOW && c2 == RED) -> ORANGE
		(c1 == YELLOW && c2 == BLUE) || (c1 == BLUE && c2 == YELLOW) -> GREEN
		(c1 == BLUE && c2 == VIOLET) || (c1 == VIOLET && c2 == BLUE) -> INDIGO
		else -> throw Exception("Dirty color")
}
>>> println(mixOptimized(BLUE, YELLOW))
GREEN
```

when에 아무인자도 없으려면 각 분기조건이 boolean 결과 식이어야함

인자 안쓰면 이전 예제와 다르게 불필요한 객체생성이 없어서 성능은 더 좋음. (가독성은 구림) 

### 3-5) 스마트캐스트

타입검사와 캐스트가 한 연산자에 의해 이뤄진다. 

자바

```java
if (value instanceof String) // 타입검사 
	System.out.println(((String) value).toUpperCase()); // 캐스트 후 해당타입의 메서드 사용
```

코틀린

```kotlin
if (value is String)  // 타입검사 + 캐스트
	println(value.toUpperCase()) // 바로 해당타입의 메소드 사용 
```

### 3-6) 리팩토링 : if → when

if사용

```kotlin
fun eval(e: Expr): Int =
	if (e is Num) {
		e.value
	} else if (e is Sum) { 
		eval(e.right) + eval(e.left)
	} else {
		throw IllegalArgumentException("Unknown expression")
	}
```

when 사용

```kotlin
fun eval(e: Expr): Int =
	when (e) {
		is Num -> e.value
		is Sum -> eval(e.right) + eval(e.left)
		else -> throw IllegalArgumentException("Unknown expression")
	}
```

위 예제에서는 스마트캐스트도 쓰였음을 잊지말자

### 3-7) if, when의 분기에서 블록사용

```java
fun evalWithLogging(e: Expr): Int =
	when (e) {
		is Num -> { 
			println("num: ${e.value}")
			e.value // 반환값
		}
		is Sum -> {
			val left = evalWithLogging(e.left)
			val right = evalWithLogging(e.right)
			println("sum: $left + $right")
			left + right // 반환값
		}
		else -> throw IllegalArgumentException("Unknown expression")
	}
```

분기문이 길어진다면 위와같이 블록을 사용할수도있음.

블록의 **마지막식**이 블록 전체의 **결과**가됨. (마지막줄이 return문인셈) 

expression body 함수는 block을 본문으로 가질수없고 block body 함수는 내부에 return문이 반드시 있어야함. 

## 4) 대상을 iteration : while, for loop

코틀린의 iteration의 경우 자바와 매우비슷함. 

### 4-1) while

while, do-while 모두 있고 자바와 사용법은 동일함

```kotlin
while (condition) {
	/*...*/
}

do {
	/*...*/
} while (condition)
```

### 4-2) 수에대한 iteration

코틀린에는 자바같은 for loop 요소가 없음. 대신 범위(range)사용.

```kotlin
val oneToTen = 1..10

for (i in 1..100) {
	print(i)
}
```

위 범위는 폐구간(이상/이하범위) 이다. 

반폐구간을 쓰려면 until을 쓰면 된다

```kotlin
for (i in 0 until 100) {
	print(i)
}

for ( i in 0..99) {
	print(i)
}
```

100 에서 1까지 -2하면서 내려가는건 아래와 같이 표현가능 

```kotlin
for (i in 100 downTo 1 step 2){
	print(i)
}
```

### 4-3) Map에 대한 iteration

```kotlin
val binaryReps = HashMap<Char, String>()

for (c in 'A'..'F') {
	val binary = Integer.toBinaryString(c.toInt())
	binaryReps[c] = binary
}

for ((letter, binary) in binaryReps){ 
	println("$letter = $binary")
}
```

python에서 for문돌리듯이 사용가능 

get, put사용 안하고 map[key]나, map[key] = value 로 사용 가능. 

collection에서도 위와같이 구조분해 구문 사용가능. 

```kotlin
val list = arrayListOf("10", "11", "1001")
for ((index, element) in list.withIndex()) {
	println("$index: $element")
}
```

python enumerate 생각하면될듯 

### 4-4) in으로 collection, range의 원소검사

`in`연산자로 어떤 값이 범위에 속하는지 검사 가능

`!in` 연산자로 어떤 값이 버위에 속하지 않는지 검사 가능

```kotlin
fun isLetter(c: Char) = c in 'a'..'z' || c in 'A'..'Z'
fun isNotDigit(c: Char) = c !in '0'..'9'

>>> println(isLetter('q'))
true
>>> println(isNotDigit('x'))
true
```

## 5) 예외처리

코틀린 예외처리는 자바나 다른 언어의 예외처리와 비슷.

함수는 정상적으로 종료할 수 있지만 오류가 발생하면 예외를 던질 수 있음

함수를 호출하는쪽에서는 그 예외를 잡아 처리할 수 있음

발생한 예외를 호출단에서 처리하지않으면 호출스택을 거슬러 올라가 예외를 처리하는부분이 나올때까지 예외를 던짐

```kotlin
if (percentage !in 0..100) {
	throw IllegalArgumentException("A percentage value must be between 0 and 100: $percentage")
}
```

자바랑 다르게 new는 안씀

자바랑 다르게 expression(식) 취급해서 다른 expression에 포함될수있음 (위 예시도 expression의 일종인 if에 포함되어있음)

### 5-1) try, catch, finally

자바랑 동일하게 try, catch, finally 사용

```kotlin
fun readNumber(reader: BufferedReader): Int? {  // (1) 
	try {
		val line = reader.readLine()
		return Integer.parseInt(line)
	}
	catch (e: NumberFormatException) {  // (2) 
		return null
	}
	finally {  // (3)
		reader.close()
	}
}
```

- (1) 함수(fun)에 던질수있는 예외를 굳이 명시하지 X
- (2) 예외타입을 :의 오른쪽에씀
- (3) finally는 자바와 동일하게 작동

코틀린에서는 checked excpetion과 unchecked exception을 구분하지않는다. 즉 발생한 예외를 잡아내도 되고 잡아내지 않아도 된다. checked exception예외를 강제해서 IOException을 강제로 처리해야하는등의 뻘짓을 안해도된다.

### 5-2) try를 식으로 사용

코틀린의 try는 expression이다. 따라서 try값을 변수에 대입가능하다. 단, 반드시 try의 본문은 중괄호로 둘러쌓여야한다. 물론 마지막줄이 전체 결과값이된다. 

```kotlin
fun readNumber(reader: BufferedReader) { 
	val number = 
		try {
			Integer.parseInt(reader.readLine())
		} catch (e: NumberFormatException) { 
			null
		}
	println(number)
}
```