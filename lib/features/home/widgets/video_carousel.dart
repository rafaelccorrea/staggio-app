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
  bool _disposed = false;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _controllers = List.generate(
      widget.videos.length,
      (index) => VideoCacheService.getController(widget.videos[index].url),
    );
    _initializeVideos();
  }

  Future<void> _initializeVideos() async {
    if (_controllers.isEmpty || _disposed) return;

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
      if (mounted && !_disposed && !firstController.value.isPlaying) {
        firstController.play();
      }
    } catch (e) {
      debugPrint('[VIDEO_CAROUSEL] Erro ao inicializar primeiro video: $e');
    }

    Future.delayed(const Duration(milliseconds: 500), () {
      if (!_disposed) _preloadOtherVideos();
    });
  }

  Future<void> _initializeControllerAt(int index) async {
    if (_disposed || index >= _controllers.length) return;
    try {
      final controller = _controllers[index];
      if (!controller.value.isInitialized) {
        await controller.initialize().timeout(const Duration(seconds: 20));
        controller.setLooping(true);
        controller.setVolume(0.0);
      }
      if (mounted && !_disposed && index == _currentIndex && !controller.value.isPlaying) {
        controller.play();
      }
    } catch (e) {
      debugPrint('[VIDEO_CAROUSEL] Erro ao inicializar controller[$index]: $e');
    }
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
    return Column(
      children: [
        SizedBox(
          height: 220,
          child: PageView.builder(
            controller: _pageController,
            onPageChanged: (index) {
              if (_disposed) return;
              setState(() => _currentIndex = index);
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
              // Recriar controller se foi descartado
              if (!_isControllerUsable(_controllers[index])) {
                _controllers[index] = VideoCacheService.getController(widget.videos[index].url);
                _initializeControllerAt(index);
              }
              final controller = _controllers[index];

              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                child: ValueListenableBuilder<VideoPlayerValue>(
                  valueListenable: controller,
                  builder: (context, value, child) {
                    final isInitialized = _isControllerUsable(controller) && value.isInitialized;

                    if (!isInitialized) {
                      return ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Shimmer.fromColors(
                          baseColor: Theme.of(context).brightness == Brightness.dark
                              ? Colors.grey[800]!
                              : Colors.grey[300]!,
                          highlightColor: Theme.of(context).brightness == Brightness.dark
                              ? Colors.grey[700]!
                              : Colors.grey[100]!,
                          child: Container(color: Colors.white),
                        ),
                      );
                    }

                    return Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: AspectRatio(
                            aspectRatio: value.aspectRatio,
                            child: VideoPlayer(controller),
                          ),
                        ),
                        if (widget.videos[index].prompt != null)
                          Positioned(
                            bottom: 0,
                            left: 0,
                            right: 0,
                            child: GestureDetector(
                              onTap: () => showModalBottomSheet(
                                context: context,
                                builder: (_) => Padding(
                                  padding: const EdgeInsets.all(20),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Prompt utilizado',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      Text(
                                        widget.videos[index].prompt!,
                                        style: const TextStyle(
                                          fontSize: 14,
                                          height: 1.6,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                    ],
                                  ),
                                ),
                              ),
                              child: Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [
                                      Colors.transparent,
                                      Colors.black.withValues(alpha: 0.7),
                                    ],
                                  ),
                                  borderRadius: const BorderRadius.only(
                                    bottomLeft: Radius.circular(16),
                                    bottomRight: Radius.circular(16),
                                  ),
                                ),
                                padding: const EdgeInsets.fromLTRB(12, 20, 12, 10),
                                child: Row(
                                  children: [
                                    const Icon(Icons.auto_awesome, color: Colors.white, size: 14),
                                    const SizedBox(width: 6),
                                    Expanded(
                                      child: Text(
                                        widget.videos[index].prompt!,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 12,
                                          height: 1.4,
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                      ],
                    );
                  },
                ),
              );
            },
          ),
        ),

        const SizedBox(height: 12),

        // Indicadores
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
                      ctrl.setLooping(true);
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
                  return Shimmer.fromColors(
                    baseColor: Colors.grey[900]!,
                    highlightColor: Colors.grey[700]!,
                    child: Container(color: Colors.black),
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
