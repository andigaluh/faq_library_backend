## About The Project

This project is a FAQ library backend build with Node.js, Express, Json Web Token and MySQL database. 

### Built With

This project built with
* [NodeJs](https://nodejs.org/)
* [Express](https://expressjs.com/)
* [Mysql](https://www.mysql.com/)

## Getting started 

Please follow all the steps below.

### Prerequisites

install the environment 
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/andigaluh/faq_library_backend.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create a database named *faqlibdb* in your mysql server
4. Enter your custom setup in `app/config/auth.config.js.template` and save as `app/config/auth.config.js`
5. Enter your mysql credential in `app/config/db.config.js.template` and save as `app/config/db.config.js`
6. Enter your mail sender credential in `app/config/mail.config.js.template` and save as `app/config/mail.config.js`
7. Start the project
   ```sh
    npm start
   ```