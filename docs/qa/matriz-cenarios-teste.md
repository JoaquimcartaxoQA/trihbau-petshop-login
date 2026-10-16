# Matriz de cenários de teste com apoio de IA

## Objetivo e limites

Este documento registra cenários candidatos para a automação do TrihbAU PetShop. A análise usa o README, o contrato OpenAPI, a implementação revisada e os testes existentes. Um comportamento encontrado no código descreve o sistema observado; sozinho, não confirma que essa seja a regra de negócio desejada.

A geração desta matriz foi feita com apoio manual de IA e revisão técnica. Não existe, neste passo, integração automatizada com modelo por API. Nenhum cenário abaixo foi executado nesta atividade.

## Fontes consultadas

- Regras e comandos: `README.md`, `package.json`, `playwright.config.ts`, `vitest.config.ts` e `.github/workflows/ci.yml`.
- Regras implementadas: `server/auth.js`, `server/db.js` e `server/products.js`.
- Contrato publicado: `server/openapi.js`.
- Testes existentes: `tests/auth.spec.ts`, `tests/home.spec.ts` e `api-tests/src/test/java/com/trihbau/api/`.

## Critério de prioridade provisória

- **P1 — alta:** uma falha pode impedir acesso à conta, expor ou alterar dados de outro tutor, ou causar perda/conflito de uma vaga.
- **P2 — média:** uma falha afeta validações, manutenção dos dados ou uma função secundária, sem evidência de impacto mais amplo.

Esta classificação é uma avaliação qualitativa inicial, baseada no impacto potencial descrito acima. O projeto não forneceu histórico de incidentes, frequência de uso, impacto financeiro nem tempos de execução. Portanto, não atribuí probabilidades nem apresentei a prioridade como métrica medida. A prioridade e as premissas aguardam revisão humana.

## Cenários candidatos

### Atualização de cobertura — 16/10/2026

Esta atualização complementa as observações da criação inicial da matriz:

- Cadastro/logout e login de tutor passaram quando executados isoladamente.
- A suíte Playwright completa executou seis casos: cinco passaram; o caso de agendamento criou e exibiu a reserva, mas terminou em timeout ao aguardar a abertura do WhatsApp. A causa permanece inconclusiva; consulte `analise-falha-tecnica-3.md`.
- O fluxo de login por interface agora está coberto em `tests/auth.spec.ts` e passou isoladamente.
- A execução atual não revalidou os testes Java; resultados anteriores continuam históricos.

