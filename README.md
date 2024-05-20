### Sélectionner la langue :

[![Français](https://img.shields.io/badge/Langue-Fran%C3%A7ais-blue.svg)](#fran%C3%A7ais)
[![English](https://img.shields.io/badge/Langue-Anglais-red.svg)](#anglais)

### Français
# HarmonyStack-API-Node

Une pile technologique harmonieuse, offrant une compatibilité totale entre les différentes couches.

## Release v1.0.0

### Description
Cette release introduit les fonctionnalités d'authentification sécurisée pour le projet HarmonyStack, ainsi que les explications sur son fonctionnement.

### Fonctionnalités principales :
- Implémentation de deux stratégies d'authentification : Fusion des tokens et Refresh token.
- Gestion sécurisée du stockage des tokens pour prévenir les failles XSS et les attaques CSRF/XSRF.
- API Node.js prête à l'emploi pour tester les fonctionnalités d'authentification.

### Stratégies d'authentification

#### Stratégie 1 : Fusion des tokens
- Génère un token XSRF et un JWT Token avec le XSRF Token intégré. (Server Api)
- Stocke le XSRF Token dans le localStorage et le JWT Token dans les cookies. (Front-end)

#### Stratégie 2 : Refresh token
- Utilise un Refresh Token pour assurer une persistance d'authentification sécurisée.
- Limite la durée de validité du JWT Token à une courte période (ex. 10 min) et stocke le Refresh Token dans la base de données (MongoDb, SQL, Postgre,...) avec une durée de validité plus longue (ex. 1 an).
- Régénère automatiquement le JWT Token à partir du Refresh Token lorsque celui-ci expire, permettant de maintenir la connexion de l'utilisateur sans avoir besoin de se reconnecter.

### Utilisation d'Axios pour l'envoi automatique du XSRF Token
Pour assurer l'envoi automatique du XSRF Token dans les headers des appels API, nous utilisons Axios côté front avec des interceptors. Voici comment cela fonctionne :
- Nous configurons Axios pour intercepter globalement les réponses API.
- Lorsque le XSRF Token est récupéré dans une réponse API, nous l'ajoutons automatiquement dans les headers des prochains appels API.
Cela garantit que le XSRF Token est toujours inclus dans les requêtes API, renforçant ainsi la sécurité de l'application contre les attaques CSRF/XSRF.


### Utilisation d'Axios pour l'automatisation du refresh Token
Pour garantir une authentification persistante et fluide, nous avons mis en place un mécanisme d'automatisation du rafraîchissement du token d'authentification. Cela permet à l'utilisateur de maintenir sa session active sans avoir besoin de se reconnecter manuellement.

Voici comment cela fonctionne :
- Nous configurons Axios pour intercepter globalement les réponses API.
- Nous avons configuré un intercepteur Axios spécifique pour gérer le rafraîchissement du token d'authentification en cas d'expiration.



### Intercepteurs Axios pour la gestion des Tokens
Nous avons ajouté deux intercepteurs Axios pour gérer les tokens nécessaires à l'authentification :
1. **Intercepteur pour le Refresh Token :**
```javascript
  instance.interceptors.response.use((response) => {
    return response;
  }, async (error) => {
    const originalRequest = error.config; // Get the original request
    if (originalRequest && error.config.url !== '/refresh-token' && error.response.status === 401 && originalRequest._retry !== true) {
      originalRequest._retry = true; // Avoid infinite loops 
      if(!xsrfToken || xsrfToken === '') {
        console.warn('xsrfToken not found');
        // strategy error
        return;
      }
  
      await instance.post('/refresh-token')
      .then((response) => {
      }).catch((error) => {
        console.warn(error.response.status);
        // strategy error
      });
      return instance(originalRequest);
    }
  });
````

2. **Intercepteur pour le XSRF Token :**

```javascript
const xsrfToken = useSelector(state => state.xsrfToken);
instance.interceptors.response.use((response) => {    
  if (response && response.data && (response.data.xsrfToken || response.data.additionalData?.xsrfToken)) {
      const token = response.data.xsrfToken || response.data.additionalData?.xsrfToken;
      
      if (token || xsrfToken) {
          // localStorage xsrfToken Redux
          dispatch({
              type: 'UPDATE_XSRF',
              payload: token
          });
          instance.defaults.headers['x-xsrf-token'] = token || xsrfToken;
      } else {
          console.warn("Pas de xsrfToken dans la réponse:", response.data);
      }
    }
  return response;
}, (error) => {
    return Promise.reject(error);
});
````

### Configuration du fichier .env

Pour configurer votre environnement, créez un fichier .env à la racine de votre projet et copiez/collez le code ci-dessous, en remplaçant les valeurs par vos informations :

BDD MongoDb :
Cette configuration est prévue pour une base de données MongoDb  :

```plaintext
  Mongo_User = "YOUR_MONGO_USER"
  Mongo_Pass = "YOUR_MONGO_PASS"
  MONGODB_URI = "mongodb+srv://:@YOUR_CLUSTER.mongodb.net/YOUR_DB_NAME?retryWrites=true&w=majority"
  Port = YOUR_PORT
  NODE_ENV = "development"
  JWT_SECRET = "YOUR_JWT_SECRET"
  REFRESH_TOKEN_SECRET = "YOUR_REFRESH_TOKEN_SECRET"
  CLIENT_URL = "http://localhost:YOUR_CLIENT_PORT"
````

BDD MySQL 🚧 :
Cette configuration est prévue pour une base de données MySQL (en cours de développement) :

```plaintext
  MYSQL_USER = "YOUR_MYSQL_USER"
  MYSQL_PASSWORD = "YOUR_MYSQL_PASSWORD"
  MYSQL_HOST = "YOUR_MYSQL_HOST"
  MYSQL_DATABASE = "YOUR_MYSQL_DATABASE"
  Port = YOUR_PORT
  NODE_ENV = "development"
  JWT_SECRET = "YOUR_JWT_SECRET"
  REFRESH_TOKEN_SECRET = "YOUR_REFRESH_TOKEN_SECRET"
  CLIENT_URL = "http://localhost:YOUR_CLIENT_PORT"
````

BDD PostgreSQL 🚧 :
Cette configuration est prévue pour une base de données PostgreSQL (en cours de développement) :

```plaintext
  POSTGRES_USER = "YOUR_POSTGRES_USER"
  POSTGRES_PASSWORD = "YOUR_POSTGRES_PASSWORD"
  POSTGRES_HOST = "YOUR_POSTGRES_HOST"
  POSTGRES_DATABASE = "YOUR_POSTGRES_DATABASE"
  Port = YOUR_PORT
  NODE_ENV = "development"
  JWT_SECRET = "YOUR_JWT_SECRET"
  REFRESH_TOKEN_SECRET = "YOUR_REFRESH_TOKEN_SECRET"
  CLIENT_URL = "http://localhost:YOUR_CLIENT_PORT"
````


## Lancement du Projet

Pour utiliser l'API HarmonyStack, suivez ces étapes simples :

### Installation de Node.js

Assurez-vous d'avoir Node.js installé sur votre machine. Vous pouvez télécharger la dernière version depuis le site officiel de Node.js : [nodejs.org](https://nodejs.org)

### Installation des Dépendances

Après avoir cloné le dépôt ou téléchargé les fichiers du projet, accédez au répertoire du projet dans votre terminal et exécutez la commande suivante pour installer les dépendances nécessaires :

```bash
npm install
```

Cette commande téléchargera et installera toutes les dépendances listées dans le fichier `package.json`.

### Lancement de l'API

Une fois les dépendances installées, vous pouvez lancer l'API en utilisant la commande :

```bash
npm run dev
```

Cette commande démarrera le serveur Node.js et vous pourrez accéder à l'API HarmonyStack via l'URL fournie par le serveur.

Assurez-vous également de configurer correctement votre base de données selon les instructions fournies dans le projet, le cas échéant.

### English
A harmonious technology stack, offering full compatibility between different layers.

## Release v1.0.0

### Description
This release introduces secure authentication features for the HarmonyStack project, along with explanations of its operation.

### Key Features:
- Implementation of two authentication strategies: Token Fusion and Refresh Token.
- Secure token storage management to prevent XSS vulnerabilities and CSRF/XSRF attacks.
- Node.js API ready to use to test authentication features.

### Authentication Strategies

#### Strategy 1: Token Fusion
- Generates an XSRF token and a JWT token with the integrated XSRF token. (Server API)
- Stores the XSRF token in the localStorage and the JWT token in cookies. (Front-end)

#### Strategy 2: Refresh Token
- Utilizes a Refresh Token to ensure secure authentication persistence.
- Limits the validity period of the JWT token to a short period (e.g., 10 min) and stores the Refresh Token in the database (MongoDB, SQL, Postgre, etc.) with a longer validity period (e.g., 1 year).
- Automatically regenerates the JWT token from the Refresh Token when it expires, allowing the user's session to be maintained without needing to reconnect.

### Using Axios for Automatic XSRF Token Sending
To ensure automatic sending of the XSRF token in API call headers, we use Axios on the front-end with interceptors. Here's how it works:
- We configure Axios to globally intercept API responses.
- When the XSRF token is retrieved in an API response, we automatically add it to the headers of subsequent API calls.
This ensures that the XSRF token is always included in API requests, thereby enhancing application security against CSRF/XSRF attacks.

### Using Axios for Refresh Token Automation
To ensure persistent and seamless authentication, we have implemented a mechanism for automating the refresh of the authentication token. This allows the user to keep their session active without needing to manually reconnect.

Here's how it works:
- We configure Axios to globally intercept API responses.
- We have set up a specific Axios interceptor to handle the refresh of the authentication token upon expiration.

### Axios Interceptors for Token Management
We have added two Axios interceptors to manage the tokens necessary for authentication:
1. **Interceptor for Refresh Token:** 
```javascript
  instance.interceptors.response.use((response) => {
    return response;
  }, async (error) => {
    const originalRequest = error.config; // Get the original request
    if (originalRequest && error.config.url !== '/refresh-token' && error.response.status === 401 && originalRequest._retry !== true) {
      originalRequest._retry = true; // Avoid infinite loops 
      if(!xsrfToken || xsrfToken === '') {
        console.warn('xsrfToken not found');
        // strategy error
        return;
      }
  
      await instance.post('/refresh-token')
      .then((response) => {
      }).catch((error) => {
        console.warn(error.response.status);
        // strategy error
      });
      return instance(originalRequest);
    }
  });
````
2. **Interceptor for the XSRF Token:**
```javascript
const xsrfToken = useSelector(state => state.xsrfToken);
instance.interceptors.response.use((response) => {    
  if (response && response.data && (response.data.xsrfToken || response.data.additionalData?.xsrfToken)) {
      const token = response.data.xsrfToken || response.data.additionalData?.xsrfToken;
      
      if (token || xsrfToken) {
          // localStorage xsrfToken Redux
          dispatch({
              type: 'UPDATE_XSRF',
              payload: token
          });
          instance.defaults.headers['x-xsrf-token'] = token || xsrfToken;
      } else {
          console.warn("Pas de xsrfToken dans la réponse:", response.data);
      }
    }
  return response;
}, (error) => {
    return Promise.reject(error);
});
````

### Configuration of the .env File

To configure your environment, create a .env file at the root of your project and copy/paste the code below, replacing the values with your information:

BDD MongoDb :
This configuration is intended for a MongoDb database:

```plaintext
  Mongo_User = "YOUR_MONGO_USER"
  Mongo_Pass = "YOUR_MONGO_PASS"
  MONGODB_URI = "mongodb+srv://:@YOUR_CLUSTER.mongodb.net/YOUR_DB_NAME?retryWrites=true&w=majority"
  Port = YOUR_PORT
  NODE_ENV = "development"
  JWT_SECRET = "YOUR_JWT_SECRET"
  REFRESH_TOKEN_SECRET = "YOUR_REFRESH_TOKEN_SECRET"
  CLIENT_URL = "http://localhost:YOUR_CLIENT_PORT"
````
MySQL Database 🚧 :
This configuration is intended for a MySQL database (under development):

```plaintext
  MYSQL_USER = "YOUR_MYSQL_USER"
  MYSQL_PASSWORD = "YOUR_MYSQL_PASSWORD"
  MYSQL_HOST = "YOUR_MYSQL_HOST"
  MYSQL_DATABASE = "YOUR_MYSQL_DATABASE"
  Port = YOUR_PORT
  NODE_ENV = "development"
  JWT_SECRET = "YOUR_JWT_SECRET"
  REFRESH_TOKEN_SECRET = "YOUR_REFRESH_TOKEN_SECRET"
  CLIENT_URL = "http://localhost:YOUR_CLIENT_PORT"
````

PostgreSQL Database 🚧 :
This configuration is intended for a PostgreSQL database (under development):

```plaintext
  POSTGRES_USER = "YOUR_POSTGRES_USER"
  POSTGRES_PASSWORD = "YOUR_POSTGRES_PASSWORD"
  POSTGRES_HOST = "YOUR_POSTGRES_HOST"
  POSTGRES_DATABASE = "YOUR_POSTGRES_DATABASE"
  Port = YOUR_PORT
  NODE_ENV = "development"
  JWT_SECRET = "YOUR_JWT_SECRET"
  REFRESH_TOKEN_SECRET = "YOUR_REFRESH_TOKEN_SECRET"
  CLIENT_URL = "http://localhost:YOUR_CLIENT_PORT"
````
## Project Launch

To use the HarmonyStack API, follow these simple steps:

### Installing Node.js

Make sure you have Node.js installed on your machine. You can download the latest version from the official Node.js website: [nodejs.org](https://nodejs.org)

### Installing Dependencies

After cloning the repository or downloading the project files, navigate to the project directory in your terminal and run the following command to install the necessary dependencies:

```bash
npm install
```

This command will download and install all dependencies listed in the package.json file.

### Launching the API

```bash
npm run dev
```
This command will start the Node.js server, and you can access the HarmonyStack API via the URL provided by the server.

Also, make sure to properly configure your database according to the instructions provided in the project, if applicable.



