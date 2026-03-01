import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';
import 'package:shimmer/shimmer.dart';
import '../../../core/services/video_cache_service.dart';

class VideoCarousel extends StatefulWidget {
  final List<VideoItem> videos;

  const VideoCarousel({
    super.key,
    required this.videos,
  });

  @override
  State<VideoCarousel> createState() => _VideoCarouselState();
}

class VideoItem {
  final String url;
  final String title;
  final String? prompt;

  VideoItem({required this.url, required this.title, this.prompt});
}

class _VideoCarouselState extends State<VideoCarousel> {
  late PageController _pageController;
  late List<VideoPlayerController> _controllers;
  int _currentIndex = 0;
  bool _showControls = false;
  late Future<void> _initializeVideosFuture;
  bool _disposed = false;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    // Use cached controllers from VideoCacheService
    _controllers = List.generate(
      widget.videos.length,
      (index) => VideoCacheService.getController(widget.videos[index].url),
    );
    _initializeVideosFuture = _initializeVideos();
  }

  Future<void> _initializeVideos() async {
    // Initialize only the first video immediately for faster loading
    if (_controllers.isNotEmpty && !_disposed) {
      try {
        final firstController = _controllers[0];
        if (!firstController.value.isInitialized) {
          await firstController.initialize().timeout(
            const Duration(seconds: 20),
            onTimeout: () {
              debugPrint('[VIDEO_CAROUSEL] Timeout ao inicializar primeiro video');
            },
          );
          firstController.setLooping(true);
          firstController.setVolume(0.0);
        }
      } catch (e) {
        debugPrint('[VIDEO_CAROUSEL] Erro ao inicializar primeiro video: $e');
      }
    }
    if (mounted && !_disposed) {
      setState(() {
        try {
          if (_controllers.isNotEmpty &&
              _controllers[0].value.isInitialized &&
              !_controllers[0].value.isPlaying) {
            _controllers[0].play();
          }
        } catch (e) {
          debugPrint('[VIDEO_CAROUSEL] Erro ao iniciar reproducao: $e');
        }
      });
    }
    // Pre-load other videos in background
    Future.delayed(const Duration(milliseconds: 500), () {
      if (!_disposed) {
        _preloadOtherVideos();
      }
    });
  }

  Future<void> _preloadOtherVideos() async {
    for (int i = 1; i < _controllers.length; i++) {
      if (_disposed) return;
      try {
        final controller = _controllers[i];
        if (!controller.value.isInitialized) {
          await controller.initialize().timeout(
            const Duration(seconds: 12),
            onTimeout: () {
              debugPrint('[VIDEO_CAROUSEL] Timeout ao pre-carregar video $i');
            },
          );
          controller.setLooping(true);
          controller.setVolume(0.0);
        }
      } catch (e) {
        debugPrint('[VIDEO_CAROUSEL] Erro ao pre-carregar video $i: $e');
      }
    }
  }

  /// Safely check if a controller is usable (not disposed)
  bool _isControllerUsable(VideoPlayerController controller) {
    try {
      // Accessing .value will throw if disposed
      controller.value;
      return true;
    } catch (_) {
      return false;
    }
  }

  void _togglePlayPause() {
    if (_disposed) return;
    final controller = _controllers[_currentIndex];
    if (!_isControllerUsable(controller)) return;

    setState(() {
      try {
        if (controller.value.isPlaying) {
          controller.pause();
        } else {
          controller.play();
        }
      } catch (e) {
        debugPrint('[VIDEO_CAROUSEL] Erro ao alternar play/pause: $e');
      }
    });
  }

  void _toggleFullScreen() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => FullScreenVideoCarousel(
          videos: widget.videos,
          initialIndex: _currentIndex,
          controllers: _controllers,
        ),
      ),
    );
  }

  void _pauseOtherVideos(int activeIndex) {
    for (int i = 0; i < _controllers.length; i++) {
      if (i != activeIndex) {
        try {
          if (_isControllerUsable(_controllers[i]) && _controllers[i].value.isPlaying) {
            _controllers[i].pause();
          }
        } catch (_) {}
      }
    }
  }

  void _showControlsTemporarily() {
    setState(() => _showControls = true);
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted && !_disposed) {
        setState(() => _showControls = false);
      }
    });
  }

  @override
  void dispose() {
    _disposed = true;
    _pageController.dispose();
    // IMPORTANT: Do NOT dispose the video controllers here!
    // They are managed by VideoCacheService and shared across widget rebuilds.
    // Disposing them here causes "used after being disposed" errors when
    // the widget is recreated (e.g., tab switching, navigation).
    // Instead, just pause all videos when leaving.
    for (var controller in _controllers) {
      try {
        if (_isControllerUsable(controller) && controller.value.isPlaying) {
          controller.pause();
        }
      } catch (_) {}
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<void>(
      future: _initializeVideosFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.done) {
          return Column(
            children: [
              // Video Carousel
              SizedBox(
                height: 220,
                child: PageView.builder(
                  controller: _pageController,
                  onPageChanged: (index) {
                    if (_disposed) return;
                    setState(() => _currentIndex = index);
                    // Play current, pause others
                    for (int i = 0; i < _controllers.length; i++) {
                      final ctrl = _controllers[i];
                      if (!_isControllerUsable(ctrl)) continue;
                      try {
                        if (i == index) {
                          ctrl.play();
                        } else {
                          ctrl.pause();
                        }
                      } catch (_) {}
                    }
                  },
                  itemCount: widget.videos.length,
                  itemBuilder: (context, index) {
                    final controller = _controllers[index];
                    final isUsable = _isControllerUsable(controller);

                    return GestureDetector(
                      onTap: () {
                        _showControlsTemporarily();
                        _togglePlayPause();
                      },
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          color: Colors.transparent,
                        ),
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            // Video Player or placeholder
                            if (isUsable && controller.value.isInitialized)
                              ClipRRect(
                                borderRadius: BorderRadius.circular(16),
                                child: AspectRatio(
                                  aspectRatio: controller.value.aspectRatio,
                                  child: VideoPlayer(controller),
                                ),
                              )
                            else
                              ClipRRect(
                                borderRadius: BorderRadius.circular(16),
                                child: Shimmer.fromColors(
                                  baseColor: Theme.of(context).brightness == Brightness.dark
                                      ? Colors.grey[800]!
                                      : Colors.grey[300]!,
                                  highlightColor: Theme.of(context).brightness == Brightness.dark
                                      ? Colors.grey[700]!
                                      : Colors.grey[100]!,
                                  child: Container(
                                    color: Colors.white,
                                  ),
                                ),
                              ),

                            // Play/Pause Overlay (appears on tap)
                            if (_showControls && isUsable)
                              Container(
                                decoration: BoxDecoration(
                                  color: Theme.of(context).brightness == Brightness.dark
                                      ? Colors.black.withValues(alpha: 0.09)
                                      : Colors.black.withValues(alpha: 0.3),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Center(
                                  child: Container(
                                    width: 70,
                                    height: 70,
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(alpha: 0.9),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      controller.value.isPlaying
                                          ? Iconsax.pause
                                          : Iconsax.play,
                                      color: Colors.black,
                                      size: 32,
                                    ),
                                  ),
                                ),
                              ),

                            // Fullscreen button (appears on tap)
                            if (_showControls)
                              Positioned(
                                top: 12,
                                right: 12,
                                child: GestureDetector(
                                  onTap: _toggleFullScreen,
                                  child: Container(
                                    width: 44,
                                    height: 44,
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(alpha: 0.9),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Iconsax.maximize_4,
                                      color: Colors.black,
                                      size: 20,
                                    ),
                                  ),
                                ),
                              ),

                            // Video Title and Prompt Button (always visible)
                            Positioned(
                              bottom: 0,
                              left: 0,
                              right: 0,
                              child: Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [
                                      Colors.transparent,
                                      Colors.black.withValues(alpha: 0.85),
                                    ],
                                  ),
                                  borderRadius: const BorderRadius.only(
                                    bottomLeft: Radius.circular(16),
                                    bottomRight: Radius.circular(16),
                                  ),
                                ),
                                padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            widget.videos[index].title,
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 14,
                                              fontWeight: FontWeight.w600,
                                            ),
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        if (widget.videos[index].prompt != null)
                                          GestureDetector(
                                            onTap: () {
                                              showModalBottomSheet(
                                                context: context,
                                                builder: (_) => Container(
                                                  padding: const EdgeInsets.all(16),
                                                  child: Column(
                                                    mainAxisSize: MainAxisSize.min,
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                      const Text(
                                                        'IA Prompt',
                                                        style: TextStyle(
                                                          fontSize: 18,
                                                          fontWeight: FontWeight.bold,
                                                        ),
                                                      ),
                                                      const SizedBox(height: 12),
                                                      Text(
                                                        widget.videos[index].prompt!,
                                                        style: const TextStyle(
                                                          fontSize: 14,
                                                          height: 1.5,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              );
                                            },
                                            child: Container(
                                              padding: const EdgeInsets.all(6),
                                              decoration: BoxDecoration(
                                                color: Colors.white.withValues(alpha: 0.2),
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: const Icon(
                                                Iconsax.code,
                                                color: Colors.white,
                                                size: 18,
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 12),

              // Carousel Indicators
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  widget.videos.length,
                  (index) => Container(
                    width: _currentIndex == index ? 24 : 8,
                    height: 8,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(4),
                      color: _currentIndex == index
                          ? Theme.of(context).primaryColor
                          : Theme.of(context).dividerColor,
                    ),
                  ),
                ),
              ),
            ],
          );
        } else {
          return SizedBox(
            height: 220,
            child: Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(
                  Theme.of(context).primaryColor,
                ),
              ),
            ),
          );
        }
      },
    );
  }
}

