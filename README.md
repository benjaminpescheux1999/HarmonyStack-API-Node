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
  if (response && response.data) {
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

BDD MySQL 🚧
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

BDD PostgreSQL 🚧
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


