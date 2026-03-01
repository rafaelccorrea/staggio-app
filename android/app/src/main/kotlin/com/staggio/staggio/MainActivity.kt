package com.staggio.staggio

import io.flutter.embedding.android.FlutterFragmentActivity

// FlutterFragmentActivity is required for local_auth biometric authentication
// to work properly. FlutterActivity does not support FragmentActivity which
// is needed by the BiometricPrompt API.
class MainActivity : FlutterFragmentActivity()
