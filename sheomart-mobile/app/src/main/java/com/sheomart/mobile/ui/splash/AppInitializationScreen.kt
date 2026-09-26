package com.sheomart.mobile.ui.splash

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.R
import com.sheomart.mobile.ui.components.PrimaryButton
import com.sheomart.mobile.ui.theme.*

/**
 * Production Splash & App Initialization Screen for SheoMart Mobile.
 *
 * Provides a grocery marketplace startup experience (similar to Blinkit / Zepto / Swiggy Instamart)
 * that absorbs Render backend cold start latency with animations, dynamic status updates,
 * and reliable role-based navigation.
 */
@Composable
fun AppInitializationScreen(
    viewModel: AppInitViewModel,
    onInitialized: (destinationRoute: String) -> Unit,
) {
    var hasNavigated by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        viewModel.startInitialization()
    }

    val state = viewModel.state

    LaunchedEffect(state) {
        if (state is InitState.Completed && !hasNavigated) {
            hasNavigated = true
            onInitialized(state.destinationRoute)
        }
    }

    // Logo entrance spring animation
    val scaleAnim = remember { Animatable(0.65f) }
    val alphaAnim = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        scaleAnim.animateTo(
            targetValue = 1f,
            animationSpec = spring(
                dampingRatio = Spring.DampingRatioMediumBouncy,
                stiffness = Spring.StiffnessLow
            )
        )
    }
    LaunchedEffect(Unit) {
        alphaAnim.animateTo(
            targetValue = 1f,
            animationSpec = tween(durationMillis = 700, easing = FastOutSlowInEasing)
        )
    }

    // Gentle breathing pulse loop for the brand emblem
    val infiniteTransition = rememberInfiniteTransition(label = "BrandBreathing")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1.0f,
        targetValue = 1.035f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "PulseScale"
    )

    Scaffold(
        containerColor = Background,
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = 24.dp, vertical = 20.dp),
        ) {
            // Main Centered Content
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .align(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                // Branded Emblem with Glow Ring
                Box(
                    modifier = Modifier
                        .scale(scaleAnim.value * pulseScale)
                        .alpha(alphaAnim.value)
                        .size(116.dp)
                        .shadow(elevation = 12.dp, shape = CircleShape, spotColor = PrimaryGreen.copy(alpha = 0.25f))
                        .clip(CircleShape)
                        .background(
                            brush = Brush.radialGradient(
                                colors = listOf(Color.White, Surface)
                            )
                        )
                        .border(2.5.dp, PrimaryGreen.copy(alpha = 0.35f), CircleShape)
                        .padding(20.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Image(
                        painter = painterResource(R.drawable.appicon),
                        contentDescription = "SheoMart Logo",
                        modifier = Modifier.fillMaxSize(),
                    )
                }

                Spacer(Modifier.height(26.dp))

                // Brand Title with Accent
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "Welcome to SheoMart",
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontSize = 26.sp,
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = (-0.5).sp
                        ),
                        color = PrimaryText,
                        textAlign = TextAlign.Center,
                    )
                }

                Spacer(Modifier.height(6.dp))

                // Subtitle
                Text(
                    text = "Your Local Grocery Marketplace.",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Normal
                    ),
                    color = SecondaryText,
                    textAlign = TextAlign.Center,
                )

                Spacer(Modifier.height(14.dp))

                // Feature Pill Badge
                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = PrimaryGreen.copy(alpha = 0.08f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, PrimaryGreen.copy(alpha = 0.2f)),
                ) {
                    Text(
                        text = "FRESH GROCERIES  •  LOCAL STORES  •  QUICK DELIVERY",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontSize = 9.5.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.8.sp
                        ),
                        color = PrimaryGreen,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                    )
                }

                Spacer(Modifier.height(44.dp))

                when (state) {
                    is InitState.Initializing, is InitState.Retrying -> {
                        // Animated Loading Wave
                        PulsingLoadingDots()

                        Spacer(Modifier.height(18.dp))

                        // Dynamic Animated Status Message Transition
                        AnimatedContent(
                            targetState = viewModel.statusText,
                            transitionSpec = {
                                (fadeIn(animationSpec = tween(350)) + slideInVertically { it / 2 })
                                    .togetherWith(fadeOut(animationSpec = tween(250)) + slideOutVertically { -it / 2 })
                            },
                            label = "StatusTextTransition",
                        ) { text ->
                            Text(
                                text = text,
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    fontWeight = FontWeight.Medium,
                                    fontSize = 13.5.sp
                                ),
                                color = PrimaryGreen,
                                textAlign = TextAlign.Center,
                            )
                        }
                    }

                    is InitState.NoInternet, is InitState.ServerError -> {
                        // Retry Card
                        RetryCard(
                            isNoInternet = state is InitState.NoInternet,
                            onRetry = { viewModel.retry() },
                        )
                    }

                    is InitState.Completed -> {
                        PulsingLoadingDots()
                    }
                }
            }

            // Bottom Footer
            Column(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    text = "Made for Sheopur ❤️",
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 12.sp
                    ),
                    color = SecondaryText.copy(alpha = 0.85f),
                    textAlign = TextAlign.Center,
                )
            }
        }
    }
}

/**
 * Animated three pulsing/bouncing dots with staggered phases.
 */
@Composable
private fun PulsingLoadingDots() {
    val infiniteTransition = rememberInfiniteTransition(label = "LoadingDots")

    val dot1 by infiniteTransition.animateFloat(
        initialValue = 0.25f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 550, delayMillis = 0, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "DotAlpha0",
    )
    val dot2 by infiniteTransition.animateFloat(
        initialValue = 0.25f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 550, delayMillis = 180, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "DotAlpha180",
    )
    val dot3 by infiniteTransition.animateFloat(
        initialValue = 0.25f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 550, delayMillis = 360, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "DotAlpha360",
    )

    Row(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .alpha(dot1)
                .clip(CircleShape)
                .background(PrimaryGreen),
        )
        Box(
            modifier = Modifier
                .size(10.dp)
                .alpha(dot2)
                .clip(CircleShape)
                .background(PrimaryGreen),
        )
        Box(
            modifier = Modifier
                .size(10.dp)
                .alpha(dot3)
                .clip(CircleShape)
                .background(PrimaryGreen),
        )
    }
}

/**
 * Material 3 Retry Card displayed when backend cold-start limit is exceeded or device has no network.
 */
@Composable
private fun RetryCard(
    isNoInternet: Boolean,
    onRetry: () -> Unit,
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 4.dp),
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(22.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                text = if (isNoInternet) "No Internet Connection" else "Connecting to Server",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = PrimaryText,
            )

            Spacer(Modifier.height(6.dp))

            Text(
                text = if (isNoInternet) {
                    "Please check your Wi-Fi or mobile data connection and try again."
                } else {
                    "SheoMart servers are waking up from sleep mode. This usually takes a few seconds. Tap retry to reconnect."
                },
                style = MaterialTheme.typography.bodySmall,
                color = SecondaryText,
                textAlign = TextAlign.Center,
            )

            Spacer(Modifier.height(18.dp))

            PrimaryButton(
                text = "Retry Connection",
                onClick = onRetry,
            )

            Spacer(Modifier.height(10.dp))

            OutlinedButton(
                onClick = { /* Offline placeholder */ },
                enabled = false,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = SecondaryText,
                    disabledContentColor = SecondaryText.copy(alpha = 0.5f),
                ),
            ) {
                Text(
                    text = "Offline Mode (Unavailable)",
                    style = MaterialTheme.typography.labelMedium,
                )
            }
        }
    }
}