class FullScreenVideoCarousel extends StatefulWidget {
  final List<VideoItem> videos;
  final int initialIndex;
  final List<VideoPlayerController> controllers;

  const FullScreenVideoCarousel({
    super.key,
    required this.videos,
    required this.initialIndex,
    required this.controllers,
  });

  @override
  State<FullScreenVideoCarousel> createState() =>
      _FullScreenVideoCarouselState();
}

class _FullScreenVideoCarouselState extends State<FullScreenVideoCarousel> {
  late PageController _pageController;
  late int _currentIndex;
  bool _showControls = false;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  /// Safely check if a controller is usable (not disposed)
  bool _isControllerUsable(VideoPlayerController controller) {
    try {
      controller.value;
      return true;
    } catch (_) {
      return false;
    }
  }

  void _showControlsTemporarily() {
    setState(() => _showControls = true);
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() => _showControls = false);
      }
    });
  }

  void _togglePlayPause() {
    final controller = widget.controllers[_currentIndex];
    if (!_isControllerUsable(controller)) return;

    setState(() {
      try {
        if (controller.value.isPlaying) {
          controller.pause();
        } else {
          controller.play();
        }
      } catch (_) {}
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    // Do NOT dispose video controllers - they're shared from cache
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTap: () {
          _showControlsTemporarily();
          _togglePlayPause();
        },
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Full Screen Video Carousel
            PageView.builder(
              controller: _pageController,
              onPageChanged: (index) {
                setState(() => _currentIndex = index);
                for (int i = 0; i < widget.controllers.length; i++) {
                  final ctrl = widget.controllers[i];
                  if (!_isControllerUsable(ctrl)) continue;
                  try {
                    if (i == index) {
                      ctrl.play();
                    } else {
                      ctrl.pause();
                    }
                  } catch (_) {}
                }
              },
              itemCount: widget.videos.length,
              itemBuilder: (context, index) {
                final controller = widget.controllers[index];
                final isUsable = _isControllerUsable(controller);

                if (!isUsable || !controller.value.isInitialized) {
                  return const Center(
                    child: CircularProgressIndicator(color: Colors.white),
                  );
                }

                return Center(
                  child: AspectRatio(
                    aspectRatio: controller.value.aspectRatio,
                    child: VideoPlayer(controller),
                  ),
                );
              },
            ),

            // Play/Pause Overlay (appears on tap)
            if (_showControls && _isControllerUsable(widget.controllers[_currentIndex]))
              Center(
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.3),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    widget.controllers[_currentIndex].value.isPlaying
                        ? Iconsax.pause
                        : Iconsax.play,
                    color: Colors.white,
                    size: 40,
                  ),
                ),
              ),

            // Close Button (appears on tap)
            if (_showControls)
              Positioned(
                top: MediaQuery.of(context).padding.top + 8,
                left: 16,
                child: GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.9),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Iconsax.arrow_left,
                      color: Colors.black,
                      size: 20,
                    ),
                  ),
                ),
              ),

            // Video Title (always visible at bottom)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withValues(alpha: 0.8),
                    ],
                  ),
                ),
                padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).padding.bottom + 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.videos[_currentIndex].title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${_currentIndex + 1} de ${widget.videos.length}',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
