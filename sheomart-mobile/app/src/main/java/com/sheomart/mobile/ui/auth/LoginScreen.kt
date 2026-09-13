package com.sheomart.mobile.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.sheomart.mobile.ui.components.PrimaryButton
import com.sheomart.mobile.ui.components.SheoTextField
import com.sheomart.mobile.ui.theme.PrimaryGreen
import com.sheomart.mobile.ui.theme.Background
import com.sheomart.mobile.ui.theme.SheoMartTheme

@Composable
fun LoginScreen(modifier: Modifier = Modifier) {
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var passwordVisible by rememberSaveable { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Background)
            .verticalScroll(rememberScrollState())
            .statusBarsPadding()
            .imePadding()
            .padding(horizontal = 24.dp, vertical = 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(modifier = Modifier.height(24.dp))

        // TODO: Replace the placeholder with the actual SheoMart logo later.
        Box(
            modifier = Modifier
                .size(90.dp)
                .background(PrimaryGreen.copy(alpha = 0.14f), CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = ShoppingBagIcon,
                contentDescription = "SheoMart logo placeholder",
                modifier = Modifier.size(44.dp),
                tint = PrimaryGreen,
            )
        }

        Spacer(modifier = Modifier.height(28.dp))
        Text("Welcome Back", style = MaterialTheme.typography.headlineLarge, textAlign = TextAlign.Center)
        Spacer(modifier = Modifier.height(10.dp))
        Text(
            "Sign in to continue shopping from your favourite local stores.",
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )

        Spacer(modifier = Modifier.height(32.dp))
        SheoTextField(
            value = email,
            onValueChange = { email = it },
            placeholder = "Email or Mobile Number",
            leadingIcon = EmailIcon,
            leadingContentDescription = "Email or mobile number",
            keyboardType = KeyboardType.Email,
            imeAction = ImeAction.Next,
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(modifier = Modifier.height(16.dp))
        SheoTextField(
            value = password,
            onValueChange = { password = it },
            placeholder = "Password",
            leadingIcon = LockIcon,
            leadingContentDescription = "Password",
            passwordMode = !passwordVisible,
            imeAction = ImeAction.Done,
            modifier = Modifier.fillMaxWidth(),
            trailingIcon = {
                IconButton(onClick = { passwordVisible = !passwordVisible }) {
                    Icon(
                        imageVector = if (passwordVisible) VisibilityOffIcon else VisibilityIcon,
                        contentDescription = if (passwordVisible) "Hide password" else "Show password",
                    )
                }
            },
        )

        TextButton(
            onClick = { /* TODO: Add forgot password flow later. */ },
            modifier = Modifier.align(Alignment.End),
        ) {
            Text("Forgot Password?", color = PrimaryGreen)
        }

        Spacer(modifier = Modifier.height(8.dp))
        PrimaryButton(
            text = "Continue",
            onClick = {
                // TODO: Connect backend login in Checkpoint 1.2
            },
        )

        Spacer(modifier = Modifier.height(28.dp))
        TextButton(onClick = { /* TODO: Add sign up flow later. */ }) {
            Text("Don't have an account? ", color = MaterialTheme.colorScheme.onBackground)
            Text("Sign Up", color = PrimaryGreen)
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFFFFF7F2)
@Composable
private fun LoginScreenPreview() {
    SheoMartTheme {
        LoginScreen()
    }
}

private fun sheoIcon(name: String, pathData: String): ImageVector =
    ImageVector.Builder(
        name = name,
        defaultWidth = 24.dp,
        defaultHeight = 24.dp,
        viewportWidth = 24f,
        viewportHeight = 24f,
    ).addPath(
        pathData = PathParser().parsePathString(pathData).toNodes(),
        fill = SolidColor(Color.Black),
    ).build()

private val PersonIcon = sheoIcon(
    "Person",
    "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z",
)

private val LockIcon = sheoIcon(
    "Lock",
    "M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2Zm-6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm3-9H9V6a3 3 0 0 1 6 0v2Z",
)

private val ShoppingBagIcon = sheoIcon(
    "ShoppingBag",
    "M6 7h12l1 14H5L6 7Zm3 0V5a3 3 0 0 1 6 0v2h-2V5a1 1 0 0 0-2 0v2H9Z",
)

private val VisibilityIcon = sheoIcon(
    "Visibility",
    "M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
)

private val VisibilityOffIcon = sheoIcon(
    "VisibilityOff",
    "M2 4.27 3.28 3 21 20.72 19.73 22l-3.04-3.04A10.8 10.8 0 0 1 12 20c-5 0-9.27-3.11-11-7a12.4 12.4 0 0 1 4.16-4.95L2 4.27ZM12 7c5 0 9.27 3.11 11 7a12.4 12.4 0 0 1-4.16 4.95l-2.2-2.2A5 5 0 0 0 9.25 9.36L7.3 7.41A10.8 10.8 0 0 1 12 7Z",
)

private val EmailIcon = sheoIcon(
    "Email",
    "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z",
)