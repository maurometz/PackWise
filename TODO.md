# PackWise — TODO

Registro das funcionalidades planejadas e ainda não implementadas.

## Prioridade imediata — colaboração

- [ ] Implementar atribuição de itens a membros da viagem.
  - [ ] Seletor de responsável no formulário de item.
  - [ ] Exibir nome/avatar do responsável no checklist.
  - [ ] Filtro “Meus itens”.
  - [ ] Remover ou trocar responsável.
- [ ] Implementar atualizações em tempo real com WebSockets.
  - [ ] Conectar clientes por viagem.
  - [ ] Transmitir criação, edição, exclusão e conclusão de itens.
  - [ ] Transmitir entrada e saída de membros.
  - [ ] Recarregar dados após reconexão.
  - [ ] Exibir indicador de membros online.
- [ ] Criar painel completo de membros.
  - [ ] Listar nome, avatar e papel.
  - [ ] Mostrar ações administrativas.
  - [ ] Permitir sair da viagem.
  - [ ] Permitir regenerar o convite.
- [ ] Implementar página dedicada para aceitar convites.
  - [ ] Mostrar resumo da viagem antes de aceitar.
  - [ ] Orientar usuários não autenticados para o login/cadastro.

## Checklist

- [ ] Implementar edição visual de itens.
- [ ] Implementar exclusão visual de itens.
- [ ] Confirmar exclusão com modal.
- [ ] Agrupar visualmente os itens por categoria.
- [ ] Melhorar filtros por categoria.
- [ ] Implementar filtro “Meus itens”.
- [ ] Aplicar completamente a visibilidade na interface colaborativa.
  - [ ] Item privado visível somente para o autor.
  - [ ] Item secreto exibido como placeholder para os demais.
- [ ] Adicionar indicador de quem marcou ou desmarcou um item.
- [ ] Adicionar animação de conclusão e confetti/check tátil.
- [ ] Permitir reordenar itens.
- [ ] Permitir duplicar itens.
- [ ] Criar categorias personalizadas.
- [ ] Adicionar itens padrão configuráveis pelo usuário.

## Motor inteligente de bagagem

- [ ] Refinar fatores de quantidade por clima, duração e propósito.
- [ ] Adicionar regras específicas para negócios, luxo, aventura e praia.
- [ ] Adicionar regras para crianças, bebês e necessidades especiais.
- [ ] Adicionar sugestões de documentos por país.
- [ ] Usar a previsão meteorológica para ajustar automaticamente as sugestões.
- [ ] Permitir regenerar ou atualizar o checklist após alterar os dados da viagem.
- [ ] Exibir explicação de por que cada item foi sugerido.

## Meteorologia

- [ ] Persistir latitude, longitude e local selecionado da viagem.
- [ ] Persistir o resultado meteorológico quando necessário.
- [ ] Adicionar previsão diária completa para todos os dias disponíveis.
- [ ] Exibir ícones meteorológicos mais precisos por código WMO.
- [ ] Atualizar a previsão periodicamente.
- [ ] Criar fallback visual para destinos não localizados.
- [ ] Usar clima sazonal/estimado para viagens fora da janela de 16 dias.

## Gestão de viagens

- [ ] Criar edição das informações da viagem.
- [ ] Permitir excluir viagem somente para `ADMIN`.
- [ ] Criar confirmação antes de excluir.
- [ ] Permitir duplicar uma viagem.
- [ ] Criar histórico de viagens concluídas.
- [ ] Criar arquivamento de viagens.
- [ ] Adicionar ordenação e filtros no dashboard.
- [ ] Exibir contagem de itens e progresso no card da viagem.
- [ ] Criar tela de detalhes mais completa para clima, membros e resumo.

## Viagem solo

