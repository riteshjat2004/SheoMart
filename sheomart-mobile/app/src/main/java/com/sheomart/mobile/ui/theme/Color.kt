package com.sheomart.mobile.ui.theme

import androidx.compose.ui.graphics.Color

// ── Primary Emerald Palette (Web Parity) ──────────────────────────────────
val EmeraldPrimary = Color(0xFF059669)          // Emerald 600
val EmeraldDark = Color(0xFF10B981)             // Emerald 500
val EmeraldLightContainer = Color(0xFFD1FAE5)    // Emerald 100
val EmeraldDarkContainer = Color(0xFF064E3B)     // Emerald 900
val EmeraldDarkContainerText = Color(0xFFA7F3D0) // Emerald 200

// ── Light Theme Tokens ───────────────────────────────────────────────────
val LightBackground = Color(0xFFF8F9FA)
val LightSurface = Color(0xFFFFFFFF)
val LightSurfaceVariant = Color(0xFFF1F3F5)
val LightBorder = Color(0xFFE5E7EB)
val LightBorderSubtle = Color(0xFFF3F4F6)
val LightTextPrimary = Color(0xFF111827)
val LightTextSecondary = Color(0xFF6B7280)
val LightTextMuted = Color(0xFF9CA3AF)
val LightError = Color(0xFFDC2626)

// ── Dark Theme Tokens (Stone / Neutral Palette) ───────────────────────────
val DarkBackground = Color(0xFF0C0A09)           // Stone 950
val DarkSurface = Color(0xFF1C1917)              // Stone 900
val DarkSurfaceVariant = Color(0xFF292524)       // Stone 800
val DarkBorder = Color(0xFF292524)               // Stone 800
val DarkBorderSubtle = Color(0xFF44403C)         // Stone 700
val DarkTextPrimary = Color(0xFFFAFAF9)          // Stone 50
val DarkTextSecondary = Color(0xFFA8A29E)        // Stone 400
val DarkTextMuted = Color(0xFF78716C)            // Stone 500
val DarkError = Color(0xFFEF4444)

// ── Semantic Status Colors (Badges & Indicators) ─────────────────────────
val StatusSuccessBgLight = Color(0xFFDCFCE7)
val StatusSuccessTextLight = Color(0xFF15803D)
val StatusSuccessBgDark = Color(0xFF064E3B).copy(alpha = 0.6f)
val StatusSuccessTextDark = Color(0xFF6EE7B7)

val StatusWarningBgLight = Color(0xFFFEF3C7)
val StatusWarningTextLight = Color(0xFFB45309)
val StatusWarningBgDark = Color(0xFF78350F).copy(alpha = 0.5f)
val StatusWarningTextDark = Color(0xFFFCD34D)

val StatusInfoBgLight = Color(0xFFDBEAFE)
val StatusInfoTextLight = Color(0xFF1D4ED8)
val StatusInfoBgDark = Color(0xFF1E3A8A).copy(alpha = 0.5f)
val StatusInfoTextDark = Color(0xFF93C5FD)

val StatusErrorBgLight = Color(0xFFFEE2E2)
val StatusErrorTextLight = Color(0xFFB91C1C)
val StatusErrorBgDark = Color(0xFF7F1D1D).copy(alpha = 0.5f)
val StatusErrorTextDark = Color(0xFFFCA5A5)

// ── Backward-Compatible Aliases (to ensure legacy components don't crash) ─
val PrimaryGreen = EmeraldPrimary
val Background = LightBackground
val Surface = LightSurface
val PrimaryText = LightTextPrimary
val SecondaryText = LightTextSecondary
val Border = LightBorder
val Error = LightError