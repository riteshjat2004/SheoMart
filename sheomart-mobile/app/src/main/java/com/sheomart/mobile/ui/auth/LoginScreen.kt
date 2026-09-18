package com.sheomart.mobile.ui.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.sheomart.mobile.R
import com.sheomart.mobile.ui.components.*
import com.sheomart.mobile.ui.theme.*

@Composable
fun LoginScreen(error: String?, loading: Boolean, onLogin: (String, String) -> Unit, onRegister: () -> Unit) {
    var identifier by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var visible by rememberSaveable { mutableStateOf(false) }
    var validation by remember { mutableStateOf<String?>(null) }
    val snackbar = remember { SnackbarHostState() }
    LaunchedEffect(error) { if (error != null) snackbar.showSnackbar(error) }
    AuthScaffold(snackbar) {
        AuthHeader("Welcome Back", "Sign in to continue shopping from your favourite local stores.")
        SheoTextField(identifier, { identifier = it }, "Email or Mobile Number", EmailIcon, "Email or mobile number", Modifier.fillMaxWidth(), keyboardType = KeyboardType.Email, imeAction = ImeAction.Next)
        Spacer(Modifier.height(14.dp))
        SheoTextField(password, { password = it }, "Password", LockIcon, "Password", Modifier.fillMaxWidth(), trailingIcon = { PasswordToggle(visible) { visible = !visible } }, passwordMode = !visible, imeAction = ImeAction.Done)
        TextButton(onClick = {}, Modifier.align(Alignment.End)) { Text("Forgot Password?", color = PrimaryGreen) }
        validation?.let { Text(it, color = Error, style = MaterialTheme.typography.bodySmall, modifier = Modifier.fillMaxWidth()) }
        Spacer(Modifier.height(8.dp))
        PrimaryButton("Continue", { if (identifier.trim().isEmpty() || password.length < 8) validation = "Enter your email or mobile and an 8-character password" else { validation = null; onLogin(identifier.trim(), password) } }, loading = loading)
        Spacer(Modifier.height(20.dp))
        TextButton(onClick = onRegister) { Text("Don't have an account? ", color = SecondaryText); Text("Sign Up", color = PrimaryGreen) }
    }
}

@Composable
fun AuthScaffold(snackbar: SnackbarHostState, content: @Composable ColumnScope.() -> Unit) {
    Scaffold(snackbarHost = { SnackbarHost(snackbar) }, containerColor = Background) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).statusBarsPadding().imePadding().padding(horizontal = 24.dp, vertical = 28.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center, content = content)
    }
}

@Composable
fun AuthHeader(title: String, subtitle: String) {
    Image(painterResource(R.drawable.appicon), "SheoMart logo", Modifier.size(88.dp).background(Surface, CircleShape).padding(14.dp))
    Spacer(Modifier.height(24.dp)); Text(title, style = MaterialTheme.typography.headlineLarge, textAlign = TextAlign.Center)
    Spacer(Modifier.height(8.dp)); Text(subtitle, style = MaterialTheme.typography.bodyMedium, color = SecondaryText, textAlign = TextAlign.Center)
    Spacer(Modifier.height(28.dp))
}

@Composable
fun PasswordToggle(visible: Boolean, onClick: () -> Unit) { IconButton(onClick) { Icon(if (visible) VisibilityOffIcon else VisibilityIcon, if (visible) "Hide password" else "Show password") }
}