package com.sheomart.mobile.ui.auth

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.ui.components.PrimaryButton
import com.sheomart.mobile.ui.theme.*
import kotlinx.coroutines.delay

/**
 * OTP verification screen.
 * Shows 6 individual digit boxes with auto-focus between them.
 * Countdown timer shows remaining validity; "Resend OTP" enabled when timer expires.
 */
@Composable
fun OtpVerificationScreen(
    email: String,
    loading: Boolean,
    error: String?,
    onVerify: (otp: String) -> Unit,
    onResend: () -> Unit,
    onBack: () -> Unit,
) {
    var otp by rememberSaveable { mutableStateOf("") }
    var remaining by rememberSaveable { mutableStateOf(600) } // 10 min
    var validation by remember { mutableStateOf<String?>(null) }
    val snackbar = remember { SnackbarHostState() }

    // Show API error in snackbar
    LaunchedEffect(error) { if (error != null) snackbar.showSnackbar(error) }

    // Countdown timer
    LaunchedEffect(remaining) {
        if (remaining > 0) {
            delay(1000L)
            remaining -= 1
        }
    }

    val minutes = remaining / 60
    val seconds = remaining % 60
    val timerText = "%02d:%02d".format(minutes, seconds)

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        containerColor = Background,
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .statusBarsPadding()
                .imePadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Row(Modifier.fillMaxWidth()) {
                TextButton(onClick = onBack) { Text("← Back", color = PrimaryGreen) }
            }

            Spacer(Modifier.height(8.dp))
            AuthHeader(
                title = "Verify OTP",
                subtitle = "Enter the 6-digit code sent to\n$email",
            )

            // 6-Box OTP input
            OtpBoxRow(otp = otp, onOtpChange = { otp = it })

            Spacer(Modifier.height(16.dp))

            // Timer
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Code expires in ", style = MaterialTheme.typography.bodySmall, color = SecondaryText)
                Text(timerText, style = MaterialTheme.typography.bodySmall,
                    color = if (remaining <= 60) Error else PrimaryGreen,
                    fontWeight = FontWeight.SemiBold)
            }

            validation?.let {
                Spacer(Modifier.height(6.dp))
                Text(it, color = Error, style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Center)
            }

            Spacer(Modifier.height(20.dp))

            PrimaryButton(
                text = "Verify OTP",
                onClick = {
                    if (otp.length != 6) {
                        validation = "Enter the complete 6-digit code"
                    } else {
                        validation = null
                        onVerify(otp)
                    }
                },
                loading = loading,
            )

            Spacer(Modifier.height(12.dp))

            // Resend button — enabled only when timer hits 0
            TextButton(
                onClick = {
                    otp = ""
                    remaining = 600
                    onResend()
                },
                enabled = remaining <= 0 && !loading,
            ) {
                Text(
                    text = if (remaining > 0) "Resend OTP when timer ends" else "Resend OTP",
                    color = if (remaining <= 0) PrimaryGreen else SecondaryText,
                )
            }
        }
    }
}

/**
 * 6 individual digit boxes with auto-advance focus.
 * Uses a single hidden BasicTextField capturing input and distributes
 * characters across the visible boxes.
 */
@Composable
private fun OtpBoxRow(otp: String, onOtpChange: (String) -> Unit) {
    val focusRequester = remember { FocusRequester() }
    LaunchedEffect(Unit) {
        try { focusRequester.requestFocus() } catch (_: Exception) {}
    }

    Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxWidth()) {
        // Hidden text field captures raw keyboard input
        BasicTextField(
            value = otp,
            onValueChange = { new ->
                val digits = new.filter { it.isDigit() }.take(6)
                onOtpChange(digits)
            },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
            modifier = Modifier
                .size(1.dp) // visually hidden but receives focus/input
                .focusRequester(focusRequester),
            textStyle = TextStyle(color = Color.Transparent),
        )

        // Visible 6 boxes
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            repeat(6) { index ->
                val char = otp.getOrNull(index)?.toString() ?: ""
                val isFocused = index == otp.length && otp.length < 6
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .size(width = 48.dp, height = 56.dp)
                        .border(
                            width = if (isFocused) 2.dp else 1.dp,
                            color = when {
                                isFocused -> PrimaryGreen
                                char.isNotEmpty() -> PrimaryGreen.copy(alpha = 0.7f)
                                else -> Border
                            },
                            shape = MaterialTheme.shapes.medium,
                        ),
                ) {
                    Text(
                        text = char,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryText,
                    )
                }
            }
        }
    }
}