| ID | Área | Cenário | Tipo | Resultado esperado candidato | Base e estado da regra | Cobertura revisada | Prioridade provisória |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AUTH-01 | Cadastro | Cadastrar tutor com nome, e-mail e senha válidos | Positivo | Cadastro retorna sucesso e token; a interface abre a Área do Tutor | README, OpenAPI e código descrevem o fluxo | E2E cobre cadastro; API `LoginApiTest` também cadastra tutor para preparar login | P1 |
| AUTH-02 | Cadastro | Enviar campo obrigatório ausente ou vazio | Negativo / limite | API rejeita a requisição com `400` | README/OpenAPI documentam campos obrigatórios; código verifica valores ausentes | Não encontrado nos testes revisados | P1 |
| AUTH-03 | Cadastro | Reutilizar e-mail já cadastrado | Negativo | API rejeita o cadastro com `409` | README/OpenAPI e código descrevem e implementam conflito | Não encontrado nos testes revisados | P1 |
| AUTH-04 | Cadastro | Informar senha com menos de seis caracteres | Limite / contrato | **A definir:** interface impõe mínimo de seis; API não aplica o mesmo limite no código revisado | Regra observada na interface; divergência com API precisa de decisão de produto | Não encontrado nos testes revisados | P2 |
| AUTH-05 | Login | Entrar com credenciais válidas | Positivo | Retorna nome e token; interface abre a Área do Tutor | README, OpenAPI e código | API coberta por `LoginApiTest`; E2E de login de conta existente não encontrado | P1 |
| AUTH-06 | Login | Usar e-mail inexistente ou senha incorreta | Negativo | API retorna `401` com erro de credenciais inválidas | README/OpenAPI e código | API coberta por `InvalidLoginTest`; quatro exemplos existentes, incluindo formatos de e-mail inválidos | P1 |
| AUTH-07 | Sessão | Acessar rota protegida sem token ou com token inválido | Negativo / autorização | API retorna `401` | OpenAPI e middleware de autenticação descrevem esse comportamento | Não encontrado nos testes revisados | P1 |
| PET-01 | Pets | Criar pet com dados válidos, incluindo idade zero e peso positivo | Positivo / limite | API cria o pet e retorna os dados | OpenAPI define idade mínima zero e peso maior que zero; código valida ambos | E2E cria um pet com valores comuns; limite de idade zero não encontrado | P1 |
| PET-02 | Pets | Enviar idade negativa ou fracionária, ou peso zero/negativo | Negativo / limite | API rejeita os dados com `400` | Regras implementadas em `server/auth.js`; consistentes com limites OpenAPI | Não encontrado nos testes revisados | P2 |
| PET-03 | Pets | Tutor tenta editar ou excluir pet de outro tutor | Negativo / autorização | Operação não altera o pet e retorna `404` | Código restringe a consulta pelo tutor autenticado | Não encontrado nos testes revisados | P1 |
| PET-04 | Pets | Consultar pets sem autenticação | Negativo / autorização | API retorna `401` | OpenAPI e middleware de autenticação | Não encontrado nos testes revisados | P1 |
| BOOK-01 | Agendamento | Consultar vagas para dia útil atual ou futuro | Positivo | API lista horários, capacidade, reservas e vagas restantes | README, OpenAPI e código; horários implementados no backend são 08:00 a 18:00 | E2E e API consultam disponibilidade no fluxo de agendamento | P1 |
| BOOK-02 | Agendamento | Consultar ou reservar em fim de semana, data passada ou formato inválido | Negativo / limite | API rejeita com `400` | Código implementa validações; README descreve dias úteis | Não encontrado como teste negativo nos testes revisados | P1 |
| BOOK-03 | Agendamento | Reservar horário válido para pet do tutor e selecionar serviço permitido | Positivo | API cria reserva e retorna data, horário, pet e serviços | README e código; fluxo de reserva está implementado | E2E e `AppointmentApiTest` cobrem o fluxo positivo | P1 |
| BOOK-04 | Agendamento | Reservar usando pet de outro tutor | Negativo / autorização | API rejeita a reserva com `404` | Código verifica propriedade do pet dentro da transação | Não encontrado nos testes revisados | P1 |
| BOOK-05 | Agendamento | Selecionar “Tosa completa” e “Tosa higiênica” juntas | Negativo / regra de serviço | API rejeita com `400`; interface impede a combinação | README, OpenAPI e código | E2E e `AppointmentApiTest` cobrem a incompatibilidade | P1 |
| BOOK-06 | Agendamento | Tentar reservar vaga já lotada | Negativo / capacidade | API rejeita com `409`; vagas disponíveis não ficam negativas | Código compara reservas com capacidade dentro de transação | Não encontrado nos testes revisados | P1 |
| BOOK-07 | Agendamento | Enviar lista vazia, serviço desconhecido ou serviço repetido | Negativo / limite | Lista vazia ou serviço desconhecido é rejeitado; duplicados são removidos pelo código | Comportamento de duplicatas é observado no código, não confirmado como requisito de negócio | Não encontrado nos testes revisados | P2 |
| BOOK-08 | Agendamento | Editar serviços ou excluir agendamento pertencente a outro tutor | Negativo / autorização | Não altera dados alheios e retorna `404` | Código filtra pela propriedade do tutor | Não encontrado nos testes revisados | P1 |
| BOOK-09 | Agendamento | Selecionar horário às 18:30 ou 19:30 | Contrato / dúvida | **A definir:** README menciona horários até 19:30; backend aceita somente inícios até 18:00 | Divergência documentada, requer decisão humana antes de fixar o resultado esperado | Nenhum teste revisado resolve a divergência | P1 |
| PROD-01 | Produtos | Listar produtos ativos e consultar produto inexistente | Positivo / negativo | Lista contém produtos ativos; produto ausente retorna `404` | Código e OpenAPI | E2E verifica a página de produtos e itens/preços iniciais; teste API específico não encontrado | P2 |

## Sugestões assistidas por IA e revisão humana

As sugestões abaixo derivam das regras e lacunas observadas. A decisão final continua pendente; não as trato como requisitos aprovados.

| Sugestão | Evidência que motivou a sugestão | Decisão humana | Justificativa / informação necessária |
| --- | --- | --- | --- |
| Cobrir o login de conta existente pela interface | Há Page Object para login, mas nenhum cenário E2E revisado chama seu método `login` | Pendente | Confirmar se o login E2E faz parte do escopo de portfólio |
| Cobrir autorização entre tutores distintos | Rotas de pets e agendamentos filtram pelo tutor do JWT | Pendente | Regra de isolamento está implementada; validar prioridade e contratos de resposta |
| Cobrir esgotamento de capacidade de horário | Reserva confere capacidade e retorna `409` quando lotada | Pendente | Confirmar se vale criar cenário concorrente ou apenas reservar até esgotar sequencialmente |
| Alinhar regra/documentação dos horários até 19:30 | README e implementação do backend divergem | Pendente | Decisão de produto necessária antes de automatizar um resultado esperado |
| Testar limite de senha na API | Interface exige seis caracteres, mas a API revisada aceita qualquer valor não vazio | Pendente | Definir se a validação deve existir no backend e qual é o mínimo correto |

## Limitações da evidência atual

- A leitura do código identifica o comportamento implementado, não confirma sozinha os requisitos de negócio.
- Os relatórios disponíveis são históricos: Playwright em 22/09/2026, cobertura em 15/09/2026 e testes Java em 27/09/2026. Não foram reexecutados nesta técnica.
- O relatório Java histórico registra sete testes sem falhas; isso não prova que os cenários desta matriz passem hoje.
- As prioridades são provisórias e qualitativas. Não há dados de produção nem histórico de falhas para estimar probabilidade.
- A evidência Playwright não foi aberta nesta técnica; o inventário anterior apenas confirmou a presença dos artefatos.
