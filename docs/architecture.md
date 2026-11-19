# Arquitetura do OctoFit Tracker

O OctoFit Tracker é uma aplicação de três camadas para um programa de atividades físicas escolar. O código inicial inclui contratos de API e pontos de implementação intencionalmente incompletos para que você use o modo agent do GitHub Copilot em um ciclo guiado por testes.

```mermaid
flowchart LR
    Browser["Navegador"]
    UI["Apresentação<br/>React 19 · Vite · React Router · Bootstrap<br/>Porta 3000 · pública"]
    API["Lógica<br/>Express · TypeScript · serviços<br/>Porta 8000 · pública"]
    DB["Dados<br/>Mongoose · MongoDB<br/>Porta 27017 · privada"]
    Contracts["Contratos executáveis<br/>Atividades · Equipes · Placar · Sugestões"]

    Browser --> UI
    UI -->|HTTP /api via proxy Vite| API
    API -->|Mongoose| DB
    Contracts -. verificam .-> UI
    Contracts -. verificam .-> API
    Contracts -. verificam .-> DB
```

## Limites entre as camadas

- **Camada de apresentação**: React 19, Vite, React Router, Bootstrap e um cliente compartilhado da API em `octofit-tracker/frontend/src`.
- **Camada de lógica**: rotas e serviços Express com TypeScript em `octofit-tracker/backend/src` expõem o comportamento `/api/*` na porta `8000`.
- **Camada de dados**: modelos Mongoose e dados de demonstração em `octofit-tracker/backend/src/models` e `src/scripts/seed.ts` são persistidos no MongoDB na porta `27017`.

## Portas e regras de ambiente

- MongoDB: `27017` (privada)
- API Express: `8000` (pública)
- Interface Vite: `3000` (pública)
- O navegador acessa caminhos relativos `/api`. O Vite os encaminha para `http://localhost:8000`; `VITE_API_BASE_URL` pode substituir a URL-base.
- Não encaminhe nem torne públicas outras portas.

## Contrato da API

| Capacidade | Método e caminho | Comportamento esperado |
| --- | --- | --- |
| Registro de atividades | `GET /api/activities`, `POST /api/activities` | Lista e cria atividades válidas. POST recebe `userId`, `teamId`, `type` e `minutes`; `userId` e `teamId` devem ser IDs bem-formados de uma pessoa e uma equipe existentes, caso contrário a API retorna um 4xx intencional (nunca um 500 causado por erro de conversão). Uma atividade criada armazena `user`, `team`, `type` e `minutes` enviados, além de `points` e `occurredAt` calculados. |
| Equipes | `GET /api/teams`, `POST /api/teams` | Lista e cria equipes com integrantes. As equipes criadas e listadas mantêm os valores enviados em `name` e `mascot`. Rejeita uma equipe sem nome com `400`. |
| Placar | `GET /api/leaderboard` | Retorna as equipes ordenadas pela soma dos pontos de suas atividades, da maior para a menor. Cada item contém `teamName`, `totalPoints` e uma `rank` iniciada em 1. |
| Sugestões de treino | `GET /api/workouts/suggestions/:userEmail` | Recomenda treinos com base nos padrões de atividade recentes da pessoa correspondente ao e-mail seed. O foco da primeira sugestão (`focus`) corresponde à meta ou à atividade recente dessa pessoa, e o campo `reason` explica o motivo. Um e-mail sem pessoa correspondente retorna um 4xx intencional (por exemplo, `404`). |

## Decisões de implementação

- Decisão da camada de apresentação: consumir a API pelo cliente compartilhado em `frontend/src`, usando caminhos `/api` e mantendo estados acessíveis de carregamento, vazio e erro.
- As sugestões exibidas na interface usam a pessoa de demonstração `mona@example.com`, sem autenticação ou seleção de pessoa.
- Decisão da camada de lógica: manter validação e regras de negócio nas rotas e serviços Express; validar entradas e referências antes de persistir e responder com 4xx intencional para entradas ou recursos inválidos.
- Decisão da camada de dados: definir campos obrigatórios, tipos e referências nos modelos Mongoose; manter o seed idempotente e operado pelos modelos da aplicação.
- Abordagem para registro de atividades: validar formato e existência de `userId` e `teamId`, persistir as referências e os valores enviados, e calcular `points` e `occurredAt` no servidor.
- Abordagem para gerenciamento de equipes: exigir `name`, preservar `name` e `mascot` e manter os integrantes como referências de pessoas; equipes sem integrantes começam com uma lista vazia.
- Abordagem para o placar: somar os pontos das atividades por equipe, ordenar do maior total para o menor e atribuir posições iniciadas em 1.
- Abordagem para sugestões de treino: localizar a pessoa pelo e-mail, considerar a meta e as atividades recentes para priorizar um treino compatível e explicar a recomendação em `reason`; retornar 4xx quando a pessoa não existir.

## Plano de testes

- Testes da camada de dados: `npm run test:data --prefix octofit-tracker/backend` — os modelos validam campos obrigatórios, duração e pontuação; o seed é idempotente e preserva registros e integrantes não relacionados.
- Testes da API: `npm run test:api --prefix octofit-tracker/backend` — 4 de 4 falharam: entradas inválidas de atividades e equipes retornam 501 em vez de 400, o placar retorna vazio e a primeira sugestão não corresponde à atividade/meta esperada.
- Testes do frontend: `npm test --prefix octofit-tracker/frontend` — verificam os dados retornados, os estados de carregamento, vazio e erro acessível, e a solicitação de sugestões para a pessoa de demonstração.
- Compilação do backend: `npm run build --prefix octofit-tracker/backend` — passou (`tsc --noEmit`).
- Compilação do frontend: `npm run build --prefix octofit-tracker/frontend` — passou (`tsc --noEmit` e `vite build`).
