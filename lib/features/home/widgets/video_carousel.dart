import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:iconsax_flutter/iconsax_flutter.dart';

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

  VideoItem({required this.url, required this.title});
}

class _VideoCarouselState extends State<VideoCarousel> {
  late PageController _pageController;
  late List<VideoPlayerController> _controllers;
  int _currentIndex = 0;
  bool _showControls = false;
  late Future<void> _initializeVideosFuture;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _controllers = List.generate(
      widget.videos.length,
      (index) => VideoPlayerController.networkUrl(
        Uri.parse(widget.videos[index].url),
      ),
    );
    _initializeVideosFuture = _initializeVideos();
  }

  Future<void> _initializeVideos() async {
    for (var controller in _controllers) {
      await controller.initialize();
      controller.setLooping(true);
    }
    if (mounted) {
      setState(() {
        _controllers[0].play();
      });
    }
  }



  void _togglePlayPause() {
    setState(() {
      if (_controllers[_currentIndex].value.isPlaying) {
        _controllers[_currentIndex].pause();
      } else {
        _controllers[_currentIndex].play();
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

  void _showControlsTemporarily() {
    setState(() => _showControls = true);
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() => _showControls = false);
      }
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    for (var controller in _controllers) {
      controller.dispose();
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
                height: 280,
                child: PageView.builder(
                  controller: _pageController,
                  onPageChanged: (index) {
                    setState(() => _currentIndex = index);
                    _controllers[_currentIndex].play();
                    for (int i = 0; i < _controllers.length; i++) {
                      if (i != _currentIndex) {
                        _controllers[i].pause();
                      }
                    }
                  },
                  itemCount: widget.videos.length,
                  itemBuilder: (context, index) {
                    return GestureDetector(
                      onTap: () {
                        _showControlsTemporarily();
                        _togglePlayPause();
                      },
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          color: Colors.black,
                        ),
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            // Video Player
                            ClipRRect(
                              borderRadius: BorderRadius.circular(16),
                              child: AspectRatio(
                                aspectRatio:
                                    _controllers[index].value.aspectRatio,
                                child: VideoPlayer(_controllers[index]),
                              ),
                            ),

                            // Play/Pause Overlay (appears on tap)
                            if (_showControls)
                              Container(
                                decoration: BoxDecoration(
                                  color: Colors.black.withValues(alpha: 0.3),
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
                                      _controllers[index].value.isPlaying
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

                            // Video Title (always visible)
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
                                      Colors.black.withValues(alpha: 0.7),
                                    ],
                                  ),
                                  borderRadius: const BorderRadius.only(
                                    bottomLeft: Radius.circular(16),
                                    bottomRight: Radius.circular(16),
                                  ),
                                ),
                                padding: const EdgeInsets.all(12),
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
            height: 280,
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

  void _showControlsTemporarily() {
    setState(() => _showControls = true);
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() => _showControls = false);
      }
    });
  }

  void _togglePlayPause() {
    setState(() {
      if (widget.controllers[_currentIndex].value.isPlaying) {
        widget.controllers[_currentIndex].pause();
      } else {
        widget.controllers[_currentIndex].play();
      }
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
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
                widget.controllers[_currentIndex].play();
                for (int i = 0; i < widget.controllers.length; i++) {
                  if (i != _currentIndex) {
                    widget.controllers[i].pause();
                  }
                }
              },
              itemCount: widget.videos.length,
              itemBuilder: (context, index) {
                return Center(
                  child: AspectRatio(
                    aspectRatio:
                        widget.controllers[index].value.aspectRatio,
                    child: VideoPlayer(widget.controllers[index]),
                  ),
                );
              },
            ),

            // Play/Pause Overlay (appears on tap)
            if (_showControls)
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
                top: 16,
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
                padding: const EdgeInsets.all(20),
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
