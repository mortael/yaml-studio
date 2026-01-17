import { Template } from './types';

export const INITIAL_CONTENT = `# Welcome to YAML Studio
# Start typing or select a template from the sidebar.

version: '3.8'
services:
  app:
    image: node:18-alpine
    ports:
      - "3000:3000"
`;

export const TEMPLATES: Template[] = [
  {
    id: 'basic-node',
    name: 'Node.js Service',
    description: 'A simple Node.js application container.',
    category: 'basic',
    content: `version: '3.8'
services:
  web:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - .:/app
    ports:
      - "3000:3000"
    command: npm start`
  },
  {
    id: 'postgres',
    name: 'PostgreSQL DB',
    description: 'PostgreSQL database with environment variables.',
    category: 'database',
    content: `version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydatabase
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:`
  },
  {
    id: 'redis',
    name: 'Redis Cache',
    description: 'Redis service with persistent volume.',
    category: 'database',
    content: `version: '3.8'
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:`
  },
  {
    id: 'full-stack-mern',
    name: 'MERN Stack',
    description: 'Mongo, Express (Node), React, Node setup.',
    category: 'full-stack',
    content: `version: '3.8'
services:
  client:
    image: node:18-alpine
    build: ./client
    ports:
      - "3000:3000"
    stdin_open: true
    tty: true

  server:
    image: node:18-alpine
    build: ./server
    ports:
      - "5000:5000"
    environment:
      MONGO_URI: mongodb://mongo:27017/appdb
    depends_on:
      - mongo

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:`
  },
  {
    id: 'nginx-proxy',
    name: 'Nginx Reverse Proxy',
    description: 'Nginx configured as a reverse proxy.',
    category: 'basic',
    content: `version: '3.8'
services:
  proxy:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app

  app:
    image: my-app:latest`
  },
  {
    id: 'wordpress',
    name: 'WordPress',
    description: 'WordPress with MySQL database.',
    category: 'full-stack',
    content: `version: '3.8'
services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8000:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: exampleuser
      WORDPRESS_DB_PASSWORD: examplepass
      WORDPRESS_DB_NAME: exampledb
    volumes:
      - wordpress_data:/var/www/html
    depends_on:
      - db

  db:
    image: mysql:5.7
    environment:
      MYSQL_DATABASE: exampledb
      MYSQL_USER: exampleuser
      MYSQL_PASSWORD: examplepass
      MYSQL_RANDOM_ROOT_PASSWORD: '1'
    volumes:
      - db_data:/var/lib/mysql

volumes:
  wordpress_data:
  db_data:`
  }
];

// Autocompletion Data
export const DOCKER_ROOT_KEYS = ['version', 'services', 'volumes', 'networks', 'secrets', 'configs'];

export const DOCKER_SERVICE_KEYS = [
  'image', 'build', 'ports', 'volumes', 'environment', 'env_file', 
  'depends_on', 'restart', 'command', 'entrypoint', 'networks', 
  'container_name', 'hostname', 'healthcheck', 'deploy', 'logging',
  'stdin_open', 'tty', 'working_dir', 'user'
];

export const COMMON_IMAGES = [
  'node:18-alpine', 'node:20-alpine', 'node:latest', 
  'postgres:15', 'postgres:14', 'postgres:alpine',
  'redis:alpine', 'redis:latest',
  'mongo:latest', 'mongo:6',
  'nginx:alpine', 'nginx:latest',
  'mysql:8', 'mysql:5.7',
  'wordpress:latest', 'wordpress:php8.2',
  'python:3.11-alpine', 'python:3.10-slim',
  'traefik:v2.10', 'rabbitmq:3-management'
];