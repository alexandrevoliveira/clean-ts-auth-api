# Autenticação por Email e Senha

> ## Dados
* Email
* Senha

> ## Fluxo primário
1. Validar dados obrigatórios (email e senha)
2. Validar formato de email
3. Buscar usuário pelo email e verificar se a senha bate com a senha armazenada
4. Criar um token de acesso a partir do ID do usuário, com expiração de 30 minutos
5. Retornar o token de acesso gerado

> ## Fluxo de exceção: Email não cadastrado ou senha inválida
1. Retornar um erro de autenticação
