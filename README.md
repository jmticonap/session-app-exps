# SESSION-APP-EXPS

## Description:
This is a boilerplate for web backend apps with capacity for define routes in all Http methods and definition for entities will be use for Mysql repositories implementation, also it have a Logger for the console.

## Prerequisites:
- Mysql
- NodeJs

## DB Structure:
This structure is as example.
``` sql
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `firstname` varchar(100) NOT NULL,
  `lastname` varchar(100) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `dni` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_unique` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```
## Environment variables:
All variables are scoped by environment execution variable`[live | test]`
- Environment execution:
The default value is `live`
```
NODE_ENV=live
```
- Server params:\
```
SERVER_LIVE_PORT=3000
SERVER_LIVE_HOST=127.0.0.1

SERVER_TEST_PORT=8000
SERVER_TEST_HOST=127.0.0.1
```

- Mysql parameters:
```
MYSQL_LIVE_HOST=localhost
MYSQL_LIVE_PORT=3306
MYSQL_LIVE_USER=root
MYSQL_LIVE_PASSWORD=root
MYSQL_LIVE_DATABASE=sessiondb

MYSQL_TEST_HOST=localhost
MYSQL_TEST_PORT=3306
MYSQL_TEST_USER=root
MYSQL_TEST_PASSWORD=root
MYSQL_TEST_DATABASE=sessiondb
```
## Scripts
- Run like "dev live"
```
npm run dev
```

- Run like "dev test"
```
npm run dev:test
```

- Run test
```
npm run test
```

- Run TS compile
```
npm run compile
```
## Example
- UserController:
    - Routes:
        - `GET` /user
        - `GET` /user/{id}
        - `POST` /user\
            Request:
            ``` json
                {
                    "firstname": "Kobe Beam",
                    "lastname": "Bryant",
                    "age": 46,
                    "dni": "99999999"
                }
            ```
        - `GET` /user/greeting
