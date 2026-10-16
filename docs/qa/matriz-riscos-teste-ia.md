# Priorização de testes baseada em risco com apoio de IA — Técnica 4

## Objetivo e evidências

Esta matriz relaciona riscos observados no Trihbau PetShop aos cenários candidatos de `matriz-cenarios-teste.md`, testes existentes e lacunas conhecidas. A análise foi apoiada manualmente por IA e revisada contra o README, o código e os testes do repositório. Não há integração automatizada com modelo.

Fontes principais: `README.md`, `server/auth.js`, `server/db.js`, `server/openapi.js`, `src/App.tsx`, `src/components/MinhaArea.tsx`, `tests/auth.spec.ts`, `tests/home.spec.ts` e `api-tests/src/test/java/com/trihbau/api/`.

## Critério de priorização

- **P1 — prioridade alta:** falha potencial pode expor dados entre tutores, impedir autenticação, corromper/perder reservas ou comprometer regra central do agendamento.
- **P2 — prioridade média:** impacto potencial mais localizado, como validação de cadastro de pet ou consulta do catálogo.
- **Probabilidade:** desconhecida. Não há histórico de incidentes, telemetria ou taxa de falha disponível; por isso não atribuo números nem uma pontuação matemática.
- **Frequência de uso e impacto financeiro:** não medidos. A classificação usa a consequência técnica potencial e a importância do fluxo descrito no produto.
- **Custo de execução:** a suíte E2E local de seis casos levou aproximadamente 1,2 minuto nesta rodada, mas houve uma falha. Não há tempos comparáveis por cenário nem medição de CI; portanto custo não é usado para inventar prioridade.

As prioridades abaixo são recomendações provisórias e aguardam validação humana. P1 indica consequência potencial alta, não probabilidade alta ou falha confirmada.

## Matriz de riscos

| Ordem | Risco | Consequência potencial | Evidência e lacuna de cobertura | Cenários relacionados | Prioridade proposta |
| --- | --- | --- | --- | --- | --- |
| 1 | Um tutor acessar ou alterar pet/agendamento de outro tutor | Exposição ou alteração de dados pessoais e perda de integridade entre contas | O código filtra operações pelo tutor autenticado; não encontrei teste automatizado de acesso cruzado nos testes revisados | PET-03, PET-04, BOOK-04, BOOK-08 | P1 |
| 2 | Dois pedidos ocuparem a mesma vaga ou excederem a capacidade do horário | Sobreagendamento, indisponibilidade incorreta ou perda de uma reserva | O backend usa transação e limite de capacidade; não encontrei teste de lotação nem concorrência | BOOK-06 | P1 |
| 3 | Cadastro, login ou proteção de sessão falhar | Usuário legítimo não acessa a conta, conta duplicada ou rota protegida acessível sem token | Login válido tem teste API e E2E isolado; logins inválidos têm exemplos API. Cadastro inválido, e-mail duplicado e acesso sem token não foram encontrados na cobertura revisada | AUTH-01 a AUTH-07 | P1 |
| 4 | Agendamento aceitar data/horário inválido ou combinar serviços incompatíveis | Reserva impraticável ou quebra de regra de serviço; divergência de horário já existe entre README e backend | Fluxo positivo e regra das tosas têm E2E/API no código. Na suíte atual, o agendamento apareceu na tela, mas o cenário terminou falhando na etapa de abertura externa do WhatsApp. Faixa de horários permanece divergente e requer decisão de produto | BOOK-02, BOOK-03, BOOK-05, BOOK-09 | P1 |
| 5 | Validações/propriedade de pet falharem | Dados inválidos ou acesso indevido a cadastro de pet | E2E cria um pet com valores comuns; não encontrei testes de limites, valores inválidos ou isolamento entre tutores | PET-01 a PET-04 | P1 para isolamento; P2 para limites de campos |
| 6 | Catálogo de produtos apresentar dados errados ou não tratar produto ausente | Usuário vê informação incorreta ou consulta que deveria retornar ausência falha | E2E verifica navegação, produtos iniciais e alguns preços; não encontrei teste API específico para produto inexistente | PROD-01 | P2 |

## Ordem de execução recomendada

1. **Isolamento entre tutores:** cobrir leitura/edição/exclusão cruzada de pets e agendamentos. A consequência potencial é alta e não há teste encontrado.
2. **Capacidade e concorrência de vagas:** testar lotação e tentativa concorrente de reserva, preservando a regra transacional.
3. **Autenticação e autorização:** completar cadastro inválido/duplicado e ausência/token inválido em rotas protegidas; manter login válido e inválido na regressão.
4. **Validações de pets:** adicionar limites de idade/peso e manter o cenário de propriedade por tutor.
5. **Regras de agendamento:** cobrir datas inválidas, serviços e capacidade após decisão do negócio sobre os horários descritos até 19:30.
6. **Catálogo:** completar consulta por ID inexistente e, se o contrato exigir, testar dados pela API.

Esta ordem favorece riscos de privacidade e integridade antes de cenários de apresentação. A sequência é qualitativa; não foi otimizada por duração individual ou frequência de uso, que não estão medidas.

## Sugestões da IA e revisão humana

| Sugestão da IA | Motivo | Revisão/estado |
| --- | --- | --- |
| Priorizar isolamento de dados por tutor | Consequência potencial de exposição/alteração cruzada e ausência de teste localizado | Recomendada como P1; aguarda validação humana |
| Testar lotação e concorrência de vagas | O backend controla capacidade por transação, mas a cobertura revisada não exercita conflito | Recomendada como P1; estratégia sequencial ou concorrente deve considerar estabilidade do banco de teste |
| Completar casos negativos de autenticação e autorização | Rotas protegidas dependem do JWT; lacunas de cobertura podem ocultar regressões de acesso | Recomendada como P1; contratos documentados devem orientar status e corpo |
| Cobrir limites de campos de pets e produto inexistente | São lacunas mais localizadas e têm impacto potencial menor que isolamento/reserva | Recomendada como P2, exceto propriedade de pet, que permanece P1 |
| Não calcular risco numérico | Probabilidade, volume de uso, incidentes e custo por teste não foram fornecidos | Aceita nesta análise: prioridades ficam explicitamente qualitativas e provisórias |

Nenhuma recomendação desta tabela é requisito de negócio aprovado. A matriz deve ser atualizada quando houver validação dos contratos, dados de uso ou histórico de falhas.

## Limitações e resultado da técnica

- A matriz usa consequência potencial, código e cobertura observada; não estima probabilidade de ocorrência.
- Não há dados de produção, volume de uso, impacto financeiro nem histórico de incidentes.
- O teste de agendamento tem uma falha real posterior ao salvamento: a abertura do WhatsApp não foi observada. A análise inconclusiva está documentada em `analise-falha-tecnica-3.md`.
- Os resultados Java mencionados em relatórios antigos são históricos; os testes Java não foram reexecutados nesta rodada.
- Recomendações de prioridade aguardam validação humana antes de serem tratadas como plano aprovado.
