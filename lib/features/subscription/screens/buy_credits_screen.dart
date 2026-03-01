import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';

class BuyCreditsScreen extends StatefulWidget {
  const BuyCreditsScreen({super.key});

  @override
  State<BuyCreditsScreen> createState() => _BuyCreditsScreenState();
}

class _BuyCreditsScreenState extends State<BuyCreditsScreen> {
  int _selectedPack = 1;
  bool _isPurchasing = false;

  final List<_CreditPack> _packs = [
    _CreditPack(
      key: 'pack_10',
      credits: 10,
      price: 'R\$ 14,90',
      pricePerCredit: 'R\$ 1,49/crédito',
      discount: null,
      color: const Color(0xFF64748B),
      icon: Iconsax.flash_1,
    ),
    _CreditPack(
      key: 'pack_30',
      credits: 30,
      price: 'R\$ 34,90',
      pricePerCredit: 'R\$ 1,16/crédito',
      discount: '22% off',
      color: const Color(0xFF1E88E5),
      icon: Iconsax.flash_circle,
    ),
    _CreditPack(
      key: 'pack_80',
      credits: 80,
      price: 'R\$ 69,90',
      pricePerCredit: 'R\$ 0,87/crédito',
      discount: '41% off',
      color: AppColors.primary,
      icon: Iconsax.star_1,
    ),
    _CreditPack(
      key: 'pack_200',
      credits: 200,
      price: 'R\$ 149,90',
      pricePerCredit: 'R\$ 0,75/crédito',
      discount: '50% off',
      color: const Color(0xFF7C3AED),
      icon: Iconsax.crown_1,
    ),
    _CreditPack(
      key: 'pack_500',
      credits: 500,
      price: 'R\$ 299,90',
      pricePerCredit: 'R\$ 0,60/crédito',
      discount: '60% off',
      color: const Color(0xFFE91E63),
      icon: Iconsax.diamonds,
    ),
  ];