- [ ] Criar aba Hub de Emergência & Contatos.
- [ ] Adicionar contatos de emergência.
- [ ] Adicionar telefone do consulado.
- [ ] Adicionar dados da apólice do seguro.
- [ ] Adicionar detalhes de voo.
- [ ] Adicionar detalhes da hospedagem.
- [ ] Criar área de observações pessoais.
- [ ] Implementar alertas de check-in 24/48 horas antes.
- [ ] Alertar sobre validade mínima do passaporte.
- [ ] Criar lembretes relacionados a vistos.

## Autenticação e perfil

- [ ] Criar tela completa de login.
- [ ] Criar tela completa de cadastro.
- [ ] Implementar recuperação de senha.
- [ ] Implementar redefinição de senha.
- [ ] Implementar verificação de e-mail.
- [ ] Adicionar refresh token e revogação de sessão.
- [ ] Criar gerenciamento de sessões/dispositivos.
- [ ] Criar tela de perfil.
- [ ] Permitir alterar nome, avatar e preferências.
- [ ] Adicionar preferências gerais de viagem.
- [ ] Preparar login social para etapa futura.

## Convites por e-mail

- [ ] Criar entidade de convites enviados.
- [ ] Adicionar status de convite: pendente, aceito, expirado e cancelado.
- [ ] Integrar serviço de e-mail.
- [ ] Criar template visual do convite.
- [ ] Permitir convidar por e-mail.
- [ ] Permitir reenviar convite.
- [ ] Permitir cancelar convite.

## Notificações

- [ ] Criar sistema de notificações internas.
- [ ] Notificar entrada de membro.
- [ ] Notificar atribuição de item.
- [ ] Notificar alterações relevantes no checklist.
- [ ] Criar lembretes de viagem solo.
- [ ] Criar central de notificações.
- [ ] Marcar notificações como lidas.

## PWA e experiência mobile

- [ ] Criar ícones reais do PWA.
- [ ] Adicionar splash screen.
- [ ] Testar instalação em Android e iOS.
- [ ] Implementar cache offline do checklist.
- [ ] Permitir marcar itens offline e sincronizar depois.
- [ ] Criar estados de conexão e sincronização.
- [ ] Revisar todos os layouts em telas pequenas.
- [ ] Adicionar navegação mobile mais completa.

## UI/UX

- [ ] Adicionar skeleton loading.
- [ ] Melhorar empty states com ilustrações.
- [ ] Padronizar componentes em estilo shadcn/ui.
- [ ] Adicionar tooltips para ações menos óbvias.
- [ ] Revisar acessibilidade e navegação por teclado.
- [ ] Revisar contraste e estados de foco.
- [ ] Adicionar dark mode, se desejado.
- [ ] Refinar microinterações e transições.

## Qualidade e infraestrutura

- [ ] Criar testes unitários do `smartPackingEngine`.
- [ ] Criar testes das rotas de autenticação.
- [ ] Criar testes das permissões de viagem.
- [ ] Criar testes de privacidade dos itens.
- [ ] Criar testes dos convites.
- [ ] Criar testes de integração do checklist.
- [ ] Adicionar tratamento padronizado de erros no frontend.
- [ ] Adicionar logs estruturados no backend.
- [ ] Adicionar rate limiting.
- [ ] Revisar vulnerabilidades das dependências.
- [ ] Criar documentação da API.
- [ ] Criar seed de desenvolvimento.
- [ ] Preparar ambiente de staging.
- [ ] Preparar deploy de frontend, backend e MySQL.
- [ ] Configurar CI para typecheck, testes e build.

## Ideias futuras

- [ ] Compartilhar resumo da viagem.
- [ ] Exportar checklist para PDF.
- [ ] Exportar para calendário.
- [ ] Integração com reservas e passagens.
- [ ] Sugestões de roteiro e atrações.
- [ ] Orçamento da viagem.
- [ ] Divisão de despesas do grupo.
- [ ] Modo viagem concluída com memória/fotos.
- [ ] Compartilhamento público opcional da viagem.
