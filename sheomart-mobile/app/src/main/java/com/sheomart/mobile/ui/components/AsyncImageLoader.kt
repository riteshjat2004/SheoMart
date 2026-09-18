package com.sheomart.mobile.ui.components

import android.graphics.BitmapFactory
import android.util.LruCache
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.painter.BitmapPainter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import com.sheomart.mobile.ui.theme.Border
import com.sheomart.mobile.ui.theme.Surface
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

private val imageMemoryCache = object : LruCache<String, ImageBitmap>(100) {}

@Composable
fun AsyncImageLoader(
    url: String?,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    contentScale: ContentScale = ContentScale.Crop,
    shape: androidx.compose.ui.graphics.Shape = RoundedCornerShape(12.dp),
    fallbackText: String? = null,
    backgroundColor: Color = Surface
) {
    var bitmap by remember(url) { mutableStateOf<ImageBitmap?>(url?.let { imageMemoryCache.get(it) }) }
    var isLoading by remember(url) { mutableStateOf(url != null && bitmap == null) }
    var isError by remember(url) { mutableStateOf(false) }

    LaunchedEffect(url) {
        if (url.isNullOrBlank()) {
            isLoading = false
            isError = true
            return@LaunchedEffect
        }

        val cached = imageMemoryCache.get(url)
        if (cached != null) {
            bitmap = cached
            isLoading = false
            return@LaunchedEffect
        }

        isLoading = true
        isError = false

        val loadedBitmap = withContext(Dispatchers.IO) {
            try {
                val conn = URL(url).openConnection() as HttpURLConnection
                conn.connectTimeout = 8000
                conn.readTimeout = 8000
                conn.doInput = true
                conn.connect()
                conn.inputStream.use { stream ->
                    val nativeBitmap = BitmapFactory.decodeStream(stream)
                    nativeBitmap?.asImageBitmap()
                }
            } catch (_: Exception) {
                null
            }
        }

        if (loadedBitmap != null) {
            imageMemoryCache.put(url, loadedBitmap)
            bitmap = loadedBitmap
            isLoading = false
        } else {
            isLoading = false
            isError = true
        }
    }

    Box(
        modifier = modifier
            .clip(shape)
            .background(backgroundColor),
        contentAlignment = Alignment.Center
    ) {
        when {
            bitmap != null -> {
                Image(
                    painter = BitmapPainter(bitmap!!),
                    contentDescription = contentDescription,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = contentScale
                )
            }
            isLoading -> {
                ShimmerPlaceholder(modifier = Modifier.fillMaxSize(), shape = shape)
            }
            else -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Border.copy(alpha = 0.5f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = fallbackText?.take(1)?.uppercase() ?: "🛒",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.Gray
                    )
                }
            }
        }
    }
}
