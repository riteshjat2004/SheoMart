package com.sheomart.mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.data.model.Store
import com.sheomart.mobile.ui.theme.*

@Composable
fun StoreCard(
    store: Store,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isRoyal = store.badge.equals("royal", ignoreCase = true)
    val isVerified = store.badge.equals("verified", ignoreCase = true)

    val borderColor = when {
        isRoyal -> Color(0xFFFDE68A)
        isVerified -> Color(0xFFA7F3D0)
        else -> Border
    }

    Box(
        modifier = modifier
            .width(220.dp)
            .shadow(3.dp, shape = RoundedCornerShape(20.dp), spotColor = Color(0x14000000))
            .clip(RoundedCornerShape(20.dp))
            .background(Color.White)
            .border(1.2.dp, borderColor, RoundedCornerShape(20.dp))
            .clickable(onClick = onClick)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // Banner Container
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(90.dp)
                    .background(Surface)
            ) {
                if (!store.banner.isNullOrBlank()) {
                    AsyncImageLoader(
                        url = store.banner,
                        contentDescription = store.storeName,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop,
                        shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp),
                        fallbackText = store.storeName
                    )
                }

                // Badge (Royal > Verified > Normal)
                when {
                    isRoyal -> {
                        Box(
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(8.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(Color(0xFFFEF3C7))
                                .border(1.dp, Color(0xFFF59E0B), RoundedCornerShape(10.dp))
                                .padding(horizontal = 7.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "👑 Royal",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                ),
                                color = Color(0xFFB45309)
                            )
                        }
                    }
                    isVerified -> {
                        Box(
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(8.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(Color(0xFFECFDF5))
                                .border(1.dp, Color(0xFF10B981), RoundedCornerShape(10.dp))
                                .padding(horizontal = 7.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "✓ Verified",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                ),
                                color = Color(0xFF047857)
                            )
                        }
                    }
                }

                // Logo Avatar overlapping banner
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(start = 12.dp)
                        .offset(y = 20.dp)
                        .size(44.dp)
                        .shadow(2.dp, shape = CircleShape)
                        .clip(CircleShape)
                        .background(Color.White)
                        .border(2.dp, Color.White, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    if (!store.logo.isNullOrBlank()) {
                        AsyncImageLoader(
                            url = store.logo,
                            contentDescription = store.storeName,
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop,
                            shape = CircleShape,
                            fallbackText = store.storeName
                        )
                    } else {
                        Text(
                            text = store.storeName.take(1).uppercase(),
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = PrimaryGreen
                        )
                    }
                }
            }

            // Store Info Details
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 12.dp, end = 12.dp, top = 24.dp, bottom = 12.dp)
            ) {
                Text(
                    text = store.storeName,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    ),
                    color = PrimaryText,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(2.dp))

                // Location / Address
                Text(
                    text = listOfNotNull(store.address, store.city).joinToString(", ").ifBlank { "Sheopur" },
                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                    color = SecondaryText,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Rating & Delivery Availability row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(3.dp)
                    ) {
                        Text(text = "★", color = Color(0xFFF59E0B), fontSize = 12.sp)
                        Text(
                            text = if (store.rating != null && store.rating > 0.0) String.format("%.1f", store.rating) else "New",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = PrimaryText
                        )
                        if (store.totalReviews > 0) {
                            Text(
                                text = "(${store.totalReviews})",
                                style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp),
                                color = SecondaryText
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (store.deliveryEnabled) Color(0xFFECFDF5) else Surface)
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = if (store.deliveryEnabled) "🚀 Delivery" else "🛍️ Pickup",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontSize = 9.sp,
                                fontWeight = FontWeight.SemiBold
                            ),
                            color = if (store.deliveryEnabled) PrimaryGreen else SecondaryText
                        )
                    }
                }
            }
        }
    }
}
