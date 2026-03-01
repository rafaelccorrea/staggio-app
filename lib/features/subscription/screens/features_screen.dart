import 'package:flutter/material.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/user_model.dart';
typedef User = UserModel;

class FeaturesScreen extends StatelessWidget {
  final User user;

  const FeaturesScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Recursos do Seu Plano'),
        leading: IconButton(
          icon: const Icon(Iconsax.arrow_left),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _buildPlanHeader(),
          const SizedBox(height: 32),
          _buildFeatureSection(
            'Ferramentas IA',
            _getAIFeatures(),
          ),
          const SizedBox(height: 24),
          _buildFeatureSection(
            'Limites e Quotas',
            _getLimitsFeatures(),
          ),
          const SizedBox(height: 24),
          _buildFeatureSection(
            'Suporte',
            _getSupportFeatures(),
          ),
          const SizedBox(height: 24),
          _buildFeatureSection(
            'Integrações',
            _getIntegrationFeatures(),
          ),
          const SizedBox(height: 32),
          _buildCreditsInfo(context),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildPlanHeader() {
    final planName = _getPlanName();
    final planColor = _getPlanColor();

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            planColor.withValues(alpha: 0.2),
            planColor.withValues(alpha: 0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: planColor.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: planColor.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              planName,
              style: TextStyle(
                color: planColor,
                fontWeight: FontWeight.w600,
                fontSize: 12,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Plano $planName',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: 8),
          Text(
            _getPlanDescription(),
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureSection(String title, List<_Feature> features) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        ...features.map((feature) => _buildFeatureItem(feature)),
      ],
    );
  }

  Widget _buildFeatureItem(_Feature feature) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: feature.available
                  ? AppColors.success.withValues(alpha: 0.2)
                  : AppColors.textTertiary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Icon(
              feature.available ? Iconsax.tick_circle : Iconsax.close_circle,
              size: 14,
              color: feature.available ? AppColors.success : AppColors.textTertiary,
            ),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  feature.name,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: feature.available ? AppColors.textPrimary : AppColors.textTertiary,
                  ),
                ),
                if (feature.description != null)
                  Padding(
                    padding: EdgeInsets.only(top: 4),
                    child: Text(
                      feature.description!,
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCreditsInfo(BuildContext context) {
    final totalCredits = user.aiCreditsLimit + user.bonusCredits;
    final usedCredits = user.aiCreditsUsed;
    final availableCredits = totalCredits - usedCredits;

    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Créditos IA',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          _buildCreditRow('Créditos mensais', user.aiCreditsLimit.toString()),
          _buildCreditRow('Créditos bônus', user.bonusCredits.toString()),
          _buildCreditRow('Créditos usados', usedCredits.toString()),
          const Divider(height: 16),
          _buildCreditRow(
            'Créditos disponíveis',
            availableCredits.toString(),
            highlight: true,
          ),
        ],
      ),
    );
  }

  Widget _buildCreditRow(String label, String value, {bool highlight = false}) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: highlight ? FontWeight.w700 : FontWeight.w500,
              color: highlight ? AppColors.primary : AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  String _getPlanName() {
    if (user.aiCreditsLimit >= 200) return 'Imobiliária';
    if (user.aiCreditsLimit >= 50) return 'Pro';
    return 'Starter';
  }

  Color _getPlanColor() {
    if (user.aiCreditsLimit >= 200) return const Color(0xFF7C3AED);
    if (user.aiCreditsLimit >= 50) return AppColors.primary;
    return const Color(0xFF64748B);
  }

  String _getPlanDescription() {
    if (user.aiCreditsLimit >= 200) {
      return 'Plano completo para imobiliárias com múltiplos corretores';
    }
    if (user.aiCreditsLimit >= 50) {
      return 'Plano profissional com todas as ferramentas IA';
    }
    return 'Plano básico para começar';
  }

  List<_Feature> _getAIFeatures() {
    final isPro = user.aiCreditsLimit >= 50;
    final isAgency = user.aiCreditsLimit >= 200;

    return [
      _Feature(
        name: 'Home Staging Virtual',
        description: 'Transforma ambientes vazios em decorados (2 créditos)',
        available: true,
      ),
      _Feature(
        name: 'Visão de Terrenos',
        description: 'Visualiza construções em terrenos vazios (3 créditos)',
        available: isPro,
      ),
      _Feature(
        name: 'Melhorar Fotos',
        description: 'Análise e sugestões de melhoria (1 crédito)',
        available: isPro,
      ),
      _Feature(
        name: 'Descrições Automáticas',
        description: 'Gera textos profissionais para anúncios (1 crédito)',
        available: true,
      ),
      _Feature(
        name: 'Chat IA',
        description: 'Assistente inteligente para corretores (1 crédito)',
        available: isPro,
      ),
      _Feature(
        name: 'Geração de Vídeos',
        description: 'Cria vídeos de 30s com narração (1 crédito)',
        available: isAgency,
      ),
    ];
  }

  List<_Feature> _getLimitsFeatures() {
    final isPro = user.aiCreditsLimit >= 50;

    return [
      _Feature(
        name: 'Créditos IA/mês',
        description: '${user.aiCreditsLimit} créditos',
        available: true,
      ),
      _Feature(
        name: 'Imóveis',
        description: isPro ? 'Ilimitados' : 'Até 20',
        available: true,
      ),
      _Feature(
        name: 'Compra de créditos avulsos',
        description: 'Créditos extras sem afetar assinatura',
        available: true,
      ),
    ];
  }

  List<_Feature> _getSupportFeatures() {
    final isPro = user.aiCreditsLimit >= 50;
    final isAgency = user.aiCreditsLimit >= 200;

    return [
      _Feature(
        name: 'Suporte por email',
        available: true,
      ),
      _Feature(
        name: 'Suporte prioritário',
        available: isPro,
      ),
      _Feature(
        name: 'Suporte dedicado 24/7',
        available: isAgency,
      ),
    ];
  }

  List<_Feature> _getIntegrationFeatures() {
    final isAgency = user.aiCreditsLimit >= 200;

    return [
      _Feature(
        name: 'API de integração',
        available: isAgency,
      ),
      _Feature(
        name: 'Marca própria',
        available: isAgency,
      ),
      _Feature(
        name: 'Dashboard analytics',
        available: isAgency,
      ),
      _Feature(
        name: 'Múltiplos corretores',
        available: isAgency,
      ),
    ];
  }
}

class _Feature {
  final String name;
  final String? description;
  final bool available;

  _Feature({
    required this.name,
    this.description,
    required this.available,
  });
}
