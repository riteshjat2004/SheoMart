package com.sheomart.mobile.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.sheomart.mobile.data.model.RegisterRequest
import com.sheomart.mobile.ui.components.*
import com.sheomart.mobile.ui.theme.*

@Composable
fun RegisterScreen(error: String?, loading: Boolean, onRegister: (RegisterRequest) -> Unit, onLogin: () -> Unit) {
    var name by rememberSaveable { mutableStateOf("") }; var email by rememberSaveable { mutableStateOf("") }; var mobile by rememberSaveable { mutableStateOf("") }; var password by rememberSaveable { mutableStateOf("") }; var confirm by rememberSaveable { mutableStateOf("") }; var visible by rememberSaveable { mutableStateOf(false) }
    var validation by remember { mutableStateOf<String?>(null) }; val snackbar = remember { SnackbarHostState() }; LaunchedEffect(error) { if (error != null) snackbar.showSnackbar(error) }
    AuthScaffold(snackbar) {
        AuthHeader("Create Account", "Join SheoMart and shop from trusted local stores.")
        Field(name, { name = it }, "Full Name", PersonIcon); Spacer(Modifier.height(10.dp)); Field(email, { email = it }, "Email Address", EmailIcon, KeyboardType.Email); Spacer(Modifier.height(10.dp)); Field(mobile, { mobile = it.filter(Char::isDigit).take(10) }, "Mobile Number", PersonIcon, KeyboardType.Phone); Spacer(Modifier.height(10.dp)); Field(password, { password = it }, "Password", LockIcon, trailing = { PasswordToggle(visible) { visible = !visible } }, hidden = !visible); Spacer(Modifier.height(10.dp)); Field(confirm, { confirm = it }, "Confirm Password", LockIcon, trailing = { PasswordToggle(visible) { visible = !visible } }, hidden = !visible)
        validation?.let { Spacer(Modifier.height(8.dp)); Text(it, color = Error, style = MaterialTheme.typography.bodySmall, modifier = Modifier.fillMaxWidth()) }; Spacer(Modifier.height(16.dp))
        PrimaryButton("Continue", { validation = validateRegistration(name, email, mobile, password, confirm); if (validation == null) onRegister(RegisterRequest(name.trim(), email.trim(), mobile, password)) }, loading = loading)
        TextButton(onClick = onLogin) { Text("Already have an account? ", color = SecondaryText); Text("Login", color = PrimaryGreen) }
    }
}

@Composable
private fun Field(value: String, change: (String) -> Unit, hint: String, icon: androidx.compose.ui.graphics.vector.ImageVector, keyboard: KeyboardType = KeyboardType.Text, trailing: (@Composable () -> Unit)? = null, hidden: Boolean = false) { SheoTextField(value, change, hint, icon, hint, Modifier.fillMaxWidth(), trailingIcon = trailing, passwordMode = hidden, keyboardType = keyboard) }

private fun validateRegistration(name: String, email: String, mobile: String, password: String, confirm: String): String? = when {
    name.trim().length < 2 -> "Name must be at least 2 characters"
    !email.trim().matches(Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) -> "Please enter a valid email"
    !mobile.matches(Regex("^[6-9]\\d{9}$")) -> "Please enter a valid mobile number"
    password.length < 8 -> "Password must be at least 8 characters"
    confirm.length < 8 -> "Please confirm your password"
    password != confirm -> "Passwords do not match"
    else -> null
}