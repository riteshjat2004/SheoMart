package com.sheomart.mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.ui.theme.*

enum class BadgeVariant {
    SUCCESS,
    WARNING,
    INFO,
    ERROR,
    NEUTRAL
}

@Composable
fun StatusBadge(
    text: String,
    modifier: Modifier = Modifier,
    variant: BadgeVariant? = null,
) {
    val resolvedVariant = variant ?: resolveVariant(text)
    val (backgroundColor, textColor, borderColor) = getColorsForVariant(resolvedVariant)

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(backgroundColor)
            .border(1.dp, borderColor, RoundedCornerShape(8.dp))
            .padding(horizontal = 8.dp, vertical = 3.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = formatStatusText(text),
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = FontWeight.SemiBold,
                fontSize = 11.sp
            ),
            color = textColor
        )
    }
}

private fun formatStatusText(status: String): String {
    return status.replace("_", " ")
        .lowercase()
        .split(" ")
        .joinToString(" ") { word ->
            word.replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
        }
}

private fun resolveVariant(status: String): BadgeVariant {
    val normalized = status.uppercase().trim()
    return when {
        normalized in listOf("DELIVERED", "COMPLETED", "PAID", "ACCEPTED", "SUCCESS") -> BadgeVariant.SUCCESS
        normalized in listOf("PREPARING", "PENDING", "PARTIALLY_PAID", "PROCESSING", "ORDER_PLACED") -> BadgeVariant.WARNING
        normalized in listOf("READY_FOR_PICKUP", "CONFIRMED", "OUT_FOR_DELIVERY", "DISPATCHED", "ISSUED", "INFO") -> BadgeVariant.INFO
        normalized in listOf("CANCELLED", "FAILED", "REJECTED", "VOID") -> BadgeVariant.ERROR
        else -> BadgeVariant.NEUTRAL
    }
}

@Composable
private fun getColorsForVariant(variant: BadgeVariant): Triple<Color, Color, Color> {
    val isDark = MaterialTheme.colorScheme.background.run {
        // Simple luminance or theme check
        red < 0.2f && green < 0.2f && blue < 0.2f
    }

    return when (variant) {
        BadgeVariant.SUCCESS -> {
            if (isDark) {
                Triple(StatusSuccessBgDark, StatusSuccessTextDark, StatusSuccessTextDark.copy(alpha = 0.3f))
            } else {
                Triple(StatusSuccessBgLight, StatusSuccessTextLight, StatusSuccessTextLight.copy(alpha = 0.25f))
            }
        }
        BadgeVariant.WARNING -> {
            if (isDark) {
                Triple(StatusWarningBgDark, StatusWarningTextDark, StatusWarningTextDark.copy(alpha = 0.3f))
            } else {
                Triple(StatusWarningBgLight, StatusWarningTextLight, StatusWarningTextLight.copy(alpha = 0.25f))
            }
        }
        BadgeVariant.INFO -> {
            if (isDark) {
                Triple(StatusInfoBgDark, StatusInfoTextDark, StatusInfoTextDark.copy(alpha = 0.3f))
            } else {
                Triple(StatusInfoBgLight, StatusInfoTextLight, StatusInfoTextLight.copy(alpha = 0.25f))
            }
        }
        BadgeVariant.ERROR -> {
            if (isDark) {
                Triple(StatusErrorBgDark, StatusErrorTextDark, StatusErrorTextDark.copy(alpha = 0.3f))
            } else {
                Triple(StatusErrorBgLight, StatusErrorTextLight, StatusErrorTextLight.copy(alpha = 0.25f))
            }
        }
        BadgeVariant.NEUTRAL -> {
            if (isDark) {
                Triple(DarkSurfaceVariant, DarkTextSecondary, DarkBorder)
            } else {
                Triple(LightSurfaceVariant, LightTextSecondary, LightBorder)
            }
        }
    }
}
