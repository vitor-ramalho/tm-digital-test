# TM Digital - Lead Management System

Sistema completo de gerenciamento de leads para distribuidora de insumos agrícolas em Minas Gerais, Brasil.

## 📋 Visão Geral

Este projeto é um sistema CRUD full-stack desenvolvido para auxiliar equipes comerciais no gerenciamento de leads e propriedades rurais, com foco em:
- Soja
- Milho
- Algodão

### Objetivos do Sistema
- Descobrir e priorizar novos leads
- Acompanhar histórico e status de leads
- Visualizar clientes de alto potencial
- Gerenciar propriedades rurais associadas aos leads

## 🏗️ Arquitetura

O projeto segue princípios de **Domain-Driven Design (DDD)** com separação clara de responsabilidades:

```
tm-digital-test/
├── backend/           # API NestJS + TypeORM + PostgreSQL
├── frontend/          # Angular + PrimeNG
└── docker-compose.yml # Infraestrutura Docker
```

### Stack Tecnológico

#### Backend
- **Node.js** (Runtime)
- **NestJS** (Framework)
- **TypeORM** (ORM)
- **PostgreSQL** (Banco de dados)
- **TypeScript**
- **class-validator / class-transformer**

#### Frontend
- **Angular 17**
- **PrimeNG** (Componentes UI)
- **TypeScript**
- **HTML / SCSS**

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Docker** e **Docker Compose**

### 1. Subir a Infraestrutura (PostgreSQL)

Na raiz do projeto:

```bash
docker-compose up -d
```

Isso irá subir o PostgreSQL na porta `5432` com as seguintes credenciais:
- **Usuário:** postgres
- **Senha:** postgres
- **Database:** tm_database

### 2. Configurar e Rodar o Backend

Consulte o [README do Backend](./backend/README.md) para instruções detalhadas:

```bash
cd backend

# Copiar arquivo de ambiente
cp .env.example .env

# Instalar dependências
npm install

# Executar migrations
npm run migration:run

# Iniciar em modo de desenvolvimento
npm run start:dev
```

O backend estará disponível em: **http://localhost:3000/api**

### 3. Configurar e Rodar o Frontend

Consulte o [README do Frontend](./frontend/README.md) para instruções detalhadas:

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar em modo de desenvolvimento
npm start
```

O frontend estará disponível em: **http://localhost:4200**

## 📚 Funcionalidades

### Obrigatórias
✅ CRUD completo de Leads  
✅ CRUD completo de Propriedades Rurais  
✅ Filtragem e listagem  
✅ Ciclo de vida de status de leads  
✅ Validação de dados (backend e frontend)

### Opcionais / Diferenciais
✅ Dashboard com estatísticas:
  - Total de leads
  - Leads agrupados por status
  - Leads agrupados por município
✅ Indicador visual para leads prioritários (propriedades > 100 hectares)

## 🗂️ Conceitos do Domínio

### Lead
Representa um cliente potencial.

**Campos:**
- ID, Nome, CPF
- Status: `NEW`, `INITIAL_CONTACT`, `NEGOTIATION`, `CONVERTED`, `LOST`
- Comentários
- Município
- Timestamps (criação/atualização)

### Propriedade Rural
Representa uma propriedade agrícola vinculada a um lead.

**Campos:**
- ID, Lead ID
- Tipo de Cultura: `SOY` (Soja), `CORN` (Milho), `COTTON` (Algodão)
- Área em Hectares
- Geometria (armazenada como texto/JSON)
- Timestamps (criação/atualização)

**Regra de Prioridade:**
- Leads com pelo menos uma propriedade onde `areaHectares > 100` são considerados prioritários

## 📡 API Endpoints

### Leads
```
GET    /leads              # Listar leads
GET    /leads/:id          # Obter lead por ID
POST   /leads              # Criar lead
PUT    /leads/:id          # Atualizar lead
DELETE /leads/:id          # Deletar lead
GET    /leads/:id/properties # Propriedades do lead
```

### Propriedades Rurais
```
GET    /rural-properties      # Listar propriedades
GET    /rural-properties/:id  # Obter propriedade por ID
POST   /rural-properties      # Criar propriedade
PUT    /rural-properties/:id  # Atualizar propriedade
DELETE /rural-properties/:id  # Deletar propriedade
```

### Dashboard
```
GET    /dashboard/stats    # Estatísticas do dashboard
```

## 🧪 Testes

O projeto inclui testes unitários para validar regras de negócio e casos de uso.

### Backend
```bash
cd backend
npm test
```

## 🛠️ Comandos Úteis

### Docker
```bash
# Subir serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

### Backend
```bash
cd backend

# Desenvolvimento
npm run start:dev

# Build
npm run build

# Migrations
npm run migration:generate -- src/infrastructure/database/migrations/MigrationName
npm run migration:run
npm run migration:revert

# Formatação e Lint
npm run format
npm run lint
```

### Frontend
```bash
cd frontend

# Desenvolvimento
npm start

# Build de produção
ng build --configuration production
```

## 📖 Documentação Adicional

- [Backend README](./backend/README.md) - Detalhes da API e arquitetura do backend
- [Frontend README](./frontend/README.md) - Detalhes da aplicação Angular
- [Copilot Instructions](./.github/copilot-instructions.md) - Contexto do projeto para IA

## 📝 Notas de Desenvolvimento

### Princípios Aplicados
- **Clean Architecture** com separação clara de camadas
- **DDD** (Domain-Driven Design) aplicado pragmaticamente
- **SOLID** principles
- Código legível e manutenível
- Validação robusta em ambas as camadas

### Não Implementado (por design)
- Autenticação/Autorização avançada
- Integrações com APIs externas
- Mapas ou visualizações espaciais
- Testes E2E automatizados

## 👤 Sobre

Projeto desenvolvido como parte de uma avaliação técnica para TM Digital.

**Objetivo:** Demonstrar fundamentos sólidos de engenharia de software com foco em:
- Correção
- Organização de código
- Manutenibilidade
- Consistência arquitetural

---

**Licença:** Projeto privado - Avaliação técnica
