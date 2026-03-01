import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../data/models/generation_model.dart';

class GenerationsHistoryScreen extends StatefulWidget {
  final ApiClient apiClient;

  const GenerationsHistoryScreen({super.key, required this.apiClient});

  @override
  State<GenerationsHistoryScreen> createState() => _GenerationsHistoryScreenState();
}

class _GenerationsHistoryScreenState extends State<GenerationsHistoryScreen> {
  List<GenerationModel> _generations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadGenerations();
  }

  Future<void> _loadGenerations() async {
    try {
      final response = await widget.apiClient.get('/generations');
      final List<dynamic> data = response.data is List ? response.data : [];
      setState(() {
        _generations = data.map((e) => GenerationModel.fromJson(e)).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Histórico de Gerações'),
        leading: IconButton(
          icon: const Icon(Iconsax.arrow_left),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _generations.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: Theme.of(context).dividerColor,
                          borderRadius: BorderRadius.circular(24),
                        ),
                        child: Icon(
                          Iconsax.magic_star,
                          size: 40,
                          color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary,
                        ),
                      ),
                      SizedBox(height: 16),
                      Text(
                        'Nenhuma geração ainda',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Use as ferramentas de IA para\nver seu histórico aqui',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(24),
                  itemCount: _generations.length,
                  itemBuilder: (context, index) {
                    final gen = _generations[index];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: Theme.of(context).dividerColor),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Center(
                              child: Text(
                                gen.typeIcon,
                                style: const TextStyle(fontSize: 22),
                              ),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  gen.typeDisplayName,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 15,
                                  ),
                                ),
                                Text(
                                  gen.isCompleted
                                      ? 'Concluído'
                                      : gen.isProcessing
                                          ? 'Processando...'
                                          : 'Falhou',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: gen.isCompleted
                                        ? AppColors.success
                                        : gen.isProcessing
                                            ? AppColors.warning
                                            : AppColors.error,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '${gen.creditsUsed} crédito${gen.creditsUsed > 1 ? 's' : ''}',
                            style: TextStyle(
                              fontSize: 12,
                              color: Theme.of(context).textTheme.bodySmall?.color ?? AppColors.textTertiary,
                            ),
                          ),
                        ],
                      ),
                    )
                        .animate()
                        .fadeIn(
                          delay: Duration(milliseconds: index * 80),
                          duration: 400.ms,
                        )
                        .slideX(begin: 0.05);
                  },
                ),
    );
  }
}