  Future<void> _handlePurchase() async {
    final pack = _packs[_selectedPack];

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
                  color: pack.color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Icon(pack.icon, size: 32, color: pack.color),
              ),
              const SizedBox(height: 16),
              Text(
                'Comprar ${pack.credits} Créditos',
                style: const TextStyle(
                    fontSize: 22, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              Text(
                pack.price,
                style: TextStyle(
                    fontSize: 20,
                    color: pack.color,
                    fontWeight: FontWeight.w700),
              ),
              SizedBox(height: 12),
              Container(
                padding:
                    EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.info.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Iconsax.info_circle,
                        size: 18, color: AppColors.info),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Créditos bônus não expiram e não são afetados pela renovação da assinatura mensal.',
                        style: TextStyle(
                            fontSize: 12, color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: _isPurchasing
                      ? null
                      : () async {
                          setSheetState(() => _isPurchasing = true);
                          setState(() => _isPurchasing = true);
                          try {
                            final apiClient = ApiClient();
                            final response = await apiClient.post(
                              ApiConstants.stripeBuyCredits,
                              data: {'pack': pack.key},
                            );
                            final body = response.data;
                            String? checkoutUrl;
                            if (body is Map) {
                              checkoutUrl =
                                  body['data']?['url'] ?? body['url'];
                            }
                            if (checkoutUrl != null) {
                              Navigator.pop(ctx);
                              final uri = Uri.parse(checkoutUrl);
                              if (await canLaunchUrl(uri)) {
                                await launchUrl(uri,
                                    mode: LaunchMode.externalApplication);
                              }
                            } else {
                              Navigator.pop(ctx);
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: const Text(
                                        'Erro ao iniciar checkout. Tente novamente.'),
                                    backgroundColor: AppColors.error,
                                    behavior: SnackBarBehavior.floating,
                                    shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(12)),
                                  ),
                                );
                              }
                            }
                          } catch (e) {
                            Navigator.pop(ctx);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content:
                                      Text('Erro: ${e.toString()}'),
                                  backgroundColor: AppColors.error,
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(
                                      borderRadius:
                                          BorderRadius.circular(12)),
                                ),
                              );
                            }
                          } finally {
                            _isPurchasing = false;
                            if (mounted) setState(() {});
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: pack.color,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: _isPurchasing
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2.5,
                          ),
                        )
                      : const Text(
                          'Confirmar Compra',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.w700),
                        ),
                ),
              ),
              SizedBox(height: 8),
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: Text('Cancelar',
                    style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary)),
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
                BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 8),
              ],
            ),
            child: Icon(Iconsax.arrow_left,
                size: 20, color: Theme.of(context).textTheme.bodyLarge?.color ?? AppColors.textPrimary),
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Comprar Créditos',
          style: TextStyle(
              color: Theme.of(context).textTheme.bodyLarge?.color ?? AppColors.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.w700),
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
                // Header
                Center(
                  child: Column(
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF1E88E5), Color(0xFF7C3AED)],
                          ),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Icon(Iconsax.flash_circle,
                            size: 32, color: Colors.white),
                      ),
                      SizedBox(height: 16),
                      Text(
                        'Créditos Extras',
                        style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w700,
                            color: Theme.of(context).textTheme.bodyLarge?.color ?? AppColors.textPrimary),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Compre créditos avulsos sem afetar\nsua assinatura mensal',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 14, color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary),
                      ),
                    ],
                  ),
                ).animate().fadeIn(duration: 500.ms),

                const SizedBox(height: 8),

                // Info banner
                Container(
                  margin: const EdgeInsets.symmetric(vertical: 12),
                  padding:
                      EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppColors.accent.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                        color: AppColors.accent.withValues(alpha: 0.2)),
                  ),
                  child: Row(
                    children: [
                      Icon(Iconsax.info_circle,
                          size: 20, color: AppColors.accent),
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Créditos bônus nunca expiram e são usados apenas quando seus créditos mensais acabam.',
                          style: TextStyle(
                              fontSize: 13, color: Theme.of(context).textTheme.bodyMedium?.color ?? AppColors.textSecondary),
                        ),
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: 200.ms, duration: 500.ms),

                const SizedBox(height: 8),

                // Credit packs
                ...List.generate(_packs.length, (index) {
                  final pack = _packs[index];
                  final isSelected = _selectedPack == index;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedPack = index),
                    child: AnimatedContainer(
                      duration: Duration(milliseconds: 300),
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Theme.of(context).cardColor,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected
                              ? pack.color
                              : Colors.transparent,
                          width: 2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: isSelected
                                ? pack.color.withValues(alpha: 0.15)
                                : Colors.black.withValues(alpha: 0.04),
                            blurRadius: isSelected ? 16 : 10,
                            offset:
                                Offset(0, isSelected ? 6 : 3),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              color: pack.color.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Icon(pack.icon,
                                color: pack.color, size: 24),
                          ),
                          SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment:
                                  CrossAxisAlignment.start,
                              children: [
                                Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          '${pack.credits} Créditos',
                                          style: const TextStyle(
                                              fontSize: 17,
                                              fontWeight: FontWeight.w700),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      if (pack.discount != null) ...[
                                      const SizedBox(width: 8),
                                      Container(
                                        padding:
                                            const EdgeInsets.symmetric(
                                                horizontal: 8,
                                                vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppColors.success
                                              .withValues(alpha: 0.1),
                                          borderRadius:
                                              BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          pack.discount!,
                                          style: const TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.success,
                                          ),
                                        ),
                                      ),
                                    ],
                                    ],
                                ),
                                SizedBox(height: 2),
                                Text(
                                  pack.pricePerCredit,
                                  style: TextStyle(
                                      fontSize: 12,
                                      color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment:
                                CrossAxisAlignment.end,
                            children: [
                              Text(
                                pack.price,
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w800,
                                  color: isSelected
                                      ? pack.color
                                      : AppColors.textPrimary,
                                ),
                              ),
                              if (isSelected)
                                Icon(Iconsax.tick_circle,
                                    color: pack.color, size: 20),
                            ],
                          ),
                        ],
                      ),
                    ),
                  )
                      .animate()
                      .fadeIn(
                          delay: Duration(
                              milliseconds: 300 + index * 100),
                          duration: 500.ms)
                      .slideY(begin: 0.08);
                }),
              ],
            ),
          ),

          // Fixed purchase button
          Container(
            padding: EdgeInsets.fromLTRB(20, 12, 20, 24),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              boxShadow: [
                BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -4)),
              ],
            ),
            child: SafeArea(
              top: false,
              child: GestureDetector(
                onTap: _handlePurchase,
                child: Container(
                  width: double.infinity,
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        _packs[_selectedPack].color,
                        _packs[_selectedPack]
                            .color
                            .withValues(alpha: 0.8),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: _packs[_selectedPack]
                            .color
                            .withValues(alpha: 0.3),
                        blurRadius: 12,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      'Comprar ${_packs[_selectedPack].credits} Créditos - ${_packs[_selectedPack].price}',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w700),
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

class _CreditPack {
  final String key;
  final int credits;
  final String price;
  final String pricePerCredit;
  final String? discount;
  final Color color;
  final IconData icon;

  _CreditPack({
    required this.key,
    required this.credits,
    required this.price,
    required this.pricePerCredit,
    required this.discount,
    required this.color,
    required this.icon,
  });
}
