// Shared test fixtures. Not a node itself and not a test file.
//
// FIXTURE1 and FIXTURE2 (both the _XML string and the _B64 binary bytes)
// were generated from the SAME source data by CPython's stdlib `plistlib`
// (FMT_XML / FMT_BINARY) -- an independent implementation from this
// package's own parser/serializer, so any test that asserts a fixture's
// parsed fields against the values commented below is an independent-
// oracle test, not a self-consistency check. Regeneration script (for
// reference, not run at test time):
//
//   python3 -c "
//   import plistlib, base64, datetime
//   data = {...}  # see FIXTURE1_EXPECTED / FIXTURE2_EXPECTED below
//   print(base64.b64encode(plistlib.dumps(data, fmt=plistlib.FMT_BINARY)).decode())
//   print(plistlib.dumps(data, fmt=plistlib.FMT_XML).decode())
//   "

// Source dict (Python):
//   SmallInt: 42
//   NegativeInt: -5
//   LargePositive4Byte: 3000000000       (>= 2^31 -- wrong in the standard
//                                          JS bplist-parser at 4-byte width)
//   HugeInt8Byte: 9223372036854775000    (outside signed 32-bit range --
//                                          wrong in the standard JS
//                                          bplist-parser at 8-byte width)
//   PiReal: 3.14159
//   WholeReal: 98.0                      (a REAL that must stay <real>, not
//                                          collapse to <integer>, on rebuild)
//   IsEnabled: True / IsDisabled: False
//   CreatedAt: datetime(2026, 7, 21, 12, 30, 0) -> "2026-07-21T12:30:00Z"
//   RawData: b'\x00\x01\x02\xff\xfe'     -> base64 "AAEC//4="
//   Nested.Array: ['a', 'b', 'c']
//   Nested.DeepDict.Key: 'Value'
export const FIXTURE1_XML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CreatedAt</key>
	<date>2026-07-21T12:30:00Z</date>
	<key>HugeInt8Byte</key>
	<integer>9223372036854775000</integer>
	<key>IsDisabled</key>
	<false/>
	<key>IsEnabled</key>
	<true/>
	<key>LargePositive4Byte</key>
	<integer>3000000000</integer>
	<key>NegativeInt</key>
	<integer>-5</integer>
	<key>Nested</key>
	<dict>
		<key>Array</key>
		<array>
			<string>a</string>
			<string>b</string>
			<string>c</string>
		</array>
		<key>DeepDict</key>
		<dict>
			<key>Key</key>
			<string>Value</string>
		</dict>
	</dict>
	<key>PiReal</key>
	<real>3.14159</real>
	<key>RawData</key>
	<data>
	AAEC//4=
	</data>
	<key>SmallInt</key>
	<integer>42</integer>
	<key>WholeReal</key>
	<real>98.0</real>
</dict>
</plist>
`;

export const FIXTURE1_B64 =
  'YnBsaXN0MDDbAQIDBAUGBwgJCgsMDQ4PEBESHB0eH1lDcmVhdGVkQXRcSHVnZUludDhCeXRlWklzRGlzYWJsZWRZSXNFbmFibGVkXxASTGFyZ2VQb3NpdGl2ZTRCeXRlW05lZ2F0aXZlSW50Vk5lc3RlZFZQaVJlYWxXUmF3RGF0YVhTbWFsbEludFlXaG9sZVJlYWwzQcgHzuQAAAATf////////NgICRKy0F4AE//////////70hMUFRlVQXJyYXlYRGVlcERpY3SjFhcYUWFRYlFj0RobU0tleVVWYWx1ZSNACSH58BuGbkUAAQL//hAqI0BYgAAAAAAACB8pNkFLYGxzeoKLlZ6nqKmut7zCy8/R09XY3OLr8fMAAAAAAAABAQAAAAAAAAAgAAAAAAAAAAAAAAAAAAAA/A==';

// Source dict (Python), an Info.plist-shaped document:
//   CFBundleIdentifier: 'com.example.myapp'
//   CFBundleVersion: '42'
//   CFBundleShortVersionString: '1.2.3'
//   CFBundleName: 'MyApp'
//   CFBundleURLTypes: [
//     {CFBundleURLSchemes: ['myapp', 'myapp-debug']},
//     {CFBundleURLSchemes: ['myapp2']},
//   ]
//   NSCameraUsageDescription: 'This app uses the camera to scan documents.'
//   NSMicrophoneUsageDescription: 'This app uses the microphone for voice notes.'
export const FIXTURE2_XML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleIdentifier</key>
	<string>com.example.myapp</string>
	<key>CFBundleName</key>
	<string>MyApp</string>
	<key>CFBundleShortVersionString</key>
	<string>1.2.3</string>
	<key>CFBundleURLTypes</key>
	<array>
		<dict>
			<key>CFBundleURLSchemes</key>
			<array>
				<string>myapp</string>
				<string>myapp-debug</string>
			</array>
		</dict>
		<dict>
			<key>CFBundleURLSchemes</key>
			<array>
				<string>myapp2</string>
			</array>
		</dict>
	</array>
	<key>CFBundleVersion</key>
	<string>42</string>
	<key>NSCameraUsageDescription</key>
	<string>This app uses the camera to scan documents.</string>
	<key>NSMicrophoneUsageDescription</key>
	<string>This app uses the microphone for voice notes.</string>
</dict>
</plist>
`;

export const FIXTURE2_B64 =
  'YnBsaXN0MDDXAQIDBAUGBwgJCgsUFRZfEBJDRkJ1bmRsZUlkZW50aWZpZXJcQ0ZCdW5kbGVOYW1lXxAaQ0ZCdW5kbGVTaG9ydFZlcnNpb25TdHJpbmdfEBBDRkJ1bmRsZVVSTFR5cGVzXxAPQ0ZCdW5kbGVWZXJzaW9uXxAYTlNDYW1lcmFVc2FnZURlc2NyaXB0aW9uXxAcTlNNaWNyb3Bob25lVXNhZ2VEZXNjcmlwdGlvbl8QEWNvbS5leGFtcGxlLm15YXBwVU15QXBwVTEuMi4zogwR0Q0OXxASQ0ZCdW5kbGVVUkxTY2hlbWVzog8QVW15YXBwW215YXBwLWRlYnVn0Q0SoRNWbXlhcHAyUjQyXxArVGhpcyBhcHAgdXNlcyB0aGUgY2FtZXJhIHRvIHNjYW4gZG9jdW1lbnRzLl8QLVRoaXMgYXBwIHVzZXMgdGhlIG1pY3JvcGhvbmUgZm9yIHZvaWNlIG5vdGVzLgAIABcALAA5AFYAaQB7AJYAtQDJAM8A1QDYANsA8ADzAPkBBQEIAQoBEQEUAUIAAAAAAAACAQAAAAAAAAAXAAAAAAAAAAAAAAAAAAABcg==';

export function b64ToBytes(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, 'base64'));
}
