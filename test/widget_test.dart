import 'package:flutter_test/flutter_test.dart';
import 'package:staggio/main.dart';

void main() {
  testWidgets('Staggio app starts and shows splash', (WidgetTester tester) async {
    await tester.pumpWidget(const StaggioApp());
    expect(find.text('Staggio'), findsOneWidget);
    expect(find.text('IA para Corretores'), findsOneWidget);
  });
}
