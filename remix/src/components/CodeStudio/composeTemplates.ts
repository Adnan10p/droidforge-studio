export interface ComposeTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  filename: string;
  code: string;
}

export const COMPOSE_TEMPLATES: ComposeTemplate[] = [
  {
    id: "login-auth",
    name: "Authentication & Login",
    category: "Auth",
    description: "Email & Password login form with validation, navigation to HomeScreen, and remember me state.",
    filename: "LoginScreen.kt",
    code: `@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    viewModel: LoginScreenViewModel = viewModel(),
    onNavigateBack: () -> Unit = {},
    onNavigateTo: (String) -> Unit = {}
) {
    var emailState by remember { mutableStateOf("user@droidforge.dev") }
    var passwordState by remember { mutableStateOf("secret123") }
    var rememberMeState by remember { mutableStateOf(true) }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = Color(android.graphics.Color.parseColor("#0F172A")),
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(text = "Welcome Back", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = Color(android.graphics.Color.parseColor("#1E293B")),
                    titleContentColor = Color.White
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            ElevatedCard(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.elevatedCardColors(
                    containerColor = Color(android.graphics.Color.parseColor("#1E293B"))
                ),
                elevation = CardDefaults.elevatedCardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Sign in to your account",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Text(
                        text = "Enter your credentials to access cloud workspace",
                        fontSize = 13.sp,
                        color = Color(android.graphics.Color.parseColor("#94A3B8"))
                    )

                    OutlinedTextField(
                        value = emailState,
                        onValueChange = { emailState = it },
                        label = { Text("Email address") },
                        placeholder = { Text("name@domain.com") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = passwordState,
                        onValueChange = { passwordState = it },
                        label = { Text("Password") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = rememberMeState,
                            onCheckedChange = { rememberMeState = it }
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Keep me signed in on this device",
                            color = Color(android.graphics.Color.parseColor("#CBD5E1")),
                            fontSize = 14.sp
                        )
                    }

                    Button(
                        onClick = {
                            Toast.makeText(context, "Sign In Successful! Welcome back", Toast.LENGTH_SHORT).show()
                            onNavigateTo("HomeScreen")
                        },
                        modifier = Modifier.fillMaxWidth().height(50.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(android.graphics.Color.parseColor("#4F46E5"))
                        )
                    ) {
                        Text(text = "Sign In Now", fontWeight = FontWeight.Bold)
                    }
                }
            }

            TextButton(
                onClick = {
                    Toast.makeText(context, "Password reset instructions sent to your email.", Toast.LENGTH_LONG).show()
                }
            ) {
                Text(
                    text = "Forgot password? Request Reset",
                    color = Color(android.graphics.Color.parseColor("#818CF8"))
                )
            }

            OutlinedButton(
                onClick = {
                    onNavigateTo("RegisterScreen")
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(text = "Don't have an account? Sign Up", color = Color.White)
            }
        }
    }
}`,
  },
  {
    id: "product-commerce",
    name: "E-Commerce Product Detail",
    category: "Commerce",
    description: "Product showcase with high-res image, price tag, quantity counter, and Add to Cart action.",
    filename: "ProductDetailScreen.kt",
    code: `@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    viewModel: ProductDetailScreenViewModel = viewModel(),
    onNavigateBack: () -> Unit = {},
    onNavigateTo: (String) -> Unit = {}
) {
    var quantity by remember { mutableIntStateOf(1) }
    var selectedColor by remember { mutableStateOf("Midnight Black") }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = Color(android.graphics.Color.parseColor("#F8FAFC")),
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(text = "Pro Studio Headphones", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = Color(android.graphics.Color.parseColor("#0F172A")),
                    titleContentColor = Color.White
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            AsyncImage(
                model = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
                contentDescription = "Wireless Noise-Cancelling Headphones",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(220.dp)
                    .clip(RoundedCornerShape(18.dp))
            )

            ElevatedCard(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.elevatedCardColors(containerColor = Color.White)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "Wireless Noise-Canceling ANC Headset",
                        fontSize = 19.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(android.graphics.Color.parseColor("#0F172A"))
                    )

                    Text(
                        text = "Experience rich acoustic acoustics with 40mm titanium drivers and 48-hour ultra long battery life.",
                        fontSize = 14.sp,
                        color = Color(android.graphics.Color.parseColor("#64748B"))
                    )

                    Text(
                        text = "$299.99 USD",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(android.graphics.Color.parseColor("#059669"))
                    )
                }
            }

            ElevatedCard(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.elevatedCardColors(containerColor = Color.White)
            ) {
                Row(
                    modifier = Modifier.padding(14.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Quantity", fontWeight = FontWeight.SemiBold, fontSize = 15.sp)

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = { quantity-- },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(android.graphics.Color.parseColor("#E2E8F0")))
                        ) {
                            Text(text = "-", color = Color.Black, fontWeight = FontWeight.Bold)
                        }

                        Text(text = "$quantity", fontSize = 16.sp, fontWeight = FontWeight.Bold)

                        Button(
                            onClick = { quantity++ },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(android.graphics.Color.parseColor("#E2E8F0")))
                        ) {
                            Text(text = "+", color = Color.Black, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            Button(
                onClick = {
                    Toast.makeText(context, "Added $quantity item(s) to Cart!", Toast.LENGTH_SHORT).show()
                    onNavigateTo("CartScreen")
                },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(android.graphics.Color.parseColor("#2563EB"))
                )
            ) {
                Text(text = "Add to Cart - $299.99", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}`,
  },
  {
    id: "settings-prefs",
    name: "Settings & System Controls",
    category: "System",
    description: "App configuration screen with Dark Mode switch, notifications toggle, and cache clear action.",
    filename: "SettingsScreen.kt",
    code: `@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: SettingsScreenViewModel = viewModel(),
    onNavigateBack: () -> Unit = {},
    onNavigateTo: (String) -> Unit = {}
) {
    var darkModeEnabled by remember { mutableStateOf(true) }
    var pushNotifications by remember { mutableStateOf(true) }
    var offlineSync by remember { mutableStateOf(false) }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = Color(android.graphics.Color.parseColor("#0F172A")),
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(text = "Settings & Preferences", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = Color(android.graphics.Color.parseColor("#1E293B")),
                    titleContentColor = Color.White
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            ElevatedCard(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.elevatedCardColors(
                    containerColor = Color(android.graphics.Color.parseColor("#1E293B"))
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Display & Visuals",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Dark Theme Mode", color = Color(android.graphics.Color.parseColor("#CBD5E1")))
                        Switch(
                            checked = darkModeEnabled,
                            onCheckedChange = { darkModeEnabled = it }
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Real-Time Push Notifications", color = Color(android.graphics.Color.parseColor("#CBD5E1")))
                        Switch(
                            checked = pushNotifications,
                            onCheckedChange = { pushNotifications = it }
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Offline Local Cache Sync", color = Color(android.graphics.Color.parseColor("#CBD5E1")))
                        Switch(
                            checked = offlineSync,
                            onCheckedChange = { offlineSync = it }
                        )
                    }
                }
            }

            Button(
                onClick = {
                    Toast.makeText(context, "Local app cache and temporary assets wiped successfully.", Toast.LENGTH_SHORT).show()
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(android.graphics.Color.parseColor("#DC2626"))
                )
            ) {
                Text(text = "Clear Local Data & Cache", fontWeight = FontWeight.SemiBold)
            }

            Button(
                onClick = {
                    onNavigateBack()
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(android.graphics.Color.parseColor("#334155"))
                )
            ) {
                Text(text = "Save & Return", fontWeight = FontWeight.SemiBold)
            }
        }
    }
}`,
  },
  {
    id: "counter-app",
    name: "Interactive Counter & State",
    category: "Utility",
    description: "State-driven tally counter with Increment, Decrement, and Reset logic blocks.",
    filename: "CounterScreen.kt",
    code: `@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CounterScreen(
    viewModel: CounterScreenViewModel = viewModel(),
    onNavigateBack: () -> Unit = {},
    onNavigateTo: (String) -> Unit = {}
) {
    var counterValue by remember { mutableIntStateOf(0) }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = Color(android.graphics.Color.parseColor("#0F172A")),
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(text = "Interactive Tally", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = Color(android.graphics.Color.parseColor("#1E293B")),
                    titleContentColor = Color.White
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            ElevatedCard(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.elevatedCardColors(
                    containerColor = Color(android.graphics.Color.parseColor("#1E293B"))
                ),
                elevation = CardDefaults.elevatedCardElevation(defaultElevation = 8.dp)
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "Current Tally Count",
                        fontSize = 16.sp,
                        color = Color(android.graphics.Color.parseColor("#94A3B8"))
                    )

                    Text(
                        text = "$counterValue",
                        fontSize = 64.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(android.graphics.Color.parseColor("#60A5FA"))
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Button(
                            onClick = {
                                counterValue--
                                Toast.makeText(context, "Decremented: $counterValue", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier.weight(1f).height(56.dp),
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(android.graphics.Color.parseColor("#EF4444"))
                            )
                        ) {
                            Text(text = "- Minus", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        }

                        Button(
                            onClick = {
                                counterValue++
                                Toast.makeText(context, "Incremented: $counterValue", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier.weight(1f).height(56.dp),
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(android.graphics.Color.parseColor("#10B981"))
                            )
                        ) {
                            Text(text = "+ Plus", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Button(
                        onClick = {
                            counterValue = 0
                            Toast.makeText(context, "Counter reset to zero", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier.fillMaxWidth().height(44.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(android.graphics.Color.parseColor("#334155"))
                        )
                    ) {
                        Text(text = "Reset Counter", color = Color.White)
                    }
                }
            }
        }
    }
}`,
  },
  {
    id: "user-profile",
    name: "User Account & Profile",
    category: "Profile",
    description: "Account summary screen with avatar, personal bio, contact info, and edit action.",
    filename: "ProfileScreen.kt",
    code: `@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    viewModel: ProfileScreenViewModel = viewModel(),
    onNavigateBack: () -> Unit = {},
    onNavigateTo: (String) -> Unit = {}
) {
    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = Color(android.graphics.Color.parseColor("#F1F5F9")),
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(text = "My Profile", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = Color(android.graphics.Color.parseColor("#0F172A")),
                    titleContentColor = Color.White
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            AsyncImage(
                model = "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
                contentDescription = "User Avatar",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(110.dp)
                    .clip(CircleShape)
            )

            Text(
                text = "Alex Developer",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color(android.graphics.Color.parseColor("#0F172A"))
            )

            Text(
                text = "Lead Android Architect & Compose Specialist",
                fontSize = 14.sp,
                color = Color(android.graphics.Color.parseColor("#64748B"))
            )

            ElevatedCard(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.elevatedCardColors(containerColor = Color.White)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(text = "Email: alex@droidforge.ai", fontSize = 15.sp)
                    HorizontalDivider()
                    Text(text = "Location: San Francisco, CA", fontSize = 15.sp)
                    HorizontalDivider()
                    Text(text = "Tier: Pro Developer Access", fontSize = 15.sp, color = Color(android.graphics.Color.parseColor("#4F46E5")), fontWeight = FontWeight.Bold)
                }
            }

            Button(
                onClick = {
                    Toast.makeText(context, "Profile edit opened", Toast.LENGTH_SHORT).show()
                    onNavigateTo("EditProfileScreen")
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(android.graphics.Color.parseColor("#2563EB"))
                )
            ) {
                Text(text = "Edit Profile Details", fontWeight = FontWeight.SemiBold)
            }

            Button(
                onClick = {
                    Toast.makeText(context, "Logged out successfully", Toast.LENGTH_SHORT).show()
                    onNavigateTo("LoginScreen")
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(android.graphics.Color.parseColor("#EF4444"))
                )
            ) {
                Text(text = "Sign Out", fontWeight = FontWeight.SemiBold)
            }
        }
    }
}`,
  },
  {
    id: "youtube-streamer",
    name: "YouTube Video Streamer (Paste & Play)",
    category: "Media",
    description: "Top dynamic button (Paste from clipboard -> Play video), URL input field, and embedded YouTube player.",
    filename: "YouTubePlayerScreen.kt",
    code: `@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun YouTubePlayerScreen(
    onNavigateBack: () -> Unit = {},
    onNavigateTo: (String) -> Unit = {}
) {
    val clipboardManager = LocalClipboardManager.current
    val context = LocalContext.current

    var videoUrl by remember { mutableStateOf("https://www.youtube.com/watch?v=dQw4w9WgXcQ") }
    var isPasteMode by remember { mutableStateOf(true) }
    var activeEmbedUrl by remember { mutableStateOf("https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1") }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = Color(android.graphics.Color.parseColor("#0F172A")),
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(text = "YouTube Player", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = Color(android.graphics.Color.parseColor("#1E293B")),
                    titleContentColor = Color.White
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Button(
                onClick = {
                    if (isPasteMode) {
                        val clip = clipboardManager.getText()?.text
                        if (!clip.isNullOrBlank()) {
                            videoUrl = clip
                            isPasteMode = false
                            Toast.makeText(context, "Link Pasted! Tap Play to stream.", Toast.LENGTH_SHORT).show()
                        }
                    } else {
                        val vid = if (videoUrl.contains("v=")) videoUrl.substringAfter("v=").substringBefore("&") else videoUrl.substringAfterLast("/")
                        activeEmbedUrl = "https://www.youtube.com/embed/$vid?autoplay=1"
                        Toast.makeText(context, "Streaming YouTube video...", Toast.LENGTH_SHORT).show()
                    }
                },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(android.graphics.Color.parseColor("#6366F1"))
                )
            ) {
                Text(text = "Paste Link from Clipboard", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }

            OutlinedTextField(
                value = videoUrl,
                onValueChange = {
                    videoUrl = it
                    if (it.isEmpty()) isPasteMode = true
                },
                label = { Text("YouTube Video URL") },
                placeholder = { Text("https://www.youtube.com/watch?v=...") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            ElevatedCard(
                modifier = Modifier.fillMaxWidth().height(260.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.elevatedCardColors(containerColor = Color.Black)
            ) {
                AndroidView(
                    modifier = Modifier.fillMaxSize(),
                    factory = { ctx ->
                        WebView(ctx).apply {
                            settings.javaScriptEnabled = true
                            settings.domStorageEnabled = true
                            webViewClient = WebViewClient()
                            loadUrl(activeEmbedUrl)
                        }
                    }
                )
            }
        }
    }
}`,
  },
];
