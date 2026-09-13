package com.sheomart.mobile.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val SheoMartLightColorScheme = lightColorScheme(
    primary = PrimaryGreen,
    onPrimary = androidx.compose.ui.graphics.Color.White,
    background = Background,
    onBackground = PrimaryText,
    surface = Surface,
    onSurface = PrimaryText,
    outline = Border,
    error = Error,
)

@Composable
fun SheoMartTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = SheoMartLightColorScheme,
        typography = SheoMartTypography,
        content = content,
    )
}