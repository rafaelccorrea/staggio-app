import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';

class PlansScreen extends StatefulWidget {
  const PlansScreen({super.key});

  @override
  State<PlansScreen> createState() => _PlansScreenState();
}

class _PlansScreenState extends State<PlansScreen> {
  int _selectedPlan = 1;

  final List<_PlanData> _plans = [
    _PlanData(
      name: 'Gratuito',
      price: 'R\$ 0',
      period: '/mês',
      credits: '5 créditos IA/mês',
      features: [
        'Descrições automáticas',
        'Até 5 imóveis',
        'Assistente básico',
      ],
      color: AppColors.textSecondary,
      isPopular: false,
    ),
    _PlanData(
      name: 'Starter',
      price: 'R\$ 39,90',
      period: '/mês',
      credits: '20 créditos IA/mês',
      features: [
        'Home Staging Virtual',
        'Descrições automáticas',
        'Melhoria de fotos',
        'Até 50 imóveis',
        'Assistente IA completo',
      ],
      color: AppColors.primary,
      isPopular: true,
    ),
    _PlanData(
      name: 'Pro',
      price: 'R\$ 79,90',
      period: '/mês',
      credits: '80 créditos IA/mês',
      features: [
        'Tudo do Starter',
        'Visão de Terrenos',
        'Tours Virtuais',
        'Imóveis ilimitados',
        'Assistente IA Premium',
        'Suporte prioritário',
      ],
      color: AppColors.accent,
      isPopular: false,
    ),
    _PlanData(
      name: 'Imobiliária',
      price: 'R\$ 199,90',
      period: '/mês',
      credits: 'Créditos ilimitados',
      features: [
        'Tudo do Pro',
        'Múltiplos corretores',
        'Painel de gestão',
        'Marca própria',
        'API dedicada',
        'Suporte VIP',
      ],
      color: AppColors.secondary,
      isPopular: false,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Planos'),
        leading: IconButton(
          icon: const Icon(Iconsax.arrow_left),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Text(
              'Escolha seu plano',
              style: Theme.of(context).textTheme.headlineLarge,
            ).animate().fadeIn(duration: 500.ms),
            const SizedBox(height: 8),
            Text(
              'Desbloqueie todo o poder da IA para seus imóveis',
              style: Theme.of(context).textTheme.bodyLarge,
              textAlign: TextAlign.center,
            ).animate().fadeIn(delay: 100.ms, duration: 500.ms),
            const SizedBox(height: 32),

            ...List.generate(_plans.length, (index) {
              final plan = _plans[index];
              final isSelected = _selectedPlan == index;

              return GestureDetector(
                onTap: () => setState(() => _selectedPlan = index),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: isSelected ? plan.color : AppColors.surfaceVariant,
                      width: isSelected ? 2 : 1,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: plan.color.withValues(alpha: 0.15),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ]
                        : null,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            plan.name,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          if (plan.isPopular) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: plan.color,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                'Popular',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                          const Spacer(),
                          Radio<int>(
                            value: index,
                            groupValue: _selectedPlan,
                            onChanged: (v) => setState(() => _selectedPlan = v!),
                            activeColor: plan.color,
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            plan.price,
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.w700,
                              color: plan.color,
                            ),
                          ),
                          Text(
                            plan.period,
                            style: TextStyle(
                              fontSize: 14,
                              color: AppColors.textTertiary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        plan.credits,
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ...plan.features.map((feature) => Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: Row(
                              children: [
                                Icon(Iconsax.tick_circle,
                                    color: plan.color, size: 16),
                                const SizedBox(width: 8),
                                Text(
                                  feature,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          )),
                    ],
                  ),
                ),
              )
                  .animate()
                  .fadeIn(delay: Duration(milliseconds: 200 + index * 100), duration: 500.ms)
                  .slideY(begin: 0.1);
            }),

            const SizedBox(height: 16),

            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () {},
                child: Text(
                  _selectedPlan == 0 ? 'Plano Atual' : 'Assinar Agora',
                ),
              ),
            ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _PlanData {
  final String name;
  final String price;
  final String period;
  final String credits;
  final List<String> features;
  final Color color;
  final bool isPopular;

  _PlanData({
    required this.name,
    required this.price,
    required this.period,
    required this.credits,
    required this.features,
    required this.color,
    required this.isPopular,
  });
}
