// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';

import 'package:quizdram/main.dart';

void main() {
  testWidgets('QuizDram home screen renders', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const QuizDramApp());

    expect(find.text('QUIZDRAM'), findsOneWidget);
    expect(find.text('Kategoriler'), findsOneWidget);
    expect(find.text('Başla'), findsOneWidget);
  });
}
