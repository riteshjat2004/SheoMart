package com.sheomart.mobile.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

val SheoMartLightColorScheme = lightColorScheme(
    primary = EmeraldPrimary,
    onPrimary = Color.White,
    primaryContainer = EmeraldLightContainer,
    onPrimaryContainer = EmeraldDarkContainerText,
    secondary = EmeraldPrimary,
    onSecondary = Color.White,
    background = LightBackground,
    onBackground = LightTextPrimary,
    surface = LightSurface,
    onSurface = LightTextPrimary,
    surfaceVariant = LightSurfaceVariant,
    onSurfaceVariant = LightTextSecondary,
    outline = LightBorder,
    outlineVariant = LightBorderSubtle,
    error = LightError,
    onError = Color.White
)

val SheoMartDarkColorScheme = darkColorScheme(
    primary = EmeraldDark,
    onPrimary = Color(0xFF022C22),
    primaryContainer = EmeraldDarkContainer,
    onPrimaryContainer = EmeraldDarkContainerText,
    secondary = EmeraldDark,
    onSecondary = Color(0xFF022C22),
    background = DarkBackground,
    onBackground = DarkTextPrimary,
    surface = DarkSurface,
    onSurface = DarkTextPrimary,
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = DarkTextSecondary,
    outline = DarkBorder,
    outlineVariant = DarkBorderSubtle,
    error = DarkError,
    onError = Color(0xFF450A0A)
)

@Composable
fun SheoMartTheme(
    themeManager: ThemeManager? = null,
    content: @Composable () -> Unit
) {
    val systemInDark = isSystemInDarkTheme()
    val isDark = when (themeManager?.themeMode) {
        ThemeMode.LIGHT -> false
        ThemeMode.DARK -> true
        ThemeMode.SYSTEM, null -> systemInDark
    }

    val colorScheme = if (isDark) SheoMartDarkColorScheme else SheoMartLightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window ?: return@SideEffect
            window.statusBarColor = colorScheme.background.toArgb()
            window.navigationBarColor = colorScheme.background.toArgb()
            val controller = WindowCompat.getInsetsController(window, view)
            controller.isAppearanceLightStatusBars = !isDark
            controller.isAppearanceLightNavigationBars = !isDark
        }
    }

    if (themeManager != null) {
        CompositionLocalProvider(LocalThemeManager provides themeManager) {
            MaterialTheme(
                colorScheme = colorScheme,
                typography = SheoMartTypography,
                content = content
            )
        }
    } else {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = SheoMartTypography,
            content = content
        )
    }
}