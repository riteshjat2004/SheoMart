package com.sheomart.mobile.ui.theme

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

enum class ThemeMode {
    SYSTEM,
    LIGHT,
    DARK
}

class ThemeManager(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("sheomart_theme_prefs", Context.MODE_PRIVATE)

    var themeMode: ThemeMode by mutableStateOf(loadThemeMode())
        private set

    private fun loadThemeMode(): ThemeMode {
        val saved = prefs.getString("theme_mode", ThemeMode.SYSTEM.name) ?: ThemeMode.SYSTEM.name
        return try {
            ThemeMode.valueOf(saved)
        } catch (_: Exception) {
            ThemeMode.SYSTEM
        }
    }

    fun setTheme(mode: ThemeMode) {
        themeMode = mode
        prefs.edit().putString("theme_mode", mode.name).apply()
    }
}

val LocalThemeManager = compositionLocalOf<ThemeManager> {
    error("ThemeManager not provided")
}
