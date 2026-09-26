package com.sheomart.mobile.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.sheomart.mobile.ui.components.*
import com.sheomart.mobile.ui.theme.*

/**
 * Forgot-password entry screen.
 * User types their registered email and taps "Send OTP".
 * On success the backend sends a 6-digit OTP to that email.
 */
@Composable
fun ForgotPasswordScreen(
    loading: Boolean,
    error: String?,
    onSendOtp: (email: String) -> Unit,
    onBack: () -> Unit,
) {
    var email by rememberSaveable { mutableStateOf("") }
    var validation by remember { mutableStateOf<String?>(null) }
    val snackbar = remember { SnackbarHostState() }
    LaunchedEffect(error) { if (error != null) snackbar.showSnackbar(error) }

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
            // Back row
            Row(Modifier.fillMaxWidth()) {
                TextButton(onClick = onBack) {
                    Text("← Back", color = PrimaryGreen)
                }
            }

            Spacer(Modifier.height(8.dp))
            AuthHeader(
                title = "Forgot Password",
                subtitle = "Enter your registered email. We'll send a 6-digit verification code.",
            )

            // SheoTextField(value, onValueChange, placeholder, leadingIcon, leadingContentDescription, modifier, ...)
            SheoTextField(
                value = email,
                onValueChange = { email = it },
                placeholder = "Email address",
                leadingIcon = EmailIcon,
                leadingContentDescription = "Email",
                modifier = Modifier.fillMaxWidth(),
                keyboardType = KeyboardType.Email,
            )

            validation?.let {
                Spacer(Modifier.height(6.dp))
                Text(
                    it,
                    color = Error,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.fillMaxWidth(),
                )
            }

            Spacer(Modifier.height(20.dp))

            PrimaryButton(
                text = "Send OTP",
                onClick = {
                    val trimmed = email.trim()
                    if (!trimmed.matches(Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))) {
                        validation = "Enter a valid email address"
                    } else {
                        validation = null
                        onSendOtp(trimmed)
                    }
                },
                loading = loading,
            )

            Spacer(Modifier.height(16.dp))
            Text(
                "OTP is valid for 10 minutes.",
                style = MaterialTheme.typography.bodySmall,
                color = SecondaryText,
            )
        }
    }
}
