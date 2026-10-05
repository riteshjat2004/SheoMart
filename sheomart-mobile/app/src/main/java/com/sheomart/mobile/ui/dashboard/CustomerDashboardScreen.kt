package com.sheomart.mobile.ui.dashboard

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.data.model.*
import com.sheomart.mobile.ui.components.*
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*


@Composable
fun CustomerDashboardScreen(
    user: AuthUser?,
    viewModel: DashboardViewModel,
    onNavigateTab: (CustomerNavTab) -> Unit,
    onOrdersClick: () -> Unit,
    onWishlistClick: () -> Unit,
    onCartClick: () -> Unit,
    onAddressesClick: () -> Unit,
    onCouponsClick: () -> Unit,
    onNotificationsClick: () -> Unit,
    onSupportClick: () -> Unit,
    onAboutClick: () -> Unit,
    onEditProfileClick: () -> Unit,
    onExploreClick: () -> Unit,
    onLogout: () -> Unit,
    onSwitchToSeller: (() -> Unit)? = null,
    onSwitchToAdmin: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scrollState = rememberScrollState()
    val context = LocalContext.current
    val themeManager = LocalThemeManager.current

    LaunchedEffect(uiState.feedbackMessage) {
        uiState.feedbackMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.dismissFeedback()
        }
    }

    val customerName = when (val profileState = uiState.profileState) {
        is UiState.Success -> profileState.data.name
        else -> user?.name ?: "Customer"
    }

    val customerEmail = when (val profileState = uiState.profileState) {
        is UiState.Success -> profileState.data.email
        else -> user?.email ?: ""
    }

    val customerMobile = when (val profileState = uiState.profileState) {
        is UiState.Success -> profileState.data.mobile
        else -> user?.mobile ?: ""
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
            SheoBottomNavigation(
                currentTab = CustomerNavTab.PROFILE,
                onTabSelected = onNavigateTab
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(scrollState)
        ) {
            // ==========================================
            // 1. DASHBOARD HEADER
            // ==========================================
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp)
                    .shadow(2.dp, shape = RoundedCornerShape(24.dp), spotColor = Color(0x14000000))
                    .clip(RoundedCornerShape(24.dp))
                    .background(MaterialTheme.colorScheme.surface)
                    .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(24.dp))
                    .padding(20.dp)
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(14.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            // Avatar
                            Box(
                                modifier = Modifier
                                    .size(62.dp)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.primary),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = customerName.take(1).uppercase(),
                                    style = MaterialTheme.typography.titleLarge.copy(
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 24.sp
                                    ),
                                    color = MaterialTheme.colorScheme.onPrimary
                                )
                            }

                            Column {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text(
                                        text = customerName,
                                        style = MaterialTheme.typography.titleMedium.copy(
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 18.sp
                                        ),
                                        color = MaterialTheme.colorScheme.onSurface,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    StatusBadge(text = user?.role ?: "Customer")
                                }

                                if (customerMobile.isNotBlank()) {
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = "📱 $customerMobile",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }

                                if (customerEmail.isNotBlank()) {
                                    Text(
                                        text = "✉️ $customerEmail",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }
                        }

                        // Edit Profile Button
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                                .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(12.dp))
                                .clickable(onClick = onEditProfileClick)
                                .padding(horizontal = 10.dp, vertical = 6.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Edit",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.SemiBold
                                ),
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Location bar inside header
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(text = "📍", fontSize = 13.sp)
                            Text(
                                text = "Default delivery: Sheopur, MP 476337",
                                style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                        Text(
                            text = "Change",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            ),
                            modifier = Modifier.clickable(onClick = onAddressesClick)
                        )
                    }
                }
            }

            // Role Switcher Shortcuts (Web Parity)
            if (user?.isStoreOwner == true && onSwitchToSeller != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 4.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f))
                        .border(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.35f), RoundedCornerShape(16.dp))
                        .clickable(onClick = onSwitchToSeller)
                        .padding(14.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Text(text = "🏪", fontSize = 20.sp)
                            Column {
                                Text(
                                    text = "Merchant Console",
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.primary
                                )
                                Text(
                                    text = "Open Billing & POS, Orders, Products",
                                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        Text(
                            text = "Switch →",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }

            if (user?.isPlatformAdmin == true && onSwitchToAdmin != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 4.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xFF2563EB).copy(alpha = 0.12f))
                        .border(1.dp, Color(0xFF2563EB).copy(alpha = 0.35f), RoundedCornerShape(16.dp))
                        .clickable(onClick = onSwitchToAdmin)
                        .padding(14.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Text(text = "🛡️", fontSize = 20.sp)
                            Column {
                                Text(
                                    text = "Admin Workspace",
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                    color = Color(0xFF2563EB)
                                )
                                Text(
                                    text = "Manage stores, users, promotions & settings",
                                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        Text(
                            text = "Switch →",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = Color(0xFF2563EB)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // ==========================================
            // 2. ACCOUNT SUMMARY METRICS
            // ==========================================
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                Text(
                    text = "ACCOUNT SUMMARY",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    ),
                    color = SecondaryText
                )

                Spacer(modifier = Modifier.height(10.dp))

                val summary = when (val state = uiState.summaryState) {
                    is UiState.Success -> state.data
                    else -> CustomerAccountSummary()
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        count = "${summary.ordersCount}",
                        label = "Orders",
                        icon = "🧾",
                        onClick = onOrdersClick,
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        count = "${summary.wishlistCount}",
                        label = "Wishlist",
                        icon = "🤍",
                        onClick = onWishlistClick,
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        count = "${summary.cartCount}",
                        label = "Cart",
                        icon = "🛒",
                        onClick = onCartClick,
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        count = "${summary.savedAddressesCount}",
                        label = "Addresses",
                        icon = "📍",
                        onClick = onAddressesClick,
                        modifier = Modifier.weight(1f)
                    )
                }

                if (summary.activeOrdersCount > 0) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color(0xFFFEF3C7))
                            .border(1.dp, Color(0xFFF59E0B), RoundedCornerShape(14.dp))
                            .clickable(onClick = onOrdersClick)
                            .padding(horizontal = 14.dp, vertical = 10.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(text = "🚚", fontSize = 16.sp)
                            Text(
                                text = "${summary.activeOrdersCount} active order(s) in progress. Tap to track.",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 12.sp
                                ),
                                color = Color(0xFF92400E)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ==========================================
            // 3. QUICK ACTION GRID
            // ==========================================
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                Text(
                    text = "QUICK ACTIONS",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    ),
                    color = SecondaryText
                )

                Spacer(modifier = Modifier.height(10.dp))

                val actions = listOf(
                    DashboardAction("orders", "My Orders", "Track current & past purchases", "🧾", null, "orders"),
                    DashboardAction("wishlist", "Wishlist", "Saved items for later", "🤍", null, "wishlist"),
                    DashboardAction("cart", "Shopping Cart", "Review items before checkout", "🛒", null, "cart"),
                    DashboardAction("addresses", "Saved Addresses", "Manage delivery locations", "📍", null, "addresses"),
                    DashboardAction("coupons", "Coupons & Offers", "Redeem special SheoMart discounts", "🏷️", null, "coupons"),
                    DashboardAction("notifications", "Notifications", "Order updates & seasonal deals", "🔔", null, "notifications"),
                    DashboardAction("support", "Help & Support", "Customer care & contact", "💬", null, "support"),
                    DashboardAction("about", "About SheoMart", "Our mission in Sheopur", "ℹ️", null, "about")
                )

                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    actions.chunked(2).forEach { rowActions ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            rowActions.forEach { action ->
                                ActionGridCard(
                                    action = action,
                                    onClick = {
                                        when (action.id) {
                                            "orders" -> onOrdersClick()
                                            "wishlist" -> onWishlistClick()
                                            "cart" -> onCartClick()
                                            "addresses" -> onAddressesClick()
                                            "coupons" -> onCouponsClick()
                                            "notifications" -> onNotificationsClick()
                                            "support" -> onSupportClick()
                                            "about" -> onAboutClick()
                                        }
                                    },
                                    modifier = Modifier.weight(1f)
                                )
                            }
                            if (rowActions.size == 1) {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ==========================================
            // 4. ACTIVE OFFERS & COUPONS SECTION
            // ==========================================
            Column(modifier = Modifier.fillMaxWidth()) {
                SectionHeader(
                    eyebrow = "Exclusive savings",
                    title = "Live Coupons",
                    subtitle = "Tap copy to apply at checkout",
                    actionText = "View all",
                    onActionClick = onCouponsClick,
                    modifier = Modifier.padding(horizontal = 20.dp)
                )

                Spacer(modifier = Modifier.height(10.dp))

                when (val couponsState = uiState.couponsState) {
                    is UiState.Loading -> {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(2) {
                                ShimmerPlaceholder(
                                    modifier = Modifier.size(width = 240.dp, height = 110.dp),
                                    shape = RoundedCornerShape(18.dp)
                                )
                            }
                        }
                    }
                    is UiState.Success -> {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(couponsState.data, key = { it.couponId }) { coupon ->
                                CouponCard(
                                    coupon = coupon,
                                    onCopy = {
                                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
                                        clipboard?.setPrimaryClip(ClipData.newPlainText("Coupon", coupon.code))
                                        viewModel.onCouponCopied(coupon.code)
                                    }
                                )
                            }
                        }
                    }
                    is UiState.Error -> {
                        Box(modifier = Modifier.padding(horizontal = 20.dp)) {
                            SectionErrorView(
                                message = couponsState.message,
                                onRetry = { viewModel.loadCoupons() }
                            )
                        }
                    }
                    is UiState.Empty -> {
                        Box(modifier = Modifier.padding(horizontal = 20.dp)) {
                            SectionEmptyView(
                                title = "No active coupons right now",
                                description = "New coupons are released weekly"
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ==========================================
            // 5. RECENTLY VIEWED / RECOMMENDED PROMPT
            // ==========================================
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0xFFECFDF5))
                    .border(1.2.dp, Color(0xFFA7F3D0), RoundedCornerShape(20.dp))
                    .clickable(onClick = onExploreClick)
                    .padding(18.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "🛒 Shop Local in Sheopur",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF065F46)
                            )
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Browse nearby verified stores and farm-fresh produce.",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = Color(0xFF047857)
                            )
                        )
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(PrimaryGreen)
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = "Explore →",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ==========================================
            // 6. APPEARANCE & THEME
            // ==========================================
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                Text(
                    text = "APPEARANCE & THEME",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    ),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(10.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(1.dp, shape = RoundedCornerShape(20.dp), spotColor = Color(0x10000000))
                        .clip(RoundedCornerShape(20.dp))
                        .background(MaterialTheme.colorScheme.surface)
                        .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(20.dp))
                        .padding(16.dp)
                ) {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Text(
                                    text = when (themeManager.themeMode) {
                                        ThemeMode.DARK -> "🌙"
                                        ThemeMode.LIGHT -> "☀️"
                                        ThemeMode.SYSTEM -> "📱"
                                    },
                                    fontSize = 20.sp
                                )
                                Column {
                                    Text(
                                        text = "Theme Mode",
                                        style = MaterialTheme.typography.titleSmall.copy(
                                            fontWeight = FontWeight.Bold
                                        ),
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = when (themeManager.themeMode) {
                                            ThemeMode.DARK -> "Dark Theme enabled"
                                            ThemeMode.LIGHT -> "Light Theme enabled"
                                            ThemeMode.SYSTEM -> "Following system settings"
                                        },
                                        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            ThemeSelectionPill(
                                title = "System",
                                icon = "📱",
                                isSelected = themeManager.themeMode == ThemeMode.SYSTEM,
                                onClick = { themeManager.setTheme(ThemeMode.SYSTEM) },
                                modifier = Modifier.weight(1f)
                            )
                            ThemeSelectionPill(
                                title = "Light",
                                icon = "☀️",
                                isSelected = themeManager.themeMode == ThemeMode.LIGHT,
                                onClick = { themeManager.setTheme(ThemeMode.LIGHT) },
                                modifier = Modifier.weight(1f)
                            )
                            ThemeSelectionPill(
                                title = "Dark",
                                icon = "🌙",
                                isSelected = themeManager.themeMode == ThemeMode.DARK,
                                onClick = { themeManager.setTheme(ThemeMode.DARK) },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ==========================================
            // 7. LOGOUT SECTION
            // ==========================================
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                OutlinedButton(
                    onClick = onLogout,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = MaterialTheme.colorScheme.error
                    ),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.error.copy(alpha = 0.5f))
                    )
                ) {
                    Text(
                        text = "Sign Out",
                        style = MaterialTheme.typography.labelLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.error
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(36.dp))
        }
    }
}

@Composable
private fun ThemeSelectionPill(
    title: String,
    icon: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant)
            .border(
                width = if (isSelected) 1.5.dp else 1.dp,
                color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant,
                shape = RoundedCornerShape(12.dp)
            )
            .clickable(onClick = onClick)
            .padding(vertical = 10.dp, horizontal = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(text = icon, fontSize = 13.sp)
            Text(
                text = title,
                style = MaterialTheme.typography.labelMedium.copy(
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                ),
                color = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun MetricCard(
    count: String,
    label: String,
    icon: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .shadow(1.dp, shape = RoundedCornerShape(16.dp), spotColor = Color(0x10000000))
            .clip(RoundedCornerShape(16.dp))
            .background(MaterialTheme.colorScheme.surface)
            .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(16.dp))
            .clickable(onClick = onClick)
            .padding(vertical = 12.dp, horizontal = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text = icon, fontSize = 18.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = count,
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                ),
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun ActionGridCard(
    action: DashboardAction,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .shadow(1.dp, shape = RoundedCornerShape(18.dp), spotColor = Color(0x10000000))
            .clip(RoundedCornerShape(18.dp))
            .background(MaterialTheme.colorScheme.surface)
            .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(18.dp))
            .clickable(onClick = onClick)
            .padding(14.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = action.icon, fontSize = 18.sp)
                }

                Text(
                    text = "→",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontWeight = FontWeight.Bold
                    ),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = action.title,
                style = MaterialTheme.typography.titleSmall.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                ),
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(2.dp))

            Text(
                text = action.subtitle,
                style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
private fun CouponCard(
    coupon: Coupon,
    onCopy: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .width(260.dp)
            .shadow(2.dp, shape = RoundedCornerShape(18.dp), spotColor = Color(0x1416A34A))
            .clip(RoundedCornerShape(18.dp))
            .background(MaterialTheme.colorScheme.surface)
            .border(1.2.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.4f), RoundedCornerShape(18.dp))
            .padding(14.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = coupon.title,
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold
                        ),
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = coupon.displayDiscount,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    )
                }

                if (coupon.minimumCartValue > 0) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "Min ₹${coupon.minimumCartValue.toInt()}",
                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Code & Copy button
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f))
                    .border(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.3f), RoundedCornerShape(10.dp))
                    .padding(horizontal = 10.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = coupon.code,
                    style = MaterialTheme.typography.labelMedium.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp,
                        color = MaterialTheme.colorScheme.primary
                    )
                )

                Text(
                    text = "Copy Code",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    ),
                    modifier = Modifier.clickable(onClick = onCopy)
                )
            }
        }
    }
}
