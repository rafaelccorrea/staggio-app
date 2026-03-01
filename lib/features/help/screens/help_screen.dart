import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F7FF),
      appBar: AppBar(
        title: const Text('Suporte'),
        leading: IconButton(
          icon: const Icon(Iconsax.arrow_left),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Column(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: const Icon(Iconsax.message_question, color: Colors.white, size: 28),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Como podemos ajudar?',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Estamos aqui para ajudar você',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.85),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.1),

          const SizedBox(height: 24),

          // FAQ Section
          Text(
            'PERGUNTAS FREQUENTES',
            style: TextStyle(
              color: AppColors.textTertiary,
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2,
            ),
          ).animate().fadeIn(delay: 200.ms),

          const SizedBox(height: 12),

          _buildFAQItem(
            context,
            'Como funciona o Home Staging Virtual?',
            'Tire uma foto do imóvel vazio e nossa IA irá gerar uma versão decorada e mobiliada do ambiente. Basta selecionar o estilo desejado e aguardar a geração.',
          ).animate().fadeIn(delay: 300.ms, duration: 500.ms),

          _buildFAQItem(
            context,
            'Quantos créditos de IA eu tenho?',
            'Depende do seu plano: Starter (10/mês), Pro (50/mês), Imobiliária (ilimitado). Cada geração de IA consome 1 crédito.',
          ).animate().fadeIn(delay: 400.ms, duration: 500.ms),

          _buildFAQItem(
            context,
            'Como cancelar minha assinatura?',
            'Vá em Perfil > Meu Plano > Gerenciar Assinatura. Você pode cancelar a qualquer momento e terá acesso até o fim do período pago.',
          ).animate().fadeIn(delay: 500.ms, duration: 500.ms),

          _buildFAQItem(
            context,
            'Posso usar as imagens geradas comercialmente?',
            'Sim! Todas as imagens geradas pelo Staggio são de uso livre para fins comerciais, incluindo anúncios e materiais de marketing.',
          ).animate().fadeIn(delay: 600.ms, duration: 500.ms),

          const SizedBox(height: 24),

          // Contact Section
          Text(
            'CONTATO',
            style: TextStyle(
              color: AppColors.textTertiary,
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2,
            ),
          ).animate().fadeIn(delay: 700.ms),

          const SizedBox(height: 12),

          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                _buildContactTile(
                  icon: Iconsax.sms,
                  title: 'Email',
                  subtitle: 'suporte@staggio.app',
                  onTap: () async {
                    final uri = Uri.parse('mailto:suporte@staggio.app');
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri);
                    }
                  },
                ),
                Divider(height: 1, indent: 72, color: AppColors.surfaceVariant),
                _buildContactTile(
                  icon: Iconsax.message_text,
                  title: 'WhatsApp',
                  subtitle: 'Fale conosco',
                  onTap: () async {
                    final uri = Uri.parse('https://wa.me/5511999999999?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20Staggio');
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    }
                  },
                ),
                Divider(height: 1, indent: 72, color: AppColors.surfaceVariant),
                _buildContactTile(
                  icon: Iconsax.instagram,
                  title: 'Instagram',
                  subtitle: '@staggio.app',
                  onTap: () async {
                    final uri = Uri.parse('https://instagram.com/staggio.app');
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    }
                  },
                ),
              ],
            ),
          ).animate().fadeIn(delay: 800.ms, duration: 500.ms),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildFAQItem(BuildContext context, String question, String answer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ExpansionTile(
        tilePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
        childrenPadding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        collapsedShape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          question,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        children: [
          Text(
            answer,
            style: TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      leading: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Icon(icon, color: AppColors.primary, size: 22),
      ),
      title: Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
      subtitle: Text(subtitle, style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
      trailing: Icon(Iconsax.arrow_right_3, size: 18, color: AppColors.textTertiary),
    );
  }
}
