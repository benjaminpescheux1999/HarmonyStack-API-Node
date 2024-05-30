### Sélectionner la langue :

[![Français](https://img.shields.io/badge/Langue-Fran%C3%A7ais-blue.svg)](#fran%C3%A7ais)
[![English](https://img.shields.io/badge/Langue-Anglais-red.svg)](#English)


### Français
# HarmonyStack-API-Node

Une pile technologique harmonieuse, offrant une compatibilité totale entre les différentes couches.

## Release v1.0.3

### Description
Cette release introduit les fonctionnalités d'authentification sécurisée pour le projet HarmonyStack, ainsi que les explications sur son fonctionnement.

## Feuille de Route

### Fonctionnalités en Développement 🚧

- [ ] Amélioration de la Stratégie d'Authentification 🚧
  - Optimisation des mécanismes d'authentification pour renforcer la sécurité et améliorer l'expérience utilisateur.

- [ ] ~~*Gestion de l'Utilisateur*~~
  - ~~*Mise à jour des informations utilisateur sur la page de profil pour permettre une personnalisation et une gestion plus intuitive.*~~

- [ ] ~~*Intégration Swagger*~~
  - ~~*Ajout de Swagger pour la documentation des API afin de faciliter le développement et les tests.*~~

- [ ] ~~*Intégration Traduction Api*~~
  - ~~*Ajout d'un stratégie de traduction pour les différentes langues piloter depuis un front.*~~

### Fonctionnalités à Venir 🌟
  
- [ ] Intégration de l'Inscription
  - Implémentation de la fonctionnalité d'inscription pour permettre aux nouveaux utilisateurs de créer un compte.
  
- [ ] Intégration de la Sécurité
  - Vérification de compte pour renforcer la sécurité, y compris la mise en œuvre de la vérification par email et d'autres méthodes d'authentification.
  - Génération code de sécurité pour la vérification par email.


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
Nous avons ajouté un intercepteur Axios pour gérer les tokens nécessaires à l'authentification :
**Intercepteur pour le Refresh Token & XSRF Token:**
```javascript
      const [xsrfToken, setXsrfToken] = useState(useSelector(state => state.xsrfToken.xsrfToken));
      instance.defaults.headers['x-xsrf-token'] = xsrfToken;
    
      // Intercepteur pour gérer xsrfToken et les erreurs 401
      instance.interceptors.response.use(
        async (response) => {
          // Gestion du xsrfToken
          const token = response.data.xsrfToken || response.data.additionalData?.xsrfToken;
          if (token) {
            dispatch({
              type: 'UPDATE_XSRF',
              payload: token
            });
            setXsrfToken(token);
            instance.defaults.headers['x-xsrf-token'] = token;
          } else if (!token && xsrfToken && !instance.defaults.headers['x-xsrf-token']) {
            console.warn("Récupération du token depuis redux");
            instance.defaults.headers['x-xsrf-token'] = xsrfToken; 
          } else if (!token && !xsrfToken && !instance.defaults.headers['x-xsrf-token']){
            console.warn("Aucun xsrfToken trouvé dans la réponse.");
          }
          return response;
        },
        async (error) => {
          if (error.response && error.response.status === 401 && error.config.url !== '/refresh-token') {
            const originalRequest = error.config;
            if (!originalRequest._retry) {
              originalRequest._retry = true;
              try {
                const refreshResponse = await instance.post('/refresh-token');
                const newToken = refreshResponse.data.xsrfToken;
                dispatch({
                  type: 'UPDATE_XSRF',
                  payload: newToken
                });
                setXsrfToken(newToken);
                instance.defaults.headers['x-xsrf-token'] = newToken;
                originalRequest.headers['x-xsrf-token'] = newToken;
                return instance(originalRequest);
              } catch (refreshError) {
                console.error("Échec de la récupération du token :", refreshError.response.status);
                return Promise.reject(refreshError);
              }
            }
          }
          return Promise.reject(error);
        }
      );
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

## Release v1.0.3

### Description
This release introduces secure authentication features for the HarmonyStack project, along with explanations of its operation.

## Roadmap

### Features in Development 🚧
- [ ] Authentication Strategy Improvement 🚧
  - Optimization of authentication mechanisms to enhance security and improve user experience.

- [ ] ~~*User Management*~~
  - ~~*Updating user information on the profile page to enable more intuitive customization and management.*~~

- [ ] ~~*Swagger Integration*~~
  - ~~*Adding Swagger for API documentation to facilitate development and testing.*~~

- [ ] ~~*Translation API Integration*~~
  - ~~*Adding a translation API strategy to enable language translation from a front.*~~
  
  
### Upcoming Features 🌟

- [ ] Signup Integration
  - Implementing the signup feature to allow new users to create an account.
  
- [ ] Security Integration
  - Account verification to enhance security, including the implementation of email verification and other authentication methods.
  - Code generation for email verification.



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
We have added an Axios interceptor to manage the tokens required for authentication:
**Interceptor for Refresh Token & XSRF Token:**
```javascript
  const [xsrfToken, setXsrfToken] = useState(useSelector(state => state.xsrfToken.xsrfToken));
  instance.defaults.headers['x-xsrf-token'] = xsrfToken;

  // Interceptor to handle xsrfToken and 401 errors
  instance.interceptors.response.use(
    async (response) => {
      // Handling the xsrfToken
      const token = response.data.xsrfToken || response.data.additionalData?.xsrfToken;
      if (token) {
        dispatch({
          type: 'UPDATE_XSRF',
          payload: token
        });
        setXsrfToken(token);
        instance.defaults.headers['x-xsrf-token'] = token;
      } else if (!token && xsrfToken && !instance.defaults.headers['x-xsrf-token']) {
        console.warn("Token retrieval from redux");
        instance.defaults.headers['x-xsrf-token'] = xsrfToken; 
      } else if (!token && !xsrfToken && !instance.defaults.headers['x-xsrf-token']){
        console.warn("No xsrfToken found in the response.");
      }
      return response;
    },
    async (error) => {
      if (error.response && error.response.status === 401 && error.config.url !== '/refresh-token') {
        const originalRequest = error.config;
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshResponse = await instance.post('/refresh-token');
            const newToken = refreshResponse.data.xsrfToken;
            dispatch({
              type: 'UPDATE_XSRF',
              payload: newToken
            });
            setXsrfToken(newToken);
            instance.defaults.headers['x-xsrf-token'] = newToken;
            originalRequest.headers['x-xsrf-token'] = newToken;
            return instance(originalRequest);
          } catch (refreshError) {
            console.error("Failed to retrieve the token:", refreshError.response.status);
            return Promise.reject(refreshError);
          }
        }
      }
      return Promise.reject(error);
    }
  );
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



