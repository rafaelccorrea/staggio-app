# Staggio - App Flutter

App mobile para corretores de imóveis com IA integrada.

## Funcionalidades

- **Home Staging Virtual**: Transforme ambientes vazios em decorados com IA
- **Visão de Terrenos**: Visualize construções em terrenos vazios
- **Descrições com IA**: Gere textos profissionais para anúncios
- **Melhoria de Fotos**: Fotos profissionais com IA
- **Assistente IA**: Chat inteligente para dúvidas sobre vendas
- **Gestão de Imóveis**: Cadastre e gerencie seus imóveis
- **Planos de Assinatura**: Starter (R$39,90), Pro (R$79,90), Imobiliária (R$199,90)

## Tecnologias

- Flutter 3.41+
- Dart 3.11+
- BLoC (State Management)
- Dio (HTTP Client)
- flutter_animate (Animações)
- Google Fonts (Poppins)
- Iconsax (Ícones)

## Estrutura

```
lib/
├── core/
│   ├── constants/     # API endpoints, constantes
│   ├── network/       # API client (Dio)
│   └── theme/         # Tema, cores, tipografia
├── data/
│   └── models/        # User, Property, Generation
├── features/
│   ├── auth/          # Login, Registro, BLoC
│   ├── ai/            # Staging, Descrição, Chat, Histórico
│   ├── home/          # Dashboard, widgets
│   ├── onboarding/    # Telas de onboarding
│   ├── profile/       # Perfil do utilizador
│   ├── properties/    # CRUD de imóveis, BLoC
│   ├── shell/         # Bottom navigation
│   └── subscription/  # Planos e assinatura
└── main.dart
```

## Setup

```bash
flutter pub get
flutter run
```

## Configuração

Altere a URL da API em `lib/core/constants/api_constants.dart`:

```dart
static const String baseUrl = 'http://SEU_BACKEND:3000/api';
```

## Design

- Cores: Deep Indigo (#6C5CE7), Coral (#FF6B6B), Teal (#00D2D3)
- Font: Poppins
- Ícones: Iconsax
- Estilo: Glassmorphism + Gradients + Rounded corners
