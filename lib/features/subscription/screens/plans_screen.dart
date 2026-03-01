import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/enums/plan_type.dart';
import '../../auth/bloc/auth_bloc.dart';
import '../../auth/bloc/auth_state.dart';
import '../../auth/screens/login_screen.dart';

class PlansScreen extends StatefulWidget {
  const PlansScreen({super.key});

  @override
  State<PlansScreen> createState() => _PlansScreenState();
}

class _PlansScreenState extends State<PlansScreen> {
  int _selectedPlan = 1;
  bool _isSubscribing = false;
  bool _isLoadingPortal = false;

  final List<_PlanData> _plans = [
    _PlanData(
      name: 'Starter',
      planType: PlanType.starter,
      price: 'R\$ 39,90',
      period: '/mês',
      credits: '50 créditos IA/mês',
      features: [
        'Home Staging Virtual',
        'Descrições automáticas',
        'Melhoria de Fotos',
        '50 créditos/mês',
        'Suporte por email',
      ],
      color: const Color(0xFF64748B),
      isPopular: false,
    ),
    _PlanData(
      name: 'Pro',
      planType: PlanType.pro,
      price: 'R\$ 79,90',
      period: '/mês',
      credits: '200 créditos IA/mês',
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
      planType: PlanType.agency,
      price: 'R\$ 199,90',
      period: '/mês',
      credits: '500 créditos IA/mês',
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

  /// Get the user's current plan type
  PlanType get _userPlan {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      return authState.user.plan;
    }
    return PlanType.free;
  }

  /// Determine the action type for the selected plan
  _PlanAction _getActionForPlan(int index) {
    final selectedPlanType = _plans[index].planType;
    final currentPlan = _userPlan;

    if (selectedPlanType == currentPlan) {
      return _PlanAction.current;
    } else if (selectedPlanType.isHigherThan(currentPlan)) {
      return _PlanAction.upgrade;
    } else {
      return _PlanAction.downgrade;
    }
  }

  /// Get button text based on action
  String _getButtonText(int index) {
    final plan = _plans[index];
    switch (_getActionForPlan(index)) {
      case _PlanAction.current:
        return 'Plano Atual';
      case _PlanAction.upgrade:
        return 'Upgrade para ${plan.name} - ${plan.price}/mês';
      case _PlanAction.downgrade:
        return 'Downgrade para ${plan.name} - ${plan.price}/mês';
    }
  }

  /// Get button color based on action
  Color _getButtonColor(int index) {
    switch (_getActionForPlan(index)) {
      case _PlanAction.current:
        return Colors.grey;
      case _PlanAction.upgrade:
        return _plans[index].color;
      case _PlanAction.downgrade:
        return const Color(0xFFFF9800);
    }
  }

  Future<void> _openStripePortal() async {
    setState(() => _isLoadingPortal = true);
    try {
      final apiClient = ApiClient();
      final response = await apiClient.post(ApiConstants.stripePortal);
      final body = response.data;
      String? portalUrl;
      if (body is Map) {
        portalUrl = body['data']?['url'] ?? body['url'];
      }
      if (portalUrl != null) {
        final uri = Uri.parse(portalUrl);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Erro ao abrir portal de gestão.'),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        }
      }
    } catch (e) {
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
      if (mounted) setState(() => _isLoadingPortal = false);
    }
  }

  Future<void> _handleSubscribe() async {
    // Check if user is authenticated
    final authState = context.read<AuthBloc>().state;
    if (authState is! AuthAuthenticated) {
      _showLoginRequiredDialog();
      return;
    }

    final action = _getActionForPlan(_selectedPlan);

    // Block if it's the current plan
    if (action == _PlanAction.current) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Você já está neste plano!'),
          backgroundColor: AppColors.warning,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      return;
    }

    // For downgrade, redirect to Stripe portal
    if (action == _PlanAction.downgrade) {
      _showDowngradeDialog();
      return;
    }

    // For upgrade, show confirmation bottom sheet
    _showUpgradeSheet();
  }

