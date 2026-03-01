import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';

class PlansScreen extends StatefulWidget {
  const PlansScreen({super.key});

  @override
  State<PlansScreen> createState() => _PlansScreenState();
}

class _PlansScreenState extends State<PlansScreen> {
  int _selectedPlan = 1;

  final List<_PlanData> _plans = [
    _PlanData(
      name: 'Starter',
      price: 'R\$ 39,90',
      period: '/mês',
      credits: '10 créditos IA/mês',
      features: [
        'Home Staging Virtual',
        'Descrições automáticas',
        'Até 20 imóveis',
        'Suporte por email',
      ],
      color: const Color(0xFF64748B),
      isPopular: false,
    ),
    _PlanData(
      name: 'Pro',
      price: 'R\$ 79,90',
      period: '/mês',
      credits: '50 créditos IA/mês',
      features: [
        'Todas as ferramentas IA',
        'Visão de Terrenos',
        'Melhorar Fotos',
        'Chat IA ilimitado',
        'Imóveis ilimitados',
        'Suporte prioritário',
      ],
      color: AppColors.primary,
      isPopular: true,
    ),
    _PlanData(
      name: 'Imobiliária',
      price: 'R\$ 199,90',
      period: '/mês',
      credits: '200 créditos IA/mês',
      features: [
        'Tudo do Pro',
        'Múltiplos corretores',
        'Dashboard analytics',
        'API de integração',
        'Marca própria',
        'Suporte dedicado 24/7',
      ],
      color: const Color(0xFF7C3AED),
      isPopular: false,
    ),
  ];

  bool _isSubscribing = false;

  Future<void> _handleSubscribe() async {
    final plan = _plans[_selectedPlan];
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Container(
          padding: EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Theme.of(context).dividerColor,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 24),
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: plan.color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Icon(Iconsax.crown_1, size: 32, color: plan.color),
              ),
              const SizedBox(height: 16),
              Text(
                'Assinar ${plan.name}',
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
              ),
              SizedBox(height: 8),
              Text(
                '${plan.price}${plan.period}',
                style: TextStyle(fontSize: 18, color: plan.color, fontWeight: FontWeight.w600),
              ),
              SizedBox(height: 16),
              Text(
                'Você será redirecionado para o checkout seguro do Stripe para finalizar sua assinatura.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary, fontSize: 14),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: _isSubscribing
                      ? null
                      : () async {
                          setSheetState(() => _isSubscribing = true);
                          try {
                            final apiClient = ApiClient();
                            final planKey = _selectedPlan == 0
                                ? 'starter'
                                : _selectedPlan == 1
                                    ? 'pro'
                                    : 'agency';
                            final response = await apiClient.post(
                              ApiConstants.stripeCheckout,
                              data: {'plan': planKey},
                            );
                            final body = response.data;
                            String? checkoutUrl;
                            if (body is Map) {
                              checkoutUrl = body['data']?['url'] ?? body['url'];
                            }
                            if (checkoutUrl != null) {
                              Navigator.pop(ctx);
                              final uri = Uri.parse(checkoutUrl);
                              if (await canLaunchUrl(uri)) {
                                await launchUrl(uri, mode: LaunchMode.externalApplication);
                              }
                            } else {
                              Navigator.pop(ctx);
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: const Text('Erro ao iniciar checkout. Tente novamente.'),
                                    backgroundColor: AppColors.error,
                                    behavior: SnackBarBehavior.floating,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                );
                              }
                            }
                          } catch (e) {
                            Navigator.pop(ctx);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Erro: ${e.toString()}'),
                                  backgroundColor: AppColors.error,
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                              );
                            }
                          } finally {
                            _isSubscribing = false;
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: plan.color,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: _isSubscribing
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2.5,
                          ),
                        )
                      : const Text(
                          'Confirmar Assinatura',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                        ),
                ),
              ),
              SizedBox(height: 8),
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: Text('Cancelar', style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Container(
            padding: EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8),
              ],
            ),
            child: Icon(Iconsax.arrow_left, size: 20, color: Theme.of(context).textTheme.bodyLarge?.color ?? AppColors.textPrimary),
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Planos',
          style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color ?? AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.w700),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(20),
              physics: BouncingScrollPhysics(),
              children: [
                Center(
                  child: Column(
                    children: [
                      Text(
                        'Escolha o plano ideal',
                        style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: Theme.of(context).textTheme.bodyLarge?.color ?? AppColors.textPrimary),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Potencialize suas vendas com IA',
                        style: TextStyle(fontSize: 15, color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary),
                      ),
                    ],
                  ),
                ).animate().fadeIn(duration: 500.ms),
                SizedBox(height: 24),
                ...List.generate(_plans.length, (index) {
                  final plan = _plans[index];
                  final isSelected = _selectedPlan == index;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedPlan = index),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      margin: const EdgeInsets.only(bottom: 14),
                      padding: EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Theme.of(context).cardColor,
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(
                          color: isSelected ? plan.color : Colors.transparent,
                          width: 2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: isSelected
                                ? plan.color.withValues(alpha: 0.15)
                                : Colors.black.withValues(alpha: 0.04),
                            blurRadius: isSelected ? 20 : 12,
                            offset: Offset(0, isSelected ? 8 : 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: plan.color.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: Icon(
                                  index == 0 ? Iconsax.star : index == 1 ? Iconsax.crown_1 : Iconsax.building_4,
                                  color: plan.color,
                                  size: 22,
                                ),
                              ),
                              SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      plan.name,
                                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                                    ),
                                    Text(
                                      plan.credits,
                                      style: TextStyle(fontSize: 13, color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary),
                                    ),
                                  ],
                                ),
                              ),
                              if (plan.isPopular)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    gradient: AppColors.primaryGradient,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Text(
                                    'Popular',
                                    style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                                  ),
                                ),
                              if (isSelected)
                                Icon(Iconsax.tick_circle, color: plan.color, size: 24),
                            ],
                          ),
                          SizedBox(height: 14),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                plan.price,
                                style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: plan.color),
                              ),
                              Text(plan.period, style: TextStyle(fontSize: 14, color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary)),
                            ],
                          ),
                          SizedBox(height: 14),
                          Divider(color: Theme.of(context).dividerColor),
                          const SizedBox(height: 10),
                          ...plan.features.map((feature) => Padding(
                                padding: const EdgeInsets.only(bottom: 6),
                                child: Row(
                                  children: [
                                    Icon(Iconsax.tick_circle, color: plan.color, size: 16),
                                    const SizedBox(width: 8),
                                    Text(feature, style: const TextStyle(fontSize: 13)),
                                  ],
                                ),
                              )),
                        ],
                      ),
                    ),
                  ).animate().fadeIn(delay: Duration(milliseconds: 200 + index * 150), duration: 500.ms).slideY(begin: 0.1);
                }),
              ],
            ),
          ),

          // Fixed Subscribe Button
          Container(
            padding: EdgeInsets.fromLTRB(20, 12, 20, 24),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -4)),
              ],
            ),
            child: SafeArea(
              top: false,
              child: GestureDetector(
                onTap: _handleSubscribe,
                child: Container(
                  width: double.infinity,
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        _plans[_selectedPlan].color,
                        _plans[_selectedPlan].color.withValues(alpha: 0.8),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: _plans[_selectedPlan].color.withValues(alpha: 0.3),
                        blurRadius: 12,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      'Assinar ${_plans[_selectedPlan].name} - ${_plans[_selectedPlan].price}/mês',
                      style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
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
