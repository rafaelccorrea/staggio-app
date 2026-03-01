import 'package:video_player/video_player.dart';
import 'dart:developer' as dev;

class VideoCacheService {
  static final VideoCacheService _instance = VideoCacheService._internal();
  static final Map<String, VideoPlayerController> _cache = {};
  static final Map<String, Future<void>> _initFutures = {};
  static bool _isPreloading = false;

  factory VideoCacheService() {
    return _instance;
  }

  VideoCacheService._internal();

  /// Get or create a cached video controller
  /// The controller may or may not be initialized yet
  static VideoPlayerController getController(String url) {
    if (_cache.containsKey(url)) {
      final cached = _cache[url]!;
      if (_isDisposed(cached)) {
        dev.log('[VIDEO_CACHE] Controller descartado, recriando: $url', name: 'VideoCacheService');
        _cache.remove(url);
        _initFutures.remove(url);
      } else {
        dev.log('[VIDEO_CACHE] Usando vídeo em cache: $url', name: 'VideoCacheService');
        return cached;
      }
    }

    dev.log('[VIDEO_CACHE] Criando novo controller para: $url', name: 'VideoCacheService');
    final controller = VideoPlayerController.networkUrl(Uri.parse(url));
    _cache[url] = controller;
    // Do NOT call initialize here - let the caller handle it
    return controller;
  }

  /// Get the initialization future for a controller
  static Future<void> ensureInitialized(String url) async {
    if (_initFutures.containsKey(url)) {
      await _initFutures[url];
      return;
    }

    final controller = getController(url);
    if (controller.value.isInitialized) {
      dev.log('[VIDEO_CACHE] Already initialized: $url', name: 'VideoCacheService');
      return;
    }

    final future = _doInitialize(url, controller);
    _initFutures[url] = future;
    await future;
  }

  static Future<void> _doInitialize(String url, VideoPlayerController controller) async {
    try {
      controller.setVolume(0.0);
      await controller.initialize().timeout(
        const Duration(seconds: 15),
        onTimeout: () {
          dev.log('[VIDEO_CACHE] Timeout initializing: $url', name: 'VideoCacheService');
        },
      );
      if (controller.value.isInitialized) {
        controller.setLooping(true);
        controller.setVolume(0.0);
        dev.log('[VIDEO_CACHE] Initialized successfully: $url', name: 'VideoCacheService');
      }
    } catch (e) {
      dev.log('[VIDEO_CACHE] Error initializing $url: $e', name: 'VideoCacheService');
    }
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
        await ensureInitialized(url);
      }
    } finally {
      _isPreloading = false;
      dev.log('[VIDEO_CACHE] Pré-carregamento concluído', name: 'VideoCacheService');
    }
  }

  /// Check if a video is cached and initialized
  static bool isReady(String url) {
    if (!_cache.containsKey(url)) return false;
    final controller = _cache[url]!;
    return !_isDisposed(controller) && controller.value.isInitialized;
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
    _initFutures.clear();
  }

  /// Clear a specific video from cache
  static Future<void> clearVideo(String url) async {
    if (_cache.containsKey(url)) {
      await _cache[url]!.dispose();
      _cache.remove(url);
      _initFutures.remove(url);
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
