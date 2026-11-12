<div align="center">

<img src="public/favicon.svg" width="64" alt="Logo do LearnHub" />

# LearnHub

**Estudos, grana, hábitos e carreira. Num painel só.**

Organização para estudantes: as tarefas do dia, o livro que você está lendo, o saldo do mês, o que você está aprendendo e as vagas em que se inscreveu, sincronizados no computador e no celular.

<br />

![React](https://img.shields.io/badge/React-19-0A0A0B?style=flat-square&logo=react&logoColor=C6F432&labelColor=0A0A0B)
![Firebase](https://img.shields.io/badge/Firebase-11-0A0A0B?style=flat-square&logo=firebase&logoColor=C6F432&labelColor=0A0A0B)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-0A0A0B?style=flat-square&logo=tailwindcss&logoColor=C6F432&labelColor=0A0A0B)
![Three.js](https://img.shields.io/badge/Three.js-r184-0A0A0B?style=flat-square&logo=threedotjs&logoColor=C6F432&labelColor=0A0A0B)
![GSAP](https://img.shields.io/badge/GSAP-3.15-0A0A0B?style=flat-square&logo=greensock&logoColor=C6F432&labelColor=0A0A0B)
![Motion](https://img.shields.io/badge/Motion-14-0A0A0B?style=flat-square&logo=framer&logoColor=C6F432&labelColor=0A0A0B)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-0A0A0B?style=flat-square&logo=javascript&logoColor=C6F432&labelColor=0A0A0B)

<br />

<a href="#como-funciona">Como funciona</a> ·
<a href="#tecnologias">Tecnologias</a> ·
<a href="#arquitetura">Arquitetura</a> ·
<a href="#system-design">System design</a>

<br /><br />

<img src="docs/images/home.jpg" alt="Página inicial do LearnHub" width="100%" />

</div>

<br />

## Sobre

O LearnHub reúne cinco áreas da vida de estudante em um único painel:

| Módulo | O que você faz |
|---|---|
| **Tarefas** | Anota o que precisa fazer escrevendo como fala ("amanhã estudar java às 19h") e acompanha hoje, amanhã e a semana. |
| **Biblioteca** | Cadastra livros (com busca automática de capa e páginas), marca a página atual, avalia e escreve anotações. |
| **Finanças** | Registra entradas e saídas, acompanha saldo, gastos e reserva, e vê um gráfico dos últimos 6 meses. |
| **Habilidades** | Mapeia o que está aprendendo, acompanha o nível de domínio e recebe sugestões de próximo passo. |
| **Carreira** | Acompanha cada candidatura da inscrição à aprovação e define metas (cursos, certificações, idiomas). |

Tudo fica salvo na nuvem e aparece na hora em qualquer aparelho.

<br />

## Como funciona

### 1. Entrar

Login com e-mail e senha, cadastro em três etapas e recuperação de senha por e-mail.

<img src="docs/images/login.jpg" alt="Tela de login" width="100%" />

### 2. O painel

Depois de entrar, o painel resume os cinco módulos com dados reais: o livro em andamento, o saldo (que pode ser ocultado), o domínio médio das habilidades, a última candidatura e as tarefas de hoje e amanhã.

<img src="docs/images/painel.jpg" alt="Painel com os cinco módulos" width="100%" />

### 3. Do card ao módulo

Ao clicar em um card, os outros recuam e a tela do módulo nasce do tamanho e da posição daquele card, expandindo até ocupar a tela. Cada módulo tem uma tela de entrada com a foto, uma frase e os números principais.

<img src="docs/images/transicao.jpg" alt="Sequência da transição do card para a tela do módulo" width="100%" />

Ao entrar, a foto encolhe e vira o banner do topo do módulo. A animação é a mesma imagem se transformando, não uma troca de tela.

### 4. Os módulos

<img src="docs/images/modulo-tarefas.jpg" alt="Módulo Tarefas" width="100%" />

<b>Tarefas</b>: entrada rápida com prévia do que foi entendido, faixa da semana, grupos (atrasadas, hoje, amanhã, próximos dias, sem data), destaque de importantes e exclusão com "Desfazer".

<table>
  <tr>
    <td width="50%"><img src="docs/images/modulo-leitura.jpg" alt="Módulo Biblioteca" /><br /><b>Biblioteca</b>: estante em grade ou lista, favoritos, progresso por página, avaliação e anotações.</td>
    <td width="50%"><img src="docs/images/modulo-financas.jpg" alt="Módulo Finanças" /><br /><b>Finanças</b>: saldo, gastos e reserva, gráfico mensal, cartão e lançamento rápido por texto.</td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/images/modulo-habilidades.jpg" alt="Módulo Habilidades" /><br /><b>Habilidades</b>: radar por categoria, mapa das habilidades e dicas de próximo passo.</td>
    <td width="50%"><img src="docs/images/modulo-carreira.jpg" alt="Módulo Carreira" /><br /><b>Carreira</b>: funil de candidaturas, etapas de cada processo, anotações e metas.</td>
  </tr>
</table>

### 5. Escrever do jeito que se fala

Em Tarefas e em Finanças, dá para registrar escrevendo uma frase comum. O texto é interpretado por regras (não é IA), e em Tarefas uma prévia mostra o que vai ser criado antes de salvar:

| Você escreve | O LearnHub registra |
|---|---|
| `amanhã estudar java às 19h` | Tarefa "Estudar java", amanhã, 19:00, categoria Estudo |
| `sexta entrevista 14h` | Tarefa "Entrevista", na sexta, 14:00, categoria Carreira |
| `hoje supermercado` | Tarefa "Supermercado", hoje, categoria Compras |
| `gastei 32 no almoço` | Saída de R$ 32,00 em "Refeição" |
| `recebi 800 de bolsa` | Entrada de R$ 800,00 em "Bolsa de estudos" |
| `guardei 100` | R$ 100,00 do saldo vão para a reserva |

### 6. Busca rápida

<kbd>Ctrl</kbd> + <kbd>K</kbd> (ou <kbd>Cmd</kbd> + <kbd>K</kbd> no Mac) abre a busca para ir a qualquer módulo ou ação sem usar o mouse.

<img src="docs/images/busca.jpg" alt="Busca rápida com Ctrl+K" width="100%" />

### 7. No celular

A navegação vira um dock embaixo da tela, os campos usam 16 px (o iPhone não dá zoom ao tocar), os alvos de toque têm pelo menos 44 px e as janelas sobem de baixo como uma folha.

<img src="docs/images/mobile.jpg" alt="LearnHub no celular" width="100%" />

> As imagens usam dados de exemplo.

<br />

## Tecnologias

| Camada | Tecnologia | Para quê |
|---|---|---|
| Interface | **React 19** | Componentes e estado da aplicação |
| Rotas | **React Router 7** | Navegação, rotas privadas e carregamento sob demanda |
| Estilo | **Tailwind CSS 3.4** | Design system com tokens próprios (`ink` e `lime`) |
| Animação | **Motion 14** | Transições de layout, abas, diálogos e microinterações |
| Animação | **GSAP 3.15** + ScrollTrigger + SplitText | Títulos letra a letra, scroll horizontal fixado e a expansão do card |
| 3D | **Three.js** + **React Three Fiber** | Campo de partículas com shader próprio no hero e no login |
| Dados | **Firebase Auth** + **Cloud Firestore** | Login e banco de dados em tempo real |
| Ícones | **Lucide** | Ícones consistentes (o app não usa emojis) |
| Fontes | **Geist** e **Geist Mono** | Texto e números, servidas junto com o app |
| Build | **Create React App 5** + **CRACO 7** | Build e alias `@/` para `src/` |
| APIs externas | **Google Books** e **Open Library** | Busca de livros, capas e número de páginas |

<br />

## Arquitetura

O código é organizado **por funcionalidade**: cada módulo tem a própria pasta com página, componentes e lógica. Tudo que é compartilhado fica em `components/`, `context/` e `lib/`. Os imports internos usam o alias `@/`.

```
src/
├── app/                      # Ponto de montagem da aplicação
│   ├── App.jsx               #   provedores, rotas e carregamento sob demanda
│   └── PrivateRoute.jsx      #   bloqueia rotas sem login
│
├── components/               # Compartilhado entre módulos
│   ├── ui/                   #   design system: botão, campos, diálogo, toasts, abas...
│   ├── layout/               #   AppShell (sidebar + dock), ModuleFrame (intro + banner),
│   │                         #   CommandPalette (Ctrl+K), AuthLayout, transição do card
│   └── brand/                #   logo
│
├── context/
│   ├── AuthContext.jsx       # sessão do Firebase + tipo de conta (aluno/admin)
│   └── StudentContext.jsx    # perfil do aluno em tempo real
│
├── features/                 # Um diretório por funcionalidade
│   ├── landing/              #   página inicial (hero 3D, scroll horizontal, recursos)
│   ├── auth/                 #   login, cadastro, recuperação de senha, boas-vindas
│   ├── painel/               #   painel com os cards dos módulos
│   ├── leitura/              #   Biblioteca
│   │   ├── LeituraPage.jsx
│   │   ├── components/       #     BookDetail, BookCover, Stars
│   │   ├── lib/              #     busca (Google Books / Open Library), constantes
│   │   └── data/             #     base local de livros para busca instantânea
│   ├── financas/             #   Finanças (gráfico, lançamento rápido, cartão)
│   ├── habilidades/          #   Habilidades (radar, mapa, dicas)
│   ├── carreira/             #   Carreira (etapas, candidaturas, metas)
│   ├── tarefas/              #   Tarefas (entrada por frase, semana, grupos por dia)
│   └── conta/                #   perfil e relatório de problemas
│
├── lib/
│   ├── firebase.js           # inicialização do Firebase
│   ├── collections.js        # nomes das coleções do Firestore em um só lugar
│   └── utils.js              # cn() para juntar classes do Tailwind
│
├── assets/modules/           # fotos dos módulos (preto e branco, comprimidas)
└── styles/global.css         # base do Tailwind e ajustes globais
```

## System design

### Visão geral

O LearnHub é uma SPA estática (hospedada na Vercel) que fala direto com o Firebase. Não existe servidor próprio: a autenticação é do Firebase Auth, e o acesso aos dados é controlado pelas regras do Firestore.

```mermaid
flowchart LR
    U["Estudante<br/>(navegador ou celular)"] --> SPA

    subgraph SPA["SPA React (Vercel)"]
        direction TB
        R["React Router<br/>rotas sob demanda"] --> P["Páginas dos módulos"]
        P --> CTX["AuthContext<br/>StudentContext"]
        P --> DS["Design system<br/>components/ui"]
    end

    CTX -- "login / sessão" --> AUTH[("Firebase Auth")]
    P -- "onSnapshot (tempo real)<br/>escritas" --> FS[("Cloud Firestore")]
    FS --- RULES["firestore.rules<br/>cada um só acessa o que é seu"]
    P -- "busca de livros" --> GB["Google Books API"]
    GB -. "se falhar" .-> OL["Open Library API"]
```

### Fluxo de autenticação

O app espera o perfil ser confirmado no Firestore antes de abrir qualquer rota privada, para nunca redirecionar alguém logado de volta para o login.

```mermaid
sequenceDiagram
    actor E as Estudante
    participant L as LoginPage
    participant FA as Firebase Auth
    participant AC as AuthContext
    participant FS as Firestore
    participant PR as PrivateRoute

    E->>L: e-mail e senha
    L->>FA: signInWithEmailAndPassword
    FA-->>AC: onAuthStateChanged(user)
    AC->>FS: lê alunos/{uid}
    alt perfil de aluno existe
        FS-->>AC: aluno
    else não existe
        AC->>FS: lê usuarios/{uid}
        FS-->>AC: admin ou nada
    end
    L->>AC: refreshUser() e espera o tipo da conta
    L->>PR: navega para /dashboard
    PR->>AC: perfil confirmado?
    AC-->>PR: sim
    PR-->>E: painel
```

### Modelo de dados

Cada registro pertence a um estudante: ou o id do documento é o próprio `uid`, ou o documento tem o campo `userId`.

```mermaid
erDiagram
    ALUNOS ||--o| FINANCAS_RESUMO : "id = uid"
    ALUNOS ||--o{ LEITURA : userId
    ALUNOS ||--o{ FINANCAS_TRANSACOES : userId
    ALUNOS ||--o{ HABILIDADES : userId
    ALUNOS ||--o{ CANDIDATURAS : userId
    ALUNOS ||--o{ CARREIRA_METAS : userId
    ALUNOS ||--o{ TAREFAS : userId

    ALUNOS {
        string uid PK
        string nomeCompleto
        string email
        string curso
        string nomeInstituicao
        string matricula
    }
    FINANCAS_RESUMO {
        string uid PK
        number totalBalance
        number totalSpending
        number totalSaved
        number cardBalance
    }
    LEITURA {
        string userId FK
        string titulo
        string status
        number paginasLidas
        number paginasTotal
        number avaliacao
        array anotacoes
    }
    FINANCAS_TRANSACOES {
        string userId FK
        string nome
        number valor
        string categoria
        number createdAt
    }
    HABILIDADES {
        string userId FK
        string nome
        string categoria
        number progresso
        boolean ativo
    }
    CANDIDATURAS {
        string userId FK
        string empresa
        string vaga
        string fase
        string dataEnvio
    }
    TAREFAS {
        string userId FK
        string titulo
        string data
        string hora
        string categoria
        boolean importante
        boolean concluida
    }
    CARREIRA_METAS {
        string userId FK
        string tipo
        string valorObjetivo
        boolean concluida
    }
```

### Segurança

As regras em [`firestore.rules`](firestore.rules) garantem que:

- cada pessoa só lê e escreve os próprios documentos;
- ninguém consegue criar um registro em nome de outra pessoa nem trocar o dono de um registro existente;
- relatórios de problema podem ser enviados por quem está logado, mas não lidos pelo app.

A senha nunca é gravada no Firestore: ela fica só no Firebase Authentication. A matrícula é gerada no navegador, sem consultar outros alunos, o que permite manter a coleção `alunos` fechada.

## Autor

Foto do módulo Tarefas: relógio do Museu d'Orsay, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Horloge_mus%C3%A9e_d%27Orsay.jpg) (domínio público, CC0).

Feito por **Daniel Wallans** · [github.com/DanielWallans](https://github.com/DanielWallans)
