# Bamboo
Bamboo est un CLI permettant d'effectuer des connexions TCP entre un serveur et plusieurs client.

## Installation

Assurez vous d'avoir [**NodeJS**](https://nodejs.org/en) et [**Npm**](https://www.npmjs.com/) installé sur votre machine.

Cloner le répository:
```
git clone https://github.com/Claquetteuuuh/bamboo
```

Lancer l'installation des dépendances:
```
npm install
```

## Usage

Lancement du CLI
```
npm run cli
```

Lancement du server:
```
npm run server
```

Lancement d'un client:
```
npm run client
```

### CLI commands

#### Server
Lancement du server
```
[Bamboo]$> server start
```

Redemarrage du server
```
[Bamboo]$> server restart
```

Cloture du server
```
[Bamboo]$> server stop
```

#### Config

##### Port

Recuperation du port du server
```
[Bamboo]$> config get port
```

Changement du port du server
```
[Bamboo]$> config set port <PORT>
```
