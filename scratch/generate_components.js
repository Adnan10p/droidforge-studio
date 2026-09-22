const fs = require('fs');
const path = require('path');

const visibleCategories = [
  {
    id: "Basic UI",
    label: "Basic UI",
    items: [
      { type: "Button", name: "Button", icon: "MousePointerClick", desc: "Material 3 interactive action button.", props: { text: "Button", variant: "filled", backgroundColor: "#6750A4", textColor: "#FFFFFF", cornerRadius: 24, fontSize: 15 }, events: ["Click", "LongClick"], compose: "Button(onClick = {}) { Text('Button') }" },
      { type: "Text Label", name: "Text Label", icon: "Type", desc: "Material 3 text typography label.", props: { text: "Text Label", fontSize: 16, textColor: "#1D192B" }, events: ["Click"], compose: "Text('Text Label')" },
      { type: "Text Input", name: "Text Input", icon: "TextCursorInput", desc: "Material 3 text field input.", props: { hint: "Enter text...", text: "", textColor: "#0F172A", cornerRadius: 12 }, events: ["TextChanged", "FocusGained"], compose: "OutlinedTextField(value = text, onValueChange = {})" },
      { type: "Password Input", name: "Password Input", icon: "KeyRound", desc: "Secure password text field input.", props: { hint: "Enter password...", isPassword: true, cornerRadius: 12 }, events: ["TextChanged"], compose: "OutlinedTextField(visualTransformation = PasswordVisualTransformation())" },
      { type: "Check Box", name: "Check Box", icon: "CheckSquare", desc: "Binary checkbox option selector.", props: { text: "Option label", checked: false }, events: ["CheckedChange"], compose: "Checkbox(checked = isChecked, onCheckedChange = {})" },
      { type: "Radio Button", name: "Radio Button", icon: "CircleDot", desc: "Single option radio selection button.", props: { text: "Radio choice", checked: false }, events: ["Click"], compose: "RadioButton(selected = selected, onClick = {})" },
      { type: "Toggle Switch", name: "Toggle Switch", icon: "ToggleLeft", desc: "Boolean toggle switch indicator.", props: { text: "Enable feature", checked: true }, events: ["CheckedChange"], compose: "Switch(checked = enabled, onCheckedChange = {})" },
      { type: "Slider", name: "Slider", icon: "Sliders", desc: "Continuous numeric slider control.", props: { value: 50, min: 0, max: 100 }, events: ["ValueChange"], compose: "Slider(value = value, onValueChange = {})" },
      { type: "Rating Bar", name: "Rating Bar", icon: "Star", desc: "Star rating selector control.", props: { value: 4, max: 5 }, events: ["RatingChanged"], compose: "RatingBar(rating = rating, onRatingChanged = {})" },
      { type: "Progress Bar", name: "Progress Bar", icon: "Loader", desc: "Linear progress bar indicator.", props: { progress: 60, indeterminate: false }, events: [], compose: "LinearProgressIndicator(progress = 0.6f)" },
      { type: "Circular Loader", name: "Circular Loader", icon: "Loader", desc: "Circular spinner loader indicator.", props: { indeterminate: true }, events: [], compose: "CircularProgressIndicator()" },
      { type: "Date Picker", name: "Date Picker", icon: "Calendar", desc: "Calendar date selector dialog.", props: { text: "Select Date" }, events: ["DateSelected"], compose: "DatePickerDialog(onDateSelected = {})" },
      { type: "Time Picker", name: "Time Picker", icon: "Clock", desc: "Time selector clock picker.", props: { text: "Select Time" }, events: ["TimeSelected"], compose: "TimePickerDialog(onTimeSelected = {})" },
      { type: "Drop Down", name: "Drop Down", icon: "ChevronDown", desc: "Exposed dropdown select menu.", props: { items: ["Option 1", "Option 2", "Option 3"], selectedIndex: 0 }, events: ["ItemSelected"], compose: "ExposedDropdownMenuBox(...)" },
      { type: "List Picker", name: "List Picker", icon: "List", desc: "Modal list item selector dialog.", props: { title: "Select item", items: ["Item A", "Item B"] }, events: ["ItemSelected"], compose: "ListPickerDialog(items = list, onSelect = {})" }
    ]
  },
  {
    id: "Images & Media UI",
    label: "Images & Media UI",
    items: [
      { type: "Image View", name: "Image View", icon: "Image", desc: "High performance image viewer with Coil.", props: { url: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=600", cornerRadius: 16 }, events: ["Click"], compose: "AsyncImage(model = url, contentDescription = null)" },
      { type: "Image Picker", name: "Image Picker", icon: "Image", desc: "System gallery image selection picker.", props: { text: "Pick Image from Gallery" }, events: ["ImagePicked"], compose: "rememberLauncherForActivityResult(GetContent())" },
      { type: "Audio Picker", name: "Audio Picker", icon: "Music", desc: "System audio track file selector.", props: { text: "Select Audio File" }, events: ["AudioPicked"], compose: "rememberLauncherForActivityResult(GetContent())" },
      { type: "Video Picker", name: "Video Picker", icon: "Video", desc: "System video clip selector picker.", props: { text: "Select Video File" }, events: ["VideoPicked"], compose: "rememberLauncherForActivityResult(GetContent())" },
      { type: "Video Player", name: "Video Player", icon: "PlayCircle", desc: "ExoPlayer native video surface player.", props: { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }, events: ["OnPlay", "OnPause", "OnEnd"], compose: "AndroidView(factory = { PlayerView(it) })" },
      { type: "YouTube Player", name: "YouTube Player", icon: "PlayCircle", desc: "YouTube iframe video player view.", props: { videoId: "dQw4w9WgXcQ", autoPlay: false }, events: ["OnStateChange"], compose: "AndroidView(factory = { YouTubePlayerView(it) })" }
    ]
  },
  {
    id: "Layouts",
    label: "Layouts",
    items: [
      { type: "Horizontal Layout", name: "Horizontal Layout", icon: "Columns", desc: "Row layout arranging children horizontally.", isContainer: true, props: { padding: 8, orientation: "horizontal", layoutWidth: "match_parent" }, events: [], compose: "Row(modifier = Modifier.fillMaxWidth()) { ... }" },
      { type: "Vertical Layout", name: "Vertical Layout", icon: "Rows", desc: "Column layout arranging children vertically.", isContainer: true, props: { padding: 8, orientation: "vertical", layoutWidth: "match_parent" }, events: [], compose: "Column(modifier = Modifier.fillMaxWidth()) { ... }" },
      { type: "Scroll Layout", name: "Scroll Layout", icon: "SlidersHorizontal", desc: "Vertical scroll container view.", isContainer: true, props: { padding: 16, layoutWidth: "match_parent", layoutHeight: "match_parent" }, events: ["OnScroll"], compose: "Column(Modifier.verticalScroll(rememberScrollState())) { ... }" },
      { type: "Horizontal Scroll Layout", name: "Horizontal Scroll Layout", icon: "SlidersHorizontal", desc: "Horizontal scroll container view.", isContainer: true, props: { padding: 8, layoutWidth: "match_parent" }, events: ["OnScroll"], compose: "Row(Modifier.horizontalScroll(rememberScrollState())) { ... }" },
      { type: "Grid Layout", name: "Grid Layout", icon: "Grid", desc: "Multi-column grid container view.", isContainer: true, props: { columns: 2, padding: 8 }, events: [], compose: "LazyVerticalGrid(columns = GridCells.Fixed(2)) { ... }" },
      { type: "Table Layout", name: "Table Layout", icon: "Table", desc: "Structured tabular layout view.", isContainer: true, props: { rows: 3, columns: 3 }, events: [], compose: "Column { Row { ... } }" },
      { type: "Card Layout", name: "Card Layout", icon: "CreditCard", desc: "Material 3 card surface container.", isContainer: true, props: { cornerRadius: 16, elevation: 2, padding: 16, backgroundColor: "#FFFFFF" }, events: ["Click"], compose: "Card(shape = RoundedCornerShape(16.dp)) { ... }" },
      { type: "Frame Layout", name: "Frame Layout", icon: "Box", desc: "Box layout stacking overlapping views.", isContainer: true, props: { padding: 0 }, events: [], compose: "Box(modifier = Modifier.fillMaxSize()) { ... }" },
      { type: "Space", name: "Space", icon: "Maximize", desc: "Flexible empty layout spacer.", props: { layoutWidth: 16, layoutHeight: 16 }, events: [], compose: "Spacer(modifier = Modifier.size(16.dp))" }
    ]
  },
  {
    id: "Lists",
    label: "Lists",
    items: [
      { type: "Simple List", name: "Simple List", icon: "List", desc: "Simple lazy text list view.", isContainer: true, props: { items: ["Item 1", "Item 2", "Item 3"] }, events: ["ItemClick"], compose: "LazyColumn { items(list) { Text(it) } }" },
      { type: "Image List", name: "Image List", icon: "List", desc: "List view with thumbnail images.", isContainer: true, props: { items: ["Item 1", "Item 2"] }, events: ["ItemClick"], compose: "LazyColumn { items(list) { Row { AsyncImage(...); Text(...) } } }" },
      { type: "Custom List", name: "Custom List", icon: "List", desc: "Custom template recycler list.", isContainer: true, props: { items: ["Custom 1", "Custom 2"] }, events: ["ItemClick"], compose: "LazyColumn { items(list) { CustomRow(it) } }" },
      { type: "Grid List", name: "Grid List", icon: "Grid", desc: "Lazy grid item list view.", isContainer: true, props: { columns: 2 }, events: ["ItemClick"], compose: "LazyVerticalGrid(columns = GridCells.Fixed(2)) { ... }" }
    ]
  },
  {
    id: "Navigation UI",
    label: "Navigation UI",
    items: [
      { type: "Bottom Navigation", name: "Bottom Navigation", icon: "PanelTop", desc: "Material 3 bottom navigation bar.", props: { items: ["Home", "Search", "Profile"] }, events: ["TabSelected"], compose: "NavigationBar { NavigationBarItem(...) }" },
      { type: "Tab Navigation", name: "Tab Navigation", icon: "PanelTop", desc: "Tab row navigation header.", props: { tabs: ["Tab 1", "Tab 2", "Tab 3"] }, events: ["TabSelected"], compose: "TabRow(selectedTabIndex) { Tab(...) }" },
      { type: "View Pager", name: "View Pager", icon: "SlidersHorizontal", desc: "Horizontal page swipe view pager.", isContainer: true, props: { pageCount: 3 }, events: ["PageChanged"], compose: "HorizontalPager(state = pagerState) { page -> ... }" },
      { type: "Navigation Drawer", name: "Navigation Drawer", icon: "Menu", desc: "Side navigation drawer menu.", isContainer: true, props: { title: "App Menu" }, events: ["OnOpen", "OnClose"], compose: "ModalNavigationDrawer(drawerContent = {}) { ... }" },
      { type: "Toolbar", name: "Toolbar", icon: "PanelTop", desc: "Top app bar with back action.", props: { title: "App Title", showBackButton: true }, events: ["NavigationClick"], compose: "TopAppBar(title = { Text(title) })" }
    ]
  },
  {
    id: "Advanced UI",
    label: "Advanced UI",
    items: [
      { type: "Floating Action Button", name: "Floating Action Button", icon: "PlusCircle", desc: "Material 3 floating action button.", props: { icon: "plus", backgroundColor: "#6750A4" }, events: ["Click"], compose: "FloatingActionButton(onClick = {}) { Icon(...) }" },
      { type: "Search Bar", name: "Search Bar", icon: "Search", desc: "Material 3 search bar with suggestions.", props: { placeholder: "Search..." }, events: ["QueryChanged", "SearchSubmitted"], compose: "SearchBar(query = query, onQueryChange = {})" },
      { type: "Web View", name: "Web View", icon: "Globe", desc: "Embedded Chromium browser web view.", props: { url: "https://android.com" }, events: ["OnPageStarted", "OnPageFinished"], compose: "AndroidView(factory = { WebView(it) })" },
      { type: "Gallery View", name: "Gallery View", icon: "Image", desc: "Horizontal image gallery carousel.", props: { images: [] }, events: ["ImageClick"], compose: "LazyRow { items(images) { Image(...) } }" },
      { type: "Swipe Refresh", name: "Swipe Refresh", icon: "Loader", desc: "Pull to refresh layout container.", isContainer: true, props: { refreshing: false }, events: ["OnRefresh"], compose: "SwipeRefresh(state = state, onRefresh = {})" },
      { type: "Chat View", name: "Chat View", icon: "MessageSquare", desc: "Interactive messenger conversation list view.", isContainer: true, props: { messages: [] }, events: ["SendMessage"], compose: "LazyColumn { items(messages) { ChatBubble(it) } }" },
      { type: "Surface View", name: "Surface View", icon: "Box", desc: "Direct hardware surface view.", props: {}, events: ["SurfaceCreated"], compose: "AndroidView(factory = { SurfaceView(it) })" }
    ]
  },
  {
    id: "Drawing & Animation",
    label: "Drawing & Animation",
    items: [
      { type: "Drawing Canvas", name: "Drawing Canvas", icon: "Edit3", desc: "2D custom graphics drawing canvas.", props: { backgroundColor: "#FFFFFF" }, events: ["TouchDraw"], compose: "Canvas(modifier = Modifier.fillMaxSize()) { drawPath(...) }" },
      { type: "Ball Object", name: "Ball Object", icon: "CircleDot", desc: "Physics ball sprite for canvas.", props: { radius: 20, color: "#FF0000", x: 100, y: 100 }, events: ["EdgeReached", "CollidedWith"], compose: "Canvas { drawCircle(color, radius, center) }" },
      { type: "Image Sprite", name: "Image Sprite", icon: "Image", desc: "Animated image sprite object.", props: { x: 50, y: 50, speed: 5 }, events: ["SpriteClick", "CollidedWith"], compose: "Canvas { drawImage(...) }" },
      { type: "Lottie Animation", name: "Lottie Animation", icon: "Sparkles", desc: "Vector Lottie JSON animation viewer.", props: { url: "https://assets.lottiefiles.com/packages/lf20_sample.json", loop: true, autoPlay: true }, events: ["AnimationEnd"], compose: "LottieAnimation(composition, progress)" }
    ]
  },
  {
    id: "Maps",
    label: "Maps",
    items: [
      { type: "Map View", name: "Map View", icon: "MapPin", desc: "Google Maps SDK vector map container.", props: { latitude: 37.7749, longitude: -122.4194, zoom: 12 }, events: ["MapClick", "CameraMove"], compose: "GoogleMap(cameraPositionState = cameraState)" },
      { type: "Map Marker", name: "Map Marker", icon: "MapPin", desc: "Google Maps pin marker.", props: { title: "Location Pin", latitude: 37.7749, longitude: -122.4194 }, events: ["MarkerClick"], compose: "Marker(state = MarkerState(position))" },
      { type: "Map Circle", name: "Map Circle", icon: "CircleDot", desc: "Geographic radius circle overlay.", props: { radius: 1000, fillColor: "#330000FF" }, events: ["CircleClick"], compose: "Circle(center = pos, radius = 1000.0)" },
      { type: "Map Polygon", name: "Map Polygon", icon: "Box", desc: "Custom polygon area map overlay.", props: { points: [] }, events: ["PolygonClick"], compose: "Polygon(points = list)" },
      { type: "Map Polyline", name: "Map Polyline", icon: "Navigation", desc: "Route line path map overlay.", props: { points: [] }, events: ["PolylineClick"], compose: "Polyline(points = route)" },
      { type: "Map Rectangle", name: "Map Rectangle", icon: "Box", desc: "Bounding box rectangle map overlay.", props: { bounds: {} }, events: ["RectangleClick"], compose: "Polygon(points = rectanglePoints)" }
    ]
  },
  {
    id: "Contact UI",
    label: "Contact UI",
    items: [
      { type: "Contact Picker", name: "Contact Picker", icon: "Users", desc: "System contact picker button UI.", props: { text: "Pick Contact" }, events: ["ContactPicked"], compose: "rememberLauncherForActivityResult(PickContact())" },
      { type: "Email Picker", name: "Email Picker", icon: "Mail", desc: "Email address selector input.", props: { text: "Select Email" }, events: ["EmailPicked"], compose: "OutlinedTextField(value = email, onValueChange = {})" },
      { type: "Phone Number Picker", name: "Phone Number Picker", icon: "Phone", desc: "Phone number selector input UI.", props: { text: "Select Phone Number" }, events: ["PhonePicked"], compose: "OutlinedTextField(value = phone, onValueChange = {})" }
    ]
  },
  {
    id: "Advertising UI",
    label: "Advertising UI",
    items: [
      { type: "Banner Ad", name: "Banner Ad", icon: "Tag", desc: "Google AdMob banner ad view (320x50).", props: { adUnitId: "ca-app-pub-3940256099942544/6300978111" }, events: ["AdLoaded", "AdFailedToLoad"], compose: "AndroidView(factory = { AdView(it).apply { adSize = AdSize.BANNER } })" },
      { type: "Native Ad", name: "Native Ad", icon: "Tag", desc: "Custom styled native ad view component.", props: { adUnitId: "ca-app-pub-3940256099942544/2247696110" }, events: ["AdLoaded"], compose: "AndroidView(factory = { NativeAdView(it) })" },
      { type: "Medium Rectangle Ad", name: "Medium Rectangle Ad", icon: "Tag", desc: "Medium rectangle banner ad (300x250).", props: { adUnitId: "ca-app-pub-3940256099942544/6300978111" }, events: ["AdLoaded"], compose: "AndroidView(factory = { AdView(it).apply { adSize = AdSize.MEDIUM_RECTANGLE } })" }
    ]
  },
  {
    id: "Dynamic UI Output",
    label: "Dynamic UI Output",
    items: [
      { type: "Dynamic Button", name: "Dynamic Button", icon: "PlusCircle", desc: "Runtime dynamically created button component.", props: { text: "Dynamic Button" }, events: ["Click"], compose: "DynamicComponentHolder { Button(...) }" },
      { type: "Dynamic Label", name: "Dynamic Label", icon: "Type", desc: "Runtime dynamically generated text label.", props: { text: "Dynamic Label" }, events: [], compose: "DynamicComponentHolder { Text(...) }" },
      { type: "Dynamic Image", name: "Dynamic Image", icon: "Image", desc: "Runtime dynamically generated image view.", props: { url: "" }, events: [], compose: "DynamicComponentHolder { AsyncImage(...) }" },
      { type: "Dynamic Text Input", name: "Dynamic Text Input", icon: "TextCursorInput", desc: "Runtime dynamically added text input field.", props: { hint: "Dynamic Input" }, events: ["TextChanged"], compose: "DynamicComponentHolder { OutlinedTextField(...) }" },
      { type: "Dynamic Card", name: "Dynamic Card", icon: "CreditCard", desc: "Runtime dynamically created card container.", isContainer: true, props: {}, events: [], compose: "DynamicComponentHolder { Card(...) }" },
      { type: "Dynamic Space", name: "Dynamic Space", icon: "Maximize", desc: "Runtime dynamically created spacing element.", props: { height: 16 }, events: [], compose: "DynamicComponentHolder { Spacer(...) }" }
    ]
  }
];

const nonVisibleCategories = [
  {
    id: "Device Sensors",
    label: "Device Sensors",
    items: [
      { type: "Accelerometer", name: "Accelerometer", icon: "Activity", desc: "Measures device 3-axis acceleration (m/s²).", props: { sensorDelay: "UI" }, events: ["AccelerationChanged", "Shaken"], compose: "sensorManager.registerListener(accelerometerListener)" },
      { type: "Gyroscope", name: "Gyroscope", icon: "Compass", desc: "Measures device 3-axis rotation rate (rad/s).", props: { sensorDelay: "UI" }, events: ["GyroscopeChanged"], compose: "sensorManager.registerListener(gyroscopeListener)" },
      { type: "Gravity Sensor", name: "Gravity Sensor", icon: "Activity", desc: "Measures direction and magnitude of gravity.", props: {}, events: ["GravityChanged"], compose: "sensorManager.registerListener(gravityListener)" },
      { type: "Orientation Sensor", name: "Orientation Sensor", icon: "Compass", desc: "Measures device pitch, roll, and azimuth.", props: {}, events: ["OrientationChanged"], compose: "sensorManager.registerListener(orientationListener)" },
      { type: "Magnetic Sensor", name: "Magnetic Sensor", icon: "Compass", desc: "Measures ambient 3-axis magnetic field (uT).", props: {}, events: ["MagneticFieldChanged"], compose: "sensorManager.registerListener(magnetometerListener)" },
      { type: "Light Sensor", name: "Light Sensor", icon: "Sun", desc: "Measures ambient light level (lux).", props: {}, events: ["LightChanged"], compose: "sensorManager.registerListener(lightListener)" },
      { type: "Proximity Sensor", name: "Proximity Sensor", icon: "Smartphone", desc: "Detects object distance to phone screen.", props: {}, events: ["ProximityChanged"], compose: "sensorManager.registerListener(proximityListener)" },
      { type: "Pressure Sensor", name: "Pressure Sensor", icon: "Gauge", desc: "Measures atmospheric pressure (hPa/mbar).", props: {}, events: ["PressureChanged"], compose: "sensorManager.registerListener(barometerListener)" },
      { type: "Temperature Sensor", name: "Temperature Sensor", icon: "Thermometer", desc: "Measures ambient air temperature.", props: {}, events: ["TemperatureChanged"], compose: "sensorManager.registerListener(tempListener)" },
      { type: "Humidity Sensor", name: "Humidity Sensor", icon: "Droplets", desc: "Measures relative ambient air humidity (%).", props: {}, events: ["HumidityChanged"], compose: "sensorManager.registerListener(humidityListener)" },
      { type: "Sound Level Sensor", name: "Sound Level Sensor", icon: "Mic", desc: "Measures ambient sound decibels (dB).", props: {}, events: ["SoundLevelChanged"], compose: "audioRecord.getAmplitude()" },
      { type: "Step Counter", name: "Step Counter", icon: "Activity", desc: "Hardware step counter sensor.", props: {}, events: ["StepTaken"], compose: "sensorManager.registerListener(stepCounterListener)" }
    ]
  },
  {
    id: "Location",
    label: "Location",
    items: [
      { type: "Location Manager", name: "Location Manager", icon: "Navigation", desc: "Fused location provider for coordinates.", props: { timeInterval: 5000, distanceInterval: 5 }, events: ["LocationChanged", "StatusChanged"], compose: "fusedLocationClient.requestLocationUpdates(...)" },
      { type: "GPS Manager", name: "GPS Manager", icon: "Navigation", desc: "Direct GPS hardware satellite provider.", props: { highAccuracy: true }, events: ["GPSLocationChanged"], compose: "locationManager.requestLocationUpdates(GPS_PROVIDER)" },
      { type: "Geocoding", name: "Geocoding", icon: "Globe", desc: "Convert address to lat/lon and reverse.", props: {}, events: ["GotCoordinates", "GotAddress"], compose: "Geocoder(context).getFromLocationName(...)" },
      { type: "Navigation Service", name: "Navigation Service", icon: "Navigation", desc: "Turn-by-turn routing and bearing provider.", props: {}, events: ["RouteUpdated"], compose: "NavigationService.calculateRoute(...)" }
    ]
  },
  {
    id: "Camera & Scanning",
    label: "Camera & Scanning",
    items: [
      { type: "Camera Controller", name: "Camera Controller", icon: "Camera", desc: "CameraX photo capture and flash engine.", props: { lensFacing: "back" }, events: ["PictureTaken", "Error"], compose: "imageCapture.takePicture(...)" },
      { type: "Video Recorder", name: "Video Recorder", icon: "Video", desc: "CameraX video recording controller.", props: { quality: "HD" }, events: ["RecordingStarted", "RecordingFinished"], compose: "videoCapture.output.prepareRecording(...)" },
      { type: "Barcode Scanner", name: "Barcode Scanner", icon: "Scan", desc: "1D/2D barcode reader using ML Kit.", props: {}, events: ["BarcodeScanned"], compose: "BarcodeScanning.getClient().process(image)" },
      { type: "QR Scanner", name: "QR Scanner", icon: "QrCode", desc: "QR code scanner and payload parser.", props: {}, events: ["QrScanned"], compose: "BarcodeScanning.getClient().process(image)" },
      { type: "OCR Scanner", name: "OCR Scanner", icon: "FileText", desc: "Optical character recognition text scanner.", props: {}, events: ["TextRecognized"], compose: "TextRecognition.getClient().process(image)" }
    ]
  },
  {
    id: "Audio",
    label: "Audio",
    items: [
      { type: "Audio Player", name: "Audio Player", icon: "Volume2", desc: "Background audio player for streams and MP3s.", props: { url: "", loop: false }, events: ["OnPlay", "OnCompleted", "OnError"], compose: "MediaPlayer.create(context, uri).start()" },
      { type: "Sound Player", name: "Sound Player", icon: "Volume2", desc: "Low-latency SoundPool sound effect player.", props: {}, events: ["SoundLoaded"], compose: "SoundPool.Builder().build().play(...)" },
      { type: "Audio Recorder", name: "Audio Recorder", icon: "Mic", desc: "Microphone voice memo recorder service.", props: { format: "AAC" }, events: ["RecordingStarted", "RecordingStopped"], compose: "MediaRecorder().apply { start() }" },
      { type: "Text To Speech", name: "Text To Speech", icon: "Volume2", desc: "Converts text strings into spoken voice.", props: { pitch: 1.0, speechRate: 1.0 }, events: ["SpeechStarted", "SpeechCompleted"], compose: "TextToSpeech(context) { speak(text) }" },
      { type: "Speech Recognition", name: "Speech Recognition", icon: "Mic", desc: "Converts voice audio into text strings.", props: { language: "en-US" }, events: ["SpeechRecognized", "Error"], compose: "SpeechRecognizer.createSpeechRecognizer(context)" },
      { type: "Audio Manager", name: "Audio Manager", icon: "Volume2", desc: "System volume and ringer mode manager.", props: {}, events: ["VolumeChanged"], compose: "AudioManager.setStreamVolume(...)" }
    ]
  },
  {
    id: "Files & Storage",
    label: "Files & Storage",
    items: [
      { type: "File Manager", name: "File Manager", icon: "FolderOpen", desc: "Local file system reader/writer utility.", props: {}, events: ["FileWritten", "FileRead"], compose: "File(context.filesDir, filename).writeText(...)" },
      { type: "Local Database", name: "Local Database", icon: "Database", desc: "Simple key-value local persistent storage.", props: {}, events: ["DataSaved"], compose: "SharedPreferences.edit().putString(...)" },
      { type: "Key-Value Storage", name: "Key-Value Storage", icon: "HardDrive", desc: "Jetpack DataStore preferences storage.", props: {}, events: ["KeyUpdated"], compose: "dataStore.edit { it[KEY] = value }" },
      { type: "SQLite Database", name: "SQLite Database", icon: "Database", desc: "Embedded SQLite database manager.", props: { dbName: "app_database.db" }, events: ["QueryCompleted", "Error"], compose: "SQLiteOpenHelper(context, name).writableDatabase" },
      { type: "Spreadsheet Manager", name: "Spreadsheet Manager", icon: "Table", desc: "CSV and Excel spreadsheet manager.", props: {}, events: ["RowParsed"], compose: "CSVReader(FileReader(file)).readAll()" },
      { type: "Cloud Database", name: "Cloud Database", icon: "Cloud", desc: "Remote cloud database query manager.", props: {}, events: ["DataFetched"], compose: "CloudDbClient.query(...)" },
      { type: "Cloud Storage", name: "Cloud Storage", icon: "Cloud", desc: "Remote cloud file upload & download manager.", props: {}, events: ["UploadProgress", "Uploaded"], compose: "CloudStorageClient.upload(file)" }
    ]
  },
  {
    id: "Backend Services",
    label: "Backend Services",
    items: [
      { type: "Realtime Database", name: "Realtime Database", icon: "Database", desc: "Firebase Realtime NoSQL database service.", props: { path: "users" }, events: ["DataChanged", "Error"], compose: "FirebaseDatabase.getInstance().getReference(path)" },
      { type: "Document Database", name: "Document Database", icon: "FileText", desc: "Cloud Firestore document database service.", props: { collection: "posts" }, events: ["DocumentFetched", "Error"], compose: "FirebaseFirestore.getInstance().collection(col)" },
      { type: "Authentication Service", name: "Authentication Service", icon: "KeyRound", desc: "Firebase/Custom user authentication service.", props: {}, events: ["UserSignedIn", "SignedOut"], compose: "FirebaseAuth.getInstance().signInWithEmail(...)" },
      { type: "Remote Config", name: "Remote Config", icon: "Settings", desc: "Firebase Remote Config key-value parameters.", props: {}, events: ["ConfigFetched"], compose: "FirebaseRemoteConfig.getInstance().fetchAndActivate()" },
      { type: "Push Messaging", name: "Push Messaging", icon: "Bell", desc: "Firebase Cloud Messaging (FCM) receiver.", props: {}, events: ["MessageReceived", "TokenRefreshed"], compose: "FirebaseMessagingService.onMessageReceived(...)" },
      { type: "Object Storage", name: "Object Storage", icon: "HardDrive", desc: "Firebase Storage binary file manager.", props: {}, events: ["FileUploaded"], compose: "FirebaseStorage.getInstance().reference.child(...)" }
    ]
  },
  {
    id: "Networking",
    label: "Networking",
    items: [
      { type: "Web Request", name: "Web Request", icon: "Globe", desc: "HTTP GET/POST network request sender.", props: { url: "", method: "GET" }, events: ["ResponseReceived", "Error"], compose: "URL(url).readText()" },
      { type: "REST API", name: "REST API", icon: "Globe", desc: "Retrofit REST API client request manager.", props: { baseUrl: "" }, events: ["ApiSuccess", "ApiError"], compose: "Retrofit.Builder().baseUrl(url).build()" },
      { type: "HTTP Client", name: "HTTP Client", icon: "Globe", desc: "OkHttp client for raw HTTP socket calls.", props: {}, events: ["OnResponse"], compose: "OkHttpClient().newCall(request).enqueue(...)" },
      { type: "Download Manager", name: "Download Manager", icon: "Download", desc: "Android system background file downloader.", props: {}, events: ["DownloadCompleted", "Progress"], compose: "DownloadManager.Request(uri)" },
      { type: "Upload Manager", name: "Upload Manager", icon: "Upload", desc: "Background multipart file uploader service.", props: {}, events: ["UploadComplete"], compose: "WorkManager.enqueue(uploadWorkRequest)" },
      { type: "Network Manager", name: "Network Manager", icon: "Wifi", desc: "Monitors Internet connectivity and connection type.", props: {}, events: ["NetworkAvailable", "NetworkLost"], compose: "ConnectivityManager.registerDefaultNetworkCallback(...)" },
      { type: "Wi-Fi Manager", name: "Wi-Fi Manager", icon: "Wifi", desc: "Manages Wi-Fi connections, SSID and RSSI signal.", props: {}, events: ["WifiStateChanged"], compose: "WifiManager.connectionInfo" }
    ]
  },
  {
    id: "Bluetooth & Hardware",
    label: "Bluetooth & Hardware",
    items: [
      { type: "Bluetooth Client", name: "Bluetooth Client", icon: "Bluetooth", desc: "Connects to Bluetooth classic RFCOMM sockets.", props: {}, events: ["Connected", "DataReceived"], compose: "BluetoothDevice.createRfcommSocketToServiceRecord(...)" },
      { type: "Bluetooth Server", name: "Bluetooth Server", icon: "Bluetooth", desc: "Accepts incoming RFCOMM Bluetooth connections.", props: {}, events: ["ClientConnected"], compose: "BluetoothAdapter.listenUsingRfcommWithServiceRecord(...)" },
      { type: "Bluetooth Manager", name: "Bluetooth Manager", icon: "Bluetooth", desc: "Bluetooth Low Energy (BLE) GATT scanner.", props: {}, events: ["DeviceFound", "GattConnected"], compose: "BluetoothLeScanner.startScan(...)" },
      { type: "USB Manager", name: "USB Manager", icon: "Usb", desc: "Communicates with attached USB OTG hardware.", props: {}, events: ["UsbAttached", "UsbDetached"], compose: "UsbManager.accessoryList" },
      { type: "Serial Communication", name: "Serial Communication", icon: "Cpu", desc: "UART serial port communication interface.", props: { baudRate: 9600 }, events: ["DataReceived"], compose: "UsbSerialPort.read(buffer, timeout)" }
    ]
  },
  {
    id: "App / Android System",
    label: "App / Android System",
    items: [
      { type: "Activity Launcher", name: "Activity Launcher", icon: "ExternalLink", desc: "Launches external app intents and activities.", props: { action: "android.intent.action.VIEW" }, events: ["ActivityReturned"], compose: "context.startActivity(intent)" },
      { type: "Package Manager", name: "Package Manager", icon: "Box", desc: "Checks installed app packages and info.", props: {}, events: ["AppInstalled"], compose: "PackageManager.getPackageInfo(...)" },
      { type: "Device Info", name: "Device Info", icon: "Smartphone", desc: "Reads hardware model, Android SDK, and screen resolution.", props: {}, events: [], compose: "Build.MODEL + Build.VERSION.SDK_INT" },
      { type: "Battery Manager", name: "Battery Manager", icon: "Battery", desc: "Monitors battery level, status, and charging state.", props: {}, events: ["BatteryChanged", "ChargingStateChanged"], compose: "BatteryManager.BATTERY_PROPERTY_CAPACITY" },
      { type: "Keyguard Manager", name: "Keyguard Manager", icon: "Lock", desc: "Checks screen lock state and keyguard security.", props: {}, events: ["KeyguardDismissed"], compose: "KeyguardManager.isKeyguardLocked" },
      { type: "Clipboard Manager", name: "Clipboard Manager", icon: "Copy", desc: "Reads and writes text to system clipboard.", props: {}, events: ["PrimaryClipChanged"], compose: "ClipboardManager.setPrimaryClip(...)" },
      { type: "Wallpaper Manager", name: "Wallpaper Manager", icon: "Image", desc: "Sets system home screen or lock screen wallpaper.", props: {}, events: ["WallpaperSet"], compose: "WallpaperManager.getInstance(context).setBitmap(...)" },
      { type: "Notification Manager", name: "Notification Manager", icon: "Bell", desc: "Posts system status bar notifications.", props: {}, events: ["NotificationPosted"], compose: "NotificationManagerCompat.from(context).notify(...)" }
    ]
  },
  {
    id: "Utilities",
    label: "Utilities",
    items: [
      { type: "Clock", name: "Clock", icon: "Clock", desc: "Realtime clock providing timestamp strings.", props: {}, events: ["TimerFired"], compose: "System.currentTimeMillis()" },
      { type: "Timer", name: "Timer", icon: "Clock", desc: "Recurring interval timer controller.", props: { intervalMs: 1000, enabled: true }, events: ["TimerFired"], compose: "Handler(Looper.getMainLooper()).postDelayed(...)" },
      { type: "Color Tools", name: "Color Tools", icon: "Palette", desc: "HEX/RGB color converter and palette tools.", props: {}, events: [], compose: "Color.parseColor(hex)" },
      { type: "Image Tools", name: "Image Tools", icon: "Image", desc: "Bitmap crop, resize, rotate and filter tools.", props: {}, events: ["ImageProcessed"], compose: "Bitmap.createScaledBitmap(...)" },
      { type: "Animation Tools", name: "Animation Tools", icon: "Sparkles", desc: "ValueAnimator and Interpolator utility tools.", props: {}, events: ["AnimationStep"], compose: "ValueAnimator.ofFloat(0f, 1f).start()" },
      { type: "Encryption Tools", name: "Encryption Tools", icon: "Lock", desc: "AES-256 and SHA-256 cryptographic tools.", props: {}, events: [], compose: "Cipher.getInstance('AES/CBC/PKCS5Padding')" },
      { type: "Screenshot Tool", name: "Screenshot Tool", icon: "Camera", desc: "Captures screen content bitmap image.", props: {}, events: ["ScreenshotTaken"], compose: "PixelCopy.request(window, bitmap, listener, handler)" },
      { type: "Resource Manager", name: "Resource Manager", icon: "FolderOpen", desc: "Reads app assets and raw resource files.", props: {}, events: [], compose: "context.assets.open(filename)" },
      { type: "Decoration Manager", name: "Decoration Manager", icon: "Sparkles", desc: "UI visual style decoration manager.", props: {}, events: [], compose: "Modifier.border(...).shadow(...)" }
    ]
  },
  {
    id: "Dialogs & Messages",
    label: "Dialogs & Messages",
    items: [
      { type: "Alert Dialog", name: "Alert Dialog", icon: "AlertCircle", desc: "Modal alert dialog popup view.", props: { title: "Alert", message: "Message body" }, events: ["Confirm", "Dismiss"], compose: "AlertDialog(onDismissRequest = {}, confirmButton = {})" },
      { type: "Toast Message", name: "Toast Message", icon: "MessageSquare", desc: "Short system toast overlay message.", props: { message: "Action performed!" }, events: [], compose: "Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()" },
      { type: "Snackbar Controller", name: "Snackbar Controller", icon: "MessageSquare", desc: "Material 3 snackbar controller with action button.", props: { message: "Item deleted", actionLabel: "UNDO" }, events: ["ActionClicked", "Dismissed"], compose: "SnackbarHostState.showSnackbar(msg, action)" },
      { type: "Bottom Sheet Controller", name: "Bottom Sheet Controller", icon: "Sheet", desc: "Modal bottom sheet dialog manager.", props: { title: "Sheet Options" }, events: ["OnDismiss", "OnSelect"], compose: "ModalBottomSheet(onDismissRequest = {})" },
      { type: "Spotlight Controller", name: "Spotlight Controller", icon: "Sun", desc: "App feature highlight coach mark spotlight.", props: { title: "Feature Spotlight" }, events: ["SpotlightDismissed"], compose: "SpotlightView.showForTarget(view)" }
    ]
  },
  {
    id: "Social & Communication",
    label: "Social & Communication",
    items: [
      { type: "Phone Call", name: "Phone Call", icon: "Phone", desc: "Initiates phone call to given phone number.", props: { phoneNumber: "" }, events: ["CallStarted"], compose: "context.startActivity(Intent(Intent.ACTION_CALL, Uri.parse('tel:' + num)))" },
      { type: "SMS Manager", name: "SMS Manager", icon: "Send", desc: "Sends SMS text message to contact number.", props: { phoneNumber: "", message: "" }, events: ["SmsSent", "SmsDelivered"], compose: "SmsManager.getDefault().sendTextMessage(...)" },
      { type: "Share Manager", name: "Share Manager", icon: "Share2", desc: "Invokes system share chooser for text and media.", props: { text: "Share link" }, events: ["ShareComplete"], compose: "context.startActivity(Intent.createChooser(intent, null))" },
      { type: "Email Sender", name: "Email Sender", icon: "Mail", desc: "Composes and dispatches email message.", props: { recipient: "", subject: "", body: "" }, events: ["EmailDispatched"], compose: "context.startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse('mailto:')))" }
    ]
  },
  {
    id: "Accounts & Login",
    label: "Accounts & Login",
    items: [
      { type: "Account Picker", name: "Account Picker", icon: "Users", desc: "System device account picker manager.", props: {}, events: ["AccountPicked"], compose: "AccountManager.get(context).newChooseAccountIntent(...)" },
      { type: "OAuth Login", name: "OAuth Login", icon: "KeyRound", desc: "Generic OAuth 2.0 authentication flow manager.", props: { providerUrl: "" }, events: ["AuthSuccess", "AuthFailed"], compose: "OAuthClient.authenticate(...)" },
      { type: "Google Login", name: "Google Login", icon: "Users", desc: "Google Credential Manager One Tap sign in.", props: {}, events: ["SignedIn", "Error"], compose: "CredentialManager.create(context).getCredential(...)" },
      { type: "Phone Login", name: "Phone Login", icon: "Phone", desc: "SMS OTP phone number authentication manager.", props: {}, events: ["OtpSent", "Verified"], compose: "PhoneAuthProvider.getInstance().verifyPhoneNumber(...)" },
      { type: "Email Login", name: "Email Login", icon: "Mail", desc: "Email/Password sign in & registration manager.", props: {}, events: ["LoggedIn", "Registered"], compose: "AuthClient.signInWithEmail(email, password)" }
    ]
  },
  {
    id: "Cloud / Modern Backend",
    label: "Cloud / Modern Backend",
    items: [
      { type: "Supabase Authentication", name: "Supabase Authentication", icon: "KeyRound", desc: "Supabase Auth login, signup & session manager.", props: { supabaseUrl: "", anonKey: "" }, events: ["AuthSuccess", "SignedOut"], compose: "supabase.auth.signInWith(Email)" },
      { type: "Supabase Database", name: "Supabase Database", icon: "Database", desc: "Supabase PostgREST database query manager.", props: { tableName: "users" }, events: ["DataFetched", "Inserted"], compose: "supabase.from(table).select()" },
      { type: "Supabase Storage", name: "Supabase Storage", icon: "HardDrive", desc: "Supabase Bucket object storage manager.", props: { bucketName: "avatars" }, events: ["Uploaded", "Deleted"], compose: "supabase.storage.from(bucket).upload(...)" }
    ]
  },
  {
    id: "Payments",
    label: "Payments",
    items: [
      { type: "In-App Purchase", name: "In-App Purchase", icon: "DollarSign", desc: "Google Play Billing in-app purchase manager.", props: { productId: "premium_unlock" }, events: ["Purchased", "PurchaseFailed"], compose: "billingClient.launchBillingFlow(activity, flowParams)" },
      { type: "Subscription Manager", name: "Subscription Manager", icon: "ShoppingBag", desc: "Google Play recurring subscription manager.", props: { subscriptionId: "monthly_sub" }, events: ["SubscriptionActive", "Cancelled"], compose: "billingClient.queryPurchasesAsync(...)" },
      { type: "Billing Manager", name: "Billing Manager", icon: "CreditCard", desc: "Unified payment gateway billing manager.", props: {}, events: ["PaymentSuccess"], compose: "BillingClient.connect(...)" }
    ]
  },
  {
    id: "Advertising Logic",
    label: "Advertising Logic",
    items: [
      { type: "Interstitial Ad", name: "Interstitial Ad", icon: "Tag", desc: "Full-screen AdMob interstitial advertisement.", props: { adUnitId: "ca-app-pub-3940256099942544/1033173712" }, events: ["AdLoaded", "AdDismissed", "AdFailed"], compose: "InterstitialAd.load(context, adUnitId, request, callback)" },
      { type: "Rewarded Ad", name: "Rewarded Ad", icon: "Tag", desc: "AdMob rewarded video ad with user reward callback.", props: { adUnitId: "ca-app-pub-3940256099942544/5224354917" }, events: ["UserRewarded", "AdClosed"], compose: "RewardedAd.load(context, adUnitId, request, callback)" },
      { type: "App Open Ad", name: "App Open Ad", icon: "Tag", desc: "AdMob app open advertisement upon launch.", props: { adUnitId: "ca-app-pub-3940256099942544/3419835294" }, events: ["AdShowed"], compose: "AppOpenAd.load(context, adUnitId, request, callback)" },
      { type: "Rewarded Interstitial", name: "Rewarded Interstitial", icon: "Tag", desc: "Rewarded interstitial ad for high yield.", props: { adUnitId: "ca-app-pub-3940256099942544/5354046379" }, events: ["UserRewarded"], compose: "RewardedInterstitialAd.load(...)" }
    ]
  },
  {
    id: "App Updates",
    label: "App Updates",
    items: [
      { type: "In-App Update", name: "In-App Update", icon: "Download", desc: "Google Play App Update API controller.", props: {}, events: ["UpdateAvailable", "UpdateDownloaded"], compose: "appUpdateManager.appUpdateInfo.addOnSuccessListener(...)" },
      { type: "App Review", name: "App Review", icon: "Star", desc: "Google Play In-App Review flow prompt manager.", props: {}, events: ["ReviewCompleted"], compose: "reviewManager.requestReviewFlow()" },
      { type: "Version Checker", name: "Version Checker", icon: "ShieldCheck", desc: "Checks remote API server for mandatory app update version.", props: {}, events: ["NewVersionFound"], compose: "VersionChecker.checkLatestVersion()" }
    ]
  },
  {
    id: "Security",
    label: "Security",
    items: [
      { type: "Biometric Authentication", name: "Biometric Authentication", icon: "ShieldCheck", desc: "Fingerprint & Face ID biometric unlock manager.", props: { title: "Biometric Unlock" }, events: ["AuthSucceeded", "AuthFailed"], compose: "BiometricPrompt(activity, executor, callback).authenticate(promptInfo)" },
      { type: "CAPTCHA", name: "CAPTCHA", icon: "ShieldCheck", desc: "Google reCAPTCHA / SafetyNet bot protection.", props: { siteKey: "" }, events: ["CaptchaPassed"], compose: "SafetyNet.getClient(context).verifyWithRecaptcha(siteKey)" },
      { type: "App Integrity Check", name: "App Integrity Check", icon: "ShieldCheck", desc: "Google Play Integrity API tampered app detector.", props: {}, events: ["IntegrityVerified"], compose: "PlayIntegrityManager.requestIntegrityToken()" },
      { type: "Encryption Manager", name: "Encryption Manager", icon: "Lock", desc: "Android KeyStore encrypted hardware vault.", props: {}, events: ["Encrypted", "Decrypted"], compose: "EncryptedSharedPreferences.create(...)" }
    ]
  },
  {
    id: "Notifications",
    label: "Notifications",
    items: [
      { type: "Local Notifications", name: "Local Notifications", icon: "Bell", desc: "Schedules local alarm and status bar notifications.", props: { title: "Reminder", message: "Scheduled alert" }, events: ["NotificationFired"], compose: "NotificationManagerCompat.notify(id, notification)" },
      { type: "Push Notifications", name: "Push Notifications", icon: "Bell", desc: "FCM / OneSignal push notification receiver.", props: {}, events: ["PushReceived"], compose: "PushNotificationService.onMessageReceived(...)" },
      { type: "Notification Channels", name: "Notification Channels", icon: "Bell", desc: "Creates Android 8+ notification channel categories.", props: { channelId: "default", channelName: "General" }, events: [], compose: "NotificationChannel(id, name, importance)" },
      { type: "Notification Badge", name: "Notification Badge", icon: "Bell", desc: "Sets launcher app icon unread badge count.", props: { badgeCount: 1 }, events: [], compose: "ShortcutBadger.applyCount(context, count)" }
    ]
  },
  {
    id: "Dynamic Components",
    label: "Dynamic Components",
    items: [
      { type: "Dynamic Component Manager", name: "Dynamic Component Manager", icon: "Layers", desc: "Creates and destroys UI components dynamically at runtime.", props: {}, events: ["ComponentCreated", "ComponentRemoved"], compose: "DynamicComponentManager.create(type, parent)" },
      { type: "Dynamic UI Creator", name: "Dynamic UI Creator", icon: "Layers", desc: "Parses JSON schemas to render entire dynamic forms.", props: { schemaJson: "{}" }, events: ["FormSubmitted"], compose: "DynamicUiCreator.inflateJson(json, parent)" }
    ]
  },
  {
    id: "Advanced System",
    label: "Advanced System",
    items: [
      { type: "Shell Executor", name: "Shell Executor", icon: "Terminal", desc: "Executes shell commands on rooted/system devices.", props: { command: "ls" }, events: ["CommandExecuted"], compose: "Runtime.getRuntime().exec(command)" },
      { type: "Intent Manager", name: "Intent Manager", icon: "ExternalLink", desc: "Constructs custom Android implicit and explicit intents.", props: {}, events: ["IntentFired"], compose: "context.startActivity(Intent(...))" },
      { type: "Shortcut Manager", name: "Shortcut Manager", icon: "Sparkles", desc: "Manages Android launcher app shortcuts.", props: {}, events: ["ShortcutClicked"], compose: "ShortcutManager.setDynamicShortcuts(...)" },
      { type: "Metadata Reader", name: "Metadata Reader", icon: "FileText", desc: "Reads manifest meta-data tags and EXIF data.", props: {}, events: ["MetadataRead"], compose: "packageManager.getApplicationInfo().metaData" }
    ]
  }
];

let tsContent = `import { ComponentCategory, AndroidComponent } from "../types";

export interface ComponentDefinition {
  type: string;
  name: string;
  category: ComponentCategory;
  iconName: string;
  description: string;
  isContainer: boolean;
  isVisible: boolean;
  defaultProps: Record<string, any>;
  supportedEvents: string[];
  usageExplanation: string;
  bestScenarios: string;
  composeEquivalent: string;
}

export const VISIBLE_CATEGORIES: { id: ComponentCategory; label: string }[] = [
`;

visibleCategories.forEach(cat => {
  tsContent += `  { id: "${cat.id}" as ComponentCategory, label: "${cat.label}" },\n`;
});

tsContent += `];

export const NON_VISIBLE_CATEGORIES: { id: ComponentCategory; label: string }[] = [
`;

nonVisibleCategories.forEach(cat => {
  tsContent += `  { id: "${cat.id}" as ComponentCategory, label: "${cat.label}" },\n`;
});

tsContent += `];

export const ALL_CATEGORIES = [...VISIBLE_CATEGORIES, ...NON_VISIBLE_CATEGORIES];

export function isNonVisibleCategory(category: string): boolean {
  return NON_VISIBLE_CATEGORIES.some(c => c.id === category);
}

export function isNonVisibleComponent(typeOrDef: string | ComponentDefinition): boolean {
  if (typeof typeOrDef !== "string") {
    if (typeOrDef.isVisible !== undefined) return !typeOrDef.isVisible;
    typeOrDef = typeOrDef.type;
  }
  const def = COMPONENT_DEFINITIONS.find(c => c.type === typeOrDef || c.name === typeOrDef);
  if (def && def.isVisible !== undefined) return !def.isVisible;
  if (def) return isNonVisibleCategory(def.category);
  return false;
}

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [\n`;

function formatItem(item, catId, isVis) {
  const isCont = !!item.isContainer;
  const defProps = JSON.stringify(item.props || {});
  const evts = JSON.stringify(item.events || []);
  const usage = (item.desc || "") + " Built for production Android applications.";
  const best = "Ideal for " + (item.name || item.type) + " interactions and Android feature implementations.";
  const comp = item.compose || "// Jetpack Compose implementation";
  return `  {
    type: ${JSON.stringify(item.type)},
    name: ${JSON.stringify(item.name)},
    category: ${JSON.stringify(catId)} as ComponentCategory,
    iconName: ${JSON.stringify(item.icon)},
    description: ${JSON.stringify(item.desc)},
    isContainer: ${isCont},
    isVisible: ${isVis},
    defaultProps: ${defProps},
    supportedEvents: ${evts},
    usageExplanation: ${JSON.stringify(usage)},
    bestScenarios: ${JSON.stringify(best)},
    composeEquivalent: ${JSON.stringify(comp)},
  }`;
}

visibleCategories.forEach(cat => {
  cat.items.forEach(item => {
    tsContent += formatItem(item, cat.id, true) + ",\n";
  });
});

nonVisibleCategories.forEach(cat => {
  cat.items.forEach(item => {
    tsContent += formatItem(item, cat.id, false) + ",\n";
  });
});

tsContent += `];

export function createComponentInstance(type: string): AndroidComponent {
  const def = COMPONENT_DEFINITIONS.find((c) => c.type === type || c.name === type) || COMPONENT_DEFINITIONS[0];
  const uniqueId = \`comp_\${def.type.toLowerCase().replace(/[^a-z0-9]/g, "_")}_\${Math.random().toString(36).substring(2, 7)}\`;
  const cleanName = \`\${def.name.replace(/[^a-zA-Z0-9]/g, "")}\${Math.floor(100 + Math.random() * 900)}\`;

  return {
    id: uniqueId,
    type: def.type,
    name: cleanName,
    category: def.category,
    props: { ...def.defaultProps },
    children: def.isContainer ? [] : undefined,
  };
}
`;

fs.writeFileSync(path.join(__dirname, '../src/data/componentRegistry.ts'), tsContent, 'utf8');
console.log('Successfully generated componentRegistry.ts with ' + (visibleCategories.reduce((acc, c) => acc + c.items.length, 0) + nonVisibleCategories.reduce((acc, c) => acc + c.items.length, 0)) + ' components!');
