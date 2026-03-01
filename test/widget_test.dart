import 'package:flutter_test/flutter_test.dart';
import 'package:staggio/main.dart';

void main() {
  testWidgets('Staggio app starts and shows splash', (WidgetTester tester) async {
    await tester.pumpWidget(const StaggioApp());
    await tester.pump(const Duration(milliseconds: 100));
    expect(find.text('Staggio'), findsOneWidget);
  });
}
