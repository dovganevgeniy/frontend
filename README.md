# ДОКУМЕНТАЦИЯ

https://space.zoloto585.ru/display/ECOM/frontend

# АДАПТАЦИЯ В ПРОЦЕСС FRONTEND-РАЗРАБОТКИ

 - [Установка репозитория](#Установка-репозитория)
 - [Установка окружения](#Установка-окружения)
 - [Проверка рабочего процесса](#Проверка-рабочего-процесса)
 - Ежедневная работа с frontend-сборкой
 - Что и как используем(технологи, методологии, подходы)
 - [Дополнительные ссылки](#Дополнительные-ссылки)






## Установка репозитория
Зарегистрируйся на [Гитхабе](https://github.com/)
Сделай форк репозитория [https://github.com/zoloto585gold/frontend](https://github.com/zoloto585gold/frontend), 
перейди на свой аккаунт ГитХабе,
зайди в только что сделанный форк-репозиторий "frontend".

[Fork на GitHub - что это такое](http://gearmobile.github.io/git/fork-github/)
[Как начать работать с GitHub: быстрый старт](https://habrahabr.ru/post/125799/)

Теперь нужно установить на свой компьютер [Git](https://git-scm.com/download) и [Cmder](http://cmder.net/) , для Cmder скачать версию "Download mini".

Настроить Cmder для удобной работы, [статья по настройке](http://nicothin.pro/page/console-windows).

Открыть настроенный Cmder, перейти в папку проекта, например выполнить команду в Cmder
```
cd c:/webProject/zoloto585gold
```
Если папки для хранения web-проектов еще нет, то ее можно создать самостоятельно.

Находясь в Cmder  в папке `/zoloto585gold` склонируй репозиторий на свой локальный компьютер.
```
git clone <ссылка на твой форк, например https://github.com/здесь_твой_гитхабовский_ллогин/frontend.git>
```

В Cmder выполнить команду
```
git remote -v
```
, затем выполнить команду

```
git remote add upstream https://github.com/zoloto585gold/frontend.git
```
, после чего опять выполнить команду
```
git remote -v
```
upstream - это ссылка/алиас на мастер-репозиторий, который хранится здесь https://github.com/zoloto585gold/frontend
origin - это ссылка/алиас на форк-репозиотрий, который хранится на твоем аккаунте в ГитХабе.



## Установка окружения

Установи [NodeJS](https://nodejs.org/en/) и запусти его, как обычную программу.

Проверим: зайди в консоль и набери команду `node -v` эта команда вернёт версию установленного NodeJS, затем команду `npm -v`, которая вернет версию NPM(Node Package Manager),
таким образом можно проверить, что "Нода" и "NPM" установлены и запущены.

В моём случае это было так:
```
$ node -v
v6.9.4

$ npm -v
3.10.10
```

Далее в консоли: перейди в папку проекта и выполни команду 
```
npm i
```
она скачивает все необходимые для текущей сборки пакеты/плагины.

Так же установи Gulp глобально:
```
npm i gulp -g
```



## Проверка рабочего процесса

Заходим в консоль в папку рабочего проекта, выполняем
```
git status
git checkout master
git pull upstream master
```



## Ежедневная работа с frontend-сборкой




## Дополнительные ссылки

 - [Головокружительное погружение в бэм](https://frontender.info/MindBEMding/)
 - [Gulp для самых маленьких - подробное руководство](https://www.youtube.com/watch?v=vW51JUVT66w)
 - [Быстрая настройка Sublime Text 3 для вёрстки сайтов](https://www.youtube.com/watch?v=qlueo6wFikM&index=1&list=PLyf8LgkO_8q-qm9nDvyT3S1Flx0Yfgs3M)
 - [LESS. Путеводитель для новичков](https://mrmlnc.gitbooks.io/less-guidebook-for-beginners/content/)