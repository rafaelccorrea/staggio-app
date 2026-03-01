import 'package:video_player/video_player.dart';
import 'dart:developer' as dev;

class VideoCacheService {
  static final VideoCacheService _instance = VideoCacheService._internal();
  static final Map<String, VideoPlayerController> _cache = {};
  static bool _isPreloading = false;

  factory VideoCacheService() {
    return _instance;
  }

  VideoCacheService._internal();

  /// Get or create a cached video controller
  static VideoPlayerController getController(String url) {
    if (_cache.containsKey(url)) {
      final cached = _cache[url]!;
      // Se o controller foi descartado externamente, recria
      if (_isDisposed(cached)) {
        dev.log('[VIDEO_CACHE] Controller descartado, recriando: $url', name: 'VideoCacheService');
        _cache.remove(url);
      } else {
        dev.log('[VIDEO_CACHE] Usando vídeo em cache: $url', name: 'VideoCacheService');
        return cached;
      }
    }

    dev.log('[VIDEO_CACHE] Criando novo controller para: $url', name: 'VideoCacheService');
    final controller = VideoPlayerController.networkUrl(Uri.parse(url));
    controller.initialize().then((_) {
      controller.setLooping(true);
    });
    _cache[url] = controller;
    return controller;
  }

  /// Verifica se um controller foi descartado
  static bool _isDisposed(VideoPlayerController controller) {
    try {
      controller.value;
      return false;
    } catch (_) {
      return true;
    }
  }

  /// Pre-load videos in background
  static Future<void> preloadVideos(List<String> videoUrls) async {
    if (_isPreloading) {
      dev.log('[VIDEO_CACHE] Pré-carregamento já em progresso', name: 'VideoCacheService');
      return;
    }

    _isPreloading = true;
    dev.log('[VIDEO_CACHE] Iniciando pré-carregamento de ${videoUrls.length} vídeos', name: 'VideoCacheService');

    try {
      for (final url in videoUrls) {
        if (_cache.containsKey(url)) {
          dev.log('[VIDEO_CACHE] Vídeo já em cache: $url', name: 'VideoCacheService');
          continue;
        }

        try {
          final controller = VideoPlayerController.networkUrl(Uri.parse(url));
          await controller.initialize();
          controller.setLooping(true);
          _cache[url] = controller;
          dev.log('[VIDEO_CACHE] Vídeo pré-carregado: $url', name: 'VideoCacheService');
        } catch (e) {
          dev.log('[VIDEO_CACHE] Erro ao pré-carregar $url: $e', name: 'VideoCacheService', error: e);
        }
      }
    } finally {
      _isPreloading = false;
      dev.log('[VIDEO_CACHE] Pré-carregamento concluído', name: 'VideoCacheService');
    }
  }

  /// Check if a video is cached
  static bool isCached(String url) {
    return _cache.containsKey(url);
  }

  /// Clear all cached videos
  static Future<void> clearCache() async {
    dev.log('[VIDEO_CACHE] Limpando cache de vídeos', name: 'VideoCacheService');
    for (final controller in _cache.values) {
      await controller.dispose();
    }
    _cache.clear();
  }

  /// Clear a specific video from cache
  static Future<void> clearVideo(String url) async {
    if (_cache.containsKey(url)) {
      await _cache[url]!.dispose();
      _cache.remove(url);
      dev.log('[VIDEO_CACHE] Vídeo removido do cache: $url', name: 'VideoCacheService');
    }
  }

  /// Get cache size (number of cached videos)
  static int getCacheSize() {
    return _cache.length;
  }

  /// Check if preloading is in progress
  static bool isPreloading() {
    return _isPreloading;
  }
}