  void _showLoginRequiredDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: Theme.of(context).cardColor,
        title: const Text('Login Necessário'),
        content: const Text('Você precisa fazer login para assinar um plano.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancelar', style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.of(context).popUntil((route) => route.isFirst);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => LoginScreen(
                    onRegisterTap: () => Navigator.pop(context),
                  ),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Fazer Login'),
          ),
        ],
      ),
    );
  }

  void _showDowngradeDialog() {
    final plan = _plans[_selectedPlan];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: Theme.of(context).cardColor,
        title: Row(
          children: [
            Icon(Iconsax.warning_2, color: AppColors.warning, size: 24),
            const SizedBox(width: 10),
            const Expanded(child: Text('Downgrade de Plano')),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Você está prestes a fazer downgrade para o plano ${plan.name}.',
              style: TextStyle(
                fontSize: 14,
                color: Theme.of(context).textTheme.bodyMedium?.color,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.warning.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Atenção:',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      color: AppColors.warning,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '• Seus créditos serão reduzidos\n• Algumas funcionalidades podem ser limitadas\n• A mudança será efetiva no próximo ciclo de cobrança',
                    style: TextStyle(
                      fontSize: 12,
                      color: Theme.of(context).textTheme.bodyMedium?.color,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Você será redirecionado ao portal de gestão da assinatura para fazer a alteração.',
              style: TextStyle(
                fontSize: 13,
                color: Theme.of(context).textTheme.bodySmall?.color,
                height: 1.4,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancelar', style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              _openStripePortal();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.warning,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: _isLoadingPortal
                ? const SizedBox(
                    width: 20, height: 20,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                  )
                : const Text('Continuar'),
          ),
        ],
      ),
    );
  }

  void _showUpgradeSheet() {
    final plan = _plans[_selectedPlan];
    final currentPlan = _userPlan;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      backgroundColor: Theme.of(context).cardColor,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Container(
          padding: const EdgeInsets.all(24),
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
                child: Icon(Iconsax.arrow_up_3, size: 32, color: plan.color),
              ),
              const SizedBox(height: 16),
              Text(
                'Upgrade para ${plan.name}',
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              Text(
                '${plan.price}${plan.period}',
                style: TextStyle(fontSize: 18, color: plan.color, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 12),
              // Show what they gain
              if (currentPlan != PlanType.free) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Icon(Iconsax.arrow_up_3, color: AppColors.success, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'De ${currentPlan.displayName} (${currentPlan.monthlyCreditsLimit} créditos) → ${plan.name} (${plan.planType.monthlyCreditsLimit} créditos)',
                          style: TextStyle(fontSize: 13, color: AppColors.success, fontWeight: FontWeight.w500),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
              ],
              Text(
                'Você será redirecionado para o checkout seguro do Stripe para finalizar sua assinatura.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color, fontSize: 14),
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
                            final planKey = plan.planType.value;
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
                          'Confirmar Upgrade',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                        ),
                ),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: Text('Cancelar', style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, authState) {
        final user = authState is AuthAuthenticated ? authState.user : null;

        // Se não está autenticado, mostrar tela de login
        if (user == null || user.isGuest) {
          return _buildLoginRequired(context);
        }

        final currentPlan = user.plan;

        return Scaffold(
          backgroundColor: Theme.of(context).scaffoldBackgroundColor,
          appBar: AppBar(
            backgroundColor: Colors.transparent,
            elevation: 0,
            leading: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(8),
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
                  physics: const BouncingScrollPhysics(),
                  children: [
                    Center(
                      child: Column(
                        children: [
                          Text(
                            'Escolha o plano ideal',
                            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: Theme.of(context).textTheme.bodyLarge?.color ?? AppColors.textPrimary),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Potencialize suas vendas com IA',
                            style: TextStyle(fontSize: 15, color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary),
                          ),
                          // Current plan badge
                          if (currentPlan != PlanType.free) ...[
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Iconsax.crown_1, size: 16, color: AppColors.primary),
                                  const SizedBox(width: 6),
                                  Text(
                                    'Plano atual: ${currentPlan.displayName}',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ).animate().fadeIn(duration: 500.ms),
                    const SizedBox(height: 24),
                    ...List.generate(_plans.length, (index) {
                      final plan = _plans[index];
                      final isSelected = _selectedPlan == index;
                      final isCurrent = plan.planType == currentPlan;
                      final action = _getActionForPlan(index);

                      return GestureDetector(
                        onTap: () => setState(() => _selectedPlan = index),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          margin: const EdgeInsets.only(bottom: 14),
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Theme.of(context).cardColor,
                            borderRadius: BorderRadius.circular(22),
                            border: Border.all(
                              color: isCurrent
                                  ? AppColors.success
                                  : isSelected
                                      ? plan.color
                                      : Colors.transparent,
                              width: 2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: isCurrent
                                    ? AppColors.success.withValues(alpha: 0.12)
                                    : isSelected
                                        ? plan.color.withValues(alpha: 0.15)
                                        : Colors.black.withValues(alpha: 0.04),
                                blurRadius: isSelected || isCurrent ? 20 : 12,
                                offset: Offset(0, isSelected || isCurrent ? 8 : 4),
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
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          plan.name,
                                          style: TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.adaptiveTextPrimary(context),
                                          ),
                                        ),
                                        Text(
                                          plan.credits,
                                          style: TextStyle(fontSize: 13, color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary),
                                        ),
                                      ],
                                    ),
                                  ),
                                  // Badges
                                  if (isCurrent)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: AppColors.success,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Text(
                                        'Atual',
                                        style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                                      ),
                                    )
                                  else if (plan.isPopular)
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
                                  if (isSelected && !isCurrent) ...[
                                    const SizedBox(width: 8),
                                    Icon(Iconsax.tick_circle, color: plan.color, size: 24),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 14),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    plan.price,
                                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: plan.color),
                                  ),
                                  Text(plan.period, style: TextStyle(fontSize: 14, color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary)),
                                  const Spacer(),
                                  // Upgrade/Downgrade indicator
                                  if (!isCurrent)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: action == _PlanAction.upgrade
                                            ? AppColors.success.withValues(alpha: 0.1)
                                            : AppColors.warning.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(
                                            action == _PlanAction.upgrade ? Iconsax.arrow_up_3 : Iconsax.arrow_down,
                                            size: 14,
                                            color: action == _PlanAction.upgrade ? AppColors.success : AppColors.warning,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            action == _PlanAction.upgrade ? 'Upgrade' : 'Downgrade',
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w600,
                                              color: action == _PlanAction.upgrade ? AppColors.success : AppColors.warning,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 14),
                              Divider(color: Theme.of(context).dividerColor),
                              const SizedBox(height: 10),
                              ...plan.features.map((feature) => Padding(
                                    padding: const EdgeInsets.only(bottom: 6),
                                    child: Row(
                                      children: [
                                        Icon(Iconsax.tick_circle, color: plan.color, size: 16),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            feature,
                                            style: TextStyle(
                                              fontSize: 13,
                                              color: AppColors.adaptiveTextSecondary(context),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  )),
                            ],
                          ),
                        ),
                      ).animate().fadeIn(delay: Duration(milliseconds: 200 + index * 150), duration: 500.ms).slideY(begin: 0.1);
                    }),

                    // Manage subscription button (only for paid plans)
                    if (currentPlan != PlanType.free) ...[
                      const SizedBox(height: 8),
                      Center(
                        child: TextButton.icon(
                          onPressed: _isLoadingPortal ? null : _openStripePortal,
                          icon: _isLoadingPortal
                              ? SizedBox(
                                  width: 16, height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Theme.of(context).textTheme.bodyMedium?.color,
                                  ),
                                )
                              : Icon(Iconsax.setting_2, size: 18, color: Theme.of(context).textTheme.bodyMedium?.color),
                          label: Text(
                            'Gerenciar assinatura',
                            style: TextStyle(
                              fontSize: 14,
                              color: Theme.of(context).textTheme.bodyMedium?.color,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),

              // Fixed Subscribe Button
              Container(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
                decoration: BoxDecoration(
                  color: Theme.of(context).cardColor,
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -4)),
                  ],
                ),
                child: SafeArea(
                  top: false,
                  child: GestureDetector(
                    onTap: _getActionForPlan(_selectedPlan) == _PlanAction.current ? null : _handleSubscribe,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: double.infinity,
                      height: 56,
                      decoration: BoxDecoration(
                        gradient: _getActionForPlan(_selectedPlan) == _PlanAction.current
                            ? null
                            : LinearGradient(
                                colors: [
                                  _getButtonColor(_selectedPlan),
                                  _getButtonColor(_selectedPlan).withValues(alpha: 0.8),
                                ],
                              ),
                        color: _getActionForPlan(_selectedPlan) == _PlanAction.current
                            ? Colors.grey.withValues(alpha: 0.3)
                            : null,
                        borderRadius: BorderRadius.circular(18),
                        boxShadow: _getActionForPlan(_selectedPlan) == _PlanAction.current
                            ? []
                            : [
                                BoxShadow(
                                  color: _getButtonColor(_selectedPlan).withValues(alpha: 0.3),
                                  blurRadius: 12,
                                  offset: const Offset(0, 6),
                                ),
                              ],
                      ),
                      child: Center(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            if (_getActionForPlan(_selectedPlan) == _PlanAction.current)
                              Icon(Iconsax.tick_circle, color: Colors.white.withValues(alpha: 0.7), size: 20)
                            else if (_getActionForPlan(_selectedPlan) == _PlanAction.upgrade)
                              const Icon(Iconsax.arrow_up_3, color: Colors.white, size: 20)
                            else
                              const Icon(Iconsax.arrow_down, color: Colors.white, size: 20),
                            const SizedBox(width: 8),
                            Flexible(
                              child: Text(
                                _getButtonText(_selectedPlan),
                                style: TextStyle(
                                  color: _getActionForPlan(_selectedPlan) == _PlanAction.current
                                      ? Colors.white.withValues(alpha: 0.5)
                                      : Colors.white,
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLoginRequired(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(Iconsax.arrow_left, size: 20, color: Theme.of(context).textTheme.bodyLarge?.color),
          ),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Iconsax.lock, size: 64, color: Theme.of(context).primaryColor),
              const SizedBox(height: 20),
              Text(
                'Faça login para assinar',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: Theme.of(context).textTheme.bodyLarge?.color,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'Você precisa estar autenticado para escolher um plano',
                style: TextStyle(
                  fontSize: 14,
                  color: Theme.of(context).textTheme.bodyMedium?.color,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 30),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.of(context).popUntil((route) => route.isFirst);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => LoginScreen(
                        onRegisterTap: () => Navigator.pop(context),
                      ),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).primaryColor,
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Fazer Login',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

enum _PlanAction { current, upgrade, downgrade }

class _PlanData {
  final String name;
  final PlanType planType;
  final String price;
  final String period;
  final String credits;
  final List<String> features;
  final Color color;
  final bool isPopular;

  _PlanData({
    required this.name,
    required this.planType,
    required this.price,
    required this.period,
    required this.credits,
    required this.features,
    required this.color,
    required this.isPopular,
  });
}
