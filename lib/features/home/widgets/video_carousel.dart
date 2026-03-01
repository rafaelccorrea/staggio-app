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
  int _currentIndex = 0;
  bool _disposed = false;
  final Map<int, bool> _ready = {};

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _initVideos();
  }

  Future<void> _initVideos() async {
    for (int i = 0; i < widget.videos.length; i++) {
      if (_disposed) return;

      final url = widget.videos[i].url;

      // Ensure video is fully initialized (may already be cached from splash)
      await VideoCacheService.ensureInitialized(url);

      if (_disposed) return;

      // Double-check the controller is actually ready
      if (VideoCacheService.isReady(url)) {
        final controller = VideoCacheService.getController(url);
        controller.setVolume(0.0);

        if (mounted) {
          setState(() {
            _ready[i] = true;
          });
        }

        // Auto-play the first video ONLY after setState confirms it's ready
        if (i == 0 && _currentIndex == 0 && !_disposed) {
          // Small delay to ensure the VideoPlayer widget has been built
          await Future.delayed(const Duration(milliseconds: 100));
          if (!_disposed && mounted) {
            controller.play();
            debugPrint('[VIDEO_CAROUSEL] Auto-playing video 0 (confirmed ready)');
          }
        }
      } else {
        debugPrint('[VIDEO_CAROUSEL] Video $i failed to initialize: $url');
      }
    }
  }

  void _onPageChanged(int index) {
    if (_disposed) return;
    final prevIndex = _currentIndex;
    setState(() => _currentIndex = index);

    // Pause previous video
    final prevUrl = widget.videos[prevIndex].url;
    if (VideoCacheService.isReady(prevUrl)) {
      try {
        VideoCacheService.getController(prevUrl).pause();
      } catch (_) {}
    }

    // Play current video
    final currentUrl = widget.videos[index].url;
    if (VideoCacheService.isReady(currentUrl)) {
      try {
        VideoCacheService.getController(currentUrl).play();
      } catch (_) {}
    }
  }

  @override
  void dispose() {
    _disposed = true;
    _pageController.dispose();
    // Pause all videos, don't dispose (managed by cache)
    for (int i = 0; i < widget.videos.length; i++) {
      final url = widget.videos[i].url;
      if (!VideoCacheService.isReady(url)) continue;
      try {
        VideoCacheService.getController(url).pause();
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
            onPageChanged: _onPageChanged,
            itemCount: widget.videos.length,
            itemBuilder: (context, index) {
              final url = widget.videos[index].url;
              final isReady = _ready[index] == true && VideoCacheService.isReady(url);

              if (!isReady) {
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  child: ClipRRect(
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
                  ),
                );
              }

              final controller = VideoCacheService.getController(url);

              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                child: Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: SizedBox.expand(
                        child: FittedBox(
                          fit: BoxFit.cover,
                          child: SizedBox(
                            width: controller.value.size.width,
                            height: controller.value.size.height,
                            child: VideoPlayer(controller),
                          ),
                        ),
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
                            padding: const EdgeInsets.fromLTRB(12, 20, 12, 4),
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
            (index) => AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: _currentIndex == index ? 24 : 8,
              height: 8,
              decoration: BoxDecoration(
                color: _currentIndex == index
                    ? Theme.of(context).colorScheme.primary
                    : Colors.grey.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
