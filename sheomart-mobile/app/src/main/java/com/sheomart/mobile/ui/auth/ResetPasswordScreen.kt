package com.sheomart.mobile.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.sheomart.mobile.ui.components.*
import com.sheomart.mobile.ui.theme.*

/**
 * Reset-password screen shown after successful OTP verification.
 * Validates new password using the same strong-password rules as the backend:
 *  - min 8 characters
 *  - at least one uppercase letter
 *  - at least one lowercase letter
 *  - at least one digit
 *  - at least one special character
 * Passwords must match.
 */
@Composable
fun ResetPasswordScreen(
    loading: Boolean,
    error: String?,
    onReset: (newPassword: String, confirmPassword: String) -> Unit,
    onBack: () -> Unit,
) {
    var newPassword     by rememberSaveable { mutableStateOf("") }
    var confirmPassword by rememberSaveable { mutableStateOf("") }
    var newVisible      by rememberSaveable { mutableStateOf(false) }
    var confirmVisible  by rememberSaveable { mutableStateOf(false) }
    var validation      by remember { mutableStateOf<String?>(null) }
    val snackbar        = remember { SnackbarHostState() }
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
            Row(Modifier.fillMaxWidth()) {
                TextButton(onClick = onBack) { Text("← Back", color = PrimaryGreen) }
            }

            Spacer(Modifier.height(8.dp))
            AuthHeader(
                title = "Create New Password",
                subtitle = "Use a unique password you haven't used before.",
            )

            // New password field
            // SheoTextField(value, onValueChange, placeholder, leadingIcon, leadingContentDescription, modifier, trailingIcon, passwordMode, keyboardType, ...)
            SheoTextField(
                value = newPassword,
                onValueChange = { newPassword = it },
                placeholder = "Create a strong password",
                leadingIcon = LockIcon,
                leadingContentDescription = "Password",
                modifier = Modifier.fillMaxWidth(),
                trailingIcon = { PasswordToggle(newVisible) { newVisible = !newVisible } },
                passwordMode = !newVisible,
                keyboardType = KeyboardType.Password,
            )

            Spacer(Modifier.height(8.dp))

            // Password strength indicator
            PasswordStrengthRow(newPassword)

            Spacer(Modifier.height(14.dp))

            // Confirm password field
            SheoTextField(
                value = confirmPassword,
                onValueChange = { confirmPassword = it },
                placeholder = "Repeat your password",
                leadingIcon = LockIcon,
                leadingContentDescription = "Confirm password",
                modifier = Modifier.fillMaxWidth(),
                trailingIcon = { PasswordToggle(confirmVisible) { confirmVisible = !confirmVisible } },
                passwordMode = !confirmVisible,
                keyboardType = KeyboardType.Password,
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
                text = "Update Password",
                onClick = {
                    val validationError = validateStrongPassword(newPassword, confirmPassword)
                    if (validationError != null) {
                        validation = validationError
                    } else {
                        validation = null
                        onReset(newPassword, confirmPassword)
                    }
                },
                loading = loading,
            )
        }
    }
}

/** Password strength visual indicator row */
@Composable
private fun PasswordStrengthRow(password: String) {
    val checks = listOf(
        "8+ characters"  to (password.length >= 8),
        "Uppercase"      to password.any { it.isUpperCase() },
        "Lowercase"      to password.any { it.isLowerCase() },
        "Number"         to password.any { it.isDigit() },
        "Special char"   to password.any { !it.isLetterOrDigit() },
    )
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        checks.forEach { (label, met) ->
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = if (met) "✓" else "○",
                    color = if (met) PrimaryGreen else SecondaryText,
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.width(20.dp),
                )
                Text(
                    text = label,
                    color = if (met) PrimaryGreen else SecondaryText,
                    style = MaterialTheme.typography.bodySmall,
                )
            }
        }
    }
}

/**
 * Validates password using same rules as backend strongPassword schema.
 * Returns null when password is valid.
 */
private fun validateStrongPassword(password: String, confirm: String): String? = when {
    password.length < 8                         -> "Password must be at least 8 characters"
    !password.any { it.isUpperCase() }          -> "Password must contain an uppercase letter"
    !password.any { it.isLowerCase() }          -> "Password must contain a lowercase letter"
    !password.any { it.isDigit() }              -> "Password must contain a number"
    !password.any { !it.isLetterOrDigit() }     -> "Password must contain a special character"
    confirm.isEmpty()                           -> "Please confirm your password"
    password != confirm                         -> "Passwords do not match"
    else                                        -> null
}
