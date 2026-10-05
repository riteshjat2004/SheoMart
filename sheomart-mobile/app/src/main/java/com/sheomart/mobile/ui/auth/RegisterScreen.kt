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
import com.sheomart.mobile.data.model.RegisterRequest
import com.sheomart.mobile.ui.components.*
import com.sheomart.mobile.ui.theme.*

/**
 * Register screen.
 *
 * Fix applied: replaced the centred non-scrollable Column with a scrollable one that
 * pushes the footer to the bottom of visible content. The footer ("Already have an
 * account? Login") is now always fully visible on every screen size and always above
 * the keyboard via imePadding().
 */
@Composable
fun RegisterScreen(
    error: String?,
    loading: Boolean,
    onRegister: (RegisterRequest) -> Unit,
    onLogin: () -> Unit,
) {
    var name     by rememberSaveable { mutableStateOf("") }
    var email    by rememberSaveable { mutableStateOf("") }
    var mobile   by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var confirm  by rememberSaveable { mutableStateOf("") }
    var visible  by rememberSaveable { mutableStateOf(false) }
    var validation by remember { mutableStateOf<String?>(null) }
    val snackbar   = remember { SnackbarHostState() }

    LaunchedEffect(error) { if (error != null) snackbar.showSnackbar(error) }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        containerColor = MaterialTheme.colorScheme.background,
    ) { padding ->
        // Outer Box fills the screen so we can place the footer at the bottom
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .statusBarsPadding()
                .navigationBarsPadding()
                .imePadding(),
        ) {
            // Scrollable main content
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 24.dp)
                    .padding(top = 28.dp, bottom = 80.dp), // 80 dp bottom gap for the footer
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                AuthHeader(
                    "Create Account",
                    "Join SheoMart and shop from trusted local stores.",
                )

                Field(name,    { name = it },    "Full Name",       PersonIcon)
                Spacer(Modifier.height(10.dp))
                Field(email,   { email = it },   "Email Address",   EmailIcon, KeyboardType.Email)
                Spacer(Modifier.height(10.dp))
                Field(mobile,  { mobile = it.filter(Char::isDigit).take(10) }, "Mobile Number", PersonIcon, KeyboardType.Phone)
                Spacer(Modifier.height(10.dp))
                Field(
                    password, { password = it }, "Password", LockIcon,
                    trailing = { PasswordToggle(visible) { visible = !visible } },
                    hidden = !visible,
                )
                Spacer(Modifier.height(10.dp))
                Field(
                    confirm, { confirm = it }, "Confirm Password", LockIcon,
                    trailing = { PasswordToggle(visible) { visible = !visible } },
                    hidden = !visible,
                )

                validation?.let {
                    Spacer(Modifier.height(8.dp))
                    Text(
                        it,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }

                Spacer(Modifier.height(16.dp))

                PrimaryButton(
                    text = "Continue",
                    onClick = {
                        validation = validateRegistration(name, email, mobile, password, confirm)
                        if (validation == null) {
                            onRegister(RegisterRequest(name.trim(), email.trim(), mobile, password))
                        }
                    },
                    loading = loading,
                )
            }

            // ── Footer — always visible, pinned to the bottom ─────────────────
            TextButton(
                onClick = onLogin,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(bottom = 8.dp),
            ) {
                Text("Already have an account? ", color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text("Login", color = MaterialTheme.colorScheme.primary)
            }
        }
    }
}

@Composable
private fun Field(
    value: String,
    change: (String) -> Unit,
    hint: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    keyboard: KeyboardType = KeyboardType.Text,
    trailing: (@Composable () -> Unit)? = null,
    hidden: Boolean = false,
) {
    SheoTextField(
        value = value,
        onValueChange = change,
        placeholder = hint,
        leadingIcon = icon,
        leadingContentDescription = hint,
        modifier = Modifier.fillMaxWidth(),
        trailingIcon = trailing,
        passwordMode = hidden,
        keyboardType = keyboard,
    )
}

private fun validateRegistration(
    name: String, email: String, mobile: String,
    password: String, confirm: String,
): String? = when {
    name.trim().length < 2                               -> "Name must be at least 2 characters"
    !email.trim().matches(Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) -> "Please enter a valid email"
    !mobile.matches(Regex("^[6-9]\\d{9}$"))              -> "Please enter a valid mobile number"
    password.length < 8                                  -> "Password must be at least 8 characters"
    confirm.length < 8                                   -> "Please confirm your password"
    password != confirm                                  -> "Passwords do not match"
    else                                                 -> null
}