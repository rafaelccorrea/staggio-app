/// Educação sobre as ferramentas de IA do Staggio
class AiFeatures {
  static const Map<String, AiFeatureInfo> features = {
    'staging': AiFeatureInfo(
      title: 'Home Staging Virtual',
      shortDescription: 'Decore ambientes',
      description: 'Adiciona móveis e decoração virtualmente às suas fotos de ambientes vazios ou mal decorados. '
          'A IA analisa o espaço e insere móveis realistas que combinam com o ambiente.',
      howItWorks: '1. Você seleciona uma foto do ambiente\n'
          '2. Escolhe um estilo de decoração (Moderno, Clássico, etc.)\n'
          '3. A IA gera uma versão decorada da foto\n'
          '4. Resultado fica pronto em segundos',
      whatYouGet: 'Uma imagem do mesmo ambiente, mas decorado e mais atrativo para potenciais compradores',
      creditsUsed: 1,
      plan: 'Free',
      isAiGenerated: true,
    ),
    'terrain_vision': AiFeatureInfo(
      title: 'Visão de Terreno',
      shortDescription: 'Visualize construções',
      description: 'Mostra como um imóvel ficaria construído em um terreno vazio. '
          'A IA visualiza a construção mantendo a perspectiva e iluminação realistas.',
      howItWorks: '1. Você envia uma foto do terreno vazio\n'
          '2. Seleciona o estilo arquitetônico desejado\n'
          '3. A IA projeta a construção no terreno\n'
          '4. Você vê como ficaria o resultado final',
      whatYouGet: 'Uma visualização realista de como o imóvel ficaria construído naquele terreno',
      creditsUsed: 2,
      plan: 'Pro',
      isAiGenerated: true,
    ),
    'photo_enhance': AiFeatureInfo(
      title: 'Melhorar Foto',
      shortDescription: 'Fotos profissionais',
      description: 'Melhora a qualidade das suas fotos: corrige iluminação, aumenta nitidez, '
          'melhora cores e remove imperfeições. Resultado parece profissional.',
      howItWorks: '1. Você seleciona a foto que quer melhorar\n'
          '2. A IA analisa a imagem\n'
          '3. Aplica ajustes automáticos de qualidade\n'
          '4. Entrega a foto melhorada em segundos',
      whatYouGet: 'Sua foto original, mas com melhor iluminação, cores mais vibrantes e maior nitidez',
      creditsUsed: 1,
      plan: 'Pro',
      isAiGenerated: false,
    ),
    'description': AiFeatureInfo(
      title: 'Descrição IA',
      shortDescription: 'Textos profissionais',
      description: 'Gera descrições profissionais e atrativas para seus anúncios de imóveis. '
          'Textos otimizados que destacam os pontos fortes do imóvel.',
      howItWorks: '1. Você fornece informações do imóvel\n'
          '2. Escolhe o tom (profissional, casual, luxuoso)\n'
          '3. A IA gera uma descrição completa\n'
          '4. Você pode editar e usar no anúncio',
      whatYouGet: 'Um texto profissional e atrativo pronto para usar em seus anúncios',
      creditsUsed: 1,
      plan: 'Free',
      isAiGenerated: true,
    ),
    'video_generation': AiFeatureInfo(
      title: 'Vídeo Cinematográfico',
      shortDescription: 'Vídeos profissionais',
      description: 'Cria vídeos profissionais a partir de suas fotos do imóvel. '
          'Aplica efeitos cinematográficos (Ken Burns, transições, color grading) para um resultado de alta qualidade.',
      howItWorks: '1. Você seleciona 2-20 fotos do imóvel\n'
          '2. Escolhe estilo visual, transição e duração\n'
          '3. A IA processa e gera o vídeo\n'
          '4. Vídeo fica pronto para compartilhar',
      whatYouGet: 'Um vídeo profissional de 30-60 segundos com efeitos cinematográficos, pronto para redes sociais',
      creditsUsed: 3,
      plan: 'Agency',
      isAiGenerated: true,
    ),
  };

  /// Mostrar modal de educação sobre uma ferramenta
  static AiFeatureInfo? getFeatureInfo(String featureKey) {
    return features[featureKey];
  }
}

class AiFeatureInfo {
  final String title;
  final String shortDescription;
  final String description;
  final String howItWorks;
  final String whatYouGet;
  final int creditsUsed;
  final String plan;
  final bool isAiGenerated;

  const AiFeatureInfo({
    required this.title,
    required this.shortDescription,
    required this.description,
    required this.howItWorks,
    required this.whatYouGet,
    required this.creditsUsed,
    required this.plan,
    required this.isAiGenerated,
  });
}
