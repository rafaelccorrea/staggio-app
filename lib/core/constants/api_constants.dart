class ApiConstants {
  static const String baseUrl = 'http://192.168.1.4:3000/api/v1';
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String authRefresh = '/auth/refresh';
  static const String me = '/auth/me';
  static const String forgotPassword = '/auth/forgot-password';
  static const String googleAuth = '/auth/google';

  // Users
  static const String profile = '/users/me';
  static const String updateProfile = '/users/me';
  static const String dashboard = '/users/me/stats';

  // Properties
  static const String properties = '/properties';
  static const String propertyStats = '/properties/stats';

  // AI
  static const String aiDescription = '/ai/description';
  static const String aiStaging = '/ai/staging';
  static const String aiTerrainVision = '/ai/terrain-vision';
  static const String aiPhotoEnhance = '/ai/photo-enhance';
  static const String aiChat = '/ai/chat';

  // Subscriptions
  static const String plans = '/subscriptions/plans';
  static const String currentSubscription = '/subscriptions/me';

  // Generations
  static const String generations = '/generations';
  static const String generationStats = '/generations/stats';

  // Stripe
  static const String stripeCheckout = '/stripe/checkout';
  static const String stripeBuyCredits = '/stripe/buy-credits';
  static const String stripePortal = '/stripe/portal';
  static const String stripeWebhook = '/stripe/webhook';

  // Storage
  static const String validatePropertyImage = '/ai/validate-property-image';
  static const String upload = '/storage/upload';
  static const String uploadMultiple = '/storage/upload-multiple';

  // Video
  static const String videoGenerate = '/video/generate';
  static const String videoStyles = '/video/styles';

  // Health
  static const String health = '/health';
}
