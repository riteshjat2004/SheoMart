package com.sheomart.mobile.ui.components

import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.ui.theme.PrimaryGreen
import com.sheomart.mobile.ui.theme.SecondaryText

enum class CustomerNavTab(
    val route: String,
    val title: String,
    val icon: String
) {
    HOME("home", "Home", "🏠"),
    EXPLORE("explore", "Explore", "🔍"),
    CART("cart", "Cart", "🛒"),
    WISHLIST("wishlist", "Wishlist", "🤍"),
    PROFILE("profile", "Profile", "👤")
}

@Composable
fun SheoBottomNavigation(
    currentTab: CustomerNavTab,
    onTabSelected: (CustomerNavTab) -> Unit,
    wishlistCount: Int = 0,
    cartCount: Int = 0
) {
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 8.dp
    ) {
        CustomerNavTab.values().forEach { tab ->
            val isSelected = tab == currentTab
            val badgeCount = when (tab) {
                CustomerNavTab.WISHLIST -> wishlistCount
                CustomerNavTab.CART -> cartCount
                else -> 0
            }

            NavigationBarItem(
                selected = isSelected,
                onClick = { onTabSelected(tab) },
                icon = {
                    BadgedBox(
                        badge = {
                            if (badgeCount > 0) {
                                Badge(
                                    containerColor = MaterialTheme.colorScheme.primary,
                                    contentColor = MaterialTheme.colorScheme.onPrimary
                                ) {
                                    Text(
                                        text = if (badgeCount > 99) "99+" else badgeCount.toString(),
                                        fontSize = 10.sp
                                    )
                                }
                            }
                        }
                    ) {
                        Text(
                            text = if (tab == CustomerNavTab.WISHLIST && (isSelected || wishlistCount > 0)) "❤️" else tab.icon,
                            fontSize = 18.sp
                        )
                    }
                },
                label = {
                    Text(
                        text = tab.title,
                        style = MaterialTheme.typography.labelSmall
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = MaterialTheme.colorScheme.primary,
                    selectedTextColor = MaterialTheme.colorScheme.primary,
                    unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                    unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                    indicatorColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)
                )
            )
        }
    }
}

